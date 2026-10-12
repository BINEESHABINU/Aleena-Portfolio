/* Resume button: opens a viewer with the CV pages + Download / Open options */
(function () {
  const btn = document.getElementById('resumeBtn');
  if (!btn) return;

  const PDF = btn.getAttribute('href');                       // assets/resume/Aleena_Vahab_CV.pdf
  const PAGES = ['assets/resume/resume-page-1.jpg', 'assets/resume/resume-page-2.jpg'];
  const FILE_NAME = 'Aleena_Vahab_CV.pdf';

  const v = document.createElement('div');
  v.className = 'rv'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true'); v.setAttribute('aria-label', 'Resume');
  v.innerHTML =
    '<div class="rv-panel">' +
      '<div class="rv-bar">' +
        '<div class="rv-title"><small>Curriculum vitae</small>Aleena Vahab · Resume</div>' +
        '<a class="rv-btn primary" href="' + PDF + '" download="' + FILE_NAME + '">' +
          '<svg viewBox="0 0 24 24"><path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14"/></svg>Download</a>' +
        '<a class="rv-btn" href="' + PDF + '" target="_blank" rel="noopener">' +
          '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5"/></svg>Open</a>' +
        '<button type="button" class="rv-btn rv-close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="rv-body">' + PAGES.map((p, i) => '<img alt="Resume page ' + (i + 1) + '" decoding="async">').join('') + '</div>' +
    '</div>';
  document.body.appendChild(v);

  const imgs = [...v.querySelectorAll('.rv-body img')];
  const closeBtn = v.querySelector('.rv-close');
  let loaded = false;

  function open(e) {
    if (e) e.preventDefault();
    if (!loaded) { imgs.forEach((im, i) => { im.src = PAGES[i]; }); loaded = true; }   // load only when first opened
    v.classList.add('open');
    requestAnimationFrame(() => v.classList.add('show'));
    document.documentElement.style.overflow = 'hidden';
    v.querySelector('.rv-body').scrollTop = 0;
    closeBtn.focus();
  }
  function close() {
    v.classList.remove('show');
    setTimeout(() => v.classList.remove('open'), 280);
    document.documentElement.style.overflow = '';
    btn.focus();
  }

  btn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  v.addEventListener('click', (e) => { if (e.target === v) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && v.classList.contains('open')) close(); });
})();
