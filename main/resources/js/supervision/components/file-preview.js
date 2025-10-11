// File Preview Component
// Handles dynamic file preview updates, iframe loading, and category display

// File type configurations
const FILE_TYPES = {
  'application/pdf': { 
    name: 'PDF', 
    icon: 'M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm6 1.414L18.586 10H14a2 2 0 0 1-2-2V3.414z',
    color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/40 ring-red-500/20',
    canPreview: true
  },
  'application/msword': { 
    name: 'DOC', 
    icon: 'M4 4a2 2 0 0 1 2-2h8l4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4zm8 0v4h4l-4-4z',
    color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/40 ring-blue-500/20',
    canPreview: true
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    name: 'DOCX', 
    icon: 'M4 4a2 2 0 0 1 2-2h8l4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4zm8 0v4h4l-4-4z',
    color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/40 ring-blue-500/20',
    canPreview: true
  }
};

// Full screen icon SVG path
const FULLSCREEN_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M5 19h2q.425 0 .713.288T8 20t-.288.713T7 21H4q-.425 0-.712-.288T3 20v-3q0-.425.288-.712T4 16t.713.288T5 17zm14 0v-2q0-.425.288-.712T20 16t.713.288T21 17v3q0 .425-.288.713T20 21h-3q-.425 0-.712-.288T16 20t.288-.712T17 19zM5 5v2q0 .425-.288.713T4 8t-.712-.288T3 7V4q0-.425.288-.712T4 3h3q.425 0 .713.288T8 4t-.288.713T7 5zm14 0h-2q-.425 0-.712-.288T16 4t.288-.712T17 3h3q.425 0 .713.288T21 4v3q0 .425-.288.713T20 8t-.712-.288T19 7z" stroke-width="0.3" stroke="currentColor"/></svg>';

// Category color mappings (matching supervision-form.js)
const CATEGORY_COLORS = {
  // Lowercase keys for case-insensitive matching
  'operations': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'intake': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  'safety': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  'medical': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
  'visitation': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  'training': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300',
  'discipline': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  'emergency': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  
  // Add capitalized versions for direct matching
  'Operations': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Intake': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  'Safety': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  'Medical': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
  'Visitation': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  'Training': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300',
  'Discipline': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  'Emergency': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

// Initialize file preview functionality
export function initFilePreview() {
  console.log('Initializing file preview...');
  
  // Setup file input listener
  setupFileInputListener();
  
  // Setup category selector listener
  setupCategoryListener();
  
  // Setup remove file button
  setupRemoveFileButton();
  
  // Listen for custom category selection events from supervision-form.js
  window.addEventListener('categorySelected', function(e) {
    if (e.detail && e.detail.value && e.detail.label) {
      updateCategoryPreview(e.detail.value, e.detail.label);
    }
  });
}

// Setup file input change listener
function setupFileInputListener() {
  const fileInput = document.getElementById('file_input');
  if (!fileInput) return;
  
  // Remove any existing event listeners first to prevent duplicates
  fileInput.removeEventListener('change', handleFileChange);
  
  // Add the event listener
  fileInput.addEventListener('change', handleFileChange);
}

// Handle file input change
function handleFileChange(e) {
  const file = e.target.files[0];
  
  if (!file) {
    clearPreview();
    return;
  }
  
  updateFilePreview(file);
  
  // Also update category if already selected
  const categorySelect = document.getElementById('guideline-category');
  if (categorySelect && categorySelect.value) {
    const selectedOption = categorySelect.options[categorySelect.selectedIndex];
    updateCategoryPreview(categorySelect.value, selectedOption.textContent);
  }
}

// Update file preview with selected file
function updateFilePreview(file) {
  const fileType = FILE_TYPES[file.type] || getFileTypeByExtension(file.name);
  const fileSize = formatFileSize(file.size);
  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  // Update status
  updatePreviewStatus('File selected', 'success');
  
  // Update file header
  updateFileHeader(file.name, fileType, fileSize, currentDate);
  
  // Update file preview
  updateFilePreviewArea(file, fileType);
  
  // Show file header and metadata
  showFileElements();
}

// Update preview status indicator
function updatePreviewStatus(text, type = 'default') {
  const statusEl = document.getElementById('preview-status');
  if (!statusEl) return;
  
  const colors = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  };
  
  statusEl.className = `text-xs px-2 py-1 rounded-full ${colors[type] || colors.default}`;
  statusEl.textContent = text;
}

