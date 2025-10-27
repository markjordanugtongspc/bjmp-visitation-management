/**
 * Dark Mode Manager
 * A comprehensive dark mode toggle system for the entire application
 * Supports manual toggle, system preference detection, and persistence
 */

class DarkModeManager {
    constructor() {
        this.storageKey = 'color-theme'; // Flowbite compatible
        this.userStorageKey = 'user-theme-preference';
        this.systemThemeKey = 'system-theme';
        this.themeOptions = {
            LIGHT: 'light',
            DARK: 'dark',
            SYSTEM: 'system'
        };
        
        this.currentTheme = this.themeOptions.SYSTEM;
        this.isInitialized = false;
        this.callbacks = [];
        this.currentUserId = null;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.toggle = this.toggle.bind(this);
        this.setTheme = this.setTheme.bind(this);
        this.getSystemTheme = this.getSystemTheme.bind(this);
        this.updateDOM = this.updateDOM.bind(this);
        this.savePreference = this.savePreference.bind(this);
        this.loadPreference = this.loadPreference.bind(this);
        this.setUserId = this.setUserId.bind(this);
        this.getUserThemeKey = this.getUserThemeKey.bind(this);
    }

    /**
     * Set current user ID for user-specific theme preferences
     * @param {string|number} userId - User ID
     */
    setUserId(userId) {
        this.currentUserId = userId;
        // Reload preferences for the new user
        this.loadPreference();
        this.updateDOM();
    }

    /**
     * Get user-specific theme storage key
     * @param {string|number} userId - User ID
     * @returns {string} - Storage key
     */
    getUserThemeKey(userId = this.currentUserId) {
        return userId ? `${this.userStorageKey}-${userId}` : this.storageKey;
    }

    /**
     * Detect user ID from page meta or global variables
     */
    detectUserId() {
        // Try to get user ID from meta tag
        const userIdMeta = document.querySelector('meta[name="user-id"]');
        if (userIdMeta) {
            this.currentUserId = userIdMeta.content;
            return;
        }
        
        // Try to get from global Laravel user object
        if (window.Laravel && window.Laravel.user && window.Laravel.user.id) {
            this.currentUserId = window.Laravel.user.id;
            return;
        }
        
        // Try to get from Auth object
        if (window.Auth && window.Auth.user && window.Auth.user.id) {
            this.currentUserId = window.Auth.user.id;
            return;
        }
    }

    /**
     * Initialize the dark mode manager
     * Should be called once when the page loads
     */
    init() {
        if (this.isInitialized) return;
        
        // Try to get user ID from meta tag or global variable
        this.detectUserId();
        
        // Load saved preference
        this.loadPreference();
        
        // Set initial theme
        this.updateDOM();
        
        // Listen for system theme changes
        this.setupSystemThemeListener();
        
        // Initialize Flowbite dark mode
        this.initializeFlowbiteDarkMode();
        
        this.isInitialized = true;
        this.notifyCallbacks('initialized', this.currentTheme);
    }

    /**
     * Initialize Flowbite dark mode compatibility
     */
    initializeFlowbiteDarkMode() {
        // Set up Flowbite's expected localStorage key
        const effectiveTheme = this.getEffectiveTheme();
        localStorage.setItem('color-theme', effectiveTheme);
        
        // Update Flowbite components if they exist
        if (window.Flowbite) {
            this.updateFlowbiteComponents();
        }
    }

    /**
     * Update Flowbite components to match current theme
     */
    updateFlowbiteComponents() {
        if (!window.Flowbite) return;
        
        const effectiveTheme = this.getEffectiveTheme();
        
        // Update Flowbite's internal theme state
        if (window.Flowbite.init) {
            // Re-initialize Flowbite components with new theme
            setTimeout(() => {
                try {
                    window.Flowbite.init();
                } catch (error) {
                    console.warn('Could not reinitialize Flowbite:', error);
                }
            }, 100);
        }
    }

    /**
     * Toggle between light and dark mode
     * Cycles: system -> light -> dark -> system
     */
    toggle() {
        const cycle = [this.themeOptions.SYSTEM, this.themeOptions.LIGHT, this.themeOptions.DARK];
        const currentIndex = cycle.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % cycle.length;
        
        this.setTheme(cycle[nextIndex]);
    }

    /**
     * Set specific theme
     * @param {string} theme - 'light', 'dark', or 'system'
     */
    setTheme(theme) {
        if (!Object.values(this.themeOptions).includes(theme)) {
            console.warn(`Invalid theme: ${theme}. Using system theme.`);
            theme = this.themeOptions.SYSTEM;
        }
        
        this.currentTheme = theme;
        this.updateDOM();
        this.savePreference();
        this.notifyCallbacks('themeChanged', this.currentTheme);
    }

    /**
     * Get current effective theme (resolves 'system' to actual theme)
     * @returns {string} - 'light' or 'dark'
     */
    getEffectiveTheme() {
        if (this.currentTheme === this.themeOptions.SYSTEM) {
            return this.getSystemTheme();
        }
        return this.currentTheme;
    }

