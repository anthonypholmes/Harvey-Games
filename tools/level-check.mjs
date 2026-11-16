/* Level-by-level phone check: opens every level of every world at phone size, as the app (full game
 * unlocked), and measures the first question of each:
 *   - whether everything a child needs to answer (keys, tiles, slots, bowls, signposts, choices) is on the screen
 *   - whether anything is wider than the screen
 *   - buttons and tiles smaller than 44 × 44
 *
 *   node tools/level-check.mjs                  every level at iPhone SE and iPhone 17 size (about 10 minutes)
 *   node tools/level-check.mjs --size se        one size (se, 17, max or ipad)
 *   node tools/level-check.mjs --only arrays    only the worlds whose names contain these words
 *
 * Writes docs/phone-check/LEVELS.md, and a picture of exactly what the phone shows for each level in
 * docs/phone-check/levels/<size>/ (open docs/phone-check/levels.html to see them side by side).
 * Questions are random, so a level can measure a little differently from run to run.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, CHROME, SIZES, PRELUDE, MAKE_SAM, serve, startChrome, connect, sleep } from './phone-lib.mjs';

const OUT = path.join(ROOT, 'docs', 'phone-check');
const PORT = 8796, DEBUG_PORT = 9339;
const args = process.argv.slice(2), arg = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const sizeKeys = arg('--size') ? arg('--size').split(',') : ['se', '17'];
const only = arg('--only') ? arg('--only').split(',') : null;
if (sizeKeys.some(k => !SIZES[k])) { console.error('Sizes are: ' + Object.keys(SIZES).join(', ')); process.exit(1); }
if (!fs.existsSync(CHROME)) { console.error('Google Chrome is needed: ' + CHROME); process.exit(1); }

/* What a child taps to answer, inside the question area. Bonnie, Ask Bonnie, the hints, "hear it" buttons and
   "start again" are left out: they help, but a question can be answered without them. */
const MEASURE = `(() => {
  const W = innerWidth, H = innerHeight, de = document.documentElement, area = document.querySelector('#area');
  if (!area) return { error: 'no question area' };
  const seen = el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[hidden]'); };
  const helper = el => el.closest('.helper, .dock, .buddy, #mmAsk, #askBtn, #mmSay, .micon, .ladder, #putback, .vis-tools') ||
    /hear|again|blend|listen|read/i.test(el.textContent + ' ' + (el.getAttribute('aria-label') || ''));
  const label = el => { let s = el.tagName.toLowerCase(); if (el.id) s += '#' + el.id; else if (typeof el.className === 'string' && el.className.trim()) s += '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.');
    const t = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 20); return t ? s + ' "' + t + '"' : s; };
  const taps = [...area.querySelectorAll('button, [role="button"], input, .tile, .slot, .gv-box, .gv-cell, .nl, .stone, .opt, .sign, .wchip, [data-key], [data-choice]')]
    .filter(el => seen(el) && !helper(el) && !(el.parentElement && el.parentElement.closest('.tile, .sign, .opt, button')));
  /* the maths keys can be fixed along the bottom of a phone screen: they are always in reach, and anything behind them is not */
  const keys = document.querySelector('#controls'), fixed = keys && getComputedStyle(keys).position === 'fixed';
  const cut = fixed ? Math.round(keys.getBoundingClientRect().top + scrollY) : null;
  const rs = taps.filter(el => !(fixed && keys.contains(el))).map(el => el.getBoundingClientRect());
  const bottom = rs.length ? Math.round(Math.max(...rs.map(r => r.bottom)) + scrollY) : 0;
  const top = rs.length ? Math.round(Math.min(...rs.map(r => r.top)) + scrollY) : 0;
  const prompt = area.querySelector('.prompt, .clue-text, .tq, .sentence, .story, h2, h3, p');
  const clipped = el => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o !== 'visible') return true; } return false; };
  const wide = [...area.querySelectorAll('*')].filter(el => seen(el) && !clipped(el)).filter(el => { const r = el.getBoundingClientRect(); return r.right > W + 1 || r.left < -1; })
    .filter((el, i, a) => !a.includes(el.parentElement)).slice(0, 4).map(el => { const r = el.getBoundingClientRect(); return label(el) + ' ' + Math.round(r.left) + '..' + Math.round(r.right); });
  const small = taps.filter(el => { const r = el.getBoundingClientRect(); return (r.width < 44 || r.height < 44) && !el.matches('.nl, .sb'); /* .sb: the phonics sound dots have a 44 × 44 tap area of their own (::after) */ })
    .slice(0, 4).map(el => { const r = el.getBoundingClientRect(); return label(el) + ' ' + Math.round(r.width) + '×' + Math.round(r.height); });
  return { cut, W, H, scrollW: de.scrollWidth, scrollH: Math.max(de.scrollHeight, document.body.scrollHeight), taps: taps.length, top, bottom,
    question: prompt ? prompt.textContent.trim().replace(/\\s+/g, ' ').slice(0, 70) : '', wide, small };
})()`;

