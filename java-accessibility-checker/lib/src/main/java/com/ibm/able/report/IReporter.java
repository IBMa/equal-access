package com.ibm.able.report;

import com.ibm.able.config.ConfigInternal;
import com.ibm.able.engine.Guideline;

public interface IReporter {
    String name();
    /**
     * @return [ reportPath: string, report: string ]
     */
    ReporterFile generateReport(ConfigInternal config, Guideline[] rulesets, ReporterStored reportData);
    ReporterFile generateSummary(ConfigInternal config, Guideline[] rulesets, long endReport, CompressedReport[] summaryData);
};