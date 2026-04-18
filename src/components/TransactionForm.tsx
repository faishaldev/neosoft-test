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
}: Props) {
  return (
    <form className="tx-form" onSubmit={onSubmit} noValidate>
      <label className="field">
        <span>Pasien</span>
        <select
          id="tx-patient"
          value={patientId}
          onChange={(ev) => onPatientId(ev.target.value)}
        >
          <option value="">— Pilih pasien —</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id} — {p.name}
            </option>
          ))}
        </select>
      </label>

      <div className="tx-lines-section">
        <TxLinesGrid
          draftLines={draftLines}
          products={products}
          onUpdate={onUpdateRow}
          onRemove={onRemoveRow}
        />
      </div>

      <div className="tx-actions">
        <button type="button" className="btn" onClick={onAddRow}>
          + Baris
        </button>
        <button type="submit" className="btn btn--primary">
          Simpan transaksi
        </button>
      </div>
    </form>
  )
}
