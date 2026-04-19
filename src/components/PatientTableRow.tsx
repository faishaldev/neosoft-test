import type { Patient } from '../lib/types'
import { TableInlineActions } from './TableInlineActions'
import { rowStatusClass } from '../utils/rowStatusClass'

type Props = {
  patient: Patient
  editing: boolean
  editingAny: boolean
  editName: string
  editPhone: string
  onChangeEditName: (v: string) => void
  onChangeEditPhone: (v: string) => void
  onStartEdit: (patient: Patient) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onToggleArchive: (patient: Patient) => void
}

export function PatientTableRow({
  patient,
  editing,
  editingAny,
  editName,
  editPhone,
  onChangeEditName,
  onChangeEditPhone,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleArchive,
}: Props) {
  return (
    <tr className={rowStatusClass(patient.archived, editing)}>
      <td className="num">{patient.serialNo}</td>
      <td className="mono">{patient.id}</td>
      <td>
        {editing ? (
          <>
            <label className="sr-only" htmlFor={`edit-p-name-${patient.id}`}>
              Nama pasien
            </label>
            <input
              id={`edit-p-name-${patient.id}`}
              className="table-edit-input"
              autoComplete="name"
              value={editName}
              onChange={(ev) => onChangeEditName(ev.target.value)}
            />
          </>
        ) : (
          <span className="patient-cell__name">
            {patient.name}
            {patient.archived ? (
              <span className="badge badge--muted"> Arsip</span>
            ) : null}
          </span>
        )}
      </td>
      <td>
        {editing ? (
          <>
            <label className="sr-only" htmlFor={`edit-p-phone-${patient.id}`}>
              Telepon
            </label>
            <input
              id={`edit-p-phone-${patient.id}`}
              className="table-edit-input"
              inputMode="tel"
              autoComplete="tel"
              value={editPhone}
              onChange={(ev) => onChangeEditPhone(ev.target.value)}
            />
          </>
        ) : (
          patient.phone || '—'
        )}
      </td>
      <td className="table-actions-cell">
        <TableInlineActions
          editing={editing}
          disableArchive={editingAny}
          archived={Boolean(patient.archived)}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
          onEdit={() => onStartEdit(patient)}
          onToggleArchive={() => onToggleArchive(patient)}
        />
      </td>
    </tr>
  )
}
