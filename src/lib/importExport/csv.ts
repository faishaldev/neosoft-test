
export function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) return text.slice(1)
  return text
}

export function detectDelimiter(line: string): ',' | ';' {
  const commas = line.split(',').length - 1
  const semis = line.split(';').length - 1
  return semis > commas ? ';' : ','
}

export function splitCsvLine(line: string, delim: ',' | ';'): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (!inQuotes && c === delim) {
      out.push(cur.trim())
      cur = ''
      continue
    }
    cur += c
  }
  out.push(cur.trim())
  return out
}

export function normalizeHeaderCell(s: string): string {
  return stripBom(s)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
}
