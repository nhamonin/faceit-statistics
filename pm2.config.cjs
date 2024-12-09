module.exports = {
  apps: [
    {
      name: 'app',
      script: 'app.js',
      node_args: '--experimental-specifier-resolution=node --env-file=.env',
      max_size: '100M',
      interpreter: 'node@21.6.1',
    },
  ],
};
