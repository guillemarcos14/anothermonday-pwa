import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Another Monday',
        short_name: 'Another Monday',
        description: 'Pide con antelación, recoge sin esperas y acumula recompensas en cada visita.',
        theme_color: '#679974',
        background_color: '#F6F5F1',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
      },
    }),
  ],
})
