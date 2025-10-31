/**
 * Visitation Calendar Handler
 * Manages calendar date selection, cookie storage, and visitation request modals
 */

// ============================================================================
// AVATAR HELPER FUNCTIONS
// ============================================================================

/**
 * Generate SVG avatar based on inmate name
 * @param {string} name - Full name of the inmate
 * @returns {string} - Data URI of the generated SVG
 */
function generateInmateAvatarSVG(name) {
  if (!name || name === 'N/A') return '/images/default-avatar.svg';
  
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Generate consistent color based on name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="grad-${hue}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(${hue}, 60%, 50%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(${hue}, 60%, 40%);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#grad-${hue})" rx="50" />
      <text x="50" y="50" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="white" text-anchor="middle" dy=".3em">${initials}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Get inmate avatar URL with fallback to generated SVG
 * @param {Object} inmate - Inmate object with avatar data
 * @returns {string} - Avatar URL or generated SVG
 */
function getInmateAvatarUrl(inmate) {
  if (inmate?.avatar_path && inmate?.avatar_filename) {
    return `/storage/${inmate.avatar_path}/${inmate.avatar_filename}`;
  }
  
  const name = [inmate?.first_name, inmate?.last_name].filter(Boolean).join(' ');
  return generateInmateAvatarSVG(name || 'N/A');
}

// Cookie utility functions
const CookieManager = {
    set(name, value, days = 7) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
    },
    
    get(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    },
    
    remove(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }
};

// Calendar configuration
const CalendarConfig = {
    // Tuesday to Sunday are allowed (2, 3, 4, 5, 6, 0)
    allowedDays: [2, 3, 4, 5, 6, 0],
    
    // Available time slots
    timeSlots: [
        { value: '09:00', label: '9:00 AM' },
        { value: '10:00', label: '10:00 AM' },
        { value: '11:00', label: '11:00 AM' },
        { value: '12:00', label: '12:00 PM' },
        { value: '14:00', label: '2:00 PM' },
        { value: '15:00', label: '3:00 PM' },
        { value: '16:00', label: '4:00 PM' },
        { value: '17:00', label: '5:00 PM' }
    ],
    
    // Maintenance/blocked dates (format: 'YYYY-MM-DD')
    blockedDates: [
        // Add specific dates here when needed
        // Example: '2025-11-15', '2025-12-25'
    ],
    
    isDateAllowed(dateString) {
        // Check if date is in blocked list
        if (this.blockedDates.includes(dateString)) {
            return false;
        }
        
        const date = new Date(dateString);
        const dayOfWeek = date.getDay();
        
        // Check if day of week is allowed
        return this.allowedDays.includes(dayOfWeek);
    }
};

// Calendar state management
let selectedDate = null;

/**
 * Initialize calendar functionality
 */
export function initializeCalendar() {
    const calendarButtons = document.querySelectorAll('[data-calendar-day]');
    
    calendarButtons.forEach(button => {
        button.addEventListener('click', handleDateSelection);
    });
    
    // Restore previously selected date from cookie
    const savedDate = CookieManager.get('selected_visit_date');
    if (savedDate) {
        selectedDate = savedDate;
        highlightSelectedDate(savedDate);
    }
}

/**
 * Handle date selection on calendar
 */
