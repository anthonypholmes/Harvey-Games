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
 *   --names "Harvey,Sam"  child names to record (lines with a name only use clips when it is recorded)
 *   --list-voices         list the voices on your account and stop
 *   --dry-run             count lines and characters, no API key needed, nothing written
 *   --limit 20            make at most this many new clips (handy for trying a voice cheaply)
 *
 * Optional env: ELEVENLABS_MODEL (default eleven_v4).
 *
 * It runs the game's own code to list every line Bonnie can say, cuts lines into the same pieces the game
 * uses, and only makes clips that are not already in audio/manifest.json, so re-running after editing the
 * game costs only the new lines. Changing the voice or model remakes everything.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GAME = path.join(ROOT, 'meadow-words.html');
const AUDIO = path.join(ROOT, 'audio');
const MANIFEST = path.join(AUDIO, 'manifest.json');
const NAME_TOKEN = 'Qqchildnameqq'; // stands in for the child's name while listing lines

const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const DRY = args.includes('--dry-run');
const LIMIT = opt('--limit') ? Math.max(0, parseInt(opt('--limit'), 10)) : Infinity;
const NAMES = (opt('--names') || '').split(',').map(s => s.trim()).filter(Boolean);
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

/* ---------- 1. Run the game's script to get its lines and its piece-cutting code ---------- */
function loadGame() {
  const html = fs.readFileSync(GAME, 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const main = scripts.find(s => s.includes('const CONFIG'));
  if (!main) throw new Error('Could not find the game script in meadow-words.html');
  const noop = () => {};
  const el = new Proxy({}, { get: () => noop });
  const ctx = {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    __VOICE_LINES_ONLY__: true,
    navigator: {}, location: {},
    localStorage: {
      getItem: k => (k === 'harvey-splitter-v1' ? JSON.stringify({ name: NAME_TOKEN }) : null),
      setItem: noop, removeItem: noop,
    },
    matchMedia: () => ({ matches: false, addEventListener: noop }),
    document: { querySelector: () => null, querySelectorAll: () => [], addEventListener: noop, createElement: () => el, body: { dataset: {}, appendChild: noop } },
    addEventListener: noop,
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(main, ctx, { filename: 'meadow-words.html' });
  return {
    lines: vm.runInContext('allSpokenLines()', ctx),
    pieces: (text, name) => vm.runInContext(`voicePieces(${JSON.stringify(text)}, ${JSON.stringify(name)})`, ctx),
    clean: s => vm.runInContext(`cleanPiece(${JSON.stringify(s)})`, ctx),
    key: s => vm.runInContext(`pieceKey(${JSON.stringify(s)})`, ctx),
    hasWords: s => /[\p{L}\p{N}]/u.test(s),
  };
}

/* ---------- 2. Work out which clips are needed ---------- */
const game = loadGame();
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

let manifest = { voice: VOICE || null, model: MODEL, clips: {}, names: {}, texts: {} };
if (fs.existsSync(MANIFEST)) {
  try { manifest = { ...manifest, ...JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) }; } catch (e) { console.warn('! audio/manifest.json unreadable; starting fresh'); }
}
manifest.texts = manifest.texts || {}; manifest.names = manifest.names || {};
if (!DRY && (manifest.voice !== VOICE || manifest.model !== MODEL)) {
  if (Object.keys(manifest.clips).length) console.log('Voice or model changed: making every clip again.');
  manifest = { voice: VOICE, model: MODEL, clips: {}, names: {}, texts: {} };
}
const exists = f => f && fs.existsSync(path.join(AUDIO, f));
const todo = [...wanted].filter(([k, t]) => !(exists(manifest.clips[k]) && manifest.texts[k] === t));
const namesTodo = NAMES.filter(n => !exists(manifest.names[n.toLowerCase()]));
const chars = todo.reduce((a, [, t]) => a + t.length, 0) + namesTodo.reduce((a, n) => a + n.length, 0);

console.log(`Lines: ${game.lines.length}  ·  pieces: ${wanted.size}  ·  new clips needed: ${todo.length + namesTodo.length}  ·  characters: ${chars}`);
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
    const file = `clips/${k}-${tag}.mp3`;
    fs.writeFileSync(path.join(AUDIO, file), await tts(text));
    manifest.clips[k] = file; manifest.texts[k] = text; made++;
    console.log(`  ${String(made).padStart(4)}  ${text.length > 70 ? text.slice(0, 67) + '…' : text}`);
    if (made % 25 === 0) saveManifest();
  }
} finally {
  // Drop clips for lines the game no longer says, and their files.
  for (const k of Object.keys(manifest.clips)) if (!wanted.has(k)) { delete manifest.clips[k]; delete manifest.texts[k]; }
  const keep = new Set([...Object.values(manifest.clips), ...Object.values(manifest.names)]);
  for (const dir of ['clips', 'names']) for (const f of fs.readdirSync(path.join(AUDIO, dir))) {
    if (f.endsWith('.mp3') && !keep.has(`${dir}/${f}`)) fs.unlinkSync(path.join(AUDIO, dir, f));
  }
  saveManifest();
}
const left = todo.length + namesTodo.length - made;
console.log(`Made ${made} clip(s).${left > 0 ? ` ${left} still to make — run again to carry on.` : ' All done.'}${collisions ? ` (${collisions} key clashes — see warnings)` : ''}`);
