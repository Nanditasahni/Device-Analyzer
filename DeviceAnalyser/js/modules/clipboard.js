/* ==========================================================================
   Device Analyzer - Clipboard Module
   ========================================================================== */

import { showToast, setElementText } from '../utils.js';

/**
 * Initialize Clipboard Tester listeners.
 */
export function initClipboard() {
    const copyBtn = document.getElementById('clip-copy-btn');
    const pasteBtn = document.getElementById('clip-paste-btn');
    const copyAllBtn = document.getElementById('copy-all-btn');

    if (copyBtn) {
        copyBtn.addEventListener('click', copyToClipboard);
    }
    if (pasteBtn) {
        pasteBtn.addEventListener('click', readFromClipboard);
    }
    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', copyAllDiagnostics);
    }
}

/**
 * Copy all diagnostics object JSON to system clipboard.
 */
async function copyAllDiagnostics() {
    const diagnostics = window.deviceDiagnostics || {};
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
        showToast('Clipboard writing not supported on this browser.', 'error');
        return;
    }

    try {
        const text = JSON.stringify(diagnostics, null, 2);
        await navigator.clipboard.writeText(text);
        showToast('All diagnostics telemetry copied to clipboard!', 'success');
    } catch (err) {
        console.error('Failed to copy all diagnostics:', err);
        showToast('Failed to copy diagnostics payload.', 'error');
    }
}

/**
 * Write text from input to System Clipboard.
 */
async function copyToClipboard() {
    const inputEl = document.getElementById('clipboard-input');
    if (!inputEl) return;

    const textToCopy = inputEl.value.trim();
    if (!textToCopy) {
        showToast('Please type some text to copy first.', 'warning');
        return;
    }

    if (!navigator.clipboard || !navigator.clipboard.writeText) {
        showToast('Clipboard copy is not supported in this browser.', 'error');
        return;
    }

    try {
        await navigator.clipboard.writeText(textToCopy);
        showToast('Text copied to clipboard!', 'success');
    } catch (err) {
        console.error('Failed to copy text:', err);
        showToast('Permission denied to write to clipboard.', 'error');
    }
}

/**
 * Read text from System Clipboard.
 */
async function readFromClipboard() {
    const previewEl = document.getElementById('clipboard-contents');
    
    if (!navigator.clipboard || !navigator.clipboard.readText) {
        if (previewEl) {
            previewEl.textContent = 'Clipboard read is not supported in this browser.';
        }
        showToast('Clipboard read is not supported.', 'error');
        return;
    }

    try {
        if (previewEl) {
            previewEl.textContent = 'Requesting clipboard read permission...';
        }
        
        const clipText = await navigator.clipboard.readText();
        
        if (previewEl) {
            if (clipText) {
                previewEl.textContent = clipText;
                showToast('Clipboard read successfully!', 'success');
            } else {
                previewEl.textContent = '[Clipboard is empty or contains non-text content]';
            }
        }
    } catch (err) {
        console.error('Failed to read clipboard:', err);
        if (previewEl) {
            previewEl.textContent = 'Access Denied: Clipboard read permission was blocked or rejected.';
        }
        showToast('Clipboard read permission denied.', 'error');
    }
}
