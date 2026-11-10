/* Meadow save keeper for the App Store app.
 *
 * On the website this file does nothing. Inside the app (Capacitor) the games still save to
 * localStorage as usual, but iOS can clear a web view's storage when the iPad runs low on space.
 * So every Meadow save is also copied to the app's own storage (the Preferences plugin), which
 * iOS keeps safe. If a page opens and the saves have gone, they are put back and the page reloads.
 *
 * Load it first on every page, before js/meadow-core.js.
 */
(function () {
  const cap = window.Capacitor;
  if (!(cap && cap.isNativePlatform && cap.isNativePlatform())) return;
  const P = (cap.Plugins && cap.Plugins.Preferences) || (cap.registerPlugin && cap.registerPlugin('Preferences'));
  if (!P) return;

  const MAIN = 'meadow-save-v1';
  const ours = k => /^(meadow|harvey)/.test(String(k)); // every key the games use starts like this
  const hadSave = (() => { try { return !!localStorage.getItem(MAIN); } catch (e) { return false; } })();
  let ready = false; // nothing is copied until we know whether a restore is needed

  const proto = Storage.prototype, set = proto.setItem, remove = proto.removeItem;
  proto.setItem = function (k, v) {
    set.call(this, k, v);
    if (this === window.localStorage && ready && ours(k)) P.set({ key: k, value: String(v) }).catch(() => {});
  };
  proto.removeItem = function (k) {
    remove.call(this, k);
    if (this === window.localStorage && ready && ours(k)) P.remove({ key: k }).catch(() => {});
  };

  function copyAllToApp() {
    const jobs = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (ours(k)) jobs.push(P.set({ key: k, value: localStorage.getItem(k) }));
    }
    return Promise.all(jobs);
  }

  (async () => {
    try {
      if (!hadSave) {
        const { keys } = await P.keys();
        const saved = keys.filter(ours);
        if (saved.includes(MAIN)) {
          // The web view lost its saves: put back the app's copy, then start the page again.
          for (const k of saved) {
            const { value } = await P.get({ key: k });
            if (value != null) set.call(localStorage, k, value);
          }
          location.reload();
          return;
        }
      }
      ready = true;
      await copyAllToApp();
    } catch (e) { ready = true; }
  })();
})();
