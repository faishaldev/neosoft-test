type Props = { title: string; hint: string }

export function EmptyHint({ title, hint }: Props) {
  return (
    <div className="empty-hint">
      <p className="empty-hint__title">{title}</p>
      <p className="empty-hint__text">{hint}</p>
    </div>
  )
}
