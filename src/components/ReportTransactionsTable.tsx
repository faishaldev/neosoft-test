import { txLineTotal } from '../lib/salesMetrics'
import type { Transaction } from '../lib/types'
import { formatDateId, formatIdr } from '../utils/format'
import { EmptyHint } from './EmptyHint'

type Props = { transactions: Transaction[] }

export function ReportTransactionsTable({ transactions }: Props) {
  return (
    <>
      <h3 className="subhead">Detail per transaksi</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">No Invoice</th>
              <th scope="col">Tanggal</th>
              <th scope="col">ID pasien</th>
              <th scope="col">Nama pasien</th>
              <th scope="col" className="num">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyHint
                    title="Belum ada transaksi"
                    hint="Simpan invoice dari tab Transaksi untuk melihat riwayat."
                  />
                </td>
              </tr>
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
