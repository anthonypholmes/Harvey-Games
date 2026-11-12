# Meadow Clubhouse: App Store listing

Everything to paste into App Store Connect, in the order the site asks for it. Written 12 November 2026.
Text in `code` is for pasting exactly. Character limits are Apple's.

## Before you start

1. **Apple Developer Program** approved (about £79 a year).
2. **Small Business Program:** enrol at developer.apple.com/app-store/small-business-program as soon as the developer account is active. Apple then keeps 15% instead of 30%. It only applies from the date you are accepted, so do it before launch.
3. **Agreements, Tax and Banking** in App Store Connect: accept the Paid Apps agreement and add bank and tax details. In-app purchases can't be tested on a real iPad or sold until this is done.
4. **Two web pages live on holmeshouse.co.uk:** `privacy.html` and `support.html` (drafts are in the project folder). Both have two gaps to fill first: `[YOUR NAME OR BUSINESS NAME]` and `[YOUR SUPPORT EMAIL]`.

## App information

| Field | Value |
|---|---|
| Name (30) | `Meadow Clubhouse` |
| Subtitle (30) | `Year 2 Maths & English (KS1)` |
| Bundle ID | `uk.co.holmeshouse.meadow` |
| SKU | `meadow-clubhouse-ipad` |
| Primary language | English (U.K.) |
| Primary category | Education |
| Secondary category | Games, then Educational (optional) |
| Content rights | Does not contain third-party content |
| Age rating | Answer "None" to every question. Result: 4+ |
| Made for Kids | Yes, ages 6–8. This can't be undone once the app is approved. |
| Price | Free |
| Availability | Start with the United Kingdom, or all countries |

If "Meadow Clubhouse" is taken, use `Meadow Clubhouse: KS1 Learning`.

## Version information

**Promotional text (170).** This can be changed at any time without a new review.

```
Year 2 maths and English with Bonnie the dog. Try the first level of every world for free. No adverts, no subscription, and it works offline.
```

**Description (4,000)**

```
Meadow Clubhouse is Year 2 (KS1) maths and English practice with Bonnie, a friendly chocolate-brown dog who cheers your child on, talks them through each world and helps when they're stuck.

It was made by a parent for his own Year 2 child, and follows what children aged 6 to 7 learn at school in England.

MEADOW MATHS: 6 worlds, 38 levels
• The Partitioning Park: tens and ones, hundreds, splitting numbers different ways
• Number Bonds Burrow: bonds to 10 and 20, adding and taking away, fact families
• The Stepping Stone River: number lines, midpoints, jumping in steps
• The Array Orchard: groups, arrays and the 2, 5 and 10 times tables
• The Sharing Pond: sharing, grouping, halves, quarters and thirds
• Captain's Cove: is Captain Croak right? True or false, spot the mistake, prove it

MEADOW WORDS: 4 worlds, 20 levels
• Phonics Forest: split digraphs and tricky sounds
• Tricky Word Trail: the Year 2 common exception words
• Sentence Meadow: capital letters, full stops, question marks and word order
• Bonnie's Story Nook: short stories, rhymes and reading questions

BONNIE'S WALK
Five quick questions a day, mixing maths and English. Nothing can be failed, so it's a gentle way to build a daily habit.

HELP THAT TEACHES
Tap Ask Bonnie and she gives a clue, then shows a step, then works through it together. Now and then Bonnie has a go herself and your child checks her answer. If a level is proving hard, the game quietly makes the next questions a little easier.

BONES, HATS AND REAL PRIZES
Right answers earn bones. Children spend them in Bonnie's Bone Shop on hats, coats and themes, or save up for real-life prizes that you choose, like a film night or a trip to the park.

MADE FOR FAMILIES
• Up to 4 children, each with their own name, bones, stars and Bonnie outfit
• A grown-ups area showing this week's practice and how much help each level needed
• Works offline, so it's good for car journeys
• Bonnie can read maths questions aloud, for children who are still building their reading

SAFE AND SIMPLE
• No adverts
• No subscription
• No accounts, and nothing collected about your child
• The purchase button is behind a check for grown-ups

FREE TO TRY
Bonnie's Walk and the first level of every world are free. One purchase unlocks all 58 levels for good, and works with Family Sharing.
```

