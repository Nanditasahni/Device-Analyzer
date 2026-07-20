/* ==========================================================================
   Device Analyzer - Browser Compatibility Module
   ========================================================================== */

import { setElementText } from '../utils.js';

/**
 * Initialize and update Browser Compatibility scores.
 */
export function initCompatibility() {
    updateCompatibilityInfo();
}

/**
 * Evaluate support for 8 major HTML5 APIs, calculate coverage, update progress ring and recommendations.
 */
export function updateCompatibilityInfo() {
    const checks = {
        geolocation: 'geolocation' in navigator,
        notifications: 'Notification' in window,
        clipboard: 'clipboard' in navigator && typeof navigator.clipboard.writeText === 'function',
        motion: 'DeviceMotionEvent' in window || 'DeviceOrientationEvent' in window,
        webrtc: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        serviceworker: 'serviceWorker' in navigator,
        webgl: checkWebGLSupport(),
        storageEstimate: 'storage' in navigator && typeof navigator.storage.estimate === 'function'
    };

    const total = Object.keys(checks).length;
    const supportedList = Object.keys(checks).filter(k => checks[k]);
    const supportedCount = supportedList.length;
    const unsupportedCount = total - supportedCount;

    const percentage = Math.round((supportedCount / total) * 100);

    // Update UI labels
    setElementText('compat-supported', `${supportedCount} / ${total}`);
    setElementText('compat-unsupported', `${unsupportedCount}`);
    setElementText('compatibility-score', `${percentage}%`);

    // Animate circular progress ring
    const ring = document.getElementById('compatibility-ring');
    if (ring) {
        const radius = 40;
        const circumference = 2 * Math.PI * radius; // 251.2
        const offset = circumference - (percentage / 100) * circumference;
        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = offset;
    }

    // Set Recommendations
    const recText = document.getElementById('compat-recommendation');
    if (recText) {
        if (percentage === 100) {
            recText.textContent = 'Excellent! Your browser supports all modern diagnostics sensor arrays.';
        } else if (percentage >= 75) {
            const unsupportedList = Object.keys(checks).filter(k => !checks[k]);
            recText.textContent = `Good compatibility. Missing support for: ${unsupportedList.join(', ')}.`;
        } else {
            recText.textContent = 'Degraded compatibility. Consider upgrading your browser or enabling secure HTTPS access.';
        }
    }

    // Save diagnostics
    window.deviceDiagnostics = window.deviceDiagnostics || {};
    window.deviceDiagnostics.compatibility = {
        score: percentage,
        totalChecks: total,
        supportedCount,
        unsupportedCount,
        details: checks
    };
}

/**
 * Perform a quick off-screen check for WebGL rendering support.
 * @returns {boolean} True if WebGL is supported.
 */
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}
