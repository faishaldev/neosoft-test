import type { Patient } from '../lib/types'
import type { PatientSortKey } from '../lib/master/sortKeys'
import { usePagedSlice } from '../hooks/usePagedSlice'
import type { TableSortState } from '../hooks/useTableSort'
import { EmptyHint } from './EmptyHint'
import { PatientTableRow } from './PatientTableRow'
import { SortableTh } from './SortableTh'
import { TablePagination } from './TablePagination'

export type { PatientSortKey }

type Props = {
  patients: Patient[]
  filteredPatients: Patient[]
  sorted: Patient[]
  sort: TableSortState<PatientSortKey> | null
  toggle: (key: PatientSortKey) => void
  editingId: string | null
  editName: string
  editPhone: string
  onChangeEditName: (value: string) => void
  onChangeEditPhone: (value: string) => void
  onStartEdit: (patient: Patient) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onToggleArchive: (patient: Patient) => void
}

export function PatientTableSection({
  patients,
  filteredPatients,
  sorted,
  sort,
  toggle,
  editingId,
  editName,
  editPhone,
  onChangeEditName,
  onChangeEditPhone,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleArchive,
}: Props) {
  const pageData = usePagedSlice(sorted)
  const editingAny = editingId !== null

  return (
    <>
      <div className="table-wrap">
        <table className="data-table data-table--patients">
          <caption className="sr-only">
            Data pasien; No = nomor urut; baris boleh diarsipkan.
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
                label="ID"
                sortKey="id"
                sort={sort}
                onSort={() => toggle('id')}
              />
              <SortableTh
                label="Nama pasien"
                sortKey="name"
                sort={sort}
                onSort={() => toggle('name')}
              />
              <SortableTh
                label="Telepon"
                sortKey="phone"
                sort={sort}
                onSort={() => toggle('phone')}
              />
              <th scope="col" className="data-table__th-actions">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyHint
                    title="Belum ada pasien"
                    hint="Tambahkan pasien agar bisa dipilih di Transaksi."
                  />
                </td>
              </tr>
            ) : filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyHint
                    title="Tidak ada baris yang cocok"
                    hint="Sesuaikan kata kunci atau kosongkan kolom Cari."
                  />
                </td>
              </tr>
            ) : (
              pageData.slice.map((patient) => (
                <PatientTableRow
                  key={patient.id}
                  patient={patient}
                  editing={editingId === patient.id}
                  editingAny={editingAny}
                  editName={editName}
                  editPhone={editPhone}
                  onChangeEditName={onChangeEditName}
                  onChangeEditPhone={onChangeEditPhone}
                  onStartEdit={onStartEdit}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit}
                  onToggleArchive={onToggleArchive}
                />
              ))
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
