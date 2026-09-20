// NeXus ZonE Radio - Service Worker PWA Optimizado
const CACHE_NAME = 'nexuszone-cache-v1.2.0';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './djs.json',
  './staff.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // 1. Streaming y APIs externas: Red directa siempre
  if (
    url.includes('/stream') ||
    url.includes('streamerr.co') ||
    url.includes('itunes.apple.com') ||
    url.includes('flagcdn.com')
  ) {
    return;
  }

  // 2. Archivos dinámicos del Staff y configuración: Red primero con respaldo en caché
  if (url.includes('staff.json') || url.includes('/staff/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 3. Recursos estáticos base: Caché primero con respaldo en red
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});