// ZRO-DAY Security Platform Authentication Middleware
// JWT-based authentication with premium feature gating and god account support

import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';
import { User, SUBSCRIPTION_FEATURES } from '../types/security.js';

// Environment bindings type
type Bindings = {
  DB: D1Database;
  KV_SESSIONS: KVNamespace;
  JWT_SECRET: string;
  GOD_ACCOUNT_EMAIL: string;
};

export interface AuthContext extends Context {
  env: Bindings;
  get(key: 'user'): User | undefined;
  set(key: 'user', value: User): void;
}

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and loads user data
 */
export const authMiddleware = async (c: AuthContext, next: Next) => {
  try {
    // Get token from Authorization header or cookie
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '') || getCookie(c, 'auth_token');
    
    if (!token) {
      return c.json({ error: 'Authentication required', code: 'AUTH_REQUIRED' }, 401);
    }

    // Verify JWT token
    const payload = await verify(token, c.env.JWT_SECRET || 'fallback-secret-key');
    
    if (!payload.sub) {
      return c.json({ error: 'Invalid token', code: 'INVALID_TOKEN' }, 401);
    }

    // Load user from database
    const user = await c.env.DB.prepare(`
      SELECT * FROM users WHERE id = ? AND is_active = TRUE
    `).bind(payload.sub).first() as User | null;

    if (!user) {
      return c.json({ error: 'User not found or inactive', code: 'USER_NOT_FOUND' }, 401);
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return c.json({ 
        error: 'Account temporarily locked', 
        code: 'ACCOUNT_LOCKED',
        locked_until: user.locked_until 
      }, 423);
    }

    // Parse god permissions
    let godPermissions: string[] = [];
    try {
      godPermissions = JSON.parse(user.god_permissions || '[]');
    } catch (e) {
      godPermissions = [];
    }

    // Set user context
    c.set('user', {
      ...user,
      god_permissions: godPermissions
    });

    // Update last activity in KV (async, don't block request)
    c.env.KV_SESSIONS.put(`user_activity:${user.id}`, Date.now().toString(), {
      expirationTtl: 86400 // 24 hours
    }).catch(console.error);

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed', code: 'AUTH_FAILED' }, 401);
  }
};

/**
 * Premium Subscription Middleware
 * Ensures user has active premium subscription
 */
export const premiumRequired = async (c: AuthContext, next: Next) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'Authentication required', code: 'AUTH_REQUIRED' }, 401);
  }

  // God accounts always have premium access
  if (user.is_god_account) {
    await next();
    return;
  }

  if (user.subscription_type === 'free') {
    return c.json({ 
      error: 'Premium subscription required', 
      code: 'PREMIUM_REQUIRED',
      upgrade_url: '/pricing'
    }, 402);
  }

  // Check if premium subscription is expired
  if (user.subscription_expires_at && new Date(user.subscription_expires_at) < new Date()) {
    return c.json({ 
      error: 'Premium subscription expired', 
      code: 'SUBSCRIPTION_EXPIRED',
      expired_at: user.subscription_expires_at,
      renewal_url: '/pricing'
    }, 402);
  }

  await next();
};

/**
 * God Account Middleware
 * Restricts access to god account only
 */
export const godAccountRequired = async (c: AuthContext, next: Next) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'Authentication required', code: 'AUTH_REQUIRED' }, 401);
  }

  if (!user.is_god_account) {
    return c.json({ 
      error: 'God account privileges required', 
      code: 'GOD_PRIVILEGES_REQUIRED' 
    }, 403);
  }

  await next();
};

/**
 * Permission-based Authorization Middleware
 * Checks specific god account permissions
 */
export const requirePermission = (permission: string) => {
  return async (c: AuthContext, next: Next) => {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Authentication required', code: 'AUTH_REQUIRED' }, 401);
    }

    if (!user.is_god_account || !user.god_permissions.includes(permission)) {
      return c.json({ 
        error: `Permission '${permission}' required`, 
        code: 'INSUFFICIENT_PERMISSIONS',
        required_permission: permission
      }, 403);
    }

    await next();
  };
};

/**
 * Rate Limiting Middleware
 * Enforces subscription-based API rate limits
 */
export const rateLimitMiddleware = async (c: AuthContext, next: Next) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'Authentication required', code: 'AUTH_REQUIRED' }, 401);
  }

  const subscriptionLimits = SUBSCRIPTION_FEATURES[user.subscription_type];
  
  // God accounts and unlimited plans skip rate limiting
  if (user.subscription_type === 'god' || subscriptionLimits.api_calls_per_day === -1) {
    await next();
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  
  // Check if we need to reset daily counter
  if (user.last_api_call_date !== today) {
    await c.env.DB.prepare(`
      UPDATE users 
      SET api_calls_today = 0, last_api_call_date = ? 
      WHERE id = ?
    `).bind(today, user.id).run();
    
    user.api_calls_today = 0;
    user.last_api_call_date = today;
  }

  // Check rate limit
  if (user.api_calls_today >= subscriptionLimits.api_calls_per_day) {
    return c.json({ 
      error: 'API rate limit exceeded', 
      code: 'RATE_LIMIT_EXCEEDED',
      daily_limit: subscriptionLimits.api_calls_per_day,
      calls_made_today: user.api_calls_today,
      reset_time: 'midnight UTC',
      upgrade_url: '/pricing'
    }, 429);
  }

  // Increment API call counter (async, don't block)
  c.env.DB.prepare(`
    UPDATE users 
    SET api_calls_today = api_calls_today + 1 
    WHERE id = ?
  `).bind(user.id).run().catch(console.error);

  await next();
};

/**
 * CORS Middleware for secure browser extension communication
 */
export const secureCorsmiddleware = async (c: Context, next: Next) => {
  // Set security headers
  c.header('X-Frame-Options', 'DENY');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.tailwindcss.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.zro-day.com; " +
    "font-src 'self' https://cdn.jsdelivr.net;"
  );

  // CORS headers for extension communication
  const origin = c.req.header('origin');
  const allowedOrigins = [
    'chrome-extension://',
    'moz-extension://',
    'https://zro-day.com',
    'https://*.zro-day.com'
  ];

  if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Credentials', 'true');
  }

  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Extension-ID');

  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }

  await next();
};

/**
 * Audit Logging Middleware
 * Logs important admin actions to audit trail
 */
export const auditLogMiddleware = (action: string, targetType?: string) => {
  return async (c: AuthContext, next: Next) => {
    const user = c.get('user');
    const startTime = Date.now();
    
    await next();
    
    // Log action if user is authenticated and it's a god account performing admin actions
    if (user && (user.is_god_account || c.req.path.startsWith('/api/admin'))) {
      try {
        const requestData = c.req.method !== 'GET' ? await c.req.clone().json().catch(() => ({})) : {};
        
        await c.env.DB.prepare(`
          INSERT INTO admin_audit_logs (
            admin_user_id, action, target_type, target_id, details, 
            ip_address, user_agent, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(
          user.id,
          action,
          targetType || 'unknown',
          requestData.id || requestData.target_id || null,
          JSON.stringify({
            method: c.req.method,
            path: c.req.path,
            duration_ms: Date.now() - startTime,
            request_data: requestData
          }),
          c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown',
          c.req.header('User-Agent') || 'unknown'
        ).run();
      } catch (error) {
        console.error('Audit logging failed:', error);
      }
    }
  };
};
