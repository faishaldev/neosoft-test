import { txLineTotal } from '../salesMetrics'
import type { ProductSaleAgg } from '../salesMetrics'
import type { Transaction } from '../types'
import { formatDateId } from '../../utils/format'
import { triggerDownload } from './download'

const FORMAT = 'neosoft-laporan' as const

function escapeCsvValue(value: string): string {
  const normalizedValue = String(value)
  if (/[",\n\r]/.test(normalizedValue)) {
    return `"${normalizedValue.replace(/"/g, '""')}"`
  }
  return normalizedValue
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
      agregasiPerBarang: salesByProduct.map((productSale) => ({
        kodeBarang: productSale.id,
        nama: productSale.name,
        qtyTerjual: productSale.qty,
        subtotalRp: productSale.revenue,
      })),
    },
    null,
    2,
  )}\n`
}

export function exportTransactionsCsv(transactions: Transaction[]): string {
  const header =
    'invoiceNo,tanggalISO,tanggalTampilan,idPasien,namaPasien,totalRp'
  const lines = transactions.map((transaction) =>
    [
      escapeCsvValue(transaction.invoiceNo),
      escapeCsvValue(transaction.dateISO),
      escapeCsvValue(formatDateId(transaction.dateISO)),
      escapeCsvValue(transaction.patientId),
      escapeCsvValue(transaction.patientName),
      String(txLineTotal(transaction)),
    ].join(','),
  )
  return `\ufeff${header}\r\n${lines.join('\r\n')}\r\n`
}

export function exportAggregationCsv(productSales: ProductSaleAgg[]): string {
  const header = 'kodeBarang,namaBarang,qtyTerjual,subtotalRp'
  const lines = productSales.map((productSale) =>
    [
      escapeCsvValue(productSale.id),
      escapeCsvValue(productSale.name),
      String(productSale.qty),
      String(productSale.revenue),
    ].join(','),
  )
  return `\ufeff${header}\r\n${lines.join('\r\n')}\r\n`
}

function buildDateStamp(): string {
  return new Date().toISOString().slice(0, 10)
}

export function downloadReportJson(
  transactions: Transaction[],
  salesByProduct: ProductSaleAgg[],
  grandTotal: number,
) {
  triggerDownload(
    `laporan-${buildDateStamp()}.json`,
    exportReportJson(transactions, salesByProduct, grandTotal),
    'application/json',
  )
}

export function downloadTransactionsCsv(transactions: Transaction[]) {
  triggerDownload(
    `laporan-transaksi-${buildDateStamp()}.csv`,
    exportTransactionsCsv(transactions),
    'text/csv',
  )
}

export function downloadAggregationCsv(
  productSales: ProductSaleAgg[],
) {
  triggerDownload(
    `laporan-agregasi-${buildDateStamp()}.csv`,
    exportAggregationCsv(productSales),
    'text/csv',
  )
}
