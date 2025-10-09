// Inmate Cells Management Component
// - Cell CRUD operations with SweetAlert2 modals
// - Responsive design with Tailwind CSS
// - Advanced search, sort, and filter functionality
// - Client-side storage and draft saving

// ========================================
// IMPORTS
// ========================================

import { SearchSortFilterManager } from './search-sort-filter.js';

// ========================================
// CLIENT-SIDE STORAGE AND DRAFT FUNCTIONS
// ========================================

const CELLS_STORAGE_KEY = 'bjmp.cells.data';
const CELLS_DRAFT_KEY = 'bjmp.cells.formDraft';

// Global search manager instance
let cellsSearchManager = null;

/**
 * Safe JSON parsing with fallback
 */
function safeParse(jsonText) {
  try {
    return JSON.parse(jsonText) || {};
  } catch {
    return {};
  }
}

/**
 * Save cells data to localStorage
 */
function saveCellsData(cells) {
  if (!Array.isArray(cells)) return;
  const payload = {
    cells: cells,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(CELLS_STORAGE_KEY, JSON.stringify(payload));
}

/**
 * Load cells data from localStorage
 */
function loadCellsData() {
  const raw = localStorage.getItem(CELLS_STORAGE_KEY);
  const data = safeParse(raw);
  return data.cells || [];
}

/**
 * Save cell form draft to localStorage
 */
function saveCellDraft(draft) {
  if (!draft || typeof draft !== 'object') return;
  const payload = {
    ...draft,
    _savedAt: new Date().toISOString(),
  };
  localStorage.setItem(CELLS_DRAFT_KEY, JSON.stringify(payload));
}

/**
 * Load cell form draft from localStorage
 */
function loadCellDraft() {
  const raw = localStorage.getItem(CELLS_DRAFT_KEY);
  return safeParse(raw);
}

/**
 * Clear cell form draft from localStorage
 */
function clearCellDraft() {
  localStorage.removeItem(CELLS_DRAFT_KEY);
}

/**
 * Map modal value object to draft shape
 */
function toDraftFromCellModalValue(value) {
  return { ...value };
}

/**
 * Create sample cells data for testing
 */
function createSampleCellsData() {
  return [
    {
      id: 1,
      name: 'Cell 1',
      type: 'Male',
      location: 'Block A',
      status: 'Active',
      capacity: 20,
      currentCount: 15,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      name: 'Cell 2',
      type: 'Male',
      location: 'Block A',
      status: 'Active',
      capacity: 20,
      currentCount: 18,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 3,
      name: 'Cell 3',
      type: 'Female',
      location: 'Block B',
      status: 'Active',
      capacity: 15,
      currentCount: 12,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 4,
      name: 'Cell 4',
      type: 'Female',
      location: 'Block B',
      status: 'Maintenance',
      capacity: 15,
      currentCount: 0,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 5,
      name: 'Cell 5',
      type: 'Male',
      location: 'Block C',
      status: 'Inactive',
      capacity: 25,
      currentCount: 0,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    }
  ];
}

// - Cell capacity and occupancy tracking

/**
 * Initialize the Inmate Cells Management System
 * This function sets up event listeners and initializes the cells management interface
 */
export function initializeInmateCells() {
  // Attach event listener to "View All Cells" button using ID selector
  const viewAllCellsBtn = document.getElementById('view-all-cells-btn');
  if (viewAllCellsBtn) {
    viewAllCellsBtn.addEventListener('click', openCellsManagementModal);
    console.log('Inmate cells management initialized successfully');
  } else {
    console.warn('View All Cells button not found. Make sure the button has id="view-all-cells-btn"');
  }
}

/**
 * Open the main cells management modal
 * This is the primary modal for viewing, adding, editing, and managing cells
 */
async function openCellsManagementModal() {
  const isMobile = () => window.innerWidth < 640; // sm breakpoint in Tailwind
  const width = isMobile() ? '95vw' : '80rem'; // Wider modal for better content display
  // Scope by current page gender
  const genderRoot = document.querySelector('[data-current-gender]');
  const genderValue = (genderRoot?.getAttribute('data-current-gender') || '').toLowerCase();
  const pageGender = genderValue === 'female' ? 'Female' : 'Male';

  // Load cells data from API
  let cells = [];
  try {
    const response = await fetchCells('', pageGender, '');
    if (response.success) {
      cells = response.data;
      // Cache the data for offline use
      saveCellsData(cells);
    } else {
      console.error('Failed to load cells:', response.message);
      // Fallback to cached data if available
      cells = loadCellsData();
    }
  } catch (error) {
    console.error('Error loading cells:', error);
    // Fallback to cached data if available
    cells = loadCellsData();
  }

  const modalHTML = `
    <div class="space-y-4 sm:space-y-6">
      <!-- Mobile Close Button (only visible on mobile) -->
      <div class="sm:hidden flex justify-end mb-2">
        <button id="mobile-close-btn" class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Header Section -->
      <div class="flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div class="flex-1">
            <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 text-center sm:text-left">Cell Management</h2>
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 text-center sm:text-left">Manage cell assignments, capacity, and occupancy</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <button id="add-cell-btn" class="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14m-7-7h14"/>
              </svg>
              <span class="hidden xs:inline">Add New Cell</span>
              <span class="xs:hidden">Add Cell</span>
            </button>
            <button id="refresh-cells-btn" class="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
              <span class="hidden xs:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <div class="bg-white dark:bg-gray-800 p-2 sm:p-3 lg:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 rounded-lg bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/20 flex items-center justify-center flex-shrink-0">
              <svg class="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M29 4C29.2652 4 29.5196 3.89464 29.7071 3.70711C29.8946 3.51957 30 3.26522 30 3C30 2.73478 29.8946 2.48043 29.7071 2.29289C29.5196 2.10536 29.2652 2 29 2H3C2.73478 2 2.48043 2.10536 2.29289 2.29289C2.10536 2.48043 2 2.73478 2 3C2 3.26522 2.10536 3.51957 2.29289 3.70711C2.48043 3.89464 2.73478 4 3 4H5V28H3C2.73478 28 2.48043 28.1054 2.29289 28.2929C2.10536 28.4804 2 28.7348 2 29C2 29.2652 2.10536 29.5196 2.29289 29.7071C2.48043 29.8946 2.73478 30 3 30H29C29.2652 30 29.5196 29.8946 29.7071 29.7071C29.8946 29.5196 30 29.2652 30 29C30 28.7348 29.8946 28.4804 29.7071 28.2929C29.5196 28.1054 29.2652 28 29 28H27V4H29ZM15 20V14H21V20H15ZM21 12H19V4H21V12ZM17 4V12H15V4H17ZM7 4H9V28H7V4ZM11 4H13V28H11V4ZM15 28V22H17V28H15ZM19 28V22H21V28H19ZM25 28H23V4H25V28Z" fill="currentColor"/>
                <path d="M18 16H17C16.7348 16 16.4804 16.1054 16.2929 16.2929C16.1054 16.4804 16 16.7348 16 17C16 17.2652 16.1054 17.5196 16.2929 17.7071C16.4804 17.8946 16.7348 18 17 18H18C18.2652 18 18.5196 17.8946 18.7071 17.7071C18.8946 17.5196 19 17.2652 19 17C19 16.7348 18.8946 16.4804 18.7071 16.2929C18.5196 16.1054 18.2652 16 18 16Z" fill="currentColor"/>
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Total Cells</p>
              <p class="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100" id="total-cells">${cells.length}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 p-2 sm:p-3 lg:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 rounded-lg bg-green-500/10 text-green-500 ring-2 ring-green-500/20 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="currentColor">
 	              <path fill="#00ff4b" fill-rule="evenodd" d="M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18m-.232-5.36l5-6l-1.536-1.28l-4.3 5.159l-2.225-2.226l-1.414 1.414l3 3l.774.774z" clip-rule="evenodd" stroke-width="0.3" stroke="#00ff4b" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Active Cells</p>
              <p class="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100" id="active-cells">${cells.filter(c => c.status === 'Active').length}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 p-2 sm:p-3 lg:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 rounded-lg bg-yellow-500/10 text-yellow-500 ring-2 ring-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-yellow-600 dark:text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Total Capacity</p>
              <p class="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100" id="total-capacity">${cells.reduce((sum, cell) => sum + cell.capacity, 0)}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 p-2 sm:p-3 lg:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 rounded-lg bg-red-500/10 text-red-500 ring-2 ring-red-500/20 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-red-600 dark:text-red-400" viewBox="0 0 90 84" fill="currentColor">
                <path d="M88 80H77V42.7L77.5 43C79.8 44.5 82.7 44.7 85.1 43.4C87.5 42.1 89 39.6 89 36.9C89 34.4 87.8 32.1 85.7 30.7L46.1 4.3C45.4 3.9 44.6 3.9 43.9 4.3L29 14.3V8C29 3.6 25.4 0 21 0C16.6 0 13 3.6 13 8V24.9L4.3 30.7C2.2 32.1 1 34.4 1 36.9C1 39.6 2.5 42.1 4.9 43.4C6 44 7.2 44.3 8.4 44.3C9.8 44.3 11.3 43.9 12.5 43.1L13 42.8V80H2C0.9 80 0 80.9 0 82C0 83.1 0.9 84 2 84H88C89.1 84 90 83.1 90 82C90 80.9 89.1 80 88 80ZM21 4C23.2 4 25 5.8 25 8V16.9L17 22.2V8C17 5.8 18.8 4 21 4ZM10.3 39.7C9.2 40.4 7.9 40.5 6.8 39.9C5.7 39.3 5 38.2 5 36.9C5 35.8 5.6 34.7 6.5 34.1L16.1 27.7L28.1 19.7L45 8.4L83.5 34.1C84.5 34.7 85 35.8 85 36.9C85 38.2 84.3 39.3 83.2 39.9C82.1 40.5 80.8 40.4 79.7 39.7L76.1 37.3L46.1 17.3C45.4 16.9 44.6 16.9 43.9 17.3L13.9 37.3L10.3 39.7ZM17 40.1L45 21.4L73 40.1V80H17V40.1ZM61.4 43.4L31.4 73.4C31 73.8 30.5 74 30 74C29.5 74 29 73.8 28.6 73.4C27.8 72.6 27.8 71.4 28.6 70.6L58.6 40.6C59.4 39.8 60.6 39.8 61.4 40.6C62.2 41.4 62.2 42.6 61.4 43.4ZM35 54C38.9 54 42 50.9 42 47C42 43.1 38.9 40 35 40C31.1 40 28 43.1 28 47C28 50.9 31.1 54 35 54ZM35 44C36.7 44 38 45.3 38 47C38 48.7 36.7 50 35 50C33.3 50 32 48.7 32 47C32 45.3 33.3 44 35 44ZM55 60C51.1 60 48 63.1 48 67C48 70.9 51.1 74 55 74C58.9 74 62 70.9 62 67C62 63.1 58.9 60 55 60ZM55 70C53.3 70 52 68.7 52 67C52 65.3 53.3 64 55 64C56.7 64 58 65.3 58 67C58 68.7 56.7 70 55 70Z" fill="currentColor"/>
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Current Occupancy</p>
              <p class="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100" id="current-occupancy">${cells.reduce((sum, cell) => sum + (cell.currentCount || 0), 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Search, Sort, and Filter Component -->
      <div id="cells-search-sort-filter"></div>

      <!-- Desktop Table View -->
      <div class="hidden sm:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cell Info</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Capacity & Occupancy</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type & Location</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th class="px-5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody id="cells-table-body" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              ${generateCellsTableRows(cells)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Cards View -->
      <div class="sm:hidden space-y-4" id="cells-cards-mobile">
        ${generateCellsMobileCards(cells)}
      </div>

      <!-- Pagination -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div id="pagination-info" class="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
          Showing <span class="font-medium">1</span> to <span class="font-medium">${cells.length}</span> of <span class="font-medium">${cells.length}</span> results
        </div>
        <div class="flex items-center justify-center gap-1 sm:gap-2">
          <button class="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <span class="hidden sm:inline">Previous</span>
            <span class="sm:hidden">Prev</span>
          </button>
          <button class="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
            1
          </button>
          <button class="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
            <span class="hidden sm:inline">Next</span>
            <span class="sm:hidden">Next</span>
          </button>
        </div>
      </div>
    </div>
  `;

  return window.Swal.fire({
    title: `<span class="hidden">Cell Management</span>`,
    html: modalHTML,
    width: width,
    padding: isMobile() ? '0.75rem' : '1.5rem',
    showCancelButton: false,
    showConfirmButton: false,
    background: '#111827',
    color: '#F9FAFB',
    customClass: {
      container: 'swal-responsive-container',
      popup: 'swal-responsive-popup',
      content: 'swal-responsive-content',
    },
    didOpen: () => {
      // Add custom styles for better mobile experience
      const style = document.createElement('style');
      style.textContent = `
        .swal-responsive-container {
          padding: 0.5rem !important;
        }
        .swal-responsive-popup {
          margin: 0.5rem !important;
          max-height: calc(100vh - 1rem) !important;
          overflow-y: auto !important;
        }
        .swal-responsive-content {
          max-height: calc(100vh - 8rem) !important;
          overflow-y: auto !important;
        }
        @media (max-width: 640px) {
          .swal-responsive-popup {
            width: 95vw !important;
            max-width: 95vw !important;
            margin: 0.25rem !important;
          }
          .swal-responsive-content {
            max-height: calc(100vh - 6rem) !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      // Attach event listeners to modal elements
      attachCellsModalEventListeners(cells);
    },
    didClose: () => {
      // Reload the entire page when modal is closed
      console.log('Cell management modal closed, reloading page...');
      window.location.reload();
    }
  });
}

/**
 * Generate mobile cards for cells data
 * TODO: Replace with dynamic data from API
 */
function generateCellsMobileCards(cells) {
  if (!cells || cells.length === 0) {
    return `
      <div class="text-center py-8">
        <div class="flex flex-col items-center justify-center space-y-4">
          <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
              <path d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"/>
            </svg>
          </div>
          <div class="text-center">
            <h3 class="text-base font-medium text-gray-900 dark:text-gray-100">No Cells Found</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        </div>
      </div>
    `;
  }

  return cells.map(cell => {
    const occupancyRate = ((cell.currentCount || 0) / cell.capacity) * 100;
    const isFull = occupancyRate >= 90;
    const isNearFull = occupancyRate >= 75;
    
    const statusClass = getCellStatusClass(cell.status);
    const occupancyClass = isFull ? 'text-red-600' : isNearFull ? 'text-yellow-600' : 'text-green-600';
    
    return `
      <div class="p-3 sm:p-4 space-y-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" data-card-id="${cell.id}">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/20 flex items-center justify-center flex-shrink-0">
              <svg class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M29 4C29.2652 4 29.5196 3.89464 29.7071 3.70711C29.8946 3.51957 30 3.26522 30 3C30 2.73478 29.8946 2.48043 29.7071 2.29289C29.5196 2.10536 29.2652 2 29 2H3C2.73478 2 2.48043 2.10536 2.29289 2.29289C2.10536 2.48043 2 2.73478 2 3C2 3.26522 2.10536 3.51957 2.29289 3.70711C2.48043 3.89464 2.73478 4 3 4H5V28H3C2.73478 28 2.48043 28.1054 2.29289 28.2929C2.10536 28.4804 2 28.7348 2 29C2 29.2652 2.10536 29.5196 2.29289 29.7071C2.48043 29.8946 2.73478 30 3 30H29C29.2652 30 29.5196 29.8946 29.7071 29.7071C29.8946 29.5196 30 29.2652 30 29C30 28.7348 29.8946 28.4804 29.7071 28.2929C29.5196 28.1054 29.2652 28 29 28H27V4H29ZM15 20V14H21V20H15ZM21 12H19V4H21V12ZM17 4V12H15V4H17ZM7 4H9V28H7V4ZM11 4H13V28H11V4ZM15 28V22H17V28H15ZM19 28V22H21V28H19ZM25 28H23V4H25V28Z" fill="currentColor"/>
                <path d="M18 16H17C16.7348 16 16.4804 16.1054 16.2929 16.2929C16.1054 16.4804 16 16.7348 16 17C16 17.2652 16.1054 17.5196 16.2929 17.7071C16.4804 17.8946 16.7348 18 17 18H18C18.2652 18 18.5196 17.8946 18.7071 17.7071C18.8946 17.5196 19 17.2652 19 17C19 16.7348 18.8946 16.4804 18.7071 16.2929C18.5196 16.1054 18.2652 16 18 16Z" fill="currentColor"/>
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">${cell.name}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">ID: ${cell.id.toString().padStart(3, '0')}</div>
            </div>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <button type="button" data-edit-cell="${cell.id}" class="bg-blue-50 dark:bg-blue-900/20 text-blue-500 p-1.5 sm:p-2 rounded-md cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" aria-label="Edit cell">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                <path d="M16 5l3 3" />
              </svg>
            </button>
            <button type="button" data-delete-cell="${cell.id}" class="bg-red-50 dark:bg-red-900/20 text-red-500 p-1.5 sm:p-2 rounded-md cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" aria-label="Delete cell">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Mobile Card Content -->
        <div class="space-y-3">
          <!-- Occupancy Section -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Occupancy</span>
              <span class="text-sm font-medium ${occupancyClass}">${cell.currentCount || 0}/${cell.capacity}</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div class="h-2 rounded-full transition-all duration-300 ${
                isFull ? 'bg-red-500' : isNearFull ? 'bg-yellow-500' : 'bg-green-500'
              }" style="width: ${occupancyRate}%"></div>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              ${Math.round(occupancyRate)}% occupied
            </div>
          </div>
          
          <!-- Cell Details Section -->
          <div class="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Type</div>
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">${cell.type}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Location</div>
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">${cell.location}</div>
            </div>
          </div>
          
          <!-- Status Section -->
          <div class="flex justify-between items-center">
            <div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Status</div>
            </div>
            <span class="inline-flex items-center rounded-full px-2 sm:px-3 py-1 text-xs font-medium ${statusClass}">
              ${cell.status}
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Generate table rows for cells data
 * TODO: Replace with dynamic data from API
 */
function generateCellsTableRows(cells) {
  // Handle empty results
  if (!cells || cells.length === 0) {
    return `
      <tr>
        <td colspan="5" class="px-4 py-12 text-center">
          <div class="flex flex-col items-center justify-center space-y-4">
            <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                <path d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"/>
              </svg>
            </div>
            <div class="text-center">
              <h3 class="text-base font-medium text-gray-900 dark:text-gray-100">No Cells Found</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filter criteria.</p>
            </div>
          </div>
        </td>
      </tr>
    `;
  }

  return cells.map(cell => {
    const occupancyRate = ((cell.currentCount || 0) / cell.capacity) * 100;
    const isFull = occupancyRate >= 90;
    const isNearFull = occupancyRate >= 75;
    
    const statusClass = getCellStatusClass(cell.status);
    const occupancyClass = isFull ? 'text-red-600' : isNearFull ? 'text-yellow-600' : 'text-green-600';
    
    return `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <td class="px-4 py-3 whitespace-nowrap">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/20 flex items-center justify-center">
              <svg class="h-5 w-5" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M29 4C29.2652 4 29.5196 3.89464 29.7071 3.70711C29.8946 3.51957 30 3.26522 30 3C30 2.73478 29.8946 2.48043 29.7071 2.29289C29.5196 2.10536 29.2652 2 29 2H3C2.73478 2 2.48043 2.10536 2.29289 2.29289C2.10536 2.48043 2 2.73478 2 3C2 3.26522 2.10536 3.51957 2.29289 3.70711C2.48043 3.89464 2.73478 4 3 4H5V28H3C2.73478 28 2.48043 28.1054 2.29289 28.2929C2.10536 28.4804 2 28.7348 2 29C2 29.2652 2.10536 29.5196 2.29289 29.7071C2.48043 29.8946 2.73478 30 3 30H29C29.2652 30 29.5196 29.8946 29.7071 29.7071C29.8946 29.5196 30 29.2652 30 29C30 28.7348 29.8946 28.4804 29.7071 28.2929C29.5196 28.1054 29.2652 28 29 28H27V4H29ZM15 20V14H21V20H15ZM21 12H19V4H21V12ZM17 4V12H15V4H17ZM7 4H9V28H7V4ZM11 4H13V28H11V4ZM15 28V22H17V28H15ZM19 28V22H21V28H19ZM25 28H23V4H25V28Z" fill="currentColor"/>
                <path d="M18 16H17C16.7348 16 16.4804 16.1054 16.2929 16.2929C16.1054 16.4804 16 16.7348 16 17C16 17.2652 16.1054 17.5196 16.2929 17.7071C16.4804 17.8946 16.7348 18 17 18H18C18.2652 18 18.5196 17.8946 18.7071 17.7071C18.8946 17.5196 19 17.2652 19 17C19 16.7348 18.8946 16.4804 18.7071 16.2929C18.5196 16.1054 18.2652 16 18 16Z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-100">${cell.name}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">ID: ${cell.id.toString().padStart(3, '0')}</div>
            </div>
          </div>
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center gap-2">
            <div class="flex-1">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Occupancy</span>
                <span class="font-medium ${occupancyClass}">${cell.currentCount || 0}/${cell.capacity}</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div class="h-2 rounded-full transition-all duration-300 ${
                  isFull ? 'bg-red-500' : isNearFull ? 'bg-yellow-500' : 'bg-green-500'
                }" style="width: ${occupancyRate}%"></div>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ${Math.round(occupancyRate)}% occupied
              </div>
            </div>
          </div>
        </td>
        <td class="px-1 py-1 text-left align-middle">
          <div class="text-sm text-left">
            <div class="font-medium text-gray-900 dark:text-gray-100 text-left pl-6">${cell.type}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 text-left pl-6">${cell.location}</div>
          </div>
        </td>
        <td class="px-4 py-3 text-left align-middle">
          <span class="inline-flex items-center rounded-full px-2 py-2 text-xs font-medium ${statusClass} text-left pl-3">
            ${cell.status}
          </span>
        </td>
        <td class="px-4 py-3 text-right">
          <div class="flex items-center gap-1 justify-end">
            <button type="button" data-edit-cell="${cell.id}" class="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded-md transition-colors cursor-pointer" aria-label="Edit cell">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                <path d="M16 5l3 3" />
              </svg>
            </button>
            <button type="button" data-delete-cell="${cell.id}" class="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-md transition-colors cursor-pointer" aria-label="Delete cell">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Get CSS classes for cell status badges
 * TODO: Customize status colors as needed
 */
function getCellStatusClass(status) {
  switch (status) {
    case 'Active': return 'bg-green-500/10 text-green-500';
    case 'Maintenance': return 'bg-yellow-500/10 text-yellow-500';
    case 'Inactive': return 'bg-red-500/10 text-red-500';
    default: return 'bg-gray-500/10 text-gray-500';
  }
}

/**
 * Attach event listeners to cells modal elements
 * TODO: Implement actual functionality for each button/input
 */
function attachCellsModalEventListeners(cells) {
  // Mobile Close Button
  const mobileCloseBtn = document.getElementById('mobile-close-btn');
  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', () => {
      window.Swal.close();
      // Page reload will be handled by the didClose callback
    });
  }

  // Add Cell button
  const addCellBtn = document.getElementById('add-cell-btn');
  if (addCellBtn) {
    addCellBtn.addEventListener('click', () => {
      openAddEditCellModal();
    });
  }

  // Refresh button
  const refreshBtn = document.getElementById('refresh-cells-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      try {
        const response = await refreshCellsData();
        if (response.success) {
          showSuccessMessage('Cells data refreshed successfully');
          // Update search manager with new data
          if (cellsSearchManager) {
            cellsSearchManager.setData(response.data);
          }
          console.log('Refreshed cells:', response.data);
        } else {
          showErrorMessage(response.message);
        }
      } catch (error) {
        showErrorMessage('Failed to refresh cells data');
        console.error('Refresh error:', error);
      }
    });
  }

  // Initialize Search, Sort, and Filter Manager
  initializeCellsSearchManager(cells);

  // Initial attachment of edit/delete button listeners
  attachCellActionListeners(cells);
}

/**
 * Initialize the Search, Sort, and Filter Manager for Cells
 */
function initializeCellsSearchManager(cells) {
  // Initialize the search manager
  cellsSearchManager = new SearchSortFilterManager({
    debounceDelay: 300,
    minSearchLength: 2,
    maxResults: 100
  });

  // Configure the search manager
  cellsSearchManager
    .initialize('cells-search-sort-filter', {
      showSearch: true,
      showSort: true,
      showFilters: true,
      searchPlaceholder: 'Search cells...',
      apiEndpoint: '/api/cells' // This will make all search/filter operations use API
    })
    .setOnDataChange((filteredData) => {
      // Update the table and mobile cards with filtered data
      updateCellsDisplay(filteredData);
    })
    .setOnSearchStart((query) => {
      console.log('API Search started:', query);
    })
    .setOnSearchComplete((filteredData) => {
      console.log('API Search completed:', filteredData.length, 'results');
    })
    .setOnFilterChange((key, value) => {
      console.log('API Filter changed:', key, value);
    })
    .setOnSortChange((field, direction) => {
      console.log('API Sort changed:', field, direction);
    });

  // Set initial data (this will load all cells initially)
  cellsSearchManager.setData(cells);

  // Debug information
  console.log('API-based search functionality ready!');
  console.log('All search, filter, and sort operations will use the Laravel API');
  console.log('Initial cells loaded:', cells.length);
  console.log('Try searching for: "Cell 1", "Male", "Block A", "Active", etc.');
}

/**
 * Update the cells display with filtered data
 */
function updateCellsDisplay(filteredCells) {
  console.log('Updating cells display with:', filteredCells);
  
  // Ensure we have an array
  const cells = Array.isArray(filteredCells) ? filteredCells : [];
  
  // Update desktop table
  const tableBody = document.getElementById('cells-table-body');
  if (tableBody) {
    tableBody.innerHTML = generateCellsTableRows(cells);
    // Re-attach event listeners for edit/delete buttons
    attachCellActionListeners(cells);
  }

  // Update mobile cards
  const mobileCards = document.getElementById('cells-cards-mobile');
  if (mobileCards) {
    mobileCards.innerHTML = generateCellsMobileCards(cells);
    // Re-attach event listeners for edit/delete buttons
    attachCellActionListeners(cells);
  }

  // Update statistics
  updateCellsStatistics(cells);

  // Update pagination info
  updatePaginationInfo(cells);
}

/**
 * Update pagination information
 */
function updatePaginationInfo(filteredCells) {
  const paginationInfo = document.getElementById('pagination-info');
  if (paginationInfo) {
    const total = cellsSearchManager ? cellsSearchManager.currentData.length : filteredCells.length;
    const filtered = filteredCells.length;
    
    paginationInfo.innerHTML = `
      Showing <span class="font-medium">1</span> to <span class="font-medium">${filtered}</span> of <span class="font-medium">${total}</span> results
    `;
  }
}

/**
 * Update cells statistics with filtered data
 */
function updateCellsStatistics(cells) {
  const totalCellsEl = document.getElementById('total-cells');
  const activeCellsEl = document.getElementById('active-cells');
  const totalCapacityEl = document.getElementById('total-capacity');
  const currentOccupancyEl = document.getElementById('current-occupancy');

  if (totalCellsEl) totalCellsEl.textContent = cells.length;
  if (activeCellsEl) activeCellsEl.textContent = cells.filter(c => c.status === 'Active').length;
  if (totalCapacityEl) totalCapacityEl.textContent = cells.reduce((sum, cell) => sum + cell.capacity, 0);
  if (currentOccupancyEl) currentOccupancyEl.textContent = cells.reduce((sum, cell) => sum + cell.currentCount, 0);
}

/**
 * Attach event listeners for cell action buttons (edit/delete)
 */
function attachCellActionListeners(cells) {
  // Edit buttons
  document.querySelectorAll('[data-edit-cell]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cellId = e.target.closest('[data-edit-cell]').getAttribute('data-edit-cell');
      const cell = cells.find(c => c.id == cellId);
      if (cell) {
        openAddEditCellModal(cell);
      }
    });
  });

  // Delete buttons
  document.querySelectorAll('[data-delete-cell]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const cellId = e.target.closest('[data-delete-cell]').getAttribute('data-delete-cell');
      const cell = cells.find(c => c.id == cellId);
      if (cell) {
        try {
          const result = await window.Swal.fire({
            title: 'Delete Cell',
            text: `Are you sure you want to delete ${cell.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#111827',
            background: '#111827',
            color: '#F9FAFB'
          });
          
          if (result.isConfirmed) {
            const response = await deleteCell(cell.id);
            if (response.success) {
              // Show success message
              await showSuccessMessage('Cell deleted successfully');
              
              // Close the current modal
              window.Swal.close();
              
              // Wait a moment for the success message to show, then reopen the main modal
              setTimeout(async () => {
                try {
                  // Get current page gender for filtering
                  const genderRoot = document.querySelector('[data-current-gender]');
                  const genderValue = (genderRoot?.getAttribute('data-current-gender') || '').toLowerCase();
                  const pageGender = genderValue === 'female' ? 'Female' : 'Male';
                  
                  // Fetch fresh data from API
                  const refreshResponse = await fetchCells('', pageGender, '');
                  if (refreshResponse.success) {
                    // Open the main cells management modal with fresh data
                    await openCellsManagementModal();
                  } else {
                    showErrorMessage('Failed to reload cells data');
                  }
                } catch (error) {
                  console.error('Error reloading cells:', error);
                  showErrorMessage('Failed to reload cells data');
                }
              }, 1500); // Wait for success message to display
              
              console.log('Cell deleted:', cell);
            } else {
              showErrorMessage(response.message);
            }
          }
        } catch (error) {
          showErrorMessage('Failed to delete cell');
          console.error('Delete error:', error);
        }
      }
    });
  });
}

