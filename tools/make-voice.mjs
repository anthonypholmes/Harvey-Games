#!/usr/bin/env node
/*
 * Make Bonnie's recorded voice for Meadow Words with ElevenLabs.
 *
 *   npm install                                          (once, adds the ElevenLabs SDK)
 *   npm run voice -- --list-voices                       (see the voices on your account)
 *   npm run voice -- --voice <voice-id> --names "Harvey" --limit 20
 *
 * `npm run voice` loads the API key from .env.local (made by `npx @elevenlabs/cli onboard init`,
 * kept off GitHub by .gitignore). The key is only read from the environment; never put it in the games.
 *
 * Options:
 *   --voice <id>          the ElevenLabs voice to use (or set ELEVENLABS_VOICE_ID)
 *   --captain-voice <id>  also record Captain Croak's lines (Captain's Cove) in this voice. His clips go in
 *                         audio/captain/ with their own list, audio/captain.json, so they never mix with Bonnie's.
 *                         Either voice can be recorded on its own.
 *   --names "Harvey,Sam"  extra child names to record (as well as tools/names.txt; *Name records whole sentences)
 *   --list-voices         list the voices on your account and stop
 *   --dry-run             count lines and characters, no API key needed, nothing written
 *   --numbers-to 100      record number clips only up to here (default 1000, plus 2000 to 9000 for the thousands)
 *   --limit 20            make at most this many new clips (handy for trying a voice cheaply)
 *
 * Optional env: ELEVENLABS_MODEL (default eleven_v4).
 *
 * It runs the Clubhouse's and Meadow Words' own code to list every line Bonnie can say, cuts lines into the same pieces the game
 * uses, and only makes clips that are not already in audio/manifest.json, so re-running after editing the
 * game costs only the new lines. Changing the voice or model remakes everything.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NAMES_FILE = path.join(ROOT, 'tools', 'names.txt');
const AUDIO = path.join(ROOT, 'audio');
const MANIFEST = path.join(AUDIO, 'manifest.json');
const NAME_TOKEN = 'Qqchildnameqq'; // stands in for the child's name while listing lines
// Pages built on the shared engine (js/meadow-core.js) whose lines are recorded too.
const CORE_PAGES = ['meadow-words.html', 'meadow-maths.html', 'bonnies-walk.html'];

const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const DRY = args.includes('--dry-run');
const LIMIT = opt('--limit') ? Math.max(0, parseInt(opt('--limit'), 10)) : Infinity;
// Names: everything in tools/names.txt (one per line, # for notes) plus any given with --names.
const NAMES = [...new Set([
  ...(fs.existsSync(NAMES_FILE) ? fs.readFileSync(NAMES_FILE, 'utf8').split('\n').map(l => l.replace(/#.*/, '').trim()) : []),
  ...(opt('--names') || '').split(','),
].map(s => s.trim()).filter(Boolean))];
const WHOLE = NAMES.filter(n => n.startsWith('*')).map(n => n.slice(1).trim());
for (let i = 0; i < NAMES.length; i++) NAMES[i] = NAMES[i].replace(/^\*\s*/, '');

/* Letter sounds that ElevenLabs reads as letter names ("lll" -> "L, L, L") or too faintly get a
   different spelling when recorded. The game still says the left-hand text with the device voice.
   Checked with ElevenLabs speech-to-text, November 2026. */
const SAY_AS = { lll: 'Lllll...', vvv: 'vvvv.', mmm: 'Mmm...', nnn: 'Nnn...', rrr: 'rrrr.', zzz: 'zzzz.', ks: 'kss' };
const sayAs = text => SAY_AS[text] || text;
const KEY = process.env.ELEVENLABS_API_KEY;
const VOICE = opt('--voice') || process.env.ELEVENLABS_VOICE_ID;
const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_v4';
// Eleven v4 only takes stability and similarity; older models also take style and speaker boost.
const VOICE_SETTINGS = MODEL.startsWith('eleven_v4')
  ? { stability: 0.5, similarityBoost: 0.75 }
  : { stability: 0.5, similarityBoost: 0.75, style: 0.3, useSpeakerBoost: true };

async function elevenLabs() {
  if (!KEY) { console.error('No ELEVENLABS_API_KEY. Run with `npm run voice -- ...` so .env.local is loaded.'); process.exit(1); }
  let mod;
  try { mod = await import('@elevenlabs/elevenlabs-js'); }
  catch (e) { console.error('The ElevenLabs SDK is not installed yet. Run `npm install` in this folder first.'); process.exit(1); }
  return new mod.ElevenLabsClient({ maxRetries: 5 }); // the SDK reads ELEVENLABS_API_KEY itself
}

