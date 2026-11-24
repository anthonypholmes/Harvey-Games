# Level-by-level phone check

Made by `node tools/level-check.mjs` on 2026-11-24: the first question of every level, with the full game unlocked. Pictures (what the phone shows, before any scrolling) are in `docs/phone-check/levels/<size>/`; open `docs/phone-check/levels.html` to see them side by side.

"On screen" means everything a child taps to answer (keys, tiles, slots, bowls, signposts, choices) is above the bottom of the screen without scrolling. "Npx below" means the last of them is that far down. Bonnie and Ask Bonnie are not counted: they sit under the answers on a phone. On a phone the number keys stay fixed at the bottom of the screen, so they are always in reach; the other taps are measured against the top of the keys. Questions are random, so a level can measure a little differently each run.

## Phonics Forest

| Level | iPhone SE | iPhone 17 | iPad (2018) | First question (iPhone SE) |
|---|---|---|---|---|
| 1. a-e  (cake, snake) | on screen | on screen | on screen | A juicy purple ? blank. |
| 2. i-e & o-e  (kite, bone) | on screen | on screen | on screen | Bonnie sniffs with her ? blank. |
| 3. u-e & e-e  (cube, these) | on screen | on screen | on screen | Cut! On to the next ? blank! |
| 4. ai / ay  (rain, day) | on screen | on screen | on screen | Carry the cups on a ? blank. |
| 5. ee ea igh ie  (tree, leaf) | on screen | on screen | on screen | A green ? blank falls down. |
| 6. Tricky Consonants  (badge, knee) | on screen | on screen | on screen | There was a loud ? blank at the door. |
| 7. Word Endings  (apple, camel) | on screen | on screen | on screen | Dry your hands on the ? blank. |
| 8. Changing Words  (hop, hopping) | 16px below | on screen | on screen | What happens when we add the ending? |
| 9. Suffix Builders  (kind, kindness) | on screen | on screen | on screen | This pen is ? blank. It will not write at all! |
| 10. Same Sound, Different Spelling  (cry, key) | on screen | on screen | on screen | My birthday is in ? blank. |

## Tricky Word Trail

| Level | iPhone SE | iPhone 17 | iPad (2018) | First question (iPhone SE) |
|---|---|---|---|---|
| 1. Trail Starters | on screen | on screen | on screen | Tap the signpost with the correct spelling to clear Bonnie's path! |
| 2. Where & There | on screen | on screen | on screen | Tap the signpost with the correct spelling to clear Bonnie's path! |
| 3. Would, Could, Should | on screen | on screen | on screen | Tap the signpost with the correct spelling to clear Bonnie's path! |
| 4. Water & Money | on screen | on screen | on screen | Tap the signpost with the correct spelling to clear Bonnie's path! |
| 5. Big Tricky Words | on screen | on screen | on screen | Tap the signpost with the correct spelling to clear Bonnie's path! |

## Sentence Meadow

| Level | iPhone SE | iPhone 17 | iPad (2018) | First question (iPhone SE) |
|---|---|---|---|---|
| 1. Capital Letters | on screen | on screen | on screen | 🌼 Tap the words that need a capital letter! |
| 2. Full Stop or Question? | on screen | on screen | on screen | 🌼 Which punctuation mark goes at the end? |
| 3. Exclamation! | on screen | on screen | on screen | 🌼 Which punctuation mark goes at the end? |
| 4. Word Order | on screen | on screen | on screen | 🌼 Drag the words into the right order, then add the end mark! |
| 5. Super Sentences | on screen | on screen | on screen | 🌼 Order the words, tap Aa for capitals, then add the end mark! |
| 6. Comma Caterpillar | on screen | on screen | on screen | 🌼 Tap the spaces where the commas go, then tap Check. |
| 7. Apostrophe Adventures | on screen | on screen | on screen | 🌼 Make the short word. Tap the letters we leave out. |
| 8. Four Kinds of Sentences | on screen | on screen | on screen | 🌼 What kind of sentence is this? |
| 9. Joining Sentences | on screen | on screen | on screen | 🌼 Which joining word makes the best sense? |

