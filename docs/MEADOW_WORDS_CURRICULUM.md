# Meadow Words: Year 2 curriculum expansion

Started 24 November 2026, from the brief *Meadow Words Curriculum Expansion, Priority 1–3*. Three existing worlds are deepened in order: **Bonnie's Story Nook**, **Sentence Meadow**, **Phonics Forest**. No new worlds. Every existing level keeps its id, its questions and its saved stars; the new levels are added after them with new ids.

Page numbers are the printed pages of *The national curriculum in England: key stages 1 and 2 framework document* (September 2013), which match the PDF's pages. This content adds to classroom reading, discussion and handwriting. It does not assess every statutory objective.

**How to check it again**

| What | Command |
|---|---|
| Content audit (every question, answer, distractor, evidence sentence, hint target) | `node tools/words-audit.mjs` (`--write` makes [docs/review/WORDS_AUDIT.md](review/WORDS_AUDIT.md)) |
| Play every new level with the real buttons, an old save, hints, VoiceOver names | `node tools/run-test.mjs tests/words-levels-test.html` |
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
