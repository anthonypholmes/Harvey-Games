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
  // (tools/make-voice.mjs runs this file outside a browser, only to list Bonnie's lines)
  const web = typeof location !== 'undefined' && typeof URLSearchParams !== 'undefined';
  const Q = web ? new URLSearchParams(location.search) : new Map(), path = web ? location.pathname : '';
  const proto = /prototype-/.test(path);
  if (!window.PROTO_ROUTE && /words/.test(path)) window.PROTO_ROUTE = 'words';

  /* Everything Bonnie says in the meadow look. tools/make-voice.mjs records them from spokenLines() below, so change a
     line here and run `npm run voice:check` to see what needs recording. (The Clubhouse's and the games' own lines are
     in index.html and js/meadow-core.js.) */
  const LINES = {
    // the maps: each place's question (Bonnie beside it, a place played before) and what she says on the way there
    places: {
      'y2-maths-partitioning': ['Shall we build some numbers in the park?', 'Off to the park!'],
      'y2-maths-number-bonds': ['Shall we dig up some number bonds?', 'Off to the burrow!'],
      'y2-maths-number-lines': ['Shall we hop across the river today?', 'Hop, hop, to the river!'],
      'y2-maths-arrays': ['Shall we pick apples in the orchard?', 'Off to the orchard!'],
      'y2-maths-sharing': ['Shall we share things out at the pond?', 'Down to the pond!'],
      'y2-maths-money': ['Shall we count some coins at the market?', 'Off to the market!'],
      'y2-maths-time': ['Shall we read the big clock?', 'Tick tock, to the tower!'],
      'y2-maths-captains-cove': ['Captain Croak has an idea. Shall we check it?', 'Ahoy! To the Cove!'],
      'y2-english-phonics': ['Shall we find some sounds in the forest?', 'Into the forest!'],
      'y2-english-tricky-words': ['Shall we read the tricky signposts?', 'Off along the trail!'],
      'y2-english-sentences': ['Shall we fix some sentences in the meadow?', 'Off to the meadow!'],
      'y2-english-stories': ['Shall we read a story in my nook?', 'Story time!'],
    },
    startAt: place => `Woof! Let's start at ${place}!`, // a place not played yet ("the Partitioning Park")
    allStars: 'You have every star! Pick anywhere you like.',
    offWeGo: 'Off we go!',
    // the level maps
    levelAgain: level => `Shall we play ${level} again?`,
    levelNext: n => `Level ${n} next! Tap my stone.`,
    // the explorer's journal
    journal: {
      seal: place => `Every star in ${place}! Here's your gold seal!`,
      stamp: place => `A new stamp! You visited ${place}!`,
      empty: game => `Every place you visit in ${game} gets a stamp in here. Let's go exploring!`,
      everything: "Every stamp, and every gold seal! You're a real explorer!",
      allStamps: game => `You've got every ${game} stamp! Can you win gold seals too?`,
      soFar: (n, game) => `${n} ${n === 1 ? 'stamp' : 'stamps'} from ${game} so far. Where next?`,
      notYet: place => `You haven't been to ${place} yet. Shall we go?`,
      placeAll: place => `Every star in ${place}! That's a gold seal.`,
      placeSome: (got, max, left) => `${got} of ${max} stars here. ${left ? `${left} ${left === 1 ? 'level' : 'levels'} still to try.` : 'Every level played! More stars to win.'}`,
      goTo: place => `Let's go to ${place}!`,
      walkToday: "We went for a walk today! There's my paw print.",
      walkAgain: 'Every walk gets my paw print. Shall we go for another?',
      walkFirst: "Take me for a walk and I'll put my paw print here!",
    },
    // the Bone Shop (Bonnie's dressing room)
    shopShort: n => `Keep playing to earn ${n} more ${n === 1 ? 'bone' : 'bones'}!`,
  };
  const GAMES = ['Meadow Maths', 'Meadow Words'];
  const shortName = name => name.replace(/^The /, 'the ');

  /* For tools/make-voice.mjs: every line above, for the worlds this page has. Lines with numbers in them are cut at
     the numbers and joined from number clips, so one example of each is enough. */
  function spokenLines(M) {
    const lines = new Set(), numberLines = new Set(), J = LINES.journal;
    const ws = (M && M.worlds ? M.worlds() : []).filter(w => w && w.name);
    Object.values(LINES.places).forEach(([ask, go]) => { lines.add(ask); lines.add(go); });
    [LINES.allStars, LINES.offWeGo, J.everything, J.walkToday, J.walkAgain, J.walkFirst].forEach(l => lines.add(l));
    for (const w of ws) {
      if (LINES.places[w.id]) lines.add(LINES.startAt(shortName(w.name)));
      [J.seal, J.stamp, J.notYet, J.placeAll, J.goTo].forEach(f => lines.add(f(w.name)));
      (w.levels || []).forEach(L => L && L.name && lines.add(LINES.levelAgain(L.name)));
    }
    GAMES.forEach(g => { lines.add(J.empty(g)); lines.add(J.allStamps(g)); numberLines.add(J.soFar(1, g)); numberLines.add(J.soFar(3, g)); });
    [LINES.levelNext(3), J.placeSome(5, 24, 3), J.placeSome(5, 24, 1), J.placeSome(5, 24, 0), LINES.shopShort(12), LINES.shopShort(1)].forEach(l => numberLines.add(l));
    return { lines: [...lines], numberLines: [...numberLines] };
  }

  window.MeadowLook = {
    on: ON && Q.get('view') !== 'old',
    pages: proto
      ? { club: 'prototype-clubhouse.html', maths: 'prototype-maths-map.html', words: 'prototype-words-map.html', walk: 'prototype-walk.html' }
      : { club: 'index.html', maths: 'meadow-maths.html', words: 'meadow-words.html', walk: 'bonnies-walk.html' },
    LINES, shortName, spokenLines,
  };
  if (window.MeadowLook.on && typeof document !== 'undefined') document.documentElement.classList.add('meadow-look');
})();
