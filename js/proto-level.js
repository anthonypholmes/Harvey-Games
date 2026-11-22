/* Level maps PROTOTYPE (22 November 2026): a world's levels as stepping stones (not part of the game yet).
 *
 * When the engine draws a world's level map (Meadow.worldMap, a list of "stone" buttons), this shows the world as
 * a place instead: the world's own scenery at the top (the same drawing as on the meadow map), then a trail of
 * stepping stones, one per level, in the design sheet's four states (done with its stars, new with a flag, the
 * one to play next with a gold ring, locked with ivy and a padlock). Each stone has a wooden tag with its level
 * number, name and stars, and its whole row is one tap.
 *
 * Nothing in the engine changes. The engine's own list is still drawn, only hidden; tapping a stone presses the
 * engine's own button for that level, so unlocking, the locked line, the "full game" box and starting a level
 * are exactly the engine's. Each stone's VoiceOver name is the engine's own.
 *
 * Loaded by prototype-maths-map.html and prototype-words-map.html after js/proto-map.js.
 *   leveltest=1   run the level-map checks and print the results on the page
 *   level=arrays  open that world's level map straight away (also with view=old)
 */
(function () {
  const Q = new URLSearchParams(location.search);
  // level=<world> (e.g. level=arrays) opens that world's level map straight away, old or new (for screenshots)
  if (Q.get('level')) setTimeout(() => {
    const id = Q.get('level'), subj = window.PROTO_ROUTE === 'words' ? 'english' : 'maths';
    const w = window.Meadow.visibleWorlds(subj).find(x => x.id === id || x.id.endsWith('-' + id));
    if (w) window.Meadow.worldMap(w.id);
  }, 700);
  if (Q.get('view') === 'old') return;
  if (window.MeadowLook && !window.MeadowLook.on) return; // the old look (js/meadow-look.js)
  const A = window.ProtoArt, M = window.Meadow, ui = M.ui, C = A.C, P = A.places;
  const reduce = () => ui.reduceMotion();
  const W = 640, PHONE_X = 125, PHONE_W = 390, HEAD_H = 270, ROW = 150, TOP = 92;
  const SUBJECT = window.PROTO_ROUTE === 'words' ? 'english' : 'maths';

  /* Each world: its place at the top of the map, and how the stones cross the ground below it.
     ground: 'path' (a meadow trail), 'river' (stones in a stream) or 'sea' (rocks in the sea). trees: the border trees. */
  const LOOK = {
    'y2-maths-partitioning': { head: s => P.park(s, 320, 150), ground: 'path', trees: 'round' },
    'y2-maths-number-bonds': { head: s => P.burrow(s, 320, 140), ground: 'path', trees: 'round' },
    'y2-maths-number-lines': { head: s => { A.river(s, 'M-20 178 C140 150 260 196 380 170 S560 150 680 176', 34); P.riverStones(s, 320, 170); }, ground: 'river', trees: 'round' },
    'y2-maths-arrays': { head: s => P.orchard(s, 320, 112), ground: 'path', trees: 'apple' },
    'y2-maths-sharing': { head: s => P.pond(s, 320, 132), ground: 'river', trees: 'round' },
    'y2-maths-captains-cove': { head: s => P.cove(s, 320, 122), ground: 'sea', trees: null },
    'y2-english-phonics': { head: s => P.forest(s, 320, 150), ground: 'path', trees: 'pine' },
    'y2-english-tricky-words': { head: s => { A.river(s, 'M-20 150 C120 168 200 178 250 174 S520 150 680 162', 24); P.trickyTrail(s, 330, 112); }, ground: 'path', trees: 'round' },
    'y2-english-sentences': { head: s => P.sentenceMeadow(s, 320, 160), ground: 'path', trees: 'round' },
    'y2-english-stories': { head: s => P.storyNook(s, 320, 228), ground: 'path', trees: 'blossom' },
  };
  const look = id => LOOK[id] || { head: () => {}, ground: 'path', trees: 'round' };
  const stonePos = i => [i % 2 ? 410 : 230, TOP + i * ROW];
  const bonnieX = i => stonePos(i)[0] + (i % 2 ? 68 : -72); // beside her stone, on the side away from its tag
  const stageH = n => TOP + (n - 1) * ROW + 120;

  let on = false, busy = false, wid = null, view = null, cur = -1, back = null;
  const scenes = {}; // drawn once per world

  /* ---------- the drawings ---------- */
  function headScene(id) {
    const s = new A.Scene(W, HEAD_H), L = look(id);
    A.meadowFloor(s, 31);
    if (L.ground !== 'sea') A.path(s, `M320 ${HEAD_H - 40} C320 ${HEAD_H - 20} 300 ${HEAD_H} 300 ${HEAD_H + 20}`, 30);
    L.head(s);
    [[40, 120], [600, 110], [80, 250], [570, 250]].forEach(([x, y], i) => { if (L.trees) A.tree(s, x, y, .9, L.trees === 'apple' ? 'apple' : L.trees, 300 + i); });
    return s.render();
  }
  function trailD(n) {
    let d = `M300 -20 C300 ${TOP / 2} ${stonePos(0)[0]} ${TOP / 2} ${stonePos(0)[0]} ${TOP}`;
    for (let i = 1; i < n; i++) { const [x0, y0] = stonePos(i - 1), [x1, y1] = stonePos(i); d += ` C${x0} ${y0 + ROW / 2} ${x1} ${y1 - ROW / 2} ${x1} ${y1}`; }
    const [xl, yl] = stonePos(n - 1); return d + ` C${xl} ${yl + 60} 320 ${yl + 80} 320 ${yl + 140}`;
  }
  function stageScene(id, n) {
    const H = stageH(n), s = new A.Scene(W, H), L = look(id), r = A.rng(id.length * 97);
    if (L.ground === 'sea') {
      s.g(`<rect width="${W}" height="${H}" fill="#4E9FC9"/>`);
      for (let i = 0; i < 18; i++) s.g(`<path d="M${(r() * W).toFixed(0)} ${(r() * H).toFixed(0)} q14 -6 28 0" stroke="#BFE3F5" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`);
      [[36, 0.2], [610, 0.45], [30, 0.75], [612, 0.95]].forEach(([x, f]) => { const y = H * f; s.g(`<ellipse cx="${x}" cy="${y}" rx="50" ry="24" fill="${C.sandDk}"/><ellipse cx="${x}" cy="${y - 3}" rx="45" ry="21" fill="${C.sand}"/>`); });
      // the boat route from rock to rock, so the order is clear without a path
      s.g(`<path d="${trailD(n)}" fill="none" stroke="#E6F5FC" stroke-width="5" stroke-dasharray="1 15" stroke-linecap="round" opacity=".95"/>`);
    } else {
      A.meadowFloor(s, id.length * 13);
      if (L.ground === 'river') A.river(s, trailD(n), 46); else A.path(s, trailD(n), 30);
      // border trees down both sides (seen whole on an iPad, their edges on a phone)
      for (let y = 40; y < H; y += 130) {
        [[r() * 70 + 20, 0], [W - r() * 70 - 20, 1]].forEach(([x], j) => {
          const kind = L.trees === 'apple' ? 'apple' : L.trees === 'blossom' ? (j ? 'blossom' : 'round') : L.trees === 'pine' ? (r() > .4 ? 'pine' : 'round') : (r() > .7 ? 'pine' : 'round');
          A.tree(s, x, y + r() * 40, .8 + r() * .3, kind, Math.floor(r() * 1e5));
          if (L.trees === 'pine' && kind === 'pine') s.add(y + 41, `<g>${A.letterBadge(x, y + r() * 4 - 4, ['a', 'e', 'i', 'o', 'u', 'sh', 'th'][Math.floor(r() * 7)])}</g>`);
        });
      }
      A.scatter(s, id.length * 7, Math.round(H / 14), [0, 0, W, H], Array.from({ length: n }, (_, i) => { const [x, y] = stonePos(i); return [x - 70, y - 40, 140, 80]; }));
    }
    // scenery stays quieter than the trail: a soft wash over the sides
    const edge = L.ground === 'sea' ? '#4E9FC9' : C.meadow;
    s.g(`<defs><linearGradient id="plEdge${id.length}" x1="0" x2="1"><stop offset="0" stop-color="${edge}" stop-opacity=".45"/><stop offset=".26" stop-color="${edge}" stop-opacity="0"/><stop offset=".74" stop-color="${edge}" stop-opacity="0"/><stop offset="1" stop-color="${edge}" stop-opacity=".45"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#plEdge${id.length})" pointer-events="none"/>`);
    return s.render();
  }
  // the trail behind you: paw prints (dots in water) between levels already played
  function trodden(rows, ground) {
    let o = '';
    for (let i = 1; i < rows.length; i++) {
      if (rows[i - 1].st !== 'done' || rows[i].st === 'locked' || rows[i].st === 'paid') continue;
      const [x0, y0] = stonePos(i - 1), [x1, y1] = stonePos(i), c1 = [x0, y0 + ROW / 2], c2 = [x1, y1 - ROW / 2];
      [.34, .5, .66].forEach(t => {
        const u = 1 - t, x = u * u * u * x0 + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * x1, y = u * u * u * y0 + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * y1;
        o += ground === 'path' ? A.paw(x, y, .62, C.woodDk, .55) : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="${C.gold}" opacity=".9"/>`;
      });
    }
    return `<g class="pl-trodden">${o}</g>`;
  }
  // a stepping stone, in the design sheet's states (centre x, y)
  function stoneSVG(x, y, st, n, stars, next) {
    const k = 1.15, rx = 46 * k, ry = 22 * k, sh = `<ellipse cx="${x}" cy="${y + 14 * k}" rx="${rx}" ry="${16 * k}" fill="#4A3B2C" opacity=".14"/>`;
    const num = (fill, dx = 0) => `<text x="${x + dx}" y="${y + 9}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="27" fill="${fill}">${n}</text>`;
    const body = (dk, lt) => `<ellipse cx="${x}" cy="${y + 6 * k}" rx="${rx}" ry="${ry}" fill="${dk}"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${lt}"/>`;
    const lock = (gold) => `<g transform="translate(${x + 30} ${y - 4})"><path d="M-6 0 v-5 a6 6 0 0 1 12 0 v5" stroke="${gold ? C.goldDk : '#6B655A'}" stroke-width="3" fill="none"/><rect x="-9" y="0" width="18" height="14" rx="3" fill="${gold ? C.gold : '#8B8478'}"/><circle cx="0" cy="6" r="2" fill="#4F4A42"/></g>`;
    // locked and full-game levels look the same everywhere: a grey stone, ivy, the number moved left, a padlock on
    // the right (gold for the full game, the only difference), no stars, no flag
    if (st === 'locked' || st === 'paid') return `<g class="pl-stone" data-st="${st}">${sh}${body('#A8A296', '#D3CEC4')}
      <path d="M${x - 40} ${y - 10} q12 -10 24 -6 q10 4 20 -4" stroke="${C.leafDk}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>
      ${[[-34, -14], [-18, -14], [-2, -16]].map(([a, b]) => `<ellipse cx="${x + a}" cy="${y + b}" rx="5" ry="3" fill="${C.leaf}" transform="rotate(-30 ${x + a} ${y + b})"/>`).join('')}
      ${num('#4F4A42', -8)}${lock(st === 'paid')}</g>`;
    const ring = next ? `<ellipse cx="${x}" cy="${y + 6}" rx="${rx + 22}" ry="${ry + 18}" fill="${C.gold}" opacity=".28"/><ellipse class="pl-ring" cx="${x}" cy="${y}" rx="${rx + 9}" ry="${ry + 8}" fill="none" stroke="${C.gold}" stroke-width="4.5" stroke-dasharray="2 9" stroke-linecap="round"/>` : '';
    if (st === 'done') return `<g class="pl-stone" data-st="done"${next ? ' data-next="1"' : ''}>${sh}${ring}${body(C.stoneDk, '#EFE3CC')}${num(C.ink)}
      ${[-1, 0, 1].map(j => A.star(x + j * 25, y - ry - 8 + Math.abs(j) * 4, j ? 9 : 11, stars >= j + 2)).join('')}
      ${A.paw(x + 38, y + 4, .8, C.leafDk, .85)}</g>`;
    const flag = st === 'new' ? `<g transform="translate(${x + 30} ${y - 52})"><rect x="-1.5" y="0" width="3" height="42" rx="1.5" fill="${C.woodDk}"/><path d="M1.5 1 L34 9 L1.5 18 Z" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1.4" stroke-linejoin="round"/><text x="5" y="12.5" font-family="Fredoka" font-weight="700" font-size="8" fill="${C.woodInk}">NEW</text></g>` : '';
    return `<g class="pl-stone" data-st="${st}"${next ? ' data-next="1"' : ''}>${sh}${ring}${body(C.stoneDk, '#FFF6E2')}${num(C.ink)}${next ? '' : flag}</g>`;
  }

  /* ---------- the engine's level list, read (never changed) ---------- */
  function readEngine(w) {
    return ui.$$('#screen .card.map .stone').map((b, i) => {
      const L = w.levels[i], stars = M.stars(w.id, L.id), played = !!b.querySelector('.ls');
      const st = b.classList.contains('paid') ? 'paid' : b.classList.contains('locked') ? 'locked' : played ? 'done' : 'new';
      return { b, i, L, stars, played, st, label: b.getAttribute('aria-label'), disabled: b.getAttribute('aria-disabled') };
    });
  }
  // the level to play next, where Bonnie waits: the first new level; else the one played last here (unless it has
  // 3 stars); else the first without 3 stars; else the last open one
  function current(w, rows) {
    const open = rows.filter(r => r.st === 'new' || r.st === 'done');
    if (!open.length) return -1;
    const starts = (M.save.get() || M.save.load()).levelStarts || [];
    const last = [...starts].reverse().find(x => x.key.startsWith(w.id + '/'));
    const li = last ? open.find(r => w.id + '/' + r.L.id === last.key && r.stars < 3) : null;
    return (open.find(r => r.st === 'new') || li || open.find(r => r.stars < 3) || open[open.length - 1]).i;
  }

  /* ---------- the screen ---------- */
  const icons = {
    star: on => `<svg viewBox="-10 -10 20 20" aria-hidden="true">${A.star(0, 0, 9, on)}</svg>`,
    flag: `<svg viewBox="-10 -10 20 20" aria-hidden="true"><path d="M-5 -9 v18" stroke="${C.woodDk}" stroke-width="2"/><path d="M-4 -9 l12 4 l-12 4 z" fill="${C.berry}" stroke="#A93E4F" stroke-width="1"/></svg>`,
    lock: gold => `<svg viewBox="-8 -9 16 18" aria-hidden="true"><path d="M-4.5 0 v-4 a4.5 4.5 0 0 1 9 0 v4" stroke="${gold ? C.goldDk : '#6B655A'}" stroke-width="2.2" fill="none"/><rect x="-6.5" y="-.5" width="13" height="10" rx="2" fill="${gold ? C.gold : '#8B8478'}"/></svg>`,
  };
  const CSS = `
  .pl-on #screen>.card.map,.pl-on .hud,.pl-on .butterfly,.pl-on .frog,.pl-on .meadow{display:none!important}
  .pl-on #app{max-width:none;padding:0;min-height:0}
  .pl-on{background:${C.meadow}!important}
  .pl{position:relative;margin:0 auto}
  .pl-head{position:relative;overflow:hidden}
  .pl-head>svg,.pl-stage>svg{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
  .pl-name{position:absolute;z-index:4;left:50%;bottom:10px;transform:translateX(-50%);display:grid;justify-items:center;gap:5px;width:max-content;max-width:min(94%,400px);
    padding:9px 20px 10px;border-radius:14px;background:${C.woodLt};border:3px solid ${C.woodDk};box-shadow:0 5px 0 ${C.woodDk},0 8px 18px rgba(60,40,20,.28);color:${C.woodInk};text-align:center}
  .pl-name h2{margin:0;font:700 max(26px,calc(26px * var(--k,1)))/1.08 Fredoka,system-ui,sans-serif}
  .pl-chip{display:inline-flex;align-items:center;gap:5px;padding:2px 10px 3px 6px;border-radius:999px;background:${C.paper};font:700 16px/1.15 Fredoka,system-ui,sans-serif;color:${C.ink}}
  .pl-chip svg{width:20px;height:20px;flex:none}
  .pl-intro{position:relative;z-index:2;margin:12px auto 4px;width:min(92%,520px);padding:12px 16px;border-radius:14px;background:${C.paper};border:2px solid #E2D3B4;box-shadow:0 3px 0 #D9C7A6;
    font:400 17px/1.45 Andika,system-ui,sans-serif;color:${C.ink}}
  .pl-intro b{font-weight:700}
  .pl-stage{position:relative;overflow:hidden}
  .pl-hit{position:absolute;z-index:3;border:0;margin:0;padding:0;background:transparent;border-radius:24px;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
  .pl-hit:focus-visible{outline:4px solid ${C.goldDk};outline-offset:-6px}
  .pl-tag{position:absolute;z-index:4;pointer-events:none;transform:translateY(-50%);display:grid;justify-items:start;gap:3px;width:max-content;max-width:calc(178px * var(--k,1));
    padding:6px 12px 8px;border-radius:10px;background:${C.woodLt};border:2px solid ${C.woodDk};box-shadow:0 4px 0 ${C.woodDk};color:${C.woodInk};transition:transform .12s}
  .pl-tag.r{justify-items:end;text-align:right}
  .pl-tag small{font:600 16px/1.1 Fredoka,system-ui,sans-serif;opacity:.85}
  .pl-tag b{font:700 max(19px,calc(19px * var(--k,1)))/1.08 Fredoka,system-ui,sans-serif}
  .pl-tag.locked,.pl-tag.paid{background:#E6DFD2;border-color:#9C927F;box-shadow:0 4px 0 #9C927F;color:#4F4A42}
  .pl-tag.locked small,.pl-tag.paid small{opacity:1}
  .pl-tag.locked .pl-chip,.pl-tag.paid .pl-chip{background:#F4F0E8;color:#4F4A42}
  .pl-tag.next{border-color:${C.goldDk};box-shadow:0 4px 0 ${C.goldDk},0 0 0 4px rgba(242,193,78,.6);padding-top:14px}
  .pl-next{position:absolute;top:-13px;left:10px;display:inline-flex;align-items:center;gap:3px;padding:2px 10px 3px 7px;border-radius:999px;background:${C.gold};border:2px solid ${C.goldDk};
    font:700 16px/1.1 Fredoka,system-ui,sans-serif;color:${C.woodInk};white-space:nowrap}
  .pl-tag.r .pl-next{left:auto;right:10px}
  .pl-next svg{width:12px;height:12px}
  .pl-tag.pressed{transform:translateY(calc(-50% + 3px));box-shadow:0 1px 0 ${C.woodDk}}
  .pl-tag.lit{border-color:${C.goldDk};box-shadow:0 4px 0 ${C.goldDk},0 0 0 4px rgba(242,193,78,.55)}
  .pl-tag.bad{animation:plShake .45s}
  @keyframes plShake{20%{margin-left:-6px}40%{margin-left:6px}60%{margin-left:-4px}80%{margin-left:4px}}
  .pl-halo{opacity:0;transition:opacity .15s}.pl-halo.lit{opacity:1}
  .pl-ring{animation:plRing 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 50%}
  @keyframes plRing{50%{transform:scale(1.06);opacity:.6}}
  #plBonnie{transition:transform .7s cubic-bezier(.45,.05,.3,1)}
  #plBonnie.hop>g{animation:plHop .36s ease-in-out 2}
  #plBonnie .eyes{transform-box:fill-box;transform-origin:50% 50%;animation:blink 5s infinite}
  #plBonnie .tail{transform-box:fill-box;transform-origin:0% 100%;animation:wag 1.4s ease-in-out infinite}
  @keyframes plHop{50%{transform:translateY(-16px)}}
  @media (prefers-reduced-motion:reduce){#plBonnie,.pl-tag,.pl-halo{transition:none}#plBonnie>g,#plBonnie .eyes,#plBonnie .tail,.pl-ring,.pl-tag.bad{animation:none!important}.pl-tag.pressed{transform:translateY(-50%)}}
  .pl-end{height:40px}`;

  function layout() {
    const Wd = Math.min(document.documentElement.clientWidth || innerWidth, 900);
    view = Wd < 600 ? { x0: PHONE_X, w: PHONE_W } : { x0: 0, w: W };
    view.W = Wd; view.k = Wd / view.w;
  }
  const px = (x, y) => [(x - view.x0) * view.k, y * view.k];

  function draw() {
    const w = M.world(wid); if (!w) return;
    on = true; busy = false; layout();
    document.body.classList.add('pl-on');
    const rows = readEngine(w), n = rows.length, H = stageH(n), theme = document.body.dataset.theme || 'day';
    if (!scenes[w.id]) scenes[w.id] = { head: headScene(w.id), stage: stageScene(w.id, n) };
    cur = current(w, rows);
    const vb = h => `${view.x0} 0 ${view.w} ${h}`, earned = rows.reduce((t, r) => t + r.stars, 0), max = n * 3;
    const chip = r => r.st === 'paid' ? `${icons.lock(true)}Full game` : r.st === 'locked' ? `${icons.lock(false)}Locked` : r.played ? [1, 2, 3].map(j => icons.star(r.stars >= j)).join('') : `${icons.flag}New!`;
    const tags = rows.map(r => {
      const [x, y] = stonePos(r.i), left = r.i % 2 === 0, [l, t] = px(left ? x + 66 : x - 66, y);
      const pos = left ? `left:${l.toFixed(1)}px` : `right:${(view.W - l).toFixed(1)}px`;
      const nx = r.i === cur ? `<span class="pl-next"><svg viewBox="-6 -6 12 12" aria-hidden="true"><path d="M-3 -4.5 L4 0 L-3 4.5 Z" fill="${C.woodInk}"/></svg>Next</span>` : '';
      return `<div class="pl-tag ${left ? '' : 'r'} ${r.st}${r.i === cur ? ' next' : ''}" id="plTag${r.i}" style="${pos};top:${t.toFixed(1)}px" aria-hidden="true">${nx}<small>Level ${r.i + 1}</small><b>${ui.esc(r.L.name)}</b><span class="pl-chip">${chip(r)}</span></div>`;
    }).join('');
    const hits = rows.map(r => {
      const [, y] = stonePos(r.i), [l, t] = px(view.x0, y - ROW / 2 + 4), h = (ROW - 8) * view.k;
      return `<button class="pl-hit" data-l="${r.i}" style="left:${l.toFixed(1)}px;top:${t.toFixed(1)}px;width:${(view.w * view.k).toFixed(1)}px;height:${h.toFixed(1)}px" aria-label="${ui.esc(r.label)}"${r.disabled ? ` aria-disabled="${r.disabled}"` : ''}></button>`;
    }).join('');
    const halos = rows.map(r => { const [x, y] = stonePos(r.i); return `<g class="pl-halo" id="plHalo${r.i}"><ellipse cx="${x}" cy="${y + 4}" rx="74" ry="40" fill="${C.gold}" opacity=".25"/></g>`; }).join('');
    const stones = rows.map(r => { const [x, y] = stonePos(r.i); return stoneSVG(x, y, r.st, r.i + 1, r.stars, r.i === cur); }).join('');
    const [, by] = cur >= 0 ? stonePos(cur) : [0, 0];
    // back from a level in this world: Bonnie starts on the stone just played and hops on to the next
    const from = back && back.wid === w.id && back.i !== cur && back.i >= 0 && back.i < n && !reduce() ? back.i : cur;
    const returning = !!(back && back.wid === w.id); back = null;
    const bones = (M.save.get() || M.save.load()).bones;
    const intro = w.intro ? `<div class="pl-intro">${w.intro}</div>` : '';
    const el = document.createElement('div');
    el.className = 'pl'; el.style.width = view.W + 'px'; el.style.setProperty('--k', Math.min(1.25, view.k).toFixed(3));
    el.innerHTML = `
      <div class="pm-bar">
        <div class="pm-tags">
          <button class="pm-tag" id="plBack" aria-label="Back to the meadow"><svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="M7 -8 L-5 0 L7 8" fill="none" stroke="${C.woodInk}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Meadow</span></button>
          <button class="pm-tag" id="plGrown" aria-label="Grown-ups"><svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="M-6 -1 v-4 a6 6 0 0 1 12 0 v4" fill="none" stroke="${C.woodInk}" stroke-width="2.6"/><rect x="-9" y="-1" width="18" height="13" rx="3" fill="${C.woodInk}"/><circle cx="0" cy="5" r="2" fill="${C.woodLt}"/></svg></button>
        </div>
        <button class="pm-tag" id="plBones" aria-label="${bones} bones. Open the Bone Shop"><svg viewBox="-22 -14 44 28" aria-hidden="true">${A.bone(0, 0, 1)}</svg><span>${bones}</span></button>
      </div>
      <div class="pl-head" style="height:${(HEAD_H * view.k).toFixed(0)}px">
        <svg viewBox="${vb(HEAD_H)}" preserveAspectRatio="xMidYMin meet" aria-hidden="true">${scenes[w.id].head}${A.tint(theme, W, HEAD_H)}</svg>
        <div class="pl-name"><h2>${ui.esc(w.name)}</h2><span class="pl-chip">${icons.star(true)}${earned} / ${max}</span></div>
      </div>
      ${intro}
      <div class="pl-stage" style="height:${(H * view.k).toFixed(0)}px">
        <svg viewBox="${vb(H)}" preserveAspectRatio="xMidYMin meet" aria-hidden="true">${scenes[w.id].stage}${A.tint(theme, W, H)}${trodden(rows, look(w.id).ground)}${halos}${stones}
          ${cur >= 0 ? `<g id="plBonnie" style="transform:translate(${bonnieX(from)}px,${stonePos(from)[1] + 18}px)"><g>${A.bonnie(0, 0, .5)}</g></g>` : ''}</svg>
        <h3 class="sr">Levels. Tap a stone to play.</h3>
        ${tags}${hits}
      </div><div class="pl-end"></div>`;
    const old = ui.$('#screen .pl'); if (old) old.remove();
    ui.$('#screen').appendChild(el);
    // keep every tag on the screen
    ui.$$('.pl-tag').forEach(t => { const r = t.getBoundingClientRect(); if (r.right > view.W - 6) t.style.maxWidth = Math.max(120, r.width - (r.right - view.W + 6)) + 'px'; if (r.left < 6) t.style.maxWidth = Math.max(120, r.width - (6 - r.left)) + 'px'; });
    ui.$$('.pl-hit').forEach(b => {
      const i = +b.dataset.l, tag = ui.$('#plTag' + i), halo = ui.$('#plHalo' + i);
      const lit = v => { tag.classList.toggle('lit', v); if (halo) halo.classList.toggle('lit', v); };
      b.addEventListener('pointerdown', () => { if (busy) return; lit(true); tag.classList.add('pressed'); ui.tone && ui.tone(620, .06, 'sine', .07); });
      const up = () => { tag.classList.remove('pressed'); if (!b.classList.contains('chosen')) lit(b.matches(':focus-visible')); };
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, up));
      b.addEventListener('focus', () => lit(b.matches(':focus-visible'))); b.addEventListener('blur', () => { if (!b.classList.contains('chosen')) lit(false); });
      b.onclick = () => choose(rows[i], b);
    });
    ui.$('#plBack').onclick = () => { const back = ui.$('#back'); leave(); if (back) back.click(); else M.home(); };
    ui.$('#plGrown').onclick = () => { leave(); M.grownUps(); };
    ui.$('#plBones').onclick = () => { leave(); M.shop({ welcome: true }); };
    // scroll only when the next level isn't already on the first screen (so its name sign stays in view when it can)
    const nextY = cur >= 0 ? px(0, by)[1] + ui.$('.pl-stage').getBoundingClientRect().top + scrollY : 0;
    const target = cur >= 0 && nextY + 90 * view.k > innerHeight - 16 ? Math.max(0, nextY - innerHeight * .55) : 0;
    if (returning || reduce()) window.scrollTo({ top: target, behavior: 'auto' });
    else { window.scrollTo({ top: 0, behavior: 'auto' }); if (target > 0) setTimeout(() => { if (on) window.scrollTo({ top: target, behavior: Q.get('leveltest') || Q.get('level') ? 'auto' : 'smooth' }); }, 350); } // (headless test and screenshot browsers don't glide)
    if (from !== cur) setTimeout(() => { const bon = ui.$('#plBonnie'); if (!on || !bon) return; bon.classList.add('hop'); bon.style.transform = `translate(${bonnieX(cur)}px,${by + 18}px)`; setTimeout(() => bon.classList.remove('hop'), 800); }, 500);
    if (cur >= 0) {
      if (!Q.get('leveltest')) setTimeout(() => { if (on && !busy) ui.say(rows[cur].played ? `Shall we play ${rows[cur].L.name} again?` : `Level ${cur + 1} next! Tap my stone.`); }, 400);
    }
  }

  function choose(r, b) {
    if (busy) return;
    const tag = ui.$('#plTag' + r.i);
    if (r.st === 'locked' || r.st === 'paid') { // the engine says why (and shows the full-game box); the tag shakes
      if (!reduce()) ui.animate(tag, 'bad', 450);
      tag.classList.remove('lit'); r.b.click(); return;
    }
    busy = true; b.classList.add('chosen'); tag.classList.add('lit');
    const bon = ui.$('#plBonnie'), go = () => { leave(); back = { wid, i: r.i }; r.b.click(); };
    if (!bon || r.i === cur || reduce()) { setTimeout(go, reduce() ? 150 : 350); return; }
    const [x, y] = stonePos(r.i);
    bon.classList.add('hop'); bon.style.transform = `translate(${bonnieX(r.i)}px,${y + 18}px)`; cur = r.i;
    setTimeout(go, 850);
  }
  function leave() { on = false; busy = false; document.body.classList.remove('pl-on'); const el = ui.$('#screen .pl'); if (el) el.remove(); }

  /* ---------- fitting into the engine without changing it ---------- */
  function install() {
    ui.$('style#pl-css') || document.head.insertAdjacentHTML('beforeend', `<style id="pl-css">${CSS}</style>`);
    const screenEl = document.getElementById('screen');
    new MutationObserver(() => {
      const map = screenEl.querySelector(':scope > .card.map');
      if (map && !screenEl.querySelector(':scope > .pl')) {
        const h = map.querySelector('h2'); const w = h && M.visibleWorlds(SUBJECT).find(x => x.name === h.textContent);
        if (w) { wid = w.id; draw(); }
      } else if (!map && on) leave();
    }).observe(screenEl, { childList: true });
    let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (on) { ui.$('#screen .pl') && ui.$('#screen .pl').remove(); draw(); } }, 200); });
  }

  /* ---------- checks (leveltest=1) ---------- */
  async function leveltest() {
    const out = [], ok = (name, pass, detail = '') => out.push({ name, pass: !!pass, detail: String(detail) });
    const wait = ms => new Promise(r => setTimeout(r, ms)), r = el => el.getBoundingClientRect();
    const cross = (a, b) => a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2;
    await wait(400);
    const ws = M.visibleWorlds(SUBJECT), bad = {};
    const note = (k, v) => { (bad[k] = bad[k] || []).push(v); };
    let drawMs = 0, svgMax = 0; const lockSig = new Set();
    for (const w of ws) {
      const t0 = performance.now(); M.worldMap(w.id); await wait(60); drawMs = Math.max(drawMs, performance.now() - t0);
      const short = w.id.replace(/^y2-[a-z]+-/, '');
      if (!ui.$('#screen > .pl') || getComputedStyle(ui.$('#screen > .card.map')).display !== 'none') { note('drawn', short); continue; }
      svgMax = Math.max(svgMax, ui.$$('.pl svg *').length);
      const eng = ui.$$('#screen .card.map .stone'), hits = ui.$$('.pl-hit'), tags = ui.$$('.pl-tag'), stones = ui.$$('.pl-stone');
      if (hits.length !== w.levels.length || eng.length !== w.levels.length || tags.length !== hits.length || stones.length !== hits.length) note('count', `${short} ${hits.length}/${w.levels.length}`);
      eng.forEach((b, i) => {
        const want = b.classList.contains('paid') ? 'paid' : b.classList.contains('locked') ? 'locked' : b.querySelector('.ls') ? 'done' : 'new';
        const got = stones[i] && stones[i].dataset.st;
        if (!(got === want || (want === 'new' && got === 'next'))) note('state', `${short} L${i + 1} ${got}≠${want}`);
        if (hits[i] && hits[i].getAttribute('aria-label') !== b.getAttribute('aria-label')) note('label', `${short} L${i + 1}`);
      });
      hits.forEach((h, i) => { const a = r(h); if (a.width < 200 || a.height < 120) note('generous', `${short} ${a.width.toFixed(0)}×${a.height.toFixed(0)}`);
        const g = r(tags[i]); if (g.left < a.left - 2 || g.right > a.right + 2 || g.top < a.top - 2 || g.bottom > a.bottom + 2) note('inside', `${short} L${i + 1} ${[g.top - a.top, a.bottom - g.bottom].map(Math.round)}`);
        if (g.left < 0 || g.right > innerWidth) note('onscreen', `${short} L${i + 1}`); });
      if (hits.some((a, i) => hits.some((b, j) => j > i && cross(r(a), r(b))))) note('overlap', short);
      if (tags.some((a, i) => tags.some((b, j) => j > i && cross(r(a), r(b))))) note('tagoverlap', short);
      tags.forEach(t => { if (parseFloat(getComputedStyle(t.querySelector('b')).fontSize) < 19 || parseFloat(getComputedStyle(t.querySelector('small')).fontSize) < 16 || parseFloat(getComputedStyle(t.querySelector('.pl-chip')).fontSize) < 16) note('text', short); });
      if (document.documentElement.scrollWidth > innerWidth + 1) note('wide', `${short} ${document.documentElement.scrollWidth}`);
      const open = [...eng].map((b, i) => (b.classList.contains('paid') || b.classList.contains('locked')) ? -1 : i).filter(i => i >= 0);
      const bon = ui.$('#plBonnie');
      if (open.length && (!bon || !open.includes(cur))) note('bonnie', short);
      if (!ui.$('.pl-name h2') || ui.$('.pl-name h2').textContent !== w.name) note('name', short);
      if (w.intro && !ui.$('.pl-intro')) note('intro', short);
      // the next level: exactly one, on an open level, marked on its stone and its tag, with Bonnie beside it
      const nextTags = ui.$$('.pl-tag.next'), nextStones = ui.$$('.pl-stone[data-next]');
      if (open.length && (nextTags.length !== 1 || nextStones.length !== 1 || nextTags[0].id !== 'plTag' + cur || !nextTags[0].querySelector('.pl-next') || !open.includes(cur))) note('next', short);
      if (!open.length && (nextTags.length || nextStones.length)) note('next', short + ' (none open)');
      // every locked or full-game level looks the same (stone, padlock place, tag colours, no stars or flag)
      stones.forEach((g, i) => {
        if (g.dataset.st !== 'locked' && g.dataset.st !== 'paid') return;
        const t = getComputedStyle(tags[i]), el = g.querySelectorAll('ellipse'), lk = g.querySelector('g[transform]');
        const [lx] = lk ? lk.getAttribute('transform').match(/[-\d.]+/g).map(Number) : [NaN];
        const sig = [el[1].getAttribute('fill'), el[2].getAttribute('fill'), Math.round(lx - +el[2].getAttribute('cx')), g.querySelectorAll('[data-flag]').length, t.backgroundColor, t.borderTopColor, t.color, getComputedStyle(tags[i].querySelector('small')).opacity].join('|');
        lockSig.add(sig);
        if (tags[i].querySelector('.pl-chip').textContent.trim() !== (g.dataset.st === 'paid' ? 'Full game' : 'Locked') || tags[i].classList.contains('next')) note('lockstars', `${short} L${i + 1}`);
      });
      const nm = ui.$('.pl-name h2'); if (nm && parseFloat(getComputedStyle(nm).fontSize) < 26) note('title', short);
    }
    const list = k => (bad[k] || []).join(', ');
    ok('every world opens as a drawn level map (the engine\'s list hidden)', !bad.drawn, list('drawn'));
    ok('a stone, a tag and a tap area for every level', !bad.count, list('count'));
    ok('each stone shows the engine\'s state (done, new, locked, full game)', !bad.state, list('state'));
    ok('each stone has the engine\'s own VoiceOver name', !bad.label, list('label'));
    ok('each level is a generous target (its whole row)', !bad.generous, list('generous'));
    ok('each tag is inside its level\'s tap area and on the screen', !bad.inside && !bad.onscreen, list('inside') + list('onscreen'));
    ok('tap areas and tags do not overlap', !bad.overlap && !bad.tagoverlap, list('overlap') + list('tagoverlap'));
    ok('names 19px or more, the rest 16px or more', !bad.text, list('text'));
    ok('nothing is wider than the screen', !bad.wide, list('wide'));
    ok('Bonnie waits on an open stone', !bad.bonnie, list('bonnie'));
    ok('the world\'s name, and its words for grown-ups, are shown', !bad.name && !bad.intro, list('name') + list('intro'));
    ok('one clear "Next" level, on its stone and its tag, with Bonnie beside it', !bad.next, list('next'));
    ok('locked and full-game levels look the same in every world', lockSig.size <= 1 && !bad.lockstars, `${lockSig.size} look(s) ${[...lockSig].join(' / ')} ${list('lockstars')}`);
    ok('each world\'s name sign is 26px or more', !bad.title, list('title'));
    ok('drawing size is modest (for the 2018 iPad)', svgMax < 6000 && drawMs < 400, `${svgMax} SVG elements at most, opened in ${drawMs.toFixed(0)} ms at most`);
    // scrolling: opening a world shows its next level; after playing one, the map comes back at the next level
    const onScreen = () => { const g = ui.$('#plTag' + cur); if (!g) return false; const a = r(g); return a.top >= 40 && a.bottom <= innerHeight; };
    const deep = ws.map(w => { M.worldMap(w.id); return { w, c: current(w, readEngine(w)) }; }).sort((a, b) => b.c - a.c)[0];
    M.worldMap(deep.w.id); await wait(1400);
    ok('opening a world scrolls to its next level', onScreen(), `${deep.w.id.replace(/^y2-[a-z]+-/, '')}, level ${cur + 1}, scrolled ${Math.round(scrollY)}`);
    const played = cur; ui.$$('.pl-hit')[cur].click(); await wait(1400);
    window.scrollTo(0, 0); M.worldMap(deep.w.id); await wait(200);
    // (at the top is right only when the next level already fits on the first screen: the map scrolls only when it must)
    const fitsAtTop = () => { const g = ui.$('#plTag' + cur); return !!g && r(g).bottom + scrollY <= innerHeight; };
    ok('back from a level, the map opens at the next level, not the top', onScreen() && (cur <= 1 || scrollY > 0 || fitsAtTop()), `played level ${played + 1}, next ${cur + 1}, scrolled ${Math.round(scrollY)}`);
    // pressing, and taps going to the engine (in the first world)
    const w0 = ws[0]; M.worldMap(w0.id); await wait(80);
    const h0 = ui.$('.pl-hit'); h0.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await wait(30);
    ok('pressing a level lights its tag', ui.$('#plTag0').classList.contains('lit') && ui.$('#plTag0').classList.contains('pressed'));
    h0.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true })); await wait(30);
    ok('…and letting go puts it back', !ui.$('#plTag0').classList.contains('lit'));
    const lockedI = ui.$$('#screen .card.map .stone').findIndex(b => b.classList.contains('locked'));
    if (lockedI >= 0) { ui.$$('.pl-hit')[lockedI].click(); await wait(300); ok('a locked level does not start, and stays on the map', !!ui.$('#screen > .pl') && !!ui.$('#screen .card.map'), `level ${lockedI + 1}`); }
    const paidI = ui.$$('#screen .card.map .stone').findIndex(b => b.classList.contains('paid'));
    if (paidI >= 0) { ui.$$('.pl-hit')[paidI].click(); await wait(300); const m = ui.$('.modal-bg'); ok('a full-game level opens the engine\'s "full game" box', !!m && /full game/i.test(m.textContent), `level ${paidI + 1}`); if (m) m.remove(); }
    ui.$$('.pl-hit')[0].click(); await wait(1400);
    ok('an open level starts the engine\'s level', !ui.$('#screen .card.map') && !ui.$('#screen > .pl') && !document.body.classList.contains('pl-on'));
    M.worldMap(w0.id); await wait(80);
    ok('the level map comes back', !!ui.$('#screen > .pl'));
    ui.$('#plBack').click(); await wait(300);
    ok('"Meadow" goes back to the meadow map', !!ui.$('.pm') && !ui.$('#screen > .pl'));
    const pre = document.createElement('pre'); pre.id = 'selftest'; pre.textContent = JSON.stringify({ size: [innerWidth, innerHeight], passed: out.filter(x => x.pass).length, of: out.length, results: out }, null, 1);
    document.body.appendChild(pre);
  }

  window.ProtoLevel = { install, draw, leveltest };
  install();
  if (Q.get('leveltest')) leveltest();
})();
