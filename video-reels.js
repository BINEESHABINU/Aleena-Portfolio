/* Video & Reels: filter pills, big player, 3-visible scrolling list */
(function () {
  const root = document.getElementById('video-reels');
  if (!root) return;

  const stage   = root.querySelector('#vrStage');
  const video   = stage.querySelector('.vr-video');
  const blur    = stage.querySelector('.vr-blur');
  const badge   = stage.querySelector('.vr-stage-badge');
  const nameNum = stage.querySelector('.vr-stage-name b');
  const nameTxt = stage.querySelector('.vr-stage-name em');
  const durEl   = stage.querySelector('.vr-stage-dur');
  const playBtn = stage.querySelector('.vr-play');
  const side    = root.querySelector('.vr-side');
  const list    = root.querySelector('#vrList');
  const items   = [...list.querySelectorAll('.vr-item')];
  const filters = [...root.querySelectorAll('.vr-filter')];
  const BADGE   = { ai: ['AI', 'ai'], reels: ['REELS', ''], interviews: ['INTERVIEWS', ''] };
  let current = null;

  function select(item, play) {
    if (!item) return;
    current = item;
    items.forEach((i) => i.classList.toggle('active', i === item));

    video.pause(); video.removeAttribute('controls');
    stage.classList.remove('is-playing', 'is-error');
    video.src = item.dataset.src;
    if (item.dataset.poster) { video.poster = item.dataset.poster; blur.src = item.dataset.poster; }
    else { video.removeAttribute('poster'); blur.removeAttribute('src'); }
    video.load();

    const b = BADGE[item.dataset.cat] || ['', ''];
    badge.textContent = b[0]; badge.className = 'vr-badge vr-stage-badge ' + b[1];
    nameNum.textContent = item.dataset.num; nameTxt.textContent = item.dataset.label;
    durEl.textContent = item.dataset.dur;
    if (play) start();
  }

  function start() {
    const p = video.play();
    if (p && p.then) p.then(() => { stage.classList.add('is-playing'); video.setAttribute('controls', ''); })
                      .catch(() => { stage.classList.add('is-error'); });
  }

  // a missing / unreadable file shows the friendly "coming soon" panel
  video.addEventListener('error', () => stage.classList.add('is-error'));
  video.addEventListener('ended', () => { stage.classList.remove('is-playing'); video.removeAttribute('controls'); });
  video.addEventListener('pause', () => { if (!video.ended && video.currentTime < 0.05) stage.classList.remove('is-playing'); });
  // use the real duration once the browser knows it
  video.addEventListener('loadedmetadata', () => {
    if (!isFinite(video.duration) || !current) return;
    const s = Math.round(video.duration), t = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    durEl.textContent = t; current.dataset.dur = t; const d = current.querySelector('.vr-dur'); if (d) d.textContent = t;
  });

  playBtn.addEventListener('click', () => { if (current) start(); });
  items.forEach((it) => it.addEventListener('click', () => select(it, true)));

  /* ---- filters ---- */
  filters.forEach((f) => f.addEventListener('click', () => {
    filters.forEach((x) => { const on = x === f; x.classList.toggle('active', on); x.setAttribute('aria-selected', on); });
    const cat = f.dataset.filter;
    items.forEach((it, i) => {
      const show = cat === 'all' || it.dataset.cat === cat;
      it.hidden = !show;
      if (show) { it.style.animation = 'none'; void it.offsetWidth; it.style.animation = ''; it.style.animationDelay = (i % 6) * 40 + 'ms'; }
    });
    list.scrollTo({ top: 0, behavior: 'auto' });
    select(items.find((it) => !it.hidden), false);
    update();
  }));

  /* ---- scrolling list: fade edges + arrows, no visible scrollbar ---- */
  function update() {
    const max = list.scrollHeight - list.clientHeight;
    const top = list.scrollTop <= 2, bottom = list.scrollTop >= max - 2;
    list.classList.toggle('at-top', top);
    list.classList.toggle('at-bottom', bottom || max <= 2);
    side.classList.toggle('can-up', !top && max > 2);
    side.classList.toggle('can-down', !bottom && max > 2);
  }
  list.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  window.addEventListener('resize', update);
  const step = () => (items.find((i) => !i.hidden) || { offsetHeight: 100 }).offsetHeight + 14;
  root.querySelector('.vr-arrow.up').addEventListener('click', () => list.scrollBy({ top: -step(), behavior: 'smooth' }));
  root.querySelector('.vr-arrow.down').addEventListener('click', () => list.scrollBy({ top: step(), behavior: 'smooth' }));
  list.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); list.scrollBy({ top: step(), behavior: 'smooth' }); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); list.scrollBy({ top: -step(), behavior: 'smooth' }); }
  });

  // pause the video when the section leaves the screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) video.pause(); }), { threshold: 0.1 }).observe(root);
  }

  select(items[0], false);
  requestAnimationFrame(update);
  window.addEventListener('load', update);
})();
