import { MasterDataIoBar } from './MasterDataIoBar'
import { ProductAddForm } from './ProductAddForm'
import { ProductTableSection } from './ProductTableSection'
import { TableSearchBar } from './TableSearchBar'
import { Toast } from './Toast'
import {
  useProductPanelModel,
  type ProductPanelModelProps,
} from '../hooks/useProductPanelModel'

export type ProductPanelProps = ProductPanelModelProps

export function ProductPanel(props: ProductPanelProps) {
  const m = useProductPanelModel(props)

  return (
    <section className="panel" aria-labelledby="h-barang">
      <Toast
        message={m.message}
        onDismiss={m.clearFlash}
        variant={m.variant}
      />

      <h2 id="h-barang">Daftar harga barang</h2>
      <p className="panel__hint">
        Master referensi nama dan harga untuk dipilih di tab Transaksi;
        tiap barang mendapat kode otomatis. Data disimpan di perangkat ini.
      </p>

      <MasterDataIoBar
        ariaLabel="Ekspor dan impor daftar barang"
        inputId="import-products-file"
        hint={
          'CSV nama,harga (titik koma atau koma). JSON: baris atau objek ' +
          'rows — seperti ekspor. Impor = kode & No baru.'
        }
        onExportJson={m.exportJson}
        onExportCsv={m.exportCsv}
        onImportFile={m.handleImportFile}
      />

      <ProductAddForm
        name={m.name}
        price={m.price}
        errors={m.errors}
        onNameChange={(v) => {
          m.setName(v)
          m.setErrors((prev) => ({ ...prev, name: undefined }))
        }}
        onPriceChange={(v) => {
          m.setPrice(v)
          m.setErrors((prev) => ({ ...prev, price: undefined }))
        }}
        onSubmit={m.handleSubmit}
      />

      <div className="table-block">
        <TableSearchBar
          id="product-table-search"
          value={m.tableSearch}
          onChange={m.setTableSearch}
          placeholder="Cari — No, kode, nama, nominal, atau arsip…"
        />
        <ProductTableSection
          key={m.tableSearch}
          products={m.products}
          filteredProducts={m.filteredProducts}
          sorted={m.sorted}
          sort={m.sort}
          toggle={m.toggle}
          editingId={m.editingId}
          editName={m.editName}
          editPrice={m.editPrice}
          onChangeEditName={m.setEditName}
          onChangeEditPrice={m.setEditPrice}
          onStartEdit={m.startEdit}
          onSaveEdit={m.saveEdit}
          onCancelEdit={m.cancelEdit}
          onToggleArchive={m.toggleArchive}
        />
      </div>
    </section>
  )
}
