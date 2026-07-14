const CACHE_NAME = 'maais-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// ─── DEV MODE: bypass service worker entirely ────────────────────────────────
// When running on localhost the SW must not cache anything — doing so blocks
// Vite HMR and causes stale chunks to be served after rebuilds.
const IS_DEV = self.location.hostname === 'localhost' ||
               self.location.hostname === '127.0.0.1';

// Install — cache static shell (production only)
self.addEventListener('install', event => {
  if (IS_DEV) { self.skipWaiting(); return; }
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches (production only)
self.addEventListener('activate', event => {
  if (IS_DEV) { self.clients.claim(); return; }
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — in dev, pass every request straight to the network
self.addEventListener('fetch', event => {
  if (IS_DEV) return; // let Vite handle everything

  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and Chrome extension requests
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // API requests — network only (never cache sensitive academic data)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ error: 'You are offline. Please check your connection.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // Navigation requests — network first, fall back to index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets — cache first, fall back to network
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok && !url.pathname.startsWith('/api/')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// Background sync for offline grade entries (future enhancement)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-grades') {
    event.waitUntil(syncPendingGrades());
  }
});

async function syncPendingGrades() {
  console.log('[SW] Background sync triggered for pending grades');
}

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'MAAIS Notification', {
      body: data.body ?? '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: { url: data.url ?? '/' },
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});