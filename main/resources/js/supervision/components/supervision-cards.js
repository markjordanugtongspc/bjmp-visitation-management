// Supervision Cards Component - Based on inmates.js carousel pattern
// Displays supervision data in a responsive carousel with 3 cards per page

// Cache for supervision pages
const supervisionPageCache = new Map();

// Main function to initialize supervision cards
export function initializeSupervisionCards() {
  console.log('Initializing supervision cards...');
  
  // Initialize the supervision cards on page load
  initializeSupervisionCardsPage();
}

// Initialize supervision cards page
async function initializeSupervisionCardsPage() {
  try {
    await renderSupervisionCards();
  } catch (error) {
    console.error('Error initializing supervision cards:', error);
  }
}

// Static supervision data for testing
const staticSupervisionData = [
  {
    id: 1,
    name: 'Cell Inspection SOP',
    type: 'Operations',
    category: 'Operations',
    description: 'Step-by-step procedures for daily cell inspections and documentation.',
    updatedDate: 'Sep 26, 2025',
    pages: 12,
    icon: 'blue',
    iconSvg: 'M6 4a2 2 0 00-2 2v12.5a.5.5 0 00.777.416L8 17l3.223 1.916a.5.5 0 00.554 0L15 17l3.223 1.916A.5.5 0 0019 18.5V6a2 2 0 00-2-2z',
    status: 'active',
    priority: 'High',
    progress: 100
  },
  {
    id: 2,
    name: 'Admission & Intake Checklist',
    type: 'Intake',
    category: 'Intake',
    description: 'Standardized checklist for new inmate intake and initial processing.',
    updatedDate: 'Sep 10, 2025',
    pages: 8,
    icon: 'emerald',
    iconSvg: 'M8.75 2.75A2.75 2.75 0 006 5.5v13a2.75 2.75 0 002.75 2.75h8.5A2.75 2.75 0 0020 18.5v-13A2.75 2.75 0 0017.25 2.75zM9.5 6h7v1.5h-7zM9.5 9h7v1.5h-7zM9.5 12h7v1.5h-7z',
    status: 'active',
    priority: 'Medium',
    progress: 95
  },
  {
    id: 3,
    name: 'Emergency Drill Playbook',
    type: 'Safety',
    category: 'Safety',
    description: 'Guidelines for fire, earthquake, and lockdown drills within facilities.',
    updatedDate: 'Aug 30, 2025',
    pages: 20,
    icon: 'amber',
    iconSvg: 'M12 2a7 7 0 017 7v2a7 7 0 01-14 0V9a7 7 0 017-7z M11 14h2v6h-2z',
    status: 'active',
    priority: 'High',
    progress: 85
  },
  {
    id: 4,
    name: 'Medication Administration Guide',
    type: 'Medical',
    category: 'Medical',
    description: 'Safe handling and distribution of inmate medications and record-keeping.',
    updatedDate: 'Sep 01, 2025',
    pages: 16,
    icon: 'rose',
    iconSvg: 'M3 7a4 4 0 014-4h10a4 4 0 014 4v2H3z M21 10H3v7a4 4 0 004 4h10a4 4 0 004-4z',
    status: 'active',
    priority: 'High',
    progress: 90
  },
  {
    id: 5,
    name: 'Visitor Management Handbook',
    type: 'Visitation',
    category: 'Visitation',
    description: 'Protocols for visitor scheduling, identity verification, and conduct.',
    updatedDate: 'Sep 20, 2025',
    pages: 22,
    icon: 'indigo',
    iconSvg: 'M7 7h10v2H7zM7 11h10v2H7zM7 15h10v2H7z',
    status: 'active',
    priority: 'Medium',
    progress: 75
  },
  {
    id: 6,
    name: 'Officer Onboarding Guide',
    type: 'Training',
    category: 'Training',
    description: 'Core competencies, code of conduct, and shadowing plan for new staff.',
    updatedDate: 'Aug 18, 2025',
    pages: 18,
    icon: 'fuchsia',
    iconSvg: 'M12 2a7 7 0 00-7 7v2a7 7 0 0014 0V9a7 7 0 00-7-7zm0 12a3 3 0 113-3 3 3 0 01-3 3z',
    status: 'active',
    priority: 'Medium',
    progress: 80
  },
  {
    id: 7,
    name: 'Incident Reporting Manual',
    type: 'Discipline',
    category: 'Discipline',
    description: 'How to document, escalate, and file disciplinary incidents accurately.',
    updatedDate: 'Sep 03, 2025',
    pages: 10,
    icon: 'teal',
    iconSvg: 'M5 3a2 2 0 00-2 2v9.764A3.236 3.236 0 006.236 18H18a3 3 0 003-3V5a2 2 0 00-2-2z M7 21a1 1 0 01-1-1v-2h12v2a1 1 0 01-1 1z',
    status: 'active',
    priority: 'High',
    progress: 88
  },
  {
    id: 8,
    name: 'Critical Incident Response',
    type: 'Emergency',
    category: 'Emergency',
    description: 'Immediate actions and chain-of-command for critical emergencies.',
    updatedDate: 'Jul 25, 2025',
    pages: 26,
    icon: 'red',
    iconSvg: 'M12 2a9 9 0 00-9 9v4a3 3 0 003 3h1v2a1 1 0 001.555.832L12 19h6a3 3 0 003-3v-4a9 9 0 00-9-9z',
    status: 'active',
    priority: 'Critical',
    progress: 92
  }
];

