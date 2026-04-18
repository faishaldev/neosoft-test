import type { Patient } from '../types'
import type { PatientSortKey } from './sortKeys'
import type { ActiveSort } from './sortProducts'

export function sortPatients(
  items: Patient[],
  sort: ActiveSort<PatientSortKey>,
): Patient[] {
  if (!sort) return items
  const m = [...items]
  m.sort((a, b) => {
    let c = 0
    if (sort.key === 'no') c = a.serialNo - b.serialNo
    else if (sort.key === 'id') c = a.id.localeCompare(b.id, 'id-ID')
    else if (sort.key === 'name') {
      c = a.name.localeCompare(b.name, 'id-ID')
    } else {
      c = (a.phone || '').localeCompare(b.phone || '', 'id-ID')
    }
    return sort.dir === 'asc' ? c : -c
  })
  return m
}
