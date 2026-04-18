import type { DraftLine, Product } from '../lib/types'
import { formatIdr } from '../utils/format'

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
  return (
    <div className="tx-lines">
      <div className="tx-lines__head">
        <span>Item</span>
        <span className="num">Jumlah</span>
        <span />
      </div>
      {draftLines.map((row, i) => (
        <div key={i} className="tx-line">
          <select
            value={row.productId}
            onChange={(ev) =>
              onUpdate(i, { productId: ev.target.value })
            }
            required={i === 0}
          >
            <option value="">— Barang —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({formatIdr(p.price)})
              </option>
            ))}
          </select>
          <input
            className="qty"
            type="number"
            min={1}
            value={row.qty}
            onChange={(ev) =>
              onUpdate(i, { qty: Number(ev.target.value) })
            }
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
