/* =========================================================
   WORLD: Phonics Forest (Meadow Words, Year 2)
   Build words from wooden letter tiles: split digraphs and vowel sounds.
   Levels 6 to 10 (24 November 2026) are Year 2 spelling patterns and suffixes.
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
.sb{width:18px;height:18px;border-radius:50%;background:var(--ink);opacity:.8;transition:transform .1s;position:relative}
.sb::after{content:'';position:absolute;inset:-13px}
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
  /* phones (16 November 2026): the picture sits beside the sentence, and the letter tray is tighter */
  .clue{flex-wrap:nowrap;gap:12px;margin-bottom:8px}
  .clue-pic{width:72px;height:72px;font-size:3rem;flex:none}
  .clue-text{text-align:left}
  .word-wrap{margin:8px 0 2px}
  .bank{gap:8px;padding:10px;min-height:0;margin-top:6px}
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
  const clue = item.clue ? esc(fmt(item.clue)).replace('___', '<span class="gap"><span aria-hidden="true">&nbsp;?&nbsp;</span><span class="sr">blank</span></span>') : 'Build the word!';

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

/* =========================================================
   PHONICS FOREST, LEVELS 6 TO 10 (24 November 2026): Year 2 spelling
   Tricky consonants, word endings, changing words (adding -ing, -ed, -er, -est, -y), suffix builders
   (-ment, -ness, -ful, -less, -ly) and same sound, different spelling. These go after the first five
   levels, with new ids, so stars saved against the first five stay exactly as they are.
   These are spelling levels, not blending: Bonnie says whole words (which her voice says well), names
   letters when she spells a pattern out ("d, g, e"), and describes a sound by a word that has it ("the
   sound at the end of badge"). She never says a consonant sound on its own here, because a recorded voice
   can't say "b" or "t" without adding an "uh" (see docs/MEADOW_WORDS_CURRICULUM.md, "The sound audit").
   Each spelling pattern is taught on a card the first time it comes up in a run (teach, then practise).
   ========================================================= */
/* A spelling pattern: what Bonnie teaches, why a word is spelt that way (by the right answer, where a
   group has more than one), and words that have it (for the "It's like..." hint). */
