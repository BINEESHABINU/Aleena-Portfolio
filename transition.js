// Page transition between index.html and portfolio.html
const wipe = document.querySelector('.page-wipe');
const label = wipe.querySelector('.wipe-label');

// New page just loaded after a transition: start covered, then slide away
if (sessionStorage.getItem('wipe') === '1') {
  sessionStorage.removeItem('wipe');
  label.textContent = sessionStorage.getItem('wipeLabel') || '';
  wipe.classList.add('enter');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    wipe.classList.remove('enter');
    wipe.classList.add('leave');
    setTimeout(() => {
      wipe.style.transition = 'none';
      wipe.classList.remove('leave');
      void wipe.offsetWidth;
      wipe.style.transition = '';
    }, 700);
  }));
}

document.querySelectorAll('a[data-transition]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    const url = link.href;
    const name = link.dataset.label || link.textContent.replace('↗', '').trim();
    label.textContent = name;
    sessionStorage.setItem('wipe', '1');
    sessionStorage.setItem('wipeLabel', name);
    wipe.classList.add('cover');
    setTimeout(() => { window.location.href = url; }, 600);
  });
});

// Back/forward cache: make sure the panel isn't left covering the page
window.addEventListener('pageshow', (e) => { if (e.persisted) wipe.classList.remove('cover'); });
