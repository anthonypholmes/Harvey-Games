/* The prototype-*.html pages: each loads a real game page as it is (index.html, meadow-maths.html, meadow-words.html
 * or bonnies-walk.html, which carry the meadow look themselves) with test helpers around it. Not in the app.
 *   ?demo=new|1|mid|later  a pretend child (js/proto-demo.js) in a save of its own: the family's save is never touched
 *   ?taster=1              the App Store app's free taster (padlocks after level 1), as if inside the app
 *   ?dig=1|0               Bonnie's Walk: the surprise dig on this walk, or none (for screenshots and checks)
 *   ?view=old              the old look (js/meadow-look.js)
 * Everything else (?selftest=1, ?leveltest=1, ?shoptest=1, ?journaltest=1, ?walktest=1, …) is read by the scripts.
 */
window.ProtoPage = {
  async load(file) {
    const Q = new URLSearchParams(location.search), demo = ['new', '1', 'mid', 'later'].includes(Q.get('demo')) ? Q.get('demo') : '';
    const v = '?v=' + Date.now(); // the meadow-look scripts fetched fresh, so a phone or iPad never shows an old copy
    let html = await (await fetch(file, { cache: 'no-store' })).text();
    html = html.replace("navigator.serviceWorker.register('sw.js')", 'Promise.resolve()')
               .replace(/src="js\/(proto-[a-z-]+|meadow-look)\.js"/g, `src="js/$1.js${v}"`);
    // the engine's own home link goes to the Clubhouse prototype, with the same child and theme
    const carry = ['demo', 'theme'].filter(k => Q.get(k)).map(k => `${k}=${encodeURIComponent(Q.get(k))}`).join('&');
    if (Q.get('view') !== 'old') html = html.replace(/homeHref: 'index\.html'/, () => `homeHref: ${JSON.stringify('prototype-clubhouse.html' + (carry ? '?' + carry : ''))}`);
    if (Q.get('taster') === '1') html = html.replace('<script src="js/app-storage.js"></script>',
      `<script>window.MEADOW_IN_APP = true; try { localStorage.removeItem('meadow-full-game'); } catch (e) {}<\/script>$&`);
    if (demo) {
      // the engine is loaded with its save keys changed (only here, never in the file), then the pretend child is set up
      const core = (await (await fetch('js/meadow-core.js', { cache: 'no-store' })).text())
        .replace("const DEFAULT_KEY = 'meadow-save-v1';", "const DEFAULT_KEY = 'meadow-save-proto-demo';")
        .replace("const PLAYERS_KEY = 'meadow-players'", "const PLAYERS_KEY = 'meadow-players-proto-demo'");
      if (!core.includes("'meadow-save-proto-demo'") || !core.includes("'meadow-players-proto-demo'")) throw new Error('could not set the pretend save');
      html = html.replace('<script src="js/meadow-core.js"></script>', () => `<script>${core.replace(/<\/script/gi, '<\\/script')}<\/script>`)
                 .replace(/<script src="worlds\/y2-[a-z-]+\.js"><\/script>(?![\s\S]*<script src="worlds\/)/, `$&<script src="js/proto-demo.js${v}"><\/script><script>ProtoDemo.seed('${demo}');Meadow.save.load();<\/script>`);
      if (!html.includes('ProtoDemo.seed')) throw new Error('could not add the pretend child');
    }
    if (Q.get('dig')) html = html.replace('<script>\nMeadow.startGame(', `<script>Meadow.walk.dig.chance = ${Q.get('dig') === '0' ? 0 : 1};<\/script>$&`);
    document.open(); document.write(html); document.close();
  },
};
