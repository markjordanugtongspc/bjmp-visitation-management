// Search, Sort, and Filter Component for Inmates Management
// - Advanced search functionality with real-time filtering
// - Multi-field sorting capabilities
// - Category-based filtering system
// - API integration with debounced search
// - Responsive design with Tailwind CSS

// ========================================
// SEARCH, SORT, AND FILTER CONFIGURATION
// ========================================

const SEARCH_CONFIG = {
  debounceDelay: 300, // milliseconds
  minSearchLength: 2,
  maxResults: 100
};

const SORT_OPTIONS = {
  name: { field: 'name', label: 'Name', type: 'string' },
  id: { field: 'id', label: 'ID', type: 'number' },
  capacity: { field: 'capacity', label: 'Capacity', type: 'number' },
  currentCount: { field: 'currentCount', label: 'Occupancy', type: 'number' },
  type: { field: 'type', label: 'Type', type: 'string' },
  location: { field: 'location', label: 'Location', type: 'string' },
  status: { field: 'status', label: 'Status', type: 'string' },
  createdAt: { field: 'created_at', label: 'Created Date', type: 'date' },
  updatedAt: { field: 'updated_at', label: 'Updated Date', type: 'date' }
};

const FILTER_CATEGORIES = {
  status: {
    label: 'Status',
    options: [
      { value: '', label: 'All Status' },
      { value: 'Active', label: 'Active' },
      { value: 'Maintenance', label: 'Maintenance' },
      { value: 'Inactive', label: 'Inactive' }
    ]
  },
  occupancy: {
    label: 'Occupancy',
    options: [
      { value: '', label: 'All Occupancy' },
      { value: 'empty', label: 'Empty (0%)' },
      { value: 'low', label: 'Low (1-25%)' },
      { value: 'medium', label: 'Medium (26-75%)' },
      { value: 'high', label: 'High (76-90%)' },
      { value: 'full', label: 'Full (91-100%)' }
    ]
  }
};

// ========================================
// CORE SEARCH, SORT, AND FILTER CLASS
// ========================================

class SearchSortFilterManager {
  constructor(config = {}) {
    this.config = { ...SEARCH_CONFIG, ...config };
    this.searchTimeout = null;
    this.currentData = [];
    this.filteredData = [];
    this.sortField = 'name';
    this.sortDirection = 'asc';
    this.activeFilters = {};
    this.searchQuery = '';
    
    // Callbacks
    this.onDataChange = null;
    this.onSearchStart = null;
    this.onSearchComplete = null;
    this.onFilterChange = null;
    this.onSortChange = null;
  }

  /**
   * Initialize the search, sort, and filter system
   */
  initialize(containerId, options = {}) {
    this.containerId = containerId;
    this.options = {
      showSearch: true,
      showSort: true,
      showFilters: true,
      searchPlaceholder: 'Search...',
      ...options
    };

    this.render();
    this.attachEventListeners();
    return this;
  }

  /**
   * Render the search, sort, and filter interface
   */
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container with ID "${this.containerId}" not found`);
      return;
    }

    const isMobile = window.innerWidth < 640;
    
    container.innerHTML = `
      <div class="space-y-3 sm:space-y-4">
        <!-- Search and Controls Row -->
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
          ${this.options.showSearch ? this.renderSearchInput() : ''}
          <div class="flex flex-col sm:flex-row gap-2">
            ${this.options.showSort ? this.renderSortControls() : ''}
            ${this.options.showFilters ? this.renderFilterControls() : ''}
          </div>
        </div>

        <!-- Active Filters Display -->
        ${this.renderActiveFilters()}

