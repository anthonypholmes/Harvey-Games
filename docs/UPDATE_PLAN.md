# Meadow Clubhouse: update plan after 1.0

**Written:** 13 November 2026, the day version 1.0 (build 4) went to Apple for review.
**Pace:** evenings and weekends, in bursts. The dates are targets, not promises. Don't compress them.
**Where the work happens:** the `app-store` branch, as before. `docs/HANDOFF.md` is still the record of what has been built.

## While 1.0 is in review

- **Don't change the submission.** A first submission with an in-app purchase in the Kids category often gets one rejection or question. Keep a free evening to answer it and resubmit. Paste Apple's message into a session.
- (Done 13 November 2026) **The submitted code is tagged** `v1.0-build4` (commit `52505e5`, the last change to the app itself before the upload). The tag is on Anthony's Mac; `git push origin v1.0-build4` in a terminal puts it on GitHub too.
- (Done 13 November 2026) **The build number in the Xcode project is 5**, ready for the next upload (Apple has builds 1 to 4). The version is still 1.0: change `MARKETING_VERSION` to 1.0.1 when that release is started.
- **Line up the first reviewers.** TestFlight family testing was skipped (it refuses child accounts), so the first week after release is the real family test. Ask the families you know to play and leave a rating.

## The roadmap

| Release | Target | What's in it |
|---|---|---|
| **1.0.1 Real-world check** | Live by about 11 December 2026 | Fixes from the first families, the checks not yet done, two new grown-ups buttons, and first impressions (launch screen, icon, clearer prize editing) |
| **1.1 iPhone** | Late January 2027 | The same app on iPhone, held upright, and Bonnie's first-time help |
| **1.2 Spelling and Grammar** | Late March 2027 | Two new Year 2 English worlds, and a small Shapes world |
| **1.3 Money and Time** | May 2027 | Two new Year 2 maths worlds |
| **2.0 Year 3** | July 2027 | The first Year 3 maths and English worlds |

### 1.0.1 Real-world check (by about 11 December 2026)

Getting this out before Christmas matters: that is when new iPads arrive.

- **Fixes** for whatever the first families and reviews turn up.
- **Checks not yet done** (from the handoff):
  - Restore purchase, on a real iPad
  - Airplane Mode, on a real iPad
  - every game page with the iPad sideways, and a layout that fits
  - the three shop themes other than the meadow, for text size
  - "Back up progress": saving through the share sheet, and choosing a file to restore
  - a listen to the newer clips (the name-free lines, a story or two, how "Priya" is said)
  - a VoiceOver walk-through, and fixes for what it finds
- **Two new buttons in the grown-ups area** (behind the sum, so the Kids category rules are kept):
  - **Send feedback:** opens an email to the support address
  - **Rate the app:** Apple's own rating prompt
  - With no analytics, by design, these are the only way to hear from parents.
- **First impressions** (added 13 November 2026, from a check against Apple's Human Interface Guidelines and Anthony's own list):
  - **Launch screen.** The app opens on Capacitor's own logo (a blue cross on white: `Splash.imageset`). Apple's guidance is that a launch screen looks like the app's first screen, with no logo. Replace it with the meadow background. Half a sitting.
  - **No blank flash between pages.** Going from the Clubhouse to a game is a full page change. Paint the meadow background at once and fade the page in. Half a sitting, with the launch screen.
  - **A loading sign only if it is needed.** Everything is stored on the iPad, so most waits are well under a second, and a spinner that flashes is worse than none. First time the page changes on the 2018 iPad. If any takes more than about half a second, show a row of Bonnie's paw prints after that delay. No skeleton screens: they suit apps that wait on the internet.
  - **App icon: dark and tinted versions.** Recent iPadOS lets people switch the Home Screen to dark or tinted icons. The app has one picture, so iPadOS makes its own, which usually look muddy. Draw both from `tools/app-icon.html`. One sitting.
  - **Clearer prize editing.** Nothing in the Bone Shop says the real-life prizes can be changed, and the editor is folded away in the grown-ups area. Add a **Grown-ups: change these prizes** button on the Real Prizes tab (it asks the sum, then opens the grown-ups area with the editor open and in view), a line in the editor until it is first used ("These are starter prizes. Change them to suit your family."), and keep the editor open until a prize has been changed once. One sitting.
  - **Any window size, not only sideways.** iPads run apps in windows and split screen, so the app can be much narrower than the screen. Test narrow windows as well as sideways when doing the layout work above.
  - **Colour is never the only clue.** Story Nook says "see the clue in green". Do this with the VoiceOver fixes.
