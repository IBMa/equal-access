/******************************************************************************
     Copyright:: 2023- IBM, Inc

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

let eRuleLevel = {
    violation: "violation",
    potentialviolation: "potentialviolation",
    recommendation: "recommendation",
    potentialrecommendation: "potentialrecommendation",
    manual: "manual",
    pass: "pass",
    ignored: "ignored"
}

let eRuleConfidence = {
    PASS: "PASS",
    FAIL: "FAIL",
    POTENTIAL: "POTENTIAL",
    MANUAL: "MANUAL"
}


/**
 *
 */
class ReporterManager {
    static usedLabels = {}
    static config;
    static checker;

    /**
     * This function is responsible for printing the scan results to string with the intent of that going to the console.
     *
     * @param {Object} results - Provide the results from the scan.
     *
     * @return {String} resultsString - String representation of the results/violations.
     *
     * PUBLIC API
     *
     * @memberOf this
     */
    static stringifyResults(reportP) {
        if (!reportP.results) {
            return `ERROR: ${JSON.stringify(reportP)}`;
        }
        const report = reportP;
        // console.log(report);
        // Variable Decleration
        let resultsString = `Scan: ${report.label}\n`;

        // Loop over the reports and build the string version of the the issues within each report
        report.results && report.results.forEach(function (issue) {
            if (ReporterManager.config.reportLevels.includes(issue.level)) {
                // Build string of the issues with only level, messageCode, xpath and snippet.
                resultsString += "- Message: " + issue.message +
                    "\n  Level: " + issue.level +
                    "\n  XPath: " + issue.path.dom +
                    "\n  Snippet: " + issue.snippet +
                    "\n  Help: " + issue.help +
                    "\n";
            }
        });

        return resultsString;
    };

    static getHelpUrl(issue) {
        if (issue.help) return issue.help;
        if (!ReporterManager.checker) {
            ReporterManager.checker = new ace.Checker();
        }
        let config = ReporterManager.config;
        let helpUrl = ReporterManager.checker.engine.getHelp(issue.ruleId, issue.reasonId, !config.ruleArchivePath ? config.ruleArchive : config.ruleArchivePath.substring(config.ruleArchivePath.lastIndexOf("/")+1));
        let minIssue = {
            message: issue.message,
            snippet: issue.snippet,
            value: issue.value,
            reasonId: issue.reasonId,
            ruleId: issue.ruleId,
            msgArgs: issue.messageArgs
        };
        return `${helpUrl}#${encodeURIComponent(JSON.stringify(minIssue))}`
    }

