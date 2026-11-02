# Harvey's Meadow Clubhouse

An arcade home page linking Harvey's learning games. Bones earned in any game go into one shared bone bowl.

| File | What it is |
| --- | --- |
| `index.html` | **Harvey's Meadow Clubhouse**, the home page. Shows the bone total and links to each game. |
| `meadow-maths.html` | **Harvey's Meadow Maths** (described below). |
| `meadow-words.html` | **Harvey's Meadow Words**: Year 2 English, with Phonics Forest, Tricky Word Trail, Sentence Meadow and Bonnie's Story Nook. |

The player's name is entered on the Clubhouse page the first time it opens (and changed there with **✏️ Change name**). Every game uses it in titles and in Bonnie's dialogue. If a game is opened before a name has been entered, it sends the player to the Clubhouse first.

Every game has a 🏠 button that goes back to the Clubhouse. All games share one save (`harvey-splitter-v1` in `localStorage`): bones, the player's name, Bonnie's hats, themes, the real-life prize list and the record of bones spent. Each game keeps its own level progress. Meadow Words stores its stars in `meadowWords_english_v1`.

To add another game, add an entry to the `GAMES` list in the `CONFIG` block at the top of the script in `index.html`.

# Harvey's Meadow Maths

A Year 2 (Key Stage 1) maths game for iPad, built for Harvey with help from Bonnie, the family's brown cockapoo.

Four worlds:

- **The Partitioning Park:** splitting numbers into tens and ones (for example 47 = 40 + 7), with base-ten blocks and counters.
- **The Stepping Stone River:** number lines from 0 to 100. Harvey drags Bonnie along the line to find numbers.
- **The Array Orchard:** equal groups, rows of apples and the 2, 5 and 10 times tables.
- **The Sharing Pond:** sharing fairly, grouping, halves and quarters.

The player's name (entered on the Clubhouse page) is used in the game's title, throughout Bonnie's dialogue and in the story questions.

The game is designed around resilience. There are no timers, no lives and no red "wrong" screens. Asking Bonnie for help never costs anything.

## Playing it

Open `index.html` (the Clubhouse) in Safari on the iPad and pick a game.

### Installing on the iPad and playing offline

The Clubhouse is a Progressive Web App (PWA), so it can be installed and then played with no internet connection.

1. Open the site in **Safari** while online, and let the Clubhouse load fully.
2. Tap **Share → Add to Home Screen**. The icon is Bonnie with "Meadow Club".
3. Open it from the home screen. It runs full screen, like an app.

After the first visit, all three pages, the icons and the fonts are saved on the iPad, so everything works offline. When the iPad is online, the newest version of each game loads automatically.

**Saved progress and the home screen icon:** on iPad, an app added to the home screen usually keeps its own saved progress, separate from Safari. If the player has been using Safari until now, their bones and progress may not appear in the installed app. If so, a grown-up can set the bone balance in the grown-ups settings, and the name is entered again on the Clubhouse page.

The first time the Clubhouse opens, Bonnie asks for the player's name.

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

**Tens are bundles, not ones.** To avoid the "4 rods = 4" trap, every ten-rod is strapped like a bundle and carries a "10" tag, and tens and ones sit on differently tinted trays. Tapping the rods counts them in tens out loud ("10, 20, 30, 40!"), with each rod lighting up in turn. Bonnie's clue says "Those long rods are super bundles worth 10 each! Count by tens: 10, 20, 30, 40!", and her step card counts along too. Counters in the hundreds levels count in 10s or 100s the same way.

### The Stepping Stone River (5 stones)

| | Stone | What it practises |
|---|---|---|
| 1 | Full Tick Trails | Missing numbers on fully marked lines (0–20, 0–50) |
| 2 | Stepping Stones | Counting on and back in 2s, 5s and 10s |
| 3 | Midpoint Explorers | Estimating on a line with only 0, 50 and 100 marked (within 2 counts as right) |
| 4 | Tens Boundaries | Which two tens a number sits between |
| 5 | Froggy Jumps | Adding and taking away ones and tens by jumping along the line |

### The Array Orchard (5 trees)

