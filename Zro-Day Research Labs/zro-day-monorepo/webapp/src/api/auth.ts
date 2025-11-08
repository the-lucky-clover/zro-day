// ZRO-DAY Security Platform - Authentication API
// JWT-based auth with premium subscription management and god account support

import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { setCookie } from 'hono/cookie';
import * as bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { AuthRequest, AuthResponse, User } from '../types/security.js';

type Bindings = {
  DB: D1Database;
  KV_SESSIONS: KVNamespace;
  JWT_SECRET: string;
  GOD_ACCOUNT_EMAIL: string;
};

const authRoutes = new Hono<{ Bindings: Bindings }>();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'), 
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number and special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional()
});

// User registration
authRoutes.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = registerSchema.parse(body);
    const { email, password, name } = validatedData;

    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first();

    if (existingUser) {
      return c.json({ 
        success: false, 
        message: 'User already exists with this email',
        code: 'USER_EXISTS'
      }, 409);
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Generate user ID
    const userId = nanoid(16);
    
    // Determine if this is the god account
    const isGodAccount = email.toLowerCase() === c.env.GOD_ACCOUNT_EMAIL?.toLowerCase();
    const subscriptionType = isGodAccount ? 'god' : 'free';
    const godPermissions = isGodAccount ? 
      JSON.stringify(['full_admin', 'user_management', 'threat_intelligence', 'system_config', 'billing_management', 'audit_access']) : 
      '[]';

    // Create user
    await c.env.DB.prepare(`
      INSERT INTO users (
        id, email, password_hash, name, subscription_type, 
        is_god_account, god_permissions, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, CURRENT_TIMESTAMP)
    `).bind(
      userId,
      email.toLowerCase(),
      passwordHash,
      name || null,
      subscriptionType,
      isGodAccount,
      godPermissions
    ).run();

    // Generate JWT token
    const jwtSecret = c.env.JWT_SECRET || 'fallback-secret-key';
    const token = await sign(
      { 
        sub: userId, 
        email: email.toLowerCase(),
        subscription_type: subscriptionType,
        is_god_account: isGodAccount,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      },
      jwtSecret
    );

    // Set secure cookie
    setCookie(c, 'auth_token', token, {
      maxAge: 7 * 24 * 60 * 60, // 7 days
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });

    // Store session in KV
    await c.env.KV_SESSIONS.put(`session:${userId}`, JSON.stringify({
      userId,
      email: email.toLowerCase(),
      loginTime: Date.now(),
      ip: c.req.header('CF-Connecting-IP') || 'unknown'
    }), {
      expirationTtl: 7 * 24 * 60 * 60 // 7 days
    });

    const response: AuthResponse = {
      success: true,
      token,
      user: {
        id: userId,
        email: email.toLowerCase(),
        name: name || null,
        subscription_type: subscriptionType,
        is_god_account: isGodAccount
      },
      message: isGodAccount ? 
        'God account created successfully! Full system access granted.' :
        'Account created successfully! Welcome to ZRO-DAY Security.'
    };

    return c.json(response, 201);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      }, 400);
    }

    console.error('Registration error:', error);
    return c.json({
      success: false,
      message: 'Registration failed. Please try again.',
      code: 'REGISTRATION_FAILED'
    }, 500);
  }
});

