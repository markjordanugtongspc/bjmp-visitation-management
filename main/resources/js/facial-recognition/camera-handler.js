/**
 * Camera Handler Module
 * Manages webcam access and video stream
 */

class CameraHandler {
    constructor(videoElement) {
        this.videoElement = videoElement;
        this.stream = null;
        this.isActive = false;
    }

    /**
     * Start the camera and get video stream
     * @param {Object} constraints - MediaStream constraints
     * @returns {Promise<MediaStream>}
     */
    async start(constraints = {}) {
        try {
            // Optimized constraints for face detection (smaller resolution = faster processing)
            const defaultConstraints = {
                video: {
                    width: { ideal: 640, max: 1280 },
                    height: { ideal: 480, max: 720 },
                    facingMode: 'user',
                    frameRate: { ideal: 30, max: 60 }
                },
                audio: false
            };

            const finalConstraints = { ...defaultConstraints, ...constraints };

            // Request camera access
            this.stream = await navigator.mediaDevices.getUserMedia(finalConstraints);

            // Attach stream to video element
            this.videoElement.srcObject = this.stream;

            // Wait for video to be ready
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    resolve();
                };
            });

            // Play the video
            await this.videoElement.play();

            this.isActive = true;
            console.log('Camera started successfully');

            return this.stream;
        } catch (error) {
            console.error('Error starting camera:', error);
            throw this.handleCameraError(error);
        }
    }

    /**
     * Stop the camera and release resources
     */
    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }

        this.isActive = false;
        console.log('Camera stopped');
    }

    /**
     * Check if camera is currently active
     * @returns {boolean}
     */
    isRunning() {
        return this.isActive;
    }

    /**
     * Get current video dimensions
     * @returns {Object}
     */
    getVideoDimensions() {
        return {
            width: this.videoElement.videoWidth,
            height: this.videoElement.videoHeight
        };
    }

    /**
     * Handle camera errors with user-friendly messages
     * @param {Error} error - The error object
     * @returns {Error}
     */
    handleCameraError(error) {
        let message = 'Failed to access camera';

        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            message = 'Camera access denied. Please allow camera permissions in your browser settings.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            message = 'No camera found. Please connect a camera and try again.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            message = 'Camera is already in use by another application.';
        } else if (error.name === 'OverconstrainedError') {
            message = 'Camera does not support the requested settings.';
        } else if (error.name === 'TypeError') {
            message = 'Camera access is not supported in this browser.';
        }

        return new Error(message);
    }

    /**
     * Check if camera is supported in the browser
     * @returns {boolean}
     */
    static isSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    /**
     * Get list of available video devices
     * @returns {Promise<Array>}
     */
    static async getAvailableDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'videoinput');
        } catch (error) {
            console.error('Error enumerating devices:', error);
            return [];
        }
    }
}

export default CameraHandler;
