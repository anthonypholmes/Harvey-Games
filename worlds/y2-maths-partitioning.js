/*
 * Year 2 Maths, World 1: The Partitioning Park (splitting numbers into tens and ones, and more).
 * Needs worlds/y2-maths-kit.js first. All the questions are the same as the old Meadow Maths.
 *
 * Each level: num() makes a normal question's number; easy() is the gentler version the
 * engine switches to after two hard questions in a row (Meadow.learner).
 */
(() => {
'use strict';
const M = window.MeadowMaths;
const { rand, pick, shuffle, PL, len, pow, countsOf, partsOf, joinAnd, placeList, nameCount, near, makesChoices } = M;

function numNoZero(L) { let s = '' + rand(1, 9); for (let i = 1; i < L; i++) s += rand(1, 9); return +s; }
function numWithZero(L) {
  for (;;) {
    const n = rand(pow(L - 1), pow(L) - 1), rest = String(n).slice(1);
    if (rest.includes('0') && /[1-9]/.test(rest)) return n;
  }
}
// every digit from 1 to max: the gentle version of a level's numbers
function smallNum(L, max) { let s = ''; for (let i = 0; i < L; i++) s += rand(1, max); return +s; }

const LEVELS = [
  { name: 'Teen Numbers', blurb: 'Numbers from 11 to 19', eg: '14 = 10 + 4', mode: 'blocks',
    quest: 'Bonnie’s bone bag burst! Sort the teen numbers into tens and ones.',
    num: () => rand(11, 19), easy: () => rand(11, 15),
    seq: ['build', 'split', 'what', 'split', 'missing', 'build', 'what', 'split'] },
  { name: 'Tens and Ones', blurb: 'Numbers up to 99', eg: '47 = 40 + 7', mode: 'blocks',
    quest: 'Picnic time! Split each number for Bonnie’s basket.',
    num: () => numNoZero(2), easy: () => smallNum(2, 5),
    seq: ['split', 'what', 'build', 'split', 'digit', 'what', 'missing', 'split'] },
  { name: 'Missing Parts', blurb: 'Find the part that is hiding', eg: '63 = 60 + ?', mode: 'blocks',
    quest: 'A cheeky squirrel pinched a part! Find what’s missing.',
    num: () => numNoZero(2), easy: () => smallNum(2, 5),
    seq: ['missing', 'digit', 'missing', 'what', 'missing', 'split', 'missing', 'digit'] },
  { name: 'Hundreds', blurb: 'Numbers up to 999', eg: '352 = 300 + 50 + 2', mode: 'counters',
    quest: 'Bonnie found a giant bone pile. Count it in hundreds!',
    num: () => numNoZero(3), easy: () => smallNum(3, 4),
    seq: ['split', 'what', 'digit', 'build', 'missing', 'split', 'digit', 'what'] },
  { name: 'Tricky Zeros', blurb: 'When a place has nothing in it', eg: '405 = 400 + 5', mode: 'counters',
    quest: 'Zero is hiding in the long grass. Spot the empty places!',
    num: () => numWithZero(3), easy: () => rand(1, 5) * 100 + (Math.random() < .5 ? rand(1, 5) : rand(1, 5) * 10),
    seq: ['split', 'what', 'split', 'missing', 'what', 'split', 'build', 'digit'] },
  { name: 'Split It Another Way', blurb: 'Swap a ten for ten ones', eg: '45 = 30 + 15', mode: 'blocks',
    quest: 'Bonnie wants to swap a ten for ten treats. Split it another way!',
    num: (k, type) => rand(type === 'breakC' ? 3 : 2, 9) * 10 + rand(0, 9),
    easy: () => rand(2, 4) * 10 + rand(1, 5), easyType: () => 'breakA',
    seq: ['breakA', 'breakA', 'breakB', 'breakA', 'breakC', 'breakB', 'breakA', 'breakB'] },
  { name: 'Thousands', blurb: 'Numbers up to 9999', eg: '2463 = 2000 + 400 + 60 + 3', mode: 'counters',
    quest: 'The meadow fair has thousands of visitors! Split the big numbers.',
    num: k => (k % 3 === 2 ? numWithZero(4) : numNoZero(4)), easy: () => smallNum(4, 4),
    seq: ['split', 'digit', 'what', 'missing', 'split', 'digit', 'build', 'split'] },
  { name: 'Partition to Add', blurb: 'Split numbers to add them', eg: '34 + 25 = 59', mode: null,
    quest: 'Bonnie is adding up her treats. Tens first, then ones!',
    num: k => {
      let ta, tb, oa, ob;
      if (k < 4) { ta = rand(1, 7); tb = rand(1, 8 - ta); oa = rand(1, 8); ob = rand(1, 9 - oa); }
      else { ta = rand(1, 6); tb = rand(1, 7 - ta); oa = rand(3, 9); ob = rand(10 - oa, 9); }
      return [ta * 10 + oa, tb * 10 + ob];
    },
    easy: () => [rand(1, 3) * 10 + rand(1, 4), rand(1, 3) * 10 + rand(1, 4)],
    seq: ['add', 'add', 'add', 'add', 'add', 'add', 'add', 'add'] },
];

function distractors(n) {
  const s = String(n), L = s.length, set = new Set();
  set.add(+[...s].reverse().join(''));
  for (let i = 0; i < L - 1; i++) { const a = [...s]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; set.add(+a.join('')); }
  for (let p = 0; p < L; p++) { set.add(n + pow(p)); set.add(n - pow(p)); }
  return [...set].filter(x => x !== n && len(x) === L);
}

/* Each question says what it shows (eq, visual) and what counts as right (answer).
   Help is worked out from the question when it is needed: clue() and steps() below. */
function makeQ(type, n, lv) {
  if (type === 'add') return makeAdd(n[0], n[1]);
  const L = len(n), c = countsOf(n);
  const places = []; for (let p = L - 1; p >= 0; p--) places.push(p);
  const parts = partsOf(n);
  const q = {
    type, n, L, mode: lv.mode, places, parts, counts: { ...c }, target: { ...c }, inter: null,
    showVisual: type !== 'digit', kind: 'boxes', tip: '', boxes: 1,
  };
  const zeros = places.filter(p => c[p] === 0);
  const zeroTip = zeros.length && type !== 'what' && type !== 'digit'
    ? `${n} has 0 ${joinAnd(zeros.map(p => PL[p].name))}, so there ${parts.length === 1 ? 'is 1 part' : `are ${parts.length} parts`}.` : '';

  if (type === 'split') {
    q.prompt = `Split ${n} into ${placeList(n)}.`;
    q.eq = [{ main: n }, '='];
    parts.forEach((_, i) => { if (i) q.eq.push('+'); q.eq.push({ box: i }); });
    q.boxes = parts.length; q.answer = parts.slice(); q.tip = zeroTip || (lv.mode === 'blocks' && c[1] ? 'Tap the blue rods to count them in tens.' : '');
  }
  else if (type === 'missing') {
    const h = rand(0, parts.length - 1);
    q.prompt = 'Find the missing part.';
    q.eq = [{ main: n }, '='];
    parts.forEach((v, i) => { if (i) q.eq.push('+'); q.eq.push(i === h ? { box: 0 } : { num: v }); });
    q.answer = [parts[h]]; q.tip = zeroTip;
  }
  else if (type === 'what') {
    q.kind = 'choice';
    q.prompt = 'What number is this?';
    q.eq = null;
    q.choices = shuffle([n, ...shuffle(distractors(n)).slice(0, L <= 2 ? 2 : 3)]);
    q.answer = [n];
  }
  else if (type === 'digit') {
    q.kind = 'choice';
    const s = String(n);
    let opts = places.filter(p => c[p] !== 0);
    const unique = opts.filter(p => s.split(String(c[p])).length === 2);
    if (unique.length) opts = unique;
    const p = pick(opts), d = c[p];
    q.digit = d; q.digitPlace = p;
    q.prompt = `What is the ${d} worth?`;
    q.eq = [{ mark: n, pos: p }];
    q.choices = places.slice().reverse().map(k => d * pow(k));
    q.answer = [d * pow(p)];
  }
  else if (type === 'build') {
    q.kind = 'build'; q.inter = 'build';
    q.counts = {}; places.forEach(p => q.counts[p] = 0);
    q.prompt = `Make ${n}.`;
    q.tip = 'Tap <b>+</b> to add. Tap <b>−</b> to take one away.';
    q.eq = [{ main: n }];
    q.answer = [n];
  }
  else if (type.startsWith('break')) {
    const variant = type.slice(5), t = c[1], o = c[0], k = variant === 'C' ? 2 : 1;
    const a = (t - k) * 10, b = k * 10 + o;
    Object.assign(q, { variant, k, t, inter: 'break', broke: 0 });
    q.prompt = `Split ${n} another way.`;
    q.tip = 'Tap a ten to swap it for 10 ones.';
    if (variant === 'B') { q.eq = [{ main: n }, '=', { box: 0 }, '+', { num: b }]; q.answer = [a]; }
    else { q.eq = [{ main: n }, '=', { num: a }, '+', { box: 0 }]; q.answer = [b]; }
  }
  return q;
}

function makeAdd(a, b) {
  const ta = a - a % 10, tb = b - b % 10, oa = a % 10, ob = b % 10;
  return {
    type: 'add', n: a + b, kind: 'boxes', showVisual: false, mode: null, places: [], add: { a, b, ta, tb, oa, ob },
    prompt: `Work out ${a} + ${b}.`,
    tip: 'Add the tens. Add the ones. Put them together.',
    eq: [
      { text: 'Tens' }, { num: ta }, '+', { num: tb }, '=', { box: 0 }, '\n',
      { text: 'Ones' }, { num: oa }, '+', { num: ob }, '=', { box: 1 }, '\n',
      { text: 'So' }, { num: a }, '+', { num: b }, '=', { box: 2 },
    ],
    boxes: 3, answer: [ta + tb, oa + ob, a + b],
  };
}

/* ---------- Bonnie's help for these questions ---------- */
// the "4 vs 40" trap: rods are bundles of ten, so count them in tens
const hasRods = q => q.mode === 'blocks' && q.counts && q.counts[1] > 0;
const tensSeq = n => Array.from({ length: n }, (_, i) => (i + 1) * 10).join(', ');
const tensClue = q => ({ say: `Those long rods are super bundles worth 10 each! Count by tens: ${tensSeq(q.counts[1])}!`, point: 'place-1', skip: 1 });
function clue(q, K) {
  const named = p => `${PL[p].colour} ${PL[p].name}`;
  switch (q.type) {
    case 'split': case 'missing': {
      const v = K.targetFor(K.unsolvedBoxes()[0]), p = len(v) - 1;
      if (p === 1 && hasRods(q)) return tensClue(q);
      return { say: `Count the ${named(p)}.`, point: `place-${p}` };
    }
    case 'what': return hasRods(q) ? tensClue(q) : { say: 'Count each colour.', point: 'visual' };
    case 'digit': return { say: `Which place is the ${q.digit} in?`, point: 'mark' };
    case 'build': return { say: 'Each digit tells you how many.', point: 'main' };
    case 'add':
      if (!K.S.solved.has(0)) return { say: 'Add the tens first.', point: 'line-0' };
      if (!K.S.solved.has(1)) return { say: 'Now add the ones.', point: 'line-1' };
      return { say: 'Put them together.', point: 'line-2' };
    default:
      if (q.broke < q.k) return { say: 'Tap a ten to swap it.', point: 'rod' };
      return q.variant === 'B' ? tensClue(q) : { say: 'Count the orange ones.', point: 'place-0' };
  }
}

function steps(q, K) {
  const st = [];
  const placeSteps = (v, b) => {
    const p = len(v) - 1, c = v / pow(p);
    if (p === 1 && q.mode === 'blocks') {
      st.push({ say: 'How many super bundles of ten?', point: 'place-1', choices: near(c), answer: c });
      st.push({ say: `${c} bundle${c > 1 ? 's' : ''} of ten. Count by tens with me!`, point: 'place-1', choices: makesChoices(c, q.L || 2), answer: v, fill: { box: b }, onShow: () => K.skipCount(1, { delay: 2600 }) });
      return;
    }
    st.push({ say: `How many ${PL[p].name}?`, point: `place-${p}`, choices: near(c), answer: c });
    st.push({ say: `${nameCount(c, p)} makes…`, choices: makesChoices(c, q.L || 2), answer: v, fill: { box: b } });
  };
  if (q.type === 'split' || q.type === 'missing') {
    K.unsolvedBoxes().map(b => [K.targetFor(b), b]).forEach(([v, b]) => placeSteps(v, b));
  } else if (q.type === 'what') {
    q.places.forEach(p => st.push(p === 1 && q.mode === 'blocks'
      ? { say: 'How many super bundles of ten?', point: 'place-1', choices: near(q.target[p]), answer: q.target[p], onShow: () => K.skipCount(1, { delay: 2000 }) }
      : { say: `How many ${PL[p].name}?`, point: `place-${p}`, choices: near(q.target[p]), answer: q.target[p] }));
    st.push({ say: 'So the number is…', point: 'visual', choices: q.choices, answer: q.n, final: true });
  } else if (q.type === 'digit') {
    st.push({ say: `Which place is the ${q.digit} in?`, point: 'mark', choices: q.places.map(p => PL[p].name), answer: PL[q.digitPlace].name, words: true });
    st.push({ say: `${nameCount(q.digit, q.digitPlace)} makes…`, choices: q.choices, answer: q.answer[0], final: true });
  } else if (q.type === 'build') {
    q.places.forEach(p => {
      if (q.counts[p] !== q.target[p]) st.push({ say: `How many ${PL[p].name}?`, point: `digit-${p}`, choices: near(q.target[p]), answer: q.target[p], fill: { count: p } });
    });
  } else if (q.type === 'add') {
    const A = q.add, T = A.ta + A.tb, O = A.oa + A.ob, solved = K.S.solved;
    if (!solved.has(0)) st.push({ say: `${nameCount(A.ta / 10, 1)} and ${nameCount(A.tb / 10, 1)} make…`, point: 'line-0', choices: [T - 10, T, T + 10].filter(x => x > 0), answer: T, fill: { box: 0 } });
    if (!solved.has(1)) st.push({ say: `${A.oa} and ${A.ob} make…`, point: 'line-1', choices: near(O), answer: O, fill: { box: 1 } });
    if (!solved.has(2)) st.push({ say: `${T} and ${O} make…`, point: 'line-2', choices: [A.a + A.b - 1, A.a + A.b, A.a + A.b + 10], answer: A.a + A.b, fill: { box: 2 } });
  } else { // break
    if (q.broke < q.k) st.push({ say: q.k === 1 ? 'Tap a ten rod.' : 'Tap two ten rods.', point: 'rod', action: () => q.broke >= q.k });
    if (q.variant === 'B') {
      const left = q.t - q.k;
      st.push({ say: 'How many tens are left?', point: 'place-1', choices: near(left), answer: left });
      st.push({ say: `${nameCount(left, 1)} makes…`, choices: makesChoices(left, 2), answer: q.answer[0], fill: { box: 0 } });
    } else {
      st.push({ say: 'How many ones now?', point: 'place-0', choices: near(q.answer[0]), answer: q.answer[0], fill: { box: 0 } });
    }
  }
  return st;
}

// one question at a time: easy numbers (and an easier kind of question) when eased
const levels = LEVELS.map(lv => ({
  ...lv,
  make(seqType, k, easy) {
    const type = easy && lv.easyType ? lv.easyType(seqType) : seqType;
    const n = (easy ? lv.easy : lv.num)(k, type);
    const q = makeQ(type, n, lv);
    q.key = String(n);
    return q;
  },
}));

Meadow.registerWorld(M.world({
  id: 'y2-maths-partitioning', name: 'The Partitioning Park', tag: 'Splitting numbers', icon: '🧱', color: '#3B7FC4', tint: '#DCEAF7',
  intro: '<b>Partitioning</b> means breaking a number into parts. Every digit tells you how many ones, tens, hundreds or thousands there are.',
  ids: ['teen-numbers', 'tens-and-ones', 'missing-parts', 'hundreds', 'tricky-zeros', 'split-another-way', 'thousands', 'partition-to-add'],
  levels, clue, steps,
}));
})();
