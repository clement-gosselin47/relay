// Relay — Service Worker v1
// Handles Web Push notifications and PWA caching

const CACHE_NAME = 'relay-v1'
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json']

// ── Install ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// ── Activate ─────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch — network first, cache fallback ────────────────────
self.addEventListener('fetch', (event) => {
  // Only cache same-origin GET requests
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith(self.location.origin)) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

// ── Push notification ────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'Relay', body: 'Quelqu\'un veut t\'aider !', url: '/' }

  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch { /* invalid JSON */ }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    '/relay-icon.svg',
      badge:   '/relay-icon.svg',
      tag:     'relay-help',
      renotify: true,
      data:    { url: data.url },
      actions: [{ action: 'open', title: 'Voir' }],
    })
  )
})

// ── Notification click ───────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(self.location.origin))
      if (existing) return existing.focus()
      return self.clients.openWindow(url)
    })
  )
})
