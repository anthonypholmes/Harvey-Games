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
const { rand, pick, near, gq, fillStep, burrow, burrowCount, burrowFull, countsOf, NAME } = M;

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

/* ---------- Levels 4 and 5: place value blocks (the tens rods and ones cubes from the Partitioning Park) ---------- */
// a question that shows n as blocks; the step card can change the blocks as it goes
function blocksQ(o, n) {
  const q = gq(o);
  q.mode = 'blocks'; q.places = [1, 0]; q.counts = countsOf(n);
  return q;
}
function setBlocks(q, tens, ones) { q.counts[1] = tens; q.counts[0] = ones; M.redraw(); }
const tensNear = T => [T - 10, T, T + 10].filter(v => v > 0);
const tensOf = n => Math.floor(n / 10);

/* Level 4: a 2-digit number add or take away ones, or tens */
function addOnesQ(a, b, prompt) {
  const ans = a + b, t = tensOf(a), o = a % 10, eq = [{ num: a }, '+', { num: b }, '=', { box: 0 }];
  if (o + b < 10) return blocksQ({ t: 'ot-addones', prompt, eq, answer: [ans],
    clue: { say: `Only the ones change. Count on ${b} from ${a}.`, point: 'place-0' },
    steps: () => [
      { say: `How many ones in ${a}?`, point: 'place-0', choices: near(o), answer: o },
      { say: `${o} + ${b} = ?`, choices: near(o + b), answer: o + b, fill: { count: 0 } },
      fillStep(`So ${a} + ${b} is…`, ans, [ans - 1, ans + 1, ans + 10, o + b]),
    ] }, a);
  const next = (t + 1) * 10, need = next - a, rest = b - need;
  return blocksQ({ t: 'ot-addones', prompt, eq, answer: [ans],
    clue: { say: `Jump to ${next} first.`, point: 'place-0' },
    steps: q => [
      { say: `How many more to make ${next}?`, point: 'place-0', choices: near(need), answer: need },
      withShow({ say: `How many are left of the ${b}?`, choices: near(rest), answer: rest }, () => setBlocks(q, t + 1, 0)),
      withShow(fillStep(`${next} and ${rest} is…`, ans, [ans - 1, ans + 1, ans - 10, a + rest]), () => setBlocks(q, t + 1, rest)),
    ] }, a);
}
function addTensQ(a, b, prompt) {
  const ans = a + b, t = tensOf(a), k = b / 10;
  return blocksQ({ t: 'ot-addtens', prompt, eq: [{ num: a }, '+', { num: b }, '=', { box: 0 }], answer: [ans],
    clue: { say: `Only the tens change! Add ${k} ten${k > 1 ? 's' : ''}.`, point: 'place-1' },
    steps: () => [
      { say: `How many tens in ${a}?`, point: 'place-1', choices: near(t), answer: t },
      { say: `${t} tens add ${k} ten${k > 1 ? 's' : ''} is how many tens?`, choices: near(t + k), answer: t + k, fill: { count: 1 } },
      fillStep(`So ${a} + ${b} is…`, ans, [ans - 10, ans + 10, a + k, ans + 1]),
    ] }, a);
}
function subTensQ(a, b, prompt) {
  const ans = a - b, t = tensOf(a), k = b / 10;
  return blocksQ({ t: 'ot-subtens', prompt, eq: [{ num: a }, '−', { num: b }, '=', { box: 0 }], answer: [ans],
    clue: { say: `Only the tens change! Take away ${k} ten${k > 1 ? 's' : ''}.`, point: 'place-1' },
    steps: () => [
      { say: `How many tens in ${a}?`, point: 'place-1', choices: near(t), answer: t },
      { say: `${t} tens take away ${k} ten${k > 1 ? 's' : ''} is how many tens?`, choices: near(t - k), answer: t - k, fill: { count: 1 } },
      fillStep(`So ${a} − ${b} is…`, ans, [ans - 10, ans + 10, a - k, ans + 1]),
    ] }, a);
}
function subOnesQ(a, b, prompt) {
  const ans = a - b, t = tensOf(a), o = a % 10, eq = [{ num: a }, '−', { num: b }, '=', { box: 0 }];
  if (b <= o) return blocksQ({ t: 'ot-subones', prompt, eq, answer: [ans],
    clue: { say: `Only the ones change. Take ${b} from the ones.`, point: 'place-0' },
    steps: () => [
      { say: `How many ones in ${a}?`, point: 'place-0', choices: near(o), answer: o },
      { say: `${o} take away ${b} = ?`, choices: near(o - b), answer: o - b, fill: { count: 0 } },
      fillStep(`So ${a} − ${b} is…`, ans, [ans - 1, ans + 1, ans - 10, ans + 10].filter(v => v > 0)),
    ] }, a);
  const down = t * 10, more = b - o;
  return blocksQ({ t: 'ot-subones', prompt, eq, answer: [ans],
    clue: { say: `Jump back to ${down} first.`, point: 'place-0' },
    steps: q => [
      { say: `${a} take away ${o} is?`, point: 'place-0', choices: tensNear(down), answer: down },
      withShow({ say: `That’s ${o} gone. How many more to take away?`, choices: near(more), answer: more }, () => setBlocks(q, t, 0)),
      withShow(fillStep(`${down} take away ${more} is…`, ans, [ans - 1, ans + 1, ans + 10, down + more]), () => setBlocks(q, t - 1, 10 - more)),
    ] }, a);
}
function makeOnesTens(type, easy) {
  const story = Math.random() < .5;
  if (type === 'word') type = pick(['addTens', 'subOnes', 'addOnes']);
  if (type === 'addTens' || type === 'subTens') {
    const add = type === 'addTens', t = add ? rand(1, 7) : rand(2, 9), a = t * 10 + rand(1, 9);
    const k = add ? rand(1, easy ? Math.min(2, 9 - t) : 9 - t) : rand(1, easy ? Math.min(2, t - 1) : t - 1), b = 10 * k;
    return add ? addTensQ(a, b, story ? `${NAME()} has ${a} bones. Bonnie brings ${b} more. How many now?` : `What is ${a} add ${b}?`)
      : subTensQ(a, b, story ? `There are ${a} carrots. The rabbits eat ${b}. How many are left?` : `What is ${a} take away ${b}?`);
  }
  const cross = !easy && Math.random() < .6, t = rand(type === 'subOnes' ? 2 : 1, 8);
  if (type === 'addOnes') {
    const o = rand(cross ? 2 : 1, cross ? 9 : 7), a = t * 10 + o, b = cross ? rand(10 - o, 9) : rand(1, 9 - o);
    return addOnesQ(a, b, story ? `Bonnie has ${a} bones. She digs up ${b} more. How many now?` : `What is ${a} add ${b}?`);
  }
  const o = cross ? rand(1, 7) : rand(2, 9), a = t * 10 + o, b = cross ? rand(o + 1, 9) : rand(1, o);
  return subOnesQ(a, b, story ? `${NAME()} has ${a} carrots. Bonnie eats ${b}. How many are left?` : `What is ${a} take away ${b}?`);
}

