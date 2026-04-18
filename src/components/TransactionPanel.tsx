import { useState, type FormEvent } from 'react'
import {
  invoicePreviewSummary,
  resolveDraftLines,
} from '../lib/draftTx'
import type { DraftLine, Patient, Product } from '../lib/types'
import { useFlash } from '../hooks/useFlash'
import { FlashBanner } from './FlashBanner'
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
  const { message, flash } = useFlash()

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
    flash('Transaksi berhasil. Invoice bisa dicek di Laporan.')
    setDraftLines([emptyLine()])
    setPatientId('')
  }

  const { rows: previewRows, total: previewTotal } =
    invoicePreviewSummary(draftLines, productById)

  const missingMaster = patients.length === 0 || products.length === 0

  const canSubmit =
    !!patient &&
    resolveDraftLines(draftLines, productById).length > 0

  return (
    <section className="panel" aria-labelledby="h-tx">
      <FlashBanner message={message} />

      <h2 id="h-tx">Transaksi</h2>
      <p className="panel__hint">
        Nomor invoice otomatis <strong>INV-YYMM####</strong>.
      </p>

      {missingMaster ? (
        <div className="panel__warn panel__warn--rich">
          <strong>Langkah berikutnya:</strong> tambah minimal satu barang (
          tab Daftar barang) dan satu pasien (tab Data pasien).
        </div>
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
          submitDisabled={!canSubmit}
        />
      )}

      {!missingMaster && patientId && previewRows.length === 0 && (
        <p className="panel__microcopy" role="note">
          Pilih barang di setiap baris; pratinjau invoice terisi otomatis.
        </p>
      )}

      <InvoicePreview
        patient={patient}
        rows={previewRows}
        previewTotal={previewTotal}
      />
    </section>
  )
}
