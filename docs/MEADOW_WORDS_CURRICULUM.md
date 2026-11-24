# Meadow Words: Year 2 curriculum expansion

Started 24 November 2026, from the brief *Meadow Words Curriculum Expansion, Priority 1–3*. Three existing worlds are deepened in order: **Bonnie's Story Nook**, **Sentence Meadow**, **Phonics Forest**. No new worlds. Every existing level keeps its id, its questions and its saved stars; the new levels are added after them with new ids.

Page numbers are the printed pages of *The national curriculum in England: key stages 1 and 2 framework document* (September 2013), which match the PDF's pages. This content adds to classroom reading, discussion and handwriting. It does not assess every statutory objective.

**How to check it again**

| What | Command |
|---|---|
| Content audit (every question, answer, distractor, evidence sentence, hint target) | `node tools/words-audit.mjs` (`--write` makes [docs/review/WORDS_AUDIT.md](review/WORDS_AUDIT.md)) |
| Play every new level with the real buttons, an old save, hints, VoiceOver names | `node tools/run-test.mjs "tests/words-levels-test.html?world=stories"` (or `sentences`, `phonics`; about 5 to 8 minutes each. All three in one run takes over 30 minutes) |
| Player, stars, bones and the full game survive moving between pages; the free first level is unchanged | `node tools/cross-page-check.mjs` |
| Pictures at key moments (iPhone SE, iPhone 17, iPad landscape) | `node tools/words-shots.mjs`, then open [docs/review/words-expansion/index.html](review/words-expansion/index.html) |
| Phone fit of every level | `node tools/level-check.mjs --only english --size se,17,ipad` |
| Bonnie's lines still to record | `npm run voice:check` |

---

## Priority 1: Bonnie's Story Nook

### Levels and ids

| # | Level | Id | Questions | Kinds of question |
|---|---|---|---|---|
| 1–5 | Rhyme Time · Who? · Where & What? · Mixed Questions · Longer Stories | `rhyme-time` `who` `where-and-what` `mixed-questions` `longer-stories` | unchanged | unchanged |
| 6 | Reading Between the Lines | `reading-between-the-lines` | 8 passages | feelings and motives from actions and dialogue; one poem; answer **then the evidence sentence** |
| 7 | What Happens Next? | `what-happens-next` | 8 passages | prediction, labelled "the best guess", **then the clue sentence** |
| 8 | Bonnie's Fact Files | `fact-files` | 14 questions on 7 fact files | retrieval, "which does the fact file tell us?", vocabulary, life-cycle sequencing, **heading matching** |
| 9 | Story Detective | `story-detective` | 9 passages | sequencing 3–4 events, cause and effect, vocabulary in context |

New levels unlock as every level does (a star on the level before) and follow the free-first-level rule unchanged: in the App Store app, levels 6–9 need the full game, like levels 2–5. Nothing about access was changed.

### Curriculum map

| Objective (Year 2) | Where | Page |
|---|---|---|
| Making inferences on the basis of what is being said and done | L6 (all), L9 cause questions | 28 |
| Predicting what might happen on the basis of what has been read so far | L7 (all) | 28 |
| Explain and discuss their understanding (here: choose the sentence that shows it) | L6, L7, L8, L9 evidence part; Bonnie explains with the evidence | 28 |
| Discussing the sequence of events and how items of information are related | L9 ordering; L8 frog life cycle | 28 |
| Being introduced to non-fiction books that are structured in different ways | L8 fact files with headings; heading matching | 28 |
| Discussing and clarifying the meanings of words | *nocturnal, frogspawn, huddle* (L8), *soggy, drooping* (L9) | 28 |
| Cause and effect in narrative and non-fiction | L9 "why" questions; L6 poem; L8 bees and pollen | 29 |
| Poetry and stories (different passage styles) | narrative, dialogue (L6 Leo, L7 Ava, L9 Ben), poem (L6 seed), fact files and an instruction text (L8 teeth) | 28 |

### How a question works

