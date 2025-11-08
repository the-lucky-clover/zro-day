// ZRO-DAY Security Platform - Main Application
// Advanced browser security with 1950s radar operator theme and bulletproof architecture

import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Import our custom middleware and route handlers
import { 
  authMiddleware, 
  premiumRequired, 
  godAccountRequired, 
  requirePermission,
  rateLimitMiddleware,
  secureCorsmiddleware,
  auditLogMiddleware,
  AuthContext 
} from './middleware/auth.js';

// Import API route handlers
import { authRoutes } from './api/auth.js';
import { threatRoutes } from './api/threats.js';
import { userRoutes } from './api/users.js';
import { adminRoutes } from './api/admin.js';
import { subscriptionRoutes } from './api/subscriptions.js';
import { extensionRoutes } from './api/extension.js';

type Bindings = {
  DB: D1Database;
  KV_SESSIONS: KVNamespace;
  KV_THREATS: KVNamespace;
  R2_THREAT_DATA: R2Bucket;
  JWT_SECRET: string;
  GOD_ACCOUNT_EMAIL: string;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Global middleware
app.use('*', logger());
app.use('*', secureCorsmiddleware);

// Serve static files with radar theme assets
app.use('/static/*', serveStatic({ root: './public' }));

// Health check endpoint (no auth required)
app.get('/health', async (c) => {
  try {
    // Quick database health check
    const dbHealth = await c.env.DB.prepare('SELECT 1 as health').first();
    
    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: c.env.ENVIRONMENT || 'development',
      database: dbHealth ? 'connected' : 'disconnected',
      services: {
        threat_intelligence: 'operational',
        real_time_scanning: 'operational',
        premium_features: 'operational',
        god_mode: 'operational'
      }
    });
  } catch (error) {
    return c.json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    }, 503);
  }
});

// Public API routes (no authentication required)
app.route('/api/auth', authRoutes);

// Protected API routes (authentication required)
app.use('/api/*', authMiddleware as any);
app.use('/api/*', rateLimitMiddleware as any);

// User management routes
app.route('/api/users', userRoutes);

// Threat detection and intelligence routes  
app.route('/api/threats', threatRoutes);

// Subscription and billing routes
app.route('/api/subscriptions', subscriptionRoutes);

// Browser extension API routes
app.route('/api/extension', extensionRoutes);

// God account admin routes (highest privilege level)
app.use('/api/admin/*', godAccountRequired as any);
app.route('/api/admin', adminRoutes);

// Main landing page with 1950s radar operator theme
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en" class="bg-black">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZRO-DAY Security | Advanced Browser Protection</title>
    <meta name="description" content="Military-grade browser security with 1950s radar operator aesthetics. Real-time malware detection, premium threat intelligence, and bulletproof protection.">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Icons -->
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    
    <!-- Custom radar theme styles -->
    <link href="/static/radar-theme.css" rel="stylesheet">
    
    <!-- Tailwind Config for Radar Theme -->
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              'radar-green': '#00ff41',
              'radar-amber': '#ffb000',
              'radar-red': '#ff0000',
              'radar-bg': '#0a0a0a',
              'radar-grid': '#003300',
              'terminal-green': '#00ff00',
            },
            fontFamily: {
              'mono': ['Courier New', 'monospace'],
              'radar': ['OCR A Std', 'Courier New', 'monospace'],
            },
            animation: {
              'radar-sweep': 'radar-sweep 4s linear infinite',
              'blink': 'blink 1s ease-in-out infinite alternate',
              'shimmer': 'shimmer 2s ease-in-out infinite alternate',
              'scan-line': 'scan-line 2s linear infinite',
            }
          }
        }
      }
    </script>
