import { useState, type FormEvent } from 'react'
import type { Patient } from '../lib/types'
import { useFlash } from '../hooks/useFlash'
import { EmptyHint } from './EmptyHint'
import { FlashBanner } from './FlashBanner'

type Props = {
  patients: Patient[]
  onAdd: (name: string, phone: string) => void
}

export function PatientPanel({ patients, onAdd }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const { message, flash } = useFlash()

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
        Kode otomatis <strong>EM-YYMM####</strong> (mis. EM-26040001).
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
          <thead>
            <tr>
              <th scope="col">No</th>
              <th scope="col">ID</th>
              <th scope="col">Nama pasien</th>
              <th scope="col">Telepon</th>
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
              patients.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
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
