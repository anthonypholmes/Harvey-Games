// Checks every claim in docs/captains-cove-claims.js.   Run: node docs/captains-cove-check.mjs
import { readFileSync } from 'node:fs';
new Function(readFileSync(new URL('./captains-cove-claims.js', import.meta.url), 'utf8'))();
const C = globalThis.COVE_CLAIMS, errs = [], counts = {};
const bad = (lvl, m) => { if (errs.length < 80) errs.push(`${lvl}: ${m}`); };
const REPS = 2000;

// Level 1: the made-up claim's truth must match an independent check of its numbers
for (const T of C.TF) for (const easy of [false, true]) {
  if (easy && !T.easyOk) continue;
  for (let r = 0; r < REPS; r++) {
    const q = T.make(easy); counts['1 true-false'] = (counts['1 true-false'] || 0) + 1;
    if (T.check(q.nums) !== q.truth) bad('true-false', `${T.id}: "${q.text}" is marked ${q.truth}`);
    if (new Set(q.reasons).size !== 3) bad('true-false', `${T.id}: reasons repeat for "${q.text}"`);
    if (Object.values(q.nums).some(v => typeof v === 'number' && (v < 0 || !Number.isInteger(v)))) bad('true-false', `${T.id}: odd number in "${q.text}"`);
    if (q.reasons.some(x => /-\d|NaN|undefined/.test(x))) bad('true-false', `${T.id}: broken reason ${q.reasons}`);
  }
}

// Level 2: every chest answer must match trying the whole domain
for (const c of C.ASN) { counts['2 chests'] = (counts['2 chests'] || 0) + 1; if (C.asnOf(c) !== c.answer) bad('chests', `${c.id} is marked ${c.answer} but tests as ${C.asnOf(c)}`); }

// Level 3: busted claims must really fail, and the test buttons must include a counterexample; true ones never fail
for (const c of C.TEST) {
  counts['3 test-the-captain'] = (counts['3 test-the-captain'] || 0) + 1;
  if (C.testVerdictOf(c) !== c.verdict) bad('test', `${c.id} is marked ${c.verdict}`);
  const fails = c.tests.filter(x => !c.holds(x)).length;
  if (c.verdict === 'busted' && !fails) bad('test', `${c.id}: no test button busts it`);
  if (c.verdict === 'true' && fails) bad('test', `${c.id}: a test button fails`);
  if (c.tests.some(x => !c.domain.some(d => JSON.stringify(d) === JSON.stringify(x)))) bad('test', `${c.id}: a test button is outside the claim`);
}

// Level 4: read each step back and check it with plain arithmetic. Exactly one step is wrong.
function stepTrue(t, title) {
  let m;
  if ((m = t.match(/^(?:Check: )?(\d+) ([+−]) (\d+) = (\d+)$/))) return (m[2] === '+' ? +m[1] + +m[3] : m[1] - m[3]) === +m[4];
  if ((m = t.match(/^(\d+) = (\d+) \+ (\d+)$/))) return +m[1] === +m[2] + +m[3];
  if ((m = t.match(/^(\d+) has (\d+) tens and (\d+) ones$/))) return +m[1] === m[2] * 10 + +m[3];
  if ((m = t.match(/^(\d+) tens is (\d+)$/))) return m[1] * 10 === +m[2];
  if ((m = t.match(/^(\d+) needs (\d+) to make 10$/))) return +m[1] + +m[2] === 10;
  if ((m = t.match(/^Split (\d+) into (\d+) and (\d+)$/))) return +m[1] === +m[2] + +m[3];
  if ((m = t.match(/^Half of (\d+) is (\d+)$/))) return +m[1] === m[2] * 2;
  if ((m = t.match(/^(\d+) fives?: (\d+)$/))) return m[1] * 5 === +m[2];
  if ((m = t.match(/^(\d+) each: (\d+) used$/))) return m[1] * +title.match(/between (\d+)/)[1] === +m[2];
  return null;
}
for (const T of C.MIS) for (const easy of [false, true]) {
  if (easy && !T.easyOk) continue;
  for (let r = 0; r < REPS; r++) {
    const q = T.make(easy); counts['4 spot-the-mistake'] = (counts['4 spot-the-mistake'] || 0) + 1;
    const wrongs = [];
    q.steps.forEach((st, i) => {
      const okRight = stepTrue(st.text(st.right), q.title);
      if (okRight === null) bad('mistake', `${T.id}: can't read "${st.text(st.right)}"`);
      else if (!okRight) bad('mistake', `${T.id}: right value is wrong in "${st.text(st.right)}"`);
      if (st.shown !== undefined && st.shown !== st.right) {
        wrongs.push(i);
        if (stepTrue(st.text(st.shown), q.title) !== false) bad('mistake', `${T.id}: the mistake "${st.text(st.shown)}" is not a mistake`);
        if (st.shown < 0) bad('mistake', `${T.id}: negative mistake`);
      }
    });
    if (wrongs.length !== 1 || wrongs[0] !== q.wrong) bad('mistake', `${T.id}: wrong steps ${wrongs} (meant ${q.wrong}) in ${q.title}`);
  }
}

// Level 5: every picture claim is true
for (const P of C.PROVE) for (let r = 0; r < REPS; r++) {
  const v = P.make(); counts['5 prove-it'] = (counts['5 prove-it'] || 0) + 1;
  if (!P.check(v)) bad('prove', `${P.id}: "${v.text}" is not true`);
}

// Level 6: four different numbers, at least one right pick, and every set has a reason
for (const S of C.OOO) for (let r = 0; r < REPS; r++) {
  const items = S.make(); counts['6 odd-one-out'] = (counts['6 odd-one-out'] || 0) + 1;
  if (new Set(items).size !== 4 || items.some(n => n < 1 || n > 99)) bad('odd-one-out', `${S.id}: bad set ${items}`);
  const v = C.validPicks(items);
  if (!v.length) bad('odd-one-out', `${S.id}: no right answer in ${items}`);
  if (v.length && new Set(v.map(x => x.item)).size === 4) bad('odd-one-out', `${S.id}: every item is right in ${items}`);
}
const ex = C.validPicks([10, 15, 20, 24]).map(x => `${x.item}: ${x.reason}`);

console.log('Made and checked:', counts);
console.log('Claim bank sizes:', { 'true-false': C.TF.length, chests: C.ASN.length, 'test-the-captain': C.TEST.length, 'spot-the-mistake': C.MIS.length, 'prove-it': C.PROVE.length, 'odd-one-out sets': C.OOO.length, 'odd-one-out reasons': C.PROPS.length });
console.log('Chests:', ['always', 'sometimes', 'never'].map(a => `${a} ${C.ASN.filter(c => c.answer === a).length}`).join(', '));
console.log('Test the Captain:', `busted ${C.TEST.filter(c => c.verdict === 'busted').length}, looks true ${C.TEST.filter(c => c.verdict === 'true').length}`);
console.log('10, 15, 20, 24 →', ex);
console.log(errs.length ? `✗ ${errs.length} problems\n` + errs.join('\n') : '✓ Every claim checks out');
process.exit(errs.length ? 1 : 0);
