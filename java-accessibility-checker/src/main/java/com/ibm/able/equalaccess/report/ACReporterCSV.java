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

import java.io.FileWriter;
import java.io.IOException;
import java.util.Date;
import java.util.List;

import com.ibm.able.equalaccess.abs.IAbstractAPI;
import com.ibm.able.equalaccess.config.ConfigInternal;
import com.ibm.able.equalaccess.engine.Guideline;
import com.ibm.able.equalaccess.util.Misc;

public class ACReporterCSV implements IReporter {
    private static String toCSV(String str) {
        if (str == null) {
            return "\"null\"";
        } else if (str.length() == 0) {
            return "\"\"";
        } else {
            return "\""+ str.replace("\"", "\"\"") + "\"";
        }
    }

    private IAbstractAPI fsApi;
    public ACReporterCSV(IAbstractAPI fsApi) {
        this.fsApi = fsApi;
    }
    @Override
    public String name() {
        return "csv";
    }
        
    @Override
    public ReporterFile generateReport(ConfigInternal config, Guideline[] rulesets, ReporterStored storedReport) {
        return null;
    }

    @Override
    public ReporterFile generateSummary(ConfigInternal config, Guideline[] rulesets, long endReport,
            List<CompressedReport> compressedReports) 
    {
        long startScan = !compressedReports.isEmpty() ? compressedReports.get(0).getStartScan() : 0;
        Date startScanD = new Date(startScan);
        String reportFilename = "results_"+Misc.toISOString(startScanD).replace(":","-")+".csv";
        if (!config.outputFilenameTimestamp) {
            reportFilename = "results.csv";
        }

        try {
            FileWriter resultStr = new FileWriter(fsApi.prepFile(reportFilename));
            // StringBuilder resultStr = new StringBuilder();
            resultStr.append("Label,Level,RuleId,Message,Xpath,Help\n");
            for (CompressedReport compressedReport: compressedReports) {
                for (int idx=0; idx<compressedReport.issuesLength();++idx) {
                    resultStr.append(toCSV(compressedReport.getLabel()));
                    resultStr.append(",");
                    resultStr.append(toCSV(compressedReport.issueLevel(idx).toString()));
                    resultStr.append(",");
                    resultStr.append(toCSV(compressedReport.issueRuleId(idx)));
                    resultStr.append(",");
                    resultStr.append(toCSV(compressedReport.issueMessage(idx)));
                    resultStr.append(",");
                    resultStr.append(toCSV(compressedReport.issuePathDom(idx)));
                    resultStr.append(",");
                    resultStr.append(toCSV(compressedReport.issueHelp(idx)));
                    resultStr.append("\n");
                }
            }
            resultStr.close();
        } catch (IOException e) {
            e.printStackTrace();            
        }
        return null;
    }
}
