/**
 * Reports Chart Manager
 * Handles chart rendering and updates using Chart.js
 * Advanced implementation with responsive design and theme support
 */

export class ReportsChartManager {
    constructor() {
        this.charts = {};
        this.chartData = {};
        this.chartJsReady = false;
        this.chartJsReadyPromise = null;
        this.initCallbacks = [];
        this.setupThemeListener();
        this.setupResizeListener();
        this.loadChartJS();
    }
    
    /**
     * Load Chart.js dynamically and return a promise
     */
    async loadChartJS() {
        // If Chart.js is already loaded, resolve immediately
        if (typeof Chart !== 'undefined') {
            this.chartJsReady = true;
            this.notifyChartJsReady();
            return Promise.resolve();
        }

        // If already loading, return the existing promise
        if (this.chartJsReadyPromise) {
            return this.chartJsReadyPromise;
        }

        // Create a new promise for loading Chart.js
        this.chartJsReadyPromise = new Promise((resolve, reject) => {
            try {
                // Check if script is already in the DOM
                const existingScript = document.querySelector('script[src*="chart.js"]');
                if (existingScript) {
                    // Wait for it to load
                    existingScript.addEventListener('load', () => {
                        this.chartJsReady = true;
                        this.notifyChartJsReady();
                        resolve();
                    });
                    existingScript.addEventListener('error', () => {
                        reject(new Error('Failed to load Chart.js'));
                        this.showChartError();
                    });
                    return;
                }

                // Load Chart.js from CDN
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
                script.async = true;
                script.onload = () => {
                    this.chartJsReady = true;
                    this.notifyChartJsReady();
                    resolve();
                };
                script.onerror = () => {
                    reject(new Error('Failed to load Chart.js'));
                    this.showChartError();
                };
                document.head.appendChild(script);
            } catch (error) {
                reject(error);
                this.showChartError();
            }
        });

        return this.chartJsReadyPromise;
    }

    /**
     * Notify all waiting callbacks that Chart.js is ready
     */
    notifyChartJsReady() {
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('chartJsReady'));
        
