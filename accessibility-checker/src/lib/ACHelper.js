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
 
const request = require("request");
const fs = require("fs");
const path = require("path");
const DeepDiff = require("deep-diff");
const ACMetricsLogger = require('./log/ACMetricsLogger');
const puppeteer = require('puppeteer');
const ACReporterJSON = require("./reporters/ACReporterJSON");
const ACReporterCSV = require("./reporters/ACReporterCSV");

let aChecker = {
    Config: null
};
let ace;
!(function () {
    let reporterJSON;
    let reporterCSV;
    // Init the Metrics logger
    let metricsLogger;
    let initialize = async () => {
        if (aChecker.Config) return;
        aChecker.Config = await require("./ACConfigLoader");
        if (aChecker.Config.rulePack.includes("localhost")) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }

        reporterJSON = new ACReporterJSON(aChecker);
        reporterCSV = new ACReporterCSV(aChecker);

        // Specify if debug information should be printed or not
        aChecker.DEBUG = aChecker.Config.DEBUG;

        // Array that contains the list of entries that need to be compared between the actual and baseline objects only.
        // Note: This is used by the cleanComplianceObjectBeforeCompare function to filter the report based on this.
        aChecker.baselineIssueList = ["ruleId", "xpath"];
        metricsLogger = new ACMetricsLogger("accessibility-checker", logger, aChecker.Config.policies.join(","));

        // Initialize the scanSummary object with summary information for accessibility-checker
        aChecker.scanSummary = aChecker.initializeSummary();

        // Initialize the global object which will store all the diff results for a scan that is run, using
        // actual and expected.
        aChecker.diffResults = {};

        // Initialize the global object which will store all the scan results indexed by the label.
        aChecker.scanResults = {};

        aChecker.engineLoaded = false;
        return aChecker.loadLocalEngine();
    }

    var loggerFunction = function (output) {
        aChecker.DEBUG && console.log(output);
    };

    var loggerCreate = function (type) {
        return logger;
    };

    var logger = {
        debug: loggerFunction,
        info: loggerFunction,
        error: loggerFunction,
        warn: loggerFunction,
        create: loggerCreate
    };

    aChecker.getConfig = async () => {
        await initialize();
        return aChecker.Config;
    }

    /**
     * This function is responsible for initializing the summary object which will store all informations about the
     * scans that will occurs while karma is still running and running compliance scans.
     *
     * @return {Object} scanSummary - return the built scan summary object
     *
     * @memberOf this
     */
    aChecker.initializeSummary = function () {
        // Variable Decleration
        var scanSummary = {};
        var reportLevels = aChecker.Config.reportLevels;

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
        scanSummary.toolID = aChecker.Config.toolID;
        scanSummary.policies = aChecker.Config.policies.join(",");
        scanSummary.reportLevels = aChecker.Config.reportLevels;
        scanSummary.labels = aChecker.Config.label;
        scanSummary.failLevels = aChecker.Config.failLevels;

        // Add scanID (UUID) to the scan summary object
        scanSummary.scanID = aChecker.Config.scanID;

        // Build the paceScanSummary object which will contains all the items that were scanned and a count
        // summary for each of the scanned items.
        scanSummary.pageScanSummary = [];

        return scanSummary;
    };

    function isPuppeteer(content) {
        if (content && content.constructor) {
            return content.constructor.toString().includes("Puppeteer");
        }
        return false;
    }

    function isSelenium(content) {
        if (content && content.constructor) {
            return content.constructor.toString().indexOf("WebDriver") !== -1 ||
                // check required for selenium >= 3.0.1
                (content.constructor.name && content.constructor.name.indexOf("WebDriver") !== -1);
        }
        return false;
    }

    function areValidPolicy(valPolicies, curPol) {
        var isValPol = false;
        var errorPolicy = "";

        for (var i = 0; i < curPol.length; ++i) {
            if (valPolicies.indexOf(curPol[i]) === -1) {
                errorPolicy += "" + curPol[i] + ",";
            } else {
                isValPol = true;
            }

        }
        if (errorPolicy.length > 0) {
            errorPolicy = errorPolicy.substr(0, errorPolicy.length - 1);
            console.log(`[WARN] InvalidPolicies: Invalid policies "${errorPolicy}". Valid policy ids are: ${valPolicies}`);
        }
        if (!isValPol) {
            console.error(`[ERROR] ValidPoliciesMissing: No valid policy has been provided. Valid policy ids for the specified archive are: ${valPolicies}`);
            process.exit(-1);
        }
    }

    /**
     * This function loads the compliance engine.
     * @param {Function} callback - Provide callback function which will be executed once the engine is loaded
     *
     * @return N/A - This function will not return any thing, as it is full async
     */
    aChecker.loadEngine = async function (content) {
        if (isPuppeteer(content)) {
            aChecker.DEBUG && console.log("[INFO] aChecker.loadEngine detected Puppeteer");
            var page = content;
            const winHandle = await page.evaluateHandle('window');
            const docHandle = await page.evaluateHandle('document');
            await page.evaluate((window, document, scriptUrl) => {
                try {
                    if ('undefined' === typeof(ace)) {
                        return new Promise((resolve, reject) => {
                            var script = document.createElement('script');
                            script.setAttribute('type', 'text/javascript');
                            script.setAttribute('aChecker', 'ACE');
                            script.setAttribute('src', scriptUrl);
                            script.addEventListener('load', function () {
                                resolve();
                            });
                            var heads = document.getElementsByTagName('head');
                            if (heads.length > 0) { heads[0].appendChild(script); }
                            else if (document.body) { document.body.appendChild(script); }
                            else { Promise.reject("Invalid document"); }
                        })
                    }
                } catch (e) {
                    return Promise.reject(e);
                }
            }, winHandle, docHandle, aChecker.Config.rulePack + "/ace.js");
            return aChecker.loadLocalEngine();
        } else if (isSelenium(content)) {
            aChecker.DEBUG && console.log("[INFO] aChecker.loadEngine detected Selenium");
            try {
                var browser = content;
                // Selenium
                var scriptStr =
`var cb = arguments[arguments.length - 1];
try {
    if ('undefined' === typeof(ace)) {
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('aChecker', 'ACE');
        script.setAttribute('src', '${aChecker.Config.rulePack + "/ace.js"}');
        script.addEventListener('load', function() {
            cb();
        });
        var heads = document.getElementsByTagName('head');
        if (heads.length > 0) { heads[0].appendChild(script); }
        else { document.body.appendChild(script); }
    } else {
        cb();
    }
} catch (e) {
    cb(e);
}
`
                var manage = browser.manage();
                if (manage.timeouts) {
                    manage.timeouts().setScriptTimeout(60000);
                } else if (manage.setTimeouts) {
                    manage.setTimeouts({
                        "script": 60000
                    })
                }

                return browser.executeAsyncScript(scriptStr).then(function (return_success) {
                    return aChecker.loadLocalEngine();
                }).catch(function (err) {
                    console.log(err);
                });
            } catch (e) {
                console.log(e);
            }
        } else {
            aChecker.DEBUG && console.log("[INFO] aChecker.loadEngine detected local");
            if (ace) {
                return Promise.resolve();
            } else {
                return aChecker.loadLocalEngine();
            }
        }
    };

    aChecker.loadLocalEngine = function () {
        if (ace) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            request.get(aChecker.Config.rulePack + "/ace-node.js", function (err, data) {
                if (!data) {
                    console.log("Cannot read: " + aChecker.Config.rulePack + "/ace-node.js");
                }
                data = data.body;
                var engineDir = path.join(__dirname, "engine");
                if (!fs.existsSync(engineDir)) {
                    fs.mkdirSync(engineDir);
                }
                var cacheDir = path.join(engineDir, "cache");
                if (!fs.existsSync(cacheDir)) {
                    fs.mkdirSync(cacheDir);
                }
                fs.writeFile(path.join(engineDir, "ace-node.js"), data, function (err) {
                    try {
                        err && console.log(err);
                        ace = require("./engine/ace-node");
                    } catch (e) {
                        console.log(e);
                        return reject(e);
                    }
                    resolve();
                });
            });
        });
    };

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
    aChecker.getCompliance = function (content, label, callback) {
        if (callback) {
            aChecker.getComplianceHelper(content, label)
                .then((result) => {
                    callback(result.report, result.webdriver);
                });
        } else {
            return aChecker.getComplianceHelper(content, label);
        }
    }

    aChecker.getComplianceHelper = async function (content, label) {
        await initialize();
        aChecker.DEBUG && console.log("START 'aChecker.getCompliance' function");
        if (!content) {
            console.error("aChecker: Unable to get compliance of null or undefined object")
            return null;
        }

        // Variable Decleration
        var URL;

        // Since we need to handle multiple variation of possible ways to scan items, we need to handle
        // each one differently as each one requires specific actions/setup.
        // Handle the following:
        //  Single node (HTMLElement)
        //  Multiple node (Array of HTMLElements)
        //  Local file (String)
        //  URL (String)
        //  document

        async function getParsed(content) {
            if (!content) return null;

            // Handle local file and URL's
            if (typeof content === "string") {
                var isURLRegex = /^(ftp|http|https):\/\//;

                if (isURLRegex.test(content)) {
                    URL = content;
                }

                // Since this is a string, we consider this as either URL or local file
                // so build an iframe based on this and get the frame doc and then scan this.
                return await aChecker.buildIframeAndGetDoc(content);
            } else if (isSelenium(content) || isPuppeteer(content)) {

            }
            // Handle Array of nodes
            else if (content instanceof Array) {
                // TODO: Supporting Array of nodes, possible future enhancenment
            }
            // Handle single node (HTMLElement)
            else if (content.nodeType === 1) {
                // In the case this is a node, there is nothing special that needs to be done at this time,
                // the engine will be able to handle this. Adding this block here as we may need to add some filtering
                // of rules or rule sets for this case depending on if a special ruleset needs to be created or not.
                content = content;
            }
            // handle scanning document
            else if (content.nodeType === 9) {
                // In the case this is a document element, simply send the document object to the engine for now
                // we will need to do some filtering to remove any karma related aspects, which requires to do a
                // document clone, and then string the karma scripts that are added and then send this document
                // to the engine.
                // TODO: Investigate best approach to perform filtering
                content = content;
            }
            return content;
        }

        let parsed = await getParsed(content);
        if (parsed === null) return null;
        await aChecker.loadEngine(parsed);
        // In the case that the label is null or undefined, throw an error using the karma API
        // console.error with the message of the error.
        if (label === null || typeof label === "undefined" || label === undefined) {

            // Variable Decleration
            var testcaseWhichIsMissingRequiredLabel = null;
            var generalErrorMessageLabelNotUnique = "\n[Error] labelNotProvided: Label must be provided when calling aChecker.getCompliance.";

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
        var labelUnique = aChecker.isLabelUnique(label);

        // In the case that the label is not unique
        if (!labelUnique) {
            // Variable Decleration dependencies/tools-rules-html/v2/a11y/test/g471/Table-DataNoSummaryARIA.html
            var testcaseDoesNotUseUniqueLabel = null;
            var generalErrorMessageLabelNotUnique = "\n[Error] labelNotUnique: Label provided to aChecker.getCompliance should be unique across all testcases in a single accessibility-checker session.";

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
        var policies = aChecker.Config.policies;
        var curPol = null;
        if (policies) {
            var curPol = JSON.parse(JSON.stringify(policies));
        }
        if (isSelenium(parsed)) {
            aChecker.DEBUG && console.log("getComplianceHelper:Selenium");
            return await aChecker.getComplianceHelperSelenium(label, parsed, curPol);
        } else if (isPuppeteer(parsed)) {
            aChecker.DEBUG && console.log("getComplianceHelper:Puppeteer");
            return await aChecker.getComplianceHelperPuppeteer(label, parsed, curPol);
        } else {
            aChecker.DEBUG && console.log("getComplianceHelper:Local");
            return await aChecker.getComplianceHelperLocal(label, parsed, curPol);
        }
    }

    aChecker.getComplianceHelperSelenium = async (label, parsed, curPol) => {
        var startScan = Date.now();
        // NOTE: Engine should already be loaded
        var browser = parsed;
        // Selenium
        var scriptStr =
            `var cb = arguments[arguments.length - 1];
try {
    var policies = ${JSON.stringify(aChecker.Config.policies)};

    let checker = new window.ace.Checker();
    setTimeout(function() {
        checker.check(document, policies).then(function(report) {
            for (const result of report.results) {
                delete result.node;
            }
            cb(report);
        })
    },0)
} catch (e) {
    cb(e);
}`
        var manage = browser.manage();
        if (manage.timeouts) {
            manage.timeouts().setScriptTimeout(60000);
        } else if (manage.setTimeouts) {
            manage.setTimeouts({
                "script": 60000
            })
        }
        return browser.executeAsyncScript(scriptStr).then(function (report) {
            var getPolicies = "return new window.ace.Checker().rulesetIds;";
            if (curPol != null && !aChecker.Config.checkPolicy) {
                aChecker.Config.checkPolicy = true;
                browser.executeScript(getPolicies).then(function (valPolicies) {
                    areValidPolicy(valPolicies, curPol);
                });
            }

            // If there is something to report...
            if (report.results) {

                // Filter the violations based on the reporLevels
                report = aChecker.filterViolations(report);

                // Add the count object, to data a recount after the filtering of violations is done.
                report = aChecker.updateViolationCount(report);

                // Add the violation count to global summary object
                aChecker.addToSummaryCount(report.counts);

                // Build the report object for this scan, to follow a specific format. Refer to the
                // function prolog for more information on the object creation.
                report = aChecker.buildReport(report, URL, label, startScan);

                // Add the scan results to global karma result object which can be accessed when users testcase
                // finishes, user can also access it to alter it for any reason.
                aChecker.addResultsToGlobal(report);

                // Add URL to the result object
                return browser.getCurrentUrl().then(function (url) {

                    report.summary.URL = url;

                    // Need to call a karma API to send the results of a single scan to the accessibility-checker reporter so that they can be
                    // saved to a file by the server side reporter.
                    aChecker.sendResultsToReporter(report, "Selenium");

                    if (aChecker.Config.captureScreenshots && browser.takeScreenshot) {
                        return browser.getCurrentUrl().then(function (url) {
                            return browser.takeScreenshot().then(function (image, err) {
                                var screenshotResult = {
                                    image: image,
                                    label: label,
                                    scanID: report.scanID
                                };

                                aChecker.sendScreenShotToReporter(screenshotResult);

                                // Call the user provided callback function after the filtering, building report and summary count tasks
                                // call the user callback function with results and content object (this object can be document of Iframe which was created etc...)
                                // The content will not be exposed to the user, unless they really need it. We use this to simplfy checking for violations.
                                return {
                                    "report": report,
                                    "webdriver": parsed
                                };
                            });
                        });
                    } else {
                        return {
                            "report": report,
                            "webdriver": parsed
                        }
                    }
                });
            }
            if (!aChecker.Config.captureScreenshots) {
                // Call the user provided callback function after the filtering, building report and summary count tasks
                // call the user callback function with results and content object (this object can be document of Iframe which was created etc...)
                // The content will not be exposed to the user, unless they really need it. We use this to simplfy checking for violations.
                return {
                    "report": report,
                    "webdriver": parsed
                };
            }
        }).catch(function (err) {
            console.log(err);
        });
    }

    aChecker.getComplianceHelperPuppeteer = async (label, parsed, curPol) => {
        var startScan = Date.now();
        // NOTE: Engine should already be loaded
        var page = parsed;
        let winHandle = await page.evaluateHandle("window");
        let report = await page.evaluate((window, policies) => {
            let checker = new window.ace.Checker();
            return new Promise((resolve, reject) => {
                setTimeout(function () {
                    checker.check(document, policies).then(function (report) {
                        for (const result of report.results) {
                            delete result.node;
                        }
                        resolve(report);
                    })
                }, 0)
            })
        }, winHandle, aChecker.Config.policies);
        if (curPol != null && !aChecker.Config.checkPolicy) {
            let valPolicies = await page.evaluate("new window.ace.Checker().rulesetIds");
            aChecker.Config.checkPolicy = true;
            areValidPolicy(valPolicies, curPol);
        }

        // If there is something to report...
        if (report.results) {

            // Filter the violations based on the reporLevels
            report = aChecker.filterViolations(report);

            // Add the count object, to data a recount after the filtering of violations is done.
            report = aChecker.updateViolationCount(report);

            // Add the violation count to global summary object
            aChecker.addToSummaryCount(report.counts);

            // Build the report object for this scan, to follow a specific format. Refer to the
            // function prolog for more information on the object creation.
            report = aChecker.buildReport(report, URL, label, startScan);

            // Add the scan results to global karma result object which can be accessed when users testcase
            // finishes, user can also access it to alter it for any reason.
            aChecker.addResultsToGlobal(report);
            let url = await page.evaluate("document.location.href");
            report.summary.URL = url;

            // Need to call a karma API to send the results of a single scan to the accessibility-checker reporter so that they can be
            // saved to a file by the server side reporter.
            aChecker.sendResultsToReporter(report, "Puppeteer");

            if (aChecker.Config.captureScreenshots) {
                let image = await page.screenshot({
                    fullPage: true,
                    encoding: "base64"
                });
                var screenshotResult = {
                    image: image,
                    label: label,
                    scanID: report.scanID
                };

                aChecker.sendScreenShotToReporter(screenshotResult);

                // Call the user provided callback function after the filtering, building report and summary count tasks
                // call the user callback function with results and content object (this object can be document of Iframe which was created etc...)
                // The content will not be exposed to the user, unless they really need it. We use this to simplfy checking for violations.

                return {
                    "report": report,
                    "puppeteer": parsed
                };
            }
        }

        if (!aChecker.Config.captureScreenshots) {
            // Call the user provided callback function after the filtering, building report and summary count tasks
            // call the user callback function with results and content object (this object can be document of Iframe which was created etc...)
            // The content will not be exposed to the user, unless they really need it. We use this to simplfy checking for violations.
            return {
                "report": report,
                "puppeteer": parsed
            };
        }
    }

    aChecker.getComplianceHelperLocal = async (label, parsed, curPol) => {
        var startScan = Date.now();
        let checker = new ace.Checker();
        let report = await checker.check(parsed, aChecker.Config.policies)
            .then(function (report) {
                for (const result of report.results) {
                    delete result.node;
                }
                return report;
            })

        if (curPol != null && !aChecker.Config.checkPolicy) {
            let valPolicies = new ace.Checker().rulesetIds;
            aChecker.Config.checkPolicy = true;
            areValidPolicy(valPolicies, curPol);
        }

        // If there is something to report...
        if (report.results) {

            // Filter the violations based on the reporLevels
            report = aChecker.filterViolations(report);

            // Add the count object, to data a recount after the filtering of violations is done.
            report = aChecker.updateViolationCount(report);

            // Add the violation count to global summary object
            aChecker.addToSummaryCount(report.counts);

            // Build the report object for this scan, to follow a specific format. Refer to the
            // function prolog for more information on the object creation.
            report = aChecker.buildReport(report, URL, label, startScan);

            // Add the scan results to global karma result object which can be accessed when users testcase
            // finishes, user can also access it to alter it for any reason.
            aChecker.addResultsToGlobal(report);
            let url = parsed.location && parsed.location.href;
            report.summary.URL = url;

            // Need to call a karma API to send the results of a single scan to the accessibility-checker reporter so that they can be
            // saved to a file by the server side reporter.
            aChecker.sendResultsToReporter(report, "Native");
        }

        return {
            "report": report
        };
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
    aChecker.isLabelUnique = function (label) {
        aChecker.DEBUG && console.log("START 'aChecker.isLabelUnique' function");

        // Variable Decleration
        var labelExists = false;

        aChecker.DEBUG && console.log("Checking if label: " + label + " is unique.");

        // Check if the label that is provided was already used or not, by simply calling the some API on the array
        // and passing it a callback function which checks if the label exists in the global paceScanSummary object.
        labelExists = aChecker.scanSummary.pageScanSummary.some(function (scanSummary) {
            return scanSummary.label === label;
        });

        aChecker.DEBUG && console.log("END 'aChecker.isLabelUnique' function");

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
    aChecker.sendResultsToReporter = function (results, profile) {
        if (aChecker.Config.outputFormat.indexOf("json") != -1) {
            reporterJSON.report(results);
        }
        if (aChecker.Config.outputFormat.includes("csv")) {
            reporterCSV.report(results);
        }
        // Only perform the profiling if profiling was not disabled on purpose
        if (!aChecker.Config.label || aChecker.Config.label.indexOf("IBMa-Node-TeSt") === -1) {
            // Meter the usage here
            metricsLogger.profileV2(results.summary.scanTime, profile);
        }
    };

    aChecker.sendScreenShotToReporter = function (screenshotResult) {
    };

    try {
        // If cucumber is the platform...
        var {AfterAll} = require('cucumber');
        AfterAll(function (done) {
            initialize().then(() => metricsLogger.sendLogsV2(() => aChecker.close().then(done), aChecker.Config.rulePack));
        });
    } catch (e) {
        if (typeof (after) !== "undefined") {
            after(function (done) {
                initialize().then(() => metricsLogger.sendLogsV2(() => aChecker.close().then(done), aChecker.Config.rulePack));
            });
        } else {
            process.on('beforeExit', async function () {
                initialize().then(() => metricsLogger.sendLogsV2(null, aChecker.Config.rulePack));
                aChecker.close();
            });
        }
    }

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
    aChecker.buildReport = function (report, URL, label, startScan) {
        // Build the scan summary object which will be added to the build report
        // Note: This summary is only for this single scan.
        report.summary = {
            counts: report.counts,
            scanTime: report.totalTime,
            ruleArchive: aChecker.Config.ruleArchive,
            policies: aChecker.Config.policies,
            reportLevels: aChecker.Config.reportLevels,
            startScan: startScan
        };

        // Add scanID (UUID) to the individual pages
        report.scanID = aChecker.Config.scanID;

        // Add toolID to the individual pages
        report.toolID = aChecker.Config.toolID;

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

        if (aChecker.Config.disableIgnore === undefined || aChecker.Config.disableIgnore == false || aChecker.Config.disableIgnore === null) {
            // set ignore:true for previously seen violations
            // retrieve baseline
            var baselineReport = aChecker.getBaseline(label);

            // set ignore:true for previously seen violations and set ignore to false if no ignore fields exist yet
            if (baselineReport) {
                report = aChecker.ignoreExtraBaselineViolations(report, baselineReport);
            }
            else { //add ignored field
                report.summary.counts.ignored = 0;
            }
        }

        var lvlIdx = {
            "violation": 1,
            "potentialviolation": 2,
            "recommendation": 3,
            "potentialrecommendation": 4,
            "manual": 5,
            "pass": 6
        };

        report.results.sort(function (a, b) {
            var aLvl = lvlIdx[a.level];
            var bLvl = lvlIdx[b.level];
            if (!aLvl) aLvl = 7;
            if (!bLvl) bLvl = 7;
            return aLvl != bLvl && aLvl - bLvl ||
                b.ruleId != a.ruleId && b.ruleId - a.ruleId ||
                b.path.dom - a.path.dom;
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
    aChecker.addResultsToGlobal = function (results) {

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

        // Add the summary count for this scan to the pageScanSummary object which is in the global space
        // Index this by the label.
        aChecker.scanSummary.pageScanSummary.push(pageSummaryObject);

        // Add the scan results to global space
        aChecker.scanResults[results.label] = results;
    };


    let driver;
    aChecker.getBrowserChrome = async function(force) {
        if (force || !driver) {
            return driver = await puppeteer.launch({headless: aChecker.Config.headless, ignoreHTTPSErrors: aChecker.Config.ignoreHTTPSErrors || false});

            // return driver = new webdriver.Builder()
            //     .forBrowser('chrome')
            //     .setChromeOptions(new chrome.Options().headless().windowSize(screen))
            //     // .setChromeOptions(new chrome.Options().windowSize(screen))
            //     .build();
        } else {
            return driver;
        }
    }

    aChecker.close = async () => {
        if (driver) {
            await driver.close();
            driver = null;
            page = null;
        }
    }

    /**
     * This function is responsible for building an iframe object with the provided URL or local file.
     *
     * @param {String} URLorLocalFile - Provide a URL or local file to scan.
     *
     * @return {Object} content - return an object which contains the iframeDoc and also the URL or
     *                               local file name.
     *
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    let page = null;
    aChecker.buildIframeAndGetDoc = async function (URLorLocalFileorContent) {
        let browser = await aChecker.getBrowserChrome();
        if (!page || page.isClosed()) {
            page = await browser.newPage();
            page.on('console', msg => {
                for (let i = 0; i < msg.args.length; ++i)
                  console.log(`${i}: ${msg.args[i]}`);
              });
        }
        async function nav() {
            // await page.goto('https://example.com');
            if (URLorLocalFileorContent.toLowerCase().includes("<html")) {
                let urlStr = "data:text/html;charset=utf-8," + encodeURIComponent(URLorLocalFileorContent);
                await page.goto(urlStr);
            } else {
                try {
                    await page.goto(URLorLocalFileorContent);
                } catch (e) {
                    console.log(e.message, URLorLocalFileorContent);
                    return null;
                }
            }
            return page;
        }
        try {
            return await nav();
        } catch (e) {
            // Try to restart if page fails
            browser = await aChecker.getBrowserChrome(true);
            page = await browser.newPage();
            page.on('console', msg => {
                for (let i = 0; i < msg.args.length; ++i)
                  console.log(`${i}: ${msg.args[i]}`);
              });
            return await nav();
        }
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
    aChecker.filterViolations = function (report) {

        // Variable Decleration
        var reportLevels = aChecker.Config.reportLevels;
        var pageResults = report.results;
        for (var iDis = 0; aChecker.Config.disable && iDis < aChecker.Config.disable.length; ++iDis) {
            aChecker.Config.disable[iDis] = "" + aChecker.Config.disable[iDis];
        }
        // Loop over all the violations and filter them, if the violation level does not match with, what user has
        // requested to be reported. Also handle hidden at this point right now.
        // TODO: Posible to filter the results directly in the engine, to avoid the need to do all this in each of the tools.
        for (var i = 0; i < pageResults.length; ++i) {

            // Set the default ignore value to false if disableIgnore field in config file is not true
            if (aChecker.Config.disableIgnore === undefined || aChecker.Config.disableIgnore == false || aChecker.Config.disableIgnore === null){
                pageResults[i].ignored = false;
            }
            if (aChecker.Config.disable && aChecker.Config.disable.indexOf(pageResults[i].ruleId) !== -1) {
                pageResults.splice(i--, 1);
                continue;
            }
            // Remove violation which are not in the reportLevels
            if (reportLevels) {
                // Fetch the level from the results
                var reportLevel = pageResults[i].value;
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
    };

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
    aChecker.updateViolationCount = function (report) {

        // Variable Decleration
        var reportLevels = aChecker.Config.reportLevels;

        // Build violation count object which will contain the updated count based on filter which
        // which occured in filterViolations function.
        var violationCount = {};

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
    aChecker.addToSummaryCount = function (pageCount) {

        // Variable Decleration
        var ACScanSummary = aChecker.scanSummary.counts || {};
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
            // and add it to the accessibility-checker violation summary object.
            // This will keep track of an overall summary of the violations for all testscases, that
            // were run for a single karma run.
            for (var level in pageCount) {
                ACScanSummary[level] += pageCount[level];
            }
        }

        // Assign the new violation summary back to the global object
        aChecker.scanSummary.counts = ACScanSummary;
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
    aChecker.assertCompliance = function (actualResults) {

        // In the case that the details object contains Error object, this means that the scan engine through an
        // exception, therefore we should not compare results just fail instead.
        if (actualResults.details instanceof Error) {
            return -1;
        }

        // Get the label directly from the results object, the same label has to match
        // the baseline object which is available in the global space.
        var label = actualResults.label;

        // Fetch the baseline object based on the label provided
        var expected = aChecker.getBaseline(label);

        // In the case there are no baseline found then run a different assertion algo,
        // when there is baseline compare the baselines in the case there is no baseline then
        // check to make sure there are no violations that are listed in the fails on.
        if (expected !== null && typeof (expected) !== "undefined") {
            // Run the diff algo to get the list of differences
            var differences = aChecker.diffResultsWithExpected(actualResults, expected, true);

            //console.log(JSON.stringify(differences, null, '    '));

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
                var differences2 = aChecker.diffResultsWithExpected({ 
                    results: modActual,
                    summary: actualResults.summary
                }, { 
                    results: modExpected ,
                    summary: expected.summary
                }, true);
                if (differences2 === null || typeof (differences2) === "undefined") {
                    return 0;
                } else {
                    // In the case that there are failures add the whole diff array to
                    // global space indexed by the label so that user can access it.
                    aChecker.diffResults[label] = differences;

                    return 1;
                }
            }
        } else {
            // In the case that there was no baseline data found compare the results based on
            // the failLevels array, which was defined by the user.
            var returnCode = aChecker.compareBasedOnFailLevels(actualResults);

            // In the case there are no violations that match the fail on then return as success
            if (returnCode === 0) {
                return returnCode;
            } else {
                // In the case there are some violation that match in the fail on then return 2
                // to identify that there was a failure, and we used a 2nd method for compare.
                return 2;
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
    aChecker.compareBasedOnFailLevels = function (report) {

        // In the case that the details object contains Error object, this means that the scan engine through an
        // exception, therefore we should not compare results just fail instead.
        if (report.details instanceof Error) {
            return -1;
        }

        // Variable Decleration
        var failLevels = aChecker.Config.failLevels;

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
    aChecker.diffResultsWithExpected = function (actual, expected, clean) {

        // In the case clean is set to true then run the cleanComplianceObjectBeforeCompare function on
        // both the actual and expected objects passed in. This is to make sure that the objcet follow a
        // simalar structure before compareing the objects.
        if (clean) {
            // Clean actual and expected objects
            actual = aChecker.cleanComplianceObjectBeforeCompare(actual);
            expected = aChecker.cleanComplianceObjectBeforeCompare(expected);
        }

        // Run Deep diff function to compare the actual and expected values.
        var differences = DeepDiff.diff(actual, expected);

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
    aChecker.cleanComplianceObjectBeforeCompare = function (objectToClean) {
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
        for (var idx = 0; idx < objectToClean.results.length; ++idx) {
            const issue = objectToClean.results[idx];
            if (issue.level === "pass") {
                objectToClean.results.splice(idx--, 1);
            } else {
                issue.xpath = issue.path.dom;
                // Loop over all the keys in a single issue object and remove all the
                // keys that are not needed for compare
                Object.keys(issue).forEach(function (key) {
                    // Remove all the keys which are not in the baselineIssueList
                    if (aChecker.baselineIssueList.indexOf(key) === -1) {
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
    aChecker.getBaseline = function (label) {
        try {
            return require(path.join(path.join(process.cwd(), aChecker.Config.baselineFolder), label));
        } catch (e) {
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
    aChecker.getDiffResults = function (label) {
        return aChecker.diffResults && aChecker.diffResults[label];
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
    aChecker.stringifyResults = function (report) {
        // console.log(report);
        // Variable Decleration
        var resultsString = `Scan: ${report.label}\n`;

        // Loop over the reports and build the string version of the the issues within each report
        report.results && report.results.forEach(function (issue) {
            if (aChecker.Config.reportLevels.includes(issue.level)) {
                // Build string of the issues with only level, messageCode, xpath and snippet.
                resultsString += "- Message: " + issue.message +
                    "\n  Level: " + issue.level +
                    "\n  XPath: " + issue.path.dom +
                    "\n  Snippet: " + issue.snippet +
                    "\n  Help: " + aChecker.getHelpURL(issue.ruleId) +
                    "\n";
            }
        });

        return resultsString;
    };

    /**
     * This function is responsible for building the full help file URL using rule server.
     *
     * @param {String} helpFileName - Provide the help file name
     *
     * @return {String} helpFileName - The full help file URL
     *
     * PRIVATE METHOD
     *
     * @memberOf this
     */
    aChecker.getHelpURL = function (ruleId) {
        return new ace.Checker().engine.getHelp(ruleId);
    };

    aChecker.ruleIdToLegacyId = {
        "RPT_List_Misuse": "3",
        "RPT_Marquee_Trigger": "5",
        "RPT_Headers_FewWords": "7",
        "WCAG20_Input_ExplicitLabelImage": "10",
        "RPT_Img_UsemapValid": "11",
        "WCAG20_Object_HasText": "20",
        "WCAG20_Applet_HasAlt": "21",
        "RPT_Media_AudioTrigger": "24",
        "RPT_Blockquote_HasCite": "25",
        "RPT_Meta_Refresh": "33",
        "WCAG20_Frame_HasTitle": "39",
        "WCAG20_Input_ExplicitLabel": "41",
        "RPT_Media_AltBrief": "99",
        "WCAG20_A_TargetAndText": "112",
        "WCAG20_Area_HasAlt": "240",
        "RPT_Media_ImgColorUsage": "245",
        "WCAG20_Meta_RedirectZero": "254",
        "RPT_Elem_Deprecated": "256",
        "RPT_Blockquote_WrapsTextQuote": "263",
        "RPT_Elem_EventMouseAndKey": "269",
        "WCAG20_Doc_HasTitle": "273",
        "RPT_Block_ShouldBeHeading": "322",
        "WCAG20_Form_HasSubmit": "324",
        "RPT_Elem_UniqueId": "377",
        "RPT_Font_ColorInForm": "394",
        "RPT_Label_UniqueFor": "398",
        "RPT_Img_AltCommonMisuse": "453",
        "RPT_Img_LongDescription2": "454",
        "WCAG20_Img_HasAlt": "455",
        "RPT_Style_BackgroundImage": "456",
        "RPT_Pre_ASCIIArt": "458",
        "RPT_Media_VideoReferenceTrigger": "511",
        "RPT_Media_AudioVideoAltFilename": "460",
        "RPT_Style_ColorSemantics1": "466",
        "WCAG20_Select_HasOptGroup": "467",
        "RPT_List_UseMarkup": "468",
        "RPT_Script_OnclickHTML1": "470",
        "WCAG20_Table_Structure": "471",
        "WCAG20_Img_AltTriggerNonDecorative": "473",
        "WCAG20_Blink_AlwaysTrigger": "478",
        "RPT_Blink_CSSTrigger1": "479",
        "RPT_Html_SkipNav": "481",
        "RPT_Title_Valid": "484",
        "RPT_Header_HasContent": "488",
        "WCAG20_Html_HasLang": "490",
        "WCAG20_Form_TargetAndText": "491",
        "WCAG20_A_HasText": "495",
        "WCAG20_Fieldset_HasLegend": "497",
        "RPT_Media_VideoObjectTrigger": "501",
        "RPT_Text_SensoryReference": "502",
        "RPT_Embed_AutoStart": "503",
        "RPT_Style_HinderFocus1": "506",
        "WCAG20_Elem_Lang_Valid": "507",
        "WCAG20_Img_LinkTextNotRedundant": "1000",
        "RPT_Style_ExternalStyleSheet": "1073",
        "RPT_Header_Trigger": "1002",
        "RPT_Script_OnclickHTML2": "1007",
        "WCAG20_Table_CapSummRedundant": "1011",
        "WCAG20_Input_LabelBefore": "1017",
        "WCAG20_Input_LabelAfter": "1018",
        "WCAG20_Embed_HasNoEmbed": "1020",
        "WCAG20_Table_Scope_Valid": "1025",
        "WCAG20_Img_TitleEmptyWhenAltNull": "1027",
        "WCAG20_Input_InFieldSet": "1028",
        "WCAG20_Input_RadioChkInFieldSet": "1029",
        "WCAG20_Select_NoChangeAction": "1035",
        "WCAG20_Input_HasOnchange": "1050",
        "RPT_Embed_HasAlt": "1051",
        "Valerie_Noembed_HasContent": "1052",
        "Valerie_Caption_HasContent": "1053",
        "Valerie_Caption_InTable": "1054",
        "Valerie_Label_HasContent": "1055",
        "Valerie_Elem_DirValid": "1056",
        "Valerie_Frame_SrcHtml": "1057",
        "Valerie_Table_DataCellRelationships": "1059",
        "RPT_Table_LayoutTrigger": "1060",
        "RPT_Table_DataHeadingsAria": "1061",
        "WCAG20_Label_RefValid": "1062",
        "WCAG20_Elem_UniqueAccessKey": "1063",
        "WCAG20_Script_FocusBlurs": "1064",
        "HAAC_Img_UsemapAlt": "1067",
        "WCAG20_Text_Emoticons": "1068",
        "WCAG20_Style_BeforeAfter": "1069",
        "WCAG20_Text_LetterSpacing": "1070",
        "Rpt_Aria_ValidRole": "1074",
        "Rpt_Aria_ValidPropertyValue": "1076",
        "Rpt_Aria_ValidIdRef": "1077",
        "Rpt_Aria_RequiredProperties": "1079",
        "Rpt_Aria_EmptyPropertyValue": "1082",
        "Rpt_Aria_ValidProperty": "1083",
        "Rpt_Aria_InvalidTabindexForActivedescendant": "1084",
        "Rpt_Aria_MissingFocusableChild": "1086",
        "Rpt_Aria_MissingKeyboardHandler": "1087",
        "WCAG20_Img_PresentationImgHasNonNullAlt": "1090",
        "Rpt_Aria_MultipleSearchLandmarks": "1097",
        "Rpt_Aria_MultipleApplicationLandmarks": "1099",
        "Rpt_Aria_ApplicationLandmarkLabel": "1100",
        "Rpt_Aria_MultipleDocumentRoles": "1101",
        "WCAG20_Label_TargetInvisible": "1112",
        "HAAC_Video_HasNoTrack": "1117",
        "HAAC_Audio_Video_Trigger": "1119",
        "HAAC_Input_HasRequired": "1124",
        "HAAC_Aria_ImgAlt": "1128",
        "HAAC_BackgroundImg_HasTextOrTitle": "1132",
        "HAAC_Accesskey_NeedLabel": "1140",
        "HAAC_Aria_Or_HTML5_Attr": "1141",
        "HAAC_Canvas": "1143",
        "HAAC_Figure_label": "1144",
        "HAAC_Input_Placeholder": "1145",
        "HAAC_Aria_Native_Host_Sematics": "1146",
        "RPT_Form_ChangeEmpty": "1147",
        "IBMA_Color_Contrast_WCAG2AA": "1148",
        "IBMA_Color_Contrast_WCAG2AA_PV": "1149",
        "WCAG20_Body_FirstASkips_Native_Host_Sematics": "1150",
        "WCAG20_Body_FirstAContainsSkipText_Native_Host_Sematics": "1151",
        "Rpt_Aria_RequiredChildren_Native_Host_Sematics": "1152",
        "Rpt_Aria_RequiredParent_Native_Host_Sematics": "1153",
        "Rpt_Aria_EventHandlerMissingRole_Native_Host_Sematics": "1154",
        "Rpt_Aria_WidgetLabels_Implicit": "1156",
        "Rpt_Aria_OrphanedContent_Native_Host_Sematics": "1157",
        "Rpt_Aria_RegionLabel_Implicit": "1158",
        "Rpt_Aria_MultipleMainsVisibleLabel_Implicit": "1159",
        "Rpt_Aria_MultipleBannerLandmarks_Implicit": "1160",
        "Rpt_Aria_MultipleComplementaryLandmarks_Implicit": "1161",
        "Rpt_Aria_MultipleContentinfoLandmarks_Implicit": "1162",
        "Rpt_Aria_MultipleFormLandmarks_Implicit": "1163",
        "Rpt_Aria_MultipleNavigationLandmarks_Implicit": "1164",
        "Rpt_Aria_ComplementaryLandmarkLabel_Implicit": "1165",
        "Rpt_Aria_MultipleArticleRoles_Implicit": "1166",
        "Rpt_Aria_ArticleRoleLabel_Implicit": "1167",
        "Rpt_Aria_MultipleGroupRoles_Implicit": "1168",
        "Rpt_Aria_GroupRoleLabel_Implicit": "1169",
        "Rpt_Aria_MultipleContentinfoInSiblingSet_Implicit": "1170",
        "Rpt_Aria_OneBannerInSiblingSet_Implicit": "1172",
        "Rpt_Aria_ContentinfoWithNoMain_Implicit": "1173",
        "Rpt_Aria_ComplementaryRequiredLabel_Implicit": "1174",
        "Rpt_Aria_MultipleRegionsUniqueLabel_Implicit": "1176",
        "IBMA_Focus_Tabbable": "1177",
        "IBMA_Focus_MultiTab": "1178",
        "WCAG20_Table_SummaryAria3": "1179",
        "RPT_Style_Trigger2": "1180",
        "Rpt_Aria_MultipleMainsRequireLabel_Implicit_2": "1182",
        "HAAC_Media_DocumentTrigger2": "1183",
        "HAAC_Aria_ErrorMessage": "1184",
        "HAAC_List_Group_ListItem": "1185",
        "HAAC_ActiveDescendantCheck": "1186",
        "HAAC_Application_Role_Text": "1187",
        "Rpt_Aria_MultipleToolbarUniqueLabel": "1188",
        "HAAC_Combobox_ARIA_11_Guideline": "1193",
        "HAAC_Combobox_Must_Have_Text_Input": "1194",
        "HAAC_Combobox_DOM_Focus": "1195",
        "HAAC_Combobox_Autocomplete": "1196",
        "HAAC_Combobox_Autocomplete_Invalid": "1197",
        "HAAC_Combobox_Expanded": "1198",
        "HAAC_Combobox_Popup": "1199",
        "WCAG21_Style_Viewport": "1200",
        "WCAG21_Label_Accessible": "1202",
        "WCAG21_Input_Autocomplete": "1203",
        "WCAG20_Input_VisibleLabel": "1204"
    }

    aChecker.ignoreExtraBaselineViolations = function (actualReport, baselineReport) {
        var result = null;
        var existingRuleIDs = [];
        // Using for loop to make is sync code
        var ignoredCount = 0;
        var changedCounts = actualReport.summary.counts;

        var currentActualReport = actualReport.results;
        const currentBaselineReport = baselineReport;
        // a report exists in the baseline for the iframe
        if (currentBaselineReport && currentBaselineReport.length === 1) {
            let legacyBaseline = !!currentBaselineReport[0].issues;
            for (const issue of currentActualReport) {
                var currentRuleID = issue.ruleId;
                var currentLevel = issue.level;
                var currentXPATH = issue.path.dom;
                //check if the issue exists in baseline already
                var result =
                    legacyBaseline && currentBaselineReport[0].issues.filter(issue => issue.ruleId in aChecker.ruleIdToLegacyId && aChecker.ruleIdToLegacyId[issue.ruleId] === currentRuleID && issue.level === currentLevel && issue.xpath === currentXPATH)
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
    }

})();
module.exports = {
    getCompliance: aChecker.getCompliance,
    assertCompliance: aChecker.assertCompliance,
    getDiffResults: aChecker.getDiffResults,
    getBaseline: aChecker.getBaseline,
    diffResultsWithExpected: aChecker.diffResultsWithExpected,
    stringifyResults: aChecker.stringifyResults,
    getConfig: aChecker.getConfig,
    close: aChecker.close,
    ruleIdToLegacyId: aChecker.ruleIdToLegacyId,
    cleanComplianceObjectBeforeCompare: aChecker.cleanComplianceObjectBeforeCompare
}