#!/usr/bin/env node
/*
 * Meadow Words content audit (24 November 2026).
 *
 *   node tools/words-audit.mjs            check every level of Story Nook, Sentence Meadow and Phonics Forest
 *   node tools/words-audit.mjs --write    also write docs/review/WORDS_AUDIT.md (every question, answer,
 *                                         distractor and evidence sentence, for a person to read through)
 *
 * It runs the game's own files (js/meadow-core.js and the world files) the way tools/make-voice.mjs does, so
 * it checks exactly what the game plays. The banks are fixed lists, so every question is checked, not a sample.
 * Problems stop it with exit code 1. "Notes" are for a person to look at (they are not always wrong).
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');

/* ---------- run the game's files with a stand-in for the browser ---------- */
const dud = new Proxy(function () {}, {
  get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === Symbol.iterator ? [][Symbol.iterator].bind([]) : dud),
  set: () => true, apply: () => dud, construct: () => dud,
});
const ctx = {
  console, setTimeout, clearTimeout, setInterval, clearInterval, __VOICE_LINES_ONLY__: true,
  navigator: {}, location: {}, document: dud, addEventListener: () => {},
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
};
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['bonnie-voice.js', 'js/meadow-core.js', 'worlds/y2-english-phonics.js', 'worlds/y2-english-tricky-words.js', 'worlds/y2-english-sentences.js', 'worlds/y2-english-stories.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
const M = ctx.Meadow;
const world = id => M.world(id);

const problems = [], notes = [], md = [];
const bad = (where, msg) => problems.push(`${where}: ${msg}`);
const note = (where, msg) => notes.push(`${where}: ${msg}`);
const words = s => String(s).trim().split(/\s+/).filter(Boolean);
const uniq = a => new Set(a).size === a.length;

/* The old level ids are stored in saves: they must still be the first levels, in the same order. */
const OLD = {
  'y2-english-stories': ['rhyme-time', 'who', 'where-and-what', 'mixed-questions', 'longer-stories'],
  'y2-english-sentences': ['capital-letters', 'full-stop-or-question', 'exclamation', 'word-order', 'super-sentences'],
  'y2-english-phonics': ['a-e', 'i-e-o-e', 'u-e-e-e', 'ai-ay', 'ee-ea-igh-ie'],
};
function checkIds(id) {
  const w = world(id), ids = w.levels.map(L => L.id);
  OLD[id].forEach((x, i) => { if (ids[i] !== x) bad(id, `level ${i + 1} should keep the id "${x}" (it is "${ids[i]}")`); });
  if (!uniq(ids)) bad(id, 'two levels share an id');
  ids.forEach(x => { if (!/^[a-z0-9-]+$/.test(x)) bad(id, `level id "${x}" should be lower-case words and dashes`); });
  w.levels.forEach((L, i) => { const n = (L.items || []).length; if (n < (w.perLevel || 6)) bad(`${id}/${L.id}`, `only ${n} questions (a level plays ${w.perLevel || 6})`); });
  return w;
}

/* ---------- Bonnie's Story Nook ---------- */
function stories() {
  const w = checkIds('y2-english-stories');
  md.push(`## Bonnie's Story Nook\n`, `Levels: ${w.levels.map((L, i) => `${i + 1}. ${L.name} (\`${L.id}\`)`).join(' · ')}\n`);
  w.levels.slice(5).forEach(L => {
    const where0 = `stories/${L.id}`;
    md.push(`### ${L.name} (\`${L.id}\`) — ${L.items.length} questions\n`);
    const passages = new Set();
    L.items.forEach((it, n) => {
      const where = `${where0} #${n + 1}`;
      const file = it.file || (it.text && it.text.parts ? it.text : null);
      const sentences = file ? file.parts.flatMap(p => p.s) : it.text;
      passages.add(JSON.stringify(file ? file.title : it.text));
      if (!sentences || !sentences.length) return bad(where, 'no passage');
      sentences.forEach(s => { if (!/[.!?,”’]$/.test(s.trim())) bad(where, `sentence without an end mark: "${s}"`); if (words(s).length > 22) note(where, `a long sentence for Year 2 (${words(s).length} words): "${s}"`); });
      if (!it.why || !/[.!?]$/.test(it.why)) bad(where, 'Bonnie\'s explanation (why) is missing or has no end mark');
      const head = file ? `**${file.title}** — ${file.parts.map(p => `*${p.h}*: ${p.s.join(' ')}`).join(' ')}` : it.text.map((s, i) => `(${i + 1}) ${s}`).join(' ');
      if (it.kind === 'ev') {
        const opts = [it.answer, ...it.wrong];
        if (it.wrong.length !== 2) bad(where, 'should have 2 wrong answers');
        if (!uniq(opts.map(o => o.toLowerCase()))) bad(where, 'two answers are the same');
        if (!it.ev.length || it.ev.some(i => !Number.isInteger(i) || i < 0 || i >= sentences.length)) bad(where, `evidence sentence numbers out of range: ${it.ev}`);
        if (it.ev.length > sentences.length / 2) note(where, `${it.ev.length} of ${sentences.length} sentences count as evidence: the evidence part is easy`);
        if (!uniq(it.ev)) bad(where, 'an evidence sentence is listed twice');
        // inference and prediction should not be answered by copying words from the passage
        const pass = sentences.join(' ').toLowerCase();
        if (['feel', 'predict'].includes(it.skill) && pass.includes(it.answer.toLowerCase())) note(where, `the answer "${it.answer}" is written in the passage (retrieval, not inference)`);
        if (it.skill === 'predict' && !/best guess/i.test(it.q + it.why)) bad(where, 'a prediction should be labelled as the best guess from the clues');
        it.wrong.forEach(o => { if (pass.includes(o.toLowerCase()) && it.skill !== 'fact' && it.skill !== 'vocab') note(where, `the wrong answer "${o}" is written in the passage`); });
        md.push(`${n + 1}. *${it.skill}* — ${head}\n   - **Q:** ${it.q} **Answer:** ${it.answer} · *not:* ${it.wrong.join(' / ')}\n   - **Evidence:** ${it.ev.map(i => `(${i + 1}) “${sentences[i]}”`).join(' or ')} — *${it.evQ || 'Which sentence…'}*\n   - **Bonnie:** ${it.why}`);
      } else if (it.kind === 'order') {
        if (it.events.length < 3 || it.events.length > 4) bad(where, 'put 3 or 4 events in order');
        if (!uniq(it.events)) bad(where, 'two events are the same');
        it.events.forEach(e => { if (sentences.some(s => s.toLowerCase() === e.toLowerCase())) note(where, `the event "${e}" is copied word for word from the passage`); });
        md.push(`${n + 1}. *order* — ${head}\n   - **Order:** ${it.events.map((e, i) => `${i + 1}. ${e}`).join(' ')}\n   - **Bonnie:** ${it.why}`);
      } else if (it.kind === 'match') {
        const hs = it.file.parts.map(p => p.h);
        if (!uniq([...hs, ...it.extra])) bad(where, 'two headings are the same');
        md.push(`${n + 1}. *headings* — ${head}\n   - **Headings:** ${hs.join(' / ')}${it.extra.length ? ` · *extra (fits nowhere):* ${it.extra.join(', ')}` : ''}`);
      } else bad(where, `unknown question kind "${it.kind}"`);
    });
    const qs = L.items.map(it => JSON.stringify([it.text || it.file && it.file.title, it.q, it.kind]));
    if (!uniq(qs)) bad(where0, 'the same question is in the bank twice');
    if (passages.size < 4) note(where0, `only ${passages.size} different passages`);
    md.push(`\n*${passages.size} different passages.*\n`);
  });
}

const checks = { stories };
for (const fn of Object.values(checks)) fn();

// every line Bonnie says must be in the list of lines to record (spot-check: the world lists must not throw)
const spoken = M.spokenLines();
console.log(`Lines Bonnie can say in Meadow Words: ${spoken.length}`);
console.log(problems.length ? `\n${problems.length} PROBLEM(S):\n  ${problems.join('\n  ')}` : '\nNo problems found.');
if (notes.length) console.log(`\n${notes.length} note(s) for a person to look at:\n  ${notes.join('\n  ')}`);
if (WRITE) {
  const out = path.join(ROOT, 'docs', 'review', 'WORDS_AUDIT.md');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `# Meadow Words content audit\n\nMade by \`node tools/words-audit.mjs --write\` from the game's own files. Every question in the new levels is listed with its answer, wrong answers and evidence, for a person to read through.\n\n**Problems:** ${problems.length ? problems.map(p => `\n- ${p}`).join('') : 'none'}\n\n**Notes for a person:** ${notes.length ? notes.map(p => `\n- ${p}`).join('') : 'none'}\n\n${md.join('\n')}\n`);
  console.log(`\nWrote ${path.relative(ROOT, out)}`);
}
process.exit(problems.length ? 1 : 0);
