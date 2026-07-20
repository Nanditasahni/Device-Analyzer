/* ==========================================================================
   Device Analyzer - Fullscreen Module
   ========================================================================== */

import { showToast, setElementBadge } from '../utils.js';

/**
 * Initialize Fullscreen mode features.
 */
export function initFullscreen() {
    const fsBtn = document.getElementById('fullscreen-btn');
    if (fsBtn) {
        fsBtn.addEventListener('click', toggleFullscreen);
    }

    // Bind event listeners for screen transitions
    document.addEventListener('fullscreenchange', updateFullscreenUI);
    document.addEventListener('webkitfullscreenchange', updateFullscreenUI);
    document.addEventListener('mozfullscreenchange', updateFullscreenUI);
    document.addEventListener('MSFullscreenChange', updateFullscreenUI);

    updateFullscreenUI();
}

/**
 * Reads document state and updates button tags.
 */
function updateFullscreenUI() {
    const fsBtn = document.getElementById('fullscreen-btn');
    const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    );

    // Update UI badge
    setElementBadge('fs-status', isFullscreen ? 'Active' : 'Inactive', isFullscreen ? 'success' : 'default');

    // Update button text
    if (fsBtn) {
        fsBtn.textContent = isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen';
        if (isFullscreen) {
            fsBtn.classList.remove('primary-btn');
            fsBtn.classList.add('secondary-btn');
        } else {
            fsBtn.classList.add('primary-btn');
            fsBtn.classList.remove('secondary-btn');
        }
    }

    // Save diagnostics
    window.deviceDiagnostics = window.deviceDiagnostics || {};
    window.deviceDiagnostics.fullscreen = {
        supported: document.fullscreenEnabled || false,
        active: isFullscreen
    };
}

/**
 * Request entrance/exit of target document fullscreen canvas.
 */
async function toggleFullscreen() {
    if (!document.fullscreenEnabled) {
        showToast('Fullscreen mode is not supported by your browser.', 'error');
        return;
    }

    const isFullscreen = !!document.fullscreenElement;

    try {
        if (!isFullscreen) {
            await document.documentElement.requestFullscreen();
            showToast('Entered Fullscreen Mode', 'success');
        } else {
            await document.exitFullscreen();
            showToast('Exited Fullscreen Mode', 'info');
        }
    } catch (err) {
        console.error('Fullscreen request rejected:', err);
        showToast('Failed to toggle fullscreen. User interaction required.', 'error');
    }
}
