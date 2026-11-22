// Meadow Clubhouse, design iteration 2: an illustrated landscape kit.
// Flat shapes with depth from overlapping layers: a darker same-hue base, the main colour, a light top.
// Outlines only as darker shades of the fill, never black. Everything sorts by its foot (y) so things overlap naturally.
import fs from 'node:fs';
const D = new URL('./', import.meta.url).pathname;
export const bonnieRaw = fs.readFileSync(D + 'bonnie.svg', 'utf8').replace(/<svg[^>]*>/, '').replace('</svg>', '');
export const croakRaw = fs.readFileSync(D + 'croak.svg', 'utf8').replace(/<svg[^>]*>/, '').replace('</svg>', '');

export const C = {
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
export function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

export class Scene {
  constructor(w, h) { this.w = w; this.h = h; this.ground = []; this.items = []; this.top = []; this.defs = []; }
  g(svg) { this.ground.push(svg); return this; }
  add(y, svg) { this.items.push({ y, svg }); return this; }
  over(svg) { this.top.push(svg); return this; }
  render() {
    return `<defs>${this.defs.join('')}</defs>${this.ground.join('')}${this.items.sort((a, b) => a.y - b.y).map(i => i.svg).join('')}${this.top.join('')}`;
  }
}

export const shadow = (x, y, rx, ry = rx * .3, op = .16) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#3B4A1E" opacity="${op}"/>`;

export function tree(s, x, y, k = 1, kind = 'round', seed = 1) {
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
export function bush(s, x, y, k = 1, col = [C.leafDk, C.leaf, C.leafLt], berries) {
  const R = 14 * k;
  let svg = shadow(x + 3, y + 1, R * 1.4, R * .35);
  svg += `<circle cx="${x - R * .8}" cy="${y - R * .5}" r="${R * .8}" fill="${col[0]}"/><circle cx="${x + R * .8}" cy="${y - R * .5}" r="${R * .8}" fill="${col[0]}"/><circle cx="${x}" cy="${y - R * .85}" r="${R}" fill="${col[0]}"/>
    <circle cx="${x - R * .7}" cy="${y - R * .65}" r="${R * .62}" fill="${col[1]}"/><circle cx="${x + R * .7}" cy="${y - R * .62}" r="${R * .6}" fill="${col[1]}"/><circle cx="${x}" cy="${y - R}" r="${R * .78}" fill="${col[1]}"/>
    <circle cx="${x - R * .25}" cy="${y - R * 1.3}" r="${R * .3}" fill="${col[2]}"/>`;
  if (berries) svg += [[-.6, -.6], [.4, -.9], [.8, -.4], [-.1, -.5]].map(([a, b]) => `<circle cx="${x + a * R}" cy="${y + b * R}" r="${2 * k}" fill="${berries}"/>`).join('');
  s.add(y, svg);
}
export function tuft(s, x, y, k = 1, col = C.meadowDk) {
  s.add(y - 1, `<path d="M${x - 6 * k} ${y} q2 -9 -1 -14 M${x} ${y} q0 -12 2 -17 M${x + 6 * k} ${y} q-1 -8 4 -12" stroke="${col}" stroke-width="${2.2 * k}" fill="none" stroke-linecap="round"/>`);
}
export function flowers(s, x, y, n = 5, seed = 3, spread = 18) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const fx = x + (r() - .5) * spread * 2, fy = y + (r() - .5) * spread * .8, c = C.flowers[Math.floor(r() * C.flowers.length)], k = .7 + r() * .5;
    s.add(fy, `<path d="M${fx} ${fy} v-${6 * k}" stroke="${C.leafDk}" stroke-width="1.4"/><g fill="${c}">${[0, 72, 144, 216, 288].map(a => `<circle cx="${(fx + Math.cos(a * Math.PI / 180) * 2.6 * k).toFixed(1)}" cy="${(fy - 7 * k + Math.sin(a * Math.PI / 180) * 2.6 * k).toFixed(1)}" r="${2.1 * k}"/>`).join('')}</g><circle cx="${fx}" cy="${fy - 7 * k}" r="${1.3 * k}" fill="${c === '#F7D24A' ? '#E08A2C' : '#F7D24A'}"/>`);
  }
}
export function rock(s, x, y, k = 1) {
  s.add(y, `${shadow(x + 2, y, 13 * k, 4 * k)}<path d="M${x - 13 * k} ${y} Q${x - 12 * k} ${y - 12 * k} ${x - 2 * k} ${y - 13 * k} Q${x + 12 * k} ${y - 12 * k} ${x + 13 * k} ${y} Z" fill="${C.stoneDk}"/><path d="M${x - 11 * k} ${y - 2 * k} Q${x - 10 * k} ${y - 12 * k} ${x - 2 * k} ${y - 12 * k} Q${x + 9 * k} ${y - 11 * k} ${x + 9 * k} ${y - 3 * k} Z" fill="${C.stone}"/><path d="M${x - 6 * k} ${y - 9 * k} q4 -2 8 -1" stroke="${C.stoneLt}" stroke-width="${2 * k}" fill="none" stroke-linecap="round"/>`);
}
export function fence(s, pts, k = 1) {
  // posts at each point, two rails between consecutive points
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    s.add(Math.max(y1, y2) - 2, `<path d="M${x1} ${y1 - 14 * k} L${x2} ${y2 - 14 * k} M${x1} ${y1 - 6 * k} L${x2} ${y2 - 6 * k}" stroke="${C.woodDk}" stroke-width="${4 * k}" stroke-linecap="round"/><path d="M${x1} ${y1 - 15 * k} L${x2} ${y2 - 15 * k} M${x1} ${y1 - 7 * k} L${x2} ${y2 - 7 * k}" stroke="${C.wood}" stroke-width="${2.6 * k}" stroke-linecap="round"/>`);
  }
  pts.forEach(([x, y]) => s.add(y, `<rect x="${x - 2.6 * k}" y="${y - 20 * k}" width="${5.2 * k}" height="${21 * k}" rx="${1.6 * k}" fill="${C.woodDk}"/><rect x="${x - 2.6 * k}" y="${y - 20 * k}" width="${3.4 * k}" height="${20 * k}" rx="${1.4 * k}" fill="${C.wood}"/>`));
}
export function path(s, d, w = 30) {
  s.g(`<path d="${d}" fill="none" stroke="${C.meadowDk}" stroke-width="${w + 12}" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/>
    <path d="${d}" fill="none" stroke="${C.pathEdge}" stroke-width="${w + 5}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${C.path}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${C.pathLt}" stroke-width="${w * .35}" stroke-linecap="round" stroke-linejoin="round" opacity=".7" stroke-dasharray="30 26"/>`);
}
export function river(s, d, w = 34) {
  s.g(`<path d="${d}" fill="none" stroke="${C.meadowDk}" stroke-width="${w + 16}" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>
    <path d="${d}" fill="none" stroke="${C.waterDk}" stroke-width="${w + 6}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${C.water}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${C.waterLt}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="10 34" transform="translate(-6 -3)"/>
    <path d="${d}" fill="none" stroke="${C.waterLt}" stroke-width="2" stroke-linecap="round" stroke-dasharray="6 50" transform="translate(7 4)" opacity=".8"/>`);
}
export function cloud(x, y, k = 1) {
  return `<g fill="#fff" opacity=".95"><ellipse cx="${x}" cy="${y}" rx="${30 * k}" ry="${11 * k}"/><circle cx="${x - 10 * k}" cy="${y - 7 * k}" r="${11 * k}"/><circle cx="${x + 9 * k}" cy="${y - 10 * k}" r="${14 * k}"/></g>`;
}
export function butterfly(s, x, y, c = '#F7D24A') {
  s.over(`<g transform="translate(${x} ${y})"><ellipse cx="-4" cy="-2" rx="4.5" ry="3.5" fill="${c}" transform="rotate(-25 -4 -2)"/><ellipse cx="4" cy="-2" rx="4.5" ry="3.5" fill="${c}" transform="rotate(25 4 -2)"/><ellipse cx="-3" cy="3" rx="3" ry="2.4" fill="${c}"/><ellipse cx="3" cy="3" rx="3" ry="2.4" fill="${c}"/><path d="M0 -4 v9" stroke="${C.ink}" stroke-width="1.4" stroke-linecap="round"/></g>`);
}
export function star(x, y, r = 8, on = true) {
  const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .48 : r; pts.push(`${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`); }
  return `<polygon points="${pts.join(' ')}" fill="${on ? C.gold : '#FFF6E2'}" stroke="${on ? C.goldDk : '#CDBEA2'}" stroke-width="1.4" stroke-linejoin="round"/>`;
}
export const stars3 = (x, y, n, r = 7) => [0, 1, 2].map(i => star(x + (i - 1) * r * 2.3, y, r, i < n)).join('');
export function bone(x, y, k = 1, fill = '#FFF6E2', stroke = '#C9A777') {
  return `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-14 -3 h28 a6 6 0 1 1 4 -6 a6 6 0 1 1 0 12 a6 6 0 1 1 -4 6 h-28 a6 6 0 1 1 -4 -6 a6 6 0 1 1 0 -12 a6 6 0 1 1 4 6 z" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/></g>`;
}
export function paw(x, y, k = 1, fill = C.ink, op = 1, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${k})" fill="${fill}" opacity="${op}"><ellipse cx="0" cy="4" rx="7" ry="6"/><circle cx="-7" cy="-5" r="3"/><circle cx="-2.5" cy="-9" r="3"/><circle cx="2.5" cy="-9" r="3"/><circle cx="7" cy="-5" r="3"/></g>`;
}
export function bonnie(x, y, k = 1, look = '') {
  // x,y = her feet
  return `${shadow(x, y - 2, 34 * k, 8 * k, .2)}<g transform="translate(${x - 60 * k} ${y - 120 * k}) scale(${k})" style="--fur:#9a6440;--fur-dk:#74472a;--fur-lt:#c99568">${bonnieRaw}${look}</g>`;
}
// a speech bubble with a tail pointing to (tx,ty); text lines in Andika
export function bubble(x, y, w, lines, tx, ty, fs = 15) {
  const h = lines.length * fs * 1.3 + 20, ax = Math.min(Math.max(tx, x + 24), x + w - 30);
  const d = ty < y
    ? `M${x + 14} ${y} H${ax - 8} L${tx} ${ty} L${ax + 12} ${y} H${x + w - 14} Q${x + w} ${y} ${x + w} ${y + 14} V${y + h - 14} Q${x + w} ${y + h} ${x + w - 14} ${y + h} H${x + 14} Q${x} ${y + h} ${x} ${y + h - 14} V${y + 14} Q${x} ${y} ${x + 14} ${y} Z`
    : `M${x + 14} ${y} H${x + w - 14} Q${x + w} ${y} ${x + w} ${y + 14} V${y + h - 14} Q${x + w} ${y + h} ${x + w - 14} ${y + h} H${ax + 12} L${tx} ${ty} L${ax - 8} ${y + h} H${x + 14} Q${x} ${y + h} ${x} ${y + h - 14} V${y + 14} Q${x} ${y} ${x + 14} ${y} Z`;
  return `<g><path d="${d}" fill="${C.paper}" stroke="#D9C7A6" stroke-width="2" stroke-linejoin="round"/>
    ${lines.map((l, i) => `<text x="${x + 14}" y="${y + 13 + fs + i * fs * 1.3}" font-family="Andika" font-size="${fs}" fill="${C.ink}">${l}</text>`).join('')}</g>`;
}
// a small hanging name board on a post; text is drawn so its length sets the board
export function nameBoard(s, x, y, text, nStars, opts = {}) {
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
