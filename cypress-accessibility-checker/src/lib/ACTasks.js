const ACConfigLoader = require("./ACConfigLoader");
const ACMetricsLogger = require('./log/ACMetricsLogger');
const ACReporterJSON = require("./reporters/ACReporterJSON");
const ACReporterHTML = require("./reporters/ACReporterHTML");
const ACReporterCSV = require("./reporters/ACReporterCSV");
const request = require("request");
const fs = require("fs");
const path = require("path");

let loadOnce = null;
let ace;

const myrequest = (url) => {
    if (typeof cy !== "undefined") {
        return cy.request(url)
            .then((data) => {
                return data.body;
            })
    } else {
        return new Promise((resolve, reject) => {
            const request = require("request");
            request.get(url, function (error, response, body) {
                if (error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(body));
                }
            });
        });
    }
}

let loggerFunction = function (output) {
    ACTasks.DEBUG && console.log(output);
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
    loadEngine: (content) => {
        ACTasks.DEBUG && console.log("START 'aChecker.loadEngine' function");

        if (typeof cy === "undefined") {
            // We aren't loading the engine in tasks outside of the cypress browser engine
            if (ace) {
                return Promise.resolve();
            } else {
                return ACTasks.loadLocalEngine((engine) => {
                    return ace = engine;
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
                        let engineDir = path.join(__dirname, "engine");
                        if (!fs.existsSync(engineDir)) {
                            fs.mkdirSync(engineDir);
                        }
                        let cacheDir = path.join(engineDir, "cache");
                        if (!fs.existsSync(cacheDir)) {
                            fs.mkdirSync(cacheDir);
                        }
                        fs.writeFile(path.join(engineDir, "ace-node.js"), data, function (err) {
                            let ace;
                            try {
                                err && console.log(err);
                                ace = require("./engine/ace-node");
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
            if (ACTasks.Config.outputFormat.indexOf("json") != -1) {
                // reporterJSON.report(results);
            }
            if (ACTasks.Config.outputFormat.includes("csv")) {
                // reporterCSV.report(results);
            }
            if (ACTasks.Config.outputFormat.indexOf("html") != -1) {
                // reporterHTML.report(unFilteredResults);
            }
            // Only perform the profiling if profiling was not disabled on purpose
            if (!ACTasks.Config.label || ACTasks.Config.label.indexOf("IBMa-Node-TeSt") === -1) {
                // Meter the usage here
                ACTasks.metricsLogger.profileV2(results.summary.scanTime, profile);
            }
            return 0;
        });
    }
}