/* Kitchen Coach service worker — network-first so updates always land when
 * online; falls back to cache offline. App data lives in localStorage. */
const CACHE = 'kitchen-coach-v11';
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
  if (url.hostname === 'api.anthropic.com') return;   // never touch API calls
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Network-first: always try the live file; cache it; fall back to cache offline.
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
  );
});
