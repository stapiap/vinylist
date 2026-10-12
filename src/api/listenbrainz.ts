/**
 * ListenBrainz Labs: artistas parecidos, datos abiertos (CC0), sin clave ni cuenta.
 * https://labs.api.listenbrainz.org/similar-artists/json
 */
const BASE = 'https://labs.api.listenbrainz.org'
const ALGORITHM = 'session_based_days_7500_session_300_contribution_5_threshold_10_limit_100_filter_True_skip_30'

export interface SimilarArtist {
  mbid: string
  name: string
  /** 0..1, relativo al más parecido de la lista. */
  similarity: number
}

export async function similarArtists(artistMbid: string, limit = 10): Promise<SimilarArtist[]> {
  const url = new URL(`${BASE}/similar-artists/json`)
  url.searchParams.set('artist_mbids', artistMbid)
  url.searchParams.set('algorithm', ALGORITHM)
  const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`ListenBrainz respondió ${res.status}`)
  const data = (await res.json()) as { artist_mbid: string; name: string; score: number }[]
  const rows = Array.isArray(data) ? data : []
  const max = rows.reduce((m, r) => Math.max(m, r.score), 0)
  return rows
    .filter((r) => r.artist_mbid !== artistMbid)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => ({ mbid: r.artist_mbid, name: r.name, similarity: max ? r.score / max : 0 }))
}