        <!-- Results Summary -->
        ${this.renderResultsSummary()}
      </div>
    `;
  }

  /**
   * Render search input
   */
  renderSearchInput() {
    return `
      <div class="flex-1">
        <div class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.5 3.75a6.75 6.75 0 105.196 11.163l3.646 3.646a.75.75 0 101.06-1.06l-3.646-3.646A6.75 6.75 0 0010.5 3.75zM6 10.5a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z"/>
          </svg>
          <input type="text" 
                 id="search-input" 
                 placeholder="${this.options.searchPlaceholder}" 
                 class="w-full pl-9 sm:pl-10 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 value="${this.searchQuery}">
          <button id="clear-search-btn" 
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer ${this.searchQuery ? '' : 'hidden'}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render sort controls
   */
  renderSortControls() {
    const sortOptions = Object.entries(SORT_OPTIONS).map(([key, option]) => 
      `<option value="${key}" ${this.sortField === key ? 'selected' : ''}>${option.label}</option>`
    ).join('');

    return `
      <div class="flex gap-2">
        <select id="sort-field" class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          ${sortOptions}
        </select>
        <button id="sort-direction-btn" 
                class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                title="Sort ${this.sortDirection === 'asc' ? 'Descending' : 'Ascending'}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${this.sortDirection === 'asc' ? 
              '<path d="M3 6h18M7 12h10M10 18h4"/>' : 
              '<path d="M3 18h18M7 12h10M10 6h4"/>'
            }
          </svg>
        </button>
      </div>
    `;
  }

  /**
   * Render filter controls
   */
  renderFilterControls() {
    const filterSelects = Object.entries(FILTER_CATEGORIES).map(([key, category]) => {
      const options = category.options.map(option => 
        `<option value="${option.value}" ${this.activeFilters[key] === option.value ? 'selected' : ''}>${option.label}</option>`
      ).join('');

      return `
        <select id="filter-${key}" 
                class="px-2 sm:px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          ${options}
        </select>
      `;
    }).join('');

    return filterSelects;
  }

