# New Maths world: Harbour Market (money)

> **For Claude Code.** Read this file, `briefs/CLOCK_TOWER.md`, `README.md` and `worlds/y2-maths-kit.js` before changing anything. Built on the `redesign-1-1` branch, for 1.1 (decided by Anthony 23 November 2026). Stop after each stage so Anthony can try it; finish each with a plain-English summary and a short checklist of what to tap and what to see.

## Why this world

Year 2 maths (money): recognise and use the symbols for pounds (£) and pence (p); combine amounts to make a particular value; find different combinations of coins that equal the same amount; solve simple problems in a practical context involving addition and subtraction of money of the same unit, including giving change. Meadow Maths doesn't cover money at all yet, and it is one of the two biggest Year 2 topics missing (with time).

## What it is

| | |
|---|---|
| File | `worlds/y2-maths-money.js` (new) |
| World id | `y2-maths-money`: stable, never rename |
| Subject / year | `maths` / `2` |
| Name | **Harbour Market** |
| Tag | Coins, notes and change |
| Blurb | Help Bonnie count her coins and shop at the market stalls by the harbour. |
| Map position | After Sharing Pond, before Captain's Cove (the market is on the way down to the harbour). Progress is stored by id, so the order is safe to change |
| Theme | A harbour-side market: striped stalls, bunting, a fish-and-chip hatch, crates of apples. Prices on little chalkboards. Coins go in Bonnie's purse |

It follows everything already in place: `MeadowMaths.world({...})`, questions made with `gq()` (each with its own clue and step card), the help ladder (only tiers 2 and 3 count as help), the easy numbers when Bonnie eases off, the standard stars and bones, and the storybook look. **No changes to the core rules.** Real coins and notes are always in **p and £**, never bones, so the game's own bones never get mixed up with money.

## Levels

About 8 questions each (like the other maths worlds), with the 2 warm-ups the engine already adds. Every amount is said the way a child says it: "35p" is read "35 pence", "£2.50" as "2 pounds 50".

| # | id | Name | What it practises | Answer | Easy version |
|---|---|---|---|---|---|
| 1 | `coins` | Coin Spotting | Every coin and the £5 and £10 notes, their values, the p and £ signs | Pick 1 of 3 | 1p, 2p, 5p and 10p only |
| 2 | `count-coins` | Counting Coins | Totals of a few coins: the same coin first (count in 2s, 5s, 10s), then mixed, to 50p | Number box, then p | The same coin only |
| 3 | `make-it` | Make the Amount | Tap coins into the purse to make an amount, to £1 | Fill the purse | To 20p, with 10p, 5p, 2p and 1p |
| 4 | `other-ways` | Another Way | The same amount with different coins; the fewest coins | Fill the purse, or a number box | To 20p |
| 5 | `pounds` | Pounds and Pence | £1 is 100p; counting £1 and £2 coins and £5 and £10 notes; pounds and pence together, to £10 | Number box (with £ or p shown) | Whole pounds only |
| 6 | `shopping` | Market Shopping | Adding two prices at a stall; which costs more and by how much, to £1 | Number box | Totals to 20p |
| 7 | `change` | Giving Change | Change from 10p, 20p, 50p and £1, by counting on from the price | Number box | From 10p and 20p |

A word problem now and then uses the story characters (`Meadow.character()`), never the player's name: *"Sarah buys an apple for 15p. She pays with 20p. How much change does she get?"*

### Examples (two per level), with the clue and the step card

1. **Coin Spotting**
   - A drawn 20p coin: *"How much is this coin?"* Choices **20p · 2p · 50p**. Clue: *"Look at its shape. It has 7 straight sides."* Steps: *"What number is written on it?"* → 20; *"So it's 20 …?"* (pence / pounds) → pence.
   - *"Which is the £1 coin?"* Three drawn coins. Clue: *"The £1 coin is gold and has 12 sides."* Steps point at each coin in turn.
2. **Counting Coins**
   - Four 5p coins: *"How much money is there?"* □p (20). Clue: *"Count in 5s!"* Steps: tap each coin to count it (5, 10, 15, 20), then *"So how many pence?"* → 20.
   - 20p, 10p, 2p: □p (32). Clue: *"Start with the biggest coin."* Steps: *"20, then add 10 is?"* → 30; *"30 and 2 more?"* → 32.
3. **Make the Amount**
   - *"Put 35p in Bonnie's purse."* Coins 1p to 50p below; the purse shows its total as coins go in (tap a coin in the purse to take it out). Clue: *"Start with the biggest coin that fits."* Steps: *"Which coin is closest to 35p without going over?"* → 20p, then *"How much more do we need?"* → 15p, and so on.
   - *"Make 8p."* Steps as above with 5p, 2p, 1p.
