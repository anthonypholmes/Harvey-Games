// Drawings for the Meadow Clubhouse design sheet (step 0).
// Style rules: flat rounded shapes; any outline is a darker shade of the fill, never black;
// a light "dot" texture like Bonnie's curls; soft ground shadow; no emoji.
import fs from 'node:fs';
const D = new URL('./', import.meta.url).pathname;
export const bonnie = fs.readFileSync(D + 'bonnie.svg', 'utf8').replace(/<svg[^>]*>/, '').replace('</svg>', '');
export const croak = fs.readFileSync(D + 'croak.svg', 'utf8').replace(/<svg[^>]*>/, '').replace('</svg>', '');

export const P = {
  ink: '#4A3B2C', inkSoft: '#7A6A58', paper: '#FBF4E4', paperLine: '#EADFCB',
  grass: '#8CC56E', grassDk: '#5E9A4E', grassLt: '#B5DB95', leaf: '#6BA368', leafDk: '#4C7E4A',
  sky: '#CFEAF4', skyLt: '#EAF6FA', wood: '#D9A86C', woodLt: '#EDC994', woodDk: '#9A6A3A', woodInk: '#5C3D1E',
  gold: '#F2C14E', goldDk: '#B88A1E', berry: '#D9596B',
  // places
  park: '#D97A4E', parkLt: '#F2B48F', parkDk: '#9E4A27',
  earth: '#A9743F', earthLt: '#C8935A', earthDk: '#4A2E1A',
  river: '#5DB3D6', riverLt: '#BDE6F3', riverDk: '#2F7FA6', stone: '#D8D0C0', stoneDk: '#9C927F',
  apple: '#D9443A', appleLt: '#F28B82', appleDk: '#9E2B23',
  pond: '#3FA7A0', pondLt: '#9FDCD3', pondDk: '#22706B', lily: '#F3A6BE',
  sand: '#E9C77B', sandLt: '#F6E3AE', sandDk: '#B08A3C', sea: '#4E9FC9',
};

const dots = (pts, fill, r = 3, op = .5) => `<g fill="${fill}" opacity="${op}">${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`;
const mound = (fill = P.grass, dk = P.grassDk) => `
  <ellipse cx="120" cy="168" rx="104" ry="9" fill="#4A3B2C" opacity=".12"/>
  <path d="M14 150 Q22 112 72 104 Q120 96 168 104 Q220 112 226 150 Q228 166 120 168 Q12 166 14 150Z" fill="${dk}"/>
  <path d="M14 144 Q22 106 72 98 Q120 90 168 98 Q220 106 226 144 Q228 160 120 162 Q12 160 14 144Z" fill="${fill}"/>
  ${dots([[40, 132], [62, 118], [182, 120], [204, 136], [150, 150], [92, 152]], '#fff', 2.4, .35)}`;

export function bone(x = 0, y = 0, s = 1, fill = '#FFF6E2', stroke = '#C9A777') {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 -3 h28 a6 6 0 1 1 4 -6 a6 6 0 1 1 0 12 a6 6 0 1 1 -4 6 h-28 a6 6 0 1 1 -4 -6 a6 6 0 1 1 0 -12 a6 6 0 1 1 4 6 z" transform="translate(0 0)" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/></g>`;
}
export function paw(x, y, s = 1, fill = P.leafDk, op = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}" opacity="${op}"><ellipse cx="0" cy="4" rx="7" ry="6"/><circle cx="-7" cy="-5" r="3"/><circle cx="-2.5" cy="-9" r="3"/><circle cx="2.5" cy="-9" r="3"/><circle cx="7" cy="-5" r="3"/></g>`;
}
export function star(x, y, r = 10, fill = P.gold, stroke = P.goldDk) {
  const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .48 : r; pts.push(`${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`); }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round"/>`;
}

