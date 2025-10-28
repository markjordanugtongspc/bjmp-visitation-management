/**
 * Dark Mode Manager
 * Based on Tailwind CSS and Flowbite official documentation
 * https://tailwindcss.com/docs/dark-mode
 * https://flowbite.com/docs/customize/dark-mode/
 */

class DarkModeManager {
  constructor() {
    this.themes = { DARK: 'dark', LIGHT: 'light', SYSTEM: 'system' };
    this.storageKey = 'color-theme'; // Flowbite standard key
    this.current = null;
  }
  
  /**
   * Initialize - Following Flowbite pattern
   * Checks localStorage first, then system preference
   */
  init() {
    this.loadTheme();
    this.applyTheme();
    this.watchSystemTheme();
  }
  
  /**
   * Load theme from localStorage or default to dark
   * Flowbite pattern: check 'color-theme' in localStorage
   */
  loadTheme() {
    const stored = localStorage.getItem(this.storageKey);
    
    if (stored && Object.values(this.themes).includes(stored)) {
      this.current = stored;
    } else {
      // Default to dark if nothing saved
      this.current = this.themes.DARK;
      this.saveTheme();
    }
  }
  
  /**
   * Save current theme to localStorage
   */
  saveTheme() {
    localStorage.setItem(this.storageKey, this.current);
  }
  
  /**
   * Apply theme to DOM
   * Tailwind pattern: toggle 'dark' class on html element
   */
  applyTheme() {
    const effective = this.getEffectiveTheme();
    
    if (effective === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  
  /**
   * Get effective theme (resolves 'system' to actual theme)
   */
  getEffectiveTheme() {
    if (this.current === this.themes.SYSTEM) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' : 'light';
    }
    return this.current;
  }
  
  /**
   * Toggle theme: dark → system → light → dark
   */
  toggle() {
    this.current = (this.current === this.themes.DARK) ? this.themes.LIGHT : this.themes.DARK;
    
    this.applyTheme();
    this.saveTheme();
  }
  
  /**
   * Set specific theme
   */
  setTheme(theme) {
    if (Object.values(this.themes).includes(theme)) {
      this.current = theme;
      this.applyTheme();
      this.saveTheme();
    }
  }
  
  /**
   * Watch for system theme changes (when on 'system' mode)
   */
  watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', () => {
        if (this.current === this.themes.SYSTEM) {
          this.applyTheme();
        }
      });
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(() => {
        if (this.current === this.themes.SYSTEM) {
          this.applyTheme();
        }
      });
    }
  }
  
  /**
   * Check if dark mode is active
   */
  isDark() {
    return this.getEffectiveTheme() === 'dark';
  }
  
  /**
   * Get current theme setting
   */
  getCurrentTheme() {
    return this.current;
  }
}

// Export singleton
export default new DarkModeManager();
