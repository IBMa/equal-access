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

package com.ibm.able.equalaccess.report;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.Gson;
import com.ibm.able.equalaccess.abs.IAbstractAPI;
import com.ibm.able.equalaccess.config.ConfigInternal;
import com.ibm.able.equalaccess.engine.ACReport;
import com.ibm.able.equalaccess.engine.ACReport.Result;
import com.ibm.able.equalaccess.engine.Rule;

/**
 * This interface is responsible for aChecker baselines and comparing scans to baselines
 */
public class BaselineManager {
    private static Gson gson = new Gson();
    public static enum eAssertResult {
        ERROR(-1),
        PASS(0),
        BASELINE_MISMATCH(1),
        FAIL(2)
        ;
    
        private final int val;
    
        eAssertResult(final int val) {
            this.val = val;
        }

        int intValue() {
            return this.val;
        }
    }

    public static class DiffResult {
        public String kind = null;
        public Object[] path = new Object[]{};
        public Object lhs = null;
        public Object rhs = null;
        public Integer index = null;
        public DiffResult item = null;

        public DiffResult(String kind, Object[] path, Object lhs, Object rhs) {
            this.kind = kind;
            this.path = path;
            this.lhs = lhs;
            this.rhs = rhs;
        }

        public DiffResult(String kind, int index, Object lhs, Object rhs) {
            this.kind = kind;
            this.index = index;
            if (lhs != null && rhs != null) throw new RuntimeException("Cannot have index with lhs and rhs");
            this.item = new DiffResult(lhs != null ? "D" : "N", null, lhs, rhs);
        }
    }

    private static ConfigInternal config;
    private static Map<String, DiffResult[]> diffResults = new HashMap<>();
    private static IAbstractAPI absAPI;
    private static Map<String, Rule> refactorMap;

    public static void initialize(ConfigInternal config, IAbstractAPI absAPI, Map<String, Rule> refactorMap) {
        BaselineManager.config = config;
        BaselineManager.absAPI = absAPI;
        BaselineManager.refactorMap = refactorMap;
    }

    public static ACReport getBaseline(String label) {
        try {
            ACReport retVal = BaselineManager.absAPI.loadBaseline(label);
            if (retVal != null && retVal.results != null) {
                for (ACReport.Result result: retVal.results) {
                    if (refactorMap.containsKey(result.ruleId)) {
                        Rule rule = refactorMap.get(result.ruleId);
                        Map<String, String> mapping = rule.refactor.get(result.ruleId);
                        result.ruleId = rule.id;
                        result.reasonId = mapping.get(result.reasonId);
                    }
                }
            }
            return retVal;
        } catch (Error e) {
            // console.error("getBaseline Error:", e);
            return null;
        }
    }

