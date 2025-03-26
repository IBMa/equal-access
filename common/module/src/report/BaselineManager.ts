/******************************************************************************
     Copyright:: 2023- IBM, Inc

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

import { IAbstractAPI } from "../api-ext/IAbstractAPI.js";
import { IConfigInternal, eAssertResult } from "../config/IConfig.js";
import { IBaselineReport } from "../engine/IReport.js";
import * as DeepDiff from "deep-diff";

export type RefactorMap = {
    [oldRuleId: string]: {
        id: string
        refactor: {
            [ruleId: string]: {
                [reasonId: string]: string
            }
        }
    }
}

/**
 * This interface is responsible for aChecker baselines and comparing scans to baselines
 */
export class BaselineManager {
    private static baselineIssueList = ["ruleId", "xpath"];
    private static config: IConfigInternal;
    private static diffResults = {}
    private static absAPI: IAbstractAPI;
    private static refactorMap: RefactorMap;

    public static initialize(config: IConfigInternal, absAPI: IAbstractAPI, refactorMap: RefactorMap) {
        BaselineManager.config = config;
        BaselineManager.absAPI = absAPI;
        BaselineManager.refactorMap = refactorMap;
    }

    public static getBaseline(label: string) : IBaselineReport | null {
        try {
            let retVal = BaselineManager.absAPI.loadBaseline(label);
            if (retVal && retVal.results) {
                for (const result of retVal.results) {
                    if (result.ruleId in this.refactorMap) {
                        let mapping = this.refactorMap[result.ruleId].refactor[result.ruleId];
                        result.ruleId = this.refactorMap[result.ruleId].id;
                        result.reasonId = mapping[result.reasonId];
                    }
                }
            }
            return retVal;
        } catch (e) {
            // console.error("getBaseline Error:", e);
            return null;
        }
    };

    /**
     * This function is responsible for comparing the scan results with baseline or checking that there are
     * no violations which fall into the failsLevels levels. In the case a baseline is found then baseline will
     * be used to perform the check, in the case no baseline is provided then we comply with only failing if
     * there is a sinble violation which falls into failLevels.
     *
     * @param {Object} actual - the actual results object provided by the user, this object should follow the
     *                          same format as outlined in the return of aChecker.buildReport function.
     *
     * @return {int} - return 0 in the case actual matches baseline or no violations fall into failsLevels,
     *                 return 1 in the case actual results does not match baseline results,
     *                 return 2 in the case that there is a failure based on failLevels (this means no baseline found).
     *                 return -1 in the case that there is an exception that occured in the results object which came from the scan engine.
     *
     * PUBLIC API
     *
     * @memberOf this
     */
    public static assertCompliance(actualResults: IBaselineReport) : eAssertResult {

        // In the case that the details object contains Error object, this means that the scan engine through an
        // exception, therefore we should not compare results just fail instead.
        if ((actualResults as any).details && (actualResults as any).details instanceof Error) {
            return eAssertResult.ERROR;
        }

        // Get the label directly from the results object, the same label has to match
        // the baseline object which is available in the global space.
        let label = actualResults.label;

        // Fetch the baseline object based on the label provided
        let expected = BaselineManager.getBaseline(label);

        // In the case there are no baseline found then run a different assertion algo,
        // when there is baseline compare the baselines in the case there is no baseline then
        // check to make sure there are no violations that are listed in the fails on.
        if (expected !== null && typeof (expected) !== "undefined") {
            // Run the diff algo to get the list of differences
            let differences = BaselineManager.diffResultsWithExpected(actualResults, expected, true);

            // console.log("difference=" + JSON.stringify(differences, null, '    '));

            // In the case that there are no differences then that means it passed
            if (differences === null || typeof (differences) === "undefined") {
                return eAssertResult.PASS;
            } else {
                // Re-sort results and check again
                let modActual = JSON.parse(JSON.stringify(actualResults.results));
                modActual.sort((a, b) => {
                    let cc = b.category.localeCompare(a.category);
                    if (cc !== 0) return cc;
                    let pc = b.path.dom.localeCompare(a.path.dom);
                    if (pc !== 0) return pc;
                    return b.ruleId.localeCompare(a.ruleId);
                })
                let modExpected = JSON.parse(JSON.stringify(expected.results));
                modExpected.sort((a, b) => {
                    let cc = b.category.localeCompare(a.category);
                    if (cc != 0) return cc;
                    let pc = b.path.dom.localeCompare(a.path.dom);
                    if (pc !== 0) return pc;
                    return b.ruleId.localeCompare(a.ruleId);
                })
                let differences2 = BaselineManager.diffResultsWithExpected({
                    results: modActual,
                    summary: actualResults.summary
                }, {
                    results: modExpected ,
                    summary: expected.summary
                }, true);
                if (differences2 === null || typeof (differences2) === "undefined") {
                    return eAssertResult.PASS;
                } else {
                    // In the case that there are failures add the whole diff array to
                    // global space indexed by the label so that user can access it.
                    BaselineManager.diffResults[label] = differences;

                    return eAssertResult.BASELINE_MISMATCH;
                }
            }
        } else {
            // In the case that there was no baseline data found compare the results based on
            // the failLevels array, which was defined by the user.
            let returnCode = BaselineManager.compareBasedOnFailLevels(actualResults);

            // In the case there are no violations that match the fail on then return as success
            if (returnCode === 0) {
                return eAssertResult.PASS;
            } else {
                // In the case there are some violation that match in the fail on then return 2
                // to identify that there was a failure, and we used a 2nd method for compare.
                return eAssertResult.FAIL;
            }
        }
    };


