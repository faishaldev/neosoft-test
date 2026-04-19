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
  const productPanelModel = useProductPanelModel(props)

  return (
    <section className="panel" aria-labelledby="h-barang">
      <Toast
        message={productPanelModel.message}
        onDismiss={productPanelModel.clearFlash}
        variant={productPanelModel.variant}
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
        onExportJson={productPanelModel.exportJson}
        onExportCsv={productPanelModel.exportCsv}
        onImportFile={productPanelModel.handleImportFile}
      />

      <ProductAddForm
        name={productPanelModel.name}
        price={productPanelModel.price}
        errors={productPanelModel.errors}
        onNameChange={(nextName) => {
          productPanelModel.setName(nextName)
          productPanelModel.setErrors((prevErrors) => ({
            ...prevErrors,
            name: undefined,
          }))
        }}
        onPriceChange={(nextPrice) => {
          productPanelModel.setPrice(nextPrice)
          productPanelModel.setErrors((prevErrors) => ({
            ...prevErrors,
            price: undefined,
          }))
        }}
        onSubmit={productPanelModel.handleSubmit}
      />

      <div className="table-block">
        <TableSearchBar
          id="product-table-search"
          value={productPanelModel.tableSearch}
          onChange={productPanelModel.setTableSearch}
          placeholder="Cari — No, kode, nama, nominal, atau arsip…"
        />
        <ProductTableSection
          key={productPanelModel.tableSearch}
          products={productPanelModel.products}
          filteredProducts={productPanelModel.filteredProducts}
          sorted={productPanelModel.sorted}
          sort={productPanelModel.sort}
          toggle={productPanelModel.toggle}
          editingId={productPanelModel.editingId}
          editName={productPanelModel.editName}
          editPrice={productPanelModel.editPrice}
          onChangeEditName={productPanelModel.setEditName}
          onChangeEditPrice={productPanelModel.setEditPrice}
          onStartEdit={productPanelModel.startEdit}
          onSaveEdit={productPanelModel.saveEdit}
          onCancelEdit={productPanelModel.cancelEdit}
          onToggleArchive={productPanelModel.toggleArchive}
        />
      </div>
    </section>
  )
}