const PATTERNS = {
  dge: { name: 'dge and ge', teach: 'At the end of a word, the sound at the end of badge is usually spelt d, g, e straight after a short vowel sound, like badge, edge and bridge. After other sounds it is usually spelt g, e, like huge, page and large.',
    why: { dge: 'It comes straight after a short vowel sound, so it is spelt d, g, e.', ge: 'It comes after a long vowel sound, so it is spelt g, e.' },
    like: { dge: ['badge', 'edge', 'bridge', 'fudge'], ge: ['huge', 'page', 'cage', 'large'] } },
  softc: { name: 'Soft c', teach: 'The letter c often makes the sound at the start of sun when it comes before e, i or y, like ice, city and fancy.',
    why: 'The c comes before e, i or y, so it makes the sound at the start of sun.', like: ['ice', 'city', 'face', 'race', 'fancy'] },
  kn: { name: 'kn and gn', teach: 'Some words start with a silent k or g before the n, like knee, knock and gnat. Hundreds of years ago, people said the k and the g out loud!',
    why: { kn: 'The k is silent.', gn: 'The g is silent.' }, like: { kn: ['knee', 'knock', 'know', 'knot'], gn: ['gnaw', 'gnome'] } },
  wr: { name: 'wr', teach: 'Some words start with a silent w before the r, like write, wrong and wrap.',
    why: 'The w is silent.', like: ['write', 'wrong', 'wrap', 'wrist', 'wriggle'] },
  ending: { name: 'le, el, al and il', teach: 'Lots of words end in l, e, like apple, table and little. That is the most common way. Some end in e, l, like camel and towel. Some end in a, l, like animal and metal. Just a few end in i, l, like pencil and fossil.',
    why: { le: 'L, e is the most common way to spell this ending.', el: 'E, l often comes after m, n, r, s, v or w.', al: 'Some words, like this one, end in a, l.', il: 'Only a few words end in i, l, and this is one of them.' },
    like: { le: ['apple', 'table', 'little', 'middle'], el: ['camel', 'tunnel', 'towel', 'travel'], al: ['animal', 'metal', 'pedal', 'hospital'], il: ['pencil', 'fossil', 'nostril'] } },
  tion: { name: 'tion', teach: 'The sound at the end of station is often spelt t, i, o, n, like station, lotion and potion. It sounds like shun, but we spell it t, i, o, n.',
    why: 'The shun sound at the end is often spelt t, i, o, n.', like: ['station', 'lotion', 'potion', 'section', 'motion'] },
  y: { name: 'y at the end', teach: 'At the end of a word, the sound at the end of cry is often spelt with the letter y, like fly, dry and July.',
    why: 'At the end of a word, this sound is often spelt with the letter y.', like: ['cry', 'fly', 'dry', 'try', 'July'] },
  ey: { name: 'ey at the end', teach: 'Some words end in e, y, making the sound at the end of key, like donkey, monkey and chimney.',
    why: 'It is one of the words that end in e, y.', like: ['key', 'donkey', 'monkey', 'chimney', 'valley'] },
  al2: { name: 'a before l', teach: 'Before l or double l, the sound in ball is usually spelt with the letter a, like all, walk and talk.',
    why: 'Before l, this sound is usually spelt with the letter a.', like: ['ball', 'all', 'call', 'walk', 'talk'] },
  o: { name: 'o in mother', teach: 'In some words, the sound in the middle of mother is spelt with the letter o, like brother, nothing and Monday.',
    why: 'In this word, the sound is spelt with the letter o, like in mother.', like: ['mother', 'brother', 'other', 'nothing', 'Monday'] },
  wor: { name: 'or after w', teach: 'After w, the sound in word is often spelt o, r, like work, worm and world.',
    why: 'After w, this sound is often spelt o, r.', like: ['word', 'work', 'worm', 'world'] },
  war: { name: 'ar after w', teach: 'After w, the sound in warm is often spelt a, r, like war and warm.',
    why: 'After w, this sound is often spelt a, r.', like: ['war', 'warm', 'towards'] },
  wa: { name: 'a after w', teach: 'After w, the sound in hot is often spelt with the letter a, like want, watch and wander.',
    why: 'After w, this sound is often spelt with the letter a.', like: ['want', 'watch', 'wander', 'swan'] },
  change: { name: 'Adding an ending', teach: 'When we add an ending that starts with a vowel, like ing, ed, er, est, or the ending y, the root word can change. We drop an e at the end. We double one last consonant after a short vowel sound. We change a y to i after a consonant, but not before ing. Often, we just add it!', like: [] },
  suffix: { name: 'Suffixes', teach: 'Ful means full of. Less means without. Ness and ment make naming words, like kindness. Ly tells us how something is done, like quickly. Usually we just add them, but a y after a consonant changes to i, like happiness.', like: [] },
};
/* Fill the gap: the word in parts, which part the child chooses (t), the choices (the right one first), the picture and a sentence. */
const fill = (g, parts, t, opts, emoji, clue) => ({ kind: 'fill', g, parts, t, opts, word: parts.join(''), emoji, clue });
/* Changing words: root + ending, and the rule (drop the e, double, y to i, or just add). ask: also ask why (the right reason first). note: Bonnie's reason, if not the usual one. */
const chg = (root, suf, rule, more = {}) => ({ kind: 'change', g: 'change', root, suf, rule, ...more });
/* Suffix builders: root, sentence with ___, the right suffix and two others, picture. */
const sfx2 = (root, s, answer, wrong, emoji) => ({ kind: 'suffix', g: 'suffix', root, s, answer, wrong, emoji });
const RULES2 = [['e', 'Drop the e'], ['double', 'Double the last letter'], ['yi', 'Change y to i'], ['add', 'Just add it']];
/* The spelling rules from English Appendix 1 (Year 2), as code, so every answer in the bank is worked out (and checked by tools/words-audit.mjs). */
const VOWEL = /[aeiou]/;
function applyRule(root, suf, rule) {
  if (rule === 'e') return root.slice(0, -1) + suf;
  if (rule === 'double') return root + root.slice(-1) + suf;
  if (rule === 'yi') return root.slice(0, -1) + 'i' + suf;
  return root + suf;
}
function ruleFor(root, suf) {
  const last = root.slice(-1), before = root.slice(-2, -1), vowelSuf = VOWEL.test(suf[0]) || suf === 'y';
  // consonant + y: y changes to i (cried, happiness), but not before ing (crying), nor for -ly and the like on one-syllable words (shyness)
  if (last === 'y' && !VOWEL.test(before) && suf !== 'ing') return (vowelSuf || root.length > 3) ? 'yi' : 'add';
  if (!vowelSuf) return 'add';                                        // -ment, -ness, -ful, -less, -ly: usually straight on
  if (last === 'e' && !VOWEL.test(before)) return 'e';                // hike → hiking
  const syllables = (root.match(/[aeiouy]+/g) || []).length;
  if (syllables === 1 && /^[^aeiou]*[aeiou][b-df-hj-np-tvz]$/.test(root)) return 'double'; // hop → hopping (never x, w or y)
  return 'add';
}
const WHY_RULE = {
  e: (it, out) => `${it.root} ends in e. We drop the e before adding ${it.suf}, so it becomes ${out}.`,
  double: (it, out) => `${it.root} has a short vowel sound and ends in one consonant, ${it.root.slice(-1)}. We double it to keep the vowel short: ${out}.`,
  yi: (it, out) => `${it.root} ends in a consonant and then y. We change the y to i before ${it.suf}: ${out}.`,
  add: (it, out) => `Nothing needs to change, so we just add ${it.suf}: ${out}.`,
};

