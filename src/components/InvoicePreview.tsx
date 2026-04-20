import type { InvoicePreviewRow } from '../lib/draftTx'
import type { Patient } from '../lib/types'
import { formatDateId, formatIdr } from '../utils/format'
import { EmptyHint } from './EmptyHint'

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
    <div className="table-block tx-invoice-summary">
      <div className="tx-invoice-meta">
        <div>
          <div>
            <span className="tx-invoice-meta__lbl">no Invoice :</span>{' '}
            <span className="mono">(dibuat saat simpan)</span>
          </div>
          <div>
            <span className="tx-invoice-meta__lbl">tanggal</span>{' '}
            <span className="mono">{today}</span>
          </div>
        </div>
        <div>
          <div>
            <span className="tx-invoice-meta__lbl">ID pasien</span>{' '}
            <span className="mono">{patient?.id ?? '—'}</span>
          </div>
          <div>
            <span className="tx-invoice-meta__lbl">nama pasien</span>{' '}
            {patient?.name ?? '—'}
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table data-table--invoice">
          <caption className="sr-only">
            Ringkasan baris transaksi: item, harga, jumlah, subtotal.
          </caption>
          <thead>
            <tr>
              <th scope="col">Item yang dibeli</th>
              <th scope="col" className="num">
                Harga
              </th>
              <th scope="col" className="num">
                Jumlah
              </th>
              <th scope="col" className="num">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyHint
                    title="Belum ada baris"
                    hint="Tambahkan barang pada formulir di atas."
                  />
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={`${r.name}-${r.price}-${r.qty}-${i}`}>
                  <td className="data-table__cell-wrap">{r.name}</td>
                  <td className="num">{formatIdr(r.price)}</td>
                  <td className="num">{r.qty}</td>
                  <td className="num">{formatIdr(r.sub)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} />
              <td className="num tx-invoice-foot__label">
                <strong>TOTAL</strong>
              </td>
              <td className="num tx-invoice-foot__total">
                <strong>{formatIdr(previewTotal)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
