import { useMemo, useState } from 'react'
import { TABLE_PAGE_SIZE } from '../lib/pagination'

/**
 * Mengiris array untuk halaman saat ini. Gunakan **key** pada komponen pembungkus
 * (mis. `key={tableSearch}`) untuk mengembalikan ke halaman 1 saat filter berubah.
 */
export function usePagedSlice<T>(items: readonly T[]) {
  const [page, setPage] = useState(1)
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / TABLE_PAGE_SIZE))
  const safePage = Math.min(Math.max(1, page), totalPages)

  const slice = useMemo(() => {
    const start = (safePage - 1) * TABLE_PAGE_SIZE
    return items.slice(start, start + TABLE_PAGE_SIZE)
  }, [items, safePage])

  return {
    page: safePage,
    setPage,
    totalPages,
    total,
    slice,
    pageSize: TABLE_PAGE_SIZE,
  }
}
