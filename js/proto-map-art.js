/* Meadow Maths map prototype: the drawings (design iteration 2, "the Clubhouse meadow and its routes").
   Plain SVG strings, drawn once. No libraries. Exposes window.ProtoArt. */
(function () {
const croak = () => { const w = Meadow.world('y2-maths-captains-cove'); return w && w.host ? w.host.svg('claim').replace(/<svg[^>]*>/, '').replace('</svg>', '') : ''; };
// Meadow Clubhouse, design iteration 2: an illustrated landscape kit.
// Flat shapes with depth from overlapping layers: a darker same-hue base, the main colour, a light top.
// Outlines only as darker shades of the fill, never black. Everything sorts by its foot (y) so things overlap naturally.

const C = {
  ink: '#4A3B2C', soft: '#7A6A58', paper: '#FFFBF1',
  sky1: '#BFE6F5', sky2: '#E9F6EF',
  farHill: '#B9D9B0', farHill2: '#A7CF9E', midHill: '#9CCB7E', meadow: '#8FC46B', meadowLt: '#A8D485', meadowDk: '#6FA552',
  leaf: '#5E9E4E', leafLt: '#7DB862', leafDk: '#3F7A3A', leafDeep: '#2F5F2E',
  trunk: '#8A5A36', trunkDk: '#5E3B20',
  wood: '#D9A86C', woodLt: '#EDC994', woodDk: '#9A6A3A', woodInk: '#5C3D1E',
  path: '#EBD3A3', pathEdge: '#CDA772', pathLt: '#F6E6C3',
  water: '#6CC0E0', waterDk: '#3F8FB8', waterLt: '#BFE9F6',
  stone: '#D8D0C0', stoneDk: '#9C927F', stoneLt: '#EFEAE0',
  sand: '#EED296', sandDk: '#C9A35A', sandLt: '#F8E8BE',
  gold: '#F2C14E', goldDk: '#B88A1E', berry: '#D9596B', apple: '#D9443A', appleLt: '#F28B82',
  brick: '#D97A4E', brickLt: '#F2B48F', brickDk: '#9E4A27', earth: '#A9743F', earthDk: '#4A2E1A', earthLt: '#C8935A',
  flowers: ['#FFFFFF', '#F7D24A', '#F07CA8', '#B58BE0', '#F08A3C'],
};

// a tiny seeded random, so every drawing is the same each time
function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

class Scene {
  constructor(w, h) { this.w = w; this.h = h; this.ground = []; this.items = []; this.top = []; this.defs = []; this.bleed = 0; this.shift = null; }
  g(svg) { this.ground.push(svg); return this; }
  add(y, svg) { this.items.push({ y, svg }); return this; }
  over(svg) { this.top.push(svg); return this; }
  render() {
    const all = `${this.ground.join('')}${this.items.sort((a, b) => a.y - b.y).map(i => i.svg).join('')}${this.top.join('')}`;
    return `<defs>${this.defs.join('')}</defs>${this.shift ? `<g transform="translate(${this.shift[0]} ${this.shift[1]})">${all}</g>` : all}`;
  }
}

const shadow = (x, y, rx, ry = rx * .3, op = .16) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#3B4A1E" opacity="${op}"/>`;

function tree(s, x, y, k = 1, kind = 'round', seed = 1) {
  const r = rng(seed); const R = 30 * k;
  let svg = shadow(x + 6 * k, y + 2, R * .95, R * .28);
  svg += `<path d="M${x - 5 * k} ${y} Q${x - 4 * k} ${y - R * .9} ${x - 2 * k} ${y - R * 1.3} L${x + 3 * k} ${y - R * 1.3} Q${x + 5 * k} ${y - R * .9} ${x + 6 * k} ${y} Z" fill="${C.trunk}"/>`;
  if (kind === 'pine') {
    const cy = y - R * .55;
    [[1.25, C.leafDk, 0], [1.0, C.leaf, -R * .55], [.72, C.leafLt, -R * 1.05]].forEach(([w, f, dy]) => {
      svg += `<path d="M${x - R * w} ${cy + dy + R * .35} Q${x} ${cy + dy + R * .55} ${x + R * w} ${cy + dy + R * .35} L${x} ${cy + dy - R * .9} Z" fill="${f}" stroke="${C.leafDeep}" stroke-opacity=".25" stroke-width="1.5" stroke-linejoin="round"/>`;
    });
  } else {
    const cy = y - R * 1.55, col = kind === 'blossom' ? ['#E58FAE', '#F2B3C8', '#FBD6E2'] : [C.leafDk, C.leaf, C.leafLt];
    svg += `<g><circle cx="${x - R * .45}" cy="${cy + R * .25}" r="${R * .72}" fill="${col[0]}"/><circle cx="${x + R * .5}" cy="${cy + R * .2}" r="${R * .7}" fill="${col[0]}"/><circle cx="${x}" cy="${cy - R * .2}" r="${R * .85}" fill="${col[0]}"/>
      <circle cx="${x - R * .42}" cy="${cy + R * .12}" r="${R * .62}" fill="${col[1]}"/><circle cx="${x + R * .45}" cy="${cy + R * .06}" r="${R * .6}" fill="${col[1]}"/><circle cx="${x - R * .02}" cy="${cy - R * .32}" r="${R * .72}" fill="${col[1]}"/>
      <circle cx="${x - R * .25}" cy="${cy - R * .5}" r="${R * .34}" fill="${col[2]}" opacity=".9"/><circle cx="${x + R * .3}" cy="${cy - R * .22}" r="${R * .2}" fill="${col[2]}" opacity=".7"/>
      ${Array.from({ length: 5 }, () => `<circle cx="${(x + (r() - .5) * R * 1.4).toFixed(1)}" cy="${(cy + (r() - .4) * R).toFixed(1)}" r="${(1.6 * k).toFixed(1)}" fill="#fff" opacity=".28"/>`).join('')}</g>`;
    if (kind === 'apple') svg += [[-.4, .1], [.35, .3], [0, -.25], [.5, -.15], [-.2, .45], [-.55, -.2]].map(([dx, dy]) => `<circle cx="${x + dx * R}" cy="${cy + dy * R}" r="${4 * k}" fill="${C.apple}"/><circle cx="${x + dx * R - 1.3 * k}" cy="${cy + dy * R - 1.4 * k}" r="${1.2 * k}" fill="${C.appleLt}"/>`).join('');
  }
  s.add(y, svg);
}
function bush(s, x, y, k = 1, col = [C.leafDk, C.leaf, C.leafLt], berries) {
  const R = 14 * k;
  let svg = shadow(x + 3, y + 1, R * 1.4, R * .35);
  svg += `<circle cx="${x - R * .8}" cy="${y - R * .5}" r="${R * .8}" fill="${col[0]}"/><circle cx="${x + R * .8}" cy="${y - R * .5}" r="${R * .8}" fill="${col[0]}"/><circle cx="${x}" cy="${y - R * .85}" r="${R}" fill="${col[0]}"/>
    <circle cx="${x - R * .7}" cy="${y - R * .65}" r="${R * .62}" fill="${col[1]}"/><circle cx="${x + R * .7}" cy="${y - R * .62}" r="${R * .6}" fill="${col[1]}"/><circle cx="${x}" cy="${y - R}" r="${R * .78}" fill="${col[1]}"/>
    <circle cx="${x - R * .25}" cy="${y - R * 1.3}" r="${R * .3}" fill="${col[2]}"/>`;
  if (berries) svg += [[-.6, -.6], [.4, -.9], [.8, -.4], [-.1, -.5]].map(([a, b]) => `<circle cx="${x + a * R}" cy="${y + b * R}" r="${2 * k}" fill="${berries}"/>`).join('');
  s.add(y, svg);
}
function tuft(s, x, y, k = 1, col = C.meadowDk) {
  s.add(y - 1, `<path d="M${x - 6 * k} ${y} q2 -9 -1 -14 M${x} ${y} q0 -12 2 -17 M${x + 6 * k} ${y} q-1 -8 4 -12" stroke="${col}" stroke-width="${2.2 * k}" fill="none" stroke-linecap="round"/>`);
}
function flowers(s, x, y, n = 5, seed = 3, spread = 18) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const fx = x + (r() - .5) * spread * 2, fy = y + (r() - .5) * spread * .8, c = C.flowers[Math.floor(r() * C.flowers.length)], k = .7 + r() * .5;
    s.add(fy, `<path d="M${fx} ${fy} v-${6 * k}" stroke="${C.leafDk}" stroke-width="1.4"/><g fill="${c}">${[0, 72, 144, 216, 288].map(a => `<circle cx="${(fx + Math.cos(a * Math.PI / 180) * 2.6 * k).toFixed(1)}" cy="${(fy - 7 * k + Math.sin(a * Math.PI / 180) * 2.6 * k).toFixed(1)}" r="${2.1 * k}"/>`).join('')}</g><circle cx="${fx}" cy="${fy - 7 * k}" r="${1.3 * k}" fill="${c === '#F7D24A' ? '#E08A2C' : '#F7D24A'}"/>`);
  }
}
function rock(s, x, y, k = 1) {
  s.add(y, `${shadow(x + 2, y, 13 * k, 4 * k)}<path d="M${x - 13 * k} ${y} Q${x - 12 * k} ${y - 12 * k} ${x - 2 * k} ${y - 13 * k} Q${x + 12 * k} ${y - 12 * k} ${x + 13 * k} ${y} Z" fill="${C.stoneDk}"/><path d="M${x - 11 * k} ${y - 2 * k} Q${x - 10 * k} ${y - 12 * k} ${x - 2 * k} ${y - 12 * k} Q${x + 9 * k} ${y - 11 * k} ${x + 9 * k} ${y - 3 * k} Z" fill="${C.stone}"/><path d="M${x - 6 * k} ${y - 9 * k} q4 -2 8 -1" stroke="${C.stoneLt}" stroke-width="${2 * k}" fill="none" stroke-linecap="round"/>`);
}
function fence(s, pts, k = 1) {
  // posts at each point, two rails between consecutive points
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    s.add(Math.max(y1, y2) - 2, `<path d="M${x1} ${y1 - 14 * k} L${x2} ${y2 - 14 * k} M${x1} ${y1 - 6 * k} L${x2} ${y2 - 6 * k}" stroke="${C.woodDk}" stroke-width="${4 * k}" stroke-linecap="round"/><path d="M${x1} ${y1 - 15 * k} L${x2} ${y2 - 15 * k} M${x1} ${y1 - 7 * k} L${x2} ${y2 - 7 * k}" stroke="${C.wood}" stroke-width="${2.6 * k}" stroke-linecap="round"/>`);
  }
  pts.forEach(([x, y]) => s.add(y, `<rect x="${x - 2.6 * k}" y="${y - 20 * k}" width="${5.2 * k}" height="${21 * k}" rx="${1.6 * k}" fill="${C.woodDk}"/><rect x="${x - 2.6 * k}" y="${y - 20 * k}" width="${3.4 * k}" height="${20 * k}" rx="${1.4 * k}" fill="${C.wood}"/>`));
}
function path(s, d, w = 30) {
  s.g(`<path d="${d}" fill="none" stroke="${C.meadowDk}" stroke-width="${w + 12}" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/>
    <path d="${d}" fill="none" stroke="${C.pathEdge}" stroke-width="${w + 5}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${C.path}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${C.pathLt}" stroke-width="${w * .35}" stroke-linecap="round" stroke-linejoin="round" opacity=".7" stroke-dasharray="30 26"/>`);
}
function river(s, d, w = 34) {
  s.g(`<path d="${d}" fill="none" stroke="${C.meadowDk}" stroke-width="${w + 16}" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>
    <path d="${d}" fill="none" stroke="${C.waterDk}" stroke-width="${w + 6}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${C.water}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${C.waterLt}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="10 34" transform="translate(-6 -3)"/>
    <path d="${d}" fill="none" stroke="${C.waterLt}" stroke-width="2" stroke-linecap="round" stroke-dasharray="6 50" transform="translate(7 4)" opacity=".8"/>`);
}
function cloud(x, y, k = 1) {
  return `<g fill="#fff" opacity=".95"><ellipse cx="${x}" cy="${y}" rx="${30 * k}" ry="${11 * k}"/><circle cx="${x - 10 * k}" cy="${y - 7 * k}" r="${11 * k}"/><circle cx="${x + 9 * k}" cy="${y - 10 * k}" r="${14 * k}"/></g>`;
}
function butterfly(s, x, y, c = '#F7D24A') {
  s.over(`<g transform="translate(${x} ${y})"><ellipse cx="-4" cy="-2" rx="4.5" ry="3.5" fill="${c}" transform="rotate(-25 -4 -2)"/><ellipse cx="4" cy="-2" rx="4.5" ry="3.5" fill="${c}" transform="rotate(25 4 -2)"/><ellipse cx="-3" cy="3" rx="3" ry="2.4" fill="${c}"/><ellipse cx="3" cy="3" rx="3" ry="2.4" fill="${c}"/><path d="M0 -4 v9" stroke="${C.ink}" stroke-width="1.4" stroke-linecap="round"/></g>`);
}
function star(x, y, r = 8, on = true) {
  const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .48 : r; pts.push(`${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`); }
  return `<polygon points="${pts.join(' ')}" fill="${on ? C.gold : '#FFF6E2'}" stroke="${on ? C.goldDk : '#CDBEA2'}" stroke-width="1.4" stroke-linejoin="round"/>`;
}
const stars3 = (x, y, n, r = 7) => [0, 1, 2].map(i => star(x + (i - 1) * r * 2.3, y, r, i < n)).join('');
// the bone (the game's money): the engine's drawing (js/meadow-core.js, bonePath), placed and sized
function bone(x, y, k = 1, fill = '#FFF6E2', stroke = '#C9A777') {
  return `<g transform="translate(${x} ${y}) scale(${k})">${Meadow.ui.bonePath(fill, stroke)}</g>`;
}
function paw(x, y, k = 1, fill = C.ink, op = 1, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${k})" fill="${fill}" opacity="${op}"><ellipse cx="0" cy="4" rx="7" ry="6"/><circle cx="-7" cy="-5" r="3"/><circle cx="-2.5" cy="-9" r="3"/><circle cx="2.5" cy="-9" r="3"/><circle cx="7" cy="-5" r="3"/></g>`;
}
function bonnie(x, y, k = 1, look = '') {
  // x,y = her feet
  return `${shadow(x, y - 2, 34 * k, 8 * k, .2)}<g transform="translate(${x - 60 * k} ${y - 120 * k}) scale(${k})">${Meadow.ui.bonnieSVG().replace(/<svg[^>]*>/, '').replace('</svg>', '')}</g>`;
}
// a speech bubble with a tail pointing to (tx,ty); text lines in Andika
function bubble(x, y, w, lines, tx, ty, fs = 15) {
  const h = lines.length * fs * 1.3 + 20, ax = Math.min(Math.max(tx, x + 24), x + w - 30);
  const d = ty < y
    ? `M${x + 14} ${y} H${ax - 8} L${tx} ${ty} L${ax + 12} ${y} H${x + w - 14} Q${x + w} ${y} ${x + w} ${y + 14} V${y + h - 14} Q${x + w} ${y + h} ${x + w - 14} ${y + h} H${x + 14} Q${x} ${y + h} ${x} ${y + h - 14} V${y + 14} Q${x} ${y} ${x + 14} ${y} Z`
    : `M${x + 14} ${y} H${x + w - 14} Q${x + w} ${y} ${x + w} ${y + 14} V${y + h - 14} Q${x + w} ${y + h} ${x + w - 14} ${y + h} H${ax + 12} L${tx} ${ty} L${ax - 8} ${y + h} H${x + 14} Q${x} ${y + h} ${x} ${y + h - 14} V${y + 14} Q${x} ${y} ${x + 14} ${y} Z`;
  return `<g><path d="${d}" fill="${C.paper}" stroke="#D9C7A6" stroke-width="2" stroke-linejoin="round"/>
    ${lines.map((l, i) => `<text x="${x + 14}" y="${y + 13 + fs + i * fs * 1.3}" font-family="Andika" font-size="${fs}" fill="${C.ink}">${l}</text>`).join('')}</g>`;
}
// a small hanging name board on a post; text is drawn so its length sets the board
function nameBoard(s, x, y, text, nStars, opts = {}) {
  const fs = opts.fs || 13, w = Math.max(70, text.length * fs * .56 + 24), h = nStars == null ? 26 : 40;
  const post = opts.post !== false;
  let svg = '';
  if (post) svg += `${shadow(x, y, 8, 2.5)}<rect x="${x - 2.5}" y="${y - h - 30}" width="5" height="${h + 30}" rx="2" fill="${C.woodDk}"/>`;
  const bx = x - w / 2, by = y - h - (post ? 22 : 0);
  svg += `<rect x="${bx}" y="${by + 3}" width="${w}" height="${h}" rx="6" fill="${opts.dk || C.woodDk}"/><rect x="${bx}" y="${by}" width="${w}" height="${h}" rx="6" fill="${opts.fill || C.woodLt}"/>
    <text x="${x}" y="${by + 17}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="${fs}" fill="${opts.ink || C.woodInk}">${text}</text>`;
  if (nStars != null) svg += stars3(x, by + 30, nStars, 5.5);
  s.add(y + (opts.z || 0), svg);
}


