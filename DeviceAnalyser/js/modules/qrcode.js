/* ==========================================================================
   Device Analyzer - QR Code Module
   ========================================================================== */

import { showToast } from '../utils.js';

let qrInitAttempts = 0;

/**
 * Initialize QR Code Generator.
 */
export function initQrCode() {
    const dataSelect = document.getElementById('qr-data-select');
    const downloadBtn = document.getElementById('download-qr-btn');

    if (dataSelect) {
        dataSelect.addEventListener('change', generateDiagnosticQr);
    }
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadQrCode);
    }

    // Delay initialization slightly to let async data (IP/Location) start settling
    setTimeout(generateDiagnosticQr, 1500);
}

/**
 * Generates the QR code based on user selection.
 */
export function generateDiagnosticQr() {
    const container = document.getElementById('qrcode-container');
    const selectEl = document.getElementById('qr-data-select');
    if (!container || !selectEl) return;

    if (typeof qrcode === 'undefined') {
        qrInitAttempts++;
        if (qrInitAttempts < 20) {
            setTimeout(generateDiagnosticQr, 500);
        } else {
            container.innerHTML = '<div class="qr-placeholder text-danger">Library Error</div>';
        }
        return;
    }

    const type = selectEl.value;
    let dataString = '';

    // Collect data based on selector type
    const diag = window.deviceDiagnostics || {};
    
    if (type === 'url') {
        dataString = window.location.href;
    } else if (type === 'ip') {
        dataString = diag.ipAddress || 'No IP address resolved yet';
    } else if (type === 'location') {
        if (diag.location && diag.location.latitude) {
            dataString = `Latitude: ${diag.location.latitude}, Longitude: ${diag.location.longitude}`;
        } else {
            dataString = 'No geolocation coordinates fetched yet';
        }
    }

    try {
        // qrcode(version, errorCorrectionLevel)
        // version: 0 is auto-detect size
        // errorCorrectionLevel: 'M' or 'H'
        const qr = qrcode(0, 'M');
        qr.addData(dataString);
        qr.make();

        // Create img tag string. Cell size: 4, margin: 8
        const imgTag = qr.createImgTag(4, 8);
        container.innerHTML = imgTag;

        // Make sure the image inside fits the container
        const img = container.querySelector('img');
        if (img) {
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.display = 'block';
            img.setAttribute('alt', 'Diagnostic QR Code');
        }
    } catch (err) {
        console.error('Failed to generate QR Code:', err);
        container.innerHTML = '<div class="qr-placeholder text-danger">Generation Failed</div>';
    }
}

/**
 * Downloads the currently generated QR code image as PNG.
 */
function downloadQrCode() {
    const container = document.getElementById('qrcode-container');
    if (!container) return;

    const img = container.querySelector('img');
    if (!img || !img.src) {
        showToast('Please wait for QR code to generate first.', 'warning');
        return;
    }

    try {
        const link = document.createElement('a');
        link.href = img.src;
        link.download = `device_analyzer_qr_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('QR Code download started.', 'success');
    } catch (err) {
        console.error('QR Code download failed:', err);
        showToast('Failed to download QR Code.', 'error');
    }
}
