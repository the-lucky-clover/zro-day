// Zro-Day Browser Watchdog - Background Script
// Enhanced cybersecurity protection with distributed anomaly detection

class ZroDayWatchdog {
    constructor() {
        this.threatDatabase = new Map();
        this.anomalyDetector = new AnomalyDetector();
        this.telemetryCollector = new TelemetryCollector();
        this.initialize();
    }

    async initialize() {
        console.log('Zro-Day Browser Watchdog initializing...');
        
        // Load threat intelligence
        await this.loadThreatIntelligence();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize anomaly detection
        await this.anomalyDetector.initialize();
        
        // Start telemetry collection
        this.telemetryCollector.start();
        
        console.log('Zro-Day Browser Watchdog initialized successfully');
    }

    setupEventListeners() {
        // Web request monitoring
        chrome.webRequest.onBeforeRequest.addListener(
            this.handleWebRequest.bind(this),
            { urls: ["<all_urls>"] },
            ["blocking"]
        );

        // Tab updates
        chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));

        // Extension messages
        chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));

        // Alarm for periodic tasks
        chrome.alarms.create('periodicScan', { periodInMinutes: 5 });
        chrome.alarms.onAlarm.addListener(this.handleAlarm.bind(this));
    }

    async loadThreatIntelligence() {
        try {
            // Load from local storage first
            const stored = await chrome.storage.local.get(['threatDatabase', 'lastUpdate']);
            
            if (stored.threatDatabase) {
                this.threatDatabase = new Map(stored.threatDatabase);
            }

            // Check if update is needed (every 4 hours)
            const now = Date.now();
            const lastUpdate = stored.lastUpdate || 0;
            const updateInterval = 4 * 60 * 60 * 1000; // 4 hours

            if (now - lastUpdate > updateInterval) {
                await this.updateThreatIntelligence();
            }
        } catch (error) {
            console.error('Failed to load threat intelligence:', error);
        }
    }

    async updateThreatIntelligence() {
        try {
            // Fetch latest threat intelligence from Zro-Day Research Labs API
            const response = await fetch('https://api.zrodayresearchlabs.com/v1/threats', {
                headers: {
                    'Authorization': `Bearer ${await this.getApiKey()}`,
                    'User-Agent': 'ZroDayWatchdog/1.0'
                }
            });

            if (response.ok) {
                const threats = await response.json();
                
                // Update local database
                threats.forEach(threat => {
                    this.threatDatabase.set(threat.indicator, {
                        type: threat.type,
                        severity: threat.severity,
                        description: threat.description,
                        timestamp: threat.timestamp
                    });
                });

                // Save to storage
                await chrome.storage.local.set({
                    threatDatabase: Array.from(this.threatDatabase.entries()),
                    lastUpdate: Date.now()
                });

                console.log(`Updated threat database with ${threats.length} indicators`);
            }
        } catch (error) {
            console.error('Failed to update threat intelligence:', error);
        }
    }

    async handleWebRequest(details) {
        const url = new URL(details.url);
        
        // Check against threat database
        const threat = this.checkThreatDatabase(url);
        if (threat) {
            this.blockThreat(details, threat);
            return { cancel: true };
        }

        // Anomaly detection
        const anomaly = await this.anomalyDetector.analyzeRequest(details);
        if (anomaly.isAnomalous && anomaly.confidence > 0.8) {
            this.handleAnomaly(details, anomaly);
            
            if (anomaly.severity === 'high') {
                return { cancel: true };
            }
        }

        // Collect telemetry (anonymized)
        this.telemetryCollector.recordRequest(details, anomaly);

        return {};
    }

    checkThreatDatabase(url) {
        // Check hostname
        const hostname = url.hostname;
        if (this.threatDatabase.has(hostname)) {
            return this.threatDatabase.get(hostname);
        }

        // Check full URL
        const fullUrl = url.href;
        if (this.threatDatabase.has(fullUrl)) {
            return this.threatDatabase.get(fullUrl);
        }

        // Check URL patterns
        for (const [pattern, threat] of this.threatDatabase) {
            if (pattern.includes('*') && this.matchPattern(fullUrl, pattern)) {
                return threat;
            }
        }

        return null;
    }

    matchPattern(url, pattern) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(url);
    }

    async blockThreat(details, threat) {
        // Log the blocked threat
        console.log('Blocked threat:', details.url, threat);

        // Update statistics
        await this.updateThreatStats(threat.type);

        // Show notification
        this.showThreatNotification(threat);

        // Send to telemetry (anonymized)
        this.telemetryCollector.recordThreatBlock(threat.type, threat.severity);
    }

    async handleAnomaly(details, anomaly) {
        console.log('Anomaly detected:', details.url, anomaly);

        // Send anonymized data to distributed analysis
        await this.sendAnomalyData(anomaly);

        // Update local anomaly statistics
        await this.updateAnomalyStats(anomaly);
    }

    async handleTabUpdate(tabId, changeInfo, tab) {
        if (changeInfo.status === 'complete' && tab.url) {
            // Inject content script for additional protection
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                });
            } catch (error) {
                console.error('Failed to inject content script:', error);
            }
        }
    }

    async handleMessage(message, sender, sendResponse) {
        switch (message.type) {
            case 'getThreatStats':
                const stats = await this.getThreatStats();
                sendResponse(stats);
                break;

            case 'reportSuspiciousActivity':
                await this.handleSuspiciousActivity(message.data);
                sendResponse({ success: true });
                break;

            case 'updateSettings':
                await this.updateSettings(message.settings);
                sendResponse({ success: true });
                break;

            default:
                console.warn('Unknown message type:', message.type);
        }
    }

    async handleAlarm(alarm) {
        switch (alarm.name) {
            case 'periodicScan':
                await this.performPeriodicScan();
                break;
        }
    }

    async performPeriodicScan() {
        // Check for updates to threat intelligence
        await this.updateThreatIntelligence();

        // Analyze collected telemetry for patterns
        await this.analyzeTelemetryPatterns();

        // Clean up old data
        await this.cleanupOldData();
    }

    async getApiKey() {
        const result = await chrome.storage.sync.get(['apiKey']);
        return result.apiKey || '';
    }

    showThreatNotification(threat) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'images/icon-48.png',
            title: 'Zro-Day Watchdog - Threat Blocked',
            message: `Blocked ${threat.type}: ${threat.description}`
        });
    }

    async updateThreatStats(threatType) {
        const stats = await chrome.storage.local.get(['threatStats']) || {};
        const threatStats = stats.threatStats || {};
        
        threatStats[threatType] = (threatStats[threatType] || 0) + 1;
        threatStats.total = (threatStats.total || 0) + 1;
        threatStats.lastUpdate = Date.now();

        await chrome.storage.local.set({ threatStats });
    }

    async getThreatStats() {
        const result = await chrome.storage.local.get(['threatStats']);
        return result.threatStats || { total: 0 };
    }
}

