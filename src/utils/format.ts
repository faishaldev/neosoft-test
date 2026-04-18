export function formatIdr(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatDateId(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
  }).format(d)
}
