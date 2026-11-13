/* =========================================================
   WORLD: Tricky Word Trail (Meadow Words, Year 2)
   Pick the right spelling of common exception words.
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

const tw = (word, sentence, wrong, tip) => ({ word, sentence, wrong, tip });
const TRICKY = [
  { title: 'Trail Starters', items: [
    tw('said', 'Bonnie ___ hello to the frog.', ['sed', 'sayd'], "'said' has 'ai' in the middle, but it sneakily says 'e'!"),
    tw('have', 'I ___ a red ball.', ['hav', 'haf'], "'have' ends with a quiet 'e'. English words don't like to end in 'v'!"),
    tw('like', 'Bonnie and I ___ bones.', ['lik', 'liek'], "'like' has a magic 'e' at the end: l-i-k-e."),
    tw('come', 'Please ___ to my party.', ['kum', 'cume'], "'come' sounds like 'kum' but it's spelt c-o-m-e. Tricky!"),
    tw('some', 'Can I have ___ cake?', ['sum', 'som'], "'some' is spelt s-o-m-e, just like 'come'!"),
    tw('were', 'We ___ playing in the meadow.', ['wer', 'wur'], "'were' starts like 'we' and has an 'e' at the end: w-e-r-e.")] },
  { title: 'Where & There', items: [
    tw('one', 'Bonnie has ___ bone.', ['wun', 'wone'], "'one' sounds like 'wun' but it's spelt o-n-e!"),
    tw('once', '___ upon a time...', ['wunce', 'wonse'], "'once' is 'one' with a 'ce' at the end: o-n-c-e."),
    tw('there', 'Look over ___!', ['thare', 'ther'], "'there' has the word 'here' hiding inside it: t-HERE!"),
    tw('where', '___ is my hat?', ['wair', 'whare'], "'where' also has 'here' hiding inside: w-HERE!"),
    tw('friend', 'Bonnie is my best ___.', ['frend', 'freind'], "'friend' has a sneaky 'i' — remember: a FRIend is there till the END."),
    tw('school', 'Lucy walks to ___.', ['skool', 'scool'], "'school' starts with 's-c-h' and has a double 'o'.")] },
  { title: 'Would, Could, Should', items: [
    tw('because', 'I am happy ___ it is sunny.', ['becos', 'becuz'], "Say it in a funny way: be-CAUSE. B-e-c-a-u-s-e!"),
    tw('people', 'Lots of ___ came to the fair.', ['peeple', 'pepul'], "'people' has a sneaky 'o' in the middle: p-e-O-p-l-e."),
    tw('would', '___ you like a biscuit?', ['wud', 'whould'], "would, could and should are a family! They all end in 'o-u-l-d'."),
    tw('could', 'Bonnie ___ smell sausages!', ['cud', 'coud'], "Remember: O U Lucky Duck — o-u-l-d!"),
    tw('should', 'We ___ wash our hands.', ['shud', 'shoud'], "'should' is in the 'ould' family, like would and could."),
    tw('who', '___ ate my sandwich?', ['hoo', 'whoo'], "'who' starts with 'wh' but sounds like 'hoo'. Just three letters: w-h-o.")] },
  { title: 'Water & Money', items: [
    tw('water', 'The duck swam in the ___.', ['worter', 'watter'], "'water' sounds like 'wor-ter' but has an 'a': w-a-t-e-r."),
    tw('again', 'Read it ___, please!', ['agen', 'agian'], "'again' has 'a' at the start and 'ai' later: a-g-a-i-n."),
    tw('half', 'Can I have ___ of your apple?', ['harf', 'haf'], "'half' has a silent 'l' hiding in it!"),
    tw('money', 'I saved my ___ in a piggy bank.', ['muny', 'mony'], "'money' sounds like 'munny' but it's spelt m-o-n-e-y."),
    tw('any', 'Are there ___ biscuits left?', ['eny', 'enny'], "'any' says 'enny' but starts with an 'a'!"),
    tw('many', 'How ___ frogs can you see?', ['meny', 'menny'], "'many' is like 'any' with an 'm' at the front!")] },
  { title: 'Big Tricky Words', items: [
    tw('beautiful', 'What a ___ butterfly!', ['bootiful', 'beutiful'], "Say it like a robot: BE-A-U-TI-FUL. It has 'eau' in it!"),
    tw('pretty', 'The flowers are very ___.', ['pritty', 'prety'], "'pretty' says 'pritty' but has an 'e' and double 't'."),
    tw('busy', 'The bees are ___ making honey.', ['bizzy', 'buzy'], "'busy' says 'bizzy' but it's spelt with a 'u': b-u-s-y."),
    tw('whole', 'Bonnie ate the ___ sausage!', ['hoal', 'wole'], "'whole' has a silent 'w' at the start: w-h-o-l-e."),
    tw('clothes', 'Put your ___ in the drawer.', ['cloathes', 'klothes'], "'clothes' is 'cloth' + 'es'!"),
    tw('Christmas', 'We sing carols at ___.', ['Crismas', 'Kristmas'], "'Christmas' has 'Christ' at the start with a silent 'h' and 't'."),
    tw('parents', 'My ___ came to the school play.', ['perents', 'parence'], "'parents' starts like 'pa' and ends with 'ents'."),
    tw('everybody', '___ clapped and cheered!', ['evrybody', 'everybuddy'], "'everybody' is two words glued together: every + body!")] },
];

const CSS = `
/* ---------- Tricky trail ---------- */
.trail{display:flex;align-items:flex-end;gap:0;justify-content:space-between;margin:4px 0 18px;padding:10px 6px 4px;background:linear-gradient(180deg,transparent 60%,#D9EBC4 60%);border-radius:18px;position:relative}
.step{width:44px;height:20px;background:#CDBB9C;border-radius:50%;position:relative;box-shadow:inset 0 -3px 0 rgba(0,0,0,.12)}
.step.done{background:var(--leaf)}
.step .pup{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:56px;height:56px;transition:all .5s}
.trail .goal{font-size:2rem}
.tricky-sentence{font-family:var(--font-read);font-size:clamp(1.5rem,3.5vw,2.1rem);text-align:center;margin:10px 0 20px;line-height:1.5}
.gap{display:inline-block;min-width:120px;border-bottom:4px dashed var(--accent);margin:0 6px;color:var(--leaf-dark);font-weight:700}
.signs{display:flex;gap:18px;justify-content:center;flex-wrap:wrap;margin-top:10px}
.sign{position:relative;z-index:0;padding:0 0 46px;transition:transform .2s}
.sign .board{font-family:var(--font-read);font-weight:700;font-size:clamp(1.5rem,3.4vw,2rem);background:linear-gradient(180deg,var(--wood-light),var(--wood));border-bottom:6px solid var(--wood-dark);padding:14px 26px;border-radius:12px 34px 34px 12px;box-shadow:0 6px 10px rgba(74,59,44,.25);color:#3B2A1A;min-width:150px;text-align:center}
.sign::after{content:"";position:absolute;left:24px;bottom:0;width:14px;height:52px;background:var(--wood-dark);border-radius:4px;z-index:-1}
.sign.wrong{animation:wobble .6s;opacity:.35;pointer-events:none}
.sign.right .board{background:linear-gradient(180deg,#BFE3A8,var(--leaf));border-color:var(--leaf-dark)}
.sign.glow .board{box-shadow:0 0 0 6px rgba(242,193,78,.7)}
.mode-tip{text-align:center;font-family:var(--font-read);font-size:1.2rem;color:var(--ink-soft)}
@media (max-width:520px){ .sign .board{min-width:110px;padding:12px 16px} }
@media (hover:hover){ .sign:hover{transform:rotate(-2deg) translateY(-3px)} }
@keyframes wobble{0%,100%{transform:rotate(0)}25%{transform:rotate(-10deg)}75%{transform:rotate(8deg)}}
`;

function playTricky(item, ctx) {
  const sentence = fmt(item.sentence), atStart = sentence.startsWith('___');
  const opts = shuffle([item.word, ...item.wrong]).map(o => atStart ? cap1(o) : o);
  const answer = atStart ? cap1(item.word) : item.word;
    const area = ctx.area;
  area.innerHTML = `
    <div class="trail" id="trail">
      ${Array.from({ length: ctx.count }, (_, i) => `<div class="step ${i < ctx.index ? 'done' : ''}">${i === ctx.index ? `<div class="pup">${bonnieSVG()}</div>` : ''}</div>`).join('')}
      <div class="goal">🏁</div>
    </div>
    <div class="tricky-sentence" id="sent">${esc(sentence).replace('___', '<span class="gap" id="gap">&nbsp;</span>')}</div>
    <div class="row-btns"><button class="btn small" id="hear">🔊 Hear the sentence</button></div>
    <div class="signs" id="signs">${opts.map(o => `<button class="sign" data-o="${esc(o)}"><div class="board">${esc(o)}</div></button>`).join('')}</div>
    <p class="mode-tip">Tap the signpost with the correct spelling to clear Bonnie's path!</p>`;
  const full = sentence.replace('___', item.word);
  $('#hear').onclick = () => say(full, { rate: .8 });
  $$('.sign').forEach(b => b.onclick = () => {
    if (Meadow.isBusy()) return;
    if (b.dataset.o === answer) {
      b.classList.add('right'); $('#gap').textContent = answer;
      $$('.sign').forEach(x => x !== b && (x.style.opacity = .3));
      const pup = $('#trail .pup'), steps = $$('#trail .step');
      if (pup && steps[ctx.index + 1]) { const a = steps[ctx.index].getBoundingClientRect(), c = steps[ctx.index + 1].getBoundingClientRect(); pup.style.transform = `translate(calc(-50% + ${c.left - a.left}px), -20px)`; }
      else if (pup) { pup.style.transform = 'translate(20px,-24px) scale(1.1)'; }
      steps[ctx.index] && steps[ctx.index].classList.add('done');
      Meadow.correct(b, { sayFirst: `${item.word}... ${item.word.split('').join(', ')}` });
    } else { b.classList.add('wrong'); Meadow.wrong(fmt(`Hmm, "${esc(b.dataset.o)}" isn't quite right. Look carefully at each letter!`)); }
  });
  ctx.hints([
    () => { later(() => say(`${item.word}. ${full}`, { rate: .7 }), 1500); return `Listen carefully: <b>${esc(item.word)}</b>. Which signpost looks right?`; },
    () => esc(item.tip),
    () => { const w = $$('.sign').find(x => x.dataset.o !== answer && !x.classList.contains('wrong')); if (w) w.classList.add('wrong'); return "Sniff sniff! I've knocked over one wrong signpost for you."; },
    () => { $$('.sign').forEach(x => x.dataset.o === answer ? x.classList.add('glow') : x.classList.add('wrong'));
      later(() => say(`${item.word}. ${item.word.split('').join(', ')}`, { rate: .7 }), 1700);
      return `This is how we spell it: <b>${esc(answer)}</b>. Tap the shiny sign!`; },
  ]);
  bubble(fmt(ctx.index === 0 ? "Help me down the trail, {N}! Pick the right spelling." : rand(["Which one is spelt right?", "Look carefully, word detective!", "Another signpost! Which is right?"])), false);
  later(() => say(`Find the word: ${item.word}. ${full}`, { rate: .85 }), 300);
}

/* Every line Bonnie can say in this world (for tools/make-voice.mjs). */
function lines() {
  const out = [], add = (...xs) => xs.forEach(x => out.push(fmt(x)));
  const hint = (tier, html) => add(text(`<b>${HINTS[tier]}</b> ${html}`));
  TRICKY.forEach(L => L.items.forEach(item => {
    const sentence = fmt(item.sentence), atStart = sentence.startsWith('___'), full = sentence.replace('___', item.word);
    const answer = atStart ? cap1(item.word) : item.word, letters = item.word.split('').join(', ');
    add(`Find the word: ${item.word}. ${full}`, `${item.word}. ${full}`, `${item.word}... ${letters}!`, `${item.word}. ${letters}`);
    item.wrong.forEach(o => add(text(fmt(`Hmm, "${esc(atStart ? cap1(o) : o)}" isn't quite right. Look carefully at each letter!`))));
    hint(0, `Listen carefully: <b>${esc(item.word)}</b>. Which signpost looks right?`); hint(1, esc(item.tip));
    hint(2, "Sniff sniff! I've knocked over one wrong signpost for you.");
    hint(3, `This is how we spell it: <b>${esc(answer)}</b>. Tap the shiny sign!`);
  }));
  return out;
}

const IDS = ["trail-starters", "where-there", "would-could-should", "water-money", "big-tricky-words"];
Meadow.registerWorld({
  id: 'y2-english-tricky-words', subject: 'english', year: 2,
  name: "Tricky Word Trail", tag: "Common exception words", icon: '🪧', color: '#D9A86C', tint: '#F6E7CF',
  perLevel: 6, praise: PRAISE, hintNames: HINTS, css: CSS, play: playTricky, lines,
  levels: TRICKY.map((L, i) => ({ ...L, id: IDS[i], name: L.title })),
});
})();
