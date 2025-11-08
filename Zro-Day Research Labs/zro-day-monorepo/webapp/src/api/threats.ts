// ZRO-DAY Security Platform - Threat Detection API
// Advanced threat intelligence and real-time malware detection

import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { AuthContext } from '../middleware/auth.js';
import { ThreatCheckRequest, ThreatCheckResponse, SecurityScan, SecurityThreat, SUBSCRIPTION_FEATURES } from '../types/security.js';

const threatRoutes = new Hono<{ Bindings: { DB: D1Database; KV_THREATS: KVNamespace } }>();

// Validation schemas
const threatCheckSchema = z.object({
  url: z.string().url().optional(),
  domain: z.string().min(1).optional(), 
  ip: z.string().ip().optional(),
  hash: z.string().min(32).optional(),
  email: z.string().email().optional()
}).refine(data => 
  data.url || data.domain || data.ip || data.hash || data.email,
  'At least one indicator (url, domain, ip, hash, email) must be provided'
);

const scanRequestSchema = z.object({
  scan_type: z.enum(['quick', 'full', 'custom', 'real_time']),
  targets: z.array(z.string()).optional(),
  custom_rules: z.array(z.object({
    rule_type: z.string(),
    pattern: z.string(),
    action: z.enum(['block', 'warn', 'log'])
  })).optional()
});

// Real-time threat checking endpoint
threatRoutes.post('/check', async (c: AuthContext) => {
  try {
    const body = await c.req.json();
    const validatedData = threatCheckSchema.parse(body);
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    // Check subscription limits for free users
    const userFeatures = SUBSCRIPTION_FEATURES[user.subscription_type];
    
    // Premium feature check - advanced threat intelligence
    const useAdvancedIntelligence = userFeatures.threat_intelligence_access;
    
    let threatResponse: ThreatCheckResponse = {
      is_threat: false,
      confidence_score: 0.0,
      blocked: false,
      recommendations: []
    };

    // Check each provided indicator against threat intelligence database
    const indicators = [
      { type: 'url', value: validatedData.url },
      { type: 'domain', value: validatedData.domain },
      { type: 'ip', value: validatedData.ip },
      { type: 'hash', value: validatedData.hash },
      { type: 'email', value: validatedData.email }
    ].filter(indicator => indicator.value);

    let highestThreatScore = 0;
    let detectedThreats: any[] = [];

    for (const indicator of indicators) {
      // Query threat intelligence database
      const threats = await c.env.DB.prepare(`
        SELECT threat_type, confidence_score, severity, description, source, metadata
        FROM threat_intelligence 
        WHERE indicator_type = ? AND indicator_value = ? AND is_active = TRUE
        ORDER BY confidence_score DESC
        LIMIT ${useAdvancedIntelligence ? 10 : 3}
      `).bind(indicator.type, indicator.value).all();

      if (threats.results.length > 0) {
        for (const threat of threats.results) {
          detectedThreats.push(threat);
          if (threat.confidence_score > highestThreatScore) {
            highestThreatScore = threat.confidence_score;
            threatResponse = {
              is_threat: true,
              threat_type: threat.threat_type,
              confidence_score: threat.confidence_score,
              severity: threat.severity,
              description: threat.description || `${threat.threat_type} detected`,
              blocked: threat.confidence_score >= 0.7, // Auto-block high confidence threats
              recommendations: generateRecommendations(threat)
            };
          }
        }
      }
    }

    // Enhanced analysis for premium users
    if (useAdvancedIntelligence && detectedThreats.length > 0) {
      // Machine learning-based risk assessment
      const mlRiskScore = await calculateMlRiskScore(indicators, detectedThreats);
      threatResponse.confidence_score = Math.max(threatResponse.confidence_score, mlRiskScore);
      
      // Behavioral pattern analysis
      const behaviorAnalysis = await analyzeBehaviorPatterns(user.id, indicators, c.env.DB);
      threatResponse.recommendations.push(...behaviorAnalysis.recommendations);
    }

    // Log threat detection
    if (threatResponse.is_threat) {
      await logThreatDetection(user.id, validatedData, threatResponse, c.env.DB);
    }

    // Store real-time threat data in KV for dashboard
    await c.env.KV_THREATS.put(
      `threat_check:${user.id}:${Date.now()}`,
      JSON.stringify({
        user_id: user.id,
        indicators: validatedData,
        response: threatResponse,
        timestamp: Date.now()
      }),
      { expirationTtl: 24 * 60 * 60 } // 24 hours
    );

    return c.json(threatResponse);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Invalid request format',
        details: error.errors
      }, 400);
    }

    console.error('Threat check error:', error);
    return c.json({
      error: 'Threat check failed',
      is_threat: false,
      confidence_score: 0,
      blocked: false,
      recommendations: ['Unable to complete threat analysis. Please try again.']
    }, 500);
  }
});

