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
package com.ibm.able.report;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.google.gson.Gson;
import com.ibm.able.abs.IAbstractAPI;
import com.ibm.able.config.ConfigInternal;
import com.ibm.able.engine.ACEReport;
import com.ibm.able.engine.ACError;
import com.ibm.able.engine.ACReport;
import com.ibm.able.engine.Guideline;
import com.ibm.able.engine.eRuleConfidence;
import com.ibm.able.engine.eRuleLevel;
import com.ibm.able.engine.ACReport.Result;

public class ReporterManager {
    private static Gson gson = new Gson();
    private static ReporterManager singleton = null;
    public static ReporterManager get() {
        if (singleton == null) throw new ACError("RepoterManager not intialized");
        return singleton;
    }
    public static ReporterManager initialize(ConfigInternal config, IAbstractAPI absAPI, Guideline[] rulesets) {
        return singleton = new ReporterManager(config, absAPI, rulesets);
    }

    private ConfigInternal config;
    private IAbstractAPI absAPI;
    private Guideline[] rulesets;
    private List<IReporter> reporters = new ArrayList<>();
    private List<CompressedReport> reports = new ArrayList<>();
    private IReporter returnReporter = new ACReporterJSON();

    private ReporterManager(ConfigInternal config, IAbstractAPI absAPI, Guideline[] rulesets) {
        this.config = config;
        this.absAPI = absAPI;
        this.rulesets = rulesets;
        if (config.perfMetrics) {
            // TODO:
            // reporters.add(new ACReporterMetrics(config.toolName, config.policies));
        }

        if (!Arrays.asList(config.outputFormat).contains("disable")) {
            if (Arrays.asList(config.outputFormat).contains("json")) {
                reporters.add(new ACReporterJSON());
            }
            if (Arrays.asList(config.outputFormat).contains("html")) {
                // TODO:
                // reporters.push(new ACReporterHTML())
            }
            if (Arrays.asList(config.outputFormat).contains("csv")) {
                // TODO:
                // reporters.add(new ACReporterCSV());
            }
            if (Arrays.asList(config.outputFormat).contains("xlsx")) {
                // TODO:
                // reporters.add(new ACReporterXLSX());
            }
        }
    }
    private Set<String> usedLabels = new HashSet<String>();

    public ACReport addEngineReport(String scanProfile, long startScan, String url, String pageTitle, String label, ACEReport engineReport) {
        verifyLabel(label);
        usedLabels.add(label);
        ACReport filteredReport = filterReport(engineReport, label);
        filteredReport.summary.startScan = startScan;
        filteredReport.summary.URL = url;
        filteredReport.label = label;
        ReporterStored storedReport = new ReporterStored(pageTitle, scanProfile, filteredReport);
        for (Result issue: filteredReport.results) {
            issue.help = getHelpUrl(issue);
        }        
        CompressedReport compressedReport = new CompressedReport(storedReport);
        if (reporters.size() > 0) {
            reports.add(compressedReport);
            for (IReporter reporter: reporters) {
                ReporterFile reportInfo = reporter.generateReport(config, rulesets, storedReport);
                if (reportInfo != null) {
                    try {
                        absAPI.writeFile(reportInfo.path, reportInfo.contents);
                    } catch (IOException e) {
                        System.err.println(e);
                        e.printStackTrace();
                    }
                }
            }
        }
        ReporterFile retVal = returnReporter.generateReport(config, rulesets, storedReport);
        if (retVal != null) return gson.fromJson(retVal.contents.toString(), ACReport.class);
        return null;
    }

    private void verifyLabel(String label) {
        // In the case that the label is null or undefined, throw an error
        if (label == null) {
            throw new ACError("labelNotProvided: Label must be provided when calling aChecker.getCompliance.");
        }

        // Check to make sure that the label that is provided is unique with all the other ones
        // that we have gone through.
        boolean labelUnique = isLabelUnique(label);

        // In the case that the label is not unique
        if (!labelUnique) {
            throw new ACError("Label provided to aChecker.getCompliance ("+label+") should be unique across all testcases in a single accessibility-checker session.");
        }
    }

    private boolean isLabelUnique(String label) {
        return !usedLabels.contains(label);
    }