        // Call all registered callbacks
        this.initCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error in chart initialization callback:', error);
            }
        });
        this.initCallbacks = [];
    }

    /**
     * Wait for Chart.js to be ready
     */
    async waitForChartJs() {
        if (this.chartJsReady && typeof Chart !== 'undefined') {
            return Promise.resolve();
        }
        return this.loadChartJS();
    }
    
    /**
     * Setup resize listener for responsive charts
     */
    setupResizeListener() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.resizeAllCharts();
            }, 250);
        });
    }

    /**
     * Resize all charts
     */
    resizeAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }
    
    /**
     * Initialize all charts with sample data
     */
    async initializeCharts() {
        // Wait for Chart.js to be ready
        await this.waitForChartJs();

        // Ensure DOM is ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Hide loading indicators
        this.hideLoadingIndicators();

        // Small delay to ensure DOM is fully rendered
        await new Promise(resolve => setTimeout(resolve, 100));

        // Initialize with sample data
        this.initVisitorTrendsChart();
        this.initRequestStatusChart();
        this.initInmateStatsChart();
    }

    /**
     * Alias for initializeCharts (for backwards compatibility)
     */
    async initCharts() {
        return this.initializeCharts();
    }

    /**
     * Hide loading indicators
     */
    hideLoadingIndicators() {
        document.querySelectorAll('.chart-loading').forEach(el => {
            if (el) {
                el.style.display = 'none';
            }
        });
    }
    
    /**
     * Show error message when Chart.js fails to load
     */
    showChartError() {
        document.querySelectorAll('.chart-loading').forEach(el => {
            el.innerHTML = '<span class="text-sm text-red-500">Failed to load charts</span>';
        });
    }
    
    /**
     * Get theme-aware colors
     */
    getThemeColors() {
        const isDark = document.documentElement.classList.contains('dark');
        
        if (isDark) {
            return {
                primary: '#3B82F6',
                success: '#10B981',
                warning: '#FBBF24',
                danger: '#EF4444',
                info: '#60A5FA',
                purple: '#A78BFA',
                orange: '#FB923C',
                pink: '#F472B6',
                text: '#F9FAFB',
                textSecondary: '#D1D5DB',
                gridLines: '#374151',
                background: 'rgba(59, 130, 246, 0.1)',
                backgroundAlt: 'rgba(16, 185, 129, 0.1)'
            };
        } else {
            return {
                primary: '#2563EB',
                success: '#10B981',
                warning: '#F59E0B',
                danger: '#EF4444',
                info: '#3B82F6',
                purple: '#8B5CF6',
                orange: '#F97316',
                pink: '#EC4899',
                text: '#111827',
                textSecondary: '#6B7280',
                gridLines: '#E5E7EB',
                background: 'rgba(37, 99, 235, 0.1)',
                backgroundAlt: 'rgba(16, 185, 129, 0.1)'
            };
        }
    }
    
    /**
     * Get common chart options
     */
    getCommonOptions(type = 'line') {
        const colors = this.getThemeColors();
        
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: colors.text,
                        font: {
                            size: 12,
                            family: "'Inter', sans-serif"
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: colors.text === '#F9FAFB' ? '#1F2937' : '#FFFFFF',
                    titleColor: colors.text === '#F9FAFB' ? '#F9FAFB' : '#111827',
                    bodyColor: colors.text === '#F9FAFB' ? '#D1D5DB' : '#6B7280',
                    borderColor: colors.gridLines,
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            
                            // Handle different chart types properly
                            let value = null;
                            if (context.parsed !== null) {
                                if (context.parsed.y !== null && context.parsed.y !== undefined) {
                                    value = context.parsed.y;
                                } else if (context.parsed !== null && context.parsed !== undefined) {
                                    // For doughnut/pie charts
                                    value = context.parsed;
                                }
                            }
                            
                            if (value !== null && value !== undefined && !isNaN(value)) {
                                label += value.toLocaleString();
                            } else {
                                label += '0';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: type !== 'pie' && type !== 'doughnut' ? {
                x: {
                    grid: {
                        color: colors.gridLines,
                        drawBorder: false
                    },
                    ticks: {
                        color: colors.textSecondary,
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grace: '5%',
                    grid: {
                        color: colors.gridLines,
                        drawBorder: false
                    },
                    ticks: {
                        color: colors.textSecondary,
                        font: {
                            size: 11
                        },
                        precision: 0,
                        callback: function(value) {
                            if (value !== null && value !== undefined && !isNaN(value)) {
                                return Math.round(value).toLocaleString();
                            }
                            return '0';
                        }
                    }
                }
            } : undefined
        };
    }
    
    /**
     * Setup theme change listener
     */
    setupThemeListener() {
        window.addEventListener('themeChanged', () => {
            this.updateAllChartsTheme();
        });
    }
    
    /**
     * Update all charts with new theme colors
     */
    updateAllChartsTheme() {
        Object.keys(this.charts).forEach(chartId => {
            if (this.charts[chartId]) {
                this.updateChartTheme(this.charts[chartId]);
            }
        });
    }
    
    /**
     * Update single chart theme
     */
    updateChartTheme(chart) {
        const colors = this.getThemeColors();
        
        // Update chart options
        if (chart.options.scales) {
            if (chart.options.scales.x) {
                chart.options.scales.x.ticks.color = colors.text;
                chart.options.scales.x.grid.color = colors.gridLines;
            }
            if (chart.options.scales.y) {
                chart.options.scales.y.ticks.color = colors.text;
                chart.options.scales.y.grid.color = colors.gridLines;
            }
        }
        
        if (chart.options.plugins?.legend?.labels) {
            chart.options.plugins.legend.labels.color = colors.text;
        }
        
        chart.update();
    }

    /**
     * Update all charts with new data (synchronous wrapper for async version)
     */
    updateCharts(data) {
        if (!data) return;
        // Use async version but don't wait (fire and forget for backward compatibility)
        this.updateChartsAsync(data).catch(error => {
            console.error('Error updating charts:', error);
        });
    }

    /**
     * Initialize Visitor Trends Chart (Line Chart)
     */
    initVisitorTrendsChart(data = null) {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js is not loaded yet');
            return;
        }

        const ctx = document.getElementById('visitor-trends-chart');
        if (!ctx) {
            console.warn('Visitor trends chart canvas not found');
            return;
        }

        // Destroy existing chart
        if (this.charts.visitorTrends) {
            this.charts.visitorTrends.destroy();
        }

        const colors = this.getThemeColors();
        
        // Use provided data from API (no static sample data)
        // Static sample data commented out - using real backend data
        /*
        const chartData = data || {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Total Visitors',
                    data: [120, 150, 180, 160, 200, 220, 250, 240, 260, 280, 300, 320],
                },
                {
                    label: 'Approved Visits',
                    data: [100, 130, 160, 140, 180, 200, 230, 220, 240, 260, 280, 300],
                }
            ]
        };
        */
        
        // Return early if no data provided
        if (!data) {
            console.warn('No data provided for visitor trends chart');
            return;
        }
        
        // Debug logging to identify data issues
        console.log('Visitor Trends Chart Data:', {
            labels: data.labels,
            datasets: data.datasets.map(d => ({
                label: d.label,
                data: d.data,
                dataType: typeof d.data,
                isArray: Array.isArray(d.data),
                length: d.data?.length
            }))
        });
        
        const chartData = {
            labels: data.labels,
            datasets: data.datasets.map((dataset, index) => ({
                ...dataset,
                borderColor: index === 0 ? colors.primary : colors.success,
                backgroundColor: index === 0 ? colors.background : colors.backgroundAlt,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: index === 0 ? colors.primary : colors.success,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }))
        };

        const options = this.getCommonOptions('line');
        this.charts.visitorTrends = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                ...options,
                plugins: {
                    ...options.plugins,
                    title: {
                        display: false
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    /**
     * Initialize Request Status Chart (Doughnut Chart)
     */
    initRequestStatusChart(data = null) {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js is not loaded yet');
            return;
        }

        const ctx = document.getElementById('request-status-chart');
        if (!ctx) {
            console.warn('Request status chart canvas not found');
            return;
        }

        // Destroy existing chart
        if (this.charts.requestStatus) {
            this.charts.requestStatus.destroy();
        }

        const colors = this.getThemeColors();
        
        // Use provided data from API (no static sample data)
        // Static sample data commented out - using real backend data
        /*
        const chartData = data || {
            labels: ['Approved', 'Pending', 'Rejected', 'Cancelled'],
            datasets: [{
                data: [450, 120, 80, 50],
            }]
        };
        */
        
        // Return early if no data provided
        if (!data) {
            console.warn('No data provided for request status chart');
            return;
        }
        
        const chartData = {
            labels: data.labels,
            datasets: [{
                data: data.datasets[0].data,
                backgroundColor: [
                    colors.success,
                    colors.warning,
                    colors.danger,
                    colors.textSecondary
                ],
                borderColor: colors.text === '#F9FAFB' ? '#1F2937' : '#FFFFFF',
                borderWidth: 3,
                hoverOffset: 15
            }]
        };

        const options = this.getCommonOptions('doughnut');
        this.charts.requestStatus = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                ...options,
                cutout: '65%',
                plugins: {
                    ...options.plugins,
                    legend: {
                        ...options.plugins.legend,
                        position: 'bottom'
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    /**
     * Initialize Inmate Statistics Chart (Bar Chart)
     */
    initInmateStatsChart(data = null) {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js is not loaded yet');
            return;
        }

        const ctx = document.getElementById('inmate-stats-chart');
        if (!ctx) {
            console.warn('Inmate stats chart canvas not found');
            return;
        }

        // Destroy existing chart
        if (this.charts.inmateStats) {
            this.charts.inmateStats.destroy();
        }

        const colors = this.getThemeColors();
        
        // Use provided data from API (no static sample data)
        // Static sample data commented out - using real backend data
        /*
        const chartData = data || {
            labels: ['Male', 'Female', 'Juvenile', 'Senior'],
            datasets: [
                {
                    label: 'Current Population',
                    data: [450, 120, 45, 30],
                }
            ]
        };
        */
        
        // Return early if no data provided
        if (!data) {
            console.warn('No data provided for inmate stats chart');
            return;
        }
        
        const chartData = {
            labels: data.labels,
            datasets: [
                {
                    label: data.datasets[0].label,
                    data: data.datasets[0].data,
                    backgroundColor: [
                        colors.primary,
                        colors.purple
                    ],
                    borderColor: [
                        colors.primary,
                        colors.purple
                    ],
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }
            ]
        }

        const options = this.getCommonOptions('bar');
        this.charts.inmateStats = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                ...options,
                plugins: {
                    ...options.plugins,
                    legend: {
                        display: false
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart',
                    delay: (context) => {
                        let delay = 0;
                        if (context.type === 'data' && context.mode === 'default') {
                            delay = context.dataIndex * 100;
                        }
                        return delay;
                    }
                }
            }
        });
    }

    /**
     * Update visitor trends chart with new data
     */
    async updateVisitorTrendsChart(data) {
        // Validate data before updating
        if (!data || !this.isValidChartData(data)) {
            console.warn('Invalid visitor trends data, keeping existing chart');
            return;
        }
        
        await this.waitForChartJs();
        this.initVisitorTrendsChart(data);
    }

    /**
     * Update request status chart with new data
     */
    async updateRequestStatusChart(data) {
        // Validate data before updating
        if (!data || !this.isValidChartData(data)) {
            console.warn('Invalid request status data, keeping existing chart');
            return;
        }
        
        await this.waitForChartJs();
        this.initRequestStatusChart(data);
    }

    /**
     * Update inmate statistics chart with new data
     */
    async updateInmateStatsChart(data) {
        // Validate data before updating
        if (!data || !this.isValidChartData(data)) {
            console.warn('Invalid inmate stats data, keeping existing chart');
            return;
        }
        
        await this.waitForChartJs();
        this.initInmateStatsChart(data);
    }

    /**
     * Validate chart data structure
     */
    isValidChartData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        
        // Check for required properties
        const hasLabels = Array.isArray(data.labels) && data.labels.length > 0;
        const hasDatasets = Array.isArray(data.datasets) && data.datasets.length > 0;
        
        if (!hasLabels || !hasDatasets) {
            return false;
        }
        
        // Check if datasets have actual data
        const hasValidData = data.datasets.some(dataset => 
            Array.isArray(dataset.data) && 
            dataset.data.length > 0 &&
            dataset.data.some(value => value != null && value !== 0)
        );
        
        return hasValidData;
    }

    /**
     * Update all charts with new data (async version)
     */
    async updateChartsAsync(data) {
        if (!data || typeof data !== 'object') {
            console.warn('No valid data provided for charts update');
            return;
        }
        
        await this.waitForChartJs();

        // Update visitor trends chart
        if (data.visitorTrends && this.isValidChartData(data.visitorTrends)) {
            await this.updateVisitorTrendsChart(data.visitorTrends);
        }

        // Update inmate statistics chart
        if (data.inmateStats && this.isValidChartData(data.inmateStats)) {
            await this.updateInmateStatsChart(data.inmateStats);
        }

        // Update request status chart
        if (data.requestStatus && this.isValidChartData(data.requestStatus)) {
            await this.updateRequestStatusChart(data.requestStatus);
        }
    }

    /**
     * Destroy all charts
     */
    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}
