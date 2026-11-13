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
const { rand, pick, shuffle, near, gq, WHO } = M;

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
// The Captain speaks in his own recorded voice (audio/captain.json, made by tools/make-voice.mjs --captain-voice).
// Each list is a bag: he says every line in it once before any comes round again.
const HOST = { name: CAPTAIN, who: 'captain', svg: croakSVG, says: {
  busted: [   // after the player shows his conjecture is wrong
    'Shiver me lily pads, you’ve busted my conjecture!',
    'Blow me down! You busted it!',
    'Arr, you caught me out!',
    'Croak! My conjecture sank!',
    'Barnacles! You’re too clever for me!',
    'Well spotted, matey! I was wrong.',
    'Into the pond with that conjecture!',
  ],
  holds: [    // after the player shows it's true
    'Arr, my conjecture holds up!',
    'Ho ho! I was right all along!',
    'Treasure! You proved me right!',
    'Yo ho ho! It works every time!',
    'Ribbit! That one’s true!',
    'Hooray! My conjecture floats!',
  ],
  sometimes: [
    'Sometimes right, sometimes not. Arr!',
    'Only sometimes? Fair enough, matey!',
    'Sometimes it works, sometimes it doesn’t. Arr!',
    'Half right, half wrong! Croak!',
  ],
  oops: [     // Level 3: a test number busts his conjecture
    'Shiver me lily pads!',
    'Uh oh! Not that number!',
    'Barnacles!',
    'Oh no, my poor conjecture!',
    'Croak! That one doesn’t work!',
  ],
}, taps: [
  `Ahoy, matey! I’m ${CAPTAIN}!`,
  'Arr! Can you bust my conjecture?',
  'Every pirate needs a good mathematician!',
  'Ribbit! I mean... arr!',
  'A conjecture is an idea that might be true!',
  'Don’t believe me? Test me!',
  'Prove me wrong, if you can!',
  'My raft is made of lily pads!',
  'Arr, numbers are my treasure!',
  'Bonnie is my best first mate!',
  'Yo ho ho and a bottle of pond water!',
  'Splish, splash, I love maths!',
] };
// everything he says out loud (his claim's small line, like "Prove it to me, matey!", is said when he's tapped)
HOST.lines = [...Object.values(HOST.says).flat(), ...HOST.taps, 'My working is perfect, arr!', 'Prove it to me, matey!'];

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
      return { nums: { n, g, s }, truth: t, text: `If ${WHO()} shares ${n} bones between ${g} dogs, each dog gets ${s}`, clue: 'Share them out one each.',
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
    clue: ex => `Try ${ex[0]}, then try ${ex[1]}.`, show: n => `${n} is in the 2 times table`, ask: n => `Is ${n} in the 5 times table?` },
  { id: 'share-2', text: 'A number of bones can be shared fairly between 2 dogs', answer: 'sometimes', domain: n20, holds: even,
    clue: 'Try sharing an even number, then an odd one.', show: n => `Share ${n} bones between 2 dogs`, ask: n => `Is it fair, with none left over?` },
  { id: 'share-4', text: 'A number of bones can be shared fairly into quarters', answer: 'sometimes', domain: n20, holds: n => n % 4 === 0,
    clue: ex => `Try ${ex[0]}, then try ${ex[1]}.`, show: n => `Share ${n} bones between 4 dogs`, ask: () => 'Is it fair, with none left over?' },
  { id: 'cross-ten', text: 'Adding two 1-digit numbers makes a number bigger than 10', answer: 'sometimes', domain: pairs(1, 9), holds: ([a, b]) => a + b > 10,
    clue: 'Try two big ones, then two small ones.', show: sumShow, ask: ([a, b]) => `Is ${a + b} bigger than 10?` },
  { id: 'ones-bigger', text: 'In a 2-digit number, the ones digit is bigger than the tens digit', answer: 'sometimes', domain: range(10, 99), holds: n => ones(n) > tens(n),
    clue: ex => `Try ${ex[0]}, then try ${ex[1]}.`, show: n => `${n}: ${T(tens(n))} and ${ones(n)} ones`, ask: n => `Is ${ones(n)} bigger than ${tens(n)}?` },
  { id: 'over-50', text: 'A 2-digit number is bigger than 50', answer: 'sometimes', domain: range(10, 99), holds: n => n > 50,
    clue: ex => `Try ${ex[0]}, then try ${ex[1]}.`, show: n => `Think of ${n}`, ask: n => `Is ${n} bigger than 50?` },
  { id: 'take-swap', text: 'You can swap two different numbers in a take away and get the same answer', answer: 'never', easy: true, domain: pairs(1, 20).filter(([a, b]) => a !== b), holds: ([a, b]) => a - b === b - a,
    clue: ([[a, b]]) => { const H = Math.max(a, b), L = Math.min(a, b); return `Try ${H} − ${L}. Can you do ${L} − ${H}?`; }, show: ([a, b]) => { const H = Math.max(a, b), L = Math.min(a, b); return `${H} − ${L} = ${H - L}, but you can’t take ${H} from ${L}`; }, ask: () => 'Same answer both ways?' },
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
    clue: ex => `Try halving ${ex[0]} bones.`, show: n => `Halve ${n} bones`, ask: n => `Can you halve ${n} bones without breaking one?` },
  { id: 'two-digit-small', text: 'A 2-digit number is smaller than 10', answer: 'never', easy: true, domain: range(10, 99), holds: n => n < 10,
    clue: 'What is the smallest 2-digit number?', show: n => `Think of ${n}`, ask: n => `Is ${n} smaller than 10?` },
  { id: 'threeq-half', text: 'Three quarters of something is less than half of it', answer: 'never', domain: range(4, 40, 4), holds: n => n * 3 / 4 < n / 2,
    clue: ex => `Try it with ${ex[0]} bones.`, show: n => `Three quarters of ${n} is ${n * 3 / 4}, and half of ${n} is ${n / 2}`, ask: n => `Is ${n * 3 / 4} less than ${n / 2}?` },
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
    answer: [ans], choices, cfmt: i => CHESTS[i], key: c.id, clue: { say: typeof c.clue === 'function' ? c.clue(ex) : c.clue, point: 'scroll' }, steps: () => steps });
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
  q.claim = { text: c.text }; q.claimTrue = ans === 1; q.tests = tests; q.cid = c.id;
  return q;
}

