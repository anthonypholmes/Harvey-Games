# Meadow Clubhouse App Store project: handoff

**Last updated:** 13 November 2026
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
  - (Done 12 November 2026) The home-screen name was cut short on a real iPad ("MeadowCl…"), so the name under the icon is now "Meadow Club" (`CFBundleDisplayName` in `Info.plist`). The App Store name is still "Meadow Clubhouse".

## Next up (as of 12 November 2026)

1. **Anthony:** enrol in the Apple Developer Program if not done yet. Everything after this waits for it.
2. Once approved: the App Store Connect setup (Phase 6 list), then TestFlight on the real iPad.
3. While waiting: try "Export or import save" by hand in the simulator (Phase 5 known gaps).

If Xcode says a package such as CapApp-SPM is missing after the project moves or is pulled afresh, quit Xcode and reopen it with `npm run app:open`.

## Children's names ✅ (built 13 November 2026)

**The principle:** personalisation and learning are separate, the way primary school textbooks do it. The player's own name is for the Clubhouse, greetings and praise. Questions and stories are about a small bank of story characters.

- **The player's name.** Always shown on screen. Bonnie only *says* it if it has a recording (`tools/names.txt`, 109 names with the story characters). For any other name she says the **same line without the name**, as its own recording: "Well done, {N}!" → "Well done!", "Hi {N}!" → "Hi!". No stand-in word ("buddy" and "friend" are gone, with their recordings). So a child called Zebedee hears Bonnie's own voice everywhere, never the device voice.
  - `dropName()` in `bonnie-voice.js` takes the name out by rule (after a comma, before ! ? or ., or at the start of a sentence). `NAME_FREE` there is the place for a line the rules would leave sounding odd; nothing needs it yet. `plan()` uses the name-free clip whenever the name has no recording.
  - **The screen still shows the name** in Bonnie's speech bubble, even when she doesn't say it (a choice: change it in one place if Anthony would like the bubble to match the voice).
  - `tools/make-voice.mjs` records the name-free sentences (33 of them) and warns if a new line needs the name to make sense. `--list-name-lines` lists every line with the name in it.
