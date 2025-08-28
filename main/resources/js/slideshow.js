const createDot = (isActive) => {
  const dot = document.createElement('span');
  dot.className = `size-2 rounded-full transition-all cursor-pointer ring-2 ring-white/70 ${
    isActive ? 'bg-white' : 'bg-white/60 hover:bg-white hover:scale-110'
  }`;
  return dot;
};

export function mountSlideshow(root) {
  const images = JSON.parse(root.getAttribute('data-images') || '[]');
  const imgEl = root.querySelector('img');
  const dotsEl = root.querySelector('[data-dots]');
  const prevBtn = root.querySelector('[data-prev]');
  const nextBtn = root.querySelector('[data-next]');

  if (!images.length || !imgEl || !dotsEl) return;

  let index = 0;
  let timer = null;

  const render = () => {
    imgEl.src = images[index];
    dotsEl.innerHTML = '';
    images.forEach((_, i) => {
      const dot = createDot(i === index);
      dot.addEventListener('click', () => {
        index = i;
        restart();
      });
      dotsEl.appendChild(dot);
    });
  };

  const next = () => {
    index = (index + 1) % images.length;
    render();
  };

  const prev = () => {
    index = (index - 1 + images.length) % images.length;
    render();
  };

  const start = () => {
    timer = setInterval(next, 4000);
  };

  const stop = () => timer && clearInterval(timer);
  const restart = () => {
    stop();
    render();
    start();
  };

  prevBtn?.addEventListener('click', () => {
    prev();
    restart();
  });

  nextBtn?.addEventListener('click', () => {
    next();
    restart();
  });

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  render();
  start();

  // Open responsive lightbox on image click
  imgEl.addEventListener('click', () => openLightbox(images, index, (i) => {
    index = i;
    restart();
  }));
}

export function initSlideshows() {
  document.querySelectorAll('#hero-slideshow').forEach(mountSlideshow);
}

if (document.readyState !== 'loading') {
  initSlideshows();
} else {
  document.addEventListener('DOMContentLoaded', initSlideshows);
}

// openLightbox(images, startIndex, onChange)
// Creates and shows a responsive modal (lightbox) to preview slideshow images.
// - images: string[] of image URLs
// - startIndex: number starting image index
// - onChange: optional callback when the active index changes (syncs carousel)
function openLightbox(images, startIndex = 0, onChange) {
  let current = startIndex;

  // Backdrop
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  // Container
  const wrap = document.createElement('div');
  wrap.className = 'relative w-full max-w-5xl';
  overlay.appendChild(wrap);

  // Image element
  const img = document.createElement('img');
  img.alt = 'Preview';
  img.className = 'mx-auto max-h-[85vh] w-auto rounded-lg shadow-2xl object-contain';
  wrap.appendChild(img);

  // Prev button
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 p-2 text-white';
  prev.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>';
  wrap.appendChild(prev);

  // Next button
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 p-2 text-white';
  next.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>';
  wrap.appendChild(next);

  // Close button
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

  // Wire events
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) destroy();
  });
  close.addEventListener('click', destroy);
  prev.addEventListener('click', () => setImage(current - 1));
  next.addEventListener('click', () => setImage(current + 1));
  document.addEventListener('keydown', onKey);

  // Mount and show first image
  document.body.appendChild(overlay);
  setImage(current);
}


