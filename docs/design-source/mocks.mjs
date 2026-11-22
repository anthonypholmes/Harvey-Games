import fs from 'node:fs';
import { mathsRoute, hub } from './scenes.mjs';
import { C, bone, paw, star } from './kit.mjs';

const local = process.argv[2] === 'local';
const U = local ? { fred: '../fonts/Fredoka.ttf', and: '../fonts/Andika-Regular.ttf', club: 'now-iphone-club.jpg', maths: 'now-iphone-maths.jpg', ipad: 'now-ipad-maths.jpg' }
  : { fred: '/_blob/3c63d359fbbb9a11aaf400d325590fd8', and: '/_blob/da6f361114d0321783c417498e21a808', club: '/_blob/66a46ecd002f1399e6947641c21e8a88', maths: '/_blob/3bc0c042b70021d5b954ef0108c38f61', ipad: '/_blob/10a8791be905c01e78517b071edaddfb' };
const route = mathsRoute().render(), hubSvg = hub().render();

function tag(x, y, w, icon, text, label) {
  return `<g transform="translate(${x} ${y})" role="img" aria-label="${label}"><path d="M14 6 H${w - 6} Q${w - 2} 6 ${w - 2} 10 V40 Q${w - 2} 44 ${w - 6} 44 H14 L4 25 Z" transform="translate(0 3)" fill="${C.woodDk}"/><path d="M14 6 H${w - 6} Q${w - 2} 6 ${w - 2} 10 V40 Q${w - 2} 44 ${w - 6} 44 H14 L4 25 Z" fill="${C.woodLt}"/><circle cx="14" cy="25" r="3" fill="${C.paper}" stroke="${C.woodDk}" stroke-width="1.5"/>${icon}${text ? `<text x="${w - 10}" y="32" text-anchor="end" font-family="Fredoka" font-weight="700" font-size="19" fill="${C.woodInk}">${text}</text>` : ''}</g>`;
}
const homeIcon = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-12 0 L0 -11 L12 0" fill="${C.berry}" stroke="#A93E4F" stroke-width="2" stroke-linejoin="round"/><rect x="-9" y="-1" width="18" height="13" rx="1.5" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="1.6"/><rect x="-2.5" y="4" width="5" height="8" fill="${C.woodDk}"/></g>`;
const keyIcon = (x, y) => `<g transform="translate(${x} ${y})"><circle cx="-6" cy="0" r="6" fill="none" stroke="${C.woodInk}" stroke-width="3"/><path d="M0 0 h12 M8 0 v5 M12 0 v4" stroke="${C.woodInk}" stroke-width="3" stroke-linecap="round"/></g>`;
const titleBoard = (cx, y, text, sub) => { const w = text.length * 12 + 40; return `<g><path d="M${cx - w / 2 + 16} ${y - 8} V${y + 4} M${cx + w / 2 - 16} ${y - 8} V${y + 4}" stroke="${C.woodDk}" stroke-width="2.5"/><rect x="${cx - w / 2}" y="${y + 5}" width="${w}" height="40" rx="9" fill="${C.woodDk}"/><rect x="${cx - w / 2}" y="${y + 2}" width="${w}" height="40" rx="9" fill="${C.woodLt}"/><text x="${cx}" y="${y + 29}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="21" fill="${C.woodInk}">${text}</text>${sub || ''}</g>`; };

