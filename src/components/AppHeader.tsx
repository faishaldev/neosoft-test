import { useCallback, type KeyboardEvent } from 'react'
import { TAB_ITEMS, TAB_ORDER, type Tab } from '../lib/tabs'

type Props = {
  tab: Tab
  onTabChange: (t: Tab) => void
}

export function AppHeader({ tab, onTabChange }: Props) {
  const onTabsKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      const i = TAB_ORDER.indexOf(tab)
      if (i < 0) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        onTabChange(TAB_ORDER[(i + 1) % TAB_ORDER.length])
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        onTabChange(
          TAB_ORDER[(i - 1 + TAB_ORDER.length) % TAB_ORDER.length],
        )
      } else if (e.key === 'Home') {
        e.preventDefault()
        onTabChange(TAB_ORDER[0])
      } else if (e.key === 'End') {
        e.preventDefault()
        onTabChange(TAB_ORDER[TAB_ORDER.length - 1])
      }
    },
    [tab, onTabChange],
  )

  return (
    <header className="app__header">
      <h1 className="app__title">POS Klinik Kecantikan Faishal</h1>
      <p className="app__subtitle">
        Kelola barang, pasien, invoice, dan laporan dalam satu tempat.
      </p>

      <nav
        className="tabs tabs--desktop"
        aria-label="Menu utama"
        role="tablist"
        onKeyDown={onTabsKeyDown}
      >
        {TAB_ITEMS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            className={
              `tabs__btn${tab === id ? ' tabs__btn--active' : ''}`
            }
            onClick={() => onTabChange(id)}
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  )
}
