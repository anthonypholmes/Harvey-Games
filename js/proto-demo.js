/* PROTOTYPE pretend save, shared by prototype-clubhouse.html and prototype-maths-map.html (?demo=1 or ?demo=new).
 * Both pages use the save key 'meadow-save-proto-demo', so the family's real save (meadow-save-v1) is never read or
 * written, and the Clubhouse and the map show the same pretend child.
 *   demo=1    Sam: 86 bones, a 3-day walk streak; in Meadow Maths every star in Partitioning Park, two levels of the
 *             burrow (this week) and one of the river (played last); in Meadow Words two levels, last month
 *   demo=new  Sam, with nothing played yet
 *   theme=night (or any theme id) dresses the pretend save in that theme; without it, the usual day
 * Each page loads only its own game's worlds, so each game's progress is added the first time one of its pages opens.
 * Load after the engine and the world files. */
const day = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
window.ProtoDemo = {
  KEY: 'meadow-save-proto-demo',
  seed(variant) {
    const M = window.Meadow;
    if (!variant || M.save.key !== this.KEY) return;
    const want = variant === 'new' ? 'new' : 'progress';
    const theme = new URLSearchParams(location.search).get('theme') || 'day';
    const dress = () => { M.save.mutate(s => { s.theme = theme; if (!s.owned.themes.includes(theme)) s.owned.themes.push(theme); }); if (document.body) document.body.dataset.theme = theme; };
    const get = k => { try { return localStorage.getItem(this.KEY + k); } catch (e) { return null; } };
    const put = (k, v) => { try { localStorage.setItem(this.KEY + k, v); } catch (e) {} };
    if (!M.save.load().name || get('-variant') !== want || get('-given') === null) { // (a pretend save from before 22 November's change starts again)
      // a fresh pretend child
      try { localStorage.removeItem(this.KEY); } catch (e) {}
      M.save.load();
      M.save.mutate(s => { s.name = 'Sam'; if (want === 'progress') { s.bones = 86; s.walks.streak = 3; s.walks.last = day(0); [0, 1, 2].forEach(n => { s.walks.days[day(n)] = 1; }); } });
      put('-variant', want); put('-given', '[]');
    }
    // each game's progress is added the first time a page that has its worlds is opened (a page only loads its own game)
    if (want === 'progress') {
      const given = JSON.parse(get('-given') || '[]');
      const PLAN = [['y2-maths-partitioning', 99, true, 20], ['y2-maths-number-bonds', 2, false, 0], ['y2-maths-number-lines', 1, false, 20, 1], ['y2-english-phonics', 2, false, 30]];
      PLAN.forEach(([id, n, all, ago, started]) => {
        const w = M.world(id); if (!w || given.includes(id)) return;
        M.save.mutate(s => {
          w.levels.slice(0, n).forEach((L, i) => { const k = id + '/' + L.id, st = all || i % 2 === 0 ? 3 : 2; s.stars[k] = st; s.starLog.push({ key: k, day: day(ago), from: 0, to: st }); });
          if (started) s.levelStarts.push({ key: id + '/' + w.levels[0].id, day: day(started), via: 'map' }); // played last
        });
        given.push(id);
      });
      put('-given', JSON.stringify(given));
    }
    dress();
  },
};
