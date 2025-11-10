/**
 * Visitation Request Modals
 * Handles all SweetAlert2 modals for visitation requests, confirmations, and form submissions
 */

// Import dependencies
import { initializeConjugalVisit } from '../conjugal-visit-handler.js';
import { initializeCalendar, getSelectedDate, CalendarConfig, CookieManager } from '../calendar-handler.js';
import { showAutomaticRequestModal } from './automatic-request.js';

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

// ============================================================================
// AVAILABILITY & TIME SLOT FUNCTIONS
// ============================================================================

/**
 * Fetch availability for all time slots on a specific date
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Availability data mapped by time
 */
async function fetchTimeSlotAvailability(dateString) {
    try {
        const response = await fetch(`/api/visitation-logs/availability?date=${dateString}`);
        if (!response.ok) {
            console.error('Failed to fetch availability');
            return {};
        }
        const data = await response.json();
        if (data.success) {
            // Convert array to object keyed by time for easy lookup
            const availabilityMap = {};
            data.data.forEach(slot => {
                availabilityMap[slot.time] = slot;
            });
            return availabilityMap;
        }
        return {};
    } catch (error) {
        console.error('Error fetching availability:', error);
        return {};
    }
}

/**
 * Get inline percentage color class for dropdown options
 * @param {number} percentage - Availability percentage (0-100)
 * @param {boolean} isFull - Whether slot is full
 * @returns {string} Tailwind CSS classes
 */
function getPercentageColorClass(percentage, isFull) {
    if (isFull) {
        return 'text-red-600 dark:text-red-400';
    } else if (percentage >= 70) {
        return 'text-orange-600 dark:text-orange-400';
    } else if (percentage >= 40) {
        return 'text-yellow-600 dark:text-yellow-400';
    } else {
        return 'text-green-600 dark:text-green-400';
    }
}

/**
 * Generate time slots from CalendarConfig configuration for a specific date
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {Object} availabilityMap - Map of time to availability data
 * @returns {string} HTML string for time slot options
 */
function generateTimeSlots(dateString, availabilityMap = {}) {
    const slots = [];
    
    // Get time slots for the specific date
    const timeSlots = CalendarConfig.getTimeSlotsForDate(dateString);
    
    if (timeSlots.length === 0) {
        return '<option value="" disabled>No time slots available</option>';
    }
    
    // Generate option elements with availability info
    timeSlots.forEach(slot => {
        const availability = availabilityMap[slot.value] || null;
        const isAvailable = !availability || availability.is_available;
        const percentage = availability ? availability.percentage : 0;
        const isFull = availability ? availability.is_full : false;
        
        // Get visual indicator based on percentage
        let indicator = '';
        if (isFull || percentage >= 100) {
            indicator = '🔴'; // Red circle for full
        } else if (percentage >= 70) {
            indicator = '🟠'; // Orange circle for almost full
        } else if (percentage >= 40) {
            indicator = '🟡'; // Yellow circle for moderate
        } else {
            indicator = '🟢'; // Green circle for available
        }
        
        if (!isAvailable) {
            // Slot is full - show as disabled with percentage
            slots.push(`<option value="${slot.value}" disabled>${slot.label} ${indicator} (100%)</option>`);
        } else if (availability) {
            // Show percentage with color indicator
            slots.push(`<option value="${slot.value}">${slot.label} ${indicator} (${percentage}%)</option>`);
        } else {
            // No availability data, show normal option
            slots.push(`<option value="${slot.value}">${slot.label}</option>`);
        }
    });
    
    return slots.join('');
}

/**
 * Convert time format to 24-hour format
 * @param {string} time - Time in either 12-hour (e.g., "8:00 AM", "1:30 PM") or 24-hour format (e.g., "08:00", "13:30")
 * @returns {string} Time in 24-hour format (e.g., "08:00", "13:30")
 */
function convertTo24Hour(time) {
    // If already in 24-hour format (no AM/PM), return as-is
    if (!time || typeof time !== 'string') {
        return time;
    }
    
    const parts = time.trim().split(' ');
    
    // If only one part, it's already 24-hour format
    if (parts.length === 1) {
        return time;
    }
    
    // Handle 12-hour format (e.g., "8:00 AM", "1:30 PM")
    const [timePart, ampm] = parts;
    const [hours, minutes] = timePart.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
        return time; // Return original if parsing fails
    }
    
    let hours24 = hours;
    if (ampm && ampm.toUpperCase() === 'PM' && hours !== 12) {
        hours24 = hours + 12;
    } else if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) {
        hours24 = 0;
    }
    
    return `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// ============================================================================
// REQUEST & CONFIRMATION MODALS
// ============================================================================

/**
 * Show "Date Not Available" confirmation modal
 */
export function showDateNotAvailableModal() {
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    return window.Swal.fire({
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Date Not Available</span>`,
        text: 'This date is not available for visitation. Please select Saturday, Sunday, or Tuesday to Thursday.',
        icon: 'warning',
        confirmButtonText: 'OK',
        background: isDarkMode ? '#111827' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827',
        confirmButtonColor: '#3B82F6'
    });
}

/**
 * Show "Date Blocked" confirmation modal
 */
export function showDateBlockedModal() {
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    return window.Swal.fire({
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Date Blocked</span>`,
        text: 'This date is currently unavailable due to maintenance or special circumstances.',
        icon: 'error',
        confirmButtonText: 'OK',
        background: isDarkMode ? '#111827' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827',
        confirmButtonColor: '#3B82F6'
    });
}

/**
 * Show "Date Selected" confirmation modal
 */
export function showDateSelectedModal(dateString) {
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return window.Swal.fire({
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
 * Show "No Date Selected" warning modal
 */
export function showNoDateSelectedModal() {
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    return window.Swal.fire({
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">No Date Selected</span>`,
        text: 'Please select a visitation date from the calendar first.',
        icon: 'warning',
        background: isDarkMode ? '#1F2937' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827'
    });
}

