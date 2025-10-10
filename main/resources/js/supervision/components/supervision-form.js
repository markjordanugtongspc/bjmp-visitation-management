// Supervision Form Component
// Handles form validation, file uploads, and adding new supervision cards
// Contains placeholder functionality that can be replaced with backend integration

// Configuration constants
const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.docx', '.doc'];
const DESCRIPTION_MIN_LENGTH = 50;

// Category configuration with color mappings
const CATEGORIES = [
  { value: 'operations', label: 'Operations', color: 'blue' },
  { value: 'intake', label: 'Intake', color: 'emerald' },
  { value: 'safety', label: 'Safety', color: 'amber' },
  { value: 'medical', label: 'Medical', color: 'rose' },
  { value: 'visitation', label: 'Visitation', color: 'indigo' },
  { value: 'training', label: 'Training', color: 'fuchsia' },
  { value: 'discipline', label: 'Discipline', color: 'teal' },
  { value: 'emergency', label: 'Emergency', color: 'red' }
];

// SVG path templates for random icon generation
const SVG_PATHS = [
  'M6 4a2 2 0 00-2 2v12.5a.5.5 0 00.777.416L8 17l3.223 1.916a.5.5 0 00.554 0L15 17l3.223 1.916A.5.5 0 0019 18.5V6a2 2 0 00-2-2z',
  'M8.75 2.75A2.75 2.75 0 006 5.5v13a2.75 2.75 0 002.75 2.75h8.5A2.75 2.75 0 0020 18.5v-13A2.75 2.75 0 0017.25 2.75zM9.5 6h7v1.5h-7zM9.5 9h7v1.5h-7zM9.5 12h7v1.5h-7z',
  'M12 2a7 7 0 017 7v2a7 7 0 01-14 0V9a7 7 0 017-7z M11 14h2v6h-2z',
  'M3 7a4 4 0 014-4h10a4 4 0 014 4v2H3z M21 10H3v7a4 4 0 004 4h10a4 4 0 004-4z',
  'M7 7h10v2H7zM7 11h10v2H7zM7 15h10v2H7z',
  'M12 2a7 7 0 00-7 7v2a7 7 0 0014 0V9a7 7 0 00-7-7zm0 12a3 3 0 113-3 3 3 0 01-3 3z',
  'M5 3a2 2 0 00-2 2v9.764A3.236 3.236 0 006.236 18H18a3 3 0 003-3V5a2 2 0 00-2-2z M7 21a1 1 0 01-1-1v-2h12v2a1 1 0 01-1 1z',
  'M12 2a9 9 0 00-9 9v4a3 3 0 003 3h1v2a1 1 0 001.555.832L12 19h6a3 3 0 003-3v-4a9 9 0 00-9-9z'
];

// Initialize the form functionality
export function initSupervisionForm() {
  console.log('Initializing supervision form...');
  
  const form = document.getElementById('supervision-form');
  if (!form) {
    console.warn('Supervision form not found');
    return;
  }

  setupFormValidation();
  setupFileUpload();
  setupCategorySelector();
  setupFormSubmission();
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
        red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      };
      
      const badge = document.createElement('span');
      badge.className = `category-badge absolute right-10 top-1/2 transform -translate-y-1/2 px-2 py-0.5 text-xs font-medium rounded-full ${badgeColors[color] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`;
      badge.textContent = selectedOption.textContent;
      
      // Position the badge inside the select container
      categorySelect.parentNode.style.position = 'relative';
      categorySelect.parentNode.appendChild(badge);
    }
  });
}

