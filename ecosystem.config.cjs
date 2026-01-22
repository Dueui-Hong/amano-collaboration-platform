module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npm',
      args: 'run start',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 3000,
      error_file: '/tmp/webapp-err.log',
      out_file: '/tmp/webapp-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
