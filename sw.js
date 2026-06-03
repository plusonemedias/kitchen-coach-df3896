/* Kitchen Coach service worker — offline shell cache.
 * App data lives in localStorage (not here). Coach chat needs network. */
const CACHE = 'kitchen-coach-v3';
const ASSETS = [
  './', './index.html', './styles.css', './config.js', './app.js',
  './manifest.json', './icons/icon.svg', './icons/icon-maskable.svg',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Never cache or intercept Anthropic API calls.
  if (url.hostname === 'api.anthropic.com') return;
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && url.origin === location.origin) {
        const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => hit))
  );
});
