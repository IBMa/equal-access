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
 * NAME: ACMetricsLogger.ts
 * DESCRIPTION: Common Metrics logger object which can be shared between tools
 *              to upload metrics of the tool to the metrics server.
 *******************************************************************************/

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
    metricsURLV2 = "https://able.ibm.com/tools";
    // Name of this tool to track
    toolName : string;
    // Contains the scan times indexed by profile for V2 metric server
    scanTimesV2 : { 
        [profile: string] : {
            [policies: string] :number[] 
        }
    } = {};

    constructor(toolName: string) {
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
    profileV2(scanTime: number, profile: string, policies: string[] | string) {
        let policy: string;
        // Additional details to upload to the metrics server
        if (policies instanceof Array) {
            policy = policies.join(",");
        } else {
            policy = policies;
        }
        // URI encode the profile text provided
        profile = encodeURIComponent(profile);

        // Add the time it took for the testcase to run to the global array, indexed by the profile
        this.scanTimesV2[profile] = this.scanTimesV2[profile] || {};
        this.scanTimesV2[profile][policy] = this.scanTimesV2[profile][policy] || [];
        this.scanTimesV2[profile][policy].push(scanTime);
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
    async sendLogsV2() {
        let promises = [];
        try {
            // Loop over all the profiles with in the scanTime Object
            for (var profile in this.scanTimesV2) {
                for (var policy in this.scanTimesV2[profile]) {
                    // Loop over all the V2 Scan Times until it reaches 0
                    while (this.scanTimesV2[profile][policy].length > 0) {
                        // Build a truncatedScanTime Array to upload to the metrics server chunck by chunck
                        var subScanTimes = this.scanTimesV2[profile][policy].splice(0, 150);

                        // Start building the Query string to be sent to the metrics server
                        var qs = "?t=" + this.toolName + "&tag=" + profile + "&a=&pol=" + policy + "&st=";

                        subScanTimes.forEach(function (t) {
                            qs += t;
                            qs += ",";
                        });
                        qs = qs.substr(0, qs.length - 1);

                        // Dispatch the call to the metrics server
                        // Istanbul is not able to capture the coverate of functions call in a callback therefore we need to skip
                        /* istanbul ignore next */
                        promises.push(fetch(this.metricsURLV2 + "/api/pub/meter/v2" + qs));
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
        try {
            return Promise.all(promises);
        } catch (e) {
            return;
        }
    };
};