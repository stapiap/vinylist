import type { Album } from '../types'
import { patchAlbumMeta } from '../db'
import { findReleaseGroup, findSpotifyAlbumId } from '../api/musicbrainz'
import { spotifyAlbumUrl, spotifySearchUrl } from './spotify'

const RETRY_DAYS = 30

/** Enlace a Spotify: exacto si ya lo conocemos, búsqueda si no. */
export function spotifyUrlFor(album: Pick<Album, 'artist' | 'title' | 'spotifyAlbumId'>): string {
  return album.spotifyAlbumId ? spotifyAlbumUrl(album.spotifyAlbumId) : spotifySearchUrl(album.artist, album.title)
}

/**
 * Busca el ID exacto en MusicBrainz (sin cuenta de Spotify) y lo guarda en el disco.
 * Reintenta como mucho cada 30 días para no gastar peticiones.
 */
export async function resolveSpotifyAlbumId(album: Album): Promise<string | undefined> {
  if (album.spotifyAlbumId) return album.spotifyAlbumId
  if (album.spotifyCheckedAt && Date.now() - Date.parse(album.spotifyCheckedAt) < RETRY_DAYS * 864e5) return undefined
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return undefined
  try {
    const rg = album.musicbrainzReleaseGroupId ?? (await findReleaseGroup({ releaseMbid: album.musicbrainzId, artist: album.artist, title: album.title }))
    const id = rg ? await findSpotifyAlbumId(rg) : undefined
    await patchAlbumMeta(album.id, { spotifyAlbumId: id, musicbrainzReleaseGroupId: rg ?? album.musicbrainzReleaseGroupId, spotifyCheckedAt: new Date().toISOString() })
    return id
  } catch {
    return undefined
  }
}
