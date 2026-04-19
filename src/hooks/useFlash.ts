import { useCallback, useEffect, useState } from 'react'

export type ToastVariant = 'success' | 'error'

type FlashState = {
  text: string
  variant: ToastVariant
}

export function useFlash(successMs = 3800, errorMs = 5200) {
  const [state, setState] = useState<FlashState | null>(null)

  useEffect(() => {
    if (!state) return
    const ms = state.variant === 'error' ? errorMs : successMs
    const id = window.setTimeout(() => setState(null), ms)
    return () => window.clearTimeout(id)
  }, [state, successMs, errorMs])

  const flash = useCallback(
    (msg: string, variant: ToastVariant = 'success') => {
      setState({ text: msg, variant })
    },
    [],
  )

  const clear = useCallback(() => setState(null), [])
  return {
    message: state?.text ?? null,
    variant: state?.variant ?? 'success',
    flash,
    clear,
  }
}

export { useFlash as useToast }