// Update file header information
function updateFileHeader(fileName, fileType, fileSize, date) {
  // Update file name
  const fileNameEl = document.getElementById('file-name');
  if (fileNameEl) fileNameEl.textContent = fileName;
  
  // Update file type
  const fileTypeEl = document.getElementById('file-type');
  if (fileTypeEl) fileTypeEl.textContent = fileType.name;
  
  // Update file size
  const fileSizeEl = document.getElementById('file-size');
  if (fileSizeEl) fileSizeEl.textContent = fileSize;
  
  // Update file date
  const fileDateEl = document.getElementById('file-date');
  if (fileDateEl) fileDateEl.textContent = `Uploaded ${date}`;
  
  // Update file icon
  const fileIconEl = document.getElementById('file-icon');
  if (fileIconEl) {
    fileIconEl.className = `h-12 w-12 flex items-center justify-center rounded-xl ${fileType.color} ring-1`;
    fileIconEl.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="${fileType.icon}"/>
      </svg>
    `;
  }
}

// Update file preview area with iframe
function updateFilePreviewArea(file, fileType) {
  const emptyPreview = document.getElementById('empty-preview');
  const previewContainer = document.getElementById('file-preview-container');
  const iframe = document.getElementById('file-preview-iframe');
  
  if (!emptyPreview || !previewContainer || !iframe) return;
  
  // Hide empty state
  emptyPreview.classList.add('hidden');
  
  // Show preview container
  previewContainer.classList.remove('hidden');
  previewContainer.classList.add('flex-1', 'flex', 'flex-col');
  
  // Add fullscreen button
  const fullscreenBtn = document.createElement('button');
  fullscreenBtn.className = 'absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-gray-800/80 rounded-md text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 cursor-pointer z-10';
  fullscreenBtn.innerHTML = FULLSCREEN_ICON;
  fullscreenBtn.setAttribute('aria-label', 'Toggle fullscreen');
  fullscreenBtn.onclick = () => toggleFullscreen(iframe);
  
  // Add the fullscreen button to the preview container if it doesn't exist already
  const existingBtn = previewContainer.querySelector('.fullscreen-btn');
  if (!existingBtn) {
    fullscreenBtn.classList.add('fullscreen-btn');
    previewContainer.style.position = 'relative';
    previewContainer.appendChild(fullscreenBtn);
  }
  
  if (fileType.canPreview) {
    if (file.type === 'application/pdf') {
      // For PDFs, use the file URL directly
      const fileURL = URL.createObjectURL(file);
      iframe.src = fileURL;
      
      // Clean up object URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(fileURL);
      }, 60000);
    } else if (file.type.includes('word') || file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
      // For DOC/DOCX files, show a custom preview with file info
      showDocumentPreview(file, iframe);
    } else {
      showPreviewError('Preview not available for this file type');
    }
    
    // Handle iframe load errors
    iframe.onerror = () => {
      showPreviewError('Unable to preview this file type');
    };
  } else {
    showPreviewError('Preview not available for this file type');
  }
}

// Toggle fullscreen for iframe
function toggleFullscreen(element) {
  if (!document.fullscreenElement) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) { /* Safari */
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { /* IE11 */
      element.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    }
  }
}

// Show document preview for DOC/DOCX files
function showDocumentPreview(file, iframe) {
  const fileSize = formatFileSize(file.size);
  const uploadDate = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Create a rich preview for Word documents
  iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document Preview</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          color: #334155;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .preview-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          padding: 32px;
          max-width: 500px;
          width: 100%;
          text-align: center;
          border: 1px solid #e2e8f0;
        }
        .doc-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .doc-icon svg {
          width: 40px;
          height: 40px;
          fill: white;
        }
        .file-name {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
          word-break: break-word;
        }
        .file-details {
          color: #64748b;
          font-size: 14px;
          margin-bottom: 24px;
          line-height: 1.5;
        }
        .preview-note {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 16px;
          font-size: 13px;
          color: #475569;
          line-height: 1.4;
        }
        .preview-note strong {
          color: #1e293b;
        }
        .status-badge {
          display: inline-block;
          background: #dcfce7;
          color: #166534;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 16px;
        }
        @media (prefers-color-scheme: dark) {
          body {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #e2e8f0;
          }
          .preview-container {
            background: #1e293b;
            border-color: #334155;
          }
          .file-name { color: #f1f5f9; }
          .file-details { color: #94a3b8; }
          .preview-note {
            background: #334155;
            border-color: #475569;
            color: #cbd5e1;
          }
          .preview-note strong { color: #f1f5f9; }
          .status-badge {
            background: #166534;
            color: #dcfce7;
          }
        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <div class="status-badge">✓ File Ready</div>
        <div class="doc-icon">
          <svg viewBox="0 0 24 24">
            <path d="M4 4a2 2 0 0 1 2-2h8l4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4zm8 0v4h4l-4-4z"/>
          </svg>
        </div>
        <div class="file-name">${file.name}</div>
        <div class="file-details">
          <div><strong>Size:</strong> ${fileSize}</div>
          <div><strong>Type:</strong> Microsoft Word Document</div>
          <div><strong>Uploaded:</strong> ${uploadDate}</div>
        </div>
      </div>
    </body>
    </html>
  `);
}

