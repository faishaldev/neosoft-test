import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import type { Product } from '../lib/types'
import { useFlash } from '../hooks/useFlash'
import { usePagedSlice } from '../hooks/usePagedSlice'
import {
  useTableSort,
  type TableSortState,
} from '../hooks/useTableSort'
import { formatIdr } from '../utils/format'
import { parsePriceInput } from '../utils/parseCurrency'
import {
  validatePriceRp,
  validateProductName,
} from '../utils/validation'
import {
  downloadProductsExport,
  formatImportErrorToast,
  parseProductsImport,
} from '../lib/importExport/productsIo'
import { EmptyHint } from './EmptyHint'
import { TablePagination } from './TablePagination'
import { MasterDataIoBar } from './MasterDataIoBar'
import { TableSearchBar } from './TableSearchBar'
import { Toast } from './Toast'
import { SortableTh } from './SortableTh'
import { rowMatchesSearch } from '../utils/tableSearch'

type SortKey = 'no' | 'id' | 'price'

type Props = {
  products: Product[]
  onAdd: (name: string, price: number) => void
  onImportProducts: (rows: { name: string; price: number }[]) => void
  onUpdateProduct: (id: string, name: string, price: number) => void
  onSetProductArchived: (id: string, archived: boolean) => void
}

type FieldErrors = { name?: string; price?: string }

type ProductTableSectionProps = {
  products: Product[]
  filteredProducts: Product[]
  sorted: Product[]
  sort: TableSortState<SortKey> | null
  toggle: (key: SortKey) => void
  editingId: string | null
  editName: string
  editPrice: string
  onChangeEditName: (value: string) => void
  onChangeEditPrice: (value: string) => void
  onStartEdit: (p: Product) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onToggleArchive: (p: Product) => void
}

