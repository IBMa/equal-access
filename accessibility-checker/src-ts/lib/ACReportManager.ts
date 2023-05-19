import { eAssertResult, ICheckerError, ICheckerReport, ICheckerReportCounts, ICheckerResult, IConfigUnsupported, ILogger, ReportResult } from "./api/IChecker.js";
import { ACConfigManager } from "./ACConfigManager.js";
import { ACMetricsLogger } from "./log/ACMetricsLogger.js";
import * as path from "path";
import { ACEngineManager } from "./ACEngineManager.js";
import { ruleIdToLegacyId } from "../index.js";
import DeepDiff from 'deep-diff';
import { ACReporterCSV } from "./reporters/ACReporterCSV.js";
import { ACReporterXLSX } from "./reporters/ACReporterXLSX.js";
import { initializeSummary, IScanSummary } from "./reporters/ReportUtil.js";
import { ACReporterHTML } from "./reporters/ACReporterHTML.js";
import { ACReporterJSON } from "./reporters/ACReporterJSON.js";
import { eRuleLevel, Report, Rule } from "./api/IEngine.js";
import { readFileSync } from "fs";

export class ACReportManager {
    static config: IConfigUnsupported;
    static reporters: {
        html: any,
        json: any,
        csv: any,
        xlsx: any
    }

    static refactorMap : {
        [oldRuleId: string]: Rule
    }

    // Array that contains the list of entries that need to be compared between the actual and baseline objects only.
    // Note: This is used by the cleanComplianceObjectBeforeCompare function to filter the report based on this.
    static baselineIssueList = ["ruleId", "xpath"];

    static metricsLogger;

    static scanSummary: IScanSummary;

    static diffResults;

    static scanResults;

    static async initialize(logger: ILogger) {
        if (ACReportManager.config) return;
        ACReportManager.config = await ACConfigManager.getConfigUnsupported();
        if (ACReportManager.config.ruleServer.includes("localhost")) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }
        // Initialize the scanSummary object with summary information for accessibility-checker
        ACReportManager.scanSummary = initializeSummary(ACReportManager.config);

        ACReportManager.reporters = {
            html: new ACReporterHTML(ACReportManager.config, ACReportManager.scanSummary),
            json: new ACReporterJSON(ACReportManager.config, ACReportManager.scanSummary),
            csv: new ACReporterCSV(ACReportManager.config, ACReportManager.scanSummary),
            xlsx: new ACReporterXLSX(ACReportManager.config, ACReportManager.scanSummary)
        }

        ACReportManager.metricsLogger = new ACMetricsLogger("accessibility-checker", logger, ACReportManager.config.policies);

        // Initialize the global object which will store all the diff results for a scan that is run, using
        // actual and expected.
        ACReportManager.diffResults = {};

