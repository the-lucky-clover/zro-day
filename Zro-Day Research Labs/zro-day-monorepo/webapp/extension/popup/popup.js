// ZRO-DAY Security Extension - Popup Interface
// 1950s Radar Operator Theme with Real-time Security Dashboard

class ZroDayPopup {
    constructor() {
        this.threatBlips = [];
        this.userData = null;
        this.threatLogs = [];
        
        this.initializePopup();
    }

    async initializePopup() {
        console.log('ZRO-DAY Popup: Initializing...');
        
        // Load user data and settings
        await this.loadUserData();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load threat data
        await this.loadThreatLogs();
        
        // Update display
        this.updateDisplay();
        
        // Start real-time updates
        this.startRealTimeUpdates();
        
        console.log('ZRO-DAY Popup: Initialized successfully');
    }

    async loadUserData() {
        try {
            const stored = await chrome.storage.local.get([
                'auth_token', 
                'user_data', 
                'user_settings',
                'subscription_type',
                'threats_blocked_today',
                'last_scan_time',
                'api_calls_today'
            ]);
            
            this.userData = {
                authToken: stored.auth_token,
                subscriptionType: stored.subscription_type || 'free',
                threatsBlocked: stored.threats_blocked_today || 0,
                lastScan: stored.last_scan_time,
                apiCalls: stored.api_calls_today || 0,
                settings: stored.user_settings || this.getDefaultSettings()
            };
            
            console.log('User data loaded:', this.userData);
        } catch (error) {
            console.error('Failed to load user data:', error);
            this.userData = {
                subscriptionType: 'free',
                threatsBlocked: 0,
                lastScan: null,
                apiCalls: 0,
                settings: this.getDefaultSettings()
            };
        }
    }

    getDefaultSettings() {
        return {
            real_time_protection: false, // Free tier default
            block_malicious_downloads: true,
            phishing_protection: true,
            safe_browsing: true,
            notification_level: 'standard'
        };
    }

