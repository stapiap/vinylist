import type { TasteProfile } from './profile'
import { albumKey, artistKey, decadeLabel, looksLikeCompilation, normalize } from '../text'
import { decadeOf } from '../filters'
import { formatStars } from '../rating'

/** Un disco que podría gustarle, antes de puntuarlo. */
export interface Candidate {
  title: string
  artist: string
  year?: number
  genres: string[]
  styles: string[]
  coverUrl?: string
  thumbUrl?: string
  discogsMasterId?: number
  musicbrainzReleaseGroupId?: string
  source: 'same-artist' | 'similar-artist' | 'style'
  /** Artista de la colección que llevó a este candidato. */
  seedArtist?: string
  /** 0..1, qué tan parecido es el artista al de la semilla (solo similar-artist). */
  similarity?: number
  /** 0..1, qué tan conocido es el disco (de Discogs). */
  popularity?: number
  /** En vivo, recopilación u otro disco "secundario": vale menos como siguiente compra. */
  secondary?: boolean
}

export interface Suggestion extends Candidate {
  key: string
  score: number
  reason: string
}

const WEIGHTS = { seed: 0.5, tags: 0.3, decade: 0.1, popularity: 0.1 }

/**
 * Puntúa y ordena candidatos contra el perfil. Quita lo que ya tienen o ya está
 * en deseos, y evita que un solo artista llene la lista (máximo 2 por artista).
 * La explicación sale de las mismas partes que produjeron el puntaje.
 */
export function rankCandidates(profile: TasteProfile, candidates: Candidate[], wishedKeys: Set<string>, limit = 12): Suggestion[] {
  const best = new Map<string, Suggestion>()

  for (const c of candidates) {
    const key = albumKey(c.artist, c.title)
    if (profile.ownedKeys.has(key) || wishedKeys.has(key)) continue
    if (c.discogsMasterId && profile.ownedMasterIds.has(c.discogsMasterId)) continue

    const parts: { w: number; v: number }[] = []
    const seedTaste = c.seedArtist ? profile.artists.get(artistKey(c.seedArtist)) : undefined
    let seedPart = 0
    if (seedTaste) {
      seedPart = c.source === 'same-artist' ? seedTaste.score : seedTaste.score * (c.similarity ?? 0.5) * 0.8
      parts.push({ w: WEIGHTS.seed, v: seedPart })
    }
    // Sin datos (candidato sin géneros o sin año) la parte se omite; con datos que no
    // coinciden con nada de la colección, la parte vale 0 y sí cuenta en el promedio.
    const allTags = [...c.genres, ...c.styles].map(normalize)
    const tagKeys = allTags.filter((t) => profile.tags.has(t))
    const styleKeys = c.styles.map(normalize).filter((t) => profile.tags.has(t))
    let tagPart = 0
    if (allTags.length) {
      tagPart = tagKeys.length ? tagKeys.reduce((s, t) => s + (profile.tags.get(t) ?? 0), 0) / tagKeys.length : 0
      parts.push({ w: WEIGHTS.tags, v: tagPart })
    }
    const decade = decadeOf(c.year)
    let decadePart = 0
    if (decade !== undefined) {
      decadePart = profile.decades.get(decade) ?? 0
      parts.push({ w: WEIGHTS.decade, v: decadePart })
    }
    if (c.popularity !== undefined) parts.push({ w: WEIGHTS.popularity, v: c.popularity })

    if (!parts.length) continue
    let score = parts.reduce((s, p) => s + p.w * p.v, 0) / parts.reduce((s, p) => s + p.w, 0)
    if (c.secondary || looksLikeCompilation(c.title)) score *= 0.6
    if (score <= 0) continue

    const reason = explain(c, profile, { seedPart, tagPart, decadePart, tagKeys, styleKeys })
    const prev = best.get(key)
    if (!prev || prev.score < score) best.set(key, { ...c, key, score, reason })
  }

  const sorted = [...best.values()].sort((a, b) => b.score - a.score)
  const perArtist = new Map<string, number>()
  const out: Suggestion[] = []
  for (const s of sorted) {
    const k = artistKey(s.artist)
    const n = perArtist.get(k) ?? 0
    if (n >= 2) continue
    perArtist.set(k, n + 1)
    out.push(s)
    if (out.length >= limit) break
  }
  return out
}

/** Un estilo con señal clara explica mejor que el género amplio ("Soft Rock" antes que "Rock"). */
const STYLE_MIN = 0.3

function stars(rating: number): string {
  const s = formatStars(rating)
  return `${s} ${s === '1' ? 'estrella' : 'estrellas'}`
}

function explain(c: Candidate, profile: TasteProfile, p: { seedPart: number; tagPart: number; decadePart: number; tagKeys: string[]; styleKeys: string[] }): string {
  const seed = c.seedArtist ? profile.artists.get(artistKey(c.seedArtist)) : undefined
  let first: string | undefined
  if (seed && p.seedPart > 0) {
    // Solo se cita la calificación cuando es buena (4 estrellas o más); si no, el motivo es tenerlo.
    const rated = seed.bestRating && seed.bestRating >= 8
      ? `le diste ${stars(seed.bestRating)} a «${seed.bestAlbum}»`
      : seed.count > 1 ? `tienes ${seed.count} discos suyos` : `tienes «${seed.bestAlbum}»`
    first = c.source === 'same-artist' ? `Porque ${rated}` : `Suena a ${seed.name}: ${rated}`
  }
  const extra: string[] = []
  if (p.tagPart > 0.4 && p.tagKeys.length) {
    const scored = (keys: string[]) => keys.map((t) => ({ t, s: profile.tags.get(t) ?? 0 })).sort((a, b) => b.s - a.s)
    const style = scored(p.styleKeys).find((x) => x.s >= STYLE_MIN)
    const top = style ?? scored(p.tagKeys)[0]
    extra.push(`te gusta ${style ? 'el estilo' : 'el género'} ${profile.tagNames.get(top.t) ?? top.t}`)
  }
  const decade = decadeOf(c.year)
  if (p.decadePart > 0.5 && decade !== undefined) extra.push(`los ${decadeLabel(decade)}`)

  if (first) return extra.length ? `${first}. Además, ${extra.join(' y también ')}.` : `${first}.`
  if (extra.length) {
    const lead = extra[0].startsWith('los ') ? `te gustan ${extra[0]}` : extra[0]
    return `Porque ${[lead, ...extra.slice(1)].join(' y también ')}.`
  }
  return 'Un disco muy conocido que va con tu colección.'
}
