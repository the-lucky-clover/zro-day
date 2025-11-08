// Zro-Day Browser Watchdog - Content Script
// Provides real-time protection and anomaly detection within web pages

(function() {
    'use strict';

    // Prevent multiple injections
    if (window.zroDayWatchdogInjected) {
        return;
    }
    window.zroDayWatchdogInjected = true;

    class ZroDayContentProtector {
        constructor() {
            this.observers = [];
            this.protectionActive = true;
            this.suspiciousElements = new Set();
            this.initialize();
        }

        initialize() {
            console.log('Zro-Day Content Protector initializing...');
            
            // Setup DOM monitoring
            this.setupDOMMonitoring();
            
            // Setup form protection
            this.setupFormProtection();
            
            // Setup script injection detection
            this.setupScriptInjectionDetection();
            
            // Setup clipboard protection
            this.setupClipboardProtection();
            
            // Setup network monitoring
            this.setupNetworkMonitoring();
            
            console.log('Zro-Day Content Protector initialized');
        }

        setupDOMMonitoring() {
            // Monitor for suspicious DOM modifications
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                this.analyzeElement(node);
                            }
                        });
                    }
                });
            });

            observer.observe(document.body || document.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src', 'href', 'onclick', 'onload']
            });

            this.observers.push(observer);
        }

        analyzeElement(element) {
            // Check for suspicious attributes
            const suspiciousPatterns = [
                /javascript:/i,
                /data:text\/html/i,
                /vbscript:/i,
                /on\w+\s*=/i
            ];

            const attributes = element.attributes || [];
            for (let attr of attributes) {
                for (let pattern of suspiciousPatterns) {
                    if (pattern.test(attr.value)) {
                        this.flagSuspiciousElement(element, 'suspicious_attribute', attr.name);
                        break;
                    }
                }
            }

            // Check for hidden elements with suspicious content
            if (this.isHiddenElement(element)) {
                const content = element.textContent || element.innerHTML;
                if (this.containsSuspiciousContent(content)) {
                    this.flagSuspiciousElement(element, 'hidden_suspicious_content');
                }
            }

            // Check for iframe injections
            if (element.tagName === 'IFRAME') {
                this.analyzeIframe(element);
            }

            // Check for script injections
            if (element.tagName === 'SCRIPT') {
                this.analyzeScript(element);
            }
        }

        isHiddenElement(element) {
            const style = window.getComputedStyle(element);
            return style.display === 'none' || 
                   style.visibility === 'hidden' || 
                   style.opacity === '0' ||
                   element.offsetWidth === 0 || 
                   element.offsetHeight === 0;
        }

        containsSuspiciousContent(content) {
            const suspiciousPatterns = [
                /eval\s*\(/i,
                /document\.write/i,
                /innerHTML\s*=/i,
                /fromCharCode/i,
                /unescape/i,
                /atob\s*\(/i,
                /btoa\s*\(/i
            ];

            return suspiciousPatterns.some(pattern => pattern.test(content));
        }

        analyzeIframe(iframe) {
            const src = iframe.src;
            
            // Check for suspicious iframe sources
            if (src) {
                if (this.isSuspiciousURL(src)) {
                    this.flagSuspiciousElement(iframe, 'suspicious_iframe_src');
                }
            }

            // Check for data URIs in iframes
            if (src && src.startsWith('data:')) {
                this.flagSuspiciousElement(iframe, 'data_uri_iframe');
            }
        }

        analyzeScript(script) {
            const src = script.src;
            const content = script.textContent || script.innerHTML;

            // Check external script sources
            if (src && this.isSuspiciousURL(src)) {
                this.flagSuspiciousElement(script, 'suspicious_script_src');
            }

            // Check inline script content
            if (content && this.containsSuspiciousContent(content)) {
                this.flagSuspiciousElement(script, 'suspicious_script_content');
            }

            // Check for obfuscated scripts
            if (content && this.isObfuscatedScript(content)) {
                this.flagSuspiciousElement(script, 'obfuscated_script');
            }
        }

        isObfuscatedScript(content) {
            // Simple heuristics for obfuscated scripts
            const obfuscationIndicators = [
                /\\x[0-9a-f]{2}/gi, // Hex encoding
                /\\u[0-9a-f]{4}/gi, // Unicode encoding
                /String\.fromCharCode/gi,
                /eval\s*\(\s*unescape/gi,
                /[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*['"][^'"]{50,}['"]/g // Long encoded strings
            ];

            let suspiciousCount = 0;
            for (let indicator of obfuscationIndicators) {
                const matches = content.match(indicator);
                if (matches) {
                    suspiciousCount += matches.length;
                }
            }

            // If more than 5 obfuscation indicators, consider it suspicious
            return suspiciousCount > 5;
        }

        isSuspiciousURL(url) {
            try {
                const urlObj = new URL(url, window.location.href);
                
                // Check for suspicious domains
                const suspiciousDomains = [
                    /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, // IP addresses
                    /[a-f0-9]{32,}\./, // Long hex strings
                    /bit\.ly|tinyurl|t\.co/, // URL shorteners (can be suspicious)
                ];

                for (let pattern of suspiciousDomains) {
                    if (pattern.test(urlObj.hostname)) {
                        return true;
                    }
                }

                // Check for suspicious paths
                const suspiciousPaths = [
                    /\/[a-f0-9]{32,}/,
                    /\.php\?[a-z]{1,3}=[0-9a-f]{8,}/,
                    /\/api\/v[0-9]\/[a-z]{8}/
                ];

                for (let pattern of suspiciousPaths) {
                    if (pattern.test(urlObj.pathname + urlObj.search)) {
                        return true;
                    }
                }

                return false;
            } catch (e) {
                return true; // Invalid URLs are suspicious
            }
        }

        flagSuspiciousElement(element, reason, details = '') {
            console.warn('Suspicious element detected:', reason, element, details);
            
            this.suspiciousElements.add(element);
            
            // Report to background script
            chrome.runtime.sendMessage({
                type: 'reportSuspiciousActivity',
                data: {
                    reason: reason,
                    details: details,
                    url: window.location.href,
                    timestamp: Date.now(),
                    elementInfo: {
                        tagName: element.tagName,
                        className: element.className,
                        id: element.id
                    }
                }
            });

            // Optionally quarantine the element
            if (this.shouldQuarantineElement(reason)) {
                this.quarantineElement(element, reason);
            }
        }

        shouldQuarantineElement(reason) {
            const highRiskReasons = [
                'suspicious_script_content',
                'obfuscated_script',
                'data_uri_iframe',
                'suspicious_iframe_src'
            ];
            
            return highRiskReasons.includes(reason);
        }

        quarantineElement(element, reason) {
            // Disable the element
            element.style.display = 'none';
            element.disabled = true;
            
            if (element.tagName === 'SCRIPT') {
                element.type = 'text/plain'; // Prevent execution
            }
            
            if (element.tagName === 'IFRAME') {
                element.src = 'about:blank'; // Clear source
            }

            // Add visual indicator for debugging
            if (process.env.NODE_ENV === 'development') {
                element.style.border = '2px solid red';
                element.title = `Quarantined: ${reason}`;
            }

            console.log('Element quarantined:', reason, element);
        }

        setupFormProtection() {
            // Monitor form submissions for potential data exfiltration
            document.addEventListener('submit', (event) => {
                const form = event.target;
                if (form.tagName === 'FORM') {
                    this.analyzeFormSubmission(form);
                }
            }, true);
        }

        analyzeFormSubmission(form) {
            const action = form.action;
            const method = form.method.toLowerCase();

            // Check for suspicious form actions
            if (action && this.isSuspiciousURL(action)) {
                console.warn('Suspicious form submission detected:', action);
                
                chrome.runtime.sendMessage({
                    type: 'reportSuspiciousActivity',
                    data: {
                        reason: 'suspicious_form_submission',
                        url: window.location.href,
                        formAction: action,
                        formMethod: method,
                        timestamp: Date.now()
                    }
                });
            }

            // Check for password fields being submitted to non-HTTPS
            if (action && !action.startsWith('https:')) {
                const passwordFields = form.querySelectorAll('input[type="password"]');
                if (passwordFields.length > 0) {
                    console.warn('Password form submitting over non-HTTPS:', action);
                    
                    chrome.runtime.sendMessage({
                        type: 'reportSuspiciousActivity',
                        data: {
                            reason: 'insecure_password_submission',
                            url: window.location.href,
                            formAction: action,
                            timestamp: Date.now()
                        }
                    });
                }
            }
        }

        setupScriptInjectionDetection() {
            // Monitor for dynamic script creation
            const originalCreateElement = document.createElement;
            document.createElement = function(tagName) {
                const element = originalCreateElement.call(this, tagName);
                
                if (tagName.toLowerCase() === 'script') {
                    console.log('Dynamic script creation detected');
                    
                    // Monitor when src is set
                    const originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src').set;
                    Object.defineProperty(element, 'src', {
                        set: function(value) {
                            if (protector.isSuspiciousURL(value)) {
                                console.warn('Suspicious dynamic script source:', value);
                                protector.flagSuspiciousElement(this, 'dynamic_suspicious_script');
                            }
                            originalSrcSetter.call(this, value);
                        },
                        get: function() {
                            return this.getAttribute('src');
                        }
                    });
                }
                
                return element;
            };
        }

        setupClipboardProtection() {
            // Monitor clipboard access
            document.addEventListener('copy', (event) => {
                console.log('Clipboard copy detected');
                // Could implement clipboard content analysis here
            });

            document.addEventListener('paste', (event) => {
                console.log('Clipboard paste detected');
                // Could implement clipboard content analysis here
            });
        }

        setupNetworkMonitoring() {
            // Monitor fetch requests
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
                const url = args[0];
                
                if (typeof url === 'string' && protector.isSuspiciousURL(url)) {
                    console.warn('Suspicious fetch request:', url);
                    
                    chrome.runtime.sendMessage({
                        type: 'reportSuspiciousActivity',
                        data: {
                            reason: 'suspicious_fetch_request',
                            url: window.location.href,
                            requestUrl: url,
                            timestamp: Date.now()
                        }
                    });
                }
                
                return originalFetch.apply(this, args);
            };

            // Monitor XMLHttpRequest
            const originalXHROpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url, ...args) {
                if (typeof url === 'string' && protector.isSuspiciousURL(url)) {
                    console.warn('Suspicious XHR request:', url);
                    
                    chrome.runtime.sendMessage({
                        type: 'reportSuspiciousActivity',
                        data: {
                            reason: 'suspicious_xhr_request',
                            url: window.location.href,
                            requestUrl: url,
                            method: method,
                            timestamp: Date.now()
                        }
                    });
                }
                
                return originalXHROpen.call(this, method, url, ...args);
            };
        }

        cleanup() {
            // Clean up observers
            this.observers.forEach(observer => observer.disconnect());
            this.observers = [];
        }
    }

    // Initialize the content protector
    const protector = new ZroDayContentProtector();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        protector.cleanup();
    });

    // Expose for debugging in development
    if (process.env.NODE_ENV === 'development') {
        window.zroDayProtector = protector;
    }

})();
