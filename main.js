/* ===================================================================
   STACKLY — main.js
   GSAP-powered motion system: split-text reveals, scroll triggers,
   specimen-viewport image reveals, canvas molecule background,
   magnetic buttons, custom cursor, dashboard charts.
=================================================================== */

gsap.registerPlugin(ScrollTrigger, SplitText);

/* ---------------------------------------------------------------
   0. Preloader — quick lab-style boot sequence
---------------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
  const pre = document.querySelector('.preloader');
  if (pre) {
    const bar = pre.querySelector('.preloader-bar i');
    const pct = pre.querySelector('.preloader-pct');
    let val = { n: 0 };
    gsap.to(val, {
      n: 100, duration: 1.4, ease: 'power2.inOut',
      onUpdate: () => { if (pct) pct.textContent = Math.round(val.n) + '%'; if (bar) bar.style.width = val.n + '%'; },
      onComplete: () => {
        gsap.to(pre, {
          yPercent: -100, duration: .8, ease: 'power3.inOut', delay: .15,
          onComplete: () => { pre.style.display = 'none'; document.body.classList.remove('lock'); initHero(); }
        });
      }
    });
  } else {
    initHero();
  }
});

/* ---------------------------------------------------------------
   1. Custom cursor
---------------------------------------------------------------- */
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
if (dot && ring && matchMedia('(min-width:901px)').matches) {
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; gsap.to(dot, { x: mx, y: my, duration: .05 }); });
  gsap.ticker.add(() => {
    rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
    gsap.set(ring, { x: rx, y: ry });
  });
  document.querySelectorAll('a, button, .magnetic, .viewport').forEach(el => {
    el.addEventListener('mouseenter', () => gsap.to(ring, { width: 56, height: 56, opacity: .6, duration: .25 }));
    el.addEventListener('mouseleave', () => gsap.to(ring, { width: 34, height: 34, opacity: 1, duration: .25 }));
  });
}

/* ---------------------------------------------------------------
   2. Magnetic buttons
---------------------------------------------------------------- */
document.querySelectorAll('.magnetic').forEach(m => {
  m.addEventListener('mousemove', e => {
    const r = m.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    gsap.to(m, { x: x * 0.25, y: y * 0.4, duration: .4, ease: 'power2.out' });
  });
  m.addEventListener('mouseleave', () => gsap.to(m, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1,.4)' }));
});

/* ---------------------------------------------------------------
   3. Scroll progress bar + navbar state
---------------------------------------------------------------- */
const progress = document.querySelector('.scroll-progress');
const nav = document.querySelector('.nav');
ScrollTrigger.create({
  start: 0, end: 'max', onUpdate: self => { if (progress) progress.style.width = (self.progress * 100) + '%'; }
});
ScrollTrigger.create({
  start: 60, onEnter: () => nav && nav.classList.add('scrolled'),
  onLeaveBack: () => nav && nav.classList.remove('scrolled')
});

/* mobile nav toggle — opens/closes against the same 900px breakpoint used in CSS */
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
const mobileNavQuery = window.matchMedia('(max-width:900px)');

function closeMobileNav() {
  if (links) links.classList.remove('open');
  if (toggle) toggle.classList.remove('open');
  document.body.classList.remove('nav-open-lock');
}
function openMobileNav() {
  if (links) links.classList.add('open');
  if (toggle) toggle.classList.add('open');
  document.body.classList.add('nav-open-lock');
}

if (toggle && links) {
  toggle.addEventListener('click', () => {
    links.classList.contains('open') ? closeMobileNav() : openMobileNav();
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));

  // If the viewport crosses back over the mobile breakpoint (resize or rotate)
  // while the menu is open, close it instead of leaving it stuck open underneath
  // the now-visible desktop nav.
  const handleBreakpointChange = e => { if (!e.matches) closeMobileNav(); };
  if (mobileNavQuery.addEventListener) mobileNavQuery.addEventListener('change', handleBreakpointChange);
  else mobileNavQuery.addListener(handleBreakpointChange); // older Safari fallback

  // Esc also closes it, same as any fullscreen overlay should behave
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileNav(); });
}