function ProductTableSection({
  products,
  filteredProducts,
  sorted,
  sort,
  toggle,
  editingId,
  editName,
  editPrice,
  onChangeEditName,
  onChangeEditPrice,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleArchive,
}: ProductTableSectionProps) {
  const pageData = usePagedSlice(sorted)
  return (
    <>
      <div className="table-wrap">
        <table className="data-table data-table--product-list">
          <caption className="sr-only">
            Daftar barang; kolom No adalah nomor urut tersimpan; baris boleh
            diarsipkan agar tidak muncul di Transaksi.
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
              <th scope="col" className="data-table__th-actions">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyHint
                    title="Belum ada barang"
                    hint="Gunakan formulir di atas untuk menambah item pertama."
                  />
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyHint
                    title="Tidak ada baris yang cocok"
                    hint="Sesuaikan kata kunci atau kosongkan kolom Cari."
                  />
                </td>
              </tr>
            ) : (
              pageData.slice.map((p) => {
                const editing = editingId === p.id
                return (
                  <tr
                    key={p.id}
                    className={[
                      p.archived ? 'data-table__row--archived' : '',
                      editing ? 'data-table__row--editing' : '',
                    ]
                      .filter(Boolean)
                      .join(' ') || undefined}
                  >
                    <td className="num">{p.serialNo}</td>
                    <td className="product-cell">
                      {editing ? (
                        <div className="product-cell--edit-row">
                          <span className="product-cell__code-chip mono">
                            {p.id}
                          </span>
                          <label className="sr-only" htmlFor={`edit-name-${p.id}`}>
                            Nama barang
                          </label>
                          <input
                            id={`edit-name-${p.id}`}
                            className="table-edit-input table-edit-input--flex"
                            autoComplete="off"
                            value={editName}
                            onChange={(ev) =>
                              onChangeEditName(ev.target.value)
                            }
                          />
                        </div>
                      ) : (
                        <div className="product-cell product-cell--inline">
                          <span className="product-cell__code">{p.id}</span>
                          <span
                            className="product-cell__sep"
                            aria-hidden="true"
                          >
                            ·
                          </span>
                          <span className="product-cell__name">{p.name}</span>
                          {p.archived ? (
                            <span className="badge badge--muted">Arsip</span>
                          ) : null}
                        </div>
                      )}
                    </td>
                    <td className="num table-cell--money">
                      {editing ? (
                        <>
                          <label className="sr-only" htmlFor={`edit-price-${p.id}`}>
                            Harga
                          </label>
                          <input
                            id={`edit-price-${p.id}`}
                            className="table-edit-input table-edit-input--num table-edit-input--money"
                            inputMode="numeric"
                            autoComplete="off"
                            value={editPrice}
                            onChange={(ev) =>
                              onChangeEditPrice(ev.target.value)
                            }
                          />
                        </>
                      ) : (
                        formatIdr(p.price)
                      )}
                    </td>
                    <td className="table-actions-cell">
                      <div className="table-actions no-print">
                        {editing ? (
                          <>
                            <button
                              type="button"
                              className="btn btn--compact btn--outline-accent"
                              onClick={onSaveEdit}
                            >
                              Simpan
                            </button>
                            <button
                              type="button"
                              className="btn btn--compact btn--ghost"
                              onClick={onCancelEdit}
                            >
                              Batal
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="btn btn--compact btn--ghost"
                              onClick={() => onStartEdit(p)}
                              disabled={Boolean(editingId)}
                            >
                              Ubah
                            </button>
                            <button
                              type="button"
                              className="btn btn--compact btn--ghost"
                              onClick={() => onToggleArchive(p)}
                              disabled={Boolean(editingId)}
                            >
                              {p.archived ? 'Batal arsip' : 'Arsipkan'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={pageData.page}
        totalPages={pageData.totalPages}
        totalItems={pageData.total}
        pageSize={pageData.pageSize}
        onPageChange={pageData.setPage}
      />
    </>
  )
}

export function ProductPanel({
  products,
  onAdd,
  onImportProducts,
  onUpdateProduct,
  onSetProductArchived,
}: Props) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [tableSearch, setTableSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const { message, variant, flash, clear } = useFlash()
  const { sort, toggle } = useTableSort<SortKey>()

  useEffect(() => {
    if (!editingId) return
    function onKey(ev: KeyboardEvent) {
      if (ev.key === 'Escape') {
        setEditingId(null)
        setEditName('')
        setEditPrice('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editingId])

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
          p.archived ? 'diarsipkan arsip' : 'aktif',
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

  function startEdit(p: Product) {
    setEditingId(p.id)
    setEditName(p.name)
    setEditPrice(String(p.price))
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditPrice('')
  }

  function saveEdit() {
    if (!editingId) return
    const nameErr = validateProductName(editName)
    const priceErr = validatePriceRp(editPrice)
    if (nameErr || priceErr) {
      flash([nameErr, priceErr].filter(Boolean).join(' '), 'error')
      return
    }
    const parsed = parsePriceInput(editPrice.trim())
    if (!Number.isFinite(parsed)) {
      flash('Harga tidak valid.', 'error')
      return
    }
    onUpdateProduct(editingId, editName.trim(), parsed)
    flash('Barang diperbarui.')
    cancelEdit()
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
    const result = parseProductsImport(text, file.name)
    if (!result.ok) {
      flash(formatImportErrorToast(result.errors), 'error')
      return
    }
    onImportProducts(result.rows)
    flash(
      result.rows.length === 1
        ? '1 barang berhasil diimpor (kode & nomor urut baru).'
        : `${result.rows.length} barang berhasil diimpor (kode & nomor urut baru).`,
    )
  }

  function toggleArchive(p: Product) {
    const next = !p.archived
    onSetProductArchived(p.id, next)
    flash(next ? 'Barang diarsipkan (tidak dipilih di Transaksi).' : 'Barang ditampilkan lagi di Transaksi.')
    if (editingId === p.id) cancelEdit()
  }

  return (
    <section className="panel" aria-labelledby="h-barang">
      <Toast message={message} onDismiss={clear} variant={variant} />

      <h2 id="h-barang">Daftar harga barang</h2>
      <p className="panel__hint">
        Master referensi nama dan harga untuk dipilih di tab Transaksi; tiap
        barang mendapat kode otomatis. Data disimpan di perangkat ini.
      </p>

      <MasterDataIoBar
        ariaLabel="Ekspor dan impor daftar barang"
        inputId="import-products-file"
        hint="CSV dengan header nama,harga (titik koma atau koma). JSON: array baris atau objek berisi rows — sama seperti berkas ekspor. Setiap baris impor mendapat kode & No baru."
        onExportJson={() => downloadProductsExport(products, 'json')}
        onExportCsv={() => downloadProductsExport(products, 'csv')}
        onImportFile={handleImportFile}
      />

      <form className="form-card no-print" onSubmit={handleSubmit} noValidate>
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
          placeholder="No, kode, nama, nominal, atau arsip…"
        />
        <ProductTableSection
          key={tableSearch}
          products={products}
          filteredProducts={filteredProducts}
          sorted={sorted}
          sort={sort}
          toggle={toggle}
          editingId={editingId}
          editName={editName}
          editPrice={editPrice}
          onChangeEditName={setEditName}
          onChangeEditPrice={setEditPrice}
          onStartEdit={startEdit}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onToggleArchive={toggleArchive}
        />
      </div>
    </section>
  )
}
