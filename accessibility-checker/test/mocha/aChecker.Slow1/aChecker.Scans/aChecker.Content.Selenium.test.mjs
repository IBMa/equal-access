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
// var userBrowser = process.env.USER_BROWSER || "CHROME";
import * as fs from "fs";
import * as path from "path";
import * as aChecker from "../../../../src/mjs/index.js";
import ace from "../../../../../accessibility-checker-engine/dist/ace-node.js";
import { expect } from "chai";
import { Builder, Capabilities } from "selenium-webdriver";
import { loadSeleniumTestFile } from "../../util/Util.js";

let userBrowser = process.env.USER_BROWSER || "CHROME";

/** var fs = require("fs");
var path = require("path");
var unitTestcaseHTML = {};
var aChecker = require("../../../../src");
const ace = require("../../../../../accessibility-checker-engine/dist/ace-node");
const { loadSeleniumTestFile } = require("../../util/Util");
var testRootDir = path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules");
var gdirs = fs.readdirSync(testRootDir);
*/
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

let browser;
if (userBrowser.toUpperCase() === "FIREFOX") {
    before(function (done) {
        try {
            this.timeout(10000);
            browser = new Builder()
                .forBrowser('firefox')
                .usingServer('http://localhost:4444/wd/hub')
                .build();
            expect(typeof browser).to.not.equal("undefined");
            done();
        } catch (e) {
            console.log(e);
        }
    })
} else if (userBrowser.toUpperCase() === "CHROME") {
    before(function (done) {
        //this.timeout(10000);
        //(async () => {
        //    try {
    /**            chrome.setDefaultService(service);
            } catch (e) { }
        try {
            this.timeout(10000);
            var spath = require('chromedriver').path;
            spath = path.join(spath, "..");
            spath = path.join(spath, "..");
            spath = path.join(spath, "..");
            spath = path.join(spath, "bin");
            spath = path.join(spath, "chromedriver");

            var service = new chrome.ServiceBuilder(spath).build();
            const options = new chrome.Options();
            options.addArguments("--disable-dev-shm-usage");
            options.addArguments("--headless=new");
            options.addArguments('--ignore-certificate-errors')
            try {
                // setDefaultService function is removed since web-driver v4.3.1+
                //chrome.setDefaultService(service);
                chrome.Driver.createSession(options, service);
            } catch (e) {}
            

            browser = new webdriver.Builder()
                .withCapabilities(webdriver.Capabilities.chrome())
                .setChromeOptions(options)
                .build();

            browser.manage().window().setRect({ x: 0, y: 0, width: 13666, height: 784 });
            expect(typeof browser).to.not.equal("undefined");
            done();
        } catch (e) {
            console.log(e);
        }
     */       
                const chrome = await import('selenium-webdriver/chrome.js');
                const chromedriver = await import('chromedriver');
                let spath = chromedriver.path;
                spath = path.join(spath, "..");
                spath = path.join(spath, "..");
                spath = path.join(spath, "..");
                spath = path.join(spath, "bin");
                spath = path.join(spath, "chromedriver");

                try {
                    const service = new chrome.ServiceBuilder(spath).build();
                    // setDefaultService function is removed since web-driver v4.3.1+
                    //chrome.setDefaultService(service);
                    chrome.Driver.createSession(options, service);
                } catch (e) {}
                const options = new chrome.Options();
                options.addArguments("--disable-dev-shm-usage");
                options.addArguments("--headless=new");
                options.addArguments('--ignore-certificate-errors')

                browser = new Builder()
                    .withCapabilities(Capabilities.chrome())
                    .setChromeOptions(options)
                    .build();
                    
                browser.manage().window().setRect({x: 0, y:0, width: 13666, height: 784});
                expect(typeof browser).to.not.equal("undefined");
                done();
            } catch (e) {
                console.log(e);
            }
        })();
    })
}

after(function (done) {
    browser.quit().then(done);
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

    // CSS test issues
    path.join(testRoot, "style_color_misuse_ruleunit", "D543.html"),
    path.join(testRoot, "style_before_after_review_ruleunit", "D100.html"),

    // Misc
    path.join(testRoot, "aria_banner_label_unique_ruleunit", "validLandMarks-testCaseFromAnn.html")
]

let skipMap = {}
skipList.forEach(function (skip) {
    skipMap[skip] = true;
});

// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("Rule Unit Tests from Selenium", function () {
    after(() => {
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
            describe("Load Test: " + unitTestFile, function () {

                // The Individual testcase for each of the unittestcases.
                // Note the done that is passed in, this is used to wait for asyn functions.
                it('a11y scan should match expected value', function (done) {
                    this.timeout(0);

                    /** var regex = "test.*html?$";
                    loadSeleniumTestFile(browser, unitTestFile).then(function () {
                    */
                    let regex = "test.*html?$";

                    browser.get("file://" + unitTestFile).then(function () {
                        let report = null;
                        // Perform the accessibility scan using the IBMaScan Wrapper
                        aChecker.getCompliance(browser, "Selenium_" + unitTestFile)
                            .then((result) => {
                                if (!result || !result.report) {
                                    try { expect(false).to.equal(true, "\nWas unable to scan: " + unitTestFile); } catch (e) { return Promise.reject(e); }
                                }
                                report = result.report;
                            })
                            .then(async () => {
                                return browser.executeScript(
                                    `return {
                                            legacyExpectedInfo: (typeof (window.OpenAjax) !== 'undefined' && window.OpenAjax && window.OpenAjax.a11y && window.OpenAjax.a11y.ruleCoverage),
                                            expectedInfo: (typeof (window.UnitTest) !== 'undefined' && window.UnitTest)
                                        }`);
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
            });
        }(unitTestFile));
    }
});