- **Two parts.** Choose the answer; then the story's sentences become buttons and the child taps the one that shows it. Some questions accept more than one sentence when each genuinely supports the answer (listed in the audit).
- **Prediction is never "the only thing that could happen".** The question says *best guess*; a wrong choice gets *"That could happen, but is there a clue for it in the story?"*; Bonnie's explanation names the clue.
- **Hints (Bonnie's four):** 1 read it again aloud; 2 the strategy for this kind of question; 3 underline the clue and take away one answer (evidence part: make all but two sentences paler); 4 Bonnie models her reasoning and the answer glows, but the child still taps it. Help carries into the evidence part.
- **When it's solved** Bonnie says *and shows* her reasoning from the text, e.g. "Bonnie dived under the table and hid her face when the thunder rumbled. That suggests she was frightened."
- Ordering and headings: tap a card (or drag it) into a numbered space; wrong places get ✗ and go back, right ones stay with ✓.

### Content audit (summary)

The full list is [docs/review/WORDS_AUDIT.md](review/WORDS_AUDIT.md). Checked by hand and by `tools/words-audit.mjs`:

- **Facts.** Hedgehogs (nocturnal; beetles, worms, slugs; roll into a ball), honeybees (live together, often in a hive; nectar → honey; carrying pollen helps plants make seeds), frog life cycle, teeth (twice a day, about two minutes: NHS guidance), emperor penguins (Antarctica, flightless, huddle), rock pools, sunflowers. Bee homes were reworded from "a nest called a hive" to "often a hive", because wild honeybees also nest in hollow trees.
- **Distractors** are contradicted by the passage or have no support in it. Fact-file distractors deliberately use words from the passage in the wrong way (pollen vs nectar), to test what the passage *says*.
- **Possibly subjective, kept on purpose and noted:** "Ben … sighed" → *disappointed* (only the sigh is accepted as evidence of the *feeling*; Dad's line gives the reason, so the evidence question asks which sentence *shows how Ben felt*). "Priya walked slowly" → *careful not to drop the cake* (tiredness is not supported by anything in the text). Seed poem → *rain and sun* (stated as the poem's cause, with the science fact in the explanation).
- **Evidence sets that accept two sentences** (each supports the answer): Leo's bike, Oliver's grandad, Priya's cake, the squirrel, most predictions, *drooping* and *soggy*, Ben's knee. The audit flags any question where half the sentences or more count.
- Reading load: no sentence over 22 words; passages are 3–5 sentences, fact files 5–6 under headings.

### Tests

`node tools/run-test.mjs "tests/words-levels-test.html?world=stories"`: **31 of 31 passed** (24 November 2026). It loads a save made before the update (stars on the old ids, 40 bones) and checks they survive; checks the new levels come after the old, are locked until the level before has a star, and add to the world's star count (journal and map); plays all four new levels to the end with the real buttons, playing again until **every question in each bank** has been answered; walks Bonnie's four hints on every kind of question and checks the stars reflect it (2 stars with one fully helped question); checks VoiceOver names (sentence buttons "Sentence 2: …", "frightened, correct", ordering places "1st: empty"), focus moving to the story for the evidence part, and ✗/✓ shown as symbols, not colour alone.

Phone fit (`tools/level-check.mjs`): nothing is wider than the screen at any size. The fact files and ordering are a page of reading, so on phones the answers sit below the passage and the child scrolls, as the existing *Longer Stories* level already does on an iPhone SE. For the evidence part the question is repeated at the top of the passage, where the sentences are tapped, and the passage is scrolled into view. On an iPad everything fits.

Reduce Motion: the new shakes are turned off; the wrong mark stays as ✗ or crossed-out text.

### Audio

Every line in the new levels is fixed text, listed by the world's `lines()`, so `npm run voice` records it like the rest. **339 new clips** are needed (about 14,800 characters). Until they are recorded, the App Store app is silent for these lines (Bonnie only uses her recordings there) and the website uses the device voice. Leaving a question stops Bonnie (the engine hushes on every screen change, and her delayed lines check the question is still showing).

### Limitations

- The new lines are not recorded yet (see Audio).
- On the iPhone SE and iPhone 17 the fact files and ordering questions scroll (see Tests).
- Real-device VoiceOver and touch testing still has to be done on a phone and an iPad; the automated checks drive Chrome.

---

## Priority 2: Sentence Meadow

### Levels and ids

| # | Level | Id | Questions | Kinds of question |
|---|---|---|---|---|
| 1–5 | Capital Letters · Full Stop or Question? · Exclamation! · Word Order · Super Sentences | `capital-letters` `full-stop-or-question` `exclamation` `word-order` `super-sentences` | unchanged | unchanged |
| 6 | Comma Caterpillar | `comma-caterpillar` | 9 | tap the spaces between words to put commas in a list (3- and 4-item lists, nouns, adjectives, verbs, two-word items, a sentence with *Tom and Leo* that is not part of the list) |
| 7 | Apostrophe Adventures | `apostrophe-adventures` | 20 | build a contraction by tapping the letters left out (8); tap the word that needs an ownership apostrophe, next to a plural that doesn't (6); "why does this word have an apostrophe?" (6) |
| 8 | Four Kinds of Sentences | `four-kinds-of-sentences` | 12 | choose statement, question, command or exclamation from the words alone, then its end mark |
| 9 | Joining Sentences | `joining-sentences` | 10 | choose *and, but, or, when, if, that* or *because* to join two ideas; a wrong choice is read back in the sentence |

### Curriculum map

| Objective (Year 2) | Where | Page |
|---|---|---|
| Commas to separate items in a list | L6 | 32, 76 |
| Apostrophes to mark where letters are missing (contracted forms) | L7 contractions; "why?" questions | 29, 32, 57, 76 |
| Possessive apostrophe, singular nouns (*the girl's book*) | L7 ownership; "why?" questions | 29, 57, 76 |
| How the grammatical patterns in a sentence indicate its function as a statement, question, exclamation or command | L8 | 32, 75 |
| Capital letters, full stops, question marks and exclamation marks to demarcate sentences | L8 end marks (and levels 1–5) | 76 |
| Subordination (*when, if, that, because*) and co-ordination (*or, and, but*) | L9 | 32, 75 |
| Terminology: statement, question, exclamation, command, apostrophe, comma | L8 choices, Bonnie's hints | 76 |

### Design decisions

- **Punctuation is a button only where it is being chosen**: the comma spaces in L6 and the end marks in the second part of L8. In L6, L7 and L9 the end mark is plain text. The earlier fix (no tappable end mark in Capital Letters) is unchanged and checked by the test.
- **No comma before *and*** in a list (the usual Year 2 teaching). A comma there gets its own explanation: *the word and joins the last two things in the list.* The wording avoids saying a comma there is never allowed.
- **Contractions vs. ownership** are taught apart and then compared: L7 mixes building contractions, finding the owner's word next to a plain plural (*cats*, *pockets*, *boots*), and "why does it have an apostrophe?". *It's* is only ever *it is*. There are no plural owners (*girls'*) and no owners ending in *s*, since those are not Year 2.
- **Exclamations are the Year 2 grammatical form** (*What a …!*, *How …!*), not any loud sentence. *How tall that tree is* (exclamation) and *How tall is that tree* (question) are both in the bank, so the words decide. Statements are calm, so a full stop is clearly right.
- **Commands accept . or !** (both are correct). Questions take only ?, statements only ., exclamations only !.
- **Joining words: one clearly right choice.** Each sentence was read with all seven joining words. The two wrong choices offered make no sense or are not grammatical there; words that could also be right are not offered (listed in the audit). *And* is never a wrong choice.
- **Bonnie explains with the child's sentence**, e.g. *"Bonnie was wet because she had jumped into the pond. Because tells us the reason Bonnie was wet."*, and a wrong joining word is read back: *"Hmm, listen: Bonnie was wet but she had jumped into the pond. Does that make sense?"*

**Hints:** 1 hear it again; 2 the rule in child-friendly words; 3 narrow it down (one comma placed and stray ones removed; one left-out letter crossed out; non-owner words made pale; one wrong choice or end mark taken away); 4 Bonnie shows it all, and the child still taps Check or the shining answer.

### Tests

`node tools/run-test.mjs "tests/words-levels-test.html?world=sentences"`: **34 of 34 passed** (24 November 2026). Besides the save, unlock, star, bone and every-question checks above, it checks the VoiceOver names of the comma spaces ("Space after ball, no comma" / "Comma after ball"), the letter toggles (`aria-pressed`) and the end marks ("full stop", "question mark", "exclamation mark"); that a comma before *and* gets its explanation; that commands accept both . and !; that a wrong joining word is read back; and that Capital Letters still has no tappable end mark.

Phone fit: everything fits the iPhone SE width; comma spaces are 26 × 40 points on a phone with a tap area that reaches past the edges (as with the existing Aa buttons). Pictures: `sentences-*` in [docs/review/words-expansion/](review/words-expansion/index.html).

### Audio

**279 new clips** for Sentence Meadow (618 for the expansion so far, about 25,500 characters), to record with `npm run voice`.

### Limitations

- The new lines are not recorded yet.
- Joining Sentences offers three choices, not all seven at once: with seven, several would often make sense, and a defensible answer would be marked wrong.

## Priority 3: Phonics Forest

### Levels and ids

| # | Level | Id | Questions | Kinds of question |
|---|---|---|---|---|
| 1–5 | a-e · i-e, o-e · u-e, e-e · ai, ay · ee, ea, igh, ie | `a-e` `i-e-o-e` `u-e-e-e` `ai-ay` `ee-ea-igh-ie` | unchanged | unchanged (build the word from letter tiles, sound dots, Blend) |
| 6 | Tricky Consonants (badge, knee) | `tricky-consonants` | 14 | fill the gap with the right spelling: *dge* or *ge*, soft *c* or *s*, *kn*/*gn* or *n*, *wr* or *r* |
| 7 | Word Endings (apple, camel) | `word-endings` | 14 | *-le*, *-el*, *-al*, *-il* (11), and *-tion* (3) |
| 8 | Changing Words (hop, hopping) | `changing-words` | 19 | root + *-ing*, *-ed*, *-er*, *-est*, *-y*: choose *drop the e*, *double the last letter*, *change y to i* or *just add it*; the word is then built in front of the child; 5 questions then ask *why?* |
| 9 | Suffix Builders (kind, kindness) | `suffix-builders` | 11 | choose *-ment*, *-ness*, *-ful*, *-less* or *-ly* to make a sentence make sense; for *happy* and *easy*, then choose *happiness* or *happyness* |
| 10 | Same Sound, Different Spelling (cry, key) | `same-sound-different-spelling` | 15 | *-y* (cry), *-ey* (key), *a* before *l* (walk), *o* (brother), *or* after *w* (worm), *ar* after *w* (warm), *a* after *w* (watch) |

### Curriculum map

| Objective (Year 2) | Where | Page |
|---|---|---|
| Learning new ways of spelling phonemes for which one or more spellings are already known | L6, L7, L10 | 29 |
| Add suffixes to spell longer words, including *-ment, -ness, -ful, -less, -ly* | L9 | 30, 57 |
| Apply spelling rules and guidance, as listed in English Appendix 1 | L6–L10 | 30 |
| Read words containing common suffixes | L8, L9 | 27 |
| /dʒ/ spelt *-dge* and *-ge* at the end of words | L6 | 55 |
| /s/ spelt *c* before *e, i, y* | L6 | 55 |
| /n/ spelt *kn* and (less often) *gn* | L6 | 55 |
| /r/ spelt *wr* | L6 | 55 |
| /l/ or /əl/ spelt *-le*, *-el*, *-al*, *-il* | L7 | 55–56 |
| Words ending in *-tion* | L7 | 57 |
| /aɪ/ spelt *-y* at the end of words | L10 | 56 |
| Adding *-ing, -ed, -er, -est, -y* to words ending in *-e* with a consonant before it | L8 | 56 |
| Adding *-ing, -ed, -er, -est, -y* to words of one syllable ending in a single consonant letter after a single vowel letter | L8 | 56 |
| Adding *-ed, -ing, -er, -est* to a root word ending in *-y* with a consonant before it | L8, L9 (happiness, easily) | 56–57 |
| /ɔː/ spelt *a* before *l* and *ll* | L10 | 56 |
| /ʌ/ spelt *o* | L10 | 56 |
| /iː/ spelt *-ey* | L10 | 57 |
| /ɒ/ spelt *a* after *w* | L10 | 57 |
| /ɜː/ spelt *or* after *w*; /ɔː/ spelt *ar* after *w* | L10 | 57 |

Not covered here: /ʒ/ spelt *s* (television, treasure), adding *-es* to nouns and verbs ending in *-y*, homophones, contractions (in Sentence Meadow L7) and common exception words (in Tricky Words).

### Design decisions

- **Spelling, not blending.** These levels never say a consonant sound on its own (see *The sound audit* below). Bonnie says whole words, which her voice says well; names letters when she spells something out (*"Knock is spelt k, n, o, c, k. The k is silent."*); and describes a sound by a word that has it (*"the sound at the end of badge"*). There are no sound dots or Blend button in levels 6–10; levels 1–5 keep theirs.
- **Teach, then practise.** The first time a pattern comes up in a run, a card above the question teaches it (and Bonnie says it). After that, a *Spelling tip* button brings the card back. Bonnie's second hint always shows the card.
- **"Often", "usually", not "always".** The teaching follows Appendix 1's wording. The audit flags any reason that says *always* or *never*. The one *never* is Appendix 1's own: *x* is never doubled.
- **A wrong tile is not a wrong sound.** Every wrong tile makes the same sound in another word, so Bonnie says *"That can make the same sound, but it isn't how we spell this word."* The tile is crossed (✗) and then taken away. No wrong tile makes a real word: the audit checks against a list of words a child might confuse, after *worm* and *rite* were avoided. *warm* is offered with *ar* and *aw*, not *or*. *wriggle* replaced *write*.
- **Changing words shows the change.** After the right choice, the word is built: a dropped *e* is crossed out, a doubled letter or the *i* from *y* is highlighted with a dashed outline (not by colour alone), and the ending is in green tiles. VoiceOver hears *"e, dropped"*, *"p, doubled"*, *"i, was y"*.
- **Defensible answers.** In Suffix Builders, each sentence was read with all three choices. The wrong ones are either not words or say the opposite of the sentence. *cry + ing* and *play + ed* (just add it) and *mix + ing* (x is never doubled) are in the bank on purpose, so the rules aren't applied blindly.
- **The rule is code, checked by hand.** The game works out every changed word with the Appendix 1 rules. The audit compares the code with 46 answers typed out by hand, including awkward cases that are not in the bank (*copying, merriment, shyness, seeing, boxing*).

**Hints** (the brief's four tiers): 1, hear the whole word in its sentence; 2, the pattern card; 3, narrow it down: one wrong tile or choice taken away, with a comparison (*"It's like apple and table."*); 4, Bonnie shows the answer (it glows) and the child puts it in or taps it. A second part (*why?*, *which spelling?*) keeps the help already given.

**Correct answers say the word and why**, e.g. *"Hopping. Hop has a short vowel sound and ends in one consonant, p. We double it to keep the vowel short: hopping."* The reason stays on screen.

### The sound audit (the PH map in levels 1–5)

The first five levels have a sound dot under each tile and a Blend button. The `PH` map in `worlds/y2-english-phonics.js` gives the text Bonnie's voice reads for each sound. All of these lines already have recorded clips.

| Sounds | Written as | Verdict |
|---|---|---|
| f, l, m, n, r, s, v, z, sh, th, sc | *fff, lll, mmm, nnn, rrr, sss, vvv, zzz, shh, thh, sss* | **Good.** Stretchy sounds can be held without a vowel, which is how phonics schemes teach them. *thh* doesn't show voiced (*this*) or unvoiced (*thin*). |
| b, c, d, g, k, p, t, ck, h, j, w, y, ch, q | *buh, kuh, duh, guh, kuh, puh, tuh, kuh, huh, juh, wuh, yuh, chuh, kwuh* | **The schwa problem.** Each has an added *uh*. Phonics teaching asks for clipped sounds (*b*, not *buh*), because *buh-a-tuh* doesn't blend into *bat*. A recorded or synthetic voice can't say a stop consonant on its own, so the *uh* is there to make it sayable. |
| a, e, i, u | *ah, eh, ih, uh* | **Mostly fine.** *ah* can be heard as the *a* in *car* rather than in *cat*. |
| o | *o* | **Probably wrong.** A voice reading the letter *o* on its own says its name (*oh*), not the short sound in *hot*. Listen to the clip before relying on it. |
| x, ng | *ks, ng* | *ng* may be read as the letters *N, G*. Listen to the clip. |
| Long vowels and digraphs | *A, E, I, O, U* (ai, ay, ee, ea, igh, ie, oa, split digraphs) | **Fine** where the voice says the letter name, which is the right sound here. A lone capital *A* can be read as the word *a* (*uh*). Listen to the clip. |

**Not changed, on purpose.** Rewriting these strings would not fix the problem, because no text makes a synthetic voice clip a *b*. It would also orphan the clips already recorded. The fix is human recordings of the pure sounds. A recording can be dropped into `audio/manifest.json` under the key of the existing string (the hash of *buh* and so on, from `BonnieVoice.pieceKey`). No code change is needed, and the website falls back to the device voice as now. The new levels 6–10 avoid the problem altogether, as described above.

### Content audit (summary)

`node tools/words-audit.mjs`: **no problems.** It checks:

- the old ids still come first;
- every bank has at least 6 questions;
- every changed or suffixed word against the hand-typed answers, and every *drop the e / double / y to i / just add* label against the rule code;
- every gap word against a hand-checked list of Year 2 words;
- each gap word fits its pattern as taught (soft *c* before *e, i, y*; *-el* after *m, n, r, s, v, w*; *dge* straight after a short vowel; *or*, *ar* and *a* after *w*; and so on);
- no wrong tile makes a real word;
- every sentence has one gap;
- no question repeats.

[docs/review/WORDS_AUDIT.md](review/WORDS_AUDIT.md) lists every question with its tiles, the words the wrong tiles make, and Bonnie's reason.

### Tests

`node tools/run-test.mjs "tests/words-levels-test.html?world=phonics"`: **45 of 45 passed** (24 November 2026). Besides the save, unlock, star, bone and every-question checks, it checks that:

- the pattern card appears the first time;
- tiles are VoiceOver buttons that spell out their letters;
- there are no sound dots or Blend button in the new levels;
- a wrong tile gets a ✗, Bonnie's explanation, and is then taken away;
- the right answer is spelt out with its reason;
- a wrong change can't be tapped again;
- the dropped *e* reads *"e, dropped"*;
- the *why?* part, and the *happiness*/*happyness* part, work;
- levels 1–5 still have sound dots and Blend.

Phone fit: everything fits the iPhone SE width. When the pattern card is showing, the letter tray sits just below the screen on an iPhone SE and needs a short scroll. That is only on the first question of each pattern; later questions fit. Pictures: `phonics-*` in [docs/review/words-expansion/](review/words-expansion/index.html).

### Audio

**379 new clips** for Phonics Forest (about 12,000 characters). That makes **997 new clips** for the whole expansion (about 37,500 characters), to record with `npm run voice`.

### Limitations

- The new lines are not recorded yet. In the app, Bonnie is silent for a line with no clip; the website uses the device voice.
- Spelt-out letters (*"k, n, o, c, k"*, *"a, l"*) should be listened to once recorded, to check the voice reads each as a letter name.
- The PH map in levels 1–5 still adds *uh* to stop consonants (see the sound audit). The fix is human recordings, not code.
- Not tested on a real device with VoiceOver; the names were checked in the page.

## Final cross-world regression (24 November 2026)

| Check | Result |
|---|---|
| `tests/words-levels-test.html?world=stories` | 31 of 31 passed |
| `tests/words-levels-test.html?world=sentences` | 34 of 34 passed |
| `tests/words-levels-test.html?world=phonics` | 45 of 45 passed |
| `node tools/cross-page-check.mjs` | 36 of 36 passed |
| `node tools/words-audit.mjs` | no problems |

The cross-page check uses the App Store app with the full game. It sets stars on new levels in all three worlds, then opens Words, Maths, Grown-ups, the Clubhouse, the Walk, then Words again. On every page it finds the same player, bones, stars, purchase, and no errors. The Words shop opens. The Clubhouse journal shows all 10 Phonics Forest levels and counts their stars. With the purchase taken away, level 1 of every Words world is still free, every later level (old and new) needs the full game, and the stars are kept.

The test page plays a level until every question in its bank has come up, with up to 30 runs. Each run draws 6 questions at random, so 12 runs sometimes missed one question in a 14- or 19-question bank.