// Security scan endpoint
threatRoutes.post('/scan', async (c: AuthContext) => {
  try {
    const body = await c.req.json();
    const validatedData = scanRequestSchema.parse(body);
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const userFeatures = SUBSCRIPTION_FEATURES[user.subscription_type];
    
    // Check daily scan limits for non-god accounts
    if (userFeatures.daily_scans !== -1) {
      const today = new Date().toISOString().split('T')[0];
      const todaysScans = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM security_scans 
        WHERE user_id = ? AND DATE(started_at) = ? AND status IN ('completed', 'running')
      `).bind(user.id, today).first() as { count: number };

      if (todaysScans.count >= userFeatures.daily_scans) {
        return c.json({
          error: 'Daily scan limit exceeded',
          daily_limit: userFeatures.daily_scans,
          scans_used: todaysScans.count,
          upgrade_message: 'Upgrade to premium for unlimited scans'
        }, 429);
      }
    }

    // Premium feature checks
    if (validatedData.scan_type === 'custom' && !userFeatures.custom_rules) {
      return c.json({
        error: 'Custom scans require premium subscription',
        upgrade_url: '/pricing'
      }, 402);
    }

    if (validatedData.scan_type === 'real_time' && !userFeatures.real_time_protection) {
      return c.json({
        error: 'Real-time scanning requires premium subscription',
        upgrade_url: '/pricing'
      }, 402);
    }

    // Create scan record
    const scanId = nanoid(16);
    const scanData = {
      scan_type: validatedData.scan_type,
      targets: validatedData.targets || [],
      custom_rules: validatedData.custom_rules || [],
      subscription_tier: user.subscription_type
    };

    await c.env.DB.prepare(`
      INSERT INTO security_scans (
        id, user_id, scan_type, status, scan_data, started_at
      ) VALUES (?, ?, ?, 'running', ?, CURRENT_TIMESTAMP)
    `).bind(scanId, user.id, validatedData.scan_type, JSON.stringify(scanData)).run();

    // Simulate scan execution (in production, this would trigger background processing)
    const scanResults = await performSecurityScan(scanId, validatedData, user.subscription_type, c.env.DB);

    // Update scan with results
    await c.env.DB.prepare(`
      UPDATE security_scans 
      SET status = 'completed', threats_found = ?, threats_blocked = ?, 
          completed_at = CURRENT_TIMESTAMP, duration_seconds = ?
      WHERE id = ?
    `).bind(
      scanResults.threats_found,
      scanResults.threats_blocked,
      scanResults.duration_seconds,
      scanId
    ).run();

    const response: Partial<SecurityScan> = {
      id: scanId,
      scan_type: validatedData.scan_type,
      status: 'completed',
      threats_found: scanResults.threats_found,
      threats_blocked: scanResults.threats_blocked,
      duration_seconds: scanResults.duration_seconds,
      scan_data: scanResults
    };

    return c.json(response, 201);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Invalid scan request format',
        details: error.errors
      }, 400);
    }

    console.error('Security scan error:', error);
    return c.json({
      error: 'Security scan failed',
      message: 'Unable to complete security scan. Please try again.'
    }, 500);
  }
});

// Get scan results
threatRoutes.get('/scan/:scanId', async (c: AuthContext) => {
  try {
    const scanId = c.req.param('scanId');
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const scan = await c.env.DB.prepare(`
      SELECT * FROM security_scans WHERE id = ? AND user_id = ?
    `).bind(scanId, user.id).first() as SecurityScan | null;

    if (!scan) {
      return c.json({ error: 'Scan not found' }, 404);
    }

    // Parse scan_data JSON
    let scanData = {};
    try {
      scanData = JSON.parse(scan.scan_data || '{}');
    } catch (e) {
      scanData = {};
    }

    return c.json({
      ...scan,
      scan_data: scanData
    });

  } catch (error) {
    console.error('Get scan error:', error);
    return c.json({ error: 'Failed to retrieve scan results' }, 500);
  }
});

// Get user's scan history
threatRoutes.get('/scans', async (c: AuthContext) => {
  try {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    const scans = await c.env.DB.prepare(`
      SELECT id, scan_type, status, threats_found, threats_blocked, 
             started_at, completed_at, duration_seconds
      FROM security_scans 
      WHERE user_id = ? 
      ORDER BY started_at DESC 
      LIMIT ? OFFSET ?
    `).bind(user.id, limit, offset).all();

    const total = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM security_scans WHERE user_id = ?
    `).bind(user.id).first() as { count: number };

    return c.json({
      scans: scans.results,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });

  } catch (error) {
    console.error('Get scans error:', error);
    return c.json({ error: 'Failed to retrieve scan history' }, 500);
  }
});

