import { useMemo } from 'react'
import type { InvoicePreviewRow } from '../lib/draftTx'
import type { Patient } from '../lib/types'
import { usePagedSlice } from '../hooks/usePagedSlice'
import {
  useTableSort,
  type TableSortState,
} from '../hooks/useTableSort'
import { formatDateId, formatIdr } from '../utils/format'
import { SortableTh } from './SortableTh'
import { TablePagination } from './TablePagination'

type SortKey = 'name' | 'price' | 'qty' | 'sub'

type Props = {
  patient: Patient | undefined
  rows: InvoicePreviewRow[]
  previewTotal: number
}

type InvoicePreviewPagedProps = {
  rows: InvoicePreviewRow[]
  sortedRows: InvoicePreviewRow[]
  sort: TableSortState<SortKey> | null
  toggle: (key: SortKey) => void
  previewTotal: number
}

function InvoicePreviewPaged({
  rows,
  sortedRows,
  sort,
  toggle,
  previewTotal,
}: InvoicePreviewPagedProps) {
  const pageData = usePagedSlice(sortedRows)
  return (
    <div className="invoice__table-scroll">
      <table className="invoice__table">
        <caption className="sr-only">
          Baris invoice; kolom dapat diurutkan dari header.
        </caption>
        <thead>
          <tr>
            <SortableTh
              label="Item yang dibeli"
              sortKey="name"
              sort={sort}
              onSort={() => toggle('name')}
            />
            <SortableTh
              label="harga"
              sortKey="price"
              sort={sort}
              onSort={() => toggle('price')}
              alignEnd
            />
            <SortableTh
              label="Jumlah"
              sortKey="qty"
              sort={sort}
              onSort={() => toggle('qty')}
              alignEnd
            />
            <SortableTh
              label="SUBTOTAL"
              sortKey="sub"
              sort={sort}
              onSort={() => toggle('sub')}
              alignEnd
            />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="empty">
                Tambahkan barang untuk melihat baris.
              </td>
            </tr>
          ) : (
            pageData.slice.map((r, i) => (
              <tr key={`${r.name}-${r.price}-${r.qty}-${i}`}>
                <td>{r.name}</td>
                <td className="num">{formatIdr(r.price)}</td>
                <td className="num">{r.qty}</td>
                <td className="num">{formatIdr(r.sub)}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="invoice__total-label">
              TOTAL
            </td>
            <td className="num invoice__total-val">
              {formatIdr(previewTotal)}
            </td>
          </tr>
        </tfoot>
      </table>
      <TablePagination
        page={pageData.page}
        totalPages={pageData.totalPages}
        totalItems={pageData.total}
        pageSize={pageData.pageSize}
        onPageChange={pageData.setPage}
      />
    </div>
  )
}

export function InvoicePreview({
  patient,
  rows,
  previewTotal,
}: Props) {
  const today = formatDateId(new Date().toISOString())
  const { sort, toggle } = useTableSort<SortKey>()

  const sortedRows = useMemo(() => {
    if (!sort) return rows
    const m = [...rows]
    m.sort((a, b) => {
      let c = 0
      if (sort.key === 'name') {
        c = a.name.localeCompare(b.name, 'id-ID')
      } else if (sort.key === 'price') {
        c = a.price - b.price
      } else if (sort.key === 'qty') {
        c = a.qty - b.qty
      } else {
        c = a.sub - b.sub
      }
      return sort.dir === 'asc' ? c : -c
    })
    return m
  }, [rows, sort])

  const rowsKey = useMemo(
    () =>
      rows
        .map((r) => `${r.name}\t${r.price}\t${r.qty}\t${r.sub}`)
        .join('\n'),
    [rows],
  )

  return (
    <div className="invoice">
      <h3 className="invoice__title">Pratinjau invoice</h3>
      <div className="invoice__hdr">
        <div>
          <div>
            <span className="lbl">no Invoice :</span>{' '}
            <span className="mono">(dibuat saat simpan)</span>
          </div>
          <div>
            <span className="lbl">tanggal</span> {today}
          </div>
        </div>
        <div>
          <div>
            <span className="lbl">ID pasien</span>{' '}
            <span className="mono">{patient?.id ?? '—'}</span>
          </div>
          <div>
            <span className="lbl">nama pasien</span>{' '}
            {patient?.name ?? '—'}
          </div>
        </div>
      </div>

      <InvoicePreviewPaged
        key={rowsKey}
        rows={rows}
        sortedRows={sortedRows}
        sort={sort}
        toggle={toggle}
        previewTotal={previewTotal}
      />
    </div>
  )
}
