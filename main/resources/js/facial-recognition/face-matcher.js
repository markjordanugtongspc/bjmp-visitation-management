/**
 * Face Matcher Module
 * Handles matching detected faces against registered visitors and backend integration
 */

import Swal from 'sweetalert2';
import { faceapi } from './faceapi-loader.js';

class FaceMatcher {
    constructor(app) {
        this.app = app; // Reference to main app for stopping camera
        this.registeredVisitors = [];
        this.visitorDescriptors = new Map(); // Cache of pre-loaded descriptors
        this.currentLogId = null;
        this.lastMatchResult = null; // Store last matched visitor
        this.confidenceThreshold = 0.60; // 60% confidence threshold (lower = stricter matching)
        this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        this.isProcessing = false; // Prevent concurrent processing
        this.descriptorsLoaded = false;
        
        // Scanning and capture settings
        this.scanningStartTime = null;
        this.scanDuration = 4000; // 4 seconds scanning period
        this.capturedDescriptors = []; // Store multiple descriptors during scanning
        this.isScanning = false;
    }

    /**
     * Initialize the face matcher by loading registered visitors
     */
    async initialize() {
        try {
            const response = await fetch('/facial-recognition/registered-faces', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load registered visitors');
            }

            const data = await response.json();
            this.registeredVisitors = data.visitors || [];
            
            console.log(`Loaded ${this.registeredVisitors.length} registered visitors`);
            
            // Pre-load all visitor face descriptors for faster matching
            await this.preloadVisitorDescriptors();
            
            return true;
        } catch (error) {
            console.error('Error loading registered visitors:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Initialization Error',
                text: 'Failed to load registered visitor data. Please refresh the page.',
                background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937',
            });
            return false;
        }
    }

    /**
     * Pre-load all visitor face descriptors for faster matching
     */
    async preloadVisitorDescriptors() {
        console.log('Pre-loading visitor face descriptors...');
        let loadedCount = 0;
        
        for (const visitor of this.registeredVisitors) {
            if (!visitor.avatar_url) continue;

            try {
                // Load visitor image and extract descriptor
                const img = await faceapi.fetchImage(visitor.avatar_url);
                const detection = await faceapi
                    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (detection && detection.descriptor) {
                    // Store descriptor in cache
                    this.visitorDescriptors.set(visitor.id, {
                        descriptor: detection.descriptor,
                        visitor: visitor
                    });
                    loadedCount++;
                }
            } catch (error) {
                console.warn(`Failed to load descriptor for visitor ${visitor.id}:`, error);
            }
        }
        
        this.descriptorsLoaded = true;
        console.log(`✓ Pre-loaded ${loadedCount} visitor face descriptors`);
    }

    /**
     * Log face detection to backend
     */
    async logDetection(faceData) {
        try {
            // Validate descriptor exists
            if (!faceData.descriptor) {
                console.warn('Face descriptor is missing, skipping detection log');
                return null;
            }

            const response = await fetch('/facial-recognition/match-face', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    face_descriptor: Array.from(faceData.descriptor),
                    detected_age: faceData.age,
                    detected_gender: faceData.gender,
                    landmarks_count: faceData.landmarksCount || 68,
                    detection_metadata: {
                        expressions: faceData.expressions,
                        detection_confidence: faceData.detectionConfidence,
                    },
                    confidence_threshold: this.confidenceThreshold,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Backend validation error:', errorData);
                throw new Error(errorData.message || 'Failed to log detection');
            }

            const data = await response.json();
            this.currentLogId = data.log_id;
            return data;
        } catch (error) {
            console.error('Error logging detection:', error);
            return null;
        }
    }

    /**
     * Match detected face against registered visitors using cached descriptors
     * This runs client-side using face-api.js for performance
     */
    async matchAgainstRegistered(detectedDescriptor) {
        if (!detectedDescriptor) {
            console.warn('Detected descriptor is missing, cannot match');
            return null;
        }

        if (!this.descriptorsLoaded || this.visitorDescriptors.size === 0) {
            console.warn('Visitor descriptors not loaded yet');
            return null;
        }

        let bestMatch = null;
        let bestDistance = this.confidenceThreshold;

        // Compare against cached descriptors (much faster!)
        for (const [visitorId, cachedData] of this.visitorDescriptors.entries()) {
            try {
                // Calculate Euclidean distance between descriptors
                const distance = faceapi.euclideanDistance(detectedDescriptor, cachedData.descriptor);
                
                // Update best match if this is better (lower distance = better match)
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = {
                        visitor: cachedData.visitor,
                        distance: distance,
                        confidence: 1 - distance,
                        similarity: Math.round((1 - distance) * 100),
                    };
                }
            } catch (error) {
                console.warn(`Failed to compare with visitor ${visitorId}:`, error);
            }
        }

        // Log match result for debugging
        if (bestMatch) {
            console.log(`✓ Face matched: ${bestMatch.visitor.name} (${bestMatch.similarity}% similarity, distance: ${bestMatch.distance.toFixed(3)})`);
        } else {
            console.log('✗ No matching face found in database');
        }

        return bestMatch;
    }

    /**
     * Confirm match with backend
     */
    async confirmMatch(visitorId, confidence) {
        if (!this.currentLogId) {
            console.error('No current log ID available');
            return null;
        }

        try {
            const response = await fetch('/facial-recognition/confirm-match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    log_id: this.currentLogId,
                    visitor_id: visitorId,
                    match_confidence: confidence,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to confirm match');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error confirming match:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Match Confirmation Failed',
                text: 'Unable to confirm face match. Please try again.',
                background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937',
            });
            return null;
        }
    }

    /**
     * Show visitation request form after successful match
     */
    async showVisitationRequestForm(matchData) {
        const isDark = document.documentElement.classList.contains('dark');
        const isMobile = window.innerWidth < 640;
        
        // Build inmate options HTML
        const inmateOptions = matchData.visitor.allowed_inmates.map(inmate => 
            `<option value="${inmate.id}">${inmate.name} - ${inmate.cell_location}</option>`
        ).join('');

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        const { value: formValues } = await Swal.fire({
            title: `Welcome, ${matchData.visitor.name}!`,
            html: `
                <div class="w-full max-w-lg mx-auto text-left space-y-5">
                    <div class="rounded-lg border ${isDark ? 'border-green-500/30 bg-green-900/20' : 'border-green-100 bg-green-50'} p-4 sm:p-5">
                        <div class="flex items-start gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-full ${isDark ? 'bg-green-800/70 text-green-200' : 'bg-green-100 text-green-600'}">
                                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p class="${isDark ? 'text-green-200' : 'text-green-700'} text-sm sm:text-base font-semibold">Visitor verified</p>
                                <p class="${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs sm:text-sm mt-1">Match confidence: ${matchData.similarity}%</p>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="sm-сol-span-2 space-y-2">
                            <label class="block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}">
                                Select Inmate to Visit
                            </label>
                            <input
                                id="swal-inmate-filter"
                                type="text"
                                placeholder="Search by inmate name..."
                                class="w-full rounded-lg border ${isDark ? 'border-gray-600 bg-gray-800 text-gray-800 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"/>
                            <select
                                id="swal-inmate"
                                class="w-full rounded-lg border ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} px-3 sm:px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer">
                                <option value="">Choose an inmate...</option>
                                ${inmateOptions}
                            </select>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}">
                                Visit Date
                            </label>
                            <input
                                type="date"
                                id="swal-date"
                                min="${today}"
                                value="${today}"
                                class="w-full rounded-lg border ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} px-3 sm:px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                required
                            />
                        </div>

                        <div class="space-y-2">
                            <label class="block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}">
                                Visit Time
                            </label>
                            <input
                                type="time"
                                id="swal-time"
                                class="w-full rounded-lg border ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} px-3 sm:px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                required
                            />
                        </div>

                        <div class="space-y-2">
                            <label class="block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}">
                                Duration (minutes)
                            </label>
                            <select
                                id="swal-duration"
                                class="w-full rounded-lg border ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} px-3 sm:px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                <option value="30" selected>30 minutes</option>
                                <option value="45">45 minutes</option>
                                <option value="60">60 minutes</option>
                            </select>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label class="block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}">
                            Notes (Optional)
                        </label>
                        <textarea
                            id="swal-notes"
                            rows="3"
                            placeholder="Any special notes or requirements..."
                            class="w-full rounded-lg border ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} px-3 sm:px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-y min-h-[96px] sm:min-h-[120px]"></textarea>
                    </div>
                </div>
            `,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCancelButton: true,
            confirmButtonText: 'Submit Request',
            cancelButtonText: 'Cancel',
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f9fafb' : '#111827',
            width: isMobile ? '95%' : '36rem',
            padding: isMobile ? '1rem' : '1.5rem',
            customClass: {
                popup: `${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl`,
                title: `${isDark ? 'text-white' : 'text-gray-900'} text-base sm:text-lg font-semibold mb-2`,
                htmlContainer: `${isDark ? 'text-gray-300' : 'text-gray-700'} !px-0`,
                confirmButton: 'px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white cursor-pointer',
                cancelButton: `${isDark ? 'px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 text-gray-200 ml-2' : 'px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg transition-colors bg-gray-200 hover:bg-gray-300 text-gray-800 ml-2'}`,
                actions: 'mt-4 sm:mt-5 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end',
            },
            didOpen: () => {
                const data = Array.isArray(matchData?.visitor?.allowed_inmates) ? matchData.visitor.allowed_inmates : [];
                const filterInput = document.getElementById('swal-inmate-filter');
                const selectEl = document.getElementById('swal-inmate');
                const renderList = (q) => {
                    const term = (q || '').toString().trim().toLowerCase();
                    const list = term ? data.filter(d => (d.name || '').toLowerCase().includes(term)) : data;
                    const options = ['<option value="">Choose an inmate...</option>']
                        .concat(list.map(v => `<option value="${String(v.id)}">${(v.name || '')} - ${(v.cell_location || '')}</option>`));
                    if (selectEl) {
                        selectEl.innerHTML = options.join('');
                    }
                };
                renderList('');
                if (filterInput) {
                    filterInput.addEventListener('input', (e) => {
                        renderList(e.target.value);
                    });
                }

                // If user types and presses Enter, auto-select first match
                if (filterInput && selectEl) {
                    filterInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            const opts = Array.from(selectEl.options).filter(o => o.value);
                            if (opts.length === 1) {
                                selectEl.value = opts[0].value;
                            }
                        }
                    });
                }
            },
            buttonsStyling: false,
            focusConfirm: false,
            preConfirm: () => {
                let inmateId = (document.getElementById('swal-inmate') || {}).value || '';
                const sel = document.getElementById('swal-inmate');
                const filterInput = document.getElementById('swal-inmate-filter');
                // If not explicitly selected, but filter yields a single option, pick it
                if (!inmateId && sel && sel.options && sel.options.length === 2) {
                    inmateId = sel.options[1].value;
                }
                const visitDate = document.getElementById('swal-date').value;
                const visitTime = document.getElementById('swal-time').value;
                const duration = document.getElementById('swal-duration').value;
                const notes = document.getElementById('swal-notes').value;

                if (!inmateId) {
                    Swal.showValidationMessage('Please select an inmate');
                    return false;
                }
                if (!visitDate) {
                    Swal.showValidationMessage('Please select a visit date');
                    return false;
                }
                if (!visitTime) {
                    Swal.showValidationMessage('Please select a visit time');
                    return false;
                }

                return {
                    inmateId,
                    visitDate,
                    visitTime,
                    duration: parseInt(duration),
                    notes,
                };
            },
        });

        if (formValues) {
            await this.createVisitationRequest(matchData.visitor.id, formValues);
        } else {
            // User cancelled - stop camera and reload page
            if (this.app && this.app.stopDetection) {
                this.app.stopDetection();
            }
            window.location.reload();
        }
    }

    /**
     * Create visitation request in backend
     */
    async createVisitationRequest(visitorId, formData) {
        const isDark = document.documentElement.classList.contains('dark');
        const isMobile = window.innerWidth < 640;

        try {
            const response = await fetch('/facial-recognition/create-visitation-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    log_id: this.currentLogId,
                    visitor_id: visitorId,
                    inmate_id: formData.inmateId,
                    visit_date: formData.visitDate,
                    visit_time: formData.visitTime,
                    duration_minutes: formData.duration,
                    notes: formData.notes,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create visitation request');
            }

            await Swal.fire({
                icon: 'success',
                title: `<span class="${isDark ? 'text-white' : 'text-gray-900'} text-base sm:text-lg font-semibold">Request Submitted!</span>`,
                html: `
                    <div class="w-full max-w-lg mx-auto text-center">
                        <p class="${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm sm:text-base">
                            Your visitation request has been submitted successfully.
                        </p>
                        <div class="mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}">
                            <p class="text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}">
                                <strong>Visitor:</strong> ${data.visitation_request.visitor_name}<br>
                                <strong>Inmate:</strong> ${data.visitation_request.inmate_name}<br>
                                <strong>Date:</strong> ${data.visitation_request.visit_date}<br>
                                <strong>Time:</strong> ${data.visitation_request.visit_time}<br>
                                <strong>Status:</strong> <span class="inline-flex px-2 py-1 text-xs rounded-full ${isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}">Pending Approval</span>
                            </p>
                        </div>
                    </div>
                `,
                background: isDark ? '#1f2937' : '#ffffff',
                color: isDark ? '#f9fafb' : '#111827',
                width: isMobile ? '90%' : '32rem',
                padding: isMobile ? '1rem' : '1.5rem',
                customClass: {
                    popup: `${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl`,
                    title: `${isDark ? 'text-white' : 'text-gray-900'} text-base sm:text-lg font-semibold mb-2`,
                    htmlContainer: `${isDark ? 'text-gray-300' : 'text-gray-700'} !px-0`,
                    confirmButton: 'px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white cursor-pointer',
                    actions: 'mt-4 sm:mt-5',
                },
                buttonsStyling: false,
            });

            // Stop camera before reload
            if (this.app && this.app.stopDetection) {
                this.app.stopDetection();
            }

            // Reset for next detection
            this.currentLogId = null;
            
            // Reload the entire page
            window.location.reload();
            
            return data;
        } catch (error) {
            console.error('Error creating visitation request:', error);
            await Swal.fire({
                icon: 'error',
                title: `<span class="${isDark ? 'text-white' : 'text-gray-900'} text-base sm:text-lg font-semibold">Request Failed</span>`,
                html: `<div class="w-full max-w-lg mx-auto text-left ${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm sm:text-base">${String(error.message || 'Failed to create visitation request. Please try again.')}</div>`,
                confirmButtonText: 'OK',
                background: isDark ? '#1f2937' : '#ffffff',
                color: isDark ? '#f9fafb' : '#111827',
                width: isMobile ? '90%' : '32rem',
                padding: isMobile ? '1rem' : '1.5rem',
                customClass: {
                    popup: `${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl`,
                    title: `${isDark ? 'text-white' : 'text-gray-900'} mb-3 sm:mb-4`,
                    htmlContainer: `${isDark ? 'text-gray-300' : 'text-gray-700'} !px-0`,
                    confirmButton: 'px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg transition-colors bg-red-600 hover:bg-red-700 text-white cursor-pointer',
                },
                buttonsStyling: false,
            });
            return null;
        }
    }

    /**
     * Handle complete face recognition flow with scanning period
     */
    async handleFaceDetection(faceData) {
        // Prevent concurrent processing
        if (this.isProcessing) {
            return null;
        }

        // Start scanning period on first detection
        if (!this.isScanning && !this.scanningStartTime) {
            this.startScanning();
        }

        // Collect descriptors during scanning period
        if (this.isScanning && faceData.descriptor) {
            this.capturedDescriptors.push(faceData.descriptor);
            
            // Calculate elapsed time
            const elapsed = Date.now() - this.scanningStartTime;
            const remaining = Math.ceil((this.scanDuration - elapsed) / 1000);
            
            // Update status with countdown
            if (this.app && this.app.updateStatus) {
                this.app.updateStatus(`Scanning face... ${remaining}s remaining`, 'info');
            }
            
            // Check if scanning period is complete
            if (elapsed >= this.scanDuration) {
                await this.completeScanning();
            }
        }

        return null;
    }

    /**
     * Start the scanning period
     */
    startScanning() {
        this.isScanning = true;
        this.scanningStartTime = Date.now();
        this.capturedDescriptors = [];
        
        console.log('🔍 Started face scanning (4 seconds)...');
        
        if (this.app && this.app.updateStatus) {
            this.app.updateStatus('Scanning face... Please hold still', 'info');
        }

        // Trigger UI update to show scanning status
        if (this.app && this.app.displayResults) {
            this.app.displayResults([]);
        }
    }

    /**
     * Complete scanning and process the captured face
     */
    async completeScanning() {
        this.isScanning = false;
        this.isProcessing = true;

        try {
            // Stop the camera
            if (this.app && this.app.stopDetection) {
                this.app.stopDetection();
                this.app.updateStatus('Processing captured face...', 'info');
            }

            console.log(`✓ Captured ${this.capturedDescriptors.length} face samples`);

            // Check if we have enough samples
            if (this.capturedDescriptors.length === 0) {
                await this.showNoFaceDetectedError();
                this.resetScanning();
                return null;
            }

            // Calculate average descriptor from all captured samples
            const avgDescriptor = this.calculateAverageDescriptor(this.capturedDescriptors);

            // Log the detection
            await this.logDetection({
                descriptor: avgDescriptor,
                age: null,
                gender: 'unknown',
                landmarksCount: 68,
                expressions: {},
                detectionConfidence: 1.0,
            });

            // Update status and UI
            if (this.app && this.app.updateStatus) {
                this.app.updateStatus('Analyzing face...', 'info');
            }

            // Trigger UI update to show processing status
            if (this.app && this.app.displayResults) {
                this.app.displayResults([]);
            }

            // Match against registered visitors
            const matchResult = await this.matchAgainstRegistered(avgDescriptor);

            if (!matchResult) {
                // No match found
                this.lastMatchResult = { name: 'Not Registered', matched: false };
                
                // Update UI to show no match
                if (this.app && this.app.displayResults) {
                    this.app.displayResults([]);
                }
                
                await this.showNoMatchResult();
                this.resetScanning();
                return null;
            }

            // Match found!
            this.lastMatchResult = {
                name: matchResult.visitor.name,
                matched: true,
                visitor: matchResult.visitor,
                similarity: matchResult.similarity,
            };

            // Update UI to show match success
            if (this.app && this.app.displayResults) {
                this.app.displayResults([]);
            }

            // Confirm match with backend
            const confirmData = await this.confirmMatch(matchResult.visitor.id, matchResult.confidence);

            if (!confirmData) {
                this.resetScanning();
                return null;
            }

            // Show success and visitation request form
            await this.showMatchResult(confirmData, matchResult);
            
            this.resetScanning();
            return confirmData;

        } catch (error) {
            console.error('Error in face scanning flow:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Processing Error',
                text: 'An error occurred while processing your face. Please try again.',
                background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#1f2937',
            });
            this.resetScanning();
            return null;
        }
    }

    /**
     * Calculate average descriptor from multiple samples for better accuracy
     */
    calculateAverageDescriptor(descriptors) {
        if (descriptors.length === 0) return null;
        if (descriptors.length === 1) return descriptors[0];

        // Create array to hold sum of each dimension
        const descriptorLength = descriptors[0].length;
        const sum = new Float32Array(descriptorLength);

        // Sum all descriptors
        for (const descriptor of descriptors) {
            for (let i = 0; i < descriptorLength; i++) {
                sum[i] += descriptor[i];
            }
        }

        // Calculate average
        for (let i = 0; i < descriptorLength; i++) {
            sum[i] /= descriptors.length;
        }

        return sum;
    }

    /**
     * Show no face detected error
     */
    async showNoFaceDetectedError() {
        const isDark = document.documentElement.classList.contains('dark');
        await Swal.fire({
            icon: 'error',
            title: `<span class="${isDark ? 'text-white' : 'text-gray-900'} text-base sm:text-lg font-semibold">No Face Detected</span>`,
            html: `<div class="w-full max-w-120 mx-auto text-left ${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm sm:text-base">Could not capture your face clearly. Please ensure your face is visible and try again.</div>`,
            confirmButtonText: 'OK',
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f9fafb' : '#111827',
            width: '90%',
            padding: '1rem',
            customClass: {
                popup: `${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl`,
                title: `${isDark ? 'text-white' : 'text-gray-900'} mb-3`,
                htmlContainer: `${isDark ? 'text-gray-300' : 'text-gray-700'} !px-0`,
                confirmButton: 'px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg transition-colors bg-red-600 hover:bg-red-700 text-white cursor-pointer',
            },
            buttonsStyling: false,
        });
    }

    /**
     * Show no match result
     */
    async showNoMatchResult() {
        const isDark = document.documentElement.classList.contains('dark');
        await Swal.fire({
            icon: 'warning',
            title: `<span class="${isDark ? 'text-white' : 'text-gray-900'} text-base sm:text-lg font-semibold">No Match Found</span>`,
            html: `<div class="w-full max-w-lg mx-auto text-left ${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm sm:text-base">Your face does not match any registered visitor in our database. Please register as a visitor first.</div>`,
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f9fafb' : '#111827',
            width: '90%',
            padding: '1rem',
            confirmButtonText: 'OK',
            customClass: {
                popup: `${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl`,
                title: `${isDark ? 'text-white' : 'text-gray-900'} mb-3`,
                htmlContainer: `${isDark ? 'text-gray-300' : 'text-gray-700'} !px-0`,
                confirmButton: 'px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg transition-colors bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer',
            },
            buttonsStyling: false,
        });
    }

    /**
     * Show match result and visitation request form
     */
    async showMatchResult(confirmData, matchResult) {
        const isDark = document.documentElement.classList.contains('dark');
        const isMobile = window.innerWidth < 640;
        const visitorName = confirmData?.visitor?.name ?? confirmData?.name ?? 'Visitor';
        const similarityValue = matchResult?.similarity;
        const formattedSimilarity = typeof similarityValue === 'number'
            ? `${similarityValue.toFixed(1).replace(/\.0$/, '')}%`
            : (similarityValue ?? '—');
        const confidenceValue = matchResult?.confidence;
        let formattedConfidence = null;
        if (typeof confidenceValue === 'number') {
            formattedConfidence = confidenceValue > 1
                ? `${confidenceValue.toFixed(1).replace(/\.0$/, '')}%`
                : `${Math.round(confidenceValue * 100)}%`;
        }

        await Swal.fire({
            icon: 'success',
            title: `<span class="${isDark ? 'text-white' : 'text-gray-900'} text-base sm:text-lg font-semibold">Face Matched!</span>` ,
            html: `
                <div class="w-full ${isMobile ? '' : 'max-w-md'} mx-auto text-left space-y-4">
                    <div class="rounded-lg border ${isDark ? 'border-emerald-500/30 bg-emerald-900/20' : 'border-emerald-100 bg-emerald-50'} p-4 sm:p-5">
                        <div class="flex items-start gap-3">
                            <div class="flex h-10 w-10 items-center justify-center rounded-full ${isDark ? 'bg-emerald-800/60 text-emerald-200' : 'bg-emerald-100 text-emerald-600'}">
                                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm sm:text-base font-semibold ${isDark ? 'text-emerald-200' : 'text-emerald-700'}">Identity confirmed</p>
                                <p class="text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1">You can now proceed with the visitation request.</p>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="rounded-lg border ${isDark ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-gray-50'} p-3">
                            <p class="text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide">Visitor</p>
                            <p class="mt-1 text-sm sm:text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}">${visitorName}</p>
                        </div>
                        <div class="rounded-lg border ${isDark ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-gray-50'} p-3">
                            <p class="text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide">Match Accuracy</p>
                            <p class="mt-1 text-sm sm:text-base font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-600'}">${formattedSimilarity}</p>
                        </div>
                        ${formattedConfidence ? `
                            <div class="rounded-lg border ${isDark ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-gray-50'} p-3 sm:col-span-2">
                                <p class="text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide">Model Confidence</p>
                                <p class="mt-1 text-sm sm:text-base font-semibold ${isDark ? 'text-blue-300' : 'text-blue-600'}">${formattedConfidence}</p>
                            </div>
                        ` : ''}
                    </div>

                    <p class="text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}">Review the details, then continue to submit your visitation request.</p>
                </div>
            `,
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f9fafb' : '#111827',
            width: isMobile ? '92%' : '30rem',
            padding: isMobile ? '1rem' : '1.25rem',
            confirmButtonText: 'Proceed',
            customClass: {
                popup: `${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl`,
                title: `${isDark ? 'text-white' : 'text-gray-900'} text-base sm:text-lg font-semibold`,
                htmlContainer: `${isDark ? 'text-gray-300' : 'text-gray-700'} !px-0`,
                confirmButton: 'px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg transition-colors bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer',
            },
            buttonsStyling: false,
        });

        // Show visitation request form
        await this.showVisitationRequestForm({
            visitor: confirmData.visitor,
            similarity: matchResult.similarity,
            confidence: matchResult.confidence,
        });
    }

    /**
     * Reset scanning state
     */
    resetScanning() {
        this.isScanning = false;
        this.isProcessing = false;
        this.scanningStartTime = null;
        this.capturedDescriptors = [];
        
        // Restart camera
        if (this.app && this.app.startDetection) {
            setTimeout(() => {
                if (this.app.updateStatus) {
                    this.app.updateStatus('Ready to scan - Face matching enabled', 'success');
                }
            }, 1000);
        }
    }
}

export default FaceMatcher;
