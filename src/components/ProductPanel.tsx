import { useMemo, useState, type FormEvent } from 'react'
import type { Product } from '../lib/types'
import { useFlash } from '../hooks/useFlash'
import { useTableSort } from '../hooks/useTableSort'
import { formatIdr } from '../utils/format'
import { parsePriceInput } from '../utils/parseCurrency'
import {
  validatePriceRp,
  validateProductName,
} from '../utils/validation'
import { EmptyHint } from './EmptyHint'
import { Toast } from './Toast'
import { SortableTh } from './SortableTh'

type SortKey = 'no' | 'id' | 'price'

type Props = {
  products: Product[]
  onAdd: (name: string, price: number) => void
}

type FieldErrors = { name?: string; price?: string }

export function ProductPanel({ products, onAdd }: Props) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const { message, variant, flash, clear } = useFlash()
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
    const nameErr = validateProductName(name)
    const priceErr = validatePriceRp(price)
    const next: FieldErrors = {}
    if (nameErr) next.name = nameErr
    if (priceErr) next.price = priceErr
    setErrors(next)
    if (nameErr || priceErr) {
      const msg = [nameErr, priceErr].filter(Boolean).join(' ')
      flash(msg, 'error')
      return
    }

    const parsed = parsePriceInput(price.trim())
    onAdd(name.trim(), parsed)
    flash('Barang berhasil ditambahkan.')
    setName('')
    setPrice('')
    setErrors({})
  }

  return (
    <section className="panel" aria-labelledby="h-barang">
      <Toast message={message} onDismiss={clear} variant={variant} />

      <h2 id="h-barang">Daftar harga barang</h2>
      <p className="panel__hint">
        Nomor urut (<strong>No</strong>) disimpan tetap untuk setiap barang.
      </p>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <div className="form-card__fields form-row form-row--balanced">
          <label className="field">
            <span>Nama barang</span>
            <input
              id="product-name"
              autoComplete="off"
              value={name}
              onChange={(ev) => {
                setName(ev.target.value)
                setErrors((prev) => ({ ...prev, name: undefined }))
              }}
              placeholder="Contoh: Vitamin C"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={
                errors.name ? 'err-product-name' : undefined
              }
            />
            {errors.name ? (
              <span id="err-product-name" className="sr-only">
                {errors.name}
              </span>
            ) : null}
          </label>
          <label className="field">
            <span>Harga (Rp)</span>
            <input
              id="product-price"
              inputMode="numeric"
              autoComplete="off"
              value={price}
              onChange={(ev) => {
                setPrice(ev.target.value)
                setErrors((prev) => ({ ...prev, price: undefined }))
              }}
              placeholder="mis. 150000"
              aria-invalid={Boolean(errors.price)}
              aria-describedby={
                errors.price ? 'err-product-price' : undefined
              }
            />
            {errors.price ? (
              <span id="err-product-price" className="sr-only">
                {errors.price}
              </span>
            ) : null}
          </label>
          <div className="form-row__action">
            <span className="form-row__action-spacer" aria-hidden="true">
              &nbsp;
            </span>
            <button type="submit" className="btn btn--primary">
              Tambah barang
            </button>
          </div>
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
