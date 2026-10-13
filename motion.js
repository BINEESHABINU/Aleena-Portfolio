/* Motion extras for the portfolio page
   0. Smooth scrolling (Lenis)
   1. Back-to-top / down arrows: eased scroll + progress ring + launch animation
   2. Tools -> footer: fade-up + zoom-in that replays whenever you scroll back to it
   3. Campaigns: every block (tiles, cards, graph) plays when IT scrolls into view, then replays on scroll-back */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const html = document.documentElement;

  /* ---------------------------------------------------------------- 0. smooth scrolling */
  let lenis = null;
  if (!reduce && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({
      duration: 1.35,                                              // how long the glide takes to settle
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,                                           // mouse wheel / trackpad are smoothed
      wheelMultiplier: 0.9,
      autoRaf: true,                                               // touch keeps native scrolling
    });
    window.lenis = lenis;
    // #anchor links glide instead of jumping
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href').length < 2) return;
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0, duration: 1.5 });
    });
  }
  const glideTo = (y, seconds, easing, done) => {
    if (lenis) lenis.scrollTo(y, { duration: seconds, easing, lock: false, onComplete: done });
    else { window.scrollTo(0, y); if (done) done(); }
  };

  /* ---------------------------------------------------------------- 1. side arrows */
  const toTop = document.getElementById('toTop');
  const toBottom = document.getElementById('toBottom');
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  if (toTop) {
    const setRing = () => {
      const max = html.scrollHeight - window.innerHeight;
      toTop.style.setProperty('--p', max > 0 ? Math.min(100, (window.scrollY / max) * 100).toFixed(1) : 0);
    };
    window.addEventListener('scroll', setRing, { passive: true });
    window.addEventListener('resize', setRing);
    setRing();

    let raf = 0, active = false;
    const events = ['wheel', 'touchstart', 'keydown', 'mousedown'];
    function end(interrupted) {
      if (!active) return;
      active = false; cancelAnimationFrame(raf);
      toTop.classList.remove('going');
      events.forEach((ev) => window.removeEventListener(ev, onUser));
      if (interrupted && lenis) lenis.scrollTo(lenis.scroll, { immediate: true, force: true });   // stop gliding
    }
    const onUser = () => end(true);

    toTop.addEventListener('click', (e) => {
      e.stopImmediatePropagation();                              // replaces the plain jump from portfolio.js
      const from = window.scrollY;
      if (from < 2) return;
      if (reduce) { window.scrollTo(0, 0); return; }
      if (active) end(false);
      active = true; toTop.classList.add('going');
      events.forEach((ev) => window.addEventListener(ev, onUser, { passive: true }));
      const secs = Math.min(2.6, Math.max(1.1, from / 2500));    // longer trip -> longer glide, never a rush
      if (lenis) {
        glideTo(0, secs, easeInOut, () => end(false));
      } else {                                                   // fallback without Lenis
        const t0 = performance.now(), dur = secs * 1000;
        html.style.scrollBehavior = 'auto';
        (function step(now) {
          const t = Math.min(1, (now - t0) / dur);
          window.scrollTo(0, from * (1 - easeInOut(t)));
          if (t < 1 && active) raf = requestAnimationFrame(step); else { html.style.scrollBehavior = ''; end(false); }
        })(t0);
      }
    }, true);
  }
  if (toBottom && lenis) {
    toBottom.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
      const max = html.scrollHeight - window.innerHeight;
      glideTo(max, Math.min(2.6, Math.max(1.1, (max - window.scrollY) / 2500)), easeInOut);
    }, true);
  }

  /* ---------------------------------------------------------------- 2. replaying fade-up + zoom-in */
  const replay = [...document.querySelectorAll('[data-replay]')];
  // how much of a block must be on screen before it plays (so you actually see it): ~30%, or less for very tall blocks
  const needFor = (el, cap) => Math.min(cap, 330 / Math.max(1, el.offsetHeight));
  const STEPS = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4];
  if (reduce || !('IntersectionObserver' in window)) {
    replay.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      const el = en.target;
      if (en.intersectionRatio >= needFor(el, 0.3)) el.classList.add('in');       // properly in view -> play
      else if (!en.isIntersecting) el.classList.remove('in');                      // fully out of view -> reset so it plays again
    }), { threshold: STEPS, rootMargin: '0px 0px -6% 0px' });
    replay.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------- 3. campaigns */
  const cp = document.getElementById('campaigns');
  if (!cp) return;

  // 3a. wrap every number inside the stat blocks so it can count up
  const NUM = /\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/g;
  const TARGETS = '.cp-mv, .cp-bv, .cp-table td, .cp-legend strong, .cp-mn, .cp-ctr, .cp-sub';
  cp.querySelectorAll(TARGETS).forEach((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((tn) => {
      const txt = tn.nodeValue; if (!/\d/.test(txt)) return;
      const frag = document.createDocumentFragment(); let last = 0, m;
      NUM.lastIndex = 0;
      while ((m = NUM.exec(txt))) {
        if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
        const s = document.createElement('span');
        s.className = 'cp-num'; s.dataset.t = m[0];
        s.dataset.v = m[0].replace(/,/g, '');
        s.dataset.d = (m[0].split('.')[1] || '').length;
        s.dataset.g = m[0].indexOf(',') > -1 ? '1' : '';
        s.textContent = m[0];
        frag.appendChild(s); last = m.index + m[0].length;
      }
      if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
      tn.parentNode.replaceChild(frag, tn);
    });
  });
  // stagger index for bars / chart columns (read by the CSS transition-delay)
  cp.querySelectorAll('.cp-stack, .cp-cols, .cp-mix, .cp-split').forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty('--i', i)));

  const fmt = (n, v) => {
    const d = +n.dataset.d;
    return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: !!n.dataset.g });
  };
  const timers = new WeakMap();
  const groups = [...cp.querySelectorAll('.cp-hero, .cp-metrics, .cp-card')];   // each plays on its own, when it is on screen

  function resetGroup(g) {
    const r = timers.get(g); if (r) cancelAnimationFrame(r);
    g.classList.remove('go');
    g.querySelectorAll('.cp-num').forEach((n) => { n.style.minWidth = ''; n.textContent = fmt(n, 0); });
  }

  function startGroup(g) {
    g.classList.remove('go'); void g.offsetWidth; g.classList.add('go');           // restarts the CSS animations and the bars
    const nums = [...g.querySelectorAll('.cp-num')];
    if (!nums.length) return;
    // keep each number's final width so the layout doesn't jump while it counts
    nums.forEach((n) => { n.style.minWidth = ''; n.textContent = n.dataset.t; });
    const widths = nums.map((n) => n.offsetWidth);
    nums.forEach((n, i) => { n.style.minWidth = widths[i] + 'px'; n.textContent = fmt(n, 0); });

    const isTiles = g.classList.contains('cp-metrics');
    const t0 = performance.now(), DUR = 2400;                                      // slow, readable count
    const delay = (i) => (isTiles ? 450 + i * 120 : 650 + Math.min(i, 24) * 55);   // waits for its tile / card to land
    const prev = timers.get(g); if (prev) cancelAnimationFrame(prev);
    (function tick(now) {
      let running = false;
      nums.forEach((n, i) => {
        const t = Math.min(1, Math.max(0, (now - t0 - delay(i)) / DUR));
        if (t >= 1) { if (n.textContent !== n.dataset.t) { n.textContent = n.dataset.t; n.style.minWidth = ''; } return; }
        running = true;
        n.textContent = fmt(n, +n.dataset.v * (1 - Math.pow(1 - t, 3)));           // ease-out, gentle landing
      });
      if (running) timers.set(g, requestAnimationFrame(tick));
    })(t0);
  }

  // 3b. play each block once it is properly on screen; reset when it leaves, so it replays on scroll-back and on tab switch
  if (reduce || !('IntersectionObserver' in window)) {
    groups.forEach((g) => g.classList.add('go'));
  } else {
    groups.forEach(resetGroup);                                                    // everything starts from 0
    groups.forEach((g) => { g._on = false; });
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      const g = en.target;
      if (!g._on && en.intersectionRatio >= needFor(g, 0.35)) { g._on = true; startGroup(g); }
      else if (g._on && !en.isIntersecting) { g._on = false; resetGroup(g); }
    }), { threshold: STEPS, rootMargin: '0px 0px -8% 0px' });
    groups.forEach((g) => io.observe(g));
  }
})();
