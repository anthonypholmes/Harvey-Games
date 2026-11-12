# Meadow Clubhouse App Store project: handoff

**Last updated:** 12 November 2026
**Repo:** `anthonypholmes/Harvey-Games`. Work happens on the **`app-store`** branch. `main` is the live website (holmeshouse.co.uk) and must not be touched.
**Owner:** Anthony. He isn't a developer, so explain steps plainly, give commands to paste, and do the technical work yourself where you can.

## The goal

Ship Meadow Clubhouse (Year 2 maths and English games with Bonnie the dog) as an **iPad app**: a free download with a taster, plus one in-app purchase that unlocks everything (about £3.99).

- Free: Bonnie's Walk, the first maths world (Partitioning Park) and the first English world (Phonics Forest)
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

- **What a family sees:** in the app, every world except The Partitioning Park and Phonics Forest has a padlock and a "FULL GAME" ribbon. Tapping one makes Bonnie say "Go and get a grown-up!". The grown-up answers the usual sum, then sees the unlock screen: the price from the App Store, **Unlock everything**, and **Restore purchase**. The grown-ups area also has a "Full game" section at the top. On the website nothing is locked.
- **Bonnie's Walk is free and still draws its questions from every world.** That was left as it was; change `walkMathsPool` / `walkEnglishPool` if the walk should only use the free worlds.
- **Game code:** "THE FULL GAME" in `js/meadow-core.js` (`FREE_WORLDS`, `paidWorld`, `storeCall`, `checkFullGame`), plus `paidModal`, `unlockScreen` and `fullGameDone`. The answer is kept in the `meadow-full-game` key (so it works offline, and `js/app-storage.js` copies it to the app's own storage) and is checked with the App Store every time a page opens, so a refund locks the game again. It is not part of the backup file.
- **App Store code:** the `MeadowStore` plugin at the bottom of `ios/App/App/AppDelegate.swift`. It uses Apple's StoreKit 2 directly, with no RevenueCat and no other service, so the "Data Not Collected" label stays true. `SceneDelegate.swift` now opens `MeadowViewController`, which registers the plugin. It handles Ask to Buy (pending), refunds, and purchases made on another device.
- **Product ID:** `uk.co.holmeshouse.meadow.fullgame`, a non-consumable. The product made in App Store Connect must use exactly this ID, with Family Sharing switched on there.
- **Testing without the developer account:** `ios/App/App/Meadow.storekit` is a pretend product (£3.99) for Xcode, and the shared scheme `App.xcscheme` points at it. Press ▶ in Xcode (not a build from the command line) and the unlock screen should show the price and let you "buy" for free. (The scheme path is `../../App/Meadow.storekit`; quit and reopen Xcode after pulling.) If the button says "Try again" instead, choose Product → Scheme → Edit Scheme → Run → Options and pick Meadow.storekit under StoreKit Configuration. Debug → StoreKit → Manage Transactions lets you delete the pretend purchase or refund it.
- **Test page:** `tests/unlock-test.html` (30 checks with a pretend App Store).
- **Still to do for Phase 4:**
  - Try the pretend purchase in the simulator from Xcode (above).
  - Once the Apple Developer Program is approved: make the product in App Store Connect, switch on Family Sharing for it, and test with a sandbox Apple Account on a real iPad through TestFlight.

## What comes next (the plan)

1. **Finish Phase 2:** the voice is fixed. Checked in the simulator on 11 November 2026: saves survive a full close (bones 13 → 14 kept, and the Preferences copy matched), the Clubhouse and Bonnie's Walk lay out correctly in portrait and landscape, and the app files contain no internet addresses. Still to do on the real iPad through TestFlight: a true Airplane Mode test, and a look at the other game pages in landscape. Original list: offline (Airplane Mode), that saves survive a full close, and the layout in portrait and landscape.
2. **Phase 3, number voice (done, see above):** record number clips (0 to 1,000) and joining words ("plus", "take away", "makes" and so on) with ElevenLabs. Join them like names so maths lines use Bonnie's voice. Run `npm run voice:check` first to see the credit cost.
3. **Phase 4, free taster and unlock (game side built, see above):** padlocks on the paid worlds, an unlock screen behind the existing grown-ups gate, one non-consumable in-app purchase (the RevenueCat Capacitor plugin is the easiest route), Restore Purchases, Family Sharing, and sandbox testing.
4. **Phase 5, child profiles:** up to 4, each with its own name, bones, stars and Bonnie outfit. Move the existing save into the first profile.
5. **Phase 6, store listing:** App Store Connect, Small Business Program (15%), Kids category, a privacy policy on holmeshouse.co.uk, a support page, iPad screenshots, a description leading with "Year 2 / KS1", basic accessibility, and a real app icon (currently Capacitor's placeholder).
6. **Phase 7:** TestFlight with 5–10 families.
7. **Phase 8:** submit, launch, and get early reviews.

## Working notes
- After any change to the game files: `npm run app:sync`, then ▶ in Xcode.
- The game's test pages are in `tests/` (walk, teach, dig, week, confidence, bones, number-bonds, captains-cove, unlock). They all pass. Re-run them after changes.
- `npm run voice:check` (dry run) should report "new clips needed: 0" unless lines changed.
- Commit as Anthony. Never commit `app-www/`, `node_modules/` or `.env.local`.
- Delete stray macOS duplicates such as "config 2.xml" if they appear.
- Anthony tends to work in bursts. Keep each step small enough to finish in one sitting, and don't compress the timeline.


### Bone Shop: Bonnie's coat colours ✅ (12 Nov)
- Six coats in the "Dress Up Bonnie" tab: Chocolate (the real Bonnie, free), Golden 60, Fox Red 90, Cream 120, Black 150, Silver Grey 200 bones.
- `COATS` in `js/meadow-core.js`. The save has `coat` and `owned.coats`, and `applyTheme()` sets her fur colours everywhere, including inside the maths worlds (`.mm`) and on the Clubhouse page.
- Fixed with it: `catchUp()` (merging the old saves) now keeps `owned.coats`.
- Bonnie and her name stay the same. Customising is through her coat, not a new animal or name.
- The 5 coat thank-you lines and the 2 unlock lines were recorded on 12 November 2026 (8 clips, 179 characters). To record new lines: `npm run voice -- --voice <the voice id in audio/manifest.json>`.
