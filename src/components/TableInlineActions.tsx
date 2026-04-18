type Props = {
  editing: boolean
  /** Ubah tidak bisa diklik (mis. produk: ada baris lain sedang diedit). */
  disableEdit?: boolean
  /** Arsip tidak bisa diklik selama ada sesi edit aktif. */
  disableArchive?: boolean
  archived: boolean
  onSave: () => void
  onCancel: () => void
  onEdit: () => void
  onToggleArchive: () => void
}

export function TableInlineActions({
  editing,
  disableEdit = false,
  disableArchive = false,
  archived,
  onSave,
  onCancel,
  onEdit,
  onToggleArchive,
}: Props) {
  return (
    <div className="table-actions no-print">
      {editing ? (
        <>
          <button
            type="button"
            className="btn btn--compact btn--outline-accent"
            onClick={onSave}
          >
            Simpan
          </button>
          <button
            type="button"
            className="btn btn--compact btn--ghost"
            onClick={onCancel}
          >
            Batal
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className="btn btn--compact btn--ghost"
            onClick={onEdit}
            disabled={disableEdit}
          >
            Ubah
          </button>
          <button
            type="button"
            className="btn btn--compact btn--ghost"
            onClick={onToggleArchive}
            disabled={disableArchive}
          >
            {archived ? 'Batal arsip' : 'Arsipkan'}
          </button>
        </>
      )}
    </div>
  )
}
