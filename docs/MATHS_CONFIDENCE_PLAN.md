# Maths confidence pack: Stage 1 plan

The brief is `briefs/MATHS_CONFIDENCE.md`. This is the plan only: nothing is built yet. Stages 2 to 5 follow it.

---

## 1. How Bonnie's Walk switches between English and maths

**The approach: one new page, `bonnies-walk.html`, run by the engine.**

- The page loads the engine (`js/meadow-core.js`), every English world, the maths kit and the maths worlds. The Clubhouse already loads all of these, to count stars.
- It calls `Meadow.startGame()` like the two games do. That gives it the same top bar, bone bowl, Bone Shop and modal windows. Then it calls a new `Meadow.startWalk()`.
- The Walk button on the Clubhouse links to this page. 🏠 takes Harvey back to the Clubhouse.

**Why a page and not a mode inside the Clubhouse:** the Clubhouse page is drawn separately, not by the engine. The question screens, help ladders, bones and finish window all live in the engine. Building on the engine means the walk shares every rule with the games and copies nothing.

**How one walk shows both kinds of question.** Today a level is one world, and the engine draws its screen once. The walk is a "run" of 5 questions, and each question carries its own world and level. Before each question the engine:

1. Points the run at that question's world and level, so the world's own `play()`, hints and praise are used.
2. Redraws only the question area underneath the path. English questions get the usual card with Bonnie and **Ask Bonnie** beside it. Maths questions get the maths kit's full-width screen, with its own Bonnie and help buttons.
3. Moves Bonnie along the path. The path strip at the top never redraws, so it feels like one walk, not two games.

There's no page load between questions. The new question fades in, or appears straight away when reduce motion is on.

**Questions come from the worlds' own code.** English uses each level's `items`. Maths uses each level's `make()` with easy numbers (the same switch the quiet easing already uses). No world file needs changing.

**Which maths questions qualify.** The engine makes the question first, then checks its kind:

- **Allowed:** number-pad answers (`boxes`) and tap-an-answer (`choice`).
- **Left out:** dragging along a number line (`line`), building arrays square by square (`grid`), building with blocks (`build`), and all of Captain's Cove (reasoning questions with several steps).
- If a level's next question type isn't allowed, it tries that level's other types. A level with no allowed types is skipped.
- The test page will list exactly which levels and types end up in walks.

**One risk I'll check in Stage 3:** the English worlds and the maths kit have never been drawn on the same game page. Their styles are kept apart (the maths ones only apply inside the maths area), but I'll check for clashes on the iPad layout before it goes live.

**Can't fail, in the engine:**

- During a walk, `Meadow.wrong()` counts nothing and Bonnie answers warmly.
- **English:** a wrong answer climbs one rung of Bonnie's hints by itself (no bone for it). The last rung, Watch Me!, shows the answer.
- **Maths:** the maths kit already climbs a rung on a wrong answer, ending with glowing buttons.
- So every question always ends with Harvey getting it right.
- There are no stars and no star bonus in a walk.

---

## 2. The Walk button (Clubhouse)

- **Where:** a wide, friendly button between Bonnie's welcome and the two game cards. It's styled as a little meadow path, with stepping stones and paw prints.
- **What it says:**
  - **🐾 Bonnie's Walk**, with "5 quick questions" in smaller words.
  - **The streak:** on the button's right, a paw chip such as "🐾🐾🐾 3 days in a row!". It only shows when the streak is 2 days or more. With no streak, nothing shows: no zero and no sad message.
  - **If he's already walked today:** the small words become "Another walk?".
- **What Bonnie says:**
  - Tapping the button is enough to start. Bonnie says something like "Walkies! Come on {N}, five quick questions on our walk!" as the walk opens.
  - On the Clubhouse she sometimes says "Fancy a walk, {N}?" as one of her welcome lines.

## 3. The walk screen (the path)

- **The top strip:**
  - A curving meadow path across the screen, with **5 paw-print stepping stones** and a bone bowl at the end.
  - Bonnie stands on the stone for the question she's on.
  - A right answer turns that stone gold with a paw print, and Bonnie trots to the next one. With reduce motion on, she just appears there.
  - There are no "English" or "Maths" labels. In a walk the maths screen doesn't show its usual "Level name · Question 2 of 8" line.
- **Underneath:** the question, in its own world's style (see part 1).
- **🏠 Home:** asks "Stop the walk? Bonnie will wait for you." Stopping keeps the bones already earned.
- **The finish window:**
  - A happy Bonnie and a big paw stamp saying **Walk done!**
  - The bones earned, for example "5 for answers · 5 walk bonus".
  - Two buttons: **Back to the Clubhouse** and **Another walk**.
  - The streak, if it went up.

## 4. Choosing the 5 questions

- **The order for each mix:**
  - **Gentle** (the default): E, M, E, M, E.
  - **Even:** M, E, M, E, M.
  - **More maths:** M, M, E, M, M. It still has one English win, in the middle.
- **English:** a random level he has at least 1 star in, with normal difficulty. A new player with no stars gets each English world's first level.
- **Maths:**
  - **Which levels:** the first 2 levels of each maths world that's shown (Partitioning, Number Bonds, Number Lines, Arrays, Sharing), plus any maths level he already has a star in.
  - **Easy numbers** always.
  - **Never the same maths level twice in one walk**, and the topics rotate: each walk starts its maths with a different world from the last walk.
  - **Captain's Cove** is never included.

