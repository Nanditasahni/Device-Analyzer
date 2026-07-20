/* ==========================================================================
   Device Analyzer - Advanced Geolocation Module
   ========================================================================== */

import { setElementText, showToast, setElementBadge } from '../utils.js';
import { updateWeatherForCoords } from './weather.js';
import { updateSystemHealth } from './health.js';
import { updateAiSummary } from './ai_summary.js';

let currentCoords = null;

/**
 * Initialize location listeners, buttons, and permissions state.
 */
export function initLocation() {
    const locBtn = document.getElementById('get-location-btn');
    if (locBtn) {
        locBtn.addEventListener('click', requestLocation);
    }

    const copyBtn = document.getElementById('copy-location-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyCoordinates);
    }

    const shareBtn = document.getElementById('share-location-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareLocation);
    }

    // Monitor Permission State
    checkGeolocationPermission();
}

/**
 * Check and render geolocation permission status.
 */
async function checkGeolocationPermission() {
    if (navigator.permissions && navigator.permissions.query) {
        try {
            const status = await navigator.permissions.query({ name: 'geolocation' });
            updatePermissionBadge(status.state);
            status.onchange = () => {
                updatePermissionBadge(status.state);
            };
        } catch (e) {
            setElementBadge('geo-permission', 'SUPPORTED', 'info');
        }
    } else {
        setElementBadge('geo-permission', 'AVAILABLE', 'info');
    }
}

/**
 * Update permission badge based on permission state.
 */
function updatePermissionBadge(state) {
    let badgeClass = 'info';
    let text = 'PROMPT';
    if (state === 'granted') {
        text = 'GRANTED';
        badgeClass = 'success';
    } else if (state === 'denied') {
        text = 'DENIED';
        badgeClass = 'danger';
    }
    setElementBadge('geo-permission', text, badgeClass);
}

/**
 * Request Geolocation coordinates from browser.
 */
export function requestLocation() {
    if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser.', 'error');
        return;
    }

    const locBtn = document.getElementById('get-location-btn');
    if (locBtn) {
        locBtn.disabled = true;
        locBtn.textContent = 'Locating...';
    }

    navigator.geolocation.getCurrentPosition(
        handleLocationSuccess,
        handleLocationError,
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
}

/**
 * Copy lat/lng coordinates to clipboard.
 */
function copyCoordinates() {
    if (currentCoords) {
        const text = `${currentCoords.lat.toFixed(6)}, ${currentCoords.lng.toFixed(6)}`;
        navigator.clipboard.writeText(text)
            .then(() => showToast('Coordinates copied to clipboard!', 'success'))
            .catch(() => showToast('Failed to copy coordinates.', 'error'));
    }
}

/**
 * Share coordinates using Web Share API if supported.
 */
function shareLocation() {
    if (currentCoords) {
        const mapsUrl = `https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}`;
        if (navigator.share) {
            navigator.share({
                title: 'My Current Location Diagnostics',
                text: `Latitude: ${currentCoords.lat.toFixed(6)}, Longitude: ${currentCoords.lng.toFixed(6)}`,
                url: mapsUrl
            }).catch(() => {});
        } else {
            // Fallback copy url
            navigator.clipboard.writeText(mapsUrl)
                .then(() => showToast('Google Maps link copied to clipboard!', 'success'))
                .catch(() => showToast('Failed to copy link.', 'error'));
        }
    }
}

/**
 * Successful GPS coordinate resolution handler.
 * @param {GeolocationPosition} position - Geolocation payload.
 */
