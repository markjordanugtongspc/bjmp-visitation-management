import { nextSlide, prevSlide } from '../common';

// Add CSS for pulse animation
const addPulseAnimation = () => {
  // Check if the animation style already exists
  if (!document.getElementById('slideshow-animations')) {
    const style = document.createElement('style');
    style.id = 'slideshow-animations';
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .indicator-active {
        background-color: white;
        transform: scale(1.05);
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
      }
      
      .indicator-inactive {
        background-color: rgba(255, 255, 255, 0.7);
      }
      
      .indicator-transition {
        transition: all 0.3s ease-in-out;
      }
    `;
    document.head.appendChild(style);
  }
};

/**
 * Auto Slideshow for Login Page
 * - Automatically cycles through a1.png, a2.png, and a3.png every 4 seconds
 * - Supports manual navigation with prev/next buttons
 * - Updates indicator pills to show current slide
 */

// Fixed image paths for login slideshow
const LOGIN_SLIDES = [
  '/images/auth/slides/a1.png',
  '/images/auth/slides/a2.png',
  '/images/auth/slides/a3.png'
];

// Verify image exists or use fallback
function verifyImagePath(path) {
  // Make sure path is not undefined
  if (!path) return '/images/auth/slides/a1.png';
  
  // Make sure path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  return path;
}

/**
 * Initialize the login page slideshow
 */
function initLoginSlideshow() {
  console.log('Initializing login slideshow...');
  
  // Add pulse animation CSS
  addPulseAnimation();
  
  const slideshowEl = document.getElementById('auth-slideshow');
  if (!slideshowEl) {
    console.error('Slideshow element not found!');
    return;
  }

  // Set up slideshow container
  const isBg = slideshowEl.getAttribute('data-bg') === 'true';
  const overlayEl = slideshowEl.querySelector('.hero-overlay');
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Find controls
  const container = slideshowEl.closest('.relative');
  const controlsContainer = container.querySelector('.absolute.bottom-5');
  const prevBtn = controlsContainer?.querySelector('[data-prev]');
  const nextBtn = controlsContainer?.querySelector('[data-next]');
  const indicatorsContainer = controlsContainer?.querySelector('#slideshow-indicators');
  
  // Create indicators dynamically
  let indicators = [];
  if (indicatorsContainer) {
    // Clear any existing indicators
    indicatorsContainer.innerHTML = '';
    
    // Create new indicators based on the number of slides
    LOGIN_SLIDES.forEach((_, i) => {
      const indicator = document.createElement('span');
      
      // Determine width based on position (middle one is narrower)
      const width = i === 1 ? 'w-10' : 'w-14';
      
      // Set initial classes
      indicator.className = `h-4 ${width} rounded-full bg-white/70 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-sm`;
      
      // Set data attribute for index
      indicator.setAttribute('data-index', i);
      
      // Add to container and to our array
      indicatorsContainer.appendChild(indicator);
      indicators.push(indicator);
    });
    
    console.log(`Created ${indicators.length} indicators`);
  }
  
  // Initialize state
  let index = 0;
  let timer = null;

  // Render the current slide
  const render = () => {
    if (isBg) {
      const temp = document.createElement('div');
      temp.className = 'absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-0 slide-layer';
      if (prefersReduced) {
        temp.style.transition = 'none';
      }

      const img = new Image();
      const imagePath = verifyImagePath(LOGIN_SLIDES[index]);
      img.src = imagePath;
      img.onload = () => {
        temp.style.backgroundImage = `url("${imagePath}")`;
        temp.style.backgroundSize = 'cover';
        temp.style.backgroundPosition = 'center';
        temp.style.backgroundRepeat = 'no-repeat';
        temp.style.transform = prefersReduced ? 'none' : 'scale(1.02)';
        temp.style.zIndex = '0';
        if (overlayEl) overlayEl.style.zIndex = '1';

        slideshowEl.appendChild(temp);
        requestAnimationFrame(() => {
          temp.classList.remove('opacity-0');
        });
      };

      setTimeout(() => {
        const oldLayers = slideshowEl.querySelectorAll('.slide-layer:not(:last-of-type)');
        oldLayers.forEach((div) => div.remove());
      }, 1000);
    }

    // Update indicators with smooth animations and transitions
    if (indicators && indicators.length) {
      indicators.forEach((indicator, i) => {
        // Reset all classes first to avoid class conflicts
        const baseClasses = "h-4 rounded-full transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-sm";
        
        // Apply proper width and active/inactive state
        if (i === index) {
          // Active indicator - full width and opacity
          const width = i === 1 ? "w-10" : "w-14";
          
          // Apply active styles
          indicator.className = `${baseClasses} ${width} bg-white`;
          
          // Add subtle pulse animation for the active indicator
          if (!prefersReduced) {
            indicator.style.animation = "pulse 2s infinite";
          }
          
          // Add a subtle glow effect
          indicator.style.boxShadow = "0 0 8px rgba(255, 255, 255, 0.7)";
          
          // Scale effect
          indicator.style.transform = "scale(1.05)";
        } else {
          // Inactive indicator styling
          const width = i === 1 ? "w-10" : "w-14";
          indicator.className = `${baseClasses} ${width} bg-white/70`;
          indicator.style.animation = "none";
          indicator.style.boxShadow = "none";
          indicator.style.transform = "scale(1)";
        }
        
        // Add a small delay to each indicator for a staggered effect
        indicator.style.transitionDelay = `${i * 50}ms`;
      });
    }
  };

  // Create a slideshow controller using common.js
  const slideController = {
    next: () => {
      index = nextSlide(index, LOGIN_SLIDES.length);
      render();
      return index;
    },
    previous: () => {
      index = prevSlide(index, LOGIN_SLIDES.length);
      render();
      return index;
    },
    goTo: (targetIndex) => {
      if (targetIndex >= 0 && targetIndex < LOGIN_SLIDES.length) {
        index = targetIndex;
        render();
      }
      return index;
    }
  };
  
  // Simplified navigation functions that use the controller
  const next = () => slideController.next();
  const previous = () => slideController.previous();

  // Timer control functions
  const start = () => {
    if (!prefersReduced) timer = setInterval(next, 4000); // 4 seconds interval
  };

  const stop = () => {
    if (timer) clearInterval(timer);
  };

  const restart = () => {
    stop();
    render();
    start();
  };

  // Set up event listeners
  if (prevBtn) {
    console.log('Adding click event to prev button');
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      previous();
      restart();
      console.log('Previous button clicked, new index:', index);
    });
  } else {
    console.warn('Previous button not found');
  }

  if (nextBtn) {
    console.log('Adding click event to next button');
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      next();
      restart();
      console.log('Next button clicked, new index:', index);
    });
  } else {
    console.warn('Next button not found');
  }

  // Set up indicator clicks with enhanced functionality
  if (indicatorsContainer && indicators.length > 0) {
    console.log('Setting up events for', indicators.length, 'indicators');
    
    // Use event delegation for better performance
    indicatorsContainer.addEventListener('click', (e) => {
      // Find the closest indicator element
      const indicator = e.target.closest('[data-index]');
      if (!indicator) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      // Get the index from the data attribute
      const clickedIndex = parseInt(indicator.getAttribute('data-index'), 10);
      
      if (!isNaN(clickedIndex) && clickedIndex >= 0 && clickedIndex < LOGIN_SLIDES.length) {
        // Add a small visual feedback effect
        indicator.classList.add('scale-110', 'shadow-md');
        setTimeout(() => {
          indicator.classList.remove('scale-110', 'shadow-md');
        }, 200);
        
        // Update the slide
        index = clickedIndex;
        restart();
        console.log('Indicator clicked, new index:', index);
      }
    });
    
    // Add hover effects for all indicators
    indicators.forEach(indicator => {
      // Mouse enter effect
      indicator.addEventListener('mouseenter', () => {
        if (parseInt(indicator.getAttribute('data-index')) !== index) {
          indicator.style.boxShadow = '0 0 5px rgba(255, 255, 255, 0.5)';
          indicator.style.transform = 'scale(1.05)';
        }
      });
      
      // Mouse leave effect
      indicator.addEventListener('mouseleave', () => {
        if (parseInt(indicator.getAttribute('data-index')) !== index) {
          indicator.style.boxShadow = 'none';
          indicator.style.transform = 'scale(1)';
        }
      });
    });
    
  } else {
    console.warn('No indicators container or indicators found');
  }

  // Pause when tab not visible
  const onVisibility = () => {
    document.hidden ? stop() : start();
  };
  document.addEventListener('visibilitychange', onVisibility);

  // Touch swipe for mobile
  let touchX = 0, touchTime = 0;
  slideshowEl.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    touchX = e.touches[0].clientX;
    touchTime = Date.now();
    stop();
  }, { passive: true });

  slideshowEl.addEventListener('touchend', (e) => {
    const dt = Date.now() - touchTime;
    const t = e.changedTouches && e.changedTouches[0];
    if (!t) { start(); return; }
    const dx = t.clientX - touchX;
    if (dt < 800 && Math.abs(dx) > 30) {
      if (dx < 0) next(); else previous();
      restart();
    } else {
      start();
    }
  }, { passive: true });

  // Initialize slideshow
  render();
  start();
}

// Initialize when DOM is ready
if (document.readyState !== 'loading') {
  initLoginSlideshow();
} else {
  document.addEventListener('DOMContentLoaded', initLoginSlideshow);
}