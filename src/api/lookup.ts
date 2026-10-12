import * as discogs from './discogs'
import * as musicbrainz from './musicbrainz'
import type { ReleaseCandidate } from '../types'

/** Busca primero en Discogs; si no hay nada (o falla), en MusicBrainz. */
export async function lookupBarcode(barcode: string): Promise<ReleaseCandidate[]> {
  return withFallback(() => discogs.searchByBarcode(barcode), () => musicbrainz.searchByBarcode(barcode))
}

export async function lookupText(q: string): Promise<ReleaseCandidate[]> {
  return withFallback(() => discogs.searchByText(q), () => musicbrainz.searchByText(q))
}

async function withFallback(primary: () => Promise<ReleaseCandidate[]>, secondary: () => Promise<ReleaseCandidate[]>) {
  let first: ReleaseCandidate[] = []
  let firstError: unknown
  if (discogs.discogsConfigured()) {
    try {
      first = await primary()
    } catch (e) {
      firstError = e
    }
  }
  if (first.length) return first
  try {
    return await secondary()
  } catch (e) {
    throw friendly(firstError ?? e)
  }
}

function friendly(e: unknown): Error {
  if (e instanceof TypeError) return new Error('Sin conexión. Revisa el internet e intenta de nuevo.')
  return e instanceof Error ? e : new Error('No se pudo buscar.')
}
