/*
 * Admin permissions UI logic
 * - Uses SweetAlert2 to collect new permission name
 * - Stores pending permissions in cookies (JSON)
 * - Updates DOM (mobile and desktop views) responsively
 * - Submits all changes to backend via fetch POST
 */

/* Cookie helpers */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return null;
}

function setCookie(name, value, days = 3) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function loadPendingPermissions() {
  try {
    return JSON.parse(getCookie('bjmp_pending_permissions') || '[]');
  } catch (_) {
    return [];
  }
}

function savePendingPermissions(list) {
  setCookie('bjmp_pending_permissions', JSON.stringify(list));
}

/* DOM refs */
const addBtn = document.querySelector('[data-add-permission]');
const saveBtn = document.querySelector('[data-save-permissions]');
const desktopTbody = document.querySelector('[data-permissions-desktop-root]');
const mobileRoot = document.querySelector('[data-permissions-mobile-root]');
const desktopStaticTbody = document.querySelector('[data-permissions-desktop-static]');
const mobileStaticRoot = document.querySelector('[data-permissions-mobile-static]');
const pager = document.querySelector('[data-permissions-pagination]');
const pagerMobile = document.querySelector('[data-permissions-pagination-mobile]');

const PAGE_SIZE = 6; // show 6 per page
let currentPage = 1; // UI page (1 = static page)
let totalPages = 1;  // UI total pages (1 + dynamic pages)
let dynamicTotalPages = 0; // pages coming from backend

/* Initial fetch to populate from DB */
function toHumanLabel(key) {
  if (!key) return '';
  // e.g., 'permission.create' -> 'Permission Create' then refine known terms
  const parts = key.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1));
  const raw = parts.join(' ');
  return raw
    .replace(/\bCreate\b/g, 'Add')
    .replace(/\bUpdate\b/g, 'Edit')
    .replace(/\bDelete\b/g, 'Delete')
    .replace(/\bList\b/g, 'List');
}

async function hydrateFromBackend(page = 1) {
  // Page 1 is reserved for static sample rows — no fetch
  if (page === 1) {
    currentPage = 1;
    // Show static containers, hide dynamic
    desktopStaticTbody && desktopStaticTbody.classList.remove('hidden');
    mobileStaticRoot && mobileStaticRoot.classList.remove('hidden');
    desktopTbody && desktopTbody.classList.add('hidden');
    mobileRoot && mobileRoot.classList.add('hidden');
    renderPagination();
    return;
  }

  try {
    const backendPage = page - 1; // shift: UI page 2 => backend page 1
    const res = await fetch(`/admin/permissions?min_id=23&page=${backendPage}&per_page=${PAGE_SIZE}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) return;
    const json = await res.json();
    const fromDb = Array.isArray(json.permissions?.data) ? json.permissions.data : (Array.isArray(json.permissions) ? json.permissions : []);
    dynamicTotalPages = Number(json.permissions?.last_page || json.last_page || 0) || 0;
    totalPages = 1 + dynamicTotalPages; // UI pages include static page 1
    currentPage = page;
    // Render each permission (avoid duplicates with cookie pending list)
    const pending = loadPendingPermissions();
    const existing = new Set(pending.map(p => p.name));
    // Clear dynamic containers
    // Toggle visibility: hide static, show dynamic
    desktopStaticTbody && desktopStaticTbody.classList.add('hidden');
    mobileStaticRoot && mobileStaticRoot.classList.add('hidden');
    if (desktopTbody) { desktopTbody.innerHTML = ''; desktopTbody.classList.remove('hidden'); }
    if (mobileRoot) { mobileRoot.innerHTML = ''; mobileRoot.classList.remove('hidden'); }

    fromDb.forEach(p => {
      if (existing.has(p.name)) return;
      const label = toHumanLabel(p.name);
      renderDesktopRow(label);
      renderMobileCard(label);
    });

    renderPagination();
  } catch (_) {
    // ignore
  }
}
// Fetch only meta to build pagination; keep page 1 (static) visible
async function fetchDynamicMeta() {
  try {
    const res = await fetch(`/admin/permissions?min_id=23&page=1&per_page=${PAGE_SIZE}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) { renderPagination(); return; }
    const json = await res.json();
    dynamicTotalPages = Number(json.permissions?.last_page || json.last_page || 0) || 0;
    totalPages = 1 + dynamicTotalPages;
    renderPagination();
  } catch (_) {
    renderPagination();
  }
}

// Initial state: show static, build pagination from meta
desktopStaticTbody && desktopStaticTbody.classList.remove('hidden');
mobileStaticRoot && mobileStaticRoot.classList.remove('hidden');
desktopTbody && desktopTbody.classList.add('hidden');
mobileRoot && mobileRoot.classList.add('hidden');
fetchDynamicMeta();

function renderPageButton(num, active = false) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `inline-flex items-center justify-center h-8 min-w-8 px-3 rounded-md border text-sm ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`;
  btn.textContent = num;
  btn.addEventListener('click', () => {
    if (num === currentPage) return;
    gotoPage(num);
  });
  return btn;
}

