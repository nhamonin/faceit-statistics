module.exports = {
  apps: [
    {
      name: 'app',
      script: 'app.js',
      interpreter: '/root/.nvm/versions/node/v19.3.0/bin/node',
      node_args: '--experimental-specifier-resolution=node',
      max_size: '100M',
    },
  ],
};
