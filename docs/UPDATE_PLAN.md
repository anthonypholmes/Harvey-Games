# Meadow Clubhouse: update plan after 1.0

**Written:** 13 November 2026, the day version 1.0 (build 4) went to Apple for review.
**Pace (changed 17 November 2026):** Anthony works on this from home, mainly 9 to 5 on weekdays, so the dates below are about half what they were for evenings and weekends. They are targets, not promises: leave some slack in every release rather than planning every week flat out. Recording Bonnie's lines and waiting for Apple's reviews are the usual reasons a date slips.
**Where the work happens:** the `app-store` branch, as before. `docs/HANDOFF.md` is still the record of what has been built.

## While 1.0 is in review

- **Don't change the submission.** A first submission with an in-app purchase in the Kids category often gets one rejection or question. Keep some time free to answer it and resubmit. Paste Apple's message into a session.
- (Done 13 November 2026) **The submitted code is tagged** `v1.0-build4` (commit `52505e5`, the last change to the app itself before the upload). The tag is on Anthony's Mac; `git push origin v1.0-build4` in a terminal puts it on GitHub too.
- (Done 13 November 2026) **The build number in the Xcode project is 5**, ready for the next upload (Apple has builds 1 to 4). The version is still 1.0: change `MARKETING_VERSION` to 1.1 when the iPhone release is uploaded (there is no separate 1.0.1 now).
- **Line up the first reviewers.** TestFlight family testing was skipped (it refuses child accounts), so the first week after release is the real family test. Ask the families you know to play and leave a rating.

## The roadmap

| Release | Target | What's in it |
|---|---|---|
| **1.1 iPhone** | Submit within a few days of 1.0 being approved (late November 2026) | The same app on iPhone, held upright, with the old 1.0.1 checks. Bonnie's first-time help, first impressions and the two grown-ups buttons go in if they are ready, otherwise into 1.2 |
| **1.2 Reminders, Money and Time** | Mid-December 2026 | Weekly reminders for families, two new Year 2 maths worlds, and anything moved from 1.1 |
| **1.3 Spelling and Grammar** | Late January 2027 | Two new Year 2 English worlds, and a small Shapes world |
| **2.0 Year 3** | Spring 2027 (about April) | The first Year 3 maths and English worlds |

**Re-paced 17 November 2026** for weekday working hours (see Pace at the top). The order is the same as before; the dates are roughly halved, and weekly reminders are added to 1.2.

**Changed 15 November 2026:** iPhone moved from May to the first update, at Anthony's request. An iPad-only app cuts off a large part of the audience and stops a parent trying it quickly on their phone. The separate 1.0.1 release is folded into it; a 1.0.1 still goes out on its own if the first families find a bug that can't wait.

### 1.1 iPhone (late November 2026)

Submit within a few days of 1.0 being approved, so it is out well before Christmas. The phone work started on 16 November while 1.0 was still in review; nothing from it goes to Apple until 1.0 is approved.

**One update, not two (decided 16 November 2026):** nothing from the old 1.0.1 was built yet, so the iPhone work is finished first and the 1.0.1 items are done inside this update. If the first families find a bug that can't wait, a quick 1.0.1 is built from the `v1.0-build4` tag, not from `app-store` (which now has the iPhone work in it).

**The starting point:** the game already works at phone size. Anthony and his wife have played the website on their phones a lot, and the engine, the maths kit and the Clubhouse already have narrow-screen styles. It works but is clunky in places. This release is about taking the clunkiness out, not a redesign.

**Once iPhone support is released it can't be taken away.** That is accepted (15 November 2026): clunky and working is a good starting point, and later updates keep polishing it. After steps 1 to 3 below it is well past clunky.

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
  - **Step 2 is done.** Next is step 3, world by world with real play (drags, the number line, the letter tiles), and then the Xcode setting and the iPhone simulator. Fixing these fixes every world at once. Keep tap targets at 44 × 44 or more, and keep the text sizes from the 13 November check (nothing a child acts on under 16px).
