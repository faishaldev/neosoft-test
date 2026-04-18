import {
  useEffect,
  useMemo,
  useReducer,
  useState,
  type FormEvent,
} from 'react'
import { nextCode } from './codes'
import { formatDateId, formatIdr } from './format'
import type { AppData, Patient, Product, Transaction, TxLine } from './types'
import './App.css'

const STORAGE_KEY = 'neosoft-penjualan-v1'

const empty: AppData = {
  products: [],
  patients: [],
  transactions: [],
  sequences: {},
}

function loadState(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty
    const p = JSON.parse(raw) as Partial<AppData>
    return {
      products: Array.isArray(p.products) ? p.products : [],
      patients: Array.isArray(p.patients) ? p.patients : [],
      transactions: Array.isArray(p.transactions) ? p.transactions : [],
      sequences:
        p.sequences && typeof p.sequences === 'object' ? p.sequences : {},
    }
  } catch {
    return empty
  }
}

type Action =
  | { type: 'ADD_PRODUCT'; name: string; price: number }
  | { type: 'ADD_PATIENT'; name: string; phone: string }
  | {
      type: 'ADD_TRANSACTION'
      patient: Patient
      lines: { product: Product; qty: number }[]
    }

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'ADD_PRODUCT': {
      const { code, sequences } = nextCode('product', state.sequences)
      const product: Product = {
        id: code,
        name: action.name.trim(),
        price: action.price,
      }
      return {
        ...state,
        sequences,
        products: [...state.products, product],
      }
    }
    case 'ADD_PATIENT': {
      const { code, sequences } = nextCode('patient', state.sequences)
      const patient: Patient = {
        id: code,
        name: action.name.trim(),
        phone: action.phone.trim(),
      }
      return {
        ...state,
        sequences,
        patients: [...state.patients, patient],
      }
    }
    case 'ADD_TRANSACTION': {
      const { code: invoiceNo, sequences } = nextCode('invoice', state.sequences)
      const lines: TxLine[] = action.lines.map(({ product, qty }) => ({
        productId: product.id,
        productName: product.name,
        price: product.price,
        qty,
      }))
      const tx: Transaction = {
        invoiceNo,
        dateISO: new Date().toISOString(),
        patientId: action.patient.id,
        patientName: action.patient.name,
        lines,
      }
      return {
        ...state,
        sequences,
        transactions: [...state.transactions, tx],
      }
    }
    default:
      return state
  }
}

type Tab = 'barang' | 'pasien' | 'transaksi' | 'laporan'

type DraftLine = { productId: string; qty: number }