function overlayRoute(W) {
  return `${tag(12, 10, 62, homeIcon(40, 25), '', 'Back to the Clubhouse')}${tag(W - 112, 10, 100, bone(36, 25, .55), '86', '86 bones')}${titleBoard(W / 2, 10, 'Meadow Maths')}`;
}
function overlayHub(W) {
  return `${tag(12, 10, 66, keyIcon(42, 25), '', 'Grown-ups')}${tag(W - 112, 10, 100, bone(36, 25, .55), '86', '86 bones')}`;
}
function phone(svgView, scene, overlay) {
  return `<div style="width: 430px; height: 884px; box-sizing: border-box; padding: 20px; border-radius: 60px; background: #2B2622">
<div style="width: 390px; height: 844px; border-radius: 42px; overflow: hidden; position: relative; background: ${C.meadow}">
<svg viewBox="${svgView}" width="390" height="844" style="display: block" role="img" aria-label="Phone screen">${scene}</svg>
<svg viewBox="0 0 390 844" width="390" height="844" style="position: absolute; left: 0; top: 0" aria-hidden="false">${overlay}</svg>
</div></div>`;
}
function ipad(svgView, scene, overlay) {
  return `<div style="width: 860px; height: 1220px; box-sizing: border-box; padding: 20px; border-radius: 44px; background: #2B2622">
<div style="width: 820px; height: 1180px; border-radius: 26px; overflow: hidden; position: relative; background: ${C.meadow}">
<svg viewBox="${svgView}" width="820" height="1180" style="display: block" role="img" aria-label="iPad screen">${scene}</svg>
<svg viewBox="0 0 683 983" width="820" height="1180" style="position: absolute; left: 0; top: 0">${overlay}</svg>
</div></div>`;
}
const nowPhone = (src, alt) => `<div style="width: 430px; height: 884px; box-sizing: border-box; padding: 20px; border-radius: 60px; background: #2B2622"><div style="width: 390px; height: 844px; border-radius: 42px; overflow: hidden; background: #EFE3C8"><img src="${src}" alt="${alt}" style="width: 390px; display: block; margin-top: 24px"></div></div>`;
const nowIpad = (src, alt) => `<div style="width: 860px; height: 1220px; box-sizing: border-box; padding: 20px; border-radius: 44px; background: #2B2622"><div style="width: 820px; height: 1180px; border-radius: 26px; overflow: hidden; background: #EFE3C8"><img src="${src}" alt="${alt}" style="width: 820px; display: block; margin-top: 20px"></div></div>`;
const cap = (t, s) => `<div style="font-family: Fredoka; font-weight: 600; font-size: 20px; color: ${C.ink}; margin-top: 14px">${t}</div><div style="font-size: 15px; color: ${C.soft}; max-width: 420px">${s}</div>`;

