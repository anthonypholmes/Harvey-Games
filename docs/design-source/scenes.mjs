import { C, Scene, rng, tree, bush, tuft, flowers, rock, fence, path, river, cloud, butterfly, star, stars3, bone, paw, bonnie, bubble, nameBoard, shadow, croakRaw } from './kit.mjs';

function meadowFloor(s, seed, from = 0) {
  const r = rng(seed);
  s.g(`<rect x="0" y="${from}" width="${s.w}" height="${s.h - from}" fill="${C.meadow}"/>`);
  for (let i = 0; i < 26; i++) {
    const x = r() * s.w, y = from + r() * (s.h - from), rx = 40 + r() * 90;
    s.g(`<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${(rx * .35).toFixed(0)}" fill="${r() > .5 ? C.meadowLt : C.meadowDk}" opacity="${(.25 + r() * .2).toFixed(2)}"/>`);
  }
}
function scatter(s, seed, n, box, avoid = []) {
  const r = rng(seed), [x0, y0, x1, y1] = box;
  const free = (x, y) => !avoid.some(([ax, ay, aw, ah]) => x > ax && x < ax + aw && y > ay && y < ay + ah);
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); if (!free(x, y)) continue;
    const t = r();
    if (t < .45) tuft(s, x, y, .8 + r() * .4);
    else if (t < .8) flowers(s, x, y, 3 + Math.floor(r() * 4), Math.floor(r() * 1e6), 14);
    else s.g(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="2.2" fill="#fff" opacity=".5"/>`);
  }
}

/* ---------------- the places ---------------- */
function park(s, x, y) { // x,y = centre of the lawn
  s.g(`<path d="M${x - 120} ${y + 10} Q${x - 110} ${y - 70} ${x} ${y - 74} Q${x + 112} ${y - 70} ${x + 118} ${y + 12} Q${x + 100} ${y + 66} ${x} ${y + 68} Q${x - 104} ${y + 66} ${x - 120} ${y + 10}Z" fill="${C.meadowLt}"/>
    <path d="M${x - 90} ${y + 20} Q${x} ${y - 10} ${x + 92} ${y + 26}" stroke="${C.meadowDk}" stroke-width="2" fill="none" opacity=".25" stroke-dasharray="3 9"/>`);
  fence(s, [[x - 118, y + 8], [x - 108, y - 38], [x - 70, y - 66], [x - 20, y - 74]], .9);
  fence(s, [[x + 30, y - 72], [x + 76, y - 62], [x + 110, y - 30], [x + 116, y + 14]], .9);
  // the sculpture: three tied bundles of ten and loose ones
  [[x - 40, y + 4, 1], [x - 8, y - 6, .92], [x + 22, y + 6, 1.05]].forEach(([bx, by, k], i) => {
    let g = shadow(bx + 2, by + 2, 20 * k, 5 * k);
    for (let j = 0; j < 5; j++) g += `<rect x="${bx - 15 * k + j * 6 * k}" y="${by - 58 * k}" width="${5.6 * k}" height="${58 * k}" rx="2" fill="${j % 2 ? C.brick : '#E68A5C'}" stroke="${C.brickDk}" stroke-width="1.2"/>`;
    g += `<rect x="${bx - 18 * k}" y="${by - 34 * k}" width="${36 * k}" height="${6 * k}" rx="3" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="1.2"/>`;
    if (i === 1) g += `<rect x="${bx - 9}" y="${by - 50}" width="18" height="13" rx="3" fill="${C.paper}" stroke="${C.woodDk}" stroke-width="1.2"/><text x="${bx}" y="${by - 40}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="9.5" fill="${C.brickDk}">10</text>`;
    s.add(by, g);
  });
  [[x + 56, y + 24], [x + 69, y + 24], [x + 62, y + 12], [x + 50, y + 40]].forEach(([cx, cy]) => s.add(cy, `<rect x="${cx - 6}" y="${cy - 12}" width="12" height="12" rx="2.5" fill="${C.brickLt}" stroke="${C.brickDk}" stroke-width="1.3"/><rect x="${cx - 6}" y="${cy - 12}" width="12" height="4" rx="2" fill="#F8D0B4"/>`));
  s.add(y + 40, `${shadow(x - 72, y + 40, 22, 4)}<rect x="${x - 92}" y="${y + 24}" width="40" height="6" rx="2" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="1.3"/><rect x="${x - 92}" y="${y + 16}" width="40" height="5" rx="2" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="1.3"/><rect x="${x - 88}" y="${y + 30}" width="4" height="10" fill="${C.woodDk}"/><rect x="${x - 60}" y="${y + 30}" width="4" height="10" fill="${C.woodDk}"/>`);
  tree(s, x + 84, y - 20, 1.1, 'round', 11);
  flowers(s, x - 30, y + 46, 6, 21, 24);
  // gate arch with the name
  const gx = x + 4, gy = y - 70;
  s.add(gy + 2, `${shadow(gx, gy + 2, 34, 4)}<rect x="${gx - 32}" y="${gy - 44}" width="6" height="46" rx="2" fill="${C.woodDk}"/><rect x="${gx + 26}" y="${gy - 44}" width="6" height="46" rx="2" fill="${C.woodDk}"/>
    <path d="M${gx - 40} ${gy - 40} Q${gx} ${gy - 62} ${gx + 40} ${gy - 40}" stroke="${C.woodDk}" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M${gx - 40} ${gy - 42} Q${gx} ${gy - 64} ${gx + 40} ${gy - 42}" stroke="${C.woodLt}" stroke-width="12" fill="none" stroke-linecap="round" id="parkArc"/>
    <defs><path id="parkTxt" d="M${gx - 40} ${gy - 39} Q${gx} ${gy - 61} ${gx + 40} ${gy - 39}"/></defs>
    <text font-family="Fredoka" font-weight="700" font-size="8.5" fill="${C.woodInk}"><textPath href="#parkTxt" startOffset="50%" text-anchor="middle">PARTITIONING PARK</textPath></text>
    ${stars3(gx, gy - 24, 2, 5)}`);
}
function burrow(s, x, y) {
  s.g(`<path d="M${x - 110} ${y + 40} Q${x - 96} ${y - 40} ${x} ${y - 52} Q${x + 98} ${y - 44} ${x + 112} ${y + 38} Q${x} ${y + 62} ${x - 110} ${y + 40}Z" fill="${C.meadowDk}" opacity=".55"/>
    <path d="M${x - 104} ${y + 32} Q${x - 92} ${y - 44} ${x} ${y - 58} Q${x + 94} ${y - 50} ${x + 106} ${y + 30} Q${x} ${y + 50} ${x - 104} ${y + 32}Z" fill="#9ED07A"/>
    <path d="M${x - 60} ${y - 30} q20 -10 44 -8 M${x + 20} ${y - 40} q24 -2 40 8" stroke="#C3E5A6" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`);
  // carrot patch rows (earth)
  s.g(`<g>${[0, 1, 2].map(i => `<rect x="${x + 30}" y="${y + 6 + i * 13}" width="62" height="8" rx="4" fill="${C.earth}" opacity=".85"/>`).join('')}</g>`);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 5; j++) s.add(y + 10 + i * 13, `<path d="M${x + 38 + j * 12} ${y + 10 + i * 13} q-3 -7 -1 -10 M${x + 38 + j * 12} ${y + 10 + i * 13} q2 -7 5 -8" stroke="${C.leafDk}" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="${x + 38 + j * 12}" cy="${y + 11 + i * 13}" r="2.4" fill="#F08A3C"/>`);
  // two burrow holes (ten-frames) and rabbits
  [[x - 52, y - 10], [x - 4, y - 22]].forEach(([hx, hy], i) => {
    s.add(hy, `<ellipse cx="${hx}" cy="${hy}" rx="22" ry="12" fill="${C.earthLt}"/><ellipse cx="${hx}" cy="${hy + 2}" rx="16" ry="8.5" fill="${C.earthDk}"/>${i ? bone(hx + 2, hy + 1, .42) : ''}`);
  });
  const rab = (rx, ry, k) => `${shadow(rx, ry, 12 * k, 3 * k)}<g transform="translate(${rx} ${ry}) scale(${k})"><ellipse cx="0" cy="-9" rx="10" ry="9" fill="#F3EEE8"/><circle cx="0" cy="-21" r="7.5" fill="#F3EEE8"/><ellipse cx="-3.5" cy="-33" rx="2.8" ry="8" fill="#F3EEE8" stroke="#D7CEC4" stroke-width="1"/><ellipse cx="3.5" cy="-33" rx="2.8" ry="8" fill="#F3EEE8" stroke="#D7CEC4" stroke-width="1"/><ellipse cx="-3.5" cy="-33" rx="1.1" ry="5" fill="#F2B6C1"/><ellipse cx="3.5" cy="-33" rx="1.1" ry="5" fill="#F2B6C1"/><circle cx="-2.6" cy="-22" r="1.2" fill="${C.ink}"/><circle cx="2.6" cy="-22" r="1.2" fill="${C.ink}"/><circle cx="0" cy="-19" r="1.2" fill="#E58FAE"/><circle cx="9" cy="-6" r="3.5" fill="#fff"/></g>`;
  s.add(y - 12, rab(x - 54, y - 10, .85).replace(/<ellipse cx="0" cy="-9"[^>]*>/, ''));
  s.add(y + 22, rab(x - 20, y + 22, 1));
  // log with the name
  s.add(y + 44, `${shadow(x - 40, y + 44, 44, 5)}<rect x="${x - 82}" y="${y + 22}" width="82" height="22" rx="11" fill="${C.trunk}"/><ellipse cx="${x}" cy="${y + 33}" rx="7" ry="11" fill="${C.woodLt}" stroke="${C.trunkDk}" stroke-width="1.6"/><ellipse cx="${x}" cy="${y + 33}" rx="3" ry="5" fill="none" stroke="${C.woodDk}" stroke-width="1.2"/>
    <text x="${x - 42}" y="${y + 37}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="9.5" fill="${C.woodLt}">BONDS BURROW</text>${stars3(x - 42, y + 56, 3, 5)}`);
  bush(s, x + 98, y - 30, 1, undefined, C.berry);
}
function riverStones(s, x, y) { // where the trail crosses the river
  [[x - 46, y + 4, 10], [x - 14, y - 6, 20], [x + 18, y + 2, 30], [x + 50, y - 4, 40]].forEach(([sx, sy, n]) => s.add(sy + 6, `<ellipse cx="${sx}" cy="${sy + 3}" rx="15" ry="7.5" fill="${C.stoneDk}"/><ellipse cx="${sx}" cy="${sy}" rx="15" ry="7.5" fill="${C.stoneLt}"/><text x="${sx}" y="${sy + 3.5}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="9" fill="#5E5547">${n}</text>`));
  // lily pad and frog
  s.add(y + 20, `<ellipse cx="${x + 92}" cy="${y + 16}" rx="16" ry="7" fill="#4C9A4A"/><path d="M${x + 92} ${y + 16} l14 -4" stroke="${C.water}" stroke-width="3"/>
    <g transform="translate(${x + 92} ${y + 12})"><ellipse cx="0" cy="-4" rx="9" ry="7" fill="#5DA34B"/><circle cx="-5" cy="-11" r="4" fill="#5DA34B"/><circle cx="5" cy="-11" r="4" fill="#5DA34B"/><circle cx="-5" cy="-11" r="2" fill="#fff"/><circle cx="5" cy="-11" r="2" fill="#fff"/><circle cx="-4.6" cy="-10.6" r="1.1" fill="#2B2B2B"/><circle cx="5.4" cy="-10.6" r="1.1" fill="#2B2B2B"/><path d="M-4 -3 q4 3 8 0" stroke="#2F5B2A" stroke-width="1.3" fill="none" stroke-linecap="round"/></g>`);
  // reeds
  [[x - 96, y - 18], [x - 86, y - 14], [x + 120, y - 20], [x + 128, y - 14]].forEach(([rx, ry]) => s.add(ry, `<path d="M${rx} ${ry} q-2 -18 1 -28" stroke="${C.leafDk}" stroke-width="2.4" fill="none" stroke-linecap="round"/><rect x="${rx - 2}" y="${ry - 34}" width="4.5" height="11" rx="2.2" fill="${C.trunk}"/>`));
  nameBoard(s, x - 98, y - 16, 'Stepping Stone River', 1, { fs: 12 });
}
function orchard(s, x, y) {
  s.g(`<rect x="${x - 104}" y="${y - 70}" width="208" height="150" rx="40" fill="${C.meadowLt}" opacity=".8"/>`);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) tree(s, x - 62 + i * 62, y - 14 + j * 62, .78, 'apple', 30 + i * 3 + j);
  fence(s, [[x - 108, y + 84], [x - 54, y + 86], [x, y + 87]], .9);
  fence(s, [[x + 48, y + 87], [x + 108, y + 84], [x + 112, y + 30]], .9);
  // crate with the name
  s.add(y + 98, `${shadow(x + 24, y + 98, 30, 5)}<rect x="${x - 6}" y="${y + 72}" width="60" height="26" rx="3" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="1.6"/><path d="M${x - 6} ${y + 85} h60" stroke="${C.woodDk}" stroke-width="1.2"/>
    ${[x + 4, x + 14, x + 24, x + 34, x + 44].map((ax, i) => `<circle cx="${ax}" cy="${y + 70 - (i % 2) * 2}" r="5" fill="${C.apple}"/>`).join('')}
    <text x="${x + 24}" y="${y + 95}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="8.5" fill="${C.woodInk}">ORCHARD</text>`);
  s.over(`<g>${stars3(x + 24, y + 112, 0, 5)}</g>`);
}
function pond(s, x, y) {
  s.g(`<ellipse cx="${x}" cy="${y + 4}" rx="98" ry="54" fill="${C.meadowDk}" opacity=".5"/><ellipse cx="${x}" cy="${y}" rx="92" ry="48" fill="${C.waterDk}"/><ellipse cx="${x}" cy="${y - 3}" rx="86" ry="43" fill="#5FB8C9"/>
    <path d="M${x - 50} ${y - 20} q12 -5 24 0 M${x + 18} ${y + 18} q12 -5 24 0" stroke="${C.waterLt}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
  [[x - 40, y + 8, 12], [x + 34, y - 18, 10], [x + 52, y + 14, 13], [x - 6, y - 24, 9]].forEach(([lx, ly, r], i) => s.add(ly, `<ellipse cx="${lx}" cy="${ly}" rx="${r}" ry="${r * .45}" fill="#4C9A4A"/><path d="M${lx} ${ly} l${r} -2" stroke="#5FB8C9" stroke-width="2.4"/>${i === 2 ? `<circle cx="${lx - 3}" cy="${ly - 3}" r="4" fill="#F3A6BE"/><circle cx="${lx - 3}" cy="${ly - 3}" r="1.6" fill="${C.gold}"/>` : ''}`));
  // duck
  s.add(y + 2, `<g transform="translate(${x - 4} ${y + 2})"><ellipse cx="0" cy="0" rx="13" ry="7" fill="#FFFDF6"/><path d="M8 -2 q8 -2 10 -9 q-5 3 -10 2" fill="#FFFDF6"/><circle cx="-8" cy="-8" r="6" fill="#3F8B5C"/><path d="M-14 -8 l-6 1.5 l6 1.5z" fill="#F2A33C"/><circle cx="-8" cy="-9.5" r="1" fill="#1D1D1D"/><path d="M-12 -3 h8" stroke="#FFFDF6" stroke-width="2"/></g>`);
  // jetty with the name
  s.add(y + 40, `${shadow(x + 76, y + 46, 30, 4)}<rect x="${x + 50}" y="${y + 10}" width="52" height="30" rx="3" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="1.5"/>${[0, 1, 2, 3].map(i => `<path d="M${x + 50 + i * 13} ${y + 10} v30" stroke="${C.woodDk}" stroke-width="1"/>`).join('')}<rect x="${x + 52}" y="${y + 40}" width="4" height="8" fill="${C.woodDk}"/><rect x="${x + 96}" y="${y + 40}" width="4" height="8" fill="${C.woodDk}"/>`);
  nameBoard(s, x + 112, y + 64, 'Sharing Pond', 0, { fs: 12 });
  ['#9ED07A'].forEach(() => [[x - 92, y - 20], [x - 84, y - 30], [x + 88, y - 34]].forEach(([rx, ry]) => s.add(ry, `<path d="M${rx} ${ry} q-2 -16 1 -24" stroke="${C.leafDk}" stroke-width="2.2" fill="none" stroke-linecap="round"/><rect x="${rx - 2}" y="${ry - 30}" width="4" height="10" rx="2" fill="${C.trunk}"/>`)));
}
function cove(s, x, y) {
  s.g(`<path d="M0 ${y - 20} Q${x - 160} ${y - 70} ${x - 40} ${y - 60} Q${x + 120} ${y - 70} ${s.w} ${y - 30} V${s.h} H0Z" fill="${C.sandDk}"/>
    <path d="M0 ${y - 12} Q${x - 160} ${y - 62} ${x - 40} ${y - 52} Q${x + 120} ${y - 62} ${s.w} ${y - 22} V${s.h} H0Z" fill="${C.sand}"/>
    <path d="M0 ${y + 60} Q${x - 120} ${y + 20} ${x} ${y + 36} Q${x + 140} ${y + 24} ${s.w} ${y + 64} V${s.h} H0Z" fill="#4E9FC9"/>
    <path d="M0 ${y + 56} Q${x - 120} ${y + 16} ${x} ${y + 32} Q${x + 140} ${y + 20} ${s.w} ${y + 60}" stroke="#FFFFFF" stroke-width="5" fill="none" opacity=".75" stroke-linecap="round"/>
    <path d="M${x - 100} ${y + 80} q14 -5 28 0 M${x + 60} ${y + 92} q14 -5 28 0" stroke="#BFE3F5" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${[[x - 120, y - 20], [x - 60, y - 34], [x + 40, y - 30], [x + 130, y - 10], [x - 10, y]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2.4" fill="#fff" opacity=".6"/>`).join('')}`);
  // the raft with Captain Croak
  s.add(y + 60, `<g transform="translate(${x - 70} ${y - 22}) scale(.42)">${croakRaw}</g>`);
  // treasure chest and a flag with the name
  s.add(y - 4, `${shadow(x + 66, y - 4, 22, 4)}<rect x="${x + 48}" y="${y - 26}" width="36" height="22" rx="4" fill="${C.woodDk}"/><path d="M${x + 48} ${y - 18} Q${x + 66} ${y - 36} ${x + 84} ${y - 18} Z" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="2"/><rect x="${x + 48}" y="${y - 19}" width="36" height="4" fill="${C.gold}"/><rect x="${x + 63}" y="${y - 20}" width="6" height="9" rx="1.5" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1"/>`);
  s.add(y - 30, `${shadow(x + 110, y - 30, 8, 2)}<rect x="${x + 108}" y="${y - 110}" width="4" height="80" rx="2" fill="${C.woodDk}"/><path d="M${x + 112} ${y - 108} L${x + 186} ${y - 98} L${x + 112} ${y - 82} Z" fill="${C.berry}" stroke="#A93E4F" stroke-width="1.5" stroke-linejoin="round"/><text x="${x + 140}" y="${y - 92.5}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="8.5" fill="#fff">CAPTAIN'S COVE</text>`);
  s.over(`<g>${stars3(x + 142, y - 70, 0, 5)}</g>`);
  rock(s, x - 140, y - 16, 1.2); rock(s, x + 150, y + 4, .9);
}

/* ---------------- the Maths route ---------------- */
export function mathsRoute() {
  const s = new Scene(640, 1500);
  meadowFloor(s, 7);
  // the waterway: comes in top right, crosses the trail, fills the pond, runs to the cove
  river(s, 'M700 470 C600 520 560 560 470 590 S300 640 220 650 S80 700 96 800 S150 920 160 980', 34);
  river(s, 'M150 1090 C150 1180 230 1240 300 1290 S330 1330 330 1360', 28);
  path(s, 'M320 -20 C320 40 300 70 280 110 S330 250 380 300 S470 380 420 450 S300 540 330 640 S470 720 470 800 S420 880 360 960 S250 1060 300 1130 S420 1190 360 1260', 30);
  park(s, 220, 200);
  burrow(s, 440, 420);
  riverStones(s, 330, 632);
  orchard(s, 440, 860);
  pond(s, 170, 1040);
  cove(s, 330, 1400);
  // border woods and hedges (frame the phone view, fill the iPad edges)
  const r = rng(99);
  [[40, 120], [90, 70], [600, 90], [560, 180], [610, 300], [30, 330], [70, 420], [600, 640], [560, 720], [20, 560], [610, 980], [580, 1100], [40, 1220], [610, 1200], [26, 860]].forEach(([tx, ty], i) => tree(s, tx, ty, .9 + r() * .4, i % 3 === 0 ? 'pine' : (i % 5 === 1 ? 'blossom' : 'round'), i * 7));
  [[150, 330, 1], [520, 260, .9], [270, 470, .9], [560, 520, 1], [250, 760, .8], [130, 900, .9], [520, 1010, 1], [250, 1180, .9], [470, 1170, .8]].forEach(([bx, by, k], i) => bush(s, bx, by, k, undefined, i % 3 ? null : C.berry));
  rock(s, 540, 600, .8); rock(s, 200, 560, .7); rock(s, 300, 960, .7);
  scatter(s, 5, 120, [0, 0, 640, 1320], [[300, 600, 80, 70]]);
  butterfly(s, 260, 340, '#F7D24A'); butterfly(s, 500, 760, '#F07CA8'); butterfly(s, 120, 980, '#B58BE0');
  // Bonnie the guide, on the trail before the river, with her paw prints from the burrow
  s.over([[392, 498, -20], [376, 520, -30], [362, 540, -10]].map(([px, py, rot]) => paw(px, py, .55, C.ink, .28, rot)).join(''));
  s.add(590, bonnie(330, 590, .58));
  s.over(bubble(134, 452, 170, ['Shall we hop across', 'the river today?'], 300, 532, 14));
  return s;
}

/* ---------------- the Clubhouse meadow (hub) ---------------- */
function clubhouse(s, x, y) { // x,y = middle of the front step
  s.add(y, `${shadow(x, y + 4, 120, 16, .2)}
    <rect x="${x - 96}" y="${y - 112}" width="192" height="112" rx="6" fill="${C.woodDk}"/>
    <rect x="${x - 92}" y="${y - 112}" width="184" height="106" rx="5" fill="${C.wood}"/>
    ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${x - 92} ${y - 96 + i * 16} h184" stroke="${C.woodDk}" stroke-width="1.6" opacity=".55"/>`).join('')}
    <path d="M${x - 118} ${y - 104} L${x} ${y - 190} L${x + 118} ${y - 104} Z" fill="#A93E4F"/>
    <path d="M${x - 110} ${y - 108} L${x} ${y - 186} L${x + 110} ${y - 108} Z" fill="${C.berry}"/>
    ${[0, 1, 2, 3].map(i => `<path d="M${x - 92 + i * 22} ${y - 120 - i * 14} H${x + 92 - i * 22}" stroke="#E98896" stroke-width="2" opacity=".8"/>`).join('')}
    <circle cx="${x}" cy="${y - 140}" r="17" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="3"/>${bone(x, y - 140, .55)}
    <rect x="${x - 4}" y="${y - 232}" width="5" height="50" fill="${C.woodDk}"/><path d="M${x + 1} ${y - 230} L${x + 40} ${y - 222} L${x + 1} ${y - 212}Z" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1.5"/>
    <rect x="${x - 70}" y="${y - 92}" width="40" height="34" rx="4" fill="#CFEAF4" stroke="${C.woodDk}" stroke-width="3"/><path d="M${x - 50} ${y - 92} v34 M${x - 70} ${y - 75} h40" stroke="${C.woodDk}" stroke-width="2.4"/>
    <rect x="${x + 30}" y="${y - 92}" width="40" height="34" rx="4" fill="#CFEAF4" stroke="${C.woodDk}" stroke-width="3"/><path d="M${x + 50} ${y - 92} v34 M${x + 30} ${y - 75} h40" stroke="${C.woodDk}" stroke-width="2.4"/>
    <rect x="${x - 74}" y="${y - 56}" width="48" height="10" rx="3" fill="${C.woodDk}"/>${[0, 1, 2, 3].map(i => `<circle cx="${x - 66 + i * 11}" cy="${y - 58}" r="4" fill="${C.flowers[i + 1]}"/>`).join('')}
    <rect x="${x + 26}" y="${y - 56}" width="48" height="10" rx="3" fill="${C.woodDk}"/>${[0, 1, 2, 3].map(i => `<circle cx="${x + 34 + i * 11}" cy="${y - 58}" r="4" fill="${C.flowers[(i + 2) % 5]}"/>`).join('')}
    <path d="M${x - 22} ${y - 4} V${y - 66} Q${x} ${y - 86} ${x + 22} ${y - 66} V${y - 4} Z" fill="#7A4A26"/><circle cx="${x + 12}" cy="${y - 34}" r="2.6" fill="${C.gold}"/>
    <rect x="${x - 62}" y="${y - 6}" width="124" height="10" rx="3" fill="${C.woodDk}"/><rect x="${x - 56}" y="${y - 8}" width="112" height="8" rx="3" fill="${C.woodLt}"/>
    <rect x="${x - 70}" y="${y - 108}" width="140" height="22" rx="5" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="2"/>
    <text x="${x}" y="${y - 92.5}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="13" fill="${C.woodInk}">Sam's Clubhouse</text>`);
  // Bonnie's bowl
  s.add(y + 14, `${shadow(x + 70, y + 16, 16, 3)}<path d="M${x + 56} ${y + 6} h28 l-4 10 h-20 z" fill="#3B7FC4" stroke="#245A91" stroke-width="1.5"/>${bone(x + 70, y + 4, .35)}`);
}
function gate(s, x, y, title, bunting, col) {
  const flags = bunting.map((t, i) => {
    const fx = x - 44 + i * (88 / (bunting.length - 1)), fy = y - 76 + Math.sin(i / (bunting.length - 1) * Math.PI) * 10;
    return `<path d="M${fx - 8} ${fy} L${fx + 8} ${fy} L${fx} ${fy + 16} Z" fill="${col[i % col.length]}"/><text x="${fx}" y="${fy + 9}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="8.5" fill="#fff">${t}</text>`;
  }).join('');
  s.add(y, `${shadow(x, y + 2, 56, 6)}<rect x="${x - 56}" y="${y - 96}" width="9" height="98" rx="3" fill="${C.woodDk}"/><rect x="${x + 47}" y="${y - 96}" width="9" height="98" rx="3" fill="${C.woodDk}"/>
    <rect x="${x - 56}" y="${y - 96}" width="6" height="96" rx="3" fill="${C.wood}"/><rect x="${x + 47}" y="${y - 96}" width="6" height="96" rx="3" fill="${C.wood}"/>
    <path d="M${x - 52} ${y - 78} Q${x} ${y - 64} ${x + 52} ${y - 78}" stroke="${C.woodDk}" stroke-width="1.2" fill="none"/>${flags}
    <rect x="${x - 64}" y="${y - 122}" width="128" height="30" rx="7" fill="${C.woodDk}"/><rect x="${x - 64}" y="${y - 125}" width="128" height="30" rx="7" fill="${C.woodLt}"/>
    <text x="${x}" y="${y - 104}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="15" fill="${C.woodInk}">${title}</text>`);
}
function shopStall(s, x, y) {
  s.add(y, `${shadow(x, y + 2, 50, 6)}<rect x="${x - 44}" y="${y - 40}" width="88" height="40" rx="3" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="2"/>
    <rect x="${x - 50}" y="${y - 44}" width="100" height="8" rx="3" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="1.5"/>
    <rect x="${x - 44}" y="${y - 96}" width="5" height="56" fill="${C.woodDk}"/><rect x="${x + 39}" y="${y - 96}" width="5" height="56" fill="${C.woodDk}"/>
    <path d="M${x - 56} ${y - 84} L${x - 46} ${y - 108} H${x + 46} L${x + 56} ${y - 84} Z" fill="#FFF6E2"/>
    ${[0, 1, 2, 3, 4].map(i => `<path d="M${x - 46 + i * 23} ${y - 108} L${x - 56 + i * 28} ${y - 84} H${x - 56 + i * 28 + 14} L${x - 46 + i * 23 + 11.5} ${y - 108} Z" fill="${C.berry}"/>`).join('')}
    ${[0, 1, 2, 3, 4].map(i => `<path d="M${x - 56 + i * 28} ${y - 84} a7 6 0 0 0 14 0" fill="${C.berry}"/><path d="M${x - 42 + i * 28} ${y - 84} a7 6 0 0 0 14 0" fill="#FFF6E2"/>`).join('')}
    <path d="M${x - 30} ${y - 44} L${x - 20} ${y - 66} L${x - 10} ${y - 44} Z" fill="#3BA8D9" stroke="#2179A3" stroke-width="1.2"/><circle cx="${x - 20}" cy="${y - 67}" r="3" fill="${C.gold}"/>
    <path d="M${x - 2} ${y - 44} l2 -18 l7 9 l7 -12 l7 12 l7 -9 l2 18 Z" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1.2" stroke-linejoin="round"/>
    <rect x="${x - 34}" y="${y - 30}" width="68" height="20" rx="4" fill="${C.woodLt}"/>${bone(x - 18, y - 20, .32)}<text x="${x + 8}" y="${y - 15.5}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="10.5" fill="${C.woodInk}">SHOP</text>`);
}
function walkGate(s, x, y) {
  s.add(y, `${shadow(x, y + 2, 40, 6)}
    <path d="M${x - 40} ${y} V${y - 50} Q${x} ${y - 96} ${x + 40} ${y - 50} V${y}" fill="none" stroke="${C.leafDk}" stroke-width="20" stroke-linecap="round"/>
    <path d="M${x - 40} ${y - 2} V${y - 50} Q${x} ${y - 94} ${x + 40} ${y - 50} V${y - 2}" fill="none" stroke="${C.leaf}" stroke-width="14" stroke-linecap="round"/>
    ${[[-40, -40], [-30, -70], [0, -82], [30, -70], [40, -40], [-40, -14], [40, -18]].map(([a, b], i) => `<circle cx="${x + a}" cy="${y + b}" r="3.2" fill="${C.flowers[i % 5]}"/>`).join('')}
    <rect x="${x - 30}" y="${y - 56}" width="60" height="22" rx="6" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="1.6"/>${paw(x - 18, y - 45, .45, C.woodInk)}<text x="${x + 6}" y="${y - 40.5}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="10.5" fill="${C.woodInk}">WALK</text>`);
  [[x - 10, y + 22], [x + 12, y + 40], [x - 4, y + 60]].forEach(([a, b]) => s.add(b, `<ellipse cx="${a}" cy="${b}" rx="12" ry="5.5" fill="${C.stoneDk}"/><ellipse cx="${a}" cy="${b - 2}" rx="12" ry="5.5" fill="${C.stoneLt}"/>`));
}
function phonicsPeek(s, x, y) { // first glimpse of Phonics Forest beyond the Words gate
  [[x - 50, y, 'pine', 'a'], [x + 4, y - 26, 'round', 'sh'], [x + 56, y + 6, 'pine', 'e'], [x - 6, y + 40, 'round', 'oo']].forEach(([tx, ty, kind, t], i) => {
    tree(s, tx, ty, .8, kind, 40 + i);
    s.add(ty + 1, `<g><circle cx="${tx}" cy="${ty - (kind === 'pine' ? 30 : 40)}" r="10" fill="${C.paper}" stroke="${C.leafDk}" stroke-width="1.5"/><text x="${tx}" y="${ty - (kind === 'pine' ? 26 : 36)}" text-anchor="middle" font-family="Andika" font-size="11" fill="${C.leafDeep}">${t}</text></g>`);
  });
}
export function hub() {
  const s = new Scene(640, 930);
  // sky and far hills
  s.g(`<defs><linearGradient id="hubSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sky1}"/><stop offset="1" stop-color="${C.sky2}"/></linearGradient></defs>
    <rect width="640" height="240" fill="url(#hubSky)"/><circle cx="520" cy="70" r="26" fill="${C.gold}" opacity=".9"/><circle cx="520" cy="70" r="38" fill="${C.gold}" opacity=".18"/>
    ${cloud(150, 70, 1.1)}${cloud(400, 50, .8)}${cloud(600, 120, .7)}
    <path d="M0 200 Q90 130 200 160 Q300 120 420 150 Q540 110 640 160 V260 H0Z" fill="${C.farHill}"/>
    <path d="M0 220 Q120 170 250 200 Q380 160 500 196 Q580 176 640 200 V280 H0Z" fill="${C.farHill2}"/>
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
  walkGate(s, 168, 506);
  shopStall(s, 472, 502);
  gate(s, 188, 690, 'Meadow Maths', ['1', '2', '3', '+', '×'], ['#3B7FC4', C.berry, C.gold, '#3F8B5C', '#E07A3F']);
  gate(s, 452, 690, 'Meadow Words', ['a', 'b', 'c', 'sh', 'oo'], [C.berry, '#3B7FC4', '#3F8B5C', '#E07A3F', '#8E6CD0']);
  // what lies beyond each gate
  [[118, 790, 10], [146, 806, 20], [176, 790, 30]].forEach(([a, b, n]) => s.add(b, `<ellipse cx="${a}" cy="${b + 3}" rx="13" ry="6.5" fill="${C.stoneDk}"/><ellipse cx="${a}" cy="${b}" rx="13" ry="6.5" fill="${C.stoneLt}"/><text x="${a}" y="${b + 3}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="8" fill="#5E5547">${n}</text>`));
  s.g(`<path d="M0 800 C60 790 100 810 200 800" stroke="${C.waterDk}" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M0 800 C60 790 100 810 200 800" stroke="${C.water}" stroke-width="17" fill="none" stroke-linecap="round"/>`);
  [[226, 840, 1.05], [246, 826, .95], [266, 838, 1]].forEach(([bx, by, k]) => { let g = ''; for (let j = 0; j < 5; j++) g += `<rect x="${bx - 12 * k + j * 5 * k}" y="${by - 46 * k}" width="${4.6 * k}" height="${46 * k}" rx="1.6" fill="${j % 2 ? C.brick : '#E68A5C'}" stroke="${C.brickDk}" stroke-width="1"/>`; s.add(by, g + `<rect x="${bx - 14 * k}" y="${by - 27 * k}" width="${28 * k}" height="${5 * k}" rx="2" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="1"/>`); });
  phonicsPeek(s, 520, 820);
  [[392, 770, 'the'], [418, 800, 'said']].forEach(([a, b, t]) => s.add(b, `${shadow(a, b, 8, 2)}<rect x="${a - 2}" y="${b - 36}" width="4" height="36" fill="${C.woodDk}"/><path d="M${a - 18} ${b - 38} H${a + 14} L${a + 22} ${b - 30} L${a + 14} ${b - 22} H${a - 18} Z" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="1.4"/><text x="${a}" y="${b - 26}" text-anchor="middle" font-family="Andika" font-size="10" fill="${C.woodInk}">${t}</text>`));
  // trees and hedges round the edge
  const r = rng(5);
  [[40, 300], [90, 270], [610, 290], [570, 262], [30, 420], [612, 420], [60, 600], [590, 610], [30, 720], [612, 760], [210, 286], [430, 276]].forEach(([tx, ty], i) => tree(s, tx, ty, .85 + r() * .35, i % 4 === 0 ? 'pine' : (i % 5 === 2 ? 'blossom' : 'round'), 60 + i));
  [[120, 390, .9], [520, 396, .9], [250, 620, .8], [390, 620, .8], [320, 760, 1]].forEach(([bx, by, k], i) => bush(s, bx, by, k, undefined, i % 2 ? C.berry : null));
  fence(s, [[100, 460], [128, 444], [156, 436]], .9); fence(s, [[484, 436], [512, 444], [540, 460]], .9);
  scatter(s, 9, 90, [0, 240, 640, 930], [[220, 380, 200, 120]]);
  butterfly(s, 250, 380, '#F07CA8'); butterfly(s, 400, 330, '#F7D24A');
  // Bonnie the guide at the door
  s.add(500, bonnie(270, 500, .62));
  s.over(bubble(296, 512, 150, ['Woof! Maths or', 'words today, Sam?'], 286, 470, 14));
  return s;
}
