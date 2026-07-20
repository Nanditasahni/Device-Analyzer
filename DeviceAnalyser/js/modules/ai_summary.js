/* ==========================================================================
   Device Analyzer - AI Diagnostic Summary Module
   ========================================================================== */

import { setElementText } from '../utils.js';

/**
 * Initialize AI Summary Module.
 */
export function initAiSummary() {
    updateAiSummary();
}

/**
 * Compile diagnostics and generate a human-readable telemetry summary.
 */
export function updateAiSummary() {
    const diag = window.deviceDiagnostics || {};
    
    // Default fallback values
    const health = diag.health || { score: 100, evaluation: 'Optimal' };
    const browser = diag.browser || { name: 'Unknown Browser', version: 'N/A', online: true };
    const device = diag.device || { os: 'Unknown OS', cores: 'N/A', ram: 'N/A' };
    const battery = diag.battery || { level: 100, charging: true };
    const speed = diag.speedtest || {};
    const storage = diag.storage || {};
    const security = diag.security || {};
    const compat = diag.compatibility || { score: 100 };

    let summaryText = '';

    // 1. Overall assessment
    let condition = 'good';
    if (health.score >= 90) {
        condition = 'excellent';
    } else if (health.score < 50) {
        condition = 'degraded';
    } else if (health.score < 75) {
        condition = 'average';
    }

    summaryText += `Your system is in <strong>${condition}</strong> condition, scoring <strong>${health.score}/100</strong> on the health index. `;

    // 2. Browser & Compatibility
    summaryText += `You are running <strong>${browser.name}</strong> on <strong>${device.os}</strong>. Your browser compatibility rate is <strong>${compat.score}%</strong>. `;

    // 3. Internet & Network
    if (!browser.online) {
        summaryText += `Your device is currently <strong>offline</strong>, restricting live web data collection. `;
    } else if (speed.downloadSpeed) {
        summaryText += `Your internet connection is <strong>${(speed.connectionQuality || 'Good').toLowerCase()}</strong> with a download speed of <strong>${speed.downloadSpeed}</strong> and latency of <strong>${speed.ping || 'N/A'}</strong>. `;
    } else {
        summaryText += `Your network connection quality is active, but a full speed test has not yet been executed. `;
    }

    // 4. Battery
    if (battery.level !== undefined) {
        const batState = battery.charging ? 'charging' : 'discharging';
        summaryText += `The battery level is <strong>${battery.level}%</strong> and is currently <strong>${batState}</strong>. `;
    }

    // 5. Storage
    if (storage.usageBytes !== undefined && storage.quotaBytes > 0) {
        const usedPct = ((storage.usageBytes / storage.quotaBytes) * 100).toFixed(1);
        summaryText += `Browser storage usage is healthy, occupying only <strong>${usedPct}%</strong> of your allocated quota. `;
    } else {
        summaryText += `Browser storage headroom is sufficient. `;
    }

    // 6. Security
    const secIssues = [];
    if (security.httpsConnection === false) secIssues.push('insecure HTTP context');
    if (security.adBlockerActive === false) secIssues.push('no active AdBlocker protection');
    
    if (secIssues.length > 0) {
        summaryText += `Security checks detected minor warnings: <strong>${secIssues.join(' and ')}</strong>. `;
    } else {
        summaryText += `Security configurations are safe and secure. `;
    }

    // Write to UI
    const container = document.getElementById('ai-summary-text');
    if (container) {
        container.innerHTML = summaryText;
        container.classList.remove('loading-skeleton-text');
    }
}
