import type { ProductSaleAgg } from '../lib/salesMetrics'
import type { Transaction } from '../lib/types'
import {
  downloadAggregationCsv,
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
            CSV transaksi
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => downloadAggregationCsv(salesByProduct)}
          >
            CSV agregasi
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
        JSON berisi ringkasan, daftar transaksi, dan agregasi per barang. CSV
        transaksi satu baris per invoice; CSV agregasi sesuai tabel agregasi.
      </p>
    </div>
  )
}
