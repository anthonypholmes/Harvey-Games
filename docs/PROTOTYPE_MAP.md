# Meadow Maths map prototype

**Branch:** `prototype-meadow-map` (from `app-store`, 22 November 2026). Nothing in the game changes: these are new files only, and none of the game's pages link to them.

The world list drawn as an illustrated meadow route, from design iteration 2 (Direction B: the Clubhouse meadow with separate Maths and Words routes). The design sheet is the "Meadow Clubhouse design sheet" canvas.

## Try it

- `prototype-compare.html`: the current world list and the prototype side by side, at iPhone SE, iPhone or iPad size. Choose pretend progress (a separate save, "Sam") or this device's real progress, and switch on the App Store app's free taster to see the padlocks.
- `prototype-maths-map.html` on its own. Options after `?`: `demo=1` (the pretend save `meadow-save-proto-demo`), `taster=1` (padlocks as in the app), `view=old` (the current world list), `selftest=1` (runs the checks below and prints the results).

Open them through a local web server or the website, not by double-clicking the file.

## How it works

- `js/proto-map-art.js` draws the meadow: one connected landscape (the river runs from the burrow under the stepping stones, fills the pond and reaches the sea at the Cove). Plain SVG, about 2,500 shapes, drawn once. No libraries. Bonnie is the game's own drawing, so she wears her real outfit and coat; Captain Croak comes from his world file.
- `js/proto-map.js` puts the live parts on top: each place's stars (or "New!", "All stars!" and the app's "Level 1 free"), Bonnie and her speech bubble, and an invisible button over each place's whole area.
- **The engine is not changed.** The page loads the same engine and maths worlds as `meadow-maths.html`. When the engine draws its world list, the prototype shows the meadow instead; tapping a place calls `Meadow.worldMap(id)`, the engine's own level map, with its own unlocking and padlocks. Its "Worlds" button becomes "Meadow" and comes back here.
- **Bonnie the guide:** she stands at the place played last (from `levelStarts`), or the next place that isn't finished, and says what to try. Tap a place and she trots over with two little hops and says where you're going, then the level map opens. Tap Bonnie to go where she suggests. With Reduce Motion she doesn't move and nothing bounces.
- **Phones** show the middle of the drawing (390 wide); **iPads** show all of it (640 wide), larger. Worlds not drawn yet (Year 3, say) appear under the meadow as plain buttons, so nothing is ever lost.

## Checks (`selftest=1`)

All 13 pass at iPhone SE (375 × 667), iPhone (393 × 852) and iPad (820 × 1180): every maths world has a place; every tap target is at least 44 × 44; every place has a VoiceOver name that says its stars; places don't overlap; nothing is wider than the screen; Bonnie has a button; tapping a place opens the real level map with the engine's locks; the top bar comes back; "Meadow" returns.

## Known gaps

- Bonnie's new lines aren't recorded, so the website uses the device voice for them and the app would say nothing.
- Only Meadow Maths has a route. The Clubhouse meadow, the Words route, level stones and the Bone Shop come in later phases.
- `tools/build-app.mjs` copies the whole `js/` folder, so the two prototype files would ride along in an app build (unused). Leave this branch out of app builds.