if (args.includes('--list-voices')) {
  const client = await elevenLabs();
  const { voices } = await client.voices.getAll();
  for (const v of voices) {
    const l = v.labels || {};
    console.log(`${v.voiceId}  ${v.name}${[l.gender, l.accent, l.age, l.descriptive || l.description].filter(Boolean).length ? '  (' + [l.gender, l.accent, l.age, l.descriptive || l.description].filter(Boolean).join(', ') + ')' : ''}`);
  }
  process.exit(0);
}

/* ---------- 1. Run the pages' own code to get their lines and the piece-cutting code ---------- */
function loadPages() {
  // A stand-in for the browser: any DOM call quietly does nothing.
  const dud = new Proxy(function () {}, {
    get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === Symbol.iterator ? [][Symbol.iterator].bind([]) : dud),
    set: () => true, apply: () => dud, construct: () => dud,
  });
  const ctx = {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    __VOICE_LINES_ONLY__: true,
    navigator: {}, location: {}, document: dud, addEventListener: () => {},
    localStorage: {
      getItem: k => (k === 'harvey-splitter-v1' ? JSON.stringify({ name: NAME_TOKEN }) : null),
      setItem: () => {}, removeItem: () => {},
    },
    matchMedia: () => ({ matches: false, addEventListener: () => {} }),
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'bonnie-voice.js'), 'utf8'), ctx, { filename: 'bonnie-voice.js' });
  const run = (file, fn) => { // each page runs in its own copy so their names don't clash
    const c = vm.createContext({ ...ctx }); c.window = c;
    const html = fs.readFileSync(path.join(ROOT, file), 'utf8'), dir = path.dirname(path.join(ROOT, file));
    for (const m of html.matchAll(/<script src="([^"]+)"><\/script>/g))
      if (!/meadow-backup/.test(m[1])) vm.runInContext(fs.readFileSync(path.resolve(dir, m[1]), 'utf8'), c, { filename: m[1] });
    const main = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('const CONFIG'));
    if (!main) throw new Error(`Could not find the main script in ${file}`);
    vm.runInContext(main, c, { filename: file });
    return vm.runInContext(`${fn}()`, c);
  };
  // A page built on the shared engine (js/meadow-core.js): run its <script src> files and its
  // inline script, then ask the core for every line (core lines + the game's worlds).
  const runCore = file => {
    const c = vm.createContext({ ...ctx }); c.window = c;
    const html = fs.readFileSync(path.join(ROOT, file), 'utf8'), dir = path.dirname(path.join(ROOT, file));
    for (const m of html.matchAll(/<script(?: src="([^"]+)")?>([\s\S]*?)<\/script>/g)) {
      if (m[1]) { if (!/meadow-backup/.test(m[1])) vm.runInContext(fs.readFileSync(path.resolve(dir, m[1]), 'utf8'), c, { filename: m[1] }); }
      else if (m[2].includes('Meadow.startGame')) vm.runInContext(m[2], c, { filename: file });
    }
    const hosts = vm.runInContext('Meadow.hostLines ? Meadow.hostLines() : {}', c);
    for (const [who, ls] of Object.entries(hosts)) (hostLines[who] ||= new Set()) && ls.forEach(l => hostLines[who].add(l));
    vm.runInContext('Meadow.numberLines ? Meadow.numberLines() : []', c).forEach(l => numberLines.add(l));
    return vm.runInContext('Meadow.spokenLines()', c);
  };
  const numberLines = new Set(); // sentences with numbers in them (cut at the numbers, see bonnie-voice.js)
  const hostLines = {}; // other speakers' lines: { captain: Set }
  const call = (f, ...a) => vm.runInContext(`BonnieVoice.${f}(${a.map(x => JSON.stringify(x)).join(',')})`, ctx);
  const lines = [...new Set([...run('index.html', 'clubhouseLines'), ...CORE_PAGES.flatMap(runCore)])];
  return {
    lines, numberLines: [...numberLines], numberParts: text => call('numberParts', text),
    hosts: Object.fromEntries(Object.entries(hostLines).map(([k, v]) => [k, [...v]])),
    pieces: (text, name) => call('pieces', text, name),
    sentences: text => call('sentences', text),
    template: (s, name) => call('template', s, name),
    clean: s => call('cleanPiece', s),
    key: s => call('pieceKey', s),
    hasWords: s => /[\p{L}\p{N}]/u.test(s),
  };
}