// Anomaly Detection Engine
class AnomalyDetector {
    constructor() {
        this.patterns = new Map();
        this.behaviorBaseline = new Map();
    }

    async initialize() {
        // Load ML models and patterns
        await this.loadPatterns();
        await this.loadBehaviorBaseline();
    }

    async analyzeRequest(details) {
        const features = this.extractFeatures(details);
        
        // Check against known attack patterns
        const patternMatch = this.checkPatterns(features);
        
        // Behavioral analysis
        const behaviorAnomaly = this.analyzeBehavior(features);
        
        // Combine results
        const confidence = Math.max(patternMatch.confidence, behaviorAnomaly.confidence);
        const isAnomalous = confidence > 0.5;
        
        return {
            isAnomalous,
            confidence,
            severity: this.calculateSeverity(confidence),
            patterns: patternMatch.matches,
            behavioral: behaviorAnomaly
        };
    }

    extractFeatures(details) {
        const url = new URL(details.url);
        
        return {
            hostname: url.hostname,
            path: url.pathname,
            queryParams: url.searchParams.toString(),
            method: details.method,
            timestamp: details.timeStamp,
            requestSize: details.requestBody ? details.requestBody.raw?.length || 0 : 0,
            hasUserAgent: details.requestHeaders?.some(h => h.name.toLowerCase() === 'user-agent'),
            isHttps: url.protocol === 'https:',
            domainAge: this.estimateDomainAge(url.hostname),
            suspiciousChars: this.countSuspiciousChars(details.url)
        };
    }

    checkPatterns(features) {
        const matches = [];
        let maxConfidence = 0;

        for (const [patternName, pattern] of this.patterns) {
            const confidence = this.evaluatePattern(features, pattern);
            if (confidence > 0.3) {
                matches.push({ name: patternName, confidence });
                maxConfidence = Math.max(maxConfidence, confidence);
            }
        }

        return { matches, confidence: maxConfidence };
    }

