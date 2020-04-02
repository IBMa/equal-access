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

/**
 * This object contains all the common, variables and functions used by JSON reporter of
 * karma-ibma. This object is exported for reporter and/or nodeJS script to
 * pick up and make use of.
 *
 * Contains the following varialbles/functions:
 *
 *  Functions:
 *     savePageResults --> Saves single scan results to a file as JSON
 *     writeObjectToFileAsJSON --> Convert javascript object into JSON and write to file.
 *     saveSummary --> Saves the summary object to a summary file as JSON.
 *
 * @memberOf this
 */
var ACReporterJSON = {

    /**
     * This function is responsible for saving a single scans results to a file as JSON. On a side note
     * this function will also extract the label which will be the file names where the results will be
     * saved.
     *
     * @param {Object} config - Karma config object, used to extrat the outputFolder from the ACConfig.
     * @param {Object} results - Provide the scan results for a single page that should be saved.
     *
     * @memberOf this
     */
    savePageResults: function (config, results) {
        ACReporterCommon.log.debug("START 'savePageResults' function");

        // Extract the outputFolder from the ACConfig (this is the user config that they provid)
        var resultDir = config.client.ACConfig.outputFolder;

        ACReporterCommon.log.debug("Results are going to be stored under results directory: \"" + resultDir + "\"");

        // Build the full file name based on the label provide in the results and also the results dir specified in the
        // configuration.
        var resultsFileName = pathLib.join(resultDir, results.label + '.json');

        /**************************************************** DEBUG INFORMATION ***************************************************************
        // Debug example which has label which has unix "/" in them.
        var resultsFileName = pathLib.join(resultDir, "dependencies/tools-rules-html/v2/a11y/test/g471/Table-layoutMultiple.html.json");

        // Debug example which has a label which has Windows "\" in them.
        var resultsFileName = pathLib.join(resultDir, "dependencies\\tools-rules-html\\v2\\a11y\\test\\g471\\Table-layoutMultiple.html.json");
        ***************************************************************************************************************************************/

        // Write the results object as JSON to a file.
        ACReporterJSON.writeObjectToFileAsJSON(resultsFileName, results);

        ACReporterCommon.log.debug("END 'savePageResults' function");
    },

    /**
     * This function is responsible for converting a javascript object into JSON and then writing that to a
     * json file.
     *
     * @param {String} fileName - Full path of file where the JSON object should be stored
     * @param {String} content - The javascript object which should be converted and saved to file as JSON.
     *
     * @memberOf this
     */
    writeObjectToFileAsJSON: function (fileName, content) {
        ACReporterCommon.log.debug("START 'writeObjectToFileAsJSON' function");

        // Extract the parent directory of the file name that is provided
        var parentDir = pathLib.dirname(fileName);

        ACReporterCommon.log.debug("Parent Directoy: \"" + parentDir + "\"");

        // In the case that the parent directoy does not exist, create the directories
        if (!fs.existsSync(parentDir)) {

            // Create the parent directory recerseivly if it does not exist.
            fs.mkdirSync(parentDir, { recursive: true});
        }

        ACReporterCommon.log.debug("Object will be written to file: \"" + fileName + "\"");

        // Convert the Object into JSON string and write that to the file
        // Make sure to use utf-8 encoding to avoid an issues specify to OS.
        // In terms of the JSON string that is constructed use 4 spaces to format the JSON object, before
        // writing it to the file.
        fs.writeFileSync(fileName, JSON.stringify(content, null, '    '), { encoding: 'utf-8' });

        ACReporterCommon.log.debug("END 'writeObjectToFileAsJSON' function");
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
        ACReporterCommon.log.debug("START 'saveSummary' function");

        // Fetch the start time of the report from the summary object
        var startReportTime = summary.startReport;

        // Extract the outputFolder from the ACConfig (this is the user config that they provid)
        var resultDir = config.client.ACConfig.outputFolder;

        ACReporterCommon.log.debug("Converting: " + startReportTime);

        // Now we need to take the from epoch format date and convert it to readable data
        // Construct a new Data object with the start report time
        var formattedData = new Date(startReportTime);

        // Extract all the date fields which are needed to construct the filename
        var year = ACReporterCommon.datePadding(formattedData.getUTCFullYear());
        var month = ACReporterCommon.datePadding(formattedData.getUTCMonth()+1); // UTC Month is provid in a range of A Number, from 0-11, representing the month
        var date = ACReporterCommon.datePadding(formattedData.getUTCDate());
        var hour = ACReporterCommon.datePadding(formattedData.getHours());
        var minute = ACReporterCommon.datePadding(formattedData.getMinutes());
        var seconds = ACReporterCommon.datePadding(formattedData.getUTCSeconds());

        ACReporterCommon.log.debug("Year: " + year);
        ACReporterCommon.log.debug("Month: " + month);
        ACReporterCommon.log.debug("Date: " + date);
        ACReporterCommon.log.debug("Hour: " + hour);
        ACReporterCommon.log.debug("Minute: " + minute);
        ACReporterCommon.log.debug("Seconds: " + seconds);

        // Build the summary file name based on the following format: summary_2016-06-20-13-26-45GMT.json
        //  summary_<year>-<month>-<date>-<hour>-<minute>-<seconds>GMT.json
        var filename = "summary_" + year + "-" + month + "-" + date + "-" + hour + "-" + minute + "-" + seconds + "GMT.json";

        // Add the results dir to the filename so that all the summary files can be saved under the output folder
        filename = pathLib.join(resultDir, filename);

        ACReporterCommon.log.debug("Filename Constructed: " + filename);

        // Write the summary object as json to the summary file.
        ACReporterJSON.writeObjectToFileAsJSON(filename, summary);

        ACReporterCommon.log.debug("END 'saveSummary' function");
    }
};

// Export this function, which will be called when accessibility-checker loads
module.exports = ACReporterJSON;