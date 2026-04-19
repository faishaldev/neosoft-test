import { useRef } from 'react'

type Props = {

  ariaLabel: string
  inputId: string
  hint: string
  onExportJson: () => void
  onExportCsv: () => void
  onImportFile: (file: File) => void | Promise<void>
}

export function MasterDataIoBar({
  ariaLabel,
  inputId,
  hint,
  onExportJson,
  onExportCsv,
  onImportFile,
}: Props) {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className="panel-io no-print" role="group" aria-label={ariaLabel}>
      <div className="panel-io__actions panel-io__actions--split">
        <div
          className="panel-io__cluster"
          aria-label="Ekspor dan cetak"
        >
          <button type="button" className="btn" onClick={onExportJson}>
            Ekspor JSON
          </button>
          <button type="button" className="btn" onClick={onExportCsv}>
            Ekspor CSV
          </button>
          <button type="button" className="btn" onClick={() => window.print()}>
            Cetak
          </button>
        </div>
        <button
          type="button"
          className="btn btn--primary panel-io__import"
          onClick={() => ref.current?.click()}
        >
          Impor berkas…
        </button>
      </div>
      <input
        ref={ref}
        id={inputId}
        type="file"
        accept=".csv,.json,text/csv,application/json,.txt"
        className="sr-only"
        onChange={(ev) => {
          const f = ev.target.files?.[0]
          ev.target.value = ''
          if (f) void onImportFile(f)
        }}
      />
      <p className="panel-io__hint">{hint}</p>
    </div>
  )
}
