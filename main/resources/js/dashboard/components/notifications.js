/**
 * Notifications Component
 * Handles real-time visitor request notifications for Warden
 */

export async function initNotifications() {
  const notificationBadge = document.getElementById('notification-badge');
  const notificationCount = document.getElementById('notification-count');
  const notificationList = document.getElementById('notification-items');
  const notificationLoading = document.getElementById('notification-loading');
  const notificationEmpty = document.getElementById('notification-empty');

  if (!notificationBadge) return;

  // Fetch pending visitor requests
  await fetchNotifications();

  // Poll for new notifications every 30 seconds
  setInterval(fetchNotifications, 30000);

  async function fetchNotifications() {
    try {
      const response = await fetch('/api/visitors');
      if (!response.ok) throw new Error('Failed to fetch notifications');

      const json = await response.json();
      const visitors = json?.data || [];

      // Filter pending requests (status = 2)
      const pendingRequests = visitors.filter(v => 
        v.latest_log && (v.latest_log.status === 2 || v.latest_log.status === '2')
      );

      const count = pendingRequests.length;

      // Update badge
      if (count > 0) {
        notificationBadge.style.display = 'inline-flex';
        notificationCount.textContent = count > 99 ? '99+' : count;
      } else {
        notificationBadge.style.display = 'none';
      }

      // Update notification list
      updateNotificationList(pendingRequests);

    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }

  function updateNotificationList(requests) {
    // Hide loading
    if (notificationLoading) {
      notificationLoading.style.display = 'none';
    }

    if (requests.length === 0) {
      // Show empty state
      if (notificationEmpty) {
        notificationEmpty.style.display = 'block';
      }
      if (notificationList) {
        notificationList.innerHTML = '';
      }
      return;
    }

    // Hide empty state
    if (notificationEmpty) {
      notificationEmpty.style.display = 'none';
    }

    // Build notification items
    const notificationsHTML = requests.map(visitor => {
      // Get visitor name from the visitor object
      const visitorName = visitor.name || 'Unknown Visitor';
      
      // Get inmate name from visitor.inmate relationship (not latest_log)
      // Inmate model has full_name accessor that combines first_name + last_name
      const inmateName = visitor.inmate?.full_name || 
                         `${visitor.inmate?.first_name || ''} ${visitor.inmate?.last_name || ''}`.trim() || 
                         'Unknown Inmate';
      const inmateId = visitor.inmate?.id || '';
      const visitorId = visitor.visitor_id || visitor.id;
      const createdAt = visitor.latest_log?.created_at || visitor.created_at;
      const timeAgo = getTimeAgo(createdAt);

      return `
        <div class="px-4 py-3 hover:bg-white/50 dark:hover:bg-white/5 border-b border-gray-200 dark:border-gray-800 last:border-0 transition-colors">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                ${visitorName}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Wants to visit: <span class="font-medium text-gray-700 dark:text-gray-300">${inmateName}</span>
                ${inmateId ? `<span class="text-gray-400 dark:text-gray-500">(ID ${String(inmateId).padStart(4, '0')})</span>` : ''}
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">${timeAgo}</p>
            </div>
            <div class="flex items-center gap-1">
              <!-- Approve Button -->
              <button 
                onclick="handleNotificationAction(${visitorId}, 'approve')"
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
                title="Approve">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
              <!-- Reject Button -->
              <button 
                onclick="handleNotificationAction(${visitorId}, 'reject')"
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                title="Reject">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (notificationList) {
      notificationList.innerHTML = notificationsHTML;
    }
  }

  function getTimeAgo(dateString) {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  }
}

// Global function for notification actions
window.handleNotificationAction = async function(visitorId, action) {
  // Get button from event
  const button = event?.target?.closest('button');
  if (!button) {
    console.error('Button not found');
    return;
  }

  const originalHTML = button.innerHTML;
  
  try {
    const status = action === 'approve' ? 1 : 0;
    
    // Show loading state
    button.disabled = true;
    button.innerHTML = '<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';

    // Update status via API - using visitors endpoint
    const response = await fetch(`/api/visitors/${visitorId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update request');
    }

    // Show success message with theme integration
    if (window.Swal && window.ThemeManager) {
      const isDarkMode = window.ThemeManager.isDarkMode();
      window.Swal.fire({
        icon: 'success',
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">${action === 'approve' ? 'Request Approved!' : 'Request Rejected'}</span>`,
        text: `The visitor request has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
        timer: 2000,
        showConfirmButton: false,
        background: isDarkMode ? '#111827' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827'
      });
    }

    // Auto-reload page after successful notification action (same pattern as inmates.js)
    console.log('Auto-reloading page after successful notification operation...');
    setTimeout(() => {
      window.location.reload();
    }, 1500);

  } catch (error) {
    console.error('Error updating request:', error);
    
    // Show error message with theme integration
    if (window.Swal && window.ThemeManager) {
      const isDarkMode = window.ThemeManager.isDarkMode();
      window.Swal.fire({
        icon: 'error',
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Error</span>`,
        text: error.message || 'Failed to update the request. Please try again.',
        background: isDarkMode ? '#111827' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827'
      });
    }

    // Restore button
    if (button) {
      button.disabled = false;
      button.innerHTML = originalHTML;
    }
  }
};

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNotifications);
} else {
  initNotifications();
}
