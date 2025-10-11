// Supervision Modal Interactions with Inmate.js Color Palette Integration (Tailwind + Cohesive Palette)

/**
 * Initialize supervision modal interactions (for create/view/manage flows)
 * Uses the color palette from inmates.js for a consistent UI.
 * Also sets SweetAlert2 default theme to dark mode for all modals on page load.
 */
export default function initSupervisionModalInteractions() {
  if (typeof window === 'undefined') return; // SSR guard
  setSweetAlertDarkThemeDefault();
  setupModalToggles();
  setupRefreshButton();
  exposeSweetAlertHelpers();
}

// Ensure SweetAlert2 modals always use dark mode as the default theme
function setSweetAlertDarkThemeDefault() {
  if (typeof window !== 'undefined' && window.Swal) {
    // Override default theme for all modals
    window.Swal.defaultOptions = window.Swal.defaultOptions || {};
    // A wrapper for backward/forward compat: also patch fire to always enforce dark
    const globalDarkDefaults = {
      background: '#172033', // deep dark (e.g. Tailwind's zinc-900/sky-900)
      color: '#e0e6ed',
      customClass: {
        popup: 'bg-zinc-900 border border-zinc-700 text-neutral-100 shadow-2xl dark', // apply strong dark color
        confirmButton: 'bg-sky-900 hover:bg-sky-800 text-sky-100 px-5 py-2 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-sky-700',
        cancelButton: 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-5 py-2 rounded font-semibold',
        title: 'text-sky-200',
        htmlContainer: 'text-neutral-200'
      }
    };
    // Set initial defaults (will only override un-set, but user can still override when firing)
    window.Swal.mixin && (window.Swal.DARK_MODE = window.Swal.mixin(globalDarkDefaults));
    // Monkeypatch global fire to always merge with dark mode
    const originalFire = window.Swal.fire;
    window.Swal.fire = function (opts = {}, ...rest) {
      // Merge deeply, let per-modal opts override, but always default to dark
      // Avoid duplicate classes if popup already set
      let _opts = opts || {};
      let popup = (_opts.customClass && _opts.customClass.popup) || '';
      if (!popup.includes('bg-zinc-900')) {
        _opts = {
          background: globalDarkDefaults.background,
          color: globalDarkDefaults.color,
          ..._opts,
          customClass: {
            ...globalDarkDefaults.customClass,
            ...(opts.customClass || {})
          }
        };
        // Merge popup customClass carefully (do not override if user sets "popup")
        if (opts.customClass && opts.customClass.popup) {
          _opts.customClass.popup = opts.customClass.popup;
        }
      }
      return originalFire.call(window.Swal, _opts, ...rest);
    };
  }
}

// Attach modal togglers with event delegation
function setupModalToggles() {
  const modalToggles = document.querySelectorAll('[data-modal-toggle], [data-modal-target]');
  modalToggles.forEach((toggle) => {
    toggle.removeEventListener('click', handleModalToggle);
    toggle.addEventListener('click', handleModalToggle, { passive: true });
  });
}

// Applies inmates.js/modal color palette to all modal elements (borders, backgrounds, focus)
// For manual modal, applies blue-focused color (male-like), else sky/pink-neutral where applicable
function handleModalToggle(e) {
  const targetId = e.currentTarget.getAttribute('data-modal-target');
  if (!targetId) return;
  const modal = document.getElementById(targetId);
  if (!modal) return;

  // Modal background color palette (shared with inmates.js: bg-sky-50, bg-pink-50, dark:bg-sky-900/20, etc)
  // If you wish to use gender-based or type-based color, you may pass data-color="male"|"female"|...
  // Here, for modals, we simply default to blue/safe palette for all

  // Apply modal border/background to the modal content
  const content = modal.querySelector('.modal-content');
  if (content) {
    content.classList.remove(
      'bg-white', 'bg-gray-100', 'bg-neutral-900', 'dark:bg-zinc-900', // remove legacy/old/dark
      'border-gray-200', 'border-neutral-200', 'border', 'border-pink-200', 'border-sky-200',
      'dark:bg-gray-800', 'dark:bg-sky-900/20', 'dark:border-sky-800', 'dark:border-pink-800'
    );
    // Applying blue-sky palette (like inmates.js "isMale")
    content.classList.add(
      'bg-sky-50', 'border', 'border-sky-200', 'dark:bg-sky-900/20', 'dark:border-sky-800'
    );
  }

  if (targetId === 'createManualModal') {
    const form = modal.querySelector('form');
    if (form) {
      // Reset form fields and error UI
      form.reset();
      // Remove error/success styling & error messages (supporting inmates.js error borders)
      const errorMessages = form.querySelectorAll('.error-message');
      errorMessages.forEach((msg) => msg.remove());
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach((input) =>
        input.classList.remove(
          'border-red-500', 'border-green-500', 'border', // generic states
          'border-sky-500', 'border-pink-500',            // inmates.js palette
          'focus:ring-2', 'ring-red-500', 'ring-green-500', 'focus:border-blue-500', 'focus:ring-blue-400/50'
        )
      );
      // Apply fresh focus/colors (like inmates.js blue focus for forms)
      inputs.forEach((input) =>
        input.classList.add(
          'focus:border-sky-500',
          'focus:ring-2',
          'focus:ring-sky-400/50'
        )
      );
      // Clear file info and reset character count
      const fileInfo = document.getElementById('file-info');
      if (fileInfo) fileInfo.innerHTML = '';
      const counter = document.getElementById('summary-counter');
      if (counter) counter.textContent = '0/50';
      // Remove any ephemeral tailwind badge
      const categoryBadge = form.querySelector('.category-badge');
      if (categoryBadge) categoryBadge.remove();
    }

    // Show guidelines with inmates.js palette-blue SweetAlert modal
    if (typeof window !== 'undefined' && window.Swal) {
      setTimeout(showGuidelinesInfoModal, 50);
    }
  }
}

