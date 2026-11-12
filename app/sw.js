// No Excuses: offline support.
// Network first, so updates show up as soon as you're online. Falls back to the saved copy when there's no signal.
var CACHE = 'no-excuses-v1';
var FILES = ['./', './index.html', './logic.js', './manifest.json', './icon-192.png', './icon-512.png', './icon-180.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  var sameOrigin = url.origin === self.location.origin;
  e.respondWith(
    fetch(e.request).then(function (res) {
      // Keep a fresh copy of our own files and the font files.
      if (res && res.ok && (sameOrigin || url.hostname.indexOf('fonts.') === 0)) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
        return hit || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined);
      });
    })
  );
});