function handleDateSelection(event) {
    const button = event.currentTarget;
    const day = button.getAttribute('data-calendar-day');
    const month = button.getAttribute('data-calendar-month');
    const year = button.getAttribute('data-calendar-year');
    const isOpen = button.getAttribute('data-is-open') === 'true';
    
    if (!isOpen) {
        // Get theme-aware colors from ThemeManager
        const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
        
        window.Swal.fire({
            title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Date Not Available</span>`,
            text: 'This date is not available for visitation. Please select Tuesday to Sunday.',
            icon: 'warning',
            confirmButtonText: 'OK',
            background: isDarkMode ? '#111827' : '#FFFFFF',
            color: isDarkMode ? '#F9FAFB' : '#111827',
            confirmButtonColor: '#3B82F6'
        });
        return;
    }
    
    // Format date as YYYY-MM-DD
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Check if date is blocked
    if (!CalendarConfig.isDateAllowed(dateString)) {
        // Get theme-aware colors from ThemeManager
        const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
        
        window.Swal.fire({
            title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Date Blocked</span>`,
            text: 'This date is currently unavailable due to maintenance or special circumstances.',
            icon: 'error',
            confirmButtonText: 'OK',
            background: isDarkMode ? '#111827' : '#FFFFFF',
            color: isDarkMode ? '#F9FAFB' : '#111827',
            confirmButtonColor: '#3B82F6'
        });
        return;
    }
    
    // Save selected date
    selectedDate = dateString;
    CookieManager.set('selected_visit_date', dateString, 7);
    
    // Update UI
    highlightSelectedDate(dateString);
    
    // Show confirmation
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    window.Swal.fire({
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Date Selected</span>`,
        html: `<p class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">You have selected:</p><p class="text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-2">${formattedDate}</p><p class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-3">You can now proceed with your visitation request.</p>`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: isDarkMode ? '#111827' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827'
    });
}

/**
 * Highlight the selected date on calendar
 */
function highlightSelectedDate(dateString) {
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    // Remove previous selection
    document.querySelectorAll('[data-calendar-day]').forEach(btn => {
        btn.classList.remove('ring-4', 'ring-blue-500', 'ring-offset-2', 'ring-offset-gray-900');
        btn.classList.remove('ring-offset-white');
        btn.classList.remove('bg-blue-500', '!text-white');
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.remove('!text-gray-900');
    });
    
    // Add selection to new date
    const [year, month, day] = dateString.split('-');
    const button = document.querySelector(
        `[data-calendar-day="${parseInt(day)}"][data-calendar-month="${parseInt(month)}"][data-calendar-year="${year}"]`
    );
    
    if (button) {
        // Apply theme-aware selection styling
        button.classList.add('ring-4', 'ring-blue-500', 'ring-offset-2');
        
        // Theme-aware ring offset
        if (isDarkMode) {
            button.classList.add('ring-offset-gray-900');
        } else {
            button.classList.add('ring-offset-white');
        }
        
        // Theme-aware text color for selected date
        if (isDarkMode) {
            // Dark mode: white text on blue background
            button.classList.add('bg-blue-500', '!text-white');
        } else {
            // Light mode: black text on blue background
            button.classList.add('bg-blue-500', '!text-gray-900');
        }
    }
}

/**
 * Get the currently selected date
 */
export function getSelectedDate() {
    return selectedDate || CookieManager.get('selected_visit_date');
}

/**
 * Generate time slots from 8:00 AM to 5:00 PM with 30-minute intervals
 */
function generateTimeSlots() {
    const slots = [];
    const startHour = 8; // 8:00 AM
    const endHour = 17;  // 5:00 PM
    
    for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            if (hour === endHour && minute > 0) break; // Don't go beyond 5:00 PM
            
            const time = hour <= 12 
                ? `${hour === 12 ? 12 : hour}:${minute.toString().padStart(2, '0')} ${minute === 0 ? 'PM' : 'PM'}`
                : `${hour - 12}:${minute.toString().padStart(2, '0')} PM`;
            
            slots.push(`<option value="${time}">${time}</option>`);
        }
    }
    
    return slots.join('');
}

/**
 * Open Manual Request Modal
 */
export async function openManualRequestModal() {
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    const selectedVisitDate = getSelectedDate();
    
    if (!selectedVisitDate) {
        await window.Swal.fire({
            title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">No Date Selected</span>`,
            text: 'Please select a visitation date from the calendar first.',
            icon: 'warning',
            background: isDarkMode ? '#1F2937' : '#FFFFFF',
            color: isDarkMode ? '#F9FAFB' : '#111827'
        });
        return;
    }

    const formattedDate = new Date(selectedVisitDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    // Generate time slots from 8:00 AM to 5:00 PM with 30-minute intervals
    const timeOptions = generateTimeSlots();

    const html = `
        <div class="text-left">
            <h3 class="text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3">Manual Visitation Request</h3>
            <div class="mb-3 p-2 ${isDarkMode ? 'bg-blue-600/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'} border rounded-lg">
                <p class="text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">
                    <span class="font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}">Selected Date:</span> ${formattedDate}
                </p>
            </div>
            
            <form class="max-w-full mx-auto" id="manual-request-form">
                <!-- ID Type Selection -->
                <div class="mb-3">
                    <label for="visitor-id-type" class="block mb-1 text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">ID Type</label>
                    <select id="visitor-id-type" class="block w-full px-2 py-2 text-xs sm:text-sm ${isDarkMode ? 'text-gray-900 bg-white border-gray-300' : 'text-gray-900 bg-white border-gray-300'} rounded-lg ${isDarkMode ? 'dark:bg-gray-900 dark:text-white dark:border-gray-600' : ''} focus:ring-blue-500 focus:border-blue-500">
                        <option value="" selected disabled>Select ID Type</option>
                        <option value="Philippine National ID (PhilSys)">Philippine National ID (PhilSys)</option>
                        <option value="Driver's License">Driver's License</option>
                        <option value="Passport">Passport</option>
                        <option value="SSS ID">SSS ID</option>
                        <option value="GSIS ID">GSIS ID</option>
                        <option value="UMID">UMID</option>
                        <option value="PhilHealth ID">PhilHealth ID</option>
                        <option value="Voter's ID (COMELEC)">Voter's ID (COMELEC)</option>
                        <option value="Postal ID">Postal ID</option>
                        <option value="TIN ID">TIN ID</option>
                        <option value="PRC ID">PRC ID</option>
                        <option value="Senior Citizen ID">Senior Citizen ID</option>
                        <option value="PWD ID">PWD ID</option>
                        <option value="Student ID">Student ID</option>
                        <option value="Company ID">Company ID</option>
                        <option value="Barangay ID">Barangay ID</option>
                    </select>
                </div>
                
                <!-- ID Number -->
                <div class="mb-3">
                    <label for="visitor-id-number" class="block mb-1 text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">ID Number</label>
                    <input type="text" id="visitor-id-number" 
                        class="block w-full px-2 py-2 text-xs sm:text-sm ${isDarkMode ? 'text-gray-900 bg-white border-gray-300' : 'text-gray-900 bg-white border-gray-300'} rounded-lg ${isDarkMode ? 'dark:bg-gray-900 dark:text-white dark:border-gray-600' : ''} focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="Enter ID number" />
                </div>
                
                <!-- Time Selection -->
                <div class="mb-3">
                    <label for="visit-time" class="block mb-1 text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">Preferred Time</label>
                    <select id="visit-time" class="block w-full px-2 py-2 text-xs sm:text-sm ${isDarkMode ? 'text-gray-900 bg-white border-gray-300' : 'text-gray-900 bg-white border-gray-300'} rounded-lg ${isDarkMode ? 'dark:bg-gray-900 dark:text-white dark:border-gray-600' : ''} focus:ring-blue-500 focus:border-blue-500">
                        <option value="" selected disabled>Select time slot</option>
                        ${timeOptions}
                    </select>
                </div>
                
                <!-- Reason for Visit -->
                <div class="mb-3">
                    <label for="reason-visit" class="block mb-1 text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">Reason for Visit</label>
                    <textarea id="reason-visit" rows="2" 
                        class="block w-full px-2 py-2 text-xs sm:text-sm ${isDarkMode ? 'text-gray-900 bg-white border-gray-300' : 'text-gray-900 bg-white border-gray-300'} rounded-lg ${isDarkMode ? 'dark:bg-gray-900 dark:text-white dark:border-gray-600' : ''} focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="Please provide a brief reason for your visit..." maxlength="500"></textarea>
                    <p class="text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1">Maximum 500 characters</p>
                </div>
                
                <!-- PDL Info Display (Initially Hidden) -->
                <div id="pdl-info-section" class="hidden mt-4 p-3 ${isDarkMode ? 'bg-green-600/10 border-green-500/30' : 'bg-green-50 border-green-200'} rounded-lg">
                    <h4 class="text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'} mb-2">Person Deprived of Liberty Information</h4>
                    <div class="flex items-start gap-3">
                        <div id="pdl-avatar" class="shrink-0">
                            <!-- Avatar will be inserted here -->
                        </div>
                        <div id="pdl-details" class="flex-1 text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1">
                            <!-- PDL details will be inserted here -->
                        </div>
                    </div>
                </div>
            </form>
        </div>
    `;
    
    const result = await window.Swal.fire({
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Manual Visitation Request</span>`,
        html,
        background: isDarkMode ? '#111827' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827',
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Continue',
        cancelButtonText: 'Cancel',
        heightAuto: false,
        scrollbarPadding: false,
        buttonsStyling: false,
        customClass: {
            popup: 'm-0 w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl p-3 sm:p-4 !rounded-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500',
            confirmButton: 'inline-flex items-center justify-center px-3 py-2 sm:px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium cursor-pointer',
            cancelButton: `inline-flex items-center justify-center px-3 py-2 sm:px-4 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900'} text-xs sm:text-sm font-medium ml-2 cursor-pointer`
        },
        didOpen: () => {
            setupIDVerification(selectedVisitDate);
        },
        preConfirm: () => {
            return validateAndProceedToSubmit(selectedVisitDate);
        }
    });
    
    if (result.isConfirmed && result.value) {
        await submitVisitationRequest(result.value);
    }
}

