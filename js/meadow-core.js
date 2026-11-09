/* =========================================================
   Meadow core: the shared engine for every Meadow game.

   It owns everything that must be the same in every game:
   the save (meadow-save-v1) and the one-off copy from the old saves,
   the star and bone rules, the world map and level picker, the
   level-complete screen, the Bone Shop, the grown-ups area, Bonnie's
   drawing, sounds, confetti and the top bar.

   A world file only describes content and calls this API:
     Meadow.registerWorld(world)        add a world (see README for the shape)
     Meadow.startGame({ subject, … })   draw the game on the page
     Meadow.correct(el)                 a right answer (1 bone)
     Meadow.wrong(msg)                  a wrong answer (counts as a mistake)
     Meadow.helped(tier)                Bonnie's help reached this tier
     Meadow.askedBonnie(el)             the child asked Bonnie (first time in a level: +1 bone)
     Meadow.finishLevel()               end the level now (normally automatic)

   The old saves (harvey-splitter-v1, meadowWords_english_v1,
   meadowClubhouse_sound) are only ever READ, never changed.
   ========================================================= */
(() => {
'use strict';

const SAVE_VERSION = 1;
const DEFAULT_KEY = 'meadow-save-v1';
const OLD_KEYS = { shared: 'harvey-splitter-v1', words: 'meadowWords_english_v1', club: 'meadowClubhouse_sound' };

/* ---------- the rules (Bones v1.1) ----------
   Practice is never limited; only how fast bones come in on repeat plays.
   The first NORMAL_RUNS_PER_DAY plays of a level each day are normal runs: a bone per right answer.
   Later plays that day are extra practice runs: no answer bones, EXTRA_RUN_BONES for finishing.
   New best stars and asking Bonnie pay on every run. There is no daily cap across the game. */
const RULES = {
  ANSWER_BONES: 1,        // every right answer in a normal run, flat; no multipliers
  ASK_BONES: 1,           // the first time Bonnie is asked in a run (any run)
  BONES_PER_NEW_STAR: 3,  // level complete: 3 bones for each star better than the best so far (any run)
  NORMAL_RUNS_PER_DAY: 2, // per level, per day
  EXTRA_RUN_BONES: 3,     // finishing an extra practice run
  starsFor: ({ mistakes, helps }) => (mistakes <= 1 && helps === 0 ? 3 : mistakes <= 4 && helps <= 1 ? 2 : 1),
  starBonus: (stars, prevBest) => RULES.BONES_PER_NEW_STAR * Math.max(0, stars - prevBest),
};

/* ---------- old saves stored progress by position; these are the new, stable ids ----------
   The world files must use exactly these ids (they are never renamed or reused). */
const OLD_IDS = {
  english: [
    ['y2-english-phonics', ['a-e', 'i-e-o-e', 'u-e-e-e', 'ai-ay', 'ee-ea-igh-ie']],
    ['y2-english-tricky-words', ['trail-starters', 'where-there', 'would-could-should', 'water-money', 'big-tricky-words']],
    ['y2-english-sentences', ['capital-letters', 'full-stop-or-question', 'exclamation', 'word-order', 'super-sentences']],
    ['y2-english-stories', ['rhyme-time', 'who', 'where-and-what', 'mixed-questions', 'longer-stories']],
  ],
  maths: [
    ['y2-maths-partitioning', ['teen-numbers', 'tens-and-ones', 'missing-parts', 'hundreds', 'tricky-zeros', 'split-another-way', 'thousands', 'partition-to-add']],
    ['y2-maths-number-lines', ['full-tick-trails', 'stepping-stones', 'midpoint-explorers', 'tens-boundaries', 'froggy-jumps']],
    ['y2-maths-arrays', ['bone-groups', 'grid-builder', 'swapping-tree', 'times-tables-harvest', 'word-problems']],
    ['y2-maths-sharing', ['equal-sharing', 'grouping', 'half-a-pond', 'quarter-splitting', 'inverse-check']],
  ],
};

/* ---------- shop stock (prices unchanged) ---------- */
const STARTER_PRIZES = [
  [30, 'Choose the after-school snack', 'You pick the snack.'],
  [40, 'Stay up 10 mins late', 'Ten extra minutes before bed.'],
  [50, 'Be the DJ for the car journey', 'You choose the music.'],
  [100, '15 mins extra gaming/screen time', 'A bit more screen time.'],
  [120, 'Choose tonight’s dessert', 'You pick the pudding.'],
  [150, '30 minutes later bedtime', 'Half an hour later to bed.'],
  [300, 'Special treat from the corner shop', 'Pick a treat at the shop.'],
  [400, 'Choose the Friday night family movie', 'You pick the film.'],
  [500, 'Small toy or trading card pack', 'For example Pokémon or other collectible cards.'],
  [1000, 'Trip to the bowling alley', 'A family bowling trip.'],
  [1200, 'Small buildable toy set', 'Choose a small building set.'],
  [1500, 'Special weekend outing with a parent', 'A big day out together.'],
].map(([cost, title, desc], i) => ({ id: 'u' + i, cost, title, desc }));
/* Bonnie's dress-up. Each item goes in one slot, so she can wear a hat, something on her
   face and something round her neck all at once. The save keeps them in hat, face and neck
   (owned ones are all listed in owned.hats, the name it had before there were slots). */
const SLOTS = [
  { id: 'head', key: 'hat', name: 'Hats', off: 'Take hat off' },
  { id: 'face', key: 'face', name: 'Glasses and eyepatches', off: 'Take them off' },
  { id: 'neck', key: 'neck', name: 'Collars and more', off: 'Take it off' },
];
const HATS = [
  { id: 'collar-red', slot: 'neck', name: 'Red Collar', cost: 30 },
  { id: 'collar-blue', slot: 'neck', name: 'Blue Collar', cost: 40 },
  { id: 'eyepatch', slot: 'face', name: 'Pirate Eyepatch', cost: 50 },
  { id: 'sunglasses', slot: 'face', name: 'Cool Sunglasses', cost: 60 },
  { id: 'bandana', slot: 'neck', name: 'Spotty Bandana', cost: 60 },
  { id: 'specs', slot: 'face', name: 'Clever Specs', cost: 70 },
  { id: 'bowtie', slot: 'neck', name: 'Purple Bow Tie', cost: 70 },
  { id: 'party', slot: 'head', name: 'Party Hat', cost: 75 },
  { id: 'bobble', slot: 'head', name: 'Bobble Hat', cost: 80 },
  { id: 'flowers', slot: 'head', name: 'Flower Crown', cost: 90 },
  { id: 'scarf', slot: 'neck', name: 'Christmas Scarf', cost: 100 },
  { id: 'chef', slot: 'head', name: 'Chef’s Hat', cost: 110 },
  { id: 'santa', slot: 'head', name: 'Santa Hat', cost: 120 },
  { id: 'headphones', slot: 'head', name: 'DJ Headphones', cost: 130 },
  { id: 'wizard', slot: 'head', name: 'Wizard Hat', cost: 150 },
  { id: 'cape', slot: 'neck', name: 'Superhero Cape', cost: 180 },
  { id: 'cowboy', slot: 'head', name: 'Cowboy Hat', cost: 200 },
  { id: 'medal', slot: 'neck', name: 'Gold Medal', cost: 250 },
  { id: 'crown', slot: 'head', name: 'Crown', cost: 300 },
];
const itemOf = id => HATS.find(h => h.id === id);
const slotKey = id => { const it = itemOf(id); return it ? SLOTS.find(x => x.id === it.slot).key : null; };
const THEMES = [
  { id: 'day', name: 'Daytime Meadow', cost: 0, sw: 'linear-gradient(#F6EBD3,#E7D9B8)' },
  { id: 'sunset', name: 'Sunset Trail', cost: 100, sw: 'linear-gradient(#F7968C,#FFBE6E)' },
  { id: 'sea', name: 'Under the Sea', cost: 200, sw: 'radial-gradient(circle at 70% 35%,rgba(255,255,255,.85) 0 6%,transparent 7%),radial-gradient(circle at 58% 62%,rgba(255,255,255,.7) 0 4%,transparent 5%),linear-gradient(#D4F3F1,#4FA3C0)' },
  { id: 'night', name: 'Spooky Moonlit Night', cost: 250, sw: 'radial-gradient(circle at 75% 30%,#FFF6D5 0 10%,transparent 11%),linear-gradient(#1E2340,#3A3F6B)' },
  { id: 'christmas', name: 'Christmas Lights', cost: 350, sw: 'radial-gradient(circle at 22% 32%,#FF5A4E 0 8%,transparent 9%),radial-gradient(circle at 50% 24%,#FFD24A 0 8%,transparent 9%),radial-gradient(circle at 78% 32%,#6EDB7A 0 8%,transparent 9%),radial-gradient(circle at 30% 75%,#fff 0 3%,transparent 4%),radial-gradient(circle at 68% 68%,#fff 0 3%,transparent 4%),linear-gradient(#173B2C,#2E5E44)' },
  { id: 'snow', name: 'Winter Snow', cost: 400, sw: 'linear-gradient(#EEF5FB,#B4D4F0)' },
];
const PRIZE_TIERS = [[0, 'Little treats'], [100, 'Small prizes'], [300, 'Medium prizes'], [1000, 'Big goals']];
const tierOf = cost => PRIZE_TIERS.filter(([min]) => cost >= min).pop()[1];
const prizeEmoji = t => { t = String(t).toLowerCase();
  return /snack/.test(t) ? '🍪' : /dj|music/.test(t) ? '🎶' : /screen|gaming|tablet/.test(t) ? '📺' : /dessert|pudding/.test(t) ? '🍨'
    : /bed|stay up|late/.test(t) ? '🌙' : /shop|treat/.test(t) ? '🍬' : /movie|film/.test(t) ? '🎬' : /bowling/.test(t) ? '🎳'
    : /build|lego/.test(t) ? '🧱' : /toy|card/.test(t) ? '🧸' : /outing|trip|park/.test(t) ? '🏞️' : /dinner/.test(t) ? '🍕' : '🎁'; };

/* ---------- Bonnie's words that are the same in every game ---------- */
const LINES = {
  praise: ['Pawsome, {N}!', 'Woof! Brilliant!', 'Tail-waggingly good!', 'Super job, {N}!', 'Bone-tastic!', 'Wow! Clever clogs!'],
  watched: 'Well done for watching and learning, {N}!',
  oops: ['Nearly! Have another sniff.', 'Ooh, so close! Try again.', "That's okay — mistakes help our brains grow!", 'Not quite. You can do it, {N}!'],
  tickles: ['Hee hee! That tickles!', 'Ha ha! Stop it, {N}!', 'Ooh, my ears are ticklish!', 'Hehe! Do it again!', 'Woof! Not my tummy!',
    'Ha ha! You found my ticklish spot!', 'Ooh, that makes my tail wag!', 'Hee hee! My paws have gone all wiggly!', 'Woof woof! Again, again!',
    'Ha ha! My whiskers are wobbling!', 'Hee hee! Who taught you to tickle like that?'],
  // the Easter egg: tickle her lots of times quickly and she does a spinning jump
  tickleEgg: ['Okay, okay, you win! Watch my super spin!', "So many tickles! Time for a happy dance!", "Woof! You're the tickle champion, {N}!"],
  finish: { 3: "WOW, {N}! Three stars! You're a superstar!", 2: 'Brilliant work, {N}! Two shiny stars!', 1: 'You did it, {N}! Every try makes you stronger!' },
  already3: 'You already have 3 stars here: great practice!',
  stillBest: { 1: 'Your best here is still 1 star. Great practice!', 2: 'Your best here is still 2 stars. Great practice!' },
  // Bones v1.1: the 3rd and later plays of a level in a day
  extraPractice: "You came back for more, {N}! This one's extra practice. Finish it for 3 bonus bones!",
  extraDone: '3 extra practice bones for you!',
  // maths levels start with 2 easy warm-up questions that don't count for stars
  warmUp: "Let's warm up with two easy ones, {N}!",
  // Bonnie's Walk
  walkStart: ['Walkies! Come on {N}, five quick questions on our walk!', "Woof! Lead the way, {N}! Let's see what we find on our walk."],
  walkOops: ["Hmm, let's sniff that one out together!", "Ooh, tricky! Let's have another look together.", "Let's work it out together, {N}!"],
  walkDone: ['What a lovely walk, {N}! Thank you for coming with me!', 'Walk done! My paws are so happy, {N}!', 'Hooray! We did the whole walk together, {N}!'],
  walkStop: "Stop the walk? That's okay, I'll wait for you!",
  locked: 'Finish the level before to unlock this one!',
  shownAll: "I've shown you the answer, {N}! Now you have a go. 🐾",
  shopWelcome: 'Welcome to my shop, {N}! Bones from Meadow Maths and Meadow Words all go in the same bone bowl.',
  hatOn: 'Do I look smart?',
  hatOff: 'Ahh, that feels breezy!',
  theme: "Ooh, it's beautiful! Thank you, {N}!",
  grownUp: 'Go and get a grown-up! They hold the button to say yes.',
  prize: 'Hooray, {N}! Go and tell your grown-up what you unlocked!',
  testVoice: 'Hello {N}! I am Bonnie. Shall we play together?',
};
const DEFAULT_HINTS = ['Sniff Clue', 'Scout Tip!', 'Paw Help', 'Watch Me!'];

/* ---------- tiny helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = a => a[Math.floor(Math.random() * a.length)];
const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nameOf = () => (S && S.name) || 'friend';
const fmt = s => String(s).replaceAll('{N}', nameOf());
const wait = ms => new Promise(r => setTimeout(r, ms));
const todayGB = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
/* Bones v1.1: the device's local date as YYYY-MM-DD. clock() can be swapped by the tests (Meadow.setClock). */
let clock = () => new Date();
const pad2 = n => String(n).padStart(2, '0');
const localDay = (d = clock()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
/* A new day clears the counts. If the date has gone backwards, the stored day and its counts are kept. */
function rollDay(s) {
  const t = localDay();
  if (!s.daily.day || t > s.daily.day) s.daily = { day: t, normalRuns: {} };
  return s.daily;
}
/* How many normal runs this level has had today (without changing the save). */
function runsToday(s, key) {
  const t = localDay(), d = s.daily;
  return d.day && t <= d.day ? d.normalRuns[key] || 0 : 0;
}
/* The Monday that starts this week (local date), as YYYY-MM-DD. */
function weekStart(d = clock()) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return localDay(x);
}
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
/* A YYYY-MM-DD day moved by n days (local time). */
function shiftDay(day, n) { const [y, m, d] = day.split('-').map(Number); return localDay(new Date(y, m - 1, d + n)); }
const WALK_DAYS_KEPT = 90;
const STAR_LOG_MAX = 500; // plenty for a year of new stars; the oldest go first
const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const int = (v, lo = 0, hi = Infinity) => Math.min(hi, Math.max(lo, Math.floor(+v || 0)));

/* =========================================================
   SAVE: one object in meadow-save-v1
   ========================================================= */
let KEY = DEFAULT_KEY;
let S = null; // the save, always re-read before a change

function readJSON(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; } }
function blankSave() {
  return {
    version: SAVE_VERSION, name: null, bones: 0, hat: null, face: null, neck: null, theme: 'day',
    sound: true, voice: true, readAloud: false, voiceRate: 0.9, clubSound: true,
    owned: { hats: [], themes: ['day'] },
    rewards: STARTER_PRIZES.map(r => ({ ...r })), redeemed: [],
    stars: {}, logs: {},
    settings: { unlockAll: {}, years: null },
    daily: { day: null, normalRuns: {} }, // Bones v1.1: normal runs per level today (local date)
    starLog: [], // each time a level's best stars went up: { key, from, to, day }
    walks: { days: {}, last: null, streak: 0, topic: null }, // Bonnie's Walk: finished walks per day, the streak, the last walk's first maths world
  };
}
const cleanPrize = (r, i) => ({ id: String(r.id || 'p' + i), title: String(r.title || 'Prize').slice(0, 60), desc: String(r.desc || '').slice(0, 120), cost: int(r.cost, 1, 9999) || 1 });
/* Makes any loaded save safe to use: right shapes, sensible numbers. */
function normalise(raw) {
  const s = Object.assign(blankSave(), isObj(raw) ? raw : {});
  s.version = SAVE_VERSION;
  s.name = typeof s.name === 'string' && s.name.trim() ? s.name.trim().slice(0, 30) : null;
  s.bones = int(s.bones, 0, 99999);
  // the eyepatch used to be worn as a hat: it moves to the face slot
  if (slotKey(s.hat) === 'face' && !s.face) s.face = s.hat;
  ['hat', 'face', 'neck'].forEach(k => { s[k] = slotKey(s[k]) === k ? s[k] : null; });
  s.theme = THEMES.some(t => t.id === s.theme) ? s.theme : 'day';
  ['sound', 'voice', 'clubSound'].forEach(k => { s[k] = s[k] !== false; });
  s.readAloud = !!s.readAloud;
  s.voiceRate = Math.min(1.2, Math.max(0.6, +s.voiceRate || 0.9));
  const o = isObj(s.owned) ? s.owned : {};
  s.owned = { hats: [...new Set((o.hats || []).filter(h => itemOf(h)))],
    themes: [...new Set(['day', ...(o.themes || []).filter(t => THEMES.some(x => x.id === t))])] };
  s.rewards = Array.isArray(s.rewards) ? s.rewards.filter(isObj).map(cleanPrize) : STARTER_PRIZES.map(r => ({ ...r }));
  s.redeemed = Array.isArray(s.redeemed) ? s.redeemed.filter(isObj) : [];
  const stars = {}; if (isObj(s.stars)) Object.entries(s.stars).forEach(([k, v]) => { v = int(v, 0, 3); if (v) stars[k] = v; });
  s.stars = stars;
  s.logs = isObj(s.logs) ? s.logs : {};
  const d = isObj(s.daily) ? s.daily : {}, runs = {};
  if (isObj(d.normalRuns)) Object.entries(d.normalRuns).forEach(([k, v]) => { v = int(v, 0, 99); if (v) runs[k] = v; });
  s.daily = { day: typeof d.day === 'string' && DAY_RE.test(d.day) ? d.day : null, normalRuns: runs };
  s.starLog = (Array.isArray(s.starLog) ? s.starLog : []).filter(e => isObj(e) && typeof e.key === 'string' && typeof e.day === 'string' && DAY_RE.test(e.day))
    .map(e => ({ key: e.key, from: int(e.from, 0, 3), to: int(e.to, 0, 3), day: e.day })).filter(e => e.to > e.from).slice(-STAR_LOG_MAX);
  const wk = isObj(s.walks) ? s.walks : {}, wdays = {};
  if (isObj(wk.days)) Object.entries(wk.days).forEach(([k, v]) => { v = int(v, 0, 999); if (DAY_RE.test(k) && v) wdays[k] = v; });
  s.walks = { days: wdays, last: typeof wk.last === 'string' && DAY_RE.test(wk.last) ? wk.last : null, streak: int(wk.streak, 0, 9999),
    topic: typeof wk.topic === 'string' ? wk.topic : null };
  const st = isObj(s.settings) ? s.settings : {};
  s.settings = { ...st, unlockAll: isObj(st.unlockAll) ? st.unlockAll : {},
    years: Array.isArray(st.years) && st.years.length ? [...new Set(st.years.map(Number).filter(Number.isFinite))] : null,
    warmUps: st.warmUps !== false, teachBonnie: st.teachBonnie !== false, walkMix: WALK_MIXES[st.walkMix] ? st.walkMix : 'gentle' };
  return s;
}

/* The old saves, read-only. */
function readOld() {
  let club = null; try { club = localStorage.getItem(OLD_KEYS.club); } catch (e) {}
  return { shared: readJSON(OLD_KEYS.shared), words: readJSON(OLD_KEYS.words), club };
}

/* One-off copy from the old saves into the new format. Pure: it never writes anything. */
function migrate(old = readOld()) {
  const raw = isObj(old.shared) ? old.shared : {}, words = isObj(old.words) ? old.words : {};
  const s = blankSave();
  // copied exactly
  if (typeof raw.name === 'string') s.name = raw.name;
  if (raw.bones != null) s.bones = raw.bones;
  if (raw.hat) s.hat = raw.hat;
  if (raw.theme) s.theme = raw.theme;
  if (raw.sound === false) s.sound = false;
  if (raw.readAloud) s.readAloud = true;
  if (Array.isArray(raw.rewards)) s.rewards = raw.rewards;
  if (Array.isArray(raw.redeemed)) s.redeemed = raw.redeemed;
  if (isObj(raw.owned)) s.owned = raw.owned;
  if (isObj(raw.words) && raw.words.voiceRate) s.voiceRate = raw.words.voiceRate;
  if (old.club === '0') s.clubSound = false;
  s.settings.unlockAll = { maths: !!raw.unlockAll, english: !!(isObj(raw.words) && raw.words.unlockAll) };
  // Words: each level's stars onto the new ids
  OLD_IDS.english.forEach(([wid, lids], w) => {
    const arr = isObj(words['w' + w]) && Array.isArray(words['w' + w].stars) ? words['w' + w].stars : [];
    lids.forEach((lid, l) => { const v = int(arr[l], 0, 3); if (v) s.stars[wid + '/' + lid] = v; });
  });
  // Maths: every finished level gets 1 star (replay for more).
  // World 2 was rebuilt once: Maths ignores done2/log2 unless w2v is 2, so we do too.
  const done1 = Object.assign({}, isObj(raw.done) ? raw.done : {});
  if (isObj(raw.stars)) Object.keys(raw.stars).forEach(k => { if (raw.stars[k] > 0) done1[k] = true; }); // an even older format
  const maths = [[done1, raw.log], [raw.w2v === 2 ? raw.done2 : null, raw.w2v === 2 ? raw.log2 : null], [raw.done3, raw.log3], [raw.done4, raw.log4]];
  OLD_IDS.maths.forEach(([wid, lids], w) => {
    const [done, log] = maths[w];
    lids.forEach((lid, l) => {
      const k = wid + '/' + lid;
      if (isObj(done) && done[l]) s.stars[k] = Math.max(s.stars[k] || 0, 1);
      const e = isObj(log) && log[l];
      if (isObj(e) && Array.isArray(e.tiers)) s.logs[k] = { tiers: e.tiers.map(n => int(n)), eased: int(e.eased), when: String(e.when || '') };
    });
  });
  s.migratedFrom = [OLD_KEYS.shared, OLD_KEYS.words, OLD_KEYS.club].filter(k => (k === OLD_KEYS.shared ? old.shared : k === OLD_KEYS.words ? old.words : old.club) != null);
  s.migratedAt = new Date().toISOString();
  return normalise(s);
}

/* ---------- keeping up with the old saves ----------
   The old games may still be played after the new save was made: before go-live (the beta),
   or offline on an iPad that still has the old pages saved. So every load checks whether the
   old saves have changed since we last looked (a short fingerprint of their text), and if so
   copies the new progress across. The old saves are still only read.
     - stars: the best of both; logs: kept, missing ones filled in
     - dress-up and themes: everything owned in either
     - bones: the first time (a save from the beta) the live bones are used, because beta bones
       were only for trying things out; after that, whatever the old game earned or spent since. */
function oldPrint() {
  const raw = k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
  const t = raw(OLD_KEYS.shared) + '|' + raw(OLD_KEYS.words);
  let h = 5381; for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0;
  return t.length + ':' + h.toString(36);
}
function catchUp(s, old = readOld(), print = oldPrint()) {
  const seen = isObj(s.oldSeen) ? s.oldSeen : null;
  if (seen && seen.print === print) return false;
  const live = migrate(old);
  if (seen) s.bones = Math.max(0, s.bones + live.bones - int(seen.bones));
  else { s.bones = live.bones; s.rewards = live.rewards; s.redeemed = live.redeemed; s.liveCopiedAt = new Date().toISOString(); }
  if (seen) { const had = new Set(s.redeemed.map(r => JSON.stringify(r))); live.redeemed.forEach(r => { if (!had.has(JSON.stringify(r))) s.redeemed.push(r); }); }
  Object.entries(live.stars).forEach(([k, v]) => { s.stars[k] = Math.max(s.stars[k] || 0, v); });
  Object.entries(live.logs).forEach(([k, v]) => { if (!s.logs[k]) s.logs[k] = v; });
  s.owned = { hats: [...new Set([...s.owned.hats, ...live.owned.hats])], themes: [...new Set([...s.owned.themes, ...live.owned.themes])] };
  if (!s.name && live.name) s.name = live.name;
  s.oldSeen = { print, bones: live.bones };
  return true;
}

function write(s) {
  if (Object.values(OLD_KEYS).includes(KEY)) throw new Error('Meadow core must never write the old saves');
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
}
function load() {
  const raw = readJSON(KEY);
  if (isObj(raw) && raw.version) {
    const s = normalise(raw);
    if (!s.name) { // the Clubhouse still sets the name in the old save (until it moves onto the core)
      const old = readJSON(OLD_KEYS.shared);
      if (isObj(old) && typeof old.name === 'string' && old.name.trim()) { s.name = old.name.trim().slice(0, 30); write(s); }
    }
    if (catchUp(s)) { const t = normalise(s); write(t); return t; }
    return s;
  }
  const s = migrate(); s.oldSeen = { print: oldPrint(), bones: s.bones }; write(s); return s;
}
/* Always re-read before changing, so another open game never loses bones. */
function mutate(fn) { S = load(); fn(S); S = normalise(S); write(S); renderHud(); return S; }

/* =========================================================
   WORLDS
   ========================================================= */
const WORLDS = [];
function checkLevels(w, levels, fail) {
  const seen = new Set();
  levels.forEach((L, i) => {
    if (!L || typeof L.id !== 'string' || !L.id) fail(`level ${i + 1} needs an id`);
    if (seen.has(L.id)) fail(`level id "${L.id}" is used twice`); seen.add(L.id);
    if (!Array.isArray(L.items) && typeof L.make !== 'function') fail(`level "${L.id}" needs items or make()`);
    if (typeof (L.play || w.play) !== 'function') fail(`level "${L.id}" needs a play() function (on the level or the world)`);
  });
}
/* A file can add levels to the end of a world another file made (load it after that world).
   Stars are saved by level id, so the levels already there keep theirs. */
function addLevels(worldId, levels) {
  const w = WORLDS.find(x => x.id === worldId);
  const fail = msg => { throw new Error(`Meadow.addLevels(${worldId}): ${msg}`); };
  if (!w) fail('no world has that id (load its file first)');
  if (!Array.isArray(levels) || !levels.length) fail('no levels to add');
  checkLevels(w, [...w.levels, ...levels], fail);
  w.levels.push(...levels);
  return w;
}
function registerWorld(w) {
  const fail = msg => { throw new Error(`Meadow.registerWorld(${w && w.id}): ${msg}`); };
  if (!isObj(w) || typeof w.id !== 'string' || !w.id) fail('a world needs an id');
  if (WORLDS.some(x => x.id === w.id)) fail('that id is already used');
  if (!w.subject) fail('a world needs a subject');
  if (!Number.isFinite(w.year)) fail('a world needs a school year (a number)');
  if (!Array.isArray(w.levels) || !w.levels.length) fail('a world needs levels');
  checkLevels(w, w.levels, fail);
  WORLDS.push(w);
  if (w.css && typeof document !== 'undefined' && document.head) addStyle(w.css, 'meadow-world-' + w.id);
  return w;
}
const keyOf = (w, L) => w.id + '/' + L.id;
const worldById = id => WORLDS.find(w => w.id === id);
const starsOf = (w, L) => (S.stars[keyOf(w, L)] || 0);
const worldStars = w => w.levels.reduce((n, L) => n + starsOf(w, L), 0);
const subjectWorlds = subject => WORLDS.filter(w => !subject || w.subject === subject);
const yearsWithWorlds = subject => [...new Set(subjectWorlds(subject).map(w => w.year))].sort((a, b) => a - b);
/* Which school years show: the grown-ups' choice, or the highest year that has worlds. */
function shownYears(subject) {
  const have = yearsWithWorlds(subject), chosen = (S.settings.years || []).filter(y => have.includes(y));
  return chosen.length ? chosen : have.slice(-1);
}
function visibleWorlds(subject) {
  const ys = shownYears(subject);
  return subjectWorlds(subject).filter(w => ys.includes(w.year)).sort((a, b) => b.year - a.year);
}
function levelUnlocked(w, i) { return !!S.settings.unlockAll[w.subject] || i === 0 || starsOf(w, w.levels[i - 1]) > 0; }
/* For the Clubhouse cards: stars earned / possible for the years being shown. */
function starSummary(subject) {
  if (!S) S = load();
  const ws = visibleWorlds(subject);
  return { earned: ws.reduce((n, w) => n + worldStars(w), 0), possible: ws.reduce((n, w) => n + w.levels.length * 3, 0) };
}
/* For the Clubhouse cards: stars gained this week (Monday to today, local time) in the years being shown. */
function starsThisWeek(subject) {
  if (!S) S = load();
  const from = weekStart(), to = localDay(), ids = visibleWorlds(subject).map(w => w.id + '/');
  return S.starLog.filter(e => e.day >= from && e.day <= to && ids.some(p => e.key.startsWith(p))).reduce((n, e) => n + e.to - e.from, 0);
}
/* A level counts as played once it has been finished (its stars or its help log). */
const playedLevel = (w, L) => starsOf(w, L) > 0 || !!S.logs[keyOf(w, L)];

/* =========================================================
   QUIET DIFFICULTY (from Meadow Maths)
   Two hard questions in a row (help counted) → rung -1: make() gets eased:true.
   Two clean in a row → back to 0. Nothing on screen shows this.
   ========================================================= */
const learner = {
  recent: [], rung: 0,
  note(hard) {
    this.recent.push(hard ? 'hard' : 'clean'); if (this.recent.length > 4) this.recent.shift();
    const [a, b] = this.recent.slice(-2);
    if (this.rung === 0 && a === 'hard' && b === 'hard') this.rung = -1;
    else if (this.rung < 0 && a === 'clean' && b === 'clean') this.rung = 0;
  },
};

/* =========================================================
   SOUND (Web Audio, no files) and VOICE (bonnie-voice.js)
   ========================================================= */
let AC = null;
function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
function tone(f, d = .12, type = 'sine', vol = .18, slide = 0, delay = 0) {
  if (!S || !S.sound) return; const a = ac(); if (!a) return;
  const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t + d);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.001, t + d);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .02);
}
const sfx = {
  tap: () => tone(700, .04, 'triangle', .05),
  pick: () => tone(520, .06, 'triangle', .12),
  snap: () => { tone(300, .05, 'square', .07); tone(640, .09, 'triangle', .14, 0, .03); },
  pop: () => tone(700, .08, 'sine', .15, 300),
  correct: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .16, 'triangle', .16, 0, i * .07)),
  wrong: () => { tone(260, .16, 'sine', .14, -60); tone(200, .2, 'sine', .1, -40, .1); },
  coin: () => { tone(988, .07, 'square', .07); tone(1319, .14, 'square', .07, 0, .06); },
  fanfare: () => [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, .22, 'triangle', .16, 0, i * .12)),
  giggle: () => [800, 1000, 850, 1100, 900].forEach((f, i) => tone(f, .07, 'sine', .12, 120, i * .08)),
  ribbit: () => { tone(180, .08, 'sawtooth', .08, 60); tone(160, .12, 'sawtooth', .08, 80, .1); },
  streak: () => [659, 880, 1175, 1568].forEach((f, i) => tone(f, .12, 'square', .07, 0, i * .06)),
  woof: () => { tone(260, .07, 'sawtooth', .05, -70); tone(280, .07, 'sawtooth', .05, -80, .2); },
};
const Voice = () => window.BonnieVoice || { say: () => {}, hush: () => {}, whenQuiet: fn => fn(), hasClips: () => false, load: () => {} };
function say(text, opts) { if (S && S.voice === false) return null; return Voice().say(fmt(text), opts); }
function hush() { Voice().hush(); }
function whenQuiet(fn) { Voice().whenQuiet(fn); }

