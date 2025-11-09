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
    
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    await (window.Swal ? window.Swal.fire({
      icon: 'error',
      title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Agreement Required</span>`,
      html: `<p class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">You must agree to the Terms and Conditions before logging in.</p>`,
      confirmButtonText: 'Okay',
      confirmButtonColor: '#3B82F6',
      background: isDarkMode ? '#111827' : '#FFFFFF',
      color: isDarkMode ? '#F9FAFB' : '#111827'
    }) : Promise.resolve());
  });

  // Wire Terms and Conditions link -> open modal
  const termsLink = document.querySelector('a[href="#"][class*="text-blue-"]');
  if (termsLink) {
    termsLink.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Get theme-aware colors from ThemeManager
      const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;

      // Wide, desktop-optimized, Tailwind-styled Terms content, scrollable
      const termsHtml = `
        <div id="terms-scrollable" class="text-left space-y-4 max-h-[60vh] md:max-h-[500px] overflow-y-auto pr-3">
          <h2 class="text-2xl md:text-3xl font-semibold ${isDarkMode ? 'text-gray-50' : 'text-gray-900'} mb-2">BJMP Iligan City — Terms & Conditions</h2>
          <p class="text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">These terms govern the use of the BJMP Iligan City Information & Visitation System by authorized personnel.</p>
          <ul class="list-disc pl-6 space-y-3 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">
            <li><span class="font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">Account Ownership:</span> Officers must use only their assigned personal account. Shared use is strictly prohibited. Officers accept full responsibility for all actions performed using their credentials.</li>
            <li><span class="font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">Data Confidentiality:</span> Information regarding Persons Deprived of Liberty (PDL), visitations, health status, or internal operations is confidential. Unauthorized disclosure is forbidden.</li>
            <li><span class="font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">Audit & Compliance:</span> All actions are logged. Misuse, tampering, or attempts to circumvent system policies may result in administrative and legal actions.</li>
            <li><span class="font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">Device Security:</span> Officers must secure access devices. Lock screens when unattended and report any compromise immediately to ICT.</li>
            <li><span class="font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">Proper Use:</span> Use the system solely for official BJMP functions—PDL management, visitation scheduling, incident recording, and approved administrative tasks.</li>
            <li><span class="font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">Data Integrity:</span> Enter accurate, verifiable data. Falsification or negligent entries are violations subject to sanction.</li>
          </ul>
          
          <div class="mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}">
            <h3 class="text-xl md:text-2xl font-semibold ${isDarkMode ? 'text-gray-50' : 'text-gray-900'} mb-3">Republic Act 10173 — Data Privacy Act of 2012<a href="https://privacy.gov.ph/data-privacy-act/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center ml-2 text-blue-500 hover:text-blue-400 cursor-pointer transition-colors" title="View full text of RA 10173"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a></h3>
            <p class="text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4">This system operates in compliance with the Data Privacy Act of 2012, which protects personal information in information and communications systems. The following summarizes key provisions applicable to this system:<a href="https://privacy.gov.ph/data-privacy-act/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center ml-1 text-blue-500 hover:text-blue-400 cursor-pointer transition-colors" title="Reference: RA 10173"><sup class="text-xs font-semibold">[1]</sup></a></p>
            
            <ul class="list-disc pl-6 space-y-3 text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">
              <li><span class="font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">Transparency & Legitimate Purpose:</span> Personal data is collected and processed only for lawful purposes related to BJMP operations. Data subjects are informed about the collection and processing of their personal information.<a href="https://privacy.gov.ph/data-privacy-act/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center ml-1 text-blue-500 hover:text-blue-400 cursor-pointer transition-colors" title="Reference: RA 10173"><sup class="text-xs font-semibold">[2]</sup></a></li>
              
              <li><span class="font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">Rights of Data Subjects:</span> Individuals have the right to be informed, access, rectify, and request erasure or blocking of their personal data. These rights are respected in all system operations.<a href="https://privacy.gov.ph/data-privacy-act/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center ml-1 text-blue-500 hover:text-blue-400 cursor-pointer transition-colors" title="Reference: RA 10173"><sup class="text-xs font-semibold">[3]</sup></a></li>
              
              <li><span class="font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">Security Measures:</span> BJMP implements reasonable and appropriate organizational, physical, and technical security measures to protect personal data from unauthorized access, disclosure, alteration, or destruction.<a href="https://privacy.gov.ph/data-privacy-act/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center ml-1 text-blue-500 hover:text-blue-400 cursor-pointer transition-colors" title="Reference: RA 10173"><sup class="text-xs font-semibold">[4]</sup></a></li>
              
              <li><span class="font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">Accountability:</span> BJMP is accountable for ensuring compliance with the Data Privacy Act. All personnel processing personal data are responsible for maintaining data privacy standards.<a href="https://privacy.gov.ph/data-privacy-act/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center ml-1 text-blue-500 hover:text-blue-400 cursor-pointer transition-colors" title="Reference: RA 10173"><sup class="text-xs font-semibold">[5]</sup></a></li>
              
              <li><span class="font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">Proportionality:</span> Personal data processing is limited to what is adequate, relevant, and necessary for the declared purpose. Excessive or unnecessary data collection is prohibited.<a href="https://privacy.gov.ph/data-privacy-act/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center ml-1 text-blue-500 hover:text-blue-400 cursor-pointer transition-colors" title="Reference: RA 10173"><sup class="text-xs font-semibold">[6]</sup></a></li>
              
              <li><span class="font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">Penalties:</span> Unauthorized processing, accessing, or disposal of personal information in violation of the Data Privacy Act may result in imprisonment and fines as prescribed by law.<a href="https://privacy.gov.ph/data-privacy-act/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center ml-1 text-blue-500 hover:text-blue-400 cursor-pointer transition-colors" title="Reference: RA 10173"><sup class="text-xs font-semibold">[7]</sup></a></li>
            </ul>
            
            <p class="text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-4 italic">For the complete text of Republic Act 10173, please visit <a href="https://privacy.gov.ph/data-privacy-act/" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-400 cursor-pointer underline">privacy.gov.ph/data-privacy-act/</a></p>
          </div>
          
          <p class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-4">By accepting, you agree to comply with these terms and understand that violations may lead to disciplinary measures in accordance with BJMP policies and applicable laws, including the Data Privacy Act of 2012.</p>
        </div>
        <div id="terms-buttons-placeholder"></div>
      `;

      // Fire SweetAlert2 with hidden buttons initially, wide on desktop, buttons right
      const result = await (window.Swal ? window.Swal.fire({
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Terms & Conditions</span>`,
        html: termsHtml,
        showCancelButton: true,
        confirmButtonText: 'Accept',
        cancelButtonText: 'Decline',
        background: isDarkMode ? '#111827' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827',
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
