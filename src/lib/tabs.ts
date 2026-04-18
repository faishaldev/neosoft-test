export type Tab = 'barang' | 'pasien' | 'transaksi' | 'laporan'

export const TAB_ITEMS: readonly { id: Tab; label: string }[] = [
  { id: 'barang', label: 'Daftar barang' },
  { id: 'pasien', label: 'Data pasien' },
  { id: 'transaksi', label: 'Transaksi' },
  { id: 'laporan', label: 'Laporan penjualan' },
]
