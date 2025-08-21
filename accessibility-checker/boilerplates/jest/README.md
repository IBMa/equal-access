# Accessibility Checker Boilerplate: Jest

This boilerplate demonstrates how to integrate IBM's Accessibility Checker with [Jest](https://www.npmjs.com/package/jest) for automated accessibility testing of web content.

## Overview

This project provides a starting point for developers who want to include automated accessibility testing in their web applications using:

- **Jest**: A delightful JavaScript testing framework with a focus on simplicity
- **JSDOM**: A JavaScript implementation of the DOM for use with Node.js
- **Accessibility Checker**: IBM's tool for automated accessibility testing

## What's Different from Standard Jest Setup

This boilerplate extends a standard Jest setup with:

1. **Custom Matcher**: Adds a `toBeAccessible()` matcher for easy accessibility testing
2. **Baseline Support**: Demonstrates how to use baselines to track accessibility issues over time
3. **Jest Configuration**: Configures [Jest](https://www.npmjs.com/package/jest) to use the custom matcher and handle accessibility testing
4. **Accessibility Configuration**: Includes an `achecker.js` configuration file that defines:
   - Rule archives to use
   - Policies to scan against
   - Violation levels that cause test failures
   - Report formats and locations

## Project Structure

- `test/`: Test files using [Jest](https://www.npmjs.com/package/jest) and the custom accessibility matcher
- `matchers/`: Custom [Jest](https://www.npmjs.com/package/jest) matchers for accessibility testing
- `baselines/`: Baseline files for comparison
- `achecker.js`: Configuration for the accessibility checker
- `jest.config.js`: [Jest](https://www.npmjs.com/package/jest) configuration
- `setupAfterEnv.js`: [Jest](https://www.npmjs.com/package/jest) setup file that configures the testing environment
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

1. Using JSDOM to create a virtual DOM environment
2. Creating HTML content directly in the tests
3. Using the custom `toBeAccessible()` matcher to test for accessibility issues
4. Comparing results against baselines (if available)

## Baseline Basics

We have two tests - one referencing a baseline (stored at `baselines/IMG_BASELINE.json`) and one that does not.

A scan was run previously that detected an issue. That scan was saved as a baseline. The checker will ignore issues stored in the baseline. This feature allows a team to snapshot where they're at to prevent new issues from being introduced. This also allows a team to fail on potential violations, but then store items in the baseline that they've assessed and determined were being addressed in some way.

When you `npm install` and `npm test` in this folder, you should expect to see one test fail and one test pass.

At the time of this commit, if you look at the results for `Image missing alt without Baseline` you will see a failure including:

```
 - Message: The image has neither an accessible name nor is marked as decorative or redundant
      Level: violation
      XPath: /html[1]/body[1]/div[1]/img[1]
      Snippet: <img src="hello.png">
      Help: https://able.ibm.com/rules/archives/2024.06.17/doc/en-US/img_alt_valid.html#%7B%22message%22%3A%22The%20image%20has%20neither%20an%20accessible%20name%20nor%20is%20marked%20as%20decorative%20or%20redundant%22%2C%22snippet%22%3A%22%3Cimg%20src%3D%5C%22hello.png%5C%22%3E%22%2C%22value%22%3A%5B%22VIOLATION%22%2C%22FAIL%22%5D%2C%22reasonId%22%3A%22fail_no_alt%22%2C%22ruleId%22%3A%22img_alt_valid%22%2C%22msgArgs%22%3A%5B%5D%7D
```

We can then add to the `document.body.innerHTML` in that test, following the linked `help` above, to remove the violation. In this example, a simple way is to add an appropriate `alt` attribute.

## Custom Matcher

The boilerplate includes a custom [Jest](https://www.npmjs.com/package/jest) matcher `toBeAccessible()` that makes it easy to test for accessibility issues:

```javascript
// Test with baseline
await expect(document).toBeAccessible("IMG_BASELINE")

// Test without baseline
await expect(document).toBeAccessible("IMG_NO_BASELINE")
```

The matcher:
1. Uses accessibility-checker to scan the provided DOM node
2. Compares the results against a baseline (if provided)
3. Passes if no violations are found or if they match the baseline
4. Fails with detailed information about violations if they exist

## Configuration Options

The `achecker.js` file contains various configuration options:

- `ruleArchive`: Specifies which version of accessibility rules to use
- `policies`: Defines which accessibility policies to check against (e.g., IBM_Accessibility)
- `failLevels`: Determines which severity levels cause a test to fail
- `reportLevels`: Controls which issues are included in reports
- `outputFormat`: Specifies the format for results (JSON, CSV, etc.)
- `baselineFolder`: Specifies where baseline files are stored

## Learn More

- [Jest Documentation](https://jestjs.io/)
- [IBM Equal Access Toolkit](https://www.ibm.com/able/toolkit)
- [Accessibility Checker GitHub](https://github.com/IBMa/equal-access)
- [Accessibility Checker NPM Package](https://www.npmjs.com/package/accessibility-checker)
