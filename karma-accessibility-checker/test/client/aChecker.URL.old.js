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
describe("Rule Unit Tests As URL", function () {
    // Variable Decleration
    var originalTimeout;

    // All the html unit testscases will be stored in the window.__html__ by the preprocessor
    var unitTestcaseHTML = { "rulestest/2016RulesDep/June/g1085_2016Q2/g1085_fail_JSPlain.html": "http://pttest-data.canlab.ibm.com/acce-rules/rulestest/2016RulesDep/June/g1085_2016Q2/g1085_fail_JSPlain.html",
                             "rulestest/2015RulesDep/g1069/performance/performance.html": "http://pttest-data.canlab.ibm.com/acce-rules/rulestest/2015RulesDep/g1069/performance/performance.html"
                           };

    var unitTestHTMLKeys = Object.keys(unitTestcaseHTML);

    // Loop over all the unitTestcase html/htm files and perform a scan for them
    unitTestHTMLKeys.forEach(function(unitTestFileKey) {

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
                it('aChecker.URL.test.js: a11y scan should match expected value', function (done) {

                    // Perform the accessibility scan using the IBMaScan Wrapper
                    aChecker.getCompliance(unitTestFile, unitTestFileKey, function (results) {

                        var returnCode = aChecker.assertCompliance(results);

                        // Expecting -2 because there is a defect open where firefox does not allow cross domain, so
                        // it will return -1 all the time as we can not scan it at all.
                        expect(returnCode).toBeGreaterThan(-2, "\nDoes not match baseline");

                        // Mark the testcases as done.
                        done();
                    });
                });

                // Function to run after every testcase (it --> is a testcase)
                // This function will reset the DEFAULT_TIMEOUT_INTERVAL for a testcase in jasmine
                afterEach(function () {

                    // Reset the Jasmine timeout
                    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;

                    // Print the summry after each test to make sure it is inrementing for now
                    //console.log(window.aChecker.violationSummary);

                });
            });
        }(unitTestFile));
    });
});
