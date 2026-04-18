import { useEffect, useMemo, useReducer } from 'react'
import { mapProductsById } from '../lib/maps'
import { appReducer } from '../lib/reducer'
import {
  aggregateByProduct,
  omzetTotal,
} from '../lib/salesMetrics'
import { emptyState, loadState, saveState } from '../lib/storage'

export function useAppData() {
  const [data, dispatch] = useReducer(appReducer, emptyState, loadState)

  useEffect(() => {
    saveState(data)
  }, [data])

  const productById = useMemo(
    () => mapProductsById(data.products),
    [data.products],
  )

  const salesByProduct = useMemo(
    () => aggregateByProduct(data.transactions),
    [data.transactions],
  )

  const grandTotal = useMemo(
    () => omzetTotal(data.transactions),
    [data.transactions],
  )

  return {
    data,
    dispatch,
    productById,
    salesByProduct,
    grandTotal,
  } as const
}
