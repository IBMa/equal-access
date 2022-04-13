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
require("../ACConfigLoader");
const { genReport } = require("./genReport");

// Global aChecker Summary Holder
var scanSummary = {};

/**
 * This function is responsible for constructing the aChecker Reporter which will be used to, report
 * the scan results, such as writing the page results and the summary to a HTML file. This reporter function
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
var ACReporterHTML = function (aChecker) {
    let Config = aChecker.Config;
    Config.DEBUG && console.log("START ACReporterHTML Constructor");
    // Override adapters
    this.adapters = [];

    // This emitter function is responsible for calling this function when the info event is detected
    this.report = function(info) {
        Config.DEBUG && console.log("START 'info' emitter function");

        // Save the results of a single scan to a HTML file based on the label provided
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
        Config.DEBUG && console.log("START 'ACReporterHTML:onRunComplete' function");

        // Add End time when the whole karma run is done
        // End time will be in milliseconds elapsed since 1 January 1970 00:00:00 UTC up until now.
        scanSummary.endReport = Date.now();

        // Save summary object to a HTML file.
        saveSummary(scanSummary);

        Config.DEBUG && console.log("END 'ACReporterHTML:onRunComplete' function");
    };

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
    var savePageResults = function (results) {
        Config.DEBUG && console.log("START 'ACReporterHTML:savePageResults' function");

        // Extract the outputFolder from the ACConfig (this is the user config that they provid)
        var resultDir = Config.outputFolder;

        Config.DEBUG && console.log("Results are going to be stored under results directory: \"" + resultDir + "\"");

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
        writeObjectToFileAsHTML(resultsFileName, results);

        Config.DEBUG && console.log("END 'ACReporterHTML:savePageResults' function");
    }

    /**
     * This function is responsible for converting a javascript object into HTML and then writing that to a
     * json file.
     *
     * @param {String} fileName - Full path of file where the HTML object should be stored
     * @param {String} content - The javascript object which should be converted and saved to file as HTML.
     *
     * @memberOf this
     */
    var writeObjectToFileAsHTML = function (fileName, content) {
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
        
        Config.DEBUG && console.log("START 'ACReporterHTML:writeObjectToFileAsHTML' function");

        // Extract the parent directory of the file name that is provided
        var parentDir = pathLib.dirname(fileName);

        Config.DEBUG && console.log("Parent Directoy: \"" + parentDir + "\"");

        // In the case that the parent directoy does not exist, create the directories
        if (!fs.existsSync(parentDir)) {

            // Create the parent directory recerseivly if it does not exist.
            fs.mkdirSync(parentDir, { recursive: true});
        }

        Config.DEBUG && console.log("Object will be written to file: \"" + fileName + "\"");

        let passResults = content.results.filter((result) => {
            return result.value[1] === "PASS";
        })
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
            rulesets: aChecker.getRulesets(),
            tabURL: content.summary.URL
        }
        outReport.report.counts.total.All = 0;
        for (const item of content.results) {
            let val = valueMap[item.value[0]][item.value[1]] || item.value[0] + "_" + item.value[1];
            outReport.report.counts.total[val] = (outReport.report.counts.total[val] || 0) + 1;    
            ++outReport.report.counts.total.All;
            item.help = aChecker.getHelpURL(item);
        }

        // Convert the Object into HTML string and write that to the file
        // Make sure to use utf-8 encoding to avoid an issues specify to OS.
        // In terms of the HTML string that is constructed use 4 spaces to format the HTML object, before
        // writing it to the file.
        fs.writeFileSync(fileName, genReport(outReport), { encoding: 'utf-8' });

        Config.DEBUG && console.log("END 'ACReporterHTML:writeObjectToFileAsHTML' function");
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
        // Variable Decleration
        var scanSummary = {};
        var reportLevels =  Config.reportLevels;

        // Initialize counts
        scanSummary.counts = {}

        // In the case that report levels are provided then populate the count object in
        // scanSummary.counts object with the levels which were provided in reportLevels
        // array.
        if (reportLevels) {

            // Iterate over the report levels and populate the pageResultsWithCount counts
            // object
            reportLevels.forEach(function (levels) {
                scanSummary.counts[levels] = 0;
            });
        }
        // Populate the scanSummary.counts object with all the levels
        else {
            scanSummary.counts = {
                "violation": 0,
                "potentialviolation": 0,
                "recommendation": 0,
                "potentialrecommendation": 0,
                "manual": 0,
                "pass": 0
            };
        }

        // Add ignored count disableIgnore field in config file is not true
        if(Config.disableIgnore == undefined || Config.disableIgnore == false || Config.disableIgnore == null){
            scanSummary.counts.ignored = 0;
        }

        // Add Start time when this script is loaded into browser
        // Start time will be in milliseconds elapsed since 1 January 1970 00:00:00 UTC up until now.
        scanSummary.startReport = Date.now();

        // Leave end report as empty for now
        scanSummary.endReport = '';

        // Add the toolID,  ruleArchive, policies, reportLevels, failLevels and labels from the config to the summary
        scanSummary.toolID = Config.toolID;
        // Append the id and the name of the archive to the report.
        scanSummary.policies = Config.policies;
        scanSummary.ruleArchive = Config.ruleArchive;
        scanSummary.reportLevels = Config.reportLevels;
        scanSummary.labels = Config.label;
        scanSummary.failLevels = Config.failLevels;

        // Add scanID (UUID) to the scan summary object
        scanSummary.scanID = Config.scanID;

        // Build the paceScanSummary object which will contains all the items that were scanned and a count
        // summary for each of the scanned items.
        scanSummary.pageScanSummary = [];

        return scanSummary;
    }

    /**
     * This function is responsible for saving the summary object of the while scan to a summary file.
     *
     * @param {Object} summary - The summary object that needs to be written to the summary file.
     *
     * @memberOf this
     */
    var saveSummary = function (summary) {

    }

    /**
     * This function is responsible for checking if a number needs a leading 0, and if it is needed
     * add the leading 0 and return that as the new number.
     *
     * @param {int} number - Provide a number to check if a leading 0 needs to be added or not.
     *
     * @return {String} number - Return the number with the leading 0 added back
     *
     * @memberOf this
     */
    var datePadding = function(number) {
        Config.DEBUG && console.log("START 'datePadding' function");

        // In the case that the number is less then 10 we need to add the leading '0' to the number.
        number = number < 10 ? '0' + number : number;

        Config.DEBUG && console.log("END 'datePadding' function");

        return number;
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

        // Build the single page summary object to follow the following format:
        //   "label": "dependencies/tools-rules-html/v2/a11y/test/g471/Table-DataNoSummaryARIA.html",
        //   "counts": {
        //       "violation": 1,
        //       "potentialviolation": 0,
        //       "recommendation": 0,
        //       "potentialrecommendation": 0,
        //       "manual": 0
        //   }
        var pageSummaryObject = {
            label: results.label,
            counts: results.summary.counts
        }

        Config.DEBUG && console.log("Adding following object to scanSummary.pageScanSummary: ");
        Config.DEBUG && console.log(pageSummaryObject);

        // Add the summary count for this scan to the pageScanSummary object which is in the global space
        // Index this by the label.
        scanSummary.pageScanSummary.push(pageSummaryObject);

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

        // Variable Decleration
        var ACScanSummary = scanSummary.counts || {};
        var addedToSummary = false;

        // In the case ACScanSummary is empty, simply assign pageCount to ACScanSummary
        if (Object.keys(ACScanSummary).length === 0) {

            // Set pageCount as the summary count
            ACScanSummary = pageCount;

            addedToSummary = true;
        }

        // In the case that this is not first scan, handle adding up the summary
        if (!addedToSummary) {
            // Go through the pageCount object and for each of the levels, extract the value
            // and add it to the aChecker violation summary object.
            // This will keep track of an overall summary of the violations for all testscases, that
            // were run for a single karma run.
            for (var level in pageCount) {
                ACScanSummary[level] += pageCount[level];
            }
        }

        // Assign the new violation summary back to the global object
        scanSummary.counts = ACScanSummary;
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

// Export this function, which will be called when accessibility-checker loads
module.exports = ACReporterHTML;