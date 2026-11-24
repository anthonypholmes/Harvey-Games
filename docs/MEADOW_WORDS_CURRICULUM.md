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
