/**
 * Recent Visitor Requests Component
 * Fetches and displays recent visitation requests from visitation_logs and facial_recognition_visitation_requests tables
 */

// Global state for modal
let currentPage = 1;
let currentTypeFilter = 'all';
let currentStatusFilter = 'all';
let currentSearchQuery = '';
let totalPages = 1;
let totalRequests = 0;
let allFetchedRequests = []; // Store all fetched requests for client-side filtering

/**
 * Parse date from request (handles both manual and automatic requests)
 */
function parseRequestDate(request, type) {
  if (type === 'manual') {
    return request.schedule ? new Date(request.schedule) : new Date(request.created_at);
  } else {
    // Automatic request
    let visitDate = null;
    if (request.visit_date) {
      if (request.visit_time) {
        try {
          const timeDate = new Date(request.visit_time);
          if (!isNaN(timeDate.getTime())) {
            const dateOnly = new Date(request.visit_date);
            visitDate = new Date(dateOnly);
            visitDate.setHours(timeDate.getHours(), timeDate.getMinutes(), timeDate.getSeconds());
          } else {
            visitDate = new Date(`${request.visit_date}T${request.visit_time}`);
          }
        } catch (e) {
          visitDate = new Date(`${request.visit_date} ${request.visit_time}`);
        }
      } else {
        visitDate = new Date(request.visit_date);
      }
    } else {
      visitDate = new Date(request.created_at);
    }
    if (isNaN(visitDate.getTime())) {
      visitDate = new Date(request.created_at);
    }
    return visitDate;
  }
}

/**
 * Format request for display
 */
function formatRequest(request, type) {
  const date = parseRequestDate(request, type);
  
  let visitorName = '—';
  let inmateName = '—';
  let reason = 'N/A';
  
  if (type === 'manual') {
    visitorName = request.visitorDetails?.name || request.visitor || request.name || '—';
    inmateName = request.pdlDetails?.name || 
               (request.inmate?.first_name && request.inmate?.last_name 
                 ? `${request.inmate.first_name} ${request.inmate.last_name}` 
                 : '—');
    reason = request.reason_for_visit || 'N/A';
  } else {
    visitorName = request.visitor?.name || request.visitor?.full_name || '—';
    inmateName = request.inmate?.name || 
               request.inmate?.full_name ||
               (request.inmate?.first_name && request.inmate?.last_name 
                 ? `${request.inmate.first_name} ${request.inmate.last_name}` 
                 : '—');
    reason = request.notes || 'Automatic Visit';
  }
  
  return {
    type,
    id: request.id,
    visitorName,
    inmateName,
    date,
    reason,
    status: request.status
  };
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status, type) {
  if (type === 'manual') {
    if (status === 1 || status === '1' || status === 'Approved') {
      return '<span class="inline-flex items-center rounded-full bg-green-500/10 text-green-500 px-2 py-0.5 text-[11px]">Approved</span>';
    } else if (status === 0 || status === '0' || status === 'Denied' || status === 'Declined') {
      return '<span class="inline-flex items-center rounded-full bg-red-500/10 text-red-500 px-2 py-0.5 text-[11px]">Declined</span>';
    } else {
      return '<span class="inline-flex items-center rounded-full bg-blue-500/10 text-blue-500 px-2 py-0.5 text-[11px]">Pending</span>';
    }
  } else {
    if (status === 'approved' || status === 'Approved') {
      return '<span class="inline-flex items-center rounded-full bg-green-500/10 text-green-500 px-2 py-0.5 text-[11px]">Approved</span>';
    } else if (status === 'rejected' || status === 'Rejected') {
      return '<span class="inline-flex items-center rounded-full bg-red-500/10 text-red-500 px-2 py-0.5 text-[11px]">Declined</span>';
    } else {
      return '<span class="inline-flex items-center rounded-full bg-blue-500/10 text-blue-500 px-2 py-0.5 text-[11px]">Pending</span>';
    }
  }
}

/**
 * Format date for display
 */
