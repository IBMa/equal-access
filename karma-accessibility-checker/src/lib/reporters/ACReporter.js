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
 * NAME: ACReporter.js
 * DESCRIPTION: Used as the main karma-ibma reporter entry point, to be loaded
 *              by karma at run time.

 *******************************************************************************/

// Load common/JSON Reporter variables/functions
var ACReporterCommon = require('./ACReporterCommon');
// var ACReporterHTML = require('./ACReporterHTML');
// var ACReporterJSON = require('./ACReporterJSON');
// var ACMetricsLogger = require('../log/ACMetricsLogger');
const { ReporterManager } = require('../common/report/ReporterManager');
const { BaselineManager } = require('../common/report/BaselineManager');
const { ACConfigManager } = require('../common/config/ACConfigManager');
const path = require("path");
const fs = require("fs");
let Config;
(async () => {
    Config = await ACConfigManager.getConfig();
})();
let checker;
class MyFS {
    writeFileSync(filePath, data) {
        if (Config) {
            let outFile = this.prepFileSync(filePath);
            fs.writeFileSync(outFile, data);
        }
    }
    prepFileSync(filePath) {
        if (Config) {
            let outDir = path.resolve(Config.outputFolder);
            let outFile = path.join(outDir, filePath);
            if (!fs.existsSync(path.dirname(outFile))) {
                fs.mkdirSync(path.dirname(outFile), { recursive: true });
            }
            return outFile;
        } else {
            return filePath;
        }
    }
    log(...output) { console.debug(...output) }
    info(...output) { console.info(...output) }
    error(...output) { console.error(...output) }
    loadBaseline(label) {
        let baselineFile = path.join(path.join(process.cwd(), Config.baselineFolder), label+".json");
        if (fs.existsSync(baselineFile)) {
            return require(baselineFile);
        }
        return null;
    }
    getChecker() {}
}
let initialized = false;
/**
 * This function is responsible for constructing the aChecker Reporter which will be used to, report
 * the scan results, such as writing the page results and the summary to a JSON file. This reporter function
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
var ACReporter = function (baseReporterDecorator, config, logger, emitter) {

    // Call the Karma base reporter to initilize this as a extension to base karma
    // reporter.
    baseReporterDecorator(this);

    // Construct the aChecker reporter logger
    ACReporterCommon.log = logger.create('reporter.aChecker');

    // Override adapters
    this.adapters = [];

    /**
     * This function is responsible for performing any action when the karma test execution starts.
     * Overrides onRunStart function from baseReporterDecorator
     *
     * @override
     *
     * @memberOf this
     */
    this.onRunStart = function () {
        ACReporterCommon.log.debug("START 'onRunStart' function");
        // // Build a comma seperated list of all the policies selected
        // var policies = config.client.ACConfig.policies;
        // if (policies && policies !== null && policies !== undefined && typeof policies !== "undefined") {
        //     policies = config.client.ACConfig.policies.join(",");
        // }

        // // Init the Metrics logger
        // metricsLogger = new ACMetricsLogger("karma-accessibility-checker", ACReporterCommon.log, policies);

        // // Initialize the scan Summary object with details on the scan which performed.
        // ACReporterCommon.scanSummary = ACReporterCommon.initializeSummary(config);

        ACReporterCommon.log.debug("END 'onRunStart' function");
    };

    /**
     * This function is responsible for performing any action when the browser is about start tests.
     * Overrides onBrowserStart function from baseReporterDecorator
     *
     * @override
     *
     * @memberOf this
     */
    this.onBrowserStart = function (browser) {
        ACReporterCommon.log.debug("START 'onBrowserStart' function");

        ACReporterCommon.log.debug("END 'onBrowserStart' function");
    };

    /**
     * This function is responsible for performing any action when the browser is done running tests.
     * Overrides onBrowserComplete function from baseReporterDecorator
     *
     * @override
     *
     * @memberOf this
     */
    this.onBrowserComplete = function (browser, result) {
        ACReporterCommon.log.debug("START 'onBrowserComplete' function");

        // Extract the browser name and then encode the browser name so that it can be pushed to the
        // metrics server.
        //metricsLogger.sendLogsV1(browser.name);

        ACReporterCommon.log.debug("END 'onBrowserComplete' function");
    };

    /**
     * This function is responsible for performing any action when the tests (spec) is done.
     * Overrides onSpecComplete function from baseReporterDecorator
     *
     * @override
     *
     * @memberOf this
     */
    this.onSpecComplete = function (browser, result) {
        ACReporterCommon.log.debug("START 'onSpecComplete' function");


        ACReporterCommon.log.debug("END 'onSpecComplete' function");
    };

    /**
     * This function is responsible for performing any action when a testcase fails, passes, or
     * is skipped.
     * Overrides specSuccess, specSkipped, specFailure functions from baseReporterDecorator
     *
     * @override
     *
     * @memberOf this
     */
    this.specSuccess = this.specSkipped = this.specFailure = function (browser, result) {
        ACReporterCommon.log.debug("START 'specSuccess, specSkipped, specFailure' functions");

        ACReporterCommon.log.debug("END 'specSuccess, specSkipped, specFailure' functions");
    };

    /**
     * This function is responsible executing the code to save the results to JSON file
     * when the browser_info emitter is dispatched.
     *
     * @param {Object} results - Provide the full results object which is to be reported/saved to file.
     *                           refer to return in function "ACHelper.js function aChecker.buildReport" prolog
     *
     * @memberOf this
     */
    emitter.on('browser_info', function (browser, results) {
        try {
            let { startScan, url, pageTitle, label, engineReport, rulesets } = results;
            // If no engineReport, if probably didn't come from "runScan"
            if (!engineReport) return;
            if (!initialized) {
                let absApi = new MyFS();
                ReporterManager.initialize(Config, absApi, rulesets);
                BaselineManager.initialize(Config, absApi, {});
                initialized = true;
            }

            ACReporterCommon.log.debug("START 'browser_info' emitter function");

            if (!engineReport.results) {
                console.error("ERROR in browser_info. scanResults:", results);
            }
            ReporterManager.addEngineReport("karma-accessibility-checker", startScan, url, pageTitle, label, engineReport);
            ACReporterCommon.log.debug("END 'browser_info' emitter function");
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    /**
     * This function is responsible for performing any action when the entire karma run is done.
     * Overrides onRunComplete function from baseReporterDecorator
     *
     * @override
     *
     * @memberOf this
     */
    this.onRunComplete = function (browser, result) {
        ACReporterCommon.log.debug("START 'onRunComplete' functions");


        ACReporterCommon.log.debug("END 'onRunComplete' function");
    };

    // This emitter function is responsible for calling this function when the exit event is detected
    emitter.on('exit', function (done) {
        ACReporterCommon.log.debug("START 'exit' emitter function");

        // Fetch to determine if this is running in a travis environment or not
        var isTravis = process.env.TRAVIS ? true : false;

        // Fetch if slack should be enabled for local run or not
        var enableSlackNotificationForLocal = config.client.ACConfig.notifications.localRun;

        // Variable which stores if an error occured to start karma/syntax errors in scripts, etc
        // Any type of failure which occured and was not part of a testcase failure
        var errorOccured = false;

        // In the case an error has occured need to check if any tests had ran or not. In the case
        // case that any testcase ran and failed we consider this as a normal execution.
        if (ACReporterCommon.result && ACReporterCommon.result.error) {
            errorOccured = (ACReporterCommon.result.success === 0 && ACReporterCommon.result.failed === 0);
        }

        // If slack notification are configured dispatch the notification to the slack server/channel in question.
        // Don't dispatch a slack notification in the case that there was an error that occured, and no testcase actually ran (passed/failed)
        // Don't dispatch a slack notification in the case that notification.local flag is set to false
        if (config.client.ACConfig.notifications && config.client.ACConfig.notifications.slack && !errorOccured && (isTravis || (!isTravis && enableSlackNotificationForLocal))) {
            // Create a done wrapper function as we need to upload the metrics logs as well after the slack notification has been dispatched.
            var doneWrapper = function () {
                ReporterManager.generateSummaries().then(() => {
                    done();
                })
            };

            ACReporterSlack.sendSlackNotificationWithSummary(ACReporterCommon.scanSummary, config.client.ACConfig.notifications.slack, config, ACReporterCommon.result, doneWrapper);
        } else {
            // Make sure to call done(), in the case that no slack notification is needed
            ReporterManager.generateSummaries().then(() => {
                done();
            })
        }

        ACReporterCommon.log.debug("END 'exit' emitter function");
    });
};

// Inject the variables from Karma into the ACReporter class
ACReporter.$inject = ['baseReporterDecorator', 'config', 'logger', 'emitter'];

// Export this function, which will be called when Karma loads the reporter
module.exports = ACReporter;
