import { parsePriceInput } from './parseCurrency'

const MAX_LABEL_LEN = 120

export const MAX_PRICE_RP = 999_999_999

export type FieldError = string | null

export function validateProductName(raw: string): FieldError {
  const t = raw.trim()
  if (!t) return 'Nama barang wajib diisi.'
  if (t.length > MAX_LABEL_LEN) {
    return `Nama maksimal ${MAX_LABEL_LEN} karakter.`
  }
  return null
}

export function validatePriceRp(raw: string): FieldError {
  const trimmed = raw.trim()
  if (!trimmed) return 'Harga wajib diisi.'
  const n = parsePriceInput(trimmed)
  if (Number.isNaN(n)) return 'Format harga tidak valid (gunakan angka).'
  if (n < 1) return 'Harga minimal Rp 1.'
  if (n > MAX_PRICE_RP) {
    return 'Harga terlalu besar.'
  }
  return null
}

export function validatePatientName(raw: string): FieldError {
  const t = raw.trim()
  if (!t) return 'Nama pasien wajib diisi.'
  if (t.length > MAX_LABEL_LEN) {
    return `Nama maksimal ${MAX_LABEL_LEN} karakter.`
  }
  return null
}

export function validatePhoneId(raw: string): FieldError {
  const t = raw.trim().replace(/\s+/g, '')
  if (!t) return null
  let d = t
  if (d.startsWith('+62')) d = `0${d.slice(3)}`
  else if (d.startsWith('62') && d.length >= 10) d = `0${d.slice(2)}`
  if (!/^08\d{8,11}$/.test(d)) {
    return 'Gunakan nomor Indonesia 10–13 digit (mis. 08xxxxxxxxxx).'
  }
  return null
}

export function normalizePhoneId(raw: string): string {
  const t = raw.trim().replace(/\s+/g, '')
  if (!t) return ''
  let d = t
  if (d.startsWith('+62')) d = `0${d.slice(3)}`
  else if (d.startsWith('62') && d.length >= 10) d = `0${d.slice(2)}`
  return d
}
