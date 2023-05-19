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

const ACCommands = require("./lib/ACCommands");

after(() => {
    // To write to disk, we have to be outside of the browser, so that's a task
    cy.task('accessibilityChecker', {
        task: 'onRunComplete'
    });
})

function init() {
    let fileConfig;
    return cy.task('accessibilityChecker', {
        task: 'getConfig'
    }, { log: false }).then((config) => {
        fileConfig = config;
        return cy.window({ log: false });
    }).then(win => {
        return ACCommands.initialize(win, fileConfig);
    })
}

// Note: Command run within the browser. Tasks execute outside of the browser

/**
 * Get compliance of a cypress object
 * 
 * This can be called with a single parameter - getCompliance("SCAN_LABEL"),
 * which will scan the current document. Otherwise, pass a cypress object
 * (document) and a label
 */
Cypress.Commands.add("getCompliance", (cyObj, scanLabel) => {
    let scanObj = cyObj;
    let label = scanLabel;
    cy.window({log: false}).then(win => {
        return ACCommands.initialize(win);
    }).then(() => {
        if (typeof cyObj === "string") {
            return cy.document({ log: false })
                .then(doc => {
                    scanObj = doc;
                    label = cyObj;
                })
 /**       }
    }).then(() => {
        return cy.wrap(ACCommands.getCompliance(scanObj, label), { log: false });
    }).then(engineReport => {
        report = engineReport;
        // To write to disk, we have to be outside of the browser, so that's a task
        return cy.title({ log: false });
    }).then(pageTitle => {
        title = pageTitle;
        return cy.url({ log: false });
    }).then(pageUrl => {
        url = pageUrl;
        return cy.task('accessibilityChecker', {
            task: 'sendResultsToReporter',
            data: { profile: `${Cypress.browser.displayName} ${Cypress.browser.version}`, startScan, url, title, label, report }
        }, { log: false }).then((updReport) => {
            let vCount = updReport.results.filter(issue => issue.level === "violation").length;
            Cypress.log({
                name: 'getCompliance',
                // shorter name for the Command Log
                displayName: 'getCompliance',
                message: ` ${vCount} violations`,
                consoleProps: () => {
                    // return an object which will
                    // print to dev tools console on click
                    return updReport
                },
            })
            return cy.wrap(updReport, { log: false });
    */
        }    
    }).then(() => {
        return cy.wrap(ACCommands.getCompliance(scanObj, label), { log: false });        
    }).then(result => {
        let vCount = result.report.results.filter(issue => issue.level === "violation").length;
        Cypress.log({
            name: 'getCompliance',
            // shorter name for the Command Log
            displayName: 'getCompliance',
            message: `${vCount} violations`,
            consoleProps: () => {
              // return an object which will
              // print to dev tools console on click
              return result
            },
          })
        // To write to disk, we have to be outside of the browser, so that's a task
        return cy.task('accessibilityChecker', {
            task: 'sendResultsToReporter',
            data: result
        }, { log: false }).then(() => {
            return result.report;
        });
    });
});

/**
 * Asserts accessibility compliance against a baseline or failure level of violation.  If a failure
 * is logged then the test will have an assertion fail.
 */
Cypress.Commands.add(
  /**  'assertCompliance',
    { prevSubject: true },
    (priorResults, failOnError = true) => {
        return init().then(() => {
            return cy.task('accessibilityChecker', {
                task: 'assertCompliance',
                data: { report: priorResults }
            }, { log: false });
        });
    }
   */     
  'assertCompliance',
  { prevSubject: true },
  (priorResults, failOnError = true) => {
    return cy.wrap(ACCommands.assertCompliance(priorResults), { log: false });
  }
);

/**
 * Retrieves the diff of the results for the given label against the baseline.
 */
Cypress.Commands.add('getDiffResults', (label) => {
    /** return init().then(() => {
        return cy.task('accessibilityChecker', {
            task: 'getDiffResults',
            data: { label }
        }, { log: false });
    });
    */
    cy.window({log: false}).then(win => {
        return ACCommands.initialize(win);
    }).then(() => {
        return cy.wrap(ACCommands.getDiffResults(label), { log: false });
    })
});

/**
 * Retrieves the baseline associated with the label.
 */
Cypress.Commands.add('getBaseline', (label) => {
    /**return init().then(() => {
        return cy.task('accessibilityChecker', {
            task: 'getBaseline',
            data: { label }
        });
    });
    */
  cy.task('accessibilityChecker', {
    task: 'getBaseline',
    data: { label }
  }).then((baseline) => {
    // return cy.wrap(baseline, { log: false });
  });
});

/**
 * Compare provided actual and expected objects and get the differences if there are any.
 */
Cypress.Commands.add(
   /** 'diffResultsWithExpected',
    (actual, expected, clean) => {
        return init().then(() => {
            return cy.task('accessibilityChecker', {
                task: 'diffResultsWithExpected',
                data: { actual, expected, clean }
            });
        });
    }
   */     
  'diffResultsWithExpected',
  (actual, expected, clean) => {
    cy.task('accessibilityChecker', {
      task: 'diffResultsWithExpected',
      data: { actual, expected, clean }
    }).then((diff) => {
    //   return cy.wrap(diff, { log: false });
    });
  }
);

/**
 * Retrieve the readable stringified representation of the scan results.
 */
Cypress.Commands.add(
    'stringifyResults',
    { prevSubject: true },
    (report) => {
        return init().then(() => {
            // Send proper report property
            const dataToSend = report.report ? report.report : report;

    /**   return cy.task('accessibilityChecker', {
                task: 'stringifyResults',
                data: { report: dataToSend }
            });
        });
    } */
    cy.task('accessibilityChecker', {
      task: 'stringifyResults',
      data: { report: dataToSend }
    }).then((result) => {
    //   return cy.wrap(result, { log: false });
    });
  }
);

/**
 * Retrieve the configuration object used by accessibility-checker.
 */
Cypress.Commands.add('getACheckerConfig', () => {
    /**return init().then(() => {
        return cy.task('accessibilityChecker', {
            task: 'getConfig',
            data: {}
        });
    });*/
});
  cy.task('accessibilityChecker', {
    task: 'getConfig',
    data: {}
  }).then((result) => {
    // return cy.wrap(result, { log: false });
  });
});
