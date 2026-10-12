/* Face + eye tracking for the hero portrait.
   Cursor moves  -> head turns toward it and eyes look at it.
   Cursor stops  -> after IDLE_MS everything eases back to a straight look. */
(() => {
  const wrap = document.getElementById('portraitWrap');
  const img = document.getElementById('heroPortrait');
  if (!wrap || !img) return;

  const MAX_YAW = 16, MAX_PITCH = 10;     // head turn (deg)
  const MAX_SHIFT_X = 26, MAX_SHIFT_Y = 14; // small parallax (px)
  const EYE_RANGE = 0.0075;             // eye shift as a fraction of portrait width
  const IDLE_MS = 250;                  // cursor-stopped delay before looking straight
  // eye centres as fractions of the portrait (adjust here if you swap the photo)
  const EYES = [ { x: .382, y: .309 }, { x: .523, y: .287 } ];

  const eyes = EYES.map(() => {
    const el = document.createElement('div');
    el.className = 'eye';
    wrap.appendChild(el);
    return el;
  });

  function layoutEyes() {
    const W = wrap.clientWidth, H = wrap.clientHeight;
    const pw = W * 0.095, ph = W * 0.048;
    EYES.forEach((p, i) => {
      const left = p.x * W - pw / 2, top = p.y * H - ph / 2;
      Object.assign(eyes[i].style, {
        left: left + 'px', top: top + 'px', width: pw + 'px', height: ph + 'px',
        backgroundImage: `url("${img.currentSrc || img.src}")`,
        backgroundSize: `${W}px ${H}px`,
        backgroundPosition: `${-left}px ${-top}px`
      });
    });
  }
  img.complete ? layoutEyes() : img.addEventListener('load', layoutEyes);
  window.addEventListener('resize', layoutEyes);

  const t = { dx: 0, dy: 0 }, c = { dx: 0, dy: 0, ex: 0, ey: 0 };
  let idleTimer;
  const straight = () => { t.dx = 0; t.dy = 0; };

  window.addEventListener('pointermove', (e) => {
    const r = wrap.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * 0.30; // around the face
    t.dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)));
    t.dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)));
    clearTimeout(idleTimer);
    idleTimer = setTimeout(straight, IDLE_MS);
  });
  document.addEventListener('pointerleave', () => { clearTimeout(idleTimer); straight(); });
  window.addEventListener('blur', straight);
  window.addEventListener('pointerup', (e) => { if (e.pointerType === 'touch') straight(); });

  (function frame() {
    if (document.documentElement.classList.contains('hero-frames')) { requestAnimationFrame(frame); return; }   // frame engine (hero-tracker.js) is active
    c.dx += (t.dx - c.dx) * 0.12;   // head: slower, weightier
    c.dy += (t.dy - c.dy) * 0.12;
    c.ex += (t.dx - c.ex) * 0.22;   // eyes: quicker than the head
    c.ey += (t.dy - c.ey) * 0.22;

    wrap.style.setProperty('--ry', (c.dx * MAX_YAW).toFixed(2) + 'deg');
    wrap.style.setProperty('--rx', (-c.dy * MAX_PITCH).toFixed(2) + 'deg');
    wrap.style.setProperty('--tx', (c.dx * MAX_SHIFT_X).toFixed(2) + 'px');
    wrap.style.setProperty('--ty', (c.dy * MAX_SHIFT_Y).toFixed(2) + 'px');

    const k = wrap.clientWidth * EYE_RANGE;
    const tr = `translate(${(c.ex * k).toFixed(2)}px, ${(c.ey * k).toFixed(2)}px)`;
    eyes.forEach((el) => (el.style.transform = tr));
    requestAnimationFrame(frame);
  })();
})();