/**
 * Setup ID verification functionality
 */
function setupIDVerification(visitDate) {
    const idNumberInput = document.getElementById('visitor-id-number');
    const idTypeSelect = document.getElementById('visitor-id-type');
    
    let verificationTimeout = null;
    
    idNumberInput.addEventListener('input', () => {
        clearTimeout(verificationTimeout);
        
        const idNumber = idNumberInput.value.trim();
        const idType = idTypeSelect.value;
        
        if (idNumber.length >= 5 && idType) {
            verificationTimeout = setTimeout(() => {
                verifyPDLByID(idNumber, idType);
            }, 800);
        } else {
            hidePDLInfo();
        }
    });
    
    idTypeSelect.addEventListener('change', () => {
        const idNumber = idNumberInput.value.trim();
        const idType = idTypeSelect.value;
        
        if (idNumber.length >= 5 && idType) {
            verifyPDLByID(idNumber, idType);
        }
    });
}

/**
 * Verify PDL by ID number (fetch from backend)
 */
async function verifyPDLByID(idNumber, idType) {
    try {
        const response = await fetch(`/api/inmates/verify-by-id?id_number=${encodeURIComponent(idNumber)}&id_type=${encodeURIComponent(idType)}`);
        
        if (!response.ok) {
            hidePDLInfo();
            return;
        }
        
        const data = await response.json();
        
        if (data.success && data.inmate) {
            displayPDLInfo(data.inmate, data.visitor_id);
        } else {
            hidePDLInfo();
        }
    } catch (error) {
        console.error('Error verifying PDL:', error);
        hidePDLInfo();
    }
}

