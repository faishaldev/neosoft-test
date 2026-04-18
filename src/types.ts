export interface Product {
  id: string
  name: string
  price: number
}

export interface Patient {
  id: string
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
  /** Counter per bulan untuk kode `P-YYMM####`, `EM-YYMM####`, `INV-YYMM####` */
  sequences: Record<string, number>
}