</head>
<body class="bg-black text-radar-green font-mono min-h-screen overflow-x-hidden">
    <!-- Radar Grid Background -->
    <div class="fixed inset-0 radar-grid-bg opacity-20"></div>
    
    <!-- Header with Military-Style Navigation -->
    <header class="relative z-20 border-b border-radar-green/30 bg-black/90 backdrop-blur-sm">
        <nav class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="w-8 h-8 border-2 border-radar-green rounded-full flex items-center justify-center">
                        <i class="fas fa-crosshairs text-radar-green animate-pulse"></i>
                    </div>
                    <h1 class="text-2xl font-radar font-bold tracking-wider">
                        <span class="text-radar-green">ZRO</span><span class="text-radar-amber">-DAY</span>
                        <span class="text-xs ml-2 text-radar-green/70">SECURITY PLATFORM</span>
                    </h1>
                </div>
                
                <div class="hidden md:flex items-center space-x-6">
                    <a href="#features" class="hover:text-radar-amber transition-colors">SYSTEMS</a>
                    <a href="#pricing" class="hover:text-radar-amber transition-colors">PRICING</a>
                    <a href="#extension" class="hover:text-radar-amber transition-colors">EXTENSION</a>
                    <button id="loginBtn" class="px-4 py-2 border border-radar-green hover:bg-radar-green hover:text-black transition-all duration-300">
                        LOGIN
                    </button>
                </div>
                
                <button class="md:hidden text-radar-green">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </nav>
    </header>

    <!-- Hero Section with Animated Radar Display -->
    <section class="relative min-h-screen flex items-center justify-center py-20">
        <!-- Radar Sweep Animation -->
        <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-96 h-96 border border-radar-green/30 rounded-full relative">
                <div class="absolute inset-4 border border-radar-green/20 rounded-full"></div>
                <div class="absolute inset-8 border border-radar-green/20 rounded-full"></div>
                <div class="absolute inset-12 border border-radar-green/20 rounded-full"></div>
                
                <!-- Radar sweep line -->
                <div class="absolute top-1/2 left-1/2 w-48 h-0.5 bg-gradient-to-r from-radar-green to-transparent origin-left animate-radar-sweep"></div>
                
                <!-- Threat blips -->
                <div class="absolute top-20 right-24 w-2 h-2 bg-radar-red rounded-full animate-blink"></div>
                <div class="absolute bottom-16 left-20 w-2 h-2 bg-radar-amber rounded-full animate-pulse"></div>
                <div class="absolute top-32 left-28 w-2 h-2 bg-radar-green rounded-full"></div>
            </div>
        </div>

        <div class="relative z-10 text-center max-w-4xl px-4">
            <div class="mb-8">
                <span class="inline-block px-4 py-2 border border-radar-amber text-radar-amber text-sm tracking-wider mb-4">
                    CLASSIFIED: SECURITY LEVEL ALPHA
                </span>
            </div>
            
            <h1 class="text-4xl md:text-7xl font-radar font-bold mb-6 tracking-wider">
                <span class="text-radar-green">ADVANCED</span><br>
                <span class="text-radar-amber">THREAT</span><br>
                <span class="text-white">DETECTION</span>
            </h1>
            
            <p class="text-xl md:text-2xl text-radar-green/80 mb-8 leading-relaxed">
                Military-grade browser security with real-time malware detection.<br>
                <span class="text-radar-amber">Enhanced from legacy systems.</span> Premium threat intelligence.<br>
                <span class="animate-shimmer">Bulletproof architecture.</span>
            </p>
            
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button id="installExtension" class="px-8 py-4 bg-radar-green text-black font-bold hover:bg-radar-amber transition-all duration-300 transform hover:scale-105">
                    <i class="fab fa-chrome mr-2"></i>
                    INSTALL EXTENSION
                </button>
                <button id="startScan" class="px-8 py-4 border-2 border-radar-green text-radar-green hover:bg-radar-green hover:text-black transition-all duration-300">
                    <i class="fas fa-radar mr-2"></i>
                    INITIATE SCAN
                </button>
            </div>
            
            <!-- Live threat counter -->
            <div class="mt-12 grid grid-cols-3 gap-8 text-center">
                <div class="border border-radar-green/30 p-4 bg-black/50">
                    <div class="text-2xl font-bold text-radar-green" id="threatsBlocked">247,891</div>
                    <div class="text-sm text-radar-green/70">THREATS NEUTRALIZED</div>
                </div>
                <div class="border border-radar-amber/30 p-4 bg-black/50">
                    <div class="text-2xl font-bold text-radar-amber" id="activeUsers">12,847</div>
                    <div class="text-sm text-radar-amber/70">ACTIVE OPERATIVES</div>
                </div>
                <div class="border border-radar-red/30 p-4 bg-black/50">
                    <div class="text-2xl font-bold text-radar-red" id="realTimeAlerts">0</div>
                    <div class="text-sm text-radar-red/70">ACTIVE THREATS</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 relative">
        <div class="container mx-auto px-4">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-radar font-bold text-radar-green mb-4">TACTICAL SYSTEMS</h2>
                <p class="text-radar-green/70 text-lg">Enhanced capabilities beyond legacy protection protocols</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-8">
                <!-- Real-time Protection -->
                <div class="border border-radar-green/30 p-6 bg-black/50 hover:border-radar-green transition-all duration-300">
                    <div class="text-center mb-4">
                        <i class="fas fa-shield-alt text-4xl text-radar-green mb-4"></i>
                        <h3 class="text-xl font-bold text-radar-green">REAL-TIME SHIELD</h3>
                    </div>
                    <ul class="text-radar-green/80 space-y-2">
                        <li><i class="fas fa-check text-radar-green mr-2"></i>Advanced malware detection</li>
                        <li><i class="fas fa-check text-radar-green mr-2"></i>Phishing URL blocking</li>
                        <li><i class="fas fa-check text-radar-green mr-2"></i>Ransomware prevention</li>
                        <li><i class="fas fa-check text-radar-green mr-2"></i>Zero-day threat response</li>
                    </ul>
                </div>
                
                <!-- Threat Intelligence -->
                <div class="border border-radar-amber/30 p-6 bg-black/50 hover:border-radar-amber transition-all duration-300">
                    <div class="text-center mb-4">
                        <i class="fas fa-brain text-4xl text-radar-amber mb-4"></i>
                        <h3 class="text-xl font-bold text-radar-amber">INTELLIGENCE GRID</h3>
                    </div>
                    <ul class="text-radar-amber/80 space-y-2">
                        <li><i class="fas fa-check text-radar-amber mr-2"></i>Global threat database</li>
                        <li><i class="fas fa-check text-radar-amber mr-2"></i>Machine learning analysis</li>
                        <li><i class="fas fa-check text-radar-amber mr-2"></i>Behavioral pattern detection</li>
                        <li><i class="fas fa-check text-radar-amber mr-2"></i>Predictive threat modeling</li>
                    </ul>
                </div>
                
                <!-- Premium Control -->
                <div class="border border-radar-red/30 p-6 bg-black/50 hover:border-radar-red transition-all duration-300">
                    <div class="text-center mb-4">
                        <i class="fas fa-crown text-4xl text-radar-red mb-4"></i>
                        <h3 class="text-xl font-bold text-radar-red">COMMAND CENTER</h3>
                    </div>
                    <ul class="text-radar-red/80 space-y-2">
                        <li><i class="fas fa-check text-radar-red mr-2"></i>Advanced scanning modes</li>
                        <li><i class="fas fa-check text-radar-red mr-2"></i>Custom security rules</li>
                        <li><i class="fas fa-check text-radar-red mr-2"></i>Family account protection</li>
                        <li><i class="fas fa-check text-radar-red mr-2"></i>Priority support channel</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-20 relative">
        <div class="container mx-auto px-4">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-radar font-bold text-radar-green mb-4">OPERATIONAL TIERS</h2>
                <p class="text-radar-green/70 text-lg">Choose your level of protection</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <!-- Free Tier -->
                <div class="border border-radar-green/30 p-8 bg-black/50 text-center">
                    <h3 class="text-2xl font-bold text-radar-green mb-4">RECONNAISSANCE</h3>
                    <div class="text-4xl font-bold text-radar-green mb-2">FREE</div>
                    <div class="text-radar-green/70 mb-6">Basic protection protocol</div>
                    <ul class="text-left text-radar-green/80 space-y-3 mb-8">
                        <li><i class="fas fa-check text-radar-green mr-2"></i>Basic threat detection</li>
                        <li><i class="fas fa-check text-radar-green mr-2"></i>1 scan per day</li>
                        <li><i class="fas fa-check text-radar-green mr-2"></i>100 API calls/day</li>
                        <li><i class="fas fa-times text-red-500 mr-2"></i>Real-time protection</li>
                    </ul>
                    <button class="w-full py-3 border border-radar-green text-radar-green hover:bg-radar-green hover:text-black transition-all duration-300">
                        ACTIVATE FREE
                    </button>
                </div>
                
                <!-- Premium Tier -->
                <div class="border-2 border-radar-amber p-8 bg-black/50 text-center relative overflow-hidden">
                    <div class="absolute top-0 right-0 bg-radar-amber text-black px-4 py-1 text-sm font-bold">
                        POPULAR
                    </div>
                    <h3 class="text-2xl font-bold text-radar-amber mb-4">TACTICAL</h3>
                    <div class="text-4xl font-bold text-radar-amber mb-2">$7.77</div>
                    <div class="text-radar-amber/70 mb-2">per month</div>
                    <div class="text-sm text-radar-amber/60 mb-6">or $77.77/year (save 16%)</div>
                    <ul class="text-left text-radar-amber/80 space-y-3 mb-8">
                        <li><i class="fas fa-check text-radar-amber mr-2"></i>Advanced threat detection</li>
                        <li><i class="fas fa-check text-radar-amber mr-2"></i>Unlimited scans</li>
                        <li><i class="fas fa-check text-radar-amber mr-2"></i>5,000 API calls/day</li>
                        <li><i class="fas fa-check text-radar-amber mr-2"></i>Real-time protection</li>
                        <li><i class="fas fa-check text-radar-amber mr-2"></i>Premium support</li>
                        <li><i class="fas fa-check text-radar-amber mr-2"></i>5 family accounts</li>
                    </ul>
                    <button class="w-full py-3 bg-radar-amber text-black font-bold hover:bg-yellow-400 transition-all duration-300">
                        UPGRADE TO TACTICAL
                    </button>
                </div>
                
                <!-- God Tier -->
                <div class="border border-radar-red/30 p-8 bg-black/50 text-center">
                    <h3 class="text-2xl font-bold text-radar-red mb-4">COMMAND</h3>
                    <div class="text-4xl font-bold text-radar-red mb-2">CLASSIFIED</div>
                    <div class="text-radar-red/70 mb-6">Contact for access</div>
                    <ul class="text-left text-radar-red/80 space-y-3 mb-8">
                        <li><i class="fas fa-check text-radar-red mr-2"></i>Unlimited everything</li>
                        <li><i class="fas fa-check text-radar-red mr-2"></i>God mode access</li>
                        <li><i class="fas fa-check text-radar-red mr-2"></i>Admin privileges</li>
                        <li><i class="fas fa-check text-radar-red mr-2"></i>System management</li>
                        <li><i class="fas fa-check text-radar-red mr-2"></i>White-glove support</li>
                    </ul>
                    <button class="w-full py-3 border border-radar-red text-radar-red hover:bg-radar-red hover:text-black transition-all duration-300">
                        REQUEST ACCESS
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Installation Section -->
    <section id="extension" class="py-20 relative">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-4xl font-radar font-bold text-radar-green mb-8">DEPLOY EXTENSION</h2>
            <p class="text-xl text-radar-green/80 mb-8">Install our Chrome extension for immediate protection</p>
            
            <div class="max-w-2xl mx-auto">
                <button id="downloadExtension" class="inline-flex items-center px-8 py-4 bg-radar-green text-black font-bold hover:bg-radar-amber transition-all duration-300 transform hover:scale-105 mb-4">
                    <i class="fab fa-chrome text-2xl mr-3"></i>
                    <div>
                        <div class="text-lg">Add to Chrome</div>
                        <div class="text-sm opacity-75">Free installation</div>
                    </div>
                </button>
                
                <p class="text-radar-green/60 text-sm">
                    Compatible with Chrome, Edge, Brave, and other Chromium browsers
                </p>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-radar-green/30 py-8 text-center">
        <div class="container mx-auto px-4">
            <div class="text-radar-green/60">
                <p>&copy; 2024 ZRO-DAY Security Platform. All rights reserved.</p>
                <p class="mt-2">Protecting digital assets with military precision since 2024.</p>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/radar-app.js"></script>
