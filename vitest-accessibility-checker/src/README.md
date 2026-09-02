# vitest-accessibility-checker

**⚠️ Important: This package requires Vitest Browser Mode**

Accessibility testing plugin for Vitest that integrates IBM Equal Access Accessibility Checker. This package is designed specifically for [Vitest Browser Mode](https://vitest.dev/guide/browser/) and requires a real browser environment to run accessibility scans.

## Requirements

- **Vitest 2.0+** with [Browser Mode](https://vitest.dev/guide/browser/) enabled
- A browser provider (Playwright, WebdriverIO, or Puppeteer)
- Node.js 16 or higher

## Installation

```bash
npm install --save-dev vitest-accessibility-checker
```

### Optional: XLSX Report Format

If you want to generate reports in XLSX format, you need to install `exceljs` as an additional dependency:

```bash
npm install --save-dev exceljs
```

Without `exceljs` installed, all other report formats (JSON, HTML, CSV) will work normally, but XLSX format will be disabled with a warning message.

## Usage

### 1. Configure Vitest with Browser Mode

**Browser Mode is required.** Add the plugin to your `vitest.config.js` and ensure browser mode is enabled:

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

### 2. Setup Custom Matcher (Optional but Recommended)

Create a setup file to extend Vitest's expect with the `toBeAccessible` matcher:

```javascript
// setupMatchers.js
import { expect } from 'vitest'
import { toBeAccessible } from 'vitest-accessibility-checker/matchers'

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

#### Using the Custom Matcher (Recommended)

The `toBeAccessible` matcher provides the cleanest syntax:

```javascript
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import MyComponent from './MyComponent'

test('component is accessible', async () => {
  const { container } = await render(<MyComponent />)
  
  // Use the custom matcher - simple and clean!
  await expect(container).toBeAccessible('MyComponent')
})
```

#### Using Direct API Calls

You can also use the API functions directly:

```javascript
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import { getCompliance, assertCompliance } from 'vitest-accessibility-checker/commands'
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
  
  // Get report and assert compliance
  const report = await getCompliance(container, 'MyComponent')
  const rc = await assertCompliance(report)
  expect(rc).toBe(0)
})
```

#### Testing with Inline HTML

You can also test accessibility by rendering HTML directly:

```javascript
import { expect, test } from 'vitest'
import { getCompliance } from 'vitest-accessibility-checker/commands'

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

### Custom Matcher

#### `expect(element).toBeAccessible(label)`

Custom Vitest matcher that scans an element and asserts it has no accessibility violations.

- **element**: DOM element or document to scan
- **label**: String label for this scan
- **Throws**: Assertion error if violations found
- **Returns**: Promise<void>

**Example:**
```javascript
await expect(document.body).toBeAccessible('HomePage')
```

### Direct API Functions

All functions can be imported from `vitest-accessibility-checker/commands`:

#### `getCompliance(content, label)`

Scans the provided content and returns a compliance report.

- **content**: DOM element or document to scan
- **label**: String label for this scan
- **Returns**: Promise<Report> - Accessibility report with results array

**Example:**
```javascript
import { getCompliance } from 'vitest-accessibility-checker/commands'

const report = await getCompliance(document.body, 'MyPage')
console.log(report.results) // Array of accessibility issues
```

#### `assertCompliance(report)`

Checks a report and returns a status code based on violations and baseline comparison.

- **report**: Report object from getCompliance
- **Returns**: Promise<number> - 0 if passes, 1 if fails baseline, 2 if fails on failLevels

**Example:**
```javascript
import { getCompliance, assertCompliance } from 'vitest-accessibility-checker/commands'

const report = await getCompliance(document.body, 'MyPage')
const rc = await assertCompliance(report)
expect(rc).toBe(0) // Assert no violations
```

#### `getBaseline(label)`

Gets the baseline for a specific label.

- **label**: String label for the baseline
- **Returns**: Promise<Object> - Baseline data

#### `getDiffResults(label, actual)`

Gets diff results between current scan and baseline.

- **label**: String label for comparison
- **actual**: Current report object
- **Returns**: Promise<Array> - Array of diff objects with 'kind' property

#### `getConfig()`

Gets the current accessibility checker configuration.

- **Returns**: Promise<Object> - Configuration object

#### `stringifyResults(report)`

Converts a report to a formatted string for display.

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

If your project uses ES modules (`"type": "module"` in `package.json`), Node.js cannot load a CommonJS `achecker.js` file. Use an `achecker.mjs` file with a default export instead:

```js
// achecker.mjs
export default {
    ruleArchive: "latest",
    policies: ["IBM_Accessibility"],
    failLevels: ["violation"],
    reportLevels: [
        "violation",
        "potentialviolation",
        "recommendation",
        "potentialrecommendation",
        "manual",
    ],
    outputFolder: "results",
    outputFormat: ["json", "html"],
    label: "vitest-accessibility-tests"
};
```

## Reports

Reports are generated in the `results` folder (configurable) with:
- JSON reports for each scan
- HTML summary report
- Baseline comparison (if enabled)

## License

Apache-2.0 - See LICENSE in the equal-access repository