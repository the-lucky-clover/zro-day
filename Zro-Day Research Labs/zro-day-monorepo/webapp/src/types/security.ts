// ZRO-DAY Security Platform Type Definitions
// Enhanced type safety for our advanced security features

export interface User {
  id: string;
  email: string;
  name?: string;
  subscription_type: 'free' | 'premium' | 'god';
  subscription_expires_at?: string;
  subscription_created_at?: string;
  is_active: boolean;
  email_verified: boolean;
  last_login_at?: string;
  login_attempts: number;
  locked_until?: string;
  created_at: string;
  updated_at: string;
  is_god_account: boolean;
  god_permissions: string[];
  api_calls_today: number;
  api_calls_this_month: number;
  last_api_call_date?: string;
}

export interface BrowserExtension {
  id: string;
  user_id: string;
  extension_id: string;
  browser_type: 'chrome' | 'firefox' | 'safari' | 'edge';
  version: string;
  install_date: string;
  last_active: string;
  settings: Record<string, any>;
  is_active: boolean;
}

export interface SecurityThreat {
  id: string;
  user_id?: string;
  extension_id?: string;
  threat_type: 'malware' | 'phishing' | 'ransomware' | 'trojan' | 'spyware' | 'adware' | 'suspicious_download' | 'malicious_url' | 'data_breach';
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  url?: string;
  domain?: string;
  ip_address?: string;
  user_agent?: string;
  threat_data: Record<string, any>;
  blocked: boolean;
  blocked_at?: string;
  detected_at: string;
  resolved_at?: string;
  notes?: string;
}

export interface SecurityScan {
  id: string;
  user_id: string;
  scan_type: 'quick' | 'full' | 'custom' | 'scheduled' | 'real_time';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  threats_found: number;
  threats_blocked: number;
  scan_data: Record<string, any>;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  amount_cents: number;
  currency: string;
  subscription_type: string;
  transaction_type: 'payment' | 'refund' | 'chargeback';
  payment_method?: string;
  payment_processor?: string;
  processor_transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  processed_at?: string;
  created_at: string;
}

export interface ThreatIntelligence {
  id: string;
  threat_type: string;
  indicator_type: 'url' | 'domain' | 'ip' | 'hash' | 'email' | 'file_signature';
  indicator_value: string;
  confidence_score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  source: string;
  first_seen: string;
  last_seen: string;
  is_active: boolean;
  metadata: Record<string, any>;
}

export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ApiUsage {
  id: string;
  user_id?: string;
  endpoint: string;
  method: string;
  status_code?: number;
  response_time_ms?: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Request/Response types
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: Partial<User>;
  message: string;
}

export interface ThreatCheckRequest {
  url?: string;
  domain?: string;
  ip?: string;
  hash?: string;
  email?: string;
}

export interface ThreatCheckResponse {
  is_threat: boolean;
  threat_type?: string;
  confidence_score: number;
  severity?: string;
  description?: string;
  blocked: boolean;
  recommendations: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: {
    daily_scans: number;
    api_calls_per_day: number;
    real_time_protection: boolean;
    premium_support: boolean;
    family_accounts: number;
  };
}

// Chrome Extension types
export interface ExtensionMessage {
  type: 'threat_check' | 'scan_request' | 'status_update' | 'settings_update';
  data: any;
  timestamp: number;
}

export interface ExtensionSettings {
  real_time_protection: boolean;
  block_malicious_downloads: boolean;
  phishing_protection: boolean;
  safe_browsing: boolean;
  notification_level: 'silent' | 'minimal' | 'standard' | 'verbose';
  whitelist_domains: string[];
  blacklist_domains: string[];
  scan_frequency_hours: number;
}

// Radar theme UI types for 1950s aesthetic
export interface RadarDisplay {
  sweep_angle: number;
  detected_threats: RadarBlip[];
  sweep_speed: number;
  range_km: number;
  grid_intensity: number;
}

export interface RadarBlip {
  id: string;
  x: number;
  y: number;
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  threat_type: string;
  distance: number;
  bearing: number;
  timestamp: number;
}

// Premium feature gates
export const SUBSCRIPTION_FEATURES = {
  free: {
    daily_scans: 1,
    api_calls_per_day: 100,
    real_time_protection: false,
    premium_support: false,
    family_accounts: 0,
    threat_intelligence_access: false,
    advanced_scanning: false,
    custom_rules: false
  },
  premium: {
    daily_scans: 50,
    api_calls_per_day: 5000,
    real_time_protection: true,
    premium_support: true,
    family_accounts: 5,
    threat_intelligence_access: true,
    advanced_scanning: true,
    custom_rules: true
  },
  god: {
    daily_scans: -1, // unlimited
    api_calls_per_day: -1, // unlimited
    real_time_protection: true,
    premium_support: true,
    family_accounts: -1, // unlimited
    threat_intelligence_access: true,
    advanced_scanning: true,
    custom_rules: true,
    admin_access: true,
    system_management: true,
    user_management: true,
    billing_management: true
  }
} as const;

export type SubscriptionFeatures = typeof SUBSCRIPTION_FEATURES[keyof typeof SUBSCRIPTION_FEATURES];

// Analytics and monitoring types
export interface SecurityMetrics {
  threats_blocked_today: number;
  threats_blocked_this_month: number;
  total_scans_performed: number;
  active_users: number;
  premium_users: number;
  threat_intelligence_entries: number;
  avg_threat_response_time_ms: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime_percentage: number;
  response_time_ms: number;
  active_threats: number;
  blocked_threats_last_hour: number;
  error_rate_percentage: number;
  database_status: 'connected' | 'disconnected' | 'readonly';
}