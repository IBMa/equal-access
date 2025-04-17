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
 * NAME: ACMetricsLogger.js
 * DESCRIPTION: Common Metrics logger object which can be shared between tools
 *              to upload metrics of the tool to the metrics server.

 *******************************************************************************/

// Load required modules

/**
 * This function is responsible for constructing the accessibility-checker Metrics object which contains all the function
 * that are needed to upload scan metrics to the metric server.
 *
 * @param {String} toolName - The name of the tool sending the metrics.
 * @param {String} logger - Logger object which can be used to log debug information.
 * @param {String} policies - Array of policies which will be sent to the metrics server.
 *
 * @return - N/A
 *
 * @memberOf this
 */
var ACMetricsLogger = function (toolName, logger, policies) {

    // Variable Decleration
    this.metricsURLV2 = "https://able.ibm.com/tools";

    // accessibility-checker Metrics Logger
    this.log = logger;

    // Init all the local object variables
    this.toolName = toolName;

    // Contains the time it took for a scan for the V1 metric server
    this.scanTimesV1 = [];

    // Contains the scan times indexed by profile for V2 metric server
    this.scanTimesV2 = {};

    // Additional details to upload to the metrics server
    this.policies = policies;

    // In the case that policies provided is an array convert it to a comma seperated list
    if (this.policies instanceof Array) {
        this.policies = this.policies.join(",");
    }

    /**
     * This function is responsible for profiling the testcases and adding the scan time to the global
     * array which will be sent to the metrics server to log the number of scans that were performed.
     * This function profiles scanTimes for the V2 metric server:
     *  https://aat.w3ibm.mybluemix.net
     *
     * In the case that user provides any url that is https://aat* it will upload based on accountId
     *
     * @param {String} scanTime - Provide the time it took for the testcase to run
     * @param {String} profile - The type of profile the scan time is for:
     *                             i.e. browser information, features, etc...
     *
     * @return N/A - Global scanTimesV2 object is updated with the time
     *
     * @memberOf this
     */
    this.profileV2 = function (scanTime, profile) {
        this.log.debug("START 'profileV2' function");

        // URI encode the profile text provided
        profile = encodeURIComponent(profile);

        // Add the time it took for the testcase to run to the global array, indexed by the profile
        this.scanTimesV2[profile] = this.scanTimesV2[profile] || [];
        this.scanTimesV2[profile].push(scanTime);

        this.log.debug("END 'profileV2' function");
    };

    /**
     * This function is responsible for uploading scan results to the metrics server:
     * https://aat.w3ibm.mybluemix.net
     *
     * @param {Function} done - The browser on which the testcases were run on
     *
     * @return N/A - performs the upload of the metrics to the server
     *
     * @memberOf this
     */
    this.sendLogsV2 = function (done, rulePack) {
        this.log.debug("START 'sendLogsV2' function");

        // Copy this.log into loggerInScope so that it can be used in callback function
        var loggerInScope = this.log;

        try {
            // Variable Decleration
            var numProfiles = 0;
            var accountId = "";

            // Reset the timeout to 0
            if (this.timeout) {
                this.timeout(0);
            }

            // Loop over all the profiles with in the scanTime Object
            for (var profile in this.scanTimesV2) {

                // Loop over all the V2 Scan Times until it reaches 0
                while (this.scanTimesV2[profile].length > 0) {
                    // Build a truncatedScanTime Array to upload to the metrics server chunck by chunck
                    var subScanTimes = this.scanTimesV2[profile].splice(0, 150);

                    // Increment the num Profile
                    ++numProfiles;

                    // Start building the Query string to be sent to the metrics server
                    var qs = "?t=" + this.toolName + "&tag=" + profile + "&a=" + accountId + "&pol=" + this.policies + "&st=";

                    subScanTimes.forEach(function (t) {
                        qs += t;
                        qs += ",";
                    });
                    qs = qs.substr(0, qs.length - 1);

                    this.log.debug("Uploading: " + this.metricsURLV2 + "/api/pub/meter/v2" + qs);

                    // Dispatch the call to the metrics server
                    // Istanbul is not able to capture the coverate of functions call in a callback therefore we need to skip
                    /* istanbul ignore next */
                    fetch(this.metricsURLV2 + "/api/pub/meter/v2" + qs).catch(() => {}).finally(() => {
                        // Decrement the numProfiles to identify that scan has finished
                        --numProfiles;

                        // Once all metrics for all profiles have been uploaded we end this function call
                        if (numProfiles === 0) {
                            loggerInScope.debug("END 'sendLogsV2' function");
                            done && done();
                        }
                    });
                }
            }

            // Once all metrics for all profiles have been uploaded we end this function call
            if (numProfiles === 0) {
                this.log.debug("END 'sendLogsV2' function");
                done && done();
            }
        } catch (e) {
            /* istanbul ignore next */
            this.log.debug("Error uploading metrics logs: " + e);
            /* istanbul ignore next */
            this.log.debug("END 'sendLogsV2' function");
            /* istanbul ignore next */
            done && done();
        }
    };
};

// Export this function, which can be used to create a new metrics logger object
module.exports = ACMetricsLogger;
