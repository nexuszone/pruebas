const CACHE_NAME = 'nexuszone-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pasa el streaming de audio y peticiones dinámicas de forma limpia
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});