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
 // Load all the modules that are needed
var pathLib = require('path');
var fs = require('fs');
var YAML = require('js-yaml');
var constants = require("./ACConstants");
var uuid = require('uuid');
const { resolve } = require('path');

const myrequest = (url) => {
    return fetch(url).then(resp => resp.json());
}

/**
 * This function is responsible converting policies into an Array based on string or Array.
 *
 * i.e. convert array into string version of array
 *  "CI162_5_2_DCP070116,CI162_5_2_DCP070116"
 *
 *  converts to:
 *
 *  [
 *    "CI162_5_2_DCP070116",
 *    "CI162_5_2_DCP070116"
 *  ]
 *
 * @param {Array or String} policies - Provide list of policies, single policy or comma seperated policies
 *
 * @return {Array} policies - return the policy converted into Array version
 *
 * @memberOf this
 */
function convertPolicies(policies) {
    constants.DEBUG && console.log("START 'convertPolicies' function");

    constants.DEBUG && console.log("Converting policy provided to Array: ");
    constants.DEBUG && console.log(policies);

    constants.DEBUG && console.log("END 'convertPolicies' function");

    // In the case policies is an Array return it as engine expects list
    if (policies instanceof Array) {
        return policies;
    }
    // If the policies is string, we need to convert it to an array. Which includes comma seperated string support also
    else if (typeof policies === "string") {
        return policies.split(',');
    }

    return policies;
}

/**
 * This function is responsible processing the achecker config which was initialized to make sure it contains,
 * information which matches what the engine reads.
 *
 * i.e.
 *  Need to change reportLevels and failLevels to match with level declerations in the engine.
 *      replace violation with level.violation
 *  Need to change array of policies into a string
 *      ["CI162_5_2_DCP070116","CI162_5_2_DCP070116"] to "CI162_5_2_DCP070116,CI162_5_2_DCP070116"
 *
 * @param {Object} ACConfig - Provide the config object in which needs to be processed.
 *
 * @return {Object} ACConfig - return the config object which has been made engine readable
 *
 * @memberOf this
 */