**Keywords (100, commas, no spaces).** Words already in the name and subtitle are left out, because Apple counts those anyway.

```
phonics,spelling,times tables,number bonds,sats,primary,age 6,age 7,homework,reading,fractions
```

| Field | Value |
|---|---|
| Support URL | `https://holmeshouse.co.uk/support.html` |
| Marketing URL | `https://holmeshouse.co.uk` (optional) |
| Privacy Policy URL | `https://holmeshouse.co.uk/privacy.html` |
| Copyright | `2026 [YOUR NAME OR BUSINESS NAME]` |
| Version | 1.0 |

## App Privacy (the "nutrition label")

- "Do you or your third-party partners collect data from this app?" **No.**
- The label will read **Data Not Collected**.
- This is true because saves stay on the iPad, there are no analytics or advert tools, and purchases go through Apple's own StoreKit with no other service.

## In-app purchase

| Field | Value |
|---|---|
| Type | Non-Consumable |
| Reference name | `Full Game` |
| Product ID | `uk.co.holmeshouse.meadow.fullgame` (must match exactly) |
| Price | £3.99 |
| Family Sharing | Turn on. This can't be turned off later. |
| Display name (35) | `Full Game` |
| Description (55) | `Opens every level in Meadow Maths and Meadow Words.` |
| Review screenshot | A screenshot of the "Unlock the full game" screen |

The first in-app purchase has to be submitted together with the app version: on the version page, add it under "In-App Purchases and Subscriptions" before pressing Submit.

## App Review information

Sign-in required: **No.**

**Notes for the reviewer**

```
Meadow Clubhouse is a Year 2 (ages 6-7) maths and English practice app.

FREE CONTENT: Bonnie's Walk and level 1 of every world.

IN-APP PURCHASE: one non-consumable, "Full Game", which unlocks levels 2 onwards in every world.
To find it: open Meadow Maths, tap any world, tap a level with a padlock, then "Grown-ups: unlock".
It is also in the Grown-ups area (the Grown-ups button on any page), under "Full game".
Restore Purchases is on the same unlock screen.

PARENTAL GATE: the Grown-ups area and the purchase screen are behind a multiplication question (for example 7 x 14). Type the answer and tap Unlock.

PLAYERS: "Switch player" on the first page adds up to 4 child profiles. They are stored only on the device.

PRIVACY: the app collects no data. It has no adverts, no analytics, no accounts and no links out of the app. Purchases use StoreKit 2 directly. Bonnie's voice is pre-recorded audio bundled with the app.
```

## Screenshots

- **Needed:** iPad 13-inch, 2064 × 2752 (portrait) or 2752 × 2064 (landscape). Between 1 and 10. The 11-inch size is filled in from these automatically.
- **Don't take them in the Xcode simulator:** it shows every emoji as a "?" box (see the handoff notes). Take them on a real iPad through TestFlight, or ask Claude to make them from the game pages.
- **Suggested set of 6, in this order:**
  1. The Clubhouse with Bonnie greeting the child by name. Caption idea: "Year 2 maths and English with Bonnie"
  2. A maths question with the Ask Bonnie step card showing. "Help that teaches, not just answers"
  3. The Meadow Maths world list. "6 maths worlds, 38 levels"
  4. A Meadow Words question (Phonics Forest). "Phonics, spelling and stories"
  5. Bonnie's Bone Shop with a hat on. "Earn bones for hats and real prizes"
  6. The grown-ups "this week" panel. "See what they practised this week"
- Use a made-up name such as "Sam" in screenshots, not a real child's name.

## Kids category rules to keep true

- No adverts and no third-party analytics. (True.)
- No links out of the app, and purchases only behind a parental gate. (True: the sum check.)
- A privacy policy URL is required. (Above.)
- Don't describe the app as "for kids" in the name or subtitle in ways the Made for Kids setting already covers. Words like "Year 2" and "KS1" are fine.

## After approval

- Ask the TestFlight families for a rating in the first week.
- Reply to every early review.
- Promotional text can be changed whenever you like, for example for the summer holidays or SATs season.
