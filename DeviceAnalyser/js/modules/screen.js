/* ==========================================================================
   Device Analyzer - Screen Module
   ========================================================================== */

import { setElementText, setElementBadge } from '../utils.js';

/**
 * Initialize Screen diagnostic listeners.
 */
export function initScreen() {
    updateScreenInfo();

    // Listen to orientation change events
    if (screen.orientation) {
        screen.orientation.addEventListener('change', updateScreenInfo);
    } else {
        // Fallback for older browsers
        window.addEventListener('resize', updateScreenInfo);
    }
}

/**
 * Gather and render screen, display, and orientation specifications.
 */
export function updateScreenInfo() {
    const width = window.screen.width;
    const height = window.screen.height;
    const resolution = `${width} x ${height}`;

    const availWidth = window.screen.availWidth;
    const availHeight = window.screen.availHeight;
    const available = `${availWidth} x ${availHeight}`;

    const dpr = window.devicePixelRatio || 1;
    const colorDepth = `${window.screen.colorDepth}-bit`;

    // Fetch Orientation
    let orientationType = 'Unknown';
    if (screen.orientation && screen.orientation.type) {
        orientationType = screen.orientation.type;
    } else if (window.orientation !== undefined) {
        orientationType = Math.abs(window.orientation) === 90 ? 'landscape' : 'portrait';
    } else {
        orientationType = width > height ? 'landscape-primary' : 'portrait-primary';
    }

    // Format orientation label nicely (e.g. landscape-primary -> Landscape)
    const formattedOrientation = orientationType
        .split('-')[0]
        .replace(/^\w/, (c) => c.toUpperCase());

    // Render to DOM
    setElementText('screen-resolution', resolution);
    setElementText('screen-available', available);
    setElementText('screen-dpr', `${dpr.toFixed(1)}x`);
    setElementText('screen-color-depth', colorDepth);
    setElementBadge('screen-orientation', formattedOrientation, 'info');

    // Save diagnostics
    window.deviceDiagnostics = window.deviceDiagnostics || {};
    window.deviceDiagnostics.screen = {
        resolution,
        availableSize: available,
        devicePixelRatio: dpr,
        colorDepth: window.screen.colorDepth,
        orientation: orientationType
    };
}