// Tailwind+responsive: Give refresh button animated feedback while loading
function setupRefreshButton() {
  const refreshBtn = document.querySelector('[data-action="refresh-supervision"]');
  if (!refreshBtn) return;
  refreshBtn.removeEventListener('click', handleRefreshClick);
  refreshBtn.addEventListener('click', handleRefreshClick);
}

// Animated loading spinner and notification feedback (using inmates.js color palette)
async function handleRefreshClick(e) {
  e.preventDefault();
  const refreshBtn = e.currentTarget;
  const originalContent = refreshBtn.innerHTML;

  // Use sky palette for loader (like blue for "isMale" in inmates.js)
  refreshBtn.innerHTML = `
    <svg class="animate-spin h-5 w-5 text-sky-500 md:h-6 md:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  `;
  refreshBtn.disabled = true;

  try {
    const { refreshSupervisionData } = await import('./supervision-cards.js');
    await refreshSupervisionData();
    // Success toast with darkmode-first palette
    if (window?.Swal) {
      window.Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2200,
        icon: 'success',
        background: '#12202f', // dark default
        color: '#d1fae5',
        customClass: {
          popup: 'bg-green-800/90 text-green-100 border border-green-900 shadow rounded-lg text-sm',
        },
        title: 'Supervision data refreshed!'
      });
    }
  } catch (error) {
    console.error('Error refreshing supervision data:', error);
    if (window?.Swal) {
      // Use darkmode error palette
      window.Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'error',
        background: '#2e1020',
        color: '#fecaca',
        customClass: {
          popup: 'bg-red-900/90 text-red-100 border border-red-800 shadow rounded-lg text-sm'
        },
        title: 'Failed to refresh data'
      });
    }
  } finally {
    setTimeout(() => {
      refreshBtn.innerHTML = originalContent;
      refreshBtn.disabled = false;
    }, 500);
  }
}

// Register helpers for global SweetAlert2 usage
function exposeSweetAlertHelpers() {
  if (typeof window === 'undefined') return;
  window.SupervisionModal = window.SupervisionModal || {};
  window.SupervisionModal.showGuidelinesInfo = showGuidelinesInfoModal;
}

// Display the guidelines modal w/ inmates.js color palette & typography, with a darkmode theme by default
function showGuidelinesInfoModal() {
  if (typeof window === 'undefined' || !window.Swal) return;
  window.Swal.fire({
    title: `<span class="text-sky-200 md:text-2xl text-lg font-semibold">Supervision Guidelines</span>`,
    html: `
      <div class="prose prose-sm md:prose-base max-w-none text-neutral-200">
        <p class="mb-4 text-zinc-200">
          Upload and manage <span class="font-semibold text-sky-300">supervision guidelines</span> and <span class="font-semibold text-sky-300">manuals</span> for your facility. These documents help standardize operations and ensure consistent procedures.
        </p>
        <ul class="list-disc pl-5 space-y-1 text-sky-200 mb-3">
          <li class="text-sm sm:text-base">Ensures consistent operations across shifts</li>
          <li class="text-sm sm:text-base">Simplifies training for new officers</li>
          <li class="text-sm sm:text-base">Provides clear guidance during emergencies</li>
          <li class="text-sm sm:text-base">Helps maintain compliance with regulations</li>
        </ul>
        <small class="block text-amber-300">💡 <b>Pro Tip:</b> Use clear, descriptive titles and keep summaries concise for better organization.</small>
      </div>
    `,
    icon: 'info',
    background: '#172033',
    color: '#e0e6ed',
    confirmButtonText: `<span class="text-brand-text-dark dark:text-brand-text-light">Got it</span>`,
    customClass: {
      popup: 'bg-zinc-900 border border-sky-900 md:max-w-xl shadow-xl rounded-lg text-neutral-100',
      // Modernize button to match palette: bg-brand-button-primary-dark in dark, bg-brand-button-primary-light in light; text and ring based on palette
      confirmButton:
        'bg-brand-button-primary-light text-white hover:bg-brand-button-hover-light focus:ring-4 focus:ring-brand-button-primary-light focus:outline-none rounded font-semibold px-5 py-2 transition-colors duration-100 ' +
        'dark:bg-brand-button-primary-dark dark:text-brand-text-dark dark:hover:bg-brand-button-hover-dark dark:focus:ring-brand-button-primary-dark',
      title: 'pt-4 text-sky-200',
      htmlContainer: 'pb-2'
    }
  });
}