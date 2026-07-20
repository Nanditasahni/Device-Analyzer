/* ==========================================================================
   Device Analyzer - Performance Module
   ========================================================================== */

import { setElementText, formatBytes, formatMs } from '../utils.js';

/**
 * Initialize Performance diagnostics after the page fully loads.
 */
export function initPerformance() {
    // If page is already loaded, run immediately, otherwise wait for window load
    if (document.readyState === 'complete') {
        calculatePerformance();
    } else {
        window.addEventListener('load', () => {
            // Short delay to allow browser to finish painting and writing timing events
            setTimeout(calculatePerformance, 100);
        });
    }
}

/**
 * Extract timings from the Performance API.
 */
export function calculatePerformance() {
    let loadTime = 0;
    let domReady = 0;
    let ttfb = 0;

    const navEntries = performance.getEntriesByType('navigation');
    
    if (navEntries && navEntries.length > 0) {
        // Modern Navigation Timing API Level 2
        const entry = navEntries[0];
        loadTime = entry.loadEventEnd - entry.startTime;
        domReady = entry.domContentLoadedEventEnd - entry.startTime;
        ttfb = entry.responseStart - entry.requestStart;
    } else if (performance.timing) {
        // Fallback Navigation Timing API Level 1
        const t = performance.timing;
        loadTime = t.loadEventEnd - t.navigationStart;
        domReady = t.domContentLoadedEventEnd - t.navigationStart;
        ttfb = t.responseStart - t.requestStart;
    }

    // Safety checks for negative or incomplete numbers
    loadTime = loadTime > 0 ? loadTime : 0;
    domReady = domReady > 0 ? domReady : 0;
    ttfb = ttfb > 0 ? ttfb : 0;

    // Calculate Page Weight (Sum of resource transfer sizes)
    let totalWeight = 0;
    const resourceEntries = performance.getEntriesByType('resource');
    resourceEntries.forEach(resource => {
        if (resource.transferSize) {
            totalWeight += resource.transferSize;
        } else if (resource.decodedBodySize) {
            totalWeight += resource.decodedBodySize;
        }
    });

    // Score evaluation
    const scoreInfo = calculatePerformanceScore(loadTime, ttfb);

    // Render to Card UI
    setElementText('perf-load-time', loadTime > 0 ? formatMs(loadTime) : 'Calculating...');
    setElementText('perf-dom-time', domReady > 0 ? formatMs(domReady) : 'Calculating...');
    setElementText('perf-ttfb', ttfb > 0 ? formatMs(ttfb) : 'Calculating...');
    setElementText('perf-weight', totalWeight > 0 ? formatBytes(totalWeight) : 'Under 10 KB');

    // Score box rendering
    const scoreRatingEl = document.getElementById('perf-rating');
    if (scoreRatingEl) {
        scoreRatingEl.innerHTML = `Performance Rating: <span class="info-badge ${scoreInfo.class}">${scoreInfo.label} (${scoreInfo.score}/100)</span>`;
    }

    // Save diagnostics
    window.deviceDiagnostics = window.deviceDiagnostics || {};
    window.deviceDiagnostics.performance = {
        pageLoadTime: loadTime > 0 ? formatMs(loadTime) : 'N/A',
        domContentLoaded: domReady > 0 ? formatMs(domReady) : 'N/A',
        timeToFirstByte: ttfb > 0 ? formatMs(ttfb) : 'N/A',
        pageWeight: totalWeight > 0 ? formatBytes(totalWeight) : 'Unknown',
        ratingScore: `${scoreInfo.score}/100 (${scoreInfo.label})`,
        loadTimeMs: loadTime,
        ttfbMs: ttfb
    };
}

/**
 * Standard performance score calculation.
 * @param {number} loadMs - Load time duration.
 * @param {number} ttfbMs - TTFB duration.
 * @returns {{score: number, label: string, class: string}} Rating details.
 */
function calculatePerformanceScore(loadMs, ttfbMs) {
    if (loadMs === 0) {
        return { score: 100, label: 'EXCELLENT', class: 'success' };
    }

    let score = 100;

    // Deduct for long page loads
    if (loadMs > 4000) score -= 40;
    else if (loadMs > 2500) score -= 25;
    else if (loadMs > 1000) score -= 12;
    else if (loadMs > 500) score -= 5;

    // Deduct for high latency / TTFB
    if (ttfbMs > 800) score -= 20;
    else if (ttfbMs > 400) score -= 10;
    else if (ttfbMs > 200) score -= 4;

    score = Math.max(score, 0);

    let label = 'EXCELLENT';
    let labelClass = 'success';

    if (score < 50) {
        label = 'POOR';
        labelClass = 'danger';
    } else if (score < 80) {
        label = 'AVERAGE';
        labelClass = 'warning';
    } else if (score < 95) {
        label = 'GOOD';
        labelClass = 'info';
    }

    return { score, label, class: labelClass };
}
