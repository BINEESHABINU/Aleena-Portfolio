/* Cursor-tracking hero (Step 3 of the workflow).
   - NO CSS 3D, NO video seeking/playing in the browser.
   - 64 pre-extracted WebP frames cover the full 360 deg head-turn circle.
   - Every animation frame: cursor angle -> shortest-path angular lerp (0.26)
     -> nearest frame -> ONE crisp frame drawn at 100% opacity (no alpha-blending, no ghosting).
   - Cursor close to the face (about 12% of the screen) -> center.webp (eye contact).
   If assets/hero/frames/ doesn't exist yet, nothing here runs and the original
   single-image hero (tracking.js) keeps working. */
(() => {
  const hero = document.getElementById('home');
  const canvas = document.getElementById('heroCanvas');
  if (!hero || !canvas) return;

  const BASE = 'assets/hero/frames/';
  const LERP = 0.26;            // response factor (~35 ms to catch up)
  const DEADZONE = 0.12;        // of the screen diagonal
  const IDLE_MS = 1800;         // touch released / cursor left -> look straight again

  const ctx = canvas.getContext('2d', { alpha: false });
  let meta, frames = [], center, W = 0, H = 0, dpr = 1, vw = 0, vh = 0;
  let cur = 270, target = 270, lookCenter = true, idx = -1, lastIdx = -2, idle;

  /* ---- 1. read meta.js (works from http AND from file://) ---- */
  const s = document.createElement('script');
  s.src = BASE + 'meta.js';
  s.onload = () => window.HERO_META ? start(window.HERO_META) : null;
  s.onerror = () => {};         // no frames yet -> keep the fallback hero
  document.head.appendChild(s);

  function load(src) {
    return new Promise((res, rej) => {
      const im = new Image(); im.decoding = 'async';
      im.onload = () => res(im); im.onerror = () => rej(src); im.src = src;
    });
  }

  /* ---- 2. preload all frames, then switch the hero over ---- */
  function start(m) {
    meta = m;
    const jobs = [load(BASE + 'center.webp')];
    for (let i = 0; i < meta.count; i++) jobs.push(load(BASE + 'frame-' + String(i).padStart(2, '0') + '.webp'));
    Promise.all(jobs).then((all) => {
      center = all[0]; frames = all.slice(1); W = center.naturalWidth; H = center.naturalHeight;
      // seamless background: page + canvas use the exact colour of the video
      document.documentElement.style.setProperty('--hero-bg', meta.bg);
      document.documentElement.classList.add('hero-frames');
      hero.classList.add('has-frames');
      resize(); requestAnimationFrame(tick);
    }).catch(() => {});         // any frame missing -> keep the fallback hero
  }

  /* ---- 3. cover-fit drawing + face centre on screen ---- */
  let sc = 1, ox = 0, oy = 0;
  function resize() {
    const r = hero.getBoundingClientRect();
    vw = r.width; vh = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
    sc = Math.max(vw / W, vh / H);                       // object-fit: cover
    ox = (vw - W * sc) / 2; oy = (vh - H * sc) / 2;
    lastIdx = -2;                                        // force a redraw
  }
  window.addEventListener('resize', resize);

  const faceXY = () => {
    const r = hero.getBoundingClientRect(), f = meta.face || { x: .5, y: .38 };
    return { x: r.left + ox + f.x * W * sc, y: r.top + oy + f.y * H * sc };
  };

  /* ---- 4. cursor -> angle ---- */
  function aim(e) {
    const f = faceXY(), dx = e.clientX - f.x, dy = e.clientY - f.y;
    const diag = Math.hypot(window.innerWidth, window.innerHeight);
    lookCenter = Math.hypot(dx, dy) < DEADZONE * diag;
    if (!lookCenter) target = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
    clearTimeout(idle); idle = setTimeout(() => (lookCenter = true), IDLE_MS * (e.pointerType === 'mouse' ? 1000 : 1));
  }
  window.addEventListener('pointermove', aim, { passive: true });
  window.addEventListener('pointerdown', aim, { passive: true });
  window.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') { clearTimeout(idle); idle = setTimeout(() => (lookCenter = true), IDLE_MS); } });
  document.addEventListener('pointerleave', () => (lookCenter = true));
  window.addEventListener('blur', () => (lookCenter = true));

  const lerpAngle = (a, b, k) => { const d = ((b - a + 540) % 360) - 180; return (a + d * k + 360) % 360; };

  /* ---- 5. render loop: exactly one frame, 100% opacity ---- */
  let t0 = performance.now();
  function tick(now) {
    const dt = Math.min(64, now - t0); t0 = now;
    const k = 1 - Math.pow(1 - LERP, dt / 16.667);       // same feel at 60 / 120 / 144 Hz
    cur = lerpAngle(cur, target, k);
    const step = 360 / meta.count;
    idx = lookCenter ? -1 : Math.round(cur / step) % meta.count;
    if (idx !== lastIdx) {
      lastIdx = idx;
      const img = idx === -1 ? center : frames[idx];
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = meta.bg; ctx.fillRect(0, 0, vw, vh);
      ctx.drawImage(img, ox, oy, W * sc, H * sc);
      canvas.dataset.frame = idx === -1 ? 'center' : idx;
    }
    requestAnimationFrame(tick);
  }
})();
