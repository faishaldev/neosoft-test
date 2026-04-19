import { TAB_ITEMS, type Tab } from './tabs'

export const TAB_QUERY_KEY = 'tab'

const allowed = new Set<string>(TAB_ITEMS.map((x) => x.id))

export function parseTabFromLocation(): Tab {
  const raw = new URLSearchParams(window.location.search).get(
    TAB_QUERY_KEY,
  )
  if (raw && allowed.has(raw)) return raw as Tab
  return 'barang'
}

export function writeTabToUrl(tab: Tab): void {
  const url = new URL(window.location.href)
  url.searchParams.set(TAB_QUERY_KEY, tab)
  const next = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState(null, '', next)
}

export function subscribeTabFromUrl(onChange: (t: Tab) => void): () => void {
  const run = () => onChange(parseTabFromLocation())
  window.addEventListener('popstate', run)
  return () => window.removeEventListener('popstate', run)
}