- **Step 3, world by world** (about one sitting each, 10 worlds plus Bonnie's Walk): the drag-and-tap games need the most care: the number line, the place-value blocks, arrays, sharing, letter and word tiles. Each must fit without scrolling during a question, with the answer area above the home bar.
  - **Done on 16 November 2026 (first pass):**
    - `node tools/level-check.mjs` opens the first question of every level (58 levels) on the iPhone SE and the iPhone 17, takes a picture of each and writes `docs/phone-check/LEVELS.md`. Nothing is too wide on any level, and no answer button is too small except the tens rods (below).
    - `node tools/touch-check.mjs` does real finger actions at phone size. Dragging a letter tile into a slot, dragging Bonnie along the number line and swiping up to scroll all work on the SE and the iPhone 17.
    - Partitioning: the place-value counters are smaller on phones (five to a row), and each label ("6 hundreds") sits beside its counters, not under them. Thousands went from 805px to about 330px below the screen on the SE.
    - Sharing: three or four bowls, plates or baskets now fit in one row on phones (the third one used to wrap onto its own row). Lily pads are a little smaller.
    - The tens rods you tap to swap for ones are only 13px wide, so on phones they now take a tap up to 8px either side.
  - **Number keys fixed at the bottom on phones (16 November 2026, to try on a real phone):** on phones the maths number keys now sit in a strip fixed along the bottom of the screen, like a phone's own keyboard, in two rows: 1 2 3 4 5 delete, then 6 7 8 9 0 Check. The question scrolls above them, and Bonnie's message scrolls into view above the keys when an answer is wrong. Choice buttons, Bonnie's step-by-step card and "Is Bonnie right?" stay in the page as before. The iPad is unchanged. After this, on the iPhone 17 nearly every maths level fits without scrolling; on the iPhone SE most of the rest need a scroll of under 60px (the worst are 10 bowls in Sharing, two burrows in Number Bonds and Captain's Cove level 3, about 200–250px). If it feels wrong on a real phone, delete the block that starts "The number keys stay fixed" in `worlds/y2-maths-kit.js`, and the keys go back under the question.
  - **Second pass (16 November 2026):**
    - Sentences and Stories have less space around them on phones (the words stay the same size). Every Sentences level now fits on the iPhone SE, and Stories need at most 70px of scrolling.
    - Single-letter word chips ("i", "a") are at least 46px wide, and the "Aa" capitals button takes a 44 × 44 tap.
    - Captain's Cove: the six "test a number" buttons are three to a row, and the Captain and his conjecture are a little smaller.
    - Arrays: a 10-wide apple array now shrinks to fit the small iPhone (it was 27px too wide). The circles in the "grow the orchard" grid went from 21px to 26px; it is a drag grid of 5 × 10, so they can't reach 44px, but you see the rows grow as you drag.
    - When you type on the fixed keys, the page scrolls so the box you are typing into is just above them (before, it could be hidden behind the keys).
    - `node tools/touch-check.mjs` now checks six finger actions, including the typing one. All six work on the SE and the iPhone 17.
    - The result, with the first question of every level: on the iPhone 17, 55 of 58 levels fit without scrolling (the rest need 9–120px). On the iPhone SE, 39 of 58 fit; most of the rest need under 60px. The most left: two burrows in Number Bonds (about 230px), Partitioning level 1, Sharing with 10 bowls and Captain's Cove level 3 (about 110–120px each). The iPad is unchanged.
  - **Left for step 3:** a small iPhone (the SE size). The Xcode setting and a first run on a real iPhone 15 Pro Max are done (see the Xcode project below).
  - **The yellow story line (decided 16 November 2026):** on phones, each maths level's story line ("Every burrow needs 10 bones…") shows on the first question only, then hides, which saves about 100px on the SE. A line about the question itself, like "Help Bonnie dig up her buried bone at 18!", is always shown. The iPad shows the story line on every question, as before.
- **The on-screen keyboard.** On a phone it covers half the screen. Wherever a child types a number, use the game's own number keys and keep the system keyboard away. The grown-ups' name box and prizes can keep the system keyboard, as long as the box stays in view.
- **Safe areas.** The notch or Dynamic Island at the top and the home bar at the bottom (`js/app-storage.js` already pads both).
- **The Xcode project** (half a sitting, at the start of 1.1 work in the simulator): `TARGETED_DEVICE_FAMILY` from `2` (iPad) to `1,2` (iPhone and iPad), iPhone orientations in `Info.plist` set to upright only, and `UIRequiredDeviceCapabilities` changed from `armv7` to `arm64`. Then run every screen in the iPhone SE and iPhone 17 Pro Max simulators.
  - **It can change now** (16 November 2026): with no separate 1.0.1, the next upload is the iPhone one. It doesn't touch the 1.0 build in review.
  - **Done 16 November 2026:** all three changes are made (iPad keeps all four ways round). The simulator wouldn't build while Xcode was still setting up iOS 26.3, so Anthony ran it on his own iPhone 15 Pro Max instead. It loads fine, the number keys look good, and everything works with very little scrolling. Two things were found and fixed the same day:
    - The **▶ PLAY buttons on the Clubhouse** didn't line up: the Maths sign's subtitle takes two lines and the Words one only one, so the Maths picture and button sat lower. Both signs now leave room for two lines and the buttons sit at the bottom of each cabinet.
    - The **hopping frog** crossed the number keys and the tiles at the bottom for a moment. On phones it now stays out of levels (it still hops across the Clubhouse and the world maps). The iPad is unchanged.
    - Anthony checked both fixes on the iPhone 15 Pro Max the same day: they look right.
  - **Still to do:** an iPhone SE (the simulator, or a borrowed one) and the TestFlight check below.