const server = await serve(PORT);
const chrome = await startChrome(DEBUG_PORT);
const cdp = await connect(chrome.ws);
const base = `http://127.0.0.1:${PORT}/`;
const evaluate = async expr => { const r = await cdp.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text); return r.result.value; };
const go = async url => { const loaded = cdp.once('Page.loadEventFired'); await cdp.send('Page.navigate', { url }); await loaded; await sleep(800); };
await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: PRELUDE });

const started = Date.now(), results = {};
let worlds = [];
try {
  await go(base + 'index.html');
  worlds = (await evaluate(`Meadow.worlds().map(w => ({ id: w.id, name: w.name, subject: w.subject, levels: w.levels.map(L => L.name || L.id) }))`))
    .filter(w => !only || only.some(o => w.id.includes(o)));
  for (const key of sizeKeys) {
    const size = SIZES[key]; results[key] = {};
    fs.mkdirSync(path.join(OUT, 'levels', key), { recursive: true });
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: size.w, height: size.h, deviceScaleFactor: 2, mobile: true });
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    try { await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: size.top, bottom: size.bottom, left: 0, right: 0 } }); } catch (e) {}
    for (const w of worlds) {
      const page = w.subject === 'maths' ? 'meadow-maths.html' : 'meadow-words.html';
      for (let n = 0; n < w.levels.length; n++) {
        const name = `${w.id.replace(/^y2-(maths|english)-/, '')}-L${n + 1}`, file = name + '.png';
        let r = null;
        for (let attempt = 1; attempt <= 2 && !(r && !r.error); attempt++) {
          try {
            await go(base + 'index.html'); await evaluate(MAKE_SAM);
            await evaluate(`localStorage.setItem('phone-check-full', '1'); localStorage.setItem('meadow-full-game', '1')`);
            await go(base + page);
            await evaluate(`Meadow.startLevel('${w.id}', Meadow.world('${w.id}').levels[${n}].id)`);
            await sleep(2200);
            await evaluate('scrollTo(0, 0)');
            r = await evaluate(MEASURE);
            const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(path.join(OUT, 'levels', key, file), Buffer.from(shot.data, 'base64'));
            r.file = file;
          } catch (e) { r = { error: e.message.split('\n')[0] }; }
        }
        results[key][name] = { world: w.name, level: n + 1, levelName: w.levels[n], ...r };
        const below = r.bottom - (r.cut != null ? r.cut : size.h - size.bottom);
        console.log(`${size.name.padEnd(12)} ${name.padEnd(22)} ${r.error ? 'FAILED ' + r.error : [r.scrollW > r.W + 1 && `${r.scrollW - r.W}px too wide`, below > 0 ? `answers end ${below}px below the screen` : 'answers on screen', r.small.length && `${r.small.length} small`].filter(Boolean).join(', ')}`);
      }
    }
  }
} finally { cdp.close(); chrome.proc.kill(); server.close(); try { fs.rmSync(chrome.profile, { recursive: true, force: true }); } catch (e) {} }