- If the checks find nothing, this can ship with the buttons and the first impressions, or fold into 1.1.

### 1.1 iPhone (late January 2027)

**Moved up to 1.1 on 16 November 2026, at Anthony's request.** It widens the audience the most, and the games were built as a website that already works at phone width (there are rules for screens under 520 and 560px), so this is finishing work, not a rebuild.

**Once iPhone support is released it can't be taken away**, so ship it only when every world is comfortable on the smallest iPhone.

- **Sizes to design for:** iPhone SE (375 × 667, the smallest still sold and common as a hand-me-down), iPhone 17 (about 393 × 852) and iPhone 17 Pro Max (about 440 × 956). **Upright only** on iPhone; the iPad keeps every orientation.
- **Step 1, a picture of every screen at phone size** (done 16 November 2026). `node tools/phone-check.mjs` opens 34 screens in Chrome at iPhone SE, iPhone 17 and iPhone 17 Pro Max size, as the app (padlocks, players, the notch and home bar), and saves a picture of each in `docs/phone-check/` (open `index.html` there to see them side by side). `REPORT.md` there lists how far each screen scrolls and anything too small. It takes about 10 minutes; `--only number-bonds` or `--size se` is quicker. Run it again after every change. Only the report is committed; the pictures are made fresh each time.
  - **What it found, biggest first:**
    1. **The top bar takes three or four rows on every phone** (Clubhouse, the game's name, streak, bones, Bone Shop, then ← Map and the level name): about 330px of the iPhone SE's 667. One slim row on phones (the icons and numbers only, with the level name under it) is the biggest single win, and it is shared by every screen.
    2. **In the maths worlds, the thing to tap starts at or below the bottom of the screen** (the burrows, bowls, plates, number line), and Bonnie, Ask Bonnie and the number keys are a further 300 to 1,000px down. On a phone the question, the thing to tap and the keys must all be on one screen: a shorter question card (the story line and "Question 1 of 9" can be smaller), and number keys that are three rows wide rather than four rows tall.
    3. **In the English worlds and Bonnie's Walk, Bonnie's card sits above the question** and pushes the letters and signposts below the screen. On phones she needs to be a slim row with Ask Bonnie, or beside the question.
    4. **The Bone Shop is very long on a phone** (6,400px of coats and hats on the iPhone SE): two to a row on phones. The grown-ups area is long too, which is fine for grown-ups.
    5. **Some writing shrinks below the 16px rule on phones:** small buttons (Bone Shop, ← Map), the world cards' subtitles and stars, and the hint numbers (13 to 14px). A phone rule makes them smaller; take it out.
    6. The grown-ups' tick boxes are 24 × 24. Check that the words beside them can be tapped too.
  - **What's already fine:** nothing is wider than the screen on any page (no sideways scrolling), the pages stay clear of the Dynamic Island and the home bar, and the Clubhouse, world lists and maps only need ordinary scrolling.
- **Step 2, the shared parts first** (two or three sittings): Bonnie's dock and speech bubble, the top bar, modals (the grown-ups sum and its keys), cards and buttons.
  - (Done 16 November 2026) **The slim top bar.** On screens under 560px wide (phones, and narrow iPad windows) the top bar is one row: 🏠, the game's name, 🔥, 🦴 and 🛍️. The words "Clubhouse" and "Bone Shop" are hidden but VoiceOver still reads them. The player's name is left out of the title ("Meadow Maths"), and under 430px (all but the biggest phones) it is just "Maths" or "Words". In a level, ← Map sits beside the world's name with smaller progress dots under it. It saves about 100 to 250px, and on the iPhone SE the burrows in Number Bonds Burrow now start on the screen. The iPad is unchanged (checked side by side with `--size ipad`), except that the small buttons such as "← Map" now use 16px writing: every `<button class="icon-btn">` had fallen back to the browser's own 13.3px, which also caused most of the "under 14px" lines in the report. The CSS is at "Phones (and narrow iPad windows)" in `js/meadow-core.js`. All the test pages pass.
  - (Done 16 November 2026) **The maths screen on phones.** Under 560px wide: the question card is tighter; its "Bonds to 10 · Question 1 of 9" line is left out (the dots and world name at the top say the same; a warm-up or Teach Bonnie label still shows); the answer buttons and number keys come straight after the question, with shorter keys (50px, the same 7-8-9 layout as the iPad); and Bonnie is a smaller row under them, with Ask Bonnie. When Bonnie says something after a tap, the page scrolls just far enough to show her words, unless that would push a glowing thing off the top. Five or more bowls, plates or baskets go four to a row (ten bowls: three rows, not five). On the iPhone SE, Number Bonds Burrow scrolls about 345px (it was 758) and Captain's Cove fits; on the iPhone 17 most questions are within about 100 to 300px. The CSS is at "phones (16 November 2026)" in `worlds/y2-maths-kit.js`, and the scrolling is in `feedback()` there. The iPad is unchanged. All the test pages pass.
    - **A choice to look at:** on a phone the number keys now come before Bonnie, so a child sees the keys first and Bonnie under them. Say if Bonnie should come first instead.
    - **Not yet checked:** in the iPhone simulator, or by a child's thumb. The five-or-more-bowls rule uses a newer CSS feature (`:has`) that iOS 15.0 to 15.3 lacks; on those the bowls just stay two to a row.
  - (Done 16 November 2026) **The English worlds and Bonnie's Walk on phones.** Bonnie's card moves under the question as a slim card (Bonnie, her words, then Ask Bonnie and the hints), the same as maths. In Phonics Forest the picture sits beside the sentence and the letter tray is tighter, so on the iPhone SE the whole word (picture, slots and every letter) is on one screen. In `js/meadow-core.js` ("Phones" in the styles, and `revealOnPhone` and `questionShown` by `bubble()`).
  - **Scrolling, for maths and English alike:** when Bonnie answers a tap (a clue, "Not quite"), the page scrolls just far enough to show her words, never for the line she says as a question appears, and never if a glowing answer would be pushed off the top. **Every new question starts at the top of the page** (before, the page stayed wherever it had been scrolled). Tried on the iPhone SE in Number Bonds Burrow: a wrong answer scrolled Bonnie's clue into view with the burrows still showing, and the next question opened at the top.
  - (Done 16 November 2026) **The Clubhouse, world lists, Bone Shop and boxes on phones.**
    - **Clubhouse:** a smaller sign, Bonnie beside her words, and Meadow Maths and Meadow Words side by side. On the iPhone SE it scrolls about 300px (it was 957); on the iPhone 17 about 140px. In `index.html` ("Phones (16 November 2026)").
    - **World lists:** Bonnie beside her words, and each world's picture beside its name. The Words list scrolls 183px on the iPhone SE (it was 888).
    - **Bone Shop:** Bonnie beside her words, the three tabs on one row ("Dress Up", "Themes", "Prizes" on a phone), and two things to a row. The Dress Up tab is about 2,950px on the iPhone SE (it was 6,400), which is fine for a shop.
    - **Boxes such as the grown-ups' sum** sit near the top of the screen on a phone, so the iPhone's number keyboard doesn't cover them.
  - **Two fixes that also change the iPad** (and the website), both found by the check:
    - **Every button now uses the page's writing size.** A button with no size of its own fell back to the browser's 13.3px: the world cards' subtitles and stars, the shop tabs and the small buttons. They are 16px now, so the iPad's Words world list is about 70px longer. The hint numbers are a little bigger too.
    - **The Tricky Word Trail's signpost styles leaked onto the Clubhouse sign.** Every page loads every world, and that world's `.sign` rules (a post, 46px of space, and the reading font) also hit the Clubhouse's sign. They now only apply inside the trail. On the iPad, the stray tall post on the left of the sign and the gap under it are gone, and **the sign's writing is in Fredoka** (the game's title lettering, as the 13 November text check meant) instead of Andika. The App Store screenshots still show the old sign; remake them with 1.1.
  - The phone-size report now finds nothing under 14px on any screen. Left in it: the grown-ups' tick boxes (24 × 24) and the phonics sound dots, which already have a 44 × 44 tap area that the check can't see.
  - **Step 2 is done.** Next is step 3, world by world with real play (drags, the number line, the letter tiles), and then the Xcode setting and the iPhone simulator once 1.0.1 is uploaded. Fixing these fixes every world at once. Keep tap targets at 44 × 44 or more, and keep the text sizes from the 13 November check (nothing a child acts on under 16px).
- **Step 3, world by world** (about one sitting each, 10 worlds plus Bonnie's Walk): the drag-and-tap games need the most care: the number line, the place-value blocks, arrays, sharing, letter and word tiles. Each must fit without scrolling during a question, with the answer area above the home bar.
  - **Done on 16 November 2026 (first pass):**
    - `node tools/level-check.mjs` opens the first question of every level (58 levels) on the iPhone SE and the iPhone 17, takes a picture of each and writes `docs/phone-check/LEVELS.md`. Nothing is too wide on any level, and no answer button is too small except the tens rods (below).
    - `node tools/touch-check.mjs` does real finger actions at phone size. Dragging a letter tile into a slot, dragging Bonnie along the number line and swiping up to scroll all work on the SE and the iPhone 17.
    - Partitioning: the place-value counters are smaller on phones (five to a row), and each label ("6 hundreds") sits beside its counters, not under them. Thousands went from 805px to about 330px below the screen on the SE.
    - Sharing: three or four bowls, plates or baskets now fit in one row on phones (the third one used to wrap onto its own row). Lily pads are a little smaller.
    - The tens rods you tap to swap for ones are only 13px wide, so on phones they now take a tap up to 8px either side.
  - **Number keys fixed at the bottom on phones (16 November 2026, to try on a real phone):** on phones the maths number keys now sit in a strip fixed along the bottom of the screen, like a phone's own keyboard, in two rows: 1 2 3 4 5 delete, then 6 7 8 9 0 Check. The question scrolls above them, and Bonnie's message scrolls into view above the keys when an answer is wrong. Choice buttons, Bonnie's step-by-step card and "Is Bonnie right?" stay in the page as before. The iPad is unchanged. After this, on the iPhone 17 nearly every maths level fits without scrolling; on the iPhone SE most of the rest need a scroll of under 60px (the worst are 10 bowls in Sharing, two burrows in Number Bonds and Captain's Cove level 3, about 200–250px). If it feels wrong on a real phone, delete the block that starts "The number keys stay fixed" in `worlds/y2-maths-kit.js`, and the keys go back under the question.
- **The on-screen keyboard.** On a phone it covers half the screen. Wherever a child types a number, use the game's own number keys and keep the system keyboard away. The grown-ups' name box and prizes can keep the system keyboard, as long as the box stays in view.
- **Safe areas.** The notch or Dynamic Island at the top and the home bar at the bottom (`js/app-storage.js` already pads both).
- **The Xcode project** (half a sitting, at the start of 1.1 work in the simulator): `TARGETED_DEVICE_FAMILY` from `2` (iPad) to `1,2` (iPhone and iPad), iPhone orientations in `Info.plist` set to upright only, and `UIRequiredDeviceCapabilities` changed from `armv7` to `arm64`. Then run every screen in the iPhone SE and iPhone 17 Pro Max simulators.
  - **Don't change this setting until 1.0.1 has been uploaded.** Until then, the phone-size checks are done in Chrome (as the iPad text check was), and if the iPhone simulator is needed, the setting is changed on the Mac only and not committed.
- **Nothing changes for the purchase.** It is the same app and the same product, so a family who bought on the iPad has the full game on the iPhone too (Restore purchase, or automatically).
- **The listing:** iPhone screenshots (6.9-inch, 1320 × 2868) made by the same tool as the iPad ones, and the description and reviewer notes changed from "iPad" to "iPhone and iPad". The privacy label doesn't change.
- **A real iPhone check through TestFlight** before submitting: a small phone if one can be borrowed, sound with the silent switch on, and a full level of each world.
- **Overlap with 1.0.1:** the iPad layout work there (sideways, and narrow windows in split screen) is the same kind of work. Do it first for 1.0.1, as it makes the phone work smaller.
- **Bonnie's first-time help** (added 13 November 2026). Not a tour at the start: children skip them and most can't read them yet. Bonnie points something out once, at the moment it matters, with a glowing ring on the thing to tap and a spoken line:
  - first visit to the Clubhouse: the ring is on Bonnie's Walk ("Start here! Come for a walk with me.")
  - first wrong answer in a level: the ring is on Ask Bonnie ("Stuck? Tap me and we'll do it together.")
  - first bones earned: the ring is on the Bone Shop ("You've got bones! Come and see my shop.")
  - first time in the grown-ups area: a short card for the parent saying what is there, with the prizes pointed out
  - Each shows once per player, and is kept in the player's save. The ring holds still when Reduce Motion is on. Needs three or four new recorded lines (with name-free versions, as always) and a test page. Two to three sittings. It ships here because the iPhone release is when the most new players arrive; bring it forward to 1.0.1 if the first families seem lost.
- **If 1.1 runs late,** move the first-time help to 1.2 rather than ship the iPhone before every world fits.

### 1.2 Spelling and Grammar (late March 2027)

Out before SATs season in May, which the listing's keywords already aim at.

- **Spelling world:** suffixes (-ing, -ed, -er, -est, -ly, -ful, -less), contractions and homophones.
- **Grammar world:** nouns, verbs, adjectives, joining words (and, but, because), past and present tense.
- **Shapes (small maths world):** 2D and 3D shapes, sides and corners, lines of symmetry.
- Use the story characters (`CHARACTERS`) in every sentence, never the player's name.
- Change the promotional text for SATs season (no review needed).

### 1.3 Money and Time (May 2027)

The two biggest Year 2 maths topics the game doesn't cover yet.

- **Money world:** coins and notes, making an amount, finding the total, giving change.
- **Time world:** o'clock, half past, quarter past and to, five-minute steps, how long things take.
- Each needs a brief in `briefs/`, a test page in `tests/`, kit pictures (coins, a clock face) built so later worlds can use them, and Bonnie's lines recorded.
- Level 1 of each is free, like every other world. Both join Bonnie's Walk through their first two levels.
- Remake the App Store screenshots and update the level counts in the listing.

### 2.0 Year 3 (July 2027)

In time for the summer holidays and September.

- The engine already handles more than one school year (the "School years" setting in the grown-ups area appears when a second year has worlds), so this is content work, not a rebuild.
- **First maths worlds:** place value to 1,000, column addition and subtraction, the 3, 4 and 8 times tables, fractions.
- **First English worlds:** Year 3 and 4 spelling words, prefixes, speech marks.
- Decide the pricing first (see the decisions below).

## Behind the scenes (by the end of February 2027)

- **Cloud builds.** Xcode 27 runs only on Apple silicon, and Apple is expected to require it from around spring 2027. Set up GitHub Actions or Codemagic and send one test build through it before it is needed.
- **One codebase.** `app-store` is about 4,900 lines ahead of `main`. Merge them, keeping app-only features behind `MEADOW_IN_APP`, so a new world is built once and not twice. Do it between releases, not during one.
- **Voice budget.** ElevenLabs gives 40,000 credits a month. Plan on one or two new worlds a month, and run `npm run voice:check` before recording.

## Later, not yet given a release

From the check against Apple's Human Interface Guidelines. None of these blocks anything.

- **Keyboard and trackpad.** Some families use an iPad with a keyboard case. Typing a number and pressing Return partly works in maths already; hover highlights, and the same in Words, would finish it.
- **Larger Text.** Text that follows the iPad's setting. It touches every layout, so it is a version of its own, and it is what the Larger Text accessibility label needs.
- **Other sound.** Opening the app stops a parent's music or podcast. That was a choice, so Bonnie is never muted. Leave it unless a parent complains.
- **Dark mode.** The shop themes already give variety. Not worth the time yet.

## Decisions for Anthony

1. **The website gives away the full game.** holmeshouse.co.uk has all 58 levels unlocked, and it is the marketing address in the listing. Choices: lock it to the same taster as the app, move the family's copy to a private address, or leave it as it is.
   - **Decided (13 November 2026):** replace it with a landing page for the app once the app is live. The page is built and committed on the **`website-landing-page`** branch (commit `338e5ed`, on this Mac only, not pushed). **Don't merge it into `main` or push `main` until the app is on the App Store.** When it is: merge that branch into `main`, push, and check holmeshouse.co.uk, /privacy.html and /support.html still open.
2. **Year 3 pricing.** Either part of the same £3.99 unlock (generous, and good for reviews) or a second purchase. Decide by spring 2027.
3. **iPhone before or after Year 3.** Decided (16 November 2026): iPhone is now 1.1, before the new worlds.

## Keeping this plan honest

- After each release, mark it done here with the date and write down what slipped.
- If a release is more than a month late, drop something from it. Don't push every later date back.