| | Tree | What it practises |
|---|---|---|
| 1 | Bone Groups | Equal groups as repeated addition (5 + 5 + 5) |
| 2 | Grid Builder | Tap or drag to grow rows and columns of apples (up to 5 × 10) |
| 3 | The Swapping Tree | Turning the array shows 3 × 4 = 4 × 3 |
| 4 | Times Tables Harvest | 2, 5 and 10 times tables, with skip-counting help |
| 5 | Word Problems | Little stories with groups, using the player's name |

### The Sharing Pond (5 lily pads)

| | Lily pad | What it practises |
|---|---|---|
| 1 | Equal Sharing | Tapping bones into bowls until the share is fair (12 ÷ 3) |
| 2 | Grouping | Filling baskets of 2, 5 or 10 to see how many fit |
| 3 | Half a Pond | Halves of amounts, shared between two lily pads |
| 4 | Quarter Splitting | Quarters of amounts and shapes, and naming ½, ¼ and ¾ |
| 5 | Inverse Check | Using a times fact to solve a sharing fact, and back again |

## How Bonnie helps

The **Ask Bonnie** button, or a wrong answer, moves one step up a help ladder:

1. **Clue:** a short spoken hint, with the important part of the picture glowing.
2. **Step by step:** a card of small questions, each with big buttons to tap.
3. **Guided:** the exact buttons to press glow, or a green zone shows where Bonnie goes.

Harvey always gives the final answer himself.

Asking for help is framed as a superpower. Each Ask pops up a **Scout Tip!** badge, and the first one in a question earns a **+1 Scout bone** when it's solved. Bonnie plays a silly sidekick: her clues come with lines like "Bonnie's tail got in the way!", and on the step-by-step card she sometimes makes a funny wrong guess ("Is it… 100?!") so Harvey can put her right.

The game also adjusts the difficulty quietly. After two answers in a row that needed step-by-step or guided help, the next questions get easier, for example smaller numbers or extra labels. After two answers in a row done solo or with just a clue, it goes back to normal. Nothing on screen shows this.

## Bones and the Bone Shop

- **1 bone** for every question finished, however it was solved.
- **+1 Scout bone** if he asked Bonnie for help on that question.
- **Streak:** after 3 right in a row, each question is worth **2 bones** ("Bone Multiplier Active!"). Asking Bonnie doesn't break a streak; a wrong answer quietly starts it again.
- **3 bonus bones** for finishing a level.
- So a level gives roughly 12 to 30 bones, usually 20 to 30.

The **Bone Shop** has three tabs:

- **Real prizes:** set by grown-ups, shown in tiers. When he has enough bones he taps **Redeem**, and a grown-up holds a button for 3 seconds to say yes.
- **Bonnie's hats:** Pirate Eyepatch (50), Party Hat (75), Wizard Hat (150), Crown (300). Bonnie wears the chosen hat everywhere, even on the number line.
- **Meadow themes:** Daytime Meadow (free), Sunset Trail (100), Spooky Moonlit Night (250), Winter Snow (400).

The starter real-life prizes (you can edit, delete or add your own in the grown-ups panel):

| Tier | Prizes |
|---|---|
| Little treats | Choose the after-school snack (30), Stay up 10 mins late (40), Be the DJ for the car journey (50) |
| Small prizes | 15 mins extra gaming/screen time (100), Choose tonight's dessert (120), 30 minutes later bedtime (150) |
| Medium prizes | Special treat from the corner shop (300), Choose the Friday night family movie (400), Small toy or trading card pack (500) |
| Big goals | Trip to the bowling alley (1,000), Small buildable toy set (1,200), Special weekend outing with a parent (1,500) |

If an earlier starter list was never edited, the game swaps in this list automatically. If you had edited them, your list is kept; the grown-ups panel has a **Use the starter prize list** button to switch over.

Hats and themes are bought once and kept. He can swap between the ones he owns for free. Purchases appear in the grown-ups list of prizes claimed.

## Little extras

- A correct answer shakes the card a little, sends glowing bones and the answer's numbers popping out, and plays a bone rattle.
- Each level has a short story banner above the question, such as "Help Bonnie dig up her buried bone at 45!".
- After 5 seconds without a tap, a butterfly or frog wanders across, or Bonnie wiggles her ears.
- Tapping Bonnie tickles her.

## For grown-ups

Tap the faded gear icon in the top-right of the home screen and answer the times-table question. From there you can:

- see whose name is being used (the name itself is changed on the Clubhouse page)
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

## Bonnie's recorded voice (Meadow Words)

