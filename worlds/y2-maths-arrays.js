/*
 * Year 2 Maths, World 3: The Array Orchard (equal groups, arrays and the 2, 5 and 10 times tables).
 * Needs worlds/y2-maths-kit.js first. All the questions are the same as the old Meadow Maths.
 * Questions are made with gq() (in the kit) and carry their own clue and step card.
 */
(() => {
'use strict';
const M = window.MeadowMaths;
const { rand, pick, near, gq, fillStep, gridOk, WHO } = M;

const AO_LEVELS = [
  { name: 'Bone Groups', blurb: 'Equal groups and adding again', eg: '5 + 5 + 5 = 15',
    seq: ['add', 'add', 'groups', 'add', 'each', 'add', 'groups', 'add', 'each'],
    make(type, k, easy) {
      const g = rand(2, easy ? 3 : 5), n = easy ? pick([2, 5]) : pick([2, 3, 4, 5, 10]), p = g * n;
      const vis = { type: 'groups', g, n, box: 'plate', item: 'bone' };
      if (type === 'groups') return gq({ t: 'groups', prompt: 'How many plates?', eq: [{ box: 0 }, { text: 'groups of' }, { num: n }, '=', { num: p }], answer: [g], vis,
        clue: { say: 'Count the plates.', point: 'visual' },
        steps: () => [fillStep(`Each plate has ${n}. How many plates?`, g, near(g))] });
      if (type === 'each') return gq({ t: 'each', prompt: 'How many bones on each plate?', eq: [{ num: g }, { text: 'groups of' }, { box: 0 }, '=', { num: p }], answer: [n], vis,
        clue: { say: 'Count the bones on one plate.', point: 'visual' },
        steps: () => [fillStep('Look at one plate. How many bones?', n, near(n))] });
      const eq = []; for (let i = 0; i < g; i++) { if (i) eq.push('+'); eq.push({ num: n }); } eq.push('=', { box: 0 });
      return gq({ t: 'add', prompt: `${g} plates with ${n} bones on each. How many bones?`, eq, answer: [p], vis,
        clue: { say: `Count in ${n}s, once for each plate.`, point: 'visual' },
        steps: () => [
          { say: 'How many plates?', point: 'visual', choices: near(g), answer: g },
          { say: 'How many bones on each plate?', choices: near(n), answer: n },
          fillStep(`${g} lots of ${n} makes…`, p, [p - n, p + n, g + n]),
        ] });
    } },
  { name: 'Grid Builder', blurb: 'Build rows and columns', eg: '4 rows of 2',
    seq: ['build', 'count', 'build', 'build', 'count', 'build', 'count', 'build', 'build'],
    make(type, k, easy) {
      let r, c; do { r = rand(2, easy ? 3 : 5); c = rand(2, easy ? 5 : 10); } while (r === c);
      const p = r * c;
      if (type === 'count') return gq({ t: 'count', prompt: 'How many apples?', eq: [{ num: r }, '×', { num: c }, '=', { box: 0 }], answer: [p],
        vis: { type: 'array', r, c, item: 'apple', label: true },
        clue: { say: `Count in ${c}s, one row at a time.`, point: 'visual' },
        steps: () => [
          { say: 'How many rows?', point: 'visual', choices: near(r), answer: r },
          { say: 'How many apples in each row?', choices: near(c), answer: c },
          fillStep(`${r} rows of ${c} makes…`, p, [p - c, p + c, r + c]),
        ] });
      return gq({ t: 'build', kind: 'grid', prompt: `Make ${r} rows of ${c}.`, answer: [p], tip: 'Tap or drag across the squares to grow the orchard.',
        vis: { type: 'grid', r: 0, c: 0, tr: r, tc: c, item: 'apple' }, key: `build${r}x${c}`,
        clue: { say: `${r} rows going down, ${c} going across.`, point: 'visual' },
        steps: q => [
          { say: `How many rows going down?`, point: 'visual', choices: near(r), answer: r },
          { say: 'How many apples in each row?', choices: near(c), answer: c },
          { say: 'Tap the glowing square.', point: `cell-${r}-${c}`, action: () => gridOk(q.vis), wait: 'Tap the glowing square up there!' },
        ] });
    } },
  { name: 'The Swapping Tree', blurb: 'Turn it round: same answer', eg: '3 × 4 = 4 × 3',
    seq: ['swap', 'swapm', 'swap', 'swap', 'swapm', 'swap', 'swapm', 'swap', 'swap'],
    make(type, k, easy) {
      let a, b; do { a = rand(2, easy ? 3 : 5); b = rand(2, easy ? 5 : 10); } while (a === b);
      const p = a * b, vis = { type: 'array', r: a, c: b, item: 'apple', label: true, turn: true, turned: false };
      const turnStep = q => ({ say: 'Tap “Turn the tree”.', point: 'g-turn', action: () => q.vis.turned, wait: 'Tap the button up there!' });
      if (type === 'swapm') return gq({ t: 'swapm', prompt: 'Fill the gap.', answer: [a], vis,
        eq: [{ num: a }, '×', { num: b }, '=', { num: p }, '\n', { num: b }, '×', { box: 0 }, '=', { num: p }],
        clue: { say: 'Same numbers, just swapped round.', point: 'g-turn' },
        steps: q => [turnStep(q), fillStep(`${b} rows of how many?`, a, near(a))] });
      return gq({ t: 'swap', prompt: `Turn the tree! What is ${b} × ${a}?`, answer: [p], vis,
        eq: [{ num: a }, '×', { num: b }, '=', { num: p }, '\n', { num: b }, '×', { num: a }, '=', { box: 0 }],
        clue: { say: 'Turning the tree keeps every apple.', point: 'g-turn' },
        steps: q => [turnStep(q), { say: 'Did any apples fall off?', choices: ['Yes', 'No'], answer: 'No', words: true },
          fillStep(`So ${b} × ${a} is…`, p, [p - a, p + b, a + b])] });
    } },
  { name: 'Times Tables Harvest', blurb: 'The 2, 5 and 10 times tables', eg: '5 × 4 = 20',
    seq: ['fact', 'fact', 'miss', 'fact', 'fact', 'miss', 'fact', 'fact', 'miss'],
    make(type, k, easy) {
      const t = easy ? pick([10, 2]) : pick([2, 5, 10]), m = rand(easy ? 1 : 2, easy ? 5 : 10), p = t * m;
      const vis = { type: 'groups', g: m, n: t, box: 'basket', item: 'apple' };
      const counts = Array.from({ length: Math.min(m, 3) }, (_, i) => t * (i + 1)).join(', ');
      if (type === 'miss') return gq({ t: 'miss', prompt: 'Fill the gap.', eq: [{ num: t }, '×', { box: 0 }, '=', { num: p }], answer: [m], vis, show: false,
        clue: { say: `Count in ${t}s until you reach ${p}.`, point: 'visual' },
        steps: () => [fillStep(`Count in ${t}s: ${counts}… How many ${t}s make ${p}?`, m, near(m))] });
      const [x, y] = Math.random() < .5 ? [m, t] : [t, m];
      return gq({ t: 'fact', prompt: `Harvest time! What is ${x} × ${y}?`, eq: [{ num: x }, '×', { num: y }, '=', { box: 0 }], answer: [p], vis, show: false,
        clue: { say: `Count in ${t}s, ${m} times.`, point: 'visual' },
        steps: () => [
          { say: 'Which times table is it?', choices: ['2s', '5s', '10s'], answer: `${t}s`, words: true },
          fillStep(`Count in ${t}s: ${counts}… ${m} lots of ${t} makes…`, p, [p - t, p + t, m + t]),
        ] });
    } },
  { name: 'Word Problems', blurb: 'Groups in little stories', eg: '4 plates of 3 bones',
    seq: ['w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w'],
    make(type, k, easy) {
      const g = rand(2, easy ? 3 : 5), n = easy ? pick([2, 5, 10]) : pick([2, 3, 4, 5, 10]), p = g * n, N = WHO();
      const [story, box, it, word] = pick([
        [`${N} has ${g} plates with ${n} bones on each. How many bones altogether?`, 'plate', 'bone', 'bones'],
        [`Bonnie buries ${n} bones in each of ${g} holes. How many bones is that?`, 'plate', 'bone', 'bones'],
        [`There are ${g} trees with ${n} apples on each. How many apples?`, 'basket', 'apple', 'apples'],
        [`${N} puts ${n} apples in each of ${g} baskets. How many apples?`, 'basket', 'apple', 'apples'],
        [`Bonnie has ${g} bowls with ${n} treats in each. How many treats?`, 'bowl', 'bone', 'treats'],
        [`Can you help Bonnie count? ${N} has ${g} bags of ${n} bones.`, 'basket', 'bone', 'bones'],
      ]);
      return gq({ t: 'w', prompt: story, eq: [{ box: 0 }, { text: word }], answer: [p], vis: { type: 'groups', g, n, box, item: it }, show: false,
        clue: { say: 'How many groups? How many in each?', point: 'visual' },
        steps: () => [
          { say: 'How many groups are there?', point: 'visual', choices: near(g), answer: g },
          { say: 'How many in each group?', choices: near(n), answer: n },
          fillStep(`${g} groups of ${n} makes…`, p, [p - n, p + n, g + n]),
        ] });
    } },
];

const QUESTS = [
  "Bonnie is setting the picnic plates. Count her bones!",
  "Plant the orchard! Grow the right rows of apple trees.",
  "The wind is spinning the trees! Do the apples change?",
  "Harvest day! Pick apples in 2s, 5s and 10s.",
  "{N} and Bonnie have orchard puzzles to solve.",
];

Meadow.registerWorld(M.world({
  id: 'y2-maths-arrays', name: 'The Array Orchard', tag: 'Groups and times', icon: '🍎', color: '#C0463D', tint: '#F7E1DE',
  intro: 'In the orchard, apples grow in <b>equal groups</b> and <b>rows</b>. Count them in 2s, 5s and 10s.',
  ids: ['bone-groups', 'grid-builder', 'swapping-tree', 'times-tables-harvest', 'word-problems'],
  levels: AO_LEVELS.map((L, i) => ({ ...L, quest: QUESTS[i] })),
}));
})();
