type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Teks label visual (default: "Cari") */
  label?: string
}

/** Input pencarian di atas tabel data (label sejajar input, memakai lebar penuh). */
export function TableSearchBar({
  id,
  value,
  onChange,
  placeholder = 'Ketik untuk menyaring baris…',
  label = 'Cari',
}: Props) {
  return (
    <div className="table-toolbar no-print">
      <label className="table-toolbar__search" htmlFor={id}>
        <span className="table-toolbar__label">{label}</span>
        <input
          id={id}
          type="search"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
          placeholder={placeholder}
        />
      </label>
    </div>
  )
}