// Setup form submission
function setupFormSubmission() {
  const form = document.getElementById('supervision-form');
  
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const titleInput = document.getElementById('guideline-title');
    const summaryInput = document.getElementById('guideline-summary');
    const categorySelect = document.getElementById('guideline-category');
    const fileInput = document.getElementById('file_input');
    
    let isValid = true;
    
    // Validate title
    if (!titleInput.value.trim()) {
      showInputError(titleInput, 'Title is required');
      isValid = false;
    }
    
    // Validate summary
    if (summaryInput.value.trim().length < DESCRIPTION_MIN_LENGTH) {
      showInputError(summaryInput, `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters`);
      isValid = false;
    }
    
    // Validate category
    if (!categorySelect.value) {
      showInputError(categorySelect, 'Please select a category');
      isValid = false;
    }
    
    // Validate file
    if (!fileInput.files[0]) {
      showInputError(fileInput, 'Please upload a file');
      isValid = false;
    }
    
    if (!isValid) return;
    
    // Gather form data
    const formData = {
      title: titleInput.value.trim(),
      description: summaryInput.value.trim(),
      category: categorySelect.value,
      categoryLabel: categorySelect.options[categorySelect.selectedIndex].textContent,
      categoryColor: categorySelect.options[categorySelect.selectedIndex].dataset.color || 'blue',
      file: fileInput.files[0],
      updatedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      // Generate random page count for demo purposes
      pages: Math.floor(Math.random() * 30) + 1,
      // Generate random icon SVG path from the templates
      iconSvg: SVG_PATHS[Math.floor(Math.random() * SVG_PATHS.length)]
    };
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Processing...
    `;
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // PLACEHOLDER: This is where you would send data to the backend
      // For now, we'll store in localStorage as a placeholder
      saveSupervisionItem(formData);
      
      // Add the new card to the UI
      addNewSupervisionCard(formData);
      
      // Close modal (if using Flowbite modal)
      const modal = document.getElementById('createManualModal');
      if (window.Flowbite && modal) {
        const modalInstance = window.Flowbite.getInstance(modal);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
      
      // Show success message
      showToast('Success', 'Manual uploaded successfully!', 'success');
      
      // Reset form
      form.reset();
      
      // Clear any badges
      const existingBadge = categorySelect.parentNode.querySelector('.category-badge');
      if (existingBadge) {
        existingBadge.remove();
      }
      
      // Clear file info
      const fileInfo = document.getElementById('file-info');
      if (fileInfo) fileInfo.innerHTML = '';
      
      // Reset counter
      const counter = document.getElementById('summary-counter');
      if (counter) counter.textContent = `0/${DESCRIPTION_MIN_LENGTH}`;
      
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('Error', 'Failed to upload manual. Please try again.', 'error');
    } finally {
      // Restore button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

// Save supervision item to localStorage (placeholder for backend)
function saveSupervisionItem(formData) {
  // PLACEHOLDER: In a real implementation, this would be an API call
  // For now, we'll use localStorage as a placeholder
  
  // Create a file reader to get the file as base64 (for demo purposes)
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          // Get existing items or initialize empty array
          const existingItems = JSON.parse(localStorage.getItem('supervisionItems') || '[]');
          
          // Create new item
          const newItem = {
            id: Date.now(), // Use timestamp as ID
            name: formData.title,
            type: formData.categoryLabel,
            category: formData.category,
            description: formData.description,
            updatedDate: formData.updatedDate,
            pages: formData.pages,
            icon: formData.categoryColor,
            iconSvg: formData.iconSvg,
            status: 'active',
            priority: 'Medium',
            progress: 100,
            // Store file info (not the actual file in localStorage)
            fileInfo: {
              name: formData.file.name,
              size: formData.file.size,
              type: formData.file.type,
              // In a real app, we would upload the file to a server
              // This is just for demo purposes
              dataPreview: e.target.result.substring(0, 100) + '...' // Just store a preview
            }
          };
          
          // Add to existing items
          existingItems.unshift(newItem); // Add to beginning
          
          // Save back to localStorage
          localStorage.setItem('supervisionItems', JSON.stringify(existingItems));
          
          // Set a cookie to indicate new items were added (for demo purposes)
          document.cookie = `newSupervisionItem=${Date.now()}; path=/; max-age=86400`;
          
          resolve(newItem);
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = function() {
        reject(new Error('Failed to read file'));
      };
      
      // Read file as data URL (base64)
      reader.readAsDataURL(formData.file);
    } catch (err) {
      reject(err);
    }
  });
}

// Add new supervision card to the UI
function addNewSupervisionCard(formData) {
  // PLACEHOLDER: In a real implementation, we would refresh data from the server
  // For now, we'll manually add the card to the UI
  
  // Import the refreshSupervisionData function from supervision-cards.js
  // This is a cleaner approach than directly manipulating the DOM
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
