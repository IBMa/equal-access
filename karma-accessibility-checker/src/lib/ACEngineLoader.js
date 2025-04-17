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
 * NAME: ACEngineLoader.js
 * DESCRIPTION: Used by karma-ibma to load the engine/config files and also
 *              parse and verify the config files/options provided by user.
 *******************************************************************************/

// Load all the modules that are needed
var pathLib = require('path');
var fs = require('fs');
const { ACConfigManager } = require('./common/config/ACConfigManager');
const ACCommon = require("./ACCommon");

/**
 * This function is responsible for downloading the accessibility-checker scan engine from a remote URL.
 * The remote URL can be overrided with ACConfig karma configuration setting rulePack, can
 * also provide the file name of the engine. Note: In some cases might want to use different
 * engine file name to be loaded from the server.
 * Default:
 *  Refer to function constants.js file.
 *
 * @param {Object} logger - logger object which is used to log debug/error/info messages
 * @param {Object} config - All the Karma configuration, we will extract what we need from this over
 *                          all object, we need the entire object so that we can reasign some config
 *                          variables to global scope so that all karma testscases/scripts can access
 *                          them.
 *
 * @return - N/A - the files object is populated with the accessibility-checker Engine
 *
 * @memberOf this
 */
async function ACEngineLoaderAndConfig(logger, config) {
    // Construct the aChecker framework logger
    ACCommon.log = logger.create('framework.aChecker');

    ACCommon.log.debug("START 'ACEngineLoaderAndConfig' function");

    // Extract information that are needed from the karma config
    var files = config.files;

    ACCommon.log.debug("Files before any changes: ");
    ACCommon.log.debug(files);

    // Process the Karma Configuration options that are needed for this module
    let ACConfig = await ACConfigManager.getConfig();
    config.client.ACConfig = ACConfig;

    // Store the aChecker scan engine under ACEngine folder
    var ACEngineRootFolder = pathLib.resolve(ACConfig.cacheFolder);
    var ACPackageRootFolder = __dirname;

    // Extract the rule server and engine file names
    var rulePackServer = ACConfig.rulePack;
    var engineFileName = "ace.js";

    ACCommon.log.debug("Using Rule Server: " + rulePackServer);
    ACCommon.log.debug("Using engine file: " + engineFileName);

    // Build the engine download URL
    var engineDownloadURL = rulePackServer + "/" + engineFileName;

    // Build the full location of the ACEngine
    var ACEngineFullpath = pathLib.join(ACEngineRootFolder, engineFileName);

    var stats = null;
    try {
        stats = fs.statSync(ACEngineFullpath);
    } catch (e) {
    }
    var engineAge = (stats && (new Date().getTime()-stats.mtime)) || 10000;
    if (engineAge > 5000) {
        ACCommon.log.debug("Starting download of: " + engineDownloadURL + " to " + ACEngineRootFolder);
        let engine = "";
        try {
            let options = undefined;
            if (new URL(engineDownloadURL).hostname === "localhost") {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                options = {
                    rejectUnauthorized: false
                }
            }
            const resp = await fetch(engineDownloadURL, options);
            engine = await resp.text();
        } catch (err) {
            ACCommon.log.error("[ERROR] Unable to load engine from "+engineDownloadURL);
            process.exit(-1);
        }

        fs.mkdirSync(ACEngineRootFolder, { recursive: true});
        fs.writeFileSync(ACEngineFullpath, engine);
    } else {
        ACCommon.log.debug("Skipping download of : " + engineDownloadURL);
    }

    // https://github.com/karma-runner/karma/issues/851 tells that there is no support in Karma for asynchronous plugin execution.
    // Though each browser has to load the engine, this seems the only straightforward way to avoid race condition of loading file vs. test execition.
    // Note: Using Promise won't make the caller nor remainder of lines in this function await for promise resolution.
//    // Use Promise to perform the download of the engine from the server.
//    new Promise(function (resolve, reject) {
//        log.debug("In download Promise.");
//
//        // Download the engine file from the rule server and store it under the scanEngine root folder
//        // Following are the steps that this object performs:
//        //  1. Get the IBM scan engine from url
//        //  2. Attach an on response
//        //      Make sure the response is 200 of the get
//        //  3. Attach an on error
//        //      Handle errors of trying to get the file
//        //  4. pipe to local file
//        //      Save the downloaded file to local lib folder for the module
//        request
//            .get(engineDownloadURL)
//            .on('response', function (response) {
//                // Only pass if response is 200 from the get request of the file, otherwise it is a fail
//                if (response.statusCode === 200) {
//                    resolve("Download successful of: " + engineDownloadURL + " to " + ACEngineFullpath);
//                } else {
//                    // Throw an exception so that Karma can exit out when unable to download the engine, if there is no engine then
//                    // all scaning will not work.
//                    reject("Unable to download aChecker engine from: " + engineDownloadURL + " because returned status code: " + response.statusCode + " with message: " + response.statusMessage);
//                }
//            })
//            .on('error', function (err) {
//                // Throw an exception so that Karma can exit out when unable to download the engine, if there is no engine then
//                // all scaning will not work.
//                reject("Unable to download aChecker engine from: " + engineDownloadURL + " because: " + err);
//            })
//            .pipe(fs.createWriteStream(ACEngineFullpath));
//    }).then(function (success) {
//        // In the case the promise was successful log this
//        log.debug(success);
//    }, function (failure) {
//        // If the promise was rejected then throw this as a failure
//        throw failure;
//    });

    ACCommon.log.debug("Adding file: " + ACEngineFullpath + " to karma files list.");

    // https://github.com/karma-runner/karma/issues/851 tells that there is no support in Karma for asynchronous plugin execution.
    // Though each browser has to load the engine, this seems the only straightforward way to avoid race condition of loading file vs. test execition.
    // Note: Using Promise won't make the caller nor remainder of lines in this function await for promise resolution.
    files.unshift(ACCommon.createKarmaFileObject(ACEngineFullpath));

    ACCommon.log.debug("Adding file: ACHelper.js to karma files list.");

    // Load in the ACWrapper into the Karma browsers, this Helper script is a script that will configure
    // the accessibility-checker Scan Engine before using/scanning any thing.
    files.unshift(ACCommon.createKarmaFileObject(pathLib.join(ACPackageRootFolder, "BaselineManager.js")));
    files.unshift(ACCommon.createKarmaFileObject(pathLib.join(ACPackageRootFolder, "ReporterManager.js")));
    files.unshift(ACCommon.createKarmaFileObject(pathLib.join(ACPackageRootFolder, "ACHelper.js")));

    // Load a deep-diff util from a node module into the browser, so we can use a well defined diff tool
    files.unshift(ACCommon.createKarmaFileObject(pathLib.join(require.resolve('deep-diff'), '..','dist', 'deep-diff.min.js')));

    ACCommon.log.debug("END 'ACEngineLoaderAndConfig' function");
}

// Inject the variables from Karma into the ACEngineLoaderAndConfig function
ACEngineLoaderAndConfig.$inject = ['logger', 'config'];

// Export this function, which will be called when Karma loads the plugin
module.exports = ACEngineLoaderAndConfig;