/* Meadow Maths and Meadow Words map PROTOTYPE (not part of the game yet).
 *
 * One map for both games: window.PROTO_ROUTE ('maths', the default, or 'words') picks the drawing and the places.
 * The Words route was added on 22 November 2026, in the same style and with the same signs, checks and "Places".
 *
 * The world list as an illustrated meadow route (design iteration 2, Direction B). It runs on the real engine:
 * the worlds, stars, unlocking and the full-game padlocks all come from js/meadow-core.js, and tapping a place
 * opens the engine's own level map (Meadow.worldMap). Nothing in the engine is changed: this file only draws a
 * different screen in place of the world list, and puts it back when the old list would have shown.
 *
 * Refinement (22 November 2026), from Anthony's notes:
 * - every place has a big wooden sign with its name and its progress (stars out of the total, "All stars!",
 *   "New!", and the app's "Level 1 free" padlock), in place of the tiny names painted into the scenery
 * - each place's tap area covers the whole picture and its sign; pressing it lights a gold ring on the ground and
 *   dips the sign, and Bonnie trots over
 * - a shorter trail (1500 tall to 1280), the same six places in the same order
 * - "Places": a list of every world for a child who knows where they want to go (shown once they've played)
 * - the Bone Shop themes wash over the meadow; Bonnie blinks and wags as she does everywhere else
 *
 * Page options (prototype-maths-map.html?… or prototype-words-map.html?…):
 *   view=old     the current world list, unchanged (for the side-by-side comparison)
 *   demo=1       a separate pretend save (meadow-save-proto-demo) with some progress, so the real save is never touched
 *   demo=new     the same pretend save, but a new player with no stars
 *   taster=1     show the App Store app's free taster (levels after 1 locked), as if inside the app
 *   selftest=1   run the checks and print the results on the page
 */
