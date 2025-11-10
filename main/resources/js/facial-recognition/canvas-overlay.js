/**
 * Canvas Overlay Module
 * Handles drawing detection results on canvas overlay
 */

import { faceapi } from './faceapi-loader.js';

class CanvasOverlay {
    constructor(canvas, video) {
        this.canvas = canvas;
        this.video = video;
        this.ctx = canvas.getContext('2d');
        this.isDarkMode = document.documentElement.classList.contains('dark');
        
        // Watch for theme changes
        this.observeThemeChanges();
    }

    /**
     * Observe theme changes to update colors
     */
    observeThemeChanges() {
        const observer = new MutationObserver(() => {
            this.isDarkMode = document.documentElement.classList.contains('dark');
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    /**
     * Resize canvas to match video dimensions
     */
    resizeCanvas() {
        const displaySize = {
            width: this.video.offsetWidth,
            height: this.video.offsetHeight
        };

        this.canvas.width = displaySize.width;
        this.canvas.height = displaySize.height;

        return displaySize;
    }

    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draw detection results on canvas
     * @param {Array} detections - Face detection results
     */
    drawDetections(detections) {
        this.clear();

        if (!detections || detections.length === 0) {
            return;
        }

        // Draw each detection
        detections.forEach((detection, index) => {
            // Draw bounding box
            this.drawFaceBox(detection.detection, index + 1);
            
            // Draw simple face landmark points if available
            if (detection.landmarks) {
                this.drawLandmarks(detection.landmarks);
            }
            
            // Draw age and gender information
            if (detection.age || detection.gender) {
                this.drawInfo(detection, index + 1);
            }
        });
    }

    /**
     * Draw face bounding box
     * @param {Object} detection - Detection object with box
     * @param {number} faceNumber - Face number for labeling
     */
    drawFaceBox(detection, faceNumber) {
        const { x, y, width, height } = detection.box;
        const confidence = detection.score;

        // Set colors based on theme
        const boxColor = this.isDarkMode ? '#60A5FA' : '#3B82F6'; // blue-400 / blue-600
        const textColor = this.isDarkMode ? '#F3F4F6' : '#1F2937'; // gray-100 / gray-800
        const bgColor = this.isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)'; // gray-800 / white

        // Draw box
        this.ctx.strokeStyle = boxColor;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, width, height);

        // Draw label background
        const label = `Face ${faceNumber} (${(confidence * 100).toFixed(1)}%)`;
        this.ctx.font = 'bold 14px sans-serif';
        const textWidth = this.ctx.measureText(label).width;
        
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(x, y - 25, textWidth + 10, 25);

        // Draw label text
        this.ctx.fillStyle = textColor;
        this.ctx.fillText(label, x + 5, y - 8);
    }

    /**
     * Draw facial landmarks (optimized - draw fewer points for performance)
     * @param {Object} landmarks - Facial landmarks object
     */
    drawLandmarks(landmarks) {
        const pointColor = this.isDarkMode ? '#34D399' : '#10B981'; // green-400 / green-500

        this.ctx.fillStyle = pointColor;
        
        // Draw only key landmarks for performance (every 3rd point)
        const positions = landmarks.positions;
        for (let i = 0; i < positions.length; i += 3) {
            const point = positions[i];
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 1.5, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }

    
    /**
     * Draw additional information (age, gender)
     * @param {Object} detection - Detection with additional info
     * @param {number} index - Face index
     */
    drawInfo(detection, index) {
        const { x, y, height } = detection.detection.box;
        const textColor = this.isDarkMode ? '#F3F4F6' : '#1F2937';
        const bgColor = this.isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)';

        let infoLines = [];

        // Add age and gender
        if (detection.age !== undefined && detection.gender) {
            const age = Math.round(detection.age);
            const gender = detection.gender;
            const genderConf = (detection.genderProbability * 100).toFixed(0);
            infoLines.push(`${gender} (${genderConf}%), ${age} years`);
        } else if (detection.age !== undefined) {
            infoLines.push(`Age: ${Math.round(detection.age)}`);
        } else if (detection.gender) {
            const genderConf = (detection.genderProbability * 100).toFixed(0);
            infoLines.push(`${detection.gender} (${genderConf}%)`);
        }

        if (infoLines.length === 0) return;

        // Draw info box
        this.ctx.font = '12px sans-serif';
        const maxWidth = Math.max(...infoLines.map(line => this.ctx.measureText(line).width));
        const boxHeight = infoLines.length * 18 + 10;

        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(x, y + height + 5, maxWidth + 10, boxHeight);

        // Draw text
        this.ctx.fillStyle = textColor;
        infoLines.forEach((line, i) => {
            this.ctx.fillText(line, x + 5, y + height + 20 + (i * 18));
        });
    }

    
    /**
     * Draw a simple message on canvas
     * @param {string} message - Message to display
     */
    drawMessage(message) {
        this.clear();
        
        const textColor = this.isDarkMode ? '#9CA3AF' : '#6B7280'; // gray-400 / gray-500
        
        this.ctx.font = '16px sans-serif';
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.textAlign = 'left';
    }
}

export default CanvasOverlay;
