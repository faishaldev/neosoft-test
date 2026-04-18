import { useAppData } from './hooks/useAppData'
import { useSyncedTab } from './hooks/useSyncedTab'
import { AppHeader } from './components/AppHeader'
import { ProductPanel } from './components/ProductPanel'
import { PatientPanel } from './components/PatientPanel'
import { TransactionPanel } from './components/TransactionPanel'
import { ReportPanel } from './components/ReportPanel'
import './App.css'

export default function App() {
  const {
    data,
    dispatch,
    productById,
    salesByProduct,
    grandTotal,
  } = useAppData()
  const [tab, setTab] = useSyncedTab()

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Langsung ke konten
      </a>

      <AppHeader tab={tab} onTabChange={setTab} />

      <main id="main-content" className="app__main" tabIndex={-1}>
        {tab === 'barang' && (
          <div
            role="tabpanel"
            id="panel-barang"
            aria-labelledby="tab-barang"
          >
            <ProductPanel
              products={data.products}
              onAdd={(name, price) =>
                dispatch({ type: 'ADD_PRODUCT', name, price })
              }
              onImportProducts={(rows) =>
                dispatch({ type: 'IMPORT_PRODUCTS', rows })
              }
              onUpdateProduct={(id, name, price) =>
                dispatch({ type: 'UPDATE_PRODUCT', id, name, price })
              }
              onSetProductArchived={(id, archived) =>
                dispatch({ type: 'SET_PRODUCT_ARCHIVED', id, archived })
              }
            />
          </div>
        )}
        {tab === 'pasien' && (
          <div
            role="tabpanel"
            id="panel-pasien"
            aria-labelledby="tab-pasien"
          >
            <PatientPanel
              patients={data.patients}
              onAdd={(name, phone) =>
                dispatch({ type: 'ADD_PATIENT', name, phone })
              }
              onImportPatients={(rows) =>
                dispatch({ type: 'IMPORT_PATIENTS', rows })
              }
              onUpdatePatient={(id, name, phone) =>
                dispatch({ type: 'UPDATE_PATIENT', id, name, phone })
              }
              onSetPatientArchived={(id, archived) =>
                dispatch({ type: 'SET_PATIENT_ARCHIVED', id, archived })
              }
            />
          </div>
        )}
        {tab === 'transaksi' && (
          <div
            role="tabpanel"
            id="panel-transaksi"
            aria-labelledby="tab-transaksi"
          >
            <TransactionPanel
              patients={data.patients}
              products={data.products}
              productById={productById}
              onSubmit={(patient, lines) =>
                dispatch({ type: 'ADD_TRANSACTION', patient, lines })
              }
            />
          </div>
        )}
        {tab === 'laporan' && (
          <div
            role="tabpanel"
            id="panel-laporan"
            aria-labelledby="tab-laporan"
          >
            <ReportPanel
              transactions={data.transactions}
              salesByProduct={salesByProduct}
              grandTotal={grandTotal}
            />
          </div>
        )}
      </main>

      <footer className="app__footer no-print">
        <p className="app__footer-text">PT Neosoft Teknologi Asia</p>
      </footer>
    </div>
  )
}
