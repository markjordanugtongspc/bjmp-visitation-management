/**
 * Cell Count Manager Module
 * Advanced functions for automatic cell count increment/decrement
 * Handles real-time cell occupancy calculations and updates
 */

class CellCountManager {
    constructor() {
        this.cells = new Map(); // Store cell data with id as key
        this.inmates = new Map(); // Store inmate data with id as key
        this.listeners = new Set(); // Event listeners for count changes
    }

    /**
     * Initialize the cell count manager with current data
     * @param {Array} cells - Array of cell objects
     * @param {Array} inmates - Array of inmate objects
     */
    initialize(cells = [], inmates = []) {
        // Clear existing data
        this.cells.clear();
        this.inmates.clear();

        // Load cells data - keep original backend current_count
        cells.forEach(cell => {
            this.cells.set(cell.id, {
                ...cell,
                displayCount: cell.currentCount // This is what we'll modify for display
            });
        });

        // Load inmates data
        inmates.forEach(inmate => {
            this.inmates.set(inmate.id, inmate);
        });
        
        console.log('CellCountManager initialized:', {
            cellsCount: this.cells.size,
            inmatesCount: this.inmates.size,
            maleCells: cells.filter(c => c.type === 'Male').length,
            femaleCells: cells.filter(c => c.type === 'Female').length,
            maleInmates: inmates.filter(i => i.gender === 'Male').length,
            femaleInmates: inmates.filter(i => i.gender === 'Female').length
        });
    }

    /**
     * Add a new inmate to the system
     * @param {Object} inmate - Inmate object
     */
    addInmate(inmate) {
        console.log('Adding inmate:', {
            id: inmate.id,
            name: `${inmate.firstName} ${inmate.lastName}`,
            gender: inmate.gender,
            status: inmate.status,
            cell_id: inmate.cell_id
        });
        
        this.inmates.set(inmate.id, inmate);
        
        // If inmate is Active and assigned to a cell, increment the display count
        if (inmate.status === 'Active' && inmate.cell_id && this.cells.has(inmate.cell_id)) {
            const cell = this.cells.get(inmate.cell_id);
            console.log('Cell found for inmate:', {
                cellId: inmate.cell_id,
                cellName: cell.name,
                cellType: cell.type,
                currentDisplayCount: cell.displayCount,
                capacity: cell.capacity
            });
            
            if (cell.displayCount < cell.capacity) {
                cell.displayCount += 1;
                
                console.log('Incremented cell display count:', {
                    cellId: inmate.cell_id,
                    newDisplayCount: cell.displayCount,
                    inmateGender: inmate.gender,
                    cellType: cell.type
                });
                
                this.notifyListeners('cell_count_increased', {
                    cellId: inmate.cell_id,
                    cell: cell,
                    change: 1,
                    reason: 'inmate_added',
                    inmate: inmate,
                    newCount: cell.displayCount
                });
            } else {
                console.warn('Cannot add inmate to cell - at capacity:', {
                    cellId: inmate.cell_id,
                    cellName: cell.name,
                    displayCount: cell.displayCount,
                    capacity: cell.capacity
                });
            }
        } else {
            console.log('Inmate not added to cell:', {
                isActive: inmate.status === 'Active',
                hasCellId: !!inmate.cell_id,
                cellExists: inmate.cell_id ? this.cells.has(inmate.cell_id) : false
            });
        }
        
        this.notifyListeners('inmate_added', inmate);
    }

