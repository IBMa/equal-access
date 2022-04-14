/******************************************************************************
     Copyright:: 2020- IBM, Inc

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

// Load all the modules that are needed
var pathLib = require('path');
var fs = require('fs');
const ACReporterCommon = require("./ACReporterCommon");
const { genReport } = require("./genReport");

/**
 * This object contains all the common, variables and functions used by HTML reporter of
 * karma-ibma. This object is exported for reporter and/or nodeJS script to
 * pick up and make use of.
 *
 * Contains the following varialbles/functions:
 *
 *  Functions:
 *     savePageResults --> Saves single scan results to a file as HTML
 *     writeObjectToFileAsHTML --> Convert javascript object into HTML and write to file.
 *     saveSummary --> Saves the summary object to a summary file as HTML.
 *
 * @memberOf this
 */
var ACReporterHTML = {

    /**
     * This function is responsible for saving a single scans results to a file as HTML. On a side note
     * this function will also extract the label which will be the file names where the results will be
     * saved.
     *
     * @param {Object} config - Karma config object, used to extrat the outputFolder from the ACConfig.
     * @param {Object} results - Provide the scan results for a single page that should be saved.
     *
     * @memberOf this
     */
    savePageResults: function (config, results, rulesets) {
        ACReporterCommon.log.debug("START 'savePageResults' function");

        // Extract the outputFolder from the ACConfig (this is the user config that they provid)
        var resultDir = config.client.ACConfig.outputFolder;

        ACReporterCommon.log.debug("Results are going to be stored under results directory: \"" + resultDir + "\"");

        // Build the full file name based on the label provide in the results and also the results dir specified in the
        // configuration.
        var resultsFileName = pathLib.join(resultDir, results.label + '.html');

        /**************************************************** DEBUG INFORMATION ***************************************************************
        // Debug example which has label which has unix "/" in them.
        var resultsFileName = pathLib.join(resultDir, "dependencies/tools-rules-html/v2/a11y/test/g471/Table-layoutMultiple.html.json");

        // Debug example which has a label which has Windows "\" in them.
        var resultsFileName = pathLib.join(resultDir, "dependencies\\tools-rules-html\\v2\\a11y\\test\\g471\\Table-layoutMultiple.html.json");
        ***************************************************************************************************************************************/

        // Write the results object as HTML to a file.
        ACReporterHTML.writeObjectToFileAsHTML(resultsFileName, results, rulesets);

        ACReporterCommon.log.debug("END 'savePageResults' function");
    },

    /**
     * This function is responsible for converting a javascript object into HTML and then writing that to a
     * json file.
     *
     * @param {String} fileName - Full path of file where the HTML object should be stored
     * @param {String} content - The javascript object which should be converted and saved to file as HTML.
     *
     * @memberOf this
     */
    writeObjectToFileAsHTML: function (fileName, content, rulesets) {
        const valueMap = {
            "VIOLATION": {
                "POTENTIAL": "Needs review",
                "FAIL": "Violation",
                "PASS": "Pass",
                "MANUAL": "Needs review"
            },
            "RECOMMENDATION": {
                "POTENTIAL": "Recommendation",
                "FAIL": "Recommendation",
                "PASS": "Pass",
                "MANUAL": "Recommendation"
            }
        };

        ACReporterCommon.log.debug("START 'writeObjectToFileAsHTML' function");

        // Extract the parent directory of the file name that is provided
        var parentDir = pathLib.dirname(fileName);

        ACReporterCommon.log.debug("Parent Directoy: \"" + parentDir + "\"");

        // In the case that the parent directoy does not exist, create the directories
        if (!fs.existsSync(parentDir)) {

            // Create the parent directory recerseivly if it does not exist.
            fs.mkdirSync(parentDir, { recursive: true});
        }

        ACReporterCommon.log.debug("Object will be written to file: \"" + fileName + "\"");
        let passResults = content.results.filter((result) => {
            return result.value[1] === "PASS";
        });
        let passXpaths = passResults.map(result => result.path.dom);

        let outReport = {
            report: {
                timestamp: content.summary.startScan,
                nls: content.nls,
                results: content.results.filter((issue) => issue.value[1] !== "PASS"),
                passUniqueElements: Array.from(new Set(passXpaths)),
                counts: {
                    total: { }
                }
            },
            rulesets: rulesets,
            tabURL: content.summary.URL
        }
        outReport.report.counts.total.All = 0;
        for (const item of content.results) {
            let val = valueMap[item.value[0]][item.value[1]] || item.value[0] + "_" + item.value[1];
            outReport.report.counts.total[val] = (outReport.report.counts.total[val] || 0) + 1;    
            ++outReport.report.counts.total.All;
        }

        // Convert the Object into HTML string and write that to the file
        // Make sure to use utf-8 encoding to avoid an issues specify to OS.
        // In terms of the HTML string that is constructed use 4 spaces to format the HTML object, before
        // writing it to the file.
        fs.writeFileSync(fileName, genReport(outReport), { encoding: 'utf-8' });

        ACReporterCommon.log.debug("END 'writeObjectToFileAsHTML' function");
    },

    /**
     * This function is responsible for saving the summary object of the while scan to a summary file.
     *
     * @param {Object} config - Karma config object, used to extrat the outputFolder from the ACConfig.
     * @param {Object} summary - The summary object that needs to be written to the summary file.
     *
     * @memberOf this
     */
    saveSummary: function (config, summary) {
    }
};

// Export this function, which will be called when accessibility-checker loads
module.exports = ACReporterHTML;