  /**
   * Render active filters display
   */
  renderActiveFilters() {
    const activeFilters = Object.entries(this.activeFilters)
      .filter(([key, value]) => value && value !== '')
      .map(([key, value]) => {
        const category = FILTER_CATEGORIES[key];
        const option = category?.options.find(opt => opt.value === value);
        return { key, value, label: option?.label || value };
      });

    if (activeFilters.length === 0 && !this.searchQuery) {
      return '';
    }

    return `
      <div class="flex flex-wrap gap-2">
        ${this.searchQuery ? `
          <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.5 3.75a6.75 6.75 0 105.196 11.163l3.646 3.646a.75.75 0 101.06-1.06l-3.646-3.646A6.75 6.75 0 0010.5 3.75zM6 10.5a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z"/>
            </svg>
            "${this.searchQuery}"
            <button id="clear-search-filter" class="ml-1 hover:text-blue-600 dark:hover:text-blue-300 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </span>
        ` : ''}
        
        ${activeFilters.map(filter => `
          <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
            ${filter.label}
            <button data-filter-key="${filter.key}" class="ml-1 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </span>
        `).join('')}
        
        ${(activeFilters.length > 0 || this.searchQuery) ? `
          <button id="clear-all-filters" class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer">
            Clear all
          </button>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render results summary
   */
  renderResultsSummary() {
    const total = this.currentData.length;
    const filtered = this.filteredData.length;
    const hasSearch = this.searchQuery && this.searchQuery.trim();
    const hasFilters = Object.values(this.activeFilters).some(f => f && f !== '');
    
    if (total === 0) return '';

    let summaryText = '';
    if (filtered === 0 && (hasSearch || hasFilters)) {
      summaryText = 'No results found';
    } else if (filtered === total && !hasSearch && !hasFilters) {
      summaryText = `Showing all ${total} results`;
    } else {
      summaryText = `Showing ${filtered} of ${total} results`;
    }

    return `
      <div class="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
        ${summaryText}
        ${hasSearch || hasFilters ? ` (filtered)` : ''}
        ${hasSearch ? ` for "${this.searchQuery}"` : ''}
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Clear search button
    const clearSearchBtn = document.getElementById('clear-search-btn');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        this.clearSearch();
      });
    }

    // Sort field
    const sortField = document.getElementById('sort-field');
    if (sortField) {
      sortField.addEventListener('change', (e) => {
        this.setSortField(e.target.value);
      });
    }

    // Sort direction
    const sortDirectionBtn = document.getElementById('sort-direction-btn');
    if (sortDirectionBtn) {
      sortDirectionBtn.addEventListener('click', () => {
        this.toggleSortDirection();
      });
    }

    // Filter selects
    Object.keys(FILTER_CATEGORIES).forEach(key => {
      const filterSelect = document.getElementById(`filter-${key}`);
      if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
          this.setFilter(key, e.target.value);
        });
      }
    });

    // Clear individual filters
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-filter-key]')) {
        const filterKey = e.target.closest('[data-filter-key]').getAttribute('data-filter-key');
        this.clearFilter(filterKey);
      }
    });

    // Clear search filter
    document.addEventListener('click', (e) => {
      if (e.target.closest('#clear-search-filter')) {
        this.clearSearch();
      }
    });

    // Clear all filters
    document.addEventListener('click', (e) => {
      if (e.target.closest('#clear-all-filters')) {
        this.clearAllFilters();
      }
    });
  }

  /**
   * Handle search input with debouncing
   */
  handleSearch(query) {
    this.searchQuery = query;
    
    // Clear existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Show clear button
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', !query || !query.trim());
    }

    // Trigger search start callback
    if (this.onSearchStart) {
      this.onSearchStart(query);
    }

    // If query is empty, perform search immediately
    if (!query || !query.trim()) {
      this.performSearch();
      return;
    }

    // Debounce the search for non-empty queries
    this.searchTimeout = setTimeout(() => {
      this.performSearch();
    }, this.config.debounceDelay);
  }

  /**
   * Perform the actual search
   */
  async performSearch() {
    try {
      // Show loading state if searching
      if (this.searchQuery && this.searchQuery.trim()) {
        this.showSearchLoading();
      }

      // Always use API if endpoint is provided
      if (this.options.apiEndpoint) {
        const response = await this.searchViaAPI();
        if (response.success) {
          // Update current data with API results
          this.currentData = response.data;
          this.filteredData = response.data; // API already returns filtered results
          this.updateUI();
          
          // Trigger data change callback to update the UI
          if (this.onDataChange) {
            this.onDataChange(this.filteredData);
          }
          
          // Trigger search complete callback with API results
          if (this.onSearchComplete) {
            this.onSearchComplete(this.filteredData);
          }
        } else {
          console.error('API search failed:', response.message);
          this.filteredData = [];
          
          // Trigger data change callback with empty results
          if (this.onDataChange) {
            this.onDataChange([]);
          }
          
          if (this.onSearchComplete) {
            this.onSearchComplete([]);
          }
        }
      } else {
        // Fallback to client-side search if no API endpoint
        this.applyFiltersAndSort();
        if (this.onSearchComplete) {
          this.onSearchComplete(this.filteredData);
        }
      }

      // Hide loading state
      this.hideSearchLoading();
    } catch (error) {
      console.error('Search error:', error);
      this.hideSearchLoading();
      this.filteredData = [];
      if (this.onSearchComplete) {
        this.onSearchComplete([]);
      }
    }
  }

  /**
   * Show search loading state
   */
  showSearchLoading() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.classList.add('opacity-75');
      searchInput.disabled = true;
    }
  }

  /**
   * Hide search loading state
   */
  hideSearchLoading() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.classList.remove('opacity-75');
      searchInput.disabled = false;
    }
  }

  /**
   * Search via API
   */
  async searchViaAPI() {
    const params = new URLSearchParams();
    
    // Add search query
    if (this.searchQuery && this.searchQuery.trim()) {
      params.append('search', this.searchQuery.trim());
    }
    
    // Add filters
    Object.entries(this.activeFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        // Map occupancy filter to appropriate API parameter
        if (key === 'occupancy') {
          // For occupancy, we might need to handle this differently
          // For now, we'll pass it as is and let the backend handle it
          params.append('occupancy', value);
        } else {
          params.append(key, value);
        }
      }
    });

    // Add sorting parameters
    if (this.sortField && this.sortField !== 'name') {
      params.append('sort_by', this.sortField);
      params.append('sort_direction', this.sortDirection);
    }

    const url = `${this.options.apiEndpoint}${params.toString() ? '?' + params.toString() : ''}`;
    
    console.log('API Search URL:', url); // Debug log
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Search Response:', data); // Debug log
    
    return data;
  }

  /**
   * Apply filters and sorting to current data
   */
  applyFiltersAndSort() {
    let filtered = [...this.currentData];

    // Apply search filter with enhanced search logic
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => {
        // Search in specific fields with priority
        const searchFields = [
          item.name,           // Cell name (highest priority)
          item.type,           // Cell type
          item.location,       // Location
          item.status,         // Status
          item.id?.toString(), // ID
          item.capacity?.toString(), // Capacity
          item.currentCount?.toString() // Current count
        ];

        // Check if any field contains the search query
        return searchFields.some(field => 
          field && field.toString().toLowerCase().includes(query)
        );
      });
    }

    // Apply category filters
    Object.entries(this.activeFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        if (key === 'occupancy') {
          filtered = this.filterByOccupancy(filtered, value);
        } else {
          filtered = filtered.filter(item => item[key] === value);
        }
      }
    });

    // Apply sorting
    filtered = this.sortData(filtered);

    this.filteredData = filtered;
    this.updateUI();
  }

  /**
   * Filter by occupancy percentage
   */
  filterByOccupancy(data, occupancyType) {
    return data.filter(item => {
      const occupancyRate = (item.currentCount / item.capacity) * 100;
      
      switch (occupancyType) {
        case 'empty': return occupancyRate === 0;
        case 'low': return occupancyRate > 0 && occupancyRate <= 25;
        case 'medium': return occupancyRate > 25 && occupancyRate <= 75;
        case 'high': return occupancyRate > 75 && occupancyRate <= 90;
        case 'full': return occupancyRate > 90;
        default: return true;
      }
    });
  }

  /**
   * Sort data based on current sort settings
   */
  sortData(data) {
    const sortOption = SORT_OPTIONS[this.sortField];
    if (!sortOption) return data;

    return data.sort((a, b) => {
      let aVal = a[sortOption.field];
      let bVal = b[sortOption.field];

      // Handle different data types
      if (sortOption.type === 'number') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else if (sortOption.type === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else {
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();
      }

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Set sort field
   */
  setSortField(field) {
    this.sortField = field;
    
    // Use API if available, otherwise client-side
    if (this.options.apiEndpoint) {
      this.performSearch();
    } else {
      this.applyFiltersAndSort();
      if (this.onDataChange) {
        this.onDataChange(this.filteredData);
      }
    }
    
    if (this.onSortChange) {
      this.onSortChange(field, this.sortDirection);
    }
  }

  /**
   * Toggle sort direction
   */
  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    
    // Use API if available, otherwise client-side
    if (this.options.apiEndpoint) {
      this.performSearch();
    } else {
      this.applyFiltersAndSort();
      if (this.onDataChange) {
        this.onDataChange(this.filteredData);
      }
    }
    
    // Update button icon
    const sortBtn = document.getElementById('sort-direction-btn');
    if (sortBtn) {
      const icon = sortBtn.querySelector('svg');
      if (icon) {
        icon.innerHTML = this.sortDirection === 'asc' ? 
          '<path d="M3 6h18M7 12h10M10 18h4"/>' : 
          '<path d="M3 18h18M7 12h10M10 6h4"/>';
      }
    }
    
    if (this.onSortChange) {
      this.onSortChange(this.sortField, this.sortDirection);
    }
  }

  /**
   * Set filter value
   */
  setFilter(key, value) {
    this.activeFilters[key] = value;
    
    // Use API if available, otherwise client-side
    if (this.options.apiEndpoint) {
      this.performSearch();
    } else {
      this.applyFiltersAndSort();
      if (this.onDataChange) {
        this.onDataChange(this.filteredData);
      }
    }
    
    if (this.onFilterChange) {
      this.onFilterChange(key, value);
    }
  }

  /**
   * Clear specific filter
   */
  clearFilter(key) {
    delete this.activeFilters[key];
    
    // Use API if available, otherwise client-side
    if (this.options.apiEndpoint) {
      this.performSearch();
    } else {
      this.applyFiltersAndSort();
      if (this.onDataChange) {
        this.onDataChange(this.filteredData);
      }
    }
    
    // Reset select value
    const select = document.getElementById(`filter-${key}`);
    if (select) {
      select.value = '';
    }
    
    if (this.onFilterChange) {
      this.onFilterChange(key, '');
    }
  }

  /**
   * Clear search
   */
  clearSearch() {
    this.searchQuery = '';
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = '';
    }
    
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) {
      clearBtn.classList.add('hidden');
    }
    
    // Use API if available, otherwise client-side
    if (this.options.apiEndpoint) {
      this.performSearch();
    } else {
      this.applyFiltersAndSort();
      if (this.onDataChange) {
        this.onDataChange(this.filteredData);
      }
    }
  }

  /**
   * Clear all filters
   */
  clearAllFilters() {
    this.searchQuery = '';
    this.activeFilters = {};
    
    // Reset all inputs
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = '';
    }
    
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) {
      clearBtn.classList.add('hidden');
    }
    
    Object.keys(FILTER_CATEGORIES).forEach(key => {
      const select = document.getElementById(`filter-${key}`);
      if (select) {
        select.value = '';
      }
    });
    
    // Use API if available, otherwise client-side
    if (this.options.apiEndpoint) {
      this.performSearch();
    } else {
      this.applyFiltersAndSort();
      if (this.onDataChange) {
        this.onDataChange(this.filteredData);
      }
    }
  }

  /**
   * Update UI with current data
   */
  updateUI() {
    // Update active filters display
    const container = document.getElementById(this.containerId);
    if (container) {
      const activeFiltersContainer = container.querySelector('.space-y-3, .space-y-4');
      if (activeFiltersContainer) {
        const activeFiltersHTML = this.renderActiveFilters();
        const existingActiveFilters = activeFiltersContainer.querySelector('.flex.flex-wrap.gap-2');
        if (existingActiveFilters) {
          existingActiveFilters.outerHTML = activeFiltersHTML;
        } else if (activeFiltersHTML) {
          activeFiltersContainer.insertAdjacentHTML('beforeend', activeFiltersHTML);
        }
      }
    }

    // Update results summary
    const resultsSummary = this.renderResultsSummary();
    // This would be updated by the parent component
  }

  /**
   * Set data and trigger filtering
   */
  setData(data) {
    this.currentData = Array.isArray(data) ? data : [];
    
    // Only apply client-side filtering if no API endpoint is configured
    if (!this.options.apiEndpoint) {
      this.applyFiltersAndSort();
    } else {
      // For API mode, just set the filtered data to current data
      this.filteredData = [...this.currentData];
    }
    
    // Always trigger data change callback
    if (this.onDataChange) {
      this.onDataChange(this.filteredData);
    }
  }

  /**
   * Get filtered data
   */
  getFilteredData() {
    return this.filteredData;
  }

  /**
   * Get current search and filter state
   */
  getState() {
    return {
      searchQuery: this.searchQuery,
      activeFilters: { ...this.activeFilters },
      sortField: this.sortField,
      sortDirection: this.sortDirection,
      totalItems: this.currentData.length,
      filteredItems: this.filteredData.length
    };
  }

  /**
   * Set callbacks
   */
  setOnDataChange(callback) {
    this.onDataChange = callback;
    return this;
  }

  setOnSearchStart(callback) {
    this.onSearchStart = callback;
    return this;
  }

  setOnSearchComplete(callback) {
    this.onSearchComplete = callback;
    return this;
  }

  setOnFilterChange(callback) {
    this.onFilterChange = callback;
    return this;
  }

  setOnSortChange(callback) {
    this.onSortChange = callback;
    return this;
  }
}

// ========================================
// EXPORT FOR USE IN OTHER MODULES
// ========================================

export { SearchSortFilterManager, SORT_OPTIONS, FILTER_CATEGORIES, SEARCH_CONFIG };
