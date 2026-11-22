/* Clubhouse meadow PROTOTYPE (not part of the game yet).
 *
 * The Clubhouse page drawn as one illustrated meadow that fits one screen (design iteration 2, Direction B):
 * the clubhouse with the child's name, Bonnie at the door, the Walk arch, the shop stall, and a gate for each game.
 *
 * It runs on the real Clubhouse: prototype-clubhouse.html loads index.html unchanged and adds this file at the end,
 * so every function is index.html's own. This file only draws a different screen and calls index.html's functions
 * (goTo, say, giggle, hearts, render, LINES, S, soundOn, tipLine) and its buttons (sound, change name, switch
 * player, grown-ups). The name card and "Who's playing?" card are index.html's, unchanged.
 *
 * Page options (prototype-clubhouse.html?…):
 *   view=old     the current Clubhouse, unchanged
 *   words=…      where the Meadow Words gate goes (default meadow-words.html)
 *   maths=…      where the Meadow Maths gate goes (default prototype-maths-map.html, the map prototype)
 *   selftest=1   run the checks and print the results on the page
 */
(function () {
  const Q = new URLSearchParams(location.search);
  const A = window.ProtoArt, ART = window.ProtoHubArt, M = window.Meadow, C = A.C;
  const $ = id => document.getElementById(id);
  const reduce = () => M.ui.reduceMotion();

  /* Where things are in the drawing (world units: the drawing is 640 × 930).
     hit: the whole tappable area [x, y, w, h]. stand: where Bonnie goes before the page opens (her feet). */
  const DOOR = [262, 510];
  const PLACES = {
    maths: { hit: [104, 562, 170, 196], stand: [262, 690], href: Q.get('maths') || 'prototype-maths-map.html', game: 0 },
    words: { hit: [366, 562, 170, 196], stand: [378, 690], href: Q.get('words') || 'meadow-words.html', game: 1 },
    walk: { hit: [104, 398, 116, 158], stand: [212, 528], href: 'bonnies-walk.html' },
    shop: { hit: [416, 386, 124, 160], stand: [412, 526], href: 'meadow-words.html#shop' },
    house: { hit: [226, 266, 188, 150] },
  };
  // the part of the drawing that must always be on screen: from the clubhouse flag to under the gates' stars
  const NEED = [100, 214, 444, 556];
  const BONNIE_K = .6;

  let view = null, at = DOOR, busy = false;

  /* ---------- what to show, from the save ---------- */
  function weekly(g) {
    const { earned, possible } = M.starSummary(g.progress);
    if (!possible) return null;
    if (earned >= possible) return { icon: 'trophy', text: 'All stars!', say: 'Every star won.' };
    const n = M.starsThisWeek(g.progress);
    return n ? { icon: 'star', text: `${n} new this week`, say: `${n} new ${n === 1 ? 'star' : 'stars'} this week.` }
      : { icon: 'flag', text: 'Ready to play!', say: '' };
  }
  const icons = {
    star: `<svg viewBox="-10 -10 20 20" aria-hidden="true">${A.star(0, 0, 9, true)}</svg>`,
    trophy: `<svg viewBox="-11 -11 22 22" aria-hidden="true"><path d="M-7 -9 h14 v5 a7 7 0 0 1 -14 0 z" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1.5"/><path d="M-7 -7 h-3 a3 4 0 0 0 4 6 M7 -7 h3 a3 4 0 0 1 -4 6" fill="none" stroke="${C.goldDk}" stroke-width="1.5"/><rect x="-2" y="2" width="4" height="4" fill="${C.goldDk}"/><rect x="-6" y="6" width="12" height="4" rx="1.5" fill="${C.woodDk}"/></svg>`,
    flag: `<svg viewBox="-10 -10 20 20" aria-hidden="true"><path d="M-5 -9 v18" stroke="${C.woodDk}" stroke-width="2"/><path d="M-4 -9 l12 4 l-12 4 z" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1"/></svg>`,
    paw: `<svg viewBox="-12 -13 24 24" aria-hidden="true">${A.paw(0, 0, 1, C.woodInk)}</svg>`,
    bone: `<svg viewBox="-22 -14 44 28" aria-hidden="true">${A.bone(0, 0, 1)}</svg>`,
    soundOn: `<svg viewBox="-14 -12 28 24" aria-hidden="true"><path d="M-11 -4 h5 l7 -6 v20 l-7 -6 h-5 z" fill="${C.woodInk}"/><path d="M5 -5 q4 5 0 10 M8 -9 q8 9 0 18" fill="none" stroke="${C.woodInk}" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    soundOff: `<svg viewBox="-14 -12 28 24" aria-hidden="true"><path d="M-11 -4 h5 l7 -6 v20 l-7 -6 h-5 z" fill="${C.woodInk}"/><path d="M5 -5 l8 10 M13 -5 l-8 10" stroke="${C.berry}" stroke-width="2.6" stroke-linecap="round"/></svg>`,
    pencil: `<svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="M-8 8 l2 -7 l11 -11 l5 5 l-11 11 z" fill="${C.gold}" stroke="${C.woodInk}" stroke-width="2" stroke-linejoin="round"/><path d="M-8 8 l2 -7 l5 5 z" fill="${C.woodInk}"/></svg>`,
    players: `<svg viewBox="-14 -12 28 24" aria-hidden="true"><circle cx="-5" cy="-4" r="4.5" fill="${C.woodInk}"/><path d="M-13 10 a8 8 0 0 1 16 0 z" fill="${C.woodInk}"/><circle cx="6" cy="-5" r="4" fill="${C.berry}"/><path d="M0 9 a7 7 0 0 1 13 0 z" fill="${C.berry}"/></svg>`,
    key: `<svg viewBox="-14 -12 28 24" aria-hidden="true"><circle cx="-6" cy="0" r="6" fill="none" stroke="${C.woodInk}" stroke-width="3"/><path d="M0 0 h12 M8 0 v5 M12 0 v4" stroke="${C.woodInk}" stroke-width="3" stroke-linecap="round"/></svg>`,
  };

  /* ---------- the screen ---------- */
  const CSS = `
  body.ph-on .wrap>:not(.ph):not(#nameCard):not(#playerCard):not(#a2hs),body.ph-on .meadow,body.ph-on .butterfly,body.ph-on .frog{display:none!important}
  body.ph-on .wrap{max-width:none;padding:0;position:static}
  body.ph-on{overflow:hidden}
  body.ph-on #a2hs{position:fixed;z-index:8;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));margin:0 auto}
  body.ph-asking .ph{display:none}
  body.ph-asking .wrap{padding:16px}
  .ph{position:fixed;inset:0;overflow:hidden;background:${C.meadow}}
  .ph-stage{position:absolute;left:50%;top:0;transform:translateX(-50%)}
  .ph-stage>svg{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
  .ph-bar{position:absolute;z-index:6;left:0;right:0;top:0;display:flex;justify-content:space-between;gap:8px;padding:calc(8px + env(safe-area-inset-top)) 10px 0;pointer-events:none}
  .ph-bar>div{display:flex;gap:6px;pointer-events:auto}
  .ph-tag{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-width:52px;min-height:44px;padding:0 12px 0 22px;border:0;font:700 18px Fredoka,system-ui,sans-serif;color:${C.woodInk};cursor:pointer;
    background:${C.woodLt};clip-path:polygon(14px 0,100% 0,100% 100%,14px 100%,0 50%);box-shadow:inset 0 -4px 0 rgba(154,106,58,.55);filter:drop-shadow(0 2px 0 ${C.woodDk})}
  .ph-bar>div:last-child .ph-tag{padding:0 22px 0 12px;clip-path:polygon(0 0,calc(100% - 14px) 0,100% 50%,calc(100% - 14px) 100%,0 100%)}
  .ph-tag svg{width:26px;height:26px;flex:none}
  .ph-hit{position:absolute;z-index:3;border:0;margin:0;padding:0;background:transparent;border-radius:26px;cursor:pointer;-webkit-tap-highlight-color:transparent}
  .ph-hit:focus-visible{outline:4px solid ${C.gold};outline-offset:-4px;background:rgba(255,246,226,.18)}
  .ph-hit:active,.ph-hit.chosen{background:rgba(255,246,226,.22);box-shadow:inset 0 0 0 4px rgba(242,193,78,.9)}
  .ph-hit.tip-ring{outline-offset:-2px}
  .ph-hit.house{z-index:2}
  .ph-hit.bonnie-hit{border-radius:50%;z-index:5}
  .ph-label{position:absolute;z-index:4;transform:translateX(-50%);pointer-events:none;display:flex;white-space:nowrap;align-items:center;justify-content:center;gap:5px;text-align:center;
    padding:4px 10px 5px;border-radius:9px;background:${C.paper};box-shadow:0 2px 0 #C9B48E;font:700 max(16px,calc(14px * var(--k,1)))/1.15 Fredoka,system-ui,sans-serif;color:${C.ink}}
  .ph-label svg{width:20px;height:20px;flex:none}
  .ph-bubble{position:absolute;z-index:4;pointer-events:none;display:flex;align-items:center;gap:10px;left:50%;transform:translateX(-50%);width:max-content;max-width:min(440px,calc(100% - 24px));
    padding:8px 16px 9px 8px;border-radius:18px;background:${C.paper};border:2px solid #D9C7A6;font:400 max(17px,calc(15px * var(--k,1)))/1.3 Andika,system-ui,sans-serif;color:${C.ink};box-shadow:0 3px 0 rgba(154,106,58,.25);transition:opacity .25s}
  .ph-bubble .face{width:46px;height:46px;flex:none;border-radius:50%;background:#E6F3D8;overflow:hidden}
  .ph-bubble .face svg{width:100%;height:auto;transform:translateY(4px) scale(1.5);transform-origin:50% 30%}
  #phBonnie{transition:transform .7s cubic-bezier(.45,.05,.3,1)}
  #phBonnie.hop>g{animation:phHop .35s ease-in-out 2}
  #phBonnie.giggle>g{animation:phWig .9s ease-in-out}
  #phBonnie.bonnie-spin>g{animation:phSpin 1.2s cubic-bezier(.3,1.2,.5,1);transform-box:fill-box;transform-origin:50% 100%}
  @keyframes phHop{50%{transform:translateY(-14px)}}
  @keyframes phWig{20%,60%{transform:rotate(-6deg)}40%,80%{transform:rotate(6deg)}}
  @keyframes phSpin{35%{transform:translateY(-40px) rotate(180deg)}70%{transform:translateY(-10px) rotate(360deg)}100%{transform:none}}
  @media (prefers-reduced-motion:reduce){#phBonnie,.ph-bubble{transition:none}#phBonnie>g{animation:none!important}}
  .ph .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`;

  /* Fit the drawing to the screen: everything in NEED shows, as big as it can be, and the rest of the screen
     is filled with more of the meadow. An iPad shows nearly all of it; a phone shows the middle. */
  function layout() {
    const W = document.documentElement.clientWidth || innerWidth, H = innerHeight, bar = 60;
    const k = Math.min(W / NEED[2], (H - bar) / NEED[3], 1.35);
    let vw = Math.min(W / k, ART.W), vh = Math.min(H / k, ART.H);
    let x0 = NEED[0] + NEED[2] / 2 - vw / 2, y0 = NEED[1] - bar / k - (vh - NEED[3] - bar / k) / 2;
    x0 = Math.max(0, Math.min(x0, ART.W - vw)); y0 = Math.max(0, Math.min(y0, ART.H - vh));
    view = { x0, y0, vw, vh, k, W: vw * k, H: vh * k };
  }
  const px = (x, y) => [(x - view.x0) * view.k, (y - view.y0) * view.k];

  function bonnieAt([x, y]) { return `translate(${x}px,${y}px)`; }
  function clubName() {
    const name = S.hasName ? `${S.childName}'s Clubhouse` : 'Meadow Clubhouse';
    const fs = ART.SIGN, est = name.length * fs * .56, fit = est > 156 ? ` textLength="156" lengthAdjust="spacingAndGlyphs"` : '';
    return `<text x="320" y="352" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="${fs}" fill="${C.woodInk}"${fit}>${M.ui.esc(name)}</text>`;
  }
  function hitBtn(id, cls, [x, y, w, h], label) {
    const [l, t] = px(x, y);
    return `<button class="ph-hit ${cls}" id="${id}" style="left:${l.toFixed(1)}px;top:${t.toFixed(1)}px;width:${Math.max(44, w * view.k).toFixed(1)}px;height:${Math.max(44, h * view.k).toFixed(1)}px" aria-label="${M.ui.esc(label)}"></button>`;
  }
  function label(x, y, icon, text, maxW) {
    const [l, t] = px(x, y);
    return `<div class="ph-label" style="left:${l.toFixed(1)}px;top:${t.toFixed(1)}px;max-width:${maxW ? (maxW * view.k).toFixed(0) + 'px' : 'none'}" aria-hidden="true">${icons[icon] || ''}<span>${M.ui.esc(text)}</span></div>`;
  }

  function draw() {
    const asking = !$('nameCard').hidden || !$('playerCard').hidden;
    document.body.classList.add('ph-on');
    document.body.classList.toggle('ph-asking', asking);
    let root = document.querySelector('.ph');
    if (!root) { root = document.createElement('div'); root.className = 'ph'; document.querySelector('.wrap').appendChild(root); }
    if (asking) { root.innerHTML = ''; return; }
    layout(); busy = false; at = DOOR;
    const games = CONFIG.GAMES, walk = M.walkInfo();
    const wk = games.map(g => g.progress ? weekly(g) : null);
    const vb = `${view.x0.toFixed(1)} ${view.y0.toFixed(1)} ${view.vw.toFixed(1)} ${view.vh.toFixed(1)}`;
    const theme = document.body.dataset.theme || 'day';
    const gameLabel = i => `Play ${games[i].name}: ${games[i].sub}.${wk[i] && wk[i].say ? ' ' + wk[i].say : ''}`;
    const walkLabel = `Bonnie's Walk: ${walk.walkedToday ? 'another walk?' : '5 quick questions.'}${walk.streak >= 2 ? ` ${walk.streak} days in a row!` : ''}`;
    const tag = (id, icon, lab, hidden) => `<button class="ph-tag" id="${id}" aria-label="${M.ui.esc(lab)}"${hidden ? ' hidden' : ''}>${icons[icon]}</button>`;
    root.innerHTML = `
      <div class="ph-bar">
        <div>${tag('phSound', soundOn ? 'soundOn' : 'soundOff', soundOn ? 'Sound is on. Turn it off' : 'Sound is off. Turn it on')}${tag('phPlayers', 'players', 'Switch player', $('switchPlayer').hidden)}${tag('phName', 'pencil', 'Change name', $('changeName').hidden)}</div>
        <div>${tag('phGrown', 'key', 'Grown-ups')}</div>
      </div>
      <div class="ph-stage" style="--k:${view.k.toFixed(3)};width:${view.W.toFixed(1)}px;height:${view.H.toFixed(1)}px;top:${Math.max(0, (innerHeight - view.H) / 2).toFixed(0)}px">
        <svg viewBox="${vb}" aria-hidden="true">${ART.scene(theme)}</svg>
        <svg viewBox="${vb}" aria-hidden="true">${clubName()}
          <g id="phBonnie" style="transform:${bonnieAt(at)}"><g>${A.bonnie(0, 0, BONNIE_K)}</g></g></svg>
        <h1 class="sr">${M.ui.esc(document.getElementById('title').textContent)}</h1>
        ${hitBtn('phBonnieBtn', 'bonnie-hit', [at[0] - 40, at[1] - 78, 80, 80], 'Bonnie the dog. Tap to tickle her!')}
        ${hitBtn('phMaths', 'game', PLACES.maths.hit, gameLabel(0))}
        ${hitBtn('phWords', 'game', PLACES.words.hit, gameLabel(1))}
        ${hitBtn('phWalk', '', PLACES.walk.hit, walkLabel)}
        ${hitBtn('phShop', '', PLACES.shop.hit, `Bonnie's Bone Shop. You have ${S.bones} ${S.bones === 1 ? 'bone' : 'bones'}.`)}
        ${hitBtn('phHouse', 'house', PLACES.house.hit, 'The clubhouse. Hear Bonnie again')}
        ${wk[0] ? label(188, 704, wk[0].icon, wk[0].text) : ''}
        ${wk[1] ? label(452, 704, wk[1].icon, wk[1].text) : ''}
        ${label(478, 514, 'bone', String(S.bones))}
        ${walk.streak >= 2 ? label(162, 372, 'paw', `${walk.streak} days in a row!`, 180) : ''}
        <div class="ph-bubble" id="phBubble" style="top:${(64 - Math.max(0, (innerHeight - view.H) / 2)).toFixed(0)}px"><span class="face" aria-hidden="true">${M.ui.bonnieSVG()}</span><span id="phSays" aria-live="polite"></span></div>
      </div>`;
    bubble($('say').textContent);
    root.querySelectorAll('.ph-label').forEach(l => { const r = l.getBoundingClientRect(), sr = l.parentNode.getBoundingClientRect(), lim = Math.min(sr.right, innerWidth) - 8;
      if (r.right > lim) l.style.left = (parseFloat(l.style.left) - (r.right - lim)) + 'px'; else if (r.left < Math.max(sr.left, 0) + 8) l.style.left = (parseFloat(l.style.left) + Math.max(sr.left, 0) + 8 - r.left) + 'px'; });
    wire();
  }

  /* Bonnie's words: a speech box in the sky under the top buttons, with her face, so it never covers a place. */
  function bubble(text) { const b = $('phSays'); if (b) b.textContent = text; }

  function wire() {
    $('phSound').onclick = () => $('soundBtn').click();      // index.html turns the sound on or off, then render() redraws this
    $('phName').onclick = () => $('changeName').click();
    $('phPlayers').onclick = () => $('switchPlayer').click();
    $('phGrown').onclick = () => { location.href = $('grownUps').getAttribute('href'); };
    $('phBonnieBtn').onclick = tickle;
    $('phHouse').onclick = () => { if (busy) return; wiggle('giggle'); const t = $('say').textContent; bubble(t); say(t); };
    $('phMaths').onclick = e => go('maths', e.currentTarget, `Let's play ${CONFIG.GAMES[0].name}!`);
    $('phWords').onclick = e => go('words', e.currentTarget, `Let's play ${CONFIG.GAMES[1].name}!`);
    $('phWalk').onclick = e => go('walk', e.currentTarget, LINES.walk);
    $('phShop').onclick = e => go('shop', e.currentTarget, LINES.shop);
    // Bonnie's first-time help: index.html put the glowing ring on its own Walk or Shop button; move it to the drawing
    [['walkBtn', 'phWalk'], ['shopBig', 'phShop']].forEach(([from, to]) => {
      if (!$(from).classList.contains('tip-ring')) return;
      const el = $(to); el.classList.add('tip-ring');
      el.addEventListener('click', () => { el.classList.remove('tip-ring'); $(from).classList.remove('tip-ring'); }, { once: true });
    });
  }
  function wiggle(cls) {
    const g = $('phBonnie'); if (!g || reduce()) return;
    g.classList.remove('giggle', 'bonnie-spin', 'hop'); void g.getBoundingClientRect(); g.classList.add(cls);
  }
  // index.html's tickle, with the wiggle on the drawn Bonnie
  function tickle(e) {
    if (busy) return;
    const btn = e.currentTarget, egg = M.ui.tickleEgg();
    wiggle(egg ? 'bonnie-spin' : 'giggle');
    if (egg) { [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, .22, 'triangle', .16, i * .12)); ['🦴', '🐾', '⭐', '💖'].forEach((h, i) => setTimeout(() => hearts(btn, h), i * 150)); }
    else { giggle(); hearts(btn); }
    const t = rand(egg ? M.LINES.tickleEgg : M.LINES.tickles).replace('{N}', S.childName);
    $('say').textContent = t; say(t, 1.4);
  }
  // Bonnie trots over, says where you're going, then index.html's goTo opens the page once she has finished
  function go(id, el, line) {
    if (busy) return; busy = true;
    const p = PLACES[id], bon = $('phBonnie');
    el.classList.add('chosen');
    $('say').textContent = line;
    if (reduce()) { bon.style.transform = bonnieAt(p.stand); at = p.stand; bubble(line); goTo(p.href, line); return; }
    $('phBubble').style.opacity = '0';
    bon.classList.add('hop'); bon.style.transform = bonnieAt(p.stand);
    goTo(p.href, line); // speaks now; opens the page when she's quiet (never before .65s, never after 3s)
    setTimeout(() => { at = p.stand; bubble(line); $('phBubble').style.opacity = '1'; }, 700);
  }

  /* ---------- fitting into index.html without changing it ---------- */
  function install() {
    document.head.insertAdjacentHTML('beforeend', `<style id="ph-css">${CSS}</style>`);
    const oldRender = window.render;
    window.render = function () { const r = oldRender.apply(this, arguments); draw(); return r; };
    // Bonnie's words change (greet, a tickle, a new name): keep the bubble in step
    new MutationObserver(() => { if (!busy) bubble($('say').textContent); }).observe($('say'), { childList: true, characterData: true, subtree: true });
    let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(draw, 150); });
    // coming back with the Back button: the page is restored mid-trot, so draw it fresh
    addEventListener('pageshow', e => { if (e.persisted) draw(); });
    draw();
  }

  /* ---------- checks (selftest=1) ---------- */
  async function selftest() {
    const out = [], ok = (name, pass, detail = '') => out.push({ name, pass: !!pass, detail });
    const wait = ms => new Promise(r => setTimeout(r, ms));
    await wait(300);
    const r = el => el.getBoundingClientRect();
    ok('the meadow is showing', !!document.querySelector('.ph-stage'));
    const places = ['phMaths', 'phWords', 'phWalk', 'phShop', 'phBonnieBtn'].map($);
    ok('the two games, the Walk, the shop and Bonnie are all tappable', places.every(Boolean));
    const targets = [...document.querySelectorAll('.ph-hit, .ph-tag:not([hidden])')];
    const small = targets.filter(b => r(b).width < 44 || r(b).height < 44);
    ok('every tap target is at least 44 × 44', !small.length, small.map(b => b.getAttribute('aria-label')).join(', '));
    ok('every tap target has a VoiceOver name', targets.every(b => (b.getAttribute('aria-label') || '').length > 4));
    const vis = el => { const b = r(el); return b.left >= -1 && b.top >= -1 && b.right <= innerWidth + 1 && b.bottom <= innerHeight + 1; };
    const off = places.concat([...document.querySelectorAll('.ph-label')]).filter(el => !vis(el));
    ok('it all fits on one screen, with no scrolling', !off.length && document.documentElement.scrollHeight <= innerHeight + 1 && document.documentElement.scrollWidth <= innerWidth + 1,
      off.map(el => el.id || el.textContent).join(', '));
    const main = ['phMaths', 'phWords', 'phWalk', 'phShop'].map($);
    const overlap = main.some((a, i) => main.some((b, j) => j > i && r(a).left < r(b).right - 2 && r(b).left < r(a).right - 2 && r(a).top < r(b).bottom - 2 && r(b).top < r(a).bottom - 2));
    ok('places do not overlap each other', !overlap);
    const bar = [...document.querySelectorAll('.ph-tag:not([hidden])')].map(r), under = main.filter(el => bar.some(b => r(el).top < b.bottom - 4 && r(el).left < b.right && b.left < r(el).right));
    ok('the top buttons do not cover a place', !under.length, under.map(el => el.id).join(', '));
    const nameR = r(document.querySelector('.ph-stage svg:nth-of-type(2) text')), bub = r($('phBubble'));
    const covered = main.concat([{ getBoundingClientRect: () => nameR, id: 'the clubhouse name' }]).filter(el => { const a = r(el); return a.left < bub.right && bub.left < a.right && a.top < bub.bottom && bub.top < a.bottom; });
    ok("Bonnie's words cover no place, nor the clubhouse name", !covered.length, covered.map(el => el.id).join(', '));
    const small16 = [...document.querySelectorAll('.ph-label, #phSays')].filter(el => parseFloat(getComputedStyle(el).fontSize) < 16);
    ok('words a child reads are 16px or more', !small16.length);
    const signK = view.k * ART.SIGN;
    ok('the signs (games, Walk, Shop, the name) are 16px or more', signK >= 15.9, `${signK.toFixed(1)}px`);
    ok("the clubhouse shows the player's name", !S.hasName || document.querySelector('.ph-stage svg:nth-of-type(2) text').textContent.includes(S.childName));
    ok('the bones show at the shop', [...document.querySelectorAll('.ph-label')].some(l => l.textContent.trim() === String(S.bones)));
    ok('the game names say their stars', CONFIG.GAMES.every((g, i) => { const w = weekly(g); return !w || !w.say || $(i ? 'phWords' : 'phMaths').getAttribute('aria-label').includes(w.say); }));
    ok("Bonnie's bubble says her words", $('phSays').textContent === $('say').textContent && $('say').textContent.length > 3);
    // the sound tag works through index.html's own button, and comes back drawn the other way
    const before = soundOn; $('phSound').click(); await wait(100);
    ok('the sound button works', soundOn !== before && $('phSound').getAttribute('aria-label').includes(soundOn ? 'on' : 'off'));
    $('phSound').click(); await wait(100);
    const pre = document.createElement('pre'); pre.id = 'selftest';
    pre.style.cssText = 'position:fixed;z-index:99;left:0;right:0;bottom:0;max-height:60vh;overflow:auto;margin:0;background:#fff;font:12px monospace';
    pre.textContent = JSON.stringify({ size: [innerWidth, innerHeight], k: +view.k.toFixed(2), passed: out.filter(x => x.pass).length, of: out.length, results: out }, null, 1);
    document.body.appendChild(pre);
  }

  window.ProtoHub = { draw, PLACES, selftest };
  install();
  if (Q.get('selftest')) selftest();
})();
