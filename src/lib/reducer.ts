import { nextCode } from './codes'
import { nextSerialNo } from './serialNo'
import type {
  AppData,
  Patient,
  Product,
  Transaction,
  TxLine,
} from './types'

export type Action =
  | { type: 'ADD_PRODUCT'; name: string; price: number }
  | { type: 'ADD_PATIENT'; name: string; phone: string }
  | {
      type: 'ADD_TRANSACTION'
      patient: Patient
      lines: { product: Product; qty: number }[]
    }

export function appReducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'ADD_PRODUCT': {
      const { code, sequences } = nextCode('product', state.sequences)
      const product: Product = {
        id: code,
        serialNo: nextSerialNo(state.products),
        name: action.name.trim(),
        price: action.price,
      }
      return {
        ...state,
        sequences,
        products: [...state.products, product],
      }
    }
    case 'ADD_PATIENT': {
      const { code, sequences } = nextCode('patient', state.sequences)
      const patient: Patient = {
        id: code,
        serialNo: nextSerialNo(state.patients),
        name: action.name.trim(),
        phone: action.phone.trim(),
      }
      return {
        ...state,
        sequences,
        patients: [...state.patients, patient],
      }
    }
    case 'ADD_TRANSACTION': {
      const { code: invoiceNo, sequences } = nextCode(
        'invoice',
        state.sequences,
      )
      const lines: TxLine[] = action.lines.map(({ product, qty }) => ({
        productId: product.id,
        productName: product.name,
        price: product.price,
        qty,
      }))
      const tx: Transaction = {
        invoiceNo,
        dateISO: new Date().toISOString(),
        patientId: action.patient.id,
        patientName: action.patient.name,
        lines,
      }
      return {
        ...state,
        sequences,
        transactions: [...state.transactions, tx],
      }
    }
    default:
      return state
  }
}
