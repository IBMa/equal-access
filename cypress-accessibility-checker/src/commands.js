/******************************************************************************
     Copyright:: 2020- IBM, Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
  *****************************************************************************/

/// <reference types="Cypress" />

/**
 * Scans the sent HTML and returns a report.
 */
Cypress.Commands.add('getA11yCompliance', (html, label) => {
  return cy
    .task('accessibilityChecker', {
      task: 'getCompliance',
      data: {
        html,
        label
      }
    })
    .then((result) => {
      return cy.wrap(result, { log: false });
    });
});

/**
 * Scans and returns a report using the entire `document` and the sent label.
 */
Cypress.Commands.add('getA11yComplianceOfDocument', (label) => {
  return cy.document({ log: false }).then((doc) => {
    cy.task('accessibilityChecker', {
      task: 'getCompliance',
      data: {
        html: doc.getElementsByTagName('html')[0].outerHTML,
        label
      }
    }).then((result) => {
      return cy.wrap(result, { log: false });
    });
  });
});

/**
 * Asserts a11y compliance against a baseline or failure level of violation.  If a failure
 * is logged then the test will have an assertion fail.
 */
Cypress.Commands.add(
  'assertA11yCompliance',
  { prevSubject: true },
  (priorResults, shouldFail) => {
    cy.task('accessibilityChecker', {
      task: 'assertCompliance',
      data: { report: priorResults.report }
    })
      .then((result) => {
        const name = 'A11y';
        if (result === 0) {
          // 0  - results match baseline or no violations based on failLevels
          Cypress.log({
            name,
            message: 'No violations based on baseline/failLevels'
          });
          return result;
        } else if (result === 1) {
          // 1  - results don't match baseline
          // Get the diff between the results/baseline and put in console
          cy.getA11yDiffResults(priorResults.report.label).then((diff) => {
            const message =
              'Does not match baseline.  See console for scan diff.';
            Cypress.log({
              name,
              message,
              consoleProps: () => {
                return {
                  message,
                  diff
                };
              }
            });

            return result;
          });
        } else if (result === 2) {
          // 2  - failure based on failLevels
          // Print report and then individual violations
          const message =
            'Violations according to failLevels.  See console for scan results.';
          Cypress.log({
            name,
            message,
            consoleProps: () => {
              return {
                message,
                priorResults
              };
            }
          });

          // Individual violations
          return cy.getA11yConfig().then(({ failLevels }) => {
            priorResults.report.results
              .filter((curErr) => failLevels.indexOf(curErr.level) !== -1)
              .forEach((curErr) => {
                Cypress.log({
                  name,
                  message: curErr.ruleId,
                  consoleProps: () => {
                    return {
                      curErr
                    };
                  }
                });
              });
            return result;
          });
        } else if (result === -1) {
          // -1 - Exception
          Cypress.log({
            name,
            message: 'Exception asserting compliance.  See Cypress logs.'
          });
          return result;
        }
      })
      .then((result) => {
        if ((result !== 0 && shouldFail === undefined) || shouldFail === true) {
          assert.fail(
            'accessibility-checker: See previous logs for accessibility violation data'
          );
        }
        return cy.wrap(result, { log: false });
      });
  }
);

/**
 * Retrieves the diff of the results for the given label against the baseline.
 */
Cypress.Commands.add('getA11yDiffResults', (label) => {
  cy.task('accessibilityChecker', {
    task: 'getDiffResults',
    data: { label }
  }).then((diff) => {
    return cy.wrap(diff, { log: false });
  });
});

/**
 * Retrieves the baseline associated with the label.
 */
Cypress.Commands.add('getA11yBaseline', (label) => {
  cy.task('accessibilityChecker', {
    task: 'getBaseline',
    data: { label }
  }).then((baseline) => {
    return cy.wrap(baseline, { log: false });
  });
});

/**
 * Compare provided actual and expected objects and get the differences if there are any.
 */
Cypress.Commands.add(
  'diffA11yResultsWithExpected',
  (actual, expected, clean) => {
    cy.task('accessibilityChecker', {
      task: 'diffResultsWithExpected',
      data: { actual, expected, clean }
    }).then((diff) => {
      return cy.wrap(diff, { log: false });
    });
  }
);

/**
 * Retrieve the readable stringified representation of the scan results.
 */
Cypress.Commands.add(
  'stringifyA11yResults',
  { prevSubject: true },
  (report) => {
    // Send proper report property
    const dataToSend = report.report ? report.report : report;

    cy.task('accessibilityChecker', {
      task: 'stringifyResults',
      data: { report: dataToSend }
    }).then((result) => {
      return cy.wrap(result, { log: false });
    });
  }
);

/**
 * Retrieve the configuration object used by accessibility-checker.
 */
Cypress.Commands.add('getA11yConfig', () => {
  cy.task('accessibilityChecker', {
    task: 'getConfig',
    data: {}
  }).then((result) => {
    return cy.wrap(result, { log: false });
  });
});

/**
 * Close puppeteer pages and other resources that may be used by accessibility-checker.
 */
Cypress.Commands.add('closeA11y', () => {
  cy.task('accessibilityChecker', {
    task: 'close',
    data: {}
  }).then((result) => {
    return cy.wrap(result, { log: false });
  });
});
