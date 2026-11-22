/* Shared by tools/phone-check.mjs and tools/level-check.mjs: drives Google Chrome directly (no Puppeteer),
 * serves the game files, and makes each page believe it is inside the App Store app. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const ORDER = ['se', '17', 'max']; // smallest first (JavaScript would put '17' first on its own)

/* iPhone sizes in points, with the safe areas iOS gives an upright app. */
export const SIZES = {
  se: { name: 'iPhone SE', w: 375, h: 667, top: 20, bottom: 0, island: false },
  17: { name: 'iPhone 17', w: 402, h: 874, top: 62, bottom: 34, island: true },
  max: { name: 'iPhone 17 Pro Max', w: 440, h: 956, top: 62, bottom: 34, island: true },
  ipad: { name: 'iPad (2018)', w: 768, h: 1024, top: 20, bottom: 0, island: false }, // only with --size ipad: to check a phone change left the iPad alone
};

/* What every page sees before its own scripts run: the app, a pretend App Store, no animations. */
export const PRELUDE = `(() => {
  const mem = {};
  const Preferences = { get: async ({ key }) => ({ value: key in mem ? mem[key] : null }), set: async ({ key, value }) => { mem[key] = value; },
    remove: async ({ key }) => { delete mem[key]; }, keys: async () => ({ keys: Object.keys(mem) }) };
  // the full game is bought only when a check asks for it (localStorage 'phone-check-full' = '1')
  const answer = () => ({ owned: (() => { try { return localStorage.getItem('phone-check-full') === '1'; } catch (e) { return false; } })(), available: true, price: '£3.99' });
  const MeadowStore = { status: async () => answer(), buy: async () => answer(), restore: async () => answer(), addListener() {} };
  window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'ios', Plugins: { Preferences, MeadowStore }, registerPlugin: n => ({ Preferences, MeadowStore })[n] };
  const still = () => document.head && document.head.insertAdjacentHTML('beforeend',
    '<style>*,*::before,*::after{animation:none!important;transition:none!important}.butterfly{display:none!important}</style>');
  if (document.head) still(); else document.addEventListener('DOMContentLoaded', still);
  try { speechSynthesis.speak = () => {}; } catch (e) {}
})();`;

/* The made-up player. Runs on the Clubhouse page, then the scene's page is opened. */
export const MAKE_SAM = `(() => {
  const M = Meadow, d = new Date(), p = n => String(n).padStart(2, '0'), day = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  localStorage.clear(); sessionStorage.clear();
  M.save.load();
  M.save.mutate(s => {
    s.name = 'Sam'; s.bones = 86; s.voice = false; s.sound = false; s.settings.warmUps = false; s.settings.teachBonnie = false;
    s.neck = 'collar-red'; s.face = 'sunglasses'; s.owned.hats = ['collar-red', 'sunglasses'];
    s.tips = { walk: true, ask: true, shop: true }; // Bonnie's first-time help is already seen, so no glowing rings in the pictures
    M.worlds().forEach((world, wi) => {
      const done = Math.max(1, Math.min(world.levels.length - 1, [4, 3, 2, 2, 1, 2, 3, 2, 2, 1][wi] || 1));
      world.levels.slice(0, done).forEach((L, li) => {
        const key = world.id + '/' + L.id, stars = li === done - 1 ? 2 : 3;
        s.stars[key] = stars;
        if (li === done - 1) s.starLog.push({ key, from: 0, to: stars, day });
      });
    });
  });
  try { sessionStorage.setItem('meadow-player-picked', '1'); localStorage.setItem('meadow-tip-grownups', '1'); } catch (e) {}
})()`;
/* Drawn on top before the picture: the phone's top and bottom, and the bottom of the screen. */
export const overlay = (size, fullH) => `(() => {
  const d = document.createElement('div'); d.id = 'phoneCheckOverlay';
  d.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:${fullH}px;pointer-events:none;z-index:2147483647';
  d.innerHTML = '<div style="position:absolute;left:0;right:0;top:0;height:${size.top}px;background:rgba(0,0,0,.18)"></div>'
    + ${size.island ? `'<div style="position:absolute;left:50%;top:11px;width:125px;height:37px;margin-left:-62px;border-radius:20px;background:#000"></div>'` : `''`}
    + '<div style="position:absolute;left:0;right:0;top:${size.h - size.bottom}px;height:${size.bottom}px;background:rgba(0,0,0,.12)"></div>'
    + ${size.bottom ? `'<div style="position:absolute;left:50%;top:${size.h - 13}px;width:140px;height:5px;margin-left:-70px;border-radius:3px;background:#000"></div>'` : `''`}
    + '<div style="position:absolute;left:0;right:0;top:${size.h}px;border-top:3px dashed #E0002B"></div>'
    + '<div style="position:absolute;right:6px;top:${size.h + 4}px;font:600 13px system-ui;color:#fff;background:#E0002B;padding:2px 6px;border-radius:6px">bottom of the screen</div>';
  document.body.appendChild(d);
})()`;

/* ---------- a tiny web server for the game files ---------- */
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
export function serve(PORT) {
  const server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    fs.readFile(p, (err, data) => {
      if (err) { res.writeHead(404).end(); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(p).toLowerCase()] || 'application/octet-stream' }).end(data);
    });
  });
  return new Promise(r => server.listen(PORT, '127.0.0.1', () => r(server)));
}

/* ---------- talking to Chrome ---------- */
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function startChrome(DEBUG_PORT, extra = []) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'phone-check-'));
  const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio', '--no-first-run', '--no-default-browser-check',
    `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${profile}`, ...extra, 'about:blank'], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) {
    try { const list = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json(); const page = list.find(t => t.type === 'page'); if (page) return { proc, profile, ws: page.webSocketDebuggerUrl }; } catch (e) {}
    await sleep(200);
  }
  proc.kill(); throw new Error('Chrome did not start');
}
export function connect(url) {
  const ws = new WebSocket(url); let id = 0; const waiting = new Map(), listeners = [];
  ws.onmessage = e => { const m = JSON.parse(e.data);
    if (m.id && waiting.has(m.id)) { const { ok, no } = waiting.get(m.id); waiting.delete(m.id); m.error ? no(new Error(m.error.message)) : ok(m.result); }
    else if (m.method) listeners.forEach(l => l(m)); };
  const send = (method, params = {}) => new Promise((ok, no) => { const n = ++id; waiting.set(n, { ok, no }); ws.send(JSON.stringify({ id: n, method, params })); });
  const once = (method, ms = 15000) => new Promise(r => { const t = setTimeout(() => r(null), ms); const l = m => { if (m.method === method) { clearTimeout(t); listeners.splice(listeners.indexOf(l), 1); r(m); } }; listeners.push(l); });
  return new Promise((r, no) => { ws.onopen = () => r({ send, once, close: () => ws.close() }); ws.onerror = no; });
}

