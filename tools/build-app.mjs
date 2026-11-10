// Copies only the game files into app-www/, the folder the App Store app is made from.
// Tests, tools, briefs, docs and the website's service worker are left out.
// Run with:  npm run app:build   (npm run app:sync also copies it into the Xcode project)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'app-www');
const FILES = ['index.html', 'meadow-maths.html', 'meadow-words.html', 'bonnies-walk.html',
  'bonnie-voice.js', 'meadow-backup.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
const FOLDERS = ['js', 'worlds', 'fonts', 'audio'];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
for (const f of FILES) fs.copyFileSync(path.join(root, f), path.join(out, f));
for (const d of FOLDERS) fs.cpSync(path.join(root, d), path.join(out, d), { recursive: true });

const fontsReady = fs.existsSync(path.join(root, 'fonts', 'Fredoka.ttf'));
let files = 0, bytes = 0;
(function count(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, e.name); if (e.isDirectory()) count(p); else { files++; bytes += fs.statSync(p).size; } } })(out);
console.log(`app-www ready: ${files} files, ${(bytes / 1048576).toFixed(1)} MB`);
if (!fontsReady) console.log('Note: the font files are missing. Run  sh tools/get-fonts.sh  first.');