/* Level 5: 2-digit add or take away 2-digit: tens first, then ones */
function twoAddQ(a, b, prompt) {
  const ta = tensOf(a), oa = a % 10, tb = tensOf(b), ob = b % 10, T = 10 * (ta + tb), O = oa + ob, ans = a + b;
  return blocksQ({ t: 'td-add', prompt, eq: [{ num: a }, '+', { num: b }, '=', { box: 0 }], answer: [ans],
    clue: { say: 'Tens first, then ones.', point: 'place-1' },
    steps: q => [
      { say: `Tens first: ${10 * ta} + ${10 * tb} = ?`, point: 'place-1', choices: tensNear(T), answer: T },
      withShow({ say: `Now the ones: ${oa} + ${ob} = ?`, point: 'place-0', choices: near(O), answer: O }, () => setBlocks(q, ta + tb, oa)),
      withShow(fillStep(`${T} and ${O} is…`, ans, [ans - 10, ans + 10, ans - 1, T + O % 10].filter(v => v !== ans)), () => setBlocks(q, ta + tb, O)),
    ] }, a);
}
function twoSubQ(a, b, prompt) {
  const ta = tensOf(a), oa = a % 10, tb = tensOf(b), ob = b % 10, mid = a - 10 * tb, ans = a - b;
  const eq = [{ num: a }, '−', { num: b }, '=', { box: 0 }];
  const first = { say: `Jump back the tens: ${a} − ${10 * tb} = ?`, point: 'place-1', choices: tensNear(mid), answer: mid };
  if (ob <= oa) return blocksQ({ t: 'td-sub', prompt, eq, answer: [ans],
    clue: { say: `Jump back ${tb} ten${tb > 1 ? 's' : ''}, then ${ob} one${ob > 1 ? 's' : ''}.`, point: 'place-1' },
    steps: q => [first,
      withShow(fillStep(`Now the ones: ${mid} − ${ob} is…`, ans, [ans - 1, ans + 1, ans + 10, ans - 10].filter(v => v > 0)), () => setBlocks(q, ta - tb, oa)),
    ] }, a);
  const down = mid - oa, more = ob - oa;
  return blocksQ({ t: 'td-sub', prompt, eq, answer: [ans],
    clue: { say: `Jump back the tens. Then jump back to ${down} on the way.`, point: 'place-1' },
    steps: q => [first,
      withShow({ say: `${mid} − ${oa} = ?`, choices: tensNear(down), answer: down }, () => setBlocks(q, ta - tb, oa)),
      withShow(fillStep(`${down} − ${more} is…`, ans, [ans - 1, ans + 1, ans + 10, down + more]), () => setBlocks(q, ta - tb, 0)),
    ] }, a);
}
function makeTwoDigit(type, easy) {
  const story = type === 'word';
  if (story) type = pick(['add', 'sub']);
  const swap = !easy && Math.random() < .5; // exchanging: the ones add to 10 or more, or there aren't enough ones
  if (type === 'add') {
    const ta = rand(1, swap ? 7 : 8), tb = rand(1, (swap ? 8 : 9) - ta);
    const oa = rand(swap ? 2 : 1, swap ? 9 : 8), ob = swap ? rand(10 - oa, 9) : rand(1, 9 - oa);
    const a = 10 * ta + oa, b = 10 * tb + ob;
    return twoAddQ(a, b, story ? `Bonnie buried ${a} bones on Monday and ${b} on Tuesday. How many altogether?` : `What is ${a} add ${b}?`);
  }
  const ta = rand(swap ? 3 : 2, 9), tb = rand(1, ta - (swap ? 2 : 1));
  const oa = swap ? rand(1, 8) : rand(1, 9), ob = swap ? rand(oa + 1, 9) : rand(1, oa);
  const a = 10 * ta + oa, b = 10 * tb + ob;
  return twoSubQ(a, b, story ? `${NAME()} picked ${a} carrots. The rabbits ate ${b}. How many are left?` : `What is ${a} take away ${b}?`);
}

