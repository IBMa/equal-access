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

/**import { IConfigInternal } from "../config/IConfig";
import { Guideline } from "../engine/IGuideline";
import { CompressedReport } from "../engine/IReport";
import { GenSummReturn, IReporter, ReporterManager } from "./ReporterManager";
*/
import { IConfigInternal } from "../config/IConfig.js";
import { CompressedReport, IRuleset } from "../engine/IReport.js";
import { GenSummReturn, IReporter, ReporterManager } from "./ReporterManager.js";

export class ACReporterCSV implements IReporter {
    public name(): string {
        return "csv";
    }
    private static toCSV = function(str) {
        if (str === null) {
            return '"null"';
        } else if (!str || str.length == 0) {
            return '""';
        } else {
            str = str.replace(/"/g, '""');
            return `"${str}"`;
        }
    }
    
    public generateReport(_reportData) : { reportPath: string, report: string } | void {
    }
    public async generateSummary(config: IConfigInternal, _rulesets: Guideline[], endReport: number, compressedReports: CompressedReport[]): Promise<GenSummReturn> {
        let toCSV = ACReporterCSV.toCSV;
        let resultStr = `Label,Level,RuleId,Message,Xpath,Help\n`;
        let startScan = 0;
        for (const compressedReport of compressedReports) {
            let reportStored = ReporterManager.uncompressReport(compressedReport);
            if (startScan === 0) {
                startScan = reportStored.engineReport.summary.startScan;
            }
            let report = reportStored.engineReport;
            for (const result of report.results) {
                resultStr += `${toCSV(reportStored.label)},${toCSV(result.level)},${toCSV(result.ruleId)},${toCSV(result.message)},${toCSV(result.path.dom)},${toCSV(result.help)}\n`
            }
        }
        let startScanD = new Date(startScan);
        let reportFilename = `results_${startScanD.toISOString().replace(/:/g,"-")}.csv`;
        if (config.outputFilenameTimestamp === false) {
            reportFilename = `results.csv`;
        }
        return {
            summaryPath: reportFilename,
            summary: resultStr
        }
    }
}
