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
 * NAME: ACConstants.js
 * DESCRIPTION: Stores all the constants that are used by karma-ibma.
 *******************************************************************************/

// Load all the modules that are needed
var os = require('os');
var pathLib = require('path');

// Used to specify all the constant
var constants = {
    DEBUG: true,

    policies: ["IBM_Accessibility"],

    // Specify the default rule pack server to use. (Where to pull the rules and engine from).
    rulePack: "https://cdn.jsdelivr.net/npm/accessibility-checker-engine@latest",

    //Specify the rule set to be use.
    ruleArchive: "latest",

    // Specify default violation levels on which to fail the test.
    // i.e. If specified violation then the testcase will only fail if
    //      a violation is found uring the scan.
    failLevels: ["violation", "potentialviolation"],

    // Specify default violation levels which should be reported.
    // i.e. If specified violation then in the report it would only contain
    //      results which are level of violation.
    reportLevels: ["violation",
        "potentialviolation"
    ],

    // Specify default value if screenshoot should be captured of the current page that is being scanned.
    captureScreenshots: false,

    // Specify default value for which type should the results be outputted to
    outputFormat: "json",

    // Specify default location where the results should be saved
    outputFolder: "results",

    // Specify default value if Hidden content be scanned or not.
    checkHiddenContent: false,

    // Specify default value for Which file extensions should be checked
    extensions: ["html", "htm", "svg"],

    // Specify default value for the engine file name. This the
    engineFileName: "ace.js",

    // Specifiy the default value for the notification object
    // Which is to send no notifications and set localRun to false, which will not send a notification when running locally if notification is enabled
    notifications: {
        localRun: false
    },

    // List of files to look for in that order, in the case even one is found we stop and load that as the config.
    // Theses files will be checked for in the working directory:
    //  ./.achecker.yml
    //  ./.achecker.yaml
    //  ./achecker.js
    //  ./achecker.json
    //  ./.config/.achecker.yml
    //  ./.config/.achecker.yaml
    //  ./.config/achecker.js
    //  ./.config/achecker.json
    // The node module, require will load js or json depending on which one is present, in the case
    // both json and js are present it loads js first.
    configFiles: [".achecker.yml", ".achecker.yaml", "achecker", "aceconfig", pathLib.join(".config", ".achecker.yml"), pathLib.join(".config", ".achecker.yaml"), pathLib.join(".config", "achecker"), pathLib.join(".config", "aceconfig")],

    // Specify the travis CI server to be used to build the slack notification links based of
    travisServer: "https://travis-ci.org/",

    // Specify the github server to be used to build the slack notification links based of
    githubServer: "https://github.com/",

    // Specify the bot name to be used by the slack notification API
    slackBotUsername: "IBM Accessibility (karma-accessibility-checker)",

    // Specify the Failure color hex value
    failureSlackNotificationColor: "#ff0000",

    // Specify the pass color hex value
    passingSlackNotificationColor: "#00ff00",

    // Specify the icon emoji for slack notification
    slackIconEmoji: "",

    // Specify the icon URL for slack notification
    slackIconURL: null,

    // Specify the file name of slack Notification object
    slackNotificationObjectFile: "slackNotificationObject.json",

    // Specify the file name of the wrapper dispatch slack notification file
    sendSlackNotificationFile: "sendSlackNotification.js",

    // Specify the Base Accessibility Server URL
    baseA11yServerURL: "https://cdn.jsdelivr.net/npm/accessibility-checker-engine",

    // Specify true or false to allow setting rulePack with a custom server
    customRuleServer: false,

    // Default cache folder (for ace-node.js / archives.json)
    cacheFolder: os.tmpdir()+"/accessibility-checker/"

};

// Export this the constants
module.exports = constants;
