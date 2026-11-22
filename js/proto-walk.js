/* Bonnie's Walk PROTOTYPE (not part of the game yet).
 *
 * The Walk as a little journey through the meadow: a compact illustrated scene at the top (past the Clubhouse, over
 * the stream, by the burrow, through the woods, into the flower clearing, to the picnic and the bone bowl). Five
 * wooden posts mark the stops: a number for a stop still to come, gold for the one Bonnie is at, a paw stamp (the
 * journal's paw print) for one that's done. Bonnie trots along the path leaving paw prints, wags after each stop,
 * runs off to dig on a surprise dig, and celebrates at the end, where the finish shows the bones, the streak and this
 * week's paw prints from the journal.
 *
 * It runs on the real Walk: prototype-walk.html loads bonnies-walk.html unchanged and adds this file, so the
 * questions, the mixes, Bonnie's help, Teach Bonnie, the dig, the bones and the streak are all the engine's own.
 * This file only reads the engine's walk strip (#walkPath: its stones and aria-valuenow, #wdig) to draw the scene,
 * restyles the dig a little (drawn treasures instead of emoji), and shows the engine's own "Walk done!" box as an
 * illustrated finish whose buttons press the engine's buttons. Nothing is saved by this file.
 *
 * Page options: see prototype-walk.html. walktest=1 runs the checks (they put the pretend save back afterwards).
 */
