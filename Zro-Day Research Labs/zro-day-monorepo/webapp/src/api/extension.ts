// ZRO-DAY Security Platform - Browser Extension API

import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { AuthContext } from '../middleware/auth.js';
import { ExtensionSettings, ExtensionMessage } from '../types/security.js';

const extensionRoutes = new Hono();

// Register browser extension
extensionRoutes.post('/register', async (c: AuthContext) => {
  try {
    const user = c.get('user');
    const { extension_id, browser_type, version } = await c.req.json();
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    // Check if extension is already registered
    const existing = await c.env.DB.prepare(`
      SELECT id FROM browser_extensions 
      WHERE user_id = ? AND extension_id = ? AND browser_type = ?
    `).bind(user.id, extension_id, browser_type).first();

    if (existing) {
      // Update existing registration
      await c.env.DB.prepare(`
        UPDATE browser_extensions 
        SET version = ?, last_active = CURRENT_TIMESTAMP, is_active = TRUE
        WHERE id = ?
      `).bind(version, existing.id).run();

      return c.json({
        success: true,
        message: 'Extension registration updated',
        extension_id: existing.id
      });
    }

    // Create new extension registration
    const id = nanoid(16);
    const defaultSettings: ExtensionSettings = {
      real_time_protection: user.subscription_type !== 'free',
      block_malicious_downloads: true,
      phishing_protection: true,
      safe_browsing: true,
      notification_level: 'standard',
      whitelist_domains: [],
      blacklist_domains: [],
      scan_frequency_hours: user.subscription_type === 'free' ? 24 : 6
    };

    await c.env.DB.prepare(`
      INSERT INTO browser_extensions (
        id, user_id, extension_id, browser_type, version, 
        install_date, last_active, settings, is_active
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, TRUE)
    `).bind(
      id, user.id, extension_id, browser_type, version, JSON.stringify(defaultSettings)
    ).run();

    return c.json({
      success: true,
      message: 'Extension registered successfully',
      extension_id: id,
      settings: defaultSettings
    }, 201);

  } catch (error) {
    console.error('Extension registration error:', error);
    return c.json({ error: 'Failed to register extension' }, 500);
  }
});

// Get extension settings
extensionRoutes.get('/settings', async (c: AuthContext) => {
  try {
    const user = c.get('user');
    const extensionId = c.req.query('extension_id');
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const extension = await c.env.DB.prepare(`
      SELECT settings FROM browser_extensions 
      WHERE user_id = ? AND extension_id = ? AND is_active = TRUE
    `).bind(user.id, extensionId).first();

    if (!extension) {
      return c.json({ error: 'Extension not found' }, 404);
    }

    let settings: ExtensionSettings;
    try {
      settings = JSON.parse(extension.settings || '{}');
    } catch (e) {
      settings = {
        real_time_protection: false,
        block_malicious_downloads: true,
        phishing_protection: true,
        safe_browsing: true,
        notification_level: 'standard',
        whitelist_domains: [],
        blacklist_domains: [],
        scan_frequency_hours: 24
      };
    }

    return c.json({
      settings,
      subscription_type: user.subscription_type,
      premium_features_available: user.subscription_type !== 'free'
    });

  } catch (error) {
    console.error('Get settings error:', error);
    return c.json({ error: 'Failed to retrieve settings' }, 500);
  }
});

// Update extension settings
extensionRoutes.put('/settings', async (c: AuthContext) => {
  try {
    const user = c.get('user');
    const { extension_id, settings } = await c.req.json();
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    // Validate premium features
    if (user.subscription_type === 'free') {
      if (settings.real_time_protection) {
        return c.json({
          error: 'Real-time protection requires premium subscription',
          upgrade_url: '/pricing'
        }, 402);
      }
      
      if (settings.scan_frequency_hours < 24) {
        settings.scan_frequency_hours = 24;
      }
    }

    await c.env.DB.prepare(`
      UPDATE browser_extensions 
      SET settings = ?, last_active = CURRENT_TIMESTAMP
      WHERE user_id = ? AND extension_id = ?
    `).bind(JSON.stringify(settings), user.id, extension_id).run();

    return c.json({
      success: true,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Update settings error:', error);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// Extension health check / heartbeat
extensionRoutes.post('/heartbeat', async (c: AuthContext) => {
  try {
    const user = c.get('user');
    const { extension_id } = await c.req.json();
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    await c.env.DB.prepare(`
      UPDATE browser_extensions 
      SET last_active = CURRENT_TIMESTAMP
      WHERE user_id = ? AND extension_id = ?
    `).bind(user.id, extension_id).run();

    // Get any pending updates or notifications
    const threatAlerts = await c.env.KV_THREATS.list({
      prefix: `alert:${user.id}:`
    });

    return c.json({
      success: true,
      status: 'active',
      pending_alerts: threatAlerts.keys.length,
      subscription_status: user.subscription_type,
      real_time_protection: user.subscription_type !== 'free'
    });

  } catch (error) {
    console.error('Heartbeat error:', error);
    return c.json({ error: 'Heartbeat failed' }, 500);
  }
});

// Extension messaging endpoint
extensionRoutes.post('/message', async (c: AuthContext) => {
  try {
    const user = c.get('user');
    const message: ExtensionMessage = await c.req.json();
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    switch (message.type) {
      case 'threat_check':
        // Forward to threat check API
        const threatResponse = await fetch(`${c.req.url.replace('/extension/message', '/threats/check')}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': c.req.header('Authorization') || ''
          },
          body: JSON.stringify(message.data)
        });
        
        const threatResult = await threatResponse.json();
        return c.json(threatResult);

      case 'status_update':
        await c.env.DB.prepare(`
          UPDATE browser_extensions 
          SET last_active = CURRENT_TIMESTAMP
          WHERE user_id = ? AND extension_id = ?
        `).bind(user.id, message.data.extension_id).run();
        
        return c.json({ success: true });

      default:
        return c.json({ error: 'Unknown message type' }, 400);
    }

  } catch (error) {
    console.error('Extension message error:', error);
    return c.json({ error: 'Message processing failed' }, 500);
  }
});

// Get extension statistics
extensionRoutes.get('/stats', async (c: AuthContext) => {
  try {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const stats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_extensions,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_extensions,
        COUNT(CASE WHEN last_active > datetime('now', '-24 hours') THEN 1 END) as recent_active
      FROM browser_extensions 
      WHERE user_id = ?
    `).bind(user.id).first();

    const threatStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_threats_detected,
        COUNT(CASE WHEN blocked = TRUE THEN 1 END) as threats_blocked,
        COUNT(CASE WHEN detected_at > datetime('now', '-7 days') THEN 1 END) as recent_threats
      FROM security_threats 
      WHERE user_id = ?
    `).bind(user.id).first();

    return c.json({
      extensions: stats,
      threats: threatStats,
      subscription: {
        type: user.subscription_type,
        features_enabled: user.subscription_type !== 'free'
      }
    });

  } catch (error) {
    console.error('Extension stats error:', error);
    return c.json({ error: 'Failed to retrieve statistics' }, 500);
  }
});
