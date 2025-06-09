
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
        // ... normal karma configuration
        files: [
            // { pattern: 'test/v2/checker/accessibility/rules/HAAC_Video_HasNoTrack_ruleunit/Video-HasTrackAndKindWithcaption.html', watched: true },
            // { pattern: 'test/v2/checker/accessibility/rules/HAAC_Video_HasNoTrack_ruleunit/Video-HasTrackAndKindWithcaptionDynamic.html', watched: true },
            // { pattern: 'test/v2/checker/accessibility/rules/HAAC_Video_HasNoTrack_ruleunit/Video-HasTrackAndKindWithSubtitles.html', watched: true },

            // { pattern: 'test/v2/checker/accessibility/rules/WCAG20_Input_ExplicitLabel_ruleunit/ImgRoleButtonAlt.html', watched: true },

            // { pattern: 'test/v2/checker/accessibility/rules/WCAG20_Table_CapSummRedundant_ruleunit/*.html', watched: true },

            // { pattern: 'test/v2/checker/accessibility/rules/Rpt_Aria_RequiredParent_Native_Host_Sematics_ruleunit/ACT_ff89c9_pass4.html', watched: true },
            // { pattern: 'test/v2/checker/accessibility/rules/IBMA_Color_Contrast_WCAG2AA_ruleunit/Color-hidden.html', watched: true },


            { pattern: 'test/**/*_ruleunit/*.html', watched: true },
            { pattern: 'test/**/*_ruleunit/*.htm', watched: true },
            // all files ending in "_test"
            // { pattern: 'test/*_test.js', watched: true },
            { pattern: 'test/**/*_test.js', watched: true }
            // each file acts as entry point for the webpack configuration
        ],
        exclude: [
            //Disable  - due to a defect that needs to be addressed regarding visibility.
            'test/v2/checker/accessibility/rules/a_text_purpose_ruleunit/A-hasTextEmbedded.html',
            // disable because the rule is turned off
            'test/v2/checker/accessibility/rules/style_before_after_review_ruleunit/*',
            // disable because the rule is turned off
            'test/v2/checker/accessibility/rules/element_scrollable_tabbable_ruleunit/*'
        ],

        frameworks: ['jasmine'],
        browsers: ['ChromeCustom'],
        customLaunchers: {
            ChromeCustom: {
                base: 'ChromeHeadless',
                flags: ['--disable-gpu', '--disable-web-security', '--no-sandbox']
            }
        },
        preprocessors: {
            'test/**/*_ruleunit/*.html': ['html2js'],
            'test/**/*_ruleunit/*.htm': ['html2js'],
            // add webpack as preprocessor
            'test/*_test.js': ['webpack'],
            'test/**/*_test.js': ['webpack']
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
            dir: path.join(__dirname, 'coverage'),
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
        concurrency: Infinity
    });
};