(function () {
  const Q = new URLSearchParams(location.search);
  const M = window.Meadow, A = window.ProtoArt, C = A.C, ui = M.ui, esc = ui.esc;
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = () => ui.reduceMotion();
  const W = 560, H = 260, BK = .6; // the scene, in drawing units; Bonnie's size in it
  const INK = '#B5485A', INK_DK = '#7E2E3D'; // the journal's walk ink
  // the path: the Clubhouse, five stops, the picnic
  const START = [52, 160], STOPS = [[100, 206], [180, 142], [262, 208], [348, 144], [432, 208]], HOME = [506, 152];
  const SKIES = {
    day: ['#BFE6F5', '#E9F6EF', '#B9D9B0', C.gold], sunset: ['#F7B6A0', '#FFE3C2', '#C9C79A', '#F59A5B'], sea: ['#9FDCEB', '#D4F3F1', '#A9D6B8', C.gold],
    snow: ['#D6E6F3', '#F4F8FB', '#E4EEF2', '#FFF3C8'], night: ['#1C2140', '#3B4377', '#5A7A72', '#F3EEDF', 1], space: ['#0F1430', '#2B2F5E', '#5A6A7A', '#F6B66A', 1],
    christmas: ['#173B2C', '#2F5E48', '#6E9C86', '#FFF4E0', 1], pixel: ['#8ED3FF', '#CBEFFF', '#B9D9B0', C.gold], volcano: ['#2A1A17', '#7A3A26', '#7A6A52', '#FF8A3D', 1],
  };

  /* ---------- the drawing ---------- */
  // a smooth line through the points (as the engine's own trail), split into one piece per leg of the walk
  function legs(pts) {
    return pts.slice(1).map((p, j) => {
      const i = j + 1, a = pts[i - 1], p0 = pts[i - 2] || a, p3 = pts[i + 1] || p;
      return `M${a[0]},${a[1]} C${(a[0] + (p[0] - p0[0]) / 6).toFixed(1)},${(a[1] + (p[1] - p0[1]) / 6).toFixed(1)} ${(p[0] - (p3[0] - a[0]) / 6).toFixed(1)},${(p[1] - (p3[1] - a[1]) / 6).toFixed(1)} ${p[0]},${p[1]}`;
    });
  }
  function miniClubhouse(x, y) { // x,y = the middle of the front step
    return `${A.shadow(x, y + 2, 30, 5)}<rect x="${x - 24}" y="${y - 30}" width="48" height="30" rx="3" fill="${C.woodDk}"/><rect x="${x - 22}" y="${y - 30}" width="44" height="28" rx="3" fill="${C.wood}"/>
      <path d="M${x - 30} ${y - 27} L${x} ${y - 52} L${x + 30} ${y - 27} Z" fill="${C.berry}"/><circle cx="${x}" cy="${y - 37}" r="5" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="1.4"/>
      <path d="M${x - 6} ${y - 2} V${y - 16} Q${x} ${y - 22} ${x + 6} ${y - 16} V${y - 2} Z" fill="#7A4A26"/><rect x="${x - 19}" y="${y - 24}" width="9" height="8" rx="1.5" fill="#CFEAF4" stroke="${C.woodDk}" stroke-width="1.2"/><rect x="${x + 10}" y="${y - 24}" width="9" height="8" rx="1.5" fill="#CFEAF4" stroke="${C.woodDk}" stroke-width="1.2"/>
      <rect x="${x - 1}" y="${y - 70}" width="2" height="20" fill="${C.woodDk}"/><path d="M${x + 1} ${y - 69} l12 3 l-12 4 z" fill="${C.gold}"/>`;
  }
  function picnic(x, y) { // the end of the walk: a blanket, the bone bowl and a little flag
    const checks = [];
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2 === 0) checks.push(`<rect x="${-30 + i * 12}" y="${-9 + j * 6}" width="12" height="6" fill="${C.berry}"/>`);
    return `<g transform="translate(${x} ${y})">${A.shadow(0, 8, 40, 7)}<g transform="skewX(-18)"><rect x="-30" y="-9" width="60" height="18" fill="#FFF6E2"/>${checks.join('')}<rect x="-30" y="-9" width="60" height="18" fill="none" stroke="#A93E4F" stroke-width="1.2"/></g>
      <path d="M18 -6 h22 l-4 9 h-14 z" fill="#3B7FC4" stroke="#245A91" stroke-width="1.4"/>${A.bone(29, -8, .32)}${A.bone(25, -11, .28)}
      <rect x="34" y="-58" width="3" height="54" rx="1.2" fill="${C.woodDk}"/><path id="pwFlag" d="M37 -57 l22 6 l-22 7 z" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1.2"/></g>`;
  }
  function sceneArt(theme) {
    const sky = SKIES[theme] || SKIES.day, dark = !!sky[4], s = new A.Scene(W, H), all = [START, ...STOPS, HOME];
    s.defs.push(`<linearGradient id="pwSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>`);
    s.g(`<rect width="${W}" height="${H}" fill="url(#pwSky)"/>`);
    s.g(dark ? `<circle cx="470" cy="34" r="13" fill="${sky[3]}"/>${[[40, 22], [120, 40], [210, 18], [300, 34], [390, 16], [530, 52], [250, 56]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="1.6" fill="#fff" opacity=".85"/>`).join('')}`
             : `<circle cx="470" cy="36" r="16" fill="${sky[3]}" opacity=".95"/>${A.cloud(150, 34, .8)}${A.cloud(330, 26, .65)}`);
    s.g(`<path d="M0 96 Q90 58 190 84 T380 78 T560 82 V120 H0 Z" fill="${sky[2]}"/><path d="M0 108 Q120 80 260 100 T560 94 V130 H0 Z" fill="${C.midHill}" opacity=".9"/>`);
    A.meadowFloor(s, 41, 104);
    A.river(s, 'M156 100 C162 136 128 160 140 190 S128 240 132 270', 20);
    const L = legs(all);
    A.path(s, L.map((d, i) => i ? d.replace(/^M[^C]+/, '') : d).join(' '), 22);
    // the little bridge where the path crosses the stream
    s.add(176, `<g transform="translate(140 174) rotate(-40)">${[-14, -7, 0, 7, 14].map(dx => `<rect x="${dx - 3}" y="-16" width="6" height="32" rx="1.5" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="1.2"/>`).join('')}<path d="M-18 -16 H18 M-18 16 H18" stroke="${C.woodDk}" stroke-width="2.4" stroke-linecap="round"/></g>`);
    // past the Clubhouse
    s.add(146, miniClubhouse(30, 146));
    A.fence(s, [[6, 222], [36, 218], [66, 222]], .7);
    A.flowers(s, 74, 186, 5, 9, 12); // Bonnie sniffs these before she sets off
    // the burrow
    s.add(168, `<path d="M196 170 Q206 142 232 140 Q258 142 266 170 Z" fill="#9ED07A"/><ellipse cx="232" cy="164" rx="12" ry="6" fill="${C.earthDk}"/>
      <ellipse cx="228" cy="152" rx="2.6" ry="8" fill="#F3EEE8" stroke="#D7CEC4" stroke-width="1" transform="rotate(-10 228 152)"/><ellipse cx="236" cy="152" rx="2.6" ry="8" fill="#F3EEE8" stroke="#D7CEC4" stroke-width="1" transform="rotate(10 236 152)"/>`);
    // the woods
    A.tree(s, 304, 128, .55, 'pine', 2); A.tree(s, 318, 118, .48, 'round', 3); A.tree(s, 414, 130, .55, 'pine', 4); A.tree(s, 436, 120, .45, 'pine', 6);
    A.bush(s, 290, 240, .8, undefined, C.berry);
    // the flower clearing, and the picnic at the end
    A.flowers(s, 470, 238, 7, 7, 22); A.flowers(s, 392, 240, 5, 8, 16); A.flowers(s, 214, 244, 4, 12, 14);
    s.add(HOME[1] + 2, picnic(HOME[0] + 6, HOME[1] + 2));
    A.tree(s, 548, 128, .6, 'round', 8);
    A.scatter(s, 23, 30, [0, 112, W, H], [[START[0] - 20, START[1] - 30, 60, 50], ...STOPS.map(([x, y]) => [x - 30, y - 70, 100, 90]), [HOME[0] - 40, HOME[1] - 30, 90, 50], [180, 130, 100, 50]]);
    if (dark) s.over(`<rect width="${W}" height="${H}" fill="#141A3A" opacity=".18" pointer-events="none"/>`);
    else s.over(A.tint(theme, W, H));
    return { art: s.render(), legs: L };
  }
  // a stop's wooden post: its number, gold while Bonnie is there, the journal's paw stamp once it's done
  function post(i, [x, y]) {
    const sx = x + 40, sy = y - 46;
    return `<g class="pw-post" id="pwPost${i}" data-i="${i}">
      ${A.shadow(sx, y + 1, 10, 3)}<rect x="${sx - 3}" y="${sy + 14}" width="6" height="${y - sy - 13}" rx="2" fill="${C.woodDk}"/><rect x="${sx - 3}" y="${sy + 14}" width="4" height="${y - sy - 14}" rx="2" fill="${C.wood}"/>
      <circle class="pw-glow" cx="${sx}" cy="${sy}" r="27" fill="${C.gold}" opacity="0"/>
      <circle class="pw-sign" cx="${sx}" cy="${sy}" r="20" fill="${C.paper}" stroke="${C.woodDk}" stroke-width="3"/>
      <text class="pw-num" x="${sx}" y="${sy + 10.5}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="30" fill="${C.woodInk}">${i + 1}</text>
      <g class="pw-stamp" transform="translate(${sx} ${sy})"><circle r="15" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="20 3 8 3" opacity=".8"/>${A.paw(0, 1, .95, INK, 1, -12)}</g></g>`;
  }
  // Bonnie's dig spot, beside the path between two stops
  function digSpot(at) {
    const a = at > 0 ? STOPS[at - 1] : START, b = STOPS[at] || HOME, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    return [mx + 6, my + (my > 175 ? -36 : 34)];
  }

  /* ---------- the drawn treasures (the dig's emoji, drawn) ---------- */
  const FINDS = {
    '🦴': ['bone', `<g transform="translate(30 30) rotate(-20)">${A.bone(0, 0, 1.15, '#FFF6E2', '#B88A1E')}</g>`],
    '🎾': ['ball', `<circle cx="30" cy="30" r="17" fill="#C9E24A" stroke="#8FA52A" stroke-width="2"/><path d="M15 22 q15 8 0 18 M45 20 q-14 10 0 20" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`],
    '🧸': ['teddy', `<circle cx="18" cy="15" r="6" fill="#B07A45"/><circle cx="42" cy="15" r="6" fill="#B07A45"/><circle cx="30" cy="24" r="13" fill="#C68B52"/><ellipse cx="30" cy="45" rx="14" ry="12" fill="#C68B52"/><ellipse cx="30" cy="28" rx="5" ry="4" fill="#F0D2AA"/><circle cx="25" cy="21" r="1.8" fill="${C.ink}"/><circle cx="35" cy="21" r="1.8" fill="${C.ink}"/><circle cx="30" cy="27" r="1.6" fill="${C.ink}"/>`],
    '💎': ['jewel', `<path d="M14 22 L22 12 H38 L46 22 L30 48 Z" fill="#6CC6E8" stroke="#2F86A8" stroke-width="2" stroke-linejoin="round"/><path d="M14 22 H46 M22 12 L30 22 L38 12 M30 22 V48" stroke="#2F86A8" stroke-width="1.4" fill="none"/><path d="M24 16 l4 4" stroke="#fff" stroke-width="2"/>`],
    '🪙': ['coin', `<circle cx="30" cy="30" r="17" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="2.4"/><circle cx="30" cy="30" r="11" fill="none" stroke="${C.goldDk}" stroke-width="1.4"/>${A.paw(30, 31, .55, C.goldDk)}`],
    '👑': ['crown', `<path d="M12 42 L10 18 L21 28 L30 12 L39 28 L50 18 L48 42 Z" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="2" stroke-linejoin="round"/><circle cx="30" cy="34" r="3.5" fill="${C.berry}"/><circle cx="19" cy="36" r="2.6" fill="#6CC6E8"/><circle cx="41" cy="36" r="2.6" fill="#6CC6E8"/>`],
    '🧦': ['sock', `<path d="M24 10 H38 V34 Q38 46 26 48 Q14 50 12 42 Q11 36 20 34 L24 32 Z" fill="#F2F0EA" stroke="#B9B2A4" stroke-width="2" stroke-linejoin="round"/><path d="M24 14 H38" stroke="${C.berry}" stroke-width="4"/><circle cx="31" cy="28" r="2" fill="#B9B2A4"/>`],
    '🥾': ['boot', `<path d="M20 10 H34 V34 L48 38 Q52 40 50 46 H16 Q14 30 20 10 Z" fill="#8A5A36" stroke="#5E3B20" stroke-width="2" stroke-linejoin="round"/><path d="M22 18 h10 M22 24 h10" stroke="#5E3B20" stroke-width="1.6"/><rect x="15" y="44" width="37" height="5" rx="2" fill="#4A2E1A"/>`],
    '🪱': ['worm', `<path d="M10 40 q8 -16 16 -4 t16 -6 t10 -12" stroke="#E58FAE" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="50" cy="17" r="1.6" fill="${C.ink}"/>`],
    '🍂': ['leaves', `<path d="M14 40 Q14 18 36 14 Q36 36 14 40 Z" fill="#E08A3C" stroke="#9E4A27" stroke-width="1.6"/><path d="M28 46 Q30 26 48 26 Q46 44 28 46 Z" fill="#C9662E" stroke="#9E4A27" stroke-width="1.6"/><path d="M14 40 L32 20 M28 46 L44 30" stroke="#9E4A27" stroke-width="1.2"/>`],
  };
  const findSVG = (key, cls = '') => FINDS[key] ? `<svg class="pw-find ${cls}" viewBox="0 0 60 60" aria-hidden="true" data-find="${FINDS[key][0]}">${FINDS[key][1]}</svg>` : '';
  const sniffIcon = `<svg viewBox="0 0 40 30" aria-hidden="true">${A.paw(14, 17, .9, '#7E5430', 1, -15)}<path d="M28 8 q5 3 0 7 q-5 4 0 8" stroke="#7E5430" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M34 6 q5 4 0 8 q-5 4 0 9" stroke="#7E5430" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/></svg>`;
  const pawIcon = (k = INK_DK) => `<svg viewBox="-12 -13 24 24" aria-hidden="true">${A.paw(0, 0, 1, k)}</svg>`;
  const houseIcon = `<svg viewBox="-12 -12 24 24" aria-hidden="true"><path d="M-10 0 L0 -9 L10 0" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M-7 -1 V9 H7 V-1" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><rect x="-2" y="3" width="4" height="6" fill="currentColor"/></svg>`;
  const boneIcon = `<svg viewBox="-24 -14 48 28" aria-hidden="true">${A.bone(0, 0, 1)}</svg>`;
  const medal = sub => sub === 'english' ? ['abc', 'Words', '#B85C26', '#7E3C16'] : ['1+2', 'Maths', '#4C7E4A', '#2F5530'];

  /* ---------- the screen ---------- */
  const STYLE = `
  body.pw-on #walkPath{display:none!important}
  body.pw-on .walk-hello .walk-stops{display:none}
  body.pw-on .walk-hello{background:${C.paper};border-color:#E3D3B4}
  .pw{position:relative;margin:0 auto 14px;border-radius:20px;overflow:hidden;border:3px solid #C9DDB0;box-shadow:0 4px 0 rgba(74,59,44,.16);background:${C.meadow};line-height:0}
  @media (min-width:700px){.pw{max-width:min(100%,720px,calc((100vh - 560px) * 2.154));min-width:min(100%,480px)}}
  .pw>svg{width:100%;height:auto;display:block;overflow:hidden}
  .pw-tags{position:absolute;left:8px;right:8px;top:7px;display:flex;justify-content:space-between;align-items:flex-start;gap:6px;pointer-events:none;line-height:1.15}
  .pw-tag{display:inline-flex;align-items:center;gap:6px;padding:4px 12px 5px 9px;border-radius:10px;background:${C.paper};box-shadow:0 2px 0 #C9B48E;font:700 17px Fredoka,system-ui,sans-serif;color:${C.woodInk};white-space:nowrap}
  .pw-tag svg{width:18px;height:18px;flex:none}
  .pw-subj{display:inline-flex;align-items:center;gap:6px;padding:3px 10px 4px 4px;border-radius:999px;background:${C.paper};box-shadow:0 2px 0 #C9B48E;font:700 16px Fredoka,system-ui,sans-serif;white-space:nowrap}
  .pw-subj b{display:grid;place-items:center;min-width:28px;height:28px;padding:0 4px;border-radius:999px;color:#fff;font:700 14px Fredoka,system-ui,sans-serif}
  .pw-subj[hidden]{display:none}
  @media (min-width:700px){.pw-tags{left:12px;right:12px;top:10px}.pw-tag{font-size:20px}.pw-subj{font-size:18px}}
  .pw-post .pw-stamp{opacity:0}
  .pw-post.done .pw-num{opacity:0}.pw-post.done .pw-stamp{opacity:1}.pw-post.done .pw-sign{stroke:${INK}}
  .pw-post.now .pw-sign{fill:${C.gold};stroke:${C.goldDk};stroke-width:4}.pw-post.now .pw-glow{opacity:.35}
  .pw-post.stamped .pw-stamp{animation:pwThunk .5s cubic-bezier(.3,1.5,.5,1);transform-box:fill-box;transform-origin:50% 50%}
  .pw-post.now .pw-glow{animation:pwGlow 1.8s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 50%}
  @keyframes pwThunk{0%{opacity:0;transform:scale(1.8) rotate(-20deg)}60%{opacity:1;transform:scale(.92)}}
  @keyframes pwGlow{50%{opacity:.12;transform:scale(1.12)}}
  #pwBon .bob{transform-box:fill-box;transform-origin:50% 100%}
  #pwBon .tail{transform-box:fill-box;transform-origin:0% 100%;animation:pwWag 1.4s ease-in-out infinite}
  #pwBon .eyes{transform-box:fill-box;transform-origin:50% 50%;animation:pwBlink 5s infinite}
  #pwBon.happy .tail{animation-duration:.3s}
  #pwBon.happy .bob{animation:pwHop .3s ease-in-out 2}
  #pwBon.sniff .bob{animation:pwSniff 1.1s ease-in-out 2}
  #pwBon.dig .bob{animation:pwDig .32s ease-in-out infinite}
  #pwBon.party .bob{animation:pwParty 1.1s cubic-bezier(.3,1.2,.5,1) 1}
  @keyframes pwWag{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(14deg)}}
  @keyframes pwBlink{0%,92%,100%{transform:none}95%{transform:scaleY(.1)}}
  @keyframes pwHop{50%{transform:translateY(-10px)}}
  @keyframes pwSniff{30%,60%{transform:rotate(9deg) translateY(2px)}}
  @keyframes pwDig{50%{transform:rotate(-7deg) translateY(2px)}}
  @keyframes pwParty{30%{transform:translateY(-26px) rotate(-12deg)}60%{transform:translateY(-8px) rotate(8deg)}}
  .pw-clod{animation:pwClod .5s ease-out forwards}
  @keyframes pwClod{to{transform:translate(var(--dx),var(--dy));opacity:0}}
  #pwDig .sniffmark{animation:pwBob .6s ease-in-out infinite alternate;transform-box:fill-box}
  @keyframes pwBob{to{transform:translateY(-4px)}}
  .pw-paw{animation:pwPaw .3s ease-out}
  @keyframes pwPaw{from{opacity:0}}

  /* the dig: part of the meadow */
  body.pw-on .dig-head .dig-nose{display:none}
  body.pw-on .dig-head{gap:6px;background:${C.paper};border:2px solid #C9A16E;color:#7E5430;font-family:Fredoka,system-ui,sans-serif;font-size:18px}
  body.pw-on .dig-head svg{width:30px;height:24px}
  body.pw-on .dig-field{background:radial-gradient(ellipse 62% 26% at 50% 100%,#9A6A3A 0 70%,transparent 71%),radial-gradient(ellipse 30% 9% at 18% 46%,#9CCB7E 0 70%,transparent 71%),radial-gradient(ellipse 34% 10% at 80% 44%,#9CCB7E 0 70%,transparent 71%),linear-gradient(180deg,#CFEAF4 0,#E9F6EF 42%,#A8D485 43%,#8FC46B 100%)}
  body.pw-on .mound .find{font-size:0;width:clamp(56px,13vw,76px);height:clamp(56px,13vw,76px)}
  body.pw-on .mound .find svg{width:100%;height:100%;display:block}
  body.pw-on .chip.extra svg{width:18px;height:18px;vertical-align:-3px;margin-right:4px}

  /* the finish */
  .pw-end{position:fixed;inset:0;z-index:60;overflow-y:auto;-webkit-overflow-scrolling:touch;background:linear-gradient(180deg,var(--s0) 0,var(--s1) 34%,${C.meadowLt} 34.1%,${C.meadow} 100%);
    padding:calc(10px + env(safe-area-inset-top)) 16px calc(20px + env(safe-area-inset-bottom));font-family:Andika,system-ui,sans-serif;color:${C.ink};text-align:center}
  .pw-end.in{animation:pwIn .35s ease-out}
  @keyframes pwIn{from{opacity:0}}
  .pw-end-in{max-width:520px;margin:0 auto}
  @media (min-width:700px) and (min-height:860px){.pw-end{display:flex;flex-direction:column;background:linear-gradient(180deg,var(--s0) 0,var(--s1) 40%,${C.meadowLt} 40.1%,${C.meadow} 100%)} .pw-end-in{max-width:640px;margin:auto;width:100%;transform:translateY(-4vh)} .pw-end .pw-hero{max-width:600px}}
  .pw-hero{display:block;width:100%;max-width:440px;height:auto;margin:0 auto -6px}
  .pw-done{display:inline-block;margin:0 0 8px;padding:6px 26px 8px;border-radius:12px;background:${C.woodLt};border:3px solid ${C.woodDk};box-shadow:0 4px 0 ${C.woodDk};font:700 30px/1.1 Fredoka,system-ui,sans-serif;color:${C.woodInk}}
  .pw-card{background:${C.paper};border:2px solid #E3D3B4;border-radius:18px;box-shadow:0 4px 0 rgba(94,59,32,.18);padding:12px 16px 14px;margin:0 0 12px}
  .pw-msg{margin:0 0 8px;font-size:19px;line-height:1.35}
  .pw-bones{display:flex;align-items:center;justify-content:center;gap:10px;margin:4px 0 2px;font:700 24px Fredoka,system-ui,sans-serif;color:${C.woodInk}}
  .pw-bones svg{width:48px;height:28px}
  .pw-note{margin:0;font-size:16px;color:${C.soft}}
  .pw-streak{display:inline-flex;align-items:center;gap:8px;margin:8px 0 0;font:700 19px Fredoka,system-ui,sans-serif;color:${INK_DK}}
  .pw-streak svg{width:24px;height:24px}
  .pw-week h3{margin:0 0 8px;font:700 18px Fredoka,system-ui,sans-serif;color:${C.woodInk}}
  .pw-days{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;max-width:380px;margin:0 auto}
  .pw-day{display:flex;flex-direction:column;align-items:center;gap:2px;font:600 16px Fredoka,system-ui,sans-serif;color:${C.soft}}
  .pw-day i{position:relative;display:block;width:100%;max-width:46px;aspect-ratio:1;border-radius:10px;background:#fff;border:2px solid #E8DCC2}
  .pw-day.later i{background:transparent;border-style:dashed;opacity:.55}
  .pw-day.today{color:${C.ink}}.pw-day.today i{border:3px solid ${C.goldDk}}
  .pw-day svg{position:absolute;inset:14%;width:72%;height:72%}
  .pw-day.today.walked svg{animation:pwThunk .55s cubic-bezier(.3,1.5,.5,1) .5s both}
  .pw-btns{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:4px}
  .pw-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:56px;padding:0 20px;border:0;border-radius:16px;cursor:pointer;font:700 19px Fredoka,system-ui,sans-serif;flex:1 1 220px;max-width:340px;white-space:nowrap}
  .pw-btn svg{width:22px;height:22px}
  .pw-btn.home{background:#4E8F3E;color:#fff;box-shadow:0 4px 0 #356B2A}
  .pw-btn.again{background:${C.woodLt};color:${C.woodInk};box-shadow:0 4px 0 ${C.woodDk}}
  .pw-btn:active{transform:translateY(3px);box-shadow:none}
  .pw-btn:focus-visible{outline:3px solid ${C.goldDk};outline-offset:3px}
  #pwHeroBon{transform-box:fill-box;transform-origin:50% 100%;animation:pwParty 1.1s cubic-bezier(.3,1.2,.5,1) .3s 2}
  #pwHeroBon .tail{transform-box:fill-box;transform-origin:0% 100%;animation:pwWag .35s ease-in-out infinite}
  .pw-sparkle{animation:pwSpark 1.6s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 50%}
  @keyframes pwSpark{50%{transform:scale(.5);opacity:.4}}
  @media (max-height:740px){.pw-hero{max-width:min(100%,300px)}.pw-done{font-size:26px;margin-bottom:6px}.pw-card{padding:8px 12px 10px;margin-bottom:8px}.pw-msg{font-size:18px;margin-bottom:4px}.pw-bones{font-size:21px}.pw-btn{min-height:50px}.pw-days{max-width:300px}.pw-week h3{margin-bottom:4px}}
  .modal-bg.pw-hidden{visibility:hidden!important;transition:none!important;animation:none!important}
  .pw-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  @media (prefers-reduced-motion:reduce){#pwBon *,#pwBon,.pw-post *,.pw-paw,.pw-clod,.pw-end,.pw-end *,#pwDig *{animation:none!important;transition:none!important}}`;

  /* ---------- keeping the scene in step with the engine's walk ---------- */
  let V = null; // the scene now: { wp, n, done, at, digAt, treasure, legs, moving, ended }
  const names = { english: new Set(M.worlds('english').map(w => w.name)), maths: new Set(M.worlds('maths').map(w => w.name)) };
  const subjectOf = stone => stone && names.english.has(stone.getAttribute('title')) ? 'english' : 'maths';

  function build(wp) {
    const theme = document.body.dataset.theme || 'day', art = sceneArt(theme);
    const n = Math.min(5, $$('.wstone', wp).length);
    let el = $('.pw');
    if (!el) { el = document.createElement('div'); el.className = 'pw'; }
    wp.parentNode.insertBefore(el, wp);
    el.setAttribute('role', 'progressbar'); el.setAttribute('aria-label', "Bonnie's walk"); el.setAttribute('aria-valuemin', '0'); el.setAttribute('aria-valuemax', String(n));
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${art.art}
        ${art.legs.map((d, i) => `<path id="pwLeg${i}" d="${d}" fill="none" stroke="none"/>`).join('')}
        <g id="pwPaws"></g><g id="pwDig"></g>
        ${STOPS.slice(0, n).map((p, i) => post(i, p)).join('')}
        <g id="pwBon" style="transform:translate(${START[0]}px,${START[1]}px)"><g class="bob">${A.bonnie(0, 0, BK)}</g></g>
        <g id="pwFx"></g></svg>
      <div class="pw-tags" aria-hidden="true"><span class="pw-tag" id="pwTag"></span><span class="pw-subj" id="pwSubj" hidden></span></div>`;
    V = { wp, n, done: 0, at: 'start', target: 'start', digAt: null, treasure: null, legs: art.legs, moving: null, ended: false, theme };
    if (!reduce() && !Q.get('walktest')) { const b = $('#pwBon'); b.classList.add('sniff'); setTimeout(() => b.classList.remove('sniff'), 2300); }
  }

  // where Bonnie stands for each place on the walk
  const spot = key => key === 'start' ? START : key === 'home' ? HOME : key === 'dig' ? (() => { const [x, y] = digSpot(V.digAt); return [x - 24, y + 6]; })() : STOPS[+key.slice(1)];
  function place(xy) { const b = $('#pwBon'); if (b) b.style.transform = `translate(${xy[0].toFixed(1)}px,${xy[1].toFixed(1)}px)`; }
  function pawAt(x, y, ang, side) {
    const g = $('#pwPaws'); if (!g) return;
    const nx = -Math.sin(ang) * 4 * side, ny = Math.cos(ang) * 4 * side;
    g.insertAdjacentHTML('beforeend', `<g class="pw-paw">${A.paw(x + nx, y + ny + 2, .32, '#8A6A4A', .55, ang * 180 / Math.PI + 90)}</g>`);
  }
  // trot from one place to the next: along the path between stops (leaving paw prints), straight to and from a dig
  function moveTo(key) {
    if (!V || V.at === key) return;
    const from = V.at; V.at = key;
    const b = $('#pwBon'); if (!b) return;
    b.dataset.at = key;
    let leg = null;
    if (from === 'start' && key === 'm0') leg = 0;
    else if (/^m\d$/.test(from) && /^m\d$/.test(key) && +key[1] === +from[1] + 1) leg = +key[1];
    else if (/^m\d$/.test(from) && key === 'home') leg = V.n;
    else if (from === 'dig' && /^m\d$/.test(key)) leg = 'dig-' + key[1];
    const path = typeof leg === 'number' ? document.getElementById('pwLeg' + leg) : null;
    const pts = t => { if (path) { const L = path.getTotalLength(), p = path.getPointAtLength(L * t); return [p.x, p.y]; } const a = spot(from), z = spot(key); return [a[0] + (z[0] - a[0]) * t, a[1] + (z[1] - a[1]) * t]; };
    // paw prints along a leg of the path
    const prints = () => {
      if (!path) return; const L = path.getTotalLength();
      for (let d = 14, k = 0; d < L - 10; d += 16, k++) { const p = path.getPointAtLength(d), q = path.getPointAtLength(Math.min(L, d + 1)); pawAt(p.x, p.y, Math.atan2(q.y - p.y, q.x - p.x), k % 2 ? 1 : -1); }
    };
    if (from === 'dig' && /^m\d$/.test(key)) { const skipped = document.getElementById('pwLeg' + key[1]); if (skipped) { const L = skipped.getTotalLength(); for (let d = 14, k = 0; d < L - 10; d += 16, k++) { const p = skipped.getPointAtLength(d), q = skipped.getPointAtLength(Math.min(L, d + 1)); pawAt(p.x, p.y, Math.atan2(q.y - p.y, q.x - p.x), k % 2 ? 1 : -1); } } }
    if (V.moving) V.moving.finish(); // a trot still going: it ends now, with all its paw prints
    if (reduce()) { place(spot(key)); prints(); arrived(key); return; }
    const t0 = performance.now(), dur = path ? 1000 : 650, L = path ? path.getTotalLength() : 0;
    let next = 14, k = 0, timer = 0;
    const pawsTo = upto => { if (path) while (next < upto && next < L - 10) { const p = path.getPointAtLength(next), q = path.getPointAtLength(Math.min(L, next + 1)); pawAt(p.x, p.y, Math.atan2(q.y - p.y, q.x - p.x), k++ % 2 ? 1 : -1); next += 16; } };
    const done = () => { clearTimeout(timer); pawsTo(L); V.moving = null; place(spot(key)); arrived(key); };
    // (a plain timer rather than animation frames: steady on the 2018 iPad, and in test browsers)
    const step = () => {
      const t = Math.min(1, (performance.now() - t0) / dur), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, [x, y] = pts(e);
      b.style.transform = `translate(${x.toFixed(1)}px,${(y - Math.abs(Math.sin(e * Math.PI * 6)) * 5).toFixed(1)}px)`;
      pawsTo(L * e);
      if (t < 1) timer = setTimeout(step, 16); else done();
    };
    V.moving = { finish: done };
    timer = setTimeout(step, 0);
  }
  function arrived(key) {
    const b = $('#pwBon'); if (!b || reduce()) return;
    b.classList.remove('happy', 'sniff', 'dig', 'party');
    if (key === 'dig') b.classList.add('dig');
    if (key === 'home') { void b.getBBox(); b.classList.add('party'); sparkles(); }
  }
  function sparkles() {
    const fx = $('#pwFx'); if (!fx) return;
    fx.innerHTML = [[-34, -70], [30, -80], [44, -40], [-46, -36], [0, -96]].map(([dx, dy], i) => `<g transform="translate(${HOME[0] + dx} ${HOME[1] + dy})"><path class="pw-sparkle" style="animation-delay:${i * .15}s" d="M0 -7 Q1.5 -1.5 7 0 Q1.5 1.5 0 7 Q-1.5 1.5 -7 0 Q-1.5 -1.5 0 -7Z" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1"/></g>`).join('');
  }
  function drawDig(digging, dug) {
    const g = $('#pwDig'); if (!g || V.digAt == null) return;
    const [x, y] = digSpot(V.digAt), key = `${V.digAt}-${dug}-${V.treasure}`;
    if (g.dataset.k === key) return; g.dataset.k = key;
    g.innerHTML = dug
      ? `${A.shadow(x, y + 3, 18, 4)}<ellipse cx="${x}" cy="${y}" rx="16" ry="7" fill="${C.earth}"/><ellipse cx="${x}" cy="${y}" rx="11" ry="4.5" fill="${C.earthDk}"/><path d="M${x - 20} ${y + 2} q4 -8 10 -4 M${x + 12} ${y - 2} q6 -6 10 2" fill="${C.earthLt}"/>
         ${V.treasure ? `<g transform="translate(${x + 8} ${y - 30}) scale(.42)">${FINDS[V.treasure][1]}</g>` : ''}`
      : `${A.shadow(x, y + 3, 20, 4)}<path d="M${x - 20} ${y + 2} Q${x - 14} ${y - 18} ${x} ${y - 19} Q${x + 15} ${y - 18} ${x + 20} ${y + 2} Z" fill="#9A6A3A"/><path d="M${x - 12} ${y - 8} q6 -6 14 -4" stroke="#B98550" stroke-width="3" fill="none" stroke-linecap="round"/>
         ${digging ? `<g class="sniffmark"><circle cx="${x + 4}" cy="${y - 40}" r="10" fill="${C.paper}" stroke="#C9A16E" stroke-width="1.6"/><text x="${x + 4}" y="${y - 34}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="16" fill="${C.berry}">!</text></g>` : ''}`;
  }

  function sync() {
    const wp = document.getElementById('walkPath');
    if (!wp) { const el = $('.pw'); if (el) el.remove(); V = null; return; }
    document.body.classList.add('pw-on');
    if (!V || V.wp !== wp || !document.contains($('.pw'))) build(wp);
    const n = V.n, done = Math.min(n, +wp.getAttribute('aria-valuenow') || 0);
    const digging = !!$('#walkQ .game-main.digging'), wdig = $('#wdig', wp), dug = !!(wdig && wdig.classList.contains('dug'));
    const area = $('#area'), finished = done >= n;
    if (digging && V.digAt == null) V.digAt = done;
    // the drawn treasures, in the dig itself
    $$('.mound .find').forEach(f => { const t = f.textContent.trim(); if (t && FINDS[t] && !f.querySelector('svg')) { f.dataset.item = FINDS[t][0]; f.innerHTML = findSVG(t); if (f.closest('.mound').classList.contains('treasure')) V.treasure = t; } });
    if (digging && !V.treasure) { const tf = $('.mound.treasure .find'); if (tf && tf.dataset.item) V.treasure = Object.keys(FINDS).find(k => FINDS[k][0] === tf.dataset.item); }
    const chip = $('.chip.extra'); if (chip && !chip.querySelector('svg')) chip.innerHTML = `${pawIcon('#B88A1E')}Extra walk`;
    const head = $('.dig-head'); if (head && !head.querySelector('svg')) head.insertAdjacentHTML('afterbegin', sniffIcon);
    // the posts
    for (let i = 0; i < n; i++) {
      const p = document.getElementById('pwPost' + i); if (!p) continue;
      const was = p.classList.contains('done');
      p.classList.toggle('done', i < done); p.classList.toggle('now', i === done && !digging && !finished);
      if (i < done && !was && V.done < done && !reduce()) { p.classList.remove('stamped'); void p.getBBox(); p.classList.add('stamped'); }
    }
    // Bonnie: a happy wag when a stop is done, then off to the next one
    const key = finished ? 'home' : digging ? 'dig' : (!area && done === 0) ? 'start' : 'm' + done;
    if (done > V.done && !reduce()) { const b = $('#pwBon'); b.classList.remove('sniff', 'dig'); b.classList.add('happy'); setTimeout(() => b.classList.remove('happy'), 650); }
    if (V.target !== key) { V.target = key; const go = () => { if (V && V.target === key) moveTo(key); }; if (done > V.done && !reduce()) setTimeout(go, 380); else go(); }
    V.done = done;
    drawDig(digging, dug);
    // the tags and what VoiceOver hears
    const stones = $$('.wstone', wp), sub = finished ? null : subjectOf(stones[done]);
    const tag = finished ? 'Walk done!' : digging ? 'Surprise dig!' : !area && !done ? `${n} stops on our walk!` : `Stop ${done + 1} of ${n}`;
    const tg = document.getElementById('pwTag'); if (tg.dataset.t !== tag) { tg.dataset.t = tag; tg.innerHTML = `${pawIcon()}<span>${esc(tag)}</span>`; }
    const sj = document.getElementById('pwSubj');
    sj.hidden = !sub || digging || (!area && !done);
    if (sub) { const [m, word, col] = medal(sub); sj.innerHTML = `<b style="background:${col}">${m}</b>${word}`; }
    const el = $('.pw'); el.setAttribute('aria-valuenow', String(done));
    el.setAttribute('aria-valuetext', finished ? `Walk done! All ${n} stops.` : digging ? `A surprise dig, after stop ${done}.` : `Stop ${done + 1} of ${n}${sub ? `, ${medal(sub)[1]}` : ''}. ${done} done, ${n - done} to go.`);
    // the finish: the engine's "Walk done!" box, shown in the meadow
    // (a second box for the same walk, as when answers come very fast, is hidden too and goes with the first)
    $$('.modal-bg').filter(b => b.querySelector('.paw-stamp') && !b.dataset.pw).forEach(b => { if ($('#pwEnd') || $$('.modal-bg[data-pw]').length) { b.dataset.pw = 'extra'; b.classList.add('pw-hidden'); b.setAttribute('aria-hidden', 'true'); } else finish(b); });
  }

  /* ---------- the finish ---------- */
  const pad = x => String(x).padStart(2, '0');
  const dayKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  function heroArt(theme) {
    const sky = SKIES[theme] || SKIES.day, s = new A.Scene(400, 230);
    s.g(`<path d="M0 150 Q110 96 210 120 T400 112 V230 H0 Z" fill="${C.meadowLt}"/><path d="M-10 190 Q200 140 410 186 V240 H-10 Z" fill="${C.meadow}"/>`);
    A.tree(s, 40, 150, .9, 'round', 3); A.tree(s, 362, 146, .8, 'pine', 5); A.tree(s, 330, 160, .6, 'round', 7);
    A.flowers(s, 90, 206, 6, 4, 22); A.flowers(s, 318, 210, 6, 5, 22);
    // bunting
    s.over(`<path d="M30 40 Q200 84 370 40" stroke="${C.woodDk}" stroke-width="1.6" fill="none"/>${Array.from({ length: 9 }, (_, i) => { const x = 50 + i * 38, y = 46 + Math.sin((i + .5) / 9 * Math.PI) * 26; return `<path d="M${x - 10} ${y - 4} L${x + 10} ${y - 2} L${x} ${y + 16} Z" fill="${[C.berry, C.gold, '#3B7FC4', '#3F8B5C'][i % 4]}"/>`; }).join('')}`);
    s.add(196, picnic(130, 196).replace('id="pwFlag"', ''));
    s.over(`<g id="pwHeroBon"><g transform="translate(250 214)">${A.bonnie(0, 0, .98)}</g></g>`);
    s.over([[196, 96], [312, 100], [222, 160], [174, 140], [300, 150]].map(([x, y], i) => `<path class="pw-sparkle" style="animation-delay:${i * .2}s" d="M${x} ${y - 8} Q${x + 2} ${y - 2} ${x + 8} ${y} Q${x + 2} ${y + 2} ${x} ${y + 8} Q${x - 2} ${y + 2} ${x - 8} ${y} Q${x - 2} ${y - 2} ${x} ${y - 8}Z" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1"/>`).join(''));
    return { svg: s.render(), sky };
  }
  function finish(bg) {
    bg.dataset.pw = '1';
    bg.classList.add('pw-hidden'); bg.setAttribute('aria-hidden', 'true');
    const card = $('.modal', bg);
    const msg = (($('h2', card) || {}).nextElementSibling || {}).textContent || '';
    const kind = $('.kind', card), earned = $('.earned', card), note = $('.note', card);
    const bones = earned ? +(earned.textContent.match(/\d+/) || [0])[0] : 0;
    const streak = kind ? kind.textContent.replace(/^[^0-9A-Za-z]+/, '').trim() : '';
    const show = () => {
      if (!bg.isConnected) return;
      const theme = document.body.dataset.theme || 'day', hero = heroArt(theme), sv = M.save.get() || M.save.load(), days = (sv.walks && sv.walks.days) || {};
      const now = new Date(), mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)), t = dayKey(now);
      const week = Array.from({ length: 7 }, (_, i) => new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i));
      const walkedDays = week.filter(d => days[dayKey(d)]).map(d => d.toLocaleDateString('en-GB', { weekday: 'long' }));
      const ov = document.createElement('div'); ov.className = 'pw-end' + (reduce() ? '' : ' in'); ov.id = 'pwEnd';
      ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'pwEndH');
      ov.style.cssText = `--s0:${hero.sky[0]};--s1:${hero.sky[1]}`;
      ov.innerHTML = `<div class="pw-end-in">
        <svg class="pw-hero" viewBox="0 0 400 230" aria-hidden="true">${hero.svg}</svg>
        <h2 class="pw-done" id="pwEndH">Walk done!</h2>
        <div class="pw-card"><p class="pw-msg">${esc(msg)}</p>
          <div class="pw-bones">${boneIcon}<span>${bones} ${bones === 1 ? 'bone' : 'bones'} on our walk!</span></div>
          ${note ? `<p class="pw-note">${esc(note.textContent)}</p>` : ''}
          ${streak ? `<div class="pw-streak">${pawIcon()}<span>${esc(streak)}</span></div>` : ''}</div>
        <div class="pw-card pw-week"><h3>A paw print in your journal</h3>
          <p class="pw-sr">This week: walks on ${walkedDays.join(', ') || 'no days yet'}.</p>
          <div class="pw-days" aria-hidden="true">${week.map((d, i) => { const k = dayKey(d), w = !!days[k] || k === t;
            return `<div class="pw-day${k > t ? ' later' : ''}${k === t ? ' today' : ''}${w ? ' walked' : ''}" data-day="${k}">${'MTWTFSS'[i]}<i>${w ? `<svg viewBox="-12 -13 24 24">${A.paw(0, 0, 1, INK, 1, (i * 37) % 30 - 15)}</svg>` : ''}</i></div>`; }).join('')}</div></div>
        <div class="pw-btns"><button class="pw-btn home" id="pwHome">${houseIcon}Back to the Clubhouse</button><button class="pw-btn again" id="pwAgain">${pawIcon(C.woodInk)}Another walk</button></div></div>`;
      document.body.appendChild(ov);
      const press = a => { ov.remove(); $$('.modal-bg[data-pw="extra"]').forEach(x => x.remove()); const b = $(`[data-a="${a}"]`, bg); if (b) b.click(); };
      $('#pwHome', ov).onclick = () => press('home');
      $('#pwAgain', ov).onclick = () => press('again');
      ov.addEventListener('keydown', e => { if (e.key === 'Escape') press('home'); });
      $('#pwAgain', ov).focus({ preventScroll: true });
      if (!reduce()) setTimeout(() => { ui.tone(150, .12, 'triangle', .16); ui.tone(95, .14, 'sine', .14, .03); }, 600);
    };
    // a moment for Bonnie to reach the picnic in the scene, then the finish (at once with Reduce Motion)
    setTimeout(show, reduce() || Q.get('walktest') ? 0 : 1100);
  }

  /* ---------- fitting in without changing the engine ---------- */
  function install() {
    document.head.insertAdjacentHTML('beforeend', `<style id="pw-css">${STYLE}</style>`);
    let queued = false;
    const later = () => { if (queued) return; queued = true; setTimeout(() => { queued = false; sync(); }, 0); };
    new MutationObserver(list => { if (list.some(m => !(m.target.closest && m.target.closest('.pw, .pw-end')))) later(); })
      .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-valuenow'] });
    // when another walk starts, the old finish goes
    sync();
    screenshotHelpers();
  }
  // ?stop=N and ?end=1: answer the stops straight away, through the engine (for screenshots)
  async function screenshotHelpers() {
    const stop = +Q.get('stop') || 0, end = !!Q.get('end'), digNow = Q.get('dig') === '1' && Q.get('digshot');
    if (!stop && !end && !digNow) return;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    await wait(300); M.walk.skipHello(); await wait(100);
    const goal = end ? 99 : stop ? stop - 1 : 99;
    for (let k = 0; k < 12; k++) {
      const r = M.round(); if (!r || $('.modal-bg')) break;
      if (digNow && $('#walkQ .game-main.digging')) break;
      if (!digNow && r.index >= goal && !$('#walkQ .game-main.digging')) break;
      M.correct(null, { auto: false }); M.next(); await wait(60);
    }
    // ?digfind=1: dig mounds until the treasure turns up
    if (digNow && Q.get('digfind')) for (const m of $$('.mound')) { if (!$('#walkQ .game-main.digging')) break; m.click(); await wait(250); if (m.classList.contains('treasure')) break; }
  }

  /* ---------- checks (walktest=1) ---------- */
  async function walktest() {
    const out = [], ok = (name, pass, detail = '') => out.push({ name, pass: !!pass, detail: String(detail) });
    const wait = ms => new Promise(r => setTimeout(r, ms)), r = el => el.getBoundingClientRect();
    const save = () => M.save.get() || M.save.load(), before = JSON.stringify(save());
    const until = async (fn, ms = 4000) => { const t0 = Date.now(); while (!fn() && Date.now() - t0 < ms) await wait(40); return fn(); };
    await until(() => $('.pw'));
    const scene = $('.pw'), svg = $('.pw > svg');
    ok("the meadow scene shows, in place of the old strip (which VoiceOver no longer hears twice)", !!scene && getComputedStyle(document.getElementById('walkPath')).display === 'none');
    const n = V.n;
    ok(`five numbered posts on the path, and Bonnie at the Clubhouse, sniffing the flowers`, $$('.pw-post').length === n && n === 5 && $('#pwBon').dataset.at !== 'm0' && /stops on our walk/.test($('#pwTag').textContent), `${n} posts, "${$('#pwTag').textContent}"`);
    ok('VoiceOver hears the walk as progress: stop, done and to go', scene.getAttribute('role') === 'progressbar' && /Stop 1 of 5\b.*0 done, 5 to go/.test(scene.getAttribute('aria-valuetext')), scene.getAttribute('aria-valuetext'));
    const k = r(svg).width / W;
    const tinyNum = 30 * k, tiny = $$('.pw-tag, .pw-subj').filter(e => !e.hidden && parseFloat(getComputedStyle(e).fontSize) < 16);
    ok('words and numbers a child reads are 16px or more (the post numbers too)', tinyNum >= 15.9 && !tiny.length, `numbers ${tinyNum.toFixed(1)}px`);
    ok('the scene fits the screen width, with nothing to scroll sideways', r(scene).right <= innerWidth + 1 && r(scene).left >= -1 && document.documentElement.scrollWidth <= innerWidth + 1);
    // the first question
    M.walk.skipHello(); await until(() => $('#area'));
    await wait(reduce() ? 50 : 1200);
    const area = $('#area');
    ok('the first question comes straight after, under the scene, and is on screen without hunting for it', !!area && r(area).top >= r(scene).bottom - 1 && r(area).top < innerHeight - 120, `question at ${r(area).top.toFixed(0)} of ${innerHeight}`);
    ok('…post 1 is gold and Bonnie trots to it', $('#pwPost0').classList.contains('now') && $('#pwBon').dataset.at === 'm0' && /Stop 1 of 5/.test($('#pwTag').textContent), $('#pwTag').textContent);
    const tagR = r($('#pwTag')), sjR = $('#pwSubj').hidden ? null : r($('#pwSubj')), signs = $$('.pw-sign').map(r);
    ok('the tags at the top cover no post', !signs.some(s => [tagR, sjR].filter(Boolean).some(t => t.left < s.right && s.left < t.right && t.top < s.bottom && s.top < t.bottom)));
    ok('…and say whether this stop is Maths or Words', !$('#pwSubj').hidden && /Maths|Words/.test($('#pwSubj').textContent), $('#pwSubj').textContent);
    const ask = $('#askBtn') || $('#mmAsk');
    ok('Ask Bonnie is still there, as big as before', !!ask && r(ask).width >= 44 && r(ask).height >= 44);
    // help: a wrong answer moves Bonnie's help up a rung, nothing is counted
    const b0 = save().bones;
    M.wrong(null); await wait(60);
    ok('a wrong answer: no mistake counted, Bonnie\'s help goes up a rung (as before)', M.round().tier >= 1 && M.round().index === 0 && save().bones === b0, `tier ${M.round().tier}`);
    // the five stops
    const log = [];
    for (let i = 0; i < 5; i++) {
      const pawsBefore = $$('#pwPaws .pw-paw').length;
      if (M.round().index !== i) break;
      M.correct(null, { auto: false }); M.next(); await wait(reduce() ? 80 : 1500);
      if ($('#walkQ .game-main.digging')) { log.push('dig'); M.correct(null, { auto: false }); M.next(); await wait(reduce() ? 80 : 1100); }
      const p = document.getElementById('pwPost' + i);
      log.push({ i, done: p.classList.contains('done'), next: i < 4 ? document.getElementById('pwPost' + (i + 1)).classList.contains('now') : null, at: $('#pwBon').dataset.at, paws: $$('#pwPaws .pw-paw').length > pawsBefore, tag: $('#pwTag').textContent, v: scene.getAttribute('aria-valuenow') });
      if (i === 1) ok('after stop 2: two paw stamps, post 3 gold, "Stop 3 of 5", Bonnie at post 3 with paw prints behind her', log.filter(x => x.done).length === 2 && document.getElementById('pwPost2').classList.contains('now') && /Stop 3 of 5/.test($('#pwTag').textContent) && $('#pwBon').dataset.at === 'm2' && $$('#pwPaws .pw-paw').length > 6, JSON.stringify(log[log.length - 1]));
    }
    await wait(200);
    ok('each stop done gets the paw stamp, the next post turns gold, and Bonnie moves on leaving paw prints', log.filter(x => x.i != null).length === 5 && log.filter(x => x.i != null).every(x => x.done && x.next !== false && x.paws), JSON.stringify(log.map(x => x.i != null ? `${x.i}:${x.done ? 'D' : '-'}${x.next ? 'N' : ''}${x.paws ? 'p' : ''}@${x.at}` : x)));
    // the finish
    await until(() => $("#pwEnd"), 3000); await wait(150);
    const ends = $$('.modal-bg').filter(b => b.querySelector('.paw-stamp')), endBox = ends[0], ov = $('#pwEnd');
    ok('at the end Bonnie is at the picnic and the finish is in the meadow (the engine\'s box is hidden from sight and from VoiceOver)', $('#pwBon').dataset.at === 'home' && !!ov && endBox && ends.every(b => getComputedStyle(b).visibility === 'hidden' && b.getAttribute('aria-hidden') === 'true'), `at ${$("#pwBon").dataset.at}, finish ${!!ov}, boxes ${ends.map(b => getComputedStyle(b).visibility + "/" + (b.dataset.pw || "-") + "/" + b.className + "/" + b.textContent.trim().slice(0, 30)).join(" ; ")}, done ${V && V.done}/${V && V.n}, round ${JSON.stringify(M.round())}`);
    const engBones = endBox ? +(($('.earned', endBox) || {}).textContent || '').match(/\d+/)[0] : -1, gained = save().bones - b0;
    ok('the finish shows the same bones as the engine (and as the save gained)', ov && $('.pw-bones', ov).textContent.includes(`${engBones} bone`) && engBones === gained, `${engBones} shown, ${gained} gained`);
    const kindEl = endBox && $('.kind', endBox);
    ok('…and the days in a row, only when the engine says so', !!kindEl === !!$('.pw-streak', ov), kindEl ? kindEl.textContent : 'no streak line');
    const tk = dayKey(new Date());
    ok("…and this week's journal paw prints, today's just stamped, from the save the journal reads", !!save().walks.days[tk] && $('.pw-day.today.walked', ov) && $$('.pw-day', ov).length === 7);
    const btns = $$('.pw-btn', ov);
    ok('two big buttons, Back to the Clubhouse and Another walk, both on screen without scrolling', btns.length === 2 && btns.every(x => r(x).height >= 44 && r(x).width >= 44 && r(x).bottom <= innerHeight + 1) && /Clubhouse/.test(btns[0].textContent) && /Another walk/.test(btns[1].textContent), btns.map(x => r(x).bottom.toFixed(0)).join(', ') + ' of ' + innerHeight);
    const tinyEnd = $$('.pw-end p, .pw-end h3, .pw-end .pw-day, .pw-btn, .pw-bones, .pw-streak span', ov).filter(e => parseFloat(getComputedStyle(e).fontSize) < 16);
    ok('the finish: text 16px or more, nothing wider than the screen', !tinyEnd.length && ov.scrollWidth <= innerWidth + 1, tinyEnd.map(e => e.textContent.slice(0, 20)).join(', '));
    ok('…and "Back to the Clubhouse" presses the engine\'s own button (which goes to the Clubhouse prototype)', !!$('[data-a="home"]', endBox) && !!$('[data-a="again"]', endBox));
    // another walk (no dig on this one, so the stops below are plain)
    M.walk.dig.chance = 0;
    $('#pwAgain').click(); await wait(400);
    ok('"Another walk" starts a fresh walk: the finish goes, the posts reset, Bonnie back at the Clubhouse', !$('#pwEnd') && !$$('.modal-bg').some(b => b.querySelector('.paw-stamp')) && $$('.pw-post.done').length === 0 && $('.pw') && ['start', undefined].includes($('#pwBon').dataset.at), $('#pwBon').dataset.at);
    // stopping part-way: the engine asks first, and it isn't hidden
    M.walk.skipHello(); await wait(100); M.correct(null, { auto: false }); M.next(); await wait(reduce() ? 60 : 1500);
    const club = $('.hud a.icon-btn'); club.click(); await wait(120);
    const stopBox = $$('.modal-bg').find(b => /Stop the walk/.test(b.textContent));
    ok('leaving part-way: "Stop the walk?" shows as before, and it is not hidden', !!stopBox && getComputedStyle(stopBox).visibility !== 'hidden');
    if (stopBox) $('[data-a="stay"]', stopBox).click(); await wait(80);
    ok('…"Keep walking" carries on at the same stop, the scene as it was', M.round().index === 1 && document.getElementById('pwPost0').classList.contains('done') && document.getElementById('pwPost1').classList.contains('now'));
    // the dig, in the meadow
    M.walk.dig.chance = 1;
    const ab = $$('.modal-bg'); ab.forEach(x => x.remove());
    M.startWalk(); M.walk.skipHello(); await wait(150);
    let guard = 0; while (!$('#walkQ .game-main.digging') && guard++ < 6 && M.round()) { M.correct(null, { auto: false }); M.next(); await wait(reduce() ? 60 : 900); }
    const digging = !!$('#walkQ .game-main.digging');
    if (digging) {
      await wait(reduce() ? 60 : 800);
      ok('a surprise dig: Bonnie runs off the path to a mound beside it, "Surprise dig!"', $('#pwBon').dataset.at === 'dig' && !!$('#pwDig path') && /Surprise dig/.test($('#pwTag').textContent) && /surprise dig/i.test($('.pw').getAttribute('aria-valuetext')), `${$('#pwBon').dataset.at} | ${!!$('#pwDig path')} | ${$('#pwTag').textContent} | ${$('.pw').getAttribute('aria-valuetext')} | digAt ${V.digAt}`);
      const mounds = $$('.mound'), field = $('.dig-field');
      ok('the dig: mounds 44 or more, the numbers on their stakes readable, Bonnie\'s sniff drawn (no emoji nose)', mounds.length === 3 && mounds.every(m => r(m).width >= 44 && r(m).height >= 44) && $$('.mound .stake').every(s => parseFloat(getComputedStyle(s).fontSize) >= 16) && !!$('.dig-head svg') && getComputedStyle($('.dig-nose')).display === 'none' && !!field);
      // a wrong mound, then the right one
      mounds[0].click(); await wait(200);
      const first = mounds[0].classList.contains('treasure');
      ok('digging a mound turns up a drawn find (a treasure or an old sock), not an emoji', !!$('.find svg', mounds[0]) && $('.find', mounds[0]).textContent.trim() === '', $('.find', mounds[0]).dataset.item);
      if (!first) { ok('a wrong mound: Bonnie\'s help goes up a rung, as before', M.round().tier >= 1, `tier ${M.round().tier}`); for (const m of mounds.slice(1)) { if ($('#walkQ .game-main.digging') && !m.disabled) { m.click(); await wait(200); if (m.classList.contains('treasure')) break; } } }
      await until(() => !$('#walkQ .game-main.digging'), 6000); await wait(reduce() ? 80 : 900);
      ok('after the dig: the hole stays by the path with the treasure, and Bonnie is back on the path', !!$('#pwDig ellipse') && /^m\d$/.test($('#pwBon').dataset.at || ''), `${$('#pwBon').dataset.at}, treasure ${V.treasure ? FINDS[V.treasure][0] : 'none'}`);
    } else ok('a surprise dig came up', false, 'no dig on this walk');
    M.walk.dig.chance = .5;
    // motion
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) ok('Reduce Motion: Bonnie goes straight to each stop, nothing bobs, wags or thunks', getComputedStyle($('#pwBon .tail') || document.body).animationName === 'none' || !$('#pwBon .tail'));
    // speed
    const t0 = performance.now(); build(document.getElementById('walkPath')); sync(); const ms = performance.now() - t0;
    ok('drawing the scene is quick and modest (for the 2018 iPad)', ms < 120 && $$('.pw svg *').length < 2500, `${$$('.pw svg *').length} SVG elements, ${ms.toFixed(0)} ms`);
    // put the pretend save back exactly as it was
    $$('.modal-bg, .pw-end').forEach(x => x.remove());
    M.save.mutate(s => { const o = JSON.parse(before); Object.keys(s).forEach(k2 => delete s[k2]); Object.assign(s, o); });
    ok('the checks leave the pretend save exactly as it was', JSON.stringify(save()) === before);
    const pre = document.createElement('pre'); pre.id = 'selftest';
    pre.style.cssText = 'position:fixed;z-index:99;left:0;right:0;bottom:0;max-height:60vh;overflow:auto;margin:0;background:#fff;font:12px monospace';
    pre.textContent = JSON.stringify({ size: [innerWidth, innerHeight], passed: out.filter(x => x.pass).length, of: out.length, results: out }, null, 1);
    document.body.appendChild(pre);
  }

  window.ProtoWalk = { sync, build, FINDS };
  install();
  if (Q.get('walktest')) walktest();
})();