const FOREST2 = [
  { id: 'tricky-consonants', title: 'Tricky Consonants  (badge, knee)', items: [
    fill('dge', ['ba', 'dge'], 1, ['dge', 'ge'], '📛', 'Mia wears a shiny ___ on her coat.'),
    fill('dge', ['bri', 'dge'], 1, ['dge', 'ge'], '🌉', 'We walked over the ___ to the other side of the river.'),
    fill('dge', ['he', 'dge'], 1, ['dge', 'ge'], '🌿', 'Bonnie hid behind the ___ in the garden.'),
    fill('dge', ['hu', 'ge'], 1, ['ge', 'dge'], '🐘', 'An elephant is ___!'),
    fill('dge', ['pa', 'ge'], 1, ['ge', 'dge'], '📖', 'Turn the ___ of your book.'),
    fill('softc', ['c', 'ity'], 0, ['c', 's'], '🏙️', 'London is a very big ___.'),
    fill('softc', ['i', 'c', 'e'], 1, ['c', 's'], '🧊', 'The pond was covered in ___.'),
    fill('softc', ['fa', 'c', 'e'], 1, ['c', 's'], '😊', 'Bonnie licked my ___!'),
    fill('kn', ['kn', 'ee'], 0, ['kn', 'n'], '🦵', 'I fell over and hurt my ___.'),
    fill('kn', ['kn', 'ock'], 0, ['kn', 'n'], '🚪', 'There was a loud ___ at the door.'),
    fill('kn', ['gn', 'at'], 0, ['gn', 'n'], '🦟', 'A tiny ___ buzzed past my ear.'),
    fill('wr', ['wr', 'iggle'], 0, ['wr', 'r'], '🪱', 'Watch the worm ___ in the mud.'),
    fill('wr', ['wr', 'ong'], 0, ['wr', 'r'], '❌', 'Oops! That answer is ___.'),
    fill('wr', ['wr', 'ist'], 0, ['wr', 'r'], '⌚', 'Grandad wears his watch on his ___.'),
  ] },
  { id: 'word-endings', title: 'Word Endings  (apple, camel)', items: [
    fill('ending', ['app', 'le'], 1, ['le', 'el', 'il'], '🍎', 'I had a crunchy ___ for my snack.'),
    fill('ending', ['bott', 'le'], 1, ['le', 'el', 'al'], '🍼', 'The baby drank milk from a ___.'),
    fill('ending', ['litt', 'le'], 1, ['le', 'el', 'al'], '🐭', 'A ___ mouse ran under the door.'),
    fill('ending', ['cam', 'el'], 1, ['el', 'le', 'al'], '🐫', 'A ___ has a hump on its back.'),
    fill('ending', ['tunn', 'el'], 1, ['el', 'le', 'al'], '🚇', 'The train went into a dark ___.'),
    fill('ending', ['tow', 'el'], 1, ['el', 'le', 'al'], '🛁', 'Dry your hands on the ___.'),
    fill('ending', ['anim', 'al'], 1, ['al', 'le', 'el'], '🐾', 'A dog is an ___.'),
    fill('ending', ['met', 'al'], 1, ['al', 'le', 'el'], '🔩', 'The gate is made of ___.'),
    fill('ending', ['ped', 'al'], 1, ['al', 'le', 'el'], '🚲', 'Push the ___ to make the bike go.'),
    fill('ending', ['penc', 'il'], 1, ['il', 'le', 'el'], '✏️', 'Write your name with a ___.'),
    fill('ending', ['foss', 'il'], 1, ['il', 'le', 'el'], '🐚', 'We found a ___ in the rock.'),
    fill('tion', ['sta', 'tion'], 1, ['tion', 'shun'], '🚉', 'The train stopped at the ___.'),
    fill('tion', ['lo', 'tion'], 1, ['tion', 'shun'], '🧴', 'Mum put sun ___ on my arms.'),
    fill('tion', ['po', 'tion'], 1, ['tion', 'shun'], '🧪', 'The wizard stirred a magic ___.'),
  ] },
  { id: 'changing-words', title: 'Changing Words  (hop, hopping)', items: [
    chg('hike', 'ing', 'e'), chg('smile', 'ing', 'e'), chg('bake', 'ed', 'e'), chg('nice', 'er', 'e'), chg('shine', 'y', 'e'),
    chg('hop', 'ing', 'double', { ask: ['To keep the o sound short', 'Because hop is a short word'] }),
    chg('run', 'er', 'double'), chg('sad', 'est', 'double'), chg('drop', 'ed', 'double'),
    chg('swim', 'ing', 'double', { ask: ['To keep the i sound short', 'Because swim ends in m'] }),
    chg('happy', 'er', 'yi'), chg('copy', 'ed', 'yi'), chg('funny', 'est', 'yi'),
    chg('cry', 'ed', 'yi', { ask: ['There is a consonant, r, before the y', 'Because cry is a sad word'] }),
    chg('jump', 'ing', 'add', { note: 'Jump ends in two consonants, m and p, so we just add ing: jumping.' }),
    chg('play', 'ed', 'add', { note: 'Play has a vowel, a, before the y, so the y stays: played.' }),
    chg('cold', 'er', 'add', { note: 'Cold ends in two consonants, l and d, so we just add er: colder.' }),
    chg('mix', 'ing', 'add', { note: 'We never double the letter x, so we just add ing: mixing.', ask: ['We never double x', 'Because mix has a short vowel'] }),
    chg('cry', 'ing', 'add', { note: 'We keep the y before ing, or the word would have two i\'s together: crying.', ask: ['So the word doesn\'t have two i\'s together', 'Because cry ends in r'] }),
  ] },
  { id: 'suffix-builders', title: 'Suffix Builders  (kind, kindness)', items: [
    sfx2('care', 'Be ___ with the eggs, or they will break!', 'ful', ['less', 'ness'], '🥚'),
    sfx2('use', 'This pen is ___. It will not write at all!', 'less', ['ful', 'ment'], '🖊️'),
    sfx2('kind', 'Thank you for your ___.', 'ness', ['ful', 'ly'], '💝'),
    sfx2('sad', 'Bonnie looked at the rain ___.', 'ly', ['ness', 'ful'], '🌧️'),
    sfx2('enjoy', 'Reading gives me lots of ___.', 'ment', ['ful', 'ly'], '📚'),
    sfx2('play', 'The kitten is very ___.', 'ful', ['less', 'ment'], '🐱'),
    sfx2('quick', 'Bonnie ran ___ to the gate.', 'ly', ['ness', 'ful'], '💨'),
    sfx2('thank', 'I am very ___ for your help.', 'ful', ['less', 'ness'], '🙏'),
    sfx2('pain', 'Taking the plaster off didn\'t hurt at all. It was ___.', 'less', ['ful', 'ment'], '🩹'),
    sfx2('happy', 'Her face was full of ___.', 'ness', ['ful', 'ly'], '😄'),
    sfx2('easy', 'I did the puzzle ___.', 'ly', ['ness', 'ful'], '🧩'),
  ] },
  { id: 'same-sound-different-spelling', title: 'Same Sound, Different Spelling  (cry, key)', items: [
    fill('y', ['cr', 'y'], 1, ['y', 'igh', 'ie'], '😢', 'The baby began to ___.'),
    fill('y', ['fl', 'y'], 1, ['y', 'igh', 'ie'], '🪰', 'A ___ buzzed round the kitchen.'),
    fill('y', ['Jul', 'y'], 1, ['y', 'igh', 'ie'], '📅', 'My birthday is in ___.'),
    fill('ey', ['k', 'ey'], 1, ['ey', 'ee', 'y'], '🔑', 'Open the door with the ___.'),
    fill('ey', ['donk', 'ey'], 1, ['ey', 'ee', 'y'], '🫏', 'The ___ said hee-haw!'),
    fill('ey', ['monk', 'ey'], 1, ['ey', 'ee', 'y'], '🐒', 'A ___ swung through the trees.'),
    fill('al2', ['w', 'a', 'lk'], 1, ['a', 'or'], '🚶', "Let's go for a ___ in the park."),
    fill('al2', ['b', 'a', 'll'], 1, ['a', 'or'], '⚽', 'Kick the ___ into the goal!'),
    fill('al2', ['t', 'a', 'lk'], 1, ['a', 'or'], '🦜', 'Some parrots can ___!'),
    fill('o', ['br', 'o', 'ther'], 1, ['o', 'u'], '👦', 'My little ___ is two years old.'),
    fill('o', ['M', 'o', 'nday'], 1, ['o', 'u'], '📅', 'School starts again on ___.'),
    fill('wor', ['w', 'or', 'm'], 1, ['or', 'ur', 'er'], '🪱', 'A ___ wriggled in the mud.'),
    fill('wor', ['w', 'or', 'k'], 1, ['or', 'ur', 'er'], '🛠️', 'Dad goes to ___ on the bus.'),
    fill('war', ['w', 'ar', 'm'], 1, ['ar', 'aw'], '🔥', 'The fire kept us ___.'),
    fill('wa', ['w', 'a', 'tch'], 1, ['a', 'o'], '⌚', 'Grandad has a gold ___.'),
  ] },
];
const SP_SAY = {
  fillPrompt: 'Which letters finish the word? Drag or tap the right tile.',
  changePrompt: 'What happens when we add the ending?',
  askPrompt: 'Why?',
  suffixPrompt: 'Which ending makes the sentence make sense?',
  spellPrompt: 'Which is the right spelling?',
  fillWrong: 'Good try! That can make the same sound, but it isn\'t how we spell this word.',
  changeWrong: 'Not quite. Look at the end of the root word. What does it end with?',
  askWrong: 'Hmm, think about the rule again.',
  suffixWrong: 'Read the sentence with that word. Does it make sense?',
  spellWrong: 'Look again at the end of the root word. Does the y change?',
  listen: 'Listen to the whole word, and what it means.',
  narrow: '{L} I\'ve taken one away.',
  narrowRule: 'I\'ve taken away one that doesn\'t fit.',
  show: '{W} Now you put it in!',
  showTap: '{W} Tap the shiny answer!',
  tipBtn: '📘 Spelling tip',
};
const SP_CSS = `
/* ---------- Phonics Forest, levels 6 to 10 (spelling) ---------- */
.sp-teach{margin:0 0 12px;padding:12px 14px;border-radius:16px;background:#F1F7E9;border:2px solid #B9D7A2;font-family:var(--font-read);font-size:1.1rem;line-height:1.45}
.sp-teach b{font-family:var(--font-ui)}
.sp-teach::before{content:"📘 "}
.slot.given{border-style:solid;border-color:#D5BE95;background:#F4ECDC}
.slot.given .tile{cursor:default;box-shadow:none}
.sp-row{display:flex;gap:8px;justify-content:center;align-items:flex-end;flex-wrap:wrap;margin:10px 0}
.sp-l{font-family:var(--font-read);font-weight:700;font-size:2rem;min-width:44px;height:60px;padding:0 6px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(180deg,var(--wood-light),var(--wood));border-bottom:5px solid var(--wood-dark);color:#3B2A1A}
.sp-l.gone{opacity:.5;text-decoration:line-through 4px var(--berry);background:#EEE6D8;border-bottom-color:#C9BBA4}
.sp-l.new{background:linear-gradient(180deg,#FFE7A8,#F2C14E);border-bottom-color:#C99A2E;outline:3px dashed #C99A2E;outline-offset:2px}
.sp-l.suf{background:linear-gradient(180deg,#DDEFD0,#B5DA9B);border-bottom-color:#6E9F58}
.sp-plus{font-family:var(--font-ui);font-size:1.6rem;font-weight:700;color:var(--ink-soft);align-self:center}
.sp-word{text-align:center;font-family:var(--font-read);font-size:2rem;font-weight:700;min-height:48px}
.sp-choices{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:10px}
.sp-choice{font-family:var(--font-read);font-size:1.25rem;font-weight:700;padding:10px 12px;min-height:54px;border-radius:24px;background:linear-gradient(180deg,#FFF,#F3EADA);border:3px solid var(--card-edge);border-bottom-width:6px;color:inherit;cursor:pointer}
.sp-choice.wrong{opacity:.45;text-decoration:line-through 3px}
.sp-choice.wrong::before{content:"✗ "}
.sp-choice.right{background:linear-gradient(180deg,#D8F0C6,#A9D58C);border-color:var(--leaf-dark)}
.sp-choice.right::before{content:"✓ "}
.sp-choice.glow,.tile.glow{box-shadow:0 0 0 5px rgba(242,193,78,.85)}
.sp-why{margin-top:14px;padding:12px 16px;border-radius:16px;background:#EAF5E1;border:2px solid var(--leaf);font-family:var(--font-read);font-size:1.15rem;line-height:1.45}
.sp-why::before{content:"💡 "}
.slot{position:relative}
.gap.filled{min-width:0;padding:0 4px;border-bottom-style:solid}
.slot.bad::after{content:"✗";position:absolute;top:-10px;right:-8px;font:700 1.1rem var(--font-ui);color:var(--berry)}
@media (max-width:520px){
  /* phones: the pattern card and the word tighten up, so the choices fit an iPhone SE without scrolling */
  .sp-teach{font-size:.95rem;line-height:1.35;padding:8px 10px;margin-bottom:8px}
  .sp-l{font-size:1.5rem;min-width:32px;height:46px;padding:0 4px;border-bottom-width:4px}
  .sp-row{gap:5px;margin:6px 0}
  .sp-word{font-size:1.5rem;min-height:36px}
  .sp-choices{grid-template-columns:1fr 1fr;gap:8px;margin-top:6px}
  .sp-choice{font-size:1.05rem;min-height:46px;padding:6px 8px}
  .sp-why{font-size:1.05rem;padding:10px 12px}
}
`;
const seenPatterns = new Set(); // the patterns already taught in this run (a card for each new one)
const fullClue = it => it.clue ? it.clue.replace('___', it.word) : '';
const spellOut = w => w.toLowerCase().split('').join(', ');
const changed = it => applyRule(it.root, it.suf, it.rule);
const changeWhy = it => it.note || cap1(WHY_RULE[it.rule](it, changed(it)));
const suffixWord = it => applyRule(it.root, it.answer, ruleFor(it.root, it.answer));
const suffixWhy = it => { const w = suffixWord(it), r = ruleFor(it.root, it.answer);
  return `${it.s.replace('___', w)} ${r === 'yi' ? `${cap1(it.root)} ends in a consonant and then y, so the y changes to i: ${w}.` : `We just add ${it.answer} to ${it.root}: ${w}.`}`; };
