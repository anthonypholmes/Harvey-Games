#!/usr/bin/env node
/* Pictures of the new Meadow Words levels at their key moments (24 November 2026), for review.
 *
 *   node tools/words-shots.mjs                    every world
 *   node tools/words-shots.mjs --only stories     one world (stories, sentences or phonics)
 *
 * iPhone SE, iPhone 17 and an iPad on its side, as the App Store app with the full game. Writes
 * docs/review/words-expansion/<world>-<moment>-<size>.jpg and docs/review/words-expansion/index.html.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, CHROME, SIZES, PRELUDE, MAKE_SAM, serve, startChrome, connect, sleep } from './phone-lib.mjs';

const OUT = path.join(ROOT, 'docs', 'review', 'words-expansion');
const PORT = 8798, DEBUG_PORT = 9342;
const args = process.argv.slice(2), only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
if (!fs.existsSync(CHROME)) { console.error('Google Chrome is needed: ' + CHROME); process.exit(1); }
const SZ = { se: SIZES.se, 17: SIZES['17'], ipad: { name: 'iPad (landscape)', w: 1024, h: 768, top: 20, bottom: 0 } };

/* In the page: start a level until its question matches, then do some steps. */
const HELPERS = `
window.__item = null;
window.pick = (wid, lid, ok) => { const L = Meadow.world(wid).levels.find(L => L.id === lid);
  if (!L.__wrapped) { const p = L.play; L.play = (q, c) => { window.__item = q; return p(q, c); }; L.__wrapped = true; }
  for (let t = 0; t < 300; t++) { Meadow.startLevel(wid, lid); if (!ok || ok(window.__item)) return window.__item; } throw new Error('no question like that in ' + lid); };
window.$1 = s => document.querySelector(s); window.$all = s => [...document.querySelectorAll(s)];
window.ask = n => { for (let i = 0; i < n; i++) $1('#askBtn').click(); };
`;
/* Each picture: [world, name, sizes, steps (run in the page)] */
const SHOTS = [
  ['stories', 'L6-question', ['se', '17', 'ipad'], `pick('y2-english-stories', 'reading-between-the-lines', it => it.skill === 'feel' && /thunder/.test(it.q))`],
  ['stories', 'L6-evidence', ['se', '17', 'ipad'], `const it = pick('y2-english-stories', 'reading-between-the-lines', it => /thunder/.test(it.q)); $all('#opts .opt').find(b => b.dataset.o === 'sleepy').click(); $all('#opts .opt').find(b => b.dataset.o === it.answer).click();`],
  ['stories', 'L6-solved', ['se', 'ipad'], `const it = pick('y2-english-stories', 'reading-between-the-lines', it => /thunder/.test(it.q)); $all('#opts .opt').find(b => b.dataset.o === it.answer).click(); $all('#story .nk-s')[it.ev[0]].click();`],
  ['stories', 'L6-hint3-narrow', ['se'], `pick('y2-english-stories', 'reading-between-the-lines', it => /Ben feel/.test(it.q)); ask(3);`],
  ['stories', 'L7-prediction', ['se', '17'], `pick('y2-english-stories', 'what-happens-next', it => /seagull/.test(it.why))`],
  ['stories', 'L8-factfile', ['se', '17', 'ipad'], `pick('y2-english-stories', 'fact-files', it => it.kind === 'ev' && it.skill === 'vocab' && /nocturnal/.test(it.q))`],
  ['stories', 'L8-headings', ['se', 'ipad'], `pick('y2-english-stories', 'fact-files', it => it.kind === 'match' && it.extra.length); $all('#nkBank .nk-card')[0].click();`],
  ['stories', 'L9-order', ['se', '17', 'ipad'], `const it = pick('y2-english-stories', 'story-detective', it => it.kind === 'order' && it.events.length === 4 && /card/.test(it.why)); $all('#nkBank .nk-card').find(c => c.textContent === it.events[0]).click();`],
  ['stories', 'L9-order-wrong', ['se'], `const it = pick('y2-english-stories', 'story-detective', it => it.kind === 'order' && /card/.test(it.why)); [it.events[0], it.events[2], it.events[1], it.events[3]].forEach(x => $all('#nkBank .nk-card').find(c => c.textContent === x).click()); $1('#checkBtn').click();`],
  ['sentences', 'L6-commas', ['se', '17', 'ipad'], `pick('y2-english-sentences', 'comma-caterpillar', it => /Tom and Leo/.test(it.s)); $all('#m2Line .m2-gap').filter(g => /after (bread|milk)/.test(g.getAttribute('aria-label'))).forEach(g => g.click()); $1('#checkBtn').click();`],
  ['sentences', 'L6-commas-solved', ['se'], `pick('y2-english-sentences', 'comma-caterpillar', it => /Gran grows/.test(it.s)); $all('#m2Line .m2-gap').filter(g => /after (carrots|beans)/.test(g.getAttribute('aria-label'))).forEach(g => g.click()); $1('#checkBtn').click();`],
  ['sentences', 'L7-contraction', ['se', '17', 'ipad'], `pick('y2-english-sentences', 'apostrophe-adventures', it => it.full === 'can[no]t'); $all('#m2Letters .m2-letter').slice(3, 5).forEach(b => b.click());`],
  ['sentences', 'L7-ownership', ['se', 'ipad'], `pick('y2-english-sentences', 'apostrophe-adventures', it => it.kind === 'owner' && /cats/.test(it.s)); $all('#m2Line .m2-tap').find(b => b.textContent === 'cats').click();`],
  ['sentences', 'L7-why-apostrophe', ['se'], `pick('y2-english-sentences', 'apostrophe-adventures', it => it.kind === 'whyapos' && /raining/.test(it.s))`],
  ['sentences', 'L8-four-kinds', ['se', '17', 'ipad'], `pick('y2-english-sentences', 'four-kinds-of-sentences', it => /How tall that/.test(it.s))`],
  ['sentences', 'L8-end-mark', ['se', 'ipad'], `pick('y2-english-sentences', 'four-kinds-of-sentences', it => /Put your coat/.test(it.s)); $1('#m2Choices .m2-choice[data-v="command"]').click();`],
  ['sentences', 'L9-joining', ['se', '17', 'ipad'], `pick('y2-english-sentences', 'joining-sentences', it => /wet/.test(it.s)); $1('#m2Choices .m2-choice[data-v="but"]').click();`],
  ['sentences', 'L9-joining-solved', ['se'], `pick('y2-english-sentences', 'joining-sentences', it => /biscuit/.test(it.s)); $1('#m2Choices .m2-choice[data-v="if"]').click();`],
  ['phonics', 'L6-teach-card', ['se', '17', 'ipad'], `pick('y2-english-phonics', 'tricky-consonants', it => it.word === 'badge')`],
  ['phonics', 'L6-wrong-tile', ['se'], `pick('y2-english-phonics', 'tricky-consonants', it => it.word === 'huge'); $all('#bank .tile').find(t => t.textContent === 'dge').click();`],
  ['phonics', 'L6-solved', ['se', 'ipad'], `pick('y2-english-phonics', 'tricky-consonants', it => it.word === 'knock'); $all('#bank .tile').find(t => t.textContent === 'kn').click();`],
  ['phonics', 'L7-endings', ['se', '17', 'ipad'], `pick('y2-english-phonics', 'word-endings', it => it.word === 'camel')`],
  ['phonics', 'L7-hint3', ['se'], `pick('y2-english-phonics', 'word-endings', it => it.word === 'station'); ask(3);`],
  ['phonics', 'L8-change', ['se', '17', 'ipad'], `pick('y2-english-phonics', 'changing-words', it => it.root === 'hike')`],
  ['phonics', 'L8-change-solved', ['se', 'ipad'], `pick('y2-english-phonics', 'changing-words', it => it.root === 'hop'); $1('#spChoices .sp-choice[data-v="double"]').click();`],
  ['phonics', 'L9-suffix', ['se', '17', 'ipad'], `pick('y2-english-phonics', 'suffix-builders', it => it.root === 'care')`],
  ['phonics', 'L9-y-to-i', ['se'], `pick('y2-english-phonics', 'suffix-builders', it => it.root === 'happy'); $1('#spChoices .sp-choice[data-v="ness"]').click();`],
  ['phonics', 'L10-same-sound', ['se', '17', 'ipad'], `pick('y2-english-phonics', 'same-sound-different-spelling', it => it.word === 'donkey')`],
];

