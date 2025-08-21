# Accessibility Checker Boilerplate: Mocha with Puppeteer and TypeScript

This boilerplate demonstrates how to integrate IBM's Accessibility Checker with a [Mocha](https://www.npmjs.com/package/mocha) test framework using [Puppeteer](https://www.npmjs.com/package/puppeteer) for browser automation and TypeScript for type safety.

## Overview

This project provides a starting point for developers who want to include automated accessibility testing in their web applications using:

- **Mocha**: A feature-rich JavaScript test framework running on Node.js
- **Puppeteer**: A Node.js library that provides a high-level API to control Chrome/Chromium over the DevTools Protocol
- **TypeScript**: A strongly typed programming language that builds on JavaScript
- **Accessibility Checker**: IBM's tool for automated accessibility testing

## What's Different from Standard Mocha/Puppeteer Setup

This boilerplate extends a standard [Mocha](https://www.npmjs.com/package/mocha) and [Puppeteer](https://www.npmjs.com/package/puppeteer) setup with:

1. **Accessibility Checker Integration**: Imports and uses the `accessibility-checker` package to scan web pages for accessibility issues
2. **TypeScript Support**: Includes TypeScript configuration and type definitions for better developer experience
3. **Accessibility Configuration**: Includes an `achecker.js` configuration file that defines:
   - Rule archives to use
   - Policies to scan against
   - Violation levels that cause test failures
   - Report formats and locations
4. **Accessibility Testing Patterns**: Demonstrates how to:
   - Perform accessibility scans at different states of a web application
   - Assert compliance with accessibility standards
   - Generate detailed reports of accessibility issues

## Project Structure

- `test-ts/`: TypeScript source files for tests
- `test/`: Compiled JavaScript test files
- `sample/`: Sample web application for testing
- `achecker.js`: Configuration for the accessibility checker
- `tsconfig.json`: TypeScript configuration
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

The boilerplate demonstrates accessibility testing in two scenarios:

1. **Initial Page Load**: Tests the accessibility of the page when it first loads
2. **After User Interaction**: Tests the accessibility after clicking an element that shows additional content

Key code snippets from the tests:

```typescript
// Import accessibility-checker
import { assertCompliance, getCompliance, stringifyResults } from "accessibility-checker";

// Perform accessibility scan
const result = await getCompliance(page, "HOME");
const report: ICheckerReport = result!.report as ICheckerReport;

// Assert compliance and provide detailed report if there are violations
expect(assertCompliance(report)).to.equal(0, stringifyResults(report));
```

## Configuration Options

The `achecker.js` file contains various configuration options:

- `ruleArchive`: Specifies which version of accessibility rules to use
- `policies`: Defines which accessibility policies to check against (e.g., IBM_Accessibility)
- `failLevels`: Determines which severity levels cause a test to fail
- `reportLevels`: Controls which issues are included in reports
- `outputFormat`: Specifies the format for results (JSON, CSV, etc.)

## Learn More

- [Mocha Documentation](https://mochajs.org/)
- [Puppeteer Documentation](https://pptr.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [IBM Equal Access Toolkit](https://www.ibm.com/able/toolkit)
- [Accessibility Checker GitHub](https://github.com/IBMa/equal-access)