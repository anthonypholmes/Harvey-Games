/* PROTOTYPE pretend save, shared by prototype-clubhouse.html and prototype-maths-map.html (?demo=1 or ?demo=new).
 * Both pages use the save key 'meadow-save-proto-demo', so the family's real save (meadow-save-v1) is never read or
 * written, and the Clubhouse and the map show the same pretend child.
 *   demo=1    Sam: 86 bones, a 3-day walk streak; in Meadow Maths every star in Partitioning Park, two levels of the
 *             burrow (this week) and one of the river (played last); in Meadow Words two levels, last month
 *   demo=new  Sam, with nothing played yet
 *   theme=night (or any theme id) dresses the pretend save in that theme; without it, the usual day
 * Load after the engine and the world files. */
window.ProtoDemo = {
  KEY: 'meadow-save-proto-demo',
  seed(variant) {
    const M = window.Meadow;
    if (!variant || M.save.key !== this.KEY) return;
    const want = variant === 'new' ? 'new' : 'progress';
    const theme = new URLSearchParams(location.search).get('theme') || 'day';
    const dress = () => M.save.mutate(s => { s.theme = theme; if (!s.owned.themes.includes(theme)) s.owned.themes.push(theme); });
    if (M.save.load().name && localStorage.getItem(this.KEY + '-variant') === want) { dress(); return; } // already set up
    try { localStorage.removeItem(this.KEY); } catch (e) {}
    M.save.load();
    const today = new Date(), day = n => { const d = new Date(today); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
    M.save.mutate(s => {
      s.name = 'Sam';
      if (want === 'new') return;
      s.bones = 86;
      const give = (id, n, all, when) => {
        const w = M.world(id); if (!w) return;
        w.levels.slice(0, n).forEach((L, i) => { const k = id + '/' + L.id, st = all || i % 2 === 0 ? 3 : 2; s.stars[k] = st; s.starLog.push({ key: k, day: when, from: 0, to: st }); });
      };
      give('y2-maths-partitioning', 99, true, day(20));
      give('y2-maths-number-bonds', 2, false, day(0));
      give('y2-maths-number-lines', 1, false, day(20));
      give('y2-english-phonics', 2, false, day(30));
      s.levelStarts.push({ key: 'y2-maths-number-lines/' + M.world('y2-maths-number-lines').levels[0].id, day: day(1), via: 'map' });
      s.walks.streak = 3; s.walks.last = day(0); [0, 1, 2].forEach(n => { s.walks.days[day(n)] = 1; });
    });
    dress();
    try { localStorage.setItem(this.KEY + '-variant', want); } catch (e) {}
  },
};
