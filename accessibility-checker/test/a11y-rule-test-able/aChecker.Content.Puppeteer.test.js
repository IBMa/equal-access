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
//Using local checker and location 
import * as aChecker from "../../src/mjs/index.js";
import ace from "../../../accessibility-checker-engine/dist/ace-node.js";
//Using a checker local checker engine 
import { expect } from "chai";
import {fileURLToPath} from 'url';
import * as puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let unitTestcaseHTML = {};
//Location of tests with path so fs can read?
const urlList = fs.readFileSync(path.join(__dirname,"listofURLs.txt")).toString();
console.log(urlList);
const urls = urlList.split(/[\r\n]+/);

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
before(async function () {
    let config = await aChecker.getConfig(); //where are we getting the config from? 
    browser = await puppeteer.launch({ headless: config.headless, ignoreHTTPSErrors: config.ignoreHTTPSErrors || false});
    page = await browser.newPage();
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
})

after(async function () {
    if (browser) {
        await browser.close();
        browser = null;
    }
})

// Skip test cases that don't work in this environment (e.g., can't disable meta refresh in chrome)
let skipList = [

    // Not in Karma Conf Skip list
    // Testcase has a script reference to a file, which traps when loaded as a string
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "Hidden_ruleunit", "unitTestisNodeVisible.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "img_alt_background_ruleunit", "APassedFileWithNoImg.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "blink_css_review_ruleunit", "TextDecoration-Blink.html"),
    // CSS processing errors
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "HAAC_Aria_Native_Host_Semantics_ruleunit", "input_type_test.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "aria_eventhandler_role_valid_ruleunit", "eventHandlerMissingRole2.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "aria_widget_labelled_ruleunit", "menuItemCheckboxNoInnerText.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "style_before_after_review_ruleunit", "D100.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "style_color_misuse_ruleunit", "D543.html"),
    // Can't access referenced files
    // no baseline found
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "aria_banner_label_unique_ruleunit", "validLandMarks-testCaseFromAnn.html"),

    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "img_alt_redundant_ruleunit", "Img-redundantLink.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "input_label_after_ruleunit", "Input-hasLabelBadPlacement.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "input_label_before_ruleunit", "Input-hasLabelBadPlacement.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "element_mouseevent_keyboard_ruleunit", "Events-invalidNoMouseRequired.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "input_label_exists_ruleunit", "D766.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "a_text_purpose_ruleunit", "A-nonTabable.html"),

    //in karma conf file skip list
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "a_text_purpose_ruleunit", "A-hasTextEmbedded.html"),

    // Meta refresh
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "meta_refresh_delay_ruleunit", "Meta-invalidRefresh.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "meta_refresh_delay_ruleunit", "Meta-validRefresh.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "meta_redirect_optional_ruleunit", "Meta-RefreshZero.html"),

    // Blank titles are removed from the DOM
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "page_title_valid_ruleunit","Title-empty.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "page_title_valid_ruleunit","Title-invalidSpaces.html"),
]
let skipMap = {}
skipList.forEach(function (skip) {
    skipMap[skip] = true;
});

// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("Rule Unit Tests As File URL", function () {
    after(() => {
        aChecker.close();
    });

    // Variable Decleration
    let originalTimeout;

    // Loop over all the unitTestcase html/htm files and perform a scan for them
    for (const url of urls) {
        if (url in skipMap) continue;

        // This function is used to execute for each of the unitTestFiles, we have to use this type of function
        // to allow dynamic creation/execution of the Unit Testcases. This is like forcing an syncronous execution
        // for the testcases. Which is needed to make sure that all the tests run in the same order.
        // For now we do not need to consider threaded execution because over all theses testscases will take at
        // most half 1 sec * # of testcses (500ms * 780)
        (function (url) {

            // Description of the test case that will be run.
            describe("Load Test: " + url, function () {

                // The Individual testcase for each of the unittestcases.
                // Note the done that is passed in, this is used to wait for asyn functions.
                it('a11y scan should match expected value', async function () {
                    this.timeout(0);
                    // Extract the unitTestcase data file from the unitTestcase hash map.
                    // This will contain the full content of the testcase file. Includes the document
                    // object also.
                    let actualMap = {};
                    let report = null;
                    let puppeteer = null;
                    await page.goto(url);

                    // Perform the accessibility scan using the IBMaScan Wrapper
                    return aChecker.getCompliance(page, "Puppeteer_" + url)
                        .then((result) => {
                            if (!result || !result.report) {
                                try { expect(false).to.equal(true, "\nWas unable to scan: " + url); } catch (e) { return Promise.reject(e); }
                            }
                            report = result.report;
                            puppeteer = result.puppeteer;
                        })
                        .then(async () => {
                            let evalStr = `{
                                "legacyExpectedInfo": typeof(OpenAjax) !== 'undefined' && OpenAjax && OpenAjax.a11y && OpenAjax.a11y.ruleCoverage,
                                "expectedInfo": typeof(UnitTest) !== 'undefined' && UnitTest
                            }`
                            if (puppeteer) {
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
                });
            });
        }(url));
    }
});
