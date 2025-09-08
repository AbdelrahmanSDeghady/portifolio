// ===== LOADER & YEAR =====
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'none';
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
});

// ===== THEME TOGGLE (persistent) =====
const root = document.body;
const saved = localStorage.getItem('theme');
if (saved === 'dark') root.classList.add('dark');
const toggleBtn = document.getElementById('themeToggle');
function setThemeIcon() {
  if (!toggleBtn) return;
  toggleBtn.textContent = root.classList.contains('dark') ? '☀️' : '🌙';
}
setThemeIcon();
toggleBtn?.addEventListener('click', () => {
  root.classList.toggle('dark');
  localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
  setThemeIcon();
});

// ===== TYPEWRITER =====
(() => {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const phrases = JSON.parse(el.getAttribute('data-phrases') || '[]');
  let i = 0, j = 0, deleting = false;
  const speed = () => (deleting ? 40 : 70);
  function tick() {
    const p = phrases[i % phrases.length] || '';
    if (!deleting) {
      j++;
      el.textContent = p.slice(0, j);
      if (j === p.length) { deleting = true; setTimeout(tick, 900); return; }
    } else {
      j--;
      el.textContent = p.slice(0, j);
      if (j === 0) { deleting = false; i++; }
    }
    setTimeout(tick, speed());
  }
  tick();
})();

// ===== INTERSECTION OBSERVER: fade-ins + skill bars =====
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      e.target.querySelectorAll('.fill').forEach(fill => {
        const level = getComputedStyle(fill).getPropertyValue('--level') || '0%';
        requestAnimationFrame(() => { fill.style.width = level; });
      });
      io.unobserve(e.target);
    }
  });
}, { threshold: .2 });

document.querySelectorAll('.fade-in, #skills, #projects, .node, .r-card').forEach(el => io.observe(el));

// ===== MODALS =====
document.querySelectorAll('.more').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-modal');
    const modal = document.getElementById(id);
    if (modal) { modal.style.display = 'flex'; modal.setAttribute('aria-hidden', 'false'); }
  });
});
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal') || e.target.classList.contains('close')) {
      m.style.display = 'none'; m.setAttribute('aria-hidden', 'true');
    }
  });
});

// Mobile menu toggle (robust)
(() => {
  const burger = document.querySelector('.hamburger');
  const menu   = document.getElementById('siteMenu');
  if (!burger || !menu) return;

  const open  = () => {
    menu.classList.add('open');
    burger.setAttribute('aria-expanded','true');
    document.body.classList.add('noscroll');
  };
  const close = () => {
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded','false');
    document.body.classList.remove('noscroll');
  };

  burger.addEventListener('click', () =>
    menu.classList.contains('open') ? close() : open()
  );

  // 1) close when a nav link is tapped
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // 2) close when tapping outside the links (menu background)
  menu.addEventListener('click', (e) => {
    if (e.target === menu) close();
  });

  // 3) close on ESC
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // 4) close if the page scrolls (user starts reading)
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (menu.classList.contains('open') && Math.abs(window.scrollY - lastY) > 5) close();
    lastY = window.scrollY;
  }, { passive:true });
})();


// ===== HERO SLIDESHOW (optional; uses .hero-slides if present) =====
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const container = document.querySelector('.hero-slides');
  if (!container) return;

  const images = [
    'res/1.jpg', // headshot
    'res/2.jpg', // conference
    // add more (e.g., 'res/3.jpg')
  ];

  // Build slides
  const slides = images.map((src, i) => {
    const el = document.createElement('div');
    el.className = 'hs-slide' + (i === 0 ? ' is-active' : '');
    el.style.backgroundImage = `url('${src}')`;
    container.appendChild(el);
    return el;
  });

  // Dots & buttons
  const dotsWrap = document.querySelector('.hs-dots');
  const btnPrev = document.querySelector('.hs-btn.prev');
  const btnNext = document.querySelector('.hs-btn.next');

  const dots = images.map((_, i) => {
    const d = document.createElement('button');
    d.className = 'hs-dot' + (i === 0 ? ' is-active' : '');
    d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', `Go to slide ${i+1}`);
    dotsWrap?.appendChild(d);
    d.addEventListener('click', () => go(i, true));
    return d;
  });

  let index = 0;
  let timer;
  const AUTOPLAY_MS = 6000;

  function go(nextIndex, user = false) {
    if (nextIndex === index) return;
    slides[index].classList.remove('is-active');
    dots[index]?.classList.remove('is-active');
    index = (nextIndex + slides.length) % slides.length;
    slides[index].classList.add('is-active');
    dots[index]?.classList.add('is-active');
    if (user) restart();
  }
  function next(){ go(index + 1); }
  function prev(){ go(index - 1); }

  function start(){ if (!reduceMotion) timer = setInterval(next, AUTOPLAY_MS); }
  function stop(){ clearInterval(timer); }
  function restart(){ stop(); start(); }

  btnNext?.addEventListener('click', () => { next(); restart(); });
  btnPrev?.addEventListener('click', () => { prev(); restart(); });

  // Pause on hover (desktop only)
  container.addEventListener('mouseenter', stop);
  container.addEventListener('mouseleave', start);

  start();
})();

// ===== CONTACT FORM: validate + send (endpoint or mailto) =====
(() => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const setErr = (id, msg) => {
    const field = form.querySelector('#' + id);
    if (!field) return;
    const box = field.parentElement?.querySelector('.error');
    if (box) box.textContent = msg || '';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    let ok = true;
    if (!name){ ok = false; setErr('name','Enter your name'); } else setErr('name','');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ ok = false; setErr('email','Enter a valid email'); } else setErr('email','');
    if (!message){ ok = false; setErr('message','Write a message'); } else setErr('message','');
    if (!ok) return;

    const endpoint = (form.dataset.endpoint || '').trim();

    try{
      if (endpoint){
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name, email, message })
        });
        if (resp.ok){
          alert('Thanks! Your message was sent successfully.');
          form.reset();
          return;
        }
        // If endpoint returns error, fall back to mailto
        throw new Error('Endpoint error ' + resp.status);
      }

      // mailto fallback
      const subject = encodeURIComponent('New message from ' + name);
      const body = encodeURIComponent('From: ' + name + ' <' + email + '>' + '\n\n' + message);
      window.location.href = 'mailto:bbnhd3333@gmail.com?subject=' + subject + '&body=' + body;
    }catch(err){
      console.error(err);
      const subject = encodeURIComponent('New message from ' + name);
      const body = encodeURIComponent('From: ' + name + ' <' + email + '>' + '\n\n' + message);
      window.location.href = 'mailto:bbnhd3333@gmail.com?subject=' + subject + '&body=' + body;
    }
  }, { once:false });
})();
