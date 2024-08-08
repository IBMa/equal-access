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

import java.util.HashMap;
import java.util.Map;

import com.ibm.able.engine.ACReport;

public class CompressedReport {
    public static String scanID;
    public static String toolID;
    public static Map<String, Map<String, String>> nlsStore = new HashMap<>();

    public Object[] data = {};

    public CompressedReport(ReporterStored info) {
        ACReport report = info.engineReport;
        ACReport.Summary summary = report.summary;
        CompressedReport.scanID = report.scanID;
        CompressedReport.toolID = report.toolID;
        this.data = new Object[] {
            summary.startScan, // startScan (0)
            summary.URL, // url (1)
            info.pageTitle, // pagetitle (2)
            report.label, // label (3)
            info.scanProfile, // scanProfile (4)
            report.numExecuted, // numExecuted (5)
            summary.scanTime, // scanTime (6) 
            summary.ruleArchive, // ruleArchive (7)
            summary.policies, // policies (8) 
            summary.reportLevels, // reportLevels (9)
            new Object[report.results.length][] // (10)
        };
        for (int idx=0; idx<report.results.length; ++idx) {
            ACReport.Result result = report.results[idx];
            Object[] issue = (Object[])(((Object[])this.data[10])[idx] = new Object[] {
                result.category, // 0
                result.ruleId, // 1
                result.value, // 2
                result.reasonId, // 3
                result.messageArgs, // 4
                result.path, // 5
                result.ruleTime, // 6
                result.snippet, // 7
                result.help, // 8
                result.ignored, // 9,
                result.message // 10
            });
            for (int idx2=0; idx2<issue.length; ++idx2) {
                if (issue[idx2] instanceof String && ((String) issue[idx2]).length() > 32000) {
                    issue[idx2] = ((String) issue[idx2]).substring(0, 32000 - 3) + "...";
                }
            }
            Map<String, String> storeRuleMap = nlsStore.getOrDefault(result.ruleId, new HashMap<String, String>());
            storeRuleMap.put(
                result.reasonId, 
                report.nls.getOrDefault(
                    result.ruleId, 
                    new HashMap<String, String>()
                ).getOrDefault(
                    result.reasonId, 
                    result.ruleId+"_"+result.reasonId
                )
            );
        }
    }

    public ReporterStored uncompress() {
        ACReport engineReport = new ACReport();
        engineReport.label = (String)data[3];
        engineReport.numExecuted = (Integer)data[5];
        ACReport.Summary summary = engineReport.summary;
        summary.scanTime = (Long)data[6];
        summary.ruleArchive = (String)data[7];
        summary.policies = (String[])data[8];
        summary.reportLevels = (String[])data[9];
        summary.startScan = (Long)data[0];
        summary.URL = (String)data[1];
        engineReport.results = new ACReport.Result[((Object[])data[10]).length];
        for (int idx=0; idx<((Object[][])data[10]).length; ++idx) {
            Object[] issue = ((Object[][])data[10])[idx];
            ACReport.Result result = engineReport.results[idx] = new ACReport.Result();
            result.category = (String)issue[0];
            result.ruleId = (String)issue[1];
            result.value = (String[])issue[2];
            result.reasonId = (String)issue[3];
            result.messageArgs = (String[])issue[4];
            result.apiArgs = new Object[] {};
            result.path = (Map<String, String>)issue[5];
            result.ruleTime = (Integer)issue[6];
            result.message = (String)issue[10];
            result.snippet = (String)issue[7];
            result.help = (String)issue[8];
            result.ignored = (Boolean)issue[9];
            result.level = ReporterManager.valueToLevel((String[])issue[2]);
            Map<String, String> nlsRuleMap = engineReport.nls.getOrDefault(result.ruleId, new HashMap<String, String>());
            nlsRuleMap.put(
                result.reasonId, 
                nlsStore.getOrDefault(
                    result.ruleId, 
                    new HashMap<String, String>()
                ).getOrDefault(
                    result.reasonId, 
                    result.ruleId+"_"+result.reasonId
                )
            );
        }
        engineReport.updateSummaryCounts();
        return new ReporterStored(data[2].toString(), data[4].toString(), null);
    }

    public long getStartScan() {
        return (Long)data[0];
    }

    public String getLabel() {
        return (String)data[3];
    }
}
