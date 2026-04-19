type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string

  label?: string
}

export function TableSearchBar({
  id,
  value,
  onChange,
  placeholder = 'Cari…',
  label = 'Cari',
}: Props) {
  return (
    <div className="table-toolbar no-print">
      <div className="table-toolbar__search">
        <input
          id={id}
          type="search"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
          placeholder={placeholder}
          aria-label={label}
        />
      </div>
    </div>
  )
}
