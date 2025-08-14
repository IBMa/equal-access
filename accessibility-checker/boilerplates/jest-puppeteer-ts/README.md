# Accessibility Checker Boilerplate: Jest with Puppeteer and TypeScript

This boilerplate demonstrates how to integrate IBM's Accessibility Checker with a Jest test framework using Puppeteer for browser automation and TypeScript for type safety.

## Overview

This project provides a starting point for developers who want to include automated accessibility testing in their web applications using:

- **Jest**: A delightful JavaScript testing framework with a focus on simplicity
- **Puppeteer**: A Node.js library that provides a high-level API to control Chrome/Chromium over the DevTools Protocol
- **TypeScript**: A strongly typed programming language that builds on JavaScript
- **Accessibility Checker**: IBM's tool for automated accessibility testing

## What's Different from Standard Jest/Puppeteer Setup

This boilerplate extends a standard Jest and Puppeteer setup with:

1. **Accessibility Checker Integration**: Imports and uses the `accessibility-checker` package to scan web pages for accessibility issues
2. **TypeScript Support**: Includes TypeScript configuration and type definitions for better developer experience
3. **Custom Jest Matchers**: Provides custom Jest matchers for accessibility testing
4. **Accessibility Configuration**: Includes an `achecker.js` configuration file that defines:
   - Rule archives to use
   - Policies to scan against
   - Violation levels that cause test failures
   - Report formats and locations

## Project Structure

- `test-ts/`: TypeScript source files for tests
- `sample/`: Sample web application for testing
- `matchers/`: Custom Jest matchers for accessibility testing
- `achecker.js`: Configuration for the accessibility checker
- `tsconfig.json`: TypeScript configuration
- `package.json`: Project dependencies and scripts
- `setupAfterEnv.ts`: Jest setup file that configures the testing environment

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

1. Using Puppeteer to load and interact with web pages
2. Leveraging Jest's testing framework for assertions and test organization
3. Integrating accessibility-checker to scan pages for accessibility issues
4. Using custom Jest matchers to make assertions about accessibility compliance

Key features include:

- TypeScript for improved code quality and developer experience
- Custom Jest matchers for more readable test assertions
- Configuration options for tailoring accessibility testing to your needs

## Learn More

- [Jest Documentation](https://jestjs.io/)
- [Puppeteer Documentation](https://pptr.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [IBM Equal Access Toolkit](https://www.ibm.com/able/toolkit)
- [Accessibility Checker GitHub](https://github.com/IBMa/equal-access)