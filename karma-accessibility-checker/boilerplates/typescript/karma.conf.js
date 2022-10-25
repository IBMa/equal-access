module.exports = function(config) {
    config.set({

        frameworks: ["mocha", "karma-typescript", "aChecker"],

        files: [
            'test/baselines/**/*.json',
            'src/**/*.html',
            { pattern: "node_modules/expect.js/index.js" },
            { pattern: "test/**/*.ts" }
        ],

        preprocessors: {
            "test/*.ts": ["karma-typescript"],
            "src/**/*.html": ['html2js'],
            "test/baselines/**/*.json": ["aChecker"]
        },

        reporters: ["dots", "karma-typescript", "aChecker"],

        browsers: ["ChromeHeadless"],

        singleRun: true
    });
};
