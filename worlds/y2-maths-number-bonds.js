/*
 * Year 2 Maths: Number Bonds Burrow (adding and taking away).
 * Needs worlds/y2-maths-kit.js first. Questions are made with gq() and carry their own clue and step card.
 * The main picture is the burrow frame from the kit: a ten frame drawn as 10 burrow holes
 * (two frames for numbers up to 20). Bones are the first number, carrots the second.
 * (Year 2: "recall and use addition and subtraction facts to 20 fluently, and derive and use
 *  related facts up to 100".)
 */
(() => {
'use strict';
const M = window.MeadowMaths;
const { rand, pick, near, gq, fillStep, burrow, burrowCount, burrowFull, NAME } = M;

// put k of the question's carrots (or bones) into the burrows in order, so the first frame fills first
function placeIn(v, k) {
  v.holes.forEach(h => { if (h.mine) { h.k = ''; h.mine = false; } });
  for (const h of v.holes) { if (!k) break; if (!h.k) { h.k = v.item; h.mine = true; k--; } }
  v.last = -1; M.redraw();
}
// Bonnie eats k, starting from the last one (so the second burrow empties first)
function eatLast(v, k) {
  v.holes.forEach(h => { h.eaten = false; });
  for (let i = v.holes.length - 1; i >= 0 && k; i--) if (v.holes[i].k && !v.holes[i].mine) { v.holes[i].eaten = true; k--; }
  M.redraw();
}
const eaten = v => burrowCount(v, h => h.eaten);
const withShow = (st, onShow) => ({ ...st, onShow });

/* ---------- Level 1: Bonds to 10 ---------- */
function bondFill(t, T, a, boxFirst) {
  const b = T - a;
  return gq({ t, prompt: boxFirst ? `What number and ${a} make ${T}?` : `What goes with ${a} to make ${T}?`,
    eq: boxFirst ? [{ box: 0 }, '+', { num: a }, '=', { num: T }] : [{ num: a }, '+', { box: 0 }, '=', { num: T }], answer: [b],
    vis: burrow({ n: T, a, tap: 'fill' }), tip: 'Tap an empty burrow to drop a bone in.',
    clue: { say: 'Fill the empty burrows. Count how many you add!', point: 'visual' },
    steps: q => [
      { say: 'Tap the empty burrows to fill them up.', point: 'visual', action: () => burrowFull(q.vis), wait: 'Fill the burrows up there!' },
      fillStep('How many bones did you add?', b, near(b)),
    ] });
}
function bondTake(t, T, a, askEaten) {
  const left = T - a, vis = burrow({ n: T, a: T, tap: 'take' });
  if (askEaten) return gq({ t, prompt: `Bonnie ate some of the ${T} bones. ${left} are left. How many did she eat?`,
    eq: [{ num: T }, '−', { box: 0 }, '=', { num: left }], answer: [a], vis, tip: 'Tap a bone for Bonnie to eat it.',
    clue: { say: `Feed Bonnie until there are ${left} left.`, point: 'visual' },
    steps: q => [
      { say: `Tap bones for Bonnie until ${left} are left.`, point: 'visual', action: () => burrowCount(q.vis) === left, wait: 'Feed Bonnie up there!' },
      fillStep('How many did Bonnie eat?', a, near(a)),
    ] });
  return gq({ t, prompt: pick([`Bonnie found ${T} bones and ate ${a}. How many are left?`, `What is ${T} take away ${a}?`]),
    eq: [{ num: T }, '−', { num: a }, '=', { box: 0 }], answer: [left], vis, tip: 'Tap a bone for Bonnie to eat it.',
    clue: { say: `What goes with ${a} to make ${T}?`, point: 'visual' },
    steps: q => [
      { say: `Tap ${a} bone${a > 1 ? 's' : ''} for Bonnie to eat.`, point: 'visual', action: () => eaten(q.vis) === a, wait: 'Feed Bonnie up there!' },
      fillStep('How many bones are left?', left, near(left)),
    ] });
}

/* ---------- Level 2: Bonds to 20 ---------- */
// a + b, with the bones first and b carrots to put in the burrows
function add20(t, a, b, prompt, item = 'carrot') {
  const ans = a + b, eq = [{ num: a }, '+', { num: b }, '=', { box: 0 }];
  const vis = burrow({ n: 20, a, aItem: item === 'carrot' ? 'bone' : item, tap: 'fill', item, pile: b });
  const tip = `Tap the burrows to put the ${item}s in.`;
  if (a < 10 && ans > 10) { // crossing 10: fill the first burrow, then the rest
    const need = 10 - a, rest = b - need;
    return gq({ t, prompt, eq, answer: [ans], vis, tip,
      clue: { say: 'Fill the first burrow to 10 first!', point: 'frame-0' },
      steps: q => [
        { say: `How many more to make 10?`, point: 'frame-0', choices: near(need), answer: need },
        withShow({ say: `How many are left of the ${b}?`, point: 'pile', choices: near(rest), answer: rest }, () => placeIn(q.vis, need)),
        withShow(fillStep(`10 and ${rest} more is…`, ans, [ans - 1, ans + 1, 10 + b, ans + 10]), () => placeIn(q.vis, b)),
      ] });
  }
  const o = a % 10; // no crossing: the ones add up, the ten stays
  return gq({ t, prompt, eq, answer: [ans], vis, tip,
    clue: { say: a >= 10 ? `The first burrow is full: that’s 10. Add the ones!` : `Count on ${b} from ${a}.`, point: 'visual' },
    steps: q => a >= 10 ? [
      { say: `How many ones in ${a}?`, point: 'frame-1', choices: near(o), answer: o },
      withShow({ say: `${o} + ${b} = ?`, choices: near(o + b), answer: o + b }, () => placeIn(q.vis, b)),
      fillStep(`So 10 and ${o + b} is…`, ans, [o + b, ans - 1, ans + 1, ans + 10]),
    ] : [
      { say: `Start at ${a}. Put the ${b} in the burrows.`, point: 'visual', action: () => q.vis.holes.filter(h => h.mine).length === b, wait: 'Tap the burrows up there!' },
      fillStep(`${a} and ${b} more is…`, ans, [ans - 1, ans + 1, ans + 2]),
    ] });
}
// n − s, with Bonnie eating from the second burrow first
function sub20(t, n, s, prompt, item = 'bone') {
  const ans = n - s, u = n - 10, eq = [{ num: n }, '−', { num: s }, '=', { box: 0 }];
  const vis = burrow({ n: 20, a: n, aItem: item, tap: 'take' }), tip = `Tap a ${item} for Bonnie to eat it.`;
  if (s > u) { // crossing 10: take away down to 10, then the rest
    const more = s - u;
    return gq({ t, prompt, eq, answer: [ans], vis, tip,
      clue: { say: `Take away the ${u} in the second burrow first. That leaves 10.`, point: 'frame-1' },
      steps: q => [
        { say: `${n} take away ${u} is?`, point: 'frame-1', choices: [9, 10, 11], answer: 10 },
        withShow({ say: `That’s ${u} gone. How many more to take away?`, choices: near(more), answer: more }, () => eatLast(q.vis, u)),
        withShow(fillStep(`10 take away ${more} is…`, ans, [ans - 1, ans + 1, 10 - s, ans + 10].filter(v => v > 0)), () => eatLast(q.vis, s)),
      ] });
  }
  return gq({ t, prompt, eq, answer: [ans], vis, tip,
    clue: { say: `Leave the full burrow alone. Take ${s} from the ones.`, point: 'frame-1' },
    steps: q => [
      { say: `How many ones in ${n}?`, point: 'frame-1', choices: near(u), answer: u },
      withShow({ say: `${u} take away ${s} is?`, choices: near(u - s), answer: u - s }, () => eatLast(q.vis, s)),
      fillStep(`So 10 and ${u - s} is…`, ans, [u - s, ans - 1, ans + 1, ans + 10]),
    ] });
}
function miss20(t, a, c) {
  const ans = c - a, eq = [{ num: a }, '+', { box: 0 }, '=', { num: c }];
  const vis = burrow({ n: 20, a, tap: 'fill', item: 'carrot' }), tip = 'Tap the burrows to put carrots in.';
  if (a < 10) return gq({ t, prompt: `What goes with ${a} to make ${c}?`, eq, answer: [ans], vis, tip,
    clue: { say: `Fill the first burrow to 10, then keep going to ${c}.`, point: 'frame-0' },
    steps: () => [
      { say: `${a} + ? = 10`, point: 'frame-0', choices: near(10 - a), answer: 10 - a },
      { say: `10 + ? = ${c}`, point: 'frame-1', choices: near(c - 10), answer: c - 10 },
      fillStep(`${10 - a} and ${c - 10} make…`, ans, [ans - 1, ans + 1, c - 10, 10 - a]),
    ] });
  return gq({ t, prompt: `What goes with ${a} to make ${c}?`, eq, answer: [ans], vis, tip,
    clue: { say: 'The tens are the same. Look at the ones!', point: 'frame-1' },
    steps: () => [
      { say: `How many ones in ${a}?`, choices: near(a - 10), answer: a - 10 },
      { say: `How many ones in ${c}?`, choices: near(c - 10), answer: c - 10 },
      fillStep(`${a - 10} + ? = ${c - 10}`, ans, [ans - 1, ans + 1, ans + 2]),
    ] });
}
function make20(type, easy) {
  // crossing 10: a one-digit number and a bigger one. Easy: a teen number and some ones, no crossing.
  const addPair = () => { if (easy) { const a = 10 + rand(1, 5); return [a, rand(1, 19 - a)]; } const a = rand(5, 9); return [a, rand(11 - a, 9)]; };
  const subPair = () => { const n = rand(11, 18); return easy ? [n, rand(1, n - 10)] : [n, rand(n - 9, 9)]; };
  if (type === 'add') { const [a, b] = addPair(); return add20('b20add', a, b, pick([`What is ${a} add ${b}?`, `Bonnie has ${a} bones. She digs up ${b} more. How many now?`])); }
  if (type === 'sub') { const [n, s] = subPair(); return sub20('b20sub', n, s, pick([`What is ${n} take away ${s}?`, `Bonnie buried ${n} bones. She eats ${s}. How many are left?`])); }
  if (type === 'miss') {
    if (easy) { const a = 10 + rand(1, 6); return miss20('b20miss', a, rand(a + 1, 19)); }
    const a = rand(5, 9); return miss20('b20miss', a, rand(11, a + 9));
  }
  // word problems, with carrots and the player's name
  if (Math.random() < .5) { const [n, s] = subPair(); return sub20('b20word', n, s, `${NAME()} has ${n} carrots. Bonnie eats ${s}. How many are left?`, 'carrot'); }
  const [a, b] = addPair();
  return add20('b20word', a, b, `${NAME()} picks ${a} carrots, then ${b} more. How many carrots now?`);
}

/* ---------- Level 3: Tens Facts ---------- */
function makeTens(type, easy) {
  const top = easy ? 5 : 10; // easy: totals up to 50
  if (type === 'tadd') {
    const x = rand(1, top - 1), y = rand(1, top - x), ans = 10 * (x + y);
    return gq({ t: 'tadd', prompt: `What is ${10 * x} add ${10 * y}?`, eq: [{ num: 10 * x }, '+', { num: 10 * y }, '=', { box: 0 }], answer: [ans],
      vis: burrow({ n: 10, a: x, b: y, ten: true }),
      clue: { say: `Use the bond ${x} + ${y}. Each bag is 10!`, point: 'visual' },
      steps: () => [
        { say: `${x} + ${y} = ?`, choices: near(x + y), answer: x + y },
        fillStep(`So ${x + y} tens is…`, ans, [x + y, ans + 10, ans - 10]),
      ] });
  }
  if (type === 'tsub') {
    const x = rand(2, top), y = rand(1, x - 1), ans = 10 * (x - y);
    return gq({ t: 'tsub', prompt: `What is ${10 * x} take away ${10 * y}?`, eq: [{ num: 10 * x }, '−', { num: 10 * y }, '=', { box: 0 }], answer: [ans],
      vis: burrow({ n: 10, a: x, ten: true, tap: 'take' }), tip: 'Tap a bag for Bonnie to eat it.',
      clue: { say: `Think ${x} − ${y} first.`, point: 'visual' },
      steps: q => [
        { say: `${x} − ${y} = ?`, choices: near(x - y), answer: x - y },
        withShow(fillStep(`So ${x - y} tens is…`, ans, [x - y, ans + 10, ans - 10].filter(v => v > 0)), () => eatLast(q.vis, y)),
      ] });
  }
  if (type === 'bond100') {
    const T = top, x = rand(1, T - 1), ans = 10 * (T - x);
    return gq({ t: 'bond100', prompt: `What goes with ${10 * x} to make ${10 * T}?`, eq: [{ num: 10 * x }, '+', { box: 0 }, '=', { num: 10 * T }], answer: [ans],
      vis: burrow({ n: T, a: x, ten: true, tap: 'fill' }), tip: 'Tap an empty burrow to drop in a bag of 10.',
      clue: { say: `What goes with ${x} to make ${T}?`, point: 'visual' },
      steps: q => [
        { say: 'Fill the burrows with bags of 10.', point: 'visual', action: () => burrowFull(q.vis), wait: 'Fill the burrows up there!' },
        { say: 'How many bags did you add?', choices: near(T - x), answer: T - x },
        fillStep(`${T - x} bags of 10 is…`, ans, [T - x, ans + 10, ans - 10].filter(v => v > 0)),
      ] });
  }
  // a little fact on the top line helps with the tens fact underneath
  const minus = Math.random() < .4;
  let x, y;
  if (minus) { x = easy ? 5 : 10; y = rand(1, x - 1); } else if (easy) { x = rand(1, 4); y = rand(1, 5 - x); } else { x = rand(1, 9); y = 10 - x; }
  const r = minus ? x - y : x + y, op = minus ? '−' : '+', ans = 10 * r;
  return gq({ t: 'derive', prompt: 'Use the little fact to help.', answer: [ans], show: false,
    vis: burrow({ n: 10, a: x, b: minus ? 0 : y, ten: true }),
    eq: [{ num: x }, op, { num: y }, '=', { num: r }, '\n', { num: 10 * x }, op, { num: 10 * y }, '=', { box: 0 }],
    clue: { say: 'The top line helps! Now they are tens.', point: 'line-0' },
    steps: () => [
      { say: `${x} tens ${minus ? 'take away' : 'and'} ${y} tens is how many tens?`, point: 'line-0', choices: near(r), answer: r },
      fillStep(`${r} tens is…`, ans, [r, ans + 10, ans - 10].filter(v => v > 0)),
    ] });
}

const LEVELS = [
  { name: 'Bonds to 10', blurb: 'Pairs that make 10', eg: '7 + 3 = 10',
    quest: 'Every burrow needs 10 bones. Fill them up!',
    seq: ['miss', 'take', 'pair', 'eaten', 'miss', 'take', 'pair', 'miss', 'take'],
    make(type, k, easy) {
      const T = easy ? pick([5, 6]) : 10, a = rand(1, T - 1);
      if (type === 'take') return bondTake('b10take', T, a, false);
      if (type === 'eaten') return bondTake('b10eaten', T, a, true);
      return bondFill('b10' + type, T, a, type === 'pair');
    } },
  { name: 'Bonds to 20', blurb: 'Facts to 20, through 10', eg: '8 + 5 = 13',
    quest: 'Two burrows side by side. Fill the first one to 10, then keep going!',
    seq: ['add', 'sub', 'add', 'word', 'miss', 'sub', 'add', 'word', 'sub'],
    make: (type, k, easy) => make20(type, easy) },
  { name: 'Tens Facts', blurb: 'Use a little fact for tens', eg: '30 + 70 = 100',
    quest: 'Big bags of 10 bones! Use your little facts to help.',
    seq: ['derive', 'tadd', 'tsub', 'bond100', 'tadd', 'derive', 'tsub', 'bond100', 'tadd'],
    make: (type, k, easy) => makeTens(type, easy) },
];

Meadow.registerWorld(M.world({
  id: 'y2-maths-number-bonds', name: 'Number Bonds Burrow', tag: 'Adding and taking away', icon: '🐰', color: '#A0673A', tint: '#F5EADF',
  intro: 'Help Bonnie dig up number facts in the rabbit burrows. A <b>number bond</b> is two numbers that make another, like 7 and 3 make 10. Tap the burrows to fill them up!',
  ids: ['bonds-10', 'bonds-20', 'tens-facts'],
  levels: LEVELS,
}));
})();
