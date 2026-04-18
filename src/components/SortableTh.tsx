import type { TableSortState } from '../hooks/useTableSort'

type Props<K extends string> = {
  label: string
  sortKey: K
  sort: TableSortState<K>
  onSort: () => void
  alignEnd?: boolean
}

export function SortableTh<K extends string>({
  label,
  sortKey,
  sort,
  onSort,
  alignEnd,
}: Props<K>) {
  const active = sort?.key === sortKey
  const ariaSort:
    | 'none'
    | 'ascending'
    | 'descending' =
    !active || !sort ? 'none' : sort.dir === 'asc'
      ? 'ascending'
      : 'descending'

  const arrowGlyph =
    sort?.key === sortKey
      ? sort.dir === 'asc'
        ? '↑'
        : '↓'
      : '↕'

  const srHint =
    sort?.key === sortKey
      ? `, urut ${sort.dir === 'asc' ? 'naik' : 'turun'}`
      : ', aktifkan untuk mengurutkan'

  return (
    <th scope="col" aria-sort={ariaSort} className={alignEnd ? 'num' : ''}>
      <button
        type="button"
        className={`th-sort${active ? ' th-sort--active' : ''}`}
        onClick={onSort}
      >
        <span className="th-sort__label">{label}</span>{' '}
        <span className="th-sort__arrows" aria-hidden>
          {arrowGlyph}
        </span>
        <span className="sr-only">{srHint}</span>
      </button>
    </th>
  )
}
