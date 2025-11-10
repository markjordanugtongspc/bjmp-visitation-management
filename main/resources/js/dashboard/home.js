// Dashboard initialization
import initRoleBasedNavigation from './components/role-based.js';
import { initRecentVisitorRequests } from './components/recent-visitor-requests.js';
import { initCharts } from './components/chart.js';
import { initNotifications } from './components/notifications.js';

// Sidebar toggle logic for dashboard
document.addEventListener('DOMContentLoaded', () => {
  // Initialize dashboard components FIRST (before any early returns)
  // This ensures components work on all dashboards regardless of sidebar elements
  initDashboardComponents();
  
  // Initialize role-based navigation
  initRoleBasedNavigation();
  
  // Initialize dashboard inmate count
  initializeDashboardInmateCount();
  
  // Sidebar toggle setup (optional - won't break if elements don't exist)
  const btn = document.querySelector('[data-sidebar-toggle]');
  const aside = document.querySelector('[data-sidebar]');
  const overlay = document.querySelector('[data-sidebar-overlay]');
  const nav = document.querySelector('[data-sidebar-nav]');
  
  if (btn && aside && overlay) {
    const open = () => {
      aside.classList.remove('-translate-x-full');
      overlay.classList.remove('hidden');
    };
    const close = () => {
      aside.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    };

    btn.addEventListener('click', open);
    overlay.addEventListener('click', close);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // Close sidebar on nav click (mobile only)
    if (nav) {
      nav.addEventListener('click', (e) => {
        const isLink = (e.target instanceof Element) && e.target.closest('a');
        if (isLink && window.innerWidth < 640) {
          close();
        }
      });
    }
  }

  // User menu toggle
  const userBtn = document.querySelector('[data-user-menu]');
  const userMenu = document.querySelector('[data-user-menu-panel]');
  if (userBtn && userMenu) {
    const toggleUserMenu = () => userMenu.classList.toggle('hidden');
    const hideUserMenu = (e) => {
      if (!userMenu.contains(e.target) && !userBtn.contains(e.target)) {
        userMenu.classList.add('hidden');
      }
    };
    userBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleUserMenu(); });
    document.addEventListener('click', hideUserMenu);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') userMenu.classList.add('hidden'); });
  }
});

/**
 * Initialize all dashboard components
 * Ensures all components are loaded on all dashboards (Admin, Warden, Assistant Warden, Searcher)
 */
async function initDashboardComponents() {
  try {
    console.log('Initializing dashboard components...');
    
    // Initialize recent visitor requests (includes Show More functionality)
    const recentRequestsTbody = document.getElementById('recent-requests-tbody');
    if (recentRequestsTbody) {
      console.log('Found recent-requests-tbody, initializing...');
      await initRecentVisitorRequests();
      console.log('Recent visitor requests initialized');
    } else {
      console.log('recent-requests-tbody not found, skipping recent visitor requests');
    }
    
    // Initialize charts (includes upcoming schedules with automatic requests)
    const chartElements = document.querySelector('[data-chart]') || document.querySelector('[data-schedules-container]');
    if (chartElements) {
      console.log('Found chart elements, initializing...');
      await initCharts();
      console.log('Charts initialized');
    } else {
      console.log('Chart elements not found, skipping charts');
    }
    
    // Initialize notifications (works for all roles)
    const notificationBadge = document.getElementById('notification-badge');
    if (notificationBadge) {
      console.log('Found notification-badge, initializing...');
      await initNotifications();
      console.log('Notifications initialized');
    } else {
      console.log('notification-badge not found, skipping notifications');
    }
    
    console.log('Dashboard components initialization complete');
  } catch (error) {
    console.error('Error initializing dashboard components:', error);
  }
}

/**
 * Initialize dashboard inmate count
 */
async function initializeDashboardInmateCount() {
  try {
    // Check if inmate count elements exist (only on inmates pages)
    const totalInmatesElement = document.getElementById('total-inmates');
    if (!totalInmatesElement) {
      console.log('Inmate count elements not found - skipping inmate count initialization');
      return;
    }
    
    console.log('Initializing dashboard inmate count...');
    
    // Fetch initial inmate count
    await fetchAndUpdateInmateCount();
    
    // Set up periodic refresh every 30 seconds
    setInterval(fetchAndUpdateInmateCount, 30000);
    
    console.log('Dashboard inmate count initialized successfully');
  } catch (error) {
    console.error('Error initializing dashboard inmate count:', error);
  }
}


/**
 * Fetch inmate statistics from API and update the counter
 */
async function fetchAndUpdateInmateCount() {
  try {
    // Check if inmate count elements exist (only on inmates pages)
    const totalInmatesElement = document.getElementById('total-inmates');
    if (!totalInmatesElement) {
      console.log('Inmate count elements not found - skipping inmate count fetch');
      return;
    }
    
    console.log('Fetching inmate statistics...');
    
    const response = await fetch('/api/inmates/statistics', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
      }
    });

    console.log('API Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('API Response data:', data);
      
      if (data.success && data.data) {
        // Update the total inmates count on dashboard
        const count = data.data.total || 0;
        totalInmatesElement.textContent = count;
        console.log('Dashboard inmate count updated to:', count);
      } else {
        console.error('Invalid API response structure:', data);
      }
    } else {
      console.error('Failed to fetch inmate statistics:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error fetching inmate statistics for dashboard:', error);
  }
}