/* ---------------------------------------------------------------
   4. Hero text — GSAP SplitText reveal (gsap.com signature move)
---------------------------------------------------------------- */
function initHero() {
  document.querySelectorAll('[data-split]').forEach(el => {
    const type = el.dataset.split || 'chars';
    const split = SplitText.create(el, { type: type === 'lines' ? 'lines' : 'chars, words', mask: type === 'lines' ? 'lines' : undefined });
    const targets = type === 'lines' ? split.lines : split.chars;
    gsap.from(targets, {
      yPercent: 130, opacity: 0, duration: .9, ease: 'expo.out',
      stagger: type === 'lines' ? 0.12 : 0.022,
      delay: parseFloat(el.dataset.delay || 0)
    });
  });

  gsap.from('.hero-tag', { opacity: 0, y: 16, duration: .7, delay: .15, ease: 'power3.out' });
  gsap.from('.hero-sub', { opacity: 0, y: 16, duration: .8, delay: .9, ease: 'power3.out' });
  gsap.from('.hero-actions', { opacity: 0, y: 16, duration: .8, delay: 1.05, ease: 'power3.out' });
  gsap.from('.hero-stats', { opacity: 0, x: 24, duration: .9, delay: 1.15, ease: 'power3.out' });
  gsap.from('.scroll-cue', { opacity: 0, duration: .8, delay: 1.4 });
}
if (!document.querySelector('.preloader')) document.addEventListener('DOMContentLoaded', initHero);

/* Section titles split-on-scroll (re-usable everywhere) */
document.querySelectorAll('.split-title').forEach(el => {
  const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
  gsap.from(split.lines, {
    yPercent: 110, opacity: 0, duration: 1, ease: 'expo.out', stagger: .08,
    scrollTrigger: { trigger: el, start: 'top 85%' }
  });
});

/* ---------------------------------------------------------------
   5. Generic scroll reveals
---------------------------------------------------------------- */
gsap.utils.toArray('.reveal').forEach((el, i) => {
  gsap.to(el, {
    opacity: 1, y: 0, duration: .9, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%' },
    delay: (i % 3) * 0.08
  });
});

/* stagger groups: any [data-stagger] parent animates its children */
document.querySelectorAll('[data-stagger]').forEach(group => {
  const kids = group.children;
  gsap.from(kids, {
    opacity: 0, y: 36, duration: .8, ease: 'power3.out', stagger: .12,
    scrollTrigger: { trigger: group, start: 'top 85%' }
  });
});

/* ---------------------------------------------------------------
   6. Specimen-viewport image reveal (signature element)
---------------------------------------------------------------- */
document.querySelectorAll('.viewport').forEach(vp => {
  const img = vp.querySelector('img');
  const corners = vp.querySelectorAll('.corner');
  const tag = vp.querySelector('.tag');
  const scan = vp.querySelector('.scanline');
  const tl = gsap.timeline({ scrollTrigger: { trigger: vp, start: 'top 80%' } });
  tl.fromTo(vp, { clipPath: 'inset(8% 8% 8% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power4.out' })
    .to(img, { scale: 1, duration: 1.3, ease: 'power3.out' }, 0)
    .to(corners, { opacity: 1, duration: .4, stagger: .05 }, .3)
    .to(tag, { opacity: 1, duration: .4 }, .5);
  if (scan) {
    gsap.set(scan, { top: 0, opacity: .8 });
    tl.to(scan, { top: '100%', duration: 1, ease: 'power1.inOut' }, .15)
      .to(scan, { opacity: 0, duration: .3 }, 1.1);
  }
  /* hover parallax tilt */
  vp.addEventListener('mousemove', e => {
    const r = vp.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5;
    const py = (e.clientY - r.top) / r.height - .5;
    gsap.to(img, { x: px * 18, y: py * 18, duration: .6, ease: 'power2.out' });
  });
  vp.addEventListener('mouseleave', () => gsap.to(img, { x: 0, y: 0, duration: .6 }));
});

/* ---------------------------------------------------------------
   7. Counters
---------------------------------------------------------------- */
document.querySelectorAll('[data-count]').forEach(el => {
  const end = parseFloat(el.dataset.count);
  const dec = el.dataset.count.includes('.') ? 1 : 0;
  const obj = { n: 0 };
  ScrollTrigger.create({
    trigger: el, start: 'top 90%', once: true,
    onEnter: () => gsap.to(obj, {
      n: end, duration: 1.8, ease: 'power2.out',
      onUpdate: () => el.textContent = obj.n.toFixed(dec)
    })
  });
});

/* bars / progress fills */
document.querySelectorAll('[data-fill]').forEach(el => {
  ScrollTrigger.create({
    trigger: el, start: 'top 92%', once: true,
    onEnter: () => gsap.to(el, { width: el.dataset.fill + '%', duration: 1.4, ease: 'power3.out' })
  });
});

/* ---------------------------------------------------------------
   8. FAQ accordion
---------------------------------------------------------------- */
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o => { o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = 0; });
    if (!isOpen) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
  });
});

