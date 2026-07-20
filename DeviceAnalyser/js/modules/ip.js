/* ==========================================================================
   Device Analyzer - Advanced Network IP Diagnostics Module
   ========================================================================== */

import { setElementText, showToast, setElementBadge } from '../utils.js';
import { updateAiSummary } from './ai_summary.js';
import { updateSystemHealth } from './health.js';

let isFetching = false;

/**
 * Initialize IP retriever and attach click events.
 */
export function initIp() {
    const refreshBtn = document.getElementById('refresh-ip-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchPublicIp);
    }

    const copyBtn = document.getElementById('copy-ip-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyIpToClipboard);
    }
    
    // Fetch on initial load
    fetchPublicIp();
}

/**
 * Copy the resolved public IP to clipboard.
 */
function copyIpToClipboard() {
    const ipDisplayEl = document.getElementById('ip-address');
    if (ipDisplayEl && ipDisplayEl.textContent && !ipDisplayEl.textContent.includes('Resolving')) {
        navigator.clipboard.writeText(ipDisplayEl.textContent.trim())
            .then(() => showToast('IP Address copied to clipboard!', 'success'))
            .catch(() => showToast('Failed to copy IP Address.', 'error'));
    } else {
        showToast('No valid IP Address to copy.', 'warning');
    }
}

/**
 * Get Local/Private LAN IP via WebRTC.
 */
function getPrivateIp() {
    return new Promise((resolve) => {
        try {
            const rtc = new RTCPeerConnection({ iceServers: [] });
            rtc.createDataChannel('');
            rtc.createOffer().then(offer => rtc.setLocalDescription(offer)).catch(() => resolve('Not Allowed'));
            rtc.onicecandidate = (event) => {
                if (event && event.candidate && event.candidate.candidate) {
                    const parts = event.candidate.candidate.split(' ');
                    const ip = parts[4];
                    if (ip && (ip.includes('.') || ip.includes(':'))) {
                        resolve(ip);
                        try { rtc.close(); } catch (e) {}
                    }
                }
            };
            setTimeout(() => {
                resolve('Not Detected');
                try { rtc.close(); } catch (e) {}
            }, 1200);
        } catch (e) {
            resolve('Not Supported');
        }
    });
}

/**
 * Fetch detailed public geo-IP data and private IP.
 */
