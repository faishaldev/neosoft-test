import type { Product } from '../lib/types'
import type { ProductSortKey } from '../lib/master/sortKeys'
import { usePagedSlice } from '../hooks/usePagedSlice'
import type { TableSortState } from '../hooks/useTableSort'
import { EmptyHint } from './EmptyHint'
import { ProductTableRow } from './ProductTableRow'
import { SortableTh } from './SortableTh'
import { TablePagination } from './TablePagination'

export type { ProductSortKey }

type Props = {
  products: Product[]
  filteredProducts: Product[]
  sorted: Product[]
  sort: TableSortState<ProductSortKey> | null
  toggle: (key: ProductSortKey) => void
  editingId: string | null
  editName: string
  editPrice: string
  onChangeEditName: (value: string) => void
  onChangeEditPrice: (value: string) => void
  onStartEdit: (product: Product) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onToggleArchive: (product: Product) => void
}

export function ProductTableSection({
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
}: Props) {
  const pageData = usePagedSlice(sorted)
  return (
    <>
      <div className="table-wrap">
        <table className="data-table data-table--product-list">
          <caption className="sr-only">
            Daftar barang; kolom No nomor urut tersimpan; baris boleh diarsipkan.
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
                label="Kode"
                sortKey="id"
                sort={sort}
                onSort={() => toggle('id')}
              />
              <SortableTh
                label="Nama"
                sortKey="name"
                sort={sort}
                onSort={() => toggle('name')}
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
                <td colSpan={5}>
                  <EmptyHint
                    title="Belum ada barang"
                    hint="Gunakan formulir di atas untuk menambah item pertama."
                  />
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyHint
                    title="Tidak ada baris yang cocok"
                    hint="Sesuaikan kata kunci atau kosongkan kolom Cari."
                  />
                </td>
              </tr>
            ) : (
              pageData.slice.map((product) => {
                const editing = editingId === product.id
                const interactionLocked =
                  Boolean(editingId) && !editing
                return (
                  <ProductTableRow
                    key={product.id}
                    product={product}
                    editing={editing}
                    editName={editName}
                    editPrice={editPrice}
                    interactionLocked={interactionLocked}
                    onChangeEditName={onChangeEditName}
                    onChangeEditPrice={onChangeEditPrice}
                    onStartEdit={onStartEdit}
                    onSaveEdit={onSaveEdit}
                    onCancelEdit={onCancelEdit}
                    onToggleArchive={onToggleArchive}
                  />
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
