/* ==========================================================================
   Device Analyzer - Browser Information Module
   ========================================================================== */

import { setElementText, setElementBadge } from '../utils.js';

/**
 * Initialize and update Browser diagnostics.
 */
export function initBrowser() {
    updateBrowserInfo();
    
    // Listen to online / offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}

/**
 * Gather and render all browser diagnostic data.
 */
export function updateBrowserInfo() {
    const ua = navigator.userAgent;
    const { name, version } = parseUserAgent(ua);
    
    // Cookie support
    const cookiesEnabled = navigator.cookieEnabled;
    
    // Online Status
    const isOnline = navigator.onLine;

    // Vendor and Platform
    const vendor = navigator.vendor || 'Unknown';
    const lang = navigator.language || 'Unknown';

    // Render to UI
    setElementText('browser-name', name);
    setElementText('browser-version', version);
    setElementText('browser-lang', lang);
    
    setElementBadge('browser-cookies', cookiesEnabled ? 'Enabled' : 'Disabled', cookiesEnabled ? 'success' : 'danger');
    setElementBadge('browser-js', 'Enabled', 'success');
    
    updateOnlineStatus();

    // User Agent collapsible section
    const uaTextEl = document.querySelector('#browser-ua .ua-text');
    if (uaTextEl) {
        uaTextEl.textContent = ua;
    }

    // Save diagnostics
    window.deviceDiagnostics = window.deviceDiagnostics || {};
    window.deviceDiagnostics.browser = {
        name,
        version,
        language: lang,
        cookiesEnabled,
        javaScriptEnabled: true,
        online: isOnline,
        vendor,
        userAgent: ua
    };
}

/**
 * Update the online/offline indicators on change.
 */
function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    setElementBadge('browser-online', isOnline ? 'Online' : 'Offline', isOnline ? 'success' : 'danger');
    
    const quickNetwork = document.getElementById('quick-network');
    if (quickNetwork) {
        quickNetwork.textContent = isOnline ? 'Online' : 'Offline';
        quickNetwork.className = 'status-value ' + (isOnline ? 'success-text' : 'danger-text');
    }
    
    if (window.deviceDiagnostics && window.deviceDiagnostics.browser) {
        window.deviceDiagnostics.browser.online = isOnline;
    }
}

/**
 * Parse the User Agent string to extract Browser Name and Major Version.
 * @param {string} ua - Navigator User Agent.
 * @returns {{name: string, version: string}} Object with name and version.
 */
function parseUserAgent(ua) {
    let name = 'Unknown';
    let version = 'Unknown';
    
    // Safari, Chrome, Firefox, Edge, Opera, IE detection
    if (/OPR\/(\d+)/.test(ua)) {
        name = 'Opera';
        version = ua.match(/OPR\/(\d+)/)[1];
    } else if (/Edg\/(\d+)/.test(ua)) {
        name = 'Microsoft Edge';
        version = ua.match(/Edg\/(\d+)/)[1];
    } else if (/Chrome\/(\d+)/.test(ua)) {
        name = 'Google Chrome';
        version = ua.match(/Chrome\/(\d+)/)[1];
    } else if (/Firefox\/(\d+)/.test(ua)) {
        name = 'Mozilla Firefox';
        version = ua.match(/Firefox\/(\d+)/)[1];
    } else if (/MSIE (\d+)/.test(ua) || /rv:(\d+)/.test(ua)) {
        name = 'Internet Explorer';
        version = ua.match(/MSIE (\d+)/) ? ua.match(/MSIE (\d+)/)[1] : ua.match(/rv:(\d+)/)[1];
    } else if (/Safari\/(\d+)/.test(ua) && !/Chrome/.test(ua)) {
        name = 'Safari';
        version = ua.match(/Version\/(\d+)/) ? ua.match(/Version\/(\d+)/)[1] : 'Unknown';
    }
    
    return { name, version };
}
