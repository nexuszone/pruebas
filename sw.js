// NeXus ZonE Radio - Service Worker para habilitar instalación PWA
const CACHE_NAME = 'nexuszone-cache-v1.1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './djs.json'
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
  // Las transmisiones de audio y APIs externas se manejan por red directa
  if (event.request.url.includes('/stream') || event.request.url.includes('streamerr.co') || event.request.url.includes('itunes.apple.com') || event.request.url.includes('flagcdn.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});