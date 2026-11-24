/* =========================================================
   WORLD: Bonnie's Story Nook (Meadow Words, Year 2)
   Short stories with rhyme, who, what, where and why questions (levels 1 to 5);
   inference, prediction, fact files and story detective, with evidence (levels 6 to 9).
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
    st('Tom and Bonnie saw a cat. The cat was sitting on a ___.', 'Which word rhymes with cat?', 'mat', ['rug', 'dog'], 'rhyme', 'cat'),
    st('A little frog sat on a ___. Then he jumped into the pond with a splash!', 'Which word rhymes with frog?', 'log', ['leaf', 'rock'], 'rhyme', 'frog'),
    st('Bonnie dug a hole to hide her bone. Now she is sitting all ___.', 'Which word rhymes with bone?', 'alone', ['happy', 'sad'], 'rhyme', 'bone'),
    st('Bonnie found a big red ball. She kicked it over the garden ___.', 'Which word rhymes with ball?', 'wall', ['gate', 'fence'], 'rhyme', 'ball'),
    st('The mouse ran into the ___. It hid under the bed.', 'Which word rhymes with mouse?', 'house', ['shed', 'box'], 'rhyme', 'mouse'),
    st('The sun was hot and Mia had fun. Mia ate a sticky iced ___.', 'Which word rhymes with sun and fun?', 'bun', ['cake', 'pie'], 'rhyme', 'fun')] },
  { title: 'Who?', items: [
    st('Bonnie ran to the pond. A frog jumped onto a lily pad. Bonnie barked hello!', 'Who ran to the pond?', 'Bonnie', ['the frog', 'Sarah'], 'who', 'Bonnie ran'),
    st('Oliver picked a red apple from the tree. Gran made a yummy pie with it.', 'Who made the pie?', 'Gran', ['Oliver', 'Bonnie'], 'who', 'Gran made'),
    st('The farmer fed the hens in the morning. The hens laid six brown eggs.', 'Who laid the eggs?', 'the hens', ['the farmer', 'the cows'], 'who', 'hens laid'),
    st('Mum and Lucy went to the shop. Mum bought some milk and Lucy chose a comic.', 'Who chose a comic?', 'Lucy', ['Mum', 'Bonnie'], 'who', 'Lucy chose'),
    st('A tiny mouse lived under the oak tree. An owl hooted at night, but the mouse stayed safe.', 'Who hooted at night?', 'the owl', ['the mouse', 'the cat'], 'who', 'owl hooted'),
    st('Bonnie and the duck played chase. The duck flapped up onto the fence and Bonnie wagged her tail.', 'Who flapped onto the fence?', 'the duck', ['Bonnie', 'Jack'], 'who', 'duck flapped')] },
  { title: 'Where & What?', items: [
    st('Bonnie hid her bone under the big oak tree. Then she ran home for tea.', 'Where did Bonnie hide her bone?', 'under the oak tree', ['in the pond', 'in her bed'], 'where', 'under the big oak tree'),
    st('Priya found a shiny shell on the beach. It was pink and white.', 'What did Priya find?', 'a shell', ['a crab', 'a bucket'], 'what', 'shiny shell'),
    st('The rabbit lived in a burrow by the river. Every day it nibbled green clover.', 'Where did the rabbit live?', 'in a burrow', ['in a tree', 'in a box'], 'where', 'in a burrow'),
    st('At the park, Ben flew a red kite. The wind made it go up high!', 'What colour was the kite?', 'red', ['blue', 'green'], 'what', 'red kite'),
    st('The ducks swam across the pond to the little island. They had a nap in the reeds.', 'Where did the ducks swim to?', 'the island', ['the farm', 'the shop'], 'where', 'little island'),
    st('Bonnie wore her best bow to the meadow party. Everyone ate cake and danced.', 'What did everyone eat?', 'cake', ['soup', 'carrots'], 'what', 'ate cake')] },
  { title: 'Mixed Questions', items: [
    st('One morning, a hedgehog went for a stroll. It snuffled about and fell into a ___!', 'Which word rhymes with stroll?', 'hole', ['pond', 'bush'], 'rhyme', 'stroll'),
    st('Ava and Bonnie walked to the farm. They saw a cow, a pig and a goat. The pig rolled in the mud.', 'Who rolled in the mud?', 'the pig', ['the cow', 'Bonnie'], 'who', 'pig rolled'),
    st('It was raining, so Leo put on red wellies. Splish, splash, into the puddles!', 'What did Leo put on?', 'red wellies', ['a sun hat', 'a coat'], 'what', 'red wellies'),
    st('The fox crept into the garden at night. It sniffed the bins and then ran off into the woods.', 'Where did the fox run to?', 'the woods', ['the river', 'the house'], 'where', 'into the woods'),
    st('A bird sat in a tree and sang a happy tune. It sang all morning and all ___.', 'Which word rhymes with tune?', 'afternoon', ['day', 'night'], 'rhyme', 'tune'),
    st('The little boat floated down the stream. A frog sat on top, eating ice ___.', 'Which word rhymes with stream?', 'cream', ['lolly', 'cake'], 'rhyme', 'stream')] },
  { title: 'Longer Stories', items: [
    st('Bonnie was very muddy after playing in the meadow. Sarah filled a tub with warm, bubbly water. Bonnie jumped in and splashed everyone!', 'Why did Sarah fill a tub?', 'Bonnie was muddy', ['it was hot', 'to grow flowers'], 'why', 'very muddy'),
    st('The wind blew hard and the leaves fell off the trees. They were red, orange and yellow. Tom jumped into the biggest pile.', 'What fell off the trees?', 'leaves', ['apples', 'birds'], 'what', 'leaves fell'),
    st('The squirrel collected nuts all autumn. She hid them in a hole in the old tree. In winter, she had plenty to eat.', 'Where did the squirrel hide the nuts?', 'in a hole in the tree', ['under a rock', 'in the river'], 'where', 'in a hole in the old tree'),
    st('Gran planted seeds in the vegetable patch. Mia watered them every day. Soon, big orange carrots were ready to pull up!', 'Who watered the seeds?', 'Mia', ['Gran', 'Bonnie'], 'who', 'Mia watered'),
    st('Bonnie heard a noise in the hedge. She poked her nose in and found a tiny lost kitten. She barked until its owner came.', 'What did Bonnie find?', 'a kitten', ['a ball', 'a bone'], 'what', 'tiny lost kitten'),
    st('On a frosty morning, Oliver saw a robin in the garden. Its chest was bright red. Oliver put out some seeds for it.', 'What colour was the robin\'s chest?', 'red', ['blue', 'yellow'], 'what', 'bright red')] },
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
.story .w.ev{background:#CFE8BE;box-shadow:0 0 0 2px var(--leaf);font-weight:700;text-decoration:underline 3px var(--leaf-dark);text-underline-offset:4px} /* bold and underlined too, so the clue isn't shown by colour alone */
.story .blank{display:inline-block;min-width:90px;border-bottom:4px dashed var(--accent);text-align:center;color:var(--leaf-dark);font-weight:700}
.question{font-family:var(--font-read);font-size:1.45rem;font-weight:700;margin:18px 0 10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
.opt{font-family:var(--font-read);font-size:1.4rem;font-weight:700;padding:16px;border-radius:40px;background:linear-gradient(180deg,#FFF,#F3EADA);border:3px solid var(--card-edge);border-bottom-width:7px;transition:transform .12s}
.opt.wrong{animation:shake .45s;opacity:.35;pointer-events:none}
.opt.right{background:linear-gradient(180deg,#D8F0C6,#A9D58C);border-color:var(--leaf-dark)}
.opt.glow{box-shadow:0 0 0 6px rgba(242,193,78,.8)}
@media (hover:hover){ .opt:hover{transform:translateY(-2px)} }
@media (max-width:560px){
  /* phones: the story and its answers, with less space around them */
  .story{font-size:1.2rem;line-height:1.55;padding:14px 16px}
  .story::before{top:-14px;left:-6px;font-size:1.6rem}
  .question{font-size:1.25rem;margin:14px 0 8px}
  .opts{gap:8px}
  .opt{font-size:1.25rem;padding:10px 14px}
}
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
    if (tok.includes('___')) { html += `<span class="blank" id="blank"><span aria-hidden="true">&nbsp;?&nbsp;</span><span class="sr">blank</span></span>${esc(tok.replace('___', ''))}`; spans.push({ start: pos, idx: -1 }); pos += 3 + tok.replace('___', '').length; return; }
    const i = spans.length; spans.push({ start: pos, idx: i }); html += `<span class="w" data-i="${i}">${esc(tok)}</span>`; pos += tok.length;
  });
  const area = ctx.area;
  area.innerHTML = `
    <div class="story" id="story">${html}</div>
    <div class="row-btns" style="margin-top:12px"><button class="btn small" id="read">🔊 Read it to me</button></div>
    <div class="question">❓ ${esc(q)} <button class="btn small ghost" id="hearQ" aria-label="Hear the question">🔊</button></div>
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
      return `The answer is <b>${esc(answer)}</b>. See the clue word? Tap the shiny answer!`; },
  ]);
  bubble(fmt(ctx.index === 0 ? "Snuggle up, {N}! Let's read a story together." : rand(["Here's another story!", "Ooh, I love this one!", "Story time! Ready?"])), false);
  later(() => readAloud(spoken + ' ... ' + q), 400);
}

/* =========================================================
   STORY NOOK, LEVELS 6 TO 9 (24 November 2026)
   Reading between the lines, prediction, fact files and story detective. These go after the first
   five levels, with new ids, so stars saved against the first five stay exactly as they are.
   Two-part questions: answer first, then tap the sentence that shows it (the evidence). Sequencing:
   put what happened in order. Fact files: real, checked facts, with a heading-matching question.
   Every line Bonnie says here is fixed text (listed in lines()), so it can all be recorded.
   ========================================================= */
/* An evidence question. text: the sentences (a poem's lines with poem: true). ev: the sentences that
   show the answer (any of them is right). why: Bonnie's reasoning, said and shown when it is solved. */
const evq = (skill, text, q, answer, wrong, ev, why, more = {}) => ({ kind: 'ev', skill, text, q, answer, wrong, ev, why, ...more });
/* Put events in order. events: in the order they happened (said differently from the story's own words). */
const ordq = (skill, text, events, why, more = {}) => ({ kind: 'order', skill, text, events, why, ...more });
/* A fact file: a title and parts, each with a heading and its sentences. */
const ff = (title, parts) => ({ title, parts: parts.map(([h, ...s]) => ({ h, s })) });
const factq = (file, q, answer, wrong, ev, why, skill = 'fact') => ({ kind: 'ev', skill, file, q, answer, wrong, ev, why });
const matchq = (file, extra = []) => ({ kind: 'match', skill: 'heading', file, extra, why: `Each heading tells us what its part is about: ${file.parts.map(p => p.h).join(', ')}.` });

const HEDGEHOGS = ff('Hedgehogs', [
  ['What they look like', 'Hedgehogs are small wild animals with sharp spines on their backs.'],
  ['Staying safe', 'When a hedgehog is scared, it rolls up into a tight, spiky ball.'],
  ['Food', 'Hedgehogs are nocturnal.', 'They sleep in the day and look for food at night.', 'They eat beetles, worms and slugs.']]);
const BEES = ff('Honeybees', [
  ['Where they live', 'Honeybees live together in a big group.', 'Their home is often a hive, and one hive can be home to thousands of bees.'],
  ['Busy workers', 'Bees visit flowers to collect a sweet juice called nectar.', 'They use the nectar to make honey.'],
  ['Helping plants', 'As bees fly from flower to flower, they carry pollen.', 'This helps the plants to make seeds and fruit.']]);
const FROGS = ff('From Frogspawn to Frog', [
  ['Eggs', 'In spring, a mother frog lays lots of eggs in a pond.', 'The eggs are called frogspawn.'],
  ['Tadpoles', 'Tiny tadpoles hatch out of the eggs.', 'They have long tails for swimming.'],
  ['Frogs', 'Slowly, the tadpoles grow legs and lose their tails.', 'Soon they are little frogs that can hop out of the pond.']]);
const TEETH = ff('Looking After Your Teeth', [
  ['Brushing', 'Brush your teeth twice a day, in the morning and before bed.', 'Brush for about two minutes each time.'],
  ['Food and drink', 'Sugary food and drinks can harm your teeth.', 'Water and milk are good drinks for teeth.'],
  ['The dentist', 'A dentist checks that your teeth are healthy.']]);
const PENGUINS = ff('Emperor Penguins', [
  ['Where they live', 'Emperor penguins live in Antarctica, one of the coldest places on Earth.'],
  ['Their bodies', 'Emperor penguins are birds, but they cannot fly.', 'Their wings work like flippers to help them swim.'],
  ['Keeping warm', 'Thick feathers and a layer of fat keep them warm.', 'In storms, they huddle together in a big group.']]);
const ROCK_POOLS = ff('Rock Pools', [
  ['What is a rock pool?', 'A rock pool is sea water left between the rocks when the tide goes out.'],
  ['Who lives there?', 'Crabs, shrimps and starfish can live in rock pools.'],
  ['Staying safe', 'Always go rock-pooling with a grown-up, and put animals back gently.']]);
const SUNFLOWERS = ff('Sunflowers', [
  ['Seeds', 'A sunflower starts as a small stripy seed.'],
  ['Growing tall', 'With sunshine and water, it can grow taller than a grown-up.'],
  ['Food for birds', 'In autumn, birds peck the seeds from the big flower head.']]);

const NOOK = [
  { id: 'reading-between-the-lines', title: 'Reading Between the Lines', items: [
    evq('feel', ['It was a quiet evening at home.', 'Then thunder rumbled across the sky.', 'Bonnie dived under the kitchen table and hid her face in her paws.', 'Sarah sat down on the floor and stroked her gently.'],
      'How did Bonnie feel when the thunder rumbled?', 'frightened', ['sleepy', 'excited'], [2],
      'Bonnie dived under the table and hid her face when the thunder rumbled. That suggests she was frightened.', { evQ: 'Which sentence shows how Bonnie felt?' }),
    evq('feel', ['Leo opened his birthday present.', 'Inside was a shiny red bike.', '“Wow!” shouted Leo, jumping up and down.', '“Can I ride it now?”'],
      'How did Leo feel about his present?', 'very happy', ['upset', 'bored'], [2, 3],
      'Leo shouted “Wow!”, jumped up and down and wanted to ride it straight away. That shows he was very happy with his bike.', { evQ: 'Which sentence shows how Leo felt?' }),
    evq('feel', ['Ben looked out of the window and sighed.', 'Rain was pouring down on the garden.', 'His football sat by the door, still in its bag.', '“We can\'t play in the park today,” said Dad.'],
      'How did Ben feel?', 'disappointed', ['proud', 'scared'], [0],
      'Ben sighed as he looked at the rain. People often sigh when they are disappointed, and he could not play football in the park.', { evQ: 'Which sentence shows how Ben felt?' }),
    evq('feel', ['Oliver\'s grandad was coming to stay for the weekend.', 'He was due to arrive at four o\'clock.', 'All afternoon, Oliver kept running to the window to look for his car.', 'When the doorbell rang, Oliver raced to open it.'],
      'How did Oliver feel about Grandad\'s visit?', 'excited', ['worried', 'cross'], [2, 3],
      'Oliver kept running to the window and raced to open the door. That shows he was excited to see Grandad.', { evQ: 'Which sentence shows how Oliver felt?' }),
    evq('cause', ['Mia\'s tooth had been wobbly for a week.', 'At lunch, she bit into a crunchy apple.', 'Mia gasped and held out her hand.', 'There, in her palm, was a tiny white tooth!'],
      'What had happened to Mia?', 'Her wobbly tooth came out', ['She dropped her apple', 'She hurt her hand'], [3],
      'There was a tiny white tooth in Mia\'s hand, and her tooth had been wobbly. So her wobbly tooth had come out!', { evQ: 'Which sentence shows you?' }),
    evq('cause', ['Priya carried the big birthday cake very slowly.', 'She looked down at her feet with every step.', 'She held the plate tightly with both hands.', 'At last, she put it on the table and smiled.'],
      'Why did Priya walk so slowly?', 'She did not want to drop the cake', ['She was very tired', 'She was lost'], [1, 2],
      'Priya watched every step and held the plate tightly with both hands. She was being careful not to drop the cake.', { evQ: 'Which sentence shows you?' }),
    evq('cause', ['The squirrel sat on the fence, nibbling a nut.', 'A big dog came bounding across the grass, barking loudly.', 'The squirrel dropped its nut and shot up the tree.', 'It stayed on the highest branch for a long time.'],
      'Why did the squirrel run up the tree?', 'It was scared of the dog', ['It wanted more nuts', 'It was playing a game'], [1, 2],
      'The squirrel dropped its nut and shot up the tree when a barking dog came bounding over. It was scared of the dog.', { evQ: 'Which sentence shows you?' }),
    evq('cause', ['The little seed sat in the ground.', 'It did not move. It made no sound.', 'Then rain came down and the sun came out,', 'and soon a green shoot began to sprout!'],
      'What helped the seed to grow?', 'the rain and the sun', ['the wind and the snow', 'a hungry bird'], [2],
      'The poem says rain came down and the sun came out, and then the shoot began to sprout. Seeds need water and warmth to grow.', { poem: true, evQ: 'Which line of the poem tells you?' }),
  ] },
  { id: 'what-happens-next', title: 'What Happens Next?', items: [
    evq('predict', ['Jack built a tall tower of blocks on the floor.', 'It was even taller than his teddy bear.', 'His baby sister crawled over and reached up to grab the top block.', 'Jack shouted, “Wait!”'],
      'What is the best guess for what happens next?', 'The tower falls down', ['The baby falls asleep', 'Jack goes outside to play'], [2],
      'Jack\'s baby sister reached up to grab the top block of a very tall tower. So the best guess is that the tower falls down.'),
    evq('predict', ['Mia and Gran were having a picnic in the park.', 'They ate sandwiches and strawberries.', 'Then big grey clouds rolled across the sky, and Mia felt a cold drop on her nose.', 'Gran reached for her umbrella.'],
      'What is the best guess for what happens next?', 'It rains and Gran opens her umbrella', ['The sun comes out and it gets very hot', 'Mia goes for a swim in the pond'], [2, 3],
      'Grey clouds came, Mia felt a drop and Gran reached for her umbrella. So the best guess is that it rains.'),
    evq('predict', ['Tom and Dad were having lunch on the beach.', 'Tom put his sandwich down on the towel and ran to the sea.', 'A hungry seagull landed right next to the sandwich.', 'It looked at the sandwich, then at Tom, far away in the water.'],
      'What is the best guess for what happens next?', 'The seagull grabs the sandwich', ['Dad eats the sandwich', 'The seagull flies away scared'], [2, 3],
      'A hungry seagull landed next to the sandwich while Tom was far away in the sea. So the best guess is that the seagull grabs it!'),
    evq('predict', ['“Don\'t forget your lunchbox!” called Mum.', 'But Ava was in a hurry and ran out of the door.', 'Her lunchbox stayed on the kitchen table.', 'At lunchtime, Ava opened her school bag.'],
      'What is the best guess for what happens next?', 'Ava finds her lunchbox is not there', ['Ava finds her lunchbox in her bag', 'Ava goes to the shop'], [1, 2],
      'Ava ran out in a hurry and her lunchbox stayed on the kitchen table. So when she opens her bag, the best guess is that her lunchbox will not be there.'),
    evq('predict', ['The hen sat on her nest for many days.', 'One morning, she heard a tiny tap, tap, tap.', 'A small crack appeared in one of her eggs.', 'The hen moved to one side and watched.'],
      'What is the best guess for what happens next?', 'A chick hatches out of the egg', ['The hen lays a new egg', 'The egg rolls into the pond'], [1, 2],
      'There was a tapping sound and then a crack in the egg. So the best guess is that a chick is about to hatch!'),
    evq('predict', ['It was a hot, sunny day at the park.', 'Priya bought a strawberry ice lolly.', 'She was so busy talking to her friend that she forgot to eat it.', 'The lolly got softer and softer, and began to slide off its stick.'],
      'What is the best guess for what happens next?', 'The lolly falls off the stick', ['The lolly freezes again', 'Priya buys a sun hat'], [2, 3],
      'The lolly was getting softer and sliding off its stick, and Priya was not watching it. So the best guess is that it falls off!'),
    evq('predict', ['It was a sunny Saturday morning.', 'Bonnie was snoozing in her basket.', 'Then Sarah picked up Bonnie\'s lead and put on her wellies.', 'Bonnie jumped up and ran to the front door, wagging her tail.'],
      'What is the best guess for what happens next?', 'Sarah takes Bonnie for a walk', ['Sarah has a bath', 'Bonnie goes back to sleep'], [2, 3],
      'Sarah picked up the lead and put on her wellies, and Bonnie ran to the door. So the best guess is that they go for a walk.'),
    evq('predict', ['Ben and his dad climbed to the top of the hill.', 'Ben\'s red kite flew high in the sky.', 'Suddenly, a strong gust of wind tugged the string right out of Ben\'s hand.', '“Oh no!” cried Ben.'],
      'What is the best guess for what happens next?', 'The kite blows away', ['The kite lands in Ben\'s hands', 'Ben flies the kite even higher'], [2, 3],
      'The wind tugged the string out of Ben\'s hand, and he cried “Oh no!”. With nobody holding it, the best guess is that the kite blows away.'),
  ] },
  { id: 'fact-files', title: "Bonnie's Fact Files", items: [
    factq(HEDGEHOGS, 'What does a hedgehog do when it is scared?', 'It rolls up into a ball', ['It climbs a tree', 'It hides in a pond'], [1],
      'The fact file says that when a hedgehog is scared, it rolls up into a tight, spiky ball.'),
    factq(HEDGEHOGS, 'What does nocturnal mean?', 'awake and busy at night', ['covered in spines', 'very small'], [3],
      'The next sentence explains it: hedgehogs sleep in the day and look for food at night. So nocturnal means awake and busy at night.', 'vocab'),
    factq(BEES, 'What do bees use to make honey?', 'nectar', ['pollen', 'leaves'], [3],
      'The fact file says bees use the nectar to make honey. Pollen is in the fact file too, but it helps plants make seeds.'),
    factq(BEES, 'Which of these does the fact file tell us?', 'Bees help plants to make seeds', ['Bees live on their own', 'Bees make honey from pollen'], [5],
      'The fact file says carrying pollen helps the plants to make seeds and fruit. It also says bees live together in a big group, and make honey from nectar.'),
    factq(FROGS, 'What hatches out of frogspawn?', 'tadpoles', ['frogs', 'fish'], [2],
      'The fact file says tiny tadpoles hatch out of the eggs. The frogs come later, when the tadpoles grow legs.'),
    factq(FROGS, 'What is frogspawn?', 'frog eggs', ['baby frogs with legs', 'pond weed'], [1],
      'The fact file says the eggs are called frogspawn. So frogspawn is frog eggs.', 'vocab'),
    ordq('order', FROGS, ['A frog lays eggs in a pond.', 'Tadpoles hatch out.', 'The tadpoles grow legs.', 'Little frogs hop out of the pond.'],
      'First a frog lays eggs, then tadpoles hatch, next they grow legs, and last they are little frogs that hop out of the pond.', { q: 'Put these in the order they happen.' }),
    factq(TEETH, 'How long should you brush your teeth for?', 'about two minutes', ['about two hours', 'about two seconds'], [1],
      'The fact file says to brush for about two minutes each time.'),
    factq(TEETH, 'Which of these does the fact file tell us?', 'Water is a good drink for teeth', ['You only need to brush once a week', 'Sugary drinks are good for teeth'], [3],
      'The fact file says water and milk are good drinks for teeth. It says to brush twice a day, and that sugary drinks can harm teeth.'),
    factq(PENGUINS, 'Which of these does the fact file tell us?', 'Emperor penguins cannot fly', ['Emperor penguins live in hot places', 'Emperor penguins use their wings to fly'], [1],
      'The fact file says emperor penguins are birds, but they cannot fly. Their wings help them swim instead.'),
    factq(PENGUINS, 'What does huddle mean?', 'stand close together', ['swim very fast', 'fly away'], [4],
      'The sentence says they huddle together in a big group in storms. So huddle means stand close together, to keep warm.', 'vocab'),
    matchq(TEETH), matchq(ROCK_POOLS), matchq(SUNFLOWERS, ['Animals at the beach']),
  ] },
  { id: 'story-detective', title: 'Story Detective', items: [
    ordq('order', ['Ava wanted to make a birthday card for Gran.', 'First, she folded a piece of paper in half.', 'Next, she drew a big yellow flower on the front.', 'Then she wrote “Happy Birthday” inside.', 'Finally, she put the card in an envelope.'],
      ['Ava folded the paper.', 'Ava drew a flower.', 'Ava wrote inside the card.', 'Ava put the card in an envelope.'],
      'First Ava folded the paper, next she drew a flower, then she wrote inside, and finally she put the card in an envelope.'),
    ordq('order', ['Leo left the garden gate open.', 'Bonnie spotted a rabbit and ran out into the lane.', 'Leo and Dad searched everywhere for her.', 'At last they found Bonnie in a field, sniffing a rabbit hole.'],
      ['The gate was left open.', 'Bonnie ran out after a rabbit.', 'Leo and Dad looked for Bonnie.', 'They found Bonnie in the field.'],
      'The gate was left open, so Bonnie could run out after a rabbit. Then Leo and Dad looked for her, and at last they found her in the field.'),
    ordq('order', ['Mia\'s class went on a trip to the farm.', 'Farmer Jones showed them the cows in the barn.', 'After that, they fed the lambs with bottles of milk.', 'Before they went home, everyone had a picnic by the duck pond.'],
      ['The children saw the cows.', 'The children fed the lambs.', 'The children had a picnic.'],
      'First the children saw the cows, after that they fed the lambs, and then they had a picnic before they went home.'),
    evq('cause', ['The children built a big snowman in the garden.', 'Then the sun came out and shone all afternoon.', 'By teatime, the snowman was just a small pile of slush.'],
      'Why did the snowman get smaller?', 'The sun melted it', ['The children knocked it over', 'A dog ate it'], [1],
      'The sun shone all afternoon, and the sun melts snow. That is why the snowman turned into a small pile of slush.', { evQ: 'Which sentence tells you why?' }),
    evq('cause', ['Tom\'s tummy rumbled loudly in class.', 'He had been in such a rush that morning that he had not eaten any breakfast.', 'At break time, his teacher gave him an apple.'],
      'Why was Tom\'s tummy rumbling?', 'He had not eaten breakfast', ['He had eaten too much', 'He was feeling cold'], [1],
      'Tom was in a rush and did not eat any breakfast, so he was hungry. That is why his tummy rumbled.', { evQ: 'Which sentence tells you why?' }),
    evq('cause', ['Gran\'s plants were drooping.', 'It had not rained for weeks.', 'Priya filled the watering can and gave each plant a long drink.', 'By the next morning, the plants were standing up tall again.'],
      'Why did the plants stand up tall again?', 'Priya gave them water', ['It snowed in the night', 'Gran bought new plants'], [2],
      'Priya gave each plant a long drink of water. By the next morning, they were standing up tall again.', { evQ: 'Which sentence tells you why?' }),
    evq('vocab', ['Gran\'s plants were drooping.', 'It had not rained for weeks.', 'Priya filled the watering can and gave each plant a long drink.', 'By the next morning, the plants were standing up tall again.'],
      'What does drooping mean?', 'flopping down', ['growing flowers', 'standing up tall'], [1, 3],
      'The plants had no rain for weeks, and after a drink they were standing up tall again. So before that, drooping means they were flopping down.', { evQ: 'Which sentence helps you work it out?' }),
    evq('vocab', ['Lucy splashed through the puddles all the way home.', 'When she took off her boots, her socks were soggy.', 'Mum hung them by the fire to dry.', 'Then they all had hot soup for tea.'],
      'What does soggy mean?', 'very wet', ['very warm', 'very small'], [0, 2],
      'Lucy splashed through puddles, and her socks had to be hung up to dry. So soggy means very wet.', { evQ: 'Which sentence helps you work it out?' }),
    evq('cause', ['Ben and Dad were racing through the woods.', '“Ow!” cried Ben, holding his knee.', 'He had tripped over a tree root.', 'Dad cleaned the cut and put on a plaster.'],
      'Why did Dad put on a plaster?', 'Ben had cut his knee', ['Ben had a cold', 'Ben had a sore tooth'], [1, 2],
      'Ben tripped over a tree root and held his knee, and Dad cleaned the cut. So the plaster was for the cut on Ben\'s knee.', { evQ: 'Which sentence tells you why?' }),
  ] },
];
const NOOK_TIPS = {
  feel: 'Look at what the character does and says. Actions are clues to how someone feels!',
  predict: 'Think about what has happened so far. Which clue tells you what might happen next?',
  cause: "A 'why' question asks for a reason. Look for what happened that made it happen.",
  vocab: 'Read the sentences around the word. They give you clues to what it means.',
  fact: 'Find the part of the fact file that is about the question, then read it carefully.',
  order: 'Find each one in the story. Which happened first? Which happened last?',
  heading: 'A heading tells you what a part is about. Read each part, then choose the heading that fits.',
};
const NOOK_SAY = {
  wrong: 'Hmm, does the story give a clue for that? Let\'s look back.',
  wrongFact: 'Hmm, does the fact file say that? Let\'s look back.',
  wrongPredict: 'That could happen, but is there a clue for it in the story? Look again.',
  wrongEv: 'Good try! Does that sentence really show it? Try another one.',
  wrongOrder: 'Some are in the wrong place. Find each one in the story and check what came first.',
  wrongMatch: 'Not quite! One heading does not fit its part yet. Read that part again.',
  fill: 'Fill every space first!',
  evNow: 'Yes! Now be a detective. {Q} Tap it.',
  reread: 'Let\'s read it again together. Listen carefully!',
  narrow: 'I\'ve underlined the part with the clue, and taken away one answer that doesn\'t fit.',
  narrowEv: 'I\'ve made the other sentences paler. The clue is in one of the bright ones!',
  showEv: 'The clue is in the glowing sentence. Tap it!',
  placed: 'I\'ve put one in the right place for you. Can you do the rest?',
  allPlaced: 'Here it is all done. Read it, then tap Check!',
  model: 'Here\'s how I worked it out. {W} Tap the shiny answer!',
};
const evQOf = item => item.evQ || (item.file ? 'Which sentence in the fact file tells you?' : 'Which sentence gives you a clue?');
const NOOK_CSS = `
/* ---------- Story Nook, levels 6 to 9 ---------- */
.story.nk-poem .nk-s{display:block}
.story.nk-facts{background:#FBFDF7}
.story.nk-facts::before{content:"🔎"}
.nk-title{font-family:var(--font-ui);font-weight:700;font-size:1.15em;margin:0 0 4px}
.nk-h{display:block;font-family:var(--font-ui);font-weight:700;font-size:.8em;color:var(--leaf-dark);margin:10px 0 0;letter-spacing:.01em}
.nk-s{border-radius:8px;transition:background .15s,opacity .15s}
.nk-pick .nk-s{cursor:pointer;background:#FFF4D6;box-shadow:0 0 0 2px #F2D58A;margin:0 1px}
.nk-pick .nk-s:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.nk-s.ev{background:#CFE8BE;box-shadow:0 0 0 2px var(--leaf);font-weight:700;text-decoration:underline 3px var(--leaf-dark);text-underline-offset:4px}
.nk-s.clue{text-decoration:underline dotted 3px var(--accent);text-underline-offset:5px}
.nk-s.pale{opacity:.4}
.nk-s.glow{box-shadow:0 0 0 5px rgba(242,193,78,.85)}
.nk-s.nope{animation:shake .45s;text-decoration:line-through 2px}
.nk .opt.wrong{text-decoration:line-through 3px}
.nk .opt.right::before{content:"✓ "}
.nk .question>span{flex:1 1 0;min-width:0} /* the question wraps beside its icon and its 🔊 button */
.nk-evtip{margin:-4px 0 10px;padding:6px 10px;border-radius:12px;background:#FFF4D6;border:2px solid #F2D58A;font-family:var(--font-ui);font-weight:700;font-size:.8em;line-height:1.3}
.story{scroll-margin-top:24px}
.nk-why{margin-top:14px;padding:12px 16px;border-radius:16px;background:#EAF5E1;border:2px solid var(--leaf);font-family:var(--font-read);font-size:1.15rem;line-height:1.45}
.nk-why::before{content:"💡 "}
.nk-seq{list-style:none;margin:6px 0 0;padding:0;display:grid;gap:8px}
.nk-place{display:flex;align-items:center;gap:10px;width:100%;min-height:56px;padding:8px 12px;border-radius:16px;border:3px dashed #CDBB9C;background:#F7F0E2;font-family:var(--font-read);font-size:1.2rem;font-weight:700;text-align:left;color:inherit}
.nk-place.filled{border-style:solid;border-color:var(--card-edge);background:#fff}
.nk-place.active{border-color:var(--gold);background:#FFF6DA}
.nk-place.locked{border-color:var(--leaf);background:#E8F3DF}
.nk-place.locked .nk-num::after{content:" ✓"}
.nk-place.bad{animation:shake .45s;border-color:var(--berry);background:#FBE3E6}
.nk-place.bad .nk-num::after{content:" ✗"}
.nk-place.glow,.nk-card.glow,.nk-hslot.glow{box-shadow:0 0 0 5px rgba(242,193,78,.8)}
.nk-num{flex:none;min-width:44px;height:36px;padding:0 6px;border-radius:12px;background:var(--gold);display:grid;place-items:center;font-family:var(--font-ui);font-size:1rem;color:var(--ink)}
.nk-gap{color:var(--ink-soft);font-weight:600}
.nk-bank{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:12px;border-radius:20px;background:#EFE5D0;min-height:64px;margin-top:12px}
.nk-card{min-height:52px;padding:8px 14px;border-radius:16px;background:linear-gradient(180deg,#FFF,#F3EADA);border:3px solid var(--card-edge);border-bottom-width:6px;font-family:var(--font-read);font-size:1.15rem;font-weight:700;color:inherit;touch-action:none}
.nk-card.dragging{opacity:.3}
.nk-hslot{display:flex;align-items:center;min-height:44px;margin:10px 0 2px;padding:4px 12px;border-radius:12px;border:3px dashed #CDBB9C;background:#F7F0E2;font-family:var(--font-ui);font-weight:700;font-size:.8em;color:var(--leaf-dark);text-align:left}
.nk-hslot.filled{border-style:solid;border-color:var(--card-edge);background:#fff}
.nk-hslot.active{border-color:var(--gold);background:#FFF6DA}
.nk-hslot.locked{border-color:var(--leaf);background:#E8F3DF}
.nk-hslot.locked::after{content:" ✓"}
.nk-hslot.bad{animation:shake .45s;border-color:var(--berry);background:#FBE3E6}
.nk-hslot.bad::after{content:" ✗"}
.nk-hslot .nk-gap{font-weight:600}
@media (max-width:560px){
  .nk-why{font-size:1.05rem;padding:10px 12px}
  .nk-seq{gap:6px}
  .nk-place{font-size:1.05rem;min-height:48px;padding:4px 10px}
  .nk-num{height:32px}
  .nk-card{font-size:1.05rem;padding:6px 12px}
  .nk-bank{padding:8px;gap:8px}
}
@media (prefers-reduced-motion:reduce){.nk-s.nope,.nk-place.bad,.nk-hslot.bad,.nk .opt.wrong{animation:none}}
`;

/* The passage: a story, a poem or a fact file. Each sentence is a span (data-s) of word spans (data-i),
   so it can be read aloud with the words lit up, and tapped as evidence. headSlots: the fact file's
   headings are spaces to fill (the heading question). */
function passage(item, headSlots) {
  const file = item.file || (item.text && item.text.parts ? item.text : null);
  const blocks = file ? [{ t: 'title', x: file.title }, ...file.parts.flatMap((p, pi) => [{ t: 'h', x: p.h, pi }, ...p.s.map(x => ({ t: 's', x }))])]
    : item.text.map(x => ({ t: 's', x }));
  let html = '', spoken = '', si = 0, wi = 0; const spans = [], sentences = [];
  // word spans, with where each word starts in the spoken text (for lighting words up as Bonnie reads)
  const words = x => { let at = 0; return x.split(/(\s+)/).map(tok => { const start = spoken.length + at; at += tok.length;
    if (/^\s+$/.test(tok)) return tok; spans.push({ start, idx: wi }); return `<span class="w" data-i="${wi++}">${esc(tok)}</span>`; }).join(''); };
  blocks.forEach(b => {
    if (b.t === 'h' && headSlots) { html += `<button class="nk-hslot" data-p="${b.pi}"><span class="nk-gap">Which heading?</span></button>`; return; }
    const inner = words(b.x);
    if (b.t === 'title') html += `<div class="nk-title">${inner}</div>`;
    else if (b.t === 'h') html += `<div class="nk-h">${inner}</div>`;
    else { html += `<span class="nk-s" data-s="${si}">${inner}</span> `; sentences.push(b.x); si++; }
    // headings and the title are read as sentences of their own
    spoken += b.x + (b.t === 's' || /[.!?]$/.test(b.x) ? ' ' : '. ');
  });
  return { html: `<div class="story ${file ? 'nk-facts' : ''} ${item.poem ? 'nk-poem' : ''}" id="story">${html}</div>`, spoken: spoken.trim(), spans, sentences, file };
}
/* What Bonnie reads: the passage, then the question. */
const readLine = (spoken, q) => spoken + ' ... ' + q;

function playNook(item, ctx) {
  const area = ctx.area, kind = item.kind;
  const P = passage(item, kind === 'match');
  const q = kind === 'ev' ? item.q : kind === 'match' ? 'Which heading goes with each part?' : (item.q || 'Put these in the order they happened.');
  area.innerHTML = `<div class="nk">${P.html}
    <div class="row-btns" style="margin-top:12px"><button class="btn small" id="read">🔊 Read it to me</button></div>
    <div class="question" id="qLine">❓ <span id="qText">${esc(q)}</span> <button class="btn small ghost" id="hearQ" aria-label="Hear the question">🔊</button></div>
    <div id="work"></div><div id="whyBox"></div></div>`;
  const wordEls = $$('#story .w'), sentEls = $$('#story .nk-s');
  let curQ = q, timer = null;
  function readAloud(textToSay) {
    wordEls.forEach(w => w.classList.remove('hl')); clearInterval(timer);
    let got = false;
    const hl = ci => { const s = [...P.spans].reverse().find(s => s.start <= ci); wordEls.forEach(w => w.classList.remove('hl')); if (s && ci < P.spoken.length) wordEls[s.idx].classList.add('hl'); };
    const u = say(textToSay, { rate: .82,
      onboundary: e => { if (e.name && e.name !== 'word') return; got = true; clearInterval(timer); hl(e.charIndex); },
      onend: () => { clearInterval(timer); wordEls.forEach(w => w.classList.remove('hl')); } });
    // when the voice sends no word boundaries (recorded clips), a steady glow along the words instead
    let k = 0; setTimeout(() => { if (got || !u || !$('#story')) return; timer = setInterval(() => { if (got || k >= wordEls.length || !wordEls[k].isConnected) return clearInterval(timer); wordEls.forEach(w => w.classList.remove('hl')); wordEls[k++].classList.add('hl'); }, 380); }, 600);
  }
  const read = () => readAloud(readLine(P.spoken, curQ));
  $('#read').onclick = () => readAloud(P.spoken);
  $('#hearQ').onclick = () => say(curQ);
  const tier = () => (Meadow.round() || {}).tier || 0;
  const showWhy = () => { $('#whyBox').innerHTML = `<div class="nk-why" role="status">${esc(item.why)}</div>`; };
  const solved = el => { showWhy(); Meadow.correct(el, { sayFirst: item.why.replace(/[.!?]$/, ''), hold: 3500 }); };
  const tip = () => esc(NOOK_TIPS[item.skill]);
  let hints;

  if (kind === 'ev') {
    let part = 1;
    const answer = item.answer, opts = shuffle([answer, ...item.wrong]);
    $('#work').innerHTML = `<div class="opts" id="opts">${opts.map(o => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
    const clue = () => sentEls.forEach((el, i) => item.ev.includes(i) && el.classList.add('clue'));
    const startEvidence = () => {
      part = 2; curQ = evQOf(item);
      $('#qText').textContent = curQ;
      $('#qLine').firstChild.textContent = '🔎 ';
      $('#story').classList.add('nk-pick');
      sentEls.forEach((el, i) => { el.setAttribute('role', 'button'); el.tabIndex = 0; el.setAttribute('aria-label', `Sentence ${i + 1}: ${P.sentences[i]}`);
        el.onclick = () => pickSentence(el, i); el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); } }; });
      // Bonnie's help carries on into the second part: what she already did for the answer, she does for the evidence
      if (tier() >= 3) narrowEv(); if (tier() >= 4) showEv();
      // the question again at the top of the story, where the sentences are tapped (on a phone the story is above the question)
      $('#story').insertAdjacentHTML('afterbegin', `<div class="nk-evtip" aria-hidden="true">🔎 ${esc(curQ)} Tap it.</div>`);
      bubble(esc(NOOK_SAY.evNow.replace('{Q}', curQ)));
      if (sentEls[0]) sentEls[0].focus({ preventScroll: true });
      const top = $('#story').getBoundingClientRect().top;
      if (top < 0) $('#story').scrollIntoView({ block: 'start', behavior: Meadow.ui.reduceMotion() ? 'auto' : 'smooth' });
    };
    const pickSentence = (el, i) => {
      if (Meadow.isBusy() || part !== 2) return;
      if (item.ev.includes(i)) { sentEls.forEach(s => s.classList.remove('glow', 'pale')); el.classList.add('ev'); $('#story').classList.remove('nk-pick'); const t = $('.nk-evtip'); if (t) t.remove(); solved(el); }
      else { el.classList.remove('nope'); void el.offsetWidth; el.classList.add('nope'); setTimeout(() => el.classList.remove('nope'), 700); Meadow.wrong(NOOK_SAY.wrongEv); }
    };
    const narrowEv = () => { const other = shuffle(sentEls.map((_, i) => i).filter(i => !item.ev.includes(i)))[0];
      sentEls.forEach((el, i) => { if (!item.ev.includes(i) && i !== other) { el.classList.add('pale'); el.setAttribute('aria-disabled', 'true'); } }); };
    const showEv = () => sentEls.forEach((el, i) => i === item.ev[0] && el.classList.add('glow'));
    $$('#opts .opt').forEach(b => b.onclick = () => {
      if (Meadow.isBusy() || part !== 1) return;
      if (b.dataset.o === answer) {
        b.classList.add('right'); $$('#opts .opt').forEach(x => { x.disabled = true; x.classList.remove('glow'); });
        b.setAttribute('aria-label', `${answer}, correct`);
        sfx.pop(); startEvidence();
      } else { b.classList.add('wrong'); b.setAttribute('aria-label', `${b.dataset.o}, not this one`); Meadow.wrong(item.skill === 'predict' ? NOOK_SAY.wrongPredict : item.file ? NOOK_SAY.wrongFact : NOOK_SAY.wrong); }
    });
    hints = [
      () => { later(read, 1400); return NOOK_SAY.reread; },
      tip,
      () => { if (part === 2) { narrowEv(); return NOOK_SAY.narrowEv; }
        clue(); const w = $$('#opts .opt').find(x => x.dataset.o !== answer && !x.classList.contains('wrong')); if (w) { w.classList.add('wrong'); w.setAttribute('aria-label', `${w.dataset.o}, not this one`); }
        return NOOK_SAY.narrow; },
      () => { if (part === 2) { showEv(); return NOOK_SAY.showEv; }
        $$('#opts .opt').forEach(x => x.dataset.o === answer ? x.classList.add('glow') : x.classList.add('wrong'));
        return esc(NOOK_SAY.model.replace('{W}', item.why)); },
    ];
  }

  if (kind === 'order' || kind === 'match') {
    // order: the events go into numbered spaces; match: the headings go into the fact file's heading spaces
    const right = kind === 'order' ? item.events : item.file.parts.map(p => p.h);
    const cards = shuffle([...right, ...(item.extra || [])].map((x, id) => ({ id, x })));
    if (cards.slice(0, right.length).every((c, k) => c.x === right[k])) cards.reverse();
    const card = id => cards.find(c => c.id === id); // slots hold a card's id
    const n = right.length, slot = Array(n).fill(null), lock = Array(n).fill(false);
    let active = 0;
    if (kind === 'order') $('#work').innerHTML = `<ol class="nk-seq" id="seq" aria-label="The order">${right.map((_, k) => `<li><button class="nk-place" data-k="${k}"></button></li>`).join('')}</ol>`;
    $('#work').insertAdjacentHTML('beforeend', `<div class="nk-bank" id="nkBank" aria-label="${kind === 'order' ? 'What happened' : 'Headings'}"></div>
      <div class="row-btns check-row" style="margin-top:16px"><button class="btn green" id="checkBtn">✓ Check</button></div>`);
    const slotEls = () => kind === 'order' ? $$('#seq .nk-place') : $$('#story .nk-hslot');
    const ord = k => ['1st', '2nd', '3rd', '4th', '5th'][k];
    const firstFree = () => slot.findIndex((s, k) => s == null && !lock[k]);
    function draw() {
      slotEls().forEach((el, k) => {
        const c = slot[k] != null ? card(slot[k]) : null;
        el.className = (kind === 'order' ? 'nk-place' : 'nk-hslot') + (c ? ' filled' : '') + (lock[k] ? ' locked' : '') + (k === active && !c && !lock[k] ? ' active' : '');
        const name = kind === 'order' ? ord(k) : `Heading for part ${k + 1}`;
        el.innerHTML = kind === 'order' ? `<span class="nk-num" aria-hidden="true">${k + 1}</span>${c ? esc(c.x) : '<span class="nk-gap">Tap a card</span>'}` : c ? esc(c.x) : '<span class="nk-gap">Which heading?</span>';
        el.setAttribute('aria-label', `${name}: ${c ? c.x : 'empty'}${lock[k] ? ', correct' : ''}`);
        el.onclick = () => { if (Meadow.isBusy() || lock[k]) return; if (slot[k] != null) { slot[k] = null; sfx.pick(); } active = k; draw(); };
      });
      const bank = $('#nkBank');
      bank.innerHTML = cards.filter(c => !slot.includes(c.id)).map(c => `<button class="nk-card" data-c="${c.id}">${esc(c.x)}</button>`).join('');
      $$('#nkBank .nk-card').forEach(el => draggable(el, { dropSel: kind === 'order' ? '.nk-place' : '.nk-hslot', onTap: () => put(+el.dataset.c, null),
        onDrop: tg => { if (tg) put(+el.dataset.c, +(tg.dataset.k ?? tg.dataset.p)); } }));
    }
    function put(cid, k) {
      if (Meadow.isBusy()) return;
      if (k == null) k = slot[active] == null && !lock[active] ? active : firstFree();
      if (k < 0 || lock[k]) return;
      slot[k] = cid; sfx.snap();
      active = firstFree(); if (active < 0) active = 0;
      draw();
    }
    $('#checkBtn').onclick = () => {
      if (Meadow.isBusy()) return;
      if (slot.some(s => s == null)) return bubble(esc(NOOK_SAY.fill));
      const bad = slot.map((cid, k) => card(cid).x !== right[k]);
      if (!bad.includes(true)) { lock.fill(true); draw(); solved(kind === 'order' ? $('#seq') : $('#story')); return; }
      bad.forEach((b, k) => { if (!b) lock[k] = true; });
      draw(); slotEls().forEach((el, k) => bad[k] && el.classList.add('bad'));
      Meadow.wrong(kind === 'order' ? NOOK_SAY.wrongOrder : NOOK_SAY.wrongMatch);
      setTimeout(() => { if (Meadow.isBusy() || !$('#nkBank')) return; bad.forEach((b, k) => { if (b) slot[k] = null; }); active = Math.max(0, firstFree()); draw(); }, 900);
    };
    const placeRight = k => { const c = cards.find(c => c.x === right[k]); const was = slot.indexOf(c.id); if (was >= 0) slot[was] = null; slot[k] = c.id; lock[k] = true; };
    hints = [
      () => { later(read, 1400); return NOOK_SAY.reread; },
      tip,
      () => { const k = right.findIndex((x, k) => !lock[k]); if (k < 0) return NOOK_SAY.allPlaced; placeRight(k); active = Math.max(0, firstFree()); draw(); slotEls()[k].classList.add('glow'); return NOOK_SAY.placed; },
      () => { right.forEach((_, k) => placeRight(k)); draw(); slotEls().forEach(el => el.classList.add('glow')); $('#checkBtn').classList.add('snap'); return NOOK_SAY.allPlaced; },
    ];
    draw();
  }
  ctx.hints(hints);
  bubble(fmt(ctx.index === 0 ? NOOK_OPEN[item.skill] || "Snuggle up, {N}! Let's read together." : rand(["Here's another one!", "Ooh, I love this one!", "Story time! Ready?"])), false);
  later(read, 400);
}
const NOOK_OPEN = {
  feel: "Snuggle up, {N}! Let's read between the lines.", cause: "Snuggle up, {N}! Let's be story detectives.", predict: "Snuggle up, {N}! What will happen next?",
  fact: "Let's read a fact file, {N}!", vocab: "Snuggle up, {N}! Let's be word detectives.", order: "Snuggle up, {N}! Let's be story detectives.", heading: "Let's read a fact file, {N}!",
};
/* Bonnie's lines for levels 6 to 9 (for tools/make-voice.mjs). */
function nookLines(add, hint) {
  add(...Object.values(NOOK_TIPS), ...Object.values(NOOK_OPEN), NOOK_SAY.wrong, NOOK_SAY.wrongFact, NOOK_SAY.wrongPredict, NOOK_SAY.wrongEv, NOOK_SAY.wrongOrder, NOOK_SAY.wrongMatch, NOOK_SAY.fill);
  [NOOK_SAY.reread].forEach(x => hint(0, x));
  Object.values(NOOK_TIPS).forEach(t => hint(1, esc(t)));
  [NOOK_SAY.narrow, NOOK_SAY.narrowEv, NOOK_SAY.placed, NOOK_SAY.allPlaced].forEach(x => hint(2, x));
  [NOOK_SAY.showEv, NOOK_SAY.allPlaced].forEach(x => hint(3, x));
  NOOK.forEach(L => L.items.forEach(item => {
    const P = passage(item, item.kind === 'match');
    const q = item.kind === 'ev' ? item.q : item.kind === 'match' ? 'Which heading goes with each part?' : (item.q || 'Put these in the order they happened.');
    add(P.spoken, q, readLine(P.spoken, q), item.why.replace(/[.!?]$/, '') + '!');
    if (item.kind === 'ev') { const e = evQOf(item); add(e, readLine(P.spoken, e), NOOK_SAY.evNow.replace('{Q}', e)); hint(3, esc(NOOK_SAY.model.replace('{W}', item.why))); }
  }));
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
    hint(3, `The answer is <b>${esc(answer)}</b>. See the clue word? Tap the shiny answer!`);
  }));
  nookLines(add, hint);
  return out;
}

const IDS = ["rhyme-time", "who", "where-and-what", "mixed-questions", "longer-stories"];
Meadow.registerWorld({
  id: 'y2-english-stories', subject: 'english', year: 2,
  name: "Bonnie's Story Nook", tag: "Stories, rhymes & questions", icon: '📖', color: '#8E7CC3', tint: '#ECE6F6',
  perLevel: 6, praise: PRAISE, hintNames: HINTS, css: CSS + NOOK_CSS, play: playStory, lines,
  // levels 1 to 5 (their ids never change), then levels 6 to 9, which play with playNook
  levels: [...STORIES.map((L, i) => ({ ...L, id: IDS[i], name: L.title })), ...NOOK.map(L => ({ ...L, name: L.title, play: playNook }))],
});
})();
