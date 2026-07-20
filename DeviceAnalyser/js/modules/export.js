/* ==========================================================================
   Device Analyzer - Export Report Module (PDF, JSON & CSV)
   ========================================================================== */

import { showToast } from '../utils.js';

/**
 * Initialize Exporter click listeners.
 */
export function initExport() {
    const jsonBtn = document.getElementById('export-json-btn');
    const csvBtn = document.getElementById('export-csv-btn');
    const pdfBtn = document.getElementById('export-pdf-btn');

    if (jsonBtn) {
        jsonBtn.addEventListener('click', exportJsonReport);
    }
    if (csvBtn) {
        csvBtn.addEventListener('click', exportCsvReport);
    }
    if (pdfBtn) {
        pdfBtn.addEventListener('click', exportPdfReport);
    }
}

/**
 * Compiles window.deviceDiagnostics into JSON and triggers browser download.
 */
function exportJsonReport() {
    const diagnostics = window.deviceDiagnostics || {};
    const aiSummaryText = document.getElementById('ai-summary-text')?.textContent || '';
    
    // Add export metadata
    const reportData = {
        reportName: 'Device Analyzer Telemetry Report',
        generatedAt: new Date().toISOString(),
        aiSummary: aiSummaryText,
        telemetry: diagnostics
    };

    try {
        const jsonString = JSON.stringify(reportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `device_report_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('JSON report downloaded.', 'success');
    } catch (err) {
        console.error('Failed to export JSON:', err);
        showToast('Failed to export JSON report.', 'error');
    }
}

/**
 * Flattens telemetry data and downloads as CSV format.
 */
function exportCsvReport() {
    const diagnostics = window.deviceDiagnostics || {};
    const aiSummaryText = document.getElementById('ai-summary-text')?.textContent || '';
    let csvRows = ['Category,Metric,Value'];

    try {
        csvRows.push(`ai_summary,summary,"${aiSummaryText.replace(/"/g, '""')}"`);

        for (const [category, metrics] of Object.entries(diagnostics)) {
            if (typeof metrics === 'object' && metrics !== null) {
                for (const [metricName, val] of Object.entries(metrics)) {
                    // Handle array/object values
                    const cleanVal = typeof val === 'object' 
                        ? JSON.stringify(val).replace(/"/g, '""') 
                        : String(val).replace(/"/g, '""');
                    csvRows.push(`${category},${metricName},"${cleanVal}"`);
                }
            } else {
                const cleanVal = String(metrics).replace(/"/g, '""');
                csvRows.push(`global,${category},"${cleanVal}"`);
            }
        }

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `device_report_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('CSV report downloaded.', 'success');
    } catch (err) {
        console.error('Failed to export CSV:', err);
        showToast('Failed to export CSV report.', 'error');
    }
}

/**
 * Generates an executive, beautifully styled 2-page PDF diagnostic report.
 */
function exportPdfReport() {
    if (typeof html2pdf === 'undefined') {
        showToast('PDF library loading... Try again in a moment.', 'warning');
        return;
    }

    const diagnostics = window.deviceDiagnostics || {};
    
    // Resolve all metrics
    const browser = diagnostics.browser || {};
    const device = diagnostics.device || {};
    const screen = diagnostics.screen || {};
    const battery = diagnostics.battery || {};
    const network = diagnostics.network || {};
    const perf = diagnostics.performance || {};
    const clock = diagnostics.clock || {};
    const health = diagnostics.health || { score: 100, evaluation: 'Optimal', subscores: {} };
    const compatibility = diagnostics.compatibility || {};
    const security = diagnostics.security || {};
    const storage = diagnostics.storage || {};
    const speed = diagnostics.speedtest || {};
    const loc = diagnostics.location || {};
    
    const aiSummaryText = document.getElementById('ai-summary-text')?.innerHTML || 'Analyzing system telemetry...';

    // Create container elements
    const printArea = document.createElement('div');
    printArea.style.width = '700px';
    printArea.style.padding = '30px';
    printArea.style.fontFamily = "'Plus Jakarta Sans', Arial, sans-serif";
    printArea.style.color = '#1e293b';
    printArea.style.backgroundColor = '#ffffff';

    // Format content with explicit page breaks
    printArea.innerHTML = `
        <!-- ================= PAGE 1 ================= -->
        <div style="page-break-after: always; padding-bottom: 20px;">
            <!-- Header Block -->
            <div style="border-bottom: 3px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <!-- Shield SVG Logo -->
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <path d="m9 12 2 2 4-4"/>
                    </svg>
                    <div>
                        <h1 style="margin: 0; color: #1e1b4b; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">DEVICE ANALYZER</h1>
                        <p style="margin: 2px 0 0 0; color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Executive System Report</p>
                    </div>
                </div>
                <div style="text-align: right; color: #475569; font-size: 11px; line-height: 1.4;">
                    <strong>Date:</strong> ${clock.currentDate || new Date().toLocaleDateString()}<br>
                    <strong>Time:</strong> ${clock.currentTime || new Date().toLocaleTimeString()}
                </div>
            </div>

            <!-- Page 1 Grid: Health Summary & AI Summary -->
            <div style="display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 25px;">
                <!-- Health Card -->
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 25px;">
                    <div style="text-align: center; background-color: #4f46e5; color: white; padding: 12px 18px; border-radius: 12px;">
                        <div style="font-size: 28px; font-weight: 800;">${health.score}</div>
                        <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; margin-top: 2px;">HEALTH INDEX</div>
                    </div>
                    <div>
                        <h3 style="margin: 0 0 4px 0; color: #1e293b; font-size: 16px; font-weight: 700;">Evaluation Status: <span style="color: #4f46e5;">${health.evaluation}</span></h3>
                        <p style="margin: 0; color: #475569; font-size: 12px; line-height: 1.4;">Overall hardware, connectivity, storage headroom, and security audit scoring weighted and aggregated.</p>
                    </div>
                </div>

                <!-- AI Summary Block -->
                <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 18px;">
                    <h3 style="margin: 0 0 8px 0; color: #4338ca; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">AI Diagnostic Summary</h3>
                    <div style="font-size: 12px; line-height: 1.6; color: #3730a3;">
                        ${aiSummaryText}
                    </div>
                </div>
            </div>

            <!-- Health subscores table -->
            <h3 style="color: #1e293b; font-size: 13px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 0 0 10px 0;">Weighted Subscore Elements</h3>
            <table style="width: 100%; font-size: 12px; border-collapse: collapse; margin-bottom: 25px;">
                <thead>
                    <tr style="background-color: #f1f5f9; color: #475569; text-align: left;">
                        <th style="padding: 6px; border: 1px solid #e2e8f0;">Category</th>
                        <th style="padding: 6px; border: 1px solid #e2e8f0;">Assigned Weight</th>
                        <th style="padding: 6px; border: 1px solid #e2e8f0; text-align: right;">Subscore Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: 600;">Performance Subscore</td>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; color: #64748b;">20% of index</td>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: right; font-weight: 700;">${health.subscores?.performance ?? 100}/100</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: 600;">Battery Subscore</td>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; color: #64748b;">20% of index</td>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: right; font-weight: 700;">${health.subscores?.battery ?? 100}/100</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: 600;">Storage Subscore</td>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; color: #64748b;">15% of index</td>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: right; font-weight: 700;">${health.subscores?.storage ?? 100}/100</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: 600;">Security Subscore</td>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; color: #64748b;">20% of index</td>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: right; font-weight: 700;">${health.subscores?.security ?? 100}/100</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: 600;">Browser Compatibility</td>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; color: #64748b;">15% of index</td>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: right; font-weight: 700;">${health.subscores?.compatibility ?? 100}/100</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; font-weight: 600;">Network Stability</td>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; color: #64748b;">10% of index</td>
                        <td style="padding: 6px; border: 1px solid #e2e8f0; text-align: right; font-weight: 700;">${health.subscores?.network ?? 100}/100</td>
                    </tr>
                </tbody>
            </table>

            <!-- Security Audit Card -->
            <h3 style="color: #1e293b; font-size: 13px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 0 0 10px 0;">Security & Privacy Compliance</h3>
            <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #475569; font-weight: 600;">HTTPS Connection:</td><td style="font-weight: 700; text-align: right; color: ${security.httpsConnection ? '#10b981' : '#ef4444'};">${security.httpsConnection ? 'SECURE (HTTPS)' : 'INSECURE (HTTP)'}</td></tr>
                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #475569; font-weight: 600;">Cookie Protections:</td><td style="font-weight: 700; text-align: right; color: #10b981;">${security.cookiesProtection ? 'ACTIVE' : 'INACTIVE'}</td></tr>
                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #475569; font-weight: 600;">Do Not Track Preference:</td><td style="font-weight: 700; text-align: right;">${security.doNotTrack ? 'ENABLED' : 'DISABLED'}</td></tr>
                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #475569; font-weight: 600;">AdBlocker Active:</td><td style="font-weight: 700; text-align: right; color: ${security.adBlockerActive ? '#10b981' : '#f59e0b'};">${security.adBlockerActive ? 'YES' : 'NO (WARNING)'}</td></tr>
                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #475569; font-weight: 600;">Incognito Session Check:</td><td style="font-weight: 700; text-align: right;">${security.incognitoMode ? 'PRIVATE WINDOW' : 'STANDARD WINDOW'}</td></tr>
            </table>

            <div style="margin-top: 160px; text-align: center; font-size: 10px; color: #94a3b8;">
                Page 1 of 2 — Generated by Device Analyzer Dashboard
            </div>
        </div>

        <!-- ================= PAGE 2 ================= -->
        <div style="padding-top: 10px;">
            <!-- Header Mini -->
            <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 13px; font-weight: 700; color: #1e1b4b;">DEVICE ANALYZER - METADATA DETAILS</div>
                <div style="font-size: 10px; color: #64748b;">Date: ${clock.currentDate || new Date().toLocaleDateString()}</div>
            </div>

            <!-- Page 2 Content: Hardware & Browser Tables -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <h3 style="color: #1e293b; font-size: 13px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 0 0 10px 0;">Browser & OS Specs</h3>
                    <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Browser Name:</td><td style="font-weight: 600; text-align: right;">${browser.name || 'N/A'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Browser Version:</td><td style="font-weight: 600; text-align: right;">${browser.version || 'N/A'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">OS Family:</td><td style="font-weight: 600; text-align: right;">${device.operatingSystem || 'N/A'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Language:</td><td style="font-weight: 600; text-align: right;">${browser.language || 'N/A'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Compatibility:</td><td style="font-weight: 600; text-align: right;">${compatibility.score || 'N/A'}%</td></tr>
                    </table>
                </div>

                <div>
                    <h3 style="color: #1e293b; font-size: 13px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 0 0 10px 0;">Hardware & Screen</h3>
                    <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">CPU Cores:</td><td style="font-weight: 600; text-align: right;">${device.cpuCores || 'N/A'} Cores</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Memory Level:</td><td style="font-weight: 600; text-align: right;">${device.ram || 'N/A'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Resolution:</td><td style="font-weight: 600; text-align: right;">${screen.resolution || 'N/A'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Pixel Ratio:</td><td style="font-weight: 600; text-align: right;">${screen.devicePixelRatio || '1'}x</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Battery Pct:</td><td style="font-weight: 600; text-align: right;">${battery.level !== undefined ? battery.level + '%' : 'N/A'} (${battery.charging ? 'Charging' : 'Discharging'})</td></tr>
                    </table>
                </div>
            </div>

            <!-- Network Speeds & Latency Card -->
            <h3 style="color: #1e293b; font-size: 13px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 15px 0 10px 0;">Internet Speed & IP Diagnostics</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Download Speed:</td><td style="font-weight: 700; text-align: right; color: #22d3ee;">${speed.downloadSpeed || 'Not Run'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Upload Speed:</td><td style="font-weight: 700; text-align: right; color: #818cf8;">${speed.uploadSpeed || 'Not Run'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Ping / Latency:</td><td style="font-weight: 600; text-align: right;">${speed.ping || 'N/A'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Network Jitter:</td><td style="font-weight: 600; text-align: right;">${speed.jitter || 'N/A'}</td></tr>
                    </table>
                </div>
                <div>
                    <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Public IP:</td><td style="font-weight: 700; text-align: right; font-family: monospace;">${diagnostics.ipAddress || 'Unknown'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Local Private IP:</td><td style="font-weight: 600; text-align: right; font-family: monospace;">${diagnostics.privateIp || 'Scanning...'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">ISP Carrier:</td><td style="font-weight: 600; text-align: right;">${diagnostics.networkInfo?.isp || 'Unknown'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">VPN / Proxy Detected:</td><td style="font-weight: 700; text-align: right; color: ${diagnostics.networkInfo?.vpn ? '#ef4444' : '#10b981'};">${diagnostics.networkInfo?.vpn ? 'Likely VPN Active' : 'No VPN Flagged'}</td></tr>
                    </table>
                </div>
            </div>

            <!-- Geolocation & Storage details -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h3 style="color: #1e293b; font-size: 13px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 0 0 10px 0;">Geolocation & Location Details</h3>
                    <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">GPS Latitude:</td><td style="font-weight: 600; text-align: right; font-family: monospace;">${loc.latitude || 'N/A'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">GPS Longitude:</td><td style="font-weight: 600; text-align: right; font-family: monospace;">${loc.longitude || 'N/A'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Accuracy Range:</td><td style="font-weight: 600; text-align: right;">${loc.accuracy || 'N/A'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Resolved Address:</td><td style="font-weight: 600; text-align: right; font-size: 10px;">${loc.resolvedAddress ? `${loc.resolvedAddress.city}, ${loc.resolvedAddress.country}` : 'Not Resolved'}</td></tr>
                    </table>
                </div>

                <div>
                    <h3 style="color: #1e293b; font-size: 13px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 0 0 10px 0;">Browser Storage Allotment</h3>
                    <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">LocalStorage size:</td><td style="font-weight: 600; text-align: right;">${storage.localStorageUsage || '0 B'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">SessionStorage size:</td><td style="font-weight: 600; text-align: right;">${storage.sessionStorageUsage || '0 B'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Cookie Count/Size:</td><td style="font-weight: 600; text-align: right;">${storage.cookiesUsage || '0 items'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">IndexedDB Databases:</td><td style="font-weight: 600; text-align: right;">${storage.indexedDb || '0'}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">System Quota Details:</td><td style="font-weight: 600; text-align: right; font-size: 10px;">${storage.quotaDetails || 'N/A'}</td></tr>
                    </table>
                </div>
            </div>

            <div style="margin-top: 190px; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center; font-size: 10px; color: #94a3b8;">
                Page 2 of 2 — Generated by Device Analyzer Dashboard. Secure, local diagnostic sheet.
            </div>
        </div>
    `;

    const options = {
        margin:       10,
        filename:     `device_report_${Date.now()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    showToast('Compiling high-fidelity PDF report...', 'info');

    // Create wrapper node off-screen but in DOM tree so html2canvas renders it fully
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '-9999px';
    wrapper.style.width = '700px';
    wrapper.appendChild(printArea);
    document.body.appendChild(wrapper);

    // Trigger html2pdf conversion
    html2pdf()
        .from(printArea)
        .set(options)
        .save()
        .then(() => {
            document.body.removeChild(wrapper);
            showToast('PDF report downloaded successfully.', 'success');
        })
        .catch(err => {
            if (wrapper.parentNode) {
                document.body.removeChild(wrapper);
            }
            console.error('PDF generation failed:', err);
            showToast('Failed to export PDF.', 'error');
        });
}