(function () {
  const Q = new URLSearchParams(location.search);
  const A = window.ProtoArt, M = window.Meadow, ui = M.ui, C = A.C, F = A.F;
  const reduce = () => ui.reduceMotion();

  /* Where each world lives in the drawing. Written in the original drawing's units and moved to the shorter trail by F().
     hit: the whole tappable area (the picture and its sign). sign: the top middle of its name sign.
     bonnie: where she stands (her feet). bub: her speech bubble [x, y, 'above'|'below'] (y is its bottom edge for 'above', its top for 'below'). */
  const RAW_MATHS = {
    'y2-maths-partitioning': { hit: [96, 40, 228, 342], sign: [220, 282], bonnie: [372, 300], bub: [330, 232, 'above'],
      ask: 'Shall we build some numbers in the park?', go: 'Off to the park!' },
    'y2-maths-number-bonds': { hit: [326, 340, 234, 200], sign: [452, 432], bonnie: [440, 540], bub: [340, 542, 'below'],
      ask: 'Shall we dig up some number bonds?', go: 'Off to the burrow!' },
    'y2-maths-number-lines': { hit: [126, 542, 394, 130], sign: [222, 552], bonnie: [352, 668], bub: [300, 674, 'below'],
      ask: 'Shall we hop across the river today?', go: 'Hop, hop, to the river!' },
    'y2-maths-arrays': { hit: [332, 760, 228, 292], sign: [440, 968], bonnie: [300, 840], bub: [130, 764, 'above'],
      ask: 'Shall we pick apples in the orchard?', go: 'Off to the orchard!' },
    'y2-maths-sharing': { hit: [100, 975, 228, 228], sign: [210, 1100], bonnie: [400, 1060], bub: [335, 1066, 'below'],
      ask: 'Shall we share things out at the pond?', go: 'Down to the pond!' },
    'y2-maths-captains-cove': { hit: [100, 1250, 420, 240], sign: [206, 1268], bonnie: [365, 1262], bub: [330, 1170, 'above'],
      ask: 'Captain Croak has an idea. Shall we check it?', go: 'Ahoy! To the Cove!' },
  };
  // the Meadow Words route (drawn at its own height, so no moving)
  const RAW_WORDS = {
    'y2-english-phonics': { hit: [130, 30, 240, 372], sign: [262, 290], bonnie: [404, 236], bub: [330, 170, 'above'],
      ask: 'Shall we find some sounds in the forest?', go: 'Into the forest!' },
    'y2-english-tricky-words': { hit: [300, 408, 260, 222], sign: [452, 532], bonnie: [300, 420], bub: [131, 438, 'below'],
      ask: 'Shall we read the tricky signposts?', go: 'Off along the trail!' },
    'y2-english-sentences': { hit: [126, 640, 238, 220], sign: [236, 766], bonnie: [404, 690], bub: [340, 706, 'below'],
      ask: 'Shall we fix some sentences in the meadow?', go: 'Off to the meadow!' },
    'y2-english-stories': { hit: [366, 650, 200, 400], sign: [440, 948], signW: 150, bonnie: [300, 900], bub: [131, 912, 'below'],
      ask: 'Shall we read a story in my nook?', go: 'Story time!' },
  };
  const ROUTES = {
    maths: { subject: 'maths', title: 'Meadow Maths', raw: RAW_MATHS, F, H: A.ROUTE_H, scene: A.mathsRoute, maxH: 1280 },
    words: { subject: 'english', title: 'Meadow Words', raw: RAW_WORDS, F: y => y, H: A.WORDS_H, scene: A.wordsRoute, maxH: 1100 },
  };
  const R = ROUTES[window.PROTO_ROUTE] || ROUTES.maths, G = R.F;
  const PLACES = Object.fromEntries(Object.entries(R.raw).map(([id, p]) => [id, { ...p,
    hit: [p.hit[0], G(p.hit[1]), p.hit[2], G(p.hit[1] + p.hit[3]) - G(p.hit[1])],
    sign: [p.sign[0], G(p.sign[1])], bonnie: [p.bonnie[0], G(p.bonnie[1])], bub: [p.bub[0], G(p.bub[1]), p.bub[2]] }]));
  const WORLD_W = 640, WORLD_H = R.H, PHONE_X = 125, PHONE_W = 390;
  const short = id => id.replace(/^y2-[a-z]+-/, '');

  let on = false, busy = false, at = null, scene = null, view = null;

  /* ---------- progress, from the engine ---------- */
  const save = () => M.save.get() || M.save.load();
  function info(w) {
    const max = w.levels.length * 3, earned = w.levels.reduce((n, L) => n + M.stars(w.id, L.id), 0);
    const played = earned > 0 || w.levels.some(L => (save().logs || {})[w.id + '/' + L.id]);
    const taster = M.fullGame.paid(w, M.fullGame.FREE_LEVELS) && w.levels.length > M.fullGame.FREE_LEVELS;
    return { earned, max, played, mastered: earned === max, taster };
  }
  // Bonnie suggests where the child played last, unless it's finished: then the next place that isn't.
  function suggestion(ws) {
    const starts = save().levelStarts || [];
    const last = starts.length ? starts[starts.length - 1].key.split('/')[0] : null;
    let i = ws.findIndex(w => w.id === last);
    if (i < 0) i = 0;
    for (let n = 0; n < ws.length; n++) { const w = ws[(i + n) % ws.length]; if (!info(w).mastered) return w; }
    return null; // every star won
  }
  const placed = () => M.visibleWorlds(R.subject).filter(w => PLACES[w.id]);
  const unplaced = () => M.visibleWorlds(R.subject).filter(w => !PLACES[w.id]);
  const returning = () => M.visibleWorlds(R.subject).some(w => info(w).played);

  /* ---------- drawn icons (no emoji) ---------- */
  const svgI = (vb, body) => `<svg viewBox="${vb}" aria-hidden="true">${body}</svg>`;
  const icons = {
    star: svgI('-10 -10 20 20', A.star(0, 0, 9, true)),
    rosette: svgI('-11 -11 22 24', `<path d="M-5 5 l-3 10 l5 -3 l2 5 l2 -10 M5 5 l3 10 l-5 -3 l-2 5" fill="${C.berry}"/><circle r="9" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1.6"/>${A.star(0, 0, 5.5, true).replace(C.goldDk, '#FFF3B0')}`),
    flag: svgI('-10 -10 20 20', `<path d="M-5 -9 v18" stroke="${C.woodDk}" stroke-width="2"/><path d="M-4 -9 l12 4 l-12 4 z" fill="${C.berry}" stroke="#A93E4F" stroke-width="1"/>`),
    lock: svgI('-8 -9 16 18', `<path d="M-4.5 0 v-4 a4.5 4.5 0 0 1 9 0 v4" stroke="#6B655A" stroke-width="2.2" fill="none"/><rect x="-6.5" y="-.5" width="13" height="10" rx="2" fill="#8B8478"/>`),
    places: svgI('-12 -12 24 24', `<path d="M-9 -8 l6 -2 l6 2 l6 -2 v16 l-6 2 l-6 -2 l-6 2 z" fill="${C.paper}" stroke="${C.woodInk}" stroke-width="2" stroke-linejoin="round"/><path d="M-3 -10 v16 M3 -8 v16" stroke="${C.woodInk}" stroke-width="1.6"/><circle cx="5.5" cy="-2" r="2.4" fill="${C.berry}"/>`),
  };
  function progress(w) {
    const f = info(w);
    const main = f.mastered ? { icon: 'rosette', text: 'All stars!', cls: 'done' }
      : f.played ? { icon: 'star', text: `${f.earned} / ${f.max}`, cls: '' }
      : { icon: 'flag', text: 'New!', cls: 'new' };
    return { f, main, say: f.mastered ? 'Every star won.' : f.played ? `${f.earned} of ${f.max} stars.` : 'New!' };
  }

  /* ---------- the screen ---------- */
  const CSS = `
  .pm-on .hud,.pm-on .butterfly,.pm-on .frog,.pm-on .meadow{display:none!important}
  .pm-on #app{max-width:none;padding:0;min-height:0}
  .pm-on{background:${C.meadow}!important}
  .pm{position:relative;margin:0 auto}
  .pm-bar{position:sticky;top:0;z-index:6;display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding:calc(8px + env(safe-area-inset-top)) 10px 0;pointer-events:none}
  .pm-bar>*{pointer-events:auto}
  .pm-tag{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-width:48px;min-height:46px;padding:0 10px 0 20px;border:0;font:700 19px Fredoka,system-ui,sans-serif;color:${C.woodInk};text-decoration:none;cursor:pointer;
    background:${C.woodLt};clip-path:polygon(14px 0,100% 0,100% 100%,14px 100%,0 50%);box-shadow:inset 0 -4px 0 rgba(154,106,58,.55);filter:drop-shadow(0 2px 0 ${C.woodDk})}
  .pm-tag svg{width:26px;height:26px;flex:none}
  /* Bonnie's first-time help on a tag (the Bone Shop): the signpost shape would cut off the game's ring, so the tag itself glows gold */
  .pm-tag.tip-ring{outline:none;background:#FBE1A0;box-shadow:inset 0 0 0 4px #F2B53A,inset 0 -4px 0 rgba(154,106,58,.55);animation:pmTip 1.4s ease-in-out infinite}
  @keyframes pmTip{50%{background:${C.woodLt}}}
  .pm-tag:focus-visible{outline:3px solid ${C.goldDk};outline-offset:2px}
  .pm-tags{display:flex;gap:6px}
  .pm-title{margin:2px 0 0;padding:6px 16px 8px;border-radius:10px;background:${C.woodLt};box-shadow:0 3px 0 ${C.woodDk};font:700 clamp(17px,5vw,22px) Fredoka,system-ui,sans-serif;color:${C.woodInk};white-space:nowrap;text-align:center}
  .pm-stage{position:relative;margin-top:-16px;overflow:hidden}
  @media (max-width:400px){.pm-bar{gap:4px;padding-left:6px;padding-right:6px}.pm-tags{gap:4px}.pm-title{font-size:16px;padding:6px 10px 8px}.pm-tag{font-size:17px}}
  .pm-stage>svg{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
  .pm-hit{position:absolute;z-index:3;border:0;margin:0;padding:0;background:transparent;border-radius:28px;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
  .pm-hit:focus-visible{outline:4px solid ${C.goldDk};outline-offset:-4px}
  .pm-hit.bonnie-hit{border-radius:50%;z-index:5}

  /* each place's name sign: a wooden board on a post, its name big, its progress underneath */
  .pm-sign{position:absolute;z-index:4;transform:translateX(-50%);pointer-events:none;display:grid;justify-items:center;gap:4px;width:max-content;max-width:calc(200px * var(--k,1));
    padding:6px 12px 7px;border-radius:10px;background:${C.woodLt};border:2px solid ${C.woodDk};box-shadow:0 4px 0 ${C.woodDk};color:${C.woodInk};text-align:center;transition:transform .12s ease-out}
  .pm-sign::after{content:"";position:absolute;left:50%;top:calc(100% + 4px);width:7px;height:calc(14px * var(--k,1));margin-left:-3.5px;background:${C.woodDk};border-radius:0 0 3px 3px;z-index:-1}
  .pm-sign b{font:700 max(19px,calc(19px * var(--k,1)))/1.08 Fredoka,system-ui,sans-serif}
  .pm-sign .pg{display:inline-flex;align-items:center;gap:5px;padding:2px 10px 3px 6px;border-radius:999px;background:${C.paper};font:700 max(16px,calc(16px * var(--k,1)))/1.1 Fredoka,system-ui,sans-serif;color:${C.ink}}
  .pm-sign .pg.done{background:#FFF3C4}
  .pm-sign .pg.new{background:#FFE3E6;color:#8E2B3B}
  .pm-sign .pg svg,.pm-sign .lk svg{width:20px;height:20px;flex:none}
  /* the free version: a padlock inside the progress tag (only level 1 is open; VoiceOver says so) */
  .pm-sign .lk{display:inline-flex;align-items:center;margin-left:4px;padding-left:7px;border-left:2px solid rgba(94,85,74,.3)}
  .pm-sign.pressed{transform:translateX(-50%) translateY(3px);box-shadow:0 1px 0 ${C.woodDk}}
  .pm-sign.lit{border-color:${C.goldDk};box-shadow:0 4px 0 ${C.goldDk},0 0 0 4px rgba(242,193,78,.55)}
  .pm-halo{opacity:0;transition:opacity .15s}
  .pm-halo.lit{opacity:1}

  #pmBonnie{transition:transform .75s cubic-bezier(.45,.05,.3,1)}
  #pmBonnie.hop>g{animation:pmHop .38s ease-in-out 2}
  #pmBonnie.wiggle>g{animation:pmWig .5s ease-in-out}
  #pmBonnie .eyes{transform-box:fill-box;transform-origin:50% 50%;animation:blink 5s infinite}
  #pmBonnie .tail{transform-box:fill-box;transform-origin:0% 100%;animation:wag 1.4s ease-in-out infinite}
  @keyframes pmHop{50%{transform:translateY(-14px)}}
  @keyframes pmWig{25%{transform:rotate(-6deg)}75%{transform:rotate(6deg)}}
  #pmBubble{transition:opacity .25s}
  .pm-bub text{font-size:15px}
  @media (prefers-reduced-motion:reduce){.pm-tag.tip-ring{animation:none}#pmBonnie,#pmBubble,.pm-sign,.pm-halo{transition:none}#pmBonnie>g,#pmBonnie .eyes,#pmBonnie .tail{animation:none!important}.pm-sign.pressed{transform:translateX(-50%)}}

  /* "Places": a quick list of every world */
  .pm-jump{position:fixed;z-index:7;right:calc(12px + env(safe-area-inset-right));bottom:calc(14px + env(safe-area-inset-bottom));display:inline-flex;align-items:center;gap:8px;min-height:52px;padding:0 18px 0 14px;border:2px solid ${C.woodDk};border-radius:14px;
    background:${C.woodLt};box-shadow:0 4px 0 ${C.woodDk};font:700 18px Fredoka,system-ui,sans-serif;color:${C.woodInk};cursor:pointer}
  .pm-jump svg{width:26px;height:26px}
  .pm-jump:active{transform:translateY(3px);box-shadow:0 1px 0 ${C.woodDk}}
  .pm-jump:focus-visible{outline:3px solid ${C.goldDk};outline-offset:2px}
  .pm-sheet-bg{position:fixed;inset:0;z-index:20;background:rgba(43,38,34,.45);display:flex;align-items:flex-end;justify-content:center}
  .pm-sheet{width:min(520px,100%);max-height:85vh;overflow:auto;padding:16px 16px calc(16px + env(safe-area-inset-bottom));border-radius:20px 20px 0 0;background:${C.paper};border-top:4px solid ${C.woodDk}}
  @media (min-width:600px){.pm-sheet-bg{align-items:center}.pm-sheet{border-radius:20px;border:4px solid ${C.woodDk}}}
  .pm-sheet h2{margin:0 0 10px;font:700 22px Fredoka,system-ui,sans-serif;color:${C.woodInk}}
  .pm-sheet ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
  .pm-sheet li button{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:56px;padding:8px 14px;border:0;border-radius:12px;background:${C.woodLt};box-shadow:inset 0 -4px 0 rgba(154,106,58,.5);
    font:700 18px Fredoka,system-ui,sans-serif;color:${C.woodInk};text-align:left;cursor:pointer}
  .pm-sheet li button.here{box-shadow:inset 0 -4px 0 rgba(154,106,58,.5),0 0 0 3px ${C.gold}}
  .pm-sheet li .pg{display:inline-flex;align-items:center;gap:5px;flex:none;padding:2px 10px 3px 6px;border-radius:999px;background:${C.paper};font:700 16px Fredoka,system-ui,sans-serif;color:${C.ink}}
  .pm-sheet li .pg svg{width:20px;height:20px}
  .pm-sheet .close{margin-top:12px;width:100%;min-height:50px;border:2px solid ${C.woodDk};border-radius:12px;background:#fff;font:700 18px Fredoka,system-ui,sans-serif;color:${C.woodInk};cursor:pointer}
  .pm-sheet button:focus-visible{outline:3px solid ${C.goldDk};outline-offset:2px}
  .pm-more{padding:16px 16px 90px;display:grid;gap:10px}
  .pm-more button{min-height:56px;border:0;border-radius:12px;background:${C.woodLt};box-shadow:0 3px 0 ${C.woodDk};font:600 18px Fredoka,system-ui,sans-serif;color:${C.woodInk};cursor:pointer}
  .pm-end{height:76px}
  .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`;

  function layout() {
    const W = Math.min(document.documentElement.clientWidth || innerWidth, 900);
    view = W < 600 ? { x0: PHONE_X, w: PHONE_W } : { x0: 0, w: WORLD_W };
    view.W = W; view.k = W / view.w; view.H = Math.round(WORLD_H * view.k);
  }
  const px = (x, y) => [(x - view.x0) * view.k, y * view.k];

  function signHTML(w) {
    const [x, y] = PLACES[w.id].sign, [l, t] = px(x, y), p = progress(w), sw = PLACES[w.id].signW; // signW: a narrower sign, so a long name wraps
    return `<div class="pm-sign" id="pmSign-${w.id}" style="left:${l.toFixed(1)}px;top:${t.toFixed(1)}px${sw ? `;max-width:calc(${sw}px * var(--k,1))` : ''}" aria-hidden="true">
      <b>${ui.esc(w.name)}</b><span class="pg ${p.main.cls}">${icons[p.main.icon]}${ui.esc(p.main.text)}${p.f.taster ? `<span class="lk">${icons.lock}</span>` : ''}</span></div>`;
  }
  function haloSVG(w) {
    const [x, y, ww, hh] = PLACES[w.id].hit;
    return `<g class="pm-halo" id="pmHalo-${w.id}"><ellipse cx="${x + ww / 2}" cy="${y + hh * .62}" rx="${ww * .44}" ry="${hh * .3}" fill="${C.gold}" opacity=".22"/><ellipse cx="${x + ww / 2}" cy="${y + hh * .62}" rx="${ww * .44}" ry="${hh * .3}" fill="none" stroke="${C.gold}" stroke-width="4" stroke-dasharray="14 8"/></g>`;
  }
  function wrap(text, max = 24) { const out = []; let line = ''; text.split(' ').forEach(word => { if ((line + ' ' + word).trim().length > max && line) { out.push(line); line = word; } else line = (line + ' ' + word).trim(); }); if (line) out.push(line); return out; }
  function bubbleSVG(w, text) {
    const p = PLACES[w.id], lines = wrap(text, 17), fs = 16 / Math.min(1.2, view.k), h = lines.length * fs * 1.3 + 20, bw = 168 / Math.min(1.2, view.k);
    const [bx, byRaw, side] = p.bub, [fx, fy] = p.bonnie;
    const x = Math.max(view.x0 + 6, Math.min(bx, view.x0 + view.w - bw - 6));
    return side === 'above' ? A.bubble(x, byRaw - h, bw, lines, fx - 10, fy - 58, fs) : A.bubble(x, byRaw, bw, lines, fx + 4, fy - 4, fs);
  }

  function draw() {
    on = true; busy = false;
    document.body.classList.add('pm-on');
    layout();
    if (!scene) scene = R.scene().render();
    const ws = placed(), sug = suggestion(ws), s = save(), theme = document.body.dataset.theme || 'day';
    at = sug || ws[0];
    const vb = `${view.x0} 0 ${view.w} ${WORLD_H}`;
    // Bonnie's first-time help (js/meadow-core.js): once there are bones, she points out the Bone Shop (the ring goes on the bones tag below)
    const shopTip = !!(M.tips && M.tips.due('shop'));
    const bonnieLine = shopTip ? ui.fmt(M.LINES.tipShop) : sug ? (info(sug).played ? PLACES[sug.id].ask : `Woof! Let's start at ${shortName(sug)}!`) : 'You have every star! Pick anywhere you like.';
    const [bfx, bfy] = at ? PLACES[at.id].bonnie : [320, 300];
    const hits = ws.map((w, i) => {
      const [x, y, ww, hh] = PLACES[w.id].hit, [l, t] = px(Math.max(x, view.x0), y), r = px(Math.min(x + ww, view.x0 + view.w), y + hh);
      const p = progress(w), width = Math.max(44, r[0] - l), height = Math.max(44, r[1] - t);
      const label = `World ${i + 1}: ${w.name}. ${w.tag || ''}. ${p.say}${p.f.taster ? ' Level 1 is free to play.' : ''}`;
      return `<button class="pm-hit" data-w="${ui.esc(w.id)}" style="left:${l.toFixed(1)}px;top:${t.toFixed(1)}px;width:${width.toFixed(1)}px;height:${height.toFixed(1)}px" aria-label="${ui.esc(label.replace(/([.?!])\./g, '$1'))}"></button>`;
    }).join('');
    const [bl, bt] = px(bfx - 40, bfy - 78);
    const carry = ['demo', 'theme'].filter(k => Q.get(k)).map(k => `${k}=${encodeURIComponent(Q.get(k))}`).join('&');
    const club = (window.MeadowLook ? window.MeadowLook.pages : { club: 'prototype-clubhouse.html', maths: 'prototype-maths-map.html', words: 'prototype-words-map.html', walk: 'prototype-walk.html' }).club, home = club + (carry && /^prototype-/.test(club) ? '?' + carry : '');
    ui.show(`<div class="pm" style="width:${view.W}px;--k:${Math.min(1.25, view.k).toFixed(3)}">
      <div class="pm-bar">
        <div class="pm-tags">
          <a class="pm-tag" href="${home}" aria-label="Back to the Clubhouse"><svg viewBox="-14 -14 28 28" aria-hidden="true"><path d="M-12 0 L0 -11 L12 0" fill="${C.berry}" stroke="#A93E4F" stroke-width="2" stroke-linejoin="round"/><rect x="-9" y="-1" width="18" height="13" rx="1.5" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="1.6"/><rect x="-2.5" y="4" width="5" height="8" fill="${C.woodDk}"/></svg></a>
          <button class="pm-tag" id="pmGrown" aria-label="Grown-ups"><svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="M-6 -1 v-4 a6 6 0 0 1 12 0 v4" fill="none" stroke="${C.woodInk}" stroke-width="2.6"/><rect x="-9" y="-1" width="18" height="13" rx="3" fill="${C.woodInk}"/><circle cx="0" cy="5" r="2" fill="${C.woodLt}"/></svg></button>
        </div>
        <h1 class="pm-title">${R.title}</h1>
        <button class="pm-tag" id="pmBones" aria-label="${s.bones} bones. Open the Bone Shop">${A.bone(0, 0, 1).replace('<g transform="translate(0 0) scale(1)">', '<svg viewBox="-22 -14 44 28" aria-hidden="true"><g>').replace(/<\/g>$/, '</g></svg>')}<span>${s.bones}</span></button>
      </div>
      ${returning() ? `<button class="pm-jump" id="pmJump" aria-haspopup="dialog">${icons.places}Places</button>` : ''}
      <div class="pm-stage" style="height:${view.H}px">
        <svg viewBox="${vb}" preserveAspectRatio="xMidYMin meet" aria-hidden="true">${scene}${A.tint(theme, WORLD_W, WORLD_H)}${ws.map(haloSVG).join('')}</svg>
        <svg viewBox="${vb}" preserveAspectRatio="xMidYMin meet" aria-hidden="true" id="pmLive">
          ${at ? `<g id="pmBonnie" style="transform:translate(${bfx}px,${bfy}px)"><g>${A.bonnie(0, 0, .58)}</g></g><g id="pmBubble" class="pm-bub">${bubbleSVG(at, bonnieLine)}</g>` : ''}
        </svg>
        ${ws.map(signHTML).join('')}
        <h2 class="sr">The meadow. Tap a place to play there.</h2>
        ${at ? `<button class="pm-hit bonnie-hit" id="pmBonnieBtn" style="left:${bl.toFixed(1)}px;top:${bt.toFixed(1)}px;width:${(80 * view.k).toFixed(1)}px;height:${(80 * view.k).toFixed(1)}px" aria-label="Bonnie says: ${ui.esc(bonnieLine)} Tap to go to ${ui.esc(at.name)}."></button>` : ''}
        ${hits}
      </div>
      ${unplaced().length ? `<div class="pm-more"><h2 style="font:700 20px Fredoka;margin:0;color:${C.ink}">More worlds</h2>${unplaced().map(w => `<button data-w="${ui.esc(w.id)}" class="pm-hit-more">${ui.esc(w.name)} · ${info(w).earned}/${info(w).max}</button>`).join('')}</div>` : '<div class="pm-end"></div>'}
    </div>`);
    // keep every sign on the screen (a phone shows only the middle of the drawing)
    ui.$$('.pm-sign').forEach(el => { const r = el.getBoundingClientRect(), lo = 6, hi = view.W - 6;
      if (r.right > hi) el.style.left = (parseFloat(el.style.left) - (r.right - hi)) + 'px'; else if (r.left < lo) el.style.left = (parseFloat(el.style.left) + lo - r.left) + 'px'; });
    // the Bonnie button sits at her feet and moves with her: it's placed first among the places for VoiceOver
    const bb = document.getElementById('pmBonnieBtn'); if (bb) bb.parentNode.insertBefore(bb, bb.parentNode.querySelector('.pm-hit:not(.bonnie-hit)'));
    ui.$$('.pm-hit[data-w]').forEach(b => {
      const id = b.dataset.w;
      const lit = v => { const sg = document.getElementById('pmSign-' + id), h = document.getElementById('pmHalo-' + id); if (sg) sg.classList.toggle('lit', v); if (h) h.classList.toggle('lit', v); };
      b.addEventListener('pointerdown', () => { if (busy) return; lit(true); const sg = document.getElementById('pmSign-' + id); if (sg) sg.classList.add('pressed'); ui.tone && ui.tone(620, .06, 'sine', .07); });
      const up = () => { const sg = document.getElementById('pmSign-' + id); if (sg) sg.classList.remove('pressed'); if (!b.classList.contains('chosen')) lit(b.matches(':focus-visible')); };
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, up));
      b.addEventListener('focus', () => lit(b.matches(':focus-visible'))); b.addEventListener('blur', () => { if (!b.classList.contains('chosen')) lit(false); });
      b.onclick = () => choose(id, b);
    });
    ui.$$('.pm-hit-more').forEach(b => b.onclick = () => choose(b.dataset.w, b));
    if (bb) bb.onclick = () => choose(at.id, bb, true);
    ui.$('#pmGrown').onclick = () => { leave(); M.grownUps(); };
    ui.$('#pmBones').onclick = () => { leave(); M.shop({ welcome: true }); };
    if (shopTip) M.tips.at('shop', ui.$('#pmBones')); // the ring (once per player: the save remembers it)
    if (ui.$('#pmJump')) ui.$('#pmJump').onclick = openPlaces;
    // bring Bonnie's place into view (she may be far down the route)
    const target = px(bfx, bfy)[1] - innerHeight * .55;
    if (target > 0) window.scrollTo({ top: target, behavior: reduce() ? 'auto' : 'smooth' });
    setTimeout(() => { if (on && !busy) ui.say(bonnieLine); }, 350);
  }
  const shortName = w => w.name.replace(/^The /, 'the ');

  /* "Places": every world in a list, for a child who knows where they're going. Choosing one goes there the same
     way as tapping it on the map (Bonnie trots over, then its level map opens). */
  function openPlaces() {
    const opener = ui.$('#pmJump'), ws = M.visibleWorlds(R.subject);
    const bg = document.createElement('div'); bg.className = 'pm-sheet-bg';
    bg.innerHTML = `<div class="pm-sheet" role="dialog" aria-modal="true" aria-labelledby="pmSheetH" tabindex="-1"><h2 id="pmSheetH">Go straight to…</h2><ul>${ws.map(w => {
      const p = progress(w); return `<li><button data-w="${ui.esc(w.id)}" class="${at && at.id === w.id ? 'here' : ''}" aria-label="${ui.esc(`${w.name}. ${p.say}${at && at.id === w.id ? ' Bonnie is here.' : ''}`)}"><span>${ui.esc(w.name)}</span><span class="pg">${icons[p.main.icon]}${ui.esc(p.main.text)}</span></button></li>`; }).join('')}</ul>
      <button class="close" data-close>Close</button></div>`;
    document.body.appendChild(bg);
    const close = () => { bg.remove(); if (opener && opener.isConnected) opener.focus(); };
    bg.addEventListener('click', e => {
      if (e.target === bg || e.target.closest('[data-close]')) return close();
      const b = e.target.closest('[data-w]'); if (!b) return;
      bg.remove();
      const hit = ui.$(`.pm-hit[data-w="${b.dataset.w}"]`);
      if (hit) { hit.scrollIntoView({ block: 'center', behavior: reduce() ? 'auto' : 'smooth' }); setTimeout(() => choose(b.dataset.w, hit), reduce() ? 0 : 350); }
      else choose(b.dataset.w, b);
    });
    bg.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { const f = [...bg.querySelectorAll('button')], i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
    });
    (bg.querySelector('button.here') || bg.querySelector('[data-w]')).focus();
  }

  function choose(id, el, viaBonnie) {
    if (busy) return;
    const w = M.world(id); if (!w) return;
    busy = true; ui.sfx.pop();
    el.classList.add('chosen');
    const sg = document.getElementById('pmSign-' + id), h = document.getElementById('pmHalo-' + id);
    if (sg) { sg.classList.remove('pressed'); sg.classList.add('lit'); } if (h) h.classList.add('lit');
    const bon = document.getElementById('pmBonnie'), bub = document.getElementById('pmBubble'), p = PLACES[id];
    const line = p ? p.go : `Off we go!`;
    const open = () => { leave(); M.worldMap(id); };
    if (!bon || !p) { setTimeout(open, 250); return; }
    if (viaBonnie || at && at.id === id || reduce()) {
      // she's already there (or no movement wanted): a wiggle, her words, then go
      if (!reduce()) { bon.classList.remove('wiggle'); void bon.getBoundingClientRect(); bon.classList.add('wiggle'); }
      if (reduce() && at && at.id !== id) bon.style.transform = `translate(${p.bonnie[0]}px,${p.bonnie[1]}px)`;
      bub.innerHTML = bubbleSVG(w, line); at = w; ui.say(line);
      setTimeout(open, reduce() ? 450 : 800);
      return;
    }
    // she trots over with two little hops, then says where you're going
    bub.style.opacity = '0';
    bon.classList.add('hop');
    bon.style.transform = `translate(${p.bonnie[0]}px,${p.bonnie[1]}px)`;
    setTimeout(() => { bub.innerHTML = bubbleSVG(w, line); bub.style.opacity = '1'; at = w; ui.say(line); }, 760);
    setTimeout(open, 1350);
  }
  function leave() { on = false; busy = false; document.body.classList.remove('pm-on'); const sh = document.querySelector('.pm-sheet-bg'); if (sh) sh.remove(); }

  /* ---------- fitting into the engine without changing it ---------- */
  function install() {
    ui.$('style#pm-css') || document.head.insertAdjacentHTML('beforeend', `<style id="pm-css">${CSS}</style>`);
    const screenEl = document.getElementById('screen');
    // whenever the engine draws its world list, show the meadow instead; its level map's "Worlds" button comes back here
    new MutationObserver(() => {
      if (screenEl.querySelector('.worlds') && !screenEl.querySelector('.pm')) { draw(); return; }
      const back = screenEl.querySelector('#back');
      if (back && /Worlds/.test(back.textContent) && !back.dataset.pm) { back.dataset.pm = 1; back.textContent = '← Meadow'; back.onclick = () => draw(); }
      if (!screenEl.querySelector('.pm') && on) leave();
    }).observe(screenEl, { childList: true, subtree: false });
    const home = document.getElementById('homeLink'); if (home) home.onclick = () => draw();
    let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (on) draw(); }, 200); });
    addEventListener('storage', () => { if (on && !busy) draw(); });
    if (screenEl.querySelector('.worlds')) draw();
  }

  /* ---------- checks (selftest=1) ---------- */
  async function selftest() {
    const out = [], ok = (name, pass, detail = '') => out.push({ name, pass: !!pass, detail: String(detail) });
    const wait = ms => new Promise(r => setTimeout(r, ms));
    await wait(300);
    const t0 = performance.now(); draw(); const drawMs = performance.now() - t0;
    const r = el => el.getBoundingClientRect();
    const cross = (a, b) => a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2;
    const ws = M.visibleWorlds(R.subject), hits = ui.$$('.pm-hit[data-w]');
    ok('the meadow is showing', !!ui.$('.pm'));
    ok(`every ${R.title} world has a place`, hits.length + ui.$$('.pm-hit-more').length === ws.length, `${hits.length} places for ${ws.length} worlds`);
    const small = hits.concat(ui.$$('.pm-tag'), ui.$$('.pm-jump')).filter(b => r(b).width < 44 || r(b).height < 44);
    ok('every tap target is at least 44 × 44', !small.length, small.map(b => b.getAttribute('aria-label')).join(', '));
    ok('each place is a generous target (at least 120 × 100)', hits.every(b => r(b).width >= 120 && r(b).height >= 100), hits.map(b => `${r(b).width.toFixed(0)}×${r(b).height.toFixed(0)}`).join(', '));
    ok('every place has a VoiceOver name', hits.every(b => (b.getAttribute('aria-label') || '').length > 10));
    const labels = hits.map(b => b.getAttribute('aria-label'));
    ok('each name says its stars', ws.every(w => labels.some(l => l.includes(w.name) && l.includes(progress(w).say))));
    ok('places do not overlap each other', !hits.some((a, i) => hits.some((b, j) => j > i && cross(r(a), r(b)))));
    ok('nothing is wider than the screen', document.documentElement.scrollWidth <= innerWidth + 1, `${document.documentElement.scrollWidth} vs ${innerWidth}`);
    // the name signs
    const signs = ws.map(w => document.getElementById('pmSign-' + w.id));
    ok('every place has a name sign with its name and progress', ws.every((w, i) => signs[i] && signs[i].querySelector('b').textContent === w.name && signs[i].querySelector('.pg').textContent.trim() === progress(w).main.text));
    const nameSizes = signs.map(s => parseFloat(getComputedStyle(s.querySelector('b')).fontSize)), pgSizes = signs.map(s => parseFloat(getComputedStyle(s.querySelector('.pg')).fontSize));
    ok('names are 19px or more, progress 16px or more', Math.min(...nameSizes) >= 19 && Math.min(...pgSizes) >= 16, `names ${Math.min(...nameSizes)}px, progress ${Math.min(...pgSizes)}px`);
    ok('each sign is inside its place\'s tap area', ws.every((w, i) => { const a = r(signs[i]), b = r(hits[i]); return a.left >= b.left - 24 && a.right <= b.right + 24 && a.top >= b.top - 2 && a.bottom <= b.bottom + 2; }),
      ws.map((w, i) => { const a = r(signs[i]), b = r(hits[i]); return `${short(w.id)} ${Math.round(a.left - b.left)},${Math.round(b.right - a.right)},${Math.round(a.top - b.top)},${Math.round(b.bottom - a.bottom)}`; }).join(' | '));
    ok('signs are on the screen and do not overlap each other', signs.every(s => r(s).left >= 0 && r(s).right <= innerWidth) && !signs.some((a, i) => signs.some((b, j) => j > i && cross(r(a), r(b)))));
    const bub = r(document.getElementById('pmBubble'));
    ok("Bonnie's bubble covers no sign", !signs.some(s => cross(r(s), bub)), signs.filter(s => cross(r(s), bub)).map(s => s.id).join(', '));
    { // and wherever she hops to, with her longest line there
      const bubEl = document.getElementById('pmBubble'), keep = bubEl.innerHTML, bad = [];
      ws.forEach(w => { bubEl.innerHTML = bubbleSVG(w, PLACES[w.id].ask.length > 30 ? PLACES[w.id].ask : `Woof! Let's start at ${shortName(w)}!`); const br = r(bubEl); signs.forEach(s => { if (cross(r(s), br)) { const a = r(s); bad.push(short(w.id) + '→' + short(s.id.replace('pmSign-', '')) + ` (bubble ${[br.left, br.top, br.right, br.bottom].map(Math.round)} sign ${[a.left, a.top, a.right, a.bottom].map(Math.round)})`); } }); });
      bubEl.innerHTML = keep;
      ok("…nor does it at any other place", !bad.length, bad.join(', '));
    }
    const tasterOn = ws.some(w => info(w).taster);
    ok('the free taster shows its padlock on each sign (only in the app)', ws.every((w, i) => !!signs[i].querySelector('.lk') === info(w).taster), tasterOn ? 'taster on' : 'taster off');
    ok('Bonnie is on the map, with a button', !!ui.$('#pmBonnie') && !!ui.$('#pmBonnieBtn'));
    const svgCount = ui.$$('.pm-stage svg *').length; ok('drawing size is modest (for the 2018 iPad)', svgCount < 6000 && drawMs < 400, `${svgCount} SVG elements, drawn in ${drawMs.toFixed(0)} ms`);
    ok('the trail is short', WORLD_H <= R.maxH && r(ui.$('.pm-stage')).height <= R.maxH * view.k + 1, `${Math.round(r(ui.$('.pm-stage')).height)}px tall`);
    // pressing a place lights it
    hits[0].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await wait(30);
    const sg0 = signs[0];
    ok('pressing a place lights its sign and ring', sg0.classList.contains('lit') && sg0.classList.contains('pressed') && document.getElementById('pmHalo-' + ws[0].id).classList.contains('lit'));
    hits[0].dispatchEvent(new PointerEvent('pointerleave', { bubbles: true })); await wait(30);
    ok('…and letting go puts it back', !sg0.classList.contains('pressed') && !sg0.classList.contains('lit'));
    // Places
    const jump = ui.$('#pmJump');
    ok('"Places" shows for a returning player, not a new one', !!jump === returning(), returning() ? 'returning' : 'new player');
    if (jump) {
      jump.click(); await wait(80);
      const sheet = ui.$('.pm-sheet');
      ok('"Places" lists every world, with its progress, and starts on Bonnie\'s', !!sheet && sheet.querySelectorAll('[data-w]').length === ws.length && document.activeElement && document.activeElement.closest('.pm-sheet') && sheet.contains(document.activeElement));
      sheet.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await wait(50);
      ok('Escape closes it and goes back to the Places button', !ui.$('.pm-sheet') && document.activeElement === ui.$('#pmJump'));
    }
    // tap the second place: the engine's own level map opens, with its locks
    const second = ui.$$('.pm-hit[data-w]')[1]; second.click(); await wait(1700);
    const back = ui.$('#back');
    ok('a place opens the real level map', !!back && !!ui.$('.stone'), back ? back.textContent : 'no map');
    const w2 = M.world(second.dataset.w), stones = ui.$$('.stone');
    ok('the level map keeps the engine\'s unlocking', stones.every((st, l) => { const paid = M.fullGame.paid(w2, l), un = !paid && M.levelUnlocked(w2, l); return st.classList.contains('locked') === (!paid && !un) && st.classList.contains('paid') === paid; }));
    ok('the level map has a top bar (the engine\'s, or the drawn level map\'s own)', getComputedStyle(ui.$('.hud')).display !== 'none' || !!ui.$('#plBack'));
    if (back) back.click(); await wait(300);
    ok('"Meadow" goes back to the meadow', !!ui.$('.pm'));
    // Bonnie's first-time help for the Bone Shop (the old top-bar button is hidden here): on the map and on a level map
    {
      const tips0 = { ...(M.save.get().tips || {}) }, clear = () => M.save.mutate(s => { const t = { ...s.tips }; delete t.shop; s.tips = t; });
      const ringOn = id => { const el = ui.$('#' + id); return !!el && el.classList.contains('tip-ring') && getComputedStyle(el).boxShadow.includes('242, 181, 58'); }; // the gold edge, visible inside the signpost shape
      clear(); const due = M.tips.due('shop'); draw(); await wait(50);
      if (due) {
        ok('the Bone Shop tip: the map\'s bones tag glows gold and Bonnie says so, once (the save remembers it)', ringOn('pmBones') && ui.$('#pmBubble').textContent.replace(/\s/g, '') === ui.fmt(M.LINES.tipShop).replace(/\s/g, '') && M.save.get().tips.shop === true, ui.$('#pmBubble').textContent);
        draw(); await wait(50);
        ok('…and not again on the next visit', !ui.$('.tip-ring') && ui.$('#pmBubble').textContent.replace(/\s/g, '') !== ui.fmt(M.LINES.tipShop).replace(/\s/g, ''));
        clear(); M.worldMap(ws[0].id); await wait(150);
        ok('…or on a level map, if that comes first', ringOn('plBones') && M.save.get().tips.shop === true);
        M.home(); await wait(150);
      } else ok('no Bone Shop tip for a child it isn\'t for (no bones yet, or something bought)', !ui.$('.tip-ring'), JSON.stringify(M.save.get().tips));
      M.save.mutate(s => { s.tips = tips0; }); draw(); await wait(50);
    }
    const pre = document.createElement('pre'); pre.id = 'selftest'; pre.textContent = JSON.stringify({ size: [innerWidth, innerHeight], passed: out.filter(x => x.pass).length, of: out.length, results: out }, null, 1);
    document.body.appendChild(pre);
  }

  window.ProtoMap = { install, draw, PLACES, selftest };
  if (Q.get('view') !== 'old' && !(window.MeadowLook && !window.MeadowLook.on)) install();
  if (Q.get('selftest')) selftest();
})();
