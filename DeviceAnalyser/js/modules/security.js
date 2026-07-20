/* ==========================================================================
   Device Analyzer - Security & Privacy Module
   ========================================================================== */

import { setElementBadge } from '../utils.js';

/**
 * Initialize and execute Security Audits.
 */
export async function initSecurity() {
    await runSecurityCheck();
}

/**
 * Perform all privacy and security heuristic checks and update UI.
 */
export async function runSecurityCheck() {
    // 1. HTTPS Check
    const isHttps = window.location.protocol === 'https:' || window.isSecureContext;
    updateSecurityItem('sec-https', isHttps ? 'Secure' : 'Unsecure', isHttps ? 'success' : 'danger');

    // 2. Cookie Support
    const cookiesOn = navigator.cookieEnabled;
    updateSecurityItem('sec-cookies', cookiesOn ? 'Active' : 'Disabled', cookiesOn ? 'success' : 'warning');

    // 3. Do Not Track (DNT)
    const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    const dntActive = (dnt === '1' || dnt === 'yes');
    updateSecurityItem('sec-dnt', dntActive ? 'Enabled' : 'Disabled', dntActive ? 'success' : 'default');

    // 4. AdBlocker Heuristic
    const adBlockerActive = await detectAdBlocker();
    updateSecurityItem('sec-adblock', adBlockerActive ? 'Detected' : 'Not Found', adBlockerActive ? 'warning' : 'success');

    // 5. Private Browsing Heuristic
    const isPrivate = await detectPrivateBrowsing();
    updateSecurityItem('sec-incognito', isPrivate ? 'Incognito' : 'Standard', isPrivate ? 'warning' : 'success');

    // Save diagnostics
    window.deviceDiagnostics = window.deviceDiagnostics || {};
    window.deviceDiagnostics.security = {
        httpsConnection: isHttps,
        cookiesProtection: cookiesOn,
        doNotTrack: dntActive,
        adBlockerActive,
        incognitoMode: isPrivate
    };
}

/**
 * Helper to update badge content, color status, and icon colors.
 * @param {string} baseId - ID prefix of elements.
 * @param {string} text - Badge text value.
 * @param {'success' | 'warning' | 'danger' | 'default'} status - Color state.
 */
function updateSecurityItem(baseId, text, status) {
    setElementBadge(`${baseId}-badge`, text, status);
    
    const icon = document.getElementById(`${baseId}-icon`);
    if (icon) {
        icon.className = icon.className.replace(/\btext-\w+\b/g, ''); // Clear color classes
        if (status === 'success') {
            icon.style.color = 'var(--success)';
        } else if (status === 'warning' || status === 'danger') {
            icon.style.color = 'var(--danger)';
        } else {
            icon.style.color = 'var(--text-muted)';
        }
    }
}

/**
 * Attempt to fetch a script blocked by typical adblock lists to test if an AdBlocker is active.
 * @returns {Promise<boolean>} True if blocked.
 */
async function detectAdBlocker() {
    // Standard Google Ads snippet URL known to be aggressively blocked
    const testUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    try {
        const response = await fetch(new Request(testUrl, { method: 'HEAD', mode: 'no-cors' }));
        return false; // Request succeeded, probably no AdBlocker active
    } catch (e) {
        return true; // Fetch error, likely blocked by extension
    }
}

/**
 * Heuristics to identify private browsing/incognito sessions.
 * @returns {Promise<boolean>} True if private.
 */
async function detectPrivateBrowsing() {
    // Heuristic 1: Check storage quota limits (Chrome/Safari/Firefox private limit storage heavily)
    if (navigator.storage && navigator.storage.estimate) {
        try {
            const estimate = await navigator.storage.estimate();
            // In Chrome Incognito, storage quota is usually less than 120MB (frequently ~100MB or lower depending on device)
            // whereas standard sessions get gigabytes of storage space.
            const quotaMb = estimate.quota / (1024 * 1024);
            if (quotaMb > 0 && quotaMb < 120) {
                return true;
            }
        } catch (e) {
            // Ignore storage estimate failure
        }
    }

    // Heuristic 2: Try using temporary filesystem API (legacy Webkit)
    const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
    if (fs) {
        return new Promise((resolve) => {
            fs(window.TEMPORARY, 100, () => resolve(false), () => resolve(true));
        });
    }

    return false;
}
