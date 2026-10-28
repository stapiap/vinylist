import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Album } from '../types'
import { StarRating } from './StarRating'

/** Iniciales para las miniaturas sin portada: "Sketches of Spain" → "SS". */
function initials(title: string): string {
  const words = title.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w))
  return words.slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '·'
}

/** Portada; si la imagen no carga (o no hay), muestra el título (o sus iniciales, en chico) sobre un fondo. */
export function Cover({ src, title, className = 'cover' }: { src?: string; title: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (src && !failed) return <img className={className} src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
  const small = className.includes('thumb') || className.includes('wish__cover')
  return <div className={`${className} cover--placeholder`} aria-label={title}>{small ? initials(title) : title}</div>
}

export function AlbumCard({ album }: { album: Album }) {
  return (
    <Link to={`/album/${album.id}`} className="album-card">
      <Cover src={album.coverUrl ?? album.thumbUrl} title={album.title} />
      <div className="stack" style={{ gap: 3 }}>
        <span className="album-card__title">{album.title}</span>
        <span className="album-card__meta">{album.artist}{album.year ? ` · ${album.year}` : ''}</span>
        {album.rating ? <StarRating value={album.rating} size="sm" /> : <span className="eyebrow">Sin calificar</span>}
      </div>
    </Link>
  )
}