// Show preview error
function showPreviewError(message) {
  const iframe = document.getElementById('file-preview-iframe');
  if (!iframe) return;
  
  iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(`
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: #f9fafb;
            color: #6b7280;
          }
          .error-container {
            text-align: center;
            padding: 32px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 1px solid #e5e7eb;
          }
          .error-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .error-message {
            font-size: 14px;
            color: #ef4444;
            font-weight: 500;
          }
          @media (prefers-color-scheme: dark) {
            body { background: #111827; color: #9ca3af; }
            .error-container { background: #1f2937; border-color: #374151; }
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <div class="error-icon">⚠️</div>
          <div class="error-message">${message}</div>
        </div>
      </body>
    </html>
  `);
  
  // Add fullscreen button even for error state
  const previewContainer = document.getElementById('file-preview-container');
  if (previewContainer) {
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-gray-800/80 rounded-md text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 cursor-pointer z-10 fullscreen-btn';
    fullscreenBtn.innerHTML = FULLSCREEN_ICON;
    fullscreenBtn.setAttribute('aria-label', 'Toggle fullscreen');
    fullscreenBtn.onclick = () => toggleFullscreen(iframe);
    
    const existingBtn = previewContainer.querySelector('.fullscreen-btn');
    if (!existingBtn) {
      previewContainer.style.position = 'relative';
      previewContainer.appendChild(fullscreenBtn);
    }
  }
}

// Show file-related elements
function showFileElements() {
  const fileHeader = document.getElementById('file-header');
  const fileMetadata = document.getElementById('file-metadata');
  const removeBtn = document.getElementById('remove-file-btn');
  
  if (fileHeader) fileHeader.classList.remove('hidden');
  if (fileMetadata) fileMetadata.classList.remove('hidden');
  if (removeBtn) {
    removeBtn.classList.remove('hidden');
    removeBtn.classList.add('inline-flex');
  }
}

// Clear preview and reset to empty state
export function clearPreview() {
  // Update status
  updatePreviewStatus('No file selected');
  
  // Hide file elements
  const fileHeader = document.getElementById('file-header');
  const fileMetadata = document.getElementById('file-metadata');
  const removeBtn = document.getElementById('remove-file-btn');
  const emptyPreview = document.getElementById('empty-preview');
  const previewContainer = document.getElementById('file-preview-container');
  
  if (fileHeader) fileHeader.classList.add('hidden');
  if (fileMetadata) fileMetadata.classList.add('hidden');
  if (removeBtn) {
    removeBtn.classList.add('hidden');
    removeBtn.classList.remove('inline-flex');
  }
  if (emptyPreview) emptyPreview.classList.remove('hidden');
  if (previewContainer) {
    previewContainer.classList.add('hidden');
    previewContainer.classList.remove('flex-1', 'flex', 'flex-col');
  }
  
  // Clear iframe
  const iframe = document.getElementById('file-preview-iframe');
  if (iframe) iframe.src = '';
  
  // Reset category
  updateCategoryPreview('', 'Select a category');
}

// Setup category selector listener
function setupCategoryListener() {
  const categorySelect = document.getElementById('guideline-category');
  if (!categorySelect) return;
  
  // Remove any existing event listeners first to prevent duplicates
  categorySelect.removeEventListener('change', handleCategoryChange);
  
  // Add the event listener
  categorySelect.addEventListener('change', handleCategoryChange);
}

// Handle category selection change
function handleCategoryChange(e) {
  const selectedOption = e.target.options[e.target.selectedIndex];
  const categoryValue = selectedOption.value;
  const categoryLabel = selectedOption.textContent;
  
  updateCategoryPreview(categoryValue, categoryLabel);
}

// Update category preview
function updateCategoryPreview(categoryValue, categoryLabel) {
  const categoryBadge = document.getElementById('category-badge');
  if (!categoryBadge) return;
  
  // Convert to lowercase for case-insensitive matching
  const categoryKey = categoryValue ? categoryValue.toLowerCase() : '';
  
  if (categoryKey && CATEGORY_COLORS[categoryKey]) {
    categoryBadge.className = `inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${CATEGORY_COLORS[categoryKey]}`;
    categoryBadge.textContent = categoryLabel;
  } else if (categoryLabel) {
    // If we have a label but no matching color, still show the label with default styling
    categoryBadge.className = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300';
    categoryBadge.textContent = categoryLabel;
  } else {
    // Fallback case
    categoryBadge.className = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    categoryBadge.textContent = 'Select a category';
  }
}

// Setup remove file button
function setupRemoveFileButton() {
  const removeBtn = document.getElementById('remove-file-btn');
  if (!removeBtn) return;
  
  // Remove any existing event listeners first to prevent duplicates
  removeBtn.removeEventListener('click', handleRemoveFile);
  
  // Add the event listener
  removeBtn.addEventListener('click', handleRemoveFile);
}

// Handle remove file
function handleRemoveFile() {
  const fileInput = document.getElementById('file_input');
  if (fileInput) {
    fileInput.value = '';
    // Trigger change event to update validation
    const changeEvent = new Event('change', { bubbles: true });
    fileInput.dispatchEvent(changeEvent);
  }
  
  clearPreview();
}

// Get file type by extension (fallback)
function getFileTypeByExtension(fileName) {
  const extension = fileName.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'pdf':
      return FILE_TYPES['application/pdf'];
    case 'doc':
      return FILE_TYPES['application/msword'];
    case 'docx':
      return FILE_TYPES['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    default:
      return {
        name: extension.toUpperCase(),
        icon: 'M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm6 1.414L18.586 10H14a2 2 0 0 1-2-2V3.414z',
        color: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 ring-gray-500/20',
        canPreview: false
      };
  }
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
