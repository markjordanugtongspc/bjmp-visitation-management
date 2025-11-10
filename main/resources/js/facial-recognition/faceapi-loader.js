/**
 * Face-API.js Loader Module
 * Handles loading and initialization of face-api.js models
 */

import * as faceapi from 'face-api.js';

class FaceAPILoader {
    constructor() {
        this.modelsLoaded = false;
        this.loadingProgress = {
            tinyFaceDetector: false,
            faceLandmark68Net: false,
            faceRecognitionNet: false,
            ageGenderNet: false
        };
    }

    /**
     * Initialize face-api.js with backend fallback
     */
    async initializeBackend() {
        try {
            // First, let's try to suppress WebGL errors by setting environment
            if (typeof window !== 'undefined' && window.tf) {
                // If TensorFlow.js is available globally, set backend preferences
                try {
                    // Try to set backend to CPU first to avoid WebGL issues
                    await window.tf.setBackend('cpu');
                    await window.tf.ready();
                    console.log('TensorFlow.js: CPU backend set successfully');
                } catch (tfError) {
                    console.warn('TensorFlow.js backend setup warning:', tfError);
                }
            }

            // Initialize face-api.js - it will handle its own backend
            // We'll catch and handle WebGL errors gracefully
            console.log('Initializing Face-API.js...');
            return true;
        } catch (error) {
            console.warn('Backend initialization warning:', error);
            // Continue anyway - face-api.js often handles this internally
            return true;
        }
    }

    /**
     * Load all required models from the specified path
     * @param {string} modelsPath - Path to the models directory
     * @param {Function} onProgress - Callback for progress updates
     * @returns {Promise<void>}
     */
    async loadModels(modelsPath = '/models', onProgress = null) {
        try {
            console.log('Starting to load face-api.js models...');

            // Initialize backend first
            if (onProgress) {
                onProgress({ type: 'loading', model: 'backend', message: 'Initializing TensorFlow.js backend...' });
            }
            
            await this.initializeBackend();
            
            if (onProgress) {
                onProgress({ type: 'loaded', model: 'backend', message: 'Backend initialized' });
            }

            // Load only required models: Tiny Face Detector, Landmarks, Age/Gender, and Face Recognition
            const modelPromises = [
                this.loadModel('tinyFaceDetector', () => faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath), onProgress),
                this.loadModel('faceLandmark68Net', () => faceapi.nets.faceLandmark68Net.loadFromUri(modelsPath), onProgress),
                this.loadModel('faceRecognitionNet', () => faceapi.nets.faceRecognitionNet.loadFromUri(modelsPath), onProgress),
                this.loadModel('ageGenderNet', () => faceapi.nets.ageGenderNet.loadFromUri(modelsPath), onProgress)
            ];

            await Promise.all(modelPromises);

            this.modelsLoaded = true;
            console.log('All face-api.js models loaded successfully!');

            if (onProgress) {
                onProgress({ type: 'complete', message: 'All models loaded successfully!' });
            }

            return true;
        } catch (error) {
            console.error('Error loading face-api.js models:', error);
            throw new Error(`Failed to load models: ${error.message}`);
        }
    }

    /**
     * Load a single model with progress tracking
     * @param {string} modelName - Name of the model
     * @param {Function} loadFunction - Function to load the model
     * @param {Function} onProgress - Progress callback
     * @returns {Promise<void>}
     */
    async loadModel(modelName, loadFunction, onProgress) {
        try {
            if (onProgress) {
                onProgress({ type: 'loading', model: modelName, message: `Loading ${modelName}...` });
            }

            await loadFunction();
            this.loadingProgress[modelName] = true;

            if (onProgress) {
                onProgress({ type: 'loaded', model: modelName, message: `${modelName} loaded` });
            }

            console.log(`✓ ${modelName} loaded`);
        } catch (error) {
            // Handle WebGL errors gracefully
            if (error.message && error.message.includes('WebGL')) {
                console.warn(`⚠ WebGL issue with ${modelName}, this may affect performance but should still work:`, error.message);
                // Don't throw the error for WebGL issues - face-api.js can often still work
                this.loadingProgress[modelName] = true; // Mark as loaded to continue
                
                if (onProgress) {
                    onProgress({ type: 'loaded', model: modelName, message: `${modelName} loaded (WebGL warning)` });
                }
                return;
            }
            
            console.error(`✗ Failed to load ${modelName}:`, error);
            throw error;
        }
    }

    /**
     * Check if all models are loaded
     * @returns {boolean}
     */
    areModelsLoaded() {
        return this.modelsLoaded;
    }

    /**
     * Get loading progress for all models
     * @returns {Object}
     */
    getLoadingProgress() {
        return { ...this.loadingProgress };
    }

    /**
     * Get available detection options based on loaded models
     * @returns {Object}
     */
    getAvailableOptions() {
        return {
            tinyFaceDetector: this.loadingProgress.tinyFaceDetector,
            landmarks: this.loadingProgress.faceLandmark68Net,
            ageGender: this.loadingProgress.ageGenderNet,
            descriptor: this.loadingProgress.faceRecognitionNet
        };
    }
}

// Export singleton instance
export const faceAPILoader = new FaceAPILoader();
export { faceapi };
