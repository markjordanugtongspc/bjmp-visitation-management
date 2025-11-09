// Supervision Form Component
// Handles form validation, file uploads, and adding new supervision cards
// Contains placeholder functionality that can be replaced with backend integration

// Configuration constants
const FILE_SIZE_LIMIT = 15 * 1024 * 1024; // 15MB in bytes
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.docx', '.doc'];
const DESCRIPTION_MIN_LENGTH = 50;

// Category configuration with color mappings
const CATEGORIES = [
  { value: 'Operations', label: 'Operations', color: 'blue' },
  { value: 'Intake', label: 'Intake', color: 'emerald' },
  { value: 'Safety', label: 'Safety', color: 'amber' },
  { value: 'Medical', label: 'Medical', color: 'rose' },
  { value: 'Visitation', label: 'Visitation', color: 'indigo' },
  { value: 'Training', label: 'Training', color: 'fuchsia' },
  { value: 'Discipline', label: 'Discipline', color: 'teal' },
  { value: 'Emergency', label: 'Emergency', color: 'red' },
  { value: 'Conjugal', label: 'Conjugal', color: 'pink' }
];

// Category-based icon mapping
const CATEGORY_ICONS = {
  'Operations': 'M21.246 4.86L13.527.411a3.07 3.07 0 0 0-3.071 0l-2.34 1.344v6.209l3.104-1.793a1.52 1.52 0 0 1 1.544 0l3.884 2.241c.482.282.764.78.764 1.328v4.482a1.54 1.54 0 0 1-.764 1.328l-3.884 2.241V24l8.482-4.897a3.08 3.08 0 0 0 1.544-2.656V7.532a3.05 3.05 0 0 0-1.544-2.672M6.588 14.222V2.652L2.754 4.876A3.08 3.08 0 0 0 1.21 7.532v8.915c0 1.095.581 2.108 1.544 2.656L11.236 24v-6.209L7.352 15.55a1.53 1.53 0 0 1-.764-1.328',
  'Intake': 'M8.75 2.75A2.75 2.75 0 006 5.5v13a2.75 2.75 0 002.75 2.75h8.5A2.75 2.75 0 0020 18.5v-13A2.75 2.75 0 0017.25 2.75zM9.5 6h7v1.5h-7zM9.5 9h7v1.5h-7zM9.5 12h7v1.5h-7z',
  'Safety': 'M12 2a7 7 0 017 7v2a7 7 0 01-14 0V9a7 7 0 017-7z M11 14h2v6h-2z',
  'Medical': 'M3 7a4 4 0 014-4h10a4 4 0 014 4v2H3z M21 10H3v7a4 4 0 004 4h10a4 4 0 004-4z',
  'Visitation': 'M7 7h10v2H7zM7 11h10v2H7zM7 15h10v2H7z',
  'Training': 'M12 2a7 7 0 00-7 7v2a7 7 0 0014 0V9a7 7 0 00-7-7zm0 12a3 3 0 113-3 3 3 0 01-3 3z',
  'Discipline': 'M5 3a2 2 0 00-2 2v9.764A3.236 3.236 0 006.236 18H18a3 3 0 003-3V5a2 2 0 00-2-2z M7 21a1 1 0 01-1-1v-2h12v2a1 1 0 01-1 1z',
  'Emergency': 'M12 2a9 9 0 00-9 9v4a3 3 0 003 3h1v2a1 1 0 001.555.832L12 19h6a3 3 0 003-3v-4a9 9 0 00-9-9z',
  'Conjugal': 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
};

// Initialize the form functionality
export function initSupervisionForm() {
  console.log('Initializing supervision form...');
  
  const form = document.getElementById('supervision-form');
  if (!form) {
    console.warn('Supervision form not found');
    return;
  }

  console.log('Supervision form found:', form);
  
  setupFormValidation();
  setupFileUpload();
  setupCategorySelector();
  setupFormSubmission();

  // Optional: initialize drag & drop for the file input
  initDragAndDropForFileInput();
  
  console.log('Supervision form initialized successfully');
}

