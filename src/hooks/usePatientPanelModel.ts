import {
  useCallback,
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import type { Patient } from '../lib/types'
import type { PatientFieldErrors } from '../lib/master/formErrors'
import { IMPORT_READ_FAIL } from '../lib/importMessages'
import { readImportFileText } from '../lib/readImportFile'
import {
  downloadPatientsExport,
  formatPatientImportErrorToast,
  parsePatientsImport,
} from '../lib/importExport/patientsIo'
import type { PatientSortKey } from '../lib/master/sortKeys'
import { patientSearchCells } from '../lib/master/patientSearchCells'
import { sortPatients } from '../lib/master/sortPatients'
import { useEscapeCancel } from './useEscapeCancel'
import { useFlash } from './useFlash'
import { useTableSort } from './useTableSort'
import {
  normalizePhoneId,
  validatePatientName,
  validatePhoneId,
} from '../utils/validation'
import { rowMatchesSearch } from '../utils/tableSearch'

export type PatientPanelModelProps = {
  patients: Patient[]
  onAdd: (name: string, phone: string) => void
  onImportPatients: (rows: { name: string; phone: string }[]) => void
  onUpdatePatient: (id: string, name: string, phone: string) => void
  onSetPatientArchived: (id: string, archived: boolean) => void
}

export function usePatientPanelModel({
  patients,
  onAdd,
  onImportPatients,
  onUpdatePatient,
  onSetPatientArchived,
}: PatientPanelModelProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<PatientFieldErrors>({})
  const [tableSearch, setTableSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const { message, variant, flash, clear } = useFlash()
  const { sort, toggle } = useTableSort<PatientSortKey>()

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setEditName('')
    setEditPhone('')
  }, [])

  useEscapeCancel(editingId !== null, cancelEdit)

  const filteredPatients = useMemo(() => {
    if (!tableSearch.trim()) return patients
    return patients.filter((p) =>
      rowMatchesSearch(patientSearchCells(p), tableSearch),
    )
  }, [patients, tableSearch])

  const sorted = useMemo(
    () => sortPatients(filteredPatients, sort),
    [filteredPatients, sort],
  )

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nameErr = validatePatientName(name)
    const phoneErr = validatePhoneId(phone)
    const next: PatientFieldErrors = {}
    if (nameErr) next.name = nameErr
    if (phoneErr) next.phone = phoneErr
    setErrors(next)
    if (nameErr || phoneErr) {
      flash([nameErr, phoneErr].filter(Boolean).join(' '), 'error')
      return
    }
    onAdd(name.trim(), normalizePhoneId(phone))
    flash('Pasien berhasil ditambahkan.')
    setName('')
    setPhone('')
    setErrors({})
  }

  function startEdit(p: Patient) {
    setEditingId(p.id)
    setEditName(p.name)
    setEditPhone(p.phone ?? '')
  }

  function saveEdit() {
    if (!editingId) return
    const nameErr = validatePatientName(editName)
    const phoneErr = validatePhoneId(editPhone)
    if (nameErr || phoneErr) {
      flash([nameErr, phoneErr].filter(Boolean).join(' '), 'error')
      return
    }
    onUpdatePatient(editingId, editName.trim(), normalizePhoneId(editPhone))
    flash('Pasien diperbarui.')
    cancelEdit()
  }

  async function handleImportFile(file: File) {
    const read = await readImportFileText(file)
    if (!read.ok) {
      flash(IMPORT_READ_FAIL, 'error')
      return
    }
    const result = parsePatientsImport(read.text, file.name)
    if (result.ok === false) {
      flash(formatPatientImportErrorToast(result.errors), 'error')
      return
    }
    onImportPatients(result.rows)
    const n = result.rows.length
    flash(
      n === 1
        ? '1 pasien berhasil diimpor (ID & nomor urut baru).'
        : `${n} pasien berhasil diimpor (ID & nomor urut baru).`,
    )
  }

  function toggleArchive(p: Patient) {
    const next = !p.archived
    onSetPatientArchived(p.id, next)
    flash(
      next
        ? 'Pasien diarsipkan (tidak dipilih di Transaksi).'
        : 'Pasien ditampilkan lagi di Transaksi.',
    )
    if (editingId === p.id) cancelEdit()
  }

  return {
    patients,
    message,
    variant,
    clearFlash: clear,
    name,
    phone,
    errors,
    setName,
    setPhone,
    setErrors,
    tableSearch,
    setTableSearch,
    filteredPatients,
    sorted,
    sort,
    toggle,
    editingId,
    editName,
    editPhone,
    setEditName,
    setEditPhone,
    handleSubmit,
    startEdit,
    saveEdit,
    cancelEdit,
    handleImportFile,
    toggleArchive,
    exportJson: () => downloadPatientsExport(patients, 'json'),
    exportCsv: () => downloadPatientsExport(patients, 'csv'),
  }
}
