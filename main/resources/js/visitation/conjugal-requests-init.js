import { openConjugalRequestsModal } from './conjugal-requests-modal.js';

function ready(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

ready(() => {
  const btn = document.getElementById('btn-conjugal');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    // Resolve inmateId from a data attribute or fallback
    const inmateId = document.querySelector('[data-inmate-id]')?.dataset.inmateId ||
                     document.querySelector('[name="inmate_id"]')?.value || '';
    if (!inmateId) {
      if (window.Swal) {
        const isDark = document.documentElement.classList.contains('dark');
        await window.Swal.fire({
          icon: 'error',
          title: `<span class="${isDark ? 'text-white' : 'text-black'}">Missing inmate</span>`,
          text: 'Cannot open requests without inmate context.'
        });
      }
      return;
    }
    await openConjugalRequestsModal({ inmateId });
  });
});


