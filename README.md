# Harvey's Meadow Clubhouse

An arcade home page linking Harvey's learning games. Bones earned in any game go into one shared bone bowl.

| File | What it is |
| --- | --- |
| `index.html` | **Harvey's Meadow Clubhouse**, the home page. Shows the bone total and links to each game. |
| `meadow-maths.html` | **Harvey's Meadow Maths** (described below). |
| `meadow-words.html` | **Harvey's Meadow Words**: Year 2 English, with Phonics Forest, Tricky Word Trail, Sentence Meadow and Bonnie's Story Nook. |

The player's name is entered on the Clubhouse page the first time it opens (and changed there with **✏️ Change name**). Every game uses it in titles and in Bonnie's dialogue. If a game is opened before a name has been entered, it sends the player to the Clubhouse first.

Every game has a 🏠 button that goes back to the Clubhouse. All games share one save (`meadow-save-v1` in `localStorage`): bones, the player's name, Bonnie's dress-up, themes, the real-life prize list, the record of bones spent and every level's stars. (The old games saved to `harvey-splitter-v1` and `meadowWords_english_v1`; those are kept, read only.)

To add another game, add an entry to the `GAMES` list in the `CONFIG` block at the top of the script in `index.html`.

# Harvey's Meadow Maths

A Year 2 (Key Stage 1) maths game for iPad, built for Harvey with help from Bonnie, the family's brown cockapoo.

Five worlds:

- **The Partitioning Park:** splitting numbers into tens and ones (for example 47 = 40 + 7), with base-ten blocks and counters.
- **Number Bonds Burrow:** adding and taking away: number bonds to 10 and 20, tens facts to 100, 2-digit sums, three numbers and fact families.
- **The Stepping Stone River:** number lines from 0 to 100. Harvey drags Bonnie along the line to find numbers.
- **The Array Orchard:** equal groups, rows of apples and the 2, 5 and 10 times tables.
- **The Sharing Pond:** sharing fairly, grouping, halves, thirds and quarters.

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

### Number Bonds Burrow (7 burrows)

Year 2 asks children to recall addition and subtraction facts to 20 fluently and use them for facts up to 100. The main picture is the **burrow frame**: a ten frame drawn as 10 burrow holes in two rows of 5 (two frames for numbers up to 20). Bones are the first number and carrots the second. Harvey taps an empty hole to drop one in, or taps a bone for Bonnie to eat it. Nothing under the picture counts for him, so the answer is never given away.

| | Burrow | What it practises | Easy version |
|---|---|---|---|
| 1 | Bonds to 10 | Pairs that make 10, both ways round (7 + ? = 10, 10 − 3) | Pairs to 5 and 6 |
| 2 | Bonds to 20 | Facts to 20, filling the first burrow to 10 first (8 + 5 = 13, 14 − 6 = 8) | No crossing 10 |
| 3 | Tens Facts | Using a bond to 10 for tens, with bags of 10 (3 + 7 = 10, so 30 + 70 = 100) | Totals to 50 |
| 4 | Ones and Tens | A 2-digit number add or take away ones or tens (46 + 3, 46 + 30, 58 − 20), with base-ten blocks | No crossing a ten |
| 5 | Two-Digit Diggers | 2-digit add and take away 2-digit, tens first then ones (34 + 25, 67 − 24) | No exchanging |
| 6 | Three Little Numbers | Adding three numbers by spotting a bond to 10 (4 + 6 + 3) | Totals to 10 |
| 7 | Fact Families | Missing numbers (? − 8 = 7), using one fact for another, and "true or false: 5 − 3 = 3 − 5" | Within 10 |

Word problems with the player's name and Bonnie come up in every level. The world is in `worlds/y2-maths-number-bonds.js`; the burrow frame is in the kit (`vis: { type: 'burrow' }`, made with `MeadowMaths.burrow({...})`), so other worlds can use it too. `tests/number-bonds-test.html` checks every kind of question (see "Try it" below).

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

### The Sharing Pond (7 lily pads)

| | Lily pad | What it practises |
|---|---|---|
| 1 | Equal Sharing | Tapping bones into bowls until the share is fair (12 ÷ 3) |
| 2 | Grouping | Filling baskets of 2, 5 or 10 to see how many fit |
| 3 | Half a Pond | Halves of amounts, shared between two lily pads |
| 4 | Quarter Splitting | Quarters of amounts and shapes, and naming ½, ¼ and ¾ |
| 5 | Inverse Check | Using a times fact to solve a sharing fact, and back again |

There are two more lily pads: **6 Thirds Island** (a third of an amount, which shape is cut into thirds, what fraction is shaded) and **7 Three Quarters** (three quarters of an amount and of a shape, and two quarters are the same as a half). They come from `worlds/y2-maths-sharing-fractions.js`.

## How Bonnie helps

The **Ask Bonnie** button, or a wrong answer, moves one step up a help ladder:

