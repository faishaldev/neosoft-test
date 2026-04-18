import { useState, type FormEvent } from 'react'
import type { Patient } from '../lib/types'
import { TableEmpty } from './TableEmpty'

type Props = {
  patients: Patient[]
  onAdd: (name: string, phone: string) => void
}

export function PatientPanel({ patients, onAdd }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name, phone)
    setName('')
    setPhone('')
  }

  return (
    <section className="panel" aria-labelledby="h-pasien">
      <h2 id="h-pasien">Data pasien</h2>
      <p className="panel__hint">
        Kode pasien otomatis: <strong>EM-YYMM####</strong>{' '}
        (contoh EM-23030001).
      </p>

      <form className="form-row" onSubmit={handleSubmit}>
        <label className="field">
          <span>Nama pasien</span>
          <input
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            placeholder="Nama"
            required
          />
        </label>
        <label className="field">
          <span>Telepon</span>
          <input
            value={phone}
            onChange={(ev) => setPhone(ev.target.value)}
            placeholder="08…"
          />
        </label>
        <button type="submit" className="btn btn--primary">
          Tambah
        </button>
      </form>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>ID</th>
              <th>Nama pasien</th>
              <th>Telepon</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <TableEmpty cols={4}>Belum ada pasien.</TableEmpty>
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
