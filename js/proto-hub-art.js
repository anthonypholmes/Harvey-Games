/* Clubhouse meadow PROTOTYPE: the drawing (design iteration 2, Direction B: "the Clubhouse meadow").
   Ported from hub() in docs/design-source/scenes.mjs, using the drawing kit in js/proto-map-art.js (load that first).

   Refinement 1 (22 November 2026):
   - The places a child taps (the two game gates, the Walk arch, the shop stall) are drawn on their own layer
     (places()), so they can react to a press. The scene behind them (scene()) never overlaps them.
   - The game gates are the biggest, most colourful things in the meadow: the game's own colour on the sign,
     a cream edge, a medallion on top (1+2, abc) and a pool of sunlight in the gateway.
   - Bonnie has a clear patch of meadow by the path, with room beside her for her words.
   - The lower half is calmer: no scattered flowers in front of the gates, and one small glimpse beyond each gate.
   The live parts (the child's name, Bonnie, her words, stars, bones) are drawn by js/proto-hub.js.
   Plain SVG strings, drawn once per theme. No libraries. Exposes window.ProtoHubArt. */
(function () {
const { C, Scene, rng, tree, bush, tuft, flowers, path, cloud, butterfly, meadowFloor, scatter, bone, paw, shadow, tint } = window.ProtoArt;
const W = 640, H = 1000;
// the size of the words on the signs, in drawing units: 16px or more on the smallest phone (an iPhone SE shows the drawing at about 0.82)
const SIGN = 20, GATE_SIGN = 23;

/* Where everything is (drawing units). js/proto-hub.js uses the same numbers for the tap areas. */
const AT = {
  house: [320, 400],          // the middle of the front step
  walk: [150, 470], shop: [490, 466],
  maths: [190, 830], words: [450, 830],
  bonnie: [178, 606],         // her feet, on her patch of meadow
  talk: [222, 510, 548, 634], // the space beside her for her words: [left, top, right, bottom]
};
const GAMES = {
  maths: { title: 'Meadow Maths', col: '#4C7E4A', dk: '#2F5530', medal: '1+2' },
  words: { title: 'Meadow Words', col: '#B85C26', dk: '#7E3C16', medal: 'abc' },
};

/* The sky follows the Bone Shop theme, so a bought theme still shows on the Clubhouse.
   [sky top, sky bottom, far hill, nearer hill, sun or moon colour, night?] */
const SKIES = {
  day: [C.sky1, C.sky2, C.farHill, C.farHill2, C.gold],
  sunset: ['#F7B6A0', '#FFE3C2', '#C9C79A', '#B7C38E', '#F59A5B'],
  sea: ['#9FDCEB', '#D4F3F1', '#A9D6B8', '#98CDA8', C.gold],
  snow: ['#D6E6F3', '#F4F8FB', '#E4EEF2', '#D3E3E6', '#FFF3C8'],
  night: ['#1C2140', '#3B4377', '#5A7A72', '#4E6E66', '#F3EEDF', true],
  space: ['#0F1430', '#2B2F5E', '#5A6A7A', '#4C5C6C', '#F6B66A', true],
  christmas: ['#173B2C', '#2F5E48', '#6E9C86', '#5E8E76', '#FFF4E0', true],
  pixel: ['#8ED3FF', '#CBEFFF', C.farHill, C.farHill2, C.gold],
  volcano: ['#2A1A17', '#7A3A26', '#7A6A52', '#6A5C46', '#FF8A3D', true],
};

function clubhouse(s, x, y) { // the name board is left empty: the live layer writes the name
  s.add(y, `${shadow(x, y + 4, 120, 16, .2)}
    <rect x="${x - 96}" y="${y - 112}" width="192" height="112" rx="6" fill="${C.woodDk}"/>
    <rect x="${x - 92}" y="${y - 112}" width="184" height="106" rx="5" fill="${C.wood}"/>
    ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${x - 92} ${y - 96 + i * 16} h184" stroke="${C.woodDk}" stroke-width="1.6" opacity=".55"/>`).join('')}
    <path d="M${x - 118} ${y - 104} L${x} ${y - 190} L${x + 118} ${y - 104} Z" fill="#A93E4F"/>
    <path d="M${x - 110} ${y - 108} L${x} ${y - 186} L${x + 110} ${y - 108} Z" fill="${C.berry}"/>
    ${[0, 1, 2, 3].map(i => `<path d="M${x - 92 + i * 22} ${y - 120 - i * 14} H${x + 92 - i * 22}" stroke="#E98896" stroke-width="2" opacity=".8"/>`).join('')}
    <circle cx="${x}" cy="${y - 146}" r="17" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="3"/>${bone(x, y - 146, .55)}
    <rect x="${x - 4}" y="${y - 232}" width="5" height="50" fill="${C.woodDk}"/><path d="M${x + 1} ${y - 230} L${x + 40} ${y - 222} L${x + 1} ${y - 212}Z" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1.5"/>
    <rect x="${x - 70}" y="${y - 86}" width="40" height="30" rx="4" fill="#CFEAF4" stroke="${C.woodDk}" stroke-width="3"/><path d="M${x - 50} ${y - 86} v30 M${x - 70} ${y - 71} h40" stroke="${C.woodDk}" stroke-width="2.4"/>
    <rect x="${x + 30}" y="${y - 86}" width="40" height="30" rx="4" fill="#CFEAF4" stroke="${C.woodDk}" stroke-width="3"/><path d="M${x + 50} ${y - 86} v30 M${x + 30} ${y - 71} h40" stroke="${C.woodDk}" stroke-width="2.4"/>
    <rect x="${x - 74}" y="${y - 54}" width="48" height="10" rx="3" fill="${C.woodDk}"/>${[0, 1, 2, 3].map(i => `<circle cx="${x - 66 + i * 11}" cy="${y - 56}" r="4" fill="${C.flowers[i + 1]}"/>`).join('')}
    <rect x="${x + 26}" y="${y - 54}" width="48" height="10" rx="3" fill="${C.woodDk}"/>${[0, 1, 2, 3].map(i => `<circle cx="${x + 34 + i * 11}" cy="${y - 56}" r="4" fill="${C.flowers[(i + 2) % 5]}"/>`).join('')}
    <path d="M${x - 22} ${y - 4} V${y - 62} Q${x} ${y - 82} ${x + 22} ${y - 62} V${y - 4} Z" fill="#7A4A26"/><circle cx="${x + 12}" cy="${y - 32}" r="2.6" fill="${C.gold}"/>
    <rect x="${x - 62}" y="${y - 6}" width="124" height="10" rx="3" fill="${C.woodDk}"/><rect x="${x - 56}" y="${y - 8}" width="112" height="8" rx="3" fill="${C.woodLt}"/>
    <rect x="${x - 84}" y="${y - 120}" width="168" height="30" rx="6" fill="${C.woodDk}"/><rect x="${x - 84}" y="${y - 123}" width="168" height="30" rx="6" fill="${C.woodLt}"/>`);
  s.add(y + 14, `${shadow(x + 70, y + 16, 16, 3)}<path d="M${x + 56} ${y + 6} h28 l-4 10 h-20 z" fill="#3B7FC4" stroke="#245A91" stroke-width="1.5"/>${bone(x + 70, y + 4, .35)}`);
}

/* ---------- the places a child taps (their own layer) ---------- */
// a soft gold ring on the ground under a place: shown while it's pressed, chosen, or pointed out by Bonnie's first-time help
const halo = (x, y, rx, ry) => `<ellipse class="halo" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${C.gold}" opacity="0"/><ellipse class="halo" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="none" stroke="${C.goldDk}" stroke-width="3" opacity="0"/>`;
function gate(id, x, y) {
  const g = GAMES[id], bunting = id === 'maths' ? ['1', '2', '3', '+', '×'] : ['a', 'b', 'c', 'sh', 'oo'];
  const col = ['#3B7FC4', C.berry, C.gold, '#3F8B5C', '#E07A3F'];
  const flags = bunting.map((t, i) => {
    const fx = x - 50 + i * 25, fy = y - 84 + Math.sin(i / 4 * Math.PI) * 10;
    return `<path d="M${fx - 10} ${fy} L${fx + 10} ${fy} L${fx} ${fy + 20} Z" fill="${col[(i + (id === 'words' ? 1 : 0)) % 5]}"/><text x="${fx}" y="${fy + 11}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="10" fill="#fff">${t}</text>`;
  }).join('');
  const sw = 184, sy = y - 152; // the sign: width, top
  return `<g class="place gate" id="art-${id}">
    ${halo(x, y + 2, 90, 14)}
    <ellipse cx="${x}" cy="${y - 2}" rx="56" ry="13" fill="${C.pathLt}" opacity=".9"/>
    ${shadow(x, y + 2, 66, 7)}
    <rect x="${x - 64}" y="${y - 110}" width="12" height="112" rx="4" fill="${C.woodDk}"/><rect x="${x + 52}" y="${y - 110}" width="12" height="112" rx="4" fill="${C.woodDk}"/>
    <rect x="${x - 64}" y="${y - 110}" width="8" height="110" rx="4" fill="${C.wood}"/><rect x="${x + 52}" y="${y - 110}" width="8" height="110" rx="4" fill="${C.wood}"/>
    <path d="M${x - 58} ${y - 86} Q${x} ${y - 70} ${x + 58} ${y - 86}" stroke="${C.woodDk}" stroke-width="1.4" fill="none"/>${flags}
    <g class="sign">
      <rect x="${x - sw / 2}" y="${sy + 4}" width="${sw}" height="44" rx="10" fill="${g.dk}"/>
      <rect x="${x - sw / 2}" y="${sy}" width="${sw}" height="44" rx="10" fill="${g.col}" stroke="${C.paper}" stroke-width="3"/>
      <text x="${x}" y="${sy + 30}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="${GATE_SIGN}" fill="#fff">${g.title}</text>
      <circle cx="${x}" cy="${sy - 12}" r="21" fill="${g.dk}"/><circle cx="${x}" cy="${sy - 14}" r="21" fill="${C.paper}" stroke="${g.col}" stroke-width="4"/>
      <text x="${x}" y="${sy - 8}" text-anchor="middle" font-family="${id === 'words' ? 'Andika' : 'Fredoka'}" font-weight="700" font-size="16" fill="${g.dk}">${g.medal}</text>
    </g>
  </g>`;
}
function shopStall(x, y) {
  return `<g class="place" id="art-shop">${halo(x, y + 2, 56, 12)}${shadow(x, y + 2, 52, 6)}
    <rect x="${x - 48}" y="${y - 42}" width="96" height="42" rx="3" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="2"/>
    <rect x="${x - 54}" y="${y - 46}" width="108" height="8" rx="3" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="1.5"/>
    <rect x="${x - 48}" y="${y - 100}" width="5" height="58" fill="${C.woodDk}"/><rect x="${x + 43}" y="${y - 100}" width="5" height="58" fill="${C.woodDk}"/>
    <path d="M${x - 58} ${y - 88} L${x - 48} ${y - 112} H${x + 48} L${x + 58} ${y - 88} Z" fill="#FFF6E2"/>
    ${[0, 2, 4, 6].map(i => `<path d="M${x - 48 + i * 12} ${y - 112} L${x - 58 + i * 14.5} ${y - 88} H${x - 58 + (i + 1) * 14.5} L${x - 48 + (i + 1) * 12} ${y - 112} Z" fill="${C.berry}"/>`).join('')}
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${x - 58 + i * 14.5} ${y - 88} a7.25 6 0 0 0 14.5 0" fill="${i % 2 ? '#FFF6E2' : C.berry}"/>`).join('')}
    <path d="M${x - 30} ${y - 46} L${x - 20} ${y - 68} L${x - 10} ${y - 46} Z" fill="#3BA8D9" stroke="#2179A3" stroke-width="1.2"/><circle cx="${x - 20}" cy="${y - 69}" r="3" fill="${C.gold}"/>
    <path d="M${x - 2} ${y - 46} l2 -18 l7 9 l7 -12 l7 12 l7 -9 l2 18 Z" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1.2" stroke-linejoin="round"/>
    <rect x="${x - 46}" y="${y - 36}" width="92" height="30" rx="5" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="1.2"/>${bone(x - 29, y - 21.5, .38)}<text x="${x + 9}" y="${y - 14}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="${SIGN}" fill="${C.woodInk}">SHOP</text></g>`;
}
function walkArch(x, y) {
  return `<g class="place" id="art-walk">${halo(x, y + 2, 54, 12)}${shadow(x, y + 2, 46, 6)}
    <path d="M${x - 44} ${y} V${y - 52} Q${x} ${y - 102} ${x + 44} ${y - 52} V${y}" fill="none" stroke="${C.leafDk}" stroke-width="20" stroke-linecap="round"/>
    <path d="M${x - 44} ${y - 2} V${y - 52} Q${x} ${y - 100} ${x + 44} ${y - 52} V${y - 2}" fill="none" stroke="${C.leaf}" stroke-width="14" stroke-linecap="round"/>
    ${[[-44, -40], [-33, -74], [0, -88], [33, -74], [44, -40], [-44, -14], [44, -18]].map(([a, b], i) => `<circle cx="${x + a}" cy="${y + b}" r="3.4" fill="${C.flowers[i % 5]}"/>`).join('')}
    <rect x="${x - 46}" y="${y - 62}" width="92" height="30" rx="7" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="1.6"/>${paw(x - 29, y - 46, .6, C.woodInk)}<text x="${x + 9}" y="${y - 40}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="${SIGN}" fill="${C.woodInk}">WALK</text></g>`;
}
// the clubhouse door, drawn open: shown when the clubhouse is tapped and Bonnie pops in to say hello
function door(x, y) {
  return `<g id="art-door" class="door"><path d="M${x - 22} ${y - 4} V${y - 62} Q${x} ${y - 82} ${x + 22} ${y - 62} V${y - 4} Z" fill="#3B2414"/>
    <ellipse cx="${x + 4}" cy="${y - 24}" rx="14" ry="18" fill="${C.gold}" opacity=".45"/>
    <path d="M${x - 22} ${y - 4} V${y - 62} L${x - 36} ${y - 57} V${y - 9} Z" fill="#7A4A26" stroke="#5A3418" stroke-width="1.2"/><circle cx="${x - 32}" cy="${y - 33}" r="2" fill="${C.gold}"/></g>`;
}
function places() {
  return { walk: walkArch(...AT.walk), shop: shopStall(...AT.shop), maths: gate('maths', ...AT.maths), words: gate('words', ...AT.words), door: door(...AT.house) };
}