- iPhone SE, level 6: smaller than 44 × 44: `button.m2-gap "Space after Mia, no " 26×40`, `button.m2-gap "Space after likes, n" 26×40`, `button.m2-gap "Space after apples, " 26×40`, `button.m2-gap "Space after pears, n" 26×40`
- iPhone 17, level 6: smaller than 44 × 44: `button.m2-gap "Space after Gran, no" 26×40`, `button.m2-gap "Space after grows, n" 26×40`, `button.m2-gap "Space after carrots," 26×40`, `button.m2-gap "Space after beans, n" 26×40`
- iPad (2018), level 6: smaller than 44 × 44: `button.m2-gap "Space after We, no c" 30×46`, `button.m2-gap "Space after saw, no " 30×46`, `button.m2-gap "Space after cows, no" 30×46`, `button.m2-gap "Space after sheep, n" 30×46`

## Bonnie's Story Nook

| Level | iPhone SE | iPhone 17 | iPad (2018) | First question (iPhone SE) |
|---|---|---|---|---|
| 1. Rhyme Time | 16px below | on screen | on screen | Tom and Bonnie saw a cat. The cat was sitting on a ? blank. |
| 2. Who? | on screen | on screen | on screen | A tiny mouse lived under the oak tree. An owl hooted at night, but the |
| 3. Where & What? | 10px below | on screen | on screen | Bonnie wore her best bow to the meadow party. Everyone ate cake and da |
| 4. Mixed Questions | 46px below | on screen | on screen | A bird sat in a tree and sang a happy tune. It sang all morning and al |
| 5. Longer Stories | 70px below | on screen | on screen | The wind blew hard and the leaves fell off the trees. They were red, o |
| 6. Reading Between the Lines | 135px below | on screen | on screen | The squirrel sat on the fence, nibbling a nut. A big dog came bounding |
| 7. What Happens Next? | 139px below | on screen | on screen | The hen sat on her nest for many days. One morning, she heard a tiny t |
| 8. Bonnie's Fact Files | 389px below | 163px below | on screen | HoneybeesWhere they liveHoneybees live together in a big group. Their  |
| 9. Story Detective | 105px below | 306px below | 67px below | Gran's plants were drooping. It had not rained for weeks. Priya filled |

## The Partitioning Park

| Level | iPhone SE | iPhone 17 | iPad (2018) | First question (iPhone SE) |
|---|---|---|---|---|
| 1. Teen Numbers | 118px below | on screen | on screen | Make 12. |
| 2. Tens and Ones | on screen | on screen | 47px below | Split 41 into tens and ones. |
| 3. Missing Parts | on screen | on screen | 11px below | Find the missing part. |
| 4. Hundreds | on screen | on screen | on screen | Split 967 into hundreds, tens and ones. |
| 5. Tricky Zeros | on screen | on screen | on screen | Split 903 into hundreds, tens and ones. |
| 6. Split It Another Way | 16px below | on screen | 109px below | Split 80 another way. |
| 7. Thousands | on screen | on screen | 14px below | Split 2369 into thousands, hundreds, tens and ones. |
| 8. Partition to Add | on screen | on screen | on screen | Work out 11 + 55. |

## Number Bonds Burrow

| Level | iPhone SE | iPhone 17 | iPad (2018) | First question (iPhone SE) |
|---|---|---|---|---|
| 1. Bonds to 10 | on screen | on screen | on screen | What goes with 1 to make 10? |
| 2. Bonds to 20 | 184px below | 58px below | 220px below | What is 6 add 5? |
| 3. Tens Facts | on screen | on screen | on screen | Use the little fact to help. |
| 4. Ones and Tens | on screen | on screen | 29px below | Bonnie has 64 bones. She digs up 5 more. How many now? |
| 5. Two-Digit Diggers | on screen | on screen | 11px below | What is 27 add 43? |
| 6. Three Little Numbers | on screen | on screen | on screen | What is 3 + 7 + 5? |
| 7. Fact Families | on screen | on screen | on screen | What number take away 7 leaves 8? |

## The Stepping Stone River

| Level | iPhone SE | iPhone 17 | iPad (2018) | First question (iPhone SE) |
|---|---|---|---|---|
| 1. Full Tick Trails | 4px below | on screen | on screen | What number is Bonnie sitting on? |
| 2. Stepping Stones | 37px below | on screen | on screen | Count on in 5s. What number is Bonnie on? |
| 3. Midpoint Explorers | on screen | on screen | on screen | Where does 15 go? |
| 4. Tens Boundaries | 4px below | on screen | on screen | Which two tens is 19 between? |
| 5. Froggy Jumps | on screen | on screen | on screen | Start at 88. Jump forward 2. |

## The Array Orchard

