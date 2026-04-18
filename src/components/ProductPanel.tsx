import { useState, type FormEvent } from 'react'
import type { Product } from '../lib/types'
import { useFlash } from '../hooks/useFlash'
import { formatIdr } from '../utils/format'
import { parsePriceInput } from '../utils/parseCurrency'
import { EmptyHint } from './EmptyHint'
import { FlashBanner } from './FlashBanner'

type Props = {
  products: Product[]
  onAdd: (name: string, price: number) => void
}

export function ProductPanel({ products, onAdd }: Props) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const { message, flash } = useFlash()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const p = parsePriceInput(price)
    if (!name.trim() || Number.isNaN(p) || p < 0) return
    onAdd(name, p)
    flash('Barang berhasil ditambahkan.')
    setName('')
    setPrice('')
  }

  return (
    <section className="panel" aria-labelledby="h-barang">
      <FlashBanner message={message} />

      <h2 id="h-barang">Daftar harga barang</h2>
      <p className="panel__hint">
        Kode otomatis <strong>P-YYMM####</strong> (mis. P-26040001).
      </p>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-card__fields form-row">
          <label className="field">
            <span>Nama barang</span>
            <input
              autoComplete="off"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              placeholder="Contoh: Vitamin C"
              required
            />
          </label>
          <label className="field">
            <span>Harga (Rp)</span>
            <input
              inputMode="numeric"
              autoComplete="off"
              value={price}
              onChange={(ev) => setPrice(ev.target.value)}
              placeholder="mis. 150000"
              required
            />
          </label>
          <button type="submit" className="btn btn--primary">
            Tambah barang
          </button>
        </div>
      </form>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">No</th>
              <th scope="col">Kode / nama</th>
              <th scope="col" className="num">
                Harga
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <EmptyHint
                    title="Belum ada barang"
                    hint="Gunakan formulir di atas untuk menambah item pertama."
                  />
                </td>
              </tr>
            ) : (
              products.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td>
                    <span className="mono">{p.id}</span>
                    <span className="product-name">{p.name}</span>
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
