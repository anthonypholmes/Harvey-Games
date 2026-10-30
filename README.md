# Harvey's Number Splitter

A Year 2 (Key Stage 1) maths game for iPad, built for Harvey with help from Bonnie, the family's brown cockapoo.

Two worlds:

- **The Partitioning Park:** splitting numbers into tens and ones (for example 47 = 40 + 7), with base-ten blocks and counters.
- **The Stepping Stone River:** number lines from 0 to 100. Harvey drags Bonnie along the line to find numbers.

The game is designed around resilience. There are no timers, no lives and no red "wrong" screens. Asking Bonnie for help never costs anything.

## Playing it

Open `index.html` in Safari on the iPad. To make it feel like an app, tap **Share → Add to Home Screen**.

The first time it opens, Bonnie asks for the player's name.

### The Partitioning Park (8 paths)

| | Path | What it practises |
|---|---|---|
| 1 | Teen Numbers | 11 to 19 as a ten and some ones |
| 2 | Tens and Ones | 2-digit numbers |
| 3 | Missing Parts | 63 = 60 + ? |
| 4 | Hundreds | 3-digit numbers |
| 5 | Tricky Zeros | Numbers like 405 |
| 6 | Split It Another Way | 45 = 30 + 15 (swapping a ten for ten ones) |
| 7 | Thousands | 4-digit numbers (stretch) |
| 8 | Partition to Add | 34 + 25 by adding tens, then ones |

### The Stepping Stone River (5 stones)

| | Stone | What it practises |
|---|---|---|
| 1 | Full Tick Trails | Missing numbers on fully marked lines (0–20, 0–50) |
| 2 | Stepping Stones | Counting on and back in 2s, 5s and 10s |
| 3 | Midpoint Explorers | Estimating on a line with only 0, 50 and 100 marked (within 2 counts as right) |
| 4 | Tens Boundaries | Which two tens a number sits between |
| 5 | Froggy Jumps | Adding and taking away ones and tens by jumping along the line |

## How Bonnie helps

The **Ask Bonnie** button, or a wrong answer, moves one step up a help ladder:

1. **Clue:** a short spoken hint, with the important part of the picture glowing.
2. **Step by step:** a card of small questions, each with big buttons to tap.
3. **Guided:** the exact buttons to press glow, or a green zone shows where Bonnie goes.

Harvey always gives the final answer himself.

The game also adjusts the difficulty quietly. After two answers in a row that needed step-by-step or guided help, the next questions get easier, for example smaller numbers or extra labels. After two answers in a row done solo or with just a clue, it goes back to normal. Nothing on screen shows this.

## Bones and the Bone Shop

- Harvey earns **1 bone for every question finished** (however it was solved) and **3 bonus bones per level**.
- A full play-through gives 88 bones in the Park and 60 in the River.
- The **Bone Shop** button lists real-life prizes. When he has enough bones he taps **Redeem**, and a grown-up holds a button for 3 seconds to say yes.

## For grown-ups

Tap the faded gear icon in the top-right of the home screen and answer the times-table question. From there you can:

- change the player's name
- set or reset the bone balance
- add, edit or delete prizes (title, description and cost)
- see which prizes have been claimed, with dates
- see a table for each level: how many answers were solo, after a clue, step by step or guided, and how many questions were made easier
- turn sound, read-aloud and "open all levels" on or off, or reset progress

## Saved progress

Progress, bones and prizes are saved **in the browser on that device** (in `localStorage`). Nothing is sent anywhere.

This means:

- Each device has its own progress.
- Clearing Safari's website data, or browsing in a Private tab, starts afresh.
- Updating the game file keeps progress, as long as the page address stays the same.

## Hosting with GitHub Pages

1. Make sure the game file in the repository is called `index.html`.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then **Save**.
4. After a minute the game is live at `https://<your-username>.github.io/<repository-name>/`.

## Updating the game

The whole game is one file, `index.html`, so updating it means replacing that file.

**On github.com (easiest):**

1. Open the repository and click **Add file → Upload files**.
2. Drag in the new `index.html`. It replaces the old one.
3. Add a short note such as "Add Froggy Jumps" and click **Commit changes**.

GitHub Pages updates itself within a minute or two. On the iPad, pull down to refresh.

**From a computer with Git:**

```bash
git add index.html README.md
git commit -m "Describe the change"
git push
```

## Technical notes

- A single HTML file with plain JavaScript. There is nothing to install or build.
- The only outside requests are the two Google Fonts (Fredoka and Nunito). The game still works without them, using fallback fonts.
- Bonnie's voice uses the device's built-in speech. The game picks the most natural British English voice available, preferring enhanced or premium ones. On an iPad you can download a better voice in **Settings → Accessibility → Spoken Content → Voices → English → (UK voices)**. If speech isn't available, Bonnie plays a short chime instead.