4. **Another Way**
   - *"Bonnie made 20p with two 10p coins. Make 20p a different way!"* (the purse won't accept two 10p coins again). Clue: *"Could you use 5p coins?"*
   - *"What is the fewest coins that make 30p?"* □ (2). Clue: *"Try the biggest coins first."* Steps: *"Which coin is closest to 30p?"* → 20p; *"How much more?"* → 10p; *"How many coins is that?"* → 2.
5. **Pounds and Pence**
   - *"How many pence make £1?"* □p (100). Clue: *"£1 is the same as one hundred 1p coins."*
   - A £5 note and two £1 coins: *"How much is there?"* £□ (7). Clue: *"Count the note first, then count on."* Steps: *"The note is?"* → 5; *"5 and 2 more?"* → 7.
6. **Market Shopping**
   - The apple stall: apple 15p, pear 20p. *"How much for an apple and a pear?"* □p (35). Clue: *"Add the tens, then the ones."* Steps: *"15 + 20: 10 + 20 is?"* → 30; *"30 and 5 more?"* → 35.
   - *"The ball costs 45p and the kite 60p. How much more is the kite?"* □p (15). Clue: *"Count on from 45 to 60."*
7. **Giving Change**
   - *"Jack buys a lolly for 7p and pays with 10p. How much change?"* □p (3). Clue: *"Count on from 7 to 10."* Steps: *"7 and how many more make 10?"* → 3.
   - *"A comic costs 65p. Mia pays £1. How much change?"* □p (35). Clue: *"Count on: 65 to 70, then 70 to 100."* Steps: *"65 to 70 is?"* → 5; *"70 to 100 is?"* → 30; *"5 and 30 is?"* → 35.

### Help ladder
As every maths world: the clue (tier 1) points at the useful thing; the step card (tier 2) walks through the method; glowing buttons (tier 3) as the kit already does. The child always enters the final answer.

## Pictures (new in the kit, so later worlds can use them)

- **Coins and notes** (`vis: { type: 'coins', … }`): our own drawings, never copies of real coin designs and no royal portraits. Each coin is told apart by its colour, size and shape, as children learn them: copper 1p and 2p; silver 5p and 10p; silver seven-sided 20p and 50p; gold twelve-sided £1; gold and silver £2. The value is written large on each. Notes are simple rectangles in their colours (£5 teal, £10 orange-brown) with the value. Tapping a coin counts it aloud ("5, 10, 15…").
- **Bonnie's purse** (`vis: { type: 'purse', … }`, an `inter` question): a tray of coins to tap in, the purse with its running total, tap a coin in the purse to take it out. A 44 × 44 point tap target on every coin.
- **Price boards**: little chalkboards on the stall items.
- Every screen fits an iPhone SE with no scrolling during a question; Reduce Motion is respected; VoiceOver names each coin by its value ("20p coin").

## In the meadow look

- **The Maths map:** a new drawn place between Sharing Pond and Captain's Cove: striped market stalls on the harbour wall. The trail gets longer by two stops (with the Clock Tower); the map's checks allow for it.
- **Bonnie on the map** (`js/meadow-look.js`): *"Shall we count some coins at the market?"* / *"Off to the market!"*
- **The level map:** the market drawing at the top, as each place has.
- **The journal:** a stamp with a coin in it, in the market's ink.
- **Bonnie's Walk:** levels 1 and 2 join the Walk (they use choices and number boxes, which the Walk takes).
- **Free taster:** level 1 is free, like every world.

## Also needed

- **Bonnie's voice:** the new prompts, clues and step cards; `npm run voice:check` lists them and the cost. Money words ("pence", "pounds") join the number clips that already exist.
- **Offline:** add the file to `sw.js` and bump `CACHE_VERSION`. **Pages:** the `<script>` line in `meadow-maths.html` and `bonnies-walk.html` (and `index.html`, which loads every world).
- **Tests:** `tests/money-test.html`: every level makes valid questions, every answer is right, the easy version stays in range, coin totals, the purse, change never below 0.
- **README** and the App Store listing's level counts.

## Stages (stop after each)

1. **Plan** (this file): Anthony approves the levels, examples and pictures.
2. **The kit pictures** (coins, notes, purse, price boards) and **levels 1 to 4**.
3. **Levels 5 to 7.**
4. **With the Clock Tower:** the map place, journal stamp, level-map art, Bonnie's lines recorded, offline list, tests, README.
