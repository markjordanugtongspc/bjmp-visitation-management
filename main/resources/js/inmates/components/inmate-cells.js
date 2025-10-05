// Inmate Cells Management Component
// - Cell CRUD operations with SweetAlert2 modals
// - Responsive design with Tailwind CSS
// - Search and filter functionality
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
function openCellsManagementModal() {
  const isMobile = () => window.innerWidth < 640; // sm breakpoint in Tailwind
  const width = isMobile() ? '95vw' : '80rem'; // Wider modal for better content display

  // Sample cells data - TODO: Replace with actual API data
  const cells = [
    { id: 1, name: 'Cell 1', capacity: 20, currentCount: 15, type: 'Male', status: 'Active', location: 'Block A' },
    { id: 2, name: 'Cell 2', capacity: 15, currentCount: 12, type: 'Female', status: 'Active', location: 'Block A' },
    { id: 3, name: 'Cell 3', capacity: 25, currentCount: 20, type: 'Male', status: 'Active', location: 'Block B' },
    { id: 4, name: 'Cell 4', capacity: 18, currentCount: 8, type: 'Female', status: 'Maintenance', location: 'Block B' },
    { id: 5, name: 'Cell 5', capacity: 22, currentCount: 0, type: 'Male', status: 'Inactive', location: 'Block C' }
  ];

  const modalHTML = `
    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Cell Management</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage cell assignments, capacity, and occupancy</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <button id="add-cell-btn" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14m-7-7h14"/>
            </svg>
            Add New Cell
          </button>
          <button id="refresh-cells-btn" class="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/20 flex items-center justify-center">
              <svg class="h-6 w-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M29 4C29.2652 4 29.5196 3.89464 29.7071 3.70711C29.8946 3.51957 30 3.26522 30 3C30 2.73478 29.8946 2.48043 29.7071 2.29289C29.5196 2.10536 29.2652 2 29 2H3C2.73478 2 2.48043 2.10536 2.29289 2.29289C2.10536 2.48043 2 2.73478 2 3C2 3.26522 2.10536 3.51957 2.29289 3.70711C2.48043 3.89464 2.73478 4 3 4H5V28H3C2.73478 28 2.48043 28.1054 2.29289 28.2929C2.10536 28.4804 2 28.7348 2 29C2 29.2652 2.10536 29.5196 2.29289 29.7071C2.48043 29.8946 2.73478 30 3 30H29C29.2652 30 29.5196 29.8946 29.7071 29.7071C29.8946 29.5196 30 29.2652 30 29C30 28.7348 29.8946 28.4804 29.7071 28.2929C29.5196 28.1054 29.2652 28 29 28H27V4H29ZM15 20V14H21V20H15ZM21 12H19V4H21V12ZM17 4V12H15V4H17ZM7 4H9V28H7V4ZM11 4H13V28H11V4ZM15 28V22H17V28H15ZM19 28V22H21V28H19ZM25 28H23V4H25V28Z" fill="currentColor"/>
                <path d="M18 16H17C16.7348 16 16.4804 16.1054 16.2929 16.2929C16.1054 16.4804 16 16.7348 16 17C16 17.2652 16.1054 17.5196 16.2929 17.7071C16.4804 17.8946 16.7348 18 17 18H18C18.2652 18 18.5196 17.8946 18.7071 17.7071C18.8946 17.5196 19 17.2652 19 17C19 16.7348 18.8946 16.4804 18.7071 16.2929C18.5196 16.1054 18.2652 16 18 16Z" fill="currentColor"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cells</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-100" id="total-cells">${cells.length}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Active Cells</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-100" id="active-cells">${cells.filter(c => c.status === 'Active').length}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600 dark:text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Capacity</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-100" id="total-capacity">${cells.reduce((sum, cell) => sum + cell.capacity, 0)}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Current Occupancy</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-gray-100" id="current-occupancy">${cells.reduce((sum, cell) => sum + cell.currentCount, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.5 3.75a6.75 6.75 0 105.196 11.163l3.646 3.646a.75.75 0 101.06-1.06l-3.646-3.646A6.75 6.75 0 0010.5 3.75zM6 10.5a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z"/>
            </svg>
            <input type="text" id="cell-search" placeholder="Search cells by name, type, or location..." 
                   class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
        </div>
        <div class="flex gap-2">
          <select id="cell-type-filter" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Types</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <select id="cell-status-filter" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <!-- Cells Table -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cell Info</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Capacity & Occupancy</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type & Location</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody id="cells-table-body" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              ${generateCellsTableRows(cells)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-700 dark:text-gray-300">
          Showing <span class="font-medium">1</span> to <span class="font-medium">${cells.length}</span> of <span class="font-medium">${cells.length}</span> results
        </div>
        <div class="flex items-center gap-2">
          <button class="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          <button class="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 cursor-pointer">
            1
          </button>
          <button class="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            Next
          </button>
        </div>
      </div>
    </div>
  `;

  return window.Swal.fire({
    title: `<span class="hidden">Cell Management</span>`,
    html: modalHTML,
    width: width,
    padding: isMobile() ? '1rem' : '1.5rem',
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
      // Attach event listeners to modal elements
      attachCellsModalEventListeners(cells);
    }
  });
}

