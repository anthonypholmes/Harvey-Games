/*
 * Year 2 Maths: two more levels for The Sharing Pond, in their own file.
 *   Thirds Island:   a third of an amount, which shape is cut into thirds, what fraction is shaded
 *   Three Quarters:  three quarters of an amount and of a shape, and two quarters = a half
 * (Year 2: "find 1/3, 1/4, 2/4 and 3/4 of a shape or quantity; 2/4 is the same as 1/2".)
 *
 * This file shows the engine is modular: it adds levels to a world another file made, with
 * nothing else changed. Load it after worlds/y2-maths-sharing.js. The new levels come after
 * Inverse Check and unlock once it has a star.
 */
(() => {
'use strict';
const M = window.MeadowMaths;
const { rand, pick, shuffle, near, gq, fillStep, shareDone, shapeSVG, frac, SHAPES } = M;

// more ways to cut a shape: three equal strips, and two shapes cut into three parts that are NOT equal
Object.assign(SHAPES, {
  strip3: [[10, 10, 27, 80], [37, 10, 26, 80], [63, 10, 27, 80]],
  rect3bad: [[8, 25, 16, 50], [24, 25, 44, 50], [68, 25, 24, 50]],
  ci3bad: [0, 80, 230, 360],
});

const shareAct = (q, n) => ({ say: 'Tap “One each” until the pile is empty.', point: 'g-each', action: () => shareDone(q.vis), wait: 'Share them out up there!' });
const lily = n => Array(n).fill(0);

// "Which shape is …?": pick the shape that matches (the answer is its place in the list)
function shapeQ({ t, prompt, good, bad, clue, steps }) {
  const opts = shuffle([good, ...bad]), ans = opts.indexOf(good), cfmt = i => shapeSVG(opts[i][0], opts[i][1]);
  return gq({ t, kind: 'choice', prompt, answer: [ans], choices: [0, 1, 2], cfmt, key: t + JSON.stringify(opts),
    clue, steps: () => steps(cfmt, ans) });
}

const LEVELS = [
  { name: 'Thirds Island', blurb: 'Thirds of amounts and shapes', eg: 'A third of 9 is 3',
    quest: 'Three ducklings want a fair share of everything!',
    seq: ['tamount', 'tshape', 'tamount', 'tfrac', 'tamount', 'tshape', 'tfrac', 'tamount', 'tshape'],
    make(type, k, easy) {
      if (type === 'tshape') return shapeQ({ t: 'tshape', prompt: 'Which shape is cut into thirds?',
        good: [pick(['rect3', 'ci3', 'strip3']), 0],
        bad: easy ? [['rect2', 0], ['sq4', 0]] : [[pick(['rect3bad', 'ci3bad']), 0], [pick(['ci4', 'rect2', 'strip4']), 0]],
        clue: { say: 'Thirds are 3 pieces, all the same size.' },
        steps: (cfmt, ans) => [
          { say: 'How many pieces make thirds?', choices: [2, 3, 4], answer: 3 },
          { say: 'Which one has 3 pieces the same size?', choices: [0, 1, 2].map(cfmt), answer: cfmt(ans), final: true, words: true },
        ] });
      if (type === 'tfrac') {
        const [shape, d] = pick(easy ? [['ci3', 3], ['rect3', 3], ['rect2', 2]] : [['ci3', 3], ['rect3', 3], ['strip3', 3], ['ci2', 2], ['sq4', 4], ['ci4', 4]]);
        const labels = [frac(1, 2), frac(1, 3), frac(1, 4)], ans = [2, 3, 4].indexOf(d);
        return gq({ t: 'tfrac', kind: 'choice', prompt: 'What fraction is shaded?', answer: [ans], choices: [0, 1, 2], cfmt: i => labels[i],
          vis: { type: 'shape', shape, shade: 1 }, key: 'tfrac' + shape,
          clue: { say: 'Count all the pieces. One is shaded.', point: 'visual' },
          steps: () => [
            { say: 'How many equal pieces?', point: 'visual', choices: [2, 3, 4], answer: d },
            { say: `1 out of ${d} pieces is…`, choices: labels, answer: labels[ans], final: true, words: true },
          ] });
      }
      const e = rand(1, easy ? 3 : 6), N = 3 * e;
      return gq({ t: 'tamount', prompt: `What is a third of ${N}?`, eq: [{ text: `A third of` }, { num: N }, { text: 'is' }, { box: 0 }], answer: [e],
        vis: { type: 'share', N, bowls: lily(3), box: 'lily', item: 'bone' },
        clue: { say: 'Share them between the three lily pads.', point: 'g-each' },
        steps: q => [shareAct(q), fillStep('How many on each lily pad?', e, near(e))] });
    } },
  { name: 'Three Quarters', blurb: 'Three quarters, and two quarters make a half', eg: '¾ of 8 is 6',
    quest: 'Four frogs share the treats. Three of them are very hungry!',
    seq: ['qq', 'qqshape', 'qq', 'half', 'qq', 'qqshape', 'half', 'qq', 'qqshape'],
    make(type, k, easy) {
      if (type === 'qqshape') {
        const good = pick(['sq4', 'ci4', 'strip4']);
        return shapeQ({ t: 'qqshape', prompt: 'Which shape has three quarters shaded?',
          good: [good, 3],
          bad: easy ? [[good, 1], ['ci2', 1]] : [[pick(['sq4', 'ci4', 'strip4']), pick([1, 2])], [pick(['rect3', 'ci3']), 2]],
          clue: { say: 'Three quarters: 4 equal pieces, 3 of them shaded.' },
          steps: (cfmt, ans) => [
            { say: 'Three quarters. How many equal pieces?', choices: [2, 3, 4], answer: 4 },
            { say: 'And how many are shaded?', choices: [1, 2, 3], answer: 3 },
            { say: 'Which one has 3 out of 4 shaded?', choices: [0, 1, 2].map(cfmt), answer: cfmt(ans), final: true, words: true },
          ] });
      }
      if (type === 'half') { // two quarters is the same as a half
        const shape = pick(['sq4', 'ci4', 'strip4']), labels = shuffle([frac(1, 2), frac(1, 3), frac(3, 4)]), ans = labels.indexOf(frac(1, 2));
        return gq({ t: 'half24', kind: 'choice', prompt: 'Two quarters are shaded. Which fraction is the same as two quarters?', answer: [ans], choices: [0, 1, 2], cfmt: i => labels[i],
          vis: { type: 'shape', shape, shade: 2 }, key: 'half24' + shape,
          clue: { say: 'Look: is half of the shape shaded?', point: 'visual' },
          steps: () => [
            { say: 'How many equal pieces?', point: 'visual', choices: [2, 3, 4], answer: 4 },
            { say: 'How many are shaded?', choices: [1, 2, 3], answer: 2 },
            { say: '2 out of 4 is half the shape. So it’s…', choices: labels, answer: labels[ans], final: true, words: true },
          ] });
      }
      const e = rand(1, easy ? 2 : 5), N = 4 * e, p = 3 * e;
      return gq({ t: 'qq', prompt: `What is three quarters of ${N}?`, eq: [{ text: frac(3, 4) + ' of' }, { num: N }, { text: 'is' }, { box: 0 }], answer: [p],
        vis: { type: 'share', N, bowls: lily(4), box: 'lily', item: 'bone' },
        clue: { say: 'Share them between four lily pads. Then count three of them.', point: 'g-each' },
        steps: q => [
          shareAct(q),
          { say: 'How many on one lily pad?', choices: near(e), answer: e },
          fillStep(`Three lily pads with ${e} on each makes…`, p, [e, p - e, p + e, N]),
        ] });
    } },
];

M.addLevels('y2-maths-sharing', { ids: ['thirds', 'three-quarters'], levels: LEVELS });
})();
