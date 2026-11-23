/* Bone Shop PROTOTYPE (22 November 2026): the shop as Bonnie's dressing room (not part of the game yet).
 *
 * When the engine draws the Bone Shop (Meadow.shop), this shows a dressing room instead: Bonnie stands big in the
 * middle of the room, and everything in the shop hangs on a rail below her. Tap something and she tries it on (the
 * room's window shows a theme), with no bones spent; the button under her then says what you can do: buy it, wear
 * it, take it off, use it, swap bones for a prize, or how many more bones you need.
 *
 * Nothing in the engine changes. The engine's shop is still drawn, only hidden; every Buy, Wear, Take off, Use and
 * Swap presses the engine's own button, so its prices, its "Buy it for 60 bones?" box, the grown-up's hold for a
 * prize, the grown-ups' sum check and the save are exactly the engine's. Trying on draws Bonnie with the item for a
 * moment (the save is put back at once and never written).
 *
 * Loaded by prototype-maths-map.html and prototype-words-map.html after js/proto-level.js.
 *   #shop            open the shop straight away, as the Clubhouse's shop stall does (Back goes to the Clubhouse)
 *   shoptab=themes   start on that section (gear, coats, themes or prizes)
 *   try=party        start with that item tried on (for screenshots)
 *   shoptest=1       run the shop checks and print the results on the page
 */
