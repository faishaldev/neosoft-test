/** Menginterpretasi input harga ala ID (titik ribuan, koma desimal). */
export function parsePriceInput(raw: string): number {
  const n = Number(raw.replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) ? Math.round(n) : NaN
}