/**
 * Open Add/Edit Cell Modal
 * TODO: Implement actual cell creation/editing functionality
 */
function openAddEditCellModal(cell = null) {
  const isEdit = !!cell;
  const title = isEdit ? 'Edit Cell' : 'Add New Cell';
  const isMobile = () => window.innerWidth < 640;
  const width = isMobile() ? '95%' : '42rem';
  
  // Get current page gender for cell type
  const genderRoot = document.querySelector('[data-current-gender]');
  const genderValue = (genderRoot?.getAttribute('data-current-gender') || '').toLowerCase();
  const pageGender = genderValue === 'female' ? 'Female' : 'Male';
  
  // Load draft if not editing
  const draft = isEdit ? cell : loadCellDraft();

  const modalHTML = `
    <div class="space-y-3 sm:space-y-4 text-left">
      <!-- Mobile Close Button (only visible on mobile) -->
      <div class="sm:hidden flex justify-end mb-2">
        <button id="mobile-close-add-edit-btn" class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Cell Name *</label>
          <input id="cell-name" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                 value="${draft?.name || ''}" placeholder="e.g., Cell 1" list="cell-name-suggestions" />
          <datalist id="cell-name-suggestions">
            ${generateCellNameSuggestions(cell)}
          </datalist>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Capacity *</label>
          <input id="cell-capacity" type="number" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                 value="${draft?.capacity || ''}" placeholder="e.g., 20" min="1" max="50" />
        </div>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Cell Type *</label>
          <select id="cell-type" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Select Type</option>
            <option value="Male" ${draft?.type === 'Male' ? 'selected' : ''}>Male</option>
            <option value="Female" ${draft?.type === 'Female' ? 'selected' : ''}>Female</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Location *</label>
          <input id="cell-location" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                 value="${draft?.location || ''}" placeholder="e.g., Block A" />
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">Status *</label>
        <select id="cell-status" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="">Select Status</option>
          <option value="Active" ${draft?.status === 'Active' ? 'selected' : ''}>Active</option>
          <option value="Maintenance" ${draft?.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
          <option value="Inactive" ${draft?.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
    </div>
  `;

  return window.Swal.fire({
    title: title,
    html: modalHTML,
    width: width,
    padding: isMobile() ? '0.75rem' : '1.5rem',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: isEdit ? 'Update Cell' : 'Add Cell',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#3B82F6',
    cancelButtonColor: '#111827',
    background: '#111827',
    color: '#F9FAFB',
    customClass: {
      container: 'swal-responsive-container',
      popup: 'swal-responsive-popup',
      content: 'swal-responsive-content',
    },
    didOpen: () => {
      // Mobile Close Button for Add/Edit Modal
      const mobileCloseAddEditBtn = document.getElementById('mobile-close-add-edit-btn');
      if (mobileCloseAddEditBtn) {
        mobileCloseAddEditBtn.addEventListener('click', () => {
          window.Swal.close();
        });
      }

      // Auto-save draft on input changes (only for new cells)
      if (!isEdit) {
        const inputs = ['cell-name', 'cell-capacity', 'cell-location'];
        const selects = ['cell-type', 'cell-status'];
        
        inputs.forEach(inputId => {
          const input = document.getElementById(inputId);
          if (input) {
            input.addEventListener('input', () => {
              const draftData = {
                name: document.getElementById('cell-name')?.value || '',
                capacity: document.getElementById('cell-capacity')?.value || '',
                type: document.getElementById('cell-type')?.value || '',
                location: document.getElementById('cell-location')?.value || '',
                status: document.getElementById('cell-status')?.value || ''
              };
              saveCellDraft(draftData);
            });
          }
        });
        
        selects.forEach(selectId => {
          const select = document.getElementById(selectId);
          if (select) {
            select.addEventListener('change', () => {
              const draftData = {
                name: document.getElementById('cell-name')?.value || '',
                capacity: document.getElementById('cell-capacity')?.value || '',
                type: document.getElementById('cell-type')?.value || '',
                location: document.getElementById('cell-location')?.value || '',
                status: document.getElementById('cell-status')?.value || ''
              };
              saveCellDraft(draftData);
            });
          }
        });
      }
    },
    preConfirm: () => {
      const data = {
        name: document.getElementById('cell-name').value.trim(),
        capacity: parseInt(document.getElementById('cell-capacity').value) || 0,
        type: document.getElementById('cell-type').value,
        location: document.getElementById('cell-location').value.trim(),
        status: document.getElementById('cell-status').value
      };

      // Basic validation
      if (!data.name || !data.capacity || !data.type || !data.location || !data.status) {
        window.Swal.showValidationMessage('Please fill in all required fields');
        return false;
      }

      if (!['Male', 'Female'].includes(data.type)) {
        window.Swal.showValidationMessage('Please select a valid cell type');
        return false;
      }

      if (data.capacity < 1 || data.capacity > 50) {
        window.Swal.showValidationMessage('Capacity must be between 1 and 50');
        return false;
      }

      return data;
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        let response;
        if (isEdit) {
          response = await updateCell(cell.id, result.value);
        } else {
          response = await addCell(result.value);
        }

        if (response.success) {
          // Show success message
          await showSuccessMessage(response.message);
          
          // Clear draft on successful save
          if (!isEdit) {
            clearCellDraft();
          }
          
          // Close the add/edit modal
          window.Swal.close();
          
          // Wait a moment for the success message to show, then reopen the main modal
          setTimeout(async () => {
            try {
              // Get current page gender for filtering
              const genderRoot = document.querySelector('[data-current-gender]');
              const genderValue = (genderRoot?.getAttribute('data-current-gender') || '').toLowerCase();
              const pageGender = genderValue === 'female' ? 'Female' : 'Male';
              
              // Fetch fresh data from API
              const refreshResponse = await fetchCells('', pageGender, '');
              if (refreshResponse.success) {
                // Open the main cells management modal with fresh data
                await openCellsManagementModal();
              } else {
                showErrorMessage('Failed to reload cells data');
              }
            } catch (error) {
              console.error('Error reloading cells:', error);
              showErrorMessage('Failed to reload cells data');
            }
          }, 1500); // Wait for success message to display
          
          console.log(isEdit ? 'Cell updated:' : 'Cell added:', response.data);
        } else {
          showErrorMessage(response.message);
        }
      } catch (error) {
        showErrorMessage('Failed to save cell: ' + error.message);
        console.error('Save error:', error);
      }
    }
  }).then((result) => {
    // Handle modal cancellation - save draft if not confirmed
    if (!result.isConfirmed && !isEdit) {
      const draftData = {
        name: document.getElementById('cell-name')?.value || '',
        capacity: document.getElementById('cell-capacity')?.value || '',
        type: document.getElementById('cell-type')?.value || '',
        location: document.getElementById('cell-location')?.value || '',
        status: document.getElementById('cell-status')?.value || ''
      };
      
      // Only save draft if there's actual data
      const hasData = Object.values(draftData).some(value => value && value.toString().trim() !== '');
      if (hasData) {
        saveCellDraft(draftData);
        console.log('Draft saved on modal close:', draftData);
      }
    }
  });
}

