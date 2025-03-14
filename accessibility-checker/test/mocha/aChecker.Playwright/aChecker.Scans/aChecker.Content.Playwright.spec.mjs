/******************************************************************************
 * Copyright:: 2020- IBM, Inc
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *****************************************************************************/

'use strict';
import { test, expect } from '@playwright/test';
import { chromium } from "playwright";

import * as fs from "fs";
import * as path from "path";
import * as aChecker from "../../../../src/mjs/index.js";
import ace from "../../../../../accessibility-checker-engine/dist/ace-node.js";
import * as Util from '../../util/Util.js';
let unitTestcaseHTML = {};
let testRootDir = path.join(process.cwd(), "..","accessibility-checker-engine","test","v2","checker","accessibility","rules");
let gdirs = fs.readdirSync(testRootDir);

// gdirs = [
//     "style_color_misuse_ruleunit",
//     "a_text_purpose_ruleunit",
//     "style_before_after_review_ruleunit"]

const mapRuleToG = aChecker.ruleIdToLegacyId;

let mapGToRule = {}
for (const key in mapRuleToG) {
    mapGToRule[mapRuleToG[key]] = key;
}

// Determine which rules are in policy
let validList = {};
let policyMap = {};
const checker = new ace.Checker();
let browser;
let page;
test.beforeAll(async function () {
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

    browser = await chromium.launch();
    const context = await browser.newContext({
        ignoreHTTPSErrors: true
    });
    page = await context.newPage();
});

test.afterAll(async () => {
    // await browser.close();
})

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

let testRoot = path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules");
// Skip test cases that don't work in this environment (e.g., can't disable meta refresh in chrome)
let skipList = [
    //not in karma conf file
    path.join(testRoot, "a_text_purpose_ruleunit", "A-hasTextEmbedded.html"),
    path.join(testRoot, "a_text_purpose_ruleunit", "A-nonTabable.html"),

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
    
    // CSS test issues
    path.join(testRoot, "style_color_misuse_ruleunit","D543.html"),
    path.join(testRoot, "style_before_after_review_ruleunit","D100.html"),

    // Misc
    path.join(testRoot, "aria_banner_label_unique_ruleunit", "validLandMarks-testCaseFromAnn.html"),

    path.join(testRoot, "target_spacing_sufficient_ruleunit","link_text.html"),
    path.join(testRoot, "target_spacing_sufficient_ruleunit","element_inline2.html"),
    path.join(testRoot, "target_spacing_sufficient_ruleunit","link_inline_with_block.html")
]

let skipMap = {}
skipList.forEach(function (skip) {
    skipMap[skip] = true;
});

// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
test.describe("Rule Unit Tests from Playwright", function () {
    test.afterAll(() => {
        aChecker.close();
    });

    // Variable Decleration
    let originalTimeout;
    // let count = 10;
    // Loop over all the unitTestcase html/htm files and perform a scan for them
    for (let unitTestFile in unitTestcaseHTML) {
        if (unitTestFile in skipMap) continue;
        // if (count-- < 0) continue;
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
            test.describe("Load Test: " + unitTestFile, function () {

                // The Individual testcase for each of the unittestcases.
                // Note the done that is passed in, this is used to wait for asyn functions.
                test('a11y scan should match expected value', async () => {
                    await Util.default.loadPuppeteerTestFile(page, unitTestFile);
                    
                    let report = null;
                    // Perform the accessibility scan using the IBMaScan Wrapper
                    let result = await aChecker.getCompliance(page, "Playwright_" + unitTestFile);
                    if (!result || !result.report) {
                        try { expect(false).to.equal(true, "\nWas unable to scan: " + unitTestFile); } catch (e) { return Promise.reject(e); }
                    }
                    report = result.report;
                    let unitTestInfo = await page.evaluate(() => ({
                        legacyExpectedInfo: (typeof (window.OpenAjax) !== 'undefined' && window.OpenAjax && window.OpenAjax.a11y && window.OpenAjax.a11y.ruleCoverage),
                        expectedInfo: (typeof (window.UnitTest) !== 'undefined' && window.UnitTest)
                    }));
            
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
                        // console.log(expectedInfo.results);
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
                });
            });
        }(unitTestFile));
    }
});
