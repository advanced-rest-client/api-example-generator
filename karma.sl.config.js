/* eslint-disable import/no-extraneous-dependencies */
const merge = require('deepmerge');
const { slSettings } = require('@advanced-rest-client/testing-karma-sl');
const createBaseConfig = require('./karma.conf.js');

module.exports = (config) => {
  const cnf = merge(slSettings(config), {
    sauceLabs: {
      testName: 'api-example-generator',
    },
    client: {
      mocha: {
        timeout: 15000
      }
    },
  });
  // slConfig.browsers = [
  //   'SL_Chrome',
  //   'SL_Chrome-1',
  //   'SL_Firefox',
  //   'SL_Firefox-1',
  //   'SL_Safari',
  //   'SL_EDGE'
  // ];
  cnf.captureTimeout = 0;
  cnf.sauceLabs.commandTimeout = 600;
  cnf.commandTimeout = 600;
  cnf.browserDisconnectTimeout = 10000;
  config.set(merge(createBaseConfig(config), cnf));
  return config;
};
