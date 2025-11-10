/**
 * Facial Recognition Main Application
 * Integrates all modules and handles UI interactions
 */

import Swal from 'sweetalert2';
import { faceAPILoader } from './faceapi-loader.js';
import CameraHandler from './camera-handler.js';
import FaceDetector from './face-detector.js';
import CanvasOverlay from './canvas-overlay.js';
import FaceMatcher from './face-matcher.js';
import VisitorLogsManager from './visitor-logs-manager.js';

class FacialRecognitionApp {
    constructor() {
        this.cameraHandler = null;
        this.faceDetector = null;
        this.canvasOverlay = null;
        this.faceMatcher = null;
        this.visitorLogsManager = null;
        this.isInitialized = false;
        this.isDetecting = false;
        this.lastMatchAttempt = 0;
        this.matchCooldown = 3000; // 3 seconds between match attempts

        // DOM elements
        this.elements = {
            video: document.getElementById('video-feed'),
            canvas: document.getElementById('overlay-canvas'),
            placeholder: document.getElementById('camera-placeholder'),
            startBtn: document.getElementById('start-camera-btn'),
            stopBtn: document.getElementById('stop-camera-btn'),
            statusText: document.getElementById('status-text'),
            confidenceSlider: document.getElementById('confidence-slider'),
            confidenceValue: document.getElementById('confidence-value'),
            detectionResults: document.getElementById('detection-results')
        };

        // Validate required elements
        this.validateElements();

        this.init();
    }

