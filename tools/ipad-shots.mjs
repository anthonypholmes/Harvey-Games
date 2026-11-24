#!/usr/bin/env node
/* Pictures at iPad portrait size (768 × 1024) of the screens fixed on 24 November 2026: the Bone Shop rail,
 * the journal stamps, Four Kinds of Sentences after its end mark, and a solved spelling question.
 *
 *   node tools/ipad-shots.mjs
 *
 * Writes docs/review/ipad-portrait/*.jpg.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, CHROME, PRELUDE, MAKE_SAM, serve, startChrome, connect, sleep } from './phone-lib.mjs';

const OUT = path.join(ROOT, 'docs', 'review', 'ipad-portrait');
const PORT = 8795, DEBUG_PORT = 9344;
if (!fs.existsSync(CHROME)) { console.error('Google Chrome is needed: ' + CHROME); process.exit(1); }
const W = +(process.env.W || 768), H = +(process.env.H || 1024);
const PICK = `window.pick = (wid, lid, ok) => { const L = Meadow.world(wid).levels.find(L => L.id === lid);
  if (!L.__wrapped) { const p = L.play; L.play = (q, c) => { window.__item = q; return p(q, c); }; L.__wrapped = true; }
  for (let t = 0; t < 300; t++) { Meadow.startLevel(wid, lid); if (!ok || ok(window.__item)) return window.__item; } throw new Error('no question like that'); };
  window.$1 = s => document.querySelector(s); window.$all = s => [...document.querySelectorAll(s)];`;
/* [name, page, steps] */
const SHOTS = [
  ['shop-gear', 'meadow-words.html', `Meadow.shop()`],
  ['shop-gear-signs', 'meadow-words.html', `Meadow.shop(); setTimeout(() => { const r = $1('#psRail'), h = $all('.ps-head')[1]; r.style.scrollBehavior = 'auto'; r.scrollLeft = h.offsetLeft - 200; }, 400)`],
  ['shop-coats', 'meadow-words.html', `Meadow.shop(); setTimeout(() => $all('button').find(b => /Coats/.test(b.textContent)).click(), 300)`],
  ['journal-maths', 'index.html', `ProtoJournal.open({ page: 'maths' })`],
  ['journal-words', 'index.html', `ProtoJournal.open({ page: 'words' })`],
  ['four-kinds-end-mark', 'meadow-words.html', `pick('y2-english-sentences', 'four-kinds-of-sentences', it => /Wash your hands/.test(it.s)); $1('#m2Choices .m2-choice[data-v="command"]').click(); setTimeout(() => $1('#badges .badge[data-b="."]').click(), 200)`],
  ['four-kinds-exclamation', 'meadow-words.html', `pick('y2-english-sentences', 'four-kinds-of-sentences', it => /How tall that/.test(it.s)); $1('#m2Choices .m2-choice[data-v="exclamation"]').click(); setTimeout(() => $1('#badges .badge[data-b="!"]').click(), 200)`],
  ['spelling-solved', 'meadow-words.html', `pick('y2-english-phonics', 'same-sound-different-spelling', it => it.word === 'warm'); $all('#bank .tile').find(t => t.textContent === 'ar').click()`],
];
const server = await serve(PORT);
const chrome = await startChrome(DEBUG_PORT);
const cdp = await connect(chrome.ws);
const base = `http://127.0.0.1:${PORT}/`;
const evaluate = async expr => { const r = await cdp.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text); return r.result.value; };
const go = async url => { const loaded = cdp.once('Page.loadEventFired'); await cdp.send('Page.navigate', { url }); await loaded; await sleep(800); };
fs.mkdirSync(OUT, { recursive: true });
try {
  await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: PRELUDE });
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true });
  for (const [name, page, steps] of SHOTS) {
    await go(base + 'index.html'); await evaluate(MAKE_SAM);
    await evaluate(`localStorage.setItem('phone-check-full', '1'); localStorage.setItem('meadow-full-game', '1')`);
    await go(base + page); await evaluate(PICK);
    await evaluate(`(() => { ${steps} })()`); await sleep(1200);
    const shot = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 60 });
    fs.writeFileSync(path.join(OUT, `${name}-${W}x${H}.jpg`), Buffer.from(shot.data, 'base64'));
    console.log(`${name}-${W}x${H}.jpg`);
  }
} finally { cdp.close(); chrome.proc.kill(); server.close(); try { fs.rmSync(chrome.profile, { recursive: true, force: true }); } catch (e) {} }
