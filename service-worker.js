const CACHE_NAME = 'alltags-deutsch-v1';
const ASSETS = [
  '.',
  'index.html',
  'style.css',
  'script.js',
  'data.json'
];

// install
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

// activate
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          // cache cloned response for future
          try { cache.put(event.request, fetchRes.clone()); } catch(e) {}
          return fetchRes;
        });
      }).catch(() => caches.match('index.html'));
    })
  );
});
