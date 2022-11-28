const ACConfigLoader = require("./ACConfigLoader");
const ACMetricsLogger = require('./log/ACMetricsLogger');
const ACReporterJSON = require("./reporters/ACReporterJSON");
const ACReporterHTML = require("./reporters/ACReporterHTML");
const ACReporterCSV = require("./reporters/ACReporterCSV");
const DeepDiff = require("deep-diff");

const request = require("request");
const fs = require("fs");
const path = require("path");

let loadOnce = null;
let ace;

let loggerFunction = function (output) {
    ACTasks.DEBUG && console.log(output);
};

let loggerCreate = function () {
    return logger;
};

let logger = {
    debug: loggerFunction,
    info: loggerFunction,
    error: loggerFunction,
    warn: loggerFunction,
    create: loggerCreate
};

let ACTasks = module.exports = {
    DEBUG: false,
    initializeConfig: () => {
        if (ACTasks.initConfigOnce) return ACTasks.initConfigOnce;

        ACTasks.DEBUG && console.log("START 'initialize' function");
        return ACTasks.initConfigOnce = ACConfigLoader()
        .then((config) => {
            ACTasks.Config = config;
            return config;
        });
    },

    getConfig: () => {
        return ACTasks.initializeConfig();
    },

    onRunComplete: () => {
        ACTasks.reporterHTML && ACTasks.reporterHTML.onRunComplete();
        ACTasks.reporterJSON && ACTasks.reporterJSON.onRunComplete();
        ACTasks.reporterCSV && ACTasks.reporterCSV.onRunComplete();
        return true;
    },

    initialize: () => {
        if (ACTasks.initOnce) {
            return ACTasks.initOnce.then(() => {
                if (!ACTasks.ace) {
                    ACTasks.initOnce = false;
                    return ACTasks.initialize();
                }
            })
        }

        return ACTasks.initOnce = ACTasks.initializeConfig().then(() => {
            if (ACTasks.Config.rulePack.includes("localhost")) {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            }

            ACTasks.reporterHTML = new ACReporterHTML(ACTasks);
            ACTasks.reporterJSON = new ACReporterJSON(ACTasks);
            ACTasks.reporterCSV = new ACReporterCSV(ACTasks);

            // Specify if debug information should be printed or not
            ACTasks.DEBUG = ACTasks.Config.DEBUG;

            // Array that contains the list of entries that need to be compared between the actual and baseline objects only.
            // Note: This is used by the cleanComplianceObjectBeforeCompare function to filter the report based on this.
            ACTasks.baselineIssueList = ["ruleId", "xpath"];
            ACTasks.metricsLogger = new ACMetricsLogger("cypress-accessibility-checker", logger, ACTasks.Config.policies.join(","));

            // Initialize the scanSummary object with summary information for accessibility-checker
            ACTasks.scanSummary = ACTasks.initializeSummary();
    
            // Initialize the global object which will store all the diff results for a scan that is run, using
            // actual and expected.
            ACTasks.diffResults = {};

            // Initialize the global object which will store all the scan results indexed by the label.
            ACTasks.scanResults = {};

            ACTasks.engineLoaded = false;
            return ACTasks.loadEngine()
        })
        .then(() => {
            ACTasks.DEBUG && console.log("END 'initialize' function");
        })
    },
    initializeSummary: () => {
        // Variable Decleration
        let scanSummary = {};
        let reportLevels = ACTasks.Config.reportLevels;

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
        scanSummary.toolID = ACTasks.Config.toolID;
        scanSummary.policies = ACTasks.Config.policies.join(",");
        scanSummary.reportLevels = ACTasks.Config.reportLevels;
        scanSummary.labels = ACTasks.Config.label;
        scanSummary.failLevels = ACTasks.Config.failLevels;

        // Add scanID (UUID) to the scan summary object
        scanSummary.scanID = ACTasks.Config.scanID;

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
    loadEngine: () => {
        ACTasks.DEBUG && console.log("START 'aChecker.loadEngine' function");

        if (typeof cy === "undefined") {
            // We aren't loading the engine in tasks outside of the cypress browser engine
            if (ace) {
                return Promise.resolve(ace);
            } else {
                return ACTasks.loadLocalEngine((engine) => {
                    return ACTasks.ace = ace = engine;
                });
            }
        }
    },
    loadLocalEngine: function () {
        if (loadOnce === null) {
            loadOnce = ACTasks.getConfig()
            .then((config) => {
                return new Promise((resolve, reject) => {
                    request.get(config.rulePack + "/ace-node.js", function (err, data) {
                        err && console.error(err);
                        if (!data) {
                            console.log("Cannot read: " + ACTasks.Config.rulePack + "/ace-node.js");
                        }
                        data = data.body;
                        let engineDir = path.join(config.cacheFolder, "engine");
                        if (!fs.existsSync(engineDir)) {
                            fs.mkdirSync(engineDir, { recursive: true });
                        }
                        const nodePath = path.join(engineDir, "ace-node")
                        let engineFilename = nodePath+".js";
                        // Only write the engine if it's different - can cause Cypress to trigger a file changed watch
                        if (fs.existsSync(engineFilename)) {
                            if (fs.readFileSync(engineFilename).toString() === data) {
                                try {
                                    err && console.log(err);
                                    ACTasks.ace = require(nodePath);
                                    return resolve(ACTasks.ace);
                                } catch (e) {
                                    console.log(e);
                                    return reject(e);
                                }
                            }
                        }
                        fs.writeFile(engineFilename, data, function (err) {
                            try {
                                err && console.log(err);
                                ACTasks.ace = require(nodePath);
                            } catch (e) {
                                console.log(e);
                                return reject(e);
                            }
                            resolve(ace);
                        });
                    });
                });
            });
        }
        return loadOnce;
    },
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
    sendResultsToReporter: function (unFilteredResults, results, profile) {
        return ACTasks.initialize().then(() => {
            ACTasks.DEBUG && console.log("sendResultsToReporter:", ACTasks.Config.outputFormat);
            if (ACTasks.Config.outputFormat.indexOf("json") !== -1) {
                ACTasks.reporterJSON.report(results);
            }
            if (ACTasks.Config.outputFormat.includes("csv")) {
                ACTasks.reporterCSV.report(results);
            }
            if (ACTasks.Config.outputFormat.indexOf("html") !== -1) {
                ACTasks.reporterHTML.report(unFilteredResults);
            }
            // Only perform the profiling if profiling was not disabled on purpose
            if (!ACTasks.Config.label || ACTasks.Config.label.indexOf("IBMa-Node-TeSt") === -1) {
                // Meter the usage here
                ACTasks.metricsLogger.profileV2(results.summary.scanTime, profile);
            }
            return 0;
        });
    },

    loadBaselines: (parentDir, parResult) => ACTasks.initializeConfig().then(() => new Promise((resolve) => {
        let result = parResult || {}
        let readDirPath = path.join(process.cwd(), ACTasks.Config.baselineFolder);
        if (parentDir) {
            readDirPath += parentDir;
        }
        fs.readdir(readDirPath, function (err, files) {
            //handling error
            if (err) {
                console.log('Unable to scan directory: ' + err);
                return resolve(result);
            } 
            for (let file of files) {
                let filePath = path.join(readDirPath,file);
                file = file.split('.').slice(0, -1).join('.')

                if (fs.lstatSync(filePath).isFile()) {
                    if (parentDir) {
                        result[parentDir.substring(1)+"/"+file] = require(filePath);
                    } else {
                        result[file] = require(filePath);
                    }
                } else if (fs.lstatSync(filePath).isDirectory()) {
                    ACTasks.loadBaselines((parentDir || "")+"/"+file, result);
                }
            }
            return resolve(result);
        });
    })),
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
    getBaseline: function (labelStr) {
        try {
            return require(path.join(path.join(process.cwd(), ACTasks.Config.baselineFolder), labelStr));
        } catch (e) {
            return null;
        }
    },
    
    getRulesets: () => new ACTasks.ace.Checker().rulesets,

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
    stringifyResults: function (report) {
        return ACTasks.initialize()
        .then(() => {
            // console.log(report);
            // Variable Decleration
            let resultsString = `Scan: ${report.label}\n`;

            // Loop over the reports and build the string version of the the issues within each report
            report.results && report.results.forEach(function (issue) {
                if (ACTasks.Config.reportLevels.includes(issue.level)) {
                    // Build string of the issues with only level, messageCode, xpath and snippet.
                    resultsString += "- Message: " + issue.message +
                        "\n  Level: " + issue.level +
                        "\n  XPath: " + issue.path.dom +
                        "\n  Snippet: " + issue.snippet +
                        "\n";
                }
            });

            return resultsString;
        });
    },

    getHelpURL: function (issue) {
        let archiveId = ACTasks.Config.ruleArchive;
        let engineHelp = new ACTasks.ace.Checker().engine.getHelp(issue.ruleId, issue.reasonId, archiveId);
        let minIssue = {
            message: issue.message,
            snippet: issue.snippet,
            value: issue.value,
            reasonId: issue.reasonId,
            ruleId: issue.ruleId,
            msgArgs: issue.msgArgs
        };
        return `${engineHelp}#${encodeURIComponent(JSON.stringify(minIssue))}`;
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
        return ACTasks.initialize().then(() => {
            // In the case clean is set to true then run the cleanComplianceObjectBeforeCompare function on
            // both the actual and expected objects passed in. This is to make sure that the objcet follow a
            // simalar structure before compareing the objects.
            if (clean) {
                // Clean actual and expected objects
                actual = ACTasks.cleanComplianceObjectBeforeCompare(actual);
                expected = ACTasks.cleanComplianceObjectBeforeCompare(expected);
            }

            // Run Deep diff function to compare the actual and expected values.
            let differences = DeepDiff.diff(actual, expected);

            // Return the results of the diff, which will include the differences between the objects
            if (!differences) return null;

            return differences;
        })
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
                    if (ACTasks.baselineIssueList.indexOf(key) === -1) {
                        delete issue[key];
                    }
                });
                // Make sure that the xpath in the case there is a [1] we replace it with ""
                // to support some browser which return it differently
                issue.xpath = issue.xpath.replace(/\[1\]/g, "");
            }
        }

        return objectToClean;
    }
}