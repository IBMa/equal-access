'use strict';

const path = require("path");
const Browser = require('zombie');
const aChecker = require("accessibility-checker");
const expect = require("chai").expect;
const browser = new Browser();

/** Temporary solution for output until reporting is completed */
aChecker.stringifyConsole = function(data) {
    var s = "\n";
    data.reports && data.reports.forEach(function(report) {
        report.issues.forEach(function(issue) {
            s += issue.level + 
                "\n\t" + issue.messageCode +
                "\n\t" + issue.xpath +
                "\n\t" + issue.snippet +
                "\n";
        });
    });
    return s;
}
// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("Hello World Basics", function () {
    it("HomePage", async function () {
        this.timeout(0);
        var sample = path.join(__dirname, "..", "sample", "Hello.html");
        await browser.visit("file://"+sample);
        // Perform the accessibility scan using the IBMaScan Wrapper
        const { report } = await aChecker.getCompliance(browser.document, "HOME");
        expect(aChecker.assertCompliance(report)).to.equal(0, aChecker.stringifyConsole(report));
    });

    it("Hompage, Show Card", async function () {
        await browser.clickLink("#clickMe");
        // Perform the accessibility scan using the IBMaScan Wrapper
        const { report } = await aChecker.getCompliance(browser.document, "HOME_CARD");
        expect(aChecker.assertCompliance(report)).to.equal(0, aChecker.stringifyConsole(report));
    });
});
