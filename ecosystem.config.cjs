module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npm',
      args: 'run start',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NODE_OPTIONS: '--max-old-space-size=2048'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 50,
      min_uptime: '10s',
      restart_delay: 3000,
      error_file: '/tmp/webapp-err.log',
      out_file: '/tmp/webapp-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // 메모리 초과 시 자동 재시작
      max_memory_restart: '300M',
      // 크래시 시 자동 재시작
      exp_backoff_restart_delay: 100,
      kill_timeout: 5000
    }
  ]
};