// Setup form validation for all inputs
function setupFormValidation() {
  const titleInput = document.getElementById('guideline-title');
  const summaryInput = document.getElementById('guideline-summary');
  
  if (titleInput) {
    titleInput.addEventListener('input', validateTitle);
  }
  
  if (summaryInput) {
    summaryInput.addEventListener('input', validateSummary);
    // Add character counter for summary
    summaryInput.insertAdjacentHTML('afterend', `
      <div class="mt-1 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
        <span>Minimum ${DESCRIPTION_MIN_LENGTH} characters required</span>
        <span id="summary-counter">0/${DESCRIPTION_MIN_LENGTH}</span>
      </div>
    `);
    
    // Update counter on input
    summaryInput.addEventListener('input', updateSummaryCounter);
  }
}

// Validate title input
function validateTitle(e) {
  const titleInput = e.target;
  const value = titleInput.value.trim();
  
  if (value.length === 0) {
    titleInput.classList.add('border-red-500');
    titleInput.classList.remove('border-green-500');
    // Show error message
    showInputError(titleInput, 'Title is required');
  } else {
    titleInput.classList.remove('border-red-500');
    titleInput.classList.add('border-green-500');
    // Remove error message
    clearInputError(titleInput);
  }
}

// Validate summary input and enforce minimum length
function validateSummary(e) {
  const summaryInput = e.target;
  const value = summaryInput.value.trim();
  
  if (value.length < DESCRIPTION_MIN_LENGTH) {
    summaryInput.classList.add('border-red-500');
    summaryInput.classList.remove('border-green-500');
    showInputError(summaryInput, `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`);
  } else {
    summaryInput.classList.remove('border-red-500');
    summaryInput.classList.add('border-green-500');
    clearInputError(summaryInput);
  }
  
  updateSummaryCounter();
}

// Update character counter for summary
function updateSummaryCounter() {
  const summaryInput = document.getElementById('guideline-summary');
  const counter = document.getElementById('summary-counter');
  if (summaryInput && counter) {
    const currentLength = summaryInput.value.trim().length;
    counter.textContent = `${currentLength}/${DESCRIPTION_MIN_LENGTH}`;
    
    if (currentLength < DESCRIPTION_MIN_LENGTH) {
      counter.classList.add('text-red-500');
      counter.classList.remove('text-green-500');
    } else {
      counter.classList.remove('text-red-500');
      counter.classList.add('text-green-500');
    }
  }
}

// Setup file upload with validation
function setupFileUpload() {
  const fileInput = document.getElementById('file_input');
  const fileLabel = document.querySelector('label[for="file_input"]');
  const fileInfo = document.getElementById('file-info');
  
  if (!fileInput || !fileLabel) return;
  
  // Update file input label with allowed types
  if (fileLabel) {
    const helpText = fileLabel.querySelector('p');
    if (helpText) {
      helpText.textContent = `Upload PDF, DOC, or DOCX (max ${FILE_SIZE_LIMIT / (1024 * 1024)}MB)`;
    }
  }
  // Also update explicit help element if present
  const explicitHelp = document.getElementById('file_input_help');
  if (explicitHelp) {
    explicitHelp.textContent = `PDF, DOC, or DOCX only (MAX. ${FILE_SIZE_LIMIT / (1024 * 1024)}MB).`;
  }
  
  // Create file info element if it doesn't exist
  if (!fileInfo && fileInput.parentNode) {
    fileInput.insertAdjacentHTML('afterend', `
      <div id="file-info" class="mt-1 text-sm"></div>
    `);
  }
  
  // Handle file selection
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const fileInfo = document.getElementById('file-info');
    
    if (!file) {
      if (fileInfo) fileInfo.innerHTML = '';
      return;
    }
    
    // Validate file type
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const isValidType = ALLOWED_FILE_TYPES.includes(file.type) || 
                       ALLOWED_FILE_EXTENSIONS.includes(fileExtension);
    
    // Validate file size
    const isValidSize = file.size <= FILE_SIZE_LIMIT;
    
    if (!isValidType) {
      fileInput.value = ''; // Clear the input
      if (fileInfo) {
        fileInfo.innerHTML = `
          <span class="text-red-500">Invalid file type. Please upload PDF, DOC, or DOCX files only.</span>
        `;
      }
      return;
    }
    
    if (!isValidSize) {
      fileInput.value = ''; // Clear the input
      if (fileInfo) {
        fileInfo.innerHTML = `
          <span class="text-red-500">File too large. Maximum size is ${FILE_SIZE_LIMIT / (1024 * 1024)}MB.</span>
        `;
      }
      return;
    }
    
    // Valid file
    if (fileInfo) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      fileInfo.innerHTML = `
        <span class="text-green-500">
          <span class="font-medium">${file.name}</span> (${fileSizeMB} MB)
        </span>
      `;
    }
  });
}

