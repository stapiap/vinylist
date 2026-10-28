import { useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, newId } from '../db'
import { Cover } from '../components/AlbumCard'
import { SpotifyIcon } from '../components/Icons'
import { Logo } from '../components/Logo'
import { getProfileName } from '../lib/profile'
import { spotifySearchUrl } from '../lib/spotify'

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
      <div className="stack" style={{ gap: 8 }}>
        <Logo />
        <div className="title-row">
          <h1>Deseos</h1>
          {items.length > 0 && <span className="badge">{items.length} {items.length === 1 ? 'disco' : 'discos'}</span>}
        </div>
        <span className="muted">Lo que quiere la familia. Si alguien lo aparta para regalarlo, el que lo pidió no lo ve.</span>
      </div>

      {items.length === 0 && <div className="empty"><p>Aún no hay deseos. Agrega el primero aquí abajo.</p></div>}

      <div className="stack" style={{ gap: 10 }}>
        {items.map((it) => {
          const reservedByOther = it.reservedBy && it.reservedBy !== it.wantedBy
          const hideFromWanter = reservedByOther && it.wantedBy === me
          return (
            <div className="card stack" key={it.id} style={{ gap: 10 }}>
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <Cover src={it.coverUrl} title={it.title} className="wish__cover" />
                <div className="grow stack" style={{ gap: 2 }}>
                  <span className="result__title">{it.title}</span>
                  <span className="result__meta">{it.artist}{it.year ? ` · ${it.year}` : ''}</span>
                  <span className="result__meta">Lo quiere {it.wantedBy === me ? `${it.wantedBy} (tú)` : it.wantedBy}</span>
                </div>
              </div>
              <div className="row">
                <a className="btn btn--sm grow" href={spotifySearchUrl(it.artist, it.title)} target="_blank" rel="noreferrer">
                  <SpotifyIcon width={18} height={18} className="spotify" /> Escuchar<span className="visually-hidden"> «{it.title}» en Spotify</span>
                </a>
                {it.wantedBy === me ? (
                  <button className="btn btn--sm grow" onClick={() => db.wishlist.delete(it.id)}>Quitar</button>
                ) : hideFromWanter ? null : (
                  <button className={`btn btn--sm grow ${it.reservedBy ? '' : 'btn--primary'}`} onClick={() => db.wishlist.update(it.id, { reservedBy: it.reservedBy ? undefined : me })}>
                    {it.reservedBy ? 'Ya apartado' : 'Lo regalo yo'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <form className="card stack" onSubmit={add}>
        <span className="eyebrow">Agregar un deseo</span>
        <label className="field"><span>Álbum</span><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Wish You Were Here" /></label>
        <label className="field"><span>Artista</span><input className="input" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Pink Floyd" /></label>
        <button className="btn btn--primary" type="submit">Agregar a mis deseos</button>
      </form>
    </main>
  )
}
