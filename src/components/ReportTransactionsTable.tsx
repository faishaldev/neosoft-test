import { useMemo, useState } from 'react'
import { txLineTotal } from '../lib/salesMetrics'
import type { Transaction } from '../lib/types'
import { usePagedSlice } from '../hooks/usePagedSlice'
import {
  useTableSort,
  type TableSortState,
} from '../hooks/useTableSort'
import { formatDateId, formatIdr } from '../utils/format'
import { rowMatchesSearch } from '../utils/tableSearch'
import { EmptyHint } from './EmptyHint'
import { SortableTh } from './SortableTh'
import { TableSearchBar } from './TableSearchBar'
import { TablePagination } from './TablePagination'

type SortKey =
  | 'invoiceNo'
  | 'dateISO'
  | 'patientId'
  | 'patientName'
  | 'total'

type Props = { transactions: Transaction[] }

type ReportTxPagedProps = {
  transactions: Transaction[]
  filteredTx: Transaction[]
  sorted: Transaction[]
  sort: TableSortState<SortKey> | null
  toggle: (key: SortKey) => void
}

function ReportTransactionsPaged({
  transactions,
  filteredTx,
  sorted,
  sort,
  toggle,
}: ReportTxPagedProps) {
  const pageData = usePagedSlice(sorted)
  return (
    <>
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
            ) : filteredTx.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyHint
                    title="Tidak ada baris yang cocok"
                    hint="Sesuaikan kata kunci atau kosongkan kolom Cari."
                  />
                </td>
              </tr>
            ) : (
              pageData.slice.map((t) => (
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

export function ReportTransactionsTable({ transactions }: Props) {
  const [tableSearch, setTableSearch] = useState('')
  const { sort, toggle } = useTableSort<SortKey>()

  const filteredTx = useMemo(() => {
    if (!tableSearch.trim()) return transactions
    return transactions.filter((t) => {
      const total = txLineTotal(t)
      return rowMatchesSearch(
        [
          t.invoiceNo,
          t.dateISO,
          formatDateId(t.dateISO),
          t.patientId,
          t.patientName,
          String(total),
          formatIdr(total),
        ],
        tableSearch,
      )
    })
  }, [transactions, tableSearch])

  const sorted = useMemo(() => {
    if (!sort) return filteredTx
    const m = [...filteredTx]
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
  }, [filteredTx, sort])

  return (
    <>
      <h3 className="subhead">Detail per transaksi</h3>
      <div className="table-block">
        <TableSearchBar
          id="report-transactions-search"
          value={tableSearch}
          onChange={setTableSearch}
          placeholder="Cari — Invoice, tanggal, pasien, atau total…"
        />
        <ReportTransactionsPaged
          key={tableSearch}
          transactions={transactions}
          filteredTx={filteredTx}
          sorted={sorted}
          sort={sort}
          toggle={toggle}
        />
      </div>
    </>
  )
}