// Drag & Drop support for file input
function initDragAndDropForFileInput() {
  const fileInput = document.getElementById('file_input');
  if (!fileInput) return;

  // Create a drop zone wrapper around the input
  const wrapper = document.createElement('div');
  wrapper.className = 'mt-2 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/30 p-4 transition';

  // Move input into wrapper
  fileInput.parentNode.insertBefore(wrapper, fileInput);
  wrapper.appendChild(fileInput);

  const help = document.getElementById('file_input_help');
  if (help) wrapper.appendChild(help);

  // Visual feedback helpers
  function setActive(active) {
    if (active) {
      wrapper.classList.add('border-blue-400');
      wrapper.classList.remove('border-gray-200', 'dark:border-gray-700');
    } else {
      wrapper.classList.remove('border-blue-400');
      wrapper.classList.add('border-gray-200', 'dark:border-gray-700');
    }
  }

  ;['dragenter','dragover'].forEach(evt => {
    wrapper.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      setActive(true);
    });
  });

  ;['dragleave','drop'].forEach(evt => {
    wrapper.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      setActive(false);
    });
  });

  wrapper.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (!dt || !dt.files || !dt.files.length) return;
    fileInput.files = dt.files;
    // Trigger change to run validation & info update
    const changeEvt = new Event('change', { bubbles: true });
    fileInput.dispatchEvent(changeEvt);
  });
}

// Setup category selector with color-coded badges
function setupCategorySelector() {
  const categorySelect = document.getElementById('guideline-category');
  
  if (!categorySelect) return;
  
  // Clear existing options
  categorySelect.innerHTML = '';
  
  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select a category';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  categorySelect.appendChild(defaultOption);
  
  // Add category options
  CATEGORIES.forEach(category => {
    const option = document.createElement('option');
    option.value = category.value;
    option.textContent = category.label;
    option.dataset.color = category.color;
    categorySelect.appendChild(option);
  });
  
  // Style the select with a colored badge based on selection
  categorySelect.addEventListener('change', (e) => {
    const selectedOption = categorySelect.options[categorySelect.selectedIndex];
    const color = selectedOption.dataset.color || 'gray';
    
    // Remove any existing badges
    const existingBadge = categorySelect.parentNode.querySelector('.category-badge');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Add colored badge if a valid option is selected
    if (selectedOption.value) {
      const badgeColors = {
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
        amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
        rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
        indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
        fuchsia: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300',
        teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
        red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
      };
      
      const badge = document.createElement('span');
      badge.className = `category-badge absolute right-12 top-1/2 transform -translate-y-1/2 px-2.5 py-1 text-xs font-medium rounded-full shadow-sm ${badgeColors[color] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`;
      badge.textContent = selectedOption.textContent;
      
      // Position the badge inside the select container with proper z-index
      categorySelect.parentNode.style.position = 'relative';
      categorySelect.parentNode.appendChild(badge);
      
      // Ensure the badge is above the select dropdown
      badge.style.zIndex = '10';
      
      // Also update the file preview category - dispatch a custom event
      try {
        // Create and dispatch a custom event for file-preview.js
        const event = new CustomEvent('categorySelected', {
          detail: {
            value: selectedOption.value,
            label: selectedOption.textContent
          }
        });
        window.dispatchEvent(event);
      } catch (err) {
        console.error('Error dispatching category event:', err);
      }
    }
  });
}

