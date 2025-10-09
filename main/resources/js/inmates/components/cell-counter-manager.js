// Cell Counter Manager Component
// - Manages automatic +/- operations for cell occupancy
// - Handles cell assignments and transfers
// - Updates cell counts in real-time
// - Integrates with inmate modal and backend API

/**
 * @typedef {object} Cell
 * @property {number} id
 * @property {string} name
 * @property {string} type
 * @property {number} capacity
 * @property {number} currentCount
 * @property {string} status
 */

/**
 * @typedef {object} Inmate
 * @property {number} id
 * @property {number} cell_id
 * @property {string} gender
 */

/**
 * CellCounterManager - Component for managing cell occupancy counts
 */
class CellCounterManager {
  /**
   * @param {object} options
   * @param {string} options.cellsEndpoint
   * @param {string} options.inmatesEndpoint
   */
  constructor({
    cellsEndpoint = '/api/cells',
    inmatesEndpoint = '/api/inmates?status=Active&per_page=1000'
  } = {}) {
    this.cells = [];
    /** @type {Map<number, number>} */
    this.cellCounts = new Map();
    this.callbacks = {
      onCountUpdate: null,
      onCellFull: null,
      onCellTransfer: null,
      onLoadingStateChange: null,
    };
    this.endpoints = {
      cells: cellsEndpoint,
      inmates: inmatesEndpoint,
    };
    this.isLoading = false;

    this.initializeFromAPI();
  }

  /**
   * Set the loading state and notify listeners
   * @param {boolean} isLoading
   * @private
   */
  _setLoading(isLoading) {
    this.isLoading = isLoading;
    if (this.callbacks.onLoadingStateChange) {
      this.callbacks.onLoadingStateChange(isLoading);
    }
  }

