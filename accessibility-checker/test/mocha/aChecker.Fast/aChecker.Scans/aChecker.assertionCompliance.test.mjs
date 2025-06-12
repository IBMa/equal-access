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

import * as fs from "fs";
import * as path from "path";
import * as aChecker from "../../../../src/mjs/index.js";
// import ace from "../../../../../accessibility-checker-engine/dist/ace-node.js";
import { expect } from "chai";
let unitTestcaseHTML = {};
let testRootDir = path.join(process.cwd(), "..","accessibility-checker-engine","test","v2","checker","accessibility","rules");
let gdirs = fs.readdirSync(testRootDir);

gdirs.forEach(function (gdir) {
    gdir = path.join(testRootDir, gdir)
    if (fs.lstatSync(gdir).isDirectory()) {
        let files = fs.readdirSync(gdir);
        files.forEach(function (f) {
            let fileExtension = f.substr(f.lastIndexOf('.') + 1);
            if (fileExtension === 'html' || fileExtension === 'htm') {
                f = path.join(gdir, f);
                unitTestcaseHTML[f] = fs.readFileSync(f, 'utf8');
            };
        });
    }
});

// Skip test cases that don't work in this environment (e.g., can't disable meta refresh in chrome)
let testRoot = path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules")
let skipList = [
    // Testcase has a script reference to a file, which traps when loaded as a string
    // Not in Karma conf skip list
    path.join(testRoot, "Hidden", "unitTestisNodeVisible.html"),
    path.join(testRoot, "meta_refresh_delay_ruleunit", "Meta-invalidRefresh.html"),
    path.join(testRoot, "meta_redirect_optional_ruleunit", "Meta-RefreshZero.html"),
    path.join(testRoot, "aria_banner_label_unique_ruleunit", "validLandMarks-testCaseFromAnn.html"),
    path.join(testRoot, "element_accesskey_labelled_ruleunit", "AssesskeyNeedsLabelHidden.html"),
    path.join(testRoot, "aria_activedescendant_valid_ruleunit", "ActiveDescendant.html"),

    path.join(testRoot, "meta_refresh_delay_ruleunit", "act-pass-1.html"),
    path.join(testRoot, "meta_refresh_delay_ruleunit", "act-pass-2.html"),
    path.join(testRoot, "meta_refresh_delay_ruleunit", "act-fail-1.html"),
    path.join(testRoot, "meta_refresh_delay_ruleunit", "act-fail-2.html"),
    path.join(testRoot, "meta_refresh_delay_ruleunit", "act-fail-3.html"),
    path.join(testRoot, "meta_refresh_delay_ruleunit", "act-inapplicable-1.html"),
    path.join(testRoot, "meta_refresh_delay_ruleunit", "act-inapplicable-2.html"),
    path.join(testRoot, "meta_refresh_delay_ruleunit", "act-inapplicable-3.html"),
    path.join(testRoot, "meta_refresh_delay_ruleunit", "act-inapplicable-4.html"),
    path.join(testRoot, "meta_refresh_delay_ruleunit", "act-inapplicable-5.html"),
    path.join(testRoot, "meta_refresh_delay_ruleunit", "act-inapplicable-6.html"),
    path.join(testRoot, "meta_refresh_delay_ruleunit", "act-inapplicable-7.html"),
    path.join(testRoot, "meta_refresh_delay_ruleunit", "act-inapplicable-8.html"),

    path.join(testRoot, "meta_redirect_optional_ruleunit", "act-pass-1.html"),
    path.join(testRoot, "meta_redirect_optional_ruleunit", "act-pass-2.html"),
    path.join(testRoot, "meta_redirect_optional_ruleunit", "act-fail-1.html"),
    path.join(testRoot, "meta_redirect_optional_ruleunit", "act-fail-2.html"),
    path.join(testRoot, "meta_redirect_optional_ruleunit", "act-fail-3.html"),
    path.join(testRoot, "meta_redirect_optional_ruleunit", "act-inapplicable-1.html"),
    path.join(testRoot, "meta_redirect_optional_ruleunit", "act-inapplicable-2.html"),
    path.join(testRoot, "meta_redirect_optional_ruleunit", "act-inapplicable-3.html"),
    path.join(testRoot, "meta_redirect_optional_ruleunit", "act-inapplicable-4.html"),
    path.join(testRoot, "meta_redirect_optional_ruleunit", "act-inapplicable-5.html"),
    path.join(testRoot, "meta_redirect_optional_ruleunit", "act-inapplicable-6.html"),
    path.join(testRoot, "meta_redirect_optional_ruleunit", "act-inapplicable-7.html"),
    path.join(testRoot, "meta_redirect_optional_ruleunit", "act-inapplicable-8.html"),

    //deprecated
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "act_fail1.html"),
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "act_fail2.html"),
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "act_inapplicable1.html"),
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "act_inapplicable2.html"),
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "act_inapplicable3.html"),
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "act_inapplicable4.html"),
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "act_inapplicable5.html"),
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "act_inapplicable6.html"),
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "act_pass1.html"),
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "act_pass2.html"),
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "element_invisible.html"),
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "element_scrollable_unfocusable1.html"),
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "element_scrollable_unfocusable2.html"),
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "element_too_small1.html"),
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "element_too_small2.html"),
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "scrollable_element_tabbable.html"),
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "textarea_pass.html"),
    path.join(testRoot, "element_scrollable_tabbable_ruleunit", "textarea_pass2.html"),
    

]
let skipMap = {}
skipList.forEach(function (skip) {
    skipMap[skip] = true;
});

// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("Rule Unit Tests With Assertion", function () {
    after(() => {
        aChecker.close();
    });

    // Variable Decleration
    let originalTimeout;

    // Loop over all the unitTestcase html/htm files and perform a scan for them
    for (let unitTestFile in unitTestcaseHTML) {
        if (unitTestFile in skipMap) continue;

        // Get the extension of the file we are about to scan
        let fileExtension = unitTestFile.substr(unitTestFile.lastIndexOf('.') + 1);

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
                it('a11y scan should assert results', async function () {
                    this.timeout(30000);
                    let returnCode = -1;
                    let resultsStr = "";
                    try {
                        // Extract the unitTestcase data file from the unitTestcase hash map.
                        // This will contain the full content of the testcase file. Includes the document
                        // object also.
                        const unitTestDataFileContent = unitTestcaseHTML[unitTestFile];

                        // Perform the accessibility scan using the IBMaScan Wrapper
                        const results = await aChecker.getCompliance(unitTestDataFileContent, unitTestFile + "_assertion");
                        // Call the aChecker assertion function which is used to compare the results with baseline object if we can find one that
                        // matches the same label which was provided.
                        returnCode = aChecker.assertCompliance(results.report);
                        resultsStr = JSON.stringify(results.report);
                    } catch (e) {
                        console.error(e);
                    }
                    // In the case that the violationData is not defined then trigger an error right away.
                    expect(returnCode).to.be.above(-1, "Scanning " + unitTestFile + " failed." + resultsStr);
                });
            });
        }(unitTestFile));
    }
});
