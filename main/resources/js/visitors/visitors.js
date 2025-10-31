import 'flowbite';
import { openVisitationRequestModal } from './visitor-request-modal.js';

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
  let visitors = [];

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

    const normalize = (s) => {
      if (typeof s === 'number') return s === 1 ? 'Approved' : (s === 0 ? 'Declined' : 'Pending');
      if (s === 'Rejected' || s === 'Denied') return 'Declined';
      return s || 'Pending';
    };

    const all = visitors.length;
    const approved = visitors.filter(v => normalize(v.status) === 'Approved').length;
    const pending = visitors.filter(v => normalize(v.status) === 'Pending').length;
    const declined = visitors.filter(v => normalize(v.status) === 'Declined').length;

    if (totalEl) totalEl.textContent = String(all);
    if (approvedEl) approvedEl.textContent = String(approved);
    if (pendingEl) pendingEl.textContent = String(pending);
    if (rejectedEl) rejectedEl.textContent = String(declined);
  }

  function renderTable(list) {
    if (!tableBody) return;

    if (!list.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-32 py-32 text-center text-gray-500 dark:text-gray-400">No visitors found</td>
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
    const reasonForVisit = v.reason_for_visit || 'N/A';
    return `
      <tr data-id="${v.id}">
        <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
          <button type="button" class="js-visitor-link text-blue-600 hover:underline cursor-pointer" data-id="${v.id}">${v.visitor}</button>
        </td>
        <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">${v.pdlDetails?.name || '—'}</td>
        <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">${v.schedule}</td>
        <td class="px-3 py-3 text-sm text-gray-700 dark:text-gray-200">${reasonForVisit}</td>
        <td class="px-3 py-3">${badge}</td>
        <td class="px-3 py-3">
          <div class="flex items-center gap-2 justify-end">
            <button class="px-2 py-1 text-xs rounded bg-green-800 hover:bg-green-900 text-white cursor-pointer" data-action="approve">Approve</button>
            <button class="px-2 py-1 text-xs rounded bg-red-800 hover:bg-red-900 text-white cursor-pointer" data-action="decline">Decline</button>
          </div>
        </td>
      </tr>
    `;
  }

  function mobileCardHtml(v) {
    const reasonForVisit = v.reason_for_visit || 'N/A';
    return `
      <div data-id="${v.id}" class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <div class="flex items-start justify-between">
          <div>
            <button type="button" class="js-visitor-link text-left text-sm font-medium text-blue-600 hover:underline cursor-pointer" data-id="${v.id}">${v.visitor}</button>
            <div class="text-xs text-gray-600 dark:text-gray-300 mt-0.5">PDL: ${v.pdlDetails?.name || '—'}</div>
            <div class="text-xs text-gray-600 dark:text-gray-300">${v.schedule}</div>
            <div class="text-xs text-gray-600 dark:text-gray-300 mt-0.5">Reason: ${reasonForVisit}</div>
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
    let label = status;
    if (typeof status === 'number') {
      label = status === 1 ? 'Approved' : (status === 0 ? 'Declined' : 'Pending');
    }
    if (label === 'Rejected' || label === 'Denied') label = 'Declined';
    const map = {
      Approved: 'bg-green-500/10 text-green-500',
      Pending: 'bg-blue-500/10 text-blue-500',
      Declined: 'bg-red-500/10 text-red-500',
    };
    const cls = map[label] || 'bg-gray-500/10 text-gray-500';
    return `<span class="inline-flex items-center rounded-full ${cls} px-2 py-0.5 text-[11px]">${label}</span>`;
  }

  // Event delegation for actions
  function handleAction(id, action) {
    const item = visitors.find(v => v.id === id);
    if (!item) return;

    if (!window.Swal) {
      // Fallback without SweetAlert2
      if (action === 'approve') item.status = 'Approved';
      if (action === 'decline') item.status = 'Declined';
      render();
      return;
    }

    const isApprove = action === 'approve';
    window.Swal.fire({
      title: `<span class="text-white">${isApprove ? 'Approve request?' : 'Decline request?'}</span>`,
      text: isApprove ? 'This visitor will be marked as Approved.' : 'This visitor will be marked as Declined.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: isApprove ? 'Approve' : 'Decline',
      cancelButtonText: 'Cancel',
      background: '#111827',
      heightAuto: false,
      scrollbarPadding: false,
      buttonsStyling: false,
      customClass: {
        popup: 'm-0 w-[96vw] max-w-[96vw] sm:max-w-[32rem] p-5 !rounded-xl',
        title: 'text-white', // Ensure title text is white
        confirmButton: 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium cursor-pointer',
        cancelButton: 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-white dark:text-gray-100 text-sm font-medium ml-2 cursor-pointer'
      }
    }).then(res => {
      if (res.isConfirmed) {
        (async () => {
          try {
            let VisitorApiClient;
            try {
              ({ default: VisitorApiClient } = await import('./components/visitorClient.js'));
            } catch (_) {
              throw new Error('Unable to load API client');
            }
            const api = new VisitorApiClient();
            const newStatus = isApprove ? 1 : 0;
            await api.updateStatus(item.id, newStatus);
            item.status = isApprove ? 'Approved' : 'Declined';
            render();
            window.Swal.fire({
              title: '<span class="text-white">Updated</span>',
              text: `Visitor marked as ${item.status}.`,
              icon: 'success',
              timer: 1200,
              showConfirmButton: false,
              background: '#111827',
              color: '#FFFFFF',
              heightAuto: false,
              scrollbarPadding: false,
              customClass: {
                popup: 'm-0 w-[90vw] max-w-[24rem] p-4 !rounded-xl',
                title: 'text-white'
              }
            });
          } catch (e) {
            window.Swal.fire({
              title: '<span class="text-white">Update failed</span>',
              text: 'Could not update status. Please try again.',
              icon: 'error',
              background: '#111827',
              color: '#FFFFFF',
              heightAuto: false,
              scrollbarPadding: false,
              customClass: {
                popup: 'm-0 w-[90vw] max-w-[24rem] p-4 !rounded-xl',
                title: 'text-white'
              }
            });
          }
        })();
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
  // Then load backend visitors and merge into the list
  loadBackendVisitors();
  
  // Set up auto-reload every 30 seconds
  setupAutoReload();

  // Utilities and modal implementation
  async function loadBackendVisitors(page = 1) {
    try {
      // Fetch visitation requests (logs) with 5 items per page
      const resp = await fetch(`/api/visitation-requests?per_page=5&page=${page}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' }
      });
      if (!resp.ok) return;
      const json = await resp.json();
      
      if (!json.success) {
        console.warn('API returned error:', json.message);
        return;
      }
      
      const rows = Array.isArray(json?.data) ? json.data : [];
      const meta = json?.meta || {};

      const backendItems = rows.map(r => {
        const rawStatus = r.status;
        const friendlyStatus = typeof rawStatus === 'number'
          ? (rawStatus === 1 ? 'Approved' : (rawStatus === 0 ? 'Declined' : 'Pending'))
          : ((rawStatus === 'Rejected' || rawStatus === 'Denied') ? 'Declined' : (rawStatus || 'Pending'));
        
        return {
          id: r.id,
          visitor_id: r.visitor_id,
          visitor: r.visitor || 'N/A',
          schedule: r.schedule || 'N/A',
          reason_for_visit: r.reason_for_visit || 'N/A',
          status: friendlyStatus,
          time_in: r.time_in,
          time_out: r.time_out,
          visitorDetails: r.visitorDetails || {
            name: r.visitor || 'N/A',
            phone: 'N/A',
            email: 'N/A',
            relationship: 'N/A'
          },
          pdlDetails: r.pdlDetails || {
            name: 'N/A',
            birthday: null,
            age: null,
            parents: { father: 'N/A', mother: 'N/A' },
            spouse: 'N/A',
            nextOfKin: 'N/A'
          },
          inmate: r.inmate || {}
        };
      });

      visitors = backendItems;
      render();
      
      // Update statistics after loading
      updateStatistics();
      
      // Store pagination info for potential future use
      window.visitationPagination = meta;
    } catch (e) {
      console.warn('Failed to load visitation requests from backend', e);
    }
  }
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
    // Since we're working with visitation requests, use the local data directly
    // No need to fetch from /api/visitors/ as we already have all the data from visitation_logs
    // The item already contains visitorDetails, pdlDetails, and reason_for_visit

    // Support both local shape (visitorDetails/pdlDetails) and backend shape (name, inmate)
    const inmateBk = data.inmate || {};
    const v = data.visitorDetails || {
      name: data.name,
      email: data.email,
      phone: data.phone,
      relationship: data.relationship,
    };
    const p = data.pdlDetails || {
      name: (inmateBk.first_name && inmateBk.last_name)
        ? `${inmateBk.first_name} ${inmateBk.last_name}`
        : (inmateBk.full_name || inmateBk.fullName || inmateBk.name || 'N/A'),
      birthday: inmateBk.birthdate || inmateBk.date_of_birth || inmateBk.dateOfBirth || null,
      age: inmateBk.birthdate ? calcAge(inmateBk.birthdate) : null,
      parents: { father: 'N/A', mother: 'N/A' },
      spouse: inmateBk.civil_status === 'Married' ? 'Married' : 'N/A',
      nextOfKin: 'N/A'
    };
    const scheduleDisp = data.schedule || 'N/A';
    const statusRaw = data.status;
    const statusLabel = typeof statusRaw === 'number'
      ? (statusRaw === 1 ? 'Approved' : (statusRaw === 0 ? 'Declined' : 'Pending'))
      : ((statusRaw === 'Rejected' || statusRaw === 'Denied') ? 'Declined' : (statusRaw || 'Pending'));
    const pAge = p.age ?? calcAge(p.birthday);

    let fatherVal = p.parents?.father || 'N/A';
    let motherVal = p.parents?.mother || 'N/A';
    let spouseVal = p.spouse || 'N/A';
    if (v.relationship) {
      const rl = String(v.relationship).toLowerCase();
      if (rl === 'mother') motherVal = v.name || motherVal;
      if (rl === 'father') fatherVal = v.name || fatherVal;
      if (rl === 'wife/husband' || rl === 'wife' || rl === 'husband') spouseVal = v.name || spouseVal;
    }

    // Get time in/out data
    const timeIn = data.time_in || null;
    const timeOut = data.time_out || null;
    
    // Format time function
    const formatTime = (timestamp) => {
      if (!timestamp) return null;
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };
    
    const timeInFormatted = formatTime(timeIn);
    const timeOutFormatted = formatTime(timeOut);
    
    // Time In/Time Out buttons for desktop Actions column
    const desktopActionButtons = statusLabel === 'Approved' ? `
      <div class="flex items-center gap-2">
        <!-- Time In Button -->
        <button 
          data-time-in-btn
          data-visitor-id="${data.id || ''}"
          class="group relative inline-flex items-center justify-center w-10 h-10 rounded-md bg-green-600/10 hover:bg-green-600/20 border border-green-600/30 transition-colors ${timeIn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
          ${timeIn ? 'disabled' : ''}
          title="Record Time In"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><rect width="24" height="24" fill="none"/><path fill="#1dca00" d="m12 11.6l2.5 2.5q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-2.8-2.8q-.15-.15-.225-.337T10 11.975V8q0-.425.288-.712T11 7t.713.288T12 8zM18 6h-2q-.425 0-.712-.287T15 5t.288-.712T16 4h2V2q0-.425.288-.712T19 1t.713.288T20 2v2h2q.425 0 .713.288T23 5t-.288.713T22 6h-2v2q0 .425-.288.713T19 9t-.712-.288T18 8zm-7 15q-1.875 0-3.512-.7t-2.863-1.925T2.7 15.512T2 12t.7-3.512t1.925-2.863T7.488 3.7T11 3q.275 0 .513.013t.512.062q.425 0 .713.288t.287.712t-.288.713t-.712.287q-.275 0-.513-.038T11 5Q8.05 5 6.025 7.025T4 12t2.025 4.975T11 19t4.975-2.025T18 12q0-.425.288-.712T19 11t.713.288T20 12q0 1.875-.7 3.513t-1.925 2.862t-2.863 1.925T11 21" stroke-width="0.3" stroke="#1dca00"/></svg>
        </button>
        
        <!-- Time Out Button -->
        <button 
          data-time-out-btn
          data-visitor-id="${data.id || ''}"
          class="group relative inline-flex items-center justify-center w-10 h-10 rounded-md bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 transition-colors ${!timeIn || timeOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
          ${!timeIn || timeOut ? 'disabled' : ''}
          title="Record Time Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16"><rect width="16" height="16" fill="none"/><path fill="#ca0000" fill-rule="evenodd" d="M6.229.199a8 8 0 0 1 9.727 6.964a.75.75 0 0 1-1.492.157a6.5 6.5 0 1 0-7.132 7.146a.75.75 0 1 1-.154 1.492a8 8 0 0 1-.95-15.76ZM8 3a.75.75 0 0 1 .75.75V9h-4a.75.75 0 0 1 0-1.5h2.5V3.75A.75.75 0 0 1 8 3m2.22 7.22a.75.75 0 0 1 1.06 0L13 11.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L14.06 13l1.72 1.72a.75.75 0 1 1-1.06 1.06L13 14.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L11.94 13l-1.72-1.72a.75.75 0 0 1 0-1.06" clip-rule="evenodd" stroke-width="0.3" stroke="#ca0000"/></svg>
        </button>
      </div>
    ` : '—';

    // Large buttons for mobile view
    const mobileActionButtons = statusLabel === 'Approved' ? `
      <div class="mt-6 space-y-3">
        <div class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Visit Actions</div>
        <div class="flex flex-col gap-3">
          <!-- Time In Button (Large) -->
          <button 
            data-time-in-btn
            data-visitor-id="${data.id || ''}"
            class="group relative inline-flex items-center justify-center w-full h-14 px-4 rounded-md bg-green-600/10 hover:bg-green-600/20 border border-green-600/30 transition-colors ${timeIn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
            ${timeIn ? 'disabled' : ''}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="mr-3"><rect width="24" height="24" fill="none"/><path fill="#1dca00" d="m12 11.6l2.5 2.5q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-2.8-2.8q-.15-.15-.225-.337T10 11.975V8q0-.425.288-.712T11 7t.713.288T12 8zM18 6h-2q-.425 0-.712-.287T15 5t.288-.712T16 4h2V2q0-.425.288-.712T19 1t.713.288T20 2v2h2q.425 0 .713.288T23 5t-.288.713T22 6h-2v2q0 .425-.288.713T19 9t-.712-.288T18 8zm-7 15q-1.875 0-3.512-.7t-2.863-1.925T2.7 15.512T2 12t.7-3.512t1.925-2.863T7.488 3.7T11 3q.275 0 .513.013t.512.062q.425 0 .713.288t.287.712t-.288.713t-.712.287q-.275 0-.513-.038T11 5Q8.05 5 6.025 7.025T4 12t2.025 4.975T11 19t4.975-2.025T18 12q0-.425.288-.712T19 11t.713.288T20 12q0 1.875-.7 3.513t-1.925 2.862t-2.863 1.925T11 21" stroke-width="0.3" stroke="#1dca00"/></svg>
            <span class="text-sm font-medium text-green-400">Record Time In</span>
            <span class="ml-auto text-xs text-gray-400">${timeInFormatted || 'Not recorded'}</span>
          </button>
          
          <!-- Time Out Button (Large) -->
          <button 
            data-time-out-btn
            data-visitor-id="${data.id || ''}"
            class="group relative inline-flex items-center justify-center w-full h-14 px-4 rounded-md bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 transition-colors ${!timeIn || timeOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
            ${!timeIn || timeOut ? 'disabled' : ''}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16" class="mr-3"><rect width="16" height="16" fill="none"/><path fill="#ca0000" fill-rule="evenodd" d="M6.229.199a8 8 0 0 1 9.727 6.964a.75.75 0 0 1-1.492.157a6.5 6.5 0 1 0-7.132 7.146a.75.75 0 1 1-.154 1.492a8 8 0 0 1-.95-15.76ZM8 3a.75.75 0 0 1 .75.75V9h-4a.75.75 0 0 1 0-1.5h2.5V3.75A.75.75 0 0 1 8 3m2.22 7.22a.75.75 0 0 1 1.06 0L13 11.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L14.06 13l1.72 1.72a.75.75 0 1 1-1.06 1.06L13 14.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L11.94 13l-1.72-1.72a.75.75 0 0 1 0-1.06" clip-rule="evenodd" stroke-width="0.3" stroke="#ca0000"/></svg>
            <span class="text-sm font-medium text-red-400">Record Time Out</span>
            <span class="ml-auto text-xs text-gray-400">${timeOutFormatted || 'Not recorded'}</span>
          </button>
        </div>
      </div>
    ` : '';
    
    const visitorRows = [
      { label: 'Name', value: v.name || data.visitor },
      { label: 'Email', value: v.email || 'N/A' },
      { label: 'Phone', value: v.phone || 'N/A' },
      { label: 'Relationship', value: v.relationship || 'N/A' },
      { label: 'Schedule', value: scheduleDisp },
      { label: 'Status', value: statusBadge(statusLabel) },
      { label: 'Visit Times', value: `${timeInFormatted ? `<span class="inline-flex items-center px-2 py-1 rounded-md bg-green-600/20 text-green-400 font-medium">Time In: ${timeInFormatted}</span>` : ''}${timeInFormatted && timeOutFormatted ? ' <span class="text-gray-500">|</span> ' : ''}${timeOutFormatted ? `<span class="inline-flex items-center px-2 py-1 rounded-md bg-red-600/20 text-red-400 font-medium">Time Out: ${timeOutFormatted}</span>` : ''}` || '—' },
      { label: 'Reason For Visit', value: data.reason_for_visit || 'N/A' },
      { label: 'Actions', value: desktopActionButtons },
    ];
    const pdlRows = [
      { label: 'Name', value: p.name || 'N/A' },
      { label: 'Birthday', value: formatDateHuman(p.birthday) },
      { label: 'Age', value: pAge ? `${pAge} Years Old` : 'N/A' },
      { label: 'Father', value: fatherVal },
      { label: 'Mother', value: motherVal },
      { label: 'Spouse', value: spouseVal },
      { label: 'Next of Kin', value: p.nextOfKin || 'N/A' },
    ];

    // Utility to render flowbite desktop-style table, grouped by section [Dre sa Desktop Modal]
    function flowbiteTable(sectionTitle, rows, valueHeader) {
      const headerText = valueHeader || 'Information';
      return `
        <div class="hidden sm:block w-full">
          <h3 class="text-lg font-semibold text-white mb-4">${sectionTitle}</h3>
          <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" class="px-4 py-3">
                    Field
                  </th>
                  <th scope="col" class="px-4 py-3">
                    <div class="flex items-center">
                      ${headerText}
                      <a href="#"><svg class="w-3 h-3 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"/>
                      </svg></a>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                ${rows.map((row, index) => `
                  <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200${index === rows.length - 1 ? ' dark:bg-gray-800' : ''}">
                    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      ${row.label}
                    </th>
                    <td class="px-2 py-2">
                      ${row.value}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // Mobile rows: fallback to original tailwind grid layout (mobile only)
    function mobileRows(sectionTitle, rows) {
      // Filter out Actions row for mobile view
      const mobileRows = rows.filter(row => row.label !== 'Actions');
      
      return `
        <div class="block sm:hidden mb-6">
          <div class="font-semibold text-gray-900 dark:text-gray-100 mb-2">${sectionTitle}</div>
          ${mobileRows.map(row => `
            <div class="grid grid-cols-5 gap-2 py-1 items-center">
              <div class="col-span-2 text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">${row.label}:</div>
              <div class="col-span-3 text-xs sm:text-sm md:text-base text-gray-900 dark:text-gray-100 text-right sm:text-left">
                ${row.value || 'N/A'}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    const html = `
      <div class="text-left">
        <!-- Desktop: 2-column grid layout -->
        <div class="hidden sm:grid sm:grid-cols-2 sm:gap-5">
          ${flowbiteTable('PDL Information', pdlRows, 'PDL Details')}
          ${flowbiteTable('Visitor Information', visitorRows, 'Visitor Details')}
        </div>
        
        <!-- Mobile: Stack layout -->
        <div class="block sm:hidden">
          ${mobileRows('PDL Information', pdlRows)}
          ${mobileRows('Visitor Information', visitorRows)}
          
          <!-- Mobile Action Buttons (only for Approved status) -->
          ${mobileActionButtons}
        </div>
      </div>
    `;

    if (window.Swal) {
      const swalInstance = window.Swal.fire({
        title: '<span class="text-white">Visitor & PDL Details</span>',
        html,
        background: '#111827',
        color: '#F9FAFB',
        showConfirmButton: false,
        showCloseButton: true,
        closeButtonHtml: '<svg class="w-6 h-6 text-red-500 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z" clip-rule="evenodd"/></svg>',
        heightAuto: true,
        scrollbarPadding: false,
        buttonsStyling: false,
        allowOutsideClick: true,
        width: '64em',
        customClass: {
          htmlContainer: 'p-6 sm:p-8',
          closeButton: 'hover:bg-transparent',
          title: 'text-white'
        },
        didOpen: () => {
          // Attach Time In button handler
          const timeInBtn = document.querySelector('[data-time-in-btn]');
          if (timeInBtn && !timeInBtn.disabled) {
            timeInBtn.addEventListener('click', async () => {
              const visitorId = timeInBtn.getAttribute('data-visitor-id');
              if (!visitorId) return;
              
              try {
                const response = await fetch(`/api/visitors/${visitorId}/time-in`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'X-Requested-With': 'XMLHttpRequest'
                  }
                });
                
                if (!response.ok) throw new Error('Failed to record time in');
                
                const result = await response.json();
                
                // Format time for success message
                const timeInTime = new Date(result.data.time_in).toLocaleString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                });
                
await Swal.fire({
                  icon: 'success',
                  title: 'Time In Recorded!',
                  text: `Time in recorded at ${timeInTime}`,
                  timer: 2000,
                  showConfirmButton: false,
                  background: '#111827',
                  color: '#F9FAFB',
                  iconColor: '#1dca00'
                });
                
                // Reload the modal with updated data
                if (result.success && result.data) {
                  // Update the data with new time_in data
                  data.time_in = result.data.time_in;
                  data.time_out = result.data.time_out;
                  data.status = result.data.status;
                  
                  // Close current modal and reopen with updated data
                  Swal.close();
                  setTimeout(() => openVisitorModal(data), 100);
                }
              } catch (error) {
                console.error('Error recording time in:', error);
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Failed to record time in. Please try again.',
                  background: '#111827',
                  color: '#F9FAFB',
                  confirmButtonColor: '#3B82F6'
                });
              }
            });
          }
          
          // Attach Time Out button handler
          const timeOutBtn = document.querySelector('[data-time-out-btn]');
          if (timeOutBtn && !timeOutBtn.disabled) {
            timeOutBtn.addEventListener('click', async () => {
              const visitorId = timeOutBtn.getAttribute('data-visitor-id');
              if (!visitorId) return;
              
              try {
                const response = await fetch(`/api/visitors/${visitorId}/time-out`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'X-Requested-With': 'XMLHttpRequest'
                  }
                });
                
                if (!response.ok) throw new Error('Failed to record time out');
                
                const result = await response.json();
                
                // Format time for success message
                const timeOutTime = new Date(result.data.time_out).toLocaleString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                });
                
