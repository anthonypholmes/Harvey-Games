/* Meadow Maths map PROTOTYPE (not part of the game yet).
 *
 * The world list as an illustrated meadow route (design iteration 2, Direction B). It runs on the real engine:
 * the worlds, stars, unlocking and the full-game padlocks all come from js/meadow-core.js, and tapping a place
 * opens the engine's own level map (Meadow.worldMap). Nothing in the engine is changed: this file only draws a
 * different screen in place of the world list, and puts it back when the old list would have shown.
 *
 * Page options (prototype-maths-map.html?…):
 *   view=old     the current world list, unchanged (for the side-by-side comparison)
 *   demo=1       a separate pretend save (meadow-save-proto-demo) with some progress, so the real save is never touched
 *   taster=1     show the App Store app's free taster (levels after 1 locked), as if inside the app
 *   selftest=1   run the checks and print the results on the page
 */
(function () {
  const Q = new URLSearchParams(location.search);
  const A = window.ProtoArt, M = window.Meadow, ui = M.ui, C = A.C;
  const reduce = () => ui.reduceMotion();

  /* Where each world lives in the drawing (world units: the drawing is 640 × 1500; a phone shows x 125–515).
     hit: the whole tappable area. badge: where the stars sit (under the place's name). bonnie: where she stands (her feet).
     bub: her speech bubble [x, y, 'above'|'below'] (y is its bottom edge for 'above', its top for 'below'). */
  const PLACES = {
    'y2-maths-partitioning': { hit: [96, 40, 250, 240], badge: [224, 96], bonnie: [372, 300], bub: [292, 312, 'below'],
      ask: 'Shall we build some numbers in the park?', go: 'Off to the park!' },
    'y2-maths-number-bonds': { hit: [330, 340, 230, 150], badge: [398, 472], bonnie: [300, 532], bub: [128, 452, 'above'],
      ask: 'Shall we dig up some number bonds?', go: 'Off to the burrow!' },
    'y2-maths-number-lines': { hit: [140, 540, 380, 130], badge: [232, 598], bonnie: [330, 590], bub: [134, 508, 'above'],
      ask: 'Shall we hop across the river today?', go: 'Hop, hop, to the river!' },
    'y2-maths-arrays': { hit: [330, 760, 230, 220], badge: [464, 966], bonnie: [470, 740], bub: [270, 750, 'below'],
      ask: 'Shall we pick apples in the orchard?', go: 'Off to the orchard!' },
    'y2-maths-sharing': { hit: [100, 975, 228, 170], badge: [250, 1106], bonnie: [400, 985], bub: [196, 900, 'above'],
      ask: 'Shall we share things out at the pond?', go: 'Down to the pond!' },
    'y2-maths-captains-cove': { hit: [120, 1250, 400, 240], badge: [478, 1324], bonnie: [365, 1262], bub: [175, 1180, 'above'],
      ask: 'Captain Croak has an idea. Shall we check it?', go: 'Ahoy! To the Cove!' },
  };
  const WORLD_W = 640, WORLD_H = 1500, PHONE_X = 125, PHONE_W = 390;

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
  const placed = () => M.visibleWorlds('maths').filter(w => PLACES[w.id]);
  const unplaced = () => M.visibleWorlds('maths').filter(w => !PLACES[w.id]);

  /* ---------- drawing the live bits: stars, Bonnie and her bubble ---------- */
  function badge(w) {
    const [x, y] = PLACES[w.id].badge, f = info(w);
    let icon, text;
    if (f.mastered) { icon = `<circle cx="0" cy="0" r="8" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1.5"/><path d="M-4 6 l-3 9 l4 -2 l2 4 l2 -10 M4 6 l3 9 l-4 -2 l-2 4" fill="${C.berry}"/>${A.star(0, 0, 5, true).replace(C.goldDk, '#FFF3B0')}`; text = 'All stars!'; }
    else if (!f.played) { icon = `<path d="M-6 -9 v18" stroke="${C.woodDk}" stroke-width="2"/><path d="M-5 -9 l12 4 l-12 4 z" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1"/>`; text = 'New!'; }
    else { icon = A.star(0, 0, 8, true); text = `${f.earned}/${f.max}`; }
    const w1 = 30 + text.length * 7.6, h = f.taster ? 40 : 24;
    let g = `<g transform="translate(${x} ${y})"><rect x="${-w1 / 2}" y="2" width="${w1}" height="${h}" rx="7" fill="#C9B48E"/><rect x="${-w1 / 2}" y="0" width="${w1}" height="${h}" rx="7" fill="${C.paper}"/>
      <g transform="translate(${-w1 / 2 + 13} 12)">${icon}</g><text x="${-w1 / 2 + 25}" y="17" font-family="Fredoka" font-weight="700" font-size="14" fill="${C.ink}">${text}</text>`;
    if (f.taster) g += `<g transform="translate(${-w1 / 2 + 13} 31)"><path d="M-3 0 v-3 a3 3 0 0 1 6 0 v3" stroke="#6B655A" stroke-width="1.6" fill="none"/><rect x="-4.5" y="-0.5" width="9" height="7" rx="1.5" fill="#8B8478"/></g><text x="${-w1 / 2 + 22}" y="36" font-family="Fredoka" font-weight="600" font-size="10.5" fill="${C.soft}">Level 1 free</text>`;
    return g + '</g>';
  }
  function wrap(text, max = 24) { const out = []; let line = ''; text.split(' ').forEach(word => { if ((line + ' ' + word).trim().length > max && line) { out.push(line); line = word; } else line = (line + ' ' + word).trim(); }); if (line) out.push(line); return out; }
  function bubbleSVG(w, text) {
    const p = PLACES[w.id], lines = wrap(text), fs = 14.5, h = lines.length * fs * 1.3 + 20, bw = 186;
    const [bx, byRaw, side] = p.bub, [fx, fy] = p.bonnie;
    const x = Math.max(view.x0 + 6, Math.min(bx, view.x0 + view.w - bw - 6));
    return side === 'above' ? A.bubble(x, byRaw - h, bw, lines, fx - 10, fy - 58, fs) : A.bubble(x, byRaw, bw, lines, fx + 4, fy - 4, fs);
  }

  /* ---------- the screen ---------- */
  const CSS = `
  .pm-on .hud,.pm-on .butterfly,.pm-on .frog,.pm-on .meadow{display:none!important}
  .pm-on #app{max-width:none;padding:0;min-height:0}
  .pm-on{background:${C.meadow}!important}
  .pm{position:relative;margin:0 auto}
  .pm-bar{position:sticky;top:0;z-index:5;display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding:calc(8px + env(safe-area-inset-top)) 10px 0;pointer-events:none}
  .pm-bar>*{pointer-events:auto}
  .pm-tag{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-width:48px;min-height:44px;padding:0 10px 0 20px;border:0;font:700 19px Fredoka,system-ui,sans-serif;color:${C.woodInk};text-decoration:none;cursor:pointer;
    background:${C.woodLt};clip-path:polygon(14px 0,100% 0,100% 100%,14px 100%,0 50%);box-shadow:inset 0 -4px 0 rgba(154,106,58,.55);filter:drop-shadow(0 2px 0 ${C.woodDk})}
  .pm-tag svg{width:26px;height:26px;flex:none}
  .pm-tags{display:flex;gap:6px}
  .pm-title{margin:2px 0 0;padding:6px 16px 8px;border-radius:10px;background:${C.woodLt};box-shadow:0 3px 0 ${C.woodDk};font:700 clamp(17px,5vw,22px) Fredoka,system-ui,sans-serif;color:${C.woodInk};white-space:nowrap;text-align:center}
  .pm-stage{position:relative;margin-top:-16px;overflow:hidden}
  @media (max-width:400px){.pm-bar{gap:4px;padding-left:6px;padding-right:6px}.pm-tags{gap:4px}.pm-title{font-size:16px;padding:6px 10px 8px}.pm-tag{font-size:17px}}
  .pm-stage svg{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
  .pm-hit{position:absolute;z-index:3;border:0;margin:0;padding:0;background:transparent;border-radius:28px;cursor:pointer;-webkit-tap-highlight-color:transparent}
  .pm-hit:focus-visible{outline:4px solid ${C.gold};outline-offset:-4px;background:rgba(255,246,226,.18)}
  .pm-hit:active,.pm-hit.chosen{background:rgba(255,246,226,.22);box-shadow:inset 0 0 0 4px rgba(242,193,78,.9)}
  .pm-hit.bonnie-hit{border-radius:50%;z-index:4}
  #pmBonnie{transition:transform .75s cubic-bezier(.45,.05,.3,1)}
  #pmBonnie.hop>g{animation:pmHop .38s ease-in-out 2}
  #pmBonnie.wiggle>g{animation:pmWig .5s ease-in-out}
  @keyframes pmHop{50%{transform:translateY(-14px)}}
  @keyframes pmWig{25%{transform:rotate(-6deg)}75%{transform:rotate(6deg)}}
  #pmBubble{transition:opacity .25s}
  .pm-place-pulse{animation:pmPulse .6s ease-in-out}
  @keyframes pmPulse{50%{opacity:.75}}
  @media (prefers-reduced-motion:reduce){#pmBonnie,#pmBubble{transition:none}#pmBonnie.hop>g,#pmBonnie.wiggle>g,.pm-place-pulse{animation:none}}
  .pm-more{padding:16px;display:grid;gap:10px}
  .pm-more button{min-height:56px;border:0;border-radius:12px;background:${C.woodLt};box-shadow:0 3px 0 ${C.woodDk};font:600 18px Fredoka,system-ui,sans-serif;color:${C.woodInk};cursor:pointer}
  .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`;

  function layout() {
    const W = Math.min(document.documentElement.clientWidth || innerWidth, 900);
    view = W < 600 ? { x0: PHONE_X, w: PHONE_W } : { x0: 0, w: WORLD_W };
    view.W = W; view.k = W / view.w; view.H = Math.round(WORLD_H * view.k);
  }
  const px = (x, y) => [(x - view.x0) * view.k, y * view.k];

  function draw() {
    on = true; busy = false;
    document.body.classList.add('pm-on');
    layout();
    if (!scene) scene = A.mathsRoute().render();
    const ws = placed(), sug = suggestion(ws), s = save();
    at = sug || ws[0];
    const vb = `${view.x0} 0 ${view.w} ${WORLD_H}`;
    const bonnieLine = sug ? (info(sug).played ? PLACES[sug.id].ask : `Woof! Let's start at ${shortName(sug)}!`) : 'You have every star! Pick anywhere you like.';
    const [bfx, bfy] = at ? PLACES[at.id].bonnie : [320, 300];
    const hits = ws.map((w, i) => {
      const [x, y, ww, hh] = PLACES[w.id].hit, [l, t] = px(Math.max(x, view.x0), y), r = px(Math.min(x + ww, view.x0 + view.w), y + hh);
      const f = info(w), width = Math.max(44, r[0] - l), height = Math.max(44, r[1] - t);
      const label = `World ${i + 1}: ${w.name}. ${w.tag || ''}. ${f.mastered ? 'Every star won.' : f.played ? `${f.earned} of ${f.max} stars.` : 'New!'}${f.taster ? ' Level 1 is free to play.' : ''}`;
      return `<button class="pm-hit" data-w="${ui.esc(w.id)}" style="left:${l.toFixed(1)}px;top:${t.toFixed(1)}px;width:${width.toFixed(1)}px;height:${height.toFixed(1)}px" aria-label="${ui.esc(label.replace(/\.\./g, '.'))}"></button>`;
    }).join('');
    const [bl, bt] = px(bfx - 40, bfy - 78);
    ui.show(`<div class="pm" style="width:${view.W}px">
      <div class="pm-bar">
        <div class="pm-tags">
          <a class="pm-tag" href="${/prototype-clubhouse/.test(document.referrer) ? 'prototype-clubhouse.html' : 'index.html'}" aria-label="Back to the Clubhouse"><svg viewBox="-14 -14 28 28" aria-hidden="true"><path d="M-12 0 L0 -11 L12 0" fill="${C.berry}" stroke="#A93E4F" stroke-width="2" stroke-linejoin="round"/><rect x="-9" y="-1" width="18" height="13" rx="1.5" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="1.6"/><rect x="-2.5" y="4" width="5" height="8" fill="${C.woodDk}"/></svg></a>
          <button class="pm-tag" id="pmGrown" aria-label="Grown-ups"><svg viewBox="-14 -12 28 24" aria-hidden="true"><circle cx="-6" cy="0" r="6" fill="none" stroke="${C.woodInk}" stroke-width="3"/><path d="M0 0 h12 M8 0 v5 M12 0 v4" stroke="${C.woodInk}" stroke-width="3" stroke-linecap="round"/></svg></button>
        </div>
        <h1 class="pm-title">Meadow Maths</h1>
        <button class="pm-tag" id="pmBones" aria-label="${s.bones} bones. Open the Bone Shop">${A.bone(0, 0, 1).replace('<g transform="translate(0 0) scale(1)">', '<svg viewBox="-22 -14 44 28" aria-hidden="true"><g>').replace(/<\/g>$/, '</g></svg>')}<span>${s.bones}</span></button>
      </div>
      <div class="pm-stage" style="height:${view.H}px">
        <svg viewBox="${vb}" preserveAspectRatio="xMidYMin meet" aria-hidden="true">${scene}</svg>
        <svg viewBox="${vb}" preserveAspectRatio="xMidYMin meet" aria-hidden="true" id="pmLive">
          ${ws.map(badge).join('')}
          ${at ? `<g id="pmBonnie" style="transform:translate(${bfx}px,${bfy}px)"><g>${A.bonnie(0, 0, .58)}</g></g><g id="pmBubble">${bubbleSVG(at, bonnieLine)}</g>` : ''}
        </svg>
        <h2 class="sr">The meadow. Tap a place to play there.</h2>
        ${at ? `<button class="pm-hit bonnie-hit" id="pmBonnieBtn" style="left:${bl.toFixed(1)}px;top:${bt.toFixed(1)}px;width:${(80 * view.k).toFixed(1)}px;height:${(80 * view.k).toFixed(1)}px" aria-label="Bonnie says: ${ui.esc(bonnieLine)} Tap to go to ${ui.esc(at.name)}."></button>` : ''}
        ${hits}
      </div>
      ${unplaced().length ? `<div class="pm-more"><h2 style="font:700 20px Fredoka;margin:0;color:${C.ink}">More worlds</h2>${unplaced().map(w => `<button data-w="${ui.esc(w.id)}" class="pm-hit-more">${ui.esc(w.name)} · ${info(w).earned}/${info(w).max}</button>`).join('')}</div>` : ''}
    </div>`);
    // the Bonnie hit area sits at her feet and moves with her: it's placed in the bar order above for VoiceOver
    const bb = document.getElementById('pmBonnieBtn'); if (bb) bb.parentNode.insertBefore(bb, bb.parentNode.querySelector('.pm-hit:not(.bonnie-hit)'));
    ui.$$('.pm-hit[data-w], .pm-hit-more').forEach(b => b.onclick = () => choose(b.dataset.w, b));
    if (bb) bb.onclick = () => choose(at.id, bb, true);
    ui.$('#pmGrown').onclick = () => { leave(); M.grownUps(); };
    ui.$('#pmBones').onclick = () => { leave(); M.shop({ welcome: true }); };
    // bring Bonnie's place into view (she may be far down the route)
    const target = px(bfx, bfy)[1] - innerHeight * .55;
    if (target > 0) window.scrollTo({ top: target, behavior: reduce() ? 'auto' : 'smooth' });
    setTimeout(() => { if (on && !busy) ui.say(bonnieLine); }, 350);
  }
  const shortName = w => w.name.replace(/^The /, 'the ');

  function choose(id, el, viaBonnie) {
    if (busy) return;
    const w = M.world(id); if (!w) return;
    busy = true; ui.sfx.pop();
    el.classList.add('chosen');
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
  function leave() { on = false; busy = false; document.body.classList.remove('pm-on'); }

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
    const out = [], ok = (name, pass, detail = '') => out.push({ name, pass: !!pass, detail });
    const wait = ms => new Promise(r => setTimeout(r, ms));
    await wait(300);
    const ws = M.visibleWorlds('maths'), hits = ui.$$('.pm-hit[data-w]');
    ok('the meadow is showing', !!ui.$('.pm'));
    ok('every maths world has a place', hits.length + ui.$$('.pm-hit-more').length === ws.length, `${hits.length} places for ${ws.length} worlds`);
    const small = hits.concat(ui.$$('.pm-tag')).filter(b => { const r = b.getBoundingClientRect(); return r.width < 44 || r.height < 44; });
    ok('every tap target is at least 44 × 44', !small.length, small.map(b => b.getAttribute('aria-label')).join(', '));
    ok('every place has a VoiceOver name', hits.every(b => (b.getAttribute('aria-label') || '').length > 10));
    const labels = hits.map(b => b.getAttribute('aria-label'));
    ok('each name says its stars', ws.every((w, i) => { const f = info(w); return labels.some(l => l.includes(w.name) && (f.mastered ? /Every star/.test(l) : f.played ? l.includes(`${f.earned} of ${f.max}`) : /New/.test(l))); }));
    const overlap = hits.some((a, i) => hits.some((b, j) => { if (j <= i) return false; const r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect(); return r1.left < r2.right - 2 && r2.left < r1.right - 2 && r1.top < r2.bottom - 2 && r2.top < r1.bottom - 2; }));
    ok('places do not overlap each other', !overlap);
    ok('nothing is wider than the screen', document.documentElement.scrollWidth <= innerWidth + 1, `${document.documentElement.scrollWidth} vs ${innerWidth}`);
    ok('Bonnie is on the map, with a button', !!ui.$('#pmBonnie') && !!ui.$('#pmBonnieBtn'));
    const svgCount = ui.$$('.pm-stage svg *').length; ok('drawing size is modest', svgCount < 6000, `${svgCount} SVG elements`);
    // tap the second place: the engine's own level map opens, with its locks
    const second = hits[1]; second.click(); await wait(1700);
    const back = ui.$('#back');
    ok('a place opens the real level map', !!back && !!ui.$('.stone'), back ? back.textContent : 'no map');
    const w2 = M.world(second.dataset.w), stones = ui.$$('.stone');
    ok('the level map keeps the engine\'s unlocking', stones.every((st, l) => { const paid = M.fullGame.paid(w2, l), un = !paid && M.levelUnlocked(w2, l); return st.classList.contains('locked') === (!paid && !un) && st.classList.contains('paid') === paid; }));
    ok('the top bar is back on the level map', getComputedStyle(ui.$('.hud')).display !== 'none');
    if (back) back.click(); await wait(300);
    ok('"Meadow" goes back to the meadow', !!ui.$('.pm'));
    const pre = document.createElement('pre'); pre.id = 'selftest'; pre.textContent = JSON.stringify({ size: [innerWidth, innerHeight], passed: out.filter(x => x.pass).length, of: out.length, results: out }, null, 1);
    document.body.appendChild(pre);
  }

  window.ProtoMap = { install, draw, PLACES, selftest };
  if (Q.get('view') !== 'old') install();
  if (Q.get('selftest')) selftest();
})();
