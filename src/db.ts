import Dexie, { type EntityTable } from 'dexie'
import type { Album, WishlistItem } from './types'

/**
 * Base local (IndexedDB). La app funciona sin internet con esto;
 * la nube (Supabase) sincroniza encima cuando está configurada.
 */
interface CacheEntry {
  key: string
  fetchedAt: string
  value: unknown
}

class VinyListDB extends Dexie {
  albums!: EntityTable<Album, 'id'>
  wishlist!: EntityTable<WishlistItem, 'id'>
  /** Respuestas de Discogs, MusicBrainz y ListenBrainz para "Para ti", con fecha. */
  tasteCache!: EntityTable<CacheEntry, 'key'>

  constructor() {
    super('vinylist')
    this.version(1).stores({
      albums: 'id, artist, title, year, barcode, discogsId, rating, addedAt, *genres, *styles',
      wishlist: 'id, wantedBy, addedAt',
    })
    this.version(2).stores({
      albums: 'id, artist, title, year, barcode, discogsId, rating, addedAt, spotifyAlbumId, *genres, *styles',
      wishlist: 'id, wantedBy, addedAt',
      tasteCache: 'key, fetchedAt',
    })
  }
}

export const db = new VinyListDB()

export function newId(): string {
  return crypto.randomUUID()
}

export async function addAlbum(album: Omit<Album, 'id' | 'addedAt' | 'updatedAt'>): Promise<Album> {
  const now = new Date().toISOString()
  const full: Album = { ...album, id: newId(), addedAt: now, updatedAt: now }
  await db.albums.add(full)
  return full
}

export async function updateAlbum(id: string, changes: Partial<Album>): Promise<void> {
  await db.albums.update(id, { ...changes, updatedAt: new Date().toISOString() })
}

export async function deleteAlbum(id: string): Promise<void> {
  await db.albums.delete(id)
}

/** ¿Ya tienen este disco? Busca por ID de Discogs o por código de barras. */
export async function findDuplicate(opts: { discogsId?: number; barcode?: string }): Promise<Album | undefined> {
  if (opts.discogsId) {
    const byId = await db.albums.where('discogsId').equals(opts.discogsId).first()
    if (byId) return byId
  }
  if (opts.barcode) {
    const clean = opts.barcode.replace(/\D/g, '')
    if (clean) return db.albums.where('barcode').equals(clean).first()
  }
  return undefined
}

/**
 * Devuelve el valor guardado si tiene menos de `ttlDays`; si no, llama a `fetcher` y lo guarda.
 * Si la red falla pero hay un valor viejo, se usa el viejo antes que fallar.
 */
const inFlight = new Map<string, Promise<unknown>>()

export interface ServedInfo {
  fetchedAt: string
  /** true si la red falló y se usó un dato vencido. */
  stale: boolean
}

export async function cached<T>(key: string, ttlDays: number, fetcher: () => Promise<T>, force = false, onServed?: (info: ServedInfo) => void): Promise<T> {
  const hit = await db.tasteCache.get(key)
  const fresh = hit && Date.now() - Date.parse(hit.fetchedAt) < ttlDays * 864e5
  if (hit && fresh && !force) {
    onServed?.({ fetchedAt: hit.fetchedAt, stale: false })
    return hit.value as T
  }
  // Dos pantallas pidiendo lo mismo a la vez comparten una sola petición.
  const pending = inFlight.get(key)
  if (pending) return pending as Promise<T>
  const p = (async () => {
    try {
      const value = await fetcher()
      const fetchedAt = new Date().toISOString()
      await db.tasteCache.put({ key, fetchedAt, value })
      onServed?.({ fetchedAt, stale: false })
      return value
    } catch (e) {
      if (hit) {
        onServed?.({ fetchedAt: hit.fetchedAt, stale: true })
        return hit.value as T
      }
      throw e
    } finally {
      inFlight.delete(key)
    }
  })()
  inFlight.set(key, p)
  return p
}

/** Datos que la app averigua sola (enlaces, IDs): no cuentan como edición del usuario. */
export async function patchAlbumMeta(id: string, changes: Pick<Album, 'spotifyAlbumId' | 'spotifyCheckedAt' | 'musicbrainzReleaseGroupId'>): Promise<void> {
  await db.albums.update(id, changes)
}

export function exportCollection(albums: Album[]): string {
  return JSON.stringify({ app: 'vinylist', version: 1, exportedAt: new Date().toISOString(), albums }, null, 2)
}
