/**
 * Category Filter Component
 * Handles filtering supervision files by category based on tab selection
 */

// Category configuration matching supervision-form.js
const CATEGORIES = [
  { value: 'Operations', label: 'Operations', color: 'blue', tabId: 'ops' },
  { value: 'Intake', label: 'Intake', color: 'emerald', tabId: 'intake' },
  { value: 'Safety', label: 'Safety', color: 'amber', tabId: 'safety' },
  { value: 'Medical', label: 'Medical', color: 'rose', tabId: 'medical' },
  { value: 'Visitation', label: 'Visitation', color: 'indigo', tabId: 'visitation' },
  { value: 'Training', label: 'Training', color: 'fuchsia', tabId: 'training' },
  { value: 'Discipline', label: 'Discipline', color: 'teal', tabId: 'discipline' },
  { value: 'Emergency', label: 'Emergency', color: 'red', tabId: 'emergency' },
  { value: 'Conjugal', label: 'Conjugal', color: 'pink', tabId: 'conjugal' }
];

let currentCategory = null; // null = 'All'

/**
 * Initialize category filter functionality
 */
export function initCategoryFilter() {
  console.log('Initializing category filter...');
  
  // Setup tab click handlers
  setupTabHandlers();
  
  // Ensure all category tab panels exist
  ensureTabPanelsExist();
  
  console.log('Category filter initialized');
}

/**
 * Setup click handlers for category tabs
 */
function setupTabHandlers() {
  // Get all tab buttons
  const tabButtons = document.querySelectorAll('[role="tab"]');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      const tabId = button.getAttribute('id');
      const targetPanel = button.getAttribute('data-tabs-target');
      
      if (!tabId || !targetPanel) return;
      
      // Determine category from tab ID
      let category = null; // 'All' tab
      
      if (tabId !== 'all-tab') {
        // Find category from tab ID (e.g., 'ops-tab' -> 'Operations')
        const categoryMatch = CATEGORIES.find(cat => {
          const expectedTabId = `${cat.tabId}-tab`;
          return tabId === expectedTabId;
        });
        
        if (categoryMatch) {
          category = categoryMatch.value;
        }
      }
      
      // Update active tab
      updateActiveTab(tabId);
      
      // Filter supervision cards by category
      filterByCategory(category);
      
      // Show the corresponding tab panel
      showTabPanel(targetPanel);
    });
  });
}

/**
 * Update active tab styling
 */
function updateActiveTab(activeTabId) {
  const allTabs = document.querySelectorAll('[role="tab"]');
  
  allTabs.forEach(tab => {
    const isActive = tab.getAttribute('id') === activeTabId;
    
    if (isActive) {
      tab.classList.remove('border-transparent', 'text-gray-700', 'dark:text-gray-200');
      tab.classList.add('text-blue-600', 'border-blue-600', 'dark:text-blue-400', 'dark:border-blue-400');
      tab.setAttribute('aria-selected', 'true');
    } else {
      tab.classList.remove('text-blue-600', 'border-blue-600', 'dark:text-blue-400', 'dark:border-blue-400');
      tab.classList.add('border-transparent', 'text-gray-700', 'dark:text-gray-200');
      tab.setAttribute('aria-selected', 'false');
    }
  });
}

/**
 * Show the specified tab panel
 */
function showTabPanel(panelSelector) {
  // Hide all tab panels
  const allPanels = document.querySelectorAll('[role="tabpanel"]');
  allPanels.forEach(panel => {
    panel.classList.add('hidden');
    panel.setAttribute('aria-hidden', 'true');
  });
  
  // Show the selected panel
  const targetPanel = document.querySelector(panelSelector);
  if (targetPanel) {
    targetPanel.classList.remove('hidden');
    targetPanel.setAttribute('aria-hidden', 'false');
  }
}

/**
 * Filter supervision cards by category
 * @param {string|null} category - Category to filter by (null for 'All')
 */
async function filterByCategory(category) {
  currentCategory = category;
  
  console.log('Filtering by category:', category || 'All');
  
  // Import supervision-cards module to access filtering
  try {
    const { filterSupervisionByCategory } = await import('./supervision-cards.js');
    
    if (typeof filterSupervisionByCategory === 'function') {
      await filterSupervisionByCategory(category);
    } else {
      console.warn('filterSupervisionByCategory function not found, refreshing all data');
      const { refreshSupervisionData } = await import('./supervision-cards.js');
      if (refreshSupervisionData) {
        await refreshSupervisionData();
      }
    }
  } catch (error) {
    console.error('Error filtering supervision by category:', error);
  }
}

/**
 * Ensure all category tab panels exist in the DOM
 */
function ensureTabPanelsExist() {
  const tabContainer = document.getElementById('all')?.parentElement;
  if (!tabContainer) return;
  
  // Check if panels already exist
  const existingPanels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
  const existingIds = existingPanels.map(p => p.id);
  
  // Create panels for each category
  CATEGORIES.forEach(category => {
    if (!existingIds.includes(category.tabId)) {
      const panel = document.createElement('div');
      panel.id = category.tabId;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', `${category.tabId}-tab`);
      panel.classList.add('hidden');
      panel.setAttribute('aria-hidden', 'true');
      
      // Add supervision cards container
      panel.innerHTML = `
        <div id="supervision-cards-container-${category.tabId}" class="mb-6"></div>
      `;
      
      tabContainer.appendChild(panel);
    }
  });
}

/**
 * Get current active category filter
 * @returns {string|null} Current category or null for 'All'
 */
export function getCurrentCategory() {
  return currentCategory;
}

/**
 * Reset filter to show all categories
 */
export function resetFilter() {
  currentCategory = null;
  const allTab = document.getElementById('all-tab');
  if (allTab) {
    allTab.click();
  }
}