function formatDate(date) {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Fetch all requests from API (for modal - fetches larger batch for client-side filtering)
 */
async function fetchAllRequests(typeFilter = 'all', statusFilter = 'all') {
  const allRequests = [];
  
  // Fetch manual requests (fetch larger batch - 100 items)
  if (typeFilter === 'all' || typeFilter === 'manual') {
    try {
      const params = new URLSearchParams({
        per_page: '100',
        page: '1',
        sort: 'created_at',
        order: 'desc'
      });
      
      const response = await fetch(`/api/visitation-requests?${params}`);
      if (response.ok) {
        const json = await response.json();
        const requests = json?.data || [];
        
        requests.forEach(request => {
          allRequests.push(formatRequest(request, 'manual'));
        });
      }
    } catch (error) {
      console.error('Error fetching manual requests:', error);
    }
  }
  
  // Fetch facial recognition requests (fetch larger batch - 100 items)
  if (typeFilter === 'all' || typeFilter === 'automatic') {
    try {
      const params = new URLSearchParams({
        per_page: '100',
        page: '1'
      });
      
      const response = await fetch(`/facial-recognition/visitation-requests?${params}`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
        },
        credentials: 'same-origin',
      });
      
      if (response.ok) {
        // Check if response is actually JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const json = await response.json();
          const requests = json?.requests?.data || json?.requests || [];
          
          requests.forEach(request => {
            allRequests.push(formatRequest(request, 'automatic'));
          });
        } else {
          // Response is not JSON (likely HTML redirect page)
          console.warn('Facial recognition API returned non-JSON response. Access may be denied.');
        }
      } else {
        // Handle error responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to fetch facial recognition requests:', response.status, errorData.message || response.statusText);
        } else {
          console.warn('Failed to fetch facial recognition requests:', response.status, '(Non-JSON response - likely access denied)');
        }
      }
    } catch (error) {
      // Only log if it's not a JSON parse error (which we handle above)
      if (!(error instanceof SyntaxError && error.message.includes('JSON'))) {
        console.error('Error fetching facial recognition requests:', error);
      } else {
        console.warn('Facial recognition API returned invalid JSON. Access may be denied.');
      }
    }
  }
  
  // Sort by date (most recent first)
  allRequests.sort((a, b) => b.date - a.date);
  
  return allRequests;
}

/**
 * Filter and paginate requests (client-side)
 */
function filterAndPaginateRequests(requests, page = 1, perPage = 5, search = '', typeFilter = 'all', statusFilter = 'all') {
  let filtered = [...requests];
  
  // Apply type filter
  if (typeFilter !== 'all') {
    filtered = filtered.filter(req => req.type === typeFilter);
  }
  
  // Apply status filter
  if (statusFilter !== 'all') {
    filtered = filtered.filter(req => {
      if (req.type === 'manual') {
        if (statusFilter === 'approved') return req.status === 1 || req.status === '1';
        if (statusFilter === 'pending') return req.status === 2 || req.status === '2';
        if (statusFilter === 'declined') return req.status === 0 || req.status === '0';
      } else {
        if (statusFilter === 'approved') return req.status === 'approved' || req.status === 'Approved';
        if (statusFilter === 'pending') return req.status === 'pending' || req.status === 'Pending';
        if (statusFilter === 'declined') return req.status === 'rejected' || req.status === 'Rejected';
      }
      return false;
    });
  }
  
  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(req => 
      req.visitorName.toLowerCase().includes(searchLower) ||
      req.inmateName.toLowerCase().includes(searchLower) ||
      req.reason.toLowerCase().includes(searchLower)
    );
  }
  
  // Calculate totals
  totalRequests = filtered.length;
  totalPages = Math.ceil(totalRequests / perPage);
  
  // Paginate
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paginated = filtered.slice(start, end);
  
  return paginated;
}

/**
 * Fetch requests from API (for dashboard - limited to 5)
 */
async function fetchRequests(page = 1, perPage = 5, search = '', typeFilter = 'all', statusFilter = 'all') {
  // For dashboard, just fetch first 5
  const allRequests = await fetchAllRequests(typeFilter, statusFilter);
  return filterAndPaginateRequests(allRequests, page, perPage, search, typeFilter, statusFilter);
}

/**
 * Initialize recent visitor requests (dashboard view - 5 items only)
 */