function renderPagination() {
  const containers = [pager, pagerMobile];
  containers.forEach(root => {
    if (!root) return;
    root.innerHTML = '';
    if (totalPages <= 1) { return; }

    // Prev
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'inline-flex items-center justify-center h-8 w-8 rounded-md border bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800';
    prev.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>';
    prev.disabled = currentPage === 1;
    prev.addEventListener('click', () => currentPage > 1 && gotoPage(currentPage - 1));
    root.appendChild(prev);

    // Pages (compact)
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, start + 2);
    for (let n = start; n <= end; n += 1) {
      root.appendChild(renderPageButton(n, n === currentPage));
    }

    // Next
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'inline-flex items-center justify-center h-8 w-8 rounded-md border bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800';
    next.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8.25 4.5L15.75 12l-7.5 7.5"/></svg>';
    next.disabled = currentPage === totalPages;
    next.addEventListener('click', () => currentPage < totalPages && gotoPage(currentPage + 1));
    root.appendChild(next);
  });
}

function gotoPage(num) {
  if (num === 1) {
    hydrateFromBackend(1);
  } else {
    hydrateFromBackend(num);
  }
}

/* Renders a new row in desktop table */
function renderDesktopRow(label) {
  if (!desktopTbody) return;
  const tr = document.createElement('tr');
  tr.setAttribute('data-perm-label', label);
  tr.setAttribute('data-dynamic', 'true');
  tr.innerHTML = `
    <td class="px-4 py-3 whitespace-nowrap">
      <div class="flex items-center justify-between">
        <span>${label}</span>
        <span class="inline-flex items-center gap-3 text-blue-500/80">
          <div class="group relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 cursor-pointer" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">Edit</span>
          </div>
          <div class="group relative" data-perm-action="delete" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 cursor-pointer" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3a1 1 0 00-1 1v1H5.5a1 1 0 100 2H6v11a2 2 0 002 2h8a2 2 0 002-2V7h.5a1 1 0 100-2H16V4a1 1 0 00-1-1H9zm2 2h4v1h-4V5zm-1 4a1 1 0 112 0v7a1 1 0 11-2 0V9zm5 0a1 1 0 112 0v7a1 1 0 11-2 0V9z"/></svg>
            <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">Delete</span>
          </div>
        </span>
      </div>
    </td>
    ${['Admin','Warden'].map(() => `
      <td class="px-4 py-3 text-center">
        <label class="relative inline-flex cursor-pointer items-center">
          <input type="checkbox" class="peer sr-only" />
          <div class="peer h-5 w-10 rounded-full bg-gray-200 dark:bg-gray-700 shadow-inner after:absolute after:-top-0.5 after:left-0.5 after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow-md after:transition-all after:duration-300 after:ease-in-out after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-4 peer-focus:outline peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-blue-400/40"></div>
        </label>
      </td>`).join('')}
  `;

  // Insert Super Admin lock column at index 1
  const lockTd = document.createElement('td');
  lockTd.className = 'px-4 py-3 text-center';
  lockTd.innerHTML = `
    <label class="relative inline-flex cursor-not-allowed items-center" title="Locked for Super Admin">
      <input type="checkbox" class="peer sr-only" checked disabled aria-disabled="true"/>
      <div class="peer h-5 w-10 rounded-full bg-blue-500/90 shadow-inner after:absolute after:-top-0.5 after:left-0.5 after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow-md after:transition-all after:duration-300 after:content-[''] after:translate-x-4"></div>
    </label>`;

  tr.appendChild(lockTd);
  desktopTbody.appendChild(tr);
}

