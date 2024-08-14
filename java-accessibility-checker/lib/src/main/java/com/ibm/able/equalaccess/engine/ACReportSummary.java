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

package com.ibm.able.equalaccess.engine;

import com.ibm.able.equalaccess.config.ConfigInternal;
import com.ibm.able.equalaccess.report.CompressedReport;
import com.ibm.able.equalaccess.report.ReporterStored;

public class ACReportSummary {
    public static class SummaryCounts {
        public int violation = 0;
        public int potentialviolation = 0;
        public int recommendation = 0;
        public int potentialrecommendation = 0;
        public int manual = 0;
        public int pass = 0;
        public int ignored = 0;
        public int elements = 0;
        public int elementsViolation = 0;
        public int elementsViolationReview = 0;
    }
    public static class PageSummary  {
        public String label;
        public ACReport.SummaryCounts counts;
    }
    public SummaryCounts counts = new SummaryCounts();

    public long startReport = 0;
    public long endReport = 0;
    public String toolID = "";
    public String[] policies = {};
    public String[] reportLevels = {};
    public String[] labels = {};
    public String[] failLevels = {};
    public String scanID = "";
    public PageSummary[] pageScanSummary = new PageSummary[0];

    public ACReportSummary() {}
    public ACReportSummary(ConfigInternal config, long endReport, CompressedReport[] compressedReports) {
        this.startReport = compressedReports[0].getStartScan();
        this.endReport = endReport;
        this.toolID = config.toolID;
        this.policies = config.policies;
        this.reportLevels = config.reportLevels;
        this.labels = config.label;
        this.failLevels = config.failLevels;
        this.scanID = config.scanID;
        this.pageScanSummary = new PageSummary[compressedReports.length];
        for (int idx=0; idx<compressedReports.length; ++idx) {
            this.pageScanSummary[idx] = new PageSummary();
            ReporterStored curReport = compressedReports[idx].uncompress();
            this.pageScanSummary[idx].label = compressedReports[idx].getLabel();
            ACReport.SummaryCounts curCounts = this.pageScanSummary[idx].counts = curReport.engineReport.summary.counts;

            this.counts.violation += curCounts.violation;
            this.counts.potentialviolation += curCounts.potentialviolation;
            this.counts.recommendation += curCounts.recommendation;
            this.counts.potentialrecommendation += curCounts.potentialrecommendation;
            this.counts.manual += curCounts.manual;
            this.counts.pass += curCounts.pass;
            this.counts.ignored += curCounts.ignored;
            this.counts.elements += curCounts.elements;
            this.counts.elementsViolation += curCounts.elementsViolation;
            this.counts.elementsViolationReview += curCounts.elementsViolationReview;    
        }
    }
}
