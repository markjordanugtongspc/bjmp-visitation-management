/**
 * Reports Filter Manager
 * Handles filter state and events
 */

export class ReportsFilterManager {
    constructor() {
        this.filters = {
            dateFrom: null,
            dateTo: null,
            reportType: 'all',
            status: 'all'
        };
        this.init();
    }

    /**
     * Initialize filter manager
     */
    init() {
        // Set default dates if not already set
        this.initializeDefaultDates();
        this.setupFilterListeners();
        this.loadSavedFilters();
    }
    
    /**
     * Initialize default date range (last 30 days)
     */
    initializeDefaultDates() {
        // Get dates from DOM if available
        const dateFromInput = document.getElementById('filter-date-from');
        const dateToInput = document.getElementById('filter-date-to');
        
        if (dateFromInput && dateFromInput.value) {
            this.filters.dateFrom = dateFromInput.value;
        } else {
            // Set default to 30 days ago
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            this.filters.dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
            if (dateFromInput) {
                dateFromInput.value = this.filters.dateFrom;
            }
        }
        
        if (dateToInput && dateToInput.value) {
            this.filters.dateTo = dateToInput.value;
        } else {
            // Set default to today
            const today = new Date();
            this.filters.dateTo = today.toISOString().split('T')[0];
            if (dateToInput) {
                dateToInput.value = this.filters.dateTo;
            }
        }
    }

    /**
     * Set up filter event listeners
     */
    setupFilterListeners() {
        // Date range filters
        const dateFromInput = document.getElementById('filter-date-from');
        const dateToInput = document.getElementById('filter-date-to');
        
        if (dateFromInput) {
            dateFromInput.addEventListener('change', (e) => {
                this.updateFilter('dateFrom', e.target.value);
            });
        }

        if (dateToInput) {
            dateToInput.addEventListener('change', (e) => {
                this.updateFilter('dateTo', e.target.value);
            });
        }

        // Report type filter
        const reportTypeSelect = document.getElementById('filter-report-type');
        if (reportTypeSelect) {
            reportTypeSelect.addEventListener('change', (e) => {
                this.updateFilter('reportType', e.target.value);
            });
        }

        // Status filter
        const statusSelect = document.getElementById('filter-status');
        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                this.updateFilter('status', e.target.value);
            });
        }

        // Reset filters button
        const resetBtn = document.getElementById('filter-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
    }

    /**
     * Update a specific filter
     */
    updateFilter(key, value) {
        this.filters[key] = value;
        this.saveFilters();
        this.emitFilterChange();
    }

    /**
     * Get current filters
     */
    getCurrentFilters() {
        // Always get latest values from DOM elements
        const dateFromInput = document.getElementById('filter-date-from');
        const dateToInput = document.getElementById('filter-date-to');
        const reportTypeSelect = document.getElementById('filter-report-type');
        const statusSelect = document.getElementById('filter-status');
        
        // Update filters from DOM
        if (dateFromInput) {
            this.filters.dateFrom = dateFromInput.value || this.filters.dateFrom;
        }
        if (dateToInput) {
            this.filters.dateTo = dateToInput.value || this.filters.dateTo;
        }
        if (reportTypeSelect) {
            this.filters.reportType = reportTypeSelect.value || this.filters.reportType;
        }
        if (statusSelect) {
            this.filters.status = statusSelect.value || this.filters.status;
        }
        
        // Ensure dates are set
        if (!this.filters.dateFrom || !this.filters.dateTo) {
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            
            this.filters.dateFrom = this.filters.dateFrom || thirtyDaysAgo.toISOString().split('T')[0];
            this.filters.dateTo = this.filters.dateTo || today.toISOString().split('T')[0];
        }
        
        return { ...this.filters };
    }

    /**
     * Reset all filters
     */
    resetFilters() {
        this.filters = {
            dateFrom: null,
            dateTo: null,
            reportType: 'all',
            status: 'all'
        };

        // Reset form inputs
        const dateFromInput = document.getElementById('filter-date-from');
        const dateToInput = document.getElementById('filter-date-to');
        const reportTypeSelect = document.getElementById('filter-report-type');
        const statusSelect = document.getElementById('filter-status');

        if (dateFromInput) dateFromInput.value = '';
        if (dateToInput) dateToInput.value = '';
        if (reportTypeSelect) reportTypeSelect.value = 'all';
        if (statusSelect) statusSelect.value = 'all';

        this.saveFilters();
        this.emitFilterChange();
    }

    /**
     * Save filters to localStorage
     */
    saveFilters() {
        try {
            localStorage.setItem('reports_filters', JSON.stringify(this.filters));
        } catch (error) {
            console.error('Error saving filters:', error);
        }
    }

    /**
     * Load saved filters from localStorage
     */
    loadSavedFilters() {
        try {
            const saved = localStorage.getItem('reports_filters');
            if (saved) {
                this.filters = JSON.parse(saved);
                this.applyFiltersToUI();
            }
        } catch (error) {
            console.error('Error loading saved filters:', error);
        }
    }

    /**
     * Apply filters to UI elements
     */
    applyFiltersToUI() {
        const dateFromInput = document.getElementById('filter-date-from');
        const dateToInput = document.getElementById('filter-date-to');
        const reportTypeSelect = document.getElementById('filter-report-type');
        const statusSelect = document.getElementById('filter-status');

        if (dateFromInput && this.filters.dateFrom) {
            dateFromInput.value = this.filters.dateFrom;
        }
        if (dateToInput && this.filters.dateTo) {
            dateToInput.value = this.filters.dateTo;
        }
        if (reportTypeSelect && this.filters.reportType) {
            reportTypeSelect.value = this.filters.reportType;
        }
        if (statusSelect && this.filters.status) {
            statusSelect.value = this.filters.status;
        }
    }

    /**
     * Emit filter change event
     */
    emitFilterChange() {
        const event = new CustomEvent('reports:filter-changed', {
            detail: this.getCurrentFilters()
        });
        document.dispatchEvent(event);
    }
}
