/* ==========================================================================
   Device Analyzer - Device Motion Module (Mobile Sensors)
   ========================================================================== */

import { setElementText, showToast } from '../utils.js';

let isListening = false;

/**
 * Initialize Device Motion module.
 */
export function initMotion() {
    const isSupported = 'DeviceMotionEvent' in window;
    const reqBtn = document.getElementById('motion-req-btn');
    const warningMsg = document.getElementById('motion-unsupported-msg');

    if (!isSupported) {
        // Fallback for desktop/unsupported environments
        if (warningMsg) {
            warningMsg.textContent = 'Device motion sensors (accelerometer/gyroscope) are not supported on this device/browser.';
        }
        return;
    }

    // Check if permission request is required (iOS Safari)
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        if (warningMsg) {
            warningMsg.textContent = 'This browser requires permission to read accelerometer/gyroscope sensors.';
        }
        if (reqBtn) {
            reqBtn.style.display = 'block';
            reqBtn.addEventListener('click', requestiOSMotionPermission);
        }
    } else {
        // Android / Desktop fallback without permission dialog
        startMotionListening();
    }
}

/**
 * Request iOS-specific motion sensor permissions.
 */
async function requestiOSMotionPermission() {
    const reqBtn = document.getElementById('motion-req-btn');
    
    try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') {
            startMotionListening();
            showToast('Sensor permission granted!', 'success');
        } else {
            showToast('Sensor permission denied.', 'error');
        }
    } catch (err) {
        console.error('Failed to request DeviceMotionEvent permission:', err);
        showToast('Error requesting sensor access. Ensure HTTPS is active.', 'error');
    }
}

/**
 * Subscribe to devicemotion window events.
 */
function startMotionListening() {
    if (isListening) return;

    const warningMsg = document.getElementById('motion-unsupported-msg');
    const dataList = document.getElementById('motion-data-list');
    const reqBtn = document.getElementById('motion-req-btn');

    if (warningMsg) warningMsg.style.display = 'none';
    if (reqBtn) reqBtn.style.display = 'none';
    if (dataList) dataList.style.display = 'flex';

    window.addEventListener('devicemotion', handleMotionUpdate);
    isListening = true;

    // Save diagnostics status
    window.deviceDiagnostics = window.deviceDiagnostics || {};
    window.deviceDiagnostics.motionSensors = {
        supported: true,
        active: true
    };
}

/**
 * Updates UI sensor elements on window event trigger.
 * @param {DeviceMotionEvent} event - Raw sensor event.
 */
function handleMotionUpdate(event) {
    // Accelerometer Readings (m/s^2)
    const accel = event.acceleration || { x: 0, y: 0, z: 0 };
    const x = accel.x !== null ? accel.x : 0;
    const y = accel.y !== null ? accel.y : 0;
    const z = accel.z !== null ? accel.z : 0;

    // Gyroscope Readings (deg/s)
    const gyro = event.rotationRate || { alpha: 0, beta: 0, gamma: 0 };
    const alpha = gyro.alpha !== null ? gyro.alpha : 0;
    const beta = gyro.beta !== null ? gyro.beta : 0;
    const gamma = gyro.gamma !== null ? gyro.gamma : 0;

    // Update DOM
    setElementText('accel-x', `${x.toFixed(2)} m/s²`);
    setElementText('accel-y', `${y.toFixed(2)} m/s²`);
    setElementText('accel-z', `${z.toFixed(2)} m/s²`);
    setElementText('gyro-a', `${alpha.toFixed(2)}°/s`);
    setElementText('gyro-b', `${beta.toFixed(2)}°/s`);
    setElementText('gyro-g', `${gamma.toFixed(2)}°/s`);

    // Update diagnostics registry cache
    if (window.deviceDiagnostics && window.deviceDiagnostics.motionSensors) {
        window.deviceDiagnostics.motionSensors.lastReadings = {
            accel: { x, y, z },
            gyro: { alpha, beta, gamma }
        };
    }
}
