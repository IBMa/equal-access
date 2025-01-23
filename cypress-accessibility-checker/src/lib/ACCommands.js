const { ACEngineManager } = require("./ACEngineManager");

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
    initialize: (win, fileConfig) => {
        ACCommands.Config = fileConfig;
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

            ACCommands.engineLoaded = false;
            await ACEngineManager.loadEngine(win, ACCommands.Config);
        })
            .then(() => {
                ACCommands.DEBUG && console.log("END 'initialize' function");
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
            let checker = new ACEngineManager.ace.Checker();
            return new Cypress.Promise((resolve, reject) => {
                checker.check(parsed, ACCommands.Config.policies).then((report) => resolve(report));
            })
                .then(function (report) {
                    for (const result of report.results) {
                        delete result.node;
                    }
                    return report;
                })
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        };
    }
}