    /**
     * Get system theme preference
     * @returns {string} - 'light' or 'dark'
     */
    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches 
            ? this.themeOptions.DARK 
            : this.themeOptions.LIGHT;
    }

    /**
     * Update DOM classes based on current theme
     */
    updateDOM() {
        const html = document.documentElement;
        const effectiveTheme = this.getEffectiveTheme();
        
        // Remove existing theme classes
        html.classList.remove('light', 'dark');
        
        // Add current theme class
        html.classList.add(effectiveTheme);
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(effectiveTheme);
        
        // Update any theme indicators in the UI
        this.updateThemeIndicators();
    }

    /**
     * Update meta theme-color for mobile browsers
     * @param {string} theme - 'light' or 'dark'
     */
    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        // Use your brand colors
        const colors = {
            light: '#ffffff',
            dark: '#0f172a' // slate-900
        };
        
        metaThemeColor.content = colors[theme] || colors.light;
    }

    /**
     * Update theme indicators in the UI
     */
    updateThemeIndicators() {
        // Update any elements with data-theme-indicator attribute
        const indicators = document.querySelectorAll('[data-theme-indicator]');
        indicators.forEach(indicator => {
            const effectiveTheme = this.getEffectiveTheme();
            indicator.textContent = effectiveTheme === this.themeOptions.DARK ? 'Dark' : 'Light';
        });

        // Update toggle button states
        const toggles = document.querySelectorAll('[data-theme-toggle]');
        toggles.forEach(toggle => {
            const isDark = this.getEffectiveTheme() === this.themeOptions.DARK;
            toggle.setAttribute('aria-pressed', isDark);
            toggle.classList.toggle('active', isDark);
        });
    }

    /**
     * Setup listener for system theme changes
     */
    setupSystemThemeListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleSystemThemeChange = (e) => {
            if (this.currentTheme === this.themeOptions.SYSTEM) {
                this.updateDOM();
                this.notifyCallbacks('systemThemeChanged', this.getSystemTheme());
            }
        };
        
        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleSystemThemeChange);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handleSystemThemeChange);
        }
    }

    /**
     * Save theme preference to localStorage and cookies
     */
    savePreference() {
        try {
            const userKey = this.getUserThemeKey();
            const effectiveTheme = this.getEffectiveTheme();
            
            // Save to localStorage (user-specific)
            localStorage.setItem(userKey, this.currentTheme);
            
            // Save to Flowbite's expected key
            localStorage.setItem(this.storageKey, effectiveTheme);
            
            // Save to cookies for server-side access
            this.setCookie('theme-preference', this.currentTheme, 365);
            this.setCookie('effective-theme', effectiveTheme, 365);
            
            // Update Flowbite components
            this.updateFlowbiteComponents();
            
        } catch (error) {
            console.warn('Could not save theme preference:', error);
        }
    }

    /**
     * Load theme preference from localStorage or cookies
     */
    loadPreference() {
        try {
            const userKey = this.getUserThemeKey();
            let saved = localStorage.getItem(userKey);
            
            // Fallback to global preference if no user-specific preference
            if (!saved) {
                saved = localStorage.getItem(this.storageKey);
            }
            
            // Fallback to cookie if no localStorage
            if (!saved) {
                saved = this.getCookie('theme-preference');
            }
            
            if (saved && Object.values(this.themeOptions).includes(saved)) {
                this.currentTheme = saved;
            } else {
                // Default to system preference
                this.currentTheme = this.themeOptions.SYSTEM;
            }
        } catch (error) {
            console.warn('Could not load theme preference:', error);
        }
    }

    /**
     * Set cookie with expiration
     * @param {string} name - Cookie name
     * @param {string} value - Cookie value
     * @param {number} days - Expiration days
     */
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }

    /**
     * Get cookie value
     * @param {string} name - Cookie name
     * @returns {string|null} - Cookie value
     */
    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    /**
     * Add callback for theme changes
     * @param {Function} callback - Function to call on theme changes
     */
    onThemeChange(callback) {
        if (typeof callback === 'function') {
            this.callbacks.push(callback);
        }
    }

    /**
     * Notify all callbacks of theme changes
     * @param {string} event - Event type
     * @param {string} theme - Current theme
     */
    notifyCallbacks(event, theme) {
        this.callbacks.forEach(callback => {
            try {
                callback(event, theme, this.getEffectiveTheme());
            } catch (error) {
                console.warn('Theme callback error:', error);
            }
        });
    }

    /**
     * Get current theme
     * @returns {string} - Current theme setting
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Check if dark mode is currently active
     * @returns {boolean}
     */
    isDarkMode() {
        return this.getEffectiveTheme() === this.themeOptions.DARK;
    }

    /**
     * Check if light mode is currently active
     * @returns {boolean}
     */
    isLightMode() {
        return this.getEffectiveTheme() === this.themeOptions.LIGHT;
    }

    /**
     * Check if system theme is being used
     * @returns {boolean}
     */
    isSystemTheme() {
        return this.currentTheme === this.themeOptions.SYSTEM;
    }

    /**
     * Destroy the manager and clean up listeners
     */
    destroy() {
        this.callbacks = [];
        this.isInitialized = false;
    }
}

// Create global instance
const darkModeManager = new DarkModeManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => darkModeManager.init());
} else {
    darkModeManager.init();
}

// Export for module usage
export default darkModeManager;

// Also make available globally for non-module usage
window.DarkModeManager = darkModeManager;