    /**
     * Update an existing inmate
     * @param {Object} inmate - Updated inmate object
     * @param {Object} oldInmate - Previous inmate data (optional)
     */
    updateInmate(inmate, oldInmate = null) {
        const previousInmate = oldInmate || this.inmates.get(inmate.id);
        
        console.log('Updating inmate:', {
            id: inmate.id,
            name: `${inmate.firstName} ${inmate.lastName}`,
            gender: inmate.gender,
            status: inmate.status,
            cell_id: inmate.cell_id,
            previousCellId: previousInmate?.cell_id,
            previousStatus: previousInmate?.status
        });
        
        if (previousInmate) {
            // Handle cell change
            if (previousInmate.cell_id !== inmate.cell_id) {
                console.log('Cell assignment changed:', {
                    oldCellId: previousInmate.cell_id,
                    newCellId: inmate.cell_id,
                    inmateGender: inmate.gender
                });
                this.handleCellChange(previousInmate, inmate);
            }
            
            // Handle status change
            if (previousInmate.status !== inmate.status) {
                console.log('Status changed:', {
                    oldStatus: previousInmate.status,
                    newStatus: inmate.status,
                    inmateGender: inmate.gender
                });
                this.handleStatusChange(previousInmate, inmate);
            }
        }
        
        this.inmates.set(inmate.id, inmate);
        this.notifyListeners('inmate_updated', inmate, previousInmate);
    }

    /**
     * Remove an inmate from the system
     * @param {number} inmateId - ID of inmate to remove
     */
    removeInmate(inmateId) {
        const inmate = this.inmates.get(inmateId);
        if (inmate) {
            // If inmate is Active and assigned to a cell, decrement the display count
            if (inmate.status === 'Active' && inmate.cell_id && this.cells.has(inmate.cell_id)) {
                const cell = this.cells.get(inmate.cell_id);
                cell.displayCount = Math.max(0, cell.displayCount - 1);
                
                this.notifyListeners('cell_count_decreased', {
                    cellId: inmate.cell_id,
                    cell: cell,
                    change: -1,
                    reason: 'inmate_removed',
                    inmate: inmate,
                    newCount: cell.displayCount
                });
            }
            
            this.inmates.delete(inmateId);
            this.notifyListeners('inmate_removed', inmate);
        }
    }

    /**
     * Handle cell assignment change for an inmate
     * @param {Object} oldInmate - Previous inmate data
     * @param {Object} newInmate - Updated inmate data
     */
    handleCellChange(oldInmate, newInmate) {
        const oldCellId = oldInmate.cell_id;
        const newCellId = newInmate.cell_id;
        
        console.log('Handling cell change:', {
            inmateId: newInmate.id,
            inmateGender: newInmate.gender,
            oldCellId: oldCellId,
            newCellId: newCellId,
            oldStatus: oldInmate.status,
            newStatus: newInmate.status
        });
        
        // Decrease display count in old cell
        if (oldCellId && this.cells.has(oldCellId)) {
            const oldCell = this.cells.get(oldCellId);
            console.log('Processing old cell:', {
                cellId: oldCellId,
                cellName: oldCell.name,
                cellType: oldCell.type,
                currentDisplayCount: oldCell.displayCount,
                wasActive: oldInmate.status === 'Active'
            });
            
            if (oldInmate.status === 'Active') {
                oldCell.displayCount = Math.max(0, oldCell.displayCount - 1);
                
                console.log('Decreased old cell count:', {
                    cellId: oldCellId,
                    cellName: oldCell.name,
                    newDisplayCount: oldCell.displayCount,
                    inmateGender: newInmate.gender
                });
                
                this.notifyListeners('cell_count_decreased', {
                    cellId: oldCellId,
                    cell: oldCell,
                    change: -1,
                    reason: 'inmate_moved',
                    inmate: newInmate,
                    newCount: oldCell.displayCount
                });
            }
        }
        
        // Increase display count in new cell
        if (newCellId && this.cells.has(newCellId)) {
            const newCell = this.cells.get(newCellId);
            console.log('Processing new cell:', {
                cellId: newCellId,
                cellName: newCell.name,
                cellType: newCell.type,
                currentDisplayCount: newCell.displayCount,
                capacity: newCell.capacity,
                isActive: newInmate.status === 'Active'
            });
            
            if (newInmate.status === 'Active') {
                // Check capacity before incrementing
                if (newCell.displayCount < newCell.capacity) {
                    newCell.displayCount += 1;
                    
                    console.log('Increased new cell count:', {
                        cellId: newCellId,
                        cellName: newCell.name,
                        newDisplayCount: newCell.displayCount,
                        inmateGender: newInmate.gender
                    });
                    
                    this.notifyListeners('cell_count_increased', {
                        cellId: newCellId,
                        cell: newCell,
                        change: 1,
                        reason: 'inmate_moved',
                        inmate: newInmate,
                        newCount: newCell.displayCount
                    });
                } else {
                    console.warn(`Cell ${newCell.name} is at capacity (${newCell.capacity})`);
                    this.notifyListeners('cell_at_capacity', {
                        cellId: newCellId,
                        cell: newCell,
                        inmate: newInmate
                    });
                }
            }
        }
    }

