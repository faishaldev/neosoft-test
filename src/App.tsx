import { useState } from 'react'
import { useAppData } from './hooks/useAppData'
import { ProductPanel } from './components/ProductPanel'
import { PatientPanel } from './components/PatientPanel'
import { TransactionPanel } from './components/TransactionPanel'
import { ReportPanel } from './components/ReportPanel'
import { TAB_ITEMS, type Tab } from './lib/tabs'
import './App.css'

export default function App() {
  const {
    data,
    dispatch,
    productById,
    salesByProduct,
    grandTotal,
  } = useAppData()
  const [tab, setTab] = useState<Tab>('barang')

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Penjualan &amp; Pasien</h1>
        <p className="app__subtitle">
          Daftar barang, pasien, transaksi invoice, laporan penjualan.
        </p>
        <nav className="tabs" aria-label="Menu utama">
          {TAB_ITEMS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={
                `tabs__btn${tab === id ? ' tabs__btn--active' : ''}`
              }
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
            grandTotal={grandTotal}
          />
        )}
      </main>
    </div>
  )
}
