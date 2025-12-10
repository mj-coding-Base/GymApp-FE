/**
 * PM2 Ecosystem Configuration
 * 
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 start ecosystem.config.cjs --env production
 *   pm2 delete ecosystem.config.cjs
 */

module.exports = {
  apps: [
    {
      name: 'gymapp-fe',
      script: './scripts/start-prod.js',
      cwd: '/srv/gymapp-fe',
      
      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 3002,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001, // Changed from 3002 to avoid persistent port conflict
      },
      
      // Process management
      instances: 1, // Run single instance (Next.js handles clustering internally)
      exec_mode: 'fork', // Use fork mode (not cluster, as Next.js handles its own clustering)
      
      // Auto-restart
      autorestart: true,
      watch: false, // Don't watch files in production
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      
      // Logging - Use PM2 default location to avoid permission issues
      // Logs will be in ~/.pm2/logs/ by default
      // error_file: './logs/pm2-error.log',
      // out_file: './logs/pm2-out.log',
      // log_file: './logs/pm2-combined.log',
      time: true, // Add timestamp to logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Advanced options
      min_uptime: '10s', // Minimum uptime to consider app stable
      max_restarts: 10, // Max restarts in 1 minute
      restart_delay: 4000, // Delay between restarts (ms)
      
      // Graceful shutdown
      kill_timeout: 10000, // Time to wait for graceful shutdown (increased for port cleanup)
      listen_timeout: 15000, // Time to wait for app to start listening
      shutdown_with_message: true,
      wait_ready: true, // Wait for app to be ready before considering it started
      
      // Source map support
      source_map_support: true,
      
      // Environment file
      env_file: '.env',
    },
  ],
};

