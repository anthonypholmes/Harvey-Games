/* =========================================================
   WORLD: Sentence Meadow (Meadow Words, Year 2)
   Capital letters, punctuation and word order.
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

const sn = (w, p, opts = {}) => ({ w, p, proper: opts.proper || [], alts: opts.alts || [] });
const SENTENCES = [
  { title: 'Capital Letters', mode: 'caps', badges: ['.'], tip: "Every sentence starts with a capital letter. Names, places, days and the word 'I' always get capitals too!", items: [
    sn('the frog jumped in the pond', '.'), sn('i like my red kite', '.'), sn('bonnie dug a big hole', '.', { proper: ['bonnie'] }),
    sn('{N} has a green hat', '.', { proper: ['{N}'] }), sn('we went to london on the train', '.', { proper: ['london'] }),
    sn('my friend sam likes cake', '.', { proper: ['sam'] }), sn('on monday i went swimming', '.', { proper: ['monday'] })] },
  { title: 'Full Stop or Question?', mode: 'punct', badges: ['.', '?'], tip: "If a sentence ASKS something, it ends with a question mark. If it TELLS us something, it gets a full stop.", items: [
    sn('where is my ball', '?'), sn('the sun is hot', '.'), sn('can you see the bee', '?'), sn('we went to the park', '.'),
    sn('what is in the box', '?'), sn('bonnie likes bones', '.', { proper: ['bonnie'] }), sn('do you like jam', '?')] },
  { title: 'Exclamation!', mode: 'punct', badges: ['.', '?', '!'], tip: "A sentence that starts with 'What a...' or 'How...' and shows surprise gets an exclamation mark! Questions get question marks.", items: [
    sn('what a big dog', '!'), sn('how fast bonnie runs', '!', { proper: ['bonnie'] }), sn('did you eat your lunch', '?'),
    sn('the cat is asleep', '.'), sn('what a lovely day it is', '!'), sn('where did the duck go', '?'), sn('how tall that tree is', '!')] },
  { title: 'Word Order', mode: 'order', badges: ['.', '?', '!'], tip: "Find the word with the capital letter — that goes first! Then read it aloud to check it makes sense.", items: [
    sn('the duck swam in the pond', '.'), sn('bonnie dug up a bone', '.', { proper: ['bonnie'], alts: ['bonnie dug a bone up'] }),
    sn('can you hop like a frog', '?'), sn('{N} ate a big red apple', '.', { proper: ['{N}'] }), sn('what a tall tree', '!'),
    sn('the bees buzz in the meadow', '.')] },
  { title: 'Super Sentences', mode: 'all', badges: ['.', '?', '!'], tip: "Put the words in order, then give capitals to the first word and any names, days or 'I'. Finish with the right punctuation!", items: [
    sn('on monday {N} went to the farm', '.', { proper: ['monday', '{N}'], alts: ['{N} went to the farm on monday'] }),
    sn('bonnie and i played outside', '.', { proper: ['bonnie', 'i'], alts: ['i and bonnie played outside'] }),
    sn('where is my teddy', '?'), sn('what a huge spider', '!'), sn('my dog is called bonnie', '.', { proper: ['bonnie'] }),
    sn('can we go to the beach', '?')] },
];
/* Words that always need a capital, in every sentence: names (Bonnie, and every word of the child's own name),
   days, months, places and 'I'. A sentence's own proper list adds more. */
