/**
 * Notifications Component
 * Handles real-time visitor request notifications for Warden
 */

// Prevent multiple initializations
let notificationInterval = null;
let isInitialized = false;

export async function initNotifications() {
  const notificationBadge = document.getElementById('notification-badge');
  const notificationCount = document.getElementById('notification-count');
  const notificationList = document.getElementById('notification-items');
  const notificationLoading = document.getElementById('notification-loading');
  const notificationEmpty = document.getElementById('notification-empty');

  if (!notificationBadge) {
    console.warn('Notification bell element not found');
    return;
  }

  // Prevent multiple initializations
  if (isInitialized) {
    console.warn('Notifications already initialized');
    return;
  }

  isInitialized = true;

  // Show loading state initially
  if (notificationLoading) {
    notificationLoading.style.display = 'block';
  }
  if (notificationEmpty) {
    notificationEmpty.style.display = 'none';
  }
  if (notificationList) {
    notificationList.innerHTML = '';
  }

  // Fetch pending visitor requests and conjugal requests
  await fetchNotifications();

  // Poll for new notifications every 30 seconds
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }
  notificationInterval = setInterval(fetchNotifications, 30000);

  // Add click handler to refresh notifications when dropdown opens
  const notificationBell = notificationBadge.closest('button');
  if (notificationBell) {
    // Use a flag to track if we've already added the listener
    if (!notificationBell.dataset.notificationListenerAdded) {
      notificationBell.dataset.notificationListenerAdded = 'true';
      notificationBell.addEventListener('click', async () => {
        // Small delay to ensure dropdown is visible, then refresh
        setTimeout(() => {
          fetchNotifications();
        }, 200);
      });
    }
  }


  async function fetchNotifications() {
    try {
      // Re-check DOM elements in case they were removed
      const badge = document.getElementById('notification-badge');
      const count = document.getElementById('notification-count');
      const list = document.getElementById('notification-items');
      const loading = document.getElementById('notification-loading');
      const empty = document.getElementById('notification-empty');

      if (!badge || !count) {
        console.warn('Notification elements not found, skipping fetch');
        return;
      }

      // Fetch pending visitation requests (logs) - this has schedule data
      let pendingRequests = [];
      try {
        const response = await fetch('/api/visitation-requests?per_page=50&page=1', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'same-origin',
        });

        if (response.ok) {
          const json = await response.json();
          // Filter only pending requests (status = 2)
          pendingRequests = (json?.data || []).filter(log => {
            const status = log.status;
            // Check for pending status (numeric 2, string '2', or string 'Pending')
            return status === 2 || status === '2' || status === 'Pending';
          });
        } else {
          console.error('Failed to fetch visitation requests:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching visitation requests:', error);
      }

      // Conjugal pending logs
      let conjugalLogs = [];
      try {
        const cvRes = await fetch('/api/conjugal-visits/logs/pending', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'same-origin',
        });

        if (cvRes.ok) {
          const cvJson = await cvRes.json();
          conjugalLogs = cvJson?.logs || [];
        } else {
          console.error('Failed to fetch conjugal visit logs:', cvRes.status, cvRes.statusText);
        }
      } catch (error) {
        console.error('Error fetching conjugal visit logs:', error);
      }

      // Fetch facial recognition (automatic) visitation requests
      let facialRecognitionRequests = [];
      try {
        const frRes = await fetch('/facial-recognition/visitation-requests/pending', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
          },
          credentials: 'same-origin',
        });

        if (frRes.ok) {
          const frJson = await frRes.json();
          facialRecognitionRequests = frJson?.requests || [];
        } else {
          console.error('Failed to fetch facial recognition requests:', frRes.status, frRes.statusText);
        }
      } catch (error) {
        console.error('Error fetching facial recognition requests:', error);
      }

      const totalCount = pendingRequests.length + conjugalLogs.length + facialRecognitionRequests.length;

      // Update badge
      if (badge && count) {
        if (totalCount > 0) {
          badge.style.display = 'inline-flex';
          count.textContent = totalCount > 99 ? '99+' : String(totalCount);
        } else {
          badge.style.display = 'none';
        }
      }

      // Update notification list (merge all three types)
      if (list && loading && empty) {
        updateNotificationList(pendingRequests, conjugalLogs, facialRecognitionRequests);
      }

    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Show error state
      const loading = document.getElementById('notification-loading');
      const empty = document.getElementById('notification-empty');
      if (loading) loading.style.display = 'none';
      if (empty) {
        empty.innerHTML = '<p class="text-sm text-red-500 dark:text-red-400">Error loading notifications</p>';
        empty.style.display = 'block';
      }
    }
  }

  function updateNotificationList(requests, conjugalLogs = [], facialRecognitionRequests = []) {
    // Re-check DOM elements
    const loading = document.getElementById('notification-loading');
    const empty = document.getElementById('notification-empty');
    const list = document.getElementById('notification-items');

    if (!list) {
      console.warn('Notification list element not found');
      return;
    }

    // Hide loading
    if (loading) {
      loading.style.display = 'none';
    }

    if (requests.length === 0 && conjugalLogs.length === 0 && facialRecognitionRequests.length === 0) {
      // Show empty state
      if (empty) {
        empty.style.display = 'block';
      }
      if (list) {
        list.innerHTML = '';
      }
      return;
    }

    // Hide empty state
    if (empty) {
      empty.style.display = 'none';
    }

    // Build notification items
    const notificationsHTML = [
      // Standard visitor requests (from visitation-logs)
      ...requests.map(log => {
      // Get visitor name from log data
      const visitorName = log.visitor || log.visitorDetails?.name || 'Unknown Visitor';
      
      // Get inmate name from log data
      const inmateName = log.inmate?.name || 
                         `${log.inmate?.first_name || ''} ${log.inmate?.last_name || ''}`.trim() || 
                         log.pdlDetails?.name ||
                         'Unknown Inmate';
      const inmateId = log.inmate_id || log.pdlDetails?.inmate_id || '';
      const logId = log.id;
      const schedule = log.schedule || null;
      const createdAt = log.created_at;
      
      // Use schedule date for time label if available, otherwise use creation time
      const timeLabel = schedule && schedule !== 'N/A' ? getScheduleTimeLabel(schedule) : getTimeAgo(createdAt);
      const isPast = schedule && schedule !== 'N/A' ? (new Date(schedule) < new Date()) : false;

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
              <p class="text-xs ${isPast ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'} mt-1">
                ${schedule && schedule !== 'N/A' ? `Visit: ${timeLabel}` : timeLabel}
              </p>
            </div>
            <div class="flex items-center gap-1">
              <!-- Approve Button -->
              <button 
                onclick="handleVisitationLogAction(${logId}, 'approve')"
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
                title="Approve">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
              <!-- Reject Button -->
              <button 
                onclick="handleVisitationLogAction(${logId}, 'reject')"
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
      }),
      // Conjugal visit pending requests
      ...conjugalLogs.map(log => {
        const visitorName = log.visitor?.name || 'Unknown Visitor';
        // Use full_name first, then name, then fallback
        const inmateName = log.inmate?.full_name || log.inmate?.name || 
                          (log.inmate?.first_name && log.inmate?.last_name 
                            ? `${log.inmate.first_name} ${log.inmate.last_name}`.trim()
                            : 'Unknown Inmate');
        const inmateId = log.inmate?.id || '';
        const createdAt = log.created_at;
        const schedule = log.schedule || null;
        
        // Use schedule date for time label if available, otherwise use creation time
        const timeLabel = schedule && schedule !== 'N/A' ? getScheduleTimeLabel(schedule) : getTimeAgo(createdAt);
        const isPast = schedule && schedule !== 'N/A' ? (new Date(schedule) < new Date()) : false;
        
        return `
          <div class="px-4 py-3 hover:bg-white/50 dark:hover:bg-white/5 border-b border-gray-200 dark:border-gray-800 last:border-0 transition-colors">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                  Conjugal: ${visitorName}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Wants to visit: <span class="font-medium text-gray-700 dark:text-gray-300">${inmateName}</span>
                  ${inmateId ? `<span class="text-gray-400 dark:text-gray-500">(ID ${String(inmateId).padStart(4, '0')})</span>` : ''}
                </p>
                <p class="text-xs ${isPast ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'} mt-1">
                  ${schedule && schedule !== 'N/A' ? `Visit: ${timeLabel}` : timeLabel}
                </p>
              </div>
              <div class="flex items-center gap-1">
                <button onclick="handleConjugalNotificationAction(${log.id}, 'approve')" class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer" title="Approve Request">
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
                <button onclick="handleConjugalNotificationAction(${log.id}, 'reject')" class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer" title="Reject Request">
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
          </div>`;
      }),
      // Facial Recognition (Automatic) visitation requests
      ...facialRecognitionRequests.map(request => {
        // Handle visitor data - could be nested or direct
        const visitor = request.visitor || {};
        const visitorName = visitor.name || visitor.full_name || 
                           (visitor.first_name && visitor.last_name 
                             ? `${visitor.first_name} ${visitor.last_name}`.trim()
                             : 'Unknown Visitor');
        
        // Handle inmate data - could be nested or direct  
        const inmate = request.inmate || {};
        const inmateName = inmate.name || inmate.full_name ||
                          (inmate.first_name && inmate.last_name 
                            ? `${inmate.first_name} ${inmate.last_name}`.trim()
                            : 'Unknown Inmate');
        const inmateId = inmate.id || inmate.inmate_id || request.inmate_id || '';
        
        const createdAt = request.created_at;
        const visitDate = request.visit_date || null;
        const visitTime = request.visit_time || null;
        
        // Get confidence from facial_recognition_log or direct property
        const matchConfidence = request.facial_recognition_log?.confidence_percentage || 
                               request.confidence_percentage || 
                               request.match_confidence || 0;
        
        // Use visit date for time label if available, otherwise use creation time
        const timeLabel = visitDate ? getScheduleTimeLabel(visitDate) : getTimeAgo(createdAt);
        const isPast = visitDate ? (new Date(visitDate) < new Date()) : false;
        
        return `
          <div class="px-4 py-3 hover:bg-white/50 dark:hover:bg-white/5 border-b border-gray-200 dark:border-gray-800 last:border-0 transition-colors">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                    ${visitorName}
                  </p>
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 shrink-0">
                    <svg class="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                    </svg>
                    Auto
                  </span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Wants to visit: <span class="font-medium text-gray-700 dark:text-gray-300">${inmateName}</span>
                  ${inmateId ? `<span class="text-gray-400 dark:text-gray-500">(ID ${String(inmateId).padStart(4, '0')})</span>` : ''}
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <p class="text-xs ${isPast ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'}">
                    ${visitDate ? `Visit: ${timeLabel}` : timeLabel}
                  </p>
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    ${matchConfidence}% match
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button onclick="handleFacialRecognitionAction(${request.id}, 'approve')" class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer" title="Approve Request">
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>
                <button onclick="handleFacialRecognitionAction(${request.id}, 'reject', '${visitorName.replace(/'/g, "\\'")}', ${visitor.id || request.visitor_id || 'null'})" class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer" title="Reject Request">
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
          </div>`;
      })
    ].join('');

    if (list) {
      list.innerHTML = notificationsHTML;
    }
  }

  /**
   * Get time ago for notification creation time
   */
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

  /**
   * Get schedule time label based on visit schedule date
   * Shows "X days ago" for past dates, "in X days" for future dates
   * @param {string} scheduleString - Schedule date/time string (ISO format or date string)
   * @returns {string} Formatted time label
   */
  function getScheduleTimeLabel(scheduleString) {
    if (!scheduleString) return 'No schedule';
    
    try {
      const scheduleDate = new Date(scheduleString);
      const now = new Date();
      
      // Reset time to start of day for accurate day comparison
      const scheduleStartOfDay = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate());
      const nowStartOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Calculate difference in days
      const diffTime = scheduleStartOfDay - nowStartOfDay;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Handle past dates (negative days)
      if (diffDays < 0) {
        const daysAgo = Math.abs(diffDays);
        
        if (daysAgo === 0) {
          return 'Today';
        } else if (daysAgo === 1) {
          return 'Yesterday';
        } else if (daysAgo < 7) {
          return `${daysAgo}d ago`;
        } else if (daysAgo < 14) {
          return '1w ago';
        } else {
          const weeksAgo = Math.floor(daysAgo / 7);
          if (weeksAgo < 4) {
            return `${weeksAgo}w ago`;
          } else {
            // For dates more than 4 weeks ago, show actual date
            return scheduleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: scheduleDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
          }
        }
      } 
      // Handle future dates (positive days)
      else if (diffDays > 0) {
        if (diffDays === 1) {
          return 'Tomorrow';
        } else if (diffDays < 7) {
          return `in ${diffDays}d`;
        } else if (diffDays < 14) {
          return 'in 1w';
        } else {
          const weeksAhead = Math.floor(diffDays / 7);
          if (weeksAhead < 4) {
            return `in ${weeksAhead}w`;
          } else {
            // For dates more than 4 weeks ahead, show actual date
            return scheduleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: scheduleDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
          }
        }
      } 
      // Same day (today)
      else {
        return 'Today';
      }
    } catch (error) {
      console.error('Error parsing schedule date:', error);
      return 'Invalid date';
    }
  }
}

