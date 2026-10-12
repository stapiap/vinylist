import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, deleteAlbum, updateAlbum } from '../db'
import { StarRating } from '../components/StarRating'
import { Cover } from '../components/AlbumCard'
import { BackIcon, EditIcon } from '../components/Icons'
import { formatStars } from '../lib/rating'
import { resolveSpotifyAlbumId, spotifyUrlFor } from '../lib/spotifyLink'
import { CONDITIONS, type Album, type Condition } from '../types'

export function AlbumPage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const album = useLiveQuery(() => db.albums.get(id), [id])
  const [editing, setEditing] = useState(false)

  // Busca una sola vez el ID exacto de Spotify; la ficha se actualiza sola cuando llega.
  useEffect(() => {
    if (album) void resolveSpotifyAlbumId(album)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [album?.id, album?.spotifyCheckedAt])

  if (album === undefined) return <main className="page"><p className="muted">Cargando…</p></main>
  if (album === null) return <main className="page"><p>Este disco ya no está en la colección.</p><Link to="/" className="btn">Volver</Link></main>

  const spotify = spotifyUrlFor(album)
  const discogs = album.discogsId ? `https://www.discogs.com/release/${album.discogsId}` : undefined

  return (
    <main className="page page--flush">
      <div className="hero">
        <Cover src={album.coverUrl ?? album.thumbUrl} title={album.title} className="hero__img" />
        <button className="icon-btn" aria-label="Volver" onClick={() => nav(-1)}><BackIcon /></button>
        <button className="icon-btn icon-btn--right" aria-label="Editar datos" onClick={() => setEditing(true)}><EditIcon /></button>
      </div>

      <div className="stack" style={{ gap: 4 }}>
        <h1 style={{ fontSize: 28 }}>{album.title}</h1>
        <span className="muted" style={{ fontSize: 15 }}>{[album.artist, album.year, album.label].filter(Boolean).join(' · ')}</span>
        <div className="row" style={{ flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {[...album.genres, ...album.styles.slice(0, 2), album.format, album.country].filter(Boolean).map((t) => <span className="tag" key={t}>{t}</span>)}
        </div>
      </div>

      <section className="card stack" aria-labelledby="rating-h">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span id="rating-h" style={{ fontWeight: 700, fontSize: 14 }}>Tu calificación</span>
          <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 22, color: 'var(--accent)' }}>{album.rating ? `${formatStars(album.rating)} / 5` : '—'}</span>
        </div>
        <StarRating value={album.rating} onChange={(r) => updateAlbum(album.id, { rating: r })} />
        <span className="muted" style={{ fontSize: 13 }}>Toca la mitad izquierda de una estrella para media estrella.</span>
      </section>

      <div className="facts">
        <div className="fact"><span>Estado disco / funda</span><span>{album.mediaCondition ?? '—'} / {album.sleeveCondition ?? '—'}</span></div>
        <div className="fact"><span>Ubicación</span><span>{album.location || '—'}</span></div>
        <div className="fact"><span>Compra</span><span>{[album.purchaseDate, album.purchasePrice !== undefined ? `$${album.purchasePrice}` : undefined, album.purchasePlace].filter(Boolean).join(' · ') || '—'}</span></div>
        <div className="fact"><span>Catálogo / código</span><span>{[album.catalogNumber, album.barcode].filter(Boolean).join(' · ') || '—'}</span></div>
      </div>

      {album.notes && <p className="card" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{album.notes}</p>}

      {album.tracklist.length > 0 && (
        <section className="stack">
          <h3>Canciones</h3>
          {album.tracklist.map((t, i) => (
            <div className="track" key={`${t.position}-${i}`}><span>{t.position}</span><span>{t.title}</span><span>{t.duration}</span></div>
          ))}
        </section>
      )}

      <div className="row" style={{ flexWrap: 'wrap' }}>
        <a className="btn btn--sm" href={spotify} target="_blank" rel="noreferrer">Escuchar en Spotify</a>
        {discogs && <a className="btn btn--sm" href={discogs} target="_blank" rel="noreferrer">Ver en Discogs</a>}
        <button className="btn btn--sm btn--danger" onClick={async () => { if (confirm(`¿Quitar "${album.title}" de la colección?`)) { await deleteAlbum(album.id); nav('/', { replace: true }) } }}>Quitar</button>
      </div>

      {editing && <EditSheet album={album} onClose={() => setEditing(false)} />}
    </main>
  )
}

function EditSheet({ album, onClose }: { album: Album; onClose: () => void }) {
  const [f, setF] = useState({
    mediaCondition: album.mediaCondition ?? '',
    sleeveCondition: album.sleeveCondition ?? '',
    location: album.location ?? '',
    purchaseDate: album.purchaseDate ?? '',
    purchasePrice: album.purchasePrice?.toString() ?? '',
    purchasePlace: album.purchasePlace ?? '',
    notes: album.notes ?? '',
  })
  async function save() {
    await updateAlbum(album.id, {
      mediaCondition: (f.mediaCondition || undefined) as Condition | undefined,
      sleeveCondition: (f.sleeveCondition || undefined) as Condition | undefined,
      location: f.location || undefined,
      purchaseDate: f.purchaseDate || undefined,
      purchasePrice: f.purchasePrice ? Number(f.purchasePrice) : undefined,
      purchasePlace: f.purchasePlace || undefined,
      notes: f.notes || undefined,
    })
    onClose()
  }
  const condSelect = (key: 'mediaCondition' | 'sleeveCondition', label: string) => (
    <label className="field"><span>{label}</span>
      <select className="select" value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })}>
        <option value="">Sin indicar</option>
        {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.value} · {c.label}</option>)}
      </select>
    </label>
  )
  return (
    <div className="sheet" onClick={onClose}>
      <form className="sheet__panel" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); save() }}>
        <div className="sheet__handle" />
        <h2>Datos de tu copia</h2>
        <div className="facts">
          {condSelect('mediaCondition', 'Estado del disco')}
          {condSelect('sleeveCondition', 'Estado de la funda')}
        </div>
        <label className="field"><span>Dónde está guardado</span><input className="input" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="Repisa 2, caja B" /></label>
        <div className="facts">
          <label className="field"><span>Fecha de compra</span><input className="input" type="date" value={f.purchaseDate} onChange={(e) => setF({ ...f, purchaseDate: e.target.value })} /></label>
          <label className="field"><span>Precio</span><input className="input" inputMode="decimal" value={f.purchasePrice} onChange={(e) => setF({ ...f, purchasePrice: e.target.value })} placeholder="0" /></label>
        </div>
        <label className="field"><span>Dónde lo compraste</span><input className="input" value={f.purchasePlace} onChange={(e) => setF({ ...f, purchasePlace: e.target.value })} placeholder="Tienda o sitio" /></label>
        <label className="field"><span>Notas</span><textarea className="textarea" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></label>
        <div className="row">
          <button type="button" className="btn grow" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn--primary grow">Guardar</button>
        </div>
      </form>
    </div>
  )
}
