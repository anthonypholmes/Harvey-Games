# Meadow Maths map and Clubhouse meadow prototypes

**Branch:** `prototype-meadow-map` (from `app-store`, 22 November 2026). **Start with `docs/HANDOFF_REDESIGN.md`.** Nothing in the game changes: these are new files only, and none of the game's pages link to them.

The world list drawn as an illustrated meadow route, from design iteration 2 (Direction B: the Clubhouse meadow with separate Maths and Words routes). The design sheet is the "Meadow Clubhouse design sheet" canvas.

## Try it

- `prototype-compare.html`: the current screen and the prototype side by side, for the **Clubhouse** or the **Maths map** (the Screen buttons), at iPhone SE, iPhone or iPad size. Choose pretend progress (a separate save, "Sam") or this device's real progress, and switch on the App Store app's free taster to see the padlocks.
- `prototype-maths-map.html` on its own. Options after `?`: `demo=1` (the pretend save `meadow-save-proto-demo`), `taster=1` (padlocks as in the app), `view=old` (the current world list), `selftest=1` (runs the checks below and prints the results).

Open them through a local web server or the website, not by double-clicking the file.

## How it works

- `js/proto-map-art.js` draws the meadow: one connected landscape (the river runs from the burrow under the stepping stones, fills the pond and reaches the sea at the Cove). Plain SVG, about 2,500 shapes, drawn once. No libraries. Bonnie is the game's own drawing, so she wears her real outfit and coat; Captain Croak comes from his world file.
- `js/proto-map.js` puts the live parts on top: each place's stars (or "New!", "All stars!" and the app's "Level 1 free"), Bonnie and her speech bubble, and an invisible button over each place's whole area.
- **The engine is not changed.** The page loads the same engine and maths worlds as `meadow-maths.html`. When the engine draws its world list, the prototype shows the meadow instead; tapping a place calls `Meadow.worldMap(id)`, the engine's own level map, with its own unlocking and padlocks. Its "Worlds" button becomes "Meadow" and comes back here.
- **Bonnie the guide:** she stands at the place played last (from `levelStarts`), or the next place that isn't finished, and says what to try. Tap a place and she trots over with two little hops and says where you're going, then the level map opens. Tap Bonnie to go where she suggests. With Reduce Motion she doesn't move and nothing bounces.
- **Phones** show the middle of the drawing (390 wide); **iPads** show all of it (640 wide), larger. Worlds not drawn yet (Year 3, say) appear under the meadow as plain buttons, so nothing is ever lost.

## The Clubhouse meadow (built 22 November 2026)

The Clubhouse page as one illustrated meadow that fits one screen: the clubhouse with the child's name on it, Bonnie at the door, the Walk arch, the shop stall with the bones, and a gate for Meadow Maths and one for Meadow Words, each with its weekly stars.

- `prototype-clubhouse.html` loads `index.html` **exactly as it is** and adds the meadow on top, so every Clubhouse function is index.html's own: the name card, players, sound, change name, grown-ups, Bonnie's tickles and Easter egg, the first-time help rings, the Home Screen banner and the bought themes. `?view=old` shows the current Clubhouse, `?selftest=1` runs the checks. It reads and writes the device's real save, as the Clubhouse does (there's no pretend save).
- `js/proto-hub-art.js` draws it (ported from `hub()` in `docs/design-source/scenes.mjs`, using the kit in `js/proto-map-art.js`). The sky follows the Bone Shop theme.
- `js/proto-hub.js` puts the live parts on top and calls index.html's own functions. Tap a gate, the arch or the stall: Bonnie trots over and says where you're going, then the page opens when she has finished (index.html's `goTo`). Tap Bonnie to tickle her; tap the clubhouse to hear her again. Her words sit in a speech box under the top buttons, with her face, so they never cover a place. The top buttons are wooden tags with drawn icons: sound, switch player, change name, grown-ups.
- **The Maths gate opens the map prototype**, and the map's Clubhouse button comes back here, so the two can be tried together. The Words gate opens the current Meadow Words.
- It fits the screen: on an iPhone SE the signs are 16px; an iPad shows nearly all of the drawing, bigger.

### Refinement 1 (22 November 2026, from Anthony's notes)

- **The game gates lead.** They are the biggest, most colourful things in the meadow: each game's own colour on the sign (Maths green, Words orange, as on the current cards) with a cream edge, a medallion on top (1+2, abc), and a pool of sunlight in the gateway. Their signs sway now and then (not with Reduce Motion).
- **Bonnie's words sit beside her.** She has her own patch of meadow by the path, and her words are in a bubble next to her with its tail pointing at her mouth. If a line doesn't fit there, the bubble drops to 16px; if it still doesn't fit, it moves to a box under the top buttons with her face. Her longest Clubhouse line (80 letters) fits beside her at every size tested.
- **A calmer lower half:** no flowers or signposts in front of the gates, one bush in the fork, and one small glimpse beyond each gate (the maths river and stones; two letter trees).
- **Each game's stars hang from its gate** on a wooden tag, as on the current cards: "3 new stars this week", or "All stars!". New: a game the child hasn't started says "New! Start here"; one played before but not this week says "Ready when you are!".
- **The top buttons say what they do:** a speaker with "On" or "Off"; the child's name, which opens "Change name" (and "Switch player" in the app); and "Grown-ups" with a padlock. Bigger on an iPad.
- **Generous places with clear feedback:** the gates, Walk and shop are 88 × 88 or more even on an iPhone SE (the gates about 156 × 173). Pressing one shows a gold ring on the ground and dips it, with a soft tone; choosing a gate bounces its sign. Keyboard focus shows the ring too. Bonnie's first-time help ring shows as a pulsing gold ring.

**Checks (`selftest=1`):** 23, all passing at 375 × 667, 393 × 852, 820 × 1180 and 1180 × 820 on 22 November 2026, tried with a new player and with stars this week and earlier: everything tappable, 44 × 44 or more and the four places 88 × 88 or more; VoiceOver names; one screen, no scrolling; nothing overlaps, and the top buttons and Bonnie's words cover no place, tag, name or Bonnie (her longest line too); words 16px or more, signs 16px or more (the game signs 19px on an SE); the name, bones and each game's stars show and are read out; the top buttons have words; the name opens "Change name"; the sound button works; pressing a gate lights it and lets go.

**Clubhouse gaps:** the drawing now ends 30 units lower, so on an iPhone SE the foot of the gates is at the bottom edge. With a night or space theme only the sky changes (the meadow stays daytime green). The name card and "Who's playing?" card still look as they do now. The pages a gate opens still go back to `index.html` (except the map prototype). Bonnie's "Let's play…" lines are the Clubhouse's existing ones, already recorded.

## Checks (`selftest=1`)

All 13 pass at iPhone SE (375 × 667), iPhone (393 × 852) and iPad (820 × 1180): every maths world has a place; every tap target is at least 44 × 44; every place has a VoiceOver name that says its stars; places don't overlap; nothing is wider than the screen; Bonnie has a button; tapping a place opens the real level map with the engine's locks; the top bar comes back; "Meadow" returns.

## Known gaps

- Bonnie's new lines aren't recorded, so the website uses the device voice for them and the app would say nothing.
- Only Meadow Maths has a route. The Clubhouse meadow, the Words route, level stones and the Bone Shop come in later phases.
- `tools/build-app.mjs` copies the whole `js/` folder, so the two prototype files would ride along in an app build (unused). Leave this branch out of app builds.