// Note: Delete functionality is now integrated into the event listeners above

/**
 * Show success message
 * TODO: Integrate with main notification system
 */
function showSuccessMessage(message) {
  window.Swal.fire({
    icon: 'success',
    title: message,
    timer: 1500,
    showConfirmButton: false,
    background: '#111827',
    color: '#F9FAFB',
    width: window.innerWidth < 640 ? '90%' : '32rem',
  });
}

/**
 * Show error message
 * TODO: Integrate with main notification system
 */
function showErrorMessage(message) {
  window.Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    confirmButtonText: 'OK',
    background: '#111827',
    color: '#F9FAFB',
    width: window.innerWidth < 640 ? '90%' : '32rem',
  });
}

// ========================================
// DYNAMIC CELLS MANAGEMENT FUNCTIONS
// ========================================

/**
 * Generate cell name suggestions for the datalist
 * TODO: Replace with actual API data
 */
function generateCellNameSuggestions(currentCell = null) {
  // Get existing cells from localStorage
  const existingCells = getAllCells().map(cell => ({
    id: cell.id,
    name: cell.name
  }));

  // If editing, don't suggest the current cell name
  const filteredCells = currentCell 
    ? existingCells.filter(cell => cell.id !== currentCell.id)
    : existingCells;

  return filteredCells.map(cell => 
    `<option value="${cell.name}">${cell.name}</option>`
  ).join('');
}