    analyzeBehavior(features) {
        // Compare against baseline behavior
        const baseline = this.behaviorBaseline.get(features.hostname) || {};
        
        let anomalyScore = 0;
        
        // Check request frequency
        if (baseline.avgRequestsPerMinute) {
            const currentRate = this.getCurrentRequestRate(features.hostname);
            if (currentRate > baseline.avgRequestsPerMinute * 3) {
                anomalyScore += 0.3;
            }
        }

        // Check unusual request patterns
        if (features.suspiciousChars > 10) {
            anomalyScore += 0.2;
        }

        // Check for potential data exfiltration
        if (features.requestSize > 100000) { // 100KB
            anomalyScore += 0.4;
        }

        return {
            confidence: Math.min(anomalyScore, 1.0),
            factors: {
                requestRate: currentRate > (baseline.avgRequestsPerMinute || 0) * 3,
                suspiciousChars: features.suspiciousChars > 10,
                largeRequest: features.requestSize > 100000
            }
        };
    }

    calculateSeverity(confidence) {
        if (confidence > 0.8) return 'high';
        if (confidence > 0.6) return 'medium';
        if (confidence > 0.4) return 'low';
        return 'info';
    }

    async loadPatterns() {
        // Load predefined attack patterns
        this.patterns.set('pegasus_indicator', {
            urlPatterns: [/\/[a-f0-9]{32}\//, /\.php\?[a-z]{1,3}=[0-9a-f]{8,}/],
            headerPatterns: [],
            confidence: 0.9
        });

        this.patterns.set('granite_indicator', {
            urlPatterns: [/\/api\/v[0-9]\/[a-z]{8}/, /\.aspx\?id=[0-9a-f]{16}/],
            headerPatterns: [],
            confidence: 0.85
        });
    }

    async loadBehaviorBaseline() {
        const stored = await chrome.storage.local.get(['behaviorBaseline']);
        if (stored.behaviorBaseline) {
            this.behaviorBaseline = new Map(stored.behaviorBaseline);
        }
    }

    evaluatePattern(features, pattern) {
        let score = 0;
        
        // Check URL patterns
        for (const urlPattern of pattern.urlPatterns) {
            if (urlPattern.test(features.hostname + features.path + features.queryParams)) {
                score += 0.5;
            }
        }

        return Math.min(score, pattern.confidence);
    }

    getCurrentRequestRate(hostname) {
        // Implementation would track request rates per hostname
        return 0;
    }

    estimateDomainAge(hostname) {
        // Simplified domain age estimation
        return 365; // Default to 1 year
    }

    countSuspiciousChars(url) {
        const suspicious = /[<>{}|\\^`\[\]]/g;
        const matches = url.match(suspicious);
        return matches ? matches.length : 0;
    }
}

// Telemetry Collection (Anonymized)
class TelemetryCollector {
    constructor() {
        this.buffer = [];
        this.maxBufferSize = 1000;
    }

    start() {
        // Periodic transmission of anonymized data
        setInterval(() => {
            this.transmitTelemetry();
        }, 300000); // Every 5 minutes
    }

    recordRequest(details, anomaly) {
        const telemetryData = {
            timestamp: Date.now(),
            hostname: this.hashHostname(details.url),
            method: details.method,
            isAnomalous: anomaly.isAnomalous,
            confidence: anomaly.confidence,
            severity: anomaly.severity
        };

        this.buffer.push(telemetryData);

        if (this.buffer.length > this.maxBufferSize) {
            this.buffer.shift(); // Remove oldest entry
        }
    }

    recordThreatBlock(type, severity) {
        const telemetryData = {
            timestamp: Date.now(),
            event: 'threat_blocked',
            threatType: type,
            severity: severity
        };

        this.buffer.push(telemetryData);
    }

    async transmitTelemetry() {
        if (this.buffer.length === 0) return;

        try {
            const response = await fetch('https://api.zrodayresearchlabs.com/v1/telemetry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getApiKey()}`
                },
                body: JSON.stringify({
                    data: this.buffer,
                    version: '1.0',
                    client: 'ios-safari-extension'
                })
            });

            if (response.ok) {
                console.log(`Transmitted ${this.buffer.length} telemetry records`);
                this.buffer = []; // Clear buffer
            }
        } catch (error) {
            console.error('Failed to transmit telemetry:', error);
        }
    }

    hashHostname(url) {
        // Simple hash function for anonymization
        const hostname = new URL(url).hostname;
        let hash = 0;
        for (let i = 0; i < hostname.length; i++) {
            const char = hostname.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }

    async getApiKey() {
        const result = await chrome.storage.sync.get(['apiKey']);
        return result.apiKey || '';
    }
}

// Initialize the watchdog
const watchdog = new ZroDayWatchdog();
