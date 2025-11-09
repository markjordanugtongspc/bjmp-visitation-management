/**
 * Inmate Selector Component for Nurse Dashboard
 * Handles searching and selecting inmates for medical record management
 * 
 * Key Features:
 * - Real-time inmate search with debouncing
 * - Backend data integration (fullName, age, status)
 * - Responsive Tailwind CSS design
 * - Medical record management integration
 */

import InmateApiClient from '../../inmates/components/inmateApi.js';

/**
 * Inmate Selector Manager Class
 * Manages inmate search, selection, and display functionality
 */
export class InmateSelectorManager {
    constructor() {
        // Initialize API client and state management
        this.apiClient = new InmateApiClient();
        this.selectedInmate = null;
        this.searchTimeout = null;
        this.searchResults = [];
        
        // DOM element references for search functionality
        this.searchInput = document.getElementById('inmate-search');
        this.searchResultsContainer = document.getElementById('inmate-search-results');
        this.selectedInmateInfo = document.getElementById('selected-inmate-info');
        this.backToSearchContainer = document.getElementById('back-to-search-container');
        this.searchSection = document.getElementById('search-section');
        this.selectInmateHeading = document.querySelector('h2.text-lg.font-semibold.text-gray-900.dark\\:text-gray-100.mb-4');
        
        this.initializeEventListeners();
        this.checkUrlForInmate();
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
            // Show loading indicator while searching
            this.showSearchLoading();
            
            // Fetch inmates from backend API with proper data transformation
            const response = await this.apiClient.search(query);
            this.searchResults = response.data || [];
            
            // Display search results with fullName and age from backend
            this.renderSearchResults(this.searchResults);
            
        } catch (error) {
            console.error('Error searching inmates:', error);
            this.showSearchError('Failed to search inmates. Please try again.');
        }
    }

    /**
     * Display search results in dropdown with responsive Tailwind CSS
     * @param {Array} inmates - Array of inmate objects with fullName and age from backend
     */
    renderSearchResults(inmates) {
        if (!this.searchResultsContainer) return;

        if (inmates.length === 0) {
            // Show no results message
            this.searchResultsContainer.innerHTML = `
                <div class="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No inmates found matching your search
                </div>
            `;
        } else {
            // Render inmate list with round button design and slight upward placement using Tailwind
            this.searchResultsContainer.innerHTML = inmates.map(inmate => `
                <div class="mx-1 mb-2 p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 -mt-4" 
                     data-inmate-id="${inmate.id}" onclick="window.inmateSelector.selectInmate(${inmate.id})">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                            ${inmate.avatarUrl ? 
                                `<img src="${inmate.avatarUrl}" alt="${inmate.fullName || this.getFullName(inmate)}" class="w-full h-full object-cover">` :
                                `<svg class="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>`
                            }
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                                ${inmate.fullName || this.getFullName(inmate)}
                            </div>
                            <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                <span class="inline-flex items-center">
                                    <span class="font-medium">Age:</span> <span class="ml-1">${inmate.age || 'N/A'}</span>
                                </span>
                                <span class="mx-1">•</span>
                                <span class="inline-flex items-center">
                                    <span class="font-medium">Status:</span> 
                                    <span class="ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${this.getStatusClass(inmate.status || 'Active')}">
                                        ${inmate.status || 'Active'}
                                    </span>
                                </span>
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
            // Find inmate in current search results or fetch from API
            const inmate = this.searchResults.find(i => i.id === inmateId);
            if (!inmate) {
                // Fetch individual inmate data if not in search results
                const response = await this.apiClient.getById(inmateId);
                this.selectedInmate = response.data;
            } else {
                this.selectedInmate = inmate;
            }

            // Display selected inmate with enhanced card design
            this.displaySelectedInmate(this.selectedInmate);
            
            // Clean up UI state
            this.hideSearchResults();
            this.searchInput.value = '';
            
            // Notify other components about selection
            this.dispatchInmateSelectedEvent(this.selectedInmate);
            
            // Update URL with inmate ID
            this.updateUrl(inmateId);
            
        } catch (error) {
            console.error('Error selecting inmate:', error);
            this.showSearchError('Failed to load inmate details. Please try again.');
        }
    }

    /**
     * Display selected inmate's basic information with enhanced responsive card design
     * @param {Object} inmate - Selected inmate object with fullName and age from backend
     */
    displaySelectedInmate(inmate) {
        // Store inmate data for medical card to use
        this.selectedInmate = inmate;
        
        // Hide the selected inmate info container since we're moving it to medical card
        if (this.selectedInmateInfo) {
            this.selectedInmateInfo.classList.add('hidden');
        }
        
        // Toggle UI elements - hide search, show back button
        this.toggleSearchUI(false);
        
        // Dispatch event to notify medical card to show the inmate data
        this.dispatchInmateSelectedEvent(inmate);
    }

    /**
     * Clear current selection and hide inmate info
     */
    clearSelection() {
        this.selectedInmate = null;
        
        // Hide selected inmate info and medical card
        if (this.selectedInmateInfo) {
            this.selectedInmateInfo.classList.add('hidden');
        }
        
        // Clear search input
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        // Toggle UI elements - show search, hide back button
        this.toggleSearchUI(true);
        
        // Remove URL parameter
        this.removeUrlParameter();
        
        // Trigger custom event to hide medical card
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
     * Show enhanced loading state in search results with improved UX
     */
    showSearchLoading() {
        if (this.searchResultsContainer) {
            // Display loading spinner with descriptive text
            this.searchResultsContainer.innerHTML = `
                <div class="p-6 text-sm text-gray-500 dark:text-gray-400 text-center">
                    <div class="flex flex-col items-center justify-center gap-3">
                        <svg class="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span class="font-medium text-gray-700 dark:text-gray-300">Searching inmates...</span>
                        <span class="text-xs text-gray-400 dark:text-gray-500">Please wait while we find matching records</span>
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
     * Get full name from inmate object (first name + last name only)
     * @param {Object} inmate - Inmate object with firstName, middleName, lastName
     * @returns {string} Full name or 'Unknown' if no valid names found
     */
    getFullName(inmate) {
        if (!inmate) return 'Unknown';
        
        // Extract only first name and last name (skip middle name)
        const firstName = inmate.firstName || '';
        const lastName = inmate.lastName || '';
        
        const nameParts = [firstName, lastName].filter(part => part && part.trim());
        
        if (nameParts.length === 0) return 'Unknown';
        
        return nameParts.join(' ');
    }

    /**
     * Get CSS classes for inmate status badges (matching inmates.jsx color scheme)
     * @param {string} status - Inmate status
     * @returns {string} CSS classes for status badge
     */
    getStatusClass(status) {
        switch (status) {
            case 'Active': return 'bg-green-500/10 text-green-500';
            case 'Released': return 'bg-blue-500/10 text-blue-500';
            case 'Transferred': return 'bg-yellow-500/10 text-yellow-500';
            case 'Medical': return 'bg-red-500/10 text-red-500';
            default: return 'bg-gray-500/10 text-gray-500';
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

    /**
     * Toggle search UI elements based on selection state
     * @param {boolean} showSearch - Whether to show search elements
     */
    toggleSearchUI(showSearch) {
        if (showSearch) {
            // Show search section, hide back button
            if (this.searchSection) {
                this.searchSection.classList.remove('hidden');
            }
            if (this.backToSearchContainer) {
                this.backToSearchContainer.classList.add('hidden');
            }
        } else {
            // Hide search section, show back button
            if (this.searchSection) {
                this.searchSection.classList.add('hidden');
            }
            if (this.backToSearchContainer) {
                this.backToSearchContainer.classList.remove('hidden');
            }
        }
    }

    /**
     * Update URL with inmate ID parameter
     * @param {number} inmateId - Inmate ID to add to URL
     */
    updateUrl(inmateId) {
        const url = new URL(window.location);
        url.searchParams.set('inmate', inmateId);
        window.history.pushState({}, '', url);
    }

    /**
     * Remove inmate parameter from URL
     */
    removeUrlParameter() {
        const url = new URL(window.location);
        url.searchParams.delete('inmate');
        window.history.pushState({}, '', url);
    }

    /**
     * Get URL parameter value
     * @param {string} name - Parameter name
     * @returns {string|null} Parameter value or null
     */
    getUrlParameter(name) {
        const url = new URL(window.location);
        return url.searchParams.get(name);
    }

    /**
     * Check URL for inmate parameter and auto-select if present
     */
    async checkUrlForInmate() {
        const inmateId = this.getUrlParameter('inmate');
        if (inmateId) {
            try {
                // Auto-select the inmate from URL parameter
                await this.selectInmate(parseInt(inmateId));
            } catch (error) {
                console.error('Error auto-selecting inmate from URL:', error);
                // Remove invalid parameter from URL
                this.removeUrlParameter();
            }
        }
    }
}

/**
 * Initialize inmate selector component
 * Creates global instance and sets up event handling for nurse dashboard
 */
export function initializeInmateSelector() {
    // Create global instance for easy access across components
    window.inmateSelector = new InmateSelectorManager();
    
    console.log('Inmate Selector initialized with backend integration');
    return window.inmateSelector;
}

/**
 * Export InmateSelectorManager class for use in other components
 * Provides inmate search and selection functionality for medical records
 */
export default InmateSelectorManager;
