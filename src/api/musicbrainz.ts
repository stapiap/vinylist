import type { ReleaseCandidate } from '../types'

/**
 * MusicBrainz (https://musicbrainz.org/doc/MusicBrainz_API): base abierta, sin token.
 * Límite: 1 petición por segundo, con User-Agent identificable.
 * Portadas: Cover Art Archive (https://musicbrainz.org/doc/Cover_Art_Archive/API).
 */
const BASE = 'https://musicbrainz.org/ws/2'
const UA = 'Surcos/0.1 (app familiar de vinilos)'

interface MBRelease {
  id: string
  title: string
  date?: string
  country?: string
  barcode?: string
  'artist-credit'?: { name: string; joinphrase?: string }[]
  'label-info'?: { label?: { name: string }; 'catalog-number'?: string }[]
  media?: { format?: string }[]
  'release-group'?: { 'primary-type'?: string }
}

async function search(query: string): Promise<ReleaseCandidate[]> {
  const url = new URL(`${BASE}/release`)
  url.searchParams.set('query', query)
  url.searchParams.set('fmt', 'json')
  url.searchParams.set('limit', '25')
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!res.ok) throw new Error(`MusicBrainz respondió ${res.status}`)
  const data = (await res.json()) as { releases: MBRelease[] }
  return data.releases
    .filter((r) => !r.media?.length || r.media.some((m) => /vinyl/i.test(m.format ?? '')))
    .map((r) => ({
      source: 'musicbrainz' as const,
      sourceId: r.id,
      title: r.title,
      artist: r['artist-credit']?.map((a) => a.name + (a.joinphrase ?? '')).join('') ?? 'Varios',
      year: r.date ? Number(r.date.slice(0, 4)) || undefined : undefined,
      country: r.country,
      label: r['label-info']?.[0]?.label?.name,
      catalogNumber: r['label-info']?.[0]?.['catalog-number'],
      format: r.media?.map((m) => m.format).filter(Boolean).join(', ') || undefined,
      barcode: r.barcode?.replace(/\D/g, '') || undefined,
      thumbUrl: coverUrl(r.id, 250),
      coverUrl: coverUrl(r.id, 500),
      genres: [],
      styles: [],
    }))
}

export function coverUrl(mbid: string, size: 250 | 500 | 1200): string {
  return `https://coverartarchive.org/release/${mbid}/front-${size}`
}

export function searchByBarcode(barcode: string): Promise<ReleaseCandidate[]> {
  return search(`barcode:${barcode.replace(/\D/g, '')}`)
}

export function searchByText(q: string): Promise<ReleaseCandidate[]> {
  return search(`${q} AND format:Vinyl`)
}
