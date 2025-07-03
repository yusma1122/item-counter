class ItemCounter {
    constructor() {
        this.video = document.getElementById('webcam');
        this.overlay = document.getElementById('overlay');
        this.hiddenCanvas = document.getElementById('hiddenCanvas');
        this.selectionBox = document.getElementById('selectionBox');
        this.counter = document.getElementById('counter');
        this.status = document.getElementById('status');

        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.resetCounterBtn = document.getElementById('resetCounterBtn');
        this.sensitivitySlider = document.getElementById('sensitivity');
        this.sensitivityValue = document.getElementById('sensitivityValue');

        this.videoContainer = document.getElementById('videoContainer');

        // State variables
        this.stream = null;
        this.isSelecting = false;
        this.selectionStart = { x: 0, y: 0 };
        this.selectionArea = null;
        this.isDetecting = false;
        this.detectionInterval = null;
        this.previousColorData = null;
        this.baselineColor = null; // Background reference color
        this.count = 0;
        this.sensitivity = 25;
        this.isObjectPresent = false; // Track if object is currently in area
        this.cooldownTime = 1000; // 1 second cooldown between detections
        this.lastDetectionTime = 0;

        // Maximum selection size
        this.MAX_SELECTION_SIZE = 100;

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateSensitivityDisplay();
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startCamera());
        this.resetBtn.addEventListener('click', () => this.resetSelection());
        this.resetCounterBtn.addEventListener('click', () => this.resetCounter());

        // Add baseline capture button event
        const captureBaselineBtn = document.createElement('button');
        captureBaselineBtn.id = 'captureBaselineBtn';
        captureBaselineBtn.className = 'bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors';
        captureBaselineBtn.textContent = 'Set Background';
        captureBaselineBtn.disabled = true;

        // Insert baseline button after reset button
        this.resetBtn.parentNode.insertBefore(captureBaselineBtn, this.resetBtn.nextSibling);
        this.captureBaselineBtn = captureBaselineBtn;
        this.captureBaselineBtn.addEventListener('click', () => this.captureBaseline());

        this.sensitivitySlider.addEventListener('input', (e) => {
            this.sensitivity = parseInt(e.target.value);
            this.updateSensitivityDisplay();
        });

        // Add cooldown slider
        const cooldownContainer = document.createElement('div');
        cooldownContainer.className = 'flex items-center justify-center gap-4 mb-4';
        cooldownContainer.innerHTML = `
            <label for="cooldown" class="text-white font-medium">Cooldown (ms):</label>
            <input type="range" id="cooldown" min="500" max="3000" value="1000" class="w-32">
            <span id="cooldownValue" class="text-white font-medium w-12">1000</span>
        `;

        // Insert after sensitivity control
        const sensitivityContainer = this.sensitivitySlider.closest('.flex');
        sensitivityContainer.parentNode.insertBefore(cooldownContainer, sensitivityContainer.nextSibling);

        this.cooldownSlider = document.getElementById('cooldown');
        this.cooldownValue = document.getElementById('cooldownValue');

        this.cooldownSlider.addEventListener('input', (e) => {
            this.cooldownTime = parseInt(e.target.value);
            this.cooldownValue.textContent = this.cooldownTime;
        });

        // Mouse events for selection
        this.videoContainer.addEventListener('mousedown', (e) => this.startSelection(e));
        this.videoContainer.addEventListener('mousemove', (e) => this.updateSelection(e));
        this.videoContainer.addEventListener('mouseup', (e) => this.endSelection(e));
        this.videoContainer.addEventListener('mouseleave', (e) => this.endSelection(e));

        // Video loaded event
        this.video.addEventListener('loadedmetadata', () => {
            this.setupCanvas();
        });
    }

    async startCamera() {
        try {
            this.updateStatus('Requesting camera access...');

            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            this.video.srcObject = this.stream;
            this.startBtn.textContent = 'Camera Active';
            this.startBtn.disabled = true;
            this.updateStatus('Camera active. Select an area to monitor.');

        } catch (error) {
            console.error('Camera access error:', error);
            this.updateStatus('Camera access denied or not available', 'error');
        }
    }

    setupCanvas() {
        const rect = this.video.getBoundingClientRect();
        this.overlay.width = this.video.videoWidth;
        this.overlay.height = this.video.videoHeight;
        this.overlay.style.width = '100%';
        this.overlay.style.height = 'auto';

        this.hiddenCanvas.width = this.video.videoWidth;
        this.hiddenCanvas.height = this.video.videoHeight;
    }

    startSelection(e) {
        if (!this.stream) return;

        const rect = this.videoContainer.getBoundingClientRect();
        const scaleX = this.video.videoWidth / rect.width;
        const scaleY = this.video.videoHeight / rect.height;

        this.isSelecting = true;
        this.selectionStart = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };

        this.stopDetection();
        this.videoContainer.classList.add('selecting');
    }

    updateSelection(e) {
        if (!this.isSelecting) return;

        const rect = this.videoContainer.getBoundingClientRect();
        const scaleX = this.video.videoWidth / rect.width;
        const scaleY = this.video.videoHeight / rect.height;

        const currentX = (e.clientX - rect.left) * scaleX;
        const currentY = (e.clientY - rect.top) * scaleY;

        let width = Math.abs(currentX - this.selectionStart.x);
        let height = Math.abs(currentY - this.selectionStart.y);

        // Limit selection size
        width = Math.min(width, this.MAX_SELECTION_SIZE);
        height = Math.min(height, this.MAX_SELECTION_SIZE);

        const x = Math.min(this.selectionStart.x, currentX);
        const y = Math.min(this.selectionStart.y, currentY);

        this.drawSelection(x, y, width, height);
    }

    endSelection(e) {
        if (!this.isSelecting) return;

        this.isSelecting = false;
        this.videoContainer.classList.remove('selecting');

        const rect = this.videoContainer.getBoundingClientRect();
        const scaleX = this.video.videoWidth / rect.width;
        const scaleY = this.video.videoHeight / rect.height;

        const currentX = (e.clientX - rect.left) * scaleX;
        const currentY = (e.clientY - rect.top) * scaleY;

        let width = Math.abs(currentX - this.selectionStart.x);
        let height = Math.abs(currentY - this.selectionStart.y);

        // Minimum selection size
        if (width < 20 || height < 20) {
            this.clearSelection();
            this.updateStatus('Selection too small. Try again.');
            return;
        }

        // Limit selection size
        width = Math.min(width, this.MAX_SELECTION_SIZE);
        height = Math.min(height, this.MAX_SELECTION_SIZE);

        const x = Math.min(this.selectionStart.x, currentX);
        const y = Math.min(this.selectionStart.y, currentY);

        this.selectionArea = { x, y, width, height };
        this.showSelectionBox(x, y, width, height);

        this.resetBtn.disabled = false;
        this.captureBaselineBtn.disabled = false;
        this.updateStatus('Area selected. Click "Set Background" to capture baseline, then start monitoring.', 'waiting');
    }

    drawSelection(x, y, width, height) {
        const ctx = this.overlay.getContext('2d');
        ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(x, y, width, height);
    }

    showSelectionBox(x, y, width, height) {
        const rect = this.videoContainer.getBoundingClientRect();
        const scaleX = rect.width / this.video.videoWidth;
        const scaleY = rect.height / this.video.videoHeight;

        this.selectionBox.style.left = `${x * scaleX}px`;
        this.selectionBox.style.top = `${y * scaleY}px`;
        this.selectionBox.style.width = `${width * scaleX}px`;
        this.selectionBox.style.height = `${height * scaleY}px`;
        this.selectionBox.classList.remove('hidden');

        // Clear overlay
        const ctx = this.overlay.getContext('2d');
        ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
    }

    captureBaseline() {
        if (!this.selectionArea || !this.stream) return;

        const ctx = this.hiddenCanvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0, this.hiddenCanvas.width, this.hiddenCanvas.height);

        const { x, y, width, height } = this.selectionArea;
        const imageData = ctx.getImageData(x, y, width, height);

        this.baselineColor = this.calculateAverageColor(imageData);
        this.captureBaselineBtn.textContent = 'Background Set ✓';
        this.captureBaselineBtn.disabled = true;

        this.startDetection();
        this.updateStatus('Background captured. Monitoring for objects...', 'detecting');
    }

    clearSelection() {
        this.selectionBox.classList.add('hidden');
        const ctx = this.overlay.getContext('2d');
        ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
    }

    startDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
        }

        this.isDetecting = true;
        this.previousColorData = null;
        this.isObjectPresent = false;
        this.lastDetectionTime = 0;

        // Check every 100ms for more responsive detection
        this.detectionInterval = setInterval(() => {
            this.detectColorChange();
        }, 100);
    }

    stopDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        this.isDetecting = false;
    }

    detectColorChange() {
        if (!this.selectionArea || !this.stream || !this.baselineColor) return;

        const ctx = this.hiddenCanvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0, this.hiddenCanvas.width, this.hiddenCanvas.height);

        const { x, y, width, height } = this.selectionArea;
        const imageData = ctx.getImageData(x, y, width, height);

        // Calculate average color
        const currentColor = this.calculateAverageColor(imageData);

        // Calculate difference from baseline (background)
        const baselineDifference = this.calculateColorDifference(this.baselineColor, currentColor);

        const currentTime = Date.now();
        const timeSinceLastDetection = currentTime - this.lastDetectionTime;

        // Check if cooldown period has passed
        if (timeSinceLastDetection < this.cooldownTime) {
            return;
        }

        // Determine if object is present based on difference from baseline
        const objectPresent = baselineDifference > this.sensitivity;

        // Only count when object enters the area (transition from background to object)
        if (objectPresent && !this.isObjectPresent) {
            this.incrementCounter();
            this.lastDetectionTime = currentTime;
            this.updateStatus(`Object detected! Baseline diff: ${baselineDifference.toFixed(1)}`, 'detecting');
        }

        // Update object presence state
        this.isObjectPresent = objectPresent;

        // Update status based on current state
        if (!objectPresent && timeSinceLastDetection > this.cooldownTime) {
            this.updateStatus(`Monitoring... (Baseline diff: ${baselineDifference.toFixed(1)})`, 'waiting');
        }
    }

    calculateAverageColor(imageData) {
        const data = imageData.data;
        let r = 0,
            g = 0,
            b = 0;
        const pixelCount = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
        }

        return {
            r: r / pixelCount,
            g: g / pixelCount,
            b: b / pixelCount
        };
    }

    calculateColorDifference(color1, color2) {
        // Using Euclidean distance in RGB color space
        const rDiff = color1.r - color2.r;
        const gDiff = color1.g - color2.g;
        const bDiff = color1.b - color2.b;

        return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
    }

    incrementCounter() {
        this.count++;
        this.counter.textContent = this.count;

        // Animation effect
        this.counter.classList.add('updated');
        setTimeout(() => {
            this.counter.classList.remove('updated');
        }, 300);
    }

    resetSelection() {
        this.stopDetection();
        this.clearSelection();
        this.selectionArea = null;
        this.baselineColor = null;
        this.previousColorData = null;
        this.isObjectPresent = false;
        this.resetBtn.disabled = true;
        this.captureBaselineBtn.disabled = true;
        this.captureBaselineBtn.textContent = 'Set Background';
        this.updateStatus('Selection cleared. Select a new area to monitor.');
    }

    resetCounter() {
        this.count = 0;
        this.counter.textContent = this.count;
        this.updateStatus('Counter reset.');
    }

    updateSensitivityDisplay() {
        this.sensitivityValue.textContent = this.sensitivity;
    }

    updateStatus(message, type = 'normal') {
        this.status.textContent = message;
        this.status.className = 'text-sm';

        switch (type) {
            case 'detecting':
                this.status.classList.add('status-detecting');
                break;
            case 'waiting':
                this.status.classList.add('status-waiting');
                break;
            case 'error':
                this.status.classList.add('status-error');
                break;
            default:
                this.status.classList.add('text-gray-400');
        }
    }

    // Cleanup method
    destroy() {
        this.stopDetection();
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const itemCounter = new ItemCounter();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        itemCounter.destroy();
    });
});