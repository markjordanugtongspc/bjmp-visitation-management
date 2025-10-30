/**
 * Quick Action Modals
 * Auto-opens modals when clicking dashboard quick action buttons
 */

document.addEventListener('DOMContentLoaded', () => {
  // Handle "Register Allowed Visitor" button click on dashboard
  const registerAllowedBtn = document.getElementById('register-allowed-visitor-btn');
  if (registerAllowedBtn) {
    registerAllowedBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      // Try to open modal directly if we're on the visitors page
      const existingModalBtn = document.getElementById('open-manual-registration');
      if (existingModalBtn) {
        existingModalBtn.click();
        return;
      }
      
      // Otherwise, navigate to the page and open modal
      sessionStorage.setItem('openAllowedVisitorModal', 'true');
      window.location.href = registerAllowedBtn.href;
    });
  }

  // Handle "New Manual Registration" button click on dashboard
  const newManualBtn = document.getElementById('new-manual-registration-btn');
  if (newManualBtn) {
    newManualBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      // Try to open modal directly if we're on the requests page
      const existingModalBtn = document.getElementById('open-manual-registration');
      if (existingModalBtn) {
        existingModalBtn.click();
        return;
      }
      
      // Otherwise, navigate to the page and open modal
      sessionStorage.setItem('openManualRegistrationModal', 'true');
      window.location.href = newManualBtn.href;
    });
  }

  // Check if we need to open a modal on this page
  // For Allowed Visitors page (visitors.blade.php)
  if (sessionStorage.getItem('openAllowedVisitorModal') === 'true') {
    sessionStorage.removeItem('openAllowedVisitorModal');
    
    // Wait for page to fully load, then trigger the modal
    setTimeout(() => {
      const registerBtn = document.getElementById('open-manual-registration');
      if (registerBtn) {
        registerBtn.click();
      }
    }, 500);
  }

  // For Visitation Requests page (requests.blade.php)
  if (sessionStorage.getItem('openManualRegistrationModal') === 'true') {
    sessionStorage.removeItem('openManualRegistrationModal');
    
    // Wait for page to fully load, then trigger the modal
    setTimeout(() => {
      const manualBtn = document.getElementById('open-manual-registration');
      if (manualBtn) {
        manualBtn.click();
      }
    }, 500);
  }
});
