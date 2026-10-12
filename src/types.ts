/** Un disco de la colección. */
export interface Album {
  /** UUID local. */
  id: string
  title: string
  artist: string
  year?: number
  /** Sello discográfico. */
  label?: string
  /** Número de catálogo, útil para discos sin código de barras. */
  catalogNumber?: string
  country?: string
  /** Géneros amplios (Rock, Jazz…). */
  genres: string[]
  /** Estilos finos (Soft Rock, Bebop…). */
  styles: string[]
  /** LP, 7", 12", 2xLP… */
  format?: string
  barcode?: string
  coverUrl?: string
  thumbUrl?: string
  tracklist: Track[]
  /** ID del lanzamiento en Discogs, para actualizar datos después. */
  discogsId?: number
  /** MBID del lanzamiento en MusicBrainz. */
  musicbrainzId?: string
  /** Master de Discogs (el álbum sin importar la edición). */
  discogsMasterId?: number
  musicbrainzArtistId?: string
  musicbrainzReleaseGroupId?: string
  /** ID del álbum en Spotify, si MusicBrainz lo conoce; undefined = no se ha buscado o no hay. */
  spotifyAlbumId?: string
  /** Última vez que se intentó encontrar el ID de Spotify. */
  spotifyCheckedAt?: string
  /** Calificación de 1 a 10 (medias estrellas). Sin calificar = undefined. */
  rating?: number
  /** Estado del disco y de la funda, escala Goldmine. */
  mediaCondition?: Condition
  sleeveCondition?: Condition
  /** Dónde está guardado físicamente. */
  location?: string
  purchaseDate?: string
  purchasePrice?: number
  purchasePlace?: string
  notes?: string
  addedAt: string
  updatedAt: string
}

export interface Track {
  position: string
  title: string
  duration?: string
}

export type Condition = 'M' | 'NM' | 'VG+' | 'VG' | 'G+' | 'G' | 'F' | 'P'

export const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'M', label: 'Mint (nuevo)' },
  { value: 'NM', label: 'Near Mint' },
  { value: 'VG+', label: 'Very Good Plus' },
  { value: 'VG', label: 'Very Good' },
  { value: 'G+', label: 'Good Plus' },
  { value: 'G', label: 'Good' },
  { value: 'F', label: 'Fair' },
  { value: 'P', label: 'Poor' },
]

/** Resultado de buscar en Discogs o MusicBrainz, antes de agregarlo. */
export interface ReleaseCandidate {
  source: 'discogs' | 'musicbrainz'
  sourceId: string
  title: string
  artist: string
  year?: number
  label?: string
  catalogNumber?: string
  country?: string
  format?: string
  thumbUrl?: string
  coverUrl?: string
  barcode?: string
  genres: string[]
  styles: string[]
  discogsMasterId?: number
  musicbrainzArtistId?: string
  musicbrainzReleaseGroupId?: string
}

/** Un disco que alguien de la familia quiere. */
export interface WishlistItem {
  id: string
  title: string
  artist: string
  year?: number
  coverUrl?: string
  discogsId?: number
  wantedBy: string
  /** Quién lo apartó para regalarlo (el que lo quiere no lo ve). */
  reservedBy?: string
  addedAt: string
}