## 5. Teach Bonnie: three examples

It's built once in the maths kit, as a two-step question of the same kind as the Captain's Cove "verdict" questions:

- **Step 1:** Harvey chooses **That's right, Bonnie!** or **Oops, Bonnie!**
- **Step 2, after Oops:** Harvey types the right answer on the usual number pad.

It only uses questions with a single number for an answer.

**Bonnie's wrong answers** are the kind of slip a child really makes:

- off by one (using the kit's `near()`)
- off by ten
- digits swapped
- forgetting to exchange (46 + 7 → 43)

Each wrong answer is checked against the real one, so it can never be accidentally right, and a test will make thousands to prove it. She's wrong about 2 times in 3.

**Example 1** (Number Bonds, Bonds to 20, off by one)
> Bonnie: "I've been practising! I think **8 + 5 is 12**. Am I right, {N}?"
> Harvey taps **Oops, Bonnie!**
> Bonnie: "Oh! Thank you for checking. Can you show me the right answer?"
> Harvey types **13**.
> Bonnie: "13! Of course. You're a brilliant teacher, {N}!"

**Example 2** (Partitioning, Tens and Ones, digits swapped)
> Bonnie: "Let me try this one. 4 tens and 7 ones… I think that makes **74**. Is that right?"
> Harvey taps **Oops, Bonnie!**
> Bonnie: "Hmm, I mixed something up, didn't I? What should it be?"
> Harvey types **47**.
> Bonnie: "47! I put the tens and ones the wrong way round. Thank you, {N}!"

**Example 3** (Arrays, Times Tables Harvest: Bonnie is right this time)
> Bonnie: "I'm not sure about this one… I think **5 × 4 is 20**. Am I right?"
> Harvey taps **That's right, Bonnie!**
> Bonnie: "Phew! Thank you for checking my working, {N}!"

**If Harvey gets the check wrong:**
- **If he says she's right when she isn't**, Bonnie says "Hmm, are you sure? Let's count it together," and the usual help ladder starts.
- **If he says "Oops" when she was right**, she says "Let's check… I think I did get it this time!"

In a walk, neither can fail. In a maths level, either counts as one mistake, like any other question.

**How often:**
- **In walks:** one maths question per walk is a Teach Bonnie question, from Harvey's second walk ever onwards.
- **In maths levels:** about one level in two gets one, never as the first question. You can change that.

---

## 6. The new save fields

These are added inside the existing save (`meadow-save-v1`).
- An old save gets them empty when it loads.
- Nothing already there changes.
- The same date safety as Bones v1.1 applies: if the clock goes backwards, nothing resets and nothing is granted twice.

| Field | What it holds | Example |
|---|---|---|
| `walks` | finished walks per day (kept for 90 days), the last walk day, and the streak | `{ days: { "2026-11-09": 2 }, last: "2026-11-09", streak: 3 }` |
| `starLog` | each time a level's best stars go up | `[{ key: "y2-maths-arrays/bone-groups", from: 1, to: 2, day: "2026-11-09" }]` |
| `levelStarts` | each level started, with the date and how (kept for 90 days) | `[{ key: "y2-maths-arrays/bone-groups", day: "2026-11-09", via: "map" }]` |
| `settings.walkMix` | `"gentle"` (default), `"even"` or `"more"` | `"gentle"` |
| `settings.teachBonnie` | Teach Bonnie questions on or off | `true` |
| `settings.warmUps` | maths warm-ups on or off | `true` |

**How the walk fields work:**
- **Walk bones** use the existing "normal runs per day" count, under the id `walk/daily`. The first 2 walks a day get +1 per right answer plus a +5 walk bonus. Later walks get +3 for finishing. The ask-Bonnie bone pays every time.
- **The streak:**
  - A walk finished the day after `last` adds 1.
  - A walk finished on the same day adds nothing.
  - After a gap, a finished walk starts a new streak of 1.
  - If the date is earlier than `last` (the clock moved back), nothing changes.
  - The button only shows the streak if `last` is today or yesterday, so a missed day quietly drops it without the save changing.
- **"New stars this week"** adds up `to − from` in `starLog` for days from Monday to today, local time.

---

## 7. New lines for Bonnie to record

These will go into the lists `tools/make-voice.mjs` reads. The full list comes with each stage. So far they're:
- the walk greetings
- the warm "let's sniff it out together" lines
- the stone-by-stone praise
- the finish lines
- Teach Bonnie's fixed lines: "Am I right?", "Can you show me the right answer?", "You're a brilliant teacher, {N}!" and "Phew! Thank you for checking my working!"

Lines with changing numbers, such as "I think 8 + 5 is 12", can't be recorded ahead, so the device voice says those, as it already does for other maths sums.

## 8. Choices I've made (tell me if you want any changed)

1. **Teach Bonnie in maths levels:** in about half of levels, one question.
2. **More maths mix:** M, M, E, M, M.
3. **Walk streak chip:** only shows for 2 days or more.
4. **Stopping a walk early:** keeps the bones earned so far, but doesn't count for the streak.
