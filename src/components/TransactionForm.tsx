import type { FormEvent } from 'react'
import { useMemo } from 'react'
import type { DraftLine, Patient, Product } from '../lib/types'
import { SearchableSelect } from './SearchableSelect'
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
  const patientItems = useMemo(
    () =>
      patients.map((p) => ({
        value: p.id,
        label: `${p.id} — ${p.name}`,
      })),
    [patients],
  )

  return (
    <form className="tx-form" onSubmit={onSubmit} noValidate>
      <label className="field" htmlFor="tx-patient">
        <span>Pasien</span>
        <SearchableSelect
          id="tx-patient"
          value={patientId}
          onChange={onPatientId}
          items={patientItems}
          emptyOptionLabel="— Pilih pasien —"
          placeholder="— Pilih pasien —"
          disabled={patients.length === 0}
        />
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
