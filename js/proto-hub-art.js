/* Clubhouse meadow PROTOTYPE: the drawing (design iteration 2, Direction B: "the Clubhouse meadow").
   Ported from hub() in docs/design-source/scenes.mjs, using the drawing kit in js/proto-map-art.js (load that first).
   Changes from the design sheet: the signs a child reads are bigger (16px or more on an iPhone SE), and the live
   parts (the child's name on the clubhouse, Bonnie, her bubble, stars and bones) are drawn by js/proto-hub.js.
   Plain SVG strings, drawn once per theme. No libraries. Exposes window.ProtoHubArt. */
(function () {
const { C, Scene, rng, tree, bush, tuft, flowers, fence, path, cloud, butterfly, meadowFloor, scatter, bone, paw, shadow } = window.ProtoArt;
const W = 640, H = 930;
// the size of the words on the signs, in drawing units: at least 16px on the smallest phone (an iPhone SE shows the drawing at 0.84)
const SIGN = 19.5;

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

function clubhouse(s, x, y) { // x,y = middle of the front step. The name board is left empty: the live layer writes the name.
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
  // Bonnie's bowl
  s.add(y + 14, `${shadow(x + 70, y + 16, 16, 3)}<path d="M${x + 56} ${y + 6} h28 l-4 10 h-20 z" fill="#3B7FC4" stroke="#245A91" stroke-width="1.5"/>${bone(x + 70, y + 4, .35)}`);
}
function gate(s, x, y, title, bunting, col) {
  const flags = bunting.map((t, i) => {
    const fx = x - 44 + i * (88 / (bunting.length - 1)), fy = y - 76 + Math.sin(i / (bunting.length - 1) * Math.PI) * 10;
    return `<path d="M${fx - 9} ${fy} L${fx + 9} ${fy} L${fx} ${fy + 18} Z" fill="${col[i % col.length]}"/><text x="${fx}" y="${fy + 10}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="9.5" fill="#fff">${t}</text>`;
  }).join('');
  s.add(y, `${shadow(x, y + 2, 56, 6)}<rect x="${x - 56}" y="${y - 96}" width="9" height="98" rx="3" fill="${C.woodDk}"/><rect x="${x + 47}" y="${y - 96}" width="9" height="98" rx="3" fill="${C.woodDk}"/>
    <rect x="${x - 56}" y="${y - 96}" width="6" height="96" rx="3" fill="${C.wood}"/><rect x="${x + 47}" y="${y - 96}" width="6" height="96" rx="3" fill="${C.wood}"/>
    <path d="M${x - 52} ${y - 78} Q${x} ${y - 64} ${x + 52} ${y - 78}" stroke="${C.woodDk}" stroke-width="1.2" fill="none"/>${flags}
    <rect x="${x - 76}" y="${y - 128}" width="152" height="36" rx="8" fill="${C.woodDk}"/><rect x="${x - 76}" y="${y - 131}" width="152" height="36" rx="8" fill="${C.woodLt}"/>
    <text x="${x}" y="${y - 106.5}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="${SIGN}" fill="${C.woodInk}">${title}</text>`);
}
function shopStall(s, x, y) {
  s.add(y, `${shadow(x, y + 2, 50, 6)}<rect x="${x - 46}" y="${y - 42}" width="92" height="42" rx="3" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="2"/>
    <rect x="${x - 52}" y="${y - 46}" width="104" height="8" rx="3" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="1.5"/>
    <rect x="${x - 46}" y="${y - 98}" width="5" height="56" fill="${C.woodDk}"/><rect x="${x + 41}" y="${y - 98}" width="5" height="56" fill="${C.woodDk}"/>
    <path d="M${x - 56} ${y - 86} L${x - 46} ${y - 110} H${x + 46} L${x + 56} ${y - 86} Z" fill="#FFF6E2"/>
    ${[0, 1, 2, 3, 4].map(i => `<path d="M${x - 46 + i * 23} ${y - 110} L${x - 56 + i * 28} ${y - 86} H${x - 56 + i * 28 + 14} L${x - 46 + i * 23 + 11.5} ${y - 110} Z" fill="${C.berry}"/>`).join('')}
    ${[0, 1, 2, 3, 4].map(i => `<path d="M${x - 56 + i * 28} ${y - 86} a7 6 0 0 0 14 0" fill="${C.berry}"/><path d="M${x - 42 + i * 28} ${y - 86} a7 6 0 0 0 14 0" fill="#FFF6E2"/>`).join('')}
    <path d="M${x - 30} ${y - 46} L${x - 20} ${y - 68} L${x - 10} ${y - 46} Z" fill="#3BA8D9" stroke="#2179A3" stroke-width="1.2"/><circle cx="${x - 20}" cy="${y - 69}" r="3" fill="${C.gold}"/>
    <path d="M${x - 2} ${y - 46} l2 -18 l7 9 l7 -12 l7 12 l7 -9 l2 18 Z" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1.2" stroke-linejoin="round"/>
    <rect x="${x - 46}" y="${y - 36}" width="92" height="29" rx="5" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="1.2"/>${bone(x - 29, y - 21.5, .38)}<text x="${x + 9}" y="${y - 15}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="${SIGN}" fill="${C.woodInk}">SHOP</text>`);
}
function walkGate(s, x, y) {
  s.add(y, `${shadow(x, y + 2, 44, 6)}
    <path d="M${x - 44} ${y} V${y - 52} Q${x} ${y - 102} ${x + 44} ${y - 52} V${y}" fill="none" stroke="${C.leafDk}" stroke-width="20" stroke-linecap="round"/>
    <path d="M${x - 44} ${y - 2} V${y - 52} Q${x} ${y - 100} ${x + 44} ${y - 52} V${y - 2}" fill="none" stroke="${C.leaf}" stroke-width="14" stroke-linecap="round"/>
    ${[[-44, -40], [-33, -74], [0, -88], [33, -74], [44, -40], [-44, -14], [44, -18]].map(([a, b], i) => `<circle cx="${x + a}" cy="${y + b}" r="3.4" fill="${C.flowers[i % 5]}"/>`).join('')}
    <rect x="${x - 46}" y="${y - 62}" width="92" height="30" rx="7" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="1.6"/>${paw(x - 29, y - 46, .6, C.woodInk)}<text x="${x + 9}" y="${y - 40}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="${SIGN}" fill="${C.woodInk}">WALK</text>`);
  [[x - 10, y + 22], [x + 12, y + 40], [x - 4, y + 60]].forEach(([a, b]) => s.add(b, `<ellipse cx="${a}" cy="${b}" rx="12" ry="5.5" fill="${C.stoneDk}"/><ellipse cx="${a}" cy="${b - 2}" rx="12" ry="5.5" fill="${C.stoneLt}"/>`));
}
function phonicsPeek(s, x, y) { // a first glimpse of Phonics Forest beyond the Words gate
  [[x - 50, y, 'pine', 'a'], [x + 4, y - 26, 'round', 'sh'], [x + 56, y + 6, 'pine', 'e'], [x - 6, y + 40, 'round', 'oo']].forEach(([tx, ty, kind, t], i) => {
    tree(s, tx, ty, .8, kind, 40 + i);
    s.add(ty + 1, `<g><circle cx="${tx}" cy="${ty - (kind === 'pine' ? 30 : 40)}" r="11" fill="${C.paper}" stroke="${C.leafDk}" stroke-width="1.5"/><text x="${tx}" y="${ty - (kind === 'pine' ? 26 : 36)}" text-anchor="middle" font-family="Andika" font-size="12" fill="${C.leafDeep}">${t}</text></g>`);
  });
}

function hubScene(theme) {
  const sky = SKIES[theme] || SKIES.day, night = !!sky[5];
  const s = new Scene(W, H);
  const r0 = rng(17);
  s.g(`<defs><linearGradient id="hubSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
    <rect width="${W}" height="250" fill="url(#hubSky)"/>
    ${night ? Array.from({ length: 40 }, () => `<circle cx="${(r0() * W).toFixed(0)}" cy="${(r0() * 170).toFixed(0)}" r="${(.8 + r0() * 1.4).toFixed(1)}" fill="#fff" opacity="${(.4 + r0() * .5).toFixed(2)}"/>`).join('') : ''}
    <circle cx="520" cy="70" r="26" fill="${sky[4]}" opacity=".95"/><circle cx="520" cy="70" r="40" fill="${sky[4]}" opacity=".18"/>
    ${night ? '' : cloud(150, 70, 1.1) + cloud(400, 50, .8) + cloud(600, 120, .7)}
    <path d="M0 200 Q90 130 200 160 Q300 120 420 150 Q540 110 640 160 V260 H0Z" fill="${sky[2]}"/>
    <path d="M0 220 Q120 170 250 200 Q380 160 500 196 Q580 176 640 200 V280 H0Z" fill="${sky[3]}"/>
    ${[[60, 175], [96, 168], [470, 140], [500, 150], [560, 146]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="9" fill="#8DBF7E"/><rect x="${a - 1.5}" y="${b + 6}" width="3" height="8" fill="#8A6A4A"/>`).join('')}`);
  meadowFloor(s, 13, 230);
  s.g(`<path d="M0 236 Q160 214 320 230 Q480 214 640 240" stroke="${C.meadowDk}" stroke-width="3" fill="none" opacity=".3"/>`);
  // paths from the clubhouse step: maths down-left, words down-right, walk left, shop right
  path(s, 'M320 470 C320 520 250 540 200 600 S160 700 170 800 S180 880 160 940', 34);
  path(s, 'M320 470 C320 520 390 540 440 600 S480 700 470 800 S460 880 480 940', 34);
  path(s, 'M300 486 C250 500 210 500 170 500', 22);
  path(s, 'M340 486 C390 500 430 500 470 500', 22);
  s.g(`<ellipse cx="320" cy="476" rx="80" ry="22" fill="${C.path}" stroke="${C.pathEdge}" stroke-width="3"/>`);
  clubhouse(s, 320, 456);
  walkGate(s, 162, 508);
  shopStall(s, 478, 504);
  gate(s, 188, 696, 'Meadow Maths', ['1', '2', '3', '+', '×'], ['#3B7FC4', C.berry, C.gold, '#3F8B5C', '#E07A3F']);
  gate(s, 452, 696, 'Meadow Words', ['a', 'b', 'c', 'sh', 'oo'], [C.berry, '#3B7FC4', '#3F8B5C', '#E07A3F', '#8E6CD0']);
  // what lies beyond each gate: the maths stepping stones and river, the bundles of ten; letter trees and word signposts
  [[118, 800, 10], [146, 816, 20], [176, 800, 30]].forEach(([a, b, n]) => s.add(b, `<ellipse cx="${a}" cy="${b + 3}" rx="14" ry="7" fill="${C.stoneDk}"/><ellipse cx="${a}" cy="${b}" rx="14" ry="7" fill="${C.stoneLt}"/><text x="${a}" y="${b + 3.5}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="9" fill="#5E5547">${n}</text>`));
  s.g(`<path d="M0 806 C60 796 100 816 200 806" stroke="${C.waterDk}" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M0 806 C60 796 100 816 200 806" stroke="${C.water}" stroke-width="17" fill="none" stroke-linecap="round"/>`);
  [[226, 850, 1.05], [246, 836, .95], [266, 848, 1]].forEach(([bx, by, k]) => { let g = ''; for (let j = 0; j < 5; j++) g += `<rect x="${bx - 12 * k + j * 5 * k}" y="${by - 46 * k}" width="${4.6 * k}" height="${46 * k}" rx="1.6" fill="${j % 2 ? C.brick : '#E68A5C'}" stroke="${C.brickDk}" stroke-width="1"/>`; s.add(by, g + `<rect x="${bx - 14 * k}" y="${by - 27 * k}" width="${28 * k}" height="${5 * k}" rx="2" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="1"/>`); });
  phonicsPeek(s, 520, 830);
  [[392, 780, 'the'], [418, 810, 'said']].forEach(([a, b, t]) => s.add(b, `${shadow(a, b, 8, 2)}<rect x="${a - 2}" y="${b - 36}" width="4" height="36" fill="${C.woodDk}"/><path d="M${a - 20} ${b - 40} H${a + 14} L${a + 23} ${b - 31} L${a + 14} ${b - 22} H${a - 20} Z" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="1.4"/><text x="${a - 2}" y="${b - 26.5}" text-anchor="middle" font-family="Andika" font-size="11" fill="${C.woodInk}">${t}</text>`));
  // trees and hedges round the edge
  const r = rng(5);
  [[40, 300], [90, 270], [610, 290], [570, 262], [30, 420], [612, 420], [60, 600], [590, 610], [30, 720], [612, 760], [210, 286], [430, 276]].forEach(([tx, ty], i) => tree(s, tx, ty, .85 + r() * .35, i % 4 === 0 ? 'pine' : (i % 5 === 2 ? 'blossom' : 'round'), 60 + i));
  [[110, 390, .9], [530, 396, .9], [250, 626, .8], [390, 626, .8], [320, 770, 1]].forEach(([bx, by, k], i) => bush(s, bx, by, k, undefined, i % 2 ? C.berry : null));
  fence(s, [[92, 462], [118, 448], [144, 440]], .9); fence(s, [[496, 440], [522, 448], [548, 462]], .9);
  scatter(s, 9, 90, [0, 240, 640, 930], [[200, 260, 240, 240], [100, 420, 440, 100]]);
  butterfly(s, 250, 380, '#F07CA8'); butterfly(s, 400, 330, '#F7D24A');
  return s.render();
}

const cache = {};
window.ProtoHubArt = { W, H, SIGN, scene: theme => cache[theme] || (cache[theme] = hubScene(theme)) };
})();
