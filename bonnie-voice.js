/* Bonnie's voice — shared by the Clubhouse and Meadow Words.
 *
 * BonnieVoice.say(text, opts) plays recorded ElevenLabs clips (made by tools/make-voice.mjs and
 * listed in audio/manifest.json) when every piece of the line has a clip. Otherwise, on the website, it uses
 * the device's own British voice; in the App Store app it says nothing (Bonnie only has her recorded voice there). BonnieVoice.whenQuiet(fn) runs fn once Bonnie has finished talking,
 * so a game can wait for her instead of cutting her off.
 *
 * Other speakers (like Captain Croak in Captain's Cove) have their own clips in audio/<who>.json:
 * say(text, { who: 'captain' }). With no clip their line uses the device voice at opts.pitch.
 *
 * Each page sets the hooks: getName (the child's name), getAudio (its unlocked AudioContext),
 * enabled (sound on/off) and getRate (device voice speed). tools/make-voice.mjs runs this same file,
 * so the way lines are cut into pieces always matches the clips.
 */
(function () {
  const V = window.BonnieVoice = {
    getName: () => '',
    getAudio: () => null,
    enabled: () => true,
    getRate: () => .9,
    base: '',            // folder that holds audio/ ('../' for pages in a subfolder such as tests/)
    pack: null,          // audio/manifest.json once loaded
    others: ['captain'], // other speakers with their own audio/<who>.json
    packs: {},           // their lists once loaded
    device: null,        // the chosen device voice
    missing: new Set(),  // pieces with no clip (for checking a voice pack)
    why: '',             // why the last line used the device voice (shown in the console, for fixing the app)
  };
  const AUDIO_CACHE = 'meadow-club-audio-v1'; // must match sw.js
  const hasSpeech = () => typeof speechSynthesis !== 'undefined';
  const inApp = () => typeof window !== 'undefined' && !!window.MEADOW_IN_APP; // the App Store app (Capacitor)
  let token = 0, nodes = [], speaking = false, waiters = [], safety = null, utter = null, pending = null;
  if (typeof document !== 'undefined') document.addEventListener('pointerdown', () => {
    const p = pending; pending = null; V.getAudio(); // unlocks sound
    if (p) setTimeout(() => V.say(p[0], p[1]), 0);   // a tap that makes Bonnie speak will talk over this, which is fine
  }, { capture: true, once: true });
  if (typeof document !== 'undefined') {
    const unlock = () => {
      const a = V.getAudio();
      if (a && a.state === 'running') { ['touchend', 'click'].forEach(e => document.removeEventListener(e, unlock, true)); return; }
      if (a && a.resume) a.resume().catch(() => {});
    };
    ['touchend', 'click'].forEach(e => document.addEventListener(e, unlock, true));
  }
  const bufs = new Map(); // file -> decoded AudioBuffer (small, most-recent-first cache)

  /* ---------- device voice ---------- */
  function pickVoice() {
    const vs = speechSynthesis.getVoices(), gb = vs.filter(v => /en[-_]GB/i.test(v.lang));
    V.device = gb.find(v => /Serena|Kate|Martha|Stephanie|Libby|Sonia|Female|Google UK English Female/i.test(v.name))
      || gb[0] || vs.find(v => /^en/i.test(v.lang)) || null;
  }
  if (hasSpeech()) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

  /* ---------- cutting lines into pieces ---------- */
  V.cleanPiece = s => String(s).replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}️‍]/gu, '')
    .replace(/\s+/g, ' ').replace(/^[\s.,;:!?…—–-]+/, '').replace(/(\.\.\.|…|\s)+$/, '')
    .replace(/([.!?])[.!?]+$/, m => m[m.length - 1]).trim();
  V.hasWords = s => /[\p{L}\p{N}]/u.test(s);
  V.pieceKey = s => { // FNV-1a 32-bit hash of the cleaned piece
    let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, '0');
  };
  const isL = c => !!c && /\p{L}/u.test(c);
  /* Where the name appears as a whole word: [index, ...] */
  const nameAt = (text, name) => {
    const low = text.toLowerCase(), nm = String(name || '').toLowerCase(), at = [];
    if (nm) for (let i = low.indexOf(nm); i >= 0; i = low.indexOf(nm, i + 1)) {
      if ((at.length && i < at[at.length - 1] + nm.length) || isL(text[i - 1]) || isL(text[i + nm.length])) continue;
      at.push(i);
    }
    return at;
  };
  /* ---------- a line without the child's name ----------
     Bonnie only says a name she has a recording of. For any other name she says the same line without it:
     "Well done, {N}!" -> "Well done!", "Hi {N}!" -> "Hi!", "{N}, look at this!" -> "Look at this!". Each of
     these is recorded as its own clip (tools/make-voice.mjs), so the line is still in her own voice.
     NAME_FREE is for a line the rules would leave sounding odd: the sentence with {N} -> what to say instead.
     dropName() answers null when the name can't be taken out neatly (the name is part of what the sentence says). */
  V.NAME_FREE = {};
  V.dropName = tmpl => {
    const t = String(tmpl), fixed = V.NAME_FREE[t.trim()];
    if (fixed != null) return fixed;
    if (!t.includes('{N}')) return t;
    const s = t
      .replace(/,\s*\{N\}\s*,/g, ',')                // "Which one, {N}, and why?"
      .replace(/,?\s*\{N\}(?=\s*[!?.…])/g, '')       // "Well done, {N}!"  "Hi {N}!"  "Thank you {N}!"
      .replace(/\s+\{N\}\s*,/g, ',')                 // "Come on {N}, five quick questions!"
      .replace(/(^|[.!?…]\s+)\{N\}\s*,\s*(\p{L})/gu, (m, a, c) => a + c.toUpperCase()); // "{N}, look at this!"
    return s.includes('{N}') ? null : s;
  };
  V.canSay = name => !!(name && V.pack && V.pack.names && V.pack.names[String(name).trim().toLowerCase()]);
  const cutInto = (out, chunk, base) => { let pos = 0;
    chunk.replace(/(\.\.\.|…|[.!?]+["'”’)]*)(\s+|$)/g, '$1$2\u0001').split('\u0001').forEach(raw => {
      if (raw) out.push({ raw, start: base + pos, name: false }); pos += raw.length; }); };
  /* Sentences and "..." pauses, without splitting out the name. [{raw, start}] */
  V.sentences = text => { const out = []; cutInto(out, text, 0); return out; };
  /* A sentence with the name swapped for {N} (used to find whole-sentence recordings of a name). */
  V.template = (clean, name) => { let s = clean; nameAt(clean, name).reverse().forEach(i => { s = s.slice(0, i) + '{N}' + s.slice(i + String(name).length); }); return s; };
  /* Pieces: sentences, "..." pauses and the child's name. [{raw, start, name}]; raw keeps spacing so offsets add up.
     (The story characters in the questions, Sarah, Jack and so on, are ordinary words here: a sentence about
     them is recorded with the name in it.) */
  V.pieces = (text, name = V.getName()) => {
    const out = [], nm = String(name || '');
    let from = 0;
    for (const i of nameAt(text, nm)) { cutInto(out, text.slice(from, i), from); out.push({ raw: text.slice(i, i + nm.length), start: i, name: true }); from = i + nm.length; }
    cutInto(out, text.slice(from), from);
    return out;
  };
  /* ---------- numbers ----------
     A sentence with numbers in it ("What goes with 4 to make 6?") comes in thousands of versions, so it is not
     recorded whole. It is cut at each number and maths sign: the words in between are ordinary clips, the signs
     are clips of their words ("plus"), and each number is its own clip from pack.numbers. */
  V.SIGNS = { '+': 'plus', '=': 'equals', '×': 'times', '÷': 'divided by', '−': 'take away', '?': 'what?' };
  /* [{raw, start, kind: 'word' | 'num' | 'sign', n, plural, say}]; raw keeps spacing so offsets add up.
     null if a number is in a shape there are no clips for (2.5, 1st, 007). */
  V.numberParts = text => {
    const out = [], re = /(\d+)(s(?![\p{L}\p{N}]))?|[+=×÷−]|(?<=\s)\?(?=\s|$)/gu;
    let from = 0, m;
    const word = to => { if (to > from) out.push({ raw: text.slice(from, to), start: from, kind: 'word' }); };
    while ((m = re.exec(text))) {
      const end = m.index + m[0].length;
      if (m[1]) {
        const before = text[m.index - 1], after = text[end];
        if (isL(before) || isL(after) || (m[1].length > 1 && m[1][0] === '0') || /[.,]\d/.test(text.slice(end, end + 2)) || /\d[.,]$/.test(text.slice(0, m.index))) return null;
        word(m.index); out.push({ raw: m[0], start: m.index, kind: 'num', n: +m[1], plural: !!m[2] });
      } else { word(m.index); out.push({ raw: m[0], start: m.index, kind: 'sign', say: V.SIGNS[m[0]] }); }
      from = end;
    }
    word(text.length);
    return out;
  };
  /* The clip or clips for a number: its own recording, or (1001 to 9999) "two thousand" + ["and"] + the rest. */
  V.numberFiles = (pack, n, plural) => {
    const N = pack && pack.numbers; if (!N) return null;
    if (plural) return N[n + 's'] ? [N[n + 's']] : null;
    if (N[n]) return [N[n]];
    if (n > 1000 && n < 10000) {
      const th = N[Math.floor(n / 1000) * 1000], r = n % 1000, and = pack.clips[V.pieceKey('and')];
      if (!th || !N[r]) return null;
      return r >= 100 ? [th, N[r]] : and ? [th, and, N[r]] : null;
    }
    return null;
  };
  const pauseAfter = raw => /(\.\.\.|…)\s*$/.test(raw) ? .4 : /[.!?]["'”’)]*\s*$/.test(raw) ? .25 : /[,;:—–]\s*$/.test(raw) ? .12 : .04;
  function plan(text, who) {
    const pack = who ? V.packs[who] : V.pack, a = pack && V.getAudio();
    if (!pack) { V.why = 'clip list not loaded'; return null; }
    if (!a) { V.why = 'no audio'; return null; }
    if (a.state !== 'running' && !inApp() && !(navigator.userActivation && navigator.userActivation.hasBeenActive)) { V.why = 'not tapped yet (' + a.state + ')'; return null; }
    const out = [], name = who ? '' : String(V.getName() || ''), names = pack.names || {};
    const sayable = !!(name && names[name.toLowerCase()]), whole = sayable && V.pack.whole && V.pack.whole[name.toLowerCase()];
    /* The clips for one sentence, or null. `nm` is the child's name to join in ('' for none). */
    const clipsFor = (raw, start, nm) => {
      const got = [];
      for (const p of V.pieces(raw, nm).map(p => ({ ...p, start: p.start + start }))) {
        const clean = V.cleanPiece(p.raw);
        if (!V.hasWords(clean)) { const last = got[got.length - 1] || out[out.length - 1]; if (last) last.pause = Math.max(last.pause, pauseAfter(p.raw)); continue; }
        const file = p.name ? names[clean.toLowerCase()] : pack.clips[V.pieceKey(clean)];
        if (!file && !p.name && /\d/.test(clean) && pack.numbers) { // no recording of the whole piece: join it up from words and numbers
          const bits = numberPlan(pack, p);
          if (bits) { got.push(...bits); continue; }
          return null;
        }
        if (!file) { miss = (who ? who + ': ' : '') + clean; return null; }
        got.push({ ...p, file: V.base + 'audio/' + file, pause: pauseAfter(p.raw) });
      }
      return got;
    };
    let miss = '';
    for (const s of V.sentences(text)) {
      const has = !!name && nameAt(s.raw, name).length > 0;
      let got = null;
      if (has && sayable) {
        // A sentence with the name in it may be recorded whole for this name (sounds most natural)
        const f = whole && whole[V.pieceKey(V.template(V.cleanPiece(s.raw), name))];
        got = f ? [{ raw: s.raw, start: s.start, name: false, file: V.base + 'audio/' + f, pause: pauseAfter(s.raw) }] : clipsFor(s.raw, s.start, name);
      }
      // No name in it, or the "name" is an ordinary word here (a child called Rose reading about a rose)
      if (!got) got = clipsFor(s.raw, s.start, '');
      // The child's name has no recording: say the sentence without it
      if (!got && has && !sayable) {
        const free = V.dropName(V.template(s.raw, name));
        if (free != null) got = V.hasWords(free) ? (clipsFor(free, s.start, '') || []).map(x => ({ ...x, start: s.start })) : [];
        if (got && !got.length && V.hasWords(free || '')) got = null;
      }
      if (!got) { if (miss) V.missing.add(miss); V.why = 'no clip for "' + (miss || V.cleanPiece(s.raw)) + '"'; return null; }
      out.push(...got);
    }
    return out.length ? out : null;
  }
  function numberPlan(pack, p) {
    const parts = V.numberParts(p.raw), out = []; if (!parts) return null;
    const miss = what => { V.missing.add(what); V.why = 'no clip for "' + what + '"'; return null; };
    for (const x of parts) {
      const at = { raw: x.raw, start: p.start + x.start, name: false }, add = (file, pause) => out.push({ ...at, file: V.base + 'audio/' + file, pause });
      if (x.kind === 'num') {
        const files = V.numberFiles(pack, x.n, x.plural); if (!files) return miss(x.raw);
        files.forEach((f, i) => add(f, i < files.length - 1 ? 0 : .04));
        continue;
      }
      const clean = x.kind === 'sign' ? x.say : V.cleanPiece(x.raw);
      if (x.kind === 'word' && !V.hasWords(clean)) { if (out.length) out[out.length - 1].pause = Math.max(out[out.length - 1].pause, pauseAfter(x.raw)); continue; }
      const file = pack.clips[V.pieceKey(clean)]; if (!file) return miss(clean);
      add(file, x.kind === 'sign' ? .04 : pauseAfter(x.raw));
    }
    return out.length ? out : null;
  }
  V.hasClips = (text, who) => !!plan(String(text), who);

  /* ---------- speaking ---------- */
  function cut() { // stop whatever is playing (waiters stay for the next line)
    token++; clearTimeout(safety); speaking = false;
    nodes.forEach(n => { try { n.stop(); } catch (e) {} }); nodes = [];
    if (hasSpeech()) speechSynthesis.cancel();
  }
  function finished(t, onend) { // a line ended by itself
    if (t !== token) return;
    token++; // so a second "ended" signal for this line is ignored
    clearTimeout(safety); speaking = false; nodes = [];
    onend && onend();
    flush();
  }
  // Run waiting jobs one at a time; if one makes Bonnie speak, the rest wait for that line too.
  function flush() { while (!speaking && waiters.length) waiters.shift()(); }
  V.hush = () => { cut(); waiters = []; };
  /* When the iPad is locked, its cover is shut or the app is put away, everything stops at once and nothing new
     starts until the game is on screen again. (Found on 14 November 2026: a line that came due just after the
     iPad was locked could not start its recording, so it fell back to the device voice, which carried on
     talking through the locked iPad.) Jobs that were waiting for Bonnie to finish still run, silently. */
  const away = () => typeof document !== 'undefined' && (document.hidden || document.visibilityState === 'hidden');
  V.sleep = () => { pending = null; cut(); flush(); };
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => { if (away()) V.sleep(); });
    window.addEventListener('pagehide', V.sleep);
  }
  V.isSpeaking = () => speaking;
  /* Run fn when Bonnie is quiet (now, if she isn't talking). */
  V.whenQuiet = fn => { if (speaking) waiters.push(fn); else setTimeout(fn, 0); };

  V.say = (text, opts = {}) => {
    cut();
    text = String(text);
    if (away()) { setTimeout(() => { opts.onend && opts.onend(); }, 0); return null; } // locked or put away: say nothing
    // A page that talks as soon as it opens (Bonnie's Walk) can beat the clip list: wait for it (up to 2.5s)
    // so the first line is Bonnie's recorded voice too, not the device voice.
    if (!V.pack && V.loading && !opts.afterLoad && V.enabled()) {
      const t = token; speaking = true;
      const go = () => { if (t === token) { speaking = false; V.say(text, { ...opts, afterLoad: true }); } };
      Promise.race([V.loading, new Promise(r => setTimeout(r, 2500))]).then(go, go);
      return null;
    }
    // Browsers keep a new page silent until it's tapped: remember the line and say it on the first tap.
    pending = navigator.userActivation && !navigator.userActivation.hasBeenActive ? [text, opts] : null;
    const t = token;
    if (!V.enabled()) { setTimeout(() => { opts.onend && opts.onend(); }, 0); return null; }
    speaking = true;
    // never wait forever if a voice forgets to say it has finished
    safety = setTimeout(() => finished(t, opts.onend), 2500 + text.length * 110 / Math.min(1, opts.rate || V.getRate()));
    const p = plan(text, opts.who);
    if (p) { playClips(p, opts, t); return { clip: true }; }
    return deviceOrQuiet(V.why, text, opts, t);
  };
  /* A line with no recording. On the website the device's own voice reads it. In the App Store app Bonnie only ever
     has her recorded voice: the line stays on screen and she says nothing, because a different, robotic voice
     is worse than a quiet moment (and every line in the game has a recording: see tests/voice-name-test.html). */
  function deviceOrQuiet(why, text, opts, t) {
    if (!inApp()) return speakDevice(text, opts, t);
    V.why = why; if (typeof console !== 'undefined') console.warn('[Bonnie] no recording, so nothing said: ' + why + ' | ' + String(text).slice(0, 60));
    setTimeout(() => finished(t, opts.onend), Math.min(2500, 600 + text.length * 30)); // about as long as reading it would take
    return null;
  }
  function speakDevice(text, opts, t) {
    if (!hasSpeech()) { setTimeout(() => finished(t, opts.onend), 300); return null; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB'; if (V.device) u.voice = V.device;
    u.rate = opts.rate || V.getRate(); u.pitch = opts.pitch || 1.1;
    if (opts.onboundary) u.onboundary = opts.onboundary;
    u.onend = u.onerror = () => finished(t, opts.onend);
    utter = u; // keep a reference (Chrome can drop it otherwise)
    speechSynthesis.speak(u);
    return u;
  }
  async function clipBuffer(file) {
    if (bufs.has(file)) { const b = bufs.get(file); bufs.delete(file); bufs.set(file, b); return b; }
    // In the app, Capacitor serves sound files with no status code (it reads as 0) even though the file arrives fine.
    const res = await fetch(file); if (!res.ok && !(inApp() && res.status === 0)) throw new Error('clip ' + res.status);
    const data = await res.arrayBuffer(), a = V.getAudio();
    if (!data.byteLength) throw new Error('clip empty');
    const buf = await new Promise((ok, bad) => { const pr = a.decodeAudioData(data, ok, bad); if (pr && pr.then) pr.then(ok, bad); });
    const clip = trim(buf);
    bufs.set(file, clip); if (bufs.size > 80) bufs.delete(bufs.keys().next().value);
    return clip;
  }
  /* Skip the quiet bit at each end of a recording, so pieces join up without gaps. */
  function trim(buf) {
    const d = buf.getChannelData(0), n = d.length; let peak = 0;
    for (let i = 0; i < n; i += 4) peak = Math.max(peak, Math.abs(d[i]));
    const th = Math.max(.003, peak * .04);
    let a = 0, b = n - 1;
    while (a < n && Math.abs(d[a]) < th) a++;
    while (b > a && Math.abs(d[b]) < th) b--;
    const r = buf.sampleRate, from = Math.max(0, a / r - .02), to = Math.min(buf.duration, b / r + .04);
    return to - from > Math.max(.12, buf.duration * .25) ? { buf, from, dur: to - from } : { buf, from: 0, dur: buf.duration };
  }
  async function playClips(p, opts, t) {
    let list;
    try { list = await Promise.all(p.map(x => clipBuffer(x.file))); }
    catch (e) { if (t === token) deviceOrQuiet('clip failed to load or decode: ' + (e && (e.message || e.name) || e), p.map(x => x.raw).join(''), opts, t); return; }
    if (t !== token) return;
    if (away()) { finished(t, opts.onend); return; } // locked while the recordings were loading
    const ctx = V.getAudio();
    if (ctx.state !== 'running') {
      try { await Promise.race([ctx.resume(), new Promise(r => setTimeout(r, 400))]); } catch (e) {}
      if (t !== token) return;
      if (ctx.state !== 'running') { deviceOrQuiet('sound would not start (' + ctx.state + ')', p.map(x => x.raw).join(''), opts, t); return; }
    }
    const a = ctx, slow = (opts.rate || 1) < .8 ? 1.6 : 1;
    let at = a.currentTime + .04;
    p.forEach((x, k) => {
      const c = list[k], src = a.createBufferSource(); src.buffer = c.buf; src.connect(a.destination); src.start(at, c.from, c.dur); nodes.push(src);
      if (opts.onboundary) { // spread word highlights across the clip (story read-along)
        const len = x.raw.length || 1, d = c.dur;
        [...x.raw.matchAll(/\S+/g)].forEach(m => setTimeout(() => {
          if (t === token) opts.onboundary({ name: 'word', charIndex: x.start + m.index });
        }, Math.max(0, (at - a.currentTime + d * m.index / len) * 1000)));
      }
      at += c.dur + x.pause * slow;
    });
    clearTimeout(safety);
    safety = setTimeout(() => finished(t, opts.onend), (at - a.currentTime) * 1000 + 3000);
    setTimeout(() => finished(t, opts.onend), (at - a.currentTime) * 1000);
  }

  /* ---------- loading the clips ---------- */
  V.load = () => (V.loading = loadPacks());
  V.plan = plan; // for tests/voice-name-test.html
  async function loadPacks() {
    try {
      const res = await fetch(V.base + 'audio/manifest.json', { cache: 'no-cache' }); if (!res.ok) return;
      const m = await res.json(); if (!m || !m.clips) return;
      V.pack = m;
      setTimeout(saveForOffline, 4000);
    } catch (e) {}
    await Promise.all(V.others.map(async who => {
      try {
        const res = await fetch(V.base + 'audio/' + who + '.json', { cache: 'no-cache' }); if (!res.ok) return;
        const m = await res.json(); if (m && m.clips) V.packs[who] = m;
      } catch (e) {}
    }));
  }
  /* Save every clip into the offline cache in the background, a few at a time. */
  async function saveForOffline() {
    if (inApp()) return; // the App Store app already has every clip on the iPad
    if (!V.pack || typeof caches === 'undefined' || navigator.onLine === false) return;
    try {
      const cache = await caches.open(AUDIO_CACHE);
      const files = [...new Set([...Object.values(V.pack.clips), ...Object.values(V.pack.names || {}), ...Object.values(V.pack.numbers || {}), ...Object.values(V.pack.whole || {}).flatMap(Object.values),
        ...Object.values(V.packs).flatMap(pk => Object.values(pk.clips))])].map(f => V.base + 'audio/' + f);
      let k = 0;
      const worker = async () => { while (k < files.length) { const f = files[k++];
        try { if (!(await cache.match(f))) { const r = await fetch(f); if (r.ok) await cache.put(f, r); } } catch (e) {} } };
      await Promise.all([worker(), worker(), worker(), worker()]);
    } catch (e) {}
  }
})();
