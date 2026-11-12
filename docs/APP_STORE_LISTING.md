# Meadow Clubhouse: App Store listing

Everything to paste into App Store Connect, in the order the site asks for it. Written 12 November 2026.
Text in `code` is for pasting exactly. Character limits are Apple's.

## Before you start

1. **Apple Developer Program** approved (about £79 a year).
2. **Small Business Program:** enrol at developer.apple.com/app-store/small-business-program as soon as the developer account is active. Apple then keeps 15% instead of 30%. It only applies from the date you are accepted, so do it before launch.
3. **Agreements, Tax and Banking** in App Store Connect: accept the Paid Apps agreement and add bank and tax details. In-app purchases can't be tested on a real iPad or sold until this is done.
4. **Two web pages live on holmeshouse.co.uk:** `privacy.html` and `support.html`. Both are live (checked 12 November 2026).

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
Homework without the tears. Meadow Clubhouse turns Year 2 (KS1) maths and English into a game your child will ask to play, with Bonnie the chocolate-brown dog cheering them on every step of the way.

It began at a kitchen table. A dad wanted his six-year-old to stop dreading maths, so he built him a meadow, gave it a dog, and filled it with exactly what Year 2 children learn at school in England. The dread went. The practice stayed. Now it's yours.

WHY CHILDREN LOVE IT
Bonnie never tells a child they're wrong and leaves it there. She wags, she giggles when you tickle her, and when a question is tricky she says "let's work it out together". Every right answer earns a bone, and bones buy Bonnie hats, coats and whole new themes for the meadow.

WHY PARENTS LOVE IT
You'll hear "just one more level" about maths. You'll see what they practised this week without having to ask. And you'll never see an advert, a subscription or a pop-up asking your child to buy something.

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
Five quick questions a day, mixing maths and English. Nothing can be failed, so even a reluctant learner can finish with a smile. It's the gentlest daily habit you'll ever start.

HELP THAT TEACHES
Tap Ask Bonnie and she gives a clue, then shows a step, then works through it together. Sometimes Bonnie has a go herself and gets it gloriously wrong, and your child gets to be the teacher. If a level is proving hard, the game quietly eases off, so confidence comes first.

REAL PRIZES, CHOSEN BY YOU
Children can save their bones for real-life treats that you set: choosing the Friday film, staying up ten minutes late, being DJ in the car. A grown-up holds a button to say yes.

MADE FOR FAMILIES
• Up to 4 children, each with their own name, bones, stars and Bonnie outfit
• A grown-ups area showing this week's practice and how much help each level needed
• Works offline, so it's perfect for car journeys and waiting rooms
• Bonnie can read maths questions aloud, for children who are still building their reading

SAFE AND SIMPLE
• No adverts, ever
• No subscription
• No accounts, and nothing collected about your child
• The purchase button is behind a check for grown-ups

FREE TO TRY
Bonnie's Walk and the first level of every world are free, so your child can find the world they love. One purchase then unlocks all 58 levels for good, and works with Family Sharing.

Come and meet Bonnie. She's been waiting by the gate.
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
| Copyright | `2026 Anthony Holmes` |
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
| Review screenshot | `docs/screenshots/iap-unlock.png` |

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

PARENTAL GATE: the Grown-ups area and the purchase screen are behind a multiplication question (for example 7 x 12). Type the answer and tap Unlock.

PLAYERS: "Switch player" on the first page adds up to 4 child profiles. They are stored only on the device.

PRIVACY: the app collects no data. It has no adverts, no analytics, no accounts and no links out of the app. Purchases use StoreKit 2 directly. Bonnie's voice is pre-recorded audio bundled with the app.
```

## Screenshots

Six pictures are ready in `docs/screenshots/`, at the iPad 13-inch size Apple asks for (2064 × 2752). Drag them into the "iPad 13-inch Display" box in this order. The 11-inch size is filled in from these automatically.

| File | Caption on the picture |
|---|---|
| `1-clubhouse.png` | Year 2 maths and English, with Bonnie the dog cheering them on |
| `2-help.png` | Help that teaches: Bonnie gives a clue, then shows how |
| `3-maths-worlds.png` | 6 maths worlds, 38 levels |
| `4-words.png` | Phonics, spelling and stories: 4 English worlds, 20 levels |
| `5-bone-shop.png` | Earn bones for hats and prizes |
| `6-walk.png` | A walk with Bonnie every day |

They are made from the real game pages by `sh tools/make-screenshots.sh`, with a made-up player called Sam. Run it again after any change to how the game looks. Don't take screenshots in the Xcode simulator: it shows every emoji as a "?" box.

For the in-app purchase's review screenshot, use `docs/screenshots/iap-unlock.png`: the "Unlock the full game" screen with the £3.99 button. `sh tools/make-screenshots.sh unlock` makes it again (the page is `tools/unlock-shot.html`). Only Apple's reviewer sees it; it is not shown in the App Store.

## Header and search results pictures (optional, iOS 27 and later)

App Store Connect has two newer picture boxes under "Header and Search Results". Both are optional: without them the App Store shows the screenshots, as before.

| Box | File | Size |
|---|---|---|
| Product page header | `docs/screenshots/store-header.png` | 3840 × 1646 |
| Search results | `docs/screenshots/store-search.png` | 3840 × 2560 |

Both are drawn with the game's own Bonnie by `sh tools/make-store-art.sh` (the page is `tools/store-art.html`). Apple's rules for them: no prices, web addresses or awards, a short phrase at most, and suitable for a 4+ rating. Apple may trim the edges, so use the Preview button in App Store Connect to check Bonnie and the words aren't cut off or covered.

## Kids category rules to keep true

- No adverts and no third-party analytics. (True.)
- No links out of the app, and purchases only behind a parental gate. (True: the sum check.)
- A privacy policy URL is required. (Above.)
- Don't describe the app as "for kids" in the name or subtitle in ways the Made for Kids setting already covers. Words like "Year 2" and "KS1" are fine.

## After approval

- Ask the TestFlight families for a rating in the first week.
- Reply to every early review.
- Promotional text can be changed whenever you like, for example for the summer holidays or SATs season.
