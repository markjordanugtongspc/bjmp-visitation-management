/**
 * Dark Mode Initialization
 * Based on Flowbite official documentation
 * https://flowbite.com/docs/customize/dark-mode/#dark-mode-switcher
 */

import manager from './dark-mode-manager.js';
import integrations from './dark-mode-integrations.js';

/**
 * Initialize dark mode system
 */
function init() {
  manager.init();
  integrations.init();
  setupToggleButtons();
}

/**
 * Setup all toggle buttons
 * Uses event delegation for all [data-theme-toggle] elements
 */
function setupToggleButtons() {
  // Update icons on page load
  updateIcons();
  
  // Handle toggle button clicks
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('[data-theme-toggle]');
    if (toggle) {
      e.preventDefault();
      handleToggle();
    }
  });
}

/**
 * Handle toggle click - Flowbite pattern
 */
function handleToggle() {
  manager.toggle();
  updateIcons();
}

/**
 * Update all toggle button icons based on current theme
 * Flowbite pattern: toggle 'hidden' class on icons
 */
function updateIcons() {
  const isDark = manager.isDark();
  
  // Find all toggle buttons
  document.querySelectorAll('[data-theme-toggle]').forEach(button => {
    const sunIcon = button.querySelector('[data-icon="sun"]');
    const moonIcon = button.querySelector('[data-icon="moon"]');
    
    if (sunIcon && moonIcon) {
      // Flowbite pattern: toggle hidden class
      if (isDark) {
        // Dark mode: show moon, hide sun
        moonIcon.classList.remove('hidden');
        sunIcon.classList.add('hidden');
      } else {
        // Light mode: show sun, hide moon
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
      }
    }
  });
}

// Auto-initialize when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Global API (optional)
window.darkMode = {
  toggle: () => {
    manager.toggle();
    updateIcons();
  },
  setTheme: (theme) => {
    manager.setTheme(theme);
    updateIcons();
  },
  isDark: () => manager.isDark(),
  getTheme: () => manager.getCurrentTheme()
};

export default manager;
