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

/*******************************************************************************
 * NAME: ACReporterCommon.js
 * DESCRIPTION: Used to store all the common karma-ibma reporter functions.

 *******************************************************************************/

/**
 * This object contains all the common, variables and functions used by all types of
 * karma-ibma reporters. This object is exported for reproter or and nodeJS script to
 * pick up and make use of.
 *
 * Contains the following varialbles/functions:
 *
 *  Variables:
 *     scanTime --> Stores all the scan times for a11y testcase.
 *     scanSummary --> Stores the summary of the a11y scans.
 *     log --> Logger to log debug information to console (needs to be a logger)
 *  Functions:
 *     savePageResults --> Saves single scan results to a file as JSON
 *     writeObjectToFileAsJSON --> Convert javascript object into JSON and write to file.
 *     initializeSummary --> Initializes the summary object for karma-ibma.
 *     saveSummary --> Saves the summary object to a summary file as JSON.
 *     datePadding --> Addes padding to the data if leading 0 is needed.
 *     addResultsToGlobal --> Index the summary of single page results into global space based on label.
 *     addToSummaryCount --> Updates the violation count which will be written to summary file.
 *     profile --> Addes single test run scan time into global array.
 *     sendLogs --> Uploads metrics to server 
 *     truncateMetricsLogsUpload --> Truncates the scanTime array into groups of 150 to upload to the metrics serevr in chunks.
 *
 * @memberOf this
 */
var ACReporterCommon = {

    // Stores all the scan Times for testcase runs, theses will be uploaded to metrics server.
    scanTime: [],

    // Stores the summary of the a11y scans
    scanSummary: {},

    // Stores the logger which is used to log debug information
    // Note: The Reporter would beed to create the logger and set it before calling any functions.
    log: null,

    /**
     * This function is responsible for initializing the summary object which will store all informations about the
     * scans that will occurs while karma is still running and running compliance scans.
     *
     * @param {Object} config - Karma config object, used to extrat the outputFolder from the ACConfig.
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
     *     "startReport": "1479186253739",
     *     "endReport": "1479186253739",
     *     "toolID": "karma-ibma-v1.0.0",
     *     "policies": [
     *         "IBM_Accessibility_2018_08",
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
    initializeSummary: function (config) {
        ACReporterCommon.log.debug("START 'initializeSummary' function");

        // Variable Decleration
        var scanSummary = {};
        var reportLevels = config.client.ACConfig.reportLevels;

        ACReporterCommon.log.debug("Start Building scan Summary object");

        // Initialize counts
        scanSummary.counts = {};

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

        if(config.disableIgnore == undefined || config.disableIgnore == false || config.disableIgnore == null){
            scanSummary.counts.ignored = 0;
        }

        // Add Start time when this script is loaded into browser
        // Start time will be in milliseconds elapsed since 1 January 1970 00:00:00 UTC up until now.
        scanSummary.startReport = Date.now();

        // Leave end report as empty for now
        scanSummary.endReport = '';

        // Add the toolID, policies, rule archive, reportLevels, failLevels and labels from the config to the summary
        scanSummary.toolID = config.client.ACConfig.toolID;
        scanSummary.policies = config.client.ACConfig.policies;
        scanSummary.ruleArchive = config.client.ACConfig.ruleArchive;
        scanSummary.reportLevels = config.client.ACConfig.reportLevels;
        scanSummary.labels = config.client.ACConfig.label;
        scanSummary.failLevels = config.client.ACConfig.failLevels;

        // Add scanID (UUID) to the scan summary object
        scanSummary.scanID = config.client.ACConfig.scanID;

        // Build the paceScanSummary object which will contains all the items that were scanned and a count
        // summary for each of the scanned items.
        scanSummary.pageScanSummary = [];

        ACReporterCommon.log.debug("Built scan Summary object");
        ACReporterCommon.log.debug(scanSummary);

        ACReporterCommon.log.debug("END 'initializeSummary' function");

        return scanSummary;
    },

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
    datePadding: function (number) {
        ACReporterCommon.log.debug("START 'datePadding' function");

        // In the case that the number is less then 10 we need to add the leading '0' to the number.
        number = number < 10 ? '0' + number : number;

        ACReporterCommon.log.debug("END 'datePadding' function");

        return number;
    },

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
    addResultsToGlobal: function (results) {
        ACReporterCommon.log.debug("START 'addResultsToGlobal' function");

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
        };

        ACReporterCommon.log.debug("Adding following object to scanSummary.pageScanSummary: ");
        ACReporterCommon.log.debug(pageSummaryObject);

        // Add the summary count for this scan to the pageScanSummary object which is in the global space
        // Index this by the label.
        ACReporterCommon.scanSummary.pageScanSummary.push(pageSummaryObject);

        ACReporterCommon.log.debug("END 'addResultsToGlobal' function");
    },

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
    addToSummaryCount: function (pageCount) {

        ACReporterCommon.log.debug("START 'addToSummaryCount' function");

        // Variable Decleration
        var ACScanSummary = ACReporterCommon.scanSummary.counts || {};
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
        ACReporterCommon.scanSummary.counts = ACScanSummary;

        ACReporterCommon.log.debug("END 'addToSummaryCount' function");
    }
};

// Export all the common function for karma-ibma reporters
module.exports = ACReporterCommon;