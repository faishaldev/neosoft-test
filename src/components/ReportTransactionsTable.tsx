import { useMemo, useState } from 'react'
import { txLineTotal } from '../lib/salesMetrics'
import type { Transaction } from '../lib/types'
import { usePagedSlice } from '../hooks/usePagedSlice'
import { formatDateId, formatIdr } from '../utils/format'
import { rowMatchesSearch } from '../utils/tableSearch'
import { EmptyHint } from './EmptyHint'
import { TablePagination } from './TablePagination'

type SortKey =
  | 'invoiceNo'
  | 'dateISO'
  | 'patientId'
  | 'patientName'
  | 'total'
type SortDir = 'asc' | 'desc'
type SortOption =
  | 'invoiceNo:asc'
  | 'invoiceNo:desc'
  | 'dateISO:asc'
  | 'dateISO:desc'
  | 'patientId:asc'
  | 'patientId:desc'
  | 'patientName:asc'
  | 'patientName:desc'
  | 'total:asc'
  | 'total:desc'

type Props = { transactions: Transaction[] }

type ReportTxPagedProps = {
  transactions: Transaction[]
  filteredTx: Transaction[]
  sorted: Transaction[]
}

function ReportTransactionsPaged({
  transactions,
  filteredTx,
  sorted,
}: ReportTxPagedProps) {
  const pageData = usePagedSlice(sorted)

  return (
    <>
      <div className="report-cards">
        {transactions.length === 0 ? (
          <EmptyHint
            title="Belum ada transaksi"
            hint="Simpan invoice dari tab Transaksi untuk melihat riwayat."
          />
        ) : filteredTx.length === 0 ? (
          <EmptyHint
            title="Tidak ada baris yang cocok"
            hint="Sesuaikan kata kunci atau kosongkan kolom Cari."
          />
        ) : (
          pageData.slice.map((transaction) => (
            <article key={transaction.invoiceNo} className="report-card">
              <p className="report-card__title mono">
                {transaction.invoiceNo}
              </p>
              <dl className="report-card__meta">
                <div>
                  <dt>Tanggal</dt>
                  <dd>{formatDateId(transaction.dateISO)}</dd>
                </div>
                <div>
                  <dt>ID pasien</dt>
                  <dd className="mono">{transaction.patientId}</dd>
                </div>
                <div>
                  <dt>Nama pasien</dt>
                  <dd>{transaction.patientName}</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>{formatIdr(txLineTotal(transaction))}</dd>
                </div>
                <div>
                  <dt>Jumlah item</dt>
                  <dd>{transaction.lines.length}</dd>
                </div>
              </dl>
              <details className="report-card__lines">
                <summary className="report-card__lines-summary">
                  Detail barang ({transaction.lines.length})
                </summary>
                <ul className="report-card__lines-list">
                  {transaction.lines.map((line, lineIndex) => (
                    <li
                      key={`${line.productId}-${lineIndex}`}
                      className="report-card__line-item"
                    >
                      <div className="report-card__line-head">
                        <span className="report-card__line-name">
                          {line.productName}
                        </span>
                        <span className="report-card__line-subtotal">
                          {formatIdr(line.price * line.qty)}
                        </span>
                      </div>
                      <p className="report-card__line-meta mono">
                        {line.productId} • {line.qty} x{' '}
                        {formatIdr(line.price)}
                      </p>
                    </li>
                  ))}
                </ul>
              </details>
            </article>
          ))
        )}
      </div>
      <div className="report-print-table-wrap">
        <table className="data-table report-print-table">
          <caption className="sr-only">
            Data transaksi untuk cetak laporan.
          </caption>
          <thead>
            <tr>
              <th scope="col">No Invoice</th>
              <th scope="col">Tanggal</th>
              <th scope="col">ID pasien</th>
              <th scope="col">Nama pasien</th>
              <th scope="col" className="num">
                Total
              </th>
              <th scope="col" className="num">
                Item
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((transaction) => (
              <tr key={`print-${transaction.invoiceNo}`}>
                <td className="mono">{transaction.invoiceNo}</td>
                <td>{formatDateId(transaction.dateISO)}</td>
                <td className="mono">{transaction.patientId}</td>
                <td>{transaction.patientName}</td>
                <td className="num">{formatIdr(txLineTotal(transaction))}</td>
                <td className="num">{transaction.lines.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="no-print">
        <TablePagination
          page={pageData.page}
          totalPages={pageData.totalPages}
          totalItems={pageData.total}
          pageSize={pageData.pageSize}
          onPageChange={pageData.setPage}
        />
      </div>
    </>
  )
}

export function ReportTransactionsTable({ transactions }: Props) {
  const [tableSearch, setTableSearch] = useState('')
  const [sortOption, setSortOption] =
    useState<SortOption>('dateISO:desc')

  const filteredTx = useMemo(() => {
    if (!tableSearch.trim()) return transactions
    return transactions.filter((transaction) => {
      const transactionTotal = txLineTotal(transaction)
      const lineSearchTokens = transaction.lines.flatMap((line) => [
        line.productId,
        line.productName,
        String(line.qty),
        String(line.price),
        String(line.price * line.qty),
        formatIdr(line.price),
        formatIdr(line.price * line.qty),
      ])
      return rowMatchesSearch(
        [
          transaction.invoiceNo,
          transaction.dateISO,
          formatDateId(transaction.dateISO),
          transaction.patientId,
          transaction.patientName,
          String(transactionTotal),
          formatIdr(transactionTotal),
          ...lineSearchTokens,
        ],
        tableSearch,
      )
    })
  }, [transactions, tableSearch])

  const sorted = useMemo(() => {
    const [sortKey, sortDir] = sortOption.split(':') as [
      SortKey,
      SortDir,
    ]
    const sortedTransactions = [...filteredTx]
    sortedTransactions.sort((leftTransaction, rightTransaction) => {
      let sortCompareResult = 0
      if (sortKey === 'invoiceNo') {
        sortCompareResult = leftTransaction.invoiceNo.localeCompare(
          rightTransaction.invoiceNo,
          'id-ID',
        )
      } else if (sortKey === 'dateISO') {
        sortCompareResult = leftTransaction.dateISO.localeCompare(
          rightTransaction.dateISO,
        )
      } else if (sortKey === 'patientId') {
        sortCompareResult = leftTransaction.patientId.localeCompare(
          rightTransaction.patientId,
          'id-ID',
        )
      } else if (sortKey === 'patientName') {
        sortCompareResult = leftTransaction.patientName.localeCompare(
          rightTransaction.patientName,
          'id-ID',
        )
      } else {
        sortCompareResult =
          txLineTotal(leftTransaction) - txLineTotal(rightTransaction)
      }
      return sortDir === 'asc'
        ? sortCompareResult
        : -sortCompareResult
    })
    return sortedTransactions
  }, [filteredTx, sortOption])

  return (
    <>
      <h3 className="subhead">Detail per transaksi</h3>
      <div className="table-block">
        <div className="table-toolbar report-toolbar no-print">
          <div className="table-toolbar__search">
            <input
              id="report-transactions-search"
              type="search"
              autoComplete="off"
              spellCheck={false}
              value={tableSearch}
              onChange={(ev) => setTableSearch(ev.target.value)}
              placeholder="Cari — Invoice, tanggal, pasien, atau total…"
              aria-label="Cari transaksi"
            />
          </div>
          <label className="report-toolbar__sort">
            <span className="sr-only">Urutkan transaksi</span>
            <select
              value={sortOption}
              onChange={(ev) =>
                setSortOption(ev.target.value as SortOption)
              }
              aria-label="Urutkan transaksi"
            >
              <option value="dateISO:desc">Urut: Tanggal terbaru</option>
              <option value="dateISO:asc">Urut: Tanggal terlama</option>
              <option value="invoiceNo:asc">Urut: Invoice A-Z</option>
              <option value="invoiceNo:desc">Urut: Invoice Z-A</option>
              <option value="patientName:asc">
                Urut: Nama pasien A-Z
              </option>
              <option value="patientName:desc">
                Urut: Nama pasien Z-A
              </option>
              <option value="total:desc">Urut: Total terbesar</option>
              <option value="total:asc">Urut: Total terkecil</option>
            </select>
          </label>
        </div>
        <ReportTransactionsPaged
          key={tableSearch}
          transactions={transactions}
          filteredTx={filteredTx}
          sorted={sorted}
        />
      </div>
    </>
  )
}
