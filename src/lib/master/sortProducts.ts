import type { Product } from '../types'
import type { ProductSortKey } from './sortKeys'

export type ActiveSort<S extends string> =
  | { key: S; dir: 'asc' | 'desc' }
  | null

export function sortProducts(
  items: Product[],
  sort: ActiveSort<ProductSortKey>,
): Product[] {
  if (!sort) return items
  const m = [...items]
  m.sort((a, b) => {
    let c = 0
    if (sort.key === 'no') c = a.serialNo - b.serialNo
    else if (sort.key === 'id') c = a.id.localeCompare(b.id, 'id-ID')
    else c = a.price - b.price
    return sort.dir === 'asc' ? c : -c
  })
  return m
}
