// Entry for Super Vision page JS
// Loads Flowbite (via CDN in blade) and SweetAlert2 interactions

import initSupervisionModalInteractions from './components/supervision-modal.js';
import { initializeSupervisionCards, refreshSupervisionData } from './components/supervision-cards.js';
import { initSupervisionForm } from './components/supervision-form.js';
import { initFlowbiteComponents } from './components/flowbite-init.js';
import { initFilePreview } from './components/file-preview.js';
import { initFileUploader } from './components/file-uploader.js';
import { initCategoryFilter } from './components/category-filter.js';

function ready(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

// Setup modal handlers for direct DOM manipulation
function setupModalHandlers() {
  const modal = document.getElementById('createManualModal');
  if (!modal) return;
  
  // Create manual button
  const createManualBtn = document.querySelector('[data-modal-target="createManualModal"]');
  if (createManualBtn) {
    createManualBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showModal(modal);
    });
  }
  
  // Close button
  const closeBtn = document.getElementById('closeManualModalBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      hideModal(modal);
    });
  }
  
  // Cancel button
  const cancelBtn = document.getElementById('cancelManualModalBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function(e) {
      e.preventDefault();
      hideModal(modal);
    });
  }
  
  // Click outside to close
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      hideModal(modal);
    }
  });
}

// Show modal
function showModal(modal) {
  // Try using Flowbite's modal instance if available
  if (modal._modalInstance) {
    modal._modalInstance.show();
  } else {
    // Fallback: toggle visibility manually
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }
}

// Hide modal
function hideModal(modal) {
  // Try using Flowbite's modal instance if available
  if (modal._modalInstance) {
    modal._modalInstance.hide();
  } else {
    // Fallback: toggle visibility manually
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
}

ready(() => {
  // Initialize Flowbite components first
  initFlowbiteComponents();
  
  // Initialize supervision-specific behaviors
  initSupervisionModalInteractions();
  
  // Initialize category filter (must be before cards initialization)
  initCategoryFilter();
  
  // Initialize supervision cards carousel
  initializeSupervisionCards();
  
  // Initialize supervision form with validation and file upload
  initSupervisionForm();
  
  // Initialize file preview functionality
  initFilePreview();
  
  // Initialize advanced file uploader
  initFileUploader();
  
  // Add direct click handlers for the modal buttons
  setupModalHandlers();

  // If user opens Create Manual, show the info modal via helper
  const createManualBtn = document.querySelector('[data-modal-target="createManualModal"]');
  if (createManualBtn && window.SupervisionModal && typeof window.SupervisionModal.showGuidelinesInfo === 'function') {
    createManualBtn.addEventListener('click', () => {
      setTimeout(() => window.SupervisionModal.showGuidelinesInfo(), 80);
    });
  }
});


