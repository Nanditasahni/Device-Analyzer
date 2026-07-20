/* ==========================================================================
   Device Analyzer - Live Clock Module
   ========================================================================== */

import { setElementText } from '../utils.js';

let clockInterval = null;

/**
 * Initialize the live clock updates.
 */
export function initClock() {
    updateClock();
    
    // Update every second
    clockInterval = setInterval(updateClock, 1000);
}

/**
 * Gathers current system time, formatted date, and time zone, updating DOM.
 */
function updateClock() {
    const now = new Date();
    
    // Time string format: HH:MM:SS
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const timeStr = now.toLocaleTimeString(undefined, timeOptions);
    
    // Date string format: Weekday, Month DD, YYYY
    const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const dateStr = now.toLocaleDateString(undefined, dateOptions);
    
    // Timezone description format
    const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const tzOffset = formatTimezoneOffset(now.getTimezoneOffset());
    const timezoneStr = `${tzName} (GMT${tzOffset})`;

    // Update Header Clock
    setElementText('clock-time', timeStr);
    setElementText('clock-date', dateStr);

    // Save state for reporting
    window.deviceDiagnostics = window.deviceDiagnostics || {};
    window.deviceDiagnostics.clock = {
        currentTime: timeStr,
        currentDate: dateStr,
        timezone: timezoneStr
    };
}

/**
 * Formats a timezone offset in minutes into GMT format (e.g. +05:30 or -08:00)
 * @param {number} offsetMinutes - Minutes offset from UTC.
 * @returns {string} GMT string offset.
 */
function formatTimezoneOffset(offsetMinutes) {
    const sign = offsetMinutes > 0 ? '-' : '+';
    const absoluteMinutes = Math.abs(offsetMinutes);
    const hours = Math.floor(absoluteMinutes / 60);
    const minutes = absoluteMinutes % 60;
    
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    
    return `${sign}${paddedHours}:${paddedMinutes}`;
}
