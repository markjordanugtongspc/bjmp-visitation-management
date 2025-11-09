/**
 * Advanced File Uploader Component for Supervision Documents
 * Handles uploading files to category-specific folders
 */

// Configuration
const UPLOAD_BASE_PATH = '/storage/supervision/';
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

/**
 * Initialize the file uploader
 */
export function initFileUploader() {
  console.log('Initializing advanced file uploader...');
  
  // Setup form submission handler
  const form = document.getElementById('supervision-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
}

/**
 * Handle form submission with file upload
 * @param {Event} e - Form submission event
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const fileInput = document.getElementById('file_input');
  const categorySelect = document.getElementById('guideline-category');
  const titleInput = document.getElementById('guideline-title');
  const summaryInput = document.getElementById('guideline-summary');
  
  if (!fileInput || !fileInput.files.length || !categorySelect || !titleInput) {
    showUploadError('Missing required fields');
    return;
  }
  
  const file = fileInput.files[0];
  const category = categorySelect.value;
  const title = titleInput.value.trim();
  const summary = summaryInput?.value?.trim() || '';
  
  // Validate file
  if (!validateFile(file)) {
    return;
  }
  
  // Show loading state
  showUploadProgress('Uploading file...');
  
  try {
    // Upload the file
    const uploadResult = await uploadFileToCategory(file, category, title, summary);
    
    // Process the result
    if (uploadResult.success) {
      showUploadSuccess('File uploaded successfully!', uploadResult);
      
      // Update the UI with the new file
      updateUIWithNewFile(uploadResult);
      
      // Reset the form
      const form = document.getElementById('supervision-form');
      if (form) {
        form.reset();
      }
      
      // Clear any file preview
      clearFilePreview();
      
    } else {
      showUploadError(uploadResult.message || 'Upload failed');
    }
  } catch (error) {
    console.error('File upload error:', error);
    showUploadError('An error occurred during upload: ' + error.message);
  }
}

/**
 * Validate the file before upload
 * @param {File} file - The file to validate
 * @returns {boolean} - Whether the file is valid
 */
function validateFile(file) {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    showUploadError(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    return false;
  }
  
  // Check file extension
  const extension = file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    showUploadError(`Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`);
    return false;
  }
  
  return true;
}

/**
 * Upload file to the specific category folder
 * @param {File} file - The file to upload
 * @param {string} category - The category folder
 * @param {string} title - The document title
 * @param {string} summary - The document summary
 * @returns {Promise<Object>} - Upload result
 */
async function uploadFileToCategory(file, category, title, summary) {
  return new Promise((resolve, reject) => {
    // Get API endpoints from data attributes
    const uploadUrl = document.querySelector('[data-upload-url]')?.dataset.uploadUrl;
    const csrfToken = document.querySelector('[data-csrf-token]')?.dataset.csrfToken;
    
    if (!uploadUrl || !csrfToken) {
      reject(new Error('API endpoints not configured'));
      return;
    }

    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('title', title);
    formData.append('summary', summary);
    formData.append('_token', csrfToken);
    
    // Use fetch to send the file to the server
    fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      try {
        if (data && data.success && data.data) {
          console.info('[Supervision Upload] Stored:', {
            id: data.data.id,
            title: data.data.title,
            category: data.data.category,
            storage_type: data.data.storage_type,
            file_path: data.data.file_path,
            public_url: data.data.public_url,
            api_preview_url: data.data.api_preview_url
          });
        } else {
          console.warn('[Supervision Upload] Unexpected response shape:', data);
        }
      } catch (e) {
        console.warn('[Supervision Upload] Log error:', e);
      }
      resolve(data);
    })
    .catch(error => {
      console.error('Upload error:', error);
      reject(error);
    });
  });
}

/**
 * Show upload progress
 * @param {string} message - Progress message
 */
function showUploadProgress(message) {
  if (typeof window !== 'undefined' && window.Swal) {
    const base = window.ThemeManager ? window.ThemeManager.getSwalConfig({
      title: 'Uploading...',
      html: message,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => { window.Swal.showLoading(); }
    }) : {
      title: 'Uploading...',
      html: message,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => { window.Swal.showLoading(); }
    };
    window.Swal.fire(base);
  }
}

/**
 * Show upload success message
 * @param {string} message - Success message
 * @param {Object} result - Upload result
 */
function showUploadSuccess(message, result) {
  if (typeof window !== 'undefined' && window.Swal) {
    const cfg = window.ThemeManager ? window.ThemeManager.getSwalConfig({
      icon: 'success',
      title: 'Success!',
      text: message,
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
      toast: true,
      position: 'top-end'
    }) : {
      icon: 'success',
      title: 'Success!',
      text: message,
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
      toast: true,
      position: 'top-end'
    };
    window.Swal.fire(cfg);
  }
}

/**
 * Show upload error message
 * @param {string} message - Error message
 */
function showUploadError(message) {
  if (typeof window !== 'undefined' && window.Swal) {
    const cfg = window.ThemeManager ? window.ThemeManager.getSwalConfig({
      icon: 'error',
      title: 'Upload Error',
      text: message,
      timer: 3000,
      showConfirmButton: true,
      confirmButtonText: 'OK'
    }) : {
      icon: 'error',
      title: 'Upload Error',
      text: message,
      timer: 3000,
      showConfirmButton: true,
      confirmButtonText: 'OK'
    };
    window.Swal.fire(cfg);
  }
}

/**
 * Update UI with the newly uploaded file
 * @param {Object} result - Upload result
 */
function updateUIWithNewFile(result) {
  // Import the refreshSupervisionData function from supervision-cards.js
  import('./supervision-cards.js')
    .then(module => {
      if (module.refreshSupervisionData) {
        module.refreshSupervisionData();
      }
    })
    .catch(err => {
      console.error('Failed to import supervision-cards.js:', err);
    });
}

/**
 * Clear file preview
 */
function clearFilePreview() {
  // Import the file-preview module to clear the preview
  import('./file-preview.js')
    .then(module => {
      if (module.clearPreview) {
        module.clearPreview();
      }
    })
    .catch(err => {
      console.error('Failed to import file-preview.js:', err);
    });
}