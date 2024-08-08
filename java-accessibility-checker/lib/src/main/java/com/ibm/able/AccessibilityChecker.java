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

import java.io.IOException;
import java.util.Date;

import com.ibm.able.config.ACConfigManager;
import com.ibm.able.config.Config;
import com.ibm.able.config.ConfigInternal;
import com.ibm.able.engine.ACEReport;
import com.ibm.able.engine.ACReport;
import com.ibm.able.enginecontext.EngineContextManager;
import com.ibm.able.enginecontext.IEngineContext;
import com.ibm.able.report.ReporterManager;
import com.ibm.able.abs.IAbstractAPI;
import com.ibm.able.abs.MyFS;

public class AccessibilityChecker {
    private static boolean initialized = false;
    private static IAbstractAPI myFS = new MyFS();
    private static IEngineContext localEngine;

    /**
     * This function is responsible performing a scan based on the context that is provided, following are
     * the supported context type:
     *    Single node (HTMLElement)
     *    Local file path (String)
     *    URL (String)
     *    document node
     *    data stream for html content (String)
     *
     *  Future Items
     *    Multiple node (Array of HTMLElements) ---> FUTURE
     *
     * @param {(Webdriver|Puppeteer Page |)} content - Provide the context to scan, which includes the items from above.
     * @param {String} label - Provide a label for the scan that is being performed
     * @param {Function} callback - (optional) Provide callback function which will be executed once the results are extracted.
     * @return Promise with the ICheckerResult
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
        // TODO:
        // let refactorMap : RefactorMap = {}
        // let rules = ACEngineManager.getRulesSync();
        // for (const rule of rules) {
        //     if (rule.refactor) {
        //         for (const key in rule.refactor) {
        //             refactorMap[key] = rule;
        //         }
        //     }
        // }
        ReporterManager.initialize(getConfigUnsupported(), myFS, localEngine.getGuidelines());
        // BaselineManager.initialize(Config, absAPI, refactorMap);
    }

// /**
// * This function is responsible for comparing the scan results with baseline or checking that there are
// * no violations which fall into the failsLevels levels. In the case a baseline is found then baseline will
// * be used to perform the check, in the case no baseline is provided then we comply with only failing if
// * there is a sinble violation which falls into failLevels.
// *
// * @param {ReportResult} actual - the actual results object provided by the user, this object should follow the
// *                          same format as outlined in the return of aChecker.buildReport function.
// *
// * @return {int} - return 0 in the case actual matches baseline or no violations fall into failsLevels,
// *                 return 1 in the case actual results does not match baseline results,
// *                 return 2 in the case that there is a failure based on failLevels (this means no baseline found).
// *                 return -1 in the case that there is an exception that occured in the results object which came from the scan engine.
// */
// export function assertCompliance(report: IBaselineReport) : eAssertResult {
// return BaselineManager.assertCompliance(report)
// }

// /**
// * This function is responsible for printing the scan results to console.
// *
// * @param {Object} results - Provide the results from the scan.
// *
// * @return {String} resultsString - String representation of the results/violations.
// *
// * PUBLIC API
// *
// * @memberOf this
// */
// export function stringifyResults(report: ICheckerReport) : string {
// return ReporterManager.stringifyResults(report)
// }

// export function close() {
// return ACBrowserManager.close();
// }

// /**
// * This function is responsible for getting the diff results based on label for a scan that was already performed.
// *
// * @param {String} label - Provide a lable for which to get the diff results for.
// *
// * @return {Object} - return the diff results object from global space based on label provided, the object will be
// *                    in the same format as outlined in the return of aChecker.diffResultsWithExpected function.
// */
// export function getDiffResults(label: string) {
// return BaselineManager.getDiffResults(label);
// }

// /**
// * This function is responsible for getting the baseline object for a label that was provided.
// *
// * @param {String} label - Provide a lable for which to get the baseline for.
// *
// * @return {Object} - return the baseline object from global space based on label provided, the object will be
// *                    in the same format as outlined in the return of aChecker.buildReport function.
// */
// export function getBaseline(label: string) {
// return BaselineManager.getBaseline(label);
// }

// /**
// * This function is responsible for comparing actual with expected and returning all the differences as an array.
// *
// * @param {Object} actual - Provide the actual object to be used for compare
// * @param {Object} expected - Provide the expected object to be used for compare
// * @param {boolean} clean - Provide a boolean if both the actual and expected objects need to be cleaned
// *                          cleaning refers to converting the objects to match with a basic compliance
// *                          compare of xpath and ruleId.
// *
// * @return {Object} differences - return an array of diff objects that were found, following is the format of the object:
// * [
// *     {
// *         "kind": "E",
// *         "path": [
// *             "reports",
// *             0,
// *             "issues",
// *             10,
// *             "xpath"
// *         ],
// *         "lhs": "/html[1]/body[1]/div[2]/table[5]",
// *         "rhs": "/html[1]/body[1]/div[2]/table[5]d",
// *     },
// *     {
// *         "kind": "E",
// *         "path": [
// *             "label"
// *         ],
// *         "lhs": "Table-layoutMultiple",
// *         "rhs": "dependencies/tools-rules-html/v2/a11y/test/g471/Table-layoutMultiple.html",
// *     }
// * ]
// */
// export function diffResultsWithExpected(actual, expected, clean) {
// return BaselineManager.diffResultsWithExpected(actual, expected, clean);
// }

// /**
// * This function is responsible for cleaning up the compliance baseline or actual results, based on
// * a pre-defined set of criterias, such as the following:
// *      1. No need to compare summary object
// *      2. Only need to compare the ruleId and xpath in for each of the issues
// *
// * @param {Object} objectToClean - Provide either an baseline or actual results object which would be in the
// *                                 the same format as outlined in the return of aChecker.buildReport function.
// *
// * @return {Object} objectToClean - return an object that was cleaned to only contain the information that is
// *                                  needed for compare. Following is a sample of how the cleaned object will look like:
// * {
// *     "label": "unitTestContent",
// *     "reports": [
// *         {
// *             "frameIdx": "0",
// *             "frameTitle": "Frame 0",
// *             "issues": [
// *                 {
// *                     "ruleId": "1",
// *                     "xpath": "/html[1]/head[1]/style[1]"
// *                 }
// *                 ....
// *             ]
// *         },
// *         {
// *             "frameIdx": "1",
// *             "frameTitle": "Frame 1",
// *             "issues": [
// *                 {
// *                     "ruleId": "471",
// *                     "xpath": "/html[1]/body[1]/div[2]/table[3]"
// *                 }
// *                 ....
// *             ]
// *         }
// *     ]
// * }
// */
// export function cleanComplianceObjectBeforeCompare(objectToClean) {
// return BaselineManager.cleanComplianceObjectBeforeCompare(objectToClean);
// }

// export function addRuleset(ruleset) {
// ACEngineManager.addRuleset(ruleset);
// }

// export async function getRuleset(rsId) {
// return ACEngineManager.getRuleset(rsId);
// };

// export async function getRulesets() {
// return ACEngineManager.getRulesets();
// };

// export async function getRules() {
// return ACEngineManager.getRules();
// }

}
