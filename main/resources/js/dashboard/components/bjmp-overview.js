/**
 * BJMP Overview Component
 * Handles dropdown toggles, animations, and theme management for the BJMP overview page
 */

class BJMPOverview {
    constructor() {
        this.init();
    }

    /**
     * Initialize the BJMP Overview component
     */
    init() {
        this.setupDropdowns();
        this.setupAnimations();
        this.setupThemeManagement();
        this.setupScrollToTop();
    }

    /**
     * Setup dropdown functionality with smooth animations
     */
    setupDropdowns() {
        // Add click listeners to dropdown buttons
        document.addEventListener('click', (e) => {
            const dropdownButton = e.target.closest('[data-dropdown-toggle]');
            if (dropdownButton) {
                e.preventDefault();
                this.toggleDropdown(dropdownButton.dataset.dropdownToggle);
            }
        });

        // Initialize dropdown styles
        this.initializeDropdownStyles();
    }

    /**
     * Toggle dropdown with smooth animation
     */
    toggleDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        const icon = document.getElementById(`${dropdownId}-icon`);
        
        if (!dropdown || !icon) return;

        if (dropdown.classList.contains('hidden')) {
            dropdown.classList.remove('hidden');
            // Trigger animation
            requestAnimationFrame(() => {
                dropdown.style.opacity = '1';
                dropdown.style.transform = 'translateY(0)';
            });
            icon.style.transform = 'rotate(180deg)';
        } else {
            dropdown.style.opacity = '0';
            dropdown.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                dropdown.classList.add('hidden');
            }, 200);
            icon.style.transform = 'rotate(0deg)';
        }
    }

    /**
     * Initialize dropdown styles for smooth transitions
     */
    initializeDropdownStyles() {
        const dropdowns = ['command-group', 'directorates', 'support-services'];
        dropdowns.forEach(id => {
            const dropdown = document.getElementById(id);
            if (dropdown) {
                dropdown.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
                dropdown.style.opacity = '0';
                dropdown.style.transform = 'translateY(-10px)';
            }
        });
    }

    /**
     * Setup scroll reveal animations using Intersection Observer
     */
    setupAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('animate-fade-in-up');
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, parseInt(delay));
                }
            });
        }, observerOptions);

        // Add custom animation styles if not already present
        this.addAnimationStyles();

        // Observe all sections with animation classes
        document.querySelectorAll('[data-animate]').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(el);
        });
    }

    /**
     * Setup theme management integration
     */
    setupThemeManagement() {
        // Listen for theme changes
        window.addEventListener('themeChanged', (e) => {
            this.handleThemeChange(e.detail.theme);
        });

        // Apply current theme on load
        if (typeof ThemeManager !== 'undefined') {
            this.handleThemeChange(ThemeManager.getCurrentTheme());
        }

        // Add theme toggle functionality if needed
        this.setupThemeToggle();
    }

    /**
     * Handle theme change events
     */
    handleThemeChange(theme) {
        const isDark = theme === 'dark';
        
        // Update any theme-specific elements
        this.updateThemeElements(isDark);
        
        // Store current theme state
        this.currentTheme = theme;
    }

    /**
     * Update theme-specific elements
     */
    updateThemeElements(isDark) {
        // Update hero section gradient
        const heroSection = document.querySelector('[data-hero-section]');
        if (heroSection) {
            if (isDark) {
                heroSection.classList.add('dark:bg-blue-800');
                heroSection.classList.remove('bg-blue-600');
            } else {
                heroSection.classList.add('bg-blue-600');
                heroSection.classList.remove('dark:bg-blue-800');
            }
        }

        // Update core values section
        const coreValuesSection = document.querySelector('[data-core-values]');
        if (coreValuesSection) {
            if (isDark) {
                coreValuesSection.classList.add('dark:bg-blue-800');
                coreValuesSection.classList.remove('bg-blue-600');
            } else {
                coreValuesSection.classList.add('bg-blue-600');
                coreValuesSection.classList.remove('dark:bg-blue-800');
            }
        }
    }

    /**
     * Setup theme toggle functionality
     */
    setupThemeToggle() {
        // Add theme toggle button listener if it exists
        const themeToggle = document.querySelector('[data-theme-toggle]');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                if (typeof ThemeManager !== 'undefined') {
                    ThemeManager.toggleTheme();
                }
            });
        }
    }

    /**
     * Setup scroll to top functionality
     */
    setupScrollToTop() {
        const scrollToTopButtons = document.querySelectorAll('[data-scroll-to-top]');
        scrollToTopButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        });
    }

    /**
     * Public method to refresh animations
     */
    refreshAnimations() {
        this.setupAnimations();
    }

    /**
     * Add custom animation styles to the document
     */
    addAnimationStyles() {
        const styleId = 'bjmp-overview-animations';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Public method to destroy component
     */
    destroy() {
        // Clean up event listeners and observers
        document.removeEventListener('click', this.setupDropdowns);
        window.removeEventListener('themeChanged', this.handleThemeChange);
        
        // Remove animation styles
        const style = document.getElementById('bjmp-overview-animations');
        if (style) {
            style.remove();
        }
    }
}

// Initialize and expose globally
const bjmpOverview = new BJMPOverview();
window.BJMPOverview = bjmpOverview;

// Export for module usage
export default bjmpOverview;
