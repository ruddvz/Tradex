import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub project Pages URL is https://<owner>.github.io/<repo>/ — repo must match this segment.
const PAGES_BASE = '/Tradex/'

export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? PAGES_BASE : '/'

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.svg',
          'icons.svg',
          'pwa-192.png',
          'pwa-512.png',
          'pwa-512-maskable.png',
          '.nojekyll',
        ],
        manifest: {
          name: 'Tradex',
          short_name: 'Tradex',
          description:
            "Tradex — AI-Powered Trading Journal for Forex, Gold, Indices & Stock Traders.",
          theme_color: '#0b0f16',
          background_color: '#020617',
          display: 'standalone',
          orientation: 'any',
          scope: base,
          start_url: base,
          icons: [
            {
              src: 'pwa-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        },
      }),
    ],
  }
})
