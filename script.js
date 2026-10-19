(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.querySelector('.desktop-nav');
  const header = document.querySelector('.site-header');
  const progress = document.getElementById('progress');
  const heroArt = document.getElementById('heroArt');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('portfolio-theme'); } catch (_) {}
  if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;

  function updateThemeButton() {
    const light = root.dataset.theme === 'light';
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', light ? '#f5f6f4' : '#0b0f17');
  }
  updateThemeButton();

  themeToggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('portfolio-theme', root.dataset.theme); } catch (_) {}
    updateThemeButton();
  });

  /* ---------- Mobile nav ---------- */
  function closeMenu() {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  }
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    nav.classList.toggle('open', !isOpen);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

  /* ---------- Scroll progress + sticky header ---------- */
  let ticking = false;
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
    header.classList.toggle('scrolled', window.scrollY > 20);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Staggered skill cards ---------- */
  document.querySelectorAll('.skill-card').forEach((card, i) => card.style.setProperty('--i', i));

  /* ---------- Reveal on scroll ---------- */
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  /* ---------- Active nav link (scroll spy) ---------- */
  const links = [...nav.querySelectorAll('a')];
  const targets = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(t => spy.observe(t));
    const heroEl = document.getElementById('home');
    new IntersectionObserver(([e]) => { if (e.isIntersecting) links.forEach(a => a.classList.remove('active')); }, { rootMargin: '-45% 0px -50% 0px' }).observe(heroEl);
  }

  /* ---------- Hero mouse parallax (desktop only) ---------- */
  if (heroArt && !reduceMotion && window.matchMedia('(hover: hover) and (min-width: 901px)').matches) {
    const layers = [
      ['.orb-core', 14], ['.orbit-one', -8], ['.orbit-two', 6],
      ['.code-one', 22], ['.code-two', -20], ['.star-one', 28], ['.star-two', -26]
    ].map(([sel, depth]) => [heroArt.querySelector(sel), depth]);
    const hero = document.getElementById('home');
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach(([el, d]) => {
        if (!el) return;
        el.style.translate = `${x * d}px ${y * d}px`;
      });
    });
    hero.addEventListener('mouseleave', () => layers.forEach(([el]) => { if (el) el.style.translate = '0 0'; }));
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