/**
 * Add a new cell to the system
 */
function addCell(cellData) {
  return fetch('/api/cells', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    },
    body: JSON.stringify(cellData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Update local cache
      const currentCells = loadCellsData();
      currentCells.push(data.data);
      saveCellsData(currentCells);
    }
    return data;
  })
  .catch(error => {
    console.error('Error adding cell:', error);
    return {
      success: false,
      message: 'Failed to add cell: ' + error.message
    };
  });
}

/**
 * Update an existing cell
 */
function updateCell(cellId, cellData) {
  return fetch(`/api/cells/${cellId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    },
    body: JSON.stringify(cellData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Update local cache
      const currentCells = loadCellsData();
      const cellIndex = currentCells.findIndex(cell => cell.id === cellId);
      if (cellIndex !== -1) {
        currentCells[cellIndex] = data.data;
        saveCellsData(currentCells);
      }
    }
    return data;
  })
  .catch(error => {
    console.error('Error updating cell:', error);
    return {
      success: false,
      message: 'Failed to update cell: ' + error.message
    };
  });
}

/**
 * Delete a cell from the system
 */
function deleteCell(cellId) {
  return fetch(`/api/cells/${cellId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Update local cache
      const currentCells = loadCellsData();
      const filteredCells = currentCells.filter(cell => cell.id !== cellId);
      saveCellsData(filteredCells);
    }
    return data;
  })
  .catch(error => {
    console.error('Error deleting cell:', error);
    return {
      success: false,
      message: 'Failed to delete cell: ' + error.message
    };
  });
}