- **Nothing changes for the purchase.** It is the same app and the same product, so a family who bought on the iPad has the full game on the iPhone too (Restore purchase, or automatically). Test Restore purchase on both.
- **The listing:** iPhone screenshots (6.9-inch, 1320 × 2868) made by the same tool as the iPad ones, and the description and reviewer notes changed from "iPad" to "iPhone and iPad". The privacy label doesn't change.
- **A real iPhone check through TestFlight** before submitting: a small phone if one can be borrowed, sound with the silent switch on, and a full level of each world.
- **The iPad layout checks** below (sideways, and narrow windows in split screen) are the same kind of work as the phone layout. Do them with it, using `node tools/phone-check.mjs --size ipad`.
- **Bonnie's first-time help** (added 13 November 2026). Not a tour at the start: children skip them and most can't read them yet. Bonnie points something out once, at the moment it matters, with a glowing ring on the thing to tap and a spoken line:
  - first visit to the Clubhouse: the ring is on Bonnie's Walk ("Start here! Come for a walk with me.")
  - first wrong answer in a level: the ring is on Ask Bonnie ("Stuck? Tap me and we'll do it together.")
  - first bones earned: the ring is on the Bone Shop ("You've got bones! Come and see my shop.")
  - first time in the grown-ups area: a short card for the parent saying what is there, with the prizes pointed out
  - Each shows once per player, and is kept in the player's save. The ring holds still when Reduce Motion is on. Needs three or four new recorded lines (with name-free versions, as always) and a test page. Two to three sittings. It ships here because the iPhone release is when the most new players arrive.
- **Don't hold 1.1 for the extras.** Once the iPhone work and the real-device checks are done, submit it. Whatever of the first-time help, first impressions and the two grown-ups buttons isn't finished moves to 1.2.

**Folded in from the old 1.0.1:**

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
  - **Built 16 November 2026** as "Tell us what you think" in the grown-ups area, under Back up progress. **Send feedback** opens an email to anthony@holmeshouse.co.uk (the address is shown under it too, for an iPad with no Mail set up). **Rate the app** opens the app's App Store page at "Write a review", rather than Apple's pop-up: Apple says not to show the pop-up from a button, because it is limited to three times a year and may not appear at all. The button stays hidden until `APP_STORE_ID` in `js/meadow-core.js` is set to the app's Apple ID (a number from App Store Connect → App Information). `APP_STORE_ID` was set to 6833979390 on 16 November 2026, so the Rate button now shows in the app. **Send feedback checked on Anthony's iPhone the same day: Mail opens.** Rate the app still needs a try once the app is live on the App Store (until then the page may not exist).
