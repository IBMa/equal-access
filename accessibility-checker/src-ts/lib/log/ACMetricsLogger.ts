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
import { ILogger } from "../api/IChecker";
import axios from "axios";

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
export class ACMetricsLogger {
    policies: string;
    metricsURLV2: string = "https://able.ibm.com/tools";
    log: ILogger;
    toolName: string;
    scanTimesV1 = [];
    scanTimesV2 : {
        [profile: string]: number[]
    } = {};

    constructor(toolName: string, logger: ILogger, policies: string[]) {
        this.policies = policies.join(",");

        // accessibility-checker Metrics Logger
        this.log = logger;

        // Init all the local object variables
        this.toolName = toolName;
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
    profileV2(scanTime: number, profile: string) {
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
    async sendLogsV2(done, rulePack) {
        this.log.debug("START 'sendLogsV2' function");

        // Copy this.log into loggerInScope so that it can be used in callback function
        let loggerInScope = this.log;

        try {
            // Variable Decleration
            let numProfiles = 0;
            let accountId = "";

            // Loop over all the profiles with in the scanTime Object
            for (let profile in this.scanTimesV2) {

                // Loop over all the V2 Scan Times until it reaches 0
                while (this.scanTimesV2[profile].length > 0) {
                    // Build a truncatedScanTime Array to upload to the metrics server chunck by chunck
                    let subScanTimes = this.scanTimesV2[profile].splice(0, 150);

                    // Increment the num Profile
                    ++numProfiles;

                    // Start building the Query string to be sent to the metrics server
                    let qs = "?t=" + this.toolName + "&tag=" + profile + "&a=" + accountId + "&pol=" + this.policies + "&st=";

                    subScanTimes.forEach(function (t) {
                        qs += t;
                        qs += ",";
                    });
                    qs = qs.substr(0, qs.length - 1);

                    this.log.debug("Uploading: " + this.metricsURLV2 + "/api/pub/meter/v2" + qs);

                    // Dispatch the call to the metrics server
                    // Istanbul is not able to capture the coverate of functions call in a callback therefore we need to skip
                    /* istanbul ignore next */
                    axios.get(this.metricsURLV2 + "/api/pub/meter/v2" + qs).then(() => {
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