/* ---------------------------------------------------------------
   9. Process / metric bars in research & dashboard pages
---------------------------------------------------------------- */
gsap.utils.toArray('.process-step').forEach((s, i) => {
  gsap.from(s, { opacity: 0, y: 30, duration: .7, delay: i * .08, scrollTrigger: { trigger: '.process', start: 'top 85%' } });
});

/* ---------------------------------------------------------------
   10. Canvas molecule / network background (hero ambient motion)
   inspired by gsap.com & webflow.com animated hero backgrounds
---------------------------------------------------------------- */
(function molecules() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, points = [];
  const COUNT = matchMedia('(max-width:768px)').matches ? 32 : 64;

  function resize() {
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }
  function init() {
    resize();
    points = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      r: Math.random() * 1.6 + .8
    }));
  }
  function step() {
    ctx.clearRect(0, 0, w, h);
    points.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    });
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i], b = points[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const max = 170 * devicePixelRatio;
        if (d < max) {
          ctx.strokeStyle = `rgba(51,214,163,${(1 - d / max) * .22})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    points.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * devicePixelRatio, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(233,236,236,.5)'; ctx.fill();
    });
    requestAnimationFrame(step);
  }
  window.addEventListener('resize', resize);
  init(); step();
})();

/* ---------------------------------------------------------------
   11. Marquee duplication (so the CSS loop is seamless)
---------------------------------------------------------------- */
document.querySelectorAll('.marquee-track').forEach(track => {
  track.innerHTML += track.innerHTML;
});

/* ---------------------------------------------------------------
   12. Dashboard bar-chart animation (admin/user dashboards)
---------------------------------------------------------------- */
document.querySelectorAll('.chart-wrap .col').forEach(col => {
  const target = col.dataset.h || 40;
  ScrollTrigger.create({
    trigger: col, start: 'top 95%', once: true,
    onEnter: () => gsap.to(col, { height: target + '%', duration: 1.1, ease: 'power3.out' })
  });
});

/* progress list fills (dashboards) */
document.querySelectorAll('.progress-list .pl-bar i').forEach(i => {
  const target = i.dataset.fill || 0;
  ScrollTrigger.create({
    trigger: i, start: 'top 95%', once: true,
    onEnter: () => gsap.to(i, { width: target + '%', duration: 1.2, ease: 'power3.out' })
  });
});

/* ---------------------------------------------------------------
   13. Login role toggle (visual only, front-end demo)
---------------------------------------------------------------- */
document.querySelectorAll('.role-toggle button').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

/* ---------------------------------------------------------------
   14. CTA blobs gentle float
---------------------------------------------------------------- */
gsap.utils.toArray('.cta-blob').forEach((b, i) => {
  gsap.to(b, { x: i ? -40 : 40, y: i ? 30 : -30, duration: 8 + i * 2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
});

/* ---------------------------------------------------------------
   15. Broken-image graceful fallback
---------------------------------------------------------------- */
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', () => {
    img.style.display = 'none';
    if (img.parentElement) img.parentElement.style.background = 'linear-gradient(135deg,var(--ink-3),var(--ink-2))';
  }, { once: true });
});

/* ---------------------------------------------------------------
   17. Stackly auth helpers (demo-only, browser-stored)
   Used by login.html, signup.html, admin-dashboard.html, user-dashboard.html
---------------------------------------------------------------- */
window.StacklyAuth = {
  ACCOUNT_KEY: role => `stackly_${role}_account`,
  SESSION_KEY: 'stackly_session',

  saveAccount(role, data) {
    localStorage.setItem(this.ACCOUNT_KEY(role), JSON.stringify(data));
  },
  getAccount(role) {
    try { return JSON.parse(localStorage.getItem(this.ACCOUNT_KEY(role))); } catch (e) { return null; }
  },
  startSession(role, data) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify({ role, ...data }));
  },
  getSession() {
    try { return JSON.parse(localStorage.getItem(this.SESSION_KEY)); } catch (e) { return null; }
  },
  clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  },
  initials(name) {
    if (!name) return '??';
    const parts = name.replace(/^Dr\.?\s+/i, '').trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  },
  // Prefers ?name=&email= in the URL (works even if localStorage is partitioned
  // across local files), falls back to the stored session, then null.
  resolveSession(expectedRole) {
    const url = new URLSearchParams(window.location.search);
    const urlName = url.get('name');
    if (urlName) {
      const data = { name: urlName, email: url.get('email') || '' };
      this.startSession(expectedRole, data);
      return { role: expectedRole, ...data };
    }
    const session = this.getSession();
    if (session && session.role === expectedRole) return session;
    return null;
  }
};

/* ---------------------------------------------------------------
   18. Active nav link by current page
---------------------------------------------------------------- */
(function activeLink() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
})();