/* ==========================================================================
   Device Analyzer - Theme Module (Dark / Light / System Mode)
   ========================================================================== */

import { showToast } from '../utils.js';

const THEME_KEY = 'device-analyzer-theme';

/**
 * Initialize theme based on LocalStorage or System preferences.
 */
export function initTheme() {
    const themeBtn = document.getElementById('theme-btn');
    if (!themeBtn) return;

    // Read stored preference, fallback to system dark preference
    const storedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'light' || (!storedTheme && !prefersDark)) {
        setLightTheme();
    } else {
        setDarkTheme();
    }

    // Add click event listener to the toggle button
    themeBtn.addEventListener('click', toggleTheme);
}

/**
 * Toggles theme between Light and Dark mode.
 */
function toggleTheme() {
    const isLight = document.body.classList.contains('light-theme');
    if (isLight) {
        setDarkTheme();
        showToast('Switched to Dark Mode', 'info');
    } else {
        setLightTheme();
        showToast('Switched to Light Mode', 'info');
    }
}

/**
 * Sets light theme styles.
 */
function setLightTheme() {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
    localStorage.setItem(THEME_KEY, 'light');
}

/**
 * Sets dark theme styles.
 */
function setDarkTheme() {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem(THEME_KEY, 'dark');
}
