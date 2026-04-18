import type { Patient } from '../lib/types'
import { TableInlineActions } from './TableInlineActions'
import { rowStatusClass } from '../utils/rowStatusClass'

type Props = {
  p: Patient
  editing: boolean
  editingAny: boolean
  editName: string
  editPhone: string
  onChangeEditName: (v: string) => void
  onChangeEditPhone: (v: string) => void
  onStartEdit: (p: Patient) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onToggleArchive: (p: Patient) => void
}

export function PatientTableRow({
  p,
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
    <tr className={rowStatusClass(p.archived, editing)}>
      <td className="num">{p.serialNo}</td>
      <td className="mono">{p.id}</td>
      <td>
        {editing ? (
          <>
            <label className="sr-only" htmlFor={`edit-p-name-${p.id}`}>
              Nama pasien
            </label>
            <input
              id={`edit-p-name-${p.id}`}
              className="table-edit-input"
              autoComplete="name"
              value={editName}
              onChange={(ev) => onChangeEditName(ev.target.value)}
            />
          </>
        ) : (
          <span className="patient-cell__name">
            {p.name}
            {p.archived ? (
              <span className="badge badge--muted"> Arsip</span>
            ) : null}
          </span>
        )}
      </td>
      <td>
        {editing ? (
          <>
            <label className="sr-only" htmlFor={`edit-p-phone-${p.id}`}>
              Telepon
            </label>
            <input
              id={`edit-p-phone-${p.id}`}
              className="table-edit-input"
              inputMode="tel"
              autoComplete="tel"
              value={editPhone}
              onChange={(ev) => onChangeEditPhone(ev.target.value)}
            />
          </>
        ) : (
          p.phone || '—'
        )}
      </td>
      <td className="table-actions-cell">
        <TableInlineActions
          editing={editing}
          disableArchive={editingAny}
          archived={Boolean(p.archived)}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
          onEdit={() => onStartEdit(p)}
          onToggleArchive={() => onToggleArchive(p)}
        />
      </td>
    </tr>
  )
}
