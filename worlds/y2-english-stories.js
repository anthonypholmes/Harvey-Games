/* =========================================================
   WORLD: Bonnie's Story Nook (Meadow Words, Year 2)
   Short stories with rhyme, who, what, where and why questions.
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

const st = (story, q, answer, wrong, type, ev) => ({ story, q, answer, wrong, type, ev });
const STORIES = [
  { title: 'Rhyme Time', items: [
    st('{N} and Bonnie saw a cat. The cat was sitting on a ___.', 'Which word rhymes with cat?', 'mat', ['rug', 'dog'], 'rhyme', 'cat'),
    st('A little frog sat on a ___. Then he jumped into the pond with a splash!', 'Which word rhymes with frog?', 'log', ['leaf', 'rock'], 'rhyme', 'frog'),
    st('Bonnie dug a hole to hide her bone. Now she is sitting all ___.', 'Which word rhymes with bone?', 'alone', ['happy', 'sad'], 'rhyme', 'bone'),
    st('Bonnie found a big red ball. She kicked it over the garden ___.', 'Which word rhymes with ball?', 'wall', ['gate', 'fence'], 'rhyme', 'ball'),
    st('The mouse ran into the ___. It hid under the bed.', 'Which word rhymes with mouse?', 'house', ['shed', 'box'], 'rhyme', 'mouse'),
    st('The sun was hot and {N} had fun. {N} ate a sticky iced ___.', 'Which word rhymes with sun and fun?', 'bun', ['cake', 'pie'], 'rhyme', 'fun')] },
  { title: 'Who?', items: [
    st('Bonnie ran to the pond. A frog jumped onto a lily pad. Bonnie barked hello!', 'Who ran to the pond?', 'Bonnie', ['the frog', '{N}'], 'who', 'Bonnie ran'),
    st('{N} picked a red apple from the tree. Gran made a yummy pie with it.', 'Who made the pie?', 'Gran', ['{N}', 'Bonnie'], 'who', 'Gran made'),
    st('The farmer fed the hens in the morning. The hens laid six brown eggs.', 'Who laid the eggs?', 'the hens', ['the farmer', 'the cows'], 'who', 'hens laid'),
    st('Mum and {N} went to the shop. Mum bought some milk and {N} chose a comic.', 'Who chose a comic?', '{N}', ['Mum', 'Bonnie'], 'who', '{N} chose'),
    st('A tiny mouse lived under the oak tree. An owl hooted at night, but the mouse stayed safe.', 'Who hooted at night?', 'the owl', ['the mouse', 'the cat'], 'who', 'owl hooted'),
    st('Bonnie and the duck played chase. The duck flapped up onto the fence and Bonnie wagged her tail.', 'Who flapped onto the fence?', 'the duck', ['Bonnie', '{N}'], 'who', 'duck flapped')] },
  { title: 'Where & What?', items: [
    st('Bonnie hid her bone under the big oak tree. Then she ran home for tea.', 'Where did Bonnie hide her bone?', 'under the oak tree', ['in the pond', 'in her bed'], 'where', 'under the big oak tree'),
    st('{N} found a shiny shell on the beach. It was pink and white.', 'What did {N} find?', 'a shell', ['a crab', 'a bucket'], 'what', 'shiny shell'),
    st('The rabbit lived in a burrow by the river. Every day it nibbled green clover.', 'Where did the rabbit live?', 'in a burrow', ['in a tree', 'in a box'], 'where', 'in a burrow'),
    st('At the park, {N} flew a red kite. The wind made it go up high!', 'What colour was the kite?', 'red', ['blue', 'green'], 'what', 'red kite'),
    st('The ducks swam across the pond to the little island. They had a nap in the reeds.', 'Where did the ducks swim to?', 'the island', ['the farm', 'the shop'], 'where', 'little island'),
    st('Bonnie wore her best bow to the meadow party. Everyone ate cake and danced.', 'What did everyone eat?', 'cake', ['soup', 'carrots'], 'what', 'ate cake')] },
  { title: 'Mixed Questions', items: [
    st('One morning, a hedgehog went for a stroll. It snuffled about and fell into a ___!', 'Which word rhymes with stroll?', 'hole', ['pond', 'bush'], 'rhyme', 'stroll'),
    st('{N} and Bonnie walked to the farm. They saw a cow, a pig and a goat. The pig rolled in the mud.', 'Who rolled in the mud?', 'the pig', ['the cow', 'Bonnie'], 'who', 'pig rolled'),
    st('It was raining, so {N} put on red wellies. Splish, splash, into the puddles!', 'What did {N} put on?', 'red wellies', ['a sun hat', 'a coat'], 'what', 'red wellies'),
    st('The fox crept into the garden at night. It sniffed the bins and then ran off into the woods.', 'Where did the fox run to?', 'the woods', ['the river', 'the house'], 'where', 'into the woods'),
    st('A bird sat in a tree and sang a happy tune. It sang all morning and all ___.', 'Which word rhymes with tune?', 'afternoon', ['day', 'night'], 'rhyme', 'tune'),
    st('The little boat floated down the stream. A frog sat on top, eating ice ___.', 'Which word rhymes with stream?', 'cream', ['lolly', 'cake'], 'rhyme', 'stream')] },
  { title: 'Longer Stories', items: [
    st('Bonnie was very muddy after playing in the meadow. {N} filled a tub with warm, bubbly water. Bonnie jumped in and splashed everyone!', 'Why did {N} fill a tub?', 'Bonnie was muddy', ['it was hot', 'to grow flowers'], 'why', 'very muddy'),
    st('The wind blew hard and the leaves fell off the trees. They were red, orange and yellow. {N} jumped into the biggest pile.', 'What fell off the trees?', 'leaves', ['apples', 'birds'], 'what', 'leaves fell'),
    st('The squirrel collected nuts all autumn. She hid them in a hole in the old tree. In winter, she had plenty to eat.', 'Where did the squirrel hide the nuts?', 'in a hole in the tree', ['under a rock', 'in the river'], 'where', 'in a hole in the old tree'),
    st('Gran planted seeds in the vegetable patch. {N} watered them every day. Soon, big orange carrots were ready to pull up!', 'Who watered the seeds?', '{N}', ['Gran', 'Bonnie'], 'who', '{N} watered'),
    st('Bonnie heard a noise in the hedge. She poked her nose in and found a tiny lost kitten. She barked until its owner came.', 'What did Bonnie find?', 'a kitten', ['a ball', 'a bone'], 'what', 'tiny lost kitten'),
    st('On a frosty morning, {N} saw a robin in the garden. Its chest was bright red. {N} put out some seeds for it.', 'What colour was the robin\'s chest?', 'red', ['blue', 'yellow'], 'what', 'bright red')] },
];
const STORY_TIPS = {
  rhyme: "Rhyming words sound the same at the END, like cat, hat and mat. Say each answer out loud and listen!",
  who: "'Who' means a person or an animal. Look for a name or an animal in the story!",
  what: "'What' means a thing. Look for the thing in the story — reading it again helps!",
  where: "'Where' means a place. Look for words like in, on, under or to!",
  why: "'Why' asks for a reason. What happened FIRST that made it happen?",
};
const CSS = `
/* ---------- Story nook ---------- */
.story{font-family:var(--font-read);font-size:clamp(1.35rem,3vw,1.75rem);line-height:1.7;padding:18px 22px;background:#FFFDF8;border-radius:18px;border:2px solid var(--line);position:relative}
.story::before{content:"📖";position:absolute;top:-18px;left:-10px;font-size:2rem;transform:rotate(-12deg)}
.story .w{padding:2px 3px;border-radius:6px;transition:background .15s}
.story .w.hl{background:var(--gold)}
.story .w.ev{background:#CFE8BE;box-shadow:0 0 0 2px var(--leaf)}
.story .blank{display:inline-block;min-width:90px;border-bottom:4px dashed var(--accent);text-align:center;color:var(--leaf-dark);font-weight:700}
.question{font-family:var(--font-read);font-size:1.45rem;font-weight:700;margin:18px 0 10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
.opt{font-family:var(--font-read);font-size:1.4rem;font-weight:700;padding:16px;border-radius:40px;background:linear-gradient(180deg,#FFF,#F3EADA);border:3px solid var(--card-edge);border-bottom-width:7px;transition:transform .12s}
.opt.wrong{animation:shake .45s;opacity:.35;pointer-events:none}
.opt.right{background:linear-gradient(180deg,#D8F0C6,#A9D58C);border-color:var(--leaf-dark)}
.opt.glow{box-shadow:0 0 0 6px rgba(242,193,78,.8)}
@media (hover:hover){ .opt:hover{transform:translateY(-2px)} }
`;

function playStory(item, ctx) {
  const story = fmt(item.story), answer = fmt(item.answer), q = fmt(item.q);
  const opts = shuffle([answer, ...item.wrong.map(fmt)]);
  const evWords = fmt(item.ev).toLowerCase().split(' ');
  // wrap words in spans; keep track of character offsets for read-aloud highlighting
  const spoken = story.replace('___', '...');
  let html = '', pos = 0; const spans = [];
  story.split(/(\s+)/).forEach(tok => {
    if (/^\s+$/.test(tok)) { html += tok; pos += tok.length; return; }
    if (tok.includes('___')) { html += `<span class="blank" id="blank">&nbsp;?&nbsp;</span>${esc(tok.replace('___', ''))}`; spans.push({ start: pos, idx: -1 }); pos += 3 + tok.replace('___', '').length; return; }
    const i = spans.length; spans.push({ start: pos, idx: i }); html += `<span class="w" data-i="${i}">${esc(tok)}</span>`; pos += tok.length;
  });
  const area = ctx.area;
  area.innerHTML = `
    <div class="story" id="story">${html}</div>
    <div class="row-btns" style="margin-top:12px"><button class="btn small" id="read">🔊 Read it to me</button></div>
    <div class="question">❓ ${esc(q)} <button class="btn small ghost" id="hearQ">🔊</button></div>
    <div class="opts" id="opts">${opts.map(o => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
  const wordEls = $$('#story .w');
  function readAloud(textToSay = spoken, then) {
    wordEls.forEach(w => w.classList.remove('hl'));
    let got = false, timer = null;
    const hl = ci => { const s = [...spans].reverse().find(s => s.start <= ci); wordEls.forEach(w => w.classList.remove('hl')); if (s && s.idx >= 0) wordEls[s.idx].classList.add('hl'); };
    const u = say(textToSay, { rate: .82,
      onboundary: e => { if (e.name && e.name !== 'word') return; got = true; clearInterval(timer); hl(e.charIndex); },
      onend: () => { clearInterval(timer); wordEls.forEach(w => w.classList.remove('hl')); then && then(); } });
    // fallback if the voice doesn't send word boundaries
    let k = 0; setTimeout(() => { if (got || !u) return; timer = setInterval(() => { if (got || k >= wordEls.length) return clearInterval(timer); wordEls.forEach(w => w.classList.remove('hl')); wordEls[k++].classList.add('hl'); }, 380); }, 600);
  }
  $('#read').onclick = () => readAloud();
  $('#hearQ').onclick = () => say(q);
  $$('.opt').forEach(b => b.onclick = () => {
    if (Meadow.isBusy()) return;
    if (b.dataset.o === answer) {
      b.classList.add('right'); const bl = $('#blank'); if (bl) bl.textContent = answer;
      Meadow.correct(b, { sayFirst: item.type === 'rhyme' ? story.replace('___', answer) : answer });
    } else { b.classList.add('wrong'); Meadow.wrong(item.type === 'rhyme' ? `Does "<b>${esc(b.dataset.o)}</b>" rhyme? Say them together and listen!` : fmt("Not quite! Let's look back at the story.")); }
  });
  ctx.hints([
    () => { later(() => readAloud(spoken + ' ' + q), 1400); return "Let's read the story again together. Listen carefully!"; },
    () => esc(STORY_TIPS[item.type]),
    () => { const w = $$('.opt').find(x => x.dataset.o !== answer && !x.classList.contains('wrong')); if (w) w.classList.add('wrong');
      wordEls.forEach(el => { if (evWords.includes(el.textContent.toLowerCase().replace(/[^a-z']/g, ''))) el.classList.add('ev'); });
      return "I've highlighted a clue in the story and taken away one wrong answer!"; },
    () => { $$('.opt').forEach(x => x.dataset.o === answer ? x.classList.add('glow') : x.classList.add('wrong'));
      return `The answer is <b>${esc(answer)}</b>. See the clue in green? Tap the shiny answer!`; },
  ]);
  bubble(fmt(ctx.index === 0 ? "Snuggle up, {N}! Let's read a story together." : rand(["Here's another story!", "Ooh, I love this one!", "Story time! Ready?"])), false);
  later(() => readAloud(spoken + ' ... ' + q), 400);
}

/* Every line Bonnie can say in this world (for tools/make-voice.mjs). */
function lines() {
  const out = [], add = (...xs) => xs.forEach(x => out.push(fmt(x)));
  const hint = (tier, html) => add(text(`<b>${HINTS[tier]}</b> ${html}`));
  add(...Object.values(STORY_TIPS));
  add("Not quite! Let's look back at the story.");
  hint(0, "Let's read the story again together. Listen carefully!");
  hint(2, "I've highlighted a clue in the story and taken away one wrong answer!");
  Object.values(STORY_TIPS).forEach(t => hint(1, esc(t)));
  STORIES.forEach(L => L.items.forEach(item => {
    const story = fmt(item.story), answer = fmt(item.answer), q = fmt(item.q), spoken = story.replace('___', '...');
    add(spoken + ' ... ' + q, (item.type === 'rhyme' ? story.replace('___', answer) : answer) + '!');
    if (item.type === 'rhyme') item.wrong.map(fmt).forEach(o => add(text(`Does "<b>${esc(o)}</b>" rhyme? Say them together and listen!`)));
    hint(3, `The answer is <b>${esc(answer)}</b>. See the clue in green? Tap the shiny answer!`);
  }));
  return out;
}

const IDS = ["rhyme-time", "who", "where-and-what", "mixed-questions", "longer-stories"];
Meadow.registerWorld({
  id: 'y2-english-stories', subject: 'english', year: 2,
  name: "Bonnie's Story Nook", tag: "Stories, rhymes & questions", icon: '📖', color: '#8E7CC3', tint: '#ECE6F6',
  perLevel: 6, praise: PRAISE, hintNames: HINTS, css: CSS, play: playStory, lines,
  levels: STORIES.map((L, i) => ({ ...L, id: IDS[i], name: L.title })),
});
})();
