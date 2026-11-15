# Meadow Clubhouse: update plan after 1.0

**Written:** 13 November 2026, the day version 1.0 (build 4) went to Apple for review.
**Pace:** evenings and weekends, in bursts. The dates are targets, not promises. Don't compress them.
**Where the work happens:** the `app-store` branch, as before. `docs/HANDOFF.md` is still the record of what has been built.

## While 1.0 is in review

- **Don't change the submission.** A first submission with an in-app purchase in the Kids category often gets one rejection or question. Keep a free evening to answer it and resubmit. Paste Apple's message into a session.
- **Tag the submitted code** as `v1.0-build4`, so the exact code Apple has can always be found again.
- **The build number in the Xcode project on GitHub still says 2**, though build 4 was uploaded. The next upload must be build 5 or higher. Set `CURRENT_PROJECT_VERSION` in the project and commit it, so the number in git matches what Apple has.
- **Line up the first reviewers.** TestFlight family testing was skipped (it refuses child accounts), so the first week after release is the real family test. Ask the families you know to play and leave a rating.

## The roadmap

| Release | Target | What's in it |
|---|---|---|
| **1.1 iPhone** | Mid-December 2026 | The same app on phones, with the real-world checks and two new grown-ups buttons folded in |
| **1.2 Money and Time** | February 2027 | Two new Year 2 maths worlds |
| **1.3 Spelling and Grammar** | April 2027 | Two new Year 2 English worlds, and a small Shapes world |
| **2.0 Year 3** | July 2027 | The first Year 3 maths and English worlds |

**Changed 15 November 2026:** iPhone moved from May to the first update, at Anthony's request. An iPad-only app cuts off a large part of the audience and stops a parent trying it quickly on their phone. The separate 1.0.1 release is folded into it; a 1.0.1 still goes out on its own if the first families find a bug that can't wait.

### 1.1 iPhone (mid-December 2026)

Out before Christmas. Don't start until 1.0 is approved, so the work doesn't tangle with the review.

**The starting point:** the game already works at phone size. Anthony and his wife have played the website on their phones a lot, and the engine, the maths kit and the Clubhouse already have narrow-screen styles. It works but is clunky in places. This release is about taking the clunkiness out, not a redesign.

- **The number pad (the known problem):** on a phone the child has to scroll down to reach it. The question, the picture and the pad must fit on one screen with no scrolling. Fix this first; it affects most maths levels.
- **Go through every screen at phone size, upright,** on a small phone (iPhone SE) and a large one, and list what is clunky: anything that needs scrolling in the middle of a question, anything that is cramped, any button under 44 x 44. Likely tight spots: dragging Bonnie along the number line, the burrow frames, the base-ten blocks, the Bone Shop and the grown-ups tables.
- **Upright only on phones.** Take the two landscape entries out of `UISupportedInterfaceOrientations` in `Info.plist` (the iPad list stays as it is).
- **Switch the app to iPhone and iPad:** `TARGETED_DEVICE_FAMILY = "1,2"` in the Xcode project. Check the safe-area padding in `js/app-storage.js` clears the notch and the home bar.
- **The purchase carries across:** one purchase unlocks the game on the family's iPhone and iPad (the same Apple Account, or Family Sharing). Test Restore purchase on both.
- **Listing:** iPhone screenshots (add a phone size to `tools/make-screenshots.sh`), and update the description and reviewer notes, which say "iPad".
- **Once iPhone support is released it can't be taken away.** That is accepted: clunky and working is a good starting point, and later updates keep polishing it.

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

### 1.2 Money and Time (February 2027)

The two biggest Year 2 maths topics the game doesn't cover yet.

- **Money world:** coins and notes, making an amount, finding the total, giving change.
- **Time world:** o'clock, half past, quarter past and to, five-minute steps, how long things take.
- Build both for phone and iPad from the start: every new screen must fit a phone with no scrolling during a question.
- Each needs a brief in `briefs/`, a test page in `tests/`, kit pictures (coins, a clock face) built so later worlds can use them, and Bonnie's lines recorded.
- Level 1 of each is free, like every other world. Both join Bonnie's Walk through their first two levels.
- Remake the App Store screenshots and update the level counts in the listing.

### 1.3 Spelling and Grammar (April 2027)

Out before SATs season in May, which the listing's keywords already aim at.

- **Spelling world:** suffixes (-ing, -ed, -er, -est, -ly, -ful, -less), contractions and homophones.
- **Grammar world:** nouns, verbs, adjectives, joining words (and, but, because), past and present tense.
- **Shapes (small maths world):** 2D and 3D shapes, sides and corners, lines of symmetry.
- Use the story characters (`CHARACTERS`) in every sentence, never the player's name.
- Change the promotional text for SATs season (no review needed).

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

## Decisions for Anthony

1. **The website gives away the full game.** holmeshouse.co.uk has all 58 levels unlocked, and it is the marketing address in the listing. Choices: lock it to the same taster as the app, move the family's copy to a private address, or leave it as it is.
2. **Year 3 pricing.** Either part of the same £3.99 unlock (generous, and good for reviews) or a second purchase. Decide by spring 2027.
3. (Decided 15 November 2026) iPhone is the first update, 1.1.

## Keeping this plan honest

- After each release, mark it done here with the date and write down what slipped.
- If a release is more than a month late, drop something from it. Don't push every later date back.