const ALWAYS_CAPS = ['i', 'bonnie', 'sam', 'london', 'christmas', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'january', 'february', 'april', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const properOf = raw => [...new Set([...ALWAYS_CAPS, ...[...raw.proper, ...(raw.w.includes('{N}') ? ['{N}'] : [])].flatMap(x => fmt(x).toLowerCase().split(' '))])];
const SENT_PROMPTS = { caps: 'Tap the words that need a capital letter!', punct: 'Which punctuation mark goes at the end?', order: 'Drag the words into the right order, then add the end mark!', all: 'Order the words, tap Aa for capitals, then add the end mark!' };
const CSS = `
/* ---------- Sentence meadow ---------- */
.s-line{display:flex;flex-wrap:wrap;gap:10px;align-items:center;min-height:96px;padding:16px;border-radius:20px;background:#F7F0E2;border:3px dashed #CDBB9C;margin:14px 0}
.s-line.drop-hover{border-color:var(--gold);background:#FFF6DA}
.s-line .ph{color:var(--ink-soft);font-family:var(--font-read)}
.wchip{font-family:var(--font-read);font-size:1.7rem;font-weight:700;padding:10px 16px;border-radius:14px;background:#fff;border:2px solid var(--card-edge);border-bottom:5px solid #D8C7A8;touch-action:none;cursor:grab;position:relative;transition:background .2s}
.wchip.placed{background:#FFFDF6}
.wchip.capped .first{color:var(--accent-dark);text-decoration:underline wavy var(--gold) 2px;text-underline-offset:5px}
.wchip.glow{box-shadow:0 0 0 5px rgba(242,193,78,.7)}
.wchip.snap{animation:snap .4s cubic-bezier(.3,1.6,.5,1)}
.wchip.dragging{opacity:.3}
.aa{position:absolute;top:-14px;right:-10px;width:30px;height:30px;border-radius:50%;background:var(--gold);font-size:.8rem;font-weight:700;font-family:var(--font-ui);display:grid;place-items:center;box-shadow:0 2px 0 #C99A2E;color:var(--ink)}
.p-slot{width:62px;height:72px;border-radius:50%;border:3px dashed var(--accent);display:grid;place-items:center;font-size:2.6rem;font-weight:700;font-family:var(--font-read);background:#FFF5EC}
.p-slot.filled{border-style:solid;background:#FFE6D2}
.p-slot.drop-hover{transform:scale(1.15);background:#FFF2C9}
.badges{display:flex;gap:14px;justify-content:center;margin-top:10px}
.badge{width:72px;height:72px;border-radius:50%;font-size:2.6rem;font-weight:700;font-family:var(--font-read);color:#fff;display:grid;place-items:center;touch-action:none;cursor:grab;box-shadow:0 5px 0 rgba(0,0,0,.2);position:relative}
.badge small{position:absolute;bottom:-22px;font-size:.72rem;color:var(--ink-soft);font-family:var(--font-ui);white-space:nowrap}
.badge.off{opacity:.25;pointer-events:none}
.badge.glow{box-shadow:0 0 0 6px rgba(242,193,78,.8)}
.s-bank{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:14px;border-radius:20px;background:#EFE5D0;min-height:80px}
.s-bank.drop-hover{outline:4px solid var(--gold)}
.mode-tip{text-align:center;font-family:var(--font-read);font-size:1.2rem;color:var(--ink-soft)}
@media (max-width:520px){ .wchip{font-size:1.3rem;padding:8px 12px} }
@keyframes snap{0%{transform:scale(1.3) translateY(-10px)}60%{transform:scale(.92)}100%{transform:scale(1)}}
`;

function playSentence(raw, ctx) {
  const L = ctx.level, mode = L.mode;
  const words = fmt(raw.w).toLowerCase().split(' ');
  const proper = properOf(raw);
  const accepted = [words, ...raw.alts.map(a => fmt(a).toLowerCase().split(' '))];
  const needsCap = (w, pos) => pos === 0 || proper.includes(w);
  const show1 = (w, capped) => capped ? cap1(w) : w;
  const tokens = words.map((w, id) => ({ id, w, capped: false }));
  const st = { line: [], punct: null };

  if (mode === 'caps') { st.line = tokens.map(t => t.id); st.punct = raw.p; }
  if (mode === 'punct') { st.line = tokens.map(t => t.id); tokens.forEach((t, i) => t.capped = needsCap(t.w, i)); }
  if (mode === 'order') tokens.forEach((t, i) => t.capped = needsCap(t.w, i));
  let bankOrder = shuffle(tokens.map(t => t.id));
  if (bankOrder.join() === tokens.map(t => t.id).join()) bankOrder.reverse();

  const correctText = words.map((w, i) => show1(w, needsCap(w, i))).join(' ') + raw.p;
  const prompts = SENT_PROMPTS;
  const area = ctx.area;
  area.innerHTML = `
    <p class="mode-tip" style="font-size:1.3rem;color:var(--ink)">🌼 ${prompts[mode]}</p>
    <div class="row-btns"><button class="btn small" id="hear">🔊 Hear the sentence</button></div>
    <div class="s-line" id="line"></div>
    ${mode === 'order' || mode === 'all' ? '<div class="s-bank" id="sbank"></div>' : ''}
    <div class="badges" id="badges">${L.badges.length > 1 || mode !== 'caps' ? L.badges.map(b => `<span class="badge" data-b="${b}" style="background:${b === '.' ? 'var(--leaf)' : b === '?' ? '#5B9BD5' : 'var(--berry)'}">${b}<small>${b === '.' ? 'full stop' : b === '?' ? 'question' : 'exclaim!'}</small></span>`).join('') : ''}</div>
    <div class="row-btns" style="margin-top:34px"><button class="btn green" id="checkBtn">✓ Check my sentence</button></div>`;
  $('#hear').onclick = () => say(correctText, { rate: .8 });

  function draw(snapId = -1) {
    const line = $('#line');
    line.innerHTML = (st.line.length ? '' : '<span class="ph">Drop words here…</span>') + st.line.map(id => { const t = tokens[id];
      return `<span class="wchip placed ${t.capped ? 'capped' : ''} ${id === snapId ? 'snap' : ''}" data-id="${id}"><span class="first">${esc(show1(t.w, t.capped)[0])}</span>${esc(t.w.slice(1))}${mode === 'all' ? '<button class="aa" aria-label="Capital letter">Aa</button>' : ''}</span>`; }).join('')
      + `<span class="p-slot ${st.punct ? 'filled' : ''}" id="pslot">${st.punct || ''}</span>`;
    const bank = $('#sbank');
    if (bank) bank.innerHTML = bankOrder.filter(id => !st.line.includes(id)).map(id => `<span class="wchip" data-id="${id}">${esc(show1(tokens[id].w, tokens[id].capped))}</span>`).join('');
    // interactions
    $$('#line .wchip').forEach(el => {
      const id = +el.dataset.id;
      if (mode === 'caps') { el.onclick = () => { tokens[id].capped = !tokens[id].capped; sfx.pop(); draw(id); }; return; }
      if (mode === 'punct') return;
      const aa = $('.aa', el); if (aa) aa.onclick = e => { e.stopPropagation(); tokens[id].capped = !tokens[id].capped; sfx.pop(); draw(id); };
      draggable(el, { dropSel: '.wchip.placed, #line, #sbank', onTap: () => { st.line = st.line.filter(x => x !== id); sfx.pick(); draw(); },
        onDrop: tg => { if (!tg) return; if (tg.id === 'sbank') { st.line = st.line.filter(x => x !== id); draw(); } else moveTo(id, tg); } });
    });
    $$('#sbank .wchip').forEach(el => { const id = +el.dataset.id;
      draggable(el, { dropSel: '.wchip.placed, #line', onTap: () => { st.line.push(id); sfx.snap(); draw(id); }, onDrop: tg => tg && moveTo(id, tg) }); });
    $('#pslot').onclick = () => { if (mode !== 'caps' && st.punct) { st.punct = null; sfx.pick(); draw(); } };
  }
  function moveTo(id, tg) {
    st.line = st.line.filter(x => x !== id);
    if (tg.classList.contains('wchip')) { const at = st.line.indexOf(+tg.dataset.id); st.line.splice(at < 0 ? st.line.length : at, 0, id); }
    else st.line.push(id);
    sfx.snap(); draw(id);
  }
  $$('#badges .badge').forEach(b => draggable(b, { dropSel: '#pslot', onTap: () => setP(b.dataset.b), onDrop: tg => tg && setP(b.dataset.b) }));
  function setP(p) { st.punct = p; sfx.snap(); draw(); animate($('#pslot'), 'snap', 400); }

  $('#checkBtn').onclick = () => {
    if (Meadow.isBusy()) return;
    if (st.line.length < words.length) return bubble('Use all the words first! 🐾');
    if (!st.punct) return bubble('Don\'t forget the punctuation mark at the end!');
    const seq = st.line.map(id => tokens[id].w);
    const orderOK = accepted.some(a => a.join(' ') === seq.join(' '));
    // Word Order: capitals aren't his job there, so a repeated word ("the ... the") never fails on them
    if (mode === 'order' && orderOK) { st.line.forEach((id, pos) => tokens[id].capped = needsCap(tokens[id].w, pos)); draw(); }
    const capsOK = st.line.every((id, pos) => tokens[id].capped === needsCap(tokens[id].w, pos));
    const pOK = st.punct === raw.p;
    if (orderOK && capsOK && pOK) {
      const said = st.line.map(id => tokens[id].w).join(' ') + raw.p;
      Meadow.correct($('#line'), { sayFirst: said });
      return;
    }
    let msg;
    if (!orderOK) msg = "Hmm, read it out loud. Does it make sense? Try a different order.";
    else if (!capsOK) { const bad = st.line.find((id, pos) => tokens[id].capped !== needsCap(tokens[id].w, pos));
      msg = needsCap(tokens[bad].w, st.line.indexOf(bad)) ? `Check your capital letters! Does "<b>${esc(tokens[bad].w)}</b>" need one?` : `"<b>${esc(cap1(tokens[bad].w))}</b>" doesn't need a capital letter here.`;
      $$('#line .wchip').find(x => +x.dataset.id === bad)?.classList.add('glow'); }
    else msg = raw.p === '?' ? "Is this sentence asking something? Have another look at the end mark." : raw.p === '!' ? "This sentence shows surprise or excitement! Which end mark shows that?" : "This sentence is telling us something. Which end mark fits?";
    Meadow.wrong(msg);
  };
  ctx.hints([
    () => { later(() => say(correctText, { rate: .75 }), 1500); return 'Listen to how the sentence sounds. Does your voice go up at the end?'; },
    () => esc(L.tip),
    () => {
      if (mode === 'caps') { const i = words.findIndex((w, p) => needsCap(w, p) !== tokens[p].capped); if (i >= 0) { $$('#line .wchip')[i].classList.add('glow'); return `Look at the word that's glowing: <b>${esc(words[i])}</b>. Does it need a capital?`; } return 'Your capitals look great! Tap Check.'; }
      if (mode === 'punct') { const w = L.badges.find(b => b !== raw.p); $(`.badge[data-b="${w}"]`).classList.add('off'); return "I've taken away one punctuation mark that doesn't fit."; }
      const first = tokens.find(t => t.w === words[0] && st.line[0] !== t.id) || tokens.find(t => t.w === words[0]);
      st.line = [first.id, ...st.line.filter(x => x !== first.id)]; if (mode === 'all') first.capped = true; draw(first.id);
      return `I've put the first word in for you: <b>${esc(cap1(words[0]))}</b>. What comes next?`;
    },
    () => {
      const used = new Set();
      st.line = words.map(w => { const t = tokens.find(t => t.w === w && !used.has(t.id)); used.add(t.id); return t.id; });
      st.line.forEach((id, pos) => tokens[id].capped = needsCap(tokens[id].w, pos)); st.punct = raw.p; draw();
      $$('#line .wchip').forEach(x => x.classList.add('glow')); $('#checkBtn').classList.add('snap');
      later(() => say(correctText, { rate: .75 }), 1700);
      return `Here's my sentence: <b>${esc(correctText)}</b> Tap Check when you've read it!`;
    },
  ]);
  draw();
  bubble(fmt(ctx.index === 0 ? `Let's fix some sentences, {N}! ${prompts[mode]}` : rand(["Here's another one!", "Can you fix this sentence?", "Let's make it perfect!"])), false);
  later(() => say(prompts[mode]), 300);
}

/* Every line Bonnie can say in this world (for tools/make-voice.mjs). */
function lines() {
  const out = [], add = (...xs) => xs.forEach(x => out.push(fmt(x)));
  const hint = (tier, html) => add(text(`<b>${HINTS[tier]}</b> ${html}`));
  add(...Object.values(SENT_PROMPTS));
  add(text('Use all the words first! 🐾'), "Don't forget the punctuation mark at the end!", "Hmm, read it out loud. Does it make sense? Try a different order.",
    "Is this sentence asking something? Have another look at the end mark.", "This sentence shows surprise or excitement! Which end mark shows that?",
    "This sentence is telling us something. Which end mark fits?");
  hint(0, 'Listen to how the sentence sounds. Does your voice go up at the end?');
  hint(2, 'Your capitals look great! Tap Check.'); hint(2, "I've taken away one punctuation mark that doesn't fit.");
  SENTENCES.forEach(L => { hint(1, esc(L.tip)); L.items.forEach(raw => {
    const words = fmt(raw.w).toLowerCase().split(' ');
    const proper = properOf(raw);
    const needsCap = (w, pos) => pos === 0 || proper.includes(w);
    const correctText = words.map((w, i) => needsCap(w, i) ? cap1(w) : w).join(' ') + raw.p;
    add(correctText);
    [words, ...raw.alts.map(a => fmt(a).toLowerCase().split(' '))].forEach(a => add(a.join(' ') + raw.p + '!'));
    words.forEach(w => { add(text(`Check your capital letters! Does "<b>${esc(w)}</b>" need one?`), text(`"<b>${esc(cap1(w))}</b>" doesn't need a capital letter here.`));
      hint(2, `Look at the word that's glowing: <b>${esc(w)}</b>. Does it need a capital?`); });
    hint(2, `I've put the first word in for you: <b>${esc(cap1(words[0]))}</b>. What comes next?`);
    hint(3, `Here's my sentence: <b>${esc(correctText)}</b> Tap Check when you've read it!`);
  }); });
  return out;
}

const IDS = ["capital-letters", "full-stop-or-question", "exclamation", "word-order", "super-sentences"];
Meadow.registerWorld({
  id: 'y2-english-sentences', subject: 'english', year: 2,
  name: "Sentence Meadow", tag: "Capitals & punctuation", icon: '🌼', color: '#E07A3F', tint: '#FBE3D2',
  perLevel: 6, praise: PRAISE, hintNames: HINTS, css: CSS, play: playSentence, lines,
  levels: SENTENCES.map((L, i) => ({ ...L, id: IDS[i], name: L.title })),
});
})();
