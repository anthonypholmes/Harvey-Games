#!/usr/bin/env node
/* Does the player survive moving between pages? (24 November 2026, after the Meadow Words expansion)
 *
 *   node tools/cross-page-check.mjs
 *
 * As the App Store app (headless Chrome, a pretend player "Sam"): stars on the new Words levels, bones and the
 * full game are set once, then every page is opened in turn (Words, Maths, Grown-ups, the clubhouse, the walk,
 * and the Words shop and journal). Each page must read back the same player, stars, bones and purchase. Then the
 * purchase is taken away, to check the free-first-level rule is unchanged: level 1 of each world is free, and
 * levels 2 onwards (old and new) need the full game.
 */
import { CHROME, PRELUDE, MAKE_SAM, serve, startChrome, connect, sleep } from './phone-lib.mjs';
import fs from 'node:fs';

const PORT = 8796, DEBUG_PORT = 9343;
if (!fs.existsSync(CHROME)) { console.error('Google Chrome is needed: ' + CHROME); process.exit(1); }
const server = await serve(PORT);
const chrome = await startChrome(DEBUG_PORT);
const cdp = await connect(chrome.ws);
const base = `http://127.0.0.1:${PORT}/`;
const evaluate = async expr => { const r = await cdp.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text); return r.result.value; };
const go = async url => { const loaded = cdp.once('Page.loadEventFired'); await cdp.send('Page.navigate', { url }); await loaded; await sleep(900); };
const results = [], check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : '  — ' + detail}`); };

const STARS = { 'y2-english-stories/fact-files': 2, 'y2-english-sentences/comma-caterpillar': 1, 'y2-english-phonics/tricky-consonants': 3, 'y2-english-phonics/same-sound-different-spelling': 2 };
const READ = `(() => { const s = Meadow.save.load(); return { name: s.name, bones: s.bones, stars: s.stars, full: Meadow.fullGame.has(), errors: window.__errs || [] }; })()`;
try {
  await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: PRELUDE + ';window.__errs=[];addEventListener("error",e=>window.__errs.push(e.message));' });
  await go(base + 'index.html'); await evaluate(MAKE_SAM);
  await evaluate(`localStorage.setItem('phone-check-full', '1'); localStorage.setItem('meadow-full-game', '1');
    Meadow.save.mutate(s => { s.bones = 123; Object.assign(s.stars, ${JSON.stringify(STARS)}); })`);
  const want = await evaluate(READ);
  const pages = [['Words', 'meadow-words.html'], ['Maths', 'meadow-maths.html'], ['Grown-ups', 'grown-ups.html'], ['Clubhouse', 'index.html'], ['Walk', 'bonnies-walk.html'], ['Words again', 'meadow-words.html']];
  for (const [name, file] of pages) {
    await go(base + file);
    const got = await evaluate(READ);
    check(`${name}: same player (${got.name})`, got.name === want.name, got.name);
    check(`${name}: same bones (${got.bones})`, got.bones === want.bones, `${want.bones} -> ${got.bones}`);
    check(`${name}: every star, old and new levels`, JSON.stringify(got.stars) === JSON.stringify(want.stars), Object.keys(STARS).map(k => `${k}=${got.stars[k]}`).join(' '));
    check(`${name}: the full game is still bought`, got.full === true);
    check(`${name}: no errors`, !got.errors.length, got.errors.join(' | '));
  }
  // on the Words page: the shop and the journal open, and the journal counts the new levels' stars
  await go(base + 'meadow-words.html');
  await evaluate(`Meadow.shop()`); await sleep(400);
  check('Words: the shop opens and shows the same bones', await evaluate(`/123/.test(document.body.textContent) && !!document.querySelector('.shop, #shop, .modal-bg, [class*=shop]')`));
  // the journal (in the clubhouse): a stone for every level, and the new levels' stars counted
  await go(base + 'index.html');
  const j = await evaluate(`(() => { ProtoJournal.open({ page: 'words' }); const w = Meadow.world('y2-english-phonics'), s = ProtoJournal.stateOf(w);
    return { got: s.got, max: s.max, levels: s.stars.length, open: !!document.getElementById('pj') && !document.getElementById('pj').hidden }; })()`);
  const oldPhonics = await evaluate(`Meadow.world('y2-english-phonics').levels.slice(0, 5).reduce((n, L) => n + Meadow.stars('y2-english-phonics', L.id), 0)`);
  check('Clubhouse journal: opens, with all 10 Phonics Forest levels', j.open && j.levels === 10 && j.max === 30, JSON.stringify(j));
  check('...and counts the stars on the new levels', j.got === oldPhonics + 5, `${j.got} (old levels ${oldPhonics} + new 5)`);
  // the free-first-level rule, unchanged: take the purchase away
  await evaluate(`localStorage.removeItem('phone-check-full'); localStorage.removeItem('meadow-full-game')`);
  await go(base + 'meadow-words.html');
  const rule = await evaluate(`Meadow.worlds().filter(w => w.subject === 'english').map(w => ({ id: w.id, free: !Meadow.fullGame.paid(w, 0), paid: w.levels.slice(1).every((L, i) => Meadow.fullGame.paid(w, i + 1)) }))`);
  check('Without the full game: level 1 of every Words world is free', rule.every(r => r.free), JSON.stringify(rule));
  check('...and every later level, old and new, needs the full game', rule.every(r => r.paid), JSON.stringify(rule));
  check('...and the stars on the new levels are kept', JSON.stringify((await evaluate(READ)).stars) === JSON.stringify(want.stars));
} finally { cdp.close(); chrome.proc.kill(); server.close(); try { fs.rmSync(chrome.profile, { recursive: true, force: true }); } catch (e) {} }
const failed = results.filter(x => !x).length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