function processACConfig(ACConfig) {
    constants.DEBUG && console.log("START 'processACConfig' function");

    // Convert the reportLevels and failLevels to match with what the engine provides
    // Don't need to convert the levels from the input as we are going to compare with out the level.
    // by using contains algo, so that in the reports we can add it without level, until the engine is
    // updated to pass back with out level.
    //ACConfig.reportLevels = mapLevelsToEngineReadableLevels(ACConfig.reportLevels);
    //ACConfig.failLevels = mapLevelsToEngineReadableLevels(ACConfig.failLevels);

    // Convert the policies into a comma seperated string
    ACConfig.policies = convertPolicies(ACConfig.policies);

    if (ACConfig.customRuleServer) {
        constants.DEBUG && console.log("Specified Usage of custom Rule Server, switching to custom rule server");

        // Set the ruleArchive to empty for custom rule server
        ACConfig.ruleArchive = "";
        // Set the rulePack with what is provided in the configuration
        ACConfig.rulePack = ACConfig.rulePack;
    } else {
        // In the case that baseA11yServerURL is provided in the config use that as the base otherwise switch to the default one from the constants object
        var baseA11yServerURL = ACConfig.baseA11yServerURL ? ACConfig.baseA11yServerURL : constants.baseA11yServerURL;

        // Get and parse the rule archive.
        let ruleArchiveFile = `${baseA11yServerURL}${baseA11yServerURL.includes("jsdelivr.net")?"@next":""}/archives.json`;
        let ruleArchiveParse;

        constants.DEBUG && console.log("Fetching archive");
        return myrequest(ruleArchiveFile)
            .then((result) => {
                ruleArchiveParse = result;
                constants.DEBUG && console.log("Archive file fetched:",ruleArchiveParse);
                if (ruleArchiveParse && ruleArchiveParse.length > 0) {
                    constants.DEBUG && console.log("Found archiveFile: " + ruleArchiveFile);
                    ACConfig.ruleArchiveSet = ruleArchiveParse;
                    let ruleArchive = ACConfig.ruleArchive;
                    let ruleArchivePath = null;
                    let ruleArchiveVersion = null;
                    for (let i = 0; i < ACConfig.ruleArchiveSet.length; i++) {
                        if (ruleArchive === ACConfig.ruleArchiveSet[i].id && !ACConfig.ruleArchiveSet[i].sunset) {
                            ruleArchivePath = ACConfig.ruleArchiveSet[i].path;
                            ruleArchiveVersion = ACConfig.ruleArchiveSet[i].version;
                            ACConfig.ruleArchive = ruleArchiveParse[i].name + " (" + ruleArchiveParse[i].id + ")";
                            break;
                        }
                    }
                    if (!ruleArchivePath || ruleArchiveVersion === null) {
                        console.log("[ERROR] RuleArchiveInvalid: Make Sure correct rule archive is provided in the configuration file. More information is available in the README.md");
                        process.exit(-1);
                    }

                    // Build the new rulePack based of the baseA11yServerURL and archive info
                    if (baseA11yServerURL.includes("jsdelivr.net")) {
                        ACConfig.rulePack = `${baseA11yServerURL}@${ruleArchiveVersion}`;
                    } else {
                        ACConfig.rulePack = `${baseA11yServerURL}${ruleArchivePath}/js`;
                    }
                } else {
                    console.log("[ERROR] UnableToParseArchive: Archives are unable to be parse. Contact support team.");
                    process.exit(-1);
                }

                constants.DEBUG && console.log("Built new rulePack: " + ACConfig.rulePack);
                constants.DEBUG && console.log("END 'processACConfig' function");

                // Return the updated ACConfig object
                return ACConfig;
            })
    }
}

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
function initializeDefaults(config) {
    constants.DEBUG && console.log("START 'initializeDefaults' function");

    constants.DEBUG && console.log("Config before initialization: ");
    constants.DEBUG && console.log(config);

    // Check to make sure the rule pack server is defined, if not then set the default vaule
    config.rulePack = config.rulePack || constants.rulePack;

    // Make sure all the following options are defined, otherwise reset them to default values.
    config.policies = config.policies || constants.policies;
    config.failLevels = config.failLevels || constants.failLevels;
    config.reportLevels = config.reportLevels || constants.reportLevels;
    config.outputFolder = config.outputFolder || constants.outputFolder;
    config.baselineFolder = config.baselineFolder || constants.baselineFolder;
    config.outputFormat = config.outputFormat || constants.outputFormat;
    config.checkHiddenContent = config.checkHiddenContent || constants.checkHiddenContent;
    config.extensions = config.extensions || constants.extensions;
    config.engineFileName = config.engineFileName || constants.engineFileName;
    config.ruleArchive = config.ruleArchive || constants.ruleArchive;
    config.cacheFolder = config.cacheFolder ? resolve(config.cacheFolder) : constants.cacheFolder;
    // For capture screenshots need to check for null or undefined and then set default otherwise it will evaluate the
    // boolean which causes it to always comply with the default value and not user provided option
    if (config.captureScreenshots === null || config.captureScreenshots === undefined || typeof config.captureScreenshots === "undefined") {
        config.captureScreenshots = constants.captureScreenshots;
    }

    // Load in the package.json file so that we can extract the module name and the version to build
    // a toolID which needs to be used when results are build for the purpose of keeping track of
    // which tool is uploading the results.
    var packageObject = require('../../package.json');

    // Build the toolID based on name and version
    config.toolID = packageObject.name + "-v" + packageObject.version;

    // Using the uuid module generate a uuid number which is used to assoiciate to the scans that
    // are done for a single run of karma.
    config.scanID = uuid.v4();

    constants.DEBUG && console.log("Config after initialization: ");
    constants.DEBUG && console.log(config);

    constants.DEBUG && console.log("END 'initializeDefaults' function");
}

/**
 * This function is responsible reading in the .yaml or .yml or .json and set the config options based on this.
 *
 * @return {Object} config - return the config object that was read in, refer to function initializeDefaults
 *                           to view how the object is to be constructed.
 *
 * @memberOf this
 */
