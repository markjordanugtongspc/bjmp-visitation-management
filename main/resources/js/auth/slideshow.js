const createDot = (isActive) => {
  const dot = document.createElement('span');
  dot.className = `size-2 rounded-full transition-all cursor-pointer ring-2 ring-white/70 ${
    isActive ? 'bg-white' : 'bg-white/60 hover:bg-white hover:scale-110'
  }`;
  return dot;
};

const probeImage = (src, timeoutMs = 2500) => new Promise((resolve) => {
  const img = new Image();
  let done = false;
  const finish = (ok) => {
    if (done) return; done = true;
    clearTimeout(timer);
    img.onload = img.onerror = null;
    resolve(ok);
  };
  const timer = setTimeout(() => finish(false), timeoutMs);
  img.onload = () => finish(true);
  img.onerror = () => finish(false);
  img.src = src;
});

async function detectAuthImages(base = '/images/auth/slides', max = 3) {
  // Default images to look for in the auth slides folder
  const extensions = ['png'];
  const candidates = [];
  
  // Try to find images with pattern a1.png, a2.png, etc.
  for (let i = 1; i <= max; i++) {
    for (const ext of extensions) candidates.push(`${base}/a${i}.${ext}`);
  }
  
  // Also check for bjmp1.png, bjmp2.png pattern
  for (let i = 1; i <= max; i++) {
    for (const ext of extensions) candidates.push(`${base}/a${i}.${ext}`);
  }
  
  // Check which images actually exist
  const checks = await Promise.all(candidates.map((u) => probeImage(u, 2000)));
  const found = candidates.filter((_, i) => checks[i]);
  
  // If no images found, use fallback images from landing showcase
  if (found.length) return found;
  return [
    '/images/landing/showcase/p1.jpg',
    '/images/landing/showcase/p2.jpg',
    '/images/landing/showcase/p3.jpg'
  ];
}

function mountSlideshow(root) {
  const images = JSON.parse(root.getAttribute('data-images') || '[]');
  const isBg = root.getAttribute('data-bg') === 'true';
  const imgEl = isBg ? null : root.querySelector('img');
  const scope = root.closest('div') || root;
  
  // Find controls - for login page, they're in the parent div
  const controlsParent = scope.querySelector('.absolute');
  const prevBtn = scope.querySelector('[data-prev]') || (controlsParent && controlsParent.querySelector('[data-prev]'));
  const nextBtn = scope.querySelector('[data-next]') || (controlsParent && controlsParent.querySelector('[data-next]'));
  
  // For login page, we don't use dynamic dots but we'll update the static indicators
  const dotsEl = scope.querySelector('[data-dots]');
  const staticIndicators = controlsParent ? controlsParent.querySelectorAll('.rounded-full') : null;
  const overlayEl = root.querySelector('.hero-overlay');
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!images.length || (!imgEl && !isBg)) return;

  let index = 0;
  let timer = null;

  const render = () => {
    if (isBg) {
      const temp = document.createElement('div');
      temp.className = 'absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-0 slide-layer';
      if (prefersReduced) {
        temp.style.transition = 'none';
      }

      const img = new Image();
      img.src = images[index];
      img.onload = () => {
        temp.style.backgroundImage = `url("${images[index]}")`;
        temp.style.backgroundSize = 'cover';
        temp.style.backgroundPosition = 'center';
        temp.style.backgroundRepeat = 'no-repeat';
        temp.style.transform = prefersReduced ? 'none' : 'scale(1.02)';
        temp.style.zIndex = '0';
        if (overlayEl) overlayEl.style.zIndex = '1';

        root.appendChild(temp);
        requestAnimationFrame(() => {
          temp.classList.remove('opacity-0');
        });
      };

      setTimeout(() => {
        const oldLayers = root.querySelectorAll('.slide-layer:not(:last-of-type)');
        oldLayers.forEach((div) => div.remove());
      }, 1000);
    } else if (imgEl) {
      imgEl.src = images[index];
    }

    // Update dynamic dots if available
    if (dotsEl) {
      dotsEl.innerHTML = '';
      images.forEach((_, i) => {
        const dot = createDot(i === index);
        dot.addEventListener('click', () => { index = i; restart(); });
        dotsEl.appendChild(dot);
      });
    }
    
    // Update static indicators for login page
    if (staticIndicators && staticIndicators.length) {
      staticIndicators.forEach((indicator, i) => {
        // Clear all active states
        indicator.className = indicator.className.replace('bg-white', 'bg-white/70');
        
        // Add click handler if not already added
        if (!indicator.hasAttribute('data-slide-index')) {
          indicator.setAttribute('data-slide-index', i);
          indicator.addEventListener('click', () => {
            if (i < images.length) {
              index = i;
              restart();
            }
          });
        }
      });
      
      // Set active indicator
      if (staticIndicators[index]) {
        staticIndicators[index].className = staticIndicators[index].className.replace('bg-white/70', 'bg-white');
      }
    }
  };

  const next = () => { index = (index + 1) % images.length; render(); };
  const prev = () => { index = (index - 1 + images.length) % images.length; render(); };
  const start = () => { if (!prefersReduced) timer = setInterval(next, 5000); };
  const stop = () => { if (timer) clearInterval(timer); };
  const restart = () => { stop(); render(); start(); };

  prevBtn?.addEventListener('click', () => { prev(); restart(); });
  nextBtn?.addEventListener('click', () => { next(); restart(); });
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  // Pause when tab not visible
  const onVisibility = () => { document.hidden ? stop() : start(); };
  document.addEventListener('visibilitychange', onVisibility);

  // Touch swipe for mobile
  let touchX = 0, touchY = 0, touchTime = 0;
  const touchTarget = isBg ? root : (imgEl || root);
  touchTarget.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    const t = e.touches[0];
    touchX = t.clientX; touchY = t.clientY; touchTime = Date.now();
    stop();
  }, { passive: true });
  touchTarget.addEventListener('touchend', (e) => {
    const dt = Date.now() - touchTime;
    const t = e.changedTouches && e.changedTouches[0];
    if (!t) { start(); return; }
    const dx = t.clientX - touchX;
    const dy = t.clientY - touchY;
    const absX = Math.abs(dx), absY = Math.abs(dy);
    if (dt < 800 && absX > 30 && absX > absY) {
      if (dx < 0) next(); else prev();
      restart();
    } else {
      start();
    }
  }, { passive: true });

  render();
  start();
}

async function initAuthSlideshows() {
  const slideshowEl = document.getElementById('auth-slideshow');
  if (slideshowEl) {
    try {
      // Use the slides folder directly
      const base = '/images/auth/slides';
      const images = await detectAuthImages(base);
      console.log('Auth slideshow images found:', images);
      slideshowEl.setAttribute('data-images', JSON.stringify(images));
      mountSlideshow(slideshowEl);
    } catch (err) {
      console.error('Error initializing auth slideshow:', err);
    }
  }
}

// Initialize slideshows when DOM is ready
if (document.readyState !== 'loading') {
  initAuthSlideshows();
} else {
  document.addEventListener('DOMContentLoaded', initAuthSlideshows);
}