/**
 * Display PDL information
 */
function displayPDLInfo(inmate, visitorId) {
    const pdlSection = document.getElementById('pdl-info-section');
    const pdlAvatar = document.getElementById('pdl-avatar');
    const pdlDetails = document.getElementById('pdl-details');
    
    if (!pdlSection || !pdlAvatar || !pdlDetails) return;
    
    // Display avatar
    const avatarUrl = getInmateAvatarUrl(inmate);
    pdlAvatar.innerHTML = `
        <img src="${avatarUrl}" alt="${inmate.first_name} ${inmate.last_name}" 
            class="w-16 h-16 rounded-lg object-cover border-2 border-green-500/50 shrink-0" 
            onerror="this.src='/images/default-avatar.svg'" />
    `;
    
    // Display details
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    pdlDetails.innerHTML = `
        <p><span class="font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}">Name:</span> <span class="${isDarkMode ? 'text-gray-200' : 'text-gray-700'}">${inmate.first_name} ${inmate.last_name}</span></p>
        <p><span class="font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}">ID:</span> <span class="${isDarkMode ? 'text-gray-200' : 'text-gray-700'}">${String(inmate.id).padStart(4, '0')}</span></p>
        <p><span class="font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}">Cell:</span> <span class="${isDarkMode ? 'text-gray-200' : 'text-gray-700'}">${inmate.cell?.name || 'N/A'}</span></p>
        <p><span class="font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}">Status:</span> <span class="${isDarkMode ? 'text-gray-200' : 'text-gray-700'}">${inmate.status || 'N/A'}</span></p>
    `;
    
    // Store inmate and visitor data for submission
    pdlSection.setAttribute('data-inmate-id', inmate.id);
    pdlSection.setAttribute('data-visitor-id', visitorId);
    
    // Show section
    pdlSection.classList.remove('hidden');
}

