# Meadow Maths map and Clubhouse meadow prototypes

**Branch:** `prototype-meadow-map` (from `app-store`, 22 November 2026). **Start with `docs/HANDOFF_REDESIGN.md`.** Nothing in the game changes: these are new files only, and none of the game's pages link to them.

The world list drawn as an illustrated meadow route, from design iteration 2 (Direction B: the Clubhouse meadow with separate Maths and Words routes). The design sheet is the "Meadow Clubhouse design sheet" canvas.

## Try it

- `prototype-compare.html`: the current screen and the prototype side by side, for the **Clubhouse** or the **Maths map** (the Screen buttons), at iPhone SE, iPhone or iPad size. Choose pretend progress (a separate save, "Sam") or this device's real progress, and switch on the App Store app's free taster to see the padlocks.
- `docs/review/` (http://localhost:8000/docs/review/): **the final review page**: old and new side by side at three sizes, the states and themes, what was checked, and the compromises. Its screenshots are in `docs/review/img/`; `docs/review/frame.html` shows a page at an exact phone size for remaking them.
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

## Final refinements (22 November 2026, Anthony's "final prototype refinements" brief)

**Clubhouse:** the whole of each gate (sign, arch, posts) is inside its tap area and lights on touch; the Walk arch and shop stall likewise; both gates fit an iPhone SE with no scrolling. Tapping the clubhouse opens its door, Bonnie hops to the step and says her line again, then goes back (no new feature behind it). The scenery takes a wash for dark and seasonal themes (night, space, snow, Christmas, sunset, sea, volcano), so it no longer stays daytime green. The name tag opens a menu ("Change name", and "Switch player" when there's more than one); Tab out of it or Escape closes it.

**Maths map:** each place's name is on a big wooden sign (19px or more) with its progress in a tag: "x / y" stars, "All stars!", or "New!", plus a padlock in the free app. Names are no longer painted into the drawing. Each tap area covers the picture and its sign; pressing lights the sign and a gold ring, and Bonnie hops over. The trail is about a fifth shorter (1,280 units instead of 1,600). Returning players get a **Places** button: a list of every world with its progress (a proper dialog: focus stays inside, Escape closes it); choosing one scrolls there and opens it. Bonnie's bubble is narrower and placed so it covers no sign wherever she stands.

**Shared:** `js/proto-demo.js` is one pretend save (`meadow-save-proto-demo`, players list `meadow-players-proto-demo`) used by both pages with `?demo=1` (Sam, with progress) or `?demo=new` (a new player); add `&theme=night` (any theme id) to dress it. The Clubhouse page loads the engine with those keys swapped in memory only. The prototype pages fetch their own scripts fresh each time, so a phone never shows an old copy. `prototype-compare.html` passes the pretend save to the Clubhouse too, and has a "New player" option.

**Checks:** Clubhouse 29, map 27. All pass at 375 × 667, 393 × 852, 430 × 932, 768 × 1024, 820 × 1180 and 1180 × 820, with Sam, a new player, the free app (map) and Reduce Motion. Tab, Enter and Escape were tried for real. The family's real save was unchanged after using both prototypes with the pretend save, and no game file differs from `app-store`.

**Still open:** real VoiceOver and the 2018 iPad not yet tried by hand; "Start here" (the brief said "Start there"); the map's top buttons are icons without words; on an SE the foot of the gates touches the bottom edge; the Words map isn't drawn; Bonnie's new lines aren't recorded.

## The Meadow Words map (22 November 2026)

`prototype-words-map.html`: the Words world list as an illustrated route, the same map as Maths (`js/proto-map.js` now serves both; the page sets `window.PROTO_ROUTE = 'words'`). Same options: `demo=1`, `demo=new`, `taster=1`, `view=old`, `theme=`, `selftest=1`. It loads the engine and the four Words worlds exactly as `meadow-words.html` does.

- **The drawing** (`wordsRoute()` in `js/proto-map-art.js`, 640 × 1060, about a screen and a half on a phone): the trail comes down from the Clubhouse's Words gate into **Phonics Forest** (trees wearing sounds: sh, ai, oo, ee, ch, a-e), crosses the brook by a footbridge on the **Tricky Word Trail** (signposts: said, the, was, one, they, could), passes **Sentence Meadow** (bunting spelling "The dog can run ." with sunflowers and a beehive) and ends at **Bonnie's Story Nook** (a hollow oak with a purple door, a reading rug, a bench, books and a lantern).
- **The same signs, progress, tap areas, press feedback, Bonnie, "Places" list, themes and checks** as the Maths map. "Bonnie's Story Nook" wraps onto two lines (`signW`) so it fits its tap area on phones.
- **The Clubhouse's Words gate now opens it**, and both gates carry the pretend save and theme into the maps (`demo=`, `theme=`); each map's home button goes back to the Clubhouse prototype the same way. `prototype-compare.html` has a "Words map" screen.
- **The pretend save** now adds each game's progress the first time a page with that game's worlds opens (a page loads only its own game). Before, opening the Words map first in a fresh browser crashed the set-up and showed a new player; pretend saves made before this change start again.
- **Checks:** 27, all passing at 375 × 667, 393 × 852, 430 × 932, 768 × 1024, 820 × 1180 and 1180 × 820, with Sam, a new player, the free app and Reduce Motion.
- **Gaps:** on phones the edge of the "one" signpost and the nook's books are cut off at the side (scenery only). Bonnie's new Words lines aren't recorded.

## The level maps (22 November 2026)

`js/proto-level.js`, loaded by both map pages: when a place is tapped, its levels show as a trail of stepping stones through that place instead of the engine's list. Extra options: `level=arrays` (or any world id, or its end such as `phonics`) opens that place's level map straight away, also with `view=old`; `leveltest=1` runs the level-map checks.

- **The drawing:** the place at the top is the same drawing as on the map (`ProtoArt.places`), with its name and stars on a wooden sign and the engine's own introduction below. The stones zigzag down a path, a river (Stepping Stone River, Sharing Pond) or the sea (Captain's Cove); the border trees suit the place (apple trees, pines with sounds, blossom).
- **The stones**, in the design sheet's states: done (its stars above, a paw), new (a red flag), next (a gold dashed ring; Bonnie sits beside it), locked (grey, ivy, a grey padlock), full game (grey, a gold padlock). Each has a wooden tag: "Level n", the name, and its stars, "New!", "Locked" or "Full game". The whole row is one tap.
- **The engine is not changed.** Its level list is still drawn, only hidden (`body.pl-on`); each tap presses the engine's own button for that level, so unlocking, the locked line, the full-game box and starting a level are the engine's. Each row's VoiceOver name is the engine's own (it still includes the level's description).
- **Bonnie** sits by the level to play next: the one played last if it isn't finished, else the first new level, else the first without 3 stars. She says "Level 2 next! Tap my stone." Tap a stone and she hops over, then the level starts. A locked stone shakes its tag and the engine says why.
- **The top bar** is the map's own wooden one (Meadow, grown-ups, bones); the engine's bar with the streak and shop is hidden here.
- **Checks:** 18 at first (23 after refinement 1), all passing at 375 × 667, 393 × 852, 430 × 932, 768 × 1024, 820 × 1180 and 1180 × 820, for every Maths and Words place, with Sam, a new player, the free app and Reduce Motion. The two map selftests (27) and the Clubhouse's (29) still pass.
- **Gaps:** the level descriptions are only read by VoiceOver now, not shown. Bonnie's level-map line isn't recorded. Not yet tried with real VoiceOver or on the 2018 iPad.

### Level maps refinement 1 (22 November 2026, Anthony's level-map brief)

- **The next level:** the first new level (then the one played last if it isn't on 3 stars, then the first without 3 stars). Its tag gets a gold "Next" ribbon and gold edge; its stone a gold glow and ring; Bonnie sits beside it.
- **Locked levels:** one look in every world (grey stone, ivy, padlock on the right, grey tag, no stars or flag); full-game levels differ only by a gold padlock and "Full game".
- **Scrolling:** opening a world glides to the next level if it isn't on the first screen. Back from a level (the engine's "world name" button after "Level complete!"), the map opens at the next level at once, and Bonnie hops from the stone just played to the next. Paw prints (gold dots in water) mark the trail already walked.
- **World name sign:** 26px (was 22px), thicker frame and a shadow. Captain Croak moved up so it doesn't hide him.
- **Captain's Cove:** a dotted boat route links the rocks in order; the sandbanks are smaller and at the edges.
- **Scenery:** a soft wash over both sides of the trail keeps the border trees quieter than the stones.
- **Pretend saves:** `demo=mid` (Partitioning Park 3 of 8, Phonics Forest 2 of 5) and `demo=later` (Partitioning 7 of 8, Phonics 4 of 5, and more), alongside `demo=new` and `demo=1`. The Clubhouse and both maps accept them.
- **Checks:** 23 now (one clear "Next", locked looks identical across worlds, name sign size, opening at the next level, coming back there after a level). All pass at the six sizes with every pretend save, the free app and Reduce Motion; the map (27) and Clubhouse (29) checks still pass.

## The Bone Shop: Bonnie's dressing room (22 November 2026)

`js/proto-shop.js`, loaded by both map pages: when the engine draws the Bone Shop (`Meadow.shop`), it shows a dressing room instead. Opened from the Clubhouse prototype's shop stall (`prototype-words-map.html#shop`, Back goes to the Clubhouse) or from a map's bones tag (Back goes to the meadow). Options: `#shop` opens it straight away; `shoptab=gear|coats|themes|prizes`; `try=<item id>` starts with that tried on (for screenshots); `shoptest=1` runs the checks. `prototype-compare.html` has a "Bone Shop" screen.

- **The room** is drawn to fit the space above the rail: planked wall, panelling, floorboards, bunting, a hat stand, a wardrobe with open doors, a window and a rug. Bonnie (the game's own drawing, in her outfit and coat) stands big in the middle; her words are in a bubble above her (the engine's `#shopSay`, mirrored as it changes).
- **The rail** along the bottom holds every item as a card (picture, name, price or "Yours"/"Wearing", and a "how close" bar), in four sections: Gear (the three slots, with small signs), Coats, Themes, Prizes (grouped as the engine groups them, with a "Grown-ups: change these prizes" card). One row on phones (arrows and swiping), two on tall iPads.
- **Trying on:** tapping a card shows it on Bonnie without spending anything. Gear: Bonnie is drawn by the engine's `bonnieSVG()` with that item put in the save object for the moment of drawing, then put back (never saved). Coats: her fur colours. Themes: the room's wall and window ("Just looking"), plus the theme's colour wash.
- **The panel** under Bonnie names the chosen thing and has one button: Buy (price), Wear it, Take it off, Use it, Wearing/Using, Swap (price), or "N more" with a bar. Every one presses **the engine's own button** for that item (`data-buy`, `data-wear`, `data-off`, `data-coat`, `data-usetheme`, `data-prize`, `#editPrizes`), so the engine's confirm box, the grown-up's hold, the sum check, the prices and the save are unchanged. "N more" only has Bonnie say "Keep playing to earn N more bones!".
- **Prizes** are drawn (cookie, notes, screen, ice cream, moon, sweet, clapperboard, bowling, brick, cards, tree, pizza, gift), chosen by the same word tests as the engine's emoji, so a prize a grown-up types gets a picture too.
- **The pretend saves** now include shop things: `demo=mid` wears a red collar; `demo=later` has 240 bones, a party hat, sunglasses, the red collar, a bobble hat, the golden coat and the sunset theme. Older pretend saves start again (`-v` 2).
- **Checks:** 25 (19 to 22 with fewer bones or nothing owned, where some can't apply), all passing at the six sizes with a new player, part-way, further on and Reduce Motion, from the stall and from the map. The map (27), level-map (22–23) and Clubhouse (29) checks still pass.
- **Gaps:** the engine's pop-up boxes keep their emoji (changing them means changing the engine). "Keep playing to earn N more bones!" isn't recorded. Not yet tried with real VoiceOver or on the 2018 iPad.

### Bone Shop refinement 1 (22 November 2026)

- **One vocabulary for state** (`kindOf()`): active (green `#4E8F3E`, tick, "Wearing"/"Using now"), owned (purple `#7E5BB5`, star, "Yours"), buy (gold price), short (grey price and meter), prize (paper). The card (`k-*` class, corner badge, chip, aria-label), Bonnie's badge `#psTry` (dashed "Trying on"/"Just looking" for previews; "Yours: trying on"; "Wearing") and the panel's small line all use it. The chosen card has a gold double ring.
- **Collection:** "★ N of M yours" above the rail (`#psColl`), "Yours! In your collection", and a pop plus "New in your collection!" after a purchase (found by comparing what's owned before and after the engine redraws).
- **Rail:** 52px arrows, faded edges (`more-l`/`more-r`), the current section name (`#psWhere`), a scroll bar (`#psThumb`, hidden below 700px tall), `inView()` keeps a tapped card clear of the arrows, the arrow step keeps the last card seen, and one nudge (`peek()`) on first opening (not with Reduce Motion, `try=` or tests). Cards are 74px on short screens.
- **Themes:** `themeMagic()` adds each theme's touch (stars, lights, snow, bubbles, glow, embers, blocks) to the wall (`#psWall`) and window; `#psHalo` keeps a soft light behind Bonnie; the bubble stays paper.
- **Prizes:** the last, smaller, paper-coloured tab (`.minor`), smaller pictures (`.prize`), "Set by your grown-up".
- **Checks:** 31 to 38 depending on the save (new ones: states and colours, badge/panel/button agreement, rail arrows and fade, half-hidden card, section name, collection count, theme magic and halo, prizes quieter, a real purchase then the save restored). All pass at SE, 393, 430, 768, 820 and 1180, with a new player, demo 1, mid, later and Reduce Motion. Maths (27), level maps (23) and Clubhouse (29) still pass.

## Checks (`selftest=1`, first version)

All 13 pass at iPhone SE (375 × 667), iPhone (393 × 852) and iPad (820 × 1180): every maths world has a place; every tap target is at least 44 × 44; every place has a VoiceOver name that says its stars; places don't overlap; nothing is wider than the screen; Bonnie has a button; tapping a place opens the real level map with the engine's locks; the top bar comes back; "Meadow" returns.

## Known gaps

- Bonnie's new lines aren't recorded, so the website uses the device voice for them and the app would say nothing.
- The explorer's journal comes in a later phase.
- `tools/build-app.mjs` copies the whole `js/` folder, so the two prototype files would ride along in an app build (unused). Leave this branch out of app builds.
