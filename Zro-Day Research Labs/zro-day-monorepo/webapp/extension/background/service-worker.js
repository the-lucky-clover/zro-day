z// ZRO-DAY Security Extension - Background Service Worker
// Advanced threat detection and real-time protection

const API_BASE_URL = 'https://zro-day.com/api';
// For development: 'http://localhost:3000/api'

class ZroDaySecurityService {
  constructor() {
    this.apiToken = null;
    this.settings = null;
    this.threatDatabase = new Map();
    this.scanQueue = [];
    this.isScanning = false;
    
    this.initializeExtension();
  }

  async initializeExtension() {
    console.log('ZRO-DAY Security Extension initialized');
    
    // Load stored authentication and settings
    const stored = await chrome.storage.local.get(['auth_token', 'user_settings', 'extension_id']);
    this.apiToken = stored.auth_token;
    this.settings = stored.user_settings || this.getDefaultSettings();
    
    if (!stored.extension_id) {
      const extensionId = this.generateExtensionId();
      await chrome.storage.local.set({ extension_id: extensionId });
    }
    
    // Set up request listeners
    this.setupRequestInterceptors();
    
    // Set up periodic tasks
    this.setupPeriodicTasks();
    
    // Set up alarm for scheduled scans
    chrome.alarms.create('scheduled_scan', { 
      delayInMinutes: 1,
      periodInMinutes: this.settings.scan_frequency_hours * 60 
    });
  }

  getDefaultSettings() {
    return {
      real_time_protection: true,
      block_malicious_downloads: true,
      phishing_protection: true,
      safe_browsing: true,
      notification_level: 'standard',
      whitelist_domains: [],
      blacklist_domains: [],
      scan_frequency_hours: 24
    };
  }

  generateExtensionId() {
    return 'zrd_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  setupRequestInterceptors() {
    // Intercept web requests for real-time threat checking
    chrome.webRequest.onBeforeRequest.addListener(
      async (details) => {
        if (!this.settings.real_time_protection) return {};
        
        const url = details.url;
        const domain = new URL(url).hostname;
        
        // Skip internal and whitelisted domains
        if (this.isWhitelistedDomain(domain)) return {};
        
        // Check if domain/URL is in threat database
        const threatCheck = await this.checkThreat({ url, domain });
        
        if (threatCheck.is_threat && threatCheck.blocked) {
          console.log('ZRO-DAY: Blocked malicious request:', url);
          
          // Show threat notification
          this.showThreatNotification(threatCheck, url);
          
          // Log the blocked threat
          this.logThreatDetection(url, threatCheck);
          
          // Block the request
          return { cancel: true };
        }
        
        return {};
      },
      { urls: ["<all_urls>"] },
      ["blocking"]
    );

    // Monitor downloads for malware
    chrome.downloads.onCreated.addListener(async (downloadItem) => {
      if (!this.settings.block_malicious_downloads) return;
      
      const threatCheck = await this.checkThreat({ 
        url: downloadItem.url,
        domain: new URL(downloadItem.url).hostname 
      });
      
      if (threatCheck.is_threat) {
        console.log('ZRO-DAY: Malicious download detected:', downloadItem.url);
        
        // Cancel the download
        chrome.downloads.cancel(downloadItem.id);
        
        // Show warning notification
        this.showDownloadThreatNotification(threatCheck, downloadItem);
        
        // Log the blocked download
        this.logThreatDetection(downloadItem.url, threatCheck);
      }
    });
  }

  setupPeriodicTasks() {
    // Listen for alarms (scheduled scans)
    chrome.alarms.onAlarm.addListener(async (alarm) => {
      if (alarm.name === 'scheduled_scan') {
        await this.performScheduledScan();
      } else if (alarm.name === 'heartbeat') {
        await this.sendHeartbeat();
      }
    });

    // Set up heartbeat every 15 minutes
    chrome.alarms.create('heartbeat', { 
      delayInMinutes: 1,
      periodInMinutes: 15 
    });

    // Update threat intelligence database periodically
    setInterval(() => {
      this.updateThreatDatabase();
    }, 60 * 60 * 1000); // Every hour
  }

