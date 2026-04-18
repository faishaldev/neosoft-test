import type { ReactNode } from 'react'

type Props = { cols: number; children: ReactNode }

export function TableEmpty({ cols, children }: Props) {
  return (
    <tr>
      <td colSpan={cols} className="empty">
        {children}
      </td>
    </tr>
  )
}
