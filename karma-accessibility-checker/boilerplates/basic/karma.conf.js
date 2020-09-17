module.exports = function (config) {
    // Set all the karma configurations
    config.set({
        // Base path that will be used to resolve all patterns (eg. files, exclude)
        // This can be set to anything, default is ''
        basePath: '',

        // Start the browsers in this Array and run tests on them
        // Available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        // All theses browsers will be started when Karma starts, more info on url above.
        browsers: ['ChromeCustom'],
        customLaunchers: {
            ChromeCustom: {
                base: 'ChromeHeadless',
                flags: ['--disable-web-security']
            }
        },

        /* ----------------------- End custom browser launchers ----------------------- */

        // Frameworks to use to run the tests that we define
        // Available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        // For an additional frameworks, make sure to instll the plugins.
        frameworks: ['jasmine', 'aChecker'],

        // List of files / patterns to load in the browser
        // Additional details at: https://karma-runner.github.io/0.13/config/files.html
        // Note: Order matters, the order they are listed here is how they are loaded.
        // If you want to use html files in js make sure to load them first.
        files: [
            'test/baselines/**/*.json',
            'src/**/*.html',
            "test/**/*.js"
        ],

        // List of files/patterns to exclude from loaded files.
        exclude: [
        ],

        // Preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        // Note: Preprocessors may be transforming the files and file types that are available at run time.
        // Additional details at: https://karma-runner.github.io/0.13/config/preprocessors.html
        preprocessors: {
            'src/**/*.html': ['html2js'],
            'test/baselines/**/*.json': ['aChecker']
        },

        // Test results reporter to use
        // possible values: 'dots', 'progress'
        // Available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'aChecker'],

        // web server port
        port: 9876,

        // Hostname for which the karma server will start on
        hostname: "localhost",

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
}
