'use strict';

// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("Accessibility Test", function () {
    // Variable Decleration
    var originalTimeout;

    // All the html unit testscases will be stored in the window.__html__ by the preprocessor
    var testcasesHTML = window.__html__;

    // Loop over all the testcase html/htm files and perform a scan for them
    for (var testFile in testcasesHTML) {

        // Get the extension of the file we are about to scan
        var fileExtension = testFile.substr(testFile.lastIndexOf('.') + 1);

        // Make sure the unit testcase we are trying to scan is actually and html/htm files, if it is not
        // just move on to the next one.
        if (fileExtension !== 'html' && fileExtension !== 'htm' && fileExtension !== 'svg') {
            continue;
        }

        // This function is used to execute for each of the testFiles, we have to use this type of function
        // to allow dynamic creation/execution of the testcases. This is like forcing an syncronous execution
        // for the testcases. Which is needed to make sure that all the tests run in the same order.
        // For now we do not need to consider threaded execution because over all theses testscases will take at
        // most half 1 sec * # of testcses (500ms * 780)
        (function (testFile) {

            // Description of the test case that will be run.
            describe("Load Test: " + testFile, function () {

                // Function to run before every testcase (it --> is a testcase)
                // This before function allows to add async support to a testcase.
                // The testcase will not run until the done function is called
                beforeEach(function () {
                    // Extract the current jasmine DEFAULT_TIMEOUT_INTERVAL value to restore later on
                    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

                    // Set the DEFAULT_TIMEOUT_INTERVAL to 3min seconds, to allow for the DAP scan to finish.
                    jasmine.DEFAULT_TIMEOUT_INTERVAL = 180000;
                });

                // The Individual testcase for each of the testcases.
                // Note the done that is passed in, this is used to wait for asyn functions.
                it('should have no accessibility violations', function (done) {

                    // Extract the testcase data file from the testcase hash map.
                    // This will contain the full content of the testcase file. Includes the document
                    // object also.
                    var testDataFileContent = testcasesHTML[testFile];

                    // Perform the accessibility scan using the AAT.getCompliance API
                    aChecker.getCompliance(testDataFileContent, testFile, function (results) {
                        // Call the aChecker.assertCompliance API which is used to compare the results with baseline object if we can find one that
                        // matches the same label which was provided.
                        var returnCode = aChecker.assertCompliance(results);

                        // In the case that the violationData is not defined then trigger an error right away.
                        expect(returnCode).toBe(0, "Scanning " + testFile + " failed.");

                        // Mark the testcases as done.
                        done();
                    });
                });

                // Function to run after every testcase (it --> is a testcase)
                // This function will reset the DEFAULT_TIMEOUT_INTERVAL for a testcase in jasmine
                afterEach(function () {

                    // Reset the Jasmine timeout
                    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;

                });
            });
        }(testFile));
    }
});
