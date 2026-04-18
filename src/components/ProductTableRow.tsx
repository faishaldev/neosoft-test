import type { Product } from '../lib/types'
import { formatIdr } from '../utils/format'
import { TableInlineActions } from './TableInlineActions'
import { rowStatusClass } from '../utils/rowStatusClass'

type Props = {
  p: Product
  editing: boolean
  editName: string
  editPrice: string
  interactionLocked: boolean
  onChangeEditName: (v: string) => void
  onChangeEditPrice: (v: string) => void
  onStartEdit: (p: Product) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onToggleArchive: (p: Product) => void
}

export function ProductTableRow({
  p,
  editing,
  editName,
  editPrice,
  interactionLocked,
  onChangeEditName,
  onChangeEditPrice,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleArchive,
}: Props) {
  return (
    <tr className={rowStatusClass(p.archived, editing)}>
      <td className="num">{p.serialNo}</td>
      <td className="product-cell">
        {editing ? (
          <div className="product-cell--edit-row">
            <span className="product-cell__code-chip mono">{p.id}</span>
            <label className="sr-only" htmlFor={`edit-name-${p.id}`}>
              Nama barang
            </label>
            <input
              id={`edit-name-${p.id}`}
              className="table-edit-input table-edit-input--flex"
              autoComplete="off"
              value={editName}
              onChange={(ev) => onChangeEditName(ev.target.value)}
            />
          </div>
        ) : (
          <div className="product-cell product-cell--inline">
            <span className="product-cell__code">{p.id}</span>
            <span className="product-cell__sep" aria-hidden="true">
              ·
            </span>
            <span className="product-cell__name">{p.name}</span>
            {p.archived ? (
              <span className="badge badge--muted">Arsip</span>
            ) : null}
          </div>
        )}
      </td>
      <td className="num table-cell--money">
        {editing ? (
          <>
            <label className="sr-only" htmlFor={`edit-price-${p.id}`}>
              Harga
            </label>
            <input
              id={`edit-price-${p.id}`}
              className={
                'table-edit-input table-edit-input--num ' +
                'table-edit-input--money'
              }
              inputMode="numeric"
              autoComplete="off"
              value={editPrice}
              onChange={(ev) => onChangeEditPrice(ev.target.value)}
            />
          </>
        ) : (
          formatIdr(p.price)
        )}
      </td>
      <td className="table-actions-cell">
        <TableInlineActions
          editing={editing}
          disableEdit={interactionLocked}
          disableArchive={interactionLocked}
          archived={Boolean(p.archived)}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
          onEdit={() => onStartEdit(p)}
          onToggleArchive={() => onToggleArchive(p)}
        />
      </td>
    </tr>
  )
}
