/**
 * Reports Management System
 * Main entry point for the reports module
 */

import { ReportsDataManager } from './modules/data-manager.js';
import { ReportsChartManager } from './modules/chart-manager.js';
import { ReportsExportManager } from './modules/export-manager.js';
import { ReportsFilterManager } from './modules/filter-manager.js';
import { ChartInitManager } from './modules/chart-init.js';
import { UIManager } from './modules/ui-manager.js';
import { LiveUpdateManager } from './modules/live-update-manager.js';
import ThemeManager from '../theme-manager.js';

class ReportsManager {
    constructor() {
        this.dataManager = null;
        this.chartManager = null;
        this.exportManager = null;
        this.filterManager = null;
        this.chartInitManager = null;
        this.uiManager = null;
        this.liveUpdateManager = null;
        this.userRole = this.getUserRole();
        this.liveUpdatesEnabled = false; // Disabled by default to prevent chart clearing
        this.init();
    }

    /**
     * Get user role from DOM
     */
    getUserRole() {
        const userRoleElement = document.querySelector('[data-user-role]');
        return userRoleElement ? parseInt(userRoleElement.getAttribute('data-user-role')) : null;
    }

    /**
     * Initialize the reports system
     */
    async init() {
        try {
            // Initialize managers
            this.dataManager = new ReportsDataManager();
            this.chartManager = new ReportsChartManager();
            this.exportManager = new ReportsExportManager();
            this.filterManager = new ReportsFilterManager();

            // Expose chart manager globally for chart initialization
            window.reportsChartManager = this.chartManager;

            // Initialize UI manager (handles sidebar, quick date ranges)
            this.uiManager = new UIManager();

            // Initialize chart initialization manager
            this.chartInitManager = new ChartInitManager(this.chartManager);

            // Set up event listeners
            this.setupEventListeners();

            // Initialize live update manager (but don't start it by default)
            this.liveUpdateManager = new LiveUpdateManager(
                this.dataManager,
                this.chartManager,
                () => this.loadReports()
            );

            // Wait a bit for chart initialization to complete, then load data
            setTimeout(() => {
                // Load initial data (don't fail if API doesn't exist)
                // Silently attempt to load - if it fails, page will use static data
                this.loadReports().catch(() => {
                    // Silently fail - static data from Blade template will be used
                });

                // Optionally enable live updates after initial load
                // Uncomment the line below to enable 30-second updates
                //this.enableLiveUpdates(30000);
            }, 500);

            // Initialization complete (no console log to reduce noise)
        } catch (error) {
            console.error('Error initializing Reports Manager:', error);
            // Don't show error to user, just log it
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for filter changes
        document.addEventListener('reports:filter-changed', () => {
            this.handleFilterChange();
        });
        
        // Listen for export requests
        document.addEventListener('reports:export-requested', (event) => {
            const { format, reportType } = event.detail;
            this.handleExportRequest(format, reportType);
        });
        
        // Export button handlers
        const exportPdfBtn = document.getElementById('export-pdf-btn');
        const exportExcelBtn = document.getElementById('export-excel-btn');
        const exportCsvBtn = document.getElementById('export-csv-btn');
        
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => {
                this.handleExportRequest('pdf', 'general');
            });
        }
        
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', () => {
                this.handleExportRequest('excel', 'general');
            });
        }
        
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => {
                this.handleExportRequest('csv', 'general');
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('reports-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadReports();
                // Reset live update retry counter on manual refresh
                if (this.liveUpdateManager) {
                    this.liveUpdateManager.resetRetries();
                }
            });
        }
    }

    /**
     * Enable live updates
     */
    enableLiveUpdates(intervalMs = 30000) {
        if (this.liveUpdateManager && !this.liveUpdatesEnabled) {
            this.liveUpdateManager.start(intervalMs);
            this.liveUpdatesEnabled = true;
            console.info('Live updates enabled');
        }
    }

    /**
     * Disable live updates
     */
    disableLiveUpdates() {
        if (this.liveUpdateManager && this.liveUpdatesEnabled) {
            this.liveUpdateManager.stop();
            this.liveUpdatesEnabled = false;
            console.info('Live updates disabled');
        }
    }

    /**
     * Load reports data
     */
    async loadReports() {
        try {
            // Get filters from filter manager
            const filters = this.filterManager ? this.filterManager.getCurrentFilters() : {};
            
            // Fetch data from API
            const data = await this.dataManager.fetchReports(filters);
            
            // Only proceed if we have valid data
            if (!data) {
                console.info('No data received from API, keeping initial chart data');
                return;
            }
            
            // Validate that data has chart information before updating
            const hasChartData = this.dataManager.hasValidChartData(data);
            
            // Update charts only if we have valid data and chart manager is ready
            if (hasChartData && this.chartManager) {
                // Ensure charts are initialized first
                if (!this.chartManager.chartJsReady) {
                    await this.chartManager.waitForChartJs();
                }
                
                // Use async version to ensure proper initialization
                if (typeof this.chartManager.updateChartsAsync === 'function') {
                    await this.chartManager.updateChartsAsync(data);
                } else if (typeof this.chartManager.updateCharts === 'function') {
                    this.chartManager.updateCharts(data);
                }
            } else if (!hasChartData) {
                console.info('API data lacks valid chart information, preserving initial charts');
            }
            
            // Update statistics only if we have valid data with statistics
            // This ensures we don't overwrite initial values with null/undefined
            if (data.statistics && typeof data.statistics === 'object') {
                // Verify statistics object has valid numeric values
                const hasValidStats = Object.values(data.statistics).some(val => 
                    val !== null && val !== undefined && (typeof val === 'number' || !isNaN(Number(val)))
                );
                
                if (hasValidStats) {
                    this.updateStatistics(data);
                } else {
                    console.info('API statistics are empty, preserving initial values');
                }
            } else {
                console.info('No statistics in API response, preserving initial values');
            }
        } catch (error) {
            // Silently fail - static data from Blade template will be used
            console.info('Error loading reports, preserving initial data:', error.message);
        }
    }

    /**
     * Handle filter changes
     */
    handleFilterChange() {
        this.loadReports();
    }
    
    /**
     * Handle export request
     */
    async handleExportRequest(format = 'pdf', reportType = 'general') {
        try {
            // Show loading message with theme support
            if (window.ThemeManager && window.Swal) {
                window.ThemeManager.showAlert({
                    title: 'Generating Export...',
                    html: '<div class="flex flex-col items-center gap-3"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div><p class="text-sm">Please wait while we generate your report...</p></div>',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        window.Swal.showLoading();
                    }
                });
            } else if (window.Swal) {
                window.Swal.fire({
                    title: 'Generating Export...',
                    html: 'Please wait while we generate your report.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        window.Swal.showLoading();
                    }
                });
            } else {
                console.log('Generating export...');
            }
            
            // Get current filters
            let filters = {};
            if (this.filterManager && typeof this.filterManager.getCurrentFilters === 'function') {
                filters = this.filterManager.getCurrentFilters();
            } else {
                // Fallback: get filters from DOM elements
                const dateFromEl = document.getElementById('filter-date-from');
                const dateToEl = document.getElementById('filter-date-to');
                const reportTypeEl = document.getElementById('filter-report-type');
                
                filters = {
                    dateFrom: dateFromEl?.value || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    dateTo: dateToEl?.value || new Date().toISOString().split('T')[0],
                    reportType: reportTypeEl?.value || 'all'
                };
            }
            
            // Ensure dateFrom and dateTo are set
            if (!filters.dateFrom || !filters.dateTo) {
                const today = new Date();
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                
                filters.dateFrom = filters.dateFrom || thirtyDaysAgo.toISOString().split('T')[0];
                filters.dateTo = filters.dateTo || today.toISOString().split('T')[0];
            }
            
            // Export
            if (this.exportManager) {
                await this.exportManager.export(filters, format, reportType);
                
                // Close loading and show success with theme support
                if (window.ThemeManager) {
                    window.Swal.close();
                    window.ThemeManager.showSuccess(
                        'Your report has been downloaded successfully.',
                        'Export Complete!'
                    );
                } else if (window.Swal) {
                    window.Swal.close();
                    window.Swal.fire({
                        icon: 'success',
                        title: 'Export Successful!',
                        text: 'Your report has been downloaded.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            } else {
                throw new Error('Export manager not initialized');
            }
            
        } catch (error) {
            console.error('Export failed:', error);
            
            // Close any open loading dialogs
            if (window.Swal && window.Swal.isVisible()) {
                window.Swal.close();
            }
            
            // Show error message
            const errorMessage = error.message || 'Failed to export report. Please check the server logs or try again later.';
            
            if (window.ThemeManager && window.Swal) {
                window.ThemeManager.showError(errorMessage, 'Export Failed');
            } else if (window.Swal) {
                window.Swal.fire({
                    icon: 'error',
                    title: 'Export Failed',
                    text: errorMessage
                });
            } else {
                alert('Export failed: ' + errorMessage);
            }
        }
    }

    /**
     * Update statistics display
     */
    updateStatistics(data) {
        if (!data || !data.statistics) {
            // Don't update if no data - preserve initial values from blade template
            return;
        }
        
        // Calculate statistics from data
        const stats = this.dataManager.calculateStatistics(data);
        
        // Only update if we have valid statistics (not null)
        if (stats && typeof stats === 'object' && Object.keys(stats).length > 0) {
            Object.entries(stats).forEach(([key, value]) => {
                const element = document.getElementById(`stat-${key}`);
                if (element) {
                    // Convert value to number and update
                    // Note: 0 is a valid value, so we update even if value is 0
                    const numValue = Number(value);
                    if (!isNaN(numValue) && numValue >= 0) {
                        element.textContent = numValue.toString();
                    }
                }
            });
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        // Use ThemeManager for themed alerts
        if (window.ThemeManager) {
            window.ThemeManager.showError(message, 'Error');
        } else if (window.Swal) {
            window.Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message
            });
        } else {
            console.error(message);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize reports manager
    window.reportsManager = new ReportsManager();
});

export default ReportsManager;