- **First impressions** (added 13 November 2026, from a check against Apple's Human Interface Guidelines and Anthony's own list):
  - **Launch screen.** The app opens on Capacitor's own logo (a blue cross on white: `Splash.imageset`). Apple's guidance is that a launch screen looks like the app's first screen, with no logo. Replace it with the meadow background. Half a sitting.
  - **No blank flash between pages.** Going from the Clubhouse to a game is a full page change. Paint the meadow background at once and fade the page in. Half a sitting, with the launch screen.
    - **Both built 16 November 2026.** The launch screen (`ios/App/App/Base.lproj/LaunchScreen.storyboard`) is now the Clubhouse's cream background (the `LaunchMeadow` picture) with the green meadow strip along the bottom, and no logo. `js/first-paint.js`, first in each page's head, paints the page in the player's theme colour straight away (applyTheme remembers the theme as `meadow-paint`), then fades the page in over about a fifth of a second; with Reduce Motion on there is no fade. The app's own background colour (`capacitor.config.json`) now matches the Clubhouse cream exactly. The old `Splash` picture (Capacitor's logo) is no longer used and can be deleted from `Assets.xcassets`.
    - **Checked on Anthony's iPhone 15 Pro Max and iPad** the same day: it looks right on both, in the day theme and a dark one. Done.
  - **A loading sign only if it is needed.** Everything is stored on the iPad, so most waits are well under a second, and a spinner that flashes is worse than none. First time the page changes on the 2018 iPad. If any takes more than about half a second, show a row of Bonnie's paw prints after that delay. No skeleton screens: they suit apps that wait on the internet.
  - **App icon: dark and tinted versions.** Recent iPadOS lets people switch the Home Screen to dark or tinted icons. The app has one picture, so iPadOS makes its own, which usually look muddy. Draw both from `tools/app-icon.html`. One sitting.
    - **Built 16 November 2026.** `tools/app-icon.html` now draws three looks and `sh tools/make-icon.sh` photographs all three into `AppIcon.appiconset`: the usual sunny icon (unchanged, byte for byte), **dark** (the same meadow at night, with a moon and stars; Bonnie keeps her own colours) and **tinted** (Bonnie alone in grey on a see-through background, which iOS colours with the person's tint). Xcode accepts all three with no warnings.
    - **Checked on iPhone 15 Pro Max, 16 November 2026:** the usual, dark and tinted icons all look right on the Home Screen.
  - **Clearer prize editing.** Nothing in the Bone Shop says the real-life prizes can be changed, and the editor is folded away in the grown-ups area. Add a **Grown-ups: change these prizes** button on the Real Prizes tab (it asks the sum, then opens the grown-ups area with the editor open and in view), a line in the editor until it is first used ("These are starter prizes. Change them to suit your family."), and keep the editor open until a prize has been changed once. One sitting.
    - **Built 16 November 2026**, all three parts. Whether the prizes have been changed is kept in each player's save (a new player takes it from the one before). Checked at iPhone SE and iPad size.
  - **Any window size, not only sideways.** iPads run apps in windows and split screen, so the app can be much narrower than the screen. Test narrow windows as well as sideways when doing the layout work above.
  - **Colour is never the only clue.** Story Nook says "see the clue in green". Do this with the VoiceOver fixes.
    - **Started 16 November 2026:** the clue words are now bold and underlined as well as green. Bonnie still says "in green": changing the words means re-recording about 50 clips, so do that with the VoiceOver fixes.

### 1.2 Reminders, Money and Time (mid-December 2026)

**Weekly reminders** (proposed 17 November 2026; confirm the details with Anthony and write a brief in `briefs/` before building):

- **Local notifications only,** with Capacitor's own Local Notifications plugin (on the device, no server, works on Android later). Nothing is sent anywhere, so the "Data Not Collected" label and the Kids category answers stay true. Add a line about reminders to the reviewer notes.
- **Off until a grown-up chooses.** A one-time card at the top of the grown-ups area (behind the sum) and once after a successful unlock: "A little reminder from Bonnie?" with **Yes, once a week (recommended)** and **No thanks**. iOS's own permission question only appears after Yes. Never shown to a child. Nothing in the game changes if they say no.
- **One rolling reminder, not a repeating one.** Every time the app opens, cancel the pending reminders and schedule new ones. A reminder only fires on the chosen day and time if the app hasn't been opened for about 5 days, so it never arrives while a family is playing or has just played, and fixed ids mean no duplicates after an update or restart.
- **It stops if ignored.** Schedule at most the next 4 weekly reminders. If a family ignores a month of them, they stop until the app is opened again.
- **Settings:** on or off, a day (Mon to Sun) and one of four times (9am, 12pm, 4pm, 6pm). Default Saturday 10am. Stored in its own `meadow-reminders` key, shared by every player (`js/app-storage.js` already keeps `meadow*` keys safe). If iOS permission was refused, the switch says notifications are off for Meadow Club in Settings, with no button that leaves the app.
- **The words:** warm and low-pressure, a few that take turns ("Bonnie's ready for another adventure! 🐾"). Never the child's name or progress, no streaks, no sad Bonnie, nothing about the full game.
- **Tapping one just opens the app.** No special handling.
- **Website:** nothing (the section only shows in the app).
- **Test page** with a pretend plugin, like `tests/unlock-test.html`: the next dates, switching off, refused permission, reopening the app, and the 4-reminder limit.

**Money and Time:** the two biggest Year 2 maths topics the game doesn't cover yet.

- **Money world:** coins and notes, making an amount, finding the total, giving change.
- **Time world:** o'clock, half past, quarter past and to, five-minute steps, how long things take.
- Build both for phone and iPad from the start: every new screen must fit a phone with no scrolling during a question.
- Each needs a brief in `briefs/`, a test page in `tests/`, kit pictures (coins, a clock face) built so later worlds can use them, and Bonnie's lines recorded.
- Level 1 of each is free, like every other world. Both join Bonnie's Walk through their first two levels.
- Remake the App Store screenshots and update the level counts in the listing.

### 1.3 Spelling and Grammar (late January 2027)

Out well before SATs season in May, which the listing's keywords already aim at. Three worlds is more than a month's voice credits (see the voice budget below), so record across December and January.

- **Spelling world:** suffixes (-ing, -ed, -er, -est, -ly, -ful, -less), contractions and homophones.
- **Grammar world:** nouns, verbs, adjectives, joining words (and, but, because), past and present tense.
- **Shapes (small maths world):** 2D and 3D shapes, sides and corners, lines of symmetry.
- Use the story characters (`CHARACTERS`) in every sentence, never the player's name.
- Change the promotional text for SATs season (no review needed).

### 2.0 Year 3 (spring 2027, about April)

Ready well before the summer holidays and September, when families look for something new.

- The engine already handles more than one school year (the "School years" setting in the grown-ups area appears when a second year has worlds), so this is content work, not a rebuild.
- **First maths worlds:** place value to 1,000, column addition and subtraction, the 3, 4 and 8 times tables, fractions.
- **First English worlds:** Year 3 and 4 spelling words, prefixes, speech marks.
- Decide the pricing first (see the decisions below).

## Behind the scenes (by the end of January 2027)

- **Cloud builds.** Xcode 27 runs only on Apple silicon, and Apple is expected to require it from around spring 2027. Set up GitHub Actions or Codemagic and send one test build through it before it is needed.
- **One codebase.** `app-store` is about 4,900 lines ahead of `main`. Merge them, keeping app-only features behind `MEADOW_IN_APP`, so a new world is built once and not twice. Do it between releases, not during one: the gap after 1.1 is submitted is a good moment.
- **Voice budget.** ElevenLabs gives 40,000 credits a month. Plan on one or two new worlds a month, and run `npm run voice:check` before recording. At the faster pace this is the real limit, not time: if a month needs more, move up an ElevenLabs plan for that month rather than slowing down.

## Later, not yet given a release

From the check against Apple's Human Interface Guidelines. None of these blocks anything.

- **Keyboard and trackpad.** Some families use an iPad with a keyboard case. Typing a number and pressing Return partly works in maths already; hover highlights, and the same in Words, would finish it.
- **Larger Text.** Text that follows the iPad's setting. It touches every layout, so it is a version of its own, and it is what the Larger Text accessibility label needs.
- **Other sound.** Opening the app stops a parent's music or podcast. That was a choice, so Bonnie is never muted. Leave it unless a parent complains.
- **Dark mode.** The shop themes already give variety. Not worth the time yet.

## Decisions for Anthony

1. **The website gives away the full game.** holmeshouse.co.uk has all 58 levels unlocked, and it is the marketing address in the listing. Choices: lock it to the same taster as the app, move the family's copy to a private address, or leave it as it is.
   - **Decided (13 November 2026):** replace it with a landing page for the app once the app is live. The page is built and committed on the **`website-landing-page`** branch (commit `338e5ed`, on this Mac only, not pushed). **Don't merge it into `main` or push `main` until the app is on the App Store.** When it is: merge that branch into `main`, push, and check holmeshouse.co.uk, /privacy.html and /support.html still open.
2. **Year 3 pricing.** Either part of the same £3.99 unlock (generous, and good for reviews) or a second purchase. Decide by February 2027, before the Year 3 work starts.
3. (Decided 15 November 2026) iPhone is the first update, 1.1, before the new worlds. (Decided 16 November 2026) The old 1.0.1 is folded into it.

## Keeping this plan honest

- After each release, mark it done here with the date and write down what slipped.
- If a release is more than a month late, drop something from it. Don't push every later date back.
