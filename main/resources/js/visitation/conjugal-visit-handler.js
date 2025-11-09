/**
 * Conjugal Visit Handler - Part 1
 * Core functionality and Step 1-2
 */

import { getSelectedDate } from './calendar-handler.js';
import { openConjugalStep3 } from './conjugal-visit-steps.js';
import { checkEligibility } from '../modules/conjugal-validation-helper.js';

// State management
export let currentConjugalState = {
    selectedDate: null,
    visitorId: null,
    inmateId: null,
    idType: null,
    idNumber: null,
    conjugalVisitId: null,
    isRegistered: false,
};

/**
 * Initialize conjugal visit button
 */
export function initializeConjugalVisit() {
    const conjugalBtn = document.getElementById('btn-conjugal');
    
    if (conjugalBtn) {
        conjugalBtn.addEventListener('click', handleConjugalVisitClick);
    }
}

/**
 * Handle conjugal visit button click
 */
async function handleConjugalVisitClick() {
    const selectedDate = getSelectedDate();
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    if (!selectedDate) {
        await window.Swal.fire({
            title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">No Date Selected</span>`,
            text: 'Please select a visitation date from the calendar first.',
            icon: 'warning',
            background: isDarkMode ? '#1F2937' : '#FFFFFF',
            color: isDarkMode ? '#F9FAFB' : '#111827',
            confirmButtonColor: '#3B82F6'
        });
        return;
    }
    
    currentConjugalState.selectedDate = selectedDate;
    
    // Note: Eligibility will be checked after ID verification in Step 1
    // This is because we need visitor_id and inmate_id to check eligibility
    await showStep1IDVerification();
}

/**
 * Step 1: ID Type and Number Selection
 */
export async function showStep1IDVerification() {
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    const formattedDate = new Date(currentConjugalState.selectedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    const html = `
        <div class="text-left">
            <h3 class="text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3">Conjugal Visit Request</h3>
            <div class="mb-4 p-3 ${isDarkMode ? 'bg-pink-600/10 border-pink-500/30' : 'bg-pink-50 border-pink-200'} border rounded-lg">
                <p class="text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">
                    <span class="font-semibold ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}">Selected Date:</span> ${formattedDate}
                </p>
            </div>
            
            <form class="max-w-full mx-auto" id="conjugal-id-form">
                <div class="mb-3">
                    <label for="conjugal-id-type" class="block mb-1 text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">ID Type</label>
                    <select id="conjugal-id-type" class="block w-full px-2 py-2 text-xs sm:text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 ${isDarkMode ? 'bg-gray-900 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}">
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
                    </select>
                </div>
                
                <div class="mb-3">
                    <label for="conjugal-id-number" class="block mb-1 text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">ID Number</label>
                    <input type="text" id="conjugal-id-number" 
                        class="block w-full px-2 py-2 text-xs sm:text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 ${isDarkMode ? 'bg-gray-900 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}" 
                        placeholder="Enter ID number" />
                </div>
                
                <div id="conjugal-pdl-info" class="hidden mt-4 p-3 ${isDarkMode ? 'bg-green-600/10 border-green-500/30' : 'bg-green-50 border-green-200'} rounded-lg">
                    <h4 class="text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'} mb-2">PDL Information</h4>
                    <div class="flex items-start gap-3">
                        <div id="conjugal-pdl-avatar" class="shrink-0"></div>
                        <div id="conjugal-pdl-details" class="flex-1 text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1"></div>
                        <button type="button" id="conjugal-select-inmate" class="hidden shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-pink-600 hover:bg-pink-700 text-white cursor-pointer">
                            Select
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `;
    
    await window.Swal.fire({
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Conjugal Visit - Step 1</span>`,
        html,
        background: isDarkMode ? '#111827' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827',
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: 'Cancel',
        heightAuto: false,
        scrollbarPadding: false,
        buttonsStyling: false,
        customClass: {
            popup: 'm-0 w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl p-3 sm:p-4 !rounded-2xl max-h-[90vh] overflow-y-auto',
            cancelButton: `inline-flex items-center justify-center px-3 py-2 sm:px-4 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900'} text-xs sm:text-sm font-medium cursor-pointer`
        },
        didOpen: () => {
            setupConjugalIDVerification();
        }
    });
}

