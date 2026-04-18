import { useCallback, useEffect, useState } from 'react'
import type { Tab } from '../lib/tabs'
import {
  parseTabFromLocation,
  subscribeTabFromUrl,
  TAB_QUERY_KEY,
  writeTabToUrl,
} from '../lib/tabUrl'

export function useSyncedTab(): readonly [Tab, (t: Tab) => void] {
  const [tab, setTabState] = useState<Tab>(() =>
    parseTabFromLocation(),
  )

  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get(TAB_QUERY_KEY) !== tab) {
      writeTabToUrl(tab)
    }
  }, [tab])

  useEffect(() => subscribeTabFromUrl(setTabState), [])

  const setTab = useCallback((t: Tab) => {
    setTabState(t)
  }, [])

  return [tab, setTab] as const
}