const patWhy = it => { const W = PATTERNS[it.g].why; return typeof W === 'string' ? W : W[it.opts[0]]; };
const patLike = it => { const L = PATTERNS[it.g].like, l = Array.isArray(L) ? L : L[it.opts[0]]; return l.filter(w => w.toLowerCase() !== it.word.toLowerCase()).slice(0, 2); };
const fillWhy = it => `${cap1(it.word)} is spelt ${spellOut(it.word)}. ${patWhy(it)}`;
const narrowLine = it => { const like = patLike(it); return SP_SAY.narrow.replace('{L}', like.length ? `It's like ${like.join(' and ')}.` : '').trim(); };
const kindWord = it => it.kind === 'fill' ? it.word : it.kind === 'change' ? changed(it) : suffixWord(it);
const kindPrompt = it => it.kind === 'fill' ? SP_SAY.fillPrompt : it.kind === 'change' ? SP_SAY.changePrompt : SP_SAY.suffixPrompt;
const kindHear = it => it.kind === 'fill' ? `${it.word} ... ${fullClue(it)}` : it.kind === 'change' ? `${it.root} ... ${changed(it)}` : `${it.root} ... ${it.s.replace('___', 'blank')}`;
const kindWhy = it => it.kind === 'fill' ? fillWhy(it) : it.kind === 'change' ? changeWhy(it) : suffixWhy(it);
const kindShow = it => it.kind === 'fill' ? SP_SAY.show.replace('{W}', `${cap1(it.word)} is spelt ${spellOut(it.word)}.`) : SP_SAY.showTap.replace('{W}', kindWhy(it));