// Fetch supervision data page (using localStorage and static data for testing)
async function fetchSupervisionPage(offset = 0, limit = 3) {
  const cacheKey = `${offset}:${limit}`;
  if (supervisionPageCache.has(cacheKey)) {
    return supervisionPageCache.get(cacheKey);
  }

  // Simulate API delay for realistic testing
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // PLACEHOLDER: In a real implementation, this would be an API call
  // For now, we'll merge localStorage items with static data
  
  // Get items from localStorage if available
  let allSupervisionData = [...staticSupervisionData];
  try {
    const localItems = JSON.parse(localStorage.getItem('supervisionItems') || '[]');
    if (localItems && Array.isArray(localItems) && localItems.length > 0) {
      // Merge with static data (localStorage items first)
      allSupervisionData = [...localItems, ...staticSupervisionData];
      console.log('Loaded supervision items from localStorage:', localItems.length);
    }
  } catch (error) {
    console.error('Error loading supervision items from localStorage:', error);
  }

  const total = allSupervisionData.length;
  const supervision = allSupervisionData.slice(offset, offset + limit);

  const payload = {
    supervision,
    pagination: { total, limit, offset }
  };
  
  supervisionPageCache.set(cacheKey, payload);
  return payload;
}

// Render supervision cards
async function renderSupervisionCards() {
  const container = document.getElementById('supervision-cards-container');
  if (!container) {
    console.warn('Supervision cards container not found');
    return;
  }

  try {
    const { supervision, pagination } = await fetchSupervisionPage(0, 3);
    
    if (supervision.length === 0) {
      renderEmptyState(container);
      return;
    }

    // Use carousel for multiple items, grid for single page
    if (pagination.total > 3) {
      renderSupervisionCarousel({ 
        total: pagination.total, 
        limit: 3, 
        offset: 0, 
        initialSupervision: supervision 
      }, container);
    } else {
      renderSupervisionGrid(supervision, container);
    }
  } catch (error) {
    console.error('Error rendering supervision cards:', error);
    container.innerHTML = `
      <div class="text-center py-8">
        <div class="text-red-600 dark:text-red-400">
          <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <p class="text-lg font-medium">Error loading supervision data</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Please try refreshing the page</p>
        </div>
      </div>
    `;
  }
}

