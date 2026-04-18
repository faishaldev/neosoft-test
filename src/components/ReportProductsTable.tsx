import type { ProductSaleAgg } from '../lib/salesMetrics'
import { formatIdr } from '../utils/format'
import { EmptyHint } from './EmptyHint'

type Props = { rows: ProductSaleAgg[] }

export function ReportProductsTable({ rows }: Props) {
  return (
    <>
      <h3 className="subhead">Agregasi per barang</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Kode (referensi)</th>
              <th scope="col">Nama barang</th>
              <th scope="col" className="num">
                Qty terjual
              </th>
              <th scope="col" className="num">
                Subtotal
              </th>
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
              rows.map((r) => (
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
