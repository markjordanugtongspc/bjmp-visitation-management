// Dashboard initialization
import initRoleBasedNavigation from './components/role-based.js';

// Sidebar toggle logic for dashboard
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('[data-sidebar-toggle]');
  const aside = document.querySelector('[data-sidebar]');
  const overlay = document.querySelector('[data-sidebar-overlay]');
  const nav = document.querySelector('[data-sidebar-nav]');
  if (!btn || !aside || !overlay) return;

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

  // Initialize dashboard inmate count
  initializeDashboardInmateCount();
  
  // Initialize role-based navigation
  initRoleBasedNavigation();
});

/**
 * Initialize dashboard inmate count
 */
async function initializeDashboardInmateCount() {
  try {
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
        const totalInmatesElement = document.getElementById('total-inmates');
        if (totalInmatesElement) {
          const count = data.data.total || 0;
          totalInmatesElement.textContent = count;
          console.log('Dashboard inmate count updated to:', count);
        } else {
          console.error('Element with id "total-inmates" not found');
        }
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


