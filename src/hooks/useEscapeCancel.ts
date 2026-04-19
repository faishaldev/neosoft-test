import { useEffect } from 'react'

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
