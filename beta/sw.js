/*
 * The beta games are now the live games, so the beta's own offline copy is no longer needed.
 * This version tidies up: it deletes the old beta caches and removes itself. The live games'
 * sw.js looks after everything from now on (fonts and Bonnie's voice clips are kept, they
 * are shared with the live games).
 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('meadow-beta-')).map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => clients.forEach(c => c.navigate(c.url).catch(() => {})))
  );
});