    /**
     * This function is responsible for comparing actual with expected and returning all the differences as an array.
     *
     * @param {Object} actual - Provide the actual object to be used for compare
     * @param {Object} expected - Provide the expected object to be used for compare
     * @param {boolean} clean - Provide a boolean if both the actual and expected objects need to be cleaned
     *                          cleaning refers to converting the objects to match with a basic compliance
     *                          compare of xpath and ruleId.
     *
     * @return {Object} differences - return an array of diff objects that were found, following is the format of the object:
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
     *
     * PUBLIC API
     *
     * @memberOf this
     */
    public static diffResultsWithExpected(actual, expected, clean) {

        // In the case clean is set to true then run the cleanComplianceObjectBeforeCompare function on
        // both the actual and expected objects passed in. This is to make sure that the objcet follow a
        // simalar structure before compareing the objects.
        if (clean) {
            // Clean actual and expected objects
            actual = BaselineManager.cleanComplianceObjectBeforeCompare(actual);
            expected = BaselineManager.cleanComplianceObjectBeforeCompare(expected);
        }

        // Run Deep diff function to compare the actual and expected values.
        let differences = DeepDiff.diff(actual, expected);
        if (differences) {
            differences = differences.filter(difference => !(
                difference.kind === "E"
                && difference.path.length === 4
                && difference.path[2] === "bounds"
                && Math.abs(difference.lhs-difference.rhs) <= 1));
            if (differences.length === 0) return undefined;
        }

        // Return the results of the diff, which will include the differences between the objects
        return differences;
    };