/* ---------- 2. Work out which clips are needed ---------- */
const game = loadPages();
const wanted = new Map(); // key -> text
let collisions = 0;
for (const line of game.lines) {
  for (const p of game.pieces(line, NAME_TOKEN)) {
    if (p.name) continue;
    const text = game.clean(p.raw);
    if (!game.hasWords(text)) continue;
    if (text.toLowerCase().includes(NAME_TOKEN.toLowerCase())) { console.warn('! name stuck to a word, skipped:', text); continue; }
    const k = game.key(text);
    if (wanted.has(k) && wanted.get(k) !== text) { collisions++; console.warn('! two phrases share a key:', wanted.get(k), '|', text); }
    wanted.set(k, text);
  }
}

/* Sentences with numbers: the words between the numbers are clips like any other ("What goes with", "to make"),
   the maths signs are clips of their words ("plus"), and the numbers are their own clips (audio/numbers/). */
const SIGN_WORDS = { '+': 'plus', '=': 'equals', '×': 'times', '÷': 'divided by', '−': 'take away', '?': 'what?' };
const plurals = new Set(); // numbers said as "fives" ("Count in 5s")
let numberBits = 0;
const want = text => { const k = game.key(text); if (!wanted.has(k)) numberBits++; else if (wanted.get(k) !== text) { collisions++; console.warn('! two phrases share a key:', wanted.get(k), '|', text); } wanted.set(k, text); };
for (const line of game.numberLines) {
  for (const p of game.pieces(line, NAME_TOKEN)) {
    if (p.name) continue;
    const whole = game.clean(p.raw);
    if (!game.hasWords(whole) || wanted.has(game.key(whole))) continue; // already recorded whole
    if (!/\d/.test(whole)) { want(whole); continue; }
    const parts = game.numberParts(p.raw);
    if (!parts) { console.warn('! a number in a shape with no clips, left to the device voice:', whole); continue; }
    for (const x of parts) {
      if (x.kind === 'num') { if (x.plural) plurals.add(x.n); continue; }
      const text = x.kind === 'sign' ? SIGN_WORDS[x.raw] : game.clean(x.raw);
      if (game.hasWords(text)) want(text);
    }
  }
}
if (game.numberLines.length) want('and'); // "two thousand and five"

/* Number clips: 0 to 1000 whole, then 2000 to 9000 (2463 is "two thousand" + "four hundred and sixty-three"). */
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const numberWords = n => n < 20 ? ONES[n] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '')
  : n < 1000 ? ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + numberWords(n % 100) : '')
  : ONES[Math.floor(n / 1000)] + ' thousand' + (n % 1000 ? (n % 1000 < 100 ? ' and ' : ' ') + numberWords(n % 1000) : '');
const pluralWords = n => { const w = numberWords(n); return /six$/.test(w) ? w + 'es' : /y$/.test(w) ? w.slice(0, -1) + 'ies' : w + 's'; };
const NUMBER_MAX = opt('--numbers-to') ? Math.max(0, parseInt(opt('--numbers-to'), 10)) : 1000;
const numbersWanted = new Map(); // "17" -> "seventeen", "5s" -> "fives"
if (game.numberLines.length) {
  for (let n = 0; n <= NUMBER_MAX; n++) numbersWanted.set(String(n), numberWords(n));
  if (NUMBER_MAX >= 1000) for (let n = 2000; n <= 9000; n += 1000) numbersWanted.set(String(n), numberWords(n));
  [...plurals].sort((a, b) => a - b).forEach(n => numbersWanted.set(n + 's', pluralWords(n)));
}

// Sentences that contain the name, for names recorded whole: key -> sentence with {N}
const wantedWhole = new Map();
for (const line of game.lines) for (const s of game.sentences(line)) {
  const clean = game.clean(s.raw);
  if (!clean.toLowerCase().includes(NAME_TOKEN.toLowerCase())) continue;
  const tmpl = game.template(clean, NAME_TOKEN);
  wantedWhole.set(game.key(tmpl), tmpl);
}