  /**
   * Fetch data from the API
   * @param {string} url
   * @returns {Promise<any>}
   * @private
   */
  async _fetch(url) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]') ?.getAttribute('content') || '';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'API returned an unsuccessful response');
    }
    return data.data;
  }


  /**
   * Initialize cell counts from API
   */
  async initializeFromAPI() {
    this._setLoading(true);
    try {
      const cellsData = await this._fetch(this.endpoints.cells);
      this.cells = cellsData;
      this.cells.forEach(cell => this.cellCounts.set(cell.id, cell.currentCount || 0));
      await this.calculateActualOccupancy();
    } catch (error) {
      console.error('Failed to initialize cell counts:', error);
      this.cells = [];
    } finally {
      this._setLoading(false);
    }
  }

  /**
   * Calculate actual occupancy by counting inmates in the database
   */
  async calculateActualOccupancy() {
    this._setLoading(true);
    try {
      const inmatesData = await this._fetch(this.endpoints.inmates);
      const inmates = Array.isArray(inmatesData) ? inmatesData : inmatesData.data || [];

      // Reset all counts to 0
      this.cells.forEach(cell => this.cellCounts.set(cell.id, 0));

      // Count inmates per cell ID
      const cellCountMap = new Map();
      inmates.forEach(inmate => {
        if (inmate.cell_id) {
          const currentCount = cellCountMap.get(inmate.cell_id) || 0;
          cellCountMap.set(inmate.cell_id, currentCount + 1);
        }
      });
      
      // Update frontend counts
      cellCountMap.forEach((count, cellId) => {
        this.cellCounts.set(cellId, count);
      });
      
      // Update backend current_count for all cells
      await this.updateBackendCellCounts(cellCountMap);
      
    } catch (error) {
      console.error('Failed to calculate actual occupancy:', error);
    } finally {
      this._setLoading(false);
    }
  }
  
  /**
   * Update backend cell counts based on actual inmate assignments
   * This method ensures that the cell counts in the database match the actual inmate assignments
   * by calling the /api/cells/{cellId}/occupancy endpoint for each cell
   * 
   * @param {Map<number, number>} cellCountMap - Map of cellId -> count
   */
  async updateBackendCellCounts(cellCountMap) {
    try {
      // Update each cell's current_count in the backend
      const updatePromises = [];
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      
      // Process cells with inmates
      for (const [cellId, count] of cellCountMap) {
        const cell = this.getCellById(cellId);
        if (cell) {
          console.log(`Updating cell ${cellId} with count: ${count}`);
          updatePromises.push(
            fetch(`/api/cells/${cellId}/occupancy`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
              },
              body: JSON.stringify({ force_count: count }) // Send the count to force update
            })
          );
        }
      }
      
      // Also update cells that have 0 inmates (not in the map)
      this.cells.forEach(cell => {
        if (!cellCountMap.has(cell.id)) {
          console.log(`Updating cell ${cell.id} with count: 0`);
          updatePromises.push(
            fetch(`/api/cells/${cell.id}/occupancy`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
              },
              body: JSON.stringify({ force_count: 0 }) // Force count to 0
            })
          );
        }
      });
      
      const results = await Promise.all(updatePromises);
      
      // Check responses
      for (const response of results) {
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error updating cell occupancy:', errorData);
        }
      }
      
      console.log('Backend cell counts updated successfully');
      
    } catch (error) {
      console.error('Failed to update backend cell counts:', error);
    }
  }

  /**
   * Set callback functions
   * @param {object} callbacks
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks,
      ...callbacks
    };
  }

  /**
   * Get available cells for a specific gender
   * @param {string} gender - 'Male' or 'Female'
   * @returns {Cell[]} Available cells
   */
  getAvailableCells(gender) {
    return this.cells.filter(cell => {
      const isCorrectGender = cell.type === gender;
      const hasCapacity = this.getCellCount(cell.id) < cell.capacity;
      const isActive = cell.status === 'Active';

      return isCorrectGender && hasCapacity && isActive;
    });
  }

  /**
   * Get current count for a cell
   * @param {number} cellId - Cell ID
   * @returns {number} Current count
   */
  getCellCount(cellId) {
    return this.cellCounts.get(cellId) || 0;
  }

  /**
   * Get cell by ID
   * @param {number} cellId - Cell ID
   * @returns {Cell|null} Cell object or null
   */
  getCellById(cellId) {
    return this.cells.find(cell => cell.id === cellId) || null;
  }

  /**
   * Check if cell is full
   * @param {number} cellId - Cell ID
   * @returns {boolean} True if the cell is full
   */
  isCellFull(cellId) {
    const cell = this.getCellById(cellId);
    if (!cell) return true;

    return this.getCellCount(cellId) >= cell.capacity;
  }

  /**
   * Check if the cell has the correct gender for an inmate
   * @param {number} cellId - Cell ID
   * @param {string} gender - Inmate gender
   * @returns {boolean} True if the gender matches
   */
  isCorrectGender(cellId, gender) {
    const cell = this.getCellById(cellId);
    return cell && cell.type === gender;
  }

  /**
   * Assign inmate to cell (increase count)
   * @param {number} cellId - Cell ID
   * @param {Inmate} inmate - Inmate object
   * @returns {Promise<boolean>} Success status
   */
  async assignInmateToCell(cellId, inmate) {
    if (!this.canAssignToCell(cellId, inmate.gender)) {
      throw new Error('Cannot assign inmate to this cell');
    }

    // Optimistically update the count
    const currentCount = this.cellCounts.get(cellId) || 0;
    this.cellCounts.set(cellId, currentCount + 1);
    this._notifyCountUpdate(cellId);

    try {
      await this.syncCellOccupancy(cellId);
      return true;
    } catch (error) {
      // Rollback optimistic update
      this.cellCounts.set(cellId, currentCount);
      this._notifyCountUpdate(cellId);
      console.error('Failed to assign inmate:', error);
      throw error;
    }
  }

  /**
   * Remove inmate from cell (decrease count)
   * @param {number} cellId - Cell ID
   * @param {Inmate} inmate - Inmate object
   * @returns {Promise<boolean>} Success status
   */
  async removeInmateFromCell(cellId, inmate) {
    const currentCount = this.cellCounts.get(cellId) || 0;
    if (currentCount > 0) {
      this.cellCounts.set(cellId, currentCount - 1);
      this._notifyCountUpdate(cellId);
    }

    try {
      await this.syncCellOccupancy(cellId);
      return true;
    } catch (error) {
      // Rollback optimistic update
      this.cellCounts.set(cellId, currentCount);
      this._notifyCountUpdate(cellId);
      console.error('Failed to remove inmate:', error);
      throw error;
    }
  }


  /**
   * Transfer inmate between cells
   * @param {number} fromCellId - Source cell ID
   * @param {number} toCellId - Destination cell ID
   * @param {Inmate} inmate - Inmate object
   * @returns {Promise<boolean>} Success status
   */
  async transferInmateBetweenCells(fromCellId, toCellId, inmate) {
    if (fromCellId === toCellId) return true;

    if (toCellId && !this.canAssignToCell(toCellId, inmate.gender)) {
      throw new Error('Cannot transfer inmate to destination cell');
    }


    // Optimistic update
    const fromCount = this.cellCounts.get(fromCellId) || 0;
    const toCount = this.cellCounts.get(toCellId) || 0;

    if (fromCellId) this.cellCounts.set(fromCellId, fromCount - 1);
    if (toCellId) this.cellCounts.set(toCellId, toCount + 1);

    this._notifyCountUpdate(fromCellId);
    this._notifyCountUpdate(toCellId);


    try {
      await this.syncCellOccupancy();
      if (this.callbacks.onCellTransfer) {
        this.callbacks.onCellTransfer(fromCellId, toCellId, inmate);
      }
      return true;
    } catch (error) {
      // Rollback optimistic update
      if (fromCellId) this.cellCounts.set(fromCellId, fromCount);
      if (toCellId) this.cellCounts.set(toCellId, toCount);
      this._notifyCountUpdate(fromCellId);
      this._notifyCountUpdate(toCellId);
      console.error('Transfer failed:', error);
      throw error;
    }
  }

  /**
   * Check if inmate can be assigned to cell
   * @param {number} cellId - Cell ID
   * @param {string} gender - Inmate gender
   * @returns {boolean} True if assignment is valid
   */
  canAssignToCell(cellId, gender) {
    if (!cellId) return true;

    const cell = this.getCellById(cellId);
    if (!cell) return false;

    const hasCorrectGender = cell.type === gender;
    const hasCapacity = !this.isCellFull(cellId);
    const isActive = cell.status === 'Active';

    return hasCorrectGender && hasCapacity && isActive;
  }

  /**
   * Sync cell occupancy with backend (recalculate from database)
   * @param {number|null} cellId - Cell ID (optional, if not provided syncs all cells)
   */
  async syncCellOccupancy(cellId = null) {
    this._setLoading(true);
    try {
      // Recalculate occupancy from database - this will also update backend via updateBackendCellCounts
      await this.calculateActualOccupancy();

      // Update UI
      if (cellId) {
        this._notifyCountUpdate(cellId);
      } else {
        this.cells.forEach(cell => this._notifyCountUpdate(cell.id));
      }
      return true;
    } catch (error) {
      console.error('Failed to sync cell occupancy:', error);
      throw error;
    } finally {
      this._setLoading(false);
    }
  }

  /**
   * Refresh cell data from API and recalculate occupancy
   */
  async refreshCellData() {
    this._setLoading(true);
    try {
      const cellsData = await this._fetch(this.endpoints.cells);
      this.cells = cellsData;
      await this.calculateActualOccupancy();
      return this.cells;
    } catch (error) {
      console.error('Error refreshing cell data:', error);
      throw error;
    } finally {
      this._setLoading(false);
    }
  }

  /**
   * Notify listeners about a count update
   * @param {number} cellId
   * @private
   */
  _notifyCountUpdate(cellId) {
    const newCount = this.getCellCount(cellId);
    if (this.callbacks.onCountUpdate) {
      this.callbacks.onCountUpdate(cellId, newCount);
    }
    if (this.isCellFull(cellId) && this.callbacks.onCellFull) {
      this.callbacks.onCellFull(cellId);
    }
  }

  /**
   * Get cell occupancy percentage
   * @param {number} cellId - Cell ID
   * @returns {number} Occupancy percentage (0-100)
   */
  getOccupancyPercentage(cellId) {
    const cell = this.getCellById(cellId);
    if (!cell || cell.capacity === 0) return 0;

    const count = this.getCellCount(cellId);
    return Math.round((count / cell.capacity) * 100);
  }

  /**
   * Get cell status class based on occupancy
   * @param {number} cellId - Cell ID
   * @returns {string} CSS class for status
   */
  getOccupancyStatusClass(cellId) {
    const percentage = this.getOccupancyPercentage(cellId);

    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  }

  /**
   * Get a summary of cell occupancy
   * @returns {{totalInmates: number, totalCapacity: number}}
   */
  getCellOccupancySummary() {
    const totalInmates = Array.from(this.cellCounts.values()).reduce((sum, count) => sum + count, 0);
    const totalCapacity = this.cells.reduce((sum, cell) => sum + cell.capacity, 0);
    return { totalInmates, totalCapacity };
  }


  /**
   * Generate cell option HTML for dropdown
   * @param {string} gender - Inmate gender
   * @param {number|null} currentCellId - Currently selected cell ID
   * @returns {string} HTML for cell options
   */
  generateCellOptions(gender, currentCellId = null) {
    return this.getAvailableCells(gender)
      .map(cell => {
        const count = this.getCellCount(cell.id);
        const percentage = this.getOccupancyPercentage(cell.id);
        const isSelected = currentCellId === cell.id;
        const isFull = this.isCellFull(cell.id);
        return `
        <option value="${cell.id}" ${isSelected ? 'selected' : ''} ${isFull ? 'disabled' : ''}>
          ${cell.name} (${count}/${cell.capacity} - ${percentage}%) - ${cell.type}${isFull ? ' - FULL' : ''}
        </option>
      `;
      })
      .join('');
  }

  /**
   * Update cell display in UI
   * @param {number} cellId - Cell ID
   * @param {number} newCount - New count
   */
  updateCellDisplay(cellId, newCount) {
    const cell = this.getCellById(cellId);
    if (!cell) return;

    const percentage = this.getOccupancyPercentage(cellId);
    const occupancyClass = this.getOccupancyStatusClass(cellId).replace('text-', 'bg-');


    document.querySelectorAll(`[data-cell-count="${cellId}"]`).forEach(el => {
      el.textContent = newCount;
    });

    document.querySelectorAll(`[data-cell-bar="${cellId}"]`).forEach(el => {
      el.style.width = `${percentage}%`;
      el.className = el.className.replace(/bg-(red|yellow|green)-500/, occupancyClass);
    });

    const totalOccupancy = Array.from(this.cellCounts.values()).reduce((sum, count) => sum + count, 0);
    const totalOccupancyEl = document.getElementById('current-occupancy');
    if (totalOccupancyEl) {
      totalOccupancyEl.textContent = totalOccupancy;
    }
  }


  /**
   * Force refresh all data from API
   */
  async forceRefresh() {
    console.log('Force refreshing cell counter manager...');
    this._setLoading(true);
    try {
      // First refresh cell data from API
      await this.refreshCellData();
      
      // Then calculate occupancy and update backend
      await this.calculateActualOccupancy();
      
      console.log('Cell counter manager refreshed successfully');
      return true;
    } catch (error) {
      console.error('Failed to force refresh:', error);
      return false;
    } finally {
      this._setLoading(false);
    }
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      cells: this.cells.length,
      cellCounts: Object.fromEntries(this.cellCounts),
      callbacks: Object.keys(this.callbacks).filter(key => this.callbacks[key] !== null)
    };
  }
}

/**
 * Create and return a new CellCounterManager instance
 * @returns {CellCounterManager} New instance
 */
export function createCellCounterManager() {
  return new CellCounterManager();
}

/**
 * Default export
 */
export default CellCounterManager;