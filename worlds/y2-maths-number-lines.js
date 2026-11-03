/*
 * Year 2 Maths, World 2: The Stepping Stone River (number lines to 100).
 * Needs worlds/y2-maths-kit.js first. All the questions are the same as the old Meadow Maths.
 * A number line question says what the line shows (line), where the answer is (target, tol)
 * and how Bonnie moves (snap). ask is one of: place (drag Bonnie to a number), est (estimate on
 * a sparse line), hop (start somewhere, hop), read (Bonnie sits on a "?" tick: pick the number),
 * between (which two tens). make(type, k, easy) gives an easier line when easy is true.
 */
(() => {
'use strict';
const M = window.MeadowMaths;
const { rand, pick, shuffle, near, rd, fmtN, range, pick3, jumpOpts } = M;

function lineQ(o) {
  const dp = o.dp || 0, f = fmtN(dp), target = rd(o.target, dp);
  const labels = o.labels.map(v => rd(v, dp));
  const ref = o.mark ?? target;
  const bench = o.bench ?? labels.filter(v => v !== ref).sort((a, b) => Math.abs(a - ref) - Math.abs(b - ref))[0];
  const q = {
    type: 'nl-' + o.ask, ask: o.ask, kind: ['read', 'jump', 'between'].includes(o.ask) ? 'choice' : 'line',
    mode: null, showVisual: false, eq: null, places: [], boxes: 1,
    line: { min: o.min, max: o.max, step: o.step, labels, majors: (o.majors || []).map(v => rd(v, dp)),
      mark: o.mark ?? null, start: o.start ?? null, dense: !!o.dense, sitAt: o.sitAt ?? o.mark ?? null,
      pawn: o.pawn !== undefined ? o.pawn : o.ask === 'jump' ? null : o.ask === 'read' ? 'sit' : 'drag' },
    target, n: target, answer: [o.answer ?? target], cfmt: o.cfmt, back: !!o.back, tol: o.tol || 0, snap: o.snap || o.step, dp, fmt: f,
    bench: rd(bench, dp), bracket: o.bracket || 0, interval: o.interval || 0, jump: o.jump, hop: o.hop,
    key: `${o.ask}:${o.min}:${o.max}:${target}:${o.start ?? ''}`,
  };
  if (q.kind === 'choice') q.choices = o.choices.map(v => rd(v, dp));
  q.prompt = o.prompt || { read: 'What number is Bonnie sitting on?', jump: 'How big is each jump?' }[o.ask] || `Where does ${f(target)} go?`;
  q.tip = o.ask === 'est' ? 'Make your best guess. Close is good!'
    : q.kind === 'line' ? 'Drag Bonnie along the line. Then tap <b>Check</b>.' : '';
  return q;
}

const NL_LEVELS = [
  { name: 'Full Tick Trails', blurb: 'Find the missing numbers', eg: '0 · 1 · 2 · ? · 4',
    seq: ['read20', 'read50', 'place20', 'read20', 'read50', 'place20', 'read20', 'read50', 'place20'],
    make(type, k, easy) {
      if (type === 'read50' && !easy) { // 0 to 50 counting in 5s, one stone missing
        const t = 5 * rand(1, 9);
        return lineQ({ ask: 'read', min: 0, max: 50, step: 5, labels: range(0, 50, 5).filter(v => v !== t), mark: t, target: t, choices: pick3(t, [t - 5, t + 5, t + 1, t - 1]) });
      }
      const max = easy ? 10 : 20;
      if (type === 'place20') { // every other number labelled; the target sits between two labels
        const t = easy ? pick([1, 3, 5, 7, 9]) : 2 * rand(0, 9) + 1;
        return lineQ({ ask: 'place', min: 0, max, step: 1, labels: range(0, max, 2), target: t, bracket: 2, dense: !easy });
      }
      const t = rand(1, max - 1);
      return lineQ({ ask: 'read', min: 0, max, step: 1, labels: range(0, max, 1).filter(v => v !== t), mark: t, target: t, dense: !easy, choices: pick3(t, [t - 1, t + 1, t + 2, t - 2].filter(v => v >= 0)) });
    } },
  { name: 'Stepping Stones', blurb: 'Count on and back in 2s, 5s and 10s', eg: '10, 15, 20, ?',
    seq: ['fwd', 'back', 'place', 'fwd', 'back', 'place', 'fwd', 'back', 'place'],
    make(type, k, easy) {
      const s = easy ? pick([10, 5]) : pick([2, 5, 10]);
      const span = 10 * s, min = s === 2 ? rand(0, 8) * 10 : s === 5 ? pick([0, 50]) : 0, max = min + span;
      const ends = [min, max];
      if (type === 'place') {
        const t = min + s * rand(3, 9);
        return lineQ({ ask: 'place', min, max, step: s, labels: [...new Set([...ends, min + s, min + 2 * s])], target: t, interval: s, prompt: `Count on in ${s}s. Put Bonnie on ${t}.` });
      }
      const back = type === 'back';
      const r = back ? min + s * rand(3, 10) : min + s * rand(0, 7);   // where the run of 3 shown stones starts
      const run = [r, back ? r - s : r + s, back ? r - 2 * s : r + 2 * s], t = back ? r - 3 * s : r + 3 * s;
      return lineQ({ ask: 'read', min, max, step: s, labels: [...new Set([...ends, ...run])].filter(v => v !== t), mark: t, target: t, interval: s, back,
        prompt: `Count ${back ? 'back' : 'on'} in ${s}s. What number is Bonnie on?`,
        choices: pick3(t, [t + s, t - s, t + 1, t - 1].filter(v => v >= 0 && v <= 100)) });
    } },
  { name: 'Midpoint Explorers', blurb: 'Guess where it goes on 0 to 100', eg: '0 · 50 · 100',
    seq: ['est', 'est', 'est', 'est', 'est', 'est', 'est', 'est', 'est'],
    make(type, k, easy) {
      let t; do t = easy ? rand(0, 9) * 10 + 5 : rand(3, 97); while (t % 10 === 0);
      return lineQ({ ask: 'est', min: 0, max: 100, step: easy ? 10 : 50, labels: [0, 50, 100], target: t, tol: easy ? 3 : 2, snap: 1, bracket: 10, bench: 50 });
    } },
  { name: 'Tens Boundaries', blurb: 'Which two tens is it between?', eg: '30 < 37 < 40',
    seq: ['between', 'between', 'place', 'between', 'place', 'between', 'between', 'place', 'between'],
    make(type, k, easy) {
      let t; do t = rand(11, 99); while (t % 10 === 0 || (easy && t % 10 !== 5));
      const lo = t - t % 10;
      if (type === 'place') return lineQ({ ask: 'place', min: lo, max: lo + 10, step: 1, labels: easy ? [lo, lo + 5, lo + 10] : [lo, lo + 10], majors: [lo + 5], bench: lo + 5, target: t });
      return lineQ({ ask: 'between', min: 0, max: 100, step: 10, labels: range(0, 100, 10), target: t, answer: lo,
        pawn: 'sit', sitAt: t, cfmt: v => `${v} and ${v + 10}`, prompt: `Which two tens is ${t} between?`,
        choices: pick3(lo, [lo - 10, lo + 10, lo + 20].filter(v => v >= 0 && v <= 90)) });
    } },
  { name: 'Froggy Jumps', blurb: 'Jump forward and back to add and take away', eg: '24 + 10 = 34',
    seq: ['f1', 'f10', 'b1', 'f10', 'b10', 'f1', 'b10', 'f10', 'b1'],
    make(type, k, easy) {
      const fwd = type[0] === 'f', tens = type.slice(1) === '10';
      let s, n, land;
      for (;;) {
        n = tens ? (easy ? 10 : pick([10, 10, 20])) : rand(2, easy ? 3 : 9);
        s = rand(11, 89); land = fwd ? s + n : s - n;
        if (land < 1 || land > 99) continue;
        if (easy && !tens && Math.floor(s / 10) !== Math.floor(land / 10)) continue; // easy: no crossing a ten
        break;
      }
      const lo = Math.floor(Math.min(s, land) / 10) * 10, hi = Math.max(lo + 10, Math.ceil(Math.max(s, land) / 10) * 10);
      const dir = fwd ? 'forward' : 'back';
      return lineQ({ ask: 'hop', min: lo, max: hi, step: 1, labels: range(lo, hi, easy ? 5 : 10), majors: range(lo, hi, 5),
        target: land, start: s, hop: { s, k: n, dir }, prompt: `Start at ${s}. Jump ${dir} ${n}.` });
    } },
];
const QUESTS = [
  "Stones are missing from the trail. Fill in the gaps!",
  "Bonnie hops across the river in 2s, 5s and 10s.",
  "Bonnie buried bones all along the riverbank!",
  "Which two big stepping stones is each number between?",
  "Freddie the frog is racing Bonnie. Jump along the line!",
];

/* ---------- Bonnie's help on the number line ---------- */
function lineClue(q) {
  const f = q.fmt, t = q.target, B = q.bench;
  if (q.ask === 'hop') {
    const { s, k, dir } = q.hop, on = dir === 'forward';
    return k % 10 === 0
      ? { say: `${on ? 'Add' : 'Take away'} ${k / 10} ten${k > 10 ? 's' : ''}. Ones stay the same.`, point: 'start' }
      : { say: `Start at ${f(s)}. Count ${on ? 'on' : 'back'} ${k}.`, point: 'start' };
  }
  if (q.ask === 'between') return { say: `Look at the tens next to ${f(t)}.`, point: `tick-${q.answer[0]}` };
  if (q.ask === 'jump') return { say: `Count the jumps from 0 to ${f(q.jump.reach)}.`, point: `tick-${q.jump.reach}` };
  if (q.interval) return q.ask === 'read'
    ? { say: `Count ${q.back ? 'back' : 'on'} in ${f(q.interval)}s.`, point: `tick-${rd(q.back ? t + q.interval : t - q.interval)}` }
    : { say: `Count on in ${f(q.interval)}s to ${f(t)}.`, point: `tick-${rd(q.line.min + q.interval)}` };
  if (q.ask === 'read') return { say: `Count the ticks from ${f(B)}.`, point: `tick-${B}` };
  return { say: `Find ${f(B)} first. ${f(t)} is ${t > B ? 'greater' : 'less'}.`, point: `tick-${B}` };
}

function lineSteps(q, K) {
  const f = q.fmt, t = q.target, L = q.line, st = [];
  const move = { say: `Now move Bonnie to ${f(t)}.`, point: 'pawn', action: K.inTarget, wait: 'Drag Bonnie on the line!' };
  const jumpStep = s => ({ say: 'How big is each jump?', choices: pick3(s, jumpOpts(s)).map(f), answer: f(s) });
  const finalPick = say => ({ say, choices: q.choices.map(f), answer: f(t), final: true });
  if (q.ask === 'jump') {
    const { n, reach } = q.jump;
    if (n > 1) st.push({ say: `How many jumps from 0 to ${f(reach)}?`, point: `tick-${reach}`, choices: near(n).map(String), answer: String(n) });
    st.push(finalPick(n > 1 ? `${n} jumps make ${f(reach)}. Each jump is…` : 'So each jump is…'));
  } else if (q.ask === 'read') {
    if (q.interval) st.push({ ...jumpStep(q.interval), say: `Count ${q.back ? 'back' : 'on'}. How big is each jump?` });
    else st.push({ say: `Is Bonnie’s number bigger than ${f(q.bench)}?`, point: `tick-${q.bench}`, choices: ['Yes', 'No'], answer: t > q.bench ? 'Yes' : 'No', words: true });
    st.push(finalPick('So Bonnie is on…'));
  } else if (q.ask === 'between') {
    const lo = q.answer[0];
    st.push({ say: `How many tens are in ${f(t)}?`, choices: near(lo / 10).map(String), answer: String(lo / 10) });
    st.push({ say: `So ${f(t)} is between…`, choices: q.choices.map(q.cfmt), answer: q.cfmt(lo), words: true, final: true });
  } else if (q.ask === 'hop') {
    const { s, k, dir } = q.hop, on = dir === 'forward', wrongWay = on ? s - k : s + k;
    st.push({ say: `Jump ${dir}. Do the numbers get bigger or smaller?`, point: 'start', choices: ['Bigger', 'Smaller'], answer: on ? 'Bigger' : 'Smaller', words: true });
    st.push({ say: `${f(s)} ${on ? '+' : '−'} ${k} = ?`, choices: pick3(t, [t - 1, t + 1, wrongWay, t + 10, t - 10].filter(v => v >= 0 && v <= 100)).map(f), answer: f(t) });
    st.push(move);
  } else if (q.interval) {
    st.push(jumpStep(q.interval));
    st.push({ ...move, say: `Count on in ${f(q.interval)}s to ${f(t)}.` });
  } else {
    if (q.bench !== t) st.push({ say: `Is ${f(t)} greater or less than ${f(q.bench)}?`, point: `tick-${q.bench}`, choices: ['Greater', 'Less'], answer: t > q.bench ? 'Greater' : 'Less', words: true });
    const u = q.bracket;
    if (u) {
      const lo = rd(L.min + Math.floor(rd((t - L.min) / u, 6)) * u, q.dp);
      if (rd(t - lo, q.dp) !== 0) {
        const lab = x => `${f(x)} and ${f(rd(x + u, q.dp))}`;
        const opts = [lo - u, lo, lo + u].map(x => rd(x, q.dp)).filter(x => x >= L.min - 1e-9 && x + u <= L.max + 1e-9);
        st.push({ say: u === 10 ? 'Which two tens is it between?' : 'Which two numbers is it between?', choices: opts.map(lab), answer: lab(lo), words: true, fill: { zone: [lo, rd(lo + u, q.dp)] } });
      }
    }
    st.push(move);
  }
  return st;
}

Meadow.registerWorld(M.world({
  id: 'y2-maths-number-lines', name: 'The Stepping Stone River', tag: 'Number lines', icon: '🐸', color: '#2F8FB0', tint: '#DCEEF7',
  intro: 'A <b>number line</b> puts numbers in order. Drag Bonnie to the right spot, then tap Check.',
  ids: ['full-tick-trails', 'stepping-stones', 'midpoint-explorers', 'tens-boundaries', 'froggy-jumps'],
  levels: NL_LEVELS.map((L, i) => ({ ...L, quest: QUESTS[i] })),
  clue: q => lineClue(q), steps: (q, K) => lineSteps(q, K),
}));
})();
