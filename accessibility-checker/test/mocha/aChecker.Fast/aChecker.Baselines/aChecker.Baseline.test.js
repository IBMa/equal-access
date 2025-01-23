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

var fs = require("fs");
var path = require("path");
var unitTestcaseHTML = {};
var aChecker = require("../../../../src")
var expect = require("chai").expect;
var util = require('util')

var files = ["aChecker.Baseline.html", "aChecker.Baseline2.html"];
files.forEach(function (f) {
    var fileExtension = f.substr(f.lastIndexOf('.') + 1);
    if (fileExtension === 'html' || fileExtension === 'htm') {
        var f = path.join(process.cwd(), "test","mocha","aChecker.Fast","aChecker.Baselines",f);
        unitTestcaseHTML[f] = fs.readFileSync(f, 'utf8');
    };
});

var codes = {};
codes[path.join(process.cwd(), "test", "mocha", "aChecker.Fast", "aChecker.Baselines", "aChecker.Baseline.html")] = 0;
codes[path.join(process.cwd(), "test", "mocha", "aChecker.Fast", "aChecker.Baselines", "aChecker.Baseline2.html")] = 1;

// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("Baseline testing", function () {
    after(() => {
        aChecker.close();
    });

    // Variable Decleration
    var originalTimeout;

    // Loop over all the unitTestcase html/htm files and perform a scan for them
    for (var unitTestFile in unitTestcaseHTML) {
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

                // The Individual testcase for each of the unittestcases.
                // Note the done that is passed in, this is used to wait for asyn functions.
                it('a11y scan should match expected value', async function () {
                    this.timeout(0);
                    // Extract the unitTestcase data file from the unitTestcase hash map.
                    // This will contain the full content of the testcase file. Includes the document
                    // object also.
                    var unitTestDataFileContent = unitTestcaseHTML[unitTestFile];
                    var labelName = unitTestFile.substring(Math.max(unitTestFile.lastIndexOf("/"), unitTestFile.lastIndexOf("\\")) + 1);
                    // Perform the accessibility scan using the IBMaScan Wrapper
                    let result = await aChecker.getCompliance(unitTestDataFileContent, "Baseline_" + labelName);
                    let assertVal = aChecker.assertCompliance(result.report);
                    if (assertVal !== codes[unitTestFile]) {
                        console.log("inspect result", util.inspect(result.report, null, 6));
                    } 
                    expect(assertVal).to.equal(codes[unitTestFile]); 
                });
            });
        }(unitTestFile));
    }
});
