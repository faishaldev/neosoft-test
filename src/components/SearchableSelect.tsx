import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'

export type SearchableSelectItem = { value: string; label: string }

function matchLabel(label: string, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const hay = label.toLowerCase()
  return q.split(/\s+/).every((w) => hay.includes(w))
}

type Props = {
  id?: string
  value: string
  onChange: (value: string) => void
  items: SearchableSelectItem[]
  emptyOptionLabel: string
  /** Shown on trigger when nothing selected */
  placeholder?: string
  searchPlaceholder?: string
  ariaLabel?: string
  disabled?: boolean
  className?: string
}

export function SearchableSelect({
  id,
  value,
  onChange,
  items,
  emptyOptionLabel,
  placeholder = emptyOptionLabel,
  searchPlaceholder = 'Ketik untuk mencari…',
  ariaLabel,
  disabled,
  className,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const baseOptions = useMemo(
    () => [{ value: '', label: emptyOptionLabel }, ...items],
    [items, emptyOptionLabel],
  )

  const filteredOptions = useMemo(() => {
    const [head, ...rest] = baseOptions
    const q = search.trim()
    if (!q) return baseOptions
    const fr = rest.filter((it) => matchLabel(it.label, q))
    return [head, ...fr]
  }, [baseOptions, search])

  const displayLabel = useMemo(() => {
    if (!value) return null
    const hit = items.find((i) => i.value === value)
    return hit?.label ?? value
  }, [value, items])

  const close = useCallback(() => {
    setOpen(false)
    setSearch('')
  }, [])

  useEffect(() => {
    if (!open) return
    const t = window.requestAnimationFrame(() => {
      searchRef.current?.focus()
      searchRef.current?.select()
    })
    return () => window.cancelAnimationFrame(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onPointerDown(ev: MouseEvent) {
      const el = rootRef.current
      if (!el || !(ev.target instanceof Node)) return
      if (!el.contains(ev.target)) close()
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open, close])

  useEffect(() => {
    if (!open) return
    function onKey(ev: KeyboardEvent) {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        close()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  function pick(next: string) {
    onChange(next)
    close()
  }

  const rootClass = ['searchable-select', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass} ref={rootRef}>
      <button
        type="button"
        id={id}
        className="searchable-select__trigger"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <span
          className={
            displayLabel
              ? 'searchable-select__value'
              : 'searchable-select__value searchable-select__value--muted'
          }
        >
          {displayLabel ?? placeholder}
        </span>
        <span className="searchable-select__chevron" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div className="searchable-select__dropdown">
          <input
            ref={searchRef}
            type="search"
            className="searchable-select__search"
            value={search}
            onChange={(ev) => setSearch(ev.target.value)}
            placeholder={searchPlaceholder}
            aria-autocomplete="list"
            aria-controls={listId}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter') ev.preventDefault()
              if (ev.key === 'Tab') close()
              if (ev.key === 'ArrowDown') {
                ev.preventDefault()
                rootRef.current
                  ?.querySelector<HTMLButtonElement>(
                    '.searchable-select__option',
                  )
                  ?.focus()
              }
            }}
          />
          <div
            id={listId}
            className="searchable-select__list"
            role="listbox"
            tabIndex={-1}
          >
            {filteredOptions.map((opt) => (
              <button
                key={opt.value || '__empty__'}
                type="button"
                role="option"
                aria-selected={value === opt.value}
                className="searchable-select__option"
                onClick={() => pick(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