/**
 * Hide PDL information
 */
function hidePDLInfo() {
    const pdlSection = document.getElementById('pdl-info-section');
    if (pdlSection) {
        pdlSection.classList.add('hidden');
        pdlSection.removeAttribute('data-inmate-id');
        pdlSection.removeAttribute('data-visitor-id');
    }
}

/**
 * Validate form and proceed to submit
 */
function validateAndProceedToSubmit(visitDate) {
    const idType = document.getElementById('visitor-id-type')?.value;
    const idNumber = document.getElementById('visitor-id-number')?.value.trim();
    const visitTime = document.getElementById('visit-time')?.value;
    const reasonForVisit = document.getElementById('reason-visit')?.value.trim();
    const pdlSection = document.getElementById('pdl-info-section');
    const inmateId = pdlSection?.getAttribute('data-inmate-id');
    const visitorId = pdlSection?.getAttribute('data-visitor-id');
    
    if (!idType) {
        window.Swal.showValidationMessage('Please select an ID type');
        return false;
    }
    
    if (!idNumber) {
        window.Swal.showValidationMessage('Please enter your ID number');
        return false;
    }
    
    if (!inmateId) {
        window.Swal.showValidationMessage('ID verification failed. Please check your ID details.');
        return false;
    }
    
    if (!visitorId) {
        window.Swal.showValidationMessage('Visitor verification failed. Please ensure you are registered.');
        return false;
    }
    
    if (!visitTime) {
        window.Swal.showValidationMessage('Please select a preferred time slot');
        return false;
    }
    
    if (!reasonForVisit) {
        window.Swal.showValidationMessage('Please provide a reason for your visit');
        return false;
    }
    
    // Combine date and time
    const scheduleDateTime = `${visitDate} ${visitTime}:00`;
    
    return {
        visitor_id: visitorId,
        inmate_id: inmateId,
        id_type: idType,
        id_number: idNumber,
        schedule: scheduleDateTime,
        reason_for_visit: reasonForVisit
    };
}

/**
 * Generate unique reference number
 * Format: VR-YYYYMMDD-XXXX (e.g., VR-20251031-A3F9)
 */
function generateReferenceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Generate 4-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return `VR-${year}${month}${day}-${code}`;
}

/**
 * Submit visitation request to backend
 */
