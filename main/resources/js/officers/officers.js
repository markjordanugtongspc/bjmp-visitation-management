// Officers page interactions: SweetAlert2 modal for edit/create
// Ensure SweetAlert2 is available (fallback dynamic import if missing)
async function ensureSwal() {
  if (window.Swal) return window.Swal;
  try {
    const mod = await import(/* @vite-ignore */ 'sweetalert2');
    window.Swal = mod.default || mod;
    return window.Swal;
  } catch (_) {
    // Last resort: try CDN
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return window.Swal;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Get both desktop and mobile containers
  const tableBody = document.querySelector('#officers-table-body');
  const mobileCardsContainer = document.querySelector('#officers-cards-mobile');
  const addButtons = document.querySelectorAll('[data-add-officer]');

  // Detect if we're on mobile
  const isMobile = () => window.innerWidth < 640; // sm breakpoint in Tailwind

  // In-memory cache used only for incremental detection/UX (source of truth is backend)
  let officers = [];
  let nextId = 8;
  let pollTimerId = null;
  let currentIntervalMs = 10000; // start with 10s
  const minIntervalMs = 5000;
  const maxIntervalMs = 60000;
  // Removed seenIds gating so backend becomes the single source of truth

  // Helper to get officer by id
  function getOfficerById(id) {
    return officers.find(o => Number(o.id) === Number(id));
  }

  // Helper to get ThemeManager config for SweetAlert2
  function getSwalConfig(options = {}) {
    if (window.ThemeManager) {
      return window.ThemeManager.getSwalConfig(options);
    }
    // Fallback if ThemeManager not available
    return options;
  }

  async function openOfficerModal(initial = {}) {
    await ensureSwal();
    const name = initial.name || '';
    const email = initial.email || '';
    const title = initial.title || '';
    const subtitle = initial.subtitle || '';
    const status = (initial.status || 'Active').toLowerCase();

    // Responsive width for the modal - standard sizes
    const width = isMobile() ? '95%' : '42rem'; // 672px max on desktop (max-w-2xl)

    // Build modal configuration
    const modalConfig = {
      title: initial.id ? 'Edit Officer' : 'Add Officer',
      html: `
        <div class="space-y-3 text-left">
          <label class="block text-xs text-gray-600 dark:text-gray-300">Name</label>
          <input id="o-name" class="w-full rounded-md bg-gray-100 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2" value="${name.replace(/"/g,'&quot;')}" />
          <label class="block text-xs text-gray-600 dark:text-gray-300 mt-2">Email</label>
          <input id="o-email" type="email" class="w-full rounded-md bg-gray-100 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2" value="${email.replace(/"/g,'&quot;')}" />
          <label class="block text-xs text-gray-600 dark:text-gray-300 mt-2">Title</label>
          <input id="o-title" class="w-full rounded-md bg-gray-100 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2" value="${title.replace(/"/g,'&quot;')}" />
          <label class="block text-xs text-gray-600 dark:text-gray-300 mt-2">Subtitle</label>
          <input id="o-subtitle" class="w-full rounded-md bg-gray-100 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2" value="${subtitle.replace(/"/g,'&quot;')}" />
          <label class="block text-xs text-gray-600 dark:text-gray-300 mt-2">Status</label>
          ${isMobile() ? `
          <div class="relative overflow-visible">
            <input id="o-status" type="hidden" value="${status==='inactive' ? 'Inactive' : 'Active'}" />
            <button type="button" id="o-status-btn" class="flex w-full items-center justify-between rounded-md bg-gray-100 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <span id="o-status-label">${status==='inactive' ? 'Inactive' : 'Active'}</span>
              <svg class="h-4 w-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/></svg>
            </button>
            <!-- For mobile, keep the menu in normal flow so modal stretches like elastic -->
            <div id="o-status-menu" class="mt-1 origin-top w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 overflow-hidden hidden">
              <button type="button" data-value="Active" class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Active</button>
              <button type="button" data-value="Inactive" class="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Inactive</button>
            </div>
          </div>` : `
          <div class="relative overflow-visible">
            <select id="o-status" class="block w-full appearance-none rounded-md bg-gray-100 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-3 sm:py-2 py-3 sm:text-sm text-base pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <option ${status==='active'?'selected':''} value="Active">Active</option>
              <option ${status==='inactive'?'selected':''} value="Inactive">Inactive</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
              <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
              </svg>
            </div>
          </div>`}
        </div>
      `,
      width: width,
      padding: isMobile() ? '1rem' : '1.25rem',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      customClass: {
        container: 'swal-responsive-container',
        popup: 'swal-responsive-popup overflow-visible',
        content: 'swal-responsive-content',
      },
      didOpen: () => {
        const popup = document.querySelector('.swal2-popup');
        const container = document.querySelector('.swal2-container');
        const htmlContainer = document.querySelector('.swal2-html-container');
        // Ensure dropdown can overflow outside modal without scrolling it
        popup?.classList?.add('overflow-visible');
        container && (/** @type {HTMLElement} */(container)).style.setProperty('overflow', 'visible', 'important');
        popup && (/** @type {HTMLElement} */(popup)).style.setProperty('overflow', 'visible', 'important');
        htmlContainer && (/** @type {HTMLElement} */(htmlContainer)).style.setProperty('overflow', 'visible', 'important');

        if (isMobile()) {
          // Custom dropdown behavior
          const hiddenInput = /** @type {HTMLInputElement} */(document.getElementById('o-status'));
          const btn = /** @type {HTMLButtonElement} */(document.getElementById('o-status-btn'));
          const label = /** @type {HTMLElement} */(document.getElementById('o-status-label'));
          const menu = /** @type {HTMLElement} */(document.getElementById('o-status-menu'));
          let open = false;
          const closeMenu = () => {
            menu.classList.add('hidden');
            open = false;
          };
          const openMenu = () => {
            menu.classList.remove('hidden');
            open = true;
          };
          btn?.addEventListener('click', () => {
            if (open) closeMenu(); else openMenu();
          });
          menu?.querySelectorAll('button[data-value]')?.forEach(item => {
            item.addEventListener('click', (e) => {
              const val = /** @type {HTMLElement} */(e.currentTarget).getAttribute('data-value');
              if (!val) return;
              hiddenInput.value = val;
              label.textContent = val;
              closeMenu();
            });
          });
          // Close on outside click
          document.addEventListener('click', (e) => {
            if (!popup?.contains(/** @type {Node} */(e.target))) return;
            if (e.target === btn || btn.contains(/** @type {Node} */(e.target))) return;
            if (menu.contains(/** @type {Node} */(e.target))) return;
            closeMenu();
          });

          // Mobile: spread Save (left) and Cancel (right)
          const actions = /** @type {HTMLElement} */(document.querySelector('.swal2-actions'));
          const confirmBtn = /** @type {HTMLButtonElement} */(document.querySelector('.swal2-confirm'));
          const cancelBtn = /** @type {HTMLButtonElement} */(document.querySelector('.swal2-cancel'));
          if (actions) {
            actions.classList.add('w-full', 'flex', 'justify-between');
          }
          confirmBtn?.classList?.add('cursor-pointer', 'ml-0');
          cancelBtn?.classList?.add('cursor-pointer', 'mr-0');
        } else {
          // Desktop native select focus rings
          const statusSelect = /** @type {HTMLSelectElement} */(document.getElementById('o-status'));
          statusSelect?.addEventListener('focus', () => {
            statusSelect.classList.add('ring-2', 'ring-blue-500');
          });
          statusSelect?.addEventListener('blur', () => {
            statusSelect.classList.remove('ring-2', 'ring-blue-500');
          });
        }
      },
      preConfirm: () => {
        const v = {
          name: /** @type {HTMLInputElement} */(document.getElementById('o-name')).value.trim(),
          email: /** @type {HTMLInputElement} */(document.getElementById('o-email')).value.trim(),
          title: /** @type {HTMLInputElement} */(document.getElementById('o-title')).value.trim(),
          subtitle: /** @type {HTMLInputElement} */(document.getElementById('o-subtitle')).value.trim(),
          status: /** @type {HTMLInputElement | HTMLSelectElement} */(document.getElementById('o-status')).value,
        };
        if (!v.name || !v.email) {
          window.Swal.showValidationMessage('Name and Email are required.');
          return false;
        }
        return v;
      },
    };

    // Merge with ThemeManager config
    const themeConfig = getSwalConfig({});
    const finalConfig = {
      ...themeConfig,
      ...modalConfig,
      customClass: {
        ...(themeConfig.customClass || {}),
        ...modalConfig.customClass,
      },
    };

    return window.Swal.fire(finalConfig);
  }

  /**
   * Generate SVG avatar based on officer name
   * @param {string} name - Officer name
   * @returns {string} - SVG data URL
   */
  function generateOfficerAvatarSVG(name) {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    const colors = [
      ['#3B82F6', '#2563EB'], // Blue
      ['#10B981', '#059669'], // Green
      ['#F59E0B', '#D97706'], // Amber
      ['#EF4444', '#DC2626'], // Red
      ['#8B5CF6', '#7C3AED'], // Purple
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;
    const [bgColor, textColor] = colors[colorIndex];
    
    const svg = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="${bgColor}" rx="50"/>
        <text x="50" y="50" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="central">${initials}</text>
      </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }

  /**
   * Get officer avatar URL with fallback
   * @param {Object} officer - Officer object
   * @returns {string} - Avatar URL
   */
  function getOfficerAvatarUrl(officer) {
    if (officer.profile_picture_url) {
      return officer.profile_picture_url;
    }
    
    // Fallback to generated SVG
    const name = officer.name || 'Officer';
    return generateOfficerAvatarSVG(name);
  }

  /**
   * Open file manager to upload avatar for an officer
   * @param {number} userId - ID of the officer
   * @param {string} userName - Name of the officer
   */
  function openOfficerAvatarUpload(userId, userName) {
    // Create hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file size
        if (file.size > 5 * 1024 * 1024) {
          if (window.ThemeManager) {
            window.ThemeManager.showError('File size must be less than 5MB');
          } else {
            alert('File size must be less than 5MB');
          }
          return;
        }
        
        // Upload immediately
        await uploadOfficerAvatar(userId, file, userName);
      }
    });
    
    // Add to DOM and click to open file manager
    document.body.appendChild(input);
    input.click();
    
    // Clean up
    setTimeout(() => {
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
    }, 100);
  }

  /**
   * Upload officer avatar to server
   * @param {number} userId - ID of the officer
   * @param {File} file - Image file to upload
   * @param {string} userName - Name of the officer
   */
  async function uploadOfficerAvatar(userId, file, userName) {
    try {
      // Show loading using ThemeManager
      if (window.ThemeManager) {
        window.Swal.fire(window.ThemeManager.getSwalConfig({
          title: 'Uploading...',
          text: 'Please wait while we upload the avatar',
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            window.Swal.showLoading();
          }
        }));
      }

      // Get upload URL based on current route
      const addButton = document.querySelector('[data-add-officer]');
      if (!addButton) {
        throw new Error('Cannot find upload endpoint');
      }

      // Determine route prefix from update URL
      const updateUrl = addButton.getAttribute('data-update-url') || '';
      let uploadUrl = '';
      
      if (updateUrl.includes('/admin/officers/')) {
        uploadUrl = `/admin/officers/${userId}/upload-avatar`;
      } else if (updateUrl.includes('/warden/officers/')) {
        uploadUrl = `/warden/officers/${userId}/upload-avatar`;
      } else if (updateUrl.includes('/assistant-warden/officers/')) {
        uploadUrl = `/assistant-warden/officers/${userId}/upload-avatar`;
      } else {
        throw new Error('Cannot determine upload route');
      }

      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('_token', addButton.getAttribute('data-csrf') || document.querySelector('meta[name="csrf-token"]')?.content || '');

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // Close loading
        window.Swal.close();
        
        // Show success message
        if (window.ThemeManager) {
          window.ThemeManager.showSuccess('Avatar uploaded successfully');
        } else {
          await ensureSwal();
          window.Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Avatar uploaded successfully',
            timer: 2000,
            showConfirmButton: false
          });
        }
        
        // Update the officer in the list
        const officer = getOfficerById(userId);
        if (officer) {
          officer.profile_picture_url = data.profile_picture_url || data.image_url;
          renderOrUpdateViews(officer);
        } else {
          // Refresh the list
          const listUrl = addButton.getAttribute('data-list-url');
          if (listUrl) {
            const resp = await fetch(listUrl, { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' });
            if (resp.ok) {
              const items = await resp.json();
              if (Array.isArray(items)) {
                items.forEach(it => renderOrUpdateViews(it));
              }
            }
          }
        }
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      window.Swal.close();
      console.error('Error uploading avatar:', error);
      
      if (window.ThemeManager) {
        window.ThemeManager.showError(error.message || 'Failed to upload avatar');
      } else {
        await ensureSwal();
        window.Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: error.message || 'Failed to upload avatar. Please try again.'
        });
      }
    }
  }

  // Update both desktop and mobile views
  function renderOrUpdateViews(data) {
    // Update desktop table row
    updateDesktopRow(data);

    // Update mobile card
    updateMobileCard(data);
  }

  // Handle desktop table row updates
  function updateDesktopRow(data) {
    if (!tableBody) return;

    let row = tableBody.querySelector(`tr[data-row-id="${data.id}"]`);
    const statusClass = data.status.toLowerCase() === 'active'
      ? 'bg-green-500/10 text-green-500'
      : 'bg-red-500/10 text-red-500';

    if (!row) {
      row = document.createElement('tr');
      row.setAttribute('data-row-id', String(data.id));
      row.className = 'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors';
      const avatarUrl = getOfficerAvatarUrl(data);
      row.innerHTML = `
        <td class="px-4 py-3 whitespace-nowrap">
          <div class="flex items-center gap-3">
            <div class="relative group h-9 w-9 rounded-full overflow-hidden ring-2 ring-blue-500/20 flex items-center justify-center cursor-pointer" data-avatar-upload data-user-id="${data.id}">
              <img src="${avatarUrl}" alt="${data.name}" class="h-full w-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
              <div class="h-9 w-9 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center" style="display:none;">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/><path d="M2 22s4-4 10-4 10 4 10 4-4 2-10 2-10-2-10-2z"/></svg>
              </div>
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-50" data-o-name></div>
              <div class="text-xs text-gray-500 dark:text-gray-400" data-o-email></div>
            </div>
          </div>
        </td>
        <td class="px-4 py-3">
          <div class="font-medium" data-o-title></div>
          <div class="text-xs text-gray-500 dark:text-gray-400" data-o-subtitle></div>
        </td>
        <td class="px-4 py-3">
          <span data-o-status class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px]"></span>
        </td>
        <td class="px-4 py-3 text-right">
          <button type="button" data-edit-officer class="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded-md transition-colors cursor-pointer" aria-label="Edit officer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
              <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
              <path d="M16 5l3 3" />
            </svg>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    }

    // Update row content
    row.querySelector('[data-o-name]').textContent = data.name;
    row.querySelector('[data-o-email]').textContent = data.email;
    row.querySelector('[data-o-title]').textContent = data.title;
    row.querySelector('[data-o-subtitle]').textContent = data.subtitle;
    const statusEl = row.querySelector('[data-o-status]');
    statusEl.textContent = data.status;
    statusEl.className = `inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${statusClass}`;

    // Update avatar
    const avatarContainer = row.querySelector('[data-avatar-upload]');
    if (avatarContainer) {
      const avatarUrl = getOfficerAvatarUrl(data);
      const img = avatarContainer.querySelector('img');
      if (img) {
        img.src = avatarUrl;
        img.style.display = '';
      }
      const fallback = avatarContainer.querySelector('div[style*="display:none"]');
      if (fallback) {
        fallback.style.display = 'none';
      }
      avatarContainer.setAttribute('data-user-id', String(data.id));
    }

    // Add event listener to edit button
    const editBtn = row.querySelector('[data-edit-officer]');
    editBtn.onclick = async () => {
      const { value } = await openOfficerModal(data);
      if (value) {
        try {
          const anchorBtn = document.querySelector('[data-add-officer]');
          const base = anchorBtn?.getAttribute('data-update-url');
          const csrf = anchorBtn?.getAttribute('data-csrf');
          const url = base?.replace(/\d+$/, String(data.id));
          const resp = await fetch(url, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': csrf || '',
              'X-Requested-With': 'XMLHttpRequest',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              name: value.name,
              email: value.email,
              title: value.title,
              subtitle: value.subtitle,
              status: value.status,
            }),
            credentials: 'same-origin',
          });
          if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to update officer');
          }
          const updated = await resp.json();
          Object.assign(data, updated);
          renderOrUpdateViews(data);
          await ensureSwal();
          
          if (window.ThemeManager) {
            window.ThemeManager.showSuccess('Officer updated successfully');
          } else {
            window.Swal.fire(getSwalConfig({
              icon: 'success',
              title: 'Saved',
              timer: 900,
              showConfirmButton: false,
              width: isMobile() ? '90%' : '32rem',
            }));
          }
        } catch (e) {
          await ensureSwal();
          
          if (window.ThemeManager) {
            window.ThemeManager.showError(e.message || 'Unable to update officer');
          } else {
            window.Swal.fire(getSwalConfig({
              icon: 'error',
              title: 'Error',
              text: e.message || 'Unable to update officer',
            }));
          }
        }
      }
    };
  }

  // Handle mobile card updates
  function updateMobileCard(data) {
    if (!mobileCardsContainer) return;

    let card = mobileCardsContainer.querySelector(`[data-card-id="${data.id}"]`);
    const statusClass = data.status.toLowerCase() === 'active'
      ? 'bg-green-500/10 text-green-500'
      : 'bg-red-500/10 text-red-500';

    if (!card) {
      card = document.createElement('div');
      card.className = 'p-4 space-y-3';
      card.setAttribute('data-card-id', String(data.id));
      const avatarUrl = getOfficerAvatarUrl(data);
      card.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <div class="relative group h-10 w-10 rounded-full overflow-hidden ring-2 ring-blue-500/20 flex items-center justify-center cursor-pointer" data-avatar-upload data-user-id="${data.id}">
              <img src="${avatarUrl}" alt="${data.name}" class="h-full w-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
              <div class="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center" style="display:none;">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/><path d="M2 22s4-4 10-4 10 4 10 4-4 2-10 2-10-2-10-2z"/></svg>
              </div>
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-50" data-o-name></div>
              <div class="text-xs text-gray-500 dark:text-gray-400" data-o-email></div>
            </div>
          </div>
          <button type="button" data-edit-officer 
            class="bg-blue-50 dark:bg-blue-900/20 text-blue-500 p-2 rounded-md cursor-pointer" 
            aria-label="Edit officer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
              <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
              <path d="M16 5l3 3" />
            </svg>
          </button>
        </div>
        <div class="mt-2 pl-13">
          <div class="flex justify-between items-center">
            <div>
              <div class="font-medium text-white" data-o-title></div>
              <div class="text-xs text-gray-400" data-o-subtitle></div>
            </div>
            <span data-o-status class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"></span>
          </div>
        </div>
      `;
      mobileCardsContainer.appendChild(card);
    }

    // Update card content
    card.querySelector('[data-o-name]').textContent = data.name;
    card.querySelector('[data-o-email]').textContent = data.email;
    card.querySelector('[data-o-title]').textContent = data.title;
    card.querySelector('[data-o-subtitle]').textContent = data.subtitle;
    const statusEl = card.querySelector('[data-o-status]');
    statusEl.textContent = data.status;
    statusEl.className = `inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusClass}`;

    // Update avatar
    const avatarContainer = card.querySelector('[data-avatar-upload]');
    if (avatarContainer) {
      const avatarUrl = getOfficerAvatarUrl(data);
      const img = avatarContainer.querySelector('img');
      if (img) {
        img.src = avatarUrl;
        img.style.display = '';
      }
      const fallback = avatarContainer.querySelector('div[style*="display:none"]');
      if (fallback) {
        fallback.style.display = 'none';
      }
      avatarContainer.setAttribute('data-user-id', String(data.id));
    }

    // Add event listener to edit button
    const editBtn = card.querySelector('[data-edit-officer]');
    editBtn.onclick = async () => {
      const { value } = await openOfficerModal(data);
      if (value) {
        try {
          const anchorBtn = document.querySelector('[data-add-officer]');
          const base = anchorBtn?.getAttribute('data-update-url');
          const csrf = anchorBtn?.getAttribute('data-csrf');
          const url = base?.replace(/\d+$/, String(data.id));
          const resp = await fetch(url, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': csrf || '',
              'X-Requested-With': 'XMLHttpRequest',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              name: value.name,
              email: value.email,
              title: value.title,
              subtitle: value.subtitle,
              status: value.status,
            }),
            credentials: 'same-origin',
          });
          if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to update officer');
          }
          const updated = await resp.json();
          Object.assign(data, updated);
          renderOrUpdateViews(data);
          await ensureSwal();
          
          if (window.ThemeManager) {
            window.ThemeManager.showSuccess('Officer updated successfully');
          } else {
            window.Swal.fire(getSwalConfig({
              icon: 'success',
              title: 'Saved',
              timer: 900,
              showConfirmButton: false,
              width: isMobile() ? '90%' : '32rem',
            }));
          }
        } catch (e) {
          await ensureSwal();
          
          if (window.ThemeManager) {
            window.ThemeManager.showError(e.message || 'Unable to update officer');
          } else {
            window.Swal.fire(getSwalConfig({
              icon: 'error',
              title: 'Error',
              text: e.message || 'Unable to update officer',
            }));
          }
        }
      }
    };
  }

  // Initialize existing rows and cards from static DOM, then hydrate from backend
  function initializeExistingItems() {
    // Build a set of existing IDs from static rows (kept as-is)
    const existingIds = new Set();
    tableBody?.querySelectorAll('tr[data-row-id]')?.forEach(row => {
      const id = Number(row.getAttribute('data-row-id'));
      if (!Number.isNaN(id)) existingIds.add(id);
    });
    mobileCardsContainer?.querySelectorAll('[data-card-id]')?.forEach(card => {
      const id = Number(card.getAttribute('data-card-id'));
      if (!Number.isNaN(id)) existingIds.add(id);
    });

    // Populate in-memory officers from DOM (for local cache) and attach handlers by re-rendering
    officers = [];
    tableBody?.querySelectorAll('tr[data-row-id]')?.forEach(row => {
      const id = Number(row.getAttribute('data-row-id'));
      if (!Number.isNaN(id)) {
        const avatarImg = row.querySelector('[data-avatar-upload] img');
        officers.push({
          id,
          name: row.querySelector('[data-o-name]')?.textContent || '',
          email: row.querySelector('[data-o-email]')?.textContent || '',
          title: row.querySelector('[data-o-title]')?.textContent || '',
          subtitle: row.querySelector('[data-o-subtitle]')?.textContent || '',
          status: row.querySelector('[data-o-status]')?.textContent || 'Active',
          profile_picture_url: avatarImg ? avatarImg.src : null,
        });
      }
    });
    // If no table, try mobile cards
    if (officers.length === 0) {
      mobileCardsContainer?.querySelectorAll('[data-card-id]')?.forEach(card => {
        const id = Number(card.getAttribute('data-card-id'));
        if (!Number.isNaN(id)) {
          const avatarImg = card.querySelector('[data-avatar-upload] img');
          officers.push({
            id,
            name: card.querySelector('[data-o-name]')?.textContent || '',
            email: card.querySelector('[data-o-email]')?.textContent || '',
            title: card.querySelector('[data-o-title]')?.textContent || '',
            subtitle: card.querySelector('[data-o-subtitle]')?.textContent || '',
            status: card.querySelector('[data-o-status]')?.textContent || 'Active',
            profile_picture_url: avatarImg ? avatarImg.src : null,
          });
        }
      });
    }

    // Re-render existing DOM items so edit buttons get wired consistently
    officers.forEach(it => renderOrUpdateViews(it));
    // Hydrate from backend list and then start polling
    const listUrl = document.querySelector('[data-add-officer]')?.getAttribute('data-list-url');
    if (!listUrl) {
      // Set nextId from DOM only if no backend url configured
      let maxId = 0;
      officers.forEach(o => { if (Number(o.id) > maxId) maxId = Number(o.id); });
      nextId = Math.max(8, maxId + 1);
      // Add avatar click handlers even without backend
      attachAvatarClickHandlers();
      return;
    }

    fetch(listUrl, { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' })
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed to load officers');
        return r.json();
      })
      .then(items => {
        if (!Array.isArray(items)) return;
        // Render/update all items from backend to override static DOM and attach handlers
        items
          .sort((a, b) => Number(a.id) - Number(b.id))
          .forEach(it => {
            renderOrUpdateViews(it);
            existingIds.add(Number(it.id));
          });

        // Determine nextId as max known + 1, but at least 8
        let maxId = 0;
        existingIds.forEach(id => { if (id > maxId) maxId = id; });
        nextId = Math.max(8, maxId + 1);
        
        // Add avatar click handlers
        attachAvatarClickHandlers();
      })
      .finally(() => {
        startPollingList();
      });
  }

  // Flag to track if avatar click handler is attached
  let avatarHandlerAttached = false;

  /**
   * Attach event delegation for avatar click handlers
   */
  function attachAvatarClickHandlers() {
    // Only attach once using event delegation
    if (avatarHandlerAttached) return;
    avatarHandlerAttached = true;
    
    // Use event delegation for avatar clicks (single listener for all avatars)
    document.addEventListener('click', (e) => {
      const avatarUpload = e.target.closest('[data-avatar-upload]');
      if (avatarUpload) {
        e.preventDefault();
        e.stopPropagation();
        const userId = avatarUpload.getAttribute('data-user-id');
        if (!userId) return;
        
        // Find officer data
        const officer = getOfficerById(Number(userId));
        if (officer) {
          openOfficerAvatarUpload(Number(userId), officer.name);
        } else {
          // If officer not found in cache, try to get name from DOM
          const row = document.querySelector(`tr[data-row-id="${userId}"], [data-card-id="${userId}"]`);
          if (row) {
            const nameEl = row.querySelector('[data-o-name]');
            const officerName = nameEl ? nameEl.textContent : 'Officer';
            openOfficerAvatarUpload(Number(userId), officerName);
          }
        }
      }
    });
  }

  function startPollingList() {
    const listUrl = document.querySelector('[data-add-officer]')?.getAttribute('data-list-url');
    if (!listUrl) return;

    // Clear any existing timer
    if (pollTimerId) {
      clearInterval(pollTimerId);
      pollTimerId = null;
    }

    const poll = async () => {
      // Pause when tab not visible
      if (document.hidden) return;
      try {
        const resp = await fetch(listUrl, { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' });
        if (!resp.ok) throw new Error('Failed');
        const items = await resp.json();
        if (!Array.isArray(items)) return;

        // Update/append all items from backend; backend is the source of truth
        items
          .sort((a, b) => Number(a.id) - Number(b.id))
          .forEach(it => {
            renderOrUpdateViews(it);
          });

        // If success, tighten interval slightly (down to min)
        if (currentIntervalMs > minIntervalMs) {
          currentIntervalMs = Math.max(minIntervalMs, Math.floor(currentIntervalMs * 0.9));
          restartInterval();
        }
      } catch {
        // On error, back off up to max interval to avoid spamming 500s
        if (currentIntervalMs < maxIntervalMs) {
          currentIntervalMs = Math.min(maxIntervalMs, Math.floor(currentIntervalMs * 1.5));
          restartInterval();
        }
      }
    };

    function restartInterval() {
      if (pollTimerId) clearInterval(pollTimerId);
      pollTimerId = setInterval(poll, currentIntervalMs);
    }

    // First run immediately, then interval
    poll();
    restartInterval();

    // Pause/resume on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (pollTimerId) {
          clearInterval(pollTimerId);
          pollTimerId = null;
        }
      } else {
        if (!pollTimerId) {
          poll();
          restartInterval();
        }
      }
    });
  }

  // Initialize the page
  initializeExistingItems();
  
  // Attach avatar click handlers on page load
  attachAvatarClickHandlers();

  // Handle add officer button clicks
  addButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const { value } = await openOfficerModal({});
      if (value) {
        try {
          const url = btn.getAttribute('data-store-url');
          const csrf = btn.getAttribute('data-csrf');
          const resp = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': csrf || '',
              'X-Requested-With': 'XMLHttpRequest',
              'Accept': 'application/json',
            },
            credentials: 'same-origin',
            body: JSON.stringify({
              name: value.name,
              email: value.email,
              title: value.title,
              subtitle: value.subtitle,
              status: value.status,
            }),
          });
          if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to add officer');
          }
          const created = await resp.json();
          // Append the newly created officer returned by backend
          renderOrUpdateViews(created);
          // Update nextId to be at least created.id + 1
          nextId = Math.max(nextId, Number(created.id) + 1, 8);
          await ensureSwal();
          
          if (window.ThemeManager) {
            window.ThemeManager.showSuccess('Officer added successfully');
          } else {
            window.Swal.fire(getSwalConfig({
              icon: 'success',
              title: 'Officer added',
              timer: 900,
              showConfirmButton: false,
              width: isMobile() ? '90%' : '32rem',
            }));
          }
        } catch (e) {
          await ensureSwal();
          
          if (window.ThemeManager) {
            window.ThemeManager.showError(e.message || 'Unable to add officer');
          } else {
            window.Swal.fire(getSwalConfig({
              icon: 'error',
              title: 'Error',
              text: e.message || 'Unable to add officer',
            }));
          }
        }
      }
    });
  });

  // Handle window resize events for responsive behavior
  window.addEventListener('resize', () => {
    // Adjust modal styling based on screen size if it's open
    const activeModal = document.querySelector('.swal2-container');
    if (activeModal) {
      const modalContent = activeModal.querySelector('.swal2-popup');
      if (modalContent) {
        // Use standard responsive sizing - max-w-2xl
        if (isMobile()) {
          modalContent.style.width = '95%';
          modalContent.style.maxWidth = '95%';
        } else {
          modalContent.style.width = '42rem';
          modalContent.style.maxWidth = '42rem';
        }
        modalContent.style.padding = isMobile() ? '1rem' : '1.25rem';
      }
    }
  });
});