function loadConfigFromYAMLorJSONFile() {
    constants.DEBUG && console.log("START 'loadConfigFromYAMLorJSONFile' function");

    // Variable Decleration
    var config = {};

    // Get the current working directory, where we will look for the yaml, yml or json file
    var workingDir = process.cwd();

    constants.DEBUG && console.log("Working directory set to: " + workingDir);

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

        constants.DEBUG && console.log("Checking file: " + fileToCheck);

        // Get the extension of the file we are about to scan
        var fileExtension = fileToCheck.substr(fileToCheck.lastIndexOf('.') + 1);

        // If this is a yml or yaml file verify that the file exists and then load as such.
        if (fileExtension === "yml" || fileExtension === "yaml") {
            // Start checking which files exists, if it exists then load it as the config that was read in
            // We only allow specifying a file, and the order it checks is based on what is specified in the array.
            // i.e. So in the case that it finds yml, it will load and not check the rest, etc...
            if (fs.existsSync(fileToCheck)) {

                constants.DEBUG && console.log("File: " + fileToCheck + " exists loading it.");

                constants.DEBUG && console.log("Loading as YAML file.");

                // Load in as yml or yaml file and return this object
                return YAML.load(fs.readFileSync(fileToCheck), 'utf8');
            }
        } else {
            constants.DEBUG && console.log("Trying to load as json or js.");

            // Need to use try/catch mech so that in the case the require throws an exception, we can
            // catch this and discatd the error, as in the case there is no config file provided then
            // we load in default values.
            try {

                // call the resolve to check if the file exists or not, and get the actualy path if it was js or json
                var jsOrJSONFile = require.resolve(fileToCheck);

                // Only try to load the achecker js or json file if it exists.
                if (jsOrJSONFile) {

                    constants.DEBUG && console.log("Loading: " + jsOrJSONFile)

                    // Load in as json or js and return this object
                    return require(fileToCheck);
                }
            } catch (e) {
                constants.DEBUG && console.log("JSON or JS file does not exists, will load default config.")
            }
        }
    }

    constants.DEBUG && console.log("END 'loadConfigFromYAMLorJSONFile' function");

    return config;
}

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
function processConfiguration(config) {
    constants.DEBUG && console.log("START 'processConfiguration' function");

    // Variable Decleration
    var ACConfig = null;

    // Read in the .yaml (.yml) or .json file to load in the configuration
    let keys = [
        "customRuleServer", "rulePack", "ruleArchive",
        "policies",
        "failLevels",
        "reportLevels",
        "captureScreenshots",
        "outputFormat",
        "label",
        "outputFolder",
        "baselineFolder",
        "checkHiddenContent"
    ]

    let configFromFile = { }
    if (typeof Cypress !== "undefined") {
        keys.forEach((key) => {
            configFromFile[key] = Cypress.env(key);
        })
    } else {
        configFromFile = loadConfigFromYAMLorJSONFile();
    }

    constants.DEBUG && console.log("Loaded config from file: ");
    constants.DEBUG && console.log(configFromFile);

    // In the case configuration was provided in a yaml, yml or json file, then set this as the configuration
    // otherwise load them from the Karma configuration.
    if (configFromFile !== null && typeof (configFromFile) !== "undefined" && Object.keys(configFromFile).length !== 0) {
        constants.DEBUG && console.log("Using config which was loaded from config file.");

        ACConfig = configFromFile;
    } else {
        ACConfig = {};
    }

    // In the case the ACConfig object is not defined, then define it with default config options so
    // it can be set in window.__karma__.config.ACConfig, so that we know even in the testcases, other
    // wrapper scripts that there was nothing defined at all, and at the same time to make sure that this
    // code was actually executed.
    initializeDefaults(ACConfig);

    // Now we process the final accessibility-checker config object that is build to make sure it is valid, also need to perform some
    // mapping for provided paremeters to actualy read by the engine.
    return processACConfig(ACConfig)
    .then(() => {
        // In the case the Karma config is set to config.LOG_DEBUG then also enable the accessibility-checker debuging
        ACConfig.DEBUG = constants.DEBUG;

        constants.DEBUG && console.log("END 'processConfiguration' function");
        return ACConfig;
    })
}

module.exports = processConfiguration;
