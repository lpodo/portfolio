var CACHE = 'portfolio-v1';
var FILES = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(FILES); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Network-first for API calls, cache-first for app shell
  if (e.request.url.includes('finnhub.io') || e.request.url.includes('jsonbin.io')) {
    return; // let these go to network directly
  }
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(resp) {
        return caches.open(CACHE).then(function(c) {
          c.put(e.request, resp.clone());
          return resp;
        });
      });
    }).catch(function() {
      return caches.match('/index.html');
    })
  );
});
