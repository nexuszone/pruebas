// NeXus ZonE Radio - Service Worker v1.1.19
const CACHE_NAME = 'nexuszone-cache-v1.1.19';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './djs.json'
  // Nota: staff.json NO va aquí para que lea siempre los cambios al instante
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

// Intercepción de red
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Si es stream, APIs externas, carpetas de imágenes o el staff.json, van directo a la red sin caché
  if (
    url.includes('/stream') ||
    url.includes('streamerr.co') ||
    url.includes('itunes.apple.com') ||
    url.includes('flagcdn.com') ||
    url.includes('staff.json') ||
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