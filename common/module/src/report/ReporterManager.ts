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

import { IAbstractAPI } from "../api-ext/IAbstractAPI";
import { IConfigInternal, eRuleLevel } from "../config/IConfig";
import { IBaselineReport, IEngineReport, IRuleset, eRuleConfidence } from "../engine/IReport";
import { ACReporterMetrics } from "./ACReporterMetrics";
import { ACReporterCSV } from "./ACReporterCSV";
import { ACReporterHTML } from "./ACReporterHTML";
import { ACReporterJSON } from "./ACReporterJSON";
import { ACReporterXLSX } from "./ACReporterXLSX";

export interface IReporterStored {
    startScan: number,
    url: string,
    pageTitle: string,
    label: string,
    scanProfile: string,
    engineReport: IBaselineReport
}

export interface IReporter {
    generateReport(config: IConfigInternal, rulesets: IRuleset[], reportData: IReporterStored): { reportPath: string, report: string } | void;
    generateSummary(config: IConfigInternal, rulesets: IRuleset[], endReport: number, summaryData: IReporterStored[]): Promise<{ summaryPath: string, summary: string | Buffer } | void>;
};

/**
 * This interface is responsible for aChecker reporters which will be used to: collect scan results
 * generate the results to a particular format per file, and generate a final summary
 */
export class ReporterManager {
    private static config: IConfigInternal;
    private static rulesets: IRuleset[];
    private static absAPI: IAbstractAPI;
    private static reporters: IReporter[] = [];
    private static reports: IReporterStored[] = []
    private static usedLabels = {};
    private static returnReporter = new ACReporterJSON();

    public static initialize(config: IConfigInternal, absAPI: IAbstractAPI, rulesets: IRuleset[]) {
        ReporterManager.config = config;
        ReporterManager.absAPI = absAPI;
        ReporterManager.rulesets = rulesets;
        ReporterManager.reporters.push(new ACReporterMetrics(config.toolName, config.policies));

        if (!config.outputFormat.includes("disable")) {
            if (config.outputFormat.includes("json")) {
                ReporterManager.reporters.push(new ACReporterJSON());
            }
            if (config.outputFormat.includes("html")) {
                ReporterManager.reporters.push(new ACReporterHTML())
            }
            if (config.outputFormat.includes("csv")) {
                ReporterManager.reporters.push(new ACReporterCSV());
            }
            if (config.outputFormat.includes("xlsx")) {
                ReporterManager.reporters.push(new ACReporterXLSX());
            }
        }
    }

