import type { DraftLine, Product } from './types'

export type ResolvedLine = { product: Product; qty: number }

export type InvoicePreviewRow = {
  name: string
  price: number
  qty: number
  sub: number
}

export function invoicePreviewRows(
  draft: DraftLine[],
  byId: Map<string, Product>,
): InvoicePreviewRow[] {
  const rows: InvoicePreviewRow[] = []
  for (const row of draft) {
    const pr = row.productId ? byId.get(row.productId) : undefined
    const q = Math.max(0, Math.floor(Number(row.qty) || 0))
    if (!pr || q <= 0) continue
    rows.push({
      name: pr.name,
      price: pr.price,
      qty: q,
      sub: pr.price * q,
    })
  }
  return rows
}

export function invoicePreviewSummary(
  draft: DraftLine[],
  byId: Map<string, Product>,
): { rows: InvoicePreviewRow[]; total: number } {
  const rows = invoicePreviewRows(draft, byId)
  const total = rows.reduce((s, r) => s + r.sub, 0)
  return { rows, total }
}

export function resolveDraftLines(
  draft: DraftLine[],
  byId: Map<string, Product>,
): ResolvedLine[] {
  const out: ResolvedLine[] = []
  for (const row of draft) {
    if (!row.productId) continue
    const product = byId.get(row.productId)
    if (!product) continue
    const qty = Math.max(1, Math.floor(Number(row.qty) || 0))
    out.push({ product, qty })
  }
  return out
}
