/**
 * Recent Visitor Requests Component
 * Fetches and displays recent visitation requests from visitation_logs table
 */

export async function initRecentVisitorRequests() {
  const tableBody = document.getElementById('recent-requests-tbody');
  if (!tableBody) return;

  try {
    // Fetch recent visitation requests from visitation_logs
    const response = await fetch('/api/visitation-requests?per_page=5&sort=created_at&order=desc');
    if (!response.ok) throw new Error('Failed to fetch visitation requests');
    
    const json = await response.json();
    const requests = json?.data || [];

    if (!requests.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            No recent visitation requests
          </td>
        </tr>
      `;
      return;
    }

    // Render table rows
    tableBody.innerHTML = '';
    requests.forEach(request => {
      const visitorName = request.visitorDetails?.name || request.name || '—';
      const inmateName = request.pdlDetails?.name || 
                        (request.inmate?.first_name && request.inmate?.last_name 
                          ? `${request.inmate.first_name} ${request.inmate.last_name}` 
                          : '—');
      
      // Use schedule from visitation_logs
      let createdAt = 'N/A';
      if (request.schedule) {
        createdAt = new Date(request.schedule).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }

      // Get reason for visit from visitation_logs
      const reasonForVisit = request.reason_for_visit || 'N/A';

      // Determine status badge from visitation_logs
      // Status values from visitation_logs: 1 = Approved, 2 = Pending, 0 = Denied/Declined
      let statusBadge = '';
      const status = request.status;
      
      if (status === 1 || status === '1' || status === 'Approved') {
        statusBadge = '<span class="inline-flex items-center rounded-full bg-green-500/10 text-green-500 px-2 py-0.5 text-[11px]">Approved</span>';
      } else if (status === 0 || status === '0' || status === 'Denied' || status === 'Declined') {
        statusBadge = '<span class="inline-flex items-center rounded-full bg-red-500/10 text-red-500 px-2 py-0.5 text-[11px]">Declined</span>';
      } else {
        // status === 2 or 'Pending' or anything else
        statusBadge = '<span class="inline-flex items-center rounded-full bg-blue-500/10 text-blue-500 px-2 py-0.5 text-[11px]">Pending</span>';
      }

      tableBody.insertAdjacentHTML('beforeend', `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <td class="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 max-w-[120px] truncate">${visitorName}</td>
          <td class="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 max-w-[120px] truncate">${inmateName}</td>
          <td class="px-3 py-2 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap">${createdAt}</td>
          <td class="px-3 py-2 text-xs text-gray-700 dark:text-gray-200 max-w-[100px] truncate">${reasonForVisit}</td>
          <td class="px-3 py-2">${statusBadge}</td>
        </tr>
      `);
    });

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

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRecentVisitorRequests);
} else {
  initRecentVisitorRequests();
}
