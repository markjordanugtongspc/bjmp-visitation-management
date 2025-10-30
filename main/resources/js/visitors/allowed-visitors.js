import 'flowbite';

document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('visitors-table-body');
  const mobileCards = document.getElementById('visitors-cards-mobile');
  const searchInput = document.getElementById('visitors-search');
  const totalAllowedEl = document.getElementById('allowed-visitors-total');
  const inmatesWithoutEl = document.getElementById('inmates-without-allowed');
  const totalInmatesEl = document.getElementById('inmates-total');
  const recentlyAddedEl = document.getElementById('recently-added');

  let rows = [];

  function render() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    const filtered = q
      ? rows.filter(r => `${r.name} ${r.inmate?.full_name || ''} ${r.relationship || ''}`.toLowerCase().includes(q))
      : rows;
    renderTable(filtered);
    renderMobileCards(filtered);
  }

  function lifeStatusBadge(status) {
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
    return `
      <div class="flex items-center gap-2 justify-end">
        <button class="px-2 py-1 text-xs rounded bg-orange-600 hover:bg-orange-700 text-white cursor-pointer" data-action="edit" data-id="${id}">Edit</button>
        <button class="px-2 py-1 text-xs rounded bg-red-800 hover:bg-red-900 text-white cursor-pointer" data-action="delete" data-id="${id}">Delete</button>
      </div>
    `;
  }

  function renderTable(list) {
    if (!tableBody) return;
    if (!list.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-32 py-32 text-center text-gray-500 dark:text-gray-400">No allowed visitors found</td>
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
    if (!mobileCards) return;
    if (!list.length) {
      mobileCards.innerHTML = `
        <div class="text-center py-8 sm:py-12">
          <div class="flex flex-col items-center justify-center space-y-6 px-4 sm:px-0">
            <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="text-center">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">No Visitors Yet</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">Use "Register Inmate Visitor" to add the first visitor.</p>
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
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3" data-id="${v.id}">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3 flex-1">
              ${avatarUrl ? `
                <img src="${avatarUrl}" alt="${v.name}" class="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold text-lg" style="display:none;">${v.name.charAt(0).toUpperCase()}</div>
              ` : `
                <div class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold text-lg">${v.name.charAt(0).toUpperCase()}</div>
              `}
              <div class="flex-1 min-w-0">
                <button type="button" class="js-visitor-link text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium text-sm" data-id="${v.id}">${v.name}</button>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">PDL: ${inmateName}</p>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-gray-500 dark:text-gray-400">Relationship:</span>
              <p class="text-gray-900 dark:text-gray-100 font-medium">${v.relationship || '—'}</p>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Status:</span>
              <div class="mt-1">${lifeStatusBadge(v.life_status)}</div>
            </div>
          </div>
          <div class="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
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
    const json = await api.listAllowed({ per_page: 100 });
    
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

  async function openDetailsModal(item) {
    // Extract inmate name - handle both full_name and first_name/last_name
    const inmateName = item.inmate?.full_name || 
                      (item.inmate?.first_name && item.inmate?.last_name ? `${item.inmate.first_name} ${item.inmate.last_name}` : '') ||
                      '—';
    
    // Build avatar URL
    const avatarUrl = item.avatar_path && item.avatar_filename 
      ? `/storage/${item.avatar_path}/${item.avatar_filename}` 
      : null;
    
    const html = `
      <div class="flex flex-col sm:flex-row gap-6">
        <!-- Avatar Section -->
        <div class="shrink-0 flex justify-center sm:justify-start">
          ${avatarUrl ? `
            <div class="relative">
              <img src="${avatarUrl}" alt="${item.name}" class="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border-4 border-gray-700 shadow-xl" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
              <div class="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-5xl shadow-xl border-4 border-gray-700" style="display:none;">${item.name.charAt(0).toUpperCase()}</div>
            </div>
          ` : `
            <div class="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-5xl shadow-xl border-4 border-gray-700">${item.name.charAt(0).toUpperCase()}</div>
          `}
        </div>
        
        <!-- Details Section -->
        <div class="flex-1 space-y-3 sm:space-y-4 text-left">
          <!-- Mobile: Left-Right Layout -->
          <div class="flex sm:block justify-between items-start gap-4">
            <div class="text-xs text-gray-400 uppercase tracking-wider min-w-[100px] sm:min-w-0">Visitor Name</div>
            <div class="text-sm sm:text-lg font-semibold text-gray-100 text-right sm:text-left flex-1 sm:mt-1">${item.name}</div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div class="flex sm:block justify-between items-start gap-4">
              <div class="text-xs text-gray-400 uppercase tracking-wider min-w-[100px] sm:min-w-0">Inmate (PDL)</div>
              <div class="text-sm text-gray-100 text-right sm:text-left flex-1 sm:mt-1">${inmateName}</div>
            </div>
            <div class="flex sm:block justify-between items-start gap-4">
              <div class="text-xs text-gray-400 uppercase tracking-wider min-w-[100px] sm:min-w-0">Relationship</div>
              <div class="text-sm text-gray-100 text-right sm:text-left flex-1 sm:mt-1">${item.relationship || '—'}</div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div class="flex sm:block justify-between items-start gap-4">
              <div class="text-xs text-gray-400 uppercase tracking-wider min-w-[100px] sm:min-w-0">Phone</div>
              <div class="text-sm text-gray-100 text-right sm:text-left flex-1 sm:mt-1">${item.phone || '—'}</div>
            </div>
            <div class="flex sm:block justify-between items-start gap-4">
              <div class="text-xs text-gray-400 uppercase tracking-wider min-w-[100px] sm:min-w-0">Email</div>
              <div class="text-sm text-gray-100 text-right sm:text-left flex-1 sm:mt-1">${item.email || '—'}</div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div class="flex sm:block justify-between items-start gap-4">
              <div class="text-xs text-gray-400 uppercase tracking-wider min-w-[100px] sm:min-w-0">ID Type</div>
              <div class="text-sm text-gray-100 text-right sm:text-left flex-1 sm:mt-1">${item.id_type || '—'}</div>
            </div>
            <div class="flex sm:block justify-between items-start gap-4">
              <div class="text-xs text-gray-400 uppercase tracking-wider min-w-[100px] sm:min-w-0">ID Number</div>
              <div class="text-sm text-gray-100 text-right sm:text-left flex-1 sm:mt-1">${item.id_number || '—'}</div>
            </div>
          </div>
          
          <div class="flex sm:block justify-between items-start gap-4">
            <div class="text-xs text-gray-400 uppercase tracking-wider min-w-[100px] sm:min-w-0">Address</div>
            <div class="text-sm text-gray-100 text-right sm:text-left flex-1 sm:mt-1">${item.address || '—'}</div>
          </div>
          
          <div class="flex sm:block justify-between items-start gap-4">
            <div class="text-xs text-gray-400 uppercase tracking-wider min-w-[100px] sm:min-w-0">Life Status</div>
            <div class="text-right sm:text-left flex-1 sm:mt-1">${lifeStatusBadge(item.life_status)}</div>
          </div>
        </div>
      </div>
    `;
    if (window.Swal) {
      window.Swal.fire({
        title: '<span class="text-white">Visitor Details</span>',
        html,
        background: '#111827',
        color: '#F9FAFB',
        showConfirmButton: false,
        showCloseButton: true,
        width: '48rem',
        heightAuto: true,
        scrollbarPadding: false,
        buttonsStyling: false,
        customClass: {
          popup: 'm-0 w-[96vw] max-w-3xl p-6 !rounded-2xl',
        }
      });
    }
  }

  async function openEditModal(item) {
    const formHtml = `
      <div class="text-left">
        <div class="grid md:grid-cols-2 md:gap-6">
          <div class="relative z-0 w-full mb-5 group">
            <input type="text" id="ev-name" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value="${item.name || ''}"/>
            <label for="ev-name" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left">Name</label>
          </div>
          <div class="relative z-0 w-full mb-5 group">
            <label class="block mb-1 text-xs text-gray-500 dark:text-gray-400">Life Status</label>
            <select id="ev-life" class="block w-full px-2 py-2 text-xs text-gray-900 bg-white border-b-2 border-r border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700 focus:outline-none">
              <option value="alive" ${item.life_status==='alive'?'selected':''}>Alive</option>
              <option value="deceased" ${item.life_status==='deceased'?'selected':''}>Deceased</option>
              <option value="unknown" ${item.life_status==='unknown'?'selected':''}>Unknown</option>
            </select>
          </div>
        </div>
        <div class="grid md:grid-cols-2 md:gap-6">
          <div class="relative z-0 w-full mb-5 group">
            <input type="text" id="ev-relationship" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value="${item.relationship || ''}"/>
            <label for="ev-relationship" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left">Relationship</label>
          </div>
          <div class="relative z-0 w-full mb-5 group">
            <input type="email" id="ev-email" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " value="${item.email || ''}"/>
            <label for="ev-email" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left">Email</label>
          </div>
        </div>
      </div>
    `;
    const res = await window.Swal.fire({
      title: '<span class="text-white">Edit Allowed Visitor</span>',
      html: formHtml,
      background: '#111827',
      color: '#F9FAFB',
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      heightAuto: false,
      scrollbarPadding: false,
      buttonsStyling: false,
      customClass: {
        popup: 'm-0 w-[96vw] max-w-[96vw] sm:max-w-[42rem] p-5 !rounded-2xl',
        confirmButton: 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium cursor-pointer',
        cancelButton: 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-medium ml-2 cursor-pointer'
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
        title: '<span class="text-white">Updated</span>',
        icon: 'success',
        timer: 1200,
        showConfirmButton: false,
        background: '#111827',
        color: '#FFFFFF',
      });
    }
  }

  async function confirmDelete(id) {
    const res = await window.Swal.fire({
      title: '<span class="text-white">Delete visitor?</span>',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      background: '#111827',
      color: '#F9FAFB',
      buttonsStyling: false,
      customClass: {
        popup: 'm-0 w-[96vw] max-w-[28rem] p-5 !rounded-xl',
        confirmButton: 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-sm font-medium cursor-pointer',
        cancelButton: 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-medium ml-2 cursor-pointer'
      }
    });
    if (!res.isConfirmed) return;
    let VisitorApiClient;
    ({ default: VisitorApiClient } = await import('./components/visitorClient.js'));
    const api = new VisitorApiClient();
    await api.delete(id);
    await loadData();
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchInput.__tid);
      searchInput.__tid = setTimeout(render, 200);
    });
  }

  // Registration modal
  const registerBtn = document.getElementById('open-manual-registration');
  if (registerBtn) {
    registerBtn.addEventListener('click', () => openRegistrationModal());
  }

  async function openRegistrationModal() {
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

    const inmateOptions = inmates.map(i => {
      const name = i.fullName || `${i.firstName || ''} ${i.lastName || ''}`;
      return `<option value="${i.id}">#${i.id} - ${name.trim()}</option>`;
    }).join('');

    const formHtml = `
      <div class="text-left max-h-[70vh] overflow-y-auto px-1">
        <div class="grid md:grid-cols-2 md:gap-6">
          <div class="relative z-0 w-full mb-5 group">
            <label class="block mb-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Select Inmate (PDL) *</label>
            <div class="relative">
              <select id="rv-inmate" required class="block w-full px-2 py-2 text-xs sm:text-sm text-gray-900 bg-white border-b-2 border-r border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 dark:focus:border-blue-500 transition-all cursor-pointer">
                <option value="" disabled selected>-- Choose an inmate --</option>
                ${inmateOptions}
              </select>
              <svg class="absolute top-1/2 right-2 w-4 h-4 text-gray-400 pointer-events-none transform -translate-y-1/2 fill-current" aria-hidden="true" viewBox="0 0 20 20"><path d="M10 12a1 1 0 0 1-.7-.3l-4-4a1 1 0 1 1 1.4-1.4L10 9.6l3.3-3.3a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 1-.7.3z" /></svg>
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
              <option>Wife/Husband</option>
              <option>Son</option>
              <option>Daughter</option>
              <option>Cousin</option>
              <option>Friend</option>
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
      </div>
    `;

    const result = await window.Swal.fire({
      title: '<span class="text-white">Register Allowed Visitor</span>',
      html: formHtml,
      background: '#111827',
      color: '#F9FAFB',
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
        cancelButton: 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-medium ml-2 cursor-pointer'
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

        if (!inmateId) {
          window.Swal.showValidationMessage('Please select an inmate');
          return false;
        }
        if (!name) {
          window.Swal.showValidationMessage('Visitor name is required');
          return false;
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

        try {
          await api.create(form);
          return true;
        } catch (error) {
          window.Swal.showValidationMessage(`Registration failed: ${error.message}`);
          return false;
        }
      }
    });

    if (result.isConfirmed) {
      await loadData();
      window.Swal.fire({
        title: '<span class="text-white">Success!</span>',
        text: 'Visitor registered successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#111827',
        color: '#FFFFFF',
      });
    }
  }

  // Init
  loadData();
});


