/* ==========================================================================
   Device Analyzer - Device & Hardware Module
   ========================================================================== */

import { setElementText, setElementBadge } from '../utils.js';

/**
 * Initialize and update Device diagnostics.
 */
export function initDevice() {
    updateDeviceInfo();
}

/**
 * Gather and render device and hardware details.
 */
export function updateDeviceInfo() {
    const ua = navigator.userAgent;
    
    // Detect OS
    const os = parseOS(ua);

    // Platform
    const platform = navigator.platform || 'Unknown';

    // CPU Cores
    const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : 'Not Supported';

    // RAM (Device Memory)
    const ramVal = navigator.deviceMemory;
    const ram = ramVal ? `${ramVal} GB` : 'Not Supported';

    // Touch Support
    const touchSupport = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const maxTouchPoints = navigator.maxTouchPoints || 0;

    // Render to Card
    setElementText('device-os', os);
    setElementText('device-platform', platform);
    setElementText('device-cores', cores);
    setElementText('device-ram', ram);
    
    setElementBadge('device-touch', touchSupport ? 'Supported' : 'No Touch Support', touchSupport ? 'success' : 'warning');
    setElementText('device-touch-points', maxTouchPoints);

    // Update Quick Status Bar Specs
    const quickSpecs = document.getElementById('quick-specs');
    if (quickSpecs) {
        const specsText = `${cores.replace(' Cores', 'C')} / ${ramVal ? ramVal + 'G RAM' : 'No RAM Info'}`;
        quickSpecs.textContent = specsText;
        quickSpecs.classList.remove('loading-skeleton-text');
    }

    // Save diagnostics
    window.deviceDiagnostics = window.deviceDiagnostics || {};
    window.deviceDiagnostics.device = {
        operatingSystem: os,
        platform,
        cpuCores: navigator.hardwareConcurrency || 'Unknown',
        ram: ramVal ? `${ramVal} GB` : 'Unknown',
        touchSupport,
        maxTouchPoints
    };
}

/**
 * Parses user agent string to extract Operating System name.
 * @param {string} ua - Navigator User Agent.
 * @returns {string} Operating system string name.
 */
function parseOS(ua) {
    if (/Windows NT 10.0/.test(ua)) return 'Windows 10/11';
    if (/Windows NT 6.3/.test(ua)) return 'Windows 8.1';
    if (/Windows NT 6.2/.test(ua)) return 'Windows 8';
    if (/Windows NT 6.1/.test(ua)) return 'Windows 7';
    if (/Android/.test(ua)) {
        const androidMatch = ua.match(/Android\s([0-9\.]+)/);
        return androidMatch ? `Android ${androidMatch[1]}` : 'Android';
    }
    if (/iPhone|iPad|iPod/.test(ua)) {
        const iOSMatch = ua.match(/OS\s([0-9_]+)/);
        return iOSMatch ? `iOS ${iOSMatch[1].replace(/_/g, '.')}` : 'iOS';
    }
    if (/Macintosh|Mac OS X/.test(ua)) {
        const macMatch = ua.match(/Mac OS X\s([0-9_]+)/);
        return macMatch ? `macOS ${macMatch[1].replace(/_/g, '.')}` : 'macOS';
    }
    if (/Linux/.test(ua)) return 'Linux';
    if (/CrOS/.test(ua)) return 'ChromeOS';
    
    return 'Unknown OS';
}
