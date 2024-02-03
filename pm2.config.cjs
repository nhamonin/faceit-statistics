module.exports = {
  apps: [
    {
      name: 'app',
      script: 'app.js',
      interpreter: 'node@20.11.0',
      node_args: '--experimental-specifier-resolution=node --env-file=.env',
      max_size: '100M',
    },
  ],
};
