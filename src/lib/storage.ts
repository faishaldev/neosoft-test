import {
  migrateSerialPatients,
  migrateSerialProducts,
} from './serialNo'
import type { AppData, Patient, Product } from './types'

export const STORAGE_KEY = 'neosoft-penjualan-v1'

export const emptyState: AppData = {
  products: [],
  patients: [],
  transactions: [],
  sequences: {},
}

export function loadState(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState
    const p = JSON.parse(raw) as Partial<AppData>
    const productsRaw = Array.isArray(p.products) ? p.products : []
    const patientsRaw = Array.isArray(p.patients) ? p.patients : []
    return {
      products: migrateSerialProducts(productsRaw as Product[]),
      patients: migrateSerialPatients(patientsRaw as Patient[]),
      transactions: Array.isArray(p.transactions) ? p.transactions : [],
      sequences:
        p.sequences && typeof p.sequences === 'object' ? p.sequences : {},
    }
  } catch {
    return emptyState
  }
}

export function saveState(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
