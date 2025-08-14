# Accessibility Checker Boilerplate: Mocha with Selenium WebDriver

This boilerplate demonstrates how to integrate IBM's Accessibility Checker with a Mocha test framework using Selenium WebDriver for browser automation.

## Overview

This project provides a starting point for developers who want to include automated accessibility testing in their web applications using:

- **Mocha**: A feature-rich JavaScript test framework running on Node.js
- **Selenium WebDriver**: A browser automation library that lets you control browsers programmatically
- **Accessibility Checker**: IBM's tool for automated accessibility testing

## What's Different from Standard Mocha/Selenium Setup

This boilerplate extends a standard Mocha and Selenium WebDriver setup with:

1. **Accessibility Checker Integration**: Imports and uses the `accessibility-checker` package to scan web pages for accessibility issues
2. **Utility Functions**: Includes helper functions for setting up WebDriver and running accessibility tests
3. **Accessibility Configuration**: Includes an `achecker.js` configuration file that defines:
   - Rule archives to use
   - Policies to scan against
   - Violation levels that cause test failures
   - Report formats and locations

## Project Structure

- `test/`: Test files using Mocha and Selenium WebDriver
- `sample/`: Sample web application for testing
- `util/`: Utility functions for WebDriver setup and accessibility testing
- `achecker.js`: Configuration for the accessibility checker
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

1. Setting up a Selenium WebDriver instance to control a browser
2. Loading web pages and interacting with them using WebDriver
3. Using accessibility-checker to scan pages for accessibility issues
4. Making assertions about accessibility compliance using Mocha's assertion library

Key features include:

- Browser automation with Selenium WebDriver
- Accessibility testing with IBM's accessibility-checker
- Configurable accessibility policies and reporting

## Learn More

- [Mocha Documentation](https://mochajs.org/)
- [Selenium WebDriver Documentation](https://www.selenium.dev/documentation/en/webdriver/)
- [IBM Equal Access Toolkit](https://www.ibm.com/able/toolkit)
- [Accessibility Checker GitHub](https://github.com/IBMa/equal-access)