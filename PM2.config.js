module.exports = {
  apps: [
    {
      name: 'discord-bot-list-backend',
      script: './dist/app.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'discord-bot-list-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './frontend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        PORT: 3060,
        NODE_ENV: 'production'
      }
    }
  ]
};