/**
 * Show Manual Request confirmation modal
 */
export function showManualRequestConfirmationModal() {
            const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
            
    return window.Swal.fire({
                        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Manual Request</span>`,
                        text: 'Proceed to fill out the manual visitation request form?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Continue',
                        cancelButtonText: 'Cancel',
                        confirmButtonColor: '#3B82F6',
                        cancelButtonColor: isDarkMode ? '#111827' : '#6B7280',
                        backdrop: true,
                        background: isDarkMode ? '#0F172A' : '#FFFFFF',
                        color: isDarkMode ? '#F9FAFB' : '#111827'
    });
}

/**
 * Show Automatic Request confirmation modal
 */
export function showAutomaticRequestConfirmationModal() {
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    return window.Swal.fire({
                        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Automatic Request</span>`,
                        html: `<p class="text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}">We'll try to pre-fill your details based on previous visits. You can still edit everything.</p>`,
                        icon: 'info',
                        confirmButtonText: 'Try it',
                        confirmButtonColor: '#3B82F6',
                        backdrop: true,
                        background: isDarkMode ? '#0F172A' : '#FFFFFF',
                        color: isDarkMode ? '#F9FAFB' : '#111827'
                    });
}

// ============================================================================
// FORM MODALS & BACKEND VALIDATION
// ============================================================================

/**
 * Open Manual Request Modal (Main Form)
 */
export async function openManualRequestModal() {
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    const selectedVisitDate = getSelectedDate();
    
    if (!selectedVisitDate) {
        await showNoDateSelectedModal();
        return;
    }

    const formattedDate = new Date(selectedVisitDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    // Fetch availability for the selected date
    const availabilityMap = await fetchTimeSlotAvailability(selectedVisitDate);
    
    // Generate time slots with availability info
    const timeOptions = generateTimeSlots(selectedVisitDate, availabilityMap);

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
                
                <!-- Reason for Visit (Optional) -->
                <div class="mb-3">
                    <label for="reason-visit" class="block mb-1 text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">Reason for Visit <span class="text-gray-400 text-xs">(Optional)</span></label>
                    <textarea id="reason-visit" rows="2" 
                        class="block w-full px-2 py-2 text-xs sm:text-sm ${isDarkMode ? 'text-gray-900 bg-white border-gray-300' : 'text-gray-900 bg-white border-gray-300'} rounded-lg ${isDarkMode ? 'dark:bg-gray-900 dark:text-white dark:border-gray-600' : ''} focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="Please provide a brief reason for your visit (optional)..." maxlength="500"></textarea>
                    <p class="text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1">Maximum 500 characters (optional)</p>
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
async function validateAndProceedToSubmit(visitDate) {
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
    
    // Reason for visit is optional, no validation needed
    
    // Convert time format to 24-hour format (HH:mm) - handles both 12-hour and 24-hour
    const time24Hour = convertTo24Hour(visitTime);
    
    // Check availability one more time before submission
    try {
        const response = await fetch(`/api/visitation-logs/check-availability?date=${visitDate}&time=${time24Hour}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && !data.data.is_available) {
                window.Swal.showValidationMessage(`This time slot is now full (${data.data.current_count}/${data.data.max_visitors}). Please select another time.`);
                return false;
            }
        }
    } catch (error) {
        console.error('Error checking availability:', error);
        // Continue with submission if check fails (fail open)
    }
    
    // Combine date and time in ISO 8601 format: YYYY-MM-DDTHH:mm:ss
    const scheduleDateTime = `${visitDate}T${time24Hour}:00`;
    
    return {
        visitor_id: visitorId,
        inmate_id: inmateId,
        id_type: idType,
        id_number: idNumber,
        schedule: scheduleDateTime,
        reason_for_visit: reasonForVisit || null // Convert empty string to null
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
        const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
        
        window.Swal.fire({
            title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Submitting Request...</span>`,
            html: `<p class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Please wait while we process your visitation request.</p>`,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            background: isDarkMode ? '#111827' : '#FFFFFF',
            color: isDarkMode ? '#F9FAFB' : '#111827',
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
            let errorMessage = errorData.message || 'Failed to submit visitation request';
            
            // Include validation errors if present
            if (errorData.errors) {
                const validationErrors = Object.values(errorData.errors).flat().join(', ');
                errorMessage += ': ' + validationErrors;
            }
            
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        // Clear selected date cookie
        CookieManager.remove('selected_visit_date');
        
        // Send notification/reminder (placeholder function)
        await sendVisitationReminder(requestData);
        
        // Show success message
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
    console.log('Notification placeholder called with:', requestData);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize calendar interactions (attach day click handlers)
    initializeCalendar();
    // Initialize conjugal visit handler
    initializeConjugalVisit();
    
    // Get theme-aware colors from ThemeManager
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    // Manual Request Button Handler
    const manualBtn = document.getElementById('btn-manual');
    if (manualBtn) {
        manualBtn.addEventListener('click', async () => {
            const result = await showManualRequestConfirmationModal();
            if (result.isConfirmed) {
                await openManualRequestModal();
            }
        });
    }
    
    // Automatic Request Button Handler
    const autoBtn = document.getElementById('btn-auto');
    if (autoBtn) {
        autoBtn.addEventListener('click', async () => {
            await showAutomaticRequestModal();
        });
    }
});
