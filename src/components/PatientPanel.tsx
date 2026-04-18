import { MasterDataIoBar } from './MasterDataIoBar'
import { PatientAddForm } from './PatientAddForm'
import { PatientTableSection } from './PatientTableSection'
import { TableSearchBar } from './TableSearchBar'
import { Toast } from './Toast'
import {
  usePatientPanelModel,
  type PatientPanelModelProps,
} from '../hooks/usePatientPanelModel'

export type PatientPanelProps = PatientPanelModelProps

export function PatientPanel(props: PatientPanelProps) {
  const m = usePatientPanelModel(props)

  return (
    <section className="panel" aria-labelledby="h-pasien">
      <Toast
        message={m.message}
        onDismiss={m.clearFlash}
        variant={m.variant}
      />

      <h2 id="h-pasien">Data pasien</h2>
      <p className="panel__hint">
        Pasien dapat dipilih saat menyimpan invoice; ID otomatis dan
        konsisten di laporan. Data disimpan di perangkat ini.
      </p>

      <MasterDataIoBar
        ariaLabel="Ekspor dan impor data pasien"
        inputId="import-patients-file"
        hint={
          'CSV nama,telepon (telepon boleh kosong). JSON = format ekspor. ' +
          'Impor = ID & No baru.'
        }
        onExportJson={m.exportJson}
        onExportCsv={m.exportCsv}
        onImportFile={m.handleImportFile}
      />

      <PatientAddForm
        name={m.name}
        phone={m.phone}
        errors={m.errors}
        onNameChange={(v) => {
          m.setName(v)
          m.setErrors((prev) => ({ ...prev, name: undefined }))
        }}
        onPhoneChange={(v) => {
          m.setPhone(v)
          m.setErrors((prev) => ({ ...prev, phone: undefined }))
        }}
        onSubmit={m.handleSubmit}
      />

      <div className="table-block">
        <TableSearchBar
          id="patient-table-search"
          value={m.tableSearch}
          onChange={m.setTableSearch}
          placeholder="No, ID, nama, telepon, atau arsip…"
        />
        <PatientTableSection
          key={m.tableSearch}
          patients={m.patients}
          filteredPatients={m.filteredPatients}
          sorted={m.sorted}
          sort={m.sort}
          toggle={m.toggle}
          editingId={m.editingId}
          editName={m.editName}
          editPhone={m.editPhone}
          onChangeEditName={m.setEditName}
          onChangeEditPhone={m.setEditPhone}
          onStartEdit={m.startEdit}
          onSaveEdit={m.saveEdit}
          onCancelEdit={m.cancelEdit}
          onToggleArchive={m.toggleArchive}
        />
      </div>
    </section>
  )
}
