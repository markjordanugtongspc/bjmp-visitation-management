/**
 * Visitor Logs Manager
 * Handles dynamic loading and management of visitor logs from facial recognition
 */

import Swal from 'sweetalert2';

// ============================================================================
// AVATAR HELPER FUNCTIONS (from visitors.js)
// ============================================================================

/**
 * Generate SVG avatar based on visitor name
 * @param {string} name - Full name of the visitor
 * @returns {string} - Data URI of the generated SVG
 */
function generateVisitorAvatarSVG(name) {
    if (!name || name === 'N/A') return '/images/logo/bjmp_logo.png';
    
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    
    // Generate consistent color based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <defs>
                <linearGradient id="grad-${hue}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:hsl(${hue}, 60%, 50%);stop-opacity:1" />
                    <stop offset="100%" style="stop-color:hsl(${hue}, 60%, 40%);stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#grad-${hue})" rx="50" />
            <text x="50" y="50" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="white" text-anchor="middle" dy=".3em">${initials}</text>
        </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Get visitor avatar URL with fallback to generated SVG
 * @param {Object} visitor - Visitor object with avatar data
 * @returns {string} - Avatar URL or generated SVG
 */
function getVisitorAvatarUrl(visitor) {
    if (visitor?.avatar_path && visitor?.avatar_filename) {
        return `/storage/${visitor.avatar_path}/${visitor.avatar_filename}`;
    }
    return generateVisitorAvatarSVG(visitor?.name || 'N/A');
}

class VisitorLogsManager {
    constructor() {
        this.currentPage = 1;
        this.perPage = 10;
        this.totalPages = 0;
        this.totalCount = 0;
        this.logs = [];
        this.filters = {
            search: '',
            status: '',
            date: ''
        };
        
        this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        this.init();
    }

    /**
     * Initialize the visitor logs manager
     */
    init() {
        this.setupEventListeners();
        this.loadLogs();
    }

    /**
     * Setup event listeners for filters and actions
     */
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-visitors');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.debounceSearch();
            });
        }

        // Status filter
        const statusFilter = document.getElementById('filter-status');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.currentPage = 1;
                this.loadLogs();
            });
        }

        // Date filter
        const dateFilter = document.getElementById('filter-date');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.filters.date = e.target.value;
                this.currentPage = 1;
                this.loadLogs();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-logs-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadLogs();
            });
        }

        // Export button
        const exportBtn = document.getElementById('export-logs-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportLogs();
            });
        }

        // Pagination buttons
        const prevBtn = document.getElementById('pagination-prev');
        const nextBtn = document.getElementById('pagination-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadLogs();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                    this.loadLogs();
                }
            });
        }
    }

    /**
     * Debounce search to avoid too many requests
     */
    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.currentPage = 1;
            this.loadLogs();
        }, 500);
    }

    /**
     * Load visitor logs from backend
     */
    async loadLogs() {
        this.showLoading();

        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                per_page: this.perPage,
                ...this.filters
            });

            const response = await fetch(`/facial-recognition/visitation-requests?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load visitor logs');
            }

            const data = await response.json();
            
            if (data.success) {
                this.logs = data.requests.data;
                this.totalPages = data.requests.last_page;
                this.totalCount = data.requests.total;
                
                this.renderLogs();
                this.renderPagination();
            } else {
                throw new Error(data.message || 'Failed to load logs');
            }
        } catch (error) {
            console.error('Error loading visitor logs:', error);
            this.showError('Failed to load visitor logs. Please try again.');
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        document.getElementById('visitor-logs-loading').classList.remove('hidden');
        document.getElementById('visitor-logs-empty').classList.add('hidden');
        // Force hide both views during loading (override responsive classes)
        document.getElementById('visitor-logs-table').classList.add('hidden');
        document.getElementById('visitor-logs-mobile').classList.add('hidden');
        const paginationEl = document.getElementById('visitor-logs-pagination');
        paginationEl.classList.add('hidden');
        paginationEl.classList.remove('flex');
    }

    /**
     * Show error state
     */
    showError(message) {
        document.getElementById('visitor-logs-loading').classList.add('hidden');
        document.getElementById('visitor-logs-empty').classList.add('hidden');
        document.getElementById('visitor-logs-table').classList.add('hidden');
        document.getElementById('visitor-logs-mobile').classList.add('hidden');
        const paginationEl = document.getElementById('visitor-logs-pagination');
        paginationEl.classList.add('hidden');
        paginationEl.classList.remove('flex');

        const themeManager = window.ThemeManager;
        Swal.fire(themeManager.getSwalConfig({
            icon: 'error',
            title: 'Error',
            text: message
        }));
    }

    /**
     * Render visitor logs in table and mobile views
     */
    renderLogs() {
        document.getElementById('visitor-logs-loading').classList.add('hidden');

        if (this.logs.length === 0) {
            document.getElementById('visitor-logs-empty').classList.remove('hidden');
            // Force hide both views when empty (override responsive classes)
            document.getElementById('visitor-logs-table').classList.add('hidden');
            document.getElementById('visitor-logs-mobile').classList.add('hidden');
            const paginationEl = document.getElementById('visitor-logs-pagination');
        paginationEl.classList.add('hidden');
        paginationEl.classList.remove('flex');
            return;
        }

        document.getElementById('visitor-logs-empty').classList.add('hidden');

        // Render content first
        this.renderTableView();
        this.renderMobileView();
        
        // Then manage visibility - remove hidden to let Tailwind responsive classes work
        // Desktop table: hidden sm:block (becomes sm:block after removing hidden)
        // Mobile cards: block sm:hidden (stays as block sm:hidden)
        const tableEl = document.getElementById('visitor-logs-table');
        const mobileEl = document.getElementById('visitor-logs-mobile');
        
        // Only remove hidden if it exists (to restore responsive behavior)
        if (tableEl.classList.contains('hidden')) {
            tableEl.classList.remove('hidden');
        }
        // Mobile doesn't have hidden in base classes, but ensure it's visible on mobile
        if (mobileEl.classList.contains('hidden')) {
            mobileEl.classList.remove('hidden');
        }
        
        const paginationEl = document.getElementById('visitor-logs-pagination');
        paginationEl.classList.remove('hidden');
        paginationEl.classList.add('flex');
    }

    /**
     * Render desktop table view
     */
    renderTableView() {
        const tbody = document.getElementById('visitor-logs-tbody');
        tbody.innerHTML = '';

        this.logs.forEach(log => {
            const row = this.createTableRow(log);
            tbody.innerHTML += row;
        });
    }

    /**
     * Render mobile card view
     */
    renderMobileView() {
        const container = document.getElementById('visitor-logs-mobile');
        container.innerHTML = '';

        this.logs.forEach(log => {
            const card = this.createMobileCard(log);
            container.innerHTML += card;
        });
    }

    /**
     * Create table row HTML
     */
    createTableRow(log) {
        const visitor = log.visitor || {};
        const inmate = log.inmate || {};
        const frLog = log.facial_recognition_log || {};
        
        // Get avatar URL with fallback to SVG
        const avatarUrl = getVisitorAvatarUrl(visitor);
        
        const statusBadge = this.getStatusBadge(log.status);
        const faceMatchBadge = this.getFaceMatchBadge(frLog);
        const cellLabel = (inmate && inmate.cell && inmate.cell.name)
            ? inmate.cell.name
            : (inmate.cell_location || inmate.current_facility || (inmate.cell_id ? `Cell #${inmate.cell_id}` : 'N/A'));

        return `
            <tr>
                <td class="px-4 py-4">
                    <div class="flex items-center">
                        <div class="h-10 w-10 shrink-0 mr-3">
                            <img src="${avatarUrl}" alt="${visitor.name || 'Unknown'}" class="w-full h-full object-cover rounded-full ring-2 ring-gray-200 dark:ring-gray-700" loading="lazy" />
                        </div>
                        <div class="ml-4">
                            <span onclick="window.visitorLogsManager.showVisitorInfo(${visitor.id})" class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer">${visitor.name || 'Unknown'}</span>
                            <div class="text-sm text-gray-500 dark:text-gray-400">ID: VIS-${visitor.id || '000'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-4">
                    <div class="flex flex-col gap-1">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                            </svg>
                            ${inmate.name || 'Unknown'}
                        </span>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                            </svg>
                            ${cellLabel}
                        </span>
                    </div>
                </td>
                <td class="px-4 py-4">
                    <div class="flex flex-col gap-2">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                            </svg>
                            ${this.formatDate(log.visit_date)} at ${this.formatTime(log.visit_time)}
                        </span>
                        ${statusBadge}
                    </div>
                </td>
                <td class="px-4 py-4 text-center">
                    <div class="flex items-center justify-center">
                        ${faceMatchBadge}
                    </div>
                </td>
                <td class="px-4 py-4 text-center text-sm font-medium">
                    <div class="flex items-center justify-center gap-3">
                        <button onclick="window.visitorLogsManager.editLog(${log.id})" class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 cursor-pointer" title="Edit">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        ${(() => {
                            const isApproved = log.status === 'approved';
                            const isDeclined = log.status === 'declined' || log.status === 'rejected';
                            const approveDisabled = isApproved;
                            const declineDisabled = isDeclined;
                            const approveClass = approveDisabled 
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50' 
                                : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 cursor-pointer';
                            const declineClass = declineDisabled
                                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                                : 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 cursor-pointer';
                            return `
                                <button 
                                    onclick="${approveDisabled ? 'return false;' : `window.visitorLogsManager.approveRequest(${log.id})`}" 
                                    ${approveDisabled ? 'disabled' : ''}
                                    class="${approveClass}" 
                                    title="${approveDisabled ? 'Already Approved' : 'Approve'}">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                            </button>
                                <button 
                                    onclick="${declineDisabled ? 'return false;' : `window.visitorLogsManager.declineRequest(${log.id}, '${(visitor.name || 'Unknown').replace(/'/g, "\\'")}', ${log.visitor_id})`}" 
                                    ${declineDisabled ? 'disabled' : ''}
                                    class="${declineClass}" 
                                    title="${declineDisabled ? 'Already Declined' : 'Decline'}">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                            `;
                        })()}
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Create mobile card HTML
     */
    createMobileCard(log) {
        const visitor = log.visitor || {};
        const inmate = log.inmate || {};
        const frLog = log.facial_recognition_log || {};
        
        // Get avatar URL with fallback to SVG
        const avatarUrl = getVisitorAvatarUrl(visitor);
        
        const statusBadge = this.getStatusBadge(log.status);
        const faceMatchBadge = this.getFaceMatchBadge(frLog);

        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div class="space-y-3 text-sm">
                    <div class="flex flex-col gap-2">
                        <span class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Visitor Info</span>
                        <div class="flex items-center">
                            <div class="h-10 w-10 shrink-0 mr-3">
                                <img src="${avatarUrl}" alt="${visitor.name || 'Unknown'}" class="w-full h-full object-cover rounded-full ring-2 ring-gray-200 dark:ring-gray-700" loading="lazy" />
                            </div>
                            <div>
                                <div onclick="window.visitorLogsManager.showVisitorInfo(${visitor.id})" class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer">${visitor.name || 'Unknown'}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">VIS-${visitor.id || '000'}</div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <span class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Visit Details</span>
                        <div class="flex flex-col gap-1">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                                </svg>
                                ${inmate.name || 'Unknown'}
                            </span>
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                                </svg>
                                ${inmate.current_facility || 'N/A'}
                            </span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <span class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Time & Status</span>
                        <div class="flex flex-col gap-1">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                                </svg>
                                ${this.formatDate(log.visit_date)} at ${this.formatTime(log.visit_time)}
                            </span>
                            ${statusBadge}
                        </div>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Face Match</span>
                        ${faceMatchBadge}
                    </div>
                </div>
                <div class="mt-4 flex gap-2">
                    <button onclick="window.visitorLogsManager.editLog(${log.id})" class="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors cursor-pointer">Edit</button>
                    ${(() => {
                        const isApproved = log.status === 'approved';
                        const isDeclined = log.status === 'declined' || log.status === 'rejected';
                        const approveDisabled = isApproved;
                        const declineDisabled = isDeclined;
                        const approveBtnClass = approveDisabled 
                            ? 'flex-1 px-3 py-2 text-sm bg-gray-400 dark:bg-gray-600 text-white rounded-md cursor-not-allowed opacity-50' 
                            : 'flex-1 px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors cursor-pointer';
                        const declineBtnClass = declineDisabled
                            ? 'flex-1 px-3 py-2 text-sm bg-gray-400 dark:bg-gray-600 text-white rounded-md cursor-not-allowed opacity-50'
                            : 'flex-1 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors cursor-pointer';
                        return `
                            <button 
                                onclick="${approveDisabled ? 'return false;' : `window.visitorLogsManager.approveRequest(${log.id})`}" 
                                ${approveDisabled ? 'disabled' : ''}
                                class="${approveBtnClass}">Approve</button>
                            <button 
                                onclick="${declineDisabled ? 'return false;' : `window.visitorLogsManager.declineRequest(${log.id}, '${(visitor.name || 'Unknown').replace(/'/g, "\\'")}', ${log.visitor_id})`}" 
                                ${declineDisabled ? 'disabled' : ''}
                                class="${declineBtnClass}">Decline</button>
                        `;
                    })()}
                </div>
            </div>
        `;
    }

    /**
     * Get initials from name
     */
    getInitials(name) {
        return name.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    /**
     * Get avatar color based on ID
     */
    getAvatarColor(id) {
        const colors = [
            'bg-blue-100 dark:bg-blue-900/30',
            'bg-purple-100 dark:bg-purple-900/30',
            'bg-green-100 dark:bg-green-900/30',
            'bg-gray-100 dark:bg-gray-800'
        ];
        
        // Prefer numeric IDs
        if (typeof id === 'number' && Number.isFinite(id)) {
            return colors[Math.abs(id) % colors.length];
        }
        
        // Fallback: derive a stable index from string IDs
        if (typeof id === 'string' && id.length > 0) {
            let hash = 0;
            for (let i = 0; i < id.length; i++) {
                hash = ((hash << 5) - hash) + id.charCodeAt(i);
                hash |= 0; // Convert to 32-bit integer
            }
            return colors[Math.abs(hash) % colors.length];
        }
        
        // Default color if ID is missing/invalid
        return colors[0];
    }
    
    /**
     * Build a safe avatar URL from path and filename
     */
    buildAvatarUrl(avatarPath, avatarFilename) {
        if (!avatarPath || !avatarFilename) return null;
        
        // Normalize slashes
        const path = String(avatarPath).replace(/\/+$/,'');
        const filename = String(avatarFilename).replace(/^\/+/, '');
        
        // If path already absolute (starts with http) use as-is
        if (/^https?:\/\//i.test(path)) {
            return `${path}/${filename}`;
        }
        
        // If path is root-relative, prefix with origin
        if (path.startsWith('/')) {
            return `${window.location.origin}${path}/${filename}`;
        }
        
        // Otherwise, treat as relative
        return `${window.location.origin}/${path}/${filename}`;
    }
    
    /**
     * Get visitor avatar URL from visitor object
     */
    getVisitorAvatarUrl(visitor) {
        const path = visitor?.avatar_path || null;
        const filename = visitor?.avatar_filename || null;
        return this.buildAvatarUrl(path, filename);
    }

    /**
     * Get status badge HTML
     */
    getStatusBadge(status) {
        const badges = {
            pending: '<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</span>',
            approved: '<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Approved</span>',
            rejected: '<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Rejected</span>',
            completed: '<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Completed</span>',
        };
        return badges[status] || badges.pending;
    }

    /**
     * Get face match badge HTML
     */
    getFaceMatchBadge(frLog) {
        // Debug logging to see what data we're getting
        console.log('Face Match Badge - frLog:', frLog);
        
        // Check if there's a successful match - more lenient conditions
        if (!frLog) {
            console.log('No frLog data');
            return `
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-500 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                    <span class="text-sm text-yellow-600 dark:text-yellow-400">No Match</span>
                </div>
            `;
        }

        // Check for confidence percentage - allow any number including 0
        const hasConfidence = frLog.confidence_percentage !== undefined && frLog.confidence_percentage !== null;
        // Check for match status - be more lenient
        const hasMatchStatus = frLog.match_status === 'matched' || frLog.is_match_successful === true || frLog.matched_visitor_id !== null;
        
        console.log('Has confidence:', hasConfidence, 'Has match status:', hasMatchStatus, 'Confidence:', frLog.confidence_percentage, 'Status:', frLog.match_status);

        if (!hasConfidence || !hasMatchStatus) {
            return `
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-500 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                    <span class="text-sm text-yellow-600 dark:text-yellow-400">No Match</span>
                </div>
            `;
        }

        const confidence = Math.round(frLog.confidence_percentage || 0);
        return `
            <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-sm font-medium text-green-600 dark:text-green-400">${confidence}%</span>
            </div>
        `;
    }

    /**
     * Format date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }

    /**
     * Format time
     */
    formatTime(timeString) {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    /**
     * Render pagination controls
     */
    renderPagination() {
        const start = (this.currentPage - 1) * this.perPage + 1;
        const end = Math.min(this.currentPage * this.perPage, this.totalCount);

        document.getElementById('pagination-start').textContent = start;
        document.getElementById('pagination-end').textContent = end;
        document.getElementById('pagination-total').textContent = this.totalCount;

        // Update pagination buttons state
        const prevBtn = document.getElementById('pagination-prev');
        const nextBtn = document.getElementById('pagination-next');
        
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === this.totalPages;

        // Render page numbers
        this.renderPageNumbers();
    }

    /**
     * Render page number buttons
     */
    renderPageNumbers() {
        const container = document.getElementById('pagination-numbers');
        container.innerHTML = '';

        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.className = i === this.currentPage 
                ? 'px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg cursor-pointer'
                : 'px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer';
            
            button.addEventListener('click', () => {
                this.currentPage = i;
                this.loadLogs();
            });
            
            container.appendChild(button);
        }
    }

    /**
     * Show visitor information modal
     */
    async showVisitorInfo(visitorId) {
        // Use theme manager for consistent theming
        const themeManager = window.ThemeManager;
        const isDark = themeManager.isDarkMode();
        const palette = themeManager.getPalette();
        const isMobile = window.innerWidth < 640;
        
        try {
            // Show loading with theme manager
            Swal.fire(themeManager.getSwalConfig({
                title: 'Loading...',
                text: 'Fetching visitor information',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            }));

            // Fetch visitor data with logs
            const response = await fetch(`/api/visitors/${visitorId}`);
            if (!response.ok) throw new Error('Failed to fetch visitor data');
            
            const visitorApi = await response.json();
            
            // Find the most recent log for this visitor
            const visitorLog = this.logs.find(log => log.visitor?.id === visitorId);
            const inmate = visitorLog?.inmate || {};
            
            // Resolve inmate cell name via cell_id → cells table (authoritative)
            let inmateCell = inmate?.cell_location || inmate?.cell?.name || 'N/A';
            const inmateCellId = inmate?.cell_id || visitorLog?.inmate?.cell_id || visitorLog?.cell_id;
            if (inmateCellId) {
                try {
                    const cellRes = await fetch(`/api/cells/${inmateCellId}`);
                    if (cellRes.ok) {
                        const cellData = await cellRes.json();
                        inmateCell = cellData?.name || inmateCell;
                    }
                } catch (e) {
                    // keep fallback silently
                }
            }
            
            // Build face match badge using existing logic to stay consistent with list rendering
            const faceMatchHtml = this.getFaceMatchBadge(visitorLog?.facial_recognition_log || null);
            
            // Merge visitor data with sensible fallbacks
            const logVisitor = visitorLog?.visitor || {};
            const visitor = {
                id: visitorApi?.id ?? logVisitor?.id ?? visitorId,
                name: visitorApi?.name ?? logVisitor?.name ?? 'Unknown',
                avatar_path: visitorApi?.avatar_path ?? logVisitor?.avatar_path ?? null,
                avatar_filename: visitorApi?.avatar_filename ?? logVisitor?.avatar_filename ?? null,
            };
            
            // Build avatar HTML using the helper function
            const avatarUrl = getVisitorAvatarUrl(visitor);
            const avatarHtml = `
                <img src="${avatarUrl}" alt="${visitor.name}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div class="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center" style="display:none;">
                    <span class="text-sm font-bold text-white">${this.getInitials(visitor.name || 'Unknown')}</span>
                </div>
            `;
            
            // Use cell_location from inmate data (already provided by backend)
            const cellName = inmate.cell_location || inmate.current_facility || 'Not Assigned';
            
            // Format date and time in Philippines format
            let visitDateTime = 'N/A';
            if (visitorLog?.visit_date && visitorLog?.visit_time) {
                const visitDate = new Date(visitorLog.visit_date);
                const [hours, minutes] = visitorLog.visit_time.split(':');
                
                // Convert to Philippines time (UTC+8)
                const philippinesTime = new Date(visitDate);
                philippinesTime.setHours(parseInt(hours), parseInt(minutes));
                
                // Format: Month Day, Year at HH:MM AM/PM
                visitDateTime = philippinesTime.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Manila'
                }).replace(',', ' at');
            }
            
            // Status badge
            const status = visitorLog?.status || 'unknown';
            const statusConfig = {
                approved: { bg: isDark ? 'bg-green-500/20' : 'bg-green-100', text: isDark ? 'text-green-400' : 'text-green-700', label: 'Approved' },
                pending: { bg: isDark ? 'bg-yellow-500/20' : 'bg-yellow-100', text: isDark ? 'text-yellow-400' : 'text-yellow-700', label: 'Pending' },
                declined: { bg: isDark ? 'bg-red-500/20' : 'bg-red-100', text: isDark ? 'text-red-400' : 'text-red-700', label: 'Declined' }
            };
            const statusStyle = statusConfig[status] || statusConfig.pending;
            
            // Show compact modern modal
            Swal.fire(themeManager.getSwalConfig({
                title: visitor.name || 'Unknown Visitor',
                html: `
                    <div class="space-y-4 text-left">
                        <!-- Avatar & Status -->
                        <div class="flex items-center gap-4 pb-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}">
                            <div class="shrink-0 w-16 h-16 rounded-full overflow-hidden ${isDark ? 'ring-2 ring-gray-700' : 'ring-2 ring-gray-200'}">
                                ${avatarHtml}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}">Visitor ID: #${visitor?.id || '—'}</p>
                                <span class="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}">${statusStyle.label}</span>
                            </div>
                        </div>
                        
                        <!-- Info Grid -->
                        <div class="grid grid-cols-1 gap-3 text-sm">
                            <div class="p-3 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}">
                                <p class="text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'} font-medium mb-1">Visiting PDL</p>
                                <p class="font-semibold ${isDark ? 'text-white' : 'text-gray-900'}">${inmate.name || 'N/A'}</p>
                                <p class="text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-0.5">Cell: ${cellName}</p>
                            </div>
                            
                            <div class="p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}">
                                <p class="text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1">Date & Time</p>
                                <p class="font-semibold ${isDark ? 'text-white' : 'text-gray-900'}">${visitDateTime}</p>
                            </div>
                            
                            <div class="p-3 rounded-lg ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}">
                                <p class="text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'} font-medium mb-1">Face Recognition</p>
                                ${faceMatchHtml}
                            </div>
                        </div>
                    </div>
                `,
                width: isMobile ? '90%' : '500px',
                showConfirmButton: true,
                confirmButtonText: 'Close'
            }));
            
        } catch (error) {
            console.error('Error fetching visitor info:', error);
            Swal.fire(themeManager.getSwalConfig({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load visitor information. Please try again.'
            }));
        }
    }

    /**
     * Edit log - Allow modification of visit date and time
     */
    async editLog(id) {
        // Use theme manager for consistent theming
        const themeManager = window.ThemeManager;
        const isDark = themeManager.isDarkMode();
        const palette = themeManager.getPalette();
        const isMobile = window.innerWidth < 640;
        
        // Find the log
        const log = this.logs.find(l => l.id === id);
        if (!log) {
            Swal.fire(themeManager.getSwalConfig({
                icon: 'error',
                title: 'Error',
                text: 'Log not found'
            }));
            return;
        }
        
        const visitor = log.visitor || {};
        const inmate = log.inmate || {};
        
        // Get current date and time
        const currentDate = log.visit_date || new Date().toISOString().split('T')[0];
        const currentTime = log.visit_time || '';
        const today = new Date().toISOString().split('T')[0];
        
        const { value: formValues } = await Swal.fire(themeManager.getSwalConfig({
            title: 'Edit Visit Schedule',
            html: `
                <div class="w-full max-w-lg mx-auto text-left space-y-4 sm:space-y-5">
                    <!-- Visitor Info -->
                    <div class="p-4 rounded-xl ${isDark ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'} backdrop-blur-sm">
                        <div class="flex items-center gap-3">
                            <div class="flex-shrink-0 w-10 h-10 rounded-lg ${isDark ? 'bg-blue-600/20' : 'bg-blue-500/10'} flex items-center justify-center">
                                <svg class="w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs font-semibold ${isDark ? 'text-blue-400/70' : 'text-blue-600/70'} uppercase tracking-wider">Visitor</p>
                                <p class="text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'} truncate">${visitor.name || 'Unknown'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Inmate Info -->
                    <div class="p-4 rounded-xl ${isDark ? 'bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/30' : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'} backdrop-blur-sm">
                        <div class="flex items-center gap-3">
                            <div class="flex-shrink-0 w-10 h-10 rounded-lg ${isDark ? 'bg-purple-600/20' : 'bg-purple-500/10'} flex items-center justify-center">
                                <svg class="w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs font-semibold ${isDark ? 'text-purple-400/70' : 'text-purple-600/70'} uppercase tracking-wider">Visiting PDL</p>
                                <p class="text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'} truncate">${inmate.name || 'Unknown'} - ${inmate.cell_location || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Date and Time Fields -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <label class="block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}">
                                <svg class="w-4 h-4 inline mr-1 ${isDark ? 'text-green-400' : 'text-green-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Visit Date <span class="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="swal-edit-date"
                                min="${today}"
                                value="${currentDate}"
                                class="w-full rounded-xl border ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                                required
                            />
                        </div>

                        <div class="space-y-2">
                            <label class="block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}">
                                <svg class="w-4 h-4 inline mr-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Visit Time <span class="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="swal-edit-time"
                                value="${currentTime}"
                                class="w-full rounded-xl border ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                                required
                            />
                        </div>
                    </div>
                    
                    <div class="p-4 rounded-xl ${isDark ? 'bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-700/30' : 'bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200'} backdrop-blur-sm">
                        <div class="flex gap-3">
                            <div class="flex-shrink-0 w-8 h-8 rounded-lg ${isDark ? 'bg-amber-600/20' : 'bg-amber-500/10'} flex items-center justify-center">
                                <svg class="w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p class="text-sm ${isDark ? 'text-amber-300' : 'text-amber-800'}">You can only modify the visit date and time. Other details remain unchanged.</p>
                        </div>
                    </div>
                </div>
            `,
            width: isMobile ? '95vw' : '650px',
            showCancelButton: true,
            confirmButtonText: 'Save Changes',
            cancelButtonText: 'Cancel',
            confirmButtonColor: palette.primary,
            customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl',
                cancelButton: 'font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg'
            }
        }));
        
        if (formValues) {
            try {
                // Show loading
                Swal.fire(themeManager.getSwalConfig({
                    title: 'Updating...',
                    text: 'Please wait while we update the visit schedule',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                }));
                
                // Update via API
                const response = await fetch(`/facial-recognition/visitation-requests/${id}/update-schedule`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                    },
                    body: JSON.stringify({
                        visit_date: formValues.date,
                        visit_time: formValues.time
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to update schedule');
                }
                
                // Success
                await Swal.fire(themeManager.getSwalConfig({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Visit schedule has been updated successfully.',
                    confirmButtonText: 'OK'
                }));
                
                // Reload logs
                this.loadLogs();
                
            } catch (error) {
                console.error('Error updating schedule:', error);
                Swal.fire(themeManager.getSwalConfig({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to update visit schedule. Please try again.'
                }));
            }
        }
    }

    /**
     * Check out visitor
     */
    async checkOut(id) {
        const themeManager = window.ThemeManager;
        const isDark = themeManager.isDarkMode();
        
        const result = await Swal.fire(themeManager.getSwalConfig({
            title: 'Check Out Visitor',
            text: 'Are you sure you want to check out this visitor?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Check Out',
            cancelButtonText: 'Cancel'
        }));

        if (result.isConfirmed) {
            try {
                // TODO: Implement checkout API call
                await Swal.fire(themeManager.getSwalConfig({
                    icon: 'success',
                    title: 'Checked Out',
                    text: 'Visitor has been checked out successfully.'
                }));
                
                // Reload logs
                this.loadLogs();
            } catch (error) {
                await Swal.fire(themeManager.getSwalConfig({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to check out visitor. Please try again.'
                }));
            }
        }
    }

    /**
     * Export logs (placeholder for future functionality)
     */
    exportLogs() {
        const themeManager = window.ThemeManager;
        Swal.fire(themeManager.getSwalConfig({
            icon: 'info',
            title: 'Export Functionality',
            text: 'Export functionality will be implemented in a future update.'
        }));
    }

    /**
     * Approve visitation request
     */
    async approveRequest(requestId) {
        const themeManager = window.ThemeManager;
        
        const result = await Swal.fire(themeManager.getSwalConfig({
            title: 'Approve Request',
            text: 'Are you sure you want to approve this visitation request?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Approve',
            cancelButtonText: 'Cancel'
        }));

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/facial-recognition/visitation-requests/${requestId}/approve`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to approve request');
                }

                await Swal.fire(themeManager.getSwalConfig({
                    icon: 'success',
                    title: 'Request Approved',
                    text: 'The visitation request has been approved successfully.',
                    timer: 2000,
                    showConfirmButton: false,
                }));
                
                // Reload logs
                this.loadLogs();
            } catch (error) {
                await Swal.fire(themeManager.getSwalConfig({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to approve request. Please try again.'
                }));
            }
        }
    }

    /**
     * Decline visitation request with reason
     */
    async declineRequest(requestId, visitorName, visitorId) {
        await this.showDeclineReasonModal(requestId, visitorName, async (reason) => {
            const isDark = document.documentElement.classList.contains('dark');
            
            try {
                const response = await fetch(`/facial-recognition/visitation-requests/${requestId}/decline`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        reason: reason,
                        visitor_id: visitorId,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to decline request');
                }

                await Swal.fire({
                    icon: 'success',
                    title: 'Request Declined',
                    text: 'The visitation request has been declined.',
                    background: isDark ? '#1f2937' : '#ffffff',
                    color: isDark ? '#f9fafb' : '#1f2937',
                    timer: 2000,
                    showConfirmButton: false,
                });
                
                // Reload logs
                this.loadLogs();
            } catch (error) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to decline request. Please try again.',
                    background: isDark ? '#1f2937' : '#ffffff',
                    color: isDark ? '#f9fafb' : '#1f2937',
                });
            }
        });
    }

    /**
     * Show decline reason modal
     */
    async showDeclineReasonModal(requestId, visitorName, onConfirm) {
        const isDark = document.documentElement.classList.contains('dark');
        
        const result = await Swal.fire({
            title: '<span class="text-lg font-semibold">Decline Visitation Request</span>',
            html: `
                <div class="text-left space-y-4">
                    <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <p class="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Visitor:</strong> ${visitorName}
                        </p>
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Reason for Declining <span class="text-red-500">*</span>
                        </label>
                        <textarea 
                            id="decline-reason-input" 
                            rows="4" 
                            class="w-full px-4 py-2.5 text-sm rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" 
                            placeholder="Please provide a detailed reason for declining this request..."
                            required
                        ></textarea>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Minimum 10 characters required</p>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Decline Request',
            cancelButtonText: 'Cancel',
            width: window.innerWidth < 640 ? '95%' : '32rem',
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f9fafb' : '#1f2937',
            customClass: {
                popup: 'rounded-xl shadow-2xl',
                htmlContainer: '!px-0',
                confirmButton: 'px-6 py-2.5 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer',
                cancelButton: `px-6 py-2.5 text-sm font-medium rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} cursor-pointer`,
            },
            buttonsStyling: false,
            focusConfirm: false,
            focusCancel: false,
            preConfirm: () => {
                const reasonInput = document.getElementById('decline-reason-input');
                const reason = reasonInput ? reasonInput.value.trim() : '';
                
                if (!reason) {
                    Swal.showValidationMessage('Please provide a reason for declining the request.');
                    return false;
                }
                
                if (reason.length < 10) {
                    Swal.showValidationMessage('Reason must be at least 10 characters long.');
                    return false;
                }
                
                return reason;
            },
            didOpen: () => {
                const reasonInput = document.getElementById('decline-reason-input');
                if (reasonInput) {
                    reasonInput.focus();
                    // Auto-resize textarea
                    reasonInput.addEventListener('input', function() {
                        this.style.height = 'auto';
                        this.style.height = Math.min(this.scrollHeight, 200) + 'px';
                    });
                }
            }
        });

        if (result.isConfirmed && result.value) {
            await onConfirm(result.value);
        }
    }
}

export default VisitorLogsManager;
