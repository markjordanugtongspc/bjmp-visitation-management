/**
 * Flowbite Dark Mode Integration
 * Integrates our custom dark mode system with Flowbite components
 */

import darkModeManager from './dark-mode-manager.js';

class FlowbiteDarkModeIntegration {
    constructor() {
        this.isInitialized = false;
        this.flowbiteComponents = [];
        this.originalInit = null;
    }

    /**
     * Initialize Flowbite dark mode integration
     */
    init() {
        if (this.isInitialized) return;
        
        // Wait for Flowbite to be available
        this.waitForFlowbite(() => {
            this.setupFlowbiteIntegration();
            this.overrideFlowbiteInit();
            this.updateFlowbiteComponents();
            
            // Listen for theme changes
            darkModeManager.onThemeChange((event, theme, effectiveTheme) => {
                this.updateFlowbiteComponents();
            });
            
            this.isInitialized = true;
        });
    }

    /**
     * Wait for Flowbite to be available
     * @param {Function} callback - Callback when Flowbite is ready
     */
    waitForFlowbite(callback) {
        const checkFlowbite = () => {
            if (window.Flowbite) {
                callback();
            } else {
                setTimeout(checkFlowbite, 100);
            }
        };
        checkFlowbite();
    }

    /**
     * Setup Flowbite integration
     */
    setupFlowbiteIntegration() {
        // Store original init method
        this.originalInit = window.Flowbite.init;
        
        // Override Flowbite's theme detection
        this.overrideFlowbiteThemeDetection();
    }

    /**
     * Override Flowbite's theme detection
     */
    overrideFlowbiteThemeDetection() {
        // Override Flowbite's dark mode detection
        if (window.Flowbite) {
            // Store original methods
            const originalGetTheme = window.Flowbite.getTheme;
            const originalSetTheme = window.Flowbite.setTheme;
            
            // Override getTheme to use our system
            window.Flowbite.getTheme = () => {
                return darkModeManager.getEffectiveTheme();
            };
            
            // Override setTheme to use our system
            window.Flowbite.setTheme = (theme) => {
                darkModeManager.setTheme(theme);
            };
        }
    }

    /**
     * Override Flowbite's init method
     */
    overrideFlowbiteInit() {
        if (window.Flowbite && this.originalInit) {
            window.Flowbite.init = (...args) => {
                // Call original init
                const result = this.originalInit.apply(window.Flowbite, args);
                
                // Update components after init
                setTimeout(() => {
                    this.updateFlowbiteComponents();
                }, 100);
                
                return result;
            };
        }
    }

    /**
     * Update all Flowbite components to match current theme
     */
    updateFlowbiteComponents() {
        const effectiveTheme = darkModeManager.getEffectiveTheme();
        
        // Update Flowbite's internal state
        if (window.Flowbite) {
            // Set Flowbite's theme
            window.Flowbite.theme = effectiveTheme;
            
            // Update localStorage for Flowbite compatibility
            localStorage.setItem('flowbite-theme', effectiveTheme);
            
            // Re-initialize specific components that need theme updates
            this.updateSpecificComponents();
        }
    }

    /**
     * Update specific Flowbite components
     */
    updateSpecificComponents() {
        const effectiveTheme = darkModeManager.getEffectiveTheme();
        
        // Update modals
        this.updateModals(effectiveTheme);
        
        // Update dropdowns
        this.updateDropdowns(effectiveTheme);
        
        // Update tooltips
        this.updateTooltips(effectiveTheme);
        
        // Update alerts
        this.updateAlerts(effectiveTheme);
        
        // Update forms
        this.updateForms(effectiveTheme);
    }

    /**
     * Update Flowbite modals
     * @param {string} theme - Current theme
     */
    updateModals(theme) {
        const modals = document.querySelectorAll('[data-modal-target]');
        modals.forEach(modal => {
            const modalElement = document.querySelector(modal.getAttribute('data-modal-target'));
            if (modalElement) {
                // Update modal backdrop
                const backdrop = modalElement.querySelector('.fixed.inset-0');
                if (backdrop) {
                    backdrop.className = backdrop.className.replace(/bg-\w+-\d+\/50/g, 
                        theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-900/50'
                    );
                }
                
                // Update modal content
                const content = modalElement.querySelector('.relative');
                if (content) {
                    content.className = content.className.replace(/bg-\w+/g, 
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    );
                    content.className = content.className.replace(/text-\w+-\d+/g, 
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    );
                }
            }
        });
    }

    /**
     * Update Flowbite dropdowns
     * @param {string} theme - Current theme
     */
    updateDropdowns(theme) {
        const dropdowns = document.querySelectorAll('[data-dropdown-toggle]');
        dropdowns.forEach(dropdown => {
            const menu = document.querySelector(dropdown.getAttribute('data-dropdown-target'));
            if (menu) {
                menu.className = menu.className.replace(/bg-\w+/g, 
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                );
                menu.className = menu.className.replace(/border-\w+-\d+/g, 
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                );
                menu.className = menu.className.replace(/text-\w+-\d+/g, 
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                );
            }
        });
    }

    /**
     * Update Flowbite tooltips
     * @param {string} theme - Current theme
     */
    updateTooltips(theme) {
        const tooltips = document.querySelectorAll('[data-tooltip-target]');
        tooltips.forEach(tooltip => {
            const tooltipElement = document.querySelector(tooltip.getAttribute('data-tooltip-target'));
            if (tooltipElement) {
                tooltipElement.className = tooltipElement.className.replace(/bg-\w+-\d+/g, 
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-900'
                );
                tooltipElement.className = tooltipElement.className.replace(/text-\w+/g, 
                    theme === 'dark' ? 'text-white' : 'text-white'
                );
            }
        });
    }

    /**
     * Update Flowbite alerts
     * @param {string} theme - Current theme
     */
    updateAlerts(theme) {
        const alerts = document.querySelectorAll('[role="alert"]');
        alerts.forEach(alert => {
            // Update alert background and text colors based on theme
            const alertClasses = alert.className;
            if (theme === 'dark') {
                alert.className = alertClasses.replace(/bg-\w+-\d+/g, 'bg-gray-800')
                    .replace(/text-\w+-\d+/g, 'text-gray-200')
                    .replace(/border-\w+-\d+/g, 'border-gray-700');
            } else {
                alert.className = alertClasses.replace(/bg-gray-800/g, 'bg-white')
                    .replace(/text-gray-200/g, 'text-gray-900')
                    .replace(/border-gray-700/g, 'border-gray-200');
            }
        });
    }

    /**
     * Update Flowbite forms
     * @param {string} theme - Current theme
     */
    updateForms(theme) {
        const formElements = document.querySelectorAll('input, select, textarea');
        formElements.forEach(element => {
            if (element.classList.contains('bg-white') || element.classList.contains('bg-gray-50')) {
                element.className = element.className.replace(/bg-\w+/g, 
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                );
                element.className = element.className.replace(/text-\w+-\d+/g, 
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                );
                element.className = element.className.replace(/border-\w+-\d+/g, 
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                );
            }
        });
    }

    /**
     * Force update all Flowbite components
     */
    forceUpdate() {
        this.updateFlowbiteComponents();
    }

    /**
     * Check if integration is initialized
     * @returns {boolean}
     */
    isReady() {
        return this.isInitialized;
    }
}

// Create global instance
const flowbiteDarkMode = new FlowbiteDarkModeIntegration();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => flowbiteDarkMode.init());
} else {
    flowbiteDarkMode.init();
}

// Export for module usage
export default flowbiteDarkMode;

// Also make available globally
window.FlowbiteDarkMode = flowbiteDarkMode;
