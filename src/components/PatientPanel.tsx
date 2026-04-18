import { useMemo, useState, type FormEvent } from 'react'
import type { Patient } from '../lib/types'
import { useFlash } from '../hooks/useFlash'
import { useTableSort } from '../hooks/useTableSort'
import { EmptyHint } from './EmptyHint'
import { FlashBanner } from './FlashBanner'
import { SortableTh } from './SortableTh'

type SortKey = 'no' | 'id' | 'name' | 'phone'

type Props = {
  patients: Patient[]
  onAdd: (name: string, phone: string) => void
}

export function PatientPanel({ patients, onAdd }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const { message, flash } = useFlash()
  const { sort, toggle } = useTableSort<SortKey>()

  const sorted = useMemo(() => {
    if (!sort) return patients
    const m = [...patients]
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
  }, [patients, sort])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name, phone)
    flash('Pasien berhasil ditambahkan.')
    setName('')
    setPhone('')
  }

  return (
    <section className="panel" aria-labelledby="h-pasien">
      <FlashBanner message={message} />

      <h2 id="h-pasien">Data pasien</h2>
      <p className="panel__hint">
        Nomor urut (<strong>No</strong>) disimpan tetap untuk setiap pasien.
      </p>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-card__fields form-row">
          <label className="field">
            <span>Nama pasien</span>
            <input
              autoComplete="name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              placeholder="Nama lengkap"
              required
            />
          </label>
          <label className="field">
            <span>Telepon</span>
            <input
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(ev) => setPhone(ev.target.value)}
              placeholder="08xxxxxxxxxx"
            />
          </label>
          <button type="submit" className="btn btn--primary">
            Tambah pasien
          </button>
        </div>
      </form>

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
    </section>
  )
}
