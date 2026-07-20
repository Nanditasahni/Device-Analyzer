# Device Analyzer – Advanced Browser & Diagnostics Dashboard

A gorgeous, client-side, glassmorphic diagnostics dashboard. It monitors browser capabilities, operating system specs, screen dimensions, battery health, network tiers, geolocation parameters, performance indicators, and media access permissions using native modern Web APIs.

## 🚀 Features & APIs

The project is structured into modular components, each wrapping specific Browser APIs:

1. **Browser Information** - Extracted using `navigator.userAgent`, `navigator.cookieEnabled`, `navigator.language`, and `navigator.onLine`.
2. **Device Hardware** - Detected via `navigator.hardwareConcurrency`, `navigator.deviceMemory`, `navigator.platform`, and touch capability parameters.
3. **Screen Specifications** - Tracked via `window.screen` details and the `screen.orientation` change API.
4. **Battery Health** - Computed through `navigator.getBattery()`, featuring live charging updates and level progression indicators.
5. **Network Telemetry** - Pulled from `navigator.connection` showing effective bandwidth speeds, latencies, and Data Saver states.
6. **Internet Speed Test** - Employs the `Fetch API` and body `ReadableStream` reader stream pipelines to measure download throughput using local random-byte payloads (`5mb.bin`, `10mb.bin`).
7. **IP Resolver** - Requests public IP mappings using `fetch` from `api.ipify.org`.
8. **Geolocation** - Coordinates GPS data via `navigator.geolocation` with active map launchers.
9. **Live Clock** - Real-time timezone and date offset calculators.
10. **Storage Estimates** - Uses `navigator.storage.estimate()` alongside localized `localStorage`, `sessionStorage`, and cookie content size checkers.
11. **Performance Timings** - Deciphers latency (TTFB) and page load marks using the modern Navigation & Resource Performance APIs.
12. **Clipboard Tester** - Copy and read actions using `navigator.clipboard`.
13. **Camera & Microphone** - Detects available input devices and sets up live previews via `navigator.mediaDevices.getUserMedia()`.
14. **Fullscreen Triggers** - Integrates `document.documentElement.requestFullscreen()` canvas hooks.
15. **Notifications API** - Direct system desktop alert integrations.
16. **Device Motion** - Hooks into `DeviceMotionEvent` on supported mobile devices.
17. **QR Generator** - Converts diagnostic states into printable QR Codes.
18. **Exporters** - Outputs telemetry files as formatted corporate PDF sheets or structured JSON payloads.

---

## 📂 Project Organization

```
DeviceAnalyzer/
│── index.html          # Semantic HTML structure & CDN linkings
│── README.md           # Project documentation
├── css/
│     ├── style.css     # Theme variables, resetting, layout anchors
│     ├── components.css# Glassmorphism cards, buttons, custom gauges
│     └── animations.css# Entry delays, shimmer loaders, needle vibration keyframes
├── js/
│     ├── app.js        # Core importer & registry loader
│     ├── utils.js      # Toast dialogs, size translators, DOM helpers
│     └── modules/      # Independent capability drivers
│           ├── browser.js
│           ├── device.js
│           ├── screen.js
│           ├── battery.js
│           ├── network.js
│           ├── speedtest.js
│           ├── location.js
│           ├── ip.js
│           ├── clock.js
│           ├── storage.js
│           ├── performance.js
│           ├── clipboard.js
│           ├── media.js
│           ├── fullscreen.js
│           ├── notifications.js
│           ├── motion.js
│           ├── qrcode.js
│           └── export.js
├── sample/
│     ├── 5mb.bin       # Test random binary files for speed meter
│     └── 10mb.bin
```

---

## 🛠️ Getting Started

Because this application uses standard modern Javascript ES6 Modules, it must be run from a local server environment (to satisfy CORS rules when importing JS files and speed test bin files).

### Option 1: Live Server (VS Code Extension)
Right-click `index.html` inside VS Code and choose **Open with Live Server**.

### Option 2: Python HTTP Server
Run this from your terminal inside the project directory:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000`.

### Option 3: Node.js (http-server)
Install and run a static server:
```bash
npx http-server .
```

---

## 🛡️ License

This project is licensed under the MIT License - open-source and free to adapt.
