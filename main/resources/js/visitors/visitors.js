import 'flowbite';

// Minimal static + dynamic behavior for Searcher Visitors management
// - Renders a table and mobile cards
// - Filters by status and simple search
// - Accept/Decline actions using SweetAlert2

document.addEventListener('DOMContentLoaded', () => {
  /**
   * Sample data enriched to support the visitor details modal.
   * These fields reflect the visitors table (name, phone, email) and
   * include linked PDL basic info (name, birthday, age, kin/spouse where available).
   */
  let visitors = [
    {
      id: 1,
      visitor: 'Juan Dela Cruz',
      schedule: '2025-09-02 10:00',
      status: 'Pending',
      visitorDetails: {
        name: 'Juan Dela Cruz',
        phone: '+63 912 345 6789',
        email: 'juan.delacruz@example.com',
        relationship: 'Brother'
      },
      pdlDetails: {
        name: 'R. Santos',
        birthday: '2000-05-08',
        age: null, // computed if null
        parents: { father: 'Jose Santos', mother: 'Maria Santos' },
        spouse: 'N/A',
        nextOfKin: 'Ana Santos'
      }
    },
    {
      id: 2,
      visitor: 'Maria I.',
      schedule: '2025-09-02 13:30',
      status: 'Approved',
      visitorDetails: {
        name: 'Maria Isidro',
        phone: '+63 917 222 3344',
        email: 'maria.isidro@example.com',
        relationship: 'Wife'
      },
      pdlDetails: {
        name: 'J. Dizon',
        birthday: '1998-12-01',
        age: null,
        parents: { father: 'N/A', mother: 'N/A' },
        spouse: 'Maria Isidro',
        nextOfKin: 'N/A'
      }
    },
    {
      id: 3,
      visitor: 'A. Lopez',
      schedule: '2025-09-03 09:00',
      status: 'Rejected',
      visitorDetails: {
        name: 'Arman Lopez',
        phone: '+63 926 111 7788',
        email: 'arman.lopez@example.com',
        relationship: 'Cousin'
      },
      pdlDetails: {
        name: 'K. Reyes',
        birthday: '2003-03-15',
        age: null,
        parents: { father: 'N/A', mother: 'N/A' },
        spouse: 'N/A',
        nextOfKin: 'N/A'
      }
    }
  ];

  const tableBody = document.getElementById('visitors-table-body');
  const mobileCardsContainer = document.getElementById('visitors-cards-mobile');
  const statusFilter = document.getElementById('visitors-status-filter');
  const searchInput = document.getElementById('visitors-search');

  function render() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    const st = (statusFilter?.value || '').trim();

    const filtered = visitors.filter(v => {
      const matchesStatus = !st || v.status === st;
      const pdlName = (v.pdlDetails?.name || '').toLowerCase();
      const matchesQuery = !q || `${v.visitor} ${pdlName}`.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });

    renderTable(filtered);
    renderMobile(filtered);
    updateStats(filtered);
  }

  function updateStats(list) {
    const totalEl = document.getElementById('visitors-total');
    const approvedEl = document.getElementById('visitors-approved');
    const pendingEl = document.getElementById('visitors-pending');
    const rejectedEl = document.getElementById('visitors-rejected');

    const all = visitors.length;
    const approved = visitors.filter(v => v.status === 'Approved').length;
    const pending = visitors.filter(v => v.status === 'Pending').length;
    const rejected = visitors.filter(v => v.status === 'Rejected').length;

    if (totalEl) totalEl.textContent = String(all);
    if (approvedEl) approvedEl.textContent = String(approved);
    if (pendingEl) pendingEl.textContent = String(pending);
    if (rejectedEl) rejectedEl.textContent = String(rejected);
  }

  function renderTable(list) {
    if (!tableBody) return;

    if (!list.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-4 py-12 text-center text-gray-500 dark:text-gray-400">No visitors found</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = '';
    list.forEach(v => {
      tableBody.insertAdjacentHTML('beforeend', tableRowHtml(v));
    });
  }

  function renderMobile(list) {
    if (!mobileCardsContainer) return;

    if (!list.length) {
      mobileCardsContainer.innerHTML = `
        <div class="text-center py-8 text-gray-500 dark:text-gray-400">No visitors found</div>
      `;
      return;
    }

    mobileCardsContainer.innerHTML = '';
    list.forEach(v => {
      mobileCardsContainer.insertAdjacentHTML('beforeend', mobileCardHtml(v));
    });
  }

  function tableRowHtml(v) {
    const badge = statusBadge(v.status);
    return `
      <tr data-id="${v.id}">
        <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
          <button type="button" class="js-visitor-link text-blue-600 hover:underline cursor-pointer" data-id="${v.id}">${v.visitor}</button>
        </td>
        <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">${v.pdlDetails?.name || '—'}</td>
        <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">${v.schedule}</td>
        <td class="px-4 py-3">${badge}</td>
        <td class="px-4 py-3">
          <div class="flex items-center gap-2 justify-end">
            <button class="px-2 py-1 text-xs rounded bg-green-800 hover:bg-green-900 text-white cursor-pointer" data-action="approve">Approve</button>
            <button class="px-2 py-1 text-xs rounded bg-red-800 hover:bg-red-900 text-white cursor-pointer" data-action="decline">Decline</button>
          </div>
        </td>
      </tr>
    `;
  }

  function mobileCardHtml(v) {
    return `
      <div data-id="${v.id}" class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <div class="flex items-start justify-between">
          <div>
            <button type="button" class="js-visitor-link text-left text-sm font-medium text-blue-600 hover:underline cursor-pointer" data-id="${v.id}">${v.visitor}</button>
            <div class="text-xs text-gray-600 dark:text-gray-300 mt-0.5">PDL: ${v.pdlDetails?.name || '—'}</div>
            <div class="text-xs text-gray-600 dark:text-gray-300">${v.schedule}</div>
          </div>
          <div>${statusBadge(v.status)}</div>
        </div>
        <div class="mt-3 grid grid-cols-2 gap-2">
          <button class="w-full py-2 text-sm rounded bg-green-800 hover:bg-green-900 text-white font-medium cursor-pointer" data-action="approve">Approve</button>
          <button class="w-full py-2 text-sm rounded bg-red-800 hover:bg-red-900 text-white font-medium cursor-pointer" data-action="decline">Decline</button>
        </div>
      </div>
    `;
  }

  function statusBadge(status) {
    const map = {
      Approved: 'bg-green-500/10 text-green-500',
      Pending: 'bg-blue-500/10 text-blue-500',
      Rejected: 'bg-red-500/10 text-red-500',
    };
    const cls = map[status] || 'bg-gray-500/10 text-gray-500';
    return `<span class="inline-flex items-center rounded-full ${cls} px-2 py-0.5 text-[11px]">${status}</span>`;
  }

  // Event delegation for actions
  function handleAction(id, action) {
    const item = visitors.find(v => v.id === id);
    if (!item) return;

    if (!window.Swal) {
      // Fallback without SweetAlert2
      if (action === 'approve') item.status = 'Approved';
      if (action === 'decline') item.status = 'Rejected';
      render();
      return;
    }

    const isApprove = action === 'approve';
    window.Swal.fire({
      title: isApprove ? 'Approve request?' : 'Decline request?',
      text: isApprove ? 'This visitor will be marked as Approved.' : 'This visitor will be marked as Rejected.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: isApprove ? 'Approve' : 'Decline',
      cancelButtonText: 'Cancel',
      background: '#111827',
      color: '#F9FAFB',
      heightAuto: false,
      scrollbarPadding: false,
      buttonsStyling: false,
      customClass: {
        popup: 'm-0 w-[96vw] max-w-[96vw] sm:max-w-[32rem] p-5 !rounded-xl',
        confirmButton: 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium cursor-pointer',
        cancelButton: 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-medium ml-2 cursor-pointer'
      }
    }).then(res => {
      if (res.isConfirmed) {
        item.status = isApprove ? 'Approved' : 'Rejected';
        render();
        window.Swal.fire({
          title: 'Updated',
          text: `Visitor marked as ${item.status}.`,
          icon: 'success',
          timer: 1200,
          showConfirmButton: false,
          background: '#111827',
          color: '#F9FAFB',
          heightAuto: false,
          scrollbarPadding: false,
          customClass: {
            popup: 'm-0 w-[90vw] max-w-[24rem] p-4 !rounded-xl'
          }
        });
      }
    });
  }

  // Wire events: table and mobile containers
  document.addEventListener('click', (e) => {
    // Open modal on visitor name click
    const link = e.target.closest('.js-visitor-link');
    if (link) {
      const id = parseInt(link.getAttribute('data-id'));
      const item = visitors.find(v => v.id === id);
      if (item) openVisitorModal(item);
      return;
    }

    // Approve/Decline buttons
    const btn = e.target.closest('[data-action]');
    if (btn) {
      const row = e.target.closest('[data-id]');
      const id = row ? parseInt(row.getAttribute('data-id')) : null;
      if (!id) return;
      handleAction(id, btn.getAttribute('data-action'));
    }
  });

  if (statusFilter) statusFilter.addEventListener('change', render);
  if (searchInput) searchInput.addEventListener('input', () => {
    // simple debounce
    clearTimeout(searchInput.__debounceId);
    searchInput.__debounceId = setTimeout(render, 250);
  });

  // Hook: Open Manual Registration modal
  const openManualBtn = document.getElementById('open-manual-registration');
  if (openManualBtn) {
    openManualBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openManualRegistrationModal();
    });
  }

  // Initial render
  render();

  // Utilities and modal implementation
  function formatDateHuman(isoDate) {
    if (!isoDate) return 'N/A';
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return 'N/A'; }
  }

  function calcAge(isoDate) {
    if (!isoDate) return null;
    const d = new Date(isoDate);
    const diff = Date.now() - d.getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  }

  async function openVisitorModal(item) {
    let data = item;
    try {
      const resp = await fetch(`/api/visitors/${item.id}`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      if (resp.ok) {
        const json = await resp.json();
        if (json && (json.data || json.visitor)) {
          data = json.data || json.visitor;
        }
      }
    } catch (_) { /* fallback to local data */ }

    const v = data.visitorDetails || {};
    const p = data.pdlDetails || {};
    const pAge = p.age ?? calcAge(p.birthday);

    // 
    // Responsive Tailwind row: label left, value right (on mobile, value right-aligned, and text a bit larger)
    //
    const row = (label, value) => `
      <div class="grid grid-cols-5 gap-2 py-1 items-center">
        <div class="col-span-2 text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">${label}</div>
        <div class="col-span-3 text-xs sm:text-sm md:text-base text-gray-900 dark:text-gray-100 text-right sm:text-left">
          ${value || 'N/A'}
        </div>
      </div>`;

    const html = `
      <div class="text-left">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Visitor Information</h3>
        <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-3 mb-4 bg-white dark:bg-gray-900">
          ${row('Name:', v.name || data.visitor)}
          ${row('Email:', v.email)}
          ${row('Phone:', v.phone)}
          ${row('Relationship:', v.relationship)}
          ${row('Schedule:', data.schedule)}
          ${row('Status:', data.status)}
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">PDL Information</h3>
        <div class="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900">
          ${row('Name:', p.name)}
          ${row('Birthday:', formatDateHuman(p.birthday))}
          ${row('Age:', pAge ? `${pAge} Years Old` : 'N/A')}
          ${row('Father:', p.parents?.father || 'N/A')}
          ${row('Mother:', p.parents?.mother || 'N/A')}
          ${row('Spouse:', p.spouse || 'N/A')}
          ${row('Next of Kin:', p.nextOfKin || 'N/A')}
        </div>
      </div>
    `;

    if (window.Swal) {
      window.Swal.fire({
        title: 'Visitor & PDL Details',
        html,
        background: '#111827',
        color: '#F9FAFB',
        showConfirmButton: true,
        confirmButtonText: 'Close',
        heightAuto: false,
        scrollbarPadding: false,
        buttonsStyling: false,
        customClass: {
          popup: 'm-0 w-[96vw] max-w-[96vw] sm:max-w-[42rem] p-0 !rounded-2xl',
          // On mobile: scrollable content, but on desktop (sm and up): NO scrolling, fixed height
          htmlContainer: [
            // Mobile: allow scroll for tall modals
            'max-h-[70vh] overflow-y-auto p-5',
            // Desktop and up: no max height, no scroll
            'sm:max-h-none sm:overflow-y-visible',
          ].join(' '),
          confirmButton: 'mt-4 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium cursor-pointer'
        }
      });
      // Prevent scrolling in modal on desktop (sm and up)
      // (SweetAlert2 doesn't expose the dialog element directly, but with customClass the popup/htmlContainer are classed)
      setTimeout(() => {
        const popup = document.querySelector('.swal2-popup');
        const htmlC = popup ? popup.querySelector('.swal2-html-container') : null;
        if (htmlC) {
          // Remove scroll for desktop, keep mobile scroll
          if (window.innerWidth >= 640) { // sm breakpoint (640px)
            htmlC.style.maxHeight = 'none';
            htmlC.style.overflowY = 'visible';
          }
        }
      }, 10);
    } else {
      alert(`${v.name || data.visitor} → ${p.name || 'PDL'}\n${formatDateHuman(p.birthday)} (${pAge ?? 'N/A'})`);
    }
  }

  // ================================
  // Manual Registration (SweetAlert2 wizard)
  // Step 1: Search Inmate -> select
  // Step 2: Fill visitor details + upload photo
  // ================================
  async function openManualRegistrationModal() {
    if (!window.Swal) return;

    const searchStepHtml = `
      <div class="text-left">
        <h3 class="text-base sm:text-lg font-semibold text-gray-100 mb-3">Select PDL</h3>
        <div class="mb-3">
          <input id="mr-search-input" type="text" autocomplete="off" placeholder="Search by name or ID" class="w-full px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div id="mr-results" class="divide-y divide-gray-700 rounded-lg border border-gray-700 overflow-hidden bg-gray-900/60">
          <div class="p-4 text-sm text-gray-400">Type to search inmates...</div>
        </div>
      </div>`;

    const selected = { inmate: null };

    await window.Swal.fire({
      title: 'Manual Registration',
      html: searchStepHtml,
      background: '#111827',
      color: '#F9FAFB',
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Close',
      heightAuto: false,
      scrollbarPadding: false,
      buttonsStyling: false,
      customClass: {
        popup: 'm-0 w-[96vw] max-w-[96vw] sm:max-w-[40rem] p-5 !rounded-2xl',
        cancelButton: 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-medium cursor-pointer'
      },
      didOpen: () => {
        const input = document.getElementById('mr-search-input');
        const results = document.getElementById('mr-results');

        let tId = null;
        const doSearch = async (q) => {
          q = (q || '').trim();
          if (!q) {
            results.innerHTML = '<div class="p-4 text-sm text-gray-400">Type to search inmates...</div>';
            return;
          }
          results.innerHTML = '<div class="p-4 text-sm text-gray-400">Searching...</div>';
          const items = await searchInmates(q);
          if (!items.length) {
            results.innerHTML = '<div class="p-4 text-sm text-gray-400">No inmates found</div>';
            return;
          }
          results.innerHTML = items.map(inm => inmateResultItem(inm)).join('');
        };

        input?.addEventListener('input', () => {
          clearTimeout(tId);
          tId = setTimeout(() => doSearch(input.value), 250);
        });

        // Delegate click on green plus buttons
        results?.addEventListener('click', (e) => {
          const btn = e.target.closest('[data-pick-inmate]');
          if (!btn) return;
          const payload = btn.getAttribute('data-payload');
          try {
            const inmate = JSON.parse(payload);
            selected.inmate = inmate;
            // Move to step 2
            window.Swal.close();
            setTimeout(() => openVisitorFormStep(inmate), 10);
          } catch (_) {}
        });

        // Autofocus
        input?.focus();
      }
    });
  }

  function inmateResultItem(inm) {
    const name = getInmateDisplayName(inm);
    const payload = encodeURIComponent(JSON.stringify({ id: inm.id, name }));
    return `
      <div class="flex items-center justify-between p-3 hover:bg-gray-800/60">
        <div>
          <div class="text-sm text-gray-100 font-medium">${name}</div>
          <div class="text-xs text-gray-400">ID: ${String(inm.id).padStart(4,'0')}</div>
        </div>
        <button type="button" data-pick-inmate data-payload="${decodeURIComponent(payload)}" class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 text-white cursor-pointer" title="Select">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14m-7-7h14"/></svg>
        </button>
      </div>`;
  }

  async function searchInmates(q) {
    try {
      const url = `/api/inmates/search?query=${encodeURIComponent(q)}`;
      const resp = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      if (!resp.ok) return [];
      const json = await resp.json();
      // Normalize to array of inmates (controller returns transform keys)
      const items = Array.isArray(json) ? json : (json.data || json.items || []);
      return items.map(i => ({ id: i.id, first_name: i.firstName, last_name: i.lastName, name: i.fullName }));
    } catch {
      return [];
    }
  }

  function getInmateDisplayName(inm) {
    if (inm.name) return inm.name;
    const f = inm.first_name || '';
    const l = inm.last_name || '';
    return `${f} ${l}`.trim() || `ID ${inm.id}`;
  }

  async function openVisitorFormStep(inmate) {
    const html = `
      <div class="text-left">
        <h3 class="text-base sm:text-lg font-semibold text-gray-100 mb-3">Visitor Details</h3>
        <div class="mb-4 text-sm text-gray-300">Registering visit for <span class="font-semibold text-white">${inmate.name}</span> (ID ${String(inmate.id).padStart(4,'0')})</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Full Name</label>
            <input id="mr-v-name" type="text" class="w-full px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Juan Dela Cruz" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Relationship</label>
            <input id="mr-v-rel" type="text" class="w-full px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Brother / Wife" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Email</label>
            <input id="mr-v-email" type="email" class="w-full px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="name@example.com" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Phone</label>
            <input id="mr-v-phone" type="tel" class="w-full px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+63 ..." />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Schedule (optional)</label>
            <input id="mr-v-sched" type="datetime-local" class="w-full px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Photo (optional)</label>
            <input id="mr-v-photo" type="file" accept="image/*" class="block w-full text-xs text-gray-300 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
          </div>
        </div>
      </div>`;

    await window.Swal.fire({
      title: 'Manual Registration',
      html,
      background: '#111827',
      color: '#F9FAFB',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Register',
      cancelButtonText: 'Back',
      heightAuto: false,
      scrollbarPadding: false,
      buttonsStyling: false,
      customClass: {
        popup: 'm-0 w-[96vw] max-w-[96vw] sm:max-w-[42rem] p-5 !rounded-2xl',
        confirmButton: 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium cursor-pointer',
        cancelButton: 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-medium ml-2 cursor-pointer'
      },
      preConfirm: async () => {
        const name = document.getElementById('mr-v-name').value.trim();
        const rel = document.getElementById('mr-v-rel').value.trim();
        const email = document.getElementById('mr-v-email').value.trim();
        const phone = document.getElementById('mr-v-phone').value.trim();
        const sched = document.getElementById('mr-v-sched').value;
        const photo = document.getElementById('mr-v-photo').files[0] || null;

        if (!name) {
          window.Swal.showValidationMessage('Visitor full name is required');
          return false;
        }

        // Prepare FormData for backend create; fallback to local state
        const form = new FormData();
        form.append('inmate_id', String(inmate.id));
        form.append('name', name);
        if (rel) form.append('relationship', rel);
        if (email) form.append('email', email);
        if (phone) form.append('phone', phone);
        if (sched) form.append('schedule', sched);
        if (photo) form.append('photo', photo);

        const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
        let created = null;
        try {
          const resp = await fetch('/api/visitors', {
            method: 'POST',
            headers: csrf ? { 'X-CSRF-TOKEN': csrf } : undefined,
            body: form
          });
          if (resp.ok) {
            created = await resp.json();
          }
        } catch (_) {}

        if (!created) {
          // Fallback: update UI only
          const id = Date.now();
          visitors.push({
            id,
            visitor: name,
            schedule: sched || new Date().toISOString().slice(0,16).replace('T',' '),
            status: 'Pending',
            visitorDetails: { name, phone, email, relationship: rel },
            pdlDetails: { name: inmate.name, birthday: null, age: null, parents: { father: 'N/A', mother: 'N/A' }, spouse: 'N/A', nextOfKin: 'N/A' }
          });
          render();
        }
        return true;
      }
    });
  }
});