1. **Clue:** a short spoken hint, with the important part of the picture glowing.
2. **Step by step:** a card of small questions, each with big buttons to tap.
3. **Guided:** the exact buttons to press glow, or a green zone shows where Bonnie goes.

Harvey always gives the final answer himself.

Asking for help is framed as a superpower. Each Ask pops up a **Scout Tip!** badge, and the first one in each play of a level earns a **+1 Scout bone**. Bonnie plays a silly sidekick: her clues come with lines like "Bonnie's tail got in the way!", and on the step-by-step card she sometimes makes a funny wrong guess ("Is it… 100?!") so Harvey can put her right.

The game also adjusts the difficulty quietly. After two answers in a row that needed step-by-step or guided help, the next questions get easier, for example smaller numbers or extra labels. After two answers in a row done solo or with just a clue, it goes back to normal. Nothing on screen shows this.

## Bones and the Bone Shop

Bones work the same in every game and world:

- **Normal plays:** the first **2** plays of each level each day pay **1 bone** for every right answer.
- **Extra practice:** the 3rd and later plays of that level on the same day pay no bones per answer, but **3 bonus bones** for finishing. An **Extra practice** chip shows in the top bar, and Bonnie says so at the start, so the missing answer bones don't look like a bug. Everything else (sounds, streak banners, stars, MASTERED) works as usual.
- **Asking Bonnie:** **+1 bone** once per play, in any play.
- **New best stars:** **3 bones** for each star better than the best so far.
- There's no limit across the game: five different levels in a day all pay normally. Practice is never limited, only how fast bones come.
- So a 10-question level played 5 times in one day (3 stars the first time) pays (10 + 9) + 10 + 3 + 3 + 3 = 38 bones.

The **Bone Shop** can be opened from the Clubhouse (the **Bone Shop** button under the games, or at the top), or from inside either game. It has three tabs:

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

## The shared engine

`js/meadow-core.js` is the shared engine all three pages use: one save (`meadow-save-v1`), the star and bone rules, the world map, the level-complete screen, the Bone Shop, the grown-ups area and Bonnie. The pages themselves are short: `index.html` (the Clubhouse), `meadow-maths.html` and `meadow-words.html` each load the engine and their world files.

- **Old saves are only read.** The first time the engine runs, it copies `harvey-splitter-v1`, `meadowWords_english_v1` and `meadowClubhouse_sound` into `meadow-save-v1`. Words stars carry over. A Maths level that was done becomes 1 star. The old keys are never changed, so they stay as the rollback.
- **Catching up with the old saves.** Each time it loads, the engine checks whether the old saves have changed since it last looked (for example, the old games played offline on an iPad that still had them saved). If so it copies the new progress across: the best stars of both, every dress-up item owned in either, and the bones the old game earned or spent since. A save made in the beta, before go-live, takes the live bones instead, because beta bones were only for trying things out.
- **Stars:** 3 stars for at most 1 mistake and no help. 2 stars for at most 4 mistakes and at most 1 help. Otherwise 1 star. The best result is kept. A level unlocks once the one before has a star.
- **Bones:** the numbers are in `RULES` in the engine. 1 per right answer in the first 2 plays of a level each day (`NORMAL_RUNS_PER_DAY`), then extra practice plays pay 3 for finishing instead (`EXTRA_RUN_BONES`). +1 the first time Bonnie is asked in a play, and 3 per *new* star at the end. There are no streak multipliers.
- **Counting plays:** the save keeps `daily: { day, normalRuns: { 'worldId/levelId': n } }`, using the device's local date. A play is counted when it pays its first answer bone, in the same save, so quitting part-way uses one up, leaving before answering doesn't, and a refresh can't pay twice. A new day starts the counts again; if the clock goes backwards, the stored day and counts are kept.
- **Meadow Words:** its four worlds are in `worlds/y2-english-*.js`.
- **Meadow Maths:** `worlds/y2-maths-kit.js` is the question screen the maths worlds share: the number pad, the pictures (including the burrow frame), the number line and Bonnie's help ladder (a clue, then the step card, then glowing buttons). The worlds themselves are in `worlds/y2-maths-*.js`. Only the step card and the glowing buttons count as help for stars; a clue does not. Two helped questions in a row quietly switch to easier numbers until two clean ones in a row.
- **Clubhouse:** reads and writes only `meadow-save-v1` (name, Clubhouse sound) and shows each game's stars. It loads every world file so it can count them, so a new world file is added there too.
- **Bonnie's dress-up:** the Bone Shop's first tab has three slots, so Bonnie can wear a hat, something on her face and something round her neck at once (`hat`, `face`, `neck` in the save). Items are listed in `HATS` in the engine, each with its `slot`, and drawn in `hatSVG`, `faceSVG` and `neckSVG`.
- **The old beta addresses** (`/beta/index.html`, `/beta/meadow-maths.html`, `/beta/meadow-words.html`) now just send you to the live pages. `beta/sw.js` removes the beta's old offline copy and then removes itself.
- **Checking a world's questions:** open `tests/number-bonds-test.html`. It makes every kind of Number Bonds Burrow question thousands of times, in normal and easy mode, and checks that the sums are right, that Bonnie's step card ends on the answer, and that easy mode stays easy. It only makes questions, so it never touches the save. Run it after changing the world.
- **Checking the bone rules:** open `tests/bones-test.html`. It plays a pretend level many times with a pretend clock and checks the bones (5 plays in a day = 38, a new day, quitting, refreshing, a clock moved back, asking Bonnie, new stars, old saves). It uses its own test save and deletes it at the end. Run it after changing the bone rules.
- **Try it:** `beta/core-test.html` has a small practice world. It uses its own practice save (`meadow-save-test`), so it changes nothing. Its "Test tools" box shows what would be copied from this device's saves.
- **Going back to the old games:** the old pages are in git history (the commit before "Stage 7"). Putting them back needs no save changes, because the old saves were never touched; only progress made in the new games would be missing.

