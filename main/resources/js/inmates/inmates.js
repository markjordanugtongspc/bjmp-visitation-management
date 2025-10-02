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
      photo: null,
      // Medical Information
      medicalStatus: 'Healthy',
      lastMedicalCheck: '2024-01-20',
      medicalNotes: 'No medical issues reported. Regular check-ups scheduled.',
      // Points System
      initialPoints: 0,
      currentPoints: 15,
      pointsHistory: [
        { date: '2024-01-20', activity: 'Good behavior', points: 5, note: 'Helped with cleaning' },
        { date: '2024-01-25', activity: 'Educational program', points: 10, note: 'Completed literacy course' }
      ],
      // Visitation Information
      allowedVisitors: [
        { name: 'Maria Dela Cruz', relationship: 'Wife', idType: 'Drivers License', idNumber: 'DL123456' },
        { name: 'Pedro Dela Cruz', relationship: 'Father', idType: 'Senior Citizen ID', idNumber: 'SC789012' }
      ],
      recentVisits: [
        { date: '2024-01-22', visitor: 'Maria Dela Cruz', relationship: 'Wife', purpose: 'Family visit', status: 'Approved' },
        { date: '2024-01-28', visitor: 'Pedro Dela Cruz', relationship: 'Father', purpose: 'Family visit', status: 'Approved' }
      ]
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
      photo: null,
      // Medical Information
      medicalStatus: 'Under Treatment',
      lastMedicalCheck: '2024-02-15',
      medicalNotes: 'Under treatment for anxiety. Regular counseling sessions scheduled.',
      // Points System
      initialPoints: 0,
      currentPoints: 8,
      pointsHistory: [
        { date: '2024-02-12', activity: 'Good behavior', points: 3, note: 'Followed rules' },
        { date: '2024-02-18', activity: 'Work assignment', points: 5, note: 'Kitchen duty' }
      ],
      // Visitation Information
      allowedVisitors: [
        { name: 'Carlos Garcia', relationship: 'Brother', idType: 'National ID', idNumber: 'NID345678' }
      ],
      recentVisits: [
        { date: '2024-02-20', visitor: 'Carlos Garcia', relationship: 'Brother', purpose: 'Family visit', status: 'Approved' }
      ]
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

          <!-- Medical Information -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">Medical Information</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-300 mb-1">Medical Status</label>
                <select id="i-medical-status" class="w-full appearance-none rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm pr-8">
                  <option value="">Select Medical Status</option>
                  <option value="Healthy" ${inmate.medicalStatus === 'Healthy' ? 'selected' : ''}>Healthy</option>
                  <option value="Under Treatment" ${inmate.medicalStatus === 'Under Treatment' ? 'selected' : ''}>Under Treatment</option>
                  <option value="Critical" ${inmate.medicalStatus === 'Critical' ? 'selected' : ''}>Critical</option>
                  <option value="Not Assessed" ${inmate.medicalStatus === 'Not Assessed' ? 'selected' : ''}>Not Assessed</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-300 mb-1">Last Medical Check</label>
                <input id="i-last-medical" type="date" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                       value="${inmate.lastMedicalCheck || ''}" />
              </div>
            </div>
            
            <div>
              <label class="block text-xs text-gray-300 mb-1">Medical Notes</label>
              <textarea id="i-medical-notes" class="w-full rounded-md bg-gray-800/60 border border-gray-700 text-white px-3 py-2 text-sm" 
                        rows="3" placeholder="Enter any medical notes or conditions...">${inmate.medicalNotes || ''}</textarea>
            </div>
          </div>

        <!-- Points System -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">Points System</h3>
          
          <!-- Points Summary -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
            <div>
              <label class="block text-sm text-gray-300 mb-2 font-medium">Initial Points</label>
              <input id="i-initial-points" type="number" class="w-full rounded-md bg-gray-800/60 border border-gray-600 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                     value="${inmate.initialPoints || 0}" placeholder="Starting points" />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-2 font-medium">Current Points</label>
              <input id="i-current-points" type="number" class="w-full rounded-md bg-gray-800/60 border border-gray-600 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                     value="${inmate.currentPoints || 0}" placeholder="Current points" />
            </div>
          </div>
          
          <!-- Points History Management - Expanded -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-md font-semibold text-gray-200">Points History</h4>
              <button type="button" id="add-points-entry" class="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md cursor-pointer transition-colors">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add Points Entry
              </button>
            </div>
            
            <!-- Points History Container - Expanded and Responsive -->
            <div id="points-entries-container" class="space-y-3 max-h-96 overflow-y-auto">
              <!-- Points entries will be dynamically added here -->
            </div>
            
            <!-- Empty State -->
            <div id="points-empty-state" class="text-center py-8 text-gray-400 hidden">
              <svg class="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-sm">No points history yet. Click "Add Points Entry" to get started.</p>
            </div>
          </div>
        </div>

          <!-- Visitation Information -->
          <div class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">Visitation Information</h3>
            
            <!-- Allowed Visitors Management - Expanded -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="text-md font-semibold text-gray-200">Allowed Visitors</h4>
                <button type="button" id="add-allowed-visitor" class="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md cursor-pointer transition-colors">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Add Visitor
                </button>
              </div>
              
              <!-- Allowed Visitors Container - Expanded and Responsive -->
              <div id="allowed-visitors-container" class="space-y-3 max-h-96 overflow-y-auto">
                <!-- Allowed visitors will be dynamically added here -->
              </div>
              
              <!-- Empty State -->
              <div id="visitors-empty-state" class="text-center py-8 text-gray-400 hidden">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <p class="text-sm">No allowed visitors yet. Click "Add Visitor" to get started.</p>
              </div>
            </div>
            
            <!-- Recent Visits Management - Expanded -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="text-md font-semibold text-gray-200">Recent Visits</h4>
                <button type="button" id="add-visit-record" class="inline-flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md cursor-pointer transition-colors">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Add Visit
                </button>
              </div>
              
              <!-- Visit Records Container - Expanded and Responsive -->
              <div id="visit-records-container" class="space-y-3">
                <!-- Visit records will be dynamically added here -->
              </div>
              
              <!-- Empty State -->
              <div id="visits-empty-state" class="text-center py-8 text-gray-400 hidden">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p class="text-sm">No visit records yet. Click "Add Visit" to get started.</p>
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

        // Initialize dynamic form elements
        initializePointsHistory();
        initializeAllowedVisitors();
        initializeVisitRecords();
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
          admissionDate: document.getElementById('i-admission-date').value,
          // Medical Information
          medicalStatus: document.getElementById('i-medical-status').value || 'Not Assessed',
          lastMedicalCheck: document.getElementById('i-last-medical').value || null,
          medicalNotes: document.getElementById('i-medical-notes').value.trim() || '',
          // Points System
          initialPoints: parseInt(document.getElementById('i-initial-points').value) || 0,
          currentPoints: parseInt(document.getElementById('i-current-points').value) || 0,
          pointsHistory: collectPointsHistory(),
          // Visitation Information
          allowedVisitors: collectAllowedVisitors(),
          recentVisits: collectVisitRecords()
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

  // Dynamic form management functions

  /**
   * Initialize the Points History form section.
   * @param {Object} [inmateData] - Optional inmate object to use for populating points history.
   */
  function initializePointsHistory(inmateData) {
    const container = document.getElementById('points-entries-container');
    const addBtn = document.getElementById('add-points-entry');
    const emptyState = document.getElementById('points-empty-state');
    
    if (!container || !addBtn) return;

    // Clear existing entries
    container.innerHTML = '';

    // Load existing points history
    // Use inmateData if provided, otherwise try to use global 'inmate' if it exists, else empty array
    let existingHistory = [];
    if (inmateData && Array.isArray(inmateData.pointsHistory)) {
      existingHistory = inmateData.pointsHistory;
    } else if (typeof inmate !== 'undefined' && inmate && Array.isArray(inmate.pointsHistory)) {
      existingHistory = inmate.pointsHistory;
    }
    
    // Add existing entries
    existingHistory.forEach((entry, index) => {
      addPointsEntry(entry, index);
    });

    // Show/hide empty state
    if (emptyState) {
      if (existingHistory.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }

    // Add button event listener
    addBtn.addEventListener('click', () => {
      addPointsEntry();
    });
  }

  function addPointsEntry(entry = {}, index = null) {
    const container = document.getElementById('points-entries-container');
    const emptyState = document.getElementById('points-empty-state');
    if (!container) return;

    // Hide empty state when adding entries
    if (emptyState) {
      emptyState.classList.add('hidden');
    }

    const entryIndex = index !== null ? index : container.children.length;
    const entryDiv = document.createElement('div');
    entryDiv.className = 'bg-gray-800/40 rounded-xl p-4 border border-gray-600 hover:bg-gray-800/60 transition-all duration-200 shadow-sm';
    entryDiv.innerHTML = `
      <!-- Entry Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-semibold">${entryIndex + 1}</span>
          </div>
          <h4 class="text-base font-semibold text-gray-200">Points Entry</h4>
        </div>
        <button type="button" class="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md cursor-pointer transition-colors" 
                onclick="this.parentElement.parentElement.remove(); updateEmptyState();">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Remove
        </button>
      </div>

      <!-- Main Form Grid - Responsive -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
        <!-- Date Field -->
        <div class="sm:col-span-1">
          <label class="block text-sm text-gray-300 mb-2 font-medium">Date *</label>
          <input type="date" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                 value="${entry.date || ''}" data-field="date" required />
        </div>
        
        <!-- Points Field -->
        <div class="sm:col-span-1">
          <label class="block text-sm text-gray-300 mb-2 font-medium">Points *</label>
          <div class="relative">
            <input type="number" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                   value="${entry.points || ''}" data-field="points" placeholder="+5 or -2" required />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <span class="text-gray-400 text-xs">pts</span>
            </div>
          </div>
        </div>
        
        <!-- Activity Field - Takes more space on larger screens -->
        <div class="sm:col-span-2 lg:col-span-1 xl:col-span-2">
          <label class="block text-sm text-gray-300 mb-2 font-medium">Activity *</label>
          <select class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" data-field="activity" required>
            <option value="">Select Activity</option>
            <option value="Good behavior" ${entry.activity === 'Good behavior' ? 'selected' : ''}>Good behavior</option>
            <option value="Work assignment" ${entry.activity === 'Work assignment' ? 'selected' : ''}>Work assignment</option>
            <option value="Educational program" ${entry.activity === 'Educational program' ? 'selected' : ''}>Educational program</option>
            <option value="Community service" ${entry.activity === 'Community service' ? 'selected' : ''}>Community service</option>
            <option value="Rule violation" ${entry.activity === 'Rule violation' ? 'selected' : ''}>Rule violation</option>
            <option value="Fighting" ${entry.activity === 'Fighting' ? 'selected' : ''}>Fighting</option>
            <option value="Disobedience" ${entry.activity === 'Disobedience' ? 'selected' : ''}>Disobedience</option>
            <option value="Other" ${entry.activity === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>

      <!-- Notes Section -->
      <div>
        <label class="block text-sm text-gray-300 mb-2 font-medium">Additional Notes</label>
        <textarea class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" 
                  rows="3" data-field="note" placeholder="Additional details about the activity...">${entry.note || ''}</textarea>
      </div>

      <!-- Entry Footer with Status -->
      <div class="mt-3 pt-3 border-t border-gray-600">
        <div class="flex items-center justify-between text-xs text-gray-400">
          <span>Entry #${entryIndex + 1}</span>
          <span class="flex items-center">
            <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Active
          </span>
        </div>
      </div>
    `;
    container.appendChild(entryDiv);
  }

  // Helper function to update empty state visibility
  function updateEmptyState() {
    const container = document.getElementById('points-entries-container');
    const emptyState = document.getElementById('points-empty-state');
    
    if (container && emptyState) {
      if (container.children.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }
  }

  function collectPointsHistory() {
    const container = document.getElementById('points-entries-container');
    if (!container) return [];

    const entries = [];
    container.querySelectorAll('.bg-gray-800\\/40').forEach(entryDiv => {
      const date = entryDiv.querySelector('[data-field="date"]').value;
      const points = entryDiv.querySelector('[data-field="points"]').value;
      const activity = entryDiv.querySelector('[data-field="activity"]').value;
      const note = entryDiv.querySelector('[data-field="note"]').value;

      if (date && points && activity) {
        entries.push({
          date: date,
          points: parseInt(points),
          activity: activity,
          note: note
        });
      }
    });
    return entries;
  }

  /**
   * Initialize the Allowed Visitors form section.
   * @param {Object} [inmateData] - Optional inmate object to use for populating allowed visitors.
   */
  function initializeAllowedVisitors(inmateData) {
    const container = document.getElementById('allowed-visitors-container');
    const addBtn = document.getElementById('add-allowed-visitor');
    const emptyState = document.getElementById('visitors-empty-state');
    
    if (!container || !addBtn) return;

    // Clear existing entries
    container.innerHTML = '';

    // Load existing allowed visitors
    let existingVisitors = [];
    if (inmateData && Array.isArray(inmateData.allowedVisitors)) {
      existingVisitors = inmateData.allowedVisitors;
    } else if (typeof inmate !== 'undefined' && inmate && Array.isArray(inmate.allowedVisitors)) {
      existingVisitors = inmate.allowedVisitors;
    }
    
    // Add existing visitors
    existingVisitors.forEach((visitor, index) => {
      addAllowedVisitor(visitor, index);
    });

    // Show/hide empty state
    if (emptyState) {
      if (existingVisitors.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }

    // Add button event listener
    addBtn.addEventListener('click', () => {
      addAllowedVisitor();
    });
  }

  function addAllowedVisitor(visitor = {}, index = null) {
    const container = document.getElementById('allowed-visitors-container');
    const emptyState = document.getElementById('visitors-empty-state');
    if (!container) return;

    // Hide empty state when adding visitors
    if (emptyState) {
      emptyState.classList.add('hidden');
    }

    const entryIndex = index !== null ? index : container.children.length;
    const visitorDiv = document.createElement('div');
    visitorDiv.className = 'bg-gray-800/40 rounded-xl p-4 border border-gray-600 hover:bg-gray-800/60 transition-all duration-200 shadow-sm';
    visitorDiv.innerHTML = `
      <!-- Visitor Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-semibold">${entryIndex + 1}</span>
          </div>
          <h4 class="text-base font-semibold text-gray-200">Allowed Visitor</h4>
        </div>
        <button type="button" class="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md cursor-pointer transition-colors" 
                onclick="this.parentElement.parentElement.remove(); updateVisitorsEmptyState();">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Remove
        </button>
      </div>

      <!-- Main Form Grid - Responsive -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <!-- 1x1 Photo Upload -->
        <div class="sm:col-span-2 lg:col-span-1">
          <label class="block text-sm text-gray-300 mb-2 font-medium">1x1 Photo</label>
          <div class="flex items-center gap-3">
            <img data-field="avatarPreview" src="/images/default-avatar.png" alt="Visitor avatar" class="h-16 w-16 rounded-full object-cover ring-2 ring-green-500/20 bg-gray-700/40" />
            <div>
              <label class="inline-flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded-md cursor-pointer transition-colors">
                Choose Image
                <input type="file" accept="image/*" data-field="avatar" class="hidden" />
              </label>
              <p class="mt-1 text-[11px] text-gray-400">PNG/JPG up to 2MB</p>
              <button type="button" data-action="view-visitor" class="mt-2 inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md cursor-pointer transition-colors">
                View
              </button>
            </div>
          </div>
        </div>
        <!-- Visitor Name Field -->
        <div class="sm:col-span-2 lg:col-span-1">
          <label class="block text-sm text-gray-300 mb-2 font-medium">Visitor Name *</label>
          <input type="text" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
                 value="${visitor.name || ''}" data-field="name" placeholder="Full name" required />
        </div>
        
        <!-- Relationship Field -->
        <div class="sm:col-span-2 lg:col-span-1">
          <label class="block text-sm text-gray-300 mb-2 font-medium">Relationship *</label>
          <select class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" data-field="relationship" required>
            <option value="">Select relationship</option>
            <option value="Father" ${visitor.relationship === 'Father' ? 'selected' : ''}>Father</option>
            <option value="Mother" ${visitor.relationship === 'Mother' ? 'selected' : ''}>Mother</option>
            <option value="Spouse" ${visitor.relationship === 'Spouse' ? 'selected' : ''}>Spouse</option>
            <option value="Sibling" ${visitor.relationship === 'Sibling' ? 'selected' : ''}>Sibling</option>
            <option value="Child" ${visitor.relationship === 'Child' ? 'selected' : ''}>Child</option>
            <option value="Friend" ${visitor.relationship === 'Friend' ? 'selected' : ''}>Friend</option>
            <option value="Lawyer" ${visitor.relationship === 'Lawyer' ? 'selected' : ''}>Lawyer</option>
            <option value="Other" ${visitor.relationship === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
        
        <!-- Contact Number Field -->
        <div class="sm:col-span-2 lg:col-span-1">
          <label class="block text-sm text-gray-300 mb-2 font-medium">Contact Number</label>
          <div class="relative">
            <input type="tel" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
                   value="${visitor.contactNumber || ''}" data-field="contactNumber" placeholder="+63 9XX XXX XXXX" />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- ID Information Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">ID Type</label>
          <select class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" data-field="idType">
            <option value="">Select ID type</option>
            <option value="Drivers License" ${visitor.idType === 'Drivers License' ? 'selected' : ''}>Drivers License</option>
            <option value="National ID" ${visitor.idType === 'National ID' ? 'selected' : ''}>National ID</option>
            <option value="Passport" ${visitor.idType === 'Passport' ? 'selected' : ''}>Passport</option>
            <option value="Senior Citizen ID" ${visitor.idType === 'Senior Citizen ID' ? 'selected' : ''}>Senior Citizen ID</option>
            <option value="Voters ID" ${visitor.idType === 'Voters ID' ? 'selected' : ''}>Voters ID</option>
            <option value="SSS ID" ${visitor.idType === 'SSS ID' ? 'selected' : ''}>SSS ID</option>
            <option value="Other" ${visitor.idType === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">ID Number</label>
          <input type="text" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
                 value="${visitor.idNumber || ''}" data-field="idNumber" placeholder="ID number" />
        </div>
      </div>

      <!-- Address Field -->
      <div class="mb-4">
        <label class="block text-sm text-gray-300 mb-2 font-medium">Address</label>
        <input type="text" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
               value="${visitor.address || ''}" data-field="address" placeholder="Visitor's address" />
      </div>

      <!-- Visitor Footer with Status -->
      <div class="mt-3 pt-3 border-t border-gray-600">
        <div class="flex items-center justify-between text-xs text-gray-400">
          <span>Visitor #${entryIndex + 1}</span>
          <span class="flex items-center">
            <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Allowed
          </span>
        </div>
      </div>
    `;
    container.appendChild(visitorDiv);

    // Avatar preview handler
    const fileInput = visitorDiv.querySelector('[data-field="avatar"]');
    const previewEl = visitorDiv.querySelector('[data-field="avatarPreview"]');
    if (fileInput && previewEl) {
      fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const src = String(ev.target?.result || '');
          previewEl.setAttribute('src', src);
        };
        reader.readAsDataURL(file);
      });
    }

    // Open Visitor modal from 'View' button or avatar click
    const viewBtn = visitorDiv.querySelector('[data-action="view-visitor"]');
    const openVisitorPreview = () => {
      const data = collectVisitorEntryData(visitorDiv);
      openVisitorModal(data);
    };
    if (viewBtn) viewBtn.addEventListener('click', openVisitorPreview);
    if (previewEl) previewEl.addEventListener('click', openVisitorPreview);
  }

  // Helper function to update visitors empty state visibility
  function updateVisitorsEmptyState() {
    const container = document.getElementById('allowed-visitors-container');
    const emptyState = document.getElementById('visitors-empty-state');
    
    if (container && emptyState) {
      if (container.children.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }
  }

  // Collect a single visitor entry's data from its DOM container
  function collectVisitorEntryData(containerEl) {
    const getVal = (selector) => {
      const el = /** @type {HTMLInputElement|null} */(containerEl.querySelector(selector));
      return el ? el.value : '';
    };
    const previewEl = /** @type {HTMLImageElement|null} */(containerEl.querySelector('[data-field="avatarPreview"]'));
    const avatarDataUrl = previewEl ? String(previewEl.getAttribute('src') || '') : '';
    const avatarInput = /** @type {HTMLInputElement|null} */(containerEl.querySelector('[data-field="avatar"]'));
    const avatarFilename = avatarInput && avatarInput.files && avatarInput.files[0] ? avatarInput.files[0].name : '';

    return {
      name: getVal('[data-field="name"]'),
      relationship: getVal('[data-field\="relationship\"]'),
      idType: getVal('[data-field\="idType\"]'),
      idNumber: getVal('[data-field\="idNumber\"]'),
      contactNumber: getVal('[data-field\="contactNumber\"]'),
      address: getVal('[data-field\="address\"]'),
      avatarFilename: avatarFilename,
      avatarPath: 'images/visitors/profiles',
      avatarDisk: 'public',
      avatarDataUrl: avatarDataUrl
    };
  }

  function collectAllowedVisitors() {
    const container = document.getElementById('allowed-visitors-container');
    if (!container) return [];

    const visitors = [];
    container.querySelectorAll('.bg-gray-800\\/40').forEach(visitorDiv => {
      const name = visitorDiv.querySelector('[data-field="name"]').value;
      const relationship = visitorDiv.querySelector('[data-field="relationship"]').value;
      const idType = visitorDiv.querySelector('[data-field="idType"]').value;
      const idNumber = visitorDiv.querySelector('[data-field="idNumber"]').value;
      const contactNumber = visitorDiv.querySelector('[data-field="contactNumber"]').value;
      const address = visitorDiv.querySelector('[data-field="address"]').value;
      const avatarInput = /** @type {HTMLInputElement|null} */(visitorDiv.querySelector('[data-field="avatar"]'));
      const avatarFilename = avatarInput && avatarInput.files && avatarInput.files[0] ? avatarInput.files[0].name : '';
      const avatarPath = 'images/visitors/profiles';
      const avatarDisk = 'public';
      const previewEl = /** @type {HTMLImageElement|null} */(visitorDiv.querySelector('[data-field="avatarPreview"]'));
      const avatarDataUrl = previewEl ? String(previewEl.getAttribute('src') || '') : '';

      if (name && relationship) {
        visitors.push({
          name: name,
          relationship: relationship,
          idType: idType,
          idNumber: idNumber,
          contactNumber: contactNumber,
          address: address,
          avatarFilename: avatarFilename,
          avatarPath: avatarPath,
          avatarDisk: avatarDisk,
          avatarDataUrl: avatarDataUrl
        });
      }
    });
    return visitors;
  }

  /**
   * Initialize the Visit Records form section.
   * @param {Object} [inmateData] - Optional inmate object to use for populating visit records.
   */
  function initializeVisitRecords(inmateData) {
    const container = document.getElementById('visit-records-container');
    const addBtn = document.getElementById('add-visit-record');
    const emptyState = document.getElementById('visits-empty-state');
    
    if (!container || !addBtn) return;

    // Clear existing entries
    container.innerHTML = '';

    // Load existing visit records
    let existingVisits = [];
    if (inmateData && Array.isArray(inmateData.recentVisits)) {
      existingVisits = inmateData.recentVisits;
    } else if (typeof inmate !== 'undefined' && inmate && Array.isArray(inmate.recentVisits)) {
      existingVisits = inmate.recentVisits;
    }
    
    // Add existing visits
    existingVisits.forEach((visit, index) => {
      addVisitRecord(visit, index);
    });

    // Show/hide empty state
    if (emptyState) {
      if (existingVisits.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }

    // Add button event listener
    addBtn.addEventListener('click', () => {
      addVisitRecord();
    });
  }

  function addVisitRecord(visit = {}, index = null) {
    const container = document.getElementById('visit-records-container');
    const emptyState = document.getElementById('visits-empty-state');
    if (!container) return;

    // Hide empty state when adding visits
    if (emptyState) {
      emptyState.classList.add('hidden');
    }

    const entryIndex = index !== null ? index : container.children.length;
    const visitDiv = document.createElement('div');
    visitDiv.className = 'bg-gray-800/40 rounded-xl p-4 border border-gray-600 hover:bg-gray-800/60 transition-all duration-200 shadow-sm';
    visitDiv.innerHTML = `
      <!-- Visit Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-semibold">${entryIndex + 1}</span>
          </div>
          <h4 class="text-base font-semibold text-gray-200">Visit Record</h4>
        </div>
        <button type="button" class="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md cursor-pointer transition-colors" 
                onclick="this.parentElement.parentElement.remove(); updateVisitsEmptyState();">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Remove
        </button>
      </div>

      <!-- Main Form Grid - Responsive -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <!-- Visit Date Field -->
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">Visit Date *</label>
          <input type="date" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                 value="${visit.date || ''}" data-field="date" required />
        </div>
        
        <!-- Visitor Name Field -->
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">Visitor Name *</label>
          <input type="text" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                 value="${visit.visitor || ''}" data-field="visitor" placeholder="Visitor name" required />
        </div>
        
        <!-- Status Field -->
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">Status *</label>
          <select class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" data-field="status" required>
            <option value="">Select status</option>
            <option value="Approved" ${visit.status === 'Approved' ? 'selected' : ''}>Approved</option>
            <option value="Pending" ${visit.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Denied" ${visit.status === 'Denied' ? 'selected' : ''}>Denied</option>
            <option value="Completed" ${visit.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Cancelled" ${visit.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
      </div>

      <!-- Second Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <!-- Relationship Field -->
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">Relationship</label>
          <select class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" data-field="relationship">
            <option value="">Select relationship</option>
            <option value="Father" ${visit.relationship === 'Father' ? 'selected' : ''}>Father</option>
            <option value="Mother" ${visit.relationship === 'Mother' ? 'selected' : ''}>Mother</option>
            <option value="Spouse" ${visit.relationship === 'Spouse' ? 'selected' : ''}>Spouse</option>
            <option value="Sibling" ${visit.relationship === 'Sibling' ? 'selected' : ''}>Sibling</option>
            <option value="Child" ${visit.relationship === 'Child' ? 'selected' : ''}>Child</option>
            <option value="Friend" ${visit.relationship === 'Friend' ? 'selected' : ''}>Friend</option>
            <option value="Lawyer" ${visit.relationship === 'Lawyer' ? 'selected' : ''}>Lawyer</option>
            <option value="Other" ${visit.relationship === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
        
        <!-- Duration Field -->
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">Duration (minutes)</label>
          <div class="relative">
            <input type="number" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                   value="${visit.duration || ''}" data-field="duration" placeholder="30" min="1" max="120" />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <span class="text-gray-400 text-xs">min</span>
            </div>
          </div>
        </div>
        
        <!-- Purpose Field -->
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">Purpose</label>
          <select class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" data-field="purpose">
            <option value="">Select purpose</option>
            <option value="Family visit" ${visit.purpose === 'Family visit' ? 'selected' : ''}>Family visit</option>
            <option value="Legal consultation" ${visit.purpose === 'Legal consultation' ? 'selected' : ''}>Legal consultation</option>
            <option value="Medical consultation" ${visit.purpose === 'Medical consultation' ? 'selected' : ''}>Medical consultation</option>
            <option value="Religious visit" ${visit.purpose === 'Religious visit' ? 'selected' : ''}>Religious visit</option>
            <option value="Emergency" ${visit.purpose === 'Emergency' ? 'selected' : ''}>Emergency</option>
            <option value="Other" ${visit.purpose === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>

      <!-- Third Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">Officer in Charge</label>
          <div class="relative">
            <input type="text" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                   value="${visit.officerInCharge || ''}" data-field="officerInCharge" placeholder="Officer name" />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm text-gray-300 mb-2 font-medium">Visit Time</label>
          <input type="time" class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                 value="${visit.time || ''}" data-field="time" />
        </div>
      </div>

      <!-- Notes Section -->
      <div class="mb-4">
        <label class="block text-sm text-gray-300 mb-2 font-medium">Additional Notes</label>
        <textarea class="w-full rounded-lg bg-gray-800/60 border border-gray-600 text-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none" 
                  rows="3" data-field="notes" placeholder="Additional details about the visit...">${visit.notes || ''}</textarea>
      </div>

      <!-- Visit Footer with Status -->
      <div class="mt-3 pt-3 border-t border-gray-600">
        <div class="flex items-center justify-between text-xs text-gray-400">
          <span>Visit #${entryIndex + 1}</span>
          <span class="flex items-center">
            <div class="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            ${visit.status || 'Pending'}
          </span>
        </div>
      </div>
    `;
    container.appendChild(visitDiv);
  }

  // Helper function to update visits empty state visibility
  function updateVisitsEmptyState() {
    const container = document.getElementById('visit-records-container');
    const emptyState = document.getElementById('visits-empty-state');
    
    if (container && emptyState) {
      if (container.children.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }
  }

  function collectVisitRecords() {
    const container = document.getElementById('visit-records-container');
    if (!container) return [];

    const visits = [];
    container.querySelectorAll('.bg-gray-800\\/40').forEach(visitDiv => {
      const date = visitDiv.querySelector('[data-field="date"]').value;
      const visitor = visitDiv.querySelector('[data-field="visitor"]').value;
      const relationship = visitDiv.querySelector('[data-field="relationship"]').value;
      const status = visitDiv.querySelector('[data-field="status"]').value;
      const purpose = visitDiv.querySelector('[data-field="purpose"]').value;
      const duration = visitDiv.querySelector('[data-field="duration"]').value;
      const officerInCharge = visitDiv.querySelector('[data-field="officerInCharge"]').value;
      const time = visitDiv.querySelector('[data-field="time"]').value;
      const notes = visitDiv.querySelector('[data-field="notes"]').value;

      if (date && visitor) {
        visits.push({
          date: date,
          visitor: visitor,
          relationship: relationship,
          status: status,
          purpose: purpose,
          duration: duration ? parseInt(duration) : null,
          officerInCharge: officerInCharge,
          time: time,
          notes: notes
        });
      }
    });
    return visits;
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
              <div class="font-medium text-red-500" data-i-crime></div>
              <div class="text-xs text-gray-500 dark:text-gray-400" data-i-sentence></div>
            </div>
            <span data-i-status class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"></span>
          </div>
          <div class="flex justify-between items-center text-sm">
              <div class="font-medium text-yellow-500" data-i-cell></div>
              <div class="text-xs text-gray-500 dark:text-gray-400" data-i-admission></div>
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

  // Map status to consistent badge styles
  function getStatusBadgeClasses(status) {
    switch (status) {
      case 'Active':
        return 'bg-green-500 text-white';
      case 'Released':
        return 'bg-blue-500 text-white';
      case 'Transferred':
        return 'bg-amber-500 text-white';
      case 'Medical':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-300 text-gray-800';
    }
  }

  const overviewHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <!-- Desktop: Profile Card -->
        <div class="hidden lg:flex flex-col items-center w-full">
          <div class="flex items-center justify-center mb-4">
            <div class="rounded-full bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 shadow-lg shadow-blue-200/60 p-1">
              <img 
                src="${inmate.avatarUrl || '/images/default-avatar.png'}" 
                alt="${name}'s avatar" 
                class="h-28 w-28 object-cover rounded-full border-4 border-white shadow-md"
                loading="lazy"
              />
        </div>
        </div>
          <div class="flex flex-col items-center w-full">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white mt-2">${name}</h2>
            <span 
              class="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(inmate.status)}"
              aria-label="Inmate status: ${inmate.status || 'Unknown'}"
            >
              ${inmate.status || '—'}
            </span>
      </div>
        </div>
        <!-- Mobile/Tablet: Stacked Profile Card -->
        <div class="flex flex-col items-center lg:hidden gap-2">
          <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden ring-2 ring-blue-200 bg-blue-100 flex items-center justify-center mb-2">
            <img 
              src="${inmate.avatarUrl || '/images/default-avatar.png'}" 
              alt="${name}'s avatar" 
              class="w-full h-full object-cover rounded-full border-4 border-white shadow"
              loading="lazy"
            />
          </div>
          <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">${name}</h2>
          <span 
            class="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(inmate.status)}"
            aria-label="Inmate status: ${inmate.status || 'Unknown'}"
          >
            ${inmate.status || '—'}
          </span>
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
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <!-- Desktop: Profile Card -->
        <div class="hidden lg:flex flex-col items-center w-full">
          <div class="flex items-center justify-center mb-4">
            <div class="rounded-full bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 shadow-lg shadow-blue-200/60 p-1">
              <img 
                src="${inmate.avatarUrl || '/images/default-avatar.png'}" 
                alt="${name}'s avatar" 
                class="h-28 w-28 object-cover rounded-full border-4 border-white shadow-md"
                loading="lazy"
              />
            </div>
          </div>
          <div class="flex flex-col items-center w-full">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white mt-2">${name}</h2>
            <span 
              class="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(inmate.status)}"
              aria-label="Inmate status: ${inmate.status || 'Unknown'}"
            >
              ${inmate.status || '—'}
            </span>
          </div>
        </div>
        <!-- Mobile/Tablet: Stacked Profile Card -->
        <div class="flex flex-col items-center lg:hidden gap-2">
          <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden ring-2 ring-blue-200 bg-blue-100 flex items-center justify-center mb-2">
            <img 
              src="${inmate.avatarUrl || '/images/default-avatar.png'}" 
              alt="${name}'s avatar" 
              class="w-full h-full object-cover rounded-full border-4 border-white shadow"
              loading="lazy"
            />
          </div>
          <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">${name}</h2>
          <span 
            class="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(inmate.status)}"
            aria-label="Inmate status: ${inmate.status || 'Unknown'}"
          >
            ${inmate.status || '—'}
          </span>
        </div>
      </div>
      <div class="lg:col-span-2 space-y-4">
        <div class="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Medical Information</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500 dark:text-gray-400">Medical Status:</span>
              <span class="text-gray-900 dark:text-gray-200">${inmate.medicalStatus || 'Not Assessed'}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Last Check:</span>
              <span class="text-gray-900 dark:text-gray-200">${inmate.lastMedicalCheck ? formatDate(inmate.lastMedicalCheck) : 'Not available'}</span>
            </div>
          </div>
          ${inmate.medicalNotes ? `
            <div class="mt-3">
              <span class="text-gray-500 dark:text-gray-400 text-sm">Notes:</span>
              <p class="text-gray-900 dark:text-gray-200 text-sm mt-1">${inmate.medicalNotes}</p>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  // Helpers for Points & Visitation data (updated to use new field names)
  function getPointsTotal(i) {
    return (i.currentPoints ?? i.pointsTotal ?? 0);
  }
  function getPointsHistory(i) {
    return Array.isArray(i.pointsHistory) ? i.pointsHistory : [];
  }
  function getAllowedVisitors(i) {
    return Array.isArray(i.allowedVisitors) ? i.allowedVisitors : [];
  }
  function getRecentVisits(i) {
    return Array.isArray(i.recentVisits) ? i.recentVisits : [];
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
  const pointsListItems = getPointsHistory(inmate).map(p => `
    <li class="rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-900">
      <div class="flex items-center justify-between">
        <div class="text-sm font-medium text-gray-900 dark:text-gray-200">${formatDate(p.date)}</div>
        <div class="text-sm font-semibold ${p.points >= 0 ? 'text-green-600' : 'text-red-500'}">${p.points}</div>
      </div>
      <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">${p.activity || '—'}</div>
      ${p.note ? `<div class="mt-1 text-xs text-gray-400 dark:text-gray-500">${p.note}</div>` : ''}
    </li>
  `).join('');
  const pointsHTML = `
     <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <!-- Desktop: Profile Card -->
        <div class="hidden lg:flex flex-col items-center w-full">
          <div class="flex items-center justify-center mb-4">
            <div class="rounded-full bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 shadow-lg shadow-blue-200/60 p-1">
              <img 
                src="${inmate.avatarUrl || '/images/default-avatar.png'}" 
                alt="${name}'s avatar" 
                class="h-28 w-28 object-cover rounded-full border-4 border-white shadow-md"
                loading="lazy"
              />
        </div>
        </div>
          <div class="flex flex-col items-center w-full">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white mt-2">${name}</h2>
            <span 
              class="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(inmate.status)}"
              aria-label="Inmate status: ${inmate.status || 'Unknown'}"
            >
              ${inmate.status || '—'}
            </span>
      </div>
        </div>
        <!-- Mobile/Tablet: Stacked Profile Card -->
        <div class="flex flex-col items-center lg:hidden gap-2">
          <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden ring-2 ring-blue-200 bg-blue-100 flex items-center justify-center mb-2">
            <img 
              src="${inmate.avatarUrl || '/images/default-avatar.png'}" 
              alt="${name}'s avatar" 
              class="w-full h-full object-cover rounded-full border-4 border-white shadow"
              loading="lazy"
            />
          </div>
          <h2 class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">${name}</h2>
          <span 
            class="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(inmate.status)}"
            aria-label="Inmate status: ${inmate.status || 'Unknown'}"
          >
            ${inmate.status || '—'}
          </span>
        </div>
      </div>
      <div class="lg:col-span-2 space-y-4">
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
      <!-- Mobile list -->
      <div class="sm:hidden">
        <ul class="space-y-3">
          ${pointsListItems || `<li class=\"px-3 py-6 text-center text-gray-500 dark:text-gray-400\">No points recorded</li>`}
        </ul>
      </div>
      <!-- Desktop table -->
      <div class="hidden sm:block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
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
              ${pointsRows || `<tr><td colspan=\"4\" class=\"px-3 py-6 text-center text-gray-500 dark:text-gray-400\">No points recorded</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const allowedVisitors = getAllowedVisitors(inmate);
  const visits = getRecentVisits(inmate);
  const allowedList = allowedVisitors.map((v, idx) => `
    <li class="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div class="min-w-0 flex-1">
        <button type="button" data-open-visitor="${idx}" class="truncate text-left text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 cursor-pointer">${v.name}</button>
        <p class="truncate text-xs text-gray-500 dark:text-gray-400">${v.relationship || '—'}${v.idType ? ` • ${v.idType}` : ''}${v.idNumber ? ` (${v.idNumber})` : ''}</p>
        ${v.contactNumber ? `<p class="truncate text-xs text-gray-400 dark:text-gray-500">📞 ${v.contactNumber}</p>` : ''}
        ${v.address ? `<p class="truncate text-xs text-gray-400 dark:text-gray-500">📍 ${v.address}</p>` : ''}
      </div>
      <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] bg-green-500/10 text-green-600">Allowed</span>
    </li>
  `).join('');
  const visitsCards = visits.map(v => `
    <div class="rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-900">
      <div class="flex items-center justify-between">
        <div class="text-sm font-medium text-gray-900 dark:text-gray-200">${v.visitor}</div>
        <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${v.status === 'Approved' ? 'bg-green-500/10 text-green-600' : v.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' : v.status === 'Completed' ? 'bg-blue-500/10 text-blue-600' : v.status === 'Cancelled' ? 'bg-gray-500/10 text-gray-600' : 'bg-red-500/10 text-red-600'}">${v.status || '—'}</span>
      </div>
      <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">${formatDate(v.date)}${v.relationship ? ` • ${v.relationship}` : ''}</div>
      ${v.purpose ? `<div class=\"mt-2 text-sm text-gray-700 dark:text-gray-300\">${v.purpose}</div>` : ''}
      <div class="mt-2 flex text-xs text-gray-400 dark:text-gray-500 gap-4">
        ${v.duration ? `<span>⏱ ${v.duration} min</span>` : ''}
      </div>
    </div>
  `).join('');
  const visitsRows = visits.map(v => `
    <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td class="px-3 py-2 whitespace-nowrap text-sm">${formatDate(v.date)}</td>
      <td class="px-3 py-2 text-sm">${v.visitor}</td>
      <td class="px-3 py-2 text-sm">${v.relationship || '—'}</td>
      <td class="px-3 py-2 text-sm">${v.purpose || '—'}</td>
      <td class="px-3 py-2 text-sm">${v.duration ? `${v.duration} min` : '—'}</td>
      <td class="px-3 py-2">
        <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${v.status === 'Approved' ? 'bg-green-500/10 text-green-600' : v.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600' : v.status === 'Completed' ? 'bg-blue-500/10 text-blue-600' : v.status === 'Cancelled' ? 'bg-gray-500/10 text-gray-600' : 'bg-red-500/10 text-red-600'}">${v.status || '—'}</span>
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
        <!-- Mobile cards -->
        <div class="sm:hidden p-4 pt-0 space-y-3">
          ${visitsCards || `<div class=\"text-sm text-gray-500 dark:text-gray-400\">No visit records</div>`}
        </div>
        <!-- Desktop table -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Date</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Visitor</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Relationship</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Purpose</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Duration</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              ${visitsRows || `<tr><td colspan=\"6\" class=\"px-3 py-6 text-center text-gray-500 dark:text-gray-400\">No visit records</td></tr>`}
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

  function attachVisitorModalHandlers() {
    const nodes = document.querySelectorAll('[data-open-visitor]');
    nodes.forEach((el) => {
      el.addEventListener('click', () => {
        const idxStr = el.getAttribute('data-open-visitor') || '-1';
        const idx = parseInt(idxStr, 10);
        if (!Number.isNaN(idx) && idx >= 0 && idx < allowedVisitors.length) {
          openVisitorModal(allowedVisitors[idx]);
        }
      });
    });
  }

  // Custom close button (SVG X) for top-right
  const closeBtnHTML = `
    <button type="button"
      id="swal-custom-close"
      class="absolute top-3 right-3 z-50 rounded-full p-2 bg-transparent text-gray-400 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer transition"
      aria-label="Close"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l8 8M6 14L14 6" />
      </svg>
    </button>
  `;

  const html = `
    ${closeBtnHTML}
    ${navHTML}
    <div id="tab-content" class="space-y-4 max-h-[70vh] overflow-y-auto scrollbar-none">${overviewHTML}</div>
  `;

  return window.Swal.fire({
    title: `<span class="hidden">Inmate</span>`,
    html,
    width,
    padding: isMobile() ? '0.75rem' : '1.5rem',
    showCancelButton: false,
    showConfirmButton: false,
    background: '#111827',
    color: '#F9FAFB',
    customClass: {
      container: 'swal-responsive-container',
      popup: 'swal-responsive-popup',
      content: 'swal-responsive-content',
    },
    didOpen: () => {
      // Attach close handler to custom close button
      const closeBtn = document.getElementById('swal-custom-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          window.Swal.close();
        });
      }
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
        if (id === 'visitation') attachVisitorModalHandlers();
      };
      document.querySelectorAll('button[data-tab]').forEach((btn, idx) => {
        btn.addEventListener('click', () => setActive(btn.getAttribute('data-tab')));
        if (idx === 0) btn.setAttribute('data-active', 'true');
      });
      setActive('overview');
    }
  });
}

// ===============================
// VISITOR INFO MODAL (SweetAlert2)
// ===============================
function openVisitorModal(visitor) {
  const width = isMobile() ? '95vw' : '32rem';
  const avatarSrc = (() => {
    if (visitor && typeof visitor.avatarDataUrl === 'string' && visitor.avatarDataUrl) return visitor.avatarDataUrl;
    return '/images/default-avatar.png';
  })();

  const name = visitor?.name || 'Visitor';
  const relationship = visitor?.relationship || '—';
  const idType = visitor?.idType || '';
  const idNumber = visitor?.idNumber || '';
  const contactNumber = visitor?.contactNumber || '';
  const address = visitor?.address || '';

  const headerHTML = `
    <div class="flex items-start gap-4">
      <div class="shrink-0">
        <img src="${avatarSrc}" alt="${name}" class="h-20 w-20 rounded-full object-cover ring-2 ring-blue-500/20 bg-gray-700/40 cursor-pointer" />
      </div>
      <div class="min-w-0">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-100">${name}</h2>
        <p class="mt-1 text-xs sm:text-sm text-gray-400">${relationship}${idType ? ` • ${idType}` : ''}${idNumber ? ` (${idNumber})` : ''}</p>
      </div>
    </div>
  `;

  const bodyHTML = `
    <div class="mt-4 grid grid-cols-1 gap-3">
      <div class="rounded-lg border border-gray-700 bg-gray-800/50 p-3 sm:p-4">
        <h3 class="text-sm font-semibold text-gray-200 mb-2">Contact</h3>
        <div class="text-sm text-gray-300 space-y-1">
          <div>${contactNumber ? `📞 ${contactNumber}` : '—'}</div>
          <div class="break-words">${address ? `📍 ${address}` : '—'}</div>
        </div>
      </div>
    </div>
  `;

  const html = `
    <div class="max-h-[70vh] overflow-y-auto space-y-4">
      ${headerHTML}
      ${bodyHTML}
    </div>
  `;

  return window.Swal.fire({
    title: `<span class="hidden">Visitor</span>`,
    html,
    width,
    padding: isMobile() ? '0.75rem' : '1.25rem',
    showCancelButton: false,
    showConfirmButton: true,
    confirmButtonText: 'Close',
    confirmButtonColor: '#3B82F6',
    background: '#111827',
    color: '#F9FAFB',
    customClass: {
      container: 'swal-responsive-container',
      popup: 'swal-responsive-popup',
      content: 'swal-responsive-content',
      confirmButton: 'cursor-pointer'
    },
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

