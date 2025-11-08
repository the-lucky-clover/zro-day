-- ZRO-DAY Security Platform Database Schema
-- Advanced user management and security tracking system

-- Users table with premium subscription management
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium', 'god')),
  subscription_expires_at DATETIME,
  subscription_created_at DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token TEXT,
  password_reset_token TEXT,
  password_reset_expires_at DATETIME,
  last_login_at DATETIME,
  login_attempts INTEGER DEFAULT 0,
  locked_until DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- God account privileges
  is_god_account BOOLEAN DEFAULT FALSE,
  god_permissions TEXT DEFAULT '[]', -- JSON array of permissions
  -- Usage tracking
  api_calls_today INTEGER DEFAULT 0,
  api_calls_this_month INTEGER DEFAULT 0,
  last_api_call_date DATE
);

-- Browser extensions table for tracking user installations
CREATE TABLE IF NOT EXISTS browser_extensions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  extension_id TEXT NOT NULL,
  browser_type TEXT NOT NULL CHECK (browser_type IN ('chrome', 'firefox', 'safari', 'edge')),
  version TEXT NOT NULL,
  install_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
  settings JSON DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Security threats and detections
CREATE TABLE IF NOT EXISTS security_threats (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT,
  extension_id TEXT,
  threat_type TEXT NOT NULL CHECK (threat_type IN ('malware', 'phishing', 'ransomware', 'trojan', 'spyware', 'adware', 'suspicious_download', 'malicious_url', 'data_breach')),
  threat_level TEXT DEFAULT 'medium' CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  url TEXT,
  domain TEXT,
  ip_address TEXT,
  user_agent TEXT,
  threat_data JSON,
  blocked BOOLEAN DEFAULT FALSE,
  blocked_at DATETIME,
  detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (extension_id) REFERENCES browser_extensions(id) ON DELETE SET NULL
);

-- Security scan results
CREATE TABLE IF NOT EXISTS security_scans (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('quick', 'full', 'custom', 'scheduled', 'real_time')),
  status TEXT DEFAULT 'running' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  threats_found INTEGER DEFAULT 0,
  threats_blocked INTEGER DEFAULT 0,
  scan_data JSON DEFAULT '{}',
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  duration_seconds INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Payment transactions for subscription management
CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  subscription_type TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'chargeback')),
  payment_method TEXT,
  payment_processor TEXT, -- stripe, paypal, etc
  processor_transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  processed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Threat intelligence database for real-time protection
CREATE TABLE IF NOT EXISTS threat_intelligence (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  threat_type TEXT NOT NULL,
  indicator_type TEXT NOT NULL CHECK (indicator_type IN ('url', 'domain', 'ip', 'hash', 'email', 'file_signature')),
  indicator_value TEXT NOT NULL,
  confidence_score REAL DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  source TEXT, -- internal, external_feed, user_report, etc
  first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSON DEFAULT '{}'
);

-- Admin audit logs for god account activities
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  admin_user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT, -- user, threat, system, etc
  target_id TEXT,
  details JSON DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- API usage tracking for rate limiting and analytics
CREATE TABLE IF NOT EXISTS api_usage (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_type, subscription_expires_at);
CREATE INDEX IF NOT EXISTS idx_users_god_account ON users(is_god_account) WHERE is_god_account = TRUE;

CREATE INDEX IF NOT EXISTS idx_browser_extensions_user ON browser_extensions(user_id);
CREATE INDEX IF NOT EXISTS idx_browser_extensions_active ON browser_extensions(is_active, last_active);

CREATE INDEX IF NOT EXISTS idx_security_threats_user ON security_threats(user_id);
CREATE INDEX IF NOT EXISTS idx_security_threats_type ON security_threats(threat_type, threat_level);
CREATE INDEX IF NOT EXISTS idx_security_threats_detected ON security_threats(detected_at);
CREATE INDEX IF NOT EXISTS idx_security_threats_url ON security_threats(url, domain);

CREATE INDEX IF NOT EXISTS idx_security_scans_user ON security_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_security_scans_status ON security_scans(status, started_at);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status, created_at);

CREATE INDEX IF NOT EXISTS idx_threat_intelligence_indicator ON threat_intelligence(indicator_type, indicator_value);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_active ON threat_intelligence(is_active, threat_type);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin ON admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON admin_audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_api_usage_user ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage(endpoint, created_at);