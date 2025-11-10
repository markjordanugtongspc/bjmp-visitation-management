import 'flowbite';
import { checkEligibility, getValidationStatusBadge, formatYearsSinceDate } from '../modules/conjugal-validation-helper.js';
import { getDocumentInfo, viewDocument, downloadDocument, deleteDocument } from '../modules/conjugal-document-manager.js';

document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('visitors-table-body');
  const mobileCards = document.getElementById('visitors-cards-mobile');
  const searchInput = document.getElementById('visitors-search');
  const lifeStatusFilter = document.getElementById('visitors-status-filter');
  const totalAllowedEl = document.getElementById('allowed-visitors-total');
  const inmatesWithoutEl = document.getElementById('inmates-without-allowed');
  const totalInmatesEl = document.getElementById('inmates-total');
  const recentlyAddedEl = document.getElementById('recently-added');

  let rows = [];

  function render() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    const lifeStatus = (lifeStatusFilter?.value || '').trim();

    // Enhanced search - match across visitor name, inmate name, and relationship
    let filtered = rows;
    
    // Apply search filter
    if (q) {
      filtered = rows.filter(r => {
        const visitorName = (r.name || '').toLowerCase();
        const inmateName = r.inmate?.full_name || 
                          (r.inmate?.first_name && r.inmate?.last_name ? `${r.inmate.first_name} ${r.inmate.last_name}` : '') ||
                          '';
        const inmateNameLower = inmateName.toLowerCase();
        const relationship = (r.relationship || '').toLowerCase();
        
        // Match if query appears in any of these fields
        return visitorName.includes(q) || 
               inmateNameLower.includes(q) || 
               relationship.includes(q);
      });
    }

    // Apply life status filter
    if (lifeStatus) {
      filtered = filtered.filter(r => {
        const status = String(r.life_status || 'unknown').toLowerCase();
        const filterValue = lifeStatus.toLowerCase();
        return status === filterValue;
      });
    }

    renderTable(filtered);
    renderMobileCards(filtered);
  }

  function lifeStatusBadge(status) {
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    const map = {
      alive: 'bg-green-500/10 text-green-500',
      deceased: 'bg-red-500/10 text-red-500',
      unknown: 'bg-gray-500/10 text-gray-500',
    };
    const cls = map[String(status || 'unknown').toLowerCase()] || map.unknown;
    const label = String(status || 'Unknown').replace(/^[a-z]/, m => m.toUpperCase());
    return `<span class="inline-flex items-center rounded-full ${cls} px-2 py-0.5 text-[11px]">${label}</span>`;
  }

  function actionButtons(id) {
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    return `
      <div class="flex items-center gap-2 justify-end">
        <button class="px-2 py-1 text-xs rounded bg-orange-600 hover:bg-orange-700 text-white cursor-pointer" data-action="edit" data-id="${id}">Edit</button>
        <button class="px-2 py-1 text-xs rounded bg-red-800 hover:bg-red-900 text-white cursor-pointer" data-action="delete" data-id="${id}">Delete</button>
      </div>
    `;
  }

  function renderTable(list) {
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    if (!tableBody) return;
    if (!list.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-32 py-32 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">No allowed visitors found</td>
        </tr>
      `;
      return;
    }
    tableBody.innerHTML = '';
    list.forEach(v => {
      // Extract inmate name - handle both full_name and first_name/last_name
      const inmateName = v.inmate?.full_name || 
                        (v.inmate?.first_name && v.inmate?.last_name ? `${v.inmate.first_name} ${v.inmate.last_name}` : '') ||
                        '—';
      
      tableBody.insertAdjacentHTML('beforeend', `
        <tr data-id="${v.id}">
          <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
            <button type="button" class="js-visitor-link text-blue-600 hover:underline cursor-pointer" data-id="${v.id}">${v.name}</button>
          </td>
          <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">${inmateName}</td>
          <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">${v.relationship || '—'}</td>
          <td class="px-3 py-3">${lifeStatusBadge(v.life_status)}</td>
          <td class="px-3 py-3">${actionButtons(v.id)}</td>
        </tr>
      `);
    });
  }

  function renderMobileCards(list) {
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    if (!mobileCards) return;
    if (!list.length) {
      mobileCards.innerHTML = `
        <div class="text-center py-8 sm:py-12">
          <div class="flex flex-col items-center justify-center space-y-6 px-4 sm:px-0">
            <div class="w-16 h-16 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="text-center">
              <h3 class="text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">No Visitors Yet</h3>
              <p class="text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 max-w-sm mx-auto">Use "Register Inmate Visitor" to add the first visitor.</p>
            </div>
          </div>
        </div>
      `;
      return;
    }
    mobileCards.innerHTML = '';
    list.forEach(v => {
      const inmateName = v.inmate?.full_name || 
                        (v.inmate?.first_name && v.inmate?.last_name ? `${v.inmate.first_name} ${v.inmate.last_name}` : '') ||
                        '—';
      const avatarUrl = v.avatar_path && v.avatar_filename 
        ? `/storage/${v.avatar_path}/${v.avatar_filename}` 
        : null;
      
      mobileCards.insertAdjacentHTML('beforeend', `
        <div class="${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4 space-y-3" data-id="${v.id}">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3 flex-1">
              ${avatarUrl ? `
                <img src="${avatarUrl}" alt="${v.name}" class="w-12 h-12 rounded-full object-cover border-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div class="w-12 h-12 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-semibold text-lg" style="display:none;">${v.name.charAt(0).toUpperCase()}</div>
              ` : `
                <div class="w-12 h-12 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-semibold text-lg">${v.name.charAt(0).toUpperCase()}</div>
              `}
              <div class="flex-1 min-w-0">
                <button type="button" class="js-visitor-link text-blue-600 ${isDarkMode ? 'dark:text-blue-400' : ''} hover:underline cursor-pointer font-medium text-sm" data-id="${v.id}">${v.name}</button>
                <p class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5">PDL: ${inmateName}</p>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">Relationship:</span>
              <p class="${isDarkMode ? 'text-gray-100' : 'text-gray-900'} font-medium">${v.relationship || '—'}</p>
            </div>
            <div>
              <span class="${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">Status:</span>
              <div class="mt-1">${lifeStatusBadge(v.life_status)}</div>
            </div>
          </div>
          <div class="flex gap-2 pt-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
            <button class="flex-1 px-3 py-1.5 text-xs rounded bg-orange-600 hover:bg-orange-700 text-white cursor-pointer font-medium" data-action="edit" data-id="${v.id}">Edit</button>
            <button class="flex-1 px-3 py-1.5 text-xs rounded bg-red-800 hover:bg-red-900 text-white cursor-pointer font-medium" data-action="delete" data-id="${v.id}">Delete</button>
          </div>
        </div>
      `);
    });
  }

  async function loadData() {
    let VisitorApiClient;
    ({ default: VisitorApiClient } = await import('./components/visitorClient.js'));
    const api = new VisitorApiClient();
    // Fetch ALL visitors (not just allowed ones) - remove is_allowed filter
    const json = await api.getAll({ per_page: 100 });
    
    // Handle paginated response structure: { success: true, data: [...], pagination: {...} }
    let data = [];
    if (json?.success && Array.isArray(json?.data)) {
      data = json.data;
    } else if (Array.isArray(json?.data)) {
      data = json.data;
    } else if (Array.isArray(json)) {
      data = json;
    }
    
    rows = data;
    if (totalAllowedEl) totalAllowedEl.textContent = String(data.length);
    render();

    // Inmates without allowed visitors count
    try {
      const resp = await fetch('/api/inmates/without-allowed-visitors/count', { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      const cj = await resp.json();
      if (inmatesWithoutEl && cj && typeof cj.count === 'number') inmatesWithoutEl.textContent = String(cj.count);
    } catch {}

    // Total inmates (reuse existing endpoint if available)
    try {
      const resp = await fetch('/api/inmates/statistics', { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      if (resp.ok) {
        const js = await resp.json();
        if (totalInmatesEl && js?.data?.total) totalInmatesEl.textContent = String(js.data.total);
      }
    } catch {}

    // Recently added (7 days)
    try {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recent = rows.filter(r => r.created_at && new Date(r.created_at).getTime() >= sevenDaysAgo).length;
      if (recentlyAddedEl) recentlyAddedEl.textContent = String(recent);
    } catch {}
  }

  // Edit/Delete handlers
  document.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('[data-action="edit"]');
    const delBtn = e.target.closest('[data-action="delete"]');
    const link = e.target.closest('.js-visitor-link');

    if (link) {
      const id = parseInt(link.getAttribute('data-id'));
      const item = rows.find(r => r.id === id);
      if (item) openDetailsModal(item);
      return;
    }

    if (editBtn) {
      const id = parseInt(editBtn.getAttribute('data-id'));
      const item = rows.find(r => r.id === id);
      if (item) return openEditModal(item);
    }
    if (delBtn) {
      const id = parseInt(delBtn.getAttribute('data-id'));
      return confirmDelete(id);
    }
  });

  async function openDetailsModal(item, activeTab = 'overview') {
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    // Extract inmate name - handle both full_name and first_name/last_name
    const inmateName = item.inmate?.full_name || 
                      (item.inmate?.first_name && item.inmate?.last_name ? `${item.inmate.first_name} ${item.inmate.last_name}` : '') ||
                      '—';
    
    // Build avatar URL
    const avatarUrl = item.avatar_path && item.avatar_filename 
      ? `/storage/${item.avatar_path}/${item.avatar_filename}` 
      : null;
    
    // Check for conjugal visit information
    const visitorId = item?.id || null;
    const inmateId = item?.inmate_id || item?.inmate?.id || null;
    const relationshipLower = (item?.relationship || '').toLowerCase();
    const shouldShowConjugalSection = relationshipLower === 'wife' || relationshipLower === 'husband' || relationshipLower === 'spouse';
    let conjugalDetails = null;
    let hasConjugalRegistration = false;

    if (shouldShowConjugalSection && visitorId && inmateId) {
      try {
        const eligibilityResponse = await checkEligibility(visitorId, inmateId);
        hasConjugalRegistration = eligibilityResponse?.conjugal_visit && eligibilityResponse.conjugal_visit.id;
        const conjugalVisitId = hasConjugalRegistration ? eligibilityResponse.conjugal_visit.id : null;
        let documentsResponse = null;

        if (conjugalVisitId) {
          try {
            documentsResponse = await getDocumentInfo(conjugalVisitId);
          } catch (docError) {
            console.error('Failed to load document info:', docError);
          }
        }

        conjugalDetails = {
          eligibility: eligibilityResponse,
          documents: documentsResponse,
          conjugalVisitId,
          hasRegistration: hasConjugalRegistration,
        };
      } catch (error) {
        console.error('Failed to load conjugal visit data:', error);
        conjugalDetails = {
          eligibility: null,
          documents: null,
          conjugalVisitId: null,
          hasRegistration: false,
          error: error.message,
        };
      }
    }
    
    // Build tabs
    const tabs = [
      { id: 'overview', label: 'Overview' },
    ];
    
    if (shouldShowConjugalSection) {
      tabs.push({ id: 'conjugal', label: 'Conjugal Visit' });
    }
    
    // Ensure activeTab is valid
    const validTabs = tabs.map(t => t.id);
    if (!validTabs.includes(activeTab)) {
      activeTab = 'overview';
    }
    
    const navHTML = `
      <nav class="flex flex-wrap gap-2 sm:gap-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-4 justify-start lg:justify-end">
        ${tabs.map(t => {
          const isActive = t.id === activeTab;
          return `
          <button data-tab="${t.id}" data-active="${isActive}" class="px-3 py-2 text-xs sm:text-sm rounded-md ${isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} ${isActive ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white') : ''} cursor-pointer transition-colors">
            ${t.label}
          </button>
        `;
        }).join('')}
      </nav>
    `;
    
    // Overview Tab Content
    const overviewHTML = `
      <!-- Mobile View: Original Layout -->
      <div class="block sm:hidden">
        <div class="flex flex-col gap-6">
          <!-- Avatar Section -->
          <div class="shrink-0 flex justify-center">
            ${avatarUrl ? `
              <div class="relative">
                <img src="${avatarUrl}" alt="${item.name}" class="w-32 h-32 rounded-full object-cover border-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} shadow-xl" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-5xl shadow-xl border-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}" style="display:none;">${item.name.charAt(0).toUpperCase()}</div>
              </div>
            ` : `
              <div class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-5xl shadow-xl border-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}">${item.name.charAt(0).toUpperCase()}</div>
            `}
          </div>
          
          <!-- Details Section -->
          <div class="space-y-3 text-left">
            <div class="flex justify-between items-start gap-4">
              <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[100px]">Visitor Name</div>
              <div class="text-sm font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-right flex-1">${item.name}</div>
            </div>
            
            <div class="flex justify-between items-start gap-4">
              <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[100px]">Inmate (PDL)</div>
              <div class="text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-right flex-1">${inmateName}</div>
            </div>
            
            <div class="flex justify-between items-start gap-4">
              <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[100px]">Relationship</div>
              <div class="text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-right flex-1">${item.relationship || '—'}</div>
            </div>
            
            <div class="flex justify-between items-start gap-4">
              <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[100px]">Phone</div>
              <div class="text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-right flex-1">${item.phone || '—'}</div>
            </div>
            
            <div class="flex justify-between items-start gap-4">
              <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[100px]">Email</div>
              <div class="text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-right flex-1">${item.email || '—'}</div>
            </div>
            
            <div class="flex justify-between items-start gap-4">
              <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[100px]">ID Type</div>
              <div class="text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-right flex-1">${item.id_type || '—'}</div>
            </div>
            
            <div class="flex justify-between items-start gap-4">
              <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[100px]">ID Number</div>
              <div class="text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-right flex-1">${item.id_number || '—'}</div>
            </div>
            
            <div class="flex justify-between items-start gap-4">
              <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[100px]">Address</div>
              <div class="text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-right flex-1">${item.address || '—'}</div>
            </div>
            
            <div class="flex justify-between items-start gap-4">
              <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[100px]">Life Status</div>
              <div class="text-right flex-1">${lifeStatusBadge(item.life_status)}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Desktop View: Avatar + Name on Left, Table on Right -->
      <div class="hidden sm:flex gap-6">
        <!-- Left Side: Avatar + Name -->
        <div class="shrink-0 flex flex-col items-center gap-4">
          ${avatarUrl ? `
            <div class="relative">
              <img src="${avatarUrl}" alt="${item.name}" class="w-40 h-40 rounded-full object-cover border-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} shadow-xl" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
              <div class="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-5xl shadow-xl border-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}" style="display:none;">${item.name.charAt(0).toUpperCase()}</div>
            </div>
          ` : `
            <div class="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-5xl shadow-xl border-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}">${item.name.charAt(0).toUpperCase()}</div>
          `}
          <div class="text-center">
            <div class="text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">${item.name}</div>
            <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1">Visitor</div>
          </div>
        </div>
        
        <!-- Right Side: Table -->
        <div class="flex-1">
          <div class="relative overflow-x-auto shadow-md rounded-lg">
            <table class="w-full text-sm text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">
              <thead class="text-xs uppercase ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}">
                <tr>
                  <th scope="col" class="px-6 py-3">Field</th>
                  <th scope="col" class="px-6 py-3">Information</th>
                </tr>
              </thead>
              <tbody>
                <tr class="${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b">
                  <th scope="row" class="px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} whitespace-nowrap">Inmate (PDL)</th>
                  <td class="px-6 py-4">${inmateName}</td>
                </tr>
                <tr class="${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b">
                  <th scope="row" class="px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} whitespace-nowrap">Relationship</th>
                  <td class="px-6 py-4">${item.relationship || '—'}</td>
                </tr>
                <tr class="${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b">
                  <th scope="row" class="px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} whitespace-nowrap">Phone</th>
                  <td class="px-6 py-4">${item.phone || '—'}</td>
                </tr>
                <tr class="${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b">
                  <th scope="row" class="px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} whitespace-nowrap">Email</th>
                  <td class="px-6 py-4">${item.email || '—'}</td>
                </tr>
                <tr class="${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b">
                  <th scope="row" class="px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} whitespace-nowrap">ID Type</th>
                  <td class="px-6 py-4">${item.id_type || '—'}</td>
                </tr>
                <tr class="${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b">
                  <th scope="row" class="px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} whitespace-nowrap">ID Number</th>
                  <td class="px-6 py-4">${item.id_number || '—'}</td>
                </tr>
                <tr class="${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b">
                  <th scope="row" class="px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} whitespace-nowrap">Address</th>
                  <td class="px-6 py-4">${item.address || '—'}</td>
                </tr>
                <tr class="${isDarkMode ? 'bg-gray-800' : 'bg-white'}">
                  <th scope="row" class="px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} whitespace-nowrap">Life Status</th>
                  <td class="px-6 py-4">${lifeStatusBadge(item.life_status)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    
    // Fetch conjugal visit logs for this visitor
    let conjugalVisitLogs = [];
    if (shouldShowConjugalSection) {
      try {
        const logsResponse = await fetch(`/api/conjugal-visits/logs/visitor?visitor_id=${item.id}`);
        if (logsResponse.ok) {
          const logsData = await logsResponse.json();
          conjugalVisitLogs = logsData.logs || [];
        }
      } catch (error) {
        console.error('Error fetching conjugal visit logs:', error);
      }
    }
    
    // Conjugal Visit Tab Content
    let conjugalTabHTML = '';
    if (shouldShowConjugalSection) {
      const hasRegistration = conjugalDetails?.hasRegistration || false;
      const conjugalVisitId = conjugalDetails?.conjugalVisitId || null;
      const conjugalVisit = conjugalDetails?.eligibility?.conjugal_visit || null;
      
      let conjugalStatusNumeric = null;
      if (conjugalVisit) {
        conjugalStatusNumeric = conjugalVisit.status !== undefined && conjugalVisit.status !== null 
          ? parseInt(conjugalVisit.status) 
          : null;
      }
      if (conjugalStatusNumeric === null || isNaN(conjugalStatusNumeric)) {
        const statusFromResponse = conjugalDetails?.eligibility?.status;
        if (typeof statusFromResponse === 'number') {
          conjugalStatusNumeric = statusFromResponse;
        } else if (typeof statusFromResponse === 'string') {
          const statusLower = statusFromResponse.toLowerCase();
          if (statusLower === 'pending') conjugalStatusNumeric = 2;
          else if (statusLower === 'approved') conjugalStatusNumeric = 1;
          else if (statusLower === 'denied') conjugalStatusNumeric = 0;
        }
      }
      
      const isPending = conjugalStatusNumeric === 2;
      const isApproved = conjugalStatusNumeric === 1;
      const isDenied = conjugalStatusNumeric === 0;
      
      const validation = conjugalDetails?.eligibility?.validation || null;
      const startDateRaw = conjugalDetails?.eligibility?.relationship_start_date || conjugalVisit?.relationship_start_date || '';
      const startDateFormatted = startDateRaw ? new Date(startDateRaw).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A';
      const yearsAgo = startDateRaw ? formatYearsSinceDate(startDateRaw) : 'N/A';
      const validationBadge = validation ? getValidationStatusBadge(validation) : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Not Available</span>';
      const eligible = Boolean(conjugalDetails?.eligibility?.eligible);
      const eligibleLabel = eligible ? 'Eligible' : 'Not Eligible';
      const eligibleClasses = eligible
        ? (isDarkMode ? 'text-emerald-300' : 'text-emerald-600')
        : (isDarkMode ? 'text-rose-300' : 'text-rose-600');
      
      const documentsData = conjugalDetails?.documents?.documents || {};
      const cohabDoc = documentsData.cohabitation_cert || null;
      const marriageDoc = documentsData.marriage_contract || null;
      const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
      
      const conjugalStatusBadge = hasRegistration 
        ? (isPending 
          ? '<span class="inline-flex items-center rounded-full bg-blue-500/10 text-blue-500 px-2 py-1 text-xs font-medium">Pending</span>'
          : isApproved
          ? '<span class="inline-flex items-center rounded-full bg-green-500/10 text-green-500 px-2 py-1 text-xs font-medium">Approved</span>'
          : isDenied
          ? '<span class="inline-flex items-center rounded-full bg-red-500/10 text-red-500 px-2 py-1 text-xs font-medium">Denied</span>'
          : '<span class="inline-flex items-center rounded-full bg-gray-500/10 text-gray-500 px-2 py-1 text-xs font-medium">Unknown</span>')
        : '';
      
      let actionButtonsHTML = '';
      if (hasRegistration && conjugalVisitId) {
        // Determine button states - disable the button that matches current status
        const approveDisabled = isApproved;
        const rejectDisabled = isDenied;
        
        // Base classes for enabled buttons
        const approveBtnEnabled = `flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${isDarkMode ? 'bg-green-900/20 hover:bg-green-900/30 border border-green-600/40 text-green-400' : 'bg-green-50 hover:bg-green-100 border border-green-300 text-green-700'}`;
        const rejectBtnEnabled = `flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${isDarkMode ? 'bg-red-900/20 hover:bg-red-900/30 border border-red-600/40 text-red-400' : 'bg-red-50 hover:bg-red-100 border border-red-300 text-red-700'}`;
        
        // Disabled button classes
        const approveBtnDisabled = `flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors cursor-not-allowed opacity-50 ${isDarkMode ? 'bg-gray-600/30 border border-gray-600/30 text-gray-500' : 'bg-gray-200 border border-gray-300 text-gray-400'}`;
        const rejectBtnDisabled = `flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors cursor-not-allowed opacity-50 ${isDarkMode ? 'bg-gray-600/30 border border-gray-600/30 text-gray-500' : 'bg-gray-200 border border-gray-300 text-gray-400'}`;
        
        actionButtonsHTML = `
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button 
              data-conjugal-approve 
              data-conjugal-id="${conjugalVisitId}"
              class="${approveDisabled ? approveBtnDisabled : approveBtnEnabled} flex-1 sm:flex-none"
              title="${approveDisabled ? 'Already Approved' : 'Approve Registration'}"
              ${approveDisabled ? 'disabled' : ''}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${approveDisabled ? (isDarkMode ? '#6b7280' : '#9ca3af') : (isDarkMode ? '#10b981' : '#059669')}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Approve</span>
            </button>
            <button 
              data-conjugal-reject 
              data-conjugal-id="${conjugalVisitId}"
              class="${rejectDisabled ? rejectBtnDisabled : rejectBtnEnabled} flex-1 sm:flex-none"
              title="${rejectDisabled ? 'Already Rejected' : 'Reject Registration'}"
              ${rejectDisabled ? 'disabled' : ''}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${rejectDisabled ? (isDarkMode ? '#6b7280' : '#9ca3af') : (isDarkMode ? '#ef4444' : '#dc2626')}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span>Reject</span>
            </button>
          </div>
        `;
      }
      
      const renderDocRow = (label, type, doc) => {
        if (!conjugalVisitId) {
          return `
            <div class="rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-100'} px-3 py-2.5">
              <div class="flex justify-between items-start gap-4">
                <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[100px]">${label}</div>
                <div class="text-xs ${textMuted} text-right flex-1">Registration pending approval. Documents not yet available.</div>
              </div>
            </div>
          `;
        }
        if (!doc || !doc.exists) {
          return `
            <div class="rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-100'} px-3 py-2.5">
              <div class="flex justify-between items-start gap-4">
                <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[100px]">${label}</div>
                <div class="text-xs ${textMuted} text-right flex-1">Not uploaded.</div>
              </div>
            </div>
          `;
        }
        const filename = doc.filename || 'Available document';
        const actionBtnBase = 'flex items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-semibold cursor-pointer transition-colors';
        const viewBtnClass = `${actionBtnBase} ${isDarkMode ? 'bg-blue-600/80 hover:bg-blue-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`;
        const downloadBtnClass = `${actionBtnBase} ${isDarkMode ? 'bg-emerald-600/80 hover:bg-emerald-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`;
        const deleteBtnClass = `${actionBtnBase} ${isDarkMode ? 'bg-rose-600/80 hover:bg-rose-600 text-white' : 'bg-rose-500 hover:bg-rose-600 text-white'}`;
        return `
          <div class="rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-100'} px-3 py-2.5">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div class="shrink-0 w-full sm:w-auto sm:min-w-[140px] text-left">
                <p class="text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">${label}:</p>
              </div>
              <div class="flex-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div class="text-right sm:text-left">
                  <p class="text-xs ${textMuted} truncate">${filename}</p>
                </div>
                <div class="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                  <button data-conjugal-doc="view" data-conjugal-type="${type}" data-conjugal-id="${conjugalVisitId}" class="${viewBtnClass} flex-1 sm:flex-none" title="View document">View</button>
                  <button data-conjugal-doc="download" data-conjugal-type="${type}" data-conjugal-id="${conjugalVisitId}" class="${downloadBtnClass} flex-1 sm:flex-none" title="Download document">Download</button>
                  <button data-conjugal-doc="delete" data-conjugal-type="${type}" data-conjugal-id="${conjugalVisitId}" class="${deleteBtnClass} flex-1 sm:flex-none" title="Delete document">Delete</button>
                </div>
              </div>
            </div>
          </div>
        `;
      };
      
      if (hasRegistration) {
        conjugalTabHTML = `
          <div class="flex flex-col" style="max-height: 65vh;">
            <!-- Registration Status Section (Fixed/Compact) -->
            <div class="shrink-0 space-y-2.5 pb-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mb-3">
              <div class="flex items-center justify-between">
                <h3 class="text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}">Registration Status</h3>
                ${conjugalStatusBadge}
              </div>
              
              <div class="space-y-2">
              ${startDateRaw ? `
                <div class="flex justify-between items-start gap-3 sm:gap-4">
                  <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[100px]">Relationship Duration</div>
                  <div class="text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-right flex-1">${yearsAgo}</div>
                </div>
                <div class="flex justify-between items-start gap-3 sm:gap-4">
                  <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[100px]">Start Date</div>
                  <div class="text-xs sm:text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-right flex-1">${startDateFormatted}</div>
                </div>
              ` : ''}
              ${validation ? `
                <div class="flex justify-between items-start gap-3 sm:gap-4">
                  <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[100px]">Validation</div>
                  <div class="text-right flex-1">${validationBadge}</div>
                </div>
                <div class="flex justify-between items-start gap-3 sm:gap-4">
                  <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[100px]">Eligibility</div>
                  <div class="text-xs sm:text-sm ${eligibleClasses} font-semibold text-right flex-1">${eligibleLabel}</div>
                </div>
              ` : ''}
              ${(cohabDoc || marriageDoc) ? `
                <div class="pt-2 sm:pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
                  <div class="flex justify-between items-start gap-3 sm:gap-4 mb-2 sm:mb-3">
                    <div class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[100px]">Submitted Documents</div>
                    <div class="text-right flex-1"></div>
                  </div>
                  <div class="space-y-2">
                    ${renderDocRow('Cohabitation Certificate', 'cohabitation_cert', cohabDoc)}
                    ${renderDocRow('Marriage Contract', 'marriage_contract', marriageDoc)}
                  </div>
                </div>
              ` : ''}
              ${actionButtonsHTML ? `
                <div class="pt-2 sm:pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div class="shrink-0 w-full sm:w-auto text-left">
                      <span class="text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">Actions:</span>
                    </div>
                    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto sm:ml-auto">
                      ${actionButtonsHTML}
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>
            
            <!-- Visit Requests Section (Scrollable) -->
            ${conjugalVisitLogs.length > 0 ? `
              <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
                <h4 class="text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-2 shrink-0">Visit Requests</h4>
                <div class="flex-1 overflow-y-auto overflow-x-hidden space-y-2 pr-2" style="max-height: 40vh; scrollbar-width: thin;">
                    ${conjugalVisitLogs.map((log, index) => {
                      const requestStatus = log.status;
                      const requestStatusLabel = log.status_label || 'Unknown';
                      const isRequestPending = requestStatus === 2;
                      const isRequestApproved = requestStatus === 1;
                      const isRequestDenied = requestStatus === 0;
                      
                      const requestStatusBadge = isRequestPending
                        ? '<span class="inline-flex items-center rounded-full bg-blue-500/10 text-blue-500 px-2 py-1 text-xs font-medium">Pending</span>'
                        : isRequestApproved
                        ? '<span class="inline-flex items-center rounded-full bg-green-500/10 text-green-500 px-2 py-1 text-xs font-medium">Approved</span>'
                        : isRequestDenied
                        ? '<span class="inline-flex items-center rounded-full bg-red-500/10 text-red-500 px-2 py-1 text-xs font-medium">Denied</span>'
                        : '<span class="inline-flex items-center rounded-full bg-gray-500/10 text-gray-500 px-2 py-1 text-xs font-medium">Unknown</span>';
                      
                      const isPaid = log.paid === 'YES';
                      const paymentStatusText = isPaid ? 'Paid (₱50)' : 'Not Paid';
                      const paymentStatusClass = isPaid 
                        ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')
                        : (isDarkMode ? 'text-amber-400' : 'text-amber-600');
                      
                      // Get registration status from log's conjugal_visit
                      const registrationStatus = log.conjugal_visit?.status;
                      const registrationStatusLabel = log.conjugal_visit?.status_label || 'Unknown';
                      const registrationStatusText = registrationStatus === 2
                        ? 'Pending'
                        : registrationStatus === 1
                        ? 'Approved'
                        : registrationStatus === 0
                        ? 'Denied'
                        : 'Unknown';
                      const registrationStatusClass = registrationStatus === 2
                        ? (isDarkMode ? 'text-blue-400' : 'text-blue-600')
                        : registrationStatus === 1
                        ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                        : registrationStatus === 0
                        ? (isDarkMode ? 'text-red-400' : 'text-red-600')
                        : (isDarkMode ? 'text-gray-400' : 'text-gray-600');
                      
                      const requestStatusClass = isRequestPending
                        ? (isDarkMode ? 'text-blue-400' : 'text-blue-600')
                        : isRequestApproved
                        ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                        : isRequestDenied
                        ? (isDarkMode ? 'text-red-400' : 'text-red-600')
                        : (isDarkMode ? 'text-gray-400' : 'text-gray-600');
                      
                      const scheduleDate = log.schedule ? new Date(log.schedule).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Not scheduled';
                      const referenceNumber = log.reference_number || 'N/A';
                      const createdAt = log.created_at ? new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
                      
                      // Payment action buttons (only shown when request is approved)
                      // Show both buttons always, but disable based on current status
                      const paidDisabled = isPaid;
                      const unpaidDisabled = !isPaid;
                      
                      const paidBtnEnabled = `flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${isDarkMode ? 'bg-emerald-900/20 hover:bg-emerald-900/30 border border-emerald-600/40 text-emerald-400' : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700'}`;
                      const unpaidBtnEnabled = `flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${isDarkMode ? 'bg-amber-900/20 hover:bg-amber-900/30 border border-amber-600/40 text-amber-400' : 'bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700'}`;
                      
                      const paidBtnDisabled = `flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors cursor-not-allowed opacity-50 ${isDarkMode ? 'bg-gray-600/30 border border-gray-600/30 text-gray-500' : 'bg-gray-200 border border-gray-300 text-gray-400'}`;
                      const unpaidBtnDisabled = `flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors cursor-not-allowed opacity-50 ${isDarkMode ? 'bg-gray-600/30 border border-gray-600/30 text-gray-500' : 'bg-gray-200 border border-gray-300 text-gray-400'}`;
                      
                      const paymentActionButtons = isRequestApproved ? `
                        <div class="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-2 mt-2 pt-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
                          <span class="text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-medium">Payment:</span>
                          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                            <button 
                              data-payment-action 
                              data-log-id="${log.id}" 
                              data-action="paid"
                              class="${paidDisabled ? paidBtnDisabled : paidBtnEnabled} flex-1 sm:flex-none"
                              title="${paidDisabled ? 'Already Paid' : 'Mark as Paid (₱50)'}"
                              ${paidDisabled ? 'disabled' : ''}
                            >
                              <!-- Mark Paid Icon -->
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="${paidDisabled ? (isDarkMode ? '#6b7280' : '#9ca3af') : '#6f0'}" d="M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m-.025-3q.35 0 .613-.262t.262-.613v-.375q1.25-.225 2.15-.975t.9-2.225q0-1.05-.6-1.925T12.9 11.1q-1.5-.5-2.075-.875T10.25 9.2t.463-1.025T12.05 7.8q.5 0 .875.175t.625.475t.563.412t.587-.012q.375-.15.513-.513t-.063-.662q-.4-.575-.987-.975T12.9 6.25v-.375q0-.35-.262-.612T12.025 5t-.612.263t-.263.612v.375q-1.25.275-1.95 1.1T8.5 9.2q0 1.175.688 1.9t2.162 1.25q1.575.575 2.188 1.025t.612 1.175q0 .825-.587 1.213t-1.413.387q-.65 0-1.175-.312T10.1 14.9q-.2-.35-.525-.475t-.65 0q-.35.125-.513.475t-.012.675q.4.85 1.075 1.388t1.625.737v.425q0 .35.263.613t.612.262"/></svg>
                              <span>Mark Paid</span>
                            </button>
                            <button 
                              data-payment-action 
                              data-log-id="${log.id}" 
                              data-action="unpaid"
                              class="${unpaidDisabled ? unpaidBtnDisabled : unpaidBtnEnabled} flex-1 sm:flex-none"
                              title="${unpaidDisabled ? 'Already Unpaid' : 'Mark as Unpaid'}"
                              ${unpaidDisabled ? 'disabled' : ''}
                            >
                              <!-- Mark Unpaid Icon -->
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="${unpaidDisabled ? (isDarkMode ? '#6b7280' : '#9ca3af') : '#ff0030'}" d="M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m-.025-3q.35 0 .613-.262t.262-.613v-.375q1.25-.225 2.15-.975t.9-2.225q0-1.05-.6-1.925T12.9 11.1q-1.5-.5-2.075-.875T10.25 9.2t.463-1.025T12.05 7.8q.5 0 .875.175t.625.475t.563.412t.587-.012q.375-.15.513-.513t-.063-.662q-.4-.575-.987-.975T12.9 6.25v-.375q0-.35-.262-.612T12.025 5t-.612.263t-.263.612v.375q-1.25.275-1.95 1.1T8.5 9.2q0 1.175.688 1.9t2.162 1.25q1.575.575 2.188 1.025t.612 1.175q0 .825-.587 1.213t-1.413.387q-.65 0-1.175-.312T10.1 14.9q-.2-.35-.525-.475t-.65 0q-.35.125-.513.475t-.012.675q.4.85 1.075 1.388t1.625.737v.425q0 .35.263.613t.612.262"/></svg>
                              <span>Mark Unpaid</span>
                            </button>
                          </div>
                        </div>
                      ` : '';
                      
                      return `
                        <div class="rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'} overflow-hidden shrink-0">
                          <!-- Reference Header -->
                          <div class="px-2 sm:px-3 py-2 ${isDarkMode ? 'bg-gray-800/50 border-b border-gray-700' : 'bg-gray-100 border-b border-gray-200'}">
                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                              <div class="flex items-center gap-1.5 sm:gap-2">
                                <span class="text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-medium uppercase tracking-wider">Ref:</span>
                                <span class="text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} font-mono font-semibold truncate">${referenceNumber}</span>
                              </div>
                              ${requestStatusBadge}
                            </div>
                          </div>
                          
                          <!-- Table Content -->
                          <div class="p-2 sm:p-3">
                            <div class="space-y-2">
                              <div class="flex justify-between items-start gap-3 sm:gap-4">
                                <div class="text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[80px] sm:min-w-[100px]">Schedule</div>
                                <div class="text-xs sm:text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-right flex-1 truncate">${scheduleDate}</div>
                              </div>
                              <div class="flex justify-between items-start gap-3 sm:gap-4">
                                <div class="text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[80px] sm:min-w-[100px]">Created</div>
                                <div class="text-xs sm:text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-right flex-1 truncate">${createdAt}</div>
                              </div>
                              <div class="flex justify-between items-start gap-3 sm:gap-4">
                                <div class="text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[80px] sm:min-w-[100px]">Registration</div>
                                <div class="text-xs sm:text-sm text-right flex-1">
                                  <span class="font-semibold ${registrationStatusClass}">${registrationStatusText}</span>
                                </div>
                              </div>
                              <div class="flex justify-between items-start gap-3 sm:gap-4">
                                <div class="text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[80px] sm:min-w-[100px]">Request</div>
                                <div class="text-xs sm:text-sm text-right flex-1">
                                  <span class="font-semibold ${requestStatusClass}">${requestStatusLabel}</span>
                                </div>
                              </div>
                              <div class="flex justify-between items-start gap-3 sm:gap-4">
                                <div class="text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider min-w-[80px] sm:min-w-[100px]">Payment</div>
                                <div class="text-xs sm:text-sm text-right flex-1">
                                  <span class="font-semibold ${paymentStatusClass}">${paymentStatusText}</span>
                                </div>
                              </div>
                            </div>
                            ${paymentActionButtons}
                          </div>
                        </div>
                      `;
                    }).join('')}
                </div>
              </div>
            ` : hasRegistration ? `
              <div class="flex-1 flex items-center justify-center min-h-[100px]">
                <p class="text-xs ${textMuted} text-center">No visit requests yet. Visitor can request a conjugal visit after registration is approved.</p>
              </div>
            ` : ''}
            
            <!-- Footer Note (Fixed) -->
            <div class="shrink-0 mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
              <p class="text-[10px] sm:text-xs ${textMuted}">Documents are maintained by the records team. Contact an administrator to upload updated copies.</p>
            </div>
          </div>
        `;
      } else {
        conjugalTabHTML = `
          <div class="flex items-center justify-center min-h-[200px]">
            <p class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-center">No conjugal visit registration found for this visitor. Ask the records team to complete the registration during visitor onboarding.</p>
          </div>
        `;
      }
    }
    
    // Determine which tab should be visible by default
    const overviewTabClass = activeTab === 'overview' ? 'tab-content' : 'tab-content hidden';
    const conjugalTabClass = activeTab === 'conjugal' ? 'tab-content' : 'tab-content hidden';
    
    const html = `
      ${navHTML}
      <div data-tab-content="overview" class="${overviewTabClass}">${overviewHTML}</div>
      ${shouldShowConjugalSection ? `<div data-tab-content="conjugal" class="${conjugalTabClass} flex flex-col">${conjugalTabHTML}</div>` : ''}
    `;
    if (window.Swal) {
      window.Swal.fire({
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Visitor Details</span>`,
        html,
        background: isDarkMode ? '#1F2937' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827',
        showConfirmButton: false,
        showCloseButton: true,
        width: '48rem',
        heightAuto: true,
        scrollbarPadding: false,
        buttonsStyling: false,
        customClass: {
          popup: 'm-0 w-[96vw] max-w-3xl p-6 !rounded-2xl',
          container: 'swal-responsive-container',
        },
        didOpen: () => {
          // Tab switching functionality
          const tabButtons = document.querySelectorAll('[data-tab]');
          const tabContents = document.querySelectorAll('[data-tab-content]');
          
          const switchTab = (tabId) => {
            const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
            
            tabButtons.forEach(btn => {
              const btnTabId = btn.getAttribute('data-tab');
              const isActive = btnTabId === tabId;
              
              // Remove all active classes first
              btn.classList.remove('bg-blue-600', 'text-white', 'text-gray-300', 'text-gray-600');
              
              // Add appropriate classes based on active state
              if (isActive) {
                btn.classList.add('bg-blue-600', 'text-white');
              } else {
                btn.classList.add(isDarkMode ? 'text-gray-300' : 'text-gray-600');
              }
              
              btn.setAttribute('data-active', isActive ? 'true' : 'false');
            });
            
            tabContents.forEach(content => {
              const contentTabId = content.getAttribute('data-tab-content');
              const isActive = contentTabId === tabId;
              if (isActive) {
                content.classList.remove('hidden');
              } else {
                content.classList.add('hidden');
              }
            });
          };
          
          // Attach click handlers to tab buttons
          tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.preventDefault();
              const tabId = btn.getAttribute('data-tab');
              switchTab(tabId);
            });
          });
          
          // Set initial active tab (preserve the tab from parameter)
          // Use the activeTab variable from the closure
          switchTab(activeTab);
          
          // Payment action handlers
          document.querySelectorAll('[data-payment-action]').forEach(btn => {
            btn.addEventListener('click', async function() {
              const logId = this.getAttribute('data-log-id');
              const action = this.getAttribute('data-action');
              
              if (!logId || !action) return;
              
              const originalHTML = this.innerHTML;
              const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
              
              try {
                // Show loading state
                this.disabled = true;
                this.innerHTML = '<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
                
                const paid = action === 'paid' ? 'YES' : 'NO';
                const response = await fetch(`/api/conjugal-visits/logs/${logId}/payment`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                  },
                  body: JSON.stringify({ paid })
                });
                
                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}));
                  throw new Error(errorData.message || 'Failed to update payment status');
                }
                
                // Close current modal first
                window.Swal.close();
                
                // Show success message (non-blocking, auto-close)
                if (window.Swal && window.ThemeManager) {
                  await window.Swal.fire({
                    icon: 'success',
                    title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Payment Status Updated</span>`,
                    text: `Payment status has been ${action === 'paid' ? 'marked as paid' : 'marked as unpaid'}.`,
                    timer: 2000,
                    showConfirmButton: false,
                    background: isDarkMode ? '#111827' : '#FFFFFF',
                    color: isDarkMode ? '#F9FAFB' : '#111827'
                  });
                }
                
                // Reopen modal with updated status, preserving the conjugal tab
                await openDetailsModal(item, 'conjugal');
                
              } catch (error) {
                console.error('Error updating payment status:', error);
                
                // Show error message
                if (window.Swal && window.ThemeManager) {
                  await window.Swal.fire({
                    icon: 'error',
                    title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Error</span>`,
                    text: error.message || 'Failed to update payment status. Please try again.',
                    background: isDarkMode ? '#111827' : '#FFFFFF',
                    color: isDarkMode ? '#F9FAFB' : '#111827'
                  });
                }
                
                // Restore button
                this.disabled = false;
                this.innerHTML = originalHTML;
              }
            });
          });

          // Attach document management button handlers
          const docButtons = document.querySelectorAll('[data-conjugal-doc]');
          docButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
              e.preventDefault();
              const action = btn.getAttribute('data-conjugal-doc');
              const docType = btn.getAttribute('data-conjugal-type');
              const conjugalVisitId = btn.getAttribute('data-conjugal-id');
              
              if (!conjugalVisitId || !docType) return;
              
              try {
                if (action === 'view') {
                  await viewDocument(conjugalVisitId, docType);
                } else if (action === 'download') {
                  await downloadDocument(conjugalVisitId, docType);
                } else if (action === 'delete') {
                  const result = await deleteDocument(conjugalVisitId, docType);
                  if (result) {
                    // Close current modal first
                    window.Swal.close();
                    
                    // Show success message
                    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
                    await window.Swal.fire({
                      icon: 'success',
                      title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Document Deleted</span>`,
                      text: 'Document has been deleted successfully.',
                      timer: 2000,
                      showConfirmButton: false,
                      background: isDarkMode ? '#1F2937' : '#FFFFFF',
                      color: isDarkMode ? '#F9FAFB' : '#111827',
                    });
                    
                    // Reopen modal with updated data, preserving the conjugal tab
                    await openDetailsModal(item, 'conjugal');
                  }
                }
              } catch (error) {
                console.error('Error handling document action:', error);
                const Swal = (await import('sweetalert2')).default;
                await Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: error.message || 'Failed to perform action',
                  background: isDarkMode ? '#1F2937' : '#FFFFFF',
                  color: isDarkMode ? '#F9FAFB' : '#111827',
                });
              }
            });
          });

          // Attach approval/rejection button handlers
          const approveBtn = document.querySelector('[data-conjugal-approve]');
          const rejectBtn = document.querySelector('[data-conjugal-reject]');
          
          if (approveBtn) {
            approveBtn.addEventListener('click', async (e) => {
              e.preventDefault();
              const conjugalVisitId = approveBtn.getAttribute('data-conjugal-id');
              if (!conjugalVisitId) return;

              const result = await window.Swal.fire({
                title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Approve Registration</span>`,
                html: `<p class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Are you sure you want to approve this conjugal visit registration?</p>`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Approve',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#6b7280',
                background: isDarkMode ? '#1F2937' : '#FFFFFF',
                color: isDarkMode ? '#F9FAFB' : '#111827',
              });

              if (result.isConfirmed) {
                try {
                  const response = await fetch(`/api/conjugal-visits/registrations/${conjugalVisitId}/status`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                      'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ status: 1 }), // 1 = Approved
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to approve registration');
                  }

                  // Close current modal first
                  window.Swal.close();
                  
                  // Show success message (non-blocking, auto-close)
                  await window.Swal.fire({
                    icon: 'success',
                    title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Approved</span>`,
                    text: 'Conjugal visit registration has been approved successfully.',
                    timer: 2000,
                    showConfirmButton: false,
                    background: isDarkMode ? '#1F2937' : '#FFFFFF',
                    color: isDarkMode ? '#F9FAFB' : '#111827',
                  });

                  // Reload the visitors list in background
                  loadData();
                  
                  // Reopen modal with updated data, preserving the conjugal tab
                  await openDetailsModal(item, 'conjugal');
                } catch (error) {
                  console.error('Error approving conjugal visit registration:', error);
                  await window.Swal.fire({
                    icon: 'error',
                    title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Error</span>`,
                    text: error.message || 'Failed to approve registration. Please try again.',
                    background: isDarkMode ? '#1F2937' : '#FFFFFF',
                    color: isDarkMode ? '#F9FAFB' : '#111827',
                    confirmButtonColor: '#ef4444',
                  });
                }
              }
            });
          }

          if (rejectBtn) {
            rejectBtn.addEventListener('click', async (e) => {
              e.preventDefault();
              const conjugalVisitId = rejectBtn.getAttribute('data-conjugal-id');
              if (!conjugalVisitId) return;

              const result = await window.Swal.fire({
                title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Reject Registration</span>`,
                html: `<p class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Are you sure you want to reject this conjugal visit registration?</p>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Reject',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                background: isDarkMode ? '#1F2937' : '#FFFFFF',
                color: isDarkMode ? '#F9FAFB' : '#111827',
              });

              if (result.isConfirmed) {
                try {
                  const response = await fetch(`/api/conjugal-visits/registrations/${conjugalVisitId}/status`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                      'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ status: 0 }), // 0 = Denied
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to reject registration');
                  }

                  // Close current modal first
                  window.Swal.close();
                  
                  // Show success message (non-blocking, auto-close)
                  await window.Swal.fire({
                    icon: 'success',
                    title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Rejected</span>`,
                    text: 'Conjugal visit registration has been rejected.',
                    timer: 2000,
                    showConfirmButton: false,
                    background: isDarkMode ? '#1F2937' : '#FFFFFF',
                    color: isDarkMode ? '#F9FAFB' : '#111827',
                  });

                  // Reload the visitors list in background
                  loadData();
                  
                  // Reopen modal with updated data, preserving the conjugal tab
                  await openDetailsModal(item, 'conjugal');
                } catch (error) {
                  console.error('Error rejecting conjugal visit registration:', error);
                  await window.Swal.fire({
                    icon: 'error',
                    title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Error</span>`,
                    text: error.message || 'Failed to reject registration. Please try again.',
                    background: isDarkMode ? '#1F2937' : '#FFFFFF',
                    color: isDarkMode ? '#F9FAFB' : '#111827',
                    confirmButtonColor: '#ef4444',
                  });
                }
              }
            });
          }
        }
      });
    }
  }

  async function openEditModal(item) {
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    const formHtml = `
      <div class="text-left">
        <div class="grid md:grid-cols-2 md:gap-6">
          <div class="relative z-0 w-full mb-5 group">
            <input type="text" id="ev-name" class="block py-2.5 px-0 w-full text-sm ${isDarkMode ? 'text-gray-900' : 'text-gray-900'} bg-transparent border-0 border-b-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} appearance-none ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value="${item.name || ''}"/>
            <label for="ev-name" class="peer-focus:font-medium absolute text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left">Name</label>
          </div>
          <div class="relative z-0 w-full mb-5 group">
            <label class="block mb-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">Life Status</label>
            <select id="ev-life" class="block w-full px-2 py-2 text-xs ${isDarkMode ? 'text-gray-900' : 'text-gray-900'} ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-b-2 border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:outline-none">
              <option value="alive" ${item.life_status==='alive'?'selected':''}>Alive</option>
              <option value="deceased" ${item.life_status==='deceased'?'selected':''}>Deceased</option>
              <option value="unknown" ${item.life_status==='unknown'?'selected':''}>Unknown</option>
            </select>
          </div>
        </div>
        <div class="grid md:grid-cols-2 md:gap-6">
          <div class="relative z-0 w-full mb-5 group">
            <input type="text" id="ev-relationship" class="block py-2.5 px-0 w-full text-sm ${isDarkMode ? 'text-gray-900' : 'text-gray-900'} bg-transparent border-0 border-b-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} appearance-none ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value="${item.relationship || ''}"/>
            <label for="ev-relationship" class="peer-focus:font-medium absolute text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left">Relationship</label>
          </div>
          <div class="relative z-0 w-full mb-5 group">
            <input type="email" id="ev-email" class="block py-2.5 px-0 w-full text-sm ${isDarkMode ? 'text-gray-900' : 'text-gray-900'} bg-transparent border-0 border-b-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} appearance-none ${isDarkMode ? 'text-white' : 'text-gray-900'} focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value="${item.email || ''}"/>
            <label for="ev-email" class="peer-focus:font-medium absolute text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left">Email</label>
          </div>
        </div>
      </div>
    `;
    const res = await window.Swal.fire({
      title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Edit Allowed Visitor</span>`,
      html: formHtml,
      background: isDarkMode ? '#1F2937' : '#FFFFFF',
      color: isDarkMode ? '#F9FAFB' : '#111827',
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      heightAuto: false,
      scrollbarPadding: false,
      buttonsStyling: false,
      customClass: {
        popup: 'm-0 w-[96vw] max-w-[96vw] sm:max-w-[42rem] p-5 !rounded-2xl',
        confirmButton: 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium cursor-pointer',
        cancelButton: `inline-flex items-center justify-center px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900'} text-sm font-medium ml-2 cursor-pointer`
      },
      preConfirm: async () => {
        const name = document.getElementById('ev-name').value.trim();
        const relationship = document.getElementById('ev-relationship').value.trim();
        const email = document.getElementById('ev-email').value.trim();
        const life = document.getElementById('ev-life').value;
        if (!name) {
          window.Swal.showValidationMessage('Name is required');
          return false;
        }

        let VisitorApiClient;
        ({ default: VisitorApiClient } = await import('./components/visitorClient.js'));
        const api = new VisitorApiClient();
        const form = new FormData();
        form.append('name', name);
        form.append('relationship', relationship);
        form.append('email', email);
        form.append('life_status', life);
        await api.update(item.id, form);
        return true;
      }
    });
    if (res.isConfirmed) {
      await loadData();
        window.Swal.fire({
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Updated</span>`,
        icon: 'success',
        timer: 1200,
        showConfirmButton: false,
        background: isDarkMode ? '#1F2937' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827',
      });
    }
  }

  async function confirmDelete(id) {
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    const res = await window.Swal.fire({
      title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Delete visitor?</span>`,
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      background: isDarkMode ? '#1F2937' : '#FFFFFF',
      color: isDarkMode ? '#F9FAFB' : '#111827',
      buttonsStyling: false,
      customClass: {
        popup: 'm-0 w-[96vw] max-w-[28rem] p-5 !rounded-xl',
        confirmButton: 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-sm font-medium cursor-pointer',
        cancelButton: `inline-flex items-center justify-center px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900'} text-sm font-medium ml-2 cursor-pointer`
      }
    });
    if (!res.isConfirmed) return;
    let VisitorApiClient;
    ({ default: VisitorApiClient } = await import('./components/visitorClient.js'));
    const api = new VisitorApiClient();
    await api.delete(id);
    await loadData();
  }

  // Wire search input with debouncing (300ms delay)
  if (searchInput) {
    let debounceId = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        render();
      }, 300);
    });
  }

  // Wire life status filter
  if (lifeStatusFilter) {
    lifeStatusFilter.addEventListener('change', render);
  }

  // Registration modal
  const registerBtn = document.getElementById('open-manual-registration');
  if (registerBtn) {
    registerBtn.addEventListener('click', () => openRegistrationModal());
  }

  async function openRegistrationModal() {
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    // Fetch inmates for dropdown with better error handling
    let inmates = [];
    try {
      // Use InmateApiClient for better consistency
      let InmateApiClient;
      try {
        ({ default: InmateApiClient } = await import('../inmates/components/inmateApi.js'));
        const inmateApi = new InmateApiClient();
        const response = await inmateApi.getAll({}, 1, 1000);
        if (response.success) {
          inmates = response.data.data || [];
        }
      } catch (importError) {
        console.warn('Could not import InmateApiClient, falling back to fetch:', importError);
        const resp = await fetch('/api/inmates?per_page=1000', { 
          headers: { 'X-Requested-With': 'XMLHttpRequest' } 
        });
        if (resp.ok) {
          const json = await resp.json();
          inmates = Array.isArray(json?.data?.data) ? json.data.data : 
                   (Array.isArray(json?.data) ? json.data : []);
        }
      }
    } catch (e) {
      console.error('Failed to load inmates:', e);
    }

    // Sort inmates by name for better UX (use backend camelCase fields)
    inmates.sort((a, b) => {
      const nameA = a.fullName || `${a.firstName || ''} ${a.lastName || ''}`;
      const nameB = b.fullName || `${b.firstName || ''} ${b.lastName || ''}`;
      return nameA.localeCompare(nameB);
    });

    // Store all inmates for search functionality
    window._tempInmatesList = inmates;

    const formHtml = `
      <div class="text-left max-h-[70vh] overflow-y-auto px-1">
        <div class="grid md:grid-cols-2 md:gap-6 items-start">
          <div id="rv-inmate-search-container" class="relative z-0 w-full mb-5 group">
            <label class="block mb-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Search Inmate (PDL) *</label>
            <div class="relative">
              <input 
                type="text" 
                id="rv-inmate-search" 
                autocomplete="off"
                class="block w-full px-3 py-2.5 text-xs sm:text-sm text-gray-900 bg-white border-b-2 border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-blue-600 dark:focus:border-blue-500 transition-all" 
                placeholder="Type to search inmate name or ID..."
              />
              <input type="hidden" id="rv-inmate" required />
              <svg class="absolute top-1/2 right-3 w-4 h-4 text-gray-400 pointer-events-none transform -translate-y-1/2 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <!-- Search Results Dropdown -->
              <div id="rv-inmate-results" class="hidden absolute z-[9999] w-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl text-left" style="background-color: rgb(255, 255, 255);" data-dark-bg="rgb(31, 41, 55)">
                <!-- Results will be populated here -->
              </div>
              <!-- Selected Inmate Display -->
              <div id="rv-selected-inmate" class="hidden mt-3 mb-3 p-2 sm:p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 transition-all duration-300 ease-in-out opacity-0 -translate-y-2">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <div class="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-100 truncate text-left" id="rv-selected-inmate-name"></div>
                    <div class="text-[10px] sm:text-xs text-blue-700 dark:text-blue-300 mt-0.5 text-left" id="rv-selected-inmate-id"></div>
                  </div>
                  <button type="button" id="rv-clear-inmate" class="shrink-0 ml-2 p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors cursor-pointer" title="Clear selection">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="relative z-0 w-full mb-5 group">
            <input type="text" id="rv-name" required class="block py-2.5 px-0 w-full text-xs sm:text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" "/>
            <label for="rv-name" class="peer-focus:font-medium absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Visitor Name *</label>
          </div>
        </div>
        <div class="grid md:grid-cols-2 md:gap-6">
          <div class="relative z-0 w-full mb-5 group">
            <label for="rv-relationship" class="block mb-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium" style="z-index:1; position:relative;">Relationship</label>
            <select id="rv-relationship" class="block w-full px-2 py-2 text-xs sm:text-sm text-gray-900 bg-white border-b-2 border-r border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 dark:focus:border-blue-500 transition-all cursor-pointer" style="z-index:0;">
              <option value="" selected disabled>Select Relationship</option>
              <option>Mother</option>
              <option>Father</option>
              <option>Brother</option>
              <option>Sister</option>
              <option>Spouse</option>
              <option>Wife</option>
              <option>Husband</option>
              <option>Son</option>
              <option>Daughter</option>
              <option>Cousin</option>
              <option>Friend</option>
              <option>Lawyer</option>
              <option>Other</option>
            </select>
          </div>
          <div class="relative z-0 w-full mb-5 group">
            <label class="block mb-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Life Status</label>
            <div class="relative">
              <select id="rv-life" class="block w-full px-2 py-2 text-xs sm:text-sm text-gray-900 bg-white border-b-2 border-r border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 dark:focus:border-blue-500 transition-all cursor-pointer">
                <option value="alive" selected>Alive</option>
                <option value="deceased">Deceased</option>
                <option value="unknown">Unknown</option>
              </select>
              <svg class="absolute top-1/2 right-2 w-4 h-4 text-gray-400 pointer-events-none transform -translate-y-1/2 fill-current" aria-hidden="true" viewBox="0 0 20 20"><path d="M10 12a1 1 0 0 1-.7-.3l-4-4a1 1 0 1 1 1.4-1.4L10 9.6l3.3-3.3a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 1-.7.3z" /></svg>
            </div>
          </div>
        </div>
        <div class="grid md:grid-cols-2 md:gap-6">
          <div class="relative z-0 w-full mb-5 group">
            <span class="absolute left-0 bottom-2.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 select-none">+63</span>
            <input type="tel" id="rv-phone" class="peer block py-2.5 pl-12 px-0 w-full text-xs sm:text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600" placeholder=" " />
            <label for="rv-phone" class="peer-focus:font-medium absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 left-12 -z-10 origin-left peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Phone</label>
          </div>
          <div class="relative z-0 w-full mb-5 group">
            <input type="email" id="rv-email" class="block py-2.5 px-0 w-full text-xs sm:text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" "/>
            <label for="rv-email" class="peer-focus:font-medium absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email (optional)</label>
          </div>
        </div>
        <div class="grid md:grid-cols-2 md:gap-6">
          <div class="relative z-0 w-full mb-5 group">
            <div class="relative">
              <select id="rv-id-type" class="peer block w-full px-1 py-1.5 text-xs sm:text-sm text-gray-900 bg-white border-b-2 border-r border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 dark:focus:border-blue-500 mt-3 transition-all">
                <option value="" selected disabled>Select ID Type</option>
                <option>Philippine National ID (PhilSys)</option>
                <option>Driver's License</option>
                <option>Passport</option>
                <option>SSS ID</option>
                <option>GSIS ID</option>
                <option>UMID</option>
                <option>PhilHealth ID</option>
                <option>Voter's ID (COMELEC)</option>
                <option>Postal ID</option>
                <option>TIN ID</option>
                <option>PRC ID</option>
                <option>Senior Citizen ID</option>
                <option>PWD ID</option>
                <option>Student ID</option>
                <option>Company ID</option>
                <option>Barangay ID</option>
              </select>
              <svg class="absolute top-1/2 right-2 w-4 h-4 text-gray-400 pointer-events-none transform -translate-y-1/2 fill-current" aria-hidden="true" viewBox="0 0 20 20"><path d="M10 12a1 1 0 0 1-.7-.3l-4-4a1 1 0 1 1 1.4-1.4L10 9.6l3.3-3.3a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 1-.7.3z" /></svg>
            </div>
            <label for="rv-id-type" class="peer-focus:font-medium absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">ID Type</label>
          </div>
          <div class="relative z-0 w-full mb-5 group">
            <input type="text" id="rv-id-number" class="block py-2.5 px-0 w-full text-xs sm:text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" "/>
            <label for="rv-id-number" class="peer-focus:font-medium absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">ID Number</label>
          </div>
        </div>
        <div class="relative z-0 w-full mb-5 group">
          <input type="text" id="rv-address" class="block py-2.5 px-0 w-full text-xs sm:text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" "/>
          <label for="rv-address" class="peer-focus:font-medium absolute text-xs sm:text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Address</label>
        </div>
        <div class="relative z-0 w-full mb-5 group">
          <input type="file" id="rv-photo" accept="image/*" class="mt-2 block w-full text-xs sm:text-sm text-gray-900 bg-transparent border-0 border-transparent appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-transparent file:text-xs file:sm:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
          <label for="rv-photo" class="peer-focus:font-medium absolute text-xs sm:text-sm text-gray-900 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-1 -z-10 origin-left peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Photo (optional)</label>
        </div>

        <!-- Conjugal Visit Requirements Section (Hidden by default) -->
        <div id="rv-conjugal-section" class="hidden mb-5 rounded-xl border border-pink-500/30 bg-pink-500/5 px-4 py-4 transition-all">
          <div class="flex items-start gap-3 mb-3">
            <div class="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m2-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h5 class="text-sm font-semibold text-pink-600 dark:text-pink-400">Conjugal Visit Requirements</h5>
              <p class="text-xs text-pink-600/80 dark:text-pink-300/80">Provide your marriage/live-in start date and upload the required documents. Couples must be married or living together for at least 6 years.</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="rv-relationship-start-date" class="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">Marriage/Live-in Start Date <span class="text-pink-600">*</span></label>
              <input type="date" id="rv-relationship-start-date" class="w-full rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm border focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors" />
              <p class="mt-2 text-[11px] text-pink-600/80 dark:text-pink-300/80">Must be at least 6 years prior to the current date.</p>
            </div>
            <div>
              <label for="rv-cohabitation-cert" class="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">Cohabitation Certificate <span class="text-pink-600">*</span></label>
              <input type="file" id="rv-cohabitation-cert" accept=".pdf,.jpg,.jpeg,.png" class="block w-full rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm cursor-pointer file:cursor-pointer file:border-0 file:rounded-md file:bg-pink-600 file:text-white file:px-4 file:py-2 file:text-xs hover:file:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors border" />
              <p class="mt-2 text-[11px] text-gray-500 dark:text-gray-400" id="rv-cohabitation-hint">Upload PDF/JPG/PNG up to 10MB.</p>
            </div>
            <div class="sm:col-span-2">
              <label for="rv-marriage-contract" class="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">Marriage Contract <span class="text-pink-600">*</span></label>
              <input type="file" id="rv-marriage-contract" accept=".pdf,.jpg,.jpeg,.png" class="block w-full rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 px-3 py-2 text-xs sm:text-sm cursor-pointer file:cursor-pointer file:border-0 file:rounded-md file:bg-pink-600 file:text-white file:px-4 file:py-2 file:text-xs hover:file:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors border" />
              <p class="mt-2 text-[11px] text-gray-500 dark:text-gray-400" id="rv-marriage-hint">Upload PDF/JPG/PNG up to 10MB.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    const result = await window.Swal.fire({
      title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Register Allowed Visitor</span>`,
      html: formHtml,
      background: isDarkMode ? '#1F2937' : '#FFFFFF',
      color: isDarkMode ? '#F9FAFB' : '#111827',
      showCancelButton: true,
      confirmButtonText: 'Register',
      cancelButtonText: 'Cancel',
      heightAuto: false,
      width: '48rem',
      scrollbarPadding: false,
      buttonsStyling: false,
      customClass: {
        popup: 'm-0 w-[96vw] max-w-[48rem] p-5 !rounded-2xl',
        confirmButton: 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium cursor-pointer',
        cancelButton: `inline-flex items-center justify-center px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900'} text-sm font-medium ml-2 cursor-pointer`
      },
      didOpen: () => {
        // Setup inmate search functionality
        const searchInput = document.getElementById('rv-inmate-search');
        const searchResults = document.getElementById('rv-inmate-results');
        const hiddenInput = document.getElementById('rv-inmate');
        const selectedDisplay = document.getElementById('rv-selected-inmate');
        const selectedName = document.getElementById('rv-selected-inmate-name');
        const selectedId = document.getElementById('rv-selected-inmate-id');
        const clearButton = document.getElementById('rv-clear-inmate');
        const searchContainer = document.getElementById('rv-inmate-search-container');
        const inmates = window._tempInmatesList || [];
        
        let searchTimeout;
        let selectedInmate = null;
        
        // Search function
        const performSearch = (query) => {
          if (!searchResults) return;
          
          const q = (query || '').trim().toLowerCase();
          
          if (q.length < 1) {
            searchResults.classList.add('hidden');
            // Reset margin when no search
            if (searchContainer) {
              searchContainer.style.marginBottom = '';
            }
            return;
          }
          
          // Filter inmates by name or ID
          const filtered = inmates.filter(inmate => {
            const name = (inmate.fullName || `${inmate.firstName || ''} ${inmate.lastName || ''}`).toLowerCase();
            const id = String(inmate.id || '').toLowerCase();
            return name.includes(q) || id.includes(q);
          }).slice(0, 10); // Limit to 10 results
          
          if (filtered.length === 0) {
            const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
            searchResults.innerHTML = `
              <div class="p-3 text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-center" style="background-color: ${isDarkMode ? 'rgb(31, 41, 55)' : 'rgb(255, 255, 255)'};">
                No inmates found
              </div>
            `;
            // Ensure background is opaque
            if (isDarkMode) {
              searchResults.style.backgroundColor = 'rgb(31, 41, 55)';
            } else {
              searchResults.style.backgroundColor = 'rgb(255, 255, 255)';
            }
            // Add margin to push Relationship field down (medium spacer - ~2 inches)
            if (searchContainer) {
              searchContainer.style.marginBottom = '10rem';
              searchContainer.style.transition = 'margin-bottom 0.2s ease-in-out';
            }
            searchResults.classList.remove('hidden');
            return;
          }
          
          // Render results with responsive design and opaque backgrounds
          const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
          // Ensure container has opaque background
          if (isDarkMode) {
            searchResults.style.backgroundColor = 'rgb(31, 41, 55)';
            searchResults.style.opacity = '1';
          } else {
            searchResults.style.backgroundColor = 'rgb(255, 255, 255)';
            searchResults.style.opacity = '1';
          }
          
          searchResults.innerHTML = filtered.map(inmate => {
            const name = inmate.fullName || `${inmate.firstName || ''} ${inmate.lastName || ''}`;
            const cellLocation = inmate.cell?.name || inmate.cellLocation || 'N/A';
            return `
              <div 
                class="p-2 sm:p-3 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-100 border-gray-700' : 'bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-900 border-gray-200'} cursor-pointer border-b last:border-b-0 transition-colors"
                style="background-color: ${isDarkMode ? 'rgb(31, 41, 55)' : 'rgb(255, 255, 255)'};"
                data-inmate-id="${inmate.id}"
              >
                <div class="flex items-center gap-2 sm:gap-3">
                  <div class="flex-1 min-w-0">
                    <div class="text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} truncate">
                      ${name.trim()}
                    </div>
                    <div class="text-[10px] sm:text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-0.5 flex items-center gap-1 sm:gap-2 flex-wrap">
                      <span class="text-left">ID: #${inmate.id}</span>
                      ${cellLocation !== 'N/A' ? `<span class="mx-0.5 sm:mx-1">•</span><span class="text-left">Cell: ${cellLocation}</span>` : ''}
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('');
          
          // Add click handlers
          searchResults.querySelectorAll('[data-inmate-id]').forEach(item => {
            item.addEventListener('click', () => {
              const inmateId = parseInt(item.getAttribute('data-inmate-id'));
              const inmate = filtered.find(i => i.id === inmateId);
              if (inmate) {
                selectInmate(inmate);
              }
            });
          });
          
          // Add margin to container to push Relationship field down and prevent overlap (medium spacer - ~2 inches)
          if (searchContainer) {
            searchContainer.style.marginBottom = '10rem';
            searchContainer.style.transition = 'margin-bottom 0.2s ease-in-out';
          }
          
          searchResults.classList.remove('hidden');
        };
        
        // Select inmate function
        const selectInmate = (inmate) => {
          selectedInmate = inmate;
          const name = inmate.fullName || `${inmate.firstName || ''} ${inmate.lastName || ''}`;
          
          hiddenInput.value = inmate.id;
          selectedName.textContent = name.trim();
          selectedId.textContent = `ID: #${inmate.id}`;
          
          searchInput.value = '';
          searchResults.classList.add('hidden');
          
          // Reset margin when inmate is selected
          if (searchContainer) {
            searchContainer.style.marginBottom = '';
          }
          
          // Show selected inmate display with animation
          selectedDisplay.classList.remove('hidden');
          // Trigger animation by removing and re-adding opacity/transform classes
          setTimeout(() => {
            selectedDisplay.classList.remove('opacity-0', '-translate-y-2');
            selectedDisplay.classList.add('opacity-100', 'translate-y-0');
          }, 10);
        };
        
        // Clear selection function
        const clearSelection = () => {
          selectedInmate = null;
          hiddenInput.value = '';
          
          // Animate out before hiding
          selectedDisplay.classList.remove('opacity-100', 'translate-y-0');
          selectedDisplay.classList.add('opacity-0', '-translate-y-2');
          
          setTimeout(() => {
            selectedDisplay.classList.add('hidden');
          }, 300);
          
          searchInput.value = '';
          searchInput.focus();
        };
        
        // Search input event listeners
        if (searchInput) {
          searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
              performSearch(e.target.value);
            }, 200);
          });
          
          searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim()) {
              performSearch(searchInput.value);
            }
          });
          
          // Hide results when clicking outside
          const handleClickOutside = (e) => {
            if (searchInput && searchResults && 
                !searchInput.contains(e.target) && 
                !searchResults.contains(e.target)) {
              searchResults.classList.add('hidden');
              // Reset margin when hiding dropdown
              if (searchContainer) {
                searchContainer.style.marginBottom = '';
              }
            }
          };
          document.addEventListener('click', handleClickOutside);
        }
        
        // Clear button event listener
        if (clearButton) {
          clearButton.addEventListener('click', clearSelection);
        }
        
        // Setup conjugal visit section toggle
        const relationshipSelect = document.getElementById('rv-relationship');
        const conjugalSection = document.getElementById('rv-conjugal-section');
        const cohabitationCert = document.getElementById('rv-cohabitation-cert');
        const marriageContract = document.getElementById('rv-marriage-contract');
        const cohabitationHint = document.getElementById('rv-cohabitation-hint');
        const marriageHint = document.getElementById('rv-marriage-hint');
        
        if (relationshipSelect && conjugalSection) {
          const toggleConjugalSection = () => {
            const value = relationshipSelect.value;
            if (value === 'Wife' || value === 'Husband' || value === 'Spouse') {
              conjugalSection.classList.remove('hidden');
            } else {
              conjugalSection.classList.add('hidden');
            }
          };
          
          relationshipSelect.addEventListener('change', toggleConjugalSection);
          
          // Initialize state
          toggleConjugalSection();
        }
        
        // File input change handlers
        if (cohabitationCert && cohabitationHint) {
          cohabitationCert.addEventListener('change', () => {
            if (cohabitationCert.files && cohabitationCert.files[0]) {
              cohabitationHint.textContent = `Selected: ${cohabitationCert.files[0].name}`;
            } else {
              cohabitationHint.textContent = 'Upload PDF/JPG/PNG up to 10MB.';
            }
          });
        }
        
        if (marriageContract && marriageHint) {
          marriageContract.addEventListener('change', () => {
            if (marriageContract.files && marriageContract.files[0]) {
              marriageHint.textContent = `Selected: ${marriageContract.files[0].name}`;
            } else {
              marriageHint.textContent = 'Upload PDF/JPG/PNG up to 10MB.';
            }
          });
        }
      },
      preConfirm: async () => {
        const inmateId = document.getElementById('rv-inmate').value;
        const name = document.getElementById('rv-name').value.trim();
        const relationship = document.getElementById('rv-relationship').value;
        const life = document.getElementById('rv-life').value;
        const phone = document.getElementById('rv-phone').value.trim();
        const email = document.getElementById('rv-email').value.trim();
        const idType = document.getElementById('rv-id-type').value;
        const idNumber = document.getElementById('rv-id-number').value.trim();
        const address = document.getElementById('rv-address').value.trim();
        const photoInput = document.getElementById('rv-photo');
        const relationshipStartDateInput = document.getElementById('rv-relationship-start-date');
        const cohabitationCertInput = document.getElementById('rv-cohabitation-cert');
        const marriageContractInput = document.getElementById('rv-marriage-contract');

        if (!inmateId) {
          window.Swal.showValidationMessage('Please select an inmate');
          return false;
        }
        if (!name) {
          window.Swal.showValidationMessage('Visitor name is required');
          return false;
        }

        // Validate conjugal visit fields if relationship is Wife, Husband, or Spouse
        const relationshipLower = (relationship || '').toLowerCase();
        const requiresConjugal = relationshipLower === 'wife' || relationshipLower === 'husband' || relationshipLower === 'spouse';
        
        if (requiresConjugal) {
          if (!relationshipStartDateInput || !relationshipStartDateInput.value) {
            window.Swal.showValidationMessage('Marriage/Live-in start date is required for conjugal visits');
            return false;
          }
          
          // Validate date is not in the future
          const startDate = new Date(relationshipStartDateInput.value);
          const now = new Date();
          if (startDate > now) {
            window.Swal.showValidationMessage('Relationship start date cannot be in the future');
            return false;
          }
          
          // Validate 6-year requirement
          const yearsDiff = (now - startDate) / (1000 * 60 * 60 * 24 * 365.25);
          if (yearsDiff < 6) {
            window.Swal.showValidationMessage('Couples must be married or living together for at least 6 years to request conjugal visits');
            return false;
          }
          
          if (!cohabitationCertInput || !cohabitationCertInput.files || !cohabitationCertInput.files[0]) {
            window.Swal.showValidationMessage('Cohabitation certificate is required for conjugal visits');
            return false;
          }
          
          if (cohabitationCertInput.files[0].size > 10 * 1024 * 1024) {
            window.Swal.showValidationMessage('Cohabitation certificate must be less than 10MB');
            return false;
          }
          
          if (!marriageContractInput || !marriageContractInput.files || !marriageContractInput.files[0]) {
            window.Swal.showValidationMessage('Marriage contract is required for conjugal visits');
            return false;
          }
          
          if (marriageContractInput.files[0].size > 10 * 1024 * 1024) {
            window.Swal.showValidationMessage('Marriage contract must be less than 10MB');
            return false;
          }
        }

        let VisitorApiClient;
        ({ default: VisitorApiClient } = await import('./components/visitorClient.js'));
        const api = new VisitorApiClient();
        const form = new FormData();
        form.append('inmate_id', inmateId);
        form.append('name', name);
        form.append('relationship', relationship);
        form.append('life_status', life);
        form.append('phone', phone);
        form.append('email', email);
        form.append('id_type', idType);
        form.append('id_number', idNumber);
        form.append('address', address);
        form.append('is_allowed', '1'); // Always 1 for allowed visitors
        
        // Handle photo upload if provided
        if (photoInput && photoInput.files && photoInput.files[0]) {
          form.append('avatar', photoInput.files[0]);
        }
        
        // Handle conjugal visit data if relationship is Wife, Husband, or Spouse
        if (requiresConjugal) {
          form.append('relationship_start_date', relationshipStartDateInput.value);
          form.append('cohabitation_cert', cohabitationCertInput.files[0]);
          form.append('marriage_contract', marriageContractInput.files[0]);
        }

        try {
          await api.create(form);
          return true;
        } catch (error) {
          window.Swal.showValidationMessage(`Registration failed: ${error.message}`);
          return false;
        }
      }
    });

    // Cleanup temporary inmates list
    if (window._tempInmatesList) {
      delete window._tempInmatesList;
    }

    if (result.isConfirmed) {
      await loadData();
      window.Swal.fire({
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Success!</span>`,
        text: 'Visitor registered successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: isDarkMode ? '#1F2937' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827',
      });
    }
  }

  // Init
  loadData();
});


