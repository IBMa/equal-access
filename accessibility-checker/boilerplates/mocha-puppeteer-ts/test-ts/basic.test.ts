'use strict';
import * as Puppeteer from "puppeteer";
// import { Browser, Page, launch } from "puppeteer";
import { assertCompliance, getCompliance, stringifyResults, close } from "accessibility-checker";
import * as path from "path";
import { expect } from "chai";
import { before, after, describe, it } from "mocha";
import { ICheckerReport } from "accessibility-checker/lib/api/IChecker";

let browser: Puppeteer.Browser;
let page: Puppeteer.Page;

before(async () => {
    try {
        browser = await Puppeteer.launch();
        page = await browser.newPage();
    } catch (e) {
        console.log(e);
    }
    return Promise.resolve();
});

after(async() => {
    await browser.close();
    return Promise.resolve();
});

// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("Hello World Basics", function () {
    try {
        it("HomePage", async () => {
            const sample = path.join(__dirname, "..", "sample", "Hello.html");
            await page.goto(`file://${sample}`);

            const result = await getCompliance(page, "HOME");
            const report : ICheckerReport = result!.report as ICheckerReport;
            expect(assertCompliance(report)).to.equal(0, stringifyResults(report));
        }).timeout(10000);

        it("Homepage, Show Card", async() => {
            await page.click("#clickMe");
            const result = await getCompliance(page, "HOME_CARD");
            const report : ICheckerReport = result!.report as ICheckerReport;
            expect(assertCompliance(report)).to.equal(0, stringifyResults(report));
        }).timeout(10000);
    } catch (e) {
        console.error(e);
    } finally {
        close();
    }
});
//# sourceMappingURL=basic.test.js.map
