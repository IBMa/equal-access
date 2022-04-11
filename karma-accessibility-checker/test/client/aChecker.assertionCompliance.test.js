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
describe("Rule Unit Tests With Assertion", function () {
    // Variable Decleration
    var originalTimeout;

    // All the html unit testscases will be stored in the window.__html__ by the preprocessor
    var unitTestcaseHTML = window.__html__;
    let testFiles = [];
    for (var unitTestFile in unitTestcaseHTML) {
        testFiles.push(unitTestFile);
    }
    testFiles.sort();

    // Loop over all the unitTestcase html/htm files and perform a scan for them
    for (var unitTestFile of testFiles) {

        // Do not run JSONObjectStructureVerification.html in this script
        if (unitTestFile === "test/client/htmlFiles/JSONObjectStructureVerification.html" || unitTestFile === "dependencies/tools-rules-html/v2/a11y/test/client/htmlFiles/JSONObjectStructureVerification.html") {
            continue;
        }

        // Get the extension of the file we are about to scan
        var fileExtension = unitTestFile.substr(unitTestFile.lastIndexOf('.') + 1);

        // Make sure the unit testcase we are trying to scan is actually and html/htm files, if it is not
        // just move on to the next one.
        if (fileExtension !== 'html' && fileExtension !== 'htm' && fileExtension !== 'svg') {
            continue;
        }

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
                it('aChecker.assertionCompliance.test.js: a11y scan should assert results', function (done) {

                    // Extract the unitTestcase data file from the unitTestcase hash map.
                    // This will contain the full content of the testcase file. Includes the document
                    // object also.
                    var unitTestDataFileContent = unitTestcaseHTML[unitTestFile];

                    // Perform the accessibility scan using the IBMaScan Wrapper
                    aChecker.getCompliance(unitTestDataFileContent, unitTestFile + "_assertion", function (results) {
                        // Call the aChecker assertion function which is used to compare the results with baseline object if we can find one that
                        // matches the same label which was provided.
                        var returnCode = aChecker.assertCompliance(results);

                        // In the case that the violationData is not defined then trigger an error right away.
                        expect(returnCode).toBeGreaterThan(-1, "Scanning " + unitTestFile + " failed.");

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
    }
});
