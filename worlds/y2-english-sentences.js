/* =========================================================
   WORLD: Sentence Meadow (Meadow Words, Year 2)
   Capital letters, punctuation and word order (levels 1 to 5); commas in lists, apostrophes,
   the four kinds of sentence and joining sentences (levels 6 to 9).
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
    sn('tom has a green hat', '.', { proper: ['tom'] }), sn('we went to london on the train', '.', { proper: ['london'] }),
    sn('my friend sam likes cake', '.', { proper: ['sam'] }), sn('on monday i went swimming', '.', { proper: ['monday'] })] },
  { title: 'Full Stop or Question?', mode: 'punct', badges: ['.', '?'], tip: "If a sentence ASKS something, it ends with a question mark. If it TELLS us something, it gets a full stop.", items: [
    sn('where is my ball', '?'), sn('the sun is hot', '.'), sn('can you see the bee', '?'), sn('we went to the park', '.'),
    sn('what is in the box', '?'), sn('bonnie likes bones', '.', { proper: ['bonnie'] }), sn('do you like jam', '?')] },
  { title: 'Exclamation!', mode: 'punct', badges: ['.', '?', '!'], tip: "A sentence that starts with 'What a...' or 'How...' and shows surprise gets an exclamation mark! Questions get question marks.", items: [
    sn('what a big dog', '!'), sn('how fast bonnie runs', '!', { proper: ['bonnie'] }), sn('did you eat your lunch', '?'),
    sn('the cat is asleep', '.'), sn('what a lovely day it is', '!'), sn('where did the duck go', '?'), sn('how tall that tree is', '!')] },
  { title: 'Word Order', mode: 'order', badges: ['.', '?', '!'], tip: "Find the word with the capital letter — that goes first! Then read it aloud to check it makes sense.", items: [
    sn('the duck swam in the pond', '.'), sn('bonnie dug up a bone', '.', { proper: ['bonnie'], alts: ['bonnie dug a bone up'] }),
    sn('can you hop like a frog', '?'), sn('mia ate a big red apple', '.', { proper: ['mia'] }), sn('what a tall tree', '!'),
    sn('the bees buzz in the meadow', '.')] },
  { title: 'Super Sentences', mode: 'all', badges: ['.', '?', '!'], tip: "Put the words in order, then give capitals to the first word and any names, days or 'I'. Finish with the right punctuation!", items: [
    sn('on monday jack went to the farm', '.', { proper: ['monday', 'jack'], alts: ['jack went to the farm on monday'] }),
    sn('bonnie and i played outside', '.', { proper: ['bonnie', 'i'], alts: ['i and bonnie played outside'] }),
    sn('where is my teddy', '?'), sn('what a huge spider', '!'), sn('my dog is called bonnie', '.', { proper: ['bonnie'] }),
    sn('can we go to the beach', '?')] },
];
/* Words that always need a capital, in every sentence: names (Bonnie and the story characters), days, months,
   places and 'I'. A sentence's own proper list adds more. The player's own name is never in a sentence. */
