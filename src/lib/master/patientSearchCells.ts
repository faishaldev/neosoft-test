import type { Patient } from '../types'

/** Sel yang digabung untuk kolom Cari (pasien). */
export function patientSearchCells(p: Patient): string[] {
  return [
    String(p.serialNo),
    p.id,
    p.name,
    p.phone ?? '',
    p.phone ? p.phone.replace(/\D/g, '') : '',
    p.archived ? 'diarsipkan arsip' : 'aktif',
  ]
}
