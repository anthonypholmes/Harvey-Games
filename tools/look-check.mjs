/* The meadow look's checks (js/meadow-look.js), on the real game pages, at phone and iPad sizes.
 *
 * Each check is built into its script and runs on a prototype-*.html test page: the real page with a pretend child,
 * so the family's save is never touched. This opens each one in Google Chrome (headless, its own storage per check)
 * at each size, waits for its results and prints them. Run with:
 *   node tools/look-check.mjs                       every check, a part-way child and a new one, every size
 *   node tools/look-check.mjs --only walk,shop      some of the checks (club, journal, maths, mlevel, mshop, words, wlevel, wshop, walk)
 *   node tools/look-check.mjs --demo later --size se,ipad --rm      one child, some sizes, Reduce Motion on
 * Exits with 1 if anything fails.
 */
import { serve, startChrome, connect, sleep } from './phone-lib.mjs';
import fs from 'node:fs';

const PORT = 8137, DEBUG_PORT = 9237, PARALLEL = 4, TIMEOUT = 120000;
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const CHECKS = {
  club: 'prototype-clubhouse.html?selftest=1',
  journal: 'prototype-clubhouse.html?journaltest=1',
  maths: 'prototype-maths-map.html?selftest=1',
  mlevel: 'prototype-maths-map.html?leveltest=1',
  mshop: 'prototype-maths-map.html?shoptest=1',
  words: 'prototype-words-map.html?selftest=1',
  wlevel: 'prototype-words-map.html?leveltest=1',
  wshop: 'prototype-words-map.html?shoptest=1',
  walk: 'prototype-walk.html?walktest=1',
};
const SIZES = { se: [375, 667], iphone: [393, 852], max: [430, 932], ipad: [768, 1024], ipad11: [820, 1180], land: [1180, 820] };
const only = arg('only', Object.keys(CHECKS).join(',')).split(','), demos = arg('demo', 'mid,new').split(','), sizes = arg('size', Object.keys(SIZES).join(',')).split(',');
const rm = process.argv.includes('--rm');

const jobs = [];
for (const c of only) for (const d of demos) for (const s of sizes) {
  if (!CHECKS[c] || !SIZES[s]) throw new Error('unknown check or size: ' + c + ' ' + s);
  jobs.push({ c, d, s, url: `http://127.0.0.1:${PORT}/${CHECKS[c]}&demo=${d}` });
}

const server = await serve(PORT);
// several checks run side by side: Chrome mustn't slow the timers of the tabs it thinks are in the background
const chrome = await startChrome(DEBUG_PORT, ['--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows']);
const browser = await connect((await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`)).json()).webSocketDebuggerUrl);
let failed = 0;

async function run(job) {
  const { browserContextId } = await browser.send('Target.createBrowserContext');
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank', browserContextId });
  const page = await connect(`ws://127.0.0.1:${DEBUG_PORT}/devtools/page/${targetId}`);
  const [w, h] = SIZES[job.s];
  let out;
  try {
    await page.send('Emulation.setFocusEmulationEnabled', { enabled: true }).catch(() => {});
    await page.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: false });
    if (rm) await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await page.send('Page.navigate', { url: job.url });
    const end = Date.now() + TIMEOUT;
    while (Date.now() < end) {
      await sleep(500);
      const r = await page.send('Runtime.evaluate', { expression: "(document.getElementById('selftest') || {}).textContent || ''", returnByValue: true }).catch(() => null);
      const t = r && r.result && r.result.value;
      if (t) { out = JSON.parse(t); break; }
    }
  } finally {
    page.close();
    await browser.send('Target.closeTarget', { targetId }).catch(() => {});
    await browser.send('Target.disposeBrowserContext', { browserContextId }).catch(() => {});
  }
  const name = `${job.c.padEnd(8)} ${job.d.padEnd(6)} ${job.s.padEnd(7)}${rm ? ' RM' : ''}`;
  if (!out) { failed++; console.log(`${name}  NO RESULT (timed out)`); return; }
  const bad = out.results.filter(x => !x.pass);
  if (bad.length) failed++;
  console.log(`${name}  ${out.passed} / ${out.of}${bad.length ? '' : '  ok'}`);
  for (const b of bad) console.log(`     FAIL ${b.name}${b.detail !== undefined ? ': ' + String(b.detail).slice(0, 300) : ''}`);
}

const queue = [...jobs];
await Promise.all(Array.from({ length: PARALLEL }, async () => { while (queue.length) await run(queue.shift()); }));
console.log(failed ? `\n${failed} of ${jobs.length} runs had failures` : `\nAll ${jobs.length} runs passed`);
browser.close(); chrome.proc.kill(); server.close();
try { fs.rmSync(chrome.profile, { recursive: true, force: true }); } catch (e) {}
process.exit(failed ? 1 : 0);
