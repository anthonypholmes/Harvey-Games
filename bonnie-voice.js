/* Bonnie's voice — shared by the Clubhouse and Meadow Words.
 *
 * BonnieVoice.say(text, opts) plays recorded ElevenLabs clips (made by tools/make-voice.mjs and
 * listed in audio/manifest.json) when every piece of the line has a clip, and otherwise uses the
 * device's own British voice. BonnieVoice.whenQuiet(fn) runs fn once Bonnie has finished talking,
 * so a game can wait for her instead of cutting her off.
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
    base: '',            // folder that holds audio/ ('../' for pages in a subfolder such as beta/)
    pack: null,          // audio/manifest.json once loaded
    device: null,        // the chosen device voice
    missing: new Set(),  // pieces with no clip (for checking a voice pack)
  };
  const AUDIO_CACHE = 'meadow-club-audio-v1'; // must match sw.js
  const hasSpeech = () => typeof speechSynthesis !== 'undefined';
  let token = 0, nodes = [], speaking = false, waiters = [], safety = null, utter = null, pending = null;
  if (typeof document !== 'undefined') document.addEventListener('pointerdown', () => {
    const p = pending; pending = null; V.getAudio(); // unlocks sound
    if (p) setTimeout(() => V.say(p[0], p[1]), 0);   // a tap that makes Bonnie speak will talk over this, which is fine
  }, { capture: true, once: true });
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
  const cutInto = (out, chunk, base) => { let pos = 0;
    chunk.replace(/(\.\.\.|…|[.!?]+["'”’)]*)(\s+|$)/g, '$1$2\u0001').split('\u0001').forEach(raw => {
      if (raw) out.push({ raw, start: base + pos, name: false }); pos += raw.length; }); };
  /* Sentences and "..." pauses, without splitting out the name. [{raw, start}] */
  V.sentences = text => { const out = []; cutInto(out, text, 0); return out; };
  /* A sentence with the name swapped for {N} (used to find whole-sentence recordings of a name). */
  V.template = (clean, name) => { let s = clean; nameAt(clean, name).reverse().forEach(i => { s = s.slice(0, i) + '{N}' + s.slice(i + String(name).length); }); return s; };
  /* Pieces: sentences, "..." pauses and the child's name. [{raw, start, name}]; raw keeps spacing so offsets add up. */
  V.pieces = (text, name = V.getName()) => {
    const out = [], nm = String(name || '');
    let from = 0;
    for (const i of nameAt(text, nm)) { cutInto(out, text.slice(from, i), from); out.push({ raw: text.slice(i, i + nm.length), start: i, name: true }); from = i + nm.length; }
    cutInto(out, text.slice(from), from);
    return out;
  };
  const pauseAfter = raw => /(\.\.\.|…)\s*$/.test(raw) ? .4 : /[.!?]["'”’)]*\s*$/.test(raw) ? .25 : /[,;:—–]\s*$/.test(raw) ? .12 : .04;
  function plan(text) {
    const a = V.pack && V.getAudio();
    if (!a || (a.state !== 'running' && !(navigator.userActivation && navigator.userActivation.hasBeenActive))) return null;
    const out = [], name = V.getName(), whole = V.pack.whole && V.pack.whole[String(name).toLowerCase()];
    for (const s of V.sentences(text)) {
      // A sentence with the name in it may be recorded whole for this name (sounds most natural)
      let group = null;
      if (whole && nameAt(s.raw, name).length) {
        const f = whole[V.pieceKey(V.template(V.cleanPiece(s.raw), name))];
        if (f) group = [{ raw: s.raw, start: s.start, name: false, file: f }];
      }
      for (const p of group || V.pieces(s.raw, name).map(p => ({ ...p, start: p.start + s.start }))) {
        const clean = V.cleanPiece(p.raw);
        if (!V.hasWords(clean)) { if (out.length) out[out.length - 1].pause = Math.max(out[out.length - 1].pause, pauseAfter(p.raw)); continue; }
        const file = p.file || (p.name ? V.pack.names && V.pack.names[clean.toLowerCase()] : V.pack.clips[V.pieceKey(clean)]);
        if (!file) { if (!p.name) V.missing.add(clean); return null; }
        out.push({ ...p, file: V.base + 'audio/' + file, pause: pauseAfter(p.raw) });
      }
    }
    return out.length ? out : null;
  }
  V.hasClips = text => !!plan(String(text));

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
  V.isSpeaking = () => speaking;
  /* Run fn when Bonnie is quiet (now, if she isn't talking). */
  V.whenQuiet = fn => { if (speaking) waiters.push(fn); else setTimeout(fn, 0); };

  V.say = (text, opts = {}) => {
    cut();
    text = String(text);
    // Browsers keep a new page silent until it's tapped: remember the line and say it on the first tap.
    pending = navigator.userActivation && !navigator.userActivation.hasBeenActive ? [text, opts] : null;
    const t = token;
    if (!V.enabled()) { setTimeout(() => { opts.onend && opts.onend(); }, 0); return null; }
    speaking = true;
    // never wait forever if a voice forgets to say it has finished
    safety = setTimeout(() => finished(t, opts.onend), 2500 + text.length * 110 / Math.min(1, opts.rate || V.getRate()));
    const p = plan(text);
    if (p) { playClips(p, opts, t); return { clip: true }; }
    return speakDevice(text, opts, t);
  };
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
    const res = await fetch(file); if (!res.ok) throw new Error('clip ' + res.status);
    const data = await res.arrayBuffer(), a = V.getAudio();
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
    catch (e) { if (t === token) speakDevice(p.map(x => x.raw).join(''), opts, t); return; }
    if (t !== token) return;
    const a = V.getAudio(), slow = (opts.rate || 1) < .8 ? 1.6 : 1;
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
  V.load = async () => {
    try {
      const res = await fetch(V.base + 'audio/manifest.json', { cache: 'no-cache' }); if (!res.ok) return;
      const m = await res.json(); if (!m || !m.clips) return;
      V.pack = m;
      setTimeout(saveForOffline, 4000);
    } catch (e) {}
  };
  /* Save every clip into the offline cache in the background, a few at a time. */
  async function saveForOffline() {
    if (!V.pack || typeof caches === 'undefined' || navigator.onLine === false) return;
    try {
      const cache = await caches.open(AUDIO_CACHE);
      const files = [...new Set([...Object.values(V.pack.clips), ...Object.values(V.pack.names || {}), ...Object.values(V.pack.whole || {}).flatMap(Object.values)])].map(f => V.base + 'audio/' + f);
      let k = 0;
      const worker = async () => { while (k < files.length) { const f = files[k++];
        try { if (!(await cache.match(f))) { const r = await fetch(f); if (r.ok) await cache.put(f, r); } } catch (e) {} } };
      await Promise.all([worker(), worker(), worker(), worker()]);
    } catch (e) {}
  }
})();
