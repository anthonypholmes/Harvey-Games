# Meadow Clubhouse App Store project: handoff

**Last updated:** 12 November 2026
**Repo:** `anthonypholmes/Harvey-Games`. Work happens on the **`app-store`** branch. `main` is the live website (holmeshouse.co.uk) and must not be touched.
**Owner:** Anthony. He isn't a developer, so explain steps plainly, give commands to paste, and do the technical work yourself where you can.

## The goal

Ship Meadow Clubhouse (Year 2 maths and English games with Bonnie the dog) as an **iPad app**: a free download with a taster, plus one in-app purchase that unlocks everything (about £3.99).

- Free: Bonnie's Walk and the first level of every world (changed 12 November 2026; it was two whole worlds)
- Kids category, age band 6–8, no ads, no tracking, "Data Not Collected"
- Rough timeline: about 17 weeks at evenings-and-weekends pace. Don't promise an earlier date.

## Anthony's setup

- **Intel MacBook Pro, macOS Sequoia 15.8**, with **Xcode 26.3**. That's the newest Xcode that runs on Sequoia, and Xcode 26 builds are accepted by App Store Connect.
- Xcode 27 is Apple silicon only. For updates from around spring 2027, plan on a cloud build service (Capgo Build, Codemagic or GitHub Actions macOS) or an M-series Mac.
- **His iPad's iPadOS is newer than Xcode 26.3 supports**, so he can't run the app on it from Xcode. Testing happens in the **iPad simulator** for now, and on the real iPad through **TestFlight** once the paid Apple Developer Program is approved (about £79 a year; he's been advised to enrol).
- **Known simulator bug:** the iOS 26.3 simulator shows all emoji as "?" boxes. Apple fixed this in Xcode 26.4, which needs Tahoe. Real devices are fine, so ignore it.
- Node 22+ and npm 11 are installed. An npm cache permissions error was fixed with `sudo chown`.
- ElevenLabs Starter plan ($6 a month), which covers commercial use.
- GitHub Desktop for commits, pulls and pushes.

## Done so far (all on `app-store`)

### Phase 1: make it shippable ✅
- Removed `audio/whole/` (whole-sentence recordings with family names: harvey, anthony, samantha, rex, alaya, rory). `manifest.json` `whole` and `wholeTexts` are now empty, and `tools/names.txt` has no `*` names. Names are still joined in from `audio/names/` (105 names).
- Fonts are bundled in `fonts/` (Fredoka, Nunito, Andika, under the OFL licence, fetched with `tools/get-fonts.sh`). There are no Google Fonts requests now, and `sw.js` caches the local fonts.
- Website-only features switch off inside the app (`window.MEADOW_IN_APP`): no service worker, no "Add to Home Screen" banner, and no background clip download.
- The starter prizes were left as they are. They're generic and parents can edit them, and their voice lines are already recorded.

### Phase 2: the iPad app (Capacitor 8), in progress
- `capacitor.config.json`: app ID `uk.co.holmeshouse.meadow`, name "Meadow Clubhouse", `webDir: app-www`.
- `tools/build-app.mjs` copies only the game files into `app-www/` (git-ignored, about 1,850 files, 37 MB).
- npm scripts: `app:build`, `app:sync` (build plus `npx cap sync ios`) and `app:open`.
- `ios/` Xcode project committed (Swift Package Manager, no CocoaPods). Set to **iPad only** (`TARGETED_DEVICE_FAMILY = 2`).
- `ios/App/App/AppDelegate.swift` sets the AVAudioSession category to `.playback`, so sound plays and the silent switch doesn't mute Bonnie.
- `js/app-storage.js` is loaded first on every page and only runs inside the app. It:
  - sets `window.MEADOW_IN_APP = true`
  - adds safe-area padding so pages clear the status bar (**confirmed fixed**)
  - mirrors every `meadow*` / `harvey*` localStorage key into Capacitor Preferences, and restores them and reloads if iOS clears the web view's storage
- `docs/APP_SETUP.md` is the step-by-step Mac guide.
- The app **runs in the iPad simulator**. The Clubhouse, Bonnie's Walk and the games load.

## Solved: Bonnie used the device voice, not the ElevenLabs clips ✅

- **Fixed 11 November 2026, confirmed by ear in the simulator.** Cause: Capacitor serves media files (mp3 and so on) without an HTTP status, so `fetch` reports status 0 and `res.ok` false even though the file arrives. `clipBuffer()` in `bonnie-voice.js` now accepts status 0 inside the app, provided the file isn't empty.
- The console log can be read without Safari: `xcrun simctl launch --console-pty booted uk.co.holmeshouse.meadow`.
- The notes below are the history of the problem, kept for reference.
- In the simulator, lines with no numbers (such as "Woof! Hi Harvey! Pick a game…") used the **device text-to-speech voice**.
- Lines **with numbers always use the device voice by design**, on the website too, because there are no number clips yet (that's Phase 3). Don't confuse the two.
- What's been tried in `bonnie-voice.js`:
  - In the app, `plan()` no longer needs `navigator.userActivation`.
  - Sound is unlocked on `touchend` and `click` as well as `pointerdown`.
  - `playClips()` resumes the AudioContext first, and only falls back to the device voice if it won't start.
- In Chrome with a fake `window.Capacitor`, the logic correctly chooses clips. So the cause is specific to iOS or the simulator.
- **Diagnostics added:** inside the app, every fallback logs `[Bonnie] device voice: <reason>` to the console. `BonnieVoice.why` holds the last reason. Possible reasons:
  - `clip list not loaded`: `audio/manifest.json` fetch failed
  - `no audio`
  - `no clip for "…"`
  - `clip failed to load or decode: …`: fetch or `decodeAudioData` failed
  - `sound would not start (<state>)`: AudioContext not running, possibly "interrupted"
- **Next step:** run the app in the simulator, open the Safari Web Inspector (Develop → Simulator → localhost → Console), tap, open the Clubhouse, and read the `[Bonnie] device voice:` lines. Then fix the cause. Claude Code on the Mac can also try `xcrun simctl spawn booted log stream` to read the logs directly.
- Ideas depending on the reason:
  - decode failure: check the MP3s decode in WKWebView, or try `new Audio()` as a fallback
  - "interrupted" or suspended state: recreate the AudioContext after a tap, or revisit the AVAudioSession setup in AppDelegate
  - manifest failure: check the Capacitor scheme fetch

## Phase 3: number voice ✅ (done 11 November 2026)

- **How it works:** a sentence with numbers ("What goes with 4 to make 6?") is cut at each number and maths sign. The words in between ("What goes with", "to make") are ordinary clips, signs are clips of their words (+ "plus", = "equals", × "times", − "take away", a lone ? "what?"), and each number is its own clip in `audio/numbers/`, listed under `numbers` in `audio/manifest.json`. A sentence that already has a whole recording still uses it.
- **Code:** `numberParts`, `numberFiles` and `numberPlan` in `bonnie-voice.js`. `numberLines` in `worlds/y2-maths-kit.js` and `js/meadow-core.js` lists the number sentences (questions, clues, step cards) for the recorder. `tools/make-voice.mjs` records the joining pieces and the numbers.
- **Numbers recorded:** 0 to 1,000 whole, then 2,000 to 9,000, plus plurals in use ("fives"). 2,463 plays as "two thousand" + "four hundred and sixty-three". Anything bigger, or shapes like 2.5, stays on the device voice. `--numbers-to 100` records fewer.
- **Recorded:** 1,018 number clips (17 MB in `audio/numbers/`) and 388 word pieces. It cost about 12,100 credits for about 30,500 characters: `eleven_v4` billed roughly 0.4 credits a character on this account. 2,827 credits were left of November's 40,000.
- **Coverage:** of 7,669 sampled number sentences, all play as clips except Bonnie's silly guesses of 10,000 or more ("Is it 90000?!"). Sentences the sampler doesn't list (for example a question's on-screen tip) and numbers in shapes like 2.5 still use the device voice, as do names with no name clip.
- **Sound:** Anthony listened to the trial (numbers to 20): slightly unnatural at the joins, but fine.
- The recorder calls the ElevenLabs web API directly. Loading the SDK (24,000 files) took many minutes from this iCloud-synced folder; it is only used for `--list-voices` now.
- `npm run voice:check` should again report "new clips needed: 0".

## Phase 4: free taster and unlock (game side built 12 November 2026; the App Store side waits for the developer account)

- **What a family sees:** in the app, every world opens and its level 1 is free ("Level 1 is free to play" on the world card). Levels 2 onwards have a padlock and a "Full game" badge. Tapping one, or tapping "Next level" after level 1, makes Bonnie say "This level is in the full game. Go and get a grown-up!". The grown-up answers the usual sum, then sees the unlock screen: the price from the App Store, **Unlock everything**, and **Restore purchase**. The grown-ups area also has a "Full game" section at the top. On the website nothing is locked.
- **Why level 1 of every world (Anthony, 12 November 2026):** a child might love Captain's Cove and dislike partitioning, so every world gets a taster. `FREE_LEVELS` in `js/meadow-core.js` sets how many levels are free. Bonnie's Walk is free and still draws its questions from every level.
- **Game code:** "THE FULL GAME" in `js/meadow-core.js` (`FREE_LEVELS`, `paidLevel`, `storeCall`, `checkFullGame`), plus `paidModal`, `unlockScreen` and `fullGameDone`. The answer is kept in the `meadow-full-game` key (so it works offline, and `js/app-storage.js` copies it to the app's own storage) and is checked with the App Store every time a page opens, so a refund locks the game again. It is not part of the backup file.
- **App Store code:** the `MeadowStore` plugin at the bottom of `ios/App/App/AppDelegate.swift`. It uses Apple's StoreKit 2 directly, with no RevenueCat and no other service, so the "Data Not Collected" label stays true. `SceneDelegate.swift` now opens `MeadowViewController`, which registers the plugin. It handles Ask to Buy (pending), refunds, and purchases made on another device.
- **Product ID:** `uk.co.holmeshouse.meadow.fullgame`, a non-consumable. The product made in App Store Connect must use exactly this ID, with Family Sharing switched on there.
- **Testing without the developer account:** `ios/App/App/Meadow.storekit` is a pretend product (£3.99) for Xcode, and the shared scheme `App.xcscheme` points at it. Press ▶ in Xcode (not a build from the command line) and the unlock screen should show the price and let you "buy" for free. (The scheme path is `../../App/Meadow.storekit`; quit and reopen Xcode after pulling.) If the button says "Try again" instead, choose Product → Scheme → Edit Scheme → Run → Options and pick Meadow.storekit under StoreKit Configuration. Debug → StoreKit → Manage Transactions lets you delete the pretend purchase or refund it.
- **Test page:** `tests/unlock-test.html` (33 checks with a pretend App Store).
- **Still to do for Phase 4:**
  - (Done 12 November 2026) Anthony tried the pretend purchase in the simulator from Xcode: the unlock screen and the purchase work.
  - Once the Apple Developer Program is approved: make the product in App Store Connect, switch on Family Sharing for it, and test with a sandbox Apple Account on a real iPad through TestFlight.

## Phase 5: child profiles ("players") ✅ (built 12 November 2026)

- **What a family sees (app only):** the Clubhouse has a **Switch player** button. It opens "Who's playing?" with a button for each child (name and bones) and **New player** (up to 4). A new player types their name and starts fresh: their own bones, stars, hats, coat, theme, walk streak and prizes. With more than one player, the app asks "Who's playing?" once each time it is opened. The website has no players.
- **Removing a player** is in the grown-ups area (behind the sum), in the "Players" section at the top, and asks first. The last player can't be removed.
- **How it is stored:** the first player is the save that was always there (`meadow-save-v1`), so nothing had to be moved. Each added player has a save of their own (`meadow-save-v1-p2`, `-p3` and so on; an id is never reused). `meadow-players` holds the list and who is playing. An added player never reads the old website saves. A player added but never named is tidied away.
- **Shared by everyone:** the full-game purchase. **Per player:** everything else, including the grown-ups' settings and prizes (a new player starts with a copy of the prizes, sound, school years and walk mix of the player before).
- **Code:** "PLAYERS" in `js/meadow-core.js` (`Meadow.players`: list, add, switchTo, remove), the picker in `index.html` (`playerCard`, `renderPlayers`), and the "Players" section in `parentScreen`. `js/app-storage.js` now restores when any player's save is in the app's copy.
- **Test page:** `tests/players-test.html` (25 checks).
- **Known gaps:**
  - (Fixed 12 November 2026) "Back up progress" (`meadow-backup.js`) now covers every player: each added player's save and the list of players go in the backup, and restoring puts them all back (players on the device that aren't in the backup are removed, and "Undo the last restore" brings them back). A backup made in the app, which has none of the older website saves, used to be refused with "no player progress"; it is now accepted. The panel shows a line for each player. The full-game purchase is still never in a backup. Older website backups still work. Test page: `tests/backup-test.html` (26 checks). Not yet tried by hand in the simulator: saving the file through the iPad share sheet, and choosing a file to restore.
  - (Done 12 November 2026: "Woof! Who's playing today?" and "This level is in the full game." are recorded.)

## Phase 6: store listing (started 12 November 2026)

- **App icon ✅:** the placeholder is replaced with Bonnie on a meadow. It is drawn by `tools/app-icon.html` with the game's own Bonnie, and `sh tools/make-icon.sh` (needs Google Chrome) turns it into `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png` (1024 × 1024, no see-through parts). The website's icons (`icon-512.png` and so on) are unchanged.
- **Listing text ✅ (description rewritten warmer on 12 November 2026, at Anthony's request):** `docs/APP_STORE_LISTING.md` has everything to paste into App Store Connect: name, subtitle, description, keywords, the privacy label answers, the in-app purchase fields, notes for the reviewer, a screenshot plan and a checklist. All of it is checked against Apple's character limits.
- **Privacy policy and support page ✅:** `privacy.html` and `support.html`, with Anthony Holmes and anthony@holmeshouse.co.uk as the contact. They are not in the app (`tools/build-app.mjs` doesn't copy them) and use the device's own lettering, because `main` has no `fonts/` folder. With Anthony's go-ahead they were committed on **local `main`** on 12 November 2026 (one commit, only those two files). **Pushed, and both pages are live** (checked 12 November 2026: https://holmeshouse.co.uk/privacy.html and /support.html both open).
- **Export compliance ✅:** `ITSAppUsesNonExemptEncryption` is set to false in `Info.plist`, so App Store Connect won't ask the encryption question on every upload.
- **Still to do for Phase 6:**
  - (Done 12 November 2026) `main` is pushed and the privacy and support pages are live.
  - (Done 12 November 2026) Screenshots: six iPad 13-inch pictures (2064 × 2752) in `docs/screenshots/`, made from the real game pages by `sh tools/make-screenshots.sh` (needs Google Chrome; the page is `tools/screenshots.html`). Each has a caption above the game. The player is a made-up "Sam". To change a caption or a scene, edit `SHOTS` in that page and run the script again.
  - (Done 12 November 2026) Accessibility pass. `tests/a11y-audit.js` is a checker to run in a browser console on any screen (`a11yAudit()`): it lists buttons with no name for VoiceOver, buttons under 44 × 44, and text too close in colour to its background. It was run on the Clubhouse, both world lists, a level map, a level in all 10 worlds, the Bone Shop, the grown-ups area and Bonnie's Walk, and now reports nothing except the decorative frog.
    - **Contrast (the main change):** white writing on the light green, orange and pink was about 3 to 1. Buttons (`.btn`, `.btn.green`, `.btn.berry`, `.tab.on`), the Clubhouse game cards, the Bone Shop and walk buttons, and the level-number circles now use the darker shade of each colour, at least 4.5 to 1 for small writing, in every theme. The orange "ones" digit in the maths worlds is slightly deeper (`--c-ink`). The App Store screenshots were remade with the new colours.
    - **Names for VoiceOver:** every button already had one except the speaker button in Bonnie's Story Nook, now "Hear the question".
    - **Tap sizes:** the phonics sound dots keep their look but their tap area is now 44 × 44. The page title in the top bar is 44 high.
    - **Reduce Motion:** already handled (a rule in the core CSS switches off animations and hides the butterflies and frog).
    - **Not done:** nothing has been tried with VoiceOver switched on, on a real iPad. Dragging letters and tiles can't be done with VoiceOver, though every drag also works as a tap. Text does not grow with the iPad's Larger Text setting. Do a VoiceOver walk-through during TestFlight.
  - (Done 12 November 2026) "Back up progress" fix (see Phase 5 known gaps).
  - Anthony, once the developer account is active: Small Business Program, the Paid Apps agreement with bank and tax details, create the app and the in-app purchase in App Store Connect.
  - The home-screen name "Meadow Clubhouse" (16 letters) may be shortened by iPadOS under the icon. Check on a real iPad; "Meadow Club" would fit if so (`CFBundleDisplayName` in `Info.plist`).

## Next up (as of 12 November 2026)

1. **Anthony:** enrol in the Apple Developer Program if not done yet. Everything after this waits for it.
2. Once approved: the App Store Connect setup (Phase 6 list), then TestFlight on the real iPad.
3. While waiting: try "Export or import save" by hand in the simulator (Phase 5 known gaps).

If Xcode says a package such as CapApp-SPM is missing after the project moves or is pulled afresh, quit Xcode and reopen it with `npm run app:open`.

## What comes next (the plan)

1. **Finish Phase 2:** the voice is fixed. Checked in the simulator on 11 November 2026: saves survive a full close (bones 13 → 14 kept, and the Preferences copy matched), the Clubhouse and Bonnie's Walk lay out correctly in portrait and landscape, and the app files contain no internet addresses. Still to do on the real iPad through TestFlight: a true Airplane Mode test, and a look at the other game pages in landscape. Original list: offline (Airplane Mode), that saves survive a full close, and the layout in portrait and landscape.
2. **Phase 3, number voice (done, see above):** record number clips (0 to 1,000) and joining words ("plus", "take away", "makes" and so on) with ElevenLabs. Join them like names so maths lines use Bonnie's voice. Run `npm run voice:check` first to see the credit cost.
3. **Phase 4, free taster and unlock (game side built, see above):** padlocks on the paid worlds, an unlock screen behind the existing grown-ups gate, one non-consumable in-app purchase (the RevenueCat Capacitor plugin is the easiest route), Restore Purchases, Family Sharing, and sandbox testing.
4. **Phase 5, child profiles (built, see above):** up to 4, each with its own name, bones, stars and Bonnie outfit. Move the existing save into the first profile.
5. **Phase 6, store listing (started, see above):** App Store Connect, Small Business Program (15%), Kids category, a privacy policy on holmeshouse.co.uk, a support page, iPad screenshots, a description leading with "Year 2 / KS1", basic accessibility, and a real app icon (currently Capacitor's placeholder).
6. **Phase 7:** TestFlight with 5–10 families.
7. **Phase 8:** submit, launch, and get early reviews.

## Working notes
- After any change to the game files: `npm run app:sync`, then ▶ in Xcode.
- The game's test pages are in `tests/` (walk, teach, dig, week, confidence, bones, number-bonds, captains-cove, unlock, players, backup). They all pass. Re-run them after changes.
- `npm run voice:check` (dry run) should report "new clips needed: 0" unless lines changed.
- Commit as Anthony. Never commit `app-www/`, `node_modules/` or `.env.local`.
- Delete stray macOS duplicates such as "config 2.xml" if they appear.
- **The project moved on 12 November 2026** from the iCloud-synced Documents folder to `~/Developer/GitHub/Harvey-Games`, which should stop the stray duplicates below. Four that had been committed were removed (commit `1d1195f`). If GitHub Desktop or Xcode still point at the old place, open the project from the new one.
- **Stray duplicates were a standing problem.** The project used to live in the iCloud-synced Documents folder, and macOS kept making copies with a number before the ending ("config 4.xml", and on 12 November 2026 about 1,100 "… 2.mp3" files in `audio/clips` and `audio/numbers`, all exact copies). Never commit them. `tools/build-app.mjs` now leaves them out of the app. A duplicate inside the hidden `.git` folder ("HEAD 2") once stopped git reaching GitHub. If any appear again, delete them.
- Claude's shell can commit but cannot push (no GitHub sign-in). Anthony pushes from GitHub Desktop. On `main`, GitHub Desktop lists about 6,500 "new" files (`app-www` and `ios`, which only `app-store` ignores): never commit those.
- Anthony tends to work in bursts. Keep each step small enough to finish in one sitting, and don't compress the timeline.


### Bone Shop: Bonnie's coat colours ✅ (12 Nov)
- Six coats in the "Dress Up Bonnie" tab: Chocolate (the real Bonnie, free), Golden 60, Fox Red 90, Cream 120, Black 150, Silver Grey 200 bones.
- `COATS` in `js/meadow-core.js`. The save has `coat` and `owned.coats`, and `applyTheme()` sets her fur colours everywhere, including inside the maths worlds (`.mm`) and on the Clubhouse page.
- Fixed with it: `catchUp()` (merging the old saves) now keeps `owned.coats`.
- Bonnie and her name stay the same. Customising is through her coat, not a new animal or name.
- The 5 coat thank-you lines and the 2 unlock lines were recorded on 12 November 2026 (8 clips, 179 characters). To record new lines: `npm run voice -- --voice <the voice id in audio/manifest.json>`.