/* ---------- Level 6: three numbers, spotting a bond to 10 ---------- */
function makeThree(type, easy) {
  const story = type === 'word';
  if (easy) { // totals up to 10: add the first two, then the last
    const a = rand(1, 4), b = rand(1, 8 - a), c = rand(1, 10 - a - b), ab = a + b, ans = ab + c;
    return gq({ t: 'three', prompt: story ? `Bonnie finds ${a} bones, then ${b}, then ${c}. How many altogether?` : `What is ${a} + ${b} + ${c}?`,
      eq: [{ num: a }, '+', { num: b }, '+', { num: c }, '=', { box: 0 }], answer: [ans], show: false,
      vis: burrow({ n: 10, a, b, c }),
      clue: { say: 'Add the first two. Then add the last one.', point: 'line-0' },
      steps: () => [
        { say: `${a} + ${b} = ?`, choices: near(ab), answer: ab },
        fillStep(`${ab} + ${c} is…`, ans, [ans - 1, ans + 1, ab, ans + 2]),
      ] });
  }
  const x = rand(1, 9), y = 10 - x;
  let z; do z = rand(1, 9); while (z === x || z === y);
  const order = pick([[x, y, z], [x, z, y], [z, x, y]]), ans = 10 + z;
  const pairs = [[0, 1], [0, 2], [1, 2]].map(([i, j]) => `${order[i]} + ${order[j]}`);
  const bond = pairs[[[0, 1], [0, 2], [1, 2]].findIndex(([i, j]) => order[i] + order[j] === 10)];
  const [p, q2, r] = order;
  return gq({ t: 'three', prompt: story ? `Bonnie finds ${p} bones, then ${q2}, then ${r}. How many altogether?` : `What is ${p} + ${q2} + ${r}?`,
    eq: [{ num: p }, '+', { num: q2 }, '+', { num: r }, '=', { box: 0 }], answer: [ans], show: false,
    // the bond to 10 fills the first burrow; the last number goes in the second one
    vis: burrow({ n: 20, a: x, b: y, c: z }),
    clue: { say: 'Spot two numbers that make 10!', point: 'line-0' },
    steps: () => [
      { say: 'Which two make 10?', point: 'line-0', choices: [...new Set(pairs)], answer: bond, words: true },
      fillStep(`10 add ${z} is…`, ans, [ans - 1, ans + 1, z, ans + 10]),
    ] });
}

