# Maths confidence pack: Bonnie's Walk, Teach Bonnie, hide the gap, warm-ups

> **For Claude Code.** Read this whole file, then `README.md`, `js/meadow-core.js`, `worlds/y2-maths-kit.js` (especially the Captain's Cove claim/verdict questions) and `index.html`, before changing anything. Use one branch per stage. Stop after **each stage** so I can test on the iPad. I'm not a developer, so finish each stage with a plain-English summary and a short test checklist (what to tap, what I should see).

---

## Why

Harvey has mastered almost all of Meadow Words, but he hasn't opened Meadow Maths for a week. It isn't the maths itself: it's **fear of failing at the door**. On the Clubhouse, English is a guaranteed win and maths is a door that might lead to getting things wrong, so he picks English every time. Seeing a full English star count next to a near-empty Maths card makes it worse.

This pack has two jobs:
1. **Take the choosing away.** Maths turns up inside something friendly, instead of Harvey having to decide to open it.
2. **Make the first minutes of maths impossible to fail.**

**Ground rules for everything below:**
- **Never lock, limit or gate English.** No "do maths first".
- **Nothing in Bonnie's Walk can be failed.** Every question ends with Harvey getting it right, with help if needed.
- **Reuse, don't duplicate.** Questions come from the existing world files' own `make()` / `items` and play screens. Shared logic lives in `meadow-core.js` or the maths kit, not copied into worlds.
- **Keep what works:** the star rule, MASTERED, Bones v1.1, the shop, prizes and the existing balance. Nothing is taken away.
- Storybook look, tablet-first, reduced motion respected, and Bonnie's voice for every new line.

---

## 1. Bonnie's Walk (the main change)

**What Harvey sees:** a big, friendly **🐾 Bonnie's Walk** button at the top of the Clubhouse, above the game cards. Bonnie says something like *"Walkies! Come on {N}, five quick questions on our walk!"* The walk:
- Is **5 questions**, under about 3 minutes.
- Shows Bonnie on a meadow path with 5 paw-print stepping stones as progress. Each right answer moves her along.
- Feels like one activity. Don't show "English" or "Maths" labels; just Bonnie's path.

**The mix:**
- Default **"Gentle" = 3 English + 2 maths**, ordered **E, M, E, M, E**, so it starts and ends on an English win.
- Grown-ups area setting **Walk mix**:
  - **Gentle** (2 maths, the default)
  - **Even** (3 maths: M, E, M, E, M)
  - **More maths** (4 maths, 1 English)
- I'll move it up by hand when he's ready. No automatic change.

**Which questions:**
- **English:** any English level he has at least 1 star in, at normal difficulty (he's strong here).
- **Maths:** deliberately **below his level**. Only use:
  - the **first 2 levels of each maths world**, plus
  - any maths level he already has a star in,
  - and always with the **easy** numbers (`make(type, k, true)` or the world's easy mode).
  - Rotate through topics. Never the same maths level twice in one walk.
  - Avoid question types that need long dragging or many steps (keep it quick taps where possible).
  - If a type can't run inside the walk cleanly, leave it out rather than squeeze it in.

**Can't fail:**
- No stars, no mistakes counted, no star bonus.
- A wrong answer just moves Bonnie's help ladder up a rung (clue → step card → glowing buttons) until he gets it. Every question ends right.
- Bonnie's reaction to a wrong answer is warm (*"Hmm, let's sniff that one out together!"*), never "wrong".

**Bones (follow Bones v1.1, so walks can't be farmed):**
- Treat the walk like a level with id `walk/daily`.
- The first **2 walks each day** are normal: +1 per right answer, plus a **+5 walk bonus** for finishing.
- Later walks that day: no answer bones, +3 for finishing (the same extra-practice rule and friendly message as v1.1).
- The ask-Bonnie bone still pays.

**Walk streak:**
- Count days with at least one finished walk.
- Show the streak as paw prints on the Walk button ("🐾 3 days in a row!").
- Missing a day resets it quietly, with no sad message.

**Finish screen:** a happy Bonnie, a paw stamp ("Walk done!"), the bones earned, and buttons **Back to the Clubhouse** / **Another walk**.

**Architecture:** your call. It could be a new page (e.g. `bonnies-walk.html`) that loads the core and all world files (as `index.html` already does), or a mode inside the Clubhouse. English and maths have different play screens, so plan how a walk switches between them smoothly. Tell me the approach in Stage 1 before building.

---

## 2. Teach Bonnie (Harvey becomes the expert)

Every so often Bonnie has a go herself and Harvey checks her:

> *"I think 7 + 5 is 11. Am I right?"* → **That's right, Bonnie!** / **Oops, Bonnie!** → if Oops: *"Can you show me the right answer?"* → Harvey enters 12 → *"You're a brilliant teacher, {N}!"*

**Where:**
- In Bonnie's Walk: one of the maths questions per walk, from the walk's second walk onwards (keep the very first walk simple).
- In maths levels: at most **one question per level**, never the first question.

**How it works:**
- Build it **once in the maths kit** as a wrapper that turns any single-number-answer question into a Teach Bonnie question. It's a two-step verdict, like the Captain's Cove verdict questions, so reuse that kind. No changes to individual world files.
- Bonnie is **wrong about two times in three**. Her wrong answer must be a plausible slip (off by one, off by ten, forgot to exchange, swapped digits), using the kit's `near()`. It must **never** accidentally be correct. A test must check this.
- **Scoring:** in the walk, nothing can be failed (as above). In maths levels, it counts like any other question: a wrong verdict is a mistake, help tiers apply, and the right answer pays its bone.
- Grown-ups toggle: **Teach Bonnie questions** (on by default).
- Bonnie's lines should sound genuinely unsure and grateful, never silly-on-purpose. She's learning from him.

---

## 3. Hide the gap

**Clubhouse cards** (every game card, so they're consistent):
- Replace the "⭐ earned / possible" line with **"⭐ N new stars this week"**.
- If there are none yet this week, show a gentle line instead, e.g. "Ready when you are!" for Maths, or "All mastered 🏆" when a game has every star.
- Record when stars improve (for example `starLog: [{ key, stars, when }]`), so "this week" can be counted. A week = Monday to Sunday, local time.

**Level maps:** a level he has never played shows a **"New!"** badge instead of three empty stars. Levels with stars look as now.

**The grown-ups area keeps the full totals**, so I can still see real progress.

---

## 4. Warm-ups (maths only)

- Every maths **level** starts with **2 warm-up questions**: the same level's question types with easy numbers, marked with a small "Warm-up" chip.
- Warm-ups **don't count** for stars (no mistakes, no helps counted) but pay answer bones as normal under v1.1.
- Not in Bonnie's Walk (it's already easy), not in English, not in Captain's Cove (reasoning questions don't suit a warm-up).
- Grown-ups toggle: **Maths warm-ups** (on by default).

---

## 5. Grown-ups "this week" panel

So I can do the two-week and four-week check-ins without exporting the save, add a small panel in the grown-ups area:
- walks finished this week and the current walk streak
- maths levels opened this week, and **whether Harvey opened them himself** (any maths level started from the map, not through the walk)
- new stars this week, per game
- maths topics where Bonnie's step card or glowing buttons were needed most (from the existing logs)

Record level starts with a date, so "opened this week" can be counted.

---

## Save changes

New fields only. Old saves must load fine, with the new fields starting empty:
- `walks` (per-day counts and the streak)
- `starLog`
- `levelStarts` (keep about the last 90 days, to stop the save growing forever)
- `settings.walkMix`, `settings.teachBonnie`, `settings.warmUps`

The same date safety as v1.1 applies: a clock moved backwards must not reset or grant anything.

## Also needed (each stage)

- **Voice:** new Bonnie lines in the lists `tools/make-voice.mjs` reads. Say which are new so I can record them.
- **Offline:** add any new files to the service worker list and bump `CACHE_VERSION`.
- **README:** update it.
- **Tests:** add a test page covering:
  - a walk is always 5 questions in the chosen mix
  - walk maths only comes from the allowed levels, with easy numbers
  - a walk can't end with a question unsolved
  - walk bones follow v1.1 (2 normal walks a day)
  - Teach Bonnie's wrong answers are never correct
  - warm-ups don't affect stars
  - "new stars this week" counts correctly across a week boundary

## Stages (stop after each)

1. **Plan:** how the walk switches between English and maths screens, a description of the Walk button and path screens, 3 example Teach Bonnie questions with Bonnie's lines, and the new save fields. Don't build yet.
2. **Hide the gap + warm-ups:** small and quick, so it can go live today. Go live.
3. **Bonnie's Walk** with the walk streak and Walk mix setting. Go live.
4. **Teach Bonnie** in the walk and in maths levels. Go live.
5. **Grown-ups "this week" panel**, voice lines, README and tests. Go live.

Start with **Stage 1** only.
