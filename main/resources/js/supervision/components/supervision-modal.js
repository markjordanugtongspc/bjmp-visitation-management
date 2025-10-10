// Supervision Modal Interactions
// Handles modal behaviors for creating, viewing, and managing supervision documents

// Initialize supervision modal interactions
export default function initSupervisionModalInteractions() {
  console.log('Initializing supervision modal interactions...');
  
  // Wait for Flowbite to be available
  if (typeof window === 'undefined') return;
  
  // Setup modal toggle buttons
  setupModalToggles();
  
  // Setup refresh button
  setupRefreshButton();
}

// Setup modal toggle buttons
function setupModalToggles() {
  // Get all modal toggle buttons
  const modalToggles = document.querySelectorAll('[data-modal-toggle], [data-modal-target]');
  
  modalToggles.forEach(toggle => {
    // Remove existing listeners to prevent duplicates
    toggle.removeEventListener('click', handleModalToggle);
    toggle.addEventListener('click', handleModalToggle);
  });
}

// Handle modal toggle click
function handleModalToggle(e) {
  const targetId = e.currentTarget.getAttribute('data-modal-target');
  if (!targetId) return;
  
  const modal = document.getElementById(targetId);
  if (!modal) return;
  
  // If this is the create manual modal, reset the form
  if (targetId === 'createManualModal') {
    const form = modal.querySelector('form');
    if (form) {
      form.reset();
      
      // Clear any error messages
      const errorMessages = form.querySelectorAll('.error-message');
      errorMessages.forEach(msg => msg.remove());
      
      // Reset input borders
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.classList.remove('border-red-500', 'border-green-500');
      });
      
      // Reset file info
      const fileInfo = document.getElementById('file-info');
      if (fileInfo) fileInfo.innerHTML = '';
      
      // Reset summary counter
      const counter = document.getElementById('summary-counter');
      if (counter) counter.textContent = '0/50';
      
      // Remove any category badges
      const categoryBadge = form.querySelector('.category-badge');
      if (categoryBadge) categoryBadge.remove();
    }
  }
}

// Setup refresh button
function setupRefreshButton() {
  const refreshBtn = document.querySelector('[data-action="refresh-supervision"]');
  if (!refreshBtn) return;
  
  // Remove existing listeners to prevent duplicates
  refreshBtn.removeEventListener('click', handleRefreshClick);
  refreshBtn.addEventListener('click', handleRefreshClick);
}

// Handle refresh button click
async function handleRefreshClick(e) {
  e.preventDefault();
  
  // Show loading state
  const refreshBtn = e.currentTarget;
  const originalContent = refreshBtn.innerHTML;
  refreshBtn.innerHTML = `
    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  `;
  refreshBtn.disabled = true;
  
  try {
    // Import the refreshSupervisionData function
    const { refreshSupervisionData } = await import('./supervision-cards.js');
    
    // Refresh data
    await refreshSupervisionData();
  } catch (error) {
    console.error('Error refreshing supervision data:', error);
    
    // Show error toast if SweetAlert2 is available
    if (typeof window !== 'undefined' && window.Swal) {
      const isDarkMode = document.documentElement.classList.contains('dark');
      
      window.Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'error',
        title: 'Failed to refresh data',
        background: isDarkMode ? '#111827' : '#ffffff',
        color: isDarkMode ? '#f3f4f6' : '#1f2937',
        iconColor: '#EF4444'
      });
    }
  } finally {
    // Restore button state
    setTimeout(() => {
      refreshBtn.innerHTML = originalContent;
      refreshBtn.disabled = false;
    }, 500);
  }
}