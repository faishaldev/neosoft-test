import { useMemo, useState } from 'react'
import type { ProductSaleAgg } from '../lib/salesMetrics'
import { usePagedSlice } from '../hooks/usePagedSlice'
import { formatIdr } from '../utils/format'
import { rowMatchesSearch } from '../utils/tableSearch'
import { EmptyHint } from './EmptyHint'
import { TablePagination } from './TablePagination'

type SortKey = 'id' | 'name' | 'qty' | 'revenue'
type SortDir = 'asc' | 'desc'
type SortOption =
  | 'id:asc'
  | 'id:desc'
  | 'name:asc'
  | 'name:desc'
  | 'qty:asc'
  | 'qty:desc'
  | 'revenue:asc'
  | 'revenue:desc'

type Props = { rows: ProductSaleAgg[] }

type ReportProductsPagedProps = {
  rows: ProductSaleAgg[]
  filteredRows: ProductSaleAgg[]
  sorted: ProductSaleAgg[]
}

function ReportProductsPaged({
  rows,
  filteredRows,
  sorted,
}: ReportProductsPagedProps) {
  const pageData = usePagedSlice(sorted)

  return (
    <>
      <div className="report-cards">
        {rows.length === 0 ? (
          <EmptyHint
            title="Belum ada agregasi"
            hint="Data terisi setelah ada transaksi dengan barang."
          />
        ) : filteredRows.length === 0 ? (
          <EmptyHint
            title="Tidak ada baris yang cocok"
            hint="Sesuaikan kata kunci atau kosongkan kolom Cari."
          />
        ) : (
          pageData.slice.map((r) => (
            <article key={r.id} className="report-card">
              <p className="report-card__title mono">{r.id}</p>
              <dl className="report-card__meta">
                <div>
                  <dt>Nama barang</dt>
                  <dd>{r.name}</dd>
                </div>
                <div>
                  <dt>Qty terjual</dt>
                  <dd>{r.qty}</dd>
                </div>
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatIdr(r.revenue)}</dd>
                </div>
              </dl>
            </article>
          ))
        )}
      </div>
      <TablePagination
        page={pageData.page}
        totalPages={pageData.totalPages}
        totalItems={pageData.total}
        pageSize={pageData.pageSize}
        onPageChange={pageData.setPage}
      />
    </>
  )
}

export function ReportProductsTable({ rows }: Props) {
  const [tableSearch, setTableSearch] = useState('')
  const [sortOption, setSortOption] =
    useState<SortOption>('revenue:desc')

  const filteredRows = useMemo(() => {
    if (!tableSearch.trim()) return rows
    return rows.filter((r) =>
      rowMatchesSearch(
        [
          r.id,
          r.name,
          String(r.qty),
          String(r.revenue),
          formatIdr(r.revenue),
        ],
        tableSearch,
      ),
    )
  }, [rows, tableSearch])

  const sorted = useMemo(() => {
    const [sortKey, sortDir] = sortOption.split(':') as [
      SortKey,
      SortDir,
    ]
    const m = [...filteredRows]
    m.sort((a, b) => {
      let c = 0
      if (sortKey === 'id') {
        c = a.id.localeCompare(b.id, 'id-ID')
      } else if (sortKey === 'name') {
        c = a.name.localeCompare(b.name, 'id-ID')
      } else if (sortKey === 'qty') {
        c = a.qty - b.qty
      } else {
        c = a.revenue - b.revenue
      }
      return sortDir === 'asc' ? c : -c
    })
    return m
  }, [filteredRows, sortOption])

  return (
    <>
      <h3 className="subhead">Agregasi per barang</h3>
      <div className="table-block">
        <div className="table-toolbar report-toolbar no-print">
          <div className="table-toolbar__search">
            <input
              id="report-products-search"
              type="search"
              autoComplete="off"
              spellCheck={false}
              value={tableSearch}
              onChange={(ev) => setTableSearch(ev.target.value)}
              placeholder="Cari — Kode, nama, qty, atau subtotal…"
              aria-label="Cari agregasi barang"
            />
          </div>
          <label className="report-toolbar__sort">
            <span className="sr-only">Urutkan agregasi barang</span>
            <select
              value={sortOption}
              onChange={(ev) =>
                setSortOption(ev.target.value as SortOption)
              }
              aria-label="Urutkan agregasi barang"
            >
              <option value="revenue:desc">Urut: Subtotal terbesar</option>
              <option value="revenue:asc">Urut: Subtotal terkecil</option>
              <option value="qty:desc">Urut: Qty terbesar</option>
              <option value="qty:asc">Urut: Qty terkecil</option>
              <option value="name:asc">Urut: Nama A-Z</option>
              <option value="name:desc">Urut: Nama Z-A</option>
              <option value="id:asc">Urut: Kode A-Z</option>
              <option value="id:desc">Urut: Kode Z-A</option>
            </select>
          </label>
        </div>
        <ReportProductsPaged
          key={tableSearch}
          rows={rows}
          filteredRows={filteredRows}
          sorted={sorted}
        />
      </div>
    </>
  )
}
