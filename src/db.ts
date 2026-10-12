import Dexie, { type EntityTable } from 'dexie'
import type { Album, WishlistItem } from './types'

/**
 * Base local (IndexedDB). La app funciona sin internet con esto;
 * la nube (Supabase) sincroniza encima cuando está configurada.
 */
class SurcosDB extends Dexie {
  albums!: EntityTable<Album, 'id'>
  wishlist!: EntityTable<WishlistItem, 'id'>

  constructor() {
    super('surcos')
    this.version(1).stores({
      albums: 'id, artist, title, year, barcode, discogsId, rating, addedAt, *genres, *styles',
      wishlist: 'id, wantedBy, addedAt',
    })
  }
}

export const db = new SurcosDB()

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

export function exportCollection(albums: Album[]): string {
  return JSON.stringify({ app: 'surcos', version: 1, exportedAt: new Date().toISOString(), albums }, null, 2)
}
