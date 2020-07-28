# cypress-accessibility-checker

Cypress plugin for Accessibility Testing.  This plugin is a wrapper around the NodeJS version of `accessibility-checker` which is [available on NPM](https://www.npmjs.com/package/accessibility-checker).  The plugin works by taking a stringified version of the page and passing it down to a Cypress plugin which then executes the `accessibility-checker` library against the stringified page.  Please see the `Usage` section in this README for more details.

## Bugs and Issues

All bugs or issues related to the cypress-accessibility-checker code can be created in [GitHub Issues](https://github.com/IBMa/equal-access/issues).

## Requirements

* [Node Version 12](https://nodejs.org/en/download/)

## Installation

Install the package as a devDependency.  It will pull in a few packages including `accessibility-checker` which runs the actual tests.

```
npm install cypress-accessibility-checker --save-dev
```

## Configuration

The configuration for the plugin is driven by a configuration file called `.achecker.yml` that you will need to put in the same directory as your `cypress.json` file.  See details on the syntax of this file [here](https://github.com/IBMa/equal-access/blob/master/accessibility-checker/README.md).

## Setup Cypress

There are two setup steps you must complete in order for the Cypress tests to be able to use the commands.

### 1. Add plugin

In the `cypress/plugins/index.js` file located in your project, require the plugin and then register it with Cypress.
```
const a11yTasks = require('cypress-accessibility-checker/plugin');
module.exports = (on, config) => {
  on('task', {
    accessibilityChecker: a11yTasks
  });
};
```

### 2. Import commands
In the `cypress/support/index.js` file located in your project, add the following import statement.  This will import the accessibility checker commands and register them with Cypress.

```
import 'cypress-accessibility-checker';
```

## Usage
The usage of the commands maps directly to the description of the API located [in this readme](https://github.com/IBMa/equal-access/blob/master/accessibility-checker/src/README.md).  The names of the APIs within Cypress are just slightly different so they are globally unique in the Cypress namespace.

The typical use case will be to get the accessibility compliance of a document and then assert the accessibility compliance against the configuration you have defined as part of the `.achecker.yml` file and any baselines that are defined.  An example of how this looks is below:

```
// Retrieves the compliance of the document then checks the results against the defined settings.
// If there are issues when compared to the defined settings, it will fail the Cypress test.
cy.getA11yComplianceOfDocument('my scan').assertA11yCompliance()
```

Examples on how to use each of the APIs below can be found in the `achecker.js` test file [located here](https://github.com/IBMa/equal-access/blob/master/cypress-accessibility-checker/test/cypress/integration/achecker.js).

- `cy.getA11yCompliance(content: string, label)`
  - `content` must only be a string of HTML.  Due to the nature of how the plugin works, only string version of HTML is supported.
  - Returned data ([defined here](https://www.npmjs.com/package/accessibility-checker#async-acheckergetcompliance-content--label--string)) will only contain the `report` object.
- `cy.getA11yComplianceOfDocument(label)`
  - Similar to `getCompliance()` in the reference API above, however it will automatically pass in the document.
  - Returned data ([defined here](https://www.npmjs.com/package/accessibility-checker#async-acheckergetcompliance-content--label--string)) will only contain the `report` object.
- `cy.assertA11yCompliance(shouldFail?: boolean)`
  - If `shouldFail` is set to false, this will not fail your test.  This is useful for testing what needs to be fixed without failing the test.
- `cy.getA11yDiffResults(label)`
- `cy.getA11yBaseline(label)`
- `cy.diffA11yResultsWithExpected(actual, expected, clean)`
- `cy.stringifyA11yResults(report)`
- `cy.getA11yConfig()`
- `cy.closeA11y()`

You can chain the commands similar to other Cypress commands.  For example, `cy.getA11yComplianceOfDocument('my-label').assertA11yCompliance()` will get the compliance report of the document and then assert there are no violations or that it matches up with a baseline of the same label.

**NOTE**: The results folder will contain scan results.  Each file will contain the stringified version of what was scanned on the page instead of the URL scanned.  This is currently working as expected.


### Using Baselines
Baselines are a helpful feature of `accessibility-checker` that can also be used in this Cypress wrapper.  The concept involves capturing a scan result as a 'baseline' so that future scans will pass if they match the baseline.  If they differ, then the test will fail.  This feature is useful for things like false positives or issues you plan on not fixing.

The baseline feature is documented and implemented as part of `accessibility-checker`.  Please see the [accessibility-checker documentation](https://github.com/IBMa/equal-access/blob/master/accessibility-checker/src/README.md) for details.

## Development

### Running `cypress-accessibility-checker` tests

There is a suite of tests located in the `test/` directory which execute each of the added Cypress commands.  You can run this test suite by doing one of the following:

* `npm test`: Executes the tests in a headless environment
* `npm run test:open`: Opens the Cypress interactive mode.  You must run `npm run test:start-http` in order for the tests to work.


### Building

The plugin does not really need to be built to be used.  However there is a package script to group things for NPM.

```
npm install
npm run package:npm  or  npm run package:zip
```
