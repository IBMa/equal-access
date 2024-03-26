const { readFileSync } = require("fs");
const ace = require("../../../dist/ace-node");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var expect = require("chai").expect;

describe("Help Files", () => {
    const checker = new ace.Checker();
    it("can run on an XML file", async () => {
        const dom = new JSDOM(
            readFileSync("./faq.dita"),
            {
                contentType: "application/xhtml+xml"
            }
        );
        let report = await checker.check(dom.window.document, null);
        expect(report.results.length).to.be.greaterThan(0);
        expect(report.numExecuted).to.equal(report.results.length);
    });
});
