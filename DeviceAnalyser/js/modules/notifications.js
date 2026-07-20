/* ==========================================================================
   Device Analyzer - Web Notifications Module
   ========================================================================== */

import { showToast, setElementBadge } from '../utils.js';

/**
 * Initialize Web Notifications module.
 */
export function initNotifications() {
    updateNotificationBadge();

    const notifyBtn = document.getElementById('notify-btn');
    if (notifyBtn) {
        notifyBtn.addEventListener('click', triggerNotificationTest);
    }
}

/**
 * Reads browser notification permission level and updates badge.
 */
function updateNotificationBadge() {
    if (!window.Notification) {
        setElementBadge('notify-status', 'Unsupported', 'danger');
        return;
    }

    const state = Notification.permission;
    let badgeClass = 'default';

    if (state === 'granted') badgeClass = 'success';
    else if (state === 'denied') badgeClass = 'danger';
    else if (state === 'default') badgeClass = 'warning';

    setElementBadge('notify-status', state.toUpperCase(), badgeClass);

    // Save diagnostics
    window.deviceDiagnostics = window.deviceDiagnostics || {};
    window.deviceDiagnostics.notifications = {
        supported: true,
        permissionState: state
    };
}

/**
 * Trigger permission prompts or fire notifications.
 */
async function triggerNotificationTest() {
    if (!window.Notification) {
        showToast('Web Notifications are not supported in this browser.', 'error');
        return;
    }

    const state = Notification.permission;

    if (state === 'granted') {
        fireWelcomeNotification();
    } else if (state === 'default') {
        try {
            const newPermission = await Notification.requestPermission();
            updateNotificationBadge();
            if (newPermission === 'granted') {
                fireWelcomeNotification();
            } else {
                showToast('Notification permission was denied.', 'warning');
            }
        } catch (err) {
            console.error('Failed to request notification permission:', err);
        }
    } else if (state === 'denied') {
        showToast('Notifications are blocked. Please enable them in your browser settings.', 'error');
    }
}

/**
 * Spawns a physical desktop notification.
 */
function fireWelcomeNotification() {
    try {
        const title = 'Welcome to Device Analyzer';
        const options = {
            body: 'Your client-side device analyzer and diagnostic environment is fully loaded.',
            tag: 'device-analyzer-welcome',
            requireInteraction: false
        };

        const notification = new Notification(title, options);

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        showToast('Test notification sent!', 'success');
    } catch (err) {
        console.error('Failed to fire notification constructor:', err);
        // Fallback for some mobile browsers that support API but crash on constructing without worker
        showToast('Notifications supported, but construction failed (often occurs on mobile).', 'warning');
    }
}
