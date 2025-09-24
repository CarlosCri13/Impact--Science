// Drawer (hamburguesa)
const body = document.body;
const burger = document.getElementById('hamburger');
const closeBtn = document.getElementById('closeDrawer');
const drawer = document.getElementById('mobile-drawer');
const overlay = document.getElementById('drawerOverlay');

function openDrawer(){
  body.classList.add('drawer-open');
  overlay.hidden = false;
  drawer.setAttribute('aria-hidden','false');
  burger.setAttribute('aria-expanded','true');
  body.style.overflow = 'hidden';          // bloquear scroll
  const firstLink = drawer.querySelector('a');
  if(firstLink) firstLink.focus();
}
function closeDrawer(){
  body.classList.remove('drawer-open');
  overlay.hidden = true;
  drawer.setAttribute('aria-hidden','true');
  burger.setAttribute('aria-expanded','false');
  body.style.overflow = '';
  burger.focus();
}

burger.addEventListener('click', openDrawer);
closeBtn.addEventListener('click', closeDrawer);
overlay.addEventListener('click', closeDrawer);
window.addEventListener('keydown', e => {
  if(e.key === 'Escape' && body.classList.contains('drawer-open')) closeDrawer();
});
drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

// Smart hide/show del header al hacer scroll
const headerWrap = document.querySelector('.header-wrap');
let lastY = window.scrollY || 0;
let ticking = false;
const revealOffset = 8;   // subir para mostrar
const hideOffset   = 12;  // bajar para ocultar
const minTop       = 60;  // no ocultar muy arriba

function onScroll() {
  const y = window.scrollY || 0;
  const delta = y - lastY;

  if (y < minTop) {
    headerWrap.classList.remove('--hidden');
    headerWrap.classList.add('--pinned');
    lastY = y; ticking = false; return;
  }
  if (delta > hideOffset) {
    headerWrap.classList.add('--hidden');
    headerWrap.classList.remove('--pinned');
  } else if (delta < -revealOffset) {
    headerWrap.classList.remove('--hidden');
    headerWrap.classList.add('--pinned');
  }
  lastY = y; ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
}, { passive: true });

// Estado inicial
headerWrap.classList.add('--pinned');


/* ====== CAROUSEL + fondo extendido del hero ====== */
(function(){
  const track    = document.querySelector('.car-track');
  const slides   = Array.from(document.querySelectorAll('.car-slide'));
  const prevBtn  = document.querySelector('.car-prev');
  const nextBtn  = document.querySelector('.car-next');
  const dotsWrap = document.querySelector('.car-dots');
  const hero     = document.querySelector('.hero'); // <- contenedor para el fondo extendido

  if(!track || slides.length === 0) return;

  // --- util: obtiene la URL de imagen del slide (soporta <img> o --bg:url(...)) ---
  function getSlideUrl(slide){
    // Caso 1: usas la variante con CSS var: <li class="car-slide" style="--bg:url('...')">
    const bgVar = slide.style.getPropertyValue('--bg');
    if (bgVar && bgVar.trim().length) return bgVar.trim();   // ya incluye url('...')

    // Caso 2: usas <img src="...">
    const img = slide.querySelector('img');
    if (img && img.src) return `url('${img.src}')`;

    return null;
  }

  // Pinta la imagen del slide activo como fondo de .hero (difuminado vía CSS)
  function setHeroBg(i){
    if (!hero) return;
    const url = getSlideUrl(slides[i]);
    if (url) hero.style.setProperty('--hero-bg', url);
  }

  // Crear dots si hay contenedor de dots
  let dots = [];
  if (dotsWrap) {
    slides.forEach((_,i)=>{
      const b = document.createElement('button');
      b.className = 'car-dot' + (i===0 ? ' is-active' : '');
      b.setAttribute('aria-label', `Ir al slide ${i+1}`);
      b.addEventListener('click', ()=>goTo(i, true));
      dotsWrap.appendChild(b);
    });
    dots = Array.from(dotsWrap.children);
  }

  let index = 0;
  let timer = null;
  const DURATION = 5000;

  function update(){
    track.style.transform = `translateX(-${index*100}%)`;
    slides.forEach((s,i)=>s.classList.toggle('is-active', i===index));
    if (dots.length) dots.forEach((d,i)=>d.classList.toggle('is-active', i===index));
    setHeroBg(index); // <<< sincroniza el fondo extendido del hero
  }
  function goTo(i, user=false){
    index = (i + slides.length) % slides.length;
    update();
    if(user) restartAuto();
  }
  function next(){ goTo(index+1) }
  function prev(){ goTo(index-1) }

  function startAuto(){ stopAuto(); timer = setInterval(next, DURATION); }
  function stopAuto(){ if(timer) { clearInterval(timer); timer=null; } }
  function restartAuto(){ stopAuto(); startAuto(); }

  // Eventos
  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);
  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  // Teclado
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowRight') next();
    if(e.key === 'ArrowLeft')  prev();
  });

  // Init
  update();     // pinta el slide 0 y el fondo extendido
  startAuto();
})();