await Swal.fire({
                  icon: 'success',
                  title: 'Time Out Recorded!',
                  text: `Time out recorded at ${timeOutTime}`,
                  timer: 2000,
                  showConfirmButton: false,
                  background: '#111827',
                  color: '#F9FAFB',
                  iconColor: '#1dca00'
                });
                
                // Reload the modal with updated data
                if (result.success && result.data) {
                  // Update the data with new time_out data
                  data.time_in = result.data.time_in;
                  data.time_out = result.data.time_out;
                  data.status = result.data.status;
                  
                  // Close current modal and reopen with updated data
                  Swal.close();
                  setTimeout(() => openVisitorModal(data), 100);
                }
              } catch (error) {
                console.error('Error recording time out:', error);
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Failed to record time out. Please try again.',
                  background: '#111827',
                  color: '#F9FAFB',
                  confirmButtonColor: '#3B82F6'
                });
              }
            });
          }
        }
      });
    
      setTimeout(() => {
        const popup = document.querySelector('.swal2-popup');
        const htmlC = popup ? popup.querySelector('.swal2-html-container') : null;
        if (htmlC) {
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
        <h3 class="text-base sm:text-lg font-semibold text-white mb-3">Select PDL</h3>
        <div class="mb-3">
          <input id="mr-search-input" type="text" autocomplete="off" placeholder="Search by name or ID" class="w-full px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div id="mr-results" class="divide-y divide-gray-700 rounded-lg border border-gray-700 overflow-hidden bg-gray-900/60">
          <div class="p-4 text-sm text-gray-400">Type to search inmates...</div>
        </div>
      </div>`;

    const selected = { inmate: null };
    // Store inmates for lookup
    const inmateMap = new Map();

    await window.Swal.fire({
      title: '',
      html: `
        <div class="text-left relative">
          <div class="absolute -top-1 -right-5 text-red-500 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors" onclick="window.Swal.close()">
            <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z" clip-rule="evenodd"/></svg>
          </div>
          <div class="text-left">
          <h3 class="text-base sm:text-lg font-semibold text-gray-100 mb-3">Select PDL</h3>
          <div class="mb-3">
            <input id="mr-search-input" type="text" autocomplete="off" placeholder="Search by name or ID" class="w-full px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div id="mr-results" class="divide-y divide-gray-700 rounded-lg border border-gray-700 overflow-hidden bg-gray-900/60">
            <div class="p-4 text-sm text-gray-400">Type to search inmates...</div>
          </div>
        </div>`,
      background: '#111827',
      color: '#F9FAFB',
      showConfirmButton: false,
      showCancelButton: false,
      heightAuto: false,
      scrollbarPadding: false,
      buttonsStyling: false,
      customClass: {
        popup: 'm-0 w-[96vw] max-w-[96vw] sm:max-w-[40rem] p-5 !rounded-2xl'
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
          // Store inmates in map for lookup
          items.forEach(inm => inmateMap.set(inm.id, inm));
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
          const inmateId = parseInt(btn.getAttribute('data-inmate-id'));
          const inmate = inmateMap.get(inmateId);
          if (!inmate) return;
          
          selected.inmate = inmate;
          // Move to step 2
          window.Swal.close();
          setTimeout(() => openVisitorFormStep(inmate), 10);
        });

        // Autofocus
        input?.focus();
      }
    });
  }

  function inmateResultItem(inm) {
    const name = getInmateDisplayName(inm);
    return `
      <div class="flex items-center justify-between p-3 hover:bg-gray-800/60">
        <div>
          <div class="text-sm text-gray-100 font-medium">${name}</div>
          <div class="text-xs text-gray-400">ID: ${String(inm.id).padStart(4,'0')}</div>
        </div>
        <button type="button" data-pick-inmate data-inmate-id="${inm.id}" class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 text-white cursor-pointer" title="Select">
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
    // Use the new visitation request modal
    return openVisitationRequestModal(inmate);
  }

  // Legacy function kept for compatibility
  async function openVisitorFormStepOld(inmate) {
    const html = `
      <div class="text-left">
        <h3 class="text-base sm:text-lg font-semibold text-white mb-3">Visitor Details</h3>
        <div class="mb-4 text-sm text-gray-300">Registering visit for <span class="font-semibold text-white">${inmate.name}</span> (ID ${String(inmate.id).padStart(4,'0')})</div>
        <form class="max-w-full mx-auto">
          <div class="grid md:grid-cols-2 md:gap-6">
            <div class="relative z-0 w-full mb-5 group">
                <input type="text" id="mr-v-name" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                <label for="mr-v-name" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Name</label>
            </div>
            <div class="relative z-0 w-full mb-5 group">
                <label for="mr-v-rel"
                  class="block mb-1 text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium"
                  style="z-index:1; position:relative;"
                >
                  Relationship
                </label>
                <select id="mr-v-rel"
                  class="block w-full px-2 py-2 text-xs sm:text-sm md:text-base text-gray-900 bg-white border-b-2 border-r border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                  style="z-index:0;"
                  required
                >
                  <option value="" selected disabled class="text-xs sm:text-sm md:text-base">Select Relationship</option>
                  <option class="text-xs sm:text-sm md:text-base">Mother</option>
                  <option class="text-xs sm:text-sm md:text-base">Father</option>
                  <option class="text-xs sm:text-sm md:text-base">Brother</option>
                  <option class="text-xs sm:text-sm md:text-base">Sister</option>
                  <option class="text-xs sm:text-sm md:text-base">Wife/Husband</option>
                </select>
            </div>
          </div>
          <div class="grid md:grid-cols-2 md:gap-6">
            <div class="relative z-0 w-full mb-5 group">
                <input type="email" id="mr-v-email" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                <label for="mr-v-email" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email</label>
            </div>
            <div class="relative z-0 w-full mb-5 group">
              <span class="absolute left-0 bottom-2.5 text-sm text-gray-500 dark:text-gray-400 select-none">+63</span>
              <input type="tel" id="mr-v-phone" class="peer block py-2.5 pl-12 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600" placeholder=" " />
              <label for="mr-v-phone" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 left-12 -z-10 origin-left peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Phone</label>
            </div>
          </div>
          <div class="grid md:grid-cols-2 md:gap-6">
            <div class="relative z-0 w-full mb-5 group">
              <div class="relative">
                <select
                  id="mr-v-id-type"
                  data-dropdown-toggle="mr-v-id-type"
                  class="peer block w-full px-1 py-1.5 text-xs sm:text-sm md:text-base text-gray-900 bg-white border-b-2 border-r border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 dark:focus:border-blue-500 mt-3 transition-all"
                  required
                >
                  <option value="" selected disabled class="text-xs sm:text-sm md:text-base">Select ID Type</option>
                  <option class="text-xs sm:text-sm md:text-base">Philippine National ID (PhilSys)</option>
                  <option class="text-xs sm:text-sm md:text-base">Driver's License</option>
                  <option class="text-xs sm:text-sm md:text-base">Passport</option>
                  <option class="text-xs sm:text-sm md:text-base">SSS ID</option>
                  <option class="text-xs sm:text-sm md:text-base">GSIS ID</option>
                  <option class="text-xs sm:text-sm md:text-base">UMID</option>
                  <option class="text-xs sm:text-sm md:text-base">PhilHealth ID</option>
                  <option class="text-xs sm:text-sm md:text-base">Voter's ID (COMELEC)</option>
                  <option class="text-xs sm:text-sm md:text-base">Postal ID</option>
                  <option class="text-xs sm:text-sm md:text-base">TIN ID</option>
                  <option class="text-xs sm:text-sm md:text-base">PRC ID</option>
                  <option class="text-xs sm:text-sm md:text-base">Senior Citizen ID</option>
                  <option class="text-xs sm:text-sm md:text-base">PWD ID</option>
                  <option class="text-xs sm:text-sm md:text-base">Student ID</option>
                  <option class="text-xs sm:text-sm md:text-base">Company ID</option>
                  <option class="text-xs sm:text-sm md:text-base">Barangay ID</option>
                </select>
                <svg class="absolute top-1/2 right-2 w-4 h-4 text-gray-400 pointer-events-none transform -translate-y-1/2 fill-current" aria-hidden="true" viewBox="0 0 20 20"><path d="M10 12a1 1 0 0 1-.7-.3l-4-4a1 1 0 1 1 1.4-1.4L10 9.6l3.3-3.3a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 1-.7.3z" /></svg>
              </div>
              <label for="mr-v-id-type" class="peer-focus:font-medium absolute text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">ID Type</label>
            </div>
            <div class="relative z-0 w-full mb-5 group">
                <input type="text" id="mr-v-id-number" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                <label for="mr-v-id-number" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">ID Number</label>
            </div>
          </div>
          <div class="relative z-0 w-full mb-5 group">
              <input type="text" id="mr-v-address" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
              <label for="mr-v-address" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Address</label>
          </div>
          <div class="grid md:grid-cols-2 md:gap-6">
            <div class="relative z-0 w-full mb-5 group">
                <input type="datetime-local" id="mr-v-sched" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                <label for="mr-v-sched" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Schedule (optional)</label>
            </div>
            <div class="relative z-0 w-full mb-5 group">
                <input type="file" id="mr-v-photo" accept="image/*" class="mt-2 block w-full text-sm text-gray-900 bg-transparent border-0 border-transparent appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-transparent file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
                <label for="mr-v-photo" class="peer-focus:font-medium absolute text-sm text-gray-900 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-left peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Photo</label>
            </div>
          </div>
        </form>
      </div>`;

    await window.Swal.fire({
      title: '<span class="text-white">Manual Registration</span>',
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
        const phoneInput = document.getElementById('mr-v-phone').value.trim();
        const phoneDigits = phoneInput.replace(/\D+/g, '');
        const phone = phoneDigits ? `+63 ${phoneDigits}` : '';
        const idType = document.getElementById('mr-v-id-type').value.trim();
        const idNumber = document.getElementById('mr-v-id-number').value.trim();
        const address = document.getElementById('mr-v-address').value.trim();
        const sched = document.getElementById('mr-v-sched').value;
        const photo = document.getElementById('mr-v-photo').files[0] || null;

        if (!name) {
          window.Swal.showValidationMessage('Visitor name is required');
          return false;
        }

        // Prepare FormData for backend create
        const form = new FormData();
        form.append('inmate_id', String(inmate.id));
        form.append('name', name);
        if (rel) form.append('relationship', rel);
        if (email) form.append('email', email);
        if (phone) form.append('phone', phone);
        if (idType) form.append('id_type', idType);
        if (idNumber) form.append('id_number', idNumber);
        if (address) form.append('address', address);
        if (sched) form.append('schedule', sched);
        if (photo) form.append('avatar', photo);

        // Dynamic import to avoid ad-blockers on top-level module load
        let VisitorApiClient;
        try {
          ({ default: VisitorApiClient } = await import('./components/visitorClient.js'));
        } catch (e) {
          window.Swal.showValidationMessage('Unable to load registration module. Please disable blocking extensions and try again.');
          return false;
        }
        const visitorApi = new VisitorApiClient();
        let created = null;
        try {
          const response = await visitorApi.create(form);
          created = response.data;
          
          // Show success message
          window.Swal.fire({
            title: 'Success!',
            text: 'Visitor registered successfully',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: '#111827',
            color: '#F9FAFB',
            heightAuto: false,
            scrollbarPadding: false,
          });
          
          // Refresh from backend so the new visitor appears in the list
          await loadBackendVisitors();
        } catch (error) {
          window.Swal.showValidationMessage(`Registration failed: ${error.message}`);
          return false;
        }

        return true;
      }
    });
  }

  /**
   * Set up auto-reload functionality for visitation requests
   */
  function setupAutoReload() {
    try {
      console.log('Setting up auto-reload for visitation requests...');
      
      let autoReloadEnabled = true;
      let reloadInterval;
      
      const toggleButton = document.getElementById('auto-reload-toggle');
      const toggleIcon = toggleButton?.querySelector('svg');
      
      // Function to start auto-reload
      function startAutoReload() {
        reloadInterval = setInterval(async () => {
          // Only reload if the page is visible (not in background tab)
          if (!document.hidden && autoReloadEnabled) {
            console.log('Auto-reloading visitation requests...');
            
            // Show visual feedback
            if (toggleButton) {
              toggleButton.classList.add('text-blue-600', 'dark:text-blue-400', 'bg-green-100', 'dark:bg-green-900');
              toggleButton.classList.remove('text-gray-500', 'dark:text-gray-400', 'bg-gray-100', 'dark:bg-gray-800');
              if (toggleIcon) toggleIcon.classList.add('animate-spin');
            }
            
            await loadBackendVisitors();
            updateStatistics();
            
            // Reset visual feedback after a short delay
            setTimeout(() => {
              if (toggleButton && autoReloadEnabled) {
                toggleButton.classList.remove('text-blue-600', 'dark:text-blue-400');
                toggleButton.classList.add('text-green-600', 'dark:text-green-400');
                if (toggleIcon) toggleIcon.classList.remove('animate-spin');
              }
            }, 1000);
          }
        }, 30000); // 30 seconds
      }
      
      // Function to stop auto-reload
      function stopAutoReload() {
        if (reloadInterval) {
          clearInterval(reloadInterval);
          reloadInterval = null;
        }
      }
      
      // Toggle button click handler
      if (toggleButton) {
        toggleButton.addEventListener('click', () => {
          autoReloadEnabled = !autoReloadEnabled;
          
          if (autoReloadEnabled) {
            // Enable auto-reload
            startAutoReload();
            toggleButton.classList.remove('text-red-600', 'dark:text-red-400', 'bg-red-100', 'dark:bg-red-900');
            toggleButton.classList.add('text-green-600', 'dark:text-green-400', 'bg-green-100', 'dark:bg-green-900');
            if (toggleIcon) toggleIcon.classList.add('animate-spin');
            console.log('Auto-refresh enabled');
          } else {
            // Disable auto-reload
            stopAutoReload();
            toggleButton.classList.remove('text-green-600', 'dark:text-green-400', 'bg-green-100', 'dark:bg-green-900');
            toggleButton.classList.add('text-red-600', 'dark:text-red-400', 'bg-red-100', 'dark:bg-red-900');
            if (toggleIcon) toggleIcon.classList.remove('animate-spin');
            console.log('Auto-refresh disabled');
          }
        });
        
        // Initialize as enabled
        toggleButton.classList.add('text-green-600', 'dark:text-green-400', 'bg-green-100', 'dark:bg-green-900');
        if (toggleIcon) toggleIcon.classList.add('animate-spin');
      }
      
      // Start auto-reload
      startAutoReload();
      
      console.log('Auto-reload setup completed for visitation requests');
    } catch (error) {
      console.error('Error setting up auto-reload:', error);
    }
  }

  /**
   * Update statistics counters
   */
  function updateStatistics() {
    try {
      const totalElement = document.getElementById('visitors-total');
      const approvedElement = document.getElementById('visitors-approved');
      const pendingElement = document.getElementById('visitors-pending');
      const declinedElement = document.getElementById('visitors-declined');

      if (totalElement && visitors.length > 0) {
        const total = visitors.length;
        const approved = visitors.filter(v => v.status === 'Approved').length;
        const pending = visitors.filter(v => v.status === 'Pending').length;
        const declined = visitors.filter(v => v.status === 'Declined').length;

        // Animate counter updates
        animateCounter(totalElement, total);
        if (approvedElement) animateCounter(approvedElement, approved);
        if (pendingElement) animateCounter(pendingElement, pending);
        if (declinedElement) animateCounter(declinedElement, declined);
      }
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  }

  /**
   * Animate counter number changes
   */
  function animateCounter(element, targetValue) {
    const currentValue = parseInt(element.textContent) || 0;
    const increment = targetValue > currentValue ? 1 : -1;
    const steps = Math.abs(targetValue - currentValue);
    
    if (steps === 0) return;
    
    let current = currentValue;
    const duration = 500; // 500ms animation
    const stepTime = duration / steps;
    
    const timer = setInterval(() => {
      current += increment;
      element.textContent = current;
      
      if (current === targetValue) {
        clearInterval(timer);
        // Add pulse effect
        element.classList.add('scale-110');
        setTimeout(() => {
          element.classList.remove('scale-110');
        }, 200);
      }
    }, stepTime);
  }
});
