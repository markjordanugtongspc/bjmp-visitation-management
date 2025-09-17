/**
 * Common reusable functions for slideshow navigation
 * Can be used across different slideshow implementations
 */

/**
 * Navigate to the next slide in a slideshow
 * @param {number} index - Current slide index
 * @param {number} length - Total number of slides
 * @returns {number} - New slide index
 */
export function nextSlide(index, length) {
  return (index + 1) % length;
}

/**
 * Navigate to the previous slide in a slideshow
 * @param {number} index - Current slide index
 * @param {number} length - Total number of slides
 * @returns {number} - New slide index
 */
export function prevSlide(index, length) {
  return (index - 1 + length) % length;
}

/**
 * Create a simple slideshow controller with next/prev functions
 * @param {Object} options - Slideshow options
 * @param {number} options.initialIndex - Initial slide index (default: 0)
 * @param {number} options.totalSlides - Total number of slides
 * @param {Function} options.onSlideChange - Callback when slide changes
 * @returns {Object} - Slideshow controller with next, prev, and goTo methods
 */
export function createSlideController(options) {
  const { initialIndex = 0, totalSlides, onSlideChange } = options;
  let currentIndex = initialIndex;

  return {
    next() {
      currentIndex = nextSlide(currentIndex, totalSlides);
      if (onSlideChange) onSlideChange(currentIndex);
      return currentIndex;
    },
    prev() {
      currentIndex = prevSlide(currentIndex, totalSlides);
      if (onSlideChange) onSlideChange(currentIndex);
      return currentIndex;
    },
    goTo(index) {
      if (index >= 0 && index < totalSlides) {
        currentIndex = index;
        if (onSlideChange) onSlideChange(currentIndex);
      }
      return currentIndex;
    },
    getCurrentIndex() {
      return currentIndex;
    }
  };
}

// Add pulse and related animations once per page
export function ensureSlideshowAnimationsInjected() {
  if (document.getElementById('slideshow-animations')) return;
  const style = document.createElement('style');
  style.id = 'slideshow-animations';
  style.textContent = `
    @keyframes pulse { 0% { transform: scale(1);} 50% { transform: scale(1.05);} 100% { transform: scale(1);} }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .indicator-active { background-color: white; transform: scale(1.05); box-shadow: 0 0 10px rgba(255,255,255,.5); }
    .indicator-inactive { background-color: rgba(255,255,255,.7); }
    .indicator-transition { transition: all .3s ease-in-out; }
  `;
  document.head.appendChild(style);
}

// Verify auth slideshow image path or fallback
export function verifyAuthImagePath(path) {
  if (!path) return '/images/auth/slides/a1.png';
  return path.startsWith('/') ? path : '/' + path;
}

// Probe if an image URL loads within a timeout
export const probeImage = (src, timeoutMs = 2500) => new Promise((resolve) => {
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