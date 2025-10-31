/**
 * Theme Manager - Centralized Dark/Light Mode Management
 * Handles theme switching, persistence, and SweetAlert2 theming
 */

class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'bjmp-theme-preference';
    this.THEMES = {
      LIGHT: 'light',
      DARK: 'dark',
      SYSTEM: 'system'
    };
    
    // Color palette for consistent theming
    this.PALETTE = {
      light: {
        primary: '#2563EB',
        danger: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        info: '#3B82F6',
        background: '#FFFFFF',
        text: '#111827',
        border: '#E5E7EB',
        cardBg: '#F9FAFB',
        inputBg: '#FFFFFF',
        inputBorder: '#D1D5DB'
      },
      dark: {
        primary: '#3B82F6',
        danger: '#EF4444',
        success: '#10B981',
        warning: '#FBBF24',
        info: '#60A5FA',
        background: '#0F172A',
        text: '#F9FAFB',
        border: '#374151',
        cardBg: '#1E293B',
        inputBg: '#1E293B',
        inputBorder: '#374151'
      }
    };

    this.init();
  }

  /**
   * Initialize theme manager
   */
  init() {
    // Apply saved theme or system preference
    this.applyTheme(this.getSavedTheme());
    
    // Update toggle buttons to reflect current theme
    this.updateToggleButtons();
    
    // Listen for system theme changes
    this.watchSystemTheme();
    
    // Setup theme toggle listeners
    this.setupToggleListeners();
  }

  /**
   * Get saved theme preference
   */
  getSavedTheme() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved || this.THEMES.LIGHT;
  }

  /**
   * Get current active theme (light or dark)
   */
  getCurrentTheme() {
    if (document.documentElement.classList.contains('dark')) {
      return this.THEMES.DARK;
    }
    return this.THEMES.LIGHT;
  }

  /**
   * Check if dark mode is active
   */
  isDarkMode() {
    return this.getCurrentTheme() === this.THEMES.DARK;
  }

  /**
   * Get system theme preference
   */
  getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return this.THEMES.DARK;
    }
    return this.THEMES.LIGHT;
  }

  /**
   * Apply theme to document
   */
  applyTheme(theme) {
    const html = document.documentElement;
    
    if (theme === this.THEMES.SYSTEM) {
      theme = this.getSystemTheme();
    }

    if (theme === this.THEMES.DARK) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // Store preference
    localStorage.setItem(this.STORAGE_KEY, theme);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: this.getCurrentTheme() } 
    }));

    // Update Flowbite components if available
    if (window.Flowbite) {
      window.Flowbite.initFlowbite();
    }
  }

  /**
   * Toggle between light and dark mode
   */
  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === this.THEMES.DARK ? this.THEMES.LIGHT : this.THEMES.DARK;
    this.applyTheme(newTheme);
  }

  /**
   * Set specific theme
   */
  setTheme(theme) {
    if (Object.values(this.THEMES).includes(theme)) {
      this.applyTheme(theme);
    }
  }

  /**
   * Watch for system theme changes
   */
  watchSystemTheme() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        const savedTheme = this.getSavedTheme();
        if (savedTheme === this.THEMES.SYSTEM) {
          this.applyTheme(this.THEMES.SYSTEM);
        }
      });
    }
  }

  /**
   * Setup theme toggle button listeners
   */
  setupToggleListeners() {
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('[data-theme-toggle]');
      if (toggleBtn) {
        e.preventDefault();
        this.toggleTheme();
        this.updateToggleButtons();
      }
    });
  }

  /**
   * Update all theme toggle buttons
   */
  updateToggleButtons() {
    const isDark = this.isDarkMode();
    const toggleButtons = document.querySelectorAll('[data-theme-toggle]');
    
    toggleButtons.forEach(btn => {
      const lightIcon = btn.querySelector('[data-theme-icon="light"]');
      const darkIcon = btn.querySelector('[data-theme-icon="dark"]');
      
      if (lightIcon && darkIcon) {
        if (isDark) {
          lightIcon.classList.remove('hidden');
          darkIcon.classList.add('hidden');
        } else {
          lightIcon.classList.add('hidden');
          darkIcon.classList.remove('hidden');
        }
      }
    });
  }

  /**
   * Get current palette based on theme
   */
  getPalette() {
    return this.isDarkMode() ? this.PALETTE.dark : this.PALETTE.light;
  }

  /**
   * Get themed SweetAlert2 configuration
   */
  getSwalConfig(options = {}) {
    const palette = this.getPalette();
    const isDark = this.isDarkMode();

    const baseConfig = {
      background: palette.background,
      color: palette.text,
      confirmButtonColor: options.confirmButtonColor || palette.primary,
      cancelButtonColor: palette.border,
      iconColor: options.iconColor,
      customClass: {
        popup: isDark ? 'dark-mode-swal' : 'light-mode-swal',
        title: isDark ? 'text-gray-100' : 'text-gray-900',
        htmlContainer: isDark ? 'text-gray-300' : 'text-gray-700',
        confirmButton: 'font-medium rounded-lg text-sm px-5 py-2.5',
        cancelButton: 'font-medium rounded-lg text-sm px-5 py-2.5',
        input: isDark 
          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
      }
    };

    return { ...baseConfig, ...options };
  }

  /**
   * Show themed SweetAlert2 modal
   */
  showAlert(options = {}) {
    const config = this.getSwalConfig(options);
    return window.Swal.fire(config);
  }

  /**
   * Show themed confirmation dialog
   */
  showConfirm(options = {}) {
    const palette = this.getPalette();
    const defaultOptions = {
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      confirmButtonColor: options.variant === 'danger' ? palette.danger : palette.primary,
      icon: options.icon || 'question'
    };
    
    return this.showAlert({ ...defaultOptions, ...options });
  }

  /**
   * Show themed toast notification
   */
  showToast(options = {}) {
    const palette = this.getPalette();
    const isDark = this.isDarkMode();

    const defaultOptions = {
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: palette.cardBg,
      color: palette.text,
      customClass: {
        popup: isDark ? 'dark-mode-toast' : 'light-mode-toast',
        title: isDark ? 'text-gray-100' : 'text-gray-900'
      }
    };

    return window.Swal.fire({ ...defaultOptions, ...options });
  }

  /**
   * Show success toast
   */
  showSuccess(message, title = 'Success') {
    return this.showToast({
      icon: 'success',
      title: title,
      text: message
    });
  }

  /**
   * Show error toast
   */
  showError(message, title = 'Error') {
    return this.showToast({
      icon: 'error',
      title: title,
      text: message
    });
  }

  /**
   * Show warning toast
   */
  showWarning(message, title = 'Warning') {
    return this.showToast({
      icon: 'warning',
      title: title,
      text: message
    });
  }

  /**
   * Show info toast
   */
  showInfo(message, title = 'Info') {
    return this.showToast({
      icon: 'info',
      title: title,
      text: message
    });
  }
}

// Initialize and expose globally
const themeManager = new ThemeManager();
window.ThemeManager = themeManager;

// Export for module usage
export default themeManager;