</body>
</html>
  `);
});

// Extension installation page
app.get('/extension', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZRO-DAY Browser Extension - Install</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="/static/radar-theme.css" rel="stylesheet">
</head>
<body class="bg-black text-radar-green font-mono">
    <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
            <h1 class="text-4xl font-bold mb-8">ZRO-DAY Extension</h1>
            <p class="mb-8">Advanced browser security extension</p>
            <a href="/zro-day-extension.crx" class="inline-block px-8 py-4 bg-radar-green text-black font-bold">
                Download Extension
            </a>
        </div>
    </div>
</body>
</html>
  `);
});

// Dashboard (authenticated users only)
app.get('/dashboard', authMiddleware as any, (c: AuthContext) => {
  const user = c.get('user');
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZRO-DAY Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="/static/radar-theme.css" rel="stylesheet">
</head>
<body class="bg-black text-radar-green font-mono">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8">Security Dashboard</h1>
        <div class="mb-4">Welcome, ${user?.name || user?.email}</div>
        <div class="grid md:grid-cols-3 gap-6">
            <div class="border border-radar-green p-4">
                <h3 class="text-xl mb-2">Subscription</h3>
                <p class="text-radar-amber">${user?.subscription_type?.toUpperCase()}</p>
                ${user?.is_god_account ? '<p class="text-radar-red">GOD MODE ACTIVE</p>' : ''}
            </div>
            <div class="border border-radar-green p-4">
                <h3 class="text-xl mb-2">API Usage</h3>
                <p>${user?.api_calls_today || 0} calls today</p>
            </div>
            <div class="border border-radar-green p-4">
                <h3 class="text-xl mb-2">Protection Status</h3>
                <p class="text-radar-green">ACTIVE</p>
            </div>
        </div>
    </div>
    <script src="/static/dashboard.js"></script>
</body>
</html>
  `);
});

// Admin panel (god accounts only)
app.get('/admin', godAccountRequired as any, (c: AuthContext) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZRO-DAY Admin Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="/static/radar-theme.css" rel="stylesheet">
</head>
<body class="bg-black text-radar-green font-mono">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8 text-radar-red">
            <i class="fas fa-crown mr-2"></i>
            GOD MODE - ADMIN PANEL
        </h1>
        <div id="adminDashboard">
            <!-- Admin interface will be loaded here -->
        </div>
    </div>
    <script src="/static/admin.js"></script>
</body>
</html>
  `);
});