Meadow Words can play a recorded ElevenLabs voice for Bonnie instead of the device's built-in voice. The clips are made once on a computer and uploaded with the games, so the iPad never needs the ElevenLabs key, and they work offline.

**Making the clips** (needs [Node.js](https://nodejs.org) 20 or newer):

1. Connect ElevenLabs once. This signs you in and saves an API key in `.env.local`, which `.gitignore` keeps off GitHub:

   ```bash
   npx -y @elevenlabs/cli@latest onboard init
   ```

2. Install the ElevenLabs SDK (once): `npm install`
3. See the voices on your account, and copy the ID of the one you want for Bonnie:

   ```bash
   npm run voice -- --list-voices
   ```

4. Check the size first. This uses no credits:

   ```bash
   npm run voice:check -- --names "Harvey"
   ```

   The full set is about 35,000 characters. With the default `eleven_v4` model that used about 14,000 credits (November 2026), because ElevenLabs charges fewer credits than characters for it. Re-runs after small edits cost only the new lines.
5. Make 20 clips, then listen to them in `audio/clips/`:

   ```bash
   npm run voice -- --voice VOICE_ID --names "Harvey" --limit 20
   ```

   Run the same command without `--limit 20` to finish. If it stops part way, run it again and it carries on.
6. Upload the new `audio` folder with GitHub Desktop (or **Add file → Upload files**).

**How it works:** each line is cut into short pieces (sentences, the "…" pauses in sounding out, and the player's name), and each piece has its own clip. When every piece of a line has a clip, Bonnie uses them; otherwise she says that line with the device voice. So:

- The player's name needs its own clip: list every name in `--names`. Lines with a name that isn't recorded use the device voice.
- Prizes a grown-up adds or renames use the device voice until the script is run again.
- After editing the words in the game, run the script again. It only makes the new lines and removes clips that are no longer used. Changing the voice ID or model remakes everything.
- The reading speed setting only changes the device voice.
- Letter sounds such as "buh" and "sss" are hard for any computer voice. To use your own recording, replace that clip's file in `audio/clips/` (keep the name). `audio/manifest.json` lists the words in each clip under `texts`. The script won't overwrite it unless the voice changes.
- Never put the API key in the games or commit it. The script only reads it from `.env.local` (through `npm run voice`) or the environment.

The grown-ups page shows whether the recorded voice is on and whether the name has a clip. When online, Meadow Words saves all the clips on the device in the background (about 1,300 small files, about 30 MB), so the voice also works offline.

## Hosting with GitHub Pages

1. Make sure the Clubhouse page in the repository is called `index.html`, with `meadow-maths.html` and `meadow-words.html` next to it.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then **Save**.
4. After a minute the Clubhouse is live at `https://<your-username>.github.io/<repository-name>/`, or at the custom domain in `CNAME`.

## Updating the game

When you add a new page or rename a file, also add it to `CORE_ASSETS` in `sw.js` and change `CACHE_VERSION` (for example to `meadow-club-v3`), so the offline copy picks it up. If you change the Google Fonts `<link>` on any page, update `FONT_CSS` in `sw.js` to match. Simply editing an existing game file needs no change to `sw.js`.


Each page is a single file, so updating a game means replacing that file (`meadow-maths.html`, `meadow-words.html` or the Clubhouse's `index.html`).

**On github.com (easiest):**

1. Open the repository and click **Add file → Upload files**.
2. Drag in the new file. It replaces the old one with the same name.
3. Add a short note such as "Add Froggy Jumps" and click **Commit changes**.

GitHub Pages updates itself within a minute or two. On the iPad, pull down to refresh.

**From a computer with Git:**

```bash
git add index.html meadow-maths.html meadow-words.html README.md
git commit -m "Describe the change"
git push
```

## Technical notes

- Each page is a single HTML file with plain JavaScript. There is nothing to install or build.
- The only outside requests are the two Google Fonts (Fredoka and Nunito). The game still works without them, using fallback fonts.
- Bonnie's voice uses the device's built-in speech, or recorded clips in Meadow Words (see above). The game picks the most natural British English voice available, preferring enhanced or premium ones. On an iPad you can download a better voice in **Settings → Accessibility → Spoken Content → Voices → English → (UK voices)**. If speech isn't available, Bonnie plays a short chime instead.
