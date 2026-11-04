/*
 * Year 2 Maths: Captain's Cove (reasoning: is the Captain's conjecture right?).
 * Needs worlds/y2-maths-kit.js first. Captain Croak makes claims (his "conjectures"); Bonnie helps test them.
 * Every claim is data with a check, so tests/captains-cove-test.html can prove the answer key is right:
 *   Level 1  TF:   each maker builds a claim and its truth; check(nums) works the truth out again.
 *   Level 2  ASN:  holds(x) is tried on every x in the domain → always / sometimes / never.
 *   Level 3  TEST: busted claims fail somewhere (and a test button shows it); true ones never fail.
 */
(() => {
'use strict';
const M = window.MeadowMaths;
const { rand, pick, shuffle, near, gq, NAME } = M;

const CAPTAIN = 'Captain Croak';   // the name lives here only, so it's easy to change
const range = (a, b, s = 1) => { const r = []; for (let x = a; x <= b; x += s) r.push(x); return r; };
const coin = () => Math.random() < .5;
const tens = n => Math.floor(n / 10), ones = n => n % 10;
const even = n => n % 2 === 0;
const T = n => `${n} ten${n === 1 ? '' : 's'}`;
const wrongBy = (c, opts) => pick(opts.map(d => c + d).filter(v => v >= 0 && v !== c));
const YN = ['Yes', 'No'];
const yn = b => (b ? 'Yes' : 'No');
const pairs = (a, b) => { const r = []; for (let x = a; x <= b; x++) for (let y = a; y <= b; y++) r.push([x, y]); return r; };

/* ---------- Captain Croak: a frog pirate on a lily-pad raft ---------- */
function croakSVG(mood = 'claim') {
  const busted = mood === 'busted', proud = mood === 'holds';
  const G = '#5DA34B', arm = d => `<path d="${d}" fill="none" stroke="${G}" stroke-width="10" stroke-linecap="round"/>`;
  const arms = mood === 'claim' ? arm('M128 128 Q150 112 158 90') + `<circle cx="159" cy="86" r="7" fill="${G}"/>`
    : busted ? arm('M126 130 Q148 120 150 98') + arm('M72 130 Q52 120 50 98') + `<circle cx="148" cy="94" r="7" fill="${G}"/><circle cx="52" cy="94" r="7" fill="${G}"/>`
    : arm('M128 132 Q146 140 136 150') + arm('M72 132 Q54 140 64 150');
  const mouth = busted ? '<ellipse cx="100" cy="112" rx="9" ry="7" fill="#7A2E3B"/>'
    : `<path d="M78 ${proud ? 106 : 108} Q100 ${proud ? 128 : 122} 122 ${proud ? 106 : 108}" fill="none" stroke="#2F5B2A" stroke-width="4" stroke-linecap="round"/>`;
  const eye = x => proud ? `<path d="M${x - 9} 78 q9 -8 18 0" fill="none" stroke="#2B2B2B" stroke-width="3.5" stroke-linecap="round"/>`
    : `<circle cx="${x}" cy="78" r="10" fill="#fff"/><circle cx="${busted ? x : x + 2}" cy="${busted ? 78 : 79}" r="${busted ? 3.2 : 5}" fill="#2B2B2B"/>`;
  return `<svg viewBox="0 0 200 200" role="img" aria-label="${CAPTAIN}">
    <ellipse cx="100" cy="176" rx="86" ry="18" fill="#3F8B5C"/><ellipse cx="100" cy="172" rx="82" ry="15" fill="#6CB86A"/>
    <path d="M100 172 L148 160 L154 168 Z" fill="#CFE6F5"/>
    <rect x="30" y="92" width="4" height="78" rx="2" fill="#8A5A36"/><path d="M34 96 Q62 112 34 146 Z" fill="#9CCB6B"/>
    <ellipse cx="100" cy="140" rx="40" ry="30" fill="${G}"/><ellipse cx="100" cy="146" rx="26" ry="20" fill="#DCEFB5"/>
    <ellipse cx="74" cy="164" rx="16" ry="7" fill="#4C8E3D"/><ellipse cx="126" cy="164" rx="16" ry="7" fill="#4C8E3D"/>
    ${arms}
    <path d="M74 122 Q100 134 126 122 L120 130 Q100 140 80 130 Z" fill="#D9534F"/><path d="M112 130 l10 14 l-12 -4 z" fill="#C2413D"/>
    <ellipse cx="100" cy="100" rx="38" ry="28" fill="${G}"/><circle cx="80" cy="78" r="15" fill="${G}"/><circle cx="120" cy="78" r="15" fill="${G}"/>
    ${eye(80)}${eye(120)}
    <circle cx="76" cy="106" r="5" fill="#F2A3A3" opacity=".7"/><circle cx="124" cy="106" r="5" fill="#F2A3A3" opacity=".7"/>
    ${mouth}
    ${busted ? '<path d="M150 60 l6 -10 M160 66 l10 -4 M146 52 l0 -12" stroke="#E0A500" stroke-width="3" stroke-linecap="round"/>' : ''}
    <g transform="${busted ? 'rotate(-14 100 62) translate(-4 -6)' : 'rotate(-4 100 62)'}">
      <path d="M58 66 Q100 22 142 66 Q100 56 58 66 Z" fill="#2E2A3A"/><path d="M50 66 Q100 50 150 66 Q100 76 50 66 Z" fill="#3B3650"/>
      <path d="M100 40 l4 8 l8 1 l-6 6 l2 8 l-8 -4 l-8 4 l2 -8 l-6 -6 l8 -1 z" fill="#FFC83D"/>
    </g></svg>`;
}
const HOST = { name: CAPTAIN, svg: croakSVG, says: {
  busted: 'Shiver me lily pads, you’ve busted my conjecture!',
  holds: 'Arr, my conjecture holds up!',
  sometimes: 'Sometimes right, sometimes not. Arr!',
} };

/* =====================================================================
   LEVEL 1  True or False?  make(easy) → { nums, truth, text, reasons: [right, wrong, wrong], clue, steps }
   steps: [say, choices, answer] small questions; the kit adds "So is the Captain right?" at the end.
   ===================================================================== */
const TF = [
  { id: 'add-tens', easyOk: false,
    make() { const a = rand(1, 6) * 10 + rand(1, 9), b = rand(1, 3) * 10, t = coin(), c = t ? a + b : wrongBy(a + b, [10, -10]);
      return { nums: { a, b, c }, truth: t, text: `${a} + ${b} = ${c}`, clue: 'Look at the tens!',
        reasons: [t ? `${T(tens(a))} and ${T(tens(b))} make ${T(tens(a) + tens(b))}` : `${T(tens(a))} and ${T(tens(b))} make ${T(tens(a) + tens(b))}, not ${tens(c)}`,
          'Adding tens changes the ones', `${T(tens(a))} and ${T(tens(b))} make ${T(tens(a) + tens(b) + 1)}`],
        steps: [[`How many tens in ${a}?`, near(tens(a)), tens(a)], [`How many tens in ${b}?`, near(tens(b)), tens(b)], [`${T(tens(a))} and ${T(tens(b))} make…`, near(tens(a) + tens(b)).map(T), T(tens(a) + tens(b))]] }; },
    check: ({ a, b, c }) => a + b === c },
  { id: 'bond-10', easyOk: true,
    make() { const a = rand(1, 9), t = coin(), b = t ? 10 - a : wrongBy(10 - a, [1, -1]);
      return { nums: { a, b }, truth: t, text: `${a} + ${b} = 10`, clue: `Count on from ${a} to 10.`,
        reasons: [t ? `${a} and ${10 - a} is a number bond to 10` : `${a} needs ${10 - a} to make 10, not ${b}`, 'Any two numbers make 10', `${a} needs ${10 - a + 1} to make 10`],
        steps: [[`${a} and what make 10?`, near(10 - a), 10 - a], [`Is that ${b}?`, YN, yn(b === 10 - a)]] }; },
    check: ({ a, b }) => a + b === 10 },
  { id: 'bond-20', easyOk: false,
    make() { const a = rand(11, 19), t = coin(), b = t ? 20 - a : wrongBy(20 - a, [1, -1]);
      return { nums: { a, b }, truth: t, text: `${a} + ${b} = 20`, clue: `Look at the ones in ${a}. What makes 10?`,
        reasons: [t ? `${ones(a)} and ${10 - ones(a)} make 10, and 10 more is 20` : `${a} needs ${20 - a} to make 20, not ${b}`, 'Numbers in the teens always make 20', `${a} needs ${20 - a + 2} to make 20`],
        steps: [[`${ones(a)} and what make 10?`, near(10 - ones(a)), 10 - ones(a)], [`So ${a} needs…`, near(20 - a), 20 - a], [`Is that ${b}?`, YN, yn(b === 20 - a)]] }; },
    check: ({ a, b }) => a + b === 20 },
  { id: 'take-tens', easyOk: false,
    make() { const a = rand(4, 9) * 10 + rand(0, 9), b = rand(1, 3) * 10, t = coin(), c = t ? a - b : wrongBy(a - b, [10, -10, 1]);
      return { nums: { a, b, c }, truth: t, text: `${a} − ${b} = ${c}`, clue: 'Take away the tens. The ones stay the same.',
        reasons: [t ? `Take ${T(tens(b))} from ${T(tens(a))}: ${T(tens(a) - tens(b))} are left, and the ones stay the same` : `${a} take away ${b} is ${a - b}, not ${c}`, 'Taking away tens changes the ones', `${a} take away ${b} is ${a - b + 10}`],
        steps: [[`${T(tens(a))} take away ${T(tens(b))} leaves…`, near(tens(a) - tens(b)).map(T), T(tens(a) - tens(b))], [`So ${a} − ${b} is…`, M.pick3(a - b, [a - b + 10, a - b - 10, a - b + 1].filter(v => v >= 0)), a - b]] }; },
    check: ({ a, b, c }) => a - b === c },
  { id: 'times-5', easyOk: true,
    make(easy) { const n = rand(1, easy ? 5 : 10), t = coin(), p = t ? n * 5 : wrongBy(n * 5, [5, -5]);
      return { nums: { n, p }, truth: t, text: `${n} × 5 = ${p}`, clue: 'Count in fives!',
        reasons: [t ? `${n} fives make ${n * 5}` : `${n} fives make ${n * 5}, not ${p}`, 'Numbers in the 5 times table always end in 5', `${n} fives make ${n * 5 + 1}`],
        steps: [[`Count ${n} fives. What do you get?`, M.pick3(n * 5, [n * 5 + 5, n * 5 - 5, n * 5 + 10].filter(v => v > 0)), n * 5], [`Is that ${p}?`, YN, yn(p === n * 5)]] }; },
    check: ({ n, p }) => n * 5 === p },
  { id: 'times-2', easyOk: true,
    make(easy) { const n = rand(1, easy ? 6 : 12), t = coin(), p = t ? n * 2 : wrongBy(n * 2, [1, 2, -2]);
      return { nums: { n, p }, truth: t, text: `${n} × 2 = ${p}`, clue: 'Times 2 means double it!',
        reasons: [t ? `Double ${n} is ${n * 2}` : `Double ${n} is ${n * 2}, not ${p}`, `${n} × 2 is the same as ${n} + 2`, `Double ${n} is ${n * 2 + 2}`],
        steps: [[`Double ${n} is…`, near(n * 2), n * 2], [`Is that ${p}?`, YN, yn(p === n * 2)]] }; },
    check: ({ n, p }) => n * 2 === p },
  { id: 'times-10', easyOk: true,
    make(easy) { const n = rand(1, easy ? 5 : 10), t = coin(), p = t ? n * 10 : pick([n + 10, n * 10 + 1, n * 10 - 10].filter(v => v !== n * 10 && v > 0));
      return { nums: { n, p }, truth: t, text: `${n} × 10 = ${p}`, clue: 'Count in tens!',
        reasons: [t ? `${n} tens make ${n * 10}` : `${n} tens make ${n * 10}, not ${p}`, '× 10 means add 10', `${n} tens make ${n * 10 + 10}`],
        steps: [[`${T(n)} make…`, M.pick3(n * 10, [n * 10 + 10, n + 10, n * 10 - 10].filter(v => v > 0)), n * 10], [`Is that ${p}?`, YN, yn(p === n * 10)]] }; },
    check: ({ n, p }) => n * 10 === p },
  { id: 'half', easyOk: true,
    make(easy) { const h = rand(1, easy ? 5 : 10), n = h * 2, t = coin(), s = t ? h : wrongBy(h, [1, -1, 2]);
      return { nums: { n, s }, truth: t, text: `Half of Bonnie’s ${n} bones is ${s}`, clue: 'Half means two equal parts.',
        reasons: [t ? `${h} + ${h} = ${n}` : `${s} + ${s} = ${s * 2}, not ${n}`, 'Half means take away 2', `${h} + ${h} = ${n + 2}`],
        steps: [[`${s} + ${s} is…`, near(s * 2), s * 2], [`Is that ${n}?`, YN, yn(s * 2 === n)]] }; },
    check: ({ n, s }) => s * 2 === n },
  { id: 'quarter', easyOk: false,
    make() { const q = rand(1, 5), n = q * 4, t = coin(), s = t ? q : wrongBy(q, [1, -1, q]);
      return { nums: { n, s }, truth: t, text: `A quarter of ${n} is ${s}`, clue: 'A quarter is half of a half!',
        reasons: [t ? `Half of ${n} is ${n / 2}, and half of ${n / 2} is ${q}` : `Half of ${n} is ${n / 2}, and half of ${n / 2} is ${q}, not ${s}`, 'A quarter means take away 4', `Half of ${n} is ${n / 2 + 1}`],
        steps: [[`Half of ${n} is…`, near(n / 2), n / 2], [`Half of ${n / 2} is…`, near(q), q], [`Is that ${s}?`, YN, yn(s === q)]] }; },
    check: ({ n, s }) => s * 4 === n },
  { id: 'third', easyOk: false,
    make() { const q = rand(2, 5), n = q * 3, t = coin(), s = t ? q : wrongBy(q, [1, -1]);
      return { nums: { n, s }, truth: t, text: `A third of ${n} is ${s}`, clue: 'Share it into 3 equal groups.',
        reasons: [t ? `${n} shared into 3 equal groups is ${q} in each` : `${n} shared into 3 equal groups is ${q} in each, not ${s}`, 'A third means take away 3', `${n} shared into 3 is ${q + 1} in each`],
        steps: [[`3 lots of what make ${n}?`, near(q), q], [`Is that ${s}?`, YN, yn(s === q)]] }; },
    check: ({ n, s }) => s * 3 === n },
  { id: 'place-value', easyOk: true,
    make() { const a = rand(2, 9), b = rand(1, 9), n = a * 10 + b, t = coin(), tw = t ? a : (b !== a ? b : a + 1);
      return { nums: { n, tw }, truth: t, text: `${n} has ${T(tw)}`, clue: 'The first digit tells you the tens.',
        reasons: [t ? `${n} is ${a * 10} + ${b}, and ${a * 10} is ${T(a)}` : `${n} is ${a * 10} + ${b}, so it has ${T(a)}, not ${tw}`, 'The last digit tells you the tens', `${n} is ${a * 10 + 10} + ${b}`],
        steps: [[`${n} is ${a * 10} and…`, near(b), b], [`How many tens in ${a * 10}?`, near(a), a], [`Is that ${tw}?`, YN, yn(tw === a)]] }; },
    check: ({ n, tw }) => tens(n) === tw },
  { id: 'compare', easyOk: true,
    make() { let a, b; do { a = rand(1, 9); b = rand(1, 9); } while (a === b);
      const x = a * 10 + b, y = b * 10 + a, t = coin(), [l, r] = t === (x > y) ? [x, y] : [y, x];
      return { nums: { l, r }, truth: t, text: `${l} is bigger than ${r}`, clue: 'Look at the tens first!',
        reasons: [t ? `${l} has ${T(tens(l))} and ${r} has only ${T(tens(r))}` : `${l} has only ${T(tens(l))} and ${r} has ${T(tens(r))}`, 'The number with the bigger ones digit is bigger', 'They have the same digits, so they are the same'],
        steps: [[`How many tens in ${l}?`, near(tens(l)), tens(l)], [`How many tens in ${r}?`, near(tens(r)), tens(r)], [`Does ${l} have more tens?`, YN, yn(l > r)]] }; },
    check: ({ l, r }) => l > r },
  { id: 'odd-even', easyOk: true,
    make(easy) { const n = rand(easy ? 2 : 11, easy ? 20 : 50), t = coin(), word = t === even(n) ? 'even' : 'odd';
      return { nums: { n, word }, truth: t, text: `${n} is ${word}`, clue: 'Look at the ones digit.',
        reasons: [even(n) ? `${n} ends in ${ones(n)}, so it is in the 2 times table` : `${n} ends in ${ones(n)}, so it is not in the 2 times table`, 'Big numbers are always even', `${n} ends in ${ones(n)}, and ${ones(n)} is ${even(n) ? 'odd' : 'even'}`],
        steps: [[`What does ${n} end in?`, near(ones(n)), ones(n)], [`Is ${ones(n)} in the 2 times table?`, YN, yn(even(n))], [`So ${n} is…`, ['odd', 'even'], even(n) ? 'even' : 'odd']] }; },
    check: ({ n, word }) => (word === 'even') === even(n) },
  { id: 'share', easyOk: true,
    make(easy) { const g = pick(easy ? [2] : [2, 3, 5]), e = rand(2, easy ? 5 : 6), n = g * e, t = coin(), s = t ? e : wrongBy(e, [1, -1]);
      return { nums: { n, g, s }, truth: t, text: `If ${NAME()} shares ${n} bones between ${g} dogs, each dog gets ${s}`, clue: 'Share them out one each.',
        reasons: [t ? `${g} lots of ${e} make ${n}` : `${g} lots of ${s} make ${g * s}, not ${n}`, `Sharing means take away ${g}`, `${g} lots of ${e} make ${n + g}`],
        steps: [[`${g} lots of what make ${n}?`, near(e), e], [`Is that ${s}?`, YN, yn(s === e)]] }; },
    check: ({ n, g, s }) => g * s === n },
  { id: 'fact-family', easyOk: false,
    make() { const a = rand(6, 9), b = pick([3, 4, 5, 6, 7, 8, 9].filter(x => x !== a)), c = a + b, t = coin(), d = t ? a : wrongBy(a, [1, -1]);
      return { nums: { a, b, c, d }, truth: t, text: `${a} + ${b} = ${c}, so ${c} − ${b} = ${d}`, clue: 'Taking away undoes adding!',
        reasons: [t ? `Taking away undoes adding: ${c} − ${b} gets back to ${a}` : `Taking away undoes adding: ${c} − ${b} gets back to ${a}, not ${d}`, 'Adding and taking away are not linked', `${c} − ${b} gets back to ${a + 2}`],
        steps: [[`${a} + ${b} = ${c}. Take the ${b} away again. What's left?`, near(a), a], [`Is that ${d}?`, YN, yn(d === a)]] }; },
    check: ({ a, b, c, d }) => a + b === c && c - b === d },
];

let tfOrder = [];
function makeTF(k, easy) {
  if (k === 0 || !tfOrder.length) tfOrder = shuffle(TF.map((_, i) => i));
  const pool = tfOrder.filter(i => !easy || TF[i].easyOk);
  const m = TF[pool[k % pool.length]], c = m.make(easy);
  const right = c.reasons[0], wrongs = shuffle(c.reasons.slice(1)).slice(0, easy ? 1 : 2);
  const list = shuffle([right, ...wrongs]), picks = ['True', 'False'], ans = c.truth ? 0 : 1;
  const steps = c.steps.map(([say, choices, answer]) => ({ say, choices, answer, words: choices.some(x => typeof x === 'string' && x.length > 3) }));
  steps.push({ say: 'So is the Captain right?', choices: picks, answer: picks[ans], words: true });
  const q = gq({ t: 'tf-' + m.id, kind: 'verdict', prompt: 'Is the Captain right?', answer: [ans], key: c.text,
    clue: { say: c.clue, point: 'scroll' }, steps: () => steps });
  q.claim = { text: c.text }; q.claimTrue = c.truth; q.nums = c.nums; q.maker = m.id;
  q.verdict = { picks, right: [ans], why: 'Now, how do you know?', reasons: () => ({ list, answer: list.indexOf(right) }) };
  return q;
}

/* =====================================================================
   LEVEL 2  Treasure Chests: Always, Sometimes or Never?
   show(x) and ask(x) make the step card's examples. Easy mode: only the claims marked easy, with 2 chests.
   ===================================================================== */
const n100 = range(0, 89), n20 = range(1, 20);
const evPairs = pairs(0, 30).filter(([a, b]) => even(a) && even(b)), odPairs = pairs(1, 31).filter(([a, b]) => !even(a) && !even(b)), oePairs = pairs(0, 30).filter(([a, b]) => !even(a) && even(b));
const sumShow = ([a, b]) => `${a} + ${b} = ${a + b}`;
const ASN = [
  { id: 'add-10-ones', text: 'Adding 10 keeps the ones digit the same', answer: 'always', easy: true, domain: n100, holds: n => ones(n + 10) === ones(n),
    clue: 'Try a few numbers! Look at the ones digit.', show: n => `${n} + 10 = ${n + 10}`, ask: () => 'Is the ones digit the same?' },
  { id: 'even+even', text: 'Even + even makes an even number', answer: 'always', domain: evPairs, holds: ([a, b]) => even(a + b),
    clue: 'Try adding two even numbers.', show: sumShow, ask: ([a, b]) => `Is ${a + b} even?` },
  { id: 'odd+odd', text: 'Odd + odd makes an even number', answer: 'always', domain: odPairs, holds: ([a, b]) => even(a + b),
    clue: 'Can you make pairs? The two odd ones pair up!', show: sumShow, ask: ([a, b]) => `Is ${a + b} even?` },
  { id: 'odd+even', text: 'Odd + even makes an odd number', answer: 'always', domain: oePairs, holds: ([a, b]) => !even(a + b),
    clue: 'Try an odd number add an even one.', show: sumShow, ask: ([a, b]) => `Is ${a + b} odd?` },
  { id: 'tens-end-0', text: 'Numbers in the 10 times table end in 0', answer: 'always', easy: true, domain: range(10, 100, 10), holds: n => ones(n) === 0,
    clue: 'Count in tens. Look at the last digit.', show: n => `${n / 10} × 10 = ${n}`, ask: n => `Does ${n} end in 0?` },
  { id: 'twos-even', text: 'Numbers in the 2 times table are even', answer: 'always', easy: true, domain: range(2, 24, 2), holds: even,
    clue: 'Count in twos!', show: n => `${n / 2} × 2 = ${n}`, ask: n => `Is ${n} even?` },
  { id: 'fives-end', text: 'Numbers in the 5 times table end in 0 or 5', answer: 'always', domain: range(5, 60, 5), holds: n => ones(n) === 0 || ones(n) === 5,
    clue: 'Count in fives. Look at the last digit.', show: n => `${n / 5} × 5 = ${n}`, ask: n => `Does ${n} end in 0 or 5?` },
  { id: 'add-order', text: 'You can add two numbers in any order and get the same answer', answer: 'always', easy: true, domain: pairs(1, 20), holds: ([a, b]) => a + b === b + a,
    clue: 'Try it both ways round.', show: ([a, b]) => `${a} + ${b} = ${a + b} and ${b} + ${a} = ${a + b}`, ask: () => 'Same answer both ways?' },
  { id: 'times-order', text: 'You can swap the numbers when you times and get the same answer', answer: 'always', domain: pairs(1, 12).filter(([a]) => [2, 5, 10].includes(a)), holds: ([a, b]) => a * b === b * a,
    clue: 'Think of an array. Turn it round!', show: ([a, b]) => `${a} × ${b} = ${a * b} and ${b} × ${a} = ${a * b}`, ask: () => 'Same answer both ways?' },
  { id: 'add-0', text: 'Adding 0 leaves a number the same', answer: 'always', easy: true, domain: range(0, 100), holds: n => n + 0 === n,
    clue: 'Adding 0 means adding nothing.', show: n => `${n} + 0 = ${n}`, ask: n => `Is it still ${n}?` },
  { id: 'tens-in-fives', text: 'Numbers in the 10 times table are in the 5 times table too', answer: 'always', domain: range(10, 60, 10), holds: n => n % 5 === 0,
    clue: 'Count in fives. Do you land on the tens numbers?', show: n => `${n} = ${n / 5} fives`, ask: n => `Is ${n} in the 5 times table?` },
  { id: 'half-whole', text: 'Half of a number is a whole number', answer: 'sometimes', domain: n20, holds: even,
    clue: 'Try an even number, then an odd one.', show: n => `Halve ${n} bones`, ask: n => `Can you halve ${n} bones without breaking one?` },
  { id: 'fives-odd', text: 'Numbers in the 5 times table are odd', answer: 'sometimes', domain: range(5, 60, 5), holds: n => !even(n),
    clue: 'Count in fives: 5, 10, 15, 20…', show: n => `${n} is in the 5 times table`, ask: n => `Is ${n} odd?` },
  { id: 'sum-even', text: 'Adding two numbers makes an even number', answer: 'sometimes', domain: pairs(1, 20), holds: ([a, b]) => even(a + b),
    clue: 'Try a few different pairs.', show: sumShow, ask: ([a, b]) => `Is ${a + b} even?` },
  { id: 'twos-in-fives', text: 'Numbers in the 2 times table are in the 5 times table too', answer: 'sometimes', domain: range(2, 24, 2), holds: n => n % 5 === 0,
    clue: 'Try 2, then try 10.', show: n => `${n} is in the 2 times table`, ask: n => `Is ${n} in the 5 times table?` },
  { id: 'share-2', text: 'A number of bones can be shared fairly between 2 dogs', answer: 'sometimes', domain: n20, holds: even,
    clue: 'Try sharing an even number, then an odd one.', show: n => `Share ${n} bones between 2 dogs`, ask: n => `Is it fair, with none left over?` },
  { id: 'share-4', text: 'A number of bones can be shared fairly into quarters', answer: 'sometimes', domain: n20, holds: n => n % 4 === 0,
    clue: 'Try 8, then try 10.', show: n => `Share ${n} bones between 4 dogs`, ask: () => 'Is it fair, with none left over?' },
  { id: 'cross-ten', text: 'Adding two 1-digit numbers makes a number bigger than 10', answer: 'sometimes', domain: pairs(1, 9), holds: ([a, b]) => a + b > 10,
    clue: 'Try two big ones, then two small ones.', show: sumShow, ask: ([a, b]) => `Is ${a + b} bigger than 10?` },
  { id: 'ones-bigger', text: 'In a 2-digit number, the ones digit is bigger than the tens digit', answer: 'sometimes', domain: range(10, 99), holds: n => ones(n) > tens(n),
    clue: 'Try 37, then try 73.', show: n => `${n}: ${T(tens(n))} and ${ones(n)} ones`, ask: n => `Is ${ones(n)} bigger than ${tens(n)}?` },
  { id: 'over-50', text: 'A 2-digit number is bigger than 50', answer: 'sometimes', domain: range(10, 99), holds: n => n > 50,
    clue: 'Try 23, then try 87.', show: n => `Think of ${n}`, ask: n => `Is ${n} bigger than 50?` },
  { id: 'take-swap', text: 'You can swap two different numbers in a take away and get the same answer', answer: 'never', easy: true, domain: pairs(1, 20).filter(([a, b]) => a !== b), holds: ([a, b]) => a - b === b - a,
    clue: 'Try 12 − 5. Can you do 5 − 12?', show: ([a, b]) => { const H = Math.max(a, b), L = Math.min(a, b); return `${H} − ${L} = ${H - L}, but you can’t take ${H} from ${L}`; }, ask: () => 'Same answer both ways?' },
  { id: 'odd+odd-odd', text: 'Odd + odd makes an odd number', answer: 'never', domain: odPairs, holds: ([a, b]) => !even(a + b),
    clue: 'Can you make pairs? The two odd ones pair up!', show: sumShow, ask: ([a, b]) => `Is ${a + b} odd?` },
  { id: 'even+even-odd', text: 'Even + even makes an odd number', answer: 'never', domain: evPairs, holds: ([a, b]) => !even(a + b),
    clue: 'Try adding two even numbers.', show: sumShow, ask: ([a, b]) => `Is ${a + b} odd?` },
  { id: 'tens-end-5', text: 'Numbers in the 10 times table end in 5', answer: 'never', easy: true, domain: range(10, 100, 10), holds: n => ones(n) === 5,
    clue: 'Count in tens. Look at the last digit.', show: n => `${n / 10} × 10 = ${n}`, ask: n => `Does ${n} end in 5?` },
  { id: 'twos-odd', text: 'Numbers in the 2 times table are odd', answer: 'never', easy: true, domain: range(2, 24, 2), holds: n => !even(n),
    clue: 'Count in twos!', show: n => `${n / 2} × 2 = ${n}`, ask: n => `Is ${n} odd?` },
  { id: 'add-10-change', text: 'Adding 10 changes the ones digit', answer: 'never', easy: true, domain: n100, holds: n => ones(n + 10) !== ones(n),
    clue: 'Try a few numbers! Look at the ones digit.', show: n => `${n} + 10 = ${n + 10}`, ask: () => 'Did the ones digit change?' },
  { id: 'half-odd', text: 'Half of an odd number is a whole number', answer: 'never', domain: range(1, 19, 2), holds: n => Number.isInteger(n / 2),
    clue: 'Try halving 7 bones.', show: n => `Halve ${n} bones`, ask: n => `Can you halve ${n} bones without breaking one?` },
  { id: 'two-digit-small', text: 'A 2-digit number is smaller than 10', answer: 'never', easy: true, domain: range(10, 99), holds: n => n < 10,
    clue: 'What is the smallest 2-digit number?', show: n => `Think of ${n}`, ask: n => `Is ${n} smaller than 10?` },
  { id: 'threeq-half', text: 'Three quarters of something is less than half of it', answer: 'never', domain: range(4, 40, 4), holds: n => n * 3 / 4 < n / 2,
    clue: 'Try it with 8 bones.', show: n => `Three quarters of ${n} is ${n * 3 / 4}, and half of ${n} is ${n / 2}`, ask: n => `Is ${n * 3 / 4} less than ${n / 2}?` },
  { id: 'odd+even-even', text: 'Odd + even makes an even number', answer: 'never', domain: oePairs, holds: ([a, b]) => even(a + b),
    clue: 'Try an odd number add an even one.', show: sumShow, ask: ([a, b]) => `Is ${a + b} even?` },
];
const CHESTS = ['Always', 'Sometimes', 'Never'], CH = { always: 0, sometimes: 1, never: 2 };
function makeASN(type, easy) {
  const want = easy && type === 'sometimes' ? pick(['always', 'never']) : type;
  const c = pick(ASN.filter(x => x.answer === want && (!easy || x.easy)));
  // two examples for the step card: always → two that work, never → two that don't, sometimes → one of each
  const yes = c.domain.filter(c.holds), no = c.domain.filter(x => !c.holds(x));
  const ex = c.answer === 'always' ? shuffle(yes).slice(0, 2) : c.answer === 'never' ? shuffle(no).slice(0, 2) : [pick(yes), pick(no)];
  const choices = easy ? [0, 2] : [0, 1, 2], ans = CH[c.answer];
  const steps = ex.map(x => ({ say: `${c.show(x)}. ${c.ask(x)}`, choices: YN, answer: yn(c.holds(x)), words: true }));
  steps.push({ say: c.answer === 'sometimes' ? 'Once yes, once no. So it is…' : c.answer === 'always' ? 'It works every time. So it is…' : 'It never works. So it is…',
    choices: choices.map(i => CHESTS[i]), answer: CHESTS[ans], words: true, final: true });
  const q = gq({ t: 'asn', kind: 'chests', prompt: easy ? 'Always or never?' : 'Always, sometimes or never?', tip: 'Tap a chest, or drag the conjecture into one.',
    answer: [ans], choices, cfmt: i => CHESTS[i], key: c.id, clue: { say: c.clue, point: 'scroll' }, steps: () => steps });
  q.claim = { text: c.text }; q.claimTrue = c.answer === 'always' ? true : c.answer === 'never' ? false : 'sometimes'; q.cid = c.id;
  return q;
}

/* =====================================================================
   LEVEL 3  Test the Captain.  Tap test numbers: each shows a result. One fail busts the claim.
   ===================================================================== */
const pairLabel = ([a, b]) => `${a} + ${b}`;
const TEST = [
  { id: 'fives-end-5', text: 'Every number in the 5 times table ends in 5', verdict: 'busted', easy: true, tests: [5, 10, 15, 20, 25, 30], show: n => `${n} ends in ${ones(n)}`, holds: n => ones(n) === 5, domain: range(5, 60, 5) },
  { id: 'twos-end-2', text: 'Every number in the 2 times table ends in 2', verdict: 'busted', easy: true, tests: [2, 4, 6, 12, 22, 8], show: n => `${n} ends in ${ones(n)}`, holds: n => ones(n) === 2, domain: range(2, 24, 2) },
  { id: 'odd+odd-odd', text: 'Odd + odd makes an odd number', verdict: 'busted', tests: [[1, 3], [3, 5], [5, 7], [7, 9], [9, 11], [11, 13]], label: pairLabel, show: ([a, b]) => `${a} + ${b} = ${a + b}, which is ${even(a + b) ? 'even' : 'odd'}`, holds: ([a, b]) => !even(a + b), domain: pairs(1, 15).filter(([a, b]) => !even(a) && !even(b)) },
  { id: 'half-whole', text: 'Half of any number is a whole number', verdict: 'busted', easy: true, tests: [4, 6, 7, 10, 12, 9], show: n => `Half of ${n} is ${even(n) ? n / 2 : `${(n - 1) / 2} and a half`}`, holds: even, domain: range(1, 20) },
  { id: 'share-2', text: 'Any number of bones can be shared fairly between 2 dogs', verdict: 'busted', easy: true, tests: [8, 10, 12, 13, 14, 16], show: n => (even(n) ? `${n} bones: ${n / 2} each` : `${n} bones: ${(n - 1) / 2} each and 1 left over`), holds: even, domain: range(1, 20) },
  { id: 'teens-even', text: 'Every number between 10 and 20 is even', verdict: 'busted', tests: [12, 14, 16, 11, 18, 15], show: n => `${n} is ${even(n) ? 'even' : 'odd'}`, holds: even, domain: range(11, 19) },
  { id: 'tens-bigger', text: 'In every 2-digit number, the tens digit is bigger than the ones digit', verdict: 'busted', tests: [21, 43, 52, 37, 61, 85], show: n => `${n} has ${T(tens(n))} and ${ones(n)} ones`, holds: n => tens(n) > ones(n), domain: range(10, 99) },
  { id: 'bonds-odd', text: 'Two numbers that make 10 are both odd', verdict: 'busted', tests: [[1, 9], [3, 7], [4, 6], [7, 3], [9, 1], [2, 8]], label: pairLabel, show: ([a, b]) => `${a} + ${b} = 10: both ${!even(a) && !even(b) ? 'odd' : 'even'}`, holds: ([a, b]) => !even(a) && !even(b), domain: range(1, 9).map(a => [a, 10 - a]) },
  { id: 'evens-in-tens', text: 'Every even number is in the 10 times table', verdict: 'busted', easy: true, tests: [10, 20, 4, 30, 40, 16], show: n => `${n} ${n % 10 === 0 ? 'is' : 'is not'} in the 10 times table`, holds: n => n % 10 === 0, domain: range(2, 40, 2) },
  { id: 'add-10-ones', text: 'Adding 10 keeps the ones digit the same', verdict: 'true', easy: true, tests: [23, 47, 8, 61, 35, 79], show: n => `${n} + 10 = ${n + 10}`, holds: n => ones(n + 10) === ones(n), domain: n100 },
  { id: 'tens-end-0', text: 'Every number in the 10 times table ends in 0', verdict: 'true', easy: true, tests: [10, 20, 30, 50, 70, 100], show: n => `${n} ends in ${ones(n)}`, holds: n => ones(n) === 0, domain: range(10, 100, 10) },
  { id: 'odd+odd-even', text: 'Odd + odd makes an even number', verdict: 'true', tests: [[1, 3], [5, 7], [3, 9], [7, 7], [9, 11], [5, 13]], label: pairLabel, show: ([a, b]) => `${a} + ${b} = ${a + b}, which is even`, holds: ([a, b]) => even(a + b), domain: pairs(1, 31).filter(([a, b]) => !even(a) && !even(b)) },
  { id: 'add-swap', text: 'Swapping the numbers when you add gives the same answer', verdict: 'true', tests: [[3, 5], [7, 2], [9, 6], [4, 8], [10, 5], [6, 1]], label: pairLabel, show: ([a, b]) => `${a} + ${b} = ${a + b} and ${b} + ${a} = ${a + b}`, holds: ([a, b]) => a + b === b + a, domain: pairs(0, 20) },
  { id: 'double-even', text: 'Doubling a number always makes an even number', verdict: 'true', easy: true, tests: [3, 5, 7, 4, 9, 6], show: n => `Double ${n} is ${n * 2}`, holds: n => even(n * 2), domain: range(1, 20) },
  { id: 'tens-in-fives', text: 'Every number in the 10 times table is in the 5 times table too', verdict: 'true', easy: true, tests: [10, 20, 30, 40, 50, 60], show: n => `${n} is ${n / 5} fives`, holds: n => n % 5 === 0, domain: range(10, 60, 10) },
  { id: 'twos-even', text: 'Every number in the 2 times table is even', verdict: 'true', easy: true, tests: [2, 6, 10, 14, 18, 24], show: n => `${n} is even`, holds: even, domain: range(2, 24, 2) },
];
const VERDICTS = ['Busted!', 'Looks true!'];
function makeTest(type, easy) {
  const c = pick(TEST.filter(x => x.verdict === type && (!easy || x.easy)));
  let tests = c.tests.map(x => ({ x, label: c.label ? c.label(x) : String(x), ok: c.holds(x), show: c.show(x) }));
  if (easy) { // 4 buttons, still with a buster when it's busted
    const bad = tests.filter(t => !t.ok), good = tests.filter(t => t.ok);
    const first = bad.length ? pick(bad) : null;
    tests = (first ? [first, ...shuffle(tests.filter(t => t !== first))] : shuffle(good)).slice(0, 4);
  }
  tests = shuffle(tests);
  const ans = c.verdict === 'busted' ? 0 : 1, idx = t => tests.indexOf(t);
  let steps;
  if (ans === 0) {
    const b = tests.find(t => !t.ok);
    steps = [{ say: `Let’s test ${b.label}. Tap it!`, point: `test-${idx(b)}`, action: () => M.peek().tested.includes(idx(b)), wait: 'Tap the glowing number!' },
      { say: `${b.show}. Does it fit the Captain’s conjecture?`, choices: YN, answer: 'No', words: true }];
  } else {
    const [a, b] = tests;
    steps = [{ say: `Let’s test ${a.label}. Tap it!`, point: `test-${idx(a)}`, action: () => M.peek().tested.includes(idx(a)), wait: 'Tap the glowing number!' },
      { say: `Now test ${b.label}. Tap it!`, point: `test-${idx(b)}`, action: () => M.peek().tested.includes(idx(b)), wait: 'Tap the glowing number!' },
      { say: 'Did any test bust it?', choices: YN, answer: 'No', words: true }];
  }
  steps.push({ say: 'So is the Captain right?', choices: VERDICTS, answer: VERDICTS[ans], words: true, final: true });
  const q = gq({ t: 'test', kind: 'tester', prompt: 'Test it! Can you bust it?', answer: [ans], choices: [0, 1], cfmt: i => VERDICTS[i], key: c.id,
    clue: { say: 'Try a few numbers! One that doesn’t fit busts it.', point: 'test-0' }, steps: () => steps });
  q.claim = { text: c.text }; q.claimTrue = ans === 1; q.tests = tests; q.cid = c.id; q.busted = 'Shiver me lily pads!';
  return q;
}

const LEVELS = [
  { name: 'True or False?', blurb: 'Is the Captain right? How do you know?', eg: '36 + 20 = 56', quest: 'The Captain has a conjecture! Is he right, {N}?',
    seq: ['tf', 'tf', 'tf', 'tf', 'tf', 'tf', 'tf', 'tf'], make: (type, k, easy) => makeTF(k, easy) },
  { name: 'Treasure Chests', blurb: 'Always, sometimes or never?', eg: 'Adding 10 keeps the ones the same', quest: 'Sort the Captain’s conjectures into the treasure chests!',
    seq: ['always', 'sometimes', 'never', 'always', 'never', 'sometimes', 'always', 'never'], make: (type, k, easy) => makeASN(type, easy) },
  { name: 'Test the Captain', blurb: 'Test it with numbers. Can you bust it?', eg: 'Every 5 times table number ends in 5', quest: 'Test the conjecture, {N}. Can you bust it?',
    seq: ['busted', 'true', 'busted', 'busted', 'true', 'busted', 'true'], make: (type, k, easy) => makeTest(type, easy) },
];

// Bonnie's fixed lines, for tools/make-voice.mjs (lines with numbers in them use the device voice)
const VOICE_LINES = [
  'Let’s test the Captain’s conjecture!', 'Is the Captain right?', 'Now, how do you know?', 'So is the Captain right?',
  'Always, sometimes or never?', 'Always or never?', 'Which chest does it go in?', 'Tap a number to test it!', 'Test it! Can you bust it?',
  'Did any test bust it?', 'Once yes, once no. So it is…', 'It works every time. So it is…', 'It never works. So it is…',
  'Try a few numbers! One that doesn’t fit busts it.', 'That fits.', 'That busts it!', 'Keep testing!',
  // Level 1 clues with no numbers in them
  'Look at the tens!', 'Take away the tens. The ones stay the same.', 'Count in fives!', 'Times 2 means double it!', 'Count in tens!',
  'Half means two equal parts.', 'A quarter is half of a half!', 'Share it into 3 equal groups.', 'The first digit tells you the tens.',
  'Look at the tens first!', 'Look at the ones digit.', 'Share them out one each.', 'Taking away undoes adding!',
  ...new Set(ASN.map(c => c.clue).filter(c => !/\d/.test(c))),
];

Meadow.registerWorld(M.world({
  id: 'y2-maths-captains-cove', name: 'Captain’s Cove', tag: 'Is the Captain right?', icon: '🐸', color: '#3D7FB3', tint: '#E4F0F8',
  intro: `Test the Captain’s conjectures and prove it! ${CAPTAIN} makes bold claims. A <b>conjecture</b> is an idea that might be true. Is the Captain right?`,
  ids: ['true-false', 'always-sometimes-never', 'test-the-captain'],
  levels: LEVELS, host: HOST,
  lines: () => VOICE_LINES,
}));
// for the test page: the claim banks and their checks
window.CaptainsCove = { CAPTAIN, TF, ASN, TEST, makeTF, makeASN, makeTest };
})();
