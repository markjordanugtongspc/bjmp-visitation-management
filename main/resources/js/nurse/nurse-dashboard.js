/**
 * Nurse Dashboard Main File
 * Orchestrates all nurse dashboard components and functionality
 */

// Import required components
import { initializeInmateSelector } from './components/inmate-selector.js';
import { initializeMedicalCard } from './components/medical-card.js';
import { initializeMedicalVisitationScheduler } from './components/medical-visitation-scheduler.js';

// Import role-based navigation
import initRoleBasedNavigation from '../dashboard/components/role-based.js';

/**
 * Nurse Dashboard Manager Class
 * Main orchestrator for all nurse dashboard functionality
 */
class NurseDashboardManager {
    constructor() {
        this.components = {
            inmateSelector: null,
            medicalCard: null,
            medicalScheduler: null
        };
        
        this.isInitialized = false;
    }

    /**
     * Initialize all nurse dashboard components
     * Sets up the complete nurse dashboard functionality
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('Nurse Dashboard already initialized');
            return;
        }

        try {
            console.log('Initializing Nurse Dashboard...');

            // Initialize role-based navigation first
            this.initializeRoleBasedNavigation();

            // Initialize core components
            await this.initializeComponents();

            // Set up global error handling
            this.setupErrorHandling();

            // Mark as initialized
            this.isInitialized = true;

            console.log('Nurse Dashboard initialized successfully');

        } catch (error) {
            console.error('Error initializing Nurse Dashboard:', error);
            this.showInitializationError();
        }
    }

    /**
     * Initialize role-based navigation
     * Sets up dynamic sidebar based on user role
     */
    initializeRoleBasedNavigation() {
        try {
            // Initialize the role-based navigation system
            initRoleBasedNavigation();
            console.log('Role-based navigation initialized');
        } catch (error) {
            console.error('Error initializing role-based navigation:', error);
        }
    }

    /**
     * Initialize all dashboard components
     * Creates and configures all component instances
     */
    async initializeComponents() {
        try {
            // Initialize Inmate Selector
            this.components.inmateSelector = initializeInmateSelector();
            console.log('Inmate Selector initialized');

            // Initialize Medical Card
            this.components.medicalCard = initializeMedicalCard();
            console.log('Medical Card initialized');

            // Initialize Medical Visitation Scheduler
            this.components.medicalScheduler = initializeMedicalVisitationScheduler();
            console.log('Medical Visitation Scheduler initialized');

            // Set up component communication
            this.setupComponentCommunication();

        } catch (error) {
            console.error('Error initializing components:', error);
            throw error;
        }
    }

    /**
     * Set up communication between components
     * Ensures components can interact with each other properly
     */
    setupComponentCommunication() {
        // Listen for global events that components might need
        document.addEventListener('inmateSelected', (e) => {
            console.log('Inmate selected:', e.detail.inmate);
            // Additional global handling if needed
        });

        document.addEventListener('inmateCleared', () => {
            console.log('Inmate selection cleared');
            // Additional global handling if needed
        });

        // Listen for medical record updates
        document.addEventListener('medicalRecordAdded', (e) => {
            console.log('Medical record added:', e.detail);
            // Refresh medical card if needed
            if (this.components.medicalCard) {
                // Trigger refresh of medical card
                const selectedInmate = this.components.inmateSelector?.getSelectedInmate();
                if (selectedInmate) {
                    this.components.medicalCard.loadInmateMedicalInfo(selectedInmate);
                }
            }
        });

        // Listen for visit schedule updates
        document.addEventListener('visitScheduled', (e) => {
            console.log('Visit scheduled:', e.detail);
            // Additional handling if needed
        });
    }

