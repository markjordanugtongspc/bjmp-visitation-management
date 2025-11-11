/**
 * Reports Data Manager
 * Handles all data fetching and processing for reports
 */

export class ReportsDataManager {
    constructor() {
        this.baseUrl = '/api/reports';
        this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        this.currentData = null;
    }
    
    /**
     * Check if API is available (suppress console warnings if not)
     */
    async checkApiAvailability() {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Fetch reports data from API
     */
    async fetchReports(filters = {}) {
        try {
            // Build URL with filters - map frontend filter keys to backend parameter names
            const params = new URLSearchParams();
            
            // Map dateFrom to date_from
            if (filters.dateFrom) {
                params.append('date_from', filters.dateFrom);
            }
            
            // Map dateTo to date_to
            if (filters.dateTo) {
                params.append('date_to', filters.dateTo);
            }
            
            // Map reportType to reportType (same name)
            if (filters.reportType && filters.reportType !== 'all') {
                params.append('reportType', filters.reportType);
            }
            
            // Add status if provided
            if (filters.status && filters.status !== 'all') {
                params.append('status', filters.status);
            }
            
            const url = params.toString() ? `${this.baseUrl}?${params}` : this.baseUrl;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken || '',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin' // Include cookies for authentication
            });

            if (!response.ok) {
                // If 404 or other error, return null silently (page will use static data)
                if (response.status === 404) {
                    return null;
                }
                // For other errors, try to get error message
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                } catch (e) {
                    if (e instanceof Error && e.message.includes('message')) {
                        throw e;
                    }
                    return null;
                }
            }

            const result = await response.json();
            
            // Extract data from response structure: { success: true, data: {...} }
            let extractedData = null;
            
            if (result.success && result.data) {
                extractedData = result.data;
            } else if (result.data) {
                // Fallback: if result has data property, use it
                extractedData = result.data;
            } else {
                // Last resort: use result directly
                extractedData = result;
            }
            
            // Validate extracted data has chart information
            if (!this.hasValidChartData(extractedData)) {
                console.warn('API returned data without valid chart information');
                return null;
            }
            
            this.currentData = extractedData;
            return this.currentData;
        } catch (error) {
            // Silently fail - page will use static data from Blade template
            // Only log if it's not a 404 or network error
            if (!error.message.includes('404') && !error.message.includes('Failed to fetch')) {
                console.error('Error fetching reports:', error);
            }
            return null;
        }
    }

    /**
     * Get current data
     */
    getCurrentData() {
        return this.currentData;
    }

    /**
     * Check if data contains valid chart information
     */
    hasValidChartData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        
        // Check if data has any chart-related properties
        const hasVisitorTrends = data.visitorTrends && 
            typeof data.visitorTrends === 'object' &&
            Array.isArray(data.visitorTrends.labels) &&
            data.visitorTrends.labels.length > 0;
            
        const hasRequestStatus = data.requestStatus && 
            typeof data.requestStatus === 'object' &&
            Array.isArray(data.requestStatus.labels) &&
            data.requestStatus.labels.length > 0;
            
        const hasInmateStats = data.inmateStats && 
            typeof data.inmateStats === 'object' &&
            Array.isArray(data.inmateStats.labels) &&
            data.inmateStats.labels.length > 0;
        
        // Data is valid if it has at least one valid chart
        return hasVisitorTrends || hasRequestStatus || hasInmateStats;
    }

    /**
     * Calculate statistics from data
     */
    calculateStatistics(data) {
        if (!data || !data.statistics) {
            // Return null to indicate no valid statistics (don't overwrite initial values)
            return null;
        }

        // Backend returns statistics in data.statistics object
        const stats = data.statistics;
        
        // Return statistics only if we have valid data
        return {
            totalVisitors: stats.totalVisitors ?? 0,
            totalInmates: stats.totalInmates ?? 0,
            pendingRequests: stats.pendingRequests ?? 0,
            approvedToday: stats.approvedToday ?? 0
        };
    }

    /**
     * Fetch specific report type
     */
    async fetchReportByType(reportType, filters = {}) {
        try {
            const params = new URLSearchParams({ ...filters, type: reportType });
            const response = await fetch(`${this.baseUrl}/type?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${reportType} report:`, error);
            throw error;
        }
    }
}
