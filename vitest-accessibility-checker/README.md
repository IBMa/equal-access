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
import { getCompliance, assertCompliance } from 'vitest-accessibility-checker'
import MyComponent from './MyComponent'

test('component is accessible', async () => {
  const { container } = await render(<MyComponent />)
  
  // Get compliance report
  const report = await getCompliance(container, 'MyComponent')
  
  // Check for violations
  const violations = report.results.filter(r => r.level === 'violation')
  expect(violations).toHaveLength(0)
})

test('component passes accessibility check', async () => {
  const { container } = await render(<MyComponent />)
  
  // Assert no violations (throws if violations found)
  await assertCompliance(container, 'MyComponent')
})
```

## API

### `getCompliance(content, label)`

Scans the provided content and returns a compliance report.

- **content**: DOM element or document to scan
- **label**: String label for this scan
- **Returns**: Promise<Report> - Accessibility report

### `assertCompliance(content, label)`

Scans content and throws an error if violations are found.

- **content**: DOM element or document to scan
- **label**: String label for this scan
- **Throws**: Error if violations found

### `getComplianceHelper(content, label)`

Returns enhanced report with categorized results.

- **content**: DOM element or document to scan
- **label**: String label for this scan
- **Returns**: Promise<Object> - Enhanced report with violations, recommendations, etc.

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