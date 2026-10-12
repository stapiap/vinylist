import type { ReleaseCandidate } from '../types'
import { Cover } from './AlbumCard'
import { spotifySearchUrl } from '../lib/spotify'

interface Props {
  candidates: ReleaseCandidate[]
  onPick: (c: ReleaseCandidate) => void
  busyId?: string
}

/** Lista de ediciones encontradas para que el usuario elija la que tiene en la mano. */
export function CandidateList({ candidates, onPick, busyId }: Props) {
  return (
    <div className="stack" style={{ gap: 10 }}>
      {candidates.map((c) => (
        <div className="result" key={`${c.source}-${c.sourceId}`}>
          <Cover src={c.thumbUrl} title="" className="thumb" />
          <div className="grow stack" style={{ gap: 2 }}>
            <span className="result__title">{c.title}</span>
            <span className="result__meta">{c.artist}{c.year ? ` · ${c.year}` : ''}</span>
            <span className="result__meta">{[c.country, c.label, c.catalogNumber, c.format].filter(Boolean).join(' · ')}</span>
            <a className="result__meta" href={spotifySearchUrl(c.artist, c.title)} target="_blank" rel="noreferrer" aria-label={`Escuchar «${c.title}» en Spotify`} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, margin: '-10px 0', color: 'var(--accent)', fontWeight: 700 }}>Escuchar en Spotify</a>
          </div>
          <button className="btn btn--primary btn--sm" onClick={() => onPick(c)} disabled={busyId === c.sourceId}>
            {busyId === c.sourceId ? '…' : 'Elegir'}
          </button>
        </div>
      ))}
      <span className="muted">Datos e imágenes de {candidates[0]?.source === 'musicbrainz' ? 'MusicBrainz y Cover Art Archive' : 'Discogs'}</span>
    </div>
  )
}
