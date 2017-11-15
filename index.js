/* eslint-env node */
'use strict';

module.exports = {
  name: 'ember-fitting-room',

  options: {
    cssModules: {
      plugins: [require('postcss-nested-ancestors'), require('postcss-nested')]
    }
  }
};
