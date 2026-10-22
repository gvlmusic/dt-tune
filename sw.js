// DT2 Tune — офлайн-кеш. Щоб примусово оновити кеш, змініть номер версії.
const CACHE = 'dt2tune-v1';
const ASSETS = ['./', './index.html', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Спершу віддаємо з кешу (миттєво й без мережі), паралельно тихо оновлюємо кеш з інтернету.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(e.request, { ignoreSearch: true }).then((cached) => {
        const network = fetch(e.request)
          .then((res) => {
            if (res && res.ok) cache.put(e.request, res.clone());
            return res;
          })
          .catch(() => cached || (e.request.mode === 'navigate' ? cache.match('./index.html') : undefined));
        return cached || network;
      })
    )
  );
});
