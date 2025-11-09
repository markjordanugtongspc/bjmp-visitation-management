/**
 * Conjugal Visit Steps - Part 2
 * Step 3 (Time Selection)
 * 
 * Note: Step 2 (Document Upload) has been removed.
 * Documents are now uploaded during visitor registration when relationship is "Wife", "Husband", or "Spouse".
 */

/**
 * Step 2: Document Upload Modal (DEPRECATED)
 * This function is no longer used. Documents are uploaded during visitor registration.
 * @deprecated Documents are now uploaded during visitor registration. Use visitor registration form instead.
 */
export async function openConjugalStep2Upload(state, backCallback) {
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    const html = `
        <div class="text-left">
            <h3 class="text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3">Upload Required Documents</h3>
            <p class="text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4">Please upload the following documents:</p>
            
            <form class="space-y-4" id="conjugal-documents-form">
                <div>
                    <label class="block mb-2 text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">
                        Live-in Cohabitation Certificate <span class="text-red-500">*</span>
                    </label>
                    <input type="file" id="cohabitation-cert" accept=".pdf,.jpg,.jpeg,.png" required
                        class="block w-full text-xs text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700" />
                    <p class="mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}">Issued by Barangay Official (Max 10MB)</p>
                </div>
                
                <div>
                    <label class="block mb-2 text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">
                        Marriage Contract <span class="text-red-500">*</span>
                    </label>
                    <input type="file" id="marriage-contract" accept=".pdf,.jpg,.jpeg,.png" required
                        class="block w-full text-xs text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700" />
                    <p class="mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}">Official Marriage Certificate (Max 10MB)</p>
                </div>
                
                <div class="mt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4">
                    <button type="button" id="guidelines-toggle" class="w-full flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} cursor-pointer">
                        <span class="text-xs sm:text-sm font-medium">📋 Conjugal Visit Guidelines</span>
                        <svg id="guidelines-icon" class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div id="guidelines-content" class="hidden mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}">
                        <div id="guidelines-viewer" class="min-h-[200px] text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">
                            <p class="text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}">Loading guidelines...</p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    `;
    
    const result = await window.Swal.fire({
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Conjugal Visit - Step 2</span>`,
        html,
        background: isDarkMode ? '#111827' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827',
        showCancelButton: true,
        confirmButtonText: 'Submit Registration',
        cancelButtonText: 'Back',
        heightAuto: false,
        buttonsStyling: false,
        customClass: {
            popup: 'm-0 w-[95vw] max-w-lg sm:max-w-xl p-3 sm:p-4 !rounded-2xl max-h-[90vh] overflow-y-auto',
            confirmButton: 'inline-flex items-center px-3 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-medium cursor-pointer',
            cancelButton: `inline-flex items-center px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900'} text-xs font-medium ml-2 cursor-pointer`
        },
        didOpen: () => {
            setupDocumentHandlers();
            loadConjugalGuidelines();
        },
        preConfirm: () => validateAndSubmitDocuments(state)
    });
    
    if (result.isDismissed && result.dismiss === window.Swal.DismissReason.cancel) {
        await backCallback();
    }
}

/**
 * Setup document handlers
 */
function setupDocumentHandlers() {
    const toggle = document.getElementById('guidelines-toggle');
    const content = document.getElementById('guidelines-content');
    const icon = document.getElementById('guidelines-icon');
    
    if (toggle && content && icon) {
        toggle.addEventListener('click', () => {
            content.classList.toggle('hidden');
            icon.classList.toggle('rotate-180');
        });
    }
}

/**
 * Load guidelines
 */
