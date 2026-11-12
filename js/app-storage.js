/* App Store app helpers: keeps pages clear of the status bar, and keeps the saves safe.
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

  window.MEADOW_IN_APP = true;

  // Keep every page clear of the iPad's clock and battery bar (and the rounded corners in landscape).
  document.documentElement.classList.add('in-app');
  const css = document.createElement('style');
  css.textContent = 'html.in-app{padding-top:env(safe-area-inset-top);padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)}'
    // Feel like an app, not a web page: no zoom on a double tap, no rubber-band bounce, and a page that
    // fits the screen doesn't scroll (the website leaves room under each page for the grass; here the
    // grass sits behind the last card instead, and the status bar's height is taken off the page).
    + 'html.in-app{touch-action:manipulation;overscroll-behavior:none}html.in-app body{overscroll-behavior:none;-webkit-touch-callout:none}'
    + 'html.in-app body{min-height:calc(100vh - env(safe-area-inset-top))}'
    + 'html.in-app #app,html.in-app .wrap{padding-bottom:calc(20px + env(safe-area-inset-bottom))}'
    + 'html.in-app #app{min-height:calc(100vh - env(safe-area-inset-top))}';
  (document.head || document.documentElement).appendChild(css);
  // No pinch zoom either (a web view obeys this, unlike Safari).
  const noZoom = () => { const m = document.querySelector('meta[name="viewport"]'); if (m && !/user-scalable/.test(m.content)) m.content += ', maximum-scale=1, user-scalable=no'; };
  noZoom(); document.addEventListener('DOMContentLoaded', noZoom);
  const P = (cap.Plugins && cap.Plugins.Preferences) || (cap.registerPlugin && cap.registerPlugin('Preferences'));
  if (!P) return;

  const isSave = k => /^meadow-save-v1(-p\d+)?$/.test(String(k)); // a player's save (there can be up to 4)
  const ours = k => /^(meadow|harvey)/.test(String(k)); // every key the games use starts like this
  const hadSave = (() => { try { for (let i = 0; i < localStorage.length; i++) if (isSave(localStorage.key(i))) return true; return false; } catch (e) { return false; } })();
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
        if (saved.some(isSave)) {
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
