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

/** import { IConfigInternal } from "../config/IConfig";
import { Guideline } from "../engine/IGuideline";
import { CompressedReport, IBaselineReport } from "../engine/IReport";
import { GenSummReturn, IReporter, IReporterStored, ReporterManager } from "./ReporterManager";
import { genReport } from "./genReport";
*/
import { IConfigInternal } from "../config/IConfig.js";
import { CompressedReport, IBaselineReport, IRuleset } from "../engine/IReport.js";
import { GenSummReturn, IReporter, IReporterStored, ReporterManager } from "./ReporterManager.js";
import { genReport } from "./genReport.js";

export class ACReporterHTML implements IReporter {
    public name(): string {
        return "html";
    }

    public generateReport(config: IConfigInternal, rulesets: Guideline[], storedReport: IReporterStored): { reportPath: string, report: string } | void {
        let cloneReport : IBaselineReport= JSON.parse(JSON.stringify(storedReport.engineReport));

        let outReport = {
            report: {
                timestamp: storedReport.startScan,
                nls: cloneReport.nls,
                results: cloneReport.results.filter((issue: any) => issue.value[1] !== "PASS"),
                passUniqueElements: Array.from(new Set(cloneReport.results.map(result => result.path.dom))),
                counts: {
                    total: { 
                        All: 0
                    }
                }
            },
            rulesets: rulesets,
            tabURL: storedReport.url
        }

        return {
            reportPath: `${storedReport.label.replace(/[:?&=]/g,"_")}.html`,
            report: genReport(outReport)
        };
    }
    public async generateSummary(_config: IConfigInternal, rulesets: Guideline[], _endReport: number, _summaryData: CompressedReport[]): Promise<GenSummReturn> {
    }
}
