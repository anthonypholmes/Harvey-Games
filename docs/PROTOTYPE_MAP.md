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

**Checks (`selftest=1`):** 15, all passing at 375 × 667, 393 × 852, 820 × 1180 and 1180 × 820 on 22 November 2026: the games, Walk, shop and Bonnie are tappable; taps at least 44 × 44 with VoiceOver names; everything on one screen with no scrolling; places don't overlap; the top buttons and Bonnie's words cover no place (nor the name); words a child reads 16px or more; the name, bones and stars show and the game names say their stars; the sound button works.

**Clubhouse gaps:** with a night or space theme only the sky changes (the meadow stays daytime green). The name card and "Who's playing?" card still look as they do now. The pages a gate opens still go back to `index.html` (except the map prototype). Bonnie's "Let's play…" lines are the Clubhouse's existing ones, already recorded.

## Checks (`selftest=1`)

All 13 pass at iPhone SE (375 × 667), iPhone (393 × 852) and iPad (820 × 1180): every maths world has a place; every tap target is at least 44 × 44; every place has a VoiceOver name that says its stars; places don't overlap; nothing is wider than the screen; Bonnie has a button; tapping a place opens the real level map with the engine's locks; the top bar comes back; "Meadow" returns.

## Known gaps

- Bonnie's new lines aren't recorded, so the website uses the device voice for them and the app would say nothing.
- Only Meadow Maths has a route. The Clubhouse meadow, the Words route, level stones and the Bone Shop come in later phases.
- `tools/build-app.mjs` copies the whole `js/` folder, so the two prototype files would ride along in an app build (unused). Leave this branch out of app builds.