/* =========================================================
   BONNIE
   ========================================================= */
function curls(cx, cy, R, n, r) {
  let s = '';
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; s += `<circle cx="${(cx + Math.cos(a) * R).toFixed(1)}" cy="${(cy + Math.sin(a) * R).toFixed(1)}" r="${r}"/>`; }
  return s;
}
const ear = (x, dir) => [[0, 42, 10], [dir * 3, 53, 10], [dir * 1, 64, 9.5], [dir * 4, 74, 8.5], [dir * 1, 82, 7]]
  .map(([dx, y, r]) => `<circle cx="${x + dx}" cy="${y}" r="${r}"/>`).join('');
function hatSVG(h) {
  switch (h) {
    case 'party': return '<g class="hat"><path d="M44 27 L63 -6 L78 25 Z" fill="#F07CA8" stroke="#3E2F27" stroke-width="2" stroke-linejoin="round"/><path d="M50 16 L72 19 M56 5 L68 7" stroke="#FFE07A" stroke-width="4" stroke-linecap="round"/><circle cx="63" cy="-7" r="5" fill="#FFE07A" stroke="#3E2F27" stroke-width="2"/></g>';
    case 'crown': return '<g class="hat"><path d="M40 29 L42 9 L51 20 L60 4 L69 20 L78 9 L80 29 Z" fill="#F4C25B" stroke="#8A5A14" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="22" r="3.2" fill="#E2574C"/><circle cx="49" cy="25" r="2.3" fill="#3B7FC4"/><circle cx="71" cy="25" r="2.3" fill="#3F8B5C"/></g>';
    case 'wizard': return '<g class="hat"><path d="M40 30 Q60 35 80 30 L58 -16 Z" fill="#6C4BB4" stroke="#3A2470" stroke-width="2" stroke-linejoin="round"/><ellipse cx="60" cy="30" rx="27" ry="6" fill="#6C4BB4" stroke="#3A2470" stroke-width="2"/><path d="M60 4l1.6 3.4 3.6.4-2.7 2.4.8 3.6-3.3-1.8-3.3 1.8.8-3.6-2.7-2.4 3.6-.4z" fill="#FFE07A"/><circle cx="52" cy="20" r="1.6" fill="#FFE07A"/><circle cx="67" cy="17" r="1.3" fill="#FFE07A"/></g>';
    case 'santa': return '<g class="hat"><path d="M38 29 C40 10 58 -2 78 1 C90 3 96 12 95 24 C90 17 82 13 75 14 C79 19 82 24 82 29 Z" fill="#D9443A" stroke="#8E2A22" stroke-width="2" stroke-linejoin="round"/><rect x="35" y="23" width="50" height="11" rx="5.5" fill="#fff" stroke="#D8D2CC" stroke-width="1.5"/><circle cx="95" cy="25" r="6" fill="#fff" stroke="#D8D2CC" stroke-width="1.5"/></g>';
    case 'bobble': return '<g class="hat"><path d="M38 30 Q37 3 60 3 Q83 3 82 30 Z" fill="#3B7FC4" stroke="#245A91" stroke-width="2"/><path d="M41 14 H79 M39 21 H81" stroke="#fff" stroke-width="3.5"/><rect x="35" y="25" width="50" height="10" rx="5" fill="#245A91"/><circle cx="60" cy="2" r="7" fill="#fff" stroke="#C9D6E3" stroke-width="1.5"/></g>';
    case 'flowers': return `<g class="hat"><path d="M34 33 Q60 20 86 33" stroke="#5FA35A" stroke-width="3" fill="none"/>${[[38, 30, '#F07CA8'], [49, 25, '#FFE07A'], [60, 23, '#B58BE0'], [71, 25, '#F07CA8'], [82, 30, '#FFE07A']].map(([x, y, c]) => `<g fill="${c}">${curls(x, y, 3.6, 5, 3.2)}</g><circle cx="${x}" cy="${y}" r="2.4" fill="#F4A13A"/>`).join('')}</g>`;
    case 'chef': return '<g class="hat"><g fill="#fff" stroke="#CFC8BF" stroke-width="1.6"><circle cx="47" cy="13" r="10"/><circle cx="60" cy="7" r="11"/><circle cx="73" cy="13" r="10"/><rect x="45" y="14" width="30" height="17" rx="2"/></g><path d="M45 25 H75" stroke="#CFC8BF" stroke-width="1.5"/></g>';
    case 'headphones': return '<g class="hat"><path d="M30 46 Q30 8 60 8 Q90 8 90 46" stroke="#2F3542" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="22" y="38" width="14" height="22" rx="6" fill="#E2574C" stroke="#2F3542" stroke-width="2"/><rect x="84" y="38" width="14" height="22" rx="6" fill="#E2574C" stroke="#2F3542" stroke-width="2"/></g>';
    case 'cowboy': return '<g class="hat"><path d="M44 29 Q41 6 52 7 Q60 12 68 7 Q79 6 76 29 Z" fill="#B5763A" stroke="#6E4520" stroke-width="2" stroke-linejoin="round"/><rect x="44" y="21" width="32" height="5" fill="#5A3A1A"/><path d="M22 27 Q60 40 98 27 Q100 33 92 34 Q60 42 28 34 Q20 33 22 27 Z" fill="#A0662E" stroke="#6E4520" stroke-width="2" stroke-linejoin="round"/></g>';
  }
  return '';
}
/* Neck things sit under her chin; the cape hangs behind her. */
function neckSVG(id, back) {
  if (back) return id === 'cape' ? '<path d="M40 84 Q18 104 22 122 Q60 128 98 122 Q102 104 80 84 Z" fill="#D9443A" stroke="#8E2A22" stroke-width="2" stroke-linejoin="round"/>' : '';
  const collar = (c, d) => `<path d="M36 85 Q60 98 84 85" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M36 85 Q60 98 84 85" stroke="${d}" stroke-width="1.6" fill="none" stroke-dasharray="2 5" stroke-linecap="round"/>`;
  switch (id) {
    case 'collar-red': return collar('#D9443A', '#FFD2CC') + '<circle cx="60" cy="98" r="4.5" fill="#F4C25B" stroke="#8A5A14" stroke-width="1.5"/>';
    case 'collar-blue': return collar('#3B7FC4', '#CFE3F7') + '<path d="M60 102 l-4.2-4.2a2.6 2.6 0 0 1 4.2-3 2.6 2.6 0 0 1 4.2 3z" fill="#F4C25B" stroke="#8A5A14" stroke-width="1.3"/>';
    case 'bandana': return '<path d="M35 84 Q60 95 85 84 L60 113 Z" fill="#E2574C" stroke="#9E2F27" stroke-width="1.6" stroke-linejoin="round"/><g fill="#fff"><circle cx="48" cy="91" r="1.8"/><circle cx="60" cy="96" r="1.8"/><circle cx="72" cy="91" r="1.8"/><circle cx="56" cy="104" r="1.6"/><circle cx="64" cy="104" r="1.6"/></g>';
    case 'bowtie': return '<path d="M60 92 L46 84 L46 100 Z M60 92 L74 84 L74 100 Z" fill="#8E6CD0" stroke="#3A2470" stroke-width="1.6" stroke-linejoin="round"/><circle cx="60" cy="92" r="4" fill="#6C4BB4" stroke="#3A2470" stroke-width="1.6"/>';
    case 'scarf': return '<path d="M34 83 Q60 97 86 83 L86 92 Q60 106 34 92 Z" fill="#C0392B" stroke="#7E1F16" stroke-width="1.5"/><path d="M45 89 v8 M58 92 v9 M71 89 v9" stroke="#fff" stroke-width="3"/><g transform="rotate(-12 72 96)"><rect x="66" y="94" width="11" height="22" rx="2" fill="#C0392B" stroke="#7E1F16" stroke-width="1.5"/><path d="M66 102 h11 M66 109 h11" stroke="#fff" stroke-width="3"/><path d="M67 116 v4 M71 116 v4 M75 116 v4" stroke="#C0392B" stroke-width="1.6"/></g>';
    case 'medal': return '<path d="M46 83 L58 101 M74 83 L62 101" stroke="#3B7FC4" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="105" r="8" fill="#F4C25B" stroke="#8A5A14" stroke-width="1.8"/><path d="M60 100.5l1.4 2.9 3.2.4-2.3 2.2.6 3.2-2.9-1.6-2.9 1.6.6-3.2-2.3-2.2 3.2-.4z" fill="#FFF3B0"/>';
    case 'cape': return '<circle cx="45" cy="86" r="3.5" fill="#F4C25B" stroke="#8A5A14" stroke-width="1.3"/><circle cx="75" cy="86" r="3.5" fill="#F4C25B" stroke="#8A5A14" stroke-width="1.3"/>';
  }
  return '';
}
/* Things on her face (drawn over her eyes). */
function faceSVG(id) {
  switch (id) {
    case 'eyepatch': return '<g class="hat"><path d="M37 38 Q60 30 85 44" stroke="#222" stroke-width="2.4" fill="none"/><ellipse cx="71.5" cy="52" rx="7.5" ry="6.5" fill="#222"/></g>';
    case 'sunglasses': return '<g class="hat"><path d="M38 48 L31 44 M82 48 L89 44" stroke="#111" stroke-width="2.2" stroke-linecap="round"/><rect x="38" y="44" width="21" height="14" rx="6" fill="#1E1E2A" stroke="#111" stroke-width="1.6"/><rect x="61" y="44" width="21" height="14" rx="6" fill="#1E1E2A" stroke="#111" stroke-width="1.6"/><path d="M59 49 h2" stroke="#111" stroke-width="3"/><path d="M42 48 l6 0 M65 48 l6 0" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55"/></g>';
    case 'specs': return '<g class="hat" fill="rgba(255,255,255,.18)" stroke="#6B3E1F" stroke-width="2.2"><circle cx="48.5" cy="52" r="8.5"/><circle cx="71.5" cy="52" r="8.5"/><path d="M57 51 Q60 48.5 63 51 M40 50 L33 46 M80 50 L87 46" fill="none"/></g>';
  }
  return '';
}
/* One drawing of Bonnie for every game.
   look: leave out for what she is wearing, 'none' for nothing, or one item id (a shop picture). */
