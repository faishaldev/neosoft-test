import type { Product } from './types'

export function mapProductsById(products: Product[]): Map<string, Product> {
  const m = new Map<string, Product>()
  for (const p of products) m.set(p.id, p)
  return m
}
