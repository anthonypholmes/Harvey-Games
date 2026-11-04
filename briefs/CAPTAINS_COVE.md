# Bones v1.1 + new Maths world: Captain's Cove

> **For Claude Code.** Read this whole file, then `README.md`, `js/meadow-core.js` and `worlds/y2-maths-kit.js`, before changing anything. There are two parts:
> - **Part A** is a small change to the bone rules in the core.
> - **Part B** is a new Maths world.
>
> Do Part A first, on its own branch (`bones-v1-1`), and get it live before starting Part B (`world-captains-cove`). Stop after **each stage** so I can test on the iPad. I'm not a developer, so finish each stage with a plain-English summary and a short test checklist (what to tap, what I should see).

---

# Part A: Bones v1.1 (less farming, same fun)

## Why
Today every replay pays 1 bone per right answer, however many times the level has been done. A finished level can be replayed endlessly for bones. Stars and the MASTERED ribbon already work well, so they stay exactly as they are. Only the *speed of earning on repeat replays* changes.

**Guiding rule: never limit how often a child can practise. Only balance how quickly they earn.**

## The rules

| Situation | Bones |
|---|---|
| **Normal run**: the first **2** runs of a level each day | +1 per right answer (as now) |
| **Extra practice run**: the 3rd and later runs of that level on the same day | **No** per-answer bones; **+3** when the level is finished |
| New personal-best stars (any run) | **+3 per new star** (up from 2), only for stars better than the best so far |
| Asking Bonnie for help (any run) | **+1**, once per level per run (unchanged) |

- **Unchanged:** the star rule, best-star saving, MASTERED, unlocking, the help ladder, all shop and prize prices, the grown-up prize check, and the current bone balance (nothing is taken away).
- **No daily cap across the game.** Five *different* levels in a day all pay normally. The 2-a-day limit is per level.
- **Help is never penalised.** Asking Bonnie or using the step card never changes whether a run is normal or extra, or what it pays.
- All of this lives **only in `meadow-core.js`** (the `RULES` object plus the run logic), so it applies to every game and world without touching any world files.

Worked example, a 10-question level played 5 times in one day, 3 stars on the first play, no help:
**today** 10 + 6 + 10 + 10 + 10 + 10 = **56** bones → **v1.1** (10 + 9) + 10 + 3 + 3 + 3 = **38** bones.

## How it should work
- **Decide the run type when the level starts:** look up how many normal runs this level has had today.
  - Fewer than 2: a **normal run**.
  - Otherwise: an **extra practice run**.
