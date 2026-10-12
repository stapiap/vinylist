import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Surcos · Vinilos de la familia',
        short_name: 'Surcos',
        description: 'La colección de vinilos de la familia, en el celular de todos.',
        lang: 'es',
        theme_color: '#14110F',
        background_color: '#14110F',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // Portadas de Discogs y Cover Art Archive se guardan para verlas sin internet.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(i\.discogs\.com|coverartarchive\.org|archive\.org)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'portadas',
              expiration: { maxEntries: 2000, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
