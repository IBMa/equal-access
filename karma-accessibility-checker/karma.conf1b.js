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

'use strict';

/**
 * -------------------------------- KARMA CONFIGURATION --------------------------------
 * This function is used to configure Karma with all the information it needs to execute.
 * Refer below for more information on what it is configuring, and each aspect as links
 * on what each config is ment for and where to get additional information on it.
 *
 * Note: When there are additional plugins installed they will have there own configuration-file
 *       settings that each of the plugins need.
 *
 * Main config information: https://karma-runner.github.io/0.13/config/configuration-file.html
 *
 * @parm {config} config - The karma configuration object

 * @return N/A --> It will set all the config that are required
 *
 * @memberOf module.exports
 */
module.exports = function (config) {
    // Set all the karma configurations
    config.set({
        // List of files / patterns to load in the browser
        // Additional details at: https://karma-runner.github.io/0.13/config/files.html
        // Note: Order matters, the order they are listed here is how they are loaded.
        // If you want to use html files in js make sure to load them first.
        files: [
            // 'test/client/baseline/**/*.json',
            { pattern: '../accessibility-checker-engine/test/**/[s-zS-Z]*_ruleunit/*.html' },
            { pattern: '../accessibility-checker-engine/test/**/[s-zS-Z]*_ruleunit/*.htm' },
            // 'dependencies/tools-rules-html/v2/a11y/test/**/*.html',
            'test/client/htmlFiles/**/*.html',
            'test/client/baseline/**/*.json',
            // Use pattern to include some of the rule pack files and the rules them self into Karma web server, only set served do not include
            // the files into the browser, the karma-ibma plugin will do this action.
            // Also use pattern to include the engine-browser file, but only serve this file on the Karma web browsers, the karma-ibma plugin
            // will load in the engine and include it into the browser.
            // Need to keep include to false so that the download and update from the plugin is tested.
            // Note: The build script will be the one that places the engine-browser.js file in the location dependencies/tools-rules-html/v2/a11y/
            //       so that it can be served through the Karma server.
            // {
            //     pattern: 'dependencies/tools-rules-html/v2/a11y/*.jsonf',
            //     included: false,
            //     served: true,
            //     watched: false,
            //     nocache: false
            // },
            // {
            //     pattern: 'dependencies/tools-rules-html/v2/a11y/*.js',
            //     included: false,
            //     served: true,
            //     watched: false,
            //     nocache: false
            // },
            // 'src/**/ACHelper.js',
            // 'src/**/ACAdapter.js',
            "test/client/aChecker.Content.test.js"
        ],
        // List of files/patterns to exclude from loaded files.
        exclude: [
            "../accessibility-checker-engine/test/v2/checker/accessibility/rules/a_text_purpose_ruleunit/A-hasTextEmbedded.html",
            // 
            "test/client/**/aChecker.LocalFile.test.js",
            // host server was shutdown
            "test/client/**/aChecker.URL.test.js",

            "../accessibility-checker-engine/test/v2/checker/accessibility/rules/target_spacing_sufficient_ruleunit/element_inline2.html", 
            "../accessibility-checker-engine/test/v2/checker/accessibility/rules/target_spacing_sufficient_ruleunit/link_inline_with_block.html",  
            "../accessibility-checker-engine/test/v2/checker/accessibility/rules/target_spacing_sufficient_ruleunit/link_text.html",
            "../accessibility-checker-engine/test/v2/checker/accessibility/rules/element_scrollable_tabbable_ruleunit/*.html"
        ],
        // Frameworks to use to run the tests that we define
        // Available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        // For an additional frameworks, make sure to instll the plugins.
        // aChecker is a framework to allow for accessibility scaning
        frameworks: ['jasmine', 'aChecker'],

        // Start the browsers in this Array and run tests on them
        // Available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        // All theses browsers will be started when Karma starts, more info on url above.
        browsers: ['ChromeCustom'],
        customLaunchers: {
            ChromeCustom: {
                base: 'ChromeHeadless',
                flags: [
                    '--disable-web-security'
                ]
            }
        },

        // Preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        // Note: Preprocessors may be transforming the files and file types that are available at run time.
        // Additional details at: https://karma-runner.github.io/0.13/config/preprocessors.html
        preprocessors: {
            '../accessibility-checker-engine/test/**/*_ruleunit/*.html': ['html2js'],
            '../accessibility-checker-engine/test/**/*_ruleunit/*.htm': ['html2js'],
            'src/**/*.js': ['coverage'],
            'test/client/baseline/**/*.json': ['aChecker']
        },

        // Base path that will be used to resolve all patterns (eg. files, exclude)
        // This can be set to anything, default is ''
        basePath: '',

        /* ----------------------- End custom browser launchers ----------------------- */

        // Do not perform aChecker profiling (uploading metrics or even building them)
        ACProfile: false,

        // Build an html coverage report and put it in the coverage folder
        coverageReporter: {
            dir: 'coverage/client',
            reporters: [{
                type: 'html',
                file: 'index.html'
            },
            {
                type: 'text'
            }
            ]
        },

        // Test results reporter to use
        // possible values: 'dots', 'progress', 'kjhtml', 'spec'
        // Available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['spec', 'coverage', 'aChecker'],

        // spec reporter configuration to make it a little more readable
        // More information available at: https://www.npmjs.com/package/karma-spec-reporter
        specReporter: {
            maxLogLines: 20, // limit number of lines logged per test
            suppressErrorSummary: false, // do not print error summary
            suppressFailed: false, // do not print information about failed tests
            suppressPassed: false, // do not print information about passed tests
            suppressSkipped: false, // do not print information about skipped tests
            showSpecTiming: true // print the time elapsed for each spec
        },

        // Jasmine Diff reporter configuration to make it a little more readable
        // More information available at: https://www.npmjs.com/package/karma-jasmine-diff-reporter
        jasmineDiffReporter: {
            // Bg - background
            // Fg - foreground (text)
            color: {
                expectedBg: 'bgYellow', // default 'bgRed'
                expectedFg: 'black', // default 'white'
                actualBg: 'bgCyan', // default 'bgGreen'
                actualFg: 'red', // default 'white',
                defaultBg: 'white', // default - none
                defaultFg: 'grey' // default - none
            },

            // The matchers are used toperform pretty print, but can do a lot more.
            matchers: {
                toEqual: {
                    pretty: true // enable pretty print for toEqual
                },

                toHaveBeenCalledWith: {
                    pretty: '___' // use 3 underscores for one indent level
                }
            }
        },

        // The client configuration options that are available to be set for the karma test.
        // Additional information at: http://karma-runner.github.io/0.13/config/configuration-file.html
        client: {
            // Uses to specific if the testcases should be run in an iframe or not
            useIframe: true,

            // Used to specific if the console should be captured and piped to terminal
            captureConsole: true,

            // Used to clear the context window after tunning a test
            clearContext: true
        },

        // web server port
        port: 9876,

        // Hostname for which the karma server will start on
        hostname: "localhost",

        // Set an extreamly high number of disconnections tolerated
        browserDisconnectTolerance: 2,

        // How long does Karma wait for a browser to reconnect (in ms).
        browserDisconnectTimeout: 8000,

        // How long will Karma wait for a message from a browser before disconnecting from it (in ms).
        browserNoActivityTimeout: 400000,

        // Timeout for capturing a browser (in ms).
        captureTimeout: 100000,

        // When a browser crashes, karma will try to relaunch. This defines how many times karma should relaunch a browser before giving up.
        retryLimit: 3,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_ERROR,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
};
