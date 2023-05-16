# cypress-accessibility-checker

Cypress plugin for Accessibility Testing. This plugin is a Cypress flavor of the NodeJS version of `accessibility-checker` which is also [available on NPM](https://www.npmjs.com/package/accessibility-checker). The plugin works by injecting the accessibility-checker engine into the Cypress browser and scanning the page in context. Please see the `Usage` section in this README for more details.

## Bugs and Issues

All bugs or issues related to the cypress-accessibility-checker code can be created in [GitHub Issues](https://github.com/IBMa/equal-access/issues?q=is%3Aopen+is%3Aissue+label%3Acypress-accessibility-checker), tagged with `cypress-accessibility-checker`.

## Requirements

* [Node Version 18](https://nodejs.org/en/download/)
* Cypress 12

## Installation

Install the package as a devDependency.

```
npm install cypress-accessibility-checker --save-dev
```

## Configuration

The configuration for the plugin is driven by a configuration file called `.achecker.yml` that you will need to put in the same directory as your `cypress.json` file. See details on the syntax of this file [here](https://github.com/IBMa/equal-access/blob/master/accessibility-checker/src/README.md#configuring-accessibility-checker).

## Setup Cypress

There are two setup steps you must complete in order for the Cypress tests to be able to use the commands.

### 1. Add plugin

In the `cypress/plugins/index.js` file located in your project, require the plugin and then register it with Cypress.
```
const aCheckerTasks = require('cypress-accessibility-checker/plugin');
module.exports = (on, config) => {
  on('task', {
    accessibilityChecker: aCheckerTasks
  });
};
```

### 2. Import commands
In the spec file where you run tests, add the following import statement. This will register the custom checker commands.

```
import 'cypress-accessibility-checker';
```

## Usage
The usage of the commands maps directly to the description of the API located [in this readme](https://github.com/IBMa/equal-access/blob/master/accessibility-checker/src/README.md). The names of the APIs within Cypress are just slightly different so they are globally unique in the Cypress namespace.

The typical use case will be to get the accessibility compliance of a document and then assert the accessibility compliance against the configuration you have defined as part of the `.achecker.yml` file and any baselines that are defined. An example of how this looks is below:

```
// Retrieves the compliance of the document then checks the results against the defined settings.
// If there are issues when compared to the defined settings, it will fail the Cypress test.
cy.getCompliance('my scan').assertCompliance()
```

Examples on how to use each of the APIs below can be found in the `achecker.js` test file [located here](https://github.com/IBMa/equal-access/blob/master/cypress-accessibility-checker/test/cypress/integration/achecker.js).

- `cy.getCompliance(label)`
  - Similar to `getCompliance()` in the reference API above.
  - Returned data ([defined here](https://www.npmjs.com/package/accessibility-checker#async-acheckergetcompliance-content--label--string)) will only contain the `report` object.
- `cy.getCompliance(cyObj, label)`
  - Similar to `getCompliance()` in the reference API above, using the passed cy object (typically obtained via `cy.document`).
  - Returned data ([defined here](https://www.npmjs.com/package/accessibility-checker#async-acheckergetcompliance-content--label--string)) will only contain the `report` object.
- `cy.assertCompliance(failOnError?: boolean)`
  - If `failOnError` is set to false, this will not fail your test. This is useful for testing what needs to be fixed without failing the test. By default this command will fail your test unless you specify `false` here.
- `cy.getDiffResults(label)`
- `cy.getBaseline(label)`
- `cy.diffResultsWithExpected(actual, expected, clean)`
- `cy.stringifyResults(report)`
- `cy.getACheckerConfig()`

You can chain the commands similar to other Cypress commands. For example, `cy.getCompliance('my-label').assertCompliance()` will get the compliance report of the document and then assert there are no violations or that it matches up with a baseline of the same label.

### Using Baselines
Baselines are a helpful feature of `accessibility-checker` that can also be used in this Cypress wrapper. The concept involves capturing a scan result as a 'baseline' so that future scans will pass if they match the baseline. If they differ, then the test will fail. This feature is useful for things like false positives or issues you plan on not fixing.

The baseline feature is documented and implemented as part of `accessibility-checker`. Please see the [accessibility-checker documentation](https://github.com/IBMa/equal-access/blob/master/accessibility-checker/src/README.md) for details.

## Development

### Running `cypress-accessibility-checker` tests

There is a suite of tests located in the `test/` directory which execute each of the added Cypress commands. You can run this test suite by doing one of the following:

* `npm test`: Executes the tests in a headless environment
* `npm run test:open`: Opens the Cypress interactive mode. You must run `npm run test:start-http` in order for the tests to work.


### Building

The plugin does not really need to be built to be used. However there is a package script to group things for NPM.

```
npm install
npm run package:npm  or  npm run package:zip
```
