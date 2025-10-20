/**
 * Inmate Selector Component for Nurse Dashboard
 * Handles searching and selecting inmates for medical record management
 */

import InmateApiClient from '../../inmates/components/inmateApi.js';

/**
 * Inmate Selector Manager Class
 * Manages inmate search, selection, and display functionality
 */
export class InmateSelectorManager {
    constructor() {
        this.apiClient = new InmateApiClient();
        this.selectedInmate = null;
        this.searchTimeout = null;
        this.searchResults = [];
        
        // DOM elements
        this.searchInput = document.getElementById('inmate-search');
        this.searchResultsContainer = document.getElementById('inmate-search-results');
        this.selectedInmateInfo = document.getElementById('selected-inmate-info');
        
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners for search functionality
     * Sets up debounced search and result selection
     */
    initializeEventListeners() {
        if (!this.searchInput) return;

        // Debounced search input handler
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // Clear previous timeout
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
            
            // Hide results if query is empty
            if (query.length === 0) {
                this.hideSearchResults();
                return;
            }
            
            // Set new timeout for search
            this.searchTimeout = setTimeout(() => {
                this.searchInmates(query);
            }, 300); // 300ms delay for debouncing
        });

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && 
                !this.searchResultsContainer.contains(e.target)) {
                this.hideSearchResults();
            }
        });
    }

    /**
     * Search inmates by query string
     * @param {string} query - Search term (name or ID)
     */
    async searchInmates(query) {
        try {
            // Show loading state
            this.showSearchLoading();
            
            // Perform API search
            const response = await this.apiClient.search(query);
            this.searchResults = response.data || [];
            
            // Render search results
            this.renderSearchResults(this.searchResults);
            
        } catch (error) {
            console.error('Error searching inmates:', error);
            this.showSearchError('Failed to search inmates. Please try again.');
        }
    }

    /**
     * Display search results in dropdown
     * @param {Array} inmates - Array of inmate objects
     */
    renderSearchResults(inmates) {
        if (!this.searchResultsContainer) return;

        if (inmates.length === 0) {
            this.searchResultsContainer.innerHTML = `
                <div class="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No inmates found matching your search
                </div>
            `;
        } else {
            this.searchResultsContainer.innerHTML = inmates.map(inmate => `
                <div class="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0" 
                     data-inmate-id="${inmate.id}" onclick="window.inmateSelector.selectInmate(${inmate.id})">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            ${inmate.avatarUrl ? 
                                `<img src="${inmate.avatarUrl}" alt="${inmate.firstName}" class="w-full h-full object-cover">` :
                                `<svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>`
                            }
                        </div>
                        <div class="flex-1">
                            <div class="font-medium text-gray-900 dark:text-gray-100">
                                ${inmate.firstName} ${inmate.middleName || ''} ${inmate.lastName}
                            </div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">
                                ID: ${inmate.id.toString().padStart(4, '0')} • ${inmate.gender} • Cell: ${inmate.cell?.name || 'Not Assigned'}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        this.showSearchResults();
    }

    /**
     * Select an inmate and display their basic information
     * @param {number} inmateId - ID of the selected inmate
     */
    async selectInmate(inmateId) {
        try {
            // Find inmate in search results
            const inmate = this.searchResults.find(i => i.id === inmateId);
            if (!inmate) {
                // If not in search results, fetch from API
                const response = await this.apiClient.getById(inmateId);
                this.selectedInmate = response.data;
            } else {
                this.selectedInmate = inmate;
            }

            // Display selected inmate info
            this.displaySelectedInmate(this.selectedInmate);
            
            // Hide search results
            this.hideSearchResults();
            
            // Clear search input
            this.searchInput.value = '';
            
            // Trigger custom event for other components
            this.dispatchInmateSelectedEvent(this.selectedInmate);
            
        } catch (error) {
            console.error('Error selecting inmate:', error);
            this.showSearchError('Failed to load inmate details. Please try again.');
        }
    }

    /**
     * Display selected inmate's basic information
     * @param {Object} inmate - Selected inmate object
     */
    displaySelectedInmate(inmate) {
        if (!this.selectedInmateInfo) return;

        const fullName = [inmate.firstName, inmate.middleName, inmate.lastName].filter(Boolean).join(' ');
        
        this.selectedInmateInfo.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    ${inmate.avatarUrl ? 
                        `<img src="${inmate.avatarUrl}" alt="${fullName}" class="w-full h-full object-cover">` :
                        `<svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>`
                    }
                </div>
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">${fullName}</h3>
                    <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div>ID: ${inmate.id.toString().padStart(4, '0')} • ${inmate.gender} • Age: ${inmate.age || 'N/A'}</div>
                        <div>Cell: ${inmate.cell?.name || 'Not Assigned'} • Status: ${inmate.status || 'Active'}</div>
                        <div>Admission: ${this.formatDate(inmate.admissionDate)}</div>
                    </div>
                </div>
                <button onclick="window.inmateSelector.clearSelection()" 
                        class="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer">
                    Clear
                </button>
            </div>
        `;
        
        this.selectedInmateInfo.classList.remove('hidden');
    }

    /**
     * Clear current selection and hide inmate info
     */
    clearSelection() {
        this.selectedInmate = null;
        this.selectedInmateInfo.classList.add('hidden');
        this.searchInput.value = '';
        
        // Trigger custom event
        this.dispatchInmateClearedEvent();
    }

    /**
     * Show search results container
     */
    showSearchResults() {
        if (this.searchResultsContainer) {
            this.searchResultsContainer.classList.remove('hidden');
        }
    }

    /**
     * Hide search results container
     */
    hideSearchResults() {
        if (this.searchResultsContainer) {
            this.searchResultsContainer.classList.add('hidden');
        }
    }

    /**
     * Show loading state in search results
     */
    showSearchLoading() {
        if (this.searchResultsContainer) {
            this.searchResultsContainer.innerHTML = `
                <div class="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                    </div>
                </div>
            `;
            this.showSearchResults();
        }
    }

    /**
     * Show error message in search results
     * @param {string} message - Error message to display
     */
    showSearchError(message) {
        if (this.searchResultsContainer) {
            this.searchResultsContainer.innerHTML = `
                <div class="p-3 text-sm text-red-600 dark:text-red-400 text-center">
                    ${message}
                </div>
            `;
            this.showSearchResults();
        }
    }

    /**
     * Format date string for display
     * @param {string} dateString - Date string to format
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'N/A';
        }
    }

    /**
     * Dispatch custom event when inmate is selected
     * @param {Object} inmate - Selected inmate object
     */
    dispatchInmateSelectedEvent(inmate) {
        const event = new CustomEvent('inmateSelected', {
            detail: { inmate }
        });
        document.dispatchEvent(event);
    }

    /**
     * Dispatch custom event when inmate selection is cleared
     */
    dispatchInmateClearedEvent() {
        const event = new CustomEvent('inmateCleared');
        document.dispatchEvent(event);
    }

    /**
     * Get currently selected inmate
     * @returns {Object|null} Selected inmate object or null
     */
    getSelectedInmate() {
        return this.selectedInmate;
    }
}

/**
 * Initialize inmate selector component
 * Creates global instance and sets up event handling
 */
export function initializeInmateSelector() {
    // Create global instance for easy access
    window.inmateSelector = new InmateSelectorManager();
    
    console.log('Inmate Selector initialized');
    return window.inmateSelector;
}

/**
 * Export for use in other components
 */
export default InmateSelectorManager;