let manifest = { voice: VOICE || null, model: MODEL, clips: {}, names: {}, texts: {} };
if (fs.existsSync(MANIFEST)) {
  try { manifest = { ...manifest, ...JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) }; } catch (e) { console.warn('! audio/manifest.json unreadable; starting fresh'); }
}
manifest.texts = manifest.texts || {}; manifest.names = manifest.names || {}; manifest.said = manifest.said || {};
manifest.whole = manifest.whole || {}; manifest.wholeTexts = manifest.wholeTexts || {};
manifest.numbers = manifest.numbers || {};
if (!DRY && VOICE && (manifest.voice !== VOICE || manifest.model !== MODEL)) {
  if (Object.keys(manifest.clips).length) console.log('Voice or model changed: making every clip again.');
  manifest = { voice: VOICE, model: MODEL, clips: {}, names: {}, texts: {}, said: {}, whole: {}, wholeTexts: {}, numbers: {} };
}
const exists = f => f && fs.existsSync(path.join(AUDIO, f));
const todo = [...wanted].filter(([k, t]) => !(exists(manifest.clips[k]) && manifest.texts[k] === t && (manifest.said[k] || t) === sayAs(t)));
const namesTodo = NAMES.filter(n => !exists(manifest.names[n.toLowerCase()]));
const wholeTodo = WHOLE.flatMap(n => [...wantedWhole].map(([k, tmpl]) => ({ n, k, text: tmpl.replaceAll('{N}', n) })))
  .filter(({ n, k, text }) => !(exists((manifest.whole[n.toLowerCase()] || {})[k]) && (manifest.wholeTexts[n.toLowerCase()] || {})[k] === text));
const numbersTodo = [...numbersWanted].filter(([n]) => !exists(manifest.numbers[n]));
const chars = todo.reduce((a, [, t]) => a + sayAs(t).length, 0) + namesTodo.reduce((a, n) => a + n.length, 0)
  + wholeTodo.reduce((a, w) => a + w.text.length, 0) + numbersTodo.reduce((a, [, w]) => a + w.length, 0);

/* Captain Croak (and any other speaker a world's host names): his own pieces, list and folder */
const CAPTAIN_VOICE = opt('--captain-voice') || process.env.ELEVENLABS_CAPTAIN_VOICE_ID;
const CAP_FILE = path.join(AUDIO, 'captain.json');
const capWanted = new Map();
for (const line of (game.hosts.captain || [])) for (const p of game.pieces(line, '')) {
  const text = game.clean(p.raw); if (game.hasWords(text)) capWanted.set(game.key(text), text);
}
let capMan = { voice: CAPTAIN_VOICE || null, model: MODEL, clips: {}, texts: {} };
if (fs.existsSync(CAP_FILE)) { try { capMan = { ...capMan, ...JSON.parse(fs.readFileSync(CAP_FILE, 'utf8')) }; } catch (e) { console.warn('! audio/captain.json unreadable; starting fresh'); } }
if (!DRY && CAPTAIN_VOICE && (capMan.voice !== CAPTAIN_VOICE || capMan.model !== MODEL)) {
  if (Object.keys(capMan.clips).length) console.log('Captain\'s voice or model changed: making his clips again.');
  capMan = { voice: CAPTAIN_VOICE, model: MODEL, clips: {}, texts: {} };
}
const capTodo = [...capWanted].filter(([k, t]) => !(exists(capMan.clips[k]) && capMan.texts[k] === t));

console.log(`Lines: ${game.lines.length}  ·  pieces: ${wanted.size}  ·  new clips needed: ${todo.length + namesTodo.length + wholeTodo.length + numbersTodo.length}  ·  characters: ${chars}`);
if (game.numberLines.length) console.log(`Numbers: ${game.numberLines.length} sentences with numbers  ·  joining pieces: ${numberBits}  ·  number clips: ${numbersWanted.size} (new: ${numbersTodo.length}, ${numbersTodo.reduce((a, [, w]) => a + w.length, 0)} characters)`);
if (DRY) {
  // show what would be recorded, so new lines can be checked before paying for them
  todo.forEach(([, t]) => console.log('  new: ' + t));
  wholeTodo.forEach(w => console.log(`  new (${w.n}): ${w.text}`));
  namesTodo.forEach(n => console.log('  new name: ' + n));
  if (numbersTodo.length) console.log(`  new numbers: ${numbersTodo.length} (${numbersTodo.slice(0, 3).map(([, w]) => w).join(', ')} … ${numbersTodo.at(-1)[1]})`);
  const all = [...wanted.values()].reduce((a, t) => a + t.length, 0);
  console.log(`(A full set from scratch is about ${all} characters.)`);
  console.log(`Captain Croak: ${capWanted.size} pieces  ·  new clips needed: ${capTodo.length}  ·  characters: ${capTodo.reduce((a, [, t]) => a + t.length, 0)}`);
  capTodo.forEach(([, t]) => console.log('  new (Captain): ' + t));
  console.log('Dry run: nothing made.');
  process.exit(0);
}
if (!VOICE && !CAPTAIN_VOICE) { console.error('Choose a voice with --voice <id> and/or --captain-voice <id> (see --list-voices), or use --dry-run.'); process.exit(1); }
if (!KEY) { console.error('No ELEVENLABS_API_KEY. Run with `npm run voice -- ...` so .env.local is loaded.'); process.exit(1); }

