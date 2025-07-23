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
const mapRuleToG = aChecker.ruleIdToLegacyId;

let mapGToRule = {}
for (const key in mapRuleToG) {
    mapGToRule[mapRuleToG[key]] = key;
}


// Determine which rules are in policy
// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("Rule Unit Tests As Content", function () {

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
                it('aChecker.Content.test.js: a11y scan should match expected value', function (done) {
                    let validList = {};
                    let policyMap = {};
                    aChecker.Config.policies.forEach(function (policy) {
                        policyMap[policy] = true;
                    });
                
                    let rulesets = aChecker.getRulesets();
                    rulesets.forEach(function (rs) {
                        if (rs.id in policyMap) {
                            for (const cp of rs.checkpoints) {
                                for (const rule of cp.rules) {
                                    validList[rule.id] = true;
                                }
                            }
                        }
                    });

                    // Extract the unitTestcase data file from the unitTestcase hash map.
                    // This will contain the full content of the testcase file. Includes the document
                    // object also.
                    // var unitTestDataFileContent = unitTestcaseHTML[unitTestFile];

                    var regex = "test.*html?$";
                    var unitTestURL = "http://localhost:3000/" + unitTestFile.match(regex)[0];

                    // Perform the accessibility scan using the IBMaScan Wrapper
                    let iframe = null;
                    let report = null;
                    aChecker.getCompliance(unitTestURL, unitTestFile + "_content")
                    .then((result) => {
                        if (!result || !result.report) {
                            try { expect(false).toEqual(true, "\nWas unable to scan: " + unitTestFile); } catch (e) { return Promise.reject(e); }
                        }
                        report = result.report;
                        iframe = result.iframe;
                    })
                    .then(() => {
                        let unitTestInfo = {
                            legacyExpectedInfo: (typeof(iframe.OpenAjax) !== 'undefined' && iframe.OpenAjax && iframe.OpenAjax.a11y && iframe.OpenAjax.a11y.ruleCoverage),
                            expectedInfo: (typeof(iframe.UnitTest) !== 'undefined' && iframe.UnitTest)
                        }

                        // Extract the ruleCoverage object from the unit testcases that is loaded on to the iframe.
                        let expectedInfo = unitTestInfo.expectedInfo;
                        let legacyExpectedInfo = unitTestInfo.legacyExpectedInfo;
                        if (expectedInfo && expectedInfo.ruleIds) {
                            let filtReport = [];
                            for (const issue of report.results) {
                                delete issue.node;
                                delete issue.ruleTime;
                                delete issue.bounds;
                                delete issue.ignored;
                                delete issue.level;
                                delete issue.help;
                                delete issue.source;
                                issue.value[0] = "INFORMATION";
                                if (expectedInfo.ruleIds.includes(issue.ruleId)) {
                                    // These are too variable between runs - don't test these
                                    delete issue.snippet;
                                    filtReport.push(issue);
                                }
                            }
                            filtReport.sort((a, b) => {
                                let pc = b.path.dom.localeCompare(a.path.dom);
                                if (pc !== 0) return pc;
                                return b.ruleId.localeCompare(a.ruleId);
                            })
                            expectedInfo.results.sort((a, b) => {
                                let pc = b.path.dom.localeCompare(a.path.dom);
                                if (pc !== 0) return pc;
                                return b.ruleId.localeCompare(a.ruleId);
                            })
                            expect(filtReport).toEqual(expectedInfo.results);
                        } else if (legacyExpectedInfo) {
                            let expectedInfo = {}
                            let actualInfo = {}
                            for (const item of legacyExpectedInfo) {

                                if (mapGToRule[item.ruleId] in validList) {
                                    expectedInfo[item.ruleId] = [];
                                    actualInfo[item.ruleId] = [];
                                    for (let xpath of item.failedXpaths) {
                                        xpath = xpath.replace(/([^\]])\//g, "$1[1]/");
                                        if (!xpath.endsWith("]")) xpath += "[1]";
                                        expectedInfo[item.ruleId].push(xpath);
                                    }
                                } else {
                                    console.log("WARNING: Skipping results for", item.ruleId, "- does not exist in current ruleset");
                                }
                            }
                            for (const issue of report.results) {
                                delete issue.node;
                                delete issue.ruleTime;
                                delete issue.bounds;
                                delete issue.help;
                                delete issue.source;
                                const ruleId = mapRuleToG[issue.ruleId];
                                if (ruleId in expectedInfo && issue.value[1] !== "PASS") {
                                    actualInfo[ruleId].push(issue.path.dom);
                                }
                            }
                            for (const ruleId in expectedInfo) {
                                expectedInfo[ruleId].sort();
                                actualInfo[ruleId].sort();
                            }
                            expect(actualInfo).toEqual(expectedInfo);
                        }
                    })
                    .then(() => {
                        done();
                    })
                    .catch((e) => {
                        done(e);
                    })
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
