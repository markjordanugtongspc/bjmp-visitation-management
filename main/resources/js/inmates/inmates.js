import 'flowbite';
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
      age: 36,
      gender: 'Male',
      cellNumber: 'Cell 1',
      crime: 'Theft',
      sentence: '2 years',
      status: 'Active',
      admissionDate: '2024-01-15',
      dateOfBirth: '1989-06-15',
      addressLine1: '123 Mabini St., Brgy. San Miguel',
      addressLine2: 'Blk 4 Lot 12',
      city: 'Iligan City',
      province: 'Lanao del Norte',
      postalCode: '9200',
      country: 'Philippines',
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
      dateOfBirth: '1997-09-10',
      addressLine1: '27 Rizal Ave., Brgy. Poblacion',
      addressLine2: '',
      city: 'Iligan City',
      province: 'Lanao del Norte',
      postalCode: '9200',
      country: 'Philippines',
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
            <span class="font-medium text-white">${cell.currentCount}/${cell.capacity}</span>
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
        <div class="space-y-4 text-left max-h-[70vh] overflow-y-auto scrollbar-none" style="-ms-overflow-style: none; scrollbar-width: none;">
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
                <label class="block text-xs text-gray-300 mb-1">Age</label>
                <input
                  id="i-age"
                  type="text"
                  aria-label="disabled input"
                  class="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   value="${inmate.age ?? ''}" 
                  disabled
                />
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

            <!-- Demographic: Date of Birth -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-300 mb-1">Date of Birth *</label>
                <input id="i-dob" type="date" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" value="${inmate.dateOfBirth || ''}" />
              </div>
            </div>

            <!-- Address -->
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Address</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-gray-300 mb-1">Address Line 1 *</label>
                  <input id="i-addr1" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" value="${inmate.addressLine1 || ''}" placeholder="House No., Street, Barangay" />
                </div>
                <div>
                  <label class="block text-xs text-gray-300 mb-1">Address Line 2</label>
                  <input id="i-addr2" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" value="${inmate.addressLine2 || ''}" placeholder="Subdivision, Building (optional)" />
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs text-gray-300 mb-1">City/Municipality *</label>
                  <input id="i-city" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" value="${inmate.city || ''}" placeholder="City/Municipality" />
                </div>
                <div>
                  <label class="block text-xs text-gray-300 mb-1">Province/State *</label>
                  <input id="i-province" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" value="${inmate.province || ''}" placeholder="Province/State" />
                </div>
                <div>
                  <label class="block text-xs text-gray-300 mb-1">Postal Code</label>
                  <input id="i-postal" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" value="${inmate.postalCode || ''}" placeholder="e.g., 9200" />
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-300 mb-1">Country *</label>
                <input id="i-country" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" value="${inmate.country || 'Philippines'}" placeholder="Country" />
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
        <style>
          .swal2-html-container > div::-webkit-scrollbar { display: none !important; }
          .swal2-html-container > div { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        </style>
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

        // Auto-calc age from DOB
        const dobInput = /** @type {HTMLInputElement} */(document.getElementById('i-dob'));
        const ageInput = /** @type {HTMLInputElement} */(document.getElementById('i-age'));
        if (dobInput && ageInput) {
          const updateAge = () => {
            const v = dobInput.value;
            ageInput.value = v ? String(calculateAge(v)) : '';
          };
          dobInput.addEventListener('change', updateAge);
          updateAge();
        }
      },
      preConfirm: () => {
        const isEditing = !!inmate.id;
        const data = {
          firstName: document.getElementById('i-firstname').value.trim(),
          lastName: document.getElementById('i-lastname').value.trim(),
          middleName: document.getElementById('i-middlename').value.trim(),
          dateOfBirth: /** @type {HTMLInputElement} */(document.getElementById('i-dob'))?.value || null,
          age: (() => { const dob = /** @type {HTMLInputElement} */(document.getElementById('i-dob'))?.value; return dob ? calculateAge(dob) : (inmate.age ?? null); })(),
          gender: document.getElementById('i-gender').value,
          addressLine1: document.getElementById('i-addr1')?.value.trim() || '',
          addressLine2: document.getElementById('i-addr2')?.value.trim() || '',
          city: document.getElementById('i-city')?.value.trim() || '',
          province: document.getElementById('i-province')?.value.trim() || '',
          postalCode: document.getElementById('i-postal')?.value.trim() || '',
          country: document.getElementById('i-country')?.value.trim() || '',
          crime: document.getElementById('i-crime').value.trim(),
          sentence: document.getElementById('i-sentence').value.trim(),
          cellNumber: document.getElementById('i-cell').value,
          status: document.getElementById('i-status').value,
          admissionDate: document.getElementById('i-admission-date').value
        };
        // Validation
        if (
          !data.firstName ||
          !data.lastName ||
          !data.dateOfBirth ||
          !data.gender ||
          !data.addressLine1 ||
          !data.city ||
          !data.province ||
          !data.country ||
          !data.crime ||
          !data.sentence ||
          !data.cellNumber ||
          !data.status ||
          !data.admissionDate
        ) {
          window.Swal.showValidationMessage('All required fields must be filled and valid.');
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
          <div class="flex items-center gap-1 justify-end ml-auto">
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
    const dobEl = row.querySelector('[data-i-dob]');
    const addrEl = row.querySelector('[data-i-address]');
    if (dobEl) dobEl.textContent = `DOB: ${formatDate(inmate.dateOfBirth)}`;
    if (addrEl) addrEl.textContent = `Address: ${formatAddress(inmate)}`;
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
      openUnifiedInmateModal(inmate);
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
              class="bg-blue-50 dark:bg-blue-900/20 text-blue-500 p-2 rounded-md cursor-pointer" 
              aria-label="Edit inmate">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                <path d="M16 5l3 3" />
              </svg>
            </button>
            <button type="button" data-delete-inmate 
              class="bg-red-50 dark:bg-red-900/20 text-red-500 p-2 rounded-md cursor-pointer" 
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
      openUnifiedInmateModal(inmate);
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
// UNIFIED INMATE MODAL (SweetAlert2 + Tailwind, responsive)
// ========================================
function openUnifiedInmateModal(inmate) {
  const width = isMobile() ? '98vw' : '64rem';
  const avatar = inmateAvatarHTML(inmate);
  const name = fullName(inmate);
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'medical', label: 'Medical' },
    { id: 'points', label: 'Points' },
    { id: 'visitation', label: 'Visitation' },
  ];

  const navHTML = `
    <nav class="flex flex-wrap gap-2 sm:gap-3 border-b border-gray-200 dark:border-gray-800 mb-4 justify-start lg:justify-end">
      ${tabs.map(t => `
        <button data-tab="${t.id}" class="px-3 py-2 text-xs sm:text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 data-[active=true]:bg-blue-600 data-[active=true]:text-white cursor-pointer">
          ${t.label}
        </button>
      `).join('')}
    </nav>
  `;

  const overviewHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <div class="flex items-start gap-4">
          <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden ring-2 ring-blue-500/20 bg-blue-500/10 flex-shrink-0">
            ${avatar}
          </div>
          <div class="hidden sm:flex flex-col">
            <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">${name}</h2>
            <span class="mt-2 inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ${statusBadgeClasses(inmate.status)}">${inmate.status}</span>
          </div>
        </div>
        <div class="sm:hidden mt-3">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white">${name}</h2>
          <span class="mt-2 inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ${statusBadgeClasses(inmate.status)}">${inmate.status}</span>
        </div>
      </div>
      <div class="lg:col-span-2 space-y-4">
        <!-- Basic Information (accordion) -->
        <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <button data-accordion-toggle="basic" class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg cursor-pointer">
            <span>Basic Information</span>
            <svg class="h-4 w-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
          </button>
          <div data-accordion-panel="basic" class="px-4 py-4 border-t border-gray-200 dark:border-gray-800 hidden lg:block">
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt class="text-gray-500 dark:text-gray-400">DOB</dt><dd class="text-gray-900 dark:text-gray-200">${formatDate(inmate.dateOfBirth)}</dd>
              <dt class="text-gray-500 dark:text-gray-400">Age</dt><dd class="text-gray-900 dark:text-gray-200">${inmate.age}</dd>
              <dt class="text-gray-500 dark:text-gray-400">Gender</dt><dd class="text-gray-900 dark:text-gray-200">${inmate.gender}</dd>
              <dt class="text-gray-500 dark:text-gray-400">Address</dt><dd class="text-gray-900 dark:text-gray-200">${formatAddress(inmate) || '—'}</dd>
            </dl>
          </div>
        </div>
        <!-- Legal & Assignment (accordion) -->
        <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <button data-accordion-toggle="legal" class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg cursor-pointer">
            <span>Legal & Assignment</span>
            <svg class="h-4 w-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
          </button>
          <div data-accordion-panel="legal" class="px-4 py-4 border-t border-gray-200 dark:border-gray-800 hidden lg:block">
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt class="text-gray-500 dark:text-gray-400">Admission Date</dt><dd class="text-gray-900 dark:text-gray-200">${formatDate(inmate.admissionDate)}</dd>
              <dt class="text-gray-500 dark:text-gray-400">Work / Job</dt><dd class="text-gray-900 dark:text-gray-200">${inmate.job || '—'}</dd>
              <dt class="text-gray-500 dark:text-gray-400">Crime Committed</dt><dd class="text-gray-900 dark:text-gray-200">${inmate.crime}</dd>
              <dt class="text-gray-500 dark:text-gray-400">Sentence</dt><dd class="text-gray-900 dark:text-gray-200">${inmate.sentence}</dd>
              <dt class="text-gray-500 dark:text-gray-400">Cell Assignment</dt><dd class="text-gray-900 dark:text-gray-200">${inmate.cellNumber}</dd>
              <dt class="text-gray-500 dark:text-gray-400">Additional</dt><dd class="text-gray-900 dark:text-gray-200">ID #${inmate.id.toString().padStart(4,'0')} • ${daysInCustody(inmate)} days in custody</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  `;

  const medicalHTML = `
    <div class="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Medical Information</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div><span class="text-gray-500 dark:text-gray-400">Medical Status:</span> <span class="text-gray-900 dark:text-gray-200">No medical issues reported</span></div>
        <div><span class="text-gray-500 dark:text-gray-400">Last Check:</span> <span class="text-gray-900 dark:text-gray-200">Not available</span></div>
      </div>
    </div>
  `;

  // Helpers for Points & Visitation data (placeholder demo until integrated with backend)
  function getPointsTotal(i) {
    return (i.pointsTotal ?? 0);
  }
  function getPointsHistory(i) {
    return Array.isArray(i.pointsHistory) ? i.pointsHistory : [];
  }
  function getAllowedVisitors(i) {
    return Array.isArray(i.allowedVisitors) ? i.allowedVisitors : [];
  }
  function getRecentVisits(i) {
    return Array.isArray(i.visits) ? i.visits : [];
  }

  const pointsTotal = getPointsTotal(inmate);
  const pointsRows = getPointsHistory(inmate).map(p => `
      <tr class="border-b border-gray-100 dark:border-gray-800">
        <td class="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-gray-200">${formatDate(p.date)}</td>
        <td class="px-3 py-2 min-w-40 text-gray-700 dark:text-gray-300">${p.activity || '—'}</td>
        <td class="px-3 py-2 text-right font-semibold ${p.points >= 0 ? 'text-green-600' : 'text-red-500'}">${p.points}</td>
        <td class="px-3 py-2 text-gray-500 dark:text-gray-400">${p.note || ''}</td>
      </tr>
  `).join('');
  const pointsHTML = `
    <div class="space-y-4">
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Points Summary</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">Cumulative points based on activities</p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold ${pointsTotal >= 0 ? 'text-green-600' : 'text-red-500'}">${pointsTotal}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Total Points</div>
          </div>
        </div>
        <div class="mt-3 w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
          <div class="h-2 bg-blue-500" style="width: ${Math.min(Math.max(pointsTotal, 0), 100)}%"></div>
        </div>
      </div>
      <div class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Date</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Activity</th>
                <th class="px-3 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">Points</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Note</th>
              </tr>
            </thead>
            <tbody>
              ${pointsRows || `<tr><td colspan="4" class="px-3 py-6 text-center text-gray-500 dark:text-gray-400">No points recorded</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const allowedVisitors = getAllowedVisitors(inmate);
  const visits = getRecentVisits(inmate);
  const allowedList = allowedVisitors.map(v => `
    <li class="flex items-center justify-between gap-3">
      <div class="min-w-0">
        <p class="truncate text-sm font-medium text-gray-900 dark:text-gray-200">${v.name}</p>
        <p class="truncate text-xs text-gray-500 dark:text-gray-400">${v.relationship || '—'}${v.idType ? ` • ${v.idType}` : ''}${v.idNumber ? ` (${v.idNumber})` : ''}</p>
      </div>
      <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] bg-green-500/10 text-green-600">Allowed</span>
    </li>
  `).join('');
  const visitsRows = visits.map(v => `
    <tr class="border-b border-gray-100 dark:border-gray-800">
      <td class="px-3 py-2 whitespace-nowrap">${formatDate(v.date)}</td>
      <td class="px-3 py-2">${v.visitor}</td>
      <td class="px-3 py-2">${v.relationship || '—'}</td>
      <td class="px-3 py-2">${v.purpose || '—'}</td>
      <td class="px-3 py-2">
        <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${v.status === 'Approved' ? 'bg-green-500/10 text-green-600' : v.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-red-500/10 text-red-600'}">${v.status || '—'}</span>
      </td>
    </tr>
  `).join('');
  const visitationHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1 rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Allowed Visitors</h3>
        <ul class="space-y-3">
          ${allowedList || '<li class="text-sm text-gray-500 dark:text-gray-400">No allowed visitors configured</li>'}
        </ul>
      </div>
      <div class="lg:col-span-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div class="p-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Visits</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Date</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Visitor</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Relationship</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Purpose/Notes</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              ${visitsRows || `<tr><td colspan="5" class="px-3 py-6 text-center text-gray-500 dark:text-gray-400">No visit records</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  function attachAccordionHandlers() {
    const toggles = document.querySelectorAll('[data-accordion-toggle]');
    toggles.forEach((btn) => {
      const id = btn.getAttribute('data-accordion-toggle');
      const panel = document.querySelector(`[data-accordion-panel="${id}"]`);
      if (!panel) return;
      btn.addEventListener('click', () => {
        // Toggle only affects mobile/tablet. On lg screens, the "lg:block" ensures visibility.
        panel.classList.toggle('hidden');
      });
    });
  }

  const html = `
    ${navHTML}
    <div id="tab-content" class="space-y-4">${overviewHTML}</div>
  `;

  return window.Swal.fire({
    title: `<span class="hidden">Inmate</span>`,
    html,
    width,
    padding: isMobile() ? '0.75rem' : '1.5rem',
    showCancelButton: true,
    cancelButtonText: 'Close',
    showConfirmButton: false,
    background: '#111827',
    color: '#F9FAFB',
    customClass: {
      container: 'swal-responsive-container',
      popup: 'swal-responsive-popup',
      content: 'swal-responsive-content',
    },
    didOpen: () => {
      const container = document.getElementById('tab-content');
      const setActive = (id) => {
        document.querySelectorAll('button[data-tab]').forEach((btn) => {
          const isActive = btn.getAttribute('data-tab') === id;
          btn.setAttribute('data-active', String(isActive));
        });
        if (!container) return;
        if (id === 'overview') container.innerHTML = overviewHTML;
        if (id === 'medical') container.innerHTML = medicalHTML;
        if (id === 'points') container.innerHTML = pointsHTML;
        if (id === 'visitation') container.innerHTML = visitationHTML;
        if (id === 'overview') attachAccordionHandlers();
      };
      document.querySelectorAll('button[data-tab]').forEach((btn, idx) => {
        btn.addEventListener('click', () => setActive(btn.getAttribute('data-tab')));
        if (idx === 0) btn.setAttribute('data-active', 'true');
      });
      setActive('overview');
    }
  });
}

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

// Mao dayon ni sa MORE DETAILS nga BUTTON
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

// Calculate age from date string (YYYY-MM-DD)
function calculateAge(dateString) {
  if (!dateString) return 0;
  const dob = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function formatAddress(i) {
  const parts = [i.addressLine1, i.addressLine2, i.city, i.province, i.postalCode, i.country]
    .filter(Boolean)
    .join(', ');
  return parts;
}

// (Old extended/detail modals removed in favor of unified modal)

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
        // Respect unified modal sizing
        modalContent.style.width = isMobile() ? '98vw' : '64rem';
        modalContent.style.padding = isMobile() ? '0.75rem' : '1.5rem';
      }
    }
  });

  // Initialize the page
  initializePage();
});