        // Initialize the global object which will store all the scan results indexed by the label.
        ACReportManager.scanResults = {};
    }


    /**
     * This function is responsible for checking if the provided label is unique or not.
     *
     * @param {String} label - Provide the label which should be checked if it exists or not
     *
     * @return {boolean} labelExists - return false if the label is not unique, otherwise return true
     *
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    static isLabelUnique(label: string) {
        ACReportManager.config.DEBUG && console.log("ACReportManager:START 'aChecker.isLabelUnique' function");

        // Variable Decleration
        let labelExists = false;

        ACReportManager.config.DEBUG && console.log("Checking if label: " + label + " is unique.");

        // Check if the label that is provided was already used or not, by simply calling the some API on the array
        // and passing it a callback function which checks if the label exists in the global paceScanSummary object.
        labelExists = ACReportManager.scanSummary.pageScanSummary.some(function (scanSummary) {
            return scanSummary.label === label;
        });

        ACReportManager.config.DEBUG && console.log("END 'aChecker.isLabelUnique' function");

        return !labelExists;
    };

    /**
     * This function is responsible for sending the scan results to the karma server accessibility-checker reporter. The
     * accessibility-checker reporter is responsible for writing the results to a file. The reporter will also keep track of
     * the summary results, on the server side.
     *
     * @param {Object} results - Provide the full results object which is to be reported/saved to file.
     *                           refer to return in function "aChecker.buildReport" prolog
     *
     * @return N/A
     *
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    static async sendResultsToReporter(unFilteredResults, results, profile) {
        ACReportManager.config.DEBUG && console.log("ACReportManager:sendResultsToReporter:", ACReportManager.config.outputFormat);
        if (ACReportManager.config.outputFormat.indexOf("json") != -1) {
            ACReportManager.reporters.json.report(results);
        }
        if (ACReportManager.config.outputFormat.includes("csv")) {
            ACReportManager.reporters.csv.report(results);
        }
        if (ACReportManager.config.outputFormat.includes("xlsx")) {
            ACReportManager.reporters.xlsx.report(results);
        }
        if (ACReportManager.config.outputFormat.indexOf("html") != -1) {
            await ACReportManager.reporters.html.report(unFilteredResults);
        }
        // Only perform the profiling if profiling was not disabled on purpose
        if (!ACReportManager.config.label || ACReportManager.config.label.indexOf("IBMa-Node-TeSt") === -1) {
            // Meter the usage here
            ACReportManager.metricsLogger.profileV2(results.summary.scanTime, profile);
        }
    };

    static sendScreenShotToReporter(screenshotResult) {
    };

    /**
     * This function is responsible for building the results object in a specific format which will be provided back to
     * the user to do any thing they want to do with it. (compare, print it, save to db, etc...)
     *
     * Note: This function converts it to match with the following format outlined at:
     *       https://github.com/IBMa/equal-access/tree/master/karma-accessibility-checker
     *
     * @param {Object} results - The results object which we need to build the report based on, following is the format the
     *                           object needs to follow:
     *  {
     *      "report": {
     *          "numChecked": 227,
     *          "numTrigger": 1,
     *          "ruleTime": 5,
     *          "totalTime": 8,
     *          "issues": [
     *              {
     *                  "severityCode": "eISHigh",
     *                  "messageCode": "rpt.g377.elemUniqueId",
     *                  "ruleId": "377",
     *                  "help": "idhi_accessibility_check_g377.html",
     *                  "msgArgs": [
     *                      "div",
     *                      "firstDiv"
     *                  ],
     *                  "xpath": "/html[1]/body[1]/div[2]/div[2]",
     *                  "snippet": "<div id=\"firstDiv\">",
     *                  "bounds": {
     *                      "left": 10,
     *                      "top": 181,
     *                      "height": 0,
     *                      "width": 1249
     *                  },
     *                  "level": "violation"
     *              }
     *          ],
     *          "docTitle": "Helo World"
     *      },
     *      "counts": {
     *          "violation": 1,
     *          "potentialviolation": 0,
     *          "recommendation": 0,
     *          "potentialrecommendation": 0,
     *          "manual": 0
     *      },
     *      "issueMessages": {
     *          "messages": {
     *              "rpt.g377.elemUniqueId": "The {0} element has the id \"{1}\" that is either empty or already in use."
     *          },
     *          "lang": "en-us"
     *      }
     *  }
     *
     * @param {String} URL - The URL which the report is being built for
     * @param {String} label - A label to identify what this report is going to be for, in the case not using URL or local files.
     * @param {String} startScan - The start time of the scan.
     *
     * @return {Object} results - return the formatted results based in the following format:
     *
     * {
     *     "scanID": "ef3aec68-f073-4f9c-b372-421ae00bd55d",
     *     "toolID": "karma-ibma-v1.0.0",
     *     "summary": {
     *         "counts": {
     *             "violation": 5,
     *             "potentialviolation": 0,
     *             "recommendation": 5,
     *             "potentialrecommendation": 0,
     *             "manual": 1
     *         },
     *         "scanTime": 80,
     *         "policies": [
     *             "CI162_5_2_DCP080115"
     *         ],
     *         "reportLevels": [
     *             "violation",
     *             "potentialviolation",
     *             "recommendation",
     *             "potentialrecommendation",
     *             "manual"
     *         ],
     *         "startScan": "2016-06-06T00:52:41.603Z"
     *     },
     *     "URL": "",
     *     "label": "unitTestContent",
     *     "screenshot": "<placeholder>",
     *     "issueMessages": {
     *         "messages": {
     *             "rpt.g377.elemUniqueId": "The {0} element has the id \"{1}\" that is either empty or already in use."
     *         },
     *         "lang": "en-us"
     *     },
     *     "reports": [
     *         {
     *             "frameIdx": "0",
     *             "frameTitle": "Frame 0",
     *             "issues": [
     *                 {
     *                     "severity": "Low",
     *                     "message": "If style sheets are ignored or unsupported, ensure that pages are still readable and usable.",
     *                     "messageCode": "rpt.g1.styleTrigger",
     *                     "ruleId": "1",
     *                     "help": "idhi_accessibility_check_g1.html",
     *                     "msgArgs": [],
     *                     "bounds": {
     *                         "left": 0,
     *                         "top": 0,
     *                         "height": 0,
     *                         "width": 0
     *                     },
     *                     "level": "manual",
     *                     "xpath": "/html[1]/head[1]/style[1]",
     *                     "snippet": "<style type=\"text/css\">"
     *                 }
     *                 ....
     *             ]
     *         },
     *         {
     *             "frameIdx": "1",
     *             "frameTitle": "Frame 1",
     *             "issues": [
     *                 {
     *                     "severity": "High",
     *                     "message": "The table element with WAI-ARIA presentation role has structural element(s) and/or attribute(s) td.",
     *                     "messageCode": "rpt.g471.tableStructure",
     *                     "ruleId": "471",
     *                     "help": "idhi_accessibility_check_g471.html",
     *                     "msgArgs": [
     *                         "table",
     *                         "td"
     *                     ],
     *                     "bounds": {
     *                         "left": 10,
     *                         "top": 990,
     *                         "height": 219,
     *                         "width": 335
     *                     },
     *                     "level": "violation",
     *                     "xpath": "/html[1]/body[1]/div[2]/table[3]",
     *                     "snippet": "<table id=\"layout_table3\" role=\"presentation\">"
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
    static buildReport(inReport: Report, counts: ICheckerReportCounts, URL, label, startScan) : ICheckerReport {
        let report : ICheckerReport = JSON.parse(JSON.stringify(inReport));
        // Build the scan summary object which will be added to the build report
        // Note: This summary is only for this single scan.
        report.summary = {
            counts: counts,
            scanTime: inReport.totalTime,
            ruleArchive: ACReportManager.config.ruleArchiveLabel,
            policies: ACReportManager.config.policies,
            reportLevels: ACReportManager.config.reportLevels,
            startScan: startScan,
            URL: URL
        };

        // Add scanID (UUID) to the individual pages
        report.scanID = ACReportManager.config.scanID;

        // Add toolID to the individual pages
        report.toolID = ACReportManager.config.toolID;

        // Add the URL to the object it it is defined
        if (URL !== null && typeof URL !== "undefined") {
            report.summary.URL = URL;
        }

        // Add the label to the result object, label should always be
        // defined no matter what as it is required to be provided by the user.
        report.label = label;

        // Add the screenshot base64 object to the results object
        // TODO: Find a way to actually extract the screenshot, since karma
        // allows the use of any browesr, some browser do not allow taking screenshot
        // so would have to alalyze which browser allow it and take it for only those.
        // PhantonJS, any selenium drived browser.
        //results.screenshot = "<placeholder>";

        // Clean up the results object
        delete (report as any).counts;
        delete (report as any).ruleTime;
        delete (report as any).totalTime;

        // set ignore:true for previously seen violations
        // retrieve baseline
        let baselineReport = ACReportManager.getBaseline(label);

        // set ignore:true for previously seen violations and set ignore to false if no ignore fields exist yet
        if (baselineReport) {
            report = ACReportManager.ignoreExtraBaselineViolations(report, baselineReport);
        }
        else { //add ignored field
            report.summary.counts.ignored = 0;
        }

        let lvlIdx = {
            "violation": 1,
            "potentialviolation": 2,
            "recommendation": 3,
            "potentialrecommendation": 4,
            "manual": 5,
            "pass": 6
        };

        report.results.sort(function (a, b) {
            let aLvl = lvlIdx[a.level];
            let bLvl = lvlIdx[b.level];
            if (!aLvl) aLvl = 7;
            if (!bLvl) bLvl = 7;
            return aLvl != bLvl && aLvl - bLvl ||
                b.ruleId != a.ruleId && b.ruleId.localeCompare(a.ruleId) ||
                b.path.dom.localeCompare(a.path.dom);
        });

        return report;
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
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    static addResultsToGlobal = function (results: ICheckerReport) {

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
        };

        // Add the summary count for this scan to the pageScanSummary object which is in the global space
        // Index this by the label.
        ACReportManager.scanSummary.pageScanSummary.push(pageSummaryObject);

        // Add the scan results to global space
        ACReportManager.scanResults[results.label] = results;
    };


    /**
     * This function is responsible for filtering the violations so that, only the violations levels that
     * are provided in reportLevels are presented in the report.
     *
     * TODO: Possibly we can add this to the engine, so that the results are not provided by the engine
     *       when user has provided the reportLevels object.
     *
     * @param {Object} results - Provide the violation results, which follow the following format:
     *  {
     *      "report": {
     *          "numChecked": 227,
     *          "numTrigger": 1,
     *          "ruleTime": 5,
     *          "totalTime": 8,
     *          "issues": [
     *              {
     *                  "severityCode": "eISHigh",
     *                  "messageCode": "rpt.g377.elemUniqueId",
     *                  "ruleId": "377",
     *                  "help": "idhi_accessibility_check_g377.html",
     *                  "msgArgs": [
     *                      "div",
     *                      "firstDiv"
     *                  ],
     *                  "xpath": "/html[1]/body[1]/div[2]/div[2]",
     *                  "snippet": "<div id=\"firstDiv\">",
     *                  "bounds": {
     *                      "left": 10,
     *                      "top": 181,
     *                      "height": 0,
     *                      "width": 1249
     *                  },
     *                  "level": "violation"
     *              }
     *          ],
     *          "docTitle": "Helo World"
     *      },
     *      "counts": {
     *          "level.violation": 1,
     *          "level.potentialviolation": 0,
     *          "level.recommendation": 0,
     *          "level.potentialrecommendation": 0,
     *          "level.manual": 0
     *      },
     *      "issueMessages": {
     *          "messages": {
     *              "rpt.g377.elemUniqueId": "The {0} element has the id \"{1}\" that is either empty or already in use."
     *          },
     *          "lang": "en-us"
     *      }
     *  }
     *
     * @return {Object} results - return results object which only contains the violation that were requested,
     *                            follows the following format:
     *  {
     *      "report": {
     *          "numChecked": 227,
     *          "numTrigger": 1,
     *          "ruleTime": 5,
     *          "totalTime": 8,
     *          "issues": [
     *              {
     *                  "severityCode": "eISHigh",
     *                  "messageCode": "rpt.g377.elemUniqueId",
     *                  "ruleId": "377",
     *                  "help": "idhi_accessibility_check_g377.html",
     *                  "msgArgs": [
     *                      "div",
     *                      "firstDiv"
     *                  ],
     *                  "xpath": "/html[1]/body[1]/div[2]/div[2]",
     *                  "snippet": "<div id=\"firstDiv\">",
     *                  "bounds": {
     *                      "left": 10,
     *                      "top": 181,
     *                      "height": 0,
     *                      "width": 1249
     *                  },
     *                  "level": "violation"
     *              }
     *          ],
     *          "docTitle": "Helo World"
     *      },
     *      "counts": {
     *          "level.violation": 1,
     *          "level.potentialviolation": 0,
     *          "level.recommendation": 0,
     *          "level.potentialrecommendation": 0,
     *          "level.manual": 0
     *      },
     *      "issueMessages": {
     *          "messages": {
     *              "rpt.g377.elemUniqueId": "The {0} element has the id \"{1}\" that is either empty or already in use."
     *          },
     *          "lang": "en-us"
     *      }
     *  }
     *
     *  The return object is pretty much filtered failures (results.report.fail), wrapped around another object with extra frameIdx value.
     *
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    static filterViolations(report: Report) : Report {

        // Variable Decleration
        let reportLevels = ACReportManager.config.reportLevels;
        let pageResults = report.results;

        // Loop over all the violations and filter them, if the violation level does not match with, what user has
        // requested to be reported. Also handle hidden at this point right now.
        // TODO: Posible to filter the results directly in the engine, to avoid the need to do all this in each of the tools.
        for (let i = 0; i < pageResults.length; ++i) {
            // Remove violation which are not in the reportLevels
            if (reportLevels) {
                let reportLevel = pageResults[i].level;

                // Make sure the level is actually defined before trying to perform any action on it
                if (reportLevel !== null && typeof reportLevel !== "undefined") {
                    // Remove the violation from the object if report level is not in the reportLevels array.
                    if (reportLevels.indexOf(reportLevel) === -1) {
                        pageResults.splice(i--, 1);
                        continue;
                    }
                } else {
                    // In the case that level is null or not found remove this violation from the results.
                    pageResults.splice(i--, 1);
                }
            }
        }

        return report;
    };

    static setLevels(report: Report) : Report {
        // Variable Decleration
        let reportLevels = ACReportManager.config.reportLevels;
        let pageResults = report.results;

        // Loop over all the violations and filter them, if the violation level does not match with, what user has
        // requested to be reported. Also handle hidden at this point right now.
        // TODO: Posible to filter the results directly in the engine, to avoid the need to do all this in each of the tools.
        for (const pageResult of pageResults) {

            // Set the default ignore value to false if disableIgnore field in config file is not true
            pageResult.ignored = false;

            // Remove violation which are not in the reportLevels
            if (reportLevels) {
                // Fetch the level from the results
                let reportValue = pageResult.value;
                let reportLevel : eRuleLevel;
                if (reportValue[1] === "PASS") {
                    reportLevel = eRuleLevel.pass;
                } else if ((reportValue[0] === "VIOLATION" || reportValue[0] === "RECOMMENDATION") && reportValue[1] === "MANUAL") {
                    reportLevel = eRuleLevel.manual;
                } else if (reportValue[0] === "VIOLATION") {
                    if (reportValue[1] === "FAIL") {
                        reportLevel = eRuleLevel.violation;
                    } else if (reportValue[1] === "POTENTIAL") {
                        reportLevel = eRuleLevel.potentialviolation;
                    }
                } else if (reportValue[0] === "RECOMMENDATION") {
                    if (reportValue[1] === "FAIL") {
                        reportLevel = eRuleLevel.recommendation;
                    } else if (reportValue[1] === "POTENTIAL") {
                        reportLevel = eRuleLevel.potentialrecommendation;
                    }
                }
                pageResult.level = reportLevel;
            }
        }

        return report;
    }

    /**
     * This function is responsible for iterating over all the issue elements and updating the counts object.
     *
     * @param {Object} pageResults - Provide the page results object, in the following format:
     *  {
     *      "report": {
     *          "numChecked": 227,
     *          "numTrigger": 1,
     *          "ruleTime": 5,
     *          "totalTime": 8,
     *          "issues": [
     *              {
     *                  "severityCode": "eISHigh",
     *                  "messageCode": "rpt.g377.elemUniqueId",
     *                  "ruleId": "377",
     *                  "help": "idhi_accessibility_check_g377.html",
     *                  "msgArgs": [
     *                      "div",
     *                      "firstDiv"
     *                  ],
     *                  "xpath": "/html[1]/body[1]/div[2]/div[2]",
     *                  "snippet": "<div id=\"firstDiv\">",
     *                  "bounds": {
     *                      "left": 10,
     *                      "top": 181,
     *                      "height": 0,
     *                      "width": 1249
     *                  },
     *                  "level": "violation"
     *              }
     *          ],
     *          "docTitle": "Helo World"
     *      },
     *      "counts": {
     *          "level.violation": 1,
     *          "level.potentialviolation": 0,
     *          "level.recommendation": 0,
     *          "level.potentialrecommendation": 0,
     *          "level.manual": 0
     *      },
     *      "issueMessages": {
     *          "messages": {
     *              "rpt.g377.elemUniqueId": "The {0} element has the id \"{1}\" that is either empty or already in use."
     *          },
     *          "lang": "en-us"
     *      }
     *  }
     *  ......
     *
     * @return {Object} pageResults - return the results object with the count object updated
     *  {
     *      "report": {
     *          "numChecked": 227,
     *          "numTrigger": 1,
     *          "ruleTime": 5,
     *          "totalTime": 8,
     *          "issues": [
     *              {
     *                  "severityCode": "eISHigh",
     *                  "messageCode": "rpt.g377.elemUniqueId",
     *                  "ruleId": "377",
     *                  "help": "idhi_accessibility_check_g377.html",
     *                  "msgArgs": [
     *                      "div",
     *                      "firstDiv"
     *                  ],
     *                  "xpath": "/html[1]/body[1]/div[2]/div[2]",
     *                  "snippet": "<div id=\"firstDiv\">",
     *                  "bounds": {
     *                      "left": 10,
     *                      "top": 181,
     *                      "height": 0,
     *                      "width": 1249
     *                  },
     *                  "level": "violation"
     *              }
     *          ],
     *          "docTitle": "Helo World"
     *      },
     *      "counts": {
     *          "level.violation": 1,
     *          "level.potentialviolation": 0,
     *          "level.recommendation": 0,
     *          "level.potentialrecommendation": 0,
     *          "level.manual": 0
     *      },
     *      "issueMessages": {
     *          "messages": {
     *              "rpt.g377.elemUniqueId": "The {0} element has the id \"{1}\" that is either empty or already in use."
     *          },
     *          "lang": "en-us"
     *      }
     *  }
     *
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    static getCounts(report: Report) : ICheckerReportCounts {

        // Variable Decleration
        let reportLevels = ACReportManager.config.reportLevels;

        // Build violation count object which will contain the updated count based on filter which
        // which occured in filterViolations function.
        let violationCount : ICheckerReportCounts = {};

        // In the case that report levels are provided then populate the count object in
        // violationCount object with the levels which were provided in reportLevels
        // array/
        if (reportLevels) {

            // Iterate over the report levels and populate the pageResultsWithCount counts
            // object
            reportLevels.forEach(function (levels) {
                violationCount[levels] = 0;
            });

        }
        // Populate the pageResultsWithCount counts object with all the levels
        else {
            violationCount = {
                "violation": 0,
                "potentialviolation": 0,
                "recommendation": 0,
                "potentialrecommendation": 0,
                "manual": 0,
                "pass": 0
            };
        }

        // Iterate over the page results
        for (const item of report.results) {
            if (item.level in violationCount) {
                ++violationCount[item.level];
            }
        }

        // Update the results count object with the new one which considers filtered results
        return violationCount;
    };

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
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    static addToSummaryCount(pageCount: ICheckerReportCounts) {

        // Variable Decleration
        let ACScanSummary = ACReportManager.scanSummary.counts || {};
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
            // and add it to the accessibility-checker violation summary object.
            // This will keep track of an overall summary of the violations for all testscases, that
            // were run for a single karma run.
            for (let level in pageCount) {
                ACScanSummary[level] += pageCount[level];
            }
        }

        // Assign the new violation summary back to the global object
        ACReportManager.scanSummary.counts = ACScanSummary;
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
    static assertCompliance(actualResults: ReportResult) : eAssertResult {

        // In the case that the details object contains Error object, this means that the scan engine through an
        // exception, therefore we should not compare results just fail instead.
        if ((actualResults as ICheckerError).details instanceof Error) {
            return eAssertResult.ERROR;
        }

        actualResults = actualResults as ICheckerReport;

        // Get the label directly from the results object, the same label has to match
        // the baseline object which is available in the global space.
        let label = actualResults.label;

        // Fetch the baseline object based on the label provided
        let expected = ACReportManager.getBaseline(label);

        // In the case there are no baseline found then run a different assertion algo,
        // when there is baseline compare the baselines in the case there is no baseline then
        // check to make sure there are no violations that are listed in the fails on.
        if (expected !== null && typeof (expected) !== "undefined") {
            // Run the diff algo to get the list of differences
            let differences = ACReportManager.diffResultsWithExpected(actualResults, expected, true);

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
                let differences2 = ACReportManager.diffResultsWithExpected({
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
                    ACReportManager.diffResults[label] = differences;

                    return eAssertResult.BASELINE_MISMATCH;
                }
            }
        } else {
            // In the case that there was no baseline data found compare the results based on
            // the failLevels array, which was defined by the user.
            let returnCode = ACReportManager.compareBasedOnFailLevels(actualResults);

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
    static compareBasedOnFailLevels(report) {

        // In the case that the details object contains Error object, this means that the scan engine through an
        // exception, therefore we should not compare results just fail instead.
        if (report.details instanceof Error) {
            return -1;
        }

        // Variable Decleration
        let failLevels = ACReportManager.config.failLevels;

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
    static diffResultsWithExpected(actual, expected, clean) {

        // In the case clean is set to true then run the cleanComplianceObjectBeforeCompare function on
        // both the actual and expected objects passed in. This is to make sure that the objcet follow a
        // simalar structure before compareing the objects.
        if (clean) {
            // Clean actual and expected objects
            actual = ACReportManager.cleanComplianceObjectBeforeCompare(actual);
            expected = ACReportManager.cleanComplianceObjectBeforeCompare(expected);
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
    static cleanComplianceObjectBeforeCompare(objectToClean) {
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
                    if (ACReportManager.baselineIssueList.indexOf(key) === -1) {
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
     * This function is responsible for getting the baseline object for a label that was provided.
     *
     * @param {String} label - Provide a lable for which to get the baseline for.
     *
     * @return {Object} - return the baseline object from global space based on label provided, the object will be
     *                    in the same format as outlined in the return of aChecker.buildReport function.
     *
     * PUBLIC API
     *
     * @memberOf this
     */
    static getBaseline(label) {
        try {
            let baselineFilename = path.join(path.join(process.cwd(), ACReportManager.config.baselineFolder), label+".json");
            let retVal : ICheckerReport = JSON.parse(readFileSync(baselineFilename).toString());
            if (retVal && retVal.results) {
                if (!this.refactorMap) {
                    this.refactorMap = {}
                    let rules = ACEngineManager.getRulesSync();
                    for (const rule of rules) {
                        if (rule.refactor) {
                            for (const key in rule.refactor) {
                                this.refactorMap[key] = rule;
                            }
                        }
                    }
                }
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
    static getDiffResults(label: string) {
        return ACReportManager.diffResults && ACReportManager.diffResults[label];
    };

    /**
     * This function is responsible for printing the scan results to console.
     *
     * @param {Object} results - Provide the results from the scan.
     *
     * @return {String} resultsString - String representation of the results/violations.
     *
     * PUBLIC API
     *
     * @memberOf this
     */
    static stringifyResults(reportP: ReportResult) : string {
        if (!(reportP as any).results) {
            return `ERROR: ${JSON.stringify(reportP)}`;
        }
        const report = reportP as ICheckerReport;
        // console.log(report);
        // Variable Decleration
        let resultsString = `Scan: ${report.label}\n`;

        // Loop over the reports and build the string version of the the issues within each report
        report.results && report.results.forEach(function (issue) {
            if (ACReportManager.config.reportLevels.includes(issue.level)) {
                // Build string of the issues with only level, messageCode, xpath and snippet.
                resultsString += "- Message: " + issue.message +
                    "\n  Level: " + issue.level +
                    "\n  XPath: " + issue.path.dom +
                    "\n  Snippet: " + issue.snippet +
                    "\n  Help: " + ACEngineManager.getHelpURL(issue) +
                    "\n";
            }
        });

        return resultsString;
    };

    static ignoreExtraBaselineViolations(actualReport, baselineReport) {
        // Using for loop to make is sync code
        let ignoredCount = 0;
        let changedCounts = actualReport.summary.counts;

        let currentActualReport = actualReport.results;
        const currentBaselineReport = baselineReport;
        // a report exists in the baseline for the iframe
        let legacyBaseline = false;
        if (currentBaselineReport && currentBaselineReport.length === 1) {
            legacyBaseline = !!currentBaselineReport[0].issues;
        }
        for (const issue of currentActualReport) {
            let currentRuleID = issue.ruleId;
            let currentLevel = issue.level;
            let currentXPATH = issue.path.dom;
            //check if the issue exists in baseline already
            let result =
                legacyBaseline && currentBaselineReport[0].issues.filter(issue => issue.ruleId in ruleIdToLegacyId && ruleIdToLegacyId[issue.ruleId] === currentRuleID && issue.level === currentLevel && issue.xpath === currentXPATH)
                || !legacyBaseline && currentBaselineReport.results.filter(issue => issue.ruleId === currentRuleID && issue.level === currentLevel && issue.path.dom === currentXPATH);
            if (result && result.length !== 0) {
                //violation exists in baseline, add ignore:true
                issue.ignored = true;
                ignoredCount++;
                if (issue.level === "violation") {
                    changedCounts.violation--;
                }
                if (issue.level === "potentialviolation") {
                    changedCounts.potentialviolation--;
                }
                if (issue.level === "recommendation") {
                    changedCounts.recommendation--;
                }
                if (issue.level === "potentialrecommendation") {
                    changedCounts.potentialrecommendation--;
                }
                if (issue.level === "manual") {
                    changedCounts.manual--;
                }
                if (issue.level === "pass") {
                    changedCounts.pass--;
                }

            } else {
                issue.ignored = false;
            }
        }

        // adding ignore count to summary
        changedCounts.ignored = ignoredCount;
        actualReport.summary.counts = changedCounts
        return actualReport;
    }
}