/**
 * Setup ID verification
 */
function setupConjugalIDVerification() {
    const idNumberInput = document.getElementById('conjugal-id-number');
    const idTypeSelect = document.getElementById('conjugal-id-type');
    const selectBtn = document.getElementById('conjugal-select-inmate');
    
    let verificationTimeout = null;
    
    idNumberInput.addEventListener('input', () => {
        clearTimeout(verificationTimeout);
        
        const idNumber = idNumberInput.value.trim();
        const idType = idTypeSelect.value;
        
        if (idNumber.length >= 5 && idType) {
            verificationTimeout = setTimeout(() => {
                verifyConjugalPDL(idNumber, idType);
            }, 800);
        } else {
            hideConjugalPDLInfo();
        }
    });
    
    idTypeSelect.addEventListener('change', () => {
        const idNumber = idNumberInput.value.trim();
        const idType = idTypeSelect.value;
        
        if (idNumber.length >= 5 && idType) {
            verifyConjugalPDL(idNumber, idType);
        }
    });
    
    if (selectBtn) {
        selectBtn.addEventListener('click', async () => {
            await proceedToStep2();
        });
    }
}

/**
 * Verify PDL by ID
 */
async function verifyConjugalPDL(idNumber, idType) {
    try {
        console.log('Verifying PDL with:', { idNumber, idType });
        
        const response = await fetch(`/api/inmates/verify-by-id?id_number=${encodeURIComponent(idNumber)}&id_type=${encodeURIComponent(idType)}`);
        
        const data = await response.json();
        console.log('API Response:', { status: response.status, data });
        
        if (!response.ok) {
            hideConjugalPDLInfo();
            
            // Show error message to user
            const pdlSection = document.getElementById('conjugal-pdl-info');
            if (pdlSection) {
                const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
                const pdlDetails = document.getElementById('conjugal-pdl-details');
                if (pdlDetails) {
                    pdlDetails.innerHTML = `
                        <div class="p-2 ${isDarkMode ? 'bg-red-600/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'} border rounded-lg">
                            <p class="text-xs font-medium">${data.message || 'No matching visitor found. Please check your ID number and type.'}</p>
                        </div>
                    `;
                    pdlSection.classList.remove('hidden');
                }
            }
            return;
        }
        
        if (data.success && data.inmate) {
            currentConjugalState.visitorId = data.visitor_id;
            currentConjugalState.inmateId = data.inmate.id;
            currentConjugalState.idType = idType;
            currentConjugalState.idNumber = idNumber;
            
            console.log('PDL verified successfully:', data.inmate);
            displayConjugalPDLInfo(data.inmate);
        } else {
            console.error('Verification failed:', data);
            hideConjugalPDLInfo();
        }
    } catch (error) {
        console.error('Error verifying PDL:', error);
        hideConjugalPDLInfo();
        
        // Show error message
        const pdlSection = document.getElementById('conjugal-pdl-info');
        if (pdlSection) {
            const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
            const pdlDetails = document.getElementById('conjugal-pdl-details');
            if (pdlDetails) {
                pdlDetails.innerHTML = `
                    <div class="p-2 ${isDarkMode ? 'bg-red-600/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'} border rounded-lg">
                        <p class="text-xs font-medium">Error: Failed to verify. Please try again.</p>
                    </div>
                `;
                pdlSection.classList.remove('hidden');
            }
        }
    }
}

/**
 * Display PDL info
 */
function displayConjugalPDLInfo(inmate) {
    const pdlSection = document.getElementById('conjugal-pdl-info');
    const pdlAvatar = document.getElementById('conjugal-pdl-avatar');
    const pdlDetails = document.getElementById('conjugal-pdl-details');
    const selectBtn = document.getElementById('conjugal-select-inmate');
    
    if (!pdlSection || !pdlAvatar || !pdlDetails) return;
    
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    pdlAvatar.innerHTML = `<img src="/storage/${inmate.avatar_path}/${inmate.avatar_filename}" alt="${inmate.first_name}" class="w-16 h-16 rounded-lg object-cover border-2 border-green-500/50" onerror="this.src='/images/default-avatar.svg'" />`;
    
    pdlDetails.innerHTML = `
        <p><span class="font-semibold">Name:</span> ${inmate.first_name} ${inmate.last_name}</p>
        <p><span class="font-semibold">ID:</span> ${String(inmate.id).padStart(4, '0')}</p>
        <p><span class="font-semibold">Cell:</span> ${inmate.cell?.name || 'N/A'}</p>
    `;
    
    pdlSection.classList.remove('hidden');
    if (selectBtn) selectBtn.classList.remove('hidden');
}

