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

import { IFS } from "../api-ext/IFS";
import { IConfigInternal, eRuleLevel } from "../config/IConfig";
import { IBaselineReport, IBaselineResult, IEngineReport, IRuleset, eRuleConfidence } from "../engine/IReport";
import { ACReporterCSV } from "./ACReporterCSV";
import { ACReporterHTML } from "./ACReporterHTML";
import { ACReporterJSON } from "./ACReporterJSON";
import { ACReporterXLSX } from "./ACReporterXLSX";

export interface IReporterStored {
    startScan: number,
    url: string,
    pageTitle: string,
    label: string,
    engineReport: IBaselineReport
}

export interface IReporter {
    generateReport(config: IConfigInternal, rulesets: IRuleset[], reportData: IReporterStored) : { reportPath: string, report: string } | void;
    generateSummary(config: IConfigInternal, rulesets: IRuleset[], endReport: number, summaryData: IReporterStored[]): Promise<{ summaryPath: string, summary: string | Buffer } | void>;
};

/**
 * This interface is responsible for aChecker reporters which will be used to: collect scan results
 * generate the results to a particular format per file, and generate a final summary
 */
export class ReporterManager {
    private config: IConfigInternal;
    private rulesets: IRuleset[];
    private fs: IFS;
    private reporters: IReporter[] = [];
    private reports: IReporterStored[] = []

    constructor(fs: IFS, config: IConfigInternal, rulesets: IRuleset[]) {
        this.fs = fs;
        this.config = config;
        this.rulesets = rulesets;
        if (!this.config.outputFormat.includes("disable")) {
            if (config.outputFormat.includes("json")) {
                this.reporters.push(new ACReporterJSON());
            }
            if (config.outputFormat.includes("html")) {
                this.reporters.push(new ACReporterHTML())
            }
            if (config.outputFormat.includes("csv")) {
                this.reporters.push(new ACReporterCSV());
            }
            if (config.outputFormat.includes("xlsx")) {
                this.reporters.push(new ACReporterXLSX());
            }
        }
    }

    public addEngineReport(startScan: number, url: string, pageTitle: string, label: string, engineReport: IEngineReport, baselineReport?: IBaselineReport) {
        if (this.reporters.length > 0) {
            let filteredReport = this.filterReport(engineReport, baselineReport);
            this.reports.push({
                startScan,
                url,
                pageTitle,
                label,
                engineReport: filteredReport
            });
            for (const reporter of this.reporters) {
                let reportInfo = reporter.generateReport(this.config, this.rulesets, {
                    startScan,
                    url,
                    pageTitle,
                    label,
                    engineReport: filteredReport
                });
                if (reportInfo) {
                    let { reportPath, report } = reportInfo;
                    this.fs.writeFileSync(reportPath, report);
                }
            }
        }
    }

    public async generateSummaries(endReport?: number) {
        for (const reporter of this.reporters) {
            let summaryInfo = await reporter.generateSummary(this.config, this.rulesets, endReport || new Date().getTime(), this.reports);
            if (summaryInfo) {
                let { summaryPath, summary } = summaryInfo;
                if (summaryPath && summary) {
                    this.fs.writeFileSync(summaryPath, summary);
                }
            }
        }
    }

    private filterReport(engineResult: IEngineReport, baselineReport?: IBaselineReport): IBaselineReport {
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
            let reportLevel : eRuleLevel;
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
        retVal.summary.counts = this.getCounts(retVal);
        
        retVal.results = retVal.results.filter(pageResult => {
            if (this.config.reportLevels.includes(pageResult.level)) {
                keepNlsKeys[pageResult.ruleId] = keepNlsKeys[pageResult.ruleId] || {
                    "0": true
                }
                keepNlsKeys[pageResult.ruleId][pageResult.reasonId] = true;
                if (pageResult.message.length > 32000) {
                    pageResult.message = pageResult.message.substring(0, 32000-3)+"...";
                }
                if (pageResult.snippet.length > 32000) {
                    pageResult.snippet = pageResult.snippet.substring(0, 32000-3)+"...";
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

    private getCounts(engineReport: IBaselineReport) {
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
};
