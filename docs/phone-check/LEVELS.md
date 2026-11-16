# Level-by-level phone check

Made by `node tools/level-check.mjs` on 2026-11-16: the first question of every level, with the full game unlocked. Pictures (what the phone shows, before any scrolling) are in `docs/phone-check/levels/<size>/`; open `docs/phone-check/levels.html` to see them side by side.

"On screen" means everything a child taps to answer (keys, tiles, slots, bowls, signposts, choices) is above the bottom of the screen without scrolling. "Npx below" means the last of them is that far down. Bonnie and Ask Bonnie are not counted: they sit under the answers on a phone. On a phone the number keys stay fixed at the bottom of the screen, so they are always in reach; the other taps are measured against the top of the keys. Questions are random, so a level can measure a little differently each run.

## Phonics Forest

| Level | iPhone SE | iPhone 17 | First question (iPhone SE) |
|---|---|---|---|
| 1. a-e  (cake, snake) | on screen | on screen | Let's play a ? ! |
| 2. i-e & o-e  (kite, bone) | on screen | on screen | Bonnie's favourite ? ! |
| 3. u-e & e-e  (cube, these) | on screen | on screen | Bonnie is so ? ! |
| 4. ai / ay  (rain, day) | on screen | on screen | Let's go out and ? ! |
| 5. ee ea igh ie  (tree, leaf) | on screen | on screen | A green ? falls down. |

## Tricky Word Trail

| Level | iPhone SE | iPhone 17 | First question (iPhone SE) |
|---|---|---|---|
| 1. Trail Starters | on screen | on screen | Tap the signpost with the correct spelling to clear Bonnie's path! |
| 2. Where & There | on screen | on screen | Tap the signpost with the correct spelling to clear Bonnie's path! |
| 3. Would, Could, Should | on screen | on screen | Tap the signpost with the correct spelling to clear Bonnie's path! |
| 4. Water & Money | on screen | on screen | Tap the signpost with the correct spelling to clear Bonnie's path! |
| 5. Big Tricky Words | on screen | on screen | Tap the signpost with the correct spelling to clear Bonnie's path! |

## Sentence Meadow

| Level | iPhone SE | iPhone 17 | First question (iPhone SE) |
|---|---|---|---|
| 1. Capital Letters | on screen | on screen | 🌼 Tap the words that need a capital letter! |
| 2. Full Stop or Question? | on screen | on screen | 🌼 Which punctuation mark goes at the end? |
| 3. Exclamation! | on screen | on screen | 🌼 Which punctuation mark goes at the end? |
| 4. Word Order | on screen | on screen | 🌼 Drag the words into the right order, then add the end mark! |
| 5. Super Sentences | on screen | on screen | 🌼 Order the words, tap Aa for capitals, then add the end mark! |

## Bonnie's Story Nook

| Level | iPhone SE | iPhone 17 | First question (iPhone SE) |
|---|---|---|---|
| 1. Rhyme Time | 16px below | on screen | Bonnie dug a hole to hide her bone. Now she is sitting all ? . |
| 2. Who? | on screen | on screen | Oliver picked a red apple from the tree. Gran made a yummy pie with it |
| 3. Where & What? | 42px below | on screen | The ducks swam across the pond to the little island. They had a nap in |
| 4. Mixed Questions | 46px below | on screen | One morning, a hedgehog went for a stroll. It snuffled about and fell  |
| 5. Longer Stories | 70px below | on screen | Bonnie was very muddy after playing in the meadow. Sarah filled a tub  |

## The Partitioning Park

| Level | iPhone SE | iPhone 17 | First question (iPhone SE) |
|---|---|---|---|
| 1. Teen Numbers | 118px below | on screen | Make 11. |
| 2. Tens and Ones | on screen | on screen | Split 29 into tens and ones. |
| 3. Missing Parts | on screen | on screen | Find the missing part. |
| 4. Hundreds | on screen | on screen | Split 188 into hundreds, tens and ones. |
| 5. Tricky Zeros | on screen | on screen | Split 701 into hundreds, tens and ones. |
| 6. Split It Another Way | 16px below | on screen | Split 44 another way. |
| 7. Thousands | on screen | on screen | Split 1296 into thousands, hundreds, tens and ones. |
| 8. Partition to Add | on screen | on screen | Work out 61 + 27. |

