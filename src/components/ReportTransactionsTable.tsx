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
          pageData.slice.map((t) => (
            <article key={t.invoiceNo} className="report-card">
              <p className="report-card__title mono">{t.invoiceNo}</p>
              <dl className="report-card__meta">
                <div>
                  <dt>Tanggal</dt>
                  <dd>{formatDateId(t.dateISO)}</dd>
                </div>
                <div>
                  <dt>ID pasien</dt>
                  <dd className="mono">{t.patientId}</dd>
                </div>
                <div>
                  <dt>Nama pasien</dt>
                  <dd>{t.patientName}</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>{formatIdr(txLineTotal(t))}</dd>
                </div>
                <div>
                  <dt>Jumlah item</dt>
                  <dd>{t.lines.length}</dd>
                </div>
              </dl>
              <details className="report-card__lines">
                <summary className="report-card__lines-summary">
                  Detail barang ({t.lines.length})
                </summary>
                <ul className="report-card__lines-list">
                  {t.lines.map((line, idx) => (
                    <li
                      key={`${line.productId}-${idx}`}
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
            {sorted.map((t) => (
              <tr key={`print-${t.invoiceNo}`}>
                <td className="mono">{t.invoiceNo}</td>
                <td>{formatDateId(t.dateISO)}</td>
                <td className="mono">{t.patientId}</td>
                <td>{t.patientName}</td>
                <td className="num">{formatIdr(txLineTotal(t))}</td>
                <td className="num">{t.lines.length}</td>
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
    return transactions.filter((t) => {
      const total = txLineTotal(t)
      const linesSearch = t.lines.flatMap((line) => [
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
          t.invoiceNo,
          t.dateISO,
          formatDateId(t.dateISO),
          t.patientId,
          t.patientName,
          String(total),
          formatIdr(total),
          ...linesSearch,
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
    const m = [...filteredTx]
    m.sort((a, b) => {
      let c = 0
      if (sortKey === 'invoiceNo') {
        c = a.invoiceNo.localeCompare(b.invoiceNo, 'id-ID')
      } else if (sortKey === 'dateISO') {
        c = a.dateISO.localeCompare(b.dateISO)
      } else if (sortKey === 'patientId') {
        c = a.patientId.localeCompare(b.patientId, 'id-ID')
      } else if (sortKey === 'patientName') {
        c = a.patientName.localeCompare(b.patientName, 'id-ID')
      } else {
        c = txLineTotal(a) - txLineTotal(b)
      }
      return sortDir === 'asc' ? c : -c
    })
    return m
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
