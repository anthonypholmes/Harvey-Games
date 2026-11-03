/*
 * Offline copy for the BETA games in /beta/ only (holmeshouse.co.uk/beta/).
 * It is separate from the live games' sw.js: its own cache name, and it only
 * looks after pages under /beta/. The live service worker leaves /beta/ alone.
 *
 * Bump BETA_VERSION on every beta release so phones pick up new files.
 * Pages and scripts always ask the server for a newer copy first, and use the
 * saved copy only when offline.
 */
const BETA_VERSION = 'meadow-beta-v3';
const FONT_CACHE = 'meadow-club-fonts-v1';   // shared with the live games
const AUDIO_CACHE = 'meadow-club-audio-v1';  // shared with the live games and bonnie-voice.js
const ASSETS = [
  './index.html',
  './meadow-words.html',
  '../js/meadow-core.js',
  '../worlds/y2-english-phonics.js',
  '../worlds/y2-english-tricky-words.js',
  '../worlds/y2-english-sentences.js',
  '../worlds/y2-english-stories.js',
  './meadow-maths.html',
  '../worlds/y2-maths-kit.js',
  '../worlds/y2-maths-partitioning.js',
  '../worlds/y2-maths-number-lines.js',
  '../worlds/y2-maths-arrays.js',
  '../worlds/y2-maths-sharing.js',
  '../bonnie-voice.js',
  '../meadow-backup.js',
  '../icon-192.png',
  '../apple-touch-icon.png',
];
const NETWORK_TIMEOUT_MS = 4000;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(BETA_VERSION)
      .then(cache => cache.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      // only tidy up older beta copies; the live games' caches are not ours
      .then(keys => Promise.all(keys.filter(k => k.startsWith('meadow-beta-') && k !== BETA_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(req, FONT_CACHE));
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/audio/')) {
    event.respondWith(url.pathname.endsWith('/manifest.json') ? networkFirst(req, AUDIO_CACHE) : cacheFirst(req, AUDIO_CACHE));
    return;
  }
  const fresh = req.mode === 'navigate' || /\.(html|js|json)$/.test(url.pathname) || url.pathname.endsWith('/');
  event.respondWith(fresh ? networkFirst(req, BETA_VERSION) : cacheFirst(req, BETA_VERSION));
});

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await withTimeout(fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }), NETWORK_TIMEOUT_MS);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    return (await cache.match(req, { ignoreSearch: true })) || Response.error();
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req, cacheName === FONT_CACHE ? { ignoreVary: true } : { ignoreSearch: true });
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  } catch (e) {
    return Response.error();
  }
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}
