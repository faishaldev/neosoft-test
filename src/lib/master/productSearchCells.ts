import type { Product } from '../types'
import { formatIdr } from '../../utils/format'

export function productSearchCells(p: Product): string[] {
  return [
    String(p.serialNo),
    p.id,
    p.name,
    String(p.price),
    formatIdr(p.price),
    p.archived ? 'diarsipkan arsip' : 'aktif',
  ]
}
