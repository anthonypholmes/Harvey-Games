/* Phone-size check: a picture of every screen at iPhone sizes, as the app sees it.
 *
 *   node tools/phone-check.mjs                    every screen at all three sizes (about 10 minutes)
 *   node tools/phone-check.mjs --size se          one size only (se, 17 or max; ipad checks the iPad is unchanged)
 *   node tools/phone-check.mjs --only bonds,shop  only the screens whose names contain these words
 *   node tools/phone-check.mjs --report           only write the report again, from the last pictures
 *   node tools/phone-check.mjs --only bonds-level --size se --probe "<js>"   print what the JavaScript returns on that screen (no pictures)
 *
 * Needs Google Chrome on the Mac. Nothing else to install: it talks to Chrome directly.
 * Pictures go in docs/phone-check/<size>/, and docs/phone-check/index.html shows them side by side
 * (open it in a browser). docs/phone-check/REPORT.md lists what doesn't fit: pages wider than the
 * screen, how far each page scrolls, and buttons smaller than 44 × 44.
 *
 * Each page is told it is inside the app (a pretend window.Capacitor, as in the tests), so the
 * in-app layout, the padlocks and the players all show as they would on the phone. The screen's
 * rounded top (status bar, Dynamic Island) and the home bar are drawn on each picture, and a red
 * dashed line marks the bottom of the screen: anything below it needs scrolling.
 *
 * The player is a made-up "Sam" with some progress, as in the App Store screenshots.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, CHROME, SIZES, ORDER, PRELUDE, MAKE_SAM, overlay, serve, startChrome, connect, sleep } from './phone-lib.mjs';

const OUT = path.join(ROOT, 'docs', 'phone-check');
const PORT = 8798, DEBUG_PORT = 9338;

/* ---------- the screens ---------- */
const MATHS = ['y2-maths-partitioning', 'y2-maths-number-bonds', 'y2-maths-number-lines', 'y2-maths-arrays', 'y2-maths-sharing', 'y2-maths-captains-cove'];
const WORDS = ['y2-english-phonics', 'y2-english-tricky-words', 'y2-english-sentences', 'y2-english-stories'];
const short = id => id.replace(/^y2-(maths|english)-/, '');
const answerGate = `(() => { const t = [...document.querySelectorAll('.modal p')].map(p => p.textContent).find(x => /×/.test(x)) || '';
  const [a, b] = t.match(/\\d+/g) || []; const i = document.querySelector('#gateAns'); i.value = a * b; document.querySelector('[data-a="ok"]').click(); })()`;
const level = (world, n = 0) => `Meadow.startLevel('${world}', Meadow.world('${world}').levels[${n}].id)`;
const ask = `(document.querySelector('#mmAsk') || document.querySelector('#askBtn') || {click(){}}).click()`;

const SCENES = [
  { name: 'clubhouse', page: 'index.html' },
  { name: 'players', page: 'index.html', setup: 'twoPlayers' },
  { name: 'maths-worlds', page: 'meadow-maths.html' },
  { name: 'words-worlds', page: 'meadow-words.html' },
  { name: 'maths-map', page: 'meadow-maths.html', steps: [`Meadow.worldMap('y2-maths-number-bonds')`] },
  { name: 'words-map', page: 'meadow-words.html', steps: [`Meadow.worldMap('y2-english-phonics')`] },
  { name: 'paid-level', page: 'meadow-maths.html', steps: [`Meadow.worldMap('y2-maths-number-bonds')`, `(document.querySelectorAll('.stone')[1] || {click(){}}).click()`] },
  { name: 'grownups-gate', page: 'meadow-maths.html', steps: [`Meadow.grownUps()`] },
  { name: 'grownups-area', page: 'meadow-maths.html', steps: [`Meadow.grownUps()`, answerGate] },
  { name: 'unlock', page: 'meadow-maths.html', steps: [`Meadow.fullGame.unlock()`] },
  { name: 'shop-dress-up', page: 'meadow-words.html#shop' },
  { name: 'shop-themes', page: 'meadow-words.html#shop', steps: [`document.querySelector('[data-tab="themes"]').click()`] },
  { name: 'shop-prizes', page: 'meadow-words.html#shop', steps: [`document.querySelector('[data-tab="prizes"]').click()`] },
  { name: 'walk', page: 'bonnies-walk.html', steps: [`Meadow.walk.skipHello()`], wait: 3000 },
  ...MATHS.flatMap(w => [
    { name: `${short(w)}-level`, page: 'meadow-maths.html', steps: [level(w)], wait: 2500 },
    { name: `${short(w)}-help`, page: 'meadow-maths.html', steps: [level(w), ask, ask], wait: 2500 },
  ]),
  ...WORDS.flatMap(w => [
    { name: `${short(w)}-level`, page: 'meadow-words.html', steps: [level(w)], wait: 2500 },
    { name: `${short(w)}-help`, page: 'meadow-words.html', steps: [level(w), ask, ask], wait: 2500 },
  ]),
];

