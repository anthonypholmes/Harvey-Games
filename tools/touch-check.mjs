/* Touch check: real finger drags and swipes at phone size (Chrome's touch emulation, the same events a finger makes).
 *
 *   node tools/touch-check.mjs              at iPhone SE size
 *   node tools/touch-check.mjs --size 17    another size (se, 17, max or ipad)
 *
 * It tries each thing a child does with a finger, and prints whether it worked:
 *   - dragging a letter tile into a slot (Phonics Forest)
 *   - dragging Bonnie along the number line (The Stepping Stone River)
 *   - typing a wrong answer on the number keys, and seeing Bonnie's message above them
 *   - swiping up to scroll a question that is taller than the screen (maths and English)
 */
import { CHROME, SIZES, PRELUDE, MAKE_SAM, serve, startChrome, connect, sleep } from './phone-lib.mjs';
import fs from 'node:fs';

const PORT = 8795, DEBUG_PORT = 9340;
const args = process.argv.slice(2), arg = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const size = SIZES[arg('--size') || 'se'];
if (!size) { console.error('Sizes are: ' + Object.keys(SIZES).join(', ')); process.exit(1); }
if (!fs.existsSync(CHROME)) { console.error('Google Chrome is needed: ' + CHROME); process.exit(1); }

const server = await serve(PORT), chrome = await startChrome(DEBUG_PORT), cdp = await connect(chrome.ws);
const base = `http://127.0.0.1:${PORT}/`;
const evaluate = async expr => { const r = await cdp.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text); return r.result.value; };
const go = async url => { const loaded = cdp.once('Page.loadEventFired'); await cdp.send('Page.navigate', { url }); await loaded; await sleep(800); };
/* A finger: down at (x1, y1), slide to (x2, y2) in small steps, then up. */
async function finger(x1, y1, x2, y2, steps = 14) {
  const pt = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1, radiusX: 8, radiusY: 8, force: 1 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(x1, y1) });
  for (let i = 1; i <= steps; i++) { await sleep(16); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x1 + (x2 - x1) * i / steps, y1 + (y2 - y1) * i / steps) }); }
  await sleep(16); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(700);
}
const centre = sel => evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return null; el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; })()`);
async function level(page, world, n = 0) {
  await go(base + 'index.html'); await evaluate(MAKE_SAM);
  await evaluate(`localStorage.setItem('phone-check-full', '1'); localStorage.setItem('meadow-full-game', '1')`);
  await go(base + page);
  await evaluate(`Meadow.startLevel('${world}', Meadow.world('${world}').levels[${n}].id)`);
  await sleep(2200);
}

await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: PRELUDE });
await cdp.send('Emulation.setDeviceMetricsOverride', { width: size.w, height: size.h, deviceScaleFactor: 2, mobile: true });
await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
try { await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: size.top, bottom: size.bottom, left: 0, right: 0 } }); } catch (e) {}

const results = [];
const check = (name, ok, detail) => { results.push(ok); console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ': ' + detail : ''}`); };
try {
  console.log(`${size.name} (${size.w} × ${size.h})\n`);

  // 1. a letter tile dragged into the first empty slot
  await level('meadow-words.html', 'y2-english-phonics');
  const tile = await centre('.bank .tile'), slot = await centre('.slot:not(.locked)');
  if (!tile || !slot) check('Phonics Forest: drag a letter into a slot', false, 'no tile or slot found');
  else {
    const before = await evaluate(`document.querySelectorAll('.slot .tile').length + document.querySelectorAll('.slot.bad').length`);
    const t = await centre('.bank .tile'), s = await evaluate(`(() => { const r = document.querySelector('.slot:not(.locked)').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
    await finger(t.x, t.y, s.x, s.y);
    const after = await evaluate(`({ filled: document.querySelectorAll('.slot .tile').length, bad: document.querySelectorAll('.slot.bad').length, ghost: !!document.querySelector('.drag-ghost'), scrolled: Math.round(scrollY) })`);
    check('Phonics Forest: drag a letter into a slot', after.filled + after.bad > before && !after.ghost,
      after.filled + after.bad > before ? (after.filled ? 'the letter went in' : 'the drop was felt (wrong letter, so it shook)') : 'nothing happened');
  }

  // 2. Bonnie dragged along the number line
  // a "put Bonnie on N" question: Bonnie is there and there are no answer buttons to pick from
  const dragQ = `!!document.querySelector('.mm #nl-pawn') && !document.querySelector('#area [data-choice], #area .choice')`;
  for (let i = 0; i < 12; i++) { await level('meadow-maths.html', 'y2-maths-number-lines', 1 + i % 4); if (await evaluate(dragQ)) break; }
  const dog = await centre('.mm .nl-dog'), line = await evaluate(`(() => { const r = document.querySelector('.mm #nl .nl-track'); if (!r) return null; const b = r.getBoundingClientRect(); return { left: b.left, right: b.right }; })()`);
  if (!dog || !line) check('Number line: drag Bonnie along it', false, 'no Bonnie or line found');
  else {
    const x0 = (await centre('.mm .nl-dog')).x, d = await centre('.mm .nl-dog');
    const to = Math.min(line.right - 10, d.x + 120);
    await finger(d.x, d.y, to, d.y, 20);
    const x1 = await evaluate(`document.querySelector('.mm .nl-dog').getBoundingClientRect().left + document.querySelector('.mm .nl-dog').getBoundingClientRect().width / 2`);
    check('Number line: drag Bonnie along it', Math.abs(x1 - x0) > 30, `she moved ${Math.round(x1 - x0)}px (the finger moved ${Math.round(to - d.x)}px)`);
  }

  // 3. the number keys: on a phone they stay at the bottom. Tap a wrong answer and Bonnie's message must come into view above them.
  await level('meadow-maths.html', 'y2-maths-number-bonds');
  const fixedKeys = await evaluate(`getComputedStyle(document.querySelector('#controls')).position === 'fixed'`);
  const tapKey = async k => { const p = await evaluate(`(() => { const r = document.querySelector('.mm .key[data-key="${k}"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`); await finger(p.x, p.y, p.x, p.y, 1); };
  for (const k of ['9', '9', '9', 'check']) await tapKey(k);
  await sleep(900);
  const seen = await evaluate(`(() => { const b = document.querySelector('#bubble').getBoundingClientRect(), k = document.querySelector('#controls').getBoundingClientRect(); const limit = getComputedStyle(document.querySelector('#controls')).position === 'fixed' ? k.top : innerHeight; return { top: Math.round(b.top), bottom: Math.round(b.bottom), limit: Math.round(limit), text: document.querySelector('#bubble').textContent.trim().slice(0, 50) }; })()`);
  check(`Number keys ${fixedKeys ? 'fixed at the bottom' : 'under the question'}: a wrong answer shows Bonnie's message`, seen.top >= 0 && seen.bottom <= seen.limit + 1,
    `her message is at ${seen.top}–${seen.bottom}px, the keys start at ${seen.limit}px ("${seen.text}")`);

  // 4. swipe up to scroll a question taller than the screen (starting on the question's words, not on a drag area)
  for (const [page, world, sel, label] of [['meadow-maths.html', 'y2-maths-number-bonds', '.mm .prompt', 'maths'], ['meadow-words.html', 'y2-english-phonics', '.clue-text', 'English']]) {
    await level(page, world);
    const tall = await evaluate(`document.documentElement.scrollHeight > innerHeight + 20`);
    if (!tall) { check(`Swipe up to scroll (${label})`, true, 'the question fits, nothing to scroll'); continue; }
    await evaluate('scrollTo(0, 0)');
    const p = await evaluate(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { x: r.left + 20, y: r.top + r.height / 2 }; })()`);
    await finger(p.x, Math.min(p.y + 150, size.h - 60), p.x, Math.max(p.y - 100, 80), 12);
    const y = await evaluate('Math.round(scrollY)');
    check(`Swipe up to scroll (${label})`, y > 20, `the page scrolled ${y}px`);
  }
} finally { cdp.close(); chrome.proc.kill(); server.close(); try { fs.rmSync(chrome.profile, { recursive: true, force: true }); } catch (e) {} }
console.log(`\n${results.filter(Boolean).length} of ${results.length} worked.`);
process.exit(results.every(Boolean) ? 0 : 1);
