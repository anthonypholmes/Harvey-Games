# Captain's Cove: the plan (Part B, Stage 1)

Nothing is built yet. This is what Stages 2 to 4 will make.

- **The Captain:** see `tests/captain-croak-sketch.html`.
- **The claim bank:** every claim is code with a check, in `docs/captains-cove-claims.js`.
- **The checker:** run `node docs/captains-cove-check.mjs`. It makes over 130,000 questions and confirms every answer key. Today it says **✓ Every claim checks out**.

---

## 1. Captain Croak

| | |
|---|---|
| Who | A cheerful frog pirate who floats on a lily-pad raft. The raft has a twig mast and a leaf sail. |
| Look | Drawn flat like Bonnie, with no outlines. Green, with a pale belly, big round eyes and pink cheeks. He wears a dark pirate hat with a **gold lily badge** (no skull or crossbones) and a red neckerchief. He's our own drawing, not the school's Captain Conjecture. |
| Moods | **Claiming:** points a webbed hand up. **Busted:** jaw drops, hat slips, little "boing" lines. **Proud:** eyes curve shut and he grins. |
| Name | Kept in one constant, `CAPTAIN = 'Captain Croak'`, so it's easy to change after you check it with Harvey. |
| Words | He says *conjecture* every time, so it matches school: "I conjecture that…". |
| Tone | Bold and silly, never mean. When he's wrong: "Shiver me lily pads, you've busted my conjecture!" When he's right: "Arr, my conjecture survived every test!" |
| Bonnie | Still the helper: "Let's test the Captain's conjecture!" Her clues and step cards work as in every other world. |
| Motion | He bobs gently on the water. He keeps still when reduced motion is on. |

**On screen:** the Captain sits at the top of the question card with his claim in a speech scroll. Bonnie stays in her usual spot, by the Ask Bonnie button.

---

## 2. The world

| | |
|---|---|
| File | `worlds/y2-maths-captains-cove.js` |
| World id | `y2-maths-captains-cove` (never rename) |
| Name / tag | **Captain's Cove** / *Is the Captain right?* |
| Intro | Test the Captain's conjectures and prove it! A **conjecture** is an idea that might be true. Is the Captain right? |
| Icon, colours | 🐸, pond blue `#3D7FB3` with a pale tint `#E4F0F8` |
| Map | Last on the Maths map. A pond cove with the raft and three treasure chests. |
| Pages | A `<script>` line in `meadow-maths.html` (last), and one in `index.html` so the Clubhouse counts its stars. Once the file is loaded, the Maths stars total goes up by itself. |
| Offline | Add the file to `sw.js` and bump `CACHE_VERSION` to v12. |

Levels unlock in order, like every other world. Each has about 8 questions.

---

## 3. New kit pieces (reusable)

These go into `worlds/y2-maths-kit.js` as new question kinds. They use the same help ladder, the same Bonnie clue, step card and glowing-button tiers, and the same `Meadow.correct()` / `Meadow.wrong()` calls as now.

| Kind | What the child does | Used in | Later use |
|---|---|---|---|
| `verdict` | Two taps. First the answer (True / False, or one of 4 items), then **"How do you know?"**, picking the best of 3 reasons. A wrong tap at either step is a mistake. | Levels 1 and 6 | English "Is this sentence right?" |
| `chests` | The claim sits on a scroll. Tap (or drag it into) the **Always**, **Sometimes** or **Never** chest. Easy mode shows only Always and Never. | Level 2 | Any sorting into 2 or 3 groups |
| `tester` | 6 test buttons. Each tap adds a line to a results list, such as "10 ends in 0 ✗" (a fail goes red). The verdict buttons, **Busted!** and **Looks true!**, appear after 2 tests, or straight away once something busts it. Only the verdict is marked. | Level 3 | Year 3 reasoning |
| `steps` | The Captain's working is shown as 2 to 6 step cards. Tap the wrong step, then fix it on the keypad. Tapping a right step, or a wrong fix, is a mistake. | Level 4 | Any "spot the error" |

**Level 5 (Prove It)** needs no new kind. It uses the pictures the kit already has (share into bowls, the array with "Turn the tree", baskets of 5, plates, tens and ones blocks, the burrow frame, shape shading) and finishes with a keypad or choice answer.

---