/**
 * Show decline reason modal with form
 * @param {number} logId - The log ID
 * @param {string} visitorName - Visitor name for context
 * @param {Function} onConfirm - Callback when user confirms decline
 */
window.showDeclineReasonModal = async function(logId, visitorName, onConfirm) {
  if (!window.Swal || !window.ThemeManager) {
    console.error('SweetAlert2 or ThemeManager not available');
    return;
  }

  const isDarkMode = window.ThemeManager.isDarkMode();
  const palette = window.ThemeManager.getPalette();
  const isMobile = window.innerWidth < 640;

  const result = await window.Swal.fire({
    icon: 'warning',
    title: `<span class="${isDarkMode ? 'text-white' : 'text-gray-900'} text-base sm:text-lg font-semibold">Decline Request</span>`,
    html: `
      <div class="text-left w-full mx-auto">
        <p class="text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3 sm:mb-4 leading-relaxed">
          Please provide a reason for declining the visitation request from <strong class="${isDarkMode ? 'text-white' : 'text-gray-900'}">${visitorName || 'this visitor'}</strong>.
        </p>
        <textarea 
          id="decline-reason-input" 
          rows="4" 
          class="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          placeholder="Enter reason for decline (e.g., Schedule conflict, Facility maintenance, etc.)"
          style="min-height: 100px; max-height: 200px;"
        ></textarea>
        <p class="text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 sm:mt-3">
          This reason will be sent to the visitor via SMS and email.
        </p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Confirm Decline',
    cancelButtonText: 'Cancel',
    confirmButtonColor: palette.danger,
    cancelButtonColor: isDarkMode ? '#374151' : '#6B7280',
    background: palette.background,
    color: palette.text,
    width: isMobile ? '90%' : '36rem',
    padding: isMobile ? '1rem' : '1.5rem',
    customClass: {
      popup: `rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`,
      title: `${isDarkMode ? 'text-white' : 'text-gray-900'} text-base sm:text-lg font-semibold mb-3 sm:mb-4`,
      htmlContainer: `${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm sm:text-base mt-2 sm:mt-3`,
      confirmButton: `px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg transition-colors ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'} text-white cursor-pointer`,
      cancelButton: `px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} cursor-pointer`,
      actions: 'flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-5',
    },
    focusConfirm: false,
    focusCancel: false,
    preConfirm: () => {
      const reasonInput = document.getElementById('decline-reason-input');
      const reason = reasonInput ? reasonInput.value.trim() : '';
      
      if (!reason) {
        window.Swal.showValidationMessage('Please provide a reason for declining the request.');
        return false;
      }
      
      if (reason.length < 10) {
        window.Swal.showValidationMessage('Reason must be at least 10 characters long.');
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

// Global function for visitation log actions (from visitation-requests endpoint)
window.handleVisitationLogAction = async function(logId, action) {
  // Get button from event
  const button = event?.target?.closest('button');
  if (!button) {
    console.error('Button not found');
    return;
  }

  const originalHTML = button.innerHTML;
  
  try {
    // If action is reject, show decline reason modal first
    if (action === 'reject') {
      // Get visitor name from the notification item
      const notificationItem = button.closest('.px-4');
      const visitorNameEl = notificationItem?.querySelector('.text-sm.font-medium');
      const visitorName = visitorNameEl?.textContent?.trim() || 'Visitor';
      
      // Show decline reason modal
      await showDeclineReasonModal(logId, visitorName, async (declineReason) => {
        // Show loading state
        button.disabled = true;
        button.innerHTML = '<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';

        try {
          // Update status via API - using visitation-requests endpoint
          const response = await fetch(`/api/visitation-requests/${logId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
            },
            body: JSON.stringify({ status: 0 })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update request');
          }

          // Send decline reason notification (commented function - see calendar-handler.js)
          // sendDeclineReasonNotification(visitorName, declineReason);

          // Show success message with theme integration
          if (window.Swal && window.ThemeManager) {
            const isDarkMode = window.ThemeManager.isDarkMode();
            await window.Swal.fire({
              icon: 'success',
              title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Request Declined</span>`,
              text: 'The visitor request has been declined and the reason has been sent to the visitor.',
              timer: 2000,
              showConfirmButton: false,
              background: isDarkMode ? '#111827' : '#FFFFFF',
              color: isDarkMode ? '#F9FAFB' : '#111827'
            });
          }

          // Auto-reload page after successful notification action
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
      });
      return;
    }

    // For approve action, proceed normally
    const status = action === 'approve' ? 1 : 0;
    
    // Show loading state
    button.disabled = true;
    button.innerHTML = '<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';

    // Update status via API - using visitation-requests endpoint
    const response = await fetch(`/api/visitation-requests/${logId}/status`, {
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
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Request Approved!</span>`,
        text: 'The visitor request has been approved.',
        timer: 2000,
        showConfirmButton: false,
        background: isDarkMode ? '#111827' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827'
      });
    }

    // Auto-reload page after successful notification action
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

// Legacy function for backward compatibility (visitors endpoint)
window.handleNotificationAction = async function(visitorId, action) {
  // Get button from event
  const button = event?.target?.closest('button');
  if (!button) {
    console.error('Button not found');
    return;
  }

  const originalHTML = button.innerHTML;
  
  try {
    // If action is reject, show decline reason modal first
    if (action === 'reject' || action === 'decline') {
      // Try to get visitor name from the table row or card
      const row = button.closest('tr') || button.closest('[data-id]');
      const visitorNameEl = row?.querySelector('.text-blue-600, .js-visitor-link, [data-visitor-name]');
      const visitorName = visitorNameEl?.textContent?.trim() || 'Visitor';
      
      // Show decline reason modal
      await showDeclineReasonModal(visitorId, visitorName, async (declineReason) => {
        // Show loading state
        button.disabled = true;
        button.innerHTML = '<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';

        try {
          // Update status via API - using visitors endpoint
          const response = await fetch(`/api/visitors/${visitorId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
            },
            body: JSON.stringify({ status: 0 })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update request');
          }

          // Send decline reason notification (commented function - see calendar-handler.js)
          // sendDeclineReasonNotification(visitorName, declineReason);

          // Show success message with theme integration
          if (window.Swal && window.ThemeManager) {
            const isDarkMode = window.ThemeManager.isDarkMode();
            await window.Swal.fire({
              icon: 'success',
              title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Request Declined</span>`,
              text: 'The visitor request has been declined and the reason has been sent to the visitor.',
              timer: 2000,
              showConfirmButton: false,
              background: isDarkMode ? '#111827' : '#FFFFFF',
              color: isDarkMode ? '#F9FAFB' : '#111827'
            });
          }

          // Auto-reload page after successful notification action
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
      });
      return;
    }

    // For approve action, proceed normally
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
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Request Approved!</span>`,
        text: 'The visitor request has been approved.',
        timer: 2000,
        showConfirmButton: false,
        background: isDarkMode ? '#111827' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827'
      });
    }

    // Auto-reload page after successful notification action
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

// Global actions for conjugal notifications (only approve/reject for requests)
window.handleConjugalNotificationAction = async function(logId, action) {
  const button = event?.target?.closest('button');
  const originalHTML = button?.innerHTML;
  
  try {
    // If action is reject, show decline reason modal first
    if (action === 'reject') {
      // Get visitor name from the notification item
      const notificationItem = button.closest('.px-4');
      const visitorNameEl = notificationItem?.querySelector('.text-sm.font-medium');
      const visitorName = visitorNameEl?.textContent?.replace('Conjugal: ', '').trim() || 'Visitor';
      
      // Show decline reason modal
      await showDeclineReasonModal(logId, visitorName, async (declineReason) => {
        // Show loading state
        if (button) {
          button.disabled = true;
          button.innerHTML = '<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
        }

        try {
          const response = await fetch(`/api/conjugal-visits/logs/${logId}/status`, { 
            method: 'PATCH', 
            headers: { 
              'Content-Type': 'application/json', 
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content 
            }, 
            body: JSON.stringify({ status: 0 }) 
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update request status');
          }

          // Send decline reason notification (commented function - see calendar-handler.js)
          // sendDeclineReasonNotification(visitorName, declineReason);

          // Feedback
          if (window.Swal && window.ThemeManager) {
            const isDarkMode = window.ThemeManager.isDarkMode();
            await window.Swal.fire({
              icon: 'success',
              title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Request Declined</span>`,
              text: 'The conjugal visit request has been declined and the reason has been sent to the visitor.',
              timer: 2000,
              showConfirmButton: false,
              background: isDarkMode ? '#111827' : '#FFFFFF',
              color: isDarkMode ? '#F9FAFB' : '#111827'
            });
          }
          setTimeout(() => window.location.reload(), 800);
        } catch (err) {
          if (window.Swal && window.ThemeManager) {
            const isDarkMode = window.ThemeManager.isDarkMode();
            await window.Swal.fire({
              icon: 'error',
              title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Error</span>`,
              text: err.message || 'Failed to perform action.',
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
      });
      return;
    }

    // For approve action, proceed normally
    if (button) {
      button.disabled = true;
      button.innerHTML = '<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
    }
    
    // Only handle approve/reject actions (payment actions moved to visitor details modal)
    if (action === 'approve' || action === 'reject') {
      const status = action === 'approve' ? 1 : 0;
      const response = await fetch(`/api/conjugal-visits/logs/${logId}/status`, { 
        method: 'PATCH', 
        headers: { 
          'Content-Type': 'application/json', 
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content 
        }, 
        body: JSON.stringify({ status }) 
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update request status');
      }
    } else {
      throw new Error('Invalid action. Only approve and reject are allowed from notifications.');
    }
    
    // Feedback
    if (window.Swal && window.ThemeManager) {
      const isDarkMode = window.ThemeManager.isDarkMode();
      await window.Swal.fire({
        icon: 'success',
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Request Approved</span>`,
        text: 'The conjugal visit request has been approved.',
        timer: 2000,
        showConfirmButton: false,
        background: isDarkMode ? '#111827' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827'
      });
    }
    setTimeout(() => window.location.reload(), 800);
  } catch (err) {
    if (window.Swal && window.ThemeManager) {
      const isDarkMode = window.ThemeManager.isDarkMode();
      await window.Swal.fire({
        icon: 'error',
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Error</span>`,
        text: err.message || 'Failed to perform action.',
        background: isDarkMode ? '#111827' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827'
      });
    }
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = originalHTML;
    }
  }
};

// Global actions for facial recognition (automatic) visitation requests
window.handleFacialRecognitionAction = async function(requestId, action, visitorName = 'Visitor', visitorId = null) {
  const button = event?.target?.closest('button');
  const originalHTML = button?.innerHTML;
  
  try {
    // If action is reject, show decline reason modal first
    if (action === 'reject') {
      // Show decline reason modal
      await showDeclineReasonModal(requestId, visitorName, async (declineReason) => {
        // Show loading state
        if (button) {
          button.disabled = true;
          button.innerHTML = '<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
        }

        try {
          const response = await fetch(`/facial-recognition/visitation-requests/${requestId}/decline`, { 
            method: 'POST', 
            headers: { 
              'Content-Type': 'application/json', 
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
              'Accept': 'application/json',
            }, 
            body: JSON.stringify({ 
              reason: declineReason,
              visitor_id: visitorId
            }) 
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to decline request');
          }

          // Feedback
          if (window.Swal && window.ThemeManager) {
            const isDarkMode = window.ThemeManager.isDarkMode();
            await window.Swal.fire({
              icon: 'success',
              title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Request Declined</span>`,
              text: 'The automatic visitation request has been declined.',
              timer: 2000,
              showConfirmButton: false,
              background: isDarkMode ? '#111827' : '#FFFFFF',
              color: isDarkMode ? '#F9FAFB' : '#111827'
            });
          }
          setTimeout(() => window.location.reload(), 800);
        } catch (err) {
          if (window.Swal && window.ThemeManager) {
            const isDarkMode = window.ThemeManager.isDarkMode();
            await window.Swal.fire({
              icon: 'error',
              title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Error</span>`,
              text: err.message || 'Failed to decline request.',
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
      });
      return;
    }

    // For approve action, proceed normally
    if (button) {
      button.disabled = true;
      button.innerHTML = '<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
    }
    
    if (action === 'approve') {
      const response = await fetch(`/facial-recognition/visitation-requests/${requestId}/approve`, { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to approve request');
      }
    } else {
      throw new Error('Invalid action.');
    }
    
    // Feedback
    if (window.Swal && window.ThemeManager) {
      const isDarkMode = window.ThemeManager.isDarkMode();
      await window.Swal.fire({
        icon: 'success',
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Request Approved</span>`,
        text: 'The automatic visitation request has been approved.',
        timer: 2000,
        showConfirmButton: false,
        background: isDarkMode ? '#111827' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827'
      });
    }
    setTimeout(() => window.location.reload(), 800);
  } catch (err) {
    if (window.Swal && window.ThemeManager) {
      const isDarkMode = window.ThemeManager.isDarkMode();
      await window.Swal.fire({
        icon: 'error',
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Error</span>`,
        text: err.message || 'Failed to perform action.',
        background: isDarkMode ? '#111827' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827'
      });
    }
  } finally {
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
