// const { ACEngineManager } = require("./ACEngineManager");
const ACConfigLoader = require("./ACConfigLoader");
const ACMetricsLogger = require('./log/ACMetricsLogger');
const ACReporterJSON = require("./reporters/ACReporterJSON");
const ACReporterHTML = require("./reporters/ACReporterHTML");
const ACReporterCSV = require("./reporters/ACReporterCSV");
const DeepDiff = require("deep-diff");

const myrequest = (url) => {
    return fetch(url).then(resp => resp.text());
}

let loggerFunction = function (output) {
    ACCommands.DEBUG && console.log(output);
};

let loggerCreate = function (type) {
    return logger;
};

let logger = {
    debug: loggerFunction,
    info: loggerFunction,
    error: loggerFunction,
    warn: loggerFunction,
    create: loggerCreate
};

let ACCommands = module.exports = {
    DEBUG: false,
    // initialize: (win, fileConfig) => {
    //    ACCommands.Config = fileConfig;
    initializeConfig: () => {
        if (ACCommands.initConfigOnce) return ACCommands.initConfigOnce;

        ACCommands.DEBUG && console.log("START 'initialize' function");
        return ACCommands.initConfigOnce = ACConfigLoader()
            .then((config) => {
                ACCommands.Config = config;
                return config;
            });
    },
    initialize: (win) => {
        if (ACCommands.initOnce) {
            return ACCommands.initOnce.then(() => {
                if (!ACEngineManager.ace) {
                    ACCommands.initOnce = false;
                    return ACCommands.initialize(win);
                }
            })
        }

        return ACCommands.initOnce = Promise.resolve().then(async () => {
            if (ACCommands.Config.rulePack.includes("localhost")) {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            }

            // Specify if debug information should be printed or not
            ACCommands.DEBUG = ACCommands.Config.DEBUG;

    /**        ACCommands.engineLoaded = false;
            await ACEngineManager.loadEngine(win, ACCommands.Config);
        })
            .then(() => {
                ACCommands.DEBUG && console.log("END 'initialize' function");
    */
            // Array that contains the list of entries that need to be compared between the actual and baseline objects only.
            // Note: This is used by the cleanComplianceObjectBeforeCompare function to filter the report based on this.
            ACCommands.baselineIssueList = ["ruleId", "xpath"];
            ACCommands.metricsLogger = new ACMetricsLogger("cypress-accessibility-checker", logger, ACCommands.Config.policies.join(","));

            // Initialize the scanSummary object with summary information for accessibility-checker
            ACCommands.scanSummary = ACCommands.initializeSummary();

            // Initialize the global object which will store all the diff results for a scan that is run, using
            // actual and expected.
            ACCommands.diffResults = ACCommands.diffResults || {};

            // Initialize the global object which will store all the scan results indexed by the label.
            ACCommands.scanResults = {};

            ACCommands.engineLoaded = false;
            return ACCommands.loadEngine(win)
        })
            .then(() => {
                ACCommands.DEBUG && console.log("END 'initialize' function");
            })
    },
    initializeSummary: () => {
        // Variable Decleration
        let scanSummary = {};
        let reportLevels = ACCommands.Config.reportLevels;

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
            scanSummary.counts.ignored = 0;
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

        // Add Start time when this script is loaded into browser
        // Start time will be in milliseconds elapsed since 1 January 1970 00:00:00 UTC up until now.
        scanSummary.startReport = Date.now();

        // Leave end report as empty for now
        scanSummary.endReport = '';

        // Add the toolID, policies, reportLevels, failLevels and labels from the config to the summary
        scanSummary.toolID = ACCommands.Config.toolID;
        scanSummary.policies = ACCommands.Config.policies.join(",");
        scanSummary.reportLevels = ACCommands.Config.reportLevels;
        scanSummary.labels = ACCommands.Config.label;
        scanSummary.failLevels = ACCommands.Config.failLevels;

        // Add scanID (UUID) to the scan summary object
        scanSummary.scanID = ACCommands.Config.scanID;

        // Build the paceScanSummary object which will contains all the items that were scanned and a count
        // summary for each of the scanned items.
        scanSummary.pageScanSummary = [];

        return scanSummary;
    },
    /**
     * This function loads the compliance engine.
     * @param {Function} callback - Provide callback function which will be executed once the engine is loaded
     *
     * @return N/A - This function will not return any thing, as it is full async
     */
    loadEngine: (win, content) => {
        ACCommands.DEBUG && console.log("START 'aChecker.loadEngine' function");

        ACCommands.myWindow = win.parent;
        if (!ACCommands.myWindow.ace) {
            return ACCommands.loadCypressEngine()
                .then(() => {
                    ace = win.ace = ACCommands.myWindow.ace;
                    win.ace.checker = new ace.Checker();
                    ACCommands.DEBUG && console.log("END 'aChecker.loadEngine' function1");
                })
        } else {
            ace = win.ace = ACCommands.myWindow.ace;
            ACCommands.DEBUG && console.log("END 'aChecker.loadEngine' function2");
        }
    },

    loadCypressEngine: () => {
        ACCommands.DEBUG && console.log("START 'aChecker.loadCypressEngine' function");
        if (ace) {
            ACCommands.DEBUG && console.log("END 'aChecker.loadCypressEngine' function");
            return;
        }
        return myrequest(ACCommands.Config.rulePack + "/ace.js")
            .then((data) => {
                const script = ACCommands.myWindow.document.createElement("script");
                script.innerHTML = data;
                ACCommands.myWindow.document.documentElement.appendChild(script);
                ace = ACCommands.myWindow.ace;
                ACCommands.DEBUG && console.log("END 'aChecker.loadCypressEngine' function");
            })
    },

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
     * @param {(String|HTMLElement|DocumentNode)} content - Provide the context to scan, which includes the items from above.
     * @param {String} label - Provide a label for the scan that is being performed
     * @param {Function} callback - Provide callback function which will be executed once the results are extracted.
     *
     * @return N/A - This function will not return any thing, as it is full asyn so scan will be performed and the call back
     *               function which was provided will be called which will perform the verification or anything that is needed.
     *
     * PUBLIC API
     *
     * @memberOf this
     */
    getCompliance: function (content, label, callback) {
        if (callback) {
            ACCommands.getComplianceHelper(content, label)
                .then((result) => {
                    callback(result.report, result.webdriver);
                });
        } else {
            return ACCommands.getComplianceHelper(content, label);
        }
    },

    getComplianceHelper: function (content, label) {
        ACCommands.DEBUG && console.log("START 'ACCommands.getComplianceHelper' function");
        if (!content) {
            console.error("aChecker: Unable to get compliance of null or undefined object")
            return null;
        }
    /**
        // Get the Data when the scan is started
        // Start time will be in milliseconds elapsed since 1 January 1970 00:00:00 UTC up until now.
        let policies = ACCommands.Config.policies;
        let curPol = null;
        if (policies) {
            curPol = JSON.parse(JSON.stringify(policies));
        }
    */

        // In the case that the label is null or undefined, throw an error using the karma API
        // console.error with the message of the error.
        if (label === null || typeof label === "undefined" || label === undefined) {

            // Variable Decleration
            let testcaseWhichIsMissingRequiredLabel = null;
            let generalErrorMessageLabelNotUnique = "\n[Error] labelNotProvided: Label must be provided when calling aChecker.getCompliance.";

            // Get the caller of the aChecker.getCompliance function which will be the testcase that is calling this function
            // This way we can make it the error more descriptive and would help the user identify where the issues is.
            // We have to build and throw an Error() object and then using the try/catch to catch this error and then extract the
            // stack and parse it to get the 2nd element in the stack which will be the caller of this function which will be the
            // testcase which called this function.
            try {
                // Throw Error() object
                throw new Error();
            } catch (exception) {
                // Extract the stack trace from the error object and parse it to get the single one caller up which will be the 2nd index
                testcaseWhichIsMissingRequiredLabel = exception.stack.split("\n")[1];

                // Call the Karma error API, to send message to the Karma server that there was an error on the client side
                console.error("Label was not provided at: " + testcaseWhichIsMissingRequiredLabel + generalErrorMessageLabelNotUnique);
            }
        }

        // Check to make sure that the label that is provided is unique with all the other ones
        // that we have gone through.
        let labelUnique = ACCommands.isLabelUnique(label);
        // In the case that the label is not unique
        if (!labelUnique) {
            // Variable Decleration dependencies/tools-rules-html/v2/a11y/test/g471/Table-DataNoSummaryARIA.html
            let testcaseDoesNotUseUniqueLabel = null;
            let generalErrorMessageLabelNotUnique = "\n[Error] labelNotUnique: Label provided to aChecker.getCompliance should be unique across all testcases in a single accessibility-checker session.";

            // Get the caller of the aChecker.getCompliance function which will be the testcase that is calling this function
            // This way we can make it the error more descriptive and would help the user identify where the issues is.
            // We have to build and throw an Error() object and then using the try/catch to catch this error and then extract the
            // stack and parse it to get the 2nd element in the stack which will be the caller of this function which will be the
            // testcase which called this function.
            try {
                // Throw Error() object
                throw new Error();
            } catch (exception) {
                // Extract the stack trace from the error object and parse it to get the single one caller up which will be the 2nd index
                testcaseDoesNotUseUniqueLabel = exception.stack.split("\n")[1];

                // Call the Karma error API, to send message to the Karma server that there was an error on the client side
                console.error("Label \"" + label + "\" provided at: " + testcaseDoesNotUseUniqueLabel + " is not unique." + generalErrorMessageLabelNotUnique);
            }
        }

        // Get the Data when the scan is started
        // Start time will be in milliseconds elapsed since 1 January 1970 00:00:00 UTC up until now.
        let policies = ACCommands.Config.policies;
        let curPol = null;
        if (policies) {
            curPol = JSON.parse(JSON.stringify(policies));
        }

        ACCommands.DEBUG && console.log("getComplianceHelper:Cypress");
        return ACCommands.getComplianceHelperCypress(label, content, curPol);
    },

    getComplianceHelperCypress: (label, parsed, curPol) => {
        try {
          //  let checker = new ACEngineManager.ace.Checker();
            let startScan = Date.now();
            let checker = new ace.Checker();
            return new Cypress.Promise((resolve, reject) => {
                checker.check(parsed, ACCommands.Config.policies).then((report) => resolve(report));
            })
                .then(function (report) {
                    for (const result of report.results) {
                        delete result.node;
                    }
                    return report;
                })
                .then(function (report) {
                    if (curPol != null && !ACCommands.Config.checkPolicy) {
                        let valPolicies = new ace.Checker().rulesetIds;
                        ACCommands.Config.checkPolicy = true;
                        areValidPolicy(valPolicies, curPol);
                    }

                    // If there is something to report...
                    let origReport = null;
                    if (report.results) {
                        let url = parsed.location && parsed.location.href;
                        report.summary = report.summary || {}
                        report.summary.URL = url;
                        report.counts = {}

                        origReport = JSON.parse(JSON.stringify(report));
                        origReport = ACCommands.buildReport(origReport, url, label, startScan);

                        // Filter the violations based on the reporLevels
                        report = ACCommands.filterViolations(report);

                        // Add the count object, to data a recount after the filtering of violations is done.
                        report = ACCommands.updateViolationCount(report);

                        // Add the violation count to global summary object
                        ACCommands.addToSummaryCount(report.counts);

                        // Build the report object for this scan, to follow a specific format. Refer to the
                        // function prolog for more information on the object creation.
                        report = ACCommands.buildReport(report, url, label, startScan);

                        // Add the scan results to global karma result object which can be accessed when users testcase
                        // finishes, user can also access it to alter it for any reason.
                        ACCommands.addResultsToGlobal(report);

                    }

                    ACCommands.DEBUG && console.log("getComplianceHelperCypress:", report);

                    return {
                        "origReport": origReport,
                        "report": report
                    };
                });
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        };
    },
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
    buildReport: function (report, URL, label, startScan) {
        if (report.report) {
            report = report.report;
        }
        // Build the scan summary object which will be added to the build report
        // Note: This summary is only for this single scan.
        report.summary = {
            counts: report.counts,
            scanTime: report.totalTime,
            ruleArchive: ACCommands.Config.ruleArchive,
            policies: ACCommands.Config.policies,
            reportLevels: ACCommands.Config.reportLevels,
            startScan: startScan
        };

        // Add scanID (UUID) to the individual pages
        report.scanID = ACCommands.Config.scanID;

        // Add toolID to the individual pages
        report.toolID = ACCommands.Config.toolID;

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
        delete report.counts;
        delete report.ruleTime;
        delete report.totalTime;

        if (ACCommands.Config.disableIgnore === undefined || ACCommands.Config.disableIgnore == false || ACCommands.Config.disableIgnore === null) {
            // set ignore:true for previously seen violations
            // retrieve baseline
            let baselineReport = ACCommands.getBaseline(label);

            // set ignore:true for previously seen violations and set ignore to false if no ignore fields exist yet
            if (baselineReport) {
                report = ACCommands.ignoreExtraBaselineViolations(report, baselineReport);
            }
            else { //add ignored field
                report.summary.counts.ignored = 0;
            }
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
                b.ruleId != a.ruleId && b.ruleId - a.ruleId ||
                b.path.dom - a.path.dom;
        });

        return report;
    },
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
    getBaseline: function (label) {
        return ACCommands.baselines[label] || null;
    },
    setBaselines: function (data) {
        ACCommands.baselines = ACCommands.baselines || {};
        for (const key in data) {
            ACCommands.baselines[key] = data[key];
        }
    },
    ignoreExtraBaselineViolations: function (actualReport, baselineReport) {
        let result = null;
        let existingRuleIDs = [];
        // Using for loop to make is sync code
        let ignoredCount = 0;
        let changedCounts = actualReport.summary.counts;

        let currentActualReport = actualReport.results;
        const currentBaselineReport = baselineReport;
        // a report exists in the baseline for the iframe
        if (currentBaselineReport && currentBaselineReport.length === 1) {
            let legacyBaseline = !!currentBaselineReport[0].issues;
            for (const issue of currentActualReport) {
                let currentRuleID = issue.ruleId;
                let currentLevel = issue.level;
                let currentXPATH = issue.path.dom;
                //check if the issue exists in baseline already
                let result =
                    legacyBaseline && currentBaselineReport[0].issues.filter(issue => issue.ruleId in aCheckerCypress.ruleIdToLegacyId && aCheckerCypress.ruleIdToLegacyId[issue.ruleId] === currentRuleID && issue.level === currentLevel && issue.xpath === currentXPATH)
                    || !legacyBaseline && currentBaselineReport.results.filter(issue => issue.ruleId === currentRuleID && issue.level === currentLevel && issue.dom.path === currentXPATH);
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

        }

        // adding ignore count to summary
        changedCounts.ignored = ignoredCount;
        actualReport.summary.counts = changedCounts
        return actualReport;
    },
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
    filterViolations: function (report) {

        // Variable Decleration
        let reportLevels = ACCommands.Config.reportLevels;
        let pageResults = report.results;
        for (let iDis = 0; ACCommands.Config.disable && iDis < ACCommands.Config.disable.length; ++iDis) {
            ACCommands.Config.disable[iDis] = "" + ACCommands.Config.disable[iDis];
        }
        // Loop over all the violations and filter them, if the violation level does not match with, what user has
        // requested to be reported. Also handle hidden at this point right now.
        // TODO: Posible to filter the results directly in the engine, to avoid the need to do all this in each of the tools.
        for (let i = 0; i < pageResults.length; ++i) {

            // Set the default ignore value to false if disableIgnore field in config file is not true
            if (ACCommands.Config.disableIgnore === undefined || ACCommands.Config.disableIgnore == false || ACCommands.Config.disableIgnore === null) {
                pageResults[i].ignored = false;
            }
            if (ACCommands.Config.disable && ACCommands.Config.disable.indexOf(pageResults[i].ruleId) !== -1) {
                pageResults.splice(i--, 1);
                continue;
            }
            // Remove violation which are not in the reportLevels
            if (reportLevels) {
                // Fetch the level from the results
                let reportLevel = pageResults[i].value;
                if (reportLevel[1] === "PASS") {
                    reportLevel = "pass";
                } else if ((reportLevel[0] === "VIOLATION" || reportLevel[0] === "RECOMMENDATION") && reportLevel[1] === "MANUAL") {
                    reportLevel = "manual";
                } else if (reportLevel[0] === "VIOLATION") {
                    if (reportLevel[1] === "FAIL") {
                        reportLevel = "violation";
                    } else if (reportLevel[1] === "POTENTIAL") {
                        reportLevel = "potentialviolation";
                    }
                } else if (reportLevel[0] === "RECOMMENDATION") {
                    if (reportLevel[1] === "FAIL") {
                        reportLevel = "recommendation";
                    } else if (reportLevel[1] === "POTENTIAL") {
                        reportLevel = "potentialrecommendation";
                    }
                }
                pageResults[i].level = reportLevel;

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
    },
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
    updateViolationCount: function (report) {

        // Variable Decleration
        let reportLevels = ACCommands.Config.reportLevels;

        // Build violation count object which will contain the updated count based on filter which
        // which occured in filterViolations function.
        let violationCount = {};

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
        report.counts = violationCount;

        return report;
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
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    addToSummaryCount: function (pageCount) {

        // Variable Decleration
        let ACScanSummary = ACCommands.scanSummary.counts || {};
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
        ACCommands.scanSummary.counts = ACScanSummary;
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
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    addResultsToGlobal: function (results) {

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
        ACCommands.scanSummary.pageScanSummary.push(pageSummaryObject);

        // Add the scan results to global space
        ACCommands.scanResults[results.label] = results;
    },
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
    assertCompliance: function (actualResults) {
        if (actualResults.report) {
            actualResults = actualResults.report;
        }
        return ACCommands.initializeConfig().then(() => {
            // In the case that the details object contains Error object, this means that the scan engine threw an
            // exception, therefore we should not compare results just fail instead.
            if (actualResults.details instanceof Error) {
                return -1;
            }

            // Get the label directly from the results object, the same label has to match
            // the baseline object which is available in the global space.
            let label = actualResults.label;

            // Fetch the baseline object based on the label provided
            let expected = ACCommands.getBaseline(label);

            // In the case there are no baseline found then run a different assertion algo,
            // when there is baseline compare the baselines in the case there is no baseline then
            // check to make sure there are no violations that are listed in the fails on.
            if (expected !== null && typeof (expected) !== "undefined") {
                // Run the diff algo to get the list of differences
                let differences = ACCommands.diffResultsWithExpected(actualResults, expected, true);

                // In the case that there are no differences then that means it passed
                if (differences === null || typeof (differences) === "undefined") {
                    return 0;
                } else {
                    // Re-sort results and check again
                    let modActual = JSON.parse(JSON.stringify(actualResults.results));
                    modActual.sort((a, b) => {
                        let cc = b.category.localeCompare(a.category);
                        if (cc != 0) return cc;
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
                    let differences2 = ACCommands.diffResultsWithExpected({
                        results: modActual,
                        summary: actualResults.summary
                    }, {
                        results: modExpected,
                        summary: expected.summary
                    }, true);
                    if (differences2 === null || typeof (differences2) === "undefined") {
                        return 0;
                    } else {
                        // In the case that there are failures add the whole diff array to
                        // global space indexed by the label so that user can access it.
                        ACCommands.diffResults[label] = differences;
                        return 1;
                    }
                }
            } else {
                // In the case that there was no baseline data found compare the results based on
                // the failLevels array, which was defined by the user.
                let returnCode = ACCommands.compareBasedOnFailLevels(actualResults);

                // In the case there are no violations that match the fail on then return as success
                if (returnCode === 0) {
                    return returnCode;
                } else {
                    // In the case there are some violation that match in the fail on then return 2
                    // to identify that there was a failure, and we used a 2nd method for compare.
                    return 2;
                }
            }
        })
    },
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
    compareBasedOnFailLevels: function (report) {

        // In the case that the details object contains Error object, this means that the scan engine through an
        // exception, therefore we should not compare results just fail instead.
        if (report.details instanceof Error) {
            return -1;
        }

        // Variable Decleration
        let failLevels = ACCommands.Config.failLevels;
        // Loop over all the issues to check for any level that is in failLevels
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
    },

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
    diffResultsWithExpected: function (actual, expected, clean) {
        // In the case clean is set to true then run the cleanComplianceObjectBeforeCompare function on
        // both the actual and expected objects passed in. This is to make sure that the objcet follow a
        // simalar structure before compareing the objects.
        if (clean) {
            // Clean actual and expected objects
            actual = ACCommands.cleanComplianceObjectBeforeCompare(actual);
            expected = ACCommands.cleanComplianceObjectBeforeCompare(expected);
        }

        // Run Deep diff function to compare the actual and expected values.
        let differences = DeepDiff.diff(actual, expected);

        // Return the results of the diff, which will include the differences between the objects
        if (!differences) return null;

        return differences;
    },
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
    cleanComplianceObjectBeforeCompare: function (objectToClean) {
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
                    if (ACCommands.baselineIssueList.indexOf(key) === -1) {
                        delete issue[key];
                    }
                });
                // Make sure that the xpath in the case there is a [1] we replace it with ""
                // to support some browser which return it differently
                issue.xpath = issue.xpath.replace(/\[1\]/g, "");
            }
        };

        return objectToClean;
    },
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
    getDiffResults: function (label) {
        if (!ACCommands.diffResults || !ACCommands.diffResults[label]) return null;
        return ACCommands.diffResults[label];
    }
}