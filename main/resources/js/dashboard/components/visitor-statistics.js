/**
 * Visitor Statistics Component
 * Fetches and displays visitor statistics in dashboard KPI cards
 */

export async function initVisitorStatistics() {
  const totalVisitorsEl = document.getElementById('stat-total-visitors');
  const approvedVisitsEl = document.getElementById('stat-approved-visits');
  const pendingRequestsEl = document.getElementById('stat-pending-requests');
  const todayVisitsEl = document.getElementById('stat-today-visits');

  // Check if any of the statistics elements exist
  if (!approvedVisitsEl && !pendingRequestsEl && !totalVisitorsEl && !todayVisitsEl) return;

  try {
    // Fetch all visitors
    const response = await fetch('/api/visitors');
    if (!response.ok) throw new Error('Failed to fetch visitors');
    
    const json = await response.json();
    const visitors = json?.data || [];

    // Calculate statistics
    const totalVisitors = visitors.length;
    
    // Count approved visits (visitors with latest_log.status === 1)
    const approvedVisits = visitors.filter(v => 
      v.latest_log && v.latest_log.status === 1
    ).length;
    
    // Count pending requests (visitors with latest_log.status === 2)
    const pendingRequests = visitors.filter(v => 
      v.latest_log && v.latest_log.status === 2
    ).length;
    
    // Count today's visits (visitors with schedule today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayVisits = visitors.filter(v => {
      if (!v.latest_log || !v.latest_log.schedule) return false;
      const scheduleDate = new Date(v.latest_log.schedule);
      return scheduleDate >= today && scheduleDate < tomorrow;
    }).length;

    // Update DOM
    if (totalVisitorsEl) totalVisitorsEl.textContent = String(totalVisitors);
    if (approvedVisitsEl) approvedVisitsEl.textContent = String(approvedVisits);
    if (pendingRequestsEl) pendingRequestsEl.textContent = String(pendingRequests);
    if (todayVisitsEl) todayVisitsEl.textContent = String(todayVisits);

  } catch (error) {
    console.error('Error loading visitor statistics:', error);
    // Show error state
    if (totalVisitorsEl) totalVisitorsEl.textContent = '—';
    if (approvedVisitsEl) approvedVisitsEl.textContent = '—';
    if (pendingRequestsEl) pendingRequestsEl.textContent = '—';
    if (todayVisitsEl) todayVisitsEl.textContent = '—';
  }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVisitorStatistics);
} else {
  initVisitorStatistics();
}
