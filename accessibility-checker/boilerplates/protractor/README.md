# Accessibility Checker Boilerplate: Protractor

This boilerplate demonstrates how to integrate IBM's Accessibility Checker with Protractor for testing Angular applications.

## Overview

Protractor is a wrapper around [Selenium WebDriver](https://www.npmjs.com/package/selenium-webdriver) that provides an automated testing framework,
which simulates user interaction with an Angular web application for a range of browsers and mobile devices.
It provides all features of [Selenium WebDriver](https://www.npmjs.com/package/selenium-webdriver) along with Angular specific features for seamless end to end testing.

This project provides a starting point for developers who want to include automated accessibility testing in their Angular applications using:

- **Protractor**: An end-to-end test framework for Angular and AngularJS applications
- **Selenium WebDriver**: A browser automation library that lets you control browsers programmatically
- **Accessibility Checker**: IBM's tool for automated accessibility testing

## What's Different from Standard Protractor Setup

This boilerplate extends a standard Protractor setup with:

1. **Accessibility Checker Integration**: Imports and uses the `accessibility-checker` package to scan Angular applications for accessibility issues
2. **Test File Server**: Includes a local file server for serving test files
3. **Results Upload**: Provides functionality for uploading test results
4. **Accessibility Configuration**: Includes an `achecker.js` configuration file that defines:
   - Rule archives to use
   - Policies to scan against
   - Violation levels that cause test failures
   - Report formats and locations

## Project Structure

- `test/`: Test files using Protractor
- `sample/`: Sample Angular application for testing
- `achecker.js`: Configuration for the accessibility checker
- `conf.js`: Protractor configuration
- `TestFileServerLocal.js`: Local file server for testing
- `uploadResults.js`: Script for uploading test results
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

1. Setting up a Protractor environment for testing Angular applications
2. Using Protractor to navigate and interact with Angular components
3. Integrating accessibility-checker to scan pages for accessibility issues
4. Reporting and optionally uploading accessibility test results

## Baseline Basics

See the [Jest](https://github.com/IBMa/equal-access/tree/master/accessibility-checker/boilerplates/jest) package testing framework with a baseline for ideas on how to setup a baseline with protractor.

Baselines allow you to:
- Capture a snapshot of current accessibility issues
- Prevent new issues from being introduced
- Track progress in resolving accessibility issues over time

## Learn More

- [Protractor Documentation](https://www.protractortest.org/)
- [Angular Documentation](https://angular.io/docs)
- [Selenium WebDriver Documentation](https://www.selenium.dev/documentation/en/webdriver/)
- [IBM Equal Access Toolkit](https://www.ibm.com/able/toolkit)
- [Accessibility Checker GitHub](https://github.com/IBMa/equal-access)