    /**
     * Validate that all required DOM elements exist
     */
    validateElements() {
        const requiredElements = ['video', 'canvas', 'startBtn', 'stopBtn', 'statusText'];
        const missingElements = [];

        for (const elementName of requiredElements) {
            if (!this.elements[elementName]) {
                missingElements.push(elementName);
            }
        }

        if (missingElements.length > 0) {
            console.error('Missing required elements:', missingElements);
            throw new Error(`Missing required DOM elements: ${missingElements.join(', ')}`);
        }
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            // Check camera support
            if (!CameraHandler.isSupported()) {
                this.showError('Camera access is not supported in this browser.');
                return;
            }

            // Show loading modal
            this.showLoadingModal();

            // Load face-api.js models (includes backend initialization)
            await faceAPILoader.loadModels('/models', (progress) => {
                this.updateLoadingProgress(progress);
            });

            // Initialize modules
            this.cameraHandler = new CameraHandler(this.elements.video);
            this.faceDetector = new FaceDetector();
            this.canvasOverlay = new CanvasOverlay(this.elements.canvas, this.elements.video);
            this.faceMatcher = new FaceMatcher(this); // Pass app reference
            this.visitorLogsManager = new VisitorLogsManager();
            
            // Make visitor logs manager globally accessible immediately
            window.visitorLogsManager = this.visitorLogsManager;

            // Initialize face matcher (load registered visitors)
            await this.faceMatcher.initialize();

            // Setup event listeners
            this.setupEventListeners();

            this.isInitialized = true;
            
            // Close loading modal
            Swal.close();
            
            this.updateStatus('Ready to start - Face matching enabled', 'success');

        } catch (error) {
            console.error('Initialization error:', error);
            this.showError(`Failed to initialize: ${error.message}`);
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Camera controls
        this.elements.startBtn.addEventListener('click', () => this.startCamera());
        this.elements.stopBtn.addEventListener('click', () => this.stopCamera());

        // Confidence threshold
        this.elements.confidenceSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.elements.confidenceValue.textContent = value.toFixed(2);
            this.faceDetector.setDetectionOptions({ minConfidence: value });
        });
    }

    /**
     * Start camera and begin detection
     */
    async startCamera() {
        if (!this.isInitialized) {
            this.showError('Application is still initializing. Please wait.');
            return;
        }

        if (this.cameraHandler.isRunning()) {
            return;
        }

        try {
            this.updateStatus('Starting camera...', 'loading');

            // Start camera
            await this.cameraHandler.start();

            // Hide placeholder, show video
            this.elements.placeholder.classList.add('hidden');
            this.elements.video.classList.remove('hidden');

            // Toggle buttons
            this.elements.startBtn.classList.add('hidden');
            this.elements.stopBtn.classList.remove('hidden');

            // Start detection
            this.startDetection();

            this.updateStatus('Camera active - Detecting faces...', 'success');

        } catch (error) {
            console.error('Camera start error:', error);
            this.showError(error.message);
            this.updateStatus('Failed to start camera', 'error');
        }
    }

    /**
     * Stop camera and detection
     */
    stopCamera() {
        // Stop detection
        this.stopDetection();

        // Stop camera
        this.cameraHandler.stop();

        // Show placeholder, hide video
        this.elements.placeholder.classList.remove('hidden');
        this.elements.video.classList.add('hidden');

        // Toggle buttons
        this.elements.startBtn.classList.remove('hidden');
        this.elements.stopBtn.classList.add('hidden');

        // Clear canvas
        this.canvasOverlay.clear();

        // Clear results
        this.elements.detectionResults.innerHTML = '<p>No faces detected yet. Start the camera to begin detection.</p>';

        this.updateStatus('Camera stopped', 'info');
    }

    /**
     * Start face detection loop with optimized real-time updates
     */
    startDetection() {
        if (this.isDetecting) return;

        this.isDetecting = true;

        // Use requestAnimationFrame for smooth 30 FPS detection
        this.faceDetector.startContinuousDetection(
            this.elements.video,
            (detections) => this.handleDetections(detections)
        );
    }

    /**
     * Stop face detection loop
     */
    stopDetection() {
        this.isDetecting = false;
        this.faceDetector.stopContinuousDetection();
    }

    /**
     * Handle detection results
     * @param {Array} detections - Face detection results
     */
    async handleDetections(detections) {
        // Draw on canvas
        this.canvasOverlay.drawDetections(detections);

        // Always update results display to show scanning/processing status
        this.displayResults(detections);

        // Attempt face matching if conditions are met
        if (detections && detections.length === 1 && this.faceMatcher) {
            const now = Date.now();
            
            // During scanning, attempt matching more frequently to capture samples
            if (this.faceMatcher.isScanning) {
                const detection = detections[0];
                
                // Check if detection quality is good enough (>90% confidence)
                if (detection.detection && detection.detection.score > 0.9) {
                    await this.attemptFaceMatching(detection);
                }
            }
            // Normal matching attempt every 3 seconds when not scanning
            else if (now - this.lastMatchAttempt >= this.matchCooldown) {
                const detection = detections[0];
                
                // Check if detection quality is good enough (>90% confidence)
                if (detection.detection && detection.detection.score > 0.9) {
                    this.lastMatchAttempt = now;
                    await this.attemptFaceMatching(detection);
                }
            }
        }
    }

    /**
     * Attempt to match detected face against registered visitors
     * @param {Object} detection - Face detection object
     */
    async attemptFaceMatching(detection) {
        try {
            // Extract face data
            const faceData = {
                descriptor: detection.descriptor,
                age: Math.round(detection.age) || null,
                gender: detection.gender?.toLowerCase() || 'unknown',
                landmarksCount: detection.landmarks?.positions?.length || 68,
                expressions: detection.expressions || {},
                detectionConfidence: detection.detection?.score || 0,
            };

            // Trigger the complete face recognition flow
            await this.faceMatcher.handleFaceDetection(faceData);
            
        } catch (error) {
            console.error('Error in face matching:', error);
        }
    }

    /**
     * Display detection results in the UI
     * @param {Array} detections - Face detection results
     */
    displayResults(detections) {
        if (!detections || detections.length === 0) {
            this.elements.detectionResults.innerHTML = 
                '<p class="text-gray-500 dark:text-gray-400">No faces detected in current frame.</p>';
            return;
        }

        const results = this.faceDetector.formatDetectionResults(detections);
        
        let html = `<div class="space-y-4">`;
        
        // Check scanning status
        if (this.faceMatcher?.isScanning) {
            const elapsed = Date.now() - this.faceMatcher.scanningStartTime;
            const remaining = Math.ceil((this.faceMatcher.scanDuration - elapsed) / 1000);
            html += `
                <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div class="flex items-center gap-2">
                        <div class="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <p class="font-medium text-blue-900 dark:text-blue-100">Scanning face... ${remaining}s remaining</p>
                    </div>
                    <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">Please hold still while we capture your face</p>
                </div>
            `;
        } else if (this.faceMatcher?.isProcessing) {
            html += `
                <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div class="flex items-center gap-2">
                        <div class="animate-pulse h-4 w-4 bg-amber-600 rounded-full"></div>
                        <p class="font-medium text-amber-900 dark:text-amber-100">Processing captured face...</p>
                    </div>
                    <p class="text-sm text-amber-700 dark:text-amber-300 mt-1">Analyzing and matching against database</p>
                </div>
            `;
        }
        
        html += `<p class="font-medium text-gray-900 dark:text-gray-50">Detected ${results.length} face(s)</p>`;

        results.forEach((result, index) => {
            // Get matched visitor name and status
            const matchedVisitor = this.faceMatcher?.lastMatchResult;
            let visitorName = 'Not Registered';
            let nameColor = 'text-red-600 dark:text-red-400';
            let statusBadge = '';
            
            if (matchedVisitor && matchedVisitor.matched) {
                visitorName = matchedVisitor.name;
                nameColor = 'text-green-600 dark:text-green-400';
                statusBadge = `
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        Matched
                    </span>
                `;
            } else if (matchedVisitor && !matchedVisitor.matched) {
                statusBadge = `
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                        No Match
                    </span>
                `;
            }
            
            html += `
                <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${matchedVisitor && matchedVisitor.matched ? 'ring-2 ring-green-500 ring-opacity-50' : ''}">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="font-semibold text-gray-900 dark:text-gray-50">Face ${result.id}</h3>
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-medium ${nameColor}">${visitorName}</span>
                            ${statusBadge}
                        </div>
                    </div>
                    ${matchedVisitor && matchedVisitor.matched ? `
                        <div class="mb-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                            <p class="text-sm text-green-800 dark:text-green-200">
                                <strong>Match Accuracy:</strong> ${matchedVisitor.similarity}% 
                                <span class="text-xs ml-2">✓ Identity verified</span>
                            </p>
                        </div>
                    ` : ''}
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                            <span class="text-gray-600 dark:text-gray-400">Confidence:</span>
                            <span class="ml-2 font-medium text-gray-900 dark:text-gray-50">${(result.confidence * 100).toFixed(1)}%</span>
                        </div>
                        ${result.landmarks ? `
                        <div>
                            <span class="text-gray-600 dark:text-gray-400">Landmarks:</span>
                            <span class="ml-2 font-medium text-gray-900 dark:text-gray-50">${result.landmarks} points</span>
                        </div>
                        ` : ''}
                        ${result.age !== undefined ? `
                        <div>
                            <span class="text-gray-600 dark:text-gray-400">Age:</span>
                            <span class="ml-2 font-medium text-gray-900 dark:text-gray-50">${result.age} years</span>
                        </div>
                        ` : ''}
                        ${result.gender ? `
                        <div>
                            <span class="text-gray-600 dark:text-gray-400">Gender:</span>
                            <span class="ml-2 font-medium text-gray-900 dark:text-gray-50 capitalize">${result.gender.type} (${(result.gender.confidence * 100).toFixed(0)}%)</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        this.elements.detectionResults.innerHTML = html;
    }

    /**
     * Update status message
     * @param {string} message - Status message
     * @param {string} type - Status type (success, error, loading, info)
     */
    updateStatus(message, type = 'info') {
        this.elements.statusText.textContent = message;
        
        // Remove all status classes
        this.elements.statusText.classList.remove('text-green-600', 'dark:text-green-400', 'text-red-600', 'dark:text-red-400', 'text-blue-600', 'dark:text-blue-400', 'text-gray-600', 'dark:text-gray-400');
        
        // Add appropriate class based on type
        switch (type) {
            case 'success':
                this.elements.statusText.classList.add('text-green-600', 'dark:text-green-400');
                break;
            case 'error':
                this.elements.statusText.classList.add('text-red-600', 'dark:text-red-400');
                break;
            case 'loading':
                this.elements.statusText.classList.add('text-blue-600', 'dark:text-blue-400');
                break;
            default:
                this.elements.statusText.classList.add('text-gray-600', 'dark:text-gray-400');
        }
    }

    /**
     * Show loading modal with progress
     */
    showLoadingModal() {
        const isDark = document.documentElement.classList.contains('dark');
        
        Swal.fire({
            title: 'Loading Models',
            html: '<div id="loading-progress">Initializing...</div>',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            background: isDark ? '#1F2937' : '#FFFFFF',
            color: isDark ? '#F3F4F6' : '#1F2937',
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    /**
     * Update loading progress
     * @param {Object} progress - Progress information
     */
    updateLoadingProgress(progress) {
        const progressEl = document.getElementById('loading-progress');
        if (progressEl) {
            progressEl.textContent = progress.message;
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const isDark = document.documentElement.classList.contains('dark');
        
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            background: isDark ? '#1F2937' : '#FFFFFF',
            color: isDark ? '#F3F4F6' : '#1F2937',
            confirmButtonColor: '#EF4444'
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new FacialRecognitionApp();
    
    // Make app globally accessible
    window.facialRecognitionApp = app;
});