    /**
     * Handle status change for an inmate
     * @param {Object} oldInmate - Previous inmate data
     * @param {Object} newInmate - Updated inmate data
     */
    handleStatusChange(oldInmate, newInmate) {
        const cellId = newInmate.cell_id;
        
        if (!cellId || !this.cells.has(cellId)) return;
        
        const cell = this.cells.get(cellId);
        const wasActive = oldInmate.status === 'Active';
        const isActive = newInmate.status === 'Active';
        
        if (wasActive && !isActive) {
            // Status changed from Active to non-Active
            cell.displayCount = Math.max(0, cell.displayCount - 1);
            
            this.notifyListeners('cell_count_decreased', {
                cellId: cellId,
                cell: cell,
                change: -1,
                reason: 'status_change',
                oldStatus: oldInmate.status,
                newStatus: newInmate.status,
                inmate: newInmate,
                newCount: cell.displayCount
            });
        } else if (!wasActive && isActive) {
            // Status changed from non-Active to Active
            if (cell.displayCount < cell.capacity) {
                cell.displayCount += 1;
                
                this.notifyListeners('cell_count_increased', {
                    cellId: cellId,
                    cell: cell,
                    change: 1,
                    reason: 'status_change',
                    oldStatus: oldInmate.status,
                    newStatus: newInmate.status,
                    inmate: newInmate,
                    newCount: cell.displayCount
                });
            } else {
                console.warn(`Cannot activate inmate in cell ${cell.name} - cell is at capacity`);
                this.notifyListeners('cell_at_capacity', {
                    cellId: cellId,
                    cell: cell,
                    inmate: newInmate,
                    reason: 'status_change'
                });
            }
        }
    }


    /**
     * Get current cell data with display counts
     * @param {number} cellId - Optional cell ID to get specific cell
     * @returns {Object|Array} Cell data or array of all cells
     */
    getCellData(cellId = null) {
        if (cellId) {
            return this.cells.get(cellId) || null;
        }
        
        return Array.from(this.cells.values());
    }

    /**
     * Get available cells for a specific gender
     * @param {string} gender - Male or Female
     * @returns {Array} Array of available cells for the gender
     */
    getAvailableCellsForGender(gender) {
        const availableCells = Array.from(this.cells.values()).filter(cell => {
            // Check if cell type matches gender
            if (cell.type !== gender) {
                return false;
            }
            
            // Check if cell has available space
            if (cell.displayCount >= cell.capacity) {
                return false;
            }
            
            return true;
        });
        
        console.log(`Available ${gender} cells:`, availableCells.map(cell => ({
            id: cell.id,
            name: cell.name,
            type: cell.type,
            displayCount: cell.displayCount,
            capacity: cell.capacity
        })));
        
        return availableCells;
    }

