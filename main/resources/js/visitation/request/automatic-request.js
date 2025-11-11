/**
 * Automatic Visitation Request with Facial Recognition
 * Integrates facial recognition for automatic visitor identification and request submission
 */

import { getSelectedDate } from '../calendar-handler.js';
import { faceapi, faceAPILoader } from '../../facial-recognition/faceapi-loader.js';
import Swal from 'sweetalert2';

// Face-api.js detection instance
let faceDetectionStream = null;
let faceDetectionInterval = null;
let videoElement = null;
let canvasElement = null;
let isDetecting = false;
let registeredVisitors = [];
let visitorDescriptors = new Map(); // Cache of pre-loaded descriptors
let currentLogId = null;
const confidenceThreshold = 0.60; // 60% threshold

/**
 * Show Automatic Request Modal with Facial Recognition
 */
export async function showAutomaticRequestModal() {
    const isDark = document.documentElement.classList.contains('dark');
    const selectedDate = getSelectedDate();
    
    if (!selectedDate) {
        await Swal.fire({
            icon: 'warning',
            title: 'No Date Selected',
            text: 'Please select a date from the calendar first.',
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f9fafb' : '#1f2937',
        });
        return;
    }

    const { value: confirmed } = await Swal.fire({
        title: '<span class="text-lg sm:text-xl font-bold">Automatic Visitation Request</span>',
        html: `
            <div class="text-left space-y-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                        </svg>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-blue-900 dark:text-blue-200">Selected Date</p>
                            <p class="text-base font-bold text-blue-700 dark:text-blue-300 mt-1">${formatDate(selectedDate)}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        This feature uses facial recognition to automatically identify registered visitors.
                    </p>
                    <ul class="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li class="flex items-start gap-2">
                            <svg class="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                            <span>Camera will activate for face detection</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <svg class="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                            <span>System will match face with registered visitors</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <svg class="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                            <span>Request will be created automatically</span>
                        </li>
                    </ul>
                </div>
            </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Start Camera',
        cancelButtonText: 'Cancel',
        background: isDark ? '#1f2937' : '#ffffff',
        color: isDark ? '#f9fafb' : '#1f2937',
        customClass: {
            popup: 'rounded-xl shadow-2xl',
            confirmButton: 'px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer',
            cancelButton: 'px-6 py-2.5 text-sm font-medium rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 cursor-pointer',
        },
        buttonsStyling: false,
    });

    if (confirmed) {
        await showFacialRecognitionModal(selectedDate);
    }
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

/**
 * Show Facial Recognition Camera Modal
 */
async function showFacialRecognitionModal(selectedDate) {
    const isDark = document.documentElement.classList.contains('dark');
    const isMobile = window.innerWidth < 640;

    Swal.fire({
        title: '<span class="text-lg sm:text-xl font-bold">Facial Recognition</span>',
        html: `
            <div class="w-full space-y-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p class="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Selected Date</p>
                    <p class="text-sm font-bold text-blue-900 dark:text-blue-200 mt-1">${formatDate(selectedDate)}</p>
                </div>
                <div class="relative bg-gray-900 rounded-lg overflow-hidden" style="aspect-ratio: 4/3;">
                    <video id="auto-request-video" autoplay playsinline class="w-full h-full object-cover" style="transform: scaleX(-1);"></video>
                    <canvas id="auto-request-canvas" class="absolute top-0 left-0 w-full h-full" style="transform: scaleX(-1);"></canvas>
                    <div id="detection-status" class="absolute top-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm font-medium">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            <span>Initializing camera...</span>
                        </div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button id="start-detection-btn" class="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        <span class="flex items-center justify-center gap-2">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/></svg>
                            Start Detection
                        </span>
                    </button>
                    <button id="stop-detection-btn" class="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        <span class="flex items-center justify-center gap-2">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd"/></svg>
                            Stop Detection
                        </span>
                    </button>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        <strong class="text-gray-900 dark:text-gray-200">Instructions:</strong> Position your face in front of the camera.
                    </p>
                </div>
            </div>
        `,
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: 'Close',
        background: isDark ? '#1f2937' : '#ffffff',
        color: isDark ? '#f9fafb' : '#1f2937',
        width: isMobile ? '95%' : '42rem',
        padding: isMobile ? '1rem' : '1.5rem',
        customClass: {
            popup: 'rounded-xl shadow-2xl',
            htmlContainer: '!px-0',
            cancelButton: 'px-6 py-2.5 text-sm font-medium rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 cursor-pointer',
        },
        buttonsStyling: false,
        allowOutsideClick: false,
        didOpen: async () => {
            await initializeFacialRecognition(selectedDate);
        },
        willClose: () => {
            stopFacialRecognition();
        }
    });
}

/**
 * Initialize Facial Recognition
 */
async function initializeFacialRecognition(selectedDate) {
    videoElement = document.getElementById('auto-request-video');
    canvasElement = document.getElementById('auto-request-canvas');
    const startBtn = document.getElementById('start-detection-btn');
    const stopBtn = document.getElementById('stop-detection-btn');
    const isDark = document.documentElement.classList.contains('dark');

    try {
        // Load face-api.js models
        updateStatus('Loading face detection models...', 'yellow');
        await faceAPILoader.initializeBackend();
        await faceAPILoader.loadModels('/models');

        // Load registered visitors
        updateStatus('Loading registered visitors...', 'yellow');
        try {
            const loaded = await loadRegisteredVisitors();
            if (!loaded || registeredVisitors.length === 0) {
                throw new Error('No registered visitors found. Please contact administrator to register your face in the system.');
            }
        } catch (loadError) {
            // Handle loading error with user-friendly message
            const errorMessage = loadError.message || 'Unable to load registered visitors. Please try again or use manual request instead.';
            
            await Swal.fire({
                icon: 'warning',
                title: 'Unable to Load Visitor Data',
                html: `
                    <div class="text-left space-y-3">
                        <p class="text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}">${errorMessage}</p>
                        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
                            <p class="text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'} font-medium mb-2">What you can do:</p>
                            <ul class="text-xs ${isDark ? 'text-blue-200' : 'text-blue-600'} space-y-1 list-disc list-inside">
                                <li>Use the "Manual Request" option instead</li>
                                <li>Contact the facility administrator to register your face</li>
                                <li>Try again later if this is a temporary issue</li>
                            </ul>
                        </div>
                    </div>
                `,
                background: isDark ? '#1f2937' : '#ffffff',
                color: isDark ? '#f9fafb' : '#1f2937',
                confirmButtonText: 'Close',
                customClass: {
                    popup: 'rounded-xl shadow-2xl',
                    confirmButton: 'px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer',
                },
                buttonsStyling: false,
            });
            
            // Close the modal
            Swal.close();
            return;
        }

        // Start camera
        updateStatus('Starting camera...', 'yellow');
        try {
            faceDetectionStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 }, 
                    facingMode: 'user' 
                }
            });
            videoElement.srcObject = faceDetectionStream;
            await new Promise((resolve) => { 
                videoElement.onloadedmetadata = () => resolve(); 
            });
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            updateStatus('Camera ready - Click "Start Detection"', 'green');
            startBtn.disabled = false;
            startBtn.addEventListener('click', () => startDetection(selectedDate));
            stopBtn.addEventListener('click', () => stopDetection());
        } catch (cameraError) {
            throw new Error('Camera access denied or unavailable. Please allow camera access and try again.');
        }
    } catch (error) {
        // Security: Generic error handling - don't expose sensitive data
        updateStatus('Error: ' + error.message, 'red');
        
        await Swal.fire({
            icon: 'error',
            title: 'Initialization Error',
            html: `
                <div class="text-left space-y-3">
                    <p class="text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}">${error.message || 'Unable to initialize facial recognition. Please try again.'}</p>
                    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-4 border border-gray-200 dark:border-gray-700">
                        <p class="text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}">Tip: You can use the "Manual Request" option if facial recognition is not available.</p>
                    </div>
                </div>
            `,
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f9fafb' : '#1f2937',
            confirmButtonText: 'Close',
            customClass: {
                popup: 'rounded-xl shadow-2xl',
                confirmButton: 'px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer',
            },
            buttonsStyling: false,
        });
    }
}

function startDetection(selectedDate) {
    if (isDetecting) return;
    isDetecting = true;
    document.getElementById('start-detection-btn').disabled = true;
    document.getElementById('stop-detection-btn').disabled = false;
    updateStatus('Detecting faces...', 'blue');
    faceDetectionInterval = setInterval(() => detectFace(selectedDate), 100);
}

function stopDetection() {
    if (!isDetecting) return;
    isDetecting = false;
    document.getElementById('start-detection-btn').disabled = false;
    document.getElementById('stop-detection-btn').disabled = true;
    if (faceDetectionInterval) clearInterval(faceDetectionInterval);
    const ctx = canvasElement.getContext('2d');
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    updateStatus('Detection stopped', 'yellow');
}

function stopFacialRecognition() {
    if (faceDetectionStream) {
        faceDetectionStream.getTracks().forEach(track => track.stop());
        faceDetectionStream = null;
    }
    if (faceDetectionInterval) {
        clearInterval(faceDetectionInterval);
        faceDetectionInterval = null;
    }
    isDetecting = false;
}

function updateStatus(message, color) {
    const statusEl = document.getElementById('detection-status');
    if (!statusEl) return;
    const colors = {
        yellow: 'bg-yellow-400',
        green: 'bg-green-400',
        red: 'bg-red-400',
        blue: 'bg-blue-400'
    };
    statusEl.innerHTML = `
        <div class="flex items-center gap-2">
            <div class="w-2 h-2 ${colors[color] || 'bg-gray-400'} rounded-full animate-pulse"></div>
            <span>${message}</span>
        </div>
    `;
}

/**
 * Detect and match faces
 */
async function detectFace(selectedDate) {
    if (!videoElement || !canvasElement || !isDetecting) return;

    try {
        const detections = await faceapi
            .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptors();

        // Clear canvas
        const ctx = canvasElement.getContext('2d');
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        if (detections.length > 0) {
            // Draw detections on canvas
            const displaySize = { width: videoElement.videoWidth, height: videoElement.videoHeight };
            faceapi.matchDimensions(canvasElement, displaySize);
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            faceapi.draw.drawDetections(canvasElement, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvasElement, resizedDetections);

            // Get the first detected face descriptor
            const descriptor = detections[0].descriptor;

            // Match against registered visitors
            const matchResult = await matchFaceWithVisitors(descriptor);

            if (matchResult && matchResult.matched) {
                // Stop detection
                stopDetection();
                updateStatus(`Match found: ${matchResult.visitor.name} (${matchResult.similarity}%)`, 'green');

                // Log detection to backend
                await logDetection(descriptor, matchResult);

                // Close camera modal
                Swal.close();

                // Show visitation request form
                await showVisitationRequestForm(matchResult, selectedDate);
            } else {
                updateStatus('Face detected - No match found', 'yellow');
            }
        } else {
            updateStatus('No face detected - Please face the camera', 'yellow');
        }
    } catch (error) {
        // Security: Generic error message for public-facing features
        updateStatus('Detection error occurred', 'red');
    }
}

/**
 * Match face descriptor against registered visitors using cached descriptors
 */
async function matchFaceWithVisitors(descriptor) {
    try {
        if (!descriptor || visitorDescriptors.size === 0) {
            return null;
        }

        let bestMatch = null;
        let bestDistance = confidenceThreshold;

        // Compare against cached descriptors from avatar images
        for (const [visitorId, cachedData] of visitorDescriptors.entries()) {
            try {
                // Calculate Euclidean distance between descriptors
                const distance = faceapi.euclideanDistance(descriptor, cachedData.descriptor);
                
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
                // Silent error handling for security
                continue;
            }
        }

        // Return match result without logging sensitive data
        if (bestMatch) {
            return {
                matched: true,
                visitor: bestMatch.visitor,
                confidence: Math.round(bestMatch.confidence * 100),
                similarity: bestMatch.similarity,
            };
        }

        return null;
    } catch (error) {
        // Security: No error logging for public-facing features
        return null;
    }
}

/**
 * Log detection to backend using match-face endpoint (Public)
 */
async function logDetection(descriptor, matchResult) {
    try {
        // Use public endpoint for visitor facial recognition
        const response = await fetch('/visitor/facial-recognition/match-face', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                face_descriptor: Array.from(descriptor),
                detected_age: null,
                detected_gender: 'unknown',
                landmarks_count: 68,
                detection_metadata: {},
                confidence_threshold: confidenceThreshold,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.log_id) {
                currentLogId = data.log_id;
                
                // Confirm match with backend
                if (matchResult && matchResult.visitor) {
                    await confirmMatch(matchResult.visitor.id, matchResult.confidence / 100);
                }
            }
        } else {
            // Security: Generic error handling - don't expose sensitive data
        }
    } catch (error) {
        // Security: Silent error handling - don't block the flow if logging fails
        // Don't log error details that might expose sensitive information
    }
}

/**
 * Confirm match with backend (Public)
 */
async function confirmMatch(visitorId, confidence) {
    try {
        if (!currentLogId) {
            // Security: Don't log log IDs or confirmation details
            return null;
        }

        // Use public endpoint for visitor facial recognition
        const response = await fetch('/visitor/facial-recognition/confirm-match', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                log_id: currentLogId,
                visitor_id: visitorId,
                match_confidence: confidence,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                return data;
            }
        } else {
            // Security: Generic error handling - don't expose sensitive data
        }
    } catch (error) {
        // Security: Silent error handling - don't block the flow if confirmation fails
        // Don't log error details that might expose sensitive information
    }
    return null;
}

/**
 * Load registered visitors from backend (Public endpoint)
 */
async function loadRegisteredVisitors() {
    try {
        // Use public endpoint for visitor facial recognition
        const response = await fetch('/visitor/facial-recognition/registered-faces', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin', // Include cookies for CSRF protection
        });

        if (!response.ok) {
            // Handle specific error cases
            if (response.status === 401) {
                throw new Error('Authentication required. Please contact administrator.');
            } else if (response.status === 403) {
                throw new Error('Access denied. Please contact administrator.');
            } else if (response.status === 500) {
                throw new Error('Server error. Please try again later.');
            } else {
                throw new Error(`Failed to load registered visitors (${response.status})`);
            }
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to load registered visitors');
        }

        registeredVisitors = data.visitors || [];
        
        if (registeredVisitors.length === 0) {
            throw new Error('No registered visitors found. Please contact administrator to register your face.');
        }
        
        // Pre-load visitor face descriptors from avatar images
        const loadedCount = await preloadVisitorDescriptors();
        
        if (loadedCount === 0) {
            throw new Error('Unable to process registered visitor faces. Please contact administrator.');
        }
        
        return true;
    } catch (error) {
        // Security: Generic error handling - don't expose sensitive data
        // Re-throw with user-friendly message
        throw error;
    }
}

/**
 * Pre-load all visitor face descriptors from avatar images
 */
async function preloadVisitorDescriptors() {
    let loadedCount = 0;
    let errorCount = 0;
    
    for (const visitor of registeredVisitors) {
        if (!visitor.avatar_url) {
            // Security: Don't log visitor IDs or names - skip visitors without avatars
            continue;
        }

        try {
            // Load visitor avatar image and extract face descriptor
            // Use a timeout to prevent hanging on bad images
            const img = await Promise.race([
                faceapi.fetchImage(visitor.avatar_url),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Image load timeout')), 10000)
                )
            ]);
            
            const detection = await faceapi
                .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detection && detection.descriptor) {
                // Store descriptor in cache
                visitorDescriptors.set(visitor.id, {
                    descriptor: detection.descriptor,
                    visitor: visitor
                });
                loadedCount++;
            } else {
                // Security: Don't log visitor IDs or names - skip if no face detected
                errorCount++;
            }
        } catch (error) {
            // Security: Generic error handling - don't expose visitor IDs
            errorCount++;
            continue;
        }
    }
    
    // If we couldn't load any descriptors, throw an error
    if (loadedCount === 0) {
        if (errorCount > 0) {
            throw new Error('Unable to process visitor face images. Please contact administrator to verify visitor registrations.');
        } else {
            throw new Error('No valid visitor faces found. Please contact administrator.');
        }
    }
    
    // Security: Generic success logging - don't expose count details
    // Descriptors loaded successfully (logged server-side if needed)
    
    return loadedCount;
}

/**
 * Show visitation request form based on number of inmates
 */
async function showVisitationRequestForm(matchResult, selectedDate) {
    const visitor = matchResult.visitor;
    const inmates = visitor.allowed_inmates || [];

    if (inmates.length === 0) {
        await Swal.fire({
            icon: 'error',
            title: 'No Inmates Assigned',
            text: 'This visitor is not assigned to any inmates.',
            ...getThemeColors(),
        });
        return;
    }

    if (inmates.length === 1) {
        await showSingleInmateForm(visitor, inmates[0], selectedDate, matchResult.confidence);
    } else {
        await showMultipleInmatesForm(visitor, inmates, selectedDate, matchResult.confidence);
    }
}

/**
 * Show form for single inmate
 */
async function showSingleInmateForm(visitor, inmate, selectedDate, confidence) {
    const { isDark, isMobile } = getThemeSettings();

    const { value: formData } = await Swal.fire({
        title: '<span class="text-lg sm:text-xl font-bold">Visitation Request</span>',
        html: `
            <div class="w-full space-y-4 text-left">
                <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-green-900 dark:text-green-200">Visitor Verified</p>
                            <p class="text-xs text-green-700 dark:text-green-300 mt-1">Match confidence: ${confidence}%</p>
                        </div>
                    </div>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p class="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Visitor</p>
                    <p class="text-base font-bold text-blue-900 dark:text-blue-200 mt-1">${visitor.name}</p>
                    <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">ID: VIS-${String(visitor.id).padStart(6, '0')}</p>
                </div>
                <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <p class="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Visiting</p>
                    <p class="text-base font-bold text-purple-900 dark:text-purple-200 mt-1">${inmate.name}</p>
                    <p class="text-xs text-purple-700 dark:text-purple-300 mt-1">${inmate.cell_location || 'N/A'}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Visit Date</p>
                    <p class="text-base font-bold text-gray-900 dark:text-gray-200 mt-1">${formatDate(selectedDate)}</p>
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Preferred Time <span class="text-red-500">*</span>
                    </label>
                    <input type="time" id="visit-time" class="w-full px-4 py-2.5 text-sm rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Reason for Visit <span class="text-red-500">*</span>
                    </label>
                    <textarea id="visit-reason" rows="3" class="w-full px-4 py-2.5 text-sm rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Enter reason for visit..." required></textarea>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Submit Request',
        cancelButtonText: 'Cancel',
        width: isMobile ? '95%' : '36rem',
        padding: isMobile ? '1rem' : '1.5rem',
        ...getThemeColors(),
        customClass: {
            popup: 'rounded-xl shadow-2xl',
            htmlContainer: '!px-0',
            confirmButton: 'px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer',
            cancelButton: `px-6 py-2.5 text-sm font-medium rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} cursor-pointer`,
        },
        buttonsStyling: false,
        preConfirm: () => {
            const time = document.getElementById('visit-time').value;
            const reason = document.getElementById('visit-reason').value.trim();
            if (!time) {
                Swal.showValidationMessage('Please select a visit time');
                return false;
            }
            if (!reason) {
                Swal.showValidationMessage('Please enter a reason for visit');
                return false;
            }
            return { time, reason };
        }
    });

    if (formData) {
        await submitVisitationRequest({
            visitor_id: visitor.id,
            inmate_id: inmate.id,
            visit_date: selectedDate,
            visit_time: formData.time,
            reason: formData.reason,
            match_confidence: confidence / 100, // Convert percentage to decimal (0-1)
        });
    }
}

