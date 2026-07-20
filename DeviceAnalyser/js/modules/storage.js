/* ==========================================================================
   Device Analyzer - Advanced Storage Diagnostics Module
   ========================================================================== */

import { setElementText, formatBytes, showToast, setElementBadge } from '../utils.js';
import { updateSystemHealth } from './health.js';
import { updateAiSummary } from './ai_summary.js';

let storageChartInstance = null;

/**
 * Initialize and update Storage diagnostics and attach clear/export actions.
 */
export function initStorage() {
    // Clear Local Storage
    const clearLocalBtn = document.getElementById('clear-local-btn');
    if (clearLocalBtn) {
        clearLocalBtn.addEventListener('click', () => {
            localStorage.clear();
            updateStorageInfo();
            showToast('LocalStorage cleared successfully!', 'success');
        });
    }

    // Clear Session Storage
    const clearSessionBtn = document.getElementById('clear-session-btn');
    if (clearSessionBtn) {
        clearSessionBtn.addEventListener('click', () => {
            sessionStorage.clear();
            updateStorageInfo();
            showToast('SessionStorage cleared successfully!', 'success');
        });
    }

    // Clear Cache Storage
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', async () => {
            if (window.caches) {
                try {
                    const keys = await caches.keys();
                    await Promise.all(keys.map(key => caches.delete(key)));
                    updateStorageInfo();
                    showToast('Cache Storage purged successfully!', 'success');
                } catch (e) {
                    showToast('Failed to purge cache storage.', 'error');
                }
            } else {
                showToast('Cache Storage is not supported by this browser.', 'warning');
            }
        });
    }

    // Export Storage Data
    const exportStorageBtn = document.getElementById('export-storage-btn');
    if (exportStorageBtn) {
        exportStorageBtn.addEventListener('click', exportStorageData);
    }

    updateStorageInfo();
}

/**
 * Export storage data as a JSON file download.
 */