async function submitVisitationRequest(requestData) {
    try {
        window.Swal.fire({
            title: 'Submitting Request...',
            html: 'Please wait while we process your visitation request.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            background: '#111827',
            color: '#F9FAFB',
            didOpen: () => {
                window.Swal.showLoading();
            }
        });
        
        // Generate unique reference number
        const referenceNumber = generateReferenceNumber();
        
        const response = await fetch('/api/visitation-logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify({
                ...requestData,
                reference_number: referenceNumber,
                status: 2 // Pending status
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit visitation request');
        }
        
        const data = await response.json();
        
        // Clear selected date cookie
        CookieManager.remove('selected_visit_date');
        selectedDate = null;
        
        // Send notification/reminder (placeholder function)
        await sendVisitationReminder(requestData);
        
        // Show success message
        // Get theme-aware colors from ThemeManager
        const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
        
        await window.Swal.fire({
            title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Request Submitted!</span>`,
            html: `
                <p class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3">Your visitation request has been submitted successfully.</p>
                <div class="p-3 ${isDarkMode ? 'bg-blue-600/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'} border rounded-lg text-left">
                    <p class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1">Reference Number:</p>
                    <p class="text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-mono tracking-wider">${referenceNumber}</p>
                </div>
                <p class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-3">Please save this reference number. You will need it for verification at the facility.</p>
                <p class="text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} mt-1">Please wait for approval from the facility warden.</p>
            `,
            icon: 'success',
            confirmButtonText: 'OK',
            background: isDarkMode ? '#111827' : '#FFFFFF',
            color: isDarkMode ? '#F9FAFB' : '#111827',
            confirmButtonColor: '#10B981'
        });
        
        // Reload page to reflect changes
        setTimeout(() => {
            window.location.reload();
        }, 500);
        
    } catch (error) {
        console.error('Error submitting visitation request:', error);
        
        // Get theme-aware colors from ThemeManager
        const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
        
        await window.Swal.fire({
            title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Submission Failed</span>`,
            text: error.message || 'An error occurred while submitting your request. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
            background: isDarkMode ? '#111827' : '#FFFFFF',
            color: isDarkMode ? '#F9FAFB' : '#111827',
            confirmButtonColor: '#EF4444'
        });
    }
}

/**
 * Send visitation reminder via email/SMS
 * PLACEHOLDER FUNCTION - To be implemented with actual notification service
 */
async function sendVisitationReminder(requestData) {
    // TODO: Implement actual notification logic
    
    // Example structure for future implementation:
    /*
    const visitorContact = {
        email: requestData.visitor_email || null,
        phone: requestData.visitor_phone || null
    };
    
    // If visitor has email, send email reminder
    if (visitorContact.email) {
        await sendEmailReminder({
            to: visitorContact.email,
            subject: 'Visitation Request Confirmation',
            schedule: requestData.schedule,
            inmateId: requestData.inmate_id
        });
    }
    
    // If visitor has phone, send SMS reminder
    if (visitorContact.phone) {
        await sendSMSReminder({
            to: visitorContact.phone,
            message: `Your visitation request for ${requestData.schedule} has been submitted. Reference: ${requestData.id}`,
            schedule: requestData.schedule
        });
    }
    
    // If visitor has both, send both
    if (visitorContact.email && visitorContact.phone) {
        // Send both email and SMS
    }
    */
    
    console.log('Notification placeholder called with:', requestData);
}

/**
 * Send email reminder
 * PLACEHOLDER FUNCTION
 */
async function sendEmailReminder(emailData) {
    // TODO: Implement email sending logic
    // This could use Laravel's mail system or a third-party service
    console.log('Email reminder would be sent:', emailData);
}

/**
 * Send SMS reminder
 * PLACEHOLDER FUNCTION
 */
async function sendSMSReminder(smsData) {
    // TODO: Implement SMS sending logic
    // This could use Twilio, Semaphore, or other SMS gateway
    console.log('SMS reminder would be sent:', smsData);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeCalendar();
    
    // Attach manual request button handler
    const manualBtn = document.getElementById('btn-manual');
    if (manualBtn) {
        manualBtn.addEventListener('click', openManualRequestModal);
    }
});
