// Cell Counter Manager Component
// - Manages automatic +/- operations for cell occupancy
// - Handles cell assignments and transfers
// - Updates cell counts in real-time
// - Integrates with inmate modal and backend API

/**
 * CellCounterManager - Component for managing cell occupancy counts
 */
class CellCounterManager {
  constructor() {
    this.cells = [];
    this.cellCounts = new Map(); // cellId -> count
    this.callbacks = {
      onCountUpdate: null,
      onCellFull: null,
      onCellTransfer: null
    };
    
    this.initializeFromAPI();
  }

  /**
   * Initialize cell counts from API
   */
  async initializeFromAPI() {
    try {
      // Fetch cells data first
      const cellsResponse = await fetch('/api/cells', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });
      
      if (cellsResponse.ok) {
        const cellsData = await cellsResponse.json();
        if (cellsData.success && cellsData.data) {
          this.cells = cellsData.data;
          
          // Initialize with cell data first (fallback)
          this.cells.forEach(cell => {
            this.cellCounts.set(cell.id, cell.currentCount || 0);
          });
          
          // Then try to calculate actual occupancy from database
          try {
            await this.calculateActualOccupancy();
          } catch (occupancyError) {
            console.warn('Could not calculate actual occupancy, using cell data:', occupancyError);
            // Keep the fallback values from cell data
          }
        }
      } else {
        console.warn('Failed to fetch cells data, using empty array');
        this.cells = [];
      }
    } catch (error) {
      console.error('Failed to initialize cell counts:', error);
      this.cells = [];
    }
  }

  /**
   * Calculate actual occupancy by counting inmates in database
   */
  async calculateActualOccupancy() {
    try {
      // Fetch all active inmates with cell assignments
      const inmatesResponse = await fetch('/api/inmates?status=Active&per_page=1000', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });

      if (!inmatesResponse.ok) {
        throw new Error(`HTTP ${inmatesResponse.status}: ${inmatesResponse.statusText}`);
      }

      const inmatesData = await inmatesResponse.json();
      console.log('Inmates API response:', inmatesData); // Debug log
      
      if (!inmatesData.success) {
        throw new Error(inmatesData.message || 'API returned unsuccessful response');
      }

      // Reset all counts to 0
      this.cells.forEach(cell => {
        this.cellCounts.set(cell.id, 0);
      });

      // Handle different response structures
      let inmates = [];
      if (Array.isArray(inmatesData.data)) {
        inmates = inmatesData.data;
      } else if (inmatesData.data && Array.isArray(inmatesData.data.data)) {
        inmates = inmatesData.data.data;
      } else if (inmatesData.data && inmatesData.data.data && Array.isArray(inmatesData.data.data.data)) {
        inmates = inmatesData.data.data.data;
      } else {
        console.warn('Unexpected inmates data structure:', inmatesData.data);
        inmates = [];
      }
      
      console.log('Processing inmates:', inmates.length, 'records');
      
      // Count inmates per cell
      inmates.forEach(inmate => {
        if (inmate.cell_id) {
          const currentCount = this.cellCounts.get(inmate.cell_id) || 0;
          this.cellCounts.set(inmate.cell_id, currentCount + 1);
        }
      });
      
      console.log('Cell counts updated:', Object.fromEntries(this.cellCounts));
      
    } catch (error) {
      console.error('Failed to calculate actual occupancy:', error);
      // Fallback to cell data if available
      this.cells.forEach(cell => {
        this.cellCounts.set(cell.id, cell.currentCount || 0);
      });
    }
  }

  /**
   * Set callback functions
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Get available cells for a specific gender
   * @param {string} gender - 'Male' or 'Female'
   * @returns {Array} Available cells
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
   * @returns {Object|null} Cell object or null
   */
  getCellById(cellId) {
    return this.cells.find(cell => cell.id === cellId);
  }

  /**
   * Check if cell is full
   * @param {number} cellId - Cell ID
   * @returns {boolean} True if cell is full
   */
  isCellFull(cellId) {
    const cell = this.getCellById(cellId);
    if (!cell) return true;
    
    return this.getCellCount(cellId) >= cell.capacity;
  }

  /**
   * Check if cell has correct gender for inmate
   * @param {number} cellId - Cell ID
   * @param {string} gender - Inmate gender
   * @returns {boolean} True if gender matches
   */
  isCorrectGender(cellId, gender) {
    const cell = this.getCellById(cellId);
    return cell && cell.type === gender;
  }

  /**
   * Assign inmate to cell (increase count)
   * @param {number} cellId - Cell ID
   * @param {Object} inmate - Inmate object
   * @returns {boolean} Success status
   */
  async assignInmateToCell(cellId, inmate) {
    if (!this.canAssignToCell(cellId, inmate.gender)) {
      throw new Error('Cannot assign inmate to this cell');
    }

    // No need to manually update count - it will be calculated from database
    // Just trigger callbacks to update UI
    try {
      // Recalculate occupancy from database
      await this.calculateActualOccupancy();
      
      const newCount = this.getCellCount(cellId);
      
      // Trigger callbacks
      if (this.callbacks.onCountUpdate) {
        this.callbacks.onCountUpdate(cellId, newCount);
      }
      
      if (this.isCellFull(cellId) && this.callbacks.onCellFull) {
        this.callbacks.onCellFull(cellId);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update cell count:', error);
      throw error;
    }
  }

  /**
   * Remove inmate from cell (decrease count)
   * @param {number} cellId - Cell ID
   * @param {Object} inmate - Inmate object
   * @returns {boolean} Success status
   */
  async removeInmateFromCell(cellId, inmate) {
    // No need to manually update count - it will be calculated from database
    try {
      // Recalculate occupancy from database
      await this.calculateActualOccupancy();
      
      const newCount = this.getCellCount(cellId);
      
      // Trigger callbacks
      if (this.callbacks.onCountUpdate) {
        this.callbacks.onCountUpdate(cellId, newCount);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update cell count:', error);
      throw error;
    }
  }

  /**
   * Transfer inmate between cells
   * @param {number} fromCellId - Source cell ID
   * @param {number} toCellId - Destination cell ID
   * @param {Object} inmate - Inmate object
   * @returns {boolean} Success status
   */
  async transferInmateBetweenCells(fromCellId, toCellId, inmate) {
    if (fromCellId === toCellId) {
      return true; // No transfer needed
    }

    if (toCellId && !this.canAssignToCell(toCellId, inmate.gender)) {
      throw new Error('Cannot transfer inmate to destination cell');
    }

    try {
      // Recalculate occupancy from database after the inmate's cell_id has been updated
      await this.calculateActualOccupancy();
      
      // Update UI for both cells
      if (fromCellId) {
        const fromCount = this.getCellCount(fromCellId);
        if (this.callbacks.onCountUpdate) {
          this.callbacks.onCountUpdate(fromCellId, fromCount);
        }
      }
      
      if (toCellId) {
        const toCount = this.getCellCount(toCellId);
        if (this.callbacks.onCountUpdate) {
          this.callbacks.onCountUpdate(toCellId, toCount);
        }
        
        if (this.isCellFull(toCellId) && this.callbacks.onCellFull) {
          this.callbacks.onCellFull(toCellId);
        }
      }
      
      // Trigger transfer callback
      if (this.callbacks.onCellTransfer) {
        this.callbacks.onCellTransfer(fromCellId, toCellId, inmate);
      }
      
      return true;
    } catch (error) {
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
    if (!cellId) return true; // No cell assignment
    
    const cell = this.getCellById(cellId);
    if (!cell) return false;
    
    const hasCorrectGender = cell.type === gender;
    const hasCapacity = !this.isCellFull(cellId);
    const isActive = cell.status === 'Active';
    
    return hasCorrectGender && hasCapacity && isActive;
  }

  /**
   * Sync cell occupancy with backend (recalculate from database)
   * @param {number} cellId - Cell ID (optional, if not provided syncs all cells)
   */
  async syncCellOccupancy(cellId = null) {
    try {
      // Recalculate occupancy from database
      await this.calculateActualOccupancy();
      
      if (cellId) {
        // Update specific cell
        const newCount = this.getCellCount(cellId);
        if (this.callbacks.onCountUpdate) {
          this.callbacks.onCountUpdate(cellId, newCount);
        }
      } else {
        // Update all cells
        this.cells.forEach(cell => {
          const newCount = this.getCellCount(cell.id);
          if (this.callbacks.onCountUpdate) {
            this.callbacks.onCountUpdate(cell.id, newCount);
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to sync cell occupancy:', error);
      throw error;
    }
  }

  /**
   * Refresh cell data from API and recalculate occupancy
   */
  async refreshCellData() {
    try {
      // Fetch fresh cell data
      const cellsResponse = await fetch('/api/cells', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });
      
      if (cellsResponse.ok) {
        const cellsData = await cellsResponse.json();
        if (cellsData.success && cellsData.data) {
          this.cells = cellsData.data;
          // Recalculate occupancy from database
          await this.calculateActualOccupancy();
          return this.cells;
        }
      }
      
      throw new Error('Failed to refresh cell data');
    } catch (error) {
      console.error('Error refreshing cell data:', error);
      throw error;
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
   * Generate cell option HTML for dropdown
   * @param {string} gender - Inmate gender
   * @param {number} currentCellId - Currently selected cell ID
   * @returns {string} HTML for cell options
   */
  generateCellOptions(gender, currentCellId = null) {
    const availableCells = this.getAvailableCells(gender);
    
    return availableCells.map(cell => {
      const count = this.getCellCount(cell.id);
      const percentage = this.getOccupancyPercentage(cell.id);
      const isSelected = currentCellId === cell.id;
      const isFull = this.isCellFull(cell.id);
      
      return `
        <option value="${cell.id}" ${isSelected ? 'selected' : ''} ${isFull ? 'disabled' : ''}>
          ${cell.name} (${count}/${cell.capacity} - ${percentage}%) - ${cell.type}${isFull ? ' - FULL' : ''}
        </option>
      `;
    }).join('');
  }

  /**
   * Update cell display in UI
   * @param {number} cellId - Cell ID
   * @param {number} newCount - New count
   */
  updateCellDisplay(cellId, newCount) {
    // Update cell count displays
    const countElements = document.querySelectorAll(`[data-cell-count="${cellId}"]`);
    countElements.forEach(el => {
      el.textContent = newCount;
    });

    // Update occupancy bars
    const barElements = document.querySelectorAll(`[data-cell-bar="${cellId}"]`);
    const cell = this.getCellById(cellId);
    if (cell) {
      const percentage = Math.round((newCount / cell.capacity) * 100);
      
      barElements.forEach(el => {
        el.style.width = `${percentage}%`;
        el.className = el.className.replace(/bg-(red|yellow|green)-500/, 
          percentage >= 90 ? 'bg-red-500' : percentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
        );
      });
    }

    // Update statistics
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
    try {
      console.log('Force refreshing cell counter manager...');
      await this.refreshCellData();
      await this.calculateActualOccupancy();
      console.log('Cell counter manager refreshed successfully');
      return true;
    } catch (error) {
      console.error('Failed to force refresh:', error);
      return false;
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