/* Renders a new card in mobile view */
function renderMobileCard(label) {
  if (!mobileRoot) return;
  const card = document.createElement('div');
  card.className = 'rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3';
  card.setAttribute('data-perm-label', label);
  card.setAttribute('data-dynamic', 'true');
  card.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="text-sm font-medium text-gray-900 dark:text-gray-50">${label}</div>
      <span class="inline-flex items-center gap-3 text-blue-500/80">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 cursor-pointer" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 cursor-pointer" viewBox="0 0 24 24" fill="currentColor"><path d="M16 9v10H8V9h8m-1.5-6h-5L7 5.5V7h10V5.5L14.5 3z"/></svg>
        <svg xmlns="http://www.w3.org/2000/svg" data-perm-action="delete" class="h-4 w-4 cursor-pointer" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3a1 1 0 00-1 1v1H5.5a1 1 0 100 2H6v11a2 2 0 002 2h8a2 2 0 002-2V7h.5a1 1 0 100-2H16V4a1 1 0 00-1-1H9zm2 2h4v1h-4V5zm-1 4a1 1 0 112 0v7a1 1 0 11-2 0V9zm5 0a1 1 0 112 0v7a1 1 0 11-2 0V9z"/></svg>
      </span>
    </div>
    <div class="mt-3 grid grid-cols-3 gap-2">
      ${['Super Admin','Admin','Warden'].map((role, idx) => `
        <div class="flex flex-col items-center justify-between rounded-md border border-gray-200 dark:border-gray-800 px-2 py-2">
          <span class="text-xs text-gray-600 dark:text-gray-300 mb-1">${role}</span>
          ${idx === 0
            ? `<label class="relative inline-flex cursor-not-allowed items-center" title="Locked for Super Admin">
                 <input type="checkbox" class="peer sr-only" checked disabled aria-disabled="true" />
                 <div class="peer h-5 w-10 rounded-full bg-blue-500/90 shadow-inner after:absolute after:-top-0.5 after:left-0.5 after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow-md after:transition-all after:duration-300 after:content-[''] after:translate-x-4"></div>
               </label>`
            : `<label class="relative inline-flex cursor-pointer items-center">
                 <input type="checkbox" class="peer sr-only" />
                 <div class="peer h-5 w-10 rounded-full bg-gray-200 dark:bg-gray-700 shadow-inner after:absolute after:-top-0.5 after:left-0.5 after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow-md after:transition-all after:duration-300 after:ease-in-out after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-4 peer-focus:outline peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-blue-400/40"></div>
               </label>`}
        </div>`).join('')}
    </div>
  `;
  mobileRoot.appendChild(card);
}

/* Add permission flow */
if (addBtn && window.Swal) {
  addBtn.addEventListener('click', async () => {
    const { value: formValues } = await window.Swal.fire({
      title: 'New Permission',
      html: `
        <div class="text-left">
          <label class="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Permission label (human-readable)</label>
          <input id="swal-label" type="text" class="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 mb-3" placeholder="e.g. Export Visitation CSV" />
          <label class="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Permission key (to store)</label>
          <input id="swal-key" type="text" class="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2" placeholder="e.g. visitation.export.csv" />
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#111827',
      backdrop: true,
      background: '#0F172A',
      color: '#F9FAFB',
      customClass: {
        popup: 'rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
        confirmButton: 'bg-brand-button-primary-light hover:bg-brand-button-hover-light dark:bg-brand-button-primary-dark dark:hover:bg-brand-button-hover-dark text-white px-4 py-2 rounded-lg',
        cancelButton: 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg ml-2',
      },
      preConfirm: () => {
        const label = document.getElementById('swal-label').value.trim();
        const key = document.getElementById('swal-key').value.trim();
        if (!label) {
          window.Swal.showValidationMessage('Permission label is required');
          return false;
        }
        if (!key) {
          window.Swal.showValidationMessage('Permission key is required');
          return false;
        }
        return { label, key };
      },
    });

    if (!formValues) return;
    const { label: permissionLabel, key: permissionKey } = formValues;

    // Save temporarily in cookies
    const pending = loadPendingPermissions();
    pending.push({ name: permissionKey, label: permissionLabel, guard_name: 'web' });
    savePendingPermissions(pending);

    // Update UI
    renderDesktopRow(permissionLabel);
    renderMobileCard(permissionLabel);

    window.Swal.fire({
      icon: 'success',
      title: 'Permission added',
      text: 'Saved temporarily. Click Save to persist to database.',
      timer: 1400,
      showConfirmButton: false,
      background: '#0F172A',
      color: '#F9FAFB'
    });
  });
}

/* Save to backend */
if (saveBtn) {
  saveBtn.addEventListener('click', async () => {
    const payload = {
      permissions: loadPendingPermissions().map(p => ({ name: p.name, guard_name: p.guard_name || 'web' })),
    };
    try {
      const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
      const res = await fetch('/admin/permissions/bulk-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token,
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Request failed');
      const json = await res.json();
      console.log('Bulk sync success:', json); // Confirm backend is working
      savePendingPermissions([]);
      window.Swal && window.Swal.fire({ 
        icon: 'success', 
        title: 'Saved', 
        text: 'Permissions persisted.',
        background: '#0F172A',
        color: '#F9FAFB'
      });
    } catch (err) {
      window.Swal && window.Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: 'Failed to save permissions.',
        background: '#0F172A',
        color: '#F9FAFB'
      });
    }
  });
}

/* Delete handlers (event delegation) */
function removePermissionByLabel(label) {
  // Remove desktop row
  const tr = desktopTbody && desktopTbody.querySelector(`tr[data-perm-label="${CSS.escape(label)}"][data-dynamic="true"]`);
  tr && tr.remove();
  // Remove mobile card
  const card = mobileRoot && mobileRoot.querySelector(`div[data-perm-label="${CSS.escape(label)}"][data-dynamic="true"]`);
  card && card.remove();
  // Update cookies
  const list = loadPendingPermissions().filter(p => p.name !== label);
  savePendingPermissions(list);
}

desktopTbody && desktopTbody.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-perm-action="delete"]');
  if (!btn) return;
  const row = btn.closest('tr');
  const label = row && row.getAttribute('data-perm-label');
  if (!label) return;
  removePermissionByLabel(label);
});

mobileRoot && mobileRoot.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-perm-action="delete"]');
  if (!btn) return;
  const card = btn.closest('[data-perm-label]');
  const label = card && card.getAttribute('data-perm-label');
  if (!label) return;
  removePermissionByLabel(label);
});


