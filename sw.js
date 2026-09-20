// NeXus ZonE Radio - Service Worker v1.1.31
const CACHE_NAME = 'nexuszone-cache-v1.1.31';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './djs.json',
  './staff.js'
];

// Instalación inmediata
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
});

// Activación y limpieza inmediata de cachés viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Intercepción de red optimizada
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Excepciones directas a la red
  if (
    url.includes('/stream') ||
    url.includes('streamerr.co') ||
    url.includes('itunes.apple.com') ||
    url.includes('flagcdn.com') ||
    url.includes('staff.js') ||
    url.includes('/djs/') ||
    url.includes('/staff/')
  ) {
    return;
  }

  // Para el resto de archivos de la app: red primero, si falla usa caché
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
});