/** Normalisasi untuk pencarian substring (case-insensitive, locale ID). */
export function normalizeSearchToken(s: string): string {
  return s.trim().toLocaleLowerCase('id-ID')
}

/**
 * Cocok jika setiap token dalam query muncul di salah satu bagian teks baris
 * (OR implisit antar bagian digabung; AND antar token).
 */
export function rowMatchesSearch(
  parts: readonly string[],
  queryRaw: string,
): boolean {
  const q = queryRaw.trim()
  if (!q) return true
  const tokens = normalizeSearchToken(q)
    .split(/\s+/)
    .filter(Boolean)
  const haystack = parts.map(normalizeSearchToken).join(' ')
  return tokens.every((t) => haystack.includes(t))
}
