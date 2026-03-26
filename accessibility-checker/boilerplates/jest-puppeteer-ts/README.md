# Accessibility Checker Boilerplate: Jest with Puppeteer and TypeScript

This boilerplate demonstrates how to integrate IBM's Accessibility Checker with a [Jest](https://www.npmjs.com/package/jest) test framework using [Puppeteer](https://www.npmjs.com/package/puppeteer) for browser automation and TypeScript for type safety.

## Overview

This project provides a starting point for developers who want to include automated accessibility testing in their web applications using:

- **Jest**: A delightful JavaScript testing framework with a focus on simplicity
- **Puppeteer**: A Node.js library that provides a high-level API to control Chrome/Chromium over the DevTools Protocol
- **TypeScript**: A strongly typed programming language that builds on JavaScript
- **Accessibility Checker**: IBM's tool for automated accessibility testing

## What's Different from Standard Jest/Puppeteer Setup

This boilerplate extends a standard [Jest](https://www.npmjs.com/package/jest) and [Puppeteer](https://www.npmjs.com/package/puppeteer) setup with:

1. **Accessibility Checker Integration**: Imports and uses the `accessibility-checker` package to scan web pages for accessibility issues
2. **TypeScript Support**: Includes TypeScript configuration and type definitions for better developer experience
3. **Custom Jest Matchers**: Provides custom [Jest](https://www.npmjs.com/package/jest) matchers for accessibility testing
4. **Accessibility Configuration**: Includes an `achecker.js` configuration file that defines:
   - Rule archives to use
   - Policies to scan against
   - Violation levels that cause test failures
   - Report formats and locations

## Project Structure

- `test-ts/`: TypeScript source files for tests
- `sample/`: Sample web application for testing
- `matchers/`: Custom [Jest](https://www.npmjs.com/package/jest) matchers for accessibility testing
- `achecker.js`: Configuration for the accessibility checker
- `tsconfig.json`: TypeScript configuration
- `package.json`: Project dependencies and scripts
- `setupAfterEnv.ts`: [Jest](https://www.npmjs.com/package/jest) setup file that configures the testing environment

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

1. Using [Puppeteer](https://www.npmjs.com/package/puppeteer) to load and interact with web pages
2. Leveraging Jest's testing framework for assertions and test organization
3. Integrating accessibility-checker to scan pages for accessibility issues
4. Using custom [Jest](https://www.npmjs.com/package/jest) matchers to make assertions about accessibility compliance

Key features include:

- TypeScript for improved code quality and developer experience
- Custom [Jest](https://www.npmjs.com/package/jest) matchers for more readable test assertions
- Configuration options for tailoring accessibility testing to your needs
- **Screen reader simulation testing** - Uses the experimental `getSimulation` API to verify screen reader output

## Screen Reader Simulation (Experimental)

> **⚠️ EXPERIMENTAL FEATURE**: The `getSimulation` API is experimental and subject to change. The output format and behavior may be modified in future releases.

This boilerplate demonstrates how to use the `getSimulation` method to test screen reader output. The method generates a simulation of how a screen reader would announce page elements, including:

- ARIA regions and landmarks
- Heading levels and text
- Interactive elements (links, buttons, form fields)
- Image alternative text
- Keyboard focus announcements

Example usage from `test-ts/basic.test.ts`:

```typescript
import { getSimulation } from "accessibility-checker";

test('SR simulation has not regressed', async() => {
    const simulation = await getSimulation(page, 'test_name');
    expect(simulation).toEqual([
        { "region": "", "heading": "", "item": "[Start of document: ...]", ... },
        // ... more simulation output
    ]);
})
```

This allows you to create regression tests that ensure the screen reader experience remains consistent across code changes.

## Learn More

- [Jest Documentation](https://jestjs.io/)
- [Puppeteer Documentation](https://pptr.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [IBM Equal Access Toolkit](https://www.ibm.com/able/toolkit)
- [Accessibility Checker GitHub](https://github.com/IBMa/equal-access)