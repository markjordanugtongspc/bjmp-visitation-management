// Super Vision page: SweetAlert2 interactions for modals and actions
// Exported initializer to be used by supervision.js

export default function initSupervisionModalInteractions() {
  if (typeof window === 'undefined' || !window.Swal) return;

  // Shared SweetAlert2 color palette (aligned with inmates.js modals)
  // Tailwind equivalents:
  // primary -> blue-500 (#3B82F6)
  // danger  -> red-500  (#EF4444)
  // cancel/bg (dark) -> gray-900 (#111827)
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

  // Download confirmation for manuals (primary action)
  document.querySelectorAll('[data-action="download"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      themedConfirm({
        title: 'Start download?',
        text: 'You are about to download this manual as PDF.',
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
          window.Swal.fire(opts);
        }
      });
    });
  });

  // Toast when opening create manual (Flowbite handles modal opening)
  const createBtn = document.querySelector('[data-modal-target="createManualModal"]');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      themedToast({
        icon: 'info',
        title: 'Open the form to create a manual',
        background: isDarkMode() ? PALETTE.darkBg : '#fff',
        color: isDarkMode() ? '#E5E7EB' : '#111827',
        iconColor: PALETTE.primary,
      });
    });
  }

  // Export helpers globally for future modals (optional, non-breaking)
  window.SupervisionSwal = window.SupervisionSwal || {
    themedConfirm,
    themedToast,
    PALETTE,
  };
}


