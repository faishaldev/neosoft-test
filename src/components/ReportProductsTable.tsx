import { useMemo } from 'react'
import type { ProductSaleAgg } from '../lib/salesMetrics'
import { useTableSort } from '../hooks/useTableSort'
import { formatIdr } from '../utils/format'
import { EmptyHint } from './EmptyHint'
import { SortableTh } from './SortableTh'

type SortKey = 'id' | 'name' | 'qty' | 'revenue'

type Props = { rows: ProductSaleAgg[] }

export function ReportProductsTable({ rows }: Props) {
  const { sort, toggle } = useTableSort<SortKey>()

  const sorted = useMemo(() => {
    if (!sort) return rows
    const m = [...rows]
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
  }, [rows, sort])

  return (
    <>
      <h3 className="subhead">Agregasi per barang</h3>
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
            ) : (
              sorted.map((r) => (
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
    </>
  )
}
