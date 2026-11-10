/* Meadow Clubhouse service worker — lets the games run offline.
 *
 * Pages and scripts: network first, so a newly uploaded game shows up straight away
 *   when online; the saved copy is used when offline (or the network is slow).
 * Everything else (icons, the bundled fonts): cache first, then network.
 * Bonnie's recorded voice (audio/): clips are cache first in their own cache, which
 *   survives updates; audio/manifest.json (and captain.json) is network first so new clips are found.
 *   Meadow Words saves every clip in the background, so the voice works offline too.
 *
 * Bump CACHE_VERSION when adding or renaming files in CORE_ASSETS.
 */
const CACHE_VERSION = 'meadow-club-v19';
const FONT_CACHE = 'meadow-club-fonts-v1';
const AUDIO_CACHE = 'meadow-club-audio-v1'; // same name in meadow-words.html
const CORE_ASSETS = [
  './',
  './index.html',
  './meadow-maths.html',
  './meadow-words.html',
  './bonnies-walk.html',
  './bonnie-voice.js',
  './meadow-backup.js',
  './js/meadow-core.js',
  './js/app-storage.js',
  // the worlds (keep in step with the <script> lines in the pages)
  './worlds/y2-english-phonics.js',
  './worlds/y2-english-tricky-words.js',
  './worlds/y2-english-sentences.js',
  './worlds/y2-english-stories.js',
  './worlds/y2-maths-kit.js',
  './worlds/y2-maths-partitioning.js',
  './worlds/y2-maths-number-bonds.js',
  './worlds/y2-maths-number-lines.js',
  './worlds/y2-maths-arrays.js',
  './worlds/y2-maths-sharing.js',
  './worlds/y2-maths-sharing-fractions.js',
  './worlds/y2-maths-captains-cove.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
];
// The bundled fonts (fonts/). Saved separately so a missing font file never stops the install.
const FONT_FILES = ['./fonts/fonts.css', './fonts/Fredoka.ttf', './fonts/Nunito.ttf', './fonts/Andika-Regular.ttf', './fonts/Andika-Bold.ttf'];
const NETWORK_TIMEOUT_MS = 4000;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(CORE_ASSETS.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => precacheFonts().catch(() => {})) // fonts are nice to have; never block install
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => ![CACHE_VERSION, FONT_CACHE, AUDIO_CACHE].includes(k)).map(k => caches.delete(k)))) // also clears any old beta caches left behind
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  if (url.pathname.includes('/fonts/')) { event.respondWith(cacheFirst(req, FONT_CACHE)); return; }
  if (url.pathname.includes('/audio/')) {
    event.respondWith(url.pathname.endsWith('.json') ? networkFirst(req, AUDIO_CACHE, false) : cacheFirst(req, AUDIO_CACHE));
    return;
  }

  const isPage = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html') || url.pathname.endsWith('.js');
  event.respondWith(isPage ? networkFirst(req) : cacheFirst(req, CACHE_VERSION));
});

// Save the bundled fonts, so every game looks right offline.
async function precacheFonts() {
  const cache = await caches.open(FONT_CACHE);
  await Promise.all(FONT_FILES.map(async u => {
    if (await cache.match(u)) return;
    const res = await fetch(u);
    if (res.ok) await cache.put(u, res);
  }));
}

async function networkFirst(req, cacheName = CACHE_VERSION, homeFallback = true) {
  const cache = await caches.open(cacheName);
  try {
    // no-cache: always ask the server if there's a newer copy (GitHub Pages otherwise lets the
    // browser reuse a page for 10 minutes, so one page can be new and another old)
    const res = await withTimeout(fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }), NETWORK_TIMEOUT_MS);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    const cached = await cache.match(req, { ignoreSearch: true });
    // Unknown page while offline: show the Clubhouse rather than an error.
    return cached || (homeFallback && (await cache.match('./index.html'))) || Response.error();
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req, { ignoreSearch: true });
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
