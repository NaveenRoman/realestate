const header = document.getElementById('siteHeader');
const hamburger = document.getElementById('hamburger');
const drawer = document.getElementById('mobileDrawer');
const overlay = document.getElementById('overlay');

/* Change header on scroll */
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

/* Mobile menu */
hamburger.addEventListener('click', () => {
  drawer.classList.add('open');
  overlay.classList.add('show');
});

overlay.addEventListener('click', () => {
  drawer.classList.remove('open');
  overlay.classList.remove('show');
});

/* HERO SEARCH EXPAND EFFECT */
const heroSearch = document.querySelector('.hero-search input');

if (heroSearch) {
  heroSearch.addEventListener('focus', () => {
    heroSearch.style.paddingLeft = '1.3rem';
  });

  heroSearch.addEventListener('blur', () => {
    heroSearch.style.paddingLeft = '1rem';
  });
}

/* ================================
   PROPERTY DISCOVERY MODE LOGIC
================================ */

const modeCards = document.querySelectorAll('.mode-card');
const propertyCards = document.querySelectorAll('.property-card');

let selectedMode = 'buy'; // default

modeCards.forEach(card => {
  card.addEventListener('click', () => {

    // UI: active button
    modeCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');

    // Selected mode
    selectedMode = card.dataset.mode;

    // FILTER FEATURED PROPERTIES
    propertyCards.forEach(property => {
      const category = property.dataset.category;

      if (category === selectedMode) {
        property.style.display = 'block';
        property.style.animation = 'fadeUp 0.4s ease';
      } else {
        property.style.display = 'none';
      }
    });

    // Smooth scroll to Featured Properties
    document
      .getElementById('featuredProperties')
      .scrollIntoView({ behavior: 'smooth' });
  });
});


/* ================================
   FEATURED PROPERTY CLICK
================================ */

propertyCards.forEach(card => {
  card.addEventListener('click', () => {
    const propertyId = card.dataset.id;

    // Navigate to property detail page
    window.location.href = `property.html?id=${propertyId}`;
  });
});

/* ================================
   MAP INTERACTION (PRO)
================================ */

const pins = document.querySelectorAll('.map-pin-pro');
const preview = document.getElementById('mapPreview');

pins.forEach(pin => {
  pin.addEventListener('click', (e) => {
    e.stopPropagation();
    preview.style.display = 'block';
  });
});

document.getElementById('mapCanvas')?.addEventListener('click', () => {
  preview.style.display = 'none';
});


/* ================================
   360° VIEWER INTERACTION
================================ */

const vrImage = document.getElementById('vrImage');
const vrTabs = document.querySelectorAll('.vr-tab');
const vrHotspots = document.querySelectorAll('.vr-hotspot');
const vrFullscreenBtn = document.getElementById('vrFullscreen');

let isDragging = false;
let startX = 0;
let currentX = -20;

/* ROOM SWITCH */
const roomImages = {
  living: 'assets/360/living.jpg',
  bedroom: 'assets/360/bedroom.jpg',
  kitchen: 'assets/360/kitchen.jpg'
};

vrTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    vrTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const room = tab.dataset.room;
    vrImage.src = roomImages[room];
  });
});

/* HOTSPOT ROOM NAV */
vrHotspots.forEach(hotspot => {
  hotspot.addEventListener('click', () => {
    const room = hotspot.dataset.room;
    vrImage.src = roomImages[room];

    vrTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.room === room);
    });
  });
});

/* DRAG TO PAN */
vrImage.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.clientX;
  vrImage.style.cursor = 'grabbing';
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  vrImage.style.cursor = 'grab';
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const delta = (e.clientX - startX) * 0.05;
  currentX += delta;
  startX = e.clientX;
  vrImage.style.transform = `translateX(${currentX}%)`;
});

/* FULLSCREEN */
vrFullscreenBtn.addEventListener('click', () => {
  const viewer = document.getElementById('vrViewer');
  if (viewer.requestFullscreen) {
    viewer.requestFullscreen();
  }
});



/* ================================
   WHY TRUST US – SCROLL ANIMATION
================================ */

const trustCards = document.querySelectorAll('.trust-card');

const trustObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 150); // stagger animation
      }
    });
  },
  {
    threshold: 0.25,
  }
);

trustCards.forEach(card => trustObserver.observe(card));


/* ================================
   STATS COUNT-UP ANIMATION
================================ */

const statNumbers = document.querySelectorAll('.stat-card h4');

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = +el.dataset.count;
      let current = 0;
      const increment = Math.ceil(target / 80);

      const counter = setInterval(() => {
        current += increment;
        if (current >= target) {
          el.textContent = target.toLocaleString() + '+';
          clearInterval(counter);
        } else {
          el.textContent = current.toLocaleString();
        }
      }, 20);

      statsObserver.unobserve(el);
    }
  });
}, { threshold: 0.4 });

statNumbers.forEach(num => statsObserver.observe(num));
