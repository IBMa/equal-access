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
const path = require("path");
// Variable Declearation
var log;

// Global aChecker Summary Holder
var scanSummary = {};

/**
 * This function is responsible for constructing the aChecker Reporter which will be used to, report
 * the scan results, such as writing the page results and the summary to a JSON file. This reporter function
 * is registered with Karma server and triggered based on events that are triggered by the karma communication.
 *
 * @param {Object} baseReporterDecorator - the base karma reporter, which had the base functions which we override
 * @param {Object} config - All the Karma configuration, we will extract what we need from this over
 *                          all object, we need the entire object so that we detect any changes in the object
 *                          as other plugins are loaded and the object is updated dynamically.
 * @param {Object} logger - logger object which is used to log debug/error/info messages
 * @param {Object} emitter - emitter object which allows to listem on any event that is triggered and allow to execute
 *                           custom code, to handle the event that was triggered.
 *
 * @return - N/A
 *
 * @memberOf this
 */
var ACReporter = function (aChecker) {
    let resultStr = "";
    let Config = aChecker.Config;
    Config.DEBUG && console.log("START ACReporter Constructor");
    // Override adapters
    this.adapters = [];

    // This emitter function is responsible for calling this function when the info event is detected
    this.report = function(info) {
        Config.DEBUG && console.log("START 'info' emitter function");

        // Save the results of a single scan to a JSON file based on the label provided
        savePageResults(info);

        // Update the overall summary object count object to include the new scan that was performed
        addToSummaryCount(info.summary.counts);

        // Save the summary of this scan into global space of this reporter, to be logged
        // once the whole scan is done.
        addResultsToGlobal(info);

        Config.DEBUG && console.log("END 'info' emitter function");
    };

    /**
     * This function is responsible for performing any action when the entire karma run is done.
     * Overrides onRunComplete function from baseReporterDecorator
     *
     * @override
     *
     * @memberOf this
     */
    this.onRunComplete = function () {
        Config.DEBUG && console.log("START 'ACReporterCSV::onRunComplete' function");

        // Add End time when the whole karma run is done
        // End time will be in milliseconds elapsed since 1 January 1970 00:00:00 UTC up until now.
        scanSummary.endReport = Date.now();

        // Save summary object to a JSON file.
        saveSummary(scanSummary);

        Config.DEBUG && console.log("END 'ACReporterCSV::onRunComplete' function");
    };

    var toCSV = function(str) {
		if (str === null) {
			return '"null"';
		} else if (str.length == 0) {
			return '""';
		} else {
			str = str.replace(/"/g, '""');
			return `"${str}"`;
		}
	}
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
    var savePageResults = function (report) {
        Config.DEBUG && console.log("START 'savePageResults' function");

        for (const result of report.results) {
            resultStr += `${toCSV(report.label)},${toCSV(result.level)},${toCSV(result.ruleId)},${toCSV(result.message)},${toCSV(result.path.dom)},${toCSV(aChecker.getHelpURL(result))}\n`
        }

        Config.DEBUG && console.log("END 'savePageResults' function");
    }

    /**
     * This function is responsible for converting a javascript object into JSON and then writing that to a
     * json file.
     *
     * @param {String} fileName - Full path of file where the JSON object should be stored
     * @param {String} content - The javascript object which should be converted and saved to file as JSON.
     *
     * @memberOf this
     */
    var writeObjectToFile = function (fileName, content) {
        Config.DEBUG && console.log("START 'writeObjectToFileAsCSV' function");
        fileName = path.join(aChecker.Config.outputFolder, fileName);
        // Extract the parent directory of the file name that is provided
        var parentDir = pathLib.dirname(fileName);

        Config.DEBUG && console.log("Parent Directoy: \"" + parentDir + "\"");

        // In the case that the parent directoy does not exist, create the directories
        if (!fs.existsSync(parentDir)) {

            // Create the parent directory recerseivly if it does not exist.
            fs.mkdirSync(parentDir, { recursive: true});
        }

        Config.DEBUG && console.log("Object will be written to file: \"" + fileName + "\"");

        // Convert the Object into JSON string and write that to the file
        // Make sure to use utf-8 encoding to avoid an issues specify to OS.
        // In terms of the JSON string that is constructed use 4 spaces to format the JSON object, before
        // writing it to the file.
        fs.writeFileSync(fileName, content, { encoding: 'utf-8' });

        Config.DEBUG && console.log("END 'writeObjectToFileAsCSV' function");
    }

    /**
     * This function is responsible for initializing the summary object which will store all informations about the
     * scans that will occurs while karma is still running and running compliance scans.
     *
     * @return {Object} scanSummary - return the built scan summary object, which will follow the following format:
     * {
     *     "scanID": "ef3aec68-f073-4f9c-b372-421ae00bd55d",
     *     "counts": {
     *         "violation": 0,
     *         "potentialviolation": 0,
     *         "recommendation": 0,
     *         "potentialrecommendation": 0,
     *         "manual": 0
     *     },
     *     "startReport": "2016-06-06T00:52:41.603Z",
     *     "endReport": "",
     *     "toolID": "karma-ibma-v1.0.0",
     *     "policies": [
     *         "CI162_5_2_DCP070116",
     *         "CI162_5_2_DCP080115"
     *     ],
     *     "reportLevels": [
     *         "violation",
     *         "potentialviolation",
     *         "recommendation",
     *         "potentialrecommendation",
     *         "manual"
     *     ],
     *     "labels": [
     *         "Firefox",
     *         "master",
     *         "V12",
     *         "Linux"
     *     ],
     *     "pageScanSummary": {}
     * }
     *
     * @memberOf this
     */
    var initializeSummary = function (config) {
        resultStr = `Label,Level,RuleId,Message,Xpath,Help\n`
        return scanSummary;
    }

    /**
     * This function is responsible for saving the summary object of the while scan to a summary file.
     *
     * @param {Object} summary - The summary object that needs to be written to the summary file.
     *
     * @memberOf this
     */
    var saveSummary = function (summary, done) {
        if (Config.outputFormat.indexOf("csv") === -1) {
            return;
        }
        Config.DEBUG && console.log("START 'saveSummary' function");
        writeObjectToFile("results.csv", resultStr);
        Config.DEBUG && console.log("END 'saveSummary' function");
    }

    /**
     * This function is responsible for indexing the results into global spaces based on label.
     *
     * @param {Object} results - Results object which will be provided to the user/wroten to the file.
     *                           Refer to aChecker.buildReport function's return to figure out what the object
     *                           will look like.
     *
     * @return - N/A - Global object is updated with the results
     *
     * @memberOf this
     */
    var addResultsToGlobal = function (results) {
        Config.DEBUG && console.log("START 'addResultsToGlobal' function");
        Config.DEBUG && console.log("END 'addResultsToGlobal' function");
    }

    /**
     * This function is responsible for updating/creating the global violation summary for the engine karma run
     * for browser that it is running on. Will take the pageCount object which is part of the page object and
     * add extract the values for each of the levels and add them to the global object. This will provide an overall
     * summary of violations for all testcases run and all scans done.
     *
     * @param {Object} pageCount - Provide the page count object, in the following format:
     *
     * @return N/A - Global summary object is updated with the counts
     *
     * @memberOf this
     */
    var addToSummaryCount = function (pageCount) {

    }

    scanSummary = initializeSummary();

    var myThis = this;
    if (typeof(after) !== "undefined" && typeof cy === "undefined") {
        after(function(done) {
            myThis.onRunComplete();
            done && done();
        });
    } else {
        // process.on('beforeExit', function() {
        //     myThis.onRunComplete();
        // });
    }
    Config.DEBUG && console.log("END ACReporter Constructor");
};

// Export this function, which will be called when Karma loads the reporter
module.exports = ACReporter;
