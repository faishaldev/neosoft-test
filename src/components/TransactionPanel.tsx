import { useState, type FormEvent } from 'react'
import {
  invoicePreviewSummary,
  resolveDraftLines,
} from '../lib/draftTx'
import type { DraftLine, Patient, Product } from '../lib/types'
import { InvoicePreview } from './InvoicePreview'
import { TransactionForm } from './TransactionForm'

type Props = {
  patients: Patient[]
  products: Product[]
  productById: Map<string, Product>
  onSubmit: (
    patient: Patient,
    lines: { product: Product; qty: number }[],
  ) => void
}

const emptyLine = (): DraftLine => ({ productId: '', qty: 1 })

export function TransactionPanel({
  patients,
  products,
  productById,
  onSubmit,
}: Props) {
  const [patientId, setPatientId] = useState('')
  const [draftLines, setDraftLines] = useState<DraftLine[]>([
    emptyLine(),
  ])

  const patient = patients.find((p) => p.id === patientId)

  function updateRow(i: number, patch: Partial<DraftLine>) {
    setDraftLines((rows) =>
      rows.map((r, j) => (j === i ? { ...r, ...patch } : r)),
    )
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!patient) return
    const resolved = resolveDraftLines(draftLines, productById)
    if (resolved.length === 0) return
    onSubmit(patient, resolved)
    setDraftLines([emptyLine()])
    setPatientId('')
  }

  const { rows: previewRows, total: previewTotal } =
    invoicePreviewSummary(draftLines, productById)

  const missingMaster = patients.length === 0 || products.length === 0

  return (
    <section className="panel" aria-labelledby="h-tx">
      <h2 id="h-tx">Transaksi</h2>
      <p className="panel__hint">
        Pilih pasien dan item; nomor invoice format{' '}
        <strong>INV-YYMM####</strong>.
      </p>

      {missingMaster ? (
        <p className="panel__warn">
          Lengkapi minimal satu barang dan satu pasien di tab lain terlebih
          dahulu.
        </p>
      ) : (
        <TransactionForm
          patients={patients}
          patientId={patientId}
          onPatientId={setPatientId}
          draftLines={draftLines}
          products={products}
          onUpdateRow={updateRow}
          onRemoveRow={(i) =>
            setDraftLines((rows) => rows.filter((_, j) => j !== i))
          }
          onAddRow={() =>
            setDraftLines((rows) => [...rows, emptyLine()])
          }
          onSubmit={handleSubmit}
        />
      )}

      <InvoicePreview
        patient={patient}
        rows={previewRows}
        previewTotal={previewTotal}
      />
    </section>
  )
}
