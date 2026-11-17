# Phone-size check

Made by `node tools/phone-check.mjs` on 2026-11-17. The pictures are in `docs/phone-check/<size>/`; open `docs/phone-check/index.html` in a browser to see them side by side.

Sizes: iPhone SE (375 × 667), iPhone 17 (402 × 874), iPhone 17 Pro Max (440 × 956), iPad (2018) (768 × 1024).

"Too wide" means the page can be pushed sideways, which must never happen. "Scrolls" is how far below the screen the page goes: fine for the shop and the grown-ups area, not during a question.

| Screen | iPhone SE | iPhone 17 | iPhone 17 Pro Max | iPad (2018) |
|---|---|---|---|---|
| clubhouse | scrolls 145px | fits | fits | fits |
| players | scrolls 9px | fits | fits | – |
| maths-worlds | – | – | scrolls 249px | – |
| sharing-level | scrolls 340px | – | – | – |
| sharing-help | scrolls 511px | – | – | – |
| captains-cove-level | scrolls 20px | – | fits | fits |
| captains-cove-help | scrolls 90px | – | fits | fits |

## Problems at iPhone SE size

Each problem once, with the screens it was found on.

### Smaller than 44 × 44 (hard to tap)

- `button#soundBtn "🔊 Sound: on" 168×38`: players
- `a#grownUps "🔒 Grown‑ups" 168×38`: players

### Writing under 14px

- `small "Captain Croak’s conjecture" 12px`: captains-cove-level, captains-cove-help

