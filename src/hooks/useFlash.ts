import { useCallback, useEffect, useState } from 'react'

/** Pesan singkat yang hilang otomatis (umpan balik tanpa modal). */
export function useFlash(durationMs = 3800) {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!message) return
    const id = window.setTimeout(() => setMessage(null), durationMs)
    return () => window.clearTimeout(id)
  }, [message, durationMs])

  const flash = useCallback((msg: string) => setMessage(msg), [])
  return { message, flash }
}
