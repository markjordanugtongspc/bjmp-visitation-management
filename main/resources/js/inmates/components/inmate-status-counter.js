// Inmate Status Counter Component
// - Manages statistics cards for inmate counts by status
// - Provides placeholder data and update methods
// - Responsive design with Tailwind CSS

/**
 * InmateStatusCounter - Component for managing inmate statistics
 */
class InmateStatusCounter {
  constructor() {
    this.statistics = {
      total: 0,
      active: 0,
      released: 0,
      medical: 0,
      transferred: 0
    };
    
    this.elements = {
      totalInmates: document.getElementById('total-inmates'),
      activeInmates: document.getElementById('active-inmates'),
      releasedInmates: document.getElementById('released-inmates'),
      medicalInmates: document.getElementById('medical-inmates')
    };
    
    this.initializePlaceholderData();
  }

  /**
   * Initialize with placeholder data
   */
  initializePlaceholderData() {
    // Set placeholder values - these will be replaced with real data later
    this.statistics = {
      total: 0,
      active: 0,
      released: 0,
      medical: 0,
      transferred: 0
    };
    
    this.updateDisplay();
  }

  /**
   * Update the display with current statistics
   */
  updateDisplay() {
    if (this.elements.totalInmates) {
      this.elements.totalInmates.textContent = this.statistics.total;
    }
    
    if (this.elements.activeInmates) {
      this.elements.activeInmates.textContent = this.statistics.active;
    }
    
    if (this.elements.releasedInmates) {
      this.elements.releasedInmates.textContent = this.statistics.released;
    }
    
    if (this.elements.medicalInmates) {
      this.elements.medicalInmates.textContent = this.statistics.medical;
    }
  }

  /**
   * Update statistics from inmate data
   * @param {Array} inmates - Array of inmate objects
   */
  updateFromInmates(inmates = []) {
    // Reset counters
    this.statistics = {
      total: inmates.length,
      active: 0,
      released: 0,
      medical: 0,
      transferred: 0
    };

    // Count inmates by status
    inmates.forEach(inmate => {
      const status = inmate.status?.toLowerCase() || 'unknown';
      
      switch (status) {
        case 'active':
          this.statistics.active++;
          break;
        case 'released':
          this.statistics.released++;
          break;
        case 'medical':
          this.statistics.medical++;
          break;
        case 'transferred':
          this.statistics.transferred++;
          break;
        default:
          // Handle unknown statuses
          break;
      }
    });

    this.updateDisplay();
  }

  /**
   * Add a single inmate to statistics
   * @param {Object} inmate - Inmate object
   */
  addInmate(inmate) {
    this.statistics.total++;
    
    const status = inmate.status?.toLowerCase() || 'unknown';
    switch (status) {
      case 'active':
        this.statistics.active++;
        break;
      case 'released':
        this.statistics.released++;
        break;
      case 'medical':
        this.statistics.medical++;
        break;
      case 'transferred':
        this.statistics.transferred++;
        break;
    }
    
    this.updateDisplay();
  }

  /**
   * Remove a single inmate from statistics
   * @param {Object} inmate - Inmate object
   */
  removeInmate(inmate) {
    this.statistics.total = Math.max(0, this.statistics.total - 1);
    
    const status = inmate.status?.toLowerCase() || 'unknown';
    switch (status) {
      case 'active':
        this.statistics.active = Math.max(0, this.statistics.active - 1);
        break;
      case 'released':
        this.statistics.released = Math.max(0, this.statistics.released - 1);
        break;
      case 'medical':
        this.statistics.medical = Math.max(0, this.statistics.medical - 1);
        break;
      case 'transferred':
        this.statistics.transferred = Math.max(0, this.statistics.transferred - 1);
        break;
    }
    
    this.updateDisplay();
  }

  /**
   * Update inmate status in statistics
   * @param {Object} inmate - Inmate object
   * @param {string} oldStatus - Previous status
   * @param {string} newStatus - New status
   */
  updateInmateStatus(inmate, oldStatus, newStatus) {
    // Remove from old status
    const oldStatusLower = oldStatus?.toLowerCase() || 'unknown';
    switch (oldStatusLower) {
      case 'active':
        this.statistics.active = Math.max(0, this.statistics.active - 1);
        break;
      case 'released':
        this.statistics.released = Math.max(0, this.statistics.released - 1);
        break;
      case 'medical':
        this.statistics.medical = Math.max(0, this.statistics.medical - 1);
        break;
      case 'transferred':
        this.statistics.transferred = Math.max(0, this.statistics.transferred - 1);
        break;
    }

    // Add to new status
    const newStatusLower = newStatus?.toLowerCase() || 'unknown';
    switch (newStatusLower) {
      case 'active':
        this.statistics.active++;
        break;
      case 'released':
        this.statistics.released++;
        break;
      case 'medical':
        this.statistics.medical++;
        break;
      case 'transferred':
        this.statistics.transferred++;
        break;
    }
    
    this.updateDisplay();
  }

  /**
   * Get current statistics
   * @returns {Object} Current statistics object
   */
  getStatistics() {
    return { ...this.statistics };
  }

  /**
   * Set statistics directly (for backend integration)
   * @param {Object} stats - Statistics object
   */
  setStatistics(stats) {
    this.statistics = {
      total: stats.total || 0,
      active: stats.active || 0,
      released: stats.released || 0,
      medical: stats.medical || 0,
      transferred: stats.transferred || 0
    };
    
    this.updateDisplay();
  }

  /**
   * Reset all statistics to zero
   */
  reset() {
    this.statistics = {
      total: 0,
      active: 0,
      released: 0,
      medical: 0,
      transferred: 0
    };
    
    this.updateDisplay();
  }

  /**
   * Check if elements are available in DOM
   * @returns {boolean} True if all elements are found
   */
  isReady() {
    return Object.values(this.elements).every(element => element !== null);
  }

  /**
   * Initialize the component
   * @returns {boolean} True if initialization successful
   */
  initialize() {
    if (!this.isReady()) {
      console.warn('InmateStatusCounter: Some DOM elements not found');
      return false;
    }
    
    this.initializePlaceholderData();
    return true;
  }
}

/**
 * Create and return a new InmateStatusCounter instance
 * @returns {InmateStatusCounter} New instance
 */
export function createInmateStatusCounter() {
  return new InmateStatusCounter();
}

/**
 * Default export
 */
export default InmateStatusCounter;
