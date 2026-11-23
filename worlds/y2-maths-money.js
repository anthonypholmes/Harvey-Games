/*
 * Year 2 Maths: Harbour Market (money). The plan is in briefs/HARBOUR_MARKET.md.
 * Needs worlds/y2-maths-kit.js first, which draws the coins, notes, Bonnie's purse and the price boards.
 * Questions are made with gq() and carry their own clue and step card.
 * (Year 2: "recognise and use symbols for pounds (£) and pence (p); combine amounts to make a particular value;
 *  find different combinations of coins that equal the same amounts of money; solve simple problems in a
 *  practical context involving addition and subtraction of money of the same unit, including giving change".)
 * Amounts are whole pence (35 = 35p, 250 = £2.50) and always shown with p or £, never bones, so the game's own
 * bones never get mixed up with money. Word problems use the story characters (WHO), never the player's name.
 */
(() => {
'use strict';
const M = window.MeadowMaths;
const { rand, pick, shuffle, near, pick3, gq, fillStep, WHO, money, moneyName, metalWord, coinSVG, coinChoices, greedyCoins, coinPlan, purseSteps, sameCoins } = M;

const EASY_COINS = [1, 2, 5, 10];
const ALL_COINS = [1, 2, 5, 10, 20, 50, 100, 200];
// what tells each coin apart, for the clues
const LOOKS = {
  1: 'It’s a small copper coin.',
  2: 'It’s a big copper coin.',
  5: 'It’s the smallest silver coin.',
  10: 'It’s a big round silver coin.',
  20: 'Look at its shape. It has 7 straight sides.',
  50: 'It’s the big silver coin with 7 sides.',
  100: 'The £1 coin is gold and has 12 sides.',
  200: 'It’s gold on the outside and silver in the middle.',
  500: 'The £5 note is blue-green.',
  1000: 'The £10 note is orange.',
};
// a coin (or note) on an answer button, with its name for VoiceOver
const onButton = p => `${coinSVG(p)}<span class="sr">${moneyName(p)}</span>`;
const digits = p => (p >= 100 ? p / 100 : p);
const unit = p => (p >= 100 ? 'pounds' : 'pence');

/* ---------- Level 1: Coin Spotting ---------- */
const L1 = { name: 'Coin Spotting', blurb: 'Every coin and note, and the p and £ signs', eg: '20p · 50p · £1',
  seq: ['value', 'which', 'value', 'most', 'sign', 'which', 'value', 'most', 'sign'],
  make(type, k, easy) {
    const set = easy ? EASY_COINS : [...ALL_COINS, 500, 1000];
    if (type === 'sign' && !easy) {
      const n = pick([1, 2, 5, 10, 20, 50]), pounds = n <= 10 && Math.random() < .5;
      const right = pounds ? `£${n}` : `${n}p`, labels = shuffle([`£${n}`, `${n}p`, `${n}£`]), ans = labels.indexOf(right);
      return gq({ t: 'sign', kind: 'choice', prompt: `How do we write ${n} ${pounds ? (n === 1 ? 'pound' : 'pounds') : (n === 1 ? 'penny' : 'pence')}?`, answer: [ans], choices: [0, 1, 2], cfmt: i => labels[i], key: `sign${n}${pounds}`,
        clue: { say: pounds ? 'The pound sign goes in front of the number.' : 'p for pence goes after the number.' },
        steps: () => [
          { say: `Is it pence or pounds?`, choices: ['pence', 'pounds'], answer: pounds ? 'pounds' : 'pence', words: true },
          { say: pounds ? 'The pound sign goes in front. Which one is it?' : 'The p goes after the number. Which one is it?', choices: labels, answer: right, final: true, words: true },
        ] });
    }
    if (type === 'which' || type === 'most') {
      const coins = easy ? EASY_COINS : ALL_COINS, opts = shuffle(coins).slice(0, 3);
      const t = type === 'most' ? Math.max(...opts) : pick(opts), ans = opts.indexOf(t), cfmt = i => onButton(opts[i]);
      if (type === 'most') {
        const hasPound = opts.some(p => p >= 100);
        return gq({ t: 'most', kind: 'choice', prompt: 'Which coin is worth the most?', answer: [ans], choices: [0, 1, 2], cfmt, key: 'most' + opts.join(),
          clue: { say: hasPound ? 'Pounds are worth more than pence!' : 'Read the numbers on the coins.' },
          steps: () => [
            hasPound ? { say: 'Is there a pound coin?', choices: ['Yes', 'No'], answer: 'Yes', words: true }
              : { say: 'Which number is the biggest?', choices: opts.map(digits), answer: digits(t) },
            { say: 'Tap the coin worth the most.', choices: [0, 1, 2].map(cfmt), answer: cfmt(ans), final: true, words: true },
          ] });
      }
      const metals = [...new Set([metalWord(t), ...shuffle(['copper', 'silver', 'gold'])])].slice(0, 3);
      return gq({ t: 'which', kind: 'choice', prompt: `Which is the ${money(t)} coin?`, answer: [ans], choices: [0, 1, 2], cfmt, key: 'which' + t + opts.join(),
        clue: { say: LOOKS[t] },
        steps: () => [
          { say: `What colour is the ${money(t)} coin?`, choices: shuffle(metals), answer: metalWord(t), words: true },
          { say: `Tap the ${money(t)} coin.`, choices: [0, 1, 2].map(cfmt), answer: cfmt(ans), final: true, words: true },
        ] });
    }
    // 'value' (and the easy version's 'sign'): how much is this coin or note?
    const p = pick(set), others = set.filter(x => x !== p);
    const near3 = [...new Set([p, ...shuffle(others.filter(x => digits(x) === digits(p) || Math.abs(set.indexOf(x) - set.indexOf(p)) <= 2))])].slice(0, 3);
    while (near3.length < 3) { const x = pick(others); if (!near3.includes(x)) near3.push(x); }
    const labels = shuffle(near3).map(money), ans = labels.indexOf(money(p));
    return gq({ t: 'value', kind: 'choice', prompt: `How much is this ${p >= 500 ? 'note' : 'coin'}?`, answer: [ans], choices: [0, 1, 2], cfmt: i => labels[i], key: 'value' + p,
      vis: { type: 'coins', list: [p], count: false },
      clue: { say: LOOKS[p], point: 'visual' },
      steps: () => [
        { say: 'What number is written on it?', point: 'visual', choices: pick3(digits(p), [digits(p) * 10, digits(p) + 1, digits(p) + 5, 2 * digits(p)]), answer: digits(p) },
        { say: `So it’s ${digits(p)}…`, choices: ['pence', 'pounds'], answer: unit(p), words: true },
        { say: 'Which one is it?', choices: labels, answer: money(p), final: true, words: true },
      ] });
  } };

/* ---------- Level 2: Counting Coins ---------- */
const countAct = q => ({ say: 'Tap each coin to count it.', point: 'coins', action: () => (q.vis.counted || []).length === q.vis.list.length, wait: 'Count the coins up there!' });
const L2 = { name: 'Counting Coins', blurb: 'How much money is there?', eg: '5p + 5p + 5p = 15p',
  seq: ['same', 'same', 'mixed', 'same', 'mixed', 'mixed', 'same', 'mixed', 'mixed'],
  make(type, k, easy) {
    const ask = () => pick(['How much money is there?', 'How much money is in Bonnie’s purse?', `${WHO()} has these coins. How much is that?`]);
    const eq = [{ box: 0 }, 'p'];
    if (type === 'mixed' && !easy) {
      let list;
      do { list = Array.from({ length: rand(2, 4) }, () => pick([1, 2, 5, 10, 20])); } while (M.sum(list) > 50 || new Set(list).size < 2);
      const total = M.sum(list), big = [...list].sort((a, b) => b - a);
      return gq({ t: 'mixed', prompt: ask(), eq, answer: [total], key: 'mixed' + big.join(),
        vis: { type: 'coins', list: shuffle(list), count: true },
        clue: { say: 'Start with the biggest coin.', point: 'coins' },
        steps: () => {
          const out = [{ say: 'Which coin is worth the most?', point: 'coins', choices: shuffle([...new Set(big)].slice(0, 3)).map(money), answer: money(big[0]), words: true }];
          let run = big[0];
          big.slice(1).forEach((c, i) => {
            const t = run + c, last = i === big.length - 2, say = `${run} and ${c} more is…`;
            out.push(last ? fillStep(say, total, [t - 1, t + 1, t + 10, t - 10].filter(x => x > 0)) : { say, choices: pick3(t, [t - 1, t + 1, t + 10, t - 10].filter(x => x > 0)), answer: t });
            run = t;
          });
          return out;
        } });
    }
    const c = easy ? pick([2, 5, 10]) : pick([2, 5, 10, 1, 20]);
    const n = rand(2, c === 1 ? 9 : c === 2 ? (easy ? 5 : 6) : c === 5 ? (easy ? 4 : 6) : c === 10 ? (easy ? 4 : 5) : 2), total = n * c;
    return gq({ t: 'same', prompt: ask(), eq, answer: [total], key: `same${c}x${n}`,
      vis: { type: 'coins', list: Array(n).fill(c), count: true },
      clue: { say: c === 1 ? 'Count them one at a time!' : `Count in ${c}s!`, point: 'coins' },
      steps: q => [countAct(q), fillStep('So how many pence?', total, [total - c, total + c, total + 1])] });
  } };

/* ---------- Level 3: Make the Amount ---------- */
function purseQ({ t, target, tray, prompt, ban, made, clue, key }) {
  const q = gq({ t, kind: 'purse', prompt, answer: [target], key,
    vis: { type: 'purse', target, tray, in: [], ban: ban || null, made: made || null },
    clue, steps: q => purseSteps(q) });
  q.inter = 'purse'; // a picture to play with, not a quick tap (so it isn't on Bonnie's Walk)
  return q;
}
const L3 = { name: 'Make the Amount', blurb: 'Put the right coins in Bonnie’s purse', eg: '35p = 20p + 10p + 5p',
  seq: ['make', 'make', 'make', 'make', 'make', 'make', 'make', 'make', 'make'],
  make(type, k, easy) {
    const tray = easy ? [10, 5, 2, 1] : [50, 20, 10, 5, 2, 1];
    let T;
    do { T = easy ? rand(3, 20) : rand(11, 100); } while (greedyCoins(T, tray).length > (easy ? 3 : 4) || (!easy && T % 10 === 0 && Math.random() < .5));
    const prompt = pick([`Put ${money(T)} in Bonnie’s purse.`, `Make ${money(T)}.`, `${WHO()} needs ${money(T)} for the market. Put it in the purse.`]);
    return purseQ({ t: 'make', target: T, tray, prompt, key: 'make' + T, clue: { say: 'Start with the biggest coin that fits.', point: 'tray' } });
  } };

/* ---------- Level 4: Another Way ---------- */
// one way Bonnie might make t: the fewest coins, or all the same coin
function bonniesWay(t, tray) {
  const ways = [greedyCoins(t, tray)];
  for (const c of tray) if (c < t && t % c === 0 && t / c <= 5) ways.push(Array(t / c).fill(c));
  return pick(ways.filter(w => w && w.length > 1).length ? ways.filter(w => w && w.length > 1) : ways);
}
const L4 = { name: 'Another Way', blurb: 'The same amount with different coins', eg: '20p = 10p + 10p = 5p + 5p + 10p',
  seq: ['another', 'fewest', 'another', 'fewest', 'another', 'another', 'fewest', 'another', 'fewest'],
  make(type, k, easy) {
    if (type === 'fewest') {
      const set = [1, 2, 5, 10, 20, 50, 100];
      let T; do { T = easy ? rand(3, 20) : rand(6, 100); } while (greedyCoins(T, set).length < 2 || greedyCoins(T, set).length > 4);
      const plan = greedyCoins(T, set);
      return gq({ t: 'fewest', prompt: `What is the fewest coins that make ${money(T)}?`, eq: [{ box: 0 }, { text: 'coins' }], answer: [plan.length], key: 'fewest' + T,
        vis: { type: 'coins', list: set.filter(c => c <= T), count: false }, show: false,
        clue: { say: 'Try the biggest coins first.', point: 'visual' },
        steps: () => {
          const out = []; let need = T;
          plan.forEach((c, i) => {
            if (i > 0) out.push({ say: 'How much more do we need?', choices: pick3(need, [need - 1, need + 1, need + 5, need + 10].filter(x => x > 0)).map(money), answer: money(need), words: true });
            if (i === 0 || need !== c) out.push({ say: `Which coin is closest to ${money(need)} without going over?`, point: 'visual', choices: coinChoices(c, set), answer: money(c), words: true });
            need -= c;
          });
          out.push(fillStep('How many coins is that?', plan.length, near(plan.length)));
          return out;
        } });
    }
    const tray = easy ? [10, 5, 2, 1] : [50, 20, 10, 5, 2, 1];
    let T, ban, alt;
    do { T = easy ? rand(4, 20) : pick([rand(6, 50), 5 * rand(2, 20)]); ban = bonniesWay(T, tray); alt = coinPlan(T, tray, ban); }
    while (!alt || sameCoins(alt, ban) || alt.length > 6 || ban.length > 5);
    const tryCoin = alt.find(c => !ban.includes(c)) || alt[alt.length - 1];
    return purseQ({ t: 'another', target: T, tray, ban, made: ban, key: 'another' + T + ban.join(),
      prompt: `Bonnie made ${money(T)} like this. Can you make ${money(T)} a different way?`,
      clue: { say: `Could you use ${money(tryCoin)} coins?`, point: `coin-${tryCoin}` } });
  } };

/* ---------- Level 5: Pounds and Pence ---------- */
const L5 = { name: 'Pounds and Pence', blurb: '£1 is 100p; counting pounds and notes', eg: '£5 + £2 = £7',
  seq: ['p100', 'notes', 'pandp', 'p100', 'notes', 'pandp', 'notes', 'p100', 'pandp'],
  make(type, k, easy) {
    if (type === 'p100') {
      const c = pick(easy ? [1, 10] : [1, 1, 'two', 10, 20, 50]);
      if (c === 1) return gq({ t: 'p100', prompt: 'How many pence make £1?', eq: ['£1', '=', { box: 0 }, 'p'], answer: [100], key: 'p100',
        clue: { say: '£1 is the same as one hundred 1p coins.' },
        steps: () => [{ say: 'How many 10p coins make £1?', choices: [5, 10, 100], answer: 10 }, fillStep('10 lots of 10 make…', 100, [10, 110, 1000])] });
      if (c === 'two') return gq({ t: 'p200', prompt: 'How many pence make £2?', eq: ['£2', '=', { box: 0 }, 'p'], answer: [200], key: 'p200',
        clue: { say: 'Each pound is 100 pence.' },
        steps: () => [{ say: 'How many pence make £1?', choices: [10, 100, 1000], answer: 100 }, fillStep('100 and 100 more is…', 200, [2, 110, 1000])] });
      const n = 100 / c;
      return gq({ t: 'coins100', prompt: `How many ${money(c)} coins make £1?`, eq: [{ box: 0 }, { text: 'coins' }], answer: [n], key: 'c100' + c,
        clue: { say: `Count in ${c}s to 100.` },
        steps: () => [fillStep(`Count in ${c}s to 100. How many coins is that?`, n, [n - 1, n + 1, n * 2, c].filter(x => x > 0))] });
    }
    if (type === 'pandp' && !easy) {
      let pounds, pence;
      do { pounds = Array.from({ length: rand(1, 2) }, () => pick([100, 200, 500])); } while (M.sum(pounds) > 900);
      do { pence = Array.from({ length: 2 }, () => pick([5, 10, 20, 50])); } while (M.sum(pence) >= 100);
      const P = M.sum(pounds) / 100, p = M.sum(pence);
      return gq({ t: 'pandp', prompt: pick(['How much money is there?', `${WHO()} has this money. How much is it?`]), eq: ['£', { box: 0 }, { text: 'and' }, { box: 1 }, 'p'], answer: [P, p], key: 'mix' + pounds.join() + pence.join(),
        vis: { type: 'coins', list: shuffle([...pounds, ...pence]), count: false },
        clue: { say: 'Count the pounds first, then the pence.', point: 'visual' },
        steps: () => [fillStep('How many pounds are there?', P, [P - 1, P + 1, P + 2].filter(x => x > 0), 0), fillStep('And how many pence?', p, [p - 5, p + 5, p + 10].filter(x => x > 0), 1)] });
    }
    let list;
    do { list = Array.from({ length: rand(2, easy ? 3 : 4) }, () => pick(easy ? [100, 200, 500] : [100, 200, 500, 1000])); } while (M.sum(list) > 1000);
    const big = [...list].sort((a, b) => b - a).map(x => x / 100), total = M.sum(list) / 100;
    return gq({ t: 'notes', prompt: pick(['How much money is there?', `How many pounds has ${WHO()} got?`]), eq: ['£', { box: 0 }], answer: [total], key: 'cnt' + big.join(),
      vis: { type: 'coins', list: shuffle(list), count: true },
      clue: { say: 'Count the biggest first, then count on.', point: 'coins' },
      steps: () => {
        const out = [{ say: 'Which is worth the most?', point: 'coins', choices: shuffle([...new Set(big)].concat(big.length && new Set(big).size < 2 ? [big[0] === 10 ? 5 : big[0] * 2] : [])).slice(0, 3).map(x => money(x * 100)), answer: money(big[0] * 100), words: true }];
        let run = big[0];
        big.slice(1).forEach((c, i) => {
          const t = run + c, say = `£${run} and £${c} more is…`;
          out.push(i === big.length - 2 ? fillStep(say, total, [t - 1, t + 1, t + 2].filter(x => x > 0)) : { say, choices: pick3(t, [t - 1, t + 1, t + 2]), answer: t });
          run = t;
        });
        return out;
      } });
  } };

/* ---------- Level 6: Market Shopping ---------- */
const WARE_KEYS = Object.keys(M.WARES);
const L6 = { name: 'Market Shopping', blurb: 'Add two prices; how much more?', eg: '15p + 20p = 35p',
  seq: ['two', 'more', 'two', 'two', 'more', 'two', 'more', 'two', 'more'],
  make(type, k, easy) {
    const [k1, k2] = shuffle(WARE_KEYS).slice(0, 2);
    if (type === 'more') {
      let a, b; do { a = easy ? rand(2, 15) : rand(5, 80); b = easy ? rand(a + 2, 20) : rand(a + 5, 100); } while (b > (easy ? 20 : 100) || b - a < 2);
      const d = b - a, nt = Math.ceil(a / 10) * 10;
      return gq({ t: 'more', prompt: 'How much more does one cost than the other?', eq: [{ box: 0 }, 'p'], answer: [d], key: `more${a}-${b}`,
        vis: { type: 'stall', items: [{ k: k1, price: a }, { k: k2, price: b }] },
        clue: { say: `Count on from ${a} to ${b}.`, point: 'visual' },
        steps: () => nt > a && nt < b
          ? [{ say: `${a} to ${nt} is…`, choices: pick3(nt - a, [nt - a + 1, nt - a - 1, nt - a + 10].filter(x => x > 0)), answer: nt - a },
             { say: `${nt} to ${b} is…`, choices: pick3(b - nt, [b - nt + 1, b - nt - 1, b - nt + 10].filter(x => x > 0)), answer: b - nt },
             fillStep(`${nt - a} and ${b - nt} is…`, d, [d - 1, d + 1, d + 10, d - 10].filter(x => x > 0))]
          : [fillStep(`${a} and how many more make ${b}?`, d, [d - 1, d + 1, d + 10, d - 10].filter(x => x > 0))] });
    }
    let a, b; do { a = easy ? rand(1, 12) : rand(5, 60); b = easy ? rand(1, 12) : rand(5, 60); } while (a + b > (easy ? 20 : 100) || a === b);
    const total = a + b, big = Math.max(a, b), small = Math.min(a, b), tens = Math.floor(small / 10) * 10, ones = small % 10;
    return gq({ t: 'two', prompt: pick(['How much for both of these?', `${WHO()} buys both of these. How much is that?`]) /* the stall shows what they are (named here, every pair would need its own recording) */, eq: [{ box: 0 }, 'p'], answer: [total], key: `two${small}+${big}`,
      vis: { type: 'stall', items: [{ k: k1, price: a }, { k: k2, price: b }] },
      clue: { say: total > 20 ? 'Add the tens, then the ones.' : 'Start with the bigger price and count on.', point: 'visual' },
      steps: () => tens && ones
        ? [{ say: `${big} and ${tens} more is…`, choices: pick3(big + tens, [big + tens + 1, big + tens - 1, big + tens + 10, big + tens - 10]), answer: big + tens },
           fillStep(`${big + tens} and ${ones} more is…`, total, [total - 1, total + 1, total + 10, total - 10].filter(x => x > 0))]
        : [fillStep(`${big} and ${small} more is…`, total, [total - 1, total + 1, total + 10, total - 10].filter(x => x > 0))] });
  } };

/* ---------- Level 7: Giving Change ---------- */
const L7 = { name: 'Giving Change', blurb: 'Count on from the price', eg: '£1 − 65p = 35p change',
  seq: ['change', 'change', 'change', 'change', 'change', 'change', 'change', 'change', 'change'],
  make(type, k, easy) {
    const paid = pick(easy ? [10, 20] : [10, 20, 50, 100, 100]), price = paid === 100 ? 5 * rand(1, 19) : rand(paid > 20 ? paid - 45 : 1, paid - 1);
    const ch = paid - price, ware = pick(WARE_KEYS), nt = Math.ceil(price / 10) * 10;
    return gq({ t: 'change', prompt: `${WHO()} buys this for ${money(price)} and pays with ${money(paid)}. How much change?`, eq: [{ box: 0 }, 'p'], answer: [ch], key: `ch${price}/${paid}`,
      vis: { type: 'stall', items: [{ k: ware, price }], paid },
      clue: { say: `Count on from ${money(price)} to ${money(paid)}.`, point: 'visual' },
      steps: () => nt > price && nt < paid
        ? [{ say: `${price} to ${nt} is…`, choices: pick3(nt - price, [nt - price + 1, nt - price - 1, nt - price + 10].filter(x => x > 0)), answer: nt - price },
           { say: `${nt} to ${paid} is…`, choices: pick3(paid - nt, [paid - nt + 10, paid - nt - 10, paid - nt + 5].filter(x => x > 0)), answer: paid - nt },
           fillStep(`${nt - price} and ${paid - nt} is…`, ch, [ch - 1, ch + 1, ch + 10, ch - 10].filter(x => x > 0))]
        : [fillStep(`${price} and how many more make ${paid}?`, ch, [ch - 1, ch + 1, ch + 2, ch + 10].filter(x => x > 0))] });
  } };

const QUESTS = [
  'Bonnie found coins on the harbour wall. What are they worth?',
  'Count up Bonnie’s pocket money for the market.',
  'Fill Bonnie’s purse before the stalls close!',
  'There’s more than one way to fill a purse!',
  'The big money! Count up the pounds and the notes.',
  'The stalls are open. What will it all cost?',
  'Help the stall keepers count out the change.',
];

Meadow.registerWorld(M.world({
  id: 'y2-maths-money', name: 'Harbour Market', tag: 'Coins, notes and change', icon: '🪙', color: '#2F7FA8', tint: '#E2F0F7',
  intro: 'At the market everything has a <b>price</b>. Pence are written <b>p</b>, and pounds have a <b>£</b> in front.',
  ids: ['coins', 'count-coins', 'make-it', 'other-ways', 'pounds', 'shopping', 'change'],
  levels: [L1, L2, L3, L4, L5, L6, L7].map((L, i) => ({ ...L, quest: QUESTS[i] })),
}));
})();