  async checkThreat(indicators) {
    try {
      // First check local cache
      const cacheKey = indicators.url || indicators.domain || indicators.ip;
      if (this.threatDatabase.has(cacheKey)) {
        return this.threatDatabase.get(cacheKey);
      }

      // Check with ZRO-DAY API if authenticated
      if (this.apiToken) {
        const response = await fetch(`${API_BASE_URL}/threats/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiToken}`,
            'X-Extension-ID': await this.getExtensionId()
          },
          body: JSON.stringify(indicators)
        });

        if (response.ok) {
          const result = await response.json();
          
          // Cache the result for 1 hour
          this.threatDatabase.set(cacheKey, result);
          setTimeout(() => {
            this.threatDatabase.delete(cacheKey);
          }, 60 * 60 * 1000);
          
          return result;
        }
      }

      // Fallback to basic heuristics if API unavailable
      return this.performBasicThreatCheck(indicators);
      
    } catch (error) {
      console.error('ZRO-DAY: Threat check failed:', error);
      return { is_threat: false, confidence_score: 0, blocked: false, recommendations: [] };
    }
  }

  performBasicThreatCheck(indicators) {
    const url = indicators.url;
    const domain = indicators.domain;
    
    // Basic heuristic checks
    let riskScore = 0;
    const risks = [];

    // Check for suspicious URL patterns
    if (url) {
      // Check for suspicious TLDs
      const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.click', '.download'];
      if (suspiciousTlds.some(tld => domain.endsWith(tld))) {
        riskScore += 0.3;
        risks.push('Suspicious domain extension');
      }

      // Check for URL shorteners that could hide malicious content
      const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly'];
      if (shorteners.includes(domain)) {
        riskScore += 0.2;
        risks.push('URL shortener detected');
      }

      // Check for typosquatting patterns
      const popularSites = ['google', 'facebook', 'amazon', 'microsoft', 'apple', 'paypal', 'github'];
      for (const site of popularSites) {
        if (domain.includes(site) && !domain.includes(`${site}.com`)) {
          riskScore += 0.4;
          risks.push('Possible typosquatting attempt');
          break;
        }
      }

      // Check for suspicious patterns in URL
      const suspiciousPatterns = [
        /login.*secure/i,
        /update.*account/i,
        /verify.*identity/i,
        /suspended.*account/i,
        /urgent.*action/i
      ];
      
      if (suspiciousPatterns.some(pattern => pattern.test(url))) {
        riskScore += 0.3;
        risks.push('Suspicious URL pattern detected');
      }
    }

    const isThreat = riskScore >= 0.5;
    
    return {
      is_threat: isThreat,
      confidence_score: riskScore,
      severity: riskScore >= 0.7 ? 'high' : 'medium',
      blocked: isThreat && riskScore >= 0.7,
      recommendations: isThreat ? [
        'Exercise caution when interacting with this content',
        'Verify the legitimacy of this website',
        'Do not enter personal information'
      ] : [],
      detection_method: 'heuristic',
      risk_factors: risks
    };
  }

  async performScheduledScan() {
    console.log('ZRO-DAY: Performing scheduled security scan');
    
    try {
      // Get all open tabs for scanning
      const tabs = await chrome.tabs.query({});
      const scanTargets = tabs.map(tab => tab.url).filter(url => url.startsWith('http'));
      
      if (this.apiToken) {
        const response = await fetch(`${API_BASE_URL}/threats/scan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiToken}`,
            'X-Extension-ID': await this.getExtensionId()
          },
          body: JSON.stringify({
            scan_type: 'scheduled',
            targets: scanTargets.slice(0, 10) // Limit to 10 URLs for free users
          })
        });

        if (response.ok) {
          const scanResult = await response.json();
          console.log('ZRO-DAY: Scan completed:', scanResult);
          
          if (scanResult.threats_found > 0) {
            this.showScanResultNotification(scanResult);
          }
        }
      }
      
      // Update badge with scan status
      this.updateExtensionBadge('✓', '#00ff41');
      setTimeout(() => this.updateExtensionBadge('', ''), 3000);
      
    } catch (error) {
      console.error('ZRO-DAY: Scheduled scan failed:', error);
    }
  }

  async sendHeartbeat() {
    if (!this.apiToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/extension/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`,
          'X-Extension-ID': await this.getExtensionId()
        },
        body: JSON.stringify({
          extension_id: await this.getExtensionId(),
          version: chrome.runtime.getManifest().version
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('ZRO-DAY: Heartbeat successful:', result);
      }
    } catch (error) {
      console.error('ZRO-DAY: Heartbeat failed:', error);
    }
  }

  isWhitelistedDomain(domain) {
    // Internal domains and common CDNs
    const internalDomains = [
      'localhost',
      '127.0.0.1',
      'chrome-extension://',
      'chrome://',
      'about:',
      'data:',
      'blob:',
      'zro-day.com'
    ];

    if (internalDomains.some(internal => domain.includes(internal))) {
      return true;
    }

    // Check user whitelist
    return this.settings.whitelist_domains.some(whitelisted => 
      domain.includes(whitelisted) || domain.endsWith(whitelisted)
    );
  }

  showThreatNotification(threatCheck, url) {
    const domain = new URL(url).hostname;
    
    chrome.notifications.create(`threat_${Date.now()}`, {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: '🛡️ ZRO-DAY THREAT BLOCKED',
      message: `Blocked ${threatCheck.threat_type || 'malicious'} threat from ${domain}`,
      contextMessage: `Confidence: ${Math.round(threatCheck.confidence_score * 100)}% | Severity: ${threatCheck.severity?.toUpperCase() || 'MEDIUM'}`,
      priority: 2
    });

    // Update badge to show blocked threat
    this.updateExtensionBadge('!', '#ff0000');
  }

  showDownloadThreatNotification(threatCheck, downloadItem) {
    chrome.notifications.create(`download_threat_${Date.now()}`, {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: '🚫 MALICIOUS DOWNLOAD BLOCKED',
      message: `Prevented download of infected file: ${downloadItem.filename}`,
      contextMessage: `Threat: ${threatCheck.threat_type?.toUpperCase() || 'MALWARE'} | Source: ${new URL(downloadItem.url).hostname}`,
      priority: 2
    });
  }

  showScanResultNotification(scanResult) {
    chrome.notifications.create(`scan_result_${Date.now()}`, {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: '🔍 SECURITY SCAN COMPLETE',
      message: `Found ${scanResult.threats_found} threats, blocked ${scanResult.threats_blocked}`,
      contextMessage: `Scan type: ${scanResult.scan_type?.toUpperCase()} | Duration: ${scanResult.duration_seconds}s`,
      priority: 1
    });
  }

  updateExtensionBadge(text, color) {
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color });
  }

  async logThreatDetection(url, threatCheck) {
    // Store locally for popup display
    const logs = await chrome.storage.local.get(['threat_logs']) || { threat_logs: [] };
    logs.threat_logs.unshift({
      url,
      threat: threatCheck,
      timestamp: Date.now(),
      blocked: threatCheck.blocked
    });
    
    // Keep only last 100 logs
    logs.threat_logs = logs.threat_logs.slice(0, 100);
    
    await chrome.storage.local.set({ threat_logs: logs.threat_logs });
  }

  async getExtensionId() {
    const stored = await chrome.storage.local.get(['extension_id']);
    return stored.extension_id || 'unknown';
  }

  async updateThreatDatabase() {
    // Periodically sync with server threat intelligence
    if (!this.apiToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/threats/intelligence?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'X-Extension-ID': await this.getExtensionId()
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`ZRO-DAY: Updated threat database with ${data.threat_intelligence.length} entries`);
      }
    } catch (error) {
      console.error('ZRO-DAY: Failed to update threat database:', error);
    }
  }
}

// Initialize the security service
const zroDaySecurity = new ZroDaySecurityService();

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'get_threat_logs') {
    chrome.storage.local.get(['threat_logs']).then(data => {
      sendResponse(data.threat_logs || []);
    });
    return true; // Will respond asynchronously
  }
  
  if (request.type === 'manual_scan') {
    zroDaySecurity.performScheduledScan().then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
  
  if (request.type === 'update_settings') {
    chrome.storage.local.set({ user_settings: request.settings }).then(() => {
      zroDaySecurity.settings = request.settings;
      sendResponse({ success: true });
    });
    return true;
  }
});

console.log('ZRO-DAY Security Extension: Background service worker loaded');