function bonnieSVG(look) {
  let hat, face, neck;
  if (look === undefined) ({ hat, face, neck } = S || {});
  else { const k = slotKey(look); hat = k === 'hat' ? look : null; face = k === 'face' ? look : null; neck = k === 'neck' ? look : null; }
  return `<svg viewBox="0 0 120 124" aria-hidden="true">
    ${neckSVG(neck, true)}
    <g class="tail"><path d="M86 100 q20 -4 20 -24" fill="none" stroke="var(--fur-dk)" stroke-width="10" stroke-linecap="round"/><g fill="var(--fur-dk)">${curls(106, 74, 5, 5, 5)}</g></g>
    <g fill="var(--fur)"><ellipse cx="60" cy="102" rx="31" ry="19"/>${curls(60, 102, 22, 12, 7)}</g>
    <g fill="var(--fur-lt)" opacity=".55">${curls(60, 104, 10, 6, 4)}</g>
    ${neckSVG(neck)}
    <g class="head">
      <g fill="var(--fur-dk)"><g class="ear-l">${ear(33, -1)}</g><g class="ear-r">${ear(87, 1)}</g></g>
      <g fill="var(--fur)"><circle cx="60" cy="52" r="25"/>${curls(60, 50, 23, 14, 7.5)}</g>
      <g fill="var(--fur-lt)" opacity=".6">${curls(60, 30, 7, 6, 4.5)}</g>
      <ellipse cx="60" cy="66" rx="16" ry="12.5" fill="var(--fur-lt)"/>
      <g class="eyes"><circle cx="48.5" cy="52" r="4.2" fill="#24160e"/><circle cx="71.5" cy="52" r="4.2" fill="#24160e"/><circle cx="50" cy="50.4" r="1.4" fill="#fff"/><circle cx="73" cy="50.4" r="1.4" fill="#fff"/></g>
      <ellipse class="tongue" cx="60" cy="75" rx="4.6" ry="6.5" fill="#ef7b8f"/>
      <ellipse cx="60" cy="61" rx="5.8" ry="4.2" fill="#24160e"/><ellipse cx="58.2" cy="59.8" rx="1.6" ry="1" fill="#6b5446"/>
      <path d="M60 65.2v4M52.5 68.6q7.5 5.4 15 0" stroke="#24160e" stroke-width="2" fill="none" stroke-linecap="round"/>
      ${faceSVG(face)}
      ${hatSVG(hat)}
    </g>
  </svg>`;
}
const bonnieHTML = (cls = '', id = '', hat) => `<div class="bonnie ${cls}" ${id ? `id="${id}"` : ''} role="button" tabindex="0" aria-label="Bonnie the dog">${bonnieSVG(hat)}</div>`;

/* =========================================================
   FX
   ========================================================= */
function animate(el, cls, ms = 700) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms); }
function hearts(el, emoji = '💖', n = 4) {
  if (!el || reduceMotion()) return; const r = el.getBoundingClientRect();
  for (let i = 0; i < n; i++) { const h = document.createElement('div'); h.className = 'heart'; h.textContent = emoji;
    h.style.left = (r.left + r.width * (.2 + Math.random() * .6)) + 'px'; h.style.top = (r.top + r.height * .2) + 'px';
    h.style.animationDelay = (i * .12) + 's'; document.body.appendChild(h); setTimeout(() => h.remove(), 1600); }
}
/* Tickling Bonnie. Lots of quick tickles in a row (EGG_TAPS, each within 2 seconds of the last)
   set off the Easter egg: a spinning jump, a shower of bones, paws and stars, and a special line. */
const EGG_TAPS = 10;
let tickN = 0, tickAt = 0;
function tickleEgg() { const now = Date.now(); tickN = now - tickAt < 2000 ? tickN + 1 : 1; tickAt = now;
  if (tickN < EGG_TAPS) return false; tickN = 0; return true; }
function tickle(el) {
  if (tickleEgg()) {
    animate(el, 'bonnie-spin', 1300); sfx.fanfare();
    ['🦴', '🐾', '⭐', '💖'].forEach((e, i) => setTimeout(() => hearts(el, e, 4), i * 150));
    return fmt(rand(LINES.tickleEgg));
  }
  animate(el, 'giggle', 900); sfx.giggle(); hearts(el); return fmt(rand(LINES.tickles));
}
function banner(text) { const b = document.createElement('div'); b.className = 'banner'; b.innerHTML = text; document.body.appendChild(b); setTimeout(() => b.remove(), 2500); }
function shakeScreen() { if (!reduceMotion()) animate($('#screen'), 'shake', 420); }
function confetti(n = 40) {
  if (reduceMotion()) return;
  const bits = ['🦴', '🌼', '⭐', '🦋', '🌸', '🍃'];
  for (let i = 0; i < n; i++) { const c = document.createElement('div'); c.className = 'confetti'; c.textContent = rand(bits);
    c.style.left = Math.random() * 100 + 'vw'; c.style.animationDuration = (2.2 + Math.random() * 2) + 's'; c.style.animationDelay = (Math.random() * .8) + 's';
    document.body.appendChild(c); setTimeout(() => c.remove(), 5200); }
}
/* Adds bones to the bowl, with bones flying from the element to the counter.
   also(save) makes another change in the same save, so the two can never be split by a refresh. */
function addBones(n, fromEl, label, also) {
  if (n <= 0) return;
  mutate(s => { s.bones += n; if (also) also(s); });
  const chip = $('#boneChip'); if (!chip) return;
  if (fromEl && !reduceMotion()) {
    const r = fromEl.getBoundingClientRect(), t = chip.getBoundingClientRect();
    for (let i = 0; i < Math.min(n, 8); i++) {
      const b = document.createElement('div'); b.className = 'fly'; b.textContent = '🦴';
      b.style.left = (r.left + r.width / 2 - 14 + (Math.random() * 40 - 20)) + 'px'; b.style.top = (r.top + r.height / 2 - 14) + 'px';
      document.body.appendChild(b);
      setTimeout(() => { b.style.transform = `translate(${t.left - r.left - r.width / 2 + 20}px, ${t.top - r.top - r.height / 2}px) scale(.6) rotate(360deg)`; b.style.opacity = '.3'; }, 30 + i * 70);
      setTimeout(() => { b.remove(); animate(chip, 'bump', 450); sfx.coin(); }, 850 + i * 70);
    }
    const f = document.createElement('div'); f.className = 'float-plus'; f.textContent = `+${n} 🦴${label ? ' ' + label : ''}`;
    f.style.left = (r.left + r.width / 2 - 30) + 'px'; f.style.top = (r.top - 10) + 'px'; document.body.appendChild(f); setTimeout(() => f.remove(), 1100);
  } else { animate(chip, 'bump', 450); sfx.coin(); }
}

/* Drag or tap, with pointer events (mouse, touch and pen). For worlds that drag tiles. */
function draggable(el, { onTap, onDrop, dropSel, ignore }) {
  el.addEventListener('pointerdown', e => {
    if (e.button > 0 || (ignore && e.target.closest(ignore))) return;
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY, r = el.getBoundingClientRect(), offX = sx - r.left, offY = sy - r.top;
    let ghost = null, hover = null;
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
    const move = ev => {
      if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) {
        ghost = el.cloneNode(true); ghost.classList.add('drag-ghost'); ghost.classList.remove('snap', 'glow');
        ghost.style.width = r.width + 'px'; ghost.style.height = r.height + 'px'; document.body.appendChild(ghost);
        el.classList.add('dragging'); sfx.pick();
      }
      if (ghost) {
        ghost.style.left = (ev.clientX - offX) + 'px'; ghost.style.top = (ev.clientY - offY) + 'px';
        const under = document.elementFromPoint(ev.clientX, ev.clientY), t = under && under.closest(dropSel);
        if (t !== hover) { hover && hover.classList.remove('drop-hover'); hover = t; hover && hover.classList.add('drop-hover'); }
      }
    };
    const up = ev => {
      el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      hover && hover.classList.remove('drop-hover');
      if (ghost) {
        ghost.remove(); el.classList.remove('dragging');
        if (ev.type === 'pointerup') { const under = document.elementFromPoint(ev.clientX, ev.clientY); onDrop && onDrop(under && under.closest(dropSel)); }
      } else if (ev.type === 'pointerup') onTap && onTap();
    };
    el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });
}

/* =========================================================
   PAGE FRAME: top bar, meadow, screens, modal
   ========================================================= */
let GAME = null;   // the game this page is showing (from startGame)
let G = null;      // the level being played
let streak = 0;    // a treat to watch; it pays nothing extra

function addStyle(css, id) {
  if (id && document.getElementById(id)) return;
  const st = document.createElement('style'); if (id) st.id = id; st.textContent = css; document.head.appendChild(st);
}
function show(html) { hush(); const s = $('#screen'); s.innerHTML = html; window.scrollTo(0, 0); return s; }
function renderHud() {
  if (!GAME || !$('#boneNum')) return;
  $('#boneNum').textContent = S.bones;
  const title = GAME.walk ? GAME.title : `${nameOf()}'s ${GAME.title}`;
  $('#appTitle').textContent = title; document.title = title;
  $('#streakNum').textContent = streak;
  $('#streakChip').classList.toggle('hot', streak >= 3);
}
function applyTheme() { document.body.dataset.theme = (S && S.theme) || 'day'; }
function refreshBonnies() { $$('.bonnie').forEach(b => { if (!b.closest('.hatprev')) b.innerHTML = bonnieSVG(); }); }

