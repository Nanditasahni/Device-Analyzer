/* ==========================================================================
   Device Analyzer - App Coordinator (Main Entry Point)
   ========================================================================== */

// Import Modules
import { initTheme } from './modules/theme.js';
import { initClock } from './modules/clock.js';
import { initBrowser } from './modules/browser.js';
import { initDevice } from './modules/device.js';
import { initScreen } from './modules/screen.js';
import { initBattery } from './modules/battery.js';
import { initNetwork } from './modules/network.js';
import { initStorage } from './modules/storage.js';
import { initPerformance } from './modules/performance.js';
import { initIp } from './modules/ip.js';
import { initLocation } from './modules/location.js';
import { initSpeedTest } from './modules/speedtest.js';
import { initClipboard } from './modules/clipboard.js';
import { initMedia } from './modules/media.js';
import { initNotifications } from './modules/notifications.js';
import { initFullscreen } from './modules/fullscreen.js';
import { initMotion } from './modules/motion.js';
import { initQrCode } from './modules/qrcode.js';
import { initExport } from './modules/export.js';
import { initSecurity, runSecurityCheck } from './modules/security.js';
import { initCompatibility, updateCompatibilityInfo } from './modules/compatibility.js';
import { initHealth, updateSystemHealth } from './modules/health.js';
import { initAiSummary, updateAiSummary } from './modules/ai_summary.js';
import { showToast, setElementText } from './utils.js';

// Global Telemetry Registry object
window.deviceDiagnostics = {};

// Chart instances
let storageChartInstance = null;
let performanceChartInstance = null;
let chartInitAttempts = 0;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Run initial loading screen sequence
        runLoadingScreenSequence();

        // Core Layout & Settings
        initTheme();
        initClock();

        // Diagnostics Data Fetching (Phase 1 & 2 Modules)
        initBrowser();
        initDevice();
        initScreen();

        // Hardware & Performance Tracking (Phase 3 Modules)
        initBattery();
        initNetwork();
        initStorage();
        initPerformance();

        // Network Services & Geolocation (Phase 4 Modules)
        initIp();
        initLocation();
        initSpeedTest();

        // User Permissions & Interactions (Phase 5 Modules)
        initClipboard();
        initMedia();
        initNotifications();
        initFullscreen();
        initMotion();

        // Utilities & QR Generation (Phase 6 Modules)
        initQrCode();
        initExport();

        // Custom Phase: Security, Compatibility, Health, AI Summary
        initSecurity();
        initCompatibility();
        initHealth();
        initAiSummary();

        // Setup custom event listeners for online status
        window.addEventListener('online', () => {
            showToast('Internet connection re-established!', 'success');
            const onlineEl = document.getElementById('browser-online');
            if (onlineEl) {
                onlineEl.textContent = 'Online';
                onlineEl.className = 'info-badge success';
            }
        });
        window.addEventListener('offline', () => {
            showToast('Warning: Internet connection lost!', 'warning');
            const onlineEl = document.getElementById('browser-online');
            if (onlineEl) {
                onlineEl.textContent = 'Offline';
                onlineEl.className = 'info-badge danger';
            }
        });

        // Setup global Search logic
        setupSearchBox();

        // Set up the periodic auto-refresh sequence (every 3 seconds)
        setInterval(runAutoRefreshSequence, 3000);

        // Delayed initial chart render (allow Chart.js CDN to load completely)
        setTimeout(initCharts, 2000);

    } catch (error) {
        console.error('Fatal initialization error:', error);
        showToast('Telemetry coordinator failed to boot. Check console.', 'error');
    }
});

/**
 * Handle smooth fullscreen loading screen.
 */
function runLoadingScreenSequence() {
    const progressFill = document.getElementById('loader-progress');
    const statusText = document.getElementById('loader-status-text');
    const overlay = document.getElementById('loading-screen');
    
    if (!progressFill || !statusText || !overlay) return;

    let progress = 0;
    const statuses = [
        'Initializing sensor array...',
        'Checking secure context...',
        'Probing hardware platform...',
        'Resolving storage allocation...',
        'Booting dashboard...'
    ];

    const interval = setInterval(() => {
        progress += 4;
        progressFill.style.width = `${progress}%`;
        
        // Dynamic status text transition
        const statusIdx = Math.min(Math.floor(progress / 20), statuses.length - 1);
        statusText.textContent = statuses[statusIdx];

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                overlay.classList.add('fade-out');
                setTimeout(() => {
                    overlay.style.display = 'none';
                    showToast('Device Analyzer initialized. Diagnostics active.', 'success');
                }, 500);
            }, 300);
        }
    }, 50);
}

/**
 * Periodic auto-refresh (every 3 seconds) for live telemetry metrics.
 */
