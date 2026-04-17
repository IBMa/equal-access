/******************************************************************************
     Copyright:: 2026- IBM, Inc

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

/*******************************************************************************
 * NAME: ACHelper.js
 * DESCRIPTION: Used by vitest-accessibility-checker to load all the core a11y 
 *              scanning functions into the browser that Vitest launches, including:
 *              - Performing the scan
 *              - Parsing results to make them user friendly
 *              - Comparing with baselines or failing on failon levels
 *******************************************************************************/

const ReporterManager = require('./common/report/ReporterManager');
const BaselineManager = require('./common/report/BaselineManager');

// Access Vitest's global config
let aChecker = {
    "Config": window.__vitest_accessibility_checker_config__ || {}
};

!(function () {
    // Specify if debug information should be printed or not
    aChecker.DEBUG = aChecker.Config.DEBUG;

    /**
     * This function is responsible for performing a scan based on the context provided
     * 
     * @param {(HTMLElement|Document)} content - Provide the context to scan
     * @param {String} label - Provide a label for the scan that is being performed
     * @param {Function} callback - Optional callback function (for backward compatibility)
     * 
     * @return {Promise<Object>} - Returns a promise with the scan results
     * 
     * PUBLIC API
     */
    aChecker.getCompliance = function (content, label, callback, errCallback) {
        if (callback) {
            aChecker.getComplianceHelper(content, label)
                .then(function (result) {
                    callback(result.report, result.webdriver);
                })
                .catch((err) => {
                    console.error(err);
                    errCallback && errCallback(err);
                })
        } else {
            return aChecker.getComplianceHelper(content, label);
        }
    }

    aChecker.getComplianceHelper = async function (content, label) {
        aChecker.DEBUG && console.log("START 'aChecker.getComplianceHelper' function");

        // Validate label
        if (label === null || typeof label === "undefined" || label === undefined) {
            let testcaseWhichIsMissingRequiredLabel = null;
            let generalErrorMessageLabelNotProvided = "\n[Error] labelNotProvided: Label must be provided when calling aChecker.getCompliance.";

            try {
                throw new Error();
            } catch (exception) {
                testcaseWhichIsMissingRequiredLabel = exception.stack.split("\n")[1];
                throw new Error("Label was not provided at: " + testcaseWhichIsMissingRequiredLabel + generalErrorMessageLabelNotProvided);
            }
        }

        // Check label uniqueness
        let labelUnique = aChecker.isLabelUnique(label);
        if (!labelUnique) {
            let testcaseDoesNotUseUniqueLabel = null;
            let generalErrorMessageLabelNotUnique = "\n[Error] labelNotUnique: Label provided to aChecker.getCompliance should be unique across all testcases in a single vitest-accessibility-checker session.";

            try {
                throw new Error();
            } catch (exception) {
                testcaseDoesNotUseUniqueLabel = exception.stack.split("\n")[1];
                throw new Error("Label \"" + label + "\" provided at: " + testcaseDoesNotUseUniqueLabel + " is not unique." + generalErrorMessageLabelNotUnique);
            }
        }

        let policies = aChecker.Config.policies;
        let result = null;

        try {
            // Handle single node (HTMLElement)
            if (content.nodeType === 1) {
                result = await aChecker.runScan(content, policies, null, content.ownerDocument.title, label, null);
            }
            // Handle document
            else if (content.nodeType === 9) {
                result = await aChecker.runScan(content, policies, null, content.title, label, null);
            }
            else {
                throw new Error("Unsupported content type. Please provide an HTMLElement or Document.");
            }
        } catch (err) {
            console.error(err);
            throw err;
        }

        aChecker.DEBUG && console.log("END 'aChecker.getCompliance' function");
        return result;
    };

    aChecker.getRulesets = () => new ace.Checker().rulesets;
    
    aChecker.getRulesSync = () => {
        let checker = new ace.Checker();
        let retVal = [];
        for (const ruleId in checker.engine.ruleMap) {
            retVal.push(checker.engine.ruleMap[ruleId]);
        }
        return retVal;
    }

    /**
     * Run the accessibility scan
     * 
     * @param {(HTMLElement|Document)} content - Content to scan
     * @param {Array} policies - List of policies to run
     * @param {String} url - Page URL
     * @param {String} pageTitle - Page title
     * @param {String} label - Scan label
     * @param {Object} iframeWindow - Iframe window if applicable
     * 
     * @return {Promise<Object>} - Scan results
     * 
     * PRIVATE METHOD
     */
    aChecker.runScan = async function (content, policies, url, pageTitle, label, iframeWindow) {
        try {
            const valueToLevel = (reportValue) => {
                let reportLevel;
                if (reportValue[1] === "PASS") {
                    reportLevel = "pass";
                }
                else if ((reportValue[0] === "VIOLATION" || reportValue[0] === "RECOMMENDATION") && reportValue[1] === "MANUAL") {
                    reportLevel = "manual";
                }
                else if (reportValue[0] === "VIOLATION") {
                    if (reportValue[1] === "FAIL") {
                        reportLevel = "violation";
                    }
                    else if (reportValue[1] === "POTENTIAL") {
                        reportLevel = "potentialviolation";
                    }
                }
                else if (reportValue[0] === "RECOMMENDATION") {
                    if (reportValue[1] === "FAIL") {
                        reportLevel = "recommendation";
                    }
                    else if (reportValue[1] === "POTENTIAL") {
                        reportLevel = "potentialrecommendation";
                    }
                }
                return reportLevel;
            }

            const getCounts = (engineReport) => {
                let counts = {
                    violation: 0,
                    potentialviolation: 0,
                    recommendation: 0,
                    potentialrecommendation: 0,
                    manual: 0,
                    pass: 0
                }
                for (const issue of engineReport.results) {
                    ++counts[issue.level];
                }
                return counts;
            }

            const startScan = Date.now();

            if (policies) {
                curPol = JSON.parse(JSON.stringify(policies));
            }
            
            let checker = new ace.Checker();
            let engineReport = await checker.check(content, policies);
            
            for (const result of engineReport.results) {
                delete result.node;
                result.level = valueToLevel(result.value)
            }
            
            let reportLevels = (aChecker.Config.reportLevels || []).concat(aChecker.Config.failLevels || []).map(lvl => lvl.toString());
            engineReport.summary ||= {};
            engineReport.summary.counts ||= getCounts(engineReport);
            
            // Filter out pass results unless they asked for them in reports
            engineReport.results = engineReport.results.filter(result => reportLevels.includes(result.level) || result.level !== "pass");            

            ReporterManager.config = BaselineManager.config = aChecker.Config;

            if (engineReport && engineReport.results) {
                for (const issue of engineReport.results) {
                    issue.help = ReporterManager.getHelpUrl(issue);
                }
            }

            let filteredReport = ReporterManager.filterReport(engineReport, label);
            let { report } = ReporterManager.generateReport(aChecker.Config, null, {
                startScan,
                url: url || window.location.href,
                pageTitle,
                label,
                engineReport: filteredReport
            })

            return {
                "report": report,
                "iframe": iframeWindow
            };
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    };

    /**
     * Check if the provided label is unique
     * 
     * @param {String} label - Label to check
     * @return {boolean} - true if unique, false otherwise
     * 
     * PRIVATE METHOD
     */
    aChecker.isLabelUnique = function (label) {
        return ReporterManager.isLabelUnique(label);
    };

    /**
     * Compare scan results with baseline or check against failLevels
     * 
     * @param {Object} actualResults - Actual scan results
     * @return {int} - 0 if matches baseline, 1 if doesn't match, 2 if fails on failLevels, -1 on exception
     * 
     * PUBLIC API
     */
    aChecker.assertCompliance = function (actualResults) {
        return BaselineManager.assertCompliance(actualResults);
    };

    /**
     * Check if issues fall into failLevels
     * 
     * @param {Object} report - Scan report
     * @return {int} - 1 if issue found in failLevels, -1 on exception
     * 
     * PRIVATE METHOD
     */
    aChecker.compareBasedOnFailLevels = function (report) {
        return BaselineManager.compareBasedOnFailLevels(report);
    };

    /**
     * Compare actual with expected and return differences
     * 
     * @param {Object} actual - Actual results
     * @param {Object} expected - Expected results
     * @param {boolean} clean - Whether to clean objects before compare
     * @return {Object} - Array of differences
     * 
     * PUBLIC API
     */
    aChecker.diffResultsWithExpected = function (actual, expected, clean) {
        return BaselineManager.diffResultsWithExpected(actual, expected, clean);
    };

    /**
     * Clean compliance object before comparison
     * 
     * @param {Object} objectToClean - Object to clean
     * @return {Object} - Cleaned object
     * 
     * PRIVATE METHOD
     */
    aChecker.cleanComplianceObjectBeforeCompare = function (objectToClean) {
        return BaselineManager.cleanComplianceObjectBeforeCompare(objectToClean);
    };

    /**
     * Get baseline for a label
     * 
     * @param {String} label - Label to get baseline for
     * @return {Object} - Baseline object
     * 
     * PUBLIC API
     */
    aChecker.getBaseline = function (label) {
        return BaselineManager.getBaseline(label);
    };

    /**
     * Get diff results for a label
     * 
     * @param {String} label - Label to get diff for
     * @return {Object} - Diff results
     * 
     * PUBLIC API
     */
    aChecker.getDiffResults = function (label) {
        return BaselineManager.getDiffResults(label);
    };

    /**
     * Stringify scan results for display
     * 
     * @param {Object} report - Report to stringify
     * @return {String} - String representation
     * 
     * PUBLIC API
     */
    aChecker.stringifyResults = function (report) {
        return ReporterManager.stringifyResults(report);
    };

    /**
     * Close and finalize reports
     * 
     * PUBLIC API
     */
    aChecker.close = async function() {
        if (ReporterManager) {
            await ReporterManager.onRunComplete();
        }
    };

})();

// Export for use in Vitest tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = aChecker;
}

// Also make available globally for browser context
if (typeof window !== 'undefined') {
    window.aChecker = aChecker;
}


