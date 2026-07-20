/* ==========================================================================
   Device Analyzer - System Health Module
   ========================================================================== */

import { setElementText, setElementBadge } from '../utils.js';

/**
 * Initialize and update System Health ratings.
 */
export function initHealth() {
    updateSystemHealth();
}

/**
 * Evaluate system metrics, compute score, and update visual gauges.
 */
export function updateSystemHealth() {
    const diagnostics = window.deviceDiagnostics || {};
    
    // 1. Evaluate Performance Subscore (20% Weight)
    let perfScore = 100;
    const perf = diagnostics.performance;
    if (perf) {
        const loadMs = perf.loadTimeMs !== undefined ? perf.loadTimeMs : 
                       (perf.pageLoadTime && perf.pageLoadTime.includes('ms') ? parseFloat(perf.pageLoadTime) : parseFloat(perf.pageLoadTime) * 1000);
        const ttfbMs = perf.ttfbMs !== undefined ? perf.ttfbMs : 
                       (perf.timeToFirstByte && perf.timeToFirstByte.includes('ms') ? parseFloat(perf.timeToFirstByte) : parseFloat(perf.timeToFirstByte) * 1000);
        
        if (!isNaN(loadMs)) {
            if (loadMs > 3000) perfScore -= 40;
            else if (loadMs > 1500) perfScore -= 20;
        }
        if (!isNaN(ttfbMs)) {
            if (ttfbMs > 800) perfScore -= 30;
            else if (ttfbMs > 300) perfScore -= 15;
        }
    }
    perfScore = Math.max(10, perfScore);

    // 2. Evaluate Battery Subscore (20% Weight)
    let batScore = 100;
    const battery = diagnostics.battery;
    if (battery && battery.level !== undefined) {
        if (!battery.charging) {
            if (battery.level < 20) batScore = 40;
            else if (battery.level < 50) batScore = 70;
        }
    }

    // 3. Evaluate Storage Subscore (15% Weight)
    let storScore = 100;
    const storage = diagnostics.storage;
    if (storage && storage.usageBytes !== undefined && storage.quotaBytes !== undefined && storage.quotaBytes > 0) {
        const pctUsed = (storage.usageBytes / storage.quotaBytes) * 100;
        if (pctUsed > 90) storScore = 30;
        else if (pctUsed > 50) storScore = 75;
    }

    // 4. Evaluate Security Connection (20% Weight)
    let secScore = 0;
    const security = diagnostics.security;
    if (security) {
        if (security.httpsConnection) secScore += 30;
        if (security.cookiesProtection) secScore += 20;
        if (security.doNotTrack) secScore += 10;
        if (security.adBlockerActive) secScore += 20;
        if (!security.incognitoMode) secScore += 20;
        else secScore += 10; // Incognito mode gets minor private reward but loses cache persistence points
    } else {
        secScore = 100; // default if not run yet
    }
    secScore = Math.min(100, secScore);

    // 5. Evaluate Browser Compatibility (15% Weight)
    const compat = diagnostics.compatibility;
    const compatScore = compat ? compat.score : 100;

    // 6. Evaluate Network Subscore (10% Weight)
    let netScore = 100;
    const net = diagnostics.network;
    const browser = diagnostics.browser;
    if (browser && !browser.online) {
        netScore = 0;
    } else if (net && net.rtt) {
        const rttVal = parseInt(net.rtt);
        if (!isNaN(rttVal)) {
            if (rttVal > 300) netScore -= 40;
            else if (rttVal > 150) netScore -= 20;
        }
        if (net.downlink && parseFloat(net.downlink) < 5.0) {
            netScore -= 20;
        }
    }
    netScore = Math.max(10, netScore);

    // Calculate overall weighted score
    const finalScore = Math.round(
        (perfScore * 0.20) +
        (batScore * 0.20) +
        (storScore * 0.15) +
        (secScore * 0.20) +
        (compatScore * 0.15) +
        (netScore * 0.10)
    );

    // Update UI elements
    setElementText('health-score-text', finalScore);

    // Update evaluation label and grade color
    let evalText = 'Excellent';
    let evalBadge = 'success';
    let recommendation = 'Your browser performs very well. Storage usage is minimal. Network quality is excellent. Security configuration is safe.';

    if (finalScore < 50) {
        evalText = 'Poor';
        evalBadge = 'danger';
        recommendation = 'Critical system constraints detected. Optimize your network latency, plug in the charger, and clear browser caches to restore optimal performance.';
    } else if (finalScore < 75) {
        evalText = 'Average';
        evalBadge = 'warning';
        recommendation = 'Moderate latency or system warnings identified. Plug in your battery charger and check for insecure connection context or missing features.';
    } else if (finalScore < 90) {
        evalText = 'Good';
        evalBadge = 'info';
        recommendation = 'Your device health is overall stable. Minor configuration optimizations can push it to peak efficiency.';
    }

    setElementBadge('health-eval', evalText, evalBadge);

    const recEl = document.getElementById('health-recommendation');
    if (recEl) {
        recEl.textContent = recommendation;
    }

    // Write subscore weight values to badges
    setElementBadge('health-w-perf', `${perfScore}/100`, perfScore >= 90 ? 'success' : (perfScore >= 70 ? 'info' : 'warning'));
    setElementBadge('health-w-battery', `${batScore}/100`, batScore >= 90 ? 'success' : (batScore >= 70 ? 'info' : 'warning'));
    setElementBadge('health-w-storage', `${storScore}/100`, storScore >= 90 ? 'success' : (storScore >= 70 ? 'info' : 'warning'));
    setElementBadge('health-w-security', `${secScore}/100`, secScore >= 90 ? 'success' : (secScore >= 70 ? 'info' : 'warning'));
    setElementBadge('health-w-compat', `${compatScore}/100`, compatScore >= 90 ? 'success' : (compatScore >= 70 ? 'info' : 'warning'));
    setElementBadge('health-w-network', `${netScore}/100`, netScore >= 90 ? 'success' : (netScore >= 70 ? 'info' : 'warning'));

    // Animate circular progress ring
    const ring = document.getElementById('health-score-ring');
    if (ring) {
        const radius = 40;
        const circumference = 2 * Math.PI * radius; // 251.2
        const offset = circumference - (finalScore / 100) * circumference;
        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = offset;
        
        // Update stroke color based on health index level
        ring.className.baseVal = 'circular-progress-fill'; // Clear other rings classes
        if (finalScore < 50) {
            ring.style.stroke = 'var(--danger)';
        } else if (finalScore < 75) {
            ring.style.stroke = 'var(--warning)';
        } else if (finalScore < 90) {
            ring.style.stroke = 'var(--info)';
        } else {
            ring.style.stroke = 'var(--success)';
        }
    }

    // Save diagnostics
    window.deviceDiagnostics = window.deviceDiagnostics || {};
    window.deviceDiagnostics.health = {
        score: finalScore,
        evaluation: evalText,
        subscores: {
            performance: perfScore,
            battery: batScore,
            storage: storScore,
            security: secScore,
            compatibility: compatScore,
            network: netScore
        }
    };
}

