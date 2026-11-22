# Meadow Clubhouse redesign: handoff

**Last updated:** 22 November 2026
**Branch:** `prototype-meadow-map` (made from `app-store` on 22 November 2026). The game's own record is still `docs/HANDOFF.md` on `app-store`; this file is only about the new look.
**Owner:** Anthony. He isn't a developer: explain steps plainly, give commands to paste, and do the technical work yourself where you can.

## Where things stand

- **Version 1.0 (build 4)** was submitted to Apple on 14 November 2026 and was still "Waiting for Review" on 19 November. Don't change anything about that submission.
- **Version 1.1 (iPhone)** is on `app-store` and is nearly ready. It waits for 1.0's approval. **The redesign must not touch `app-store` or 1.1.** Work on `prototype-meadow-map` (or branches made from it) until Anthony approves a phase.
- `main` is the live website (holmeshouse.co.uk). Never touch it.

## What was decided

1. **The problem (Anthony, 19–22 November):** the game looks like a generic web app (cream cards, soft shadows, pills, emoji icons, stacked lists). He wants a distinctive, hand-made illustrated world for children aged 6–8. Bonnie is the heart of it. No copying another game's art. Grown-ups screens can stay plain.
2. **Design sheet, first version:** a "Meadow Trail" look: our own drawings, never emoji; flat rounded shapes with darker same-colour outlines (never black); things not cards (signs, stones, wooden tags, stamps); shape before colour for states; calm near questions; Reduce Motion respected. Fredoka for signs and titles and Andika for reading, both unchanged.
3. **Second iteration (approved 22 November):** one connected landscape instead of separate green islands. The river runs from the burrow under the stepping stones, fills the Sharing Pond and reaches the sea at Captain's Cove. Each place is known by its scenery, and its name sits on something that belongs there (park gate arch, burrow log, apple crate, the Cove's pennant). Bonnie is the guide.
4. **Layout: Direction B (approved 22 November).** A **Clubhouse meadow** that fits one screen (the clubhouse, Bonnie at the door, the Walk arch, the shop stall, and a gate for Meadow Maths and one for Meadow Words), with a **separate route for each game**. It was chosen over one long trail because each route stays short (4–9 places) and it scales to 15+ worlds: Year 3 adds gates, or the Maths route carries on by boat from the Cove.
5. **Phases, each approved by Anthony before the next:** the Meadow Maths world map (prototype built and **approved 22 November 2026**, below), then the Clubhouse meadow, the Meadow Words route, the level maps (stepping stones), the Bone Shop (a dressing room, Bonnie in the middle; all prices and items kept), and the explorer's journal (stamps; later the collector's book). Ship the new look as its own release before the Spelling and Grammar worlds, so those are drawn in the new style from the start.

**The design canvas:** "Meadow Clubhouse design sheet" in Anthony's Claude artifacts (https://claude.ai/artifact/79A1v951UtQDQqwtRsKkQB). Page "Iteration 2: the world" is the approved direction, with iPhone and iPad mock-ups next to the current design. Page "First sheet" has the rules, colours, level stones, wooden tags, drawn icons and journal stamps.

## The prototype (built 22 November 2026)

The Meadow Maths world list as the illustrated route. **New files only**; no game file changed. Details: `docs/PROTOTYPE_MAP.md`.

| File | What it is |
|---|---|
| `prototype-clubhouse.html` | **The Clubhouse meadow prototype** (22 November): `index.html` unchanged, with the meadow on top. `?view=old`, `?selftest=1` |
| `js/proto-hub-art.js`, `js/proto-hub.js` | The Clubhouse drawing, and its live parts wired to index.html's own functions |
| `docs/review/` | **The final review page** (22 November): old and new side by side at three sizes, states, themes, checks and compromises |
| `prototype-words-map.html` | **The Meadow Words map prototype** (22 November): Phonics Forest, Tricky Word Trail, Sentence Meadow, Bonnie's Story Nook. The Clubhouse's Words gate opens it |
| `js/proto-demo.js` | The pretend save ("Sam" or a new player) shared by both prototypes, kept apart from the family's |
| `prototype-compare.html` | The current screen and the prototype side by side (Clubhouse or Maths map), at iPhone SE, iPhone or iPad size; pretend or real progress; the app's padlocks on or off |
| `prototype-maths-map.html` | The prototype. `?demo=1` pretend save, `?taster=1` padlocks, `?view=old` the current list, `?selftest=1` the checks |
| `js/proto-map-art.js` | The meadow drawing (plain SVG, drawn once, about 2,500 shapes) |
| `js/proto-map.js` | Stars, Bonnie, tappable places, and fitting into the engine |
| `docs/design-source/` | The scripts that drew the design canvas, including `hub()`, the Clubhouse meadow, ready to port next |

