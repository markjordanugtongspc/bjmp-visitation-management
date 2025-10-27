/**
 * Dark Mode Toggle Component
 * Handles UI interactions for dark mode toggles
 * Works with the DarkModeManager for seamless integration
 */

import darkModeManager from './dark-mode-manager.js';

class DarkModeToggle {
    constructor() {
        this.isInitialized = false;
        this.toggleElements = [];
        this.dropdownElements = [];
        this.callbacks = [];
    }

    /**
     * Initialize all dark mode toggle elements
     */
    init() {
        if (this.isInitialized) return;
        
        this.setupToggleElements();
        this.setupDropdownElements();
        this.setupKeyboardNavigation();
        this.setupClickOutside();
        
        // Listen for theme changes to update UI
        darkModeManager.onThemeChange((event, theme, effectiveTheme) => {
            this.updateToggleStates();
            this.updateDropdownStates();
            this.updateThemeIndicators();
        });
        
        this.isInitialized = true;
    }

    /**
     * Setup toggle switch elements
     */
    setupToggleElements() {
        this.toggleElements = document.querySelectorAll('[data-theme-toggle]');
        
        this.toggleElements.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleToggleClick();
            });
        });
    }

    /**
     * Setup dropdown elements
     */
    setupDropdownElements() {
        this.dropdownElements = document.querySelectorAll('[data-theme-dropdown-toggle]');
        
        this.dropdownElements.forEach(dropdown => {
            const menu = dropdown.nextElementSibling;
            if (!menu || !menu.hasAttribute('data-theme-dropdown-menu')) return;
            
            // Toggle dropdown
            dropdown.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDropdown(menu);
            });
            
            // Setup option buttons
            const options = menu.querySelectorAll('[data-theme-option]');
            options.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const theme = option.getAttribute('data-theme-option');
                    this.handleThemeSelection(theme);
                    this.closeAllDropdowns();
                });
            });
        });
    }

    /**
     * Handle toggle switch click
     */
    handleToggleClick() {
        darkModeManager.toggle();
        this.notifyCallbacks('toggleClicked');
    }

    /**
     * Handle theme selection from dropdown
     * @param {string} theme - Selected theme
     */
    handleThemeSelection(theme) {
        darkModeManager.setTheme(theme);
        this.notifyCallbacks('themeSelected', theme);
    }

    /**
     * Toggle dropdown menu
     * @param {HTMLElement} menu - Dropdown menu element
     */
    toggleDropdown(menu) {
        const isOpen = !menu.classList.contains('hidden');
        
        // Close all other dropdowns first
        this.closeAllDropdowns();
        
        if (!isOpen) {
            menu.classList.remove('hidden');
            this.setupDropdownPositioning(menu);
        }
    }

    /**
     * Close all dropdown menus
     */
    closeAllDropdowns() {
        const menus = document.querySelectorAll('[data-theme-dropdown-menu]');
        menus.forEach(menu => {
            menu.classList.add('hidden');
        });
    }

    /**
     * Setup dropdown positioning
     * @param {HTMLElement} menu - Dropdown menu element
     */
    setupDropdownPositioning(menu) {
        const rect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Check if dropdown goes off screen
        if (rect.right > viewportWidth) {
            menu.classList.add('right-0');
        }
        
        if (rect.bottom > viewportHeight) {
            menu.classList.add('bottom-full', 'mb-2');
        }
    }

    /**
     * Update toggle switch states
     */
    updateToggleStates() {
        const isDark = darkModeManager.isDarkMode();
        
        this.toggleElements.forEach(toggle => {
            toggle.setAttribute('aria-pressed', isDark);
            toggle.classList.toggle('active', isDark);
        });
    }

    /**
     * Update dropdown states
     */
    updateDropdownStates() {
        const currentTheme = darkModeManager.getCurrentTheme();
        const effectiveTheme = darkModeManager.getEffectiveTheme();
        
        // Update dropdown button icons
        this.dropdownElements.forEach(dropdown => {
            const sunIcon = dropdown.querySelector('svg:first-child');
            const moonIcon = dropdown.querySelector('svg:nth-child(2)');
            
            if (sunIcon && moonIcon) {
                sunIcon.classList.toggle('hidden', effectiveTheme === 'dark');
                moonIcon.classList.toggle('hidden', effectiveTheme === 'light');
            }
        });
        
        // Update checkmarks in dropdown menus
        const menus = document.querySelectorAll('[data-theme-dropdown-menu]');
        menus.forEach(menu => {
            const checks = menu.querySelectorAll('[data-theme-check]');
            checks.forEach(check => {
                const theme = check.getAttribute('data-theme-check');
                check.classList.toggle('hidden', theme !== currentTheme);
            });
        });
    }

    /**
     * Update theme indicators
     */
    updateThemeIndicators() {
        const effectiveTheme = darkModeManager.getEffectiveTheme();
        const indicators = document.querySelectorAll('[data-theme-indicator]');
        
        indicators.forEach(indicator => {
            // Check if this is a mobile dropdown indicator
            const isMobileDropdown = indicator.closest('[data-theme-toggle]') && 
                                   indicator.closest('[data-theme-toggle]').classList.contains('w-full');
            
            if (isMobileDropdown) {
                indicator.textContent = effectiveTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
            } else {
                indicator.textContent = effectiveTheme === 'dark' ? 'Dark' : 'Light';
            }
        });
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Toggle with Ctrl/Cmd + Shift + D
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.handleToggleClick();
            }
            
            // Close dropdowns with Escape
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });
    }

    /**
     * Setup click outside to close dropdowns
     */
    setupClickOutside() {
        document.addEventListener('click', (e) => {
            const isDropdownToggle = e.target.closest('[data-theme-dropdown-toggle]');
            const isDropdownMenu = e.target.closest('[data-theme-dropdown-menu]');
            
            if (!isDropdownToggle && !isDropdownMenu) {
                this.closeAllDropdowns();
            }
        });
    }

    /**
     * Add callback for toggle events
     * @param {Function} callback - Function to call on toggle events
     */
    onToggle(callback) {
        if (typeof callback === 'function') {
            this.callbacks.push(callback);
        }
    }

    /**
     * Notify callbacks of toggle events
     * @param {string} event - Event type
     * @param {*} data - Event data
     */
    notifyCallbacks(event, data) {
        this.callbacks.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.warn('Toggle callback error:', error);
            }
        });
    }

    /**
     * Programmatically trigger toggle
     */
    triggerToggle() {
        this.handleToggleClick();
    }

    /**
     * Programmatically set theme
     * @param {string} theme - Theme to set
     */
    setTheme(theme) {
        this.handleThemeSelection(theme);
    }

    /**
     * Get current toggle state
     * @returns {boolean} - True if dark mode is active
     */
    isDarkMode() {
        return darkModeManager.isDarkMode();
    }

    /**
     * Get current theme setting
     * @returns {string} - Current theme setting
     */
    getCurrentTheme() {
        return darkModeManager.getCurrentTheme();
    }

    /**
     * Destroy the toggle component
     */
    destroy() {
        this.toggleElements = [];
        this.dropdownElements = [];
        this.callbacks = [];
        this.isInitialized = false;
    }
}

// Create global instance
const darkModeToggle = new DarkModeToggle();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => darkModeToggle.init());
} else {
    darkModeToggle.init();
}

// Export for module usage
export default darkModeToggle;

// Also make available globally for non-module usage
window.DarkModeToggle = darkModeToggle;