function modal(inner, onAction) {
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<div class="card modal" role="dialog" aria-modal="true">${inner}</div>`;
  document.body.appendChild(bg);
  bg.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (!b) return; const keep = onAction ? onAction(b.dataset.a, bg) : false; if (keep !== true) bg.remove(); });
  return bg;
}
/* A button a grown-up has to hold for 3 seconds (letting go early resets it). */
const holdBtn = label => `<button class="btn hold" type="button" data-hold data-label="${esc(label)}"><span class="fill"></span><span class="lbl">${esc(label)}</span></button>`;
function wireHold(root, onDone) {
  let el = null, t = null;
  const cancel = () => { if (!el) return; clearTimeout(t); el.classList.remove('holding'); $('.lbl', el).textContent = el.dataset.label; el = null; };
  root.addEventListener('pointerdown', e => {
    const h = e.target.closest('[data-hold]'); if (!h) return;
    e.preventDefault(); cancel(); el = h;
    try { h.setPointerCapture(e.pointerId); } catch (_) {}
    h.classList.add('holding'); $('.lbl', h).textContent = 'Keep holding…';
    t = setTimeout(() => { const x = el; el = null; if (x) x.classList.remove('holding'); onDone(); }, 3000);
  });
  root.addEventListener('pointerup', cancel); root.addEventListener('pointercancel', cancel);
  root.addEventListener('contextmenu', e => { if (e.target.closest('[data-hold]')) e.preventDefault(); });
}

/* =========================================================
   HOME (pick a world) and WORLD MAP (pick a level)
   ========================================================= */
function homeScreen() {
  G = null;
  const greet = fmt(rand(GAME.greets));
  const ws = visibleWorlds(GAME.subject);
  show(`
    <div class="card hero">
      ${bonnieHTML('big', 'homeBonnie')}
      <div>
        <h1>${esc(nameOf())}'s ${esc(GAME.title)}</h1>
        <p id="homeSay">${esc(greet)}</p>
        <p class="note" style="font-family:var(--font-ui);margin-top:8px">Tap Bonnie to tickle her! 🐾</p>
      </div>
    </div>
    <div class="worlds">
      ${ws.map((w, i) => { const s = worldStars(w), max = w.levels.length * 3; return `
        <button class="card world-card" data-w="${esc(w.id)}">
          ${s === max ? '<span class="ribbon">MASTERED</span>' : ''}
          <div class="wicon" style="background:${w.tint || '#F4ECDC'}">${w.icon || '🌼'}</div>
          <h3>World ${i + 1}: ${esc(w.name)}</h3>
          <div class="sub">${esc(w.tag || w.blurb || '')}</div>
          ${ws.some(x => x.year !== w.year) ? `<div class="note">Year ${w.year}</div>` : ''}
          <div class="wstars">⭐ ${s} / ${max}</div>
        </button>`; }).join('') || '<p class="note on-bg">No worlds to show yet.</p>'}
    </div>
    <div class="home-actions">
      <button class="btn green" id="goShop">🛍️ Bone Shop</button>
      <button class="btn ghost" id="goParent">🔒 Grown-ups</button>
    </div>`);
  const hb = $('#homeBonnie');
  hb.onclick = () => { const t = tickle(hb); $('#homeSay').textContent = t; say(t, { pitch: 1.4 }); };
  $$('.world-card').forEach(b => b.onclick = () => { sfx.pop(); worldScreen(b.dataset.w); });
  $('#goShop').onclick = () => shopScreen({ welcome: true });
  $('#goParent').onclick = () => { parentFromClub = false; parentGate(); };
  setTimeout(() => say(greet), 250);
}

function worldScreen(id) {
  G = null;
  const w = worldById(id); if (!w) return homeScreen();
  show(`
    <div class="card map">
      <div class="map-head">
        <button class="icon-btn" id="back">← Worlds</button>
        <div style="font-size:2.4rem">${w.icon || ''}</div>
        <h2>${esc(w.name)}</h2>
      </div>
      ${w.intro ? `<p class="world-intro">${w.intro}</p>` : ''}
      <div class="path">
        ${w.levels.map((L, l) => { const un = levelUnlocked(w, l), st = starsOf(w, L); return `
          <button class="stone ${un ? '' : 'locked'}" data-l="${l}" ${un ? '' : 'aria-disabled="true"'}>
            <div class="num" style="background:${w.color || 'var(--leaf)'}">${un ? l + 1 : '🔒'}</div>
            <div><div class="lt">Level ${l + 1}: ${esc(L.name)}</div>
            ${L.blurb ? `<div class="lb">${esc(L.blurb)}${L.eg ? ` <span class="eg">${esc(L.eg)}</span>` : ''}</div>` : ''}
            ${playedLevel(w, L) ? `<div class="ls" aria-label="${plural(st, 'star')}">${'⭐'.repeat(st)}${'☆'.repeat(3 - st)}</div>` : un ? '<div class="new-badge">New!</div>' : ''}</div>
          </button>`; }).join('')}
      </div>
    </div>`);
  $('#back').onclick = homeScreen;
  $$('.stone').forEach(b => b.onclick = () => {
    const l = +b.dataset.l;
    if (!levelUnlocked(w, l)) { sfx.wrong(); animate(b, 'bad', 450); say(LINES.locked); return; }
    sfx.pop(); startLevel(w.id, w.levels[l].id);
  });
}

/* =========================================================
   PLAYING A LEVEL
   ========================================================= */
function hintNames(w) { return w.hintNames || DEFAULT_HINTS; }
/* The help tier from which a question counts as "helped" for stars.
   Words: Bonnie shows the answer (tier 4). Maths sets helpFrom: 2 (step card or glowing buttons). */
function helpFrom(w) { return w.helpFrom || hintNames(w).length; }
function tierNames(w) { return w.tierNames || ['On their own', ...hintNames(w)]; }

function startLevel(worldId, levelId) {
  const w = worldById(worldId), li = w ? w.levels.findIndex(L => L.id === levelId) : -1;
  if (li < 0) return homeScreen();
  const L = w.levels[li];
  const count = L.count || (L.seq && L.seq.length) || w.perLevel || (L.items ? 6 : 8);
  const key = keyOf(w, L);
  S = load();
  // Bones v1.1: decided now, for the whole run. A normal run is only counted when it pays its first answer bone.
  const extra = runsToday(S, key) >= RULES.NORMAL_RUNS_PER_DAY;
  G = { w, L, li, key, i: 0, count, items: L.items ? shuffle(L.items).slice(0, count) : null,
    mistakes: 0, helps: 0, answerBones: 0, askBones: 0, asked: false, tiers: tierNames(w).map(() => 0), eased: 0, done: false,
    extra, counted: false, extraBones: 0 };
  G.count = G.items ? G.items.length : count;
  // maths warm-ups: 2 easy questions of this level's own types first; they don't count for stars
  G.warmN = !G.items && w.warmUps && S.settings.warmUps ? 2 : 0; G.warm = 0;
  G.warmTypes = L.seq ? shuffle([...new Set(L.seq)]).slice(0, 2) : [];
  while (G.warmTypes.length < G.warmN) G.warmTypes.push(L.seq ? G.warmTypes[0] : undefined);
  G.teachAt = !G.items && w.teach && S.settings.teachBonnie ? teachAt(G.count) : -1; G.taught = false;
  const full = w.layout === 'full';
  show(`
    <div class="game-top">
      <button class="icon-btn" id="back">← Map</button>
      <div class="gt">${w.icon || ''} ${esc(w.name)} · Level ${li + 1}</div>
      ${extra ? '<div class="chip extra" id="extraChip" title="Plays after the first 2 today: no bones per answer, 3 bonus bones for finishing">🎯 Extra practice</div>' : ''}
      <div class="pips" id="pips"></div>
    </div>
    <div class="game-main ${full ? 'full' : ''}">
      <section class="card play-card" id="area"></section>
      ${full ? '' : dockHTML(w)}
    </div>`);
  $('#back').onclick = () => worldScreen(w.id);
  if (!full) { $('#gameBonnie').onclick = askBonnie; $('#askBtn').onclick = askBonnie; }
  nextQuestion();
}
/* Teach Bonnie in a maths level: which question (from the 2nd on) asks for one, or -1 for none (about half of levels).
   If that question can't be one (it isn't a single number answer), the next ones are asked instead. */
function teachAt(count) { return count > 1 && Math.random() < TEACH_LEVEL_CHANCE ? 1 + Math.floor(Math.random() * (count - 1)) : -1; }
const TEACH_LEVEL_CHANCE = 0.5;
/* Bonnie beside the question, with Ask Bonnie and the hint ladder (worlds that aren't full width). */
function dockHTML(w) {
  return `<aside class="card dock">
        <div class="bubble" id="bubble" aria-live="polite"></div>
        ${bonnieHTML('', 'gameBonnie')}
        <button class="btn small green" id="askBtn">🐾 Ask Bonnie</button>
        <div class="ladder" title="Hint ladder"><span>Hints</span>${hintNames(w).map((_, i) => `<span class="rung" data-r="${i + 1}">${i + 1}</span>`).join('')}</div>
      </aside>`;
}
function renderPips() {
  if (G && G.walk) return renderPath();
  if (!G || !$('#pips')) return;
  $('#pips').innerHTML = Array.from({ length: G.count }, (_, i) => `<span class="pip ${i < G.i ? 'done' : i === G.i && !G.qWarm ? 'now' : ''}"></span>`).join('');
  $$('.rung').forEach(r => r.classList.toggle('on', +r.dataset.r <= G.tier));
}
function bubble(text, speak = true) {
  const b = $('#bubble'); if (!b) return;
  b.innerHTML = text; animate(b, 'pop', 350);
  if (speak) say(b.textContent);
}
/* Run fn after ms, once Bonnie has finished talking, if the same question is still on screen. */
function later(fn, ms = 0) { const g = G, i = G && G.i; setTimeout(() => whenQuiet(() => { if (G && G === g && G.i === i && !G.busy) fn(); }), ms); }

function nextQuestion() {
  if (!G) return;
  if (G.walk) return walkStep();
  if (G.i >= G.count) return finishLevel();
  const warm = G.warm < G.warmN;
  Object.assign(G, { tier: 0, qTier: 0, busy: false, hints: [], qWarm: warm });
  renderPips();
  const eased = warm || learner.rung < 0;
  // fresh: the first question of the run (a world can start its "no repeats" list again)
  const q = G.items ? G.items[G.i] : warm
    ? G.L.make({ eased: true, warm: true, fresh: G.warm === 0, index: G.warm, count: G.warmN, level: G.L, world: G.w, type: G.warmTypes[G.warm] })
    : G.L.make({ eased, fresh: G.i === 0 && !G.warmN, index: G.i, count: G.count, level: G.L, world: G.w, type: G.L.seq ? G.L.seq[G.i] : undefined,
      teach: !G.taught && G.teachAt > 0 && G.i >= G.teachAt });
  if (q && q.teach) G.taught = true;
  G.q = q; G.qEased = !G.items && !warm && eased;
  (G.L.play || G.w.play)(q, ctx());
  if (G.extra && G.i === 0 && G.warm === 0) bubble(esc(fmt(LINES.extraPractice)));
  if (warm && G.warm === 0 && !G.extra) say(LINES.warmUp);
}
/* What a world's play() gets, besides the Meadow API. */
function ctx() {
  const warm = !!G.qWarm;
  return { area: $('#area'), world: G.w, level: G.L, index: warm ? G.warm : G.i, count: warm ? G.warmN : G.count, eased: G.qEased, q: G.q,
    warm, first: warm ? G.warm === 0 : G.i === 0 && !G.warmN, walk: !!G.walk,
    bubble, later, hints: list => { G.hints = list || []; } };
}
/* Bonnie's help ladder. A world can take over with onAsk(ctx) (Maths does). */
function askBonnie() {
  if (!G || G.busy || G.done) return;
  const bon = $('#gameBonnie');
  animate(bon, 'wiggle', 600);
  if (G.w.onAsk) G.w.onAsk(ctx());
  else {
    const names = hintNames(G.w);
    if (G.tier >= names.length) { bubble(fmt(LINES.shownAll)); return; }
    const t = G.tier + 1, fn = G.hints[t - 1], txt = fn ? fn() : '';
    helped(t);
    bubble(`<b>${names[t - 1]}</b> ${txt}`);
  }
  askedBonnie(bon);
}
function askedBonnie(el) {
  if (!G || G.asked) return;
  G.asked = true; G.askBones += RULES.ASK_BONES;
  addBones(RULES.ASK_BONES, el || $('#gameBonnie') || $('#area'), 'for asking!');
}
/* Bonnie's help for this question reached this tier. */
function helped(tier) {
  if (!G) return;
  G.tier = Math.max(G.tier, tier); G.qTier = Math.max(G.qTier, tier);
  renderPips();
}
function correct(el, opts = {}) {
  if (!G || G.busy || G.done) return false;
  G.busy = true;
  const wasHelped = G.qTier >= helpFrom(G.w);
  if (!G.qWarm && !G.walk) { // warm-ups and walks don't count for stars, the help log or the quiet easing
    if (wasHelped) G.helps++;
    G.tiers[Math.min(G.qTier, G.tiers.length - 1)]++;
    if (G.qEased) G.eased++;
    learner.note(wasHelped);
  }
  sfx.correct(); shakeScreen();
  if (!wasHelped) {
    streak++;
    if (streak === 3) { banner('🔥 3 in a row!'); sfx.streak(); }
    else if (streak === 5) { banner('🌟 5 in a row! Super streak!'); sfx.streak(); }
    else if (streak > 5 && streak % 5 === 0) { banner(`🚀 ${streak} in a row! Unstoppable!`); sfx.streak(); }
  }
  if (!G.extra) { // extra practice runs pay at the end instead
    const first = !G.counted, key = G.key;
    G.counted = true;
    G.answerBones += RULES.ANSWER_BONES;
    // the first answer bone uses up one of today's normal runs, in the same save as the bone
    addBones(RULES.ANSWER_BONES, el || $('#area'), '', first ? s => { const d = rollDay(s); d.normalRuns[key] = (d.normalRuns[key] || 0) + 1; } : null);
  }
  renderHud();
  const bon = $('#gameBonnie'); animate(bon, 'happy', 550); hearts(bon, '⭐', 3);
  const praise = opts.praise != null ? fmt(opts.praise) : wasHelped ? fmt(LINES.watched) : fmt(rand(G.w.praise || LINES.praise));
  bubble(esc(praise), false);
  say((opts.sayFirst ? opts.sayFirst + '! ' : '') + praise);
  if (opts.auto !== false) { // move on once Bonnie has finished her well-done (and at least 1.6s)
    const round = G, i = G.i, t0 = Date.now();
    whenQuiet(() => setTimeout(() => { if (G === round && G.i === i) next(); }, Math.max(500, 1600 - (Date.now() - t0))));
  }
  return true;
}
/* Go to the next question (after correct() with auto:false). */
function next() { if (!G || G.done) return; if (G.qWarm) G.warm++; else G.i++; nextQuestion(); }
/* For worlds: is a right answer being celebrated (or the level over)? */
function isBusy() { return !G || G.busy || G.done; }
/* For worlds: the question being played. helped: Bonnie's help has reached the level that counts as help. */
function round() { return G ? { index: G.qWarm ? G.warm : G.i, count: G.qWarm ? G.warmN : G.count, warm: !!G.qWarm, tier: G.qTier, helped: G.qTier >= helpFrom(G.w), busy: G.busy } : null; }
function wrong(msg, opts = {}) {
  if (!G || G.busy || G.done) return;
  if (G.walk) return walkWrong(opts);
  if (!G.qWarm) G.mistakes++; // a warm-up mistake doesn't count
  streak = 0; renderHud(); sfx.wrong();
  animate($('#gameBonnie'), 'wiggle', 600);
  if (!opts.quiet) bubble(fmt(msg || rand(LINES.oops))); // msg may contain <b> (worlds escape their own words)
}

function finishLevel() {
  if (!G || G.done) return;
  G.done = true; G.busy = true; hush();
  const { w, L, li, key } = G;
  const stars = RULES.starsFor({ mistakes: G.mistakes, helps: G.helps });
  let prev = 0;
  mutate(s => { prev = s.stars[key] || 0; s.stars[key] = Math.max(prev, stars); s.logs[key] = { tiers: G.tiers, eased: G.eased, when: todayGB() };
    if (stars > prev) s.starLog.push({ key, from: prev, to: stars, day: localDay() }); });
  const bonus = RULES.starBonus(stars, prev), newStars = Math.max(0, stars - prev);
  if (G.extra) { G.extraBones = RULES.EXTRA_RUN_BONES; addBones(G.extraBones, $('#area'), 'extra practice!'); }
  if (bonus) addBones(bonus, $('#area'), 'star bonus!');
  confetti(); sfx.fanfare();
  const hasNext = li < w.levels.length - 1;
  const msg = fmt(LINES.finish[stars]);
  const extra = bonus ? '' : prev >= 3 ? LINES.already3 : LINES.stillBest[prev] || '';
  const total = G.answerBones + G.askBones + G.extraBones + bonus;
  const parts = [G.extra ? `${G.extraBones} extra practice bones` : `${G.answerBones} for answers`];
  if (G.askBones) parts.push(`${G.askBones} for asking Bonnie`);
  parts.push(bonus ? `${bonus} star bonus (${plural(newStars, 'new star')})` : 'no star bonus this time');
  modal(`
    ${bonnieHTML('', 'endBonnie')}
    <h2>Level complete!</h2>
    <div class="stars-big" aria-label="${plural(stars, 'star')}">${[0, 1, 2].map(i => `<span class="${i < stars ? 'on' : 'off'}" style="animation-delay:${.2 + i * .25}s">${i < stars ? '⭐' : '☆'}</span>`).join('')}</div>
    <p>${esc(msg)}</p>
    ${extra ? `<p class="kind">${esc(extra)}</p>` : ''}
    <p class="earned"><b>🦴 ${total} bones</b> earned this level!</p>
    <p class="note">${parts.join(' · ')}</p>
    <div class="btns">
      ${hasNext ? '<button class="btn green" data-a="next">Next level →</button>' : ''}
      <button class="btn ghost" data-a="again">Play again</button>
      <button class="btn ghost" data-a="map">${esc(w.name)}</button>
    </div>`, a => {
    if (a === 'next') startLevel(w.id, w.levels[li + 1].id);
    else if (a === 'again') startLevel(w.id, L.id);
    else worldScreen(w.id);
  });
  const eb = $('#endBonnie'); eb.style.margin = '0 auto'; animate(eb, 'happy', 600);
  say([msg, extra, G.extra ? LINES.extraDone : ''].filter(Boolean).join(' '));
}

/* =========================================================
   BONNIE'S WALK: 5 quick questions, English and maths mixed
   Nothing can be failed: no stars, no mistakes counted, and a wrong answer
   just moves Bonnie's help up a rung until the answer is found.
   Bones follow v1.1 under the id walk/daily: the first 2 walks a day pay
   1 per right answer and a walk bonus; later walks pay 3 for finishing.
   ========================================================= */
const WALK_KEY = 'walk/daily';
const WALK_MIXES = { gentle: 'EMEME', even: 'MEMEM', more: 'MMEMM' };
const WALK_MIX_NAMES = { gentle: 'Gentle: 3 English, 2 maths', even: 'Even: 2 English, 3 maths', more: 'More maths: 1 English, 4 maths' };
const WALK_BONUS = 5;
/* Quick-tap questions only: the number pad or tap an answer (no dragging, building or breaking blocks). */
const walkable = q => !!q && ((q.kind === 'boxes' && !q.inter) || q.kind === 'choice');
/* English: any level with a star (normal difficulty); a new player gets each world's first level. */
function walkEnglishPool() {
  const ws = visibleWorlds('english').filter(w => w.walk !== false);
  const ok = L => Array.isArray(L.items) && L.items.length;
  const starred = ws.flatMap(w => w.levels.filter(L => ok(L) && starsOf(w, L) > 0).map(L => ({ w, L })));
  return starred.length ? starred : ws.filter(w => ok(w.levels[0])).map(w => ({ w, L: w.levels[0] }));
}
/* Maths: the first 2 levels of each world, plus any level with a star (Captain's Cove has walk: false). */
function walkMathsPool() {
  return visibleWorlds('maths').filter(w => w.walk !== false)
    .map(w => ({ w, levels: w.levels.filter((L, i) => typeof L.make === 'function' && (i < 2 || starsOf(w, L) > 0)) })).filter(x => x.levels.length);
}
/* An easy, quick-tap question from this maths level, or null if it has none. */
function walkMaths(w, L, teach = false) {
  const types = L.seq ? shuffle([...new Set(L.seq)]) : [undefined];
  const mk = (type, tb) => L.make({ eased: true, walk: true, fresh: true, index: 0, count: 1, level: L, world: w, type, teach: tb });
  // teach: a Teach Bonnie question if this level can make one, otherwise a normal one
  if (teach && w.teach) for (const type of types) for (let n = 0; n < 3; n++) { const q = mk(type, true); if (walkable(q) && q.teach) return q; }
  for (const type of types) for (let n = 0; n < 5; n++) { const q = mk(type, false); if (walkable(q)) return q; }
  return null;
}
/* Has he finished a walk before? (The very first walk stays simple: no Teach Bonnie.) */
const walkedBefore = () => !!(S.walks.last || Object.keys(S.walks.days).length);
/* The 5 stops: [{ w, L, q }] in the order of the mix. */
function planWalk() {
  const mix = WALK_MIXES[S.settings.walkMix] || WALK_MIXES.gentle;
  const needM = [...mix].filter(c => c === 'M').length;
  // maths: one level from each world in turn, starting after the world the last walk started with
  let worlds = walkMathsPool();
  const at = worlds.findIndex(x => x.w.id === S.walks.topic);
  if (at >= 0) worlds = [...worlds.slice(at + 1), ...worlds.slice(0, at + 1)];
  const maths = [], used = new Set();
  // Teach Bonnie: one maths stop, chosen at random (if that level can't make one, the next maths stop tries)
  let teachFrom = S.settings.teachBonnie && walkedBefore() && needM ? Math.floor(Math.random() * needM) : Infinity, taught = false;
  for (let lap = 0; lap < 3 && maths.length < needM; lap++) for (const x of worlds) {
    if (maths.length >= needM) break;
    for (const L of shuffle(x.levels)) {
      if (used.has(keyOf(x.w, L))) continue;
      const q = walkMaths(x.w, L, !taught && maths.length >= teachFrom); if (!q) continue;
      if (q.teach) taught = true;
      used.add(keyOf(x.w, L)); maths.push({ w: x.w, L, q }); break;
    }
  }
  // the chosen stop's level had no single-number questions: try the earlier stops' levels
  for (let i = 0; !taught && teachFrom < Infinity && i < maths.length; i++) {
    const m = maths[i], q = walkMaths(m.w, m.L, true);
    if (q && q.teach) { m.q = q; taught = true; }
  }
  // English: different levels where possible, and never the same question twice
  const eng = shuffle(walkEnglishPool()), seen = new Set();
  let e = 0;
  const english = () => {
    if (!eng.length) return null;
    const { w, L } = eng[e++ % eng.length];
    const fresh = L.items.filter(it => !seen.has(it)), item = rand(fresh.length ? fresh : L.items);
    seen.add(item); return { w, L, q: item };
  };
  const plan = [];
  for (const c of mix) plan.push((c === 'M' ? maths.shift() : english()) || english() || maths.shift());
  return plan.filter(Boolean);
}
function startWalk() {
  S = load(); hush();
  const plan = planWalk();
  if (!plan.length) { show('<div class="card"><p>No questions for a walk yet.</p></div>'); return; }
  const firstMaths = plan.find(p => p.w.subject === 'maths');
  if (firstMaths) mutate(s => { s.walks.topic = firstMaths.w.id; });
  const extra = runsToday(S, WALK_KEY) >= RULES.NORMAL_RUNS_PER_DAY;
  G = { walk: true, plan, w: plan[0].w, L: plan[0].L, li: 0, key: WALK_KEY, i: 0, count: plan.length, items: null,
    mistakes: 0, helps: 0, answerBones: 0, askBones: 0, asked: false, tiers: [0, 0, 0, 0, 0], eased: 0, done: false,
    extra, counted: false, extraBones: 0, walkBones: 0, warmN: 0, warm: 0, tier: 0, qTier: 0, hints: [], busy: false };
  show(`
    ${extra ? '<div class="game-top"><div class="chip extra" id="extraChip" title="Walks after the first 2 today: no bones per answer, 3 bonus bones for finishing">🎯 Extra walk</div></div>' : ''}
    <div class="card walk-path" id="walkPath" role="progressbar" aria-label="Bonnie's walk" aria-valuemin="0" aria-valuemax="${plan.length}" aria-valuenow="0">
      <div class="walk-track" id="walkTrack">
        ${plan.map((_, i) => `<div class="wstone" data-s="${i}"><span>🐾</span></div>`).join('')}
        <div class="wbowl" title="The bone bowl at the end">🦴</div>
        <div class="walker" id="walker" aria-hidden="true">${bonnieSVG()}</div>
      </div>
    </div>
    <div id="walkQ"></div>`);
  renderPath();
  const hello = fmt(rand(LINES.walkStart));
  $('#walkQ').innerHTML = `<div class="card walk-hello"><p>${esc(hello)}</p></div>`;
  say(hello);
  if (extra) whenQuiet(() => say(LINES.extraPractice));
  const g = G; setTimeout(() => whenQuiet(() => { if (G === g && !G.done && !$('#area')) walkStep(); }), 900); // (skipHello may have shown it already)
}
/* Put Bonnie on the stone she's at, and colour the stones behind her. */
function renderPath() {
  const track = $('#walkTrack'); if (!G || !track) return;
  $$('.wstone', track).forEach((s, i) => { s.classList.toggle('done', i < G.i); s.classList.toggle('now', i === G.i); });
  const at = G.i < G.count ? $$('.wstone', track)[G.i] : $('.wbowl', track), wk = $('#walker');
  if (at && wk) wk.style.transform = `translateX(${at.offsetLeft + at.offsetWidth / 2 - wk.offsetWidth / 2}px)`;
  $('#walkPath').setAttribute('aria-valuenow', String(Math.min(G.i, G.count)));
  $$('.rung').forEach(r => r.classList.toggle('on', +r.dataset.r <= G.tier));
}
/* Show the next stop's question in its own world's screen; the path stays put. */
function walkStep() {
  if (G.i >= G.count) return finishWalk();
  const p = G.plan[G.i];
  G.w = p.w; G.L = p.L; G.q = p.q; G.qEased = p.w.subject === 'maths';
  Object.assign(G, { tier: 0, qTier: 0, busy: false, hints: [], qWarm: false });
  const full = G.w.layout === 'full';
  $('#walkQ').innerHTML = `<div class="game-main walk-in ${full ? 'full' : ''}"><section class="card play-card" id="area"></section>${full ? '' : dockHTML(G.w)}</div>`;
  if (!full) { $('#gameBonnie').onclick = askBonnie; $('#askBtn').onclick = askBonnie; }
  renderPath();
  (G.L.play || G.w.play)(G.q, ctx());
}
/* A wrong answer in a walk: no mistake counted, a kind word, and Bonnie's help goes up a rung by itself.
   (Maths climbs its own ladder and calls this quietly.) */
function walkWrong(opts) {
  streak = 0; renderHud(); sfx.wrong();
  animate($('#gameBonnie'), 'wiggle', 600);
  if (opts.quiet || G.w.onAsk) return;
  const lead = fmt(rand(LINES.walkOops)), names = hintNames(G.w);
  if (G.tier >= names.length) { bubble(`${esc(lead)} ${esc(fmt(LINES.shownAll))}`, false); say(lead); whenQuiet(() => say(LINES.shownAll)); return; }
  const tier = G.tier + 1, fn = G.hints[tier - 1], txt = fn ? fn() : '';
  helped(tier);
  bubble(`${esc(lead)}<br><b>${names[tier - 1]}</b> ${txt}`, false);
  say(lead);
  const g = G, i = G.i, hint = document.createElement('div'); hint.innerHTML = `${names[tier - 1]}. ${txt}`;
  whenQuiet(() => { if (G === g && G.i === i && !G.busy) say(hint.textContent); });
}
/* The walk is finished: the walk bonus (or the extra-walk bones), the streak and the paw stamp. */
function recordWalk(s) {
  const t = localDay(), w = s.walks;
  w.days[t] = (w.days[t] || 0) + 1;
  if (!w.last || t > w.last) { w.streak = w.last && shiftDay(w.last, 1) === t ? w.streak + 1 : 1; w.last = t; }
  // the same day adds nothing; a clock moved back (t before last) changes nothing either
  const keep = shiftDay(t, -WALK_DAYS_KEPT);
  Object.keys(w.days).forEach(d => { if (d < keep) delete w.days[d]; });
}
function finishWalk() {
  if (!G || G.done) return;
  G.done = true; G.busy = true; hush();
  const before = S.walks.streak, from = $('#walkPath');
  renderPath();
  if (G.extra) { G.extraBones = RULES.EXTRA_RUN_BONES; addBones(G.extraBones, from, 'extra walk!', recordWalk); }
  else { G.walkBones = WALK_BONUS; addBones(G.walkBones, from, 'walk bonus!', recordWalk); }
  const days = S.walks.streak, up = days > before && days >= 2;
  confetti(); sfx.fanfare();
  const msg = fmt(rand(LINES.walkDone));
  const total = G.answerBones + G.askBones + G.extraBones + G.walkBones;
  const parts = [G.extra ? `${G.extraBones} extra walk bones` : `${G.answerBones} for answers`];
  if (G.walkBones) parts.push(`${G.walkBones} walk bonus`);
  if (G.askBones) parts.push(`${G.askBones} for asking Bonnie`);
  modal(`
    ${bonnieHTML('', 'endBonnie')}
    <div class="paw-stamp" aria-hidden="true">🐾</div>
    <h2>Walk done!</h2>
    <p>${esc(msg)}</p>
    ${up ? `<p class="kind">🐾 ${days} days in a row!</p>` : ''}
    <p class="earned"><b>🦴 ${total} bones</b> on our walk!</p>
    <p class="note">${parts.join(' · ')}</p>
    <div class="btns">
      <button class="btn green" data-a="home">🏠 Back to the Clubhouse</button>
      <button class="btn ghost" data-a="again">🐾 Another walk</button>
    </div>`, a => { if (a === 'again') startWalk(); else location.href = GAME.homeHref; });
  const eb = $('#endBonnie'); eb.style.margin = '0 auto'; animate(eb, 'happy', 600);
  say([msg, G.extra ? LINES.extraDone : ''].filter(Boolean).join(' '));
}
/* Leaving part-way: Bonnie checks first. Bones already earned are kept. */
function stopWalk(href) {
  if (!G || !G.walk || G.done) { location.href = href; return; }
  say(LINES.walkStop);
  modal(`${bonnieHTML('small', 'stopBonnie')}<h2>Stop the walk?</h2><p>${esc(fmt(LINES.walkStop))}</p>
    <div class="btns"><button class="btn green" data-a="stay">🐾 Keep walking</button><button class="btn ghost" data-a="go">Stop</button></div>`,
    a => { if (a === 'go') location.href = href; });
  const sb = $('#stopBonnie'); if (sb) sb.style.margin = '0 auto';
}
/* For the Clubhouse button: the streak to show (only while it's alive) and whether there's been a walk today. */
function walkInfo() {
  if (!S) S = load();
  const t = localDay(), w = S.walks;
  const alive = !!w.last && (w.last >= shiftDay(t, -1));
  return { streak: alive ? w.streak : 0, walkedToday: !!w.days[t], mix: S.settings.walkMix };
}

/* =========================================================
   BONE SHOP (hats, themes, real-life prizes)
   ========================================================= */
let shopTab = 'hats', shopFromClub = false;
function shopScreen(opts = {}) {
  G = null; S = load();
  const tabs = { hats: '🎀 Dress Up Bonnie', themes: '🎨 Themes', prizes: '🎁 Real Prizes' };
  const more = cost => `<span class="meter" aria-hidden="true"><i style="width:${Math.min(100, Math.round(S.bones / cost * 100))}%"></i></span><div class="note">${cost - S.bones} more to go!</div>`;
  let body = '';
  if (shopTab === 'hats') body = SLOTS.map(sl => `<h3 class="tier">${sl.name}</h3>` + HATS.filter(h => h.slot === sl.id).map(h => {
    const own = S.owned.hats.includes(h.id), on = S[sl.key] === h.id;
    return `<div class="card item"><div class="hatprev">${bonnieSVG(h.id)}</div><b>${h.name}</b>
      ${own ? (on ? `<div class="note">Wearing ✓</div><button class="btn small ghost" data-off="${sl.key}">${sl.off}</button>`
          : `<button class="btn small green" data-wear="${h.id}">Wear</button>`)
        : `<div class="cost">🦴 ${h.cost}</div>${S.bones >= h.cost ? `<button class="btn small" data-buy="hats:${h.id}">Buy</button>` : more(h.cost)}`}</div>`; }).join('')).join('');
  if (shopTab === 'themes') body = THEMES.map(t => {
    const own = S.owned.themes.includes(t.id), on = S.theme === t.id;
    return `<div class="card item"><div class="swatch" style="background:${t.sw}"></div><b>${t.name}</b>
      ${own ? `<button class="btn small ${on ? 'ghost' : 'green'}" data-usetheme="${t.id}" ${on ? 'disabled' : ''}>${on ? 'Using ✓' : 'Use'}</button>`
        : `<div class="cost">🦴 ${t.cost}</div>${S.bones >= t.cost ? `<button class="btn small" data-buy="themes:${t.id}">Buy</button>` : more(t.cost)}`}</div>`; }).join('');
  if (shopTab === 'prizes') {
    const list = S.rewards.slice().sort((a, b) => a.cost - b.cost);
    body = list.length ? list.map((p, i) => `${i === 0 || tierOf(list[i - 1].cost) !== tierOf(p.cost) ? `<h3 class="tier">${tierOf(p.cost)}</h3>` : ''}
      <div class="card item"><div class="ie">${prizeEmoji(p.title)}</div><b>${esc(p.title)}</b>
      ${p.desc ? `<div class="note">${esc(p.desc)}</div>` : ''}
      <div class="cost">🦴 ${p.cost}</div>${S.bones >= p.cost ? `<button class="btn small berry" data-prize="${esc(p.id)}">Swap bones</button>` : more(p.cost)}</div>`).join('')
      : '<p class="note">No prizes yet. Ask a grown-up to add some!</p>';
  }
  show(`
    <div class="card" style="padding:20px">
      <div class="map-head">
        <button class="icon-btn" id="back">${shopFromClub ? '← Clubhouse' : '← Home'}</button>
        <h2>🛍️ Bonnie's Bone Shop</h2>
        <div class="chip bones" style="margin-left:auto">🦴 ${S.bones}</div>
      </div>
      <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
        ${bonnieHTML('', 'shopBonnie')}
        <p style="font-family:var(--font-read);font-size:1.2rem;flex:1;min-width:200px" id="shopSay">${esc(fmt(LINES.shopWelcome))}</p>
      </div>
      <div class="tabs" role="group" aria-label="Shop sections">${Object.entries(tabs).map(([k, v]) => `<button class="tab ${shopTab === k ? 'on' : ''}" data-tab="${k}" aria-pressed="${shopTab === k}">${v}</button>`).join('')}</div>
      ${shopTab === 'prizes' ? '<p class="note">Real prizes are set by your grown-up. When you swap, a grown-up holds a button to say yes!</p>' : ''}
      <div class="shop-grid">${body}</div>
    </div>`);
  const shopSay = text => { $('#shopSay').textContent = fmt(text); say(text); };
  $('#back').onclick = () => { if (shopFromClub) location.href = GAME.homeHref; else homeScreen(); };
  if (opts.welcome) setTimeout(() => say(LINES.shopWelcome), 250);
  const sb = $('#shopBonnie'); sb.onclick = () => { const t = tickle(sb); $('#shopSay').textContent = t; say(t, { pitch: 1.4 }); };
  $$('[data-tab]').forEach(b => b.onclick = () => { shopTab = b.dataset.tab; sfx.pop(); shopScreen(); });
  const dressed = line => setTimeout(() => { animate($('#shopBonnie'), 'happy', 550); shopSay(line); }, 50);
  $$('[data-wear]').forEach(b => b.onclick = () => { const id = b.dataset.wear; mutate(s => { s[slotKey(id)] = id; }); sfx.pop(); shopScreen(); dressed(LINES.hatOn); });
  $$('[data-off]').forEach(b => b.onclick = () => { mutate(s => { s[b.dataset.off] = null; }); sfx.pop(); shopScreen(); dressed(LINES.hatOff); });
  $$('[data-usetheme]').forEach(b => b.onclick = () => { mutate(s => { s.theme = b.dataset.usetheme; }); applyTheme(); sfx.pop(); shopScreen(); });
  $$('[data-buy]').forEach(b => b.onclick = () => { sfx.tap(); confirmBuy(...b.dataset.buy.split(':')); });
  $$('[data-prize]').forEach(b => b.onclick = () => { sfx.tap(); confirmPrize(b.dataset.prize); });
}
function confirmBuy(tab, id) {
  const it = (tab === 'hats' ? HATS : THEMES).find(x => x.id === id); if (!it) return;
  modal(`${tab === 'hats' ? `<div class="hatprev big">${bonnieSVG(id)}</div>` : `<div class="swatch big" style="background:${it.sw}"></div>`}
    <h2>${esc(it.name)}</h2><p>Buy it for <b>${it.cost} bones</b>?</p>
    <div class="btns"><button class="btn green" data-a="yes">Yes, buy it!</button><button class="btn ghost" data-a="no">Not now</button></div>`, a => {
    if (a !== 'yes') return;
    S = load(); if (S.bones < it.cost) return shopScreen();
    mutate(s => {
      s.bones -= it.cost;
      if (tab === 'hats') { s.owned.hats.push(id); s[slotKey(id)] = id; } else { s.owned.themes.push(id); s.theme = id; }
      s.redeemed.push({ title: (tab === 'hats' ? 'Bonnie’s ' : 'Theme: ') + it.name, cost: it.cost, when: todayGB() });
    });
    applyTheme(); sfx.fanfare(); confetti(20); shopScreen();
    setTimeout(() => { animate($('#shopBonnie'), 'happy', 550); const m = tab === 'hats' ? `Thank you {N}! I love my ${it.name}!` : LINES.theme; $('#shopSay').textContent = fmt(m); say(m); }, 50);
  });
}
function confirmPrize(id) {
  const p = S.rewards.find(x => x.id === id); if (!p) return;
  const bg = modal(`${bonnieHTML('', '', undefined)}<h2>Get a grown-up!</h2>
    <div class="card item can"><div class="ie">${prizeEmoji(p.title)}</div><b>${esc(p.title)}</b><div class="cost">🦴 ${p.cost}</div></div>
    <p>Show this to a grown-up. They hold the button to say yes.</p>
    ${holdBtn('Grown-up: hold to say yes')}
    <div class="btns"><button class="btn ghost" data-a="no">Not now</button></div>`);
  $('.bonnie', bg).style.margin = '0 auto';
  say(LINES.grownUp);
  wireHold(bg, () => {
    bg.remove();
    S = load(); const r = S.rewards.find(x => x.id === id);
    if (!r || S.bones < r.cost) return shopScreen();
    mutate(s => { s.bones -= r.cost; s.redeemed.push({ title: r.title, cost: r.cost, when: todayGB() }); });
    sfx.fanfare(); setTimeout(sfx.woof, 700); confetti(30); shopScreen();
    setTimeout(() => {
      const m = `Hooray, {N}! Tell your grown-up you unlocked: ${r.title}!`; $('#shopSay').textContent = fmt(m);
      say(Voice().hasClips(fmt(m)) ? m : LINES.prize); // prizes a grown-up added have no recording
    }, 50);
  });
}

/* =========================================================
   GROWN-UPS: sum check, then settings
   ========================================================= */
/* Once the sum is answered, the grown-ups area opens without it again for a few minutes in this
   tab, so a grown-up can hop between the Clubhouse, Maths and Words settings. */
const GATE_KEY = 'meadow-grownups-open-until', GATE_MS = 10 * 60 * 1000;
const gateOpen = () => { try { return +sessionStorage.getItem(GATE_KEY) > Date.now(); } catch (e) { return false; } };
const gatePassed = () => { try { sessionStorage.setItem(GATE_KEY, String(Date.now() + GATE_MS)); } catch (e) {} };
let parentFromClub = false;
function parentGate() {
  if (gateOpen()) { parentScreen(); return; }
  const a = randInt(6, 9), b = randInt(12, 19);
  const bg = modal(`<h2>🔒 Grown-ups only</h2><p>To open settings, please answer:</p>
    <p style="font-size:2rem;font-weight:700">${a} × ${b} = ?</p>
    <input type="number" inputmode="numeric" id="gateAns" aria-label="Answer"><p class="note" id="gateMsg" aria-live="polite"></p>
    <div class="btns"><button class="btn green" data-a="ok">Unlock</button><button class="btn ghost" data-a="cancel">Cancel</button></div>`, act => {
    if (act === 'cancel') { if (parentFromClub) location.href = GAME.homeHref; return; }
    if (+$('#gateAns').value === a * b) { gatePassed(); parentScreen(); return; }
    $('#gateMsg').textContent = 'Not quite — please try again.'; $('#gateAns').value = ''; sfx.wrong(); return true;
  });
  const inp = $('#gateAns', bg); inp.focus();
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') $('[data-a="ok"]', bg).click(); });
}
function logTable(w) {
  const names = tierNames(w);
  const rows = w.levels.map((L, i) => { const l = S.logs[keyOf(w, L)]; if (!l) return '';
    return `<tr><td>${i + 1}. ${esc(L.name)}</td>${names.map((_, t) => `<td>${int(l.tiers && l.tiers[t])}</td>`).join('')}<td>${int(l.eased)}</td><td>${esc(l.when || '')}</td></tr>`; }).join('');
  if (!rows) return '<p class="note">Nothing yet.</p>';
  return `<div class="log-wrap"><table class="log"><thead><tr><th>Level (last play)</th>${names.map(t => `<th>${esc(t)}</th>`).join('')}<th>Made easier</th><th>When</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function parentScreen() {
  G = null; S = load();
  const subj = GAME.subject, sworlds = subjectWorlds(subj);
  const history = S.redeemed.slice().reverse().slice(0, 20);
  const allYears = yearsWithWorlds(), chosen = S.settings.years;
  const V = window.BonnieVoice;
  show(`
    <div class="card parent">
      <div class="map-head"><button class="icon-btn" id="back">${parentFromClub ? '← Clubhouse' : '← Home'}</button><h2>⚙️ Grown-up Settings: ${esc(GAME.title)}</h2></div>
      <p class="note">Bones, name, hats, themes and prizes are shared by every Meadow game. Changes here show up there too. Stars and progress further down are for ${esc(GAME.title)} only.</p>
      ${(GAME.otherGames || []).length ? `<div class="row-btns" style="justify-content:flex-start">${GAME.otherGames.map(g => `<a class="btn small ghost" href="${esc(g.href)}#grownups">${esc(g.icon || '')} ${esc(g.title)} settings →</a>`).join('')}</div>` : ''}
      <section><h3>Child</h3>
        <p>Playing as <b>${esc(nameOf())}</b>. To change the name, use <b>Change name</b> on the <a href="${esc(GAME.homeHref)}">Clubhouse</a> page.</p></section>
      <section><h3>Bones 🦴 <span class="chip bones" style="display:inline-flex" id="pBones">${S.bones}</span></h3>
        <p class="note">In each level, the first 2 plays each day pay 1 bone for each right answer. Plays after that on the same day are extra practice: no bones per answer, but 3 bonus bones for finishing. Asking Bonnie for help pays 1 bone once per play, in any play. Each new best star pays 3 bones (only stars better than the best so far). Practice is never limited, and five different levels in a day all pay normally.</p>
        <div class="row-btns" style="justify-content:flex-start">
          <button class="btn small ghost" data-bone="-10">−10</button><button class="btn small ghost" data-bone="-1">−1</button>
          <button class="btn small ghost" data-bone="1">+1</button><button class="btn small ghost" data-bone="10">+10</button></div>
        <form class="row-btns" id="boneForm" style="justify-content:flex-start;margin-top:8px" autocomplete="off">
          <input type="number" inputmode="numeric" min="0" max="99999" id="boneSet" value="${S.bones}" aria-label="Bone balance">
          <button class="btn small" type="submit">Set balance</button><span class="note" id="boneOk" aria-live="polite"></span></form></section>
      <section><h3>Bones spent</h3>
        ${history.length ? history.map(r => `<div class="redeem"><span><b>${esc(r.title)}</b></span><span class="note">${int(r.cost)}🦴 · ${esc(r.when || '')}</span></div>`).join('') : '<p class="note">Nothing swapped yet.</p>'}
      </section>
      <section><h3>Real-life prizes</h3>
        <p class="note">These show in the Bone Shop. Changes save as you type. Claiming a prize needs a grown-up to hold a button for 3 seconds.</p>
        <div id="prizeList">${S.rewards.map(p => `<div class="prize-row" data-id="${esc(p.id)}">
          <span class="pe">${prizeEmoji(p.title)}</span>
          <input type="text" value="${esc(p.title)}" data-f="title" maxlength="60" aria-label="Prize name">
          <input type="number" value="${p.cost}" data-f="cost" min="1" max="9999" inputmode="numeric" aria-label="Cost in bones">
          <button class="btn small ghost" data-del="${esc(p.id)}" aria-label="Remove ${esc(p.title)}">✕</button>
          <input type="text" value="${esc(p.desc || '')}" data-f="desc" maxlength="120" class="pdesc" placeholder="Short description (optional)" aria-label="Description"></div>`).join('')}</div>
        <div class="row-btns" style="justify-content:flex-start;margin-top:8px">
          <button class="btn small" id="addPrize">+ Add prize</button>
          <button class="btn small ghost" id="resetPrizes">Use the starter prize list</button><span class="note" id="prizeOk" aria-live="polite"></span></div></section>
      <section><h3>🐾 Bonnie's Walk</h3>
        <p class="note">Five quick questions from the Clubhouse, mixing English and easy maths. Nothing can be failed. Choose the mix (it's the same in every game):</p>
        ${Object.entries(WALK_MIX_NAMES).map(([k, v]) => `<label><input type="radio" name="walkMix" value="${k}" ${S.settings.walkMix === k ? 'checked' : ''}> ${esc(v)}</label>`).join('')}
        <p class="note">Walk streak: ${plural(walkInfo().streak, 'day')} in a row.</p>
        <label><input type="checkbox" id="pTeach" ${S.settings.teachBonnie ? 'checked' : ''}> Teach Bonnie questions: now and then Bonnie has a go at a maths question and ${esc(fmt('{N}'))} checks her answer (once in a walk from the second walk on, and in about half of maths levels)</label></section>
      <section><h3>Sound & voice</h3>
        <label><input type="checkbox" id="pSfx" ${S.sound ? 'checked' : ''}> Sound effects</label>
        <label><input type="checkbox" id="pVoice" ${S.voice ? 'checked' : ''}> Bonnie talks</label>
        ${GAME.readAloudOption ? `<label><input type="checkbox" id="pRead" ${S.readAloud ? 'checked' : ''}> Read every question aloud</label>` : ''}
        <label>Reading speed <input type="range" id="pRate" min="0.6" max="1.2" step="0.05" value="${S.voiceRate}"> <span id="rateVal">${S.voiceRate}</span>
          <button class="btn small ghost" id="testVoice" type="button">Test voice</button></label>
        <p class="note">${V && V.pack ? `Recorded Bonnie voice: on (${Object.keys(V.pack.clips || {}).length} clips). Reading speed only changes the device voice.` : 'Recorded Bonnie voice: not loaded, so Bonnie uses the device voice.'}</p></section>
      ${allYears.length ? `<section><h3>School years</h3>
        <p class="note">Choose which years' worlds show in every game. With none ticked, the highest year that has worlds shows (now: Year ${allYears[allYears.length - 1]}). Stars, bones, hats and prizes carry over between years.</p>
        ${allYears.map(y => `<label><input type="checkbox" data-year="${y}" ${chosen && chosen.includes(y) ? 'checked' : ''}> Year ${y}</label>`).join('')}
        <p class="note" id="yearsNow">Showing in ${esc(GAME.title)}: ${shownYears(subj).map(y => 'Year ' + y).join(' + ')}</p></section>` : ''}
      <section><h3>Progress in ${esc(GAME.title)}</h3>
        <label><input type="checkbox" id="pUnlock" ${S.settings.unlockAll[subj] ? 'checked' : ''}> Open all levels in ${esc(GAME.title)}</label>
        ${sworlds.some(w => w.warmUps) ? `<label><input type="checkbox" id="pWarm" ${S.settings.warmUps ? 'checked' : ''}> Maths warm-ups: each level starts with 2 easy questions that don't count for stars</label>` : ''}
        ${sworlds.map(w => `<div class="note">${w.icon || ''} ${esc(w.name)} (Year ${w.year}): ⭐ ${worldStars(w)} / ${w.levels.length * 3}</div>`).join('')}
        <div class="row-btns" style="justify-content:flex-start;margin-top:10px"><button class="btn small berry" id="resetProg">Reset ${esc(GAME.title)} stars</button></div>
        <p class="note">Resetting clears this game's stars only. Bones, hats, prizes and the other games are kept.</p></section>
      <section><h3>How each answer was reached</h3>
        <p class="note">Counts from the last play of each level: how far Bonnie's help went on each question. <b>Made easier</b> counts questions the game quietly simplified after two answers in a row needed a lot of help.</p>
        ${sworlds.map(w => `<h4>${esc(w.name)}</h4>${logTable(w)}`).join('')}</section>
      ${sworlds.filter(w => w.grownUps).map(w => `<section><h3>${esc(w.name)}</h3>${w.grownUps({ stars: L => starsOf(w, L), log: L => S.logs[keyOf(w, L)] || null })}</section>`).join('')}
      <section><h3>Back up progress</h3>
        <p class="note">Saves everything on this device (bones, hats, themes, prizes and every game's progress) as a file or a code, and restores it on this or another device.</p>
        <div class="row-btns" style="justify-content:flex-start"><button class="btn small green" id="backupBtn" ${window.MeadowBackup ? '' : 'disabled'}>💾 Export or import save</button></div></section>
    </div>`);
  $('#back').onclick = () => { if (parentFromClub) location.href = GAME.homeHref; else homeScreen(); };
  $$('[data-bone]').forEach(b => b.onclick = () => { mutate(s => { s.bones = Math.max(0, s.bones + +b.dataset.bone); }); $('#pBones').textContent = S.bones; $('#boneSet').value = S.bones; });
  $('#boneForm').onsubmit = e => { e.preventDefault(); const v = int($('#boneSet').value, 0, 99999); mutate(s => { s.bones = v; }); $('#pBones').textContent = S.bones; $('#boneSet').value = S.bones; $('#boneOk').textContent = 'Saved ✓'; };
  // prizes save as you type
  const prizeOk = () => { $('#prizeOk').textContent = 'Saved ✓'; };
  $('#prizeList').addEventListener('input', e => {
    const row = e.target.closest('[data-id]'), f = e.target.dataset.f; if (!row || !f) return;
    mutate(s => { const r = s.rewards.find(x => x.id === row.dataset.id); if (!r) return;
      if (f === 'cost') { const v = int(e.target.value, 0, 9999); if (v > 0) r.cost = v; } else r[f] = e.target.value; });
    if (f === 'title') $('.pe', row).textContent = prizeEmoji(e.target.value);
    prizeOk();
  });
  $('#prizeList').addEventListener('change', e => { // tidy a box when the grown-up leaves it
    const row = e.target.closest('[data-id]'), f = e.target.dataset.f; if (!row) return;
    const r = S.rewards.find(x => x.id === row.dataset.id); if (!r) return;
    if (f === 'cost') e.target.value = r.cost;
    if (f === 'title' && !String(r.title).trim()) { mutate(s => { s.rewards.find(x => x.id === r.id).title = 'Prize'; }); e.target.value = 'Prize'; }
  });
  $$('[data-del]').forEach(b => b.onclick = () => {
    if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Tap again'; return; }
    mutate(s => { s.rewards = s.rewards.filter(r => r.id !== b.dataset.del); }); parentScreen();
  });
  $('#addPrize').onclick = () => { const id = 'r' + Date.now().toString(36); mutate(s => { s.rewards.push({ id, title: 'New prize', desc: '', cost: 50 }); }); parentScreen();
    const inp = $(`[data-id="${id}"] [data-f="title"]`); if (inp) { inp.focus(); inp.select(); } };
  $('#resetPrizes').onclick = () => modal(`<h2>Use the starter prizes?</h2><p>This replaces all prizes with the 12 starter prizes.</p>
    <div class="btns"><button class="btn berry" data-a="yes">Yes, replace</button><button class="btn ghost" data-a="no">Keep mine</button></div>`, a => {
    if (a === 'yes') { mutate(s => { s.rewards = STARTER_PRIZES.map(r => ({ ...r })); }); parentScreen(); } });
  $('#pSfx').onchange = e => mutate(s => { s.sound = e.target.checked; });
  $$('[name="walkMix"]').forEach(r => r.onchange = () => { if (r.checked) mutate(s => { s.settings.walkMix = r.value; }); });
  $('#pVoice').onchange = e => { mutate(s => { s.voice = e.target.checked; }); if (!S.voice) hush(); };
  if ($('#pRead')) $('#pRead').onchange = e => mutate(s => { s.readAloud = e.target.checked; });
  $('#pRate').oninput = e => { $('#rateVal').textContent = e.target.value; };
  $('#pRate').onchange = e => mutate(s => { s.voiceRate = +e.target.value; });
  $('#testVoice').onclick = () => say(GAME.testVoice || LINES.testVoice);
  $$('[data-year]').forEach(b => b.onchange = () => {
    const ys = $$('[data-year]').filter(x => x.checked).map(x => +x.dataset.year);
    mutate(s => { s.settings.years = ys.length ? ys : null; });
    $('#yearsNow').textContent = `Showing in ${GAME.title}: ${shownYears(subj).map(y => 'Year ' + y).join(' + ')}`;
  });
  $('#pUnlock').onchange = e => mutate(s => { s.settings.unlockAll[subj] = e.target.checked; });
  if ($('#pWarm')) $('#pWarm').onchange = e => mutate(s => { s.settings.warmUps = e.target.checked; });
  if ($('#pTeach')) $('#pTeach').onchange = e => mutate(s => { s.settings.teachBonnie = e.target.checked; });
  $('#backupBtn').onclick = () => window.MeadowBackup && window.MeadowBackup.open();
  $('#resetProg').onclick = () => modal(`<h2>Reset ${esc(GAME.title)} stars?</h2><p>All stars in ${esc(GAME.title)} will be cleared. Bones and prizes are kept.</p>
    <div class="btns"><button class="btn berry" data-a="yes">Reset</button><button class="btn ghost" data-a="no">Cancel</button></div>`, a => {
    if (a !== 'yes') return;
    const prefixes = sworlds.map(w => w.id + '/');
    mutate(s => { [s.stars, s.logs].forEach(o => Object.keys(o).forEach(k => { if (prefixes.some(p => k.startsWith(p))) delete o[k]; }));
      s.starLog = s.starLog.filter(e => !prefixes.some(p => e.key.startsWith(p))); });
    parentScreen();
  });
}

/* =========================================================
   EVERY LINE BONNIE CAN SAY (for tools/make-voice.mjs)
   Core lines + the game's greetings + each world's lines().
   ========================================================= */
function spokenLines(game = GAME) {
  const out = new Set(), add = (...xs) => xs.forEach(x => x && out.add(fmt(x)));
  add(LINES.extraPractice, LINES.extraDone, LINES.warmUp, ...LINES.walkStart, ...LINES.walkOops, ...LINES.walkDone, LINES.walkStop);
  add(...LINES.praise, LINES.watched, ...LINES.oops, ...LINES.tickles, ...LINES.tickleEgg, ...Object.values(LINES.finish), LINES.already3, ...Object.values(LINES.stillBest),
    LINES.locked, LINES.shownAll, LINES.shopWelcome, LINES.hatOn, LINES.hatOff, LINES.theme, LINES.grownUp, LINES.prize, (game && game.testVoice) || LINES.testVoice);
  [1, 2, 3].forEach(st => [1, 2].forEach(p => { if (st <= p) add(fmt(LINES.finish[st]) + ' ' + LINES.stillBest[p]); }));
  [1, 2, 3].forEach(st => add(fmt(LINES.finish[st]) + ' ' + LINES.already3));
  HATS.filter(h => h.cost > 0).forEach(h => add(`Thank you {N}! I love my ${h.name}!`));
  STARTER_PRIZES.forEach(p => add(`Hooray, {N}! Tell your grown-up you unlocked: ${p.title}!`));
  if (game) add(...(game.greets || []));
  WORLDS.filter(w => !game || w.subject === game.subject).forEach(w => {
    add(...(w.praise || []));
    if (w.lines) (w.lines({ fmt, esc }) || []).forEach(x => add(x)); // a world's lines() returns an array of strings
  });
  return [...out];
}
/* Lines other speakers say, by who: { captain: [...] } (a world's host: { who, lines }) */
function hostLines(game = GAME) {
  const out = {};
  WORLDS.filter(w => !game || w.subject === game.subject).forEach(w => {
    const h = w.host; if (!h || !h.who || !h.lines) return;
    const set = out[h.who] || (out[h.who] = new Set());
    h.lines.forEach(x => x && set.add(fmt(x)));
  });
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, [...v]]));
}

/* =========================================================
   STYLES (Meadow Words' storybook look)
   ========================================================= */
const CSS = `
:root{
  --card:#FDFBF7; --card-edge:#EADFCB; --ink:#4A3B2C; --ink-soft:#7A6A58;
  --accent:#E07A3F; --accent-dark:#B85C26; --leaf:#6BA368; --leaf-dark:#4C7E4A;
  --sky:#BFE3F0; --wood:#D9A86C; --wood-light:#EDC994; --wood-dark:#9A6A3A;
  --gold:#F2C14E; --berry:#D9596B; --berry-dark:#A93E4F; --line:#E8DCC8;
  --bg1:#F6EBD3; --bg2:#E7D9B8; --on-bg:#4A3B2C;
  --shadow:0 6px 0 rgba(74,59,44,.12), 0 14px 28px rgba(74,59,44,.10);
  --radius:22px;
  --fur:#9a6440; --fur-dk:#74472a; --fur-lt:#c99568;
  --font-ui:'Fredoka','Trebuchet MS',system-ui,sans-serif;
  --font-read:'Andika','Comic Sans MS','Trebuchet MS',sans-serif;
}
body[data-theme="sunset"]{--bg1:#FFE3D0;--bg2:#F7B9A0;background:radial-gradient(900px 600px at 85% 105%,rgba(255,190,110,.55),transparent 65%),radial-gradient(1000px 650px at 0% 0%,rgba(247,150,140,.35),transparent 60%),radial-gradient(800px 600px at 100% 0%,rgba(170,130,200,.28),transparent 60%),#FFF1E6;background-attachment:fixed}
body[data-theme="night"]{--on-bg:#F3EEDF;--accent:#B58BE0;--accent-dark:#8A62B8;background:radial-gradient(700px 500px at 85% 0%,rgba(120,130,200,.35),transparent 60%),radial-gradient(900px 700px at 0% 100%,rgba(60,40,110,.45),transparent 60%),#1C2140;background-attachment:fixed}
body[data-theme="snow"]{--accent:#2F8FB0;--accent-dark:#1F6A85;background:radial-gradient(900px 600px at 10% 0%,rgba(180,212,240,.6),transparent 60%),radial-gradient(800px 600px at 100% 100%,rgba(255,255,255,.9),transparent 60%),#EEF5FB;background-attachment:fixed}
body[data-theme="christmas"]{--on-bg:#FFF4E0;--accent:#D9443A;--accent-dark:#A82E27;background:radial-gradient(700px 500px at 15% 0%,rgba(242,193,78,.22),transparent 60%),radial-gradient(900px 650px at 100% 100%,rgba(217,68,58,.32),transparent 60%),radial-gradient(800px 600px at 0% 100%,rgba(80,160,105,.35),transparent 60%),#173B2C!important;background-attachment:fixed}
body[data-theme="christmas"]::before{content:'';position:fixed;left:0;right:0;pointer-events:none;z-index:1;top:0;height:48px;background:url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='48' ><path d='M0 5 Q40 29 80 5 Q120 29 160 5' fill='none' stroke='%23203026' stroke-width='2'/><circle cx='20' cy='26' r='11' fill='%23FF5A4E' opacity='.28'><animate attributeName='opacity' values='.1;.45;.1' dur='1.6s' begin='0s' repeatCount='indefinite'/></circle><rect x='17' y='13' width='6' height='5' rx='1' fill='%233B4A40'/><ellipse cx='20' cy='25' rx='5' ry='7' fill='%23FF5A4E'/><ellipse cx='18.4' cy='22' rx='1.4' ry='2.4' fill='%23fff' opacity='.7'/><circle cx='60' cy='26' r='11' fill='%23FFD24A' opacity='.28'><animate attributeName='opacity' values='.1;.45;.1' dur='1.9500000000000002s' begin='0.4s' repeatCount='indefinite'/></circle><rect x='57' y='13' width='6' height='5' rx='1' fill='%233B4A40'/><ellipse cx='60' cy='25' rx='5' ry='7' fill='%23FFD24A'/><ellipse cx='58.4' cy='22' rx='1.4' ry='2.4' fill='%23fff' opacity='.7'/><circle cx='100' cy='26' r='11' fill='%236EDB7A' opacity='.28'><animate attributeName='opacity' values='.1;.45;.1' dur='2.3s' begin='0.8s' repeatCount='indefinite'/></circle><rect x='97' y='13' width='6' height='5' rx='1' fill='%233B4A40'/><ellipse cx='100' cy='25' rx='5' ry='7' fill='%236EDB7A'/><ellipse cx='98.4' cy='22' rx='1.4' ry='2.4' fill='%23fff' opacity='.7'/><circle cx='140' cy='26' r='11' fill='%236AB8FF' opacity='.28'><animate attributeName='opacity' values='.1;.45;.1' dur='2.65s' begin='1.2000000000000002s' repeatCount='indefinite'/></circle><rect x='137' y='13' width='6' height='5' rx='1' fill='%233B4A40'/><ellipse cx='140' cy='25' rx='5' ry='7' fill='%236AB8FF'/><ellipse cx='138.4' cy='22' rx='1.4' ry='2.4' fill='%23fff' opacity='.7'/></svg>") repeat-x 0 0/160px 48px}
body[data-theme="christmas"]::after{content:'';position:fixed;left:0;right:0;pointer-events:none;z-index:1;top:0;bottom:0;background:url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' ><circle cx='153' cy='126' r='1.7' fill='%23fff' opacity='0.91'/><circle cx='16' cy='110' r='2.0' fill='%23fff' opacity='0.82'/><circle cx='277' cy='154' r='1.7' fill='%23fff' opacity='0.71'/><circle cx='85' cy='109' r='2.2' fill='%23fff' opacity='0.68'/><circle cx='159' cy='184' r='1.8' fill='%23fff' opacity='0.91'/><circle cx='137' cy='259' r='2.5' fill='%23fff' opacity='0.80'/><circle cx='155' cy='151' r='2.6' fill='%23fff' opacity='0.93'/><circle cx='119' cy='212' r='1.9' fill='%23fff' opacity='0.78'/><circle cx='105' cy='99' r='2.1' fill='%23fff' opacity='0.87'/><circle cx='263' cy='33' r='2.9' fill='%23fff' opacity='0.58'/><circle cx='122' cy='46' r='1.5' fill='%23fff' opacity='0.95'/><circle cx='66' cy='190' r='1.7' fill='%23fff' opacity='0.73'/><circle cx='178' cy='41' r='3.1' fill='%23fff' opacity='0.90'/><circle cx='267' cy='266' r='3.0' fill='%23fff' opacity='0.85'/><circle cx='83' cy='3' r='1.8' fill='%23fff' opacity='0.58'/><circle cx='0' cy='185' r='1.8' fill='%23fff' opacity='0.85'/></svg>") 0 0/300px 300px,url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='440' height='440' ><circle cx='215' cy='303' r='2.9' fill='%23fff' opacity='0.90'/><circle cx='103' cy='165' r='4.2' fill='%23fff' opacity='0.60'/><circle cx='215' cy='1' r='4.2' fill='%23fff' opacity='0.80'/><circle cx='406' cy='9' r='4.2' fill='%23fff' opacity='0.63'/><circle cx='426' cy='249' r='3.8' fill='%23fff' opacity='0.66'/><circle cx='98' cy='92' r='3.5' fill='%23fff' opacity='0.57'/><circle cx='339' cy='308' r='3.8' fill='%23fff' opacity='0.75'/><circle cx='14' cy='49' r='4.2' fill='%23fff' opacity='0.60'/><circle cx='303' cy='393' r='2.5' fill='%23fff' opacity='0.90'/></svg>") 0 0/440px 440px;animation:meadowSnow 26s linear infinite}
@keyframes meadowSnow{to{background-position:40px 300px,-60px 880px}}
body[data-theme="sea"]{--accent:#1E8C96;--accent-dark:#136A72;--bg1:#D4F3F1;--bg2:#6FBCD3;background:radial-gradient(800px 500px at 50% -10%,rgba(255,255,255,.55),transparent 60%),radial-gradient(900px 600px at 0% 100%,rgba(40,120,160,.35),transparent 60%),linear-gradient(180deg,#D4F3F1,#97D6E0 50%,#5FAFC8)!important;background-attachment:fixed}
body[data-theme="sea"]::before{content:'';position:fixed;left:0;right:0;pointer-events:none;z-index:1;top:0;bottom:0;background:url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='420' ><circle cx='0' cy='387' r='5.6' fill='%23fff' fill-opacity='.12' stroke='%23fff' stroke-opacity='.6' stroke-width='1.5'/><circle cx='-1.9599999999999997' cy='385.04' r='1.2' fill='%23fff' opacity='.75'/><circle cx='55' cy='306' r='7.8' fill='%23fff' fill-opacity='.12' stroke='%23fff' stroke-opacity='.6' stroke-width='1.5'/><circle cx='52.27' cy='303.27' r='1.7' fill='%23fff' opacity='.75'/><circle cx='86' cy='316' r='9.8' fill='%23fff' fill-opacity='.12' stroke='%23fff' stroke-opacity='.6' stroke-width='1.5'/><circle cx='82.57' cy='312.57' r='2.2' fill='%23fff' opacity='.75'/><circle cx='141' cy='287' r='8.7' fill='%23fff' fill-opacity='.12' stroke='%23fff' stroke-opacity='.6' stroke-width='1.5'/><circle cx='137.955' cy='283.955' r='1.9' fill='%23fff' opacity='.75'/><circle cx='212' cy='102' r='6.4' fill='%23fff' fill-opacity='.12' stroke='%23fff' stroke-opacity='.6' stroke-width='1.5'/><circle cx='209.76' cy='99.76' r='1.4' fill='%23fff' opacity='.75'/><circle cx='184' cy='293' r='3.5' fill='%23fff' fill-opacity='.12' stroke='%23fff' stroke-opacity='.6' stroke-width='1.5'/><circle cx='182.775' cy='291.775' r='0.8' fill='%23fff' opacity='.75'/><circle cx='178' cy='197' r='11.3' fill='%23fff' fill-opacity='.12' stroke='%23fff' stroke-opacity='.6' stroke-width='1.5'/><circle cx='174.045' cy='193.045' r='2.5' fill='%23fff' opacity='.75'/><circle cx='210' cy='52' r='7.6' fill='%23fff' fill-opacity='.12' stroke='%23fff' stroke-opacity='.6' stroke-width='1.5'/><circle cx='207.34' cy='49.34' r='1.7' fill='%23fff' opacity='.75'/><circle cx='240' cy='289' r='8.8' fill='%23fff' fill-opacity='.12' stroke='%23fff' stroke-opacity='.6' stroke-width='1.5'/><circle cx='236.92' cy='285.92' r='1.9' fill='%23fff' opacity='.75'/></svg>") 0 0/260px 420px,url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='340' height='560' ><circle cx='196' cy='511' r='8.0' fill='%23fff' fill-opacity='.1' stroke='%23fff' stroke-opacity='.5' stroke-width='1.2'/><circle cx='127' cy='188' r='7.5' fill='%23fff' fill-opacity='.1' stroke='%23fff' stroke-opacity='.5' stroke-width='1.2'/><circle cx='113' cy='85' r='4.3' fill='%23fff' fill-opacity='.1' stroke='%23fff' stroke-opacity='.5' stroke-width='1.2'/><circle cx='146' cy='165' r='8.1' fill='%23fff' fill-opacity='.1' stroke='%23fff' stroke-opacity='.5' stroke-width='1.2'/><circle cx='190' cy='408' r='7.8' fill='%23fff' fill-opacity='.1' stroke='%23fff' stroke-opacity='.5' stroke-width='1.2'/><circle cx='20' cy='153' r='5.9' fill='%23fff' fill-opacity='.1' stroke='%23fff' stroke-opacity='.5' stroke-width='1.2'/></svg>") 120px 0/340px 560px,url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' preserveAspectRatio='none'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='%23fff' stop-opacity='.42'/><stop offset='1' stop-color='%23fff' stop-opacity='0'/></linearGradient></defs><polygon points='8,0 14,0 28,100 16,100' fill='url(%23g)'/><polygon points='26,0 30,0 44,100 32,100' fill='url(%23g)'/><polygon points='47,0 54,0 68,100 56,100' fill='url(%23g)'/><polygon points='66,0 71,0 85,100 73,100' fill='url(%23g)'/><polygon points='86,0 92,0 106,100 94,100' fill='url(%23g)'/></svg>") 0 0/100% 75% no-repeat;animation:meadowBubbles 30s linear infinite}
@keyframes meadowBubbles{to{background-position:0 -840px,120px -560px,0 0}}
body[data-theme="sea"] .meadow{background:radial-gradient(9px 6px at 12% 50%,#F4B6B0 40%,transparent 44%),radial-gradient(6px 5px at 30% 62%,#fff 40%,transparent 44%),radial-gradient(10px 7px at 55% 45%,#F7D2A0 40%,transparent 44%),radial-gradient(6px 5px at 72% 60%,#C9B48A 40%,transparent 44%),radial-gradient(9px 6px at 90% 48%,#F4B6B0 40%,transparent 44%),linear-gradient(180deg,transparent 0 20%,#EBD9A6 20% 100%)}
@media (prefers-reduced-motion:reduce){body[data-theme="christmas"]::before{background-image:url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='48' ><path d='M0 5 Q40 29 80 5 Q120 29 160 5' fill='none' stroke='%23203026' stroke-width='2'/><circle cx='20' cy='26' r='11' fill='%23FF5A4E' opacity='.28'></circle><rect x='17' y='13' width='6' height='5' rx='1' fill='%233B4A40'/><ellipse cx='20' cy='25' rx='5' ry='7' fill='%23FF5A4E'/><ellipse cx='18.4' cy='22' rx='1.4' ry='2.4' fill='%23fff' opacity='.7'/><circle cx='60' cy='26' r='11' fill='%23FFD24A' opacity='.28'></circle><rect x='57' y='13' width='6' height='5' rx='1' fill='%233B4A40'/><ellipse cx='60' cy='25' rx='5' ry='7' fill='%23FFD24A'/><ellipse cx='58.4' cy='22' rx='1.4' ry='2.4' fill='%23fff' opacity='.7'/><circle cx='100' cy='26' r='11' fill='%236EDB7A' opacity='.28'></circle><rect x='97' y='13' width='6' height='5' rx='1' fill='%233B4A40'/><ellipse cx='100' cy='25' rx='5' ry='7' fill='%236EDB7A'/><ellipse cx='98.4' cy='22' rx='1.4' ry='2.4' fill='%23fff' opacity='.7'/><circle cx='140' cy='26' r='11' fill='%236AB8FF' opacity='.28'></circle><rect x='137' y='13' width='6' height='5' rx='1' fill='%233B4A40'/><ellipse cx='140' cy='25' rx='5' ry='7' fill='%236AB8FF'/><ellipse cx='138.4' cy='22' rx='1.4' ry='2.4' fill='%23fff' opacity='.7'/></svg>")}body[data-theme="christmas"]::after,body[data-theme="sea"]::before{animation:none}}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;height:100%}
/* never fake bold or italics: the fonts have their own bold, and Safari's fake one smudges the letters */
html{font-synthesis:none}
b,strong{font-weight:700}
body{font-family:var(--font-ui);color:var(--ink);background:radial-gradient(1200px 600px at 20% -10%,rgba(255,255,255,.55),transparent 60%),linear-gradient(180deg,var(--bg1),var(--bg2));background-color:var(--bg1);background-attachment:fixed;min-height:100%;overflow-x:hidden;user-select:none;-webkit-user-select:none}
input,textarea{user-select:text;-webkit-user-select:text}
button{font-family:inherit;color:inherit;cursor:pointer;border:none;background:none}
#app{position:relative;z-index:2;max-width:1100px;margin:0 auto;padding:12px 16px 120px;min-height:100vh}
.hud{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.hud .title{font-weight:700;font-size:1.25rem;color:var(--on-bg);display:flex;align-items:center;gap:8px;margin-right:auto;cursor:pointer}
.chip{background:var(--card);border:2px solid var(--card-edge);border-radius:999px;padding:6px 14px;font-weight:600;display:flex;align-items:center;gap:6px;box-shadow:0 3px 0 rgba(74,59,44,.12)}
.chip.bones{font-size:1.15rem}
.chip.bones.bump{animation:bump .45s}
.chip.streak{transition:all .25s}
.chip.streak.hot{background:linear-gradient(180deg,#FFE7A8,#F2C14E);border-color:#D9A22F}
.icon-btn{text-decoration:none;color:var(--ink);background:var(--card);border:2px solid var(--card-edge);border-radius:14px;padding:8px 12px;min-height:44px;display:inline-flex;align-items:center;font-weight:600;box-shadow:0 3px 0 rgba(74,59,44,.12)}
.icon-btn:active{transform:translateY(2px);box-shadow:none}
.card{background:var(--card);border:2px solid var(--card-edge);border-radius:var(--radius);box-shadow:var(--shadow);position:relative}
.btn{background:var(--accent);color:#fff;font-weight:600;font-size:1.1rem;padding:12px 22px;min-height:48px;border-radius:16px;box-shadow:0 5px 0 var(--accent-dark);transition:transform .08s}
.btn:active{transform:translateY(4px);box-shadow:0 1px 0 var(--accent-dark)}
.btn.green{background:var(--leaf);box-shadow:0 5px 0 var(--leaf-dark)}
.btn.berry{background:var(--berry);box-shadow:0 5px 0 var(--berry-dark)}
.btn.ghost{background:var(--card);color:var(--ink);border:2px solid var(--card-edge);box-shadow:0 4px 0 var(--card-edge)}
.btn.small{font-size:.95rem;padding:8px 14px;min-height:44px;border-radius:12px}
.btn:disabled{opacity:.45;pointer-events:none}
h1,h2,h3,h4{margin:0;font-weight:700}
.on-bg{color:var(--on-bg)}
.note{font-size:.9rem;color:var(--ink-soft)}
.hero{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:center;padding:18px 22px;margin-bottom:18px}
.hero h1{font-size:clamp(1.6rem,4vw,2.4rem)}
.hero p{margin:6px 0 0;font-family:var(--font-read);font-size:1.15rem;color:var(--ink-soft)}
.worlds{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}
.world-card{padding:18px;text-align:left;display:flex;flex-direction:column;gap:6px;transition:transform .15s;overflow:hidden}
.world-card:active{transform:scale(.98)}
.world-card .wicon{font-size:3rem;line-height:1;width:72px;height:72px;border-radius:20px;display:grid;place-items:center;margin-bottom:4px}
.world-card h3{font-size:1.3rem}
.world-card .sub{font-family:var(--font-read);color:var(--ink-soft)}
.world-card .wstars{font-weight:600;color:var(--wood-dark)}
.world-card .ribbon{position:absolute;top:14px;right:-34px;transform:rotate(35deg);background:var(--gold);padding:3px 40px;font-size:.75rem;font-weight:700}
.home-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}
.map{padding:20px;margin-top:6px}
.map-head{display:flex;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap}
.map-head h2{font-size:1.6rem}
.world-intro{font-family:var(--font-read);font-size:1.1rem;color:var(--ink-soft);margin:0 0 8px}
.path{position:relative;display:flex;flex-direction:column;gap:14px;padding:10px 0}
.stone{display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:20px;background:#F5EEDF;border:2px dashed var(--card-edge);width:min(560px,100%);text-align:left;transition:transform .15s}
.stone:nth-child(even){margin-left:auto}
.stone .num{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;font-size:1.5rem;font-weight:700;color:#fff;flex:none;box-shadow:0 4px 0 rgba(0,0,0,.18)}
.stone .lt{font-weight:600;font-size:1.1rem}
.stone .lb{font-family:var(--font-read);color:var(--ink-soft);font-size:.95rem}
.stone .eg{white-space:nowrap;background:#fff;border-radius:8px;padding:0 6px}
.stone .ls{font-size:1.2rem;letter-spacing:2px}
.stone .new-badge{display:inline-block;margin-top:4px;padding:2px 12px;border-radius:999px;background:var(--gold);color:var(--ink);font-weight:700;font-size:.95rem;box-shadow:0 2px 0 rgba(74,59,44,.18)}
.stone.locked{opacity:.55;filter:grayscale(.6)}
.stone.bad{animation:shake .45s}
.game-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.game-top .gt{font-weight:700;color:var(--on-bg);font-size:1.1rem}
.chip.extra{background:linear-gradient(180deg,#E9F4FB,#CFE6F5);border-color:#9CC3DE;color:#245A91;font-size:.95rem;padding:4px 12px}
.pips{display:flex;gap:6px;margin-left:auto}
.pip{width:16px;height:16px;border-radius:50%;background:var(--card);border:2px solid var(--card-edge)}
.pip.done{background:var(--leaf);border-color:var(--leaf-dark)}
.pip.now{background:var(--gold);border-color:#C99A2E;transform:scale(1.25)}
.game-main{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:16px;align-items:start}
.game-main.full{grid-template-columns:minmax(0,1fr)}
/* Bonnie's Walk: the path of paw stones */
.walk-path{padding:12px 18px 8px;margin-bottom:14px;background:linear-gradient(180deg,#E8F5DA,#CFE8B6);border-color:#B9D79A}
.walk-track{position:relative;display:flex;justify-content:space-between;align-items:flex-end;height:104px;padding:0 2%}
.walk-track::before{content:"";position:absolute;left:3%;right:3%;bottom:14px;height:16px;border-radius:999px;background:repeating-linear-gradient(90deg,#E4C891 0 18px,#EBD3A3 18px 36px);box-shadow:inset 0 -3px 0 rgba(74,59,44,.1)}
.wstone{position:relative;z-index:1;width:58px;height:40px;border-radius:50%;background:#F5EEDF;border:3px solid #D9C9A8;display:grid;place-items:center;font-size:1.25rem;box-shadow:0 3px 0 rgba(74,59,44,.15);transition:background .3s,border-color .3s}
.wstone span{opacity:.18;transition:opacity .3s}
.wstone.done{background:var(--gold);border-color:#C99A2E}
.wstone.done span{opacity:1}
.wstone.now{border-color:var(--leaf);box-shadow:0 0 0 5px rgba(107,163,104,.35),0 3px 0 rgba(74,59,44,.15)}
.wbowl{position:relative;z-index:1;width:58px;height:46px;border-radius:12px 12px 26px 26px;background:var(--berry);border:3px solid var(--berry-dark);display:grid;place-items:center;font-size:1.4rem}
.walker{position:absolute;left:0;bottom:38px;width:74px;height:74px;z-index:2;transition:transform .8s cubic-bezier(.45,1.35,.6,1);pointer-events:none}
.walker svg{width:100%;height:100%;overflow:visible}
.walk-hello{padding:28px;text-align:center;font-family:var(--font-read);font-size:1.3rem}
.walk-in{animation:walkIn .35s ease-out}
@keyframes walkIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.paw-stamp{font-size:3.2rem;line-height:1;margin:4px auto 0;width:84px;height:84px;display:grid;place-items:center;border-radius:50%;border:4px dashed var(--leaf);transform:rotate(-12deg);animation:stamp .5s ease-out}
@keyframes stamp{from{transform:rotate(-12deg) scale(1.8);opacity:0}to{transform:rotate(-12deg) scale(1);opacity:1}}
@media (max-width:560px){.wstone,.wbowl{width:44px;height:32px;font-size:1rem}.walker{width:56px;height:56px;bottom:30px}.walk-track{height:88px}}
@media (prefers-reduced-motion:reduce){.walker,.wstone,.wstone span{transition:none}.walk-in,.paw-stamp{animation:none}}
.play-card{padding:22px;min-height:440px}
.dock{position:sticky;top:12px;display:flex;flex-direction:column;align-items:center;gap:10px;padding:14px}
.bubble{background:#fff;border:2px solid var(--card-edge);border-radius:18px;padding:12px 14px;font-family:var(--font-read);font-size:1.08rem;line-height:1.35;position:relative;width:100%;min-height:64px}
.bubble::after{content:"";position:absolute;bottom:-11px;left:50%;margin-left:-10px;border:10px solid transparent;border-top-color:#fff;border-bottom:0}
.bubble::before{content:"";position:absolute;bottom:-14px;left:50%;margin-left:-12px;border:12px solid transparent;border-top-color:var(--card-edge);border-bottom:0}
.bubble.pop{animation:pop .35s}
.bubble b{color:var(--accent-dark)}
.ladder{display:flex;gap:6px;align-items:center;font-size:.8rem;color:var(--ink-soft)}
.ladder .rung{width:22px;height:22px;border-radius:50%;background:#F1E8D6;display:grid;place-items:center;font-size:.75rem}
.ladder .rung.on{background:var(--gold)}
.bonnie{position:relative;width:140px;height:140px;cursor:pointer;flex:none;transition:transform .2s}
.bonnie svg{width:100%;height:100%;overflow:visible}
.bonnie.small{width:90px;height:90px}
.bonnie.big{width:170px;height:170px}
.bonnie .eyes{transform-origin:60px 52px;animation:blink 5s infinite}
.bonnie .tail{transform-origin:86px 100px;animation:wag 1.4s ease-in-out infinite}
.bonnie.wiggle{animation:wiggle .6s}
.bonnie.happy{animation:hop .55s}
.bonnie.giggle{animation:giggle .9s}
.bonnie .ear-l{transform-origin:33px 42px;transition:transform .3s}
.bonnie .ear-r{transform-origin:87px 42px;transition:transform .3s}
.bonnie.giggle .ear-l{transform:rotate(18deg)}
.bonnie.giggle .ear-r{transform:rotate(-18deg)}
.heart{position:fixed;pointer-events:none;z-index:60;font-size:1.6rem;animation:floatUp 1.2s ease-out forwards}
.row-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;align-items:center}
.tabs{display:flex;gap:8px;margin:12px 0;flex-wrap:wrap}
.tab{padding:10px 18px;min-height:44px;border-radius:14px;background:var(--card);border:2px solid var(--card-edge);font-weight:600}
.tab.on{background:var(--accent);color:#fff;border-color:var(--accent-dark)}
.shop-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px}
.shop-grid .tier{grid-column:1/-1;margin-top:6px;color:var(--wood-dark)}
.item{padding:16px;text-align:center;display:flex;flex-direction:column;gap:8px;align-items:center}
.item .ie{font-size:3rem;line-height:1.1;min-height:3.3rem}
.hatprev{width:84px;height:84px}.hatprev svg{width:100%;height:100%;overflow:visible}
.hatprev.big{width:140px;height:140px;margin:0 auto}
.swatch{width:70px;height:50px;border-radius:12px;border:2px solid var(--card-edge)}
.swatch.big{width:140px;height:90px;margin:0 auto 8px}
.item .cost{font-weight:700;color:var(--wood-dark)}
.meter{display:block;width:100%;height:10px;border-radius:99px;background:#EFE5D0;overflow:hidden}
.meter i{display:block;height:100%;background:var(--leaf);border-radius:99px}
.modal .item{margin:10px auto;max-width:240px;box-shadow:none}
.hold{position:relative;overflow:hidden;touch-action:none;-webkit-touch-callout:none;min-height:72px;font-size:1.2rem;width:100%;margin-top:10px}
.hold .fill{position:absolute;inset:0;background:rgba(255,255,255,.35);transform:scaleX(0);transform-origin:left}
.hold.holding .fill{transform:scaleX(1);transition:transform 3s linear}
.hold .lbl{position:relative}
.parent{padding:22px;display:flex;flex-direction:column;gap:18px}
.parent section{border-top:2px dashed var(--line);padding-top:14px}
.parent h4{margin:12px 0 4px}
.parent label{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:8px 0;font-weight:500;min-height:44px}
.parent input[type=checkbox]{width:24px;height:24px}
.parent input[type=text],.parent input[type=number]{font-family:inherit;font-size:1rem;padding:8px 10px;min-height:44px;border-radius:10px;border:2px solid var(--card-edge);background:#fff;color:var(--ink)}
.prize-row{display:grid;grid-template-columns:40px 1fr 90px auto;gap:8px;align-items:center;margin:10px 0}
.prize-row input{width:100%}
.prize-row .pe{font-size:1.6rem;text-align:center}
.prize-row .pdesc{grid-column:2/4}
.redeem{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)}
.log-wrap{overflow-x:auto}
.log{border-collapse:collapse;font-size:.9rem;min-width:100%}
.log th,.log td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;white-space:nowrap}
.modal-bg{position:fixed;inset:0;background:rgba(58,45,30,.45);z-index:80;display:grid;place-items:center;padding:16px;animation:fade .2s;overflow-y:auto}
.modal{max-width:460px;width:100%;padding:26px;text-align:center;animation:pop .35s}
.modal h2{font-size:1.7rem;margin-bottom:6px}
.modal p{font-family:var(--font-read);font-size:1.15rem}
.modal p.note{font-family:var(--font-ui);font-size:.9rem}
.modal p.kind{color:var(--leaf-dark);font-weight:700}
.modal .btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px}
.modal input{font-size:1.5rem;width:140px;text-align:center;padding:8px;border-radius:12px;border:2px solid var(--card-edge);font-family:inherit}
.stars-big{font-size:3rem;letter-spacing:6px}
.stars-big span{display:inline-block;animation:starIn .5s both}
.stars-big span.off{opacity:.45}
.fly{position:fixed;z-index:90;pointer-events:none;font-size:1.8rem;transition:transform .8s cubic-bezier(.5,-0.3,.6,1),opacity .8s}
.confetti{position:fixed;top:-40px;z-index:85;pointer-events:none;font-size:1.6rem;animation:fall linear forwards}
.banner{position:fixed;left:50%;top:80px;transform:translateX(-50%);z-index:95;background:linear-gradient(180deg,#FFE48A,#F2C14E);border:3px solid #C99A2E;border-radius:20px;padding:12px 22px;font-weight:700;font-size:1.3rem;box-shadow:var(--shadow);animation:bannerIn 2.4s forwards;pointer-events:none;text-align:center;white-space:nowrap}
.shake{animation:screenShake .4s}
.float-plus{position:fixed;z-index:92;pointer-events:none;font-weight:700;font-size:1.5rem;color:var(--leaf-dark);animation:floatUp 1s ease-out forwards;text-shadow:0 2px 0 #fff}
.drag-ghost{position:fixed!important;z-index:100;pointer-events:none;transform:scale(1.12) rotate(-4deg);box-shadow:0 18px 30px rgba(0,0,0,.25)!important;margin:0!important}
.meadow{position:fixed;left:0;right:0;bottom:0;height:90px;z-index:1;pointer-events:none;background:radial-gradient(14px 10px at 8% 30%,#F7D96B 40%,transparent 42%),radial-gradient(12px 9px at 27% 45%,#fff 40%,transparent 42%),radial-gradient(14px 10px at 61% 35%,#F29BB0 40%,transparent 42%),radial-gradient(12px 9px at 83% 40%,#fff 40%,transparent 42%),radial-gradient(14px 10px at 94% 25%,#F7D96B 40%,transparent 42%),linear-gradient(180deg,transparent 0 20%,#9CCB7C 20% 100%);border-top-left-radius:50% 30px;border-top-right-radius:50% 30px}
.butterfly{position:fixed;z-index:1;font-size:1.8rem;pointer-events:none;animation:flutter 18s linear infinite}
.butterfly span{display:inline-block;animation:flap .35s ease-in-out infinite alternate}
.frog{position:fixed;bottom:32px;left:-60px;z-index:4;font-size:2.4rem;cursor:pointer;animation:frogTrip 26s linear infinite}
.frog span{display:inline-block;animation:hopY 1.3s ease-in-out infinite}
.frog.boing span{animation:bigHop .7s}
@keyframes bump{50%{transform:scale(1.25)}}
@keyframes pop{0%{transform:scale(.85);opacity:.4}70%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
@keyframes blink{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}
@keyframes wag{0%,100%{transform:rotate(-14deg)}50%{transform:rotate(18deg)}}
@keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)}}
@keyframes hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-22px) scale(1.04)}}
@keyframes bonnieSpin{0%{transform:translateY(0) rotate(0)}35%{transform:translateY(-40px) rotate(180deg) scale(1.1)}70%{transform:translateY(-10px) rotate(360deg)}85%{transform:translateY(0) scale(1.08,.92)}100%{transform:none}}
.bonnie-spin{animation:bonnieSpin 1.2s cubic-bezier(.3,1.2,.5,1) !important}
@media (prefers-reduced-motion:reduce){.bonnie-spin{animation:none !important}}
@keyframes giggle{0%,100%{transform:rotate(0)}10%,50%{transform:rotate(-10deg) scale(1.05)}30%,70%{transform:rotate(10deg) scale(1.05)}}
@keyframes floatUp{0%{opacity:1;transform:translateY(0) scale(.8)}100%{opacity:0;transform:translateY(-90px) scale(1.2)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
@keyframes fade{from{opacity:0}}
@keyframes starIn{0%{transform:scale(0) rotate(-90deg)}80%{transform:scale(1.3)}100%{transform:scale(1)}}
@keyframes fall{to{transform:translateY(110vh) rotate(720deg)}}
@keyframes bannerIn{0%{transform:translate(-50%,-30px) scale(.6);opacity:0}12%{transform:translate(-50%,0) scale(1.08);opacity:1}20%{transform:translate(-50%,0) scale(1)}85%{opacity:1}100%{opacity:0;transform:translate(-50%,-20px)}}
@keyframes screenShake{0%,100%{transform:translate(0)}20%{transform:translate(-5px,3px)}40%{transform:translate(5px,-3px)}60%{transform:translate(-3px,-2px)}80%{transform:translate(3px,2px)}}
@keyframes flutter{0%{transform:translate(-10vw,60vh)}25%{transform:translate(30vw,20vh)}50%{transform:translate(60vw,45vh)}75%{transform:translate(85vw,10vh)}100%{transform:translate(110vw,40vh)}}
@keyframes flap{to{transform:scaleX(.55)}}
@keyframes frogTrip{0%{left:-60px}100%{left:calc(100vw + 60px)}}
@keyframes hopY{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
@keyframes bigHop{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-70px) rotate(-20deg)}}
@media (hover:hover){.world-card:hover{transform:translateY(-3px) rotate(-.4deg)}.stone:not(.locked):hover{transform:scale(1.02)}}
@media (max-width:820px){
  .game-main{grid-template-columns:minmax(0,1fr)}
  .dock{position:static;flex-direction:row;flex-wrap:wrap;justify-content:center;order:-1;padding:10px}
  .dock .bonnie{width:84px;height:84px}
  .dock .bubble{flex:1;min-width:180px;width:auto}
  .dock .bubble::after,.dock .bubble::before{display:none}
  .play-card{padding:16px;min-height:0}
  .hero{grid-template-columns:1fr;justify-items:center;text-align:center}
}
@media (max-width:520px){
  .prize-row{grid-template-columns:32px 1fr 70px auto}
  .banner{white-space:normal;width:calc(100vw - 32px)}
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
  .butterfly,.frog{display:none}
}`;

/* =========================================================
   START A GAME
   options: subject ('english', 'maths'…), title ('Meadow Words'), icon,
   greets (Bonnie's hellos), testVoice (the grown-ups' Test voice line), homeHref (the Clubhouse), needName (go to the
   Clubhouse when no name is set), readAloudOption, assetBase ('../' when the
   page is in a subfolder, so Bonnie's recordings are found), saveKey (testing only).
   ========================================================= */
function startGame(opts = {}) {
  if (window.__VOICE_LINES_ONLY__) { GAME = { greets: [], ...opts }; S = load(); return; } // tools/make-voice.mjs only reads the lines
  GAME = { title: 'Meadow', icon: '🌼', homeHref: 'index.html', needName: true, greets: ['Hello {N}! Pick a world to explore!'], ...opts };
  if (opts.saveKey) KEY = opts.saveKey;
  S = load();
  if (GAME.needName && !S.name) { location.replace(GAME.homeHref); return; }
  addStyle(CSS, 'meadow-core-css');
  if (!$('link[href*="fonts.googleapis.com"]')) {
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Andika:wght@400;700&family=Fredoka:wght@400;500;600;700&display=swap';
    document.head.appendChild(l);
  }
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="meadow" aria-hidden="true"></div>
    <div class="butterfly" style="animation-delay:-2s" aria-hidden="true"><span>🦋</span></div>
    <div class="butterfly" style="animation-delay:-11s;animation-duration:24s;filter:hue-rotate(120deg)" aria-hidden="true"><span>🦋</span></div>
    <div class="frog" id="frog" title="Ribbit!" aria-label="Frog"><span>🐸</span></div>
    <div id="app">
      <header class="hud">
        <a class="icon-btn" href="${esc(GAME.homeHref)}" title="Back to the Clubhouse">🏠 Clubhouse</a>
        <div class="title" id="homeLink" role="button" tabindex="0">${GAME.icon} <span id="appTitle"></span></div>
        <div class="chip streak" id="streakChip" title="Right answers in a row">🔥 <span id="streakNum">0</span></div>
        <div class="chip bones" id="boneChip" title="Your bones">🦴 <span id="boneNum">0</span></div>
        <button class="icon-btn" id="shopBtn">🛍️ Bone Shop</button>
      </header>
      <main id="screen"></main>
    </div>`);
  if (window.BonnieVoice) Object.assign(window.BonnieVoice, { base: GAME.assetBase || '', getName: nameOf, getAudio: ac, getRate: () => S.voiceRate || .9, enabled: () => S.voice !== false });
  if (GAME.walk) { // Bonnie's Walk: no shop or world list here, and leaving part-way asks first
    $('#shopBtn').style.display = 'none'; $('#homeLink').style.cursor = 'default';
    const club = $('.hud a.icon-btn'); club.onclick = e => { e.preventDefault(); stopWalk(GAME.homeHref); };
  } else {
    $('#homeLink').onclick = () => { shopFromClub = false; homeScreen(); };
    $('#shopBtn').onclick = () => { sfx.pop(); shopScreen({ welcome: true }); };
  }
  $('#frog').addEventListener('click', e => { const f = e.currentTarget; animate(f, 'boing', 700); sfx.ribbit(); hearts(f, '💚', 2); });
  document.addEventListener('pointerdown', () => ac(), { once: true });
  window.addEventListener('storage', e => { if (e.key === KEY || e.key === null) { S = load(); renderHud(); applyTheme(); } });
  applyTheme(); renderHud(); Voice().load();
  // game.html#shop opens the Bone Shop straight away (the Clubhouse links there)
  // game.html#grownups opens the grown-ups area (after the sum check): the Clubhouse links there
  if (GAME.walk) startWalk();
  else if (location.hash === '#shop') { shopFromClub = true; shopScreen({ welcome: true }); }
  else if (location.hash === '#grownups') { parentFromClub = true; homeScreen(); parentGate(); }
  else homeScreen();
}

window.Meadow = {
  version: SAVE_VERSION,
  RULES, HATS, SLOTS, THEMES, STARTER_PRIZES, OLD_IDS, OLD_KEYS, LINES,
  // content
  registerWorld, addLevels, worlds: subjectWorlds, world: worldById, visibleWorlds, shownYears, levelUnlocked, starSummary, starsThisWeek, weekStart,
  // play
  startGame, startLevel, correct, wrong, helped, askedBonnie, next, finishLevel, bubble, later, learner, isBusy, round,
  teach: { at: teachAt, CHANCE: TEACH_LEVEL_CHANCE }, // Teach Bonnie (for the tests)
  startWalk, walkInfo, walk: { MIXES: WALK_MIXES, KEY: WALK_KEY, BONUS: WALK_BONUS, walkable, plan: () => { S = load(); return planWalk(); }, stop: stopWalk,
    skipHello: () => { if (G && G.walk && !G.done && !$('#area')) walkStep(); } }, // tests: show the first question now
  // save
  save: { get key() { return KEY; }, load: () => (S = load()), get: () => S, mutate, migrate, readOld, normalise, catchUp, oldPrint },
  stars: (worldId, levelId) => { if (!S) S = load(); return S.stars[worldId + '/' + levelId] || 0; },
  // screens
  home: () => homeScreen(), worldMap: id => worldScreen(id), shop: opts => shopScreen(opts || {}), grownUps: () => parentGate(),
  // UI kit for world files
  ui: { $, $$, esc, fmt, rand, randInt, shuffle, wait, plural, reduceMotion, say, hush, whenQuiet, sfx, tone, ac, animate, hearts, banner, confetti,
    shakeScreen, tickle, tickleEgg, addBones, draggable, modal, bonnieSVG, bonnieHTML, hatSVG, refreshBonnies, show },
  spokenLines, hostLines,
  // tests only: pretend the date is something else (fn returns a Date; leave it out to go back to the real clock)
  setClock: fn => { clock = typeof fn === 'function' ? fn : () => new Date(); },
};
})();