async function loadConjugalGuidelines() {
    try {
        const viewer = document.getElementById('guidelines-viewer');
        if (!viewer) return;
        
        // Determine the correct API endpoint
        // For visitors (unauthenticated), use public API route
        // For staff (authenticated), use web routes
        const listUrl = document.querySelector('[data-list-url]')?.dataset.listUrl;
        let apiUrl;
        
        if (listUrl) {
            // Use the supervision list URL from the page (authenticated routes)
            apiUrl = `${listUrl}?category=Conjugal`;
        } else {
            // Check if we're on a staff page
            const isWarden = window.location.pathname.includes('/warden/');
            const isAssistantWarden = window.location.pathname.includes('/assistant-warden/');
            
            if (isWarden) {
                apiUrl = '/warden/supervision/files?category=Conjugal';
            } else if (isAssistantWarden) {
                apiUrl = '/assistant-warden/supervision/files?category=Conjugal';
            } else {
                // For visitors/public pages, use public API route
                apiUrl = '/api/supervision?category=Conjugal';
            }
        }
        
        const csrfToken = document.querySelector('[data-csrf-token]')?.dataset.csrfToken || 
                         document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        
        console.log('[Conjugal] Fetching guidelines from:', apiUrl);
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        });
        
        if (!response.ok) {
            console.error('[Conjugal] Guidelines HTTP error:', response.status, response.statusText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[Conjugal] Guidelines API data:', data);
        
        // Check response structure - API returns { success: true, data: [...] }
        if (data.success && data.data && data.data.length > 0) {
            const file = data.data[0]; // Get the first/most recent Conjugal file
            
            // Prioritize public URLs for non-authenticated access
            // Use api_preview_url (public API route) or public_url (direct asset) first
            let previewUrl = file.api_preview_url || file.public_url || file.preview_url;
            
            if (!previewUrl) {
                // Fallback: construct preview URL
                if (apiUrl.includes('/api/supervision')) {
                    // Public API route - construct preview URL
                    previewUrl = `/api/supervision/${file.id}/preview`;
                } else if (apiUrl.includes('/warden/')) {
                    previewUrl = `/warden/supervision/files/${file.id}/preview`;
                } else if (apiUrl.includes('/assistant-warden/')) {
                    previewUrl = `/assistant-warden/supervision/files/${file.id}/preview`;
                } else {
                    previewUrl = file.download_url || '#';
                }
            }
            
            const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
            
            viewer.innerHTML = `
                <div class="space-y-3">
                    <div class="p-2 ${isDarkMode ? 'bg-pink-600/10 border-pink-500/30' : 'bg-pink-50 border-pink-200'} border rounded-lg">
                        <p class="text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-pink-400' : 'text-pink-600'} mb-1">${file.title || 'Conjugal Visit Guidelines'}</p>
                        ${file.summary ? `<p class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">${file.summary}</p>` : ''}
                    </div>
                    <div class="relative">
                        <iframe 
                            src="${previewUrl}" 
                            class="w-full h-64 sm:h-80 md:h-96 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} bg-white dark:bg-gray-800"
                            frameborder="0"
                            allow="fullscreen"
                            loading="lazy">
                        </iframe>
                    </div>
                    <div class="flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}">
                        <span>${file.formatted_file_size || 'Unknown size'}</span>
                        <a href="${previewUrl}" target="_blank" class="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 underline font-medium">
                            Open in new tab
                        </a>
                    </div>
                </div>
            `;
        } else {
            viewer.innerHTML = `
                <p class="text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} py-4">
                    No guidelines available. Please contact the facility administrator.
                </p>
            `;
        }
    } catch (error) {
        console.error('Error loading guidelines:', error);
        const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
        const viewer = document.getElementById('guidelines-viewer');
        if (viewer) {
            viewer.innerHTML = `
                <p class="text-center ${isDarkMode ? 'text-red-400' : 'text-red-600'} py-4">
                    Failed to load guidelines. Please try again later.
                </p>
            `;
        }
    }
}

/**
 * Validate and submit documents
 */
async function validateAndSubmitDocuments(state) {
    const cohabitationCert = document.getElementById('cohabitation-cert');
    const marriageContract = document.getElementById('marriage-contract');
    
    if (!cohabitationCert.files[0]) {
        window.Swal.showValidationMessage('Please upload the Cohabitation Certificate');
        return false;
    }
    
    if (!marriageContract.files[0]) {
        window.Swal.showValidationMessage('Please upload the Marriage Contract');
        return false;
    }
    
    if (cohabitationCert.files[0].size > 10 * 1024 * 1024) {
        window.Swal.showValidationMessage('Cohabitation Certificate must be less than 10MB');
        return false;
    }
    
    if (marriageContract.files[0].size > 10 * 1024 * 1024) {
        window.Swal.showValidationMessage('Marriage Contract must be less than 10MB');
        return false;
    }
    
    const formData = new FormData();
    formData.append('visitor_id', state.visitorId);
    formData.append('inmate_id', state.inmateId);
    formData.append('cohabitation_cert', cohabitationCert.files[0]);
    formData.append('marriage_contract', marriageContract.files[0]);
    
    try {
        const response = await fetch('/api/conjugal-visits/register', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to submit registration');
        }
        
        return data;
    } catch (error) {
        window.Swal.showValidationMessage(error.message);
        return false;
    }
}

/**
 * Step 3: Time Selection and Fee Display
 */
export async function openConjugalStep3(state) {
    window.Swal.close();
    
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    const formattedDate = new Date(state.selectedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    const html = `
        <div class="text-left">
            <h3 class="text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3">Select Visit Duration</h3>
            <div class="mb-4 p-3 ${isDarkMode ? 'bg-pink-600/10 border-pink-500/30' : 'bg-pink-50 border-pink-200'} border rounded-lg">
                <p class="text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">
                    <span class="font-semibold ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}">Selected Date:</span> ${formattedDate}
                </p>
            </div>
            
            <form class="space-y-4" id="conjugal-time-form">
                <div>
                    <label class="block mb-2 text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}">
                        Preferred Duration <span class="text-red-500">*</span>
                    </label>
                    <select id="conjugal-duration" required class="block w-full px-3 py-2 text-sm rounded-lg ${isDarkMode ? 'bg-gray-900 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} focus:ring-pink-500 focus:border-pink-500">
                        <option value="" disabled selected>Select duration</option>
                        <option value="30">30 Minutes</option>
                        <option value="35">35 Minutes</option>
                        <option value="40">40 Minutes</option>
                        <option value="45">45 Minutes</option>
                        <option value="60">1 Hour</option>
                        <option value="120">2 Hours</option>
                    </select>
                </div>
                
                <div class="p-4 rounded-lg ${isDarkMode ? 'bg-yellow-600/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'} border">
                    <div class="flex items-start gap-3">
                        <svg class="w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                        </svg>
                        <div>
                            <p class="text-sm font-semibold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}">Conjugal Visit Fee</p>
                            <p class="text-xs ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'} mt-1">
                                There is a <strong>₱50.00</strong> fee for conjugal visits. Payment must be made in <strong>CASH</strong> at the facility before the visit.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    `;
    
    const result = await window.Swal.fire({
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Conjugal Visit - Step 3</span>`,
        html,
        background: isDarkMode ? '#111827' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827',
        showCancelButton: true,
        confirmButtonText: 'Submit Request',
        cancelButtonText: 'Cancel',
        heightAuto: false,
        buttonsStyling: false,
        customClass: {
            popup: 'm-0 w-[95vw] max-w-lg p-3 sm:p-4 !rounded-2xl',
            confirmButton: 'inline-flex items-center px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium cursor-pointer',
            cancelButton: `inline-flex items-center px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900'} text-sm font-medium ml-2 cursor-pointer`
        },
        preConfirm: () => submitConjugalVisitRequest(state)
    });
    
    if (result.isConfirmed && result.value) {
        await showSuccessMessage(result.value);
    }
}

