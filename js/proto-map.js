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
    // 24 November 2026: the wider, roomier Maths world (js/proto-map-art.js, MATHS_AT), written straight in its own units
    'y2-maths-partitioning': { fin: true, hit: [416, 278, 228, 317], sign: [540, 505], bonnie: [692, 521], bub: [650, 459, 'above'] },
    'y2-maths-number-bonds': { fin: true, hit: [966, 527, 234, 177], sign: [1092, 610], bonnie: [1080, 705], bub: [980, 706, 'below'] },
    'y2-maths-number-lines': { fin: true, hit: [586, 761, 394, 113], sign: [682, 770], bonnie: [812, 871], bub: [760, 876, 'below'] },
    'y2-maths-arrays': { fin: true, hit: [982, 994, 228, 259], sign: [1090, 1179], bonnie: [950, 1063], bub: [780, 998, 'above'] },
    'y2-maths-sharing': { fin: true, hit: [360, 1136, 228, 170], sign: [470, 1237], bonnie: [712, 1222], bub: [647, 1226, 'below'] },
    'y2-maths-money': { fin: true, hit: [402, 1452, 270, 244], sign: [560, 1606], bonnie: [759, 1588], bub: [739, 1468, 'above'] },
    'y2-maths-time': { fin: true, hit: [976, 1560, 226, 332], sign: [1094, 1798], bonnie: [950, 1826], bub: [914, 1762, 'above'] },
    'y2-maths-captains-cove': { fin: true, hit: [560, 1974, 420, 176], sign: [666, 1982], bonnie: [825, 1966], bub: [860, 1982, 'below'] },
  };
  // the Meadow Words route (drawn at its own height, so no moving)
  const RAW_WORDS = {
    'y2-english-phonics': { hit: [130, 30, 240, 372], sign: [262, 290], bonnie: [404, 236], bub: [330, 170, 'above'] },
    'y2-english-tricky-words': { hit: [300, 408, 260, 222], sign: [452, 532], bonnie: [300, 420], bub: [131, 438, 'below'] },
    'y2-english-sentences': { hit: [126, 640, 238, 220], sign: [236, 766], bonnie: [404, 690], bub: [340, 706, 'below'] },
    'y2-english-stories': { hit: [366, 650, 200, 400], sign: [440, 948], signW: 150, bonnie: [300, 900], bub: [131, 912, 'below'] },
  };
  const ROUTES = {
    // wide: a world bigger than the screen every way, whose "whole map" (fit) is just the part with the places in it
    maths: { subject: 'maths', title: 'Meadow Maths', raw: RAW_MATHS, F, W: A.MATHS_W, H: A.ROUTE_H, fit: A.MATHS_FIT, off: A.MATHS_OFF, wide: true, scene: A.mathsRoute, maxH: 2560 },
    words: { subject: 'english', title: 'Meadow Words', raw: RAW_WORDS, F: y => y, W: A.WORDS_W, H: A.WORDS_H, fit: A.WORDS_FIT, off: A.WORDS_OFF, wide: true, scene: A.wordsRoute, maxH: A.WORDS_H },
  };
  const R = ROUTES[window.PROTO_ROUTE] || ROUTES.maths, G = R.F;
  // Bonnie's words (js/meadow-look.js, where tools/make-voice.mjs finds them to record)
  const LL = window.MeadowLook.LINES, SAYS = id => LL.places[id] || [LL.offWeGo, LL.offWeGo];
  // (off: where the drawing sits in a bigger picture, as the Maths world does)
  const [OX, OY] = R.off || [0, 0];
  const PLACES = Object.fromEntries(Object.entries(R.raw).map(([id, p]) => { const G = p.fin ? (y => y + OY) : (y => R.F(y) + OY); return [id, { ...p,
    hit: [p.hit[0] + OX, G(p.hit[1]), p.hit[2], G(p.hit[1] + p.hit[3]) - G(p.hit[1])],
    sign: [p.sign[0] + OX, G(p.sign[1])], bonnie: [p.bonnie[0] + OX, G(p.bonnie[1])], bub: [p.bub[0] + OX, G(p.bub[1]), p.bub[2]] }]; }));
  // A phone opens on the middle of the drawing (PHONE_W across, from PHONE_X), where every place and sign is; the map can
  // then be dragged and pinched anywhere inside the drawing (js/map-camera.js).
  const WORLD_W = R.W, WORLD_H = R.H, PHONE_X = 125, PHONE_W = 390;
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
  .pm-on .hud,.pm-on .meadow{display:none!important}
  .pm-on #app{max-width:none;padding:0;min-height:0}
  .pm-on{background:${C.meadow}!important}
  /* the map fills the screen and stays put: it moves inside itself, never the page (nothing below it to scroll to) */
  html:has(> body.pm-on){background:${C.meadow};overflow:hidden;overscroll-behavior:none}
  .pm-on{overflow:hidden}
  .pm{position:fixed;inset:0;overflow:hidden;background:${C.meadow}}
  .pm-bar{position:absolute;left:0;right:0;top:0;z-index:6;display:flex;align-items:flex-start;justify-content:space-between;gap:8px;
    padding:calc(8px + env(safe-area-inset-top)) calc(10px + env(safe-area-inset-right)) 0 calc(10px + env(safe-area-inset-left));pointer-events:none}
  .pm-bar>*{pointer-events:auto}
  .pm-tag{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-width:48px;min-height:46px;padding:0 10px 0 20px;border:0;font:700 19px Fredoka,system-ui,sans-serif;color:${C.woodInk};text-decoration:none;cursor:pointer;
    background:${C.woodLt};clip-path:polygon(14px 0,100% 0,100% 100%,14px 100%,0 50%);box-shadow:inset 0 -4px 0 rgba(154,106,58,.55);filter:drop-shadow(0 2px 0 ${C.woodDk})}
  .pm-tag svg{width:26px;height:26px;flex:none}
  /* Bonnie's first-time help on a tag (the Bone Shop): the signpost shape would cut off the game's ring, so the tag itself glows gold */
  .pm-tag.tip-ring{outline:none;background:#FBE1A0;box-shadow:inset 0 0 0 4px #F2B53A,inset 0 -4px 0 rgba(154,106,58,.55);animation:pmTip 1.4s ease-in-out infinite}
  @keyframes pmTip{50%{background:${C.woodLt}}}
  .pm-tag:focus-visible{outline:3px solid ${C.goldDk};outline-offset:2px}
  .pm-tags{display:flex;gap:6px;flex:none}
  /* the bar's signs keep their size and stay on the screen; the title in the middle is the part that gives way (it can
     wrap onto two lines). (24 November 2026: in the Bone Shop opened from the Clubhouse, "Clubhouse" plus a big bone
     count were wider than the screen, so the count ran off the right edge.) */
  .pm-bar>.pm-tag,.pm-bar>a,.pm-bar>button{flex:none}
  .pm-bar>.pm-title{flex:0 1 auto;min-width:0;white-space:normal!important;overflow-wrap:normal;line-height:1.1}
  .pm-title{margin:2px 0 0;padding:6px 16px 8px;border-radius:10px;background:${C.woodLt};box-shadow:0 3px 0 ${C.woodDk};font:700 clamp(17px,5vw,22px) Fredoka,system-ui,sans-serif;color:${C.woodInk};white-space:nowrap;text-align:center}
  /* the map's own viewport: only here do a pinch and a drag move the map (everywhere else in the game is untouched) */
  .pm-view{position:absolute;inset:0;overflow:hidden;overflow:clip;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
  .pm-stage{position:absolute;left:0;top:0;transform-origin:0 0}
  .cam-moving .pm-stage,.cam-moving .pm-at{will-change:transform}
  .pm-stage,.pm-at{transition:none!important} /* the camera moves these itself, every frame (the game's Reduce Motion rule would otherwise give them a transition) */
  .pm-signs{position:absolute;inset:0;z-index:4;pointer-events:none}
  .pm-at{position:absolute;left:0;top:0;transform-origin:0 0}
  .pm-signs.compact .pm-sign .pg{display:none}
  @media (max-width:400px){.pm-bar{gap:4px;padding-left:6px;padding-right:6px}.pm-tags{gap:4px}.pm-title{font-size:16px;padding:6px 10px 8px}.pm-tag{font-size:17px}}
  .pm-stage>svg{position:absolute;left:0;top:0;width:100%;height:100%;display:block;overflow:visible} /* (trees at the picture's edge are drawn whole, over the land beyond) */
  .pm-back{position:absolute;left:0;top:0;transform-origin:0 0;pointer-events:none;transition:none!important}
  .pm-back>svg{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
  .pm-hit{position:absolute;z-index:3;border:0;margin:0;padding:0;background:transparent;border-radius:28px;cursor:pointer;-webkit-tap-highlight-color:transparent}
  .pm-hit:focus-visible{outline:4px solid ${C.goldDk};outline-offset:-4px}
  .pm-hit.bonnie-hit{border-radius:50%;z-index:5}

  /* each place's name sign: a wooden board on a post, its name big, its progress underneath */
  .pm-sign{position:absolute;left:0;top:0;transform:translateX(-50%);pointer-events:auto;cursor:pointer;display:grid;justify-items:center;gap:4px;width:max-content;max-width:calc(200px * var(--k,1));
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
  /* along the bottom: See whole map (left) and Places (right); the zoom buttons above Places */
  .pm-low{position:absolute;z-index:7;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:flex-end;gap:10px;pointer-events:none;
    padding:0 calc(12px + env(safe-area-inset-right)) calc(14px + env(safe-area-inset-bottom)) calc(12px + env(safe-area-inset-left))}
  .pm-low>*{pointer-events:auto}
  .pm-ctl{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:52px;padding:0 18px 0 14px;border:2px solid ${C.woodDk};border-radius:14px;
    background:${C.woodLt};box-shadow:0 4px 0 ${C.woodDk};font:700 18px Fredoka,system-ui,sans-serif;color:${C.woodInk};cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;white-space:nowrap}
  .pm-ctl svg{width:26px;height:26px;flex:none}
  .pm-jump{margin-left:auto}
  .pm-ctl:active{transform:translateY(3px);box-shadow:0 1px 0 ${C.woodDk}}
  .pm-ctl:focus-visible{outline:3px solid ${C.goldDk};outline-offset:2px}
  .pm-zoom{position:absolute;z-index:7;right:calc(12px + env(safe-area-inset-right));bottom:calc(84px + env(safe-area-inset-bottom));display:grid;gap:10px}
  .pm-zb{width:52px;padding:0}
  .pm-zb[aria-disabled="true"]{background:#E9DFCB;border-color:#B9A98E;box-shadow:0 2px 0 #B9A98E}.pm-zb[aria-disabled="true"] svg{opacity:.4}
  @media (max-width:400px){.pm-ctl{font-size:17px;padding:0 14px 0 10px;gap:6px}}
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
  .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`;

  function layout() {
    const W = document.documentElement.clientWidth || innerWidth, phone = W < 600;
    // vx0, vw: the part of the drawing the map opens on, filling the screen's width (a phone: the middle; bigger: all of it)
    view = phone ? { vx0: PHONE_X, vw: PHONE_W } : { vx0: 0, vw: 640 };
    if (R.wide) view.vx0 = 0; // a wide world opens on Bonnie's place, wherever it is across the drawing
    view.W = W; view.k = W / view.vw; // px per drawing unit at the opening zoom; the drawing is laid out at this size
  }
  const px = (x, y) => [x * view.k, y * view.k];

  function signHTML(w) {
    const [x, y] = PLACES[w.id].sign, p = progress(w), sw = PLACES[w.id].signW; // signW: a narrower sign, so a long name wraps
    return `<div class="pm-at" data-x="${x}" data-y="${y}"><div class="pm-sign" id="pmSign-${w.id}" data-w="${ui.esc(w.id)}"${sw ? ` style="max-width:calc(${sw}px * var(--k,1))"` : ''} aria-hidden="true">
      <b>${ui.esc(w.name)}</b><span class="pg ${p.main.cls}">${icons[p.main.icon]}${ui.esc(p.main.text)}${p.f.taster ? `<span class="lk">${icons.lock}</span>` : ''}</span></div></div>`;
  }
  function haloSVG(w) {
    const [x, y, ww, hh] = PLACES[w.id].hit;
    return `<g class="pm-halo" id="pmHalo-${w.id}"><ellipse cx="${x + ww / 2}" cy="${y + hh * .62}" rx="${ww * .44}" ry="${hh * .3}" fill="${C.gold}" opacity=".22"/><ellipse cx="${x + ww / 2}" cy="${y + hh * .62}" rx="${ww * .44}" ry="${hh * .3}" fill="none" stroke="${C.gold}" stroke-width="4" stroke-dasharray="14 8"/></g>`;
  }
  function wrap(text, max = 24) { const out = []; let line = ''; text.split(' ').forEach(word => { if ((line + ' ' + word).trim().length > max && line) { out.push(line); line = word; } else line = (line + ' ' + word).trim(); }); if (line) out.push(line); return out; }
  function bubbleSVG(w, text) {
    const p = PLACES[w.id], lines = wrap(text, 17), fs = 16 / Math.min(1.2, view.k), h = lines.length * fs * 1.3 + 20, bw = 168 / Math.min(1.2, view.k);
    const [bx, byRaw, side] = p.bub, [fx, fy] = p.bonnie;
    let x;
    if (R.wide) { const c = wideX(w), half = innerWidth / view.k / 2, pad = 8 / view.k; x = Math.max(6, Math.min(WORLD_W - bw - 6, clampTo(bx, c - half + pad, c + half - pad - bw))); }
    else x = Math.max(view.vx0 + 6, Math.min(bx, view.vx0 + view.vw - bw - 6));
    return side === 'above' ? A.bubble(x, byRaw - h, bw, lines, fx - 10, fy - 58, fs) : A.bubble(x, byRaw, bw, lines, fx + 4, fy - 4, fs);
  }

  /* ---------- the camera: where the map is looking (js/map-camera.js) ---------- */
  // kept while the page is open, for each player and route: back from a level (or the shop, or a turn of the iPad), the map is where it was
  const camMem = {};
  const camKey = () => { const pl = M.players && M.players.on() && (M.players.list().find(p => p.current) || {}).id; return R.subject + '/' + (pl || 'p1'); };
  const mid = w => { const [x, y, ww, hh] = PLACES[w.id].hit; return [x + ww / 2, y + hh / 2]; };
  let cam = null, signs = [], compact = null;
  // the room the map has between the top bar and the buttons along the bottom
  function insets() {
    const bar = ui.$('.pm-bar'), low = ui.$('.pm-low'), vh = innerHeight;
    const zoom = ui.$('.pm-zoom'); // the + and − buttons, down the right: the whole map keeps clear of them too
    return { top: bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 0, bottom: low ? Math.max(0, vh - low.getBoundingClientRect().top) + 6 : 0,
      right: zoom ? Math.max(0, innerWidth - zoom.getBoundingClientRect().left) + 6 : 0 };
  }
  // the name signs: their full size at the opening zoom and a little bigger zoomed in; zoomed out they shrink with the
  // map (down to half) and show just the name, so they never pile up ("Back to Bonnie" or a double-tap brings them back)
  function placeSigns(c) {
    const z = c.zoom, s = Math.max(.5, Math.min(1.25, z / view.k)), small = z < view.k * .8;
    if (small !== compact) { compact = small; ui.$('#pmSigns').classList.toggle('compact', small); signs.forEach(g => { g.hw = g.inner.offsetWidth / 2; }); }
    const left = c.x, right = c.x + WORLD_W * z;
    signs.forEach(g => {
      let [sx, sy] = c.toScreen(g.x, g.y);
      sx = Math.max(left + g.hw * s + 4, Math.min(right - g.hw * s - 4, sx));
      g.el.style.transform = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0) scale(${s.toFixed(3)})`;
    });
    const whole = ui.$('#pmWhole');
    if (whole) { const back = c.isWhole(); if (whole.dataset.back !== String(back)) { whole.dataset.back = back; whole.querySelector('span').textContent = back ? 'Back to Bonnie' : 'See whole map'; } }
    const zi = ui.$('#pmIn'), zo = ui.$('#pmOut');
    if (zi) zi.setAttribute('aria-disabled', z >= c.zMax() * .99); if (zo) zo.setAttribute('aria-disabled', z <= c.zMin() * 1.01);
  }
  // a wide world: across, the middle of her place, Bonnie and her speech bubble together (so the bubble is never cut off by the screen's edge)
  // (on a small screen her own sign and Bonnie come first, then the bubble; the bubble moves in beside them if it must)
  const clampTo = (v, a, b) => a <= b ? Math.max(a, Math.min(b, v)) : (a + b) / 2;
  function wideX(w) {
    const p = PLACES[w.id], k = view.k, half = innerWidth / k / 2, pad = 8 / k, bw = 168 / Math.min(1.2, k), bx = Math.max(6, Math.min(p.bub[0], WORLD_W - bw - 6));
    const g = signs.find(g => g.inner.id === 'pmSign-' + w.id), sl = g ? g.x - g.hw / k : p.sign[0], sr = g ? g.x + g.hw / k : p.sign[0];
    const mustL = Math.min(p.bonnie[0] - 40, sl), mustR = Math.max(p.bonnie[0] + 40, sr), allL = Math.min(mustL, bx), allR = Math.max(mustR, bx + bw);
    const c = (Math.min(allL, p.hit[0]) + Math.max(allR, p.hit[0] + p.hit[2])) / 2, lo = allR + pad - half, hi = allL - pad + half;
    return lo <= hi ? clampTo(c, lo, hi) : clampTo((lo + hi) / 2, mustR + pad - half, mustL - pad + half);
  }
  /* The land beyond the map's picture (ProtoArt.surround), for when the whole map is narrower or shorter than the
     screen: a plainer layer behind the map, drawn at the most it is ever enlarged, and moved with the map. */
  let back = null;
  function makeBack(theme) {
    back = null;
    const vp = ui.$('#pmView'), VW = vp.clientWidth, VH = vp.clientHeight, zLow = cam.zMin() * .9; // (a pinch can go a little past the smallest zoom)
    const cover = Math.max(VW / WORLD_W, VH / WORLD_H);
    if (zLow >= cover) return; // the picture always fills the screen
    const step = v => Math.ceil(Math.max(0, v) / 100) * 100 + 100;
    const X = step((VW / zLow - WORLD_W) / 2), Y = step((VH / zLow - WORLD_H) / 2), bk = Math.min(view.k, cover);
    const key = R.subject + X + '/' + Y + theme;
    if (!backArt[key]) backArt[key] = A.surround(R === ROUTES.words ? 'words' : 'maths', X, Y) + A.tint(theme, WORLD_W + 2 * X + 60, WORLD_H + 2 * Y + 60, -X - 30, -Y - 30);
    const el = document.createElement('div');
    el.className = 'pm-back'; el.id = 'pmBack'; el.setAttribute('aria-hidden', 'true');
    el.style.width = ((WORLD_W + 2 * X) * bk).toFixed(1) + 'px'; el.style.height = ((WORLD_H + 2 * Y) * bk).toFixed(1) + 'px';
    el.innerHTML = `<svg viewBox="${-X} ${-Y} ${WORLD_W + 2 * X} ${WORLD_H + 2 * Y}">${backArt[key]}</svg>`;
    vp.insertBefore(el, ui.$('#pmStage'));
    back = { el, X, Y, bk, cover };
  }
  function placeBack(c) {
    if (!back) return;
    const seen = c.zoom < back.cover * .999;
    back.el.style.visibility = seen ? 'visible' : 'hidden';
    if (seen) back.el.style.transform = `translate3d(${(c.x - back.X * c.zoom).toFixed(2)}px,${(c.y - back.Y * c.zoom).toFixed(2)}px,0) scale(${(c.zoom / back.bk).toFixed(5)})`;
  }
  const backArt = {};
  function bonnieView(animate) { if (at) { const [, y] = mid(at); cam.centreOn(R.wide ? wideX(at) : view.vx0 + view.vw / 2, y, view.k, animate); } }

  function draw() {
    if (cam) { camMem[camKey()] = cam.state(); cam.destroy(); cam = null; }
    on = true; busy = false;
    document.body.classList.add('pm-on');
    layout();
    if (!scene) scene = R.scene().render();
    const ws = placed(), sug = suggestion(ws), s = save(), theme = document.body.dataset.theme || 'day';
    at = sug || ws[0];
    const vb = `0 0 ${WORLD_W} ${WORLD_H}`;
    // Bonnie's first-time help (js/meadow-core.js): once there are bones, she points out the Bone Shop (the ring goes on the bones tag below)
    const shopTip = !!(M.tips && M.tips.due('shop'));
    const bonnieLine = shopTip ? ui.fmt(M.LINES.tipShop) : sug ? (info(sug).played ? SAYS(sug.id)[0] : LL.startAt(shortName(sug))) : LL.allStars;
    const [bfx, bfy] = at ? PLACES[at.id].bonnie : [320, 300];
    const hits = ws.map((w, i) => {
      const [x, y, ww, hh] = PLACES[w.id].hit, [l, t] = px(x, y), [r, b] = px(x + ww, y + hh);
      const p = progress(w), width = Math.max(44, r - l), height = Math.max(44, b - t);
      const label = `World ${i + 1}: ${w.name}. ${w.tag || ''}. ${p.say}${p.f.taster ? ' Level 1 is free to play.' : ''}`;
      return `<button class="pm-hit" data-w="${ui.esc(w.id)}" style="left:${l.toFixed(1)}px;top:${t.toFixed(1)}px;width:${width.toFixed(1)}px;height:${height.toFixed(1)}px" aria-label="${ui.esc(label.replace(/([.?!])\./g, '$1'))}"></button>`;
    }).join('');
    const [bl, bt] = px(bfx - 40, bfy - 78);
    const carry = ['demo', 'theme'].filter(k => Q.get(k)).map(k => `${k}=${encodeURIComponent(Q.get(k))}`).join('&');
    const club = (window.MeadowLook ? window.MeadowLook.pages : { club: 'prototype-clubhouse.html', maths: 'prototype-maths-map.html', words: 'prototype-words-map.html', walk: 'prototype-walk.html' }).club, home = club + (carry && /^prototype-/.test(club) ? '?' + carry : '');
    const ic = (vb, d) => `<svg viewBox="${vb}" aria-hidden="true">${d}</svg>`;
    ui.show(`<div class="pm" style="--k:${Math.min(1.25, view.k).toFixed(3)}">
      <div class="pm-bar">
        <div class="pm-tags">
          <a class="pm-tag" href="${home}" aria-label="Back to the Clubhouse"><svg viewBox="-14 -14 28 28" aria-hidden="true"><path d="M-12 0 L0 -11 L12 0" fill="${C.berry}" stroke="#A93E4F" stroke-width="2" stroke-linejoin="round"/><rect x="-9" y="-1" width="18" height="13" rx="1.5" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="1.6"/><rect x="-2.5" y="4" width="5" height="8" fill="${C.woodDk}"/></svg></a>
          <button class="pm-tag" id="pmGrown" aria-label="Grown-ups"><svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="M-6 -1 v-4 a6 6 0 0 1 12 0 v4" fill="none" stroke="${C.woodInk}" stroke-width="2.6"/><rect x="-9" y="-1" width="18" height="13" rx="3" fill="${C.woodInk}"/><circle cx="0" cy="5" r="2" fill="${C.woodLt}"/></svg></button>
        </div>
        <h1 class="pm-title">${R.title}</h1>
        <button class="pm-tag" id="pmBones" aria-label="${s.bones} bones. Open the Bone Shop"><svg viewBox="-22 -14 44 28" aria-hidden="true">${A.bone(0, 0, 1)}</svg><span>${s.bones}</span></button>
      </div>
      <div class="pm-view" id="pmView" role="group" aria-label="The meadow map. Pinch or use the zoom buttons to zoom; drag to look around.">
        <div class="pm-stage" id="pmStage" style="width:${(WORLD_W * view.k).toFixed(1)}px;height:${(WORLD_H * view.k).toFixed(1)}px">
          <svg viewBox="${vb}" aria-hidden="true">${scene}${A.tint(theme, WORLD_W + 400, WORLD_H + 400, -200, -200)}${ws.map(haloSVG).join('')}</svg>
          <svg viewBox="${vb}" aria-hidden="true" id="pmLive">
            ${at ? `<g id="pmBonnie" style="transform:translate(${bfx}px,${bfy}px)"><g>${A.bonnie(0, 0, .58)}</g></g><g id="pmBubble" class="pm-bub">${bubbleSVG(at, bonnieLine)}</g>` : ''}
          </svg>
          <h2 class="sr">The meadow. Tap a place to play there.</h2>
          ${at ? `<button class="pm-hit bonnie-hit" id="pmBonnieBtn" style="left:${bl.toFixed(1)}px;top:${bt.toFixed(1)}px;width:${(80 * view.k).toFixed(1)}px;height:${(80 * view.k).toFixed(1)}px" aria-label="Bonnie says: ${ui.esc(bonnieLine)} Tap to go to ${ui.esc(at.name)}."></button>` : ''}
          ${hits}
        </div>
        <div class="pm-signs" id="pmSigns">${ws.map(signHTML).join('')}</div>
      </div>
      <div class="pm-low">
        <button class="pm-ctl pm-whole" id="pmWhole">${ic('-12 -12 24 24', `<path d="M-9 -8 l6 -2 l6 2 l6 -2 v16 l-6 2 l-6 -2 l-6 2 z" fill="${C.paper}" stroke="${C.woodInk}" stroke-width="2" stroke-linejoin="round"/><path d="M-3 -10 v16 M3 -8 v16" stroke="${C.woodInk}" stroke-width="1.6"/>`)}<span>See whole map</span></button>
        ${returning() || unplaced().length ? `<button class="pm-ctl pm-jump" id="pmJump" aria-haspopup="dialog">${icons.places}Places</button>` : ''}
      </div>
      <div class="pm-zoom" role="group" aria-label="Zoom">
        <button class="pm-ctl pm-zb" id="pmIn" aria-label="Zoom in">${ic('-12 -12 24 24', `<path d="M-7 0 H7 M0 -7 V7" stroke="${C.woodInk}" stroke-width="3.4" stroke-linecap="round"/>`)}</button>
        <button class="pm-ctl pm-zb" id="pmOut" aria-label="Zoom out">${ic('-12 -12 24 24', `<path d="M-7 0 H7" stroke="${C.woodInk}" stroke-width="3.4" stroke-linecap="round"/>`)}</button>
      </div>
    </div>`);
    // the signs: measured once at their opening size, and kept inside the part of the drawing the map opens on (as the screen showed them before)
    compact = null;
    signs = ui.$$('.pm-at').map(el => ({ el, inner: el.firstElementChild, x: +el.dataset.x, y: +el.dataset.y, hw: el.firstElementChild.offsetWidth / 2 }));
    if (R.wide && at) ui.$('#pmBubble').innerHTML = bubbleSVG(at, bonnieLine); // now her sign's size is known (wideX)
    if (!R.wide) signs.forEach(g => { const half = g.hw / view.k, lo = view.vx0 + 6 / view.k + half, hi = view.vx0 + view.vw - 6 / view.k - half; g.x = Math.max(lo, Math.min(hi, g.x)); });
    cam = window.MapCamera.create({
      viewport: ui.$('#pmView'), world: ui.$('#pmStage'), size: { w: WORLD_W, h: WORLD_H }, base: view.k, fit: R.fit,
      maxZoom: view.k * 2.4, floor: Math.min(view.k, innerWidth / WORLD_W) * .3, reduce, insets,
      onChange: c => { placeSigns(c); placeBack(c); },
      onSettle: c => { camMem[camKey()] = c.state(); },
      // a finger moving the map lets go of any place it pressed
      onGesture: () => { ui.$$('.pm-sign.pressed').forEach(s => s.classList.remove('pressed')); ui.$$('.pm-hit[data-w]:not(.chosen)').forEach(b => lightUp(b.dataset.w, false)); },
      isTarget: el => !!(el && el.closest && el.closest('[data-w], button, a')),
    });
    // the camera moves the map, never the browser: focusing a place (VoiceOver, a keyboard) would otherwise scroll the
    // frame to it (the land beyond the picture makes it bigger than the screen), and the map would then be off by that much
    ui.$('#pmView').addEventListener('scroll', e => { const v = e.currentTarget; if (v.scrollTop || v.scrollLeft) { v.scrollTop = 0; v.scrollLeft = 0; } });
    const mem = camMem[camKey()];
    if (mem) cam.restore(mem); else bonnieView(false);
    // the land beyond the picture: built straight away if the map opens zoomed out past the picture's edges, otherwise
    // just after the map is on the screen (it's only seen zoomed right out, and building it first slowed opening the map)
    const vpEl = ui.$('#pmView'), cover = Math.max(vpEl.clientWidth / WORLD_W, vpEl.clientHeight / WORLD_H), cam0 = cam;
    if (cam.zoom < cover * .999) { makeBack(theme); placeBack(cam); }
    else setTimeout(() => { if (cam === cam0 && on) { makeBack(theme); placeBack(cam); } }, 150);
    // the Bonnie button sits at her feet and moves with her: it's placed first among the places for VoiceOver
    const bb = document.getElementById('pmBonnieBtn'); if (bb) bb.parentNode.insertBefore(bb, bb.parentNode.querySelector('.pm-hit:not(.bonnie-hit)'));
    ui.$$('.pm-hit[data-w], .pm-sign[data-w]').forEach(b => {
      const id = b.dataset.w, hit = b.matches('.pm-hit') ? b : ui.$(`.pm-hit[data-w="${id}"]`);
      b.addEventListener('pointerdown', () => { if (busy) return; lightUp(id, true); const sg = document.getElementById('pmSign-' + id); if (sg) sg.classList.add('pressed'); ui.tone && ui.tone(620, .06, 'sine', .07); });
      const up = () => { const sg = document.getElementById('pmSign-' + id); if (sg) sg.classList.remove('pressed'); if (!hit.classList.contains('chosen')) lightUp(id, hit.matches(':focus-visible')); };
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, up));
      if (b === hit) {
        b.addEventListener('focus', () => { lightUp(id, b.matches(':focus-visible')); const [x, y, ww, hh] = PLACES[id].hit; cam.show(x, y, ww, hh); });
        b.addEventListener('blur', () => { if (!b.classList.contains('chosen')) lightUp(id, false); });
        b.onclick = () => choose(id, b);
      } else b.onclick = () => choose(id, hit); // a sign is part of its place
    });
    if (bb) { bb.onclick = () => choose(at.id, bb, true); bb.addEventListener('focus', () => cam.show(bfx - 60, bfy - 90, 120, 100)); }
    ui.$('#pmGrown').onclick = () => M.openGrownUps(); // the sum over the map, then the grown-ups page
    ui.$('#pmBones').onclick = () => { leave(); M.shop({ welcome: true }); };
    if (shopTip) M.tips.at('shop', ui.$('#pmBones')); // the ring (once per player: the save remembers it)
    if (ui.$('#pmJump')) ui.$('#pmJump').onclick = openPlaces;
    ui.$('#pmWhole').onclick = () => { if (cam.isWhole()) bonnieView(true); else cam.fitAll(true); };
    ui.$('#pmIn').onclick = () => cam.zoomBy(1.6); ui.$('#pmOut').onclick = () => cam.zoomBy(1 / 1.6);
    setTimeout(() => { if (on && !busy) ui.say(bonnieLine); }, 350);
  }
  function lightUp(id, v) { const sg = document.getElementById('pmSign-' + id), h = document.getElementById('pmHalo-' + id); if (sg) sg.classList.toggle('lit', v); if (h) h.classList.toggle('lit', v); }
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
      const hit = ui.$(`.pm-hit[data-w="${b.dataset.w}"]`), w = M.world(b.dataset.w);
      if (hit && cam) { const [x, y] = mid(w); cam.centreOn(x, y, Math.max(cam.zoom, view.k)); setTimeout(() => choose(b.dataset.w, hit), reduce() ? 0 : 450); }
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
    const line = p ? SAYS(id)[1] || LL.offWeGo : LL.offWeGo;
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
  function leave() { on = false; busy = false; if (cam) { camMem[camKey()] = cam.state(); cam.destroy(); cam = null; } document.body.classList.remove('pm-on'); const sh = document.querySelector('.pm-sheet-bg'); if (sh) sh.remove(); }

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
    // ws: the worlds drawn on the map (a new world with no drawing yet waits under "More worlds")
    const all = M.visibleWorlds(R.subject), ws = placed(), hits = ui.$$('.pm-hit[data-w]');
    ok('the meadow is showing', !!ui.$('.pm'));
    ok(`every ${R.title} world has a place (or is in "Places")`, hits.length + unplaced().length === all.length && (!unplaced().length || !!ui.$('#pmJump')), `${hits.length} places and ${unplaced().length} more for ${all.length} worlds`);
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
    // (a wide world shows only part of itself at first: there, Bonnie's place's sign must be on the screen)
    ok('signs are on the screen and do not overlap each other', (R.wide ? [document.getElementById('pmSign-' + at.id)] : signs).every(s => r(s).left >= 0 && r(s).right <= innerWidth) && !signs.some((a, i) => signs.some((b, j) => j > i && cross(r(a), r(b)))),
      signs.map(s => [r(s).left, r(s).right].map(Math.round).join('..')).join(' '));
    const bub = r(document.getElementById('pmBubble'));
    ok("Bonnie's bubble covers no sign", !signs.some(s => cross(r(s), bub)), signs.filter(s => cross(r(s), bub)).map(s => s.id).join(', '));
    ok("…and is all on the screen, not cut off at its edge", bub.left >= 0 && bub.right <= innerWidth + .5, `${Math.round(bub.left)}..${Math.round(bub.right)} of ${innerWidth}`);
    { // and wherever she hops to, with her longest line there
      const bubEl = document.getElementById('pmBubble'), keep = bubEl.innerHTML, bad = [];
      ws.forEach(w => { bubEl.innerHTML = bubbleSVG(w, SAYS(w.id)[0].length > 30 ? SAYS(w.id)[0] : LL.startAt(shortName(w))); const br = r(bubEl); signs.forEach(s => { if (cross(r(s), br)) { const a = r(s); bad.push(short(w.id) + '→' + short(s.id.replace('pmSign-', '')) + ` (bubble ${[br.left, br.top, br.right, br.bottom].map(Math.round)} sign ${[a.left, a.top, a.right, a.bottom].map(Math.round)})`); } }); });
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
    hits[0].dispatchEvent(new PointerEvent('pointerleave', { bubbles: true })); dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); await wait(30);
    ok('…and letting go puts it back', !sg0.classList.contains('pressed') && !sg0.classList.contains('lit'));
    // the camera (js/map-camera.js): pinch, drag, double-tap, the zoom buttons and "See whole map"
    {
      const vp = ui.$('#pmView'), st = ui.$('#pmStage'), still = ms => wait(reduce() ? 30 : ms);
      const covers = () => { const a = r(st); return a.left <= .5 && a.top <= .5 && a.right >= innerWidth - .5 && a.bottom >= innerHeight - .5; };
      const edges = () => { const a = r(st); return [a.left, a.top, innerWidth - a.right, innerHeight - a.bottom].map(Math.round).join(','); };
      const ev = (type, id, x, y, target = window) => target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: id, clientX: x, clientY: y, pointerType: 'touch', isPrimary: id === 1, button: 0 }));
      const drag = async (dx, dy, from) => { const v = r(from || vp), x = v.left + v.width / 2, y = v.top + Math.min(v.height / 2, innerHeight / 2);
        ev('pointerdown', 1, x, y, from || vp); for (let i = 1; i <= 6; i++) ev('pointermove', 1, x + dx * i / 6, y + dy * i / 6); ev('pointerup', 1, x + dx, y + dy); await wait(40); };
      const atPoint = (x, y) => { const el = document.elementFromPoint(x, y); return el && el.closest('[data-w], .bonnie-hit'); };
      // each place still takes a tap at its middle (its own button or its sign, never another place's)
      const tappable = () => ws.filter(w => { const b = r(ui.$(`.pm-hit[data-w="${w.id}"]`)), x = b.left + b.width / 2, y = b.top + b.height / 2;
        if (y < 0 || y > innerHeight || x < 0 || x > innerWidth) return false; /* off the screen: nothing to tap */ const el = atPoint(x, y); return !el || (el.dataset.w && el.dataset.w !== w.id); }).map(w => short(w.id));
      bonnieView(false); await wait(30);
      ok('the page never scrolls: the map moves inside its own viewport, the only place a pinch zooms', document.documentElement.scrollHeight <= innerHeight + 1 && getComputedStyle(vp).touchAction === 'none' && getComputedStyle(document.body).touchAction !== 'none', `${document.documentElement.scrollHeight} for ${innerHeight}`);
      ok('at the opening zoom the drawing fills the screen, with no blank edges', covers(), edges());
      ok('it opens on Bonnie\'s place, which is on the screen', (() => { const b = r(ui.$('#pmBonnieBtn') || ui.$('.pm-hit')); return b.top >= 0 && b.bottom <= innerHeight; })());
      const bad = []; for (const [dx, dy] of [[4000, 0], [-4000, 0], [0, 4000], [0, -4000], [3000, 3000], [-3000, -3000]]) { await drag(dx, dy); if (!covers()) bad.push(`${dx},${dy}: ${edges()}`); }
      ok('dragging as far as possible every way stops at the drawing\'s edges (no blank space)', !bad.length, bad.join(' | '));
      bonnieView(false); await wait(30);
      const z0 = cam.zoom, mx = innerWidth / 2, my = innerHeight / 2;
      ev('pointerdown', 1, mx - 30, my, vp); ev('pointerdown', 2, mx + 30, my, vp);
      for (let i = 1; i <= 5; i++) { ev('pointermove', 1, mx - 30 - 20 * i, my); ev('pointermove', 2, mx + 30 + 20 * i, my); }
      ev('pointerup', 1, mx - 130, my); ev('pointerup', 2, mx + 130, my); await still(650);
      ok('pinching apart zooms in, and the drawing still fills the screen', cam.zoom > z0 * 1.5 && covers(), `${z0.toFixed(2)} to ${cam.zoom.toFixed(2)}`);
      ok('…and every place on the screen takes a tap at its middle', !tappable().length, tappable().join(', '));
      ev('pointerdown', 1, mx - 150, my, vp); ev('pointerdown', 2, mx + 150, my, vp);
      for (let i = 1; i <= 5; i++) { ev('pointermove', 1, mx - 150 + 29 * i, my); ev('pointermove', 2, mx + 150 - 29 * i, my); }
      ev('pointerup', 1, mx - 5, my); ev('pointerup', 2, mx + 5, my); await still(650);
      ok('pinching together zooms out, no further than the whole map', Math.abs(cam.zoom - cam.zMin()) < .01, `${cam.zoom.toFixed(3)} (smallest ${cam.zMin().toFixed(3)})`);
      bonnieView(false); await wait(30);
      // a drag that starts on a place moves the map and doesn't open the place
      const h0 = ws.map(w => ui.$(`.pm-hit[data-w="${w.id}"]`)).find(b => r(b).top > innerHeight * .3 && r(b).top < innerHeight * .7) || ui.$('.pm-hit[data-w]');
      const y0 = cam.y, dy0 = cam.y + WORLD_H * cam.zoom - innerHeight > 100 ? -90 : 90; await drag(0, dy0, h0); h0.click(); await wait(60);
      ok('a drag that starts on a place moves the map, and never opens the place', Math.abs(cam.y - y0) > 40 && !busy && !!ui.$('.pm'), `moved ${Math.round(cam.y - y0)}px`);
      // "See whole map", then "Back to Bonnie"
      ui.$('#pmWhole').click(); await still(800);
      const a = r(st), ins = insets(), inRoom = ws.every(w => { const b = r(ui.$(`.pm-hit[data-w="${w.id}"]`)); return b.left >= -1 && b.right <= innerWidth + 1 && b.top >= ins.top - 1 && b.bottom <= innerHeight - ins.bottom + 1; });
      ok('"See whole map" shows every place at once, between the top bar and the buttons', cam.isWhole() && (inRoom || cam.zoom > cam.zFit() * 1.001 || cam.zMin() > Math.min(innerWidth / WORLD_W, (innerHeight - ins.top - ins.bottom) / WORLD_H) * 1.001), `zoom ${cam.zoom.toFixed(2)}`);
      ok('…in the middle of the screen', Math.abs(a.left - (innerWidth - a.right)) < 2 || (a.left <= .5 && a.right >= innerWidth - .5), edges());
      if (R.wide && innerWidth < innerHeight) ok('…with the meadow all the way to the screen\'s edges (no border round a smaller picture)', covers(), edges());
      ok('…where every place still takes a tap', !tappable().length, tappable().join(', '));
      ok('…the zoom-out button says it can go no further, and the button now says "Back to Bonnie"', ui.$('#pmOut').getAttribute('aria-disabled') === 'true' && ui.$('#pmWhole').textContent.trim() === 'Back to Bonnie');
      ui.$('#pmWhole').click(); await still(650);
      ok('"Back to Bonnie" goes back to the opening zoom, on her place', Math.abs(cam.zoom - view.k) < .01 && covers());
      ui.$('#pmIn').click(); await still(750); const zi = cam.zoom; ui.$('#pmOut').click(); await still(750);
      ok('the + and − buttons zoom in and out (for a child who can\'t pinch)', zi > view.k * 1.3 && Math.abs(cam.zoom - view.k) < .02, `${view.k.toFixed(2)} → ${zi.toFixed(2)} → ${cam.zoom.toFixed(2)}`);
      // a double-tap on the meadow itself (not a place) zooms in there
      let spot = null; for (let y = innerHeight * .3; y < innerHeight * .8 && !spot; y += 23) for (let x = 20; x < innerWidth - 20 && !spot; x += 23) { const el = document.elementFromPoint(x, y); if (el && st.contains(el) && !el.closest('[data-w], button')) spot = [x, y, el]; }
      if (spot) { const zb = cam.zoom; for (let i = 0; i < 2; i++) { ev('pointerdown', 1, spot[0], spot[1], spot[2]); ev('pointerup', 1, spot[0], spot[1], spot[2]); await wait(60); } await still(750);
        ok('a double-tap on the meadow zooms in there', cam.zoom > zb * 1.5, `${zb.toFixed(2)} → ${cam.zoom.toFixed(2)}`); }
      // VoiceOver (or a keyboard) moving to a place off the screen brings it into view
      bonnieView(false); await wait(30);
      const far = ws.map(w => ui.$(`.pm-hit[data-w="${w.id}"]`)).sort((p, q) => Math.abs(r(q).top - innerHeight / 2) - Math.abs(r(p).top - innerHeight / 2))[0]; far.focus(); await still(800);
      ok('moving to a place with VoiceOver or a keyboard brings it into view', r(far).top < innerHeight && r(far).bottom > 0, `top ${Math.round(r(far).top)}`);
      far.blur();
      // drawn again (a turn of the iPad, back from a level or the shop): the map is where it was
      const before = cam.state(); draw(); await wait(30); const after = cam.state();
      ok('drawn again, the map stays where it was', Math.abs(before.cx - after.cx) < 2 && Math.abs(before.cy - after.cy) < 2 && Math.abs(before.zr - after.zr) < .01);
      bonnieView(false); await wait(30);
    }
    // Places
    const jump = ui.$('#pmJump');
    ok('"Places" shows for a returning player, not a new one', !!jump === returning(), returning() ? 'returning' : 'new player');
    if (jump) {
      jump.click(); await wait(80);
      const sheet = ui.$('.pm-sheet');
      ok('"Places" lists every world, with its progress, and starts on Bonnie\'s', !!sheet && sheet.querySelectorAll('[data-w]').length === all.length && document.activeElement && document.activeElement.closest('.pm-sheet') && sheet.contains(document.activeElement));
      sheet.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await wait(50);
      ok('Escape closes it and goes back to the Places button', !ui.$('.pm-sheet') && document.activeElement === ui.$('#pmJump'));
    }
    // tap the second place: the engine's own level map opens, with its locks
    const second = ui.$$('.pm-hit[data-w]')[1]; second.click(); await wait(1700);
    const back = ui.$('#back');
    ok('a place opens the real level map', !!back && !!ui.$('.stone'), back ? back.textContent : 'no map');
    ok('…where the map\'s pinch and drag are gone (the page scrolls and taps as usual)', !ui.$('#pmView') && getComputedStyle(document.documentElement).overflowY !== 'hidden' && getComputedStyle(document.body).overflowY !== 'hidden');
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