- **It runs on the real engine** (`js/meadow-core.js` and the maths worlds, loaded as in `meadow-maths.html`). When the engine draws its world list, the prototype shows the meadow instead. Tapping a place calls `Meadow.worldMap(id)`, the engine's own level map with its own unlocking and padlocks; its "Worlds" button becomes "← Meadow".
- **Bonnie:** she stands at the place played last (from `levelStarts`) or the next unfinished one, and the page scrolls to her. Tap a place: she hops over, says where you're going, then the level map opens. Tap her to go where she suggests. Reduce Motion: no movement.
- **Phones** show the middle of the drawing (390 wide), **iPads** all of it (640 wide). Worlds without a drawn place show as plain buttons under the meadow.
- **Checks:** `?selftest=1` runs 13 checks (a place per world, taps at least 44 × 44, VoiceOver names with stars, no overlaps, nothing too wide, the real level map and its locks, the way back). All passed at 375 × 667, 393 × 852 and 820 × 1180 on 22 November 2026.

### How Anthony tries it

1. GitHub Desktop: **Fetch origin**, then switch to the `prototype-meadow-map` branch.
2. In Terminal, in the Harvey-Games folder: `python3 -m http.server 8000`
3. On the Mac: http://localhost:8000/prototype-compare.html
4. On the iPad or iPhone (same Wi-Fi): the Mac's local name from System Settings → General → Sharing, for example `http://<mac-name>.local:8000/prototype-compare.html`.
5. Ctrl-C in Terminal stops the server. Switch GitHub Desktop back to `app-store` before any 1.1 work.

### Not yet checked or done

- **Bonnie's hop works on the iPad** (Anthony, 22 November 2026). Not yet seen on an iPhone.
- **First verdict (22 November 2026):** Anthony's 6-year-old likes the map much more than the current list, and Anthony finds it visually much better.
- Bonnie's new lines (her suggestions and "Off to the orchard!") aren't recorded. The website uses the device voice for them; the app would be silent. Record them (with name-free versions) when the map goes into the game: `npm run voice:check` first.
- **Still worth a look (the map is approved, these are polish):** is the map easy for a 6-year-old to read, are the stars clear enough, is Bonnie's bubble in the way anywhere, is the iPhone SE too small.
- `tools/build-app.mjs` copies the whole `js/` folder, so don't build the app from this branch.

## Next steps (after Anthony approves the prototype)

1. Fix whatever his look at the prototype turns up.
2. **Final prototype refinements done 22 November 2026, waiting for Anthony's review** (`docs/review/`, details in `docs/PROTOTYPE_MAP.md`). Nothing goes into the game until he approves.
   **The Clubhouse meadow: prototype built 22 November 2026. Anthony liked the direction; refinement 1 (bolder gates, Bonnie's words beside her, a calmer lower half, stars on tags, labelled top buttons, press feedback) done the same day, waiting for his look.** Next, as he asked: look at the Maths map and the Words map next to the Clubhouse so the three feel like one place (the Words map isn't drawn yet). See `docs/PROTOTYPE_MAP.md` ("The Clubhouse meadow"). Try it from `prototype-compare.html` (Screen: Clubhouse); its Maths gate opens the map prototype.
3. **The Meadow Words route: prototype built 22 November 2026, waiting for Anthony's look** (`prototype-words-map.html`, in `docs/review/` and `prototype-compare.html`).
4. **The level maps (stepping stones): prototype built 22 November 2026; Anthony approved the concept and asked for a refinement pass (a clearer next level, one locked look, keeping your place, bigger names, Captain's Cove, quieter scenery). Refinement 1 done the same day, waiting for his look** (`js/proto-level.js`, used by both map pages; in `docs/review/` under "Level maps"; details in `docs/PROTOTYPE_MAP.md`).
5. **The Bone Shop (Bonnie's dressing room): prototype built 22 November 2026, then refinement 1 the same day (clearer Wearing / Yours / Trying on / Buy / more-bones states, an easier rail, a collection count, theme touches, quieter prizes), waiting for Anthony's look** (`js/proto-shop.js`, used by both map pages and the Clubhouse prototype's shop stall; in `docs/review/` under "Bone Shop"; details in `docs/PROTOTYPE_MAP.md`). Then the explorer's journal, as its own approved phase.
6. To go live: move the map into `meadow-maths.html` behind a setting first, run every test page in `tests/`, then make it the default.

## Rules to keep

- Never change `app-store` or `main` for this work until Anthony approves a phase. Never touch the 1.0 submission.
- Keep every learning mechanic, question, hint, voice line, save, player, purchase and accessibility feature as it is.
- No new libraries, image packs or outside services without asking. Inline SVG drawn by us.
- Our drawings only: no emoji where children navigate, and nothing that looks like another game's art.
- Taps at least 44 × 44, VoiceOver names on every place, Reduce Motion respected, nothing a child reads under 16px, and test on the 2018 iPad.
- Commit as Anthony. Never commit `app-www/`, `node_modules/` or `.env.local`. Anthony pushes from GitHub Desktop unless Claude can.
- Anthony works on this in weekday working hours. Keep each step small enough to finish in one sitting.