/* =====================================================================
   LEVEL 4  Spot the Mistake.  The Captain shows his working; exactly one step is wrong.
   make(easy) → { title, wrong, steps: [{ text(v), right, shown }], clue }.
   The test page reads every step back as a plain sum and checks it.
   ===================================================================== */
const MIS = [
  { id: 'add-exchange', easyOk: false, clue: 'Check each step. Did he use the ten from the ones?',
    make() { let a, b; do { a = rand(2, 6) * 10 + rand(3, 9); b = rand(1, 3) * 10 + rand(3, 9); } while (ones(a) + ones(b) < 10);
      const Tn = tens(a) * 10 + tens(b) * 10, O = ones(a) + ones(b);
      return { title: `${a} + ${b}`, wrong: 2, steps: [
        { text: v => `${tens(a) * 10} + ${tens(b) * 10} = ${v}`, right: Tn },
        { text: v => `${ones(a)} + ${ones(b)} = ${v}`, right: O },
        { text: v => `${Tn} + ${O} = ${v}`, right: Tn + O, shown: Tn + O - 10 }] }; } },
  { id: 'take-partition', easyOk: false, clue: 'Check each take away. Count back carefully.',
    make() { const a = rand(4, 9) * 10 + rand(1, 5), b = 10 + rand(6, 9), m = a - 10;
      return { title: `${a} − ${b}`, wrong: 1, steps: [
        { text: v => `${a} − 10 = ${v}`, right: m },
        { text: v => `${m} − ${ones(b)} = ${v}`, right: m - ones(b), shown: m - ones(b) + 1 }] }; } },
  { id: 'count-5s', easyOk: true, clue: 'Count in fives along with him.',
    make(easy) { const n = rand(easy ? 3 : 4, easy ? 4 : 6), w = rand(2, n - 1);
      return { title: `${n} × 5, counting in fives`, wrong: w, steps: range(0, n - 1).map(i =>
        ({ text: v => `${i + 1} five${i ? 's' : ''}: ${v}`, right: (i + 1) * 5, shown: i === w ? (i + 1) * 5 + 1 : undefined })) }; } },
  { id: 'partition', easyOk: true, clue: 'How much is each tens digit worth?',
    make() { const a = rand(2, 9), b = rand(1, 9), n = a * 10 + b;
      return { title: `Split ${n} into tens and ones`, wrong: 1, steps: [
        { text: v => `${n} has ${v} tens and ${b} ones`, right: a },
        { text: v => `${a} tens is ${v}`, right: a * 10, shown: a },
        { text: v => `${n} = ${a * 10} + ${v}`, right: b }] }; } },
  { id: 'bridge-10', easyOk: true, clue: 'Do the two parts add back to the number?',
    make() { const a = rand(6, 9), b = rand(11 - a, 9), need = 10 - a, rest = b - need;
      return { title: `${a} + ${b}, making 10 first`, wrong: 1, steps: [
        { text: v => `${a} needs ${v} to make 10`, right: need },
        { text: v => `Split ${b} into ${need} and ${v}`, right: rest, shown: rest + 1 },
        { text: v => `10 + ${rest} = ${v}`, right: 10 + rest }] }; } },
  { id: 'half-split', easyOk: false, clue: 'Check each half. Double it back!',
    make() { const t = rand(1, 4) * 2, o = pick([2, 4, 6, 8]), n = t * 10 + o;
      return { title: `Half of ${n}`, wrong: 1, steps: [
        { text: v => `Half of ${t * 10} is ${v}`, right: t * 5 },
        { text: v => `Half of ${o} is ${v}`, right: o / 2, shown: o / 2 + 1 },
        { text: v => `${t * 5} + ${o / 2} = ${v}`, right: t * 5 + o / 2 }] }; } },
  { id: 'share-count', easyOk: true, clue: 'Count up in equal steps with him.',
    make(easy) { const g = pick(easy ? [2] : [2, 3]), e = rand(4, easy ? 5 : 6), w = rand(1, e - 2);
      return { title: `${g * e} shared between ${g}, counting in ${g}s`, wrong: w, steps: range(0, e - 1).map(i =>
        ({ text: v => `${i + 1} each: ${v} used`, right: (i + 1) * g, shown: i === w ? (i + 1) * g + 1 : undefined })) }; } },
  { id: 'three-add', easyOk: true, clue: 'Check each adding step.',
    make() { const a = rand(1, 9), b = 10 - a, c = rand(2, 9);
      return { title: `${a} + ${c} + ${b}`, wrong: 1, steps: [
        { text: v => `${a} + ${b} = ${v}`, right: 10 },
        { text: v => `10 + ${c} = ${v}`, right: 10 + c, shown: 10 + c - 1 }] }; } },
  { id: 'fact-family', easyOk: false, clue: 'Taking away undoes adding!',
    make() { const a = rand(6, 9), b = pick([4, 5, 6, 7, 8, 9].filter(x => x !== a)), c = a + b;
      return { title: `The ${a}, ${b}, ${c} fact family`, wrong: 2, steps: [
        { text: v => `${a} + ${b} = ${v}`, right: c },
        { text: v => `${c} − ${b} = ${v}`, right: a },
        { text: v => `${c} − ${a} = ${v}`, right: b, shown: b + 1 }] }; } },
  { id: 'count-on-10s', easyOk: true, clue: 'Adding 10 keeps the ones digit the same.',
    make() { const s = rand(1, 3) * 10 + rand(1, 9), w = rand(2, 3);
      return { title: `Count on in tens from ${s}`, wrong: w, steps: range(1, 4).map((k, i) =>
        ({ text: v => `${s + (k - 1) * 10} + 10 = ${v}`, right: s + k * 10, shown: i === w ? s + k * 10 + 1 : undefined })) }; } },
  { id: 'quarter-halve', easyOk: false, clue: 'Check the first half. Double it back!',
    make() { const q = rand(2, 5), n = q * 4;
      return { title: `A quarter of ${n}: halve it, then halve again`, wrong: 0, steps: [
        { text: v => `Half of ${n} is ${v}`, right: q * 2, shown: q * 2 + 1 },
        { text: v => `Half of ${q * 2} is ${v}`, right: q }] }; } },
  { id: 'missing-add', easyOk: true, clue: 'Check his answer by adding.',
    make(easy) { const c = rand(easy ? 6 : 11, easy ? 10 : 18), b = rand(2, c - 2), a = c - b;
      return { title: `□ + ${b} = ${c}`, wrong: 0, steps: [
        { text: v => `${c} − ${b} = ${v}`, right: a, shown: a + 1 },
        { text: v => `Check: ${a} + ${b} = ${v}`, right: c }] }; } },
];
const stepWord = i => `Step ${i + 1}`;
function makeMistake(k, easy) {
  const m = pick(MIS.filter(x => !easy || x.easyOk)), w = m.make(easy), W = w.steps[w.wrong];
  const steps = [];
  if (w.wrong > 0) { const P = w.steps[w.wrong - 1]; steps.push({ say: `Is step ${w.wrong} right? ${P.text(P.right)}`, point: `wstep-${w.wrong - 1}`, choices: YN, answer: 'Yes', words: true }); }
  steps.push({ say: `Look at step ${w.wrong + 1}: ${W.text(W.shown)}. Is that right?`, point: `wstep-${w.wrong}`, choices: YN, answer: 'No', words: true });
  steps.push({ say: 'So which step is wrong?', choices: w.steps.map((_, i) => stepWord(i)), answer: stepWord(w.wrong), words: true, wstep: true });
  steps.push(M.fillStep('What should it be?', W.right, [W.shown, W.right + 1, W.right - 1, W.right + 10]));
  const q = gq({ t: 'mis-' + m.id, kind: 'steps', prompt: 'Spot the mistake, then fix it!', answer: [W.right], key: w.title + w.steps.map(s => s.shown ?? '').join(),
    clue: { say: m.clue, point: 'work' }, steps: () => steps });
  q.claim = { text: w.title, sub: 'My working is perfect, arr!', label: `${CAPTAIN}’s working` }; q.claimTrue = false; q.work = w; q.maker = m.id;
  return q;
}

