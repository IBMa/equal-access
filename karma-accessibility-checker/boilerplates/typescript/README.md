# Accessibility Checker Boilerplate: Karma with TypeScript

This boilerplate demonstrates how to integrate IBM's Accessibility Checker with the Karma test runner using TypeScript for type safety and improved developer experience.

## Overview

This project provides a starting point for developers who want to include automated accessibility testing in their TypeScript web applications using:

- **Karma**: A test runner that allows you to execute JavaScript code in multiple real browsers
- **Mocha**: A feature-rich JavaScript test framework running on Node.js
- **TypeScript**: A strongly typed programming language that builds on JavaScript
- **karma-accessibility-checker**: A Karma plugin for IBM's Accessibility Checker

## What's Different from Standard Karma Setup

This boilerplate extends a standard Karma setup with:

1. **TypeScript Support**: Includes TypeScript configuration and type definitions
2. **Accessibility Checker Integration**: Configures Karma to use the `karma-accessibility-checker` plugin
3. **Promise-based API**: Uses the promise-based API of accessibility-checker for cleaner async code
4. **Type Declarations**: Includes TypeScript type declarations for better developer experience
5. **Accessibility Configuration**: Includes an `achecker.js` configuration file that defines:
   - Rule archives to use
   - Policies to scan against
   - Violation levels that cause test failures
   - Report formats and locations

## Project Structure

- `test/`: TypeScript test files using Mocha and expect.js
- `src/`: Source HTML files to be tested
- `achecker.js`: Configuration for the accessibility checker
- `karma.conf.js`: Karma configuration
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

1. Using Karma to load HTML files into a browser environment
2. Using the html2js preprocessor to make HTML content available to tests
3. Using the aChecker framework to scan the HTML content for accessibility issues
4. Using TypeScript for improved code quality and developer experience
5. Using promises for cleaner asynchronous code

Key code snippet:

```typescript
// Perform the accessibility scan using the AAT.getCompliance API
return aChecker.getCompliance(testDataFileContent, testFile).then(({ report }: any) => {
    // Call the aChecker.assertCompliance API which is used to compare the results with baseline object
    let assertResult = aChecker.assertCompliance(report);

    // In the case that the violationData is not defined then trigger an error right away.
    expect(assertResult).to.be(0);
});
```

## TypeScript Benefits

Using TypeScript in this boilerplate provides several advantages:

1. **Type Safety**: Catch errors at compile time rather than runtime
2. **Better IDE Support**: Get code completion, navigation, and refactoring tools
3. **Self-Documenting Code**: Types serve as documentation for your code
4. **Improved Maintainability**: Easier to refactor and maintain as your project grows

## Learn More

- [Karma Documentation](https://karma-runner.github.io/)
- [Mocha Documentation](https://mochajs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [IBM Equal Access Toolkit](https://www.ibm.com/able/toolkit)
- [Accessibility Checker GitHub](https://github.com/IBMa/equal-access)
- [karma-accessibility-checker NPM Package](https://www.npmjs.com/package/karma-accessibility-checker)