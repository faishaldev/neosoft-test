
export function rowStatusClass(
  archived?: boolean,
  editing?: boolean,
): string | undefined {
  const parts = [
    archived ? 'data-table__row--archived' : '',
    editing ? 'data-table__row--editing' : '',
  ].filter(Boolean)
  return parts.length ? parts.join(' ') : undefined
}
