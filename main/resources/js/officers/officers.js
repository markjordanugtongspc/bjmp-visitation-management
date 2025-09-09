// Officers page interactions: SweetAlert2 modal for edit/create
document.addEventListener('DOMContentLoaded', () => {
  // Get both desktop and mobile containers
  const tableBody = document.querySelector('#officers-table-body');
  const mobileCardsContainer = document.querySelector('#officers-cards-mobile');
  const addButtons = document.querySelectorAll('[data-add-officer]');
  
  // Detect if we're on mobile
  const isMobile = () => window.innerWidth < 640; // sm breakpoint in Tailwind

  function openOfficerModal(initial = {}) {
    const name = initial.name || '';
    const email = initial.email || '';
    const title = initial.title || '';
    const subtitle = initial.subtitle || '';
    const status = (initial.status || 'Active').toLowerCase();

    // Responsive width for the modal
    const width = isMobile() ? '90%' : '32rem';

    return window.Swal.fire({
      title: initial.id ? 'Edit Officer' : 'Add Officer',
      html: `
        <div class="space-y-3 text-left">
          <label class="block text-xs text-gray-300">Name</label>
          <input id="o-name" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2" value="${name.replace(/"/g,'&quot;')}" />
          <label class="block text-xs text-gray-300 mt-2">Email</label>
          <input id="o-email" type="email" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2" value="${email.replace(/"/g,'&quot;')}" />
          <label class="block text-xs text-gray-300 mt-2">Title</label>
          <input id="o-title" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2" value="${title.replace(/"/g,'&quot;')}" />
          <label class="block text-xs text-gray-300 mt-2">Subtitle</label>
          <input id="o-subtitle" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2" value="${subtitle.replace(/"/g,'&quot;')}" />
          <label class="block text-xs text-gray-300 mt-2">Status</label>
          <div class="relative">
            <select id="o-status" class="w-full appearance-none rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 pr-8">
              <option ${status==='active'?'selected':''} value="Active">Active</option>
              <option ${status==='inactive'?'selected':''} value="Inactive">Inactive</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
              </svg>
            </div>
          </div>
        </div>
      `,
      width: width,
      padding: isMobile() ? '1rem' : '1.25rem',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3B82F6', // Blue 500
      cancelButtonColor: '#111827', // Gray 900
      background: '#111827', // Gray 900
      color: '#F9FAFB', // Gray 50
      customClass: {
        container: 'swal-responsive-container',
        popup: 'swal-responsive-popup',
        content: 'swal-responsive-content',
      },
      didOpen: () => {
        // Add responsive behavior to the dropdown
        const statusSelect = document.getElementById('o-status');
        statusSelect.addEventListener('focus', () => {
          statusSelect.classList.add('ring-2', 'ring-blue-500');
        });
        statusSelect.addEventListener('blur', () => {
          statusSelect.classList.remove('ring-2', 'ring-blue-500');
        });
        
        // Add touch-friendly behavior for mobile
        if (isMobile()) {
          statusSelect.classList.add('text-base', 'py-3');
        }
      },
      preConfirm: () => {
        const v = {
          name: /** @type {HTMLInputElement} */(document.getElementById('o-name')).value.trim(),
          email: /** @type {HTMLInputElement} */(document.getElementById('o-email')).value.trim(),
          title: /** @type {HTMLInputElement} */(document.getElementById('o-title')).value.trim(),
          subtitle: /** @type {HTMLInputElement} */(document.getElementById('o-subtitle')).value.trim(),
          status: /** @type {HTMLSelectElement} */(document.getElementById('o-status')).value,
        };
        if (!v.name || !v.email) {
          window.Swal.showValidationMessage('Name and Email are required.');
          return false;
        }
        return v;
      },
    });
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
      row.innerHTML = `
        <td class="px-4 py-3 whitespace-nowrap">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-full bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/><path d="M2 22s4-4 10-4 10 4 10 4-4 2-10 2-10-2-10-2z"/></svg>
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

    // Add event listener to edit button
    const editBtn = row.querySelector('[data-edit-officer]');
    editBtn.onclick = async () => {
      const { value } = await openOfficerModal(data);
      if (value) {
        Object.assign(data, value);
        renderOrUpdateViews(data);
        window.Swal.fire({ 
          icon: 'success', 
          title: 'Saved', 
          timer: 900, 
          showConfirmButton: false, 
          background: '#111827', // Gray 900
          color: '#F9FAFB', // Gray 50
          width: isMobile() ? '90%' : '32rem',
        });
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
      card.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/><path d="M2 22s4-4 10-4 10 4 10 4-4 2-10 2-10-2-10-2z"/></svg>
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-50" data-o-name></div>
              <div class="text-xs text-gray-500 dark:text-gray-400" data-o-email></div>
            </div>
          </div>
          <button type="button" data-edit-officer 
            class="bg-blue-50 dark:bg-blue-900/20 text-blue-500 p-2 rounded-md" 
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
              <div class="font-medium" data-o-title></div>
              <div class="text-xs text-gray-500 dark:text-gray-400" data-o-subtitle></div>
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

    // Add event listener to edit button
    const editBtn = card.querySelector('[data-edit-officer]');
    editBtn.onclick = async () => {
      const { value } = await openOfficerModal(data);
      if (value) {
        Object.assign(data, value);
        renderOrUpdateViews(data);
        window.Swal.fire({ 
          icon: 'success', 
          title: 'Saved', 
          timer: 900, 
          showConfirmButton: false, 
          background: '#111827', // Gray 900
          color: '#F9FAFB', // Gray 50
          width: isMobile() ? '90%' : '32rem',
        });
      }
    };
  }

  // Initialize existing rows and cards
  function initializeExistingItems() {
    // Get all data from desktop rows
    const officers = [];
    
    tableBody?.querySelectorAll('tr[data-row-id]')?.forEach((row) => {
      const data = {
        id: Number(row.getAttribute('data-row-id')),
        name: row.querySelector('[data-o-name]')?.textContent?.trim() || '',
        email: row.querySelector('[data-o-email]')?.textContent?.trim() || '',
        title: row.querySelector('[data-o-title]')?.textContent?.trim() || '',
        subtitle: row.querySelector('[data-o-subtitle]')?.textContent?.trim() || '',
        status: row.querySelector('[data-o-status]')?.textContent?.trim() || 'Active',
      };
      officers.push(data);
    });
    
    // Update both desktop and mobile views for each officer
    officers.forEach(data => {
      renderOrUpdateViews(data);
    });
  }

  // Initialize the page
  initializeExistingItems();

  // Handle add officer button clicks
  addButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const { value } = await openOfficerModal({});
      if (value) {
        const newId = Date.now();
        renderOrUpdateViews({ id: newId, ...value });
        window.Swal.fire({ 
          icon: 'success', 
          title: 'Officer added', 
          timer: 900, 
          showConfirmButton: false, 
          background: '#111827', // Gray 900
          color: '#F9FAFB', // Gray 50
          width: isMobile() ? '90%' : '32rem',
        });
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
        modalContent.style.width = isMobile() ? '90%' : '32rem';
        modalContent.style.padding = isMobile() ? '1rem' : '1.25rem';
      }
    }
  });
});