    setupEventListeners() {
        // Scan Now button
        document.getElementById('scanNow').addEventListener('click', () => {
            this.performManualScan();
        });

        // Open Dashboard button
        document.getElementById('openDashboard').addEventListener('click', () => {
            if (this.userData.authToken) {
                chrome.tabs.create({ url: 'https://zro-day.com/dashboard' });
            } else {
                chrome.tabs.create({ url: 'https://zro-day.com/' });
            }
        });

        // Upgrade button
        document.getElementById('upgradeBtn').addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://zro-day.com/pricing' });
        });

        // Add click handler for threat blips
        document.getElementById('threatBlips').addEventListener('click', (event) => {
            if (event.target.classList.contains('threat-blip')) {
                this.showThreatDetails(event.target.dataset.threatId);
            }
        });
    }

    async loadThreatLogs() {
        try {
            // Get threat logs from background script
            const logs = await this.sendMessageToBackground({ type: 'get_threat_logs' });
            this.threatLogs = logs || [];
            
            // Update threat blips on radar
            this.updateThreatBlips();
            
            // Update threat log display
            this.updateThreatLogDisplay();
            
        } catch (error) {
            console.error('Failed to load threat logs:', error);
            this.threatLogs = [];
        }
    }

    updateDisplay() {
        // Update subscription status
        const subscriptionElement = document.getElementById('subscriptionType');
        const subscriptionBanner = document.getElementById('subscriptionBanner');
        const upgradeBtn = document.getElementById('upgradeBtn');
        
        if (this.userData.subscriptionType === 'premium' || this.userData.subscriptionType === 'god') {
            subscriptionElement.textContent = this.userData.subscriptionType.toUpperCase();
            subscriptionElement.style.color = '#00ff41';
            
            subscriptionBanner.innerHTML = `
                <div>${this.userData.subscriptionType.toUpperCase()} TIER - FULL PROTECTION</div>
                <div style="margin-top: 4px; font-size: 9px;">All systems operational</div>
            `;
            subscriptionBanner.classList.add('premium');
            
            upgradeBtn.style.display = 'none';
        } else {
            subscriptionElement.textContent = 'FREE';
            subscriptionElement.style.color = '#ffb000';
        }

        // Update protection status
        const protectionStatus = document.getElementById('protectionStatus');
        const protectionText = document.getElementById('protectionText');
        const realTimeStatus = document.getElementById('realTimeStatus');
        
        if (this.userData.settings.real_time_protection) {
            protectionStatus.className = 'status-indicator status-active';
            protectionText.textContent = 'PROTECTION ACTIVE';
            realTimeStatus.textContent = 'ON';
            realTimeStatus.style.color = '#00ff41';
        } else {
            protectionStatus.className = 'status-indicator status-warning';
            protectionText.textContent = 'LIMITED PROTECTION';
            realTimeStatus.textContent = 'OFF';
            realTimeStatus.style.color = '#ffb000';
        }

        // Update statistics
        document.getElementById('threatsBlocked').textContent = this.userData.threatsBlocked;
        document.getElementById('apiCalls').textContent = this.userData.apiCalls;
        
        // Update last scan time
        const lastScanElement = document.getElementById('lastScan');
        if (this.userData.lastScan) {
            const scanTime = new Date(this.userData.lastScan);
            const now = new Date();
            const diffMinutes = Math.floor((now - scanTime) / (1000 * 60));
            
            if (diffMinutes < 60) {
                lastScanElement.textContent = `${diffMinutes}m AGO`;
            } else if (diffMinutes < 1440) {
                lastScanElement.textContent = `${Math.floor(diffMinutes / 60)}h AGO`;
            } else {
                lastScanElement.textContent = `${Math.floor(diffMinutes / 1440)}d AGO`;
            }
        } else {
            lastScanElement.textContent = 'NEVER';
        }
    }

    updateThreatBlips() {
        const threatBlipsContainer = document.getElementById('threatBlips');
        threatBlipsContainer.innerHTML = '';
        
        // Show recent threats as blips on radar
        const recentThreats = this.threatLogs.slice(0, 8); // Show max 8 blips
        
        recentThreats.forEach((threat, index) => {
            const blip = document.createElement('div');
            blip.className = `threat-blip threat-${this.getThreatSeverity(threat)}`;
            blip.dataset.threatId = index;
            
            // Position blips around the radar in a circle
            const angle = (index * 45) * (Math.PI / 180); // 45 degrees apart
            const radius = 60 + (Math.random() * 30); // Random radius between 60-90px
            const x = 50 + Math.cos(angle) * radius; // 50% center + offset
            const y = 50 + Math.sin(angle) * radius;
            
            blip.style.left = `${x}%`;
            blip.style.top = `${y}%`;
            blip.style.transform = 'translate(-50%, -50%)';
            
            // Add pulsing animation for recent threats
            const age = Date.now() - threat.timestamp;
            if (age < 5 * 60 * 1000) { // Less than 5 minutes old
                blip.style.animation = 'blink 0.5s ease-in-out infinite alternate';
            }
            
            threatBlipsContainer.appendChild(blip);
        });
    }

    getThreatSeverity(threat) {
        const confidence = threat.threat?.confidence_score || 0;
        if (confidence >= 0.8) return 'critical';
        if (confidence >= 0.6) return 'high';
        if (confidence >= 0.4) return 'medium';
        return 'low';
    }

    updateThreatLogDisplay() {
        const threatLogContainer = document.getElementById('threatLog');
        const loadingElement = document.getElementById('loadingLogs');
        
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        if (this.threatLogs.length === 0) {
            threatLogContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: rgba(0,255,65,0.6);">NO THREATS DETECTED</div>';
            return;
        }
        
        const recentLogs = this.threatLogs.slice(0, 5); // Show 5 most recent
        threatLogContainer.innerHTML = '';
        
        recentLogs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            
            const timeStr = new Date(log.timestamp).toLocaleTimeString([], { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            const domain = this.extractDomain(log.url);
            const threatType = log.threat?.threat_type || 'SUSPICIOUS';
            const blocked = log.blocked ? 'BLOCKED' : 'DETECTED';
            
            logEntry.innerHTML = `
                <span class="log-time">${timeStr}</span> 
                <span class="log-threat">${threatType.toUpperCase()}</span> 
                <span class="${log.blocked ? 'log-blocked' : ''}">${blocked}</span>
                <br>
                <span style="font-size: 9px; color: rgba(0,255,65,0.5);">${domain}</span>
            `;
            
            threatLogContainer.appendChild(logEntry);
        });
    }

    extractDomain(url) {
        try {
            return new URL(url).hostname;
        } catch (e) {
            return url.length > 30 ? url.substring(0, 30) + '...' : url;
        }
    }

    async performManualScan() {
        const scanBtn = document.getElementById('scanNow');
        const originalText = scanBtn.textContent;
        
        try {
            scanBtn.textContent = '🔄 SCANNING...';
            scanBtn.disabled = true;
            
            // Send scan request to background script
            const result = await this.sendMessageToBackground({ type: 'manual_scan' });
            
            if (result.success) {
                scanBtn.textContent = '✅ SCAN COMPLETE';
                
                // Update last scan time
                this.userData.lastScan = Date.now();
                await chrome.storage.local.set({ last_scan_time: this.userData.lastScan });
                
                // Refresh threat logs
                setTimeout(() => this.loadThreatLogs(), 1000);
            } else {
                scanBtn.textContent = '❌ SCAN FAILED';
                console.error('Scan failed:', result.error);
            }
            
        } catch (error) {
            console.error('Manual scan error:', error);
            scanBtn.textContent = '❌ SCAN FAILED';
        } finally {
            setTimeout(() => {
                scanBtn.textContent = originalText;
                scanBtn.disabled = false;
            }, 3000);
        }
        
        // Update display
        this.updateDisplay();
    }

    showThreatDetails(threatId) {
        const threat = this.threatLogs[threatId];
        if (!threat) return;
        
        const domain = this.extractDomain(threat.url);
        const confidence = Math.round((threat.threat?.confidence_score || 0) * 100);
        const severity = (threat.threat?.severity || 'unknown').toUpperCase();
        
        // Create a simple modal-like notification
        chrome.notifications.create(`threat_details_${Date.now()}`, {
            type: 'basic',
            iconUrl: '../icons/icon48.png',
            title: `🛡️ THREAT DETAILS`,
            message: `${domain} - ${severity} THREAT`,
            contextMessage: `Confidence: ${confidence}% | ${threat.blocked ? 'BLOCKED' : 'DETECTED'} | ${new Date(threat.timestamp).toLocaleString()}`
        });
    }

    startRealTimeUpdates() {
        // Update display every 30 seconds
        setInterval(() => {
            this.loadThreatLogs();
            this.updateDisplay();
        }, 30000);
        
        // Update radar sweep animation and blips every 5 seconds
        setInterval(() => {
            this.updateThreatBlips();
        }, 5000);
    }

    async sendMessageToBackground(message) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, (response) => {
                resolve(response);
            });
        });
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const popup = new ZroDayPopup();
});

console.log('ZRO-DAY Security Popup: Script loaded');