const server = await serve(PORT);
const chrome = await startChrome(DEBUG_PORT);
const cdp = await connect(chrome.ws);
const base = `http://127.0.0.1:${PORT}/`;
const evaluate = async expr => { const r = await cdp.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text); return r.result.value; };
const go = async url => { const loaded = cdp.once('Page.loadEventFired'); await cdp.send('Page.navigate', { url }); await loaded; await sleep(700); };
fs.mkdirSync(OUT, { recursive: true });
const made = [];
try {
  await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: PRELUDE });
  for (const [world, name, sizes, steps] of SHOTS) {
    if (only && world !== only) continue;
    for (const k of sizes) {
      const size = SZ[k];
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: size.w, height: size.h, deviceScaleFactor: 2, mobile: k !== 'ipad' || true });
      try { await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: size.top, bottom: size.bottom, left: 0, right: 0 } }); } catch (e) {}
      await go(base + 'index.html'); await evaluate(MAKE_SAM);
      await evaluate(`localStorage.setItem('phone-check-full', '1'); localStorage.setItem('meadow-full-game', '1')`);
      await go(base + 'meadow-words.html');
      await evaluate(HELPERS);
      await evaluate(`(() => { ${steps} })()`);
      await sleep(900);
      const file = `${world}-${name}-${k}.jpg`;
      const shot = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 62 });
      fs.writeFileSync(path.join(OUT, file), Buffer.from(shot.data, 'base64'));
      made.push({ world, name, k, file });
      console.log(file);
    }
  }
} finally { cdp.close(); chrome.proc.kill(); server.close(); try { fs.rmSync(chrome.profile, { recursive: true, force: true }); } catch (e) {} }

