const { ACEngineManager } = require("./ACEngineManager");
const ACConfigManager = require("./common/config/ACConfigManager").ACConfigManager;
const ReporterManager = require("./common/report/ReporterManager").ReporterManager;
const BaselineManager = require("./common/report/BaselineManager").BaselineManager;
const fs = require("fs");
const path = require("path");

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

class MyFS {
    writeFileSync(filePath, data) {
        let outFile = this.prepFileSync(filePath);
        fs.writeFileSync(outFile, data);
    }
    prepFileSync(filePath) {
        let outDir = path.resolve(ACTasks.Config.outputFolder);
        let outFile = path.join(outDir, filePath);
        if (!fs.existsSync(path.dirname(outFile))) {
            fs.mkdirSync(path.dirname(outFile), { recursive: true });
        }
        return outFile;
    }
    log(...output) { console.debug(...output) }
    info(...output) { console.info(...output) }
    error(...output) { console.error(...output) }
    loadBaseline(label) {
        let baselineFile = path.join(path.join(process.cwd(), ACTasks.Config.baselineFolder), label+".json");
        if (fs.existsSync(baselineFile)) {
            return require(baselineFile);
        }
        return null;
    }
    getChecker() {
        return ACEngineManager.getChecker();
    }
}

let ACTasks = module.exports = {
    DEBUG: false,
    initializeConfig: () => {
        if (ACTasks.initConfigOnce) return ACTasks.initConfigOnce;

        ACTasks.DEBUG && console.log("START 'initialize' function");
        return ACTasks.initConfigOnce = ACConfigManager.getConfig()
        .then((config) => {
            ACTasks.Config = config;
            return config;
        });
    },

    getConfig: () => {
        return ACTasks.initializeConfig();
    },

    onRunComplete: () => {
        ReporterManager.generateSummaries();
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

        return ACTasks.initOnce = ACTasks.initializeConfig().then(async () => {
            if (ACTasks.Config.rulePack.includes("localhost")) {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            }

            // Specify if debug information should be printed or not
            ACTasks.DEBUG = ACTasks.Config.DEBUG;

            ACEngineManager.engineLoaded = false;
            await ACEngineManager.loadEngine();
            let absAPI = new MyFS();
            let refactorMap = {}
            let rules = ACEngineManager.getRulesSync();
            if (rules) {
                for (const rule of rules) {
                    if (rule.refactor) {
                        for (const key in rule.refactor) {
                            refactorMap[key] = rule;
                        }
                    }
                }
            }
            ReporterManager.initialize(ACTasks.Config, absAPI, await ACEngineManager.getRulesets());
            BaselineManager.initialize(ACTasks.Config, absAPI, refactorMap);
        })
        .then(() => {
            ACTasks.DEBUG && console.log("END 'initialize' function");
        })
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
    sendResultsToReporter: function (profile, startScan, url, title, label, results ) {
        return ACTasks.initialize().then(() => {
            return ReporterManager.addEngineReport(profile, startScan, url, title, label, results);
        });
    },

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
        return ReporterManager.stringifyResults(report);
    }
}