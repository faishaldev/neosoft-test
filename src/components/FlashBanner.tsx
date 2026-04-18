type Props = { message: string | null }

export function FlashBanner({ message }: Props) {
  if (!message) return null
  return (
    <div className="flash" role="status" aria-live="polite">
      <span className="flash__icon" aria-hidden>
        ✓
      </span>
      {message}
    </div>
  )
}
