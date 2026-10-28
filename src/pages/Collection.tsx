import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { applyFilters, collectDecades, collectGenres, DEFAULT_FILTERS, type Filters } from '../lib/filters'
import { AlbumCard } from '../components/AlbumCard'
import { SearchIcon, ScanIcon, SettingsIcon } from '../components/Icons'
import { Logo } from '../components/Logo'

const SORTS: { value: Filters['sort']; label: string }[] = [
  { value: 'recent', label: 'Agregados recientemente' },
  { value: 'artist', label: 'Artista' },
  { value: 'title', label: 'Título' },
  { value: 'year', label: 'Año' },
  { value: 'rating', label: 'Calificación' },
]

export function Collection() {
  const albums = useLiveQuery(() => db.albums.toArray(), []) ?? []
  const [f, setF] = useState<Filters>(DEFAULT_FILTERS)
  const genres = useMemo(() => collectGenres(albums).slice(0, 12), [albums])
  const decades = useMemo(() => collectDecades(albums), [albums])
  const shown = useMemo(() => applyFilters(albums, f), [albums, f])

  return (
    <main className="page">
      <div className="header">
        <div className="stack" style={{ gap: 8 }}>
          <Logo />
          <div className="title-row">
            <h1>Colección</h1>
            <span className="badge">{albums.length} {albums.length === 1 ? 'disco' : 'discos'}</span>
          </div>
        </div>
        <Link to="/ajustes" className="icon-btn" aria-label="Ajustes"><SettingsIcon /></Link>
      </div>

      <label className="search">
        <SearchIcon width={20} height={20} />
        <span className="visually-hidden">Buscar en la colección</span>
        <input type="search" placeholder="Artista, álbum, sello…" value={f.query} onChange={(e) => setF({ ...f, query: e.target.value })} />
      </label>

      <div className="chips" role="group" aria-label="Filtrar por género">
        <button className={`chip ${!f.genre && f.decade === undefined && f.minRating === undefined ? 'chip--on' : ''}`} onClick={() => setF({ ...f, genre: undefined, decade: undefined, minRating: undefined })}>Todos</button>
        {genres.map((g) => (
          <button key={g} className={`chip ${f.genre === g ? 'chip--on' : ''}`} onClick={() => setF({ ...f, genre: f.genre === g ? undefined : g })}>{g}</button>
        ))}
        {decades.map((d) => (
          <button key={d} className={`chip ${f.decade === d ? 'chip--on' : ''}`} onClick={() => setF({ ...f, decade: f.decade === d ? undefined : d })}>Años {String(d).slice(2)}</button>
        ))}
        <button className={`chip ${f.minRating === 9 ? 'chip--on' : ''}`} onClick={() => setF({ ...f, minRating: f.minRating === 9 ? undefined : 9 })}>4.5+ estrellas</button>
      </div>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <label className="row muted">
          Ordenar:
          <select className="select" style={{ minHeight: 36, padding: '0 8px', width: 'auto', fontSize: 14 }} value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value as Filters['sort'] })}>
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
        <span className="muted">{shown.length !== albums.length ? `${shown.length} de ${albums.length}` : ''}</span>
      </div>

      {albums.length === 0 ? (
        <div className="empty">
          <div className="empty__tiles" aria-hidden="true"><i /><i /><i /><i /></div>
          <h2>Tu colección empieza aquí</h2>
          <p>Escanea el código de barras de un disco o búscalo por nombre. La portada y los datos se llenan solos.</p>
          <Link to="/escanear" className="btn btn--primary"><ScanIcon width={20} height={20} /> Escanear un disco</Link>
          <Link to="/buscar" className="btn">Buscar a mano</Link>
        </div>
      ) : shown.length === 0 ? (
        <div className="empty"><p>Ningún disco coincide con ese filtro.</p></div>
      ) : (
        <div className="grid">
          {shown.map((a) => <AlbumCard key={a.id} album={a} />)}
        </div>
      )}
    </main>
  )
}
