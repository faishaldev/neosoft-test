import { useState, type FormEvent } from 'react'
import type { Product } from '../lib/types'
import { formatIdr } from '../utils/format'
import { parsePriceInput } from '../utils/parseCurrency'
import { TableEmpty } from './TableEmpty'

type Props = {
  products: Product[]
  onAdd: (name: string, price: number) => void
}

export function ProductPanel({ products, onAdd }: Props) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const p = parsePriceInput(price)
    if (!name.trim() || Number.isNaN(p) || p < 0) return
    onAdd(name, p)
    setName('')
    setPrice('')
  }

  return (
    <section className="panel" aria-labelledby="h-barang">
      <h2 id="h-barang">Daftar harga barang</h2>
      <p className="panel__hint">
        Kode barang otomatis: <strong>P-YYMM####</strong>{' '}
        (contoh P-23030001).
      </p>

      <form className="form-row" onSubmit={handleSubmit}>
        <label className="field">
          <span>Nama barang</span>
          <input
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            placeholder="Nama"
            required
          />
        </label>
        <label className="field">
          <span>Harga (Rp)</span>
          <input
            inputMode="numeric"
            value={price}
            onChange={(ev) => setPrice(ev.target.value)}
            placeholder="0"
            required
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
              <th>Kode / nama</th>
              <th className="num">Harga</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <TableEmpty cols={3}>Belum ada barang.</TableEmpty>
            ) : (
              products.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td>
                    <span className="mono">{p.id}</span>
                    <br />
                    {p.name}
                  </td>
                  <td className="num">{formatIdr(p.price)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
