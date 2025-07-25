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
import ace from "../../../../../accessibility-checker-engine/dist/ace-node.js";
import { expect } from "chai";

let unitTestcaseHTML = {};
let testRootDir = path.join(process.cwd(), "..","accessibility-checker-engine","test","v2","checker","accessibility","rules");
let gdirs = fs.readdirSync(testRootDir);
const mapRuleToG = aChecker.ruleIdToLegacyId;

let mapGToRule = {}
for (const key in mapRuleToG) {
    mapGToRule[mapRuleToG[key]] = key;
}

let validList = {};
let policyMap = {};
const checker = new ace.Checker();
before(async function () {
    let config = await aChecker.getConfig();
    config.policies.forEach(function (policy) {
        policyMap[policy] = true;
    });

    let rulesets = checker.rulesets;
    rulesets.forEach(function (rs) {
        if (rs.id in policyMap) {
            for (const cp of rs.checkpoints) {
                for (const rule of cp.rules) {
                    validList[rule.id] = true;
                }
            }
        }
    });
});

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
let testRoot = path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules");
let skipList = [

    // Not in Karma Conf Skip list
    // Testcase has a script reference to a file, which traps when loaded as a string
    path.join(testRoot, "Hidden_ruleunit", "unitTestisNodeVisible.html"),
    path.join(testRoot, "img_alt_background_ruleunit", "APassedFileWithNoImg.html"),
    path.join(testRoot, "blink_css_review_ruleunit", "TextDecoration-Blink.html"),
    // CSS processing errors
    path.join(testRoot, "HAAC_Aria_Native_Host_Semantics_ruleunit", "input_type_test.html"),
    path.join(testRoot, "aria_eventhandler_role_valid_ruleunit", "eventHandlerMissingRole2.html"),
    path.join(testRoot, "aria_widget_labelled_ruleunit", "menuItemCheckboxNoInnerText.html"),
    // Can't access referenced files
    // no baseline found
    path.join(testRoot, "aria_banner_label_unique_ruleunit", "validLandMarks-testCaseFromAnn.html"),

    path.join(testRoot, "img_alt_redundant_ruleunit", "Img-redundantLink.html"),
    path.join(testRoot, "input_label_after_ruleunit", "Input-hasLabelBadPlacement.html"),
    path.join(testRoot, "input_label_before_ruleunit", "Input-hasLabelBadPlacement.html"),
    path.join(testRoot, "element_mouseevent_keyboard_ruleunit", "Events-invalidNoMouseRequired.html"),
    path.join(testRoot, "input_label_exists_ruleunit", "D766.html"),
    path.join(testRoot, "a_text_purpose_ruleunit", "A-nonTabable.html"),

    //in karma conf file skip list
    path.join(testRoot, "a_text_purpose_ruleunit", "A-hasTextEmbedded.html"),

    // Meta refresh
    path.join(testRoot, "meta_refresh_delay_ruleunit", "Meta-invalidRefresh.html"),
    path.join(testRoot, "meta_refresh_delay_ruleunit", "Meta-validRefresh.html"),
    path.join(testRoot, "meta_redirect_optional_ruleunit", "Meta-RefreshZero.html"),

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

    // Blank titles are removed from the DOM
    path.join(testRoot, "page_title_valid_ruleunit","Title-empty.html"),
    path.join(testRoot, "page_title_valid_ruleunit", "Title-invalidSpaces.html"),
    path.join(testRoot, "style_color_misuse_ruleunit", "D543.html"),
    path.join(testRoot, "style_before_after_review_ruleunit", "D100.html"),

    // TODO: temprarily ignore till the issue is resolved: https://github.com/IBMa/equal-access/issues/1932
    path.join(testRoot, "aria_attribute_conflict_ruleunit","aria-hidden.html"),
    path.join(testRoot, "aria_search_label_unique_ruleunit", "search_hidden.html"),
    path.join(testRoot, "aria_accessiblename_exists_ruleunit", "element_hidden_by_clippath.html"),

    // Puppeteer and embedded-chrome @media css behave differently (?)
    path.join(testRoot, "element_orientation_unlocked_ruleunit","act-fail4.html"),
    path.join(testRoot, "element_orientation_unlocked_ruleunit","act-pass3.html"),
    path.join(testRoot, "target_spacing_sufficient_ruleunit","link_text.html"),
    path.join(testRoot, "target_spacing_sufficient_ruleunit","element_inline2.html"),
    path.join(testRoot, "target_spacing_sufficient_ruleunit","link_inline_with_block.html"),

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
describe("Rule Unit Tests As Content", function () {
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
                it('a11y scan should match expected value', function (done) {
                    this.timeout(0);
                    // Extract the unitTestcase data file from the unitTestcase hash map.
                    // This will contain the full content of the testcase file. Includes the document
                    // object also.
                    let unitTestDataFileContent = unitTestcaseHTML[unitTestFile];
                    let actualMap = {};
                    let report = null;
                    let browser = null;
                    let puppeteer = null;
                    // Perform the accessibility scan using the IBMaScan Wrapper
                    aChecker.getCompliance(unitTestDataFileContent, "Content_" + unitTestFile)
                        .then((result) => {
                            if (!result || !result.report) {
                                try { expect(false).to.equal(true, "\nWas unable to scan: " + unitTestFile); } catch (e) { return Promise.reject(e); }
                            }
                            report = result.report;
                            browser = result.webdriver;
                            puppeteer = result.puppeteer;
                        })
                        .then(async () => {
                            let evalStr = `{
                                "legacyExpectedInfo": typeof(OpenAjax) !== 'undefined' && OpenAjax && OpenAjax.a11y && OpenAjax.a11y.ruleCoverage,
                                "expectedInfo": typeof(UnitTest) !== 'undefined' && UnitTest
                            }`
                            if (browser) {
                                return browser.executeScript(`return ${evalStr}`)
                            } else if (puppeteer) {
                                return puppeteer.evaluate(() => {
                                    return {
                                        legacyExpectedInfo: (typeof(OpenAjax) !== 'undefined' && OpenAjax && OpenAjax.a11y && OpenAjax.a11y.ruleCoverage),
                                        expectedInfo: (typeof(UnitTest) !== 'undefined' && UnitTest)
                                    }
                                })
                            }
                        })
                        .then((unitTestInfo) => {
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
                                expect(filtReport).to.eql(expectedInfo.results);
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
                                expect(actualInfo).to.eql(expectedInfo);
                            }
                        })
                        .then(() => {
                            done();
                        })
                        .catch((e) => {
                            done(e);
                        })
                });
            });
        }(unitTestFile));
    }
});
