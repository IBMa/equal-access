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
 * NAME: index.js
 * DESCRIPTION: Loaded by karma to load all the items needed for karma-ibma to
 *              function.
 *              Loads: preprocessor, framework and reporter

 *******************************************************************************/

/**
 * This script contains the main loading mechanism, of the IBMa Scan engine into Karma.
 * Script syntax is based on the format that the karma plugin loader takes in.
 *
 * Karma plugin loader requires the following:
 *  '<plugin type>:<plugin caller name>: ['', <loader, scripts that export>]
 *
 *  Plugin Type: preprocessor, framework, launcher, reporter
 *  Plugin Caller Name: what ever you want to call it (IBMaScan)
 *      For the plugin type that you specify in Karma you need to use the caller name to make use of it.
 *  Type: factory, type, value
 *      Factory: produce the instance of a function which will be called without any context
 *      type: produces the instance of the provided object with the new operator
 *      value: register a final value, such as constants for example.
 *  Loader/Script --> What to load into Karma, function, value, object type.
 */
module.exports = {
    // Map the html2js preprocessor in the karma-ibma plugin, so that users do not need to install it seperatly.
    //'preprocessor:html2js': require('karma-html2js-preprocessor')['preprocessor:html2js'],

    // Add the aChecker preprocessor which will be used to load in all the baseline files for testcases so that, the testcases
    // can be verified if they passed of failed.
    'preprocessor:aChecker': ['factory', require('./lib/ACPreprocessor')],

    // Add the aChecker main engine loader as a Karma framework, which will allow to load the IBMa Scan Engine into
    // the browser that the user has choose to use.
    'framework:aChecker': ['factory', require('./lib/ACEngineLoader')],

    // Load the ACReporter script into Karma as a reporter and assign it to aChecker caller, this is used to save summary
    // and also save each individual scan result, also uses this to add in metrics.
    'reporter:aChecker': ['type', require('./lib/reporters/ACReporter')]
};
