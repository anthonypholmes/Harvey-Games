/*
 * Year 2 Maths: The Clock Tower (telling the time). The plan is in briefs/CLOCK_TOWER.md.
 * Needs worlds/y2-maths-kit.js first, which draws the clock face and runs Set the Clock.
 * Questions are made with gq() and carry their own clue and step card.
 * (Year 2: "tell and write the time to five minutes, including quarter past/to the hour and draw the hands on a
 *  clock face to show these times; know the number of minutes in an hour and the number of hours in a day;
 *  compare and sequence intervals of time".)
 * A time is minutes after 12 o'clock (195 is 3:15). Times are written and said in words ("quarter past 3",
 * "20 to 9"); digital times are Year 3, so they never appear.
 */
(() => {
'use strict';
const M = window.MeadowMaths;
const { rand, pick, shuffle, pick3, gq, fillStep, timeWords, minuteNum, hourOf, nextHour } = M;

const at = n => `at the ${n}`;
// the right time and two believable wrong ones, as three answer buttons
function timeChoice(t, wrong) {
  const right = timeWords(t), others = shuffle([...new Set(wrong)].filter(w => w !== right)).slice(0, 2);
  const labels = shuffle([right, ...others]);
  return { labels, ans: labels.indexOf(right), cfmt: i => labels[i] };
}
// the long hand's three likely places, for "Where is the long hand?"
const handChoices = n => shuffle([...new Set([n, ...shuffle([12, 6, 3, 9, n % 12 + 1, n - 1 || 12].filter(x => x !== n))].slice(0, 3))]).map(at);
// "Where is the short hand?": the hour and its neighbours
const hourChoices = h => pick3(h, [h - 1 || 12, nextHour(h), nextHour(nextHour(h))]);
function readQ({ t, kind, wrong, clue, steps, count }) {
  const { labels, ans, cfmt } = timeChoice(t, wrong);
  return gq({ t: kind, kind: 'choice', prompt: pick(['What time is it?', 'What’s the time?']), answer: [ans], choices: [0, 1, 2], cfmt, key: kind + t,
    vis: { type: 'clock', t, count: !!count, key: !count }, clue, // the hands' key on the first two levels (not with Count in 5s)
    steps: q => [...steps(q), { say: 'So the time is…', choices: labels, answer: labels[ans], final: true, words: true }] });
}

/* ---------- the help for reading a clock (Levels 1 and 2) ----------
   Three rungs, each about the clock on the screen now:
     the clue: RECOGNISE. Bonnie points at the long hand and says what it tells us. It never says where it points.
     the step card: INTERPRET where the long hand is ("at the 6 means half past"), then APPLY it: find the short
       hand (Bonnie points at it) and read the hour, then choose the time.
   A hand is pointed at with point: 'clk-min' or 'clk-hour' (an outline, the other hand faded, its key line boxed). */
const LONG_CLUE = { say: 'Find the long hand first. The long hand tells us the minutes.', point: 'clk-min' };
const longSteps = (num, means, others) => [
  { say: 'Where is the long hand pointing?', point: 'clk-min', choices: handChoices(num), answer: at(num), words: true },
  { say: `The long hand is at the ${num}. What does that mean?`, point: 'clk-min', choices: shuffle([means, ...others]), answer: means, words: true },
];
const shortStep = (h, words) => ({ say: `Now the short hand. It tells us the hour. ${words}`, point: 'clk-hour', choices: hourChoices(h), answer: h });

/* ---------- Level 1: O'Clock and Half Past ---------- */
const L1 = { name: 'O’Clock and Half Past', blurb: 'The long hand at 12 or at 6', eg: '4 o’clock · half past 7',
  seq: ['oclock', 'half', 'oclock', 'half', 'oclock', 'half', 'half', 'oclock', 'half'],
  make(type, k, easy) {
    const h = rand(1, 12);
    if (type === 'half' && !easy) {
      const t = h * 60 + 30;
      return readQ({ t, kind: 'half', wrong: [`${h} o’clock`, `half past ${h - 1 || 12}`, `${nextHour(h)} o’clock`, `half past ${nextHour(h)}`],
        clue: LONG_CLUE,
        steps: () => [...longSteps(6, 'half past', ['o’clock']), shortStep(h, 'It has just gone past which number?')] });
    }
    const t = h * 60;
    return readQ({ t, kind: 'oclock', wrong: [`half past ${h}`, `half past ${h - 1 || 12}`, h === 12 ? `6 o’clock` : `12 o’clock`, `${nextHour(h)} o’clock`],
      clue: LONG_CLUE,
      steps: () => [...longSteps(12, 'o’clock', ['half past']), shortStep(h, 'Which number is it pointing to?')] });
  } };

/* ---------- Level 2: Quarter Past and To ---------- */
const L2 = { name: 'Quarter Past and To', blurb: 'The long hand at 3 or at 9', eg: 'quarter past 3 · quarter to 9',
  seq: ['past', 'to', 'past', 'to', 'past', 'to', 'to', 'past', 'to'],
  make(type, k, easy) {
    const h = rand(1, 12), n = nextHour(h);
    if (type === 'to' && !easy) {
      const t = h * 60 + 45;
      return readQ({ t, kind: 'to', wrong: [`quarter past ${h}`, `quarter to ${h}`, `quarter past ${n}`, `half past ${h}`],
        clue: LONG_CLUE,
        steps: () => [...longSteps(9, 'quarter to', ['quarter past', 'half past']), shortStep(n, 'Which number is it nearly at?')] });
    }
    const t = h * 60 + 15;
    return readQ({ t, kind: 'past', wrong: [`quarter to ${h}`, `half past ${h}`, `quarter past ${n}`, `quarter to ${n}`],
      clue: LONG_CLUE,
      steps: () => [...longSteps(3, 'quarter past', ['quarter to', 'half past']), shortStep(h, 'It has just gone past which number?')] });
  } };

/* ---------- Level 3: Five-Minute Steps ---------- */
const countAct = q => ({ say: 'Tap “Count in 5s” to count round the clock.', point: 'clk-count', action: () => !!q.vis.counted, wait: 'Count round up there!' });
const L3 = { name: 'Five-Minute Steps', blurb: 'Count round the clock in 5s', eg: '20 past 2 · 25 to 7',
  seq: ['past5', 'to5', 'past5', 'past5', 'to5', 'past5', 'to5', 'past5', 'to5'],
  make(type, k, easy) {
    const h = rand(1, 12), n = nextHour(h);
    if (type === 'to5' && !easy) {
      const m = pick([35, 40, 50, 55]), t = h * 60 + m, to = 60 - m;
      return readQ({ t, kind: 'to5', count: true, wrong: [`${to} past ${h}`, `${m} to ${h}`, `${to} to ${h}`, `${to} past ${n}`],
        clue: { say: 'It’s past the 6, so count the minutes to the 12.', point: 'clk-count' },
        steps: q => [
          countAct(q),
          { say: 'So how many minutes to?', choices: pick3(to, [to + 5, to - 5, m, to / 5].filter(x => x > 0)), answer: to },
          { say: 'Which hour is the short hand nearly at?', point: 'clk-hour', choices: hourChoices(n), answer: n },
        ] });
    }
    const m = pick([5, 10, 20, 25]), t = h * 60 + m;
    return readQ({ t, kind: 'past5', count: true, wrong: [`${m} to ${h}`, `${m / 5} past ${h}`, `${m} past ${n}`, `${m} to ${n}`],
      clue: { say: 'Count round in 5s from the 12.', point: 'clk-count' },
      steps: q => [
        countAct(q),
        { say: 'So how many minutes past?', choices: pick3(m, [m + 5, m - 5, m / 5].filter(x => x > 0)), answer: m },
        { say: 'The short hand has just gone past which number?', point: 'clk-hour', choices: hourChoices(h), answer: h },
      ] });
  } };

/* ---------- Level 4: Set the Clock ---------- */
function setClue(t) {
  const m = t % 60, h = hourOf(t), n = nextHour(h);
  if (m === 0) return 'O’clock: the long hand points straight up to 12.';
  if (m === 30) return 'Half past: the long hand points down to 6.';
  if (m === 15) return 'Quarter past: the long hand is at the 3.';
  if (m === 45) return 'Quarter to: the long hand is at the 9.';
  return m < 30 ? `${m} past means ${m} minutes after ${h} o’clock.` : `${60 - m} to means ${60 - m} minutes before ${n} o’clock.`;
}
const L4 = { name: 'Set the Clock', blurb: 'Move the hands to show the time', eg: 'Show half past 5',
  seq: ['set', 'set', 'set', 'set', 'set', 'set', 'set', 'set', 'set'],
  make(type, k, easy) {
    const h = rand(1, 12), m = easy ? pick([0, 15, 30, 45]) : pick([0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55, 10, 20, 40, 50]);
    const target = (h * 60 + m) % 720;
    // the clock starts 10 to 45 minutes away, before or after, so he moves the long hand one way or the other
    // (and sees the short hand creep along with it)
    const v = { type: 'clock', t: target + pick([-1, 1]) * 5 * rand(easy ? 3 : 2, easy ? 6 : 9), target, set: true }, words = timeWords(target), num = minuteNum(target);
    const q = gq({ t: 'set', kind: 'clock', prompt: `Show ${words}.`, answer: [target], key: 'set' + target, vis: v,
      clue: { say: setClue(target), point: 'clock' },
      steps: q => [
        { say: 'Where does the long hand go?', point: 'clock', choices: handChoices(num), answer: at(num), words: true },
        { say: `Move the long hand to the ${num}.`, get point() { return M.clockDir(q.vis); }, action: () => M.clockOk(q.vis), wait: 'Move it up there!' },
      ] });
    q.inter = 'clock'; // a picture to play with, not a quick tap (so it isn't on Bonnie's Walk)
    return q;
  } };

/* ---------- Level 5: Minutes and Hours ---------- */
const L5 = { name: 'Minutes and Hours', blurb: '60 minutes in an hour, 24 hours in a day', eg: 'Half an hour is 30 minutes',
  seq: ['hour', 'half', 'day', 'quarter', 'hour', 'two', 'half', 'day', 'quarter'],
  make(type, k, easy) {
    if (easy && !['hour', 'half'].includes(type)) type = pick(['hour', 'half']);
    const mins = [{ box: 0 }, { text: 'minutes' }];
    if (type === 'day') return gq({ t: 'day', prompt: 'How many hours are in a day?', eq: [{ box: 0 }, { text: 'hours' }], answer: [24], key: 'day',
      clue: { say: 'The short hand goes round the clock twice every day.' },
      steps: () => [{ say: 'How many hours does the short hand go round once?', choices: [10, 12, 24], answer: 12 }, fillStep('12 and 12 more is…', 24, [22, 12, 36])] });
    if (type === 'two') return gq({ t: 'two', prompt: 'How many minutes are in 2 hours?', eq: mins, answer: [120], key: 'two',
      clue: { say: 'Each hour is 60 minutes.' },
      steps: () => [{ say: 'How many minutes are in one hour?', choices: [30, 60, 100], answer: 60 }, fillStep('60 and 60 more is…', 120, [100, 160, 66])] });
    if (type === 'half') return gq({ t: 'half', prompt: 'How many minutes is half an hour?', eq: mins, answer: [30], key: 'half',
      vis: { type: 'clock', t: 30, count: true }, show: false,
      clue: { say: 'Half past: the long hand has gone half way round.', point: 'clk-count' },
      steps: () => [fillStep('An hour is 60 minutes. What’s half of 60?', 30, [20, 6, 60])] });
    if (type === 'quarter') return gq({ t: 'quarter', prompt: 'How many minutes is a quarter of an hour?', eq: mins, answer: [15], key: 'quarter',
      vis: { type: 'clock', t: 15, count: true }, show: false,
      clue: { say: 'A quarter of an hour: the long hand goes from the 12 to the 3.', point: 'clk-count' },
      steps: q => [countAct(q), fillStep('So how many minutes is a quarter of an hour?', 15, [3, 10, 25])] });
    return gq({ t: 'hour', prompt: 'How many minutes are in an hour?', eq: mins, answer: [60], key: 'hour',
      vis: { type: 'clock', t: 0, count: true, full: true }, show: false,
      clue: { say: 'The long hand goes all the way round in one hour. Count round in 5s!', point: 'clk-count' },
      steps: q => [{ ...countAct(q), say: 'Tap “Count in 5s” to count all the way round.' }, fillStep('So how many minutes are in an hour?', 60, [12, 50, 100])] });
  } };

/* ---------- Level 6: How Long? ---------- */
const DOINGS = ['Bonnie’s walk', 'Bonnie’s nap', 'the picnic', 'Bonnie’s dig in the garden', 'bath time', 'the puppet show'];
const SPANS = [[60, '1 hour'], [30, 'half an hour'], [15, 'a quarter of an hour'], [120, '2 hours']];
const MINS = [10, 20, 25, 40, 45, 50, 90];
const L6 = { name: 'How Long?', blurb: 'The time between two clocks', eg: '2 o’clock to half past 2 is 30 minutes',
  seq: ['interval', 'longer', 'interval', 'interval', 'longer', 'interval', 'longer', 'interval', 'interval'],
  make(type, k, easy) {
    if (type === 'longer') {
      const [nv, nl] = easy ? pick(SPANS.slice(0, 2)) : pick(SPANS);
      const m = pick((easy ? [20, 40, 45, 50] : MINS).filter(x => x !== nv && Math.abs(x - nv) >= 5));
      const shorter = !easy && Math.random() < .35, labels = shuffle([nl, `${m} minutes`]);
      const right = (shorter ? nv < m : nv > m) ? nl : `${m} minutes`, ans = labels.indexOf(right);
      return gq({ t: 'longer', kind: 'choice', prompt: `Which ${shorter ? 'is shorter' : 'takes longer'}: ${labels[0]} or ${labels[1]}?`, answer: [ans], choices: [0, 1], cfmt: i => labels[i], key: `long${nv}/${m}${shorter}`,
        clue: { say: `How many minutes is ${nl}?` },
        steps: () => [{ say: `How many minutes is ${nl}?`, choices: pick3(nv, [nv + 10, nv - 10, nv / 2, nv * 2].filter(x => x > 0 && x !== m)), answer: nv },
          { say: `So which ${shorter ? 'is shorter' : 'takes longer'}?`, choices: labels, answer: right, final: true, words: true }] });
    }
    const d = easy ? pick([30, 60]) : pick([15, 30, 45, 60, 30, 120, 180]);
    const s = rand(1, 11) * 60 + (d % 60 ? pick([0, 15]) : pick([0, 30])), e = s + d, hours = d > 60;
    const what = pick(DOINGS);
    return gq({ t: hours ? 'hours' : 'minutes', prompt: `How long did ${what} take?` /* the clocks show when it started and finished (a shorter question keeps both clocks on a small phone) */, eq: [{ box: 0 }, { text: hours ? 'hours' : 'minutes' }], answer: [hours ? d / 60 : d], key: `int${s}+${d}`,
      vis: { type: 'clocks', list: [s, e], labels: ['Start', 'End'] },
      clue: { say: hours ? 'How many numbers did the short hand move on?' : 'How far did the long hand go round?', point: 'visual' },
      steps: () => hours ? [fillStep(`The short hand went from the ${hourOf(s)} to the ${hourOf(e)}. How many hours is that?`, d / 60, [d / 60 - 1, d / 60 + 1, d / 60 + 2].filter(x => x > 0))]
        : d === 60 ? [fillStep('The long hand went all the way round. How many minutes is that?', 60, [12, 30, 100])]
        : [{ say: `The long hand went from the ${minuteNum(s)} to the ${minuteNum(e)}. How many 5s is that?`, choices: pick3(d / 5, [d / 5 + 1, d / 5 - 1, d / 5 + 2].filter(x => x > 0)), answer: d / 5 },
           fillStep(`${d / 5} lots of 5 make…`, d, [d - 5, d + 5, d / 5].filter(x => x > 0 && x !== d))] });
  } };

/* ---------- Level 7: Before and After ---------- */
const L7 = { name: 'Before and After', blurb: 'Later, earlier, and Bonnie’s day in order', eg: 'Quarter past 3 + 30 minutes = quarter to 4',
  seq: ['later', 'order', 'later', 'later', 'order', 'later', 'later', 'order', 'later'],
  make(type, k, easy) {
    if (type === 'order') {
      const ask = pick(easy ? ['first', 'last'] : ['first', 'last', 'after']);
      let opts, right, prompt;
      if (ask === 'after') {
        const x = pick(M.DAY_ORDER.slice(0, 3)); right = M.DAY_ORDER[M.DAY_ORDER.indexOf(x) + 1];
        opts = shuffle([right, ...shuffle(M.DAY_ORDER.filter(d => d !== x && d !== right)).slice(0, 2)]);
        prompt = `What does Bonnie do after ${M.dayName(x)}?`;
      } else {
        opts = shuffle(shuffle(M.DAY_ORDER).slice(0, 3));
        const inOrder = M.DAY_ORDER.filter(d => opts.includes(d)); right = ask === 'first' ? inOrder[0] : inOrder[2];
        prompt = ask === 'first' ? 'Which of these comes first in Bonnie’s day?' : 'Which of these comes last in Bonnie’s day?';
      }
      const ans = opts.indexOf(right), cfmt = i => M.dayCard(opts[i]), other = pick(opts.filter(d => d !== right));
      const early = M.DAY_ORDER.indexOf(right) < M.DAY_ORDER.indexOf(other) ? right : other;
      return gq({ t: 'order' + ask, kind: 'choice', prompt, answer: [ans], choices: [0, 1, 2], cfmt, key: 'order' + ask + opts.join(),
        clue: { say: 'Think about Bonnie’s day: the morning, then the afternoon, then the night.' },
        steps: () => [{ say: `Which comes first in the day: ${M.dayName(right)} or ${M.dayName(other)}?`, choices: shuffle([M.dayName(right), M.dayName(other)]), answer: M.dayName(early), words: true },
          { say: 'So which one is it?', choices: opts.map(M.dayCard), answer: cfmt(ans), final: true, words: true }] });
    }
    const t = rand(1, 12) * 60 + pick([0, 15, 30, 45]), d = easy ? 60 : pick([15, 30, 60, 30]), dir = easy || Math.random() < .65 ? 1 : -1;
    const target = t + dir * d, dw = d === 60 ? 'an hour' : `${d} minutes`;
    const { labels, ans, cfmt } = timeChoice(target, [timeWords(target + 60), timeWords(target - 60), timeWords(t - dir * d), timeWords(target + 15 * dir)]);
    const q = gq({ t: dir > 0 ? 'later' : 'earlier', kind: 'choice', prompt: dir > 0 ? `It’s ${timeWords(t)}. What time will it be in ${dw}?` : `It’s ${timeWords(t)}. What time was it ${dw} ago?`,
      answer: [ans], choices: [0, 1, 2], cfmt, key: `lat${t}${dir * d}`,
      vis: { type: 'clock', t, target, set: true, small: true },
      clue: { say: `${d === 60 ? 'An hour' : `${d} minutes`} moves the long hand ${d === 60 ? 'all the way' : d === 30 ? 'half way' : 'a quarter of the way'} round. Try it with the buttons!`, point: dir > 0 ? 'clk-plus' : 'clk-minus' },
      steps: q => [{ say: `Move the long hand ${dir > 0 ? 'on' : 'back'} ${dw}.`, get point() { return M.clockDir(q.vis); }, action: () => M.clockOk(q.vis), wait: 'Move it up there!' },
        { say: 'What time does the clock say now?', choices: labels, answer: labels[ans], final: true, words: true }] });
    return q; // a tap answer, so it can be on Bonnie's Walk once it has a star (the clock's buttons are only there to help)
  } };

const QUESTS = [
  'The big clock is chiming! What time does it say?',
  'The pigeons are waiting for a quarter past. Can you read the clock?',
  'Count round in 5s with the clock tower pigeons.',
  'The clock has stopped! Help Bonnie set it right.',
  'Tick, tock! How long is an hour, and a day?',
  'How long did Bonnie’s adventures take?',
  'What time will it be? Bonnie has a busy day!',
];

Meadow.registerWorld(M.world({
  id: 'y2-maths-time', name: 'The Clock Tower', tag: 'Telling the time', icon: '🕰️', color: '#7A5A9E', tint: '#EEE7F6',
  intro: 'The <b>long hand</b> shows the minutes and the <b>short hand</b> shows the hour.',
  ids: ['oclock-half', 'quarters', 'five-minutes', 'set-clock', 'minutes-hours', 'how-long', 'later'],
  levels: [L1, L2, L3, L4, L5, L6, L7].map((L, i) => ({ ...L, quest: QUESTS[i] })),
}));
})();
