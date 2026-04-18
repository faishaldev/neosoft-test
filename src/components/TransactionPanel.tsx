import { useMemo, useState, type FormEvent } from 'react'
import {
  invoicePreviewSummary,
  resolveDraftLines,
} from '../lib/draftTx'
import type { DraftLine, Patient, Product } from '../lib/types'
import { useFlash } from '../hooks/useFlash'
import { Toast } from './Toast'
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
  const { message, variant, flash, clear } = useFlash()

  const patient = patients.find((p) => p.id === patientId)

  function updateRow(i: number, patch: Partial<DraftLine>) {
    setDraftLines((rows) =>
      rows.map((r, j) => (j === i ? { ...r, ...patch } : r)),
    )
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!patientId) {
      flash('Pilih pasien terlebih dahulu.', 'error')
      return
    }
    if (!patient) {
      flash('Pasien tidak valid; pilih ulang dari daftar.', 'error')
      return
    }
    const resolved = resolveDraftLines(draftLines, productById)
    if (resolved.length === 0) {
      flash(
        'Pilih minimal satu barang dan pastikan jumlah minimal 1.',
        'error',
      )
      return
    }
    onSubmit(patient, resolved)
    flash('Transaksi berhasil. Invoice bisa dicek di Laporan.')
    setDraftLines([emptyLine()])
    setPatientId('')
  }

  const { rows: previewRows, total: previewTotal } =
    invoicePreviewSummary(draftLines, productById)

  const activeProducts = useMemo(
    () => products.filter((p) => !p.archived),
    [products],
  )
  const activePatients = useMemo(
    () => patients.filter((p) => !p.archived),
    [patients],
  )

  const missingMaster =
    activePatients.length === 0 || activeProducts.length === 0

  return (
    <section className="panel" aria-labelledby="h-tx">
      <Toast message={message} onDismiss={clear} variant={variant} />

      <h2 id="h-tx">Transaksi</h2>
      <p className="panel__hint">
        Nomor invoice otomatis <strong>INV-YYMM####</strong>.
      </p>

      {missingMaster ? (
        <div className="panel__warn panel__warn--tx no-print">
          Tambah minimal satu barang (
          tab Daftar barang) dan satu pasien (tab Data pasien).
        </div>
      ) : (
        <div className="no-print">
          <TransactionForm
            patients={activePatients}
            patientId={patientId}
            onPatientId={setPatientId}
            draftLines={draftLines}
            products={activeProducts}
            onUpdateRow={updateRow}
            onRemoveRow={(i) =>
              setDraftLines((rows) => rows.filter((_, j) => j !== i))
            }
            onAddRow={() =>
              setDraftLines((rows) => [...rows, emptyLine()])
            }
            onSubmit={handleSubmit}
          />
        </div>
      )}
      {!missingMaster && (
        <InvoicePreview
          patient={patient}
          rows={previewRows}
          previewTotal={previewTotal}
        />
      )}
    </section>
  )
}
