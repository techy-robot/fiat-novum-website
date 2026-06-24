const path = require('path');

module.exports = {
  plugins: {
    'postcss-flexbugs-fixes': {},
    'postcss-preset-env': {
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
      features: {
        'custom-properties': false,
      },
    },
    [path.resolve(__dirname, 'postcss-focus-visible-within-replace.js')]: {},
  },
}
