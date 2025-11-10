/**
 * Visitor Logs Manager
 * Handles dynamic loading and management of visitor logs from facial recognition
 */

import Swal from 'sweetalert2';

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

        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f9fafb' : '#1f2937',
        });
    }

    /**
     * Render visitor logs in table and mobile views
     */
    renderLogs() {
        document.getElementById('visitor-logs-loading').classList.add('hidden');

        if (this.logs.length === 0) {
            document.getElementById('visitor-logs-empty').classList.remove('hidden');
            document.getElementById('visitor-logs-table').classList.add('hidden');
            document.getElementById('visitor-logs-mobile').classList.add('hidden');
            const paginationEl = document.getElementById('visitor-logs-pagination');
        paginationEl.classList.add('hidden');
        paginationEl.classList.remove('flex');
            return;
        }

        document.getElementById('visitor-logs-empty').classList.add('hidden');
        document.getElementById('visitor-logs-table').classList.remove('hidden');
        document.getElementById('visitor-logs-mobile').classList.remove('hidden');
        const paginationEl = document.getElementById('visitor-logs-pagination');
        paginationEl.classList.remove('hidden');
        paginationEl.classList.add('flex');

        // Render table view
        this.renderTableView();
        
        // Render mobile view
        this.renderMobileView();
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
        
        const initials = this.getInitials(visitor.name || 'Unknown');
        const avatarColor = this.getAvatarColor(visitor.id);
        
        const statusBadge = this.getStatusBadge(log.status);
        const faceMatchBadge = this.getFaceMatchBadge(frLog);

        return `
            <tr>
                <td class="px-4 py-4">
                    <div class="flex items-center">
                        <div class="h-10 w-10 rounded-full ${avatarColor} flex items-center justify-center mr-3">
                            <span class="text-sm font-medium ${avatarColor.includes('blue') ? 'text-blue-600 dark:text-blue-400' : avatarColor.includes('purple') ? 'text-purple-600 dark:text-purple-400' : avatarColor.includes('gray') ? 'text-gray-600 dark:text-gray-400' : 'text-green-600 dark:text-green-400'}">${initials}</span>
                        </div>
                        <div class="ml-4">
                            <span class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer">${visitor.name || 'Unknown'}</span>
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
                            ${inmate.current_facility || 'N/A'}
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
                        ${log.status === 'pending' ? `
                            <button onclick="window.visitorLogsManager.approveRequest(${log.id})" class="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 cursor-pointer" title="Approve">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                            </button>
                            <button onclick="window.visitorLogsManager.declineRequest(${log.id}, '${(visitor.name || 'Unknown').replace(/'/g, "\\'")}', ${log.visitor_id})" class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 cursor-pointer" title="Decline">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        ` : log.status === 'approved' ? `
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                </svg>
                                Approved
                            </span>
                        ` : `
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                                </svg>
                                Declined
                            </span>
                        `}
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
        
        const initials = this.getInitials(visitor.name || 'Unknown');
        const avatarColor = this.getAvatarColor(visitor.id);
        
        const statusBadge = this.getStatusBadge(log.status);
        const faceMatchBadge = this.getFaceMatchBadge(frLog);

        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center">
                        <div class="h-10 w-10 rounded-full ${avatarColor} flex items-center justify-center mr-3">
                            <span class="text-sm font-medium ${avatarColor.includes('blue') ? 'text-blue-600 dark:text-blue-400' : avatarColor.includes('purple') ? 'text-purple-600 dark:text-purple-400' : avatarColor.includes('gray') ? 'text-gray-600 dark:text-gray-400' : 'text-green-600 dark:text-green-400'}">${initials}</span>
                        </div>
                        <div>
                            <div class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer">${visitor.name || 'Unknown'}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">VIS-${visitor.id || '000'}</div>
                        </div>
                    </div>
                </div>
                <div class="space-y-3 text-sm">
                    <div class="flex flex-col gap-2">
                        <span class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Visitor Info</span>
                        <div class="flex items-center">
                            <div class="h-10 w-10 rounded-full ${avatarColor} flex items-center justify-center mr-3">
                                <span class="text-sm font-medium ${avatarColor.includes('blue') ? 'text-blue-600 dark:text-blue-400' : avatarColor.includes('purple') ? 'text-purple-600 dark:text-purple-400' : avatarColor.includes('gray') ? 'text-gray-600 dark:text-gray-400' : 'text-green-600 dark:text-green-400'}">${initials}</span>
                            </div>
                            <div>
                                <div class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer">${visitor.name || 'Unknown'}</div>
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
                    ${log.status === 'pending' ? `
                        <button onclick="window.visitorLogsManager.approveRequest(${log.id})" class="flex-1 px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors cursor-pointer">Approve</button>
                        <button onclick="window.visitorLogsManager.declineRequest(${log.id}, '${(visitor.name || 'Unknown').replace(/'/g, "\\'")}', ${log.visitor_id})" class="flex-1 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors cursor-pointer">Decline</button>
                    ` : log.status === 'approved' ? `
                        <span class="flex-1 px-3 py-2 text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md text-center">Approved</span>
                    ` : `
                        <span class="flex-1 px-3 py-2 text-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-md text-center">Declined</span>
                    `}
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
        return colors[id % colors.length];
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
     * Edit log (placeholder for future functionality)
     */
    editLog(id) {
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({
            icon: 'info',
            title: 'Edit Functionality',
            text: 'Edit functionality will be implemented in a future update.',
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f9fafb' : '#1f2937',
        });
    }

    /**
     * Check out visitor
     */
    async checkOut(id) {
        const isDark = document.documentElement.classList.contains('dark');
        
        const result = await Swal.fire({
            title: 'Check Out Visitor',
            text: 'Are you sure you want to check out this visitor?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Check Out',
            cancelButtonText: 'Cancel',
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f9fafb' : '#1f2937',
            customClass: {
                confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg cursor-pointer',
                cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer ml-2',
            },
            buttonsStyling: false,
        });

        if (result.isConfirmed) {
            try {
                // TODO: Implement checkout API call
                await Swal.fire({
                    icon: 'success',
                    title: 'Checked Out',
                    text: 'Visitor has been checked out successfully.',
                    background: isDark ? '#1f2937' : '#ffffff',
                    color: isDark ? '#f9fafb' : '#1f2937',
                });
                
                // Reload logs
                this.loadLogs();
            } catch (error) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to check out visitor. Please try again.',
                    background: isDark ? '#1f2937' : '#ffffff',
                    color: isDark ? '#f9fafb' : '#1f2937',
                });
            }
        }
    }

    /**
     * Export logs (placeholder for future functionality)
     */
    exportLogs() {
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({
            icon: 'info',
            title: 'Export Functionality',
            text: 'Export functionality will be implemented in a future update.',
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f9fafb' : '#1f2937',
        });
    }

    /**
     * Approve visitation request
     */
    async approveRequest(requestId) {
        const isDark = document.documentElement.classList.contains('dark');
        
        const result = await Swal.fire({
            title: 'Approve Request',
            text: 'Are you sure you want to approve this visitation request?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Approve',
            cancelButtonText: 'Cancel',
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f9fafb' : '#1f2937',
            customClass: {
                confirmButton: 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer',
                cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer ml-2',
            },
            buttonsStyling: false,
        });

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

                await Swal.fire({
                    icon: 'success',
                    title: 'Request Approved',
                    text: 'The visitation request has been approved successfully.',
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
                    text: 'Failed to approve request. Please try again.',
                    background: isDark ? '#1f2937' : '#ffffff',
                    color: isDark ? '#f9fafb' : '#1f2937',
                });
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
