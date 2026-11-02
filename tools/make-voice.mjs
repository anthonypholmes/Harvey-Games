#!/usr/bin/env node
/*
 * Make Bonnie's recorded voice for Meadow Words with ElevenLabs.
 *
 *   ELEVENLABS_API_KEY=... ELEVENLABS_VOICE_ID=... node tools/make-voice.mjs --names "Harvey"
 *
 * Options:
 *   --names "Harvey,Sam"  child names to record (lines with a name only use clips when it is recorded)
 *   --dry-run             count lines and characters, no API key needed, nothing written
 *   --limit 20            make at most this many new clips (handy for trying a voice cheaply)
 *
 * Env: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, optional ELEVENLABS_MODEL (default eleven_multilingual_v2).
 * The key is only read from the environment; never put it in the games or the repo.
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
const VOICE = process.env.ELEVENLABS_VOICE_ID;
const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
const VOICE_SETTINGS = { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true };

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
if (!KEY || !VOICE) { console.error('Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID first (or use --dry-run).'); process.exit(1); }

/* ---------- 3. Make the clips ---------- */
const tag = VOICE.slice(0, 6).toLowerCase();
const slug = s => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'name';
fs.mkdirSync(path.join(AUDIO, 'clips'), { recursive: true });
fs.mkdirSync(path.join(AUDIO, 'names'), { recursive: true });
const saveManifest = () => {
  manifest.made = new Date().toISOString();
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + '\n');
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function tts(text) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(VOICE)}?output_format=mp3_44100_64`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: MODEL, voice_settings: VOICE_SETTINGS }),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const body = await res.text().catch(() => '');
    if ((res.status === 429 || res.status >= 500) && attempt < 6) { await sleep(1500 * attempt); continue; }
    throw new Error(`ElevenLabs said ${res.status}: ${body.slice(0, 300)}`);
  }
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