## 4. The levels and the claim bank

The full bank, with checks, is in `docs/captains-cove-claims.js`. Here's every claim in plain English.

### Level 1, `true-false`: True or False?

**How it plays:** the Captain makes a claim. Harvey taps True or False, then "How do you know?" and picks the best of 3 reasons.

**The bank:** 15 claim makers. Each one makes fresh numbers every time and decides true or false at random. The check works out the truth again from the numbers on their own.

| Maker | Example claim | Easy mode? |
|---|---|---|
| add-tens | 36 + 20 = 56 | no |
| bond-10 | 7 + 4 = 10 | yes |
| bond-20 | 18 + 2 = 20 | no |
| take-tens | 87 − 30 = 57 | no |
| times-5 | 10 × 5 = 45 | yes (up to 5 × 5) |
| times-2 | 11 × 2 = 22 | yes (up to 6 × 2) |
| times-10 | 10 × 10 = 100 | yes (up to 5 × 10) |
| half | Half of 6 is 3 | yes |
| quarter | A quarter of 12 is 6 | no |
| third | A third of 15 is 5 | no |
| place-value | 71 has 7 tens | yes |
| compare | 24 is bigger than 42 | yes |
| odd-even | 45 is even | yes (2 to 20) |
| share | 12 bones shared between 2 dogs is 6 each | yes (between 2) |
| fact-family | 8 + 7 = 15, so 15 − 7 = 9 | no |

**About the reasons:**
- The right reason is built from the numbers, for example "3 tens and 2 tens make 5 tens", or for a false claim, "Half of 12 is 6, and half of 6 is 3, not 6".
- The two wrong reasons are common muddles: "Adding tens changes the ones", "A quarter means take away 4", "Numbers in the 5 times table always end in 5".
- Wrong reasons are always statements that are false, never true-but-off-topic, so there's only one best reason.
- Easy mode shows only 2 reasons.

**Example 1: "36 + 20 = 56." Answer: True, because 3 tens and 2 tens make 5 tens.**
- **Clue:** "Look at the tens!"
- **Step card:**
  1. How many tens in 36? → **3**
  2. How many tens in 20? → **2**
  3. 3 tens and 2 tens make…? → **5 tens**
  4. So is the Captain right? → **True**
- Then the reason step, with the right reason glowing at tier 3.

**Example 2: "A quarter of 12 is 6." Answer: False, because half of 12 is 6, and half of 6 is 3.**
- **Clue:** "A quarter is half of a half!"
- **Step card:**
  1. Half of 12 is…? → **6**
  2. Half of 6 is…? → **3**
  3. So a quarter of 12 is…? → **3**
  4. Is the Captain right? → **False**

### Level 2, `always-sometimes-never`: Treasure Chests

**How it plays:** drop each claim into a chest. The check tries every number in a range (for example 0 to 89, or all pairs up to 20):
- every try works → **always**
- none works → **never**
- some do and some don't → **sometimes**

There are 30 claims: 11 always, 9 sometimes and 10 never. All 30 match their check.

**Always**
- Adding 10 keeps the ones digit the same
- Even + even makes an even number
- Odd + odd makes an even number
- Odd + even makes an odd number
- Numbers in the 10 times table end in 0
- Numbers in the 2 times table are even
- Numbers in the 5 times table end in 0 or 5
- You can add two numbers in any order and get the same answer
- You can swap the numbers when you times and get the same answer
- Adding 0 leaves a number the same
- Numbers in the 10 times table are in the 5 times table too

**Sometimes**
- Half of a number is a whole number
- Numbers in the 5 times table are odd
- Adding two numbers makes an even number
- Numbers in the 2 times table are in the 5 times table too
- A number of bones can be shared fairly between 2 dogs
- A number of bones can be shared fairly into quarters
- Adding two 1-digit numbers makes a number bigger than 10
- In a 2-digit number, the ones digit is bigger than the tens digit
- A 2-digit number is bigger than 50

