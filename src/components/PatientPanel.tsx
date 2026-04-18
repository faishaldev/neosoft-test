import { useMemo, useState, type FormEvent } from 'react'
import type { Patient } from '../lib/types'
import { useFlash } from '../hooks/useFlash'
import { useTableSort } from '../hooks/useTableSort'
import {
  normalizePhoneId,
  validatePatientName,
  validatePhoneId,
} from '../utils/validation'
import {
  downloadPatientsExport,
  formatPatientImportErrorToast,
  parsePatientsImport,
} from '../lib/importExport/patientsIo'
import { EmptyHint } from './EmptyHint'
import { MasterDataIoBar } from './MasterDataIoBar'
import { TableSearchBar } from './TableSearchBar'
import { Toast } from './Toast'
import { SortableTh } from './SortableTh'
import { rowMatchesSearch } from '../utils/tableSearch'

type SortKey = 'no' | 'id' | 'name' | 'phone'

type Props = {
  patients: Patient[]
  onAdd: (name: string, phone: string) => void
  onImportPatients: (rows: { name: string; phone: string }[]) => void
}

type FieldErrors = { name?: string; phone?: string }

export function PatientPanel({
  patients,
  onAdd,
  onImportPatients,
}: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [tableSearch, setTableSearch] = useState('')
  const { message, variant, flash, clear } = useFlash()
  const { sort, toggle } = useTableSort<SortKey>()

  const filteredPatients = useMemo(() => {
    if (!tableSearch.trim()) return patients
    return patients.filter((p) =>
      rowMatchesSearch(
        [
          String(p.serialNo),
          p.id,
          p.name,
          p.phone ?? '',
          p.phone ? p.phone.replace(/\D/g, '') : '',
        ],
        tableSearch,
      ),
    )
  }, [patients, tableSearch])

  const sorted = useMemo(() => {
    if (!sort) return filteredPatients
    const m = [...filteredPatients]
    m.sort((a, b) => {
      let c = 0
      if (sort.key === 'no') c = a.serialNo - b.serialNo
      else if (sort.key === 'id') {
        c = a.id.localeCompare(b.id, 'id-ID')
      } else if (sort.key === 'name') {
        c = a.name.localeCompare(b.name, 'id-ID')
      } else {
        const pa = a.phone || ''
        const pb = b.phone || ''
        c = pa.localeCompare(pb, 'id-ID')
      }
      return sort.dir === 'asc' ? c : -c
    })
    return m
  }, [filteredPatients, sort])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nameErr = validatePatientName(name)
    const phoneErr = validatePhoneId(phone)
    const next: FieldErrors = {}
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

  async function handleImportFile(file: File) {
    let text: string
    try {
      text = await file.text()
    } catch {
      flash(
        'Impor dibatalkan — berkas tidak bisa dibaca (coba lagi atau periksa izin).',
        'error',
      )
      return
    }
    const result = parsePatientsImport(text, file.name)
    if (!result.ok) {
      flash(formatPatientImportErrorToast(result.errors), 'error')
      return
    }
    onImportPatients(result.rows)
    flash(
      result.rows.length === 1
        ? '1 pasien berhasil diimpor (ID & nomor urut baru).'
        : `${result.rows.length} pasien berhasil diimpor (ID & nomor urut baru).`,
    )
  }

  return (
    <section className="panel" aria-labelledby="h-pasien">
      <Toast message={message} onDismiss={clear} variant={variant} />

      <h2 id="h-pasien">Data pasien</h2>

      <MasterDataIoBar
        ariaLabel="Ekspor dan impor data pasien"
        inputId="import-patients-file"
        hint="CSV dengan header nama,telepon (telepon boleh kosong). JSON mengikuti format ekspor. Tiap baris impor mendapat ID & No baru."
        onExportJson={() => downloadPatientsExport(patients, 'json')}
        onExportCsv={() => downloadPatientsExport(patients, 'csv')}
        onImportFile={handleImportFile}
      />

      <form className="form-card no-print" onSubmit={handleSubmit} noValidate>
        <div className="form-card__fields form-row form-row--balanced">
          <label className="field">
            <span>Nama pasien</span>
            <input
              id="patient-name"
              autoComplete="name"
              value={name}
              onChange={(ev) => {
                setName(ev.target.value)
                setErrors((prev) => ({ ...prev, name: undefined }))
              }}
              placeholder="Nama lengkap"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={
                errors.name ? 'err-patient-name' : undefined
              }
            />
            {errors.name ? (
              <span id="err-patient-name" className="sr-only">
                {errors.name}
              </span>
            ) : null}
          </label>
          <label className="field">
            <span>Telepon</span>
            <input
              id="patient-phone"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(ev) => {
                setPhone(ev.target.value)
                setErrors((prev) => ({ ...prev, phone: undefined }))
              }}
              placeholder="08xxxxxxxxxx (opsional)"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={
                errors.phone ? 'err-patient-phone' : undefined
              }
            />
            {errors.phone ? (
              <span id="err-patient-phone" className="sr-only">
                {errors.phone}
              </span>
            ) : null}
          </label>
          <div className="form-row__action">
            <span className="form-row__action-spacer" aria-hidden="true">
              &nbsp;
            </span>
            <button type="submit" className="btn btn--primary">
              Tambah pasien
            </button>
          </div>
        </div>
      </form>

      <div className="table-block">
        <TableSearchBar
          id="patient-table-search"
          value={tableSearch}
          onChange={setTableSearch}
          placeholder="No, ID, nama, atau telepon…"
        />
        <div className="table-wrap">
          <table className="data-table">
          <caption className="sr-only">
            Data pasien; kolom No adalah nomor urut tersimpan.
          </caption>
          <thead>
            <tr>
              <SortableTh
                label="No"
                sortKey="no"
                sort={sort}
                onSort={() => toggle('no')}
                alignEnd
              />
              <SortableTh
                label="ID"
                sortKey="id"
                sort={sort}
                onSort={() => toggle('id')}
              />
              <SortableTh
                label="Nama pasien"
                sortKey="name"
                sort={sort}
                onSort={() => toggle('name')}
              />
              <SortableTh
                label="Telepon"
                sortKey="phone"
                sort={sort}
                onSort={() => toggle('phone')}
              />
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyHint
                    title="Belum ada pasien"
                    hint="Tambahkan pasien agar bisa dipilih di Transaksi."
                  />
                </td>
              </tr>
            ) : filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyHint
                    title="Tidak ada baris yang cocok"
                    hint="Sesuaikan kata kunci atau kosongkan kolom Cari."
                  />
                </td>
              </tr>
            ) : (
              sorted.map((p) => (
                <tr key={p.id}>
                  <td className="num">{p.serialNo}</td>
                  <td className="mono">{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.phone || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </section>
  )
}
