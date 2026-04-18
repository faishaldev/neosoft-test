import { useEffect } from 'react'

/**
 * Saat `active`, tombol Escape memanggil `onCancel`
 * (mis. batal edit inline di tabel).
 */
export function useEscapeCancel(
  active: boolean,
  onCancel: () => void,
): void {
  useEffect(() => {
    if (!active) return
    function onKey(ev: KeyboardEvent) {
      if (ev.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, onCancel])
}
