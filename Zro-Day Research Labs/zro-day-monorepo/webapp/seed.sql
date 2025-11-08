-- ZRO-DAY Security Platform Seed Data
-- Creates god account and initial threat intelligence data

-- Insert god account (pounds1@gmail.com) with admin privileges
INSERT OR IGNORE INTO users (
  id,
  email, 
  password_hash,
  name,
  subscription_type,
  subscription_expires_at,
  is_god_account,
  god_permissions,
  is_active,
  email_verified,
  created_at
) VALUES (
  'god-account-pounds1-gmail-com',
  'pounds1@gmail.com',
  '$2a$10$rGfTwjOKzQJtLxCzSz7zIuF3D8vV9x3K2YhZpVn4mT8sN6qW7eR9C', -- bcrypt hash of 'ZroDayG0dM0de2024!'
  'ZRO-DAY God Admin',
  'god',
  '2034-12-31 23:59:59',
  TRUE,
  '["full_admin", "user_management", "threat_intelligence", "system_config", "billing_management", "audit_access"]',
  TRUE,
  TRUE,
  CURRENT_TIMESTAMP
);

-- Insert sample premium user for testing
INSERT OR IGNORE INTO users (
  id,
  email,
  password_hash,
  name,
  subscription_type,
  subscription_expires_at,
  is_active,
  email_verified,
  created_at
) VALUES (
  'premium-test-user-001',
  'premium@zro-day.com',
  '$2a$10$rGfTwjOKzQJtLxCzSz7zIuF3D8vV9x3K2YhZpVn4mT8sN6qW7eR9C',
  'Premium Test User',
  'premium',
  '2025-12-31 23:59:59',
  TRUE,
  TRUE,
  CURRENT_TIMESTAMP
);

-- Insert sample free user for testing
INSERT OR IGNORE INTO users (
  id,
  email,
  password_hash,
  name,
  subscription_type,
  is_active,
  email_verified,
  created_at
) VALUES (
  'free-test-user-001',
  'free@zro-day.com',
  '$2a$10$rGfTwjOKzQJtLxCzSz7zIuF3D8vV9x3K2YhZpVn4mT8sN6qW7eR9C',
  'Free Test User',
  'free',
  TRUE,
  TRUE,
  CURRENT_TIMESTAMP
);

-- Insert threat intelligence data for immediate protection
INSERT OR IGNORE INTO threat_intelligence (
  threat_type,
  indicator_type,
  indicator_value,
  confidence_score,
  severity,
  description,
  source,
  is_active
) VALUES 
  -- Malicious domains
  ('phishing', 'domain', 'phishing-example.com', 0.95, 'high', 'Known phishing domain targeting financial institutions', 'internal', TRUE),
  ('malware', 'domain', 'malware-host.net', 0.98, 'critical', 'Domain hosting multiple malware families', 'external_feed', TRUE),
  ('phishing', 'domain', 'fake-bank-login.org', 0.92, 'high', 'Fake banking login page', 'user_report', TRUE),
  
  -- Malicious URLs
  ('phishing', 'url', 'http://suspicious-site.com/login.php', 0.89, 'high', 'Credential harvesting page', 'internal', TRUE),
  ('malware', 'url', 'https://download-malware.info/payload.exe', 0.97, 'critical', 'Malware download endpoint', 'external_feed', TRUE),
  
  -- Malicious IP addresses
  ('malware', 'ip', '192.168.1.100', 0.85, 'medium', 'C2 server for banking trojan', 'external_feed', TRUE),
  ('phishing', 'ip', '10.0.0.50', 0.80, 'medium', 'Phishing campaign infrastructure', 'internal', TRUE),
  
  -- File hashes (SHA256)
  ('malware', 'hash', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 0.99, 'critical', 'Known ransomware sample', 'external_feed', TRUE),
  ('trojan', 'hash', 'd2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2', 0.94, 'high', 'Banking trojan variant', 'external_feed', TRUE),
  
  -- Email indicators
  ('phishing', 'email', 'noreply@fake-paypal.com', 0.87, 'high', 'Fake PayPal phishing emails', 'user_report', TRUE),
  ('phishing', 'email', 'security@fake-microsoft.net', 0.91, 'high', 'Impersonating Microsoft security alerts', 'internal', TRUE);

-- Insert sample security scans
INSERT OR IGNORE INTO security_scans (
  id,
  user_id,
  scan_type,
  status,
  threats_found,
  threats_blocked,
  scan_data,
  started_at,
  completed_at,
  duration_seconds
) VALUES 
  ('scan-demo-001', 'premium-test-user-001', 'full', 'completed', 3, 3, 
   '{"files_scanned": 1547, "registry_keys_checked": 2341, "network_connections": 45}',
   '2024-08-30 01:00:00', '2024-08-30 01:15:33', 933),
  ('scan-demo-002', 'free-test-user-001', 'quick', 'completed', 1, 0,
   '{"files_scanned": 234, "threats_detected": ["suspicious_registry_key"]}',
   '2024-08-30 02:00:00', '2024-08-30 02:02:15', 135);

-- Insert sample threat detections
INSERT OR IGNORE INTO security_threats (
  user_id,
  threat_type,
  threat_level,
  url,
  domain,
  threat_data,
  blocked,
  blocked_at,
  detected_at
) VALUES 
  ('premium-test-user-001', 'phishing', 'high', 'https://fake-bank.com/login', 'fake-bank.com',
   '{"risk_score": 0.92, "indicators": ["suspicious_ssl", "typosquatting", "credential_form"]}',
   TRUE, '2024-08-30 01:30:00', '2024-08-30 01:30:00'),
  ('premium-test-user-001', 'malware', 'critical', 'https://malicious-download.net/virus.exe', 'malicious-download.net',
   '{"file_hash": "abc123def456", "malware_family": "generic_trojan", "detection_method": "signature"}',
   TRUE, '2024-08-30 02:15:00', '2024-08-30 02:15:00'),
  ('free-test-user-001', 'suspicious_download', 'medium', 'https://suspicious-site.org/software.zip', 'suspicious-site.org',
   '{"file_size": 2048576, "reputation_score": 0.3, "detection_method": "heuristic"}',
   FALSE, NULL, '2024-08-30 03:00:00');

-- Insert admin audit log for god account setup
INSERT OR IGNORE INTO admin_audit_logs (
  admin_user_id,
  action,
  target_type,
  target_id,
  details,
  ip_address,
  created_at
) VALUES (
  'god-account-pounds1-gmail-com',
  'system_initialization',
  'system',
  'zro-day-platform',
  '{"action": "initial_setup", "version": "1.0.0", "features_enabled": ["threat_intelligence", "premium_subscriptions", "god_mode"]}',
  '127.0.0.1',
  CURRENT_TIMESTAMP
);
