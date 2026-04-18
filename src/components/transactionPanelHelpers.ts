import type { DraftLine } from '../lib/types'

const MIN_VALID_LINE_COUNT = 1

export const MESSAGES = {
  missingPatient: 'Pilih pasien terlebih dahulu.',
  invalidPatient: 'Pasien tidak valid; pilih ulang dari daftar.',
  invalidLines: 'Pilih minimal satu barang dan pastikan jumlah minimal 1.',
  success: 'Transaksi berhasil. Invoice bisa dicek di Laporan.',
} as const

export const WARN_MASTER =
  'Tambah minimal satu barang (tab Daftar barang) dan satu pasien ' +
  '(tab Data pasien).'

export const emptyLine = (): DraftLine => ({ productId: '', qty: 1 })

export function updateDraftLine(
  lines: DraftLine[],
  index: number,
  patch: Partial<DraftLine>,
) {
  return lines.map((line, i) => (i === index ? { ...line, ...patch } : line))
}

export function removeDraftLine(lines: DraftLine[], index: number) {
  return lines.filter((_, i) => i !== index)
}

export function addDraftLine(lines: DraftLine[]) {
  return [...lines, emptyLine()]
}

export function getSubmitError(
  patientId: string,
  patientExists: boolean,
  lineCount: number,
) {
  if (!patientId) return MESSAGES.missingPatient
  if (!patientExists) return MESSAGES.invalidPatient
  if (lineCount < MIN_VALID_LINE_COUNT) return MESSAGES.invalidLines
  return null
}
