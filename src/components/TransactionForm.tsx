import type { FormEvent } from 'react'
import type { DraftLine, Patient, Product } from '../lib/types'
import { TxLinesGrid } from './TxLinesGrid'

type Props = {
  patients: Patient[]
  patientId: string
  onPatientId: (id: string) => void
  draftLines: DraftLine[]
  products: Product[]
  onUpdateRow: (i: number, p: Partial<DraftLine>) => void
  onRemoveRow: (i: number) => void
  onAddRow: () => void
  onSubmit: (e: FormEvent) => void
  /** Tombol simpan nonaktif bila pasien/item belum valid. */
  submitDisabled?: boolean
}

export function TransactionForm({
  patients,
  patientId,
  onPatientId,
  draftLines,
  products,
  onUpdateRow,
  onRemoveRow,
  onAddRow,
  onSubmit,
  submitDisabled = false,
}: Props) {
  return (
    <form className="tx-form" onSubmit={onSubmit}>
      <label className="field field--block">
        <span>Pasien</span>
        <select
          value={patientId}
          onChange={(ev) => onPatientId(ev.target.value)}
          required
        >
          <option value="">— Pilih pasien —</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id} — {p.name}
            </option>
          ))}
        </select>
      </label>

      <TxLinesGrid
        draftLines={draftLines}
        products={products}
        onUpdate={onUpdateRow}
        onRemove={onRemoveRow}
      />

      <div className="tx-actions">
        <button type="button" className="btn" onClick={onAddRow}>
          + Baris
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={submitDisabled}
          title={
            submitDisabled
              ? 'Pilih pasien dan minimal satu barang dengan jumlah valid'
              : undefined
          }
        >
          Simpan transaksi
        </button>
      </div>
    </form>
  )
}
