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
 * NAME: ACCommon.js
 * DESCRIPTION: Stores all common functions/varialbes for karma-ibma server side
 *              code.

 *******************************************************************************/

/**
 * This object contains all the common, variables and functions used core server side
 * code of karma-ibma. This object is exported for engineloader/preprocessor and/or nodeJS
 * script to pick up and make use of.
 *
 * Contains the following varialbles/functions:
 *
 *  Variables:
 *     log --> Logger to log debug information to console (needs to be a logger)
 *  Functions:
 *     createKarmaFileObject --> Constructs a single file object for karma.
 *     validateSlackNotificationTarget --> Validates the slack notification target provided.
 *     convertPolicies --> Converts the policy into a comma seperated string when an array provided.
 *     mapLevelsToEngineReadableLevels --> Maps the provided levels into engine readable levels.
 *     levelToEngineLevel --> Converts human provided level into engine readable level
 *     processKarmaConfiguration --> Processes karma config and inject them into global to make them accessible
 *                                   in the karma browser.
 *
 * @memberOf this
 */
var ACCommon = {

    // Stores the logger which is used to log debug information
    // Note: The Reporter would beed to create the logger and set it before calling any functions.
    log: null,

    /**
     * This function is responsible for constructing a single file object for karma. This file object
     * is used by the karma configuration to determine which files to load up into the browser.
     * Karma config.files array requires the file object to be in a specific format so that it
     * is able to determine if this file should be include/served/watched file while running the
     * karma test.
     *
     * @param {String} fileAbsolutePath - The absolute path to the file for which a karma file object is
     *                                   required.
     *
     * @return {Object} singleFileObject - karma file object with the key value pairs filled out, following is a sample object:
     *                  {
     *                      pattern: "/home/devans/aChecker/karma-accessibility-checker/node_modules/karma-ibma/lib/engine-browser.js",
     *                      included: true,
     *                      served: true,
     *                      watched: false,
     *                      nocache: false
     *                  };
     *
     * @memberOf this
     */
    createKarmaFileObject: function (fileAbsolutePath) {
        ACCommon.log.debug("START 'createKarmaFileObject' function");

        ACCommon.log.debug("Creating Karma File Object for pattern: '" + fileAbsolutePath + "'");

        // Create the karma file object which will be used by karma to load the file.
        // Key Description:
        //  pattern --> Specifies the absolute path to the file
        //              can also be regex patterns. i.e. test/**/*.js
        //  included --> Should this file be included in the browser with <script> tag when karma starts
        //  served --> Should this file be served on the karma web server, to access
        //  watched --> Should this file be watched for changes
        //  nocache --> Should the files be served from disk on each request by Karma webserver
        var singleFileObject = {
            pattern: fileAbsolutePath,
            included: true,
            served: true,
            watched: false,
            nocache: true
        };

        ACCommon.log.debug("Object contains: ");
        ACCommon.log.debug(singleFileObject);

        ACCommon.log.debug("END 'createKarmaFileObject' function");

        // Return this object
        return singleFileObject;
    },

    /**
     * This function is responsible for constructing a single file object for karma. This file object
     * is used by the karma configuration to determine which files to load up into the browser.
     * Karma config.files array requires the file object to be in a specific format so that it
     * is able to determine if this file should be include/served/watched file while running the
     * karma test.
     *
     * @param {String} fileAbsolutePath - The absolute path to the file for which a karma file object is
     *                                   required.
     *
     * @return {Object} singleFileObject - karma file object with the key value pairs filled out, following is a sample object:
     *                  {
     *                      pattern: "/home/devans/aChecker/karma-accessibility-checker/node_modules/karma-ibma/lib/engine-browser.js",
     *                      included: true,
     *                      served: true,
     *                      watched: false,
     *                      nocache: false
     *                  };
     *
     * @memberOf this
     */
    createKarmaModuleObject: function (fileAbsolutePath) {
        ACCommon.log.debug("START 'createKarmaFileObject' function");

        ACCommon.log.debug("Creating Karma File Object for pattern: '" + fileAbsolutePath + "'");

        // Create the karma file object which will be used by karma to load the file.
        // Key Description:
        //  pattern --> Specifies the absolute path to the file
        //              can also be regex patterns. i.e. test/**/*.js
        //  included --> Should this file be included in the browser with <script> tag when karma starts
        //  served --> Should this file be served on the karma web server, to access
        //  watched --> Should this file be watched for changes
        //  nocache --> Should the files be served from disk on each request by Karma webserver
        var singleFileObject = {
            pattern: fileAbsolutePath,
            included: true,
            served: true,
            watched: false,
            nocache: true,
            type: "module"
        };

        ACCommon.log.debug("Object contains: ");
        ACCommon.log.debug(singleFileObject);

        ACCommon.log.debug("END 'createKarmaFileObject' function");

        // Return this object
        return singleFileObject;
    },


    /**
     * This function is responsible for validating the slack notification target is in the
     * correct format and only contains the supported options.
     *
     * i.e. Needs to follow the following formats:
     *      '<account>:<token>#<channel>'
     *      or
     *      https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
     *
     * @param {String} slackTarget - Slack notification target for the message, in the following format:
     *                               '<account>:<token>#<channel>'
     *                               or
     *                               https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
     *
     * @memberOf this
     */
    validateSlackNotificationTarget: function (slackTarget) {
        ACCommon.log.debug("START 'validateSlackNotificationTarget' function");

        // Variable Decleration
        var slackTargetVerificationRegex = /^(?:https?:\/\/(?:[a-zA-Z0-9-]\/?)+)|[a-zA-Z0-9-]+:[a-zA-Z0-9_-]+(#.+)$/;

        ACCommon.log.debug('Verify slack target meets standards');
        ACCommon.log.debug(slackTarget);

        if (slackTarget instanceof Array) {
            ACCommon.log.error("[ERROR] slackArrayNotificationNotSupported: The following provided slack target is not valid: ");
            ACCommon.log.error(slackTarget);
            process.exit(-1);
        } else {
            if (!slackTarget.match(slackTargetVerificationRegex)) {
                ACCommon.log.error("[ERROR] slackNotificationTargetIsNotValid: The following provided slack target: " + slackTarget + " does not meet standards: <account>:<token>#<channel> or webhook URL.");
                process.exit(-1);
            }
        }

        ACCommon.log.debug("END 'validateSlackNotificationTarget' function");
    }
};

// Export all the common functions and varialbes
module.exports = ACCommon;