    /**
     * Set up global error handling
     * Provides consistent error handling across all components
     */
    setupErrorHandling() {
        // Global error handler for unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showGlobalError('An unexpected error occurred. Please refresh the page.');
        });

        // Global error handler for JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('Global JavaScript error:', event.error);
            // Don't show error for every JS error, just log it
        });
    }

    /**
     * Show initialization error message
     * Displays error when dashboard fails to initialize
     */
    showInitializationError() {
        const mainContent = document.querySelector('.p-4.sm\\:p-6');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <div class="flex items-center gap-3">
                        <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                        <div>
                            <h3 class="text-lg font-semibold text-red-800 dark:text-red-200">Dashboard Initialization Failed</h3>
                            <p class="text-red-700 dark:text-red-300 mt-1">Unable to initialize the nurse dashboard. Please refresh the page or contact support.</p>
                        </div>
                    </div>
                    <div class="mt-4">
                        <button onclick="window.location.reload()" 
                                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
                            Refresh Page
                        </button>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Show global error message
     * @param {string} message - Error message to display
     */
    showGlobalError(message) {
        // Create a temporary error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-sm';
        errorDiv.innerHTML = `
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm font-medium">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="ml-2 text-red-500 hover:text-red-700 cursor-pointer">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    /**
     * Get component instance
     * @param {string} componentName - Name of the component
     * @returns {Object|null} Component instance or null
     */
    getComponent(componentName) {
        return this.components[componentName] || null;
    }

    /**
     * Check if dashboard is initialized
     * @returns {boolean} True if initialized
     */
    isDashboardInitialized() {
        return this.isInitialized;
    }

    /**
     * Refresh all components
     * Reloads all component data and state
     */
    async refresh() {
        if (!this.isInitialized) {
            console.warn('Dashboard not initialized, cannot refresh');
            return;
        }

        try {
            console.log('Refreshing nurse dashboard...');
            
            // Refresh each component if it has a refresh method
            Object.values(this.components).forEach(component => {
                if (component && typeof component.refresh === 'function') {
                    component.refresh();
                }
            });
            
            console.log('Nurse dashboard refreshed successfully');
        } catch (error) {
            console.error('Error refreshing dashboard:', error);
        }
    }

    /**
     * Cleanup and destroy dashboard
     * Removes event listeners and cleans up resources
     */
    destroy() {
        if (!this.isInitialized) return;

        try {
            console.log('Destroying nurse dashboard...');
            
            // Cleanup components if they have destroy methods
            Object.values(this.components).forEach(component => {
                if (component && typeof component.destroy === 'function') {
                    component.destroy();
                }
            });
            
            // Clear component references
            this.components = {
                inmateSelector: null,
                medicalCard: null,
                medicalScheduler: null
            };
            
            this.isInitialized = false;
            
            console.log('Nurse dashboard destroyed');
        } catch (error) {
            console.error('Error destroying dashboard:', error);
        }
    }
}

/**
 * Initialize the nurse dashboard
 * Main entry point for the nurse dashboard functionality
 */
async function initializeNurseDashboard() {
    try {
        // Create global dashboard manager instance
        window.nurseDashboard = new NurseDashboardManager();
        
        // Initialize the dashboard
        await window.nurseDashboard.initialize();
        
        // Make it globally accessible for debugging
        console.log('Nurse Dashboard ready. Access via window.nurseDashboard');
        
        return window.nurseDashboard;
        
    } catch (error) {
        console.error('Failed to initialize nurse dashboard:', error);
        
        // Show error message to user
        const mainContent = document.querySelector('.p-4.sm\\:p-6');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <div class="flex items-center gap-3">
                        <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                        <div>
                            <h3 class="text-lg font-semibold text-red-800 dark:text-red-200">Initialization Error</h3>
                            <p class="text-red-700 dark:text-red-300 mt-1">Failed to initialize the nurse dashboard. Please refresh the page.</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNurseDashboard);
} else {
    initializeNurseDashboard();
}

// Export for potential external use
export { NurseDashboardManager, initializeNurseDashboard };
export default NurseDashboardManager;
