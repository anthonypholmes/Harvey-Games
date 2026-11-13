/*
 * Year 2 Maths, World 4: The Sharing Pond (sharing, grouping, halves and quarters).
 * Needs worlds/y2-maths-kit.js first. All the questions are the same as the old Meadow Maths.
 * Questions are made with gq() (in the kit) and carry their own clue and step card.
 */
(() => {
'use strict';
const M = window.MeadowMaths;
const { rand, pick, shuffle, near, gq, fillStep, shareDone, shapeSVG, frac, WHO } = M;

const shareAct = q => ({ say: 'Tap “One each” until the pile is empty.', point: 'g-each', action: () => shareDone(q.vis), wait: 'Share them out up there!' });
const shareSteps = (q, ask, ans) => [shareAct(q), fillStep(ask, ans, near(ans))];
const SP_LEVELS = [
  { name: 'Equal Sharing', blurb: 'Share bones fairly between bowls', eg: '12 ÷ 3 = 4',
    seq: ['share', 'share', 'share', 'share', 'share', 'share', 'share', 'share', 'share'],
    make(type, k, easy) {
      const bowls = easy ? 2 : pick([2, 3, 4, 5, 10]), each = rand(2, easy ? 5 : bowls === 10 ? 3 : 5), N = bowls * each;
      const prompt = pick([`Share ${N} bones equally between ${bowls} bowls.`, `Can you help Bonnie share ${N} bones between ${bowls} bowls?`, `${WHO()} shares ${N} bones between ${bowls} bowls. How many in each?`]);
      return gq({ t: 'share', prompt, eq: [{ num: N }, '÷', { num: bowls }, '=', { box: 0 }, { text: 'each' }], answer: [each], tip: 'Tap a bowl to drop a bone in.',
        vis: { type: 'share', N, bowls: Array(bowls).fill(0), box: 'bowl', item: 'bone' },
        clue: { say: 'Give every bowl one, then again.', point: 'g-each' },
        steps: q => shareSteps(q, 'How many bones in each bowl?', each) });
    } },
  { name: 'Grouping', blurb: 'How many baskets of 2, 5 or 10?', eg: '20 ÷ 5 = 4',
    seq: ['group', 'group', 'group', 'group', 'group', 'group', 'group', 'group', 'group'],
    make(type, k, easy) {
      const s = easy ? pick([5, 10]) : pick([2, 5, 10]), m = rand(2, s === 10 ? 3 : easy ? 3 : 6), N = s * m;
      return gq({ t: 'group', prompt: `${N} bones. Put ${s} in each basket. How many baskets?`, eq: [{ num: N }, '÷', { num: s }, '=', { box: 0 }, { text: 'baskets' }], answer: [m],
        tip: 'Tap “Fill a basket”.', vis: { type: 'group', N, s, baskets: 0, box: 'basket', item: 'bone' },
        clue: { say: `Fill baskets of ${s} until none are left.`, point: 'g-fill' },
        steps: q => [
          { say: 'Tap “Fill a basket” until the pile is empty.', point: 'g-fill', action: () => q.vis.baskets * s === N, wait: 'Fill the baskets up there!' },
          fillStep('How many baskets?', m, near(m)),
        ] });
    } },
  { name: 'Half a Pond', blurb: 'Halves of amounts', eg: 'Half of 10 is 5',
    seq: ['half', 'half', 'halfsum', 'half', 'half', 'halfsum', 'half', 'half', 'halfsum'],
    make(type, k, easy) {
      const h = rand(easy ? 1 : 2, easy ? 5 : 10), N = 2 * h;
      const vis = { type: 'share', N, bowls: [0, 0], box: 'lily', item: 'bone' };
      const clue = { say: 'Share them between the two lily pads.', point: 'g-each' };
      if (type === 'halfsum') return gq({ t: 'halfsum', prompt: `Split ${N} into two equal halves.`, eq: [{ num: N }, '=', { box: 0 }, '+', { box: 1 }], answer: [h, h], vis, clue,
        steps: q => [shareAct(q), fillStep('How many on one lily pad?', h, near(h), 0), fillStep('And on the other one?', h, near(h), 1)] });
      return gq({ t: 'half', prompt: `What is half of ${N}?`, eq: [{ text: 'Half of' }, { num: N }, { text: 'is' }, { box: 0 }], answer: [h], vis, clue,
        steps: q => shareSteps(q, 'How many on each lily pad?', h) });
    } },
  { name: 'Quarter Splitting', blurb: 'Quarters of shapes and amounts', eg: 'A quarter of 12 is 3',
    seq: ['qamount', 'qshape', 'qamount', 'qfrac', 'qamount', 'qshape', 'qfrac', 'qamount', 'qshape'],
    make(type, k, easy) {
      if (type === 'qshape') {
        const good = pick(['sq4', 'ci4', 'strip4']);
        const bad = easy ? shuffle(['rect3', 'ci2', 'rect2']).slice(0, 2) : [good === 'ci4' ? 'ci4bad' : 'sq4bad', pick(['rect3', 'ci3'])];
        const opts = shuffle([good, ...bad]), ans = opts.indexOf(good), cfmt = i => shapeSVG(opts[i], 0);
        return gq({ t: 'qshape', kind: 'choice', prompt: 'Which shape is cut into quarters?', answer: [ans], choices: [0, 1, 2], cfmt, key: 'qshape' + opts.join(),
          vis: { type: 'shapes', list: opts },
          clue: { say: 'Quarters are 4 pieces, all the same size.' },
          steps: () => [
            { say: 'How many pieces make quarters?', choices: [2, 3, 4], answer: 4 },
            { say: 'Which one has 4 pieces the same size?', choices: [0, 1, 2].map(cfmt), answer: cfmt(ans), final: true, words: true },
          ] });
      }
      if (type === 'qfrac') {
        const [shape, d, sh] = pick(easy ? [['ci2', 2, 1], ['rect2', 2, 1], ['sq4', 4, 1]] : [['ci2', 2, 1], ['rect2', 2, 1], ['sq4', 4, 1], ['ci4', 4, 1], ['ci4', 4, 3], ['strip4', 4, 3], ['sq4', 4, 3]]);
        const labels = [frac(1, 2), frac(1, 4), frac(3, 4)], ans = labels.indexOf(frac(sh, d));
        return gq({ t: 'qfrac', kind: 'choice', prompt: 'What fraction is shaded?', answer: [ans], choices: [0, 1, 2], cfmt: i => labels[i],
          vis: { type: 'shape', shape, shade: sh }, key: `qfrac${shape}${sh}`,
          clue: { say: 'Count all the pieces. Then the shaded ones.', point: 'visual' },
          steps: () => [
            { say: 'How many equal pieces?', point: 'visual', choices: [2, 3, 4], answer: d },
            { say: 'How many are shaded?', choices: near(sh), answer: sh },
            { say: `${sh} out of ${d} pieces is…`, choices: labels, answer: labels[ans], final: true, words: true },
          ] });
      }
      const e = rand(1, easy ? 2 : 5), N = 4 * e;
      return gq({ t: 'qamount', prompt: `What is a quarter of ${N}?`, eq: [{ text: 'A quarter of' }, { num: N }, { text: 'is' }, { box: 0 }], answer: [e],
        vis: { type: 'share', N, bowls: [0, 0, 0, 0], box: 'lily', item: 'bone' },
        clue: { say: 'Share them between the four lily pads.', point: 'g-each' },
        steps: q => shareSteps(q, 'How many on each lily pad?', e) });
    } },
  { name: 'Inverse Check', blurb: 'Times and sharing are a team', eg: '3 × 4 = 12, so 12 ÷ 3 = 4',
    seq: ['m2d', 'm2d', 'd2m', 'm2d', 'd2m', 'm2d', 'm2d', 'd2m', 'm2d'],
    make(type, k, easy) {
      const t = easy ? pick([2, 10]) : pick([2, 5, 10, 3, 4]), m = rand(2, easy || t < 5 ? 5 : 10), p = t * m;
      const vis = { type: 'array', r: m, c: t, item: 'apple', label: true };
      const same = { say: 'Are the same three numbers in both lines?', choices: ['Yes', 'No'], answer: 'Yes', words: true };
      if (type === 'd2m') return gq({ t: 'd2m', prompt: 'Use the sharing fact to help.', answer: [p], vis, show: false,
        eq: [{ num: p }, '÷', { num: t }, '=', { num: m }, '\n', { num: m }, '×', { num: t }, '=', { box: 0 }],
        clue: { say: 'The same three numbers work both ways.', point: 'line-0' },
        steps: () => [same, fillStep(`${m} lots of ${t} makes…`, p, [p - t, p + t, m + t])] });
      return gq({ t: 'm2d', prompt: 'Use the times fact to help.', answer: [m], vis, show: false,
        eq: [{ num: m }, '×', { num: t }, '=', { num: p }, '\n', { num: p }, '÷', { num: t }, '=', { box: 0 }],
        clue: { say: 'The same three numbers work both ways.', point: 'line-0' },
        steps: () => [same, fillStep(`How many ${t}s make ${p}?`, m, near(m))] });
    } },
];

const QUESTS = [
  "The pond ducks are hungry. Share the treats fairly!",
  "Pack the picnic baskets for the pond party.",
  "Two lily pads, two frogs. Make it a fair half!",
  "Four frogs want equal shares of everything!",
  "Bonnie’s magic pond: times facts and sharing facts are twins.",
];

Meadow.registerWorld(M.world({
  id: 'y2-maths-sharing', name: 'The Sharing Pond', tag: 'Sharing and fractions', icon: '🦆', color: '#3F8B5C', tint: '#E4F2E7',
  intro: '<b>Sharing</b> means everyone gets the same. Drop bones into bowls until it is fair.',
  ids: ['equal-sharing', 'grouping', 'half-a-pond', 'quarter-splitting', 'inverse-check'],
  levels: SP_LEVELS.map((L, i) => ({ ...L, quest: QUESTS[i] })),
}));
})();
