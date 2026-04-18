import { useMemo } from 'react'
import type { DraftLine, Product } from '../lib/types'
import { formatIdr } from '../utils/format'
import { SearchableSelect } from './SearchableSelect'

const QTY_MAX = 999_999

type Props = {
  draftLines: DraftLine[]
  products: Product[]
  onUpdate: (index: number, patch: Partial<DraftLine>) => void
  onRemove: (index: number) => void
}

export function TxLinesGrid({
  draftLines,
  products,
  onUpdate,
  onRemove,
}: Props) {
  const productItems = useMemo(
    () =>
      products.map((p) => ({
        value: p.id,
        label: `${p.name} (${formatIdr(p.price)})`,
      })),
    [products],
  )

  function setQty(i: number, raw: string) {
    const n = Number(raw)
    if (raw === '' || Number.isNaN(n)) {
      onUpdate(i, { qty: 1 })
      return
    }
    const q = Math.min(QTY_MAX, Math.max(1, Math.floor(n)))
    onUpdate(i, { qty: q })
  }

  return (
    <div className="tx-lines">
      <div className="tx-lines__head">
        <span className="tx-lines__head-item">Item</span>
        <span className="tx-lines__head-qty">Jumlah</span>
        <span className="tx-lines__head-actions" aria-hidden="true" />
      </div>
      {draftLines.map((row, i) => (
        <div key={i} className="tx-line">
          <SearchableSelect
            value={row.productId}
            onChange={(productId) => onUpdate(i, { productId })}
            items={productItems}
            emptyOptionLabel="— Barang —"
            placeholder="— Barang —"
            ariaLabel={`Barang baris ${i + 1}`}
            disabled={products.length === 0}
          />
          <input
            className="qty"
            type="number"
            min={1}
            max={QTY_MAX}
            step={1}
            value={row.qty}
            onChange={(ev) => setQty(i, ev.target.value)}
            aria-label={`Jumlah baris ${i + 1}`}
          />
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => onRemove(i)}
            disabled={draftLines.length <= 1}
            aria-label="Hapus baris"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