| Level | iPhone SE | iPhone 17 | iPad (2018) | First question (iPhone SE) |
|---|---|---|---|---|
| 1. Bone Groups | 47px below | on screen | on screen | 5 plates with 10 bones on each. How many bones? |
| 2. Grid Builder | 11px below | on screen | on screen | Make 2 rows of 9. |
| 3. The Swapping Tree | 100px below | 14px below | 124px below | Turn the tree! What is 3 × 4? |
| 4. Times Tables Harvest | on screen | on screen | on screen | Harvest time! What is 5 × 8? |
| 5. Word Problems | on screen | on screen | on screen | There are 4 trees with 4 apples on each. How many apples? |

- iPhone SE, level 2: smaller than 44 × 44: `span.gv-cell 26×26`, `span.gv-cell 26×26`, `span.gv-cell 26×26`, `span.gv-cell 26×26`
- iPhone 17, level 2: smaller than 44 × 44: `span.gv-cell 28×28`, `span.gv-cell 28×28`, `span.gv-cell 28×28`, `span.gv-cell 28×28`
- iPad (2018), level 2: smaller than 44 × 44: `span.gv-cell 42×42`, `span.gv-cell 42×42`, `span.gv-cell 42×42`, `span.gv-cell 42×42`

## The Sharing Pond

| Level | iPhone SE | iPhone 17 | iPad (2018) | First question (iPhone SE) |
|---|---|---|---|---|
| 1. Equal Sharing | 86px below | on screen | 122px below | Share 8 bones equally between 4 bowls. |
| 2. Grouping | 86px below | on screen | on screen | 30 bones. Put 5 in each basket. How many baskets? |
| 3. Half a Pond | 16px below | on screen | 42px below | What is half of 6? |
| 4. Quarter Splitting | 3px below | on screen | 42px below | What is a quarter of 4? |
| 5. Inverse Check | on screen | on screen | on screen | Use the times fact to help. |
| 6. Thirds Island | 55px below | on screen | 42px below | What is a third of 15? |
| 7. Three Quarters | 31px below | on screen | 42px below | What is three quarters of 16? |

## Harbour Market

| Level | iPhone SE | iPhone 17 | iPad (2018) | First question (iPhone SE) |
|---|---|---|---|---|
| 1. Coin Spotting | on screen | on screen | on screen | How much is this coin? |
| 2. Counting Coins | on screen | on screen | on screen | Priya has these coins. How much is that? |
| 3. Make the Amount | on screen | on screen | on screen | Put 37p in Bonnie’s purse. |
| 4. Another Way | 99px below | on screen | on screen | Bonnie made 90p like this. Can you make 90p a different way? |
| 5. Pounds and Pence | on screen | on screen | on screen | How many pence make £1? |
| 6. Market Shopping | on screen | on screen | on screen | How much for both of these? |
| 7. Giving Change | on screen | on screen | on screen | Ava buys this for 95p and pays with £1. How much change? |

## The Clock Tower

| Level | iPhone SE | iPhone 17 | iPad (2018) | First question (iPhone SE) |
|---|---|---|---|---|
| 1. O’Clock and Half Past | on screen | on screen | on screen | What’s the time? |
| 2. Quarter Past and To | on screen | on screen | on screen | What’s the time? |
| 3. Five-Minute Steps | on screen | on screen | on screen | What time is it? |
| 4. Set the Clock | on screen | on screen | on screen | Show 20 past 12. |
| 5. Minutes and Hours | on screen | on screen | on screen | How many minutes are in an hour? |
| 6. How Long? | on screen | on screen | on screen | How long did bath time take? |
| 7. Before and After | on screen | on screen | on screen | It’s quarter past 2. What time was it 15 minutes ago? |

## Captain’s Cove

| Level | iPhone SE | iPhone 17 | iPad (2018) | First question (iPhone SE) |
|---|---|---|---|---|
| 1. True or False? | on screen | on screen | on screen | Is the Captain right? |
| 2. Treasure Chests | on screen | on screen | on screen | Always, sometimes or never? |
| 3. Test the Captain | 78px below | on screen | on screen | Test it! Can you bust it? |
| 4. Spot the Mistake | on screen | on screen | on screen | Spot the mistake, then fix it! |
| 5. Prove It! | 101px below | on screen | 220px below | Share 12 bones between 3 bowls. |
| 6. Odd One Out | on screen | on screen | on screen | Which one is the odd one out? |

