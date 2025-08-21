# Accessibility Checker Boilerplate: WebdriverIO

This boilerplate demonstrates how to integrate IBM's Accessibility Checker with [WebdriverIO](https://www.npmjs.com/package/webdriverio) for automated accessibility testing.

## Overview

This project provides a starting point for developers who want to include automated accessibility testing in their web applications using:

- **WebdriverIO**: A next-gen browser and mobile automation test framework for Node.js
- **TypeScript**: A strongly typed programming language that builds on JavaScript
- **Mocha**: A feature-rich JavaScript test framework running on Node.js
- **Accessibility Checker**: IBM's tool for automated accessibility testing

## What's Different from Standard WebdriverIO Setup

This boilerplate extends a standard [WebdriverIO](https://www.npmjs.com/package/webdriverio) setup with:

1. **Accessibility Checker Integration**: Imports and uses the `accessibility-checker` package to scan web pages for accessibility issues
2. **TypeScript Support**: Includes TypeScript configuration for better developer experience
3. **Page Object Pattern**: Demonstrates the page object pattern for better test organization
4. **Accessibility Configuration**: Includes an `achecker.js` configuration file that defines:
   - Rule archives to use
   - Policies to scan against
   - Violation levels that cause test failures
   - Report formats and locations

## Project Structure

- `test/specs/`: Test specification files using [WebdriverIO](https://www.npmjs.com/package/webdriverio) and [Mocha](https://www.npmjs.com/package/mocha)
- `test/pageobjects/`: Page object classes for better test organization
- `achecker.js`: Configuration for the accessibility checker
- `wdio.conf.ts`: [WebdriverIO](https://www.npmjs.com/package/webdriverio) configuration
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

The boilerplate demonstrates accessibility testing by:

1. Using [WebdriverIO](https://www.npmjs.com/package/webdriverio) to navigate to web pages
2. Implementing the page object pattern for better test organization
3. Using accessibility-checker to scan pages for accessibility issues
4. Logging accessibility compliance results

Key code snippet:

```typescript
import { getCompliance } from "accessibility-checker";

describe('My Login application', () => {
    it('should login with valid credentials', async () => {
        await LoginPage.open()
        console.log(await getCompliance(browser, "TEST"));
        // Rest of the test...
    })
})
```

## Learn More

- [WebdriverIO Documentation](https://webdriver.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Mocha Documentation](https://mochajs.org/)
- [IBM Equal Access Toolkit](https://www.ibm.com/able/toolkit)
- [Accessibility Checker GitHub](https://github.com/IBMa/equal-access)