# New Maths world: The Clock Tower (time)

> **For Claude Code.** Read this file, `briefs/HARBOUR_MARKET.md`, `README.md` and `worlds/y2-maths-kit.js` before changing anything. Built on the `redesign-1-1` branch, for 1.1 (decided by Anthony 23 November 2026). Stop after each stage so Anthony can try it; finish each with a plain-English summary and a short checklist of what to tap and what to see.

## Why this world

Year 2 maths (time): compare and sequence intervals of time; tell and write the time to five minutes, including quarter past and quarter to the hour, and draw the hands on a clock face to show these times; know the number of minutes in an hour and the number of hours in a day. (O'clock and half past are Year 1, so level 1 is a gentle start.) Meadow Maths doesn't cover time yet.

## What it is

| | |
|---|---|
| File | `worlds/y2-maths-time.js` (new) |
| World id | `y2-maths-time`: stable, never rename |
| Subject / year | `maths` / `2` |
| Name | **The Clock Tower** |
| Tag | Telling the time |
| Blurb | Help Bonnie read the big clock and keep the meadow on time. |
| Map position | After Harbour Market, before Captain's Cove |
| Theme | A stone clock tower on a hill above the harbour, with a big friendly clock face, a weather vane and pigeons. Bonnie's day (breakfast, a walk, bath time, bed) for the word problems |

Same rules as every maths world: `MeadowMaths.world({...})`, `gq()` questions with their own clue and step card, the help ladder, easy numbers when Bonnie eases off, standard stars and bones, the storybook look. **No changes to the core rules.** Times are written and said in words, the way Year 2 learns them ("quarter past 3", "20 to 9"); digital times (3:15) are Year 3, so they don't appear.

## Levels

About 8 questions each, with the engine's 2 warm-ups.

| # | id | Name | What it practises | Answer | Easy version |
|---|---|---|---|---|---|
| 1 | `oclock-half` | O'Clock and Half Past | Reading o'clock and half past | Pick 1 of 3 | O'clock only |
| 2 | `quarters` | Quarter Past and To | Reading quarter past and quarter to | Pick 1 of 3 | Quarter past only |
| 3 | `five-minutes` | Five-Minute Steps | Reading the time to five minutes, past and to, counting round in 5s | Pick 1 of 3 | "Past" times only |
| 4 | `set-clock` | Set the Clock | Moving the minute hand (the hour hand follows, as on a real clock) to show a time | Set the clock | O'clock, half past and quarters |
| 5 | `minutes-hours` | Minutes and Hours | 60 minutes in an hour, 24 hours in a day, half an hour is 30 minutes, a quarter of an hour is 15 | Number box | The hour and half an hour |
| 6 | `how-long` | How Long? | The time between two clocks, in minutes or hours; which takes longer | Number box, or pick 1 of 2 | Whole and half hours |
| 7 | `later` | Before and After | The time 15, 30 or 60 minutes later or earlier; putting a day in order | Pick 1 of 3 | One hour later |

### Examples (two per level), with the clue and the step card

1. **O'Clock and Half Past**
   - The clock shows 4:00. *"What time does the clock say?"* **4 o'clock · half past 4 · 12 o'clock**. Clue: *"The long hand points straight up to 12. That means o'clock!"* Steps: *"Where is the long hand?"* → at the 12; *"Where is the short hand?"* → at the 4.
   - The clock shows 7:30. **half past 7 · 7 o'clock · half past 6**. Clue: *"The long hand points down to 6. That's half past!"* Steps: *"The long hand is at the 6, so it's half past…"*; *"The short hand has just gone past which number?"* → 7.
2. **Quarter Past and To**
   - 3:15: **quarter past 3 · quarter to 3 · half past 3**. Clue: *"The long hand is at the 3. A quarter of the way round."*
   - 8:45: **quarter to 9 · quarter past 8 · quarter to 8**. Clue: *"The long hand is at the 9. There's a quarter to go until 9 o'clock."* Steps: *"Which hour is the short hand nearly at?"* → 9.
3. **Five-Minute Steps**
   - 2:20: **20 past 2 · 4 past 2 · 20 to 2**. Clue: *"Count round in 5s from the 12."* Steps: tap the numbers round the clock to count (5, 10, 15, 20); *"So how many minutes past?"* → 20.
   - 6:35: **25 to 7 · 35 to 6 · 25 past 6**. Clue: *"It's past the 6, so count the minutes to the 12."* Steps count back in 5s from the 12.
4. **Set the Clock**
   - *"Show half past 5."* The clock with big **+5 minutes** and **−5 minutes** buttons (tapping is easier than dragging, and works with VoiceOver); the hour hand moves along with the minute hand. Clue: *"Half past: the long hand points down to 6."*
   - *"Show 10 to 4."* Clue: *"10 to means 10 minutes before 4 o'clock: the long hand is at the 10."*
5. **Minutes and Hours**
   - *"How many minutes are in an hour?"* □ (60). Clue: *"The long hand goes all the way round in one hour. Count round in 5s!"*
   - *"How many minutes is half an hour?"* □ (30). Steps: *"An hour is 60 minutes. What's half of 60?"* → 30.
6. **How Long?**
   - Two clocks, 2 o'clock and half past 2: *"Bonnie's walk started at 2 o'clock and ended at half past 2. How long was it?"* □ minutes (30). Clue: *"How far did the long hand go round?"*
   - *"Which takes longer: 20 minutes or half an hour?"* **half an hour · 20 minutes**. Clue: *"How many minutes is half an hour?"*
7. **Before and After**
   - *"It's quarter past 3. What time will it be in 30 minutes?"* **quarter to 4 · quarter past 4 · half past 3**. Clue: *"30 minutes moves the long hand half way round."* Steps use the clock: move the minute hand on 30 minutes.
   - *"Put Bonnie's day in order: what comes first?"* **breakfast · bath time · bedtime**. Clue: *"What does Bonnie do when she wakes up?"*

## Pictures (new in the kit, so later worlds can use them)

- **The clock face** (`vis: { type: 'clock', … }`): our own drawing, a big round face with 1 to 12, the five-minute marks, a short thick hour hand and a long thin minute hand in different colours, and the hour hand in the right place between numbers (at half past 7 it is half way between 7 and 8). About 200 points across on an iPhone SE so the numbers stay 16px or more. Tapping a number while counting round lights it.
- **Set the Clock** (`inter: 'clock'`): the clock plus big +5 and −5 minute buttons (44 × 44 points or more); VoiceOver says the time shown ("The clock shows 25 past 4").
- **Two clocks side by side** for How Long?, which stack on a narrow phone.
- **Bonnie's day** cards (breakfast, walk, bath, bed), small drawings for ordering.
- Every screen fits an iPhone SE with no scrolling during a question; Reduce Motion is respected (hands move straight to the time).

## In the meadow look

- **The Maths map:** a new drawn place after the market: the clock tower on the hill above the harbour. Its clock shows the real time of day, as a little treat.
- **Bonnie on the map** (`js/meadow-look.js`): *"Shall we read the big clock?"* / *"Tick tock, to the tower!"*
- **The level map:** the tower at the top. **The journal:** a stamp with a clock face in the tower's ink.
- **Bonnie's Walk:** levels 1 and 2 join the Walk (choices).
- **Free taster:** level 1 is free.

## Also needed

- **Bonnie's voice:** the new prompts, clues and step cards (times join the number clips: "quarter past" + "3"); `npm run voice:check` gives the cost before recording.
- **Offline, pages, README, listing:** as for Harbour Market.
- **Tests:** `tests/time-test.html`: every level makes valid questions, every answer is right, hands point the right way (including the hour hand between numbers), times written and said match, the easy version stays in range, Set the Clock accepts only the right time.

## Stages (stop after each)

1. **Plan** (this file): Anthony approves the levels, examples and pictures.
2. **The clock face and Set the Clock**, and **levels 1 to 4**.
3. **Levels 5 to 7.**
4. **With Harbour Market:** the map place, journal stamp, level-map art, Bonnie's lines recorded, offline list, tests, README.