export async function initRecentVisitorRequests() {
  const tableBody = document.getElementById('recent-requests-tbody');
  const showMoreContainer = document.getElementById('recent-requests-show-more');
  
  if (!tableBody) {
    console.log('recent-requests-tbody not found, skipping initialization');
    return;
  }

  console.log('Initializing recent visitor requests...');

  try {
    // Fetch all requests to get total count
    const allRequests = await fetchAllRequests('all', 'all');
    totalRequests = allRequests.length;
    
    // Get first 5 for display
    const recentRequests = allRequests.slice(0, 5);
    
    console.log(`Total requests: ${totalRequests}, showing: ${recentRequests.length}`);
    
    if (!recentRequests.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            No recent visitation requests
          </td>
        </tr>
      `;
      if (showMoreContainer) {
        showMoreContainer.innerHTML = '';
      }
      return;
    }

    // Render table rows
    tableBody.innerHTML = '';
    recentRequests.forEach(request => {
      const formattedDate = formatDate(request.date);
      const statusBadge = getStatusBadge(request.status, request.type);

      tableBody.insertAdjacentHTML('beforeend', `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <td class="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
            ${request.visitorName}
            ${request.type === 'automatic' ? '<span class="ml-1 text-[10px] text-purple-600 dark:text-purple-400">(Auto)</span>' : ''}
          </td>
          <td class="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 max-w-[120px] truncate">${request.inmateName}</td>
          <td class="px-3 py-2 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap">${formattedDate}</td>
          <td class="px-3 py-2 text-xs text-gray-700 dark:text-gray-200 max-w-[100px] truncate">${request.reason}</td>
          <td class="px-3 py-2">${statusBadge}</td>
        </tr>
      `);
    });

    // Show "Show More" button if there are more than 5 requests
    if (showMoreContainer && totalRequests > 5) {
      showMoreContainer.innerHTML = `
        <div class="px-4 py-3 text-center border-t border-gray-200 dark:border-gray-800">
          <button id="show-more-requests-btn" class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium cursor-pointer transition-colors">
            Show More
          </button>
        </div>
      `;
      
      const showMoreBtn = document.getElementById('show-more-requests-btn');
      if (showMoreBtn) {
        showMoreBtn.addEventListener('click', openAllRequestsModal);
      }
    } else if (showMoreContainer) {
      showMoreContainer.innerHTML = '';
    }

  } catch (error) {
    console.error('Error loading recent visitor requests:', error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-8 text-center text-red-500 dark:text-red-400 text-sm">
          Failed to load visitor requests
        </td>
      </tr>
    `;
  }
}

/**
 * Open modal with all requests (search, filter, pagination)
 */
async function openAllRequestsModal() {
  const isMobile = () => window.innerWidth < 640;
  const width = isMobile() ? '95vw' : '80rem';
  
  const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
  
  // Reset state
  currentPage = 1;
  currentTypeFilter = 'all';
  currentStatusFilter = 'all';
  currentSearchQuery = '';
  
  // Show loading state
  const loadingHTML = `
    <div class="flex items-center justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  `;
  
  // Fetch all requests first
  allFetchedRequests = await fetchAllRequests(currentTypeFilter, currentStatusFilter);
  
  // Load initial paginated data
  const requests = filterAndPaginateRequests(allFetchedRequests, currentPage, 5, currentSearchQuery, currentTypeFilter, currentStatusFilter);
  
  const modalHTML = `
    <div class="space-y-4 sm:space-y-6">
      <!-- Mobile Close Button -->
      <div class="sm:hidden flex justify-end mb-2">
        <button id="mobile-close-btn" class="inline-flex items-center justify-center w-8 h-8 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div class="flex-1">
          <h2 class="text-lg sm:text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-center sm:text-left">All Visitation Requests</h2>
          <p class="text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 text-center sm:text-left">Search, filter, and view all visitation requests</p>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="space-y-3">
        <!-- Search Input -->
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div class="flex-1">
            <input 
              type="text" 
              id="requests-search-input" 
              placeholder="Search by visitor, inmate, or reason..." 
              class="w-full rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <select id="requests-type-filter" class="flex-1 sm:flex-none sm:w-40 rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
            <option value="all">All Types</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
          </select>
          
          <select id="requests-status-filter" class="flex-1 sm:flex-none sm:w-40 rounded-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden sm:block ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}">
            <thead class="${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider">Visitor</th>
                <th class="px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider">Inmate</th>
                <th class="px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider">Reason</th>
                <th class="px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody id="all-requests-table-body" class="${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}">
              ${generateRequestsTableRows(requests)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Cards View -->
      <div class="sm:hidden space-y-3" id="all-requests-cards-mobile">
        ${generateRequestsMobileCards(requests)}
      </div>

      <!-- Pagination -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div id="pagination-info" class="text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-center sm:text-left">
          Showing <span class="font-medium">${totalRequests > 0 ? 1 : 0}</span> to <span class="font-medium">${Math.min(requests.length, totalRequests)}</span> of <span class="font-medium">${totalRequests}</span> results
        </div>
        <div class="flex items-center justify-center gap-1 sm:gap-2">
          <button id="prev-page-btn" class="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400 bg-gray-800 border-gray-600 hover:bg-gray-700' : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'} border rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors" ${currentPage === 1 ? 'disabled' : ''}>
            <span class="hidden sm:inline">Previous</span>
            <span class="sm:hidden">Prev</span>
          </button>
          <span id="page-info" class="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">
            Page ${currentPage} of ${totalPages || 1}
          </span>
          <button id="next-page-btn" class="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400 bg-gray-800 border-gray-600 hover:bg-gray-700' : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'} border rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors" ${currentPage >= totalPages ? 'disabled' : ''}>
            <span class="hidden sm:inline">Next</span>
            <span class="sm:hidden">Next</span>
          </button>
        </div>
      </div>
    </div>
  `;

  return window.ThemeManager.showAlert({
    title: `<span class="hidden">All Visitation Requests</span>`,
    html: modalHTML,
    width: width,
    padding: isMobile() ? '0.75rem' : '1.5rem',
    showCancelButton: false,
    showConfirmButton: false,
    customClass: {
      container: 'swal-responsive-container',
      popup: 'swal-responsive-popup',
      content: 'swal-responsive-content',
    },
    didOpen: () => {
      attachModalEventListeners();
    },
  });
}

/**
 * Generate table rows for requests
 */
function generateRequestsTableRows(requests) {
  if (!requests || requests.length === 0) {
    return `
      <tr>
        <td colspan="5" class="px-4 py-12 text-center">
          <div class="flex flex-col items-center justify-center space-y-4">
            <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div class="text-center">
              <h3 class="text-base font-medium text-gray-900 dark:text-gray-100">No requests found</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filter criteria.</p>
            </div>
          </div>
        </td>
      </tr>
    `;
  }

  return requests.map(request => {
    const formattedDate = formatDate(request.date);
    const statusBadge = getStatusBadge(request.status, request.type);
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    return `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <td class="px-4 py-3 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}" style="max-width: 150px;">
          <div class="flex items-center gap-2">
            <span class="truncate">${request.visitorName}</span>
            ${request.type === 'automatic' ? '<span class="text-[10px] text-purple-600 dark:text-purple-400 whitespace-nowrap">(Auto)</span>' : ''}
          </div>
        </td>
        <td class="px-4 py-3 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} truncate" style="max-width: 150px;">${request.inmateName}</td>
        <td class="px-4 py-3 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} whitespace-nowrap">${formattedDate}</td>
        <td class="px-4 py-3 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} truncate" style="max-width: 200px;" title="${request.reason}">${request.reason}</td>
        <td class="px-4 py-3">${statusBadge}</td>
      </tr>
    `;
  }).join('');
}

/**
 * Generate mobile cards for requests
 */
function generateRequestsMobileCards(requests) {
  if (!requests || requests.length === 0) {
    return `
      <div class="text-center py-8">
        <div class="flex flex-col items-center justify-center space-y-4">
          <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div class="text-center">
            <h3 class="text-base font-medium text-gray-900 dark:text-gray-100">No requests found</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        </div>
      </div>
    `;
  }

  const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
  
  return requests.map(request => {
    const formattedDate = formatDate(request.date);
    const statusBadge = getStatusBadge(request.status, request.type);
    
    return `
      <div class="p-3 sm:p-4 border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-lg">
        <!-- Visitor -->
        <div class="grid grid-cols-5 gap-2 py-1 items-center">
          <div class="col-span-2 text-left text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium">Visitor:</div>
          <div class="col-span-3 text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-right sm:text-left truncate">
            ${request.visitorName}
            ${request.type === 'automatic' ? '<span class="ml-1 text-[10px] text-purple-600 dark:text-purple-400">(Auto)</span>' : ''}
          </div>
        </div>
        
        <!-- Inmate -->
        <div class="grid grid-cols-5 gap-2 py-1 items-center">
          <div class="col-span-2 text-left text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium">Inmate:</div>
          <div class="col-span-3 text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-right sm:text-left truncate">
            ${request.inmateName}
          </div>
        </div>
        
        <!-- Date -->
        <div class="grid grid-cols-5 gap-2 py-1 items-center">
          <div class="col-span-2 text-left text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium">Date:</div>
          <div class="col-span-3 text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-right sm:text-left">
            ${formattedDate}
          </div>
        </div>
        
        <!-- Reason -->
        <div class="grid grid-cols-5 gap-2 py-1 items-center">
          <div class="col-span-2 text-left text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium">Reason:</div>
          <div class="col-span-3 text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-right sm:text-left line-clamp-2">
            ${request.reason}
          </div>
        </div>
        
        <!-- Status -->
        <div class="grid grid-cols-5 gap-2 py-1 items-center">
          <div class="col-span-2 text-left text-xs sm:text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium">Status:</div>
          <div class="col-span-3 text-right sm:text-left">
            ${statusBadge}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Update modal display with new requests
 */
function updateModalDisplay() {
  // Filter and paginate (synchronous - instant filtering)
  const requests = filterAndPaginateRequests(allFetchedRequests, currentPage, 5, currentSearchQuery, currentTypeFilter, currentStatusFilter);
  const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
  
  // Update table
  const tableBody = document.getElementById('all-requests-table-body');
  if (tableBody) {
    tableBody.innerHTML = generateRequestsTableRows(requests);
  }
  
  // Update mobile cards
  const mobileCards = document.getElementById('all-requests-cards-mobile');
  if (mobileCards) {
    mobileCards.innerHTML = generateRequestsMobileCards(requests);
  }
  
  // Update pagination info
  const paginationInfo = document.getElementById('pagination-info');
  if (paginationInfo) {
    const start = totalRequests > 0 ? (currentPage - 1) * 5 + 1 : 0;
    const end = Math.min(start + requests.length - 1, totalRequests);
    paginationInfo.innerHTML = `
      Showing <span class="font-medium">${start}</span> to <span class="font-medium">${end}</span> of <span class="font-medium">${totalRequests}</span> results
    `;
  }
  
  // Update pagination buttons and page info
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');
  const pageSpan = document.querySelector('#pagination-info')?.parentElement?.querySelector('span:not(#pagination-info)');
  
  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
    if (prevBtn.disabled) {
      prevBtn.classList.add('opacity-50', 'cursor-not-allowed');
      prevBtn.classList.remove('hover:bg-gray-50', 'hover:bg-gray-700');
    } else {
      prevBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      prevBtn.classList.add('hover:bg-gray-50', 'hover:bg-gray-700');
    }
  }
  
  if (nextBtn) {
    nextBtn.disabled = currentPage >= totalPages || totalPages === 0;
    if (nextBtn.disabled) {
      nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
      nextBtn.classList.remove('hover:bg-gray-50', 'hover:bg-gray-700');
    } else {
      nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      nextBtn.classList.add('hover:bg-gray-50', 'hover:bg-gray-700');
    }
  }
  
  // Update page number display
  const pageInfo = document.getElementById('page-info');
  if (pageInfo) {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
  }
}

/**
 * Attach event listeners to modal
 */
function attachModalEventListeners() {
  // Mobile close button
  const mobileCloseBtn = document.getElementById('mobile-close-btn');
  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', () => {
      window.Swal.close();
    });
  }
  
  // Search input with debounce
  let searchTimeout;
  const searchInput = document.getElementById('requests-search-input');
  if (searchInput) {
    searchInput.value = currentSearchQuery; // Set initial value
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentSearchQuery = e.target.value;
        currentPage = 1; // Reset to first page on search
        updateModalDisplay();
      }, 300);
    });
  }
  
  // Type filter
  const typeFilter = document.getElementById('requests-type-filter');
  if (typeFilter) {
    typeFilter.value = currentTypeFilter; // Set initial value
    typeFilter.addEventListener('change', (e) => {
      currentTypeFilter = e.target.value;
      currentPage = 1; // Reset to first page on filter change
      updateModalDisplay();
    });
  }
  
  // Status filter
  const statusFilter = document.getElementById('requests-status-filter');
  if (statusFilter) {
    statusFilter.value = currentStatusFilter; // Set initial value
    statusFilter.addEventListener('change', (e) => {
      currentStatusFilter = e.target.value;
      currentPage = 1; // Reset to first page on filter change
      updateModalDisplay();
    });
  }
  
  // Pagination buttons
  const prevBtn = document.getElementById('prev-page-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        updateModalDisplay();
      }
    });
  }
  
  const nextBtn = document.getElementById('next-page-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        updateModalDisplay();
      }
    });
  }
}

// Auto-initialize if DOM is ready (fallback if not called from home.js)
// This ensures recent visitor requests work even if home.js doesn't call initRecentVisitorRequests
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure DOM is fully ready
    setTimeout(initRecentVisitorRequests, 100);
  });
} else {
  // Small delay to ensure DOM is fully ready
  setTimeout(initRecentVisitorRequests, 100);
}