/* ---------- Level 7: fact families, missing numbers and "any order?" ---------- */
function makeFamily(type, easy) {
  // r + s = n: within 10 when easy, otherwise totals from 11 to 18
  let r, s;
  do { r = rand(easy ? 1 : 2, 9); s = rand(easy ? 1 : 2, 9); } while (easy ? r + s > 10 : r + s < 11);
  const n = r + s;
  const undo = { say: 'What undoes taking away?', choices: ['Adding', 'Taking away'], answer: 'Adding', words: true };
  if (type === 'missStart' || type === 'word') return gq({ t: 'ff-start',
    prompt: type === 'word' ? `Bonnie had some bones. She ate ${s} and has ${r} left. How many did she have at the start?` : `What number take away ${s} leaves ${r}?`,
    eq: [{ box: 0 }, '−', { num: s }, '=', { num: r }], answer: [n],
    clue: { say: 'Adding undoes taking away!', point: 'line-0' },
    steps: () => [undo, fillStep(`${r} + ${s} = ?`, n, [n - 1, n + 1, r - s].filter(v => v > 0))] });
  if (type === 'missMid') {
    const sums = [`${r} + ? = ${n}`, `${n} + ${r} = ?`];
    return gq({ t: 'ff-mid', prompt: `${n} take away what leaves ${r}?`, eq: [{ num: n }, '−', { box: 0 }, '=', { num: r }], answer: [s],
      clue: { say: `What goes with ${r} to make ${n}?`, point: 'line-0' },
      steps: () => [
        { say: 'Adding undoes taking away. Which one helps?', choices: pick([sums, sums.slice().reverse()]), answer: sums[0], words: true },
        fillStep(`${r} + ? = ${n}`, s, near(s)),
      ] });
  }
  if (type === 'inverse') {
    const same = { say: 'Are the same three numbers in both lines?', point: 'line-0', choices: ['Yes', 'No'], answer: 'Yes', words: true };
    if (Math.random() < .5) return gq({ t: 'ff-inv', prompt: 'Use the adding fact to help.', answer: [r],
      eq: [{ num: r }, '+', { num: s }, '=', { num: n }, '\n', { num: n }, '−', { num: s }, '=', { box: 0 }],
      clue: { say: 'The same three numbers work both ways.', point: 'line-0' },
      steps: () => [same, fillStep(`${n} take away ${s} leaves…`, r, [r - 1, r + 1, s, n + s].filter(v => v > 0 && v !== r))] });
    return gq({ t: 'ff-inv', prompt: 'Use the take away fact to help.', answer: [n],
      eq: [{ num: n }, '−', { num: s }, '=', { num: r }, '\n', { num: r }, '+', { num: s }, '=', { box: 0 }],
      clue: { say: 'The same three numbers work both ways.', point: 'line-0' },
      steps: () => [same, fillStep(`${r} and ${s} make…`, n, [n - 1, n + 1, r, s].filter(v => v !== n))] });
  }
  // true or false: can you swap the numbers round?
  const plus = Math.random() < .5, a = Math.max(r, s) === Math.min(r, s) ? Math.max(r, s) + 1 : Math.max(r, s), b = Math.min(r, s);
  const op = plus ? '+' : '−', ans = plus ? 0 : 1, TF = ['True', 'False'];
  return gq({ t: 'ff-tf', kind: 'choice', prompt: 'True or false?', answer: [ans], choices: [0, 1], cfmt: i => TF[i], key: `tf${a}${op}${b}`,
    eq: [{ num: a }, op, { num: b }, '=', { num: b }, op, { num: a }],
    clue: { say: plus ? 'Does adding work in any order?' : 'Does taking away work in any order?', point: 'line-0' },
    steps: () => plus ? [
      { say: `${a} + ${b} = ?`, choices: near(a + b), answer: a + b },
      { say: `${b} + ${a} = ?`, choices: near(a + b), answer: a + b },
      { say: 'Same answer both ways! So it is…', choices: TF, answer: 'True', words: true, final: true },
    ] : [
      { say: `${a} − ${b} = ?`, choices: near(a - b), answer: a - b },
      { say: `Can you take ${a} away from ${b}?`, choices: ['Yes', 'No'], answer: 'No', words: true },
      { say: 'So it is…', choices: TF, answer: 'False', words: true, final: true },
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
  { name: 'Ones and Tens', blurb: 'Add and take away ones or tens', eg: '46 + 30 = 76',
    quest: 'Bonnie is counting her big bone stash. Tens rods and ones cubes!',
    seq: ['addOnes', 'addTens', 'subTens', 'subOnes', 'word', 'addOnes', 'subTens', 'addTens', 'subOnes'],
    make: (type, k, easy) => makeOnesTens(type, easy) },
  { name: 'Two-Digit Diggers', blurb: 'Two 2-digit numbers', eg: '34 + 25 = 59',
    quest: 'The rabbits dig two big piles. Tens first, then ones!',
    seq: ['add', 'sub', 'add', 'word', 'sub', 'add', 'sub', 'word', 'add'],
    make: (type, k, easy) => makeTwoDigit(type, easy) },
  { name: 'Three Little Numbers', blurb: 'Add three numbers', eg: '4 + 6 + 3 = 13',
    quest: 'Three little rabbits bring treats. Find a 10 first!',
    seq: ['three', 'three', 'word', 'three', 'three', 'word', 'three', 'three', 'three'],
    make: (type, k, easy) => makeThree(type, easy) },
  { name: 'Fact Families', blurb: 'Missing numbers and any order?', eg: '? − 8 = 7',
    quest: 'Number families live together in one burrow. Use one fact to find another!',
    seq: ['missStart', 'inverse', 'tf', 'missMid', 'word', 'inverse', 'tf', 'missStart', 'tf'],
    make: (type, k, easy) => makeFamily(type, easy) },
];

// Bonnie's lines in this world that never change, so they can be recorded in her voice
// (tools/make-voice.mjs). Lines with numbers in them use the iPad's voice. Keep these word for word
// the same as the clues and steps above, or the recording won't be found.
const VOICE_LINES = [
  // clues
  'Fill the empty burrows. Count how many you add!', 'Fill the first burrow to 10 first!',
  'The first burrow is full: that’s 10. Add the ones!', 'The tens are the same. Look at the ones!',
  'The top line helps! Now they are tens.', 'Tens first, then ones.', 'Spot two numbers that make 10!',
  'Add the first two. Then add the last one.', 'Adding undoes taking away!', 'The same three numbers work both ways.',
  'Does adding work in any order?', 'Does taking away work in any order?',
  // step cards
  'Tap the empty burrows to fill them up.', 'How many bones did you add?', 'How many bones are left?', 'How many did Bonnie eat?',
  'How many more to make 10?', 'Fill the burrows with bags of 10.', 'How many bags did you add?', 'Which two make 10?',
  'What undoes taking away?', 'Adding undoes taking away. Which one helps?', 'Are the same three numbers in both lines?',
  'Same answer both ways! So it is…', 'So it is…',
  // questions with no numbers in them
  'True or false?', 'Use the little fact to help.', 'Use the adding fact to help.', 'Use the take away fact to help.',
];

Meadow.registerWorld(M.world({
  id: 'y2-maths-number-bonds', name: 'Number Bonds Burrow', tag: 'Adding and taking away', icon: '🐰', color: '#A0673A', tint: '#F5EADF',
  intro: 'Help Bonnie dig up number facts in the rabbit burrows. A <b>number bond</b> is two numbers that make another, like 7 and 3 make 10. Tap the burrows to fill them up!',
  ids: ['bonds-10', 'bonds-20', 'tens-facts', 'add-ones-tens', 'two-digit', 'three-numbers', 'fact-families'],
  levels: LEVELS,
  lines: () => VOICE_LINES,
}));
})();
