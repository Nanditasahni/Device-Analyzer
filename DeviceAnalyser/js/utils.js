/* ==========================================================================
   Device Analyzer - Helper & Shared Utilities
   ========================================================================== */

/**
 * Display a floating toast notification to the user.
 * @param {string} message - Message text.
 * @param {'info' | 'success' | 'warning' | 'error'} type - Style modifier.
 */
export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon mapping
    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
        iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else if (type === 'warning') {
        iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
        iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    container.appendChild(toast);

    // Remove toast after duration
    setTimeout(() => {
        toast.style.animation = 'toast-out 0.3s ease forwards';
        toast.addEventListener('animationend', () => toast.remove());
    }, 4000);
}

/**
 * Format bytes into human-readable strings (MB, GB, etc.).
 * @param {number} bytes - Number of bytes.
 * @param {number} decimals - Precision size.
 * @returns {string} Formatted size text.
 */
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0 || isNaN(bytes)) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format milliseconds into human-readable seconds or milliseconds.
 * @param {number} ms - Milliseconds duration.
 * @returns {string} Formatted duration.
 */
export function formatMs(ms) {
    if (ms >= 1000) {
        return (ms / 1000).toFixed(2) + ' s';
    }
    return ms.toFixed(0) + ' ms';
}

/**
 * Safely sets the text content of a DOM element, falls back if not found.
 * @param {string} id - DOM element ID.
 * @param {string} text - Text string.
 */
export function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = text;
        el.classList.remove('loading-skeleton-text');
    }
}

/**
 * Sets badge status on an element, updating classes correctly.
 * @param {string} id - DOM element ID.
 * @param {string} text - Text display.
 * @param {'success' | 'warning' | 'danger' | 'info' | 'default'} status - Badge color style.
 */
export function setElementBadge(id, text, status = 'default') {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = text;
        el.className = 'info-badge';
        if (status !== 'default') {
            el.classList.add(status);
        }
    }
}

/**
 * Set an element's loading state by adding/removing shimmer classes.
 * @param {HTMLElement | string} target - Element or Element ID.
 * @param {boolean} isLoading - Active state toggler.
 */
export function toggleLoading(target, isLoading) {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!el) return;

    if (isLoading) {
        el.classList.add('loading-skeleton-text');
    } else {
        el.classList.remove('loading-skeleton-text');
    }
}