// Get threat intelligence data (premium feature)
threatRoutes.get('/intelligence', async (c: AuthContext) => {
  try {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const userFeatures = SUBSCRIPTION_FEATURES[user.subscription_type];
    
    if (!userFeatures.threat_intelligence_access) {
      return c.json({
        error: 'Threat intelligence requires premium subscription',
        upgrade_url: '/pricing'
      }, 402);
    }

    const indicatorType = c.req.query('type');
    const severity = c.req.query('severity');
    const limit = parseInt(c.req.query('limit') || '100');

    let query = `
      SELECT threat_type, indicator_type, indicator_value, confidence_score, 
             severity, description, source, first_seen, last_seen
      FROM threat_intelligence 
      WHERE is_active = TRUE
    `;
    const params = [];

    if (indicatorType) {
      query += ' AND indicator_type = ?';
      params.push(indicatorType);
    }

    if (severity) {
      query += ' AND severity = ?';
      params.push(severity);
    }

    query += ' ORDER BY confidence_score DESC, last_seen DESC LIMIT ?';
    params.push(limit);

    const threats = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({
      threat_intelligence: threats.results,
      total_entries: threats.results.length,
      subscription_tier: user.subscription_type
    });

  } catch (error) {
    console.error('Threat intelligence error:', error);
    return c.json({ error: 'Failed to retrieve threat intelligence' }, 500);
  }
});

// Helper functions
async function generateRecommendations(threat: any): Promise<string[]> {
  const recommendations = [];
  
  switch (threat.threat_type) {
    case 'phishing':
      recommendations.push('Do not enter personal information on this site');
      recommendations.push('Verify the website URL carefully');
      recommendations.push('Contact the organization directly to confirm legitimacy');
      break;
    case 'malware':
      recommendations.push('Do not download or execute files from this source');
      recommendations.push('Run a full system scan immediately');
      recommendations.push('Update your antivirus definitions');
      break;
    case 'ransomware':
      recommendations.push('Immediately disconnect from the internet');
      recommendations.push('Do not pay any ransom demands');
      recommendations.push('Contact cybersecurity professionals for assistance');
      break;
    default:
      recommendations.push('Exercise caution when interacting with this content');
      recommendations.push('Monitor your accounts for suspicious activity');
  }

  if (threat.severity === 'critical') {
    recommendations.unshift('CRITICAL THREAT - Avoid all interaction');
  }

  return recommendations;
}

