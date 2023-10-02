const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
        on('task', {
            accessibilityChecker: require('../plugin')
        });
    },
    baseUrl: 'http://localhost:8080/test/sample-html',
  },
})
