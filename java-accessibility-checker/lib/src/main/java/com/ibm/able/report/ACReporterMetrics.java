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

import java.util.Arrays;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import com.ibm.able.config.ConfigInternal;
import com.ibm.able.engine.Guideline;
import com.ibm.able.enginecontext.EngineContextManager;
import com.ibm.able.util.Fetch;

/*******************************************************************************
 * NAME: ACMetricsLogger.js
 * DESCRIPTION: Common Metrics logger object which can be shared between tools
 *              to upload metrics of the tool to the metrics server.
 *******************************************************************************/

public class ACReporterMetrics implements IReporter { 
    private String policies;
    private String metricsURLV2 = "https://able.ibm.com/tools";
    private String toolName;
    private Map<String, ArrayList<String>> scanTimesV2 = new HashMap<>();

    public ACReporterMetrics(String toolName, String[] policies) {
        this.policies = String.join(",", policies);
        // Init all the local object variables
        this.toolName = toolName;
    }

    @Override
    public String name() {
        return "metrics";
    }

    @Override
    public ReporterFile generateReport(ConfigInternal config, Guideline[] rulesets, ReporterStored storedReport) {
        if (config.label == null || !Arrays.asList(config.label).contains("IBMa-Java-TeSt")) {
            // URI encode the profile text provided
            String profile = EngineContextManager.encodeURIComponent(storedReport.scanProfile);
            if (!scanTimesV2.containsKey(profile)) {
                scanTimesV2.put(profile, new ArrayList<String>());
            }
            // Add the time it took for the testcase to run to the global array, indexed by the profile
            scanTimesV2.get(profile).add(""+storedReport.engineReport.summary.scanTime);
        }
        return null;
    };

    @Override
    public ReporterFile generateSummary(ConfigInternal config, Guideline[] rulesets, long endReport,
            CompressedReport[] compressedReports) 
    {
        try {
            // Variable Declaration
            String accountId = "";

            // Loop over all the profiles with in the scanTime Object
            for (Entry<String, ArrayList<String>> entry: scanTimesV2.entrySet()) {
                // Loop over all the V2 Scan Times until it reaches 0
                if (!entry.getValue().isEmpty()) {
                    String preQS = "?t=" + this.toolName + "&tag=" + entry.getKey() + "&a=" + accountId + "&pol=" + this.policies + "&st=";
                    StringBuilder qsBuilder = new StringBuilder();
                    ArrayList<String> times = entry.getValue();
                    for (int idx=0; idx < times.size(); ++idx) {
                        qsBuilder.append(times.get(idx));
                        qsBuilder.append(",");

                        if ((idx % 150) == 0) {
                            String qs = preQS + qsBuilder.substring(0, qsBuilder.length()-1);

                            // Dispatch the call to the metrics server
                            try {
                                Fetch.get(this.metricsURLV2 + "/api/pub/meter/v2" + qs.toString());
                            } catch (Throwable t) {
                                System.err.println(t);
                            }        
                        }
                        qsBuilder = new StringBuilder();
                    }
                    if (qsBuilder.length() > 0) {
                        String qs = preQS + qsBuilder.substring(0, qsBuilder.length()-1);

                        // Dispatch the call to the metrics server
                        try {
                            System.out.println(this.metricsURLV2 + "/api/pub/meter/v2" + qs.toString());
                            Fetch.get(this.metricsURLV2 + "/api/pub/meter/v2" + qs.toString());
                        } catch (Throwable t) {
                            System.err.println(t);
                        }        
                    }
                }
            }
        } catch (Throwable t) {
            System.err.println(t);
            t.printStackTrace();
        }
        return null;
    };
};