- **Story characters:** Sarah, Jack, Lucy, Oliver, Mia, Tom, Priya, Ben, Ava and Leo (`CHARACTERS` in `js/meadow-core.js`, each with `pronoun` and `their`). `Meadow.character()` picks one when a question is made, so the writing, the voice and the answer all name the same child. `WHO()` in `worlds/y2-maths-kit.js` is the short way for a maths word problem. "Sam" is not in the bank because one sentence in Sentence Meadow already uses it.
  - Every `{N}` is out of the questions: the maths word problems (Number Bonds Burrow, Array Orchard, Sharing Pond, Captain's Cove), Sentence Meadow, Tricky Word Trail and all of Story Nook. The stories and sentences each have a fixed character.
  - A sentence about a character is **recorded with the name in it** ("Tom has a green hat."), which sounds more natural than joining a name on. For the number sentences the first piece carries the name ("Mia has" + 12 + "carrots.").
  - Use the same bank for Year 3 and Year 4. Keep the player's name out of anything a child has to read to answer.
- **Grown-ups:** under the name box it says "Bonnie can say this name ✓" or "Bonnie will write this name but not say it", and updates as the name is typed.
- **Recorded:** 142 clips, about 2,700 characters (roughly 1,080 credits). `npm run voice:check` reports 0 to make.
- **Test page:** `tests/voice-name-test.html` (14 checks). It opens all four game pages as Zebedee (no recording), Harvey (recorded), Jack (recorded and a story character) and Red (no recording, and an ordinary word in the stories), and checks that every one of about 9,600 lines is in Bonnie's recorded voice, that the name is only ever where it can be left out, and that no question has the player's name. The only lines left on the device voice are Bonnie's silly guesses of 10,000 or more.
- **Not checked:** nobody has listened to the new clips. Listen to a few name-free lines ("Well done!", "Hi!") and a story or two, and to how "Priya" is said.
- **Don't** (still true): generate names live with ElevenLabs in the app, use the device voice for just the name, let parents record names, or grow the list to hundreds.

## The device voice is gone from the app ✅ (14 November 2026)

- **The bug (found on the real iPad, build 3):** in Story Nook, Anthony locked the iPad and shut the cover, and the device's robotic voice started talking through the locked iPad. Cause: a line came due just after locking, Bonnie's recording could not start (iOS had paused the sound), so `bonnie-voice.js` fell back to the device voice, which iOS lets carry on while locked.
- **Fix 1: nothing is said while the iPad is locked or the app is put away.** `V.sleep()` in `bonnie-voice.js` stops everything on `visibilitychange` and `pagehide`, `say()` does nothing while the page is hidden, and `MeadowViewController` in `AppDelegate.swift` calls it too when the app stops being active.
- **Fix 2: the app never uses the device voice.** If a line has no recording, or the recording can't start, Bonnie says nothing and the words stay on screen (`deviceOrQuiet()`). The website still uses the device voice. Every line has a recording (see the names test), so in normal play this only affects Bonnie's silly guesses of 10,000 or more.
- Tests: four new checks in `tests/voice-name-test.html` (18 in all). Confirmed on the real iPad in build 4.

## Text size and fonts ✅ (done 13 November 2026)

Every screen was looked at on a 2018 iPad's size, upright and sideways (pictures before and after, side by side, are in `docs/text-check/`).

- **Andika for what a child reads to learn.** Meadow Words, Bonnie's Walk and Bonnie's speech bubble already used it. **Meadow Maths did not:** its questions, clues, explanations, step cards, word answers and the Captain's conjectures were in Fredoka or Nunito, and are now Andika. The block is at the end of the styles in `worlds/y2-maths-kit.js` ("text a child reads").
- **Left in Fredoka on purpose:** the sum itself ("5 + 8 ="), the answer box, the number keys and number choices, and the number line. They are numerals in the game's own look, not sentences. Say if they should be Andika too.
- **The question is the biggest writing on the card:** 25 to 31px in maths (it was 22 to 28px), above 17 to 18px supporting text.
- **Nothing a child must act on is under 1rem (16px):** Bonnie's speech bubble 1.15rem, hints and notes 1rem (they were 0.9), small buttons 1rem, the level blurbs 1rem, "Level 1 is free to play" 1rem, the maths instructions 18px. Still smaller, as true small print: the "Full game" ribbon, the hint numbers, the labels on the place-value blocks, and the grown-ups' notes (0.93rem, for adults).
- **Less bold:** Fredoka buttons, number keys, chips, level numbers, badges and banners are 600. 700 is kept for the page and world titles, the Clubhouse sign, the game names, the two big PLAY buttons, "Let's play!" and the sum.
- All the test pages pass. The App Store screenshots were made again with the new look.
- **Not checked:** on the real iPad, and with the three shop themes other than the meadow.

## Submitted for review (14 November 2026)

- **Version 1.0 is with Apple for review.** Builds 3 and 4 went to TestFlight; build 4 has the fix for the device voice talking through a locked iPad, and **build 4 is the one submitted**. Anthony confirmed on the real iPad that locking it mid-story is now silent.
- The in-app purchase was bought successfully in TestFlight once the Paid Apps agreement went Active. Restore purchase had not been confirmed as tested when this was written.
- Accessibility labels: claim only Sufficient Contrast and Reduced Motion. VoiceOver, Voice Control and Larger Text are not supported or not tested.
- TestFlight refuses child Apple Accounts, so the planned family testing was skipped. The first week after release is the real family test; fixes go out as 1.0.1.
- **If Apple rejects it or asks a question,** paste their message into the session. Likely topics: the parental gate, where the purchase is, Kids category rules. The reviewer notes are in `docs/APP_STORE_LISTING.md`.
- **After approval:** release it (if manual release was chosen), install it on the children's iPads from the App Store, and ask a few families for feedback and a rating.
- **For a later version:** a VoiceOver walk-through and fixes, a layout that fits when the iPad is sideways, recordings for Bonnie's guesses of 10,000 or more.

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
- The game's test pages are in `tests/` (walk, teach, dig, week, confidence, bones, number-bonds, captains-cove, unlock, players, backup, voice-name). They all pass. Re-run them after changes.
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

### Grown-ups area tidy-up ✅ (12 Nov)
- No redesign: the same settings, on a page about 40% shorter. All in `parentScreen` in `js/meadow-core.js`.
- **Two groups:** "For every game" (players, full game, this week, bones, prizes, walk, sound, backup) and "<this game> only" (progress, stars, how each answer was reached), with the link to the other game's page in the second group.
- **Fold-away parts** (closed until tapped): "Bones spent", "Real-life prizes", "How each answer was reached" and "How bones are earned". The page remembers which are open while it redraws (`parentOpen`), and a redraw no longer jumps to the top.
- **Name box:** "Playing as" can be changed here with **Save name**, as well as on the Clubhouse.
- **In the app only:** the reading-speed slider and the "Recorded Bonnie voice" line are hidden (speed only changes the device voice). The website still shows them.
- **Smaller fixes:** the "Teach Bonnie" tick box no longer drops below its label; radio buttons are the same size as tick boxes; "School years" hides while there is only one year; worlds with nothing played are left out of the help tables; the backup button says "Back up or restore".
- **The grown-up sum is easier:** 6 to 9 times 11 or 12 (it was up to 9 × 19).
- All the test pages pass. Not yet looked at in the simulator.

### TestFlight ✅ (12 Nov)
- The developer account is active, the app and the in-app purchase are made in App Store Connect, and **build 1 (version 1.0) is on TestFlight**. Anthony tested it on an old iPad (TestFlight refuses child Apple Accounts, so the child's iPad can't be used): Airplane Mode, saves, landscape, players, the grown-ups area and backup are all fine. The old iPad is from about 2018 on iPadOS 17 and the game runs very well on it, so speed on older iPads is not a worry.
- **The unlock screen shows "Try again", not a price, until the Paid Apps agreement is Active.** The bank details were still processing on 12 November 2026. Nothing to fix in the app: check Business in App Store Connect, then tap Try again a few hours after it goes Active.
- **Build 2** is set in the project (`CURRENT_PROJECT_VERSION`) with the shorter name under the icon. Every upload needs a higher build number than the last.
- To upload: `npm run app:sync`, then in Xcode choose Any iOS Device (arm64), Product → Archive, Distribute App → App Store Connect → Upload.
- Xcode needed a device registered before it would sign: an iPad's UDID was added by hand at developer.apple.com/account/resources/devices.

### Feeling like an app, not a web page ✅ (12 Nov, after the first TestFlight test)
- **No zoom:** a double tap or a pinch no longer zooms. `js/app-storage.js` sets `touch-action: manipulation` and `user-scalable=no`, and `MeadowViewController` in `AppDelegate.swift` switches the pinch off.
- **No rubber-band bounce** at the top and bottom of a page (`scrollView.bounces = false`, plus `overscroll-behavior: none`).
- **Pages that fit no longer scroll.** The website leaves 120px under every page for the grass, and the app's status-bar padding made every page a little taller than the screen. In the app the space under the page is 20px (the grass sits behind the last card) and the status bar's height is taken off. Levels, Bonnie's Walk and the Words world list now fit on a 2018 iPad (768 × 1024) held upright.
- **A tighter Clubhouse when held upright** (`html.in-app` rules in `index.html`): a smaller sign and pictures, and no description under each game, so it fits on one screen.
- **Still scroll, because they are longer than the screen:** the Bone Shop, the grown-ups area, the Maths world list (6 worlds), the level map slightly, and most pages when the iPad is sideways (the Clubhouse by about 490px). Fixing sideways would need a different layout.
- None of this changes the website. Checked by measuring the pages in Chrome at iPad sizes; not yet seen on the iPad (it goes out in build 2).
- **(Replaced on 13 November 2026, see "Children's names".)** Names with no recording, the 12 November idea: 105 names are recorded in `audio/names/`. For any other name, Bonnie now says **"buddy"** in place of the name ("Woof! Hi buddy!"), so the line stays in her recorded voice; before, the whole line dropped to the device voice. The screen still shows the child's real name. `STAND_INS` in `bonnie-voice.js` lists the words (the first one recorded is used; "friend" is recorded too, as a spare) and they are in `tools/names.txt` like any name. Test page: `tests/voice-name-test.html` (10 checks). Not yet heard on the iPad: listen for how "buddy" sounds at the joins.
- Lines that still use the device voice: numbers of 10,000 or more, shapes like 2.5, and a few on-screen tips the recorder doesn't list.