/**
 * Hide PDL info
 */
function hideConjugalPDLInfo() {
    const pdlSection = document.getElementById('conjugal-pdl-info');
    const selectBtn = document.getElementById('conjugal-select-inmate');
    
    if (pdlSection) pdlSection.classList.add('hidden');
    if (selectBtn) selectBtn.classList.add('hidden');
}

/**
 * Proceed to Step 2 (Eligibility Check and Time Selection)
 * Documents are already uploaded during visitor registration, so we skip document upload step
 */
async function proceedToStep2() {
    window.Swal.close();
    
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    // Show loading
    window.Swal.fire({
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Checking Eligibility...</span>`,
        html: `<p class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">Please wait...</p>`,
        allowOutsideClick: false,
        showConfirmButton: false,
        background: isDarkMode ? '#111827' : '#FFFFFF',
        didOpen: () => window.Swal.showLoading()
    });
    
    try {
        // Check eligibility for conjugal visit
        const eligibilityData = await checkEligibility(
            currentConjugalState.visitorId,
            currentConjugalState.inmateId
        );
        
        if (!eligibilityData.success) {
            throw new Error('Failed to check eligibility');
        }
        
        // Check if registration exists
        if (!eligibilityData.conjugal_visit) {
            window.Swal.close();
            await window.Swal.fire({
                title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Registration Required</span>`,
                html: `
                    <p class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3">
                        You must complete conjugal visit registration first. Please register as a Wife, Husband, or Spouse visitor for this inmate.
                    </p>
                    <p class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">
                        Registration requires:<br/>
                        • Marriage/Live-in start date (at least 6 years ago)<br/>
                        • Cohabitation Certificate<br/>
                        • Marriage Contract
                    </p>
                `,
                icon: 'info',
                background: isDarkMode ? '#111827' : '#FFFFFF',
                confirmButtonColor: '#3B82F6'
            });
            return;
        }
        
        currentConjugalState.conjugalVisitId = eligibilityData.conjugal_visit.id;
        currentConjugalState.isRegistered = true;
        
        // Check if eligible
        if (!eligibilityData.eligible) {
            window.Swal.close();
            
            const validation = eligibilityData.validation || {};
            let errorMessage = 'You are not eligible for conjugal visits.';
            
            if (validation.reason) {
                errorMessage = validation.reason;
            } else if (eligibilityData.status && eligibilityData.status.toLowerCase() !== 'approved') {
                errorMessage = `Your registration is ${eligibilityData.status.toLowerCase()}. Please wait for approval.`;
            } else if (!eligibilityData.has_documents) {
                errorMessage = 'Required documents are missing. Please contact the administrator.';
            }
            
            await window.Swal.fire({
                title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Not Eligible</span>`,
                html: `
                    <p class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3">${errorMessage}</p>
                    ${validation.years !== null && validation.years !== undefined ? `
                        <p class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                            Relationship Duration: ${validation.years} ${validation.years === 1 ? 'year' : 'years'}
                        </p>
                    ` : ''}
                `,
                icon: 'warning',
                background: isDarkMode ? '#111827' : '#FFFFFF',
                confirmButtonColor: '#3B82F6'
            });
            return;
        }
        
        // All checks passed - proceed to time selection (Step 3)
        window.Swal.close();
        await openConjugalStep3(currentConjugalState);
        
    } catch (error) {
        console.error('Error:', error);
        window.Swal.close();
        await window.Swal.fire({
            title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Error</span>`,
            text: error.message || 'Failed to check eligibility. Please try again.',
            icon: 'error',
            background: isDarkMode ? '#111827' : '#FFFFFF',
            confirmButtonColor: '#EF4444'
        });
    }
}