/**
 * Show form for multiple inmates
 */
async function showMultipleInmatesForm(visitor, inmates, selectedDate, confidence) {
    const { isDark, isMobile } = getThemeSettings();
    const inmateOptions = inmates.map(inmate => 
        `<option value="${inmate.id}">${inmate.name} - ${inmate.cell_location || 'N/A'}</option>`
    ).join('');

    const { value: formData } = await Swal.fire({
        title: '<span class="text-lg sm:text-xl font-bold">Visitation Request</span>',
        html: `
            <div class="w-full space-y-4 text-left">
                <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-green-900 dark:text-green-200">Visitor Verified</p>
                            <p class="text-xs text-green-700 dark:text-green-300 mt-1">Match confidence: ${confidence}%</p>
                        </div>
                    </div>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p class="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Visitor</p>
                    <p class="text-base font-bold text-blue-900 dark:text-blue-200 mt-1">${visitor.name}</p>
                    <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">ID: VIS-${String(visitor.id).padStart(6, '0')}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Visit Date</p>
                    <p class="text-base font-bold text-gray-900 dark:text-gray-200 mt-1">${formatDate(selectedDate)}</p>
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Inmate to Visit <span class="text-red-500">*</span>
                    </label>
                    <select id="inmate-select" class="w-full px-4 py-2.5 text-sm rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                        <option value="">Choose an inmate...</option>
                        ${inmateOptions}
                    </select>
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Preferred Time <span class="text-red-500">*</span>
                    </label>
                    <input type="time" id="visit-time" class="w-full px-4 py-2.5 text-sm rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Reason for Visit <span class="text-red-500">*</span>
                    </label>
                    <textarea id="visit-reason" rows="3" class="w-full px-4 py-2.5 text-sm rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Enter reason for visit..." required></textarea>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Submit Request',
        cancelButtonText: 'Cancel',
        width: isMobile ? '95%' : '36rem',
        padding: isMobile ? '1rem' : '1.5rem',
        ...getThemeColors(),
        customClass: {
            popup: 'rounded-xl shadow-2xl',
            htmlContainer: '!px-0',
            confirmButton: 'px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer',
            cancelButton: `px-6 py-2.5 text-sm font-medium rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} cursor-pointer`,
        },
        buttonsStyling: false,
        preConfirm: () => {
            const inmateId = document.getElementById('inmate-select').value;
            const time = document.getElementById('visit-time').value;
            const reason = document.getElementById('visit-reason').value.trim();
            if (!inmateId) {
                Swal.showValidationMessage('Please select an inmate');
                return false;
            }
            if (!time) {
                Swal.showValidationMessage('Please select a visit time');
                return false;
            }
            if (!reason) {
                Swal.showValidationMessage('Please enter a reason for visit');
                return false;
            }
            return { inmateId, time, reason };
        }
    });

    if (formData) {
        await submitVisitationRequest({
            visitor_id: visitor.id,
            inmate_id: formData.inmateId,
            visit_date: selectedDate,
            visit_time: formData.time,
            reason: formData.reason,
            match_confidence: confidence / 100, // Convert percentage to decimal (0-1)
        });
    }
}

/**
 * Submit visitation request to backend (Public)
 */
async function submitVisitationRequest(requestData) {
    const { isDark } = getThemeSettings();

    try {
        const payload = {
            log_id: currentLogId,
            ...requestData,
            duration_minutes: 30, // Default duration
        };
        
        // Security: Don't log sensitive request data
        
        // Use public endpoint for visitor facial recognition
        const response = await fetch('/visitor/facial-recognition/create-visitation-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            // Handle validation errors (422) differently
            if (response.status === 422 && data.errors) {
                // Format validation errors
                const errorMessages = Object.values(data.errors).flat().join(', ');
                throw new Error(errorMessages || 'Validation failed. Please check your input.');
            }
            
            const errorMessage = data.message || 'Failed to create visitation request';
            throw new Error(errorMessage);
        }

        // Use reference ID from response or generate one
        const referenceId = data.visitation_request?.id 
            ? `VR-${String(data.visitation_request.id).padStart(6, '0')}` 
            : `VR-${Date.now()}-${requestData.visitor_id}`;

        await Swal.fire({
            icon: 'success',
            title: '<span class="text-lg font-semibold">Request Submitted!</span>',
            html: `
                <div class="text-center space-y-4">
                    <p class="${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm">
                        Your visitation request has been submitted successfully.
                    </p>
                    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Reference ID</p>
                        <p class="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1 font-mono">${referenceId}</p>
                    </div>
                    <div class="text-left bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <p class="text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}">
                            <strong>Status:</strong> <span class="inline-flex px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending Approval</span>
                        </p>
                    </div>
                </div>
            `,
            ...getThemeColors(),
            confirmButtonText: 'OK',
            customClass: {
                popup: 'rounded-xl shadow-2xl',
                confirmButton: 'px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer',
            },
            buttonsStyling: false,
        });

        // Reload page to show updated requests
        setTimeout(() => {
            window.location.reload();
        }, 1500);

    } catch (error) {
        // Security: Generic error handling - don't expose sensitive data
        
        // Show user-friendly error message
        await Swal.fire({
            icon: 'error',
            title: 'Submission Failed',
            html: `
                <div class="text-left space-y-3">
                    <p class="text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}">${error.message || 'Failed to submit visitation request. Please try again.'}</p>
                    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-4 border border-gray-200 dark:border-gray-700">
                        <p class="text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}">If this problem persists, please contact the facility administrator.</p>
                    </div>
                </div>
            `,
            ...getThemeColors(),
            confirmButtonText: 'Close',
            customClass: {
                popup: 'rounded-xl shadow-2xl',
                confirmButton: 'px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer',
            },
            buttonsStyling: false,
        });
    }
}

/**
 * Get theme colors for SweetAlert2
 */
function getThemeColors() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
        background: isDark ? '#1f2937' : '#ffffff',
        color: isDark ? '#f9fafb' : '#1f2937',
    };
}

/**
 * Get theme settings
 */
function getThemeSettings() {
    return {
        isDark: document.documentElement.classList.contains('dark'),
        isMobile: window.innerWidth < 640,
    };
}
