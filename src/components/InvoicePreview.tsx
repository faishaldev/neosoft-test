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
      {rows.length === 0 ? (
        <p className="invoice__empty">Tambahkan barang untuk melihat pratinjau.</p>
      ) : (
        <div className="invoice__cards">
          {rows.map((r, i) => (
            <article
              key={`${r.name}-${r.price}-${r.qty}-${i}`}
              className="invoice-item-card"
            >
              <p className="invoice-item-card__name">{r.name}</p>
              <dl className="invoice-item-card__meta">
                <div>
                  <dt>Harga</dt>
                  <dd>{formatIdr(r.price)}</dd>
                </div>
                <div>
                  <dt>Qty</dt>
                  <dd>{r.qty}</dd>
                </div>
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatIdr(r.sub)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
      <div className="invoice__total-card">
        <span className="invoice__total-label">TOTAL</span>
        <strong className="invoice__total-val">{formatIdr(previewTotal)}</strong>
      </div>
    </div>
  )
}
