/* The meadow look (the 2026 redesign): the illustrated Clubhouse and journal, the Maths and Words maps with their
 * level maps, Bonnie's dressing room (the Bone Shop) and Bonnie's Walk through the meadow.
 *
 * They are drawn on top of the game's own screens (js/meadow-core.js): they read those screens and press their
 * buttons, so every question, hint, bone, save, player and purchase is still the engine's. The scripts are:
 *   every page: js/meadow-look.js (this file, in the head), js/proto-map-art.js (the drawing kit)
 *   index.html: js/proto-hub-art.js, js/proto-hub.js, js/proto-journal.js
 *   meadow-maths.html and meadow-words.html: js/proto-map.js, js/proto-level.js, js/proto-shop.js
 *   bonnies-walk.html: js/proto-walk.js
 *
 * THE SWITCH: set ON to false and the game goes back to the old screens (the scripts still load, but each one
 * stops straight away). ?view=old does the same for one page, for comparing.
 *
 * The prototype-*.html pages wrap the real pages with a pretend child (for the checks and screenshots), so there
 * the places link to the other prototype pages and the real save is never touched.
 */
(function () {
  const ON = true;
  const Q = new URLSearchParams(location.search);
  const proto = /prototype-/.test(location.pathname);
  if (!window.PROTO_ROUTE && /words/.test(location.pathname)) window.PROTO_ROUTE = 'words';
  window.MeadowLook = {
    on: ON && Q.get('view') !== 'old',
    pages: proto
      ? { club: 'prototype-clubhouse.html', maths: 'prototype-maths-map.html', words: 'prototype-words-map.html', walk: 'prototype-walk.html' }
      : { club: 'index.html', maths: 'meadow-maths.html', words: 'meadow-words.html', walk: 'bonnies-walk.html' },
  };
  if (window.MeadowLook.on) document.documentElement.classList.add('meadow-look');
})();
