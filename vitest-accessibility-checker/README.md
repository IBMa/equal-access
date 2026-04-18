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

### 2. Setup Custom Matcher (Optional)

Create a setup file to extend Vitest's expect with accessibility matchers:

```javascript
// setupMatchers.js
import { expect } from 'vitest'
import { toBeAccessible } from 'vitest-accessibility-checker'

expect.extend({
  toBeAccessible
})
```

Add it to your vitest config:

```javascript
export default defineConfig({
  test: {
    setupFiles: ['./setupMatchers.js'],
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright'
    }
  }
})
```

### 3. Write Tests

#### Using Custom Matcher

```javascript
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import MyComponent from './MyComponent'

test('component is accessible', async () => {
  const { container } = await render(<MyComponent />)
  
  // Use custom matcher
  await expect(container).toBeAccessible('MyComponent')
})
```

#### Using Direct API

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

#### Testing with Inline HTML

You can also test accessibility by rendering HTML directly:

```javascript
import { expect, test } from 'vitest'
import { getCompliance } from 'vitest-accessibility-checker'

test('page structure is accessible', async () => {
  // Render HTML directly in the document
  document.body.innerHTML = `
    <main>
      <h1>Page Title</h1>
      <img src="test.jpg" alt="Description" />
      <button>Click me</button>
    </main>
  `
  
  const report = await getCompliance(document.body, 'page-structure')
  expect(report.results).toHaveLength(0)
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