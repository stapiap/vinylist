import { useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, newId } from '../db'
import { Cover } from '../components/AlbumCard'
import { getProfileName } from '../lib/profile'

/**
 * Lista de deseos de la familia. En esta versión vive en el celular;
 * cuando se active la nube, la lista se comparte y el "apartado para regalo"
 * se le oculta a quien lo quiere.
 */
export function Wishlist() {
  const items = useLiveQuery(() => db.wishlist.orderBy('addedAt').reverse().toArray(), []) ?? []
  const me = getProfileName()
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')

  async function add(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await db.wishlist.add({ id: newId(), title: title.trim(), artist: artist.trim() || 'Artista por confirmar', wantedBy: me, addedAt: new Date().toISOString() })
    setTitle('')
    setArtist('')
  }

  return (
    <main className="page">
      <div className="stack" style={{ gap: 2 }}>
        <span className="eyebrow">Surcos</span>
        <h1>Lista de deseos</h1>
        <span className="muted">Lo que la familia quiere tener. Útil para regalos.</span>
      </div>

      <form className="card stack" onSubmit={add}>
        <label className="field"><span>Álbum</span><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Wish You Were Here" /></label>
        <label className="field"><span>Artista</span><input className="input" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Pink Floyd" /></label>
        <button className="btn btn--primary" type="submit">Agregar a mis deseos</button>
      </form>

      {items.length === 0 && <div className="empty"><p>Aún no hay deseos. Agrega el primero arriba.</p></div>}

      <div className="stack" style={{ gap: 10 }}>
        {items.map((it) => {
          const reservedByOther = it.reservedBy && it.reservedBy !== it.wantedBy
          const hideFromWanter = reservedByOther && it.wantedBy === me
          return (
            <div className="result" key={it.id}>
              <Cover src={it.coverUrl} title={it.title} className="thumb" />
              <div className="grow stack" style={{ gap: 2 }}>
                <span className="result__title">{it.title}</span>
                <span className="result__meta">{it.artist}{it.year ? ` · ${it.year}` : ''}</span>
                <span className="result__meta">Lo quiere: {it.wantedBy}</span>
              </div>
              {it.wantedBy === me ? (
                <button className="btn btn--sm" onClick={() => db.wishlist.delete(it.id)}>Quitar</button>
              ) : hideFromWanter ? null : (
                <button className={`btn btn--sm ${it.reservedBy ? '' : 'btn--primary'}`} onClick={() => db.wishlist.update(it.id, { reservedBy: it.reservedBy ? undefined : me })}>
                  {it.reservedBy ? 'Apartado' : 'Lo regalo yo'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