- **Counting:** a normal run uses up one of the day's two only when it pays its **first answer bone**. Opening a level and leaving straight away doesn't use one up. Quitting part-way through does, which stops "quit just before the end" farming.
- **Save:** add a small record, for example `daily: { day: 'YYYY-MM-DD', normalRuns: { '<worldId>/<levelId>': n } }`. Use the device's *local* date. A new day resets the counts.
- **Safety:**
  - If the device date ever goes *backwards*, keep the stored day and its counts (don't reset).
  - Refreshing the page mid-level must not grant extra normal runs or double-pay any bones.
  - Old saves without `daily` just start empty.
- **Make it feel friendly, not like a punishment:**
  - At the start of an extra practice run, Bonnie says something like *"You came back for more! This one's extra practice. Finish it for 3 bonus bones!"*
  - Show a small "Extra practice" chip in the top bar during that run, so the missing per-answer bones don't look like a bug.
  - Everything else plays and celebrates exactly as usual: right-answer sounds, streak banners, the stars animation, fanfare, MASTERED.
  - The finish screen's bone breakdown includes the line *"3 extra practice bones"*.
- **Grown-ups area:** update the rules note so it explains the 2 normal runs per level per day, the +3 extra practice bonus, and the +3 per new star.
- **Bonnie's voice:** add the new lines to the lists `tools/make-voice.mjs` reads, and say which ones are new.
- **Tests:** add a core test that plays a fake 10-question level 5 times in one day (3 stars on the first play) and expects **38** bones. Also cover:
  - a new day resets the count
  - quitting after one answer uses up a normal run
  - leaving before answering doesn't
  - a clock moved backwards doesn't reset anything
  - the ask-Bonnie bone still pays in an extra run

## Part A stages
1. **Plan:** show me the exact code changes you intend, the new save field, and Bonnie's new lines. Don't build yet.
2. **Build and test** on the branch.
3. **Go live:** bump `CACHE_VERSION` in `sw.js`, update the README, merge to main.

---

# Part B: New Maths world, Captain's Cove

## Why
At school, Harvey's class uses **Captain Conjecture**: a character who makes a maths claim (a *conjecture*). The children decide whether it's true, and prove it. Everything in the games so far is about getting answers. This world practises **reasoning**: deciding, explaining, testing and spotting mistakes. It also revises what earlier worlds taught.

## What it is

| | |
|---|---|
| File | `worlds/y2-maths-captains-cove.js` (new) |
| World id | `y2-maths-captains-cove`: stable, never rename |
| Subject / year | `maths` / `2` |
| Name | **Captain's Cove** |
| Tag | Is the Captain right? |
| Blurb | Test the Captain's conjectures and prove it! |
| Map position | **Last** on the Maths map |
| Theme | A pond cove with a little pirate raft and three treasure chests |

**The captain:** create our **own** character. Don't copy any school's Captain Conjecture drawing. Working name: **Captain Croak**, a frog in a pirate hat on a lily-pad raft. (I'll check the name with Harvey; keep it in one constant so it's easy to change.) He makes bold claims and calls them his *conjectures*, so the word matches school. **Bonnie stays the helper:** "Let's test the Captain's conjecture!" The Captain is sometimes wrong. That's the point, and it should be funny, never mean ("Shiver me lily pads, you've busted my conjecture!").

Follow everything already in place:
- `MeadowMaths.world({...})` from the kit
- questions made with `gq()`, each carrying its own clue and step card
- the help ladder (only tiers 2 and 3 count as help)
- easy numbers when the engine eases off
- the standard stars and the Part A bone rules
- the storybook look, tablet-first, reduced motion respected

## The content rule
Only use maths from the Year 2 worlds Harvey already has: place value to 100, number bonds and facts to 20, tens facts, 2-digit adding and taking away, the 2, 5 and 10 times tables, sharing and grouping, and halves, quarters, thirds and three quarters. Odd and even can be introduced here, because it's Year 2 and links to the 2 times table.

**Every claim must be correct.** Keep the claims as data, and give each one a `check` function where possible, so a test can try lots of numbers and confirm "always" claims never fail and "never" claims never hold. A wrong "answer key" would teach the wrong thing.

## Levels

Each level has a stable `id`, `name`, `blurb`, `eg`, a `seq` of about 8 questions, and `make(type, k, easy)`.

| # | id | Name | How it plays | Example |
|---|---|---|---|---|
| 1 | `true-false` | True or False? | The Captain makes a claim. Tap **True** or **False**, then **"How do you know?"**: pick the best of 3 reasons | "36 + 20 = 56." True, *because 3 tens and 2 tens make 5 tens* |
| 2 | `always-sometimes-never` | Treasure Chests | Drop each claim into the **Always**, **Sometimes** or **Never** chest | "Adding 10 keeps the ones digit the same" = always; "Half of a number is a whole number" = sometimes; "12 − 5 = 5 − 12" = never |
| 3 | `test-the-captain` | Test the Captain | The Captain claims something that sounds right. Pick numbers to test it; the game shows each result. Finding a **counterexample** busts the claim. Some claims survive every test, and then you agree they look true | "Every number in the 5 times table ends in 5." Testing 10 busts it |
| 4 | `spot-the-mistake` | Spot the Mistake | The Captain shows his working in 2 to 3 steps with one error. Tap the wrong step, then fix it | 45 + 38: he forgot to exchange 10 ones for a ten |
| 5 | `prove-it` | Prove It! | Show the Captain why with a picture, using the kit's counters, arrays, blocks or burrow frame | "Odd + odd = even": pair up the counters so none are left over; "3 × 4 = 4 × 3": turn the array |
| 6 | `odd-one-out` | Odd One Out | Pick which item doesn't belong, then pick the reason. More than one answer can be right, as long as the reason matches | 10, 15, 20, 24: 24 (not in the 5 times table) or 15 (odd) |

**Easy mode:** smaller numbers, two choices instead of three, and claims from earlier worlds only.

### Scoring and help
- A wrong True/False, chest, step or odd-one-out pick is a **mistake** for stars, the same as any other world. A wrong "How do you know?" reason is also a mistake.
- **Clue (tier 1):** Bonnie suggests a way in. For example: "Try a few numbers!", "Look at the ones digit", "Can you make pairs?"
- **Step card (tier 2):** small questions that walk through it. For "5 times table numbers end in 5": "What's 5 × 2?" → 10, "Does 10 end in 5?" → No, "So is the Captain always right?" → No.
- **Glowing buttons (tier 3):** as the kit already does.
- For **Test the Captain**, choosing test numbers is exploring, not answering: only the final verdict ("Busted!" or "Looks true!") is marked.
- Word problems use the player's name and Bonnie, as in the other worlds.

### New kit pieces (make them reusable)
Add any new screens to the kit as reusable question kinds, so later worlds (Year 3 reasoning, English "is this sentence right?") can use them:
- a two-step **verdict + reason** choice
- **three-chest sorting**
- a **"test it"** number picker with a running results list
- **tap the wrong step** in worked steps

## Also needed
- **Page:** the `<script>` line in `meadow-maths.html`, last in the world list.
- **Offline:** add the new file to the service worker's list, and bump `CACHE_VERSION`.
- **Voice:** the Captain and Bonnie's new lines go into the lists `tools/make-voice.mjs` reads. If the Captain should have a different voice from Bonnie, say what's needed and I'll record it.
- **Clubhouse:** check the Maths stars total goes up automatically.
- **README:** add the world to the Meadow Maths section.
- **Tests:** a test page that makes every kind of question and checks every claim's truth value with its `check` function.

## Part B stages
1. **Plan:** the Captain's design (describe it, or a quick sketch on a test page), the claim bank (at least 10 per level, each marked true/false or always/sometimes/never, with its check), and 2 example questions per level with their clue and step card. Don't build yet.
2. **Levels 1 to 3** and the new kit pieces they need.
3. **Levels 4 to 6.**
4. **Polish and go live:** voice lines, offline list, README, tests. Merge to main.

Start with **Part A, Stage 1** only.