/* =====================================================================
   LEVEL 5  Prove It!  Every claim here is true. Use the picture to show why, then answer.
   check(q) confirms the claim (and the answer) with plain arithmetic.
   ===================================================================== */
const shareAct = q => ({ say: 'Tap “One each” until the pile is empty.', point: 'g-each', action: () => M.shareDone(q.vis), wait: 'Share them out up there!' });
const PROVE = [
  { id: 'odd+odd', make() { const a = pick([3, 5, 7, 9]), b = pick([1, 3, 5, 7]), N = a + b, h = N / 2;
      return { claim: `${a} + ${b} makes an even number`, prompt: `Share ${N} bones between 2 bowls. Is any bone left over?`, tip: 'Even numbers share into 2 with none left over.',
        eq: [{ num: a }, '+', { num: b }, '=', { num: N }, '\n', { num: N }, '=', { box: 0 }, '+', { box: 1 }], answer: [h, h],
        vis: { type: 'share', N, bowls: [0, 0], box: 'bowl', item: 'bone' }, clue: 'Can you make pairs? Share them into 2 bowls.',
        steps: q => [shareAct(q), M.fillStep('How many in one bowl?', h, near(h), 0), M.fillStep('And in the other?', h, near(h), 1)], nums: { a, b, h } }; },
    check: q => { const { a, b, h } = q.nums; return !even(a) && !even(b) && even(a + b) && h * 2 === a + b; } },
  { id: 'array-turn', make(easy) { let a, b; do { a = rand(2, easy ? 3 : 5); b = rand(2, 5); } while (a === b); const p = a * b;
      return { claim: `${a} × ${b} = ${b} × ${a}`, prompt: `Turn the tree! What is ${b} × ${a}?`, eq: [{ num: b }, '×', { num: a }, '=', { box: 0 }], answer: [p],
        vis: { type: 'array', r: a, c: b, item: 'apple', label: true, turn: true, turned: false }, clue: 'Turn the tree and count again.',
        steps: q => [{ say: 'Tap “Turn the tree”.', point: 'g-turn', action: () => q.vis.turned, wait: 'Tap the button up there!' }, { say: 'Did any apples fall off?', choices: YN, answer: 'No', words: true }, M.fillStep(`So ${b} × ${a} is…`, p, [p - a, p + b, a + b])], nums: { a, b, p } }; },
    check: q => { const { a, b, p } = q.nums; return a * b === p && b * a === p; } },
  { id: 'add-10', make() { let n; do { n = rand(12, 79); } while (ones(n) === 0); const t = n + 10;
      return { claim: `${n} + 10 keeps the ones digit the same`, prompt: `Add 10 to ${n}. Make ${t} with the blocks.`, tip: 'Tap <b>+</b> to add. Watch the ones!', kind: 'build',
        eq: [{ num: n }, '+', { num: 10 }, '=', { main: t }], answer: [t], build: { from: n, to: t }, clue: 'Adding 10 is one more ten. Look at the ones!',
        steps: () => [{ say: 'Add one more ten. Tap + on the tens.', point: 'plus-1', action: () => M.peek().q.counts[1] >= tens(t), wait: 'Tap + on the tens!' }], nums: { n, t } }; },
    check: q => { const { n, t } = q.nums; return t === n + 10 && ones(t) === ones(n); } },
  { id: 'add-swap', make() { const a = rand(4, 7), b = rand(1, 9 - a), s = a + b;
      return { claim: `${a} + ${b} = ${b} + ${a}`, prompt: 'Count the bones and carrots both ways.', eq: [{ num: a }, '+', { num: b }, '=', { box: 0 }, '\n', { num: b }, '+', { num: a }, '=', { box: 1 }], answer: [s, s],
        vis: M.burrow({ n: 10, a, b }), clue: 'Count the bones first, then the carrots first.',
        steps: () => [M.fillStep(`${a} bones and ${b} carrots make…`, s, near(s), 0), { say: 'Did the burrow change when you counted the other way?', choices: YN, answer: 'No', words: true }, M.fillStep(`So ${b} + ${a} is…`, s, near(s), 1)], nums: { a, b, s } }; },
    check: q => { const { a, b, s } = q.nums; return a + b === s && b + a === s; } },
  { id: 'half', make(easy) { const h = rand(3, easy ? 5 : 9), N = h * 2;
      return { claim: `${N} bones share fairly between 2 lily pads`, prompt: `Share ${N} bones between 2 lily pads.`, eq: [{ text: 'Half of' }, { num: N }, { text: 'is' }, { box: 0 }], answer: [h],
        vis: { type: 'share', N, bowls: [0, 0], box: 'lily', item: 'bone' }, clue: 'Share them between the two lily pads.',
        steps: q => [shareAct(q), M.fillStep('How many on each lily pad?', h, near(h))], nums: { N, h } }; },
    check: q => q.nums.h * 2 === q.nums.N },
  { id: 'share-3', make() { const e = rand(2, 5), N = e * 3;
      return { claim: `${N} bones share fairly between 3 bowls`, prompt: `Share ${N} bones between 3 bowls.`, eq: [{ num: N }, '÷', { num: 3 }, '=', { box: 0 }, { text: 'each' }], answer: [e],
        vis: { type: 'share', N, bowls: [0, 0, 0], box: 'bowl', item: 'bone' }, clue: 'Give every bowl one, then again.',
        steps: q => [shareAct(q), M.fillStep('How many in each bowl?', e, near(e))], nums: { N, e } }; },
    check: q => q.nums.e * 3 === q.nums.N },
  { id: 'in-5s', make(easy) { const k = rand(2, easy ? 4 : 6), N = k * 5;
      return { claim: `${N} is in the 5 times table`, prompt: `Put ${N} bones in baskets of 5. How many baskets?`, eq: [{ num: N }, '÷', { num: 5 }, '=', { box: 0 }, { text: 'baskets' }], answer: [k],
        vis: { type: 'group', N, s: 5, baskets: 0, box: 'basket', item: 'bone' }, clue: 'Fill baskets of 5 until none are left.',
        steps: q => [{ say: 'Tap “Fill a basket” until the pile is empty.', point: 'g-fill', action: () => q.vis.baskets * 5 === N, wait: 'Fill the baskets up there!' }, M.fillStep('How many baskets?', k, near(k))], nums: { N, k } }; },
    check: q => q.nums.k * 5 === q.nums.N },
  { id: 'bridge-10', make() { const a = rand(6, 9), b = rand(11 - a, 9), s = a + b, need = 10 - a;
      return { claim: `${a} + ${b} is more than 10`, prompt: `${a} bones and ${b} carrots. How many altogether?`, eq: [{ num: a }, '+', { num: b }, '=', { box: 0 }], answer: [s],
        vis: M.burrow({ n: 20, a, b }), clue: 'The first burrow is full: that’s 10. Add the ones!',
        steps: () => [{ say: `How many carrots fill the first burrow?`, point: 'frame-0', choices: near(need), answer: need }, { say: 'How many carrots are in the second burrow?', point: 'frame-1', choices: near(b - need), answer: b - need }, M.fillStep(`10 and ${b - need} make…`, s, near(s))], nums: { a, b, s } }; },
    check: q => q.nums.a + q.nums.b === q.nums.s && q.nums.s > 10 },
  { id: 'partition', make() { const n = rand(21, 89); 
      return { claim: `${n} = ${tens(n) * 10} + ${ones(n)}`, prompt: `Make ${n} with tens and ones.`, tip: 'Tap <b>+</b> to add. Tap <b>−</b> to take one away.', kind: 'build',
        eq: [{ main: n }], answer: [n], build: { from: 0, to: n }, clue: 'Each digit tells you how many.',
        steps: () => [{ say: 'How many tens?', point: 'digit-1', choices: near(tens(n)), answer: tens(n), fill: { count: 1 } }, { say: 'How many ones?', point: 'digit-0', choices: near(ones(n)), answer: ones(n), fill: { count: 0 } }], nums: { n } }; },
    check: q => tens(q.nums.n) * 10 + ones(q.nums.n) === q.nums.n },
  { id: 'even-pairs', make() { const N = pick([6, 8, 10, 12, 14, 16]), h = N / 2;
      return { claim: `${N} is even`, prompt: `Share ${N} bones between 2 bowls. Is any left over?`, tip: 'Even numbers share into 2 with none left over.',
        eq: [{ num: N }, '=', { box: 0 }, '+', { box: 1 }], answer: [h, h],
        vis: { type: 'share', N, bowls: [0, 0], box: 'bowl', item: 'bone' }, clue: 'Can you make pairs? Share them into 2 bowls.',
        steps: q => [shareAct(q), M.fillStep('How many in one bowl?', h, near(h), 0), M.fillStep('And in the other?', h, near(h), 1)], nums: { N, h } }; },
    check: q => even(q.nums.N) && q.nums.h * 2 === q.nums.N },
  { id: 'double', make(easy) { const n = rand(3, easy ? 5 : 9), d = n * 2;
      return { claim: `Double ${n} is an even number`, prompt: `Two rows of ${n} apples. How many?`, eq: [{ text: 'Double' }, { num: n }, '=', { box: 0 }], answer: [d],
        vis: { type: 'array', r: 2, c: n, item: 'apple', label: true }, clue: 'Double means two lots the same.',
        steps: () => [{ say: 'How many rows?', point: 'visual', choices: [1, 2, 3], answer: 2 }, M.fillStep(`${n} and ${n} make…`, d, near(d))], nums: { n, d } }; },
    check: q => q.nums.d === q.nums.n + q.nums.n && even(q.nums.d) },
  { id: 'two-quarters', make() { const shape = pick(['sq4', 'ci4', 'strip4']);
      return { claim: '2 quarters make a half', prompt: 'Two quarters are shaded. Is that the same as half?', kind: 'choice', choices: [0, 1], cfmt: i => YN[i], answer: [0],
        vis: { type: 'shape', shape, shade: 2 }, clue: 'Quarters are 4 equal pieces. Half is 2 of them.', key: 'twoq' + shape,
        steps: () => [{ say: 'How many quarters make a whole?', choices: [2, 3, 4], answer: 4 }, { say: 'Half of 4 quarters is…', choices: [1, 2, 3], answer: 2 }, { say: 'So is 2 quarters the same as half?', choices: YN, answer: 'Yes', words: true, final: true }], nums: { q: 2 } }; },
    check: q => q.nums.q / 4 === 1 / 2 && q.answer[0] === 0 },
  { id: 'groups-of-2', make() { const g = rand(3, 8), p = g * 2;
      return { claim: `${g} plates of 2 bones makes an even number of bones`, prompt: `${g} plates with 2 bones on each. How many bones?`, eq: [{ num: g }, '×', { num: 2 }, '=', { box: 0 }], answer: [p],
        vis: { type: 'groups', g, n: 2, box: 'plate', item: 'bone' }, clue: 'Count in twos, once for each plate.',
        steps: () => [{ say: 'How many plates?', point: 'visual', choices: near(g), answer: g }, M.fillStep(`Count in twos ${g} times. That makes…`, p, near(p))], nums: { g, p } }; },
    check: q => q.nums.g * 2 === q.nums.p && even(q.nums.p) },
];
function makeProve(k, easy) {
  const P = pick(PROVE), d = P.make(easy);
  const q = gq({ t: 'prove-' + P.id, kind: d.kind, prompt: d.prompt, tip: d.tip, eq: d.eq, answer: d.answer, vis: d.vis, choices: d.choices, cfmt: d.cfmt,
    key: d.key || d.claim, clue: { say: d.clue, point: 'visual' }, steps: d.steps });
  if (d.build) { q.inter = 'build'; q.mode = 'blocks'; q.places = [1, 0]; q.counts = d.build.from ? M.countsOf(d.build.from) : { 1: 0, 0: 0 }; q.target = M.countsOf(d.build.to); q.n = d.build.to; }
  q.claim = { text: d.claim, sub: 'Prove it to me, matey!' }; q.claimTrue = true; q.nums = d.nums; q.maker = P.id;
  return q;
}

