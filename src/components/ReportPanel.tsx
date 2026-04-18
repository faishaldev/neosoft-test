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

      <div className="stat-grid">
        <div className="stat">
          <span className="stat__label">Total transaksi</span>
          <span className="stat__value">{transactions.length}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Omzet kumulatif</span>
          <span className="stat__value">{formatIdr(grandTotal)}</span>
        </div>
      </div>

      <ReportTransactionsTable transactions={transactions} />
      <ReportProductsTable rows={salesByProduct} />
    </section>
  )
}
