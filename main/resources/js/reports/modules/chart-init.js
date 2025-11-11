/**
 * Chart Initialization Manager
 * Handles chart initialization and event listeners
 */

export class ChartInitManager {
    constructor(chartManager) {
        this.chartManager = chartManager;
        this.initialized = false;
        this.init();
    }

    /**
     * Initialize chart initialization manager
     */
    init() {
        // Setup chart data listeners first
        this.setupChartDataListeners();
        
        // Wait for DOM to be ready, then initialize charts
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupChartInitialization();
            });
        } else {
            // DOM is already ready, but wait a bit for all scripts to load
            setTimeout(() => {
                this.setupChartInitialization();
            }, 100);
        }
    }

    /**
     * Setup chart initialization
     */
    async setupChartInitialization() {
        // Prevent multiple initializations
        if (this.initialized) {
            return;
        }

        const manager = this.chartManager || window.reportsChartManager;
        if (!manager) {
            // Wait for chart manager to be available
            const checkManager = setInterval(() => {
                const mgr = this.chartManager || window.reportsChartManager;
                if (mgr) {
                    clearInterval(checkManager);
                    this.initializeCharts(mgr);
                }
            }, 100);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkManager);
            }, 5000);
            return;
        }

        await this.initializeCharts(manager);
    }

    /**
     * Initialize charts with the provided manager
     */
    async initializeCharts(manager) {
        if (this.initialized) {
            return;
        }

        try {
            // Wait for Chart.js to be ready
            if (typeof manager.waitForChartJs === 'function') {
                await manager.waitForChartJs();
            } else {
                // Fallback: wait for Chart.js to be available
                await this.waitForChartJs();
            }

            // Ensure DOM elements exist
            const visitorChart = document.getElementById('visitor-trends-chart');
            const requestChart = document.getElementById('request-status-chart');
            const inmateChart = document.getElementById('inmate-stats-chart');

            if (!visitorChart && !requestChart && !inmateChart) {
                console.warn('No chart canvases found in DOM');
                return;
            }

            // Hide loading indicators
            this.hideLoadingIndicators();

            // Initialize charts
            if (typeof manager.initializeCharts === 'function') {
                await manager.initializeCharts();
                this.initialized = true;
            } else if (typeof manager.initCharts === 'function') {
                await manager.initCharts();
                this.initialized = true;
            }
        } catch (error) {
            console.error('Error initializing charts:', error);
            this.hideLoadingIndicators();
        }
    }

    /**
     * Wait for Chart.js to be available
     */
    waitForChartJs() {
        return new Promise((resolve) => {
            if (typeof Chart !== 'undefined') {
                resolve();
                return;
            }

            // Listen for Chart.js ready event
            const handler = () => {
                if (typeof Chart !== 'undefined') {
                    window.removeEventListener('chartJsReady', handler);
                    resolve();
                }
            };

            window.addEventListener('chartJsReady', handler);

            // Timeout after 10 seconds
            setTimeout(() => {
                window.removeEventListener('chartJsReady', handler);
                if (typeof Chart !== 'undefined') {
                    resolve();
                } else {
                    console.warn('Chart.js loading timeout');
                    resolve(); // Resolve anyway to prevent hanging
                }
            }, 10000);
        });
    }

    /**
     * Setup chart data update listeners
     */
    setupChartDataListeners() {
        // Listen for chart data updates
        window.addEventListener('chartsDataReady', (event) => {
            this.handleChartDataUpdate(event);
        });
    }

    /**
     * Handle chart data updates
     */
    async handleChartDataUpdate(event) {
        const { visitorTrends, requestStatus, inmateStats } = event.detail;
        const manager = this.chartManager || window.reportsChartManager;
        
        if (!manager) {
            console.warn('Chart manager not available for data update');
            return;
        }

        try {
            // Ensure Chart.js is ready
            if (typeof manager.waitForChartJs === 'function') {
                await manager.waitForChartJs();
            }

            // Update visitor trends chart
            if (visitorTrends && typeof manager.updateVisitorTrendsChart === 'function') {
                await manager.updateVisitorTrendsChart(visitorTrends);
            }
            
            // Update request status chart
            if (requestStatus && typeof manager.updateRequestStatusChart === 'function') {
                await manager.updateRequestStatusChart(requestStatus);
            }
            
            // Update inmate statistics chart
            if (inmateStats && typeof manager.updateInmateStatsChart === 'function') {
                await manager.updateInmateStatsChart(inmateStats);
            }
        } catch (error) {
            console.error('Error updating charts with new data:', error);
        }
    }

    /**
     * Hide loading indicators
     */
    hideLoadingIndicators() {
        const loadingIndicators = document.querySelectorAll('.chart-loading');
        loadingIndicators.forEach(el => {
            if (el) {
                el.style.display = 'none';
            }
        });
    }
}

