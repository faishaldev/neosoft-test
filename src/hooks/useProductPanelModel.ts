import {
  useCallback,
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import type { Product } from '../lib/types'
import type { ProductFieldErrors } from '../lib/master/formErrors'
import { IMPORT_READ_FAIL } from '../lib/importMessages'
import { readImportFileText } from '../lib/readImportFile'
import {
  downloadProductsExport,
  formatImportErrorToast,
  parseProductsImport,
} from '../lib/importExport/productsIo'
import type { ProductSortKey } from '../lib/master/sortKeys'
import { productSearchCells } from '../lib/master/productSearchCells'
import { sortProducts } from '../lib/master/sortProducts'
import { useEscapeCancel } from './useEscapeCancel'
import { useFlash } from './useFlash'
import { useTableSort } from './useTableSort'
import { parsePriceInput } from '../utils/parseCurrency'
import { validatePriceRp, validateProductName } from '../utils/validation'
import { rowMatchesSearch } from '../utils/tableSearch'

export type ProductPanelModelProps = {
  products: Product[]
  onAdd: (name: string, price: number) => void
  onImportProducts: (rows: { name: string; price: number }[]) => void
  onUpdateProduct: (id: string, name: string, price: number) => void
  onSetProductArchived: (id: string, archived: boolean) => void
}

export function useProductPanelModel({
  products,
  onAdd,
  onImportProducts,
  onUpdateProduct,
  onSetProductArchived,
}: ProductPanelModelProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [errors, setErrors] = useState<ProductFieldErrors>({})
  const [tableSearch, setTableSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const { message, variant, flash, clear } = useFlash()
  const { sort, toggle } = useTableSort<ProductSortKey>()

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setEditName('')
    setEditPrice('')
  }, [])

  useEscapeCancel(editingId !== null, cancelEdit)

  const filteredProducts = useMemo(() => {
    if (!tableSearch.trim()) return products
    return products.filter((p) =>
      rowMatchesSearch(productSearchCells(p), tableSearch),
    )
  }, [products, tableSearch])

  const sorted = useMemo(
    () => sortProducts(filteredProducts, sort),
    [filteredProducts, sort],
  )

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nameErr = validateProductName(name)
    const priceErr = validatePriceRp(price)
    const next: ProductFieldErrors = {}
    if (nameErr) next.name = nameErr
    if (priceErr) next.price = priceErr
    setErrors(next)
    if (nameErr || priceErr) {
      flash([nameErr, priceErr].filter(Boolean).join(' '), 'error')
      return
    }
    onAdd(name.trim(), parsePriceInput(price.trim()))
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
    const read = await readImportFileText(file)
    if (!read.ok) {
      flash(IMPORT_READ_FAIL, 'error')
      return
    }
    const result = parseProductsImport(read.text, file.name)
    if (result.ok === false) {
      flash(formatImportErrorToast(result.errors), 'error')
      return
    }
    onImportProducts(result.rows)
    const n = result.rows.length
    flash(
      n === 1
        ? '1 barang berhasil diimpor (kode & nomor urut baru).'
        : `${n} barang berhasil diimpor (kode & nomor urut baru).`,
    )
  }

  function toggleArchive(p: Product) {
    const next = !p.archived
    onSetProductArchived(p.id, next)
    flash(
      next
        ? 'Barang diarsipkan (tidak dipilih di Transaksi).'
        : 'Barang ditampilkan lagi di Transaksi.',
    )
    if (editingId === p.id) cancelEdit()
  }

  return {
    products,
    message,
    variant,
    clearFlash: clear,
    name,
    price,
    errors,
    setName,
    setPrice,
    setErrors,
    tableSearch,
    setTableSearch,
    filteredProducts,
    sorted,
    sort,
    toggle,
    editingId,
    editName,
    editPrice,
    setEditName,
    setEditPrice,
    handleSubmit,
    startEdit,
    saveEdit,
    cancelEdit,
    handleImportFile,
    toggleArchive,
    exportJson: () => downloadProductsExport(products, 'json'),
    exportCsv: () => downloadProductsExport(products, 'csv'),
  }
}
