// ZRO-DAY Security Platform - User Management API

import { Hono } from 'hono';
import { AuthContext } from '../middleware/auth.js';
import { User } from '../types/security.js';

const userRoutes = new Hono();

// Get current user profile
userRoutes.get('/profile', async (c: AuthContext) => {
  try {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    // Get detailed user information
    const userDetails = await c.env.DB.prepare(`
      SELECT id, email, name, subscription_type, subscription_expires_at,
             subscription_created_at, is_active, email_verified, last_login_at,
             created_at, is_god_account, api_calls_today, api_calls_this_month
      FROM users WHERE id = ?
    `).bind(user.id).first() as Partial<User>;

    // Get user statistics
    const stats = await c.env.DB.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM security_scans WHERE user_id = ?) as total_scans,
        (SELECT COUNT(*) FROM security_threats WHERE user_id = ? AND blocked = TRUE) as threats_blocked,
        (SELECT COUNT(*) FROM browser_extensions WHERE user_id = ? AND is_active = TRUE) as active_extensions
    `).bind(user.id, user.id, user.id).first();

    return c.json({
      user: userDetails,
      statistics: stats,
      subscription_features: user.subscription_type
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to retrieve profile' }, 500);
  }
});

// Update user profile
userRoutes.put('/profile', async (c: AuthContext) => {
  try {
    const user = c.get('user');
    const { name } = await c.req.json();
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    await c.env.DB.prepare(`
      UPDATE users 
      SET name = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(name || null, user.id).run();

    return c.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

export { userRoutes };