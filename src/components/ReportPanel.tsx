import type { ProductSaleAgg } from '../lib/salesMetrics'
import type { Transaction } from '../lib/types'
import { formatIdr } from '../utils/format'
import { ReportToolbar } from './ReportToolbar'
import { ReportTransactionsTable } from './ReportTransactionsTable'

type Props = {
  transactions: Transaction[]
  salesByProduct: ProductSaleAgg[]
  grandTotal: number
}

export function ReportPanel({
  transactions,
  salesByProduct,
  grandTotal,
}: Props) {
  const totalQtySold = transactions.reduce(
    (sum, t) =>
      sum + t.lines.reduce((lineSum, line) => lineSum + line.qty, 0),
    0,
  )
  const avgPerTransaction =
    transactions.length > 0 ? grandTotal / transactions.length : 0

  return (
    <section className="panel" aria-labelledby="h-report">
      <h2 id="h-report">Laporan penjualan</h2>
      <p className="panel__hint">
        Ringkasan transaksi (invoice) yang tersimpan di perangkat ini.
      </p>

      <ReportToolbar
        transactions={transactions}
        salesByProduct={salesByProduct}
        grandTotal={grandTotal}
      />

      <div
        className="stat-grid no-print"
        role="group"
        aria-label="Ringkasan laporan"
      >
        <article className="stat stat--transactions">
          <div className="stat__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
              />
            </svg>
          </div>
          <div className="stat__body">
            <span className="stat__label">Total transaksi</span>
            <span className="stat__value stat__value--num">
              {transactions.length}
            </span>
          </div>
        </article>
        <article className="stat stat--revenue">
          <div className="stat__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="stat__body">
            <span className="stat__label">Omzet kumulatif</span>
            <span className="stat__value">{formatIdr(grandTotal)}</span>
          </div>
        </article>
        <article className="stat stat--items">
          <div className="stat__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5m-15 0l1.5 10.5a2.25 2.25 0 002.228 1.93h6.044a2.25 2.25 0 002.228-1.93l1.5-10.5m-11.25 0V5.625A2.625 2.625 0 0110.125 3h3.75A2.625 2.625 0 0116.5 5.625V6.75"
              />
            </svg>
          </div>
          <div className="stat__body">
            <span className="stat__label">Total item terjual</span>
            <span className="stat__value stat__value--num">
              {totalQtySold}
            </span>
          </div>
        </article>
        <article className="stat stat--average">
          <div className="stat__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 4.5h16.5M6 8.25h12m-9 3.75h6m-8.25 7.5h9a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0016.5 4.5h-9A2.25 2.25 0 005.25 6.75v10.5A2.25 2.25 0 007.5 19.5z"
              />
            </svg>
          </div>
          <div className="stat__body">
            <span className="stat__label">Rata-rata per transaksi</span>
            <span className="stat__value">
              {formatIdr(avgPerTransaction)}
            </span>
          </div>
        </article>
      </div>

      <ReportTransactionsTable transactions={transactions} />
    </section>
  )
}
