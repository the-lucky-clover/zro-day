// ZRO-DAY Security Extension - Content Script
// Real-time page analysis and threat detection

class ZroDayContentScript {
    constructor() {
        this.pageAnalyzed = false;
        this.threatsDetected = [];
        this.observerActive = false;
        
        this.initializeContentScript();
    }

    initializeContentScript() {
        console.log('ZRO-DAY Content Script: Initializing on', window.location.hostname);
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startAnalysis());
        } else {
            this.startAnalysis();
        }
    }

    async startAnalysis() {
        try {
            // Perform initial page analysis
            await this.analyzeCurrentPage();
            
            // Set up real-time monitoring
            this.setupPageMonitoring();
            
            // Check for phishing indicators
            this.checkForPhishingIndicators();
            
            // Monitor form submissions
            this.monitorFormSubmissions();
            
            console.log('ZRO-DAY Content Script: Analysis complete');
        } catch (error) {
            console.error('ZRO-DAY Content Script: Analysis failed', error);
        }
    }

    async analyzeCurrentPage() {
        if (this.pageAnalyzed) return;
        
        const pageData = {
            url: window.location.href,
            domain: window.location.hostname,
            title: document.title,
            hasLoginForm: this.hasLoginForm(),
            hasDownloadLinks: this.hasDownloadLinks(),
            suspiciousElements: this.findSuspiciousElements()
        };

        // Send page data to background script for threat analysis
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'analyze_page',
                data: pageData
            });

            if (response && response.threats_detected) {
                this.handleThreatsDetected(response.threats_detected);
            }
        } catch (error) {
            console.error('Failed to analyze page:', error);
        }

        this.pageAnalyzed = true;
    }

    setupPageMonitoring() {
        if (this.observerActive) return;

        // Monitor DOM changes for dynamically loaded content
        const observer = new MutationObserver((mutations) => {
            let significantChange = false;
            
            mutations.forEach((mutation) => {
                // Check for new forms, links, or scripts
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.tagName === 'FORM' || 
                                node.tagName === 'SCRIPT' || 
                                node.querySelector('form, script, a[href*="download"]')) {
                                significantChange = true;
                            }
                        }
                    });
                }
            });

            if (significantChange) {
                // Debounce re-analysis
                clearTimeout(this.reanalysisTimer);
                this.reanalysisTimer = setTimeout(() => {
                    this.checkForPhishingIndicators();
                }, 1000);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.observerActive = true;
    }

    checkForPhishingIndicators() {
        const phishingIndicators = [];
        
        // Check for suspicious login forms
        const loginForms = this.findLoginForms();
        loginForms.forEach(form => {
            const indicators = this.analyzeLoginForm(form);
            if (indicators.length > 0) {
                phishingIndicators.push({
                    type: 'suspicious_login_form',
                    element: form,
                    indicators: indicators
                });
            }
        });

        // Check for fake security warnings
        const securityWarnings = this.findFakeSecurityWarnings();
        if (securityWarnings.length > 0) {
            phishingIndicators.push({
                type: 'fake_security_warning',
                elements: securityWarnings
            });
        }

        // Check for suspicious redirects
        this.checkForSuspiciousRedirects();

        // If phishing indicators found, show warning
        if (phishingIndicators.length > 0) {
            this.showPhishingWarning(phishingIndicators);
        }
    }

    findLoginForms() {
        const forms = document.querySelectorAll('form');
        const loginForms = [];

        forms.forEach(form => {
            const inputs = form.querySelectorAll('input');
            let hasPassword = false;
            let hasEmailOrUsername = false;

            inputs.forEach(input => {
                if (input.type === 'password') hasPassword = true;
                if (input.type === 'email' || input.name.match(/email|username|user/i)) {
                    hasEmailOrUsername = true;
                }
            });

            if (hasPassword && hasEmailOrUsername) {
                loginForms.push(form);
            }
        });

        return loginForms;
    }

    analyzeLoginForm(form) {
        const indicators = [];
        const action = form.action || '';
        const method = form.method || '';

        // Check form action URL
        if (action && !action.startsWith('https://')) {
            indicators.push('Insecure form submission (not HTTPS)');
        }

        // Check for suspicious action domains
        const actionDomain = action ? new URL(action, window.location.href).hostname : '';
        if (actionDomain && actionDomain !== window.location.hostname) {
            indicators.push(`Form submits to different domain: ${actionDomain}`);
        }

        // Check for hidden inputs with suspicious names
        const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
        hiddenInputs.forEach(input => {
            if (input.name.match(/redirect|return|continue/i) && 
                input.value.includes('http')) {
                indicators.push('Suspicious redirect in hidden input');
            }
        });

        // Check form styling (hidden or off-screen forms)
        const style = window.getComputedStyle(form);
        if (style.display === 'none' || 
            style.visibility === 'hidden' ||
            style.position === 'absolute' && (
                parseInt(style.left) < -1000 || 
                parseInt(style.top) < -1000
            )) {
            indicators.push('Hidden or off-screen form');
        }

        return indicators;
    }

    findFakeSecurityWarnings() {
        const suspiciousElements = [];
        const keywords = [
            'your computer is infected',
            'virus detected',
            'security alert',
            'call microsoft',
            'call support',
            'download now',
            'update required',
            'expired security'
        ];

        keywords.forEach(keyword => {
            const elements = document.querySelectorAll('*');
            elements.forEach(element => {
                const text = element.textContent.toLowerCase();
                if (text.includes(keyword) && element.children.length === 0) {
                    // Check if element has warning-like styling
                    const style = window.getComputedStyle(element);
                    if (style.color.includes('red') || 
                        style.backgroundColor.includes('red') ||
                        element.classList.contains('alert') ||
                        element.classList.contains('warning')) {
                        suspiciousElements.push(element);
                    }
                }
            });
        });

        return suspiciousElements;
    }

    checkForSuspiciousRedirects() {
        // Monitor for automatic redirects that might be malicious
        const originalLocation = window.location.href;
        
        setTimeout(() => {
            if (window.location.href !== originalLocation) {
                console.log('ZRO-DAY: Potential suspicious redirect detected');
                // Could implement more sophisticated redirect analysis here
            }
        }, 5000);
    }

    monitorFormSubmissions() {
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.tagName === 'FORM') {
                const formData = this.extractFormData(form);
                
                // Check if form contains sensitive data
                if (this.containsSensitiveData(formData)) {
                    // Analyze the submission for potential data theft
                    this.analyzeFormSubmission(form, formData);
                }
            }
        });
    }

    extractFormData(form) {
        const data = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.name) {
                data[input.name] = {
                    type: input.type,
                    value: input.type === 'password' ? '[PASSWORD]' : input.value,
                    name: input.name
                };
            }
        });
        
        return data;
    }

    containsSensitiveData(formData) {
        const sensitivePatterns = [
            /password/i,
            /email/i,
            /credit.*card/i,
            /ssn|social.*security/i,
            /phone/i,
            /address/i
        ];

        return Object.keys(formData).some(key => 
            sensitivePatterns.some(pattern => pattern.test(key))
        );
    }

    analyzeFormSubmission(form, formData) {
        const action = form.action || window.location.href;
        const actionDomain = new URL(action, window.location.href).hostname;
        
        // Check if submitting to suspicious domain
        if (actionDomain !== window.location.hostname) {
            this.showDataTheftWarning(actionDomain, Object.keys(formData));
        }
    }

    hasLoginForm() {
        return this.findLoginForms().length > 0;
    }

    hasDownloadLinks() {
        const downloadLinks = document.querySelectorAll('a[href*="download"], a[href$=".exe"], a[href$=".zip"], a[href$=".rar"]');
        return downloadLinks.length > 0;
    }

    findSuspiciousElements() {
        const suspicious = [];
        
        // Look for elements with suspicious content
        const suspiciousTexts = [
            'click here to claim',
            'you have won',
            'congratulations',
            'free money',
            'act now',
            'limited time',
            'verify your account'
        ];

        suspiciousTexts.forEach(text => {
            const elements = document.querySelectorAll(`*:contains("${text}")`);
            suspicious.push(...elements);
        });

        return suspicious.length;
    }

    showPhishingWarning(indicators) {
        // Create overlay warning
        const overlay = this.createThreatOverlay(
            'PHISHING ATTEMPT DETECTED',
            `This page shows ${indicators.length} phishing indicator(s). Exercise extreme caution.`,
            'phishing'
        );
        
        document.body.appendChild(overlay);
        
        // Log the threat
        console.log('ZRO-DAY: Phishing indicators detected:', indicators);
    }

    showDataTheftWarning(targetDomain, sensitiveFields) {
        const overlay = this.createThreatOverlay(
            'DATA THEFT WARNING',
            `This form will send sensitive data (${sensitiveFields.join(', ')}) to ${targetDomain}. This may be a data theft attempt.`,
            'data-theft'
        );
        
        document.body.appendChild(overlay);
    }

    createThreatOverlay(title, message, threatType) {
        const overlay = document.createElement('div');
        overlay.className = 'zro-day-threat-overlay';
        overlay.innerHTML = `
            <div class="zro-day-threat-modal">
                <div class="zro-day-threat-header">
                    <div class="zro-day-threat-icon">⚠️</div>
                    <div class="zro-day-threat-title">${title}</div>
                    <button class="zro-day-threat-close" onclick="this.closest('.zro-day-threat-overlay').remove()">×</button>
                </div>
                <div class="zro-day-threat-message">${message}</div>
                <div class="zro-day-threat-actions">
                    <button class="zro-day-btn zro-day-btn-danger" onclick="window.history.back()">
                        🛡️ LEAVE THIS PAGE
                    </button>
                    <button class="zro-day-btn zro-day-btn-secondary" onclick="this.closest('.zro-day-threat-overlay').remove()">
                        ⚠️ PROCEED ANYWAY
                    </button>
                </div>
                <div class="zro-day-threat-footer">
                    Protected by ZRO-DAY Security Extension
                </div>
            </div>
        `;

        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 30000);

        return overlay;
    }

    handleThreatsDetected(threats) {
        threats.forEach(threat => {
            console.log('ZRO-DAY: Threat detected by background analysis:', threat);
            
            if (threat.severity === 'high' || threat.severity === 'critical') {
                this.showPhishingWarning([threat]);
            }
        });
    }
}

// Initialize content script
if (window.location.hostname !== 'chrome-extension' && 
    window.location.protocol !== 'chrome-extension:') {
    const zroDayContent = new ZroDayContentScript();
}

console.log('ZRO-DAY Security Content Script: Loaded');