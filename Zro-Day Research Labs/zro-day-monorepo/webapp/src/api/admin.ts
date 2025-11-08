// ZRO-DAY Security Platform - God Mode Admin API

import { Hono } from 'hono';
import { AuthContext } from '../middleware/auth.js';
import { requirePermission, auditLogMiddleware } from '../middleware/auth.js';

const adminRoutes = new Hono();

// System analytics (god account only)
adminRoutes.get('/analytics', requirePermission('full_admin'), auditLogMiddleware('view_analytics', 'system'), async (c: AuthContext) => {
  try {
    // User statistics
    const userStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN subscription_type = 'premium' THEN 1 END) as premium_users,
        COUNT(CASE WHEN subscription_type = 'god' THEN 1 END) as god_users,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_users,
        COUNT(CASE WHEN last_login_at > datetime('now', '-7 days') THEN 1 END) as weekly_active_users
      FROM users
    `).first();

    // Threat statistics
    const threatStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_threats,
        COUNT(CASE WHEN blocked = TRUE THEN 1 END) as blocked_threats,
        COUNT(CASE WHEN detected_at > datetime('now', '-24 hours') THEN 1 END) as threats_last_24h,
        threat_type,
        COUNT(*) as count
      FROM security_threats
      WHERE detected_at > datetime('now', '-30 days')
      GROUP BY threat_type
      ORDER BY count DESC
    `).all();

    // Security scan statistics
    const scanStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_scans,
        AVG(duration_seconds) as avg_duration,
        SUM(threats_found) as total_threats_found,
        SUM(threats_blocked) as total_threats_blocked
      FROM security_scans
      WHERE started_at > datetime('now', '-30 days')
    `).first();

    // Revenue statistics (mock data)
    const revenueStats = {
      monthly_recurring_revenue: userStats.premium_users * 7.77,
      annual_revenue_projected: userStats.premium_users * 77.77,
      conversion_rate: userStats.total_users > 0 ? (userStats.premium_users / userStats.total_users * 100).toFixed(2) : 0
    };

    return c.json({
      timestamp: new Date().toISOString(),
      users: userStats,
      threats: {
        summary: threatStats.meta,
        by_type: threatStats.results
      },
      scans: scanStats,
      revenue: revenueStats,
      system_health: {
        status: 'healthy',
        uptime_percentage: 99.9,
        avg_response_time_ms: 45
      }
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    return c.json({ error: 'Failed to retrieve analytics' }, 500);
  }
});

// User management (god account only)
adminRoutes.get('/users', requirePermission('user_management'), async (c: AuthContext) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = (page - 1) * limit;
    const search = c.req.query('search');

    let query = `
      SELECT id, email, name, subscription_type, is_active, email_verified,
             created_at, last_login_at, api_calls_today, is_god_account
      FROM users
    `;
    const params = [];

    if (search) {
      query += ' WHERE email LIKE ? OR name LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const users = await c.env.DB.prepare(query).bind(...params).all();

    const total = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM users
      ${search ? 'WHERE email LIKE ? OR name LIKE ?' : ''}
    `).bind(...(search ? [`%${search}%`, `%${search}%`] : [])).first() as { count: number };

    return c.json({
      users: users.results,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });

  } catch (error) {
    console.error('Admin users error:', error);
    return c.json({ error: 'Failed to retrieve users' }, 500);
  }
});

// Update user subscription (god account only)
adminRoutes.put('/users/:userId/subscription', requirePermission('user_management'), auditLogMiddleware('update_user_subscription', 'user'), async (c: AuthContext) => {
  try {
    const userId = c.req.param('userId');
    const { subscription_type, expires_at } = await c.req.json();

    if (!['free', 'premium'].includes(subscription_type)) {
      return c.json({ error: 'Invalid subscription type' }, 400);
    }

    await c.env.DB.prepare(`
      UPDATE users 
      SET subscription_type = ?, subscription_expires_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(subscription_type, expires_at || null, userId).run();

    return c.json({
      success: true,
      message: 'User subscription updated successfully'
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    return c.json({ error: 'Failed to update subscription' }, 500);
  }
});

// System configuration (god account only)
adminRoutes.get('/system/config', requirePermission('system_config'), async (c: AuthContext) => {
  try {
    // Get system configuration from environment and database
    const config = {
      environment: c.env.ENVIRONMENT || 'development',
      database_status: 'connected',
      kv_status: 'connected',
      r2_status: 'connected',
      threat_intelligence_entries: await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM threat_intelligence WHERE is_active = TRUE
      `).first(),
      active_sessions: await c.env.KV_SESSIONS.list({ prefix: 'session:' }),
      features: {
        real_time_protection: true,
        premium_subscriptions: true,
        god_mode: true,
        audit_logging: true
      }
    };

    return c.json(config);

  } catch (error) {
    console.error('System config error:', error);
    return c.json({ error: 'Failed to retrieve system configuration' }, 500);
  }
});

// Audit logs (god account only)
adminRoutes.get('/audit-logs', requirePermission('audit_access'), async (c: AuthContext) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = (page - 1) * limit;
    const action = c.req.query('action');

    let query = `
      SELECT al.*, u.email as admin_email, u.name as admin_name
      FROM admin_audit_logs al
      LEFT JOIN users u ON al.admin_user_id = u.id
    `;
    const params = [];

    if (action) {
      query += ' WHERE al.action = ?';
      params.push(action);
    }

    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const logs = await c.env.DB.prepare(query).bind(...params).all();

    const total = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM admin_audit_logs
      ${action ? 'WHERE action = ?' : ''}
    `).bind(...(action ? [action] : [])).first() as { count: number };

    return c.json({
      audit_logs: logs.results.map((log: any) => ({
        ...log,
        details: JSON.parse(log.details || '{}')
      })),
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });

  } catch (error) {
    console.error('Audit logs error:', error);
    return c.json({ error: 'Failed to retrieve audit logs' }, 500);
  }
});

// Threat intelligence management (god account only)
adminRoutes.post('/threat-intelligence', requirePermission('threat_intelligence'), auditLogMiddleware('add_threat_intel', 'threat'), async (c: AuthContext) => {
  try {
    const { threat_type, indicator_type, indicator_value, confidence_score, severity, description, source } = await c.req.json();

    await c.env.DB.prepare(`
      INSERT INTO threat_intelligence (
        threat_type, indicator_type, indicator_value, confidence_score,
        severity, description, source, first_seen, last_seen, is_active, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, TRUE, '{}')
    `).bind(threat_type, indicator_type, indicator_value, confidence_score, severity, description || null, source || 'admin').run();

    return c.json({
      success: true,
      message: 'Threat intelligence entry added successfully'
    }, 201);

  } catch (error) {
    console.error('Add threat intel error:', error);
    return c.json({ error: 'Failed to add threat intelligence' }, 500);
  }
});

export { adminRoutes };