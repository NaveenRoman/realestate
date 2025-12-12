// main.js - DOMContentLoaded wrapped version

document.addEventListener('DOMContentLoaded', () => {

  // set year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Feature data for the modal
  const featureDetails = {
    '3d-views': {
      icon: '✨',
      title: 'Interactive 3D Views',
      content: 'Dive into properties with real-time, interactive 3D models. Our advanced parallax engine allows you to virtually walk through spaces, adjusting the viewing angle seamlessly with your mouse or phone\'s gyroscope. No external software required!'
    },
    'custom-build': {
      icon: '🔑',
      title: 'Custom Build Options',
      content: 'Design your dream home from the ground up. Use our integrated planning tools to select floor plans, materials, and finishes, receiving instant visual feedback on the 3D model before construction even begins. Start customizing your future today.'
    },
    'pricing': {
      icon: '💰',
      title: 'Transparent Pricing',
      content: 'No hidden costs. We provide clear, itemized pricing for every stage of your project, whether you are buying a listing or engaging in a custom build. Our financial dashboard ensures budgeting is simple, honest, and completely transparent.'
    }
  };

  // --- Modal Elements & Functions ---
  const modalOverlay = document.getElementById('feature-modal-overlay');
  const modalTitle   = document.getElementById('modal-title');
  const modalIcon    = document.getElementById('modal-icon');
  const modalContentText = document.getElementById('modal-content-text');

  function openModal(featureKey) {
    const detail = featureDetails[featureKey];
    if (!detail) return;
    if (!modalOverlay || !modalTitle || !modalIcon || !modalContentText) return;

    modalTitle.textContent = detail.title;
    modalIcon.textContent  = detail.icon;
    modalContentText.textContent = detail.content;

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent scrolling background
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    document.body.style.overflow = ''; // Restore scrolling
  }

  // Close modal if overlay is clicked
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target.id === 'feature-modal-overlay') {
        closeModal();
      }
    });
  }

  // Add click listeners to all feature cards
  const featureCards = document.querySelectorAll('.feature-card');
  if (featureCards.length) {
    featureCards.forEach(card => {
      card.addEventListener('click', () => {
        const featureKey = card.dataset.feature;
        openModal(featureKey);
      });
    });
  } else {
    // Optional: console notice for debugging
    // console.warn('No .feature-card found — check markup or class names.');
  }

  // Respect reduced-motion
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /***************** STARFIELD (with depth) *****************/
  (function createStarfield(){
    const sky = document.querySelector('.sky');
    if(!sky) return;
    if(reduced) return;

    const area = window.innerWidth * window.innerHeight;
    const count = Math.min(Math.max(Math.round(area / 45000), 50), 220);
    const rand = (a,b) => Math.random()*(b-a)+a;

    sky.innerHTML = '';

    for(let i=0;i<count;i++){
      const s = document.createElement('div');
      const r = Math.random();
      s.className = 'star ' + (r > 0.94 ? 'big' : (r < 0.25 ? 'small' : 'med'));

      // pick a depth layer for parallax: closer stars move faster
      const depth = Math.random() * 0.9 + 0.1; // 0.1 .. 1.0 (closer = larger movement)
      s.dataset.depth = depth.toFixed(2);

      const left = rand(1,99);
      const top = rand(2,88);
      const size = r > 0.94 ? 3 : (r < 0.25 ? 1 : 2);
      const dur = rand(2.5,5.5); // Faster twinkle for visual pop
      const delay = rand(0,4);

      s.style.left = left + '%';
      s.style.top   = top + '%';
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.opacity = (rand(0.6,1)).toFixed(2);
      s.style.animationDuration = dur + 's';
      s.style.animationDelay = delay + 's';

      sky.appendChild(s);
    }

    // regen on resize (debounced)
    let t;
    window.addEventListener('resize', ()=>{
      clearTimeout(t);
      t = setTimeout(createStarfield, 200);
    });
  })();

  /***************** 3D PARALLAX INTERACTION *****************/
  (function setup3DInteraction(){
    const hero = document.getElementById('hero');
    const scene = document.getElementById('scene');
    const house = document.getElementById('house3d');
    if(!scene || !house || reduced) return;

    // Layers with depth
    const layers = Array.from(house.querySelectorAll('.layer')).map(el=>{
      return {
        el,
        depth: parseFloat(el.dataset.depth || '0.05')
      };
    });

    // pointer movement variables
    let pointerX = 0, pointerY = 0;

    // apply transform to scene and layers for a given tilt
    function applyTransform(rx, ry, tx, ty){
      // This makes the whole scene feel like it's shifting, not just rotating
      scene.style.transform = `translateX(${tx * 8}px) translateY(${ty * 8}px) rotateX(${rx}deg) rotateY(${ry}deg)`;

      // for each layer, move in Z and translate slightly proportional to depth
      layers.forEach(layer=>{
        const depth = layer.depth;
        const translateX = tx * depth * -20;
        const translateY = ty * depth * -20;
        const translateZ = depth * 100; // Increased Z separation
        layer.el.style.transform = `translate3d(${translateX}px, ${translateY}px, ${translateZ}px)`;
      });

      // also parallax for moon and stars: move opposite to pointer for depth
      const moon = document.querySelector('.moon');
      if(moon){
        moon.style.transform = `translate3d(${tx * -30}px, ${ty * -20}px, 0) rotate(${ry * -5}deg)`;
      }

      // starfield parallax: move stars subtly based on depth
      const stars = document.querySelectorAll('.star');
      stars.forEach(s=>{
        const d = parseFloat(s.dataset.depth || '0.5');
        const sx = tx * (1 - d) * 15; 
        const sy = ty * (1 - d) * 10;
        s.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
      });
    }

    // handle pointer move (desktop)
    function onPointerMove(e){
      // Calculate pointer position relative to the hero section, not the window
      const rect = hero.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      // Normalize position (-0.5 to 0.5)
      const dx = (clientX - cx) / rect.width; 
      const dy = (clientY - cy) / rect.height;

      pointerX = dx; pointerY = dy;
    }

    // small smoothing loop so movement feels fluid
    let rafId = null;
    let springX = 0, springY = 0, springRX = 0, springRY = 0;
    function animateSpring(){
      // simple lerp smoothing
      const damp = 0.15;
      springX += (pointerX - springX) * damp;
      springY += (pointerY - springY) * damp;

      // Calculate target rotation from smoothed position
      const targetRX = clamp(springY * -14, -16, 16); 
      const targetRY = clamp(springX * 14, -18, 18); 

      springRX += (targetRX - springRX) * damp;
      springRY += (targetRY - springRY) * damp;

      applyTransform(springRX, springRY, springX, springY);
      rafId = requestAnimationFrame(animateSpring);
    }

    // clamp helper
    function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

    // pointer listeners
    hero.addEventListener('pointermove', onPointerMove);
    hero.addEventListener('touchstart', onPointerMove, {passive: true});
    hero.addEventListener('touchmove', onPointerMove, {passive: true});

    // start animation loop 
    if(!rafId) { rafId = requestAnimationFrame(animateSpring); }
    
    // Gyroscope (optional, for mobile tilt)
    if(window.DeviceOrientationEvent){
      function handleOrientation(e){
        if(typeof e.gamma === 'number' && typeof e.beta === 'number'){
          const gx = clamp(e.gamma / 40, -1, 1); 
          const gy = clamp(e.beta / 40, -1, 1);
          // Invert Y direction for more natural mobile feel
          pointerX = gx * 0.6; pointerY = gy * -0.6; 
        }
      }

      if(typeof DeviceOrientationEvent.requestPermission === 'function'){
        window.addEventListener('touchstart', function askPermission(){
          DeviceOrientationEvent.requestPermission().then(resp=>{
            if(resp === 'granted'){ window.addEventListener('deviceorientation', handleOrientation); }
          }).catch(()=>{/* ignore */});
          window.removeEventListener('touchstart', askPermission);
        }, {passive:true, once:true});
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }
  })();

  /***************** Tabs + Carousels logic *****************/
  // Tabs
  (function(){
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        // toggle active button
        tabs.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');

        // show panel
        const target = btn.dataset.target;
        document.querySelectorAll('.tab-panel').forEach(panel=>{
          if(panel.id === target){
            panel.classList.add('active');
            panel.removeAttribute('hidden');
          } else {
            panel.classList.remove('active');
            panel.setAttribute('hidden','');
          }
        });
      });
    });

    // keyboard nav for tabs (left/right)
    document.addEventListener('keydown', (e) => {
      if(document.activeElement && document.activeElement.classList.contains('tab-btn')) {
        const indexed = Array.from(tabs).indexOf(document.activeElement);
        if(e.key === 'ArrowRight') {
          const next = tabs[(indexed+1)%tabs.length]; next.focus(); next.click();
        } else if(e.key === 'ArrowLeft') {
          const prev = tabs[(indexed-1+tabs.length)%tabs.length]; prev.focus(); prev.click();
        }
      }
    });
  })();

  // Carousel controls: scroll by width of container
  (function(){
    function scrollCarousel(id, direction){
      const el = document.getElementById(id);
      if(!el) return;
      const card = el.querySelector('.card');
      const cardW = (card ? card.offsetWidth : el.clientWidth*0.9) + 16; // include gap
      const scrollAmount = direction === 'next' ? cardW * 1.6 : -cardW * 1.6;
      el.scrollBy({left: scrollAmount, behavior:'smooth'});
    }

    // wire buttons: each control has data-target referencing sale/rent/services/projects
    document.querySelectorAll('.carousel-control').forEach(ctrl=>{
      ctrl.addEventListener('click', ()=>{
        const t = ctrl.dataset.target;
        // map to element ids
        const map = { sale:'carousel-sale', rent:'carousel-rent', services:'carousel-services', projects:'carousel-projects' };
        scrollCarousel(map[t], ctrl.classList.contains('right') ? 'next' : 'prev');
      });
    });

    // keyboard support: left/right on carousel when focused
    document.querySelectorAll('.carousel').forEach(c=>{
      c.addEventListener('keydown', (e)=>{
        if(e.key === 'ArrowRight'){ c.scrollBy({left: 300, behavior:'smooth'}); }
        else if(e.key === 'ArrowLeft'){ c.scrollBy({left: -300, behavior:'smooth'}); }
      });
    });
  })();

}); // end DOMContentLoaded
