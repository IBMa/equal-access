# Accessibility Checker Boilerplate: Karma (Basic)

This boilerplate demonstrates how to integrate IBM's Accessibility Checker with the Karma test runner for automated accessibility testing of web applications.

## Overview

This project provides a starting point for developers who want to include automated accessibility testing in their web applications using:

- **Karma**: A test runner that allows you to execute JavaScript code in multiple real browsers
- **Jasmine**: A behavior-driven development framework for testing JavaScript code
- **karma-accessibility-checker**: A Karma plugin for IBM's Accessibility Checker

## What's Different from Standard Karma Setup

This boilerplate extends a standard Karma setup with:

1. **Accessibility Checker Integration**: Configures Karma to use the `karma-accessibility-checker` plugin
2. **Custom Framework**: Adds 'aChecker' to the list of frameworks in the Karma configuration
3. **Custom Preprocessor**: Processes HTML files and baseline files for accessibility testing
4. **Custom Reporter**: Reports accessibility issues found during testing
5. **Accessibility Configuration**: Includes an `achecker.js` configuration file that defines:
   - Rule archives to use
   - Policies to scan against
   - Violation levels that cause test failures
   - Report formats and locations

## Project Structure

- `test/`: Test files using Jasmine
- `test/baselines/`: Baseline files for comparison
- `src/`: Source HTML files to be tested
- `achecker.js`: Configuration for the accessibility checker
- `karma.conf.js`: Karma configuration
- `package.json`: Project dependencies and scripts

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the tests**:
   ```bash
   npm test
   ```

## How It Works

The boilerplate demonstrates accessibility testing by:

1. Using Karma to load HTML files into a browser environment
2. Using the html2js preprocessor to make HTML content available to tests
3. Using the aChecker framework to scan the HTML content for accessibility issues
4. Comparing results against baselines (if available)
5. Reporting accessibility violations

Key code snippet:

```javascript
// Perform the accessibility scan using the AAT.getCompliance API
aChecker.getCompliance(testDataFileContent, testFile, function (results) {
    // Call the aChecker.assertCompliance API which is used to compare the results with baseline object
    var returnCode = aChecker.assertCompliance(results);
    
    // In the case that the violationData is not defined then trigger an error right away.
    expect(returnCode).toBe(0, "Scanning " + testFile + " failed.");
    
    // Mark the testcases as done.
    done();
});
```

## Karma Configuration

The Karma configuration includes:

- ChromeHeadless browser with web security disabled
- Jasmine and aChecker frameworks
- HTML2JS preprocessor for HTML files
- aChecker preprocessor for baseline files
- aChecker reporter for accessibility results

## Learn More

- [Karma Documentation](https://karma-runner.github.io/)
- [Jasmine Documentation](https://jasmine.github.io/)
- [IBM Equal Access Toolkit](https://www.ibm.com/able/toolkit)
- [Accessibility Checker GitHub](https://github.com/IBMa/equal-access)
- [karma-accessibility-checker NPM Package](https://www.npmjs.com/package/karma-accessibility-checker)