/* ---------- places (viewBox 0 0 240 180) ---------- */
export const places = {
  burrow: () => `${mound()}
    <path d="M44 146 Q58 74 120 70 Q182 74 196 146 Z" fill="#7DB862"/>
    ${dots([[86, 96], [150, 92], [120, 82], [170, 120]], '#fff', 2.2, .3)}
    <ellipse cx="88" cy="126" rx="24" ry="15" fill="${P.earthLt}"/><ellipse cx="88" cy="128" rx="18" ry="11" fill="${P.earthDk}"/>
    <ellipse cx="154" cy="122" rx="24" ry="15" fill="${P.earthLt}"/><ellipse cx="154" cy="124" rx="18" ry="11" fill="${P.earthDk}"/>
    <g><ellipse cx="80" cy="106" rx="5" ry="15" fill="#F3EEE8" stroke="#BDB2A6" stroke-width="1.6" transform="rotate(-10 80 106)"/><ellipse cx="80" cy="106" rx="2" ry="10" fill="#F2B6C1" transform="rotate(-10 80 106)"/>
       <ellipse cx="94" cy="106" rx="5" ry="15" fill="#F3EEE8" stroke="#BDB2A6" stroke-width="1.6" transform="rotate(10 94 106)"/><ellipse cx="94" cy="106" rx="2" ry="10" fill="#F2B6C1" transform="rotate(10 94 106)"/>
       <path d="M74 124 Q87 112 100 124 Z" fill="#F3EEE8"/><circle cx="83" cy="121" r="1.8" fill="${P.ink}"/><circle cx="91" cy="121" r="1.8" fill="${P.ink}"/></g>
    ${bone(154, 118, .55)}
    <g><path d="M184 148 l6 -14 l6 14 z" fill="#F08A3C" stroke="#B5591E" stroke-width="1.5" stroke-linejoin="round"/><path d="M190 134 q-6 -10 -3 -14 M190 134 q2 -12 7 -13" stroke="${P.leafDk}" stroke-width="3" fill="none" stroke-linecap="round"/></g>`,

  river: () => `${mound()}
    <path d="M14 128 Q70 110 120 122 Q170 134 226 118 L226 142 Q170 158 120 146 Q70 134 14 152 Z" fill="${P.river}"/>
    <path d="M34 134 q10 -4 20 0 M150 140 q10 -4 20 0 M96 128 q8 -3 16 0" stroke="${P.riverLt}" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${[[52, 132], [94, 124], [140, 132], [184, 128]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y + 3}" rx="19" ry="9" fill="${P.stoneDk}"/><ellipse cx="${x}" cy="${y}" rx="19" ry="9" fill="${P.stone}"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="11" fill="#5E5547">${(i + 1) * 10}</text>`).join('')}
    <g transform="translate(140 108)"><ellipse cx="0" cy="10" rx="12" ry="9" fill="#5DA34B"/><circle cx="-6" cy="0" r="5" fill="#5DA34B"/><circle cx="6" cy="0" r="5" fill="#5DA34B"/><circle cx="-6" cy="0" r="2.4" fill="#fff"/><circle cx="6" cy="0" r="2.4" fill="#fff"/><circle cx="-5.5" cy=".5" r="1.3" fill="#2B2B2B"/><circle cx="6.5" cy=".5" r="1.3" fill="#2B2B2B"/><path d="M-5 9 q5 4 10 0" stroke="#2F5B2A" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>
    <g stroke="${P.leafDk}" stroke-width="3" stroke-linecap="round"><path d="M28 118 q-2 -20 2 -30 M34 120 q2 -16 8 -24"/><path d="M206 110 q-2 -18 2 -28 M212 112 q2 -14 8 -20"/></g>
    <ellipse cx="30" cy="88" rx="3.5" ry="8" fill="${P.woodDk}"/><ellipse cx="210" cy="82" rx="3.5" ry="8" fill="${P.woodDk}"/>`,

  orchard: () => `${mound()}
    ${[[66, 58, 1], [174, 62, 1], [120, 44, 1.1]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})">
      <rect x="-5" y="20" width="10" height="44" rx="4" fill="${P.woodDk}"/>
      <circle cx="0" cy="12" r="34" fill="${P.leafDk}"/><circle cx="0" cy="8" r="32" fill="${P.leaf}"/>
      ${dots([[-14, -8], [14, -12], [20, 14], [-20, 16]], '#fff', 2.4, .25)}
      ${[-12, 0, 12].map(ax => [0, 13].map(ay => `<circle cx="${ax}" cy="${ay}" r="5" fill="${P.apple}"/><circle cx="${ax - 1.6}" cy="${ay - 1.8}" r="1.4" fill="${P.appleLt}"/>`).join('')).join('')}
    </g>`).join('')}
    <g transform="translate(120 136)"><path d="M-22 -6 h44 l-5 20 h-34 z" fill="${P.wood}" stroke="${P.woodDk}" stroke-width="2" stroke-linejoin="round"/><path d="M-20 0 h40 M-18 7 h36" stroke="${P.woodDk}" stroke-width="1.4"/>
      ${[-12, -3, 6, 14].map((x, i) => `<circle cx="${x}" cy="${-9 - (i % 2) * 3}" r="5" fill="${P.apple}"/>`).join('')}</g>`,

  cove: () => `
    <ellipse cx="120" cy="168" rx="104" ry="9" fill="#4A3B2C" opacity=".12"/>
    <path d="M14 150 Q22 112 72 104 Q120 96 168 104 Q220 112 226 150 Q228 166 120 168 Q12 166 14 150Z" fill="${P.sandDk}"/>
    <path d="M14 144 Q22 106 72 98 Q120 90 168 98 Q220 106 226 144 Q228 160 120 162 Q12 160 14 144Z" fill="${P.sand}"/>
    <path d="M40 120 Q120 94 200 118 Q196 136 120 138 Q46 138 40 120Z" fill="${P.sea}"/>
    <path d="M70 122 q8 -3 16 0 M150 124 q8 -3 16 0" stroke="#CFE6F5" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    ${dots([[40, 146], [70, 154], [176, 152], [204, 142]], '#fff', 2.2, .45)}
    <g transform="translate(88 64) scale(.32)">${croak}</g>
    <g transform="translate(176 104)"><rect x="-16" y="0" width="32" height="20" rx="4" fill="${P.woodDk}"/><path d="M-16 6 Q0 -10 16 6 Z" fill="${P.wood}" stroke="${P.woodDk}" stroke-width="2"/><rect x="-16" y="6" width="32" height="4" fill="${P.gold}"/><rect x="-3" y="5" width="6" height="8" rx="1.5" fill="${P.gold}" stroke="${P.goldDk}" stroke-width="1.2"/></g>
    <g transform="translate(46 70)"><rect x="-2" y="0" width="4" height="52" rx="2" fill="${P.woodDk}"/><path d="M2 2 L30 8 L2 18 Z" fill="${P.berry}"/>${bone(13, 10, .3, '#fff', '#fff')}</g>`,
};

