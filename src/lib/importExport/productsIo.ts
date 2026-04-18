import type { Product } from '../types'
import { parsePriceInput } from '../../utils/parseCurrency'
import {
  validatePriceRp,
  validateProductName,
} from '../../utils/validation'
import {
  IMPORT_MAX_ROWS,
  PRODUCTS_JSON_FORMAT,
} from './constants'
import {
  detectDelimiter,
  normalizeHeaderCell,
  splitCsvLine,
  stripBom,
} from './csv'
import { triggerDownload } from './download'

export type ProductImportRow = { name: string; price: number }

export type ParseFail = { ok: false; errors: string[] }
export type ParseOk<T> = { ok: true; rows: T[] }
export type ParseResult<T> = ParseFail | ParseOk<T>

function isParseFail<T>(r: ParseResult<T>): r is ParseFail {
  return r.ok === false
}

function mergeParseFailureErrors<T>(
  a: ParseResult<T>,
  b: ParseResult<T>,
): string[] {
  const out: string[] = []
  if (isParseFail(a)) out.push(...a.errors)
  if (isParseFail(b)) out.push(...b.errors)
  return out
}

function summarizeErrors(errors: string[], maxLines = 12): string {
  if (errors.length <= maxLines) return errors.join('\n')
  const head = errors.slice(0, maxLines).join('\n')
  return `${head}\n… dan ${errors.length - maxLines} pesan lainnya.`
}

export function formatImportErrorToast(errors: string[]): string {
  const body = summarizeErrors(errors, 10)
  return body.trim()
    ? `Impor dibatalkan — tidak ada data yang ditambahkan.\n${body}`
    : 'Impor dibatalkan — tidak ada data yang ditambahkan.'
}

function extractJsonRows(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (Array.isArray(o.rows)) return o.rows
    if (Array.isArray(o.items)) return o.items
    if (Array.isArray(o.data)) return o.data
    if (Array.isArray(o.products)) return o.products
  }
  throw new Error('STR_JSON_PRODUCTS')
}

function pickProductName(cell: Record<string, unknown>): string | undefined {
  const v =
    cell.name ??
    cell.nama ??
    cell.Nama ??
    cell.productName
  if (typeof v === 'string') return v
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return undefined
}

function pickProductPrice(cell: Record<string, unknown>): string | undefined {
  const v = cell.price ?? cell.harga ?? cell.Harga
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  if (typeof v === 'string') return v
  return undefined
}

export function parseProductsImport(
  text: string,
  filename: string,
): ParseResult<ProductImportRow> {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.json')) return parseProductsJson(text)
  if (
    lower.endsWith('.csv') ||
    lower.endsWith('.txt') ||
    lower.endsWith('.tsv')
  ) {
    return parseProductsCsv(text)
  }

  const jsonFirst = parseProductsJson(text)
  if (jsonFirst.ok) return jsonFirst

  const csvSecond = parseProductsCsv(text)
  if (csvSecond.ok) return csvSecond

  const merged = mergeParseFailureErrors(jsonFirst, csvSecond)
  const uniq = merged.filter((e, i, a) => a.indexOf(e) === i)
  return {
    ok: false,
    errors:
      uniq.length > 0
        ? uniq.slice(0, 14)
        : ['Format berkas tidak dikenali. Gunakan CSV atau JSON.'],
  }
}

export function parseProductsJson(text: string): ParseResult<ProductImportRow> {
  let parsed: unknown
  try {
    parsed = JSON.parse(text) as unknown
  } catch {
    return { ok: false, errors: ['JSON tidak valid (syntax error).'] }
  }

  let rawRows: unknown[]
  try {
    rawRows = extractJsonRows(parsed)
  } catch {
    return { ok: false, errors: ['JSON tidak berisi daftar barang.'] }
  }

  return validateProductRows(rawRows)
}