/* ---------- the scene behind them ---------- */
function scene(theme) {
  const sky = SKIES[theme] || SKIES.day, night = !!sky[5];
  const s = new Scene(W, H);
  const r0 = rng(17);
  s.g(`<defs><linearGradient id="hubSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
    <rect width="${W}" height="250" fill="url(#hubSky)"/>
    ${night ? Array.from({ length: 40 }, () => `<circle cx="${(r0() * W).toFixed(0)}" cy="${(r0() * 170).toFixed(0)}" r="${(.8 + r0() * 1.4).toFixed(1)}" fill="#fff" opacity="${(.4 + r0() * .5).toFixed(2)}"/>`).join('') : ''}
    <circle cx="530" cy="70" r="26" fill="${sky[4]}" opacity=".95"/><circle cx="530" cy="70" r="40" fill="${sky[4]}" opacity=".18"/>
    ${night ? '' : cloud(150, 70, 1.1) + cloud(400, 50, .8) + cloud(610, 120, .7)}
    <path d="M0 200 Q90 130 200 160 Q300 120 420 150 Q540 110 640 160 V260 H0Z" fill="${sky[2]}"/>
    <path d="M0 220 Q120 170 250 200 Q380 160 500 196 Q580 176 640 200 V280 H0Z" fill="${sky[3]}"/>
    ${[[60, 175], [96, 168], [470, 140], [500, 150], [560, 146]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="9" fill="#8DBF7E"/><rect x="${a - 1.5}" y="${b + 6}" width="3" height="8" fill="#8A6A4A"/>`).join('')}`);
  meadowFloor(s, 13, 230);
  // the paths: from the step to the Walk and the shop, and the main path down to the fork, one branch to each game
  path(s, 'M296 426 C250 444 210 456 150 472', 24);
  path(s, 'M344 426 C390 444 430 454 490 468', 24);
  path(s, 'M320 430 C320 500 300 560 320 660', 36);
  path(s, 'M320 640 C300 720 196 740 190 830 S180 940 170 1010', 36);
  path(s, 'M320 640 C340 720 444 740 450 830 S470 940 480 1010', 36);
  s.g(`<ellipse cx="320" cy="420" rx="80" ry="22" fill="${C.path}" stroke="${C.pathEdge}" stroke-width="3"/>`);
  clubhouse(s, ...AT.house);
  // Bonnie's patch of meadow: a few flowers round her feet
  s.g(`<ellipse cx="${AT.bonnie[0]}" cy="${AT.bonnie[1] - 2}" rx="40" ry="11" fill="${C.meadowLt}"/>`);
  flowers(s, AT.bonnie[0] - 34, AT.bonnie[1] + 4, 3, 71, 8); flowers(s, AT.bonnie[0] + 34, AT.bonnie[1] + 2, 3, 72, 8);
  // one small glimpse beyond each gate: the maths river and stepping stones; the letter trees of Phonics Forest
  s.g(`<path d="M0 932 C60 922 120 942 230 930" stroke="${C.waterDk}" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M0 932 C60 922 120 942 230 930" stroke="${C.water}" stroke-width="17" fill="none" stroke-linecap="round"/>`);
  [[142, 926, 10], [172, 942, 20], [202, 926, 30]].forEach(([a, b, n]) => s.add(b, `<ellipse cx="${a}" cy="${b + 3}" rx="14" ry="7" fill="${C.stoneDk}"/><ellipse cx="${a}" cy="${b}" rx="14" ry="7" fill="${C.stoneLt}"/><text x="${a}" y="${b + 3.5}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="9" fill="#5E5547">${n}</text>`));
  [[404, 966, 'pine', 'a'], [532, 944, 'round', 'sh']].forEach(([tx, ty, kind, t], i) => {
    tree(s, tx, ty, .75, kind, 40 + i);
    s.add(ty + 1, `<g><circle cx="${tx}" cy="${ty - (kind === 'pine' ? 28 : 38)}" r="11" fill="${C.paper}" stroke="${C.leafDk}" stroke-width="1.5"/><text x="${tx}" y="${ty - (kind === 'pine' ? 24 : 34)}" text-anchor="middle" font-family="Andika" font-size="12" fill="${C.leafDeep}">${t}</text></g>`);
  });
  // trees round the edge (none in front of a place), one bush in the fork
  const r = rng(5);
  [[40, 300], [90, 270], [600, 290], [560, 262], [26, 450], [614, 440], [36, 640], [606, 650], [28, 820], [614, 830], [210, 286], [430, 276]]
    .forEach(([tx, ty], i) => tree(s, tx, ty, .85 + r() * .35, i % 4 === 0 ? 'pine' : (i % 5 === 2 ? 'blossom' : 'round'), 60 + i));
  bush(s, 320, 770, .8, undefined, C.berry);
  // flowers and grass only up top and round the edges, so the paths and gates stand out
  scatter(s, 9, 46, [0, 250, 640, 560], [[96, 340, 120, 170], [200, 200, 240, 240], [424, 330, 140, 170], [130, 500, 430, 150]]);
  scatter(s, 11, 14, [0, 560, 90, 1000]); scatter(s, 12, 14, [560, 560, 640, 1000]);
  butterfly(s, 255, 330, '#F07CA8'); butterfly(s, 420, 300, '#F7D24A');
  return s.render() + tint(theme, W, H); // dark and seasonal themes wash over the meadow (not the places, Bonnie or the signs)
}

const cache = {};
window.ProtoHubArt = { W, H, SIGN, GATE_SIGN, AT, GAMES, places, scene: theme => cache[theme] || (cache[theme] = scene(theme)) };
})();
