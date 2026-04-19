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
  const patientPanelModel = usePatientPanelModel(props)

  return (
    <section className="panel" aria-labelledby="h-pasien">
      <Toast
        message={patientPanelModel.message}
        onDismiss={patientPanelModel.clearFlash}
        variant={patientPanelModel.variant}
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
        onExportJson={patientPanelModel.exportJson}
        onExportCsv={patientPanelModel.exportCsv}
        onImportFile={patientPanelModel.handleImportFile}
      />

      <PatientAddForm
        name={patientPanelModel.name}
        phone={patientPanelModel.phone}
        errors={patientPanelModel.errors}
        onNameChange={(nextName) => {
          patientPanelModel.setName(nextName)
          patientPanelModel.setErrors((prevErrors) => ({
            ...prevErrors,
            name: undefined,
          }))
        }}
        onPhoneChange={(nextPhone) => {
          patientPanelModel.setPhone(nextPhone)
          patientPanelModel.setErrors((prevErrors) => ({
            ...prevErrors,
            phone: undefined,
          }))
        }}
        onSubmit={patientPanelModel.handleSubmit}
      />

      <div className="table-block">
        <TableSearchBar
          id="patient-table-search"
          value={patientPanelModel.tableSearch}
          onChange={patientPanelModel.setTableSearch}
          placeholder="Cari — No, ID, nama, telepon, atau arsip…"
        />
        <PatientTableSection
          key={patientPanelModel.tableSearch}
          patients={patientPanelModel.patients}
          filteredPatients={patientPanelModel.filteredPatients}
          sorted={patientPanelModel.sorted}
          sort={patientPanelModel.sort}
          toggle={patientPanelModel.toggle}
          editingId={patientPanelModel.editingId}
          editName={patientPanelModel.editName}
          editPhone={patientPanelModel.editPhone}
          onChangeEditName={patientPanelModel.setEditName}
          onChangeEditPhone={patientPanelModel.setEditPhone}
          onStartEdit={patientPanelModel.startEdit}
          onSaveEdit={patientPanelModel.saveEdit}
          onCancelEdit={patientPanelModel.cancelEdit}
          onToggleArchive={patientPanelModel.toggleArchive}
        />
      </div>
    </section>
  )
}
