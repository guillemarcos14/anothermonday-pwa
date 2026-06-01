import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { BackgroundSyncPlugin } from 'workbox-background-sync'

// ── Precache (injected by VitePWA build) ──
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// ── Runtime caching strategies ──

// CacheFirst: images (product photos, icons, etc.)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
)

// CacheFirst: fonts
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
)

// NetworkFirst: Supabase REST API calls (with 3s timeout)
registerRoute(
  ({ url }) => url.hostname.includes('supabase.co') && url.pathname.startsWith('/rest/'),
  new NetworkFirst({
    cacheName: 'supabase-api',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
    ],
  })
)

// StaleWhileRevalidate: app shell (HTML navigation)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new StaleWhileRevalidate({
    cacheName: 'app-shell',
  })
)

// ── Background Sync for offline orders ──

const orderSyncPlugin = new BackgroundSyncPlugin('order-sync-queue', {
  maxRetentionTime: 24 * 60, // 24 hours in minutes
  onSync: async ({ queue }) => {
    let entry
    while ((entry = await queue.shiftRequest())) {
      try {
        const response = await fetch(entry.request.clone())
        if (!response.ok) {
          throw new Error(`Sync failed: ${response.status}`)
        }
        // Notify client that sync succeeded
        const clients = await self.clients.matchAll()
        clients.forEach((client) => {
          client.postMessage({
            type: 'ORDER_SYNCED',
            success: true,
          })
        })
      } catch (error) {
        await queue.unshiftRequest(entry)
        throw error
      }
    }
  },
})

// Intercept Supabase order POST requests for background sync
registerRoute(
  ({ url, request }) =>
    url.hostname.includes('supabase.co') &&
    url.pathname.startsWith('/rest/') &&
    url.pathname.includes('orders') &&
    request.method === 'POST',
  new NetworkFirst({
    cacheName: 'order-posts',
    networkTimeoutSeconds: 5,
    plugins: [orderSyncPlugin],
  }),
  'POST'
)

// ── iOS fallback: listen for online event ──
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Activate immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
