/* Explorer's journal PROTOTYPE (not part of the game yet).
 *
 * The child's journal of the meadow: a stamp for every place they have visited in Meadow Maths and Meadow Words,
 * a gold seal for a place with every star, and a page of paw prints for Bonnie's walks. It opens from the clubhouse
 * in the Clubhouse meadow prototype (js/proto-hub.js): tap the clubhouse, Bonnie trots to the door and the journal opens.
 *
 * It only reads the save (stars per level, walk days) through the engine (Meadow.stars, Meadow.visibleWorlds,
 * Meadow.save.get), and saves nothing in it. It remembers which stamps the child has already seen (so a new one is
 * stamped with a thunk the first time) in its own small key beside the save, never in the save itself.
 *
 * Page options (prototype-clubhouse.html?…):
 *   #journal or journal=maths|words|walks   open the journal straight away, at that page
 *   world=<world id>                         …with that place's page open (for screenshots)
 *   newstamp=<world id>                      treat that place's stamp as new (for screenshots)
 *   journaltest=1                            run the checks and print the results on the page
 */
(function () {
  const Q = new URLSearchParams(location.search);
  if (window.MeadowLook && !window.MeadowLook.on) return; // the old look (js/meadow-look.js)
  const LINKS = (window.MeadowLook ? window.MeadowLook.pages : { club: 'prototype-clubhouse.html', maths: 'prototype-maths-map.html', words: 'prototype-words-map.html', walk: 'prototype-walk.html' });
  const M = window.Meadow, A = window.ProtoArt, C = A.C, ui = M.ui, esc = ui.esc;
  const $ = id => document.getElementById(id);
  const reduce = () => ui.reduceMotion();
  const hub = () => window.ProtoHub;
  const SEEN = 'meadow-proto-journal-seen:' + M.save.key;

  const GAMES = {
    maths: { subject: 'maths', name: 'Meadow Maths', col: '#4C7E4A', dk: '#2F5530', place: 'maths' },
    words: { subject: 'english', name: 'Meadow Words', col: '#B85C26', dk: '#7E3C16', place: 'words' },
  };
  const PAGES = [
    { id: 'maths', label: 'Maths', col: GAMES.maths.col, dk: GAMES.maths.dk },
    { id: 'words', label: 'Words', col: GAMES.words.col, dk: GAMES.words.dk },
    { id: 'walks', label: 'Walks', col: '#B5485A', dk: '#7E2E3D' },
  ];
  const short = id => id.replace(/^y2-[a-z]+-/, '');
  const save = () => M.save.get() || M.save.load();
  const pad = n => String(n).padStart(2, '0');
  const localDay = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  /* ---------- what the save says ---------- */
  function worlds(game) {
    const g = GAMES[game], shown = M.visibleWorlds(g.subject).map(w => w.id);
    return M.worlds(g.subject).filter(w => shown.includes(w.id)); // the order they sit on the map
  }
  function stateOf(w) {
    const stars = w.levels.map(L => M.stars(w.id, L.id)), got = stars.reduce((a, b) => a + b, 0), max = w.levels.length * 3;
    return { stars, got, max, played: stars.filter(Boolean).length, k: !got ? 'none' : got >= max ? 'all' : 'stamped' };
  }
  // stamps already seen: "world:stamped" and "world:all". The first time the journal opens, everything already earned counts as seen.
  function seenSet() {
    let v = null; try { v = JSON.parse(localStorage.getItem(SEEN) || 'null'); } catch (e) {}
    if (!Array.isArray(v)) { v = []; ['maths', 'words'].forEach(g => worlds(g).forEach(w => { const s = stateOf(w); if (s.k !== 'none') v.push(w.id + ':stamped'); if (s.k === 'all') v.push(w.id + ':all'); })); keepSeen(v); }
    return new Set(v);
  }
  const keepSeen = list => { try { localStorage.setItem(SEEN, JSON.stringify([...list])); } catch (e) {} };
  const isNew = (w, s, seen) => s.k !== 'none' && (Q.get('newstamp') === w.id || Q.get('newstamp') === short(w.id) || !seen.has(w.id + ':' + s.k));

  /* ---------- the stamps (each place's own ink drawing, in a 160 × 160 stamp) ---------- */
  const INNER = {
    partitioning: k => `<rect x="-24" y="2" width="6" height="20" rx="2" fill="${k}"/><circle cx="-21" cy="-10" r="17" fill="${k}"/><rect x="15" y="8" width="5" height="14" rx="2" fill="${k}"/><circle cx="17.5" cy="-2" r="12" fill="${k}"/><path d="M-38 24 H38" stroke="${k}" stroke-width="4" stroke-linecap="round"/>`,
    'number-bonds': k => `<path d="M-36 22 Q0 -22 36 22 Z" fill="${k}"/><ellipse cx="0" cy="16" rx="11" ry="9" fill="${C.paper}"/><ellipse cx="-6" cy="-24" rx="4" ry="13" fill="${k}" transform="rotate(-12 -6 -24)"/><ellipse cx="6" cy="-24" rx="4" ry="13" fill="${k}" transform="rotate(12 6 -24)"/>`,
    'number-lines': k => `<path d="M-38 14 q10 -7 19 0 t19 0 t19 0 t19 0" stroke="${k}" stroke-width="4" fill="none" stroke-linecap="round"/>${[-24, 0, 24].map(x => `<ellipse cx="${x}" cy="-4" rx="10" ry="6" fill="${k}"/>`).join('')}<path d="M-38 -22 H38 M-38 -26 v8 M0 -26 v8 M38 -26 v8" stroke="${k}" stroke-width="3" stroke-linecap="round"/>`,
    arrays: k => `<rect x="-3.5" y="6" width="7" height="18" rx="2" fill="${k}"/><circle cx="0" cy="-8" r="22" fill="${k}"/>${[-9, 0, 9].map(x => [-15, -4].map(y => `<circle cx="${x}" cy="${y}" r="3.6" fill="${C.paper}"/>`).join('')).join('')}`,
    sharing: k => `<ellipse cx="0" cy="12" rx="38" ry="13" fill="none" stroke="${k}" stroke-width="4"/><path d="M-4 12 a16 9 0 1 1 10 6 L2 12 Z" fill="${k}"/><circle cx="-18" cy="-14" r="10" fill="${k}"/><circle cx="-22" cy="-18" r="2.4" fill="${C.paper}"/><circle cx="-14" cy="-18" r="2.4" fill="${C.paper}"/><path d="M-30 -2 q12 8 24 0" stroke="${k}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    'captains-cove': k => `<path d="M-32 8 H32 L22 22 H-22 Z" fill="${k}"/><rect x="-2" y="-30" width="4" height="38" fill="${k}"/><path d="M4 -28 L28 2 H4 Z" fill="${k}"/><path d="M-4 -24 L-24 2 H-4 Z" fill="${k}" opacity=".7"/><path d="M-38 28 q8 -5 16 0 t16 0 t16 0 t16 0 t16 0" stroke="${k}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    phonics: k => [[-22, 6, .8], [0, -2, 1.1], [22, 6, .8]].map(([x, y, s]) => `<path d="M${x} ${y - 30 * s} L${x + 15 * s} ${y + 14 * s} H${x - 15 * s} Z" fill="${k}"/><rect x="${x - 2.5}" y="${y + 14 * s}" width="5" height="${8 * s}" fill="${k}"/>`).join(''),
    'tricky-words': k => `<rect x="-3" y="-26" width="6" height="50" rx="2" fill="${k}"/><path d="M-2 -24 H28 L36 -16 L28 -8 H-2 Z" fill="${k}"/><path d="M2 -2 H-28 L-36 6 L-28 14 H2 Z" fill="${k}"/><path d="M-34 26 H34" stroke="${k}" stroke-width="4" stroke-linecap="round"/>`,
    sentences: k => `${Array.from({ length: 8 }, (_, i) => `<ellipse cx="0" cy="-17" rx="7" ry="14" fill="${k}" transform="rotate(${i * 45} 0 -2)"/>`).join('')}<circle cx="0" cy="-2" r="9" fill="${C.paper}"/><circle cx="0" cy="-2" r="5" fill="${k}"/><path d="M0 14 V30" stroke="${k}" stroke-width="4" stroke-linecap="round"/>`,
    stories: k => `<path d="M0 -14 Q-18 -24 -38 -18 V20 Q-18 14 0 24 Z" fill="${k}"/><path d="M0 -14 Q18 -24 38 -18 V20 Q18 14 0 24 Z" fill="${k}" opacity=".8"/>${[-6, 2, 10].map(y => `<path d="M-30 ${y - 4} Q-18 ${y - 8} -6 ${y - 2}" stroke="${C.paper}" stroke-width="2" fill="none"/>`).join('')}`,
  };
  const starInk = k => `<path d="M0 -26 L8 -8 L27 -8 L12 4 L17 23 L0 12 L-17 23 L-12 4 L-27 -8 L-8 -8 Z" fill="${k}"/>`;
  // a stamp's ink: the place's own colour, deep enough to read on paper
  function inkOf(w) {
    const h = (w.color || '#4C7E4A').replace('#', ''), n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
    const f = .62, r = Math.round((n >> 16) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
    return `rgb(${r},${g},${b})`;
  }
  const hash = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  let uid = 0;
  function stampSVG(w, k) {
    const none = k === 'none', ink = none ? '#A8977C' : inkOf(w), id = 'pjArc' + (++uid);
    const rot = none ? 0 : (hash(w.id) % 11) - 5, name = w.name.replace(/[’']/g, '’').toUpperCase();
    const fs = 18, est = name.length * fs * .66, fit = est > 206 ? ` textLength="206" lengthAdjust="spacingAndGlyphs"` : '';
    const inner = (INNER[short(w.id)] || starInk)(ink);
    return `<svg viewBox="0 0 160 160" aria-hidden="true" class="pj-svg"><g transform="rotate(${rot} 80 80)"${none ? '' : ' opacity=".94"'}>
      ${none ? `<circle cx="80" cy="80" r="74" fill="none" stroke="${ink}" stroke-width="2.5" stroke-dasharray="6 7"/><circle cx="80" cy="80" r="44" fill="none" stroke="${ink}" stroke-width="2" stroke-dasharray="3 6"/>`
             : `<circle cx="80" cy="80" r="74" fill="none" stroke="${ink}" stroke-width="5" stroke-dasharray="180 3 40 2 90 4"/><circle cx="80" cy="80" r="44" fill="none" stroke="${ink}" stroke-width="2.5"/>`}
      <defs><path id="${id}" d="M24.5 104 A57 57 0 1 1 135.5 104"/></defs>
      <text class="pj-arc" font-family="Fredoka" font-weight="700" font-size="${fs}" letter-spacing=".5" fill="${ink}"${none ? ' opacity=".8"' : ''}><textPath href="#${id}" startOffset="50%" text-anchor="middle"${fit}>${esc(name)}</textPath></text>
      <g transform="translate(80 82) scale(.8)"${none ? ' opacity=".32"' : ''}>${inner}</g>
      ${none ? '' : `<path d="M44 128 q36 14 72 0" stroke="${ink}" stroke-width="2" fill="none" stroke-dasharray="2 5" stroke-linecap="round"/>`}
    </g>${k === 'all' ? seal(132, 128) : ''}</svg>`;
  }
  // the gold seal for every star in a place
  const seal = (x, y) => `<g class="pj-seal" transform="translate(${x} ${y})"><path d="M-9 8 L-14 26 L-4 21 L0 30 L4 21 L14 26 L9 8" fill="${C.berry}" stroke="#9E3646" stroke-width="1.5" stroke-linejoin="round"/>
    <circle r="20" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="2.5"/><circle r="15" fill="none" stroke="${C.goldDk}" stroke-width="1.2" stroke-dasharray="2 2.5"/>${A.star(0, 0, 10, true)}</g>`;
  const pawStamp = (k, rot = 0) => `<svg viewBox="-20 -20 40 40" aria-hidden="true"><g transform="rotate(${rot})" fill="${k}"><ellipse cx="0" cy="6" rx="9" ry="7.5"/><circle cx="-10" cy="-4" r="4"/><circle cx="-4" cy="-11" r="4"/><circle cx="4" cy="-11" r="4"/><circle cx="10" cy="-4" r="4"/></g></svg>`;
  const icons = {
    back: `<svg viewBox="-8 -8 16 16" aria-hidden="true"><path d="M3 -6 L-4 0 L3 6" fill="none" stroke="${C.woodInk}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    star: on => `<svg viewBox="-10 -10 20 20" aria-hidden="true">${A.star(0, 0, 9, on)}</svg>`,
    stamp: `<svg viewBox="-12 -12 24 24" aria-hidden="true"><circle r="10" fill="none" stroke="${C.woodInk}" stroke-width="2.4" stroke-dasharray="14 2 6 2"/><circle r="5" fill="${C.woodInk}"/></svg>`,
    seal: `<svg viewBox="-22 -22 44 54" aria-hidden="true">${seal(0, 0)}</svg>`,
    paw: `<svg viewBox="-12 -13 24 24" aria-hidden="true">${A.paw(0, 0, 1, '#7E2E3D')}</svg>`,
    go: `<svg viewBox="-8 -8 16 16" aria-hidden="true"><path d="M-3 -6 L4 0 L-3 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };

  /* ---------- the screen ---------- */
  const STYLE = `
  .pj{position:fixed;inset:0;z-index:20;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;
    background:#B8834F repeating-linear-gradient(176deg,rgba(120,74,36,.0) 0 22px,rgba(120,74,36,.16) 22px 24px,rgba(255,230,190,.08) 24px 46px);
    padding:0 12px calc(24px + env(safe-area-inset-bottom));font-family:Andika,system-ui,sans-serif;color:${C.ink}}
  .pj.opening{animation:pjIn .35s ease-out}
  @keyframes pjIn{from{opacity:0;transform:translateY(24px)}}
  .pj-bar{position:sticky;top:0;z-index:3;display:flex;justify-content:space-between;align-items:center;gap:8px;margin:0 -12px;padding:calc(8px + env(safe-area-inset-top)) 12px 8px;
    background:linear-gradient(#B8834F 80%,rgba(184,131,79,0))}
  .pj-tag{display:inline-flex;align-items:center;gap:6px;min-height:46px;padding:0 14px 0 18px;border:0;font:700 17px Fredoka,system-ui,sans-serif;color:${C.woodInk};cursor:pointer;white-space:nowrap;
    background:${C.woodLt};clip-path:polygon(12px 0,100% 0,100% 100%,12px 100%,0 50%);box-shadow:inset 0 -4px 0 rgba(154,106,58,.55);filter:drop-shadow(0 2px 0 ${C.woodDk})}
  .pj-tag svg{width:16px;height:16px}
  .pj-tag:active{transform:translateY(2px)}
  .pj-tag:focus-visible,.pj-rib:focus-visible,.pj-stamp:focus-visible,.pj-btn:focus-visible{outline:3px solid ${C.goldDk};outline-offset:2px}
  .pj-total{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 12px;border-radius:10px;background:${C.paper};box-shadow:0 2px 0 #8A5E34;font:700 17px Fredoka,system-ui,sans-serif;color:${C.woodInk};white-space:nowrap}
  .pj-total svg{width:22px;height:22px}

  /* the book: a leather cover with the paper page on it, and the ribbons along the top */
  .pj-book{position:relative;max-width:880px;margin:6px auto 0;padding:8px 8px 12px 14px;border-radius:16px 18px 18px 16px;background:#3F6B47;box-shadow:0 6px 0 #2C4E33,0 10px 24px rgba(60,30,10,.35)}
  .pj-book::before{content:"";position:absolute;left:5px;top:16px;bottom:16px;width:2px;background:repeating-linear-gradient(#C9B27A 0 6px,transparent 6px 11px);opacity:.8}
  .pj-paper{position:relative;border-radius:10px 12px 12px 10px;background:${C.paper} repeating-linear-gradient(transparent 0 37px,#EFE4CC 37px 38px);
    box-shadow:inset 6px 0 10px -6px rgba(110,80,40,.35);padding:0 14px 20px}
  .pj-tabs{display:flex;align-items:flex-start;gap:6px;padding:0 0 0 4px;margin:0 0 4px;position:relative;top:-2px}
  .pj-rib{flex:1 1 0;min-width:0;min-height:50px;border:0;margin:0;padding:6px 6px 10px;cursor:pointer;font:700 18px Fredoka,system-ui,sans-serif;
    color:var(--dk);background:#F4EBD6;border:2px solid var(--col);border-top:0;border-radius:0 0 10px 10px;display:flex;align-items:center;justify-content:center;gap:6px}
  .pj-rib svg{width:20px;height:20px;flex:none}
  .pj-rib.on{min-height:60px;color:#fff;background:var(--col);border-color:var(--dk);border-radius:0;padding-bottom:16px;
    clip-path:polygon(0 0,100% 0,100% 100%,50% calc(100% - 10px),0 100%);box-shadow:inset 0 -3px 0 rgba(0,0,0,.12)}
  .pj-rib:active{transform:translateY(2px)}

  .pj-head{display:flex;align-items:center;gap:10px;margin:8px 0 4px}
  .pj-bon{flex:none;width:76px;height:76px;border-radius:50%;background:#EAF4DE;border:3px solid #CFE3B8;overflow:hidden}
  .pj-bon svg{width:100%;height:auto;transform:translateY(4px) scale(1.35);transform-origin:50% 35%}
  .pj-say{position:relative;margin:0;padding:9px 14px 10px;border-radius:16px;background:#fff;border:2px solid #D9C7A6;font:400 17px/1.3 Andika,system-ui,sans-serif;box-shadow:0 3px 0 rgba(154,106,58,.18)}
  .pj-say::before{content:"";position:absolute;left:-13px;top:50%;transform:translateY(-50%);border:10px solid transparent;border-right:13px solid #D9C7A6;border-left:0}
  .pj-say::after{content:"";position:absolute;left:-9px;top:50%;transform:translateY(-50%);border:8px solid transparent;border-right:10px solid #fff;border-left:0}
  .pj-title{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:2px 12px;margin:12px 2px 6px;font:700 24px/1.2 Fredoka,system-ui,sans-serif;color:var(--dk)}
  .pj-title small{font:600 17px Fredoka,system-ui,sans-serif;color:${C.soft}}
  .pj-key{display:flex;flex-wrap:wrap;gap:6px 14px;margin:0 2px 10px;font:400 16px/1.3 Andika,system-ui,sans-serif;color:${C.soft}}
  .pj-key span{display:inline-flex;align-items:center;gap:6px}
  .pj-key i{display:inline-block;width:20px;height:20px;border-radius:50%;flex:none}
  .pj-key i.k-none{border:2px dashed #A8977C}.pj-key i.k-stamped{border:3px solid var(--col)}.pj-key i.k-all{background:${C.gold};border:2px solid ${C.goldDk}}

  /* the stamps */
  .pj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px 10px}
  @media (min-width:700px){.pj-grid{grid-template-columns:repeat(auto-fill,minmax(206px,1fr));gap:18px}}
  .pj-stamp{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;min-height:44px;margin:0;padding:8px 4px 10px;border:0;border-radius:16px;background:transparent;cursor:pointer;color:inherit;font:inherit;-webkit-tap-highlight-color:transparent}
  .pj-stamp:active{background:rgba(242,193,78,.18)}
  .pj-art{display:block;width:min(150px,100%);aspect-ratio:1}
  @media (min-width:700px){.pj-art{width:min(196px,100%)}.pj-name{font-size:20px}}
  .pj-svg{width:100%;height:100%;display:block;overflow:visible}
  .pj-name{font:700 18px/1.15 Fredoka,system-ui,sans-serif;text-align:center;color:${C.ink}}
  .pj-chip{display:inline-flex;align-items:center;gap:4px;padding:3px 10px 4px;border-radius:999px;font:600 16px/1.2 Fredoka,system-ui,sans-serif;white-space:nowrap}
  .pj-chip svg{width:16px;height:16px}
  .pj-chip.k-none{border:2px dashed #BBAA8C;color:${C.soft}}
  .pj-chip.k-stamped{background:#fff;border:2px solid #E3D6BB;color:${C.ink}}
  .pj-chip.k-all{background:${C.gold};border:2px solid ${C.goldDk};color:${C.woodInk}}
  .pj-stamp.k-none .pj-name{color:${C.soft}}
  .pj-new{position:absolute;top:2px;left:50%;transform:translateX(-50%) rotate(-4deg);padding:3px 12px 4px;border-radius:8px;background:${C.berry};color:#fff;font:700 16px Fredoka,system-ui,sans-serif;white-space:nowrap;box-shadow:0 2px 0 #9E3646;z-index:1}
  .pj-stamp.fresh .pj-art{animation:pjThunk .6s cubic-bezier(.3,1.4,.5,1) .35s both}
  .pj-stamp.fresh .pj-seal{animation:pjPop .5s cubic-bezier(.3,1.6,.5,1) .9s both;transform-box:fill-box;transform-origin:50% 50%}
  @keyframes pjThunk{0%{opacity:0;transform:scale(1.5) rotate(-12deg)}55%{opacity:1;transform:scale(.94)}100%{transform:none}}
  @keyframes pjPop{0%{transform:scale(0)}}

  /* a place's own page */
  .pj-sheet{position:fixed;inset:0;z-index:25;display:flex;align-items:flex-end;justify-content:center;background:rgba(60,36,16,.45);padding:12px 12px calc(12px + env(safe-area-inset-bottom))}
  .pj-sheet[hidden]{display:none}
  @media (min-width:700px){.pj-sheet{align-items:center}}
  .pj-card{width:100%;max-width:520px;max-height:100%;overflow:auto;border-radius:18px;background:${C.paper};border:3px solid var(--col);box-shadow:0 6px 0 rgba(60,36,16,.35);padding:14px 16px 16px;text-align:center}
  .pj-card .pj-art{width:150px;margin:0 auto}
  .pj-card h2{margin:4px 0 0;font:700 24px/1.2 Fredoka,system-ui,sans-serif;color:var(--dk)}
  .pj-card p{margin:4px 0;font:400 17px/1.35 Andika,system-ui,sans-serif}
  .pj-lv{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 6px;margin:10px 0 4px;padding:0;list-style:none}
  .pj-lv li{display:flex;flex-direction:column;align-items:center;gap:2px;width:44px}
  .pj-lv b{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;font:700 17px Fredoka,system-ui,sans-serif;background:${C.stoneLt};border:2px solid ${C.stoneDk};color:${C.soft}}
  .pj-lv li.on b{background:#fff;border:3px solid var(--col);color:var(--dk)}
  .pj-lv li.full b{background:${C.gold};border:3px solid ${C.goldDk};color:${C.woodInk}}
  .pj-lv svg{width:42px;height:14px}
  .pj-acts{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:12px}
  .pj-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:52px;padding:0 20px;border:0;border-radius:14px;cursor:pointer;font:700 19px Fredoka,system-ui,sans-serif;text-decoration:none}
  .pj-btn svg{width:16px;height:16px}
  .pj-btn.go{background:var(--col);color:#fff;box-shadow:0 4px 0 var(--dk)}
  .pj-btn.shut{background:${C.woodLt};color:${C.woodInk};box-shadow:0 4px 0 ${C.woodDk}}
  .pj-btn:active{transform:translateY(3px);box-shadow:none}

  /* the walks page: a month of paw prints */
  .pj-streak{display:flex;align-items:center;gap:8px;margin:2px 2px 10px;font:700 20px Fredoka,system-ui,sans-serif;color:#7E2E3D}
  .pj-streak svg{width:26px;height:26px}
  .pj-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;max-width:520px;margin:0 auto}
  .pj-cal .dh{text-align:center;font:700 16px Fredoka,system-ui,sans-serif;color:${C.soft};padding-bottom:2px}
  .pj-day{position:relative;aspect-ratio:1;min-height:40px;border-radius:10px;background:#fff;border:2px solid #E8DCC2;display:flex;align-items:flex-start;justify-content:flex-start;padding:2px 4px;font:600 16px Fredoka,system-ui,sans-serif;color:${C.soft}}
  .pj-day.later{background:transparent;border-style:dashed;opacity:.55}
  .pj-day.today{border:3px solid ${C.goldDk};color:${C.ink}}
  .pj-day.walked{color:#7E2E3D}
  .pj-day svg{position:absolute;right:3%;bottom:3%;width:62%;height:62%}
  .pj-day.walked.fresh svg{animation:pjThunk .5s cubic-bezier(.3,1.4,.5,1) .3s both}
  .pj-month{display:flex;justify-content:space-between;max-width:520px;margin:12px auto 0;font:600 17px Fredoka,system-ui,sans-serif;color:${C.ink}}
  .pj-walkgo{display:flex;justify-content:center;margin-top:16px}
  .pj .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  @media (max-width:360px){.pj-grid{grid-template-columns:repeat(2,1fr)}}
  @media (prefers-reduced-motion:reduce){.pj.opening,.pj-stamp.fresh .pj-art,.pj-stamp.fresh .pj-seal,.pj-day.walked.fresh svg{animation:none!important}.pj-rib:active,.pj-tag:active,.pj-btn:active{transform:none}}`;

  let root = null, page = 'maths', onClose = null, fresh = new Set(), lastFocus = null;

  function open(opts = {}) {
    if (!document.getElementById('pj-css')) document.head.insertAdjacentHTML('beforeend', `<style id="pj-css">${STYLE}</style>`);
    onClose = opts.onClose || null; lastFocus = document.activeElement;
    page = PAGES.some(p => p.id === opts.page) ? opts.page : firstPage();
    if (!root) { root = document.createElement('div'); root.className = 'pj'; root.id = 'pj'; document.body.appendChild(root); }
    root.hidden = false; root.classList.toggle('opening', !reduce());
    const name = (window.S && S.hasName) ? `${S.childName}'s` : 'My';
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', `${name} explorer's journal`);
    const ph = document.querySelector('.ph'); if (ph) ph.inert = true;
    document.body.classList.add('pj-open');
    root.innerHTML = `
      <div class="pj-bar"><button class="pj-tag" id="pjBack" aria-label="Back to the Clubhouse">${icons.back}<span aria-hidden="true">Clubhouse</span></button>
        <div class="pj-total" id="pjTotal"></div></div>
      <div class="pj-book"><div class="pj-paper">
        <div class="pj-tabs" role="tablist" aria-label="Journal pages">${PAGES.map(p => `<button class="pj-rib" role="tab" id="pjTab-${p.id}" data-page="${p.id}" aria-controls="pjPage" style="--col:${p.col};--dk:${p.dk}">${p.id === 'walks' ? icons.paw : ''}<span>${p.label}</span></button>`).join('')}</div>
        <div id="pjPage" role="tabpanel"></div>
      </div></div>
      <div class="pj-sheet" id="pjSheet" hidden></div>`;
    $('pjBack').onclick = close;
    root.querySelectorAll('.pj-rib').forEach(b => { b.onclick = () => { if (b.dataset.page !== page) { ui.tone(520, .07, 'triangle', .07); ui.tone(700, .07, 'triangle', .06, .05); show(b.dataset.page); } }; });
    root.querySelector('.pj-tabs').addEventListener('keydown', e => {
      const i = PAGES.findIndex(p => p.id === page), d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault(); const n = PAGES[(i + d + PAGES.length) % PAGES.length].id; show(n); $('pjTab-' + n).focus();
    });
    root.onkeydown = e => { if (e.key === 'Escape') { e.preventDefault(); if (!$('pjSheet').hidden) shut(); else close(); } };
    show(page);
    $('pjBack').focus({ preventScroll: true });
    const w = Q.get('world') && [...worlds('maths'), ...worlds('words')].find(x => x.id === Q.get('world') || short(x.id) === Q.get('world'));
    if (w && opts.fromLink) detail(w);
  }
  // open at the page with something new on it; otherwise the game played last
  function firstPage() {
    const seen = seenSet();
    for (const g of ['maths', 'words']) if (worlds(g).some(w => isNew(w, stateOf(w), seen))) return g;
    const last = (save().levelStarts || []).slice(-1)[0];
    return last && last.key.includes('-english-') ? 'words' : 'maths';
  }
  function close() {
    if (!root || root.hidden) return;
    root.hidden = true; root.innerHTML = '';
    document.body.classList.remove('pj-open');
    const ph = document.querySelector('.ph'); if (ph) ph.inert = false;
    const cb = onClose; onClose = null;
    if (cb) cb(); else if (hub()) hub().draw();
    const back = $('phHouse') || lastFocus; if (back && back.focus) back.focus({ preventScroll: true });
  }

  function total() {
    let n = 0, all = 0, of = 0;
    ['maths', 'words'].forEach(g => worlds(g).forEach(w => { const s = stateOf(w); of++; if (s.k !== 'none') n++; if (s.k === 'all') all++; }));
    return { n, all, of };
  }
  function show(id) {
    page = id;
    root.querySelectorAll(".pj-rib").forEach(b => { b.setAttribute("aria-selected", String(b.dataset.page === id)); b.classList.toggle("on", b.dataset.page === id); });
    const p = PAGES.find(x => x.id === id), el = $('pjPage');
    el.style.cssText = `--col:${p.col};--dk:${p.dk}`;
    el.setAttribute('aria-labelledby', 'pjTab-' + id);
    el.innerHTML = id === 'walks' ? walksPage() : gamePage(id);
    const t = total();
    $('pjTotal').innerHTML = `${icons.stamp}<span>${t.n} of ${t.of} stamps</span>`;
    $('pjTotal').setAttribute('aria-label', `${t.n} of ${t.of} stamps${t.all ? `, ${t.all} with every star` : ''}`);
    el.querySelectorAll('.pj-stamp').forEach(b => { b.onclick = () => { ui.tone(440, .06, 'sine', .07); detail([...worlds('maths'), ...worlds('words')].find(w => w.id === b.dataset.world)); }; });
    const walkGo = $('pjWalkGo'); if (walkGo) walkGo.onclick = () => go(hub() ? hub().PLACES.walk.href : 'bonnies-walk.html', 'Walkies! Let’s go!');
    root.scrollTo ? root.scrollTo({ top: 0 }) : (root.scrollTop = 0);
    // a new stamp: a thunk, and it counts as seen from now on
    if (fresh.size) {
      if (!reduce()) setTimeout(() => { ui.tone(150, .12, 'triangle', .2); ui.tone(95, .14, 'sine', .18, .03); }, 450);
      const seen = seenSet(); fresh.forEach(k => seen.add(k)); keepSeen(seen); fresh = new Set();
    }
    const line = $('pjSay').textContent; if (line && window.say) say(line);
  }

  function bonnieHead(line) {
    return `<div class="pj-head"><div class="pj-bon" aria-hidden="true">${ui.bonnieSVG()}</div><p class="pj-say" id="pjSay" aria-live="polite">${esc(line)}</p></div>`;
  }
  function gamePage(game) {
    const g = GAMES[game], ws = worlds(game), seen = seenSet();
    const rows = ws.map(w => { const s = stateOf(w); return { w, s, isNew: isNew(w, s, seen) }; });
    const got = rows.filter(r => r.s.k !== 'none').length, all = rows.filter(r => r.s.k === 'all').length, nw = rows.filter(r => r.isNew);
    rows.forEach(r => { if (r.isNew) { fresh.add(r.w.id + ':stamped'); if (r.s.k === 'all') fresh.add(r.w.id + ':all'); } });
    const line = nw.length ? (nw[0].s.k === 'all' ? `Every star in ${nw[0].w.name}! Here's your gold seal!` : `A new stamp! You visited ${nw[0].w.name}!`)
      : !got ? `Every place you visit in ${g.name} gets a stamp in here. Let's go exploring!`
      : got === rows.length && all === rows.length ? `Every stamp, and every gold seal! You're a real explorer!`
      : got === rows.length ? `You've got every ${g.name} stamp! Can you win gold seals too?`
      : `${got} ${got === 1 ? 'stamp' : 'stamps'} from ${g.name} so far. Where next?`;
    return `${bonnieHead(line)}
      <h2 class="pj-title">${esc(g.name)} <small>${got} of ${rows.length} stamped</small></h2>
      <div class="pj-key" aria-hidden="true"><span><i class="k-none"></i>Not visited yet</span><span><i class="k-stamped"></i>Stamped</span><span><i class="k-all"></i>Gold seal: every star</span></div>
      <div class="pj-grid">${rows.map(({ w, s, isNew: nwS }) => {
        const chip = s.k === 'none' ? 'Not visited yet' : s.k === 'all' ? `${icons.star(true)}Every star!` : `${icons.star(true)}${s.got} of ${s.max}`;
        const say = s.k === 'none' ? 'Not visited yet.' : s.k === 'all' ? `Stamped, with a gold seal: every star, ${s.max} of ${s.max}.` : `Stamped. ${s.got} of ${s.max} stars.`;
        return `<button class="pj-stamp k-${s.k}${nwS ? ' fresh' : ''}" data-world="${esc(w.id)}" data-k="${s.k}" aria-label="${esc(w.name)}. ${nwS ? 'New stamp! ' : ''}${say}">
          ${nwS ? '<span class="pj-new" aria-hidden="true">New stamp!</span>' : ''}<span class="pj-art">${stampSVG(w, s.k)}</span>
          <span class="pj-name" aria-hidden="true">${esc(w.name)}</span><span class="pj-chip k-${s.k}" aria-hidden="true">${chip}</span></button>`;
      }).join('')}</div>`;
  }

  /* a place's page: its stamp, a stone for each level with its stars, and the way there */
  function detail(w) {
    const s = stateOf(w), game = w.subject === 'english' ? 'words' : 'maths', g = GAMES[game], sh = $('pjSheet');
    const words = s.k === 'none' ? `You haven't been to ${w.name} yet. Shall we go?`
      : s.k === 'all' ? `Every star in ${w.name}! That's a gold seal.`
      : `${s.got} of ${s.max} stars here. ${s.played < w.levels.length ? `${w.levels.length - s.played} ${w.levels.length - s.played === 1 ? 'level' : 'levels'} still to try.` : 'Every level played! More stars to win.'}`;
    sh.innerHTML = `<div class="pj-card" role="dialog" aria-modal="true" aria-labelledby="pjCardName" style="--col:${g.col};--dk:${g.dk}">
      <span class="pj-art">${stampSVG(w, s.k)}</span>
      <h2 id="pjCardName">${esc(w.name)}</h2>
      <p>${esc(w.tag || '')}</p>
      <ol class="pj-lv" aria-label="Levels">${w.levels.map((L, i) => `<li class="${s.stars[i] === 3 ? 'full' : s.stars[i] ? 'on' : ''}" aria-label="Level ${i + 1}, ${esc(L.name)}: ${s.stars[i] ? `${s.stars[i]} ${s.stars[i] === 1 ? 'star' : 'stars'}` : 'not played yet'}"><b aria-hidden="true">${i + 1}</b>
        <svg viewBox="-21 -7 42 14" aria-hidden="true">${[0, 1, 2].map(j => A.star(-13 + j * 13, 0, 5.5, j < s.stars[i])).join('')}</svg></li>`).join('')}</ol>
      <p id="pjCardSay">${esc(words)}</p>
      <div class="pj-acts"><button class="pj-btn shut" id="pjShut">Back to my journal</button><button class="pj-btn go" id="pjGo">Go to ${esc(w.name)}${icons.go}</button></div></div>`;
    sh.hidden = false;
    $('pjShut').onclick = shut;
    sh.onclick = e => { if (e.target === sh) shut(); };
    $('pjGo').onclick = () => go(placeHref(w), `Let's go to ${w.name}!`);
    $('pjShut').focus({ preventScroll: true });
    if (window.say) say(words);
  }
  function shut() { const sh = $('pjSheet'), id = sh.querySelector('h2') && sh.dataset.world; sh.hidden = true; sh.innerHTML = ''; const b = root.querySelector('.pj-stamp:focus') || root.querySelector('.pj-stamp'); if (b) b.focus({ preventScroll: true }); }
  // the place's own level map, in the map prototype, with the same pretend child
  function placeHref(w) {
    const base = hub() ? hub().PLACES[w.subject === 'english' ? 'words' : 'maths'].href : (w.subject === 'english' ? LINKS.words : LINKS.maths);
    return base + (base.includes('?') ? '&' : '?') + 'level=' + encodeURIComponent(w.id);
  }
  function go(href, line) { if (window.goTo) goTo(href, line); else location.href = href; }

  /* Bonnie's walks: the last five weeks, Monday to Sunday, a paw print on each day with a walk */
  function walksPage() {
    const w = save().walks || { days: {}, streak: 0 }, today = new Date(), t = localDay(today);
    const mon = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7) - 28);
    const days = Array.from({ length: 35 }, (_, i) => new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i));
    const walked = d => (w.days || {})[localDay(d)] || 0;
    const shown = days.filter(d => localDay(d) <= t && walked(d)), all = Object.values(w.days || {}).reduce((a, b) => a + b, 0);
    const streak = w.streak >= 2 && (w.last === t || w.last === localDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1))) ? w.streak : 0;
    const nm = d => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    const line = walked(today) ? `We went for a walk today! There's my paw print.` : shown.length ? `Every walk gets my paw print. Shall we go for another?` : `Take me for a walk and I'll put my paw print here!`;
    return `${bonnieHead(line)}
      <h2 class="pj-title">Bonnie's Walks <small>${all} ${all === 1 ? 'walk' : 'walks'} so far</small></h2>
      ${streak ? `<div class="pj-streak">${icons.paw}<span>${streak} days in a row!</span></div>` : ''}
      <p class="sr">${shown.length ? `Walks in the last five weeks: ${shown.map(nm).join(', ')}.` : 'No walks yet in the last five weeks.'}</p>
      <div class="pj-cal" aria-hidden="true">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<div class="dh">${d}</div>`).join('')}
        ${days.map((d, i) => { const k = localDay(d), n = walked(d), later = k > t;
          return `<div class="pj-day${later ? ' later' : ''}${k === t ? ' today' : ''}${n ? ' walked' : ''}${n && k === t ? ' fresh' : ''}" data-day="${k}">${d.getDate()}${n ? pawStamp('#B5485A', (i * 37) % 30 - 15) : ''}</div>`; }).join('')}</div>
      <div class="pj-walkgo"><button class="pj-btn go" id="pjWalkGo">Go for a walk${icons.go}</button></div>`;
  }

  /* ---------- opening straight away (#journal, journal=…) ---------- */
  function boot() {
    const want = Q.get('journal') || (location.hash === '#journal' ? 'auto' : '');
    if (!want) return;
    const tryOpen = (n = 0) => {
      if (document.querySelector('.ph-stage')) open({ page: want === 'auto' ? null : want, fromLink: true });
      else if (n < 40) setTimeout(() => tryOpen(n + 1), 100);
    };
    tryOpen();
  }

  /* ---------- checks (journaltest=1) ---------- */
  async function journaltest() {
    const out = [], ok = (name, pass, detail = '') => out.push({ name, pass: !!pass, detail: String(detail) });
    const wait = ms => new Promise(r => setTimeout(r, ms)), r = el => el.getBoundingClientRect();
    for (let i = 0; i < 40 && !document.querySelector('.ph-stage'); i++) await wait(100);
    await wait(200);
    const before = JSON.stringify(save()), seenBefore = (() => { try { return localStorage.getItem(SEEN); } catch (e) { return null; } })();
    // opening it: tap the clubhouse
    const house = $('phHouse');
    ok('the clubhouse says it opens the journal, and there is a "Journal" sign by its door', /journal/i.test(house.getAttribute('aria-label')) && [...document.querySelectorAll('.ph-label')].some(l => /Journal/.test(l.textContent)));
    house.click(); await wait(reduce() ? 150 : 1300);
    ok('tapping the clubhouse opens the journal', root && !root.hidden && !!$('pjPage') && document.querySelector('.ph').inert, root && root.hidden);
    const vis = el => { const b = r(el); return b.left >= -1 && b.right <= innerWidth + 1; };
    const results = {};
    for (const game of ['maths', 'words']) {
      show(game); await wait(60);
      const ws = worlds(game), cards = [...root.querySelectorAll('.pj-stamp')];
      const wrong = cards.filter((c, i) => { const w = ws[i], s = w && stateOf(w); return !w || c.dataset.world !== w.id || c.dataset.k !== s.k || !c.querySelector('.pj-chip').textContent.includes(s.k === 'none' ? 'Not visited' : s.k === 'all' ? 'Every star' : `${s.got} of ${s.max}`); });
      results[game] = { n: cards.length, of: ws.length, wrong: wrong.map(c => c.dataset.world) };
    }
    ok('one stamp for every place on each map, in map order, each saying what the save says (not visited, N of M stars, every star)', ['maths', 'words'].every(g => results[g].n === results[g].of && !results[g].wrong.length), JSON.stringify(results));
    // the three states look different: dashed and pale, inked, inked with a gold seal
    show('maths'); await wait(60);
    const looks = {};
    ['maths', 'words'].forEach(g => { show(g); root.querySelectorAll('.pj-stamp').forEach(c => { if (!looks[c.dataset.k]) looks[c.dataset.k] = { dashed: !!c.querySelector('circle[stroke-dasharray="6 7"]'), seal: !!c.querySelector('.pj-seal'), chip: getComputedStyle(c.querySelector('.pj-chip')).backgroundColor + ' ' + getComputedStyle(c.querySelector('.pj-chip')).borderTopStyle }; }); });
    const lk = Object.entries(looks);
    ok('not visited, stamped and gold seal each look different (shape first: dashed, inked, sealed)', lk.every(([k, v]) => (k === 'none') === v.dashed && (k === 'all') === v.seal) && new Set(lk.map(([, v]) => v.chip)).size === lk.length, lk.map(([k, v]) => `${k}: ${v.dashed ? 'dashed' : 'inked'}${v.seal ? '+seal' : ''}, ${v.chip}`).join('; '));
    show('maths'); await wait(60);
    const taps = [...root.querySelectorAll('button')];
    const small = taps.filter(b => r(b).width < 44 || r(b).height < 44);
    ok('every tap target is at least 44 × 44', !small.length, small.map(b => b.id || b.textContent.trim()).join(', '));
    ok('every stamp and button has a VoiceOver name', taps.every(b => (b.getAttribute('aria-label') || b.textContent).trim().length > 3) && [...root.querySelectorAll('.pj-stamp')].every(b => /Stamped|Not visited/.test(b.getAttribute('aria-label'))));
    const readable = () => [...root.querySelectorAll('.pj-name, .pj-chip, .pj-say, .pj-title, .pj-title small, .pj-key span, .pj-rib span, .pj-tag span, .pj-total span, .pj-new, .pj-day, .dh, .pj-btn, .pj-streak span')].filter(el => el.offsetParent && parseFloat(getComputedStyle(el).fontSize) < 16);
    const arcs = () => [...root.querySelectorAll('.pj-stamp .pj-arc')].filter(t => t.closest('svg') && r(t.closest('svg')).width * 18 / 160 < 15.9);
    let tiny = readable(), tinyArc = arcs();
    show('walks'); await wait(60); tiny = tiny.concat(readable());
    ok('words a child reads are 16px or more, the names round the stamps too', !tiny.length && !tinyArc.length, tiny.map(el => el.textContent.trim().slice(0, 20)).concat(tinyArc.map(() => 'arc')).join(', ') || `stamp ${r(root.querySelector('.pj-stamp .pj-svg') || document.body).width.toFixed(0)}px`);
    show('maths'); await wait(60);
    ok('nothing is wider than the screen', root.scrollWidth <= innerWidth + 1 && [...root.querySelectorAll('.pj-stamp, .pj-rib, .pj-tag, .pj-total')].every(vis));
    // the ribbons
    const ribs = [...root.querySelectorAll('.pj-rib')];
    // (the open ribbon's own style: a headless test browser sometimes keeps a stale size, so this reads the rule itself)
    const onRule = [...document.getElementById('pj-css').sheet.cssRules].find(x => x.selectorText === '.pj-rib.on'), baseRule = [...document.getElementById('pj-css').sheet.cssRules].find(x => x.selectorText === '.pj-rib');
    ok('three ribbons (Maths, Words, Walks): the open page is longer, notched and filled in', ribs.length === 3 && ribs.filter(b => b.getAttribute('aria-selected') === 'true' && b.classList.contains('on')).length === 1
      && parseFloat(onRule.style.minHeight) > parseFloat(baseRule.style.minHeight) && /polygon/.test(onRule.style.clipPath) && onRule.style.background !== baseRule.style.background, ribs.map(b => `${b.textContent.trim()} ${r(b).height.toFixed(0)}${b.classList.contains('on') ? ' open' : ''}`).join(', '));
    ribs[1].click(); await wait(60);
    ok('tapping a ribbon turns to that page', page === 'words' && ribs[1].getAttribute('aria-selected') === 'true' && /Meadow Words/.test($('pjPage').textContent));
    // Bonnie, in her outfit, says something about the page
    ok('Bonnie, dressed as she is in the shop, says something about the page', !!root.querySelector('.pj-bon svg') && $('pjSay').textContent.length > 10, $('pjSay').textContent);
    // a place's own page
    show('maths'); await wait(60);
    const st = root.querySelector('.pj-stamp[data-k="stamped"]') || root.querySelector('.pj-stamp'), w = worlds('maths').find(x => x.id === st.dataset.world), s = stateOf(w);
    st.click(); await wait(80);
    const lis = [...$('pjSheet').querySelectorAll('.pj-lv li')];
    ok("tapping a stamp opens the place's page: a stone for each level with its stars", !$('pjSheet').hidden && lis.length === w.levels.length && lis.every((li, i) => li.getAttribute('aria-label').includes(s.stars[i] ? `${s.stars[i]} star` : 'not played')), `${w.name}: ${s.stars.join(' ')}`);
    const goHref = placeHref(w);
    ok('…and "Go to" leads to that place on its map, with the same child', [LINKS.maths, LINKS.words].some(p => goHref.startsWith(p)) && goHref.includes('level=' + encodeURIComponent(w.id)) && (!Q.get('demo') || goHref.includes('demo=' + Q.get('demo'))), goHref);
    ok('…which fits on the screen', r($('pjSheet').querySelector('.pj-card')).bottom <= innerHeight + 1 && r($('pjSheet').querySelector('.pj-card')).top >= -1);
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await wait(40);
    ok('Escape (or "Back to my journal") closes it', $('pjSheet').hidden);
    // a new stamp: forget one, and it's stamped with a thunk next time, then remembered
    const got = [...worlds('maths'), ...worlds('words')].find(x => stateOf(x).k !== 'none');
    if (got) {
      const seen = seenSet(); seen.delete(got.id + ':stamped'); seen.delete(got.id + ':all'); keepSeen(seen);
      show(got.subject === 'english' ? 'words' : 'maths'); await wait(60);
      const c = root.querySelector(`.pj-stamp[data-world="${got.id}"]`);
      ok('a stamp won since last time says "New stamp!", is stamped on, and Bonnie says so', c.classList.contains('fresh') && !!c.querySelector('.pj-new') && /new stamp|gold seal/i.test($('pjSay').textContent), got.name);
      show('walks'); show(got.subject === 'english' ? 'words' : 'maths'); await wait(60);
      ok('…and only the first time', !root.querySelector(`.pj-stamp[data-world="${got.id}"]`).classList.contains('fresh'));
    }
    // the walks page
    show('walks'); await wait(60);
    const wk = save().walks, cells = [...root.querySelectorAll('.pj-day')];
    const bad = cells.filter(c => !!((wk.days || {})[c.dataset.day]) !== c.classList.contains('walked'));
    ok('the walks page: five weeks, a paw print on every day with a walk, today ringed', cells.length === 35 && !bad.length && root.querySelectorAll('.pj-day.today').length === 1, `${cells.filter(c => c.classList.contains('walked')).length} walked`);
    ok('…the days in a row, as on the Clubhouse, and VoiceOver hears the walk days', (wk.streak >= 2) === !!root.querySelector('.pj-streak') && root.querySelector('.pj .sr').textContent.length > 10, root.querySelector('.pj-streak') ? root.querySelector('.pj-streak').textContent : 'no streak');
    ok('a stamp counts for each place visited, at the top', $('pjTotal').textContent.includes(`${total().n} of ${total().of}`), $('pjTotal').textContent);
    // motion
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm) { show('maths'); const f = root.querySelector('.pj-stamp'); f.classList.add('fresh'); ok('Reduce Motion: stamps appear without the thunk', getComputedStyle(f.querySelector('.pj-art')).animationName === 'none'); f.classList.remove('fresh'); }
    // speed
    const t0 = performance.now(); show('maths'); show('words'); show('walks'); const ms = performance.now() - t0;
    ok('quick to draw (for the 2018 iPad)', ms < 250, `three pages in ${ms.toFixed(0)} ms`);
    ok('the journal saves nothing: the save is just as it was', JSON.stringify(save()) === before);
    // closing
    $('pjBack').click(); await wait(80);
    ok('"Clubhouse" closes the journal and the meadow is back, Bonnie at home', root.hidden && !document.querySelector('.ph').inert && !!$('phBonnie') && document.activeElement === $('phHouse'));
    try { if (seenBefore === null) localStorage.removeItem(SEEN); else localStorage.setItem(SEEN, seenBefore); } catch (e) {}
    const pre = document.createElement('pre'); pre.id = 'selftest';
    pre.style.cssText = 'position:fixed;z-index:99;left:0;right:0;bottom:0;max-height:60vh;overflow:auto;margin:0;background:#fff;font:12px monospace';
    pre.textContent = JSON.stringify({ size: [innerWidth, innerHeight], passed: out.filter(x => x.pass).length, of: out.length, results: out }, null, 1);
    document.body.appendChild(pre);
  }

  window.ProtoJournal = { open, close, show, stateOf, worlds, stampSVG };
  boot();
  if (Q.get('journaltest')) journaltest();
})();