/* ---------- 3. Make the clips ---------- */
const tag = VOICE.slice(0, 6).toLowerCase();
const slug = s => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'name';
fs.mkdirSync(path.join(AUDIO, 'clips'), { recursive: true });
fs.mkdirSync(path.join(AUDIO, 'names'), { recursive: true });
fs.mkdirSync(path.join(AUDIO, 'whole'), { recursive: true });
fs.mkdirSync(path.join(AUDIO, 'numbers'), { recursive: true });
const saveManifest = () => {
  manifest.made = new Date().toISOString();
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + '\n');
};

/* One clip, straight from the ElevenLabs web API (the SDK is only used for --list-voices: it is 24,000 files and
   can take minutes to load from a folder that iCloud is syncing). Busy or failed tries are repeated a few times. */
async function tts(text, voice = VOICE) {
  const vs = VOICE_SETTINGS, body = JSON.stringify({
    text, model_id: MODEL,
    voice_settings: { stability: vs.stability, similarity_boost: vs.similarityBoost, ...(vs.style == null ? {} : { style: vs.style, use_speaker_boost: vs.useSpeakerBoost }) },
    ...(MODEL.startsWith('eleven_multilingual_v2') ? {} : { language_code: 'en' }),
  });
  for (let attempt = 0; ; attempt++) {
    let res, problem;
    try {
      res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_64`,
        { method: 'POST', headers: { 'xi-api-key': KEY, 'content-type': 'application/json', accept: 'audio/mpeg' }, body, signal: AbortSignal.timeout(60000) });
      if (res.ok) { const buf = Buffer.from(await res.arrayBuffer()); if (buf.length > 200) return buf; problem = 'empty clip'; }
      else problem = `${res.status} ${(await res.text()).slice(0, 300)}`;
    } catch (e) { problem = e.name + ': ' + e.message; }
    const again = !res || res.status === 429 || res.status >= 500 || res.ok;
    if (!again || attempt >= 5) throw new Error(`ElevenLabs would not make "${text}": ${problem}`);
    await new Promise(r => setTimeout(r, 1500 * 2 ** attempt));
  }
}

let made = 0;
if (VOICE) try {
  for (const n of namesTodo) {
    if (made >= LIMIT) break;
    const file = `names/${slug(n)}-${tag}.mp3`;
    fs.writeFileSync(path.join(AUDIO, file), await tts(n));
    manifest.names[n.toLowerCase()] = file; made++;
    console.log(`  name  ${n}`);
  }
  for (const [k, text] of todo) {
    if (made >= LIMIT) break;
    // a different spelling gets a different file name, so devices don't keep playing an old saved copy
    const file = `clips/${k}-${tag}${sayAs(text) !== text ? '-' + game.key(sayAs(text)).slice(0, 4) : ''}.mp3`;
    fs.writeFileSync(path.join(AUDIO, file), await tts(sayAs(text)));
    manifest.clips[k] = file; manifest.texts[k] = text; made++;
    if (sayAs(text) !== text) manifest.said[k] = sayAs(text); else delete manifest.said[k];
    console.log(`  ${String(made).padStart(4)}  ${text.length > 70 ? text.slice(0, 67) + '…' : text}`);
    if (made % 25 === 0) saveManifest();
  }
  // the joining pieces above come first, so a small --limit trial can already say whole sums with the numbers it reaches
  for (const [n, words] of numbersTodo) {
    if (made >= LIMIT) break;
    const file = `numbers/${n}-${tag}.mp3`;
    fs.writeFileSync(path.join(AUDIO, file), await tts(words.charAt(0).toUpperCase() + words.slice(1) + '.'));
    manifest.numbers[n] = file; made++;
    if (made % 25 === 0) { saveManifest(); console.log(`  ${String(made).padStart(4)}  numbers up to ${words}`); }
  }
  for (const { n, k, text } of wholeTodo) {
    if (made >= LIMIT) break;
    const nl = n.toLowerCase(), file = `whole/${slug(n)}/${k}-${tag}.mp3`;
    fs.mkdirSync(path.join(AUDIO, 'whole', slug(n)), { recursive: true });
    fs.writeFileSync(path.join(AUDIO, file), await tts(text));
    (manifest.whole[nl] ||= {})[k] = file; (manifest.wholeTexts[nl] ||= {})[k] = text; made++;
    console.log(`  ${String(made).padStart(4)}  ${text.length > 70 ? text.slice(0, 67) + '…' : text}`);
    if (made % 25 === 0) saveManifest();
  }
} finally {
  // Drop clips for lines the game no longer says, and their files.
  for (const k of Object.keys(manifest.clips)) if (!wanted.has(k)) { delete manifest.clips[k]; delete manifest.texts[k]; delete manifest.said[k]; }
  const wholeNames = new Set(WHOLE.map(n => n.toLowerCase()));
  for (const nl of Object.keys(manifest.whole)) {
    if (!wholeNames.has(nl)) { delete manifest.whole[nl]; delete manifest.wholeTexts[nl]; continue; }
    for (const k of Object.keys(manifest.whole[nl])) if (!wantedWhole.has(k)) { delete manifest.whole[nl][k]; delete manifest.wholeTexts[nl][k]; }
  }
  for (const n of Object.keys(manifest.numbers)) if (!numbersWanted.has(n)) delete manifest.numbers[n];
  const keep = new Set([...Object.values(manifest.clips), ...Object.values(manifest.names), ...Object.values(manifest.numbers), ...Object.values(manifest.whole).flatMap(Object.values)]);
  const sweep = dir => { for (const f of fs.readdirSync(path.join(AUDIO, dir), { withFileTypes: true })) {
    const rel = `${dir}/${f.name}`;
    if (f.isDirectory()) { sweep(rel); if (!fs.readdirSync(path.join(AUDIO, rel)).length) fs.rmdirSync(path.join(AUDIO, rel)); }
    else if (f.name.endsWith('.mp3') && !keep.has(rel)) fs.unlinkSync(path.join(AUDIO, rel));
  } };
  ['clips', 'names', 'whole', 'numbers'].forEach(sweep);
  saveManifest();
}
let capMade = 0;
if (CAPTAIN_VOICE) {
  const ctag = CAPTAIN_VOICE.slice(0, 6).toLowerCase();
  fs.mkdirSync(path.join(AUDIO, 'captain'), { recursive: true });
  const saveCap = () => { capMan.made = new Date().toISOString(); fs.writeFileSync(CAP_FILE, JSON.stringify(capMan, null, 1) + '\n'); };
  try {
    for (const [k, text] of capTodo) {
      if (made + capMade >= LIMIT) break;
      const file = `captain/${k}-${ctag}.mp3`;
      fs.writeFileSync(path.join(AUDIO, file), await tts(text, CAPTAIN_VOICE));
      capMan.clips[k] = file; capMan.texts[k] = text; capMade++;
      console.log(`  Captain ${String(capMade).padStart(3)}  ${text}`);
    }
  } finally {
    for (const k of Object.keys(capMan.clips)) if (!capWanted.has(k)) { delete capMan.clips[k]; delete capMan.texts[k]; }
    const keep = new Set(Object.values(capMan.clips));
    for (const f of fs.readdirSync(path.join(AUDIO, 'captain'))) if (f.endsWith('.mp3') && !keep.has(`captain/${f}`)) fs.unlinkSync(path.join(AUDIO, 'captain', f));
    saveCap();
  }
  const capLeft = capTodo.length - capMade;
  console.log(`Captain: made ${capMade} clip(s).${capLeft > 0 ? ` ${capLeft} still to make — run again to carry on.` : ' All done.'}`);
}
if (!VOICE) process.exit(0);
const left = todo.length + namesTodo.length + wholeTodo.length + numbersTodo.length - made;
console.log(`Made ${made} clip(s).${left > 0 ? ` ${left} still to make — run again to carry on.` : ' All done.'}${collisions ? ` (${collisions} key clashes — see warnings)` : ''}`);
