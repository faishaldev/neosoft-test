import type { ProductSaleAgg } from '../lib/salesMetrics'
import type { Transaction } from '../lib/types'
import {
  downloadReportJson,
  downloadTransactionsCsv,
} from '../lib/importExport/reportIo'

type Props = {
  transactions: Transaction[]
  salesByProduct: ProductSaleAgg[]
  grandTotal: number
}

export function ReportToolbar({
  transactions,
  salesByProduct,
  grandTotal,
}: Props) {
  return (
    <div className="panel-io no-print" role="group" aria-label="Ekspor dan cetak laporan">
      <div className="panel-io__actions panel-io__actions--report">
        <div
          className="panel-io__cluster"
          aria-label="Ekspor data"
        >
          <button
            type="button"
            className="btn"
            onClick={() =>
              downloadReportJson(transactions, salesByProduct, grandTotal)
            }
          >
            Ekspor JSON
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => downloadTransactionsCsv(transactions)}
          >
            Ekspor CSV
          </button>
        </div>
        <button
          type="button"
          className="btn btn--primary panel-io__report-print"
          onClick={() => window.print()}
        >
          Cetak laporan
        </button>
      </div>
      <p className="panel-io__hint">
        JSON berisi ringkasan dan daftar transaksi. CSV transaksi satu
        baris per invoice.
      </p>
    </div>
  )
}
