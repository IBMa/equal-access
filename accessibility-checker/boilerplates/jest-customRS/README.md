# Accessibility Checker Boilerplate: Jest with Custom Ruleset

This boilerplate demonstrates how to integrate IBM's Accessibility Checker with a [Jest](https://www.npmjs.com/package/jest) test framework using a custom ruleset for React components.

## Overview

This project provides a starting point for developers who want to include automated accessibility testing in their React applications using:

- **Jest**: A delightful JavaScript testing framework with a focus on simplicity
- **React Testing Library**: A testing utility for React that encourages good testing practices
- **Carbon Components**: IBM's Carbon Design System React components
- **Accessibility Checker**: IBM's tool for automated accessibility testing with a custom ruleset

## What's Different from Standard Jest Setup

This boilerplate extends a standard [Jest](https://www.npmjs.com/package/jest) setup with:

1. **Accessibility Checker Integration**: Imports and uses the `accessibility-checker` package to scan React components for accessibility issues
2. **Custom Jest Matchers**: Provides a custom `toBeAccessible()` matcher for easy accessibility testing
3. **Custom Ruleset**: Demonstrates how to create and use a custom accessibility ruleset that ignores specific rules
4. **React Component Testing**: Shows how to test accessibility of React components, including Carbon Design System components
5. **Baseline Support**: Includes support for baseline comparison to track accessibility issues over time

## Project Structure

- `test/`: Test files using [Jest](https://www.npmjs.com/package/jest) and React Testing Library
- `sample/`: Sample components for testing
- `matchers/`: Custom [Jest](https://www.npmjs.com/package/jest) matchers for accessibility testing
- `@types/`: TypeScript type definitions
- `achecker.js`: Configuration for the accessibility checker
- `package.json`: Project dependencies and scripts
- `babel.config.js`: Babel configuration for transpiling React components
- `jest.config.js`: [Jest](https://www.npmjs.com/package/jest) configuration
- `setupAfterEnv.js`: [Jest](https://www.npmjs.com/package/jest) setup file that configures the testing environment

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

1. Using React Testing Library to render components
2. Using custom [Jest](https://www.npmjs.com/package/jest) matchers to test accessibility compliance
3. Creating a custom ruleset that ignores specific rules
4. Testing both simple HTML and complex React components

Key code snippets:

```javascript
// Custom matcher usage
await expect(document).toBeAccessible();
await expect(container).toBeAccessible();

// Custom ruleset creation
const customRuleset = JSON.parse(JSON.stringify(ruleset));
customRuleset.id = 'Custom_Ruleset';
customRuleset.checkpoints = customRuleset.checkpoints.map(checkpoint => {
  checkpoint.rules = checkpoint.rules.filter(
    rule => !ignorelist.includes(rule.id)
  );
  return checkpoint;
});
```

## Learn More

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Carbon Design System](https://www.carbondesignsystem.com/)
- [IBM Equal Access Toolkit](https://www.ibm.com/able/toolkit)
- [Accessibility Checker GitHub](https://github.com/IBMa/equal-access)