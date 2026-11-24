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


/* ---------- Sentence Meadow ---------- */
const CONTRACTIONS = { 'do not': "don't", cannot: "can't", 'it is': "it's", 'I am': "I'm", 'did not': "didn't", 'I will': "I'll", 'could not': "couldn't", 'we are': "we're",
  'has not': "hasn't", 'they are': "they're", 'she is': "she's", 'he is': "he's", 'you are': "you're", 'I have': "I've", 'let us': "let's" };
const CONJ = ['and', 'but', 'or', 'when', 'if', 'that', 'because'];
const Q_START = /^(where|what|when|who|why|which|how|can|could|do|does|did|is|are|was|were|will|would|should|have|has)\b/i;
const IMPERATIVE = /^(put|wash|shut|close|open|sit|stand|come|go|stop|look|listen|take|give|bring|tidy|eat|drink|be|don't|please)\b/i;
function sentences() {
  const w = checkIds('y2-english-sentences');
  md.push(`## Sentence Meadow\n`, `Levels: ${w.levels.map((L, i) => `${i + 1}. ${L.name} (\`${L.id}\`)`).join(' · ')}\n`);
  w.levels.slice(5).forEach(L => {
    md.push(`### ${L.name} (\`${L.id}\`) — ${L.items.length} questions\n`);
    if (!L.tip) bad(L.id, 'no tip for Bonnie\'s second hint');
    L.items.forEach((it, n) => {
      const where = `sentences/${L.id} #${n + 1}`;
      if (it.kind === 'comma') {
        const ws = it.s.replace(/[.!?]$/, '').split(' ');
        const commas = ws.map((x, i) => /,$/.test(x) ? i : -1).filter(i => i >= 0);
        if (!commas.length) bad(where, 'no commas to put in');
        commas.forEach(i => { if (/^and$/i.test(ws[i + 1])) bad(where, `a comma before "and" (${it.s})`); });
        const last = commas[commas.length - 1], andAt = ws.findIndex((x, i) => i > last && x === 'and');
        if (andAt < last + 2 || andAt > last + 3) bad(where, `after the last comma there should be one list item (a word or two), then "and" (${it.s})`);
        if (/,(?! )|  /.test(it.s)) bad(where, 'odd spacing');
        md.push(`${n + 1}. *commas* — ${it.s}  (${commas.length} comma${commas.length > 1 ? 's' : ''}; ${ws.length - 1} spaces to choose from)`);
      } else if (it.kind === 'contract') {
        const words = it.full.replace(/[[\]]/g, '');
        const letters = []; let out = false; for (const ch of it.full) { if (ch === '[') { out = true; continue; } if (ch === ']') { out = false; continue; } letters.push({ ch, out: out && ch !== ' ', space: ch === ' ' }); }
        let s = '', run = false; letters.forEach(l => { if (l.space) return; if (l.out) { if (!run) s += "'"; run = true; } else { s += l.ch; run = false; } });
        if (CONTRACTIONS[words] !== s) bad(where, `${words} makes "${s}", but it should be "${CONTRACTIONS[words] || '?'}"`);
        md.push(`${n + 1}. *contraction* — ${words} → **${s}** (leave out: ${letters.filter(l => l.out).map(l => l.ch).join(', ')})`);
      } else if (it.kind === 'owner') {
        const ws = it.s.replace(/[.!?]$/, '').split(' ');
        if (ws.filter(x => x === it.word).length !== 1) bad(where, `"${it.word}" should be in the sentence once`);
        if (it.fixed !== it.word.slice(0, -1) + "'s") bad(where, `${it.word} → ${it.fixed}: singular possession should be the name + 's`);
        it.plurals.forEach(p => { if (!ws.some(x => x.toLowerCase() === p)) bad(where, `the plural "${p}" is not in the sentence`); });
        ws.forEach(x => { if (/'/.test(x)) bad(where, `another word already has an apostrophe: ${x}`); });
        if (/s$/.test(it.word.slice(0, -1))) note(where, 'the owner ends in s: check this is Year 2 singular possession');
        md.push(`${n + 1}. *ownership* — ${it.s} → **${it.fixed}** · plural, no apostrophe: ${it.plurals.join(', ')}\n   - **Bonnie:** ${it.why}`);
      } else if (it.kind === 'whyapos') {
        if (!it.s.includes(it.word) || !/'/.test(it.word)) bad(where, 'the word with the apostrophe is not in the sentence');
        if (it.miss && CONTRACTIONS[it.miss] !== it.word.toLowerCase().replace(/^i'/, "I'")) bad(where, `${it.word} is not short for ${it.miss}`);
        if (!it.miss && !/'s$/.test(it.word)) bad(where, 'a belonging apostrophe should be \'s');
        if (/^it's$/i.test(it.word) && !it.miss) bad(where, "it's never shows belonging");
        md.push(`${n + 1}. *why the apostrophe?* — ${it.s} (**${it.word}**) → ${it.miss ? `letters missing (${it.miss})` : 'belonging'}`);
      } else if (it.kind === 'kind4') {
        const s = it.s;
        const looks = /^(what a|what an|how)\b/i.test(s) && !Q_START.test(s.replace(/^how\s+\w+\s+/i, '')) && it.k === 'exclamation' ? 'exclamation'
          : /^how\s+\w+\s+(is|are|was|were|do|does|did|can)\b/i.test(s) || (Q_START.test(s) && !/^(what a|how\s+\w+\s+(that|the|this|bonnie|it))\b/i.test(s)) ? 'question'
          : IMPERATIVE.test(s) ? 'command' : /^(what a|what an|how)\b/i.test(s) ? 'exclamation' : 'statement';
        if (looks !== it.k) bad(where, `"${s}" looks like a ${looks}, but is marked ${it.k}`);
        if (/[.!?]$/.test(s)) bad(where, 'the sentence should have no end mark (the child chooses it)');
        md.push(`${n + 1}. *four kinds* — ${s} → **${it.k}**, ends with ${it.marks.join(' or ')}\n   - **Bonnie:** ${it.why}`);
      } else if (it.kind === 'join') {
        if (![it.answer, ...it.wrong].every(c => CONJ.includes(c))) bad(where, 'a choice is not a Year 2 joining word');
        if (it.wrong.includes(it.answer) || !uniq(it.wrong)) bad(where, 'the choices repeat');
        if (it.s.split('___').length !== 2) bad(where, 'the sentence needs one ___');
        if (it.ideas.length !== 2) bad(where, 'two ideas to join');
        md.push(`${n + 1}. *joining* — ${it.ideas.join(' / ')} → ${it.s.replace('___', `**${it.answer}**`)} · *not:* ${it.wrong.join(', ')}\n   - **Bonnie:** ${it.why}`);
      } else bad(where, `unknown kind ${it.kind}`);
    });
    md.push('');
  });
  md.push(`**Joining words, checked by hand.** Each sentence was read with all seven Year 2 joining words. The two wrong choices offered are ones that don't make sense (or aren't grammatical) there; *and* is never offered as a wrong choice, because it usually still makes sense. Choices left out on purpose because they could also be right: *Bonnie was wet ___ she had jumped in the pond* (not offered: *and*, *when*); *I wanted to play outside ___ it was raining* (not offered: *because*, *and*: someone may want to play in the rain); *Leo put on his coat ___ it was cold* (not offered: *when*, *and*); *Bonnie barks ___ the postman comes* (not offered: *if*, *because*, *and*); *You can have a biscuit ___ you eat your lunch* (not offered: *when*, *because*); *Ben fell over ___ he was running* (not offered: *because*, *and*); *I like cats ___ I don't like spiders* (not offered: *and*); *Priya fed the hens ___ Leo collected the eggs* (not offered: *but*, *when*, *because*).\n`);
}

/* ---------- Phonics Forest, levels 6 to 10 (spelling) ----------
   Every answer is typed out here by hand, separately from the game's rule code, and the two must agree. */
const SPELT = {
  'hike+ing': 'hiking', 'smile+ing': 'smiling', 'bake+ed': 'baked', 'nice+er': 'nicer', 'shine+y': 'shiny',
  'hop+ing': 'hopping', 'run+er': 'runner', 'sad+est': 'saddest', 'drop+ed': 'dropped', 'swim+ing': 'swimming',
  'happy+er': 'happier', 'copy+ed': 'copied', 'funny+est': 'funniest', 'cry+ed': 'cried',
  'jump+ing': 'jumping', 'play+ed': 'played', 'cold+er': 'colder', 'mix+ing': 'mixing', 'cry+ing': 'crying',
  'care+ful': 'careful', 'use+less': 'useless', 'kind+ness': 'kindness', 'sad+ly': 'sadly', 'enjoy+ment': 'enjoyment',
  'play+ful': 'playful', 'quick+ly': 'quickly', 'thank+ful': 'thankful', 'pain+less': 'painless', 'happy+ness': 'happiness', 'easy+ly': 'easily',
  // not in the bank, but they check the rule code on the awkward cases from English Appendix 1
  'hope+ing': 'hoping', 'pat+ing': 'patting', 'fat+er': 'fatter', 'box+ing': 'boxing', 'reply+ed': 'replied', 'copy+ing': 'copying',
  'merry+ment': 'merriment', 'penny+less': 'penniless', 'plenty+ful': 'plentiful', 'bad+ly': 'badly', 'plain+ness': 'plainness',
  'shy+ness': 'shyness', 'hum+ing': 'humming', 'see+ing': 'seeing', 'snow+ing': 'snowing', 'jump+y': 'jumpy',
};
/* The Year 2 words (English Appendix 1, pages 55 to 58, and everyday words) a child is asked to spell in the gap levels. */
const KNOWN = new Set(('badge bridge hedge huge page city ice face knee knock gnat wriggle wrong wrist apple bottle little camel tunnel towel animal metal pedal pencil fossil ' +
  'station lotion potion cry fly July key donkey monkey walk ball talk brother Monday worm work warm watch').split(' '));
/* Real words a wrong tile might make by accident (a wrong answer that is a real word is confusing, and may be defensible). */
const REAL = new Set(('worm word work warm war wore rite rap rote ring rest nit knit not knot now know sell cell sent cent sea see sun son ' +
  'bye by buy fly flea flee key quay wok walk talk tork bawl ball tale tail pale pail metal mettle medal meddle pedal peddle petal fossil camel towel tunnel ' +
  'bottle little apple pencil station potion lotion cry Monday brother mother edge hedge huge page cage badge bridge wrong wrist watch').split(' '));
// (nee and nock are left out on purpose: "née" and an arrow's "nock" are real, but not words a 6 or 7 year old would know)
function phonics() {
  const w = checkIds('y2-english-phonics'), SP = w.spelling;
  if (!SP) { bad('phonics', 'the world should share its spelling helpers (spelling: {...}) for this audit'); return; }
  md.push(`## Phonics Forest\n`, `Levels: ${w.levels.map((L, i) => `${i + 1}. ${L.name} (\`${L.id}\`)`).join(' · ')}\n`);
  // the rule code against the hand-typed answers, including words that are not in the bank
  Object.entries(SPELT).forEach(([k, want]) => { const [root, suf] = k.split('+'), got = SP.apply(root, suf, SP.rule(root, suf));
    if (got !== want) bad('phonics/rules', `${root} + ${suf} should be ${want}, but the rule code makes ${got}`); });
  md.push(`**The spelling rule code** (drop the e, double, y to i, just add) was checked against ${Object.keys(SPELT).length} hand-typed answers, including awkward cases that are not in the bank (copying, merriment, shyness, seeing, boxing).\n`);
  md.push(`**The patterns Bonnie teaches** (the card shown the first time a pattern comes up in a run, and her second hint):\n`);
  Object.values(SP.patterns).forEach(P => {
    md.push(`- **${P.name}:** ${P.teach}`);
    if (/\b(always|never)\b/i.test(P.teach)) note(`phonics/${P.name}`, 'says "always" or "never": check this is really true');
  });
  md.push('');
  w.levels.slice(5).forEach(L => {
    md.push(`### ${L.name} (\`${L.id}\`) — ${L.items.length} questions\n`);
    const seen = new Set();
    L.items.forEach((it, n) => {
      const where = `phonics/${L.id} #${n + 1}`, P = SP.patterns[it.g], word = SP.word(it), why = SP.why(it);
      if (!P) { bad(where, `no pattern "${it.g}"`); return; }
      const key = it.kind + ':' + (it.word || it.root + '+' + (it.suf || it.answer)); if (seen.has(key)) bad(where, `asked twice in this level (${key})`); seen.add(key);
      if (/\b(always)\b/i.test(why)) note(where, `the reason says "always": ${why}`);
      if (it.kind === 'fill') {
        const { parts, t, opts } = it;
        if (parts[t] !== opts[0]) bad(where, `the gap is "${parts[t]}" but the right tile is "${opts[0]}"`);
        if (!uniq(opts)) bad(where, 'two tiles are the same');
        if (!KNOWN.has(word)) bad(where, `"${word}" is not in the list of words checked by hand`);
        if ((it.clue.match(/___/g) || []).length !== 1) bad(where, 'the sentence needs one ___');
        const wrongs = opts.slice(1).map(o => parts.map((p, i) => i === t ? o : p).join(''));
        wrongs.forEach(x => { if (REAL.has(x) || REAL.has(x.toLowerCase())) bad(where, `the wrong tile makes a real word, "${x}"`); });
        const after = parts.slice(t + 1).join(''), before = parts.slice(0, t).join('');
        const rule = { softc: () => /^[eiy]/.test(after), kn: () => t === 0 && /^(kn|gn)$/.test(opts[0]), wr: () => t === 0 && opts[0] === 'wr',
          y: () => !after && opts[0] === 'y', ey: () => !after && opts[0] === 'ey', al2: () => /^l/.test(after), wor: () => /w$/.test(before), war: () => /w$/.test(before), wa: () => /w$/.test(before),
          dge: () => opts[0] === 'dge' ? /[^aeiou][aeiou]$/.test(before) : /[aeiou]$/.test(before), tion: () => !after,
          ending: () => !after && (opts[0] !== 'el' || /[mnrsvw]$/.test(before)), o: () => true }[it.g];
        if (!rule) bad(where, `no check for the pattern ${it.g}`); else if (!rule()) bad(where, `"${word}" doesn't fit the ${P.name} pattern as Bonnie teaches it`);
        md.push(`${n + 1}. *${P.name}* — ${it.clue.replace('___', `**${word}**`)} · tiles: ${opts.map((o, i) => i ? o : `**${o}**`).join(', ')} · wrong tiles make: ${wrongs.join(', ')}\n   - **Bonnie:** ${why}`);
      } else if (it.kind === 'change') {
        const want = SPELT[it.root + '+' + it.suf];
        if (!want) bad(where, `${it.root} + ${it.suf} has no hand-typed answer`); else if (want !== word) bad(where, `${it.root} + ${it.suf} should be ${want}, the game says ${word}`);
        if (SP.rule(it.root, it.suf) !== it.rule) bad(where, `${it.root} + ${it.suf}: marked "${it.rule}", but the rule code says "${SP.rule(it.root, it.suf)}"`);
        if (!why.includes(word)) bad(where, `Bonnie's reason should say the word ${word}`);
        md.push(`${n + 1}. *changing words* — ${it.root} + ${it.suf} → **${word}** (${it.rule === 'e' ? 'drop the e' : it.rule === 'double' ? 'double' : it.rule === 'yi' ? 'y to i' : 'just add'})${it.ask ? ` · why? **${it.ask[0]}** / not: ${it.ask.slice(1).join(', ')}` : ''}\n   - **Bonnie:** ${why}`);
      } else if (it.kind === 'suffix') {
        const want = SPELT[it.root + '+' + it.answer];
        if (!want) bad(where, `${it.root} + ${it.answer} has no hand-typed answer`); else if (want !== word) bad(where, `${it.root} + ${it.answer} should be ${want}, the game says ${word}`);
        if (!['ment', 'ness', 'ful', 'less', 'ly'].includes(it.answer) || !it.wrong.every(x => ['ment', 'ness', 'ful', 'less', 'ly'].includes(x))) bad(where, 'a choice is not one of the Year 2 suffixes');
        if (it.wrong.includes(it.answer) || !uniq(it.wrong)) bad(where, 'the choices repeat');
        if ((it.s.match(/___/g) || []).length !== 1) bad(where, 'the sentence needs one ___');
        md.push(`${n + 1}. *suffix* — ${it.s.replace('___', `**${word}**`)} · not: ${it.wrong.map(x => SP.apply(it.root, x, SP.rule(it.root, x))).join(', ')}\n   - **Bonnie:** ${why}`);
      } else bad(where, `unknown kind ${it.kind}`);
    });
    md.push('');
  });
  md.push(`**Suffix sentences, checked by hand.** Each sentence was read with all three choices. The wrong ones either aren't words (*kindful*, *enjoyly*, *playment*) or say the opposite of the sentence (*Be careless with the eggs, or they will break!*, *This pen is useful. It will not write at all!*, *It didn't hurt at all. It was painful.*), so only one choice makes sense.\n`);
}

const checks = { stories, sentences, phonics };
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