async function handleLocationSuccess(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    currentCoords = { lat, lng };

    const accuracy = `${position.coords.accuracy.toFixed(1)} m`;
    const altitude = position.coords.altitude ? `${position.coords.altitude.toFixed(1)} m` : 'Not Available';
    const altAccuracy = position.coords.altitudeAccuracy ? `${position.coords.altitudeAccuracy.toFixed(1)} m` : 'N/A';
    
    // Speed and Heading details
    const speed = position.coords.speed !== null ? `${(position.coords.speed * 3.6).toFixed(1)} km/h` : '0 km/h';
    const heading = position.coords.heading !== null ? `${position.coords.heading.toFixed(0)}°` : 'N/A';

    // Update UI Coordinates
    setElementText('geo-lat', lat.toFixed(6));
    setElementText('geo-lng', lng.toFixed(6));
    setElementText('geo-accuracy', accuracy);
    setElementText('geo-altitude', altitude);
    setElementText('geo-alt-accuracy', altAccuracy);
    setElementText('geo-speed-heading', `${speed} / Heading: ${heading}`);

    // Update permissions badge to granted
    updatePermissionBadge('granted');

    // Enable buttons
    const copyBtn = document.getElementById('copy-location-btn');
    if (copyBtn) copyBtn.disabled = false;
    const shareBtn = document.getElementById('share-location-btn');
    if (shareBtn) shareBtn.disabled = false;

    // Reset primary trigger button
    const locBtn = document.getElementById('get-location-btn');
    if (locBtn) {
        locBtn.disabled = false;
        locBtn.textContent = 'Refresh Location';
    }

    // Embed OSM preview iframe
    const mapPreviewContainer = document.getElementById('map-preview-container');
    const mapIframe = document.getElementById('map-iframe');
    if (mapPreviewContainer && mapIframe) {
        // Embed OpenStreetMap using lat,lng box boundaries
        const offset = 0.005;
        const bbox = `${lng - offset}%2C${lat - offset * 0.6}%2C${lng + offset}%2C${lat + offset * 0.6}`;
        mapIframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
        mapPreviewContainer.style.display = 'block';
    }

    // Save initial diagnostic details
    window.deviceDiagnostics = window.deviceDiagnostics || {};
    window.deviceDiagnostics.location = {
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
        accuracy,
        altitude,
        speed,
        heading
    };

    // Perform Nominatim reverse geocoding
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: { 'Accept-Language': 'en' },
            signal: AbortSignal.timeout(6000)
        });
        
        if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};
            
            const city = addr.city || addr.town || addr.village || addr.suburb || 'Unknown City';
            const district = addr.county || addr.state_district || '';
            const state = addr.state || '';
            const postal = addr.postcode || 'N/A';
            const country = addr.country || 'Unknown Country';

            setElementText('geo-city', district ? `${city} (${district})` : city);
            setElementText('geo-state', `${state} / ${postal}`);
            setElementText('geo-country', country);
            
            // Extract and set timezone if possible or construct standard
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            setElementText('geo-timezone', tz);

            // Update diagnostics registry
            window.deviceDiagnostics.location.resolvedAddress = {
                city,
                district,
                state,
                postal,
                country,
                timezone: tz
            };
        }
    } catch (err) {
        console.error('Nominatim reverse geocoding failed:', err);
    }

    showToast('Location and geography resolved.', 'success');

    // Trigger weather updates using lat, lng
    updateWeatherForCoords(lat, lng);
    
    // Update System health and AI summary
    updateSystemHealth();
    updateAiSummary();
}

/**
 * Error callback for Geolocation attempts.
 * @param {GeolocationPositionError} error - Error reason.
 */
function handleLocationError(error) {
    let msg = 'Failed to retrieve location.';
    
    switch (error.code) {
        case error.PERMISSION_DENIED:
            msg = 'Location permission denied by user.';
            updatePermissionBadge('denied');
            break;
        case error.POSITION_UNAVAILABLE:
            msg = 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            msg = 'Location request timed out.';
            break;
    }

    showToast(msg, 'error');

    // Reset UI button
    const locBtn = document.getElementById('get-location-btn');
    if (locBtn) {
        locBtn.disabled = false;
        locBtn.textContent = 'Try Again';
    }
}
