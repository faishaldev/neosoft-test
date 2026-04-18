import { createPortal } from 'react-dom'
import type { ToastVariant } from '../hooks/useFlash'

type Props = {
  message: string | null
  onDismiss: () => void
  variant?: ToastVariant
}

export function Toast({
  message,
  onDismiss,
  variant = 'success',
}: Props) {
  if (!message || typeof document === 'undefined') return null

  const isErr = variant === 'error'

  return createPortal(
    <div className="toast-slot" role="region" aria-label="Notifikasi">
      <div
        className={`toast ${isErr ? 'toast--error' : 'toast--success'}`}
        role="status"
        aria-live="polite"
      >
        <span className="toast__icon" aria-hidden>
          {isErr ? '!' : '✓'}
        </span>
        <span className="toast__msg">{message}</span>
        <button
          type="button"
          className="toast__close"
          onClick={onDismiss}
          aria-label="Tutup notifikasi"
        >
          ×
        </button>
      </div>
    </div>,
    document.body,
  )
}
