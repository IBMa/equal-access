# accessibility-checker NODE

Automated accessibility testing for Node-based test environments.

To get started using the deployed packages, download the [Node accessibility-checker](https://www.npmjs.com/package/accessibility-checker) from NPM.

This package is a supporting component of the [IBM Equal Access Toolkit](https://ibm.com/able/toolkit).
The Toolkit provides the tools and guidance to create experiences that are delightful for people of all abilities.
The guidance is organized by phase, such as Plan, Design, Develop, and Verify, and explains the need to integrate automated testing into the [Verify phase](https://www.ibm.com/able/toolkit/verify/overview).
The Toolkit is a major part of the accessibility information and applications at [ibm.com/able](https://ibm.com/able/).

See the [Packages for test automation](https://github.com/IBMa/equal-access/wiki#packages-for-test-automation) in the Wiki for an overview.

## Features

- Scan single or multiple files, directories, or URLs
- Output scan results in JSON, CSV, HTML, or XLSX formats
- Automate accessibility testing within a continuous integration pipeline, such as Travis CI
- Integrate with Node-based test environments, such as Selenium, Puppeteer, Playwright, Jest, and Zombie
- Validate test results against baselines
- Set a target rule archive
- Configure policies (rule sets) to scan
- Set violation levels that trigger test failures
- Set violation levels that should be reported

## Command-line and multi-scan

This module provides some basic command-line utilities that will allow scanning files, directories, and URLs:

- Create a .txt file with path(s) to files, directories, or a list of URLs to be scanned
- Provide the `npx achecker` the full path of the .txt file to start the scan (e.g., `npx achecker path/to/your/file.txt`)
- Run `npx achecker`

Review the [accessibility-checker/src/README](src/README.md) for more information.

## Boilerplates

Review the [accessibility-checker/boilerplates/README](boilerplates/README.md) and see examples for the following:

- [batch-scan](boilerplates/batch-scan): scan a set of local files
- [cucumber-selenium](boilerplates/cucumber-selenium): Using [Cucumber](https://www.npmjs.com/package/cucumber) with [Selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver) browser automation
- [jest](boilerplates/jest): Using a [Jest](https://www.npmjs.com/package/jest) test environment
- [jest-customRS](boilerplates/jest-customRS): Using a [Jest](https://www.npmjs.com/package/jest) test environment
- [jest-puppeteer-ts](boilerplates/jest-puppeteer-ts): Using a [Jest](https://www.npmjs.com/package/jest) test environment with [Puppeteer](https://www.npmjs.com/package/puppeteer) controlled browser
- [jest-selenium](boilerplates/jest-selenium): Using a [Jest](https://www.npmjs.com/package/jest) test environment with [Selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver) browser automation
- [mocha-puppeteer-ts](boilerplates/mocha-puppeteer-ts): Using a [Mocha](https://www.npmjs.com/package/mocha) test environment with a [Puppeteer](https://www.npmjs.com/package/puppeteer) controlled browser, and Typescript
- [mocha-selenium](boilerplates/mocha-selenium): Using a [Mocha](https://www.npmjs.com/package/mocha) test environment with [Selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver) browser automation
- [protractor](boilerplates/protractor): Using a [Protractor](https://www.npmjs.com/package/protractor) test environment for Angular and AngularJS applications
- [webdriverio](boilerplates/webdriverio): Using a [Webdriverio](https://www.npmjs.com/package/webdriverio) browser and mobile test automation framework
- and others

## Baselines

Baselines are a helpful feature of `accessibility-checker` that can be used in the test environment. The concept involves capturing a scan result as a _baseline_ so that future scans will pass if they match the baseline. If they differ, then the test will fail. 
Many boilerplate examples above include _baselines_.
This feature is useful for issues that have been determined to be of the following:

- false positives determined to be ignored
- `Needs review` issues resolved
- issues scheduled to be fixed later
- new regression issues captured

See the [Baseline basics in the Wiki](https://github.com/IBMa/equal-access/wiki#baseline-basics) for an overview.

## Building and running locally

### Requirements

- [Node Version 18](https://nodejs.org/en/download/)

### Install

```bash
$ npm install
```

### Build & Package

```bash
$ npm install
$ npm run build
$ npm run package:zip  or  npm run package:npm
```

### Test

```bash
$ npm test
```

## Known issues and workarounds

1. If you see `TypeError: ace.Checker is not a constructor`: 
    - Try to run your tests serially using the configuration option in your framework. For example, use `--runInBand` in Jest framework. 

2. If your site has a `Content Security Policy`, the engine script may be
    prevented from loading. In the browser console, you'll see something like:
    > VM43:24 Refused to load the script ‘https://cdn.jsdelivr.net/npm/accessibility-checker-engine@3.1.42/ace.js’ because it violates the following Content Security Policy directive:

    If you would prefer not to add cdn.jsdelivr.net to the CSP, you can add able.ibm.com instead via your config file (e.g., ruleServer: "https://able.ibm.com/rules")

## Feedback and reporting bugs

If you think you've found a bug, have questions or suggestions, open a [GitHub Issue](https://github.com/IBMa/equal-access/issues/new/choose), tagged with `node-accessibility-checker`.

If you are an IBM employee, feel free to ask questions in the IBM internal Slack channel `#accessibility-at-ibm`.

## IBM Telemetry

This package uses IBM Telemetry to collect de-identified and anonymized metrics data. By installing this package as a dependency you are agreeing to telemetry collection. To opt out, see [Opting out of IBM Telemetry data collection](https://github.com/ibm-telemetry/telemetry-js/tree/main#opting-out-of-ibm-telemetry-data-collection). For more information on the data being collected, please see the [IBM Telemetry documentation](https://github.com/ibm-telemetry/telemetry-js/tree/main#ibm-telemetry-collection-basics).

## License

[![IBM Equal Access Toolkit is released under the Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