function meadowFloor(s, seed, from = 0, n = 26) {
  const r = rng(seed);
  const b = s.bleed; // the grass carries on past the drawing's edges, when the picture around it is bigger
  s.g(`<rect x="${-b}" y="${from - (from ? 0 : b)}" width="${s.w + 2 * b}" height="${s.h - from + (from ? 0 : 2 * b)}" fill="${C.meadow}"/>`);
  for (let i = 0; i < n; i++) {
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
    ${[-24, -8, 8, 24].map(d => `<circle cx="${gx + d}" cy="${gy - 50 - (d === 8 || d === -8 ? 4 : 0)}" r="3" fill="${C.flowers[(d + 24) / 16 + 1]}"/>`).join('')}
    `);
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
    <path d="M${x - 70} ${y + 30} q20 4 40 0 M${x - 56} ${y + 38} q18 3 36 0" stroke="${C.trunkDk}" stroke-width="1.4" fill="none" opacity=".6"/>`);
  bush(s, x + 98, y - 30, 1, undefined, C.berry);
}
function riverStones(s, x, y) { // where the trail crosses the river
  [[x - 46, y + 4, 10], [x - 14, y - 6, 20], [x + 18, y + 2, 30], [x + 50, y - 4, 40]].forEach(([sx, sy, n]) => s.add(sy + 6, `<ellipse cx="${sx}" cy="${sy + 3}" rx="15" ry="7.5" fill="${C.stoneDk}"/><ellipse cx="${sx}" cy="${sy}" rx="15" ry="7.5" fill="${C.stoneLt}"/><text x="${sx}" y="${sy + 3.5}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="9" fill="#5E5547">${n}</text>`));
  // lily pad and frog
  s.add(y + 20, `<ellipse cx="${x + 92}" cy="${y + 16}" rx="16" ry="7" fill="#4C9A4A"/><path d="M${x + 92} ${y + 16} l14 -4" stroke="${C.water}" stroke-width="3"/>
    <g transform="translate(${x + 92} ${y + 12})"><ellipse cx="0" cy="-4" rx="9" ry="7" fill="#5DA34B"/><circle cx="-5" cy="-11" r="4" fill="#5DA34B"/><circle cx="5" cy="-11" r="4" fill="#5DA34B"/><circle cx="-5" cy="-11" r="2" fill="#fff"/><circle cx="5" cy="-11" r="2" fill="#fff"/><circle cx="-4.6" cy="-10.6" r="1.1" fill="#2B2B2B"/><circle cx="5.4" cy="-10.6" r="1.1" fill="#2B2B2B"/><path d="M-4 -3 q4 3 8 0" stroke="#2F5B2A" stroke-width="1.3" fill="none" stroke-linecap="round"/></g>`);
  // reeds
  [[x - 96, y - 18], [x - 86, y - 14], [x + 120, y - 20], [x + 128, y - 14]].forEach(([rx, ry]) => s.add(ry, `<path d="M${rx} ${ry} q-2 -18 1 -28" stroke="${C.leafDk}" stroke-width="2.4" fill="none" stroke-linecap="round"/><rect x="${rx - 2}" y="${ry - 34}" width="4.5" height="11" rx="2.2" fill="${C.trunk}"/>`));
}
function orchard(s, x, y) {
  s.g(`<rect x="${x - 104}" y="${y - 70}" width="208" height="150" rx="40" fill="${C.meadowLt}" opacity=".8"/>`);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) tree(s, x - 62 + i * 62, y - 14 + j * 62, .78, 'apple', 30 + i * 3 + j);
  fence(s, [[x - 108, y + 84], [x - 54, y + 86], [x, y + 87]], .9);
  fence(s, [[x + 48, y + 87], [x + 108, y + 84], [x + 112, y + 30]], .9);
  // crate with the name
  s.add(y + 98, `${shadow(x + 24, y + 98, 30, 5)}<rect x="${x - 6}" y="${y + 72}" width="60" height="26" rx="3" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="1.6"/><path d="M${x - 6} ${y + 85} h60" stroke="${C.woodDk}" stroke-width="1.2"/>
    ${[x + 4, x + 14, x + 24, x + 34, x + 44].map((ax, i) => `<circle cx="${ax}" cy="${y + 70 - (i % 2) * 2}" r="5" fill="${C.apple}"/>`).join('')}`);
  s.over(`<g></g>`);
}
function pond(s, x, y) {
  s.g(`<ellipse cx="${x}" cy="${y + 4}" rx="98" ry="54" fill="${C.meadowDk}" opacity=".5"/><ellipse cx="${x}" cy="${y}" rx="92" ry="48" fill="${C.waterDk}"/><ellipse cx="${x}" cy="${y - 3}" rx="86" ry="43" fill="#5FB8C9"/>
    <path d="M${x - 50} ${y - 20} q12 -5 24 0 M${x + 18} ${y + 18} q12 -5 24 0" stroke="${C.waterLt}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
  [[x - 40, y + 8, 12], [x + 34, y - 18, 10], [x + 52, y + 14, 13], [x - 6, y - 24, 9]].forEach(([lx, ly, r], i) => s.add(ly, `<ellipse cx="${lx}" cy="${ly}" rx="${r}" ry="${r * .45}" fill="#4C9A4A"/><path d="M${lx} ${ly} l${r} -2" stroke="#5FB8C9" stroke-width="2.4"/>${i === 2 ? `<circle cx="${lx - 3}" cy="${ly - 3}" r="4" fill="#F3A6BE"/><circle cx="${lx - 3}" cy="${ly - 3}" r="1.6" fill="${C.gold}"/>` : ''}`));
  // duck
  s.add(y + 2, `<g transform="translate(${x - 4} ${y + 2})"><ellipse cx="0" cy="0" rx="13" ry="7" fill="#FFFDF6"/><path d="M8 -2 q8 -2 10 -9 q-5 3 -10 2" fill="#FFFDF6"/><circle cx="-8" cy="-8" r="6" fill="#3F8B5C"/><path d="M-14 -8 l-6 1.5 l6 1.5z" fill="#F2A33C"/><circle cx="-8" cy="-9.5" r="1" fill="#1D1D1D"/><path d="M-12 -3 h8" stroke="#FFFDF6" stroke-width="2"/></g>`);
  // jetty with the name
  s.add(y + 40, `${shadow(x + 76, y + 46, 30, 4)}<rect x="${x + 50}" y="${y + 10}" width="52" height="30" rx="3" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="1.5"/>${[0, 1, 2, 3].map(i => `<path d="M${x + 50 + i * 13} ${y + 10} v30" stroke="${C.woodDk}" stroke-width="1"/>`).join('')}<rect x="${x + 52}" y="${y + 40}" width="4" height="8" fill="${C.woodDk}"/><rect x="${x + 96}" y="${y + 40}" width="4" height="8" fill="${C.woodDk}"/>`);
  ['#9ED07A'].forEach(() => [[x - 92, y - 20], [x - 84, y - 30], [x + 88, y - 34]].forEach(([rx, ry]) => s.add(ry, `<path d="M${rx} ${ry} q-2 -16 1 -24" stroke="${C.leafDk}" stroke-width="2.2" fill="none" stroke-linecap="round"/><rect x="${rx - 2}" y="${ry - 30}" width="4" height="10" rx="2" fill="${C.trunk}"/>`)));
}
function cove(s, x, y) {
  const L = -s.bleed, R = s.w + s.bleed, B = s.h + s.bleed; // the beach and sea run past the edges of a bigger picture
  s.g(`<path d="M${L} ${y - 20} Q${x - 160} ${y - 70} ${x - 40} ${y - 60} Q${x + 120} ${y - 70} ${R} ${y - 30} V${B} H${L}Z" fill="${C.sandDk}"/>
    <path d="M${L} ${y - 12} Q${x - 160} ${y - 62} ${x - 40} ${y - 52} Q${x + 120} ${y - 62} ${R} ${y - 22} V${B} H${L}Z" fill="${C.sand}"/>
    <path d="M${L} ${y + 60} Q${x - 120} ${y + 20} ${x} ${y + 36} Q${x + 140} ${y + 24} ${R} ${y + 64} V${B} H${L}Z" fill="#4E9FC9"/>
    <path d="M${L} ${y + 56} Q${x - 120} ${y + 16} ${x} ${y + 32} Q${x + 140} ${y + 20} ${R} ${y + 60}" stroke="#FFFFFF" stroke-width="5" fill="none" opacity=".75" stroke-linecap="round"/>
    <path d="M${x - 100} ${y + 80} q14 -5 28 0 M${x + 60} ${y + 92} q14 -5 28 0" stroke="#BFE3F5" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${[[x - 120, y - 20], [x - 60, y - 34], [x + 40, y - 30], [x + 130, y - 10], [x - 10, y]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2.4" fill="#fff" opacity=".6"/>`).join('')}`);
  // the raft with Captain Croak
  s.add(y + 60, `<g transform="translate(${x - 70} ${y - 22}) scale(.42)">${croak()}</g>`);
  // treasure chest and a flag with the name
  s.add(y - 4, `${shadow(x + 66, y - 4, 22, 4)}<rect x="${x + 48}" y="${y - 26}" width="36" height="22" rx="4" fill="${C.woodDk}"/><path d="M${x + 48} ${y - 18} Q${x + 66} ${y - 36} ${x + 84} ${y - 18} Z" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="2"/><rect x="${x + 48}" y="${y - 19}" width="36" height="4" fill="${C.gold}"/><rect x="${x + 63}" y="${y - 20}" width="6" height="9" rx="1.5" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="1"/>`);
  s.add(y - 30, `${shadow(x + 110, y - 30, 8, 2)}<rect x="${x + 108}" y="${y - 110}" width="4" height="80" rx="2" fill="${C.woodDk}"/><path d="M${x + 112} ${y - 108} L${x + 186} ${y - 98} L${x + 112} ${y - 82} Z" fill="${C.berry}" stroke="#A93E4F" stroke-width="1.5" stroke-linejoin="round"/><path d="M${x + 124} ${y - 99} l20 2" stroke="#fff" stroke-width="2" opacity=".7"/>`);
  s.over(`<g></g>`);
  rock(s, x - 140, y - 16, 1.2); rock(s, x + 150, y + 4, .9);
}

/* ---------------- Harbour Market and the Clock Tower (23 November 2026) ----------------
   Two new places between Sharing Pond and Captain's Cove: striped market stalls on a stone quay beside the harbour,
   then a stone clock tower on a little hill. The tower's clock shows the real time when the map opens. */
function stall(s, x, y, col, goods, price) { // x,y = middle of the counter's foot
  let g = `${shadow(x, y, 40, 5)}<rect x="${x - 31}" y="${y - 76}" width="4" height="76" rx="1.5" fill="${C.woodDk}"/><rect x="${x + 27}" y="${y - 76}" width="4" height="76" rx="1.5" fill="${C.woodDk}"/>
    <rect x="${x - 33}" y="${y - 30}" width="66" height="30" rx="3" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="1.6"/><path d="M${x - 33} ${y - 20} h66 M${x - 33} ${y - 10} h66" stroke="${C.woodDk}" stroke-width="1" opacity=".6"/>`;
  g += goods.map(([dx, r, f]) => `<circle cx="${x + dx}" cy="${y - 30 - r * .7}" r="${r}" fill="${f}" stroke="#000" stroke-opacity=".15" stroke-width="1"/>`).join('');
  // the striped awning with a scalloped edge
  for (let i = 0; i < 8; i++) {
    const sx = x - 38 + i * 9.5, f = i % 2 ? C.paper : col;
    g += `<path d="M${sx} ${y - 96} h9.5 v16 a4.75 4.75 0 0 1 -9.5 0 Z" fill="${f}"/>`;
  }
  g += `<path d="M${x - 38} ${y - 96} h76" stroke="${C.woodInk}" stroke-width="2" stroke-linecap="round" opacity=".55"/>`;
  // a little chalkboard with a price
  g += `<rect x="${x + 6}" y="${y - 18}" width="24" height="15" rx="2" fill="#3E5A48" stroke="${C.woodDk}" stroke-width="1.4"/><text x="${x + 18}" y="${y - 6.5}" text-anchor="middle" font-family="Andika" font-size="10" fill="#fff">${price}</text>`;
  s.add(y, g);
}
function market(s, x, y, water = true) { // x,y = middle of the quay's front edge; water: draw its own bit of harbour (the Maths map draws a bigger one)
  const wx = x - 112;
  // the harbour water on the left, behind a stone wall, and the paved quay
  s.g(`${water ? `<path d="M-10 ${y - 160} H${wx - 20} Q${wx} ${y - 160} ${wx} ${y - 140} V${y + 50} Q${wx} ${y + 80} ${wx - 30} ${y + 80} H-10 Z" fill="${C.waterDk}"/>
    <path d="M-10 ${y - 154} H${wx - 24} Q${wx - 6} ${y - 154} ${wx - 6} ${y - 136} V${y + 46} Q${wx - 6} ${y + 74} ${wx - 32} ${y + 74} H-10 Z" fill="${C.water}"/>
    <path d="M${wx - 70} ${y - 90} q12 -5 24 0 M${wx - 50} ${y + 10} q12 -5 24 0 M${wx - 90} ${y + 50} q10 -4 20 0" stroke="${C.waterLt}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` : ''}
    <path d="M${wx} ${y - 114} H${x + 140} Q${x + 158} ${y - 114} ${x + 158} ${y - 96} V${y + 6} Q${x + 158} ${y + 24} ${x + 140} ${y + 24} H${wx} Z" fill="${C.stoneDk}"/>
    <path d="M${wx} ${y - 118} H${x + 138} Q${x + 154} ${y - 118} ${x + 154} ${y - 102} V${y + 2} Q${x + 154} ${y + 18} ${x + 138} ${y + 18} H${wx} Z" fill="${C.stone}"/>
    ${[-90, -60, -30, 0].map(d => `<path d="M${wx + 4} ${y + d} H${x + 150}" stroke="${C.stoneLt}" stroke-width="2" opacity=".8"/>`).join('')}
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${wx - 8}" y="${y - 118 + i * 17.5}" width="10" height="16" rx="2" fill="${i % 2 ? C.stoneLt : C.stone}" stroke="${C.stoneDk}" stroke-width="1.2"/>`).join('')}`);
  // a little boat in the harbour
  const bx = wx - 56, by = y - 40;
  s.add(by + 12, `<path d="M${bx - 26} ${by} H${bx + 26} L${bx + 18} ${by + 12} H${bx - 18} Z" fill="${C.berry}" stroke="#A93E4F" stroke-width="1.6" stroke-linejoin="round"/><path d="M${bx - 24} ${by + 3} H${bx + 24}" stroke="#fff" stroke-width="2"/>
    <rect x="${bx - 1.5}" y="${by - 38}" width="3" height="38" fill="${C.woodDk}"/><path d="M${bx + 2} ${by - 36} L${bx + 22} ${by - 6} H${bx + 2} Z" fill="${C.paper}" stroke="${C.stoneDk}" stroke-width="1.2"/>`);
  // bollards with a rope to the boat
  [[wx + 12, y - 70], [wx + 12, y - 4]].forEach(([px, py]) => s.add(py, `${shadow(px, py, 7, 2)}<rect x="${px - 5}" y="${py - 12}" width="10" height="12" rx="3" fill="#4A4F55"/><ellipse cx="${px}" cy="${py - 12}" rx="6.5" ry="2.6" fill="#6A7078"/>`));
  s.g(`<path d="M${wx + 12} ${y - 78} Q${wx - 20} ${y - 40} ${bx + 20} ${by + 2}" stroke="${C.woodDk}" stroke-width="1.6" fill="none"/>`);
  // three stalls: fruit, buns and toys
  stall(s, x - 52, y - 42, '#2F7FA8', [[-20, 6, C.apple], [-8, 6, '#8DBA4A'], [4, 6, C.apple], [-14, 5.5, '#8DBA4A']], '5p');
  stall(s, x + 34, y - 64, C.berry, [[-18, 6, C.earthLt], [-5, 6, C.earthLt], [8, 6, C.earthLt]], '10p');
  stall(s, x + 108, y - 26, '#E6B33E', [[-18, 7, '#6CC0E0'], [-2, 5, C.berry], [10, 5, '#F7D24A']], '20p');
  // crates and a seagull on a bollard
  s.add(y + 6, `${shadow(x - 2, y + 6, 22, 4)}<rect x="${x - 20}" y="${y - 16}" width="36" height="22" rx="2" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="1.4"/><path d="M${x - 20} ${y - 16} l36 22 M${x + 16} ${y - 16} l-36 22" stroke="${C.woodDk}" stroke-width="1.2" opacity=".7"/>
    ${[-12, -2, 8].map(d => `<circle cx="${x + d}" cy="${y - 19}" r="4.5" fill="${C.apple}"/>`).join('')}`);
  s.add(y - 3, `<g transform="translate(${wx + 12} ${y - 18})"><ellipse cx="0" cy="-6" rx="7" ry="5" fill="#fff" stroke="${C.stoneDk}" stroke-width="1"/><circle cx="5" cy="-12" r="3.6" fill="#fff" stroke="${C.stoneDk}" stroke-width="1"/><path d="M8 -12 l4 1 l-4 1" fill="${C.gold}"/><path d="M-6 -7 q-4 -2 -6 1" stroke="#9AA1A8" stroke-width="2" fill="none"/></g>`);
}
function clockTower(s, x, y) { // x,y = middle of the tower's foot
  s.g(`<ellipse cx="${x}" cy="${y + 4}" rx="104" ry="36" fill="${C.meadowDk}" opacity=".45"/><ellipse cx="${x}" cy="${y}" rx="98" ry="32" fill="${C.meadowLt}"/>`);
  const now = new Date(), hh = now.getHours() % 12, mm = now.getMinutes(), cy = y - 122;
  const ha = (hh + mm / 60) * 30 * Math.PI / 180, ma = mm * 6 * Math.PI / 180;
  const hand = (a, l, w) => `<path d="M${x} ${cy} L${(x + Math.sin(a) * l).toFixed(1)} ${(cy - Math.cos(a) * l).toFixed(1)}" stroke="${C.ink}" stroke-width="${w}" stroke-linecap="round"/>`;
  s.add(y, `${shadow(x + 6, y, 48, 8, .2)}
    <rect x="${x - 32}" y="${y - 156}" width="64" height="156" fill="${C.stone}" stroke="${C.stoneDk}" stroke-width="2"/>
    <rect x="${x + 14}" y="${y - 156}" width="18" height="156" fill="${C.stoneDk}" opacity=".3"/>
    ${[1, 2, 3, 4, 5].map(i => `<path d="M${x - 32} ${y - i * 26} h64" stroke="${C.stoneDk}" stroke-width="1" opacity=".5"/>`).join('')}
    ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${x + (i % 2 ? -8 : 10)} ${y - i * 26} v-26" stroke="${C.stoneDk}" stroke-width="1" opacity=".4"/>`).join('')}
    <rect x="${x - 38}" y="${y - 162}" width="76" height="9" rx="2" fill="${C.stoneLt}" stroke="${C.stoneDk}" stroke-width="1.6"/>
    <path d="M${x - 40} ${y - 162} L${x} ${y - 218} L${x + 40} ${y - 162} Z" fill="#7A5A9E" stroke="#4E3A6E" stroke-width="2" stroke-linejoin="round"/>
    <path d="M${x} ${y - 218} L${x + 40} ${y - 162} H${x + 14} Z" fill="#4E3A6E" opacity=".35"/>
    <path d="M${x} ${y - 218} v-16" stroke="${C.woodInk}" stroke-width="2"/><path d="M${x - 10} ${y - 230} h20 l-4 -3 m4 3 l-4 3" stroke="${C.woodInk}" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="${x}" cy="${y - 236}" r="2.4" fill="${C.gold}"/>
    <circle cx="${x}" cy="${cy}" r="25" fill="${C.paper}" stroke="#7A5A9E" stroke-width="4.5"/>
    ${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6, r0 = i % 3 ? 18 : 15; return `<path d="M${(x + Math.sin(a) * r0).toFixed(1)} ${(cy - Math.cos(a) * r0).toFixed(1)} L${(x + Math.sin(a) * 21).toFixed(1)} ${(cy - Math.cos(a) * 21).toFixed(1)}" stroke="${C.ink}" stroke-width="${i % 3 ? 1.4 : 2.4}" stroke-linecap="round"/>`; }).join('')}
    ${hand(ha, 11, 3.6)}${hand(ma, 17, 2.4)}<circle cx="${x}" cy="${cy}" r="2.6" fill="${C.ink}"/>
    <path d="M${x - 9} ${y - 66} v-12 a9 9 0 0 1 18 0 v12 Z" fill="#FFE9A8" stroke="${C.stoneDk}" stroke-width="2"/>
    <path d="M${x - 15} ${y} V${y - 26} a15 15 0 0 1 30 0 V${y} Z" fill="${C.woodDk}" stroke="${C.woodInk}" stroke-width="2"/><path d="M${x} ${y} v-41" stroke="${C.woodInk}" stroke-width="1.4"/><circle cx="${x + 7}" cy="${y - 14}" r="1.8" fill="${C.gold}"/>`);
  // a bench, a lamp and flowers round the foot
  s.add(y + 14, `${shadow(x - 66, y + 14, 24, 4)}<rect x="${x - 88}" y="${y - 2}" width="44" height="6" rx="2" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="1.3"/><rect x="${x - 88}" y="${y - 12}" width="44" height="5" rx="2" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="1.3"/><path d="M${x - 84} ${y + 4} v10 M${x - 48} ${y + 4} v10" stroke="${C.woodDk}" stroke-width="3"/>`);
  s.add(y + 8, `${shadow(x + 62, y + 8, 7, 2)}<rect x="${x + 60}" y="${y - 50}" width="4" height="58" fill="#4A4F55"/><path d="M${x + 54} ${y - 50} h16 l-3 -14 h-10 Z" fill="#FFE9A8" stroke="#4A4F55" stroke-width="2" stroke-linejoin="round"/>`);
  flowers(s, x - 40, y + 22, 5, 111, 18); flowers(s, x + 40, y + 20, 5, 112, 18);
}

/* ---------------- the Maths route ---------------- */
/* 24 November 2026: the Maths world is wider and roomier, made for the pannable, zoomable map (js/map-camera.js).
   The eight places zig-zag down the middle of the drawing with more room between them, and the scenery carries on
   to every edge: border woods on both sides, the river coming in from the hills on the right, the harbour opening
   out to the sea down the left, and the sea along the bottom. So zoomed right out, the screen shows the meadow all
   the way round, not a strip of drawing with green beside it. MATHS_FIT is the part with the places in it: the map's
   "See whole map" fits that, and the scenery around it fills the rest of the screen. */
const MATHS_OFF = [60, 110]; // the drawing (1560 × 2410) sits this far in, in a picture of MATHS_W × ROUTE_H whose edges the grass, beach and sea run to
const MATHS_W = 1680, ROUTE_H = 2560;
const MATHS_FIT = [330 + 60, 270 + 110, 900, 1880]; // x, y, w, h (in the whole picture): every place, its sign and its tap area
const MATHS_AT = { park: [540, 430], burrow: [1080, 600], stones: [790, 840], orchard: [1090, 1080], pond: [530, 1250], market: [560, 1560], clock: [1080, 1800], cove: [790, 2060] };
const Y_STOPS = [[-100, -95], [0, 0], [200, 190], [420, 390], [632, 575], [860, 770], [1040, 935], [1215, 1054], [1240, 1491], [1400, 1600], [1500, 1700], [1600, 1800]];
function F(y) { // (the old, narrow trail's heights; kept for anything still written in them)
  for (let i = 1; i < Y_STOPS.length; i++) { const [a0, b0] = Y_STOPS[i - 1], [a1, b1] = Y_STOPS[i]; if (y <= a1 || i === Y_STOPS.length - 1) return b0 + (y - a0) * (b1 - b0) / (a1 - a0); }
}
function mathsRoute() {
  const s = new Scene(1560, 2410), P = MATHS_AT;
  s.bleed = 130; s.shift = MATHS_OFF;
  meadowFloor(s, 7, 0, 50);
  // the beach and the sea along the bottom, then the harbour: an inlet of the sea up the left side, to the market's quay
  cove(s, ...P.cove);
  s.g(`<path d="M-100 1356 Q180 1350 360 1384 Q446 1400 448 1470 V1640 Q446 1730 340 1778 Q230 1830 196 1960 Q176 2060 150 2200 V2500 H-100 Z" fill="${C.waterDk}"/>
    <path d="M-100 1364 Q178 1358 356 1392 Q440 1408 442 1472 V1640 Q438 1724 334 1770 Q222 1822 188 1960 Q168 2060 142 2200 V2500 H-100 Z" fill="${C.water}"/>
    <path d="M60 1450 q14 -5 28 0 M200 1520 q14 -5 28 0 M110 1640 q12 -5 24 0 M300 1700 q12 -5 24 0 M70 1820 q14 -5 28 0 M120 1990 q12 -5 24 0" stroke="${C.waterLt}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
  // the river: from the hills on the right, under the stepping stones, into the pond; the pond runs out into the harbour
  river(s, 'M1720 680 C1500 690 1440 700 1300 780 1150 800 S900 832 790 846 S560 900 470 990 S420 1130 500 1200', 34);
  river(s, 'M444 1268 C400 1300 340 1330 300 1384', 26);
  // the trail, from the Clubhouse at the top to the beach, passing each place in turn
  path(s, 'M780 -20 C780 120 640 180 610 300 S690 420 720 480 S920 560 930 640 S780 760 790 846 S960 960 960 1060 S760 1180 690 1260 S790 1420 790 1520 S920 1680 920 1780 S800 1920 800 2010', 30);
  park(s, ...P.park);
  burrow(s, ...P.burrow);
  riverStones(s, ...P.stones);
  orchard(s, ...P.orchard);
  pond(s, ...P.pond);
  market(s, ...P.market, false);
  clockTower(s, ...P.clock);
  // a little boat out in the harbour, and buoys
  s.add(1700, `<g transform="translate(184 1690)"><path d="M-26 0 H26 L18 12 H-18 Z" fill="#2F7FA8" stroke="#24617F" stroke-width="1.6" stroke-linejoin="round"/><rect x="-1.5" y="-38" width="3" height="38" fill="${C.woodDk}"/><path d="M2 -36 L22 -6 H2 Z" fill="${C.paper}" stroke="${C.stoneDk}" stroke-width="1.4"/></g>`);
  [[96, 1560], [330, 1880]].forEach(([bx, by]) => s.add(by, `<circle cx="${bx}" cy="${by}" r="7" fill="${C.berry}" stroke="#A93E4F" stroke-width="1.6"/><path d="M${bx - 7} ${by} h14" stroke="#fff" stroke-width="2.4"/>`));
  // woods all round the edge, and trees and bushes in among the places (never on a place, the trail or the water)
  const r = rng(99), kinds = ['round', 'pine', 'round', 'blossom', 'pine', 'round'];
  const trees = [
    // across the top, either side of the trail coming in
    [60, 60], [170, 120], [300, 70], [420, 150], [560, 90], [660, 190], [930, 110], [1040, 60], [1160, 150], [1290, 90], [1420, 160], [1520, 70], [250, 230], [1300, 260],
    [-40, -80], [130, -70], [380, -90], [560, -70], [860, -80], [1220, -70], [1460, -90], [1610, -60], [20, -20], [240, -10], [470, 10], [640, -30], [920, 0], [1100, -20], [1380, 0], [1560, 10], [-10, 180], [1570, 230], [-10, 640], [1570, 820], [1580, 1440], [1570, 1880],
    // the left side, down to the harbour
    [70, 300], [190, 380], [60, 520], [250, 600], [120, 700], [340, 760], [60, 880], [220, 960], [90, 1100], [300, 1120], [150, 1260],
    // the right side, down to the beach
    [1460, 300], [1330, 400], [1500, 520], [1280, 560], [1420, 640], [1500, 900], [1340, 980], [1460, 1110], [1280, 1230], [1500, 1300], [1360, 1420], [1480, 1560], [1300, 1640], [1440, 1760], [1340, 1880], [1500, 1960],
    // in among the places
    [880, 330], [1230, 420], [700, 640], [930, 1000], [380, 1460], [700, 1700], [1230, 1640], [900, 1240]];
  trees.forEach(([tx, ty], i) => tree(s, tx, ty, .85 + r() * .4, kinds[i % kinds.length], 500 + i * 7));
  [[420, 560], [860, 420], [1240, 760], [600, 1040], [1200, 1180], [880, 1380], [420, 1890], [1210, 1920], [990, 1960], [180, 840], [1380, 760], [1180, 300]].forEach(([bx, by], i) => bush(s, bx, by, .8 + r() * .3, undefined, i % 3 ? null : C.berry));
  [[960, 520], [380, 960], [1230, 1520], [660, 1880], [1390, 1180], [140, 1200]].forEach(([x, y], i) => rock(s, x, y, .7 + (i % 3) * .15));
  // a vegetable patch and a scarecrow on the right, by the burrow's hill
  s.g(`<g>${[0, 1, 2, 3].map(i => `<rect x="1310" y="${1040 + i * 16}" width="130" height="9" rx="4.5" fill="${C.earth}" opacity=".8"/>`).join('')}</g>`);
  s.add(1098, `${shadow(1470, 1098, 16, 3)}<rect x="1468" y="1040" width="4" height="58" fill="${C.woodDk}"/><rect x="1448" y="1056" width="44" height="4" fill="${C.woodDk}"/><circle cx="1470" cy="1032" r="10" fill="${C.sand}"/><path d="M1456 1026 h28 l-4 -10 h-20 z" fill="${C.berry}"/><path d="M1456 1060 h28 l-4 24 h-20 z" fill="#2F7FA8"/>`);
  scatter(s, 5, 280, [-50, -100, 1610, 1990], [
    [400, 290, 280, 220], [960, 520, 240, 160], [640, 780, 300, 120], [970, 980, 250, 220], [420, 1180, 230, 140], [-10, 1350, 470, 700], [440, 1420, 320, 200], [970, 1540, 230, 300], [1300, 1030, 150, 80]]);
  butterfly(s, 640, 360, '#F7D24A'); butterfly(s, 960, 760, '#F07CA8'); butterfly(s, 380, 1060, '#B58BE0'); butterfly(s, 1250, 1500, '#F7D24A');
  return s;
}


/* ---------------- the Meadow Words route (22 November 2026) ----------------
   Four places down one trail, in the same landscape style as the Maths route: Phonics Forest (trees wearing their
   sounds), Tricky Word Trail (signposts of tricky words, and a footbridge over the brook), Sentence Meadow (bunting
   that makes a sentence, from a capital to a full stop) and Bonnie's Story Nook (a hollow oak with a reading bench).
   The trail comes down from the Clubhouse's Words gate, so it starts in the forest the gate looks into. */
/* The Words world, like the Maths one: its drawing (640 × 1060, the places just where they were) sits WORDS_OFF in, in a
   bigger picture whose grass, brook, trail and woods run to every edge, so "See whole map" shows meadow all the way
   round. WORDS_FIT is the part with the places, signs and tap areas in it. */
const WORDS_OFF = [180, 240];
const WORDS_W = 640 + 2 * 180, WORDS_H = 1060 + 2 * 240;
const WORDS_FIT = [110 + 180, 20 + 240, 470, 1010];
const letterBadge = (x, y, t, ring = C.leafDk, ink = C.leafDeep, r = 11) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.paper}" stroke="${ring}" stroke-width="1.6"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-family="Andika" font-size="${t.length > 2 ? 9.5 : 12}" fill="${ink}">${t}</text>`;
function forest(s, x, y) { // x,y = middle of the glade
  s.g(`<path d="M${x - 118} ${y + 20} Q${x - 110} ${y - 72} ${x} ${y - 80} Q${x + 110} ${y - 74} ${x + 120} ${y + 18} Q${x + 104} ${y + 74} ${x} ${y + 76} Q${x - 106} ${y + 74} ${x - 118} ${y + 20}Z" fill="#7DB862" opacity=".45"/>`);
  [[x - 78, y - 30, 'pine', 'sh', 1.05], [x - 22, y - 54, 'round', 'ai', 1.1], [x + 40, y - 40, 'pine', 'oo', 1], [x + 88, y - 4, 'round', 'ee', .9], [x - 92, y + 30, 'round', 'ch', .85], [x + 20, y + 22, 'pine', 'a-e', .95]].forEach(([tx, ty, kind, t, k], i) => {
    tree(s, tx, ty, k, kind, 60 + i * 5);
    s.add(ty + 1, `<g>${letterBadge(tx, ty - (kind === 'pine' ? 34 : 46) * k, t)}</g>`);
  });
  // toadstools and a log
  [[x - 40, y + 50], [x - 30, y + 56], [x + 66, y + 44]].forEach(([mx, my], i) => s.add(my, `<rect x="${mx - 1.6}" y="${my - 8}" width="3.2" height="8" fill="#F6EEDC"/><path d="M${mx - 7} ${my - 7} Q${mx} ${my - 17} ${mx + 7} ${my - 7} Z" fill="${i % 2 ? '#E07A3F' : C.berry}"/><circle cx="${mx - 2}" cy="${my - 11}" r="1.3" fill="#fff"/><circle cx="${mx + 3}" cy="${my - 9}" r="1" fill="#fff"/>`));
  s.add(y + 62, `${shadow(x + 6, y + 62, 34, 4)}<rect x="${x - 26}" y="${y + 48}" width="62" height="15" rx="7.5" fill="${C.trunk}"/><ellipse cx="${x + 36}" cy="${y + 55.5}" rx="5" ry="7.5" fill="${C.woodLt}" stroke="${C.trunkDk}" stroke-width="1.4"/>`);
  flowers(s, x + 104, y + 52, 5, 71, 18);
}
function signpost(s, x, y, words, flip = false) {
  let g = `${shadow(x, y, 12, 3)}<rect x="${x - 3}" y="${y - 70}" width="6" height="70" rx="2" fill="${C.woodDk}"/>`;
  words.forEach((w, i) => {
    const by = y - 64 + i * 22, wd = w.length * 7.6 + 20, dir = (i % 2 ? -1 : 1) * (flip ? -1 : 1), x0 = dir > 0 ? x - 6 : x + 6 - wd;
    const pts = dir > 0 ? `${x0},${by} ${x0 + wd},${by} ${x0 + wd + 9},${by + 8} ${x0 + wd},${by + 16} ${x0},${by + 16}` : `${x0},${by} ${x0 + wd},${by} ${x0 + wd},${by + 16} ${x0},${by + 16} ${x0 - 9},${by + 8}`;
    g += `<polygon points="${pts}" fill="${C.woodLt}" stroke="${C.woodDk}" stroke-width="1.5" stroke-linejoin="round"/><text x="${x0 + wd / 2}" y="${by + 12}" text-anchor="middle" font-family="Andika" font-size="12" fill="${C.woodInk}">${w}</text>`;
  });
  s.add(y, g);
}
function trickyTrail(s, x, y) {
  signpost(s, x - 6, y - 36, ['said', 'the']);
  signpost(s, x + 66, y + 4, ['was', 'one'], true);
  signpost(s, x + 40, y + 96, ['they', 'could']);
  // the footbridge where the trail crosses the brook
  const bx = x - 92, by = y + 52;
  s.add(by + 12, `${shadow(bx, by + 16, 40, 5)}<path d="M${bx - 34} ${by + 10} Q${bx} ${by - 4} ${bx + 34} ${by + 10}" stroke="${C.woodDk}" stroke-width="16" fill="none"/>
    <path d="M${bx - 34} ${by + 8} Q${bx} ${by - 6} ${bx + 34} ${by + 8}" stroke="${C.wood}" stroke-width="12" fill="none"/>
    ${[-24, -12, 0, 12, 24].map(d => `<path d="M${bx + d} ${by + 1 + Math.abs(d) * .2} v8" stroke="${C.woodDk}" stroke-width="1.2"/>`).join('')}
    <path d="M${bx - 32} ${by - 6} Q${bx} ${by - 22} ${bx + 32} ${by - 6}" stroke="${C.woodDk}" stroke-width="3" fill="none"/>
    ${[-30, -10, 10, 30].map(d => `<path d="M${bx + d} ${by - 6 - (Math.abs(d) < 20 ? 10 : 4)} v12" stroke="${C.woodDk}" stroke-width="2.6"/>`).join('')}`);
  rock(s, x + 120, y + 70, .8); bush(s, x - 20, y + 116, .9, undefined, C.berry);
  flowers(s, x + 20, y - 4, 4, 81, 14);
}
function sentenceMeadow(s, x, y) {
  s.g(`<ellipse cx="${x}" cy="${y + 20}" rx="128" ry="70" fill="${C.meadowLt}" opacity=".7"/>`);
  // bunting between two posts, one word on each flag: a capital to start and a full stop to end
  const x0 = x - 96, x1 = x + 96, top = y - 64, sag = q => top + 26 * Math.sin(Math.PI * q);
  let g = `${shadow(x0, y, 8, 2)}${shadow(x1, y, 8, 2)}<rect x="${x0 - 3}" y="${top - 6}" width="6" height="${y - top + 6}" rx="2" fill="${C.woodDk}"/><rect x="${x1 - 3}" y="${top - 6}" width="6" height="${y - top + 6}" rx="2" fill="${C.woodDk}"/>
    <path d="M${x0} ${top} Q${x} ${top + 52} ${x1} ${top}" stroke="${C.woodInk}" stroke-width="1.6" fill="none"/>`;
  const flags = [['The', '#E07A3F'], ['dog', '#F2C14E'], ['can', '#7DB862'], ['run', '#6CC0E0'], ['.', '#D9596B']];
  flags.forEach(([w, col], i) => {
    const q = (i + .5) / flags.length, fx = x0 + (x1 - x0) * q, fy = sag(q);
    g += `<path d="M${fx - 17} ${fy} L${fx + 17} ${fy} L${fx} ${fy + 34} Z" fill="${col}" stroke="${C.paper}" stroke-width="1.4" stroke-linejoin="round"/><text x="${fx}" y="${fy + 14}" text-anchor="middle" font-family="Andika" font-weight="700" font-size="${w === '.' ? 20 : 11.5}" fill="${C.ink}">${w}</text>`;
  });
  s.add(y, g);
  // sunflowers and a beehive
  [[x - 112, y + 54], [x - 96, y + 64], [x + 108, y + 48]].forEach(([fx, fy]) => s.add(fy, `<path d="M${fx} ${fy} v-34" stroke="${C.leafDk}" stroke-width="2.6"/><path d="M${fx} ${fy - 14} q8 -6 12 0" stroke="${C.leafDk}" stroke-width="2" fill="${C.leaf}"/>${Array.from({ length: 10 }, (_, i) => `<ellipse cx="${fx + Math.cos(i * .628) * 7}" cy="${fy - 38 + Math.sin(i * .628) * 7}" rx="4.6" ry="2.4" transform="rotate(${i * 36} ${fx + Math.cos(i * .628) * 7} ${fy - 38 + Math.sin(i * .628) * 7})" fill="${C.gold}"/>`).join('')}<circle cx="${fx}" cy="${fy - 38}" r="5" fill="${C.trunk}"/>`));
  s.add(y + 46, `${shadow(x + 64, y + 46, 18, 4)}<rect x="${x + 52}" y="${y + 40}" width="24" height="6" fill="${C.woodDk}"/>${[0, 1, 2, 3].map(i => `<ellipse cx="${x + 64}" cy="${y + 34 - i * 8}" rx="${16 - i * 3}" ry="5.5" fill="${i % 2 ? '#F2C14E' : '#E6B33E'}" stroke="${C.goldDk}" stroke-width="1"/>`).join('')}<path d="M${x + 59} ${y + 38} a5 5 0 0 1 10 0" fill="${C.earthDk}"/>`);
  flowers(s, x - 30, y + 70, 7, 91, 26); flowers(s, x + 30, y + 64, 5, 92, 20);
}
function storyNook(s, x, y) {
  // the hollow oak: a wide trunk with a round door and a lit window, under a big canopy
  s.add(y, `${shadow(x, y + 2, 76, 12, .2)}
    <path d="M${x - 56} ${y} Q${x - 46} ${y - 40} ${x - 40} ${y - 96} L${x + 40} ${y - 96} Q${x + 46} ${y - 40} ${x + 58} ${y} Z" fill="${C.trunk}"/>
    <path d="M${x - 66} ${y} q10 -8 16 -2 M${x + 50} ${y - 2} q12 -6 18 2" stroke="${C.trunk}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M${x - 22} ${y - 36} q6 -22 0 -50 M${x + 26} ${y - 30} q-4 -30 2 -56" stroke="${C.trunkDk}" stroke-width="2" fill="none" opacity=".45"/>
    <path d="M${x - 18} ${y} V${y - 34} a18 18 0 0 1 36 0 V${y} Z" fill="#7E5FA8" stroke="${C.trunkDk}" stroke-width="2.4"/><circle cx="${x + 10}" cy="${y - 16}" r="2.2" fill="${C.gold}"/>
    <circle cx="${x + 30}" cy="${y - 66}" r="11" fill="#FFE9A8" stroke="${C.trunkDk}" stroke-width="2.4"/><path d="M${x + 30} ${y - 77} v22 M${x + 19} ${y - 66} h22" stroke="${C.trunkDk}" stroke-width="1.6"/>
    <circle cx="${x}" cy="${y - 150}" r="64" fill="${C.leafDk}"/><circle cx="${x - 52}" cy="${y - 118}" r="40" fill="${C.leafDk}"/><circle cx="${x + 54}" cy="${y - 116}" r="42" fill="${C.leafDk}"/>
    <circle cx="${x - 6}" cy="${y - 158}" r="54" fill="${C.leaf}"/><circle cx="${x - 48}" cy="${y - 126}" r="32" fill="${C.leaf}"/><circle cx="${x + 48}" cy="${y - 124}" r="34" fill="${C.leaf}"/>
    <circle cx="${x - 22}" cy="${y - 180}" r="22" fill="${C.leafLt}" opacity=".9"/><circle cx="${x + 30}" cy="${y - 150}" r="12" fill="${C.leafLt}" opacity=".7"/>`);
  // a reading rug, a bench, a stack of books and a lantern
  s.g(`<ellipse cx="${x - 6}" cy="${y + 16}" rx="52" ry="12" fill="#B9A3DA" opacity=".85"/><ellipse cx="${x - 6}" cy="${y + 16}" rx="40" ry="8" fill="none" stroke="#FFFBF1" stroke-width="2" stroke-dasharray="5 5" opacity=".7"/>`);
  s.add(y + 30, `${shadow(x - 84, y + 30, 26, 4)}<rect x="${x - 108}" y="${y + 10}" width="48" height="7" rx="2" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="1.3"/><rect x="${x - 108}" y="${y}" width="48" height="6" rx="2" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="1.3"/><rect x="${x - 104}" y="${y + 17}" width="4" height="13" fill="${C.woodDk}"/><rect x="${x - 68}" y="${y + 17}" width="4" height="13" fill="${C.woodDk}"/>`);
  s.add(y + 28, `${shadow(x + 76, y + 28, 22, 4)}${[['#8E7CC3', 0, 34], ['#E07A3F', 7, 30], ['#6CC0E0', 14, 32], ['#F2C14E', 21, 26]].map(([c, d, w]) => `<rect x="${x + 76 - w / 2 + (d % 2) * 3}" y="${y + 20 - d}" width="${w}" height="7" rx="1.5" fill="${c}" stroke="${C.ink}" stroke-opacity=".25" stroke-width="1"/>`).join('')}<path d="M${x + 66} ${y - 14} q10 -8 20 0 v-2 q-10 -8 -20 0 Z" fill="#FFFBF1" stroke="${C.soft}" stroke-width="1"/>`);
  s.add(y + 6, `${shadow(x + 120, y + 6, 8, 2)}<rect x="${x + 118}" y="${y - 48}" width="4" height="54" fill="${C.woodInk}"/><path d="M${x + 120} ${y - 48} h-14" stroke="${C.woodInk}" stroke-width="3"/><rect x="${x + 100}" y="${y - 46}" width="12" height="15" rx="3" fill="#FFE9A8" stroke="${C.woodInk}" stroke-width="1.6"/><circle cx="${x + 106}" cy="${y - 38}" r="12" fill="${C.gold}" opacity=".22"/>`);
  flowers(s, x - 70, y + 50, 5, 101, 20);
}
function wordsRoute() {
  const s = new Scene(640, 1060);
  s.bleed = 240; s.shift = WORDS_OFF;
  meadowFloor(s, 17);
  // the brook: comes in from the right, runs under the footbridge on the Tricky Word Trail and leaves to the left
  river(s, 'M860 330 C760 350 700 370 600 400 C540 430 500 474 420 486 S300 500 230 510 S90 560 -20 600 S-150 650 -230 640', 26);
  path(s, 'M300 -260 C310 -150 330 -80 320 -20 C320 50 300 90 320 140 S420 220 400 260 S320 330 310 400 S330 480 340 540 S420 640 400 700 S310 780 300 860 S340 980 330 1080 S300 1220 320 1320', 30);
  forest(s, 262, 150);
  trickyTrail(s, 408, 432);
  sentenceMeadow(s, 252, 690);
  storyNook(s, 428, 900);
  const r = rng(77);
  [[40, 80, 'pine'], [600, 60, 'round'], [580, 170, 'pine'], [30, 300, 'round'], [610, 330, 'blossom'], [40, 470, 'pine'], [600, 600, 'round'], [30, 820, 'blossom'], [600, 790, 'pine'], [60, 1000, 'round'], [610, 1020, 'round'], [180, 940, 'pine']].forEach(([tx, ty, kind], i) => tree(s, tx, ty, .9 + r() * .35, kind, 200 + i * 7));
  // the woods round the outside, out to the picture's edges
  const kinds = ['pine', 'round', 'pine', 'blossom'];
  [[-150, -170], [-30, -120], [110, -190], [200, -90], [420, -170], [520, -100], [650, -180], [770, -120],
    [-140, 40], [-60, 160], [-150, 300], [-80, 430], [-150, 720], [-70, 860], [-150, 1000], [-60, 1120],
    [720, 30], [780, 170], [700, 280], [770, 520], [700, 660], [780, 800], [710, 940], [780, 1080],
    [-140, 1260], [-10, 1230], [120, 1290], [210, 1180], [450, 1250], [560, 1180], [670, 1270], [790, 1230]]
    .forEach(([tx, ty], i) => tree(s, tx, ty, .9 + r() * .4, kinds[i % 4], 400 + i * 5));
  [[-90, 560, .9], [730, 400, .9], [80, 1180, .8], [740, -40, .8]].forEach(([bx, by, k], i) => bush(s, bx, by, k, undefined, i % 2 ? C.berry : null));
  [[150, 330, 1], [520, 300, .9], [470, 590, .9], [120, 560, .8], [250, 1010, .9]].forEach(([bx, by, k], i) => bush(s, bx, by, k, undefined, i % 2 ? null : C.berry));
  rock(s, 560, 250, .8); rock(s, 110, 900, .7);
  scatter(s, 9, 130, [-170, -230, 810, 1290], [[130, 60, 270, 200], [300, 340, 230, 200], [120, 600, 270, 160], [340, 700, 240, 260]]);
  butterfly(s, 330, 200, '#F7D24A'); butterfly(s, 160, 620, '#F07CA8'); butterfly(s, 540, 760, '#B58BE0');
  return s;
}

