/* =========================================================
   WORLD: Phonics Forest (Meadow Words, Year 2)
   Build words from wooden letter tiles: split digraphs and vowel sounds.
   Questions, hints and Bonnie's lines are unchanged from the
   original meadow-words.html. Level ids never change (saves use them).
   ========================================================= */
(() => {
'use strict';
const { $, $$, esc, fmt, rand, shuffle, say, sfx, animate, draggable, bonnieSVG } = Meadow.ui;
const { bubble, later } = Meadow;
const cap1 = w => w ? w[0].toUpperCase() + w.slice(1) : w;
// Bonnie's praise in every English world (the core adds "Well done for watching and learning" when she showed the answer)
const PRAISE = ["Pawsome, {N}!", "Woof! Brilliant!", "You're a word wizard, {N}!", "Tail-waggingly good!", "Super job, {N}!", "Bone-tastic!", "Wow! Clever clogs!"];
const HINTS = ['Sniff Clue', 'Scout Tip!', 'Paw Help', 'Watch Me!'];
// what the speech bubble reads out (its text, without tags), for the voice-clip list
const text = h => String(h).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

/* Phoneme approximations for sound buttons. Long vowels use letter names (A = "ay"). */
const PH = { a: 'ah', b: 'buh', c: 'kuh', d: 'duh', e: 'eh', f: 'fff', g: 'guh', h: 'huh', i: 'ih', j: 'juh', k: 'kuh', l: 'lll', m: 'mmm', n: 'nnn', o: 'o', p: 'puh', q: 'kwuh', r: 'rrr', s: 'sss', t: 'tuh', u: 'uh', v: 'vvv', w: 'wuh', x: 'ks', y: 'yuh', z: 'zzz',
  sh: 'shh', ch: 'chuh', th: 'thh', ng: 'ng', ck: 'kuh', sc: 'sss', ai: 'A', ay: 'A', ee: 'E', ea: 'E', igh: 'I', ie: 'I', oa: 'O' };
const LONG = { a: 'A', e: 'E', i: 'I', o: 'O', u: 'U' };
/* The e in a split digraph (a-e, i-e...) has no sound of its own, so Bonnie names it instead. */
const MAGIC_E = 'magic e', MAGIC_E_TIP = 'Magic e! It makes the vowel say its name!';

const ph = (word, emoji, parts, clue, extra) => ({ word, emoji, parts, clue, extra });
const PHONICS = [
  { title: 'a-e  (cake, snake)', split: true, pool: ['i', 'o', 'u', 'e', 't', 'b'], tip: "Remember, when 'e' sits at the end, it jumps over a letter and makes the vowel say its name! a-e says 'ay'.", items: [
    ph('cake', '🎂', ['c', 'a', 'k', 'e'], 'A yummy birthday ___!'), ph('snake', '🐍', ['s', 'n', 'a', 'k', 'e'], 'A long, wiggly ___.'),
    ph('grape', '🍇', ['g', 'r', 'a', 'p', 'e'], 'A juicy purple ___.'), ph('plane', '✈️', ['p', 'l', 'a', 'n', 'e'], 'Zoom! A ___ in the sky.'),
    ph('game', '🎮', ['g', 'a', 'm', 'e'], "Let's play a ___!"), ph('wave', '🌊', ['w', 'a', 'v', 'e'], 'A big ___ at the seaside.'),
    ph('skate', '⛸️', ['s', 'k', 'a', 't', 'e'], 'I can ___ on the ice.')] },
  { title: 'i-e & o-e  (kite, bone)', split: true, pool: ['a', 'u', 'o', 'i', 'd', 's'], tip: "Magic 'e' at the end makes the vowel say its name! i-e says 'eye' and o-e says 'oh'.", items: [
    ph('kite', '🪁', ['k', 'i', 't', 'e'], 'Fly a ___ in the wind.'), ph('bike', '🚲', ['b', 'i', 'k', 'e'], 'Ride my ___ to the park.'),
    ph('five', '5️⃣', ['f', 'i', 'v', 'e'], 'One, two, three, four, ___!'), ph('smile', '😊', ['s', 'm', 'i', 'l', 'e'], 'Show me a big ___!'),
    ph('bone', '🦴', ['b', 'o', 'n', 'e'], "Bonnie's favourite ___!"), ph('rope', '🪢', ['r', 'o', 'p', 'e'], 'Skip with a ___.'),
    ph('nose', '👃', ['n', 'o', 's', 'e'], 'Bonnie sniffs with her ___.'), ph('home', '🏠', ['h', 'o', 'm', 'e'], 'Time to go ___.'),
    ph('globe', '🌍', ['g', 'l', 'o', 'b', 'e'], 'Spin the ___ to see the world.')] },
  { title: 'u-e & e-e  (cube, these)', split: true, pool: ['a', 'o', 'i', 'ee', 's', 'd'], tip: "When 'e' is at the end, u-e says 'you' and e-e says 'ee'. The 'e' at the end is a quiet helper!", items: [
    ph('cube', '🧊', ['c', 'u', 'b', 'e'], 'An ice ___ in my drink.'), ph('tube', '🚇', ['t', 'u', 'b', 'e'], 'Ride the London ___!'),
    ph('cute', '🐶', ['c', 'u', 't', 'e'], 'Bonnie is so ___!'), ph('mute', '🔇', ['m', 'u', 't', 'e'], 'Press ___ to stop the sound.'),
    ph('these', '👟', ['th', 'e', 's', 'e'], 'I like ___ shoes!'), ph('theme', '🏴‍☠️', ['th', 'e', 'm', 'e'], 'The party ___ is pirates!'),
    ph('scene', '🎬', ['sc', 'e', 'n', 'e'], 'Cut! On to the next ___!')] },
  { title: 'ai / ay  (rain, day)', split: false, pool: ['e', 'o', 'b', 'm'], tip: "'ay' likes to sit at the END of a word, like 'day'. 'ai' likes to be in the MIDDLE, like 'rain'!", items: [
    ph('rain', '🌧️', ['r', 'ai', 'n'], 'Pitter-patter, here comes the ___.', ['ay']), ph('train', '🚂', ['t', 'r', 'ai', 'n'], 'Choo choo! All aboard the ___!', ['ay']),
    ph('snail', '🐌', ['s', 'n', 'ai', 'l'], 'A slow, slimy ___.', ['ay']), ph('paint', '🎨', ['p', 'ai', 'n', 't'], 'Let us ___ a picture.', ['ay']),
    ph('tail', '🐕', ['t', 'ai', 'l'], 'Bonnie wags her ___.', ['ay']), ph('day', '☀️', ['d', 'ay'], 'What a sunny ___!', ['ai']),
    ph('play', '⚽', ['p', 'l', 'ay'], "Let's go out and ___!", ['ai']), ph('tray', '🍽️', ['t', 'r', 'ay'], 'Carry the cups on a ___.', ['ai']),
    ph('hay', '🌾', ['h', 'ay'], 'The horse eats ___.', ['ai'])] },
  { title: 'ee ea igh ie  (tree, leaf)', split: false, pool: ['a', 'o', 'u', 'y'], tip: "'ee' and 'ea' both say 'ee'. 'igh' and 'ie' both say 'eye'. Think about which one LOOKS right — like a word detective!", items: [
    ph('tree', '🌳', ['t', 'r', 'ee'], 'Bonnie naps under the ___.', ['ea']), ph('sheep', '🐑', ['sh', 'ee', 'p'], 'Baa! says the ___.', ['ea']),
    ph('bee', '🐝', ['b', 'ee'], 'Buzz! A busy ___.', ['ea']), ph('leaf', '🍃', ['l', 'ea', 'f'], 'A green ___ falls down.', ['ee']),
    ph('beach', '🏖️', ['b', 'ea', 'ch'], 'Build a sandcastle on the ___.', ['ee']), ph('tea', '🍵', ['t', 'ea'], 'Gran drinks a cup of ___.', ['ee']),
    ph('light', '💡', ['l', 'igh', 't'], 'Switch on the ___.', ['ie']), ph('night', '🌙', ['n', 'igh', 't'], 'The moon comes out at ___.', ['ie']),
    ph('pie', '🥧', ['p', 'ie'], 'A warm apple ___.', ['igh']), ph('tie', '👔', ['t', 'ie'], 'Dad wears a ___.', ['igh'])] },
];

const CSS = `
/* ---------- Phonics ---------- */
.clue{display:flex;align-items:center;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:14px}
.clue-pic{font-size:5rem;line-height:1;background:#F4ECDC;border-radius:24px;width:120px;height:120px;display:grid;place-items:center;animation:floaty 3s ease-in-out infinite}
.clue-text{font-family:var(--font-read);font-size:1.35rem;max-width:340px;text-align:center}
.word-wrap{display:flex;justify-content:center;margin:12px 0 6px}
.word-row{position:relative;display:flex;gap:10px;align-items:flex-start;padding-bottom:30px}
.slot-wrap{display:flex;flex-direction:column;align-items:center;gap:8px}
.slot{min-width:74px;height:84px;border-radius:16px;border:3px dashed #CDBB9C;background:#F7F0E2;display:grid;place-items:center;transition:all .15s}
.slot.wide{min-width:104px}
.slot.drop-hover{background:#FFF2C9;border-color:var(--gold);transform:scale(1.06)}
.slot.locked{border-style:solid;border-color:var(--leaf);background:#E8F3DF}
.slot.bad{animation:shake .45s;border-color:var(--berry);background:#FBE3E6}
.slot.glow{box-shadow:0 0 0 5px rgba(242,193,78,.6)}
.sb{width:18px;height:18px;border-radius:50%;background:var(--ink);opacity:.8;transition:transform .1s}
.sb.dash{width:46px;border-radius:9px;height:12px;margin-top:3px}
.sb:active,.sb.say{transform:scale(1.35);background:var(--accent);opacity:1}
.arc{position:absolute;bottom:4px;height:22px;border:5px solid var(--ink);border-top:none;border-radius:0 0 40px 40px;opacity:.8;pointer-events:none}
.bank{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;padding:16px;border-radius:20px;background:repeating-linear-gradient(90deg,#EAD9BA 0 22px,#E3D0AD 22px 44px);min-height:110px;margin-top:10px;border:3px solid #D5BE95}
.bank.drop-hover{outline:4px solid var(--gold)}
.tile{font-family:var(--font-read);font-weight:700;font-size:2.4rem;min-width:70px;height:78px;padding:0 12px;border-radius:14px;display:grid;place-items:center;color:#3B2A1A;
  background:linear-gradient(180deg,var(--wood-light),var(--wood));border-bottom:6px solid var(--wood-dark);box-shadow:0 4px 8px rgba(74,59,44,.25), inset 0 2px 0 rgba(255,255,255,.5);
  touch-action:none;cursor:grab;position:relative}
.tile::after{content:"";position:absolute;inset:6px;border-radius:10px;background:repeating-linear-gradient(100deg,transparent 0 9px,rgba(154,106,58,.07) 9px 11px);pointer-events:none}
.tile.in-slot{height:76px;min-width:66px}
.tile.dragging{opacity:.3}
.tile.snap{animation:snap .4s cubic-bezier(.3,1.6,.5,1)}
.drag-ghost{position:fixed!important;z-index:100;pointer-events:none;transform:scale(1.12) rotate(-4deg);box-shadow:0 18px 30px rgba(0,0,0,.25)!important;margin:0!important}
.gap{display:inline-block;min-width:120px;border-bottom:4px dashed var(--accent);margin:0 6px;color:var(--leaf-dark);font-weight:700}
.mode-tip{text-align:center;font-family:var(--font-read);font-size:1.2rem;color:var(--ink-soft)}
@media (max-width:520px){
  .tile{font-size:1.8rem;min-width:54px;height:62px}
  .slot{min-width:56px;height:68px}.slot.wide{min-width:80px}
  .tile.in-slot{min-width:50px;height:60px}
  .word-row{gap:6px}
  .clue-pic{width:96px;height:96px;font-size:4rem}
}
@keyframes floaty{50%{transform:translateY(-6px) rotate(2deg)}}
@keyframes snap{0%{transform:scale(1.3) translateY(-10px)}60%{transform:scale(.92)}100%{transform:scale(1)}}
`;

function playPhonics(item, ctx) {
  const L = ctx.level, parts = item.parts, n = parts.length;
  const vIdx = L.split ? n - 3 : -1, eIdx = L.split ? n - 1 : -1;
  const extras = item.extra ? [...item.extra] : [];
  const pool = shuffle(L.pool.filter(p => !parts.includes(p) && !extras.includes(p)));
  while (extras.length < 2 && pool.length) extras.push(pool.shift());
  let order; do { order = shuffle([...parts, ...extras]); } while (order.slice(0, n).join() === parts.join() && n > 1);
  const tiles = order.map((g, id) => ({ id, g }));
  const slot = Array(n).fill(null), lock = Array(n).fill(false);
  const soundOf = (g, i) => (i === vIdx || i === eIdx) ? LONG[parts[vIdx]] : (PH[g] || g);
  const segmented = () => parts.map((g, i) => i === eIdx ? MAGIC_E : soundOf(g, i)).join('... ');
  const clue = item.clue ? esc(fmt(item.clue)).replace('___', '<span class="gap">&nbsp;?&nbsp;</span>') : 'Build the word!';

  const area = ctx.area;
  area.innerHTML = `
    <div class="clue">
      <div class="clue-pic">${item.emoji}</div>
      <div><div class="clue-text">${clue}</div>
      <div class="row-btns" style="margin-top:10px"><button class="btn small" id="hear">🔊 Hear the word</button></div></div>
    </div>
    <div class="word-wrap"><div class="word-row" id="row"></div></div>
    <div class="row-btns"><button class="btn small ghost" id="blend">🗣️ Blend it!</button></div>
    <div class="bank" id="bank"></div>
    <p class="mode-tip">Drag or tap the wooden letters. Tap the dots to hear each sound!</p>`;
  $('#hear').onclick = () => say(item.word, { rate: .75 });
  $('#blend').onclick = () => {
    const filled = parts.map((_, i) => slot[i] != null ? soundOf(tiles[slot[i]].g, i) : null);
    if (filled.every(x => x == null)) { bubble('Put some letters in first, then we can blend them!'); return; }
    const seq = filled.map((x, i) => x && i === eIdx ? MAGIC_E : x).filter(Boolean).join('... ');
    const complete = parts.every((p, i) => slot[i] != null && tiles[slot[i]].g === p);
    say(seq + (complete ? '... ' + item.word : ''), { rate: .7 });
  };

  function place(tid, i) {
    if (slot.includes(tid)) slot[slot.indexOf(tid)] = null;
    if (i == null) i = slot.findIndex((s, k) => s == null && !lock[k]);
    if (i < 0 || lock[i]) { draw(); return; }
    slot[i] = tid; sfx.snap(); draw(i);
    if (slot.every(s => s != null)) setTimeout(check, (Meadow.round() || {}).helped ? 1300 : 450);
  }
  function unplace(tid) { const i = slot.indexOf(tid); if (i >= 0 && !lock[i]) { slot[i] = null; sfx.pick(); draw(); } }
  function draw(snapIdx = -1) {
    const row = $('#row'); if (!row) return;
    row.innerHTML = parts.map((p, i) => {
      const t = slot[i] != null ? tiles[slot[i]] : null;
      return `<div class="slot-wrap"><div class="slot ${p.length > 1 ? 'wide' : ''} ${lock[i] ? 'locked' : ''}" data-i="${i}">
        ${t ? `<span class="tile in-slot ${i === snapIdx ? 'snap' : ''}" data-t="${t.id}">${esc(t.g)}</span>` : ''}</div>
        <button class="sb ${p.length > 1 ? 'dash' : 'dot'}" data-i="${i}" aria-label="Play sound"></button></div>`;
    }).join('') + (L.split ? '<div class="arc" id="arc"></div>' : '');
    $('#bank').innerHTML = tiles.filter(t => !slot.includes(t.id)).map(t => `<span class="tile" data-t="${t.id}">${esc(t.g)}</span>`).join('');
    $$('#bank .tile').forEach(el => draggable(el, { dropSel: '.slot, #bank', onTap: () => place(+el.dataset.t), onDrop: tg => { if (tg && tg.classList.contains('slot')) place(+el.dataset.t, +tg.dataset.i); } }));
    $$('#row .tile').forEach(el => { const i = slot.indexOf(+el.dataset.t); if (lock[i]) return;
      draggable(el, { dropSel: '.slot, #bank', onTap: () => unplace(+el.dataset.t), onDrop: tg => { if (!tg) return; if (tg.id === 'bank') unplace(+el.dataset.t); else place(+el.dataset.t, +tg.dataset.i); } }); });
    $$('#row .sb').forEach(b => b.onclick = () => {
      const i = +b.dataset.i;
      if (slot[i] == null) { animate(b, 'say', 300); bubble('Put a letter here first, then tap me!', false); return; }
      const g = tiles[slot[i]].g; animate(b, 'say', 400);
      if (L.split && (i === vIdx || i === eIdx)) { $$('#row .sb').filter(x => +x.dataset.i === vIdx || +x.dataset.i === eIdx).forEach(x => animate(x, 'say', 400)); }
      say(i === eIdx ? MAGIC_E_TIP : soundOf(g, i), { rate: .75 });
    });
    if (L.split) requestAnimationFrame(() => {
      const arc = $('#arc'), sbs = $$('#row .sb'); if (!arc || !sbs[vIdx]) return;
      const rr = $('#row').getBoundingClientRect(), a = sbs[vIdx].getBoundingClientRect(), b = sbs[eIdx].getBoundingClientRect();
      arc.style.left = (a.left - rr.left + a.width / 2) + 'px'; arc.style.width = (b.left - a.left) + 'px';
    });
  }
  function check() {
    if (Meadow.isBusy() || !$('#row')) return;
    const wrong = parts.map((p, i) => tiles[slot[i]].g !== p);
    if (!wrong.includes(true)) {
      lock.fill(true); draw();
      $$('#row .slot').forEach((s, i) => setTimeout(() => animate(s, 'snap', 400), i * 80));
      Meadow.correct($('#row'), { sayFirst: segmented() + '... ' + item.word });
      return;
    }
    wrong.forEach((w, i) => { if (!w) lock[i] = true; });
    $$('#row .slot').forEach((s, i) => wrong[i] && s.classList.add('bad'));
    Meadow.wrong(wrong.filter(Boolean).length === 1 ? fmt("So close, {N}! Just one letter needs swapping.") : null);
    setTimeout(() => { wrong.forEach((w, i) => { if (w) slot[i] = null; }); draw(); }, 650);
  }
  ctx.hints([
    () => { later(() => say(`Listen... ${segmented()}... ${item.word}`, { rate: .65 }), 1600); return `Say it slowly with me: <b>${esc(item.word)}</b>. How many sounds can you hear?`; },
    () => esc(L.tip),
    () => { // place the next correct tile
      const i = parts.findIndex((p, k) => !lock[k] && (slot[k] == null || tiles[slot[k]].g !== p));
      if (i < 0) return 'You have all the letters — tap Blend it!';
      if (slot[i] != null) slot[i] = null;
      let t = tiles.find(t => t.g === parts[i] && !slot.includes(t.id));
      if (!t) { const k = parts.findIndex((p, k) => slot[k] != null && tiles[slot[k]].g === parts[i] && p !== parts[i]); t = tiles[slot[k]]; slot[k] = null; }
      lock[i] = true; slot[i] = t.id; draw(i); $$('#row .slot')[i].classList.add('glow');
      if (slot.every(s => s != null)) later(check, 600);
      return `I've sniffed out a letter for you: <b>${esc(parts[i])}</b>. Can you do the rest?`;
    },
    () => {
      slot.fill(null); const used = new Set();
      parts.forEach((p, i) => { const t = tiles.find(t => t.g === p && !used.has(t.id)); used.add(t.id); slot[i] = t.id; });
      lock.fill(true); draw(); $$('#row .slot').forEach(s => s.classList.add('glow'));
      later(check, 600); // well-done then sounds it out: segmented... word
      return `Watch me build it: <b>${esc(parts.join(' '))}</b> makes <b>${esc(item.word)}</b>!`;
    },
  ]);
  draw();
  bubble(fmt(ctx.index === 0 ? `Let's build some words, {N}! What's this picture?` : rand(["What word is this?", "Can you build this one?", "Sniff sniff… what's this?"])), false);
  later(() => say(item.word, { rate: .8 }), 300);
}

/* Every line Bonnie can say in this world (for tools/make-voice.mjs). */
function lines() {
  const out = [], add = (...xs) => xs.forEach(x => out.push(fmt(x)));
  const hint = (tier, html) => add(text(`<b>${HINTS[tier]}</b> ${html}`));
  add('Put some letters in first, then we can blend them!', 'So close, {N}! Just one letter needs swapping.', MAGIC_E_TIP);
  hint(2, 'You have all the letters — tap Blend it!');
  PHONICS.forEach(L => L.items.forEach(item => {
    const parts = item.parts, n = parts.length, vIdx = L.split ? n - 3 : -1, eIdx = L.split ? n - 1 : -1;
    const soundOf = (g, i) => (i === vIdx || i === eIdx) ? LONG[parts[vIdx]] : (PH[g] || g);
    [...L.pool, ...parts, ...(item.extra || [])].forEach(g => add(PH[g] || g));
    if (L.split) add(LONG[parts[vIdx]]);
    const seg = parts.map((g, i) => i === eIdx ? MAGIC_E : soundOf(g, i)).join('... ');
    add(item.word, `Listen... ${seg}... ${item.word}`, `${seg}... ${item.word}!`);
    hint(0, `Say it slowly with me: <b>${esc(item.word)}</b>. How many sounds can you hear?`); hint(1, esc(L.tip));
    parts.forEach(p => hint(2, `I've sniffed out a letter for you: <b>${esc(p)}</b>. Can you do the rest?`));
    hint(3, `Watch me build it: <b>${esc(parts.join(' '))}</b> makes <b>${esc(item.word)}</b>!`);
  }));
  return out;
}

const IDS = ["a-e", "i-e-o-e", "u-e-e-e", "ai-ay", "ee-ea-igh-ie"];
Meadow.registerWorld({
  id: 'y2-english-phonics', subject: 'english', year: 2,
  name: "Phonics Forest", tag: "Split digraphs & sneaky sounds", icon: '🌲', color: '#6BA368', tint: '#E3F1D8',
  perLevel: 6, praise: PRAISE, hintNames: HINTS, css: CSS, play: playPhonics, lines,
  levels: PHONICS.map((L, i) => ({ ...L, id: IDS[i], name: L.title })),
});
})();