## Number Bonds Burrow

| Level | iPhone SE | iPhone 17 | First question (iPhone SE) |
|---|---|---|---|
| 1. Bonds to 10 | on screen | on screen | What goes with 2 to make 10? |
| 2. Bonds to 20 | 234px below | 9px below | Bonnie has 7 bones. She digs up 5 more. How many now? |
| 3. Tens Facts | on screen | on screen | Use the little fact to help. |
| 4. Ones and Tens | on screen | on screen | What is 43 add 8? |
| 5. Two-Digit Diggers | on screen | on screen | What is 59 add 21? |
| 6. Three Little Numbers | on screen | on screen | What is 3 + 7 + 6? |
| 7. Fact Families | on screen | on screen | What number take away 6 leaves 6? |

## The Stepping Stone River

| Level | iPhone SE | iPhone 17 | First question (iPhone SE) |
|---|---|---|---|
| 1. Full Tick Trails | 4px below | on screen | What number is Bonnie sitting on? |
| 2. Stepping Stones | 37px below | on screen | Count on in 5s. What number is Bonnie on? |
| 3. Midpoint Explorers | on screen | on screen | Where does 77 go? |
| 4. Tens Boundaries | 4px below | on screen | Which two tens is 61 between? |
| 5. Froggy Jumps | on screen | on screen | Start at 55. Jump forward 7. |

## The Array Orchard

| Level | iPhone SE | iPhone 17 | First question (iPhone SE) |
|---|---|---|---|
| 1. Bone Groups | on screen | on screen | 2 plates with 2 bones on each. How many bones? |
| 2. Grid Builder | 11px below | on screen | Make 5 rows of 10. |
| 3. The Swapping Tree | 50px below | 14px below | Turn the tree! What is 4 × 2? |
| 4. Times Tables Harvest | on screen | on screen | Harvest time! What is 10 × 7? |
| 5. Word Problems | on screen | on screen | Bonnie has 5 bowls with 4 treats in each. How many treats? |

- iPhone SE, level 2: smaller than 44 × 44: `span.gv-cell 26×26`, `span.gv-cell 26×26`, `span.gv-cell 26×26`, `span.gv-cell 26×26`
- iPhone 17, level 2: smaller than 44 × 44: `span.gv-cell 28×28`, `span.gv-cell 28×28`, `span.gv-cell 28×28`, `span.gv-cell 28×28`

## The Sharing Pond

| Level | iPhone SE | iPhone 17 | First question (iPhone SE) |
|---|---|---|---|
| 1. Equal Sharing | 114px below | 120px below | Can you help Bonnie share 15 bones between 3 bowls? |
| 2. Grouping | 30px below | on screen | 10 bones. Put 5 in each basket. How many baskets? |
| 3. Half a Pond | 16px below | on screen | What is half of 4? |
| 4. Quarter Splitting | 3px below | on screen | What is a quarter of 4? |
| 5. Inverse Check | on screen | on screen | Use the times fact to help. |
| 6. Thirds Island | 27px below | on screen | What is a third of 6? |
| 7. Three Quarters | 59px below | on screen | What is three quarters of 20? |

## Captain’s Cove

| Level | iPhone SE | iPhone 17 | First question (iPhone SE) |
|---|---|---|---|
| 1. True or False? | on screen | on screen | Is the Captain right? |
| 2. Treasure Chests | on screen | on screen | Always, sometimes or never? |
| 3. Test the Captain | 108px below | on screen | Test it! Can you bust it? |
| 4. Spot the Mistake | on screen | on screen | Spot the mistake, then fix it! |
| 5. Prove It! | on screen | on screen | Count the bones and carrots both ways. |
| 6. Odd One Out | on screen | on screen | Which one is the odd one out? |

