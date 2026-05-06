import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Must match the GitHub repository name for project Pages deployment.
const BASE = '/Tradex/'

export default defineConfig({
  base: BASE,
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192.png', 'pwa-512.png', 'pwa-512-maskable.png'],
      manifest: {
        name: 'Tradex',
        short_name: 'Tradex',
        description: 'Tradex workspace',
        theme_color: '#0f172a',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'any',
        scope: BASE,
        start_url: BASE,
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ]
})
