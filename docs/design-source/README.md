# Design source (Meadow Trail redesign)

The scripts that drew the design-sheet canvas, kept so the drawings can be reused when the redesign is built. They are reference material, not part of the game.

- `kit.mjs`: the drawing kit (trees, bushes, flowers, fences, paths, rivers, rocks, Bonnie's speech bubble, name boards). Everything sorts by its foot so things overlap naturally.
- `scenes.mjs`: `mathsRoute()` (the Meadow Maths route, already ported into the prototype as `js/proto-map-art.js`) and `hub()` (the Clubhouse meadow: the clubhouse, Walk arch, shop stall, and the Maths and Words gates). `hub()` is the next one to port.
- `mocks.mjs`: the iPhone and iPad mock-ups and the "trail or meadow" comparison on the canvas.
- `sheet1-art.mjs`: the first design sheet (level stepping stones, wooden tags, drawn icons, journal stamps). The stones and stamps are for the level-map and journal phases.
- `bonnie.svg`, `croak.svg`: copies of the game's own drawings, taken from the game code, used by the scripts. In the game, use `Meadow.ui.bonnieSVG()` and the Cove world's `host.svg()` instead.

Try one: `node -e "import('./docs/design-source/scenes.mjs').then(m => console.log(m.hub().render().length))"`
