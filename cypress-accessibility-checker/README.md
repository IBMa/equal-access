# cypress-accessibility-checker

Cypress plugin for Accessibility Testing

## Bugs and Issues

All bugs or issues related to the karma-accessibility-checker code can be created in [GitHub Issues](https://github.com/IBMa/equal-access/issues).

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
The usage of the commands maps directly to the description of the API located [https://github.com/IBMa/equal-access/blob/master/accessibility-checker/README.md](in this readme).  The names of the APIs within Cypress are just slightly different so they are globally unique in the Cypress namespace.

- `cy.getA11yCompliance(content: string, label)`
- `cy.getA11yComplianceOfDocument(label)`
  - Similar to `getCompliance()` in the reference API above, however it will automatically pass in the document.
- `cy.assertA11yCompliance(shouldFail?: boolean)`
  - If `shouldFail` is set to false, this will not fail your test.  This is useful for testing what needs to be fixed without failing the test.
- `cy.getA11yDiffResults(label)`
- `cy.getA11yBaseline(label)`
- `cy.diffA11yResultsWithExpected(actual, expected, clean)`
- `cy.stringifyA11yResults(report)`
- `cy.getA11yConfig()`
- `cy.closeA11y()`

You can chain the commands similar to other Cypress commands.  For example, `cy.getA11yComplianceOfDocument('my-label').assertA11yCompliance()` will get the compliance report of the document and then assert there are no violations or that it matches up with a baseline of the same label.


## Running `cypress-accessibility-checker` tests

There is a suite of tests located in the `test/` directory which execute each of the added Cypress commands.  You can run this test suite by doing one of the following:

* `npm test`: Executes the tests in a headless environment
* `npm run test:open`: Opens the Cypress interactive mode.


## Building

The plugin does not really need to be built to be used.  However there is a package script to group things for NPM.

```
npm install
npm run package:npm  or  npm run package:zip
```