const ALWAYS_CAPS = ['i', 'bonnie', 'sam', ...Meadow.characters.map(c => c.name.toLowerCase()), 'london', 'christmas', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'january', 'february', 'april', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const properOf = raw => [...new Set([...ALWAYS_CAPS, ...raw.proper.flatMap(x => x.toLowerCase().split(' '))])];
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
.p-end{align-self:flex-end;margin-left:-6px;padding-bottom:6px;font-size:2.2rem;line-height:1;font-weight:700;font-family:var(--font-read);color:var(--ink,#3A2A1E);pointer-events:none}
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
.mode-tip.lead{font-size:1.3rem;color:var(--ink)}
.check-row{margin-top:34px}
.aa::after{content:"";position:absolute;inset:-7px}
@media (max-width:520px){ .wchip{font-size:1.3rem;padding:8px 12px} }
@media (max-width:560px){
  /* phones: the same sentence, less space around it */
  .mode-tip.lead{font-size:1.1rem;line-height:1.35;margin:0 0 8px}
  .wchip{min-width:46px;text-align:center}
  .s-line{min-height:72px;padding:10px;gap:8px;margin:10px 0}
  .p-slot{width:50px;height:58px;font-size:2.1rem}
  .s-bank{padding:10px;gap:8px;min-height:64px}
  .badges{margin-top:6px}
  .badge{width:62px;height:62px;font-size:2.2rem}
  .check-row{margin-top:30px}
}
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
    <p class="mode-tip lead">🌼 ${prompts[mode]}</p>
    <div class="row-btns"><button class="btn small" id="hear">🔊 Hear the sentence</button></div>
    <div class="s-line" id="line"></div>
    ${mode === 'order' || mode === 'all' ? '<div class="s-bank" id="sbank"></div>' : ''}
    <div class="badges" id="badges">${L.badges.length > 1 || mode !== 'caps' ? L.badges.map(b => `<span class="badge" data-b="${b}" style="background:${b === '.' ? 'var(--leaf)' : b === '?' ? '#5B9BD5' : 'var(--berry)'}">${b}<small>${b === '.' ? 'full stop' : b === '?' ? 'question' : 'exclaim!'}</small></span>`).join('') : ''}</div>
    <div class="row-btns check-row"><button class="btn green" id="checkBtn">✓ Check my sentence</button></div>`;
  $('#hear').onclick = () => say(correctText, { rate: .8 });

  function draw(snapId = -1) {
    const line = $('#line');
    line.innerHTML = (st.line.length ? '' : '<span class="ph">Drop words here…</span>') + st.line.map(id => { const t = tokens[id];
      // VoiceOver hears the whole word, and whether it has a capital (the first letter is its own part on screen).
      // With an Aa button inside (Super Sentences) the word is a group, so VoiceOver can still reach the Aa button.
      const said = show1(t.w, t.capped) + (mode === 'caps' ? (t.capped ? ', capital letter' : ', small letter') : '');
      return `<span class="wchip placed ${t.capped ? 'capped' : ''} ${id === snapId ? 'snap' : ''}" data-id="${id}" ${mode === 'all' ? 'role="group"' : 'role="button" tabindex="0"'} aria-label="${esc(said)}"><span class="first">${esc(show1(t.w, t.capped)[0])}</span>${esc(t.w.slice(1))}${mode === 'all' ? `<button class="aa" aria-label="Capital letter for ${esc(t.w)}">Aa</button>` : ''}</span>`; }).join('')
      // Capital Letters: the end mark is already there and isn't his job, so it's plain text after the last word,
      // not a circle that looks like something to tap. In the other modes it's the drop slot for the mark he chooses.
      + (mode === 'caps' ? `<span class="p-end" id="pslot">${esc(st.punct || '')}</span>`
        : `<span class="p-slot ${st.punct ? 'filled' : ''}" id="pslot">${st.punct || ''}</span>`);
    const bank = $('#sbank');
    if (bank) bank.innerHTML = bankOrder.filter(id => !st.line.includes(id)).map(id => `<span class="wchip" data-id="${id}">${esc(show1(tokens[id].w, tokens[id].capped))}</span>`).join('');
    // interactions
    $$('#line .wchip').forEach(el => {
      const id = +el.dataset.id;
      if (mode === 'caps') { el.onclick = () => { tokens[id].capped = !tokens[id].capped; sfx.pop(); draw(id); };
        el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); } }; return; }
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

/* =========================================================
   SENTENCE MEADOW, LEVELS 6 TO 9 (24 November 2026)
   Commas in lists, apostrophes, the four kinds of sentence, and joining ideas. These go after the first
   five levels, with new ids, so stars saved against the first five stay exactly as they are.
   Punctuation can only be tapped where it is the thing being chosen (the comma spaces, the end marks in
   Four Kinds); everywhere else it is plain text. Every line Bonnie says is fixed text (in lines()).
   ========================================================= */
/* Comma Caterpillar: the sentence as it should be written. Its commas are what the child puts back. */
const comma = s => ({ kind: 'comma', s });
const commaParse = s => { const ws = s.replace(/[.!?]$/, '').split(' '); return { words: ws.map(w => w.replace(/,$/, '')), commas: ws.map((w, i) => /,$/.test(w) ? i : -1).filter(i => i >= 0), end: s.slice(-1), plain: s.replace(/,/g, '') }; };
/* A contraction: the full words with the letters that go in [brackets]: 'do n[o]t' makes "don't". */
const contract = full => ({ kind: 'contract', full });
const contractParse = full => {
  const letters = []; let out = false;
  for (const ch of full) { if (ch === '[') { out = true; continue; } if (ch === ']') { out = false; continue; } letters.push({ ch, out: out && ch !== ' ', space: ch === ' ' }); }
  return { letters, words: full.replace(/[[\]]/g, ''), short: shortOf(letters, letters.map(l => l.out)) };
};
/* the short word: the letters kept, an apostrophe where each run of left-out letters was, no spaces */
function shortOf(letters, gone) {
  let s = '', inRun = false;
  letters.forEach((l, i) => { if (l.space) return; if (gone[i]) { if (!inRun) s += "'"; inRun = true; } else { s += l.ch; inRun = false; } });
  return s;
}
/* Ownership: the sentence without its apostrophe; the word that needs one; the plural words that don't. */
const owner = (s, word, fixed, plurals, why) => ({ kind: 'owner', s, word, fixed, plurals, why });
/* Why does it have an apostrophe? miss: letters are missing (and the full words), or it shows belonging. */
const whyApos = (s, word, miss, why) => ({ kind: 'whyapos', s, word, miss, why });
/* Four kinds: the sentence (no end mark), its kind, the marks that are right, and why. */
const kind4 = (s, k, why) => ({ kind: 'kind4', s, k, marks: k === 'command' ? ['.', '!'] : k === 'question' ? ['?'] : k === 'exclamation' ? ['!'] : ['.'], why });
/* Joining: the two ideas, the joined sentence with ___ for the joining word, the right word, two wrong ones, why. */
const join = (ideas, s, answer, wrong, why) => ({ kind: 'join', ideas, s, answer, wrong, why });

const MEADOW2 = [
  { id: 'comma-caterpillar', title: 'Comma Caterpillar', tip: "In a list, a comma goes between the things. The last two things are joined by 'and', so they don't need a comma.", items: [
    comma('Bonnie packed a ball, a lead and a bone.'), comma('We saw cows, sheep, pigs and hens at the farm.'), comma('Mia likes apples, pears and grapes.'),
    comma('Tom and Leo bought bread, milk and eggs.'), comma('The flag was red, white and blue.'), comma('My bag has a pencil, a ruler and a rubber in it.'),
    comma('Ava can hop, skip and jump.'), comma('Gran grows carrots, beans, peas and potatoes.'), comma('Bonnie ran, jumped and splashed in the puddles.')] },
  { id: 'apostrophe-adventures', title: 'Apostrophe Adventures', tip: "An apostrophe does two jobs. It shows where letters are missing, like don't for do not. It also shows that something belongs to someone, like Bonnie's ball.", items: [
    contract('do n[o]t'), contract('can[no]t'), contract('it [i]s'), contract('I [a]m'), contract('did n[o]t'), contract('I [wi]ll'), contract('could n[o]t'), contract('we [a]re'),
    owner('Two cats sat on Bonnies bed.', 'Bonnies', "Bonnie's", ['cats'], "The bed belongs to Bonnie, so it is Bonnie's bed. Cats just means more than one cat."),
    owner('Toms coat has three pockets.', 'Toms', "Tom's", ['pockets'], "The coat belongs to Tom, so it is Tom's coat. Pockets just means more than one pocket."),
    owner('Mias kite flew over the hills.', 'Mias', "Mia's", ['hills'], "The kite belongs to Mia, so it is Mia's kite. Hills just means more than one hill."),
    owner('The mans hat had two feathers.', 'mans', "man's", ['feathers'], "The hat belongs to the man, so it is the man's hat. Feathers just means more than one feather."),
    owner('Leos sister has red boots.', 'Leos', "Leo's", ['boots'], "The sister is Leo's sister, so it is Leo's. Boots just means more than one boot."),
    owner('The childs shoes were by the door.', 'childs', "child's", ['shoes'], "The shoes belong to the child, so they are the child's shoes. Shoes just means more than one shoe."),
    whyApos("It's raining today.", "It's", 'it is', "It's is short for it is. The apostrophe shows where the letter i is missing."),
    whyApos("Sarah's bike is blue.", "Sarah's", '', "The bike belongs to Sarah. The apostrophe shows it is Sarah's bike."),
    whyApos("We can't find the ball.", "can't", 'cannot', "Can't is short for cannot. The apostrophe shows where letters are missing."),
    whyApos("Ben's dog is called Rex.", "Ben's", '', "The dog belongs to Ben. The apostrophe shows it is Ben's dog."),
    whyApos("I'm going to the park.", "I'm", 'I am', "I'm is short for I am. The apostrophe shows where the letter a is missing."),
    whyApos("The man's van is white.", "man's", '', "The van belongs to the man. The apostrophe shows it is the man's van.")] },
  { id: 'four-kinds-of-sentences', title: 'Four Kinds of Sentences', tip: "A statement tells you something. A question asks something. A command tells someone to do something. An exclamation starts with What or How, like What a big dog it is!", items: [
    kind4('The bus stops outside the school', 'statement', 'It tells us something about the bus, so it is a statement. A statement ends with a full stop.'),
    kind4('Bonnie has a red collar', 'statement', 'It tells us something about Bonnie, so it is a statement. A statement ends with a full stop.'),
    kind4('Frogs can swim', 'statement', 'It tells us something about frogs, so it is a statement. A statement ends with a full stop.'),
    kind4('Where is my hat', 'question', 'It asks something and starts with where, so it is a question. A question ends with a question mark.'),
    kind4('Can you see the moon', 'question', 'It asks something, so it is a question. A question ends with a question mark.'),
    kind4('How tall is that tree', 'question', 'It asks how tall the tree is, so it is a question. A question ends with a question mark.'),
    kind4('Put your coat on', 'command', 'It tells someone to do something, so it is a command. A command can end with a full stop or an exclamation mark.'),
    kind4('Wash your hands before lunch', 'command', 'It tells someone to do something, so it is a command. A command can end with a full stop or an exclamation mark.'),
    kind4('Shut the gate, please', 'command', 'It tells someone to do something, so it is a command. A command can end with a full stop or an exclamation mark.'),
    kind4('What a lovely day it is', 'exclamation', 'It starts with What a and shows a strong feeling, so it is an exclamation. An exclamation ends with an exclamation mark.'),
    kind4('How tall that tree is', 'exclamation', 'It starts with How and shows surprise, so it is an exclamation. An exclamation ends with an exclamation mark.'),
    kind4('What a big dog that is', 'exclamation', 'It starts with What a and shows surprise, so it is an exclamation. An exclamation ends with an exclamation mark.')] },
  { id: 'joining-sentences', title: 'Joining Sentences', tip: "And adds more. But shows something different. Or gives a choice. Because gives a reason. When tells us the time. If tells us what might happen. That tells us more.", items: [
    join(['Bonnie was wet.', 'She had jumped into the pond.'], 'Bonnie was wet ___ she had jumped into the pond.', 'because', ['but', 'or'], "Because tells us the reason Bonnie was wet."),
    join(['I wanted to play outside.', 'It was raining.'], 'I wanted to play outside ___ it was raining.', 'but', ['or', 'that'], 'But shows something different: I wanted to play, but the rain stopped me.'),
    join(['We could go to the park.', 'We could go swimming.'], 'We could go to the park ___ we could go swimming.', 'or', ['because', 'when'], 'Or gives us a choice: the park, or swimming.'),
    join(['Leo put on his coat.', 'It was cold outside.'], 'Leo put on his coat ___ it was cold outside.', 'because', ['but', 'or'], 'Because tells us the reason Leo put on his coat.'),
    join(['Bonnie barks.', 'The postman comes.'], 'Bonnie barks ___ the postman comes.', 'when', ['but', 'or'], 'When tells us the time Bonnie barks: when the postman comes.'),
    join(['You can have a biscuit.', 'You must eat your lunch first.'], 'You can have a biscuit ___ you eat your lunch.', 'if', ['but', 'or'], 'If tells us what has to happen first: eat your lunch, then you can have a biscuit.'),
    join(['Dad said something.', 'We could have pizza.'], 'Dad said ___ we could have pizza.', 'that', ['or', 'but'], 'That tells us what Dad said.'),
    join(['Ben fell over.', 'He was running.'], 'Ben fell over ___ he was running.', 'when', ['or', 'but'], 'When tells us the time Ben fell over: while he was running.'),
    join(['I like cats.', "I don't like spiders."], "I like cats ___ I don't like spiders.", 'but', ['because', 'if'], 'But shows something different: I like cats, but not spiders.'),
    join(['Priya fed the hens.', 'Leo collected the eggs.'], 'Priya fed the hens ___ Leo collected the eggs.', 'and', ['if', 'that'], 'And adds more: Priya fed the hens, and Leo collected the eggs too.')] },
];
const KIND_NAMES = [['statement', 'Statement', 'tells you something'], ['question', 'Question', 'asks something'], ['command', 'Command', 'tells someone to do something'], ['exclamation', 'Exclamation', 'What…! or How…!']];
const M2_PROMPTS = {
  comma: 'Tap the spaces where the commas go, then tap Check.',
  contract: 'Make the short word. Tap the letters we leave out.',
  owner: 'One word needs an apostrophe to show who owns something. Tap it!',
  whyapos: 'Why does this word have an apostrophe?',
  kind4: 'What kind of sentence is this?',
  kind4mark: 'Now choose its end mark.',
  join: 'Which joining word makes the best sense?',
};
const M2_SAY = {
  commaAnd: "The word and joins the last two things in the list, so we don't need a comma there.",
  commaMissing: 'Read it aloud. Is there a pause between two things in the list? A comma goes there.',
  commaWrongPlace: "That comma splits words that belong together. Commas go between the things in a list.",
  contractNone: 'Tap the letters we leave out when we say it the short way.',
  contractWrong: 'Not quite! Say both ways out loud. Which letters disappear?',
  ownerPlural: '{W} just means more than one, so it doesn\'t need an apostrophe. Who owns something?',
  ownerOther: 'Does that word own something? Look for a name or a person.',
  whyWrong: 'Hmm! Try saying it the long way. Can you?',
  whyWrongOwn: 'Hmm! Does something belong to someone here?',
  kindWrong: 'Read it again. Does it tell, ask, give an order, or start with What or How?',
  markWrong: 'Not that mark. Think about what kind of sentence it is.',
  joinWrong: 'Hmm, listen: {S} Does that make sense?',
  reread: 'Listen carefully, then have another go!',
  commaOne: "I've put one comma in the right place for you.",
  commaFixed: "I've taken away the commas that don't belong, and put one in the right place.",
  showAll: "Here's how it goes. Read it, then tap Check!",
  contractOne: "I've crossed out one letter we leave out. Can you find the rest?",
  contractAll: "Here are the letters we leave out. Tap Check!",
  ownerNarrow: "I've made the words that can't be it paler.",
  takeAway: "I've taken away one answer that doesn't fit.",
  showIt: '{W} Tap the shiny answer!',
};
const M2_CSS = `
/* ---------- Sentence Meadow, levels 6 to 9 ---------- */
.m2-line{display:flex;flex-wrap:wrap;align-items:center;row-gap:10px;padding:14px;border-radius:20px;background:#F7F0E2;border:3px solid #E5D6BA;margin:14px 0;font-family:var(--font-read);font-size:1.6rem;font-weight:700;line-height:1.3}
.m2-word{padding:2px 2px}
.m2-gap{position:relative;width:30px;height:46px;margin:0 2px;border-radius:12px;border:2px dashed #CDBB9C;background:#fff;display:inline-grid;place-items:center;font:inherit;color:var(--accent-dark);padding:0}
.m2-gap::after{content:"";position:absolute;inset:-4px -7px}
.m2-gap.on{border-style:solid;border-color:var(--accent);background:#FFE6D2}
.m2-gap.on span{transform:translateY(4px)}
.m2-gap.glow,.m2-tap.glow,.m2-choice.glow,.m2-letter.glow{box-shadow:0 0 0 5px rgba(242,193,78,.8)}
.m2-gap.bad{border-color:var(--berry);background:#FBE3E6}
.m2-gap.bad::before{content:"✗";position:absolute;top:-16px;font-size:.8rem;color:var(--berry)} /* not by colour alone */
.m2-end{margin-left:2px}
.m2-letters{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;margin:14px 0}
.m2-letter{min-width:52px;height:62px;padding:0 10px;border-radius:14px;font-family:var(--font-read);font-size:2rem;font-weight:700;color:#3B2A1A;background:linear-gradient(180deg,var(--wood-light),var(--wood));border:0;border-bottom:6px solid var(--wood-dark)}
.m2-letter.out{opacity:.45;text-decoration:line-through 4px var(--berry);background:#EEE6D8;border-bottom-color:#C9BBA4}
.m2-space{width:18px}
.m2-short{text-align:center;font-family:var(--font-read);font-size:2.2rem;font-weight:700;min-height:56px;margin:6px 0}
.m2-short .ap{color:var(--accent-dark)}
.m2-from{text-align:center;font-family:var(--font-read);font-size:1.4rem;margin:4px 0}
.m2-tap{font:inherit;color:inherit;background:#fff;border:2px solid var(--card-edge);border-bottom-width:4px;border-radius:12px;padding:4px 10px;margin:2px 3px;min-height:44px}
.m2-tap.pale{opacity:.35}
.m2-tap.right{background:#D8F0C6;border-color:var(--leaf-dark)}
.m2-tap.wrong{text-decoration:line-through 3px;opacity:.5}
.m2-plain{margin:2px 3px}
.m2-choices{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.m2-choice{font-family:var(--font-read);font-size:1.3rem;font-weight:700;padding:10px 12px;min-height:56px;border-radius:24px;background:linear-gradient(180deg,#FFF,#F3EADA);border:3px solid var(--card-edge);border-bottom-width:6px;color:inherit;display:grid;gap:2px}
.m2-choice small{font-family:var(--font-ui);font-size:.8rem;font-weight:600;color:var(--ink-soft)}
.m2-choice.wrong{opacity:.4;text-decoration:line-through 3px}
.m2-choice.right{background:linear-gradient(180deg,#D8F0C6,#A9D58C);border-color:var(--leaf-dark)}
.m2-choice.right::before{content:"✓"}
.m2-ideas{display:grid;gap:6px;margin:8px 0 4px;font-family:var(--font-read);font-size:1.25rem}
.m2-ideas div{padding:6px 12px;border-radius:12px;background:#fff;border:2px solid #E5D6BA}
.m2-joined .blank{display:inline-block;min-width:86px;border-bottom:4px dashed var(--accent);text-align:center;color:var(--leaf-dark)}
.m2-why{margin-top:14px;padding:12px 16px;border-radius:16px;background:#EAF5E1;border:2px solid var(--leaf);font-family:var(--font-read);font-size:1.15rem;line-height:1.45}
.m2-why::before{content:"💡 "}
@media (max-width:560px){
  .m2-line{font-size:1.3rem;padding:10px;row-gap:8px}
  .m2-gap{width:26px;height:40px}
  .m2-letter{min-width:44px;height:54px;font-size:1.7rem;padding:0 8px}
  .m2-letters{gap:6px}
  .m2-short{font-size:1.9rem;min-height:48px}
  .m2-choice{font-size:1.15rem;padding:8px 10px;min-height:50px}
  .m2-ideas{font-size:1.1rem}
  .m2-why{font-size:1.05rem;padding:10px 12px}
}
`;
/* What Bonnie says for a joining word that doesn't fit: the sentence with it, read back. */
const joinWith = (item, w) => item.s.replace('___', w);

function playMeadow2(item, ctx) {
  const area = ctx.area, k = item.kind;
  const prompt = M2_PROMPTS[k];
  let hearText = '', solvedLine = '', why = item.why || '';
  // solved: Bonnie shows and says why it works, using this sentence
  const done = (el, whyText) => { $('#m2Why').innerHTML = `<div class="m2-why" role="status">${esc(whyText)}</div>`; Meadow.correct(el, { sayFirst: whyText.replace(/[.!?]$/, ''), hold: 3000 }); };
  area.innerHTML = `<p class="mode-tip lead">🌼 <span id="m2Prompt">${esc(prompt)}</span></p>
    <div class="row-btns"><button class="btn small" id="hear">🔊 Hear it</button></div>
    <div id="m2Work"></div><div id="m2Why"></div>`;
  const work = $('#m2Work');
  let hints;

  if (k === 'comma') {
    const P = commaParse(item.s), on = new Set();
    hearText = item.s; why = `The commas go between the things in the list: ${item.s}`;
    work.innerHTML = `<div class="m2-line" id="m2Line"></div><div class="row-btns check-row"><button class="btn green" id="checkBtn">✓ Check my commas</button></div>`;
    const draw = () => {
      $('#m2Line').innerHTML = P.words.map((w, i) => `<span class="m2-word">${esc(w)}</span>` + (i < P.words.length - 1
        ? `<button class="m2-gap ${on.has(i) ? 'on' : ''}" data-i="${i}" aria-label="${on.has(i) ? `Comma after ${esc(w)}` : `Space after ${esc(w)}, no comma`}"><span aria-hidden="true">${on.has(i) ? ',' : ''}</span></button>`
        : `<span class="m2-end" aria-label="full stop">${esc(P.end)}</span>`)).join('');
      $$('#m2Line .m2-gap').forEach(b => b.onclick = () => { if (Meadow.isBusy()) return; const i = +b.dataset.i; on.has(i) ? on.delete(i) : on.add(i); sfx.pop(); draw(); $(`#m2Line .m2-gap[data-i="${i}"]`).focus(); });
    };
    draw();
    $('#checkBtn').onclick = () => {
      if (Meadow.isBusy()) return;
      const extra = [...on].filter(i => !P.commas.includes(i)), missing = P.commas.filter(i => !on.has(i));
      if (!extra.length && !missing.length) { done($('#m2Line'), why); return; }
      const beforeAnd = extra.find(i => P.words[i + 1] === 'and');
      extra.forEach(i => $(`#m2Line .m2-gap[data-i="${i}"]`).classList.add('bad'));
      Meadow.wrong(beforeAnd != null ? M2_SAY.commaAnd : extra.length ? M2_SAY.commaWrongPlace : M2_SAY.commaMissing);
    };
    hints = [
      () => { later(() => say(item.s, { rate: .75 }), 1400); return M2_SAY.reread; },
      () => esc(ctx.level.tip),
      () => { const hadWrong = [...on].some(i => !P.commas.includes(i)); [...on].forEach(i => { if (!P.commas.includes(i)) on.delete(i); });
        const i = P.commas.find(i => !on.has(i)); if (i != null) on.add(i); draw(); if (i != null) $(`#m2Line .m2-gap[data-i="${i}"]`).classList.add('glow');
        return hadWrong ? M2_SAY.commaFixed : M2_SAY.commaOne; },
      () => { on.clear(); P.commas.forEach(i => on.add(i)); draw(); $$('#m2Line .m2-gap.on').forEach(b => b.classList.add('glow')); $('#checkBtn').classList.add('snap'); return M2_SAY.showAll; },
    ];
  }

  if (k === 'contract') {
    const P = contractParse(item.full), gone = P.letters.map(() => false);
    hearText = `${P.words} ... ${P.short}`; why = `We leave out ${P.letters.filter(l => l.out).map(l => l.ch).join(' and ')}, and the apostrophe goes where ${P.letters.filter(l => l.out).length > 1 ? 'they were' : 'it was'}: ${P.short}.`;
    work.innerHTML = `<p class="m2-from"><b>${esc(P.words)}</b> → ?</p><div class="m2-letters" id="m2Letters"></div><div class="m2-short" id="m2Short" aria-live="polite"></div>
      <div class="row-btns check-row"><button class="btn green" id="checkBtn">✓ Check</button></div>`;
    const draw = () => {
      $('#m2Letters').innerHTML = P.letters.map((l, i) => l.space ? '<span class="m2-space" aria-hidden="true"></span>'
        : `<button class="m2-letter ${gone[i] ? 'out' : ''}" data-i="${i}" aria-label="${esc(l.ch)}${gone[i] ? ', left out' : ''}" aria-pressed="${gone[i]}">${esc(l.ch)}</button>`).join('');
      const sh = shortOf(P.letters, gone);
      $('#m2Short').innerHTML = gone.some(Boolean) ? esc(sh).replace(/&#39;|'/g, '<span class="ap">\'</span>') : '';
      $$('#m2Letters .m2-letter').forEach(b => b.onclick = () => { if (Meadow.isBusy()) return; const i = +b.dataset.i; gone[i] = !gone[i]; sfx.pop(); draw(); $(`#m2Letters .m2-letter[data-i="${i}"]`).focus(); });
    };
    draw();
    $('#checkBtn').onclick = () => {
      if (Meadow.isBusy()) return;
      if (!gone.some(Boolean)) return bubble(esc(M2_SAY.contractNone));
      if (shortOf(P.letters, gone) === P.short) { done($('#m2Short'), why); return; }
      Meadow.wrong(M2_SAY.contractWrong);
    };
    hints = [
      () => { later(() => say(hearText, { rate: .75 }), 1400); return M2_SAY.reread; },
      () => esc(ctx.level.tip),
      () => { P.letters.forEach((l, i) => { if (gone[i] && !l.out) gone[i] = false; }); const i = P.letters.findIndex((l, i) => l.out && !gone[i]); if (i >= 0) gone[i] = true; draw(); if (i >= 0) $(`#m2Letters .m2-letter[data-i="${i}"]`).classList.add('glow'); return M2_SAY.contractOne; },
      () => { P.letters.forEach((l, i) => { gone[i] = l.out; }); draw(); $$('#m2Letters .m2-letter.out').forEach(b => b.classList.add('glow')); $('#checkBtn').classList.add('snap'); return M2_SAY.contractAll; },
    ];
  }

  if (k === 'owner') {
    const ws = item.s.replace(/[.!?]$/, '').split(' '), end = item.s.slice(-1), clean = w => w.replace(/[^A-Za-z']/g, '');
    hearText = item.s.replace(item.word, item.fixed);
    work.innerHTML = `<div class="m2-line" id="m2Line">${ws.map((w, i) => `<button class="m2-tap" data-i="${i}">${esc(w)}</button>`).join('')}<span class="m2-end" aria-hidden="true">${esc(end)}</span></div>`;
    const target = ws.findIndex(w => clean(w) === item.word);
    $$('#m2Line .m2-tap').forEach(b => b.onclick = () => {
      if (Meadow.isBusy()) return;
      const i = +b.dataset.i, w = clean(ws[i]);
      if (i === target) { b.textContent = item.fixed; b.classList.add('right'); b.setAttribute('aria-label', `${item.fixed}, correct`); done(b, item.why); return; }
      b.classList.add('wrong');
      Meadow.wrong(item.plurals.includes(w.toLowerCase()) ? M2_SAY.ownerPlural.replace('{W}', cap1(w)) : M2_SAY.ownerOther);
    });
    hints = [
      () => { later(() => say(item.s, { rate: .75 }), 1400); return M2_SAY.reread; },
      () => esc(ctx.level.tip),
      () => { const keep = new Set([target, ws.findIndex(w => item.plurals.includes(clean(w).toLowerCase()))]); $$('#m2Line .m2-tap').forEach((b, i) => { if (!keep.has(i)) { b.classList.add('pale'); b.disabled = true; } }); return M2_SAY.ownerNarrow; },
      () => { $$('#m2Line .m2-tap')[target].classList.add('glow'); return esc(M2_SAY.showIt.replace('{W}', item.why)); },
    ];
  }

  if (k === 'whyapos' || k === 'join' || k === 'kind4') {
    let choices, answer, part = 1;
    if (k === 'whyapos') {
      hearText = item.s; answer = item.miss ? 'missing' : 'belongs';
      choices = [['missing', 'Letters are missing', ''], ['belongs', 'Something belongs to someone', '']];
      const at = item.s.indexOf(item.word);
      work.innerHTML = `<div class="m2-line" style="justify-content:center">${esc(item.s.slice(0, at))}<b style="text-decoration:underline 3px var(--accent);text-underline-offset:6px;margin:0 6px">${esc(item.word)}</b>${esc(item.s.slice(at + item.word.length))}</div>`;
    } else if (k === 'join') {
      hearText = `${item.ideas.join(' ')} ... ${item.s.replace('___', '...')}`; answer = item.answer;
      choices = shuffle([item.answer, ...item.wrong]).map(w => [w, w, '']);
      work.innerHTML = `<div class="m2-ideas" aria-label="Two ideas">${item.ideas.map(x => `<div>${esc(x)}</div>`).join('')}</div>
        <div class="m2-line m2-joined" id="m2Line">${esc(item.s).replace('___', '<span class="blank" id="m2Blank"><span aria-hidden="true">&nbsp;?&nbsp;</span><span class="sr">blank</span></span>')}</div>`;
    } else {
      hearText = item.s; answer = item.k; choices = KIND_NAMES;
      work.innerHTML = `<div class="m2-line" id="m2Line" style="justify-content:center"><span>${esc(item.s)}</span><span class="p-slot" id="m2Slot" aria-label="end mark: not chosen yet"></span></div>`;
    }
    work.insertAdjacentHTML('beforeend', `<div class="m2-choices" id="m2Choices">${choices.map(([v, t, sub]) => `<button class="m2-choice" data-v="${esc(v)}">${esc(t)}${sub ? `<small>${esc(sub)}</small>` : ''}</button>`).join('')}</div>`);
    const solvedWhy = () => k === 'join' ? `${joinWith(item, answer)} ${item.why}` : item.why;
    const right = b => { b.classList.add('right'); b.setAttribute('aria-label', `${b.textContent}, correct`); $$('#m2Choices .m2-choice').forEach(x => { x.disabled = true; }); };
    const startMarks = () => {
      part = 2; $('#m2Prompt').textContent = M2_PROMPTS.kind4mark;
      $('#m2Choices').insertAdjacentHTML('afterend', `<div class="badges" id="badges">${['.', '?', '!'].map(b => `<button class="badge" data-b="${b}" aria-label="${b === '.' ? 'full stop' : b === '?' ? 'question mark' : 'exclamation mark'}" style="background:${b === '.' ? 'var(--leaf)' : b === '?' ? '#5B9BD5' : 'var(--berry)'};border:0">${b}<small aria-hidden="true">${b === '.' ? 'full stop' : b === '?' ? 'question' : 'exclaim!'}</small></button>`).join('')}</div>`);
      $$('#badges .badge').forEach(b => b.onclick = () => {
        if (Meadow.isBusy()) return;
        if (item.marks.includes(b.dataset.b)) { $('#m2Slot').textContent = b.dataset.b; $('#m2Slot').classList.add('filled'); $('#m2Slot').setAttribute('aria-label', `end mark: ${b.getAttribute('aria-label')}`); done($('#m2Line'), item.why); }
        else { b.classList.add('off'); Meadow.wrong(M2_SAY.markWrong); }
      });
      if (tierNow() >= 3) $$('#badges .badge').find(b => !item.marks.includes(b.dataset.b)).classList.add('off');
      if (tierNow() >= 4) $$('#badges .badge').find(b => item.marks.includes(b.dataset.b)).classList.add('glow');
      bubble(esc(M2_PROMPTS.kind4mark));
    };
    const tierNow = () => (Meadow.round() || {}).tier || 0;
    $$('#m2Choices .m2-choice').forEach(b => b.onclick = () => {
      if (Meadow.isBusy() || part !== 1) return;
      const v = b.dataset.v;
      if (v === answer) {
        right(b);
        if (k === 'join') { $('#m2Blank').innerHTML = esc(v); done($('#m2Line'), solvedWhy()); }
        else if (k === 'whyapos') done(b, item.why);
        else { sfx.pop(); startMarks(); }
        return;
      }
      b.classList.add('wrong'); b.disabled = true; b.setAttribute('aria-label', `${b.textContent}, not this one`);
      Meadow.wrong(k === 'join' ? esc(M2_SAY.joinWrong.replace('{S}', joinWith(item, v))) : k === 'kind4' ? M2_SAY.kindWrong : answer === 'missing' ? M2_SAY.whyWrong : M2_SAY.whyWrongOwn);
    });
    hints = [
      () => { later(() => say(hearText, { rate: .8 }), 1400); return M2_SAY.reread; },
      () => esc(ctx.level.tip),
      () => { if (part === 2) { $$('#badges .badge').find(b => !item.marks.includes(b.dataset.b)).classList.add('off'); return M2_SAY.takeAway; }
        const w = $$('#m2Choices .m2-choice').find(x => x.dataset.v !== answer && !x.disabled); if (w) { w.classList.add('wrong'); w.disabled = true; } return M2_SAY.takeAway; },
      () => { if (part === 2) { $$('#badges .badge').find(b => item.marks.includes(b.dataset.b)).classList.add('glow'); return esc(M2_SAY.showIt.replace('{W}', item.why)); }
        $$('#m2Choices .m2-choice').find(x => x.dataset.v === answer).classList.add('glow'); return esc(M2_SAY.showIt.replace('{W}', solvedWhy())); },
    ];
  }

  $('#hear').onclick = () => say(hearText, { rate: .8 });
  ctx.hints(hints);
  bubble(fmt(ctx.index === 0 ? `Let's practise, {N}! ${prompt}` : rand(["Here's another one!", "Can you do this one?", "Let's make it perfect!"])), false);
  later(() => say(prompt + ' ... ' + hearText, { rate: .85 }), 300);
}
/* Bonnie's lines for levels 6 to 9 (for tools/make-voice.mjs). */
function meadow2Lines(add, hint) {
  add(...Object.values(M2_PROMPTS), M2_SAY.commaAnd, M2_SAY.commaMissing, M2_SAY.commaWrongPlace, M2_SAY.contractNone, M2_SAY.contractWrong, M2_SAY.ownerOther,
    M2_SAY.whyWrong, M2_SAY.whyWrongOwn, M2_SAY.kindWrong, M2_SAY.markWrong);
  hint(0, M2_SAY.reread);
  [M2_SAY.commaOne, M2_SAY.commaFixed, M2_SAY.contractOne, M2_SAY.ownerNarrow, M2_SAY.takeAway].forEach(x => hint(2, x));
  [M2_SAY.showAll, M2_SAY.contractAll].forEach(x => hint(3, x));
  const solved = w => add(w.replace(/[.!?]$/, '') + '!');
  MEADOW2.forEach(L => {
    hint(1, esc(L.tip));
    L.items.forEach(item => {
      const k = item.kind, sayLine = (prompt, hearText) => add(prompt + ' ... ' + hearText, hearText);
      if (k === 'comma') { sayLine(M2_PROMPTS.comma, item.s); solved(`The commas go between the things in the list: ${item.s}`); }
      if (k === 'contract') { const P = contractParse(item.full), out = P.letters.filter(l => l.out);
        sayLine(M2_PROMPTS.contract, `${P.words} ... ${P.short}`); solved(`We leave out ${out.map(l => l.ch).join(' and ')}, and the apostrophe goes where ${out.length > 1 ? 'they were' : 'it was'}: ${P.short}.`); }
      if (k === 'owner') { const fixed = item.s.replace(item.word, item.fixed); sayLine(M2_PROMPTS.owner, fixed); add(item.s); solved(item.why);
        item.plurals.forEach(w => add(M2_SAY.ownerPlural.replace('{W}', cap1(w)))); hint(3, esc(M2_SAY.showIt.replace('{W}', item.why))); }
      if (k === 'whyapos') { sayLine(M2_PROMPTS.whyapos, item.s); solved(item.why); hint(3, esc(M2_SAY.showIt.replace('{W}', item.why))); }
      if (k === 'kind4') { sayLine(M2_PROMPTS.kind4, item.s); add(M2_PROMPTS.kind4mark); solved(item.why); hint(3, esc(M2_SAY.showIt.replace('{W}', item.why))); }
      if (k === 'join') { const hear = `${item.ideas.join(' ')} ... ${item.s.replace('___', '...')}`; sayLine(M2_PROMPTS.join, hear);
        solved(`${joinWith(item, item.answer)} ${item.why}`); item.wrong.forEach(w => add(M2_SAY.joinWrong.replace('{S}', joinWith(item, w))));
        hint(3, esc(M2_SAY.showIt.replace('{W}', `${joinWith(item, item.answer)} ${item.why}`))); }
    });
  });
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
  meadow2Lines(add, hint);
  return out;
}

const IDS = ["capital-letters", "full-stop-or-question", "exclamation", "word-order", "super-sentences"];
Meadow.registerWorld({
  id: 'y2-english-sentences', subject: 'english', year: 2,
  name: "Sentence Meadow", tag: "Capitals & punctuation", icon: '🌼', color: '#E07A3F', tint: '#FBE3D2',
  perLevel: 6, praise: PRAISE, hintNames: HINTS, css: CSS + M2_CSS, play: playSentence, lines,
  // levels 1 to 5 (their ids never change), then levels 6 to 9, which play with playMeadow2
  levels: [...SENTENCES.map((L, i) => ({ ...L, id: IDS[i], name: L.title })), ...MEADOW2.map(L => ({ ...L, name: L.title, play: playMeadow2 }))],
});
})();
