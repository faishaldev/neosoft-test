import type { Patient } from '../types'
import {
  normalizePhoneId,
  validatePatientName,
  validatePhoneId,
} from '../../utils/validation'
import { IMPORT_MAX_ROWS, PATIENTS_JSON_FORMAT } from './constants'
import {
  detectDelimiter,
  normalizeHeaderCell,
  splitCsvLine,
  stripBom,
} from './csv'
import { triggerDownload } from './download'

export type PatientImportRow = { name: string; phone: string }

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

export function formatPatientImportErrorToast(errors: string[]): string {
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
    if (Array.isArray(o.patients)) return o.patients
  }
  throw new Error('STR_JSON_PATIENTS')
}

function pickPatientName(cell: Record<string, unknown>): string | undefined {
  const v =
    cell.name ??
    cell.nama ??
    cell.Nama ??
    cell.patientName
  if (typeof v === 'string') return v
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return undefined
}

function pickPatientPhone(cell: Record<string, unknown>): string | undefined {
  const v =
    cell.phone ??
    cell.telepon ??
    cell.Telepon ??
    cell.telp
  if (v == null) return ''
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  if (typeof v === 'string') return v
  return undefined
}

export function parsePatientsImport(
  text: string,
  filename: string,
): ParseResult<PatientImportRow> {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.json')) return parsePatientsJson(text)
  if (
    lower.endsWith('.csv') ||
    lower.endsWith('.txt') ||
    lower.endsWith('.tsv')
  ) {
    return parsePatientsCsv(text)
  }

  const jsonFirst = parsePatientsJson(text)
  if (jsonFirst.ok) return jsonFirst

  const csvSecond = parsePatientsCsv(text)
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

export function parsePatientsJson(text: string): ParseResult<PatientImportRow> {
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
    return { ok: false, errors: ['JSON tidak berisi daftar pasien.'] }
  }

  return validatePatientRows(rawRows)
}

export function validatePatientRows(
  rawRows: unknown[],
): ParseResult<PatientImportRow> {
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
  const rows: PatientImportRow[] = []

  rawRows.forEach((raw, i) => {
    const lineNo = i + 1
    if (!raw || typeof raw !== 'object') {
      errors.push(`Baris ${lineNo}: baris harus berupa objek.`)
      return
    }
    const cell = raw as Record<string, unknown>
    const nameRaw = pickPatientName(cell)
    const phoneRaw = pickPatientPhone(cell)

    const nameErr = validatePatientName(nameRaw ?? '')
    const phoneErr = validatePhoneId(phoneRaw ?? '')

    if (nameErr) errors.push(`Baris ${lineNo}: ${nameErr}`)
    if (phoneErr) errors.push(`Baris ${lineNo}: ${phoneErr}`)
    if (nameErr || phoneErr) return

    rows.push({
      name: String(nameRaw).trim(),
      phone: normalizePhoneId(String(phoneRaw ?? '')),
    })
  })

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, rows }
}

const CSV_NAME_KEYS = new Set(['nama', 'name', 'pasien'])
const CSV_PHONE_KEYS = new Set(['telepon', 'phone', 'tel', 'hp', 'handphone'])

export function parsePatientsCsv(text: string): ParseResult<PatientImportRow> {
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
  let ti = -1
  header.forEach((h, idx) => {
    if (CSV_NAME_KEYS.has(h)) ni = idx
    if (CSV_PHONE_KEYS.has(h)) ti = idx
  })

  if (ni < 0 || ti < 0) {
    return {
      ok: false,
      errors: [
        'Header CSV harus memuat kolom nama (nama/name) dan telepon (telepon/phone).',
      ],
    }
  }

  const rawRows: unknown[] = []
  for (let r = 1; r < lines.length; r++) {
    const cells = splitCsvLine(lines[r]!, delim)
    const name = cells[ni] ?? ''
    const phone = cells[ti] ?? ''
    rawRows.push({ nama: name, telepon: phone })
  }

  return validatePatientRows(rawRows)
}

export function exportPatientsJson(patients: Patient[]): string {
  const exportedAt = new Date().toISOString()
  const rows = patients.map((p) => ({
    nama: p.name,
    telepon: p.phone || '',
    diarsipkan: Boolean(p.archived),
  }))
  return `${JSON.stringify(
    {
      format: PATIENTS_JSON_FORMAT,
      version: 1,
      exportedAt,
      rows,
    },
    null,
    2,
  )}\n`
}

export function exportPatientsCsv(patients: Patient[]): string {
  const header = 'nama,telepon'
  const body = patients
    .map((p) => {
      const name = csvEscape(p.name)
      const phone = csvEscape(p.phone || '')
      return `${name},${phone}`
    })
    .join('\r\n')
  return `\ufeff${header}\r\n${body}\r\n`
}

function csvEscape(s: string): string {
  if (/[",\n\r;]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function downloadPatientsExport(
  patients: Patient[],
  kind: 'json' | 'csv',
) {
  const stamp = new Date().toISOString().slice(0, 10)
  if (kind === 'json') {
    triggerDownload(
      `pasien-${stamp}.json`,
      exportPatientsJson(patients),
      'application/json',
    )
  } else {
    triggerDownload(
      `pasien-${stamp}.csv`,
      exportPatientsCsv(patients),
      'text/csv',
    )
  }
}
