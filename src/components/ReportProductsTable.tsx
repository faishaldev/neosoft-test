import type { ProductSaleAgg } from '../lib/salesMetrics'
import { formatIdr } from '../utils/format'
import { TableEmpty } from './TableEmpty'

type Props = { rows: ProductSaleAgg[] }

export function ReportProductsTable({ rows }: Props) {
  return (
    <>
      <h3 className="subhead">Agregasi per barang</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kode (referensi)</th>
              <th>Nama barang</th>
              <th className="num">Qty terjual</th>
              <th className="num">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <TableEmpty cols={4}>—</TableEmpty>
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
