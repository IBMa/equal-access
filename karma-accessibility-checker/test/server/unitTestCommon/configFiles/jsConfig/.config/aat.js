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

var config = {
    // optional - Specify the rule pack server to use. (Where to pull the rules and engine from)
    // Default: https://cc-rules.w3ibm.mybluemix.net/js/latest/
    "rulePack": "https://cc-rules.w3ibm.mybluemix.net/js/latest/",
    "ruleArchive": "latest",
    // optional - Specify one or many policies to scan.
    // i.e. For one policy use policies: CI162_5_2_DCP080115
    // i.e. Multiple policies: CI162_5_2_DCP080115,IBM_Accessibility or refer to below as a list
    // Default: null (all policies)
    // We are setting no policies because we want the unit test to run for all policies
    "policies": ["IBM_Accessibility"],

    // optional - Specify one or many violation levels on which to fail the test
    //            i.e. If specified violation then the testcase will only fail if
    //                 a violation is found uring the scan.
    // i.e. failLevels: violation
    // i.e. failLevels: violation,potential violation or refer to below as a list
    // Default: violation, potentialviolation
    "failLevels": ["violation", "potentialviolation"],

    // optional - Specify one or many violation levels which should be reported
    //            i.e. If specified violation then in the report it would only contain
    //                 results which are level of violation.
    // i.e. reportLevels: violation
    // i.e. reportLevels: violation,potential violation or refer to below as a list
    // Default: violation, potentialviolation, recommendation, potentialrecommendation, manual
    "reportLevels": ["violation",
        "potentialviolation",
        "recommendation",
        "potentialrecommendation",
        "manual"
    ],

    // Optional - Specify if screenshots should be captured of the current page that is being scanned
    // Default: false
    // Only capture if supported by the browser that is specified.
    "captureScreenshots": false,

    // Optional - Which type of file should the results be outputted to.
    //   outputFormat: json
    // Default: json
    "outputFormat": ["json"],

    // Optional - Specify labels that you would like associated to your scan
    //
    // i.e.
    //   label: Firefox,master,V12,Linux
    //   label:
    //       - Firefox
    //       - master
    //       - V12
    //       - Linux
    // Default: none
    "label": ["Firefox", "master", "V12", "Linux"],

    // optional - Where the scan results should be saved
    // Default: results
    "outputFolder": "results",

    // Following are the non published config options

    // optional - Should Hidden content be scanned
    // true --> Yes scan hidden content
    // false --> Don't scan hidden content
    // Default: false
    "checkHiddenContent": false,

    // Which file extensions should be checked
    // Default: html, htm, svg
    "extensions": ["html", "htm", "svg"],

    // optional - Specify where to sent the slack notification
    // Default: null
    //
    // Supports the following types of slack authentications (API token, and webhook)
    //   API with channel: <account>:<token>#<channel>
    //   or
    //   API without channel: <account>:<token>
    //   or
    //   Incoming Webhook: https://hooks.slack.com/services/TXXXXXXXX/BXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX
    "notifications": {
        "localRun": false,
        "slack": "ibm-accessibility:xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX#a11y-tool-integration"
    },
    "authToken": "47994f55-03f8-4edb-93d5-f8e3c066f269/92cf2e70-5a68-4289-8838-6fb0510569b4"
};

module.exports = config;