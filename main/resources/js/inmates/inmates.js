import 'flowbite';
import { createInmateStatusCounter } from './components/inmate-status-counter.js';
import { saveDraft, loadDraft, clearDraft, toDraftFromModalValue } from './components/inmate-form-draft.js';
import InmateApiClient from './components/inmateApi.js';
import { initializeInmateCells } from './components/inmate-cells.js';
import { createCellCounterManager } from './components/cell-counter-manager.js';
// Female-specific entrypoint is loaded separately on the female page
// Inmates Management System for BJMP
// - Full CRUD operations for inmates
// - Cell management and capacity tracking
// - Mobile responsive design with SweetAlert2
// - Real-time updates for both desktop and mobile views

document.addEventListener('DOMContentLoaded', () => {
  // Determine current page gender from Blade root
  const genderRoot = document.querySelector('[data-current-gender]');
  const genderValue = (genderRoot?.getAttribute('data-current-gender') || '').toLowerCase();
  const pageGender = genderValue === 'female' ? 'Female' : 'Male';
  // Get containers for desktop and mobile views
  const tableBody = document.querySelector('#inmates-table-body');
  const mobileCardsContainer = document.querySelector('#inmates-cards-mobile');
  const addButtons = document.querySelectorAll('[data-add-inmate]');
  const cellsContainer = document.querySelector('#cells-container');
  // Gender toggle switch (mirror of female entrypoint logic)
  const genderWrapper = document.querySelector('[data-gender-toggle]');
  const genderToggle = /** @type {HTMLInputElement|null} */(document.querySelector('[data-gender-toggle-input]'));
  const genderLabel = /** @type {HTMLSpanElement|null} */(document.querySelector('[data-gender-toggle-label]'));
  const routeContainer = document.querySelector('[data-route-admin-inmates-male]');
  const maleUrl = routeContainer?.getAttribute('data-route-admin-inmates-male') || '/admin/inmates';
  const femaleUrl = routeContainer?.getAttribute('data-route-admin-inmates-female') || '/admin/inmates/female';
  const currentGenderAttr = (routeContainer?.getAttribute('data-current-gender') || '').toLowerCase();

  if (genderWrapper && genderToggle && genderLabel) {
    if (currentGenderAttr === 'male') {
      genderLabel.textContent = 'Switch to Female';
      genderToggle.checked = false;
    } else if (currentGenderAttr === 'female') {
      genderLabel.textContent = 'Switch to Male';
      genderToggle.checked = true;
    } else {
      genderLabel.textContent = 'Switch to Female';
      genderToggle.checked = false;
    }

    genderToggle.addEventListener('change', () => {
      // Immediate label feedback
      genderLabel.textContent = (currentGenderAttr === 'male') ? 'Switch to Female' : 'Switch to Male';
      // Navigate to opposite route
      const target = (currentGenderAttr === 'male') ? femaleUrl : maleUrl;
      const targetPath = new URL(target, window.location.origin).pathname;
      if (window.location.pathname !== targetPath) {
        window.location.assign(target);
      }
    });
  }
  
  // Detect if we're on mobile
  const isMobile = () => window.innerWidth < 640; // sm breakpoint in Tailwind

  // Initialize API client
  const inmateApi = new InmateApiClient();

  // Inmates data (start empty; will be populated dynamically later)
  let inmates = [];

  // Initialize status counter component
  const statusCounter = createInmateStatusCounter();
  
  // Initialize cell counter manager
  const cellCounterManager = createCellCounterManager();
  
  // Set up cell counter manager callbacks
  cellCounterManager.setCallbacks({
    onCountUpdate: (cellId, newCount) => {
      // Update cell display in real-time
      cellCounterManager.updateCellDisplay(cellId, newCount);
      
      // Update cells array for consistency
      const cell = cells.find(c => c.id === cellId);
      if (cell) {
        cell.currentCount = newCount;
      }
      
      console.log(`Cell ${cellId} occupancy updated to ${newCount}`);
    },
    onCellFull: (cellId) => {
      console.log(`Cell ${cellId} is now full`);
      // Could trigger notifications or UI updates here
    },
    onCellTransfer: (fromCellId, toCellId, inmate) => {
      console.log(`Inmate ${inmate.id} transferred from cell ${fromCellId} to cell ${toCellId}`);
    }
  });

  // Dynamic cells data - will be fetched from database
  let cells = [];
  
  // Generate cell options for gender-specific dropdown
  function generateCellOptionsForGender(gender, currentCellId = null) {
    if (!gender || !cells.length) {
      return '<option value="">No cells available</option>';
    }
    
    // Filter cells by gender and status
    const availableCells = cells.filter(cell => {
      const isCorrectGender = cell.type === gender;
      const isActive = cell.status === 'Active';
      const hasCapacity = cell.currentCount < cell.capacity;
      
      return isCorrectGender && isActive && hasCapacity;
    });
    
    if (availableCells.length === 0) {
      return `<option value="">No ${gender} cells available</option>`;
    }
    
    return availableCells.map(cell => {
      const occupancyPercentage = Math.round((cell.currentCount / cell.capacity) * 100);
      const isSelected = currentCellId === cell.id;
      const isFull = cell.currentCount >= cell.capacity;
      
      return `
        <option value="${cell.id}" ${isSelected ? 'selected' : ''} ${isFull ? 'disabled' : ''}>
          ${cell.name} (${cell.currentCount}/${cell.capacity} - ${occupancyPercentage}%) - ${cell.type}${isFull ? ' - FULL' : ''}
        </option>
      `;
    }).join('');
  }

  // Fetch cells from database
  async function fetchCellsFromDatabase() {
    try {
      // Fetch cells data
      const response = await fetch(`/api/cells?type=${encodeURIComponent(pageGender)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      if (data.success) {
        cells = data.data || [];
        return cells;
      } else {
        throw new Error(data.message || 'Failed to fetch cells');
      }
    } catch (error) {
      console.error('Error fetching cells:', error);
      return [];
    }
  }

  // Populate Cells dropdown from backend
  async function populateCellsFilterDropdown() {
    const cellSelect = document.getElementById('inmates-cell-filter');
    if (!cellSelect) return;

    // Ensure cells list is loaded
    if (!cells || cells.length === 0) {
      await fetchCellsFromDatabase();
    }

    // Preserve the first option (All Cells)
    cellSelect.innerHTML = '<option value="">All Cells</option>';

    // Build options: "Cell 1 (10%) - Male"
    cells.forEach(cell => {
      const occupancyRate = cell.capacity ? Math.round((cell.currentCount / cell.capacity) * 100) : 0;
      const label = `${cell.name} (${occupancyRate}%) - ${cell.type}`;
      const option = document.createElement('option');
      option.value = String(cell.id);
      option.textContent = label;
      cellSelect.appendChild(option);
    });
  }

  // Initialize the page
  async function initializePage() {
    await fetchCellsFromDatabase();
    await renderCells();
    await renderInmates(); // This will initialize cell count manager with loaded data
    await populateCellsFilterDropdown();
    
    // Initialize status counter component
    if (statusCounter.initialize()) {
      console.log('Status counter initialized successfully');
    } else {
      console.warn('Status counter initialization failed');
    }
    
    // Initialize inmate cells management component
    initializeInmateCells();
    
    // Update statistics after everything is loaded
    updateStatistics();

    // Wire search and filters
    wireInmateSearchAndFilters();
  }

  function wireInmateSearchAndFilters() {
    const searchInput = document.getElementById('inmates-search');
    const statusFilter = document.getElementById('inmates-status-filter');
    const cellFilter = document.getElementById('inmates-cell-filter');

    let debounceId = null;

    const performSearch = async () => {
      const query = (searchInput?.value || '').trim();
      const status = statusFilter?.value || '';
      const cellId = cellFilter?.value || '';

      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (status) params.append('status', status);
      if (cellId) params.append('cell_id', cellId);
      params.append('gender', pageGender);
      params.append('per_page', '50');

      const url = `/api/inmates?${params.toString()}`;
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
          }
        });
        const data = await res.json();
        if (data?.success) {
          const page = data.data; // paginator
          // Inmates are already transformed by controller
          inmates = Array.isArray(page.data) ? page.data : [];
          
          // Recalculate cell occupancy
          updateCellOccupancy();

          // Clear current views
          if (tableBody) tableBody.innerHTML = '';
          if (mobileCardsContainer) mobileCardsContainer.innerHTML = '';

          if (inmates.length === 0) {
            // Minimal empty states
            if (tableBody) {
              tableBody.innerHTML = '<tr><td colspan="5" class="px-4 py-12 text-center text-gray-500 dark:text-gray-400">No Inmates Found</td></tr>';
            }
            if (mobileCardsContainer) {
              mobileCardsContainer.innerHTML = '<div class="text-center py-8 text-gray-500 dark:text-gray-400">No Inmates Found</div>';
            }
          } else {
            // Re-render using existing per-item renderer
            inmates.forEach((inmate) => {
              renderOrUpdateViews(inmate);
            });
          }

          // Update statistics after render
          updateStatistics();
        }
      } catch (e) {
        console.error('Inmate search failed:', e);
      }
    };

    const debounced = () => {
      if (debounceId) clearTimeout(debounceId);
      debounceId = setTimeout(performSearch, 300);
    };

    if (searchInput) searchInput.addEventListener('input', debounced);
    if (statusFilter) statusFilter.addEventListener('change', debounced);
    if (cellFilter) cellFilter.addEventListener('change', debounced);
  }


  // Update cell occupancy based on actual inmate data
  function updateCellOccupancy() {
    // Reset all cell counts
    cells.forEach(cell => {
      cell.currentCount = 0;
    });

    // Count inmates by cell
    inmates.forEach(inmate => {
      // Only count active inmates
      if (inmate.status === 'Active' && inmate.cell_id) {
        const cell = cells.find(c => c.id === inmate.cell_id);
        if (cell) {
          cell.currentCount++;
        }
      }
    });
  }

  // Render cells overview with backend integration
  async function renderCells() {
    if (!cellsContainer) return;
    
    try {
      const LIMIT = 4;
      const initialOffset = 0;
      const { cells: firstBatch, pagination } = await fetchCellsPage(initialOffset, LIMIT);

      if (firstBatch && Array.isArray(firstBatch)) {
        const total = pagination?.total ?? firstBatch.length;
        if (total <= 4) {
          renderCellsGrid(firstBatch);
        } else {
          renderCellsCarousel({
            total,
            limit: LIMIT,
            offset: initialOffset,
            initialCells: firstBatch
          });
        }
      } else {
        renderEmptyState();
      }
    } catch (error) {
      console.error('Error fetching cells:', error);
      renderEmptyState();
    }
  }

  // Fetch one page of cells with limit/offset and small cache
  const cellsPageCache = new Map(); // key: gender:offset:limit -> array of cells
  async function fetchCellsPage(offset = 0, limit = 4) {
    const cacheKey = `${pageGender}:${offset}:${limit}`;
    if (cellsPageCache.has(cacheKey)) {
      return cellsPageCache.get(cacheKey);
    }

    const url = `/api/cells?type=${encodeURIComponent(pageGender)}&limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch cells');

    const payload = {
      cells: data.data || [],
      pagination: data.pagination || { total: (data.data || []).length, limit, offset }
    };
    cellsPageCache.set(cacheKey, payload);
    return payload;
  }

  // Refresh cell data from backend
  async function refreshCellData() {
    try {
      const response = await fetch(`/api/cells?type=${encodeURIComponent(pageGender)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to refresh cells');

      // Update global cells array
      cells = data.data || [];
      
      
      console.log('Refreshed cell data:', cells.length, 'cells');
    } catch (error) {
      console.error('Error refreshing cell data:', error);
    }
  }

  // TASK 2: Auto-reload page after successful modal operations
  function autoReloadPage() {
    console.log('Auto-reloading page after successful modal operation...');
    // Small delay to ensure user sees the success message
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }

  // Render carousel wrapper and wire controls for 5+ cells
  function renderCellsCarousel({ total, limit, offset, initialCells }) {
    const pageCount = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.floor(offset / limit) + 1;

    // Shell
    cellsContainer.className = '';
    cellsContainer.innerHTML = `
      <div class="relative">
        <div id="cells-slide" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"></div>

        <!-- Controls -->
        <div class="mt-4 flex items-center justify-between">
          <button id="cells-prev" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:bg-white dark:disabled:hover:bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <div id="cells-indicators" class="flex items-center gap-2"></div>
          <button id="cells-next" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:bg-white dark:disabled:hover:bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    const slideEl = document.getElementById('cells-slide');
    const prevBtn = document.getElementById('cells-prev');
    const nextBtn = document.getElementById('cells-next');
    const indicatorsEl = document.getElementById('cells-indicators');

    function renderSlide(cells) {
      slideEl.innerHTML = '';
      slideEl.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
      cells.forEach((cell, idx) => {
        slideEl.insertAdjacentHTML('beforeend', createCellCard(cell, idx));
      });
    }

    function renderIndicators(activePage) {
      indicatorsEl.innerHTML = '';
      for (let i = 1; i <= pageCount; i++) {
        const isActive = i === activePage;
        indicatorsEl.insertAdjacentHTML('beforeend', `
          <button data-page="${i}" class="h-2.5 w-2.5 rounded-full ${isActive ? 'bg-blue-600' : 'bg-gray-300'} hover:bg-blue-500 transition-colors cursor-pointer" aria-label="Go to page ${i}"></button>
        `);
      }
    }

    let currentOffset = offset;
    let currentPageIndex = currentPage; // 1-based

    renderSlide(initialCells);
    renderIndicators(currentPageIndex);
    updateControlsState();

    async function goToPage(pageIndex) {
      const clamped = Math.max(1, Math.min(pageCount, pageIndex));
      const newOffset = (clamped - 1) * limit;
      if (newOffset === currentOffset) return;

      try {
        const { cells: pageCells } = await fetchCellsPage(newOffset, limit);
        currentOffset = newOffset;
        currentPageIndex = clamped;
        renderSlide(pageCells);
        renderIndicators(currentPageIndex);
        updateControlsState();
      } catch (e) {
        console.error('Failed to change carousel page:', e);
      }
    }

    function updateControlsState() {
      prevBtn.disabled = currentPageIndex <= 1;
      nextBtn.disabled = currentPageIndex >= pageCount;
    }

    prevBtn.addEventListener('click', () => goToPage(currentPageIndex - 1));
    nextBtn.addEventListener('click', () => goToPage(currentPageIndex + 1));
    indicatorsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-page]');
      if (!btn) return;
      const p = parseInt(btn.getAttribute('data-page')) || 1;
      goToPage(p);
    });
  }

  // Render cells in a responsive grid (no carousel)
  function renderCellsGrid(cells) {
    cellsContainer.innerHTML = '';
    cellsContainer.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
    cells.forEach((cell, index) => {
      const cellCard = createCellCard(cell, index);
      cellsContainer.innerHTML += cellCard;
    });
  }

  // Create individual cell card
  function createCellCard(cell, index) {
    const occupancyRate = (cell.currentCount / cell.capacity) * 100;
    const isFull = occupancyRate >= 90;
    const isNearFull = occupancyRate >= 75;
    
    // Use gender-based colors instead of index-based colors
    const isMale = cell.type === 'Male';
    const baseColor = isMale ? 
      'bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800' : 
      'bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800';
    
    const progressColor = isFull ? 'bg-red-500' : isNearFull ? 'bg-yellow-500' : 
                         isMale ? 'bg-sky-500' : 'bg-pink-500';
    
    const badgeColor = isMale ? 'bg-sky-100 text-sky-800 dark:bg-sky-800 dark:text-sky-100' :
                      'bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100';

    return `
      <div class="p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${baseColor} min-w-[280px] sm:min-w-0">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">${cell.name}</h3>
          <span class="text-xs px-2 py-1 rounded-full ${badgeColor} flex items-center gap-1">
            ${cell.type === 'Male' ? `
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 512 512" class="text-sky-600 dark:text-sky-400">
                <path fill="currentColor" d="M292.563 65.656v40h85.156l-81.658 82.656l-12.937 13.125a136.4 136.4 0 0 0-29.406-16.75a136.3 136.3 0 0 0-52.064-10.343c-17.835 0-35.553 3.52-52.03 10.344a136.2 136.2 0 0 0-44.126 29.468a136.2 136.2 0 0 0-29.47 44.125c-6.825 16.48-10.373 34.228-10.374 52.064a136.1 136.1 0 0 0 10.344 52.03a136.2 136.2 0 0 0 29.5 44.126a136.2 136.2 0 0 0 44.125 29.47c16.478 6.824 34.195 10.374 52.03 10.374c17.837 0 35.586-3.55 52.064-10.375a136.2 136.2 0 0 0 44.124-29.47a136.2 136.2 0 0 0 29.47-44.125a136.1 136.1 0 0 0 10.342-52.03a136.3 136.3 0 0 0-10.344-52.064a136.3 136.3 0 0 0-16.03-28.436l13.218-13.406l81.844-82.875v85.875h40V65.656zm-90.907 148.688a96.6 96.6 0 0 1 36.75 7.312c11.58 4.797 22.263 11.95 31.125 20.813c8.863 8.86 16.017 19.545 20.814 31.124a96.6 96.6 0 0 1 7.312 36.75c0 12.533-2.517 25.14-7.312 36.72c-4.796 11.577-11.92 22.292-20.78 31.155c-8.864 8.862-19.578 16.014-31.158 20.81a96.6 96.6 0 0 1-36.75 7.314c-12.533 0-25.14-2.516-36.72-7.313a96.6 96.6 0 0 1-31.155-20.81a96.6 96.6 0 0 1-20.81-31.158c-4.798-11.58-7.314-24.185-7.314-36.718a96.6 96.6 0 0 1 7.313-36.75l.093-.22c4.796-11.494 11.91-22.13 20.718-30.937c8.808-8.805 19.444-15.892 30.94-20.687l.218-.094c11.58-4.795 24.185-7.313 36.718-7.312z" />
              </svg>
            ` : cell.type === 'Female' ? `
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" class="text-pink-600 dark:text-pink-400">
                <g fill="none" fill-rule="evenodd">
                  <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                  <path fill="currentColor" d="M7 9.5a7.5 7.5 0 1 1 2.942 5.957l-1.788 1.787L9.58 18.67a1 1 0 1 1-1.414 1.414L6.74 18.659l-2.12 2.12a1 1 0 0 1-1.414-1.415l2.12-2.12l-1.403-1.403a1 1 0 1 1 1.414-1.414L6.74 15.83l1.79-1.79A7.47 7.47 0 0 1 7 9.5M14.5 4a5.5 5.5 0 1 0 0 11a5.5 5.5 0 0 0 0-11" />
                </g>
              </svg>
            ` : ''}
            ${cell.type}
          </span>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Occupancy</span>
            <span>${cell.currentCount}/${cell.capacity}</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="h-2 rounded-full transition-all duration-300 ${progressColor}" style="width: ${occupancyRate}%"></div>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 text-center">
            ${Math.round(occupancyRate)}% occupied
          </div>
        </div>
      </div>
    `;
  }

  // Render empty state
  function renderEmptyState() {
    cellsContainer.innerHTML = `
      <div class="col-span-full text-center py-8">
        <div class="flex flex-col items-center justify-center space-y-4">
          <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
              <path d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"/>
            </svg>
          </div>
          <div class="text-center">
            <h3 class="text-base font-medium text-gray-900 dark:text-gray-100">No Cells Found</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Add your first cell to get started.</p>
          </div>
        </div>
      </div>
    `;
  }

  // Open inmate modal for add/edit
  async function openInmateModal(inmate = {}) {
    const isEdit = !!inmate.id;
    const title = isEdit ? 'Edit Inmate' : 'Add New Inmate';
    
    // Fetch fresh cell data before opening modal
    try {
      await fetchCellsFromDatabase();
      console.log('Cells loaded for modal:', cells.length);
    } catch (error) {
      console.error('Failed to load cells for modal:', error);
      // Continue with existing cells data
    }
    
    // Responsive width for the modal
    const width = isMobile() ? '95%' : '42rem';
    
    return window.Swal.fire({
      title: title,
      html: `
        <div class="space-y-4 text-left max-h-[70vh] overflow-y-auto scrollbar-none" style="-ms-overflow-style: none; scrollbar-width: none;">
          <!-- Personal Information -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">Personal Information</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-300 mb-1">First Name *</label>
                <input id="i-firstname" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                       value="${inmate.firstName || ''}" placeholder="Enter first name" />
              </div>
              <div>
                <label class="block text-xs text-gray-300 mb-1">Last Name *</label>
                <input id="i-lastname" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                       value="${inmate.lastName || ''}" placeholder="Enter last name" />
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-300 mb-1">Middle Name</label>
                <input id="i-middlename" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                       value="${inmate.middleName || ''}" placeholder="Enter middle name" />
              </div>
              <div>
                <label class="block text-xs text-gray-300 mb-1">Age</label>
                <input
                  id="i-age"
                  type="text"
                  aria-label="disabled input"
                  class="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   value="${inmate.age ?? ''}" 
                  disabled
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-300 mb-1">Gender *</label>
                <select id="i-gender" class="w-full appearance-none rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm pr-8">
                  <option value="">Select Gender</option>
                  <option value="Male" ${inmate.gender === 'Male' ? 'selected' : ''}>Male</option>
                  <option value="Female" ${inmate.gender === 'Female' ? 'selected' : ''}>Female</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-300 mb-1">Admission Date *</label>
                <input id="i-admission-date" type="date" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                       value="${inmate.admissionDate || ''}" />
              </div>
            </div>

            <!-- Demographic: Date of Birth -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-300 mb-1">Date of Birth *</label>
                <input id="i-dob" type="date" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" value="${inmate.dateOfBirth || ''}" />
              </div>
            </div>

            <!-- Address -->
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Address</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-gray-300 mb-1">Address Line 1 *</label>
                  <input id="i-addr1" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" value="${inmate.addressLine1 || ''}" placeholder="House No., Street, Barangay" />
                </div>
                <div>
                  <label class="block text-xs text-gray-300 mb-1">Address Line 2</label>
                  <input id="i-addr2" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" value="${inmate.addressLine2 || ''}" placeholder="Subdivision, Building (optional)" />
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs text-gray-300 mb-1">City/Municipality *</label>
                  <input id="i-city" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" value="${inmate.city || ''}" placeholder="City/Municipality" />
                </div>
                <div>
                  <label class="block text-xs text-gray-300 mb-1">Province/State *</label>
                  <input id="i-province" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" value="${inmate.province || ''}" placeholder="Province/State" />
                </div>
                <div>
                  <label class="block text-xs text-gray-300 mb-1">Postal Code</label>
                  <input id="i-postal" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" value="${inmate.postalCode || ''}" placeholder="e.g., 9200" />
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-300 mb-1">Country *</label>
                <input id="i-country" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" value="${inmate.country || 'Philippines'}" placeholder="Country" />
              </div>
            </div>
          </div>
          
          <!-- Legal Information -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">Legal Information</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-300 mb-1">Crime *</label>
                <input id="i-crime" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                       value="${inmate.crime || ''}" placeholder="Enter crime committed" />
              </div>
              <div>
                <label class="block text-xs text-gray-300 mb-1">Sentence *</label>
                <input id="i-sentence" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                       value="${inmate.sentence || ''}" placeholder="e.g., 2 years, Life, etc." />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-300 mb-1">Work / Job</label>
                <input id="i-job" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                       value="${inmate.job || ''}" placeholder="e.g., Kitchen duty, Cleaning, None" />
              </div>
            </div>
          </div>
          
          <!-- Cell Assignment -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">Cell Assignment</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-300 mb-1">Cell Assignment *</label>
                <select id="i-cell" class="w-full appearance-none rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm pr-8" required>
                  <option value="">Select Cell</option>
                  ${generateCellOptionsForGender(inmate.gender || '', inmate.cell_id)}
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-300 mb-1">Status *</label>
                <select id="i-status" class="w-full appearance-none rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm pr-8">
                  <option value="">Select Status</option>
                  <option value="Active" ${inmate.status === 'Active' ? 'selected' : ''}>Active</option>
                  <option value="Released" ${inmate.status === 'Released' ? 'selected' : ''}>Released</option>
                  <option value="Transferred" ${inmate.status === 'Transferred' ? 'selected' : ''}>Transferred</option>
                  <option value="Medical" ${inmate.status === 'Medical' ? 'selected' : ''}>Medical</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Medical Information -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">Medical Information</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-300 mb-1">Medical Status</label>
                <select id="i-medical-status" class="w-full appearance-none rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm pr-8">
                  <option value="">Select Medical Status</option>
                  <option value="Healthy" ${inmate.medicalStatus === 'Healthy' ? 'selected' : ''}>Healthy</option>
                  <option value="Under Treatment" ${inmate.medicalStatus === 'Under Treatment' ? 'selected' : ''}>Under Treatment</option>
                  <option value="Critical" ${inmate.medicalStatus === 'Critical' ? 'selected' : ''}>Critical</option>
                  <option value="Not Assessed" ${inmate.medicalStatus === 'Not Assessed' ? 'selected' : ''}>Not Assessed</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-300 mb-1">Last Medical Check</label>
                <input id="i-last-medical" type="date" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                       value="${inmate.lastMedicalCheck || ''}" />
              </div>
            </div>
            
            <div>
              <label class="block text-xs text-gray-300 mb-1">Medical Notes</label>
              <textarea id="i-medical-notes" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                        rows="3" placeholder="Enter any medical notes or conditions...">${inmate.medicalNotes || ''}</textarea>
            </div>
          </div>

        <!-- Points System -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">Points System</h3>
          
          <!-- Points Summary -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
            <div>
              <label class="block text-sm text-gray-300 mb-2 font-medium">Initial Points</label>
              <input id="i-initial-points" type="number" class="w-full rounded-md bg-gray-800/60 border border-gray-600 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                     value="${inmate.initialPoints || 0}" placeholder="Starting points" />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-2 font-medium">Current Points</label>
              <input id="i-current-points" type="number" class="w-full rounded-md bg-gray-800/60 border border-gray-600 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                     value="${inmate.currentPoints || 0}" placeholder="Current points" />
            </div>
          </div>
          
          <!-- Points History Management - Expanded -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-md font-semibold text-gray-200">Points History</h4>
              <button type="button" id="add-points-entry" class="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md cursor-pointer transition-colors">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add Points Entry
              </button>
            </div>
            
            <!-- Points History Container - Expanded and Responsive -->
            <div id="points-entries-container" class="space-y-3 max-h-96 overflow-y-auto">
              <!-- Points entries will be dynamically added here -->
            </div>
            
            <!-- Empty State -->
            <div id="points-empty-state" class="text-center py-8 text-gray-400 hidden">
              <svg class="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-sm">No points history yet. Click "Add Points Entry" to get started.</p>
            </div>
          </div>
        </div>

          <!-- Visitation Information -->
          <div class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">Visitation Information</h3>
            
            <!-- Allowed Visitors Management - Expanded -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="text-md font-semibold text-gray-200">Allowed Visitors</h4>
                <button type="button" id="add-allowed-visitor" class="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md cursor-pointer transition-colors">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Add Visitor
                </button>
              </div>
              
              <!-- Allowed Visitors Container - Expanded and Responsive -->
              <div id="allowed-visitors-container" class="space-y-3 max-h-96 overflow-y-auto">
                <!-- Allowed visitors will be dynamically added here -->
              </div>
              
              <!-- Empty State -->
              <div id="visitors-empty-state" class="text-center py-8 text-gray-400 hidden">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <p class="text-sm">No allowed visitors yet. Click "Add Visitor" to get started.</p>
              </div>
            </div>
            
            <!-- Recent Visits Management - Expanded -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="text-md font-semibold text-gray-200">Recent Visits</h4>
                <button type="button" id="add-visit-record" class="inline-flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md cursor-pointer transition-colors">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Add Visit
                </button>
              </div>
              
              <!-- Visit Records Container - Expanded and Responsive -->
              <div id="visit-records-container" class="space-y-3">
                <!-- Visit records will be dynamically added here -->
              </div>
              
              <!-- Empty State -->
              <div id="visits-empty-state" class="text-center py-8 text-gray-400 hidden">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p class="text-sm">No visit records yet. Click "Add Visit" to get started.</p>
              </div>
            </div>
          </div>
        </div>
        <style>
          .swal2-html-container > div::-webkit-scrollbar { display: none !important; }
          .swal2-html-container > div { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        </style>
      `,
      width: width,
      padding: isMobile() ? '1rem' : '1.5rem',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: isEdit ? 'Update' : 'Add Inmate',
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
        // Add responsive behavior to dropdowns
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
          select.addEventListener('focus', () => {
            select.classList.add('ring-2', 'ring-blue-500');
          });
          select.addEventListener('blur', () => {
            select.classList.remove('ring-2', 'ring-blue-500');
          });
          
          // Add touch-friendly behavior for mobile
          if (isMobile()) {
            select.classList.add('text-base', 'py-3');
          }
        });

        // Auto-calc age from DOB
        const dobInput = /** @type {HTMLInputElement} */(document.getElementById('i-dob'));
        const ageInput = /** @type {HTMLInputElement} */(document.getElementById('i-age'));
        if (dobInput && ageInput) {
          const updateAge = () => {
            const v = dobInput.value;
            ageInput.value = v ? String(calculateAge(v)) : '';
          };
          dobInput.addEventListener('change', updateAge);
          updateAge();
        }
        
        // Add gender change listener to update cell options
        const genderSelect = document.getElementById('i-gender');
        const cellSelect = document.getElementById('i-cell');
        
        if (genderSelect && cellSelect) {
          genderSelect.addEventListener('change', (e) => {
            const selectedGender = e.target.value;
            const currentCellId = cellSelect.value;
            
            // Update cell options based on gender
            cellSelect.innerHTML = '<option value="">Select Cell</option>' + 
              generateCellOptionsForGender(selectedGender, currentCellId);
          });
        }

        // Initialize dynamic form elements
        initializePointsHistory();
        initializeAllowedVisitors();
        initializeVisitRecords();
      },
      preConfirm: () => {
        const isEditing = !!inmate.id;

        const data = {
          firstName: document.getElementById('i-firstname').value.trim(),
          lastName: document.getElementById('i-lastname').value.trim(),
          middleName: document.getElementById('i-middlename').value.trim(),
          dateOfBirth: /** @type {HTMLInputElement} */(document.getElementById('i-dob'))?.value || null,
          age: (() => { const dob = /** @type {HTMLInputElement} */(document.getElementById('i-dob'))?.value; return dob ? calculateAge(dob) : (inmate.age ?? null); })(),
          gender: document.getElementById('i-gender').value,
          addressLine1: document.getElementById('i-addr1')?.value.trim() || '',
          addressLine2: document.getElementById('i-addr2')?.value.trim() || '',
          city: document.getElementById('i-city')?.value.trim() || '',
          province: document.getElementById('i-province')?.value.trim() || '',
          postalCode: document.getElementById('i-postal')?.value.trim() || '',
          country: document.getElementById('i-country')?.value.trim() || '',
          crime: document.getElementById('i-crime').value.trim(),
          sentence: document.getElementById('i-sentence').value.trim(),
          job: document.getElementById('i-job')?.value.trim() || '',
          cell_id: parseInt(document.getElementById('i-cell').value) || null,
          status: document.getElementById('i-status').value,
          admissionDate: document.getElementById('i-admission-date').value,
          // Medical Information
          medicalStatus: document.getElementById('i-medical-status').value || 'Not Assessed',
          lastMedicalCheck: document.getElementById('i-last-medical').value || null,
          medicalNotes: document.getElementById('i-medical-notes').value.trim() || '',
          // Points System
          initialPoints: parseInt(document.getElementById('i-initial-points').value) || 0,
          currentPoints: parseInt(document.getElementById('i-current-points').value) || 0,
          pointsHistory: collectPointsHistory(),
          // Visitation Information
          allowedVisitors: collectAllowedVisitors(),
          recentVisits: collectVisitRecords()
        };

        // Validate required fields
        if (!data.firstName || !data.lastName || !data.gender || !data.crime || !data.sentence || !data.status || !data.admissionDate || !data.cell_id) {
          window.Swal.showValidationMessage('Please fill in all required fields including cell assignment.');
          return false;
        }

        return data;
      },
    });
  }

  // Dynamic form management functions

  /**
   * Initialize the Points History form section.
   * @param {Object} [inmateData] - Optional inmate object to use for populating points history.
   */
  function initializePointsHistory(inmateData) {
    const container = document.getElementById('points-entries-container');
    const addBtn = document.getElementById('add-points-entry');
    const emptyState = document.getElementById('points-empty-state');
    
    if (!container || !addBtn) return;

    // Clear existing entries
    container.innerHTML = '';

    // Load existing points history
    // Use inmateData if provided, otherwise try to use global 'inmate' if it exists, else empty array
    let existingHistory = [];
    if (inmateData && Array.isArray(inmateData.pointsHistory)) {
      existingHistory = inmateData.pointsHistory;
    } else if (typeof inmate !== 'undefined' && inmate && Array.isArray(inmate.pointsHistory)) {
      existingHistory = inmate.pointsHistory;
    }
    
    // Add existing entries
    existingHistory.forEach((entry, index) => {
      addPointsEntry(entry, index);
    });

    // Show/hide empty state
    if (emptyState) {
      if (existingHistory.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }

    // Add button event listener
    addBtn.addEventListener('click', () => {
      addPointsEntry();
    });
  }

  function addPointsEntry(entry = {}, index = null) {
    const container = document.getElementById('points-entries-container');
    const emptyState = document.getElementById('points-empty-state');
    if (!container) return;

    // Hide empty state when adding entries
    if (emptyState) {
      emptyState.classList.add('hidden');
    }

    const entryIndex = index !== null ? index : container.children.length;
    const entryDiv = document.createElement('div');
    entryDiv.className = 'bg-gray-800/40 rounded-xl p-4 border border-gray-600 hover:bg-gray-800/60 transition-all duration-200 shadow-sm';
    entryDiv.innerHTML = `
      <!-- Entry Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-semibold">${entryIndex + 1}</span>
          </div>
          <h4 class="text-base font-semibold text-gray-200">Points Entry</h4>
        </div>
        <button type="button" class="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md cursor-pointer transition-colors" 
                onclick="this.parentElement.parentElement.remove(); updateEmptyState();">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Remove
        </button>
      </div>

      <!-- Main Form Grid - Responsive -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
        <!-- Date Field -->
        <div class="sm:col-span-1">
          <label class="block text-sm text-gray-300 mb-2 font-medium">Date *</label>
          <input type="date" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                 value="${entry.date || ''}" data-field="date" required />
        </div>
        
        <!-- Points Field -->
        <div class="sm:col-span-1">
          <label class="block text-sm text-gray-300 mb-2 font-medium">Points *</label>
          <div class="relative">
            <input type="number" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                   value="${entry.points || ''}" data-field="points" placeholder="+5 or -2" required />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <span class="text-gray-400 text-xs">pts</span>
            </div>
          </div>
        </div>
        
        <!-- Activity Field - Takes more space on larger screens -->
        <div class="sm:col-span-2 lg:col-span-1 xl:col-span-2">
          <label class="block text-sm text-gray-300 mb-2 font-medium">Activity *</label>
          <select class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" data-field="activity" required>
            <option value="">Select Activity</option>
            <option value="Good behavior" ${entry.activity === 'Good behavior' ? 'selected' : ''}>Good behavior</option>
            <option value="Work assignment" ${entry.activity === 'Work assignment' ? 'selected' : ''}>Work assignment</option>
            <option value="Educational program" ${entry.activity === 'Educational program' ? 'selected' : ''}>Educational program</option>
            <option value="Community service" ${entry.activity === 'Community service' ? 'selected' : ''}>Community service</option>
            <option value="Rule violation" ${entry.activity === 'Rule violation' ? 'selected' : ''}>Rule violation</option>
            <option value="Fighting" ${entry.activity === 'Fighting' ? 'selected' : ''}>Fighting</option>
            <option value="Disobedience" ${entry.activity === 'Disobedience' ? 'selected' : ''}>Disobedience</option>
            <option value="Other" ${entry.activity === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>

      <!-- Notes Section -->
      <div>
        <label class="block text-sm text-gray-300 mb-2 font-medium">Additional Notes</label>
        <textarea class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" 
                  rows="3" data-field="note" placeholder="Additional details about the activity...">${entry.note || ''}</textarea>
      </div>

      <!-- Entry Footer with Status -->
      <div class="mt-3 pt-3 border-t border-gray-600">
        <div class="flex items-center justify-between text-xs text-gray-400">
          <span>Entry #${entryIndex + 1}</span>
          <span class="flex items-center">
            <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Active
          </span>
        </div>
      </div>
    `;
    container.appendChild(entryDiv);
  }

  // Helper function to update empty state visibility
  function updateEmptyState() {
    const container = document.getElementById('points-entries-container');
    const emptyState = document.getElementById('points-empty-state');
    
    if (container && emptyState) {
      if (container.children.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }
  }

  function collectPointsHistory() {
    const container = document.getElementById('points-entries-container');
    if (!container) return [];

    const entries = [];
    container.querySelectorAll('.bg-gray-800\\/40').forEach(entryDiv => {
      const date = entryDiv.querySelector('[data-field="date"]').value;
      const points = entryDiv.querySelector('[data-field="points"]').value;
      const activity = entryDiv.querySelector('[data-field="activity"]').value;
      const note = entryDiv.querySelector('[data-field="note"]').value;

      if (date && points && activity) {
        entries.push({
          date: date,
          points: parseInt(points),
          activity: activity,
          note: note
        });
      }
    });
    return entries;
  }

  /**
   * Initialize the Allowed Visitors form section.
   * @param {Object} [inmateData] - Optional inmate object to use for populating allowed visitors.
   */
  function initializeAllowedVisitors(inmateData) {
    const container = document.getElementById('allowed-visitors-container');
    const addBtn = document.getElementById('add-allowed-visitor');
    const emptyState = document.getElementById('visitors-empty-state');
    
    if (!container || !addBtn) return;

    // Clear existing entries
    container.innerHTML = '';

    // Load existing allowed visitors
    let existingVisitors = [];
    if (inmateData && Array.isArray(inmateData.allowedVisitors)) {
      existingVisitors = inmateData.allowedVisitors;
    } else if (typeof inmate !== 'undefined' && inmate && Array.isArray(inmate.allowedVisitors)) {
      existingVisitors = inmate.allowedVisitors;
    }
    
    // Add existing visitors
    existingVisitors.forEach((visitor, index) => {
      addAllowedVisitor(visitor, index);
    });

    // Show/hide empty state
    if (emptyState) {
      if (existingVisitors.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }

    // Add button event listener
    addBtn.addEventListener('click', () => {
      addAllowedVisitor();
    });
  }

  function addAllowedVisitor(visitor = {}, index = null) {
    const container = document.getElementById('allowed-visitors-container');
    const emptyState = document.getElementById('visitors-empty-state');
    if (!container) return;

    // Hide empty state when adding visitors
    if (emptyState) {
      emptyState.classList.add('hidden');
    }

    const entryIndex = index !== null ? index : container.children.length;
    const visitorDiv = document.createElement('div');
    visitorDiv.className = 'bg-gray-800/40 rounded-xl p-4 border border-gray-600 hover:bg-gray-800/60 transition-all duration-200 shadow-sm';
    visitorDiv.innerHTML = `
      <!-- Visitor Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-semibold">${entryIndex + 1}</span>
          </div>
          <h4 class="text-base font-semibold text-gray-200">Allowed Visitor</h4>
        </div>
        <button type="button" class="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md cursor-pointer transition-colors" 
                onclick="this.parentElement.parentElement.remove(); updateVisitorsEmptyState();">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Remove
        </button>
      </div>

      <!-- Main Form Grid - Responsive -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <!-- 1x1 Photo Upload -->
        <div class="sm:col-span-2 lg:col-span-1">
          <label class="block text-sm text-gray-300 mb-2 font-medium">1x1 Photo</label>
          <div class="flex items-center gap-3">
            <img data-field="avatarPreview" src="/images/logo/logo-temp_round.png" alt="Visitor avatar" class="h-16 w-16 rounded-full object-cover ring-2 ring-green-500/20 bg-gray-700/40" />
            <div>
              <label class="inline-flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded-md cursor-pointer transition-colors">
                Choose Image
                <input type="file" accept="image/*" data-field="avatar" class="hidden" />
              </label>
              <p class="mt-1 text-[11px] text-gray-400">PNG/JPG up to 2MB</p>
              <button type="button" data-action="view-visitor" class="mt-2 inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md cursor-pointer transition-colors">
                View
              </button>
            </div>
          </div>
        </div>
        <!-- Visitor Name Field -->
        <div class="sm:col-span-2 lg:col-span-1">
          <label class="block text-sm text-gray-300 mb-2 font-medium">Visitor Name *</label>
          <input type="text" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
                 value="${visitor.name || ''}" data-field="name" placeholder="Full name" required />
        </div>
        
        <!-- Relationship Field -->
        <div class="sm:col-span-2 lg:col-span-1">
          <label class="block text-sm text-gray-300 mb-2 font-medium">Relationship *</label>
          <select class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" data-field="relationship" required>
            <option value="">Select relationship</option>
            <option value="Father" ${visitor.relationship === 'Father' ? 'selected' : ''}>Father</option>
            <option value="Mother" ${visitor.relationship === 'Mother' ? 'selected' : ''}>Mother</option>
            <option value="Spouse" ${visitor.relationship === 'Spouse' ? 'selected' : ''}>Spouse</option>
            <option value="Sibling" ${visitor.relationship === 'Sibling' ? 'selected' : ''}>Sibling</option>
            <option value="Child" ${visitor.relationship === 'Child' ? 'selected' : ''}>Child</option>
            <option value="Friend" ${visitor.relationship === 'Friend' ? 'selected' : ''}>Friend</option>
            <option value="Lawyer" ${visitor.relationship === 'Lawyer' ? 'selected' : ''}>Lawyer</option>
            <option value="Other" ${visitor.relationship === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
        
        <!-- Contact Number Field -->
        <div class="sm:col-span-2 lg:col-span-1">
          <label class="block text-sm text-gray-300 mb-2 font-medium">Contact Number</label>
          <div class="relative">
            <input type="tel" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
                   value="${visitor.contactNumber || ''}" data-field="contactNumber" placeholder="+63 9XX XXX XXXX" />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- ID Information Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">ID Type</label>
          <select class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" data-field="idType">
            <option value="">Select ID type</option>
            <option value="Drivers License" ${visitor.idType === 'Drivers License' ? 'selected' : ''}>Drivers License</option>
            <option value="National ID" ${visitor.idType === 'National ID' ? 'selected' : ''}>National ID</option>
            <option value="Passport" ${visitor.idType === 'Passport' ? 'selected' : ''}>Passport</option>
            <option value="Senior Citizen ID" ${visitor.idType === 'Senior Citizen ID' ? 'selected' : ''}>Senior Citizen ID</option>
            <option value="Voters ID" ${visitor.idType === 'Voters ID' ? 'selected' : ''}>Voters ID</option>
            <option value="SSS ID" ${visitor.idType === 'SSS ID' ? 'selected' : ''}>SSS ID</option>
            <option value="Other" ${visitor.idType === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">ID Number</label>
          <input type="text" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
                 value="${visitor.idNumber || ''}" data-field="idNumber" placeholder="ID number" />
        </div>
      </div>

      <!-- Address Field -->
      <div class="mb-4">
        <label class="block text-sm text-gray-300 mb-2 font-medium">Address</label>
        <input type="text" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
               value="${visitor.address || ''}" data-field="address" placeholder="Visitor's address" />
      </div>

      <!-- Visitor Footer with Status -->
      <div class="mt-3 pt-3 border-t border-gray-600">
        <div class="flex items-center justify-between text-xs text-gray-400">
          <span>Visitor #${entryIndex + 1}</span>
          <span class="flex items-center">
            <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Allowed
          </span>
        </div>
      </div>
    `;
    container.appendChild(visitorDiv);

    // Avatar preview handler
    const fileInput = visitorDiv.querySelector('[data-field="avatar"]');
    const previewEl = visitorDiv.querySelector('[data-field="avatarPreview"]');
    if (fileInput && previewEl) {
      fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const src = String(ev.target?.result || '');
          previewEl.setAttribute('src', src);
        };
        reader.readAsDataURL(file);
      });
    }

    // Open Visitor modal from 'View' button or avatar click
    const viewBtn = visitorDiv.querySelector('[data-action="view-visitor"]');
    const openVisitorPreview = () => {
      const data = collectVisitorEntryData(visitorDiv);
      openVisitorModal(data);
    };
    if (viewBtn) viewBtn.addEventListener('click', openVisitorPreview);
    if (previewEl) previewEl.addEventListener('click', openVisitorPreview);
  }

  // Helper function to update visitors empty state visibility
  function updateVisitorsEmptyState() {
    const container = document.getElementById('allowed-visitors-container');
    const emptyState = document.getElementById('visitors-empty-state');
    
    if (container && emptyState) {
      if (container.children.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }
  }

  // Collect a single visitor entry's data from its DOM container
  function collectVisitorEntryData(containerEl) {
    const getVal = (selector) => {
      const el = /** @type {HTMLInputElement|null} */(containerEl.querySelector(selector));
      return el ? el.value : '';
    };
    const previewEl = /** @type {HTMLImageElement|null} */(containerEl.querySelector('[data-field="avatarPreview"]'));
    const avatarDataUrl = previewEl ? String(previewEl.getAttribute('src') || '') : '';
    const avatarInput = /** @type {HTMLInputElement|null} */(containerEl.querySelector('[data-field="avatar"]'));
    const avatarFilename = avatarInput && avatarInput.files && avatarInput.files[0] ? avatarInput.files[0].name : '';

    return {
      name: getVal('[data-field="name"]'),
      relationship: getVal('[data-field\="relationship\"]'),
      idType: getVal('[data-field\="idType\"]'),
      idNumber: getVal('[data-field\="idNumber\"]'),
      contactNumber: getVal('[data-field\="contactNumber\"]'),
      address: getVal('[data-field\="address\"]'),
      avatarFilename: avatarFilename,
      avatarPath: 'images/visitors/profiles',
      avatarDisk: 'public',
      avatarDataUrl: avatarDataUrl
    };
  }

  function collectAllowedVisitors() {
    const container = document.getElementById('allowed-visitors-container');
    if (!container) return [];

    const visitors = [];
    container.querySelectorAll('.bg-gray-800\\/40').forEach(visitorDiv => {
      const name = visitorDiv.querySelector('[data-field="name"]').value;
      const relationship = visitorDiv.querySelector('[data-field="relationship"]').value;
      const idType = visitorDiv.querySelector('[data-field="idType"]').value;
      const idNumber = visitorDiv.querySelector('[data-field="idNumber"]').value;
      const contactNumber = visitorDiv.querySelector('[data-field="contactNumber"]').value;
      const address = visitorDiv.querySelector('[data-field="address"]').value;
      const avatarInput = /** @type {HTMLInputElement|null} */(visitorDiv.querySelector('[data-field="avatar"]'));
      const avatarFilename = avatarInput && avatarInput.files && avatarInput.files[0] ? avatarInput.files[0].name : '';
      const avatarPath = 'images/visitors/profiles';
      const avatarDisk = 'public';
      const previewEl = /** @type {HTMLImageElement|null} */(visitorDiv.querySelector('[data-field="avatarPreview"]'));
      const avatarDataUrl = previewEl ? String(previewEl.getAttribute('src') || '') : '';

      if (name && relationship) {
        visitors.push({
          name: name,
          relationship: relationship,
          idType: idType,
          idNumber: idNumber,
          contactNumber: contactNumber,
          address: address,
          avatarFilename: avatarFilename,
          avatarPath: avatarPath,
          avatarDisk: avatarDisk,
          avatarDataUrl: avatarDataUrl
        });
      }
    });
    return visitors;
  }

  /**
   * Initialize the Visit Records form section.
   * @param {Object} [inmateData] - Optional inmate object to use for populating visit records.
   */
  function initializeVisitRecords(inmateData) {
    const container = document.getElementById('visit-records-container');
    const addBtn = document.getElementById('add-visit-record');
    const emptyState = document.getElementById('visits-empty-state');
    
    if (!container || !addBtn) return;

    // Clear existing entries
    container.innerHTML = '';

    // Load existing visit records
    let existingVisits = [];
    if (inmateData && Array.isArray(inmateData.recentVisits)) {
      existingVisits = inmateData.recentVisits;
    } else if (typeof inmate !== 'undefined' && inmate && Array.isArray(inmate.recentVisits)) {
      existingVisits = inmate.recentVisits;
    }
    
    // Add existing visits
    existingVisits.forEach((visit, index) => {
      addVisitRecord(visit, index);
    });

    // Show/hide empty state
    if (emptyState) {
      if (existingVisits.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }

    // Add button event listener
    addBtn.addEventListener('click', () => {
      addVisitRecord();
    });
  }

  function addVisitRecord(visit = {}, index = null) {
    const container = document.getElementById('visit-records-container');
    const emptyState = document.getElementById('visits-empty-state');
    if (!container) return;

    // Hide empty state when adding visits
    if (emptyState) {
      emptyState.classList.add('hidden');
    }

    const entryIndex = index !== null ? index : container.children.length;
    const visitDiv = document.createElement('div');
    visitDiv.className = 'bg-gray-800/40 rounded-xl p-4 border border-gray-600 hover:bg-gray-800/60 transition-all duration-200 shadow-sm';
    visitDiv.innerHTML = `
      <!-- Visit Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-semibold">${entryIndex + 1}</span>
          </div>
          <h4 class="text-base font-semibold text-gray-200">Visit Record</h4>
        </div>
        <button type="button" class="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md cursor-pointer transition-colors" 
                onclick="this.parentElement.parentElement.remove(); updateVisitsEmptyState();">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Remove
        </button>
      </div>

      <!-- Main Form Grid - Responsive -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <!-- Visit Date Field -->
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">Visit Date *</label>
          <input type="date" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                 value="${visit.date || ''}" data-field="date" required />
        </div>
        
        <!-- Visitor Name Field -->
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">Visitor Name *</label>
          <input type="text" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                 value="${visit.visitor || ''}" data-field="visitor" placeholder="Visitor name" required />
        </div>
        
        <!-- Status Field -->
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">Status *</label>
          <select class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" data-field="status" required>
            <option value="">Select status</option>
            <option value="Approved" ${visit.status === 'Approved' ? 'selected' : ''}>Approved</option>
            <option value="Pending" ${visit.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Denied" ${visit.status === 'Denied' ? 'selected' : ''}>Denied</option>
            <option value="Completed" ${visit.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Cancelled" ${visit.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
      </div>

      <!-- Second Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <!-- Relationship Field -->
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">Relationship</label>
          <select class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" data-field="relationship">
            <option value="">Select relationship</option>
            <option value="Father" ${visit.relationship === 'Father' ? 'selected' : ''}>Father</option>
            <option value="Mother" ${visit.relationship === 'Mother' ? 'selected' : ''}>Mother</option>
            <option value="Spouse" ${visit.relationship === 'Spouse' ? 'selected' : ''}>Spouse</option>
            <option value="Sibling" ${visit.relationship === 'Sibling' ? 'selected' : ''}>Sibling</option>
            <option value="Child" ${visit.relationship === 'Child' ? 'selected' : ''}>Child</option>
            <option value="Friend" ${visit.relationship === 'Friend' ? 'selected' : ''}>Friend</option>
            <option value="Lawyer" ${visit.relationship === 'Lawyer' ? 'selected' : ''}>Lawyer</option>
            <option value="Other" ${visit.relationship === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
        
        <!-- Duration Field -->
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">Duration (minutes)</label>
          <div class="relative">
            <input type="number" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                   value="${visit.duration || ''}" data-field="duration" placeholder="30" min="1" max="120" />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <span class="text-gray-400 text-xs">min</span>
            </div>
          </div>
        </div>
        
        <!-- Purpose Field -->
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">Purpose</label>
          <select class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" data-field="purpose">
            <option value="">Select purpose</option>
            <option value="Family visit" ${visit.purpose === 'Family visit' ? 'selected' : ''}>Family visit</option>
            <option value="Legal consultation" ${visit.purpose === 'Legal consultation' ? 'selected' : ''}>Legal consultation</option>
            <option value="Medical consultation" ${visit.purpose === 'Medical consultation' ? 'selected' : ''}>Medical consultation</option>
            <option value="Religious visit" ${visit.purpose === 'Religious visit' ? 'selected' : ''}>Religious visit</option>
            <option value="Emergency" ${visit.purpose === 'Emergency' ? 'selected' : ''}>Emergency</option>
            <option value="Other" ${visit.purpose === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>

      <!-- Third Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">Officer in Charge</label>
          <div class="relative">
            <input type="text" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                   value="${visit.officerInCharge || ''}" data-field="officerInCharge" placeholder="Officer name" />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">Visit Time</label>
          <input type="time" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                 value="${visit.time || ''}" data-field="time" />
        </div>
      </div>

      <!-- Notes Section -->
      <div class="mb-4">
        <label class="block text-sm text-gray-300 mb-2 font-medium">Additional Notes</label>
        <textarea class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none" 
                  rows="3" data-field="notes" placeholder="Additional details about the visit...">${visit.notes || ''}</textarea>
      </div>

      <!-- Visit Footer with Status -->
      <div class="mt-3 pt-3 border-t border-gray-600">
        <div class="flex items-center justify-between text-xs text-gray-400">
          <span>Visit #${entryIndex + 1}</span>
          <span class="flex items-center">
            <div class="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            ${visit.status || 'Pending'}
          </span>
        </div>
      </div>
    `;
    container.appendChild(visitDiv);
  }

  // Helper function to update visits empty state visibility
  function updateVisitsEmptyState() {
    const container = document.getElementById('visit-records-container');
    const emptyState = document.getElementById('visits-empty-state');
    
    if (container && emptyState) {
      if (container.children.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }
  }

  function collectVisitRecords() {
    const container = document.getElementById('visit-records-container');
    if (!container) return [];

    const visits = [];
    container.querySelectorAll('.bg-gray-800\\/40').forEach(visitDiv => {
      const date = visitDiv.querySelector('[data-field="date"]').value;
      const visitor = visitDiv.querySelector('[data-field="visitor"]').value;
      const relationship = visitDiv.querySelector('[data-field="relationship"]').value;
      const status = visitDiv.querySelector('[data-field="status"]').value;
      const purpose = visitDiv.querySelector('[data-field="purpose"]').value;
      const duration = visitDiv.querySelector('[data-field="duration"]').value;
      const officerInCharge = visitDiv.querySelector('[data-field="officerInCharge"]').value;
      const time = visitDiv.querySelector('[data-field="time"]').value;
      const notes = visitDiv.querySelector('[data-field="notes"]').value;

      if (date && visitor) {
        visits.push({
          date: date,
          visitor: visitor,
          relationship: relationship,
          status: status,
          purpose: purpose,
          duration: duration ? parseInt(duration) : null,
          officerInCharge: officerInCharge,
          time: time,
          notes: notes
        });
      }
    });
    return visits;
  }

  // Update both desktop and mobile views
  async function renderOrUpdateViews(inmate) {
    updateDesktopRow(inmate);
    updateMobileCard(inmate);
    updateStatistics();
  }

  // Handle desktop table row updates
  function updateDesktopRow(inmate) {
    if (!tableBody) return;
    
    let row = tableBody.querySelector(`tr[data-row-id="${inmate.id}"]`);
    const statusClass = getStatusClass(inmate.status);

    if (!row) {
      row = document.createElement('tr');
      row.setAttribute('data-row-id', String(inmate.id));
      row.className = 'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors';
      row.innerHTML = `
        <td class="px-4 py-3 whitespace-nowrap">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-full bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/>
                <path d="M2 22s4-4 10-4 10 4 10 4-4 2-10 2-10-2-10-2z"/>
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-50 cursor-pointer hover:underline" data-i-name data-inmate-id="${inmate.id}"></div>
              <div class="text-xs text-gray-500 dark:text-gray-400" data-i-details></div>
            </div>
          </div>
        </td>
        <td class="px-4 py-3">
          <div class="font-medium text-red-500" data-i-crime></div>
          <div class="text-xs text-gray-500 dark:text-gray-400" data-i-sentence></div>
        </td>
        <td class="px-4 py-3">
          <div class="font-medium text-yellow-500" data-i-cell></div>
          <div class="text-xs text-gray-500 dark:text-gray-400" data-i-admission></div>
        </td>
        <td class="px-4 py-3">
          <span data-i-status class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px]"></span>
        </td>
        <td class="px-4 py-3 text-right">
          <div class="flex items-center gap-1 justify-end ml-auto">
            <button type="button" data-edit-inmate class="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded-md transition-colors cursor-pointer" aria-label="Edit inmate">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                <path d="M16 5l3 3" />
              </svg>
            </button>
            <button type="button" data-delete-inmate class="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-md transition-colors cursor-pointer" aria-label="Delete inmate">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    }

    // Update row content
    row.querySelector('[data-i-name]').textContent = `${inmate.firstName} ${inmate.lastName}`;
    row.querySelector('[data-i-details]').textContent = `${inmate.gender}, ${inmate.age} years old`;
    const dobEl = row.querySelector('[data-i-dob]');
    const addrEl = row.querySelector('[data-i-address]');
    if (dobEl) dobEl.textContent = `DOB: ${formatDate(inmate.dateOfBirth)}`;
    if (addrEl) addrEl.textContent = `Address: ${formatAddress(inmate)}`;
    row.querySelector('[data-i-crime]').textContent = inmate.crime;
    row.querySelector('[data-i-sentence]').textContent = inmate.sentence;
    const cellName = inmate.cell ? inmate.cell.name : 'Not Assigned';
    row.querySelector('[data-i-cell]').textContent = cellName;
    row.querySelector('[data-i-admission]').textContent = formatDate(inmate.admissionDate);
    const statusEl = row.querySelector('[data-i-status]');
    statusEl.textContent = inmate.status;
    statusEl.className = `inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${statusClass}`;

    // Add event listeners
    const editBtn = row.querySelector('[data-edit-inmate]');
    const deleteBtn = row.querySelector('[data-delete-inmate]');
    const nameBtn = row.querySelector('[data-i-name]');
    
    editBtn.onclick = async () => {
      const oldStatus = inmate.status;
      const { value } = await openInmateModal(inmate);
      if (value) {
        try {
          // Transform form data to API format
          const apiData = inmateApi.transformFormData(value);
          
          // Update inmate via API
          const response = await inmateApi.update(inmate.id, apiData);
          
          if (response.success) {
            const updatedInmate = response.data;
            const newStatus = updatedInmate.status;
            const oldCellId = inmate.cell_id;
            const newCellId = updatedInmate.cell_id;
            
            // Update local data
            const oldInmate = { ...inmate };
            Object.assign(inmate, updatedInmate);
            
            // Handle cell transfer with counter manager
            if (oldCellId !== newCellId || oldStatus !== newStatus) {
              try {
                // Sync occupancy for affected cells after inmate update
                const cellsToSync = [];
                if (oldCellId) cellsToSync.push(oldCellId);
                if (newCellId && newCellId !== oldCellId) cellsToSync.push(newCellId);
                
                // Sync all affected cells
                for (const cellId of cellsToSync) {
                  await cellCounterManager.syncCellOccupancy(cellId);
                }
              } catch (error) {
                console.error('Failed to sync cell counter:', error);
                // Continue with inmate update even if counter update fails
              }
            }
            
            // Refresh cell data from backend to ensure accuracy
            await refreshCellData();

            // Ensure cells grid reflects latest counts immediately
            await renderCells();
            
            // Update statistics if status changed
            if (oldStatus !== newStatus && statusCounter) {
              statusCounter.updateInmateStatus(inmate, oldStatus, newStatus);
            }
            
            renderOrUpdateViews(inmate);
            showSuccessMessage('Inmate updated successfully');
            
            // TASK 2: Auto-reload page after successful edit operation
            autoReloadPage();
          } else {
            throw new Error(response.message || 'Failed to update inmate');
          }
        } catch (error) {
          console.error('Error updating inmate:', error);
          showErrorMessage('Failed to update inmate: ' + error.message);
        }
      }
    };
    
    deleteBtn.onclick = async () => {
      const result = await window.Swal.fire({
        title: 'Delete Inmate',
        text: `Are you sure you want to delete ${inmate.firstName} ${inmate.lastName}?`,
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
        try {
          const response = await inmateApi.delete(inmate.id);
          
          if (response.success) {
            await deleteInmate(inmate.id);
            showSuccessMessage('Inmate deleted successfully');
          } else {
            throw new Error(response.message || 'Failed to delete inmate');
          }
        } catch (error) {
          console.error('Error deleting inmate:', error);
          showErrorMessage('Failed to delete inmate: ' + error.message);
        }
      }
    };

    // Add click listener for inmate name
    nameBtn.onclick = () => {
      openUnifiedInmateModal(inmate);
    };
  }

  // Handle mobile card updates
  function updateMobileCard(inmate) {
    if (!mobileCardsContainer) return;
    
    let card = mobileCardsContainer.querySelector(`[data-card-id="${inmate.id}"]`);
    const statusClass = getStatusClass(inmate.status);

    if (!card) {
      card = document.createElement('div');
      card.className = 'p-4 space-y-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800';
      card.setAttribute('data-card-id', String(inmate.id));
      card.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/>
                <path d="M2 22s4-4 10-4 10 4 10 4-4 2-10 2-10-2-10-2z"/>
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-50 cursor-pointer hover:underline" data-i-name data-inmate-id="${inmate.id}"></div>
              <div class="text-xs text-gray-500 dark:text-gray-400" data-i-details></div>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button type="button" data-edit-inmate 
              class="bg-blue-50 dark:bg-blue-900/20 text-blue-500 p-2 rounded-md cursor-pointer" 
              aria-label="Edit inmate">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                <path d="M16 5l3 3" />
              </svg>
            </button>
            <button type="button" data-delete-inmate 
              class="bg-red-50 dark:bg-red-900/20 text-red-500 p-2 rounded-md cursor-pointer" 
              aria-label="Delete inmate">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
        <div class="mt-2 pl-13 space-y-2">
          <div class="flex justify-between items-center">
            <div>
              <div class="font-medium text-red-500" data-i-crime></div>
              <div class="text-xs text-gray-500 dark:text-gray-400" data-i-sentence></div>
            </div>
            <span data-i-status class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"></span>
          </div>
          <div class="flex justify-between items-center text-sm">
              <div class="font-medium text-yellow-500" data-i-cell></div>
              <div class="text-xs text-gray-500 dark:text-gray-400" data-i-admission></div>
          </div>
        </div>
      `;
      mobileCardsContainer.appendChild(card);
    }

    // Update card content
    card.querySelector('[data-i-name]').textContent = `${inmate.firstName} ${inmate.lastName}`;
    card.querySelector('[data-i-details]').textContent = `${inmate.gender}, ${inmate.age} years old`;
    card.querySelector('[data-i-crime]').textContent = inmate.crime;
    card.querySelector('[data-i-sentence]').textContent = inmate.sentence;
    const cellName = inmate.cell ? inmate.cell.name : 'Not Assigned';
    card.querySelector('[data-i-cell]').textContent = cellName;
    card.querySelector('[data-i-admission]').textContent = formatDate(inmate.admissionDate);
    const statusEl = card.querySelector('[data-i-status]');
    statusEl.textContent = inmate.status;
    statusEl.className = `inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusClass}`;

    // Add event listeners
    const editBtn = card.querySelector('[data-edit-inmate]');
    const deleteBtn = card.querySelector('[data-delete-inmate]');
    const nameBtn = card.querySelector('[data-i-name]');
    
    editBtn.onclick = async () => {
      const oldStatus = inmate.status;
      const { value } = await openInmateModal(inmate);
      if (value) {
        try {
          // Transform form data to API format
          const apiData = inmateApi.transformFormData(value);
          
          // Update inmate via API
          const response = await inmateApi.update(inmate.id, apiData);
          
          if (response.success) {
            const updatedInmate = response.data;
            const newStatus = updatedInmate.status;
            const oldCellId = inmate.cell_id;
            const newCellId = updatedInmate.cell_id;
            
            // Update local data
            const oldInmate = { ...inmate };
            Object.assign(inmate, updatedInmate);
            
            // Handle cell transfer with counter manager
            if (oldCellId !== newCellId || oldStatus !== newStatus) {
              try {
                // Sync occupancy for affected cells after inmate update
                const cellsToSync = [];
                if (oldCellId) cellsToSync.push(oldCellId);
                if (newCellId && newCellId !== oldCellId) cellsToSync.push(newCellId);
                
                // Sync all affected cells
                for (const cellId of cellsToSync) {
                  await cellCounterManager.syncCellOccupancy(cellId);
                }
              } catch (error) {
                console.error('Failed to sync cell counter:', error);
                // Continue with inmate update even if counter update fails
              }
            }
            
            // Refresh cell data from backend to ensure accuracy
            await refreshCellData();

            // Ensure cells grid reflects latest counts immediately
            await renderCells();
            
            // Update statistics if status changed
            if (oldStatus !== newStatus && statusCounter) {
              statusCounter.updateInmateStatus(inmate, oldStatus, newStatus);
            }
            
            renderOrUpdateViews(inmate);
            showSuccessMessage('Inmate updated successfully');
            
            // TASK 2: Auto-reload page after successful edit operation
            autoReloadPage();
          } else {
            throw new Error(response.message || 'Failed to update inmate');
          }
        } catch (error) {
          console.error('Error updating inmate:', error);
          showErrorMessage('Failed to update inmate: ' + error.message);
        }
      }
    };
    
    deleteBtn.onclick = async () => {
      const result = await window.Swal.fire({
        title: 'Delete Inmate',
        text: `Are you sure you want to delete ${inmate.firstName} ${inmate.lastName}?`,
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
        try {
          const response = await inmateApi.delete(inmate.id);
          
          if (response.success) {
            await deleteInmate(inmate.id);
            showSuccessMessage('Inmate deleted successfully');
          } else {
            throw new Error(response.message || 'Failed to delete inmate');
          }
        } catch (error) {
          console.error('Error deleting inmate:', error);
          showErrorMessage('Failed to delete inmate: ' + error.message);
        }
      }
    };

    // Add click listener for inmate name
    nameBtn.onclick = () => {
      openUnifiedInmateModal(inmate);
    };
  }

  // Helper functions
  function getStatusClass(status) {
    switch (status) {
      case 'Active': return 'bg-green-500/10 text-green-500';
      case 'Released': return 'bg-blue-500/10 text-blue-500';
      case 'Transferred': return 'bg-yellow-500/10 text-yellow-500';
      case 'Medical': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  async function updateCellCounts() {
    // Reset all cell counts
    cells.forEach(cell => cell.currentCount = 0);
    
    // Count inmates per cell
    inmates.forEach(inmate => {
      if (inmate.status === 'Active') {
        const cell = cells.find(c => c.name === inmate.cellNumber);
        if (cell) cell.currentCount++;
      }
    });
    
    // Re-render cells
    await renderCells();
  }

  async function deleteInmate(id) {
    const inmateToDelete = inmates.find(inmate => inmate.id === id);
    inmates = inmates.filter(inmate => inmate.id !== id);
    
    // Refresh cell data from backend to ensure accuracy
    await refreshCellData();

    // Ensure cells grid reflects latest counts immediately
    await renderCells();
    
    // Update statistics
    if (inmateToDelete && statusCounter) {
      statusCounter.removeInmate(inmateToDelete);
    }
    
    // Remove from UI
    const row = tableBody?.querySelector(`tr[data-row-id="${id}"]`);
    const card = mobileCardsContainer?.querySelector(`[data-card-id="${id}"]`);
    
    if (row) row.remove();
    if (card) card.remove();
  }

  function showSuccessMessage(message) {
    window.Swal.fire({
      icon: 'success',
      title: message,
      timer: 1500,
      showConfirmButton: false,
      background: '#111827',
      color: '#F9FAFB',
      width: isMobile() ? '90%' : '32rem',
    });
  }

  function showErrorMessage(message) {
    window.Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonText: 'OK',
      background: '#111827',
      color: '#F9FAFB',
      width: isMobile() ? '90%' : '32rem',
    });
  }

  // Update statistics display
  function updateStatistics() {
    // Update status counter with current inmates data
    if (statusCounter && statusCounter.isReady()) {
      statusCounter.updateFromInmates(inmates);
    }
  }

// ========================================
// UNIFIED INMATE MODAL (SweetAlert2 + Tailwind, responsive)
// ========================================
function openUnifiedInmateModal(inmate) {
  const width = isMobile() ? '98vw' : '64rem';
  const avatar = inmateAvatarHTML(inmate);
  const name = fullName(inmate);
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'medical', label: 'Medical' },
    { id: 'points', label: 'Points' },
    { id: 'visitation', label: 'Visitation' },
  ];

  const navHTML = `
    <nav class="flex flex-wrap gap-2 sm:gap-3 border-b border-gray-200 dark:border-gray-800 mb-4 justify-start lg:justify-end">
      ${tabs.map(t => `
        <button data-tab="${t.id}" class="px-3 py-2 text-xs sm:text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 data-[active=true]:bg-blue-600 data-[active=true]:text-white cursor-pointer">
          ${t.label}
        </button>
      `).join('')}
    </nav>
  `;

  // Map status to consistent badge styles
  function getStatusBadgeClasses(status) {
    switch (status) {
      case 'Active':
        return 'bg-green-500 text-white';
      case 'Released':
        return 'bg-blue-500 text-white';
      case 'Transferred':
        return 'bg-amber-500 text-white';
      case 'Medical':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-300 text-gray-800';
    }
  }

  const overviewHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <!-- Desktop: Profile Card -->
        <div class="hidden lg:flex flex-col items-center w-full">
          <div class="flex items-center justify-center mb-4">
            <div class="rounded-full bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 shadow-lg shadow-blue-200/60 p-1">
              <img 
                src="${inmate.avatarUrl || '/images/logo/logo-temp_round.png'}" 
                alt="${name}'s avatar" 
                class="h-28 w-28 object-cover rounded-full border-4 border-white shadow-md"
                loading="lazy"
              />
        </div>
        </div>
          <div class="flex flex-col items-center w-full">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white mt-2">${name}</h2>
            <span 
              class="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(inmate.status)}"
              aria-label="Inmate status: ${inmate.status || 'Unknown'}"
            >
              ${inmate.status || '—'}
            </span>
      </div>
        </div>
        <!-- Mobile/Tablet: Stacked Profile Card -->
        <div class="flex flex-col items-center lg:hidden gap-2">
          <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden ring-2 ring-blue-200 bg-blue-100 flex items-center justify-center mb-2">
            <img 
              src="${inmate.avatarUrl || '/images/logo/logo-temp_round.png'}" 
              alt="${name}'s avatar" 
              class="w-full h-full object-cover rounded-full border-4 border-white shadow"
              loading="lazy"
            />
          </div>
          <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">${name}</h2>
          <span 
            class="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(inmate.status)}"
            aria-label="Inmate status: ${inmate.status || 'Unknown'}"
          >
            ${inmate.status || '—'}
          </span>
        </div>
      </div>
      <div class="lg:col-span-2 space-y-4">
        <!-- Basic Information (accordion) -->
        <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <button data-accordion-toggle="basic" class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg cursor-pointer">
            <span>Basic Information</span>
            <svg class="h-4 w-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
          </button>
          <div data-accordion-panel="basic" class="px-4 py-4 border-t border-gray-200 dark:border-gray-800 hidden lg:block">
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt class="text-gray-500 dark:text-gray-400">DOB</dt><dd class="text-gray-900 dark:text-gray-200">${formatDate(inmate.dateOfBirth)}</dd>
              <dt class="text-gray-500 dark:text-gray-400">Age</dt><dd class="text-gray-900 dark:text-gray-200">${inmate.age}</dd>
              <dt class="text-gray-500 dark:text-gray-400">Gender</dt><dd class="text-gray-900 dark:text-gray-200">${inmate.gender}</dd>
              <dt class="text-gray-500 dark:text-gray-400">Address</dt><dd class="text-gray-900 dark:text-gray-200">${formatAddress(inmate) || '—'}</dd>
            </dl>
          </div>
        </div>
        <!-- Legal & Assignment (accordion) -->
        <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <button data-accordion-toggle="legal" class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg cursor-pointer">
            <span>Legal & Assignment</span>
            <svg class="h-4 w-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
          </button>
          <div data-accordion-panel="legal" class="px-4 py-4 border-t border-gray-200 dark:border-gray-800 hidden lg:block">
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt class="text-gray-500 dark:text-gray-400">Admission Date</dt><dd class="text-gray-900 dark:text-gray-200">${formatDate(inmate.admissionDate)}</dd>
              <dt class="text-gray-500 dark:text-gray-400">Work / Job</dt><dd class="text-gray-900 dark:text-gray-200">${inmate.job || '—'}</dd>
              <dt class="text-gray-500 dark:text-gray-400">Crime Committed</dt><dd class="text-gray-900 dark:text-gray-200">${inmate.crime}</dd>
              <dt class="text-gray-500 dark:text-gray-400">Sentence</dt><dd class="text-gray-900 dark:text-gray-200">${inmate.sentence}</dd>
              <dt class="text-gray-500 dark:text-gray-400">Cell Assignment</dt><dd class="text-gray-900 dark:text-gray-200">${inmate.cell ? `${inmate.cell.name} (${inmate.cell.location || 'Location N/A'})` : 'Not Assigned'}</dd>
              <dt class="text-gray-500 dark:text-gray-400">Additional</dt><dd class="text-gray-900 dark:text-gray-200">ID #${inmate.id.toString().padStart(4,'0')} • ${daysInCustody(inmate)} days in custody</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  `;

  const medicalHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <!-- Desktop: Profile Card -->
        <div class="hidden lg:flex flex-col items-center w-full">
          <div class="flex items-center justify-center mb-4">
            <div class="rounded-full bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 shadow-lg shadow-blue-200/60 p-1">
              <img 
                src="${inmate.avatarUrl || '/images/logo/logo-temp_round.png'}" 
                alt="${name}'s avatar" 
                class="h-28 w-28 object-cover rounded-full border-4 border-white shadow-md"
                loading="lazy"
              />
            </div>
          </div>
          <div class="flex flex-col items-center w-full">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white mt-2">${name}</h2>
            <span 
              class="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(inmate.status)}"
              aria-label="Inmate status: ${inmate.status || 'Unknown'}"
            >
              ${inmate.status || '—'}
            </span>
          </div>
        </div>
        <!-- Mobile/Tablet: Stacked Profile Card -->
        <div class="flex flex-col items-center lg:hidden gap-2">
          <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden ring-2 ring-blue-200 bg-blue-100 flex items-center justify-center mb-2">
            <img 
              src="${inmate.avatarUrl || '/images/logo/logo-temp_round.png'}" 
              alt="${name}'s avatar" 
              class="w-full h-full object-cover rounded-full border-4 border-white shadow"
              loading="lazy"
            />
          </div>
          <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">${name}</h2>
          <span 
            class="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(inmate.status)}"
            aria-label="Inmate status: ${inmate.status || 'Unknown'}"
          >
            ${inmate.status || '—'}
          </span>
        </div>
      </div>
      <div class="lg:col-span-2 space-y-4">
        <div class="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Medical Information</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500 dark:text-gray-400">Medical Status:</span>
              <span class="text-gray-900 dark:text-gray-200">${inmate.medicalStatus || 'Not Assessed'}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Last Check:</span>
              <span class="text-gray-900 dark:text-gray-200">${inmate.lastMedicalCheck ? formatDate(inmate.lastMedicalCheck) : 'Not available'}</span>
            </div>
          </div>
          ${inmate.medicalNotes ? `
            <div class="mt-3">
              <span class="text-gray-500 dark:text-gray-400 text-sm">Notes:</span>
              <p class="text-gray-900 dark:text-gray-200 text-sm mt-1">${inmate.medicalNotes}</p>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  // Helpers for Points & Visitation data (updated to use new field names)
  function getPointsTotal(i) {
    return (i.currentPoints ?? i.pointsTotal ?? 0);
  }
  function getPointsHistory(i) {
    return Array.isArray(i.pointsHistory) ? i.pointsHistory : [];
  }
  function getAllowedVisitors(i) {
    return Array.isArray(i.allowedVisitors) ? i.allowedVisitors : [];
  }
  function getRecentVisits(i) {
    return Array.isArray(i.recentVisits) ? i.recentVisits : [];
  }

  const pointsTotal = getPointsTotal(inmate);
  const pointsRows = getPointsHistory(inmate).map(p => `
      <tr class="border-b border-gray-100 dark:border-gray-800">
        <td class="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-gray-200">${formatDate(p.date)}</td>
        <td class="px-3 py-2 min-w-40 text-gray-700 dark:text-gray-300">${p.activity || '—'}</td>
        <td class="px-3 py-2 text-right font-semibold ${p.points >= 0 ? 'text-green-600' : 'text-red-500'}">${p.points}</td>
        <td class="px-3 py-2 text-gray-500 dark:text-gray-400">${p.note || ''}</td>
      </tr>
  `).join('');
  const pointsListItems = getPointsHistory(inmate).map(p => `
    <li class="rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-900">
      <div class="flex items-center justify-between">
        <div class="text-sm font-medium text-gray-900 dark:text-gray-200">${formatDate(p.date)}</div>
        <div class="text-sm font-semibold ${p.points >= 0 ? 'text-green-600' : 'text-red-500'}">${p.points}</div>
      </div>
      <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">${p.activity || '—'}</div>
      ${p.note ? `<div class="mt-1 text-xs text-gray-400 dark:text-gray-500">${p.note}</div>` : ''}
    </li>
  `).join('');
  const pointsHTML = `
     <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <!-- Desktop: Profile Card -->
        <div class="hidden lg:flex flex-col items-center w-full">
          <div class="flex items-center justify-center mb-4">
            <div class="rounded-full bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 shadow-lg shadow-blue-200/60 p-1">
              <img 
                src="${inmate.avatarUrl || '/images/logo/logo-temp_round.png'}" 
                alt="${name}'s avatar" 
                class="h-28 w-28 object-cover rounded-full border-4 border-white shadow-md"
                loading="lazy"
              />
        </div>
        </div>
          <div class="flex flex-col items-center w-full">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white mt-2">${name}</h2>
            <span 
              class="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(inmate.status)}"
              aria-label="Inmate status: ${inmate.status || 'Unknown'}"
            >
              ${inmate.status || '—'}
            </span>
      </div>
        </div>
        <!-- Mobile/Tablet: Stacked Profile Card -->
        <div class="flex flex-col items-center lg:hidden gap-2">
          <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden ring-2 ring-blue-200 bg-blue-100 flex items-center justify-center mb-2">
            <img 
              src="${inmate.avatarUrl || '/images/logo/logo-temp_round.png'}" 
              alt="${name}'s avatar" 
              class="w-full h-full object-cover rounded-full border-4 border-white shadow"
              loading="lazy"
            />
          </div>
          <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">${name}</h2>
          <span 
            class="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(inmate.status)}"
            aria-label="Inmate status: ${inmate.status || 'Unknown'}"
          >
            ${inmate.status || '—'}
          </span>
        </div>
      </div>
      <div class="lg:col-span-2 space-y-4">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Points Summary</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">Cumulative points based on activities</p>
      </div>
          <div class="text-right">
            <div class="text-2xl font-bold ${pointsTotal >= 0 ? 'text-green-600' : 'text-red-500'}">${pointsTotal}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Total Points</div>
          </div>
        </div>
        <div class="mt-3 w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
          <div class="h-2 bg-blue-500" style="width: ${Math.min(Math.max(pointsTotal, 0), 100)}%"></div>
        </div>
      </div>
      <!-- Mobile list -->
      <div class="sm:hidden">
        <ul class="space-y-3">
          ${pointsListItems || `<li class=\"px-3 py-6 text-center text-gray-500 dark:text-gray-400\">No points recorded</li>`}
        </ul>
      </div>
      <!-- Desktop table -->
      <div class="hidden sm:block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Date</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Activity</th>
                <th class="px-3 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">Points</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Note</th>
              </tr>
            </thead>
            <tbody>
              ${pointsRows || `<tr><td colspan=\"4\" class=\"px-3 py-6 text-center text-gray-500 dark:text-gray-400\">No points recorded</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const allowedVisitors = getAllowedVisitors(inmate);
  const visits = getRecentVisits(inmate);
  const allowedList = allowedVisitors.map((v, idx) => `
    <li class="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div class="min-w-0 flex-1">
        <button type="button" data-open-visitor="${idx}" class="truncate text-left text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 cursor-pointer">${v.name}</button>
        <p class="truncate text-xs text-gray-500 dark:text-gray-400">${v.relationship || '—'}${v.idType ? ` • ${v.idType}` : ''}${v.idNumber ? ` (${v.idNumber})` : ''}</p>
        ${v.contactNumber ? `<p class="truncate text-xs text-gray-400 dark:text-gray-500">📞 ${v.contactNumber}</p>` : ''}
        ${v.address ? `<p class="truncate text-xs text-gray-400 dark:text-gray-500">📍 ${v.address}</p>` : ''}
      </div>
      <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] bg-green-500/10 text-green-600">Allowed</span>
    </li>
  `).join('');
  const visitsCards = visits.map(v => `
    <div class="rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-900">
      <div class="flex items-center justify-between">
        <div class="text-sm font-medium text-gray-900 dark:text-gray-200">${v.visitor}</div>
        <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${v.status === 'Approved' ? 'bg-green-500/10 text-green-600' : v.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' : v.status === 'Completed' ? 'bg-blue-500/10 text-blue-600' : v.status === 'Cancelled' ? 'bg-gray-500/10 text-gray-600' : 'bg-red-500/10 text-red-600'}">${v.status || '—'}</span>
      </div>
      <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">${formatDate(v.date)}${v.relationship ? ` • ${v.relationship}` : ''}</div>
      ${v.purpose ? `<div class=\"mt-2 text-sm text-gray-700 dark:text-gray-300\">${v.purpose}</div>` : ''}
      <div class="mt-2 flex text-xs text-gray-400 dark:text-gray-500 gap-4">
        ${v.duration ? `<span>⏱ ${v.duration} min</span>` : ''}
      </div>
    </div>
  `).join('');
  const visitsRows = visits.map(v => `
    <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td class="px-3 py-2 whitespace-nowrap text-sm">${formatDate(v.date)}</td>
      <td class="px-3 py-2 text-sm">${v.visitor}</td>
      <td class="px-3 py-2 text-sm">${v.relationship || '—'}</td>
      <td class="px-3 py-2 text-sm">${v.purpose || '—'}</td>
      <td class="px-3 py-2 text-sm">${v.duration ? `${v.duration} min` : '—'}</td>
      <td class="px-3 py-2">
        <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${v.status === 'Approved' ? 'bg-green-500/10 text-green-600' : v.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' : v.status === 'Completed' ? 'bg-blue-500/10 text-blue-600' : v.status === 'Cancelled' ? 'bg-gray-500/10 text-gray-600' : 'bg-red-500/10 text-red-600'}">${v.status || '—'}</span>
      </td>
    </tr>
  `).join('');
  const visitationHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1 rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Allowed Visitors</h3>
        <ul class="space-y-3">
          ${allowedList || '<li class="text-sm text-gray-500 dark:text-gray-400">No allowed visitors configured</li>'}
        </ul>
      </div>
      <div class="lg:col-span-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div class="p-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Visits</h3>
        </div>
        <!-- Mobile cards -->
        <div class="sm:hidden p-4 pt-0 space-y-3">
          ${visitsCards || `<div class=\"text-sm text-gray-500 dark:text-gray-400\">No visit records</div>`}
        </div>
        <!-- Desktop table -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Date</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Visitor</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Relationship</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Purpose</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Duration</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              ${visitsRows || `<tr><td colspan=\"6\" class=\"px-3 py-6 text-center text-gray-500 dark:text-gray-400\">No visit records</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  function attachAccordionHandlers() {
    const toggles = document.querySelectorAll('[data-accordion-toggle]');
    toggles.forEach((btn) => {
      const id = btn.getAttribute('data-accordion-toggle');
      const panel = document.querySelector(`[data-accordion-panel="${id}"]`);
      if (!panel) return;
      btn.addEventListener('click', () => {
        // Toggle only affects mobile/tablet. On lg screens, the "lg:block" ensures visibility.
        panel.classList.toggle('hidden');
      });
    });
  }

  function attachVisitorModalHandlers() {
    const nodes = document.querySelectorAll('[data-open-visitor]');
    nodes.forEach((el) => {
      el.addEventListener('click', () => {
        const idxStr = el.getAttribute('data-open-visitor') || '-1';
        const idx = parseInt(idxStr, 10);
        if (!Number.isNaN(idx) && idx >= 0 && idx < allowedVisitors.length) {
          openVisitorModal(allowedVisitors[idx]);
        }
      });
    });
  }

  // Custom close button (SVG X) for top-right
  const closeBtnHTML = `
    <button type="button"
      id="swal-custom-close"
      class="absolute top-3 right-3 z-50 rounded-full p-2 bg-transparent text-gray-400 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer transition"
      aria-label="Close"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l8 8M6 14L14 6" />
      </svg>
    </button>
  `;

  const html = `
    ${closeBtnHTML}
    ${navHTML}
    <div id="tab-content" class="space-y-4 max-h-[70vh] overflow-y-auto scrollbar-none">${overviewHTML}</div>
  `;

  return window.Swal.fire({
    title: `<span class="hidden">Inmate</span>`,
    html,
    width,
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
      // Attach close handler to custom close button
      const closeBtn = document.getElementById('swal-custom-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          window.Swal.close();
        });
      }
      const container = document.getElementById('tab-content');
      const setActive = (id) => {
        document.querySelectorAll('button[data-tab]').forEach((btn) => {
          const isActive = btn.getAttribute('data-tab') === id;
          btn.setAttribute('data-active', String(isActive));
        });
        if (!container) return;
        if (id === 'overview') container.innerHTML = overviewHTML;
        if (id === 'medical') container.innerHTML = medicalHTML;
        if (id === 'points') container.innerHTML = pointsHTML;
        if (id === 'visitation') container.innerHTML = visitationHTML;
        if (id === 'overview') attachAccordionHandlers();
        if (id === 'visitation') attachVisitorModalHandlers();
      };
      document.querySelectorAll('button[data-tab]').forEach((btn, idx) => {
        btn.addEventListener('click', () => setActive(btn.getAttribute('data-tab')));
        if (idx === 0) btn.setAttribute('data-active', 'true');
      });
      setActive('overview');
    }
  });
}

// ===============================
// VISITOR INFO MODAL (SweetAlert2)
// ===============================
function openVisitorModal(visitor) {
  const width = isMobile() ? '95vw' : '32rem';
  const avatarSrc = (() => {
    if (visitor && typeof visitor.avatarDataUrl === 'string' && visitor.avatarDataUrl) return visitor.avatarDataUrl;
    return '/images/logo/logo-temp_round.png';
  })();

  const name = visitor?.name || 'Visitor';
  const relationship = visitor?.relationship || '—';
  const idType = visitor?.idType || '';
  const idNumber = visitor?.idNumber || '';
  const contactNumber = visitor?.contactNumber || '';
  const address = visitor?.address || '';

  const headerHTML = `
    <div class="flex items-start gap-4">
      <div class="shrink-0">
        <img src="${avatarSrc}" alt="${name}" class="h-20 w-20 rounded-full object-cover ring-2 ring-blue-500/20 bg-gray-700/40 cursor-pointer" />
      </div>
      <div class="min-w-0">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-100">${name}</h2>
        <p class="mt-1 text-xs sm:text-sm text-gray-400">${relationship}${idType ? ` • ${idType}` : ''}${idNumber ? ` (${idNumber})` : ''}</p>
      </div>
    </div>
  `;

  const bodyHTML = `
    <div class="mt-4 grid grid-cols-1 gap-3">
      <div class="rounded-lg border border-gray-700 bg-gray-800/50 p-3 sm:p-4">
        <h3 class="text-sm font-semibold text-gray-200 mb-2">Contact</h3>
        <div class="text-sm text-gray-300 space-y-1">
          <div>${contactNumber ? `📞 ${contactNumber}` : '—'}</div>
          <div class="break-words">${address ? `📍 ${address}` : '—'}</div>
        </div>
      </div>
    </div>
  `;

  const html = `
    <div class="max-h-[70vh] overflow-y-auto space-y-4">
      ${headerHTML}
      ${bodyHTML}
    </div>
  `;

  return window.Swal.fire({
    title: `<span class="hidden">Visitor</span>`,
    html,
    width,
    padding: isMobile() ? '0.75rem' : '1.25rem',
    showCancelButton: false,
    showConfirmButton: true,
    confirmButtonText: 'Close',
    confirmButtonColor: '#3B82F6',
    background: '#111827',
    color: '#F9FAFB',
    customClass: {
      container: 'swal-responsive-container',
      popup: 'swal-responsive-popup',
      content: 'swal-responsive-content',
      confirmButton: 'cursor-pointer'
    },
  });
}

// Helpers
const fullName = (i) => [i.firstName, i.middleName, i.lastName].filter(Boolean).join(' ');

const statusBadgeClasses = (status) => ({
  'In Custody': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Awaiting Trial': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Released': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
}[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300');

const daysInCustody = (i) => calculateDaysInCustody(i.admissionDate);

const inmateAvatarHTML = (inmate) => {
  if (inmate.photoUrl) {
    return `
      <img src="${inmate.photoUrl}" alt="${fullName(inmate)}"
        class="w-32 h-32 rounded-xl object-cover border-4 border-blue-500/20 shadow-lg bg-blue-500/10 mx-auto sm:mx-0" />
    `;
  }
  // Fallback SVG avatar
  return `
    <div class="w-32 h-32 rounded-xl bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/20 flex items-center justify-center mx-auto sm:mx-0 shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/>
        <path d="M2 22s4-4 10-4 10 4 10 4-4 2-10 2-10-2-10-2z"/>
      </svg>
    </div>
  `;
};

// Mao dayon ni sa MORE DETAILS nga BUTTON
function inmateProfileCardHTML(inmate) {
  const name = fullName(inmate);
  const statusClass = statusBadgeClasses(inmate.status);

  return `
    <div class="flex flex-col sm:flex-row gap-8 items-center sm:items-start bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sm:p-8">
      <!-- Avatar -->
      <div class="flex-shrink-0 flex flex-col items-center gap-2 w-full sm:w-auto">
        ${inmateAvatarHTML(inmate)}
        <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass} mt-3 shadow">
          ${inmate.status}
        </span>
      </div>
      <!-- Details -->
      <div class="flex-1 w-full">
        <div class="flex flex-col gap-2">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">${name}</h2>
          <div class="flex flex-wrap gap-4 text-sm mb-2">
            <div class="flex items-center gap-1">
              <span class="text-gray-500 dark:text-gray-400">Age:</span>
              <span class="font-medium dark:text-gray-200">${inmate.age} years old</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-gray-500 dark:text-gray-400">Gender:</span>
              <span class="font-medium dark:text-gray-200">${inmate.gender}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-gray-500 dark:text-gray-400">Cell:</span>
              <span class="font-medium dark:text-gray-200">${inmate.cellNumber}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-gray-500 dark:text-gray-400">Inmate ID:</span>
              <span class="font-mono text-blue-600 dark:text-blue-400">#${inmate.id.toString().padStart(4, '0')}</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div>
              <span class="font-semibold text-gray-700 dark:text-gray-300">Crime:</span>
              <span>${inmate.crime}</span>
            </div>
            <div>
              <span class="font-semibold text-gray-700 dark:text-gray-300">Sentence:</span>
              <span>${inmate.sentence}</span>
            </div>
            <div>
              <span class="font-semibold text-gray-700 dark:text-gray-300">Admission:</span>
              <span>${formatDate(inmate.admissionDate)}</span>
            </div>
            <div>
              <span class="font-semibold text-gray-700 dark:text-gray-300">Days in Custody:</span>
              <span>${daysInCustody(inmate)} days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Calculate age from date string (YYYY-MM-DD)
function calculateAge(dateString) {
  if (!dateString) return 0;
  const dob = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function formatAddress(i) {
  const parts = [i.addressLine1, i.addressLine2, i.city, i.province, i.postalCode, i.country]
    .filter(Boolean)
    .join(', ');
  return parts;
}

// (Old extended/detail modals removed in favor of unified modal)

  // Calculate days in custody
  function calculateDaysInCustody(admissionDate) {
    if (!admissionDate) return 0;
    const admission = new Date(admissionDate);
    const today = new Date();
    const diffTime = Math.abs(today - admission);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Initialize existing items
  function initializeExistingItems() {
    // No-op for now; existing items will be loaded from backend later
  }

  // Render all inmates
  async function renderInmates() {
    try {
      // Show loading state
      if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">Loading inmates...</td></tr>';
      }
      if (mobileCardsContainer) {
        mobileCardsContainer.innerHTML = '<div class="text-center py-8 text-gray-500">Loading inmates...</div>';
      }

      // Fetch inmates from backend scoped to page gender
      const response = await inmateApi.getAll({ gender: pageGender }, 1, 50);
      
      if (response.success) {
        inmates = response.data.data || [];
        
        // TASK 1: Sort inmates alphabetically by name (A-Z) by default
        inmates.sort((a, b) => {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
        
        // Update statistics
        if (response.statistics && statusCounter) {
          statusCounter.setStatistics(response.statistics);
        }
        
        
        // Clear containers
        if (tableBody) tableBody.innerHTML = '';
        if (mobileCardsContainer) mobileCardsContainer.innerHTML = '';
        
        // Check if we have any inmates
        if (inmates.length === 0) {
          // Show empty state (same as static one in Blade template)
          if (tableBody) {
            tableBody.innerHTML = `
              <tr>
                <td colspan="5" class="px-4 py-12 text-center">
                  <div class="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
                    <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <div class="text-center px-4 sm:px-0">
                      <h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">No Inmates Added Yet</h3>
                      <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">There are no inmates in the system yet. Use the "Add Inmate" button above to get started.</p>
                    </div>
                  </div>
                </td>
              </tr>
            `;
          }
          if (mobileCardsContainer) {
            mobileCardsContainer.innerHTML = `
              <div class="text-center py-8 sm:py-12">
                <div class="flex flex-col items-center justify-center space-y-4 sm:space-y-6 px-4 sm:px-0">
                  <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div class="text-center">
                    <h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">No Inmates Added Yet</h3>
                    <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">There are no inmates in the system yet. Use the "Add Inmate" button above to get started.</p>
                  </div>
                </div>
              </div>
            `;
          }
        } else {
          // Render each inmate
          inmates.forEach(inmate => {
            renderOrUpdateViews(inmate);
          });
        }
        
        console.log('Inmates loaded successfully:', inmates.length);
      } else {
        throw new Error(response.message || 'Failed to load inmates');
      }
    } catch (error) {
      console.error('Error loading inmates:', error);
      
      // For any error (including 404), just show the empty state - no error messages
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" class="px-4 py-12 text-center">
              <div class="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
                <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div class="text-center px-4 sm:px-0">
                  <h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">No Inmates Added Yet</h3>
                  <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">There are no inmates in the system yet. Use the "Add Inmate" button above to get started.</p>
                </div>
              </div>
            </td>
          </tr>
        `;
      }
      if (mobileCardsContainer) {
        mobileCardsContainer.innerHTML = `
          <div class="text-center py-8 sm:py-12">
            <div class="flex flex-col items-center justify-center space-y-4 sm:space-y-6 px-4 sm:px-0">
              <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div class="text-center">
                <h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">No Inmates Added Yet</h3>
                <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">There are no inmates in the system yet. Use the "Add Inmate" button above to get started.</p>
              </div>
            </div>
          </div>
        `;
      }
    }
  }

  // Handle add inmate button clicks
  addButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      // Load any existing draft
      const draft = loadDraft();
      const { value } = await openInmateModal(draft || {});
      if (value) {
        try {
          // Transform form data to API format
          const apiData = inmateApi.transformFormData(value);
          
          // Create inmate via API
          const response = await inmateApi.create(apiData);
          
          if (response.success) {
            const newInmate = response.data;
            inmates.push(newInmate);
            
            // Handle cell assignment with counter manager
            if (newInmate.cell_id && newInmate.status === 'Active') {
              try {
                // Sync cell occupancy after inmate creation
                await cellCounterManager.syncCellOccupancy(newInmate.cell_id);
              } catch (error) {
                console.error('Failed to sync cell counter:', error);
                // Continue with inmate creation even if counter update fails
              }
            }
            
            // Refresh cell data from backend to ensure accuracy
            await refreshCellData();

            // Ensure cells grid reflects latest counts immediately
            await renderCells();
            
            // Update statistics
            if (statusCounter) {
              statusCounter.addInmate(newInmate);
            }
            
            renderOrUpdateViews(newInmate);
            clearDraft();
            showSuccessMessage('Inmate added successfully');
            
            // TASK 2: Auto-reload page after successful add operation
            autoReloadPage();
          } else {
            throw new Error(response.message || 'Failed to create inmate');
          }
        } catch (error) {
          console.error('Error creating inmate:', error);
          // Persist the current form so user doesn't lose inputs
          saveDraft(toDraftFromModalValue(value));
          // Re-open modal with draft
          setTimeout(async () => {
            await openInmateModal(loadDraft());
          }, 0);
        }
      }
    });
  });

  // Handle window resize events for responsive behavior
  window.addEventListener('resize', () => {
    const activeModal = document.querySelector('.swal2-container');
    if (activeModal) {
      const modalContent = activeModal.querySelector('.swal2-popup');
      if (modalContent) {
        // Respect unified modal sizing
        modalContent.style.width = isMobile() ? '98vw' : '64rem';
        modalContent.style.padding = isMobile() ? '0.75rem' : '1.5rem';
      }
    }
  });

  // Initialize the page
  initializePage();

  // Expose components for external use
  window.inmateStatusCounter = statusCounter;
  window.cellCounterManager = cellCounterManager;
  
  // Debug function
  window.debugCellCounter = () => {
    console.log('Cell Counter Manager Debug Info:', cellCounterManager.getDebugInfo());
    console.log('Cells data:', cells);
  };
});

