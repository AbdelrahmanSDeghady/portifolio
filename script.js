// Loader & year
window.addEventListener('load', () => {
  document.getElementById('loader').style.display = 'none';
  document.getElementById('year').textContent = new Date().getFullYear();
});

// Theme toggle with persistence
const root = document.body;
const saved = localStorage.getItem('theme');
if(saved === 'dark') root.classList.add('dark');
const toggleBtn = document.getElementById('themeToggle');
function setIcon(){ toggleBtn.textContent = root.classList.contains('dark') ? '☀️' : '🌙'; }
setIcon();
toggleBtn.addEventListener('click', () => {
  root.classList.toggle('dark');
  localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
  setIcon();
});

// Typewriter
(function(){
  const el = document.getElementById('typewriter');
  if(!el) return;
  const phrases = JSON.parse(el.getAttribute('data-phrases') || '[]');
  let i=0, j=0, deleting=false;
  const speed = () => deleting ? 40 : 70;
  function tick(){
    const p = phrases[i % phrases.length];
    if(!deleting){ j++; el.textContent = p.slice(0,j); if(j===p.length){ deleting=true; setTimeout(tick, 900); return; } }
    else { j--; el.textContent = p.slice(0,j); if(j===0){ deleting=false; i++; } }
    setTimeout(tick, speed());
  }
  tick();
})();

// IntersectionObserver for fade-ins & skill bars
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      e.target.querySelectorAll('.fill').forEach(fill=>{
        const level = getComputedStyle(fill).getPropertyValue('--level') || '0%';
        requestAnimationFrame(()=>{ fill.style.width = level; });
      });
      io.unobserve(e.target);
    }
  });
},{threshold:.2});

document.querySelectorAll('.fade-in, #skills, #projects, .node, .r-card').forEach(el=>io.observe(el));

// Modals
document.querySelectorAll('.more').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const id = btn.getAttribute('data-modal');
    const modal = document.getElementById(id);
    if(modal){ modal.style.display='flex'; modal.setAttribute('aria-hidden','false'); }
  });
});
document.querySelectorAll('.modal').forEach(m=>{
  m.addEventListener('click', (e)=>{
    if(e.target.classList.contains('modal') || e.target.classList.contains('close')){
      m.style.display='none'; m.setAttribute('aria-hidden','true');
    }
  });
});

// Contact form validation
const form = document.getElementById('contactForm');
if(form){
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const name=form.name.value.trim();
    const email=form.email.value.trim();
    const message=form.message.value.trim();
    const setErr=(id,msg)=>{form.querySelector('#'+id).parentElement.querySelector('.error').textContent=msg};
    let ok=true;
    if(!name){ok=false; setErr('name','Enter your name');} else setErr('name','');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ok=false; setErr('email','Enter a valid email');} else setErr('email','');
    if(!message){ok=false; setErr('message','Write a message');} else setErr('message','');
    if(ok){ alert('Thanks! Your message passed validation (demo).'); form.reset(); }
  });
}
