// ===== DETECT TOUCH DEVICE (mobile / tablet) =====
const isTouch = window.matchMedia('(hover:none) and (pointer:coarse)').matches
  || 'ontouchstart' in window;

// ===== NAVIGATION =====
function goTo(id) {
  const pages = { hero:'index.html', about:'about.html', skills:'skills.html', projects:'projects.html', experience:'experience.html', education:'education.html', contact:'contact.html' };
  if (pages[id]) window.location.href = pages[id];
}
function mobileGo(id) {
  closeMobileMenu();
  setTimeout(() => goTo(id), 80);
}
function toggleMenu(e) { e.stopPropagation(); document.getElementById('mobileMenu').classList.toggle('open'); }
function closeMobileMenu() { document.getElementById('mobileMenu').classList.remove('open'); }
document.addEventListener('click', function(e) {
  const menu = document.getElementById('mobileMenu');
  const btn = document.getElementById('menuBtn');
  if (menu && !menu.contains(e.target) && e.target !== btn) menu.classList.remove('open');
});

// ===== ACTIVE NAV LINK =====
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const map = { 'index.html':'hero', 'about.html':'about', 'skills.html':'skills', 'projects.html':'projects', 'experience.html':'experience', 'education.html':'education', 'contact.html':'contact' };
  const activeId = map[page];
  document.querySelectorAll('.nav-links button, .mobile-menu button').forEach(btn => {
    const onclick = btn.getAttribute('onclick') || '';
    if (onclick.includes(`'${activeId}'`)) btn.classList.add('active');
  });
}

// ===== CURSOR (desktop only — disabled on touch devices) =====
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

if (!isTouch) {
  let lastTrail = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    // Throttle trail creation so we don't flood the DOM (was causing scroll lag)
    const now = Date.now();
    if (now - lastTrail > 40) { addTrail(mx, my); lastTrail = now; }
  }, { passive: true });
  document.querySelectorAll('button, a, .card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor && cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('hover'));
  });

  function animateCursor() {
    if (cursor) { cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; }
    rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
    if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
} else {
  // Hide the custom cursor elements completely on touch screens
  if (cursor) cursor.style.display = 'none';
  if (ring) ring.style.display = 'none';
}

function addTrail(x, y) {
  if (isTouch) return; // no trail on touch
  const trailEl = document.createElement('div');
  trailEl.style.cssText = `position:fixed;width:4px;height:4px;background:var(--cyan);border-radius:50%;pointer-events:none;z-index:9996;left:${x}px;top:${y}px;transform:translate(-50%,-50%);opacity:0.6;transition:opacity 0.4s,transform 0.4s;`;
  document.body.appendChild(trailEl);
  setTimeout(() => { trailEl.style.opacity = '0'; trailEl.style.transform = 'translate(-50%,-50%) scale(0)'; }, 50);
  setTimeout(() => trailEl.remove(), 500);
}

// ===== PARTICLES =====
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const colors = ['rgba(0,245,255,', 'rgba(139,47,255,', 'rgba(255,45,120,', 'rgba(0,255,170,'];
  // Fewer particles on mobile for smoother performance
  const count = isTouch ? 40 : 80;
  const parts = Array.from({length: count}, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    r: Math.random() * 1.8 + 0.3,
    dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4,
    a: Math.random() * 0.5 + 0.1,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parts.forEach(p => {
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.a + ')'; ctx.fill();
    });
    parts.forEach((p, i) => parts.slice(i+1).forEach(q => {
      const d = Math.hypot(p.x-q.x, p.y-q.y);
      if (d < 120) {
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
        ctx.strokeStyle = `rgba(0,245,255,${0.06*(1-d/120)})`; ctx.lineWidth=0.5; ctx.stroke();
      }
    }));
    requestAnimationFrame(draw);
  }
  draw();
}

// ===== REVEAL ON SCROLL =====
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 100);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale').forEach(r => obs.observe(r));
}

// ===== SKILL BARS =====
function initSkillBars() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-bar-fill').forEach(b => {
          setTimeout(() => b.style.width = b.dataset.width + '%', 200);
        });
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.skill-bar-section').forEach(s => obs.observe(s));
}

// ===== COUNTER ANIMATION =====
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.round(current) + (el.dataset.suffix || '');
    if (current >= target) clearInterval(timer);
  }, 16);
}
function initCounters() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-target]').forEach(el => animateCounter(el));
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stats-grid').forEach(s => obs.observe(s));
}

// ===== TYPED EFFECT =====
function initTyped(elementId, phrases) {
  const el = document.getElementById(elementId);
  if (!el) return;
  let pi = 0, ci = 0, del = false;
  function type() {
    const ph = phrases[pi];
    if (!del) { el.textContent = ph.slice(0, ++ci); if (ci === ph.length) { del = true; setTimeout(type, 2000); return; } }
    else { el.textContent = ph.slice(0, --ci); if (ci === 0) { del = false; pi = (pi+1) % phrases.length; } }
    setTimeout(type, del ? 35 : 75);
  }
  type();
}

// ===== PAGE LOAD ANIMATION =====
function initPageLoad() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';
  window.addEventListener('load', () => { document.body.style.opacity = '1'; });
}

// ===== INIT ALL =====
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initParticles();
  initReveal();
  initSkillBars();
  initCounters();
  initPageLoad();
});

// ===== THEME TOGGLE (dark/light) =====
function applyTheme(theme) {
  const btn = document.getElementById('themeToggleBtn');
  if (theme === 'light') {
    document.body.classList.add('light-mode');
    if (btn) btn.textContent = '☀️';
  } else {
    document.body.classList.remove('light-mode');
    if (btn) btn.textContent = '🌙';
  }
}
function toggleTheme() {
  const isLight = document.body.classList.contains('light-mode');
  const next = isLight ? 'dark' : 'light';
  applyTheme(next);
  try { localStorage.setItem('sp-theme', next); } catch (e) {}
}
(function initTheme() {
  let saved = 'dark';
  try { saved = localStorage.getItem('sp-theme') || 'dark'; } catch (e) {}
  applyTheme(saved);
})();
