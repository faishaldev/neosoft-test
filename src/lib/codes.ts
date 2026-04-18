import type { AppData } from './types'

export type CodeKind = 'product' | 'patient' | 'invoice'

const PREFIX: Record<CodeKind, string> = {
  product: 'P',
  patient: 'EM',
  invoice: 'INV',
}

export function nextCode(
  kind: CodeKind,
  sequences: AppData['sequences'],
  refDate: Date = new Date(),
): { code: string; sequences: AppData['sequences'] } {
  const yy = String(refDate.getFullYear()).slice(-2)
  const mm = String(refDate.getMonth() + 1).padStart(2, '0')
  const p = PREFIX[kind]
  const key = `${p}:${yy}${mm}`
  const next = (sequences[key] ?? 0) + 1
  const code = `${p}-${yy}${mm}${String(next).padStart(4, '0')}`
  return { code, sequences: { ...sequences, [key]: next } }
}
