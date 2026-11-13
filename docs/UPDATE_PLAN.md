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
| **1.0.1 Real-world check** | Live by about 11 December 2026 | Fixes from the first families, the checks not yet done, and two new grown-ups buttons |
| **1.1 Money and Time** | Late January 2027 | Two new Year 2 maths worlds |
| **1.2 Spelling and Grammar** | Late March 2027 | Two new Year 2 English worlds, and a small Shapes world |
| **1.3 iPhone** | May 2027 | The same app on phones (the stretch goal) |
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
- If the checks find nothing, this can ship with just the two buttons, or fold into 1.1.

### 1.1 Money and Time (late January 2027)

The two biggest Year 2 maths topics the game doesn't cover yet.

- **Money world:** coins and notes, making an amount, finding the total, giving change.
- **Time world:** o'clock, half past, quarter past and to, five-minute steps, how long things take.
- Each needs a brief in `briefs/`, a test page in `tests/`, kit pictures (coins, a clock face) built so later worlds can use them, and Bonnie's lines recorded.
- Level 1 of each is free, like every other world. Both join Bonnie's Walk through their first two levels.
- Remake the App Store screenshots and update the level counts in the listing.

### 1.2 Spelling and Grammar (late March 2027)

Out before SATs season in May, which the listing's keywords already aim at.

- **Spelling world:** suffixes (-ing, -ed, -er, -est, -ly, -ful, -less), contractions and homophones.
- **Grammar world:** nouns, verbs, adjectives, joining words (and, but, because), past and present tense.
- **Shapes (small maths world):** 2D and 3D shapes, sides and corners, lines of symmetry.
- Use the story characters (`CHARACTERS`) in every sentence, never the player's name.
- Change the promotional text for SATs season (no review needed).

### 1.3 iPhone (May 2027, the stretch goal)

- Mostly layout work: every screen at phone size, upright. It widens the audience a great deal.
- **Once iPhone support is released it can't be taken away**, so only ship it when every world is comfortable on a small screen.
- Needs iPhone screenshots for the listing.
- If Year 3 by summer matters more, swap this with 2.0.

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
3. **iPhone before or after Year 3.** This plan puts iPhone first, for reach.

## Keeping this plan honest

- After each release, mark it done here with the date and write down what slipped.
- If a release is more than a month late, drop something from it. Don't push every later date back.
