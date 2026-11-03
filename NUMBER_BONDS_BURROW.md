# New Maths world: Number Bonds Burrow

> **For Claude Code.** Read this whole file, then `README.md` and `worlds/y2-maths-kit.js`, before changing anything. Work on a new branch (`world-number-bonds`). Stop after **each stage** below so I can test on the iPad. I'm not a developer, so finish each stage with a plain-English summary and a short test checklist (what to tap, what I should see).

---

## Why this world

Year 2 maths expects children to **recall and use addition and subtraction facts to 20 fluently, and derive related facts up to 100**. It also expects them to add and subtract with 2-digit numbers, add three 1-digit numbers, know that addition can be done in any order but subtraction can't, and use the inverse to check answers and solve missing number problems.

Meadow Maths currently only touches this through Partition to Add and Froggy Jumps. This world fills the gap. It's the foundation almost every other maths topic leans on.

## What it is

| | |
|---|---|
| File | `worlds/y2-maths-number-bonds.js` (new) |
| World id | `y2-maths-number-bonds`: stable, never rename |
| Subject / year | `maths` / `2` |
| Name | **Number Bonds Burrow** |
| Tag | Adding and taking away |
| Blurb | Help Bonnie dig up number facts in the rabbit burrows. |
| Map position | **Second**, straight after The Partitioning Park. Progress is stored by id, so reordering is safe |
| Theme | A meadow bank full of rabbit burrows. Bones and carrots are the counters. A **burrow frame** (a ten frame drawn as 10 burrow holes, two rows of 5) is the main picture |

It must follow everything already in place: `MeadowMaths.world({...})` from the kit, questions made with `gq()` (each with its own clue and step card), the help ladder (only tiers 2 and 3 count as help), the easy numbers when Bonnie eases off, the standard stars and bones from the core, and the storybook look. **No changes to the core rules.**

## Levels

Each level has a stable `id`, a `name`, `blurb`, `eg`, a `seq` of about 8 to 9 questions (like the other maths worlds), and `make(type, k, easy)`. The `easy` numbers are used when the engine eases off.

| # | id | Name | What it practises | Example | Easy version |
|---|---|---|---|---|---|
| 1 | `bonds-10` | Bonds to 10 | Pairs that make 10, both ways round | 7 + ? = 10, 10 − 3 = ? | Pairs to 5 and 6 |
| 2 | `bonds-20` | Bonds to 20 | Facts within 20, including crossing 10 (bridge through 10 on the burrow frame) | 8 + 5 = 13, 14 − 6 = 8 | No crossing 10 |
| 3 | `tens-facts` | Tens Facts | Related facts to 100: use a bond to 10 to answer with tens | 3 + 7 = 10, so 30 + 70 = 100; 80 − 50 = 30 | Totals to 50 |
| 4 | `add-ones-tens` | Ones and Tens | A 2-digit number add or take away ones, and add or take away tens | 46 + 3, 46 + 30, 58 − 20 | No crossing a tens boundary |
| 5 | `two-digit` | Two-Digit Diggers | 2-digit ± 2-digit, by partitioning or jumping on the number line | 34 + 25 = 59, 67 − 24 = 43 | No exchanging |
| 6 | `three-numbers` | Three Little Numbers | Adding three 1-digit numbers, by spotting a bond to 10 first | 4 + 6 + 3 = 13 | Totals to 10 |
| 7 | `fact-families` | Fact Families | Missing numbers, inverse checks, and "any order?" | ? − 8 = 7; 9 + 6 = 15, so 15 − 6 = ?; true/false: 5 − 3 = 3 − 5 | Numbers within 10 |

Mix in a word problem now and then (as Array Orchard does), using the player's name and Bonnie. For example: *"{N} has 12 carrots. Bonnie eats 5. How many are left?"*

### Help ladder for every question
- **Clue (tier 1):** Bonnie points at the useful thing. For example: "Fill the burrow to 10 first!", "Use the bond 3 + 7", "Count on from the bigger number."
- **Step card (tier 2):** small questions that walk through the method. For crossing 10 with 8 + 5: "How many more to make 10?" → 2, "How many are left of the 5?" → 3, "10 and 3 more is?" → 13.
- **Glowing buttons (tier 3):** as the kit already does.
- The final answer is always entered by the child, as in the other worlds.

### Pictures
- Reuse the kit's existing visuals wherever they fit: base-ten blocks, counters, number lines and froggy jumps (`JUMPS`, `jumpOpts`).
- The **burrow frame** is new. Build it as a reusable kit visual (`vis: { type: 'burrow', … }`, with one or two frames for numbers up to 20) so later worlds can use it too. Tapping a hole drops or removes a bone, like the bowls in Sharing Pond. Keep it tablet-friendly, and respect reduced motion.

## Also needed
- **Bonnie's voice:** add any new spoken lines to the lists `tools/make-voice.mjs` reads, so I can record them. Say which lines are new.
- **Offline:** add the new file to the service worker's file list and bump `CACHE_VERSION` in `sw.js`.
- **Page:** add the `<script>` line in `meadow-maths.html`, in the right place for map order.
- **Clubhouse:** the Maths card's stars total should go up automatically. Check that it does.
- **README:** add the world to the Meadow Maths section.
- **Tests:** if there are browser tests for the other worlds, add matching ones (each level makes valid questions, answers are correct, easy mode stays in range).

## Stages (stop after each)
1. **Plan:** confirm the level list, the burrow frame design and the map position, and show me 2 example questions per level, including their clue and step card. Don't build yet.
2. **Levels 1 to 3** with the burrow frame, live on the branch.
3. **Levels 4 to 7.**
4. **Polish and go live:** voice lines, offline file list, README, tests. Merge to main.

Start with **Stage 1** only.