/**
 * Generate table rows for cells data
 * TODO: Replace with dynamic data from API
 */
function generateCellsTableRows(cells) {
  return cells.map(cell => {
    const occupancyRate = (cell.currentCount / cell.capacity) * 100;
    const isFull = occupancyRate >= 90;
    const isNearFull = occupancyRate >= 75;
    
    const statusClass = getCellStatusClass(cell.status);
    const occupancyClass = isFull ? 'text-red-600' : isNearFull ? 'text-yellow-600' : 'text-green-600';
    
    return `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <td class="px-4 py-3 whitespace-nowrap">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/20 flex items-center justify-center">
              <svg class="h-6 w-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <span class="font-medium ${occupancyClass}">${cell.currentCount}/${cell.capacity}</span>
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
        <td class="px-4 py-3">
          <div class="text-sm">
            <div class="font-medium text-gray-900 dark:text-gray-100">${cell.type}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">${cell.location}</div>
          </div>
        </td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}">
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
    refreshBtn.addEventListener('click', () => {
      // TODO: Implement refresh functionality
      console.log('Refresh cells clicked');
    });
  }

  // Search functionality
  const searchInput = document.getElementById('cell-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      // TODO: Implement search functionality
      console.log('Search:', e.target.value);
    });
  }

  // Filter functionality
  const typeFilter = document.getElementById('cell-type-filter');
  const statusFilter = document.getElementById('cell-status-filter');
  
  if (typeFilter) {
    typeFilter.addEventListener('change', (e) => {
      // TODO: Implement type filter
      console.log('Type filter:', e.target.value);
    });
  }
  
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      // TODO: Implement status filter
      console.log('Status filter:', e.target.value);
    });
  }

  // Edit and Delete buttons
  document.querySelectorAll('[data-edit-cell]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cellId = e.target.closest('[data-edit-cell]').getAttribute('data-edit-cell');
      const cell = cells.find(c => c.id == cellId);
      if (cell) {
        openAddEditCellModal(cell);
      }
    });
  });

  document.querySelectorAll('[data-delete-cell]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cellId = e.target.closest('[data-delete-cell]').getAttribute('data-delete-cell');
      const cell = cells.find(c => c.id == cellId);
      if (cell) {
        openDeleteCellModal(cell);
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

  const modalHTML = `
    <div class="space-y-4 text-left">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Cell Name *</label>
          <input id="cell-name" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                 value="${cell?.name || ''}" placeholder="e.g., Cell 1" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Capacity *</label>
          <input id="cell-capacity" type="number" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                 value="${cell?.capacity || ''}" placeholder="e.g., 20" min="1" max="50" />
        </div>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Cell Type *</label>
          <select id="cell-type" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm">
            <option value="">Select Type</option>
            <option value="Male" ${cell?.type === 'Male' ? 'selected' : ''}>Male</option>
            <option value="Female" ${cell?.type === 'Female' ? 'selected' : ''}>Female</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Location *</label>
          <input id="cell-location" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                 value="${cell?.location || ''}" placeholder="e.g., Block A" />
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Status *</label>
        <select id="cell-status" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm">
          <option value="">Select Status</option>
          <option value="Active" ${cell?.status === 'Active' ? 'selected' : ''}>Active</option>
          <option value="Maintenance" ${cell?.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
          <option value="Inactive" ${cell?.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea id="cell-description" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                  rows="3" placeholder="Optional description...">${cell?.description || ''}</textarea>
      </div>
    </div>
  `;

  return window.Swal.fire({
    title: title,
    html: modalHTML,
    width: width,
    padding: isMobile() ? '1rem' : '1.5rem',
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
    preConfirm: () => {
      const data = {
        name: document.getElementById('cell-name').value.trim(),
        capacity: parseInt(document.getElementById('cell-capacity').value) || 0,
        type: document.getElementById('cell-type').value,
        location: document.getElementById('cell-location').value.trim(),
        status: document.getElementById('cell-status').value,
        description: document.getElementById('cell-description').value.trim()
      };

      // Basic validation
      if (!data.name || !data.capacity || !data.type || !data.location || !data.status) {
        window.Swal.showValidationMessage('Please fill in all required fields');
        return false;
      }

      if (data.capacity < 1 || data.capacity > 50) {
        window.Swal.showValidationMessage('Capacity must be between 1 and 50');
        return false;
      }

      return data;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // TODO: Implement actual save functionality
      console.log('Cell data:', result.value);
      showSuccessMessage(isEdit ? 'Cell updated successfully' : 'Cell added successfully');
    }
  });
}

/**
 * Open Delete Cell Confirmation Modal
 * TODO: Implement actual delete functionality
 */
function openDeleteCellModal(cell) {
  return window.Swal.fire({
    title: 'Delete Cell',
    text: `Are you sure you want to delete ${cell.name}? This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#EF4444',
    cancelButtonColor: '#111827',
    background: '#111827',
    color: '#F9FAFB'
  }).then((result) => {
    if (result.isConfirmed) {
      // TODO: Implement actual delete functionality
      console.log('Delete cell:', cell.id);
      showSuccessMessage('Cell deleted successfully');
    }
  });
}

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
