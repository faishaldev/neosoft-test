import { useMemo, useState } from 'react'
import type { ProductSaleAgg } from '../lib/salesMetrics'
import { usePagedSlice } from '../hooks/usePagedSlice'
import {
  useTableSort,
  type TableSortState,
} from '../hooks/useTableSort'
import { formatIdr } from '../utils/format'
import { rowMatchesSearch } from '../utils/tableSearch'
import { EmptyHint } from './EmptyHint'
import { SortableTh } from './SortableTh'
import { TableSearchBar } from './TableSearchBar'
import { TablePagination } from './TablePagination'

type SortKey = 'id' | 'name' | 'qty' | 'revenue'

type Props = { rows: ProductSaleAgg[] }

type ReportProductsPagedProps = {
  rows: ProductSaleAgg[]
  filteredRows: ProductSaleAgg[]
  sorted: ProductSaleAgg[]
  sort: TableSortState<SortKey> | null
  toggle: (key: SortKey) => void
}

function ReportProductsPaged({
  rows,
  filteredRows,
  sorted,
  sort,
  toggle,
}: ReportProductsPagedProps) {
  const pageData = usePagedSlice(sorted)
  return (
    <>
      <div className="table-wrap">
        <table className="data-table">
          <caption className="sr-only">
            Ringkasan penjualan per barang; header kolom dapat diurutkan.
          </caption>
          <thead>
            <tr>
              <SortableTh
                label="Kode (referensi)"
                sortKey="id"
                sort={sort}
                onSort={() => toggle('id')}
              />
              <SortableTh
                label="Nama barang"
                sortKey="name"
                sort={sort}
                onSort={() => toggle('name')}
              />
              <SortableTh
                label="Qty terjual"
                sortKey="qty"
                sort={sort}
                onSort={() => toggle('qty')}
                alignEnd
              />
              <SortableTh
                label="Subtotal"
                sortKey="revenue"
                sort={sort}
                onSort={() => toggle('revenue')}
                alignEnd
              />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyHint
                    title="Belum ada agregasi"
                    hint="Data terisi setelah ada transaksi dengan barang."
                  />
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyHint
                    title="Tidak ada baris yang cocok"
                    hint="Sesuaikan kata kunci atau kosongkan kolom Cari."
                  />
                </td>
              </tr>
            ) : (
              pageData.slice.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.id}</td>
                  <td>{r.name}</td>
                  <td className="num">{r.qty}</td>
                  <td className="num">{formatIdr(r.revenue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
  const { sort, toggle } = useTableSort<SortKey>()

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
    if (!sort) return filteredRows
    const m = [...filteredRows]
    m.sort((a, b) => {
      let c = 0
      if (sort.key === 'id') {
        c = a.id.localeCompare(b.id, 'id-ID')
      } else if (sort.key === 'name') {
        c = a.name.localeCompare(b.name, 'id-ID')
      } else if (sort.key === 'qty') {
        c = a.qty - b.qty
      } else {
        c = a.revenue - b.revenue
      }
      return sort.dir === 'asc' ? c : -c
    })
    return m
  }, [filteredRows, sort])

  return (
    <>
      <h3 className="subhead">Agregasi per barang</h3>
      <div className="table-block">
        <TableSearchBar
          id="report-products-search"
          value={tableSearch}
          onChange={setTableSearch}
          placeholder="Cari — Kode, nama, qty, atau subtotal…"
        />
        <ReportProductsPaged
          key={tableSearch}
          rows={rows}
          filteredRows={filteredRows}
          sorted={sorted}
          sort={sort}
          toggle={toggle}
        />
      </div>
    </>
  )
}
