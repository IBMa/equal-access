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

import { IConfigInternal } from "../config/IConfig";
import { IBaselineReport, IEngineReport, IRuleset } from "../engine/IReport";
import { IReporter, IReporterStored } from "./ReportManager";

export class ACReporterJSON implements IReporter {
    public generateReport(config: IConfigInternal, rulesets: IRuleset[], storedReport: IReporterStored): { reportPath: string, report: string } | void {
        let outReport : IBaselineReport= JSON.parse(JSON.stringify(storedReport.engineReport));
        outReport.summary = ACReporterJSON.generateReportSummary(config, rulesets, storedReport);
        delete (outReport as any).totalTime;
        outReport.scanID = config.scanID;
        outReport.toolID = config.toolID;
        outReport.label = storedReport.label;

        return {
            reportPath: `${storedReport.label}.json`,
            report: JSON.stringify(outReport, null, 4)
        };
    }

    public async generateSummary(config: IConfigInternal, _rulesets: IRuleset[], endReport: number, summaryData: IReporterStored[]): Promise<{ summaryPath: string, summary: string | Buffer } | void> {
        if (summaryData && summaryData.length > 0) {
            let retVal = {
                counts: {
                    ignored: 0,
                    violation: 0,
                    recommendation: 0,
                    pass: 0,
                    potentialviolation: 0,
                    potentialrecommendation: 0,
                    manual: 0,
                    elements: 0,
                    elementsViolation: 0,
                    elementsViolationReview: 0
                },
                startReport: summaryData[0].startScan,
                endReport: endReport,
                toolID: config.toolID,
                policies: config.policies,
                reportLevels: config.reportLevels,
                labels: config.label,
                failLevels: config.failLevels,
                scanID: config.scanID,
                pageScanSummary: []
            }
            for (const scan of summaryData) {
                let counts = scan.engineReport.summary.counts;
                retVal.pageScanSummary.push({
                    label: scan.label,
                    counts
                })
                for (const key in counts) {
                    retVal.counts[key] += counts[key];
                }
            }
            let startScan = new Date(summaryData[0].startScan);
            return {
                summaryPath: `summary_${startScan.toISOString()}.json`,
                summary: JSON.stringify(retVal, null, 4)
            };
        }
    }

    public static generateReportSummary(config: IConfigInternal, rulesets: IRuleset[], storedReport: IReporterStored) {
        let { engineReport, startScan, url } = storedReport;
        
        return {
            counts: engineReport.summary.counts,
            scanTime: (engineReport as any).totalTime,
            ruleArchive: config.ruleArchiveLabel,
            policies: config.policies,
            reportLevels: config.reportLevels,
            startScan: startScan,
            URL: url
        }
    }
}