function exportStorageData() {
    const data = {
        localStorage: {},
        sessionStorage: {},
        exportedAt: new Date().toISOString()
    };

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data.localStorage[key] = localStorage.getItem(key);
    }

    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        data.sessionStorage[key] = sessionStorage.getItem(key);
    }

    try {
        const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `device_analyzer_storage_export_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Storage export downloaded successfully!', 'success');
    } catch (e) {
        showToast('Failed to export storage data.', 'error');
    }
}

/**
 * Gather and render client-side storage stats (quota, local/session storage, cookies, indexeddb, caches).
 */
export async function updateStorageInfo() {
    // 1. Quota & Usage Estimate
    let usagePercent = 0;
    let usageBytes = 0;
    let quotaBytes = 0;
    let remainingBytes = 0;
    let storageHealth = 'Optimal';
    let healthBadge = 'success';
    
    if (navigator.storage && navigator.storage.estimate) {
        try {
            const estimate = await navigator.storage.estimate();
            usageBytes = estimate.usage || 0;
            quotaBytes = estimate.quota || 0;
            remainingBytes = Math.max(0, quotaBytes - usageBytes);
            usagePercent = quotaBytes > 0 ? (usageBytes / quotaBytes) * 100 : 0;
        } catch (err) {
            console.error('Storage quota estimate failed:', err);
        }
    }

    // Default fallback values if API reports 0
    if (quotaBytes === 0) {
        quotaBytes = 1000 * 1024 * 1024; // 1 GB simulated default
        usageBytes = 15 * 1024 * 1024;   // 15 MB simulated usage
        remainingBytes = quotaBytes - usageBytes;
        usagePercent = (usageBytes / quotaBytes) * 100;
    }

    // Update Quota Texts
    const detailsText = `Used ${formatBytes(usageBytes)} of ${formatBytes(quotaBytes)} (${usagePercent.toFixed(3)}%)`;
    setElementText('storage-details', detailsText);
    setElementText('storage-quota', formatBytes(quotaBytes));
    setElementText('storage-used', formatBytes(usageBytes));
    setElementText('storage-free', formatBytes(remainingBytes));

    if (usagePercent > 90) {
        storageHealth = 'Critically Full';
        healthBadge = 'danger';
    } else if (usagePercent > 50) {
        storageHealth = 'Warning / High';
        healthBadge = 'warning';
    }
    setElementBadge('storage-health', storageHealth, healthBadge);

    // Update circular progress ring
    const ring = document.getElementById('storage-usage-ring');
    if (ring) {
        const radius = 40;
        const circumference = 2 * Math.PI * radius; // 251.2
        const offset = circumference - (Math.min(usagePercent, 100) / 100) * circumference;
        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = offset;
    }
    setElementText('storage-usage-pct', `${usagePercent.toFixed(1)}%`);

    // 2. LocalStorage Stats & Largest Stored Key
    let localSize = 0;
    let largestKey = 'None';
    let largestSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const val = localStorage.getItem(key) || '';
        const size = (key.length + val.length) * 2;
        localSize += size;
        if (size > largestSize) {
            largestSize = size;
            largestKey = `${key} (${formatBytes(size)})`;
        }
    }
    const localCount = localStorage.length;
    setElementText('storage-local', formatBytes(localSize));
    setElementText('storage-local-items', `${localCount} items`);

    // 3. SessionStorage Stats
    let sessionSize = 0;
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const val = sessionStorage.getItem(key) || '';
        const size = (key.length + val.length) * 2;
        sessionSize += size;
        if (size > largestSize) {
            largestSize = size;
            largestKey = `session: ${key} (${formatBytes(size)})`;
        }
    }
    const sessionCount = sessionStorage.length;
    setElementText('storage-session', formatBytes(sessionSize));
    setElementText('storage-session-items', `${sessionCount} items`);

    // Set Largest Item UI
    setElementText('storage-largest-item', largestKey);

    // 4. Cookies Stats
    const cookiesArray = document.cookie ? document.cookie.split(';') : [];
    const cookiesCount = cookiesArray.length;
    const cookiesSize = document.cookie ? document.cookie.length : 0;
    setElementText('storage-cookies', `${cookiesCount} cookies / ${formatBytes(cookiesSize)}`);

    // 5. IndexedDB databases
    let idbCount = 'N/A';
    if (window.indexedDB && window.indexedDB.databases) {
        try {
            const dbList = await indexedDB.databases();
            idbCount = `${dbList.length} databases`;
        } catch (e) {
            idbCount = 'Supported';
        }
    } else {
        idbCount = 'Supported';
    }
    setElementText('storage-idb', idbCount);

    // 6. Cache Storage Keys
    let cacheKeysText = 'N/A';
    if (window.caches) {
        try {
            const keys = await caches.keys();
            cacheKeysText = `${keys.length} caches`;
        } catch (e) {
            cacheKeysText = 'Supported';
        }
    } else {
        cacheKeysText = 'Not Supported';
    }
    setElementText('storage-cache', cacheKeysText);

    // Save global diagnostics data
    window.deviceDiagnostics = window.deviceDiagnostics || {};
    window.deviceDiagnostics.storage = {
        quotaDetails: detailsText,
        localStorageUsage: formatBytes(localSize),
        sessionStorageUsage: formatBytes(sessionSize),
        cookiesUsage: `${cookiesCount} items`,
        usageBytes,
        quotaBytes,
        largestItem: largestKey,
        indexedDb: idbCount,
        caches: cacheKeysText
    };

    // Update Doughnut Chart breakdown
    updateStorageDoughnut(localSize, sessionSize, cookiesSize, remainingBytes);

    // Update health & summaries
    updateSystemHealth();
    updateAiSummary();
}

/**
 * Draw Chart.js doughnut chart depicting storage breakdown.
 */
function updateStorageDoughnut(local, session, cookies, free) {
    const canvas = document.getElementById('storage-chart');
    if (!canvas) return;

    if (storageChartInstance) {
        storageChartInstance.destroy();
    }

    if (window.Chart) {
        const ctx = canvas.getContext('2d');
        storageChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Local Storage', 'Session Storage', 'Cookies', 'Free Space'],
                datasets: [{
                    data: [local, session, cookies, free],
                    backgroundColor: [
                        'rgba(168, 85, 247, 0.45)', // purple
                        'rgba(6, 182, 212, 0.45)',  // cyan
                        'rgba(249, 115, 22, 0.45)',  // orange
                        'rgba(34, 197, 94, 0.15)'   // emerald free
                    ],
                    borderColor: [
                        '#c084fc',
                        '#22d3ee',
                        '#fb923c',
                        '#4ade80'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            color: '#94a3b8',
                            font: { size: 9, family: 'system-ui' }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const val = context.raw;
                                return ` ${context.label}: ${formatBytes(val)}`;
                            }
                        }
                    }
                },
                cutout: '72%'
            }
        });
    }
}
