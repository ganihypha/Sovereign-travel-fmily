// ============================================
// SOVEREIGN TRAVEL AGENT - Service Worker
// PWA Offline Support & Caching Strategy
// ============================================

const CACHE_NAME = 'sovereign-travel-v1.1'
const STATIC_CACHE = 'sovereign-static-v1.1'
const DYNAMIC_CACHE = 'sovereign-dynamic-v1.1'

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/manifest.json',
  '/static/icon-192.png',
  '/static/icon-512.png'
]

// CDN assets (cache with different strategy)
const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => {
            console.log('[SW] Removing old cache:', key)
            return caches.delete(key)
          })
      )
    })
  )
  
  return self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') return
  
  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone response to cache
          const clonedResponse = response.clone()
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, clonedResponse)
          })
          return response
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request)
        })
    )
    return
  }
  
  // CDN assets - cache first, network fallback
  if (CDN_ASSETS.some(cdn => request.url.startsWith(cdn))) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        
        return fetch(request).then(response => {
          const clonedResponse = response.clone()
          caches.open(STATIC_CACHE).then(cache => {
            cache.put(request, clonedResponse)
          })
          return response
        })
      })
    )
    return
  }
  
  // Static assets - cache first, network fallback
  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).then(response => {
        // Cache new static assets
        if (response.ok && url.origin === location.origin) {
          const clonedResponse = response.clone()
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, clonedResponse)
          })
        }
        return response
      })
    })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData())
  }
})

async function syncOfflineData() {
  // Sync offline data when connection is restored
  console.log('[SW] Syncing offline data...')
  // Implementation will be added when offline mode is needed
}

// Push notifications (future feature)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')
  
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Sovereign Travel Agent'
  const options = {
    body: data.body || 'Ada notifikasi baru',
    icon: '/static/icon-192.png',
    badge: '/static/icon-192.png',
    vibrate: [200, 100, 200],
    data: data.data || {}
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked')
  
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow('/')
  )
})
