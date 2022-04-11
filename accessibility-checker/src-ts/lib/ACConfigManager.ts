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
import * as pathLib from "path";
import * as fs from "fs";
import * as YAML from "js-yaml";
import { ACConstants } from "./ACConstants";
import * as uuid from "uuid";
import * as request from "request";
import { IConfig, IConfigUnsupported } from "./api/IChecker";

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
function convertPolicies(policies: string | string[]) : string[] {
    ACConstants.DEBUG && console.log("START 'convertPolicies' function");

    ACConstants.DEBUG && console.log("Converting policy provided to Array: ");
    ACConstants.DEBUG && console.log(policies);

    ACConstants.DEBUG && console.log("END 'convertPolicies' function");

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
async function processACConfig(ACConfig) {
    ACConstants.DEBUG && console.log("START 'processACConfig' function");

    // Convert the reportLevels and failLevels to match with what the engine provides
    // Don't need to convert the levels from the input as we are going to compare with out the level.
    // by using contains algo, so that in the reports we can add it without level, until the engine is
    // updated to pass back with out level.
    //ACConfig.reportLevels = mapLevelsToEngineReadableLevels(ACConfig.reportLevels);
    //ACConfig.failLevels = mapLevelsToEngineReadableLevels(ACConfig.failLevels);

    // Convert the policies into a comma seperated string
    ACConfig.policies = convertPolicies(ACConfig.policies);

    // In the case that baseA11yServerURL is provided in the config use that as the base otherwise switch to the default one from the ACConstants object
    let ruleServer = ACConfig.ruleServer ? ACConfig.ruleServer : ACConstants.ruleServer;

    // Get and parse the rule archive.
    let ruleArchiveFile = `${ruleServer}${ruleServer.includes("jsdelivr.net")?"@next":""}/archives.json`;
    let ruleArchiveParse;
    try {
        if (ACConfig.ignoreHTTPSErrors) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED="0"
        }
        ruleArchiveParse = await new Promise((resolve, reject) => {
            request.get(ruleArchiveFile, function (error, response, body) {
                if (error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(body));
                }
            });
        });
    } catch (err) {
        console.log(err);
        throw new Error(err);
    }
    let ruleArchivePath = null;
    let ruleArchiveVersion = null;
    if (ruleArchiveParse && ruleArchiveParse.length > 0) {
        ACConstants.DEBUG && console.log("Found archiveFile: " + ruleArchiveFile);
        ACConfig.ruleArchiveSet = ruleArchiveParse;
        let ruleArchive = ACConfig.ruleArchive;
        ACConfig.ruleArchiveLabel = ACConfig.ruleArchive;
        for (let i = 0; i < ACConfig.ruleArchiveSet.length; i++) {
            if (ruleArchive == ACConfig.ruleArchiveSet[i].id && !ACConfig.ruleArchiveSet[i].sunset) {
                ruleArchivePath = ACConfig.ruleArchiveSet[i].path;
                ruleArchiveVersion = ACConfig.ruleArchiveSet[i].version;
                ACConfig.ruleArchiveLabel = ruleArchiveParse[i].name + " (" + ruleArchiveParse[i].id + ")";
                break;
            }
        }
        if (!ruleArchivePath || ruleArchiveVersion === null) {
            const errStr = "[ERROR] RuleArchiveInvalid: Make Sure correct rule archive is provided in the configuration file. More information is available in the README.md";
            console.error(errStr);
            throw new Error(errStr);
        }
        //}
    } else {
        const errStr = "[ERROR] UnableToParseArchive: Archives are unable to be parse. Contact support team.";
        console.error(errStr);
        throw new Error(errStr);
    }

    // Build the new rulePack based of the baseA11yServerURL
    if (ruleServer.includes("jsdelivr.net")) {
        ACConfig.rulePack = `${ruleServer}@${ruleArchiveVersion}`;
    } else {
        ACConfig.rulePack = `${ruleServer}${ruleArchivePath}/js`;
    }
    ACConfig.ruleServer = ruleServer;

    ACConstants.DEBUG && console.log("Built new rulePack: " + ACConfig.rulePack);

    ACConstants.DEBUG && console.log("END 'processACConfig' function");

    // Return the updated ACConfig object
    return ACConfig;
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
function initializeDefaults(config: IConfigUnsupported) {
    ACConstants.DEBUG && console.log("START 'initializeDefaults' function");

    ACConstants.DEBUG && console.log("Config before initialization: ");
    ACConstants.DEBUG && console.log(config);
    // Make sure all the following options are defined, otherwise reset them to default values.
    config.ruleArchiveLabel = config.ruleArchiveLabel || ACConstants.ruleArchiveLabel || config.ruleArchive;
    // For capture screenshots need to check for null or undefined and then set default otherwise it will evaluate the
    // boolean which causes it to always comply with the default value and not user provided option
    if (config.captureScreenshots === null || config.captureScreenshots === undefined || typeof config.captureScreenshots === "undefined") {
        config.captureScreenshots = ACConstants.captureScreenshots;
    }

    // Load in the package.json file so that we can extract the module name and the version to build
    // a toolID which needs to be used when results are build for the purpose of keeping track of
    // which tool is uploading the results.
    let packageObject = require('../package.json');

    // Build the toolID based on name and version
    config.toolID = packageObject.name + "-v" + packageObject.version;

    // Using the uuid module generate a uuid number which is used to assoiciate to the scans that
    // are done for a single run of karma.
    config.scanID = uuid.v4();

    for (const key in ACConstants) {
        config[key] = config[key] || ACConstants[key];
    }

    ACConstants.DEBUG && console.log("Config after initialization: ");
    ACConstants.DEBUG && console.log(config);

    ACConstants.DEBUG && console.log("END 'initializeDefaults' function");
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
    ACConstants.DEBUG && console.log("START 'loadConfigFromYAMLorJSONFile' function");

    // Variable Decleration
    let config = {};

    // Get the current working directory, where we will look for the yaml, yml or json file
    let workingDir = process.cwd();

    ACConstants.DEBUG && console.log("Working directory set to: " + workingDir);

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
    // Refer to ACConstants.js for more details
    let configFiles = ACConstants.configFiles;

    // Loop over all the possible location where the config file can reside, if one is found load it and break out.
    for (let i = 0; i < configFiles.length; i++) {

        // Get the full path to the config file we are going to check
        let fileToCheck = pathLib.join(workingDir, configFiles[i]);

        ACConstants.DEBUG && console.log("Checking file: " + fileToCheck);

        // Get the extension of the file we are about to scan
        let fileExtension = fileToCheck.substr(fileToCheck.lastIndexOf('.') + 1);

        // If this is a yml or yaml file verify that the file exists and then load as such.
        if (fileExtension === "yml" || fileExtension === "yaml") {
            // Start checking which files exists, if it exists then load it as the config that was read in
            // We only allow specifying a file, and the order it checks is based on what is specified in the array.
            // i.e. So in the case that it finds yml, it will load and not check the rest, etc...
            if (fs.existsSync(fileToCheck)) {

                ACConstants.DEBUG && console.log("File: " + fileToCheck + " exists loading it.");

                ACConstants.DEBUG && console.log("Loading as YAML file.");

                // Load in as yml or yaml file and return this object
                return YAML.load(fs.readFileSync(fileToCheck), 'utf8');
            }
        } else {
            ACConstants.DEBUG && console.log("Trying to load as json or js.");

            // Need to use try/catch mech so that in the case the require throws an exception, we can
            // catch this and discatd the error, as in the case there is no config file provided then
            // we load in default values.
            try {

                // call the resolve to check if the file exists or not, and get the actualy path if it was js or json
                let jsOrJSONFile = require.resolve(fileToCheck);

                // Only try to load the achecker js or json file if it exists.
                if (jsOrJSONFile) {

                    ACConstants.DEBUG && console.log("Loading: " + jsOrJSONFile)

                    // Load in as json or js and return this object
                    return require(fileToCheck);
                }
            } catch (e) {
                ACConstants.DEBUG && console.log("JSON or JS file does not exists, will load default config.")
            }
        }
    }

    ACConstants.DEBUG && console.log("END 'loadConfigFromYAMLorJSONFile' function");

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
async function processConfiguration(config?) : Promise<IConfigUnsupported> {
    ACConstants.DEBUG && console.log("START 'processConfiguration' function");

    // Variable Decleration
    let ACConfig : IConfigUnsupported | null = null;
    let configFromFile = null;

    // Read in the .yaml (.yml) or .json file to load in the configuration
    configFromFile = loadConfigFromYAMLorJSONFile();

    ACConstants.DEBUG && console.log("Loaded config from file: ");
    ACConstants.DEBUG && console.log(configFromFile);

    // In the case configuration was provided in a yaml, yml or json file, then set this as the configuration
    // otherwise load them from the Karma configuration.
    if (configFromFile !== null && typeof (configFromFile) !== "undefined" && Object.keys(configFromFile).length !== 0) {
        ACConstants.DEBUG && console.log("Using config which was loaded from config file.");

        ACConfig = configFromFile;
    } else if (config !== null && typeof (config) !== "undefined" && Object.keys(config).length !== 0) {
        // Extract the ACConfig from the overall karma configuration, in the case config file
        // was not provided.
        ACConfig = config;
    } else {
        ACConfig = JSON.parse(JSON.stringify(ACConstants));
    }

    // In the case the ACConfig object is not defined, then define it with default config options so
    // it can be set in window.__karma__.config.ACConfig, so that we know even in the testcases, other
    // wrapper scripts that there was nothing defined at all, and at the same time to make sure that this
    // code was actually executed.
    initializeDefaults(ACConfig);

    // Now we process the final accessibility-checker config object that is build to make sure it is valid, also need to perform some
    // mapping for provided paremeters to actualy read by the engine.
    await processACConfig(ACConfig);

    // In the case the Karma config is set to config.LOG_DEBUG then also enable the accessibility-checker debuging
    ACConfig.DEBUG = ACConstants.DEBUG;

    ACConstants.DEBUG && console.log("END 'processConfiguration' function");
    return ACConfig;
}

let config : IConfigUnsupported = null;
export class ACConfigManager {
    static async setConfig(inConfig?: IConfig | IConfigUnsupported) : Promise<void> {
        config = await processConfiguration(inConfig);
    }

    static async getConfig() : Promise<IConfig> {
        return this.getConfigUnsupported();
    }

    static async getConfigUnsupported() : Promise<IConfigUnsupported> {
        if (!config) {
            await ACConfigManager.setConfig();
        }
        return config;
    }

    static getConfigNow() : IConfigUnsupported {
        return config;
    }
}
