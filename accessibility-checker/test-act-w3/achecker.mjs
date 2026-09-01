export default {
    // optional - Specify the rule archive
    // Default: latest
    // Run `npx achecker archives` for a list of valid ruleArchive ids and policy ids
    ruleServer: "https://localhost:9445/rules",
    ignoreHTTPSErrors: true,
    ruleArchive: 'preview',
  
    // optional - Specify one or many policies to scan.
    // Run `npx achecker archives` for a list of valid ruleArchive ids and policy ids
    policies: ['IBM_Accessibility'],
  
    // optional - Specify one or many violation levels on which to fail the test
    failLevels: ['violation'],
  
    // optional - Specify one or many violation levels which should be reported
    // Valid values: violation, potentialviolation, recommendation, potentialrecommendation, manual
    reportLevels: [
        "violation",
        "potentialviolation",
        "recommendation",
        "potentialrecommendation",
        "manual",
        "pass"
    ],
  
    // Optional - Which type should the results be outputted to
    outputFormat: ['json'],
  
    label: [],
  
    // optional - Where the scan results should be saved.
    outputFolder: '.aat/results',
  
    // optional - Where the baseline results should be loaded from
    baselineFolder: '.aat/baselines',

    captureScreenshots: false
};