/**
 * Fetch cells from API
 */
function fetchCells(query = '', typeFilter = '', statusFilter = '') {
  const params = new URLSearchParams();
  if (query) params.append('search', query);
  if (typeFilter) params.append('type', typeFilter);
  if (statusFilter) params.append('status', statusFilter);
  
  const url = `/api/cells${params.toString() ? '?' + params.toString() : ''}`;
  
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    }
  })
  .then(response => response.json())
  .catch(error => {
    console.error('Error fetching cells:', error);
    return {
      success: false,
      message: 'Failed to fetch cells: ' + error.message
    };
  });
}

/**
 * Get all cells from localStorage (cached)
 */
function getAllCells() {
  return loadCellsData();
}

/**
 * Get a specific cell by ID
 */
function getCellById(cellId) {
  const cells = getAllCells();
  return cells.find(cell => cell.id === cellId);
}

/**
 * Refresh cells data and update the UI
 */
function refreshCellsData(typeFilter = '') {
  return fetchCells('', typeFilter, '')
    .then(response => {
      if (response.success) {
        // Update local cache
        saveCellsData(response.data);
      }
      return response;
    });
}

/**
 * Search and filter cells
 */
function searchCells(query, typeFilter = '', statusFilter = '') {
  return fetchCells(query, typeFilter, statusFilter)
    .then(response => {
      if (response.success) {
        // Update local cache with search results
        saveCellsData(response.data);
      }
      return response;
    });
}
