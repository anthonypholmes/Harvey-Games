# Phone-size check

Made by `node tools/phone-check.mjs` on 2026-11-16. The pictures are in `docs/phone-check/<size>/`; open `docs/phone-check/index.html` in a browser to see them side by side.

Sizes: iPhone SE (375 × 667), iPhone 17 (402 × 874), iPhone 17 Pro Max (440 × 956), iPad (2018) (768 × 1024).

"Too wide" means the page can be pushed sideways, which must never happen. "Scrolls" is how far below the screen the page goes: fine for the shop and the grown-ups area, not during a question.

| Screen | iPhone SE | iPhone 17 | iPhone 17 Pro Max | iPad (2018) |
|---|---|---|---|---|
| clubhouse | scrolls 300px | scrolls 144px | scrolls 62px | fits |
| players | scrolls 75px | fits | fits | fits |
| maths-worlds | scrolls 8px | fits | fits | fits |
| words-worlds | scrolls 183px | scrolls 52px | fits | scrolls 108px |
| maths-map | scrolls 782px | scrolls 630px | scrolls 473px | scrolls 78px |
| words-map | scrolls 157px | fits | fits | fits |
| paid-level | scrolls 782px | scrolls 630px | scrolls 473px | scrolls 78px |
| grownups-gate | scrolls 504px | scrolls 331px | scrolls 249px | scrolls 81px |
| grownups-area | scrolls 2920px | scrolls 2699px | scrolls 2451px | scrolls 2057px |
| unlock | scrolls 164px | scrolls 33px | fits | fits |
| shop-dress-up | scrolls 2953px | scrolls 2808px | scrolls 2652px | scrolls 1762px |
| shop-themes | scrolls 397px | scrolls 252px | scrolls 76px | fits |
| shop-prizes | scrolls 2196px | scrolls 1990px | scrolls 1774px | scrolls 655px |
| walk | scrolls 343px | scrolls 142px | scrolls 96px | fits |
| partitioning-level | scrolls 270px | scrolls 95px | scrolls 18px | fits |
| partitioning-help | scrolls 422px | scrolls 246px | scrolls 169px | scrolls 16px |
| number-bonds-level | scrolls 345px | scrolls 192px | scrolls 115px | scrolls 14px |
| number-bonds-help | scrolls 314px | scrolls 161px | scrolls 84px | fits |
| number-lines-level | scrolls 156px | scrolls 25px | fits | fits |
| number-lines-help | scrolls 259px | scrolls 128px | scrolls 46px | fits |
| arrays-level | scrolls 341px | scrolls 240px | scrolls 13px | fits |
| arrays-help | scrolls 237px | scrolls 228px | fits | fits |
| sharing-level | scrolls 506px | scrolls 378px | scrolls 277px | scrolls 258px |
| sharing-help | scrolls 447px | scrolls 347px | scrolls 180px | scrolls 40px |
| captains-cove-level | scrolls 13px | fits | fits | fits |
| captains-cove-help | scrolls 121px | scrolls 4px | fits | fits |
| phonics-level | scrolls 255px | scrolls 124px | scrolls 8px | fits |
| phonics-help | scrolls 326px | scrolls 195px | scrolls 89px | fits |
| tricky-words-level | scrolls 283px | scrolls 128px | fits | fits |
| tricky-words-help | scrolls 283px | scrolls 152px | fits | fits |
| sentences-level | scrolls 146px | scrolls 15px | fits | fits |
| sentences-help | scrolls 193px | scrolls 62px | fits | fits |
| stories-level | scrolls 311px | scrolls 90px | fits | fits |
| stories-help | scrolls 382px | scrolls 161px | scrolls 55px | fits |

## Problems at iPhone SE size

Each problem once, with the screens it was found on.

### Smaller than 44 × 44 (hard to tap)

- `input 24×24`: grownups-area
- `input#pTeach 24×24`: grownups-area
- `input#pSfx 24×24`: grownups-area
- `input#pVoice 24×24`: grownups-area
- `input#pRead 24×24`: grownups-area
- `input#pUnlock 24×24`: grownups-area
- `input#pWarm 24×24`: grownups-area
- `button.sb.dot "Play sound" 18×18`: walk, phonics-level, phonics-help

