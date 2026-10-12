// Brands logo carousel: two rows moving in opposite directions.
// Logos live in assets/brands/ (backgrounds already removed).
// tone: 'light' = light tile (for dark logos), omitted = dark tile (for light logos).
(function () {
  const BRANDS = [
    ['Sawia Developers and Interiors', 'sawia.png', 'light'],
    ['Nagas', 'nagas.png'],
    ['Hoy Punjab', 'hoy-punjab.png'],
    ['Hoy Momo', 'hoy-momo.png'],
    ['Hottey Smokey', 'hottey-smokey.png'],
    ['Majestic Event Qatar', 'majestic.png'],
    ['Fly Over Wonders Qatar', 'flyover-wonders.png', 'light'],
    ['Snoonu', 'snoonu.png'],
    ['Regency Sealine Camp', 'regency-sealine.png', 'light'],
    ['Ramada Encore Doha Hotel', 'ramada-encore.png', 'light'],
    ['Nextfairs', 'nextfairs.png', 'light'],
    ['Qatar Travel Mart', 'qtm.png', 'light'],
    ['Build Your House Qatar', 'byh.png', 'light'],
    ['Inspire for Home', 'inspire-for-home.png', 'light'],
    ['Qatar Thoracic Society', 'qitc.png', 'light'],
    ['Zita Nadege Foundation', 'zita.png', 'light'],
    ['Weill Cornell Medicine – Qatar', 'wcm-qatar.png', 'light'],
    ['Palmyra Hotel', 'palmyra.png'],
    ['Zoka Jewelry', 'zoka.png'],
  ];

  const root = document.querySelector('[data-brands]');
  if (!root) return;

  function tile(name, file, tone, clone) {
    const d = document.createElement('div');
    d.className = 'lm-item' + (tone === 'light' ? ' light' : '');
    d.title = name;
    if (clone) d.setAttribute('aria-hidden', 'true'); else d.setAttribute('role', 'listitem');
    const img = new Image();
    img.alt = clone ? '' : name;
    img.decoding = 'async';
    img.draggable = false;
    img.src = 'assets/brands/' + file;
    img.addEventListener('error', () => {
      const s = document.createElement('span'); s.className = 'lm-word'; s.textContent = name; img.replaceWith(s);
    });
    d.appendChild(img);
    return d;
  }

  const rows = [BRANDS.filter((_, i) => i % 2 === 0), BRANDS.filter((_, i) => i % 2 === 1)];
  const built = rows.map((list, r) => {
    const set = [...list, ...list];                 // wide enough for big screens
    const row = document.createElement('div');
    row.className = 'lm-row' + (r ? ' rev' : '');
    row.setAttribute('role', 'list');
    const track = document.createElement('div');
    track.className = 'lm-track';
    track.style.setProperty('--dur', (set.length * (r ? 3.6 : 4.2)) + 's');
    set.forEach(([n, f, t]) => track.appendChild(tile(n, f, t, false)));
    set.forEach(([n, f, t]) => track.appendChild(tile(n, f, t, true)));   // identical 2nd half = seamless loop
    row.appendChild(track);
    root.appendChild(row);
    return row;
  });

  /* Touch / press stops the movement. It starts again a moment after the finger
     lifts (HOLD_MS). Mouse users: hover stops it (done in CSS). */
  const HOLD_MS = 2500;
  let timer = null;
  const stop = () => { clearTimeout(timer); root.classList.add('is-paused'); };
  const go = (delay) => { clearTimeout(timer); timer = setTimeout(() => root.classList.remove('is-paused'), delay); };

  root.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') stop(); });
  ['pointerup', 'pointercancel'].forEach((ev) => root.addEventListener(ev, (e) => { if (e.pointerType !== 'mouse') go(HOLD_MS); }));
  // touching anywhere else on the page lets it run again
  document.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' && !root.contains(e.target)) go(0); }, { passive: true });
})();
