/**
 * Conjugal Visit Logs Component
 * Displays conjugal visit logs for an inmate in the visitation tab
 */

/**
 * Generate conjugal visit button HTML
 */
export function generateConjugalVisitButton(isDarkMode) {
    return `
        <button type="button" id="view-conjugal-logs-btn" 
            class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer
            bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 
            hover:from-rose-500 hover:via-pink-500 hover:to-fuchsia-500 
            text-white shadow-sm hover:shadow-md transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            Conjugal Visits
        </button>
    `;
}

/**
 * Show conjugal visit logs modal
 */
export async function showConjugalLogsModal(inmateId, inmateName) {
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    // Show loading
    window.Swal.fire({
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Loading Conjugal Visit Logs...</span>`,
        html: `<p class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Please wait...</p>`,
        allowOutsideClick: false,
        showConfirmButton: false,
        background: isDarkMode ? '#111827' : '#FFFFFF',
        didOpen: () => window.Swal.showLoading()
    });
    
    try {
        // Fetch conjugal visit logs
        const response = await fetch(`/api/conjugal-visits/inmate/${inmateId}/logs`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch logs');
        }
        
        const logs = data.logs || [];
        
        // Generate table HTML
        const tableHTML = generateConjugalLogsTable(logs, isDarkMode);
        
        await window.Swal.fire({
            title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Conjugal Visit Logs - ${inmateName}</span>`,
            html: tableHTML,
            background: isDarkMode ? '#111827' : '#FFFFFF',
            color: isDarkMode ? '#F9FAFB' : '#111827',
            width: '90%',
            maxWidth: '1200px',
            showCancelButton: true,
            showConfirmButton: false,
            cancelButtonText: 'Back to Visitation',
            heightAuto: false,
            scrollbarPadding: false,
            buttonsStyling: false,
            customClass: {
                popup: 'm-0 p-3 sm:p-4 !rounded-2xl max-h-[90vh] overflow-y-auto',
                cancelButton: `inline-flex items-center px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900'} text-sm font-medium cursor-pointer`
            }
        });
        
    } catch (error) {
        console.error('Error fetching conjugal logs:', error);
        await window.Swal.fire({
            title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Error</span>`,
            text: error.message || 'Failed to load conjugal visit logs',
            icon: 'error',
            background: isDarkMode ? '#111827' : '#FFFFFF',
            confirmButtonColor: '#EF4444'
        });
    }
}

/**
 * Generate conjugal logs table HTML
 */
function generateConjugalLogsTable(logs, isDarkMode) {
    if (logs.length === 0) {
        return `
            <div class="text-center py-12">
                <svg class="mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}">No conjugal visit logs</h3>
                <p class="mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}">This inmate has no conjugal visit history.</p>
            </div>
        `;
    }
    
    // Mobile cards
    const mobileCards = logs.map(log => `
        <div class="rounded-lg border ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} p-3">
            <div class="flex items-start justify-between mb-2">
                <div>
                    <p class="text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}">${log.visitor?.name || 'N/A'}</p>
                    <p class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">${formatDateTime(log.schedule)}</p>
                </div>
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${getStatusBadgeClass(log.status, isDarkMode)}">
                    ${getStatusLabel(log.status)}
                </span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
                <div>
                    <span class="${isDarkMode ? 'text-gray-500' : 'text-gray-400'}">Duration:</span>
                    <span class="${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium"> ${log.duration_minutes} min</span>
                </div>
                <div>
                    <span class="${isDarkMode ? 'text-gray-500' : 'text-gray-400'}">Paid:</span>
                    ${getPaidBadge(log.paid, isDarkMode)}
                </div>
            </div>
            <div class="mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}">
                Ref: <span class="font-mono">${log.reference_number}</span>
            </div>
        </div>
    `).join('');
    
    // Desktop table rows
    const tableRows = logs.map(log => `
        <tr class="border-b ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-100 hover:bg-gray-50'}">
            <td class="px-3 py-2 whitespace-nowrap text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}">${formatDateTime(log.schedule)}</td>
            <td class="px-3 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}">${log.visitor?.name || 'N/A'}</td>
            <td class="px-3 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}">${log.duration_minutes} min</td>
            <td class="px-3 py-2 text-xs">
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${getStatusBadgeClass(log.status, isDarkMode)}">
                    ${getStatusLabel(log.status)}
                </span>
            </td>
            <td class="px-3 py-2 text-center">${getPaidBadge(log.paid, isDarkMode)}</td>
            <td class="px-3 py-2 text-xs font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">${log.reference_number}</td>
        </tr>
    `).join('');
    
    return `
        <div class="text-left">
            <!-- Mobile cards -->
            <div class="sm:hidden space-y-3">
                ${mobileCards}
            </div>
            
            <!-- Desktop table -->
            <div class="hidden sm:block overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead class="${isDarkMode ? 'bg-gray-800/60' : 'bg-gray-50'}">
                        <tr>
                            <th class="px-3 py-2 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Date & Time</th>
                            <th class="px-3 py-2 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Visitor</th>
                            <th class="px-3 py-2 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Duration</th>
                            <th class="px-3 py-2 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Status</th>
                            <th class="px-3 py-2 text-center text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Paid</th>
                            <th class="px-3 py-2 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">Reference</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * Format date time
 */
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Get status label
 */
function getStatusLabel(status) {
    const labels = {
        0: 'Denied',
        1: 'Approved',
        2: 'Pending',
        3: 'Completed'
    };
    return labels[status] || 'Unknown';
}

/**
 * Get status badge class
 */
function getStatusBadgeClass(status, isDarkMode) {
    const classes = {
        0: 'bg-red-500/10 text-red-600',
        1: 'bg-green-500/10 text-green-600',
        2: 'bg-yellow-500/10 text-yellow-600',
        3: 'bg-blue-500/10 text-blue-600'
    };
    return classes[status] || 'bg-gray-500/10 text-gray-600';
}

/**
 * Get paid badge with SVG icon
 */
function getPaidBadge(paid, isDarkMode) {
    if (paid === 'YES') {
        return `
            <span class="inline-flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path fill="#3f0" d="M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m-.025-3q.35 0 .613-.262t.262-.613v-.375q1.25-.225 2.15-.975t.9-2.225q0-1.05-.6-1.925T12.9 11.1q-1.5-.5-2.075-.875T10.25 9.2t.463-1.025T12.05 7.8q.5 0 .875.175t.625.475t.563.412t.587-.012q.375-.15.513-.513t-.063-.662q-.4-.575-.987-.975T12.9 6.25v-.375q0-.35-.262-.612T12.025 5t-.612.263t-.263.612v.375q-1.25.275-1.95 1.1T8.5 9.2q0 1.175.688 1.9t2.162 1.25q1.575.575 2.188 1.025t.612 1.175q0 .825-.587 1.213t-1.413.387q-.65 0-1.175-.312T10.1 14.9q-.2-.35-.525-.475t-.65 0q-.35.125-.513.475t-.012.675q.4.85 1.075 1.388t1.625.737v.425q0 .35.263.613t.612.262"/></svg>
                <span class="text-[11px] font-medium text-green-600">YES</span>
            </span>
        `;
    } else {
        return `
            <span class="inline-flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path fill="#ce0000" d="M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m-.025-3q.35 0 .613-.262t.262-.613v-.375q1.25-.225 2.15-.975t.9-2.225q0-1.05-.6-1.925T12.9 11.1q-1.5-.5-2.075-.875T10.25 9.2t.463-1.025T12.05 7.8q.5 0 .875.175t.625.475t.563.412t.587-.012q.375-.15.513-.513t-.063-.662q-.4-.575-.987-.975T12.9 6.25v-.375q0-.35-.262-.612T12.025 5t-.612.263t-.263.612v.375q-1.25.275-1.95 1.1T8.5 9.2q0 1.175.688 1.9t2.162 1.25q1.575.575 2.188 1.025t.612 1.175q0 .825-.587 1.213t-1.413.387q-.65 0-1.175-.312T10.1 14.9q-.2-.35-.525-.475t-.65 0q-.35.125-.513.475t-.012.675q.4.85 1.075 1.388t1.625.737v.425q0 .35.263.613t.612.262"/></svg>
                <span class="text-[11px] font-medium text-red-600">NO</span>
            </span>
        `;
    }
}
