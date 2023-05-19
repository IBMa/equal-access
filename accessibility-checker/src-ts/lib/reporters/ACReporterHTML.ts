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
import * as pathLib from "path";
import * as fs from "fs";
import { ACEngineManager } from "../ACEngineManager.js";
import { IConfigUnsupported } from "../api/IChecker.js";
import { IScanSummary } from "./ReportUtil.js";
import { genReport } from "./genReport.js";

declare var after;

/**
 * This function is responsible for constructing the aChecker Reporter which will be used to, report
 * the scan results, such as writing the page results and the summary to a HTML file. This reporter function
 * is registered with Karma server and triggered based on events that are triggered by the karma communication.
 *
 * @param {Object} baseReporterDecorator - the base karma reporter, which had the base functions which we override
 * @param {Object} this.Config - All the Karma this.Configuration, we will extract what we need from this over
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
export class ACReporterHTML {
    Config: IConfigUnsupported;
    scanSummary: IScanSummary

    constructor(config: IConfigUnsupported, scanSummary: IScanSummary) {
        this.scanSummary = JSON.parse(JSON.stringify(scanSummary));
        this.Config = config;
        this.Config.DEBUG && console.log("START ACReporter Constructor");

        let myThis = this;
        if (typeof(after) !== "undefined") {
            after(function(done) {
                myThis.onRunComplete();
                done && done();
            });
        } else {
            process.on('beforeExit', function() {
                myThis.onRunComplete();
            });
        }
        this.Config.DEBUG && console.log("END ACReporter Constructor");
    }

    // This emitter function is responsible for calling this function when the info event is detected
    async report(info) {
        this.Config.DEBUG && console.log("START 'info' emitter function");

        // Save the results of a single scan to a HTML file based on the label provided
        await this.savePageResults(info);

        // Update the overall summary object count object to include the new scan that was performed
        this.addToSummaryCount(info.summary.counts);

        // Save the summary of this scan into global space of this reporter, to be logged
        // once the whole scan is done.
        this.addResultsToGlobal(info);

        this.Config.DEBUG && console.log("END 'info' emitter function");
    };

    /**
     * This function is responsible for performing any action when the entire karma run is done.
     * Overrides onRunComplete function from baseReporterDecorator
     *
     * @override
     *
     * @memberOf this
     */
    onRunComplete() {
        this.Config.DEBUG && console.log("START 'ACReporterHTML:onRunComplete' function");

        // Add End time when the whole karma run is done
        // End time will be in milliseconds elapsed since 1 January 1970 00:00:00 UTC up until now.
        this.scanSummary.endReport = Date.now();

        // Save summary object to a HTML file.
        this.saveSummary(this.scanSummary);

        this.Config.DEBUG && console.log("END 'ACReporterHTML:onRunComplete' function");
    };

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
    addResultsToGlobal(results) {
        this.Config.DEBUG && console.log("START 'addResultsToGlobal' function");

        // Build the single page summary object to follow the following format:
        //   "label": "dependencies/tools-rules-html/v2/a11y/test/g471/Table-DataNoSummaryARIA.html",
        //   "counts": {
        //       "violation": 1,
        //       "potentialviolation": 0,
        //       "recommendation": 0,
        //       "potentialrecommendation": 0,
        //       "manual": 0
        //   }
        let pageSummaryObject = {
            label: results.label,
            counts: results.summary.counts
        }

        this.Config.DEBUG && console.log("Adding following object to scanSummary.pageScanSummary: ");
        this.Config.DEBUG && console.log(pageSummaryObject);

        // Add the summary count for this scan to the pageScanSummary object which is in the global space
        // Index this by the label.
        this.scanSummary.pageScanSummary.push(pageSummaryObject);

        this.Config.DEBUG && console.log("END 'addResultsToGlobal' function");
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
    addToSummaryCount = function (pageCount) {
        // Variable Decleration
        let ACScanSummary = this.scanSummary.counts || {};
        let addedToSummary = false;

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
            for (let level in pageCount) {
                ACScanSummary[level] += pageCount[level];
            }
        }

        // Assign the new violation summary back to the global object
        this.scanSummary.counts = ACScanSummary;
    }


    /**
     * This function is responsible for saving a single scans results to a file as HTML. On a side note
     * this function will also extract the label which will be the file names where the results will be
     * saved.
     *
     * @param {Object} this.Config - Karma this.Config object, used to extrat the outputFolder from the ACthis.Config.
     * @param {Object} results - Provide the scan results for a single page that should be saved.
     *
     * @memberOf this
     */
    async savePageResults(results) {
        this.Config.DEBUG && console.log("START 'savePageResults' function");

        // Extract the outputFolder from the ACthis.Config (this is the user this.Config that they provid)
        let resultDir = this.Config.outputFolder;

        this.Config.DEBUG && console.log("Results are going to be stored under results directory: \"" + resultDir + "\"");

        // Build the full file name based on the label provide in the results and also the results dir specified in the
        // this.Configuration.
        let resultsFileName = pathLib.join(resultDir, results.label.replace(/[:?&=]/g,"_") + '.html');

        /**************************************************** DEBUG INFORMATION ***************************************************************
        // Debug example which has label which has unix "/" in them.
        let resultsFileName = pathLib.join(resultDir, "dependencies/tools-rules-html/v2/a11y/test/g471/Table-layoutMultiple.html.json");

        // Debug example which has a label which has Windows "\" in them.
        let resultsFileName = pathLib.join(resultDir, "dependencies\\tools-rules-html\\v2\\a11y\\test\\g471\\Table-layoutMultiple.html.json");
        ***************************************************************************************************************************************/

        // Write the results object as HTML to a file.
        await this.writeObjectToFileAsHTML(resultsFileName, results);

        this.Config.DEBUG && console.log("END 'savePageResults' function");
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
    async writeObjectToFileAsHTML(fileName, content) {
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
        
        this.Config.DEBUG && console.log("START 'writeObjectToFileAsHTML' function");

        // Extract the parent directory of the file name that is provided
        let parentDir = pathLib.dirname(fileName);

        this.Config.DEBUG && console.log("Parent Directoy: \"" + parentDir + "\"");

        // In the case that the parent directoy does not exist, create the directories
        if (!fs.existsSync(parentDir)) {

            // Create the parent directory recerseivly if it does not exist.
            fs.mkdirSync(parentDir, { recursive: true});
        }

        this.Config.DEBUG && console.log("Object will be written to file: \"" + fileName + "\"");
        let passResults = content.results.filter((result: any) => {
            return result.value[1] === "PASS";
        })
        let passXpaths : string[] = passResults.map((result: any) => result.path.dom);

        let outReport = {
            report: {
                timestamp: content.summary.startScan,
                nls: content.nls,
                results: content.results.filter((issue: any) => issue.value[1] !== "PASS"),
                passUniqueElements: Array.from(new Set(passXpaths)),
                counts: {
                    total: { 
                        All: 0
                    }
                }
            },
            rulesets: await ACEngineManager.getRulesets(),
            tabURL: content.summary.URL
        }
        for (const item of content.results) {
            let val = valueMap[item.value[0]][item.value[1]] || item.value[0] + "_" + item.value[1];
            outReport.report.counts.total[val] = (outReport.report.counts.total[val] || 0) + 1;    
            ++outReport.report.counts.total.All;
            item.help = ACEngineManager.getHelpURL(item);
        }

        // Convert the Object into HTML string and write that to the file
        // Make sure to use utf-8 encoding to avoid an issues specify to OS.
        // In terms of the HTML string that is constructed use 4 spaces to format the HTML object, before
        // writing it to the file.
        fs.writeFileSync(fileName, genReport(outReport), { encoding: 'utf-8' });

        this.Config.DEBUG && console.log("END 'writeObjectToFileAsHTML' function");
    }

    /**
     * This function is responsible for saving the summary object of the while scan to a summary file.
     *
     * @param {Object} summary - The summary object that needs to be written to the summary file.
     *
     * @memberOf this
     */
    saveSummary(summary) {

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
    datePadding(number) {
        this.Config.DEBUG && console.log("START 'datePadding' function");

        // In the case that the number is less then 10 we need to add the leading '0' to the number.
        number = number < 10 ? '0' + number : number;

        this.Config.DEBUG && console.log("END 'datePadding' function");

        return number;
    }
};