/* ---------- the report ---------- */
const today = new Date().toISOString().slice(0, 10);
const verdict = (k, r) => { if (!r) return '–'; if (r.error) return 'failed';
  const size = SIZES[k], below = r.bottom - (r.cut != null ? r.cut : size.h - size.bottom);
  return [r.scrollW > r.W + 1 ? `**${r.scrollW - r.W}px too wide**` : '', below > 0 ? `${below}px below` : 'on screen'].filter(Boolean).join(', '); };
let md = `# Level-by-level phone check\n\nMade by \`node tools/level-check.mjs\` on ${today}: the first question of every level, with the full game unlocked. Pictures (what the phone shows, before any scrolling) are in \`docs/phone-check/levels/<size>/\`; open \`docs/phone-check/levels.html\` to see them side by side.\n\n`;
md += `"On screen" means everything a child taps to answer (keys, tiles, slots, bowls, signposts, choices) is above the bottom of the screen without scrolling. "Npx below" means the last of them is that far down. Bonnie and Ask Bonnie are not counted: they sit under the answers on a phone. On a phone the number keys stay fixed at the bottom of the screen, so they are always in reach; the other taps are measured against the top of the keys. Questions are random, so a level can measure a little differently each run.\n\n`;
for (const w of worlds) {
  md += `## ${w.name}\n\n| Level | ${sizeKeys.map(k => SIZES[k].name).join(' | ')} | First question (${SIZES[sizeKeys[0]].name}) |\n|---|${sizeKeys.map(() => '---').join('|')}|---|\n`;
  for (let n = 0; n < w.levels.length; n++) {
    const name = `${w.id.replace(/^y2-(maths|english)-/, '')}-L${n + 1}`, r0 = results[sizeKeys[0]][name] || {};
    md += `| ${n + 1}. ${w.levels[n]} | ${sizeKeys.map(k => verdict(k, results[k][name])).join(' | ')} | ${(r0.question || '').replace(/\|/g, '/')} |\n`;
  }
  const notes = [];
  for (const k of sizeKeys) for (let n = 0; n < w.levels.length; n++) {
    const r = results[k][`${w.id.replace(/^y2-(maths|english)-/, '')}-L${n + 1}`]; if (!r) continue;
    if (r.wide && r.wide.length) notes.push(`- ${SIZES[k].name}, level ${n + 1}: past the edge: ${r.wide.map(x => '`' + x + '`').join(', ')}`);
    if (r.small && r.small.length) notes.push(`- ${SIZES[k].name}, level ${n + 1}: smaller than 44 × 44: ${r.small.map(x => '`' + x + '`').join(', ')}`);
  }
  md += (notes.length ? '\n' + notes.join('\n') + '\n' : '') + '\n';
}
fs.writeFileSync(path.join(OUT, 'LEVELS.md'), md);
const rows = worlds.flatMap(w => w.levels.map((_, n) => `${w.id.replace(/^y2-(maths|english)-/, '')}-L${n + 1}`));
fs.writeFileSync(path.join(OUT, 'levels.html'), `<!doctype html><meta charset="utf-8"><title>Level check</title>
<style>body{font:15px system-ui;margin:16px;background:#f4f1ea;color:#222}table{border-collapse:collapse}td,th{vertical-align:top;padding:8px;text-align:left}th{position:sticky;top:0;background:#f4f1ea}tr{border-top:1px solid #ddd}img{border:1px solid #ccc;border-radius:12px;display:block;margin-bottom:4px}</style>
<h1>Level-by-level phone check</h1><p>${today}. What the phone shows at the first question of each level, before any scrolling.</p>
<table><tr><th>Level</th>${sizeKeys.map(k => `<th>${SIZES[k].name}</th>`).join('')}</tr>
${rows.map(name => `<tr><th>${name}</th>${sizeKeys.map(k => { const r = results[k][name]; return r && r.file ? `<td><a href="levels/${k}/${r.file}"><img loading="lazy" src="levels/${k}/${r.file}" width="${SIZES[k].w * .55}"></a>${verdict(k, r)}</td>` : '<td>–</td>'; }).join('')}</tr>`).join('\n')}</table>`);
console.log(`\nDone in ${Math.round((Date.now() - started) / 1000)}s. Read docs/phone-check/LEVELS.md, or open docs/phone-check/levels.html.`);
