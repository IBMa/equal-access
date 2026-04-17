# vitest-accessibility-checker

Accessibility testing plugin for Vitest that integrates IBM Equal Access Accessibility Checker.

## Installation

```bash
npm install --save-dev vitest-accessibility-checker
```

## Usage

### 1. Configure Vitest

Add the plugin to your `vitest.config.js`:

```javascript
import { defineConfig } from 'vitest/config'
import { accessibilityCheckerPlugin } from 'vitest-accessibility-checker'

export default defineConfig({
  plugins: [
    accessibilityCheckerPlugin({
      // Optional configuration
      ruleArchive: "latest",
      policies: ["IBM_Accessibility"],
      failLevels: ["violation"],
      reportLevels: ["violation", "potentialviolation", "recommendation", "potentialrecommendation", "manual"]
    })
  ],
  test: {
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright'
    }
  }
})
```

### 2. Write Tests

Use the accessibility checker functions in your tests:

```javascript
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import MyComponent from './MyComponent'

test('component is accessible', async () => {
  const { container } = await render(<MyComponent />)
  
  // Get compliance report using window.aChecker
  const result = await window.aChecker.getCompliance(container, 'MyComponent')
  
  // Check for violations
  const violations = result.report.results.filter(r => r.level === 'violation')
  expect(violations).toHaveLength(0)
})

test('component passes accessibility check', async () => {
  const { container } = await render(<MyComponent />)
  
  // Assert no violations (throws if violations found)
  const result = await window.aChecker.getCompliance(container, 'MyComponent')
  window.aChecker.assertCompliance(result.report)
})
```

## API

All functions are available via `window.aChecker` in the browser context:

### `window.aChecker.getCompliance(content, label)`

Scans the provided content and returns a compliance report.

- **content**: DOM element or document to scan
- **label**: String label for this scan
- **Returns**: Promise<{report, iframe}> - Object containing the accessibility report

### `window.aChecker.assertCompliance(report)`

Checks a report and throws an error if violations are found based on failLevels configuration.

- **report**: Report object from getCompliance
- **Returns**: number - 0 if passes, 1 if fails baseline, 2 if fails on failLevels
- **Throws**: Error if violations found

### `window.aChecker.getBaseline(label)`

Gets the baseline for a specific label.

- **label**: String label for the baseline
- **Returns**: Object - Baseline data

### `window.aChecker.getDiffResults(label)`

Gets diff results between current and baseline for a label.

- **label**: String label for comparison
- **Returns**: Object - Diff results

### `window.aChecker.stringifyResults(report)`

Converts a report to a formatted string.

- **report**: Report object
- **Returns**: String - Formatted report string

## Configuration

Create an `.achecker.yml` or `achecker.js` file in your project root:

```yaml
# .achecker.yml
ruleArchive: latest
policies:
  - IBM_Accessibility
failLevels:
  - violation
reportLevels:
  - violation
  - potentialviolation
  - recommendation
  - potentialrecommendation
  - manual
outputFolder: results
outputFormat:
  - json
  - html
label: vitest-accessibility-tests
```

## Reports

Reports are generated in the `results` folder (configurable) with:
- JSON reports for each scan
- HTML summary report
- Baseline comparison (if enabled)

## License

Apache-2.0 - See LICENSE in the equal-access repository