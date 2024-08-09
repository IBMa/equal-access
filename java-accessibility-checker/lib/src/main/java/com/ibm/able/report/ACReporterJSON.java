package com.ibm.able.report;

import java.util.Date;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.ibm.able.config.ConfigInternal;
import com.ibm.able.engine.ACReport;
import com.ibm.able.engine.ACReportSummary;
import com.ibm.able.engine.Guideline;
import com.ibm.able.util.Misc;

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
