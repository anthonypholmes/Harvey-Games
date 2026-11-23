# Level-by-level phone check

Made by `node tools/level-check.mjs` on 2026-11-23: the first question of every level, with the full game unlocked. Pictures (what the phone shows, before any scrolling) are in `docs/phone-check/levels/<size>/`; open `docs/phone-check/levels.html` to see them side by side.

"On screen" means everything a child taps to answer (keys, tiles, slots, bowls, signposts, choices) is above the bottom of the screen without scrolling. "Npx below" means the last of them is that far down. Bonnie and Ask Bonnie are not counted: they sit under the answers on a phone. On a phone the number keys stay fixed at the bottom of the screen, so they are always in reach; the other taps are measured against the top of the keys. Questions are random, so a level can measure a little differently each run.

## The Clock Tower

| Level | iPhone SE | First question (iPhone SE) |
|---|---|---|
| 1. O’Clock and Half Past | on screen | What time is it? |
| 2. Quarter Past and To | on screen | What’s the time? |
| 3. Five-Minute Steps | on screen | What’s the time? |
| 4. Set the Clock | on screen | Show quarter to 1. |
| 5. Minutes and Hours | on screen | How many minutes are in an hour? |
| 6. How Long? | on screen | How long did bath time take? |
| 7. Before and After | on screen | It’s quarter past 2. What time was it 30 minutes ago? |

