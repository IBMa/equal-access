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
 * NAME: ACPreprocessor.js
 * DESCRIPTION: Used by karma-ibma to process baselines files provided by the Users
 *              and load them into memory indexed at: window.__aChecker__

 *******************************************************************************/

// Load all the modules that are needed
var util = require('util');
var path = require('path');

// This template is used to convert json to js, so that we can add json baseline object into
// global space. first %s will be replaced with file name and 2nd will be replaced with the json
// object of the baseline. (Direct read from baseline file)
var TEMPLATE = '' +
    'window.__aChecker__ = window.__aChecker__ || {};\n' +
    'window.__aChecker__[\'%s\'] = %s';

/**
 * This function is responsible for indexing the baseline json object into global spaces for all
 * testcases to access and use. This is done by converting the file into js, and assigning that
 * content to a global window.__aChecker__[<filename>] object.
 *
 * i.e.
 *  file name: Table-layoutMultiple.json with object {"gid": "g1088", "xpath": "/html/body"}
 *
 *  will be processed as
 *
 *  window.__aChecker__ = window.__aChecker__ || {};
 *  window.__aChecker__[Table-layoutMultiple.json] = {"gid": "g1088", "xpath": "/html/body"}
 *
 *  This file will be processed and the file will be replaced with the content above, so that when
 *  this javascript is loaded into the browser it will execute this and in turn it will add that object
 *  to global space window.__aChecker__
 *
 * @param {Object} logger - logger object which is used to log debug/error/info messages
 *
 * @return {Function} - return the preprocessor function which will alter the content of the
 *                      file to allow inserting the content into global script.
 *
 * @memberOf this
 */
var indexACbaselinePreprocessor = function (logger) {
    // Construct the aChecker preprocessor logger
    var log = logger.create('preprocessor.aChecker');

    // Function which will be used to process the baseline json files and convert them into js file and
    // load them into the browser.
    return function (content, file, done) {
        log.debug("Processing: " + file.originalPath);

        log.debug("Processing file object before: ");
        log.debug(file);

        // Parse the actual content of the file into JSON
        var JSONContent = JSON.parse(content);

        // Extract the label from the baseline, this will be the index in the global hash
        var label = JSONContent.label;

        // log.debug("Extracted label: \"" + label + "\" from: " + file.path);

        // Add .js to the file extension so that it would load into the browser.
        file.path = file.path + '.js';

        log.debug("Processing file object After: ");
        log.debug(file);

        // Perform the content replace to convert the json file into a js format with the json
        // object as a value to the global baseline hash.
        done(util.format(TEMPLATE, label, content));
    };
};

// Inject the variables from Karma into the indexACbaselinePreprocessor function
indexACbaselinePreprocessor.$inject = ['logger'];

// Export this function, which will be called when Karma loads the plugin
module.exports = indexACbaselinePreprocessor;
