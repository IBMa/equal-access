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

// Load all the modules that are needed
var pathLib = require('path');
//var request = require("request");
var fs = require('fs');
//var Promise = require('promise');
var YAML = require('js-yaml');
var constants = require(pathLib.join(__dirname, 'ACConstants'));
var uuid = require('uuid');
const request = require("request");
const { resolve } = require('path');

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
 *     loadConfigFromYAMLorJSONFile --> Loads yml/yaml, js and json config files
 *     initializeDefaults --> Initializes default values for config if not provided.
 *     processACConfig --> Process the accessibility-checker Config to make sure everything is valid in config
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
     * This function is responsible reading in the .yaml or .yml or .json and set the config options based on this.
     *
     * @return {Object} config - return the config object that was read in, refer to function initializeDefaults
     *                           to view how the object is to be constructed.
     *
     * @memberOf this
     */
    loadConfigFromYAMLorJSONFile: function () {
        ACCommon.log.debug("START 'loadConfigFromYAMLorJSONFile' function");

        // Variable Decleration
        var config = {};

        // Get the current working directory, where we will look for the yaml, yml or json file
        var workingDir = process.cwd();

        ACCommon.log.debug("Working directory set to: " + workingDir);

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
        // Refer to constants.js for more details
        var configFiles = constants.configFiles;

        // Loop over all the possible location where the config file can reside, if one is found load it and break out.
        for (var i = 0; i < configFiles.length; i++) {

            // Get the full path to the config file we are going to check
            var fileToCheck = pathLib.join(workingDir, configFiles[i]);

            ACCommon.log.debug("Checking file: " + fileToCheck);

            // Get the extension of the file we are about to scan
            var fileExtension = fileToCheck.substr(fileToCheck.lastIndexOf('.') + 1);

            // If this is a yml or yaml file verify that the file exists and then load as such.
            if (fileExtension === "yml" || fileExtension === "yaml") {
                // Start checking which files exists, if it exists then load it as the config that was read in
                // We only allow specifying a file, and the order it checks is based on what is specified in the array.
                // i.e. So in the case that it finds yml, it will load and not check the rest, etc...
                if (fs.existsSync(fileToCheck)) {

                    ACCommon.log.debug("File: " + fileToCheck + " exists loading it.");

                    ACCommon.log.debug("Loading as YAML file.");

                    try {
                        // Load in as yml or yaml file and return this object
                        return YAML.load(fs.readFileSync(fileToCheck), 'utf8');
                    } catch (e) {
                        ACCommon.log.error("[ERROR] LoadingConfigError: Unable to load yml/yaml config file due to the following error: \n" + e.message);
                        process.exit(-1);
                    }
                }
            } else {
                ACCommon.log.debug("Trying to load as json or js.");

                // Need to use try/catch mech so that in the case the require throws an exception, we can
                // catch this and discatd the error, as in the case there is no config file provided then
                // we load in default values.
                try {

                    // call the resolve to check if the file exists or not, and get the actualy path if it was js or json
                    var jsOrJSONFile = require.resolve(fileToCheck);

                    // Only try to load the achecker js or json file if it exists.
                    // There is no need to verify if the jsOrJSONFile object contains information
                    // because the require.resolve function will throw an exception when file is not found,
                    // since we have a try catch, that will cover that case.
                    // Refer to: https://github.com/nodejs/node/issues/3939
                    ACCommon.log.debug("Loading: " + jsOrJSONFile);

                    // Load in as json or js and return this object
                    return require(fileToCheck);
                } catch (e) {
                    ACCommon.log.debug("JSON or JS file does not exists, will load default config.");
                }
            }
        }

        ACCommon.log.debug("END 'loadConfigFromYAMLorJSONFile' function");

        return config;
    },

    /**
     * This function is responsible initializing all the default values for the configurations, in the case any
     * of the config options are missing.
     *
     * @param {Object} config - Provide the config object in which we need to initialize the default values.
     *
     * @return {Object} config - return the config object which has all the default values, in the case
     *                           some of the options are null or undefined.
     *
     * @memberOf this
     */
    initializeDefaults: function (config) {
        ACCommon.log.debug("START 'initializeDefaults' function");

        ACCommon.log.debug("Config before initialization: ");
        ACCommon.log.debug(config);

        // Check to make sure the rule pack server is defined, if not then set the default vaule
        config.rulePack = config.rulePack || constants.rulePack;

        // In the case that the rulePack is missing trailing /, add this into
        // Regex described:
        //  \/?$
        //      \/? matches the character /
        //          Note: ? means between 0 and 1 time
        //      $ assert position at end of the string
        //  So if / is there it will replace it, if it is not there it will add it
        // config.rulePack = config.rulePack.replace(/\/?$/, '/');

        // Make sure all the following options are defined, otherwise reset them to default values.
        config.failLevels = config.failLevels || constants.failLevels;
        config.reportLevels = config.reportLevels || constants.reportLevels;
        config.outputFolder = config.outputFolder || constants.outputFolder;
        config.outputFormat = config.outputFormat || constants.outputFormat;
        config.extensions = config.extensions || constants.extensions;
        config.engineFileName = config.engineFileName || constants.engineFileName;
        config.ruleArchive = config.ruleArchive || constants.ruleArchive;
        config.cacheFolder = config.cacheFolder ? resolve(config.cacheFolder) : constants.cacheFolder;

        // For check hidden content need to check for null or undefined and then set default otherwise it will evaluate the
        // boolean which causes it to always comply with the default value and not user provided option
        if (config.checkHiddenContent === null || config.checkHiddenContent === undefined || typeof config.checkHiddenContent === "undefined") {
            config.checkHiddenContent = constants.checkHiddenContent;
        }

        // For capture screenshots need to check for null or undefined and then set default otherwise it will evaluate the
        // boolean which causes it to always comply with the default value and not user provided option
        if (config.captureScreenshots === null || config.captureScreenshots === undefined || typeof config.captureScreenshots === "undefined") {
            config.captureScreenshots = constants.captureScreenshots;
        }

        // Init notification.localRun in the case that notification object is already provided
        if (config.notifications !== null && config.notifications !== undefined && typeof config.notifications !== "undefined" && (config.notifications.localRun === null || config.notifications.localRun === undefined || typeof config.notifications.localRun === "undefined")) {
            config.notifications.localRun = constants.notifications.localRun;
        } else {
            // Init notifications to default constants value if entire notification object is not provided
            config.notifications = config.notifications || constants.notifications;
        }

        // Load in the package.json file so that we can extract the module name and the version to build
        // a toolID which needs to be used when results are build for the purpose of keeping track of
        // which tool is uploading the results.
        var packageObject = require('../package.json');

        // Build the toolID based on name and version
        config.toolID = packageObject.name + "-v" + packageObject.version;

        // Using the uuid module generate a uuid number which is used to assoiciate to the scans that
        // are done for a single run of karma.
        config.scanID = uuid.v4();

        ACCommon.log.debug("Config after initialization: ");
        ACCommon.log.debug(config);

        ACCommon.log.debug("END 'initializeDefaults' function");
    },

    /**
     * This function is responsible processing the accessibility-checker config which was initialized to make sure it contains,
     * information which matches what the engine reads.
     *
     * i.e.
     *  Need to change reportLevels and failLevels to match with level declerations in the engine.
     *      replace violation with level.violation
     *  Need to change array of policies into a string
     *      ["IBM_Accessibility_2018_08","IBM_Accessibility_2018_08"] to "IBM_Accessibility_2018_08,IBM_Accessibility_2018_08"
     *
     * @param {Object} ACConfig - Provide the config object in which needs to be processed.
     *
     * @return {Object} ACConfig - return the config object which has been made engine readable
     *
     * @memberOf this
     */
    processACConfig: async function (ACConfig) {
        ACCommon.log.debug("START 'processACConfig' function");

        // Convert the reportLevels and failLevels to match with what the engine provides
        // Don't need to convert the levels from the input as we are going to compare with out the level.
        // by using contains algo, so that in the reports we can add it without level, until the engine is
        // updated to pass back with out level.
        //ACConfig.reportLevels = mapLevelsToEngineReadableLevels(ACConfig.reportLevels);
        //ACConfig.failLevels = mapLevelsToEngineReadableLevels(ACConfig.failLevels);

        // Convert the policies into a comma seperated string
        ACConfig.policies = ACCommon.convertPolicies(ACConfig.policies);

        // If there is a slack notification config option verify it is in the correct syntax
        if (ACConfig.notifications && ACConfig.notifications.slack) {
            ACCommon.validateSlackNotificationTarget(ACConfig.notifications.slack);
        }


        if (ACConfig.customRuleServer) {
            ACCommon.log.debug("Specified Usage of custom Rule Server, switching to custom rule server");

            // Set the ruleArchive to empty for custom rule server
            ACConfig.ruleArchive = "";
            // Set the rulePack with what is provided in the configuration
            ACConfig.rulePack = ACConfig.rulePack;
        } else {
            // In the case that baseA11yServerURL is provided in the config use that as the base otherwise switch to the default one from the constants object
            var baseA11yServerURL = ACConfig.baseA11yServerURL ? ACConfig.baseA11yServerURL : constants.baseA11yServerURL;
            // depending on the rule archive selected, we will direct them to diffrent path of the archive
            let archiveJson = await new Promise((resolve, reject) => {
                let ruleArchiveFile = `${baseA11yServerURL}${baseA11yServerURL.includes("jsdelivr.net")?"@next":""}/archives.json`;

                request.get({ 
                    url: ruleArchiveFile, 
                    rejectUnauthorized: false
                }, function (error, response, body) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(body);
                    }
                });
            });
            fs.mkdirSync(ACConfig.cacheFolder, { recursive: true});
            fs.writeFileSync(pathLib.join(ACConfig.cacheFolder, "archives.json"), archiveJson);
            // fs.writeFileSync(pathLib.join(ACConfig.cacheFolder, "archives.json"), archiveJson);
            let ACArchive = JSON.parse(archiveJson);
            let ruleArchive = ACConfig.ruleArchive;
            let ruleArchivePath = null;
            let ruleArchiveVersion = null;

            for (let i = 0; i < ACArchive.length; i++) {
                if (ruleArchive == ACArchive[i].id && !ACArchive[i].sunset) {
                    ruleArchivePath = ACArchive[i].path;
                    ruleArchiveVersion = ACArchive[i].version;
                    ACConfig.ruleArchive = ACArchive[i].name + " (" + ACArchive[i].id + ")";
                    break;
                }
            }
            // Throw error and exit if provided rule archive value doesn't match with our rule archive list
            if (!ruleArchivePath || ruleArchiveVersion === null) {
                ACCommon.log.error("[ERROR] RuleArchiveInvalid: Ensure correct rule archive is provided in the configuration file. More information is available in the README.md");
                process.exit(-1);
            }
            // Build the new rulePack based of the baseA11yServerURL and archive info
            if (baseA11yServerURL.includes("jsdelivr.net")) {
                ACConfig.rulePack = `${baseA11yServerURL}@${ruleArchiveVersion}`;
            } else {
                ACConfig.rulePack = `${baseA11yServerURL}${ruleArchivePath}/js`;
            }
            ACCommon.log.debug("Built new rulePack: " + ACConfig.rulePack);
        }

        ACCommon.log.debug("END 'processACConfig' function");

        // Return the updated ACConfig object
        return ACConfig;
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
                ACCommon.log.error("[ERROR] slackNotificationTarketIsNotValid: The following provided slack target: " + slackTarget + " does not meet standards: <account>:<token>#<channel> or webhook URL.");
                process.exit(-1);
            }
        }

        ACCommon.log.debug("END 'validateSlackNotificationTarget' function");
    },

    /**
     * This function is responsible converting policies into an Array based on string or Array.
     *
     * i.e. convert array into string version of array
     *  "IBM_Accessibility_2018_08,IBM_Accessibility_2018_08"
     *
     *  converts to:
     *
     *  [
     *    "IBM_Accessibility_2018_08",
     *    "IBM_Accessibility_2018_08"
     *  ]
     *
     * @param {(Array|String)} policies - Provide list of policies, single policy or comma seperated policies
     *
     * @return {Array} policies - return the policy converted into Array version
     *
     * @memberOf this
     */
    convertPolicies: function (policies) {
        ACCommon.log.debug("START 'convertPolicies' function");

        ACCommon.log.debug("Converting policy provided to Array: ");
        ACCommon.log.debug(policies);

        ACCommon.log.debug("END 'convertPolicies' function");

        // In the case policies is an Array return it as engine expects list
        if (policies instanceof Array) {
            return policies;
        }
        // If the policies is string, we need to convert it to an array. Which includes comma seperated string support also
        else if (typeof policies === "string") {
            return policies.split(',');
        }

        return policies;
    },

    /**
     * This function is responsible going through an array that contains levels, and make sure the
     * values are readable by the engine.
     *
     * i.e. replace violation with level.violation
     *  [
     *    "violation"
     *  ]
     *
     *  converts to:
     *
     *  [
     *    "level.violation"
     *  ]
     *
     * @param {Array} levelArray - Provide the level array which needs to be converted
     *
     * @return {Array} mappedArray - return the level array with the converted level name (keys)
     *
     * @memberOf this
     */
    mapLevelsToEngineReadableLevels: function (levelArray) {
        ACCommon.log.debug("START 'mapLevelsToEngineReadableLevels' function");

        ACCommon.log.debug("Level Array before: ");
        ACCommon.log.debug(levelArray);

        // Variable Decleration
        var mappedArray = [];

        // Loop over all the level values and convert them to engine readable values
        levelArray.forEach(function (level) {

            // Fetch the mapped level
            var mappedLevel = ACCommon.levelToEngineLevel(level);

            // Add the mapped level to the new array
            mappedArray.push(mappedLevel);
        });

        ACCommon.log.debug("Level Array After: ");
        ACCommon.log.debug(mappedArray);

        ACCommon.log.debug("END 'mapLevelsToEngineReadableLevels' function");

        // Return back the mapped object
        return mappedArray;
    },

    /**
     * This function is responsible for converting user provided level into engine readable level
     *
     * i.e. replace "violation" with "level.violation"
     *
     * @param {String} level - Provide the level to convert to engine readable level
     *
     * @return {String} level - return the engine readable level key
     *
     * @memberOf this
     */
    levelToEngineLevel: function (level) {
        ACCommon.log.debug("START 'levelToEngineLevel' function");

        ACCommon.log.debug("Converting level: '" + level + "'.");

        // Based on what the level is, map it to the equivalent level key supported by the engine.
        if (level === "violation") {
            return "level.violation";
        } else if (level === "potential violation") {
            return "level.potentialviolation";
        } else if (level === "recommendation") {
            return "level.recommendation";
        } else if (level === "potential recommendation") {
            return "level.potentialrecommendation";
        } else if (level === "manual") {
            return "level.manual";
        }

        ACCommon.log.debug("END 'levelToEngineLevel' function");

        // If the provided level is not supported return undefined.
        return "undefined";
    },

    /**
     * This function is responsible for processing the karma configuration for accessibility-checker.
     * The ACConfig provided in the Karma configuration will be processed by this
     * function and then the config variables will be assoiciated to the global space so that
     * they can be accessed from window.__karma__.config
     *
     * @param {Object} config - All the Karma configuration, we will extract what we need from this over
     *                          all object, we need the entire object so that we can reasign some config
     *                          variables to global scope so that all karma testscases/scripts can access
     *                          them.
     *
     * @return - N/A - Object will be processed and all the params that are needed for this module will
     *                 be extracted and then the entire object will be added to global space.
     *
     * @memberOf this
     */
    processKarmaConfiguration: async function (config) {
        ACCommon.log.debug("START 'processKarmaConfiguration' function");

        ACCommon.log.debug("Processing the following karma config: ");
        ACCommon.log.debug(config);

        // Variable Decleration
        var ACConfig = null;
        var configFromFile = null;

        // Read in the .yaml (.yml) or .json file to load in the configuration
        configFromFile = ACCommon.loadConfigFromYAMLorJSONFile();

        ACCommon.log.debug("Loaded config from file: ");
        ACCommon.log.debug(configFromFile);

        // In the case configuration was provided in a yaml, yml or json file, then set this as the configuration
        // otherwise load them from the Karma configuration.
        if (configFromFile !== null && typeof (configFromFile) !== "undefined" && Object.keys(configFromFile).length !== 0) {
            ACCommon.log.debug("Using config which was loaded from config file.");

            ACConfig = configFromFile;
        } else if (config.ACConfig !== null && typeof (config.ACConfig) !== "undefined" && Object.keys(config.ACConfig).length !== 0) {
            // Extract the ACConfig from the overall karma configuration, in the case config file
            // was not provided.
            ACConfig = config.ACConfig;
        } else {
            ACConfig = {};
        }

        // In the case the ACConfig object is not defined, then define it with default config options so
        // it can be set in window.__karma__.config.ACConfig, so that we know even in the testcases, other
        // wrapper scripts that there was nothing defined at all, and at the same time to make sure that this
        // code was actually executed.
        ACCommon.initializeDefaults(ACConfig);

        // Now we process the final accessibility-checker config object that is build to make sure it is valid, also need to perform some
        // mapping for provided paremeters to actualy read by the engine.
        ACConfig = await ACCommon.processACConfig(ACConfig);

        // In the case the Karma config is set to config.LOG_DEBUG then also enable the accessibility-checker debuging
        ACConfig.DEBUG = (config.logLevel === "DEBUG");

        // Re-assigne the ACConfig to config.client.ACConfig so that it can be accessed from
        // window.__karma__.config.ACConfig, we need it to be available at this location so that, it
        // can be accessed by scripts that are in any browser.
        // Any thing that is in the config.client, is thrown into the browser.
        config.client.ACConfig = ACConfig;

        ACCommon.log.debug("END 'processKarmaConfiguration' function");
    }
};

// Export all the common functions and varialbes
module.exports = ACCommon;
