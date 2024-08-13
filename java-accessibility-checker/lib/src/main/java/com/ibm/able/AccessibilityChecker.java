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
package com.ibm.able;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.ibm.able.config.ACConfigManager;
import com.ibm.able.config.Config;
import com.ibm.able.config.ConfigInternal;
import com.ibm.able.engine.ACEReport;
import com.ibm.able.engine.ACReport;
import com.ibm.able.engine.Guideline;
import com.ibm.able.engine.Rule;
import com.ibm.able.enginecontext.EngineContextManager;
import com.ibm.able.enginecontext.IEngineContext;
import com.ibm.able.report.BaselineManager;
import com.ibm.able.report.ReporterManager;
import com.ibm.able.report.BaselineManager.DiffResult;
import com.ibm.able.report.BaselineManager.eAssertResult;
import com.ibm.able.abs.IAbstractAPI;
import com.ibm.able.abs.MyFS;

public class AccessibilityChecker {
    private static boolean initialized = false;
    private static IAbstractAPI myFS = new MyFS();
    private static IEngineContext localEngine;

     /**
      * This function is responsible performing a scan based on the context that is provided, following are
      * the supported context type: WebDriver
      * @param content The WebDriver with the content to scan
      * @param label Provide a label for the scan that is being performed
      * @return Resulting report
      */
    public static ACReport getCompliance(Object content, String label) {
        if (content == null) {
            System.err.println("aChecker: Unable to get compliance of null or undefined object");
            return null;
        }

        AccessibilityChecker.initialize();

        IEngineContext engineContext = EngineContextManager.getEngineContext(content);

        // Get the Data when the scan is started
        // Start time will be in milliseconds elapsed since 1 January 1970 00:00:00 UTC up until now.
        long startScan = new Date().getTime();
        ACEReport origReport = engineContext.getCompliance(label);
        String url = engineContext.getUrl();
        String title = engineContext.getTitle();
        ACReport finalReport = ReporterManager.get().addEngineReport("Selenium", startScan, url, title, label, origReport);
        return finalReport;
    }

    public static Config getConfig() {
        return ACConfigManager.getConfig();
    }

    public static ConfigInternal getConfigUnsupported() {
        return ACConfigManager.getConfigUnsupported();
    }

    private static void initialize() {
        if (initialized) return;
        initialized = true;
        localEngine = EngineContextManager.getEngineContext(null);
        Map<String, Rule> refactorMap = new HashMap<>();
        Rule[] rules = localEngine.getRules();
        for (Rule rule: rules) {
            if (rule.refactor != null) {
                for (String key: rule.refactor.keySet()) {
                    refactorMap.put(key, rule);
                }
            }
        }
        ConfigInternal config = getConfigUnsupported();
        ReporterManager.initialize(config, myFS, localEngine.getGuidelines());
        BaselineManager.initialize(config, myFS, refactorMap);

        Runtime.getRuntime().addShutdownHook(new Thread(() -> AccessibilityChecker.close() ));
    }

    /**
     * This function is responsible for comparing the scan results with baseline or checking that there are
     * no violations which fall into the failsLevels levels. In the case a baseline is found then baseline will
     * be used to perform the check, in the case no baseline is provided then we comply with only failing if
     * there is a sinble violation which falls into failLevels.
     *
     * @param actual the actual results object provided by the user, this object should follow the
     *                          same format as outlined in the return of aChecker.buildReport function.
     *
     * @return return 0 in the case actual matches baseline or no violations fall into failsLevels,
     *                 return 1 in the case actual results does not match baseline results,
     *                 return 2 in the case that there is a failure based on failLevels (this means no baseline found).
     *                 return -1 in the case that there is an exception that occured in the results object which came from the scan engine.
     */

     /**
      * This function is responsible for comparing the scan results with baseline or checking that there are
      * no violations which fall into the failsLevels levels. In the case a baseline is found then baseline will
      * be used to perform the check, in the case no baseline is provided then we comply with only failing if
      * there is a sinble violation which falls into failLevels.
      * @param report the actual results object provided by the user, this object should follow the
      *                          same format as outlined in the return of aChecker.buildReport function.
      * @return return 0 in the case actual matches baseline or no violations fall into failsLevels,
      *                 return 1 in the case actual results does not match baseline results,
      *                 return 2 in the case that there is a failure based on failLevels (this means no baseline found).
      *                 return -1 in the case that there is an exception that occured in the results object which came from the scan engine.
      */
    public static eAssertResult assertCompliance(ACReport report) {
        return BaselineManager.assertCompliance(report);
    }

// /**
// * This function is responsible for printing the scan results to console.
// *
// * @param {Object} results - Provide the results from the scan.
// *
// * @return {String} resultsString - String representation of the results/violations.
// */
// export function stringifyResults(report: ICheckerReport) : string {
// return ReporterManager.stringifyResults(report)
// }

    public static void close() {
        ReporterManager.get().generateSummaries();
    }

    /**
     * This function is responsible for getting the diff results based on label for a scan that was already performed.
     *
     * @param label Provide a label for which to get the diff results for.
     *
     * @return return the diff results object from global space based on label provided, the object will be
     *                    in the same format as outlined in the return of aChecker.diffResultsWithExpected function.
     */
    public static DiffResult[] getDiffResults(String label) {
        return BaselineManager.getDiffResults(label);
    }

    /**
     * This function is responsible for getting the baseline object for a label that was provided.
     *
     * @param label Provide a label for which to get the baseline for.
     *
     * @return return the baseline object from global space based on label provided, the object will be
     *                    in the same format as outlined in the return of aChecker.buildReport function.
     */
    public static ACReport getBaseline(String label) {
        return BaselineManager.getBaseline(label);
    }

    /**
     * This function is responsible for comparing actual with expected and returning all the differences as an array.
     *
     * @param actual Provide the actual object to be used for compare
     * @param expected Provide the expected object to be used for compare
     *
     * @return differences - return an array of diff objects that were found, following is the format of the object:
     * [
     *     {
     *         "kind": "E",
     *         "path": [
     *             "reports",
     *             0,
     *             "issues",
     *             10,
     *             "xpath"
     *         ],
     *         "lhs": "/html[1]/body[1]/div[2]/table[5]",
     *         "rhs": "/html[1]/body[1]/div[2]/table[5]d",
     *     },
     *     {
     *         "kind": "E",
     *         "path": [
     *             "label"
     *         ],
     *         "lhs": "Table-layoutMultiple",
     *         "rhs": "dependencies/tools-rules-html/v2/a11y/test/g471/Table-layoutMultiple.html",
     *     }
     * ]
     */
    public static DiffResult[] diffResultsWithExpected(ACReport actual, ACReport expected) {
        return BaselineManager.diffResultsWithExpected(actual, expected);
    }

// export function addRuleset(ruleset) {
// ACEngineManager.addRuleset(ruleset);
// }

    public static Guideline getGuideline(String rsId) {
        Guideline[] gs = getGuidelines();
        for (int i=0; i<gs.length; ++i) {
            if (gs[i].id.equals(rsId)) {
                return gs[i];
            }
        }
        return null;
    }

    public static Guideline[] getGuidelines() {
        return localEngine.getGuidelines();
    }

    public static Rule[] getRules() {
        return localEngine.getRules();
    }

}
