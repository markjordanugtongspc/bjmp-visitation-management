// Inmates Management System for BJMP
// - Full CRUD operations for inmates
// - Cell management and capacity tracking
// - Mobile responsive design with SweetAlert2
// - Real-time updates for both desktop and mobile views

document.addEventListener('DOMContentLoaded', () => {
  // Get containers for desktop and mobile views
  const tableBody = document.querySelector('#inmates-table-body');
  const mobileCardsContainer = document.querySelector('#inmates-cards-mobile');
  const addButtons = document.querySelectorAll('[data-add-inmate]');
  const cellsContainer = document.querySelector('#cells-container');
  
  // Detect if we're on mobile
  const isMobile = () => window.innerWidth < 640; // sm breakpoint in Tailwind

  // Sample data structure for inmates
  let inmates = [
    {
      id: 1,
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      middleName: 'Santos',
      age: 35,
      gender: 'Male',
      cellNumber: 'Cell 1',
      crime: 'Theft',
      sentence: '2 years',
      status: 'Active',
      admissionDate: '2024-01-15',
      photo: null
    },
    {
      id: 2,
      firstName: 'Maria',
      lastName: 'Garcia',
      middleName: 'Lopez',
      age: 28,
      gender: 'Female',
      cellNumber: 'Cell 2',
      crime: 'Fraud',
      sentence: '1 year',
      status: 'Active',
      admissionDate: '2024-02-10',
      photo: null
    }
  ];

  // Sample cells data
  let cells = [
    { id: 1, name: 'Cell 1', capacity: 20, currentCount: 1, type: 'Male' },
    { id: 2, name: 'Cell 2', capacity: 15, currentCount: 1, type: 'Female' },
    { id: 3, name: 'Cell 3', capacity: 25, currentCount: 0, type: 'Male' },
    { id: 4, name: 'Cell 4', capacity: 18, currentCount: 0, type: 'Female' }
  ];

  // Initialize the page
  function initializePage() {
    renderCells();
    renderInmates();
    initializeExistingItems();
    updateStatistics();
  }

  // Render cells overview
  function renderCells() {
    if (!cellsContainer) return;
    
    cellsContainer.innerHTML = '';
    
    cells.forEach(cell => {
      const cellCard = document.createElement('div');
      const occupancyRate = (cell.currentCount / cell.capacity) * 100;
      const isFull = occupancyRate >= 90;
      const isNearFull = occupancyRate >= 75;
      
      cellCard.className = `p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
        isFull ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
        isNearFull ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
        'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      }`;
      
      cellCard.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">${cell.name}</h3>
          <span class="text-xs px-2 py-1 rounded-full ${
            cell.type === 'Male' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
            'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
          }">${cell.type}</span>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Occupancy</span>
            <span class="font-medium">${cell.currentCount}/${cell.capacity}</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="h-2 rounded-full transition-all duration-300 ${
              isFull ? 'bg-red-500' : isNearFull ? 'bg-yellow-500' : 'bg-green-500'
            }" style="width: ${occupancyRate}%"></div>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            ${Math.round(occupancyRate)}% occupied
          </div>
        </div>
      `;
      
      cellsContainer.appendChild(cellCard);
    });
  }

  // Open inmate modal for add/edit
  function openInmateModal(inmate = {}) {
    const isEdit = !!inmate.id;
    const title = isEdit ? 'Edit Inmate' : 'Add New Inmate';
    
    // Responsive width for the modal
    const width = isMobile() ? '95%' : '42rem';
    
    return window.Swal.fire({
      title: title,
      html: `
        <div class="space-y-4 text-left max-h-[70vh] overflow-y-auto">
          <!-- Personal Information -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">Personal Information</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-300 mb-1">First Name *</label>
                <input id="i-firstname" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                       value="${inmate.firstName || ''}" placeholder="Enter first name" />
              </div>
              <div>
                <label class="block text-xs text-gray-300 mb-1">Last Name *</label>
                <input id="i-lastname" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                       value="${inmate.lastName || ''}" placeholder="Enter last name" />
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-300 mb-1">Middle Name</label>
                <input id="i-middlename" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                       value="${inmate.middleName || ''}" placeholder="Enter middle name" />
              </div>
              <div>
                <label class="block text-xs text-gray-300 mb-1">Age *</label>
                <input id="i-age" type="number" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                       value="${inmate.age || ''}" placeholder="Enter age" min="18" max="100" />
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-300 mb-1">Gender *</label>
                <select id="i-gender" class="w-full appearance-none rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm pr-8">
                  <option value="">Select Gender</option>
                  <option value="Male" ${inmate.gender === 'Male' ? 'selected' : ''}>Male</option>
                  <option value="Female" ${inmate.gender === 'Female' ? 'selected' : ''}>Female</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-300 mb-1">Admission Date *</label>
                <input id="i-admission-date" type="date" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                       value="${inmate.admissionDate || ''}" />
              </div>
            </div>
          </div>
          
          <!-- Legal Information -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">Legal Information</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-300 mb-1">Crime *</label>
                <input id="i-crime" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                       value="${inmate.crime || ''}" placeholder="Enter crime committed" />
              </div>
              <div>
                <label class="block text-xs text-gray-300 mb-1">Sentence *</label>
                <input id="i-sentence" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                       value="${inmate.sentence || ''}" placeholder="e.g., 2 years, Life, etc." />
              </div>
            </div>
          </div>
          
          <!-- Cell Assignment -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">Cell Assignment</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-300 mb-1">Cell Number *</label>
                <select id="i-cell" class="w-full appearance-none rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm pr-8">
                  <option value="">Select Cell</option>
                  ${cells.map(cell => `
                    <option value="${cell.name}" ${inmate.cellNumber === cell.name ? 'selected' : ''} 
                            ${cell.currentCount >= cell.capacity ? 'disabled' : ''}>
                      ${cell.name} (${cell.currentCount}/${cell.capacity}) - ${cell.type}
                    </option>
                  `).join('')}
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-300 mb-1">Status *</label>
                <select id="i-status" class="w-full appearance-none rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm pr-8">
                  <option value="">Select Status</option>
                  <option value="Active" ${inmate.status === 'Active' ? 'selected' : ''}>Active</option>
                  <option value="Released" ${inmate.status === 'Released' ? 'selected' : ''}>Released</option>
                  <option value="Transferred" ${inmate.status === 'Transferred' ? 'selected' : ''}>Transferred</option>
                  <option value="Medical" ${inmate.status === 'Medical' ? 'selected' : ''}>Medical</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      width: width,
      padding: isMobile() ? '1rem' : '1.5rem',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: isEdit ? 'Update' : 'Add Inmate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#111827',
      background: '#111827',
      color: '#F9FAFB',
      customClass: {
        container: 'swal-responsive-container',
        popup: 'swal-responsive-popup',
        content: 'swal-responsive-content',
      },
      didOpen: () => {
        // Add responsive behavior to dropdowns
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
          select.addEventListener('focus', () => {
            select.classList.add('ring-2', 'ring-blue-500');
          });
          select.addEventListener('blur', () => {
            select.classList.remove('ring-2', 'ring-blue-500');
          });
          
          // Add touch-friendly behavior for mobile
          if (isMobile()) {
            select.classList.add('text-base', 'py-3');
          }
        });
      },
      preConfirm: () => {
        const data = {
          firstName: document.getElementById('i-firstname').value.trim(),
          lastName: document.getElementById('i-lastname').value.trim(),
          middleName: document.getElementById('i-middlename').value.trim(),
          age: parseInt(document.getElementById('i-age').value),
          gender: document.getElementById('i-gender').value,
          crime: document.getElementById('i-crime').value.trim(),
          sentence: document.getElementById('i-sentence').value.trim(),
          cellNumber: document.getElementById('i-cell').value,
          status: document.getElementById('i-status').value,
          admissionDate: document.getElementById('i-admission-date').value
        };
        
        // Validation
        if (!data.firstName || !data.lastName || !data.age || !data.gender || 
            !data.crime || !data.sentence || !data.cellNumber || !data.status || !data.admissionDate) {
          window.Swal.showValidationMessage('All required fields must be filled.');
          return false;
        }
        
        if (data.age < 18 || data.age > 100) {
          window.Swal.showValidationMessage('Age must be between 18 and 100.');
          return false;
        }
        
        return data;
      },
    });
  }

  // Update both desktop and mobile views
  function renderOrUpdateViews(inmate) {
    updateDesktopRow(inmate);
    updateMobileCard(inmate);
    updateCellCounts();
    updateStatistics();
  }

  // Handle desktop table row updates
  function updateDesktopRow(inmate) {
    if (!tableBody) return;
    
    let row = tableBody.querySelector(`tr[data-row-id="${inmate.id}"]`);
    const statusClass = getStatusClass(inmate.status);

    if (!row) {
      row = document.createElement('tr');
      row.setAttribute('data-row-id', String(inmate.id));
      row.className = 'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors';
      row.innerHTML = `
        <td class="px-4 py-3 whitespace-nowrap">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-full bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/>
                <path d="M2 22s4-4 10-4 10 4 10 4-4 2-10 2-10-2-10-2z"/>
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-50 cursor-pointer hover:underline" data-i-name data-inmate-id="${inmate.id}"></div>
              <div class="text-xs text-gray-500 dark:text-gray-400" data-i-details></div>
            </div>
          </div>
        </td>
        <td class="px-4 py-3">
          <div class="font-medium text-red-500" data-i-crime></div>
          <div class="text-xs text-gray-500 dark:text-gray-400" data-i-sentence></div>
        </td>
        <td class="px-4 py-3">
          <div class="font-medium text-yellow-500" data-i-cell></div>
          <div class="text-xs text-gray-500 dark:text-gray-400" data-i-admission></div>
        </td>
        <td class="px-4 py-3">
          <span data-i-status class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px]"></span>
        </td>
        <td class="px-4 py-3 text-right">
          <div class="flex items-center gap-1">
            <button type="button" data-edit-inmate class="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded-md transition-colors cursor-pointer" aria-label="Edit inmate">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                <path d="M16 5l3 3" />
              </svg>
            </button>
            <button type="button" data-delete-inmate class="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-md transition-colors cursor-pointer" aria-label="Delete inmate">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    }

    // Update row content
    row.querySelector('[data-i-name]').textContent = `${inmate.firstName} ${inmate.lastName}`;
    row.querySelector('[data-i-details]').textContent = `${inmate.gender}, ${inmate.age} years old`;
    row.querySelector('[data-i-crime]').textContent = inmate.crime;
    row.querySelector('[data-i-sentence]').textContent = inmate.sentence;
    row.querySelector('[data-i-cell]').textContent = inmate.cellNumber;
    row.querySelector('[data-i-admission]').textContent = formatDate(inmate.admissionDate);
    const statusEl = row.querySelector('[data-i-status]');
    statusEl.textContent = inmate.status;
    statusEl.className = `inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${statusClass}`;

    // Add event listeners
    const editBtn = row.querySelector('[data-edit-inmate]');
    const deleteBtn = row.querySelector('[data-delete-inmate]');
    const nameBtn = row.querySelector('[data-i-name]');
    
    editBtn.onclick = async () => {
      const { value } = await openInmateModal(inmate);
      if (value) {
        Object.assign(inmate, value);
        renderOrUpdateViews(inmate);
        showSuccessMessage('Inmate updated successfully');
      }
    };
    
    deleteBtn.onclick = async () => {
      const result = await window.Swal.fire({
        title: 'Delete Inmate',
        text: `Are you sure you want to delete ${inmate.firstName} ${inmate.lastName}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#111827',
        background: '#111827',
        color: '#F9FAFB'
      });
      
      if (result.isConfirmed) {
        deleteInmate(inmate.id);
        showSuccessMessage('Inmate deleted successfully');
      }
    };

    // Add click listener for inmate name
    nameBtn.onclick = () => {
      openInmateDetailsModal(inmate);
    };
  }

  // Handle mobile card updates
  function updateMobileCard(inmate) {
    if (!mobileCardsContainer) return;
    
    let card = mobileCardsContainer.querySelector(`[data-card-id="${inmate.id}"]`);
    const statusClass = getStatusClass(inmate.status);

    if (!card) {
      card = document.createElement('div');
      card.className = 'p-4 space-y-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800';
      card.setAttribute('data-card-id', String(inmate.id));
      card.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/>
                <path d="M2 22s4-4 10-4 10 4 10 4-4 2-10 2-10-2-10-2z"/>
              </svg>
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-50 cursor-pointer hover:underline" data-i-name data-inmate-id="${inmate.id}"></div>
              <div class="text-xs text-gray-500 dark:text-gray-400" data-i-details></div>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button type="button" data-edit-inmate 
              class="bg-blue-50 dark:bg-blue-900/20 text-blue-500 p-2 rounded-md" 
              aria-label="Edit inmate">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                <path d="M16 5l3 3" />
              </svg>
            </button>
            <button type="button" data-delete-inmate 
              class="bg-red-50 dark:bg-red-900/20 text-red-500 p-2 rounded-md" 
              aria-label="Delete inmate">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
        <div class="mt-2 pl-13 space-y-2">
          <div class="flex justify-between items-center">
            <div>
              <div class="font-medium text-sm" data-i-crime></div>
              <div class="text-xs text-gray-500 dark:text-gray-400" data-i-sentence></div>
            </div>
            <span data-i-status class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"></span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-600 dark:text-gray-400">Cell:</span>
            <span class="font-medium" data-i-cell></span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-600 dark:text-gray-400">Admitted:</span>
            <span class="font-medium" data-i-admission></span>
          </div>
        </div>
      `;
      mobileCardsContainer.appendChild(card);
    }

    // Update card content
    card.querySelector('[data-i-name]').textContent = `${inmate.firstName} ${inmate.lastName}`;
    card.querySelector('[data-i-details]').textContent = `${inmate.gender}, ${inmate.age} years old`;
    card.querySelector('[data-i-crime]').textContent = inmate.crime;
    card.querySelector('[data-i-sentence]').textContent = inmate.sentence;
    card.querySelector('[data-i-cell]').textContent = inmate.cellNumber;
    card.querySelector('[data-i-admission]').textContent = formatDate(inmate.admissionDate);
    const statusEl = card.querySelector('[data-i-status]');
    statusEl.textContent = inmate.status;
    statusEl.className = `inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusClass}`;

    // Add event listeners
    const editBtn = card.querySelector('[data-edit-inmate]');
    const deleteBtn = card.querySelector('[data-delete-inmate]');
    const nameBtn = card.querySelector('[data-i-name]');
    
    editBtn.onclick = async () => {
      const { value } = await openInmateModal(inmate);
      if (value) {
        Object.assign(inmate, value);
        renderOrUpdateViews(inmate);
        showSuccessMessage('Inmate updated successfully');
      }
    };
    
    deleteBtn.onclick = async () => {
      const result = await window.Swal.fire({
        title: 'Delete Inmate',
        text: `Are you sure you want to delete ${inmate.firstName} ${inmate.lastName}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#111827',
        background: '#111827',
        color: '#F9FAFB'
      });
      
      if (result.isConfirmed) {
        deleteInmate(inmate.id);
        showSuccessMessage('Inmate deleted successfully');
      }
    };

    // Add click listener for inmate name
    nameBtn.onclick = () => {
      openInmateDetailsModal(inmate);
    };
  }

  // Helper functions
  function getStatusClass(status) {
    switch (status) {
      case 'Active': return 'bg-green-500/10 text-green-500';
      case 'Released': return 'bg-blue-500/10 text-blue-500';
      case 'Transferred': return 'bg-yellow-500/10 text-yellow-500';
      case 'Medical': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  function updateCellCounts() {
    // Reset all cell counts
    cells.forEach(cell => cell.currentCount = 0);
    
    // Count inmates per cell
    inmates.forEach(inmate => {
      if (inmate.status === 'Active') {
        const cell = cells.find(c => c.name === inmate.cellNumber);
        if (cell) cell.currentCount++;
      }
    });
    
    // Re-render cells
    renderCells();
  }

  function deleteInmate(id) {
    inmates = inmates.filter(inmate => inmate.id !== id);
    updateCellCounts();
    
    // Remove from UI
    const row = tableBody?.querySelector(`tr[data-row-id="${id}"]`);
    const card = mobileCardsContainer?.querySelector(`[data-card-id="${id}"]`);
    
    if (row) row.remove();
    if (card) card.remove();
  }

  function showSuccessMessage(message) {
    window.Swal.fire({
      icon: 'success',
      title: message,
      timer: 1500,
      showConfirmButton: false,
      background: '#111827',
      color: '#F9FAFB',
      width: isMobile() ? '90%' : '32rem',
    });
  }

  // Update statistics display
  function updateStatistics() {
    const totalInmates = inmates.length;
    const activeInmates = inmates.filter(inmate => inmate.status === 'Active').length;
    const releasedInmates = inmates.filter(inmate => inmate.status === 'Released').length;
    const medicalInmates = inmates.filter(inmate => inmate.status === 'Medical').length;

    // Update DOM elements
    const totalEl = document.getElementById('total-inmates');
    const activeEl = document.getElementById('active-inmates');
    const releasedEl = document.getElementById('released-inmates');
    const medicalEl = document.getElementById('medical-inmates');

    if (totalEl) totalEl.textContent = totalInmates;
    if (activeEl) activeEl.textContent = activeInmates;
    if (releasedEl) releasedEl.textContent = releasedInmates;
    if (medicalEl) medicalEl.textContent = medicalInmates;
  }

// ========================================
// MODERNIZED INMATE INFORMATION MODAL (Tailwind + SweetAlert2)
// ========================================

// Helpers
const fullName = (i) => [i.firstName, i.middleName, i.lastName].filter(Boolean).join(' ');

const statusBadgeClasses = (status) => ({
  'In Custody': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Awaiting Trial': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Released': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
}[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300');

const daysInCustody = (i) => calculateDaysInCustody(i.admissionDate);

const inmateAvatarHTML = (inmate) => {
  if (inmate.photoUrl) {
    return `
      <img src="${inmate.photoUrl}" alt="${fullName(inmate)}"
        class="w-32 h-32 rounded-xl object-cover border-4 border-blue-500/20 shadow-lg bg-blue-500/10 mx-auto sm:mx-0" />
    `;
  }
  // Fallback SVG avatar
  return `
    <div class="w-32 h-32 rounded-xl bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/20 flex items-center justify-center mx-auto sm:mx-0 shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/>
        <path d="M2 22s4-4 10-4 10 4 10 4-4 2-10 2-10-2-10-2z"/>
      </svg>
    </div>
  `;
};

// Modernized card profile layout for inmate details
function inmateProfileCardHTML(inmate) {
  const name = fullName(inmate);
  const statusClass = statusBadgeClasses(inmate.status);

  return `
    <div class="flex flex-col sm:flex-row gap-8 items-center sm:items-start bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sm:p-8">
      <!-- Avatar -->
      <div class="flex-shrink-0 flex flex-col items-center gap-2 w-full sm:w-auto">
        ${inmateAvatarHTML(inmate)}
        <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass} mt-3 shadow">
          ${inmate.status}
        </span>
      </div>
      <!-- Details -->
      <div class="flex-1 w-full">
        <div class="flex flex-col gap-2">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">${name}</h2>
          <div class="flex flex-wrap gap-4 text-sm mb-2">
            <div class="flex items-center gap-1">
              <span class="text-gray-500 dark:text-gray-400">Age:</span>
              <span class="font-medium dark:text-gray-200">${inmate.age} years old</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-gray-500 dark:text-gray-400">Gender:</span>
              <span class="font-medium dark:text-gray-200">${inmate.gender}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-gray-500 dark:text-gray-400">Cell:</span>
              <span class="font-medium dark:text-gray-200">${inmate.cellNumber}</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-gray-500 dark:text-gray-400">Inmate ID:</span>
              <span class="font-mono text-blue-600 dark:text-blue-400">#${inmate.id.toString().padStart(4, '0')}</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div>
              <span class="font-semibold text-gray-700 dark:text-gray-300">Crime:</span>
              <span>${inmate.crime}</span>
            </div>
            <div>
              <span class="font-semibold text-gray-700 dark:text-gray-300">Sentence:</span>
              <span>${inmate.sentence}</span>
            </div>
            <div>
              <span class="font-semibold text-gray-700 dark:text-gray-300">Admission:</span>
              <span>${formatDate(inmate.admissionDate)}</span>
            </div>
            <div>
              <span class="font-semibold text-gray-700 dark:text-gray-300">Days in Custody:</span>
              <span>${daysInCustody(inmate)} days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Modernized extended details (kept as a card)
function openExtendedInmateDetails(inmate) {
  const width = isMobile() ? '98vw' : '48rem';
  const html = `
    <div class="flex flex-col sm:flex-row gap-8 items-start">
      <!-- Avatar and summary -->
      <div class="flex-shrink-0 w-full sm:w-1/3">
        ${inmateAvatarHTML(inmate)}
        <div class="mt-4 text-center sm:text-left">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">${fullName(inmate)}</h2>
          <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses(inmate.status)} mt-2 shadow">
            ${inmate.status}
          </span>
        </div>
      </div>
      <!-- Details -->
      <div class="flex-1 w-full space-y-6">
        <!-- Extended Personal Information -->
        <section>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">Extended Personal Information</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Date of Birth</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-200">Not specified</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Place of Birth</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-200">Not specified</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Nationality</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-200">Filipino</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Marital Status</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-200">Not specified</p>
            </div>
          </div>
        </section>
        <!-- Legal History -->
        <section>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">Legal History</h3>
          <div class="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg flex flex-col gap-1">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium text-gray-900 dark:text-gray-200">${inmate.crime}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Sentence: ${inmate.sentence}</p>
              </div>
              <span class="text-xs text-gray-400">${formatDate(inmate.admissionDate)}</span>
            </div>
          </div>
        </section>
        <!-- Medical Information -->
        <section>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">Medical Information</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Medical Status</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-200">No medical issues reported</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Last Medical Check</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-200">Not available</p>
            </div>
          </div>
        </section>
        <!-- Visitation Records -->
        <section>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">Visitation Records</h3>
          <div class="text-center py-4 text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm">No visitation records available</p>
          </div>
        </section>
      </div>
    </div>
  `;

  return window.Swal.fire({
    title: `<span class="hidden">Extended Inmate Information</span>`, // visually hidden, use card header
    html,
    width,
    padding: isMobile() ? '0.5rem' : '2rem',
    showCancelButton: true,
    confirmButtonText: 'Edit Inmate',
    cancelButtonText: 'Close',
    confirmButtonColor: '#3B82F6',
    cancelButtonColor: '#6B7280',
    background: '#111827',
    color: '#F9FAFB',
    customClass: {
      container: 'swal-responsive-container',
      popup: 'swal-responsive-popup',
      content: 'swal-responsive-content',
    },
    allowOutsideClick: false
  });
}

// Modernized main modal
function openInmateDetailsModal(inmate) {
  const width = isMobile() ? '98vw' : '48rem';
  const html = `
    <div class="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
      <!-- Avatar and summary -->
      <div class="flex-shrink-0 w-full sm:w-1/3">
        ${inmateAvatarHTML(inmate)}
        <div class="mt-4 text-center sm:text-left">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">${fullName(inmate)}</h2>
          <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses(inmate.status)} mt-2 shadow">
            ${inmate.status}
          </span>
        </div>
      </div>
      <!-- Details -->
      <div class="flex-1 w-full space-y-6">
        <!-- Personal Information -->
        <section>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">Personal Information</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Full Name</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-200">${fullName(inmate)}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Age</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-200">${inmate.age} years old</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Gender</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-200">${inmate.gender}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Admission Date</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-200">${formatDate(inmate.admissionDate)}</p>
            </div>
          </div>
        </section>
        <!-- Legal Information -->
        <section>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">Legal Information</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Crime Committed</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-200">${inmate.crime}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Sentence</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-200">${inmate.sentence}</p>
            </div>
          </div>
        </section>
        <!-- Cell Assignment -->
        <section>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">Cell Assignment</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Current Cell</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-200">${inmate.cellNumber}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
              <p class="mt-1">
                <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusBadgeClasses(inmate.status)}">
                  ${inmate.status}
                </span>
              </p>
            </div>
          </div>
        </section>
        <!-- Additional Information -->
        <section>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">Additional Information</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Inmate ID</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-200">#${inmate.id.toString().padStart(4, '0')}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400">Days in Custody</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-200">${daysInCustody(inmate)} days</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  return window.Swal.fire({
    title: `<span class="hidden">Inmate Details</span>`, // visually hidden, use card header
    html,
    width,
    padding: isMobile() ? '0.5rem' : '2rem',
    showCancelButton: true,
    confirmButtonText: 'More Details',
    cancelButtonText: 'Close',
    confirmButtonColor: '#3B82F6',
    cancelButtonColor: '#6B7280',
    background: '#111827',
    color: '#F9FAFB',
    customClass: {
      container: 'swal-responsive-container',
      popup: 'swal-responsive-popup',
      content: 'swal-responsive-content',
    },
    didOpen: () => {
      const confirmBtn = Swal.getConfirmButton();
      if (confirmBtn) {
        confirmBtn.classList.add('cursor-pointer');
        confirmBtn.addEventListener('click', (e) => {
          e.preventDefault();
          Swal.close();
          openExtendedInmateDetails(inmate);
        }, { once: true });
      }
      
      const cancelBtn = Swal.getCancelButton();
      if (cancelBtn) {
        cancelBtn.classList.add('cursor-pointer');
      }
    }
  });
}

  // Calculate days in custody
  function calculateDaysInCustody(admissionDate) {
    if (!admissionDate) return 0;
    const admission = new Date(admissionDate);
    const today = new Date();
    const diffTime = Math.abs(today - admission);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Initialize existing items
  function initializeExistingItems() {
    inmates.forEach(inmate => {
      renderOrUpdateViews(inmate);
    });
  }

  // Render all inmates
  function renderInmates() {
    if (tableBody) tableBody.innerHTML = '';
    if (mobileCardsContainer) mobileCardsContainer.innerHTML = '';
    
    inmates.forEach(inmate => {
      renderOrUpdateViews(inmate);
    });
  }

  // Handle add inmate button clicks
  addButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const { value } = await openInmateModal({});
      if (value) {
        const newId = Math.max(...inmates.map(i => i.id), 0) + 1;
        const newInmate = { id: newId, ...value };
        inmates.push(newInmate);
        renderOrUpdateViews(newInmate);
        showSuccessMessage('Inmate added successfully');
      }
    });
  });

  // Handle window resize events for responsive behavior
  window.addEventListener('resize', () => {
    const activeModal = document.querySelector('.swal2-container');
    if (activeModal) {
      const modalContent = activeModal.querySelector('.swal2-popup');
      if (modalContent) {
        modalContent.style.width = isMobile() ? '95%' : '42rem';
        modalContent.style.padding = isMobile() ? '1rem' : '1.5rem';
      }
    }
  });

  // Initialize the page
  initializePage();
});
