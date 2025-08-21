# Accessibility Checker Boilerplates

In this folder are a series of boilerplates created as "Hello World" examples for different testing frameworks.
By using a boilerplate, developers can focus on the unique aspects of their project rather than building automated accessibility testing from scratch.

## Overview of Boilerplates

Each boilerplate demonstrates how to integrate IBM's Accessibility Checker with a specific testing framework or approach. Below is a summary of the available boilerplates:

### Browser Automation Frameworks

- **[mocha-puppeteer-ts](mocha-puppeteer-ts)**: Combines [Mocha](https://www.npmjs.com/package/mocha) testing framework with [Puppeteer](https://www.npmjs.com/package/puppeteer) for browser automation, using TypeScript for type safety. Ideal for developers who prefer Mocha's testing style with modern browser automation.

- **[jest-puppeteer-ts](jest-puppeteer-ts)**: Integrates [Jest](https://www.npmjs.com/package/jest) testing framework with [Puppeteer](https://www.npmjs.com/package/puppeteer) for browser automation, using TypeScript. Great for teams already using [Jest](https://www.npmjs.com/package/jest) who want to add accessibility testing.

- **[mocha-selenium](mocha-selenium)**: Uses [Mocha](https://www.npmjs.com/package/mocha) with [Selenium WebDriver](https://www.npmjs.com/package/selenium-webdriver) for cross-browser testing. Suitable for projects requiring testing across multiple browser environments.

- **[jest-selenium](jest-selenium)**: Combines [Jest](https://www.npmjs.com/package/jest) with [Selenium WebDriver](https://www.npmjs.com/package/selenium-webdriver). Good for teams using [Jest](https://www.npmjs.com/package/jest) who need cross-browser accessibility testing.

### Specialized Testing Frameworks

- **[protractor](protractor)**: Specifically designed for Angular and AngularJS applications. Uses Protractor's specialized features for testing Angular applications.

- **[webdriverio](webdriverio)**: Implements accessibility testing with [WebdriverIO](https://www.npmjs.com/package/webdriverio), a next-gen browser and mobile automation test framework. Excellent for projects requiring mobile testing capabilities.

- **[cucumber-selenium](cucumber-selenium)**: Integrates Cucumber's behavior-driven development (BDD) approach with [Selenium WebDriver](https://www.npmjs.com/package/selenium-webdriver). Ideal for teams using BDD methodologies.

### React and Component Testing

- **[jest-customRS](jest-customRS)**: Demonstrates using [Jest](https://www.npmjs.com/package/jest) with a custom ruleset for testing React components, including Carbon Design System components. Shows how to create custom accessibility rulesets.

### Basic Testing

- **[jest](jest)**: A simple implementation using [Jest](https://www.npmjs.com/package/jest) without browser automation. Good starting point for basic accessibility testing.

- **[batch-scan](batch-scan)**: Focuses on scanning a set of local HTML files without a browser. Useful for static site testing or CI/CD pipelines.

## Related Boilerplates in Other Packages

IBM's Equal Access initiative includes additional boilerplates in separate packages:

### Cypress Testing Framework

The [cypress-accessibility-checker](https://github.com/IBMa/equal-access/tree/master/cypress-accessibility-checker/boilerplates) package includes a boilerplate for:

- Using [Cypress](https://www.npmjs.com/package/cypress) E2E testing framework with accessibility-checker for modern web application testing

### Java Testing Frameworks

The [java-accessibility-checker](https://github.com/IBMa/equal-access/tree/master/java-accessibility-checker/boilerplates) package includes boilerplates for:

- **JUnit with Selenium**: Using Java's JUnit framework with [Selenium WebDriver](https://www.selenium.dev/documentation/webdriver/)
- **JUnit with Playwright**: Using Java's JUnit framework with [Playwright](https://playwright.dev/)

## Choosing the Right Boilerplate

When selecting a boilerplate, consider:

1. **Existing Framework**: Choose a boilerplate that aligns with your current testing framework ([Jest](https://www.npmjs.com/package/jest), [Mocha](https://www.npmjs.com/package/mocha), [Cypress](https://www.npmjs.com/package/cypress), JUnit, etc.)
2. **Browser Automation Needs**: Select based on your preferred browser automation tool ([Puppeteer](https://www.npmjs.com/package/puppeteer), [Selenium](https://www.npmjs.com/package/selenium-webdriver), [Playwright](https://www.npmjs.com/package/playwright), etc.)
3. **Application Type**: Consider specialized boilerplates for specific application types (Angular, React, etc.)
4. **Language Preference**: Some boilerplates use TypeScript or Java for better type safety
5. **Platform Requirements**: Consider whether you need JavaScript/Node.js or Java-based testing

## Common Features Across Boilerplates

All boilerplates demonstrate:

- Integration with IBM's accessibility-checker library
- Configuration options via achecker.js or similar configuration
- Reporting of accessibility violations
- Testing at different application states
- Baseline comparison capabilities

## Baselines

Baselines are a helpful feature of `accessibility-checker` that can be used in the test environment. The concept involves capturing a scan result as a _baseline_ so that future scans will pass if they match the _baseline_. If they differ, then the test will fail.
Many boilerplate examples above include _baselines_.
This feature is useful for issues that have been determined to be of the following:

- False positives determined to be ignored
- `Needs review` issues resolved
- Issues scheduled to be fixed later
- New regression issues captured

See the [Baseline basics in the Wiki](https://github.com/IBMa/equal-access/wiki#baseline-basics) for an overview.

## Getting Started

Each boilerplate contains its own README.md with specific instructions. In general, you can:

1. Navigate to the boilerplate directory
2. Install dependencies with `npm install` or appropriate build tool command
3. Run the example tests with `npm test` or appropriate test command
4. Explore the code to understand how accessibility testing is implemented

## Learn More

- [IBM Equal Access Toolkit](https://www.ibm.com/able/toolkit)
- [Accessibility Checker GitHub](https://github.com/IBMa/equal-access)
- [Accessibility Checker NPM Package](https://www.npmjs.com/package/accessibility-checker)
