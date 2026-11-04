/*
 * Captain's Cove: the claim bank (Part B, Stage 1 plan).
 * Every claim is data with a check, so a test can prove the answer key is right.
 * It runs in the browser and in node:  node docs/captains-cove-check.mjs
 * In Stage 2 this moves into worlds/y2-maths-captains-cove.js.
 */
(() => {
'use strict';
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const range = (a, b, s = 1) => { const r = []; for (let x = a; x <= b; x += s) r.push(x); return r; };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const coin = () => Math.random() < .5;
const tens = n => Math.floor(n / 10), ones = n => n % 10;
const even = n => n % 2 === 0;
const T = n => `${n} ten${n === 1 ? '' : 's'}`;   // 1 ten, 3 tens
const inTable = (n, t) => n > 0 && n % t === 0 && n / t <= 12;
const wrongBy = (c, opts) => pick(opts.map(d => c + d).filter(v => v >= 0 && v !== c));

/* =====================================================================
   LEVEL 1  True or False?  The Captain says one thing with numbers in it.
   make(easy) → { nums, text, truth, reasons: [right, wrong, wrong] }
   check(nums) works the truth out again on its own, from the numbers.
   ===================================================================== */
const TF = [
  { id: 'add-tens', area: 'tens facts', easyOk: false,
    make() { const a = rand(1, 6) * 10 + rand(1, 9), b = rand(1, 3) * 10, t = coin(), c = t ? a + b : wrongBy(a + b, [10, -10]);
      return { nums: { a, b, c }, truth: t, text: `${a} + ${b} = ${c}`,
        reasons: [t ? `${T(tens(a))} and ${T(tens(b))} make ${T(tens(a) + tens(b))}` : `${T(tens(a))} and ${T(tens(b))} make ${T(tens(a) + tens(b))}, not ${tens(c)}`,
          `Adding tens changes the ones`, `${T(tens(a))} and ${T(tens(b))} make ${T(tens(a) + tens(b) + 1)}`] }; },
    check: ({ a, b, c }) => a + b === c },
  { id: 'bond-10', area: 'number bonds', easyOk: true,
    make() { const a = rand(1, 9), t = coin(), b = t ? 10 - a : wrongBy(10 - a, [1, -1]);
      return { nums: { a, b }, truth: t, text: `${a} + ${b} = 10`,
        reasons: [t ? `${a} and ${10 - a} is a number bond to 10` : `${a} needs ${10 - a} to make 10, not ${b}`, `Any two numbers make 10`, `${a} needs ${10 - a + 1} to make 10`] }; },
    check: ({ a, b }) => a + b === 10 },
  { id: 'bond-20', area: 'number bonds', easyOk: false,
    make() { const a = rand(11, 19), t = coin(), b = t ? 20 - a : wrongBy(20 - a, [1, -1]);
      return { nums: { a, b }, truth: t, text: `${a} + ${b} = 20`,
        reasons: [t ? `${ones(a)} and ${10 - ones(a)} make 10, and 10 more is 20` : `${a} needs ${20 - a} to make 20, not ${b}`, `Numbers in the teens always make 20`, `${a} needs ${20 - a + 2} to make 20`] }; },
    check: ({ a, b }) => a + b === 20 },
  { id: 'take-tens', area: '2-digit taking away', easyOk: false,
    make() { const a = rand(4, 9) * 10 + rand(0, 9), b = rand(1, 3) * 10, t = coin(), c = t ? a - b : wrongBy(a - b, [10, -10, 1]);
      return { nums: { a, b, c }, truth: t, text: `${a} − ${b} = ${c}`,
        reasons: [t ? `Take ${T(tens(b))} from ${T(tens(a))}: ${T(tens(a) - tens(b))} are left, and the ones stay the same` : `${a} take away ${b} is ${a - b}, not ${c}`, `Taking away tens changes the ones`, `${a} take away ${b} is ${a - b + 10}`] }; },
    check: ({ a, b, c }) => a - b === c },
  { id: 'times-5', area: '5 times table', easyOk: true,
    make(easy) { const n = rand(1, easy ? 5 : 10), t = coin(), p = t ? n * 5 : wrongBy(n * 5, [5, -5]);
      return { nums: { n, p }, truth: t, text: `${n} × 5 = ${p}`,
        reasons: [t ? `${n} fives make ${n * 5}` : `${n} fives make ${n * 5}, not ${p}`, `Numbers in the 5 times table always end in 5`, `${n} fives make ${n * 5 + 1}`] }; },
    check: ({ n, p }) => n * 5 === p },
  { id: 'times-2', area: '2 times table', easyOk: true,
    make(easy) { const n = rand(1, easy ? 6 : 12), t = coin(), p = t ? n * 2 : wrongBy(n * 2, [1, 2, -2]);
      return { nums: { n, p }, truth: t, text: `${n} × 2 = ${p}`,
        reasons: [t ? `Double ${n} is ${n * 2}` : `Double ${n} is ${n * 2}, not ${p}`, `${n} × 2 is the same as ${n} + 2`, `Double ${n} is ${n * 2 + 2}`] }; },
    check: ({ n, p }) => n * 2 === p },
  { id: 'times-10', area: '10 times table', easyOk: true,
    make(easy) { const n = rand(1, easy ? 5 : 10), t = coin(), p = t ? n * 10 : pick([n + 10, n * 10 + 1, n * 10 - 10].filter(v => v !== n * 10 && v > 0));
      return { nums: { n, p }, truth: t, text: `${n} × 10 = ${p}`,
        reasons: [t ? `${n} tens make ${n * 10}` : `${n} tens make ${n * 10}, not ${p}`, `× 10 means add 10`, `${n} tens make ${n * 10 + 10}`] }; },
    check: ({ n, p }) => n * 10 === p },
  { id: 'half', area: 'halves', easyOk: true,
    make(easy) { const h = rand(1, easy ? 5 : 10), n = h * 2, t = coin(), s = t ? h : wrongBy(h, [1, -1, 2]);
      return { nums: { n, s }, truth: t, text: `Half of ${n} is ${s}`,
        reasons: [t ? `${h} + ${h} = ${n}` : `${s} + ${s} = ${s * 2}, not ${n}`, `Half means take away 2`, `${h} + ${h} = ${n + 2}`] }; },
    check: ({ n, s }) => s * 2 === n },
  { id: 'quarter', area: 'quarters', easyOk: false,
    make() { const q = rand(1, 5), n = q * 4, t = coin(), s = t ? q : wrongBy(q, [1, -1, q]);
      return { nums: { n, s }, truth: t, text: `A quarter of ${n} is ${s}`,
        reasons: [t ? `Half of ${n} is ${n / 2}, and half of ${n / 2} is ${q}` : `Half of ${n} is ${n / 2}, and half of ${n / 2} is ${q}, not ${s}`, `A quarter means take away 4`, `Half of ${n} is ${n / 2 + 1}`] }; },
    check: ({ n, s }) => s * 4 === n },
  { id: 'third', area: 'thirds', easyOk: false,
    make() { const q = rand(1, 5), n = q * 3, t = coin(), s = t ? q : wrongBy(q, [1, -1]);
      return { nums: { n, s }, truth: t, text: `A third of ${n} is ${s}`,
        reasons: [t ? `${n} shared into 3 equal groups is ${q} in each` : `${n} shared into 3 equal groups is ${q} in each, not ${s}`, `A third means take away 3`, `${n} shared into 3 is ${q + 1} in each`] }; },
    check: ({ n, s }) => s * 3 === n },
  { id: 'place-value', area: 'place value', easyOk: true,
    make() { const a = rand(2, 9), b = rand(1, 9), n = a * 10 + b, t = coin(), tw = t ? a : (b !== a ? b : a + 1);
      return { nums: { n, tw }, truth: t, text: `${n} has ${tw} tens`,
        reasons: [t ? `${n} is ${a * 10} + ${b}, and ${a * 10} is ${a} tens` : `${n} is ${a * 10} + ${b}, so it has ${a} tens, not ${tw}`, `The last digit tells you the tens`, `${n} is ${a * 10 + 10} + ${b}`] }; },
    check: ({ n, tw }) => tens(n) === tw },
  { id: 'compare', area: 'place value', easyOk: true,
    make() { let a, b; do { a = rand(1, 9); b = rand(1, 9); } while (a === b);
      const x = a * 10 + b, y = b * 10 + a, t = coin(), [l, r] = t === (x > y) ? [x, y] : [y, x];
      return { nums: { l, r }, truth: t, text: `${l} is bigger than ${r}`,
        reasons: [t ? `${l} has ${tens(l)} tens and ${r} has only ${tens(r)} tens` : `${l} has only ${tens(l)} tens and ${r} has ${tens(r)} tens`, `The number with the bigger ones digit is bigger`, `They have the same digits, so they are the same`] }; },
    check: ({ l, r }) => l > r },
  { id: 'odd-even', area: 'odd and even', easyOk: true,
    make(easy) { const n = rand(easy ? 2 : 11, easy ? 20 : 50), t = coin(), word = t === even(n) ? 'even' : 'odd';
      return { nums: { n, word }, truth: t, text: `${n} is ${word}`,
        reasons: [even(n) ? `${n} ends in ${ones(n)}, so it is in the 2 times table` : `${n} ends in ${ones(n)}, so it is not in the 2 times table`, `Big numbers are always even`, `${n} ends in ${ones(n)}, and ${ones(n)} is ${even(n) ? 'odd' : 'even'}`] }; },
    check: ({ n, word }) => (word === 'even') === even(n) },
  { id: 'share', area: 'sharing', easyOk: true,
    make(easy) { const g = pick(easy ? [2] : [2, 3, 5]), e = rand(2, easy ? 5 : 6), n = g * e, t = coin(), s = t ? e : wrongBy(e, [1, -1]);
      return { nums: { n, g, s }, truth: t, text: `${n} bones shared between ${g} dogs is ${s} each`,
        reasons: [t ? `${g} lots of ${e} make ${n}` : `${g} lots of ${s} make ${g * s}, not ${n}`, `Sharing means take away ${g}`, `${g} lots of ${e} make ${n + g}`] }; },
    check: ({ n, g, s }) => g * s === n },
  { id: 'fact-family', area: 'fact families', easyOk: false,
    make() { const a = rand(6, 9), b = pick([3, 4, 5, 6, 7, 8, 9].filter(x => x !== a)), c = a + b, t = coin(), d = t ? a : wrongBy(a, [1, -1]);
      return { nums: { a, b, c, d }, truth: t, text: `${a} + ${b} = ${c}, so ${c} − ${b} = ${d}`,
        reasons: [t ? `Taking away undoes adding: ${c} − ${b} gets back to ${a}` : `Taking away undoes adding: ${c} − ${b} gets back to ${a}, not ${d}`, `Adding and taking away are not linked`, `${c} − ${b} gets back to ${a + 2}`] }; },
    check: ({ a, b, c, d }) => a + b === c && c - b === d },
];

/* =====================================================================
   LEVEL 2  Treasure Chests: Always, Sometimes or Never?
   holds(x) is tried on every x in the domain:
     all yes → always · all no → never · some of each → sometimes.
   Easy mode uses only always and never claims, with two chests.
   ===================================================================== */
const pairs = (a, b) => { const r = []; for (let x = a; x <= b; x++) for (let y = a; y <= b; y++) r.push([x, y]); return r; };
const n100 = range(0, 89), n20 = range(1, 20), n50 = range(1, 50);
const odds = range(1, 49, 2), evens = range(0, 50, 2);
const ASN = [
  { id: 'add-10-ones', text: 'Adding 10 keeps the ones digit the same', answer: 'always', domain: n100, holds: n => ones(n + 10) === ones(n) },
  { id: 'even+even', text: 'Even + even makes an even number', answer: 'always', domain: pairs(0, 30).filter(([a, b]) => even(a) && even(b)), holds: ([a, b]) => even(a + b) },
  { id: 'odd+odd', text: 'Odd + odd makes an even number', answer: 'always', domain: pairs(1, 31).filter(([a, b]) => !even(a) && !even(b)), holds: ([a, b]) => even(a + b) },
  { id: 'odd+even', text: 'Odd + even makes an odd number', answer: 'always', domain: pairs(0, 30).filter(([a, b]) => !even(a) && even(b)), holds: ([a, b]) => !even(a + b) },
  { id: 'tens-end-0', text: 'Numbers in the 10 times table end in 0', answer: 'always', domain: range(10, 100, 10), holds: n => ones(n) === 0 },
  { id: 'twos-even', text: 'Numbers in the 2 times table are even', answer: 'always', domain: range(2, 24, 2), holds: even },
  { id: 'fives-end', text: 'Numbers in the 5 times table end in 0 or 5', answer: 'always', domain: range(5, 60, 5), holds: n => ones(n) === 0 || ones(n) === 5 },
  { id: 'add-order', text: 'You can add two numbers in any order and get the same answer', answer: 'always', domain: pairs(0, 20), holds: ([a, b]) => a + b === b + a },
  { id: 'times-order', text: 'You can swap the numbers when you times and get the same answer', answer: 'always', domain: pairs(1, 12).filter(([a]) => [2, 5, 10].includes(a)), holds: ([a, b]) => a * b === b * a },
  { id: 'add-0', text: 'Adding 0 leaves a number the same', answer: 'always', domain: range(0, 100), holds: n => n + 0 === n },
  { id: 'tens-in-fives', text: 'Numbers in the 10 times table are in the 5 times table too', answer: 'always', domain: range(10, 60, 10), holds: n => n % 5 === 0 },
  { id: 'half-whole', text: 'Half of a number is a whole number', answer: 'sometimes', domain: n20, holds: even, easy: false },
  { id: 'fives-odd', text: 'Numbers in the 5 times table are odd', answer: 'sometimes', domain: range(5, 60, 5), holds: n => !even(n) },
  { id: 'sum-even', text: 'Adding two numbers makes an even number', answer: 'sometimes', domain: pairs(1, 20), holds: ([a, b]) => even(a + b) },
  { id: 'twos-in-fives', text: 'Numbers in the 2 times table are in the 5 times table too', answer: 'sometimes', domain: range(2, 24, 2), holds: n => n % 5 === 0 },
  { id: 'share-2', text: 'A number of bones can be shared fairly between 2 dogs', answer: 'sometimes', domain: n20, holds: even },
  { id: 'share-4', text: 'A number of bones can be shared fairly into quarters', answer: 'sometimes', domain: n20, holds: n => n % 4 === 0 },
  { id: 'cross-ten', text: 'Adding two 1-digit numbers makes a number bigger than 10', answer: 'sometimes', domain: pairs(1, 9), holds: ([a, b]) => a + b > 10 },
  { id: 'ones-bigger', text: 'In a 2-digit number, the ones digit is bigger than the tens digit', answer: 'sometimes', domain: range(10, 99), holds: n => ones(n) > tens(n) },
  { id: 'over-50', text: 'A 2-digit number is bigger than 50', answer: 'sometimes', domain: range(10, 99), holds: n => n > 50 },
  { id: 'take-swap', text: 'You can swap two different numbers in a take away and get the same answer', answer: 'never', domain: pairs(1, 20).filter(([a, b]) => a !== b), holds: ([a, b]) => a - b === b - a },
  { id: 'odd+odd-odd', text: 'Odd + odd makes an odd number', answer: 'never', domain: pairs(1, 31).filter(([a, b]) => !even(a) && !even(b)), holds: ([a, b]) => !even(a + b) },
  { id: 'even+even-odd', text: 'Even + even makes an odd number', answer: 'never', domain: pairs(0, 30).filter(([a, b]) => even(a) && even(b)), holds: ([a, b]) => !even(a + b) },
  { id: 'tens-end-5', text: 'Numbers in the 10 times table end in 5', answer: 'never', domain: range(10, 100, 10), holds: n => ones(n) === 5 },
  { id: 'twos-odd', text: 'Numbers in the 2 times table are odd', answer: 'never', domain: range(2, 24, 2), holds: n => !even(n) },
  { id: 'add-10-change', text: 'Adding 10 changes the ones digit', answer: 'never', domain: n100, holds: n => ones(n + 10) !== ones(n) },
  { id: 'half-odd', text: 'Half of an odd number is a whole number', answer: 'never', domain: odds, holds: n => Number.isInteger(n / 2) },
  { id: 'two-digit-small', text: 'A 2-digit number is smaller than 10', answer: 'never', domain: range(10, 99), holds: n => n < 10 },
  { id: 'threeq-half', text: 'Three quarters of something is less than half of it', answer: 'never', domain: range(4, 40, 4), holds: n => n * 3 / 4 < n / 2 },
  { id: 'odd+even-even', text: 'Odd + even makes an even number', answer: 'never', domain: pairs(0, 30).filter(([a, b]) => !even(a) && even(b)), holds: ([a, b]) => even(a + b) },
];
const asnOf = c => { const r = c.domain.map(c.holds); return r.every(Boolean) ? 'always' : r.some(Boolean) ? 'sometimes' : 'never'; };

/* =====================================================================
   LEVEL 3  Test the Captain.  He claims something that sounds right.
   Tap test numbers (from `tests`); each one shows whether it fits.
   One that doesn't fit busts the claim. Only the verdict is marked.
   ===================================================================== */
const TEST = [
  { id: 'fives-end-5', text: 'Every number in the 5 times table ends in 5', verdict: 'busted', tests: [5, 10, 15, 20, 25, 30], show: n => `${n} ends in ${ones(n)}`, holds: n => ones(n) === 5, domain: range(5, 60, 5) },
  { id: 'twos-end-2', text: 'Every number in the 2 times table ends in 2', verdict: 'busted', tests: [2, 4, 6, 12, 22, 8], show: n => `${n} ends in ${ones(n)}`, holds: n => ones(n) === 2, domain: range(2, 24, 2) },
  { id: 'odd+odd-odd', text: 'Odd + odd makes an odd number', verdict: 'busted', tests: [[1, 3], [3, 5], [5, 7], [7, 9], [9, 11], [11, 13]], show: ([a, b]) => `${a} + ${b} = ${a + b}`, holds: ([a, b]) => !even(a + b), domain: pairs(1, 15).filter(([a, b]) => !even(a) && !even(b)) },
  { id: 'half-whole', text: 'Half of any number is a whole number', verdict: 'busted', tests: [4, 6, 7, 10, 12, 9], show: n => `Half of ${n} is ${even(n) ? n / 2 : `${(n - 1) / 2} and a half`}`, holds: even, domain: n20 },
  { id: 'share-2', text: 'Any number of bones can be shared fairly between 2 dogs', verdict: 'busted', tests: [8, 10, 12, 13, 14, 16], show: n => even(n) ? `${n}: ${n / 2} each` : `${n}: ${(n - 1) / 2} each and 1 left over`, holds: even, domain: n20 },
  { id: 'teens-even', text: 'Every number between 10 and 20 is even', verdict: 'busted', tests: [12, 14, 16, 11, 18, 15], show: n => `${n} is ${even(n) ? 'even' : 'odd'}`, holds: even, domain: range(11, 19) },
  { id: 'tens-bigger', text: 'In every 2-digit number, the tens digit is bigger than the ones digit', verdict: 'busted', tests: [21, 43, 52, 37, 61, 85], show: n => `${n}: ${tens(n)} tens and ${ones(n)} ones`, holds: n => tens(n) > ones(n), domain: range(10, 99) },
  { id: 'bonds-odd', text: 'Two numbers that make 10 are both odd', verdict: 'busted', tests: [[1, 9], [3, 7], [4, 6], [7, 3], [9, 1], [2, 8]], show: ([a, b]) => `${a} + ${b}: ${!even(a) && !even(b) ? 'both odd' : 'both even'}`, holds: ([a, b]) => !even(a) && !even(b), domain: range(1, 9).map(a => [a, 10 - a]) },
  { id: 'evens-in-tens', text: 'Every even number is in the 10 times table', verdict: 'busted', tests: [10, 20, 4, 30, 40, 16], show: n => `${n} ${n % 10 === 0 ? 'is' : 'is not'} in the 10 times table`, holds: n => n % 10 === 0, domain: range(2, 40, 2) },
  { id: 'add-10-ones', text: 'Adding 10 keeps the ones digit the same', verdict: 'true', tests: [23, 47, 8, 61, 35, 79], show: n => `${n} + 10 = ${n + 10}`, holds: n => ones(n + 10) === ones(n), domain: n100 },
  { id: 'tens-end-0', text: 'Every number in the 10 times table ends in 0', verdict: 'true', tests: [10, 20, 30, 50, 70, 100], show: n => `${n} ends in ${ones(n)}`, holds: n => ones(n) === 0, domain: range(10, 100, 10) },
  { id: 'odd+odd-even', text: 'Odd + odd makes an even number', verdict: 'true', tests: [[1, 3], [5, 7], [3, 9], [7, 7], [9, 11], [5, 13]], show: ([a, b]) => `${a} + ${b} = ${a + b}`, holds: ([a, b]) => even(a + b), domain: pairs(1, 31).filter(([a, b]) => !even(a) && !even(b)) },
  { id: 'add-swap', text: 'Swapping the numbers when you add gives the same answer', verdict: 'true', tests: [[3, 5], [7, 2], [9, 6], [4, 8], [10, 5], [6, 1]], show: ([a, b]) => `${a} + ${b} = ${a + b} and ${b} + ${a} = ${b + a}`, holds: ([a, b]) => a + b === b + a, domain: pairs(0, 20) },
  { id: 'double-even', text: 'Doubling a number always makes an even number', verdict: 'true', tests: [3, 5, 7, 4, 9, 6], show: n => `Double ${n} is ${n * 2}`, holds: n => even(n * 2), domain: range(1, 20) },
  { id: 'tens-in-fives', text: 'Every number in the 10 times table is in the 5 times table too', verdict: 'true', tests: [10, 20, 30, 40, 50, 60], show: n => `${n} = ${n / 5} fives`, holds: n => n % 5 === 0, domain: range(10, 60, 10) },
  { id: 'twos-even', text: 'Every number in the 2 times table is even', verdict: 'true', tests: [2, 6, 10, 14, 18, 24], show: n => `${n} ends in ${ones(n)}`, holds: even, domain: range(2, 24, 2) },
];
const testVerdictOf = c => (c.domain.every(c.holds) ? 'true' : 'busted');

/* =====================================================================
   LEVEL 4  Spot the Mistake.  The Captain shows his working in steps.
   Exactly one step is wrong: tap it, then fix it.
   make(easy) → { title, answer, steps: [{ text(v), shown, right }] }
   ===================================================================== */
const MIS = [
  { id: 'add-exchange', area: '2-digit adding', easyOk: false,
    make() { let a, b; do { a = rand(2, 6) * 10 + rand(3, 9); b = rand(1, 3) * 10 + rand(3, 9); } while (ones(a) + ones(b) < 10);
      const T = tens(a) * 10 + tens(b) * 10, O = ones(a) + ones(b);
      return { title: `${a} + ${b}`, answer: a + b, wrong: 2, steps: [
        { text: v => `${tens(a) * 10} + ${tens(b) * 10} = ${v}`, right: T },
        { text: v => `${ones(a)} + ${ones(b)} = ${v}`, right: O },
        { text: v => `${T} + ${O} = ${v}`, right: T + O, shown: T + O - 10, why: 'He forgot the ten from the ones' }] }; } },
  { id: 'take-partition', area: '2-digit taking away', easyOk: false,
    make() { const a = rand(4, 9) * 10 + rand(1, 5), b = 10 + rand(6, 9), m = a - 10;
      return { title: `${a} − ${b}`, answer: a - b, wrong: 1, steps: [
        { text: v => `${a} − 10 = ${v}`, right: m },
        { text: v => `${m} − ${ones(b)} = ${v}`, right: m - ones(b), shown: m - ones(b) + 1 }] }; } },
  { id: 'count-5s', area: '5 times table', easyOk: true,
    make(easy) { const n = rand(easy ? 3 : 4, easy ? 4 : 6), w = rand(2, n - 1);
      return { title: `${n} × 5 (counting in fives)`, answer: n * 5, wrong: w, steps: range(0, n - 1).map(i =>
        ({ text: v => `${i + 1} five${i ? 's' : ''}: ${v}`, right: (i + 1) * 5, shown: i === w ? (i + 1) * 5 + 1 : undefined, keepGoing: true })) }; } },
  { id: 'partition', area: 'place value', easyOk: true,
    make() { const a = rand(2, 9), b = rand(1, 9), n = a * 10 + b;
      return { title: `Split ${n} into tens and ones`, answer: n, wrong: 1, steps: [
        { text: v => `${n} has ${v} tens and ${b} ones`, right: a },
        { text: v => `${a} tens is ${v}`, right: a * 10, shown: a },
        { text: v => `${n} = ${a * 10} + ${v}`, right: b }] }; } },
  { id: 'bridge-10', area: 'number bonds', easyOk: true,
    make() { const a = rand(6, 9), b = rand(11 - a, 9), need = 10 - a, rest = b - need;
      return { title: `${a} + ${b} (make 10 first)`, answer: a + b, wrong: 1, steps: [
        { text: v => `${a} needs ${v} to make 10`, right: need },
        { text: v => `Split ${b} into ${need} and ${v}`, right: rest, shown: rest + 1 },
        { text: v => `10 + ${rest} = ${v}`, right: 10 + rest }] }; } },
  { id: 'half-split', area: 'halves', easyOk: false,
    make() { const t = rand(1, 4) * 2, o = pick([2, 4, 6, 8]), n = t * 10 + o;
      return { title: `Half of ${n}`, answer: n / 2, wrong: 1, steps: [
        { text: v => `Half of ${t * 10} is ${v}`, right: t * 5 },
        { text: v => `Half of ${o} is ${v}`, right: o / 2, shown: o / 2 + 1 },
        { text: v => `${t * 5} + ${o / 2} = ${v}`, right: t * 5 + o / 2 }] }; } },
  { id: 'share-count', area: 'sharing', easyOk: true,
    make(easy) { const g = pick(easy ? [2] : [2, 3]), e = rand(4, 6), w = rand(1, e - 2);
      return { title: `${g * e} shared between ${g} (count in ${g}s)`, answer: e, wrong: w, steps: range(0, e - 1).map(i =>
        ({ text: v => `${i + 1} each: ${v} used`, right: (i + 1) * g, shown: i === w ? (i + 1) * g + 1 : undefined, keepGoing: true })) }; } },
  { id: 'three-add', area: 'adding 3 numbers', easyOk: true,
    make() { const a = rand(1, 9), b = 10 - a, c = rand(2, 9);
      return { title: `${a} + ${c} + ${b}`, answer: a + b + c, wrong: 1, steps: [
        { text: v => `${a} + ${b} = ${v}`, right: 10 },
        { text: v => `10 + ${c} = ${v}`, right: 10 + c, shown: 10 + c - 1 }] }; } },
  { id: 'fact-family', area: 'fact families', easyOk: false,
    make() { const a = rand(6, 9), b = pick([4, 5, 6, 7, 8, 9].filter(x => x !== a)), c = a + b;
      return { title: `The ${a}, ${b}, ${c} family`, answer: c, wrong: 2, steps: [
        { text: v => `${a} + ${b} = ${v}`, right: c },
        { text: v => `${c} − ${b} = ${v}`, right: a },
        { text: v => `${c} − ${a} = ${v}`, right: b, shown: b + 1 }] }; } },
  { id: 'count-on-10s', area: 'tens facts', easyOk: true,
    make() { const s = rand(1, 3) * 10 + rand(1, 9), w = rand(2, 3);
      return { title: `Count on in tens from ${s}`, answer: s + 40, wrong: w, steps: range(1, 4).map((k, i) =>
        ({ text: v => `${s + (k - 1) * 10} + 10 = ${v}`, right: s + k * 10, shown: i === w ? s + k * 10 + 1 : undefined })) }; } },
  { id: 'quarter-halve', area: 'quarters', easyOk: false,
    make() { const q = rand(2, 5), n = q * 4;
      return { title: `A quarter of ${n} (halve it, then halve again)`, answer: q, wrong: 0, steps: [
        { text: v => `Half of ${n} is ${v}`, right: q * 2, shown: q * 2 + 1 },
        { text: v => `Half of ${q * 2} is ${v}`, right: q }] }; } },
  { id: 'missing-add', area: 'fact families', easyOk: true,
    make(easy) { const c = rand(easy ? 6 : 11, easy ? 10 : 18), b = rand(2, c - 2), a = c - b;
      return { title: `□ + ${b} = ${c}`, answer: a, wrong: 0, steps: [
        { text: v => `${c} − ${b} = ${v}`, right: a, shown: a + 1 },
        { text: v => `Check: ${a} + ${b} = ${v}`, right: c }] }; } },
];

/* =====================================================================
   LEVEL 5  Prove It!  Every claim here is true. Use a picture to show why,
   then answer the last question. `pic` says which kit picture is used.
   ===================================================================== */
const PROVE = [
  { id: 'odd+odd', pic: 'share into 2 bowls', make: () => { const a = pick([3, 5, 7]), b = pick([1, 3, 5]); return { text: `${a} + ${b} is even`, n: a + b, ask: 'Is any bone left over?', answer: 'No' }; }, check: v => even(v.n) },
  { id: 'array-turn', pic: 'array with Turn the tree', make: () => { let a, b; do { a = rand(2, 5); b = rand(2, 5); } while (a === b); return { text: `${a} × ${b} = ${b} × ${a}`, a, b, ask: 'How many apples after you turn it?', answer: a * b }; }, check: v => v.a * v.b === v.b * v.a && v.answer === v.a * v.b },
  { id: 'add-10', pic: 'tens and ones blocks', make: () => { const n = rand(12, 79); return { text: `${n} + 10 keeps the ones digit`, n, ask: 'How many ones now?', answer: ones(n) }; }, check: v => ones(v.n + 10) === v.answer },
  { id: 'add-swap', pic: 'burrow frame', make: () => { const a = rand(5, 8), b = rand(1, 10 - a); return { text: `${a} + ${b} = ${b} + ${a}`, a, b, ask: 'How many altogether, either way?', answer: a + b }; }, check: v => v.a + v.b === v.answer && v.b + v.a === v.answer },
  { id: 'half', pic: 'share into 2 bowls', make: () => { const h = rand(3, 9); return { text: `Half of ${h * 2} is ${h}`, n: h * 2, ask: 'How many in each bowl?', answer: h }; }, check: v => v.answer * 2 === v.n },
  { id: 'share-3', pic: 'share into 3 bowls', make: () => { const e = rand(2, 5); return { text: `${e * 3} shared between 3 is ${e} each`, n: e * 3, ask: 'How many in each bowl?', answer: e }; }, check: v => v.answer * 3 === v.n },
  { id: 'in-5s', pic: 'baskets of 5', make: () => { const k = rand(2, 6); return { text: `${k * 5} is in the 5 times table`, n: k * 5, ask: 'How many baskets of 5?', answer: k }; }, check: v => v.answer * 5 === v.n },
  { id: 'bridge-10', pic: 'burrow frame (fill 10 first)', make: () => { const a = rand(6, 9), b = rand(11 - a, 9); return { text: `${a} + ${b} = ${a + b}`, a, b, ask: 'How many altogether?', answer: a + b }; }, check: v => v.a + v.b === v.answer },
  { id: 'partition', pic: 'tens and ones blocks', make: () => { const n = rand(21, 89); return { text: `${n} = ${tens(n) * 10} + ${ones(n)}`, n, ask: 'How many tens?', answer: tens(n) }; }, check: v => v.answer * 10 + ones(v.n) === v.n },
  { id: 'even-pairs', pic: 'share into 2 bowls', make: () => { const n = pick([6, 8, 10, 12, 14, 16]); return { text: `${n} is even`, n, ask: 'Is any bone left over?', answer: 'No' }; }, check: v => even(v.n) },
  { id: 'double', pic: 'array with 2 rows', make: () => { const n = rand(3, 9); return { text: `Double ${n} is ${n * 2}`, n, ask: 'How many apples?', answer: n * 2 }; }, check: v => v.answer === v.n + v.n },
  { id: 'two-quarters', pic: 'shape shading', make: () => ({ text: '2 quarters make a half', ask: 'Is the shaded part the same as a half?', answer: 'Yes' }), check: () => 2 / 4 === 1 / 2 },
  { id: 'groups-of-2', pic: 'plates of 2', make: () => { const g = rand(3, 8); return { text: `${g} × 2 = ${g * 2}`, g, ask: 'How many bones on the plates?', answer: g * 2 }; }, check: v => v.answer === v.g * 2 },
];

/* =====================================================================
   LEVEL 6  Odd One Out.  Four numbers: pick the one that doesn't belong,
   then pick the reason. Any pick is right if a reason makes it the only one.
   ===================================================================== */
const PROPS = [
  { id: 'odd', reason: n => `${n} is odd and the others are even`, test: n => !even(n) },
  { id: 'even', reason: n => `${n} is even and the others are odd`, test: even },
  { id: 'not-5s', reason: n => `${n} is not in the 5 times table`, test: n => n % 5 !== 0 },
  { id: 'not-10s', reason: n => `${n} is not in the 10 times table`, test: n => n % 10 !== 0 },
  { id: 'in-10s', reason: n => `${n} is in the 10 times table and the others are not`, test: n => n % 10 === 0 },
  { id: 'one-digit', reason: n => `${n} has only 1 digit`, test: n => n < 10 },
  { id: 'over-50', reason: n => `${n} is more than 50 and the others are not`, test: n => n > 50 },
  { id: 'under-50', reason: n => `${n} is less than 50 and the others are not`, test: n => n < 50 },
  { id: 'diff-tens', reason: n => `${n} has a different number of tens`, test: null },  // filled in per set
  { id: 'diff-ones', reason: n => `${n} has a different ones digit`, test: null },
];
// Which picks are right? An item is right for a property when it is the only one that has it.
// (diff-tens / diff-ones: the only one whose digit differs from the other three, which all match.)
function validPicks(items) {
  const out = [];
  for (const p of PROPS) {
    let has;
    if (p.id === 'diff-tens' || p.id === 'diff-ones') {
      const d = p.id === 'diff-tens' ? tens : ones;
      has = items.map((x, i) => items.filter((y, j) => j !== i).every((y, _, a) => d(y) === d(a[0])) && d(x) !== d(items[(i + 1) % 4]));
    } else has = items.map(p.test);
    const yes = has.map((h, i) => h ? i : -1).filter(i => i >= 0);
    if (yes.length === 1) out.push({ item: items[yes[0]], prop: p.id, reason: p.reason(items[yes[0]]) });
  }
  return out;
}
// sets the Captain might show (each made fresh: three that share something, one that doesn't)
const OOO = [
  { id: 'fives', make: () => { const fs = shuffle(range(2, 10).map(k => k * 5)).slice(0, 3); let x; do { x = rand(11, 49); } while (x % 5 === 0); return shuffle([...fs, x]); } },
  { id: 'evens', make: () => { const es = shuffle(range(2, 20, 2)).slice(0, 3); return shuffle([...es, pick(range(3, 19, 2))]); } },
  { id: 'odds', make: () => { const os = shuffle(range(1, 19, 2)).slice(0, 3); return shuffle([...os, pick(range(2, 20, 2))]); } },
  { id: 'tens', make: () => { const ts = shuffle(range(1, 9).map(k => k * 10)).slice(0, 3); let x; do { x = rand(11, 89); } while (x % 10 === 0); return shuffle([...ts, x]); } },
  { id: 'same-tens', make: () => { const t = rand(2, 7), os = shuffle(range(1, 9)).slice(0, 4), base = os.slice(0, 3).map(o => t * 10 + o); return shuffle([...base, (t + pick([1, 2])) * 10 + os[3]]); } },
  { id: 'same-ones', make: () => { const o = rand(1, 9), ts = shuffle(range(1, 9)).slice(0, 4); return shuffle([...ts.slice(0, 3).map(t => t * 10 + o), ts[3] * 10 + (o % 9) + 1]); } },
  { id: 'big', make: () => { const bs = shuffle(range(55, 95)).slice(0, 3); return shuffle([...bs, rand(12, 45)]); } },
  { id: 'small', make: () => { const ss = shuffle(range(12, 45)).slice(0, 3); return shuffle([...ss, rand(55, 95)]); } },
  { id: 'one-digit', make: () => { const ts = shuffle(range(12, 40)).slice(0, 3); return shuffle([...ts, rand(2, 9)]); } },
  { id: 'brief-example', make: () => shuffle([10, 15, 20, 24]) },
];

globalThis.COVE_CLAIMS = { TF, ASN, asnOf, TEST, testVerdictOf, MIS, PROVE, PROPS, OOO, validPicks };
})();