    /**
     * This function is responsible for checking if any of the issues reported have any level that falls
     * into the failsLevel array.
     *
     * @param {Object} results - Provide the scan results, object which would be in the
     *                           the same format as outlined in the return of aChecker.buildReport function.
     *
     * @return {int} - return 1 in the case a single issue was found which is in the failsLevel array.
     *                 return -1 in the case that there is an exception that occured in the results object which came from the scan engine.
     *
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    public static compareBasedOnFailLevels(report) {

        // In the case that the details object contains Error object, this means that the scan engine through an
        // exception, therefore we should not compare results just fail instead.
        if (report.details && report.details instanceof Error) {
            return -1;
        }

        // Variable Decleration
        let failLevels = BaselineManager.config.failLevels;

        // Loop over all the issues to check for any level that is in failLevels
        // console.log(report);
        for (const issue of report.results) {
            // In the case current level is in the failsLevel array them fail, with out checking further
            // currently we are not saving exactly which results failed, as all the issues are going to be saved to
            // results file.
            if (failLevels.indexOf(issue.level) > -1) {
                // return 1 as there was a fialure
                return 1;
            }
        }

        // return 0 as there were no levels that fall into the failLevels
        return 0;
    };


    /**
     * This function is responsible for cleaning up the compliance baseline or actual results, based on
     * a pre-defined set of criterias, such as the following:
     *      1. No need to compare summary object
     *      2. Only need to compare the ruleId and xpath in for each of the issues
     *
     * @param {Object} objectToClean - Provide either an baseline or actual results object which would be in the
     *                                 the same format as outlined in the return of aChecker.buildReport function.
     *
     * @return {Object} objectToClean - return an object that was cleaned to only contain the information that is
     *                                  needed for compare. Following is a sample of how the cleaned object will look like:
     * {
     *     "label": "unitTestContent",
     *     "reports": [
     *         {
     *             "frameIdx": "0",
     *             "frameTitle": "Frame 0",
     *             "issues": [
     *                 {
     *                     "ruleId": "1",
     *                     "xpath": "/html[1]/head[1]/style[1]"
     *                 }
     *                 ....
     *             ]
     *         },
     *         {
     *             "frameIdx": "1",
     *             "frameTitle": "Frame 1",
     *             "issues": [
     *                 {
     *                     "ruleId": "471",
     *                     "xpath": "/html[1]/body[1]/div[2]/table[3]"
     *                 }
     *                 ....
     *             ]
     *         }
     *     ]
     * }
     *
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    public static cleanComplianceObjectBeforeCompare(objectToClean) {
        // Clone the object so that we do not reference the original or else it causes the original
        // results object or baseline object to get updated, which we do not want as users are allowed
        // access to the raw results object and baseline object.
        // Convert the object into string and then parse it as a JSON object which will lose its reference
        objectToClean = JSON.parse(JSON.stringify(objectToClean));

        // Remove the summary object, scanID, toolID, issueMessage
        delete objectToClean.summary;
        delete objectToClean.nls;
        delete objectToClean.scanID;
        delete objectToClean.toolID;
        delete objectToClean.issueMessages;
        delete objectToClean.numExecuted;


        // Loop over all the issues and remove the keys that are not needed for the compare
        // Only leave the ruleId and xpath keys for compare.
        for (let idx = 0; idx < objectToClean.results.length; ++idx) {
            const issue = objectToClean.results[idx];
            if (issue.level === "pass") {
                objectToClean.results.splice(idx--, 1);
            } else {
                issue.xpath = issue.path.dom;
                // Loop over all the keys in a single issue object and remove all the
                // keys that are not needed for compare
                Object.keys(issue).forEach(function (key) {
                    // Remove all the keys which are not in the baselineIssueList
                    if (BaselineManager.baselineIssueList.indexOf(key) === -1) {
                        delete issue[key];
                    }
                });
                // Make sure that the xpath in the case there is a [1] we replace it with ""
                // to support some browser which return it differently
                issue.xpath = issue.xpath.replace(/\[1\]/g, "");
            }
        };

        return objectToClean;
    };

    /**
     * This function is responsible for getting the diff results based on label for a scan that was already performed.
     *
     * @param {String} label - Provide a lable for which to get the diff results for.
     *
     * @return {Object} - return the diff results object from global space based on label provided, the object will be
     *                    in the same format as outlined in the return of aChecker.diffResultsWithExpected function.
     *
     * PUBLIC API
     *
     * @memberOf this
     */
    public static getDiffResults(label: string) {
        return BaselineManager.diffResults && BaselineManager.diffResults[label];
    };
}