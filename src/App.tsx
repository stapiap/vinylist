import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Collection } from './pages/Collection'
import { Search } from './pages/Search'
import { AlbumPage } from './pages/AlbumPage'
import { Wishlist } from './pages/Wishlist'
import { Settings } from './pages/Settings'
import { ForYou } from './pages/ForYou'
import { TabBar } from './components/TabBar'

// El lector de códigos pesa bastante; se carga solo al abrir el escáner.
const Scan = lazy(() => import('./pages/Scan').then((m) => ({ default: m.Scan })))

function Shell() {
  const { pathname } = useLocation()
  const hideTabs = pathname.startsWith('/album/') || pathname.startsWith('/escanear')
  return (
    <>
      <Routes>
        <Route path="/" element={<Collection />} />
        <Route path="/buscar" element={<Search />} />
        <Route path="/escanear" element={<Suspense fallback={<main className="page"><p className="muted">Abriendo la cámara…</p></main>}><Scan /></Suspense>} />
        <Route path="/album/:id" element={<AlbumPage />} />
        <Route path="/para-ti" element={<ForYou />} />
        <Route path="/deseos" element={<Wishlist />} />
        <Route path="/ajustes" element={<Settings />} />
      </Routes>
      {!hideTabs && <TabBar />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
