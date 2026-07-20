/* ==========================================================================
   Device Analyzer - Battery Status Module
   ========================================================================== */

import { setElementText, setElementBadge } from '../utils.js';

let batteryListenersAttached = false;

/**
 * Initialize Battery telemetry.
 */
export async function initBattery() {
    if (!navigator.getBattery) {
        handleBatteryUnsupported();
        return;
    }

    try {
        const battery = await navigator.getBattery();
        updateBatteryInfo(battery);

        // Attach listeners once to prevent duplicate triggers
        if (!batteryListenersAttached) {
            battery.addEventListener('chargingchange', () => updateBatteryInfo(battery));
            battery.addEventListener('levelchange', () => updateBatteryInfo(battery));
            battery.addEventListener('chargingtimechange', () => updateBatteryInfo(battery));
            battery.addEventListener('dischargingtimechange', () => updateBatteryInfo(battery));
            batteryListenersAttached = true;
        }
    } catch (err) {
        console.error('Battery Status API error:', err);
        handleBatteryUnsupported();
    }
}

/**
 * Gathers and renders current battery parameters.
 * @param {object} battery - Navigator battery manager object.
 */
function updateBatteryInfo(battery) {
    const levelPct = Math.round(battery.level * 100);
    const charging = battery.charging;
    
    // Format times
    const chargeTime = formatBatteryTime(battery.chargingTime, 'charging');
    const dischargeTime = formatBatteryTime(battery.dischargingTime, 'discharging');

    // Update Quick Status Bar
    const quickBattery = document.getElementById('quick-battery');
    if (quickBattery) {
        quickBattery.textContent = `${levelPct}% (${charging ? 'Charging' : 'Bat'})`;
        quickBattery.classList.remove('loading-skeleton-text');
    }

    // Update Card UI
    setElementText('battery-pct', `${levelPct}%`);
    
    const fillEl = document.getElementById('battery-fill');
    if (fillEl) {
        fillEl.style.width = `${levelPct}%`;
        
        // Color battery fill based on level
        if (charging) {
            fillEl.style.background = 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'; // Emerald
        } else if (levelPct <= 20) {
            fillEl.style.background = 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)'; // Red
        } else if (levelPct <= 50) {
            fillEl.style.background = 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)'; // Amber
        } else {
            fillEl.style.background = 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)'; // Blue
        }
    }

    // Charging Status text
    const statusText = charging ? 'Charging' : 'Discharging';
    setElementBadge('battery-status', statusText, charging ? 'success' : 'info');
    
    const chargingStateEl = document.getElementById('battery-charging-state');
    if (chargingStateEl) {
        chargingStateEl.textContent = charging ? 'Power Source Connected' : 'Running on Battery';
    }

    setElementText('battery-charge-time', chargeTime);
    setElementText('battery-discharge-time', dischargeTime);

    // Save diagnostics
    window.deviceDiagnostics = window.deviceDiagnostics || {};
    window.deviceDiagnostics.battery = {
        level: levelPct,
        charging,
        chargingTime: chargeTime,
        dischargingTime: dischargeTime
    };
}

/**
 * Handle browser fallback when Battery API is not supported.
 */
function handleBatteryUnsupported() {
    setElementText('battery-pct', 'N/A');
    setElementBadge('battery-status', 'Unsupported', 'danger');
    setElementText('battery-charge-time', 'Unsupported');
    setElementText('battery-discharge-time', 'Unsupported');
    
    const chargingStateEl = document.getElementById('battery-charging-state');
    if (chargingStateEl) {
        chargingStateEl.textContent = 'API not supported in this browser';
    }

    const quickBattery = document.getElementById('quick-battery');
    if (quickBattery) {
        quickBattery.textContent = 'N/A';
        quickBattery.classList.remove('loading-skeleton-text');
    }

    // Save diagnostics
    window.deviceDiagnostics = window.deviceDiagnostics || {};
    window.deviceDiagnostics.battery = {
        level: 'Unsupported',
        charging: 'Unsupported',
        chargingTime: 'Unsupported',
        dischargingTime: 'Unsupported'
    };
}

/**
 * Format raw battery duration seconds to human readable strings.
 * @param {number} durationSeconds - Seconds remaining.
 * @param {'charging' | 'discharging'} state - Power state.
 * @returns {string} Formatted duration text.
 */
function formatBatteryTime(durationSeconds, state) {
    if (durationSeconds === Infinity) {
        return state === 'charging' ? 'N/A' : 'Plugged in';
    }
    if (durationSeconds === 0) {
        return 'Fully Charged';
    }
    
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);

    const hourStr = hours > 0 ? `${hours}h ` : '';
    const minuteStr = `${minutes}m`;

    return `${hourStr}${minuteStr} remaining`;
}
