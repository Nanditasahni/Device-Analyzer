/* ==========================================================================
   Device Analyzer - Weather Module (Open-Meteo Integration)
   ========================================================================== */

import { setElementText, showToast } from '../utils.js';

/**
 * Fetch and update weather conditions based on coordinates.
 * @param {number} lat - Latitude.
 * @param {number} lng - Longitude.
 */
export async function updateWeatherForCoords(lat, lng) {
    const weatherCard = document.getElementById('card-weather');
    if (weatherCard) {
        weatherCard.style.display = 'block';
    }

    try {
        setElementText('weather-description', 'Retrieving local weather conditions...');
        
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
        const res = await fetch(url);
        
        if (!res.ok) {
            throw new Error(`Weather API returned status: ${res.status}`);
        }

        const data = await res.json();
        if (!data.current_weather) {
            throw new Error('Current weather block missing from API payload.');
        }

        const curr = data.current_weather;
        const temp = curr.temperature;
        const windSpeed = curr.windspeed;
        const windDir = curr.winddirection;
        const weatherCode = curr.weathercode;

        // Interpret Weather Code to Description and FontAwesome Icon
        const { desc, iconClass } = interpretWeatherCode(weatherCode);

        // Update UI elements
        setElementText('weather-temp', `${temp.toFixed(1)}°C`);
        setElementText('weather-description', desc);
        setElementText('weather-wind', `${windSpeed} km/h`);
        setElementText('weather-wind-dir', `${windDir}°`);
        setElementText('weather-station', 'Open-Meteo Satellites');

        // Update Weather Icon
        const iconContainer = document.getElementById('weather-temp-icon');
        if (iconContainer) {
            iconContainer.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
        }

        // Save diagnostics
        window.deviceDiagnostics = window.deviceDiagnostics || {};
        window.deviceDiagnostics.weather = {
            temperature: `${temp}°C`,
            condition: desc,
            windSpeed: `${windSpeed} km/h`,
            windDirection: `${windDir}°`,
            resolvedAt: new Date().toLocaleTimeString()
        };

        showToast('Weather telemetry retrieved!', 'success');
    } catch (err) {
        console.error('Weather retrieval failed:', err);
        setElementText('weather-description', 'Weather data temporarily unavailable.');
        showToast('Failed to retrieve weather details.', 'warning');
    }
}

/**
 * Maps WMO Weather Interpretation Codes (WW) to friendly description & icons.
 * @param {number} code - Weather status code.
 * @returns {{desc: string, iconClass: string}} Description and font-awesome icon name.
 */
function interpretWeatherCode(code) {
    // Reference WMO code list
    if (code === 0) return { desc: 'Clear Sky', iconClass: 'fa-sun' };
    if (code === 1 || code === 2 || code === 3) return { desc: 'Mainly Clear / Partly Cloudy', iconClass: 'fa-cloud-sun' };
    if (code === 45 || code === 48) return { desc: 'Foggy / Rime Fog', iconClass: 'fa-smog' };
    if (code === 51 || code === 53 || code === 55) return { desc: 'Light Drizzle', iconClass: 'fa-cloud-rain' };
    if (code === 61 || code === 63 || code === 65) return { desc: 'Rainy', iconClass: 'fa-cloud-showers-heavy' };
    if (code === 71 || code === 73 || code === 75) return { desc: 'Snow Fall', iconClass: 'fa-snowflake' };
    if (code === 80 || code === 81 || code === 82) return { desc: 'Showers / Rain Showers', iconClass: 'fa-cloud-rain' };
    if (code === 95 || code === 96 || code === 99) return { desc: 'Thunderstorm', iconClass: 'fa-cloud-bolt' };
    return { desc: 'Overcast / Cloudy', iconClass: 'fa-cloud' };
}
