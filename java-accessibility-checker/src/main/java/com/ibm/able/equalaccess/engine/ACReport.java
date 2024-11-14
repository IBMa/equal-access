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
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import com.ibm.able.equalaccess.config.ConfigInternal;

public class ACReport implements Cloneable {

    /**
     * Summary of counts from the scan
     */
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

        public SummaryCounts() {
        }

        public SummaryCounts(ACEReport.SummaryCounts rhs) {
            violation = rhs.violation;
            potentialviolation = rhs.potentialviolation;
            recommendation = rhs.recommendation;
            potentialrecommendation = rhs.potentialrecommendation;
            manual = rhs.manual;
            pass = rhs.pass;
        }
    }

    /**
     * Scan summary information
     */
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

    /**
     * An individual issue identified by a rule
     */
    public static class Result extends ACEReport.Result {
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

        @Override
        public Object clone() { 
            return super.clone();
        }

        public Result copyClean() {
            Result issue = new Result();
            issue.ruleId = this.ruleId;
            issue.reasonId = this.reasonId;
            // Make sure that the xpath in the case there is a [1] we replace it with ""
            // to support some browser which return it differently
            issue.path = new HashMap<String, String>();
            issue.path.put("dom", this.path.get("dom").replaceAll("\\[1\\]", ""));
            return issue;
        }

        public String toHelpData() {
            return gsonMinimal.toJson(this);
        }

        public static Gson gsonMinimal = new GsonBuilder()
            .registerTypeAdapter(Result.class, new JsonSerializer<Result>() {
                @Override
                public JsonElement serialize(Result issue, Type typeOfSrc, JsonSerializationContext context) {
                    JsonObject jObject = new JsonObject();
                    jObject.addProperty("ruleId", issue.ruleId);
                    jObject.addProperty("reasonId", issue.reasonId);
                    jObject.addProperty("message", issue.message);
                    jObject.addProperty("snippet", issue.snippet);
                    JsonArray buildValue = new JsonArray();
                    for (String s: issue.value) {
                        buildValue.add(s);
                    }
                    jObject.add("value", buildValue);
                    JsonArray buildMsgArgs = new JsonArray();
                    for (String s : issue.messageArgs) {
                        buildMsgArgs.add(s);
                    }
                    jObject.add("msgArgs", buildMsgArgs);
                    return jObject;
                }
            })
            .create();
    }

    /** Array of items detected by the getCompliance scan */
    public Result[] results = new Result[0];
    /** Number of rules executed as part of the scan */
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
    /** Amount of time in ms that was spent executing rule functions (as opposed to walking the tree) */
    public int ruleTime = 0;

    private ConfigInternal config;

    public ACReport() {}
    public ACReport(ConfigInternal config, ACEReport engineReport, String label) {
        this.config = config;
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
     * Ignore: To be used by the ReporterManager
     * @param summaryCounts
     */
    public void addCounts(ACEReport.SummaryCounts summaryCounts) {
        SummaryCounts counts = this.summary.counts = new SummaryCounts(summaryCounts);
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
                if (eRuleLevel.violation.equals(issue.level)) {
                    --counts.violation;
                } else if (eRuleLevel.potentialviolation.equals(issue.level)) {
                    --counts.potentialviolation;
                } else if (eRuleLevel.recommendation.equals(issue.level)) {
                    --counts.recommendation;
                } else if (eRuleLevel.potentialrecommendation.equals(issue.level)) {
                    --counts.potentialrecommendation;
                } else if (eRuleLevel.manual.equals(issue.level)) {
                    --counts.manual;
                } else if (eRuleLevel.pass.equals(issue.level)) {
                    --counts.pass;
                }                
            } else {
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

    /**
     * Filters the report using the specified reportLevels
     * @param reportLevels
     */
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

    public ACReport copyClean() {
        // Shallow copy
        ACReport ret = new ACReport();
        ret.label = this.label;
        ArrayList<Result> temp = new ArrayList<Result>(results.length);
        for (int idx=0; idx<results.length; ++idx) {
            if (!("pass".equals(results[idx].level.toString()))) {
                temp.add(results[idx].copyClean());
            }
        }
        ret.results = temp.toArray(new Result[temp.size()]);
        return ret;
    }

    public String toString() {
        if (results == null) {
            return "ERROR: results null";
        }

        StringBuilder resultsString = new StringBuilder();
        resultsString.append("Scan: "+label+"\n");
        List<String> reportLevelsList = Arrays.asList(config.reportLevels);

        for (Result issue: results) {
            if (reportLevelsList.contains(issue.level.toString())) {
                // Build string of the issues with only level, messageCode, xpath and snippet.
                resultsString.append("- Message: " + issue.message +
                    "\n  Level: " + issue.level +
                    "\n  XPath: " + issue.path.get("dom") +
                    "\n  Snippet: " + issue.snippet +
                    "\n  Help: " + issue.help +
                    "\n");
            }
        }

        return resultsString.toString();
    }
}