export function validateProductRows(
  rawRows: unknown[],
): ParseResult<ProductImportRow> {
  if (rawRows.length === 0) {
    return { ok: false, errors: ['Tidak ada baris data untuk diimpor.'] }
  }
  if (rawRows.length > IMPORT_MAX_ROWS) {
    return {
      ok: false,
      errors: [
        `Terlalu banyak baris (maksimal ${IMPORT_MAX_ROWS}).`,
      ],
    }
  }

  const errors: string[] = []
  const rows: ProductImportRow[] = []

  rawRows.forEach((raw, i) => {
    const lineNo = i + 1
    if (!raw || typeof raw !== 'object') {
      errors.push(`Baris ${lineNo}: baris harus berupa objek.`)
      return
    }
    const cell = raw as Record<string, unknown>
    const nameRaw = pickProductName(cell)
    const priceRaw = pickProductPrice(cell)

    const nameErr = validateProductName(nameRaw ?? '')
    const priceErr = validatePriceRp(priceRaw ?? '')

    if (nameErr) errors.push(`Baris ${lineNo}: ${nameErr}`)
    if (priceErr) errors.push(`Baris ${lineNo}: ${priceErr}`)
    if (nameErr || priceErr) return

    const price = parsePriceInput(String(priceRaw).trim())
    rows.push({
      name: String(nameRaw).trim(),
      price,
    })
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, rows }
}

const CSV_NAME_KEYS = new Set(['nama', 'name', 'barang', 'produk'])
const CSV_PRICE_KEYS = new Set(['harga', 'price'])

export function parseProductsCsv(text: string): ParseResult<ProductImportRow> {
  const t = stripBom(text).trim()
  if (!t) return { ok: false, errors: ['Berkas CSV kosong.'] }

  const lines = t.split(/\r?\n/).filter((l) => l.trim() !== '')
  if (lines.length < 2) {
    return {
      ok: false,
      errors: ['CSV perlu header dan minimal satu baris data.'],
    }
  }

  const delim = detectDelimiter(lines[0]!)
  const header = splitCsvLine(lines[0]!, delim).map(normalizeHeaderCell)

  let ni = -1
  let pi = -1
  header.forEach((h, idx) => {
    if (CSV_NAME_KEYS.has(h)) ni = idx
    if (CSV_PRICE_KEYS.has(h)) pi = idx
  })

  if (ni < 0 || pi < 0) {
    return {
      ok: false,
      errors: [
        'Header CSV harus memuat kolom nama (nama/name) dan harga (harga/price).',
      ],
    }
  }

  const rawRows: unknown[] = []
  for (let r = 1; r < lines.length; r++) {
    const cells = splitCsvLine(lines[r]!, delim)
    const name = cells[ni] ?? ''
    const price = cells[pi] ?? ''
    rawRows.push({ nama: name, harga: price })
  }

  return validateProductRows(rawRows)
}

export function exportProductsJson(products: Product[]): string {
  const exportedAt = new Date().toISOString()
  const rows = products.map((p) => ({
    nama: p.name,
    harga: p.price,
  }))
  return `${JSON.stringify(
    {
      format: PRODUCTS_JSON_FORMAT,
      version: 1,
      exportedAt,
      rows,
    },
    null,
    2,
  )}\n`
}

export function exportProductsCsv(products: Product[]): string {
  const header = 'nama,harga'
  const body = products
    .map((p) => {
      const name = csvEscape(p.name)
      const price = String(p.price)
      return `${name},${price}`
    })
    .join('\r\n')
  return `\ufeff${header}\r\n${body}\r\n`
}

function csvEscape(s: string): string {
  if (/[",\n\r;]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function downloadProductsExport(
  products: Product[],
  kind: 'json' | 'csv',
) {
  const stamp = new Date().toISOString().slice(0, 10)
  if (kind === 'json') {
    triggerDownload(
      `barang-${stamp}.json`,
      exportProductsJson(products),
      'application/json',
    )
  } else {
    triggerDownload(
      `barang-${stamp}.csv`,
      exportProductsCsv(products),
      'text/csv',
    )
  }
}
