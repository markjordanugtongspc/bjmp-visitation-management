/**
 * Dark Mode Initialization
 * Simple initialization script for dark mode functionality
 * Can be included in any view without conflicts
 */

// Import the dark mode components
import darkModeManager from './dark-mode-manager.js';
import darkModeToggle from './dark-mode-toggle.js';
import flowbiteDarkMode from './flowbite-dark-mode.js';
import sweetAlert2DarkMode from './sweetalert2-dark-mode.js';

/**
 * Initialize dark mode for the current page
 * This function can be called multiple times safely
 */
export function initDarkMode() {
    // Initialize the manager
    darkModeManager.init();
    
    // Initialize the toggle UI
    darkModeToggle.init();
    
    // Initialize SweetAlert2 dark mode integration
    sweetAlert2DarkMode.init();
    
    // Initialize Flowbite dark mode integration
    flowbiteDarkMode.init();
    
    // Add some helpful debugging in development
    if (process.env.NODE_ENV === 'development') {
        console.log('🌙 Dark Mode initialized');
        console.log('Current theme:', darkModeManager.getCurrentTheme());
        console.log('Effective theme:', darkModeManager.getEffectiveTheme());
        console.log('SweetAlert2 integration:', sweetAlert2DarkMode.isReady());
        console.log('Flowbite integration:', flowbiteDarkMode.isReady());
    }
}

/**
 * Get the dark mode manager instance
 * @returns {DarkModeManager} - The dark mode manager
 */
export function getDarkModeManager() {
    return darkModeManager;
}

/**
 * Get the dark mode toggle instance
 * @returns {DarkModeToggle} - The dark mode toggle
 */
export function getDarkModeToggle() {
    return darkModeToggle;
}

/**
 * Quick theme toggle function
 * Can be called from anywhere in the application
 */
export function toggleTheme() {
    darkModeManager.toggle();
}

/**
 * Set theme function
 * @param {string} theme - 'light', 'dark', or 'system'
 */
export function setTheme(theme) {
    darkModeManager.setTheme(theme);
}

/**
 * Check if dark mode is currently active
 * @returns {boolean} - True if dark mode is active
 */
export function isDarkMode() {
    return darkModeManager.isDarkMode();
}

// Auto-initialize when this module is loaded
initDarkMode();

// Make functions available globally for non-module usage
window.initDarkMode = initDarkMode;
window.toggleTheme = toggleTheme;
window.setTheme = setTheme;
window.isDarkMode = isDarkMode;
