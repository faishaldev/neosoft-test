import { txLineTotal } from '../salesMetrics'
import type { ProductSaleAgg } from '../salesMetrics'
import type { Transaction } from '../types'
import { formatDateId } from '../../utils/format'
import { triggerDownload } from './download'

const FORMAT = 'neosoft-laporan' as const

function esc(s: string): string {
  const t = String(s)
  if (/[",\n\r]/.test(t)) return `"${t.replace(/"/g, '""')}"`
  return t
}

export function exportReportJson(
  transactions: Transaction[],
  salesByProduct: ProductSaleAgg[],
  grandTotal: number,
): string {
  const exportedAt = new Date().toISOString()
  return `${JSON.stringify(
    {
      format: FORMAT,
      version: 1,
      exportedAt,
      ringkasan: {
        totalTransaksi: transactions.length,
        omzetRp: grandTotal,
      },
      transaksi: transactions,
      agregasiPerBarang: salesByProduct.map((r) => ({
        kodeBarang: r.id,
        nama: r.name,
        qtyTerjual: r.qty,
        subtotalRp: r.revenue,
      })),
    },
    null,
    2,
  )}\n`
}

/** Satu baris per invoice. */
export function exportTransactionsCsv(transactions: Transaction[]): string {
  const header =
    'invoiceNo,tanggalISO,tanggalTampilan,idPasien,namaPasien,totalRp'
  const lines = transactions.map((t) =>
    [
      esc(t.invoiceNo),
      esc(t.dateISO),
      esc(formatDateId(t.dateISO)),
      esc(t.patientId),
      esc(t.patientName),
      String(txLineTotal(t)),
    ].join(','),
  )
  return `\ufeff${header}\r\n${lines.join('\r\n')}\r\n`
}

export function exportAggregationCsv(rows: ProductSaleAgg[]): string {
  const header = 'kodeBarang,namaBarang,qtyTerjual,subtotalRp'
  const lines = rows.map((r) =>
    [esc(r.id), esc(r.name), String(r.qty), String(r.revenue)].join(','),
  )
  return `\ufeff${header}\r\n${lines.join('\r\n')}\r\n`
}

function stamp(): string {
  return new Date().toISOString().slice(0, 10)
}

export function downloadReportJson(
  transactions: Transaction[],
  salesByProduct: ProductSaleAgg[],
  grandTotal: number,
) {
  triggerDownload(
    `laporan-${stamp()}.json`,
    exportReportJson(transactions, salesByProduct, grandTotal),
    'application/json',
  )
}

export function downloadTransactionsCsv(transactions: Transaction[]) {
  triggerDownload(
    `laporan-transaksi-${stamp()}.csv`,
    exportTransactionsCsv(transactions),
    'text/csv',
  )
}

export function downloadAggregationCsv(rows: ProductSaleAgg[]) {
  triggerDownload(
    `laporan-agregasi-${stamp()}.csv`,
    exportAggregationCsv(rows),
    'text/csv',
  )
}
