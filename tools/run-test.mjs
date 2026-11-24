#!/usr/bin/env node
/* Run a test page in Google Chrome (headless) and print its results.
 *
 *   node tools/run-test.mjs tests/words-levels-test.html            the whole page
 *   node tools/run-test.mjs "tests/words-levels-test.html?world=stories"
 *
 * The page sets window.TEST_RESULT = { passed, failed, failures } when it has finished. Exit code 1 if anything failed.
 */
import { CHROME, serve, startChrome, connect, sleep } from './phone-lib.mjs';
import fs from 'node:fs';

const page = process.argv[2];
if (!page) { console.error('Which test page? e.g. node tools/run-test.mjs tests/words-levels-test.html'); process.exit(1); }
if (!fs.existsSync(CHROME)) { console.error('Google Chrome is needed: ' + CHROME); process.exit(1); }
const PORT = 8797, DEBUG_PORT = 9341;
const server = await serve(PORT);
const chrome = await startChrome(DEBUG_PORT);
const cdp = await connect(chrome.ws);
const evaluate = async expr => { const r = await cdp.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); return r.result && r.result.value; };
let code = 1;
try {
  await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 402, height: 874, deviceScaleFactor: 1, mobile: true });
  await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/${page}` });
  const t0 = Date.now();
  let res = null;
  while (!res && Date.now() - t0 < 10 * 60 * 1000) { await sleep(1000); res = await evaluate('window.TEST_RESULT || null'); }
  if (!res) { console.log('The page did not finish in 10 minutes.'); console.log(await evaluate("(document.body.innerText||'').slice(0, 2000)")); }
  else {
    console.log((await evaluate("document.querySelector('#report') ? document.querySelector('#report').innerText : ''")) || '');
    console.log(`\n${res.passed} passed, ${res.failed} failed (${Math.round((Date.now() - t0) / 1000)}s)`);
    code = res.failed ? 1 : 0;
  }
} finally { cdp.close(); chrome.proc.kill(); server.close(); }
process.exit(code);
