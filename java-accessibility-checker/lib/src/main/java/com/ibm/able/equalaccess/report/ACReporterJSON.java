/******************************************************************************
    Copyright:: 2024- IBM, Inc

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
package com.ibm.able.equalaccess.report;

import java.util.Date;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.ibm.able.equalaccess.config.ConfigInternal;
import com.ibm.able.equalaccess.engine.ACReport;
import com.ibm.able.equalaccess.engine.ACReportSummary;
import com.ibm.able.equalaccess.engine.Guideline;
import com.ibm.able.equalaccess.util.Misc;

public class ACReporterJSON implements IReporter {
    private static Gson gson = new GsonBuilder().setPrettyPrinting().create();

    @Override
    public String name() {
        return "json";
    }

    @Override
    public ReporterFile generateReport(ConfigInternal config, Guideline[] rulesets, ReporterStored storedReport) {
        ACReport outReport = storedReport.engineReport;
        return new ReporterFile(
            outReport.label.replaceAll("[:?&=]", "_")+".json",
            gson.toJson(outReport)
        );
    }

    @Override
    public ReporterFile generateSummary(ConfigInternal config, Guideline[] rulesets, long endReport,
            CompressedReport[] compressedReports) 
    {
        if (compressedReports != null && compressedReports.length > 0) {
            ACReportSummary summReport = new ACReportSummary(config, endReport, compressedReports);
            if (summReport != null) {
                Date startScan = new Date(compressedReports[0].getStartScan());
                String reportFilename = "summary_"+Misc.toISOString(startScan).replaceAll(":","-")+".json";
                if (!config.outputFilenameTimestamp) {
                    reportFilename = "summary.json";
                }
                return new ReporterFile(reportFilename, gson.toJson(summReport));
            }
        }
        return null;
    }
}
