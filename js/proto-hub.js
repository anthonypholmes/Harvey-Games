/* Clubhouse meadow PROTOTYPE (not part of the game yet).
 *
 * The Clubhouse page drawn as one illustrated meadow that fits one screen (design iteration 2, Direction B):
 * the clubhouse with the child's name, Bonnie on her patch of meadow, the Walk arch, the shop stall, and a gate for each game.
 *
 * It runs on the real Clubhouse: prototype-clubhouse.html loads index.html unchanged and adds this file at the end,
 * so every function is index.html's own. This file only draws a different screen and calls index.html's functions
 * (goTo, say, giggle, hearts, tone, render, LINES, S, soundOn, CONFIG) and its buttons (sound, change name, switch
 * player, grown-ups). The name card and "Who's playing?" card are index.html's, unchanged.
 *
 * Refinement 1 (22 November 2026): bolder game gates; Bonnie's words in a bubble beside her (a box at the top only
 * when they don't fit); a calmer lower half; each game's stars on a wooden tag hanging from its gate; the top
 * buttons say what they do; every place shows a gold ring and dips when pressed.
 *
 * Page options (prototype-clubhouse.html?…):
 *   view=old     the current Clubhouse, unchanged
 *   words=…      where the Meadow Words gate goes (default meadow-words.html)
 *   maths=…      where the Meadow Maths gate goes (default prototype-maths-map.html, the map prototype)
 *   selftest=1   run the checks and print the results on the page
 */