    static filterReport(engineResult, scanLabel) {
        ReporterManager.usedLabels[scanLabel] = true;
        let ignoreLookup = {}
        let baselineReport = aChecker.getBaseline(scanLabel);
        if (baselineReport) {
            for (const issue of baselineReport.results) {
                ignoreLookup[issue.path.dom] = ignoreLookup[issue.path.dom] || {}
                ignoreLookup[issue.path.dom][issue.ruleId] = ignoreLookup[issue.path.dom][issue.ruleId] || {}
                ignoreLookup[issue.path.dom][issue.ruleId][issue.reasonId] = true;
            }
        }
        let retVal = JSON.parse(JSON.stringify(engineResult));

        // Set the config level and filter the results. Make note of which NLS keys we need
        let keepNlsKeys = {}
        retVal.results = retVal.results.map(pageResult => {
            // Fetch the level from the results
            let reportValue = pageResult.value;
            let reportLevel;
            if (reportValue[1] === "PASS") {
                reportLevel = eRuleLevel.pass;
            } else if ((reportValue[0] === "VIOLATION" || reportValue[0] === "RECOMMENDATION") && reportValue[1] === "MANUAL") {
                reportLevel = eRuleLevel.manual;
            } else if (reportValue[0] === "VIOLATION") {
                if (reportValue[1] === "FAIL") {
                    reportLevel = eRuleLevel.violation;
                } else if (reportValue[1] === "POTENTIAL") {
                    reportLevel = eRuleLevel.potentialviolation;
                }
            } else if (reportValue[0] === "RECOMMENDATION") {
                if (reportValue[1] === "FAIL") {
                    reportLevel = eRuleLevel.recommendation;
                } else if (reportValue[1] === "POTENTIAL") {
                    reportLevel = eRuleLevel.potentialrecommendation;
                }
            }
            let ignored = false;
            if (pageResult.value[1] !== eRuleConfidence.PASS && pageResult.path.dom in ignoreLookup && pageResult.ruleId in ignoreLookup[pageResult.path.dom] && ignoreLookup[pageResult.path.dom][pageResult.ruleId][pageResult.reasonId]) {
                ignored = true;
            }
            return {
                ...pageResult,
                ignored,
                level: reportLevel
            }
        });

        retVal.summary = {};
        retVal.summary.counts = ReporterManager.getCounts(retVal);

        retVal.results = retVal.results.filter(pageResult => {
            if (ReporterManager.config.reportLevels.includes(pageResult.level)) {
                keepNlsKeys[pageResult.ruleId] = keepNlsKeys[pageResult.ruleId] || {
                    "0": true
                }
                keepNlsKeys[pageResult.ruleId][pageResult.reasonId] = true;
                if (pageResult.message.length > 32000) {
                    pageResult.message = pageResult.message.substring(0, 32000 - 3) + "...";
                }
                if (pageResult.snippet.length > 32000) {
                    pageResult.snippet = pageResult.snippet.substring(0, 32000 - 3) + "...";
                }
                return true;
            } else {
                return false;
            }
        });

        if (retVal.nls) {
            for (const ruleId in retVal.nls) {
                if (!(ruleId in keepNlsKeys)) {
                    delete retVal.nls[ruleId];
                } else {
                    for (const reasonId in retVal.nls[ruleId]) {
                        if (!(reasonId in keepNlsKeys[ruleId])) {
                            delete retVal.nls[ruleId][reasonId];
                        }
                    }
                }
            }
        }

        return retVal;
    }

    static getCounts(engineReport) {
        let counts = {
            violation: 0,
            potentialviolation: 0,
            recommendation: 0,
            potentialrecommendation: 0,
            manual: 0,
            pass: 0,
            ignored: 0,
            elements: 0,
            elementsViolation: 0,
            elementsViolationReview: 0
        }
        let elementSet = new Set();
        let elementViolationSet = new Set();
        let elementViolationReviewSet = new Set();
        for (const issue of engineReport.results) {
            elementSet.add(issue.path.dom);
            if (issue.ignored) {
                ++counts.ignored;
            } else {
                ++counts[issue.level.toString()];
                if (issue.level === eRuleLevel.violation) {
                    elementViolationSet.add(issue.path.dom);
                    elementViolationReviewSet.add(issue.path.dom);
                } else if (issue.level === eRuleLevel.potentialviolation || issue.level === eRuleLevel.manual) {
                    elementViolationReviewSet.add(issue.path.dom);
                }
            }
        }
        counts.elements = elementSet.size;
        counts.elementsViolation = elementViolationSet.size;
        counts.elementsViolationReview = elementViolationReviewSet.size
        return counts;
    }


    static isLabelUnique(label) {
        return !(label in ReporterManager.usedLabels);
    }

    static generateReport(config, rulesets, storedReport) {
        let outReport = JSON.parse(JSON.stringify(storedReport.engineReport));
        outReport.summary = ReporterManager.generateReportSummary(config, rulesets, storedReport);
        delete outReport.totalTime;
        outReport.scanID = config.scanID;
        outReport.toolID = config.toolID;
        outReport.label = storedReport.label;

        return {
            reportPath: `${storedReport.label}.json`,
            report: outReport
        };
    }

    static generateReportSummary(config, rulesets, storedReport) {
        let { engineReport, startScan, url } = storedReport;
        
        return {
            counts: engineReport.summary.counts,
            scanTime: engineReport.totalTime,
            ruleArchive: config.ruleArchiveLabel,
            policies: config.policies,
            reportLevels: config.reportLevels,
            startScan: startScan,
            URL: url
        }
    }
};
