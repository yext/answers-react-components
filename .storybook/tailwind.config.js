const tailwindConfig = require('../tailwind.config.js');

module.exports = {
  ...tailwindConfig,
  content: [
    './src/**/*.{ts,tsx}'
  ]
};