(function () {
  const Q = new URLSearchParams(location.search);
  const A = window.ProtoArt, ART = window.ProtoHubArt, M = window.Meadow, C = A.C, AT = ART.AT;
  const $ = id => document.getElementById(id);
  const esc = M.ui.esc;
  const reduce = () => M.ui.reduceMotion();

  /* Tap areas (drawing units [x, y, w, h]: the drawing is 640 × 1000) and where Bonnie stands before the page opens. */
  const PLACES = {
    maths: { hit: [96, 636, 190, 210], stand: [AT.maths[0], AT.maths[1] + 14], href: Q.get('maths') || 'prototype-maths-map.html', game: 0 },
    words: { hit: [354, 636, 190, 210], stand: [AT.words[0], AT.words[1] + 14], href: Q.get('words') || 'meadow-words.html', game: 1 },
    walk: { hit: [94, 352, 116, 136], stand: [212, 490], href: 'bonnies-walk.html' },
    shop: { hit: [428, 340, 118, 164], stand: [418, 494], href: 'meadow-words.html#shop' },
  };
  const HOUSE = [226, 214, 188, 182];
  // what must always be on screen: from the clubhouse flag to the foot of the gates
  const NEED = [92, 160, 456, 690];
  const BONNIE_K = .62, MOUTH = [AT.bonnie[0] + 18, AT.bonnie[1] - 34];

  let view = null, at = AT.bonnie, busy = false, talk = 'near';

  /* ---------- what to show, from the save ---------- */
  // Each game's stars, as on the current Clubhouse card: new stars this week, or all mastered. A child who hasn't
  // started a game yet is told where to start; one who has, but not this week, is welcomed back.
  function progress(g) {
    if (!g.progress) return null;
    const { earned, possible } = M.starSummary(g.progress);
    if (!possible) return null;
    if (earned >= possible) return { icon: 'trophy', lines: ['All stars!'], say: 'Every star won!' };
    const n = M.starsThisWeek(g.progress);
    if (n) return { icon: 'star', lines: [`${n} new ${n === 1 ? 'star' : 'stars'}`, 'this week'], say: `${n} new ${n === 1 ? 'star' : 'stars'} this week.` };
    if (!earned) return { icon: 'sparkle', lines: ['New!', 'Start here'], say: 'New! Start here.' };
    return { icon: 'starOff', lines: ['Ready when', 'you are!'], say: 'Ready when you are.' };
  }
  const icons = {
    star: `<svg viewBox="-10 -10 20 20" aria-hidden="true">${A.star(0, 0, 9, true)}</svg>`,
    starOff: `<svg viewBox="-10 -10 20 20" aria-hidden="true">${A.star(0, 0, 9, false)}</svg>`,
    sparkle: `<svg viewBox="-11 -11 22 22" aria-hidden="true"><path d="M0 -10 Q2 -2 10 0 Q2 2 0 10 Q-2 2 -10 0 Q-2 -2 0 -10Z" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
    trophy: `<svg viewBox="-11 -11 22 22" aria-hidden="true"><path d="M-7 -9 h14 v5 a7 7 0 0 1 -14 0 z" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1.5"/><path d="M-7 -7 h-3 a3 4 0 0 0 4 6 M7 -7 h3 a3 4 0 0 1 -4 6" fill="none" stroke="${C.goldDk}" stroke-width="1.5"/><rect x="-2" y="2" width="4" height="4" fill="${C.goldDk}"/><rect x="-6" y="6" width="12" height="4" rx="1.5" fill="${C.woodDk}"/></svg>`,
    paw: `<svg viewBox="-12 -13 24 24" aria-hidden="true">${A.paw(0, 0, 1, C.woodInk)}</svg>`,
    bone: `<svg viewBox="-22 -14 44 28" aria-hidden="true">${A.bone(0, 0, 1)}</svg>`,
    soundOn: `<svg viewBox="-14 -12 28 24" aria-hidden="true"><path d="M-11 -4 h5 l7 -6 v20 l-7 -6 h-5 z" fill="${C.woodInk}"/><path d="M5 -5 q4 5 0 10 M8 -9 q8 9 0 18" fill="none" stroke="${C.woodInk}" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    soundOff: `<svg viewBox="-14 -12 28 24" aria-hidden="true"><path d="M-11 -4 h5 l7 -6 v20 l-7 -6 h-5 z" fill="${C.woodInk}"/><path d="M5 -5 l8 10 M13 -5 l-8 10" stroke="${C.berry}" stroke-width="2.6" stroke-linecap="round"/></svg>`,
    pencil: `<svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="M-8 8 l2 -7 l11 -11 l5 5 l-11 11 z" fill="${C.gold}" stroke="${C.woodInk}" stroke-width="2" stroke-linejoin="round"/><path d="M-8 8 l2 -7 l5 5 z" fill="${C.woodInk}"/></svg>`,
    person: `<svg viewBox="-12 -12 24 24" aria-hidden="true"><circle cx="0" cy="-4" r="5.5" fill="${C.woodInk}"/><path d="M-10 11 a10 10 0 0 1 20 0 z" fill="${C.woodInk}"/></svg>`,
    players: `<svg viewBox="-14 -12 28 24" aria-hidden="true"><circle cx="-5" cy="-4" r="4.5" fill="${C.woodInk}"/><path d="M-13 10 a8 8 0 0 1 16 0 z" fill="${C.woodInk}"/><circle cx="6" cy="-5" r="4" fill="${C.berry}"/><path d="M0 9 a7 7 0 0 1 13 0 z" fill="${C.berry}"/></svg>`,
    lock: `<svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="M-6 -1 v-4 a6 6 0 0 1 12 0 v4" fill="none" stroke="${C.woodInk}" stroke-width="2.6"/><rect x="-9" y="-1" width="18" height="13" rx="3" fill="${C.woodInk}"/><circle cx="0" cy="5" r="2" fill="${C.woodLt}"/></svg>`,
    caret: `<svg viewBox="-6 -4 12 8" aria-hidden="true" class="caret"><path d="M-5 -3 L0 3 L5 -3" fill="none" stroke="${C.woodInk}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
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
  .ph-stage>svg{position:absolute;left:0;top:0;width:100%;height:100%;display:block;overflow:visible}

  /* the top buttons: wooden tags that say what they do */
  .ph-bar{position:absolute;z-index:7;left:0;right:0;top:0;display:flex;justify-content:space-between;gap:6px;padding:calc(8px + env(safe-area-inset-top)) 8px 0;pointer-events:none}
  .ph-bar>div{display:flex;gap:6px;pointer-events:auto;position:relative}
  .ph-tag{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:46px;padding:0 10px 0 18px;border:0;font:700 16px Fredoka,system-ui,sans-serif;color:${C.woodInk};cursor:pointer;white-space:nowrap;
    background:${C.woodLt};clip-path:polygon(12px 0,100% 0,100% 100%,12px 100%,0 50%);box-shadow:inset 0 -4px 0 rgba(154,106,58,.55);filter:drop-shadow(0 2px 0 ${C.woodDk})}
  .ph-bar>div:last-child .ph-tag{padding:0 18px 0 10px;clip-path:polygon(0 0,calc(100% - 12px) 0,100% 50%,calc(100% - 12px) 100%,0 100%)}
  .ph-tag svg{width:22px;height:22px;flex:none}
  .ph-tag svg.caret{width:11px;height:8px}
  .ph-tag .nm{max-width:clamp(44px,calc(100vw - 316px),170px);overflow:hidden;text-overflow:ellipsis}
  .ph-tag:active{transform:translateY(2px);box-shadow:inset 0 -2px 0 rgba(154,106,58,.55)}
  .ph-tag:focus-visible{outline:3px solid ${C.goldDk};outline-offset:2px}
  @media (min-width:700px){.ph-bar{padding:calc(12px + env(safe-area-inset-top)) 14px 0}.ph-bar>div{gap:8px}.ph-tag{min-height:54px;font-size:20px;gap:7px}.ph-tag svg{width:28px;height:28px}.ph-tag svg.caret{width:13px;height:9px}}
  .ph-menu{position:absolute;top:calc(100% + 8px);right:0;z-index:8;display:grid;gap:6px;padding:8px;border-radius:12px;background:${C.paper};border:2px solid ${C.woodDk};box-shadow:0 4px 0 rgba(94,59,32,.3);min-width:200px}
  .ph-menu[hidden]{display:none}
  .ph-menu button{display:flex;align-items:center;gap:10px;min-height:48px;padding:0 14px;border:0;border-radius:9px;background:${C.woodLt};box-shadow:inset 0 -3px 0 rgba(154,106,58,.45);font:700 17px Fredoka,system-ui,sans-serif;color:${C.woodInk};cursor:pointer;text-align:left}
  .ph-menu button svg{width:22px;height:22px;flex:none}
  .ph-menu button:focus-visible{outline:3px solid ${C.goldDk};outline-offset:1px}

  /* the places: invisible buttons over the drawing; the drawing itself dips and shows a gold ring */
  .ph-hit{position:absolute;z-index:3;border:0;margin:0;padding:0;background:transparent;border-radius:28px;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
  .ph-hit:focus-visible{outline:4px solid ${C.goldDk};outline-offset:-4px}
  .ph-hit.house{z-index:2}
  .ph-hit.bonnie-hit{border-radius:50%;z-index:5}
  .ph-hit.tip-ring{outline-offset:-2px}
  .place{transition:transform .12s ease-out;transform-box:fill-box;transform-origin:50% 100%}
  .place .halo{transition:opacity .15s}
  .place.on .halo{opacity:.32}.place.on .halo[fill="none"]{opacity:.95}
  .place.pressed{transform:translateY(3px) scale(.985)}
  .place.tip .halo[fill="none"]{animation:phHalo 1.4s ease-in-out infinite}
  @keyframes phHalo{50%{opacity:.35}}
  .gate .sign{transform-box:fill-box;transform-origin:50% 0;animation:phSway 6s ease-in-out infinite}
  #art-words .sign{animation-delay:-3s}
  @keyframes phSway{0%,80%,100%{transform:none}86%{transform:rotate(-1.6deg)}92%{transform:rotate(1.2deg)}}
  .gate.chosen .sign{animation:phBounce .5s ease-out}
  @keyframes phBounce{40%{transform:translateY(-8px)}70%{transform:translateY(2px)}}

  /* things a child reads: bones, the walk streak, each game's stars */
  .ph-label{position:absolute;z-index:4;transform:translateX(-50%);pointer-events:none;display:flex;align-items:center;justify-content:center;gap:5px;white-space:nowrap;
    padding:4px 10px 5px;border-radius:9px;background:${C.paper};box-shadow:0 2px 0 #C9B48E;font:700 max(16px,calc(14px * var(--k,1)))/1.15 Fredoka,system-ui,sans-serif;color:${C.ink}}
  .ph-label.up{transform:translate(-50%,-100%)}
  .ph-label svg{width:20px;height:20px;flex:none}
  .ph-prog{position:absolute;z-index:4;transform:translateX(-50%);pointer-events:none;display:flex;align-items:center;gap:7px;padding:6px 12px 7px 9px;border-radius:10px;
    background:${C.woodLt};border:2px solid ${C.woodDk};box-shadow:0 3px 0 rgba(94,59,32,.35);color:${C.woodInk};font:700 max(16px,calc(14.5px * var(--k,1)))/1.15 Fredoka,system-ui,sans-serif;white-space:nowrap}
  .ph-prog::before,.ph-prog::after{content:"";position:absolute;bottom:100%;width:2px;height:calc(10px * var(--k,1));background:${C.woodDk}}
  .ph-prog::before{left:22%}.ph-prog::after{right:22%}
  .ph-prog svg{width:calc(24px * var(--k,1));height:calc(24px * var(--k,1));min-width:22px;min-height:22px;flex:none}
  .ph-prog span{display:block}

  /* Bonnie's words: a bubble beside her, its tail pointing at her; a box with her face at the top when they don't fit */
  .ph-say{position:absolute;z-index:4;pointer-events:none;padding:9px 14px 10px;border-radius:16px;background:${C.paper};border:2px solid #D9C7A6;
    font:400 max(17px,calc(15px * var(--k,1)))/1.3 Andika,system-ui,sans-serif;color:${C.ink};box-shadow:0 3px 0 rgba(154,106,58,.25);transition:opacity .25s}
  .ph-say.small{font-size:16px}
  .ph-say .face{display:none}
  .ph-say.near::before{content:"";position:absolute;left:-14px;top:var(--tail,24px);width:0;height:0;border:11px solid transparent;border-right:14px solid #D9C7A6;border-left:0;transform:translateY(-50%)}
  .ph-say.near::after{content:"";position:absolute;left:-10px;top:var(--tail,24px);width:0;height:0;border:9px solid transparent;border-right:11px solid ${C.paper};border-left:0;transform:translateY(-50%)}
  .ph-say.away::before,.ph-say.away::after{display:none}
  .ph-say.top{display:flex;align-items:center;gap:10px;padding:8px 16px 9px 8px;border-radius:18px}
  .ph-say.top .face{display:block;width:46px;height:46px;flex:none;border-radius:50%;background:#E6F3D8;overflow:hidden}
  .ph-say.top .face svg{width:100%;height:auto;transform:translateY(4px) scale(1.5);transform-origin:50% 30%}
  #phBonnie{transition:transform .7s cubic-bezier(.45,.05,.3,1)}
  #phBonnie.hop>g{animation:phHop .35s ease-in-out 2}
  #phBonnie.giggle>g{animation:phWig .9s ease-in-out}
  #phBonnie.bonnie-spin>g{animation:phSpin 1.2s cubic-bezier(.3,1.2,.5,1);transform-box:fill-box;transform-origin:50% 100%}
  @keyframes phHop{50%{transform:translateY(-14px)}}
  @keyframes phWig{20%,60%{transform:rotate(-6deg)}40%,80%{transform:rotate(6deg)}}
  @keyframes phSpin{35%{transform:translateY(-40px) rotate(180deg)}70%{transform:translateY(-10px) rotate(360deg)}100%{transform:none}}
  @media (prefers-reduced-motion:reduce){#phBonnie,.ph-say,.place,.place .halo{transition:none}#phBonnie>g,.gate .sign,.place .halo{animation:none!important}.place.pressed{transform:none}}
  .ph .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`;

  /* Fit the drawing to the screen: everything in NEED shows, as big as it can be, and the rest of the screen
     is filled with more of the meadow. An iPad shows nearly all of it; a phone shows the middle. */
  function layout() {
    const W = document.documentElement.clientWidth || innerWidth, H = innerHeight, bar = 62;
    const k = Math.min(W / NEED[2], (H - bar) / NEED[3], 1.35);
    const vw = Math.min(W / k, ART.W), vh = Math.min(H / k, ART.H);
    let x0 = NEED[0] + NEED[2] / 2 - vw / 2, y0 = NEED[1] - bar / k - (vh - NEED[3] - bar / k) / 2;
    x0 = Math.max(0, Math.min(x0, ART.W - vw)); y0 = Math.max(0, Math.min(y0, ART.H - vh));
    view = { x0, y0, vw, vh, k, W: vw * k, H: vh * k, top: Math.max(0, (H - vh * k) / 2) };
  }
  const px = (x, y) => [(x - view.x0) * view.k, (y - view.y0) * view.k];

  const bonnieAt = ([x, y]) => `translate(${x}px,${y}px)`;
  function clubName() {
    const name = S.hasName ? `${S.childName}'s Clubhouse` : 'Meadow Clubhouse';
    const fs = ART.SIGN, est = name.length * fs * .56, fit = est > 156 ? ` textLength="156" lengthAdjust="spacingAndGlyphs"` : '';
    return `<text id="phName" x="${AT.house[0]}" y="${AT.house[1] - 101}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="${fs}" fill="${C.woodInk}"${fit}>${esc(name)}</text>`;
  }
  function hitBtn(id, cls, [x, y, w, h], label, place) {
    const [l, t] = px(x, y);
    return `<button class="ph-hit ${cls}" id="${id}"${place ? ` data-place="${place}"` : ''} style="left:${l.toFixed(1)}px;top:${t.toFixed(1)}px;width:${Math.max(44, w * view.k).toFixed(1)}px;height:${Math.max(44, h * view.k).toFixed(1)}px" aria-label="${esc(label)}"></button>`;
  }
  function label(x, y, icon, text, up) {
    const [l, t] = px(x, y);
    return `<div class="ph-label${up ? ' up' : ''}" style="left:${l.toFixed(1)}px;top:${t.toFixed(1)}px" aria-hidden="true">${icons[icon] || ''}<span>${esc(text)}</span></div>`;
  }
  function progTag(id, p) {
    const [l, t] = px(AT[id][0], AT[id][1] - 100);
    return `<div class="ph-prog" id="phProg-${id}" style="left:${l.toFixed(1)}px;top:${t.toFixed(1)}px" aria-hidden="true">${icons[p.icon]}<div>${p.lines.map(s => `<span>${esc(s)}</span>`).join('')}</div></div>`;
  }

  function draw() {
    const asking = !$('nameCard').hidden || !$('playerCard').hidden;
    document.body.classList.add('ph-on');
    document.body.classList.toggle('ph-asking', asking);
    let root = document.querySelector('.ph');
    if (!root) { root = document.createElement('div'); root.className = 'ph'; document.querySelector('.wrap').appendChild(root); }
    if (asking) { root.innerHTML = ''; return; }
    layout(); busy = false; at = AT.bonnie;
    const games = CONFIG.GAMES, walk = M.walkInfo(), art = ART.places();
    const pg = { maths: progress(games[0]), words: progress(games[1]) };
    const vb = `${view.x0.toFixed(1)} ${view.y0.toFixed(1)} ${view.vw.toFixed(1)} ${view.vh.toFixed(1)}`;
    const theme = document.body.dataset.theme || 'day';
    const gameLabel = id => { const g = games[PLACES[id].game]; return `Play ${g.name}: ${g.sub}.${pg[id] ? ' ' + pg[id].say : ''}`; };
    const walkLabel = `Bonnie's Walk: ${walk.walkedToday ? 'another walk?' : '5 quick questions.'}${walk.streak >= 2 ? ` ${walk.streak} days in a row!` : ''}`;
    const players = !$('switchPlayer').hidden;
    root.innerHTML = `
      <div class="ph-bar">
        <div><button class="ph-tag" id="phSound" aria-label="${soundOn ? 'Sound is on. Turn it off' : 'Sound is off. Turn it on'}">${icons[soundOn ? 'soundOn' : 'soundOff']}<span aria-hidden="true">${soundOn ? 'On' : 'Off'}</span></button></div>
        <div>
          <button class="ph-tag" id="phMe" aria-haspopup="true" aria-expanded="false" aria-controls="phMenu" aria-label="${esc(S.childName)}: change name${players ? ' or switch player' : ''}">${icons[players ? 'players' : 'person']}<span class="nm" aria-hidden="true">${esc(S.childName)}</span>${icons.caret}</button>
          <button class="ph-tag" id="phGrown" aria-label="Grown-ups: settings, prizes and progress">${icons.lock}<span aria-hidden="true">Grown-ups</span></button>
          <div class="ph-menu" id="phMenu" hidden>
            <button id="phRename">${icons.pencil}Change name</button>
            ${players ? `<button id="phPlayers">${icons.players}Switch player</button>` : ''}
          </div>
        </div>
      </div>
      <div class="ph-stage" style="--k:${view.k.toFixed(3)};width:${view.W.toFixed(1)}px;height:${view.H.toFixed(1)}px;top:${view.top.toFixed(0)}px">
        <svg viewBox="${vb}" aria-hidden="true">${ART.scene(theme)}</svg>
        <svg viewBox="${vb}" aria-hidden="true" id="phPlaces">${art.walk}${art.shop}${art.maths}${art.words}${clubName()}
          <g id="phBonnie" style="transform:${bonnieAt(at)}"><g>${A.bonnie(0, 0, BONNIE_K)}</g></g></svg>
        <h1 class="sr">${esc($('title').textContent)}</h1>
        <div class="ph-say near" id="phSay"><span class="face" aria-hidden="true">${M.ui.bonnieSVG()}</span><span id="phSays" aria-live="polite"></span></div>
        ${hitBtn('phBonnieBtn', 'bonnie-hit', [at[0] - 40, at[1] - 80, 80, 84], 'Bonnie the dog. Tap to tickle her!')}
        ${hitBtn('phMaths', 'place', PLACES.maths.hit, gameLabel('maths'), 'maths')}
        ${hitBtn('phWords', 'place', PLACES.words.hit, gameLabel('words'), 'words')}
        ${hitBtn('phWalk', 'place', PLACES.walk.hit, walkLabel, 'walk')}
        ${hitBtn('phShop', 'place', PLACES.shop.hit, `Bonnie's Bone Shop. You have ${S.bones} ${S.bones === 1 ? 'bone' : 'bones'}.`, 'shop')}
        ${hitBtn('phHouse', 'house', HOUSE, 'The clubhouse. Hear Bonnie again')}
        ${pg.maths ? progTag('maths', pg.maths) : ''}
        ${pg.words ? progTag('words', pg.words) : ''}
        ${label(AT.shop[0], AT.shop[1] + 6, 'bone', String(S.bones))}
        ${walk.streak >= 2 ? label(AT.walk[0], AT.walk[1] - 104, 'paw', `${walk.streak} days in a row!`, true) : ''}
      </div>`;
    keepOnScreen(root);
    bubble($('say').textContent);
    wire();
  }
  function keepOnScreen(root) {
    root.querySelectorAll('.ph-label, .ph-prog').forEach(l => {
      const r = l.getBoundingClientRect(), lo = 8, hi = innerWidth - 8;
      if (r.right > hi) l.style.left = (parseFloat(l.style.left) - (r.right - hi)) + 'px';
      else if (r.left < lo) l.style.left = (parseFloat(l.style.left) + lo - r.left) + 'px';
    });
  }

  /* Bonnie's words. First choice: a bubble in the space beside her (ART.AT.talk), its tail pointing at her mouth.
     If the words don't fit there (a long line on a small phone), a slightly smaller size; then a box under the top
     buttons with her face, so the words are always readable and never cover a place. */
  function bubble(text) {
    const b = $('phSay'), t = $('phSays'); if (!b) return;
    t.textContent = text;
    const [l, top] = px(AT.talk[0], AT.talk[1]), [r, bottom] = px(AT.talk[2], AT.talk[3]);
    const room = { w: Math.min(r, view.W - 8) - l, h: bottom - top };
    const away = b.classList.contains('away') ? ' away' : '';
    const place = mode => {
      b.className = 'ph-say ' + mode + away; b.style.cssText = '';
      if (mode === 'top') { b.style.left = '50%'; b.style.transform = 'translateX(-50%)'; b.style.width = 'max-content'; b.style.maxWidth = `min(440px, ${view.W - 24}px)`; b.style.top = Math.max(8, 64 - view.top) + 'px'; return true; }
      b.style.left = l + 'px'; b.style.top = top + 'px'; b.style.maxWidth = room.w + 'px';
      return b.offsetHeight <= room.h && b.offsetWidth <= room.w + 1;
    };
    talk = place('near') ? 'near' : place('near small') ? 'near' : (place('top'), 'top');
    if (talk === 'near') {
      // centre the bubble on Bonnie's mouth, inside the space; the tail points at her mouth
      const [, my] = px(...MOUTH), h = b.offsetHeight;
      const y = Math.max(top, Math.min(my - h / 2, bottom - h));
      b.style.top = y + 'px';
      b.style.setProperty('--tail', Math.max(16, Math.min(my - y, h - 16)) + 'px');
    }
  }

  /* ---------- taps ---------- */
  function wire() {
    $('phSound').onclick = () => $('soundBtn').click();      // index.html turns the sound on or off, then render() redraws this
    $('phGrown').onclick = () => { location.href = $('grownUps').getAttribute('href'); };
    const menu = $('phMenu'), me = $('phMe');
    const closeMenu = () => { menu.hidden = true; me.setAttribute('aria-expanded', 'false'); };
    me.onclick = e => { e.stopPropagation(); const open = menu.hidden; menu.hidden = !open; me.setAttribute('aria-expanded', String(open)); if (open) menu.querySelector('button').focus(); };
    menu.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); me.focus(); } });
    document.addEventListener('pointerdown', e => { if (!menu.hidden && !e.target.closest('#phMenu, #phMe')) closeMenu(); }, { capture: true });
    $('phRename').onclick = () => { closeMenu(); $('changeName').click(); };
    if ($('phPlayers')) $('phPlayers').onclick = () => { closeMenu(); $('switchPlayer').click(); };
    $('phBonnieBtn').onclick = tickle;
    $('phHouse').onclick = () => { if (busy) return; wiggle('giggle'); const t = $('say').textContent; bubble(t); say(t); };
    const lines = { maths: `Let's play ${CONFIG.GAMES[0].name}!`, words: `Let's play ${CONFIG.GAMES[1].name}!`, walk: LINES.walk, shop: LINES.shop };
    document.querySelectorAll('.ph-hit.place').forEach(btn => {
      const id = btn.dataset.place, art = () => $('art-' + id);
      const on = v => art().classList.toggle('on', !!v || btn.classList.contains('tip-ring') || art().classList.contains('chosen'));
      btn.addEventListener('pointerdown', () => { if (busy) return; art().classList.add('pressed'); on(true); tone(620, .06, 'sine', .07); });
      const up = () => { art().classList.remove('pressed'); on(btn.matches(':focus-visible')); };
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, up));
      btn.addEventListener('focus', () => on(btn.matches(':focus-visible'))); btn.addEventListener('blur', () => on(false));
      btn.onclick = () => go(id, lines[id]);
    });
    // Bonnie's first-time help: index.html put the glowing ring on its own Walk or Shop button; show it on the drawing
    [['walkBtn', 'walk'], ['shopBig', 'shop']].forEach(([from, id]) => {
      if (!$(from).classList.contains('tip-ring')) return;
      const btn = $(id === 'walk' ? 'phWalk' : 'phShop'), art = $('art-' + id);
      btn.classList.add('tip-ring'); art.classList.add('tip', 'on');
      btn.addEventListener('click', () => { btn.classList.remove('tip-ring'); art.classList.remove('tip'); $(from).classList.remove('tip-ring'); }, { once: true });
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
  // the place lights up, Bonnie trots over and says where you're going, then index.html's goTo opens the page once she has finished
  function go(id, line) {
    if (busy) return; busy = true;
    const p = PLACES[id], bon = $('phBonnie'), art = $('art-' + id);
    art.classList.remove('pressed'); art.classList.add('chosen', 'on');
    $('say').textContent = line;
    $('phSay').classList.add('away'); bubble(line);
    if (reduce()) { bon.style.transform = bonnieAt(p.stand); at = p.stand; goTo(p.href, line); return; }
    bon.classList.add('hop'); bon.style.transform = bonnieAt(p.stand);
    goTo(p.href, line); // speaks now; opens the page when she's quiet (never before .65s, never after 3s)
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
    const out = [], ok = (name, pass, detail = '') => out.push({ name, pass: !!pass, detail: String(detail) });
    const wait = ms => new Promise(r => setTimeout(r, ms));
    await wait(300);
    const r = el => el.getBoundingClientRect();
    const cross = (a, b) => a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2;
    ok('the meadow is showing', !!document.querySelector('.ph-stage'));
    const main = ['phMaths', 'phWords', 'phWalk', 'phShop'].map($);
    ok('the two games, the Walk, the shop and Bonnie are all tappable', main.every(Boolean) && !!$('phBonnieBtn'));
    const targets = [...document.querySelectorAll('.ph-hit, .ph-tag')];
    const small = targets.filter(b => r(b).width < 44 || r(b).height < 44);
    ok('every tap target is at least 44 × 44', !small.length, small.map(b => b.id).join(', '));
    ok('the games, Walk and shop are generous: at least 88 × 88', main.every(b => r(b).width >= 88 && r(b).height >= 88), main.map(b => `${b.id} ${r(b).width.toFixed(0)}×${r(b).height.toFixed(0)}`).join(', '));
    ok('every tap target has a VoiceOver name', targets.every(b => (b.getAttribute('aria-label') || '').length > 4));
    const vis = el => { const b = r(el); return b.left >= -1 && b.top >= -1 && b.right <= innerWidth + 1 && b.bottom <= innerHeight + 1; };
    const off = main.concat([...document.querySelectorAll('.ph-label, .ph-prog, .ph-tag, #phSay')]).filter(el => !vis(el));
    ok('it all fits on one screen, with no scrolling', !off.length && document.documentElement.scrollHeight <= innerHeight + 1 && document.documentElement.scrollWidth <= innerWidth + 1, off.map(el => el.id || el.textContent).join(', '));
    ok('places do not overlap each other', !main.some((a, i) => main.some((b, j) => j > i && cross(r(a), r(b)))));
    const bar = [...document.querySelectorAll('.ph-tag')].map(r);
    ok('the top buttons cover no place', !main.some(el => bar.some(b => cross(r(el), b))));
    const tiny = [...document.querySelectorAll('.ph-label, .ph-prog span, #phSays, .ph-tag span')].filter(el => parseFloat(getComputedStyle(el).fontSize) < 16);
    ok('words a child reads are 16px or more', !tiny.length, tiny.map(el => el.textContent).join(', '));
    ok('the signs (games, Walk, Shop, the name) are 16px or more', view.k * ART.SIGN >= 15.9, `signs ${(view.k * ART.SIGN).toFixed(1)}px, game signs ${(view.k * ART.GATE_SIGN).toFixed(1)}px`);
    ok("the clubhouse shows the player's name", !S.hasName || $('phName').textContent.includes(S.childName));
    ok('the bones show at the shop', [...document.querySelectorAll('.ph-label')].some(l => l.textContent.trim() === String(S.bones)));
    const progEl = i => $('phProg-' + (i ? 'words' : 'maths'));
    const pgOK = CONFIG.GAMES.every((g, i) => { const p = progress(g); return !p || ([...progEl(i).querySelectorAll('span')].map(s => s.textContent).join(' ') === p.lines.join(' ') && $(i ? 'phWords' : 'phMaths').getAttribute('aria-label').includes(p.say)); });
    ok("each game's stars hang from its gate, and its VoiceOver name says them", pgOK, CONFIG.GAMES.map((g, i) => progEl(i) && progEl(i).textContent.trim()).join(' | '));
    ok("each game's stars sit inside its gate's tap area", ['maths', 'words'].every(id => { const a = r($('phProg-' + id)), b = r($(id === 'maths' ? 'phMaths' : 'phWords')); return a.left >= b.left - 30 && a.right <= b.right + 30 && a.top >= b.top && a.bottom <= b.bottom; }));
    ok("Bonnie's bubble says her words", $('phSays').textContent === $('say').textContent && $('say').textContent.length > 3);
    ok("Bonnie's words sit beside her, pointing at her", talk === 'near', `${talk}: "${$('say').textContent}"`);
    const keep = main.map(el => [el.id, r(el)]).concat([['the name', r($('phName'))], ['Bonnie', r($('phBonnieBtn'))]], [...document.querySelectorAll('.ph-label, .ph-prog, .ph-tag')].map(el => [el.id || el.textContent.trim(), r(el)]));
    const covered = () => keep.filter(([, a]) => cross(a, r($('phSay')))).map(c => c[0]);
    ok("Bonnie's words cover no place, name, tag or Bonnie", !covered().length, covered().join(', '));
    // the longest thing she says here: still readable, and still covering nothing?
    const longest = [...Object.values(LINES).flat(), M.LINES.tipWalk, M.LINES.tipShop].map(fmtN).sort((a, b) => b.length - a.length)[0];
    bubble(longest);
    const longMode = talk, longCovered = covered();
    ok('her longest line is readable and covers nothing', !longCovered.length && vis($('phSay')), `${longMode}, ${longest.length} letters${longCovered.length ? ': covers ' + longCovered.join(', ') : ''}`);
    bubble($('say').textContent);
    ok('the top buttons say what they do', ['phSound', 'phMe', 'phGrown'].every(id => $(id).textContent.trim().length >= 2), ['phSound', 'phMe', 'phGrown'].map(id => $(id).textContent.trim()).join(' · '));
    $('phMe').click(); await wait(50);
    ok("tapping the name offers 'Change name'", !$('phMenu').hidden && $('phMe').getAttribute('aria-expanded') === 'true' && /Change name/.test($('phMenu').textContent) && vis($('phMenu')));
    $('phMe').click(); await wait(50);
    const before = soundOn; $('phSound').click(); await wait(100);
    ok('the sound button works, and says whether it is on', soundOn !== before && $('phSound').textContent.includes(soundOn ? 'On' : 'Off'));
    $('phSound').click(); await wait(100);
    $('phMaths').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await wait(30);
    ok('pressing a game gate lights it up and dips it', $('art-maths').classList.contains('on') && $('art-maths').classList.contains('pressed'));
    $('phMaths').dispatchEvent(new PointerEvent('pointerleave', { bubbles: true })); await wait(30);
    ok('…and lets go again', !$('art-maths').classList.contains('pressed'));
    const pre = document.createElement('pre'); pre.id = 'selftest';
    pre.style.cssText = 'position:fixed;z-index:99;left:0;right:0;bottom:0;max-height:60vh;overflow:auto;margin:0;background:#fff;font:12px monospace';
    pre.textContent = JSON.stringify({ size: [innerWidth, innerHeight], k: +view.k.toFixed(2), passed: out.filter(x => x.pass).length, of: out.length, results: out }, null, 1);
    document.body.appendChild(pre);
  }

  window.ProtoHub = { draw, PLACES, selftest, bubble };
  install();
  if (Q.get('selftest')) selftest();
})();
