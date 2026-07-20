/* ==========================================================================
   Device Analyzer - Network Diagnostics Module
   ========================================================================== */

import { setElementText, setElementBadge } from '../utils.js';

let networkListenerAttached = false;

/**
 * Initialize Network telemetry diagnostics.
 */
export function initNetwork() {
    const conn = getConnectionObject();
    
    if (!conn) {
        handleNetworkUnsupported();
        return;
    }

    updateNetworkInfo(conn);

    if (!networkListenerAttached) {
        conn.addEventListener('change', () => updateNetworkInfo(conn));
        networkListenerAttached = true;
    }
}

/**
 * Resolves standard vendor prefix variations for the connection API.
 * @returns {object | null} Connection manager object.
 */
function getConnectionObject() {
    return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
}

/**
 * Extract connection features and write them to the UI.
 * @param {object} conn - Connection API instance.
 */
function updateNetworkInfo(conn) {
    const type = conn.type || 'Unknown';
    const effectiveType = conn.effectiveType || 'N/A';
    const downlink = conn.downlink ? `${conn.downlink} Mbps` : 'N/A';
    const rtt = conn.rtt ? `${conn.rtt} ms` : 'N/A';
    const saveData = conn.saveData !== undefined ? (conn.saveData ? 'On' : 'Off') : 'N/A';

    // Badge styling for effective network class
    let badgeClass = 'info';
    if (effectiveType === '4g') badgeClass = 'success';
    else if (effectiveType === '3g') badgeClass = 'warning';
    else if (effectiveType === '2g' || effectiveType === 'slow-2g') badgeClass = 'danger';

    // Render to Card UI
    setElementBadge('network-type', type.toUpperCase(), 'info');
    setElementText('network-effective', effectiveType.toUpperCase());
    setElementText('network-downlink', downlink);
    setElementText('network-rtt', rtt);
    setElementBadge('network-saver', saveData, saveData === 'On' ? 'warning' : 'default');

    // Update Quick Status Bar Network Speed
    const quickNetwork = document.getElementById('quick-network');
    if (quickNetwork) {
        const isOnline = navigator.onLine;
        if (isOnline) {
            quickNetwork.textContent = `${effectiveType.toUpperCase()} (${downlink})`;
        } else {
            quickNetwork.textContent = 'Offline';
        }
        quickNetwork.classList.remove('loading-skeleton-text');
    }

    // Save diagnostics
    window.deviceDiagnostics = window.deviceDiagnostics || {};
    window.deviceDiagnostics.network = {
        connectionType: type,
        effectiveType,
        downlinkSpeed: downlink,
        rtt,
        saveDataMode: saveData
    };
}

/**
 * Handles graceful degradation if network diagnostics are unsupported.
 */
function handleNetworkUnsupported() {
    setElementBadge('network-type', 'UNSUPPORTED', 'danger');
    setElementText('network-effective', 'N/A');
    setElementText('network-downlink', 'N/A');
    setElementText('network-rtt', 'N/A');
    setElementBadge('network-saver', 'N/A', 'default');

    const quickNetwork = document.getElementById('quick-network');
    if (quickNetwork) {
        quickNetwork.textContent = navigator.onLine ? 'Online' : 'Offline';
        quickNetwork.classList.remove('loading-skeleton-text');
    }

    // Save diagnostics
    window.deviceDiagnostics = window.deviceDiagnostics || {};
    window.deviceDiagnostics.network = {
        connectionType: 'Unsupported',
        effectiveType: 'Unsupported',
        downlinkSpeed: 'Unsupported',
        rtt: 'Unsupported',
        saveDataMode: 'Unsupported'
    };
}
