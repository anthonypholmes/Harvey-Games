# Level-by-level phone check

Made by `node tools/level-check.mjs` on 2026-11-16: the first question of every level, with the full game unlocked. Pictures (what the phone shows, before any scrolling) are in `docs/phone-check/levels/<size>/`; open `docs/phone-check/levels.html` to see them side by side.

"On screen" means everything a child taps to answer (keys, tiles, slots, bowls, signposts, choices) is above the bottom of the screen without scrolling. "Npx below" means the last of them is that far down. Bonnie and Ask Bonnie are not counted: they sit under the answers on a phone. On a phone the number keys stay fixed at the bottom of the screen, so they are always in reach; the other taps are measured against the top of the keys. Questions are random, so a level can measure a little differently each run.

## The Partitioning Park

| Level | iPhone SE | iPhone 17 | First question (iPhone SE) |
|---|---|---|---|
| 1. Teen Numbers | 118px below | on screen | Make 17. |
| 2. Tens and Ones | on screen | on screen | Split 72 into tens and ones. |
| 3. Missing Parts | on screen | on screen | Find the missing part. |
| 4. Hundreds | on screen | on screen | Split 433 into hundreds, tens and ones. |
| 5. Tricky Zeros | on screen | on screen | Split 770 into hundreds, tens and ones. |
| 6. Split It Another Way | 16px below | on screen | Split 32 another way. |
| 7. Thousands | on screen | on screen | Split 9138 into thousands, hundreds, tens and ones. |
| 8. Partition to Add | on screen | on screen | Work out 47 + 32. |

- iPhone SE, level 6: smaller than 44 × 44: `button.ten "Swap this ten for 10" 13×157`, `button.ten "Swap this ten for 10" 13×157`, `button.ten "Swap this ten for 10" 13×157`
- iPhone 17, level 6: smaller than 44 × 44: `button.ten "Swap this ten for 10" 13×157`, `button.ten "Swap this ten for 10" 13×157`, `button.ten "Swap this ten for 10" 13×157`, `button.ten "Swap this ten for 10" 13×157`

## Number Bonds Burrow

| Level | iPhone SE | iPhone 17 | First question (iPhone SE) |
|---|---|---|---|
| 1. Bonds to 10 | on screen | on screen | What goes with 1 to make 10? |
| 2. Bonds to 20 | 234px below | 9px below | Bonnie has 6 bones. She digs up 8 more. How many now? |
| 3. Tens Facts | on screen | on screen | Use the little fact to help. |
| 4. Ones and Tens | on screen | on screen | What is 85 add 7? |
| 5. Two-Digit Diggers | on screen | on screen | What is 21 add 76? |
| 6. Three Little Numbers | on screen | on screen | What is 5 + 2 + 8? |
| 7. Fact Families | on screen | on screen | What number take away 8 leaves 5? |

## The Stepping Stone River

| Level | iPhone SE | iPhone 17 | First question (iPhone SE) |
|---|---|---|---|
| 1. Full Tick Trails | 4px below | on screen | What number is Bonnie sitting on? |
| 2. Stepping Stones | 37px below | on screen | Count on in 2s. What number is Bonnie on? |
| 3. Midpoint Explorers | on screen | on screen | Where does 45 go? |
| 4. Tens Boundaries | 4px below | on screen | Which two tens is 63 between? |
| 5. Froggy Jumps | on screen | on screen | Start at 38. Jump forward 7. |

## The Array Orchard

| Level | iPhone SE | iPhone 17 | First question (iPhone SE) |
|---|---|---|---|
| 1. Bone Groups | on screen | on screen | 2 plates with 4 bones on each. How many bones? |
| 2. Grid Builder | 10px below | on screen | Make 5 rows of 6. |
| 3. The Swapping Tree | 102px below | 42px below | Turn the tree! What is 6 × 3? |
| 4. Times Tables Harvest | on screen | on screen | Harvest time! What is 10 × 5? |
| 5. Word Problems | on screen | on screen | Oliver has 3 plates with 5 bones on each. How many bones altogether? |

- iPhone SE, level 2: smaller than 44 × 44: `span.gv-cell 21×21`, `span.gv-cell 21×21`, `span.gv-cell 21×21`, `span.gv-cell 21×21`
- iPhone 17, level 2: smaller than 44 × 44: `span.gv-cell 24×24`, `span.gv-cell 24×24`, `span.gv-cell 24×24`, `span.gv-cell 24×24`

## The Sharing Pond

| Level | iPhone SE | iPhone 17 | First question (iPhone SE) |
|---|---|---|---|
| 1. Equal Sharing | 248px below | on screen | Share 20 bones equally between 10 bowls. |
| 2. Grouping | 58px below | on screen | 20 bones. Put 10 in each basket. How many baskets? |
| 3. Half a Pond | 44px below | on screen | What is half of 16? |
| 4. Quarter Splitting | 59px below | on screen | What is a quarter of 20? |
| 5. Inverse Check | on screen | on screen | Use the times fact to help. |
| 6. Thirds Island | 27px below | on screen | What is a third of 3? |
| 7. Three Quarters | 59px below | on screen | What is three quarters of 20? |

## Captain’s Cove

| Level | iPhone SE | iPhone 17 | First question (iPhone SE) |
|---|---|---|---|
| 1. True or False? | on screen | on screen | Is the Captain right? |
| 2. Treasure Chests | on screen | on screen | Always, sometimes or never? |
| 3. Test the Captain | 215px below | 84px below | Test it! Can you bust it? |
| 4. Spot the Mistake | 15px below | on screen | Spot the mistake, then fix it! |
| 5. Prove It! | on screen | on screen | Count the bones and carrots both ways. |
| 6. Odd One Out | on screen | on screen | Which one is the odd one out? |