// Setup form submission - handled by file-uploader.js
function setupFormSubmission() {
  // Form submission is now handled by file-uploader.js
  // This function is kept for compatibility but does nothing
  console.log('Form submission handled by file-uploader.js');
}

// Save supervision item via API
async function saveSupervisionItem(formData) {
  try {
    // Get API endpoints from data attributes
    const uploadUrl = document.querySelector('[data-upload-url]')?.dataset.uploadUrl;
    const csrfToken = document.querySelector('[data-csrf-token]')?.dataset.csrfToken;
    
    console.log('Upload URL:', uploadUrl);
    console.log('CSRF Token:', csrfToken ? 'Present' : 'Missing');
    
    if (!uploadUrl || !csrfToken) {
      throw new Error('API endpoints not configured');
    }

    // Create FormData for file upload
    const formDataToSend = new FormData();
    formDataToSend.append('file', formData.file);
    formDataToSend.append('title', formData.title);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('summary', formData.description);
    formDataToSend.append('_token', csrfToken);

    console.log('Sending FormData:', {
      file: formData.file.name,
      title: formData.title,
      category: formData.category,
      summary: formData.description
    });

    // Send POST request to upload endpoint
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formDataToSend,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    const result = await response.json();
    console.log('Response data:', result);

    if (!response.ok) {
      throw new Error(result.message || `Upload failed with status ${response.status}`);
    }

    if (!result.success) {
      throw new Error(result.message || 'Upload failed');
    }

    return result.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Add new supervision card to the UI
function addNewSupervisionCard(serverResponse) {
  // Refresh data from the server
  import('./supervision-cards.js')
    .then(module => {
      if (module.refreshSupervisionData) {
        module.refreshSupervisionData();
      } else {
        console.warn('refreshSupervisionData function not found in supervision-cards.js');
        // Fallback: reload the page
        window.location.reload();
      }
    })
    .catch(err => {
      console.error('Failed to import supervision-cards.js:', err);
      // Fallback: reload the page
      window.location.reload();
    });
}

// Helper function to show input error
function showInputError(input, message) {
  // Remove any existing error
  clearInputError(input);
  
  // Add error class
  input.classList.add('border-red-500');
  
  // Create error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'text-red-500 text-xs mt-1 error-message';
  errorDiv.textContent = message;
  
  // Insert after input
  input.parentNode.insertBefore(errorDiv, input.nextSibling);
}

// Helper function to clear input error
function clearInputError(input) {
  // Remove error class
  input.classList.remove('border-red-500');
  
  // Remove error message
  const errorMessage = input.parentNode.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}

// Helper function to show toast notifications
function showToast(title, message, type = 'info') {
  // Check if SweetAlert2 is available
  if (typeof window !== 'undefined' && window.Swal) {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    const Toast = window.Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: isDarkMode ? '#111827' : '#ffffff',
      color: isDarkMode ? '#f3f4f6' : '#1f2937',
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', window.Swal.stopTimer);
        toast.addEventListener('mouseleave', window.Swal.resumeTimer);
      }
    });
    
    const iconColors = {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    };
    
    Toast.fire({
      icon: type,
      title,
      text: message,
      iconColor: iconColors[type] || iconColors.info
    });
  } else {
    // Fallback to alert if SweetAlert2 is not available
    alert(`${title}: ${message}`);
  }
}
