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

const path = require("path");
let webpackConfig = require("./webpack-debug.config");
delete webpackConfig.output;
webpackConfig.module.rules[0].options = {
    configFile: "tsconfig-nodeclare.json"
}
webpackConfig.module.rules.push({
    test: /\.ts$/,
    exclude: [path.resolve(__dirname, "test")],
    enforce: 'post',
    use: {
        loader: 'coverage-istanbul-loader',
        options: { esModules: true }
    }
})

module.exports = (config) => {
    config.set({
        // Configuration for SR (Screen Reader) simulator tests
        files: [
            // Only include SR simulator tests
            { pattern: 'test/v4/simulator/*_test.js', watched: true }
            // { pattern: 'test/v4/simulator/Button_test.js', watched: true },
            // { pattern: 'test/v4/simulator/Checkbox_test.js', watched: true }, // Issues: description, checkbox in label
            // { pattern: 'test/v4/simulator/Form_test.js', watched: true },
            // { pattern: 'test/v4/simulator/Heading_test.js', watched: true }, // Issues: empty heading, double accessible name
            // { pattern: 'test/v4/simulator/Link_test.js', watched: true }, // Issues: empty href, block in link
            // { pattern: 'test/v4/simulator/List_test.js', watched: true },
            // { pattern: 'test/v4/simulator/Navigation_test.js', watched: true },
            // { pattern: 'test/v4/simulator/Radio_test.js', watched: true }, // Issues: description, radio in label
            // { pattern: 'test/v4/simulator/Region_test.js', watched: true },
            // { pattern: 'test/v4/simulator/Table_test.js', watched: true },
            // { pattern: 'test/v4/simulator/Textbox_test.js', watched: true }, // Issues: contenteditable (#2533)
            // { pattern: 'test/v4/simulator/Tree_test.js', watched: true }
        ],
        exclude: [],

        frameworks: ['jasmine'],
        browsers: ['ChromeCustom'],
        customLaunchers: {
            ChromeCustom: {
                base: 'ChromeHeadless',
                flags: ['--disable-web-security', '--no-sandbox']
            }
        },
        preprocessors: {
            // add webpack as preprocessor
            'test/v4/simulator/*_test.js': ['webpack']
        },
        reporters: ["spec", "coverage-istanbul"],
        specReporter: {
            maxLogLines: 5,             // limit number of lines logged per test
            suppressErrorSummary: false, // do not print error summary
            suppressFailed: false,      // do not print information about failed tests
            suppressPassed: true,      // do not print information about passed tests
            suppressSkipped: true,      // do not print information about skipped tests
            showSpecTiming: true,      // print the time elapsed for each spec
            failFast: false              // test would finish with error when a first fail occurs.
        },

        webpack: webpackConfig,

        webpackMiddleware: {
            // webpack-dev-middleware configuration
            // i. e.
            stats: 'errors-only'
        },

        coverageIstanbulReporter: {
            reports: ['html', 'text-summary'],
            dir: path.join(__dirname, 'coverage-sr'),
            fixWebpackSourcePaths: true,
            'report-config': {
                html: { outdir: 'html' }
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
        browserDisconnectTimeout: 2000,

        // How long will Karma wait for a message from a browser before disconnecting from it (in ms).
        browserNoActivityTimeout: 100000,

        // Timeout for capturing a browser (in ms).
        captureTimeout: 60000,

        // When a browser crashes, karma will try to relaunch. This defines how many times karma should relaunch a browser before giving up.
        retryLimit: 3,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,
        singleRun: true
    });
};



