/* ==========================================================
   SHARED SITE SCRIPT
   Loaded on every page (index, projects, music, videos).
   Each block below is independent and no-ops safely on pages
   that don't have the elements it looks for.
========================================================== */

/* ---------- Mobile nav toggle ---------- */
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', isOpen);
    menuToggle.innerHTML = isOpen
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
  });

  // Close the mobile menu after tapping any link in it
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', false);
      menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
  });
}

/* ---------- Active nav link, based on the current page ----------
   Projects/Music/Videos are now real pages instead of in-page anchors,
   so "active" is just: does this link's filename match the page
   we're currently on? (About/Contact stay unhighlighted since they're
   anchors on the homepage, not standalone pages.) */
const currentFile = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const hrefFile = link.getAttribute('href').split('#')[0];
  if (hrefFile && hrefFile !== 'index.html' && hrefFile === currentFile) {
    link.classList.add('active');
  }
});

/* ---------- Scroll reveal ----------
   Tag key blocks, then fade/rise each one in the first time it
   enters the viewport. Cards get a staggered delay via CSS
   (nth-child rules in style.css) so a row doesn't pop in all at once. */
document.querySelectorAll(
  '.section-head, .about-text, .skills-grid, .contact-info, form, .cards-grid .card'
).forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target); // only need to animate once
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---------- Music & video play icons ----------
   Clicking anywhere on the artwork opens the same link as the card's
   "Listen on Spotify" / "Watch on YouTube" button, so the play icon
   is a real control rather than a decoration that does nothing. */
document.querySelectorAll('.music .card, .videos .card').forEach(card => {
  const media = card.querySelector('.card-media');
  const link = card.querySelector('.card-body a[href]');
  if (media && link) {
    media.addEventListener('click', () => window.open(link.href, '_blank', 'noopener'));
  }
});


/* ---------- Mobile tab bar: highlight the current page ---------- */
document.querySelectorAll('.tabbar a').forEach(a => {
  const tab = a.dataset.tab;
  if (tab === currentFile || (tab === 'index.html' && currentFile === '')) a.classList.add('active');
});

/* ---------- Stats: count up once when they scroll into view ---------- */
const countEls = document.querySelectorAll('[data-count]');
if (countEls.length && 'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target, end = +el.dataset.count, t0 = performance.now();
      const tick = now => {
        const p = Math.min((now - t0) / 900, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      el.textContent = '0';
      requestAnimationFrame(tick);
      countObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  countEls.forEach(el => countObs.observe(el));
}


/* ---------- Preloader ----------
   Shows once per visit (sessionStorage), stays at least ~1s so the
   animation reads as intentional, then fades once the page has loaded.
   A 3s cap makes sure a slow image can never keep it up. */
const preloader = document.getElementById('preloader');
if (preloader) {
  if (document.documentElement.classList.contains('no-preload')) {
    preloader.remove();
  } else {
    const plStart = performance.now();
    let plDone = false;
    const hidePreloader = () => {
      if (plDone) return;
      plDone = true;
      const wait = Math.max(0, 1100 - (performance.now() - plStart));
      setTimeout(() => {
        preloader.classList.add('done');
        try { sessionStorage.setItem('pl', '1'); } catch (e) {}
        setTimeout(() => preloader.remove(), 700);
      }, wait);
    };
    if (document.readyState === 'complete') hidePreloader();
    else window.addEventListener('load', hidePreloader);
    setTimeout(hidePreloader, 3000);
  }
}
