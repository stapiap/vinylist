import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Album } from '../types'
import { formatStars } from '../lib/rating'
import { StarPath } from './Icons'

/** Portada; si la imagen no carga (o no hay), muestra el título sobre un fondo. */
export function Cover({ src, title, className = 'cover' }: { src?: string; title: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (src && !failed) return <img className={className} src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
  return <div className={`${className} cover--placeholder`}>{title}</div>
}

export function AlbumCard({ album }: { album: Album }) {
  return (
    <Link to={`/album/${album.id}`} className="album-card">
      <Cover src={album.coverUrl ?? album.thumbUrl} title={album.title} />
      <div className="stack" style={{ gap: 2 }}>
        <span className="album-card__title">{album.title}</span>
        <span className="album-card__meta">{album.artist}{album.year ? ` · ${album.year}` : ''}</span>
        {album.rating ? (
          <span className="rating-inline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><StarPath /></svg>
            {formatStars(album.rating)}
          </span>
        ) : (
          <span className="album-card__meta">Sin calificar</span>
        )}
      </div>
    </Link>
  )
}
