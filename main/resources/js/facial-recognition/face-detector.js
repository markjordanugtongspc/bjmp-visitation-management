/**
 * Face Detector Module
 * Handles face detection and analysis using face-api.js
 */

import { faceapi } from './faceapi-loader.js';

class FaceDetector {
    constructor() {
        this.detectionOptions = {
            inputSize: 416,        // Tiny Face Detector input size (128, 160, 224, 320, 416, 512, 608)
            scoreThreshold: 0.5    // Minimum confidence threshold
        };

        this.isDetecting = false;
        this.detectionInterval = null;
        this.lastDetectionTime = 0;
        this.targetFPS = 30;
        this.frameInterval = 1000 / this.targetFPS;
    }

    /**
     * Set detection options
     * @param {Object} options - Detection configuration
     */
    setDetectionOptions(options) {
        this.detectionOptions = { ...this.detectionOptions, ...options };
    }

    /**
     * Get Tiny Face Detector options
     * @returns {Object}
     */
    getDetectionOptions() {
        return new faceapi.TinyFaceDetectorOptions({
            inputSize: this.detectionOptions.inputSize,
            scoreThreshold: this.detectionOptions.scoreThreshold
        });
    }

    /**
     * Detect faces with landmarks and age/gender
     * Optimized single detection chain for facial recognition
     * @param {HTMLVideoElement} video - Video element to analyze
     * @returns {Promise<Array>}
     */
    async detectFaces(video) {
        try {
            const options = this.getDetectionOptions();
            
            // Single optimized detection chain: Face + Landmarks + Age/Gender + Descriptors
            const detections = await faceapi
                .detectAllFaces(video, options)
                .withFaceLandmarks()
                .withAgeAndGender()
                .withFaceDescriptors();
            
            return detections;
        } catch (error) {
            console.error('Error detecting faces:', error);
            return [];
        }
    }

    /**
     * Detect faces with descriptors for face matching/recognition
     * @param {HTMLVideoElement|HTMLImageElement|HTMLCanvasElement} input - Input element
     * @returns {Promise<Array>}
     */
    async detectFacesWithDescriptors(input) {
        try {
            const options = this.getDetectionOptions();
            
            // Detection chain with face descriptors for recognition
            const detections = await faceapi
                .detectAllFaces(input, options)
                .withFaceLandmarks()
                .withFaceDescriptors();
            
            return detections;
        } catch (error) {
            console.error('Error detecting faces with descriptors:', error);
            return [];
        }
    }

    /**
     * Start continuous face detection with requestAnimationFrame for smooth real-time updates
     * @param {HTMLVideoElement} video - Video element
     * @param {Function} onDetection - Callback for each detection
     */
    startContinuousDetection(video, onDetection) {
        if (this.isDetecting) {
            console.warn('Detection already running');
            return;
        }

        this.isDetecting = true;
        this.lastDetectionTime = performance.now();

        const detect = async (currentTime) => {
            if (!this.isDetecting) return;

            // Throttle to target FPS for smooth performance
            const elapsed = currentTime - this.lastDetectionTime;
            
            if (elapsed >= this.frameInterval) {
                this.lastDetectionTime = currentTime - (elapsed % this.frameInterval);
                
                const detections = await this.detectFaces(video);
                
                if (onDetection) {
                    onDetection(detections);
                }
            }

            if (this.isDetecting) {
                this.detectionInterval = requestAnimationFrame(detect);
            }
        };

        this.detectionInterval = requestAnimationFrame(detect);
    }

    /**
     * Stop continuous face detection
     */
    stopContinuousDetection() {
        this.isDetecting = false;
        if (this.detectionInterval) {
            cancelAnimationFrame(this.detectionInterval);
            this.detectionInterval = null;
        }
    }

    /**
     * Set target FPS for detection
     * @param {number} fps - Target frames per second (10-60)
     */
    setTargetFPS(fps) {
        this.targetFPS = Math.max(10, Math.min(60, fps));
        this.frameInterval = 1000 / this.targetFPS;
        console.log(`Detection FPS set to: ${this.targetFPS}`);
    }

    /**
     * Format detection results for display
     * @param {Array} detections - Detection results
     * @returns {Array}
     */
    formatDetectionResults(detections) {
        return detections.map((detection, index) => {
            const result = {
                id: index + 1,
                confidence: detection.detection.score,
                box: detection.detection.box
            };

            if (detection.landmarks) {
                result.landmarks = detection.landmarks.positions.length;
            }

            if (detection.age !== undefined) {
                result.age = Math.round(detection.age);
            }

            if (detection.gender) {
                result.gender = {
                    type: detection.gender,
                    confidence: detection.genderProbability
                };
            }

            return result;
        });
    }
    
    /**
     * Compare two face descriptors and get similarity score
     * @param {Float32Array} descriptor1 - First face descriptor
     * @param {Float32Array} descriptor2 - Second face descriptor
     * @returns {number} - Euclidean distance (lower is more similar)
     */
    compareFaces(descriptor1, descriptor2) {
        return faceapi.euclideanDistance(descriptor1, descriptor2);
    }
    
    /**
     * Find best match from a list of known faces
     * @param {Float32Array} queryDescriptor - Face descriptor to match
     * @param {Array} knownFaces - Array of {name, descriptor} objects
     * @param {number} threshold - Maximum distance to consider a match (default 0.25 for 75% confidence)
     * @returns {Object|null} - Best match or null if no match found
     */
    findBestMatch(queryDescriptor, knownFaces, threshold = 0.25) {
        let bestMatch = null;
        let bestDistance = Infinity; // Start with worst possible distance
        
        for (const knownFace of knownFaces) {
            const distance = this.compareFaces(queryDescriptor, knownFace.descriptor);
            
            // Track the best match (lowest distance)
            if (distance < bestDistance) {
                bestDistance = distance;
                bestMatch = {
                    name: knownFace.name,
                    distance: distance,
                    similarity: (1 - distance) * 100 // Convert to percentage
                };
            }
        }
        
        // Reject if best match doesn't meet threshold
        if (bestMatch && bestMatch.distance > threshold) {
            return null;
        }
        
        return bestMatch;
    }
}

export default FaceDetector;
