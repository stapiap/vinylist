import { describe, expect, it } from 'vitest'
import { cleanForSearch, spotifySearchUrl } from './spotify'

describe('enlaces a Spotify', () => {
  it('arma la búsqueda de álbum con artista y título', () => {
    expect(spotifySearchUrl('Fleetwood Mac', 'Rumours')).toBe('https://open.spotify.com/search/Fleetwood%20Mac%20Rumours/albums')
  })
  it('quita sufijos que estorban', () => {
    expect(cleanForSearch('Nirvana (2)')).toBe('Nirvana')
    expect(cleanForSearch('Rumours (2011 Remaster)')).toBe('Rumours')
    expect(cleanForSearch('Abbey Road [Deluxe Edition]')).toBe('Abbey Road')
  })
})