    /**
     * This function is responsible for comparing the scan results with baseline or checking that there are
     * no violations which fall into the failsLevels levels. In the case a baseline is found then baseline will
     * be used to perform the check, in the case no baseline is provided then we comply with only failing if
     * there is a sinble violation which falls into failLevels.
     *
     * @param actualResults the actual results object provided by the user, this object should follow the
     *                          same format as outlined in the return of aChecker.buildReport function.
     *
     * @return return 0 in the case actual matches baseline or no violations fall into failsLevels,
     *                 return 1 in the case actual results does not match baseline results,
     *                 return 2 in the case that there is a failure based on failLevels (this means no baseline found).
     *                 return -1 in the case that there is an exception that occured in the results object which came from the scan engine.
     */
    public static eAssertResult assertCompliance(ACReport actualResults) {
        // Get the label directly from the results object, the same label has to match
        // the baseline object which is available in the global space.
        String label = actualResults.label;

        // Fetch the baseline object based on the label provided
        ACReport expected = BaselineManager.getBaseline(label);

        // In the case there are no baseline found then run a different assertion algo,
        // when there is baseline compare the baselines in the case there is no baseline then
        // check to make sure there are no violations that are listed in the fails on.
        if (expected != null) {
            // Run the diff algo to get the list of differences
            DiffResult[] differences = BaselineManager.diffResultsWithExpected(actualResults, expected);

            // console.log("difference=" + JSON.stringify(differences, null, '    '));

            // In the case that there are no differences then that means it passed
            if (differences == null || differences.length == 0) {
                return eAssertResult.PASS;
            } else {
                // Re-sort results and check again
                ACReport modActual = (ACReport) actualResults.clone();
                modActual.sortResults();
                ACReport modExpected = (ACReport) expected.clone();
                modExpected.sortResults();
                DiffResult[] differences2 = BaselineManager.diffResultsWithExpected(modActual, modExpected);
                if (differences2 == null || differences2.length == 0) {
                    return eAssertResult.PASS;
                } else {
                    // In the case that there are failures add the whole diff array to
                    // global space indexed by the label so that user can access it.
                    BaselineManager.diffResults.put(label, differences);

                    return eAssertResult.BASELINE_MISMATCH;
                }
            }
        } else {
            // In the case that there was no baseline data found compare the results based on
            // the failLevels array, which was defined by the user.
            int returnCode = BaselineManager.compareBasedOnFailLevels(actualResults);

            // In the case there are no violations that match the fail on then return as success
            if (returnCode == 0) {
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
        // Run Deep diff function to compare the actual and expected values.
        DiffResult[] differences = diff(actual, expected);
        if (differences != null && differences.length > 0) {
            differences = Arrays.stream(differences).filter(difference -> {
                return "E".equals(difference.kind)
                    && difference.path.length == 4
                    && difference.path.length > 2 && "bounds".equals(difference.path[2])
                    && Math.abs((Integer)difference.lhs-(Integer)difference.rhs) <= 1;
            }).toArray(size -> new DiffResult[size]);
            if (differences.length == 0) return null;
        }

        // Return the results of the diff, which will include the differences between the objects
        return differences;
    }

    /**
     * This function is responsible for checking if any of the issues reported have any level that falls
     * into the failsLevel array.
     *
     * @param report Provide the scan results, object which would be in the
     *                           the same format as outlined in the return of aChecker.buildReport function.
     *
     * @return return 1 in the case a single issue was found which is in the failsLevel array.
     *                 return -1 in the case that there is an exception that occured in the results object which came from the scan engine.
     */
    public static int compareBasedOnFailLevels(ACReport report) {
        // Variable Declaration
        String[] failLevels = BaselineManager.config.failLevels;

        // Loop over all the issues to check for any level that is in failLevels
        // console.log(report);
        for (ACReport.Result issue: report.results) {
            // In the case current level is in the failsLevel array them fail, with out checking further
            // currently we are not saving exactly which results failed, as all the issues are going to be saved to
            // results file.
            if (Arrays.asList(failLevels).indexOf(issue.level.toString()) > -1) {
                // return 1 as there was a fialure
                return 1;
            }
        }

        // return 0 as there were no levels that fall into the failLevels
        return 0;
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
        return diffResults.get(label);
    }

    private static DiffResult[] diff(ACReport actual, ACReport expected) {
        Result[] actualRs = actual.results;
        Result[] expectedRs = expected.results;
        ArrayList<DiffResult> retVal = new ArrayList<>();
        for (int idx=actualRs.length; idx < expectedRs.length; ++idx) {
            retVal.add(new DiffResult("A", idx, null, gson.toJson(expectedRs[idx])));
        }
        for (int idx=expectedRs.length; idx < actualRs.length; ++idx) {
            retVal.add(new DiffResult("A", idx, gson.toJson(actualRs[idx]), null));
        }
        for (int idx=0; idx<Math.min(actualRs.length, expectedRs.length); ++idx) {
            Result actualR = actualRs[idx];
            Result expectedR = expectedRs[idx];
            if (!actualR.ruleId.equals(expectedR.ruleId)) {
                retVal.add(new DiffResult("E", new Object[] { 0, "ruleId"}, actualR.ruleId, expectedR.ruleId ));
            }
            if (!actualR.path.get("dom").equals(expectedR.path.get("dom"))) {
                retVal.add(new DiffResult("E", new Object[] { 0, "xpath"}, actualR.path.get("dom"), expectedR.path.get("dom") ));
            }
        }

        return retVal.toArray(new DiffResult[retVal.size()]);
    }
}