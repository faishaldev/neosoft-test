export interface Product {
  id: string

  serialNo: number
  name: string
  price: number

  archived?: boolean
}

export interface Patient {
  id: string
  serialNo: number
  name: string
  phone: string

  archived?: boolean
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

  sequences: Record<string, number>
}

export type DraftLine = { productId: string; qty: number }
