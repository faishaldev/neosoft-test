import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { TAB_ITEMS, type Tab } from '../lib/tabs'

type Props = {
  tab: Tab
  onTabChange: (t: Tab) => void
}

export function MobileTabMenu({ tab, onTabChange }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    function onDoc(ev: MouseEvent) {
      const el = rootRef.current
      if (!el || !(ev.target instanceof Node)) return
      if (!el.contains(ev.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(ev: KeyboardEvent) {
      if (ev.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const activeLabel =
    TAB_ITEMS.find((x) => x.id === tab)?.label ?? ''

  const pick = useCallback(
    (id: Tab) => {
      onTabChange(id)
      setOpen(false)
    },
    [onTabChange],
  )

  return (
    <div className="tabs-mobile no-print" ref={rootRef}>
      <button
        type="button"
        id="app-tab-select"
        className="tabs-mobile__trigger"
        aria-label="Menu utama"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="tabs-mobile__value">{activeLabel}</span>
        <span className="tabs-mobile__chevron" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <ul
          id={listId}
          className="tabs-mobile__menu"
          role="listbox"
        >
          {TAB_ITEMS.map(({ id, label }) => (
            <li key={id} role="presentation">
              <button
                type="button"
                id={`tab-opt-${id}`}
                role="option"
                aria-selected={tab === id}
                className={
                  'tabs-mobile__option' +
                  (tab === id ? ' tabs-mobile__option--active' : '')
                }
                onClick={() => pick(id)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
