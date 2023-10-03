const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
        on('task', {
            accessibilityChecker: require('cypress-accessibility-checker/plugin')
        });
    },
    baseUrl: 'http://localhost:8080/sample-html',
    supportFile: false
  }
})
