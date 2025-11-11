/**
 * Live Update Manager
 * Handles periodic data updates with intelligent retry logic
 */

export class LiveUpdateManager {
    constructor(dataManager, chartManager, updateCallback) {
        this.dataManager = dataManager;
        this.chartManager = chartManager;
        this.updateCallback = updateCallback;
        this.updateInterval = null;
        this.isEnabled = false;
        this.updateIntervalMs = 30000; // 30 seconds default
        this.retryCount = 0;
        this.maxRetries = 3;
        this.lastSuccessfulUpdate = null;
    }

    /**
     * Start live updates
     */
    start(intervalMs = 30000) {
        if (this.isEnabled) {
            console.info('Live updates already enabled');
            return;
        }

        this.updateIntervalMs = intervalMs;
        this.isEnabled = true;
        this.retryCount = 0;

        console.info(`Starting live updates every ${intervalMs / 1000} seconds`);

        // Set up periodic updates
        this.updateInterval = setInterval(() => {
            this.performUpdate();
        }, this.updateIntervalMs);
    }

    /**
     * Stop live updates
     */
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.isEnabled = false;
        console.info('Live updates stopped');
    }

    /**
     * Perform a single update
     */
    async performUpdate() {
        try {
            // Don't update if too many failures
            if (this.retryCount >= this.maxRetries) {
                console.warn('Max retries reached, stopping live updates');
                this.stop();
                return;
            }

            // Call the update callback (usually ReportsManager.loadReports)
            if (this.updateCallback && typeof this.updateCallback === 'function') {
                await this.updateCallback();
                
                // Update successful, reset retry count
                this.retryCount = 0;
                this.lastSuccessfulUpdate = new Date();
            }
        } catch (error) {
            console.error('Error during live update:', error);
            this.retryCount++;
            
            // If we hit max retries, stop updates
            if (this.retryCount >= this.maxRetries) {
                console.warn('Stopping live updates due to repeated failures');
                this.stop();
            }
        }
    }

    /**
     * Manually trigger an update
     */
    async triggerUpdate() {
        return this.performUpdate();
    }

    /**
     * Check if live updates are enabled
     */
    isActive() {
        return this.isEnabled && this.updateInterval !== null;
    }

    /**
     * Get time since last successful update
     */
    getTimeSinceLastUpdate() {
        if (!this.lastSuccessfulUpdate) {
            return null;
        }
        return Date.now() - this.lastSuccessfulUpdate.getTime();
    }

    /**
     * Reset retry counter
     */
    resetRetries() {
        this.retryCount = 0;
    }
}
