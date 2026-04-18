import type { ProductSaleAgg } from '../lib/salesMetrics'
import type { Transaction } from '../lib/types'
import { formatIdr } from '../utils/format'
import { ReportProductsTable } from './ReportProductsTable'
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
        className="stat-grid"
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
      </div>

      <ReportTransactionsTable transactions={transactions} />
      <ReportProductsTable rows={salesByProduct} />
    </section>
  )
}