/* =====================================================================
   LEVEL 6  Odd One Out.  Four numbers: pick the one that doesn't belong, then the reason.
   Any pick is right if a reason makes it the only one (validPicks works them all out).
   ===================================================================== */
const PROPS = [
  { id: 'odd', reason: n => `${n} is odd and the others are even`, test: n => !even(n), ask: ['Which number is odd?', 'Are the others even?'] },
  { id: 'even', reason: n => `${n} is even and the others are odd`, test: even, ask: ['Which number is even?', 'Are the others odd?'] },
  { id: 'not-5s', reason: n => `${n} is not in the 5 times table`, test: n => n % 5 !== 0, ask: ['Which number is not in the 5 times table?', 'Are the others in the 5 times table?'] },
  { id: 'not-10s', reason: n => `${n} is not in the 10 times table`, test: n => n % 10 !== 0, ask: ['Which number is not in the 10 times table?', 'Are the others in the 10 times table?'] },
  { id: 'in-10s', reason: n => `${n} is in the 10 times table and the others are not`, test: n => n % 10 === 0, ask: ['Which number is in the 10 times table?', 'Are the others left out of it?'] },
  { id: 'one-digit', reason: n => `${n} has only 1 digit`, test: n => n < 10, ask: ['Which number has only 1 digit?', 'Do the others have 2 digits?'] },
  { id: 'over-50', reason: n => `${n} is more than 50 and the others are not`, test: n => n > 50, ask: ['Which number is more than 50?', 'Are the others 50 or less?'] },
  { id: 'under-50', reason: n => `${n} is less than 50 and the others are not`, test: n => n < 50, ask: ['Which number is less than 50?', 'Are the others 50 or more?'] },
  { id: 'diff-tens', reason: n => `${n} has a different number of tens`, digit: tens, ask: ['Which number has a different number of tens?', 'Do the others have the same tens?'] },
  { id: 'diff-ones', reason: n => `${n} has a different ones digit`, digit: ones, ask: ['Which number has a different ones digit?', 'Do the others end the same way?'] },
];
// for each item: the properties that make it the only one
function validPicks(items) {
  const out = items.map(() => []);
  for (const p of PROPS) {
    const has = p.digit
      ? items.map((x, i) => { const o = items.filter((_, j) => j !== i).map(p.digit); return o.every(d => d === o[0]) && p.digit(x) !== o[0]; })
      : items.map(p.test);
    const yes = has.map((h, i) => (h ? i : -1)).filter(i => i >= 0);
    if (yes.length === 1) out[yes[0]].push(p);
  }
  return out;
}
const OOO = [
  { id: 'fives', easy: true, make: () => { const fs = shuffle(range(2, 10).map(k => k * 5)).slice(0, 3); let x; do { x = rand(11, 49); } while (x % 5 === 0); return [...fs, x]; } },
  { id: 'evens', easy: true, make: () => [...shuffle(range(2, 20, 2)).slice(0, 3), pick(range(3, 19, 2))] },
  { id: 'odds', easy: true, make: () => [...shuffle(range(1, 19, 2)).slice(0, 3), pick(range(2, 20, 2))] },
  { id: 'tens', easy: true, make: () => { const ts = shuffle(range(1, 9).map(k => k * 10)).slice(0, 3); let x; do { x = rand(11, 89); } while (x % 10 === 0); return [...ts, x]; } },
  { id: 'same-tens', make: () => { const t = rand(2, 7), os = shuffle(range(1, 9)).slice(0, 4); return [...os.slice(0, 3).map(o => t * 10 + o), (t + pick([1, 2])) * 10 + os[3]]; } },
  { id: 'same-ones', make: () => { const o = rand(1, 9), ts = shuffle(range(1, 9)).slice(0, 4); return [...ts.slice(0, 3).map(t => t * 10 + o), ts[3] * 10 + (o % 9) + 1]; } },
  { id: 'big', make: () => [...shuffle(range(55, 95)).slice(0, 3), rand(12, 45)] },
  { id: 'small', make: () => [...shuffle(range(12, 45)).slice(0, 3), rand(55, 95)] },
  { id: 'one-digit', easy: true, make: () => [...shuffle(range(12, 40)).slice(0, 3), rand(2, 9)] },
  { id: 'brief-example', make: () => [10, 15, 20, 24] },
];
function makeOdd(k, easy) {
  let items, valid, S;
  do { S = pick(OOO.filter(x => !easy || x.easy)); items = shuffle(S.make()); valid = validPicks(items); }
  while (new Set(items).size !== 4 || !valid.some(v => v.length) || valid.every(v => v.length));
  const right = items.map((_, i) => i).filter(i => valid[i].length);
  // the step card walks through one right answer: the one the set was built around, if it has a reason
  const main = right[Math.floor(Math.random() * right.length)], mp = valid[main][0];
  right.splice(right.indexOf(main), 1); right.unshift(main);
  const reasons = items.map((x, i) => {
    if (!valid[i].length) return { list: [], answer: -1 };
    const good = valid[i][0].reason(x);
    // wrong reasons are statements that are false about this number (never "different digit" ones, which can be half true)
    const bad = shuffle(PROPS.filter(p => !p.digit && !p.test(x)).map(p => p.reason(x))).slice(0, easy ? 1 : 2);
    const list = shuffle([good, ...bad]);
    return { list, answer: list.indexOf(good) };
  });
  const labels = items.map(String);
  const steps = [
    { say: mp.ask[0], choices: labels, answer: labels[main], words: false },
    { say: mp.ask[1], choices: YN, answer: 'Yes', words: true },
    { say: 'So the odd one out is…', choices: labels, answer: labels[main] },
  ];
  const q = gq({ t: 'odd-' + S.id, kind: 'verdict', prompt: 'Which one is the odd one out?', answer: [main], key: items.join(),
    clue: { say: 'Look for something three of them share.', point: 'scroll' }, steps: () => steps });
  q.claim = { text: `${items.join(', ')}: they all belong together!` }; q.claimTrue = false; q.items = items; q.valid = valid; q.set = S.id;
  q.verdict = { picks: labels, right, why: 'Now, why is it the odd one out?', reasons: i => reasons[i] };
  return q;
}

