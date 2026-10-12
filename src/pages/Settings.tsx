import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, exportCollection } from '../db'
import { getProfileName, setProfileName } from '../lib/profile'
import { discogsConfigured } from '../api/discogs'
import { BackIcon } from '../components/Icons'
import type { Album } from '../types'

export function Settings() {
  const albums = useLiveQuery(() => db.albums.toArray(), []) ?? []
  const [name, setName] = useState(getProfileName())
  const [msg, setMsg] = useState<string | null>(null)
  const cloud = Boolean(import.meta.env.VITE_SUPABASE_URL)

  function download() {
    const blob = new Blob([exportCollection(albums)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `surcos-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function importFile(file: File) {
    try {
      const data = JSON.parse(await file.text()) as { albums?: Album[] }
      if (!Array.isArray(data.albums)) throw new Error('El archivo no es un respaldo de Surcos.')
      await db.albums.bulkPut(data.albums)
      setMsg(`Se importaron ${data.albums.length} discos.`)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'No se pudo importar.')
    }
  }

  return (
    <main className="page">
      <div className="row">
        <Link to="/" className="icon-btn" aria-label="Volver"><BackIcon /></Link>
        <h1>Ajustes</h1>
      </div>

      <section className="card stack">
        <h3>Quién usa este celular</h3>
        <label className="field"><span>Tu nombre (para las calificaciones y los deseos)</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setProfileName(name)} />
        </label>
      </section>

      <section className="card stack">
        <h3>Fuentes de datos</h3>
        <p className="muted" style={{ margin: 0 }}>
          Discogs: {discogsConfigured() ? 'configurado' : 'sin configurar (se usa MusicBrainz, sin géneros ni canciones)'}.<br />
          Nube familiar: {cloud ? 'configurada' : 'pendiente. Por ahora la colección vive en este celular.'}
        </p>
      </section>

      <section className="card stack">
        <h3>Respaldo</h3>
        <p className="muted" style={{ margin: 0 }}>Tus datos siempre son tuyos. Descarga un respaldo o restaura uno.</p>
        <div className="row">
          <button className="btn grow" onClick={download} disabled={albums.length === 0}>Descargar respaldo</button>
          <label className="btn grow">Restaurar<input type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} /></label>
        </div>
        {msg && <div className="notice">{msg}</div>}
      </section>

      <p className="muted">Surcos v{__APP_VERSION__}. Hecha para la familia, sin membresías.</p>
    </main>
  )
}
