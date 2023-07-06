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

'use strict';

// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("JSONObjectVerification.test aChecker.getCompliance", function () {
    // Variable Decleration
    var originalTimeout;

    // All the html unit testscases will be stored in the window.__html__ by the preprocessor
    var unitTestcaseHTML = {
        "JSONObjectStructureVerification.html": "http://localhost:3000/test/client/htmlFiles/JSONObjectStructureVerification.html"
    };

    var unitTestHTMLKeys = Object.keys(unitTestcaseHTML);

    // Loop over all the unitTestcase html/htm files and perform a scan for them
    unitTestHTMLKeys.forEach(function (unitTestFileKey) {

        // Get the unit test URL to scan.
        var unitTestFile = unitTestcaseHTML[unitTestFileKey];

        // This function is used to execute for each of the unitTestFiles, we have to use this type of function
        // to allow dynamic creation/execution of the Unit Testcases. This is like forcing an syncronous execution
        // for the testcases. Which is needed to make sure that all the tests run in the same order.
        // For now we do not need to consider threaded execution because over all theses testscases will take at
        // most half 1 sec * # of testcses (500ms * 780)
        (function (unitTestFile) {

            // Description of the test case that will be run.
            describe("Load Test: " + unitTestFile, function () {

                // Function to run before every testcase (it --> is a testcase)
                // This before function allows to add async support to a testcase.
                // The testcase will not run until the done function is called
                beforeEach(function () {
                    // Extract the current jasmine DEFAULT_TIMEOUT_INTERVAL value to restore later on
                    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

                    // Set the DEFAULT_TIMEOUT_INTERVAL to 3min seconds, to allow for the DAP scan to finish.
                    jasmine.DEFAULT_TIMEOUT_INTERVAL = 180000;
                });

                // The Individual testcase for each of the unittestcases.
                // Note the done that is passed in, this is used to wait for asyn functions.
                it('aChecker.getCompliance.JSONObjectVerification.test.js: a11y scan should match expected value', async function () {

                    window.__karma__.config.ACConfig.policies = ["IBM_Accessibility"];

                    // Perform the accessibility scan using the IBMaScan Wrapper
                    let report = await aChecker.getCompliance(unitTestFile, unitTestFileKey);
                    report = report.report;
                    // Make sure that the structure of the result match with expected structure
                    // Fetch the baseline object based on the label provided
                    var expected = aChecker.getBaseline(unitTestFileKey);

                    // Define the differences with some content as we expect it to be null or undefined if pass
                    var differences = "Something";



                    // Update all the items in the results which dynamically change over scans to the values
                    // already defined in the baseline file.
                    report.ruleTime = expected.ruleTime = 999;
                    report.summary.scanTime = expected.summary.scanTime = 999;
                    report.summary.startScan = expected.summary.startScan = 99999999999;
                    report.scanID = expected.scanID = "uuid";
                    report.toolID = "karma-accessibility-checker-v2.5.1";
                    report.summary.URL = expected.summary.URL = "<URL>"

                    for (const issue of report.results) {
                        delete issue.ruleTime;
                        // issue.bounds.left = 999;
                        // issue.bounds.top = 999;
                        // issue.bounds.height = 999;
                        // issue.bounds.width = 999;
                    }
                    for (const issue of expected.results) {
                        delete issue.ruleTime;
                    }
                    report.results.sort((a, b) => {
                        let pc = b.path.dom.localeCompare(a.path.dom);
                        if (pc !== 0) return pc;
                        return b.ruleId.localeCompare(a.ruleId);
                    })

                    // In the case there are no baseline found then run a different assertion algo,
                    // when there is baseline compare the baselines in the case there is no baseline then
                    // check to make sure there are no violations that are listed in the fails on.
                    if (expected !== null && typeof (expected) !== "undefined") {
                        expected.results.sort((a, b) => {
                            let pc = b.path.dom.localeCompare(a.path.dom);
                            if (pc !== 0) return pc;
                            return b.ruleId.localeCompare(a.ruleId);
                        })
                        // Run the diff algo to get the list of differences
                        differences = aChecker.diffResultsWithExpected(report, expected, true);
                        if (typeof differences !== "undefined") {
                            differences = differences.filter(difference => (
                                difference.kind !== "E"
                                || difference.path[2] !== "bounds"
                                || Math.abs(difference.lhs - difference.rhs) > 2
                            ))
                            if (differences.length === 0) {
                                differences = undefined;
                            }
                        }
                    }
                    expect(typeof differences).toEqual("undefined", "\nDoes not follow the correct JSON structure or can't load baselines" + JSON.stringify(differences, null, '  '));
                });

                // Function to run after every testcase (it --> is a testcase)
                // This function will reset the DEFAULT_TIMEOUT_INTERVAL for a testcase in jasmine
                afterEach(function () {

                    // Reset the Jasmine timeout
                    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;

                    // Print the summary after each test to make sure it is incrementing for now
                    //console.log(window.aChecker.violationSummary);

                });
            });
        }(unitTestFile));
    });
});
