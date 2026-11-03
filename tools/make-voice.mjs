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
 *   --names "Harvey,Sam"  extra child names to record (as well as tools/names.txt; *Name records whole sentences)
 *   --list-voices         list the voices on your account and stop
 *   --dry-run             count lines and characters, no API key needed, nothing written
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
const CORE_PAGES = ['meadow-words.html'];

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
    return vm.runInContext('Meadow.spokenLines()', c);
  };
  const call = (f, ...a) => vm.runInContext(`BonnieVoice.${f}(${a.map(x => JSON.stringify(x)).join(',')})`, ctx);
  return {
    lines: [...new Set([...run('index.html', 'clubhouseLines'), ...CORE_PAGES.flatMap(runCore)])],
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
if (!DRY && (manifest.voice !== VOICE || manifest.model !== MODEL)) {
  if (Object.keys(manifest.clips).length) console.log('Voice or model changed: making every clip again.');
  manifest = { voice: VOICE, model: MODEL, clips: {}, names: {}, texts: {}, said: {}, whole: {}, wholeTexts: {} };
}
const exists = f => f && fs.existsSync(path.join(AUDIO, f));
const todo = [...wanted].filter(([k, t]) => !(exists(manifest.clips[k]) && manifest.texts[k] === t && (manifest.said[k] || t) === sayAs(t)));
const namesTodo = NAMES.filter(n => !exists(manifest.names[n.toLowerCase()]));
const wholeTodo = WHOLE.flatMap(n => [...wantedWhole].map(([k, tmpl]) => ({ n, k, text: tmpl.replaceAll('{N}', n) })))
  .filter(({ n, k, text }) => !(exists((manifest.whole[n.toLowerCase()] || {})[k]) && (manifest.wholeTexts[n.toLowerCase()] || {})[k] === text));
const chars = todo.reduce((a, [, t]) => a + sayAs(t).length, 0) + namesTodo.reduce((a, n) => a + n.length, 0)
  + wholeTodo.reduce((a, w) => a + w.text.length, 0);

console.log(`Lines: ${game.lines.length}  ·  pieces: ${wanted.size}  ·  new clips needed: ${todo.length + namesTodo.length + wholeTodo.length}  ·  characters: ${chars}`);
if (DRY) {
  const all = [...wanted.values()].reduce((a, t) => a + t.length, 0);
  console.log(`(A full set from scratch is about ${all} characters.) Dry run: nothing made.`);
  process.exit(0);
}
if (!VOICE) { console.error('Choose a voice with --voice <id> (see --list-voices), or use --dry-run.'); process.exit(1); }
const client = await elevenLabs();

/* ---------- 3. Make the clips ---------- */
const tag = VOICE.slice(0, 6).toLowerCase();
const slug = s => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'name';
fs.mkdirSync(path.join(AUDIO, 'clips'), { recursive: true });
fs.mkdirSync(path.join(AUDIO, 'names'), { recursive: true });
fs.mkdirSync(path.join(AUDIO, 'whole'), { recursive: true });
const saveManifest = () => {
  manifest.made = new Date().toISOString();
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + '\n');
};

async function tts(text) {
  const audio = await client.textToSpeech.convert(VOICE, {
    text, modelId: MODEL, outputFormat: 'mp3_44100_64', voiceSettings: VOICE_SETTINGS,
    ...(MODEL.startsWith('eleven_multilingual_v2') ? {} : { languageCode: 'en' }),
  });
  return Buffer.from(await new Response(audio).arrayBuffer()); // convert() gives a web stream
}

let made = 0;
try {
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
  const keep = new Set([...Object.values(manifest.clips), ...Object.values(manifest.names), ...Object.values(manifest.whole).flatMap(Object.values)]);
  const sweep = dir => { for (const f of fs.readdirSync(path.join(AUDIO, dir), { withFileTypes: true })) {
    const rel = `${dir}/${f.name}`;
    if (f.isDirectory()) { sweep(rel); if (!fs.readdirSync(path.join(AUDIO, rel)).length) fs.rmdirSync(path.join(AUDIO, rel)); }
    else if (f.name.endsWith('.mp3') && !keep.has(rel)) fs.unlinkSync(path.join(AUDIO, rel));
  } };
  ['clips', 'names', 'whole'].forEach(sweep);
  saveManifest();
}
const left = todo.length + namesTodo.length + wholeTodo.length - made;
console.log(`Made ${made} clip(s).${left > 0 ? ` ${left} still to make — run again to carry on.` : ' All done.'}${collisions ? ` (${collisions} key clashes — see warnings)` : ''}`);
