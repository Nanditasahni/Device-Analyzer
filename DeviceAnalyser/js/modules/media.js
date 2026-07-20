/* ==========================================================================
   Device Analyzer - Camera & Mic Module
   ========================================================================== */

import { showToast, setElementBadge } from '../utils.js';

let activeStream = null;

/**
 * Initialize Camera/Mic checkers.
 */
export function initMedia() {
    checkMediaAvailability();

    const testBtn = document.getElementById('test-media-btn');
    const stopBtn = document.getElementById('stop-media-btn');

    if (testBtn) {
        testBtn.addEventListener('click', startMediaStream);
    }
    if (stopBtn) {
        stopBtn.addEventListener('click', stopMediaStream);
    }
}

/**
 * Query connected hardware input devices without requesting stream permissions.
 */
async function checkMediaAvailability() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setElementBadge('media-cam-status', 'Unsupported', 'danger');
        setElementBadge('media-mic-status', 'Unsupported', 'danger');
        return;
    }

    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideo = devices.some(device => device.kind === 'videoinput');
        const hasAudio = devices.some(device => device.kind === 'audioinput');

        setElementBadge('media-cam-status', hasVideo ? 'Attached' : 'None Found', hasVideo ? 'info' : 'warning');
        setElementBadge('media-mic-status', hasAudio ? 'Attached' : 'None Found', hasAudio ? 'info' : 'warning');

        // Save diagnostics
        window.deviceDiagnostics = window.deviceDiagnostics || {};
        window.deviceDiagnostics.media = {
            cameraConnected: hasVideo,
            microphoneConnected: hasAudio,
            cameraActive: false,
            microphoneActive: false
        };
    } catch (err) {
        console.error('Failed to enumerate devices:', err);
    }
}

/**
 * Prompts user for camera and microphone inputs and renders video preview.
 */
async function startMediaStream() {
    const videoEl = document.getElementById('webcam-preview');
    const previewContainer = document.querySelector('.camera-preview-container');
    const testBtn = document.getElementById('test-media-btn');
    const stopBtn = document.getElementById('stop-media-btn');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('Webcam access API is unsupported in this environment.', 'error');
        return;
    }

    try {
        // Request both audio and video
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        activeStream = stream;
        
        // Link stream to video player
        if (videoEl) {
            videoEl.srcObject = stream;
        }

        // Toggle UI blocks
        if (previewContainer) previewContainer.style.display = 'block';
        if (testBtn) testBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'inline-flex';

        setElementBadge('media-cam-status', 'Active Feed', 'success');
        setElementBadge('media-mic-status', 'Active Feed', 'success');

        // Save diagnostics
        if (window.deviceDiagnostics && window.deviceDiagnostics.media) {
            window.deviceDiagnostics.media.cameraActive = true;
            window.deviceDiagnostics.media.microphoneActive = true;
        }

        showToast('Camera and Microphone feed started.', 'success');

    } catch (err) {
        console.warn('Camera + Mic request failed. Retrying video-only.', err);
        
        try {
            // Retry request with video only
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            activeStream = stream;

            if (videoEl) {
                videoEl.srcObject = stream;
            }

            if (previewContainer) previewContainer.style.display = 'block';
            if (testBtn) testBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'inline-flex';

            setElementBadge('media-cam-status', 'Active Feed', 'success');
            setElementBadge('media-mic-status', 'Denied / None', 'danger');

            if (window.deviceDiagnostics && window.deviceDiagnostics.media) {
                window.deviceDiagnostics.media.cameraActive = true;
                window.deviceDiagnostics.media.microphoneActive = false;
            }

            showToast('Camera feed active. Microphone access blocked.', 'warning');
        } catch (videoErr) {
            console.error('All media streams blocked:', videoErr);
            setElementBadge('media-cam-status', 'Access Denied', 'danger');
            setElementBadge('media-mic-status', 'Access Denied', 'danger');
            showToast('Permissions denied to access camera and microphone.', 'error');
        }
    }
}

/**
 * Terminates all running tracks on the stream.
 */
export function stopMediaStream() {
    const videoEl = document.getElementById('webcam-preview');
    const previewContainer = document.querySelector('.camera-preview-container');
    const testBtn = document.getElementById('test-media-btn');
    const stopBtn = document.getElementById('stop-media-btn');

    if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
        activeStream = null;
    }

    if (videoEl) {
        videoEl.srcObject = null;
    }

    if (previewContainer) previewContainer.style.display = 'none';
    if (testBtn) testBtn.style.display = 'inline-flex';
    if (stopBtn) stopBtn.style.display = 'none';

    // Refresh connected state badges
    checkMediaAvailability();
    showToast('Camera and microphone stream stopped.', 'info');
}