const TWO_PLAYERS = `(() => { Meadow.players.add(); Meadow.save.mutate(s => { s.name = 'Alex'; s.bones = 12; s.voice = false; s.sound = false; });
  sessionStorage.removeItem('meadow-player-picked'); })()`;

/* Measured on each screen after it settles. */
const MEASURE = `(() => {
  const W = innerWidth, H = innerHeight, de = document.documentElement;
  const label = el => { let s = el.tagName.toLowerCase(); if (el.id) s += '#' + el.id; else if (el.className && typeof el.className === 'string') s += '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.');
    const t = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 30); return t ? s + ' "' + t + '"' : s; };
  const seen = el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const clipped = el => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'hidden' || o === 'auto' || o === 'scroll' || o === 'clip') return true; } return false; };
  const wide = [...document.querySelectorAll('body *')].filter(el => { if (!seen(el) || clipped(el) || el.closest('#frog, .butterfly')) return false; const r = el.getBoundingClientRect(); return r.right > W + 1 || r.left < -1; })
    .filter((el, i, a) => !a.includes(el.parentElement)).slice(0, 8).map(el => { const r = el.getBoundingClientRect(); return label(el) + ' (' + Math.round(r.left) + ' to ' + Math.round(r.right) + ')'; });
  const small = [...document.querySelectorAll('button, a[href], input, select, [role="button"], [onclick]')].filter(seen)
    .filter(el => !el.closest('[aria-hidden="true"], #frog, #phoneCheckOverlay'))
    .map(el => ({ el, r: el.getBoundingClientRect() })).filter(({ r }) => r.width < 44 || r.height < 44)
    .slice(0, 10).map(({ el, r }) => label(el) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
  const tiny = [...document.querySelectorAll('body *')].filter(el => seen(el) && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(el).fontSize) < 14)
    .slice(0, 6).map(el => label(el) + ' ' + getComputedStyle(el).fontSize);
  return { W, H, scrollW: de.scrollWidth, scrollH: Math.max(de.scrollHeight, document.body.scrollHeight), wide, small, tiny };
})()`;

/* ---------- the run ---------- */
const args = process.argv.slice(2), arg = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const sizeKeys = arg('--size') ? arg('--size').split(',') : ORDER;
const reportOnly = args.includes('--report');
const probe = arg('--probe');
const only = arg('--only') ? arg('--only').split(',') : null;
const scenes = SCENES.filter(s => !only || only.some(o => s.name.includes(o)));
if (sizeKeys.some(k => !SIZES[k])) { console.error('Sizes are: ' + Object.keys(SIZES).join(', ')); process.exit(1); }
if (!reportOnly && !fs.existsSync(CHROME)) { console.error('Google Chrome is needed: ' + CHROME); process.exit(1); }

const results = {};
let safeAreaWorks = true;
const started = Date.now();
if (!reportOnly) {
const server = await serve(PORT);
const chrome = await startChrome(DEBUG_PORT);
const cdp = await connect(chrome.ws);
const base = `http://127.0.0.1:${PORT}/`;
const evaluate = async expr => { const r = await cdp.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text); return r.result.value; };
const go = async url => { const loaded = cdp.once('Page.loadEventFired'); await cdp.send('Page.navigate', { url }); await loaded; await sleep(900); };

