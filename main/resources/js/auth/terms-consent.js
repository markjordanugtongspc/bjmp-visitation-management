// Enforce Terms & Conditions agreement on login page
// - Shows SweetAlert2 error if not agreed
// - Persists agreement in localStorage for convenience

const STORAGE_KEY = 'bjmp_terms_agreed';

function getStoredConsent() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch (_) { return false; }
}

function setStoredConsent(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
  } catch (_) { /* ignore */ }
}

function initTermsConsent() {
  const checkbox = document.querySelector('input[type="checkbox"]#terms-consent')
    || document.querySelector('label:has(> input[type="checkbox"]) input[type="checkbox"]');
  const form = document.querySelector('form[action*="login"]');
  if (!form || !checkbox) return;

  // Hydrate from storage
  const agreed = getStoredConsent();
  if (agreed) checkbox.checked = true;

  // Persist on change
  checkbox.addEventListener('change', () => setStoredConsent(checkbox.checked));

  // Intercept submit
  form.addEventListener('submit', async (e) => {
    if (checkbox.checked) return; // allow

    e.preventDefault();
    e.stopPropagation();
    await (window.Swal ? window.Swal.fire({
      icon: 'error',
      title: 'Agreement Required',
      html: '<p class="text-sm">You must agree to the Terms and Conditions before logging in.</p>',
      confirmButtonText: 'Okay',
      confirmButtonColor: '#3B82F6',
      background: '#111827',
      color: '#F9FAFB'
    }) : Promise.resolve());
  });

  // Wire Terms and Conditions link -> open modal
  const termsLink = document.querySelector('a[href="#"][class*="text-blue-"]');
  if (termsLink) {
    termsLink.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Wide, desktop-optimized, Tailwind-styled Terms content, scrollable
      const termsHtml = `
        <div id="terms-scrollable" class="text-left space-y-4 max-h-[60vh] md:max-h-[500px] overflow-y-auto pr-3">
          <h2 class="text-2xl md:text-3xl font-semibold text-gray-50 mb-2">BJMP Iligan City — Terms & Conditions</h2>
          <p class="text-base text-gray-300">These terms govern the use of the BJMP Iligan City Information & Visitation System by authorized personnel.</p>
          <ul class="list-disc pl-6 space-y-3 text-base text-gray-300">
            <li><span class="font-medium text-gray-100">Account Ownership:</span> Officers must use only their assigned personal account. Shared use is strictly prohibited. Officers accept full responsibility for all actions performed using their credentials.</li>
            <li><span class="font-medium text-gray-100">Data Confidentiality:</span> Information regarding Persons Deprived of Liberty (PDL), visitations, health status, or internal operations is confidential. Unauthorized disclosure is forbidden.</li>
            <li><span class="font-medium text-gray-100">Audit & Compliance:</span> All actions are logged. Misuse, tampering, or attempts to circumvent system policies may result in administrative and legal actions.</li>
            <li><span class="font-medium text-gray-100">Device Security:</span> Officers must secure access devices. Lock screens when unattended and report any compromise immediately to ICT.</li>
            <li><span class="font-medium text-gray-100">Proper Use:</span> Use the system solely for official BJMP functions—PDL management, visitation scheduling, incident recording, and approved administrative tasks.</li>
            <li><span class="font-medium text-gray-100">Data Integrity:</span> Enter accurate, verifiable data. Falsification or negligent entries are violations subject to sanction.</li>
          </ul>
          <p class="text-xs text-gray-400 mt-2">By accepting, you agree to comply with these terms and understand that violations may lead to disciplinary measures in accordance with BJMP policies and applicable laws.</p>
        </div>
        <div id="terms-buttons-placeholder"></div>
      `;

      // Fire SweetAlert2 with hidden buttons initially, wide on desktop, buttons right
      const result = await (window.Swal ? window.Swal.fire({
        title: 'Terms & Conditions',
        html: termsHtml,
        showCancelButton: true,
        confirmButtonText: 'Accept',
        cancelButtonText: 'Decline',
        background: '#111827',
        color: '#F9FAFB',
        reverseButtons: false,
        customClass: {
          popup: 'w-full max-w-4xl md:w-[900px] md:max-w-[900px] rounded-xl shadow-2xl',
          title: 'hidden',
          confirmButton: 'bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-semibold px-7 py-2 rounded-lg shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 order-1',
          cancelButton: 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold px-7 py-2 rounded-lg shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400 order-2 ml-auto',
          actions: 'flex flex-row gap-4 justify-between items-center px-4 md:px-8 opacity-0 pointer-events-none transition-opacity duration-300',
          htmlContainer: 'text-left'
        },
        buttonsStyling: false,
        didOpen: () => {
          // Hide actions (buttons) initially
          const actions = document.querySelector('.swal2-actions');
          if (actions) {
            actions.classList.add('opacity-0', 'pointer-events-none');
            // Make Accept left, Decline right, full width on mobile, spaced on desktop
            actions.classList.add('justify-between', 'items-center', 'md:pr-8', 'md:pl-0');
            // Ensure button order: Accept left, Decline right
            const [confirmBtn, cancelBtn] = actions.querySelectorAll('.swal2-confirm, .swal2-cancel');
            if (confirmBtn && cancelBtn) {
              confirmBtn.classList.add('order-1');
              cancelBtn.classList.add('order-2', 'ml-auto');
            }
          }
          // Listen for scroll to bottom
          const scrollable = document.getElementById('terms-scrollable');
          if (scrollable && actions) {
            const checkScroll = () => {
              const atBottom = Math.abs(scrollable.scrollHeight - scrollable.scrollTop - scrollable.clientHeight) < 2;
              if (atBottom) {
                actions.classList.remove('opacity-0', 'pointer-events-none');
                actions.classList.add('opacity-100');
              }
            };
            scrollable.addEventListener('scroll', checkScroll);
            setTimeout(checkScroll, 100);
          }
        }
      }) : Promise.resolve({ isConfirmed: false }));

      if (result && result.isConfirmed) {
        checkbox.checked = true;
        setStoredConsent(true);
      } else {
        checkbox.checked = false;
        setStoredConsent(false);
      }
    });
  }
}

// Auto-init on DOM ready
if (document.readyState !== 'loading') {
  initTermsConsent();
} else {
  document.addEventListener('DOMContentLoaded', initTermsConsent);
}

export { initTermsConsent };
