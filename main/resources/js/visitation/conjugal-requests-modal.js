// Modal to list/manage conjugal_visit_logs

export async function openConjugalRequestsModal({ inmateId }) {
  const isDark = document.documentElement.classList.contains('dark');
  const cfgBase = {
    background: isDark ? '#111827' : '#FFFFFF',
    color: isDark ? '#F9FAFB' : '#111827',
    buttonsStyling: false,
    showConfirmButton: false,
    heightAuto: false,
    customClass: {
      popup: 'm-0 w-[95vw] max-w-4xl p-3 sm:p-4 !rounded-2xl',
      confirmButton: 'hidden'
    }
  };

  const html = `
    <div class="text-left">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-base sm:text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}">Conjugal Visit Requests</h3>
        <button id="cv-refresh" class="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer">Refresh</button>
      </div>
      <div class="overflow-x-auto rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}">
        <table class="min-w-full text-xs sm:text-sm">
          <thead class="${isDark ? 'bg-gray-800/60' : 'bg-gray-50'}">
            <tr>
              <th class="px-3 py-2 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}">Date</th>
              <th class="px-3 py-2 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}">Visitor</th>
              <th class="px-3 py-2 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}">Duration</th>
              <th class="px-3 py-2 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}">Paid</th>
              <th class="px-3 py-2 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}">Status</th>
              <th class="px-3 py-2 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}">Actions</th>
            </tr>
          </thead>
          <tbody id="cv-rows">
            <tr><td colspan="6" class="px-3 py-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  await window.Swal.fire({ ...cfgBase, html, title: '' });
  bindEvents();
  await loadRows();

  function bindEvents() {
    const btn = document.getElementById('cv-refresh');
    if (btn) btn.addEventListener('click', loadRows);
  }

  async function loadRows() {
    const tbody = document.getElementById('cv-rows');
    if (!tbody) return;
    try {
      const res = await fetch(`/api/conjugal-visits/inmate/${inmateId}/logs`, { headers: { 'Accept': 'application/json' } });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load logs');

      const rows = (json.logs || []).map(renderRow).join('') || `<tr><td colspan="6" class="px-3 py-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}">No requests</td></tr>`;
      tbody.innerHTML = rows;
      tbody.querySelectorAll('[data-action]')?.forEach(wireAction);
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-3 py-6 text-center ${isDark ? 'text-red-400' : 'text-red-600'}">${e.message}</td></tr>`;
    }
  }

  function renderRow(log) {
    const date = log.schedule ? new Date(log.schedule).toLocaleString() : '-';
    const name = log.visitor?.name || 'Unknown';
    const duration = `${log.duration_minutes}m`;
    const paidBadge = badge(log.paid === 'YES' ? 'YES' : 'NO', log.paid === 'YES' ? 'emerald' : 'rose');
    const statusMap = { 0: ['Denied','red'], 1: ['Approved','green'], 2: ['Pending','amber'], 3: ['Completed','blue'] };
    const [statusLabel, statusColor] = statusMap[log.status] || ['Unknown','gray'];
    const statusBadge = badge(statusLabel, statusColor);
    const id = log.id;
    return `
      <tr class="${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}">
        <td class="px-3 py-2">${date}</td>
        <td class="px-3 py-2">${name}</td>
        <td class="px-3 py-2">${duration}</td>
        <td class="px-3 py-2">${paidBadge}</td>
        <td class="px-3 py-2">${statusBadge}</td>
        <td class="px-3 py-2 space-x-2">
          <button data-action="approve" data-id="${id}" class="inline-flex items-center px-2.5 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-medium cursor-pointer">Approve</button>
          <button data-action="decline" data-id="${id}" class="inline-flex items-center px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-medium cursor-pointer">Decline</button>
          <button data-action="toggle-paid" data-paid="${log.paid}" data-id="${id}" class="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer">${log.paid === 'YES' ? 'Mark Unpaid' : 'Mark Paid'}</button>
        </td>
      </tr>`;
  }

  function badge(text, color) {
    const map = {
      emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
      amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    };
    return `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${map[color] || map.gray}">${text}</span>`;
  }

  function wireAction(btn) {
    btn.addEventListener('click', async (e) => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      try {
        if (action === 'approve' || action === 'decline') {
          const status = action === 'approve' ? 1 : 0;
          await patch(`/api/conjugal-visits/logs/${id}/status`, { status });
          await feedback('success', `Request ${action === 'approve' ? 'approved' : 'declined'}`);
        } else if (action === 'toggle-paid') {
          const next = btn.dataset.paid === 'YES' ? 'NO' : 'YES';
          await patch(`/api/conjugal-visits/logs/${id}/payment`, { paid: next });
          await feedback('success', `Marked as ${next}`);
        }
        await loadRows();
      } catch (err) {
        await feedback('error', err.message || 'Action failed');
      }
    });
  }

  async function patch(url, body) {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Request failed');
    return json;
  }

  async function feedback(icon, text) {
    const isDark = document.documentElement.classList.contains('dark');
    await window.Swal.fire({
      icon,
      title: `<span class="${isDark ? 'text-white' : 'text-black'}">${text}</span>`,
      timer: 1400,
      showConfirmButton: false,
      background: isDark ? '#111827' : '#FFFFFF',
      color: isDark ? '#F9FAFB' : '#111827'
    });
  }
}

// Optional auto-attach global for Blade inline handlers
if (typeof window !== 'undefined') {
  window.openConjugalRequestsModal = openConjugalRequestsModal;
}


