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
    // Fetch statistics from dedicated endpoint
    const response = await fetch('/api/visitors/statistics');
    if (!response.ok) throw new Error('Failed to fetch statistics');
    
    const json = await response.json();
    const stats = json?.data || {};

    // Get counts from statistics
    const totalVisitors = stats.total || 0;
    const approvedVisits = stats.approved || 0;
    const pendingRequests = stats.pending || 0;
    
    // TODO: Add today's visits to statistics endpoint
    const todayVisits = 0;

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
