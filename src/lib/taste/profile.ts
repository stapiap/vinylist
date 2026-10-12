import type { Album } from '../../types'
import { albumKey, artistKey, cleanArtist, isVariousArtists, normalize, tagLabel } from '../text'
import { decadeOf } from '../filters'

/**
 * Perfil de gustos calculado en el celular, sin servicios externos.
 * Son contadores con peso: fácil de leer, de probar y de explicar.
 *
 * Cada disco emite un "voto" v = s × rec:
 *  - s (calificación): 5 estrellas = +1, 4 = +0.5, 3 = 0, 2 = -0.5, 1 = -1.
 *    Sin calificar = +0.25 (lo compró, algo le gustó).
 *  - rec (recencia): compras recientes pesan más; mínimo 0.5 para que
 *    los favoritos viejos no desaparezcan (vida media de un año).
 */

export interface ArtistTaste {
  key: string
  name: string
  /** -1 a 1, normalizado contra el artista más fuerte. */
  score: number
  raw: number
  count: number
  bestAlbum: string
  bestRating?: number
  musicbrainzArtistId?: string
}

export interface TasteProfile {
  albumCount: number
  ratedCount: number
  /** none: sin discos · low: pocos o calificaciones poco informativas · ok */
  confidence: 'none' | 'low' | 'ok'
  artists: Map<string, ArtistTaste>
  /** tag normalizado → puntaje -1..1 */
  tags: Map<string, number>
  /** tag normalizado → nombre para mostrar */
  tagNames: Map<string, string>
  decades: Map<number, number>
  ownedKeys: Set<string>
  ownedMasterIds: Set<number>
  topArtists: ArtistTaste[]
  topTags: { name: string; score: number }[]
  topDecades: { decade: number; score: number }[]
}

export function ratingSignal(rating?: number): number {
  if (!rating) return 0.25
  return clamp((rating - 6) / 4, -1, 1)
}

export function recencySignal(album: Pick<Album, 'purchaseDate' | 'addedAt'>, now: Date): number {
  const when = Date.parse(album.purchaseDate || album.addedAt)
  if (Number.isNaN(when)) return 0.5
  const months = Math.max(0, (now.getTime() - when) / (30.44 * 24 * 3600 * 1000))
  return 0.5 + 0.5 * Math.pow(2, -months / 12)
}

export function albumVote(album: Album, now: Date): number {
  return ratingSignal(album.rating) * recencySignal(album, now)
}

export function buildProfile(albums: Album[], now: Date = new Date()): TasteProfile {
  const artists = new Map<string, ArtistTaste>()
  const tags = new Map<string, number>()
  const tagNames = new Map<string, string>()
  const decades = new Map<number, number>()
  const ownedKeys = new Set<string>()
  const ownedMasterIds = new Set<number>()
  const ratings = new Set<number>()
  let ratedCount = 0

  for (const a of albums) {
    ownedKeys.add(albumKey(a.artist, a.title))
    if (a.discogsMasterId) ownedMasterIds.add(a.discogsMasterId)
    if (a.rating) {
      ratedCount++
      ratings.add(a.rating)
    }
    const v = albumVote(a, now)

    if (!isVariousArtists(a.artist)) {
      const key = artistKey(a.artist)
      const cur = artists.get(key)
      if (!cur) {
        artists.set(key, { key, name: cleanArtist(a.artist), score: 0, raw: v, count: 1, bestAlbum: a.title, bestRating: a.rating, musicbrainzArtistId: a.musicbrainzArtistId })
      } else {
        cur.raw += v
        cur.count++
        if (!cur.musicbrainzArtistId && a.musicbrainzArtistId) cur.musicbrainzArtistId = a.musicbrainzArtistId
        if ((a.rating ?? 0) > (cur.bestRating ?? 0)) {
          cur.bestAlbum = a.title
          cur.bestRating = a.rating
        }
      }
    }

    const albumTags = [...a.genres, ...a.styles].filter(Boolean)
    for (const t of albumTags) {
      const k = normalize(t)
      tags.set(k, (tags.get(k) ?? 0) + v / albumTags.length)
      if (!tagNames.has(k)) tagNames.set(k, tagLabel(t))
    }

    const d = decadeOf(a.year)
    if (d) decades.set(d, (decades.get(d) ?? 0) + v)
  }

  // Un artista no puede dominar todo: tope de ±2 (≈ dos discos favoritos recientes).
  for (const art of artists.values()) art.raw = clamp(art.raw, -2, 2)
  normalizeMap(artists, (x) => x.raw, (x, s) => { x.score = s })
  const tagScores = new Map<string, number>()
  normalizeMap(tags, (x) => x, (_x, s, k) => tagScores.set(k as string, s))
  const decadeScores = new Map<number, number>()
  normalizeMap(decades, (x) => x, (_x, s, k) => decadeScores.set(k as number, s))

  const topArtists = [...artists.values()].filter((a) => a.score > 0).sort((a, b) => b.score - a.score || b.count - a.count)
  const topTags = [...tagScores.entries()].filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).map(([k, s]) => ({ name: tagNames.get(k) ?? k, score: s }))
  const topDecades = [...decadeScores.entries()].filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).map(([decade, score]) => ({ decade, score }))

  const ratingsInformative = ratings.size >= 2
  const confidence: TasteProfile['confidence'] = albums.length === 0 ? 'none' : albums.length < 5 || !ratingsInformative ? 'low' : 'ok'

  return { albumCount: albums.length, ratedCount, confidence, artists, tags: tagScores, tagNames, decades: decadeScores, ownedKeys, ownedMasterIds, topArtists, topTags, topDecades }
}

function normalizeMap<K, V>(map: Map<K, V>, get: (v: V) => number, set: (v: V, score: number, key: K) => void) {
  let max = 0
  for (const v of map.values()) max = Math.max(max, Math.abs(get(v)))
  for (const [k, v] of map) set(v, max ? get(v) / max : 0, k)
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x))
}