// User login
authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    // Get user from database
    const user = await c.env.DB.prepare(`
      SELECT * FROM users WHERE email = ? AND is_active = TRUE
    `).bind(email.toLowerCase()).first() as User | null;

    if (!user) {
      return c.json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      }, 401);
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return c.json({
        success: false,
        message: 'Account temporarily locked due to too many failed attempts',
        code: 'ACCOUNT_LOCKED',
        locked_until: user.locked_until
      }, 423);
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordValid) {
      // Increment failed login attempts
      const newAttempts = user.login_attempts + 1;
      const shouldLock = newAttempts >= 5;
      const lockUntil = shouldLock ? 
        new Date(Date.now() + 30 * 60 * 1000).toISOString() : // 30 minutes
        null;

      await c.env.DB.prepare(`
        UPDATE users 
        SET login_attempts = ?, locked_until = ? 
        WHERE id = ?
      `).bind(newAttempts, lockUntil, user.id).run();

      return c.json({
        success: false,
        message: shouldLock ? 
          'Account locked for 30 minutes due to repeated failed attempts' :
          'Invalid email or password',
        code: shouldLock ? 'ACCOUNT_LOCKED' : 'INVALID_CREDENTIALS'
      }, 401);
    }

    // Reset login attempts and update last login
    await c.env.DB.prepare(`
      UPDATE users 
      SET login_attempts = 0, locked_until = NULL, last_login_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(user.id).run();

    // Generate JWT token
    const jwtSecret = c.env.JWT_SECRET || 'fallback-secret-key';
    const token = await sign(
      { 
        sub: user.id, 
        email: user.email,
        subscription_type: user.subscription_type,
        is_god_account: user.is_god_account,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      },
      jwtSecret
    );

    // Set secure cookie
    setCookie(c, 'auth_token', token, {
      maxAge: 7 * 24 * 60 * 60, // 7 days
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });

    // Store session in KV
    await c.env.KV_SESSIONS.put(`session:${user.id}`, JSON.stringify({
      userId: user.id,
      email: user.email,
      loginTime: Date.now(),
      ip: c.req.header('CF-Connecting-IP') || 'unknown'
    }), {
      expirationTtl: 7 * 24 * 60 * 60 // 7 days
    });

    const response: AuthResponse = {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription_type: user.subscription_type,
        is_god_account: user.is_god_account,
        subscription_expires_at: user.subscription_expires_at
      },
      message: user.is_god_account ? 
        'God mode activated! Full system access granted.' :
        'Login successful. Welcome back to ZRO-DAY Security.'
    };

    return c.json(response);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        success: false,
        message: 'Invalid input format',
        errors: error.errors
      }, 400);
    }

    console.error('Login error:', error);
    return c.json({
      success: false,
      message: 'Login failed. Please try again.',
      code: 'LOGIN_FAILED'
    }, 500);
  }
});

// Logout
authRoutes.post('/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (token) {
      // Decode token to get user ID (without verification since we're logging out)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      if (payload.sub) {
        // Remove session from KV
        await c.env.KV_SESSIONS.delete(`session:${payload.sub}`);
      }
    }

    // Clear auth cookie
    setCookie(c, 'auth_token', '', {
      maxAge: 0,
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });

    return c.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return c.json({
      success: true, // Still return success for logout
      message: 'Logged out successfully'
    });
  }
});

// Password reset request
authRoutes.post('/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({
        success: false,
        message: 'Email is required'
      }, 400);
    }

    const user = await c.env.DB.prepare(`
      SELECT id FROM users WHERE email = ? AND is_active = TRUE
    `).bind(email.toLowerCase()).first();

    // Always return success for security (don't reveal if email exists)
    if (user) {
      const resetToken = nanoid(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

      await c.env.DB.prepare(`
        UPDATE users 
        SET password_reset_token = ?, password_reset_expires_at = ?
        WHERE id = ?
      `).bind(resetToken, expiresAt, user.id).run();

      // TODO: Send password reset email
      console.log(`Password reset token for ${email}: ${resetToken}`);
    }

    return c.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return c.json({
      success: false,
      message: 'Failed to process password reset request'
    }, 500);
  }
});

// Password reset
authRoutes.post('/reset-password', async (c) => {
  try {
    const { token, newPassword } = await c.req.json();
    
    if (!token || !newPassword) {
      return c.json({
        success: false,
        message: 'Token and new password are required'
      }, 400);
    }

    if (newPassword.length < 8) {
      return c.json({
        success: false,
        message: 'Password must be at least 8 characters'
      }, 400);
    }

    const user = await c.env.DB.prepare(`
      SELECT id FROM users 
      WHERE password_reset_token = ? 
      AND password_reset_expires_at > CURRENT_TIMESTAMP
      AND is_active = TRUE
    `).bind(token).first();

    if (!user) {
      return c.json({
        success: false,
        message: 'Invalid or expired reset token'
      }, 400);
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await c.env.DB.prepare(`
      UPDATE users 
      SET password_hash = ?, password_reset_token = NULL, password_reset_expires_at = NULL,
          login_attempts = 0, locked_until = NULL
      WHERE id = ?
    `).bind(passwordHash, user.id).run();

    return c.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return c.json({
      success: false,
      message: 'Failed to reset password'
    }, 500);
  }
});

// Check authentication status
authRoutes.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return c.json({
        authenticated: false,
        message: 'No token provided'
      }, 401);
    }

    // Verify token (basic check without full middleware)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    if (!payload.sub || payload.exp < Date.now() / 1000) {
      return c.json({
        authenticated: false,
        message: 'Token expired or invalid'
      }, 401);
    }

    const user = await c.env.DB.prepare(`
      SELECT id, email, name, subscription_type, is_god_account, 
             subscription_expires_at, api_calls_today, created_at
      FROM users WHERE id = ? AND is_active = TRUE
    `).bind(payload.sub).first() as Partial<User> | null;

    if (!user) {
      return c.json({
        authenticated: false,
        message: 'User not found'
      }, 401);
    }

    return c.json({
      authenticated: true,
      user: {
        ...user,
        god_permissions: user.is_god_account ? 
          JSON.parse(user.god_permissions || '[]') : []
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return c.json({
      authenticated: false,
      message: 'Authentication check failed'
    }, 401);
  }
});

export { authRoutes };