const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    /**setupNodeEvents(on, config) {
        on('task', {
            accessibilityChecker: require('cypress-accessibility-checker/plugin')
        });
    },
    baseUrl: 'http://localhost:8080/sample-html',
    supportFile: false
  }*/
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    supportFile: false
  },
})
