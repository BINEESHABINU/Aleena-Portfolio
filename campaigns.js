/* Campaigns & results: one-click tabs + creative media slots */
(function () {
  const root = document.getElementById('campaigns');
  if (!root) return;

  const pages = [...root.querySelectorAll('.cp-page')];
  const tabs  = [...root.querySelectorAll('.cp-tab')];
  const groupOf = (id) => (id.indexOf('aemob') === 0 ? 'aemob' : id);
  let lastAemob = 'aemob-meta';

  function show(id, updateHash) {
    const page = pages.find((p) => p.id === id);
    if (!page) return;
    if (groupOf(id) === 'aemob') lastAemob = id;

    pages.forEach((p) => {
      const on = p === page;
      p.classList.toggle('active', on);
      p.hidden = !on;
    });
    tabs.forEach((t) => {
      const on = t.dataset.group === groupOf(id);
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
    });
    root.querySelectorAll('.cp-pill').forEach((b) => {
      const on = b.dataset.page === id;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on);
    });

    // keep the chosen tab visible inside the (mobile) tab bar. Only the bar scrolls sideways,
    // never the page, and never on first load.
    if (updateHash) {
      const bar = root.querySelector('.cp-tabs');
      const activeTab = tabs.find((t) => t.classList.contains('active'));
      if (bar && activeTab && bar.scrollWidth > bar.clientWidth) {
        bar.scrollTo({ left: Math.max(0, activeTab.offsetLeft - 16), behavior: 'smooth' });
      }
    }

    // pause any video on a page that is no longer showing
    pages.forEach((p) => { if (!p.classList.contains('active')) p.querySelectorAll('video').forEach((v) => v.pause()); });

    if (updateHash && history.replaceState) history.replaceState(null, '', '#' + id);
  }

  // One click is enough: a single delegated listener
  root.addEventListener('click', (e) => {
    const tab = e.target.closest('.cp-tab');
    if (tab) { show(tab.dataset.group === 'aemob' ? lastAemob : tab.dataset.page, true); return; }
    const pill = e.target.closest('.cp-pill');
    if (pill) show(pill.dataset.page, true);
  });

  // Arrow keys move between tabs
  root.querySelector('.cp-tabs').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = tabs.findIndex((t) => t.classList.contains('active'));
    const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    n.focus(); n.click();
  });

  // Deep link, e.g. portfolio.html#regency
  const start = location.hash.slice(1);
  show(pages.some((p) => p.id === start) ? start : 'aemob-meta', false);

  /* ---------- Creative slots ----------
     Permanent media: add  data-src="assets/img/your-file.jpg"  (or .mp4)  to a
     <div class="cp-creative"> in portfolio.html.
     Clicking an empty slot also lets you preview a file from your device. */
  const picker = document.createElement('input');
  picker.type = 'file'; picker.accept = 'image/*,video/*'; picker.hidden = true;
  root.appendChild(picker);
  let target = null;

  function mount(slot, url, isVideo) {
    slot.querySelectorAll('img, video, .cp-change').forEach((n) => n.remove());
    const el = document.createElement(isVideo ? 'video' : 'img');
    if (isVideo) { el.controls = true; el.playsInline = true; el.preload = 'metadata'; el.muted = true; if (slot.dataset.poster) el.poster = slot.dataset.poster; }
    else { el.alt = slot.querySelector('.cp-tag').textContent; el.loading = 'lazy'; }
    el.src = url;
    // if the file is missing, fall back to the empty "Add" slot instead of a broken player
    el.addEventListener('error', () => {
      if (!slot.dataset.src || slot.dataset.userMedia) return;
      if (isVideo && slot.dataset.poster) {            // can't play here: keep the poster visible
        const im = document.createElement('img'); im.alt = slot.querySelector('.cp-tag').textContent; im.src = slot.dataset.poster;
        el.replaceWith(im); return;
      }
      el.remove(); const c = slot.querySelector('.cp-change'); if (c) c.remove(); slot.classList.remove('has-media');
    }, { once: true });
    slot.prepend(el);
    slot.classList.add('has-media');
  }
  const isVid = (s) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(s);

  root.querySelectorAll('.cp-creative[data-src]').forEach((s) => mount(s, s.dataset.src, isVid(s.dataset.src)));

  root.addEventListener('click', (e) => {
    const change = e.target.closest('.cp-change');
    const slot = e.target.closest('.cp-creative');
    if (!slot) return;
    if (slot.classList.contains('has-media') && !change) return;
    target = slot; picker.click();
  });
  root.addEventListener('keydown', (e) => {
    const slot = e.target.closest && e.target.closest('.cp-creative');
    if (slot && !slot.classList.contains('has-media') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); target = slot; picker.click(); }
  });
  picker.addEventListener('change', () => {
    const f = picker.files && picker.files[0];
    if (f && target) { target.dataset.userMedia = '1'; mount(target, URL.createObjectURL(f), f.type.indexOf('video') === 0); }
    picker.value = '';
  });
})();
