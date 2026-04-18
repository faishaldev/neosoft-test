type Props = {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function TablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: Props) {
  if (totalItems === 0) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  return (
    <nav
      className="table-pagination no-print"
      aria-label="Paginasi tabel"
    >
      <p className="table-pagination__meta">
        Menampilkan <strong>{from}</strong>–<strong>{to}</strong> dari{' '}
        <strong>{totalItems}</strong>
      </p>
      <div className="table-pagination__controls">
        <button
          type="button"
          className="btn table-pagination__btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Sebelumnya
        </button>
        <span className="table-pagination__status">
          Halaman {page} / {totalPages}
        </span>
        <button
          type="button"
          className="btn table-pagination__btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Berikutnya
        </button>
      </div>
    </nav>
  )
}
