// Initialize Flowbite components
// This module ensures that Flowbite's modal, dropdown, and other components are properly initialized

export function initFlowbiteComponents() {
  console.log('Initializing Flowbite components...');
  
  // Wait for Flowbite to be available
  if (typeof window === 'undefined' || !window.Flowbite) {
    console.warn('Flowbite not available');
    return;
  }
  
  // Initialize modals
  initModals();
}

// Initialize modals
function initModals() {
  const modalButtons = document.querySelectorAll('[data-modal-toggle], [data-modal-target]');
  const modalCloseButtons = document.querySelectorAll('[data-modal-hide]');
  
  console.log('Found modal buttons:', modalButtons.length);
  console.log('Found close buttons:', modalCloseButtons.length);
  
  // Initialize modals manually if needed
  const modals = document.querySelectorAll('[id$="Modal"]');
  modals.forEach(modal => {
    console.log('Initializing modal:', modal.id);
    
    // Create modal options
    const options = {
      placement: 'center',
      backdrop: 'dynamic',
      backdropClasses: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40',
      closable: true
    };
    
    // Initialize modal
    if (window.Flowbite && window.Flowbite.Modal) {
      const modalInstance = new window.Flowbite.Modal(modal, options);
      
      // Store modal instance in the DOM element
      modal._modalInstance = modalInstance;
      
      // Add click event to toggle buttons
      const toggleButtons = document.querySelectorAll(`[data-modal-target="${modal.id}"], [data-modal-toggle="${modal.id}"]`);
      toggleButtons.forEach(button => {
        button.removeEventListener('click', handleModalToggle);
        button.addEventListener('click', handleModalToggle);
      });
      
      // Add click event to close buttons
      const closeButtons = modal.querySelectorAll('[data-modal-hide]');
      closeButtons.forEach(button => {
        button.removeEventListener('click', handleModalClose);
        button.addEventListener('click', handleModalClose);
      });
    }
  });
}

// Handle modal toggle click
function handleModalToggle(e) {
  e.preventDefault();
  
  const targetId = e.currentTarget.getAttribute('data-modal-target') || 
                  e.currentTarget.getAttribute('data-modal-toggle');
  
  if (!targetId) return;
  
  const modal = document.getElementById(targetId);
  if (!modal || !modal._modalInstance) return;
  
  console.log('Toggling modal:', targetId);
  modal._modalInstance.toggle();
}

// Handle modal close click
function handleModalClose(e) {
  e.preventDefault();
  
  const targetId = e.currentTarget.getAttribute('data-modal-hide');
  if (!targetId) {
    // Try to find the closest modal
    const modal = e.currentTarget.closest('[id$="Modal"]');
    if (modal && modal._modalInstance) {
      console.log('Hiding modal:', modal.id);
      modal._modalInstance.hide();
    }
    return;
  }
  
  const modal = document.getElementById(targetId);
  if (!modal || !modal._modalInstance) return;
  
  console.log('Hiding modal:', targetId);
  modal._modalInstance.hide();
}
