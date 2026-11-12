/*
 * Meadow Maths kit: the question screen that all the Year 2 maths worlds share.
 *
 * It draws the question (the sum, the blocks or pictures, the number line), the number
 * pad or answer buttons, and Bonnie's help ladder:
 *   tier 0 = on his own · 1 = a clue (Bonnie points) · 2 = the step card (small questions)
 *   · 3 = glowing buttons. A wrong answer or tapping "Ask Bonnie" moves one rung up.
 * Only tiers 2 and 3 count as help for stars (helpFrom: 2). A clue does not.
 *
 * Saving, bones, stars, the finish screen and the quiet easing all live in the core
 * (js/meadow-core.js). This file only tells the core what happened:
 *   Meadow.correct()   a right answer      Meadow.wrong()       a wrong one
 *   Meadow.helped(t)   help reached tier t  Meadow.askedBonnie()  Ask Bonnie was tapped
 *
 * A world file calls MeadowMaths.world({...}) with its levels. Each level has
 *   make(type, k, easy) → a question, plus name, blurb, eg, seq and a quest line.
 * Questions made with gq() carry their own clue and step card. For other questions
 * the world gives clue(q, K) and steps(q, K) (K: what the kit knows about the question).
 */
(() => {
'use strict';
const U = Meadow.ui, { $, $$, esc } = U;

/* ---------- small helpers the world files share ---------- */
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const NAME = () => U.fmt('{N}');
const reduced = () => U.reduceMotion();

// place value: one colour per place, used everywhere (blocks, digits, labels)
const PL = [
  { name: 'ones', one: 'one', colour: 'orange' },
  { name: 'tens', one: 'ten', colour: 'blue' },
  { name: 'hundreds', one: 'hundred', colour: 'green' },
  { name: 'thousands', one: 'thousand', colour: 'purple' },
];
const len = n => String(n).length;
const pow = p => 10 ** p;
function countsOf(n) { const s = String(n), c = {}; for (let i = 0; i < s.length; i++) c[s.length - 1 - i] = +s[i]; return c; }
function partsOf(n) { const s = String(n); return [...s].map((d, i) => +d * pow(s.length - 1 - i)).filter(v => v > 0); }
function joinAnd(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
function placeList(n) { const r = []; for (let p = len(n) - 1; p >= 0; p--) r.push(PL[p].name); return joinAnd(r); }
const nameCount = (c, p) => `${c} ${c === 1 ? PL[p].one : PL[p].name}`;
function colorNum(n, tag) {
  const s = String(n);
  return [...s].map((d, i) => { const p = s.length - 1 - i; return `<span class="d p${p}"${tag ? ` data-t="digit-${p}"` : ''}>${d}</span>`; }).join('');
}
// three small whole numbers around c, in order
function near(c) { const s = new Set([c, c + 1]); if (c > 0) s.add(c - 1); else s.add(c + 2); return [...s].sort((a, b) => a - b); }
// "4 tens makes…" → 4, 40, 400 (and 4000 for big numbers)
function makesChoices(c, L) { const r = []; for (let k = 0; k < Math.max(L, 3); k++) r.push(c * pow(k)); return [...new Set(r)]; }

// number lines
const rd = (v, dp = 0) => +(+v).toFixed(dp);
const fmtN = dp => v => (v < 0 ? '−' : '') + (dp ? Math.abs(v).toFixed(dp) : String(Math.abs(v)));
const range = (a, b, s, dp = 0) => { const r = [], n = Math.round((b - a) / s); for (let i = 0; i <= n; i++) r.push(rd(a + i * s, dp)); return r; };
// the right answer plus two believable wrong ones
function pick3(t, cands, dp = 0) { const others = [...new Set(cands.map(c => rd(c, dp)))].filter(c => c !== t); return shuffle([t, ...shuffle(others).slice(0, 2)]); }
const JUMPS = [1, 2, 5, 10, 50, 100];
function jumpOpts(s) { const i = JUMPS.indexOf(s); return [JUMPS[i - 1], JUMPS[i + 1], JUMPS[i + 2]].filter(Boolean); }

/* ---------- pictures ---------- */
const BONE_SHAPES = '<rect x="6" y="9.4" width="12" height="5.2" rx="1"/><circle cx="6" cy="9.6" r="2.9"/><circle cx="6" cy="14.4" r="2.9"/><circle cx="18" cy="9.6" r="2.9"/><circle cx="18" cy="14.4" r="2.9"/>';
const BONE = `<svg class="bone" viewBox="0 0 24 24" aria-hidden="true"><g fill="var(--ink)" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round">${BONE_SHAPES}</g><g fill="var(--bone)">${BONE_SHAPES}</g></svg>`;
const APPLE = '<svg class="apple" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7.5c0-2.2 1-3.6 2.6-4.2" stroke="#6b4f3a" stroke-width="1.6" fill="none" stroke-linecap="round"/><ellipse cx="15.8" cy="5.2" rx="2.8" ry="1.4" fill="#5FA35A" transform="rotate(-25 15.8 5.2)"/><circle cx="12" cy="14.5" r="7.6" fill="#E2574C" stroke="#9E2F27" stroke-width="1.4"/><ellipse cx="9" cy="11.6" rx="1.8" ry="2.4" fill="#fff" opacity=".45"/></svg>';
const PAW = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><ellipse cx="12" cy="16" rx="5" ry="4.2"/><circle cx="5.5" cy="10.5" r="2.3"/><circle cx="9.5" cy="6.5" r="2.4"/><circle cx="14.5" cy="6.5" r="2.4"/><circle cx="18.5" cy="10.5" r="2.3"/></svg>';
const ICON = {
  speak: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11"/></svg>',
  del: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5h11v14H9l-6-7z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/></svg>',
  turn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 11-2.3-5.6"/><path d="M20 4v4.5h-4.5"/></svg>',
};
const CARROT = '<svg class="carrot" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7c1-2.6 .4-4.6-.8-5.6M12 7c1.6-2 3.6-2.4 5.4-1.8M12 7c-1.4-1.6-3.6-2-5.2-1.2" stroke="#4E9A47" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M8.2 8.4c2.2-1.4 5.4-1.4 7.6 0 .8.6 1 1.6.6 2.6L12.9 21c-.4 1.1-1.4 1.1-1.8 0L7.6 11c-.4-1-.2-2 .6-2.6z" fill="#F08A2C" stroke="#A9541A" stroke-width="1.4" stroke-linejoin="round"/><path d="M9.6 12h2.2M10.4 15h2M11.1 18h1.2" stroke="#A9541A" stroke-width="1.2" stroke-linecap="round"/></svg>';
const itemSVG = k => (k === 'apple' ? APPLE : k === 'carrot' ? CARROT : BONE);
const sum = a => a.reduce((x, y) => x + y, 0);
const frac = (n, d) => `<span class="frac"><i>${n}</i><i>${d}</i></span>`;

// shapes cut into parts (for quarters and halves)
function wedge(a0, a1) {
  const p = a => [50 + 40 * Math.sin(a * Math.PI / 180), 50 - 40 * Math.cos(a * Math.PI / 180)].map(n => n.toFixed(1)).join(' ');
  return `M50 50 L${p(a0)} A40 40 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p(a1)} Z`;
}
const SHAPES = {
  sq4: [[10, 10, 40, 40], [50, 10, 40, 40], [50, 50, 40, 40], [10, 50, 40, 40]],
  strip4: [[10, 10, 20, 80], [30, 10, 20, 80], [50, 10, 20, 80], [70, 10, 20, 80]],
  sq4bad: [[10, 10, 26, 30], [36, 10, 54, 30], [36, 40, 54, 50], [10, 40, 26, 50]],
  rect3: [[8, 25, 28, 50], [36, 25, 28, 50], [64, 25, 28, 50]],
  rect2: [[10, 25, 40, 50], [50, 25, 40, 50]],
  ci4: [0, 90, 180, 270, 360], ci4bad: [0, 60, 200, 250, 360], ci2: [0, 180, 360], ci3: [0, 120, 240, 360],
};
function shapeSVG(kind, shade = 0) {
  const s = SHAPES[kind], fill = i => (i < shade ? 'var(--sun)' : '#fff');
  const parts = kind.startsWith('ci')
    ? s.slice(0, -1).map((a, i) => `<path d="${wedge(a, s[i + 1])}" fill="${fill(i)}"/>`)
    : s.map(([x, y, w, h], i) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill(i)}"/>`);
  return `<svg class="shape" viewBox="0 0 100 100" aria-hidden="true"><g stroke="var(--ink)" stroke-width="3" stroke-linejoin="round">${parts.join('')}</g></svg>`;
}

/* ---------- picture questions (Worlds 3 and 4) ----------
   Mostly 'boxes' (type the answer on the keypad) with a picture (q.vis) to play with:
   plates, an apple array to turn, an orchard grid to grow, bowls to share bones into,
   baskets to fill. Each question carries its own clue (gclue) and step card (gsteps). */
function gq(o) {
  const q = {
    type: 'g-' + o.t, kind: o.kind || 'boxes', mode: null, places: [], tip: o.tip || '',
    eq: o.eq || null, prompt: o.prompt, answer: o.answer, boxes: o.answer.length,
    vis: o.vis || null, showVisual: o.show !== false, choices: o.choices, cfmt: o.cfmt,
    gclue: o.clue, key: o.key || o.prompt + JSON.stringify(o.answer), n: o.answer[0],
  };
  q.gsteps = o.steps ? () => o.steps(q) : null;
  return q;
}
// the last step card: pick the answer and it drops into the box
const fillStep = (say, ans, cands, box = 0) => ({ say, choices: pick3(ans, cands.filter(v => v >= 0 && v !== ans)), answer: ans, fill: { box } });
const shareDone = v => sum(v.bowls) === v.N && v.bowls.every(b => b === v.bowls[0]);
const gridOk = v => v.r === v.tr && v.c === v.tc;
/* The burrow frame: a ten frame drawn as burrow holes, in rows of 5 (two frames for numbers up to 20).
   burrow({ n: holes, a, aItem, b, bItem, c, cItem, tap, item, pile, ten, cap }) makes the picture:
     the first a holes hold aItem (bones), the next b hold bItem (carrots), the next c hold cItem (apples).
     tap 'fill': tap an empty hole to drop in an item (pile = how many there are; leave out for no limit),
                 tap one you dropped to take it out.  tap 'take': tap a bone for Bonnie to eat it (tap again to put it back).
     ten: every item is a bag of 10.  cap(v): the line under the frame. Leave it out for a cheer with no
     numbers in it ("The first burrow is full!"); a caption that counts would give the answer away. */
function burrow(o) {
  const n = o.n || 10, a = o.a || 0, b = o.b || 0, c = o.c || 0;
  const holes = Array.from({ length: n }, (_, i) => ({ k: i < a ? (o.aItem || 'bone') : i < a + b ? (o.bItem || 'carrot') : i < a + b + c ? (o.cItem || 'apple') : '', mine: false, eaten: false }));
  return { type: 'burrow', holes, tap: o.tap || null, item: o.item || 'bone', pile: o.pile ?? null, ten: !!o.ten, cap: o.cap || null, last: -1 };
}
// count the holes that match: burrowCount(v) = filled (and not eaten), or pass a test of your own
const burrowCount = (v, f = h => h.k && !h.eaten) => v.holes.filter(f).length;
const burrowFull = (v, from = 0, to = v.holes.length) => v.holes.slice(from, to).every(h => h.k && !h.eaten);
const burrowPlaced = v => burrowCount(v, h => h.mine);

/* ---------- sound and speech (through the core, so the sound settings apply) ---------- */
const tone = (fs, d = .12, type = 'sine', vol = .15) => fs.forEach((f, i) => U.tone(f, d * 1.7, type, vol, 0, i * d));
const sfx = {
  tap: () => U.sfx.tap(),
  soft: () => tone([440, 392], .1, 'sine', .06),
  woof: () => U.sfx.woof(),
};
const say = text => U.say(String(text).replace(/<[^>]+>/g, '').replace(/−/g, 'minus'));

/* =========================================================
   THE QUESTION SCREEN
   ========================================================= */
const PRAISE = ['Brilliant, {N}!', 'Spot on!', 'You got it!', 'Super splitting!', 'Nailed it, {N}!', 'Amazing!', 'Top marks!', 'Well done, {N}!'];
const TEAM = ['You did it!', 'Great teamwork!', 'Brilliant, {N}!', 'You worked it out!'];
const NUDGE = ['Ooh, nearly!', 'Good try!', 'Let’s look together!'];
const SCOUT_LEADS = ['Bonnie sniffed out a clue!', 'Bonnie’s tail got in the way!', 'Woof! Bonnie’s nose found something!', 'Bonnie dug up a clue!'];
const TEAM_LEADS = ['Team Bonnie, go!', 'Bonnie needs your help!', 'Let’s do it together!'];
const TIER_NAMES = ['Solo', 'After a clue', 'Step by step', 'Guided taps'];

/* ---------- Teach Bonnie: Bonnie has a go and he checks her ----------
   Any question with one whole-number answer box can become one (the core asks for it with make({ teach: true })).
   Step 1: "That's right, Bonnie!" or "Oops, Bonnie!". Step 2, after Oops: he types the right answer on the pad.
   She's wrong about 2 times in 3, with a slip a child really makes, and never wrong by accident onto the answer. */
const TEACH = {
  ask: ['I’ve been practising! Am I right, {N}?', 'I’m not sure about this one. Am I right?', 'Let me have a go. Is that right, {N}?', 'I had a try at this one. Can you check it for me?'],
  oops: ['Oh! Thank you for checking. Can you show me the right answer?', 'Hmm, I mixed something up, didn’t I? What should it be?'],
  taught: ['You’re a brilliant teacher, {N}!', 'Of course! Thank you for showing me, {N}!', 'Now I get it. Thank you, {N}!'],
  phew: ['Phew! Thank you for checking my working, {N}!', 'Hooray, I got one right! Thank you for checking, {N}!'],
  sure: 'Hmm, are you sure? Let’s count it together.',
  didIt: 'Let’s check. I think I did get it this time!',
};
const TEACH_LINES = [...TEACH.ask, ...TEACH.oops, ...TEACH.taught, ...TEACH.phew, TEACH.sure, TEACH.didIt];
// Bonnie's slips: off by one, off by ten (or forgetting to exchange), the digits swapped. Never the answer itself.
function teachSlips(c) {
  const s = new Set(near(c));
  if (c >= 10) { s.add(c + 10); s.add(c - 10); }
  const t = Math.floor(c / 10), o = c % 10;
  if (c >= 10 && c <= 99 && o && t !== o) s.add(o * 10 + t);
  return [...s].filter(v => Number.isInteger(v) && v >= 0 && v !== c);
}
const teachable = q => !!q && q.kind === 'boxes' && !q.inter && !q.claim && !q.work && q.type !== 'split'
  && Array.isArray(q.answer) && q.answer.length === 1 && Number.isInteger(q.answer[0]) && q.answer[0] >= 0;
function teachify(q) {
  const c = q.answer[0], right = Math.random() < 1 / 3;
  q.teach = { right, said: right ? c : pick(teachSlips(c)) };
  return q;
}
const teaching = () => !!(S && S.q.teach && S.tstage === 0); // waiting for "right" or "oops"

const DEFS = {};        // the world files' own settings (clue and steps), by world id
const RAW = {};         // each world's levels as the world file wrote them (for helpLines)
let S = null;           // the question on screen
let askedLevel = false; // has Bonnie been asked yet this level (the first ask earns a bone)

const root = () => (S && S.ctx.area.isConnected ? $('#mm', S.ctx.area) : null);
const inMM = sel => { const r = root(); return r ? $(sel, r) : null; };
const allMM = sel => { const r = root(); return r ? $$(sel, r) : []; };
const live = () => !!(S && root() && !S.locked && !Meadow.isBusy());

// what world files may look at when they work out a clue or a step card
const K = {
  get S() { return S; },
  unsolvedBoxes: () => unsolvedBoxes(), targetFor: b => targetFor(b), inTarget: () => inTarget(),
  skipCount: (p, o) => skipCount(p, o),
};

function play(q, ctx) {
  if (ctx.first ?? ctx.index === 0) askedLevel = false;
  clearSkip();
  S = { q, ctx, values: Array(q.boxes || 1).fill(''), active: 0, locked: false, busy: false,
    tier: 0, steps: null, step: 0, solved: new Set(), tried: new Set(), cluePoint: null, zone: null,
    vstage: 0, vpick: null, vtried: new Set(), tested: [], mood: 'claim', wstage: 0, wtried: new Set(), tstage: 0 };
  if (q.teach) S.values[0] = String(q.teach.said);
  if (q.inter === 'break') { q.counts = countsOf(q.n); q.broke = 0; }
  S.pos = q.line ? (q.line.pawn === 'sit' ? q.line.sitAt : q.line.start) : null;
  ctx.area.classList.add('mm-area');
  renderGame();
  const st = Meadow.save.get();
  if (q.teach) { const line = S.teachAsk; U.whenQuiet(() => { if (S && S.q === q && teaching()) say(line); }); }
  else if (st && st.readAloud) say(readOut(q));
}
const readOut = q => (q.claim ? `${q.claim.text}. ` : '') + q.prompt + (q.teach && S && S.tstage === 0 ? ` Bonnie thinks it’s ${q.teach.said}. Is she right?` : '');

/* ---------- answer boxes ---------- */
const unsolvedBoxes = () => S.values.map((_, i) => i).filter(i => !S.solved.has(i));
// parts of a split still to be found (order of boxes doesn't matter for a split)
function remainingParts() {
  const rem = S.q.parts.slice();
  S.solved.forEach(i => { const j = rem.indexOf(+S.values[i]); if (j >= 0) rem.splice(j, 1); });
  return rem;
}
function targetFor(b) {
  const q = S.q;
  if (q.type !== 'split') return q.answer[b];
  return remainingParts()[unsolvedBoxes().indexOf(b)];
}
function boxResults(vals) {
  const q = S.q, res = vals.map((_, i) => S.solved.has(i));
  if (q.type === 'split') {
    const rem = remainingParts();
    vals.forEach((v, i) => { if (res[i]) return; const j = rem.indexOf(v); if (j >= 0) { res[i] = true; rem.splice(j, 1); } });
  } else vals.forEach((v, i) => { if (!res[i]) res[i] = v === q.answer[i]; });
  return res;
}
const buildTotal = () => S.q.places.reduce((a, p) => a + S.q.counts[p] * pow(p), 0);

/* ---------- Bonnie's help ladder ---------- */
const def = () => DEFS[S.ctx.world.id] || {};
function clueFor(q) {
  if (q.gclue) return q.gclue;
  return def().clue ? def().clue(q, K) : { say: 'Have another look.', point: 'visual' };
}
function stepsFor(q) {
  if (q.gsteps) return q.gsteps();
  return def().steps ? def().steps(q, K) : [];
}
// tell the core how far up the ladder this question went
function setTier(t) { S.tier = t; Meadow.helped(t); }

/* ---------- every help line, for recording Bonnie's voice ----------
   Clues and step cards are built from each question's numbers, so they're listed by making lots of questions for
   every level with a fixed run of "random" numbers (the same list every time, so the recorder only records new ones).
   Only sentences with no numbers in them are listed: those with numbers ("What goes with 4 to make 6?") come in
   thousands of versions, so they (and any line that has one) still use the device voice. */
const HELP_FIXED = ['Tap the glowing buttons.', 'Drag Bonnie into the green glow.', 'Have another look.'];
const helpLines = (worldId, per) => helpSentences(worldId, per).filter(s => !/\d/.test(s));
/* The sentences with numbers in them. They are not recorded whole: the recorder cuts them at each number and records
   the words in between once ("What goes with", "to make"), and Bonnie's voice joins those up with number clips. */
const numberLines = (worldId, per) => [...helpSentences(worldId, per).filter(s => /\d/.test(s)), 'Bonnie thinks it’s 5. Is she right?', 'Those do make 5!'];
const HELP_SEEN = {};
function helpSentences(worldId, per = 60) {
  if (HELP_SEEN[worldId + '/' + per]) return HELP_SEEN[worldId + '/' + per];
  const out = new Set(), keep = S, random = Math.random;
  let seed = 0x9E3779B9;
  Math.random = () => { seed = (seed + 0x6D2B79F5) >>> 0; let x = seed; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  const add = s => { if (typeof s === 'string' && s.trim()) out.add(s); };
  try {
    for (const L of RAW[worldId] || []) for (const type of L.seq ? [...new Set(L.seq)] : [undefined]) for (const eased of [false, true]) for (let k = 0; k < per; k++) {
      try {
        const q = L.make(type, k % 10, eased);
        S = { q, ctx: { world: { id: worldId }, area: { isConnected: false } }, values: Array(q.boxes || 1).fill(''), active: 0, tier: 0, steps: null, step: 0,
          solved: new Set(), tried: new Set(), vstage: 0, vtried: new Set(), tested: [], wstage: 0, wtried: new Set(), tstage: 0 };
        if (q.inter === 'break') { q.counts = countsOf(q.n); q.broke = 0; }
        S.pos = q.line ? (q.line.pawn === 'sit' ? q.line.sitAt : q.line.start) : null;
        add(q.prompt); if (q.claim) add(q.claim.text + '.'); // read out by the speaker button (readOut)
        add((clueFor(q) || {}).say);
        if (q.verdict) add(q.verdict.why);
        for (const st of stepsFor(q) || []) {
          if (!st) continue;
          add(st.say);
          // Bonnie's silly guess before a step (see advanceSteps)
          if (!st.action && !st.words && !st.onShow && st.choices && /^-?\d+$/.test(String(st.answer))) {
            const n = +st.answer;
            [n * 10, 100, 1000, n + 50, 99].filter(x => x !== n && !st.choices.map(String).includes(String(x))).forEach(x => add(`Is it ${x}?! Oops, silly me.`));
          }
        }
      } catch (e) { /* a question that needs the screen to work out its help: skipped */ }
    }
  } finally { Math.random = random; S = keep; }
  return (HELP_SEEN[worldId + '/' + per] = [...new Set([...out].flatMap(l => l.split(/(?<=[.!?…])\s+/)).filter(s => /[a-z]/i.test(s)))]);
}
const glowMsg = () => (S.q.kind === 'line' ? 'Drag Bonnie into the green glow.' : 'Tap the glowing buttons.');
// move one rung up the help ladder; source is 'ask' or 'wrong'
function raise(source, lead) {
  const q = S.q;
  if (source === 'wrong') { Meadow.wrong(null, { quiet: true }); if (!lead) lead = pick(NUDGE); }
  showVisual();
  if (S.tier === 0) {
    setTier(1);
    const c = clueFor(q);
    S.cluePoint = c.point;
    feedback('help', `<span><span class="big">${lead || pick(SCOUT_LEADS)}</span>${c.say}</span>`);
    say(c.say);
    renderControls();
    if (c.skip) skipCount(c.skip, { voice: false, delay: (Meadow.save.get() || {}).voice === false ? 300 : 3600 });
  } else if (S.tier === 1) {
    setTier(2);
    S.steps = stepsFor(q); S.step = 0;
    if (!S.steps.length) { askBonus(source); updateAsk(); return finishSteps(); }
    feedback('help', `<span><span class="big">${lead || pick(TEAM_LEADS)}</span>One little step at a time.</span>`);
    advanceSteps();
  } else {
    setTier(3); S.steps = null;
    renderControls();
    feedback('help', `<span><span class="big">${lead || pick(['Follow the glow!', 'Bonnie guessed a million! Oops!', 'Bonnie’s paws are pointing!'])}</span>${glowMsg()}</span>`);
    say(glowMsg());
  }
  askBonus(source);
  updateAsk();
}
function askBonus(source) {
  if (source !== 'ask') return;
  sfx.woof(); scoutTip(!askedLevel);
  askedLevel = true;
  Meadow.askedBonnie(inMM('#mmAsk'));
}

function advanceSteps() {
  if (S.step >= S.steps.length) return finishSteps();
  const st = S.steps[S.step];
  if (st.action && st.action()) { S.step++; return advanceSteps(); }
  renderControls();
  if (S.step > 0) feedback('help', `<span><span class="big">${pick(['Yes!', 'That’s it!', 'Good!'])}</span>Next little step.</span>`);
  // sometimes Bonnie makes a silly guess, so he gets to put her right
  if (!st.action && !st.words && !st.onShow && st.choices && /^-?\d+$/.test(String(st.answer)) && Math.random() < .35) {
    const n = +st.answer, silly = pick([n * 10, 100, 1000, n + 50, 99].filter(x => x !== n && !st.choices.map(String).includes(String(x))));
    feedback('help', `<span><span class="big">Bonnie guesses… ${silly}?!</span>Silly Bonnie! You show her.</span>`);
    say(`Is it ${silly}?! Oops, silly me. ${st.say}`);
  } else say(st.say);
  if (st.onShow) st.onShow();
}

function finishSteps() {
  const q = S.q;
  if (q.kind === 'boxes' && !unsolvedBoxes().length) return win();
  if (q.kind === 'build' && buildTotal() === q.n) return win();
  if (q.kind === 'line' && inTarget()) return win();
  if (q.kind === 'grid' && gridOk(q.vis)) return win();
  if (q.kind === 'steps' && S.wstage === 1 && !unsolvedBoxes().length) return win();
  // a verdict: the step card worked out the first answer, so fill it in and ask for the reason
  if (q.kind === 'verdict' && S.vstage === 0) {
    S.vpick = q.verdict.right[0]; S.vstage = 1; S.steps = null; renderControls(); updateAsk();
    feedback('help', `<span><span class="big">That’s it!</span>${esc(q.verdict.why)}</span>`);
    return say(q.verdict.why);
  }
  // something still isn't right (it was changed while stepping): guide the rest of the way
  setTier(3); S.steps = null; renderControls(); updateAsk();
  feedback('help', `<span><span class="big">Nearly there!</span>${glowMsg()}</span>`);
  say(glowMsg());
}

function chooseStep(i, btn) {
  if (!live() || S.busy) return;
  const st = S.steps[S.step], val = st.choices[i];
  if (String(val) === String(st.answer)) {
    S.busy = true;
    btn.classList.add('right'); clearSpots();
    if (st.final) { S.busy = false; return win(); }
    if (st.wstep) pickWrongStep();
    tone([660, 880], .07, 'triangle', .1);
    setMood('happy');
    if (st.fill && 'box' in st.fill) {
      S.values[st.fill.box] = String(val); S.solved.add(st.fill.box); paintBoxes();
      const b = inMM(`[data-t="box-${st.fill.box}"]`); if (b) { b.classList.remove('mpop'); void b.offsetWidth; b.classList.add('mpop'); }
    }
    if (st.fill && 'zone' in st.fill) { S.zone = st.fill.zone; paintLine(); }
    if (st.fill && 'count' in st.fill) { S.q.counts[st.fill.count] = val; redrawVisual(); }
    const q = S.q;
    setTimeout(() => { if (!S || S.q !== q || S.tier !== 2 || !root()) return; S.busy = false; S.step++; setMood('help'); advanceSteps(); }, 800);
  } else {
    btn.classList.add('faded'); btn.disabled = true;
    const ok = allMM('.mchip').find(b => String(st.choices[+b.dataset.chip]) === String(st.answer));
    clearSpots(); if (ok) ok.classList.add('spot');
    feedback('help', '<span><span class="big">Nearly!</span>Tap the glowing one.</span>');
    say('Nearly! Tap the glowing one.');
    sfx.soft();
  }
}

/* ---------- spotlight: a glow and a paw on whatever Bonnie means ---------- */
function clearSpots() { allMM('.spot').forEach(e => e.classList.remove('spot')); }
function spot(t) { clearSpots(); const el = inMM(`[data-t="${t}"]`); if (el) el.classList.add('spot'); }
function refreshSpots() {
  paintLine();
  if (!S || S.locked) return clearSpots();
  if (S.tier === 3) return applyGuide();
  if (S.tier === 2 && S.steps && S.steps[S.step]) { const p = S.steps[S.step].point; return p ? spot(p) : clearSpots(); }
  if (S.tier === 1 && S.cluePoint) return spot(S.cluePoint);
  clearSpots();
}
// tier 3: light up exactly the next thing to tap
function applyGuide() {
  const q = S.q;
  if (q.inter === 'break' && q.broke < q.k) return spot('rod');
  if (q.kind === 'line') return spot(inTarget() ? 'key-check' : 'pawn');
  if (q.kind === 'grid') return spot(gridOk(q.vis) ? 'key-check' : `cell-${q.vis.tr}-${q.vis.tc}`);
  if (q.kind === 'choice' || q.kind === 'chests') return spot(`choice-${q.answer[0]}`);
  if (q.kind === 'verdict') return spot(S.vstage === 0 ? `vpick-${q.verdict.right[0]}` : `vreason-${reasonsNow().answer}`);
  if (teaching()) return spot(`teach-${q.teach.right ? 1 : 0}`);
  if (q.kind === 'steps' && S.wstage === 0) return spot(`wstep-${q.work.wrong}`);
  if (q.kind === 'tester') {
    const t = q.tests, untried = i => !S.tested.includes(i);
    if (q.answer[0] === 0 && !S.tested.some(i => !t[i].ok)) return spot(`test-${t.findIndex((x, i) => !x.ok && untried(i))}`);
    if (!testerReady()) return spot(`test-${t.findIndex((_, i) => untried(i))}`);
    return spot(`choice-${q.answer[0]}`);
  }
  if (q.kind === 'build') {
    for (const p of q.places) {
      if (q.counts[p] < q.target[p]) return spot(`plus-${p}`);
      if (q.counts[p] > q.target[p]) return spot(`minus-${p}`);
    }
    return spot('key-check');
  }
  for (const b of unsolvedBoxes()) {
    const need = String(targetFor(b)), cur = S.values[b] || '';
    if (cur === need) continue;
    if (S.active !== b) { S.active = b; paintBoxes(); }
    return spot(need.startsWith(cur) ? `key-${need[cur.length]}` : 'key-del');
  }
  spot('key-check');
}

/* ---------- number line: drawing and dragging ---------- */
const inTarget = () => S.pos != null && Math.abs(S.pos - S.q.target) <= S.q.tol + 1e-9;

function lineHTML(q) {
  const L = q.line, pct = v => (v - L.min) / (L.max - L.min) * 100;
  const lab = new Set(L.labels.map(String)), maj = new Set([...L.labels, ...L.majors].map(String));
  const ticks = range(L.min, L.max, L.step, q.dp).map(v => {
    const k = String(v), isQ = L.mark !== null && v === L.mark;
    const text = isQ ? '?' : lab.has(k) ? q.fmt(v) : '';
    return `<div class="nl-tick${maj.has(k) || isQ ? ' major' : ''}${isQ ? ' q' : ''}${v === 0 && L.min < 0 ? ' zero' : ''}" style="left:${pct(v)}%" data-t="tick-${k}"><i></i>${text ? `<span class="nl-lab">${text}</span>` : ''}</div>`;
  }).join('');
  const start = L.start !== null ? `<div class="nl-start" style="left:${pct(L.start)}%" data-t="start"></div>` : '';
  const pawn = L.pawn ? `<div class="nl-pawn" id="nl-pawn" data-t="pawn"><span class="nl-val" id="nl-val" hidden></span><div class="nl-dog">${U.bonnieSVG()}</div><div class="nl-pin"></div></div>` : '';
  return `<div class="nl${L.pawn === 'drag' ? ' can-drag' : ''}${L.dense ? ' dense' : ''}" id="nl" data-t="line" aria-label="Number line from ${q.fmt(L.min)} to ${q.fmt(L.max)}">
    <div class="nl-track"><div class="nl-bar"></div>
      <div class="nl-zone soft" id="nl-zone" hidden></div><div class="nl-zone guide" id="nl-guide" hidden></div>
      ${ticks}${start}${pawn}</div></div>`;
}

// keep the pawn, the yellow "between" zone and the green guide zone in step with the state
function paintLine() {
  const q = S && S.q; if (!q || !q.line || !inMM('#nl')) return;
  const L = q.line, pct = v => (v - L.min) / (L.max - L.min) * 100;
  const pawn = inMM('#nl-pawn');
  if (pawn) {
    pawn.style.left = pct(S.pos ?? L.min) + '%';
    pawn.classList.toggle('waiting', S.pos == null && !S.locked);
    const val = inMM('#nl-val');
    val.hidden = !((S.locked && q.kind === 'line') || q.ask === 'between'); val.textContent = q.fmt(q.target);
  }
  const zone = (el, a, b) => { el.hidden = false; el.style.left = pct((a + b) / 2) + '%'; el.style.width = (pct(b) - pct(a)) + '%'; };
  const z = inMM('#nl-zone'); if (S.zone && !S.locked && S.tier !== 3) zone(z, ...S.zone); else z.hidden = true;
  const g = inMM('#nl-guide');
  if (S.tier === 3 && q.kind === 'line' && !S.locked) { const h = Math.max(q.tol, q.snap / 2); zone(g, Math.max(L.min, q.target - h), Math.min(L.max, q.target + h)); }
  else g.hidden = true;
  if (S.locked && L.mark !== null) { const l = inMM('.nl-tick.q .nl-lab'); if (l) l.textContent = q.fmt(q.target); }
}

// dragging (or tapping) Bonnie along the line; she snaps to the nearest allowed value
let dragId = null;
function posFromX(x) {
  const q = S.q, L = q.line, r = inMM('#nl .nl-track').getBoundingClientRect();
  const fr = Math.max(0, Math.min(1, (x - r.left) / r.width));
  const v = L.min + Math.round(fr * (L.max - L.min) / q.snap) * q.snap;
  return rd(Math.max(L.min, Math.min(L.max, v)), q.dp);
}
function movePawn(v) {
  if (v === S.pos) return;
  S.pos = v; tone([880], .03, 'triangle', .04);
  paintLine();
  if (S.tier === 3) applyGuide();
}
// in the step card a step can be "do this up there": doing it finishes the step
function afterMove() {
  const st = S && !S.locked && S.tier === 2 && S.steps && S.steps[S.step];
  if (!st || !st.action || !st.action()) return;
  const q0 = S.q; setMood('happy');
  setTimeout(() => { if (S && S.q === q0 && S.tier === 2 && !S.locked && st.action()) { S.step++; advanceSteps(); } }, 450);
}

/* ---------- picture questions: drawing and playing ---------- */
function gvisInner(q) {
  const v = q.vis, it = itemSVG(v.item);
  const many = n => Array.from({ length: n }, () => `<span class="gi">${it}</span>`).join('');
  const box = (n, extra = '', tag = 'div', attrs = '') => `<${tag} class="gv-box gv-${v.box}${extra}"${attrs}>${many(n)}</${tag}>`;
  switch (v.type) {
    case 'groups':
      return `<div class="gv-row">${Array.from({ length: v.g }, () => box(v.n)).join('')}</div>`;
    case 'array': {
      const r = v.turned ? v.c : v.r, c = v.turned ? v.r : v.c;
      return `<div class="gv-array" id="gv-array" style="grid-template-columns:repeat(${c}, var(--cell))">${many(r * c)}</div>
        ${v.label ? `<div class="gv-cap">${r} row${r > 1 ? 's' : ''} of ${c}</div>` : ''}
        ${v.turn ? `<button class="mbtn small plain" type="button" data-g="turn" data-t="g-turn">${ICON.turn} Turn the tree</button>` : ''}`;
    }
    case 'grid': {
      let cells = '';
      for (let i = 1; i <= 5; i++) for (let j = 1; j <= 10; j++) {
        const on = i <= v.r && j <= v.c;
        cells += `<span class="gv-cell${on ? ' on' : ''}" data-cell="${i}-${j}" data-t="cell-${i}-${j}">${on ? it : ''}</span>`;
      }
      return `<div class="gv-grid" id="gv-grid">${cells}</div><div class="gv-cap" id="gv-cap">${gridCap(v)}</div>`;
    }
    case 'share': {
      const pile = v.N - sum(v.bowls), fair = pile === 0 && shareDone(v);
      return `<div class="gv-pile">${pile ? many(pile) : '<span class="gv-empty">All shared out!</span>'}</div>
        <div class="gv-row">${v.bowls.map((b, i) => box(b, fair ? ' fair' : '', 'button', ` type="button" data-g-bowl="${i}" aria-label="${v.box === 'lily' ? 'Lily pad' : 'Bowl'} ${i + 1}"`)).join('')}</div>
        <div class="gv-tools"><button class="mbtn small" type="button" data-g="each" data-t="g-each">One each</button><button class="mbtn small plain" type="button" data-g="reset">Start again</button></div>
        ${fair ? '<div class="gv-cap good">Fair share! Every one has the same.</div>' : ''}`;
    }
    case 'group': {
      const pile = v.N - v.baskets * v.s;
      return `<div class="gv-pile">${pile ? many(pile) : '<span class="gv-empty">None left!</span>'}</div>
        <div class="gv-row">${Array.from({ length: v.baskets }, () => box(v.s)).join('')}</div>
        <div class="gv-tools"><button class="mbtn small" type="button" data-g="fill" data-t="g-fill" ${pile < v.s ? 'disabled' : ''}>Fill a basket</button><button class="mbtn small plain" type="button" data-g="reset">Start again</button></div>`;
    }
    case 'burrow': {
      const frames = [], tag = v.ten ? '<i class="bag10">10</i>' : '';
      for (let f = 0; f < v.holes.length; f += 10) {
        const cells = v.holes.slice(f, f + 10).map((h, j) => {
          const i = f + j, can = v.tap === 'fill' ? (!h.k || h.mine) : v.tap === 'take' ? (h.k && !h.mine) : false;
          const inner = h.k ? `<span class="gi${v.ten ? ' ten10' : ''}${i === v.last ? ' drop' : ''}">${itemSVG(h.k)}${tag}</span>` : '';
          const cls = `gv-hole${h.k ? ' full' : ''}${h.mine ? ' mine' : ''}${h.eaten ? ' eaten' : ''}`;
          return can ? `<button class="${cls}" type="button" data-g-hole="${i}" data-t="hole-${i}" aria-label="Burrow ${i + 1}${h.k ? (h.eaten ? ', eaten' : ', has a ' + (v.ten ? 'bag of 10' : h.k)) : ', empty'}">${inner}</button>`
            : `<span class="${cls}" data-t="hole-${i}">${inner}</span>`;
        }).join('');
        frames.push(`<div class="gv-burrow" data-t="frame-${f / 10}">${cells}</div>`);
      }
      const left = v.pile == null ? 0 : v.pile - burrowPlaced(v);
      const cap = v.cap ? v.cap(v) : burrowCap(v);
      return `${v.pile != null ? `<div class="gv-pile" data-t="pile">${left ? many(left) : '<span class="gv-empty">All in the burrows!</span>'}</div>` : ''}
        <div class="gv-row gv-burrows">${frames.join('')}</div>
        ${cap ? `<div class="gv-cap">${cap}</div>` : ''}
        ${v.tap ? '<div class="gv-tools"><button class="mbtn small plain" type="button" data-g="reset">Start again</button></div>' : ''}`;
    }
    case 'shape': return `<div class="gv-shape">${shapeSVG(v.shape, v.shade)}</div>`;
    case 'shapes': return `<div class="gv-row gv-shapes">${v.list.map(k => shapeSVG(k, 0)).join('')}</div>`;
  }
  return '';
}
// no numbers here: counting the burrows is his job, so the line under the picture never gives the answer away
function burrowCap(v) {
  if (v.tap !== 'fill') return '';
  if (burrowFull(v)) return 'Every burrow is full!';
  return burrowFull(v, 0, 10) && v.holes.length > 10 ? 'The first burrow is full!' : '';
}
const gridCap = v => (v.r ? `${v.r} row${v.r > 1 ? 's' : ''} of ${v.c} = ${v.r * v.c}` : 'Tap a square to grow the orchard');
function redrawG() { const el = inMM('#visual'); if (el && S.q.vis) el.innerHTML = gvisInner(S.q); refreshSpots(); }
// the orchard grid is repainted in place so a drag keeps going smoothly
function paintGrid() {
  const v = S.q.vis, it = itemSVG(v.item);
  allMM('#gv-grid [data-cell]').forEach(c => {
    const [i, j] = c.dataset.cell.split('-').map(Number), on = i <= v.r && j <= v.c;
    if (c.classList.contains('on') !== on) { c.classList.toggle('on', on); c.innerHTML = on ? it : ''; }
  });
  inMM('#gv-cap').textContent = gridCap(v);
}
// playing with the pictures (sharing, filling baskets, turning the tree)
function gAction(b) {
  const q = S.q, v = q.vis; if (!v || !live()) return;
  if (b.dataset.g === 'turn') {
    const a = inMM('#gv-array'); if (a) a.classList.add('turning');
    tone([520, 660, 780], .07, 'triangle', .08);
    setTimeout(() => { if (S && S.q === q && root()) { v.turned = !v.turned; redrawG(); afterMove(); } }, 560);
    return;
  }
  if (b.dataset.gHole !== undefined) {
    const i = +b.dataset.gHole, h = v.holes[i];
    v.last = -1;
    if (v.tap === 'fill' && h.mine) { h.k = ''; h.mine = false; sfx.tap(); }
    else if (v.tap === 'fill' && !h.k && (v.pile == null || burrowPlaced(v) < v.pile)) { h.k = v.item; h.mine = true; v.last = i; tone([520 + burrowCount(v) * 40], .05, 'triangle', .08); }
    else if (v.tap === 'take' && h.k && !h.mine) { h.eaten = !h.eaten; sfx.tap(); }
    else sfx.soft();
    redrawG();
    if (burrowFull(v, 0, 10) && v.holes.length >= 10 && v.tap === 'fill' && h.mine) tone([523, 659, 784], .08, 'triangle', .1);
    return afterMove();
  }
  if (b.dataset.gBowl !== undefined) {
    if (sum(v.bowls) < v.N) { v.bowls[+b.dataset.gBowl]++; sfx.tap(); } else sfx.soft();
  } else if (b.dataset.g === 'each') {
    for (let i = 0; i < v.bowls.length && sum(v.bowls) < v.N; i++) v.bowls[i]++;
    tone([600, 760], .05, 'triangle', .08);
  } else if (b.dataset.g === 'fill') {
    if (v.N - v.baskets * v.s >= v.s) { v.baskets++; tone([600, 760], .05, 'triangle', .08); }
  } else if (b.dataset.g === 'reset') {
    if (v.bowls) v.bowls.fill(0); if ('baskets' in v) v.baskets = 0;
    if (v.holes) { v.holes.forEach(h => { if (h.mine) { h.k = ''; h.mine = false; } h.eaten = false; }); v.last = -1; }
    sfx.tap();
  }
  redrawG();
  if (v.type === 'share' && shareDone(v)) tone([523, 659, 784], .08, 'triangle', .1);
  afterMove();
}
// growing the orchard grid: tap a square, or drag across
let gridDrag = null;
function setGridFrom(el) {
  const v = S.q.vis, [r, c] = el.dataset.cell.split('-').map(Number);
  if (r === v.r && c === v.c) return;
  v.r = r; v.c = c; tone([700 + r * 40 + c * 10], .03, 'triangle', .04);
  paintGrid();
  if (S.tier === 3) applyGuide();
}

/* ---------- blocks and counters (place value) ---------- */
const rodSVG = () => {
  let s = '<svg viewBox="0 0 10 100" preserveAspectRatio="none" aria-hidden="true"><rect x="0.75" y="0.75" width="8.5" height="98.5" rx="1" vector-effect="non-scaling-stroke"/>';
  for (let i = 1; i < 10; i++) s += `<line x1="0" x2="10" y1="${i * 10}" y2="${i * 10}" vector-effect="non-scaling-stroke"/>`;
  // two straps tie the ten cubes into one bundle
  s += '<rect class="band" x="0" y="18.5" width="10" height="3"/><rect class="band" x="0" y="78.5" width="10" height="3"/>';
  return s + '</svg><i class="ten-tag" aria-hidden="true">10</i>';
};
const cubeSVG = '<svg viewBox="0 0 10 10" aria-hidden="true"><rect x="0.75" y="0.75" width="8.5" height="8.5" rx="1" vector-effect="non-scaling-stroke"/></svg>';
function visualHTML(q, popFrom = -1) {
  return q.places.map(p => {
    const cnt = q.counts[p];
    let items = '';
    if (q.mode === 'blocks') {
      if (p === 1) {
        for (let i = 0; i < cnt; i++) {
          items += q.inter === 'break' && q.broke < q.k
            ? `<button class="ten" type="button" data-break data-t="rod" aria-label="Swap this ten for 10 ones">${rodSVG()}</button>`
            : `<span class="ten">${rodSVG()}</span>`;
        }
        items = `<div class="items${cnt ? '' : ' empty'}">${items}</div>`;
      } else {
        for (let i = 0; i < cnt; i++) items += `<span class="one${popFrom >= 0 && i >= popFrom ? ' mpop' : ''}">${cubeSVG}</span>`;
        items = `<div class="items${cnt ? '' : ' empty'}"><div class="ones">${items}</div></div>`;
      }
    } else {
      for (let i = 0; i < cnt; i++) items += `<span class="ctr">${pow(p)}</span>`;
      items = `<div class="items counters${cnt ? '' : ' empty'}">${items}</div>`;
    }
    const steps = q.inter === 'build'
      ? `<div class="steppers"><button class="mstep" type="button" data-step="-1" data-p="${p}" data-t="minus-${p}" aria-label="Take away one ${PL[p].one}">−</button><button class="mstep plus" type="button" data-step="1" data-p="${p}" data-t="plus-${p}" aria-label="Add one ${PL[p].one}">+</button></div>`
      : '';
    return `<div class="grp p${p}" data-t="place-${p}">${items}<div class="glabel"><b>${cnt}</b> ${cnt === 1 ? PL[p].one : PL[p].name}</div>${steps}</div>`;
  }).join('');
}

// counting in tens (and hundreds): tap the rods (or counters) and they count up one by one
let skipTimers = [];
function clearSkip() {
  skipTimers.forEach(clearTimeout); skipTimers = [];
  allMM('.skip-num').forEach(n => n.remove()); allMM('.counting').forEach(n => n.classList.remove('counting'));
}
function skipCount(p, { delay = 0, voice = true } = {}) {
  clearSkip();
  const g = inMM(`#visual .grp.p${p}`); if (!g || !S) return;
  const items = [...g.querySelectorAll(p === 1 && S.q.mode === 'blocks' ? '.ten' : '.ctr')]; if (!items.length) return;
  const seq = items.map((_, i) => (i + 1) * pow(p));
  if (voice) skipTimers.push(setTimeout(() => say(seq.join(', ') + '!'), delay));
  items.forEach((el, i) => skipTimers.push(setTimeout(() => {
    if (!el.isConnected) return;
    el.classList.add('counting');
    allMM('.skip-num').forEach(x => x.remove());   // one number at a time, above the rod being counted
    const n = document.createElement('b'); n.className = 'skip-num'; n.textContent = seq[i]; el.appendChild(n);
    tone([520 + i * 60], .09, 'triangle', .08);
  }, delay + 200 + i * 650)));
  skipTimers.push(setTimeout(clearSkip, delay + 200 + items.length * 650 + 1600));
}

/* ---------- drawing the question ---------- */
function eqHTML(q) {
  if (!q.eq) return '';
  let line = 0, h = `<div class="eqline" data-t="line-0">`;
  for (const t of q.eq) {
    if (t === '\n') { h += `</div><div class="eqline" data-t="line-${++line}">`; continue; }
    if (typeof t === 'string') { h += `<span class="op">${t}</span>`; continue; }
    if (t.box !== undefined) { h += `<button class="box" type="button" data-box="${t.box}" data-t="box-${t.box}" aria-label="Answer box ${t.box + 1}"></button>`; continue; }
    if (t.text) { h += `<span class="word">${t.text}</span>`; continue; }
    if (t.main !== undefined) { h += `<span class="num main" data-t="main">${colorNum(t.main, true)}</span>`; continue; }
    if (t.mark !== undefined) {
      const s = String(t.mark), at = s.length - 1 - t.pos;
      h += `<span class="num mark">${[...s].map((d, i) => i === at ? `<span class="hl" data-t="mark">${d}</span>` : d).join('')}</span>`; continue;
    }
    h += `<span class="num">${t.num}</span>`;
  }
  return `<div class="eq">${h}</div></div>`;
}
// a little story for every level, shown above the question
function questFor(q) {
  if (q.line && (q.ask === 'place' || q.ask === 'est')) return `Help Bonnie dig up her buried bone at ${q.fmt(q.target)}!`;
  return U.fmt(S.ctx.level.quest || '');
}

function renderGame() {
  const q = S.q, quest = questFor(q);
  if (q.teach) S.teachAsk = fresh(TEACH.ask);
  const hello = q.teach ? `<span><span class="big">I think it’s ${q.teach.said}!</span>${esc(U.fmt(S.teachAsk))}</span>` : S.ctx.warm ? 'Warm-up time! These ones are easy.' : (S.ctx.first ?? S.ctx.index === 0) ? (q.claim ? 'Let’s test the Captain’s conjecture!' : `Woof! Let’s go, ${esc(NAME())}!`)
    : q.kind === 'line' ? 'Drag me along the line!' : q.kind === 'grid' ? 'Tap a square to grow the orchard!' : q.kind === 'choice' ? 'Tap the answer.' : q.kind === 'verdict' ? 'Is the Captain right?' : q.kind === 'chests' ? 'Which chest does it go in?' : q.kind === 'tester' ? 'Tap a number to test it!' : q.kind === 'steps' ? 'Which step is wrong?' : q.kind === 'build' ? 'Tap + to build it.' : 'Tap the numbers to fill the box.';
  S.ctx.area.innerHTML = `<div class="mm" id="mm">
    <div class="play">
      <div class="mcard stage">
        ${S.ctx.walk ? '' : `<div class="lvl-name">${S.ctx.warm ? `<span class="warm-chip">🔥 Warm-up ${S.ctx.index + 1} of ${S.ctx.count}</span> ${esc(S.ctx.level.name)}` : `${q.teach ? '<span class="warm-chip teach-chip">🎓 Teach Bonnie</span> ' : ''}${esc(S.ctx.level.name)} · Question ${S.ctx.index + 1} of ${S.ctx.count}`}</div>`}
        ${quest ? `<div class="quest">${PAW}<span>${esc(quest)}</span></div>` : ''}
        <div class="prompt-row">
          <div class="prompt">${q.prompt}</div>
          <button class="micon" type="button" id="mmSay" aria-label="Read the question out loud">${ICON.speak}</button>
        </div>
        ${q.claim ? claimHTML(q) : ''}
        ${q.tip ? `<div class="tip">${q.tip}</div>` : ''}
        ${eqHTML(q)}
        ${q.kind === 'tester' ? `<div class="tester" id="tester">${testerHTML(q)}</div>` : ''}
        ${q.kind === 'steps' ? `<div class="work" id="work" data-t="work">${workHTML(q)}</div>` : ''}
        ${q.line ? lineHTML(q) : ''}
        ${q.vis ? `<div class="visual gvis" id="visual" data-t="visual" ${q.showVisual ? '' : 'hidden'}>${gvisInner(q)}</div>` : ''}
        ${q.mode ? `<div class="visual" id="visual" data-t="visual" ${q.showVisual ? '' : 'hidden'}>${visualHTML(q)}</div>` : ''}
        ${q.inter === 'break' ? `<div class="vis-tools"><button class="mbtn plain small" type="button" id="putback">Put the tens back</button></div>` : ''}
      </div>
      <div class="side">
        <div class="helper">
          <div class="buddy">${U.bonnieHTML('', 'gameBonnie')}
            <div class="feedback" id="bubble" role="status" aria-live="polite">${hello}</div></div>
          <button class="mbtn ask" type="button" id="mmAsk"></button>
        </div>
        <div id="controls"></div>
      </div>
    </div></div>`;
  renderControls(); paintBoxes(); updateAsk();
}

function renderControls() {
  const q = S.q, el = inMM('#controls'); if (!el) return;
  const pb = inMM('#putback'); if (pb) pb.hidden = S.tier >= 2;
  if (S.tier === 2 && S.steps && S.steps[S.step]) {
    const st = S.steps[S.step];
    el.innerHTML = `<div class="mcard stepcard">
      <div class="mstep-dots" aria-label="Step ${S.step + 1} of ${S.steps.length}">${S.steps.map((_, i) => `<i class="${i < S.step ? 'past' : i === S.step ? 'now' : ''}"></i>`).join('')}</div>
      <div class="mstep-say">${st.say}</div>
      ${st.action ? `<div class="mstep-wait">${PAW} ${st.wait || 'Tap it up there!'}</div>`
        : `<div class="chips${st.words ? ' words' : ''}">${st.choices.map((c, i) => `<button class="mchip${st.words ? ' word' : ''}" type="button" data-chip="${i}">${c}</button>`).join('')}</div>`}
    </div>`;
  } else if (teaching()) {
    const b = (v, label) => `<button class="choice${S.tried.has('teach-' + v) ? ' faded' : ''}" type="button" data-teach="${v}" data-t="teach-${v}" ${S.tried.has('teach-' + v) ? 'disabled' : ''}>${label}</button>`;
    el.innerHTML = `<div class="teach"><div class="teach-card">${PAW}<span>Bonnie’s answer</span><b>${q.teach.said}</b></div>
      <div class="choices wordy">${b(1, 'That’s right, Bonnie!')}${b(0, 'Oops, Bonnie!')}</div></div>`;
  } else if (q.kind === 'steps' && S.wstage === 0) {
    el.innerHTML = '<div class="wait-note big">Tap the step with the mistake.</div>';
  } else if (q.kind === 'boxes' || q.kind === 'steps') {
    el.innerHTML = `<div class="pad" id="pad">
      ${[7, 8, 9, 4, 5, 6, 1, 2, 3].map(d => `<button class="key" type="button" data-key="${d}" data-t="key-${d}">${d}</button>`).join('')}
      <button class="key del" type="button" data-key="del" data-t="key-del" aria-label="Delete">${ICON.del}</button>
      <button class="key" type="button" data-key="0" data-t="key-0">0</button>
      <button class="key check" type="button" data-key="check" data-t="key-check">Check</button>
    </div>`;
  } else if (q.kind === 'verdict') {
    const v = q.verdict;
    if (S.vstage === 0) {
      el.innerHTML = `<div class="choices wordy${v.picks.length > 2 ? ' four' : ''}">${v.picks.map((c, i) => `<button class="choice${S.tried.has(i) ? ' faded' : ''}" type="button" data-vpick="${i}" data-t="vpick-${i}" ${S.tried.has(i) ? 'disabled' : ''}>${c}</button>`).join('')}</div>`;
    } else {
      const r = reasonsNow();
      el.innerHTML = `<div class="reasons"><div class="picked">${PAW}<span>${esc(v.picks[S.vpick])}</span></div>
        <div class="why">How do you know?</div>
        ${r.list.map((c, i) => `<button class="reason${S.vtried.has(i) ? ' faded' : ''}" type="button" data-vreason="${i}" data-t="vreason-${i}" ${S.vtried.has(i) ? 'disabled' : ''}>${esc(c)}</button>`).join('')}</div>`;
    }
  } else if (q.kind === 'chests') {
    el.innerHTML = `<div class="chests n${q.choices.length}">${q.choices.map(c => `<button class="chest${S.tried.has(c) ? ' faded' : ''}" type="button" data-choice="${c}" data-t="choice-${c}" ${S.tried.has(c) ? 'disabled' : ''}>${CHEST}<b>${q.cfmt(c)}</b></button>`).join('')}</div>`;
  } else if (q.kind === 'tester') {
    const ready = testerReady();
    el.innerHTML = `<div class="verdicts">${ready ? '' : '<div class="wait-note">Test at least 2 first!</div>'}
      <div class="choices wordy">${q.choices.map(c => `<button class="choice${S.tried.has(c) ? ' faded' : ''}" type="button" data-choice="${c}" data-t="choice-${c}" ${S.tried.has(c) || !ready ? 'disabled' : ''}>${q.cfmt(c)}</button>`).join('')}</div></div>`;
  } else if (q.kind === 'choice') {
    el.innerHTML = `<div class="choices${q.cfmt ? ' wordy' : ''}">${q.choices.map(c => `<button class="choice${S.tried.has(c) ? ' faded' : ''}" type="button" data-choice="${c}" data-t="choice-${c}" ${S.tried.has(c) ? 'disabled' : ''}>${q.cfmt ? q.cfmt(c) : q.fmt ? q.fmt(c) : c}</button>`).join('')}</div>`;
  } else {
    el.innerHTML = `<div class="actions"><button class="mbtn" type="button" data-key="check" data-t="key-check">Check</button></div>`;
  }
  refreshSpots();
}

function updateAsk() {
  const b = inMM('#mmAsk'); if (!b) return;
  const label = ['Ask Bonnie for help', 'Show me step by step', 'Show me where to tap', 'Ask Bonnie again'][S.tier];
  b.innerHTML = `${PAW} ${label}${!askedLevel && !S.locked ? `<span class="ask-bonus">+1${BONE}</span>` : ''}`;
  b.disabled = S.locked;
}
function paintBoxes() {
  allMM('.box').forEach(b => {
    const i = +b.dataset.box;
    b.textContent = S.values[i] || '';
    b.classList.toggle('good', S.solved.has(i));
    b.classList.toggle('bonnie', teaching());
    b.classList.toggle('active', i === S.active && !S.locked && !S.solved.has(i));
  });
}
function feedback(kind, html) {
  const fb = inMM('#bubble'); if (!fb) return;
  fb.className = 'feedback ' + kind; fb.innerHTML = html;
  setMood(kind === 'good' ? 'happy' : kind === 'help' ? 'help' : 'idle');
}
function setMood(m) { const b = inMM('#gameBonnie'); if (b) b.dataset.mood = m; }
function showVisual() { const v = inMM('#visual'); if (v && v.hidden) v.hidden = false; }
function redrawVisual(popFrom) {
  const v = inMM('#visual'); if (v) v.innerHTML = visualHTML(S.q, popFrom);
  refreshSpots();
}

/* ---------- answering ---------- */
function press(key) {
  if (!live() || teaching()) return;
  const q = S.q;
  if (key === 'check') return onCheck();
  if (!(q.kind === 'boxes' || (q.kind === 'steps' && S.wstage === 1)) || S.tier === 2) return;
  if (S.solved.has(S.active)) { const u = unsolvedBoxes(); if (!u.length) return; S.active = u[0]; }
  const cur = S.values[S.active];
  if (key === 'del') S.values[S.active] = cur.slice(0, -1);
  else if (cur.length < 5) S.values[S.active] = (cur === '0' ? '' : cur) + key;
  sfx.tap(); paintBoxes();
  if (S.tier === 3) applyGuide();
}

function onCheck() {
  const q = S.q;
  if (q.kind === 'grid') {
    if (!q.vis.r) { feedback('info', '<span>Tap a square to grow the orchard.</span>'); return; }
    if (gridOk(q.vis)) return win();
    return raise('wrong', `You made ${q.vis.r} rows of ${q.vis.c}.`);
  }
  if (q.kind === 'line') {
    if (S.pos == null || S.pos === q.line.start) {
      feedback('info', '<span>Drag Bonnie along the line first.</span>');
      if (S.tier !== 3) spot('pawn');
      return;
    }
    if (inTarget()) return win();
    return raise('wrong');
  }
  if (q.kind === 'steps' && S.wstage === 0) return;
  if (q.kind === 'boxes' || q.kind === 'steps') {
    const empty = unsolvedBoxes().find(i => S.values[i] === '');
    if (empty !== undefined) {
      S.active = empty; paintBoxes();
      feedback('info', '<span>Fill in the empty box first.</span>');
      if (S.tier === 3) applyGuide(); else spot(`box-${empty}`);
      return;
    }
    const vals = S.values.map(Number), res = boxResults(vals);
    if (res.every(Boolean)) { res.forEach((_, i) => S.solved.add(i)); return win(); }
    if (q.type === 'split' && vals.reduce((a, b) => a + b, 0) === q.n && !S.solved.size) {
      feedback('help', `<span><span class="big">Those do make ${q.n}!</span>Now split it into ${placeList(q.n)}.</span>`);
      say(`Those do make ${q.n}! Now split it into ${placeList(q.n)}.`);
      return;
    }
    let newly = 0;
    res.forEach((ok, i) => { if (ok && !S.solved.has(i)) { S.solved.add(i); newly++; } if (!ok) S.values[i] = ''; });
    S.active = unsolvedBoxes()[0]; paintBoxes();
    return raise('wrong', newly ? 'That one’s right!' : null);
  }
  if (q.kind === 'build') {
    const total = buildTotal();
    if (total === 0) { feedback('info', '<span>Tap <b>+</b> to add some first.</span>'); return; }
    if (total === q.n) return win();
    return raise('wrong', `You made ${total}.`);
  }
}

function choose(val, btn) {
  if (!live()) return;
  const q = S.q;
  if (q.kind === 'tester' && !testerReady()) return;
  if (val === q.answer[0]) { btn.classList.add('right'); return win(); }
  S.tried.add(val); btn.classList.add('faded'); btn.disabled = true;
  if (q.kind === 'chests') { const c = btn.querySelector('.chest-svg'); if (c) c.classList.add('shut'); }
  raise('wrong', q.kind === 'tester' && q.answer[0] === 0 ? 'Keep testing!' : null);
}

/* ---------- claims: a host (like Captain Croak) says something, and the child decides ----------
   q.claim = { text }  the host's claim, shown in a speech scroll with the world's host drawing
   (M.world({ host: { name, who, svg(mood), says: { busted, holds, sometimes, oops }, taps, lines } }), moods: 'claim', 'busted', 'holds').
   Each of says' entries and taps can be one line or a list (said in turn, with no repeats until the list runs out).
   who names his recorded voice (audio/<who>.json); lines lists everything he says, for tools/make-voice.mjs.
   kind 'verdict': q.verdict = { picks: [labels], right: [indexes that are right], reasons(i) → { list, answer }, why }
     tap a pick, then "How do you know?": the best of the reasons. A wrong tap at either step is a mistake.
   kind 'chests':  q.choices (indexes) + q.cfmt(i) for the chest labels; drop the claim in the right chest.
   kind 'tester':  q.tests = [{ label, ok, show }], q.choices [0 busted, 1 looks true]. Tapping tests is exploring;
     only the verdict is marked. The verdict buttons wake up after 2 tests, or once a test busts it. */
const host = () => def().host || null;
function claimHTML(q) {
  const h = host();
  return `<div class="claim" data-t="claim">
    ${h ? `<div class="host" id="mmHost">${h.svg(S.mood)}</div>` : ''}
    <div class="scroll" id="mmScroll" data-t="scroll">${h ? `<small>${esc(q.claim.label || h.name + '’s conjecture')}</small>` : ''}<b>${esc(q.claim.text)}</b>${q.claim.sub ? `<span class="sub">${esc(q.claim.sub)}</span>` : ''}</div>
  </div>`;
}
function setHost(mood) {
  if (!S || S.mood === mood) return;
  S.mood = mood; const h = host(), el = inMM('#mmHost');
  if (h && el) { el.querySelector('svg')?.remove(); el.insertAdjacentHTML('afterbegin', h.svg(mood)); el.classList.remove('jump'); void el.offsetWidth; el.classList.add('jump'); }
}
function hostSays(text) {
  const el = inMM('#mmHost'); if (!el || !text) return;
  el.querySelector('.host-say')?.remove();
  const p = document.createElement('span'); p.className = 'host-say'; p.textContent = text; el.appendChild(p);
  setTimeout(() => p.remove(), 2600);
}
/* A list of lines works like a bag: each line comes out once before any repeats (and never the same one twice in a row). */
const bags = new Map();
function fresh(list) {
  if (!Array.isArray(list)) return list;
  let b = bags.get(list);
  if (!b || !b.left.length) {
    const left = shuffle(list.slice());
    if (b && left.length > 1 && left[left.length - 1] === b.last) left.unshift(left.pop()); // the next one out isn't the last one said
    b = { left, last: b && b.last }; bags.set(list, b);
  }
  return (b.last = b.left.pop());
}
/* The host says a line out loud in his own voice (host.who: audio/<who>.json), once Bonnie has finished. */
function hostSpeak(text, now) {
  const h = host(), q0 = S && S.q; if (!h || !text) return;
  const go = () => { if (!S || S.q !== q0) return; hostSays(text); U.say(text, { who: h.who, pitch: .7, rate: .85 }); };
  if (now) go(); else U.whenQuiet(go);
}
const reasonsNow = () => S.q.verdict.reasons(S.vpick);
function vpick(i, btn) {
  if (!live()) return;
  const v = S.q.verdict;
  if (v.right.includes(i)) {
    btn.classList.add('right'); tone([660, 880], .07, 'triangle', .1);
    S.vpick = i; S.vstage = 1; S.vtried = new Set();
    setTimeout(() => { if (!live()) return; renderControls(); feedback('info', `<span><span class="big">${esc(v.picks[i])}!</span>Now, how do you know?</span>`); say('Now, how do you know?'); }, 450);
    return;
  }
  S.tried.add(i); btn.classList.add('faded'); btn.disabled = true;
  raise('wrong');
}
function vreason(i, btn) {
  if (!live()) return;
  if (i === reasonsNow().answer) { btn.classList.add('right'); return win(); }
  S.vtried.add(i); btn.classList.add('faded'); btn.disabled = true;
  raise('wrong');
}
// he says she's right (yes = 1) or "Oops" (0)
function teachPick(yes, btn) {
  if (!live() || !teaching()) return;
  const q = S.q, t = q.teach;
  if (!!yes === t.right) {
    btn.classList.add('right');
    if (t.right) return win();
    tone([660, 880], .07, 'triangle', .1);
    toPad();
    const line = U.fmt(fresh(TEACH.oops));
    feedback('info', `<span><span class="big">Oops, Bonnie!</span>${esc(line)}</span>`);
    return say(line);
  }
  S.tried.add('teach-' + (yes ? 1 : 0)); btn.classList.add('faded'); btn.disabled = true;
  if (yes) { toPad(); return raise('wrong', TEACH.sure); } // she was wrong: work it out together, with the usual help
  // she was right after all: one mistake, then he agrees with her
  Meadow.wrong(null, { quiet: true });
  showVisual(); renderControls(); spot('teach-1');
  feedback('help', `<span><span class="big">Let’s check.</span>I think I did get it this time!</span>`);
  say(TEACH.didIt);
}
// from checking Bonnie to typing the right answer
function toPad() { S.tstage = 1; S.values[0] = ''; S.active = 0; renderControls(); paintBoxes(); updateAsk(); }
const testerReady = () => S.tested.length >= 2 || S.tested.some(i => !S.q.tests[i].ok);
function testerHTML(q) {
  return `<div class="tests">${q.tests.map((t, i) => `<button class="tbtn${S.tested.includes(i) ? (t.ok ? ' done ok' : ' done bad') : ''}" type="button" data-test="${i}" data-t="test-${i}">${esc(t.label)}</button>`).join('')}</div>
    <div class="tlog" id="tlog" aria-live="polite">${S.tested.length ? S.tested.map(i => `<div class="tl ${q.tests[i].ok ? 'ok' : 'bad'}">${q.tests[i].ok ? '✓' : '✗'} ${esc(q.tests[i].show)}</div>`).join('') : '<div class="tl none">Tap a number to test the conjecture.</div>'}</div>`;
}
function runTest(i) {
  if (!live()) return;
  const q = S.q, t = q.tests[i];
  if (!S.tested.includes(i)) S.tested.push(i);
  if (t.ok) tone([523, 659], .07, 'triangle', .08); else { tone([392, 311], .1, 'sawtooth', .06); setHost('busted'); hostSpeak(fresh(q.busted || host().says.oops || 'Shiver me lily pads!')); }
  say(t.show + (t.ok ? '. That fits.' : '. That busts it!'));
  const el = inMM('#tester'); if (el) el.innerHTML = testerHTML(q);
  renderControls();
  const st = S.tier === 2 && S.steps && S.steps[S.step];
  if (st && st.action && st.action()) { const q0 = S.q; setTimeout(() => { if (S && S.q === q0 && S.tier === 2) { S.step++; advanceSteps(); } }, 700); }
}
/* kind 'steps': the host shows his working, q.work = { steps: [{ text(v), right, shown }], wrong }.
   Exactly one step shows a wrong value. Tap it (tapping a right step is a mistake), then fix it on the keypad:
   the wrong value becomes answer box 0, so q.answer = [the right value]. A step card step with wstep: true
   picks the wrong step for him. */
const BOXMARK = '\u0001';
function workHTML(q) {
  const w = q.work;
  return w.steps.map((st, i) => {
    const fixing = S.wstage === 1 && i === w.wrong;
    const txt = fixing ? esc(st.text(BOXMARK)).replace(BOXMARK, '<button class="box" type="button" data-box="0" data-t="box-0" aria-label="The fixed number"></button>') : esc(st.text(st.shown ?? st.right));
    const cls = `wstep${fixing ? ' bad' : ''}${S.wtried.has(i) ? ' ok' : ''}`;
    return fixing ? `<div class="${cls}" data-t="wstep-${i}"><i>Step ${i + 1}</i><span>${txt}</span></div>`
      : `<button class="${cls}" type="button" data-wstep="${i}" data-t="wstep-${i}" ${S.wstage === 1 || S.wtried.has(i) ? 'disabled' : ''}><i>Step ${i + 1}</i><span>${txt}</span>${S.wtried.has(i) ? '<b class="tick">✓</b>' : ''}</button>`;
  }).join('');
}
function redrawWork() { const el = inMM('#work'); if (el) el.innerHTML = workHTML(S.q); paintBoxes(); refreshSpots(); }
function pickWrongStep() { S.wstage = 1; S.active = 0; redrawWork(); }
function tapWorkStep(i, btn) {
  if (!live() || S.wstage !== 0 || S.tier === 2) return;
  if (i === S.q.work.wrong) {
    tone([660, 880], .07, 'triangle', .1); setHost('busted');
    pickWrongStep(); renderControls();
    feedback('info', '<span><span class="big">Found it!</span>Now fix it. What should it be?</span>');
    return say('Found it! Now fix it. What should it be?');
  }
  S.wtried.add(i); redrawWork();
  raise('wrong', 'That step is right!');
}
// drag the claim's scroll into a chest (tapping a chest works too)
let scrollDrag = null;
function dragScrollStart(e) {
  const sc = inMM('#mmScroll'); if (!sc) return;
  const r = sc.getBoundingClientRect(), ghost = sc.cloneNode(true);
  ghost.className = 'scroll scroll-ghost'; ghost.removeAttribute('id'); ghost.style.width = r.width + 'px';
  document.body.appendChild(ghost);
  scrollDrag = { id: e.pointerId, ghost, dx: e.clientX - r.left, dy: e.clientY - r.top, moved: false, x0: e.clientX, y0: e.clientY };
  moveGhost(e);
}
function moveGhost(e) {
  const d = scrollDrag; if (!d) return;
  if (Math.abs(e.clientX - d.x0) + Math.abs(e.clientY - d.y0) > 8) d.moved = true;
  d.ghost.style.left = (e.clientX - d.dx) + 'px'; d.ghost.style.top = (e.clientY - d.dy) + 'px';
  allMM('.chest').forEach(c => { const r = c.getBoundingClientRect(); c.classList.toggle('over', !c.disabled && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom); });
}
function dragScrollEnd() {
  const d = scrollDrag; if (!d) return;
  scrollDrag = null; d.ghost.remove();
  const over = allMM('.chest.over')[0]; allMM('.chest.over').forEach(c => c.classList.remove('over'));
  if (over && d.moved) choose(+over.dataset.choice, over);
}
const CHEST = `<svg class="chest-svg" viewBox="0 0 100 80" aria-hidden="true">
  <rect x="10" y="36" width="80" height="40" rx="6" fill="#A8743F"/><rect x="10" y="50" width="80" height="6" fill="#7A4F27"/>
  <rect x="44" y="44" width="12" height="16" rx="3" fill="#F4C25B"/><circle cx="50" cy="51" r="2.4" fill="#7A4F27"/>
  <g class="lid"><path d="M10 38 Q10 12 50 12 Q90 12 90 38 Z" fill="#C08A50"/><rect x="10" y="32" width="80" height="6" fill="#7A4F27"/>
  <path d="M30 14 v24 M70 14 v24" stroke="#F4C25B" stroke-width="5"/></g>
  <g class="gold"><circle cx="34" cy="34" r="6" fill="#FFD75E"/><circle cx="50" cy="30" r="7" fill="#FFC83D"/><circle cx="66" cy="34" r="6" fill="#FFD75E"/></g>
</svg>`;

// a right answer: the core gives the bone, says well done and moves on
function win() {
  if (!live()) return;
  S.locked = true; clearSpots(); clearSkip();
  if (S.q.kind === 'line') S.pos = S.q.target; // slide Bonnie onto the exact spot
  paintLine();
  S.values.forEach((_, i) => S.solved.add(i)); paintBoxes();
  updateAsk();
  const origin = inMM('#nl-pawn') || inMM('.eq') || inMM('.stage');
  numPop(origin, S.q.kind === 'boxes' ? S.values.filter(Boolean) : S.q.kind === 'line' ? [S.q.fmt(S.q.target)] : []);
  const fb = inMM('#bubble'); if (fb) fb.className = 'feedback good';
  setMood('happy');
  if (S.q.claim && host()) {
    const h = host(), ct = S.q.claimTrue;
    if (S.q.kind === 'chests') { const c = inMM(`.chest[data-choice="${S.q.answer[0]}"]`); if (c) c.classList.add('open'); }
    setHost(ct === false ? 'busted' : 'holds'); hostSpeak(fresh(ct === false ? h.says.busted : ct === 'sometimes' ? h.says.sometimes : h.says.holds));
  }
  const praise = S.q.teach ? fresh(S.tstage === 0 ? TEACH.phew : TEACH.taught) : S.tier === 0 ? pick(PRAISE) : pick(TEAM);
  Meadow.correct(origin, { praise });
}

/* ---------- little extras ---------- */
// asking Bonnie is a superpower: a "Scout Tip!" badge pops up (the first one of a level earns a bone)
function scoutTip(first) {
  const h = inMM('.helper'); if (!h) return;
  const p = document.createElement('div'); p.className = 'scout-pop';
  p.innerHTML = `${PAW}<b>Scout Tip!</b>${first ? '<small>+1 bonus bone</small>' : ''}`;
  h.appendChild(p); setTimeout(() => p.remove(), 1800);
}
function numPop(el, items) {
  if (!el || reduced() || !items.length) return;
  const r = el.getBoundingClientRect(), cols = ['#f2832b', '#3B7FC4', '#3F8B5C', '#C2185B', '#7A4F27'];
  items.forEach((txt, i) => {
    const s = document.createElement('span'); s.className = 'mm-numpop'; s.textContent = txt;
    s.style.left = (r.left + r.width / 2 + (Math.random() - .5) * r.width * .6) + 'px';
    s.style.top = (r.top + r.height / 2) + 'px'; s.style.color = cols[i % cols.length];
    s.style.setProperty('--dx', rand(-70, 70) + 'px'); s.style.setProperty('--dy', -rand(90, 160) + 'px');
    s.style.animationDelay = (i * .08) + 's';
    document.body.appendChild(s); setTimeout(() => s.remove(), 1500);
  });
}
// tapping Bonnie tickles her
function tickleBonnie(dog) {
  const line = U.tickle(dog);
  dog.querySelector('.tickle-pop')?.remove();
  const p = document.createElement('span'); p.className = 'tickle-pop'; p.textContent = line;
  // after the Easter egg's spin the line shows once she has landed, and stays a little longer
  const egg = dog.classList.contains('bonnie-spin'), show = egg ? 1100 : 0;
  setTimeout(() => { dog.querySelector('.tickle-pop')?.remove(); dog.appendChild(p); setTimeout(() => p.remove(), egg ? 2400 : 1600); }, show);
}

/* ---------- taps, drags and keys (set up once, for whichever question is showing) ---------- */
document.addEventListener('click', e => {
  const r = root(); if (!r || !r.contains(e.target)) return;
  const b = e.target.closest('button');
  if (!b) {
    const dog = e.target.closest('#gameBonnie'); if (dog) return tickleBonnie(dog);
    // tap the host and he says one of his lines
    if (e.target.closest('#mmHost') && host() && host().taps) { const el = inMM('#mmHost'); el.classList.remove('jump'); void el.offsetWidth; el.classList.add('jump'); return hostSpeak(S.q.claim && S.q.claim.sub && Math.random() < .3 ? S.q.claim.sub : fresh(host().taps), true); }
    // tap the rods or counters to count them in tens (or hundreds)
    const g = e.target.closest('#visual .grp'); if (!g) return;
    const p = +(g.className.match(/\bp(\d)\b/) || [])[1];
    if (p >= 1) skipCount(p);
    return;
  }
  if (b.id === 'mmSay') return say(readOut(S.q));
  if (b.dataset.g || b.dataset.gBowl !== undefined || b.dataset.gHole !== undefined) return gAction(b);
  if (b.id === 'mmAsk') { if (live()) { if (teaching()) toPad(); raise('ask'); } return; }
  if (b.dataset.teach !== undefined) return teachPick(+b.dataset.teach, b);
  if (b.dataset.chip !== undefined) return chooseStep(+b.dataset.chip, b);
  if (b.dataset.key) return press(b.dataset.key);
  if (b.dataset.box !== undefined) {
    const i = +b.dataset.box;
    if (!live() || S.solved.has(i) || S.tier === 3) return;
    S.active = i; sfx.tap(); return paintBoxes();
  }
  if (b.dataset.choice !== undefined) return choose(+b.dataset.choice, b);
  if (b.dataset.vpick !== undefined) return vpick(+b.dataset.vpick, b);
  if (b.dataset.vreason !== undefined) return vreason(+b.dataset.vreason, b);
  if (b.dataset.test !== undefined) return runTest(+b.dataset.test);
  if (b.dataset.wstep !== undefined) return tapWorkStep(+b.dataset.wstep, b);
  if (b.dataset.step && live()) {
    const q = S.q, p = +b.dataset.p, c = q.counts[p] + +b.dataset.step;
    if (c < 0 || c > 9) { sfx.soft(); if (c > 9) feedback('info', `<span>9 ${PL[p].name} is the most. Ten ${PL[p].name} would make the next place!</span>`); return; }
    q.counts[p] = c; sfx.tap();
    redrawVisual(b.dataset.step === '1' && p === 0 && q.mode === 'blocks' ? c - 1 : -1);
    // a step card step waiting for a tap on + or − moves on once it's done
    const st = S.tier === 2 && S.steps && S.steps[S.step];
    if (st && st.action && st.action()) { const q0 = S.q; setTimeout(() => { if (S && S.q === q0 && S.tier === 2) { S.step++; advanceSteps(); } }, 500); }
    return;
  }
  if (b.hasAttribute('data-break') && live()) {
    const q = S.q;
    if (q.counts[1] > 0 && q.broke < q.k) {
      const before = q.counts[0];
      q.counts[1]--; q.counts[0] += 10; q.broke++;
      tone([600, 800], .06, 'triangle', .1);
      redrawVisual(before);
      const st = S.tier === 2 && S.steps && S.steps[S.step];
      if (st && st.action && st.action()) { const q0 = S.q; setTimeout(() => { if (S && S.q === q0 && S.tier === 2) { S.step++; advanceSteps(); } }, 500); }
    }
    return;
  }
  if (b.id === 'putback' && live()) { S.q.counts = countsOf(S.q.n); S.q.broke = 0; sfx.tap(); redrawVisual(); }
});

document.addEventListener('pointerdown', e => {
  const r = root(); if (!r || !r.contains(e.target) || !live()) return;
  if (S.q.kind === 'chests' && S.tier !== 2 && e.target.closest('#mmScroll')) { e.preventDefault(); return dragScrollStart(e); }
  const cell = e.target.closest('[data-cell]');
  if (cell && S.q.kind === 'grid') { e.preventDefault(); gridDrag = e.pointerId; setGridFrom(cell); return; }
  const nl = e.target.closest('#nl');
  if (nl && S.q.kind === 'line') {
    e.preventDefault(); dragId = e.pointerId;
    try { nl.setPointerCapture(e.pointerId); } catch (err) {}
    inMM('#nl-pawn').classList.add('dragging');
    movePawn(posFromX(e.clientX));
  }
});
document.addEventListener('pointermove', e => {
  if (scrollDrag && e.pointerId === scrollDrag.id) return moveGhost(e);
  if (!live()) return;
  if (dragId !== null && e.pointerId === dragId) movePawn(posFromX(e.clientX));
  if (gridDrag !== null && e.pointerId === gridDrag) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cell = el && el.closest('#gv-grid [data-cell]'); if (cell) setGridFrom(cell);
  }
});
['pointerup', 'pointercancel'].forEach(ev => document.addEventListener(ev, e => {
  if (scrollDrag && e.pointerId === scrollDrag.id) return dragScrollEnd();
  if (dragId !== null && e.pointerId === dragId) {
    dragId = null; const p = inMM('#nl-pawn'); if (p) p.classList.remove('dragging');
    afterMove();
  }
  if (gridDrag !== null && e.pointerId === gridDrag) { gridDrag = null; afterMove(); }
}));

document.addEventListener('keydown', e => {
  if (!live() || document.querySelector('.modal-bg')) return;
  if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && S.q.kind === 'line') {
    e.preventDefault();
    const q = S.q, L = q.line, d = e.key === 'ArrowRight' ? q.snap : -q.snap;
    movePawn(rd(Math.max(L.min, Math.min(L.max, (S.pos ?? L.min) + d)), q.dp)); afterMove();
    return;
  }
  if (/^[0-9]$/.test(e.key)) press(e.key);
  else if (e.key === 'Backspace') press('del');
  else if (e.key === 'Enter') press('check');
});

/* ---------- making a world for the core ---------- */
// each level's make(type, k, easy) is asked for one question at a time, so the quiet
// easing can switch to gentler numbers mid-level; the same question never comes twice
function wrapLevel(L, id) {
  let used = new Set();
  return {
    id, name: L.name, blurb: L.blurb, eg: L.eg, seq: L.seq, quest: L.quest,
    make: ({ eased, index, type, fresh, teach }) => {
      if (fresh ?? index === 0) used = new Set(); // fresh: the first question of a run (warm-ups come first)
      let q, guard = 0;
      do { q = L.make(type, index, eased); guard++; } while (used.has(q.key) && guard < 60);
      // teach: try a few more for one with a single number answer; if this level has none, it stays a normal question
      for (let k = 0; teach && !teachable(q) && k < 12; k++) { const q2 = L.make(type, index, eased); if (!used.has(q2.key)) q = q2; }
      used.add(q.key); q.eased = !!eased;
      if (teach && teachable(q)) teachify(q);
      return q;
    },
  };
}
// more levels for a maths world another file made (Stage 6: thirds and three quarters)
function addLevels(worldId, d) { (RAW[worldId] || (RAW[worldId] = [])).push(...d.levels); return Meadow.addLevels(worldId, d.levels.map((L, i) => wrapLevel(L, d.ids[i]))); }
function world(d) {
  DEFS[d.id] = d; RAW[d.id] = [...d.levels, ...(RAW[d.id] || [])];
  return {
    id: d.id, subject: 'maths', year: d.year || 2, name: d.name, tag: d.tag, icon: d.icon, color: d.color, tint: d.tint, intro: d.intro,
    layout: 'full', helpFrom: 2, hintNames: ['A clue', 'Step by step', 'Glowing buttons'], tierNames: TIER_NAMES, praise: PRAISE,
    warmUps: d.warmUps !== false, // 2 easy warm-up questions before each level (not Captain's Cove)
    walk: d.walk !== false,       // can appear in Bonnie's Walk (not Captain's Cove)
    teach: d.teach !== false,     // Teach Bonnie questions can come up (not Captain's Cove)
    // every line for tools/make-voice.mjs to record: the world's own, Teach Bonnie, and the help ladder's clues and step cards
    lines: ctx => [...(d.lines ? d.lines(ctx) || [] : []), ...TEACH_LINES, ...HELP_FIXED, ...helpLines(d.id)], host: d.host,
    numberLines: () => numberLines(d.id), // sentences with numbers: recorded as joined-up pieces
    levels: d.levels.map((L, i) => wrapLevel(L, d.ids[i])),
    play,
  };
}

/* ---------- the look (only inside the maths question area) ---------- */
const CSS = String.raw`
.mm { --paper: #f6faff; --grid: #d9e6f4; --margin: #f0a3a3; --ink: #1b2440; --ink-soft: #5a6480; --card: #ffffff; --sun: #ffc83d; --sun-soft: #fff1c7; --ones: #f2832b; --ones-dk: #b4531a; --tens: #2f6fd6; --tens-dk: #1c4893; --hund: #27a35f; --hund-dk: #166b3d; --thou: #8b4fd8; --thou-dk: #5b2c9c; --fur: #9a6440; --fur-dk: #74472a; --fur-lt: #c99568; --fur-bg: #f7ece3; --good: #128a74; --good-bg: #ddf5ef; --bone: #f6e6c6; --f-display: 'Grandstander', 'Chalkboard SE', 'Comic Sans MS', system-ui, sans-serif; --f-body: 'Lexend', system-ui, -apple-system, 'Segoe UI', sans-serif; --u: 17px; --g: 4px; color-scheme: light; }
@media (max-width: 560px) {
  .mm { --u: 13px; --g: 3px; }
}
.mm [hidden] { display: none !important; }
.mm button { font: inherit; color: inherit; cursor: pointer; touch-action: manipulation; }
.mm button:focus-visible { outline: 4px solid var(--tens); outline-offset: 3px; }
.mm .p0 { --c: var(--ones); --c-dk: var(--ones-dk); --c-ink: #d4680f; }
.mm .p1 { --c: var(--tens); --c-dk: var(--tens-dk); }
.mm .p2 { --c: var(--hund); --c-dk: var(--hund-dk); }
.mm .p3 { --c: var(--thou); --c-dk: var(--thou-dk); }
.mm .mcard { background: var(--card); border: 3px solid var(--ink); border-radius: 20px; box-shadow: 0 6px 0 var(--ink); }
.mm .mbtn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; font-size: 20px; background: var(--sun); color: var(--ink); border: 3px solid var(--ink); border-radius: 16px; box-shadow: 0 4px 0 var(--ink); padding: 12px 22px; min-height: 56px; transition: transform .06s, box-shadow .06s; }
.mm .mbtn:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--ink); }
.mm .mbtn.plain { background: var(--card); }
.mm .mbtn.small { font-size: 16px; min-height: 44px; padding: 8px 14px; border-radius: 12px; }
.mm .mbtn[disabled] { opacity: .45; pointer-events: none; }
.mm .micon { width: 48px; height: 48px; display: grid; place-items: center; background: var(--card); border: 3px solid var(--ink); border-radius: 14px; box-shadow: 0 3px 0 var(--ink); padding: 0; }
.mm .micon:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--ink); }
.mm a.micon { color: var(--ink); text-decoration: none; }
.mm .micon svg { width: 24px; height: 24px; }
.mm .micon.off { opacity: .5; }
.mm .bone { width: 30px; height: 30px; transform: rotate(-24deg); flex: none; }
.mm .spot { position: relative; z-index: 1; outline: 5px solid var(--sun) !important; outline-offset: 4px; border-radius: 14px; animation: mm-glow 0.9s ease-in-out infinite alternate; }
.mm .spot::after { content: ""; position: absolute; width: 30px; height: 30px; right: -16px; top: -22px; pointer-events: none; z-index: 2; background: no-repeat center/contain url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2374472a'%3E%3Cellipse cx='12' cy='16' rx='5' ry='4.2'/%3E%3Ccircle cx='5.5' cy='10.5' r='2.3'/%3E%3Ccircle cx='9.5' cy='6.5' r='2.4'/%3E%3Ccircle cx='14.5' cy='6.5' r='2.4'/%3E%3Ccircle cx='18.5' cy='10.5' r='2.3'/%3E%3C/svg%3E"); animation: mm-pawbob .5s ease-in-out infinite alternate; }
@keyframes mm-glow { to { outline-offset: 9px; outline-color: rgba(255, 200, 61, .45); } }
@keyframes mm-pawbob { to { transform: translate(-3px, 5px) rotate(-12deg); } }
.mm .hl { display: inline-block; }
.mm .d { font-variant-numeric: tabular-nums; }
.mm .d.p0, .mm .d.p1, .mm .d.p2, .mm .d.p3 { color: var(--c-ink, var(--c)); }
.mm .play { display: grid; gap: 22px; grid-template-columns: minmax(0, 1fr); align-items: start; }
@media (min-width: 900px) {
  .mm .play { grid-template-columns: minmax(0, 1fr) 370px; }
}
.mm .stage { padding: 22px 24px 26px; display: grid; gap: 18px; min-width: 0; }
.mm .prompt-row { display: flex; gap: 14px; align-items: flex-start; }
.mm .prompt { font-size: clamp(22px, 2.6vw, 28px); font-weight: 700; line-height: 1.25; flex: 1; min-width: 0; text-wrap: balance; }
.mm .tip { font-size: 17px; color: var(--ink-soft); margin-top: -8px; }
.mm .tip b { color: var(--ink); }
.mm .eq { display: grid; gap: 12px; font-size: clamp(34px, 5.4vw, 58px); font-weight: 700; justify-items: start; }
.mm .eqline { display: flex; flex-wrap: wrap; align-items: center; gap: .22em; font-variant-numeric: tabular-nums; }
.mm .eqline .op { color: var(--ink-soft); }
.mm .eqline .word { font-size: .5em; color: var(--ink-soft); font-weight: 600; margin-right: .2em; }
.mm .num.mark .hl { text-decoration: underline; text-decoration-thickness: .09em; text-underline-offset: .12em; color: var(--tens); background: var(--sun-soft); border-radius: .12em; padding: 0 .06em; }
.mm .box { min-width: 2.3em; height: 1.45em; padding: 0 .2em; line-height: 1; font: inherit; font-weight: 700; color: var(--ink); background: var(--card); border: 3px dashed var(--ink-soft); border-radius: 14px; display: inline-grid; place-items: center; font-variant-numeric: tabular-nums; }
.mm .box.active { border-style: solid; border-color: var(--ink); box-shadow: 0 0 0 5px var(--sun); }
.mm .box.good { background: var(--good-bg); border: 3px solid var(--good); color: var(--good); }
.mm .box.mpop { animation: mm-pop .4s cubic-bezier(.3,1.6,.5,1); }
.mm .visual { display: flex; flex-wrap: wrap; gap: 18px 26px; align-items: flex-end; padding: 18px; background: var(--paper); border: 2px solid var(--grid); border-radius: 16px; }
.mm .grp { display: grid; gap: 8px; justify-items: center; align-content: end; }
.mm .items { display: flex; align-items: flex-end; gap: var(--g); min-height: calc(var(--u) * 10 + var(--g) * 9); }
.mm .items.counters { display: grid; grid-template-columns: repeat(3, 48px); gap: 6px; min-height: 0; align-content: end; }
.mm .items.counters.empty, .mm .items.empty { min-width: 60px; border: 2px dashed var(--grid); border-radius: 10px; }
.mm .items.counters.empty { min-height: 48px; }
.mm .ten { width: var(--u); height: calc(var(--u) * 10 + var(--g) * 9); display: block; padding: 0; border: 0; background: none; }
.mm .ten svg, .mm .one svg { display: block; width: 100%; height: 100%; }
.mm .ten rect, .mm .one rect { fill: var(--c); stroke: var(--c-dk); stroke-width: 1.5px; }
.mm .ten line { stroke: var(--c-dk); stroke-width: 1.5px; }
.mm button.ten { cursor: pointer; border-radius: 3px; }
.mm button.ten:active { transform: scale(.94); }
.mm .ones { display: grid; grid-auto-flow: column; grid-template-rows: repeat(10, var(--u)); grid-auto-columns: var(--u); gap: var(--g); transform: scaleY(-1); }
.mm .one { width: var(--u); height: var(--u); }
.mm .mpop { animation: mm-pop .35s ease-out both; }
@keyframes mm-pop { from { transform: scale(0); } to { transform: scale(1); } }
.mm .ctr { width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; background: var(--c); color: #fff; border: 3px solid var(--c-dk); font-weight: 700; font-size: 14px; }
.mm .p3 .ctr, .mm .ctr.p3 { font-size: 12px; }
.mm .glabel { font-size: 17px; font-weight: 600; color: var(--ink-soft); white-space: nowrap; }
.mm .glabel b { color: var(--c-ink, var(--c)); font-size: 20px; }
.mm .steppers { display: flex; gap: 8px; }
.mm .mstep { width: 52px; height: 52px; border-radius: 14px; border: 3px solid var(--ink); background: var(--card); box-shadow: 0 3px 0 var(--ink); font-size: 30px; font-weight: 700; line-height: 1; padding: 0; }
.mm .mstep.plus { background: var(--c); color: #fff; }
.mm .mstep:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--ink); }
.mm .vis-tools { display: flex; justify-content: flex-end; }
.mm .side { display: grid; gap: 16px; }
.mm .feedback { min-height: 92px; padding: 14px 16px; border-radius: 16px; border: 3px solid transparent; font-size: 18px; font-weight: 600; display: flex; gap: 12px; align-items: center; background: var(--card); border-color: var(--grid); color: var(--ink-soft); }
.mm .feedback .bone { width: 22px; height: 22px; vertical-align: -5px; margin-right: 2px; }
.mm .feedback .big { display: block; font-family: var(--f-display); font-size: 26px; font-weight: 700; color: var(--good); }
.mm .feedback.good { background: var(--good-bg); border-color: var(--good); color: var(--ink); }
.mm .feedback.info { background: var(--sun-soft); border-color: var(--sun); color: var(--ink); }
.mm .pad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.mm .key { min-height: 66px; font-size: 30px; font-weight: 700; background: var(--card); border: 3px solid var(--ink); border-radius: 16px; box-shadow: 0 4px 0 var(--ink); font-variant-numeric: tabular-nums; }
.mm .key:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--ink); }
.mm .key.del svg { width: 30px; height: 30px; vertical-align: middle; }
.mm .key.check { background: var(--sun); font-size: 22px; }
@media (min-width: 560px) and (max-width: 899px) {
  .mm .side { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: stretch; }
  .mm .side .helper { align-self: stretch; }
  .mm #controls { align-self: start; }
}
.mm .choices { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.mm .choice { min-height: 84px; font-size: 34px; font-weight: 700; font-variant-numeric: tabular-nums; background: var(--card); border: 3px solid var(--ink); border-radius: 18px; box-shadow: 0 4px 0 var(--ink); }
.mm .choices.wordy .choice { font-size: 24px; white-space: nowrap; }
.mm .choice:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--ink); }
.mm .choice.faded, .mm .mchip.faded { opacity: .35; box-shadow: none; transform: translateY(3px); }
.mm .choice.right { background: var(--good-bg); border-color: var(--good); color: var(--good); }
.mm .actions { display: grid; }
.mm .stepcard { padding: 18px; display: grid; gap: 14px; border-color: var(--fur-dk); box-shadow: 0 6px 0 var(--fur-dk); background: var(--fur-bg); }
.mm .mstep-dots { display: flex; gap: 6px; }
.mm .mstep-dots i { width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid var(--fur-dk); background: var(--card); }
.mm .mstep-dots i.past { background: var(--fur-dk); }
.mm .mstep-dots i.now { background: var(--sun); }
.mm .mstep-say { font-family: var(--f-display); font-weight: 700; font-size: 28px; line-height: 1.15; text-wrap: balance; }
.mm .chips { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(84px, 1fr)); }
.mm .mchip { min-height: 80px; font-size: 32px; font-weight: 700; font-variant-numeric: tabular-nums; background: var(--card); border: 3px solid var(--ink); border-radius: 18px; box-shadow: 0 4px 0 var(--ink); }
.mm .mchip.word { font-size: 21px; padding: 4px 8px; line-height: 1.15; overflow-wrap: break-word; }
/* word buttons ("Sometimes", "Looks true!") get more room, so a long word wraps to a new row of buttons instead of spilling out */
.mm .chips.words { grid-template-columns: repeat(auto-fit, minmax(124px, 1fr)); }
.mm .mchip:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--ink); }
.mm .mchip.right { background: var(--good-bg); border-color: var(--good); color: var(--good); }
.mm .mstep-wait { display: flex; gap: 10px; align-items: center; font-size: 20px; font-weight: 700; color: var(--fur-dk); }
.mm .mstep-wait svg { width: 30px; height: 30px; animation: mm-pawbob .5s ease-in-out infinite alternate; }
.mm .actions .mbtn { width: 100%; min-height: 66px; font-size: 22px; }
.mm .helper { display: grid; gap: 12px; align-content: start; }
.mm .buddy { display: flex; gap: 14px; align-items: flex-end; }
.mm .buddy .feedback { flex: 1; min-width: 0; position: relative; font-size: 17px; }
.mm .buddy .feedback .big { font-size: 21px; margin-bottom: 2px; }
.mm .buddy .feedback::before { content: ""; position: absolute; left: -11px; bottom: 26px; width: 16px; height: 16px; background: inherit; border-left: inherit; border-bottom: inherit; transform: rotate(45deg); }
.mm .feedback.help { background: var(--fur-bg); border-color: var(--fur); color: var(--ink); }
.mm .feedback.help .big { color: var(--fur-dk); }
.mm .ask { width: 100%; background: var(--fur-bg); border-color: var(--fur-dk); box-shadow: 0 4px 0 var(--fur-dk); }
.mm .ask:active { box-shadow: 0 1px 0 var(--fur-dk); }
.mm .ask svg { width: 26px; height: 26px; }
.mm .prizes { display: grid; gap: 14px; }
.mm .nl { position: relative; padding: 118px 44px 26px; background: var(--paper); border: 2px solid var(--grid); border-radius: 16px; touch-action: none; -webkit-touch-callout: none; }
.mm .nl.can-drag { cursor: pointer; }
.mm .nl-track { position: relative; height: 62px; }
.mm .nl-bar { position: absolute; left: -26px; right: -26px; top: 0; height: 6px; margin-top: -3px; background: var(--ink); border-radius: 3px; }
.mm .nl-tick { position: absolute; top: 0; transform: translateX(-50%); display: grid; justify-items: center; pointer-events: none; }
.mm .nl-tick i { display: block; width: 3px; height: 18px; margin-top: -9px; background: var(--ink); border-radius: 2px; }
.mm .nl-tick.major i { width: 4px; height: 34px; margin-top: -17px; }
.mm .nl-lab { margin-top: 6px; font-weight: 700; font-size: 21px; line-height: 1.2; font-variant-numeric: tabular-nums; white-space: nowrap; }
.mm .nl-tick.q .nl-lab { background: var(--sun); border: 2px solid var(--ink); border-radius: 8px; padding: 0 9px; }
.mm .nl.dense .nl-lab { font-size: 16px; }
.mm .nl-tick.zero .nl-lab { color: var(--tens); font-size: 24px; }
.mm .nl-tick.spot, .mm .nl-pawn.spot, .mm .nl-start.spot { position: absolute; }
.mm .nl-zone { position: absolute; top: -28px; height: 56px; transform: translateX(-50%); border-radius: 12px; pointer-events: none; }
.mm .nl-zone.soft { background: rgba(255, 200, 61, .42); }
.mm .nl-zone.guide { min-width: 30px; background: rgba(18, 138, 116, .22); outline: 3px solid var(--good); animation: mm-zone .8s ease-in-out infinite alternate; }
@keyframes mm-zone { to { background: rgba(18, 138, 116, .45); } }
.mm .nl-start { position: absolute; top: 0; width: 24px; height: 24px; margin-top: -12px; transform: translateX(-50%); border-radius: 50%; background: var(--sun); border: 3px solid var(--ink); box-sizing: border-box; pointer-events: none; }
.mm .nl-pawn { position: absolute; top: -6px; width: 72px; transform: translate(-50%, -100%); display: grid; justify-items: center; pointer-events: none; transition: left .14s ease-out; z-index: 2; }
.mm .nl-pawn.dragging { transition: none; }
.mm .nl-pin { width: 0; height: 0; border-left: 9px solid transparent; border-right: 9px solid transparent; border-top: 13px solid var(--fur-dk); margin-top: -4px; }
.mm .nl-pawn.waiting { opacity: .75; animation: mm-pawnbob .8s ease-in-out infinite alternate; }
@keyframes mm-pawnbob { to { transform: translate(-50%, calc(-100% - 7px)); } }
.mm .nl-val { position: absolute; bottom: 100%; margin-bottom: 2px; background: var(--good); color: #fff; font-weight: 700; font-size: 21px; border-radius: 10px; padding: 1px 10px; white-space: nowrap; font-variant-numeric: tabular-nums; }
@media (max-width: 560px) {
  .mm .nl { padding-left: 26px; padding-right: 26px; }
  .mm .nl-lab { font-size: 16px; }
}
.mm { --paper: #FDFBF7; --grid: #EFE5D3; --edge: #EADFCB; --ink: #3E2F27; --ink-soft: #7A6A5E; --card: #FFFFFF; --sun: #F4C25B; --sun-soft: #FDF1D3; --tens: #3B7FC4; --tens-dk: #245A91; --good: #3F8B5C; --good-bg: #E4F2E7; --wood: #A8743F; --wood-dk: #7A4F27; --wood-lt: #C99560; --cream: #FFF8EC; --soft-shadow: 0 2px 0 rgba(120, 85, 45, .06), 0 12px 28px -10px rgba(120, 85, 45, .28); --f-display: 'Fredoka', 'Nunito', 'Chalkboard SE', system-ui, sans-serif; --f-body: 'Nunito', system-ui, -apple-system, 'Segoe UI', sans-serif; }
/* Fredoka and Nunito stop at bold (700): asking for more makes Safari fake it, which smudges the letters */
.mm b, .mm strong { font-weight: 700; }
.mm .eq, .mm .key, .mm .choice, .mm .mchip, .mm .box, .mm .nl-lab, .mm .mstep, .mm .ctr, .mm .nl-val, .mm .glabel b, .mm .prompt, .mm .mstep-say, .mm .feedback .big { font-family: var(--f-display); }
.mm .prompt { font-weight: 600; }
.mm .mcard { border: 2px solid var(--edge); border-radius: 20px; box-shadow: var(--soft-shadow); }
.mm .stepcard { border: 2px solid var(--fur-lt); box-shadow: 0 12px 26px -12px rgba(116, 71, 42, .45); }
.mm .visual, .mm .nl { border-radius: 18px; border-color: var(--grid); }
.mm .mbtn, .mm .key, .mm .choice, .mm .mchip, .mm .mstep, .mm .micon { border-width: 2px; border-radius: 16px; }
.mm .mbtn, .mm .key, .mm .choice, .mm .mchip { box-shadow: 0 4px 0 var(--ink); }
.mm .mbtn:active, .mm .key:active, .mm .choice:active, .mm .mchip:active, .mm .mstep:active, .mm .micon:active { transform: translateY(2px); box-shadow: 0 2px 0 var(--ink); }
.mm .ask, .mm .ask:active { border-color: var(--fur-dk); }
.mm .ask:active { box-shadow: 0 2px 0 var(--fur-dk); }
.mm .key.check, .mm .mbtn:not(.plain):not(.ask) { background: linear-gradient(180deg, #F8D27A, var(--sun)); }
.mm .box { border-radius: 16px; }
.mm .feedback { border-radius: 20px; border-width: 2px; box-shadow: 0 8px 20px -12px rgba(120, 85, 45, .4); }
.mm .buddy .feedback { animation: mm-float 3.4s ease-in-out infinite; }
.mm .buddy .feedback::before { width: 14px; height: 14px; left: -9px; }
@keyframes mm-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
.mm .gvis { flex-direction: column; align-items: center; gap: 14px; --cell: 36px; }
.mm .gv-row { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; }
.mm .gi { display: inline-grid; place-items: center; width: 26px; height: 26px; }
.mm .gi .bone { width: 26px; height: 26px; }
.mm .gi .apple, .mm .gv-cell .apple { width: 100%; height: 100%; }
.mm .gv-box { display: flex; flex-wrap: wrap; gap: 2px; justify-content: center; align-content: center; padding: 12px; min-width: 70px; min-height: 64px; max-width: 160px; font: inherit; color: inherit; transition: transform .1s; }
.mm button.gv-box { cursor: pointer; }
.mm button.gv-box:active { transform: scale(.96); }
.mm .gv-plate { width: 132px; height: 132px; max-width: none; border-radius: 50%; background: radial-gradient(circle, #fff 58%, #F3E7D3 59%, #fff 72%); border: 2px solid var(--edge); box-shadow: 0 6px 12px -8px rgba(120, 85, 45, .5); }
.mm .gv-bowl { width: 128px; min-height: 84px; max-width: none; border-radius: 14px 14px 64px 64px; background: linear-gradient(#DDEBF8, #A9CBEA); border: 2px solid #5B88B5; padding-top: 14px; padding-bottom: 18px; }
.mm .gv-basket { width: 128px; min-height: 70px; max-width: none; border-radius: 10px 10px 26px 26px; background: repeating-linear-gradient(45deg, #DDB173 0 6px, #C9944F 6px 12px); border: 2px solid var(--wood-dk); }
.mm .gv-lily { width: 138px; height: 138px; max-width: none; border-radius: 50%; background: radial-gradient(circle at 50% 40%, #A6DAA0, #66AE62); border: 2px solid #3E7E3E; }
.mm .gv-box.fair { box-shadow: 0 0 0 4px rgba(63, 139, 92, .45), 0 0 18px rgba(63, 139, 92, .5); animation: mm-fair .5s ease-out; }
@keyframes mm-fair { 40% { transform: scale(1.06); } }
.mm .gv-pile { display: flex; flex-wrap: wrap; justify-content: center; gap: 2px; padding: 10px 14px; min-height: 30px; max-width: 420px; border: 2px dashed var(--edge); border-radius: 16px; background: #fff; }
.mm .gv-empty { font-weight: 700; color: var(--good); padding: 2px 6px; }
.mm .gv-tools { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.mm .gv-tools .mbtn svg, .mm .gvis > .mbtn svg { width: 20px; height: 20px; }
.mm .gv-cap { font-family: var(--f-display); font-weight: 600; font-size: 22px; color: var(--ink); }
.mm .gv-cap.good { color: var(--good); }
.mm .gv-array { display: grid; gap: 6px; padding: 14px; border-radius: 18px; background: radial-gradient(circle at 50% 30%, #E8F3DC, #CFE5BD); border: 2px solid #A9CC92; transition: transform .55s cubic-bezier(.4, 0, .2, 1); }
.mm .gv-array .gi { width: var(--cell); height: var(--cell); }
.mm .gv-array.turning { transform: rotate(90deg); }
.mm .gv-grid { display: grid; grid-template-columns: repeat(10, minmax(0, 42px)); gap: 5px; padding: 12px; border-radius: 18px; background: radial-gradient(circle at 50% 30%, #EEF6E4, #D7EAC6); border: 2px solid #A9CC92; touch-action: none; max-width: 100%; }
.mm .gv-cell { aspect-ratio: 1; border-radius: 50%; border: 2px dashed #B9CFA3; background: rgba(255, 255, 255, .7); display: grid; place-items: center; padding: 3px; cursor: pointer; }
.mm .gv-cell.on { border: 2px solid #8DB874; background: #fff; }
.mm .gv-cell.spot { position: relative; }
.mm .gv-shapes .shape { width: 120px; height: 120px; }
.mm .gv-shape .shape { width: 170px; height: 170px; display: block; }
.mm .choice .shape { width: 78px; height: 78px; display: block; margin: 0 auto; }
.mm .mchip .shape { width: 58px; height: 58px; display: block; margin: 0 auto; }
.mm .frac { display: inline-flex; flex-direction: column; align-items: center; line-height: 1; font-weight: 700; vertical-align: middle; }
.mm .frac i { font-style: normal; padding: 0 6px; }
.mm .frac i:first-child { border-bottom: 3px solid currentColor; padding-bottom: 2px; }
.mm .frac i:last-child { padding-top: 2px; }
.mm .mini .gv-box { width: 92px; min-height: 60px; padding: 8px; }
.mm .mini .gv-bowl { padding-top: 10px; }
.mm .mini.gv-array, .mm .mini .gv-array { --cell: 30px; }
@media (max-width: 560px) {
  .mm .gvis { --cell: 26px; }
  .mm .gv-plate, .mm .gv-bowl, .mm .gv-basket { width: 104px; }
  .mm .gv-plate { height: 104px; }
  .mm .gv-lily { width: 112px; height: 112px; }
}
.mm .gv-burrows { gap: 16px 22px; }
.mm .gv-burrow { display: grid; grid-template-columns: repeat(5, var(--hole)); gap: 8px; padding: 14px 14px 12px; border-radius: 22px 22px 16px 16px; background: linear-gradient(180deg, #A6D68A 0 14px, #C79A66 14px, #B5854F); border: 2px solid #7A5530; box-shadow: inset 0 -6px 0 rgba(90, 55, 25, .18); --hole: 54px; }
.mm .gv-hole { width: var(--hole); height: var(--hole); padding: 0; border-radius: 50% 50% 44% 44%; background: radial-gradient(ellipse at 50% 62%, #3A2614 0 52%, #5B3D22 56%, #7A5530 72%); border: 2px solid #5B3D22; display: grid; place-items: center; font: inherit; color: inherit; }
.mm button.gv-hole { cursor: pointer; }
.mm button.gv-hole:not(.full) { box-shadow: 0 0 0 2px rgba(255, 248, 236, .55); }
.mm button.gv-hole:active { transform: scale(.94); }
.mm .gv-hole .gi { width: 40px; height: 40px; position: relative; }
.mm .gv-hole .gi .bone, .mm .gv-hole .gi .carrot, .mm .gv-hole .gi .apple { width: 40px; height: 40px; }
.mm .gv-hole.mine { border-color: var(--sun); box-shadow: 0 0 0 3px var(--sun) !important; }
.mm .gv-hole.eaten .gi { opacity: .22; filter: grayscale(1); }
.mm .gi .carrot { width: 26px; height: 26px; transform: rotate(-20deg); }
.mm .gv-hole .gi.drop { animation: mm-drop .32s cubic-bezier(.3, 1.5, .5, 1); }
@keyframes mm-drop { from { transform: translateY(-18px) scale(.6); opacity: 0; } }
.mm .bag10 { position: absolute; left: 50%; bottom: -3px; transform: translateX(-50%); padding: 0 4px; border-radius: 6px; background: #fff; border: 2px solid var(--tens-dk); color: var(--tens-dk); font-family: var(--f-display); font-style: normal; font-weight: 700; font-size: 12px; line-height: 1.1; }
@media (max-width: 560px) {
  .mm .gv-burrow { --hole: 44px; gap: 6px; padding: 10px; }
  .mm .gv-hole .gi, .mm .gv-hole .gi .bone, .mm .gv-hole .gi .carrot, .mm .gv-hole .gi .apple { width: 32px; height: 32px; }
}
.mm .helper { position: relative; }
.mm .scout-pop { position: absolute; right: 6px; top: -10px; display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 999px; background: linear-gradient(180deg, #FFE7A3, var(--sun)); border: 2px solid var(--wood-dk); color: var(--ink); box-shadow: 0 8px 18px -8px rgba(120, 85, 45, .7); font-family: var(--f-display); z-index: 5; pointer-events: none; animation: mm-scout 1.8s cubic-bezier(.3, 1.5, .5, 1) forwards; }
.mm .scout-pop svg { width: 22px; height: 22px; color: var(--fur-dk); }
.mm .scout-pop b { font-size: 20px; }
.mm .scout-pop small { font-size: 14px; font-weight: 700; }
@keyframes mm-scout { 0% { opacity: 0; transform: translateY(20px) scale(.5) rotate(-8deg); } 18% { opacity: 1; transform: translateY(0) scale(1.1) rotate(3deg); } 30% { transform: none; } 80% { opacity: 1; } 100% { opacity: 0; transform: translateY(-24px); } }
.mm .ask-bonus { display: inline-flex; align-items: center; gap: 1px; margin-left: 6px; padding: 0 8px 0 4px; border-radius: 999px; background: var(--sun); border: 2px solid var(--wood-dk); font-size: 15px; font-family: var(--f-display); }
.mm .ask-bonus .bone { width: 18px; height: 18px; }
.mm-numpop { position: fixed; z-index: 31; pointer-events: none; font-family: var(--f-display); font-weight: 700; font-size: 36px; text-shadow: 0 2px 0 #fff, 0 0 10px rgba(255, 255, 255, .9); transform: translate(-50%, -50%); opacity: 0; animation: mm-numpop 1.25s cubic-bezier(.2, .8, .3, 1) forwards; }
@keyframes mm-numpop { 0% { opacity: 0; transform: translate(-50%, -50%) scale(.3); } 15% { opacity: 1; transform: translate(-50%, -50%) scale(1.35); } 100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1); } }
.mm .quest { display: flex; align-items: center; gap: 8px; margin: -4px 0 -6px; padding: 6px 12px; border-radius: 12px; background: var(--sun-soft); border: 2px dashed #E8C774; color: var(--wood-dk); font-weight: 700; font-size: 16px; line-height: 1.3; }
.mm .quest svg { width: 22px; height: 22px; flex: none; color: var(--fur-dk); }
.mm .prizes .tier { font-size: 18px; color: var(--wood-dk); margin: 8px 0 -4px; }
.mm .prizes .tier:first-child { margin-top: 0; }
.mm .ten { position: relative; }
.mm .ten rect.band { fill: var(--c-dk); stroke: none; }
.mm .ten-tag { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); min-width: 18px; padding: 1px 1px; border-radius: 6px; background: #fff; border: 2px solid var(--c-dk); color: var(--c-dk); font-family: var(--f-display); font-style: normal; font-weight: 700; font-size: 11px; line-height: 1.1; text-align: center; pointer-events: none; }
.mm .visual .grp.p1 .items:not(.counters):not(.empty) { gap: 9px; padding: 8px 8px 6px; border-radius: 12px; background: rgba(59, 127, 196, .10); }
.mm .visual .grp.p0 .items:not(.counters):not(.empty) { padding: 8px 8px 6px; border-radius: 12px; background: rgba(242, 131, 43, .10); }
.mm .visual .grp { cursor: pointer; }
.mm .ctr { position: relative; }
.mm .ten.counting, .mm .ctr.counting { transform: translateY(-6px); filter: drop-shadow(0 0 6px rgba(244, 194, 91, .95)); transition: transform .15s; }
.mm .skip-num { position: absolute; left: 50%; bottom: 100%; margin-bottom: 6px; transform: translateX(-50%); padding: 2px 10px; font-size: 20px !important; border-radius: 999px; background: var(--sun); border: 2px solid var(--wood-dk); color: var(--ink); font-family: var(--f-display); font-weight: 700; font-size: 16px; white-space: nowrap; z-index: 2; animation: mm-pop .3s ease-out; pointer-events: none; }
@media (max-width: 560px) {
  .mm .ten-tag { font-size: 9px; min-width: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .mm *, .mm *::before, .mm *::after { animation: none !important; transition: none !important; }
}
/* claims: the host's speech scroll, verdict + reason, treasure chests, the tester */
.mm .claim { display: flex; gap: 14px; align-items: center; }
.mm .host { position: relative; flex: none; width: 116px; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.mm .host svg { display: block; width: 100%; height: auto; animation: mm-bob 3s ease-in-out infinite; }
@keyframes mm-bob { 50% { transform: translateY(3px) rotate(-1deg); } }
.mm .host.jump { animation: mm-hjump .5s cubic-bezier(.3, 1.5, .5, 1); }
@keyframes mm-hjump { 0% { transform: none; } 40% { transform: translateY(-12px) rotate(-4deg); } 100% { transform: none; } }
.mm .host-say { position: absolute; left: 6px; top: -6px; transform: translateY(-100%); width: max-content; max-width: 220px; padding: 4px 10px; border-radius: 14px; background: #fff; border: 2px solid #3F8B5C; color: #2F6B45; font-family: var(--f-display); font-weight: 700; font-size: 15px; line-height: 1.2; text-align: center; z-index: 4; animation: mm-hsay 2.6s ease-out forwards; pointer-events: none; }
@keyframes mm-hsay { 0% { opacity: 0; transform: translateY(-80%) scale(.7); } 15% { opacity: 1; transform: translateY(-100%) scale(1.04); } 85% { opacity: 1; transform: translateY(-100%); } 100% { opacity: 0; transform: translateY(-115%); } }
.mm .scroll { position: relative; flex: 1; min-width: 0; padding: 14px 20px; border-radius: 18px; background: linear-gradient(180deg, #FFF8E6, #F6E7C4); border: 2px solid #D9B77A; box-shadow: 0 8px 18px -12px rgba(120, 85, 45, .6); touch-action: none; }
.mm .scroll::before { content: ""; position: absolute; left: -10px; top: 50%; width: 16px; height: 16px; margin-top: -8px; background: #FFF4DB; border-left: 2px solid #D9B77A; border-bottom: 2px solid #D9B77A; transform: rotate(45deg); }
.mm .scroll small { display: block; font-family: var(--f-display); font-weight: 600; font-size: 14px; letter-spacing: .05em; text-transform: uppercase; color: #9A7440; }
.mm .scroll b { display: block; font-family: var(--f-display); font-size: clamp(22px, 2.6vw, 30px); line-height: 1.25; text-wrap: balance; }
.mm .scroll .sub { display: block; margin-top: 4px; font-size: 16px; color: var(--ink-soft); }
.scroll-ghost { position: fixed; z-index: 40; pointer-events: none; opacity: .92; transform: rotate(-3deg) scale(.9); padding: 12px 16px; border-radius: 18px; background: #FFF4DB; border: 2px solid #D9B77A; font-family: 'Grandstander', system-ui, sans-serif; color: #3E2F27; box-shadow: 0 16px 30px -10px rgba(0, 0, 0, .35); }
.scroll-ghost small { display: none; } .scroll-ghost b { font-size: 20px; }
.mm .choices.four { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.mm .reasons { display: grid; gap: 10px; }
.mm .picked { display: flex; align-items: center; gap: 8px; justify-self: start; padding: 4px 14px; border-radius: 999px; background: var(--good-bg); border: 2px solid var(--good); color: var(--good); font-family: var(--f-display); font-weight: 700; font-size: 20px; }
.mm .picked svg { width: 20px; height: 20px; }
.mm .why { font-family: var(--f-display); font-weight: 700; font-size: 22px; }
.mm .reason { text-align: left; min-height: 60px; padding: 10px 16px; font-size: 19px; font-weight: 600; line-height: 1.3; background: var(--card); border: 2px solid var(--ink); border-radius: 16px; box-shadow: 0 4px 0 var(--ink); }
.mm .reason:active { transform: translateY(2px); box-shadow: 0 2px 0 var(--ink); }
.mm .reason.faded { opacity: .35; box-shadow: none; }
.mm .reason.right { background: var(--good-bg); border-color: var(--good); color: var(--good); }
.mm .chests { display: grid; gap: 10px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.mm .chests.n2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.mm .chest { display: grid; justify-items: center; gap: 4px; padding: 10px 6px 12px; background: var(--card); border: 2px solid var(--ink); border-radius: 18px; box-shadow: 0 4px 0 var(--ink); }
.mm .chest b { font-family: var(--f-display); font-size: 20px; }
.mm .chest .chest-svg { width: 100%; max-width: 96px; height: auto; overflow: visible; }
.mm .chest .lid { transform-origin: 10px 38px; transition: transform .35s cubic-bezier(.3, 1.5, .5, 1); }
.mm .chest .gold { opacity: 0; transition: opacity .3s .15s; }
.mm .chest.over, .mm .chest:hover { background: var(--sun-soft); }
.mm .chest.over .lid { transform: rotate(-18deg); }
.mm .chest.open { background: var(--good-bg); border-color: var(--good); }
.mm .chest.open .lid { transform: rotate(-38deg); }
.mm .chest.open .gold { opacity: 1; }
.mm .chest.faded { opacity: .35; box-shadow: none; }
.mm .tester { display: grid; gap: 12px; }
.mm .tests { display: grid; gap: 10px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.mm .tbtn { min-height: 60px; font-family: var(--f-display); font-size: 24px; font-weight: 700; background: var(--card); border: 2px solid var(--tens-dk); color: var(--tens-dk); border-radius: 16px; box-shadow: 0 4px 0 var(--tens-dk); }
.mm .tbtn:active { transform: translateY(2px); box-shadow: 0 2px 0 var(--tens-dk); }
.mm .tbtn.done.ok { background: var(--good-bg); border-color: var(--good); color: var(--good); box-shadow: 0 4px 0 var(--good); }
.mm .tbtn.done.bad { background: #FBE3E3; border-color: #A93E4F; color: #A93E4F; box-shadow: 0 4px 0 #A93E4F; }
.mm .tlog { display: grid; gap: 6px; padding: 12px 14px; border-radius: 16px; background: var(--paper); border: 2px dashed var(--edge); font-size: 19px; font-weight: 600; }
.mm .tl.ok { color: var(--good); } .mm .tl.bad { color: #A93E4F; } .mm .tl.none { color: var(--ink-soft); font-weight: 500; }
.mm .verdicts { display: grid; gap: 8px; }
.mm .teach .choices { grid-template-columns: 1fr; }
.mm .box.bonnie, .mm .box.bonnie.active { border-style: dashed; border-color: var(--fur-dk); background: var(--fur-bg); color: var(--fur-dk); }
.mm .teach { display: grid; gap: 10px; }
.mm .teach-card { display: flex; align-items: center; gap: 10px; background: var(--fur-bg); border: 3px dashed var(--fur-dk); border-radius: 16px; padding: 10px 14px; color: var(--fur-dk); font-weight: 700; }
.mm .teach-card svg { width: 26px; height: 26px; flex: none; }
.mm .teach-card b { margin-left: auto; font-family: var(--f-display); font-size: 34px; color: var(--ink); }
.mm .warm-chip.teach-chip { background: #EFE3F7; color: #5b2c9c; }
.mm .wait-note { font-weight: 600; color: var(--ink-soft); }
.mm .verdicts .choice[disabled]:not(.faded) { opacity: .45; box-shadow: none; }
@media (max-width: 560px) {
  .mm .host { width: 84px; }
  .mm .tests { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mm .chest b { font-size: 16px; }
}
/* the host's worked steps */
.mm .work { display: grid; gap: 10px; }
.mm .wstep { display: flex; align-items: center; gap: 14px; text-align: left; min-height: 60px; padding: 8px 16px; background: var(--card); border: 2px solid var(--ink); border-radius: 16px; box-shadow: 0 4px 0 var(--ink); font-family: var(--f-display); font-size: 24px; font-weight: 700; }
.mm button.wstep:active { transform: translateY(2px); box-shadow: 0 2px 0 var(--ink); }
.mm .wstep i { flex: none; font-style: normal; font-size: 14px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: var(--ink-soft); }
.mm .wstep span { flex: 1; display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.mm .wstep .box { height: 1.5em; font-size: 26px; }
.mm .wstep.ok { border-color: var(--good); box-shadow: 0 4px 0 var(--good); }
.mm .wstep .tick { color: var(--good); }
.mm .wstep.bad { border-color: #A93E4F; background: #FBE3E3; box-shadow: 0 4px 0 #A93E4F; }
.mm .wstep[disabled] { opacity: .7; }
.mm .wait-note.big { font-family: var(--f-display); font-size: 22px; color: var(--ink); padding: 8px 4px; }
/* fitting the maths screen into the shared engine */
#area.mm-area { background: none; border: 0; box-shadow: none; padding: 0; min-height: 0; }
.mm { font-family: var(--f-body); font-size: 18px; line-height: 1.45; color: var(--ink); }
.mm .num.main .d { display: inline-block; }
.mm .warm-chip { display: inline-block; padding: 2px 10px; margin-right: 6px; border-radius: 999px; background: var(--sun-soft); border: 2px solid var(--sun); color: var(--ink); letter-spacing: .03em; }
.mm .lvl-name { font-family: var(--f-display); font-weight: 600; font-size: 15px; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: -8px; }
.mm .buddy .bonnie { width: 104px; height: 104px; }
.mm .nl-dog { width: 72px; }
.mm .nl-dog svg { display: block; width: 100%; height: auto; overflow: visible; }
.mm .tickle-pop { position: absolute; left: 50%; bottom: calc(100% - 4px); transform: translateX(-50%); width: max-content; max-width: 210px; text-align: center; line-height: 1.2; background: #fff; border: 2px solid var(--fur); border-radius: 16px; padding: 2px 10px; font-family: var(--f-display); font-weight: 700; font-size: 16px; color: var(--fur-dk); animation: mm-tpop 1.6s ease-out forwards; pointer-events: none; z-index: 3; }
@keyframes mm-tpop { 0% { opacity: 0; transform: translate(-50%, 8px) scale(.6); } 20% { opacity: 1; transform: translate(-50%, 0) scale(1.05); } 80% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -16px); } }
.mm-numpop { font-family: 'Fredoka', 'Nunito', system-ui, sans-serif; }
`;
if (!document.getElementById('meadow-maths-kit')) {
  const st = document.createElement('style'); st.id = 'meadow-maths-kit'; st.textContent = CSS; document.head.appendChild(st);
}

window.MeadowMaths = {
  world, addLevels, SHAPES, rand, pick, shuffle, NAME, PL, len, pow, countsOf, partsOf, joinAnd, placeList, nameCount, colorNum, near, makesChoices,
  rd, fmtN, range, pick3, JUMPS, jumpOpts, gq, fillStep, shareDone, gridOk, shapeSVG, frac, sum, PRAISE, TIER_NAMES,
  burrow, burrowCount, burrowFull, burrowPlaced,
  teach: { slips: teachSlips, teachable, LINES: TEACH_LINES }, // Teach Bonnie (for the tests)
  numberLines,
  helpLines, // every clue and step-card line a world can say (for the voice recorder)
  // repaint the picture after a step changes it (the burrow and other pictures, or the place value blocks)
  redraw: () => { if (!S || !root()) return; if (S.q.vis) redrawG(); else if (S.q.mode) redrawVisual(); },
  peek: () => S,   // the question on screen, read only (for the browser tests)
};
})();
