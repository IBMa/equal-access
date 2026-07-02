# vitest-accessibility-checker

Automated accessibility testing plugin for Vitest that integrates IBM Equal Access Accessibility Checker.

To get started using the deployed package, download [vitest-accessibility-checker](https://www.npmjs.com/package/vitest-accessibility-checker) from NPM.

This package is a supporting component of the [IBM Equal Access Toolkit](https://ibm.com/able/toolkit).
The Toolkit provides the tools and guidance to create experiences that are delightful for people of all abilities.
The guidance is organized by phase, such as Plan, Design, Develop, and Verify, and explains the need to integrate automated testing into the [Verify phase](https://www.ibm.com/able/toolkit/verify/overview).
The Toolkit is a major part of the accessibility information and applications at [ibm.com/able](https://ibm.com/able/).

See the [Packages for test automation](https://github.com/IBMa/equal-access/wiki#packages-for-test-automation) in the Wiki for an overview.

## Features

- Integrate accessibility testing with Vitest's browser mode
- Test React components directly with vitest-browser-react
- Run tests in real browsers via Playwright
- Custom Vitest matchers for clean test syntax
- Output scan results in JSON, CSV, HTML, or XLSX formats
- Validate test results against baselines
- Set a target rule archive
- Configure policies (rule sets) to scan
- Set violation levels that trigger test failures
- Set violation levels that should be reported

## Usage

Review the [Usage Documentation](https://github.com/IBMa/equal-access/tree/master/vitest-accessibility-checker/src/README.md) for detailed usage instructions and API reference.

## Boilerplate

Review the [Boilerplate Example](https://github.com/IBMa/equal-access/tree/master/vitest-accessibility-checker/boilerplates/vitest) for a complete example project demonstrating:

- Vitest configuration with accessibility checker plugin
- React component testing with vitest-browser-react
- Custom matcher setup
- Baseline testing
- Configuration options

## Baselines

Baselines are a helpful feature of `vitest-accessibility-checker` that can be used in the test environment. The concept involves capturing a scan result as a _baseline_ so that future scans will pass if they match the baseline. If they differ, then the test will fail.

This feature is useful for issues that have been determined to be of the following:

- false positives determined to be ignored
- `Needs review` issues resolved
- issues scheduled to be fixed later
- new regression issues captured

See the [Baseline basics in the Wiki](https://github.com/IBMa/equal-access/wiki#baseline-basics) for an overview.

## Architecture

The vitest-accessibility-checker follows the Cypress pattern where the accessibility engine runs in the browser context:

### Browser Context
- **ACBrowserHelper.js**: Runs accessibility scans using the ace engine in the browser
- **commands.js**: Provides browser-side API functions (getCompliance, assertCompliance, etc.)
- **setup.js**: Loads the ace engine and helper into the browser before tests run

### Node.js Context
- **plugin.js**: Vitest plugin that sets up the HTTP server and injects browser scripts
- **ACTasks.js**: Handles HTTP requests from browser and processes results using ReporterManager
- **ReporterManager**: Generates reports, compares with baselines, and writes output files

### Communication
Browser and Node.js communicate via HTTP requests to `/__accessibility-checker-task__` endpoint.

## Building and running locally

### Requirements

- [Node Version 22](https://nodejs.org/en/download/)

### Install

```bash
$ npm install
```

### Build & Package

```bash
$ npm install
$ npm run build:common
$ npm run package
```

### Test

```bash
$ npm test
```

Run tests in the test directory:
```bash
$ cd test
$ npm install
$ npx vitest run
```

Run boilerplate tests:
```bash
$ cd boilerplates/vitest
$ npm install
$ npm run test:browser
```

## Known issues and workarounds

1. **Browser not found error**: If you see "Executable doesn't exist" errors, install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

2. **Content Security Policy**: If your site has a CSP, the engine script may be prevented from loading. You can configure a different rule server via your config file (e.g., `ruleServer: "https://able.ibm.com/rules"`).

3. **Port conflicts**: The plugin uses an HTTP server for browser-Node communication. If you encounter port conflicts, the server will automatically try the next available port.

## Feedback and reporting bugs

If you think you've found a bug, have questions or suggestions, open a [GitHub Issue](https://github.com/IBMa/equal-access/issues/new/choose), tagged with `vitest-accessibility-checker`.

If you are an IBM employee, feel free to ask questions in the IBM internal Slack channel `#accessibility-at-ibm`.

## License

[![IBM Equal Access Toolkit is released under the Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)