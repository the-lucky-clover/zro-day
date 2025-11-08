// PM2 Configuration for ZRO-DAY Security Platform
// Development server with Cloudflare Pages and D1 database

module.exports = {
  apps: [
    {
      name: 'zro-day-security',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=zro-day-production --local --ip 0.0.0.0 --port 3000',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        JWT_SECRET: 'dev-jwt-secret-key-change-in-production',
        GOD_ACCOUNT_EMAIL: 'pounds1@gmail.com'
      },
      watch: false, // Disable PM2 file monitoring (wrangler handles hot reload)
      instances: 1, // Development mode uses only one instance
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s',
      max_memory_restart: '500M',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      // Environment-specific settings
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ],
  
  // Deployment configuration (for production)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/zro-day-security.git',
      path: '/var/www/zro-day-security',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': ''
    }
  }
};