async function calculateMlRiskScore(indicators: any[], threats: any[]): Promise<number> {
  // Simplified ML risk scoring algorithm
  let riskScore = 0;
  
  // Factor in number of threat sources
  riskScore += Math.min(threats.length * 0.1, 0.3);
  
  // Factor in threat diversity
  const uniqueThreatTypes = new Set(threats.map(t => t.threat_type));
  riskScore += Math.min(uniqueThreatTypes.size * 0.15, 0.4);
  
  // Factor in confidence scores
  const avgConfidence = threats.reduce((sum, t) => sum + t.confidence_score, 0) / threats.length;
  riskScore += avgConfidence * 0.5;

  return Math.min(riskScore, 1.0);
}

async function analyzeBehaviorPatterns(userId: string, indicators: any[], db: D1Database): Promise<{ recommendations: string[] }> {
  // Analyze user's historical threat encounters
  const recentThreats = await db.prepare(`
    SELECT threat_type, COUNT(*) as count
    FROM security_threats 
    WHERE user_id = ? AND detected_at > datetime('now', '-30 days')
    GROUP BY threat_type
    ORDER BY count DESC
  `).bind(userId).all();

  const recommendations = [];
  
  if (recentThreats.results.length > 0) {
    const topThreat = recentThreats.results[0];
    recommendations.push(`You've encountered ${topThreat.count} ${topThreat.threat_type} threats recently - consider enabling advanced protection`);
  }

  return { recommendations };
}

async function logThreatDetection(userId: string, indicators: any, response: ThreatCheckResponse, db: D1Database) {
  try {
    await db.prepare(`
      INSERT INTO security_threats (
        user_id, threat_type, threat_level, url, domain, ip_address,
        threat_data, blocked, blocked_at, detected_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      userId,
      response.threat_type || 'unknown',
      response.severity || 'medium',
      indicators.url || null,
      indicators.domain || null,
      indicators.ip || null,
      JSON.stringify({ confidence_score: response.confidence_score, indicators }),
      response.blocked,
      response.blocked ? new Date().toISOString() : null
    ).run();
  } catch (error) {
    console.error('Failed to log threat detection:', error);
  }
}

async function performSecurityScan(scanId: string, scanParams: any, subscriptionTier: string, db: D1Database) {
  // Simulate security scan execution
  const startTime = Date.now();
  
  // Premium users get more thorough scans
  const isPremium = subscriptionTier !== 'free';
  const scanDepth = isPremium ? 'deep' : 'surface';
  
  // Simulate scan results based on subscription tier
  let threatsFound = Math.floor(Math.random() * (isPremium ? 10 : 3));
  let threatsBlocked = Math.floor(threatsFound * (isPremium ? 0.9 : 0.6));
  
  // Custom scan type adjustments
  if (scanParams.scan_type === 'full') {
    threatsFound += Math.floor(Math.random() * 5);
  } else if (scanParams.scan_type === 'quick') {
    threatsFound = Math.min(threatsFound, 2);
  }

  const duration = Math.floor((Date.now() - startTime) / 1000) + Math.floor(Math.random() * 30);

  return {
    threats_found: threatsFound,
    threats_blocked: threatsBlocked,
    duration_seconds: duration,
    scan_depth: scanDepth,
    files_scanned: isPremium ? Math.floor(Math.random() * 10000) + 5000 : Math.floor(Math.random() * 1000) + 500,
    registry_entries_checked: isPremium ? Math.floor(Math.random() * 5000) + 2000 : 0,
    network_connections_analyzed: isPremium ? Math.floor(Math.random() * 100) + 50 : 0
  };
}

export { threatRoutes };