function runAutoRefreshSequence() {
    // 1. Live simulated CPU load jitter
    const simulatedCpuLoad = Math.floor(Math.random() * (65 - 15) + 15);
    setElementText('device-cpu-load', `${simulatedCpuLoad}%`);
    window.deviceDiagnostics.device = window.deviceDiagnostics.device || {};
    window.deviceDiagnostics.device.simulatedCpuLoad = `${simulatedCpuLoad}%`;

    // 2. Live RAM usage (derived or simulated)
    let ramUsage = 0;
    if (performance && performance.memory) {
        const mem = performance.memory;
        ramUsage = Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100);
    } else {
        // Fallback simulated RAM value
        ramUsage = Math.floor(Math.random() * (72 - 42) + 42);
    }
    setElementText('ram-usage-text', `${ramUsage}%`);
    animateCircularRing('ram-usage-ring', ramUsage);
    window.deviceDiagnostics.device.simulatedRamUsage = `${ramUsage}%`;

    // 3. Update Storage usage ring
    updateStorageUsageRing();

    // 4. Update Battery ring
    updateBatteryUsageRing();

    // 5. Run Security, Compatibility & Health evaluations
    runSecurityCheck();
    updateCompatibilityInfo();
    updateSystemHealth();
    updateAiSummary();

    // 6. Update Chart.js datasets with latest telemetry
    updateLiveCharts(simulatedCpuLoad, ramUsage);
}

/**
 * Animate the SVG circular progress ring based on a percentage.
 * @param {string} id - Circle element ID.
 * @param {number} percentage - Target value (0-100).
 */
function animateCircularRing(id, percentage) {
    const ring = document.getElementById(id);
    if (!ring) return;
    const radius = 40;
    const circumference = 2 * Math.PI * radius; // 251.2
    const offset = circumference - (percentage / 100) * circumference;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;
}

/**
 * Refresh and animate battery status ring.
 */
function updateBatteryUsageRing() {
    const battery = window.deviceDiagnostics.battery;
    if (battery && battery.level !== undefined) {
        animateCircularRing('battery-level-ring', battery.level);
    }
}

/**
 * Refresh and animate storage usage ring.
 */
function updateStorageUsageRing() {
    if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then(estimate => {
            const used = estimate.usage || 0;
            const quota = estimate.quota || 1;
            const pct = Math.round((used / quota) * 100);
            setElementText('storage-usage-pct', `${pct}%`);
            animateCircularRing('storage-usage-ring', pct);
        }).catch(() => {});
    }
}

/**
 * Initialize charts for Storage & Performance using Chart.js.
 */
function initCharts() {
    if (typeof Chart === 'undefined') {
        chartInitAttempts++;
        if (chartInitAttempts < 20) {
            setTimeout(initCharts, 500);
        } else {
            console.warn('Chart.js failed to load within 10 seconds.');
        }
        return;
    }

    // Set defaults
    Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

    // 1. Initialize Storage Doughnut Chart
    const storageCtx = document.getElementById('storage-chart');
    if (storageCtx) {
        if (navigator.storage && navigator.storage.estimate) {
            navigator.storage.estimate().then(estimate => {
                const usedGb = (estimate.usage / (1024 * 1024 * 1024)).toFixed(2);
                const totalGb = (estimate.quota / (1024 * 1024 * 1024)).toFixed(2);
                const freeGb = Math.max(0, (totalGb - usedGb)).toFixed(2);

                storageChartInstance = new Chart(storageCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Used (GB)', 'Free Space (GB)'],
                        datasets: [{
                            data: [usedGb, freeGb],
                            backgroundColor: ['rgba(139, 92, 246, 0.65)', 'rgba(16, 185, 129, 0.65)'],
                            borderColor: ['rgba(139, 92, 246, 1)', 'rgba(16, 185, 129, 1)'],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' }
                        }
                    }
                });
            }).catch(() => {});
        }
    }

    // 2. Initialize Live Performance Line Chart (CPU / Memory load history)
    const perfCtx = document.getElementById('performance-chart');
    if (perfCtx) {
        performanceChartInstance = new Chart(perfCtx, {
            type: 'line',
            data: {
                labels: ['', '', '', '', '', '', '', '', '', ''],
                datasets: [
                    {
                        label: 'Simulated CPU Load (%)',
                        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        borderColor: 'rgba(251, 191, 36, 1)',
                        backgroundColor: 'rgba(251, 191, 36, 0.2)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'JS Heap Memory Usage (%)',
                        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        borderColor: 'rgba(34, 211, 238, 1)',
                        backgroundColor: 'rgba(34, 211, 238, 0.2)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

/**
 * Append live variables to the Line Chart.
 * @param {number} cpu - CPU load value.
 * @param {number} ram - RAM percentage value.
 */
function updateLiveCharts(cpu, ram) {
    if (!performanceChartInstance) return;

    const datasets = performanceChartInstance.data.datasets;
    
    // CPU Load Dataset
    datasets[0].data.shift();
    datasets[0].data.push(cpu);

    // RAM Memory Dataset
    datasets[1].data.shift();
    datasets[1].data.push(ram);

    performanceChartInstance.update('none'); // Update smoothly without blocking
}

/**
 * Setup Global Header Search Logic.
 */
function setupSearchBox() {
    const searchInput = document.getElementById('search-box');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.glass-card');

        cards.forEach(card => {
            const titleEl = card.querySelector('h3');
            const titleText = titleEl ? titleEl.textContent.toLowerCase() : '';
            const bodyText = card.textContent.toLowerCase();

            if (titleText.includes(query) || bodyText.includes(query)) {
                card.style.display = '';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
            }
        });
    });
}