(function () {
  const Q = new URLSearchParams(location.search);
  if (Q.get('view') === 'old') return;
  if (window.MeadowLook && !window.MeadowLook.on) return; // the old look (js/meadow-look.js)
  const A = window.ProtoArt, M = window.Meadow, ui = M.ui, C = A.C;
  const reduce = () => ui.reduceMotion();
  const save = () => M.save.get() || M.save.load();
  const TABS = [
    { id: 'gear', eng: 'hats', name: 'Gear' },
    { id: 'coats', eng: 'hats', name: 'Coats' },
    { id: 'themes', eng: 'themes', name: 'Themes' },
    { id: 'prizes', eng: 'prizes', name: 'Prizes' },
  ];
  // the engine's prize groups (PRIZE_TIERS in meadow-core.js, which isn't exported; the checks compare them with the engine's)
  const TIERS = [[0, 'Little treats'], [100, 'Small prizes'], [300, 'Medium prizes'], [1000, 'Big goals']];
  const tierOf = c => TIERS.filter(([m]) => c >= m).pop()[1];
  const viaClub = location.hash === '#shop';
  let on = false, tab = null, sel = null, said = null, refocus = null, lastDraw = 0, ownedWas = null, peeked = false;
  let fresh = new Set(); // just bought: their cards pop and say "New in your collection!"
  const ownedNow = () => { const S = save(); return [...S.owned.hats, ...S.owned.coats, ...S.owned.themes]; };
  const railX = {};

  /* ---------- what's in the shop, and what the engine lets you do with each thing ---------- */
  function groups(t) {
    const S = save();
    if (t === 'gear') return M.SLOTS.map(sl => ({ head: sl.name, list: M.HATS.filter(h => h.slot === sl.id).map(h => ({ kind: 'gear', id: h.id, name: h.name, cost: h.cost, slot: sl, own: S.owned.hats.includes(h.id), on: S[sl.key] === h.id })) }));
    if (t === 'coats') return [{ head: 'Coats', list: M.COATS.map(c => ({ kind: 'coat', id: c.id, name: c.name, cost: c.cost, coat: c, own: S.owned.coats.includes(c.id), on: (S.coat || 'chocolate') === c.id })) }];
    if (t === 'themes') return [{ head: 'Themes', list: M.THEMES.map(x => ({ kind: 'theme', id: x.id, name: x.name, cost: x.cost, sw: x.sw, own: S.owned.themes.includes(x.id), on: S.theme === x.id })) }];
    const out = [];
    S.rewards.slice().sort((a, b) => a.cost - b.cost).forEach(p => {
      const h = tierOf(p.cost); if (!out.length || out[out.length - 1].head !== h) out.push({ head: h, list: [] });
      out[out.length - 1].list.push({ kind: 'prize', id: p.id, name: p.title, desc: p.desc, cost: p.cost, own: false, on: false });
    });
    return out;
  }
  const all = t => groups(t).flatMap(g => g.list);
  const chosen = () => sel && sel.tab === tab ? all(tab).find(x => x.id === sel.id) : null;
  // buy, wear, off (gear only), using (a coat or theme already on), swap (a prize), short (not enough bones)
  function state(it) {
    const b = save().bones;
    if (it.kind === 'prize') return b >= it.cost ? 'swap' : 'short';
    if (it.own) return it.on ? (it.kind === 'gear' ? 'off' : 'using') : 'wear';
    return b >= it.cost ? 'buy' : 'short';
  }
  // the five things a card can be, each with its own colour, mark and words, used on the card, by Bonnie and in the panel:
  //   active (green tick: Wearing / Using now), owned (purple star: Yours), buy (gold: its price), short (grey: its price
  //   and how close), prize (a real prize: its price, quieter)
  const kindOf = st => st === 'off' || st === 'using' ? 'active' : st === 'wear' ? 'owned' : st === 'swap' ? 'prize' : st;
  const activeWord = it => it.kind === 'theme' ? 'Using now' : 'Wearing';
  const esc = s => CSS.escape(String(s));
  const ENG = {
    buy: it => `[data-buy="${it.kind === 'gear' ? 'hats' : it.kind === 'coat' ? 'coats' : 'themes'}:${esc(it.id)}"]`,
    wear: it => it.kind === 'gear' ? `[data-wear="${esc(it.id)}"]` : it.kind === 'coat' ? `[data-coat="${esc(it.id)}"]` : `[data-usetheme="${esc(it.id)}"]`,
    off: it => `[data-off="${esc(it.slot.key)}"]`,
    swap: it => `[data-prize="${esc(it.id)}"]`,
  };
  const engShop = () => ui.$('#screen > .card.shop');
  const engBtn = (it, st) => ENG[st] && engShop() ? engShop().querySelector(ENG[st](it)) : null;
  const engTab = () => { const b = engShop() && engShop().querySelector('.tab.on'); return b ? b.dataset.tab : 'hats'; };

  /* ---------- drawings ---------- */
  const boneIcon = `<svg viewBox="-22 -14 44 28" aria-hidden="true">${A.bone(0, 0, 1)}</svg>`;
  const starIcon = `<svg viewBox="-10 -10 20 20" aria-hidden="true"><path d="M0 -8.5 L2.5 -2.8 L8.6 -2.6 L3.9 1.4 L5.4 7.4 L0 4 L-5.4 7.4 L-3.9 1.4 L-8.6 -2.6 L-2.5 -2.8 Z" fill="currentColor"/></svg>`;
  const tick = `<svg viewBox="-10 -10 20 20" aria-hidden="true"><path d="M-6 0 L-2 5 L7 -6" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const lockIcon = `<svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="M-6 -1 v-4 a6 6 0 0 1 12 0 v4" fill="none" stroke="${C.woodInk}" stroke-width="2.6"/><rect x="-9" y="-1" width="18" height="13" rx="3" fill="${C.woodInk}"/><circle cx="0" cy="5" r="2" fill="${C.woodLt}"/></svg>`;
  const svg = (inner, vb = '-20 -20 40 40') => `<svg viewBox="${vb}" aria-hidden="true">${inner}</svg>`;
  const TAB_ICONS = {
    gear: svg(`<path d="M-11 9 L0 -14 L11 9 Z" fill="${C.berry}" stroke="#A93E4F" stroke-width="1.6" stroke-linejoin="round"/><circle cx="0" cy="-14" r="3.6" fill="${C.gold}"/><path d="M-6 -1 h12 M-8.5 4.5 h17" stroke="${C.gold}" stroke-width="2.4"/><rect x="-13" y="8" width="26" height="5" rx="2.5" fill="${C.gold}"/>`),
    coats: svg(A.paw(0, 2, 1.25, '#9a6440', 1)),
    themes: svg(`<rect x="-13" y="-14" width="26" height="28" rx="4" fill="#2F3A6B" stroke="${C.woodDk}" stroke-width="3"/><circle cx="4" cy="-5" r="5" fill="#FFF3C4"/><circle cx="6.5" cy="-7" r="4.5" fill="#2F3A6B"/><circle cx="-6" cy="5" r="1.4" fill="#fff"/><circle cx="-3" cy="-6" r="1" fill="#fff"/>`),
    prizes: svg(`<rect x="-13" y="-5" width="26" height="18" rx="2" fill="${C.berry}"/><rect x="-15" y="-10" width="30" height="7" rx="2" fill="#E9707F"/><path d="M-2 -10 v23 h4 v-23 z" fill="${C.gold}"/><path d="M0 -10 c-4 -8 -12 -6 -9 -1 c2 2 6 1 9 1 c3 0 7 1 9 -1 c3 -5 -5 -7 -9 1" fill="none" stroke="${C.gold}" stroke-width="2.6"/>`),
  };
  // the real prizes, drawn (the same kinds the engine picks a picture for)
  const PRIZE_ART = {
    snack: `<circle r="15" fill="#D9A35A"/><circle r="15" fill="none" stroke="#B9823A" stroke-width="2"/>${[[-6, -5], [5, -7], [-2, 4], [7, 5], [-8, 6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="${C.woodInk}"/>`).join('')}`,
    music: `<path d="M-6 9 V-11 L12 -15 V5" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/><ellipse cx="-10" cy="10" rx="5.5" ry="4.2" fill="${C.berry}"/><ellipse cx="8" cy="6" rx="5.5" ry="4.2" fill="${C.berry}"/>`,
    screen: `<rect x="-17" y="-13" width="34" height="23" rx="3" fill="${C.ink}"/><rect x="-14" y="-10" width="28" height="17" rx="1.5" fill="${C.water}"/><path d="M-8 16 h16 M0 10 v6" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/><path d="M-4 -5 l8 4 l-8 4 z" fill="#fff"/>`,
    dessert: `<path d="M-9 0 L0 18 L9 0 Z" fill="#E3B06A" stroke="#B9823A" stroke-width="1.5" stroke-linejoin="round"/><circle cx="-5" cy="-3" r="7" fill="#F4A7B9"/><circle cx="5" cy="-3" r="7" fill="#FFF3D6"/><circle cx="0" cy="-10" r="7" fill="#8B5A3C"/><circle cx="1" cy="-17" r="2.6" fill="${C.apple}"/>`,
    bed: `<path d="M3 -15 A15 15 0 1 0 15 6 A11 11 0 1 1 3 -15 Z" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1.5"/><circle cx="10" cy="-10" r="1.8" fill="${C.gold}"/><circle cx="14" cy="-2" r="1.2" fill="${C.gold}"/>`,
    treat: `<path d="M-9 0 L-17 -7 L-17 7 Z M9 0 L17 -7 L17 7 Z" fill="#F4A7B9" stroke="#D9707F" stroke-width="1.4" stroke-linejoin="round"/><circle r="9.5" fill="${C.berry}"/><path d="M-5 -5 q5 5 0 10 M1 -7 q5 7 0 14" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>`,
    film: `<rect x="-16" y="-6" width="32" height="21" rx="2.5" fill="${C.ink}"/><path d="M-16 -8 L15 -16 L17 -9 L-14 -1 Z" fill="${C.ink}"/><path d="M-9 -9.5 l4 6 M0 -12 l4 6 M9 -14 l4 6" stroke="#fff" stroke-width="3"/><rect x="-12" y="0" width="24" height="3" fill="#fff" opacity=".5"/>`,
    bowling: `<path d="M-6 -16 c-4 0 -4 6 -2 9 c-3 4 -5 10 -3 22 h10 c2 -12 0 -18 -3 -22 c2 -3 2 -9 -2 -9 z" fill="#fff" stroke="#C9BBA6" stroke-width="1.5"/><path d="M-10 -5 h8" stroke="${C.apple}" stroke-width="2.4"/><circle cx="9" cy="8" r="8.5" fill="#3F6FB8"/><circle cx="7" cy="4" r="1.5" fill="#1F3F78"/><circle cx="11" cy="4" r="1.5" fill="#1F3F78"/>`,
    build: `<rect x="-16" y="-4" width="32" height="16" rx="2" fill="${C.apple}"/><rect x="-12" y="-10" width="8" height="7" rx="2" fill="${C.apple}"/><rect x="4" y="-10" width="8" height="7" rx="2" fill="${C.apple}"/><rect x="-16" y="7" width="32" height="5" fill="#B9352D" opacity=".5"/>`,
    toy: `<rect x="-15" y="-13" width="18" height="25" rx="3" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1.5" transform="rotate(-12)"/><rect x="-3" y="-12" width="18" height="25" rx="3" fill="${C.berry}" stroke="#A93E4F" stroke-width="1.5" transform="rotate(10)"/><circle cx="6" cy="0" r="4" fill="#fff" opacity=".85"/>`,
    trip: `<circle cx="9" cy="-9" r="6" fill="${C.gold}"/><rect x="-10" y="0" width="4" height="14" fill="${C.trunk}"/><circle cx="-8" cy="-4" r="9" fill="${C.leaf}"/><path d="M-18 15 h36" stroke="${C.leafDk}" stroke-width="3" stroke-linecap="round"/>`,
    dinner: `<path d="M-15 -10 L15 -10 L0 17 Z" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1.5" stroke-linejoin="round"/><path d="M-15 -10 L15 -10" stroke="#D9A35A" stroke-width="5" stroke-linecap="round"/><circle cx="-5" cy="-3" r="2.6" fill="${C.apple}"/><circle cx="4" cy="-1" r="2.6" fill="${C.apple}"/><circle cx="0" cy="7" r="2.2" fill="${C.apple}"/>`,
    gift: `<rect x="-14" y="-4" width="28" height="18" rx="2" fill="${C.berry}"/><rect x="-16" y="-10" width="32" height="7" rx="2" fill="#E9707F"/><path d="M-2 -10 v24 h4 v-24 z" fill="${C.gold}"/><path d="M0 -10 c-4 -8 -12 -6 -9 -1 c2 2 6 1 9 1 c3 0 7 1 9 -1 c3 -5 -5 -7 -9 1" fill="none" stroke="${C.gold}" stroke-width="2.6"/>`,
  };
  // the same order of tests as the engine's prizeEmoji, so a prize a grown-up types gets the same kind of picture
  const prizeKind = t => { t = String(t).toLowerCase();
    return /snack/.test(t) ? 'snack' : /dj|music/.test(t) ? 'music' : /screen|gaming|tablet/.test(t) ? 'screen' : /dessert|pudding/.test(t) ? 'dessert'
      : /bed|stay up|late/.test(t) ? 'bed' : /shop|treat/.test(t) ? 'treat' : /movie|film/.test(t) ? 'film' : /bowling/.test(t) ? 'bowling'
      : /build|lego/.test(t) ? 'build' : /toy|card/.test(t) ? 'toy' : /outing|trip|park/.test(t) ? 'trip' : /dinner/.test(t) ? 'dinner' : 'gift'; };
  const coatStyle = c => `--fur:${c.fur};--fur-dk:${c.dk};--fur-lt:${c.lt}`;

  // Bonnie in her outfit, with something tried on (the save's outfit is put back straight away; nothing is saved)
  function lookSVG(over) {
    const S = save(), keep = { hat: S.hat, face: S.face, neck: S.neck };
    try { Object.assign(S, over || {}); return ui.bonnieSVG(); } finally { Object.assign(S, keep); }
  }
  function thumb(it) {
    if (it.kind === 'gear') return ui.bonnieSVG(it.id); // the engine's own picture: Bonnie wearing just that
    if (it.kind === 'coat') return `<span class="ps-fur" style="${coatStyle(it.coat)}">${ui.bonnieSVG('')}</span>`;
    if (it.kind === 'theme') return `<span class="ps-sw" style="background:${it.sw}"></span>`;
    return svg(PRIZE_ART[prizeKind(it.name)]);
  }

  // each theme's touch of magic on the wall (behind Bonnie, so she and the words stay clear)
  function themeMagic(theme, W, top, fl, f) {
    const r = A.rng(theme.length * 31 + 7), pts = n => Array.from({ length: n }, () => [r() * W, top + 30 + r() * (fl - top - 110 * f)]);
    const star = (x, y, k, c) => `<path class="ps-twinkle" style="animation-delay:${(r() * 3).toFixed(2)}s" d="M${x} ${y - 6 * k} L${x + 1.6 * k} ${y - 1.6 * k} L${x + 6 * k} ${y} L${x + 1.6 * k} ${y + 1.6 * k} L${x} ${y + 6 * k} L${x - 1.6 * k} ${y + 1.6 * k} L${x - 6 * k} ${y} L${x - 1.6 * k} ${y - 1.6 * k} Z" fill="${c}"/>`;
    const n = Math.round(W / 26);
    const M = {
      night: () => pts(n).map(([x, y]) => star(x, y, .8 + r() * .7, '#FFF6D5')).join(''),
      space: () => pts(n).map(([x, y]) => star(x, y, .6 + r() * .8, '#fff')).join('') + `<circle cx="${W * .86}" cy="${top + 70 * f}" r="${18 * f}" fill="#F6B66A"/><ellipse cx="${W * .86}" cy="${top + 70 * f}" rx="${30 * f}" ry="${7 * f}" fill="none" stroke="#FFD9A0" stroke-width="3"/>`,
      christmas: () => { let o = ''; for (let i = 0, k = Math.ceil(W / 30); i <= k; i++) { const x = i * 30 + 6, t = x / W, y = top + 10 + 4 * t * (1 - t) * 26 * f; o += `<circle class="ps-twinkle" style="animation-delay:${(i % 4) * .4}s" cx="${x}" cy="${y + 9}" r="${5 * f}" fill="${['#FF5A4E', '#FFD24A', '#6EDB7A', '#5AB4FF'][i % 4]}"/>`; } return o; },
      snow: () => pts(n + 6).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${(2 + r() * 3) * f}" fill="#fff" opacity=".95"/>`).join(''),
      sea: () => pts(Math.round(n * .7)).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${(3 + r() * 6) * f}" fill="none" stroke="#fff" stroke-width="2" opacity=".85"/>`).join('') + `<path d="M${W * .14} ${top + 90 * f} q14 -12 30 0 q-16 12 -30 0 z m30 0 l10 -8 v16 z" fill="#FF9A5A" opacity=".9"/>`,
      sunset: () => `<ellipse cx="${W / 2}" cy="${fl - 70 * f}" rx="${W * .6}" ry="${fl * .7}" fill="#FFB36B" opacity=".25"/>`,
      volcano: () => pts(n).map(([x, y]) => `<circle class="ps-twinkle" style="animation-delay:${(r() * 3).toFixed(2)}s" cx="${x}" cy="${y}" r="${(1.6 + r() * 2.4) * f}" fill="#FF8A3D"/>`).join(''),
      pixel: () => pts(Math.round(n * .6)).map(([x, y]) => { const q = 7 * f; return `<g fill="#fff" opacity=".9"><rect x="${x}" y="${y}" width="${q * 3}" height="${q}"/><rect x="${x + q}" y="${y - q}" width="${q}" height="${q}"/></g>`; }).join(''),
    };
    return M[theme] ? `<g class="ps-magic" data-theme="${theme}">${M[theme]()}</g>` : '';
  }
  // the room, drawn to fit the space it has (W × H px); theme = the one shown (tried on, or in use); bon = where Bonnie stands
  function roomSVG(W, H, theme, top, bon) {
    const f = Math.max(.72, Math.min(1.45, H / 340)), cx = W / 2, fl = Math.round(H - 64 * f), o = [];
    o.push(`<rect width="${W}" height="${fl}" fill="#F3DDB0" fill-opacity=".58"/>`); // the theme shows through, as wallpaper
    for (let x = 14; x < W; x += 38) o.push(`<path d="M${x} 0 V${fl - 70 * f}" stroke="#E5C88F" stroke-width="2"/>`);
    // the panelling and the floor
    o.push(`<rect y="${fl - 70 * f}" width="${W}" height="${70 * f}" fill="#E2B577"/><rect y="${fl - 74 * f}" width="${W}" height="${7 * f}" fill="${C.woodDk}"/>`);
    for (let x = 30; x < W; x += 76) o.push(`<rect x="${x}" y="${fl - 60 * f}" width="${56}" height="${48 * f}" rx="4" fill="none" stroke="#C99A5C" stroke-width="2"/>`);
    o.push(`<rect y="${fl}" width="${W}" height="${H - fl}" fill="#C9935A"/><rect y="${fl}" width="${W}" height="${6 * f}" fill="${C.woodDk}"/>`);
    for (let y = fl + 22 * f; y < H; y += 20 * f) o.push(`<path d="M0 ${y.toFixed(1)} H${W}" stroke="#B98249" stroke-width="2"/>`);
    // bunting along the top, under the bar
    const by = top + 4;
    o.push(`<path d="M-10 ${by} Q${cx} ${by + 26 * f} ${W + 10} ${by}" fill="none" stroke="${C.woodDk}" stroke-width="2"/>`);
    for (let i = 0, n = Math.ceil(W / 46); i <= n; i++) { const x = i * 46 + 10, t = x / W, y = by + 4 * t * (1 - t) * 26 * f - 1; o.push(`<path d="M${x - 10} ${y} L${x + 10} ${y} L${x} ${y + 15 * f} Z" fill="${[C.berry, C.gold, C.leafLt, C.water][i % 4]}"/>`); }
    // the wardrobe, doors open, on the right
    const wx = cx + Math.max(W * .24, 118 * f), ww = 120 * f, wh = 196 * f, wy = fl - wh + 14 * f;
    o.push(`<ellipse cx="${wx + ww / 2}" cy="${fl + 14 * f}" rx="${ww * .6}" ry="${8 * f}" fill="#4A3B2C" opacity=".15"/>
      <rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="${6 * f}" fill="${C.woodDk}"/><rect x="${wx + 8 * f}" y="${wy + 14 * f}" width="${ww - 16 * f}" height="${wh - 30 * f}" rx="${3 * f}" fill="#6B4A2C"/>
      <path d="M${wx - 6 * f} ${wy - 4 * f} h${ww + 12 * f} v${14 * f} h${-ww - 12 * f} z" fill="${C.wood}"/>
      <path d="M${wx + 14 * f} ${wy + 32 * f} H${wx + ww - 14 * f}" stroke="#C9C2B4" stroke-width="${3 * f}" stroke-linecap="round"/>`);
    [[.28, C.berry], [.52, '#7E5BB5'], [.76, C.leafLt]].forEach(([p, col]) => { const hx = wx + ww * p;
      o.push(`<path d="M${hx} ${wy + 32 * f} q-4 -7 2 -9 M${hx - 12 * f} ${wy + 46 * f} L${hx} ${wy + 36 * f} L${hx + 12 * f} ${wy + 46 * f}" fill="none" stroke="#C9C2B4" stroke-width="${2 * f}"/>
        <path d="M${hx - 13 * f} ${wy + 46 * f} h${26 * f} l${4 * f} ${70 * f} h${-34 * f} z" fill="${col}" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/>`); });
    o.push(`<path d="M${wx + ww} ${wy + 6 * f} L${wx + ww + 30 * f} ${wy + 20 * f} L${wx + ww + 30 * f} ${wy + wh - 14 * f} L${wx + ww} ${wy + wh - 6 * f} Z" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="2"/>
      <circle cx="${wx + ww + 22 * f}" cy="${wy + wh / 2}" r="${3.5 * f}" fill="${C.gold}"/>`);
    // the hat stand, on the left
    const hx = cx - Math.max(W * .24, 118 * f) - 96 * f, hy = fl - 176 * f;
    o.push(`<ellipse cx="${hx}" cy="${fl + 12 * f}" rx="${30 * f}" ry="${7 * f}" fill="#4A3B2C" opacity=".15"/>
      <path d="M${hx} ${fl + 10 * f} V${hy}" stroke="${C.woodDk}" stroke-width="${7 * f}" stroke-linecap="round"/>
      <path d="M${hx - 26 * f} ${fl + 12 * f} L${hx} ${fl - 10 * f} L${hx + 26 * f} ${fl + 12 * f}" fill="none" stroke="${C.woodDk}" stroke-width="${6 * f}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M${hx - 22 * f} ${hy + 18 * f} L${hx} ${hy + 6 * f} L${hx + 22 * f} ${hy + 18 * f}" fill="none" stroke="${C.woodDk}" stroke-width="${5 * f}" stroke-linecap="round"/>
      <g transform="translate(${hx - 22 * f} ${hy + 22 * f}) scale(${f})"><path d="M-12 8 L0 -18 L12 8 Z" fill="${C.berry}" stroke="#A93E4F" stroke-width="1.6" stroke-linejoin="round"/><circle cy="-18" r="4" fill="${C.gold}"/></g>
      <g transform="translate(${hx + 20 * f} ${hy + 22 * f}) scale(${f})"><path d="M-6 -2 q6 -4 12 0 l-2 40 h-8 z" fill="${C.apple}"/><path d="M-6 6 h12 M-5 16 h11 M-4 26 h10" stroke="#fff" stroke-width="3"/></g>`);
    o.push(A.tint(theme, W, H)); // the theme's colour wash over the room (not over Bonnie or her glow)
    o.push(themeMagic(theme, W, top, fl, f));
    // a soft light on Bonnie, so she stands out on every theme
    if (bon) o.push(`<defs><radialGradient id="psGlow"><stop offset="0" stop-color="#FFF8E6" stop-opacity=".85"/><stop offset=".6" stop-color="#FFF8E6" stop-opacity=".35"/><stop offset="1" stop-color="#FFF8E6" stop-opacity="0"/></radialGradient></defs>
      <ellipse id="psHalo" cx="${bon.x}" cy="${bon.y}" rx="${bon.w * .82}" ry="${bon.h * .62}" fill="url(#psGlow)"/>`);
    // the rug Bonnie stands on
    const rx = Math.min(W * .3, 170 * f);
    o.push(`<ellipse cx="${cx}" cy="${H - 22 * f}" rx="${rx}" ry="${20 * f}" fill="${C.berry}"/><ellipse cx="${cx}" cy="${H - 22 * f}" rx="${rx - 9 * f}" ry="${13 * f}" fill="none" stroke="${C.gold}" stroke-width="${3 * f}" stroke-dasharray="2 ${8 * f}" stroke-linecap="round"/>`);
    return { svg: o.join(''), f, fl,
      window: { x: hx + 40 * f, y: fl - 200 * f, w: Math.max(60, cx - Math.max(W * .16, 86 * f) - (hx + 40 * f)), h: 116 * f } };
  }

  /* ---------- the screen ---------- */
  const ON = '#4E8F3E', ON_DK = '#356B2A', OWN = '#7E5BB5', OWN_DK = '#5B3F8C'; // Wearing (green) and Yours (purple)
  const STYLE = `
  .ps-on #screen>.card.shop,.ps-on .hud,.ps-on .butterfly,.ps-on .frog,.ps-on .meadow{display:none!important}
  .ps-on #app{max-width:none;padding:0;min-height:0}
  .ps-on{background:#F6E7C8!important;overflow-x:hidden}
  .ps{position:relative;display:flex;flex-direction:column;margin:0 auto;overflow:hidden}
  .ps .pm-bar{position:absolute;left:0;right:0;top:0}
  .ps-room{position:relative;flex:1 1 auto;min-height:230px;overflow:hidden}
  .ps-wall{position:absolute;left:0;right:0;top:0}
  .ps-room>svg{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
  .ps-win{position:absolute;border:6px solid ${C.woodDk};border-radius:12px 12px 4px 4px;box-shadow:0 4px 0 rgba(74,59,44,.25)}
  .ps-win::before,.ps-win::after{content:'';position:absolute;background:${C.woodDk}}
  .ps-win::before{left:50%;top:0;bottom:0;width:5px;margin-left:-2.5px}.ps-win::after{top:46%;left:0;right:0;height:5px}
  .ps-say{position:absolute;z-index:3;left:50%;transform:translateX(-50%);width:max-content;max-width:min(calc(100% - 24px),500px);padding:10px 16px 11px;border-radius:16px;background:${C.paper};
    border:2px solid #D9C7A6;box-shadow:0 3px 0 #D9C7A6;font:400 17px/1.4 Andika,system-ui,sans-serif;color:${C.ink};text-align:center}
  .ps-say::after{content:'';position:absolute;left:50%;bottom:-10px;width:16px;height:16px;margin-left:-8px;background:${C.paper};border-right:2px solid #D9C7A6;border-bottom:2px solid #D9C7A6;transform:rotate(45deg)}
  .ps-bon{position:absolute;z-index:2;border:0;margin:0;padding:0;background:transparent;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
  .ps-bon svg{width:100%;height:100%;display:block;overflow:visible}
  .ps-bon:focus-visible{outline:4px solid ${C.goldDk};outline-offset:2px;border-radius:24px}
  .ps-bon.hop{animation:psHop .55s ease-out}
  @keyframes psHop{30%{transform:translateY(-16px)}60%{transform:translateY(0)}80%{transform:translateY(-5px)}}
  .ps-bon .eyes{transform-box:fill-box;transform-origin:50% 50%;animation:blink 5s infinite}
  .ps-bon .tail{transform-box:fill-box;transform-origin:0% 100%;animation:wag 1.4s ease-in-out infinite}
  .ps-try{position:absolute;z-index:3;display:inline-flex;align-items:center;gap:5px;padding:4px 12px 5px;border-radius:999px;font:700 16px/1.1 Fredoka,system-ui,sans-serif;white-space:nowrap}
  .ps-try svg{width:16px;height:16px;flex:none}
  .ps-try.k-buy,.ps-try.k-short{background:rgba(255,251,241,.95);color:${C.woodInk};border:2.5px dashed ${C.goldDk}}
  .ps-try.k-owned{background:${OWN};color:#fff;border:2.5px solid ${OWN_DK};box-shadow:0 3px 0 ${OWN_DK}}
  .ps-try.k-active{background:${ON};color:#fff;border:2.5px solid ${ON_DK};box-shadow:0 3px 0 ${ON_DK}}
  .ps-twinkle{animation:psTw 2.6s ease-in-out infinite}
  @keyframes psTw{50%{opacity:.35}}
  .ps-low{flex:none;position:relative;z-index:4;background:#F6E7C8;border-top:4px solid ${C.woodDk};padding:8px 0 calc(8px + env(safe-area-inset-bottom))}
  .ps-act{display:flex;align-items:center;gap:10px;min-height:60px;padding:0 12px;max-width:780px;margin:0 auto}
  .ps-what{flex:1;min-width:0}
  .ps-what b{display:block;font:700 19px/1.15 Fredoka,system-ui,sans-serif;color:${C.woodInk};overflow:hidden;text-overflow:ellipsis}
  .ps-what small{display:flex;align-items:center;gap:4px;margin-top:3px;font:600 16px/1.2 Fredoka,system-ui,sans-serif;color:#7A5A38}
  .ps-what small svg{width:16px;height:16px;flex:none}
  .ps-what small.k-active{color:${ON_DK}}.ps-what small.k-owned{color:${OWN_DK}}.ps-what small.k-buy{color:#8A6516}.ps-what small.k-short{color:#6B655A}.ps-what small.k-prize{color:#8E4452}
  .ps-what small.k-fresh{color:${OWN_DK};animation:psPop .6s ease-out}
  .ps-what .ps-hint{font:400 17px/1.3 Andika,system-ui,sans-serif;color:${C.ink}}
  .ps-do{flex:none;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:56px;min-width:128px;max-width:52%;padding:4px 16px;border:0;border-radius:14px;
    font:700 20px/1.1 Fredoka,system-ui,sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
  .ps-do>span{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
  .ps-do svg{width:30px;height:20px;flex:none}
  .ps-do.buy{background:${C.gold};color:${C.woodInk};box-shadow:0 4px 0 ${C.goldDk}}
  .ps-do.wear{background:${ON};color:#fff;box-shadow:0 4px 0 ${ON_DK}}
  .ps-do.off{background:${C.woodLt};color:${C.woodInk};box-shadow:0 4px 0 ${C.woodDk}}
  .ps-do.swap{background:${C.berry};color:#fff;box-shadow:0 4px 0 #A93E4F}
  .ps-do.using{background:#E3F1DC;color:${ON_DK};box-shadow:0 4px 0 #A9CC98;cursor:default}
  .ps-do.short{background:#EAE3D6;color:#4F4A42;box-shadow:0 4px 0 #A89F8E;cursor:default}
  .ps-do.short{font-size:17px}
  .ps-do:not(.using):not(.short):active{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.25)}
  .ps-do:focus-visible,.ps-tab:focus-visible,.ps-card:focus-visible{outline:4px solid ${C.goldDk};outline-offset:2px}
  .ps-meter{display:block;width:100%;height:8px;border-radius:4px;background:rgba(74,59,44,.15);overflow:hidden}.ps-meter i{display:block;height:100%;background:${C.gold};border-radius:4px}
  .ps-tabs{display:flex;gap:6px;justify-content:center;padding:8px 10px 2px;max-width:780px;margin:0 auto}
  .ps-tab{flex:1 1 0;min-width:0;max-width:180px;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:50px;padding:0 6px;border:2px solid ${C.woodDk};border-radius:12px;
    background:${C.woodLt};font:700 17px/1 Fredoka,system-ui,sans-serif;color:${C.woodInk};box-shadow:0 3px 0 ${C.woodDk};cursor:pointer;touch-action:manipulation}
  .ps-tab[aria-pressed="true"]{background:${C.paper};border-color:${C.goldDk};box-shadow:0 3px 0 ${C.goldDk},0 0 0 3px rgba(242,193,78,.55)}
  .ps-tab svg{width:26px;height:26px;flex:none}
  .ps-tab.minor{flex:0 1 auto;max-width:130px;margin-left:6px;background:${C.paper};border-color:#C9B79A;box-shadow:0 3px 0 #C9B79A;color:#7A5A38;font-weight:600}
  .ps-tab.minor svg{opacity:.7}
  @media (max-width:440px){.ps-tab{font-size:16px;gap:3px;padding:0 3px}.ps-tab svg{width:20px;height:20px}.ps-tabs{gap:4px;padding-left:6px;padding-right:6px}}
  .ps-where{display:flex;align-items:center;justify-content:space-between;gap:8px;max-width:780px;margin:6px auto 0;padding:0 14px;font:600 16px/1.2 Fredoka,system-ui,sans-serif;color:#7A5A38;min-height:24px}
  .ps-where b{font-weight:700;color:${C.woodInk};overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .ps-coll{flex:none;display:inline-flex;align-items:center;gap:4px;padding:2px 10px 3px;border-radius:999px;background:${OWN};color:#fff;font:700 16px/1.15 Fredoka,system-ui,sans-serif}
  .ps-coll svg{width:15px;height:15px}
  .ps-coll.soft{background:transparent;color:#7A5A38;padding:0;font-weight:600}
  .ps-railwrap{position:relative}
  .ps-railwrap::before,.ps-railwrap::after{content:'';position:absolute;top:0;bottom:0;width:30px;z-index:1;pointer-events:none;opacity:0;transition:opacity .2s}
  .ps-railwrap::before{left:0;background:linear-gradient(90deg,#F6E7C8,rgba(246,231,200,0))}.ps-railwrap::after{right:0;background:linear-gradient(270deg,#F6E7C8,rgba(246,231,200,0))}
  .ps-railwrap.more-l::before,.ps-railwrap.more-r::after{opacity:1}
  .ps-track{position:relative;height:8px;margin:0 auto 2px;width:min(60%,320px);border-radius:4px;background:rgba(154,106,58,.22)}
  .ps-track i{position:absolute;top:0;bottom:0;border-radius:4px;background:${C.woodDk}}
  .ps-rail{display:grid;grid-auto-flow:column;grid-template-rows:repeat(var(--rows,1),auto);grid-auto-columns:auto;gap:10px;overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;
    scroll-snap-type:x proximity;scroll-padding:0 56px;padding:10px 14px 12px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .ps-rail::-webkit-scrollbar{display:none}
  .ps-card{scroll-snap-align:start;position:relative;display:grid;grid-template-rows:auto 1fr auto;justify-items:center;align-items:start;gap:4px;margin:0;padding:8px 6px 9px;border:2px solid #D9C7A6;border-radius:14px;
    background:${C.paper};box-shadow:0 3px 0 #D9C7A6;cursor:pointer;color:${C.ink};text-align:center;font:inherit;-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:transform .12s}
  .ps-card.k-active{border:3px solid ${ON};box-shadow:0 3px 0 ${ON_DK}}
  .ps-card.k-owned{border:3px solid ${OWN};background:#F8F3FF;box-shadow:0 3px 0 ${OWN_DK}}
  .ps-card.k-short .ps-th{opacity:.7}
  .ps-card.k-prize{border-color:#E2D3B4;box-shadow:0 2px 0 #E2D3B4}
  .ps-card .ps-badge{position:absolute;top:-8px;right:-6px;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;color:#fff;border:2px solid #fff;box-shadow:0 2px 0 rgba(0,0,0,.2)}
  .ps-card .ps-badge svg{width:16px;height:16px}
  .ps-card.k-active .ps-badge{background:${ON}}.ps-card.k-owned .ps-badge{background:${OWN}}
  .ps-card[aria-pressed="true"]{transform:translateY(-4px);box-shadow:0 0 0 4px ${C.gold},0 0 0 6px ${C.goldDk},0 6px 10px rgba(74,59,44,.25)}
  .ps-card.fresh{animation:psPop .7s ease-out}
  @keyframes psPop{0%{transform:scale(.85)}55%{transform:scale(1.08)}100%{transform:scale(1)}}
  .ps-card{width:var(--cw,124px)}
  .ps-card.pressed{transform:translateY(2px)}
  .ps-th{display:grid;place-items:center;width:var(--th,84px);height:var(--th,84px)}
  .ps-th>svg,.ps-fur>svg{width:100%;height:100%;display:block}
  .ps-fur{display:block;width:100%;height:100%}
  .ps-sw{display:block;width:86%;height:86%;border:5px solid ${C.woodDk};border-radius:12px 12px 4px 4px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.35)}
  .ps-card b{font:700 16px/1.15 Fredoka,system-ui,sans-serif;color:${C.woodInk};display:-webkit-box;-webkit-line-clamp:var(--lines,2);-webkit-box-orient:vertical;overflow:hidden}
  .ps-chip{display:inline-flex;align-items:center;gap:3px;padding:2px 9px 3px;border-radius:999px;background:${C.woodLt};font:700 16px/1.15 Fredoka,system-ui,sans-serif;color:${C.woodInk};white-space:nowrap}
  .ps-chip svg{width:24px;height:16px;flex:none}
  .ps-chip.k-active{background:${ON};color:#fff}.ps-chip.k-owned{background:${OWN};color:#fff}
  .ps-chip.k-active svg,.ps-chip.k-owned svg{width:15px;height:15px}
  .ps-chip.k-buy{background:${C.gold};color:${C.woodInk}}
  .ps-chip.k-short{background:#E6E0D4;color:#5A554C}
  .ps-chip.k-prize{background:#F3E6E8;color:#8E4452}
  .ps-card .ps-meter{width:84%;height:6px;margin-top:2px}
  .ps-card.prize .ps-th{width:calc(var(--th) * .72);height:calc(var(--th) * .72)}
  .ps-card.prize{border-color:#E2D3B4;box-shadow:0 2px 0 #E2D3B4}
  .ps-head{grid-row:1/-1;align-self:stretch;width:82px;box-sizing:border-box;display:grid;place-items:center;padding:8px 6px;border-radius:12px;background:${C.woodLt};border:2px solid ${C.woodDk};box-shadow:0 3px 0 ${C.woodDk};
    font:700 16px/1.2 Fredoka,system-ui,sans-serif;color:${C.woodInk};text-align:center}
  .ps-card.ps-edit{background:#EAE3D6;border-color:#A89F8E;box-shadow:0 3px 0 #A89F8E}
  .ps-arrow{position:absolute;top:50%;z-index:2;width:52px;height:52px;margin-top:-26px;padding:0;border-radius:50%;border:2px solid ${C.woodDk};background:${C.woodLt};box-shadow:0 3px 0 ${C.woodDk};display:grid;place-items:center;cursor:pointer}
  .ps-arrow svg{width:24px;height:24px}.ps-arrow.l{left:4px}.ps-arrow.r{right:4px}.ps-arrow[hidden]{display:none}
  .ps-arrow:active{transform:translateY(2px);box-shadow:0 1px 0 ${C.woodDk}}
  @media (prefers-reduced-motion:reduce){.ps-bon.hop,.ps-bon .eyes,.ps-bon .tail,.ps-twinkle,.ps-card.fresh,.ps-what small.k-fresh{animation:none!important}.ps-card{transition:none}.ps-rail{scroll-behavior:auto}}
  @media (max-height:700px){.ps-track{display:none}.ps-tab{min-height:46px}.ps-tabs{padding-top:6px}.ps-act{min-height:54px}.ps-do{min-height:50px}.ps-low{padding-top:6px}
    .ps-say{font-size:16px;padding:8px 14px 9px}.ps-where{margin-top:3px}.ps-rail{padding-top:8px;padding-bottom:10px}}`;

  function sizes() {
    const W = Math.min(document.documentElement.clientWidth || innerWidth, 1400), Hh = innerHeight, big = W >= 600;
    return { W, H: Math.max(Hh, 560), big, rows: big && Hh >= 1000 ? 2 : 1, th: big ? 104 : Hh < 700 ? 74 : 84, cw: big ? 150 : 124, cwPrize: big ? 184 : 150 };
  }
  const label = it => {
    const st = state(it), k = kindOf(st), more = it.cost - save().bones;
    const what = k === 'active' ? (it.kind === 'theme' ? 'Yours, and you are using it' : 'Yours, and Bonnie is wearing it') : k === 'owned' ? 'Yours'
      : k === 'short' ? `${it.cost} bones. You need ${more} more` : `${it.cost} bones`;
    return `${it.name}. ${what}.`;
  };
  const meter = it => { const more = it.cost - save().bones; return `<span class="ps-meter" aria-hidden="true"><i style="width:${Math.max(4, Math.round((it.cost - more) / it.cost * 100))}%"></i></span>`; };
  function chipHTML(it) {
    const k = kindOf(state(it));
    if (k === 'active') return `<span class="ps-chip k-active">${tick}${activeWord(it)}</span>`;
    if (k === 'owned') return `<span class="ps-chip k-owned">${starIcon}Yours</span>`;
    return `<span class="ps-chip k-${k}">${boneIcon}${it.cost}</span>${k === 'short' ? meter(it) : ''}`;
  }
  function cardHTML(it) {
    const k = kindOf(state(it)), badge = k === 'active' ? tick : k === 'owned' ? starIcon : '';
    return `<button class="ps-card k-${k}${it.kind === 'prize' ? ' prize' : ''}${fresh.has(it.id) ? ' fresh' : ''}" data-id="${ui.esc(it.id)}" data-k="${k}" aria-pressed="${!!(sel && sel.tab === tab && sel.id === it.id)}" aria-label="${ui.esc(label(it))}">
      ${badge ? `<span class="ps-badge" aria-hidden="true">${badge}</span>` : ''}<span class="ps-th" aria-hidden="true">${thumb(it)}</span><b aria-hidden="true">${ui.esc(it.name)}</b><span aria-hidden="true">${chipHTML(it)}</span></button>`;
  }
  // the words on Bonnie's badge in the room, for the thing chosen
  function tryWords(it) {
    const k = kindOf(state(it)), look = it.kind === 'theme';
    if (k === 'active') return [k, tick, activeWord(it)];
    if (k === 'owned') return [k, starIcon, look ? 'Yours: just looking' : 'Yours: trying on'];
    return [k, '', look ? 'Just looking' : 'Trying on'];
  }
  // how much of this section is the child's: "4 of 25 yours"
  function collHTML() {
    if (tab === 'prizes') return `<span class="ps-coll soft">Set by your grown-up</span>`;
    const list = all(tab), n = list.filter(x => x.own).length;
    return `<span class="ps-coll" id="psColl" aria-label="${n} of ${list.length} are yours">${starIcon}${n} of ${list.length} yours</span>`;
  }
  // the panel under Bonnie: what's chosen, and the one thing you can do with it
  function actHTML() {
    const it = chosen();
    if (!it) {
      const hint = tab === 'prizes' ? 'Real prizes are set by your grown-up. Tap one to see it.' : tab === 'themes' ? 'Tap a theme to see it in Bonnie\'s room.' : 'Tap something on the rail to try it on!';
      return `<div class="ps-what"><span class="ps-hint">${hint}</span></div>`;
    }
    const st = state(it), k = kindOf(st), more = it.cost - save().bones;
    // what it is to the child, in words and the state's colour
    const sub = fresh.has(it.id) ? ['fresh', starIcon, 'New in your collection!']
      : k === 'active' ? ['active', tick, it.kind === 'theme' ? 'Yours, and on now' : 'Yours. Bonnie is wearing it']
      : k === 'owned' ? ['owned', starIcon, 'Yours! In your collection']
      : k === 'buy' ? ['buy', '', 'Not yours yet. You have enough bones!']
      : k === 'prize' ? ['prize', '', it.desc || 'A real prize. A grown-up says yes.']
      : ['short', '', it.kind === 'prize' ? `A real prize. Save up ${more} more bones` : `Not yours yet. Save up ${more} more bones`];
    const btn = {
      buy: [`<span>Buy ${boneIcon}${it.cost}</span>`, `Buy the ${it.name} for ${it.cost} bones`],
      wear: [`<span>${it.kind === 'theme' ? 'Use it' : 'Wear it'}</span>`, `${it.kind === 'theme' ? 'Use' : 'Wear'} the ${it.name}`],
      off: [`<span>Take it off</span>`, `Take off the ${it.name}`],
      using: [`<span>${tick}${activeWord(it)}</span>`, it.kind === 'theme' ? `You are using the ${it.name}` : `Bonnie is wearing the ${it.name}`],
      swap: [`<span>Swap ${boneIcon}${it.cost}</span>`, `Swap ${it.cost} bones for: ${it.name}`],
      short: [`<span>${more} more ${boneIcon}</span>${meter(it)}`, `${it.cost} bones. You need ${more} more bones`],
    }[st];
    return `<div class="ps-what"><b>${ui.esc(it.name)}</b><small class="k-${sub[0]}">${sub[1]}${ui.esc(sub[2])}</small></div>
      <button class="ps-do ${st}" id="psDo" aria-label="${ui.esc(btn[1])}"${st === 'using' || st === 'short' ? ' aria-disabled="true"' : ''}>${btn[0]}</button>`;
  }

  function draw() {
    if (!engShop()) return;
    const t0 = performance.now();
    on = true; document.body.classList.add('ps-on');
    if (!tab) { const want = Q.get('shoptab'); tab = TABS.some(x => x.id === want) ? want : ({ hats: 'gear', themes: 'themes', prizes: 'prizes' })[engTab()] || 'gear';
      const ti = Q.get('try'); if (ti && all(tab).some(x => x.id === ti)) sel = { tab, id: ti }; }
    // the engine's section has to match ours, so its buttons are there to press
    const want = TABS.find(x => x.id === tab).eng;
    if (engTab() !== want) { const b = engShop().querySelector(`[data-tab="${want}"]`); if (b) { b.click(); return; } }
    const z = sizes(), S = save(), back = viaClub ? 'Clubhouse' : 'Meadow';
    const own = ownedNow(); if (ownedWas) own.filter(id => !ownedWas.includes(id)).forEach(id => fresh.add(id)); ownedWas = own;
    const engSay = engShop().querySelector('#shopSay');
    if (said === null) said = engSay ? engSay.textContent : '';
    const el = document.createElement('div');
    el.className = 'ps'; el.style.width = z.W + 'px'; el.style.height = z.H + 'px';
    const gs = groups(tab);
    const rail = gs.map(g => `${gs.length > 1 || tab === 'prizes' ? `<div class="ps-head" aria-hidden="true">${ui.esc(g.head)}</div>` : ''}${g.list.map(cardHTML).join('')}`).join('')
      + (tab === 'prizes' ? `<button class="ps-card ps-edit" id="psEdit" aria-label="Grown-ups: change these prizes"><span class="ps-th" aria-hidden="true">${lockIcon}</span><b aria-hidden="true">Grown-ups: change these prizes</b><span></span></button>` : '');
    el.innerHTML = `
      <div class="ps-room" id="psRoom">
        <div class="ps-wall" id="psWall" aria-hidden="true"></div>
        <svg id="psRoomArt" aria-hidden="true"></svg>
        <div class="ps-win" id="psWin" aria-hidden="true"></div>
        <p class="ps-say" id="psSay" role="status">${ui.esc(said)}</p>
        <button class="ps-bon" id="psBon" aria-label="Bonnie the dog. Tap to tickle her"></button>
        <span class="ps-try" id="psTry" hidden aria-hidden="true">Trying on</span>
      </div>
      <div class="pm-bar">
        <div class="pm-tags"><button class="pm-tag" id="psBack" aria-label="Back to the ${back}"><svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="M7 -8 L-5 0 L7 8" fill="none" stroke="${C.woodInk}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${back}</span></button></div>
        <h1 class="pm-title">Bone Shop</h1>
        <div class="pm-tag" id="psBones" role="img" aria-label="You have ${S.bones} ${S.bones === 1 ? 'bone' : 'bones'}"><svg viewBox="-22 -14 44 28" aria-hidden="true">${A.bone(0, 0, 1)}</svg><span aria-hidden="true">${S.bones}</span></div>
      </div>
      <div class="ps-low">
        <div class="ps-act" id="psAct">${actHTML()}</div>
        <div class="ps-tabs" role="group" aria-label="Shop sections">${TABS.map(x => `<button class="ps-tab${x.id === 'prizes' ? ' minor' : ''}" data-tab="${x.id}" aria-pressed="${x.id === tab}">${TAB_ICONS[x.id]}<span>${x.name}</span></button>`).join('')}</div>
        <div class="ps-where"><b id="psWhere" aria-hidden="true">${ui.esc(gs[0] ? gs[0].head : '')}</b>${collHTML()}</div>
        <div class="ps-railwrap">
          <button class="ps-arrow l" id="psL" tabindex="-1" aria-hidden="true"><svg viewBox="-12 -12 24 24"><path d="M5 -8 L-5 0 L5 8" fill="none" stroke="${C.woodInk}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <div class="ps-rail" id="psRail" role="group" aria-label="${TABS.find(x => x.id === tab).name}" style="--rows:${z.rows};--cw:${tab === 'prizes' ? z.cwPrize : z.cw}px;--th:${z.th}px;--lines:${tab === 'prizes' ? 3 : 2}">${rail}</div>
          <button class="ps-arrow r" id="psR" tabindex="-1" aria-hidden="true"><svg viewBox="-12 -12 24 24"><path d="M-5 -8 L5 0 L-5 8" fill="none" stroke="${C.woodInk}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        </div>
        <div class="ps-track" aria-hidden="true"><i id="psThumb"></i></div>
      </div>`;
    const old = ui.$('#screen > .ps'); if (old) old.remove();
    ui.$('#screen').appendChild(el);
    const railEl = ui.$('#psRail');
    railEl.scrollLeft = railX[tab] || 0;
    paint();
    wire();
    arrows();
    peek();
    if (sel) { const c = railEl.querySelector(`[data-id="${esc(sel.id)}"]`); if (c && railX[tab] === undefined) inView(c); }
    setTimeout(() => { fresh.clear(); }, 50); // their pop plays once
    // Bonnie mirrors what the engine has her say (after buying, wearing, swapping)
    if (engSay) new MutationObserver(() => setSay(engSay.textContent, true)).observe(engSay, { childList: true, characterData: true, subtree: true });
    if (refocus) { const f = ui.$(refocus); if (f) f.focus({ preventScroll: true }); refocus = null; }
    lastDraw = performance.now() - t0;
  }

  // the room, Bonnie and her words, fitted to the space above the rail
  function paint() {
    const room = ui.$('#psRoom'); if (!room) return;
    const W = room.clientWidth, H = room.clientHeight, S = save(), it = chosen();
    const theme = it && it.kind === 'theme' ? it.id : (S.theme || 'day');
    const barB = ui.$('.ps .pm-bar').getBoundingClientRect().bottom - room.getBoundingClientRect().top;
    const say = ui.$('#psSay'); say.style.top = (barB + 10) + 'px';
    const sayB = say.offsetTop + say.offsetHeight + 14;
    const bh = Math.max(96, Math.min(H - sayB - 8, W * .6, 360)), bw = bh * 120 / 124;
    const R = roomSVG(W, H, theme, barB, { x: W / 2, y: H - 10 - bh * .5, w: bw, h: bh });
    const art = ui.$('#psRoomArt'); art.setAttribute('viewBox', `0 0 ${W} ${H}`); art.innerHTML = R.svg;
    Object.assign(ui.$('#psWall').style, { height: R.fl + 'px', background: (M.THEMES.find(x => x.id === theme) || M.THEMES[0]).sw });
    const win = ui.$('#psWin'), th = M.THEMES.find(x => x.id === theme) || M.THEMES[0], ww = Math.min(R.window.w, 150 * R.f);
    Object.assign(win.style, { left: (R.window.x) + 'px', top: R.window.y + 'px', width: ww + 'px', height: R.window.h + 'px', background: th.sw });
    const bon = ui.$('#psBon');
    Object.assign(bon.style, { width: bw + 'px', height: bh + 'px', left: (W / 2 - bw / 2) + 'px', top: (H - 10 - bh) + 'px' });
    const over = it && it.kind === 'gear' ? { [it.slot.key]: it.id } : null;
    bon.innerHTML = lookSVG(over);
    bon.style.cssText += it && it.kind === 'coat' ? ';' + coatStyle(it.coat) : ';--fur:;--fur-dk:;--fur-lt:';
    if (!(it && it.kind === 'coat')) ['--fur', '--fur-dk', '--fur-lt'].forEach(p => bon.style.removeProperty(p));
    // Bonnie's badge: "Trying on" / "Just looking" (dashed: not yours), "Yours: trying on" (purple), "Wearing" / "Using now" (green)
    const tr = ui.$('#psTry'), show = it && it.kind !== 'prize';
    tr.hidden = !show;
    if (show) {
      const [k, icon, words] = tryWords(it);
      tr.className = 'ps-try k-' + k; tr.innerHTML = icon + ui.esc(words);
      tr.style.left = Math.max(8, Math.min(W - 8 - tr.offsetWidth, W / 2 + bw * .36)) + 'px'; tr.style.top = (H - 10 - bh * .42) + 'px';
    }
    bon.setAttribute('aria-label', `Bonnie the dog${show && it.kind !== 'theme' ? `, ${tryWords(it)[2].toLowerCase().replace('yours: ', '')} the ${it.name}` : ''}. Tap to tickle her`);
  }
  function setSay(text, bounce) {
    said = text; const p = ui.$('#psSay'); if (!p) return;
    p.textContent = text; paint();
    if (bounce && !reduce()) ui.animate(ui.$('#psBon'), 'hop', 560);
  }
  // the arrows, the faded edges, the track and the section name follow the rail
  function arrows() {
    const r = ui.$('#psRail'); if (!r) return;
    const L = r.scrollLeft > 8, R = r.scrollLeft + r.clientWidth < r.scrollWidth - 8, wrap = r.parentNode;
    ui.$('#psL').hidden = !L; ui.$('#psR').hidden = !R;
    wrap.classList.toggle('more-l', L); wrap.classList.toggle('more-r', R);
    const th = ui.$('#psThumb'); if (th) { const k = r.clientWidth / Math.max(r.scrollWidth, 1); th.style.width = Math.max(10, k * 100) + '%'; th.style.left = (r.scrollLeft / Math.max(r.scrollWidth, 1) * 100) + '%'; th.parentNode.hidden = k >= .99; }
    // the section of the first card fully in view
    const box = r.getBoundingClientRect(), first = [...r.children].find(c => { const b = c.getBoundingClientRect(); return b.left >= box.left + 40 && c.dataset.id; }) || r.querySelector('[data-id]');
    if (first) { const g = groups(tab).find(g => g.list.some(x => x.id === first.dataset.id)); const w = ui.$('#psWhere'); if (g && w && w.textContent !== g.head) w.textContent = g.head; }
  }
  // the chosen card, fully in view and clear of the arrows
  function inView(card) {
    const r = ui.$('#psRail'), a = card.getBoundingClientRect(), b = r.getBoundingClientRect(), pad = 62;
    let d = a.left < b.left + pad ? a.left - b.left - pad : a.right > b.right - pad ? a.right - b.right + pad : 0;
    if (!d) return;
    // land on a snap point (a card's start 56 in from the edge), going at least as far as needed, so the snap can't pull it back
    const snaps = [...new Set(ui.$$('.ps-card', r).map(c => Math.round(c.getBoundingClientRect().left - b.left - 56)))];
    const fwd = snaps.filter(s => s >= d).sort((x, y) => x - y)[0], back = snaps.filter(s => s <= d).sort((x, y) => y - x)[0];
    if (d > 0 && fwd !== undefined && a.left - fwd >= b.left + 56) d = fwd; else if (d < 0 && back !== undefined) d = back;
    r.scrollBy({ left: d, behavior: reduce() || Q.get('shoptest') ? 'auto' : 'smooth' });
  }
  // the first time, the rail slides a little and back, to show it moves
  function peek() {
    const r = ui.$('#psRail'); if (peeked || !r || reduce() || Q.get('shoptest') || Q.get('try') || r.scrollWidth <= r.clientWidth + 8 || r.scrollLeft > 0) return;
    peeked = true;
    setTimeout(() => { if (!on) return; r.scrollTo({ left: 70, behavior: 'smooth' }); setTimeout(() => { if (on && Math.abs(r.scrollLeft - 70) < 10) r.scrollTo({ left: 0, behavior: 'smooth' }); }, 650); }, 900);
  }

  function pick(it, card) {
    sel = { tab, id: it.id };
    ui.$$('.ps-card[data-id]').forEach(c => c.setAttribute('aria-pressed', c === card));
    ui.$('#psAct').innerHTML = actHTML(); wireAct();
    inView(card);
    paint();
    if (ui.tone) ui.tone(700, .06, 'sine', .07);
    if (!reduce()) ui.animate(ui.$('#psBon'), 'hop', 560);
    if ((it.kind === 'gear' || it.kind === 'coat') && !it.on) { const on = [].concat(M.LINES.hatOn), l = on[Math.floor(Math.random() * on.length)]; setSay(ui.fmt(l)); ui.say(l); }
  }
  function act() {
    const it = chosen(); if (!it) return;
    const st = state(it);
    if (st === 'short') { const n = it.cost - save().bones, line = window.MeadowLook.LINES.shopShort(n); setSay(line, true); ui.say(line); return; }
    if (st === 'using') return;
    const b = engBtn(it, st); if (!b) return;
    refocus = '#psDo';
    b.click(); // the engine's own button: its confirm box, its save, its words
  }
  function wireAct() { const d = ui.$('#psDo'); if (d) d.onclick = act; }
  function wire() {
    ui.$$('.ps-card[data-id]').forEach(c => {
      const it = all(tab).find(x => x.id === c.dataset.id);
      c.addEventListener('pointerdown', () => c.classList.add('pressed'));
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => c.addEventListener(ev, () => c.classList.remove('pressed')));
      c.onclick = () => pick(it, c);
    });
    wireAct();
    ui.$$('.ps-tab').forEach(b => b.onclick = () => {
      if (b.dataset.tab === tab) return;
      railX[tab] = ui.$('#psRail').scrollLeft; tab = b.dataset.tab; sel = null; refocus = `.ps-tab[data-tab="${tab}"]`;
      const want = TABS.find(x => x.id === tab).eng;
      if (engTab() !== want) engShop().querySelector(`[data-tab="${want}"]`).click(); // the engine redraws; so do we
      else { if (ui.sfx && ui.sfx.pop) ui.sfx.pop(); draw(); }
    });
    const rail = ui.$('#psRail');
    rail.addEventListener('scroll', () => { railX[tab] = rail.scrollLeft; arrows(); ui.$$('.ps-card.pressed').forEach(c => c.classList.remove('pressed')); }, { passive: true });
    // a page, in whole columns of cards, less one, so the last column seen stays in view and the cards land where they snap
    const step = () => {
      const xs = [...new Set(ui.$$('.ps-card', rail).map(c => Math.round(c.offsetLeft)))].sort((a, b) => a - b);
      const pitch = xs.length > 1 ? xs[1] - xs[0] : 0, cw = (ui.$('.ps-card', rail) || {}).offsetWidth || 0;
      if (pitch < 40) return Math.max(120, rail.clientWidth - 150);
      const fit = Math.floor((rail.clientWidth - 112 + (pitch - cw)) / pitch); // 56 each side is kept clear for the arrows
      return Math.max(1, fit - 1) * pitch;
    };
    const go = d => { peeked = true; rail.scrollBy({ left: d * step(), behavior: reduce() || Q.get('shoptest') ? 'auto' : 'smooth' }); if (ui.tone) ui.tone(520, .05, 'sine', .05); };
    ui.$('#psL').onclick = () => go(-1); ui.$('#psR').onclick = () => go(1);
    const bon = ui.$('#psBon');
    bon.onclick = () => { const t = ui.tickle(bon); setSay(t); ui.say(t, { pitch: 1.4 }); };
    const ed = ui.$('#psEdit'); if (ed) ed.onclick = () => { const e = engShop().querySelector('#editPrizes'); if (e) { leaveSoon(); e.click(); } };
    ui.$('#psBack').onclick = () => {
      if (viaClub) { // the engine's own Back goes to the real Clubhouse; the prototype goes to the prototype's
        const carry = ['demo', 'theme'].filter(k => Q.get(k)).map(k => `${k}=${encodeURIComponent(Q.get(k))}`).join('&');
        const club = (window.MeadowLook ? window.MeadowLook.pages : { club: 'prototype-clubhouse.html', maths: 'prototype-maths-map.html', words: 'prototype-words-map.html', walk: 'prototype-walk.html' }).club; location.href = club + (carry && /^prototype-/.test(club) ? '?' + carry : '');
        return;
      }
      const b = engShop().querySelector('#back'); leave(); if (b) b.click(); else M.home();
    };
  }
  function leaveSoon() { /* the engine moves on to the grown-ups' screens itself; the observer takes the shop away */ }
  function leave() { on = false; document.body.classList.remove('ps-on'); const el = ui.$('#screen > .ps'); if (el) el.remove(); }

  /* ---------- fitting into the engine without changing it ---------- */
  function install() {
    ui.$('style#ps-css') || document.head.insertAdjacentHTML('beforeend', `<style id="ps-css">${STYLE}</style>`);
    const screenEl = document.getElementById('screen');
    new MutationObserver(() => {
      const shop = screenEl.querySelector(':scope > .card.shop');
      if (shop && !screenEl.querySelector(':scope > .ps')) draw();
      else if (!shop && on) leave();
    }).observe(screenEl, { childList: true });
    if (screenEl.querySelector(':scope > .card.shop')) draw(); // opened before this loaded (#shop)
    let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (on) draw(); }, 200); });
  }

  /* ---------- checks (shoptest=1) ---------- */
  async function shoptest() {
    const out = [], ok = (name, pass, detail = '') => out.push({ name, pass: !!pass, detail: String(detail) });
    const wait = ms => new Promise(r => setTimeout(r, ms)), r = el => el.getBoundingClientRect();
    const cross = (a, b) => a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2;
    const snap = () => JSON.stringify(M.save.load());
    const tabTo = async id => { const b = ui.$(`.ps-tab[data-tab="${id}"]`); if (b && b.getAttribute('aria-pressed') !== 'true') { b.click(); await wait(120); } };
    await wait(600);
    if (!engShop()) { M.shop({}); await wait(200); }
    const t0 = performance.now(); M.shop({}); await wait(150); const openMs = performance.now() - t0;
    ok('the shop opens as the dressing room (the engine\'s list hidden)', !!ui.$('#screen > .ps') && getComputedStyle(engShop()).display === 'none');
    // every item, in every section, and its state the same as the engine's own buttons
    const bad = {}, note = (k, v) => (bad[k] = bad[k] || []).push(v);
    let small = [], text = [], labels = 0, cards = 0;
    for (const T of TABS) {
      await tabTo(T.id);
      const eng = [...engShop().querySelectorAll('.shop-grid .card.item')];
      const mine = T.id === 'gear' || T.id === 'coats' ? [...all('gear'), ...all('coats')] : all(T.id);
      const want = T.id === 'gear' ? M.HATS.length : T.id === 'coats' ? M.COATS.length : T.id === 'themes' ? M.THEMES.length : save().rewards.length;
      const shown = ui.$$('.ps-card[data-id]');
      if (shown.length !== want) note('count', `${T.id} ${shown.length}/${want}`);
      if (eng.length !== mine.length) note('count', `${T.id}: engine ${eng.length}, mine ${mine.length}`);
      mine.forEach((it, i) => {
        const e = eng[i]; if (!e) return;
        const st = state(it), has = s => !!e.querySelector(s);
        const engSt = has('[data-buy]') ? 'buy' : has('[data-off]') ? 'off' : has('[data-wear],[data-coat]') ? 'wear' : has('[data-usetheme]:not([disabled])') ? 'wear'
          : has('[data-usetheme][disabled]') ? 'using' : has('[data-prize]') ? 'swap' : has('.meter') ? 'short' : /Wearing/.test(e.textContent) ? 'using' : '?';
        if (st !== engSt) note('state', `${it.id} ${st}≠${engSt}`);
        if (!new RegExp(String(it.cost)).test(e.textContent) && !it.own) note('price', it.id);
      });
      if (T.id === 'prizes') {
        const eh = [...engShop().querySelectorAll('h3.tier')].map(h => h.textContent), mh = ui.$$('.ps-head').map(h => h.textContent);
        if (eh.join('|') !== mh.join('|')) note('tiers', `${eh} ≠ ${mh}`);
      }
      shown.forEach(c => { cards++; const a = r(c); if (a.width < 100 || a.height < 120) small.push(`${c.dataset.id} ${a.width.toFixed(0)}×${a.height.toFixed(0)}`);
        if (/\d/.test(c.getAttribute('aria-label') || '') || /Yours|wearing|using|have it/i.test(c.getAttribute('aria-label'))) labels++;
        [c.querySelector('b'), c.querySelector('.ps-chip')].forEach(x => { if (x && parseFloat(getComputedStyle(x).fontSize) < 16) text.push(c.dataset.id); }); });
    }
    ok('every gear item, coat, theme and prize is on the rail', !bad.count, (bad.count || []).join(', '));
    ok('each thing\'s state (buy, wear, take off, using, swap, more bones) is the engine\'s', !bad.state && !bad.price, [...(bad.state || []), ...(bad.price || [])].join(', '));
    ok('the prizes are grouped as the engine groups them', !bad.tiers, (bad.tiers || []).join(''));
    ok('every card is a generous tap (100 × 120 or more)', !small.length, small.slice(0, 4).join(', '));
    ok('every card has a VoiceOver name with its price or that it\'s yours', labels === cards, `${labels} of ${cards}`);
    ok('names and prices are 16px or more', !text.length, text.slice(0, 4).join(', '));
    // the whole shop on one screen, nothing too wide, Bonnie clear of her words and the panel
    await tabTo('gear');
    ok('the shop fits the screen (no page scrolling, nothing too wide)', document.documentElement.scrollHeight <= innerHeight + 2 && document.documentElement.scrollWidth <= innerWidth + 1, `${document.documentElement.scrollWidth}×${document.documentElement.scrollHeight}`);
    const bon = r(ui.$('#psBon')), sayR = r(ui.$('#psSay')), low = r(ui.$('.ps-low')), bar = r(ui.$('.ps .pm-bar'));
    ok('Bonnie is big, in the middle, and clear of her words, the bar and the panel', bon.height >= 110 && Math.abs((bon.left + bon.right) / 2 - innerWidth / 2) < 4 && !cross(bon, sayR) && bon.bottom <= low.top + 2 && sayR.top >= bar.bottom - 6, `${bon.height.toFixed(0)} tall`);
    ok('the tabs and the main button are 44 × 44 or more', ui.$$('.ps-tab').every(b => r(b).height >= 44 && r(b).width >= 44), ui.$$('.ps-tab').map(b => r(b).width.toFixed(0)).join(', '));
    // the five states look and read differently, on the card, on Bonnie's badge and in the panel
    {
      const seen = {}, wrong = [];
      for (const T of ['gear', 'coats', 'themes', 'prizes']) {
        await tabTo(T);
        ui.$$('.ps-card[data-id]').forEach(c => {
          const it = all(T).find(x => x.id === c.dataset.id), k = kindOf(state(it)), chip = c.querySelector('.ps-chip');
          const want = k === 'active' ? activeWord(it) : k === 'owned' ? 'Yours' : String(it.cost);
          if (c.dataset.k !== k || !chip.classList.contains('k-' + k) || !chip.textContent.includes(want) || (k === 'short') !== !!c.querySelector('.ps-meter')) wrong.push(`${it.id} ${k}`);
          if (!seen[k]) seen[k] = { bg: getComputedStyle(chip).backgroundColor, border: getComputedStyle(c).borderTopColor, T, id: it.id };
        });
      }
      const ks = Object.keys(seen), looks = new Set(ks.map(k => seen[k].bg));
      ok('each card shows its state: Wearing, Yours, its price, or its price and how close', !wrong.length, wrong.slice(0, 4).join(', '));
      ok('the states have their own colours', looks.size === ks.length, ks.map(k => `${k} ${seen[k].bg}`).join('; '));
      // Bonnie's badge and the panel, for one of each
      const bad2 = [];
      for (const k of ['active', 'owned', 'buy', 'short']) {
        const x = seen[k]; if (!x || x.T === 'prizes') continue;
        await tabTo(x.T); const it = all(x.T).find(i => i.id === x.id);
        ui.$(`.ps-card[data-id="${esc(it.id)}"]`).click(); await wait(60);
        const b = ui.$('#psTry'), sm = ui.$('#psAct small'), d = ui.$('#psDo');
        const words = { active: activeWord(it), owned: 'Yours', buy: it.kind === 'theme' ? 'Just looking' : 'Trying on', short: it.kind === 'theme' ? 'Just looking' : 'Trying on' }[k];
        const btn = { active: it.kind === 'gear' ? /Take it off/ : /Wearing|Using/, owned: /Wear it|Use it/, buy: new RegExp(`Buy.*${it.cost}`), short: /more/ }[k];
        const panel = { active: /Yours/, owned: /Yours/, buy: /Not yours yet/, short: /Not yours yet.*more/ }[k];
        if (b.hidden || !b.classList.contains('k-' + k) || !b.textContent.includes(words) || !btn.test(d.textContent) || !panel.test(sm.textContent)) bad2.push(`${k}: "${b.textContent}" / "${d.textContent.trim()}" / "${sm.textContent}"`);
        if ((k === 'buy' || k === 'short') && getComputedStyle(b).borderTopStyle !== 'dashed') bad2.push(k + ' badge not dashed');
      }
      ok('Bonnie\'s badge and the panel say the same: Trying on / Just looking, Yours, Wearing, Buy, more bones', !bad2.length, bad2.join(' | ') || ks.join(', '));
    }
    // the rail: it shows it scrolls, its arrows are big and work, the chosen card stays clear of them, it says where you are
    {
      await tabTo('gear'); M.shop({}); await wait(150);
      const rail = ui.$('#psRail'), R = ui.$('#psR'), L = ui.$('#psL'), wrap = rail.parentNode;
      const over = rail.scrollWidth > rail.clientWidth + 8;
      ok('the gear rail scrolls, with an arrow and a faded edge to say so', over && !R.hidden && wrap.classList.contains('more-r') && r(R).width >= 44 && r(R).height >= 44, `${rail.scrollWidth} in ${rail.clientWidth}, arrow ${r(R).width.toFixed(0)}`);
      const x0 = rail.scrollLeft, firstIds = ui.$$('.ps-card[data-id]').filter(c => r(c).right <= r(rail).right - 2).map(c => c.dataset.id);
      R.click(); await wait(80);
      const lastSeen = firstIds[firstIds.length - 1], ls = ui.$(`.ps-card[data-id="${esc(lastSeen)}"]`);
      ok('the right arrow moves along a page, keeping a card you\'d seen in view, and the left arrow appears', rail.scrollLeft > x0 + 60 && !L.hidden && r(ls).right > r(rail).left && r(ls).left < r(rail).right, `moved ${Math.round(rail.scrollLeft - x0)}`);
      L.click(); await wait(80);
      ok('…and the left arrow goes back', Math.abs(rail.scrollLeft - x0) < 4);
      // a card half under the right arrow: tapping it brings it fully into view
      const half = ui.$$('.ps-card[data-id]').find(c => r(c).left < r(rail).right && r(c).right > r(R).left);
      if (half) { half.click(); await wait(80); const a = r(half), ar = r(R);
        ok('a card half hidden at the edge comes fully into view when tapped, clear of the arrows', a.right <= ar.left + 2 && a.left >= r(rail).left, half.dataset.id); }
      rail.scrollLeft = rail.scrollWidth; rail.dispatchEvent(new Event('scroll')); await wait(80);
      const where = ui.$('#psWhere').textContent, lastHead = groups('gear').slice(-1)[0].head;
      ok('the line above the rail names the section you\'re in as you go', where === lastHead, where);
      const owned = all('gear').filter(x => x.own).length;
      ok('…and counts what\'s yours ("4 of 25 yours")', ui.$('#psColl').textContent.includes(`${owned} of ${all('gear').length}`), ui.$('#psColl').textContent);
      rail.scrollLeft = 0; await wait(40);
    }
    // a theme: the room changes (wall, window, its own magic) and Bonnie keeps her light; the words stay on paper
    {
      await tabTo('themes');
      const t = all('themes').find(x => !x.on && x.id !== 'day' && x.id !== 'pixel') || all('themes').find(x => !x.on);
      ui.$(`.ps-card[data-id="${esc(t.id)}"]`).click(); await wait(80);
      const wall = ui.$('#psWall').style.background, magic = ui.$('#psRoomArt .ps-magic'), halo = ui.$('#psHalo');
      const sayBg = getComputedStyle(ui.$('#psSay')).backgroundColor, bonOn = r(ui.$('#psBon')), haloR = r(halo);
      ok('a theme changes the room: its wall, its window and its own touch (stars, lights, snow…)', !!wall && !!magic && magic.dataset.theme === t.id && ui.$('#psWin').style.background === wall, t.id);
      ok('…while Bonnie keeps a soft light around her and her words stay on plain paper', !!halo && haloR.width >= bonOn.width && sayBg === 'rgb(255, 251, 241)', sayBg);
    }
    // prizes are there, but quieter than dressing Bonnie
    {
      const g = r(ui.$('.ps-tab[data-tab="gear"]')), pt = ui.$('.ps-tab[data-tab="prizes"]'), ptw = r(pt).width, last = pt === ui.$$('.ps-tab').slice(-1)[0], minor = pt.classList.contains('minor');
      await tabTo('prizes');
      const pth = ui.$('.ps-card.prize .ps-th'), pr = pth ? r(pth) : null;
      await tabTo('gear'); const gth = r(ui.$('.ps-card .ps-th'));
      ok('Prizes is the quiet tab, last and smaller, and its pictures are smaller', minor && ptw < g.width && last && (!pr || pr.width < gth.width), `${ptw.toFixed(0)} vs ${g.width.toFixed(0)}`);
    }
    // trying on: Bonnie changes, nothing is saved
    const before = snap(), bonBefore = ui.$('#psBon').innerHTML;
    const nOwn = all('gear').find(it => !it.own) || all('gear')[0];
    ui.$(`.ps-card[data-id="${esc(nOwn.id)}"]`).click(); await wait(80);
    ok('tapping something tries it on Bonnie, and spends and saves nothing', ui.$('#psBon').innerHTML !== bonBefore && snap() === before && ui.$(`.ps-card[data-id="${esc(nOwn.id)}"]`).getAttribute('aria-pressed') === 'true', nOwn.id);
    const doB = ui.$('#psDo');
    ok('the button says what you can do, with the price', !!doB && r(doB).height >= 44 && (state(nOwn) !== 'buy' || new RegExp(`Buy.*${nOwn.cost}`).test(doB.textContent)) && (state(nOwn) !== 'short' || /more/.test(doB.textContent)), doB && doB.textContent.trim());
    // buying goes through the engine's own "Buy it?" box
    const buyIt = all('gear').concat(all('coats')).find(it => state(it) === 'buy');
    if (buyIt) {
      await tabTo(buyIt.kind === 'coat' ? 'coats' : 'gear');
      ui.$(`.ps-card[data-id="${esc(buyIt.id)}"]`).click(); await wait(60); ui.$('#psDo').click(); await wait(200);
      const m = ui.$('.modal-bg');
      ok('Buy opens the engine\'s own "Buy it for … bones?" box', !!m && new RegExp(`${buyIt.cost} bones`).test(m.textContent), buyIt.id);
      if (m) { const no = m.querySelector('[data-a="no"]'); if (no) no.click(); else m.remove(); await wait(150); }
      ok('…and "Not now" spends nothing', snap() === before);
    }
    // buying for real (the pretend save): the engine's "Yes, buy it!", then the card is Yours and Wearing, and pops
    const toBuy = all('gear').find(it => state(it) === 'buy');
    if (toBuy) {
      await tabTo('gear');
      ui.$(`.ps-card[data-id="${esc(toBuy.id)}"]`).click(); await wait(60); ui.$('#psDo').click(); await wait(150);
      const yes = ui.$('.modal-bg [data-a="yes"]'); if (yes) yes.click(); await wait(300);
      const c = ui.$(`.ps-card[data-id="${esc(toBuy.id)}"]`);
      ok('after "Yes, buy it!", it is Bonnie\'s: the card says Wearing and pops, the panel says "New in your collection!"', save().owned.hats.includes(toBuy.id) && c && c.dataset.k === 'active' && c.classList.contains('fresh') && /New in your collection/.test(ui.$('#psAct').textContent), toBuy.id);
      // put the pretend save back exactly as it was
      M.save.mutate(s => { const o = JSON.parse(before); Object.keys(s).forEach(k => delete s[k]); Object.assign(s, o); }); ui.applyTheme(); M.shop({}); await wait(200);
    }
    // wearing and taking off, through the engine (the pretend save), then put back as it was
    const wearIt = all('gear').find(it => it.own && !it.on);
    if (wearIt) {
      await tabTo('gear'); ui.$(`.ps-card[data-id="${esc(wearIt.id)}"]`).click(); await wait(60); ui.$('#psDo').click(); await wait(250);
      ok('Wear puts it on Bonnie (the engine saves it) and the rail says Wearing', save()[wearIt.slot.key] === wearIt.id && /Wearing/.test(ui.$(`.ps-card[data-id="${esc(wearIt.id)}"]`).textContent), wearIt.id);
      ui.$('#psDo').click(); await wait(250);
      ok('Take it off takes it off', save()[wearIt.slot.key] !== wearIt.id);
      M.save.mutate(s => { const o = JSON.parse(before); s.hat = o.hat; s.face = o.face; s.neck = o.neck; }); M.shop({}); await wait(150);
    }
    // a theme shows in the window; a coat on Bonnie; neither is saved
    await tabTo('themes');
    const th = all('themes').find(it => !it.on), win0 = ui.$('#psWin').style.background;
    ui.$(`.ps-card[data-id="${esc(th.id)}"]`).click(); await wait(80);
    ok('a theme shows in the room\'s window (and nothing is saved)', ui.$('#psWin').style.background !== win0 && snap() === before, th.id);
    await tabTo('coats');
    const co = all('coats').find(it => !it.on);
    ui.$(`.ps-card[data-id="${esc(co.id)}"]`).click(); await wait(80);
    ok('a coat shows on Bonnie (and nothing is saved)', ui.$('#psBon').style.getPropertyValue('--fur').trim() === co.coat.fur && snap() === before, co.id);
    // prizes: the engine's grown-up hold, and the grown-ups' sum check
    await tabTo('prizes');
    const pz = all('prizes').find(it => state(it) === 'swap');
    if (pz) {
      ui.$(`.ps-card[data-id="${esc(pz.id)}"]`).click(); await wait(60); ui.$('#psDo').click(); await wait(200);
      const m = ui.$('.modal-bg');
      ok('Swap opens the engine\'s "Get a grown-up!" hold, and spends nothing yet', !!m && /grown-up/i.test(m.textContent) && snap() === before, pz.name);
      if (m) { const no = m.querySelector('[data-a="no"]'); if (no) no.click(); else m.remove(); await wait(150); }
    }
    ui.$('#psEdit').click(); await wait(200);
    const g = ui.$('.modal-bg');
    ok('"Grown-ups: change these prizes" asks the engine\'s grown-ups sum first', !!g && /Grown-ups only/i.test(g.textContent));
    if (g) { const c = g.querySelector('[data-a="cancel"]'); if (c) c.click(); else g.remove(); await wait(150); }
    if (!ui.$('#screen > .ps')) { M.shop({}); await wait(150); }
    // not enough bones: Bonnie says how many more, nothing happens
    const sh = all('prizes').find(it => state(it) === 'short');
    if (sh) { ui.$(`.ps-card[data-id="${esc(sh.id)}"]`).click(); await wait(60); ui.$('#psDo').click(); await wait(60);
      ok('without enough bones, the button says how many more and does nothing', /more/.test(ui.$('#psSay').textContent) && !ui.$('.modal-bg') && snap() === before, sh.name); }
    ok('the shop draws quickly (for the 2018 iPad)', openMs < 400 && lastDraw < 120, `opened in ${openMs.toFixed(0)} ms, redrawn in ${lastDraw.toFixed(0)} ms`);
    ok('the pretend child\'s save is just as it was', snap() === before);
    // from the Clubhouse's stall, Back says "Clubhouse" (and goes there); here it is pressed as from the meadow, to stay on this page
    if (viaClub) { ok('opened from the Clubhouse, Back says "Clubhouse"', /Clubhouse/.test(ui.$('#psBack').textContent)); M.home(); }
    else ui.$('#psBack').click();
    await wait(300);
    ok('leaving the shop takes the dressing room away', !ui.$('#screen > .ps') && !document.body.classList.contains('ps-on'));
    const pre = document.createElement('pre'); pre.id = 'selftest'; pre.textContent = JSON.stringify({ size: [innerWidth, innerHeight], passed: out.filter(x => x.pass).length, of: out.length, results: out }, null, 1);
    document.body.appendChild(pre);
  }

  window.ProtoShop = { install, draw, shoptest };
  install();
  if (Q.get('shoptest')) shoptest();
})();
