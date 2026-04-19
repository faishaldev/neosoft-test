import type { Patient, Product } from './types'

export function nextSerialNo(
  items: readonly { serialNo?: number }[],
): number {
  const maxSerialNo = items.reduce(
    (currentMax, item) =>
      typeof item.serialNo === 'number' &&
      Number.isFinite(item.serialNo)
        ? Math.max(currentMax, item.serialNo)
        : currentMax,
    0,
  )
  return maxSerialNo + 1
}

export function migrateSerialProducts(products: Product[]): Product[] {
  let maxSerialNo = products.reduce(
    (currentMax, product) =>
      typeof product.serialNo === 'number' &&
      Number.isFinite(product.serialNo)
        ? Math.max(currentMax, product.serialNo)
        : currentMax,
    0,
  )
  return products.map((product) => {
    if (
      typeof product.serialNo === 'number' &&
      Number.isFinite(product.serialNo)
    ) {
      return product
    }
    maxSerialNo += 1
    return { ...product, serialNo: maxSerialNo }
  })
}

export function migrateSerialPatients(patients: Patient[]): Patient[] {
  let maxSerialNo = patients.reduce(
    (currentMax, patient) =>
      typeof patient.serialNo === 'number' &&
      Number.isFinite(patient.serialNo)
        ? Math.max(currentMax, patient.serialNo)
        : currentMax,
    0,
  )
  return patients.map((patient) => {
    if (
      typeof patient.serialNo === 'number' &&
      Number.isFinite(patient.serialNo)
    ) {
      return patient
    }
    maxSerialNo += 1
    return { ...patient, serialNo: maxSerialNo }
  })
}