// Render supervision carousel
function renderSupervisionCarousel({ total, limit, offset, initialSupervision }, container) {
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  // Shell
  container.className = '';
  container.innerHTML = `
    <div class="relative">
      <div id="supervision-slide" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>

      <!-- Controls -->
      <div class="mt-4 flex items-center justify-between">
        <button id="supervision-prev" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:bg-white dark:disabled:hover:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <div id="supervision-indicators" class="flex items-center gap-2"></div>
        <button id="supervision-next" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:bg-white dark:disabled:hover:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  const slideEl = document.getElementById('supervision-slide');
  const prevBtn = document.getElementById('supervision-prev');
  const nextBtn = document.getElementById('supervision-next');
  const indicatorsEl = document.getElementById('supervision-indicators');

  function renderSlide(supervision) {
    slideEl.innerHTML = '';
    slideEl.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
    supervision.forEach((item, idx) => {
      slideEl.insertAdjacentHTML('beforeend', createSupervisionCard(item, idx));
    });
  }

  function renderIndicators(activePage) {
    indicatorsEl.innerHTML = '';
    for (let i = 1; i <= pageCount; i++) {
      const isActive = i === activePage;
      indicatorsEl.insertAdjacentHTML('beforeend', `
        <button data-page="${i}" class="h-2.5 w-2.5 rounded-full ${isActive ? 'bg-blue-600' : 'bg-gray-300'} hover:bg-blue-500 transition-colors cursor-pointer" aria-label="Go to page ${i}"></button>
      `);
    }
  }

  let currentOffset = offset;
  let currentPageIndex = currentPage; // 1-based

  renderSlide(initialSupervision);
  renderIndicators(currentPageIndex);
  updateControlsState();

  async function goToPage(pageIndex) {
    const clamped = Math.max(1, Math.min(pageCount, pageIndex));
    const newOffset = (clamped - 1) * limit;
    if (newOffset === currentOffset) return;

    try {
      const { supervision: pageSupervision } = await fetchSupervisionPage(newOffset, limit);
      currentOffset = newOffset;
      currentPageIndex = clamped;
      renderSlide(pageSupervision);
      renderIndicators(currentPageIndex);
      updateControlsState();
    } catch (e) {
      console.error('Failed to change supervision carousel page:', e);
    }
  }

  function updateControlsState() {
    prevBtn.disabled = currentPageIndex <= 1;
    nextBtn.disabled = currentPageIndex >= pageCount;
  }

  prevBtn.addEventListener('click', () => goToPage(currentPageIndex - 1));
  nextBtn.addEventListener('click', () => goToPage(currentPageIndex + 1));
  indicatorsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-page]');
    if (!btn) return;
    const p = parseInt(btn.getAttribute('data-page')) || 1;
    goToPage(p);
  });

  // Attach modal interactions to the dynamically created cards
  attachModalInteractions();
}

// Render supervision in a responsive grid (no carousel)
function renderSupervisionGrid(supervision, container) {
  container.innerHTML = '';
  container.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
  supervision.forEach((item, index) => {
    const supervisionCard = createSupervisionCard(item, index);
    container.innerHTML += supervisionCard;
  });
  
  // Attach modal interactions to the dynamically created cards
  attachModalInteractions();
}

// Create individual supervision card
function createSupervisionCard(item, index) {
  // Icon color mapping
  const iconColors = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 ring-blue-500/10',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 ring-emerald-500/10',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 ring-amber-500/10',
    rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 ring-rose-500/10',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 ring-indigo-500/10',
    fuchsia: 'bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-600 dark:text-fuchsia-400 ring-fuchsia-500/10',
    teal: 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 ring-teal-500/10',
    red: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 ring-red-500/10'
  };

  const iconClass = iconColors[item.icon] || iconColors.blue;

  return `
    <article class="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-sm transition cursor-pointer">
      <div class="flex items-start gap-3">
        <div class="h-10 w-10 rounded-lg ${iconClass} flex items-center justify-center ring-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="${item.iconSvg}"/>
          </svg>
        </div>
        <div class="ml-auto">
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">${item.type}</span>
        </div>
      </div>
      <h3 class="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-50">${item.name}</h3>
      <p class="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">${item.description}</p>
      <div class="mt-3 flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
        <span class="inline-flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.25a9.75 9.75 0 109.75 9.75A9.76 9.76 0 0012 2.25zm.75 9V6a.75.75 0 10-1.5 0v6a.75.75 0 00.22.53l3.5 3.5a.75.75 0 101.06-1.06z"/>
          </svg>
          Updated ${item.updatedDate}
        </span>
        <span>${item.pages} pages</span>
      </div>
      <div class="mt-4 flex items-center gap-2">
        <button class="inline-flex items-center gap-1 h-8 px-2.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5c-7.633 0-10 7-10 7s2.367 7 10 7 10-7 10-7-2.367-7-10-7zm0 12a5 5 0 115-5 5 5 0 01-5 5zm0-8a3 3 0 103 3 3 3 0 00-3-3z"/>
          </svg>
          View
        </button>
        <button data-action="download" class="inline-flex items-center gap-1 h-8 px-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 3a1 1 0 012 0v9.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L11 12.586z"/>
            <path d="M5 20a2 2 0 002 2h10a2 2 0 002-2v-2a1 1 0 10-2 0v2H7v-2a1 1 0 10-2 0z"/>
          </svg>
          Download
        </button>
      </div>
    </article>
  `;
}

// Render empty state
function renderEmptyState(container) {
  container.innerHTML = `
    <div class="col-span-full text-center py-8">
      <div class="flex flex-col items-center justify-center space-y-4">
        <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg class="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">No supervision data</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">No supervision items available at the moment.</p>
        </div>
      </div>
    </div>
  `;
}

// Attach modal interactions to dynamically created cards
function attachModalInteractions() {
  if (typeof window === 'undefined' || !window.Swal) {
    console.warn('SweetAlert2 not available for modal interactions');
    return;
  }

  // Shared SweetAlert2 color palette (aligned with supervision-modal.js)
  const PALETTE = {
    primary: '#3B82F6',
    danger: '#EF4444',
    darkBg: '#111827',
  };

  function isDarkMode() {
    return document.documentElement.classList.contains('dark')
      || window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function themedConfirm(options = {}) {
    const base = {
      showCancelButton: true,
      confirmButtonColor: options.variant === 'danger' ? PALETTE.danger : PALETTE.primary,
      cancelButtonColor: PALETTE.darkBg,
    };
    if (isDarkMode()) {
      base.background = PALETTE.darkBg;
      base.color = '#E5E7EB'; // gray-200 for text on dark
    }
    return window.Swal.fire({
      ...base,
      ...options,
    });
  }

  function themedToast(options = {}) {
    const mixin = window.Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1600,
    });
    return mixin.fire(options);
  }

  // Download confirmation for supervision manuals
  document.querySelectorAll('[data-action="download"]').forEach((btn) => {
    // Remove existing listeners to prevent duplicates
    btn.removeEventListener('click', handleDownloadClick);
    btn.addEventListener('click', handleDownloadClick);
  });

  function handleDownloadClick(e) {
    e.preventDefault();
    const card = e.target.closest('article');
    const title = card?.querySelector('h3')?.textContent || 'Manual';
    
    themedConfirm({
      title: 'Start download?',
      text: `You are about to download "${title}" as PDF.`,
      icon: 'question',
      confirmButtonText: 'Download',
    }).then((result) => {
      if (result.isConfirmed) {
        const opts = {
          title: 'Downloading...',
          timer: 1200,
          timerProgressBar: true,
          didOpen: () => { window.Swal.showLoading(); },
        };
        if (isDarkMode()) {
          opts.background = PALETTE.darkBg;
          opts.color = '#E5E7EB';
        }
        window.Swal.fire(opts).then(() => {
          themedToast({
            icon: 'success',
            title: 'Download started!',
            background: isDarkMode() ? PALETTE.darkBg : '#fff',
            color: isDarkMode() ? '#E5E7EB' : '#111827',
            iconColor: PALETTE.primary,
          });
        });
      }
    });
  }

  // View button functionality
  document.querySelectorAll('button:not([data-action="download"])').forEach((btn) => {
    const text = btn.textContent.trim();
    if (text === 'View') {
      // Remove existing listeners to prevent duplicates
      btn.removeEventListener('click', handleViewClick);
      btn.addEventListener('click', handleViewClick);
    }
  });

  function handleViewClick(e) {
    e.preventDefault();
    const card = e.target.closest('article');
    const title = card?.querySelector('h3')?.textContent || 'Manual';
    const description = card?.querySelector('p')?.textContent || 'No description available';
    
    themedConfirm({
      title: title,
      text: description,
      icon: 'info',
      confirmButtonText: 'OK',
      showCancelButton: false,
    });
  }

  // Toast when opening create manual (if button exists)
  const createBtn = document.querySelector('[data-modal-target="createManualModal"]');
  if (createBtn) {
    createBtn.removeEventListener('click', handleCreateManualClick);
    createBtn.addEventListener('click', handleCreateManualClick);
  }

  function handleCreateManualClick() {
    themedToast({
      icon: 'info',
      title: 'Open the form to create a manual',
      background: isDarkMode() ? PALETTE.darkBg : '#fff',
      color: isDarkMode() ? '#E5E7EB' : '#111827',
      iconColor: PALETTE.primary,
    });
  }
}

// Refresh supervision data
export async function refreshSupervisionData() {
  try {
    // Clear cache
    supervisionPageCache.clear();
    
    // Re-render supervision cards
    await renderSupervisionCards();
    
    // Show toast notification if SweetAlert2 is available
    if (typeof window !== 'undefined' && window.Swal) {
      const isDarkMode = document.documentElement.classList.contains('dark');
      
      const Toast = window.Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: isDarkMode ? '#111827' : '#ffffff',
        color: isDarkMode ? '#f3f4f6' : '#1f2937'
      });
      
      Toast.fire({
        icon: 'success',
        title: 'Supervision data refreshed',
        iconColor: '#3B82F6'
      });
    }
    
    console.log('Supervision data refreshed');
  } catch (error) {
    console.error('Error refreshing supervision data:', error);
  }
}
