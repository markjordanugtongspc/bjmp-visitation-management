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

async function detectShowcaseImages(base = '/images/landing/showcase', max = 15) {
  // const extensions = ['jpg', 'jpeg', 'png', 'webp'];
  const extensions = ['jpg'];
  const candidates = [];
  for (let i = 1; i <= max; i++) {
    for (const ext of extensions) candidates.push(`${base}/p${i}.${ext}`);
  }
  const checks = await Promise.all(candidates.map((u) => probeImage(u, 2000)));
  const found = candidates.filter((_, i) => checks[i]);
  if (found.length) return found;
  return [`${base}/p1.jpg`];
}

export function mountSlideshow(root) {
  const images = JSON.parse(root.getAttribute('data-images') || '[]');
  const isBg = root.getAttribute('data-bg') === 'true';
  const imgEl = isBg ? null : root.querySelector('img');
  const scope = root.closest('section') || root;
  const dotsEl = scope.querySelector('[data-dots]') || root.querySelector('[data-dots]');
  const prevBtn = scope.querySelector('[data-prev]') || root.querySelector('[data-prev]');
  const nextBtn = scope.querySelector('[data-next]') || root.querySelector('[data-next]');
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

    if (dotsEl) {
      dotsEl.innerHTML = '';
      images.forEach((_, i) => {
        const dot = createDot(i === index);
        dot.addEventListener('click', () => { index = i; restart(); });
        dotsEl.appendChild(dot);
      });
    }
  };

  const next = () => { index = (index + 1) % images.length; render(); };
  const prev = () => { index = (index - 1 + images.length) % images.length; render(); };
  const start = () => { if (!prefersReduced) timer = setInterval(next, 4000); };
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

  // Lightbox (optional on bg click except on controls)
  if (!isBg && imgEl) {
    imgEl.addEventListener('click', () => openLightbox(images, index, (i) => { index = i; restart(); }));
  } else if (isBg) {
    root.addEventListener('click', (e) => {
      const isControl = (e.target instanceof Element) && (e.target.closest('[data-prev]') || e.target.closest('[data-next]') || e.target.closest('[data-dots]'));
      if (!isControl) openLightbox(images, index, (i) => { index = i; restart(); });
    });
  }
}

// Auth image detection for login page
async function detectAuthImages(base = '/images/auth/slides', max = 10) {
  const extensions = ['png', 'jpg', 'jpeg', 'webp'];
  const candidates = [];
  
  // Try to find images with pattern a1.png, a2.png, etc.
  for (let i = 1; i <= max; i++) {
    for (const ext of extensions) candidates.push(`${base}/a${i}.${ext}`);
  }
  
  // Check which images actually exist
  const checks = await Promise.all(candidates.map((u) => probeImage(u, 2000)));
  const found = candidates.filter((_, i) => checks[i]);
  
  // If no images found, use fallback from landing showcase
  if (found.length) return found;
  return [
    '/images/landing/showcase/p1.jpg',
    '/images/landing/showcase/p2.jpg',
    '/images/landing/showcase/p3.jpg'
  ];
}

// Auth slideshow mount function for login page
export function mountAuthSlideshow(root) {
  const images = JSON.parse(root.getAttribute('data-images') || '[]');
  const isBg = root.getAttribute('data-bg') === 'true';
  const imgEl = isBg ? null : root.querySelector('img');
  
  // For login page, find controls in parent containers
  const parentDiv = root.closest('div').parentElement;
  const controlsContainer = parentDiv ? parentDiv.querySelector('.absolute') : null;
  const prevBtn = controlsContainer ? controlsContainer.querySelector('[data-prev]') : null;
  const nextBtn = controlsContainer ? controlsContainer.querySelector('[data-next]') : null;
  const staticIndicators = controlsContainer ? controlsContainer.querySelectorAll('.rounded-full') : null;
  
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
        temp.style.backgroundImage = `url("${images[index]}")`;;
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
    
    // Update static indicators for login page
    if (staticIndicators && staticIndicators.length) {
      staticIndicators.forEach((indicator, i) => {
        // Reset all indicators to inactive state
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

  // Add button event listeners
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

export async function initSlideshows() {
  // Initialize welcome page slideshow
  const slideshowEl = document.getElementById('hero-slideshow');
  if (slideshowEl) {
    const base = slideshowEl.getAttribute('data-base') || '/images/landing/showcase';
    const images = await detectShowcaseImages(base);
    slideshowEl.setAttribute('data-images', JSON.stringify(images));
    mountSlideshow(slideshowEl);
  }
  
  // Initialize auth page slideshow
  const authSlideshowEl = document.getElementById('auth-slideshow');
  if (authSlideshowEl) {
    const base = '/images/auth/slides';
    const images = await detectAuthImages(base);
    authSlideshowEl.setAttribute('data-images', JSON.stringify(images));
    mountAuthSlideshow(authSlideshowEl);
  }
}

if (document.readyState !== 'loading') {
  initSlideshows();
} else {
  document.addEventListener('DOMContentLoaded', initSlideshows);
}

// Lightbox viewer
function openLightbox(images, startIndex = 0, onChange) {
  let current = startIndex;

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  const wrap = document.createElement('div');
  wrap.className = 'relative w-full max-w-5xl';
  overlay.appendChild(wrap);

  const img = document.createElement('img');
  img.alt = 'Preview';
  img.className = 'mx-auto max-h-[85vh] w-auto rounded-lg shadow-2xl object-contain';
  wrap.appendChild(img);

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 p-2 text-white';
  prev.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>';
  wrap.appendChild(prev);

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 p-2 text-white';
  next.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>';
  wrap.appendChild(next);

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'absolute -top-3 -right-3 rounded-full bg-black/60 hover:bg-black/80 p-2 text-white';
  close.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M6.225 4.811a.75.75 0 0 1 1.06 0L12 9.525l4.715-4.714a.75.75 0 1 1 1.06 1.06L13.06 10.586l4.715 4.714a.75.75 0 1 1-1.06 1.06L12 11.646l-4.715 4.714a.75.75 0 1 1-1.06-1.06l4.714-4.714-4.714-4.714a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>';
  wrap.appendChild(close);

  const setImage = (i) => {
    current = (i + images.length) % images.length;
    img.src = images[current];
    if (typeof onChange === 'function') onChange(current);
  };

  const onKey = (e) => {
    if (e.key === 'Escape') destroy();
    if (e.key === 'ArrowRight') setImage(current + 1);
    if (e.key === 'ArrowLeft') setImage(current - 1);
  };

  const destroy = () => {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  };

  overlay.addEventListener('click', (e) => { if (e.target === overlay) destroy(); });
  close.addEventListener('click', destroy);
  prev.addEventListener('click', () => setImage(current - 1));
  next.addEventListener('click', () => setImage(current + 1));
  document.addEventListener('keydown', onKey);

  document.body.appendChild(overlay);
  setImage(current);
}


