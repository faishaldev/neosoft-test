import { useMemo } from 'react'
import { txLineTotal } from '../lib/salesMetrics'
import type { Transaction } from '../lib/types'
import { useTableSort } from '../hooks/useTableSort'
import { formatDateId, formatIdr } from '../utils/format'
import { EmptyHint } from './EmptyHint'
import { SortableTh } from './SortableTh'

type SortKey = 'invoiceNo' | 'dateISO' | 'patientId' | 'patientName' | 'total'

type Props = { transactions: Transaction[] }

export function ReportTransactionsTable({ transactions }: Props) {
  const { sort, toggle } = useTableSort<SortKey>()

  const sorted = useMemo(() => {
    if (!sort) return transactions
    const m = [...transactions]
    m.sort((a, b) => {
      let c = 0
      if (sort.key === 'invoiceNo') {
        c = a.invoiceNo.localeCompare(b.invoiceNo, 'id-ID')
      } else if (sort.key === 'dateISO') {
        c = a.dateISO.localeCompare(b.dateISO)
      } else if (sort.key === 'patientId') {
        c = a.patientId.localeCompare(b.patientId, 'id-ID')
      } else if (sort.key === 'patientName') {
        c = a.patientName.localeCompare(b.patientName, 'id-ID')
      } else {
        c = txLineTotal(a) - txLineTotal(b)
      }
      return sort.dir === 'asc' ? c : -c
    })
    return m
  }, [transactions, sort])

  return (
    <>
      <h3 className="subhead">Detail per transaksi</h3>
      <div className="table-wrap">
        <table className="data-table">
          <caption className="sr-only">
            Riwayat invoice; urutkan kolom lewat tombol header.
          </caption>
          <thead>
            <tr>
              <SortableTh
                label="No Invoice"
                sortKey="invoiceNo"
                sort={sort}
                onSort={() => toggle('invoiceNo')}
              />
              <SortableTh
                label="Tanggal"
                sortKey="dateISO"
                sort={sort}
                onSort={() => toggle('dateISO')}
              />
              <SortableTh
                label="ID pasien"
                sortKey="patientId"
                sort={sort}
                onSort={() => toggle('patientId')}
              />
              <SortableTh
                label="Nama pasien"
                sortKey="patientName"
                sort={sort}
                onSort={() => toggle('patientName')}
              />
              <SortableTh
                label="Total"
                sortKey="total"
                sort={sort}
                onSort={() => toggle('total')}
                alignEnd
              />
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
              sorted.map((t) => (
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
