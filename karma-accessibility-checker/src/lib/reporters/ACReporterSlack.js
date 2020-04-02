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
 * NAME: ACReporterSlack.js
 * DESCRIPTION: Used to build slack notification and dispatch slack notification.

 *******************************************************************************/

// Load all the modules that are needed
var pathLib = require('path');
var Slack = require('slack-node');
var SlackAPI = require('slack');
var ACReporterCommon = require('./ACReporterCommon');
var constants = require(pathLib.join(__dirname, '..', 'ACConstants'));
var execSync = require('child_process').execSync;
var shell = require('shelljs');
var fs = require('fs-extra');

/**
 * This object contains all the common, variables and functions used by Slack reporter of
 * karma-ibma. This object is exported for reporter and/or nodeJS script to
 * pick up and make use of.
 *
 * Contains the following varialbles/functions:
 *
 *  Functions:
 *     sendSlackNotificationWithSummary --> Send a slack notification to a channel with summary of a11y violations.
 *     parseSlackTarget --> Parse slack notification information provided in the config file
 *     buildSlackNotificationObject --> Build slack notification object to be sent over the API or webhook
 *     buildAttachmentsFieldsForViolationsCount --> Build attachment fields object and fall back object for the notification object.
 *     getViolationMappingToHumanReadable --> Convert the violation key to human readable string
 *     buildSlackNotificationTitle --> Builds the slack notification title for the notification object
 *     getTravisCIEnvironmentVariables --> Fetches the travis CI environment variables to be used to build slack notification.
 *     getCommitAuthorName --> Fetch the commiter's name to make the slack notification more tailored.
 *     isTravisCI --> Check if running in travis env or not.
 *     getTestRunDuration --> Build the human readable test run duration.
 *
 * @memberOf this
 */
