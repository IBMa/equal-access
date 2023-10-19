import * as fs from "fs"; // file system
import * as path from "path";
import { getCompliance, ruleIdToLegacyId, getConfig, close } from "../../../../src/index";
import * as ace from "../../../../../accessibility-checker-engine/dist/ace-node.js";
const unitTestcaseHTML = {};
const testRootDir = path.join(process.cwd(), "..", "..", "..", "accessibility-checker-engine","test","v2","checker","accessibility","rules");
const gdirs = fs.readdirSync(testRootDir);

// gdirs = [
//     "style_color_misuse_ruleunit",
//     "a_text_purpose_ruleunit",
//     "style_before_after_review_ruleunit"]

const mapRuleToG = ruleIdToLegacyId;

let mapGToRule = {}
for (const key in mapRuleToG) {
    mapGToRule[mapRuleToG[key]] = key;
}

// Determine which rules are in policy
let validList = {};
let policyMap = {};
const checker = new ace.Checker();
before(async function () {
    let config = await getConfig();
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

after(async () => {
    // await browser.close();
})

gdirs.forEach(function (gdir) {
    var gdir = path.join(testRootDir, gdir)
    if (fs.lstatSync(gdir).isDirectory()) {
        var files = fs.readdirSync(gdir);
        files.forEach(function (f) {
            var fileExtension = f.substr(f.lastIndexOf('.') + 1);
            if (fileExtension === 'html' || fileExtension === 'htm') {
                var f = path.join(gdir, f);
                unitTestcaseHTML[f] = fs.readFileSync(f, 'utf8');
            };
        });
    }
});


// Skip test cases that don't work in this environment (e.g., can't disable meta refresh in chrome)
var skipList = [
    //not in karma conf file
    path.join(testRootDir, "a_text_purpose_ruleunit", "A-hasTextEmbedded.html"),
    // path.join(testRootDir, "a_text_purpose_ruleunit", "A-nonTabable.html"),

    // Meta refresh
    path.join(testRootDir, "meta_refresh_delay_ruleunit", "Meta-invalidRefresh.html"),
    path.join(testRootDir, "meta_refresh_delay_ruleunit", "Meta-validRefresh.html"),
    path.join(testRootDir, "meta_redirect_optional_ruleunit", "Meta-RefreshZero.html"),

    // CSS test issues
    path.join(testRootDir, "style_color_misuse_ruleunit","D543.html"),
    path.join(testRootDir, "style_before_after_review_ruleunit","D100.html"),

    // Misc
    // path.join(testRootDir, "aria_banner_label_unique_ruleunit", "validLandMarks-testCaseFromAnn.html"),
]

var skipMap = {}
skipList.forEach(function (skip) {
    skipMap[skip] = true;
});

// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("Rule Unit Tests from WebdriverIO", function () {
    after(() => {
        close();
    });

    // Variable Decleration
    var originalTimeout;
    // let count = 10;
    // Loop over all the unitTestcase html/htm files and perform a scan for them
    for (var unitTestFile in unitTestcaseHTML) {
        if (unitTestFile in skipMap) continue;
        console.log(unitTestFile);
        // if (count-- < 0) continue;
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
                it('a11y scan should match expected value', async () => {
                    await browser.url("file://" + unitTestFile);

                    let report = null;
                    // Perform the accessibility scan using the IBMaScan Wrapper
                    let result = await getCompliance(browser, "WDIO_" + unitTestFile);console.log("report=" + JSON.stringify(result.report));
                    if (!result || !result.report) {
                        try { expect(false).toEqual(true); } catch (e) { 
                            console.error("\nWas unable to scan: " + unitTestFile);
                            return Promise.reject(e); }
                    }
                    report = result.report;
                    let unitTestInfo = await browser.execute(() => ({
                        legacyExpectedInfo: (typeof ((window as any).OpenAjax) !== 'undefined' && (window as any).OpenAjax && (window as any).OpenAjax.a11y && (window as any).OpenAjax.a11y.ruleCoverage),
                        expectedInfo: (typeof ((window as any).UnitTest) !== 'undefined' && (window as any).UnitTest)
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



