/**
 * Recent Visitor Requests Component
 * Fetches and displays recent visitation requests from visitation_logs table
 */

export async function initRecentVisitorRequests() {
  const tableBody = document.getElementById('recent-requests-tbody');
  if (!tableBody) return;

  try {
    // Fetch all recent visitors
    const response = await fetch('/api/visitors?per_page=10&sort=created_at&order=desc');
    if (!response.ok) throw new Error('Failed to fetch visitors');
    
    const json = await response.json();
    const visitors = json?.data || [];

    // Take first 5 visitors
    const recentVisitors = visitors.slice(0, 5);

    if (!recentVisitors.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            No recent visitation requests
          </td>
        </tr>
      `;
      return;
    }

    // Render table rows
    tableBody.innerHTML = '';
    recentVisitors.forEach(visitor => {
      const visitorName = visitor.name || '—';
      const inmateName = visitor.inmate?.full_name || 
                        (visitor.inmate?.first_name && visitor.inmate?.last_name 
                          ? `${visitor.inmate.first_name} ${visitor.inmate.last_name}` 
                          : '—');
      
      // Use schedule from latest_log only - show N/A if no schedule set
      let createdAt = 'N/A';
      if (visitor.latest_log && visitor.latest_log.schedule) {
        createdAt = new Date(visitor.latest_log.schedule).toLocaleString('en-US', {
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
      let statusBadge = '';
      
      if (visitor.latest_log && visitor.latest_log.status !== undefined) {
        // Has visitation log (schedule was set) - use its status
        const status = visitor.latest_log.status;
        
        if (status === 1 || status === '1' || status === 'Approved') {
          statusBadge = '<span class="inline-flex items-center rounded-full bg-green-500/10 text-green-500 px-2 py-0.5 text-[11px]">Approved</span>';
        } else if (status === 0 || status === '0' || status === 'Denied' || status === 'Declined') {
          statusBadge = '<span class="inline-flex items-center rounded-full bg-red-500/10 text-red-500 px-2 py-0.5 text-[11px]">Declined</span>';
        } else {
          // status === 2 or 'Pending' or anything else
          statusBadge = '<span class="inline-flex items-center rounded-full bg-blue-500/10 text-blue-500 px-2 py-0.5 text-[11px]">Pending</span>';
        }
      } else {
        // No visitation log (no schedule set yet) - show N/A
        statusBadge = '<span class="inline-flex items-center rounded-full bg-gray-500/10 text-gray-500 px-2 py-0.5 text-[11px]">N/A</span>';
      }

      tableBody.insertAdjacentHTML('beforeend', `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <td class="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 max-w-[120px] truncate">${visitorName}</td>
          <td class="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 max-w-[120px] truncate">${inmateName}</td>
          <td class="px-3 py-2 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap">${createdAt}</td>
          <td class="px-3 py-2">${statusBadge}</td>
        </tr>
      `);
    });

  } catch (error) {
    console.error('Error loading recent visitor requests:', error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="px-4 py-8 text-center text-red-500 dark:text-red-400 text-sm">
          Failed to load visitor requests
        </td>
      </tr>
    `;
  }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRecentVisitorRequests);
} else {
  initRecentVisitorRequests();
}
