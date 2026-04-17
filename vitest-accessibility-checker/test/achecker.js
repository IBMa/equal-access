module.exports = {
    ruleArchive: "latest",
    policies: ["IBM_Accessibility"],
    failLevels: ["violation"],
    reportLevels: [
        "violation",
        "potentialviolation",
        "recommendation",
        "potentialrecommendation",
        "manual"
    ],
    outputFormat: ["json"],
    outputFolder: "results",
    baselineFolder: "test/baselines"
};


