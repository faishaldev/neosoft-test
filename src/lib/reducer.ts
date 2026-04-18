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
  | {
      type: 'UPDATE_PRODUCT'
      id: string
      name: string
      price: number
    }
  | { type: 'SET_PRODUCT_ARCHIVED'; id: string; archived: boolean }
  | { type: 'ADD_PATIENT'; name: string; phone: string }
  | {
      type: 'UPDATE_PATIENT'
      id: string
      name: string
      phone: string
    }
  | { type: 'SET_PATIENT_ARCHIVED'; id: string; archived: boolean }
  | {
      type: 'IMPORT_PRODUCTS'
      rows: readonly { name: string; price: number }[]
    }
  | {
      type: 'IMPORT_PATIENTS'
      rows: readonly { name: string; phone: string }[]
    }
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
        archived: false,
      }
      return {
        ...state,
        sequences,
        products: [...state.products, product],
      }
    }
    case 'UPDATE_PRODUCT': {
      if (!state.products.some((p) => p.id === action.id)) return state
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.id
            ? {
                ...p,
                name: action.name.trim(),
                price: action.price,
              }
            : p,
        ),
      }
    }
    case 'SET_PRODUCT_ARCHIVED': {
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.id ? { ...p, archived: action.archived } : p,
        ),
      }
    }
    case 'ADD_PATIENT': {
      const { code, sequences } = nextCode('patient', state.sequences)
      const patient: Patient = {
        id: code,
        serialNo: nextSerialNo(state.patients),
        name: action.name.trim(),
        phone: action.phone.trim(),
        archived: false,
      }
      return {
        ...state,
        sequences,
        patients: [...state.patients, patient],
      }
    }
    case 'UPDATE_PATIENT': {
      if (!state.patients.some((p) => p.id === action.id)) return state
      return {
        ...state,
        patients: state.patients.map((p) =>
          p.id === action.id
            ? {
                ...p,
                name: action.name.trim(),
                phone: action.phone.trim(),
              }
            : p,
        ),
      }
    }
    case 'SET_PATIENT_ARCHIVED': {
      return {
        ...state,
        patients: state.patients.map((p) =>
          p.id === action.id ? { ...p, archived: action.archived } : p,
        ),
      }
    }
    case 'IMPORT_PRODUCTS': {
      let sequences = state.sequences
      const products = [...state.products]
      for (const row of action.rows) {
        const { code, sequences: seq } = nextCode('product', sequences)
        sequences = seq
        products.push({
          id: code,
          serialNo: nextSerialNo(products),
          name: row.name.trim(),
          price: row.price,
          archived: false,
        })
      }
      return {
        ...state,
        sequences,
        products,
      }
    }
    case 'IMPORT_PATIENTS': {
      let sequences = state.sequences
      const patients = [...state.patients]
      for (const row of action.rows) {
        const { code, sequences: seq } = nextCode('patient', sequences)
        sequences = seq
        patients.push({
          id: code,
          serialNo: nextSerialNo(patients),
          name: row.name.trim(),
          phone: row.phone.trim(),
          archived: false,
        })
      }
      return {
        ...state,
        sequences,
        patients,
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
