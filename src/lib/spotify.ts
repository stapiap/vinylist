/**
 * Enlaces a Spotify sin que el usuario inicie sesión en nuestra app.
 * open.spotify.com abre la app de Spotify en el celular si está instalada;
 * si no, abre la versión web. Funciona con cuentas gratuitas.
 *
 * Cuando exista la nube (v0.2), una función del servidor buscará el álbum exacto
 * en la API de Spotify y guardaremos su ID para enlazar directo.
 */
export function spotifySearchUrl(artist: string, title: string): string {
  const q = `${cleanForSearch(artist)} ${cleanForSearch(title)}`.trim()
  return `https://open.spotify.com/search/${encodeURIComponent(q)}/albums`
}

export function spotifyAlbumUrl(spotifyAlbumId: string): string {
  return `https://open.spotify.com/album/${spotifyAlbumId}`
}

/** Quita lo que estorba al buscar: "(2)", "Remastered", "[Deluxe]"… */
export function cleanForSearch(s: string): string {
  return s
    .replace(/\s\(\d+\)$/, '')
    .replace(/\s*[([][^)\]]*(remaster|deluxe|edición|edition|reissue|anniversary)[^)\]]*[)\]]/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}
