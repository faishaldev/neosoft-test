import { TAB_ITEMS, type Tab } from './tabs'

export const TAB_QUERY_KEY = 'tab'

const allowedTabIds = new Set<string>(
  TAB_ITEMS.map((tabItem) => tabItem.id),
)

export function parseTabFromLocation(): Tab {
  const raw = new URLSearchParams(window.location.search).get(
    TAB_QUERY_KEY,
  )
  if (raw && allowedTabIds.has(raw)) return raw as Tab
  return 'barang'
}

export function writeTabToUrl(tab: Tab): void {
  const url = new URL(window.location.href)
  url.searchParams.set(TAB_QUERY_KEY, tab)
  const nextUrl = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState(null, '', nextUrl)
}

export function subscribeTabFromUrl(
  onChange: (tab: Tab) => void,
): () => void {
  const emitCurrentTab = () => onChange(parseTabFromLocation())
  window.addEventListener('popstate', emitCurrentTab)
  return () =>
    window.removeEventListener('popstate', emitCurrentTab)
}