/* ---------- level stones (viewBox 0 0 120 100) ---------- */
export const stones = {
  done: n => `<ellipse cx="60" cy="74" rx="46" ry="16" fill="#4A3B2C" opacity=".12"/><ellipse cx="60" cy="66" rx="46" ry="22" fill="${P.stoneDk}"/><ellipse cx="60" cy="60" rx="46" ry="22" fill="#EFE3CC"/>
    <text x="60" y="72" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="22" fill="${P.ink}">${n}</text>
    ${star(38, 34, 9)}${star(60, 30, 11)}${star(82, 34, 9)}${paw(94, 62, .9, P.leafDk, .85)}`,
  open: n => `<ellipse cx="60" cy="74" rx="46" ry="16" fill="#4A3B2C" opacity=".12"/><ellipse cx="60" cy="60" rx="54" ry="29" fill="none" stroke="${P.gold}" stroke-width="4" stroke-dasharray="2 8" stroke-linecap="round"/>
    <ellipse cx="60" cy="66" rx="46" ry="22" fill="${P.stoneDk}"/><ellipse cx="60" cy="60" rx="46" ry="22" fill="#FFF6E2"/>
    <text x="60" y="68" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="24" fill="${P.ink}">${n}</text>
    ${paw(16, 92, .6, P.inkSoft, .45)}${paw(30, 84, .6, P.inkSoft, .45)}`,
  fresh: n => `<ellipse cx="60" cy="74" rx="46" ry="16" fill="#4A3B2C" opacity=".12"/><ellipse cx="60" cy="66" rx="46" ry="22" fill="${P.stoneDk}"/><ellipse cx="60" cy="60" rx="46" ry="22" fill="#FFF6E2"/>
    <text x="60" y="68" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="24" fill="${P.ink}">${n}</text>
    <g transform="translate(86 6)"><rect x="-1.5" y="0" width="3" height="40" rx="1.5" fill="${P.woodDk}"/><path d="M1.5 1 L34 9 L1.5 18 Z" fill="${P.gold}" stroke="${P.goldDk}" stroke-width="1.4" stroke-linejoin="round"/><text x="5" y="12.5" font-family="Fredoka" font-weight="700" font-size="7.5" fill="${P.woodInk}">NEW</text></g>`,
  locked: n => `<ellipse cx="60" cy="74" rx="46" ry="16" fill="#4A3B2C" opacity=".1"/><ellipse cx="60" cy="66" rx="46" ry="22" fill="#A8A296"/><ellipse cx="60" cy="60" rx="46" ry="22" fill="#D3CEC4"/>
    <path d="M20 50 q12 -10 24 -6 q10 4 20 -4" stroke="${P.leafDk}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>
    ${[[26, 46], [42, 46], [58, 44]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3" fill="${P.leaf}" transform="rotate(-30 ${x} ${y})"/>`).join('')}
    <text x="52" y="72" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="22" fill="#4F4A42">${n}</text>
    <g transform="translate(80 58)"><path d="M-6 0 v-5 a6 6 0 0 1 12 0 v5" stroke="#6B655A" stroke-width="3" fill="none"/><rect x="-9" y="0" width="18" height="14" rx="3" fill="#8B8478"/><circle cx="0" cy="6" r="2" fill="#4F4A42"/></g>`,
};

/* ---------- small drawn icons (viewBox 0 0 48 48) ---------- */
export const icons = {
  bone: () => bone(24, 24, .9),
  paw: () => paw(24, 26, 1.4, P.ink),
  star: () => star(24, 25, 18),
  home: () => `<path d="M8 24 L24 10 L40 24" fill="${P.berry}" stroke="#A93E4F" stroke-width="2.4" stroke-linejoin="round"/><rect x="12" y="23" width="24" height="17" rx="2" fill="${P.woodLt}" stroke="${P.woodDk}" stroke-width="2"/><rect x="21" y="29" width="7" height="11" rx="1.5" fill="${P.woodDk}"/>`,
  shop: () => `<rect x="10" y="20" width="28" height="20" rx="2" fill="${P.woodLt}" stroke="${P.woodDk}" stroke-width="2"/><path d="M7 20 L11 9 H37 L41 20 Z" fill="${P.berry}" stroke="#A93E4F" stroke-width="2" stroke-linejoin="round"/><path d="M17 9 L15 20 M24 9 V20 M31 9 L33 20" stroke="#fff" stroke-width="2.4"/>${bone(24, 31, .38)}`,
  lock: () => `<path d="M16 22 v-6 a8 8 0 0 1 16 0 v6" stroke="#6B655A" stroke-width="4" fill="none"/><rect x="11" y="21" width="26" height="19" rx="4" fill="#8B8478"/><circle cx="24" cy="30" r="3" fill="#4F4A42"/>`,
  sound: () => `<path d="M10 19 h7 l9 -7 v24 l-9 -7 h-7 z" fill="${P.ink}"/><path d="M31 18 q5 6 0 12 M35 14 q9 10 0 20" stroke="${P.ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
};