export async function fetchPublicIp() {
    if (isFetching) return;
    
    const ipDisplayEl = document.getElementById('ip-address');
    const refreshBtn = document.getElementById('refresh-ip-btn');
    const refreshIcon = refreshBtn ? refreshBtn.querySelector('i') : null;
    const quickIpEl = document.getElementById('quick-ip');
    
    isFetching = true;
    
    // UI Loading state
    if (ipDisplayEl) {
        ipDisplayEl.textContent = 'Resolving IP...';
        ipDisplayEl.classList.add('loading-skeleton-text');
    }
    if (refreshIcon) {
        refreshIcon.className = 'fa-solid fa-arrows-rotate spin-anim';
    }

    try {
        // 1. Fetch Local Private IP asynchronously
        getPrivateIp().then(privateIp => {
            setElementText('ip-private', privateIp);
            window.deviceDiagnostics = window.deviceDiagnostics || {};
            window.deviceDiagnostics.privateIp = privateIp;
        });

        // 2. Try fetching IPv6 specifically
        let ipv6Address = 'Not Detected';
        try {
            const ipv6Res = await fetch('https://api64.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
            if (ipv6Res.ok) {
                const ipv6Data = await ipv6Res.json();
                if (ipv6Data.ip && ipv6Data.ip.includes(':')) {
                    ipv6Address = ipv6Data.ip;
                }
            }
        } catch (e) {
            // IPv6 not supported or timed out
        }
        setElementText('ip-v6', ipv6Address);

        // 3. Fetch full Geo-IP block from ipapi.co
        const response = await fetch('https://ipapi.co/json/', {
            signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) throw new Error('API server returned error code');
        
        const data = await response.json();
        const publicIp = data.ip || 'Unknown';
        
        // Render values
        setElementText('ip-address', publicIp);
        setElementText('ip-v4', publicIp.includes('.') ? publicIp : 'Not Detected');
        if (quickIpEl) {
            quickIpEl.textContent = publicIp;
            quickIpEl.classList.remove('loading-skeleton-text');
        }

        // Fill Detailed Fields
        setElementText('ip-isp', data.org || 'Unknown');
        setElementText('ip-org', data.asn || 'Unknown');
        setElementText('ip-location', `${data.city || ''}, ${data.region || ''}, ${data.country_name || ''}`);
        setElementText('ip-timezone', data.timezone || 'Unknown');

        // VPN Heuristic Detection
        let vpnStatus = 'No';
        let vpnBadge = 'success';
        const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const ipTimezone = data.timezone;
        const ispLower = (data.org || '').toLowerCase();
        
        const hostingKeywords = ['hosting', 'vpn', 'proxy', 'server', 'cloud', 'tunnel', 'digitalocean', 'linode', 'aws', 'amazon', 'google', 'microsoft', 'cloudflare', 'ovh', 'leaseweb'];
        const isHostingIsp = hostingKeywords.some(keyword => ispLower.includes(keyword));

        if (clientTimezone && ipTimezone && clientTimezone !== ipTimezone) {
            vpnStatus = 'Yes (Timezone Mismatch)';
            vpnBadge = 'warning';
        } else if (isHostingIsp) {
            vpnStatus = 'Yes (Data Center IP)';
            vpnBadge = 'warning';
        }

        setElementBadge('ip-vpn', vpnStatus, vpnBadge);

        // Connection Quality & Type
        const latency = window.deviceDiagnostics?.speedtest?.ping ? parseInt(window.deviceDiagnostics.speedtest.ping) : 0;
        let connQuality = 'Excellent';
        let qualityBadge = 'success';
        if (latency > 150) {
            connQuality = 'Poor';
            qualityBadge = 'danger';
        } else if (latency > 60) {
            connQuality = 'Average';
            qualityBadge = 'warning';
        }
        setElementBadge('ip-quality', connQuality, qualityBadge);

        // IP Type (Static vs Dynamic) - Private addresses are Dynamic, Public IP usually dynamic
        setElementBadge('ip-type', data.asn && data.asn.startsWith('AS') ? 'Dynamic / ISP' : 'Dynamic', 'info');

        // Enable Map Link
        const mapLink = document.getElementById('ip-gmaps-link');
        if (mapLink && data.latitude && data.longitude) {
            mapLink.href = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
            mapLink.classList.remove('disabled-link');
        }

        // Save Diagnostics
        window.deviceDiagnostics = window.deviceDiagnostics || {};
        window.deviceDiagnostics.networkInfo = {
            publicIp,
            ipv4: publicIp.includes('.') ? publicIp : 'N/A',
            ipv6: ipv6Address,
            isp: data.org,
            location: `${data.city}, ${data.country_name}`,
            timezone: data.timezone,
            vpn: vpnStatus !== 'No',
            quality: connQuality
        };

        if (ipDisplayEl) {
            ipDisplayEl.classList.remove('loading-skeleton-text');
        }

    } catch (err) {
        console.error('IP diagnostics resolution failed:', err);
        const errorMsg = navigator.onLine ? 'Resolution Timeout' : 'Offline';
        
        if (ipDisplayEl) {
            ipDisplayEl.textContent = errorMsg;
            ipDisplayEl.classList.remove('loading-skeleton-text');
        }
        if (quickIpEl) {
            quickIpEl.textContent = errorMsg;
            quickIpEl.classList.remove('loading-skeleton-text');
        }
        
        showToast('Failed to retrieve full network IP diagnostics.', 'error');
    } finally {
        isFetching = false;
        if (refreshIcon) {
            refreshIcon.className = 'fa-solid fa-arrows-rotate';
        }
        // Propagate updates to health and AI Summary
        updateSystemHealth();
        updateAiSummary();
    }
}
