# Accessibility Checker Boilerplate: Jest with Selenium WebDriver

This boilerplate demonstrates how to integrate IBM's Accessibility Checker with a Jest test framework using Selenium WebDriver for browser automation.

## Overview

This project provides a starting point for developers who want to include automated accessibility testing in their web applications using:

- **Jest**: A delightful JavaScript testing framework with a focus on simplicity
- **Selenium WebDriver**: A browser automation library that lets you control browsers programmatically
- **Accessibility Checker**: IBM's tool for automated accessibility testing

## What's Different from Standard Jest/Selenium Setup

This boilerplate extends a standard Jest and Selenium WebDriver setup with:

1. **Accessibility Checker Integration**: Imports and uses the `accessibility-checker` package to scan web pages for accessibility issues
2. **Custom Jest Matchers**: May include custom Jest matchers for accessibility testing
3. **Accessibility Configuration**: Includes an `achecker.js` configuration file that defines:
   - Rule archives to use
   - Policies to scan against
   - Violation levels that cause test failures
   - Report formats and locations

## Project Structure

- `test/`: Test files using Jest and Selenium WebDriver
- `sample/`: Sample web application for testing
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
4. Making assertions about accessibility compliance using Jest's assertion library

Key features include:

- Browser automation with Selenium WebDriver
- Accessibility testing with IBM's accessibility-checker
- Jest's powerful testing framework for organizing and running tests
- Configurable accessibility policies and reporting

## Learn More

- [Jest Documentation](https://jestjs.io/)
- [Selenium WebDriver Documentation](https://www.selenium.dev/documentation/en/webdriver/)
- [IBM Equal Access Toolkit](https://www.ibm.com/able/toolkit)
- [Accessibility Checker GitHub](https://github.com/IBMa/equal-access)