/* The Bone Shop themes, on the meadow: a wash of colour over the scenery (not over signs, Bonnie or the buttons).
   Night and space darken it, Christmas and snow frost it, sunset and volcano warm it, sea cools it. */
const TINTS = { night: ['#141A3A', .42], space: ['#0B0F2A', .48], christmas: ['#E9F3FF', .22], snow: ['#FFFFFF', .3], sunset: ['#FF9A5A', .14],
  volcano: ['#3A1408', .34], sea: ['#3FA7C9', .14] };
const tint = (theme, w, h) => { const t = TINTS[theme]; return t ? `<rect class="tint" width="${w}" height="${h}" fill="${t[0]}" opacity="${t[1]}" pointer-events="none"/>` : ''; };

window.ProtoArt = { C, mathsRoute, F, ROUTE_H, MATHS_W, MATHS_FIT, MATHS_OFF, wordsRoute, WORDS_W, WORDS_H, WORDS_FIT, WORDS_OFF, tint, TINTS, bonnie, bubble, star, bone, paw, shadow,
  // the drawing kit, shared with the Clubhouse meadow (js/proto-hub-art.js)
  Scene, rng, tree, bush, tuft, flowers, rock, fence, path, cloud, butterfly, meadowFloor, scatter, river, signpost, letterBadge,
  // each place on its own, for the top of its level map (js/proto-level.js)
  places: { park, burrow, riverStones, orchard, pond, market, clockTower, cove, forest, trickyTrail, sentenceMeadow, storyNook } };
})();