**Never**
- You can swap two different numbers in a take away and get the same answer (the brief's "12 − 5 = 5 − 12")
- Odd + odd makes an odd number
- Even + even makes an odd number
- Numbers in the 10 times table end in 5
- Numbers in the 2 times table are odd
- Adding 10 changes the ones digit
- Half of an odd number is a whole number
- A 2-digit number is smaller than 10
- Three quarters of something is less than half of it
- Odd + even makes an even number

**Easy mode:** two chests (Always and Never) and only the claims about tens, 2s and 10s.

**Example 1: "Adding 10 keeps the ones digit the same." Answer: Always.**
- **Clue:** "Try a few numbers! Look at the ones digit."
- **Step card:**
  1. 23 + 10 is…? → **33**
  2. Did the ones digit change? → **No**
  3. 58 + 10 is…? → **68**
  4. Adding 10 only changes the tens. So it's… → **Always**

**Example 2: "Half of a number is a whole number." Answer: Sometimes.**
- **Clue:** "Try an even number, then an odd one."
- **Step card:**
  1. Half of 8 is…? → **4**
  2. Can you halve 7 bones without breaking one? → **No**
  3. It works for 8 but not 7. So it's… → **Sometimes**

### Level 3, `test-the-captain`: Test the Captain

**How it plays:** the Captain claims something that sounds right. Harvey taps test numbers, and each test shows a result. One fail busts the claim.

**The checks:**
- A **busted** claim must really fail somewhere in its range, and at least one of its 6 test buttons must be a counterexample.
- A **looks true** claim must never fail in its whole range.

There are 16 claims: 9 busted and 7 looks true.

| Claim | Verdict | Test buttons (the busters) |
|---|---|---|
| Every number in the 5 times table ends in 5 | Busted | 5, **10**, 15, **20**, 25, **30** |
| Every number in the 2 times table ends in 2 | Busted | 2, **4**, **6**, 12, 22, **8** |
| Odd + odd makes an odd number | Busted | all six pairs bust it |
| Half of any number is a whole number | Busted | 4, 6, **7**, 10, 12, **9** |
| Any number of bones can be shared fairly between 2 dogs | Busted | 8, 10, 12, **13**, 14, 16 |
| Every number between 10 and 20 is even | Busted | 12, 14, 16, **11**, 18, **15** |
| In every 2-digit number, the tens digit is bigger than the ones digit | Busted | 21, 43, 52, **37**, 61, 85 |
| Two numbers that make 10 are both odd | Busted | 1+9, 3+7, **4+6**, 7+3, 9+1, **2+8** |
| Every even number is in the 10 times table | Busted | 10, 20, **4**, 30, 40, **16** |
| Adding 10 keeps the ones digit the same | Looks true | 23, 47, 8, 61, 35, 79 |
| Every number in the 10 times table ends in 0 | Looks true | 10, 20, 30, 50, 70, 100 |
| Odd + odd makes an even number | Looks true | 1+3, 5+7, 3+9, 7+7, 9+11, 5+13 |
| Swapping the numbers when you add gives the same answer | Looks true | 3+5, 7+2, 9+6, 4+8, 10+5, 6+1 |
| Doubling a number always makes an even number | Looks true | 3, 5, 7, 4, 9, 6 |
| Every number in the 10 times table is in the 5 times table too | Looks true | 10 to 60 |
| Every number in the 2 times table is even | Looks true | 2, 6, 10, 14, 18, 24 |

Buttons are shuffled each time, so a buster is never always in the same place.

**Easy mode:** only claims about 2s, 5s, 10s and halves, with 4 test buttons.

**Example 1: "Every number in the 5 times table ends in 5." Answer: Busted (10).**
- **Clue:** "Try a few numbers!"
- **Step card** (as in the brief):
  1. What's 5 × 2? → **10**
  2. Does 10 end in 5? → **No**
  3. So is the Captain always right? → **No** (the Busted! button glows)

**Example 2: "Doubling a number always makes an even number." Answer: Looks true.**
- **Clue:** "Try an odd number too!"
- **Step card:**
  1. Double 3 is…? → **6**
  2. Is 6 even? → **Yes**
  3. Double 7 is…? → **14**
  4. Did any test bust it? → **No** (Looks true! glows)

### Level 4, `spot-the-mistake`: Spot the Mistake

**How it plays:** the Captain shows his working in steps, and exactly one step is wrong. Harvey taps it, then fixes it.

**The check** reads every step back as plain sums ("40 + 30 = 70", "Split 9 into 3 and 6", "Half of 12 is 6") and confirms:
- every right step is true
- the Captain's wrong step really is false
- there's exactly one wrong step

There are 12 mistake makers.

| Maker | Example (✗ = the Captain's mistake) | Easy? |
|---|---|---|
| add-exchange | 45 + 38: 40 + 30 = 70 · 5 + 8 = 13 · ✗ 70 + 13 = 73 (he forgot the ten from the ones) | no |
| take-partition | 52 − 18: 52 − 10 = 42 · ✗ 42 − 8 = 35 | no |
| count-5s | 5 × 5: 5, 10, 15, 20, ✗ 26 | yes |
| partition | 94: 9 tens and 4 ones · ✗ 9 tens is 9 · 94 = 90 + 4 | yes |
| bridge-10 | 7 + 9: 7 needs 3 · ✗ split 9 into 3 and 7 · 10 + 6 = 16 | yes |
| half-split | Half of 82: half of 80 is 40 · ✗ half of 2 is 2 · 40 + 1 = 41 | no |
| share-count | 18 between 3: 3, ✗ 7, 9, 12, 15, 18 used | yes (between 2) |
| three-add | 4 + 8 + 6: 4 + 6 = 10 · ✗ 10 + 8 = 17 | yes |
| fact-family | 7, 8, 15: 7 + 8 = 15 · 15 − 8 = 7 · ✗ 15 − 7 = 9 | no |
| count-on-10s | From 28: 38, 48, ✗ 59, 68 | yes |
| quarter-halve | A quarter of 12: ✗ half of 12 is 7 · half of 6 is 3 | no |
| missing-add | □ + 14 = 17: ✗ 17 − 14 = 4 · Check: 3 + 14 = 17 | yes |

**Easy mode:** smaller numbers, 2 to 3 steps, and only the makers marked yes.

**Example 1: 45 + 38. The wrong step is "70 + 13 = 73"; the fix is 83.**
- **Clue:** "Check each step. Did he use the ten from the ones?"
- **Step card:**
  1. Is 40 + 30 = 70 right? → **Yes**
  2. Is 5 + 8 = 13 right? → **Yes**
  3. 70 + 13 is…? → **83**
  4. So which step is wrong? → **Step 3** (it glows, then fix it to 83)

**Example 2: 7 + 9, making 10 first. The wrong step is "Split 9 into 3 and 7"; the fix is 6.**
- **Clue:** "Do the two parts add back to 9?"
- **Step card:**
  1. 3 + 7 is…? → **10**
  2. Is that 9? → **No**
  3. 3 and what make 9? → **6**

### Level 5, `prove-it`: Prove It!

**How it plays:**
1. The Captain makes a claim, and it's always true here.
2. Harvey proves it with a picture.
3. He answers one question about what the picture shows.

All 13 claims are checked true.

| Claim | Picture |
|---|---|
| 7 + 5 is even (odd + odd) | share into 2 bowls: nothing left over |
| 3 × 4 = 4 × 3 | array, then "Turn the tree" |
| 34 + 10 keeps the ones digit | tens and ones blocks: add a ten |
| 6 + 3 = 3 + 6 | burrow frame, bones and carrots |
| Half of 14 is 7 | share into 2 bowls |
| 12 shared between 3 is 4 each | share into 3 bowls |
| 25 is in the 5 times table | baskets of 5: none left |
| 8 + 5 = 13 | burrow frame: fill 10 first |
| 63 = 60 + 3 | tens and ones blocks |
| 12 is even | share into 2 bowls |
| Double 6 is 12 | array with 2 rows |
| 2 quarters make a half | shape shading |
| 4 × 2 = 8 | plates of 2 |

**Easy mode:** smaller numbers, and Bonnie does the first tap.

**Example 1: "7 + 5 is even." Harvey shares 12 bones into 2 bowls. Answer: no bones left over.**
- **Clue:** "Can you make pairs?"
- **Step card:**
  1. Tap "One each" until the pile is gone (an action step)
  2. Is any bone left over? → **No**
  3. So 7 + 5 is… → **even**

**Example 2: "3 × 4 = 4 × 3." Harvey uses an array of 3 rows of 4. Answer: 12 both ways.**
- **Clue:** "Turn the tree and count again."
- **Step card:**
  1. How many apples? → **12**
  2. Tap "Turn the tree" (an action step)
  3. How many now? → **12**

### Level 6, `odd-one-out`: Odd One Out

**How it plays:** four numbers. Harvey picks the one that doesn't belong, then picks the reason. **Any pick is right if a reason makes it the only one.**

There are 10 reasons:
- odd
- even
- not in the 5 times table
- not in the 10 times table
- in the 10 times table
- only 1 digit
- more than 50
- less than 50
- a different number of tens
- a different ones digit

**The sets:** 10 kinds of set are made fresh each time:
- three in the 5 times table
- three evens
- three odds
- three in the 10 times table
- three with the same tens digit
- three with the same ones digit
- three big
- three small
- three 2-digit and one 1-digit
- the brief's own set: 10, 15, 20, 24

The check works out every right pick for each set. It confirms there's at least one right pick, and that not every number is right. For example, for 10, 15, 20, 24:
- **15:** "15 is odd and the others are even"
- **24:** "24 is not in the 5 times table"

After the pick, the 3 reasons offered are:
- one right reason for **that** number
- two reasons that aren't true for it

Picking a number with no reason that fits is a mistake.

**Example 1: 10, 15, 20, 24. Right answers: 15 (odd) or 24 (not in the 5 times table).**
- **Clue:** "Look for something three of them share."
- **Step card:**
  1. Which number is odd? → **15**
  2. Are the others even? → **Yes**
  3. So the odd one out is… → **15** (then the reason step)

**Example 2: 41, 61, 51, 12. Right answer: 12 (even, and a different ones digit).**
- **Clue:** "Look at the ones digits."
- **Step card:**
  1. What do 41, 61 and 51 end in? → **1**
  2. What does 12 end in? → **2**
  3. So the odd one out is… → **12**

---

## 5. Scoring, help and easy mode

These are the same rules as every world.

**Mistakes for stars:**
- a wrong True/False, chest, verdict, step or odd-one-out pick
- a wrong reason
- a wrong fix

**Not a mistake:** choosing test numbers in Level 3.

**Help:**
- **Tier 1** is Bonnie's clue, and it isn't counted as help.
- **Tier 2** is the step card, and **Tier 3** is the glowing buttons. Both count as help.
- The ask bone pays as Part A says.

**Easy mode:** two quiet helped answers in a row switch it on. It brings:
- smaller numbers
- 2 choices instead of 3
- claims from earlier worlds only

**Word problems:** they use the player's name and Bonnie, for example "Harvey shares 12 bones between 2 dogs…".

**Bones:** Part A's rules, with nothing new in the world file.

---

## 6. Voice

- **Bonnie's new lines** go in the world's `lines()` list, as before. For example: "Let's test the Captain's conjecture!", the clues, and the step card questions with no numbers.
- **The Captain should sound different from Bonnie.** I suggest a separate ElevenLabs voice: a warm, jolly, slightly growly "pirate uncle". To make that work:
  - I'd add a `captainLines()` list and a `--captain-voice` option to `tools/make-voice.mjs`.
  - His clips would be saved with his voice's id, so they never mix with Bonnie's.
  - **The Captain's voice ID is `PPzYpIqttlTYA83688JI`** (chosen on 4 November 2026). Bonnie's is `4CrZuIW9am7gYAxgo2Af`.
- Lines with changing numbers ("Every number in the 5 times table ends in 5") use the device voice, as the other worlds do. Fixed lines, like his catchphrases and the chest and verdict words, get recorded.

---

## 7. Tests (Stage 4)

`tests/captains-cove-test.html` will:
- make every kind of question in normal and easy mode, hundreds of times each
- run each claim's check (Level 1 truth, Level 2 chests, Level 3 verdicts and busters, Level 4 single mistake, Level 5 truth, Level 6 right picks)
- check that every step card's buttons include its answer and that its last step gives the answer
- leave the save untouched

The checker in this plan already does the claim part.

---

## 8. Stages

2. **Levels 1 to 3**, plus the new `verdict`, `chests` and `tester` kinds. Move the claim bank into the world file. Add the world to the page so it can be played.
3. **Levels 4 to 6**, plus the `steps` kind. Level 6 reuses `verdict`.
4. **Polish and go live:**
   - map art
   - voices (Bonnie, and the Captain if you've chosen his voice)
   - `sw.js` v12
   - README
   - test page
   - merge to main
