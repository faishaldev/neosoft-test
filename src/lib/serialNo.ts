import type { Patient, Product } from './types'

/** Nomor urut berikutnya (lebih besar dari semua yang ada). */
export function nextSerialNo(
  items: readonly { serialNo?: number }[],
): number {
  const max = items.reduce(
    (m, x) =>
      typeof x.serialNo === 'number' && Number.isFinite(x.serialNo)
        ? Math.max(m, x.serialNo)
        : m,
    0,
  )
  return max + 1
}

/** Data lama tanpa serialNo: isi berurutan setelah max yang sudah ada. */
export function migrateSerialProducts(products: Product[]): Product[] {
  let max = products.reduce(
    (m, p) =>
      typeof p.serialNo === 'number' && Number.isFinite(p.serialNo)
        ? Math.max(m, p.serialNo)
        : m,
    0,
  )
  return products.map((p) => {
    if (typeof p.serialNo === 'number' && Number.isFinite(p.serialNo)) {
      return p
    }
    max += 1
    return { ...p, serialNo: max }
  })
}

export function migrateSerialPatients(patients: Patient[]): Patient[] {
  let max = patients.reduce(
    (m, x) =>
      typeof x.serialNo === 'number' && Number.isFinite(x.serialNo)
        ? Math.max(m, x.serialNo)
        : m,
    0,
  )
  return patients.map((x) => {
    if (typeof x.serialNo === 'number' && Number.isFinite(x.serialNo)) {
      return x
    }
    max += 1
    return { ...x, serialNo: max }
  })
}
