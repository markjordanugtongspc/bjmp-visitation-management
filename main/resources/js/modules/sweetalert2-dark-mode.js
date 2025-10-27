/**
 * SweetAlert2 Dark Mode Integration (v2 - Automatic)
 * This script intelligently wraps the global Swal object to automatically
 * apply the 'dark' class to any modal, even those with custom classes.
 */

import darkModeManager from './dark-mode-manager.js';

// A flag to prevent running the setup more than once
let isSwalPatched = false;

/**
 * Patches the global Swal object to automatically handle theme classes.
 */
function patchSwal() {
  if (!window.Swal || isSwalPatched) {
    return;
  }

  const originalSwal = window.Swal;

  // Create a new Swal instance that extends the original
  const PatchedSwal = originalSwal.mixin({
    // The 'willOpen' hook runs just before the modal is shown
    willOpen: () => {
      const isDark = darkModeManager.getEffectiveTheme() === 'dark';
      const popup = originalSwal.getPopup();
      if (popup) {
        // Toggle the 'dark' class on the main popup element
        // based on the current theme.
        popup.classList.toggle('dark', isDark);
      }
    },
  });

  // Overwrite the global Swal and swal variables with our patched version
  window.Swal = window.swal = PatchedSwal;
  isSwalPatched = true;
  console.log('SweetAlert2 has been patched for automatic dark mode.');
}

/**
 * Waits for SweetAlert2 to be available, then patches it and
 * sets up a listener for theme changes.
 */
function initializeSync() {
  const checkSwal = () => {
    if (window.Swal) {
      // Patch Swal as soon as it's available
      patchSwal();

      // Listen for theme changes to update any currently open modal
      darkModeManager.onThemeChange(() => {
        const popup = window.Swal.getPopup();
        if (popup) {
          const isDark = darkModeManager.getEffectiveTheme() === 'dark';
          popup.classList.toggle('dark', isDark);
        }
      });
    } else {
      // If Swal isn't loaded yet, check again in 50ms
      setTimeout(checkSwal, 50);
    }
  };
  checkSwal();
}

// Auto-initialize when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSync);
} else {
  initializeSync(); // DOM is already ready
}

export default {
  init: initializeSync,
};