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
package com.ibm.able.equalaccess;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.ibm.able.equalaccess.config.ACConfigManager;
import com.ibm.able.equalaccess.config.Config;
import com.ibm.able.equalaccess.config.ConfigInternal;
import com.ibm.able.equalaccess.engine.ACEReport;
import com.ibm.able.equalaccess.engine.ACReport;
import com.ibm.able.equalaccess.engine.Guideline;
import com.ibm.able.equalaccess.engine.Rule;
import com.ibm.able.equalaccess.enginecontext.EngineContextManager;
import com.ibm.able.equalaccess.enginecontext.IEngineContext;
import com.ibm.able.equalaccess.report.BaselineManager;
import com.ibm.able.equalaccess.report.ReporterManager;
import com.ibm.able.equalaccess.report.BaselineManager.DiffResult;
import com.ibm.able.equalaccess.report.BaselineManager.eAssertResult;
import com.ibm.able.equalaccess.abs.IAbstractAPI;
import com.ibm.able.equalaccess.abs.MyFS;

/**
 * The main checker object. See the .jar overview for usage information.
 */
public class AccessibilityChecker {
    private AccessibilityChecker() {}

    private static boolean initialized = false;
    private static IAbstractAPI myFS = new MyFS();
    private static IEngineContext localEngine;


    /**
     * Perform a scan of the provided context. 
     *
     * Currently supported content contexts: org.openqa.selenium.WebDriver, com.microsoft.playwright.Page.
     * @param content The page to scan.
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
        ACReport finalReport = ReporterManager.get().addEngineReport(engineContext.getProfile(), startScan, url, title, label, origReport);
        return finalReport;
    }

    /**
     * Close the checker and ensure all summary reports are generated
     */
    public static void close() {
        ReporterManager.get().generateSummaries();
    }


    /**
     * Check the scan results against configured failLevels or against a previously set baseline.
     * @param report Report generated by getCompliance
     * @return - 0 if report matches baseline, or no issues match failLevels
     * - 1 results do not match baseline results
     * - 2 failure based on failLevels (this means no baseline found)
     */
    public static eAssertResult assertCompliance(ACReport report) {
        return BaselineManager.assertCompliance(report);
    }

    /**
     * Get the processed configuration object
     * @return Current configuration set for the checker
     */
    public static Config getConfig() {
        return ACConfigManager.getConfig();
    }

    /**
     * Get a processed configuration object that include properties used internally to the checker
     * @return Current configuration set for the checker
     */
    public static ConfigInternal getConfigUnsupported() {
        return ACConfigManager.getConfigUnsupported();
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
    public static DiffResult[] diffResultsWithExpected(ACReport actual, ACReport expected, boolean clean) {
        return BaselineManager.diffResultsWithExpected(actual, expected, clean);
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
}
