import type { Transaction } from './types'

export type ProductSaleAgg = {
  id: string
  name: string
  qty: number
  revenue: number
}

export function txLineTotal(t: Transaction): number {
  return t.lines.reduce((s, l) => s + l.price * l.qty, 0)
}

export function aggregateByProduct(
  transactions: Transaction[],
): ProductSaleAgg[] {
  const m = new Map<string, Omit<ProductSaleAgg, 'id'>>()
  for (const t of transactions) {
    for (const line of t.lines) {
      const cur =
        m.get(line.productId) ?? {
          name: line.productName,
          qty: 0,
          revenue: 0,
        }
      cur.qty += line.qty
      cur.revenue += line.price * line.qty
      m.set(line.productId, cur)
    }
  }
  return Array.from(m.entries()).map(([id, v]) => ({ id, ...v }))
}

export function omzetTotal(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + txLineTotal(t), 0)
}
