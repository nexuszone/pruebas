self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Pasa las peticiones normalmente para no interferir con el streaming de audio ni el chat
  e.respondWith(fetch(e.request).catch(() => new Response('Offline')));
});