/* ---------- wooden things ---------- */
export function plank(w, label, opts = {}) {
  const h = opts.h || 56, fs = opts.fs || 22, arrow = opts.arrow;
  const body = arrow === 'left' ? `M18 2 H${w - 6} Q${w - 2} 2 ${w - 2} 8 V${h - 8} Q${w - 2} ${h - 2} ${w - 6} ${h - 2} H18 L2 ${h / 2} Z`
    : `M8 2 H${w - 8} Q${w - 2} 2 ${w - 2} 8 V${h - 8} Q${w - 2} ${h - 2} ${w - 8} ${h - 2} H8 Q2 ${h - 2} 2 ${h - 8} V8 Q2 2 8 2Z`;
  const fill = opts.fill || P.wood, dk = opts.dk || P.woodDk, lt = opts.lt || P.woodLt;
  return `<svg viewBox="0 0 ${w} ${h + 6}" width="${w}" height="${h + 6}" role="img" aria-label="${label}">
    <path d="${body}" transform="translate(0 5)" fill="${dk}"/><path d="${body}" fill="${fill}"/>
    <path d="M${arrow ? 24 : 14} ${h * .34} q${w * .2} -4 ${w * .4} 0 M${w * .45} ${h * .72} q${w * .18} 3 ${w * .38} 0" stroke="${lt}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>
    <circle cx="${arrow ? 22 : 12}" cy="${h / 2}" r="2.4" fill="${dk}"/><circle cx="${w - 12}" cy="${h / 2}" r="2.4" fill="${dk}"/>
    <text x="${w / 2 + (arrow ? 8 : 0)}" y="${h / 2 + fs * .36}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="${fs}" fill="${opts.ink || P.woodInk}">${label}</text></svg>`;
}
export function tag(content, w = 104) {
  return `<svg viewBox="0 0 ${w} 52" width="${w}" height="52" role="img" aria-label="${content.label}">
    <path d="M14 6 H${w - 6} Q${w - 2} 6 ${w - 2} 10 V42 Q${w - 2} 46 ${w - 6} 46 H14 L4 26 Z" transform="translate(0 3)" fill="${P.woodDk}"/>
    <path d="M14 6 H${w - 6} Q${w - 2} 6 ${w - 2} 10 V42 Q${w - 2} 46 ${w - 6} 46 H14 L4 26 Z" fill="${P.woodLt}"/>
    <circle cx="14" cy="26" r="3" fill="${P.paper}" stroke="${P.woodDk}" stroke-width="1.5"/>
    ${content.icon}<text x="${w - 12}" y="34" text-anchor="end" font-family="Fredoka" font-weight="700" font-size="22" fill="${P.woodInk}">${content.text}</text></svg>`;
}

