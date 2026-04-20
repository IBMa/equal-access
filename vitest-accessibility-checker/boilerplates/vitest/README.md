# Accessibility Checker Boilerplate: Vitest with React

This boilerplate demonstrates how to integrate IBM's Accessibility Checker with [Vitest](https://vitest.dev/) using Vitest's browser mode with React components.

## Overview

This project provides a starting point for developers who want to include automated accessibility testing in their React applications using:

- **Vitest**: A blazing fast unit test framework powered by Vite
- **Vitest Browser Mode**: Run tests in a real browser environment using Playwright
- **React**: A JavaScript library for building user interfaces
- **vitest-browser-react**: React testing utilities for Vitest browser mode
- **Accessibility Checker**: IBM's tool for automated accessibility testing

## What's Different from Standard Vitest Setup

This boilerplate extends a standard [Vitest](https://vitest.dev/) setup with:

1. **Accessibility Checker Integration**: Imports and uses the `vitest-accessibility-checker` package to scan React components for accessibility issues
2. **Browser Mode Testing**: Uses Vitest's browser mode with Playwright to test in a real browser environment
3. **Custom Vitest Matchers**: Provides custom Vitest matchers for accessibility testing (`toBeAccessible`)
4. **Accessibility Configuration**: Includes an `achecker.js` configuration file that defines:
   - Rule archives to use
   - Policies to scan against
   - Violation levels that cause test failures
   - Report formats and locations

## Project Structure

- `src/`: React application source files
  - `App.jsx`: Sample React component
  - `App.test.jsx`: Accessibility tests for the component
- `achecker.js`: Configuration for the accessibility checker
- `setupMatchers.js`: Vitest setup file that registers custom matchers
- `vitest.browser.config.js`: Vitest configuration for browser mode testing
- `vite.config.js`: Vite configuration for development
- `package.json`: Project dependencies and scripts

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install Playwright browsers** (if not already installed):
   ```bash
   npx playwright install chromium
   ```

3. **Run the tests**:
   ```bash
   npm run test:browser
   ```

4. **Run the development server** (optional):
   ```bash
   npm run dev
   ```

## How It Works

The boilerplate demonstrates accessibility testing by:

1. Using Vitest's browser mode to render React components in a real browser
2. Leveraging `vitest-browser-react` for React component rendering
3. Integrating `vitest-accessibility-checker` to scan rendered components for accessibility issues
4. Using custom Vitest matchers to make assertions about accessibility compliance

Key features include:

- **Real browser testing**: Tests run in Chromium via Playwright, ensuring accurate results
- **React component testing**: Direct rendering of React components without a separate server
- **Custom Vitest matchers**: More readable test assertions with `toBeAccessible()`
- **Configuration options**: Tailor accessibility testing to your needs via `achecker.js`
- **Baseline support**: Compare results against baseline files to track changes over time

## Writing Accessibility Tests

### Basic Usage

```javascript
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import MyComponent from './MyComponent.jsx'

test('component is accessible', async () => {
  await render(<MyComponent />)
  
  // Check accessibility using custom matcher
  await expect(document.body).toBeAccessible('MyComponent');
})
```

### Using the Custom Matcher

The `toBeAccessible()` matcher is provided by `vitest-accessibility-checker` and automatically:

- Scans the specified element for accessibility issues
- Compares results against baseline files (if they exist)
- Fails the test if violations are found (based on `achecker.js` configuration)
- Generates detailed reports in the `results/` folder

The matcher accepts an optional label parameter:
```javascript
await expect(element).toBeAccessible('custom-label');
```

If no label is provided, it uses the test name.

## Configuration

### achecker.js

The `achecker.js` file controls how accessibility testing behaves:

```javascript
module.exports = {
  // Rule archive version to use
  ruleArchive: 'latest',
  
  // Policies to test against
  policies: ["IBM_Accessibility"],
  
  // Violation levels that cause test failures
  failLevels: ["violation"],
  
  // Violation levels to include in reports
  reportLevels: [
    "violation",
    "potentialviolation",
    "recommendation",
    "potentialrecommendation",
    "manual"
  ],
  
  // Output format for reports
  outputFormat: ["json"],
  
  // Where to save scan results
  outputFolder: "results",
  
  // Where to load baseline files from
  baselineFolder: "baselines"
}
```

Run `npx aat archives` to see available rule archives and policies.

### vitest.browser.config.js

The Vitest configuration enables browser mode testing:

```javascript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { accessibilityCheckerPlugin } from 'vitest-accessibility-checker'

export default defineConfig({
  plugins: [
    react(),
    accessibilityCheckerPlugin()
  ],
  test: {
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright'
    },
    setupFiles: ['./setupMatchers.js']
  }
})
```

## Baseline Testing

Baseline files allow you to track accessibility issues over time:

1. **First run**: Tests will pass and generate baseline files in `baselines/`
2. **Subsequent runs**: Results are compared against baselines
3. **Changes detected**: Tests fail if new violations appear or existing ones change

To update baselines after intentional changes, delete the baseline files and re-run tests.

## Reports

After running tests, detailed reports are generated in the `results/` folder:

- **JSON format**: Machine-readable results for CI/CD integration
- **Detailed information**: Each violation includes:
  - Rule ID and description
  - Element location (XPath)
  - Severity level
  - Help text and links to documentation

## Learn More

- [Vitest Documentation](https://vitest.dev/)
- [Vitest Browser Mode](https://vitest.dev/guide/browser.html)
- [React Documentation](https://react.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [IBM Equal Access Toolkit](https://www.ibm.com/able/toolkit)
- [Accessibility Checker GitHub](https://github.com/IBMa/equal-access)

## Troubleshooting

### Browser not found
If you see "Executable doesn't exist" errors, install Playwright browsers:
```bash
npx playwright install chromium
```

### Tests timing out
Increase the test timeout in `vitest.browser.config.js`:
```javascript
test: {
  testTimeout: 30000 // 30 seconds
}
```

### Port conflicts
If port 5173 is in use, Vite will automatically try the next available port.