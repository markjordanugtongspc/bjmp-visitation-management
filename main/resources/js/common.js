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

// Another Common Function To be Added Here