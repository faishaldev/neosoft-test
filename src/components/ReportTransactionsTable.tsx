import { txLineTotal } from '../lib/salesMetrics'
import type { Transaction } from '../lib/types'
import { formatDateId, formatIdr } from '../utils/format'
import { TableEmpty } from './TableEmpty'

type Props = { transactions: Transaction[] }

export function ReportTransactionsTable({ transactions }: Props) {
  return (
    <>
      <h3 className="subhead">Detail per transaksi</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>No Invoice</th>
              <th>Tanggal</th>
              <th>ID pasien</th>
              <th>Nama pasien</th>
              <th className="num">Total</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <TableEmpty cols={5}>Belum ada transaksi.</TableEmpty>
            ) : (
              transactions.map((t) => (
                <tr key={t.invoiceNo}>
                  <td className="mono">{t.invoiceNo}</td>
                  <td>{formatDateId(t.dateISO)}</td>
                  <td className="mono">{t.patientId}</td>
                  <td>{t.patientName}</td>
                  <td className="num">{formatIdr(txLineTotal(t))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