function playSpell(item, ctx) {
  const area = ctx.area, k = item.kind, P = PATTERNS[item.g];
  if (ctx.index === 0) seenPatterns.clear();
  const teachNow = !seenPatterns.has(item.g); seenPatterns.add(item.g);
  const teachHTML = `<div class="sp-teach" id="spTeach" role="note"><b>${esc(P.name)}.</b> ${esc(P.teach)}</div>`;
  const word = kindWord(item), prompt = kindPrompt(item), hearLine = kindHear(item), tier = () => (Meadow.round() || {}).tier || 0;
  const done = (el, whyText) => { $('#spWhy').innerHTML = `<div class="sp-why" role="status">${esc(whyText)}</div>`; Meadow.correct(el, { sayFirst: whyText.replace(/[.!?]$/, ''), hold: 3000 }); };
  area.innerHTML = `${teachNow ? teachHTML : ''}<div id="spBody"></div>
    <div class="row-btns" style="margin-top:8px"><button class="btn small" id="hear">🔊 Hear the word</button>${teachNow ? '' : `<button class="btn small ghost" id="tipBtn">${SP_SAY.tipBtn}</button>`}</div><div id="spWhy"></div>`;
  const showTeach = () => { if (!$('#spTeach')) area.insertAdjacentHTML('afterbegin', teachHTML); const b = $('#tipBtn'); if (b) b.remove(); };
  if ($('#tipBtn')) $('#tipBtn').onclick = () => { showTeach(); say(P.teach); };
  const body = $('#spBody');
  let hints;
  /* choices (change and suffix): wire the buttons; right(v) says whether a choice is right in this part */
  const wireChoices = (right, wrongMsg, after) => $$('#spChoices .sp-choice').forEach(b => b.onclick = () => {
    if (Meadow.isBusy() || b.disabled) return;
    if (!right(b.dataset.v)) { b.classList.add('wrong'); b.disabled = true; b.setAttribute('aria-label', `${b.textContent}, not right`); Meadow.wrong(wrongMsg()); return; }
    b.classList.add('right'); b.setAttribute('aria-label', `${b.textContent}, right`); $$('#spChoices .sp-choice').forEach(x => { x.disabled = true; });
    after();
  });
  const narrowChoices = rightV => { const w = $$('#spChoices .sp-choice').find(b => !b.disabled && b.dataset.v !== rightV); if (w) { w.classList.add('wrong'); w.disabled = true; } };
  const askAgainHelp = rightV => { // a second part keeps the help already given
    if (tier() >= 3) narrowChoices(rightV);
    if (tier() >= 4) $$('#spChoices .sp-choice').find(b => b.dataset.v === rightV).classList.add('glow');
  };

  if (k === 'fill') {
    const choices = shuffle(item.opts.map(g => ({ g }))), removed = new Set();
    let filled = null;
    const right = choices.findIndex(c => c.g === item.opts[0]);
    body.innerHTML = `<div class="clue"><div class="clue-pic" aria-hidden="true">${item.emoji}</div><div class="clue-text">${esc(item.clue).replace('___', '<span class="gap"><span aria-hidden="true">&nbsp;?&nbsp;</span><span class="sr">blank</span></span>')}</div></div>
      <p class="mode-tip" style="margin:4px 0">${esc(prompt)}</p>
      <div class="word-wrap"><div class="word-row" id="row" style="padding-bottom:8px"></div></div><div class="bank" id="bank"></div>`;
    const slotOf = () => $(`#row .slot[data-i="${item.t}"]`);
    const draw = () => {
      $('#row').innerHTML = item.parts.map((p, i) => i === item.t
        ? `<div class="slot ${item.opts[0].length > 1 ? 'wide' : ''}" data-i="${i}" role="button" tabindex="0" aria-label="${filled != null ? `${esc(choices[filled].g.split('').join(' '))}, tap to take it out` : 'The gap to fill'}">${filled != null ? `<span class="tile in-slot">${esc(choices[filled].g)}</span>` : ''}</div>`
        : `<div class="slot given ${p.length > 1 ? 'wide' : ''}" role="img" aria-label="${esc(p.split('').join(' '))}"><span class="tile in-slot" aria-hidden="true">${esc(p)}</span></div>`).join('');
      $('#bank').innerHTML = choices.map((c, id) => filled === id || removed.has(id) ? '' : `<span class="tile" data-c="${id}" aria-label="${esc(c.g.split('').join(' '))}">${esc(c.g)}</span>`).join('');
      $$('#bank .tile').forEach(el => draggable(el, { dropSel: '.slot[data-i], #bank', onTap: () => put(+el.dataset.c), onDrop: tg => { if (tg && tg.dataset.i != null) put(+el.dataset.c); } }));
      const sl = slotOf(), out = () => { if (filled != null && !Meadow.isBusy()) { filled = null; sfx.pick(); draw(); } };
      sl.onclick = out; sl.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); out(); } };
    };
    const put = id => {
      if (Meadow.isBusy()) return;
      filled = id; sfx.snap(); draw();
      if (id === right) { const sl = slotOf(); sl.classList.add('locked'); sl.setAttribute('aria-label', `${item.opts[0].split('').join(' ')}, right`); $('#spBody .gap').textContent = item.word; $('#spBody .gap').classList.add('filled'); done($('#row'), fillWhy(item)); return; }
      slotOf().classList.add('bad');
      Meadow.wrong(SP_SAY.fillWrong);
      later(() => { if (Meadow.isBusy() || !$('#row')) return; filled = null; removed.add(id); draw(); }, 900);
    };
    draw();
    hints = [
      () => { later(() => say(hearLine, { rate: .8 }), 1300); return SP_SAY.listen; },
      () => { showTeach(); return esc(P.teach); },
      () => { const w = choices.findIndex((c, id) => id !== right && !removed.has(id) && filled !== id); if (w >= 0) { removed.add(w); if (filled == null) draw(); } return esc(narrowLine(item)); },
      () => { if (filled != null && filled !== right) filled = null; draw(); const t = $(`#bank .tile[data-c="${right}"]`); if (t) t.classList.add('glow'); slotOf().classList.add('glow'); return esc(kindShow(item)); },
    ];
  }

  if (k === 'change') {
    let part = 1;
    const letters = rule => {
      const r = item.root.split(''), out = [];
      r.forEach((ch, i) => { const last = i === r.length - 1;
        if (rule === 'e' && last) out.push(`<span class="sp-l gone" role="img" aria-label="e, dropped">${ch}</span>`);
        else if (rule === 'yi' && last) out.push(`<span class="sp-l new" role="img" aria-label="i, was y">i</span>`);
        else out.push(`<span class="sp-l">${ch}</span>`);
        if (rule === 'double' && last) out.push(`<span class="sp-l new" role="img" aria-label="${ch}, doubled">${ch}</span>`); });
      return out.join('');
    };
    const sufTiles = item.suf.split('').map(c => `<span class="sp-l suf">${c}</span>`).join('');
    body.innerHTML = `<p class="mode-tip lead">${esc(prompt)}</p>
      <div class="sp-row" id="spRow" role="group" aria-label="${esc(item.root)} plus ${esc(item.suf)}">${letters(null)}<span class="sp-plus" aria-hidden="true">+</span>${sufTiles}</div>
      <div class="sp-word" id="spWord" aria-live="polite"></div>
      <div class="sp-choices" id="spChoices">${RULES2.map(([v, t]) => `<button class="sp-choice" data-v="${v}">${esc(t)}</button>`).join('')}</div>`;
    const showResult = () => { $('#spRow').innerHTML = letters(item.rule) + sufTiles; $('#spRow').setAttribute('aria-label', `${item.root} plus ${item.suf} makes ${word}`); $('#spWord').textContent = word; };
    const finish = () => done($('#spWord'), changeWhy(item));
    const startAsk = () => {
      part = 2;
      const opts = shuffle(item.ask.map((t, i) => [i === 0 ? 'y' : 'n', t]));
      $('#spChoices').outerHTML = `<p class="mode-tip lead" id="askP">${esc(SP_SAY.askPrompt)}</p><div class="sp-choices" id="spChoices">${opts.map(([v, t]) => `<button class="sp-choice" data-v="${v}">${esc(t)}</button>`).join('')}</div>`;
      bubble(esc(SP_SAY.askPrompt));
      askAgainHelp('y');
      wireChoices(v => v === 'y', () => SP_SAY.askWrong, finish);
    };
    wireChoices(v => v === item.rule, () => SP_SAY.changeWrong, () => { showResult(); sfx.pop(); if (item.ask) later(startAsk, 700); else finish(); });
    const rightV = () => part === 1 ? item.rule : 'y';
    hints = [
      () => { later(() => say(hearLine, { rate: .8 }), 1300); return SP_SAY.listen; },
      () => { showTeach(); return esc(P.teach); },
      () => { narrowChoices(rightV()); return SP_SAY.narrowRule; },
      () => { $$('#spChoices .sp-choice').find(b => b.dataset.v === rightV()).classList.add('glow'); return esc(kindShow(item)); },
    ];
  }

  if (k === 'suffix') {
    const yi = ruleFor(item.root, item.answer) === 'yi';
    let part = 1;
    body.innerHTML = `<div class="clue"><div class="clue-pic" aria-hidden="true">${item.emoji}</div><div class="clue-text">${esc(item.s).replace('___', '<span class="gap" id="spGap"><span aria-hidden="true">&nbsp;?&nbsp;</span><span class="sr">blank</span></span>')}</div></div>
      <div class="sp-row" role="group" aria-label="The root word, ${esc(item.root)}, plus an ending">${item.root.split('').map(c => `<span class="sp-l">${c}</span>`).join('')}<span class="sp-plus" aria-hidden="true">+</span><span class="sp-l suf" id="spSuf">?</span></div>
      <p class="mode-tip lead" id="spP">${esc(prompt)}</p>
      <div class="sp-choices" id="spChoices">${shuffle([item.answer, ...item.wrong]).map(x => `<button class="sp-choice" data-v="${x}">${esc(item.root)} + ${esc(x)}</button>`).join('')}</div>`;
    const finish = () => { $('#spGap').textContent = word; $('#spGap').classList.add('filled'); done($('#spGap'), suffixWhy(item)); };
    const startSpell = () => {
      part = 2; $('#spP').textContent = SP_SAY.spellPrompt;
      const opts = shuffle([['y', word], ['n', item.root + item.answer]]);
      $('#spChoices').innerHTML = opts.map(([v, t]) => `<button class="sp-choice" data-v="${v}">${esc(t)}</button>`).join('');
      bubble(esc(SP_SAY.spellPrompt));
      askAgainHelp('y');
      wireChoices(v => v === 'y', () => SP_SAY.spellWrong, finish);
    };
    wireChoices(v => v === item.answer, () => SP_SAY.suffixWrong, () => { $('#spSuf').textContent = item.answer; sfx.pop(); if (yi) later(startSpell, 700); else finish(); });
    const rightV = () => part === 1 ? item.answer : 'y';
    hints = [
      () => { later(() => say(hearLine, { rate: .8 }), 1300); return SP_SAY.listen; },
      () => { showTeach(); return esc(P.teach); },
      () => { narrowChoices(rightV()); return SP_SAY.narrowRule; },
      () => { $$('#spChoices .sp-choice').find(b => b.dataset.v === rightV()).classList.add('glow'); return esc(kindShow(item)); },
    ];
  }

  $('#hear').onclick = () => say(k === 'fill' ? item.word : item.root, { rate: .8 });
  ctx.hints(hints);
  bubble(fmt(ctx.index === 0 ? `Let's spell, {N}! ${prompt}` : rand(["Here's another one!", "Can you spell this one?", "Sniff sniff… let's spell!"])), false);
  later(() => say((teachNow ? P.teach + ' ... ' : '') + prompt + ' ... ' + hearLine, { rate: .85 }), 300);
}
/* Bonnie's lines for levels 6 to 10 (for tools/make-voice.mjs). Pieces are cut at sentences and "...", so long lines share clips. */
function spellLines(add, hint) {
  add(SP_SAY.fillWrong, SP_SAY.changeWrong, SP_SAY.askWrong, SP_SAY.suffixWrong, SP_SAY.spellWrong, SP_SAY.askPrompt, SP_SAY.spellPrompt);
  hint(0, SP_SAY.listen); hint(2, SP_SAY.narrowRule);
  Object.values(PATTERNS).forEach(P => { add(P.teach); hint(1, esc(P.teach)); });
  FOREST2.forEach(L => L.items.forEach(item => {
    const P = PATTERNS[item.g], prompt = kindPrompt(item), hearLine = kindHear(item);
    add(item.word || item.root, hearLine, prompt + ' ... ' + hearLine, P.teach + ' ... ' + prompt + ' ... ' + hearLine);
    add(kindWhy(item).replace(/[.!?]$/, '') + '!');
    if (item.kind === 'fill') hint(2, esc(narrowLine(item)));
    hint(3, esc(kindShow(item)));
  }));
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
  spellLines(add, hint);
  return out;
}

const IDS = ["a-e", "i-e-o-e", "u-e-e-e", "ai-ay", "ee-ea-igh-ie"];
Meadow.registerWorld({
  id: 'y2-english-phonics', subject: 'english', year: 2,
  name: "Phonics Forest", tag: "Split digraphs & sneaky sounds", icon: '🌲', color: '#6BA368', tint: '#E3F1D8',
  perLevel: 6, praise: PRAISE, hintNames: HINTS, css: CSS + SP_CSS, play: playPhonics, lines,
  // levels 6 to 10 come after the first five, so the first five keep their places and stars
  // for tools/words-audit.mjs: the spelling patterns, and the words and reasons the game works out
  spelling: { patterns: PATTERNS, word: kindWord, why: kindWhy, rule: ruleFor, apply: applyRule },
  levels: [...PHONICS.map((L, i) => ({ ...L, id: IDS[i], name: L.title })), ...FOREST2.map(L => ({ ...L, name: L.title, play: playSpell }))],
});
})();