    /**
     * Refresh cell data from backend
     * @param {Array} cells - Updated cell data from backend
     */
    refreshCellData(cells) {
        console.log('Refreshing cell data from backend:', cells.length, 'cells');
        
        cells.forEach(backendCell => {
            const existingCell = this.cells.get(backendCell.id);
            if (existingCell) {
                // Update backend data but preserve display count for immediate UI feedback
                existingCell.currentCount = backendCell.currentCount;
                existingCell.capacity = backendCell.capacity;
                existingCell.name = backendCell.name;
                existingCell.type = backendCell.type;
                
                console.log(`Refreshed cell ${backendCell.name}:`, {
                    id: backendCell.id,
                    type: backendCell.type,
                    currentCount: backendCell.currentCount,
                    displayCount: existingCell.displayCount
                });
            }
        });
        
        this.notifyListeners('cells_refreshed', cells);
    }

    /**
     * Get cell occupancy statistics
     * @returns {Object} Statistics object
     */
    getOccupancyStatistics() {
        let totalCapacity = 0;
        let totalOccupied = 0;
        let cellsAtCapacity = 0;
        let cellsWithSpace = 0;
        
        this.cells.forEach(cell => {
            totalCapacity += cell.capacity;
            totalOccupied += cell.displayCount;
            
            if (cell.displayCount >= cell.capacity) {
                cellsAtCapacity++;
            } else {
                cellsWithSpace++;
            }
        });
        
        return {
            totalCapacity,
            totalOccupied,
            totalAvailable: totalCapacity - totalOccupied,
            occupancyPercentage: totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0,
            cellsAtCapacity,
            cellsWithSpace,
            totalCells: this.cells.size
        };
    }

    /**
     * Add event listener for cell count changes
     * @param {Function} listener - Callback function
     */
    addListener(listener) {
        this.listeners.add(listener);
    }

    /**
     * Remove event listener
     * @param {Function} listener - Callback function to remove
     */
    removeListener(listener) {
        this.listeners.delete(listener);
    }

    /**
     * Notify all listeners of an event
     * @param {string} eventType - Type of event
     * @param {...any} args - Event arguments
     */
    notifyListeners(eventType, ...args) {
        this.listeners.forEach(listener => {
            try {
                listener(eventType, ...args);
            } catch (error) {
                console.error('Error in cell count listener:', error);
            }
        });
    }

    /**
     * Get detailed cell information including occupancy
     * @param {number} cellId - Cell ID
     * @returns {Object|null} Detailed cell information
     */
    getDetailedCellInfo(cellId) {
        const cell = this.cells.get(cellId);
        if (!cell) return null;
        
        const inmatesInCell = Array.from(this.inmates.values())
            .filter(inmate => inmate.cell_id === cellId);
        
        const activeInmates = inmatesInCell.filter(inmate => inmate.status === 'Active');
        
        return {
            ...cell,
            inmatesInCell: inmatesInCell.length,
            activeInmates: activeInmates.length,
            occupancyPercentage: cell.capacity > 0 ? (cell.displayCount / cell.capacity) * 100 : 0,
            availableSpace: Math.max(0, cell.capacity - cell.displayCount),
            isAtCapacity: cell.displayCount >= cell.capacity,
            hasAvailableSpace: cell.displayCount < cell.capacity
        };
    }

    /**
     * Validate cell assignment for an inmate
     * @param {Object} inmate - Inmate object
     * @param {number} cellId - Target cell ID
     * @returns {Object} Validation result
     */
    validateCellAssignment(inmate, cellId) {
        const cell = this.cells.get(cellId);
        if (!cell) {
            return {
                valid: false,
                reason: 'Cell not found'
            };
        }
        
        // Check gender compatibility
        if (inmate.gender && cell.type && inmate.gender !== cell.type) {
            return {
                valid: false,
                reason: `Gender mismatch: Inmate is ${inmate.gender}, cell is for ${cell.type}`
            };
        }
        
        // Check capacity (only for Active inmates)
        if (inmate.status === 'Active' && cell.displayCount >= cell.capacity) {
            return {
                valid: false,
                reason: `Cell is at capacity (${cell.displayCount}/${cell.capacity})`
            };
        }
        
        return {
            valid: true,
            reason: 'Assignment is valid'
        };
    }
}

// Export the class for use in other modules
export default CellCountManager;