await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: PRELUDE });
try {
  for (const key of sizeKeys) {
    const size = SIZES[key]; results[key] = {};
    fs.mkdirSync(path.join(OUT, key), { recursive: true });
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: size.w, height: size.h, deviceScaleFactor: 2, mobile: true });
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    try { await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: size.top, bottom: size.bottom, left: 0, right: 0 } }); }
    catch (e) { safeAreaWorks = false; }
    for (const [i, scene] of scenes.entries()) {
      const file = `${String(SCENES.indexOf(scene) + 1).padStart(2, '0')}-${scene.name}.png`;
      for (let attempt = 1; attempt <= 2; attempt++) try { // a screen that trips over its own timing gets one more go
        await go(base + 'index.html'); await evaluate(MAKE_SAM);
        if (scene.setup === 'twoPlayers') await evaluate(TWO_PLAYERS);
        await go(base + scene.page);
        for (const step of scene.steps || []) { await evaluate(step); await sleep(900); }
        await sleep(scene.wait || 1200);
        await evaluate('scrollTo(0, 0)');
        if (probe) { console.log(`${size.name} ${scene.name}:`, JSON.stringify(await evaluate(probe), null, 1)); break; }
        const m = await evaluate(MEASURE);
        const fullH = Math.min(Math.max(m.scrollH, size.h), size.h * 4);
        await evaluate(overlay(size, fullH));
        await cdp.send('Emulation.setDeviceMetricsOverride', { width: size.w, height: fullH, deviceScaleFactor: 2, mobile: true });
        await sleep(300);
        const shot = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: size.w, height: fullH, scale: 1 } });
        await cdp.send('Emulation.setDeviceMetricsOverride', { width: size.w, height: size.h, deviceScaleFactor: 2, mobile: true });
        fs.writeFileSync(path.join(OUT, key, file), Buffer.from(shot.data, 'base64'));
        results[key][scene.name] = { file, ...m };
        const flags = [m.scrollW > m.W + 1 && `${m.scrollW - m.W}px too wide`, m.scrollH > m.H + 1 && `scrolls ${m.scrollH - m.H}px`].filter(Boolean).join(', ');
        console.log(`${size.name.padEnd(18)} ${String(i + 1).padStart(2)}/${scenes.length} ${scene.name.padEnd(22)} ${flags || 'fits'}`);
        break;
      } catch (e) {
        if (attempt === 1) continue;
        results[key][scene.name] = { file: null, error: e.message.split('\n')[0] };
        console.log(`${size.name.padEnd(18)} ${String(i + 1).padStart(2)}/${scenes.length} ${scene.name.padEnd(22)} FAILED: ${e.message.split('\n').slice(0,4).join(' | ')}`);
      }
    }
  }
} finally {
  cdp.close(); chrome.proc.kill(); server.close();
  try { fs.rmSync(chrome.profile, { recursive: true, force: true }); } catch (e) {}
}

}

