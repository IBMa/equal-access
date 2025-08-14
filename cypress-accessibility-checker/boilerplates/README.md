# Accessibility Checker Boilerplate: Cypress

This boilerplate demonstrates how to integrate IBM's Accessibility Checker with Cypress for automated accessibility testing of web applications.

## Overview

This project provides a starting point for developers who want to include automated accessibility testing in their web applications using:

- **Cypress**: A next-generation front-end testing tool built for the modern web
- **cypress-accessibility-checker**: A Cypress plugin for IBM's Accessibility Checker

## What's Different from Standard Cypress Setup

This boilerplate extends a standard Cypress setup with:

1. **Accessibility Checker Integration**: Imports and uses the `cypress-accessibility-checker` plugin
2. **Custom Cypress Commands**: Adds custom commands like `getCompliance()` and `assertCompliance()`
3. **Baseline Support**: Demonstrates how to use baselines to track accessibility issues over time
4. **Task Configuration**: Sets up Cypress tasks for accessibility checking
5. **Sample HTML**: Includes sample HTML files with accessibility issues for testing

## Project Structure

- `cypress/e2e/`: Cypress test files
- `cypress/fixtures/`: Test data files
- `cypress/downloads/`: Downloaded files during test execution
- `sample-html/`: Sample HTML files for testing
- `baselines/`: Baseline files for comparison
- `cypress.config.js`: Cypress configuration
- `package.json`: Project dependencies and scripts

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run Cypress headless**:
   ```bash
   npm run cypress:run
   ```

3. **Run Cypress interactive**:
   ```bash
   # Start the HTTP server
   npm run test:start-http
   
   # Open Cypress
   npm run cypress:open
   ```

## How It Works

The boilerplate demonstrates accessibility testing by:

1. Using Cypress to visit web pages
2. Using the `getCompliance()` custom command to scan the page for accessibility issues
3. Using the `assertCompliance()` command to compare results against baselines
4. Demonstrating both with and without baseline comparisons

Key code snippet:

```javascript
cy.visit('http://localhost:8080/sample-html/example-html-file.html')
  .getCompliance('example-nobaseline') // Label should be unique per call to the function
  .assertCompliance()
  .then(result => {
    // This is 2 because there are errors and no baseline
    expect(result).to.equal(2)
  })

cy.visit('http://localhost:8080/sample-html/example-html-file.html')
  .getCompliance('example-baseline') // Label should be unique per call to the function
  .assertCompliance()
  .then(result => {
    // This is 0 because a matching baseline exists to ignore the reported issues
    expect(result).to.equal(0)
  })
```

## Cypress Configuration

The Cypress configuration includes:

- Setting up the accessibility checker plugin as a Cypress task
- Configuring the base URL for tests
- Other standard Cypress configuration options

## Using in Your Project

To use this boilerplate in your project:

1. Replace the sample HTML files with your application
2. Update the URLs in the tests to point to your application
3. Modify the test cases to match your application's structure
4. Run the tests to identify accessibility issues

## Learn More

- [Cypress Documentation](https://docs.cypress.io/)
- [IBM Equal Access Toolkit](https://www.ibm.com/able/toolkit)
- [Accessibility Checker GitHub](https://github.com/IBMa/equal-access)
- [cypress-accessibility-checker NPM Package](https://www.npmjs.com/package/cypress-accessibility-checker)
