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
  constructor(w, h) { this.w = w; this.h = h; this.ground = []; this.items = []; this.top = []; this.defs = []; }
  g(svg) { this.ground.push(svg); return this; }
  add(y, svg) { this.items.push({ y, svg }); return this; }
  over(svg) { this.top.push(svg); return this; }
  render() {
    return `<defs>${this.defs.join('')}</defs>${this.ground.join('')}${this.items.sort((a, b) => a.y - b.y).map(i => i.svg).join('')}${this.top.join('')}`;
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
function bone(x, y, k = 1, fill = '#FFF6E2', stroke = '#C9A777') {
  return `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-14 -3 h28 a6 6 0 1 1 4 -6 a6 6 0 1 1 0 12 a6 6 0 1 1 -4 6 h-28 a6 6 0 1 1 -4 -6 a6 6 0 1 1 0 -12 a6 6 0 1 1 4 6 z" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/></g>`;
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
  s.g(`<path d="M0 ${y - 20} Q${x - 160} ${y - 70} ${x - 40} ${y - 60} Q${x + 120} ${y - 70} ${s.w} ${y - 30} V${s.h} H0Z" fill="${C.sandDk}"/>
    <path d="M0 ${y - 12} Q${x - 160} ${y - 62} ${x - 40} ${y - 52} Q${x + 120} ${y - 62} ${s.w} ${y - 22} V${s.h} H0Z" fill="${C.sand}"/>
    <path d="M0 ${y + 60} Q${x - 120} ${y + 20} ${x} ${y + 36} Q${x + 140} ${y + 24} ${s.w} ${y + 64} V${s.h} H0Z" fill="#4E9FC9"/>
    <path d="M0 ${y + 56} Q${x - 120} ${y + 16} ${x} ${y + 32} Q${x + 140} ${y + 20} ${s.w} ${y + 60}" stroke="#FFFFFF" stroke-width="5" fill="none" opacity=".75" stroke-linecap="round"/>
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

/* ---------------- the Maths route ---------------- */
/* Refinement (22 November 2026): the trail is shorter. F() moves every height in the original drawing (1500 tall) to the
   shorter one (1280 tall), section by section, so each place keeps its shape and the river and path still join them up. */
const ROUTE_H = 1280;
const Y_STOPS = [[-100, -95], [0, 0], [200, 190], [420, 390], [632, 575], [860, 770], [1040, 935], [1400, 1180], [1500, 1280], [1600, 1380]];
function F(y) {
  for (let i = 1; i < Y_STOPS.length; i++) { const [a0, b0] = Y_STOPS[i - 1], [a1, b1] = Y_STOPS[i]; if (y <= a1 || i === Y_STOPS.length - 1) return b0 + (y - a0) * (b1 - b0) / (a1 - a0); }
}
const mapD = d => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => `${x} ${Math.round(F(+y))}`);
function mathsRoute() {
  const s = new Scene(640, ROUTE_H);
  meadowFloor(s, 7);
  // the waterway: comes in top right, crosses the trail, fills the pond, runs to the cove
  river(s, mapD('M700 470 C600 520 560 560 470 590 S300 640 220 650 S80 700 96 800 S190 920 200 980'), 34);
  river(s, mapD('M200 1090 C190 1180 230 1240 300 1290 S330 1330 330 1360'), 28);
  path(s, mapD('M320 -20 C320 40 300 70 280 110 S330 250 380 300 S470 380 420 450 S300 540 330 640 S470 720 470 800 S440 900 400 980 S330 1080 350 1140 S420 1190 360 1260'), 30);
  park(s, 220, F(200));
  burrow(s, 440, F(420));
  riverStones(s, 330, F(632));
  orchard(s, 440, F(860));
  pond(s, 210, F(1040));
  cove(s, 330, F(1400));
  // border woods and hedges (frame the phone view, fill the iPad edges)
  const r = rng(99);
  [[40, 120], [90, 70], [600, 90], [560, 180], [610, 300], [30, 330], [70, 420], [600, 640], [560, 720], [20, 560], [610, 980], [580, 1100], [40, 1220], [610, 1200], [26, 860]].forEach(([tx, ty], i) => tree(s, tx, F(ty), .9 + r() * .4, i % 3 === 0 ? 'pine' : (i % 5 === 1 ? 'blossom' : 'round'), i * 7));
  [[150, 330, 1], [520, 260, .9], [270, 470, .9], [560, 520, 1], [250, 760, .8], [130, 900, .9], [520, 1010, 1], [250, 1180, .9], [470, 1170, .8]].forEach(([bx, by, k], i) => bush(s, bx, F(by), k, undefined, i % 3 ? null : C.berry));
  rock(s, 540, F(600), .8); rock(s, 200, F(560), .7); rock(s, 300, F(960), .7);
  scatter(s, 5, 100, [0, 0, 640, F(1320)], [[300, F(600), 80, 60]]);
  butterfly(s, 260, F(340), '#F7D24A'); butterfly(s, 500, F(760), '#F07CA8'); butterfly(s, 120, F(980), '#B58BE0');
  return s;
}


/* ---------------- the Meadow Words route (22 November 2026) ----------------
   Four places down one trail, in the same landscape style as the Maths route: Phonics Forest (trees wearing their
   sounds), Tricky Word Trail (signposts of tricky words, and a footbridge over the brook), Sentence Meadow (bunting
   that makes a sentence, from a capital to a full stop) and Bonnie's Story Nook (a hollow oak with a reading bench).
   The trail comes down from the Clubhouse's Words gate, so it starts in the forest the gate looks into. */
const WORDS_H = 1060;
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
  const s = new Scene(640, WORDS_H);
  meadowFloor(s, 17);
  // the brook: comes in from the right, runs under the footbridge on the Tricky Word Trail and leaves to the left
  river(s, 'M700 380 C600 400 520 470 420 486 S300 500 230 510 S90 560 -20 600', 26);
  path(s, 'M320 -20 C320 50 300 90 320 140 S420 220 400 260 S320 330 310 400 S330 480 340 540 S420 640 400 700 S310 780 300 860 S340 980 330 1080', 30);
  forest(s, 262, 150);
  trickyTrail(s, 408, 432);
  sentenceMeadow(s, 252, 690);
  storyNook(s, 428, 900);
  const r = rng(77);
  [[40, 80, 'pine'], [600, 60, 'round'], [580, 170, 'pine'], [30, 300, 'round'], [610, 330, 'blossom'], [40, 470, 'pine'], [600, 600, 'round'], [30, 820, 'blossom'], [600, 790, 'pine'], [60, 1000, 'round'], [610, 1020, 'round'], [180, 940, 'pine']].forEach(([tx, ty, kind], i) => tree(s, tx, ty, .9 + r() * .35, kind, 200 + i * 7));
  [[150, 330, 1], [520, 300, .9], [470, 590, .9], [120, 560, .8], [250, 1010, .9]].forEach(([bx, by, k], i) => bush(s, bx, by, k, undefined, i % 2 ? null : C.berry));
  rock(s, 560, 250, .8); rock(s, 110, 900, .7);
  scatter(s, 9, 80, [0, 0, 640, WORDS_H], [[130, 60, 270, 200], [300, 340, 230, 200], [120, 600, 270, 160], [340, 700, 240, 260]]);
  butterfly(s, 330, 200, '#F7D24A'); butterfly(s, 160, 620, '#F07CA8'); butterfly(s, 540, 760, '#B58BE0');
  return s;
}

/* The Bone Shop themes, on the meadow: a wash of colour over the scenery (not over signs, Bonnie or the buttons).
   Night and space darken it, Christmas and snow frost it, sunset and volcano warm it, sea cools it. */
const TINTS = { night: ['#141A3A', .42], space: ['#0B0F2A', .48], christmas: ['#E9F3FF', .22], snow: ['#FFFFFF', .3], sunset: ['#FF9A5A', .14],
  volcano: ['#3A1408', .34], sea: ['#3FA7C9', .14] };
const tint = (theme, w, h) => { const t = TINTS[theme]; return t ? `<rect class="tint" width="${w}" height="${h}" fill="${t[0]}" opacity="${t[1]}" pointer-events="none"/>` : ''; };

window.ProtoArt = { C, mathsRoute, F, ROUTE_H, wordsRoute, WORDS_H, tint, TINTS, bonnie, bubble, star, bone, paw, shadow,
  // the drawing kit, shared with the Clubhouse meadow (js/proto-hub-art.js)
  Scene, rng, tree, bush, tuft, flowers, rock, fence, path, cloud, butterfly, meadowFloor, scatter };
})();