    private ACReport filterReport(ACEReport engineResult, String scanLabel) {
        Map<String, Map<String, Set<String>>> ignoreLookup = new HashMap<String, Map<String, Set<String>>> ();

        ACReport baselineReport = absAPI.loadBaseline(scanLabel);
        if (baselineReport != null) {
            for (Result issue : baselineReport.results) {
                // ignoreLookup[issue.path.dom] = ignoreLookup[issue.path.dom] || {}
                Map<String, Set<String>> a = ignoreLookup.get(issue.path.get("dom"));
                if (a == null) {
                    ignoreLookup.put(issue.path.get("dom"), new HashMap<String, Set<String>>());
                    a = ignoreLookup.get(issue.path.get("dom"));
                }
                // ignoreLookup[issue.path.dom][issue.ruleId] = ignoreLookup[issue.path.dom][issue.ruleId] || {}
                Set<String> b = a.get(issue.ruleId);
                if (b == null) {
                    b = new HashSet<String>();
                }
                // ignoreLookup[issue.path.dom][issue.ruleId][issue.reasonId] = true;
                b.add(issue.reasonId);
            }
        }
        ACReport retVal = new ACReport(config, engineResult, scanLabel);

        // Set the config level and filter the results. Make note of which NLS keys we need
        for (ACReport.Result pageResult: retVal.results) {
            eRuleLevel reportLevel = ReporterManager.valueToLevel(pageResult.value);
            boolean ignored = false;
            if (!eRuleConfidence.PASS.toString().equals(pageResult.value[1]) 
                && ignoreLookup.containsKey(pageResult.path.get("dom")) 
                && ignoreLookup.get(pageResult.path.get("dom")).containsKey(pageResult.ruleId)
                && ignoreLookup.get(pageResult.path.get("dom")).get(pageResult.ruleId).contains(pageResult.reasonId))
            {
                ignored = true;
            }
            pageResult.ignored = ignored;
            pageResult.level = reportLevel;
        }

        retVal.updateSummaryCounts();
        retVal.filter(config.reportLevels);

        return retVal;
    }

    public static eRuleLevel valueToLevel(String[] reportValue) {
        eRuleLevel reportLevel = eRuleLevel.undefined;
        if ("PASS".equals(reportValue[1])) {
            reportLevel = eRuleLevel.pass;
        } else if (("VIOLATION".equals(reportValue[0]) || "RECOMMENDATION".equals(reportValue[0])) && "MANUAL".equals(reportValue[1])) {
            reportLevel = eRuleLevel.manual;
        } else if ("VIOLATION".equals(reportValue[0])) {
            if ("FAIL".equals(reportValue[1])) {
                reportLevel = eRuleLevel.violation;
            } else if ("POTENTIAL".equals(reportValue[1])) {
                reportLevel = eRuleLevel.potentialviolation;
            }
        } else if ("RECOMMENDATION".equals(reportValue[0])) {
            if ("FAIL".equals(reportValue[1])) {
                reportLevel = eRuleLevel.recommendation;
            } else if ("POTENTIAL".equals(reportValue[1])) {
                reportLevel = eRuleLevel.potentialrecommendation;
            }
        }
        return reportLevel;
    }

    private String getHelpUrl(ACReport.Result issue) {
        if (issue.help != null && issue.help.length() > 0) return issue.help;
        return "";
        // TODO:
        // let config = ReporterManager.config;
        // let helpUrl = ReporterManager.absAPI.getChecker().engine.getHelp(issue.ruleId, issue.reasonId, !config.ruleArchivePath ? config.ruleArchive : config.ruleArchivePath.substring(config.ruleArchivePath.lastIndexOf("/")+1));
        // let minIssue = {
        //     message: issue.message,
        //     snippet: issue.snippet,
        //     value: issue.value,
        //     reasonId: issue.reasonId,
        //     ruleId: issue.ruleId,
        //     msgArgs: issue.messageArgs
        // };
        // return `${helpUrl}#${encodeURIComponent(JSON.stringify(minIssue))}`
    }

    public void generateSummaries() {
        long endReport = new Date().getTime();
        // If no scans, don't generate summaries
        if (reports.isEmpty()) return;
        for (IReporter reporter: reporters) {
            CompressedReport[] cReports = reports.toArray(new CompressedReport[reports.size()]);
            ReporterFile summaryInfo = reporter.generateSummary(config, rulesets, endReport, cReports);
            if (summaryInfo != null) {
                try {
                    absAPI.writeFile(summaryInfo.path, summaryInfo.contents);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        reports.clear();
    }
}
