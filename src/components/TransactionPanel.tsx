import { useMemo, useState, type FormEvent } from 'react'
import {
  invoicePreviewSummary,
  resolveDraftLines,
} from '../lib/draftTx'
import type { DraftLine, Patient, Product } from '../lib/types'
import { useFlash } from '../hooks/useFlash'
import {
  addDraftLine,
  getSubmitError,
  removeDraftLine,
  WARN_MASTER,
  emptyLine,
  MESSAGES,
  updateDraftLine,
} from './transactionPanelHelpers'
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

  function updateRow(index: number, patch: Partial<DraftLine>) {
    setDraftLines((rows) => updateDraftLine(rows, index, patch))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const resolved = resolveDraftLines(draftLines, productById)
    const submitError = getSubmitError(
      patientId,
      Boolean(patient),
      resolved.length,
    )

    if (submitError || !patient) {
      flash(submitError ?? MESSAGES.invalidPatient, 'error')
      return
    }

    onSubmit(patient, resolved)
    flash(MESSAGES.success)
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
          {WARN_MASTER}
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
              setDraftLines((rows) => removeDraftLine(rows, i))
            }
            onAddRow={() => setDraftLines((rows) => addDraftLine(rows))}
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
