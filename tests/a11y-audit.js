/* A quick accessibility check for whatever screen is showing. Not loaded by the games.
   In a browser console on any game page:
     await import('./tests/a11y-audit.js')   (or '../tests/a11y-audit.js'), then  a11yAudit()
   It lists: buttons with no name for VoiceOver, buttons smaller than 44 x 44, and text whose
   colour is too close to its background (WCAG AA: 4.5 to 1, or 3 to 1 for large text). */
window.a11yAudit = function () {
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const hidden = e => !!e.closest('[aria-hidden="true"]');
  const name = e => (e.getAttribute('aria-label') || e.textContent || e.getAttribute('title') || e.value || e.getAttribute('placeholder') || '').trim();
  const wordless = t => !/[A-Za-z0-9]/.test(t);
  const lum = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const parse = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (m) return m[1].split(',').map(Number);
    const c = String(s).match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/); return c ? [c[1] * 255, c[2] * 255, c[3] * 255] : null; }; // color-mix() answers in this second form
  const bgOf = e => { for (let n = e; n; n = n.parentElement) { const s = getComputedStyle(n), c = parse(s.backgroundColor); if (c && (c[3] === undefined || c[3] > .9)) return c; if (s.backgroundImage !== 'none') return null; } return [255, 255, 255]; };
  const tag = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const out = { noName: [], small: [], contrast: [] };
  document.querySelectorAll('button,a[href],[role=button],input,select,textarea,[tabindex]:not([tabindex="-1"])').forEach(e => {
    if (!vis(e) || hidden(e)) return;
    const n = name(e), r = e.getBoundingClientRect();
    if (!n || (wordless(n) && !e.getAttribute('aria-label'))) out.noName.push(`${tag(e)} "${n.slice(0, 12)}"`);
    if (r.width < 43.5 || r.height < 43.5) out.small.push(`${tag(e)} ${Math.round(r.width)}x${Math.round(r.height)} "${n.slice(0, 18)}"`);
  });
  const seen = new Set();
  document.querySelectorAll('body *').forEach(e => {
    if (!vis(e) || hidden(e)) return;
    if (![...e.childNodes].some(n => n.nodeType === 3 && /[A-Za-z0-9]/.test(n.textContent))) return;
    const s = getComputedStyle(e), fg = parse(s.color), bg = bgOf(e); if (!fg || !bg) return;
    const a = lum(fg), b = lum(bg), cr = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    const size = parseFloat(s.fontSize), need = size >= 24 || (size >= 18.66 && +s.fontWeight >= 700) ? 3 : 4.5;
    const key = s.color + '|' + bg.slice(0, 3).join(',') + '|' + need;
    if (cr < need && !seen.has(key)) { seen.add(key); out.contrast.push(`${cr.toFixed(2)} (needs ${need}) ${tag(e)} ${s.color} on rgb(${bg.slice(0, 3).join(',')}) ${Math.round(size)}px "${e.textContent.trim().slice(0, 28)}"`); }
  });
  return out;
};
