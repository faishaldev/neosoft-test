import type { InvoicePreviewRow } from '../lib/draftTx'
import type { Patient } from '../lib/types'
import { formatDateId, formatIdr } from '../utils/format'

type Props = {
  patient: Patient | undefined
  rows: InvoicePreviewRow[]
  previewTotal: number
}

export function InvoicePreview({
  patient,
  rows,
  previewTotal,
}: Props) {
  const today = formatDateId(new Date().toISOString())

  return (
    <div className="invoice">
      <h3 className="invoice__title">Pratinjau invoice</h3>
      <div className="invoice__hdr">
        <div>
          <div>
            <span className="lbl">no Invoice :</span>{' '}
            <span className="mono">(dibuat saat simpan)</span>
          </div>
          <div>
            <span className="lbl">tanggal</span> {today}
          </div>
        </div>
        <div>
          <div>
            <span className="lbl">ID pasien</span>{' '}
            <span className="mono">{patient?.id ?? '—'}</span>
          </div>
          <div>
            <span className="lbl">nama pasien</span>{' '}
            {patient?.name ?? '—'}
          </div>
        </div>
      </div>

      <table className="invoice__table">
        <thead>
          <tr>
            <th>Item yang dibeli</th>
            <th className="num">harga</th>
            <th className="num">Jumlah</th>
            <th className="num">SUBTOTAL</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="empty">
                Tambahkan barang untuk melihat baris.
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i}>
                <td>{r.name}</td>
                <td className="num">{formatIdr(r.price)}</td>
                <td className="num">{r.qty}</td>
                <td className="num">{formatIdr(r.sub)}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="invoice__total-label">
              TOTAL
            </td>
            <td className="num invoice__total-val">
              {formatIdr(previewTotal)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
