/*
 * Meadow Maths kit: the question screen that all four Year 2 maths worlds share.
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
const itemSVG = k => (k === 'apple' ? APPLE : BONE);
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

const DEFS = {};        // the world files' own settings (clue and steps), by world id
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
  if (ctx.index === 0) askedLevel = false;
  clearSkip();
  S = { q, ctx, values: Array(q.boxes || 1).fill(''), active: 0, locked: false, busy: false,
    tier: 0, steps: null, step: 0, solved: new Set(), tried: new Set(), cluePoint: null, zone: null };
  if (q.inter === 'break') { q.counts = countsOf(q.n); q.broke = 0; }
  S.pos = q.line ? (q.line.pawn === 'sit' ? q.line.sitAt : q.line.start) : null;
  ctx.area.classList.add('mm-area');
  renderGame();
  const st = Meadow.save.get();
  if (st && st.readAloud) say(q.prompt);
}

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
  if (q.kind === 'choice') return spot(`choice-${q.answer[0]}`);
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
    case 'shape': return `<div class="gv-shape">${shapeSVG(v.shape, v.shade)}</div>`;
    case 'shapes': return `<div class="gv-row gv-shapes">${v.list.map(k => shapeSVG(k, 0)).join('')}</div>`;
  }
  return '';
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
  if (b.dataset.gBowl !== undefined) {
    if (sum(v.bowls) < v.N) { v.bowls[+b.dataset.gBowl]++; sfx.tap(); } else sfx.soft();
  } else if (b.dataset.g === 'each') {
    for (let i = 0; i < v.bowls.length && sum(v.bowls) < v.N; i++) v.bowls[i]++;
    tone([600, 760], .05, 'triangle', .08);
  } else if (b.dataset.g === 'fill') {
    if (v.N - v.baskets * v.s >= v.s) { v.baskets++; tone([600, 760], .05, 'triangle', .08); }
  } else if (b.dataset.g === 'reset') {
    if (v.bowls) v.bowls.fill(0); if ('baskets' in v) v.baskets = 0; sfx.tap();
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
  const hello = S.ctx.index === 0 ? `Woof! Let’s go, ${esc(NAME())}!`
    : q.kind === 'line' ? 'Drag me along the line!' : q.kind === 'grid' ? 'Tap a square to grow the orchard!' : q.kind === 'choice' ? 'Tap the answer.' : q.kind === 'build' ? 'Tap + to build it.' : 'Tap the numbers to fill the box.';
  S.ctx.area.innerHTML = `<div class="mm" id="mm">
    <div class="play">
      <div class="mcard stage">
        <div class="lvl-name">${esc(S.ctx.level.name)} · Question ${S.ctx.index + 1} of ${S.ctx.count}</div>
        ${quest ? `<div class="quest">${PAW}<span>${esc(quest)}</span></div>` : ''}
        <div class="prompt-row">
          <div class="prompt">${q.prompt}</div>
          <button class="micon" type="button" id="mmSay" aria-label="Read the question out loud">${ICON.speak}</button>
        </div>
        ${q.tip ? `<div class="tip">${q.tip}</div>` : ''}
        ${eqHTML(q)}
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
        : `<div class="chips">${st.choices.map((c, i) => `<button class="mchip${st.words ? ' word' : ''}" type="button" data-chip="${i}">${c}</button>`).join('')}</div>`}
    </div>`;
  } else if (q.kind === 'boxes') {
    el.innerHTML = `<div class="pad" id="pad">
      ${[7, 8, 9, 4, 5, 6, 1, 2, 3].map(d => `<button class="key" type="button" data-key="${d}" data-t="key-${d}">${d}</button>`).join('')}
      <button class="key del" type="button" data-key="del" data-t="key-del" aria-label="Delete">${ICON.del}</button>
      <button class="key" type="button" data-key="0" data-t="key-0">0</button>
      <button class="key check" type="button" data-key="check" data-t="key-check">Check</button>
    </div>`;
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
  if (!live()) return;
  const q = S.q;
  if (key === 'check') return onCheck();
  if (q.kind !== 'boxes' || S.tier === 2) return;
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
  if (q.kind === 'boxes') {
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
  if (val === S.q.answer[0]) { btn.classList.add('right'); return win(); }
  S.tried.add(val); btn.classList.add('faded'); btn.disabled = true;
  raise('wrong');
}

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
  Meadow.correct(origin, { praise: S.tier === 0 ? pick(PRAISE) : pick(TEAM) });
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
  dog.appendChild(p); setTimeout(() => p.remove(), 1200);
}

/* ---------- taps, drags and keys (set up once, for whichever question is showing) ---------- */
document.addEventListener('click', e => {
  const r = root(); if (!r || !r.contains(e.target)) return;
  const b = e.target.closest('button');
  if (!b) {
    const dog = e.target.closest('#gameBonnie'); if (dog) return tickleBonnie(dog);
    // tap the rods or counters to count them in tens (or hundreds)
    const g = e.target.closest('#visual .grp'); if (!g) return;
    const p = +(g.className.match(/\bp(\d)\b/) || [])[1];
    if (p >= 1) skipCount(p);
    return;
  }
  if (b.id === 'mmSay') return say(S.q.prompt);
  if (b.dataset.g || b.dataset.gBowl !== undefined) return gAction(b);
  if (b.id === 'mmAsk') { if (live()) raise('ask'); return; }
  if (b.dataset.chip !== undefined) return chooseStep(+b.dataset.chip, b);
  if (b.dataset.key) return press(b.dataset.key);
  if (b.dataset.box !== undefined) {
    const i = +b.dataset.box;
    if (!live() || S.solved.has(i) || S.tier === 3) return;
    S.active = i; sfx.tap(); return paintBoxes();
  }
  if (b.dataset.choice !== undefined) return choose(+b.dataset.choice, b);
  if (b.dataset.step && live()) {
    const q = S.q, p = +b.dataset.p, c = q.counts[p] + +b.dataset.step;
    if (c < 0 || c > 9) { sfx.soft(); if (c > 9) feedback('info', `<span>9 ${PL[p].name} is the most. Ten ${PL[p].name} would make the next place!</span>`); return; }
    q.counts[p] = c; sfx.tap();
    redrawVisual(b.dataset.step === '1' && p === 0 && q.mode === 'blocks' ? c - 1 : -1);
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
  if (!live()) return;
  if (dragId !== null && e.pointerId === dragId) movePawn(posFromX(e.clientX));
  if (gridDrag !== null && e.pointerId === gridDrag) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cell = el && el.closest('#gv-grid [data-cell]'); if (cell) setGridFrom(cell);
  }
});
['pointerup', 'pointercancel'].forEach(ev => document.addEventListener(ev, e => {
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
    make: ({ eased, index, type }) => {
      if (index === 0) used = new Set();
      let q, guard = 0;
      do { q = L.make(type, index, eased); guard++; } while (used.has(q.key) && guard < 60);
      used.add(q.key); q.eased = !!eased;
      return q;
    },
  };
}
// more levels for a maths world another file made (Stage 6: thirds and three quarters)
function addLevels(worldId, d) { return Meadow.addLevels(worldId, d.levels.map((L, i) => wrapLevel(L, d.ids[i]))); }
function world(d) {
  DEFS[d.id] = d;
  return {
    id: d.id, subject: 'maths', year: d.year || 2, name: d.name, tag: d.tag, icon: d.icon, color: d.color, tint: d.tint, intro: d.intro,
    layout: 'full', helpFrom: 2, hintNames: ['A clue', 'Step by step', 'Glowing buttons'], tierNames: TIER_NAMES, praise: PRAISE,
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
.mm .p0 { --c: var(--ones); --c-dk: var(--ones-dk); }
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
.mm .d.p0, .mm .d.p1, .mm .d.p2, .mm .d.p3 { color: var(--c); }
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
.mm .ctr { width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; background: var(--c); color: #fff; border: 3px solid var(--c-dk); font-weight: 700; font-size: 14px; letter-spacing: -.02em; }
.mm .p3 .ctr, .mm .ctr.p3 { font-size: 12px; }
.mm .glabel { font-size: 17px; font-weight: 600; color: var(--ink-soft); white-space: nowrap; }
.mm .glabel b { color: var(--c); font-size: 20px; }
.mm .steppers { display: flex; gap: 8px; }
.mm .mstep { width: 52px; height: 52px; border-radius: 14px; border: 3px solid var(--ink); background: var(--card); box-shadow: 0 3px 0 var(--ink); font-size: 30px; font-weight: 700; line-height: 1; padding: 0; }
.mm .mstep.plus { background: var(--c); color: #fff; }
.mm .mstep:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--ink); }
.mm .vis-tools { display: flex; justify-content: flex-end; }
.mm .side { display: grid; gap: 16px; }
.mm .feedback { min-height: 92px; padding: 14px 16px; border-radius: 16px; border: 3px solid transparent; font-size: 18px; font-weight: 600; display: flex; gap: 12px; align-items: center; background: var(--card); border-color: var(--grid); color: var(--ink-soft); }
.mm .feedback .bone { width: 22px; height: 22px; vertical-align: -5px; margin-right: 2px; }
.mm .feedback .big { display: block; font-family: var(--f-display); font-size: 26px; font-weight: 800; color: var(--good); }
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
.mm .mstep-say { font-family: var(--f-display); font-weight: 800; font-size: 28px; line-height: 1.15; text-wrap: balance; }
.mm .chips { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(84px, 1fr)); }
.mm .mchip { min-height: 80px; font-size: 32px; font-weight: 700; font-variant-numeric: tabular-nums; background: var(--card); border: 3px solid var(--ink); border-radius: 18px; box-shadow: 0 4px 0 var(--ink); }
.mm .mchip.word { font-size: 21px; }
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
/* fitting the maths screen into the shared engine */
#area.mm-area { background: none; border: 0; box-shadow: none; padding: 0; min-height: 0; }
.mm { font-family: var(--f-body); font-size: 18px; line-height: 1.45; color: var(--ink); }
.mm .num.main .d { display: inline-block; }
.mm .lvl-name { font-family: var(--f-display); font-weight: 600; font-size: 15px; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: -8px; }
.mm .buddy .bonnie { width: 104px; height: 104px; }
.mm .nl-dog { width: 72px; }
.mm .nl-dog svg { display: block; width: 100%; height: auto; overflow: visible; }
.mm .tickle-pop { position: absolute; left: 50%; top: -16px; transform: translateX(-50%); white-space: nowrap; background: #fff; border: 2px solid var(--fur); border-radius: 999px; padding: 2px 10px; font-family: var(--f-display); font-weight: 700; font-size: 16px; color: var(--fur-dk); animation: mm-tpop 1.2s ease-out forwards; pointer-events: none; z-index: 3; }
@keyframes mm-tpop { 0% { opacity: 0; transform: translate(-50%, 8px) scale(.6); } 20% { opacity: 1; transform: translate(-50%, 0) scale(1.05); } 80% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -16px); } }
.mm-numpop { font-family: 'Fredoka', 'Nunito', system-ui, sans-serif; }
`;
if (!document.getElementById('meadow-maths-kit')) {
  const st = document.createElement('style'); st.id = 'meadow-maths-kit'; st.textContent = CSS; document.head.appendChild(st);
}

window.MeadowMaths = {
  world, addLevels, SHAPES, rand, pick, shuffle, NAME, PL, len, pow, countsOf, partsOf, joinAnd, placeList, nameCount, colorNum, near, makesChoices,
  rd, fmtN, range, pick3, JUMPS, jumpOpts, gq, fillStep, shareDone, gridOk, shapeSVG, frac, sum, PRAISE, TIER_NAMES,
  peek: () => S,   // the question on screen, read only (for the browser tests)
};
})();
