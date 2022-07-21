const { create } = require('@storybook/theming');

module.exports = create({
  base: 'light',
  colorPrimary: '#eeeff0',
  colorSecondary: '#2563eb',

  // UI
  appBg: '#fafafa',
  appContentBg: 'white',
  appBorderColor: '#eeeff0',
  appBorderRadius: 6,

  // Text colors
  textColor: 'black',
  textMutedColor: '#4b5563',

  // Toolbar colors
  barTextColor: '#4b5563',
  barBg: '#eeeff0',

  // Form
  inputBg: 'white',
  inputTextColor: 'black',
  inputBorder: '#9ca3af',
  inputBorderRadius: 4,

  // Brand logo
  brandTitle: 'Yext Component Library',
  brandUrl: 'https://github.com/yext/search-ui-react',
  brandImage: './logo.png'
});