export default function App() {
  const [data, dispatch] = useReducer(reducer, empty, loadState)
  const [tab, setTab] = useState<Tab>('barang')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const productById = useMemo(() => {
    const m = new Map<string, Product>()
    for (const p of data.products) m.set(p.id, p)
    return m
  }, [data.products])

  const salesByProduct = useMemo(() => {
    const m = new Map<
      string,
      { name: string; qty: number; revenue: number }
    >()
    for (const t of data.transactions) {
      for (const line of t.lines) {
        const cur =
          m.get(line.productId) ?? {
            name: line.productName,
            qty: 0,
            revenue: 0,
          }
        cur.qty += line.qty
        cur.revenue += line.price * line.qty
        m.set(line.productId, cur)
      }
    }
    return Array.from(m.entries()).map(([id, v]) => ({ id, ...v }))
  }, [data.transactions])

  const grandTotalAll = useMemo(
    () =>
      data.transactions.reduce(
        (sum, t) =>
          sum +
          t.lines.reduce((s, l) => s + l.price * l.qty, 0),
        0,
      ),
    [data.transactions],
  )

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Penjualan &amp; Pasien</h1>
        <p className="app__subtitle">
          Daftar barang, data pasien, transaksi invoice, laporan penjualan.
        </p>
        <nav className="tabs" aria-label="Menu utama">
          {(
            [
              ['barang', 'Daftar barang'],
              ['pasien', 'Data pasien'],
              ['transaksi', 'Transaksi'],
              ['laporan', 'Laporan penjualan'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`tabs__btn${tab === id ? ' tabs__btn--active' : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="app__main">
        {tab === 'barang' && (
          <ProductPanel
            products={data.products}
            onAdd={(name, price) =>
              dispatch({ type: 'ADD_PRODUCT', name, price })
            }
          />
        )}
        {tab === 'pasien' && (
          <PatientPanel
            patients={data.patients}
            onAdd={(name, phone) =>
              dispatch({ type: 'ADD_PATIENT', name, phone })
            }
          />
        )}
        {tab === 'transaksi' && (
          <TransactionPanel
            patients={data.patients}
            products={data.products}
            productById={productById}
            onSubmit={(patient, lines) =>
              dispatch({ type: 'ADD_TRANSACTION', patient, lines })
            }
          />
        )}
        {tab === 'laporan' && (
          <ReportPanel
            transactions={data.transactions}
            salesByProduct={salesByProduct}
            grandTotal={grandTotalAll}
          />
        )}
      </main>
    </div>
  )
}

function ProductPanel({
  products,
  onAdd,
}: {
  products: Product[]
  onAdd: (name: string, price: number) => void
}) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const p = Number(price.replace(/\./g, '').replace(',', '.'))
    if (!name.trim() || !Number.isFinite(p) || p < 0) return
    onAdd(name, Math.round(p))
    setName('')
    setPrice('')
  }

  return (
    <section className="panel" aria-labelledby="h-barang">
      <h2 id="h-barang">Daftar harga barang</h2>
      <p className="panel__hint">
        Kode barang otomatis: <strong>P-YYMM####</strong> (contoh P-23030001).
      </p>

      <form className="form-row" onSubmit={handleSubmit}>
        <label className="field">
          <span>Nama barang</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama"
            required
          />
        </label>
        <label className="field">
          <span>Harga (Rp)</span>
          <input
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            required
          />
        </label>
        <button type="submit" className="btn btn--primary">
          Tambah
        </button>
      </form>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Kode / nama</th>
              <th className="num">Harga</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty">
                  Belum ada barang.
                </td>
              </tr>
            ) : (
              products.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td>
                    <span className="mono">{p.id}</span>
                    <br />
                    {p.name}
                  </td>
                  <td className="num">{formatIdr(p.price)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function PatientPanel({
  patients,
  onAdd,
}: {
  patients: Patient[]
  onAdd: (name: string, phone: string) => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name, phone)
    setName('')
    setPhone('')
  }

  return (
    <section className="panel" aria-labelledby="h-pasien">
      <h2 id="h-pasien">Data pasien</h2>
      <p className="panel__hint">
        Kode pasien otomatis: <strong>EM-YYMM####</strong> (contoh EM-23030001).
      </p>

      <form className="form-row" onSubmit={handleSubmit}>
        <label className="field">
          <span>Nama pasien</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama"
            required
          />
        </label>
        <label className="field">
          <span>Telepon</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08…"
          />
        </label>
        <button type="submit" className="btn btn--primary">
          Tambah
        </button>
      </form>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>ID</th>
              <th>Nama pasien</th>
              <th>Telepon</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty">
                  Belum ada pasien.
                </td>
              </tr>
            ) : (
              patients.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td className="mono">{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.phone || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function TransactionPanel({
  patients,
  products,
  productById,
  onSubmit,
}: {
  patients: Patient[]
  products: Product[]
  productById: Map<string, Product>
  onSubmit: (
    patient: Patient,
    lines: { product: Product; qty: number }[],
  ) => void
}) {
  const [patientId, setPatientId] = useState('')
  const [draftLines, setDraftLines] = useState<DraftLine[]>([
    { productId: '', qty: 1 },
  ])

  const patient = patients.find((p) => p.id === patientId)

  function addRow() {
    setDraftLines((rows) => [...rows, { productId: '', qty: 1 }])
  }

  function updateRow(i: number, patch: Partial<DraftLine>) {
    setDraftLines((rows) =>
      rows.map((r, j) => (j === i ? { ...r, ...patch } : r)),
    )
  }

  function removeRow(i: number) {
    setDraftLines((rows) => rows.filter((_, j) => j !== i))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!patient) return
    const resolved: { product: Product; qty: number }[] = []
    for (const row of draftLines) {
      if (!row.productId) continue
      const product = productById.get(row.productId)
      if (!product) continue
      const qty = Math.max(1, Math.floor(Number(row.qty) || 0))
      resolved.push({ product, qty })
    }
    if (resolved.length === 0) return
    onSubmit(patient, resolved)
    setDraftLines([{ productId: '', qty: 1 }])
    setPatientId('')
  }

  const previewTotal = draftLines.reduce((sum, row) => {
    const pr = row.productId ? productById.get(row.productId) : undefined
    const q = Math.max(0, Math.floor(Number(row.qty) || 0))
    if (!pr || q <= 0) return sum
    return sum + pr.price * q
  }, 0)

  return (
    <section className="panel" aria-labelledby="h-tx">
      <h2 id="h-tx">Transaksi</h2>
      <p className="panel__hint">
        Pilih pasien dan item; nomor invoice format{' '}
        <strong>INV-YYMM####</strong>.
      </p>

      {patients.length === 0 || products.length === 0 ? (
        <p className="panel__warn">
          Lengkapi minimal satu barang dan satu pasien di tab lain terlebih
          dahulu.
        </p>
      ) : (
        <form className="tx-form" onSubmit={handleSubmit}>
          <label className="field field--block">
            <span>Pasien</span>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              required
            >
              <option value="">— Pilih pasien —</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} — {p.name}
                </option>
              ))}
            </select>
          </label>

          <div className="tx-lines">
            <div className="tx-lines__head">
              <span>Item</span>
              <span className="num">Jumlah</span>
              <span />
            </div>
            {draftLines.map((row, i) => (
              <div key={i} className="tx-line">
                <select
                  value={row.productId}
                  onChange={(e) =>
                    updateRow(i, { productId: e.target.value })
                  }
                  required={i === 0}
                >
                  <option value="">— Barang —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatIdr(p.price)})
                    </option>
                  ))}
                </select>
                <input
                  className="qty"
                  type="number"
                  min={1}
                  value={row.qty}
                  onChange={(e) =>
                    updateRow(i, { qty: Number(e.target.value) })
                  }
                />
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => removeRow(i)}
                  disabled={draftLines.length <= 1}
                  aria-label="Hapus baris"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="tx-actions">
            <button type="button" className="btn" onClick={addRow}>
              + Baris
            </button>
            <button type="submit" className="btn btn--primary">
              Simpan transaksi
            </button>
          </div>
        </form>
      )}

      <InvoicePreview
        patient={patient}
        draftLines={draftLines}
        productById={productById}
        previewTotal={previewTotal}
      />
    </section>
  )
}

function InvoicePreview({
  patient,
  draftLines,
  productById,
  previewTotal,
}: {
  patient: Patient | undefined
  draftLines: DraftLine[]
  productById: Map<string, Product>
  previewTotal: number
}) {
  const rows = draftLines
    .map((row) => {
      const pr = row.productId ? productById.get(row.productId) : undefined
      const q = Math.max(0, Math.floor(Number(row.qty) || 0))
      if (!pr || q <= 0) return null
      return {
        name: pr.name,
        price: pr.price,
        qty: q,
        sub: pr.price * q,
      }
    })
    .filter(Boolean) as {
    name: string
    price: number
    qty: number
    sub: number
  }[]

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
            <span className="lbl">tanggal</span>{' '}
            {formatDateId(new Date().toISOString())}
          </div>
        </div>
        <div>
          <div>
            <span className="lbl">ID pasien</span>{' '}
            <span className="mono">{patient?.id ?? '—'}</span>
          </div>
          <div>
            <span className="lbl">nama pasien</span> {patient?.name ?? '—'}
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
            <td className="num invoice__total-val">{formatIdr(previewTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function ReportPanel({
  transactions,
  salesByProduct,
  grandTotal,
}: {
  transactions: Transaction[]
  salesByProduct: { id: string; name: string; qty: number; revenue: number }[]
  grandTotal: number
}) {
  return (
    <section className="panel" aria-labelledby="h-report">
      <h2 id="h-report">Laporan penjualan</h2>
      <p className="panel__hint">
        Ringkasan dari semua transaksi (invoice) yang tersimpan di perangkat
        ini.
      </p>

      <div className="stat-grid">
        <div className="stat">
          <span className="stat__label">Total transaksi</span>
          <span className="stat__value">{transactions.length}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Omzet kumulatif</span>
          <span className="stat__value">{formatIdr(grandTotal)}</span>
        </div>
      </div>

      <h3 className="subhead">Detail per transaksi</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>No Invoice</th>
              <th>Tanggal</th>
              <th>ID pasien</th>
              <th>Nama pasien</th>
              <th className="num">Total</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty">
                  Belum ada transaksi.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.invoiceNo}>
                  <td className="mono">{t.invoiceNo}</td>
                  <td>{formatDateId(t.dateISO)}</td>
                  <td className="mono">{t.patientId}</td>
                  <td>{t.patientName}</td>
                  <td className="num">
                    {formatIdr(
                      t.lines.reduce((s, l) => s + l.price * l.qty, 0),
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h3 className="subhead">Agregasi per barang</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kode (referensi)</th>
              <th>Nama barang</th>
              <th className="num">Qty terjual</th>
              <th className="num">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {salesByProduct.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty">
                  —
                </td>
              </tr>
            ) : (
              salesByProduct.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.id}</td>
                  <td>{r.name}</td>
                  <td className="num">{r.qty}</td>
                  <td className="num">{formatIdr(r.revenue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
