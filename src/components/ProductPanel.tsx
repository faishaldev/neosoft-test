import { useMemo, useState, type FormEvent } from 'react'
import type { Product } from '../lib/types'
import { useFlash } from '../hooks/useFlash'
import { useTableSort } from '../hooks/useTableSort'
import { formatIdr } from '../utils/format'
import { parsePriceInput } from '../utils/parseCurrency'
import { EmptyHint } from './EmptyHint'
import { FlashBanner } from './FlashBanner'
import { SortableTh } from './SortableTh'

type SortKey = 'no' | 'id' | 'price'

type Props = {
  products: Product[]
  onAdd: (name: string, price: number) => void
}

export function ProductPanel({ products, onAdd }: Props) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const { message, flash } = useFlash()
  const { sort, toggle } = useTableSort<SortKey>()

  const sorted = useMemo(() => {
    if (!sort) return products
    const m = [...products]
    m.sort((a, b) => {
      let c = 0
      if (sort.key === 'no') c = a.serialNo - b.serialNo
      else if (sort.key === 'id') {
        c = a.id.localeCompare(b.id, 'id-ID')
      } else {
        c = a.price - b.price
      }
      return sort.dir === 'asc' ? c : -c
    })
    return m
  }, [products, sort])

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
        Nomor urut (<strong>No</strong>) disimpan tetap untuk setiap barang.
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
          <caption className="sr-only">
            Daftar barang; kolom No adalah nomor urut tersimpan.
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
                label="Kode / nama"
                sortKey="id"
                sort={sort}
                onSort={() => toggle('id')}
              />
              <SortableTh
                label="Harga"
                sortKey="price"
                sort={sort}
                onSort={() => toggle('price')}
                alignEnd
              />
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
              sorted.map((p) => (
                <tr key={p.id}>
                  <td className="num">{p.serialNo}</td>
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
