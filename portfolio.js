// Scroll-up reveal for every section
const items = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add('in'));
}

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
