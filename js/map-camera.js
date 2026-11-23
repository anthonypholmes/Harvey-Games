/* The world maps' camera: pinch to zoom, drag to pan, double-tap to zoom in, a mouse wheel or trackpad, and the
 * zoom buttons, all on one map viewport. Used by js/proto-map.js for both Meadow Maths and Meadow Words.
 *
 * Only the map's own viewport takes these gestures (touch-action: none on it alone), so the page never zooms, and
 * dragging tiles, number lines and letters everywhere else in the game is untouched.
 *
 * The drawing (the "world" element) is laid out once at `base` pixels per drawing unit; the camera moves and scales
 * it with a CSS transform, so the 2018 iPad only recomposites while a finger moves. It is always kept inside its
 * own edges: zoomed in, no blank space shows past the drawing; zoomed right out it sits in the middle of the room
 * left between the top bar and the buttons.
 *
 * Taps still reach the places as ordinary clicks (so VoiceOver, Switch Control and keyboards work as before). A drag
 * or a pinch swallows the click that would follow it, so moving the map never opens a place by accident.
 */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => 1 - Math.pow(1 - t, 3);

  function create(o) {
    const vp = o.viewport, world = o.world, WW = o.size.w, WH = o.size.h, base = o.base;
    const reduce = o.reduce || (() => false), insets = o.insets || (() => ({ top: 0, bottom: 0 }));
    const SLOP = 10; // how far a finger moves before a tap becomes a drag
    let z = base, tx = 0, ty = 0, anim = 0, glide = 0, alive = true, late = 0;
    const pts = new Map(); // the fingers (or the mouse) down on the map
    let g = null; // the gesture going on: { kind: 'maybe' | 'pan' | 'pinch', ... }
    let swallow = false, lastTap = null, samples = [];

    const VW = () => vp.clientWidth, VH = () => vp.clientHeight;
    // smallest zoom: the whole drawing in the room between the top bar and the buttons (but never so small the signs pile up)
    const zMin = () => { const i = insets(); return Math.max(o.floor || 0, Math.min(VW() / WW, (VH() - i.top - i.bottom) / WH)); };
    const zMax = () => Math.max(o.maxZoom || base * 2.4, zMin() * 1.5);
    const zFit = () => Math.min(zMin(), zMax());
    function fix(nz, nx, ny) { nz = clamp(nz, zMin(), zMax()); return [nz, ...fixT(nz, nx, ny)]; }
    // keep the drawing inside its edges at zoom nz
    function fixT(nz, nx, ny) {
      const cw = WW * nz, ch = WH * nz, vw = VW(), vh = VH(), i = insets();
      nx = cw >= vw ? clamp(nx, vw - cw, 0) : (vw - cw) / 2;
      ny = ch >= vh ? clamp(ny, vh - ch, 0) : clamp(i.top + (vh - i.top - i.bottom - ch) / 2, 0, vh - ch);
      return [nx, ny];
    }
    function apply() {
      world.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0) scale(${(z / base).toFixed(5)})`;
      if (o.onChange) o.onChange(api);
    }
    function set(nz, nx, ny) { [z, tx, ty] = fix(nz, nx, ny); apply(); }
    function stop() { cancelAnimationFrame(anim); cancelAnimationFrame(glide); clearTimeout(late); anim = glide = late = 0; }
    function moving(v) { vp.classList.toggle('cam-moving', v); }
    // glide to a view (instantly with Reduce Motion)
    function animateTo(nz, nx, ny, ms = 420) {
      stop();
      const [ez, ex, ey] = fix(nz, nx, ny), [sz, sx, sy] = [z, tx, ty];
      if (reduce() || ms <= 0) { set(ez, ex, ey); settle(); return; }
      const t0 = performance.now(); moving(true);
      const end = () => { cancelAnimationFrame(anim); clearTimeout(late); anim = late = 0; set(ez, ex, ey); settle(); };
      const step = now => {
        const k = ease(Math.min(1, (now - t0) / ms));
        // zoom in proportion, and move the point that ends in the middle smoothly
        z = sz * Math.pow(ez / sz, k); tx = sx + (ex - sx) * k; ty = sy + (ey - sy) * k; apply();
        if (k < 1 && alive) anim = requestAnimationFrame(step); else end();
      };
      anim = requestAnimationFrame(step);
      late = setTimeout(end, ms + 200); // frames can stop coming (the app sent to the background): it still ends where it should
    }
    function settle() { moving(false); if (o.onSettle) o.onSettle(api); }

    // the drawing point (in drawing units) at a point on the screen, and back
    const toWorld = (sx, sy) => [(sx - tx) / z, (sy - ty) / z];
    const toScreen = (wx, wy) => [wx * z + tx, wy * z + ty];
    // zoom by f, keeping the screen point (sx, sy) where it is
    function zoomAt(f, sx, sy, animate) {
      const nz = clamp(z * f, zMin(), zMax()), [wx, wy] = toWorld(sx, sy);
      const args = [nz, sx - wx * nz, sy - wy * nz];
      animate ? animateTo(...args, 320) : set(...args);
    }
    // put a drawing point in the middle of the room left between the bar and the buttons
    function centreOn(wx, wy, nz = z, animate = true) {
      const i = insets(), cx = VW() / 2, cy = i.top + (VH() - i.top - i.bottom) / 2;
      const args = [nz, cx - wx * nz, cy - wy * nz];
      animate ? animateTo(...args) : set(...args);
    }
    function fitAll(animate = true) { const nz = zFit(); animate ? animateTo(nz, 0, 0) : set(nz, 0, 0); }
    const isWhole = () => z <= zFit() * 1.02;

    /* ---------- fingers ---------- */
    const pos = e => { const r = vp.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    function startPan() { const [p] = pts.values(); g = { kind: 'pan', p0: [...p], t0: [tx, ty] }; samples = [{ t: performance.now(), x: p[0], y: p[1] }]; }
    function startPinch() {
      const [a, b] = [...pts.values()], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      g = { kind: 'pinch', d0: Math.max(20, Math.hypot(a[0] - b[0], a[1] - b[1])), z0: z, w: toWorld(...m) };
    }
    function begin() { // the first moment it's clearly not a tap
      swallow = true; moving(true);
      if (o.onGesture) o.onGesture();
    }
    function down(e) {
      if (!alive || (e.pointerType === 'mouse' && e.button !== 0)) return;
      stop();
      if (!pts.size) swallow = false; // a new touch: only a drag in it swallows its click
      pts.set(e.pointerId, pos(e));
      if (pts.size === 1) g = { kind: 'maybe', p0: pos(e), t: performance.now(), target: e.target };
      else if (pts.size === 2) { if (g && g.kind === 'maybe') begin(); startPinch(); }
    }
    function move(e) {
      if (!pts.has(e.pointerId) || !g) return;
      const p = pos(e); pts.set(e.pointerId, p);
      if (g.kind === 'maybe') {
        if (Math.hypot(p[0] - g.p0[0], p[1] - g.p0[1]) < SLOP) return;
        begin(); startPan(); g.p0 = [...g.p0]; // pan from where the finger went down, so the map doesn't jump
      }
      if (e.cancelable) e.preventDefault();
      if (g.kind === 'pan') {
        set(z, g.t0[0] + p[0] - g.p0[0], g.t0[1] + p[1] - g.p0[1]);
        const now = performance.now(); samples.push({ t: now, x: p[0], y: p[1] }); while (samples.length > 2 && now - samples[0].t > 90) samples.shift();
      } else if (g.kind === 'pinch' && pts.size >= 2) {
        const [a, b] = [...pts.values()], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        const nz = clamp(g.z0 * d / g.d0, zMin() * .92, zMax() * 1.08); // a little give at the ends, then it springs back
        z = nz; [tx, ty] = fixT(nz, m[0] - g.w[0] * nz, m[1] - g.w[1] * nz); // the point between the fingers stays under them
        apply();
      }
    }
    const outside = () => fix(z, tx, ty).some((v, i) => Math.abs(v - [z, tx, ty][i]) > (i ? .5 : .0005));
    function up(e) {
      if (!pts.has(e.pointerId)) return;
      const p = pts.get(e.pointerId); pts.delete(e.pointerId);
      const kind = g && g.kind;
      if (kind === 'pinch') {
        if (pts.size === 1) { startPan(); return; } // one finger stays down: carry on moving the map with it
        if (!pts.size) { g = null; if (outside()) animateTo(z, tx, ty, 220); else settle(); }
        return;
      }
      if (pts.size) return;
      g = null;
      if (kind === 'pan') {
        // let it glide a little, as a map does (not with Reduce Motion)
        if (outside()) { animateTo(z, tx, ty, 220); return; } // a pinch went past the smallest or biggest zoom: spring back
        const a = samples[0], b = samples[samples.length - 1], dt = b ? b.t - a.t : 0;
        if (reduce() || e.type === 'pointercancel' || dt < 10 || performance.now() - b.t > 80) { settle(); return; }
        let vx = (b.x - a.x) / dt, vy = (b.y - a.y) / dt, last = performance.now();
        const step = now => {
          const dtt = Math.min(32, now - last); last = now;
          const bx = tx, by = ty; set(z, tx + vx * dtt, ty + vy * dtt);
          if (Math.abs(tx - bx) < Math.abs(vx * dtt) * .5) vx = 0; if (Math.abs(ty - by) < Math.abs(vy * dtt) * .5) vy = 0; // stopped at an edge
          const f = Math.pow(.994, dtt); vx *= f; vy *= f;
          if (Math.hypot(vx, vy) > .03 && alive) glide = requestAnimationFrame(step); else { glide = 0; settle(); }
        };
        glide = requestAnimationFrame(step);
        return;
      }
      if (kind === 'maybe' && e.type !== 'pointercancel') {
        // a tap: a place takes it as a click; a double-tap on the meadow itself zooms in there
        if (o.isTarget && o.isTarget(e.target)) { lastTap = null; return; }
        const now = performance.now();
        if (lastTap && now - lastTap.t < 320 && Math.hypot(p[0] - lastTap.p[0], p[1] - lastTap.p[1]) < 36) {
          lastTap = null;
          if (z >= zMax() * .98) fitAll(); else zoomAt(2, p[0], p[1], true);
        } else lastTap = { t: now, p };
      }
    }
    // a drag or a pinch never opens a place
    function click(e) { if (swallow) { e.stopPropagation(); e.preventDefault(); swallow = false; } }
    // a trackpad pinch (or ctrl + wheel) zooms; the wheel or two fingers on a trackpad move the map
    function wheel(e) {
      e.preventDefault(); stop();
      const [sx, sy] = pos(e);
      if (e.ctrlKey) zoomAt(Math.exp(-e.deltaY * .01), sx, sy, false);
      else set(z, tx - e.deltaX, ty - e.deltaY);
      clearTimeout(wheel.t); wheel.t = setTimeout(settle, 160);
    }
    const noPageZoom = e => e.preventDefault(); // Safari's own pinch (the website): the map takes it instead

    vp.addEventListener('pointerdown', down);
    addEventListener('pointermove', move, { passive: false });
    addEventListener('pointerup', up); addEventListener('pointercancel', up);
    vp.addEventListener('click', click, true);
    vp.addEventListener('wheel', wheel, { passive: false });
    ['gesturestart', 'gesturechange'].forEach(n => vp.addEventListener(n, noPageZoom));

    const api = {
      get zoom() { return z; }, get x() { return tx; }, get y() { return ty; }, base,
      zMin, zMax, zFit, isWhole, toScreen, toWorld, set, animateTo, centreOn, fitAll, stop,
      zoomBy: (f, animate = true) => { const i = insets(); zoomAt(f, VW() / 2, i.top + (VH() - i.top - i.bottom) / 2, animate); },
      // what to keep when the map is drawn again (a turn of the iPad, or back from a level): the middle and the zoom
      state: () => { const i = insets(), [cx, cy] = toWorld(VW() / 2, i.top + (VH() - i.top - i.bottom) / 2); return { cx, cy, zr: z / base }; },
      restore: st => centreOn(st.cx, st.cy, st.zr * base, false),
      // bring a drawing rectangle into the room, if it isn't (a place that VoiceOver or a keyboard has moved to)
      show(x, y, w, h) {
        const i = insets(), [l, t] = toScreen(x, y), [r, b] = toScreen(x + w, y + h);
        if (l >= 0 && r <= VW() && t >= i.top && b <= VH() - i.bottom) return;
        centreOn(x + w / 2, y + h / 2, z, true);
      },
      destroy() {
        alive = false; stop();
        removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
      },
    };
    return api;
  }

  window.MapCamera = { create };
})();
