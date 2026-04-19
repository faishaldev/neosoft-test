import type { Product } from '../lib/types'
import { formatIdr } from '../utils/format'
import { TableInlineActions } from './TableInlineActions'
import { rowStatusClass } from '../utils/rowStatusClass'

type Props = {
  product: Product
  editing: boolean
  editName: string
  editPrice: string
  interactionLocked: boolean
  onChangeEditName: (v: string) => void
  onChangeEditPrice: (v: string) => void
  onStartEdit: (product: Product) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onToggleArchive: (product: Product) => void
}

export function ProductTableRow({
  product,
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
    <tr className={rowStatusClass(product.archived, editing)}>
      <td className="num">{product.serialNo}</td>
      <td>
        <span className="product-cell__code">{product.id}</span>
      </td>
      <td>
        {editing ? (
          <>
            <label className="sr-only" htmlFor={`edit-name-${product.id}`}>
              Nama barang
            </label>
            <input
              id={`edit-name-${product.id}`}
              className="table-edit-input"
              autoComplete="off"
              value={editName}
              onChange={(ev) => onChangeEditName(ev.target.value)}
            />
          </>
        ) : (
          <span className="product-cell__name">
            {product.name}
            {product.archived ? (
              <span className="badge badge--muted">Arsip</span>
            ) : null}
          </span>
        )}
      </td>
      <td className="num table-cell--money">
        {editing ? (
          <>
            <label className="sr-only" htmlFor={`edit-price-${product.id}`}>
              Harga
            </label>
            <input
              id={`edit-price-${product.id}`}
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
          formatIdr(product.price)
        )}
      </td>
      <td className="table-actions-cell">
        <TableInlineActions
          editing={editing}
          disableEdit={interactionLocked}
          disableArchive={interactionLocked}
          archived={Boolean(product.archived)}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
          onEdit={() => onStartEdit(product)}
          onToggleArchive={() => onToggleArchive(product)}
        />
      </td>
    </tr>
  )
}
