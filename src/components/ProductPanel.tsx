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
import { TableSearchBar } from './TableSearchBar'
import { Toast } from './Toast'
import { SortableTh } from './SortableTh'
import { rowMatchesSearch } from '../utils/tableSearch'

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
  const [tableSearch, setTableSearch] = useState('')
  const { message, variant, flash, clear } = useFlash()
  const { sort, toggle } = useTableSort<SortKey>()

  const filteredProducts = useMemo(() => {
    if (!tableSearch.trim()) return products
    return products.filter((p) =>
      rowMatchesSearch(
        [
          String(p.serialNo),
          p.id,
          p.name,
          String(p.price),
          formatIdr(p.price),
        ],
        tableSearch,
      ),
    )
  }, [products, tableSearch])

  const sorted = useMemo(() => {
    if (!sort) return filteredProducts
    const m = [...filteredProducts]
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
  }, [filteredProducts, sort])

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

      <div className="table-block">
        <TableSearchBar
          id="product-table-search"
          value={tableSearch}
          onChange={setTableSearch}
          placeholder="No, kode, nama, atau nominal…"
        />
        <div className="table-wrap">
          <table className="data-table data-table--product-list">
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
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={3}>
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
                  <td className="product-cell product-cell--inline">
                    <span className="product-cell__code">{p.id}</span>
                    <span className="product-cell__sep" aria-hidden="true">
                      ·
                    </span>
                    <span className="product-cell__name">{p.name}</span>
                  </td>
                  <td className="num">{formatIdr(p.price)}</td>
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