// API documentation
app.get('/api', (c) => {
  return c.json({
    name: 'ZRO-DAY Security Platform API',
    version: '1.0.0',
    description: 'Advanced browser security platform with premium threat intelligence',
    documentation: 'https://docs.zro-day.com',
    endpoints: {
      public: {
        '/health': 'System health check',
        '/api/auth/login': 'User authentication',
        '/api/auth/register': 'User registration'
      },
      authenticated: {
        '/api/threats/check': 'Check URL/domain for threats',
        '/api/threats/scan': 'Initiate security scan',
        '/api/users/profile': 'User profile management',
        '/api/subscriptions/current': 'Current subscription details'
      },
      premium: {
        '/api/threats/intelligence': 'Advanced threat intelligence',
        '/api/threats/custom-rules': 'Custom security rules',
        '/api/extension/advanced-settings': 'Premium extension features'
      },
      god_mode: {
        '/api/admin/users': 'User management',
        '/api/admin/system': 'System administration',
        '/api/admin/analytics': 'Platform analytics',
        '/api/admin/audit-logs': 'Audit trail access'
      }
    },
    platform_features: [
      '🎯 Military-grade 1950s radar operator aesthetic vs generic UI',
      '⚡ Real-time threat intelligence with ML-powered analysis',
      '🛡️ Bulletproof architecture with edge computing',
      '👑 God mode admin panel for complete system control',
      '💎 Premium feature gatekeeping with subscription tiers',
      '🔒 Enhanced security with rate limiting and audit logs',
      '🚀 Cloudflare Workers edge deployment for global performance',
      '📊 Advanced analytics and monitoring dashboard',
      '🎨 Skeuomorphic design with glassmorphism effects',
      '💰 Competitive pricing: $7.77/month vs $4.99/month (premium features justify cost)'
    ]
  });
});

export default app;
