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

package com.ibm.able.engine;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import com.ibm.able.config.ConfigInternal;

public class ACReport implements Cloneable {
    public static class SummaryCounts implements Cloneable {
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

        public Object clone() { 
            try {
                return super.clone();
            } catch (CloneNotSupportedException ex) {
                System.err.println(ex);
                throw new RuntimeException();
            }
        }
    }
    public static class Summary implements Cloneable {
        public SummaryCounts counts = new SummaryCounts();
        public long scanTime = 0;
        public String ruleArchive = "";
        public String[] policies = {};
        public String[] reportLevels = {};
        public long startScan = 0;
        public String URL = "";

        public Object clone() { 
            Summary ret = null;
            try {
                ret = (Summary) super.clone();
            } catch (CloneNotSupportedException ex) {
                System.err.println(ex);
                throw new RuntimeException();
            }
            ret.counts = (SummaryCounts)counts.clone();
            return ret;
        } 
    }
    public static class Result extends ACEReport.Result implements Cloneable {
        /** Did this issue match a baseline */
        public boolean ignored = false;
        /** Help url for this item */
        public String help = "";
        /** Level of the issue (violation, potentialviolation, etc) */
        public eRuleLevel level;

        public Result() {}
        public Result(ACEReport.Result engineResult) {
            super(engineResult);
        }

        public Object clone() { 
            return super.clone();
        }
    }
    /** List of items detected by the getCompliance scan */
    public Result[] results = new Result[0];
    /** Number of rules executed */
    public int numExecuted = 0;
    /** Mapping of ruleId to reasonId to a parameterized message */
    public Map<String, Map<String, String>> nls = new HashMap<>();
    /** Summary of the scan */
    public Summary summary = new Summary();
    /** Identifier of the scan (same id used for each scan of the session) */
    public String scanID = "";
    /** Identifier for the accessibility-checker tool used to perform the scan */
    public String toolID = "";
    /** Label as specified in the getCompliance call that generated the report  */
    public String label = "";
    /** base64 screenshot, if one was taken */
    public String screenshot=null;
    /** Amount of time in ms that rules were running */
    public int ruleTime = 0;

    public ACReport() {}
    public ACReport(ConfigInternal config, ACEReport engineReport, String label) {
        numExecuted = engineReport.numExecuted;
        nls = engineReport.nls;
        screenshot = engineReport.screenshot;
        ruleTime = engineReport.ruleTime;
        results = new Result[engineReport.results.length];
        for (int idx=0; idx < results.length; ++idx) {
            results[idx] = new Result(engineReport.results[idx]);
        }
        scanID = config.scanID;
        toolID = config.toolID;
        this.label = label;
    }

    /**
     * Update the summary counts to match the included results
     */
    public void updateSummaryCounts() {
        SummaryCounts counts = summary.counts;
        counts.violation = 0;
        counts.potentialviolation = 0;
        counts.recommendation = 0;
        counts.potentialrecommendation = 0;
        counts.manual = 0;
        counts.pass = 0;
        counts.ignored = 0;
        counts.elements = 0;
        counts.elementsViolation = 0;
        counts.elementsViolationReview = 0;
        Set<String> elementSet = new HashSet<>();
        Set<String> elementViolationSet = new HashSet<>();
        Set<String> elementViolationReviewSet = new HashSet<>();
        for (Result issue: results) {
            elementSet.add(issue.path.get("dom"));
            if (issue.ignored) {
                ++counts.ignored;
            } else {
                if (eRuleLevel.violation.equals(issue.level)) {
                    ++counts.violation;
                } else if (eRuleLevel.potentialviolation.equals(issue.level)) {
                    ++counts.potentialviolation;
                } else if (eRuleLevel.recommendation.equals(issue.level)) {
                    ++counts.recommendation;
                } else if (eRuleLevel.potentialrecommendation.equals(issue.level)) {
                    ++counts.potentialrecommendation;
                } else if (eRuleLevel.manual.equals(issue.level)) {
                    ++counts.manual;
                } else if (eRuleLevel.pass.equals(issue.level)) {
                    ++counts.pass;
                } else if (eRuleLevel.ignored.equals(issue.level)) {
                    ++counts.ignored;
                }
                if (eRuleLevel.violation.equals(issue.level)) {
                    elementViolationSet.add(issue.path.get("dom"));
                    elementViolationReviewSet.add(issue.path.get("dom"));
                } else if (eRuleLevel.potentialviolation.equals(issue.level) || eRuleLevel.manual.equals(issue.level)) {
                    elementViolationReviewSet.add(issue.path.get("dom"));
                }
            }
        }
        counts.elements = elementSet.size();
        counts.elementsViolation = elementViolationSet.size();
        counts.elementsViolationReview = elementViolationReviewSet.size();
    }

    public void filter(String[] reportLevels) {
        Map<String, Set<String>> keepNlsKeys = new HashMap<>();
        List<String> reportLevelsList = Arrays.asList(reportLevels);
        Stream<Result> filtResults = Arrays.stream(results).filter(pageResult -> {
            if (reportLevelsList.contains(pageResult.level.toString())) {
                Set<String> keepRuleReasons = keepNlsKeys.get(pageResult.ruleId);
                if (keepRuleReasons == null) {
                    keepNlsKeys.put(pageResult.ruleId, new HashSet<String>());
                    keepRuleReasons = keepNlsKeys.get(pageResult.ruleId);
                    keepRuleReasons.add("0");                    
                }
                keepRuleReasons.add(pageResult.reasonId);
                if (pageResult.message.length() > 32000) {
                    pageResult.message = pageResult.message.substring(0, 32000 - 3) + "...";
                }
                if (pageResult.snippet.length() > 32000) {
                    pageResult.snippet = pageResult.snippet.substring(0, 32000 - 3) + "...";
                }
                return true;
            } else {
                return false;
            }
        });
        results = filtResults.toArray(size -> new Result[size]);

        if (nls != null) {
            for (String ruleId: nls.keySet().toArray(new String[] {})) {
                if (!keepNlsKeys.containsKey(ruleId)) {
                    nls.remove(ruleId);
                } else {
                    Set<String> keepRuleReasons = keepNlsKeys.get(ruleId);
                    Map<String, String> nlsRuleMap = nls.get(ruleId);
                    for (String reasonId: nls.get(ruleId).values()) {
                        if (!keepRuleReasons.contains(reasonId)) {
                            nlsRuleMap.remove(reasonId);
                        }
                    }
                }
            }
        }
    }
    public void sortResults() { 
        Arrays.sort(this.results, (a, b) -> {
            int cc = b.category.compareTo(a.category);
            if (cc != 0) return cc;
            int pc = b.path.get("dom").compareTo(a.path.get("dom"));
            if (pc != 0) return pc;
            return b.ruleId.compareTo(a.ruleId);
        });
    }

    @Override
    public Object clone() { 
        // Shallow copy
        ACReport ret = null;
        try {
            ret = (ACReport)super.clone();
        } catch (CloneNotSupportedException ex) {
            System.err.println(ex);
            throw new RuntimeException();
        }
        ret.summary = (Summary)summary.clone();
        ret.results = new ACReport.Result[results.length];
        for (int idx=0; idx<results.length; ++idx) {
            ret.results[idx] = (ACReport.Result) results[idx].clone();
        }
        return ret;
    } 
}
