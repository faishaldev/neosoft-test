import { useCallback, useState } from 'react'

export type SortDir = 'asc' | 'desc'

export type TableSortState<K extends string> =
  | { key: K; dir: SortDir }
  | null

/**
 * Klik kolom: urut naik → urut turun (jika kolom sama); kolom lain mulai
 * dari naik.
 */
export function useTableSort<K extends string>(
  initial: TableSortState<K> = null,
) {
  const [sort, setSort] = useState<TableSortState<K>>(initial)

  const toggle = useCallback((key: K) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' }
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    })
  }, [])

  return { sort, toggle, setSort }
}