if (probe) process.exit(0);
/* ---------- the report and the side-by-side page ---------- */
const prev = (() => { try { return JSON.parse(fs.readFileSync(path.join(OUT, 'results.json'), 'utf8')); } catch (e) { return {}; } })();
const all = { ...prev }; for (const k of Object.keys(results)) all[k] = { ...(prev[k] || {}), ...results[k] };
fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(all, null, 1));
const keys = [...ORDER, 'ipad'].filter(k => all[k]);
const today = new Date().toISOString().slice(0, 10);
let md = `# Phone-size check\n\nMade by \`node tools/phone-check.mjs\` on ${today}. The pictures are in \`docs/phone-check/<size>/\`; open \`docs/phone-check/index.html\` in a browser to see them side by side.\n\n`;
md += `Sizes: ${keys.map(k => `${SIZES[k].name} (${SIZES[k].w} × ${SIZES[k].h})`).join(', ')}.${safeAreaWorks ? '' : ' (This Chrome could not pretend the notch and home bar were there, so the safe-area padding is missing from the pictures.)'}\n\n`;
md += `"Too wide" means the page can be pushed sideways, which must never happen. "Scrolls" is how far below the screen the page goes: fine for the shop and the grown-ups area, not during a question.\n\n`;
md += `| Screen | ${keys.map(k => SIZES[k].name).join(' | ')} |\n|---|${keys.map(() => '---').join('|')}|\n`;
for (const s of SCENES) {
  const cells = keys.map(k => { const r = all[k][s.name]; if (!r) return '–'; if (r.error) return 'failed';
    return [r.scrollW > r.W + 1 ? `**${r.scrollW - r.W}px too wide**` : '', r.scrollH > r.H + 1 ? `scrolls ${r.scrollH - r.H}px` : 'fits'].filter(Boolean).join(', '); });
  if (cells.some(c => c !== '–')) md += `| ${s.name} | ${cells.join(' | ')} |\n`;
}
const k0 = keys.includes('se') ? 'se' : keys[0];
md += `\n## Problems at ${SIZES[k0].name} size\n\nEach problem once, with the screens it was found on.\n\n`;
const groups = [['Failed to open', r => r.error ? [r.error] : []], ['Past the edge of the screen', r => r.wide || []],
  ['Smaller than 44 × 44 (hard to tap)', r => r.small || []], ['Writing under 14px', r => r.tiny || []]];
for (const [title, pick] of groups) {
  const found = new Map();
  for (const s of SCENES) { const r = all[k0][s.name]; if (!r) continue;
    for (const x of new Set(pick(r).map(t => t.replace(/ \(-?\d+ to -?\d+\)$/, '')))) { if (!found.has(x)) found.set(x, []); found.get(x).push(s.name); } }
  if (!found.size) continue;
  md += `### ${title}\n\n`;
  for (const [x, on] of found) md += `- \`${x}\`: ${on.length > 6 ? on.length + ' screens' : on.join(', ')}\n`;
  md += '\n';
}
fs.writeFileSync(path.join(OUT, 'REPORT.md'), md);
const cell = (k, s) => { const r = all[k][s.name]; if (!r || !r.file) return '<td class="none">' + (r && r.error ? 'failed' : '–') + '</td>';
  const tag = r.scrollW > r.W + 1 ? `<b class="bad">${r.scrollW - r.W}px too wide</b>` : ''; const sc = r.scrollH > r.H + 1 ? `scrolls ${r.scrollH - r.H}px` : 'fits';
  return `<td><a href="${k}/${r.file}"><img loading="lazy" src="${k}/${r.file}" width="${SIZES[k].w * .6}"></a><div>${tag} ${sc}</div></td>`; };
fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Phone-size check</title>
<style>body{font:15px system-ui;margin:16px;background:#f4f1ea;color:#222}table{border-collapse:collapse}td,th{vertical-align:top;padding:8px;text-align:left}
th{position:sticky;top:0;background:#f4f1ea}tr{border-top:1px solid #ddd}img{border:1px solid #ccc;border-radius:12px;display:block;margin-bottom:4px}.bad{color:#C0002A}.none{color:#999}</style>
<h1>Phone-size check</h1><p>${today}. Tap a picture to see it full size. The red dashed line is the bottom of the screen.</p>
<table><tr><th>Screen</th>${keys.map(k => `<th>${SIZES[k].name}<br><small>${SIZES[k].w} × ${SIZES[k].h}</small></th>`).join('')}</tr>
${SCENES.filter(s => keys.some(k => all[k][s.name])).map(s => `<tr><th>${s.name}</th>${keys.map(k => cell(k, s)).join('')}</tr>`).join('\n')}</table>`);
console.log(`\nDone in ${Math.round((Date.now() - started) / 1000)}s. Open docs/phone-check/index.html, or read docs/phone-check/REPORT.md.`);
