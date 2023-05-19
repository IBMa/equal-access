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
import { expect } from "chai";
import { Builder, Capabilities } from "selenium-webdriver";
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let userBrowser = process.env.USER_BROWSER || "CHROME";
let unitTestcaseHTML = {};

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
    });
} else if (userBrowser.toUpperCase() === "CHROME") {
    before(function (done) {
        this.timeout(10000);
        (async () => {
            try {
                const chrome = (await import('selenium-webdriver/chrome.js'));
                const chromedriver = (await import("chromedriver"));
                let spath;
                if (process.platform !== 'win32'){
                    spath = chromedriver.path;
                    spath = path.join(spath, "..");
                    spath = path.join(spath, "..");
                    spath = path.join(spath, "..");
                    spath = path.join(spath, "bin");
                    spath = path.join(spath, "chromedriver");
                }
                else {
                    spath = chromedriver.path;
                }
                let service = new chrome.ServiceBuilder(spath).build();
                chrome.setDefaultService(service);

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

let files = ["JSONObjectStructureVerificationSelenium.html"];
files.forEach(function (f) {
    let fileExtension = f.substr(f.lastIndexOf('.') + 1);
    if (fileExtension === 'html' || fileExtension === 'htm') {
        f = path.join(__dirname, f);
        unitTestcaseHTML[f] = fs.readFileSync(f, 'utf8');
    };
});

// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("JSON Structure Verification Selenium", function () {
    after(() => {
        aChecker.close();
    });

    // Variable Decleration
    let originalPolicies;

    // Loop over all the unitTestcase html/htm files and perform a scan for them
    for (let unitTestFile in unitTestcaseHTML) {

        // This function is used to execute for each of the unitTestFiles, we have to use this type of function
        // to allow dynamic creation/execution of the Unit Testcases. This is like forcing an syncronous execution
        // for the testcases. Which is needed to make sure that all the tests run in the same order.
        // For now we do not need to consider threaded execution because over all theses testscases will take at
        // most half 1 sec * # of testcses (500ms * 780)
        (function (unitTestFile) {

            // Description of the test case that will be run.
            describe("Load Test: " + unitTestFile, function () {

                before(async function () {
                    let config = await aChecker.getConfig();
                    originalPolicies = config.policies;
                    config.policies = ["IBM_Accessibility"];
                });

                // The Individual testcase for each of the unittestcases.
                // Note the done that is passed in, this is used to wait for asyn functions.
                it('JSON structure should match baseline for selenium', function (done) {
                    this.timeout(0);

                    let labelName = unitTestFile.substring(Math.max(unitTestFile.lastIndexOf("/"), unitTestFile.lastIndexOf("\\")) + 1);

                    loadSeleniumTestFile(browser, unitTestFile).then(function () {
                        // Decleare the actualMap which will store all the actual xpath results
                        let actualMap = {};
                        // Perform the accessibility scan using the IBMaScan Wrapper
                        aChecker.getCompliance(browser, labelName, function (report, doc) {
                            try {
                                // Make sure that the structure of the result match with expected structure
                                // Fetch the baseline object based on the label provided
                                let expected = aChecker.getBaseline(labelName);
                                
                                // Define the differences with some content as we expect it to be null or undefined if pass
                                let differences = "Something";

                                // Update all the items in the results which dynamically change over scans to the values
                                // already defined in the baseline file.
                                report.ruleTime = expected.ruleTime = 999;
                                report.summary.scanTime = expected.summary.scanTime = 999;
                                report.summary.startScan = expected.summary.startScan = 99999999999;
                                report.scanID = expected.scanID = "uuid";
                                report.toolID = "accessibility-checker-v3.0.0";
                                report.summary.URL = expected.summary.URL = "<URL>"
                                for (const issue of report.results) {
                                    delete issue.ruleTime;
                                    issue.bounds.left = issue.bounds.left && 999;
                                    issue.bounds.top = issue.bounds.top && 999;
                                    issue.bounds.height = issue.bounds.height && 999;
                                    issue.bounds.width = issue.bounds.width && 999;
                                }
                                for (const issue of expected.results) {
                                    delete issue.ruleTime;
                                    issue.bounds.left = issue.bounds.left && 999;
                                    issue.bounds.top = issue.bounds.top && 999;
                                    issue.bounds.height = issue.bounds.height && 999;
                                    issue.bounds.width = issue.bounds.width && 999;
                                }
                                report.results.sort((a,b) => {
                                    let pc = b.path.dom.localeCompare(a.path.dom);
                                    if (pc !== 0) return pc;
                                    return b.ruleId.localeCompare(a.ruleId);
                                })

                                // In the case there are no baseline found then run a different assertion algo,
                                // when there is baseline compare the baselines in the case there is no baseline then
                                // check to make sure there are no violations that are listed in the fails on.
                                if (expected !== null && typeof (expected) !== "undefined") {
                                    expected.results.sort((a,b) => {
                                        let pc = b.path.dom.localeCompare(a.path.dom);
                                        if (pc !== 0) return pc;
                                        return b.ruleId.localeCompare(a.ruleId);
                                    })
                                    // Run the diff algo to get the list of differences
                                    differences = aChecker.diffResultsWithExpected(report, expected, false);
                                }
                                if (typeof differences !== "undefined") {
                                    differences = differences.filter(difference => (
                                        difference.kind !== "E"
                                        || difference.path[2] !== "bounds"
                                        || Math.abs(difference.lhs - difference.rhs) > 2
                                    ))
                                    if (differences.length === 0) {
                                        differences = undefined;
                                    }
                                }
            
                                expect(typeof differences).to.equal("undefined", "\nDoes not follow the correct JSON structure or can't load baselines" + JSON.stringify(differences, null, '  '));

                                // Mark the testcase as done.
                                done();
                            } catch (e) {
                                console.log(e);
                                done(e);
                            }
                        });
                    });
                });

                after(async function () {
                    let config = await aChecker.getConfig();
                    config.policies = originalPolicies;
                });

            });
        }(unitTestFile));
    }
});
