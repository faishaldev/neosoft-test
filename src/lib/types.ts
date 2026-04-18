export interface Product {
  id: string
  /** Nomor urut tetap (disimpan; tidak berubah saat sort tabel). */
  serialNo: number
  name: string
  price: number
}

export interface Patient {
  id: string
  serialNo: number
  name: string
  phone: string
}

export interface TxLine {
  productId: string
  productName: string
  price: number
  qty: number
}

export interface Transaction {
  invoiceNo: string
  dateISO: string
  patientId: string
  patientName: string
  lines: TxLine[]
}

export interface AppData {
  products: Product[]
  patients: Patient[]
  transactions: Transaction[]
  /**
   * Counter bulanan: `P-YYMM####`, `EM-YYMM####`, `INV-YYMM####`.
   */
  sequences: Record<string, number>
}

/** Baris keranjang sebelum transaksi disimpan */
export type DraftLine = { productId: string; qty: number }
