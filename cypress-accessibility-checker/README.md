# cypress-accessibility-checker

Cypress plugin for automated accessibility testing.

The [Cypress-accessibility-checker](https://www.npmjs.com/package/cypress-accessibility-checker) is a wrapper of the `accessibility-checker` in the Cypress environment.
The deployed package can be downloaded and installed from NPM.

This plugin is a Cypress flavor of the NodeJS version of `accessibility-checker` which is also [available on NPM](https://www.npmjs.com/package/accessibility-checker).
The plugin works by injecting the automated accessibility-checker testing into [Cypress](https://docs.cypress.io/guides/overview/why-cypress), a next-generation front-end testing tool built for the modern web and scanning the page in context. 
Please see the `Usage` section below for more details.

This package is a supporting component of the [IBM Equal Access Toolkit](https://ibm.com/able/toolkit).
The Toolkit provides the tools and guidance to create experiences that are delightful for people of all abilities.
The guidance is organized by phase, such as Plan, Design, Develop, and Verify, and explains how to integrate this automated testing tool into the [Verify phase](https://www.ibm.com/able/toolkit/verify/overview).
The Toolkit is a major part of the accessibility information and applications at [ibm.com/able](https://ibm.com/able/).

## Requirements

* [Node Version 18](https://nodejs.org/en/download/)
* Cypress 13 from [cypress.io](https://www.cypress.io/)

## Installation

Install the package as a devDependency.

```bash
npm install cypress-accessibility-checker --save-dev
```

## Configuration

The configuration for the plugin is driven by a configuration file called `.achecker.yml` that you will need to put in the same directory as your `cypress.json` file. See details on the syntax of this file [here](https://github.com/IBMa/equal-access/blob/master/accessibility-checker/src/README.md#configuring-accessibility-checker).

## Setup Cypress

There are two setup steps you must complete in order for the Cypress tests to be able to use the commands.

### 1. Add plugin

In the Cypress config for your project, require the plugin and then register it with Cypress.

```js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
        on('task', {
            accessibilityChecker: require('cypress-accessibility-checker/plugin')
        });
    }
  }
})
```

### 2. Import commands

In the `cypress/support/e2e.js` file located in your project, add the following import statement. This will import the accessibility checker commands and register them with Cypress.

```js
import 'cypress-accessibility-checker';
```

If you do not want to include `cypress-accessibility-checker` globally, you may instead add this import statement to every test file in which it is used.

## Usage

The commands map directly to the description of the APIs located in the [accessibility-checker/src/README](https://github.com/IBMa/equal-access/blob/master/accessibility-checker/src/README.md). The names of the APIs within Cypress are just slightly different so they are globally unique in the Cypress namespace.

The typical use case will be to get the accessibility compliance of a document and then assert the accessibility compliance against the configuration that is defined as part of the `.achecker.yml` file and any baselines that are defined. An example of how this looks is below:

```bash
// Retrieves the compliance of the document then checks the results against the defined settings.
// If there are issues when compared to the defined settings, it will fail the Cypress test.
cy.getCompliance('my scan').assertCompliance()
```

Examples of how to use each of the APIs below can be found in the `achecker.cy.js` test file [located here](https://github.com/IBMa/equal-access/blob/master/cypress-accessibility-checker/test/cypress/e2e/achecker.cy.js).

- `cy.getCompliance(label)`
  - Similar to `getCompliance()` in the reference API above.
  - Returned data ([defined here](https://www.npmjs.com/package/accessibility-checker#async-acheckergetcompliance-content--label--string)) will only contain the `report` object.
- `cy.getCompliance(cyObj, label)`
  - Similar to `getCompliance()` in the reference API above, using the passed cy object (typically obtained via `cy.document`).
  - Returned data ([defined here](https://www.npmjs.com/package/accessibility-checker#async-acheckergetcompliance-content--label--string)) will only contain the `report` object.
- `cy.assertCompliance(failOnError?: boolean)`
  - If `failOnError` is set to false, this will not fail your test. This is useful for testing what needs to be fixed without failing the test. By default, this command will fail your test unless you specify `false` here.
- `cy.getDiffResults(label)`
- `cy.getBaseline(label)`
- `cy.diffResultsWithExpected(actual, expected, clean)`
- `cy.stringifyResults(report)`
- `cy.getACheckerConfig()`

Chain the commands similar to other Cypress commands. For example, `cy.getCompliance('my-label').assertCompliance()` will get the compliance report of the document and then assert there are no violations or that it matches up with a baseline of the same label.

### Using Baselines

Baselines are a helpful feature of `accessibility-checker` that can also be used in this Cypress wrapper. The concept involves capturing a scan result as a 'baseline' so that future scans will pass if they match the baseline. If they differ, then the test will fail. This feature is useful for things like false positives or issues you plan on not fixing.

The baseline feature is documented and implemented as part of `accessibility-checker`. Please see the [accessibility-checker/src/README](https://github.com/IBMa/equal-access/blob/master/accessibility-checker/src/README.md) for details.

## Development

### Running `cypress-accessibility-checker` tests

There is a suite of tests located in the `test/` directory which execute each of the added Cypress commands. You can run this test suite by doing one of the following:

* `npm test`: Executes the tests in a headless environment
* `npm run test:open`: Opens the Cypress interactive mode. Run `npm run test:start-http` in order for the tests to work.

### Building

The plugin does not need to be built to be used. However, there is a package script to group things for NPM.

```bash
npm install
npm run package:npm  or  npm run package:zip
```

## Feedback and reporting bugs

If you think you've found a bug, have questions or suggestions, open a [GitHub Issue](https://github.com/IBMa/equal-access/issues?q=is%3Aopen+is%3Aissue+label%3Acypress-accessibility-checker), tagged with `cypress-accessibility-checker`. 

If you are an IBM employee, feel free to ask questions in the IBM internal Slack channel `#accessibility-at-ibm`.

## License

[![IBM Equal Access Toolkit is released under the Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
