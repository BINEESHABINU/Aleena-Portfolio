// Top-to-bottom reveal for every section.
// A block is revealed once its top edge has reached the screen (also blocks you have
// already scrolled past, e.g. after jumping with the nav, so nothing is ever left hidden).
const items = [...document.querySelectorAll('[data-reveal]')];
let pending = items.slice(), ticking = false;
function checkReveal() {
  ticking = false;
  const line = window.innerHeight - 40;
  pending = pending.filter((el) => {
    if (el.getBoundingClientRect().top < line) { el.classList.add('in'); return false; }
    return true;
  });
  if (!pending.length) {
    window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll);
  }
}
function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(checkReveal); } }
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
window.addEventListener('load', onScroll);
requestAnimationFrame(() => requestAnimationFrame(checkReveal));   // blocks already on screen at load

// Side arrows: scroll to top / bottom, hide when already there
const toTop = document.getElementById('toTop');
const toBottom = document.getElementById('toBottom');
function updateArrows() {
  const y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
  toTop.classList.toggle('off', y < 200);
  toBottom.classList.toggle('off', y > max - 200);
}
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
toBottom.addEventListener('click', () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }));
window.addEventListener('scroll', updateArrows, { passive: true });
window.addEventListener('resize', updateArrows);
updateArrows();