const LEVELS = [
  { name: 'True or False?', blurb: 'Is the Captain right? How do you know?', eg: '36 + 20 = 56', quest: 'The Captain has a conjecture! Is he right, {N}?',
    seq: ['tf', 'tf', 'tf', 'tf', 'tf', 'tf', 'tf', 'tf'], make: (type, k, easy) => makeTF(k, easy) },
  { name: 'Treasure Chests', blurb: 'Always, sometimes or never?', eg: 'Adding 10 keeps the ones the same', quest: 'Sort the Captain’s conjectures into the treasure chests!',
    seq: ['always', 'sometimes', 'never', 'always', 'never', 'sometimes', 'always', 'never'], make: (type, k, easy) => makeASN(type, easy) },
  { name: 'Test the Captain', blurb: 'Test it with numbers. Can you bust it?', eg: 'Every 5 times table number ends in 5', quest: 'Test the conjecture, {N}. Can you bust it?',
    seq: ['busted', 'true', 'busted', 'busted', 'true', 'busted', 'true'], make: (type, k, easy) => makeTest(type, easy) },
  { name: 'Spot the Mistake', blurb: 'Find the wrong step and fix it', eg: '45 + 38 = 73?', quest: 'The Captain’s working has a mistake. Can you spot it, {N}?',
    seq: ['m', 'm', 'm', 'm', 'm', 'm', 'm', 'm'], make: (type, k, easy) => makeMistake(k, easy) },
  { name: 'Prove It!', blurb: 'Show the Captain why with a picture', eg: '3 × 4 = 4 × 3', quest: 'The Captain is right this time! Can you prove it, {N}?',
    seq: ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'], make: (type, k, easy) => makeProve(k, easy) },
  { name: 'Odd One Out', blurb: 'Which one doesn’t belong? Why?', eg: '10, 15, 20, 24', quest: 'One of these doesn’t belong. Which one, {N}, and why?',
    seq: ['o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'], make: (type, k, easy) => makeOdd(k, easy) },
];

// Bonnie's fixed lines, for tools/make-voice.mjs (lines with numbers in them use the device voice)
const VOICE_LINES = [
  'Let’s test the Captain’s conjecture!', 'Is the Captain right?', 'Now, how do you know?', 'So is the Captain right?',
  'Always, sometimes or never?', 'Always or never?', 'Which chest does it go in?', 'Tap a number to test it!', 'Test it! Can you bust it?',
  'Did any test bust it?', 'Once yes, once no. So it is…', 'It works every time. So it is…', 'It never works. So it is…',
  'Try a few numbers! One that doesn’t fit busts it.', 'That fits.', 'That busts it!', 'Keep testing!',
  'Spot the mistake, then fix it!', 'Which step is wrong?', 'So which step is wrong?', 'What should it be?', 'Found it!', 'Now fix it.',
  'That step is right!', 'Which one is the odd one out?', 'Now, why is it the odd one out?',
  'So the odd one out is…', 'Look for something three of them share.', 'Tap “One each” until the pile is empty.', 'Tap “Turn the tree”.',
  'Did any apples fall off?', 'Tap “Fill a basket” until the pile is empty.', 'How many baskets?', 'How many in each bowl?', 'How many on each lily pad?',
  'How many in one bowl?', 'And in the other?', 'How many tens?', 'How many ones?', 'How many rows?', 'How many plates?',
  'How many quarters make a whole?', 'Half of 4 quarters is…', 'So is 2 quarters the same as half?', 'Add one more ten.', 'Tap + on the tens.',
  ...new Set(MIS.map(m => m.clue)), ...PROPS.flatMap(p => p.ask),
  // Level 1 clues with no numbers in them
  'Look at the tens!', 'Take away the tens. The ones stay the same.', 'Count in fives!', 'Times 2 means double it!', 'Count in tens!',
  'Half means two equal parts.', 'A quarter is half of a half!', 'Share it into 3 equal groups.', 'The first digit tells you the tens.',
  'Look at the tens first!', 'Look at the ones digit.', 'Share them out one each.', 'Taking away undoes adding!',
  ...new Set(ASN.map(c => c.clue).filter(c => typeof c === 'string' && !/\d/.test(c))),
];

// The world's badge on the Maths map: the Captain's head and hat on a lily pad in the cove (sized in em, like an emoji)
const COVE_ICON = `<svg viewBox="0 0 64 64" width="1em" height="1em" style="vertical-align:-.15em" role="img" aria-label="${CAPTAIN}">
  <ellipse cx="32" cy="54" rx="29" ry="8" fill="#9CCDEB"/><path d="M8 54 q6 -3 12 0 M44 55 q6 -3 12 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
  <ellipse cx="32" cy="50" rx="24" ry="7" fill="#6CB86A"/><path d="M32 50 L52 45 L54 49 Z" fill="#9CCDEB"/>
  <ellipse cx="32" cy="38" rx="19" ry="14" fill="#5DA34B"/>
  <circle cx="22" cy="27" r="8" fill="#5DA34B"/><circle cx="42" cy="27" r="8" fill="#5DA34B"/>
  <circle cx="22" cy="27" r="5.4" fill="#fff"/><circle cx="42" cy="27" r="5.4" fill="#fff"/>
  <circle cx="23" cy="28" r="2.8" fill="#2B2B2B"/><circle cx="43" cy="28" r="2.8" fill="#2B2B2B"/>
  <circle cx="19" cy="40" r="2.6" fill="#F2A3A3" opacity=".8"/><circle cx="45" cy="40" r="2.6" fill="#F2A3A3" opacity=".8"/>
  <path d="M24 40 Q32 47 40 40" fill="none" stroke="#2F5B2A" stroke-width="2.4" stroke-linecap="round"/>
  <g transform="rotate(-6 32 18)"><path d="M12 19 Q32 -3 52 19 Q32 14 12 19 Z" fill="#2E2A3A"/><path d="M8 19 Q32 11 56 19 Q32 25 8 19 Z" fill="#3B3650"/>
  <path d="M32 5 l2 4 l4.4 .5 l-3.2 3 l1 4.3 l-4.2 -2.2 l-4.2 2.2 l1 -4.3 l-3.2 -3 l4.4 -.5 z" fill="#FFC83D"/></g>
</svg>`;

Meadow.registerWorld(M.world({
  warmUps: false, walk: false, teach: false, // reasoning questions don't suit a warm-up or a quick walk
  id: 'y2-maths-captains-cove', name: 'Captain’s Cove', tag: 'Is the Captain right?', icon: COVE_ICON, color: '#3D7FB3', tint: '#E4F0F8',
  intro: `Test the Captain’s conjectures and prove it! ${CAPTAIN} makes bold claims. A <b>conjecture</b> is an idea that might be true. Is the Captain right?`,
  ids: ['true-false', 'always-sometimes-never', 'test-the-captain', 'spot-the-mistake', 'prove-it', 'odd-one-out'],
  levels: LEVELS, host: HOST,
  lines: () => VOICE_LINES,
}));
// for the test page: the claim banks and their checks
window.CaptainsCove = { CAPTAIN, TF, ASN, TEST, MIS, PROVE, PROPS, OOO, validPicks, makeTF, makeASN, makeTest, makeMistake, makeProve, makeOdd };
})();
