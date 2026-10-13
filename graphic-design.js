/* Graphic design: click a card to view the full artwork */
(function () {
  const root = document.getElementById('graphic-design');
  if (!root) return;

  const v = document.createElement('div');
  v.className = 'gd-viewer'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true'); v.setAttribute('aria-label', 'Artwork viewer');
  v.innerHTML = '<button type="button" class="gd-viewer-close" aria-label="Close">&times;</button><img alt="">';
  document.body.appendChild(v);
  const img = v.querySelector('img');
  let opener = null;

  function open(btn) {
    opener = btn; img.src = btn.dataset.full; img.alt = btn.dataset.alt || '';
    v.classList.add('open'); requestAnimationFrame(() => v.classList.add('show'));
    document.documentElement.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();
    v.querySelector('.gd-viewer-close').focus();
  }
  function close() {
    v.classList.remove('show');
    setTimeout(() => { v.classList.remove('open'); img.removeAttribute('src'); }, 280);
    document.documentElement.style.overflow = '';
    if (window.lenis) window.lenis.start();
    if (opener) opener.focus();
  }
  root.addEventListener('click', (e) => { const b = e.target.closest('.gd-inner'); if (b) open(b); });
  v.addEventListener('click', (e) => { if (e.target !== img) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && v.classList.contains('open')) close(); });
})();