    public static setConfig(config: IConfigInternal) {
        ReporterManager.generateSummaries();
        ReporterManager.config = config;
        ReporterManager.reporters = [];
        ReporterManager.reporters.push(new ACReporterMetrics(config.toolName, config.policies));
        if (!config.outputFormat.includes("disable")) {
            if (config.outputFormat.includes("json")) {
                ReporterManager.reporters.push(new ACReporterJSON());
            }
            if (config.outputFormat.includes("html")) {
                ReporterManager.reporters.push(new ACReporterHTML())
            }
            if (config.outputFormat.includes("csv")) {
                ReporterManager.reporters.push(new ACReporterCSV());
            }
            if (config.outputFormat.includes("xlsx")) {
                ReporterManager.reporters.push(new ACReporterXLSX());
            }
        }
    }

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
    public static stringifyResults(reportP: IBaselineReport): string {
        if (!(reportP as any).results) {
            return `ERROR: ${JSON.stringify(reportP)}`;
        }
        const report = reportP as IBaselineReport;
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

    public static addEngineReport(scanProfile: string, startScan: number, url: string, pageTitle: string, label: string, engineReport: IEngineReport, baselineReport?: IBaselineReport): IBaselineReport {
        ReporterManager.verifyLabel(label);
        ReporterManager.usedLabels[label] = true;
        let filteredReport = ReporterManager.filterReport(engineReport, baselineReport);
        if (ReporterManager.reporters.length > 0) {
            ReporterManager.reports.push({
                startScan,
                url,
                pageTitle,
                scanProfile,
                label,
                engineReport: filteredReport
            });
            for (const reporter of ReporterManager.reporters) {
                let reportInfo = reporter.generateReport(ReporterManager.config, ReporterManager.rulesets, {
                    startScan,
                    url,
                    pageTitle,
                    label,
                    scanProfile,
                    engineReport: filteredReport
                });
                if (reportInfo) {
                    let { reportPath, report } = reportInfo;
                    ReporterManager.absAPI.writeFileSync(reportPath, report);
                }
            }
        }
        let retVal = ReporterManager.returnReporter.generateReport(ReporterManager.config, ReporterManager.rulesets, {
            startScan,
            url,
            pageTitle,
            label,
            scanProfile,
            engineReport: filteredReport
        });
        if (retVal) return JSON.parse(retVal.report);
    }

    public static async generateSummaries(endReport?: number) {
        for (const reporter of ReporterManager.reporters) {
            let summaryInfo = await reporter.generateSummary(ReporterManager.config, ReporterManager.rulesets, endReport || new Date().getTime(), ReporterManager.reports);
            if (summaryInfo) {
                let { summaryPath, summary } = summaryInfo;
                if (summaryPath && summary) {
                    ReporterManager.absAPI.writeFileSync(summaryPath, summary);
                }
            }
        }
    }

    private static filterReport(engineResult: IEngineReport, baselineReport?: IBaselineReport): IBaselineReport {
        let ignoreLookup = {}
        if (baselineReport) {
            for (const issue of baselineReport.results) {
                ignoreLookup[issue.path.dom] = ignoreLookup[issue.path.dom] || {}
                ignoreLookup[issue.path.dom][issue.ruleId] = ignoreLookup[issue.path.dom][issue.ruleId] || {}
                ignoreLookup[issue.path.dom][issue.ruleId][issue.reasonId] = true;
            }
        }
        let retVal: IBaselineReport = JSON.parse(JSON.stringify(engineResult));

        // Set the config level and filter the results. Make note of which NLS keys we need
        let keepNlsKeys = {}
        retVal.results = retVal.results.map(pageResult => {
            // Fetch the level from the results
            let reportValue = pageResult.value;
            let reportLevel: eRuleLevel;
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

        (retVal as any).summary = {};
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

    private static getCounts(engineReport: IBaselineReport) {
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

    private static isLabelUnique(label: string): boolean {
        return !(label in ReporterManager.usedLabels);
    }

    private static verifyLabel(label: string) {
        // In the case that the label is null or undefined, throw an error using the karma API
        // console.error with the message of the error.
        if (label === null || typeof label === "undefined" || label === undefined) {

            // Variable Decleration
            let testcaseWhichIsMissingRequiredLabel = null;
            let generalErrorMessageLabelNotUnique = "\n[Error] labelNotProvided: Label must be provided when calling aChecker.getCompliance.";

            // Get the caller of the aChecker.getCompliance function which will be the testcase that is calling this function
            // This way we can make it the error more descriptive and would help the user identify where the issues is.
            // We have to build and throw an Error() object and then using the try/catch to catch this error and then extract the
            // stack and parse it to get the 2nd element in the stack which will be the caller of this function which will be the
            // testcase which called this function.
            try {
                // Throw Error() object
                throw new Error();
            } catch (exception) {
                // Extract the stack trace from the error object and parse it to get the single one caller up which will be the 2nd index
                testcaseWhichIsMissingRequiredLabel = exception.stack.split("\n")[1];

                // Call the Karma error API, to send message to the Karma server that there was an error on the client side
                ReporterManager.absAPI.error("Label was not provided at: " + testcaseWhichIsMissingRequiredLabel + generalErrorMessageLabelNotUnique);
            }
        }

        // Check to make sure that the label that is provided is unique with all the other ones
        // that we have gone through.
        let labelUnique = ReporterManager.isLabelUnique(label);

        // In the case that the label is not unique
        if (!labelUnique) {
            // Variable Decleration dependencies/tools-rules-html/v2/a11y/test/g471/Table-DataNoSummaryARIA.html
            let testcaseDoesNotUseUniqueLabel = null;
            let generalErrorMessageLabelNotUnique = "\n[Error] labelNotUnique: Label provided to aChecker.getCompliance should be unique across all testcases in a single accessibility-checker session.";

            // Get the caller of the aChecker.getCompliance function which will be the testcase that is calling this function
            // This way we can make it the error more descriptive and would help the user identify where the issues is.
            // We have to build and throw an Error() object and then using the try/catch to catch this error and then extract the
            // stack and parse it to get the 2nd element in the stack which will be the caller of this function which will be the
            // testcase which called this function.
            try {
                // Throw Error() object
                throw new Error();
            } catch (exception) {
                // Extract the stack trace from the error object and parse it to get the single one caller up which will be the 2nd index
                testcaseDoesNotUseUniqueLabel = exception.stack.split("\n")[1];

                // Call the Karma error API, to send message to the Karma server that there was an error on the client side
                ReporterManager.absAPI.error("Label \"" + label + "\" provided at: " + testcaseDoesNotUseUniqueLabel + " is not unique." + generalErrorMessageLabelNotUnique);
            }
        }
    }
};