/* ---------- journal stamp (viewBox 0 0 160 160) ---------- */
export function stamp(name, inner, ink = '#3F7A47', rot = -6, stars = 3) {
  const id = 'arc' + name.replace(/\W/g, '');
  return `<g transform="rotate(${rot} 80 80)" opacity=".92">
    <circle cx="80" cy="80" r="74" fill="none" stroke="${ink}" stroke-width="5" stroke-dasharray="180 3 40 2 90 4"/>
    <circle cx="80" cy="80" r="50" fill="none" stroke="${ink}" stroke-width="2"/>
    <defs><path id="${id}" d="M18 80 A62 62 0 0 1 142 80"/></defs>
    <text font-family="Fredoka" font-weight="700" font-size="11" letter-spacing="1" fill="${ink}"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${name.toUpperCase()}</textPath></text>
    <g transform="translate(80 74) scale(.85)">${inner}</g>
    ${Array.from({ length: 3 }, (_, i) => star(60 + i * 20, 110, 7, i < stars ? ink : 'none', ink)).join('')}
  </g>`;
}
export const stampInner = {
  burrow: (ink) => `<ellipse cx="-16" cy="4" rx="14" ry="9" fill="${ink}"/><ellipse cx="18" cy="2" rx="14" ry="9" fill="${ink}"/><ellipse cx="-20" cy="-14" rx="3.5" ry="11" fill="${ink}" transform="rotate(-10 -20 -14)"/><ellipse cx="-11" cy="-14" rx="3.5" ry="11" fill="${ink}" transform="rotate(10 -11 -14)"/>`,
  river: (ink) => `<path d="M-38 6 q10 -6 20 0 t20 0 t20 0 t20 0" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>${[-24, 0, 24].map(x => `<ellipse cx="${x}" cy="-8" rx="9" ry="5" fill="${ink}"/>`).join('')}`,
  orchard: (ink) => `<rect x="-3.5" y="6" width="7" height="16" rx="2" fill="${ink}"/><circle cx="0" cy="-6" r="20" fill="${ink}"/>${[-9, 0, 9].map(x => [-12, -1].map(y => `<circle cx="${x}" cy="${y}" r="3.6" fill="#FFFDF6"/>`).join('')).join('')}`,
};
