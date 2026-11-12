/* Meadow save backup — export and import every game's progress.
 *
 * Used by the grown-ups areas of Meadow Maths and Meadow Words: MeadowBackup.open() shows the panel.
 * A backup holds the saved data exactly as stored (each key's raw text), so restoring gives back
 * precisely what was there. It is offered two ways:
 *   - a file:  meadow-backup-<name>-<date>.json   (share sheet / download)
 *   - a code:  MEADOW-SAVE-1:<base64 of the same JSON>   (copy and paste, e.g. into Notes or an email)
 * Before a restore replaces anything, the current progress is kept in BEFORE_KEY so it can be put back.
 *
 * What is in a backup: the games' save (meadow-save-v1), the older website saves if this device has
 * them, and in the App Store app every added player's save (meadow-save-v1-p2, -p3 …) with the list
 * of players. The full-game purchase is never in a backup: the App Store looks after that.
 */
(function () {
  const KEYS = ['harvey-splitter-v1', 'meadowWords_english_v1', 'meadowClubhouse_sound', 'meadow-save-v1'];
  const MAIN_KEY = 'harvey-splitter-v1';   // the older website save
  const SAVE_KEY = 'meadow-save-v1';       // the games' save now (the first player's in the app)
  const PLAYERS_KEY = 'meadow-players';    // the app's list of players
  const isExtraSave = k => /^meadow-save-v1-p[1-9]\d*$/.test(String(k)); // an added player's save
  const isSave = k => k === SAVE_KEY || isExtraSave(k);
  const allowed = k => KEYS.includes(k) || k === PLAYERS_KEY || isExtraSave(k);
  const BEFORE_KEY = 'meadow-backup-before-restore';
  const CODE_PREFIX = 'MEADOW-SAVE-1:';
  const APP = 'meadow-clubhouse';
  const MAX_CHARS = 2000000;

  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => new Date().toISOString().slice(0, 10);

  /* ---------- making and reading backups ---------- */
  /* Every key on this device that belongs in a backup. */
  function here() {
    const keys = [...KEYS, PLAYERS_KEY];
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (isExtraSave(k)) keys.push(k); } } catch (e) {}
    return keys;
  }
  const obj = text => { try { const v = JSON.parse(text); return v && typeof v === 'object' && !Array.isArray(v) ? v : null; } catch (e) { return null; } };
  /* The players in a backup, in order: [{ id, key }]. One player unless the app's list says more. */
  function playersIn(data) {
    const p = obj(data[PLAYERS_KEY]) || {};
    const ids = (Array.isArray(p.list) ? p.list : []).filter(id => /^p[1-9]\d*$/.test(id)).filter((id, i, a) => a.indexOf(id) === i);
    const list = (ids.length ? ids : ['p1']).map(id => ({ id, key: id === 'p1' ? SAVE_KEY : SAVE_KEY + '-' + id }));
    return list.filter(x => x.id === 'p1' || x.key in data);
  }
  function make() {
    const data = {};
    here().forEach(k => { const v = get(k); if (v !== null) data[k] = v; });
    return { app: APP, format: 1, exportedAt: new Date().toISOString(), data };
  }
  const b64encode = s => { const bytes = new TextEncoder().encode(s); let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin); };
  const b64decode = s => { const bin = atob(s); const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes); };
  const toCode = backup => CODE_PREFIX + b64encode(JSON.stringify(backup));

  /* Accepts a backup code or the JSON from a backup file. Returns { backup } or { error }. */
  function parse(text) {
    text = String(text || '').trim();
    if (!text) return { error: 'Paste a backup code or choose a backup file first.' };
    if (text.length > MAX_CHARS) return { error: 'That is far too big to be a Meadow backup.' };
    let json = text;
    const isCode = text.toUpperCase().startsWith(CODE_PREFIX);
    if (isCode) {
      try { json = b64decode(text.slice(CODE_PREFIX.length).replace(/\s+/g, '')); }
      catch (e) { return { error: 'That code is incomplete or has been changed. Copy the whole code and try again.' }; }
    }
    let b;
    try { b = JSON.parse(json); }
    catch (e) { return { error: isCode ? 'That code is incomplete or has been changed. Copy the whole code and try again.' : 'That isn’t a Meadow backup. A backup code starts with ' + CODE_PREFIX }; }
    if (!b || b.app !== APP || !b.data || typeof b.data !== 'object') return { error: 'That isn’t a Meadow backup.' };
    if (b.format !== 1) return { error: 'This backup was made by a newer version of the games. Update the games, then try again.' };
    const keys = Object.keys(b.data);
    if (keys.some(k => !allowed(k) || typeof b.data[k] !== 'string')) return { error: 'This backup has something unexpected in it, so it wasn’t used.' };
    // a backup made in the app has only the games' save; one from the website has the older save too
    if (!keys.includes(MAIN_KEY) && !keys.includes(SAVE_KEY)) return { error: 'This backup has no player progress in it.' };
    for (const k of keys) {
      if (k === 'meadowClubhouse_sound') { if (!/^[01]$/.test(b.data[k])) return { error: 'This backup looks damaged (sound setting).' }; continue; }
      let v; try { v = JSON.parse(b.data[k]); } catch (e) { return { error: 'This backup looks damaged, so it wasn’t used.' }; }
      if (!v || typeof v !== 'object' || Array.isArray(v)) return { error: 'This backup looks damaged, so it wasn’t used.' };
      if (k === MAIN_KEY || isSave(k)) {
        if (v.name != null && typeof v.name !== 'string') return { error: 'This backup looks damaged (player name).' };
        if (v.bones != null && !(Number.isFinite(+v.bones) && +v.bones >= 0)) return { error: 'This backup looks damaged (bones).' };
      }
    }
    return { backup: b };
  }

  /* A short description, e.g. "Harvey · 340 bones · 27 stars · 2 prizes claimed", with a line for each player. */
  function summary(data) {
    const count = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
    if (!(SAVE_KEY in data)) return oldSummary(data, count);
    return playersIn(data).map(({ key }) => {
      const s = obj(data[key]) || {};
      const stars = Object.values(s.stars && typeof s.stars === 'object' ? s.stars : {}).reduce((a, v) => a + (Math.floor(+v) || 0), 0);
      const claimed = Array.isArray(s.redeemed) ? s.redeemed.length : 0;
      return `${typeof s.name === 'string' && s.name ? esc(s.name) : 'No name'} · ${count(Math.floor(+s.bones || 0), 'bone')} · ${count(stars, 'star')} · ${count(claimed, 'prize')} claimed`;
    }).join('<br>');
  }
  /* A backup from before the games shared one save: read the older saves instead. */
  function oldSummary(data, count) {
    const main = obj(data[MAIN_KEY]) || {}, words = obj(data.meadowWords_english_v1) || {};
    const maths = ['done', 'done2', 'done3', 'done4'].reduce((a, k) => a + Object.values(main[k] || {}).filter(Boolean).length, 0);
    const stars = Object.values(words).reduce((a, w) => a + ((w && w.stars) || []).reduce((x, y) => x + (+y || 0), 0), 0);
    const claimed = Array.isArray(main.redeemed) ? main.redeemed.length : 0;
    return `${main.name ? esc(main.name) : 'No name'} · ${count(Math.floor(+main.bones || 0), 'bone')} · ${maths} maths level${maths === 1 ? '' : 's'} done · ${count(stars, 'word star')} · ${count(claimed, 'prize')} claimed`;
  }

  /* Replace this device's progress with the backup (keeping what was here, so it can be undone). */
  function restore(backup) {
    const before = make();
    localStorage.setItem(BEFORE_KEY, JSON.stringify({ savedAt: new Date().toISOString(), backup: before }));
    put(backup.data);
  }
  /* Make this device hold exactly what the backup holds: players here that aren't in it go too. */
  function put(data) {
    [...new Set([...here(), ...Object.keys(data)])].forEach(k => { if (k in data) localStorage.setItem(k, data[k]); else localStorage.removeItem(k); });
  }
  function before() { try { const b = JSON.parse(get(BEFORE_KEY) || 'null'); return b && b.backup && parse(JSON.stringify(b.backup)).backup ? b : null; } catch (e) { return null; } }

  function fileName(backup) {
    const name = (obj(backup.data[SAVE_KEY]) || {}).name || (obj(backup.data[MAIN_KEY]) || {}).name || 'player';
    return `meadow-backup-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'player'}-${today()}.json`;
  }
  /* Save the file: the share sheet on iPad/iPhone (Save to Files, AirDrop, email…), a download elsewhere. */
  async function saveFile(backup) {
    const text = JSON.stringify(backup, null, 1), name = fileName(backup);
    const file = typeof File === 'function' ? new File([text], name, { type: 'application/json' }) : null;
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Meadow backup' }); return 'shared'; }
      catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
    }
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
    return 'downloaded';
  }

  /* ---------- the panel ---------- */
  const CSS = `
  .mb-back{position:fixed;inset:0;z-index:10000;background:rgba(40,30,20,.45);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:16px}
  .mb-card{background:#FDFBF7;color:#4A3B2C;border:2px solid #EADFCB;border-radius:22px;max-width:560px;width:100%;padding:20px 20px 24px;margin:auto 0;
    box-shadow:0 10px 0 rgba(74,59,44,.15);font-family:'Fredoka','Trebuchet MS',system-ui,sans-serif;font-size:1rem;line-height:1.45}
  .mb-card h2{margin:0;font-size:1.5rem}.mb-card h3{margin:18px 0 6px;font-size:1.15rem}
  .mb-card p{margin:6px 0}.mb-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
  .mb-sum{background:#F3ECDD;border-radius:12px;padding:8px 12px;font-weight:600}
  .mb-row{display:flex;flex-wrap:wrap;gap:10px;margin:10px 0}
  .mb-btn{font:inherit;font-weight:600;min-height:46px;padding:10px 16px;border-radius:14px;border:2px solid #EADFCB;background:#fff;color:#4A3B2C;cursor:pointer;box-shadow:0 4px 0 #EADFCB}
  .mb-btn:active{transform:translateY(3px);box-shadow:none}
  .mb-btn.go{background:#4CAF50;border-color:#3E8E41;color:#fff;box-shadow:0 4px 0 #3E8E41}
  .mb-btn.warn{background:#D9596B;border-color:#A63C4C;color:#fff;box-shadow:0 4px 0 #A63C4C}
  .mb-btn[disabled]{opacity:.5;cursor:default}
  .mb-card textarea{width:100%;box-sizing:border-box;min-height:84px;font:13px/1.3 ui-monospace,Menlo,monospace;border:2px solid #EADFCB;border-radius:12px;padding:8px;background:#fff;color:#4A3B2C;word-break:break-all}
  .mb-msg{min-height:1.4em;font-weight:600}.mb-msg.bad{color:#B23A48}.mb-msg.good{color:#2E7D32}
  .mb-note{font-size:.9rem;color:#7A6A58}
  .mb-file{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
  .mb-check{border:2px dashed #D9A86C;border-radius:14px;padding:10px 12px;margin-top:10px}
  @media (prefers-reduced-motion:reduce){.mb-btn:active{transform:none}}`;

  function open() {
    if (document.querySelector('.mb-back')) return;
    if (!document.getElementById('mb-css')) { const st = document.createElement('style'); st.id = 'mb-css'; st.textContent = CSS; document.head.appendChild(st); }
    const now = make(), code = toCode(now), prev = before();
    const back = document.createElement('div'); back.className = 'mb-back';
    back.innerHTML = `<div class="mb-card" role="dialog" aria-modal="true" aria-label="Back up progress">
      <div class="mb-head"><h2>💾 Back up progress</h2><button class="mb-btn" data-mb="close" aria-label="Close">✕ Close</button></div>
      <p class="mb-sum">${summary(now.data)}</p>
      <h3>Make a backup</h3>
      <p>Keep a copy of all the progress on this device: every player’s bones, stars, hats, themes and prizes.</p>
      <div class="mb-row"><button class="mb-btn go" data-mb="file">Save a backup file</button><button class="mb-btn" data-mb="copy">Copy backup code</button></div>
      <p class="mb-note">The file can go in Files, iCloud, an email or a message. The code is the same backup as text: paste it into Notes or an email.</p>
      <textarea readonly aria-label="Backup code" data-mb="code">${esc(code)}</textarea>
      <p class="mb-msg" data-mb="outmsg" aria-live="polite"></p>
      <h3>Restore a backup</h3>
      <p>Choose a backup file, or paste a backup code. You’ll see what’s in it before anything changes.</p>
      <div class="mb-row"><button class="mb-btn" data-mb="pick">Choose a backup file</button><input class="mb-file" type="file" accept=".json,application/json,text/plain" data-mb="input"></div>
      <textarea aria-label="Paste a backup code" placeholder="Paste a backup code here (it starts with ${CODE_PREFIX})" data-mb="paste"></textarea>
      <div class="mb-row"><button class="mb-btn" data-mb="check">Check this code</button></div>
      <p class="mb-msg" data-mb="inmsg" aria-live="polite"></p>
      <div data-mb="confirm"></div>
      ${prev ? `<h3>Undo the last restore</h3><p class="mb-note">Progress from before the restore on ${esc(new Date(prev.savedAt).toLocaleString('en-GB'))} is still kept: ${summary(prev.backup.data)}</p>
      <div class="mb-row"><button class="mb-btn" data-mb="undo">Put that progress back</button></div>` : ''}
    </div>`;
    document.body.appendChild(back);
    const $ = s => back.querySelector(`[data-mb="${s}"]`);
    const msg = (where, text, good) => { const m = $(where); m.textContent = text; m.className = 'mb-msg' + (good ? ' good' : text ? ' bad' : ''); };
    let pending = null;

    const offer = text => {
      const r = parse(text); $('confirm').innerHTML = ''; pending = null;
      if (r.error) return msg('inmsg', r.error);
      msg('inmsg', '');
      pending = r.backup;
      const when = r.backup.exportedAt ? new Date(r.backup.exportedAt).toLocaleString('en-GB') : 'an unknown date';
      $('confirm').innerHTML = `<div class="mb-check"><p><b>This backup (made ${esc(when)}):</b></p><p class="mb-sum">${summary(r.backup.data)}</p>
        <p><b>It will replace this device’s progress:</b></p><p class="mb-sum">${summary(make().data)}</p>
        <div class="mb-row"><button class="mb-btn warn" data-mb="restore">Replace with this backup</button><button class="mb-btn" data-mb="cancel">Cancel</button></div></div>`;
    };
    const reloadSoon = text => { msg('inmsg', text, true); $('confirm').innerHTML = ''; setTimeout(() => location.reload(), 1200); };

    back.addEventListener('click', async e => {
      if (e.target === back) return back.remove();
      const b = e.target.closest('[data-mb]'); if (!b) return;
      const act = b.dataset.mb;
      if (act === 'close') back.remove();
      else if (act === 'file') {
        const how = await saveFile(make());
        msg('outmsg', how === 'shared' ? 'Backup ready. Choose where to keep it.' : how === 'downloaded' ? 'Backup file saved (look in Downloads).' : '', true);
      } else if (act === 'copy') {
        const ta = $('code'); let ok = false;
        try { // some browsers never answer, so give up after 2 seconds and copy the old way
          await Promise.race([navigator.clipboard.writeText(ta.value), new Promise((_, no) => setTimeout(no, 2000))]); ok = true;
        } catch (err) { ta.focus(); ta.select(); try { ok = document.execCommand('copy'); } catch (x) {} }
        msg('outmsg', ok ? 'Backup code copied. Paste it somewhere safe.' : 'Couldn’t copy automatically: the code is selected, so use Copy.', ok);
      } else if (act === 'pick') $('input').click();
      else if (act === 'check') offer($('paste').value);
      else if (act === 'cancel') { $('confirm').innerHTML = ''; pending = null; }
      else if (act === 'restore' && pending) {
        try { restore(pending); reloadSoon('Restored! Reloading the game…'); }
        catch (err) { msg('inmsg', 'Couldn’t save on this device (it may be full or in private browsing). Nothing was changed.'); }
      } else if (act === 'undo') {
        const p = before(); if (!p) return;
        try { put(p.backup.data);
          localStorage.removeItem(BEFORE_KEY); reloadSoon('Progress put back. Reloading the game…'); }
        catch (err) { msg('inmsg', 'Couldn’t put it back on this device.'); }
      }
    });
    $('input').addEventListener('change', () => {
      const f = $('input').files && $('input').files[0]; if (!f) return;
      if (f.size > MAX_CHARS) return msg('inmsg', 'That file is far too big to be a Meadow backup.');
      const r = new FileReader();
      r.onload = () => { $('paste').value = ''; offer(r.result); };
      r.onerror = () => msg('inmsg', 'Couldn’t read that file.');
      r.readAsText(f); $('input').value = '';
    });
    $('close').focus();
  }

  window.MeadowBackup = { open, make, parse, toCode, summary, restore, before, KEYS };
})();