/**
 * Submit conjugal visit request
 */
async function submitConjugalVisitRequest(state) {
    const duration = document.getElementById('conjugal-duration')?.value;
    
    if (!duration) {
        window.Swal.showValidationMessage('Please select a duration');
        return false;
    }
    
    try {
        const response = await fetch('/api/conjugal-visits/request-visit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify({
                conjugal_visit_id: state.conjugalVisitId,
                visitor_id: state.visitorId,
                inmate_id: state.inmateId,
                schedule: state.selectedDate + 'T09:00:00',
                duration_minutes: parseInt(duration)
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to submit request');
        }
        
        if (window.Swal) {
            const isDark = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
            await window.Swal.fire({
                icon: 'success',
                title: `<span class="${isDark ? 'text-white' : 'text-black'}">Request submitted</span>`,
                text: 'Your conjugal visit request has been sent and is pending approval.',
                timer: 1800,
                showConfirmButton: false,
                background: isDark ? '#111827' : '#FFFFFF',
                color: isDark ? '#F9FAFB' : '#111827'
            });
        }
        return data;
    } catch (error) {
        if (window.Swal) {
            const isDark = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
            await window.Swal.fire({
                icon: 'error',
                title: `<span class="${isDark ? 'text-white' : 'text-black'}">Error</span>`,
                text: error.message || 'Failed to submit the request.'
            });
        }
        return false;
    }
}

/**
 * Show success message
 */
async function showSuccessMessage(data) {
    const isDarkMode = window.ThemeManager ? window.ThemeManager.isDarkMode() : false;
    
    await window.Swal.fire({
        title: `<span class="${isDarkMode ? 'text-white' : 'text-black'}">Request Submitted!</span>`,
        html: `
            <p class="text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3">Your conjugal visit request has been submitted successfully.</p>
            <div class="p-3 ${isDarkMode ? 'bg-pink-600/10 border-pink-500/30' : 'bg-pink-50 border-pink-200'} border rounded-lg">
                <p class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1">Reference Number:</p>
                <p class="text-lg font-bold ${isDarkMode ? 'text-pink-400' : 'text-pink-600'} font-mono">${data.reference_number}</p>
            </div>
            <p class="text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-3">Please save this reference number and bring ₱50.00 cash payment.</p>
        `,
        icon: 'success',
        confirmButtonText: 'OK',
        background: isDarkMode ? '#111827' : '#FFFFFF',
        color: isDarkMode ? '#F9FAFB' : '#111827',
        confirmButtonColor: '#10B981'
    });
    
    setTimeout(() => window.location.reload(), 500);
}