A world is one file that calls `Meadow.registerWorld({...})` with a stable `id`, a `subject`, a `year`, and `levels`. Each level has a stable `id` and either a list of `items` or a `make()` function. A `play(question, ctx)` function draws a question and calls `Meadow.correct(el)` or `Meadow.wrong(msg)`. Progress is stored as `worldId/levelId`, so worlds and levels can be reordered or added without breaking saves.

A file can also add levels to a world another file made, with `Meadow.addLevels(worldId, levels)` (Maths files use `MeadowMaths.addLevels`). `worlds/y2-maths-sharing-fractions.js` does this for the Sharing Pond. To add a file like this: put a `<script>` line for it after the world's own file in `meadow-maths.html` and `index.html`, and add it to `CORE_ASSETS` in `sw.js` (and bump `CACHE_VERSION`).

## Bonnie's recorded voice (Clubhouse, Meadow Words and Meadow Maths)

The Clubhouse and both games can play a recorded ElevenLabs voice for Bonnie instead of the device's built-in voice. Bonnie is currently voiced by **Shelley** (voice ID `4CrZuIW9am7gYAxgo2Af`). Both pages share the player in `bonnie-voice.js`. The clips are made once on a computer and uploaded with the games, so the iPad never needs the ElevenLabs key, and they work offline.

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
   npm run voice:check
   ```

   The full set is about 35,000 characters. With the default `eleven_v4` model that used about 14,000 credits (November 2026), because ElevenLabs charges fewer credits than characters for it. Re-runs after small edits cost only the new lines.
5. Make 20 clips, then listen to them in `audio/clips/`:

   ```bash
   npm run voice -- --voice VOICE_ID --limit 20
   ```

   Run the same command without `--limit 20` to finish. If it stops part way, run it again and it carries on.
6. Upload the new `audio` folder with GitHub Desktop (or **Add file → Upload files**).

**How it works:** each line is cut into short pieces (sentences, the "…" pauses in sounding out, and the player's name), and each piece has its own clip. When every piece of a line has a clip, Bonnie uses them; otherwise she says that line with the device voice. So:

- The player's name needs its own clip. `tools/names.txt` lists the names to record: about 100 popular names for children born 2019–20, plus Harvey, Rex, Samantha and Anthony. Add a name on its own line and run the script again; each name costs only a few credits. Lines with a name that isn't recorded use the device voice.
- Names marked with `*` in `tools/names.txt` (Harvey, Rex, Samantha, Anthony, Alaya and Rory) have every sentence containing their name recorded in one go, so there's no join around the name. That's about 52 sentences, or roughly 1,500 characters, per name. Other names are joined in, with the quiet ends of each clip trimmed so the joins are short.
- Prizes a grown-up adds or renames can't be recorded in advance. For those, Bonnie says "Hooray! Go and tell your grown-up what you unlocked!" in the recorded voice, and the prize name is shown on screen.
- After editing the words in the game, run the script again. It only makes the new lines and removes clips that are no longer used. Changing the voice ID or model remakes everything.
- **Meadow Maths** questions are full of numbers that change, so most of its lines use the device voice. Its greetings, its well-done lines and each world's fixed lines are recorded. A Maths world lists its fixed lines in `lines` (see `VOICE_LINES` in `worlds/y2-maths-number-bonds.js`); keep them word for word the same as the clues and steps.
- `npm run voice -- --dry-run` lists every new line it would record and how many characters that costs, without the key and without making anything.
- The reading speed setting only changes the device voice.
- Some letter sounds came out as letter names ("lll" was read as "L, L, L"), so the script sends ElevenLabs a different spelling for those (`SAY_AS` in `tools/make-voice.mjs`). The device voice still uses the game's own spelling.
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
- Bonnie's voice uses the device's built-in speech, or recorded clips (see above). The game picks the most natural British English voice available, preferring enhanced or premium ones. On an iPad you can download a better voice in **Settings → Accessibility → Spoken Content → Voices → English → (UK voices)**. If speech isn't available, Bonnie plays a short chime instead.