// the page that shows them (every picture in the folder, so one world can be made again on its own)
const all = fs.readdirSync(OUT).filter(f => f.endsWith('.jpg')).sort();
const groups = {};
all.forEach(f => { const m = /^(\w+)-(.+)-(se|17|ipad)\.jpg$/.exec(f); if (!m) return; ((groups[m[1]] ||= {})[m[2]] ||= []).push([m[3], f]); });
const label = { se: 'iPhone SE', 17: 'iPhone 17', ipad: 'iPad (landscape)' };
fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html><html lang="en-GB"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Meadow Words expansion</title>
<style>:root{--bg:#F6F0E2;--ink:#3D342A;--card:#FFFBF2;--line:#E2D6BE}@media (prefers-color-scheme:dark){:root{--bg:#1F1C17;--ink:#F1EADB;--card:#2A2620;--line:#40392F}}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,sans-serif}main{max-width:1200px;margin:0 auto;padding:20px 16px 60px}
h2{margin:36px 0 4px}h3{margin:22px 0 8px;font-size:17px}.row{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start}
figure{margin:0;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px}figure img{display:block;height:440px;width:auto;max-width:100%;object-fit:contain;border-radius:6px}figcaption{font-size:13px;margin-top:4px}</style>
<main><h1>Meadow Words: the new levels</h1><p>Made by <code>node tools/words-shots.mjs</code> (headless Chrome, as the App Store app with the full game, pretend player "Sam"). The grey band at the top is the phone's status bar.</p>
${Object.entries(groups).map(([w, moments]) => `<h2>${w}</h2>${Object.entries(moments).map(([m, fs2]) => `<h3>${m}</h3><div class="row">${fs2.sort((a, b) => ['se', '17', 'ipad'].indexOf(a[0]) - ['se', '17', 'ipad'].indexOf(b[0])).map(([k, f]) => `<figure><img src="${f}" alt="${w} ${m}, ${label[k]}" loading="lazy"><figcaption>${label[k]}</figcaption></figure>`).join('')}</div>`).join('')}`).join('')}
</main></html>`);
console.log(`\n${made.length} pictures. Open docs/review/words-expansion/index.html`);
