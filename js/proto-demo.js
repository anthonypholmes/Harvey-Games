/* PROTOTYPE pretend save, shared by prototype-clubhouse.html and prototype-maths-map.html (?demo=1 or ?demo=new).
 * Both pages use the save key 'meadow-save-proto-demo', so the family's real save (meadow-save-v1) is never read or
 * written, and the Clubhouse and the map show the same pretend child.
 *   demo=1    Sam: 86 bones, a 3-day walk streak; in Meadow Maths every star in Partitioning Park, two levels of the
 *             burrow (this week) and one of the river (played last); in Meadow Words two levels, last month
 *   demo=new  Sam, with nothing played yet
 *   demo=mid  Sam part-way: three levels of Partitioning Park (level 3 played last), two of Phonics Forest
 *   demo=later  Sam further on: seven of Partitioning Park's eight levels, four of Phonics Forest's five, and more
 *   theme=night (or any theme id) dresses the pretend save in that theme; without it, the usual day
 * Each page loads only its own game's worlds, so each game's progress is added the first time one of its pages opens.
 * Load after the engine and the world files. */
const day = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
window.ProtoDemo = {
  KEY: 'meadow-save-proto-demo',
  seed(variant) {
    const M = window.Meadow;
    if (!variant || M.save.key !== this.KEY) return;
    const want = variant === 'new' ? 'new' : variant === 'mid' || variant === 'later' ? variant : 'progress';
    const theme = new URLSearchParams(location.search).get('theme') || 'day';
    const dress = () => { M.save.mutate(s => { s.theme = theme; if (!s.owned.themes.includes(theme)) s.owned.themes.push(theme); }); if (document.body) document.body.dataset.theme = theme; };
    const get = k => { try { return localStorage.getItem(this.KEY + k); } catch (e) { return null; } };
    const put = (k, v) => { try { localStorage.setItem(this.KEY + k, v); } catch (e) {} };
    if (!M.save.load().name || get('-variant') !== want || get('-given') === null || get('-v') !== '2') { // (an older pretend save starts again: -v 2 has the Bone Shop things)
      // a fresh pretend child
      try { localStorage.removeItem(this.KEY); } catch (e) {}
      M.save.load();
      M.save.mutate(s => { s.name = 'Sam'; if (want !== 'new') { s.bones = 86; s.walks.streak = 3; s.walks.last = day(0); [0, 1, 2].forEach(n => { s.walks.days[day(n)] = 1; }); }
        // the Bone Shop: part-way, a red collar on; further on, more bones and a few things bought
        if (want === 'mid') { s.owned.hats.push('collar-red'); s.neck = 'collar-red'; }
        if (want === 'later') { s.bones = 240; s.owned.hats.push('collar-red', 'sunglasses', 'party', 'bobble'); s.hat = 'party'; s.face = 'sunglasses'; s.neck = 'collar-red';
          s.owned.coats.push('golden'); s.owned.themes.push('sunset'); s.redeemed.push({ title: 'Choose the after-school snack', cost: 30, when: '15/11/2026' }); }
      });
      put('-variant', want); put('-given', '[]'); put('-v', '2');
    }
    // each game's progress is added the first time a page that has its worlds is opened (a page only loads its own game)
    if (want !== 'new') {
      const given = JSON.parse(get('-given') || '[]');
      // [world, stars for each level played, how many days ago, the level played last (1, 2, ...)]
      const PLANS = {
        progress: [['y2-maths-partitioning', [3, 3, 3, 3, 3, 3, 3, 3], 20], ['y2-maths-number-bonds', [3, 2], 0], ['y2-maths-number-lines', [3], 20, 1], ['y2-english-phonics', [3, 2], 30]],
        mid: [['y2-maths-partitioning', [3, 2, 2], 1, 3], ['y2-english-phonics', [3, 2], 1, 2]],
        later: [['y2-maths-partitioning', [3, 3, 2, 3, 1, 3, 2], 1, 7], ['y2-maths-number-bonds', [3, 3, 2, 3, 3], 3], ['y2-maths-number-lines', [3, 2], 2],
          ['y2-english-phonics', [3, 2, 3, 3], 1, 4], ['y2-english-tricky-words', [3, 3], 2]],
      };
      PLANS[want].forEach(([id, stars, ago, last]) => {
        const w = M.world(id); if (!w || given.includes(id)) return;
        M.save.mutate(s => {
          w.levels.slice(0, stars.length).forEach((L, i) => { const k = id + '/' + L.id; s.stars[k] = stars[i]; s.starLog.push({ key: k, day: day(ago), from: 0, to: stars[i] }); });
          if (last) s.levelStarts.push({ key: id + '/' + w.levels[last - 1].id, day: day(1), via: 'map' }); // played last
        });
        given.push(id);
      });
      put('-given', JSON.stringify(given));
    }
    dress();
  },
};
