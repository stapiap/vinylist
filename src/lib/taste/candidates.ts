import type { TasteProfile } from './profile'
import type { Candidate } from './rank'
import { cached, type ServedInfo } from '../../db'
import { artistKey } from '../text'
import * as discogs from '../../api/discogs'
import * as mb from '../../api/musicbrainz'
import { similarArtists } from '../../api/listenbrainz'

const SEED_ARTISTS = 5
const SIMILAR_SEEDS = 3
const SIMILAR_PER_SEED = 4
const TTL_DAYS = 30

export interface Progress {
  step: string
  done: number
  total: number
}

export interface CandidateRun {
  candidates: Candidate[]
  /** Fecha del dato más viejo que se usó (para decir "de hace N días"). */
  dataFrom?: string
  /** Alguna consulta falló y se usó lo guardado aunque estuviera vencido. */
  usedStale: boolean
}

interface Ctx {
  get: <T>(key: string, fetcher: () => Promise<T>) => Promise<T>
}

/**
 * Genera candidatos en dos rondas:
 *  A. Otros discos de tus artistas favoritos (Discogs si hay token, si no MusicBrainz).
 *  B. Discos de artistas parecidos a tus favoritos (ListenBrainz Labs + los mismos catálogos).
 * Todo se guarda 30 días en el celular; los errores por artista no detienen el resto.
 */
export async function generateCandidates(profile: TasteProfile, onProgress?: (p: Progress) => void, force = false, signal?: AbortSignal): Promise<CandidateRun> {
  const run: CandidateRun = { candidates: [], usedStale: false }
  const served = (info: ServedInfo) => {
    if (info.stale) run.usedStale = true
    if (!run.dataFrom || info.fetchedAt < run.dataFrom) run.dataFrom = info.fetchedAt
  }
  const ctx: Ctx = { get: (key, fetcher) => cached(key, TTL_DAYS, fetcher, force, served) }
  const out = run.candidates
  const seeds = profile.topArtists.slice(0, SEED_ARTISTS)
  const total = seeds.length + Math.min(SIMILAR_SEEDS, seeds.length)
  let done = 0

  for (const seed of seeds) {
    if (signal?.aborted) return run
    onProgress?.({ step: `Buscando más discos de ${seed.name}`, done, total })
    try {
      const albums = await albumsByArtist(seed.name, seed.musicbrainzArtistId, ctx)
      out.push(...albums.map((a) => ({ ...a, source: 'same-artist' as const, seedArtist: seed.name })))
    } catch {
      // Sin datos para este artista; seguimos con el siguiente.
    }
    done++
  }

  const known = new Set(profile.artists.keys())
  for (const seed of seeds.slice(0, SIMILAR_SEEDS)) {
    if (signal?.aborted) return run
    onProgress?.({ step: `Buscando artistas parecidos a ${seed.name}`, done, total })
    try {
      const mbid = seed.musicbrainzArtistId ?? (await ctx.get(`mb:artist:${artistKey(seed.name)}`, () => mb.findArtistMbid(seed.name)))
      if (mbid) {
        const similar = await ctx.get(`lb:similar:${mbid}`, () => similarArtists(mbid, 15))
        const fresh = similar.filter((s) => !known.has(artistKey(s.name))).slice(0, SIMILAR_PER_SEED)
        for (const s of fresh) {
          if (signal?.aborted) return run
          try {
            const albums = await albumsByArtist(s.name, s.mbid, ctx)
            // Solo los 3 más conocidos de cada artista parecido, para no inundar la lista.
            const top = albums.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).slice(0, 3)
            out.push(...top.map((a) => ({ ...a, source: 'similar-artist' as const, seedArtist: seed.name, similarity: s.similarity })))
          } catch {
            // Siguiente artista parecido.
          }
        }
      }
    } catch {
      // Sin artistas parecidos para esta semilla.
    }
    done++
  }
  onProgress?.({ step: 'Ordenando', done: total, total })
  return run
}

type AlbumInfo = Omit<Candidate, 'source' | 'seedArtist' | 'similarity'>

async function albumsByArtist(name: string, mbid: string | undefined, ctx: Ctx): Promise<AlbumInfo[]> {
  if (discogs.discogsConfigured()) {
    try {
      const masters = await ctx.get(`dg:masters:${artistKey(name)}`, () => discogs.searchMasters(name))
      if (masters.length) return masters.map((m) => ({ title: m.title, artist: m.artist, year: m.year, genres: m.genres, styles: m.styles, thumbUrl: m.thumbUrl, coverUrl: m.coverUrl, discogsMasterId: m.id, popularity: m.popularity }))
    } catch {
      // Discogs falló (sin token válido, límite): se sigue con MusicBrainz.
    }
  }
  const artistMbid = mbid ?? (await ctx.get(`mb:artist:${artistKey(name)}`, () => mb.findArtistMbid(name)))
  if (!artistMbid) return []
  const groups = await ctx.get(`mb:rgs:${artistMbid}`, () => mb.browseReleaseGroups(artistMbid))
  return groups
    .filter((g) => !g.secondaryTypes.some((t) => /compilation|remix|dj-mix|mixtape|demo|soundtrack|interview|spokenword|audiobook|audio drama/i.test(t)))
    .map((g) => ({ title: g.title, artist: name, year: g.year, genres: g.genres, styles: [], thumbUrl: mb.releaseGroupCoverUrl(g.id, 250), coverUrl: mb.releaseGroupCoverUrl(g.id, 500), musicbrainzReleaseGroupId: g.id, secondary: g.secondaryTypes.some((t) => /live/i.test(t)) || undefined }))
}
