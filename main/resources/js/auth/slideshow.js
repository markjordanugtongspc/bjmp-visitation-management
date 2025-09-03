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
  };

  const next = () => { 
    index = (index + 1) % images.length; 
    render(); 
  };
  
  const start = () => { 
    if (!prefersReduced) timer = setInterval(next, 5000); 
  };
  
  const stop = () => { 
    if (timer) clearInterval(timer); 
  };

  // Pause when tab not visible
  const onVisibility = () => { 
    document.hidden ? stop() : start(); 
  };
  
  document.addEventListener('visibilitychange', onVisibility);

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