var ACReporterSlack = {

    /**
     * This function is responsible for sending notification to a slack channel, which contains a summary
     * of the accessibility violations. The notification will also show if the scan passed of failed based
     * on the failLevels which were set. i.e. If fail level is violation and violations are detected, it will send
     * a failure notification.
     *
     * @param {Object} scanSummary - Scan summary which will be used to build the message which will be sent as a
     *                               notification to the slack target.
     * @param {String} slackTarget - Slack notification target for the message, in the following format:
     *                               '<account>:<token>#<channel>'
     *                               or
     *                               https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
     * @param {Object} config - Karma config object, used to extrat the outputFolder from the ACConfig.
     * @param {Object} result - Result object from karma which outlines number of passed/failed testcase.
     * {
     *     success: 1,
     *     failed: 0,
     *     error: false,
     *     disconnected: false,
     *     exitCode: 0
     * }
     * @param {Function} done - Done function to be called when slack notification has been sent and no errors occured.
     *
     * @memberOf this
     */
    sendSlackNotificationWithSummary: function (scanSummary, slackTarget, config, result, done) {
        ACReporterCommon.log.debug("START 'sendSlackNotificationWithSummary' function");

        ACReporterCommon.log.debug(slackTarget);

        // Variable Decleration
        var parsedSlackInformation = null;
        var webHook = false;

        if (!slackTarget.match(/^https?/)) {
            // Parse the provided slack configuration to extract slack account name, authenticate token and channel if provided.
            parsedSlackInformation = ACReporterSlack.parseSlackTarget(slackTarget);
        } else {
            parsedSlackInformation = slackTarget;
            webHook = true;
        }

        ACReporterCommon.log.debug(parsedSlackInformation);

        // Build the slack notification object to be pushed to the slack channel
        var slackNotificationObject = ACReporterSlack.buildSlackNotificationObject(scanSummary, config, result);

        // Handle the case where a webhook url was provided and also handle the case where the API token is provided as well.
        if (webHook) {

            ACReporterCommon.log.debug("Webhook Detected and dispatching as webhook");

            // Build a new slack Object and set the webhook URL where the message needs to be dispatched to
            var slackWebHook = new Slack();
            slackWebHook.setWebhook(parsedSlackInformation);

            // Dispatch the slack notification to the provided web hook and handle any errors
            // Istanbul is not able to capture the coverate of functions call in a callback therefore we need to skip
            /* istanbul ignore next */
            slackWebHook.webhook(slackNotificationObject, function(err, response) {
                if ((err && err !== null && err !== undefined && typeof err !== "undefined") || response.statusCode !== 200) {
                    ACReporterCommon.log.error("[ERROR] SlackWebHookError: Correct slack webhook URL needs to be provided for a slack notification to be sent. URL: \"" + parsedSlackInformation + "\" is not valid.");
                }
                done();
            });
        } else {
            ACReporterCommon.log.debug("Slack API Detected and dispatching as postMessage");

            // Add the API access token to the slack notification object
            slackNotificationObject.token = parsedSlackInformation.token;

            // Extract the channel from the parsed slack information object
            var channel = parsedSlackInformation.channel;

            // When the channel is provided update the slackNotification object to include the channel as part of the object
            if (channel && channel !== null && channel !== undefined && typeof channel !== "undefined" && channel !== "") {
                slackNotificationObject.channel = channel;

                ACReporterCommon.log.debug("Updated Slack Notification Object: ");
                ACReporterCommon.log.debug(slackNotificationObject);
            }

            // Dispatch the slack notification using the provided API access token and channel.
            // Istanbul is not able to capture the coverate of functions call in a callback therefore we need to skip
            /* istanbul ignore next */
            SlackAPI.chat.postMessage(slackNotificationObject, function (err, response) {
                if (err && err !== null && err !== undefined && typeof err !== "undefined") {
                    ACReporterCommon.log.error("[ERROR] SlackAPIError: Correct Slack API token/channel must be provided for a slack notification to be sent, refer to below error for more details: \n\n" + err.message);
                } else {
                    ACReporterCommon.log.debug("Response from Slack API chat.postMessage");
                    ACReporterCommon.log.debug(response);
                }
                done();
            });
        }

        ACReporterCommon.log.debug("END 'sendSlackNotificationWithSummary' function");
    },

    /**
     * This function is responsible for parsing the slack notification information to extract out the
     * slack server name, authenticate token and channel if provided. In the case that a channel is not provided
     * it will default to the channel which is setup with the incomming webhook or app incomming webhook.
     *
     * @param {String} slackTarget - Slack notification target for the message, in the following format:
     *                               ''<account>:<token>#<channel>''
     *                               or
     *                               https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
     *
     * @returns {Object} parsedSlackInformation - returns the parsed slack information will contain the following:
     * {
     *     "slackServerAccount": "ibm-accessibility",
     *     "token": "xoxp-xxxxxxxxxxx-xxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
     *     "channel": "a11y-tool-integration" (if provided)
     * }
     *
     * @memberOf this
     */
    parseSlackTarget: function (slackTarget) {
        ACReporterCommon.log.debug("START 'parseSlackTarget' function");

        ACReporterCommon.log.debug("Start parsing: " + slackTarget);

        // Variable Decleration
        var parsedSlackInformation = {};

        // Parse to extract the slack Server name where the notification needs to go to
        //var [slackServerAccount, slackAdditionalInformation] = slackTarget.split(":"); // Only supported on ES6 nodeJS 4 does not support
        var slackServerAccountParsedArray = slackTarget.split(":");

        // slack Server account will always be first, so simply pull it out
        var slackServerAccount = slackServerAccountParsedArray[0];

        ACReporterCommon.log.debug("Extracted slack Server Account as: " + slackServerAccount);
        ACReporterCommon.log.debug("Parsing remaining items: " + slackServerAccountParsedArray[1]);

        // Parse out the token and channel from the remaining parsed content from the previous parsing run, which will be used
        // to authenticate into the slack server and allow sending the notification to the slack channel which is provided.
        //var [token, channel] = slackTarget.split("#"); // Only supported on ES6 nodeJS 4 does not support
        var tokenAndChannelParsedArray = slackServerAccountParsedArray[1].split("#");

        // slack notification authenticate token will always be first when parsed
        var token = tokenAndChannelParsedArray[0];

        // Only populate channel variable if it was parsed from the configuration
        var channel = tokenAndChannelParsedArray[1] ? tokenAndChannelParsedArray[1] : null;

        ACReporterCommon.log.debug("Extracted token as: " + token);
        ACReporterCommon.log.debug("Extracted channel: " + channel);

        // When the channel is provided, since we split on "#", we need to add the "#" back to the channel string
        if (channel && channel !== null && channel !== undefined && typeof channel !== "undefined" && channel !== "") {
            channel = "#" + channel;

            // Add channel to the parsed slack information object
            parsedSlackInformation.channel = channel;
        }

        // Add all the parsed information to object
        parsedSlackInformation.slackServerAccount = slackServerAccount;
        parsedSlackInformation.token = token;

        ACReporterCommon.log.debug("Parsed slack content:");
        ACReporterCommon.log.debug(parsedSlackInformation);

        ACReporterCommon.log.debug("END 'parseSlackTarget' function");

        return parsedSlackInformation;
    },

    /**
     * This function is responsible for building the slack notification object which contains the full slack message, icon,
     * username, etc...
     *
     * @param {Object} scanSummary - Scan summary which will be used to build the message which will be sent as a
     *                               notification to the slack target.
     * @param {Object} config - Karma config object, used to extrat the outputFolder from the ACConfig.
     *
     * @param {Object} result - Result object from karma which outlines number of passed/failed testcase.
     * {
     *     success: 1,
     *     failed: 0,
     *     error: false,
     *     disconnected: false,
     *     exitCode: 0
     * }
     *
     * @returns {Object} slackNotification - Full slack notification object which is sent to the API, follows the following
     *                                       format:
     * {
     *     "username": "IBM Accessibility (karma-ibma),
     *     "as_user": false,
     *     "icon_empji": ":ghost:",
     *     "text": Build #387 (0e487f5) of IBMa/karma-accessibility-checker@slackIntegration by Devan Shah failed accessibility tests in 20 seconds with:
     *     "attachments": [
     *         {
     *             "color": "#00ff00",
     *             "fields": <refer to return from function buildAttachmentsFieldsForViolationsCount>
     *             "fallback": <refer to return from function buildAttachmentsFieldsForViolationsCount>
     *         }
     *     ]
     * }
     *
     * @memberOf this
     */
    buildSlackNotificationObject: function (scanSummary, config, result) {

        ACReporterCommon.log.debug("START 'buildSlackNotificationObject' function");

        // Variable Decleration
        var slackNotification = {};

        // Build the fields for violation count to be displayed in the slack notification
        var attachmentFieldsForViolationCount = ACReporterSlack.buildAttachmentsFieldsForViolationsCount(scanSummary);

        // Build the slack notification title to be sent as part of the slack message. This title will be detailed outlining the build information
        // if running on travis CI.
        var slackNotificationTitle = ACReporterSlack.buildSlackNotificationTitle(scanSummary, result);

        // Set the color status based on if the test run had failures or not
        var statusColor = (result.failed === 0) ? constants.passingSlackNotificationColor : constants.failureSlackNotificationColor;

        // Build the slack notification object with all the information that is needed
        slackNotification = {
            "username": constants.slackBotUsername,
            "as_user": false,
            "icon_emoji": constants.slackIconEmoji,
            "text": slackNotificationTitle,
            "attachments": [
                {
                    "color": statusColor,
                    "fields": attachmentFieldsForViolationCount.attachmentFields,
                    "fallback": attachmentFieldsForViolationCount.attachmentFieldsFallback
                }
            ]
        };

        ACReporterCommon.log.debug("Built slack notification object: ");
        ACReporterCommon.log.debug(slackNotification);

        ACReporterCommon.log.debug("END 'buildSlackNotificationObject' function");

        return slackNotification;
    },

    /**
     * This function is responsible for building the slack notification attachments.field object based on the scan
     * summary which is provided.
     *
     * @param {Object} scanSummary - Scan summary which will be used to build the message which will be sent as a
     *                               notification to the slack target.
     *
     * @returns {Object} attachmentFieldsInformation - contains the build attachment fields and also a fall back attachment fields.
     *                                                 Following is the format of the object:
     * {
     *     "attachmentFields": [
     *         {
     *             title: 'Violations',
     *             value: 1000,
     *             short: true
     *         },
     *         {
     *             title: 'PotentialViolations',
     *             value: 23,
     *             short: true
     *         },
     *         {
     *             title: 'Recommendations',
     *             value: 123,
     *             short: true
     *         },
     *         {
     *             title: 'PotentialRecommendations',
     *             value: 123242,
     *             short: true
     *         },
     *         {
     *             title: 'ManualChecks',
     *             value: 123,
     *             short: true
     *         }
     *     ],
     *     "attachmentFieldsFallback": "Violations: 1000 Potential Violations: 23 Recommendations: 123 Potential Recommendations: 123242 Manual Checks: 123"
     * };
     *
     * @memberOf this
     */
    buildAttachmentsFieldsForViolationsCount: function (scanSummary) {
        ACReporterCommon.log.debug("START 'buildAttachmentsFieldsForViolationsCount' function");

        // Variable Decleration
        var attachmentFields = [];
        var attachmentFieldsFallback = "";

        // Fetch the scan summary counts object
        var countsObject = scanSummary.counts;

        ACReporterCommon.log.debug("Extracted counts object:");
        ACReporterCommon.log.debug(countsObject);

        // Loop over all the counts keys and extract value to add it into the attachment fields array
        for (var violationType in countsObject) {
            ACReporterCommon.log.debug("Start building field for violation type: " + violationType);

            // Fetch the human readable violation type and the number of that violation
            var violationTypeHumanReadable = ACReporterSlack.getViolationMappingToHumanReadable(violationType);
            var numberOfViolations = countsObject[violationType];

            // Push the build field to global arrachments fields arry
            attachmentFields.push({
                "title": violationTypeHumanReadable,
                "value": numberOfViolations,
                "short": true
            });

            // Build attachments field fallback string in the case fields is not able to be rendered
            attachmentFieldsFallback += violationTypeHumanReadable + ": " + numberOfViolations + " ";

            ACReporterCommon.log.debug("Done building field for violation type: " + violationType);
        }

        ACReporterCommon.log.debug("Built attachment fields: ");
        ACReporterCommon.log.debug(attachmentFields);

        ACReporterCommon.log.debug("Built attachment fields fallback: ");
        ACReporterCommon.log.debug(attachmentFieldsFallback);

        ACReporterCommon.log.debug("END 'buildAttachmentsFieldsForViolationsCount' function");

        return {
            "attachmentFields": attachmentFields,
            "attachmentFieldsFallback": attachmentFieldsFallback
        };
    },

    /**
     * This function is responsible for getting the human readable violation type. Will convert the violation
     * key into the human readable representation.
     *
     * @param {String} violationType - The violation type to convert into human readable representation.
     *
     * @returns {String} violationType - Human readable violation level. i.e. violation --> Violation, potentialviolation --> Potential Violation
     *
     * @memberOf this
     */
    getViolationMappingToHumanReadable: function (violationType) {
        ACReporterCommon.log.debug("START 'getViolationMappingToHumanReadable' function");

        ACReporterCommon.log.debug("Converting: " + violationType);

        // Convert the violation type key into human readable string
        if (violationType === "violation") {
            violationType = "Violations";
        } else if (violationType === "potentialviolation") {
            violationType = "Potential Violations";
        } else if (violationType === "recommendation") {
            violationType = "Recommendations";
        } else if (violationType === "potentialrecommendation") {
            violationType = "Potential Recommendations";
        } else if (violationType === "manual") {
            violationType = "Manual Checks";
        } else if (violationType === "ignored") {
            violationType = "Ignored";
        }

        ACReporterCommon.log.debug("Converted to: " + violationType);

        ACReporterCommon.log.debug("END 'getViolationMappingToHumanReadable' function");

        return violationType;
    },

    /**
     * This function is responsible for building the slack notification title, which is used to identify which build, commit, branch, author caused
     * the accessibility failures.
     *
     * @param {Object} scanSummary - Scan summary which will be used to build the message which will be sent as a
     *                               notification to the slack target.
     *
     * @param {Object} result - Result object from karma which outlines number of passed/failed testcase.
     * {
     *     success: 1,
     *     failed: 0,
     *     error: false,
     *     disconnected: false,
     *     exitCode: 0
     * }
     *
     * @returns {String} slackNotificationtitle - Fully build slack notification title, when running on travis ci it will contain build, commit,
     *                                            branch, author information otherwise it will only mention it was local run and the date it was run.
     * i.e. Build #387 (this is a link) (0e487f5) (this is a link) of IBMa/karma-accessibility-checker@slackIntegration by Devan Shah failed accessibility tests in 20 seconds with:
     *
     * @memberOf this
     */
    buildSlackNotificationTitle: function (scanSummary, result) {
        ACReporterCommon.log.debug("START 'buildSlackNotificationTitle' function");

        // Get all the Travis CI Environments variables which are needed to build message
        var travisCIEnvVar = ACReporterSlack.getTravisCIEnvironmentVariables();

        // Before building the slack notification title need to check if running in travis or locally
        var isTravis = ACReporterSlack.isTravisCI(travisCIEnvVar);

        // Get the commiters Name
        var committerName = ACReporterSlack.getCommitAuthorName();

        // Get the test run duration
        var testRunDuration = ACReporterSlack.getTestRunDuration(scanSummary);

        // Stores the slack notification title
        var slackNotificationtitle = "";

        // Check the test run status by checking the result faild value, if it is 0 we pass otherwise it failed.
        var testRunStatus = (result.failed === 0) ? "PASSED" : "FAILED";

        // If running on travi ci, build a detailed title otherwise consider this as local.
        if (isTravis) {

            // Get the build number based on if this is a multi threaded build or not. When there are multiple builds for the same
            // overall build it will have "." in the Job number.
            var buildNumber = (travisCIEnvVar.TRAVIS_JOB_NUMBER.indexOf('.') !== -1) ? travisCIEnvVar.TRAVIS_JOB_NUMBER : travisCIEnvVar.TRAVIS_BUILD_NUMBER;

            // In Travis the builds that are run can be either normal builds or jobs (child jobs of a build)
            var buildJobOrBuild = "/builds/";

            // In the case that this is a build which contains a "." this means that it is a job of a over all build, there fore the links are
            // at a different location.
            if (travisCIEnvVar.TRAVIS_JOB_NUMBER.indexOf('.') !== -1) {
                buildJobOrBuild = "/jobs/";
            }

            // Parse the travis commit to only display 7 characters so that the message is not to long
            var travisCommit = travisCIEnvVar.TRAVIS_COMMIT.substring(0,7);

            // Build the Build Results URL and github commit compare URL
            var buildResultsURL = constants.travisServer + travisCIEnvVar.TRAVIS_REPO_SLUG + buildJobOrBuild + travisCIEnvVar.TRAVIS_JOB_ID;
            var buildGitHubURL = constants.githubServer + travisCIEnvVar.TRAVIS_REPO_SLUG + "/compare/" + travisCIEnvVar.TRAVIS_COMMIT_RANGE;

            // Build the first part of the slack message title
            slackNotificationtitle = "Build <" + buildResultsURL + "|#" + buildNumber + "> " +
                "(<" + buildGitHubURL + "|" + travisCommit + ">) of *" + travisCIEnvVar.TRAVIS_REPO_SLUG +
                "@" + travisCIEnvVar.TRAVIS_BRANCH;

            // Build the message a little different when it is a pull request, add details that this is a pull request
            if (travisCIEnvVar.TRAVIS_PULL_REQUEST != "false") {
                // Build the pull Request URL
                var pullRequestURL = constants.githubServer + travisCIEnvVar.TRAVIS_REPO_SLUG + "/pull/" + travisCIEnvVar.TRAVIS_PULL_REQUEST;

                // Add pull request related data into the slack message title.
                slackNotificationtitle += " in PR <" + pullRequestURL + "|#" + travisCIEnvVar.TRAVIS_PULL_REQUEST + "> ";
            }

            // Add additional details to the message related to who commited, test run status, and duration.
            slackNotificationtitle += "* by *" + committerName + "* *" + testRunStatus + "* accessibility tests in *" + testRunDuration + "* with the following:";
        } else {
            slackNotificationtitle = "Accessibility test run *" + testRunStatus + "* in *" + testRunDuration + "* with the following:";
        }

        ACReporterCommon.log.debug("Built slack notification title: " + slackNotificationtitle);

        ACReporterCommon.log.debug("END 'buildSlackNotificationTitle' function");

        return slackNotificationtitle;
    },

    /**
     * This function is responsible for geting the travis CI environment variables which are needed to build a descriptive slack notification
     * message. Extracts the following Travis CI environment varialbes:
     *      TRAVIS_REPO_SLUG --> The slug (in form: owner_name/repo_name) of the repository currently being built. (for example, “travis-ci/travis-build”)
     *      TRAVIS_BRANCH --> For builds not triggered by a pull request this is the name of the branch currently being built;
     *      TRAVIS_BUILD_NUMBER --> The number of the current build (for example, “4”).
     *      TRAVIS_JOB_ID --> The id of the current job that Travis CI uses internally.
     *      TRAVIS_COMMIT --> The commit that the current build is testing.
     *      TRAVIS_COMMIT_RANGE --> The range of commits that were included in the push or pull request. (Note that this is empty for builds triggered by the initial commit of a new branch.)
     *      TRAVIS_JOB_NUMBER --> The number of the current job (for example, “4.1”).
     *      TRAVIS_PULL_REQUEST --> The pull request number if the current job is a pull request, “false” if it’s not a pull request.
     *
     * @returns {Object} travisCIEnvironmentVariables - Object of all the travis environment variables, object will look like the following:
     * {
     *    TRAVIS_REPO_SLUG: "IBMa/karma-accessibility-checker",
     *    TRAVIS_BRANCH: "slackIntegration",
     *    TRAVIS_BUILD_NUMBER: "600",
     *    TRAVIS_JOB_ID: "1365120",
     *    TRAVIS_COMMIT: "0e487f5",
     *    TRAVIS_COMMIT_RANGE: "0b6be9934250...0e487f5b9c6d",
     *    TRAVIS_JOB_NUMBER: "600.1",
     *    TRAVIS_PULL_REQUEST: "123"
     * }
     *
     * @memberOf this
     */
    getTravisCIEnvironmentVariables: function () {
        ACReporterCommon.log.debug("START 'getTravisCIEnvironmentVariables' function");

        // Variable Decleration
        var travisCIEnvironmentVariables = {};

        // Get: The slug (in form: owner_name/repo_name) of the repository currently being built. (for example, “travis-ci/travis-build”)
        //travisCIEnvironmentVariables.TRAVIS_REPO_SLUG = "IBMa/karma-accessibility-checker";
        travisCIEnvironmentVariables.TRAVIS_REPO_SLUG = process.env.TRAVIS_REPO_SLUG;

        // Get: For builds not triggered by a pull request this is the name of the branch currently being built;
        //      whereas for builds triggered by a pull request this is the name of the branch targeted by the pull request
        //      (in many cases this will be master).
        //travisCIEnvironmentVariables.TRAVIS_BRANCH = "slackIntegration";
        travisCIEnvironmentVariables.TRAVIS_BRANCH = process.env.TRAVIS_BRANCH;

        // Get: The number of the current build (for example, “4”).
        //travisCIEnvironmentVariables.TRAVIS_BUILD_NUMBER = "600";
        travisCIEnvironmentVariables.TRAVIS_BUILD_NUMBER = process.env.TRAVIS_BUILD_NUMBER;

        // Get: The id of the current job that Travis CI uses internally.
        //travisCIEnvironmentVariables.TRAVIS_JOB_ID = "1365120";
        travisCIEnvironmentVariables.TRAVIS_JOB_ID = process.env.TRAVIS_JOB_ID;

        // Get: The commit that the current build is testing.
        //travisCIEnvironmentVariables.TRAVIS_COMMIT = "0e487f5";
        travisCIEnvironmentVariables.TRAVIS_COMMIT = process.env.TRAVIS_COMMIT;

        // Get: The range of commits that were included in the push or pull request.
        //      (Note that this is empty for builds triggered by the initial commit of a new branch.)
        //travisCIEnvironmentVariables.TRAVIS_COMMIT_RANGE = "0b6be9934250...0e487f5b9c6d";
        travisCIEnvironmentVariables.TRAVIS_COMMIT_RANGE = process.env.TRAVIS_COMMIT_RANGE;

        // Get: The number of the current job (for example, “4.1”).
        //travisCIEnvironmentVariables.TRAVIS_JOB_NUMBER = "600.1";
        travisCIEnvironmentVariables.TRAVIS_JOB_NUMBER = process.env.TRAVIS_JOB_NUMBER;

        // Get: The pull request number if the current job is a pull request, “false” if it’s not a pull request.
        //travisCIEnvironmentVariables.TRAVIS_PULL_REQUEST = "123";
        travisCIEnvironmentVariables.TRAVIS_PULL_REQUEST = process.env.TRAVIS_PULL_REQUEST;

        ACReporterCommon.log.debug("Extracted Travis CI Environment Variables: ");
        ACReporterCommon.log.debug(travisCIEnvironmentVariables);

        ACReporterCommon.log.debug("END 'getTravisCIEnvironmentVariables' function");

        return travisCIEnvironmentVariables;
    },

    /**
     * This function is responsible for getting the commiters name, who commited the last commit.
     *
     * @returns {String} COMMITER_NAME - name of the commiter
     *
     * @memberOf this
     */
    getCommitAuthorName: function () {
        ACReporterCommon.log.debug("START 'getCommitAuthorName' function");

        // Variable Decleration
        var COMMITER_NAME = "UNKNOWN";

        // Run the git commnad to fetch the commiter's name
        if (shell.which('git')) {
            ACReporterCommon.log.debug("Running command: git log -1 --format=\"%aN\" to get commiter author");

            // In the case the script is not running in a git repository, we are not able to get the commit author name
            // therefore just return UNKNOWN.
            try {
                // Run the git log command to get the authors name
                COMMITER_NAME = execSync('git log -1 --format="%aN"');
            } catch (e) {
                // Set commiter name to null, to show that there was an issues to get the author name
                COMMITER_NAME = null;
            }

            if (COMMITER_NAME === null || COMMITER_NAME === undefined || typeof COMMITER_NAME === "undefined") {
                COMMITER_NAME = "UNKNOWN";
            }

            // Trim the commiter name to make sure there is no leading or trailing spaces or new lines
            COMMITER_NAME = COMMITER_NAME.toString().replace(/^\s+|\s+$/g, '');

            ACReporterCommon.log.debug("Detected commiter author as: " + COMMITER_NAME);
        }

        ACReporterCommon.log.debug("END 'getCommitAuthorName' function");

        return COMMITER_NAME;
    },

    /**
     * This function is responsible for verifying that all the travis CI environment variables are
     * defined.
     *
     * @param {Object} travisCIEnvironmentVariables - Object of all the travis environment variables, object will look like the following:
     * {
     *    TRAVIS_REPO_SLUG: "IBMa/karma-accessibility-checker",
     *    TRAVIS_BRANCH: "slackIntegration",
     *    TRAVIS_BUILD_NUMBER: "600",
     *    TRAVIS_JOB_ID: "1365120",
     *    TRAVIS_COMMIT: "0e487f5",
     *    TRAVIS_COMMIT_RANGE: "0b6be9934250...0e487f5b9c6d",
     *    TRAVIS_JOB_NUMBER: "600.1",
     *    TRAVIS_PULL_REQUEST: "123"
     * }
     *
     * @returns {Boolean} isTravis - true if this is a travis environment, false otherwise
     *
     * @memberOf this
     */
    isTravisCI: function (travisCIEnvVar) {
        ACReporterCommon.log.debug("START 'isTravisCI' function");

        // Variable Decleration
        var isTravis = true;

        // Loop over all the travis environment variables and verify that they are not empty/null
        for (var travisEnvVar in travisCIEnvVar) {

            // Get the travis ci environment variable value
            var travisEnvVarValue = travisCIEnvVar[travisEnvVar];

            ACReporterCommon.log.debug("Verifying: " + travisEnvVar);

            // If any of the travis ci are empty except for TRAVIS_COMMIT_RANGE or TRAVIS_COMMIT we marks this as not running in travis
            if (travisEnvVarValue === "" || travisEnvVarValue === null || travisEnvVarValue === undefined || typeof travisEnvVarValue === "undefined") {
                if (travisEnvVar !== "TRAVIS_COMMIT_RANGE" && travisEnvVar !== "TRAVIS_COMMIT") {
                    isTravis = false;

                    ACReporterCommon.log.debug("Unable to verify: " + travisEnvVar);
                    // Break out if even one is missing
                    break;
                }
            }

            ACReporterCommon.log.debug("Verified: " + travisEnvVar);
        }

        ACReporterCommon.log.debug("isTravis: " + isTravis);

        ACReporterCommon.log.debug("END 'isTravisCI' function");

        return isTravis;
    },

    /**
     * This function is responsible for getting the test run duration.
     *
     * @param {Object} scanSummary - Scan summary which will be used to build the message which will be sent as a
     *                               notification to the slack target.
     *
     * @returns {String} testRunDuration - Human readable test run duration
     *
     * @memberOf this
     */
    getTestRunDuration: function (scanSummary) {
        ACReporterCommon.log.debug("START 'getTestRunDuration' function");

        // Variable Decleration
        var testRunDuration = "";

        // Get the start time and end time of the test run
        var startTime = scanSummary.startReport;
        var endTime = scanSummary.endReport;

        ACReporterCommon.log.debug("Start time: " + startTime);
        ACReporterCommon.log.debug("End time: " + endTime);

        // Get the duration of the test run
        var duration = endTime - startTime;
        duration = duration / 1000; // Convert to seconds

        ACReporterCommon.log.debug("Duration: " + duration);

        // Convert the duration into hrs/seconds
        var hours = Math.floor(duration / 3600);
        var min = Math.floor((duration - (hours * 3600)) / 60);
        var seconds = Math.floor(duration % 60);

        if (hours !== 0) {
            testRunDuration += hours + " hrs ";
        }

        if (min !== 0) {
            testRunDuration += min + " min ";
        }

        testRunDuration += seconds + " sec";

        ACReporterCommon.log.debug("Test Run Duration: " + testRunDuration);

        ACReporterCommon.log.debug("END 'getTestRunDuration' function");

        return testRunDuration;
    }
};

// Export all the common function for karma-ibma reporters
module.exports = ACReporterSlack;