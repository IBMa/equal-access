var reporter = require('cucumber-html-reporter');

var options = {
    name: "AAT Demo",
    theme: 'bootstrap',
    jsonFile: 'results/cucumber_report.json',
    output: 'results/cucumber_report.html',
    reportSuiteAsScenarios: true,
    launchReport: true,
    metadata: {
        "Test Environment": "Local",
        "Browser": "Chrome",
        "Platform": "MacOS",
    }
};

reporter.generate(options);