/* ---------- the layouts compared ---------- */
function schemaA() {
  let d = 'M150 20', dots = '';
  const cols = ['#3F7A3A', '#3F7A3A', '#3F7A3A', '#3F7A3A', '#3F7A3A', '#3F7A3A', '#E07A3F', '#E07A3F', '#E07A3F', '#E07A3F', '#3B7FC4', '#3B7FC4', '#3B7FC4', '#3B7FC4', '#3B7FC4', '#3B7FC4'];
  cols.forEach((c, i) => { const y = 40 + i * 34, x = i % 2 ? 90 : 210; d += ` Q${i % 2 ? 230 : 70} ${y - 17} ${x} ${y}`; dots += `<circle cx="${x}" cy="${y}" r="10" fill="${c}" stroke="#fff" stroke-width="2.5"/>`; });
  return `<svg viewBox="0 0 300 600" width="300" height="600" role="img" aria-label="One long trail with sixteen places"><rect width="300" height="600" rx="16" fill="#EAF3DF"/><path d="${d}" stroke="${C.pathEdge}" stroke-width="14" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${C.path}" stroke-width="10" fill="none" stroke-linecap="round"/>${dots}
    <rect x="12" y="98" width="276" height="148" rx="10" fill="none" stroke="${C.ink}" stroke-width="2" stroke-dasharray="6 5"/><text x="20" y="92" font-family="Andika" font-size="12" fill="${C.ink}">one phone screen</text></svg>`;
}
function schemaB() {
  const route = (x0, col, n, label, dir) => {
    let d = `M150 150`, dots = '';
    for (let i = 0; i < n; i++) { const y = 230 + i * 52, x = x0 + (i % 2 ? 22 : -22) * dir; d += (i === 0 ? ` Q${(150 + x) / 2} 190 ${x} ${y}` : ` Q${x0 - 22 * dir * (i % 2 ? 1 : -1)} ${y - 26} ${x} ${y}`); dots += `<circle cx="${x}" cy="${y}" r="10" fill="${col}" stroke="#fff" stroke-width="2.5"/>`; }
    return `<path d="${d}" stroke="${C.pathEdge}" stroke-width="14" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${C.path}" stroke-width="10" fill="none" stroke-linecap="round"/>${dots}<text x="${x0}" y="${236 + n * 52}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="12" fill="${C.ink}">${label}</text>`;
  };
  return `<svg viewBox="0 0 300 600" width="300" height="600" role="img" aria-label="A Clubhouse with routes branching off"><rect width="300" height="600" rx="16" fill="#EAF3DF"/>
    ${route(60, '#3F7A3A', 6, 'Maths', 1)}${route(150, '#E07A3F', 4, 'Words', 1)}${route(240, '#3B7FC4', 6, 'Year 3', -1)}
    <rect x="110" y="96" width="80" height="58" rx="8" fill="${C.wood}" stroke="${C.woodDk}" stroke-width="2"/><path d="M100 100 L150 62 L200 100Z" fill="${C.berry}"/><text x="150" y="134" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="12" fill="${C.woodInk}">Clubhouse</text>
    <rect x="96" y="40" width="108" height="130" rx="10" fill="none" stroke="${C.ink}" stroke-width="2" stroke-dasharray="6 5" transform="translate(-0 -0) scale(1)" opacity="0"/>
    <text x="150" y="26" text-anchor="middle" font-family="Andika" font-size="12" fill="${C.ink}">the Clubhouse fits one screen</text></svg>`;
}
const li = a => `<ul style="margin: 8px 0 0; padding-left: 20px; font-size: 15.5px">${a.map(x => `<li style="margin-bottom: 6px">${x}</li>`).join('')}</ul>`;
const compare = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px">
<div><h2 style="font-size: 24px">A. One continuous trail</h2><p style="color: ${C.soft}; margin: 4px 0 14px">Every world on one long path from the Clubhouse.</p>${schemaA()}
${li(['Simple: one path, one direction, nothing to choose first.', 'With 15+ worlds it becomes a very long scroll (about 4,000 points on a phone). A child looking for one place has to hunt.', 'Maths and Words are mixed, so "where is my phonics?" has no clear answer.', 'Year 3 just adds length; it would need chapter breaks to stay usable.'])}</div>
<div><h2 style="font-size: 24px">B. Clubhouse meadow with routes (recommended)</h2><p style="color: ${C.soft}; margin: 4px 0 14px">A home meadow that fits one screen, with a gate for each route.</p>${schemaB()}
${li(['The Clubhouse is a place to come home to: Bonnie, the shop stall, the Walk arch and the gates are all things in the meadow, not buttons.', 'Each route stays short: 4 to 9 places, one or two screens on a phone.', 'Scales by adding gates: Year 3 Maths and Year 3 Words become new routes (or the Maths route carries on by boat from the Cove).', 'Maths and Words keep their own feel, as the two games do today.'])}</div></div>`;

export const boards = {
  'v2/Now.dc.html': { w: 1880, h: 1360, title: 'Now: the current design', body: `<h1 style="font-size: 30px; margin-bottom: 20px">Now: the current design</h1><div style="display: flex; gap: 40px; align-items: flex-start">
<div>${nowPhone(U.club, 'The current Clubhouse on iPhone')}${cap('iPhone: Clubhouse', 'A stack of cards and buttons.')}</div>
<div>${nowPhone(U.maths, 'The current Meadow Maths world list on iPhone')}${cap('iPhone: Meadow Maths', 'A list of cards with emoji icons.')}</div>
<div>${nowIpad(U.ipad, 'The current Meadow Maths world list on iPad')}${cap('iPad: Meadow Maths', 'The same cards in a grid.')}</div></div>` },
  'v2/Hub-iPhone.dc.html': { w: 430, h: 884, device: true, body: phone('125 86 390 844', hubSvg, overlayHub(390)) },
  'v2/Route-iPhone.dc.html': { w: 430, h: 884, device: true, body: phone('125 0 390 844', route, overlayRoute(390)) },
  'v2/Route-iPhone-later.dc.html': { w: 430, h: 884, device: true, body: phone('125 640 390 844', route, overlayRoute(390)) },
  'v2/Hub-iPad.dc.html': { w: 860, h: 1220, device: true, body: ipad('0 0 640 921', hubSvg, overlayHub(683)) },
  'v2/Route-iPad.dc.html': { w: 860, h: 1220, device: true, body: ipad('0 0 640 921', route, overlayRoute(683)) },
  'v2/Layouts.dc.html': { w: 1100, h: 1000, title: 'Layouts compared', body: compare },
};
