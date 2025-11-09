import 'flowbite';
import { createInmateStatusCounter } from './components/inmate-status-counter.js';
import { saveDraft, loadDraft, clearDraft, toDraftFromModalValue } from './components/inmate-form-draft.js';
import InmateApiClient from './components/inmateApi.js';
import { initializeInmateCells } from './components/inmate-cells.js';
import { createCellCounterManager } from './components/cell-counter-manager.js';
import { createPointsSystemManager } from './components/points-system.js';
import { createMedicalRecordsManager } from './components/medical-records-system.js';
import { getDocumentInfo, viewDocument, downloadDocument, deleteDocument } from '../modules/conjugal-document-manager.js';
import { checkEligibility, getValidationStatusBadge, formatYearsSinceDate } from '../modules/conjugal-validation-helper.js';
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

    genderToggle.addEventListener('change', async () => {
      // Immediate label feedback
      genderLabel.textContent = (currentGenderAttr === 'male') ? 'Switch to Female' : 'Switch to Male';
      
      // Get the target gender
      const targetGender = (currentGenderAttr === 'male') ? 'Female' : 'Male';
      
      try {
        // Show loading state
        genderLabel.textContent = 'Switching...';
        genderToggle.disabled = true;
        
        // Fetch cells for the target gender
        const targetCells = await fetchCellsByGender(targetGender);
        
        // Update the global cells array
        const otherGenderCells = cells.filter(cell => cell.type !== targetGender);
        cells = [...otherGenderCells, ...targetCells];
        
        // Update page gender
        const newPageGender = targetGender;
        
        // Update cells dropdown if it exists
        const cellFilterSelect = document.getElementById('inmates-cell-filter');
        if (cellFilterSelect) {
          await updateCellsFilterDropdown(targetGender);
        }
        
        // Update cells container if it exists
        if (cellsContainer) {
          await renderCells();
        }
        
        // Update inmates list to show only the target gender
        await renderInmates();
        
        // Update statistics
        await updateStatistics();
        
        // Navigate to opposite route after updating data
        const target = (currentGenderAttr === 'male') ? femaleUrl : maleUrl;
        const targetPath = new URL(target, window.location.origin).pathname;
        if (window.location.pathname !== targetPath) {
          window.location.assign(target);
        }
        
      } catch (error) {
        console.error('Error switching gender:', error);
        // Revert toggle state on error
        genderToggle.checked = !genderToggle.checked;
        genderLabel.textContent = (currentGenderAttr === 'male') ? 'Switch to Female' : 'Switch to Male';
      } finally {
        genderToggle.disabled = false;
      }
    });
  }
  
  // Detect if we're on mobile
  const isMobile = () => window.innerWidth < 640; // sm breakpoint in Tailwind

  // Initialize API client
  const inmateApi = new InmateApiClient();

  // Initialize points system
  const pointsSystem = createPointsSystemManager();

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
      
      // Update status counter with cell data if needed
      if (statusCounter && statusCounter.updateWithCellData) {
        const cellSummary = cellCounterManager.getCellOccupancySummary();
        statusCounter.updateWithCellData(cellSummary);
      }
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
    const effectiveGender = gender || pageGender;
    if (!effectiveGender || !cells.length) {
      return '<option value="">No cells available</option>';
    }
    // Show ALL cells for the effective gender; disable options that are not selectable (inactive or full)
    const genderCells = cells.filter(cell => cell.type === effectiveGender);

    if (genderCells.length === 0) {
      return `<option value="">No ${effectiveGender} cells available</option>`;
    }

    return genderCells.map(cell => {
      const count = cell.currentCount ?? 0;
      const occupancyPercentage = cell.capacity ? Math.round((count / cell.capacity) * 100) : 0;
      const isSelected = currentCellId === cell.id;
      const isFull = count >= cell.capacity;
      const isActive = cell.status === 'Active';
      const isDisabled = (!isActive || isFull) && !isSelected; // allow selecting current even if disabled
      // Lightweight badge using emojis to indicate status; keep plain <option> content
      const statusBadge = cell.status === 'Active' ? '🟢' : (cell.status === 'Maintenance' ? '🟡' : '🔴');
      const stateSuffix = isFull ? ' - FULL' : (!isActive ? (cell.status === 'Maintenance' ? ' - MAINTENANCE' : ' - INACTIVE') : '');

      return `
        <option value="${cell.id}" ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}>
          ${statusBadge} ${cell.name} (${count}/${cell.capacity} - ${occupancyPercentage}%) - ${cell.type}${stateSuffix}
        </option>
      `;
    }).join('');
  }

  // Live fetch cells by gender from API
  async function fetchCellsByGender(gender) {
    try {
      console.log(`Fetching cells for gender: ${gender}`);
      
      const response = await fetch(`/api/cells/by-gender?gender=${gender}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log(`Successfully fetched ${data.data.length} cells for ${gender}`);
          return data.data;
        } else {
          throw new Error(data.message || 'Failed to fetch cells');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching cells by gender:', error);
      // Show user-friendly error message
      if (window.Swal) {
        const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
        
        window.Swal.fire({
          title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Error</span>`,
          text: `Failed to load ${gender} cells. Please try again.`,
          icon: 'error',
          confirmButtonText: 'OK',
          background: isDarkMode ? '#111827' : '#FFFFFF',
          color: isDarkMode ? '#F9FAFB' : '#111827'
        });
      }
      return [];
    }
  }

  // Update cells dropdown with live data
  async function updateCellsDropdown(gender, cellSelectElement, currentCellId = null) {
    if (!cellSelectElement) return;

    // Show loading state
    cellSelectElement.innerHTML = '<option value="">Loading cells...</option>';
    cellSelectElement.disabled = true;

    try {
      const genderCells = await fetchCellsByGender(gender);
      
      // Clear and rebuild options
      cellSelectElement.innerHTML = '<option value="">Select Cell</option>';
      
      if (genderCells.length === 0) {
        cellSelectElement.innerHTML += `<option value="" disabled>No ${gender} cells available</option>`;
      } else {
        genderCells.forEach(cell => {
          const count = cell.currentCount ?? 0;
          const occupancyPercentage = cell.capacity ? Math.round((count / cell.capacity) * 100) : 0;
          const isSelected = currentCellId === cell.id;
          const isFull = count >= cell.capacity;
          const isActive = cell.status === 'Active';
          const isDisabled = (!isActive || isFull) && !isSelected;
          const statusBadge = cell.status === 'Active' ? '🟢' : (cell.status === 'Maintenance' ? '🟡' : '🔴');
          const stateSuffix = isFull ? ' - FULL' : (!isActive ? (cell.status === 'Maintenance' ? ' - MAINTENANCE' : ' - INACTIVE') : '');

          const option = document.createElement('option');
          option.value = cell.id;
          option.textContent = `${statusBadge} ${cell.name} (${count}/${cell.capacity} - ${occupancyPercentage}%) - ${cell.type}${stateSuffix}`;
          option.selected = isSelected;
          option.disabled = isDisabled;
          
          cellSelectElement.appendChild(option);
        });
      }
      
      cellSelectElement.disabled = false;
      
      // Update the global cells array for consistency
      const otherGenderCells = cells.filter(cell => cell.type !== gender);
      cells = [...otherGenderCells, ...genderCells];
      
    } catch (error) {
      console.error('Error updating cells dropdown:', error);
      cellSelectElement.innerHTML = '<option value="">Error loading cells</option>';
      cellSelectElement.disabled = false;
    }
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

  // Live update cells filter dropdown when gender changes
  async function updateCellsFilterDropdown(gender) {
    const cellSelect = document.getElementById('inmates-cell-filter');
    if (!cellSelect) return;

    // Show loading state
    cellSelect.innerHTML = '<option value="">Loading cells...</option>';
    cellSelect.disabled = true;

    try {
      // Fetch cells for the specific gender
      const genderCells = await fetchCellsByGender(gender);
      
      // Clear and rebuild options
      cellSelect.innerHTML = '<option value="">All Cells</option>';
      
      if (genderCells.length === 0) {
        cellSelect.innerHTML += `<option value="" disabled>No ${gender} cells available</option>`;
      } else {
        genderCells.forEach(cell => {
          const occupancyRate = cell.capacity ? Math.round((cell.currentCount / cell.capacity) * 100) : 0;
          const label = `${cell.name} (${occupancyRate}%) - ${cell.type}`;
          const option = document.createElement('option');
          option.value = String(cell.id);
          option.textContent = label;
          cellSelect.appendChild(option);
        });
      }
      
      cellSelect.disabled = false;
      
    } catch (error) {
      console.error('Error updating cells filter dropdown:', error);
      cellSelect.innerHTML = '<option value="">Error loading cells</option>';
      cellSelect.disabled = false;
    }
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
    await updateStatistics();

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
          await updateStatistics();
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
      // Count any inmate with a cell assignment
      if (inmate.cell_id) {
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
    
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    const relationshipStartDateValue = visitor.relationship_start_date || visitor.relationshipStartDate || '';
    const existingCohabitationPath = visitor.cohabitation_cert_path || visitor.cohabitationCertPath || '';
    const existingMarriagePath = visitor.marriage_contract_path || visitor.marriageContractPath || '';
    const existingCohabitationName = visitor.cohabitation_cert_filename || visitor.cohabitationCertFilename || (existingCohabitationPath ? existingCohabitationPath.split('/').pop() : '');
    const existingMarriageName = visitor.marriage_contract_filename || visitor.marriageContractFilename || (existingMarriagePath ? existingMarriagePath.split('/').pop() : '');
    const conjugalInputClasses = isDarkMode
      ? 'bg-gray-900 text-white border-gray-600'
      : 'bg-white text-gray-900 border-gray-300';
    const palette = window.ThemeManager ? window.ThemeManager.getPalette() : {
      background: '#111827',
      text: '#F9FAFB',
      border: '#374151',
      cardBg: '#1E293B',
      inputBg: '#1E293B',
      inputBorder: '#374151'
    };

    return window.Swal.fire({
      title: title,
      html: `
        <div class="space-y-4 text-left max-h-[70vh] overflow-y-auto scrollbar-none" style="-ms-overflow-style: none; scrollbar-width: none;">
          <!-- Personal Information -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-2">Personal Information</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">First Name *</label>
                <input id="i-firstname" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                       value="${inmate.firstName || ''}" placeholder="Enter first name" />
              </div>
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Last Name *</label>
                <input id="i-lastname" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                       value="${inmate.lastName || ''}" placeholder="Enter last name" />
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Middle Name</label>
                <input id="i-middlename" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                       value="${inmate.middleName || ''}" placeholder="Enter middle name" />
              </div>
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Age</label>
                <input
                  id="i-age"
                  type="text"
                  aria-label="disabled input"
                  class="w-full p-2.5 text-sm rounded-lg cursor-not-allowed ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-400 placeholder-gray-500' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-blue-500 focus:border-blue-500"
                   value="${inmate.age ?? ''}" 
                  disabled
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Gender *</label>
                <select id="i-gender" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Gender</option>
                  <option value="Male" ${inmate.gender === 'Male' ? 'selected' : ''}>Male</option>
                  <option value="Female" ${inmate.gender === 'Female' ? 'selected' : ''}>Female</option>
                </select>
              </div>
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Admission Date *</label>
                <input id="i-admission-date" type="date" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                       value="${inmate.admissionDate || ''}" />
              </div>
            </div>

            <!-- Demographic: Date of Birth -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Date of Birth *</label>
                <input id="i-dob" type="date" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="${inmate.dateOfBirth || ''}" />
              </div>
            </div>

            <!-- Address -->
            <div class="space-y-3">
              <h4 class="text-sm font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">Address</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Address Line 1 *</label>
                  <input id="i-addr1" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="${inmate.addressLine1 || ''}" placeholder="House No., Street, Barangay" />
                </div>
                <div>
                  <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Address Line 2</label>
                  <input id="i-addr2" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="${inmate.addressLine2 || ''}" placeholder="Subdivision, Building (optional)" />
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">City/Municipality *</label>
                  <input id="i-city" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="${inmate.city || ''}" placeholder="City/Municipality" />
                </div>
                <div>
                  <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Province/State *</label>
                  <input id="i-province" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="${inmate.province || ''}" placeholder="Province/State" />
                </div>
                <div>
                  <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Postal Code</label>
                  <input id="i-postal" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="${inmate.postalCode || ''}" placeholder="e.g., 9200" />
                </div>
              </div>
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Country *</label>
                <input id="i-country" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" value="${inmate.country || 'Philippines'}" placeholder="Country" />
              </div>
            </div>
          </div>
          
          <!-- Legal Information -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-2">Legal Information</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Crime *</label>
                <input id="i-crime" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                       value="${inmate.crime || ''}" placeholder="Enter crime committed" />
              </div>
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Sentence *</label>
                <input id="i-sentence" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                       value="${inmate.sentence || ''}" placeholder="e.g., 2 years, Life, etc." />
                ${isEdit && inmate.reducedSentenceDays > 0 ? `
                  <div class="text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'} mt-1">
                    ⚡ Adjusted: ${((inmate.originalSentenceDays - inmate.reducedSentenceDays) / 365).toFixed(2)} Years 
                    (${inmate.reducedSentenceDays} days reduction earned)
                  </div>
                ` : ''}
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Work / Job</label>
                <input id="i-job" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                       value="${inmate.job || ''}" placeholder="e.g., Kitchen duty, Cleaning, None" />
              </div>
            </div>
          </div>
          
          <!-- Cell Assignment -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-2">Cell Assignment & Status</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Cell Assignment *</label>
                <select id="i-cell" class="w-full appearance-none rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                  <option value="">Select Cell</option>
                  ${generateCellOptionsForGender(inmate.gender || '', inmate.cell_id)}
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">
                  <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Status *</label>
                <select id="i-status" class="w-full appearance-none rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Status</option>
                  <option value="Active" ${inmate.status === 'Active' ? 'selected' : ''}>Active</option>
                  <option value="Released" ${inmate.status === 'Released' ? 'selected' : ''}>Released</option>
                  <option value="Transferred" ${inmate.status === 'Transferred' ? 'selected' : ''}>Transferred</option>
                  <option value="Medical" ${inmate.status === 'Medical' ? 'selected' : ''}>Medical</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">
                  <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Conditional: Released Status Fields -->
            <div id="released-fields" class="space-y-3 mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-amber-900/20 border border-amber-700/50' : 'bg-amber-50 border border-amber-200'}" style="display: ${inmate.status === 'Released' ? 'block' : 'none'};">
              <div class="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <h4 class="text-sm font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}">Release Information</h4>
              </div>
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Release Date & Time *</label>
                <input id="i-released-at" type="datetime-local" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
                       value="${inmate.releasedAt ? new Date(inmate.releasedAt).toISOString().slice(0, 16) : ''}" />
                <p class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1">Timestamp when inmate was released</p>
              </div>
            </div>
            
            <!-- Conditional: Transferred Status Fields -->
            <div id="transferred-fields" class="space-y-3 mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700/50' : 'bg-blue-50 border border-blue-200'}" style="display: ${inmate.status === 'Transferred' ? 'block' : 'none'};">
              <div class="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
                <h4 class="text-sm font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}">Transfer Information</h4>
              </div>
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Transfer Date & Time *</label>
                <input id="i-transferred-at" type="datetime-local" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                       value="${inmate.transferredAt ? new Date(inmate.transferredAt).toISOString().slice(0, 16) : ''}" />
                <p class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1">Timestamp when inmate was transferred</p>
              </div>
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Transfer Destination *</label>
                <textarea id="i-transfer-destination" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                          rows="3" placeholder="Enter facility name, location, and any relevant transfer notes...">${inmate.transferDestination || ''}</textarea>
                <p class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1">Specify where the inmate was transferred</p>
              </div>
            </div>
          </div>

          <!-- Medical Information -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-2">Medical Information</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Medical Status</label>
                <select id="i-medical-status" class="w-full appearance-none rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Medical Status</option>
                  <option value="Healthy" ${inmate.medicalStatus === 'Healthy' ? 'selected' : ''}>Healthy</option>
                  <option value="Under Treatment" ${inmate.medicalStatus === 'Under Treatment' ? 'selected' : ''}>Under Treatment</option>
                  <option value="Critical" ${inmate.medicalStatus === 'Critical' ? 'selected' : ''}>Critical</option>
                  <option value="Not Assessed" ${inmate.medicalStatus === 'Not Assessed' ? 'selected' : ''}>Not Assessed</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">
                  <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Last Medical Check</label>
                <input id="i-last-medical" type="date" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                       value="${inmate.lastMedicalCheck || ''}" />
              </div>
            </div>
            
            <div>
              <label class="block text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1">Medical Notes</label>
              <textarea id="i-medical-notes" class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        rows="3" placeholder="Enter any medical notes or conditions...">${inmate.medicalNotes || ''}</textarea>
            </div>

            <!-- Medical Records History - Responsive Tailwind Table/Cards, sticky and aligned headers -->
            ${isEdit ? `
              <div class="space-y-3 mt-4">
                <!-- Header with Toggle and Action Button -->
                <div class="${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-100 border-gray-300'} border rounded-lg">
                  <div class="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
                    <div class="flex items-center gap-2">
                      <button type="button" id="toggle-medical-records-basic" class="p-1 rounded ${isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-200 text-gray-700'} transition-colors cursor-pointer" aria-label="Toggle medical records">
                        <svg id="medical-chevron-basic" class="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </button>
                      <div>
                        <h4 class="text-sm sm:text-md font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}">Medical Records History</h4>
                        <p class="hidden sm:block text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">Click to expand/collapse</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="add-medical-record"
                      class="inline-flex items-center px-3 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs sm:text-sm font-medium rounded-md cursor-pointer transition-colors"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                      </svg>
                      <span class="hidden sm:inline">Add Medical Record</span>
                      <span class="sm:hidden">Add</span>
                    </button>
                  </div>

                  <!-- Records Table/Cards (Collapsible) -->
                    <div id="medical-records-container-basic" class="transition-all duration-300 overflow-hidden">
  ${
    (inmate.medicalRecords && inmate.medicalRecords.length > 0)
    ? `
      <div class="hidden md:block overflow-x-auto">
        <div class="max-h-96 overflow-y-auto rounded-b-lg border ${isDarkMode ? 'border-slate-700' : 'border-gray-300'}">
          <table class="w-full text-sm text-left ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}">
            <thead class="text-xs ${isDarkMode ? 'text-slate-400 bg-slate-800' : 'text-gray-600 bg-gray-50'} uppercase sticky top-0 z-10">
              <tr>
                <th scope="col" class="px-4 py-3 whitespace-nowrap">Date</th>
                <th scope="col" class="px-4 py-3">Diagnosis</th>
                <th scope="col" class="px-4 py-3">Treatment</th>
                <th scope="col" class="px-4 py-3">Vitals</th>
                <th scope="col" class="px-4 py-3">Allergies</th>
                <th scope="col" class="px-4 py-3">Medications</th>
                <th scope="col" class="px-4 py-3">Notes</th>
                <th scope="col" class="px-4 py-3 whitespace-nowrap">Recorded By</th>
              </tr>
            </thead>
            <tbody>
              ${
                (inmate.medicalRecords || []).map(m => {
                  const vitalsText = (() => {
                    const v = m.vitals || {};
                    const parts = [];
                    if (v.blood_pressure) parts.push(`BP: ${v.blood_pressure}`);
                    if (v.heart_rate) parts.push(`HR: ${v.heart_rate} bpm`);
                    if (v.temperature) parts.push(`Temp: ${v.temperature}°C`);
                    if (v.weight) parts.push(`Weight: ${v.weight}kg`);
                    return parts.length ? parts.join(' / ') : '—';
                  })();
                  const allergiesText = (Array.isArray(m.allergies) && m.allergies.length) ? m.allergies.join(', ') : '—';
                  const medicationsText = (Array.isArray(m.medications) && m.medications.length) ? m.medications.join(', ') : '—';
                  return `
                    <tr class="border-b ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-gray-50'} last:border-none transition-colors">
                      <td class="align-top px-4 py-3 whitespace-nowrap ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${m.date || '—'}</td>
                      <td class="align-top px-4 py-3 font-semibold ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}">${m.diagnosis || '—'}</td>
                      <td class="align-top px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}">${m.treatment || '—'}</td>
                      <td class="align-top px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">${vitalsText}</td>
                      <td class="align-top px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">${allergiesText}</td>
                      <td class="align-top px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">${medicationsText}</td>
                      <td class="align-top px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">${m.notes ? `<span class="italic">"${m.notes}"</span>` : '—'}</td>
                      <td class="align-top px-4 py-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}">${m.recordedBy || '—'}</td>
                    </tr>
                  `;
                }).join('')
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="md:hidden flex flex-col gap-3 max-h-96 overflow-y-auto p-3">
        ${
          (inmate.medicalRecords || []).map(m => {
            const v = m.vitals || {};
            const vitalsParts = [];
            if (v.blood_pressure) vitalsParts.push(`<strong>BP:</strong> ${v.blood_pressure}`);
            if (v.heart_rate) vitalsParts.push(`<strong>HR:</strong> ${v.heart_rate} bpm`);
            if (v.temperature) vitalsParts.push(`<strong>Temp:</strong> ${v.temperature}°C`);
            if (v.weight) vitalsParts.push(`<strong>Weight:</strong> ${v.weight}kg`);
            const vitalsText = vitalsParts.length ? vitalsParts.join(', ') : '';
            const allergiesText = (Array.isArray(m.allergies) && m.allergies.length) ? m.allergies.join(', ') : '';
            const medicationsText = (Array.isArray(m.medications) && m.medications.length) ? m.medications.join(', ') : '';
            return `
              <div class="rounded-xl border border-slate-700 bg-slate-800/80 shadow-lg p-4 flex flex-col gap-2">
                <div class="flex items-start justify-between gap-4">
                  <h3 class="text-lg font-bold text-teal-300">${m.diagnosis || 'No Diagnosis'}</h3>
                  <span class="text-sm text-slate-400 flex-shrink-0">${m.date || '—'}</span>
                </div>
                <div class="space-y-1 text-sm">
                  <p><strong class="font-medium text-slate-400">Treatment:</strong> <span class="text-slate-200">${m.treatment || '—'}</span></p>
                  ${vitalsText ? `<p><strong class="font-medium text-slate-400">Vitals:</strong> <span class="text-slate-300">${vitalsText}</span></p>` : ''}
                  ${allergiesText ? `<p><strong class="font-medium text-slate-400">Allergies:</strong> <span class="text-slate-300">${allergiesText}</span></p>` : ''}
                  ${medicationsText ? `<p><strong class="font-medium text-slate-400">Medications:</strong> <span class="text-slate-300">${medicationsText}</span></p>` : ''}
                </div>
                ${m.notes ? `
                  <div class="mt-2 pt-2 border-t border-slate-700">
                    <p class="text-sm text-slate-400 italic">"${m.notes}"</p>
                  </div>
                ` : ''}
                <div class="text-right text-xs text-slate-500 mt-1">
                  ${m.recordedBy ? `Recorded by ${m.recordedBy}` : ''}
                </div>
              </div>
            `;
          }).join('')
        }
      </div>
    `
    : `
      <div class="text-center py-8 px-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} text-sm">
        <div class="flex flex-col items-center gap-3">
          <div class="w-12 h-12 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} flex items-center justify-center">
            <svg class="w-7 h-7 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p class="font-medium text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">No medical records found</p>
          <span class="text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-500'}">Click "Add Medical Records" to create the first entry.</span>
        </div>
      </div>
    `
  }
</div>
                </div>
              </div>
            ` : `
              <div class="text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm">
                Save inmate first to manage medical records
              </div>
            `}
          </div>

        <!-- Points System -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-2">Points System</h3>
          
          <!-- Editable Points Fields (Always show for both Add and Edit) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
            <div>
              <label class="block text-sm text-gray-300 mb-2 font-medium">Initial Points</label>
              <input id="i-initial-points" type="number" min="0" max="500" 
                     class="w-full rounded-md bg-gray-800/60 border border-gray-600 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                     value="${inmate.initialPoints || 0}" placeholder="Starting points" />
              <div class="text-xs text-gray-400 mt-1">Points at admission</div>
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-2 font-medium">Current Points</label>
              <input id="i-current-points" type="number" min="0" max="500" 
                     class="w-full rounded-md bg-gray-800/60 border border-gray-600 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                     value="${inmate.currentPoints || 0}" placeholder="Current points" />
              <div class="text-xs text-gray-400 mt-1">Maximum: 500 points</div>
            </div>
          </div>
          
          <!-- Points Summary with Sentence Preview (Always show) -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
            <div>
              <label class="block text-sm text-gray-300 mb-2 font-medium">Points Overview</label>
              <div class="text-3xl font-bold text-blue-400" id="display-current-points">${inmate.currentPoints || 0}</div>
              <div class="text-xs text-gray-400 mt-1">Current accumulated points</div>
              <div class="mt-2 w-full bg-gray-700 rounded-full h-2">
                <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all" style="width: ${Math.min((inmate.currentPoints || 0) / 500 * 100, 100)}%"></div>
              </div>
            </div>
            <div id="sentence-preview-container">
              ${pointsSystem.renderSentencePreview(inmate.currentPoints || 0, inmate.originalSentenceDays)}
            </div>
          </div>
          
          <!-- Points History - ONLY show in Edit Mode with functional backend integration -->
          ${isEdit ? `
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-md font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}">Points History</h4>
                <button type="button" id="add-points-entry" class="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md cursor-pointer transition-colors">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Add Points Entry
                </button>
              </div>
              
              <div id="points-history-display" class="max-h-64 overflow-y-auto space-y-2">
                ${(inmate.pointsHistory || []).map(h => `
                  <div class="p-3 bg-gray-800/40 rounded border border-gray-600">
                    <div class="flex justify-between">
                      <span class="text-sm text-gray-300">${h.activity}</span>
                      <span class="text-sm font-semibold ${h.points >= 0 ? 'text-green-400' : 'text-red-400'}">${h.points > 0 ? '+' : ''}${h.points}</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">${h.date}</div>
                    ${h.note ? `<div class="text-xs text-gray-400 mt-1">${h.note}</div>` : ''}
                  </div>
                `).join('') || '<div class="text-sm text-gray-400">No points history yet</div>'}
              </div>
            </div>
          ` : `
            <div class="text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm">
              Save inmate first to manage points history
            </div>
          `}
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
      confirmButtonColor: palette.primary,
      cancelButtonColor: '#DC2626',
      background: palette.background,
      color: palette.text,
      customClass: {
        container: 'swal-responsive-container',
        popup: 'swal-responsive-popup',
        content: 'swal-responsive-content',
      },
      didOpen: async () => {
        // Status change handler for conditional fields
        const statusSelect = document.getElementById('i-status');
        const releasedFields = document.getElementById('released-fields');
        const transferredFields = document.getElementById('transferred-fields');
        const releasedAtInput = document.getElementById('i-released-at');
        const transferredAtInput = document.getElementById('i-transferred-at');
        
        if (statusSelect && releasedFields && transferredFields) {
          statusSelect.addEventListener('change', (e) => {
            const selectedStatus = e.target.value;
            
            // Show/hide conditional fields based on status
            if (selectedStatus === 'Released') {
              releasedFields.style.display = 'block';
              transferredFields.style.display = 'none';
              // Auto-populate current datetime if empty
              if (!releasedAtInput.value) {
                const now = new Date();
                releasedAtInput.value = now.toISOString().slice(0, 16);
              }
            } else if (selectedStatus === 'Transferred') {
              releasedFields.style.display = 'none';
              transferredFields.style.display = 'block';
              // Auto-populate current datetime if empty
              if (!transferredAtInput.value) {
                const now = new Date();
                transferredAtInput.value = now.toISOString().slice(0, 16);
              }
            } else {
              releasedFields.style.display = 'none';
              transferredFields.style.display = 'none';
            }
          });
        }
        
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
        
        // Gender defaults to current page; rebuild cell options for effective gender
        const genderSelect = /** @type {HTMLSelectElement|null} */(document.getElementById('i-gender'));
        const cellSelect = /** @type {HTMLSelectElement|null} */(document.getElementById('i-cell'));
        if (genderSelect && !genderSelect.value) {
          genderSelect.value = pageGender;
        }
        if (cellSelect) {
          const selectedGender = genderSelect ? genderSelect.value : pageGender;
          // Use live cell fetching for initial population as well
          await updateCellsDropdown(selectedGender, cellSelect, inmate.cell_id);
        }

        // If user changes gender in the form, refresh cell options accordingly with live data
        if (genderSelect && cellSelect) {
          genderSelect.addEventListener('change', async () => {
            const g = genderSelect.value || pageGender;
            // Use live cell fetching instead of static generation
            await updateCellsDropdown(g, cellSelect, inmate.cell_id);
          });
        }

        // Initialize dynamic form elements
        initializeVisitRecords();
        
        // Real-time points display update
        const currentPointsInput = document.getElementById('i-current-points');
        if (currentPointsInput) {
          currentPointsInput.addEventListener('input', (e) => {
            const points = parseInt(e.target.value) || 0;
            const clampedPoints = Math.max(0, Math.min(500, points));
            
            const displayElement = document.getElementById('display-current-points');
            if (displayElement) {
              displayElement.textContent = clampedPoints;
            }
            
            const progressBar = document.querySelector('#display-current-points').parentElement.querySelector('.bg-gradient-to-r');
            if (progressBar) {
              progressBar.style.width = `${Math.min((clampedPoints / 500) * 100, 100)}%`;
            }
            
            const previewContainer = document.getElementById('sentence-preview-container');
            if (previewContainer) {
              previewContainer.innerHTML = pointsSystem.renderSentencePreview(clampedPoints, inmate.originalSentenceDays);
            }
          });
        }

        // Wire "Add Points Entry" button (EDIT MODE ONLY)
        if (inmate.id) {
          const addPtsBtn = document.getElementById('add-points-entry');
          if (addPtsBtn) {
            addPtsBtn.addEventListener('click', async () => {
              // Get theme-aware colors from ThemeManager
              const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
              
              const result = await Swal.fire({
                title: 'Add Points Entry',
                html: `
                  <div class="text-left space-y-4">
                    ${pointsSystem.renderQuickButtons()}
                    
                    <div>
                      <label class="block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Date *</label>
                      <input type="date" id="pts-date" class="w-full rounded border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} px-3 py-2" 
                             value="${new Date().toISOString().split('T')[0]}" required />
                    </div>
                    
                    <div>
                      <label class="block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Points *</label>
                      <input type="number" id="pts-points" class="w-full rounded border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} px-3 py-2" 
                             placeholder="Enter points (+/-)" required />
                    </div>
                    
                    <div>
                      <label class="block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Activity *</label>
                      <select id="pts-activity" class="w-full rounded border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} px-3 py-2" required>
                        <option value="">Select Activity</option>
                        <option value="Good behavior">Good behavior</option>
                        <option value="Work assignment">Work assignment</option>
                        <option value="Educational program">Educational program</option>
                        <option value="Community service">Community service</option>
                        <option value="Rule violation">Rule violation (-)</option>
                        <option value="Fighting">Fighting (-)</option>
                        <option value="Disobedience">Disobedience (-)</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label class="block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Notes</label>
                      <textarea id="pts-notes" class="w-full rounded border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} px-3 py-2" rows="2"></textarea>
                    </div>
                  </div>
                `,
                background: isDarkMode ? '#1F2937' : '#FFFFFF',
                color: isDarkMode ? '#F9FAFB' : '#111827',
                showCancelButton: true,
                confirmButtonText: 'Save Points',
                confirmButtonColor: '#3B82F6',
                cancelButtonColor: '#DC2626',
                didOpen: () => {
                  // Wire quick buttons
                  document.querySelectorAll('[data-quick-add]').forEach(btn => {
                    btn.addEventListener('click', () => {
                      document.getElementById('pts-points').value = btn.getAttribute('data-quick-add');
                    });
                  });
                  document.querySelectorAll('[data-quick-subtract]').forEach(btn => {
                    btn.addEventListener('click', () => {
                      document.getElementById('pts-points').value = '-' + btn.getAttribute('data-quick-subtract');
                    });
                  });
                },
                preConfirm: () => {
                  const points = parseInt(document.getElementById('pts-points').value);
                  const activity = document.getElementById('pts-activity').value;
                  const date = document.getElementById('pts-date').value;
                  
                  if (!points || !activity || !date) {
                    Swal.showValidationMessage('Please fill all required fields');
                    return false;
                  }
                  
                  return { points, activity, notes: document.getElementById('pts-notes').value, date };
                }
              });
              
              if (result.isConfirmed && result.value) {
                try {
                  // Save to backend immediately
                  const response = await fetch(`/api/inmates/${inmate.id}/points/add`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify(result.value)
                  });
                  
                  const data = await response.json();
                  
                  if (data.success) {
                    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
                    
                    Swal.fire({
                      icon: 'success',
                      title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Points Added!</span>`,
                      text: 'Points entry saved successfully',
                      timer: 1500,
                      showConfirmButton: false,
                      background: isDarkMode ? '#111827' : '#FFFFFF',
                      color: isDarkMode ? '#F9FAFB' : '#111827'
                    });
                    
                    // Update inmate object with fresh data
                    Object.assign(inmate, data.data);
                    
                    // Update display elements with null checks
                    const currentPointsInput = document.getElementById('i-current-points');
                    if (currentPointsInput) {
                      currentPointsInput.value = inmate.currentPoints;
                    }
                    
                    const displayElement = document.getElementById('display-current-points');
                    if (displayElement) {
                      displayElement.textContent = inmate.currentPoints;
                    }
                    
                    // Update progress bar
                    const progressBar = document.querySelector('.bg-gradient-to-r');
                    if (progressBar) {
                      progressBar.style.width = `${Math.min((inmate.currentPoints / 500) * 100, 100)}%`;
                    }
                    
                    // Update sentence preview
                    const previewContainer = document.getElementById('sentence-preview-container');
                    if (previewContainer) {
                      previewContainer.innerHTML = pointsSystem.renderSentencePreview(inmate.currentPoints, inmate.originalSentenceDays);
                    }
                    
                    // Refresh points history display
                    const historyDisplay = document.getElementById('points-history-display');
                    if (historyDisplay) {
                      historyDisplay.innerHTML = (inmate.pointsHistory || []).map(h => `
                        <div class="p-3 bg-gray-800/40 rounded border border-gray-600">
                          <div class="flex justify-between">
                            <span class="text-sm text-gray-300">${h.activity}</span>
                            <span class="text-sm font-semibold ${h.points >= 0 ? 'text-green-400' : 'text-red-400'}">${h.points > 0 ? '+' : ''}${h.points}</span>
                          </div>
                          <div class="text-xs text-gray-500 mt-1">${h.date}</div>
                          ${h.note ? `<div class="text-xs text-gray-400 mt-1">${h.note}</div>` : ''}
                        </div>
                      `).join('') || '<div class="text-sm text-gray-400">No points history yet</div>';
                    }
                  } else {
                    throw new Error(data.message || 'Failed to add points');
                  }
                } catch (error) {
                  console.error('Error adding points:', error);
                  const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
                  
                  Swal.fire({
                    icon: 'error',
                    title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Error</span>`,
                    text: error.message || 'Failed to add points',
                    background: isDarkMode ? '#111827' : '#FFFFFF',
                    color: isDarkMode ? '#F9FAFB' : '#111827'
                  });
                }
              }
            });
          }

        // Local toggle for Medical Records History (basic modal)
        (function(){
          const toggleBtn = document.getElementById('toggle-medical-records-basic');
          const container = document.getElementById('medical-records-container-basic');
          const chevron = document.getElementById('medical-chevron-basic');
          if (toggleBtn && container && chevron) {
            let isOpen = true;
            toggleBtn.addEventListener('click', () => {
              isOpen = !isOpen;
              if (isOpen) {
                container.style.maxHeight = container.scrollHeight + 'px';
                chevron.style.transform = 'rotate(0deg)';
              } else {
                container.style.maxHeight = '0px';
                chevron.style.transform = 'rotate(-90deg)';
              }
            });
            // initial
            container.style.maxHeight = container.scrollHeight + 'px';
          }
        })();

        // Wire "Add Medical Record" button (EDIT MODE ONLY)
          const addMedicalRecordBtn = document.getElementById('add-medical-record');
          if (addMedicalRecordBtn && inmate.id) {
            addMedicalRecordBtn.addEventListener('click', async () => {
              const medicalRecordsManager = createMedicalRecordsManager();
              
              await medicalRecordsManager.openAddMedicalRecordModal(
                inmate.id, 
                inmate.medicalStatus, 
                (updatedInmateData, formData) => {
                  // Update inmate object with fresh data
                  Object.assign(inmate, updatedInmateData);
                  
                  // Update medical status select if changed
                  if (formData.medical_status) {
                    const medicalStatusSelect = document.getElementById('i-medical-status');
                    if (medicalStatusSelect) {
                      medicalStatusSelect.value = formData.medical_status;
                    }
                  }
                  
                  // Refresh medical records display
                  const recordsDisplay = document.getElementById('medical-records-display');
                  if (recordsDisplay) {
                    // Get theme-aware colors
                    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
                    
                    recordsDisplay.innerHTML = (inmate.medicalRecords || []).map(m => `
                      <div class="p-3 ${isDarkMode ? 'bg-gray-800/40 border-gray-600' : 'bg-gray-100 border-gray-300'} rounded border">
                        <div class="flex justify-between items-start">
                          <div class="flex-1">
                            <span class="text-sm font-semibold ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}">${m.diagnosis}</span>
                            <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1">${m.date}</div>
                          </div>
                        </div>
                        <div class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mt-2">Treatment: ${m.treatment}</div>
                        ${m.notes ? `<div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 italic">Notes: ${m.notes}</div>` : ''}
                        ${m.recordedBy ? `<div class="text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1">By: ${m.recordedBy}</div>` : ''}
                      </div>
                    `).join('') || `<div class="text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">No medical records yet</div>`;
                  }
                }
              );
            });
          }
        }
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
          // Status tracking timestamps
          releasedAt: document.getElementById('i-released-at')?.value || null,
          transferredAt: document.getElementById('i-transferred-at')?.value || null,
          transferDestination: document.getElementById('i-transfer-destination')?.value.trim() || null,
          // Medical Information
          medicalStatus: document.getElementById('i-medical-status').value || 'Not Assessed',
          lastMedicalCheck: document.getElementById('i-last-medical').value || null,
          medicalNotes: document.getElementById('i-medical-notes').value.trim() || '',
          // Points System
          initialPoints: parseInt(document.getElementById('i-initial-points').value) || 0,
          currentPoints: parseInt(document.getElementById('i-current-points').value) || 0,
          // Visitation Information (removed UI)
         };

        // Validate required fields: strict for edit, permissive for add
        if (isEditing) {
          if (!data.firstName || !data.lastName || !data.gender || !data.crime || !data.sentence || !data.status || !data.admissionDate || !data.cell_id) {
            window.Swal.showValidationMessage('Please fill in all required fields including cell assignment.');
            return false;
          }
        } else {
          // For Add: allow as long as at least 2 key fields are filled; cell assignment optional
          const filledKeys = [
            data.firstName,
            data.lastName,
            data.gender,
            data.crime,
            data.sentence,
            data.status,
            data.admissionDate
          ].filter(v => typeof v === 'string' ? v.trim() !== '' : !!v);
          if (filledKeys.length < 2) {
            window.Swal.showValidationMessage('Please fill at least 2 fields to add an inmate.');
            return false;
          }
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

      ${pointsSystem.renderQuickButtons()}

      <!-- Main Form Grid - Responsive -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
        <!-- Date Field -->
        <div class="sm:col-span-1">
          <label class="block text-sm text-gray-300 mb-2 font-medium">Date *</label>
          <input type="date" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                 value="${entry.date || new Date().toISOString().split('T')[0]}" data-field="date" required />
        </div>
        
        <!-- Points Field -->
        <div class="sm:col-span-1">
          <label class="block text-sm text-gray-300 mb-2 font-medium">Points *</label>
          <div class="relative">
            <input type="number" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                   value="${entry.points || ''}" data-field="points" placeholder="Enter points" required />
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

    // Attach quick button handlers
    entryDiv.querySelectorAll('[data-quick-add]').forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = parseInt(btn.getAttribute('data-quick-add'));
        const pointsInput = entryDiv.querySelector('[data-field="points"]');
        pointsInput.value = amount;
      });
    });

    entryDiv.querySelectorAll('[data-quick-subtract]').forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = parseInt(btn.getAttribute('data-quick-subtract'));
        const pointsInput = entryDiv.querySelector('[data-field="points"]');
        pointsInput.value = -amount;
      });
    });
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

    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    const conjugalInputClasses = isDarkMode
      ? 'bg-gray-900 text-white border-gray-600'
      : 'bg-white text-gray-900 border-gray-300';
    
    // Extract conjugal visit data from visitor object
    const relationshipStartDateValue = visitor.relationship_start_date || visitor.relationshipStartDate || '';
    const existingCohabitationPath = visitor.cohabitation_cert_path || visitor.cohabitationCertPath || '';
    const existingMarriagePath = visitor.marriage_contract_path || visitor.marriageContractPath || '';
    const existingCohabitationName = visitor.cohabitation_cert_filename || visitor.cohabitationCertFilename || (existingCohabitationPath ? existingCohabitationPath.split('/').pop() : '');
    const existingMarriageName = visitor.marriage_contract_filename || visitor.marriageContractFilename || (existingMarriagePath ? existingMarriagePath.split('/').pop() : '');

    // Hide empty state when adding visitors
    if (emptyState) {
      emptyState.classList.add('hidden');
    }

    const entryIndex = index !== null ? index : container.children.length;
    const visitorDiv = document.createElement('div');
    visitorDiv.className = `${isDarkMode ? 'bg-gray-800/40 border-gray-600 hover:bg-gray-800/60' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'} rounded-xl p-4 border transition-all duration-200 shadow-sm`;
    visitorDiv.innerHTML = `
      <!-- Visitor Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-semibold">${entryIndex + 1}</span>
          </div>
          <h4 class="text-base font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}">Allowed Visitor</h4>
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
          <label class="block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 font-medium">1x1 Photo</label>
          <div class="flex items-center gap-3">
            <img data-field="avatarPreview" src="/images/logo/bjmp_logo.png" alt="Visitor avatar" class="h-16 w-16 rounded-full object-cover ring-2 ring-green-500/20 ${isDarkMode ? 'bg-gray-700/40' : 'bg-gray-200'}" />
            <div>
              <label class="inline-flex items-center px-3 py-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-white text-xs font-medium rounded-md cursor-pointer transition-colors">
                Choose Image
                <input type="file" accept="image/*" data-field="avatar" class="hidden" />
              </label>
              <p class="mt-1 text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">PNG/JPG up to 2MB</p>
              <button type="button" data-action="view-visitor" class="mt-2 inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md cursor-pointer transition-colors">
                View
              </button>
            </div>
          </div>
        </div>
        <!-- Visitor Name Field -->
        <div class="sm:col-span-2 lg:col-span-1">
          <label class="block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 font-medium">Visitor Name *</label>
          <input type="text" class="w-full rounded-lg ${isDarkMode ? 'bg-gray-800/60 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
                 value="${visitor.name || ''}" data-field="name" placeholder="Full name" required />
        </div>
        
        <!-- Relationship Field -->
        <div class="sm:col-span-2 lg:col-span-1">
          <label class="block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 font-medium">Relationship *</label>
          <select class="w-full rounded-lg ${isDarkMode ? 'bg-gray-800/60 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" data-field="relationship" required>
            <option value="">Select relationship</option>
            <option value="Father" ${visitor.relationship === 'Father' ? 'selected' : ''}>Father</option>
            <option value="Mother" ${visitor.relationship === 'Mother' ? 'selected' : ''}>Mother</option>
            <option value="Spouse" ${visitor.relationship === 'Spouse' ? 'selected' : ''}>Spouse</option>
            <option value="Wife" ${visitor.relationship === 'Wife' ? 'selected' : ''}>Wife</option>
            <option value="Husband" ${visitor.relationship === 'Husband' ? 'selected' : ''}>Husband</option>
            <option value="Sibling" ${visitor.relationship === 'Sibling' ? 'selected' : ''}>Sibling</option>
            <option value="Child" ${visitor.relationship === 'Child' ? 'selected' : ''}>Child</option>
            <option value="Friend" ${visitor.relationship === 'Friend' ? 'selected' : ''}>Friend</option>
            <option value="Lawyer" ${visitor.relationship === 'Lawyer' ? 'selected' : ''}>Lawyer</option>
            <option value="Other" ${visitor.relationship === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
        
        <!-- Phone Field -->
        <div class="sm:col-span-2 lg:col-span-1">
          <label class="block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 font-medium">Phone</label>
          <div class="relative">
            <input type="tel" class="w-full rounded-lg ${isDarkMode ? 'bg-gray-800/60 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
                   value="${visitor.phone || visitor.contactNumber || ''}" data-field="phone" placeholder="+63 9XX XXX XXXX" />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg class="w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <!-- Email Field -->
        <div class="sm:col-span-2 lg:col-span-1">
          <label class="block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 font-medium">Email</label>
          <div class="relative">
            <input type="email" class="w-full rounded-lg ${isDarkMode ? 'bg-gray-800/60 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
                   value="${visitor.email || ''}" data-field="email" placeholder="email@example.com" />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg class="w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- ID Information Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 font-medium">ID Type</label>
          <select class="w-full rounded-lg ${isDarkMode ? 'bg-gray-800/60 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" data-field="idType">
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
          <label class="block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 font-medium">ID Number</label>
          <input type="text" class="w-full rounded-lg ${isDarkMode ? 'bg-gray-800/60 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
                 value="${visitor.idNumber || ''}" data-field="idNumber" placeholder="ID number" />
        </div>
      </div>

      <!-- Address Field -->
      <div class="mb-4">
        <label class="block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 font-medium">Address</label>
        <input type="text" class="w-full rounded-lg ${isDarkMode ? 'bg-gray-800/60 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
               value="${visitor.address || ''}" data-field="address" placeholder="Visitor's address" />
      </div>

      <!-- Conjugal Visit Requirements -->
      <div data-conjugal-section class="hidden mb-4 rounded-xl border border-pink-500/30 bg-pink-500/5 px-4 py-4 transition-all">
        <div class="flex items-start gap-3 mb-3">
          <div class="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m2-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h5 class="text-sm font-semibold text-pink-600 dark:text-pink-400">Conjugal Visit Requirements</h5>
            <p class="text-xs text-pink-600/80 dark:text-pink-300/80">Provide your marriage/live-in start date and upload the required documents. Couples must be married or living together for at least 6 years.</p>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 font-medium">Marriage/Live-in Start Date <span class="text-pink-600">*</span></label>
            <input type="date" data-field="relationshipStartDate" class="w-full rounded-lg ${conjugalInputClasses} px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors" value="${relationshipStartDateValue}" />
            <p class="mt-2 text-[11px] text-pink-600/80 dark:text-pink-300/80">Must be at least 6 years prior to the current date.</p>
          </div>
          <div>
            <label class="block text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 font-medium">Cohabitation Certificate <span class="text-pink-600">*</span></label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" data-field="cohabitationCert" class="block w-full rounded-lg ${conjugalInputClasses} px-3 py-2 text-xs sm:text-sm cursor-pointer file:cursor-pointer file:border-0 file:rounded-md file:bg-pink-600 file:text-white file:px-4 file:py-2 file:text-xs hover:file:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors" />
            <p class="mt-2 text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}" data-field="cohabitationHint">Upload PDF/JPG/PNG up to 10MB.</p>
            <input type="hidden" data-field="cohabitationExisting" value="">
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 font-medium">Marriage Contract <span class="text-pink-600">*</span></label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" data-field="marriageContract" class="block w-full rounded-lg ${conjugalInputClasses} px-3 py-2 text-xs sm:text-sm cursor-pointer file:cursor-pointer file:border-0 file:rounded-md file:bg-pink-600 file:text-white file:px-4 file:py-2 file:text-xs hover:file:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors" />
            <p class="mt-2 text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}" data-field="marriageHint">Upload PDF/JPG/PNG up to 10MB.</p>
            <input type="hidden" data-field="marriageExisting" value="">
          </div>
        </div>
      </div>

      <!-- Visitor Footer with Status -->
      <div class="mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}">
        <div class="flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">
          <span>Visitor #${entryIndex + 1}</span>
          <span class="flex items-center">
            <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Allowed
          </span>
        </div>
      </div>
    `;
    container.appendChild(visitorDiv);

    const relationshipSelect = /** @type {HTMLSelectElement|null} */(visitorDiv.querySelector('[data-field="relationship"]'));
    const conjugalSection = visitorDiv.querySelector('[data-conjugal-section]');
    const relationshipStartDateInput = /** @type {HTMLInputElement|null} */(visitorDiv.querySelector('[data-field="relationshipStartDate"]'));
    const cohabitationInputField = /** @type {HTMLInputElement|null} */(visitorDiv.querySelector('[data-field="cohabitationCert"]'));
    const marriageInputField = /** @type {HTMLInputElement|null} */(visitorDiv.querySelector('[data-field="marriageContract"]'));
    const cohabitationHint = visitorDiv.querySelector('[data-field="cohabitationHint"]');
    const marriageHint = visitorDiv.querySelector('[data-field="marriageHint"]');
    const cohabitationExistingInput = /** @type {HTMLInputElement|null} */(visitorDiv.querySelector('[data-field="cohabitationExisting"]'));
    const marriageExistingInput = /** @type {HTMLInputElement|null} */(visitorDiv.querySelector('[data-field="marriageExisting"]'));

    if (relationshipStartDateInput && relationshipStartDateValue) {
      relationshipStartDateInput.value = relationshipStartDateValue;
    }
    if (cohabitationExistingInput) {
      cohabitationExistingInput.value = existingCohabitationPath || '';
    }
    if (marriageExistingInput) {
      marriageExistingInput.value = existingMarriagePath || '';
    }
    if (cohabitationHint && existingCohabitationName) {
      cohabitationHint.textContent = `Current: ${existingCohabitationName}`;
    }
    if (marriageHint && existingMarriageName) {
      marriageHint.textContent = `Current: ${existingMarriageName}`;
    }

    const toggleConjugalSection = () => {
      if (!relationshipSelect || !conjugalSection) return;
      const value = relationshipSelect.value;
      if (value === 'Wife' || value === 'Husband' || value === 'Spouse') {
        conjugalSection.classList.remove('hidden');
      } else {
        conjugalSection.classList.add('hidden');
      }
    };
    if (relationshipSelect) {
      relationshipSelect.addEventListener('change', toggleConjugalSection);
    }
    toggleConjugalSection();

    if (cohabitationInputField && cohabitationHint) {
      const defaultHint = 'Upload PDF/JPG/PNG up to 10MB.';
      cohabitationInputField.addEventListener('change', () => {
        if (cohabitationInputField.files && cohabitationInputField.files[0]) {
          cohabitationHint.textContent = `Selected: ${cohabitationInputField.files[0].name}`;
          if (cohabitationExistingInput) {
            cohabitationExistingInput.value = '';
          }
        } else if (existingCohabitationName) {
          cohabitationHint.textContent = `Current: ${existingCohabitationName}`;
        } else {
          cohabitationHint.textContent = defaultHint;
        }
      });
    }

    if (marriageInputField && marriageHint) {
      const defaultHint = 'Upload PDF/JPG/PNG up to 10MB.';
      marriageInputField.addEventListener('change', () => {
        if (marriageInputField.files && marriageInputField.files[0]) {
          marriageHint.textContent = `Selected: ${marriageInputField.files[0].name}`;
          if (marriageExistingInput) {
            marriageExistingInput.value = '';
          }
        } else if (existingMarriageName) {
          marriageHint.textContent = `Current: ${existingMarriageName}`;
        } else {
          marriageHint.textContent = defaultHint;
        }
      });
    }

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
    const relationshipStartDate = getVal('[data-field="relationshipStartDate"]');
    const cohabitationInputField = /** @type {HTMLInputElement|null} */(containerEl.querySelector('[data-field="cohabitationCert"]'));
    const marriageInputField = /** @type {HTMLInputElement|null} */(containerEl.querySelector('[data-field="marriageContract"]'));
    const cohabitationExistingInput = /** @type {HTMLInputElement|null} */(containerEl.querySelector('[data-field="cohabitationExisting"]'));
    const marriageExistingInput = /** @type {HTMLInputElement|null} */(containerEl.querySelector('[data-field="marriageExisting"]'));
    const cohabitationFilename = cohabitationInputField && cohabitationInputField.files && cohabitationInputField.files[0]
      ? cohabitationInputField.files[0].name
      : (cohabitationExistingInput?.value ? cohabitationExistingInput.value.split('/').pop() : '');
    const marriageFilename = marriageInputField && marriageInputField.files && marriageInputField.files[0]
      ? marriageInputField.files[0].name
      : (marriageExistingInput?.value ? marriageExistingInput.value.split('/').pop() : '');

    return {
      name: getVal('[data-field="name"]'),
      phone: getVal('[data-field="phone"]'),
      email: getVal('[data-field="email"]'),
      relationship: getVal('[data-field\="relationship\"]'),
      idType: getVal('[data-field\="idType\"]'),
      idNumber: getVal('[data-field\="idNumber\"]'),
      address: getVal('[data-field\="address\"]'),
      avatarFilename: avatarFilename,
      avatarPath: 'images/visitors/profiles',
      avatarDataUrl: avatarDataUrl,
      relationshipStartDate,
      cohabitationCertName: cohabitationFilename,
      marriageContractName: marriageFilename
    };
  }

  function collectAllowedVisitors() {
    const container = document.getElementById('allowed-visitors-container');
    if (!container) return [];

    const visitors = [];
    // Select all visitor divs regardless of theme class
    container.querySelectorAll('[class*="rounded-xl p-4 border"]').forEach(visitorDiv => {
      const name = visitorDiv.querySelector('[data-field="name"]').value;
      const phone = visitorDiv.querySelector('[data-field="phone"]').value;
      const email = visitorDiv.querySelector('[data-field="email"]').value;
      const relationship = visitorDiv.querySelector('[data-field="relationship"]').value;
      const idType = visitorDiv.querySelector('[data-field="idType"]').value;
      const idNumber = visitorDiv.querySelector('[data-field="idNumber"]').value;
      const address = visitorDiv.querySelector('[data-field="address"]').value;
      const avatarInput = /** @type {HTMLInputElement|null} */(visitorDiv.querySelector('[data-field="avatar"]'));
      const avatarFilename = avatarInput && avatarInput.files && avatarInput.files[0] ? avatarInput.files[0].name : '';
      const avatarPath = 'images/visitors/profiles';
      const previewEl = /** @type {HTMLImageElement|null} */(visitorDiv.querySelector('[data-field="avatarPreview"]'));
      const avatarDataUrl = previewEl ? String(previewEl.getAttribute('src') || '') : '';

      const relationshipStartDateInput = /** @type {HTMLInputElement|null} */(visitorDiv.querySelector('[data-field="relationshipStartDate"]'));
      const cohabitationInputField = /** @type {HTMLInputElement|null} */(visitorDiv.querySelector('[data-field="cohabitationCert"]'));
      const marriageInputField = /** @type {HTMLInputElement|null} */(visitorDiv.querySelector('[data-field="marriageContract"]'));
      const cohabitationExistingInput = /** @type {HTMLInputElement|null} */(visitorDiv.querySelector('[data-field="cohabitationExisting"]'));
      const marriageExistingInput = /** @type {HTMLInputElement|null} */(visitorDiv.querySelector('[data-field="marriageExisting"]'));
      const relationshipStartDate = relationshipStartDateInput ? relationshipStartDateInput.value : '';
      const relationshipLower = relationship ? relationship.toLowerCase() : '';

      if (name && relationship) {
        const visitorPayload = {
          name: name,
          phone: phone,
          email: email,
          relationship: relationship,
          idType: idType,
          idNumber: idNumber,
          address: address,
          avatarFilename: avatarFilename,
          avatarPath: avatarPath,
          avatarDataUrl: avatarDataUrl,
        };

        if (relationshipLower === 'wife' || relationshipLower === 'husband' || relationshipLower === 'spouse') {
          if (relationshipStartDate) {
            visitorPayload.relationship_start_date = relationshipStartDate;
          }

          if (cohabitationInputField && cohabitationInputField.files && cohabitationInputField.files[0]) {
            visitorPayload.cohabitation_cert = cohabitationInputField.files[0];
          } else if (cohabitationExistingInput && cohabitationExistingInput.value) {
            visitorPayload.cohabitation_cert_path = cohabitationExistingInput.value;
          }

          if (marriageInputField && marriageInputField.files && marriageInputField.files[0]) {
            visitorPayload.marriage_contract = marriageInputField.files[0];
          } else if (marriageExistingInput && marriageExistingInput.value) {
            visitorPayload.marriage_contract_path = marriageExistingInput.value;
          }
        }

        visitors.push(visitorPayload);
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
    await updateStatistics();
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
            <div class="relative group h-9 w-9 rounded-full overflow-hidden ring-2 ring-blue-500/20 flex items-center justify-center cursor-pointer" data-avatar-upload data-inmate-id="${inmate.id}">
              <img src="${getInmateAvatarUrl(inmate)}" alt="Avatar" class="h-full w-full object-cover" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" class="drop-shadow-lg">
                  <rect width="24" height="24" fill="none"/>
                  <path fill="white" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM21.41 6.34l-3.75-3.75l-2.53 2.54l3.75 3.75z" stroke-width="0.3" stroke="white"/>
                </svg>
              </div>
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
    row.querySelector('[data-i-sentence]').innerHTML = formatSentenceWithReduction(inmate);
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
    nameBtn.onclick = async () => {
      await openUnifiedInmateModal(inmate);
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
            <div class="relative group h-10 w-10 rounded-full overflow-hidden ring-2 ring-blue-500/20 flex items-center justify-center cursor-pointer" data-avatar-upload data-inmate-id="${inmate.id}">
              <img 
                src="${getInmateAvatarUrl(inmate)}" 
                alt="Avatar" 
                class="h-full w-full object-cover" 
              />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" class="drop-shadow-lg">
                  <rect width="24" height="24" fill="none"/>
                  <path fill="white" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM21.41 6.34l-3.75-3.75l-2.53 2.54l3.75 3.75z" stroke-width="0.3" stroke="white"/>
                </svg>
              </div>
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
    card.querySelector('[data-i-sentence]').innerHTML = formatSentenceWithReduction(inmate);
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
    nameBtn.onclick = async () => {
      await openUnifiedInmateModal(inmate);
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

  /**
   * Format sentence with reduction indicator as subtitle
   * Shows original sentence with reduced sentence below in green text with parentheses
   * Italic for table/card views, normal for modals
   * @param {Object} inmate - Inmate object
   * @param {Boolean} showEmoji - Whether to show emoji (for modals only)
   */
  function formatSentenceWithReduction(inmate, showEmoji = false) {
    if (!inmate.sentence) return '—';
    
    const hasReduction = inmate.reducedSentenceDays && inmate.reducedSentenceDays > 0;
    
    if (!hasReduction || !inmate.originalSentenceDays) {
      return inmate.sentence;
    }
    
    const adjustedDays = inmate.originalSentenceDays - inmate.reducedSentenceDays;
    const adjustedYears = (adjustedDays / 365).toFixed(2);
    const emoji = showEmoji ? '⚡ ' : '';
    const italicClass = showEmoji ? '' : 'italic';
    
    return `
      <div class="flex flex-col">
        <span class="text-gray-900 dark:text-gray-200">${inmate.sentence}</span>
        <span class="text-xs text-green-600 dark:text-green-400 ${italicClass} mt-0.5">
          (${emoji}${adjustedYears} Years after ${inmate.reducedSentenceDays} days reduction)
        </span>
      </div>
    `;
  }

  /**
   * Update cell counts using the cell counter manager
   * This function ensures that cell counts are properly updated in both frontend and backend
   */
  async function updateCellCounts() {
    // Use cell counter manager to update counts properly
    // This will update both frontend and backend via the updateBackendCellCounts method
    await cellCounterManager.calculateActualOccupancy();
    
    // Update local cells array with counts from cell counter manager
    // to ensure consistency across the application
    cells.forEach(cell => {
      cell.currentCount = cellCounterManager.getCellCount(cell.id);
    });
    
    // Re-render cells to update the UI
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
  async function updateStatistics() {
    // Update status counter with backend API statistics (includes ALL inmates, not just page-specific)
    if (statusCounter && statusCounter.isReady()) {
      // Try to load from API first (shows total of all inmates)
      const apiLoaded = await statusCounter.loadFromAPI();
      
      // Fallback to local count if API fails (shouldn't happen in normal operation)
      if (!apiLoaded) {
        console.warn('Failed to load statistics from API, using local count as fallback');
        statusCounter.updateFromInmates(inmates);
      }
    }
  }

// ========================================
// UNIFIED INMATE MODAL (SweetAlert2 + Tailwind, responsive)
// ========================================
async function openUnifiedInmateModal(inmate) {
  // Fetch fresh data with points history from backend
  try {
    const response = await fetch(`/api/inmates/${inmate.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.data) {
      // Use fresh data with points history
      inmate = data.data;
    }
  } catch (error) {
    console.error('Error fetching inmate details:', error);
    // Continue with existing data if fetch fails
  }
  
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

  // Get theme-aware colors from ThemeManager
  const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
  
  const overviewHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <!-- Desktop: Profile Card -->
        <div class="hidden lg:flex flex-col items-center w-full">
          <div class="flex items-center justify-center mb-4">
            <div class="relative group rounded-full ${isDarkMode ? 'bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 shadow-lg shadow-blue-700/60' : 'bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 shadow-lg shadow-blue-200/60'} p-1 cursor-pointer" data-avatar-upload data-inmate-id="${inmate.id}">
              <img 
                src="${getInmateAvatarUrl(inmate)}" 
                alt="${name}'s avatar" 
                class="h-28 w-28 object-cover rounded-full ${isDarkMode ? 'border-gray-800' : 'border-white'} shadow-md"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" class="drop-shadow-lg">
                  <rect width="24" height="24" fill="none"/>
                  <path fill="white" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM21.41 6.34l-3.75-3.75l-2.53 2.54l3.75 3.75z" stroke-width="0.3" stroke="white"/>
                </svg>
              </div>
        </div>
        </div>
          <div class="flex flex-col items-center w-full">
            <h2 class="text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mt-2">${name}</h2>
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
          <div class="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden ${isDarkMode ? 'ring-2 ring-blue-700 bg-blue-900' : 'ring-2 ring-blue-200 bg-blue-100'} flex items-center justify-center mb-2 cursor-pointer" data-avatar-upload data-inmate-id="${inmate.id}">
            <img 
              src="${getInmateAvatarUrl(inmate)}" 
              alt="${name}'s avatar" 
              class="w-full h-full object-cover rounded-full ${isDarkMode ? 'border-gray-800' : 'border-white'} shadow"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" class="drop-shadow-lg">
                <rect width="24" height="24" fill="none"/>
                <path fill="white" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM21.41 6.34l-3.75-3.75l-2.53 2.54l3.75 3.75z" stroke-width="0.3" stroke="white"/>
              </svg>
            </div>
          </div>
          <h2 class="text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}">${name}</h2>
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
        <div class="rounded-lg border ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}">
          <button data-accordion-toggle="basic" class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium ${isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-50'} rounded-t-lg cursor-pointer">
            <span>Basic Information</span>
            <svg class="h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
          </button>
          <div data-accordion-panel="basic" class="px-4 py-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} hidden lg:block">
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt class="${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">DOB</dt><dd class="${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${formatDate(inmate.dateOfBirth)}</dd>
              <dt class="${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">Age</dt><dd class="${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${inmate.age}</dd>
              <dt class="${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">Gender</dt><dd class="${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${inmate.gender}</dd>
              <dt class="${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">Address</dt><dd class="${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${formatAddress(inmate) || '—'}</dd>
            </dl>
          </div>
        </div>
        <!-- Legal & Assignment (accordion) -->
        <div class="rounded-lg border ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}">
          <button data-accordion-toggle="legal" class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium ${isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-50'} rounded-t-lg cursor-pointer">
            <span>Legal & Assignment</span>
            <svg class="h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
          </button>
          <div data-accordion-panel="legal" class="px-4 py-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} hidden lg:block">
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt class="${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">Admission Date</dt><dd class="${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${formatDate(inmate.admissionDate)}</dd>
              <dt class="${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">Work / Job</dt><dd class="${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${inmate.job || '—'}</dd>
              <dt class="${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">Crime Committed</dt><dd class="${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${inmate.crime}</dd>
              <dt class="${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">Sentence</dt><dd class="${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${formatSentenceWithReduction(inmate, true)}</dd>
              <dt class="${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">Cell Assignment</dt><dd class="${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${inmate.cell ? `${inmate.cell.name} (${inmate.cell.location || 'Location N/A'})` : 'Not Assigned'}</dd>
              ${inmate.status === 'Released' && inmate.releasedAt ? `
                <dt class="${isDarkMode ? 'text-amber-400' : 'text-amber-600'}">Released On</dt>
                <dd class="${isDarkMode ? 'text-amber-200' : 'text-amber-800'} font-semibold">
                  ${new Date(inmate.releasedAt).toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </dd>
              ` : ''}
              ${inmate.status === 'Transferred' && inmate.transferredAt ? `
                <dt class="${isDarkMode ? 'text-blue-400' : 'text-blue-600'}">Transferred On</dt>
                <dd class="${isDarkMode ? 'text-blue-200' : 'text-blue-800'} font-semibold">
                  ${new Date(inmate.transferredAt).toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </dd>
              ` : ''}
              ${inmate.status === 'Transferred' && inmate.transferDestination ? `
                <dt class="${isDarkMode ? 'text-blue-400' : 'text-blue-600'}">Transfer Destination</dt>
                <dd class="${isDarkMode ? 'text-blue-200' : 'text-blue-800'}">${inmate.transferDestination}</dd>
              ` : ''}
              <dt class="${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">Additional</dt><dd class="${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">ID #${inmate.id.toString().padStart(4,'0')} • ${daysInCustody(inmate)} days in custody</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  `;

  const medicalRecords = Array.isArray(inmate.medicalRecords) ? inmate.medicalRecords : [];
  
  // Helper function to format vitals
  const formatVitals = (vitals) => {
    if (!vitals) return '—';
    const parts = [];
    if (vitals.blood_pressure) parts.push(`BP: ${vitals.blood_pressure}`);
    if (vitals.heart_rate) parts.push(`HR: ${vitals.heart_rate}`);
    if (vitals.temperature) parts.push(`Temp: ${vitals.temperature}°C`);
    if (vitals.weight) parts.push(`Weight: ${vitals.weight}kg`);
    return parts.length > 0 ? parts.join(', ') : '—';
  };

  // Helper function to format array fields
  const formatArray = (arr) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return '—';
    return arr.join(', ');
  };

  // Medical Status Badge Helper
  const getMedicalStatusBadge = (status) => {
    switch(status) {
      case 'Healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Under Treatment':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Not Assessed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };
  
  // Desktop table rows only
  const medicalRecordsDesktopList = medicalRecords.map((m, idx) => {
    const vitalsText = formatVitals(m.vitals);
    const allergiesText = formatArray(m.allergies);
    const medicationsText = formatArray(m.medications);

    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    const darkClass = isDarkMode ? 'dark' : '';
    const textColor = isDarkMode ? 'text-gray-100' : 'text-white';

    return `
      <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${darkClass}">
        <td class="px-4 py-3 text-sm ${textColor} whitespace-nowrap">${formatDate(m.date)}</td>
        <td class="px-5 py-3 text-sm ${textColor} whitespace-nowrap w-[160px] md:max-w-xs text-ellipsis overflow-hidden">${m.diagnosis}</td>
        <td class="px-4 py-3 text-sm ${textColor} whitespace-nowrap">${m.treatment}</td>
        <td class="px-4 py-3 text-sm ${textColor} whitespace-nowrap">${vitalsText}</td>
        <td class="px-6 py-3 text-sm ${textColor} whitespace-nowrap w-[138px] md:max-w-xs text-ellipsis overflow-hidden">${allergiesText}</td>
        <td class="px-5 py-3 text-sm ${textColor} whitespace-nowrap w-[140px] md:max-w-xs text-ellipsis overflow-hidden">${medicationsText}</td>
        <td class="px-4 py-3 text-sm ${textColor} italic whitespace-nowrap">${m.notes || '—'}</td>
        <td class="px-4 py-3 text-xs ${textColor} whitespace-nowrap">${m.recordedBy || 'System'}</td>
      </tr>
    `;
  }).join('');

  // Mobile grid cards for better readability
  const medicalRecordsMobileList = medicalRecords.map((m, idx) => {
    const vitalsText = formatVitals(m.vitals);
    const allergiesText = formatArray(m.allergies);
    const medicationsText = formatArray(m.medications);

    return `
      <div class="grid grid-cols-1 gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
        <!-- Date and Recorded By Row -->
        <div class="grid grid-cols-2 gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
          <div>
            <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Date</div>
            <div class="text-sm font-medium text-gray-900 dark:text-white">${formatDate(m.date)}</div>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Recorded By</div>
            <div class="text-sm text-gray-600 dark:text-gray-300">${m.recordedBy || 'System'}</div>
          </div>
        </div>
        
        <!-- Diagnosis Row -->
        <div>
          <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Diagnosis</div>
          <div class="text-sm font-medium text-gray-900 dark:text-white">${m.diagnosis}</div>
        </div>
        
        <!-- Treatment Row -->
        <div>
          <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Treatment</div>
          <div class="text-sm text-gray-700 dark:text-gray-300">${m.treatment}</div>
        </div>
        
        <!-- Vitals Row -->
        <div>
          <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Vitals</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">${vitalsText}</div>
        </div>
        
        <!-- Allergies and Medications Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Allergies</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">${allergiesText}</div>
          </div>
          <div>
            <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Medications</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">${medicationsText}</div>
          </div>
        </div>
        
        <!-- Notes (if exists) -->
        ${m.notes ? `
          <div class="pt-2 border-t border-gray-100 dark:border-gray-700">
            <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Notes</div>
            <div class="text-sm text-gray-700 dark:text-gray-300 italic">${m.notes}</div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
  
  const medicalHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      <!-- Profile Section - Responsive -->
      <div class="lg:col-span-1">
        <!-- Desktop: Profile Card -->
        <div class="hidden lg:flex flex-col items-center w-full">
          <div class="flex items-center justify-center mb-4">
            <div class="relative group rounded-full bg-gradient-to-br from-teal-100 via-teal-200 to-emerald-300 shadow-lg shadow-teal-200/60 p-1 cursor-pointer" data-avatar-upload data-inmate-id="${inmate.id}">
              <img 
                src="${getInmateAvatarUrl(inmate)}" 
                alt="${name}'s avatar" 
                class="h-28 w-28 object-cover rounded-full border-4 border-white shadow-md"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" class="drop-shadow-lg">
                  <rect width="24" height="24" fill="none"/>
                  <path fill="white" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM21.41 6.34l-3.75-3.75l-2.53 2.54l3.75 3.75z" stroke-width="0.3" stroke="white"/>
                </svg>
              </div>
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
            <!-- Medical Status Badge -->
            <span class="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getMedicalStatusBadge(inmate.medicalStatus)}">
              <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              ${inmate.medicalStatus || 'Not Assessed'}
            </span>
          </div>
        </div>
        
        <!-- Mobile/Tablet: Stacked Profile Card -->
        <div class="flex flex-col items-center lg:hidden gap-2 mb-4">
          <div class="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-2 ring-teal-200 dark:ring-teal-700 bg-gradient-to-br from-teal-100 to-emerald-200 flex items-center justify-center shadow-lg cursor-pointer" data-avatar-upload data-inmate-id="${inmate.id}">
            <img 
              src="${getInmateAvatarUrl(inmate)}" 
              alt="${name}'s avatar" 
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" class="drop-shadow-lg">
                <rect width="24" height="24" fill="none"/>
                <path fill="white" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM21.41 6.34l-3.75-3.75l-2.53 2.54l3.75 3.75z" stroke-width="0.3" stroke="white"/>
              </svg>
            </div>
          </div>
          <h2 class="text-base sm:text-lg font-bold text-gray-800 dark:text-white text-center">${name}</h2>
          <div class="flex flex-wrap items-center justify-center gap-2">
            <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(inmate.status)}">
              ${inmate.status || '—'}
            </span>
            <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getMedicalStatusBadge(inmate.medicalStatus)}">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              ${inmate.medicalStatus || 'Not Assessed'}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Content Section -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Medical Information Card -->
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
          <div class="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white">Current Medical Information</h3>
            </div>
          </div>
          
          <div class="p-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Medical Status -->
              <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <svg class="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Medical Status</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white mt-1">${inmate.medicalStatus || 'Not Assessed'}</p>
                </div>
              </div>
              
              <!-- Last Check -->
              <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Last Medical Check</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white mt-1">${inmate.lastMedicalCheck ? formatDate(inmate.lastMedicalCheck) : 'Not available'}</p>
                </div>
              </div>
            </div>
            
            <!-- Medical Notes -->
            ${inmate.medicalNotes ? `
              <div class="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
                <div class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">General Notes</p>
                    <p class="text-sm text-gray-700 dark:text-gray-300 break-words">${inmate.medicalNotes}</p>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Medical Records History -->
        <div class="rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} overflow-hidden">
          <!-- Header with Toggle and Action Button -->
          <div class="${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'} px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="flex items-center gap-2">
                <button type="button" id="toggle-medical-records" class="p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors cursor-pointer">
                  <svg id="medical-chevron" class="w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div>
                  <h3 class="text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}">Medical Records History</h3>
                  <p class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} hidden sm:block">Click to expand/collapse</p>
                </div>
              </div>
              <button type="button" id="add-medical-record-modal" class="inline-flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                <span class="hidden sm:inline">Add Medical Record</span>
                <span class="sm:hidden">Add Record</span>
              </button>
            </div>
          </div>
          
          <!-- Records Table/Cards (Collapsible) -->
          <div id="medical-records-container" class="transition-all duration-300 overflow-hidden">
            ${medicalRecords.length > 0 ? `
              <!-- Desktop Table View (only visible on md+ screens) -->
              <div class="hidden md:block overflow-x-auto">
                <div class="max-h-96 overflow-y-auto">
                  <table class="w-full text-left">
                    <thead class="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0">
                      <tr>
                        <th class="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase whitespace-nowrap">Date</th>
                        <th class="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Diagnosis</th>
                        <th class="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Treatment</th>
                        <th class="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Vitals</th>
                        <th class="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Allergies</th>
                        <th class="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Medications</th>
                        <th class="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Notes</th>
                        <th class="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase whitespace-nowrap">Recorded By</th>
                      </tr>
                    </thead>
                    <tbody id="medical-records-tbody">
                      ${medicalRecordsDesktopList}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <!-- Mobile Grid View (only visible on <md screens) -->
              <div id="medical-records-mobile" class="block md:hidden max-h-96 overflow-y-auto p-3">
                ${medicalRecordsMobileList}
              </div>
            ` : `
              <div class="text-center py-8 px-4">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center">
                    <svg class="w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs sm:text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}">No Medical Records Yet</p>
                    <p class="text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1">Click "Add Medical Record" to create the first entry</p>
                  </div>
                </div>
              </div>
            `}
          </div>
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
  async function fetchRecentVisits(inmateId) {
    try {
      // Fetch visitors for this specific inmate
      const response = await fetch(`/api/visitors?inmate_id=${inmateId}&per_page=20&sort=created_at&order=desc`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch visitation records');
      
      const json = await response.json();
      const visitors = json?.data || [];
      
      // Transform visitor data to match expected format
      return visitors.map(visitor => {
        // Use schedule from latest_log only - show N/A if no schedule set
        let visitDate = 'N/A';
        if (visitor.latest_log && visitor.latest_log.schedule) {
          visitDate = new Date(visitor.latest_log.schedule).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
        }

        // Determine status badge
        // Only show status if visitor has a visitation_log entry (schedule was set)
        // Status values from visitation_logs: 1 = Approved, 2 = Pending, 0 = Denied/Declined
        let status = 'N/A';
        
        if (visitor.latest_log && visitor.latest_log.status !== undefined) {
          const statusValue = visitor.latest_log.status;
          
          if (statusValue === 1 || statusValue === '1' || statusValue === 'Approved') {
            status = 'Approved';
          } else if (statusValue === 0 || statusValue === '0' || statusValue === 'Denied' || statusValue === 'Declined') {
            status = 'Declined';
          } else {
            // status === 2 or 'Pending' or anything else
            status = 'Pending';
          }
        }

        // Calculate duration (mock data since we don't have actual duration)
        const duration = status === 'Approved' ? Math.floor(Math.random() * 60) + 30 : null;

        return {
          visitor: visitor.name || 'Unknown Visitor',
          relationship: visitor.relationship || '—',
          purpose: 'N/A', // As requested - we don't have this data
          date: visitDate,
          duration: duration,
          status: status
        };
      });
    } catch (error) {
      console.error('Error fetching recent visits:', error);
      return [];
    }
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
      <!-- Left Side: Avatar Section -->
      <div class="lg:col-span-1">
        <!-- Desktop: Profile Card -->
        <div class="hidden lg:flex flex-col items-center w-full">
          <div class="flex items-center justify-center mb-4">
            <div class="relative group rounded-full bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 shadow-lg shadow-blue-200/60 p-1 cursor-pointer" data-avatar-upload data-inmate-id="${inmate.id}">
              <img 
                src="${getInmateAvatarUrl(inmate)}" 
                alt="${name}'s avatar" 
                class="h-28 w-28 object-cover rounded-full border-4 border-white shadow-md"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" class="drop-shadow-lg">
                  <rect width="24" height="24" fill="none"/>
                  <path fill="white" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM21.41 6.34l-3.75-3.75l-2.53 2.54l3.75 3.75z" stroke-width="0.3" stroke="white"/>
                </svg>
              </div>
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
        
        <!-- Mobile: Horizontal Layout -->
        <div class="lg:hidden flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="flex-shrink-0">
            <div class="w-20 h-20 rounded-full overflow-hidden ring-2 ring-blue-200 bg-blue-100 flex items-center justify-center">
              <img 
                src="${getInmateAvatarUrl(inmate)}" 
                alt="${name}'s avatar" 
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-white truncate">${name}</h2>
            <span 
              class="mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClasses(inmate.status)}"
              aria-label="Inmate status: ${inmate.status || 'Unknown'}"
            >
              ${inmate.status || '—'}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Right Side: Points System -->
      <div class="lg:col-span-2 space-y-4">
      <!-- Points Summary with Progress -->
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
        <div class="flex items-center justify-between gap-4 mb-3">
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Points Summary</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">Cumulative points based on activities</p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold ${pointsTotal >= 0 ? 'text-green-600' : 'text-red-500'}">${pointsTotal}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Total Points</div>
          </div>
        </div>
        <div class="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
          <div class="h-2 bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style="width: ${Math.min((pointsTotal / 500) * 100, 100)}%"></div>
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">${pointsTotal} / 500 points</div>
      </div>
      
      <!-- Add Points Button -->
      <div class="flex justify-end">
        <button type="button" id="add-points-entry-modal" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Points Entry
        </button>
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

// [Romarc Dre 1/2]
  const allowedVisitors = getAllowedVisitors(inmate);
  const visits = getRecentVisits(inmate);
  const allowedList = allowedVisitors.map((v, idx) => `
    <li class="group relative flex items-center gap-4 p-3 md:p-4 rounded-xl border ${isDarkMode ? 'border-gray-800 bg-gray-900/80 hover:bg-gray-900' : 'border-gray-200 bg-white/80 hover:bg-white'} transition shadow-sm hover:shadow-md">
      <!-- Left avatar/icon with subtle gradient ring -->
      <div class="flex-shrink-0">
        <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${isDarkMode ? 'from-blue-500/10 to-purple-500/5' : 'from-blue-500/10 to-purple-500/10'} ring-2 ${isDarkMode ? 'ring-blue-500/10' : 'ring-blue-500/10'} flex items-center justify-center">
          ${v.photo_path 
            ? `<img 
                class="w-10 h-10 p-1 rounded-full ring-2 ${isDarkMode ? 'ring-gray-500' : 'ring-gray-300'} object-cover" 
                src="${window.location.origin}/storage/visitor-photos/${v.photo_path}"
                alt="${v.name}'s photo"
                onerror="this.style.display='none'; this.parentElement.querySelector('.initials').style.display='flex'"
              />`
            : ''}
          <div class="initials ${v.photo_path ? 'hidden' : ''} w-10 h-10 p-1 rounded-full ring-2 ${isDarkMode ? 'ring-gray-500 bg-gray-800 text-gray-300' : 'ring-gray-300 bg-gray-100 text-gray-600'} flex items-center justify-center text-sm font-medium">
            ${v.name ? v.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '??'}
          </div>
        </div>
      </div>

      <!-- Right content: name + meta chips + contact grid -->
      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-3">
          <button type="button" data-open-visitor="${idx}" class="block truncate text-sm sm:text-base font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded">
            ${v.name}
          </button>
          <span class="hidden sm:inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Allowed</span>
        </div>

        <!-- Meta chips: relationship / id info -->
        <div class="mt-1 flex flex-wrap items-center gap-1">
          ${v.relationship ? `<span class=\"inline-flex items-center rounded-md ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'} px-2 py-0.5 text-[10px]\">${v.relationship}</span>` : ''}
          ${v.idType ? `<span class=\"inline-flex items-center rounded-md ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'} px-2 py-0.5 text-[10px]\">${v.idType}</span>` : ''}
          ${v.idNumber ? `<span class=\"inline-flex items-center rounded-md ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'} px-2 py-0.5 text-[10px]\">${v.idNumber}</span>` : ''}
        </div>

        <!-- Contact grid -->
        <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">
          ${v.phone ? `<div class=\"flex items-center gap-2 truncate\"><span>📞</span><span class=\"truncate\">${v.phone}</span></div>` : ''}
          ${v.email ? `<div class=\"flex items-center gap-2 truncate\"><span>✉️</span><span class=\"truncate\">${v.email}</span></div>` : ''}
          ${v.address ? `<div class=\"flex items-center gap-2 truncate sm:col-span-2\"><span>📍</span><span class=\"truncate\">${v.address}</span></div>` : ''}
        </div>
      </div>

      <!-- Status chip (mobile) -->
      <span class="sm:hidden ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Allowed</span>
    </li>
  `).join('');
  // Generate visitation HTML with backend data
  async function generateVisitationHTML(inmate) {
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    // Fetch real visitation data from backend
    const visits = await fetchRecentVisits(inmate.id);
    
    const visitsCards = visits.map(v => `
      <div class="rounded-lg border ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} p-3">
        <div class="flex items-center justify-between">
          <div class="text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${v.visitor}</div>
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${v.status === 'Approved' ? 'bg-green-500/10 text-green-600' : v.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' : v.status === 'Completed' ? 'bg-blue-500/10 text-blue-600' : v.status === 'Cancelled' ? 'bg-gray-500/10 text-gray-600' : 'bg-red-500/10 text-red-600'}">${v.status || '—'}</span>
        </div>
        <div class="mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">${v.date}${v.relationship ? ` • ${v.relationship}` : ''}</div>
        ${v.purpose ? `<div class=\"mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}\">${v.purpose}</div>` : ''}
        <div class="mt-2 flex text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} gap-4">
          ${v.duration ? `<span>⏱ ${v.duration} min</span>` : ''}
        </div>
      </div>
    `).join('');
    
    const visitsRows = visits.map(v => `
      <tr class="border-b ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-100 hover:bg-gray-50'}">
        <td class="px-3 py-2 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${v.date}</td>
        <td class="px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${v.visitor}</td>
        <td class="px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${v.relationship || '—'}</td>
        <td class="px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${v.purpose || '—'}</td>
        <td class="px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${v.duration ? `${v.duration} min` : '—'}</td>
        <td class="px-3 py-2">
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${v.status === 'Approved' ? 'bg-green-500/10 text-green-600' : v.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' : v.status === 'Completed' ? 'bg-blue-500/10 text-blue-600' : v.status === 'Cancelled' ? 'bg-gray-500/10 text-gray-600' : 'bg-red-500/10 text-red-600'}">${v.status || '—'}</span>
        </td>
      </tr>
    `).join('');
    // Dre Dapita kol ang imo eh fix [Katong View List Niya]
    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1 rounded-lg border ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} p-4">
          <h3 class="text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3">Allowed Visitors</h3>
          <ul class="space-y-3">
            ${allowedList || `<li class="text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">No allowed visitors configured</li>`}
          </ul>
        </div>
        <div class="lg:col-span-2 rounded-lg border ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} overflow-hidden">
          <div class="p-4">
            <h3 class="text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3">Recent Visits</h3>
          </div>
          <!-- Mobile cards -->
          <div class="sm:hidden p-4 pt-0 space-y-3">
            ${visitsCards || `<div class="text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">No visit records</div>`}
          </div>
          <!-- Desktop table -->
          <div class="hidden sm:block overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="${isDarkMode ? 'bg-gray-800/60' : 'bg-gray-50'}">
                <tr>
                  <th class="px-3 py-2 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Date</th>
                  <th class="px-3 py-2 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Visitor</th>
                  <th class="px-3 py-2 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Relationship</th>
                  <th class="px-3 py-2 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Purpose</th>
                  <th class="px-3 py-2 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Duration</th>
                  <th class="px-3 py-2 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Status</th>
                </tr>
              </thead>
              <tbody>
                ${visitsRows || `<tr><td colspan="6" class="px-3 py-6 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">No visit records</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // Keep the old static version for backward compatibility
  const staticVisits = getRecentVisits(inmate);
  const visitsCards = staticVisits.map(v => `
    <div class="rounded-lg border ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} p-3">
      <div class="flex items-center justify-between">
        <div class="text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${v.visitor}</div>
        <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${v.status === 'Approved' ? 'bg-green-500/10 text-green-600' : v.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' : v.status === 'Completed' ? 'bg-blue-500/10 text-blue-600' : v.status === 'Cancelled' ? 'bg-gray-500/10 text-gray-600' : 'bg-red-500/10 text-red-600'}">${v.status || '—'}</span>
      </div>
      <div class="mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">${formatDate(v.date)}${v.relationship ? ` • ${v.relationship}` : ''}</div>
      ${v.purpose ? `<div class=\"mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}\">${v.purpose}</div>` : ''}
      <div class="mt-2 flex text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} gap-4">
        ${v.duration ? `<span>⏱ ${v.duration} min</span>` : ''}
      </div>
    </div>
  `).join('');
  const visitsRows = staticVisits.map(v => `
    <tr class="border-b ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-100 hover:bg-gray-50'}">
      <td class="px-3 py-2 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${formatDate(v.date)}</td>
      <td class="px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${v.visitor}</td>
      <td class="px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${v.relationship || '—'}</td>
      <td class="px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${v.purpose || '—'}</td>
      <td class="px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}">${v.duration ? `${v.duration} min` : '—'}</td>
      <td class="px-3 py-2">
        <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${v.status === 'Approved' ? 'bg-green-500/10 text-green-600' : v.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' : v.status === 'Completed' ? 'bg-blue-500/10 text-blue-600' : v.status === 'Cancelled' ? 'bg-gray-500/10 text-gray-600' : 'bg-red-500/10 text-red-600'}">${v.status || '—'}</span>
      </td>
    </tr>
  `).join('');
  const visitationHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1 rounded-lg border ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} p-4">
        <h3 class="text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3">Allowed Visitors</h3>
        <ul class="space-y-3">
          ${allowedList || `<li class="text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">No allowed visitors configured</li>`}
        </ul>
      </div>
      <div class="lg:col-span-2 rounded-lg border ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} overflow-hidden">
        <div class="p-4">
          <h3 class="text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3">Recent Visits</h3>
        </div>
        <!-- Mobile cards -->
        <div class="sm:hidden p-4 pt-0 space-y-3">
          ${visitsCards || `<div class="text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">No visit records</div>`}
        </div>
        <!-- Desktop table -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="${isDarkMode ? 'bg-gray-800/60' : 'bg-gray-50'}">
              <tr>
                <th class="px-3 py-2 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Date</th>
                <th class="px-3 py-2 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Visitor</th>
                <th class="px-3 py-2 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Relationship</th>
                <th class="px-3 py-2 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Purpose</th>
                <th class="px-3 py-2 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Duration</th>
                <th class="px-3 py-2 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Status</th>
              </tr>
            </thead>
            <tbody>
              ${visitsRows || `<tr><td colspan="6" class="px-3 py-6 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">No visit records</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
// [Romarc Last Dre 1/2]

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

  async function attachPointsModalHandlers(inmate) {
    const addPtsBtn = document.getElementById('add-points-entry-modal');
    if (!addPtsBtn || !inmate.id) return;
    
    addPtsBtn.addEventListener('click', async () => {
      // Get theme-aware colors from ThemeManager
      const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
      const palette = window.ThemeManager ? window.ThemeManager.getPalette() : {
        background: '#111827',
        text: '#F9FAFB',
        primary: '#3B82F6'
      };
      
      const result = await Swal.fire({
        title: 'Add Points Entry',
        html: `
          <div class="text-left space-y-4">
            ${pointsSystem.renderQuickButtons()}
            
            <div>
              <label class="block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Date *</label>
              <input type="date" id="pts-date" class="w-full rounded ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                     value="${new Date().toISOString().split('T')[0]}" required />
            </div>
            
            <div>
              <label class="block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Points *</label>
              <input type="number" id="pts-points" class="w-full rounded ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                     placeholder="Enter points (+/-)" required />
            </div>
            
            <div>
              <label class="block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Activity *</label>
              <select id="pts-activity" class="w-full rounded ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                <option value="">Select Activity</option>
                <option value="Good behavior">Good behavior</option>
                <option value="Work assignment">Work assignment</option>
                <option value="Educational program">Educational program</option>
                <option value="Community service">Community service</option>
                <option value="Rule violation">Rule violation (-)</option>
                <option value="Fighting">Fighting (-)</option>
                <option value="Disobedience">Disobedience (-)</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Notes</label>
              <textarea id="pts-notes" class="w-full rounded ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="2"></textarea>
            </div>
          </div>
        `,
        background: palette.background,
        color: palette.text,
        showCancelButton: true,
        confirmButtonText: 'Save Points',
        confirmButtonColor: palette.primary,
        cancelButtonColor: '#DC2626',
        didOpen: () => {
          document.querySelectorAll('[data-quick-add]').forEach(btn => {
            btn.addEventListener('click', () => {
              document.getElementById('pts-points').value = btn.getAttribute('data-quick-add');
            });
          });
          document.querySelectorAll('[data-quick-subtract]').forEach(btn => {
            btn.addEventListener('click', () => {
              document.getElementById('pts-points').value = '-' + btn.getAttribute('data-quick-subtract');
            });
          });
        },
        preConfirm: () => {
          const points = parseInt(document.getElementById('pts-points').value);
          const activity = document.getElementById('pts-activity').value;
          const date = document.getElementById('pts-date').value;
          
          if (!points || !activity || !date) {
            Swal.showValidationMessage('Please fill all required fields');
            return false;
          }
          
          return { points, activity, notes: document.getElementById('pts-notes').value, date };
        }
      });
      
      if (result.isConfirmed && result.value) {
        try {
          const response = await fetch(`/api/inmates/${inmate.id}/points/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify(result.value)
          });
          
          const data = await response.json();
          
          if (data.success) {
            await Swal.fire({
              icon: 'success',
              title: 'Points Added!',
              text: 'Points entry saved successfully. Reopen modal to see updates.',
              timer: 2000,
              showConfirmButton: false,
              background: '#111827',
              color: '#F9FAFB'
            });
            
            // Close the unified modal to refresh
            window.Swal.close();
            
            // Optionally reload the page or refresh the inmate list
            await renderInmates();
          } else {
            throw new Error(data.message || 'Failed to add points');
          }
        } catch (error) {
          console.error('Error adding points:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to add points',
            background: '#111827',
            color: '#F9FAFB'
          });
        }
      }
    });
  }

  async function attachMedicalRecordsHandlers(inmate) {
    // Toggle medical records table
    const toggleBtn = document.getElementById('toggle-medical-records');
    const container = document.getElementById('medical-records-container');
    const chevron = document.getElementById('medical-chevron');
    
    if (toggleBtn && container && chevron) {
      let isOpen = true; // Start open
      
      toggleBtn.addEventListener('click', () => {
        isOpen = !isOpen;
        if (isOpen) {
          container.style.maxHeight = container.scrollHeight + 'px';
          chevron.style.transform = 'rotate(0deg)';
        } else {
          container.style.maxHeight = '0';
          chevron.style.transform = 'rotate(-90deg)';
        }
      });
      
      // Set initial state
      container.style.maxHeight = container.scrollHeight + 'px';
    }
    
    const addMedicalBtn = document.getElementById('add-medical-record-modal');
    if (!addMedicalBtn || !inmate.id) return;
    
    addMedicalBtn.addEventListener('click', async () => {
      const medicalRecordsManager = createMedicalRecordsManager();
      
      await medicalRecordsManager.openAddMedicalRecordModal(
        inmate.id, 
        inmate.medicalStatus, 
        async (updatedInmateData, formData) => {
          // Update the medical records - both table and cards
          const recordsTbody = document.getElementById('medical-records-tbody');
          const recordsCards = document.getElementById('medical-records-cards');
          
          if (updatedInmateData.medicalRecords) {
            const medicalRecords = updatedInmateData.medicalRecords;
            const newRecordsList = medicalRecords.map((m, idx) => {
              const vitalsText = formatVitals(m.vitals);
              const allergiesText = formatArray(m.allergies);
              const medicationsText = formatArray(m.medications);
              
              return `
                <!-- Desktop Table Row -->
                <tr class="hidden md:table-row border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td class="px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">${formatDate(m.date)}</td>
                  <td class="px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100">${m.diagnosis}</td>
                  <td class="px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300">${m.treatment}</td>
                  <td class="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400">${vitalsText}</td>
                  <td class="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400">${allergiesText}</td>
                  <td class="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400">${medicationsText}</td>
                  <td class="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 italic">${m.notes || '—'}</td>
                  <td class="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-500">${m.recordedBy || 'System'}</td>
                </tr>
                
                <!-- Mobile Card -->
                <div class="md:hidden p-3 mb-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div class="flex justify-between items-start mb-2">
                    <div class="font-semibold text-sm text-gray-900 dark:text-gray-100">${m.diagnosis}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">${formatDate(m.date)}</div>
                  </div>
                  <div class="space-y-1.5 text-xs">
                    <div><span class="font-medium text-gray-700 dark:text-gray-300">Treatment:</span> <span class="text-gray-600 dark:text-gray-400">${m.treatment}</span></div>
                    ${vitalsText !== '—' ? `<div><span class="font-medium text-gray-700 dark:text-gray-300">Vitals:</span> <span class="text-gray-600 dark:text-gray-400">${vitalsText}</span></div>` : ''}
                    ${allergiesText !== '—' ? `<div><span class="font-medium text-gray-700 dark:text-gray-300">Allergies:</span> <span class="text-gray-600 dark:text-gray-400">${allergiesText}</span></div>` : ''}
                    ${medicationsText !== '—' ? `<div><span class="font-medium text-gray-700 dark:text-gray-300">Medications:</span> <span class="text-gray-600 dark:text-gray-400">${medicationsText}</span></div>` : ''}
                    ${m.notes ? `<div><span class="font-medium text-gray-700 dark:text-gray-300">Notes:</span> <span class="text-gray-600 dark:text-gray-400 italic">${m.notes}</span></div>` : ''}
                    <div class="text-gray-500 dark:text-gray-500 pt-1.5 border-t border-gray-200 dark:border-gray-700">Recorded by ${m.recordedBy || 'System'}</div>
                  </div>
                </div>
              `;
            }).join('');
            
            if (recordsTbody) recordsTbody.innerHTML = newRecordsList;
            if (recordsCards) recordsCards.innerHTML = newRecordsList;
          }
          
          // Show success message
          await Swal.fire({
            icon: 'success',
            title: 'Medical Record Added!',
            text: 'Medical record saved successfully.',
            timer: 2000,
            showConfirmButton: false,
            background: '#111827',
            color: '#F9FAFB',
            iconColor: '#14B8A6'
          });
          
          // Refresh the inmate list
          await renderInmates();
        }
      );
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
    background: isDarkMode ? '#111827' : '#FFFFFF',
    color: isDarkMode ? '#F9FAFB' : '#111827',
    didOpen: () => {
      // Attach close handler to custom close button
      const closeBtn = document.getElementById('swal-custom-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          window.Swal.close();
        });
      }
      
      // Change color based on theme toggler
      const themeToggler = document.getElementById('theme-toggler');
      if (themeToggler) {
        themeToggler.addEventListener('click', () => {
          const bgColor = themeToggler.checked ? '#111827' : '#F9FAFB';
          const textColor = themeToggler.checked ? '#F9FAFB' : '#111827';
          const swal = document.querySelector('.swal2-container');
          if (swal) {
            swal.style.backgroundColor = bgColor;
            swal.style.color = textColor;
          }
        });
      }
      
      const container = document.getElementById('tab-content');
      const setActive = async (id) => {
        document.querySelectorAll('button[data-tab]').forEach((btn) => {
          const isActive = btn.getAttribute('data-tab') === id;
          btn.setAttribute('data-active', String(isActive));
        });
        if (!container) return;
        if (id === 'overview') container.innerHTML = overviewHTML;
        if (id === 'medical') {
          container.innerHTML = medicalHTML;
          attachMedicalRecordsHandlers(inmate);
        }
        if (id === 'points') {
          container.innerHTML = pointsHTML;
          attachPointsModalHandlers(inmate);
        }
        if (id === 'visitation') {
          // Show loading state while fetching data
          container.innerHTML = `
            <div class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span class="ml-2 text-gray-500 dark:text-gray-400">Loading visitation records...</span>
            </div>
          `;
          
          // Fetch real visitation data and update content
          const visitationHTML = await generateVisitationHTML(inmate);
          container.innerHTML = visitationHTML;
        }
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
async function openVisitorModal(visitor) {
  // Get theme-aware colors from ThemeManager
  const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
  
  const width = isMobile() ? '95vw' : '32rem';
  const avatarSrc = (() => {
    if (visitor && typeof visitor.avatarDataUrl === 'string' && visitor.avatarDataUrl) {
      const baseUrl = window.location.origin;
      return `${baseUrl}/storage/${visitor.avatarDataUrl}`;
    }
    return '/images/logo/bjmp_logo.png';
  })();

  const name = visitor?.name || 'Visitor';
  const relationship = visitor?.relationship || '—';
  const idType = visitor?.idType || '';
  const idNumber = visitor?.idNumber || '';
  const phone = visitor?.phone || visitor?.contactNumber || '';
  const email = visitor?.email || '';
  const address = visitor?.address || '';

  const visitorId = visitor?.id || visitor?.visitor_id || null;
  const inmateIdForConjugal = visitor?.inmate_id || visitor?.inmate?.id || null;
  const relationshipLower = (relationship || '').toLowerCase();
  const shouldShowConjugalSection = relationshipLower === 'wife' || relationshipLower === 'husband' || relationshipLower === 'spouse';
  let conjugalDetails = null;
  let hasConjugalRegistration = false;

  if (shouldShowConjugalSection && visitorId && inmateIdForConjugal) {
    try {
      const eligibilityResponse = await checkEligibility(visitorId, inmateIdForConjugal);
      
      // Debug logging
      console.log('Conjugal eligibility response:', eligibilityResponse);
      
      // Check if conjugal visit registration exists
      hasConjugalRegistration = eligibilityResponse?.conjugal_visit && eligibilityResponse.conjugal_visit.id;
      const conjugalVisitId = hasConjugalRegistration ? eligibilityResponse.conjugal_visit.id : null;
      
      console.log('Has conjugal registration:', hasConjugalRegistration, 'ID:', conjugalVisitId);
      
      let documentsResponse = null;

      if (conjugalVisitId) {
        try {
          documentsResponse = await getDocumentInfo(conjugalVisitId);
          console.log('Document info loaded:', documentsResponse);
        } catch (docError) {
          console.error('Failed to load document info:', docError);
          // Continue even if document info fails
        }
      }

      conjugalDetails = {
        eligibility: eligibilityResponse,
        documents: documentsResponse,
        conjugalVisitId,
        hasRegistration: hasConjugalRegistration,
      };
      
      console.log('Conjugal details prepared:', conjugalDetails);
    } catch (error) {
      console.error('Failed to load conjugal visit data:', error);
      // Even if there's an error, we should still show the section for Wife/Husband/Spouse
      conjugalDetails = {
        eligibility: null,
        documents: null,
        conjugalVisitId: null,
        hasRegistration: false,
        error: error.message,
      };
    }
  }

  const headerHTML = `
    <div class="relative">
      <!-- Banner Background with animated gradient -->
      <div class="absolute inset-0 h-40 rounded-t-xl bg-gradient-to-br ${isDarkMode ? 'from-blue-500/10 via-violet-500/10 to-purple-500/10' : 'from-blue-100 via-violet-50 to-purple-100'} animate-gradient-slow overflow-hidden">
        <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>
      
      <!-- Profile Content -->
      <div class="relative pt-8 px-6">
        <!-- Avatar and Info -->
        <div class="flex flex-col items-center text-center">
          <div class="relative group">
            <div class="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 animate-pulse-slow opacity-50 blur-xl group-hover:opacity-70 transition-opacity"></div>
            <div class="relative shrink-0">
              <div class="p-1 rounded-full bg-gradient-to-br ${isDarkMode ? 'from-blue-500/20 to-purple-500/20' : 'from-blue-200 to-purple-200'}">
                <div class="rounded-full p-0.5 bg-gradient-to-br from-blue-500 to-purple-500">
                  <img 
                    src="${avatarSrc}" 
                    alt="${name}" 
                    class="h-24 w-24 rounded-full object-cover ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} ring-2 ring-white/10 transition-transform transform group-hover:scale-105" 
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4 space-y-2">
            <h2 class="text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}">${name}</h2>
            <div class="inline-flex items-center px-4 py-1.5 rounded-full ${isDarkMode ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 ring-1 ring-blue-400/20' : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 ring-1 ring-blue-100'} text-sm font-medium backdrop-blur-sm transition-all hover:shadow-lg">
              ${relationship}${idType ? ` • ${idType}` : ''}${idNumber ? ` (${idNumber})` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
// [Romarc Dre 2/2]
  // Get visitor status and time data from latest log
  const hasVisitationLog = visitor?.latestLog && (visitor.latestLog.status !== undefined || visitor.latestLog.time_in || visitor.latestLog.time_out);
  const status = visitor?.latestLog?.status !== undefined ? visitor.latestLog.status : null;
  const timeIn = visitor?.latestLog?.time_in || null;
  const timeOut = visitor?.latestLog?.time_out || null;
  
  // Format status badge
  let statusBadge = '';
  if (status === 1 || status === '1' || status === 'Approved') {
    statusBadge = '<span class="inline-flex items-center rounded-full bg-green-500/10 text-green-500 px-3 py-1 text-xs font-medium">Approved</span>';
  } else if (status === 0 || status === '0' || status === 'Denied' || status === 'Declined') {
    statusBadge = '<span class="inline-flex items-center rounded-full bg-red-500/10 text-red-500 px-3 py-1 text-xs font-medium">Declined</span>';
  } else if (status === 2 || status === '2' || status === 'Pending') {
    statusBadge = '<span class="inline-flex items-center rounded-full bg-blue-500/10 text-blue-500 px-3 py-1 text-xs font-medium">Pending</span>';
  } else {
    statusBadge = '<span class="inline-flex items-center rounded-full bg-gray-500/10 text-gray-500 px-3 py-1 text-xs font-medium">N/A</span>';
  }
  
  // Format time strings
  const formatTime = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const timeInFormatted = formatTime(timeIn);
  const timeOutFormatted = formatTime(timeOut);
  // Dre Dayon to dapita tong, para sa VISITOR INFO MODAL
  const bodyHTML = `
    <div class="mt-6 grid grid-cols-1 gap-6">
      <!-- Contact Information Card -->
      <div class="relative overflow-hidden rounded-xl border ${isDarkMode ? 'border-gray-700/50 bg-gray-800/20' : 'border-gray-200 bg-white'} p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
        <div class="absolute inset-0 bg-gradient-to-br ${isDarkMode ? 'from-blue-500/5 via-transparent to-purple-500/5' : 'from-blue-50/50 via-transparent to-purple-50/50'} pointer-events-none"></div>
        <div class="relative">
          <div class="flex items-center gap-3 mb-5">
            <div class="rounded-xl p-2.5 ${isDarkMode ? 'bg-blue-500/10 ring-1 ring-blue-500/20' : 'bg-blue-50 ring-1 ring-blue-100'} text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">Contact Details</h3>
          </div>
          <div class="space-y-4">
            <div class="flex items-center gap-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} group">
              <div class="flex-shrink-0 w-10 h-10 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} flex items-center justify-center transition-colors group-hover:bg-blue-50 group-hover:text-blue-500 dark:group-hover:bg-blue-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <span class="text-sm font-medium">${phone || 'No phone number provided'}</span>
            </div>
            <div class="flex items-center gap-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} group">
              <div class="flex-shrink-0 w-10 h-10 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} flex items-center justify-center transition-colors group-hover:bg-purple-50 group-hover:text-purple-500 dark:group-hover:bg-purple-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <span class="text-sm font-medium">${email || 'No email provided'}</span>
            </div>
            <div class="flex items-center gap-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} group">
              <div class="flex-shrink-0 w-10 h-10 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} flex items-center justify-center transition-colors group-hover:bg-green-50 group-hover:text-green-500 dark:group-hover:bg-green-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <span class="text-sm font-medium break-words">${address || 'No address provided'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Visit Status Card -->
      <div class="relative overflow-hidden rounded-xl border ${isDarkMode ? 'border-gray-700/50 bg-gray-800/20' : 'border-gray-200 bg-white'} p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
        <div class="absolute inset-0 bg-gradient-to-br ${isDarkMode ? 'from-purple-500/5 via-transparent to-pink-500/5' : 'from-purple-50/50 via-transparent to-pink-50/50'} pointer-events-none"></div>
        <div class="relative">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
              <div class="rounded-xl p-2.5 ${isDarkMode ? 'bg-purple-500/10 ring-1 ring-purple-500/20' : 'bg-purple-50 ring-1 ring-purple-100'} text-purple-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">Visit Status</h3>
            </div>
            ${statusBadge}
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-6">
            <!-- Time In Card -->
            <div class="rounded-xl ${isDarkMode ? 'bg-gray-700/30 ring-1 ring-white/5' : 'bg-gray-50/80 ring-1 ring-black/5'} p-4 transition-all hover:shadow-md">
              <div class="text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1.5">Time In</div>
              <div class="font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}">${timeInFormatted || 'Not recorded'}</div>
            </div>
            
            <!-- Time Out Card -->
            <div class="rounded-xl ${isDarkMode ? 'bg-gray-700/30 ring-1 ring-white/5' : 'bg-gray-50/80 ring-1 ring-black/5'} p-4 transition-all hover:shadow-md">
              <div class="text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1.5">Time Out</div>
              <div class="font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}">${timeOutFormatted || 'Not recorded'}</div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Time In Button -->
            <button 
              data-time-in-btn
              data-visitor-id="${visitor?.id || ''}"
              class="group relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                timeIn 
                  ? `${isDarkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-400'} cursor-not-allowed` 
                  : `${isDarkMode ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-green-50 text-green-600 hover:bg-green-100'} cursor-pointer`
              }"
              ${timeIn ? 'disabled' : ''}
              title="Record Time In"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" class=""><rect width="24" height="24" fill="none"/><path fill="currentColor" d="m12 11.6l2.5 2.5q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-2.8-2.8q-.15-.15-.225-.337T10 11.975V8q0-.425.288-.712T11 7t.713.288T12 8zM18 6h-2q-.425 0-.712-.287T15 5t.288-.712T16 4h2V2q0-.425.288-.712T19 1t.713.288T20 2v2h2q.425 0 .713.288T23 5t-.288.713T22 6h-2v2q0 .425-.288.713T19 9t-.712-.288T18 8zm-7 15q-1.875 0-3.512-.7t-2.863-1.925T2.7 15.512T2 12t.7-3.512t1.925-2.863T7.488 3.7T11 3q.275 0 .513.013t.512.062q.425 0 .713.288t.287.712t-.288.713t-.712.287q-.275 0-.513-.038T11 5Q8.05 5 6.025 7.025T4 12t2.025 4.975T11 19t4.975-2.025T18 12q0-.425.288-.712T19 11t.713.288T20 12q0 1.875-.7 3.513t-1.925 2.862t-2.863 1.925T11 21"/></svg>
              <span>Time In</span>
            </button>
            
            <!-- Time Out Button -->
            <button 
              data-time-out-btn
              data-visitor-id="${visitor?.id || ''}"
              class="group relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                !timeIn || timeOut
                  ? `${isDarkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
                  : `${isDarkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'} cursor-pointer`
              }"
              ${!timeIn || timeOut ? 'disabled' : ''}
              title="Record Time Out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16"><rect width="16" height="16" fill="none"/><path fill="currentColor" d="M6.229.199a8 8 0 0 1 9.727 6.964a.75.75 0 0 1-1.492.157a6.5 6.5 0 1 0-7.132 7.146a.75.75 0 1 1-.154 1.492a8 8 0 0 1-.95-15.76ZM8 3a.75.75 0 0 1 .75.75V9h-4a.75.75 0 0 1 0-1.5h2.5V3.75A.75.75 0 0 1 8 3m2.22 7.22a.75.75 0 0 1 1.06 0L13 11.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L14.06 13l1.72 1.72a.75.75 0 1 1-1.06 1.06L13 14.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L11.94 13l-1.72-1.72a.75.75 0 0 1 0-1.06"/></svg>
              <span>Time Out</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  const bodyHTML = `
    <div class="mt-4 grid grid-cols-1 gap-3">
      <div class="rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} p-3 sm:p-4">
        <h3 class="text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-2">Contact</h3>
        <div class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1">
          <div>${phone ? `📞 ${phone}` : '—'}</div>
          <div>${email ? `✉️ ${email}` : '—'}</div>
          <div class="break-words">${address ? `📍 ${address}` : '—'}</div>
        </div>
      </div>
      
      ${visitStatusHTML}
      ${conjugalCardHTML}
    </div>
  `;
// [Romarc Last Dre 2/2] 
  const html = `
    <div class="max-h-[70vh] overflow-y-auto space-y-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
    background: isDarkMode ? '#111827' : '#FFFFFF',
    color: isDarkMode ? '#F9FAFB' : '#111827',
    customClass: {
      container: 'swal-responsive-container',
      popup: 'swal-responsive-popup',
      content: 'swal-responsive-content',
      confirmButton: 'cursor-pointer'
    },
    didOpen: () => {
      // Attach document management button handlers
      const docButtons = document.querySelectorAll('[data-conjugal-doc]');
      docButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          const action = btn.getAttribute('data-conjugal-doc');
          const docType = btn.getAttribute('data-conjugal-type');
          const conjugalVisitId = btn.getAttribute('data-conjugal-id');
          
          if (!conjugalVisitId || !docType) return;
          
          try {
            if (action === 'view') {
              await viewDocument(conjugalVisitId, docType);
            } else if (action === 'download') {
              await downloadDocument(conjugalVisitId, docType);
            } else if (action === 'delete') {
              const result = await deleteDocument(conjugalVisitId, docType);
              if (result) {
                // Reload the modal with updated data
                openVisitorModal(visitor);
              }
            }
          } catch (error) {
            console.error('Error handling document action:', error);
            const Swal = (await import('sweetalert2')).default;
            await Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.message || 'Failed to perform action',
              background: isDarkMode ? '#111827' : '#FFFFFF',
              color: isDarkMode ? '#F9FAFB' : '#111827',
            });
          }
        });
      });

      // Attach approval/rejection button handlers
      const approveBtn = document.querySelector('[data-conjugal-approve]');
      const rejectBtn = document.querySelector('[data-conjugal-reject]');
      
      if (approveBtn) {
        approveBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          const conjugalVisitId = approveBtn.getAttribute('data-conjugal-id');
          if (!conjugalVisitId) return;

          const result = await window.Swal.fire({
            title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Approve Registration</span>`,
            html: `<p class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Are you sure you want to approve this conjugal visit registration?</p>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Approve',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            background: isDarkMode ? '#111827' : '#FFFFFF',
            color: isDarkMode ? '#F9FAFB' : '#111827',
          });

          if (result.isConfirmed) {
            try {
              const response = await fetch(`/api/conjugal-visits/registrations/${conjugalVisitId}/status`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                  'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ status: 1 }), // 1 = Approved
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to approve registration');
              }

              await window.Swal.fire({
                icon: 'success',
                title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Approved</span>`,
                text: 'Conjugal visit registration has been approved successfully.',
                background: isDarkMode ? '#111827' : '#FFFFFF',
                color: isDarkMode ? '#F9FAFB' : '#111827',
                confirmButtonColor: '#10b981',
              });

              // Reload the modal with updated data
              openVisitorModal(visitor);
            } catch (error) {
              console.error('Error approving conjugal visit registration:', error);
              await window.Swal.fire({
                icon: 'error',
                title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Error</span>`,
                text: error.message || 'Failed to approve registration. Please try again.',
                background: isDarkMode ? '#111827' : '#FFFFFF',
                color: isDarkMode ? '#F9FAFB' : '#111827',
                confirmButtonColor: '#ef4444',
              });
            }
          }
        });
      }

      if (rejectBtn) {
        rejectBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          const conjugalVisitId = rejectBtn.getAttribute('data-conjugal-id');
          if (!conjugalVisitId) return;

          const result = await window.Swal.fire({
            title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Reject Registration</span>`,
            html: `<p class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Are you sure you want to reject this conjugal visit registration?</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Reject',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            background: isDarkMode ? '#111827' : '#FFFFFF',
            color: isDarkMode ? '#F9FAFB' : '#111827',
          });

          if (result.isConfirmed) {
            try {
              const response = await fetch(`/api/conjugal-visits/registrations/${conjugalVisitId}/status`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                  'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ status: 0 }), // 0 = Denied
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reject registration');
              }

              await window.Swal.fire({
                icon: 'success',
                title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Rejected</span>`,
                text: 'Conjugal visit registration has been rejected.',
                background: isDarkMode ? '#111827' : '#FFFFFF',
                color: isDarkMode ? '#F9FAFB' : '#111827',
                confirmButtonColor: '#ef4444',
              });

              // Reload the modal with updated data
              openVisitorModal(visitor);
            } catch (error) {
              console.error('Error rejecting conjugal visit registration:', error);
              await window.Swal.fire({
                icon: 'error',
                title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Error</span>`,
                text: error.message || 'Failed to reject registration. Please try again.',
                background: isDarkMode ? '#111827' : '#FFFFFF',
                color: isDarkMode ? '#F9FAFB' : '#111827',
                confirmButtonColor: '#ef4444',
              });
            }
          }
        });
      }
      
      // Attach Time In button handler
      const timeInBtn = document.querySelector('[data-time-in-btn]');
      if (timeInBtn && !timeInBtn.disabled) {
        timeInBtn.addEventListener('click', async () => {
          const visitorId = timeInBtn.getAttribute('data-visitor-id');
          if (!visitorId) return;
          
          try {
            // Record time in
            const response = await fetch(`/api/visitors/${visitorId}/time-in`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'X-Requested-With': 'XMLHttpRequest'
              }
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to record time in');
            }
            
            const result = await response.json();
            
            // Show success message
            await Swal.fire({
              icon: 'success',
              title: 'Time In Recorded!',
              text: `Time in recorded at ${formatTime(result.data.time_in)}`,
              timer: 2000,
              showConfirmButton: false,
              background: '#111827',
              color: '#F9FAFB',
              iconColor: '#1dca00'
            });
            
            // Update visitor's latestLog with fresh data from backend
            if (result.data) {
              visitor.latestLog = result.data;
              // Reopen the modal with updated data
              openVisitorModal(visitor);
            }
          } catch (error) {
            console.error('Error recording time in:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.message || 'Failed to record time in. Please try again.',
              background: '#111827',
              color: '#F9FAFB',
              confirmButtonColor: '#3B82F6'
            });
          }
        });
      }
      
      // Attach Time Out button handler
      const timeOutBtn = document.querySelector('[data-time-out-btn]');
      if (timeOutBtn && !timeOutBtn.disabled) {
        timeOutBtn.addEventListener('click', async () => {
          const visitorId = timeOutBtn.getAttribute('data-visitor-id');
          if (!visitorId) return;
          
          try {
            // Record time out
            const response = await fetch(`/api/visitors/${visitorId}/time-out`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'X-Requested-With': 'XMLHttpRequest'
              }
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to record time out');
            }
            
            const result = await response.json();
            
            // Show success message
            await Swal.fire({
              icon: 'success',
              title: 'Time Out Recorded!',
              text: `Time out recorded at ${formatTime(result.data.time_out)}`,
              timer: 2000,
              showConfirmButton: false,
              background: '#111827',
              color: '#F9FAFB',
              iconColor: '#1dca00'
            });
            
            // Update visitor's latestLog with fresh data from backend
            if (result.data) {
              visitor.latestLog = result.data;
              // Reopen the modal with updated data
              openVisitorModal(visitor);
            }
          } catch (error) {
            console.error('Error recording time out:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.message || 'Failed to record time out. Please try again.',
              background: '#111827',
              color: '#F9FAFB',
              confirmButtonColor: '#3B82F6'
            });
          }
        });
      }
    }
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

  // ============================================================================
  // AVATAR UPLOAD EVENT LISTENERS
  // ============================================================================
  // Event delegation for avatar upload clicks
  document.addEventListener('click', (e) => {
    const avatarUpload = e.target.closest('[data-avatar-upload]');
    if (avatarUpload) {
      e.stopPropagation();
      const inmateId = avatarUpload.getAttribute('data-inmate-id');
      const inmate = inmates.find(i => i.id === parseInt(inmateId));
      if (inmate) {
        const name = [inmate.first_name, inmate.last_name].filter(Boolean).join(' ');
        console.log('Found inmate:', inmate);
        console.log('Generated name:', name);
        // Fallback to ID if name is empty
        const finalName = name || `Inmate_${inmateId}`;
        openAvatarUpload(inmateId, finalName);
      } else {
        console.error('Inmate not found for ID:', inmateId);
      }
    }
  });

  // ============================================================================
  // AVATAR UPLOAD FUNCTION
  // ============================================================================
  /**
   * Generate SVG avatar based on inmate name
   * @param {string} name - Full name of the inmate
   * @returns {string} - Data URI of the generated SVG
   */
  function generateAvatarSVG(name) {
    if (!name || name === 'N/A') return '/images/logo/bjmp_logo.png';
    
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    // Generate a consistent color based on the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
        <rect width="128" height="128" fill="hsl(${hue}, 60%, 50%)"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".35em" fill="white" font-size="48" font-family="Arial, sans-serif" font-weight="600">
          ${initials}
        </text>
      </svg>
    `;
    
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }

  /**
   * Open file manager to upload avatar for an inmate
   * @param {number} inmateId - ID of the inmate
   * @param {string} inmateName - Name of the inmate
   */
  function openAvatarUpload(inmateId, inmateName) {
    console.log('openAvatarUpload called with:', { inmateId, inmateName });
    
    // Create hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file size
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB');
          return;
        }
        
        // Upload immediately
        await uploadInmateAvatar(inmateId, file, inmateName);
      }
    });
    
    // Add to DOM and click to open file manager
    document.body.appendChild(input);
    input.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(input);
    }, 100);
  }

  /**
   * Upload inmate avatar to server
   * @param {number} inmateId - ID of the inmate
   * @param {File} file - Image file to upload
   * @param {string} inmateName - Name of the inmate
   */
  async function uploadInmateAvatar(inmateId, file, inmateName) {
    try {
      // Show simple loading
      const loadingDiv = document.createElement('div');
      loadingDiv.innerHTML = 'Uploading...';
      loadingDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 20px;
        border-radius: 8px;
        z-index: 9999;
        font-family: system-ui;
      `;
      document.body.appendChild(loadingDiv);

      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('inmate_id', parseInt(inmateId));
      formData.append('inmate_name', inmateName);

      // Debug: Log what we're sending
      console.log('Uploading avatar for inmate:', inmateId, inmateName);
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const response = await fetch('/api/inmates/upload-avatar', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
        },
        body: formData
      });

      const data = await response.json();

      // Remove loading
      document.body.removeChild(loadingDiv);

      if (data.success) {
        // Reload immediately to show new avatar
        window.location.reload();
      } else {
        console.error('Upload validation errors:', data.errors);
        let errorMessage = data.message || 'Unknown error';
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          errorMessage = errorMessages.join(', ');
        }
        alert('Upload failed: ' + errorMessage);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      // Remove loading if it exists
      const loading = document.querySelector('div[style*="position: fixed"]');
      if (loading) document.body.removeChild(loading);
      alert('Upload failed: ' + (error.message || 'Network error'));
    }
  }

  /**
   * Get inmate avatar URL with fallback to generated SVG
   * @param {Object} inmate - Inmate object
   * @returns {string} - Avatar URL
   */
  function getInmateAvatarUrl(inmate) {
    if (inmate.avatar_path && inmate.avatar_filename) {
      return `/storage/inmates/avatars/${inmate.id}/${inmate.avatar_filename}`;
    }
    
    const name = [inmate.first_name, inmate.last_name].filter(Boolean).join(' ');
    return generateAvatarSVG(name);
  }

  // Expose avatar functions globally
  window.openAvatarUpload = openAvatarUpload;
  window.generateAvatarSVG = generateAvatarSVG;
  window.getInmateAvatarUrl = getInmateAvatarUrl;

  // Expose components for external use
  window.inmateStatusCounter = statusCounter;
  window.cellCounterManager = cellCounterManager;
  
  // Debug function
  window.debugCellCounter = () => {
    console.log('Cell Counter Manager Debug Info:', cellCounterManager.getDebugInfo());
    console.log('Cells data:', cells);
  };
});

